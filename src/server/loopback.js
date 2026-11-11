/**
 * loopback.js - 独立多协议本地兼容网关 (OpenAI Chat / Responses / Anthropic / Video / Web Console)
 */

import http from 'node:http';
import {
  DEFAULT_GATEWAY_PORT,
  STATIC_MODELS,
  DEFAULT_MODEL_ALIASES,
  VIDEO_GENERATIONS_PATH
} from '../constants.js';
import { writeSSEHeaders, createSSELinePump, formatOpenAIChunk } from './sse.js';
import {
  anthropicToOpenAI,
  openAIToAnthropicResponse,
  createAnthropicStreamEmitter
} from './messages.js';
import {
  responsesToChatPayload,
  chatCompletionToResponseObject,
  createResponsesStreamEmitter
} from './responses.js';

function readJsonBody(req, res, maxBytes = 25 * 1024 * 1024) {
  return new Promise((resolve) => {
    const chunks = [];
    let total = 0;
    let aborted = false;

    req.on('data', (chunk) => {
      if (aborted) return;
      total += chunk.length;
      if (total > maxBytes) {
        aborted = true;
        if (!res.headersSent) {
          res.writeHead(413, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: { message: 'Request entity too large', type: 'invalid_request_error' } }));
        }
        resolve(null);
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      if (aborted) return;
      const raw = Buffer.concat(chunks).toString('utf8').trim();
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (_) {
        if (!res.headersSent) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: { message: 'Invalid JSON request body', type: 'invalid_request_error' } }));
        }
        resolve(null);
      }
    });

    req.on('error', () => {
      if (!aborted) {
        aborted = true;
        resolve(null);
      }
    });
  });
}

function sendJson(res, status, payload) {
  if (res.writableEnded) return;
  if (!res.headersSent) {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  }
  res.end(JSON.stringify(payload));
}

export class LoopbackGateway {
  constructor(scheduler, client, ledger, options = {}) {
    this.scheduler = scheduler;
    this.client = client;
    this.ledger = ledger;
    this.configStore = options.configStore || null;
    this.preferredPort = options.port ?? this.configStore?.get('gatewayPort') ?? DEFAULT_GATEWAY_PORT;
    this.apiKey = options.apiKey || '';
    this.modelAliases = { ...DEFAULT_MODEL_ALIASES, ...(options.aliases || {}) };
    this.enabledModels = new Set(options.enabledModels || []);

    this.dashboardHandler = options.dashboardHandler || null;
    this.pluginRouterHandler = options.pluginRouterHandler || null;

    this.discoveredModels = [];
    this.lastModelFetchAt = 0;
    this.videoTaskAccountMap = new Map(); // taskId -> { uid, model, createdAt, status }

    this.server = null;
    this.actualPort = null;
    this.startedAt = Date.now();
  }

  setDashboardHandler(fn) {
    this.dashboardHandler = fn;
  }

  setPluginRouterHandler(fn) {
    this.pluginRouterHandler = fn;
  }

  _getRuntimeConfig() {
    const cfg = this.configStore ? this.configStore.getAll() : {};
    return {
      apiKey: cfg.apiKey ?? this.apiKey ?? '',
      aliases: { ...DEFAULT_MODEL_ALIASES, ...(this.modelAliases || {}), ...(cfg.aliases || {}) },
      enabledModels: Array.isArray(cfg.enabledModels) ? cfg.enabledModels : [...this.enabledModels],
      freeModels: Array.isArray(cfg.freeModels) && cfg.freeModels.length > 0
        ? cfg.freeModels
        : ['global:deepseek-v4.1-flash', 'cn:hy4free'],
      promptMode: cfg.promptMode || 'none',
      promptText: cfg.promptText || ''
    };
  }

  checkAuth(req, url) {
    const { apiKey } = this._getRuntimeConfig();
    if (!apiKey) return true;

    const authHeader = String(req.headers['authorization'] || '');
    const bearer = authHeader.toLowerCase().startsWith('bearer ') ? authHeader.slice(7).trim() : '';
    const xKey = String(req.headers['x-api-key'] || '').trim();
    const queryKey = url.searchParams.get('key') || '';

    return bearer === apiKey || xKey === apiKey || queryKey === apiKey;
  }

  resolveModel(requestedModel) {
    const { aliases, freeModels } = this._getRuntimeConfig();
    let target = String(requestedModel || 'auto-free').trim() || 'auto-free';
    const seen = new Set();

    while (aliases[target] && !seen.has(target)) {
      seen.add(target);
      target = aliases[target];
    }

    if (target === 'auto-free') {
      target = freeModels[0] || 'global:deepseek-v4.1-flash';
    }
    return target;
  }

  applyPromptMode(payload) {
    const { promptMode, promptText } = this._getRuntimeConfig();
    if (!promptMode || promptMode === 'none' || promptMode === 'passthrough' || !promptText || !Array.isArray(payload.messages)) {
      return;
    }

    if (promptMode === 'replace' || promptMode === 'custom') {
      const rest = payload.messages.filter((m) => m?.role !== 'system' && m?.role !== 'developer');
      payload.messages = [{ role: 'system', content: promptText }, ...rest];
      return;
    }

    if (promptMode === 'append') {
      const sysIdx = payload.messages.findIndex((m) => m?.role === 'system' || m?.role === 'developer');
      if (sysIdx !== -1 && typeof payload.messages[sysIdx].content === 'string') {
        payload.messages[sysIdx] = {
          ...payload.messages[sysIdx],
          content: `${payload.messages[sysIdx].content}\n\n${promptText}`
        };
      } else {
        payload.messages = [{ role: 'system', content: promptText }, ...payload.messages];
      }
    }
  }

  /**
   * 主动拉取并合并上游最新 CN + Global 动态模型列表
   */
  async refreshDiscoveredModels() {
    const accounts = this.scheduler.store.getAll().filter((a) => !a.disabled);
    const cnAcc = accounts.find((a) => a.auth?.realm !== 'global');
    const globalAcc = accounts.find((a) => a.auth?.realm === 'global');

    const picked = [cnAcc, globalAcc].filter(Boolean);
    if (picked.length === 0) return this.getMergedModels(true);

    const discoveredMap = new Map();
    for (const acc of picked) {
      try {
        const items = await this.client.fetchModels(acc);
        for (const item of items) {
          if (item?.id && !discoveredMap.has(item.id)) {
            discoveredMap.set(item.id, item);
          }
        }
      } catch (e) {
        console.warn(`[loopback] 动态拉取 ${acc.auth?.realm} 模型目录失败:`, e.message);
      }
    }

    if (discoveredMap.size > 0) {
      this.discoveredModels = [...discoveredMap.values()];
      this.lastModelFetchAt = Date.now();
    }
    return this.getMergedModels(true);
  }

  /**
   * 合并内置模型与上游动态发现模型
   */
  getMergedModels(includeDisabled = false) {
    const { enabledModels } = this._getRuntimeConfig();
    const enabledSet = enabledModels.length > 0 ? new Set(enabledModels) : null;
    const merged = new Map();

    for (const m of STATIC_MODELS) {
      merged.set(m.id, { ...m, source: 'static' });
    }
    for (const dm of this.discoveredModels) {
      const existing = merged.get(dm.id);
      if (existing) {
        merged.set(dm.id, {
          ...existing,
          supportedEfforts: dm.supportedEfforts || existing.supportedEfforts,
          contextWindow: dm.contextWindow || existing.contextWindow,
          maxTokens: dm.maxTokens || existing.maxTokens,
          supportsImages: dm.supportsImages ?? existing.supportsImages
        });
      } else {
        merged.set(dm.id, {
          id: dm.id,
          name: dm.name || dm.id,
          realm: dm.realm || 'cn',
          contextWindow: dm.contextWindow || 128000,
          maxTokens: dm.maxTokens || 32000,
          supportsImages: !!dm.supportsImages,
          supportedEfforts: dm.supportedEfforts || [],
          rate: dm.rate || '动态',
          badge: '新发现',
          source: 'discovered'
        });
      }
    }

    let list = [...merged.values()];
    if (!includeDisabled && enabledSet) {
      list = list.filter((m) => enabledSet.has(m.id));
    }
    return list;
  }

  getModelsList(includeDisabled = false) {
    const { aliases } = this._getRuntimeConfig();
    const list = this.getMergedModels(includeDisabled).map((m) => ({
      id: m.id,
      object: 'model',
      created: 1726000000,
      owned_by: m.source === 'discovered' ? 'workbuddy-upstream' : 'workbuddy2api',
      permission: [],
      root: m.id,
      parent: null,
      realm: m.realm,
      context_length: m.contextWindow,
      max_tokens: m.maxTokens,
      multimodal: m.supportsImages,
      supported_efforts: m.supportedEfforts || [],
      billing_rate: m.rate,
      badge: m.badge || null,
      source: m.source
    }));

    for (const [alias, target] of Object.entries(aliases)) {
      if (!list.some((m) => m.id === alias)) {
        list.push({
          id: alias,
          object: 'model',
          created: 1726000000,
          owned_by: 'workbuddy2api-alias',
          permission: [],
          root: target,
          parent: target
        });
      }
    }

    return list;
  }

  async start() {
    this.server = http.createServer(async (req, res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', '*');
      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }

      const url = new URL(req.url, `http://${req.headers.host || '127.0.0.1'}`);
      const pathname = url.pathname;

      try {
        // 1. Web Console 控制台入口 (/ /console /dashboard)
        if (
          req.method === 'GET' &&
          (pathname === '/' || pathname === '/console' || pathname === '/dashboard') &&
          typeof this.dashboardHandler === 'function' &&
          url.searchParams.get('format') !== 'json'
        ) {
          const handled = await this.dashboardHandler(req, res, pathname, url);
          if (handled) return;
        }

        // 2. 转发内置管理控制台 API (/plugins/dsh-workbuddy2api/*)
        if (
          pathname.startsWith('/plugins/dsh-workbuddy2api/') &&
          typeof this.pluginRouterHandler === 'function'
        ) {
          const handled = await this.pluginRouterHandler(req, res, pathname, url);
          if (handled) return;
        }

        // 3. 健康检查端点 (/health /healthz /status /)
        if (
          req.method === 'GET' &&
          (pathname === '/health' || pathname === '/healthz' || pathname === '/status' || pathname === '/')
        ) {
          const allAcc = this.scheduler.store.getAll();
          sendJson(res, 200, {
            status: 'ok',
            service: 'dsh-workbuddy2api',
            version: '1.1.0',
            port: this.actualPort || this.preferredPort,
            accounts: allAcc.length,
            enabledAccounts: allAcc.filter((a) => !a.disabled).length,
            active: this.scheduler.store.activeUid,
            discoveredModels: this.discoveredModels.length,
            uptimeSec: Math.floor((Date.now() - this.startedAt) / 1000)
          });
          return;
        }

        // 4. 以下 /v1/* /v2/* 等对外网关端点受 API Key 鉴权保护
        if (!this.checkAuth(req, url)) {
          sendJson(res, 401, {
            error: { message: 'Invalid or missing gateway API key', type: 'authentication_error' }
          });
          return;
        }

        // 5. 用量统计接口
        if (req.method === 'GET' && pathname === '/v1/stats') {
          const allAcc = this.scheduler.store.getAll();
          sendJson(res, 200, {
            ok: true,
            ...this.ledger.getStats(),
            discoveredModels: this.discoveredModels.length,
            pool: {
              total: allAcc.length,
              enabled: allAcc.filter((a) => !a.disabled).length
            }
          });
          return;
        }

        if (req.method === 'POST' && pathname === '/v1/stats/reset') {
          this.ledger.reset();
          sendJson(res, 200, { ok: true, message: '用量账本已清空' });
          return;
        }

        // 6. 模型列表接口 /v1/models
        if (req.method === 'GET' && (pathname === '/v1/models' || pathname === '/models')) {
          const includeAll = url.searchParams.get('all') === '1';
          sendJson(res, 200, {
            object: 'list',
            data: this.getModelsList(includeAll)
          });
          return;
        }

        // 7. OpenAI Chat Completions (/v1/chat/completions)
        if (req.method === 'POST' && (pathname === '/v1/chat/completions' || pathname === '/chat/completions')) {
          const body = await readJsonBody(req, res);
          if (!body) return;
          await this.executeChatPipeline(req, res, body, 'chat', body.model);
          return;
        }

        // 8. Anthropic Messages API (/v1/messages)
        if (req.method === 'POST' && (pathname === '/v1/messages' || pathname === '/messages')) {
          const body = await readJsonBody(req, res);
          if (!body) return;
          const openaiPayload = anthropicToOpenAI(body);
          await this.executeChatPipeline(req, res, openaiPayload, 'anthropic', body.model);
          return;
        }

        // 9. OpenAI Responses API (/v1/responses)
        if (req.method === 'POST' && (pathname === '/v1/responses' || pathname === '/responses')) {
          const body = await readJsonBody(req, res);
          if (!body) return;
          const openaiPayload = responsesToChatPayload(body);
          await this.executeChatPipeline(req, res, openaiPayload, 'responses', body.model);
          return;
        }

        // 10. 标准视频生成与任务查询接口 (/v1/videos/* & /v2/videos/*)
        if (
          req.method === 'POST' &&
          (pathname === '/v1/videos/generations' || pathname === '/v2/videos/generations')
        ) {
          await this.handleVideoCreate(req, res);
          return;
        }

        if (
          req.method === 'GET' &&
          (pathname === '/v1/videos/tasks' || pathname === '/v2/videos/tasks')
        ) {
          sendJson(res, 200, {
            object: 'list',
            data: [...this.videoTaskAccountMap.entries()].map(([id, info]) => ({ id, ...info }))
          });
          return;
        }

        const videoMatch = pathname.match(/^\/v[12]\/videos\/(?:tasks|generations)\/([^/]+)$/);
        if (req.method === 'GET' && videoMatch) {
          await this.handleVideoQuery(res, decodeURIComponent(videoMatch[1]));
          return;
        }

        sendJson(res, 404, { error: { message: 'Not Found', type: 'invalid_request_error' } });
      } catch (err) {
        if (!res.headersSent) {
          sendJson(res, 500, { error: { message: err.message, type: 'api_error' } });
        }
      }
    });

    return new Promise((resolve) => {
      let retried = false;

      this.server.once('listening', () => {
        this.actualPort = this.server.address().port;
        console.log(`[loopback] 🚀 多协议兼容网关与控制台已就绪: http://127.0.0.1:${this.actualPort}/`);
        resolve(this.actualPort);
      });

      this.server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          if (!retried && this.preferredPort !== 0) {
            retried = true;
            setTimeout(() => {
              this.server?.listen(this.preferredPort, '0.0.0.0');
            }, 200);
            return;
          }
          console.warn(`[loopback] 端口 ${this.preferredPort} 被占用，自动分配可用端口...`);
          this.server?.listen(0, '0.0.0.0');
        }
      });

      this.server.listen(this.preferredPort, '0.0.0.0');
    });
  }

  /**
   * 统一多协议对话执行流水线（支持 OpenAI Chat / Anthropic Messages / OpenAI Responses）
   */
  async executeChatPipeline(req, res, body, protocol = 'chat', requestedModel = '') {
    const rawModel = requestedModel || body.model || 'auto-free';
    const actualModel = this.resolveModel(rawModel);
    body.model = actualModel;
    this.applyPromptMode(body);

    const isStream = Boolean(body.stream);
    const reqId = `chatcmpl-${Date.now()}`;

    const conversationId =
      req.headers['x-conversation-id'] ||
      req.headers['x-session-id'] ||
      body.conversation_id ||
      body.conversationId ||
      '';

    const meta = {
      conversationId,
      conversationRequestId: req.headers['x-conversation-request-id'],
      traceId: req.headers['x-trace-id']
    };
    const sessionKey = body.prompt_cache_key || conversationId || '';

    try {
      const execution = await this.scheduler.executeWithFailover(
        actualModel,
        async (account) => await this.client.chatStream(account, body, undefined, meta),
        { sessionKey }
      );

      // 1. 视频生成直出桥接（仅限对话形式请求视频模型）
      if (execution.isVideo) {
        try {
          if (isStream) {
            if (protocol === 'anthropic') {
              const emitter = createAnthropicStreamEmitter(res, rawModel);
              await execution.executeVideo((chunk) => {
                emitter.pushOpenAIEvent({ choices: [{ delta: { content: chunk } }] });
              });
              emitter.finish({ promptTokens: 20, completionTokens: 60 });
            } else {
              writeSSEHeaders(res);
              await execution.executeVideo((chunk) => {
                res.write(formatOpenAIChunk(reqId, rawModel, chunk));
              });
              res.write(formatOpenAIChunk(reqId, rawModel, '', 'stop'));
              res.write('data: [DONE]\n\n');
              res.end();
            }
          } else {
            let fullText = '';
            await execution.executeVideo((chunk) => { fullText += chunk; });
            const completion = {
              id: reqId,
              object: 'chat.completion',
              created: Math.floor(Date.now() / 1000),
              model: rawModel,
              choices: [{ index: 0, message: { role: 'assistant', content: fullText }, finish_reason: 'stop' }],
              usage: { prompt_tokens: 20, completion_tokens: Math.max(1, Math.ceil(fullText.length / 4)) }
            };
            if (protocol === 'anthropic') {
              sendJson(res, 200, openAIToAnthropicResponse(completion, rawModel));
            } else if (protocol === 'responses') {
              sendJson(res, 200, chatCompletionToResponseObject(completion, rawModel));
            } else {
              sendJson(res, 200, completion);
            }
          }
          this.ledger.record(actualModel, 20, 60, false);
        } finally {
          execution.release();
        }
        return;
      }

      const reader = execution.bodyStream.getReader();
      const decoder = new TextDecoder();
      let clientClosed = false;

      // 修复：监听 res.close 且确认尚未 writableEnded，避免 req.close 在 POST 体读完或半途误触释放
      const onResClose = () => {
        if (!res.writableEnded) {
          clientClosed = true;
          reader.cancel().catch(() => {});
        }
      };
      res.on('close', onResClose);

      // 2. 流式转发与协议翻译（使用完整事件界限缓冲泵，杜绝 `: ping` 截断 JSON）
      if (isStream) {
        let emitter = null;
        if (protocol === 'anthropic') {
          emitter = createAnthropicStreamEmitter(res, rawModel);
        } else if (protocol === 'responses') {
          emitter = createResponsesStreamEmitter(res, rawModel);
        } else {
          writeSSEHeaders(res);
        }

        const pump = createSSELinePump(res, {
          forwardRaw: protocol === 'chat',
          onEvent: (parsed) => {
            if (emitter && parsed) {
              emitter.pushOpenAIEvent(parsed);
            }
          }
        });

        try {
          while (!clientClosed) {
            const { done, value } = await reader.read();
            if (done) break;
            pump.push(decoder.decode(value, { stream: true }));
          }
          const flushTail = decoder.decode();
          if (flushTail) pump.push(flushTail);
          pump.finish();
          if (emitter) {
            emitter.finish(pump.getUsage());
          } else if (!res.writableEnded) {
            res.end();
          }
        } finally {
          pump.stop();
          res.off('close', onResClose);
          execution.release();
          const u = pump.getUsage();
          this.ledger.record(actualModel, u.promptTokens, u.completionTokens, u.cacheHit);
        }
        return;
      }

      // 3. 非流式全量聚合（保留 text / reasoning_content / tool_calls / usage / finish_reason）
      let fullText = '';
      let reasoningText = '';
      let finishReason = 'stop';
      const toolCalls = new Map();

      const aggPump = createSSELinePump(null, {
        forwardRaw: false,
        heartbeatMs: 0,
        onEvent: (parsed) => {
          const choice = parsed?.choices?.[0];
          if (!choice) return;
          const delta = choice.delta || {};
          if (typeof delta.content === 'string') fullText += delta.content;
          if (typeof delta.reasoning_content === 'string') reasoningText += delta.reasoning_content;
          if (Array.isArray(delta.tool_calls)) {
            for (const tc of delta.tool_calls) {
              if (!tc) continue;
              const idx = typeof tc.index === 'number' ? tc.index : toolCalls.size;
              const cur = toolCalls.get(idx) || {
                id: '',
                type: 'function',
                function: { name: '', arguments: '' }
              };
              if (tc.id) cur.id = tc.id;
              if (tc.type) cur.type = tc.type;
              if (tc.function?.name) cur.function.name += tc.function.name;
              if (typeof tc.function?.arguments === 'string') cur.function.arguments += tc.function.arguments;
              toolCalls.set(idx, cur);
            }
          }
          if (choice.finish_reason) finishReason = choice.finish_reason;
        }
      });

      try {
        while (!clientClosed) {
          const { done, value } = await reader.read();
          if (done) break;
          aggPump.push(decoder.decode(value, { stream: true }));
        }
        const tail = decoder.decode();
        if (tail) aggPump.push(tail);
        aggPump.finish();
      } finally {
        aggPump.stop();
        res.off('close', onResClose);
        execution.release();
      }

      const message = {
        role: 'assistant',
        content: toolCalls.size > 0 && !fullText ? null : fullText
      };
      if (reasoningText) message.reasoning_content = reasoningText;
      if (toolCalls.size > 0) {
        message.tool_calls = [...toolCalls.entries()]
          .sort((a, b) => a[0] - b[0])
          .map(([, v]) => ({
            id: v.id || `call_${Date.now()}`,
            type: v.type || 'function',
            function: {
              name: v.function.name,
              arguments: v.function.arguments || '{}'
            }
          }));
        if (finishReason === 'stop') finishReason = 'tool_calls';
      }

      const usage = aggPump.getUsage();
      const completionObj = {
        id: reqId,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: rawModel,
        choices: [{ index: 0, message, finish_reason: finishReason }],
        usage: {
          prompt_tokens: usage.promptTokens,
          completion_tokens: usage.completionTokens,
          total_tokens: usage.promptTokens + usage.completionTokens
        }
      };

      if (protocol === 'anthropic') {
        sendJson(res, 200, openAIToAnthropicResponse(completionObj, rawModel));
      } else if (protocol === 'responses') {
        sendJson(res, 200, chatCompletionToResponseObject(completionObj, rawModel));
      } else {
        sendJson(res, 200, completionObj);
      }

      this.ledger.record(actualModel, usage.promptTokens, usage.completionTokens, usage.cacheHit);
    } catch (err) {
      if (!res.headersSent) {
        const status = err.status && err.status >= 400 && err.status < 600 ? err.status : 500;
        if (protocol === 'anthropic') {
          sendJson(res, status, {
            type: 'error',
            error: { type: 'api_error', message: err.message }
          });
        } else {
          sendJson(res, status, {
            error: { message: err.message, type: 'api_error' }
          });
        }
      }
    }
  }

  /**
   * 提交标准视频生成任务 (POST /v1/videos/generations)
   */
  async handleVideoCreate(req, res) {
    const body = await readJsonBody(req, res);
    if (!body) return;

    const rawModel = String(body.model || 'kling-video-v3');
    const resolved = this.resolveModel(rawModel);
    const normalizedModel =
      resolved.includes('minimax') || resolved.includes('hailuo') || resolved.includes('海螺')
        ? 'minimax-video-h3'
        : 'kling-video-v3';

    const execution = await this.scheduler.executeWithFailover(resolved, async (account) => {
      const base = this.client.getChatBase(account);
      const upRes = await fetch(`${base}${VIDEO_GENERATIONS_PATH}`, {
        method: 'POST',
        headers: this.client.buildHeaders(account, false),
        body: JSON.stringify({ ...body, model: normalizedModel }),
        signal: AbortSignal.timeout(30000)
      });
      const data = await upRes.json().catch(() => ({}));
      if (!upRes.ok || (data.code !== 0 && data.code !== 200)) {
        return {
          ok: false,
          status: upRes.status,
          kind: this.client.classifyError(upRes.status, data),
          message: data.msg || data.message || `视频任务创建失败 (${upRes.status})`
        };
      }
      return { ok: true, data };
    });

    try {
      const taskId = execution.data?.data?.id || execution.data?.id;
      if (taskId) {
        if (this.videoTaskAccountMap.size > 200) {
          const firstKey = this.videoTaskAccountMap.keys().next().value;
          this.videoTaskAccountMap.delete(firstKey);
        }
        this.videoTaskAccountMap.set(taskId, {
          uid: execution.account.account.uid,
          model: normalizedModel,
          createdAt: Date.now(),
          status: execution.data?.data?.status || execution.data?.status || 'queued'
        });
      }
      sendJson(res, 200, {
        id: taskId,
        object: 'video.generation',
        model: normalizedModel,
        ...(execution.data?.data || execution.data || {})
      });
    } finally {
      execution.release();
    }
  }

  /**
   * 查询标准视频生成任务状态 (GET /v1/videos/tasks/:id)
   */
  async handleVideoQuery(res, taskId) {
    const tracked = this.videoTaskAccountMap.get(taskId);
    const preferredAcc = tracked ? this.scheduler.store.get(tracked.uid) : null;

    const queryAccount = async (account) => {
      const base = this.client.getChatBase(account);
      const upRes = await fetch(`${base}${VIDEO_GENERATIONS_PATH}/${encodeURIComponent(taskId)}`, {
        headers: this.client.buildHeaders(account, false),
        signal: AbortSignal.timeout(15000)
      });
      const data = await upRes.json().catch(() => ({}));
      if (!upRes.ok) {
        return {
          ok: false,
          status: upRes.status,
          kind: this.client.classifyError(upRes.status, data),
          message: data.msg || `查询视频任务失败 (${upRes.status})`
        };
      }
      return { ok: true, data };
    };

    if (preferredAcc) {
      const direct = await queryAccount(preferredAcc);
      if (direct.ok) {
        if (tracked) tracked.status = direct.data?.data?.status || direct.data?.status || tracked.status;
        sendJson(res, 200, direct.data?.data || direct.data);
        return;
      }
    }

    const execution = await this.scheduler.executeWithFailover('kling-video-v3', queryAccount);
    try {
      sendJson(res, 200, execution.data?.data || execution.data);
    } finally {
      execution.release();
    }
  }

  stop() {
    if (this.server) {
      try { this.server.closeAllConnections?.(); } catch (_) {}
      try { this.server.closeIdleConnections?.(); } catch (_) {}
      try { this.server.close(); } catch (_) {}
      this.server = null;
    }
  }
}

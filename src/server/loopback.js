/**
 * loopback.js - 独立 OpenAI 兼容接口本地网关服务（提供 /v1/chat/completions 与 /v1/models）
 */

import http from 'node:http';
import { DEFAULT_GATEWAY_PORT, STATIC_MODELS, DEFAULT_MODEL_ALIASES } from '../constants.js';
import { writeSSEHeaders, startSSEHeartbeat, formatOpenAIChunk } from './sse.js';

export class LoopbackGateway {
  constructor(scheduler, client, ledger, options = {}) {
    this.scheduler = scheduler;
    this.client = client;
    this.ledger = ledger;
    this.preferredPort = options.port || DEFAULT_GATEWAY_PORT;
    this.apiKey = options.apiKey || '';
    this.modelAliases = { ...DEFAULT_MODEL_ALIASES, ...(options.aliases || {}) };
    this.enabledModels = new Set(options.enabledModels || []);
    this.server = null;
    this.actualPort = null;
  }

  resolveModel(requestedModel) {
    let target = this.modelAliases[requestedModel] || requestedModel;
    if (target === 'auto-free') {
      // 智能免费模型路由池：优先使用 global:deepseek-v4.1-flash 或 cn:hy4free
      target = 'global:deepseek-v4.1-flash';
    }
    return target;
  }

  getModelsList() {
    const list = STATIC_MODELS.map((m) => ({
      id: m.id,
      object: 'model',
      created: 1726000000,
      owned_by: 'workbuddy2api',
      permission: [],
      root: m.id,
      parent: null,
      context_length: m.contextWindow,
      max_tokens: m.maxTokens,
      multimodal: m.supportsImages,
      billing_rate: m.rate,
      badge: m.badge || null
    }));

    // 注入别名模型
    for (const [alias, target] of Object.entries(this.modelAliases)) {
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
    this.server = http.createServer((req, res) => {
      // 跨域处理
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', '*');
      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }

      const url = new URL(req.url, `http://${req.headers.host || '127.0.0.1'}`);
      const pathname = url.pathname;

      // 1. 健康状态探测
      if (pathname === '/health' || pathname === '/' || pathname === '/status') {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
          status: 'ok',
          service: 'dsh-workbuddy2api',
          version: '1.0.0',
          accounts: this.scheduler.store.getAll().length,
          active: this.scheduler.store.activeUid
        }));
        return;
      }

      // 2. 模型列表接口 /v1/models
      if (req.method === 'GET' && (pathname === '/v1/models' || pathname === '/models')) {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
          object: 'list',
          data: this.getModelsList()
        }));
        return;
      }

      // 3. 对话接口 /v1/chat/completions
      if (req.method === 'POST' && (pathname === '/v1/chat/completions' || pathname === '/chat/completions')) {
        this.handleChatCompletions(req, res);
        return;
      }

      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: { message: 'Not Found', type: 'invalid_request_error' } }));
    });

    return new Promise((resolve) => {
      this.server.listen(this.preferredPort, '0.0.0.0', () => {
        this.actualPort = this.server.address().port;
        console.log(`[loopback] 🚀 OpenAI 兼容网关已就绪: http://127.0.0.1:${this.actualPort}/v1`);
        resolve(this.actualPort);
      });

      this.server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.warn(`[loopback] 端口 ${this.preferredPort} 被占用，自动随机分配可用端口...`);
          this.server.listen(0, '0.0.0.0', () => {
            this.actualPort = this.server.address().port;
            console.log(`[loopback] 🚀 网关已绑定空闲端口: http://127.0.0.1:${this.actualPort}/v1`);
            resolve(this.actualPort);
          });
        }
      });
    });
  }

  async handleChatCompletions(req, res) {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', async () => {
      let body;
      try {
        body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: { message: 'Invalid JSON request body' } }));
        return;
      }

      const rawModel = body.model || 'auto-free';
      const actualModel = this.resolveModel(rawModel);
      body.model = actualModel;
      const isStream = Boolean(body.stream);
      const reqId = `chatcmpl-${Date.now()}`;

      const meta = {
        conversationId: req.headers['x-conversation-id'] || req.headers['x-session-id'] || body.conversation_id || body.conversationId,
        conversationRequestId: req.headers['x-conversation-request-id'],
        traceId: req.headers['x-trace-id']
      };

      try {
        const execution = await this.scheduler.executeWithFailover(actualModel, async (account) => {
          return await this.client.chatStream(account, body, undefined, meta);
        });

        // 视频大模型直出逻辑
        if (execution.isVideo) {
          if (isStream) {
            writeSSEHeaders(res);
            await execution.executeVideo((chunk) => {
              res.write(formatOpenAIChunk(reqId, actualModel, chunk));
            });
            res.write(formatOpenAIChunk(reqId, actualModel, '', 'stop'));
            res.write('data: [DONE]\n\n');
            res.end();
          } else {
            let fullText = '';
            await execution.executeVideo((chunk) => { fullText += chunk; });
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({
              id: reqId,
              object: 'chat.completion',
              created: Math.floor(Date.now() / 1000),
              model: actualModel,
              choices: [{ index: 0, message: { role: 'assistant', content: fullText }, finish_reason: 'stop' }]
            }));
          }
          execution.release();
          this.ledger.record(actualModel, 10, 50);
          return;
        }

        // 普通文本 / 视觉流式响应
        if (isStream) {
          writeSSEHeaders(res);
          const stopHeartbeat = startSSEHeartbeat(res);

          let promptTokens = 0;
          let completionTokens = 0;

          const stream = execution.bodyStream;
          const reader = stream.getReader();
          const decoder = new TextDecoder();

          req.on('close', () => {
            reader.cancel().catch(() => {});
            execution.release();
            stopHeartbeat();
          });

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              const text = decoder.decode(value, { stream: true });
              res.write(text);
              completionTokens += 1;
            }
          } finally {
            stopHeartbeat();
            execution.release();
            res.end();
            this.ledger.record(actualModel, promptTokens || 20, completionTokens || 20);
          }
        } else {
          // 非流式聚合完整响应
          const stream = execution.bodyStream;
          const reader = stream.getReader();
          const decoder = new TextDecoder();
          let fullText = '';

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              const chunk = decoder.decode(value, { stream: true });
              const lines = chunk.split('\n');
              for (const line of lines) {
                if (line.startsWith('data:') && !line.includes('[DONE]')) {
                  try {
                    const parsed = JSON.parse(line.slice(5).trim());
                    const delta = parsed.choices?.[0]?.delta?.content || '';
                    fullText += delta;
                  } catch (_) {}
                }
              }
            }
          } finally {
            execution.release();
          }

          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({
            id: reqId,
            object: 'chat.completion',
            created: Math.floor(Date.now() / 1000),
            model: actualModel,
            choices: [{ index: 0, message: { role: 'assistant', content: fullText }, finish_reason: 'stop' }]
          }));
          this.ledger.record(actualModel, 30, fullText.length / 4);
        }
      } catch (err) {
        if (!res.headersSent) {
          const status = err.status && err.status >= 400 && err.status < 600 ? err.status : 500;
          res.writeHead(status, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: { message: err.message, type: 'api_error' } }));
        }
      }
    });
  }

  stop() {
    if (this.server) {
      this.server.close();
      this.server = null;
    }
  }
}

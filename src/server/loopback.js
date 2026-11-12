/**
 * loopback.js - 独立多协议本地兼容网关 (OpenAI Chat / Responses / Anthropic / Video / Web Console)
 */

import http from 'node:http';
import {
  DEFAULT_GATEWAY_PORT,
  DEFAULT_STREAM_IDLE_TIMEOUT_MS,
  SERVICE_VERSION,
  STATIC_MODELS,
  DEFAULT_MODEL_ALIASES,
  VIDEO_GENERATIONS_PATH,
  ErrKind
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
import {
  dropTruncatedToolCalls,
  pruneOldestHistory,
  DEGRADED_SYSTEM_PROMPT
} from '../upstream/payload.js';
import {
  getGatewayHint,
  NO_HEALTHY_ACCOUNT_HINT,
  injectFrameGatewayHint,
  parseQuotaResetAt,
  requestHasImagePart
} from '../upstream/hint.js';
import { checkIPWhitelist } from './ip-whitelist.js';

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
    this.portalHandler = options.portalHandler || null;
    this.pluginRouterHandler = options.pluginRouterHandler || null;
    this.userManager = options.userManager || null;
    this.alertManager = options.alertManager || null;

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

  setPortalHandler(fn) {
    this.portalHandler = fn;
  }

  setPluginRouterHandler(fn) {
    this.pluginRouterHandler = fn;
  }

  _getRuntimeConfig() {
    const cfg = this.configStore ? this.configStore.getAll() : {};
    return {
      apiKey: cfg.apiKey ?? this.apiKey ?? '',
      aliases: { ...DEFAULT_MODEL_ALIASES, ...(this.modelAliases || {}), ...(cfg.aliases || {}) },
      modelRoutes: cfg.modelRoutes && typeof cfg.modelRoutes === 'object' ? cfg.modelRoutes : {},
      autoFreeEnabled: cfg.autoFreeEnabled !== false,
      portalAsHome: Boolean(cfg.portalAsHome),
      enabledModels: Array.isArray(cfg.enabledModels) ? cfg.enabledModels : [...this.enabledModels],
      freeModels: Array.isArray(cfg.freeModels) && cfg.freeModels.length > 0
        ? cfg.freeModels
        : ['global:hy4free', 'cn:hy4free', 'global:hy3', 'cn:hy3', 'global:deepseek-v4.1-flash-sg'],
      promptMode: cfg.promptMode || 'none',
      promptText: cfg.promptText || '',
      streamIdleTimeoutMs: Math.max(10000, Number(cfg.streamIdleTimeoutMs || DEFAULT_STREAM_IDLE_TIMEOUT_MS)),
      ipWhitelist: cfg.ipWhitelist || { enabled: false, allowedIPs: [], allowLocalhost: true }
    };
  }

  getModelCatalogMap() {
    const map = new Map();
    for (const m of this.getMergedModels(true)) {
      map.set(m.id, m);
      if (m.bareId && !map.has(m.bareId)) {
        map.set(m.bareId, m);
      }
    }
    return map;
  }

  _extractProvidedApiKey(req, url) {
    const authHeader = String(req.headers['authorization'] || '');
    const bearer = authHeader.toLowerCase().startsWith('bearer ') ? authHeader.slice(7).trim() : '';
    const xKey = String(req.headers['x-api-key'] || '').trim();
    const queryKey = url.searchParams.get('key') || '';
    return bearer || xKey || queryKey || '';
  }

  checkAuth(req, url) {
    const { apiKey } = this._getRuntimeConfig();
    const provided = this._extractProvidedApiKey(req, url);

    if (this.userManager) {
      const verified = this.userManager.verifyApiRequest(provided, apiKey);
      req._wbUser = verified.user || null;
      if (!verified.ok) {
        req._authError = { status: verified.status || 401, message: verified.message };
        return false;
      }
      return true;
    }

    if (!apiKey) return true;
    return provided === apiKey;
  }

  /**
   * 汇总所有 0 算力免费模型候选并按可用账号健康状态与熔断器优先级排序
   */
  getFreeModelCandidates() {
    const { freeModels, modelRoutes } = this._getRuntimeConfig();
    const enabledAccs = this.scheduler.store.getAll().filter((a) => !this.scheduler.isAccountUnavailable(a));
    const enabledRealms = new Set(enabledAccs.map((a) => a.auth?.realm || 'cn'));

    const rawList = [
      ...(Array.isArray(freeModels) ? freeModels : []),
      ...(Array.isArray(modelRoutes['auto-free']) ? modelRoutes['auto-free'] : []),
      ...(Array.isArray(modelRoutes['free']) ? modelRoutes['free'] : []),
      ...this.discoveredModels.filter((m) => m.isFree).map((m) => m.id),
      'global:hy4free',
      'cn:hy4free',
      'cn:deepseek-v4.1-flash',
      'global:deepseek-v4.1-flash-sg',
      'cn:glm-4-flash'
    ];

    const deduped = [];
    const seen = new Set();
    for (const item of rawList) {
      const m = String(item || '').trim();
      if (!m || seen.has(m)) continue;
      seen.add(m);
      deduped.push(m);
    }

    return this.sortCandidatesByHealth(deduped, enabledRealms);
  }

  sortCandidatesByHealth(candidates = [], enabledRealms = null) {
    const healthyActive = [];
    const backupNormal = [];
    const coolingModels = [];

    const accs = this.scheduler.store.getAll().filter((a) => !this.scheduler.isAccountUnavailable(a));
    const realmsSet = enabledRealms || new Set(accs.map((a) => a.auth?.realm || 'cn'));

    for (const m of candidates) {
      if (this.scheduler.isRouteModelCooling(m)) {
        coolingModels.push(m);
        continue;
      }
      const r = m.startsWith('global:') ? 'global' : m.startsWith('cn:') ? 'cn' : null;
      const bare = m.replace(/^(cn:|global:|solo:|trae:)/i, '');
      const hasHealthyAcc = accs.some((a) => {
        const accRealm = a.auth?.realm || 'cn';
        if (r && accRealm !== r) return false;
        return !this.scheduler.isCoolingDown(a.account.uid, bare);
      });
      if (hasHealthyAcc) {
        healthyActive.push(m);
      } else if (!r || realmsSet.size === 0 || realmsSet.has(r)) {
        backupNormal.push(m);
      } else {
        coolingModels.push(m);
      }
    }
    return [...healthyActive, ...backupNormal, ...coolingModels];
  }

  resolveModelCandidates(requestedModel) {
    const { aliases, modelRoutes } = this._getRuntimeConfig();
    let target = String(requestedModel || 'auto-free').trim() || 'auto-free';
    const seen = new Set();

    while (aliases[target] && !seen.has(target)) {
      seen.add(target);
      target = aliases[target];
    }

    if (target === 'auto-free' || target === 'free') {
      const list = this.getFreeModelCandidates();
      return list.length > 0 ? list : ['global:hy4free', 'cn:hy4free'];
    }

    if (Array.isArray(modelRoutes[target]) && modelRoutes[target].length > 0) {
      return this.sortCandidatesByHealth([...modelRoutes[target]]);
    }

    const clean = target.replace(/^(cn:|global:)/i, '').toLowerCase();
    if (['hy4free', 'hy4-free', 'hunyuan-free', 'hunyuan4-free'].includes(clean)) {
      const base = target.startsWith('cn:')
        ? ['cn:hy4free', 'cn:hy4flash-exp1', 'cn:hy4flash-exp2', 'cn:hy4flash-exp3', 'global:hy4free']
        : ['global:hy4free', 'cn:hy4free', 'cn:hy4flash-exp1', 'cn:hy4flash-exp2'];
      return this.sortCandidatesByHealth(base);
    }

    return [target];
  }

  resolveModel(requestedModel) {
    return this.resolveModelCandidates(requestedModel)[0] || 'global:hy4free';
  }

  applyPromptMode(payload) {
    if (!Array.isArray(payload.messages)) return;
    const { promptMode, promptText } = this._getRuntimeConfig();

    if (
      (promptMode === 'none' || promptMode === 'passthrough' || promptMode === 'append') &&
      this.scheduler.degradeGate?.active()
    ) {
      const rest = payload.messages.filter((m) => m?.role !== 'system' && m?.role !== 'developer');
      payload.messages = [{ role: 'system', content: DEGRADED_SYSTEM_PROMPT }, ...rest];
      return;
    }

    if (!promptMode || promptMode === 'none' || promptMode === 'passthrough' || !promptText) {
      return;
    }

    if (promptMode === 'replace' || promptMode === 'custom') {
      const rest = payload.messages.filter((m) => m?.role !== 'system' && m?.role !== 'developer');
      payload.messages = [{ role: 'system', content: promptText }, ...rest];
      return;
    }

    if (promptMode === 'append') {
      let insertAt = 0;
      while (insertAt < payload.messages.length) {
        const r = String(payload.messages[insertAt]?.role || '').toLowerCase();
        if (r !== 'system' && r !== 'developer') break;
        insertAt++;
      }
      const next = [...payload.messages];
      next.splice(insertAt, 0, { role: 'system', content: promptText });
      payload.messages = next;
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
          name: dm.name || existing.name,
          description: dm.description || existing.description,
          credits: dm.credits || existing.credits,
          rate: dm.rate && dm.rate !== '-' ? dm.rate : existing.rate,
          multiplier: dm.multiplier ?? existing.multiplier,
          isFree: dm.isFree ?? existing.isFree,
          badge: dm.badge || existing.badge,
          vendor: dm.vendor || existing.vendor,
          tags: dm.tags?.length ? dm.tags : existing.tags,
          supportsImages: dm.supportsImages ?? existing.supportsImages,
          supportsReasoning: dm.supportsReasoning ?? existing.supportsReasoning,
          supportsToolCall: dm.supportsToolCall ?? existing.supportsToolCall,
          onlyReasoning: dm.onlyReasoning ?? existing.onlyReasoning,
          supportedEfforts: dm.supportedEfforts?.length ? dm.supportedEfforts : existing.supportedEfforts,
          defaultEffort: dm.defaultEffort || existing.defaultEffort,
          contextWindow: dm.contextWindow || existing.contextWindow,
          maxTokens: dm.maxTokens || existing.maxTokens,
          source: 'upstream'
        });
      } else {
        merged.set(dm.id, {
          ...dm,
          badge: dm.badge || '新发现',
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

  getModelsList(includeDisabled = false, includeBare = false) {
    const { aliases, modelRoutes, autoFreeEnabled } = this._getRuntimeConfig();
    const formatModelEntry = (m, overrideId = null) => {
      const id = overrideId || m.id;
      const prefix = m.rate && m.rate !== '-' && m.rate !== '视频' ? `[${m.rate} credit] ` : '';
      return {
        id,
        object: 'model',
        created: 1726000000,
        owned_by: m.source === 'discovered' || m.source === 'upstream' ? 'workbuddy-upstream' : 'workbuddy2api',
        permission: [],
        root: m.id,
        parent: overrideId ? m.id : null,
        name: m.name,
        description: `${prefix}${m.description || m.name || ''}`.trim(),
        credits: m.credits || m.rate || '',
        multiplier: m.multiplier ?? null,
        is_free: Boolean(m.isFree),
        billing_rate: m.rate || '-',
        badge: m.badge || null,
        vendor: m.vendor || '',
        tags: m.tags || [],
        realm: m.realm,
        context_length: m.contextWindow,
        max_output_tokens: m.maxTokens,
        max_tokens: m.maxTokens,
        multimodal: m.supportsImages,
        supports_images: Boolean(m.supportsImages),
        supports_reasoning: Boolean(m.supportsReasoning),
        supports_tool_call: Boolean(m.supportsToolCall ?? true),
        only_reasoning: Boolean(m.onlyReasoning),
        supported_efforts: m.supportedEfforts || [],
        reasoning_supported_efforts: m.supportedEfforts || [],
        reasoning_default_effort: m.defaultEffort || '',
        source: m.source
      };
    };

    const rawModels = this.getMergedModels(includeDisabled);
    const list = rawModels.map((m) => formatModelEntry(m));

    if (includeBare) {
      const existingIds = new Set(list.map((m) => m.id));
      for (const m of rawModels) {
        if (m.bareId && !existingIds.has(m.bareId)) {
          existingIds.add(m.bareId);
          list.push(formatModelEntry(m, m.bareId));
        }
      }
    }

    if (autoFreeEnabled) {
      const freeCandidates = this.getFreeModelCandidates();
      const freeDesc = `[x0.00 credit] 智能免费模型自动路由池 (优先: ${freeCandidates.slice(0, 5).join(' -> ')})`;
      for (const vid of ['auto-free', 'free']) {
        if (!list.some((m) => m.id === vid)) {
          list.push({
            id: vid,
            name: vid === 'auto-free' ? 'Auto Free (智能免费模型路由池)' : 'Free (智能免费路由别名)',
            description: freeDesc,
            object: 'model',
            created: 1753600000,
            owned_by: 'system',
            credits: 'x0.00',
            multiplier: 0,
            is_free: true,
            billing_rate: 'x0.00',
            context_length: 131072,
            max_output_tokens: 16384,
            supports_reasoning: true,
            supports_tool_call: true
          });
        }
      }
    }

    for (const [groupName, targets] of Object.entries(modelRoutes)) {
      if (groupName === 'auto-free' || groupName === 'free') continue;
      if (!Array.isArray(targets) || targets.length === 0) continue;
      if (!list.some((m) => m.id === groupName)) {
        list.push({
          id: groupName,
          name: `${groupName} (自定义模型故障转移组)`,
          description: `故障转移队列: ${targets.join(' -> ')}`,
          object: 'model',
          created: 1753600000,
          owned_by: 'workbuddy2api-route',
          supports_tool_call: true
        });
      }
    }

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

  getPublicStatusSnapshot() {
    const allAcc = this.scheduler.store.getAll();
    const overall = this.scheduler.getCountsDetailed();
    const cnCounts = this.scheduler.getCountsDetailed('cn');
    const globalCounts = this.scheduler.getCountsDetailed('global');
    const stats = this.ledger.getStats(this.getModelCatalogMap());

    return {
      status: overall.healthy > 0 ? 'ok' : 'degraded',
      service: 'dsh-workbuddy2api',
      version: SERVICE_VERSION,
      port: this.actualPort || this.preferredPort,
      total: overall.total,
      healthy: overall.healthy,
      cooling: overall.cooling,
      disabled: overall.disabled,
      manual_disabled: overall.manualDisabled,
      in_flight_full: overall.inFlightFull,
      realm_totals: { cn: cnCounts, global: globalCounts },
      sticky_sessions: this.scheduler.stickyMap.size,
      discoveredModels: this.discoveredModels.length,
      waf_ip_blocked: this.scheduler.wafIPGate.active(),
      degrade_active: this.scheduler.degradeGate.active(),
      today: stats.today,
      uptimeSec: Math.floor((Date.now() - this.startedAt) / 1000)
    };
  }

  getStatusPayload() {
    const base = this.getPublicStatusSnapshot();
    const accounts = this.scheduler.store.getAll().map((acc) => {
      const diag = this.scheduler.getAccountDiagnostics(acc.account.uid);
      return {
        uid: acc.account.uid,
        nickname: acc.account.nickname,
        realm: acc.auth?.realm || 'cn',
        ...diag
      };
    });
    return { ...base, accounts, active: this.scheduler.store.activeUid };
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
        const runtimeCfg = this._getRuntimeConfig();
        const ipCheck = checkIPWhitelist(req, runtimeCfg.ipWhitelist);
        if (!ipCheck.allowed) {
          sendJson(res, 403, {
            error: {
              message: `Access denied by IP whitelist (client: ${ipCheck.clientIP})`,
              type: 'access_denied',
              code: 'ip_not_allowed'
            }
          });
          return;
        }

        // 1. 公开展示门户 (/portal /ui/public/status) 与 Web Console (/ /console /dashboard)
        if (req.method === 'GET' && (pathname === '/ui/public/status' || pathname === '/plugins/dsh-workbuddy2api/public/status')) {
          sendJson(res, 200, {
            ok: true,
            ...this.getPublicStatusSnapshot(),
            models: this.getModelsList(false, false).slice(0, 80)
          });
          return;
        }

        if (
          req.method === 'GET' &&
          (pathname === '/portal' || (pathname === '/' && runtimeCfg.portalAsHome)) &&
          typeof this.portalHandler === 'function' &&
          url.searchParams.get('format') !== 'json'
        ) {
          const handled = await this.portalHandler(req, res, pathname, url);
          if (handled) return;
        }

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

        // 3. 轻量健康检查 (/health /healthz /status /)
        if (req.method === 'GET' && (pathname === '/health' || pathname === '/')) {
          const allAcc = this.scheduler.store.getAll();
          sendJson(res, 200, {
            status: 'ok',
            service: 'dsh-workbuddy2api',
            version: SERVICE_VERSION,
            port: this.actualPort || this.preferredPort,
            accounts: allAcc.length,
            enabledAccounts: allAcc.filter((a) => !this.scheduler.isAccountUnavailable(a)).length,
            active: this.scheduler.store.activeUid,
            discoveredModels: this.discoveredModels.length,
            uptimeSec: Math.floor((Date.now() - this.startedAt) / 1000)
          });
          return;
        }

        if (req.method === 'GET' && pathname === '/healthz') {
          const snap = this.getPublicStatusSnapshot();
          res.setHeader('X-Service', 'dsh-workbuddy2api');
          sendJson(res, snap.healthy > 0 ? 200 : 503, {
            healthy: snap.healthy,
            total: snap.total,
            service: 'dsh-workbuddy2api',
            realm_servable: {
              cn: snap.realm_totals.cn.healthy > 0,
              global: snap.realm_totals.global.healthy > 0
            }
          });
          return;
        }

        // 4. 以下 /v1/* /v2/* /status /admin/* 等对外网关端点受 API Key 鉴权保护
        if (!this.checkAuth(req, url)) {
          const authErr = req._authError || { status: 401, message: 'Invalid or missing gateway API key' };
          sendJson(res, authErr.status, {
            error: {
              message: authErr.message,
              type: authErr.status === 429 ? 'rate_limit_error' : 'authentication_error'
            }
          });
          return;
        }

        if (req.method === 'GET' && pathname === '/status') {
          sendJson(res, 200, this.getStatusPayload());
          return;
        }

        // 4.1 运维账号停用/恢复/复活 API (/admin/accounts/:uid/{disable,enable,revive})
        const adminMatch = pathname.match(/^\/admin\/accounts\/([^/]+)\/(disable|enable|revive)$/);
        if (req.method === 'POST' && adminMatch) {
          const targetUid = decodeURIComponent(adminMatch[1]);
          const action = adminMatch[2];
          const body = await readJsonBody(req, res) || {};
          let op = null;
          if (action === 'disable') {
            op = this.scheduler.store.setManualDisabled(targetUid, true, body.reason || 'manual');
          } else if (action === 'enable') {
            op = this.scheduler.store.setManualDisabled(targetUid, false, '');
          } else {
            op = this.scheduler.store.reviveAccount(targetUid);
            this.scheduler.clearCooldown(targetUid);
          }
          if (!op || !op.found) {
            sendJson(res, 404, { error: { message: `account not found: ${targetUid}`, type: 'not_found' } });
            return;
          }
          sendJson(res, 200, {
            uid: targetUid,
            manual_disabled: Boolean(op.acc.manualDisabled),
            manual_reason: op.acc.manualDisabledReason || '',
            disabled: Boolean(op.acc.disabled),
            changed: Boolean(op.changed)
          });
          return;
        }

        // 5. 用量统计接口
        if (req.method === 'GET' && pathname === '/v1/stats') {
          const allAcc = this.scheduler.store.getAll();
          const dateParam = url.searchParams.get('date') || '';
          sendJson(res, 200, {
            ok: true,
            ...this.ledger.getStats(this.getModelCatalogMap(), dateParam),
            discoveredModels: this.discoveredModels.length,
            pool: {
              total: allAcc.length,
              enabled: allAcc.filter((a) => !this.scheduler.isAccountUnavailable(a)).length
            }
          });
          return;
        }

        if (req.method === 'POST' && pathname === '/v1/stats/reset') {
          this.ledger.reset();
          sendJson(res, 200, { ok: true, message: '用量账本已清空' });
          return;
        }

        // 6. 模型列表接口 /v1/models (透出完整倍率、思考档位与可选裸模型名)
        if (req.method === 'GET' && (pathname === '/v1/models' || pathname === '/models')) {
          const includeAll = url.searchParams.get('all') === '1';
          const ua = String(req.headers['user-agent'] || '').toLowerCase();
          const includeBare =
            url.searchParams.get('bare') === 'true' ||
            req.headers['x-include-bare-models'] === 'true' ||
            /new-api|one-api|openai|langchain/.test(ua);
          sendJson(res, 200, {
            object: 'list',
            data: this.getModelsList(includeAll, includeBare)
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

  _handleObservedUsageCost(accUid, modelId, modelMeta, usage, sessionKey) {
    if (!accUid || !usage) return;

    const quota = usage.quota;
    const isFree = Boolean(modelMeta?.isFree);
    if (!isFree) return;

    const charged = Boolean(usage.hasCredit && usage.credit > 0);
    const quotaFull = Boolean(quota && Number(quota.percent || 0) >= 100);
    if (!charged && !quotaFull) return;

    const resetAtMs = parseQuotaResetAt(quota);
    const bare = String(modelId || '').replace(/^(cn:|global:|solo:|trae:)/i, '');
    const reason = `free quota exhausted (credit=${Number(usage.credit || 0).toFixed(2)}, quota=${Number(quota?.percent || 0)}%)`;
    const targets = new Set([bare]);
    if (Array.isArray(quota?.shared_models)) {
      for (const sm of quota.shared_models) {
        const cleanSm = String(sm || '').trim();
        if (cleanSm) targets.add(cleanSm);
      }
    }
    for (const m of targets) {
      this.scheduler.cooldownFreeQuotaModel(accUid, resetAtMs, m, reason);
    }
    if (sessionKey) {
      this.scheduler.stickyMap.delete(`${sessionKey}::${bare}`);
    }
  }

  /**
   * 统一多协议对话执行流水线（支持 OpenAI Chat / Anthropic Messages / OpenAI Responses）
   */
  async executeChatPipeline(req, res, body, protocol = 'chat', requestedModel = '') {
    const rawModel = requestedModel || body.model || 'auto-free';
    const candidates = this.resolveModelCandidates(rawModel);
    const baseBody = { ...body };
    const reqHasImage = requestHasImagePart(baseBody);
    const isStream = Boolean(baseBody.stream);
    const reqId = `chatcmpl-${Date.now()}`;
    const runtimeCfg = this._getRuntimeConfig();

    const conversationId =
      req.headers['x-conversation-id'] ||
      req.headers['x-session-id'] ||
      baseBody.conversation_id ||
      baseBody.conversationId ||
      '';

    const meta = {
      conversationId,
      conversationRequestId: req.headers['x-conversation-request-id'],
      traceId: req.headers['x-trace-id']
    };
    const sessionKey = baseBody.prompt_cache_key || conversationId || '';
    const reqStartedAt = Date.now();
    const catalogMap = this.getModelCatalogMap();
    const reqUser = req._wbUser || null;

    let actualModel = candidates[0] || 'global:hy4free';
    let modelMeta = catalogMap.get(actualModel) || catalogMap.get(actualModel.replace(/^(cn:|global:)/i, ''));
    let modelRate = modelMeta?.rate || '-';
    let execution = null;
    let workingBody = { ...baseBody };
    let pruneAttempts = 0;

    try {
      let lastCandErr = null;
      for (let candIdx = 0; candIdx < candidates.length; candIdx++) {
        const candModel = candidates[candIdx];
        if (candIdx < candidates.length - 1 && this.scheduler.isRouteModelCooling(candModel)) {
          continue;
        }
        actualModel = candModel;
        modelMeta = catalogMap.get(actualModel) || catalogMap.get(actualModel.replace(/^(cn:|global:)/i, ''));
        modelRate = modelMeta?.rate || '-';

        workingBody = { ...baseBody, model: actualModel };
        this.applyPromptMode(workingBody);

        let attemptSuccess = false;
        while (!attemptSuccess) {
          try {
            execution = await this.scheduler.executeWithFailover(
              actualModel,
              async (account) => {
                const ctrl = new AbortController();
                return {
                  ...(await this.client.chatStream(account, workingBody, ctrl.signal, meta)),
                  abortController: ctrl
                };
              },
              { sessionKey }
            );
            attemptSuccess = true;
          } catch (innerErr) {
            if (innerErr.kind === ErrKind.PROMPT_TOO_LONG && pruneAttempts < 2) {
              const pruned = pruneOldestHistory(workingBody);
              if (pruned.pruned) {
                pruneAttempts += 1;
                workingBody = pruned.payload;
                console.warn(`[loopback] 11115 上下文超限，自动裁剪最早对话轮次抢救重试 (${pruneAttempts}/2)...`);
                continue;
              }
            }
            lastCandErr = innerErr;
            // 非账户/路由类错误（内容拦截、图片无效、参数错误、11115 抢救后仍超限）直接抛出，不跨模型乱跳
            if (
              innerErr.kind === ErrKind.CONTENT_BLOCKED ||
              innerErr.kind === ErrKind.IMAGE_INVALID ||
              innerErr.kind === ErrKind.PROMPT_TOO_LONG ||
              innerErr.kind === ErrKind.BAD_PARAMS ||
              innerErr.code === 'waf_ip_blocked'
            ) {
              throw innerErr;
            }
            // 多模型路由池存在下一顺位候选时，触发模型级熔断并自动降级切换
            if (candIdx < candidates.length - 1) {
              this.scheduler.tripRouteModel(candModel, 60000);
              console.warn(`[failover] 候选模型 ${candModel} 不可用 (${innerErr.message})，自动切换至 ${candidates[candIdx + 1]}`);
            }
            break;
          }
        }
        if (execution) break;
      }

      if (!execution) {
        throw lastCandErr || new Error('all accounts and candidate models are unavailable, please retry later');
      }

      const accUid = execution.account?.account?.uid || '';
      const accNick = execution.account?.account?.nickname || accUid.slice(0, 8) || '-';
      const accRealm = execution.account?.auth?.realm || '-';
      this.scheduler.beginInFlight(reqId, {
        uid: accUid,
        nickname: accNick,
        realm: accRealm,
        model: actualModel,
        rate: modelRate,
        mode: isStream ? 'stream' : 'sync',
        protocol
      });

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
          const durationMs = Date.now() - reqStartedAt;
          this.ledger.record(actualModel, 20, 60, false, { durationMs, success: true });
          this.ledger.addRequestLog({
            model: actualModel,
            rate: modelRate,
            mode: isStream ? 'stream' : 'sync',
            protocol,
            status: 200,
            uid: accUid,
            account: accNick,
            realm: accRealm,
            ttfbMs: 0,
            durationMs,
            promptTokens: 20,
            completionTokens: 60,
            hasCredit: false
          });
        } finally {
          this.scheduler.endInFlight(reqId);
          execution.release();
        }
        return;
      }

      const reader = execution.bodyStream.getReader();
      const decoder = new TextDecoder();
      let clientClosed = false;
      let idleTimer = null;
      const idleMs = runtimeCfg.streamIdleTimeoutMs;

      const armIdleTimer = () => {
        if (idleTimer) clearTimeout(idleTimer);
        if (idleMs > 0) {
          idleTimer = setTimeout(() => {
            clientClosed = true;
            execution.abortController?.abort?.();
            reader.cancel().catch(() => {});
          }, idleMs);
          if (idleTimer.unref) idleTimer.unref();
        }
      };

      const onResClose = () => {
        if (!res.writableEnded) {
          clientClosed = true;
          execution.abortController?.abort?.();
          reader.cancel().catch(() => {});
        }
      };
      res.on('close', onResClose);

      const hintCtx = {
        model: actualModel.replace(/^(cn:|global:)/i, ''),
        hasImage: reqHasImage,
        modelInCatalog: Boolean(modelMeta),
        modelSupportsImages: Boolean(modelMeta?.supportsImages ?? true)
      };

      // 2. 流式转发与协议翻译
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
          startTime: reqStartedAt,
          transformErrorFrame: (errParsed) =>
            injectFrameGatewayHint(errParsed, hintCtx, (st, txt) => this.client.classifyError(st, txt)),
          onEvent: (parsed) => {
            if (emitter && parsed) {
              emitter.pushOpenAIEvent(parsed);
            }
          }
        });

        try {
          armIdleTimer();
          while (!clientClosed) {
            const { done, value } = await reader.read();
            if (done) break;
            armIdleTimer();
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
          if (idleTimer) clearTimeout(idleTimer);
          pump.stop();
          res.off('close', onResClose);
          this.scheduler.endInFlight(reqId);
          execution.release();
          const u = pump.getUsage();
          if (this.userManager && reqUser && u.hasCredit && u.credit > 0) {
            this.userManager.deductUserCredit(reqUser, u.credit);
          }
          this._handleObservedUsageCost(accUid, actualModel, modelMeta, u, sessionKey);
          const durationMs = Date.now() - reqStartedAt;
          this.ledger.record(actualModel, u.promptTokens, u.completionTokens, u.cacheHit, {
            ...u,
            durationMs,
            success: !clientClosed
          });
          this.ledger.addRequestLog({
            model: actualModel,
            rate: modelRate,
            mode: 'stream',
            protocol,
            status: 200,
            uid: accUid,
            account: accNick,
            realm: accRealm,
            ...u,
            durationMs
          });
        }
        return;
      }

      // 3. 非流式全量聚合
      let fullText = '';
      let reasoningText = '';
      let finishReason = 'stop';
      const toolCalls = new Map();

      const aggPump = createSSELinePump(null, {
        forwardRaw: false,
        heartbeatMs: 0,
        startTime: reqStartedAt,
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
        armIdleTimer();
        while (!clientClosed) {
          const { done, value } = await reader.read();
          if (done) break;
          armIdleTimer();
          aggPump.push(decoder.decode(value, { stream: true }));
        }
        const tail = decoder.decode();
        if (tail) aggPump.push(tail);
        aggPump.finish();
      } finally {
        if (idleTimer) clearTimeout(idleTimer);
        aggPump.stop();
        res.off('close', onResClose);
        this.scheduler.endInFlight(reqId);
        execution.release();
      }

      let assembledCalls = [...toolCalls.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([, v]) => ({
          id: v.id || `call_${Date.now()}`,
          type: v.type || 'function',
          function: {
            name: v.function.name,
            arguments: v.function.arguments || ''
          }
        }));
      assembledCalls = dropTruncatedToolCalls(assembledCalls).map((c) => ({
        ...c,
        function: { ...c.function, arguments: c.function.arguments || '{}' }
      }));

      const message = {
        role: 'assistant',
        content: assembledCalls.length > 0 && !fullText ? null : fullText
      };
      if (reasoningText) message.reasoning_content = reasoningText;
      if (assembledCalls.length > 0) {
        message.tool_calls = assembledCalls;
        if (finishReason === 'stop') finishReason = 'tool_calls';
      }

      const usage = aggPump.getUsage();
      if (this.userManager && reqUser && usage.hasCredit && usage.credit > 0) {
        this.userManager.deductUserCredit(reqUser, usage.credit);
      }
      this._handleObservedUsageCost(accUid, actualModel, modelMeta, usage, sessionKey);
      const durationMs = Date.now() - reqStartedAt;
      const completionObj = {
        id: reqId,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: rawModel,
        choices: [{ index: 0, message, finish_reason: finishReason }],
        usage: {
          prompt_tokens: usage.promptTokens,
          completion_tokens: usage.completionTokens,
          total_tokens: usage.promptTokens + usage.completionTokens,
          ...(usage.hasCredit ? { credit: usage.credit, cost_credits: usage.credit } : {})
        }
      };

      if (protocol === 'anthropic') {
        sendJson(res, 200, openAIToAnthropicResponse(completionObj, rawModel));
      } else if (protocol === 'responses') {
        sendJson(res, 200, chatCompletionToResponseObject(completionObj, rawModel));
      } else {
        sendJson(res, 200, completionObj);
      }

      this.ledger.record(actualModel, usage.promptTokens, usage.completionTokens, usage.cacheHit, {
        ...usage,
        durationMs,
        success: true
      });
      this.ledger.addRequestLog({
        model: actualModel,
        rate: modelRate,
        mode: 'sync',
        protocol,
        status: 200,
        uid: accUid,
        account: accNick,
        realm: accRealm,
        ...usage,
        durationMs
      });
    } catch (err) {
      this.scheduler.endInFlight(reqId);
      const status = err.status && err.status >= 400 && err.status < 600
        ? err.status
        : (err.kind === ErrKind.SOFT_RATE ? 429 : 503);
      if (err.retryAfterSec > 0 && !res.headersSent) {
        res.setHeader('Retry-After', String(err.retryAfterSec));
      }
      const errKind = err.kind || ErrKind.NONE;
      const gatewayHint =
        getGatewayHint(errKind, err.message, {
          model: actualModel.replace(/^(cn:|global:)/i, ''),
          hasImage: reqHasImage,
          modelInCatalog: Boolean(modelMeta),
          modelSupportsImages: Boolean(modelMeta?.supportsImages ?? true)
        }) || NO_HEALTHY_ACCOUNT_HINT;

      const durationMs = Date.now() - reqStartedAt;
      this.ledger.record(actualModel, 0, 0, false, { durationMs, success: false });
      this.ledger.addRequestLog({
        model: actualModel,
        rate: modelRate,
        mode: isStream ? 'stream' : 'sync',
        protocol,
        status,
        uid: '-',
        account: '-',
        realm: '-',
        durationMs,
        error: err.message
      });
      if (!res.headersSent) {
        if (protocol === 'anthropic') {
          sendJson(res, status, {
            type: 'error',
            error: {
              type: err.code || 'api_error',
              message: err.message,
              gateway_hint: gatewayHint
            }
          });
        } else {
          sendJson(res, status, {
            error: {
              message: err.message,
              type: err.code || 'api_error',
              code: err.code || (status === 429 ? 'rate_limit_exceeded' : 'no_healthy_account'),
              gateway_hint: gatewayHint
            }
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

/**
 * client.js - WorkBuddy / CodeBuddy 统一高可用出站协议客户端
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import {
  CN_CHAT_BASE,
  CN_BILLING_BASE,
  GLOBAL_BASE,
  CHAT_COMPLETIONS_PATH,
  TOKEN_REFRESH_PATH,
  ENTERPRISE_MODELS_PATH,
  ENTERPRISE_MODELS_FALLBACK_PATH,
  CN_MODELS_PATH,
  V3_CONFIG_PATH,
  BILLING_METER_PATH_CN,
  BILLING_METER_PATH_GLOBAL,
  ErrKind,
  parseCreditMultiplier
} from '../constants.js';
import { prepareOutboundPayload, DEGRADED_SYSTEM_PROMPT } from './payload.js';
import { prepareMessagesWithVision } from './vision.js';
import { isVideoModel, executeVideoChatBridge } from './video.js';
import { isInvalidImageData, isModelBlockedBody } from './hint.js';
import { ModelCatalogEnricher } from './model-catalog.js';

const CLIENT_VERSION = '5.5.4';
const CLI_VERSION = '2.137.1';

function deriveAccountStableID(uid, purpose) {
  return crypto.createHash('sha256').update(`wb2a:${purpose}:${uid || ''}`).digest('hex').slice(0, 36);
}

function isValidHexTrace(s) {
  return typeof s === 'string' && /^[0-9a-f]{16}$|^[0-9a-f]{32}$/i.test(s);
}

export class UpstreamClient {
  constructor(options = {}) {
    this.configStore = options.configStore || null;
    this.proxy = options.proxy || process.env.HTTPS_PROXY || process.env.HTTP_PROXY || '';
    this.customUA = options.userAgent || '';
    this.onTokenRefresh = options.onTokenRefresh || null;
    this.deviceTokenPath = options.deviceTokenPath || process.env.WB_DEVICE_TOKEN_FILE || '';
    this._deviceTokenCache = { path: '', token: '', readAt: 0 };
    this.modelCatalog = options.modelCatalog || new ModelCatalogEnricher({ dshHome: options.dshHome });
  }

  readDeviceToken() {
    const filePath = String(this.configStore?.get('deviceTokenPath') || this.deviceTokenPath || '').trim();
    if (!filePath) return '';
    const now = Date.now();
    if (this._deviceTokenCache.path === filePath && now - this._deviceTokenCache.readAt < 5 * 60 * 1000) {
      return this._deviceTokenCache.token;
    }
    let token = '';
    try {
      const stat = fs.statSync(filePath);
      if (stat.isFile() && stat.size > 0 && stat.size <= 1024) {
        token = fs.readFileSync(filePath, 'utf8').trim();
      }
    } catch (_) {}
    this._deviceTokenCache = { path: filePath, token, readAt: now };
    return token;
  }

  getChatBase(account) {
    return account.auth?.realm === 'global' ? GLOBAL_BASE : CN_CHAT_BASE;
  }

  getBillingBase(account) {
    return account.auth?.realm === 'global' ? GLOBAL_BASE : CN_BILLING_BASE;
  }

  getOrigin(account) {
    return account.auth?.realm === 'global' ? GLOBAL_BASE : CN_BILLING_BASE;
  }

  /**
   * 构造上游全量统一请求头（全面对齐官方桌面端通道校验与追踪头族）
   */
  buildHeaders(account, isChat = false, meta = {}) {
    const isGlobal = account.auth?.realm === 'global';
    const origin = this.getOrigin(account);
    const platform = isGlobal ? 'WorkBuddy AI' : 'WorkBuddy';
    const fullUA = `WorkBuddy/${CLIENT_VERSION} ${platform}/${CLIENT_VERSION} CLI/${CLI_VERSION}`;
    const uid = account.account?.uid || '';

    const headers = {
      'Accept': isChat ? 'application/json, text/event-stream' : 'application/json',
      'Content-Type': 'application/json',
      'Origin': origin,
      'Referer': `${origin}/`,
      'X-Requested-With': 'XMLHttpRequest',
      'User-Agent': this.customUA || (isChat ? fullUA : `WorkBuddy/${CLIENT_VERSION}`),
      'X-CodeBuddy-Request': '1',
      'Accept-Language': isGlobal ? 'en-US' : 'zh-CN'
    };

    if (uid) {
      headers['X-Machine-ID'] = deriveAccountStableID(uid, 'machine');
      headers['X-Session-ID'] = deriveAccountStableID(uid, 'session');
      headers['X-User-Id'] = uid;
    } else {
      headers['X-No-User-Id'] = '1';
    }

    if (account.auth?.accessToken) {
      headers['Authorization'] = `Bearer ${account.auth.accessToken}`;
    } else if (isChat) {
      headers['X-No-Authorization'] = '1';
    }

    if (isGlobal) {
      headers['X-No-Enterprise-Id'] = '1';
      headers['X-Domain'] = 'www.workbuddy.ai';
    } else {
      if (account.account?.enterpriseId) {
        headers['X-Enterprise-Id'] = account.account.enterpriseId;
      } else {
        headers['X-No-Enterprise-Id'] = '1';
      }
      if (account.auth?.domain) {
        headers['X-Domain'] = account.auth.domain;
      } else {
        headers['X-No-Department-Info'] = '1';
      }
    }

    if (isChat) {
      headers['X-Agent-Purpose'] = 'conversation';
      headers['X-IDE-Name'] = 'WorkBuddy';
      headers['X-IDE-Type'] = 'WorkBuddy';
      headers['X-IDE-Version'] = CLIENT_VERSION;
      headers['X-Product'] = 'WorkBuddy';

      const convId = meta.conversationId || crypto.randomUUID();
      const convReqId = meta.conversationRequestId || crypto.randomBytes(16).toString('hex');
      const msgId = crypto.randomBytes(16).toString('hex');
      const traceId = meta.traceId || convReqId;
      const b3Trace = isValidHexTrace(convReqId) ? convReqId : msgId;

      headers['X-Conversation-ID'] = convId;
      headers['X-Conversation-Request-ID'] = convReqId;
      headers['X-Conversation-Message-ID'] = msgId;
      headers['X-Request-ID'] = msgId;
      headers['X-Root-Request-ID'] = convReqId;
      headers['X-Trace-ID'] = traceId;
      headers['X-B3-TraceId'] = b3Trace;
      headers['X-B3-SpanId'] = msgId.slice(0, 16);
      headers['X-B3-Sampled'] = '1';

      const devTok = this.readDeviceToken();
      if (devTok) {
        headers['X-Device-Token'] = devTok;
      }
    }

    return headers;
  }

  /**
   * 错误归类逻辑
   */
  classifyError(status, bodyText) {
    const raw = typeof bodyText === 'string' ? bodyText : JSON.stringify(bodyText || '');
    const text = raw.toLowerCase();
    if (status === 401 || text.includes('12153') || text.includes('token expired') || text.includes('session dead')) {
      return ErrKind.SESSION_DEAD;
    }
    if (status === 402 || text.includes('credit') || text.includes('balance') || text.includes('余额不足') || text.includes('积分不足')) {
      return ErrKind.HARD_CREDIT;
    }
    if (status === 429 || text.includes('6004') || text.includes('rate limit') || text.includes('frequency')) {
      return ErrKind.SOFT_RATE;
    }
    if (isInvalidImageData(text) || text.includes('image_invalid') || text.includes('invalid image')) {
      return ErrKind.IMAGE_INVALID;
    }
    if (isModelBlockedBody(text) || status === 404) {
      return ErrKind.MODEL_BLOCKED;
    }
    if (text.includes('11128') || text.includes('content') || text.includes('sensitive') || text.includes('violation')) {
      return ErrKind.CONTENT_BLOCKED;
    }
    if (status === 403) {
      return ErrKind.WAF_BLOCK;
    }
    if (text.includes('11140') || text.includes('account blocked') || text.includes('trial not activated')) {
      return ErrKind.ACCOUNT_FAULT;
    }
    if (text.includes('11115') || text.includes('prompt is too long')) {
      return ErrKind.PROMPT_TOO_LONG;
    }
    if (text.includes('11101') || text.includes('unmarshal') || text.includes('bad param')) {
      return ErrKind.BAD_PARAMS;
    }
    if (status >= 500) {
      return ErrKind.SERVER;
    }
    return ErrKind.CLIENT;
  }

  /**
   * 刷新账号 Token
   */
  async refreshToken(account) {
    if (!account.auth?.refreshToken) {
      throw new Error('No refresh token available');
    }

    const base = this.getChatBase(account);
    const url = `${base}${TOKEN_REFRESH_PATH}`;
    const headers = this.buildHeaders(account, false);
    headers['X-Refresh-Token'] = account.auth.refreshToken;
    headers['X-Auth-Refresh-Source'] = 'workbuddy';

    const res = await fetch(url, {
      method: 'POST',
      headers,
      signal: AbortSignal.timeout(15000)
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || (data.code !== 0 && data.code !== 200)) {
      throw new Error(data.msg || `Token 刷新失败 (HTTP ${res.status})`);
    }

    const payload = data.data || {};
    const newAccess = payload.accessToken || payload.access_token;
    const newRefresh = payload.refreshToken || payload.refresh_token || account.auth.refreshToken;
    const expiresIn = payload.expiresIn || 7200;

    if (!newAccess) {
      throw new Error('未返回有效 accessToken');
    }

    account.auth.accessToken = newAccess;
    account.auth.refreshToken = newRefresh;
    account.auth.expiresAt = Date.now() + expiresIn * 1000;
    account.updatedAt = Date.now();

    if (typeof this.onTokenRefresh === 'function') {
      try {
        this.onTokenRefresh(account);
      } catch (_) {}
    }

    return account;
  }

  /**
   * 拉取账号余额与套餐信息
   */
  async fetchBalance(account) {
    const isGlobal = account.auth?.realm === 'global';
    const base = this.getBillingBase(account);
    const primaryPath = isGlobal ? BILLING_METER_PATH_GLOBAL : BILLING_METER_PATH_CN;
    const fallbackPath = isGlobal ? BILLING_METER_PATH_CN : BILLING_METER_PATH_GLOBAL;

    const doRequest = async (path) => {
      const url = `${base}${path}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: this.buildHeaders(account, false),
        body: JSON.stringify({}),
        signal: AbortSignal.timeout(10000)
      });
      const data = await res.json().catch(() => ({}));
      return { res, data };
    };

    let { res, data } = await doRequest(primaryPath);

    // 1. 若返回 401 或 token 失效代码 (如 12153, 10002, 401)，且有 refreshToken 则自动续期后重试
    const isAuthErr = res.status === 401 || data.code === 401 || data.code === 12153 || data.code === 10002 ||
      (typeof data.msg === 'string' && /token|auth|expire|unauthorized/i.test(data.msg));

    if (isAuthErr && account.auth?.refreshToken) {
      try {
        await this.refreshToken(account);
        const retry = await doRequest(primaryPath);
        res = retry.res;
        data = retry.data;
      } catch (err) {
        throw new Error(`Token 已失效且刷新失败: ${err.message}`);
      }
    }

    // 2. 若返回 404，尝试备用路径
    if (res.status === 404) {
      const fallback = await doRequest(fallbackPath);
      if (fallback.res.ok) {
        res = fallback.res;
        data = fallback.data;
      }
    }

    if (!res.ok || (data.code !== 0 && data.code !== 200)) {
      throw new Error(data.msg || `查询余额失败 (${res.status})`);
    }

    const raw = data.data || {};
    let remain = 0;
    let total = 0;
    let used = 0;
    let baseRemain = 0;
    let bonusRemain = 0;
    let purchasedRemain = 0;
    let expiringRemain = 0;
    let packCount = 0;
    let activePackCount = 0;
    const packages = [];
    const nowMs = Date.now();
    const soonWindowMs = 7 * 86400 * 1000;

    // 1. 优先解析官方腾讯云底层计量账单结构 (Response.Data.Accounts)
    const accounts = raw.Response?.Data?.Accounts || data.Response?.Data?.Accounts || [];
    if (Array.isArray(accounts) && accounts.length > 0) {
      for (const a of accounts) {
        packCount++;
        let pRemain = 0;
        let pSize = 0;
        let pUsed = 0;
        if (a.CycleCapacitySize > 0) {
          pRemain = Math.max(0, Math.min(a.CycleCapacitySize, a.CycleCapacityRemain ?? 0));
          pSize = a.CycleCapacitySize;
          pUsed = a.CycleCapacityUsed ?? Math.max(0, pSize - pRemain);
        } else {
          pRemain = Math.max(0, a.CapacityRemain ?? 0);
          pSize = a.CapacitySize ?? pRemain;
          pUsed = a.CapacityUsed ?? Math.max(0, pSize - pRemain);
        }

        remain += pRemain;
        total += pSize;
        used += pUsed;

        const pkgName = String(a.PackageName || '积分包');
        const lowName = pkgName.toLowerCase();
        if (lowName.includes('subscription') || lowName.includes('订阅') || lowName.includes('free plan') || lowName.includes('base')) {
          baseRemain += pRemain;
        } else if (lowName.includes('bonus') || lowName.includes('gift') || lowName.includes('试用') || lowName.includes('赠送') || lowName.includes('活动') || lowName.includes('trial')) {
          bonusRemain += pRemain;
        } else {
          purchasedRemain += pRemain;
        }

        const expireStr = a.CycleEndTime || a.ExpiredTime || '';
        if (expireStr && pRemain > 0) {
          const expMs = Date.parse(expireStr);
          if (!Number.isNaN(expMs) && expMs > nowMs && expMs - nowMs <= soonWindowMs) {
            expiringRemain += pRemain;
          }
        }

        if (pRemain > 0 || (a.Status !== 3 && pSize > 0)) {
          activePackCount++;
          packages.push({
            name: pkgName,
            remain: pRemain,
            used: pUsed,
            size: pSize,
            expireTime: expireStr
          });
        }
      }
    } else if (Array.isArray(raw.userPackageList)) {
      for (const p of raw.userPackageList) {
        packCount++;
        const pr = p.remain || 0;
        const pu = p.used || 0;
        remain += pr;
        used += pu;
        total += pr + pu;
        bonusRemain += pr;
        if (pr > 0) activePackCount++;
        packages.push({
          name: p.packageName || p.name || '积分包',
          remain: pr,
          used: pu,
          size: pr + pu,
          expireTime: p.expireTime || p.expiresAt || ''
        });
      }
    } else {
      remain = raw.totalRemain ?? raw.remain ?? raw.points ?? 0;
      total = remain;
    }

    return {
      remain: Math.round(remain * 100) / 100,
      total: Math.round(total * 100) / 100,
      used: Math.round(used * 100) / 100,
      baseRemain: Math.round(baseRemain * 100) / 100,
      bonusRemain: Math.round(bonusRemain * 100) / 100,
      purchasedRemain: Math.round(purchasedRemain * 100) / 100,
      expiringRemain: Math.round(expiringRemain * 100) / 100,
      packCount,
      activePackCount,
      packages,
      fetchedAt: Date.now()
    };
  }

  /**
   * 向上游发现真实可用模型（合并 V2 / V3 / CN 模型目录）
   */
  async fetchModels(account) {
    const isGlobal = account.auth?.realm === 'global';
    const base = this.getChatBase(account);
    const prefix = isGlobal ? 'global:' : 'cn:';
    const models = [];
    const seen = new Set();

    const addItem = (item) => {
      if (!item || typeof item !== 'object') return;
      const bare = item.id || item.model || item.name;
      if (!bare || item.disabled) return;
      const fullId = /^(cn:|global:)/i.test(bare) ? bare : `${prefix}${bare}`;
      if (seen.has(fullId)) return;
      seen.add(fullId);

      const rateInfo = parseCreditMultiplier(item.credits || item.rate, item.tags);
      const supportedEfforts = Array.isArray(item.reasoning?.supportedEfforts)
        ? item.reasoning.supportedEfforts
        : (item.reasoning?.effort ? [item.reasoning.effort] : (item.supportedEfforts || []));
      const defaultEffort = item.reasoning?.defaultEffort || item.reasoning?.effort || '';

      const rawCtx = Number(item.maxInputTokens || item.maxAllowedSize || item.contextWindow || item.context_length || 0);
      const rawMax = Number(item.maxOutputTokens || item.maxTokens || 0);
      const limits = this.modelCatalog.lookupLimits(bare, rawCtx, rawMax);

      models.push({
        id: fullId,
        bareId: bare,
        realm: isGlobal ? 'global' : 'cn',
        name: item.displayName || item.name || bare,
        description: item.descriptionZh || item.descriptionEn || item.description || '',
        credits: rateInfo.credits,
        rate: rateInfo.rate,
        multiplier: rateInfo.multiplier,
        isFree: rateInfo.isFree,
        badge: rateInfo.badge,
        vendor: item.vendor || '',
        tags: Array.isArray(item.tags) ? item.tags : [],
        isDefault: Boolean(item.isDefault),
        supportsImages: Boolean(item.supportsImages ?? item.multimodal ?? !item.disabledMultimodal),
        supportsReasoning: Boolean(item.supportsReasoning),
        supportsToolCall: Boolean(item.supportsToolCall ?? true),
        onlyReasoning: Boolean(item.onlyReasoning),
        contextWindow: limits.contextWindow,
        maxTokens: limits.maxTokens,
        supportedEfforts,
        defaultEffort
      });
    };

    const probeGet = async (path) => {
      let res = await fetch(`${base}${path}`, {
        headers: this.buildHeaders(account, false),
        signal: AbortSignal.timeout(10000)
      });
      if (res.status === 401 && account.auth?.refreshToken) {
        try {
          await this.refreshToken(account);
          res = await fetch(`${base}${path}`, {
            headers: this.buildHeaders(account, false),
            signal: AbortSignal.timeout(10000)
          });
        } catch (_) {}
      }
      if (!res.ok) return null;
      return await res.json().catch(() => null);
    };

    // 1. 首选官方实时倍率目录端点 (/v2/enterprises/personal/models 及 /console fallback)
    for (const path of [ENTERPRISE_MODELS_PATH, ENTERPRISE_MODELS_FALLBACK_PATH]) {
      try {
        const json = await probeGet(path);
        if (json && (json.code === 0 || json.code === 200 || Array.isArray(json.data) || json.data?.models)) {
          const list = json.data?.models || (Array.isArray(json.data) ? json.data : (json.models || []));
          for (const item of list) addItem(item);
          if (models.length > 0) break;
        }
      } catch (_) {}
    }

    // 2. 兜底探测 /v3/config、/v2/models 与 /v2/plugin/auth/models
    if (models.length === 0) {
      for (const path of [V3_CONFIG_PATH, '/v2/models', CN_MODELS_PATH]) {
        try {
          const json = await probeGet(path);
          if (!json) continue;
          const list = json.data?.config?.models || json.data?.models || json.models || (Array.isArray(json.data) ? json.data : []);
          for (const item of list) addItem(item);
        } catch (_) {}
      }
    }

    return models;
  }

  /**
   * 发起流式 Chat Completions 调用
   */
  async chatStream(account, reqBody, signal, meta = {}) {
    const realm = account.auth?.realm || 'cn';
    const uid = account.account?.uid || '';
    const bareModel = (reqBody.model || '').replace(/^(cn:|global:|solo:|trae:)/i, '');

    // 检查是否为专属视频大模型直出请求
    if (isVideoModel(bareModel)) {
      return {
        isVideo: true,
        executeVideo: (onChunk) => executeVideoChatBridge(account, bareModel, reqBody.messages, onChunk)
      };
    }

    // 视觉与多模态预处理
    const preparedMessages = await prepareMessagesWithVision(reqBody.messages);

    // 解析或生成统一会话标识符（防 11128 conversation id missing）
    const conversationId =
      reqBody.conversation_id ||
      reqBody.conversationId ||
      meta.conversationId ||
      crypto.randomUUID();
    const convReqId = meta.conversationRequestId || crypto.randomBytes(16).toString('hex');

    // 组装完整兼容官方渠道校验、风控脱敏、工具与思考协议的请求体
    const upstreamBody = prepareOutboundPayload(reqBody, preparedMessages, {
      realm,
      uid,
      bareModel,
      conversationId
    });

    const base = this.getChatBase(account);
    const url = `${base}${CHAT_COMPLETIONS_PATH}`;
    const chatMeta = {
      conversationId,
      conversationRequestId: convReqId,
      traceId: meta.traceId || convReqId
    };
    const headers = this.buildHeaders(account, true, chatMeta);

    let res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(upstreamBody),
      signal
    });

    // 若返回 401，尝试刷新 Token 后重试一次
    if (res.status === 401 && account.auth?.refreshToken) {
      try {
        await this.refreshToken(account);
        const retryHeaders = this.buildHeaders(account, true, chatMeta);
        res = await fetch(url, {
          method: 'POST',
          headers: retryHeaders,
          body: JSON.stringify(upstreamBody),
          signal
        });
      } catch (_) {}
    }

    if (!res.ok) {
      let errText = await res.text().catch(() => '');
      let kind = this.classifyError(res.status, errText);

      // 若遇到内容策略 / 11128 拦截，自动使用中性精简 System Prompt 进行降级自愈重试一次
      if (kind === ErrKind.CONTENT_BLOCKED || res.status === 403) {
        const degradedMsgs = upstreamBody.messages.map((m) =>
          m.role === 'system' ? { ...m, content: DEGRADED_SYSTEM_PROMPT } : m
        );
        const degradedBody = { ...upstreamBody, messages: degradedMsgs };
        try {
          const degRes = await fetch(url, {
            method: 'POST',
            headers: this.buildHeaders(account, true, chatMeta),
            body: JSON.stringify(degradedBody),
            signal
          });
          if (degRes.ok) {
            return {
              ok: true,
              degradedTriggered: true,
              status: degRes.status,
              response: degRes,
              bodyStream: degRes.body
            };
          }
          errText = await degRes.text().catch(() => errText);
          kind = this.classifyError(degRes.status, errText);
        } catch (_) {}
      }

      return {
        ok: false,
        status: res.status,
        kind,
        message: errText || `上游返回 HTTP ${res.status}`
      };
    }

    return {
      ok: true,
      status: res.status,
      response: res,
      bodyStream: res.body
    };
  }
}

/**
 * model-catalog.js - 4 级模型上下文/输出上限补齐 (上游实时值 > 静态先验表 > 本地缓存 > models.dev 异步兜底)
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const MODELS_DEV_URL = 'https://models.dev/api.json';
const FETCH_COOLDOWN_MS = 5 * 60 * 1000;
const NEGATIVE_TTL_MS = 24 * 60 * 60 * 1000;
const DEFAULT_CONTEXT_WINDOW = 200000;

const OFFICIAL_VENDOR_PRIORITY = [
  'anthropic',
  'openai',
  'google',
  'deepseek',
  'zai',
  'z-ai',
  'moonshotai',
  'minimax',
  'alibaba',
  'tencent'
];

const CURATED_LIMITS = [
  { match: /^claude-/, ctx: 200000, max: 64000 },
  { match: /^gpt-5|^gpt-6/, ctx: 400000, max: 128000 },
  { match: /^o3|^o4/, ctx: 200000, max: 100000 },
  { match: /^gemini-3|^gemini-2\.5/, ctx: 1048576, max: 65536 },
  { match: /^deepseek-/, ctx: 131072, max: 16384 },
  { match: /^glm-/, ctx: 200000, max: 32768 },
  { match: /^kimi-/, ctx: 262144, max: 32768 },
  { match: /^minimax-/, ctx: 200000, max: 32768 },
  { match: /^qwen/, ctx: 262144, max: 32768 },
  { match: /^hy|^hunyuan/, ctx: 131072, max: 16384 }
];

function stripPrefix(id = '') {
  return String(id || '').replace(/^(cn:|global:|solo:|trae:)/i, '').trim().toLowerCase();
}

export class ModelCatalogEnricher {
  constructor(options = {}) {
    this.dshHome = options.dshHome || process.env.DSH_HOME || path.join(os.homedir(), '.dsh');
    this.cachePath = path.join(this.dshHome, '.workbuddy-models-cache.json');
    this.fetchFn = options.fetchFn || fetch;
    this.cache = {}; // bareLower -> { ctx, max, updatedAt }
    this.negatives = new Map(); // bareLower -> expiresAt
    this.lastFetchAt = 0;
    this.fetchingPromise = null;
    this._load();
  }

  _load() {
    try {
      if (fs.existsSync(this.cachePath)) {
        const raw = JSON.parse(fs.readFileSync(this.cachePath, 'utf8'));
        if (raw && typeof raw.models === 'object') {
          this.cache = raw.models;
        }
      }
    } catch (_) {}
  }

  _save() {
    try {
      if (!fs.existsSync(this.dshHome)) {
        fs.mkdirSync(this.dshHome, { recursive: true });
      }
      fs.writeFileSync(
        this.cachePath,
        JSON.stringify({ updatedAt: Date.now(), models: this.cache }, null, 2),
        'utf8'
      );
    } catch (_) {}
  }

  lookupLimits(modelId, upstreamCtx = 0, upstreamMax = 0) {
    if (upstreamCtx > 0) {
      return {
        contextWindow: upstreamCtx,
        maxTokens: upstreamMax > 0 ? upstreamMax : 32000
      };
    }

    const bare = stripPrefix(modelId);

    // 2. 本地已缓存的 models.dev 结果
    const cached = this.cache[bare];
    if (cached && cached.ctx > 0) {
      return {
        contextWindow: cached.ctx,
        maxTokens: upstreamMax > 0 ? upstreamMax : (cached.max || 32000)
      };
    }

    // 3. 静态先验规则表
    for (const rule of CURATED_LIMITS) {
      if (rule.match.test(bare)) {
        return {
          contextWindow: rule.ctx,
          maxTokens: upstreamMax > 0 ? upstreamMax : rule.max
        };
      }
    }

    // 4. 异步按需触发 models.dev 全量索引更新（绝不阻塞当前请求）
    this.scheduleModelsDevRefresh(bare);

    return {
      contextWindow: DEFAULT_CONTEXT_WINDOW,
      maxTokens: upstreamMax > 0 ? upstreamMax : 32000
    };
  }

  scheduleModelsDevRefresh(bare) {
    const now = Date.now();
    if (!bare || this.fetchingPromise) return;
    const negExp = this.negatives.get(bare);
    if (negExp && negExp > now) return;
    if (now - this.lastFetchAt < FETCH_COOLDOWN_MS) return;

    this.lastFetchAt = now;
    this.fetchingPromise = this._fetchModelsDev(bare).finally(() => {
      this.fetchingPromise = null;
    });
  }

  async _fetchModelsDev(triggerBare) {
    try {
      const res = await this.fetchFn(MODELS_DEV_URL, {
        headers: { 'Accept': 'application/json', 'User-Agent': 'dsh-workbuddy2api' },
        signal: AbortSignal.timeout(5000)
      });
      if (!res.ok) return;
      const doc = await res.json().catch(() => null);
      if (!doc || typeof doc !== 'object') return;

      const byBare = new Map();
      for (const [providerId, pObj] of Object.entries(doc)) {
        const modelsObj = pObj?.models;
        if (!modelsObj || typeof modelsObj !== 'object') continue;
        const pLower = providerId.toLowerCase();
        const isOfficial = OFFICIAL_VENDOR_PRIORITY.includes(pLower);

        for (const [mKey, mVal] of Object.entries(modelsObj)) {
          const ctx = Number(mVal?.limit?.context || 0);
          const max = Number(mVal?.limit?.output || 0);
          if (ctx <= 0) continue;

          const tail = mKey.includes('/') ? mKey.split('/').pop() : mKey;
          const norm = tail.trim().toLowerCase();
          if (!norm) continue;

          const prev = byBare.get(norm);
          if (!prev || (!prev.isOfficial && isOfficial)) {
            byBare.set(norm, { ctx, max: max > 0 ? max : 32000, isOfficial });
          }
        }
      }

      if (byBare.size > 0) {
        const now = Date.now();
        for (const [k, v] of byBare.entries()) {
          this.cache[k] = { ctx: v.ctx, max: v.max, updatedAt: now };
        }
        if (triggerBare && !this.cache[triggerBare]) {
          this.negatives.set(triggerBare, now + NEGATIVE_TTL_MS);
          if (this.negatives.size > 1000) {
            const first = this.negatives.keys().next().value;
            this.negatives.delete(first);
          }
        }
        this._save();
      }
    } catch (_) {
      // models.dev 不可达时静默降级
    }
  }
}

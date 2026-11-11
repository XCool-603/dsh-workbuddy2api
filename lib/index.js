// src/config.js
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

// src/constants.js
var CN_CHAT_BASE = "https://copilot.tencent.com";
var CN_BILLING_BASE = "https://www.codebuddy.cn";
var GLOBAL_BASE = "https://www.workbuddy.ai";
var CHAT_COMPLETIONS_PATH = "/v2/chat/completions";
var TOKEN_REFRESH_PATH = "/v2/plugin/auth/token/refresh";
var CN_MODELS_PATH = "/v2/plugin/auth/models";
var V3_CONFIG_PATH = "/v3/config";
var BILLING_METER_PATH_CN = "/v2/billing/meter/get-user-resource";
var BILLING_METER_PATH_GLOBAL = "/billing/meter/get-user-resource";
var DAILY_CHECKIN_PATH_CN = "/v2/billing/meter/daily-checkin";
var GLOBAL_TRIAL_PATH = "/billing/ide/trial";
var VIDEO_GENERATIONS_PATH = "/v2/videos/generations";
var TRAVEL_STATUS_PATH = "/activity/growth/buddy/travel/status";
var TRAVEL_DEPART_PATH = "/activity/growth/buddy/travel/depart";
var TRAVEL_CLAIM_PATH = "/activity/growth/buddy/travel/claim";
var BUDDY_INFO_PATH = "/activity/growth/buddy/info";
var BUDDY_FIRST_PATH = "/activity/growth/buddy/first";
var BUDDY_AGREEMENT_PATH = "/activity/growth/buddy/agreement";
var STREAK_PATH = "/activity/growth/streak";
var REDEEM_PATH = "/activity/growth/redeem";
var LOTTERY_CHANCES_PATH = "/activity/growth/lottery/chances";
var LOTTERY_DRAW_PATH = "/activity/growth/lottery/draw";
var REPORT_PATH = "/v2/report";
var HEATMAP_PATH = "/activity/growth/heatmap";
var MAKEUP_CARD_PATH = "/activity/growth/makeup-cards/use";
var CLAIM_GIFT_PATH = "/billing/meter/claim-gift";
var CLAIM_COMPENSATION_PATH = "/billing/meter/claim-compensation";
var PROVIDER_NAME = "workbuddy";
var PROVIDER_ALIAS = "workbuddy2api";
var SETTINGS_NS = "settings.workbuddy2api";
var DEFAULT_GATEWAY_PORT = 7863;
var SSE_PING_INTERVAL_MS = 3e3;
var ErrKind = {
  NONE: "none",
  HARD_CREDIT: "hard_credit",
  // 余额不足 (402)
  SOFT_RATE: "soft_rate",
  // 429 / 6004 软限流
  SESSION_DEAD: "session_dead",
  // 401 凭证失效
  NOT_FOUND: "not_found",
  // 404
  SERVER: "server",
  // 5xx
  CONTENT_BLOCKED: "content_blocked",
  // 400 敏感词/策略拦截
  BAD_PARAMS: "bad_params",
  // 400 参数格式
  ACCOUNT_FAULT: "account_fault",
  // 11140 账号被禁
  PROMPT_TOO_LONG: "prompt_too_long",
  // 11115
  WAF_BLOCK: "waf_block",
  // 403
  CLIENT: "client"
};
var CN_EFFORT_FALLBACK = {
  "deepseek-v4-flash": { efforts: ["low", "high", "max"], defaultEffort: "high" },
  "deepseek-v4.1-flash": { efforts: ["low", "high", "max"], defaultEffort: "high" },
  "deepseek-v4-pro": { efforts: ["low", "high", "xhigh"], defaultEffort: "high" },
  "hy4-preview": { efforts: ["high"], defaultEffort: "high" },
  "hy4-preview-x": { efforts: ["high"], defaultEffort: "high" },
  "hy4free": { efforts: ["high"], defaultEffort: "high" },
  "hy3": { efforts: ["low", "high"], defaultEffort: "high" },
  "hy3-x": { efforts: ["low", "high"], defaultEffort: "high" },
  "glm-5.3": { efforts: ["low", "high", "max"], defaultEffort: "high" },
  "glm-5.3-flash": { efforts: ["low", "high", "max"], defaultEffort: "high" },
  "glm-5.2": { efforts: ["high", "xhigh"], defaultEffort: "high" },
  "glm-5.1": { efforts: ["medium"], defaultEffort: "medium" },
  "glm-5v-turbo": { efforts: ["medium"], defaultEffort: "medium" },
  "kimi-k3-1": { efforts: ["medium"], defaultEffort: "medium" },
  "kimi-k2.7": { efforts: ["medium"], defaultEffort: "medium" },
  "kimi-k2.6": { efforts: ["medium"], defaultEffort: "medium" },
  "minimax-m3": { efforts: ["medium"], defaultEffort: "medium" }
};
var GLOBAL_EFFORT_FALLBACK = {
  "fast-model": { efforts: ["medium"], defaultEffort: "medium" },
  "balanced-model": { efforts: ["medium"], defaultEffort: "medium" },
  "primary-model": { efforts: ["high"], defaultEffort: "high" },
  "hy4-preview-f": { efforts: ["high"], defaultEffort: "high" },
  "hy3": { efforts: ["low", "high"], defaultEffort: "high" },
  "deepseek-v4.1-flash": { efforts: ["high"], defaultEffort: "high" },
  "gpt-6-astra": { efforts: ["low", "medium", "high", "xhigh", "max"], defaultEffort: "high" },
  "gpt-5.6-sol": { efforts: ["low", "medium", "high", "xhigh", "max"], defaultEffort: "high" },
  "gpt-5.6-terra": { efforts: ["low", "medium", "high", "xhigh", "max"], defaultEffort: "high" },
  "gpt-5.6-luna": { efforts: ["low", "medium", "high", "xhigh", "max"], defaultEffort: "high" },
  "gpt-5.5": { efforts: ["low", "medium", "high", "xhigh"], defaultEffort: "high" },
  "gpt-5.4": { efforts: ["low", "medium", "high", "xhigh"], defaultEffort: "high" },
  "gpt-5.3-codex": { efforts: ["medium"], defaultEffort: "medium" },
  "gemini-3.5-flash": { efforts: ["medium"], defaultEffort: "medium" },
  "glm-5.3": { efforts: ["low", "high", "max"], defaultEffort: "high" },
  "glm-5.2": { efforts: ["high", "xhigh"], defaultEffort: "high" },
  "kimi-k3": { efforts: ["medium"], defaultEffort: "medium" },
  "kimi-k2.6": { efforts: ["medium"], defaultEffort: "medium" }
};
var STATIC_MODELS = [
  // 智能路由池
  {
    id: "auto-free",
    name: "Auto Free (\u667A\u80FD\u514D\u8D39\u6A21\u578B\u8DEF\u7531\u6C60)",
    realm: "auto",
    contextWindow: 1e6,
    maxTokens: 128e3,
    supportsImages: true,
    rate: "\u514D\u8D39",
    badge: "\u667A\u80FD\u8DEF\u7531"
  },
  // Global 国际版模型
  {
    id: "global:deepseek-v4.1-flash",
    name: "DeepSeek-V4.1-Flash (Global)",
    realm: "global",
    contextWindow: 1e6,
    maxTokens: 128e3,
    supportsImages: true,
    rate: "x0.05",
    badge: "\u63A8\u8350"
  },
  {
    id: "global:glm-5.3-flash",
    name: "GLM-5.3-Flash (Global)",
    realm: "global",
    contextWindow: 1e6,
    maxTokens: 32e3,
    supportsImages: true,
    rate: "x0.05"
  },
  {
    id: "global:gpt-6-astra",
    name: "GPT-6-Astra (Global)",
    realm: "global",
    contextWindow: 1e6,
    maxTokens: 128e3,
    supportsImages: true,
    rate: "x1.00",
    badge: "\u65D7\u8230"
  },
  {
    id: "global:gpt-5.6-sol",
    name: "GPT-5.6-Sol (Global)",
    realm: "global",
    contextWindow: 1e6,
    maxTokens: 128e3,
    supportsImages: false,
    rate: "x0.50"
  },
  {
    id: "global:gemini-3.5-flash",
    name: "Gemini-3.5-Flash (Global)",
    realm: "global",
    contextWindow: 1e6,
    maxTokens: 65536,
    supportsImages: true,
    rate: "x0.10"
  },
  {
    id: "global:primary-model",
    name: "Primary \u4E3B\u529B (Global)",
    realm: "global",
    contextWindow: 272e3,
    maxTokens: 72e3,
    supportsImages: true,
    rate: "\u4E3B\u529B"
  },
  {
    id: "global:fast-model",
    name: "Fast \u6781\u901F (Global)",
    realm: "global",
    contextWindow: 2e5,
    maxTokens: 32e3,
    supportsImages: false,
    rate: "\u6781\u901F"
  },
  {
    id: "global:balanced-model",
    name: "Balanced \u5747\u8861 (Global)",
    realm: "global",
    contextWindow: 256e3,
    maxTokens: 32e3,
    supportsImages: true,
    rate: "\u5747\u8861"
  },
  // CN 国内版模型
  {
    id: "cn:hy4free",
    name: "Hunyuan-4-Free (CN)",
    realm: "cn",
    contextWindow: 96e4,
    maxTokens: 64e3,
    supportsImages: true,
    rate: "x0.00",
    badge: "\u9650\u65F6\u514D\u8D39"
  },
  {
    id: "cn:deepseek-v4.1-flash",
    name: "DeepSeek-V4.1-Flash (CN)",
    realm: "cn",
    contextWindow: 1e6,
    maxTokens: 128e3,
    supportsImages: true,
    rate: "x0.05"
  },
  {
    id: "cn:deepseek-v4-pro",
    name: "DeepSeek-V4-Pro (CN)",
    realm: "cn",
    contextWindow: 176e3,
    maxTokens: 24e3,
    supportsImages: true,
    rate: "x1.00"
  },
  {
    id: "cn:glm-5.3",
    name: "GLM-5.3 (CN)",
    realm: "cn",
    contextWindow: 1e6,
    maxTokens: 32e3,
    supportsImages: true,
    rate: "x0.30"
  },
  {
    id: "cn:glm-5.3-flash",
    name: "GLM-5.3-Flash (CN)",
    realm: "cn",
    contextWindow: 1e6,
    maxTokens: 32e3,
    supportsImages: true,
    rate: "x0.05"
  },
  {
    id: "cn:kimi-k3-1",
    name: "Kimi-K3-1 (CN)",
    realm: "cn",
    contextWindow: 2e5,
    maxTokens: 32e3,
    supportsImages: false,
    rate: "x0.30"
  },
  {
    id: "cn:minimax-m3",
    name: "MiniMax-M3 (CN)",
    realm: "cn",
    contextWindow: 2e5,
    maxTokens: 32e3,
    supportsImages: false,
    rate: "x0.20"
  },
  // 视频生成大模型
  {
    id: "kling-video-v3",
    name: "Kling 3.0 \u53EF\u7075\u89C6\u9891\u76F4\u51FA",
    realm: "video",
    contextWindow: 8192,
    maxTokens: 2048,
    supportsImages: true,
    rate: "\u89C6\u9891",
    badge: "\u53EF\u70753.0"
  },
  {
    id: "minimax-video-h3",
    name: "MiniMax-H3 \u6D77\u87BA\u89C6\u9891\u76F4\u51FA",
    realm: "video",
    contextWindow: 8192,
    maxTokens: 2048,
    supportsImages: true,
    rate: "\u89C6\u9891",
    badge: "\u6D77\u87BAH3"
  }
];
var DEFAULT_MODEL_ALIASES = {
  "deepseek-chat": "global:deepseek-v4.1-flash",
  "deepseek-reasoner": "cn:deepseek-v4-pro",
  "gpt-4o": "global:gpt-6-astra",
  "gpt-4o-mini": "global:deepseek-v4.1-flash",
  "claude-3-5-sonnet": "global:primary-model",
  "claude-3-7-sonnet": "global:gpt-6-astra",
  "gemini-flash": "global:gemini-3.5-flash",
  "kling-v3-std": "kling-video-v3",
  "kling-v3-pro": "kling-video-v3",
  "keling": "kling-video-v3",
  "hailuo": "minimax-video-h3"
};

// src/config.js
var defaultConfig = {
  authDir: "",
  gatewayPort: 7863,
  apiKey: "",
  maxInFlightCN: 3,
  maxInFlightGlobal: 2,
  queueTimeoutMs: 6e4,
  autoCheckin: true,
  autoTravel: true,
  autoRefreshToken: true,
  promptMode: "none",
  // 'none' | 'passthrough' | 'append' | 'replace' | 'custom'
  promptText: "",
  proxy: "",
  enabledModels: [],
  aliases: { ...DEFAULT_MODEL_ALIASES },
  freeModels: ["global:deepseek-v4.1-flash", "global:glm-5.3-flash", "cn:hy4free"]
};
function unwrapConfig(raw) {
  if (!raw || typeof raw !== "object") {
    return { ...defaultConfig, aliases: { ...defaultConfig.aliases } };
  }
  return {
    ...defaultConfig,
    ...raw,
    aliases: {
      ...DEFAULT_MODEL_ALIASES,
      ...raw.aliases || {}
    }
  };
}
var ConfigStore = class {
  constructor(initialConfig = {}, options = {}) {
    const optHome = typeof options === "string" ? options : options?.dshHome;
    this.dshHome = optHome || process.env.DSH_HOME || path.join(os.homedir(), ".dsh");
    this.configPath = path.join(this.dshHome, ".workbuddy2api-config.json");
    const override = initialConfig && typeof initialConfig === "object" ? initialConfig : {};
    this.data = unwrapConfig(override);
    this.load(override);
  }
  load(override = {}) {
    try {
      if (fs.existsSync(this.configPath)) {
        const disk = JSON.parse(fs.readFileSync(this.configPath, "utf8"));
        this.data = unwrapConfig({ ...override, ...disk });
      }
    } catch (e) {
      console.warn("[config-store] \u8BFB\u53D6\u6301\u4E45\u5316\u914D\u7F6E\u5F02\u5E38:", e.message);
    }
    return this.data;
  }
  get(key) {
    return this.data[key];
  }
  getAll() {
    return {
      ...this.data,
      aliases: { ...this.data.aliases },
      enabledModels: [...this.data.enabledModels || []],
      freeModels: [...this.data.freeModels || []]
    };
  }
  update(patch = {}) {
    const next = { ...this.data };
    for (const [k, v] of Object.entries(patch)) {
      if (v === void 0) continue;
      if (k === "aliases" && v && typeof v === "object") {
        next.aliases = { ...v };
      } else if (k === "enabledModels" && Array.isArray(v)) {
        next.enabledModels = [...v];
      } else if (k === "freeModels" && Array.isArray(v)) {
        next.freeModels = [...v];
      } else if (k in defaultConfig) {
        next[k] = v;
      }
    }
    this.data = next;
    this.save();
    return this.getAll();
  }
  save() {
    try {
      if (!fs.existsSync(this.dshHome)) {
        fs.mkdirSync(this.dshHome, { recursive: true });
      }
      fs.writeFileSync(this.configPath, JSON.stringify(this.data, null, 2), { mode: 384 });
    } catch (err) {
      console.warn("[config-store] \u4FDD\u5B58\u914D\u7F6E\u5931\u8D25:", err.message);
    }
  }
};

// src/pool/account-store.js
import fs2 from "node:fs";
import path2 from "node:path";
import os2 from "node:os";
function parseJWTClaims(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - b64.length % 4);
    const decoded = Buffer.from(b64 + pad, "base64").toString("utf8");
    return JSON.parse(decoded);
  } catch (_) {
    return null;
  }
}
var AccountStore = class {
  constructor(options = {}) {
    this.dshHome = options.dshHome || process.env.DSH_HOME || path2.join(os2.homedir(), ".dsh");
    this.storePath = path2.join(this.dshHome, ".workbuddy2api-accounts.json");
    this.authDir = options.authDir || "";
    this.skipDiscovery = Boolean(options.skipDiscovery);
    this.accounts = /* @__PURE__ */ new Map();
    this.activeUid = null;
    this.init();
  }
  init() {
    try {
      if (fs2.existsSync(this.storePath)) {
        const raw = JSON.parse(fs2.readFileSync(this.storePath, "utf8"));
        if (Array.isArray(raw.accounts)) {
          for (const acc of raw.accounts) {
            if (acc.account?.uid) {
              acc.disabled = Boolean(acc.disabled);
              acc.disabledReason = acc.disabledReason || "";
              this.accounts.set(acc.account.uid, acc);
            }
          }
        }
        if (raw.activeUid) {
          this.activeUid = raw.activeUid;
        }
      }
    } catch (e) {
      console.warn("[account-store] \u8BFB\u53D6\u4E3B\u5B58\u50A8\u5F02\u5E38:", e.message);
    }
    if (!this.skipDiscovery) {
      const probeDirs = [
        this.authDir,
        path2.join(this.dshHome, "workbuddy2api-auths"),
        "c:\\Work\\workbody\\workbuddy2api\\auths",
        path2.join(process.cwd(), "auths")
      ].filter(Boolean);
      for (const dir of [...new Set(probeDirs)]) {
        this.importFromAuthDir(dir);
      }
      this.importFromCodeBuddyCli();
    }
    if ((!this.activeUid || !this.accounts.has(this.activeUid)) && this.accounts.size > 0) {
      const enabledFirst = this.getAll().find((a) => !a.disabled);
      this.activeUid = enabledFirst?.account?.uid || this.accounts.keys().next().value;
    }
    this.save();
  }
  importFromAuthDir(dirPath) {
    if (!dirPath || !fs2.existsSync(dirPath)) return;
    try {
      const files = fs2.readdirSync(dirPath).filter((f) => f.endsWith(".json"));
      for (const file of files) {
        try {
          const filePath = path2.join(dirPath, file);
          const raw = JSON.parse(fs2.readFileSync(filePath, "utf8"));
          const uid = raw.account?.uid || raw.uid;
          if (uid && !this.accounts.has(uid)) {
            const realm = raw.auth?.realm || raw.realm || (file.includes("cn") ? "cn" : "global");
            const acc = {
              account: {
                uid,
                nickname: raw.account?.nickname || raw.nickname || `Account-${uid.slice(0, 8)}`,
                enterpriseId: raw.account?.enterpriseId || raw.enterpriseId || "",
                provider: raw.account?.provider || raw.provider || ""
              },
              auth: {
                realm,
                accessToken: raw.auth?.accessToken || raw.accessToken || "",
                refreshToken: raw.auth?.refreshToken || raw.refreshToken || "",
                expiresAt: raw.auth?.expiresAt || raw.expiresAt || 0,
                domain: raw.auth?.domain || raw.domain || ""
              },
              disabled: Boolean(raw.disabled),
              disabledReason: raw.disabledReason || "",
              source: "workbuddy2api-auths",
              updatedAt: Date.now()
            };
            this.accounts.set(uid, acc);
          }
        } catch (_) {
        }
      }
    } catch (err) {
      console.warn("[account-store] \u5BFC\u5165 auths \u76EE\u5F55\u5F02\u5E38:", err.message);
    }
  }
  importFromCodeBuddyCli() {
    const localAppData = process.env.LOCALAPPDATA || path2.join(os2.homedir(), "AppData", "Local");
    const cliAuthDir = path2.join(localAppData, "CodeBuddyExtension", "Data", "Public", "auth");
    if (!fs2.existsSync(cliAuthDir)) return;
    try {
      const files = fs2.readdirSync(cliAuthDir).filter((f) => f.endsWith(".info"));
      for (const f of files) {
        try {
          const content = fs2.readFileSync(path2.join(cliAuthDir, f), "utf8");
          const data = JSON.parse(content);
          const uid = data.uid || data.account?.uid;
          const token = data.token || data.accessToken || data.access_token;
          if (uid && token && !this.accounts.has(uid)) {
            this.accounts.set(uid, {
              account: {
                uid,
                nickname: data.nickname || data.userName || "CodeBuddy-CLI",
                enterpriseId: data.enterpriseId || ""
              },
              auth: {
                realm: data.realm || "cn",
                accessToken: token,
                refreshToken: data.refreshToken || data.refresh_token || "",
                expiresAt: Date.now() + 36e5 * 2,
                domain: data.domain || ""
              },
              disabled: false,
              disabledReason: "",
              source: "codebuddy-cli",
              updatedAt: Date.now()
            });
          }
        } catch (_) {
        }
      }
    } catch (_) {
    }
  }
  save() {
    try {
      if (!fs2.existsSync(this.dshHome)) {
        fs2.mkdirSync(this.dshHome, { recursive: true });
      }
      const data = {
        activeUid: this.activeUid,
        accounts: Array.from(this.accounts.values())
      };
      fs2.writeFileSync(this.storePath, JSON.stringify(data, null, 2), { mode: 384 });
    } catch (err) {
      console.warn("[account-store] \u4FDD\u5B58\u8D26\u53F7\u5B58\u50A8\u5931\u8D25:", err.message);
    }
  }
  getAll() {
    return Array.from(this.accounts.values());
  }
  get(uid) {
    return this.accounts.get(uid);
  }
  getActive() {
    if (this.activeUid && this.accounts.has(this.activeUid)) {
      return this.accounts.get(this.activeUid);
    }
    const first = this.accounts.values().next().value;
    return first || null;
  }
  setActive(uid) {
    if (this.accounts.has(uid)) {
      this.activeUid = uid;
      this.save();
      return true;
    }
    return false;
  }
  setDisabled(uid, disabled, reason = "") {
    const acc = this.accounts.get(uid);
    if (!acc) return false;
    acc.disabled = Boolean(disabled);
    acc.disabledReason = disabled ? reason || "\u624B\u52A8\u505C\u7528" : "";
    acc.updatedAt = Date.now();
    this.save();
    return true;
  }
  upsert(account) {
    const uid = account.account?.uid;
    if (!uid) throw new Error("Account must have a valid uid");
    const existing = this.accounts.get(uid);
    const merged = {
      ...existing,
      ...account,
      account: { ...existing?.account || {}, ...account.account },
      auth: { ...existing?.auth || {}, ...account.auth },
      disabled: account.disabled !== void 0 ? Boolean(account.disabled) : Boolean(existing?.disabled),
      disabledReason: account.disabledReason ?? existing?.disabledReason ?? "",
      updatedAt: Date.now()
    };
    this.accounts.set(uid, merged);
    if (!this.activeUid) {
      this.activeUid = uid;
    }
    this.save();
    return merged;
  }
  delete(uid) {
    const deleted = this.accounts.delete(uid);
    if (this.activeUid === uid) {
      this.activeUid = this.accounts.keys().next().value || null;
    }
    this.save();
    return deleted;
  }
};

// src/upstream/travel.js
function getChatBase(account) {
  return account.auth?.realm === "global" ? GLOBAL_BASE : CN_CHAT_BASE;
}
function buildGrowthHeaders(account) {
  const base = getChatBase(account);
  const headers = {
    "Accept": "application/json, text/plain, */*",
    "Content-Type": "application/json",
    "Origin": base,
    "Referer": `${base}/`,
    "X-Requested-With": "XMLHttpRequest",
    "User-Agent": "WorkBuddy/1.2.34 WorkBuddy/1.2.34 CLI/1.2.34"
  };
  if (account.auth?.accessToken) {
    headers["Authorization"] = `Bearer ${account.auth.accessToken}`;
  }
  if (account.account?.uid) {
    headers["X-User-Id"] = account.account.uid;
  }
  if (account.account?.enterpriseId) {
    headers["X-Enterprise-Id"] = account.account.enterpriseId;
  }
  return headers;
}
async function getBuddyInfo(account, fetchFn = fetch) {
  if (account.auth?.realm === "global") return null;
  const base = getChatBase(account);
  const url = `${base}${BUDDY_INFO_PATH}`;
  try {
    const res = await fetchFn(url, {
      method: "GET",
      headers: buildGrowthHeaders(account)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.code !== 0 && data.code !== 200) {
      return null;
    }
    const buddy = data.data?.buddy;
    if (!buddy || typeof buddy !== "object" || !buddy.id) {
      return null;
    }
    return {
      id: buddy.id,
      name: buddy.name || "\u795E\u79D8\u5C0F\u732B"
    };
  } catch (err) {
    return null;
  }
}
async function agreeBuddy(account, fetchFn = fetch) {
  const base = getChatBase(account);
  const url = `${base}${BUDDY_AGREEMENT_PATH}`;
  const res = await fetchFn(url, {
    method: "POST",
    headers: buildGrowthHeaders(account),
    body: JSON.stringify({ agree: true })
  });
  const data = await res.json().catch(() => ({}));
  return res.ok && (data.code === 0 || data.code === 200);
}
async function adoptFirstBuddy(account, fetchFn = fetch) {
  const base = getChatBase(account);
  const url = `${base}${BUDDY_FIRST_PATH}`;
  try {
    const res = await fetchFn(url, {
      method: "POST",
      headers: buildGrowthHeaders(account),
      body: JSON.stringify({})
    });
    const data = await res.json().catch(() => ({}));
    const msg = (data.msg || "").toLowerCase();
    if (res.ok && (data.code === 0 || data.code === 200)) {
      return { ok: true, credit: 300, message: "\u9886\u517B\u7B2C\u4E00\u53EA\u5C0F\u732B\u6210\u529F\uFF0C\u83B7\u5F97 +300 \u79EF\u5206\uFF01" };
    }
    if (res.status === 400 && msg.includes("first_buddy task not completed yet")) {
      return { ok: false, incomplete: true, message: "\u9886\u517B\u524D\u7F6E\u95E8\u69DB\u672A\u8FBE\u6210(\u9700\u5148\u5B8C\u6210\u5BF9\u8BDD\u6D3B\u8DC3\u4E0A\u62A5)" };
    }
    return { ok: false, incomplete: false, message: data.msg || `\u9886\u517B\u8BF7\u6C42\u5931\u8D25 (HTTP ${res.status})` };
  } catch (err) {
    return { ok: false, incomplete: false, message: err.message };
  }
}
async function getTravelStatus(account, fetchFn = fetch) {
  if (account.auth?.realm === "global") {
    return { isGlobal: true, state: "unsupported", message: "\u56FD\u9645\u7248\u8D26\u53F7\u65E0\u732B\u732B\u65C5\u884C\u4F53\u7CFB" };
  }
  const base = getChatBase(account);
  const url = `${base}${TRAVEL_STATUS_PATH}`;
  try {
    const res = await fetchFn(url, {
      method: "GET",
      headers: buildGrowthHeaders(account)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.code !== 0 && data.code !== 200) {
      throw new Error(data.msg || `\u67E5\u8BE2\u65C5\u884C\u72B6\u6001\u5931\u8D25 (HTTP ${res.status})`);
    }
    const d = data.data || {};
    return {
      state: d.state || "idle",
      // idle / traveling / arrived
      dailyLimitReached: Boolean(d.daily_limit_reached),
      recordId: d.record_id || 0,
      rewardCredit: d.reward_credit || 0
    };
  } catch (err) {
    return { state: "error", error: err.message };
  }
}
async function departTravel(account, locationId = 4, fetchFn = fetch) {
  const base = getChatBase(account);
  const url = `${base}${TRAVEL_DEPART_PATH}`;
  const res = await fetchFn(url, {
    method: "POST",
    headers: buildGrowthHeaders(account),
    body: JSON.stringify({ location_id: locationId })
  });
  const data = await res.json().catch(() => ({}));
  if (res.ok && (data.code === 0 || data.code === 200)) {
    return { ok: true, locationId, message: `\u6210\u529F\u6D3E\u51FA\u732B\u732B\u524D\u5F80\u5730\u70B9 ${locationId}\uFF01` };
  }
  return { ok: false, message: data.msg || `\u6D3E\u51FA\u5931\u8D25 (HTTP ${res.status})` };
}
async function claimTravel(account, recordId, fetchFn = fetch) {
  const base = getChatBase(account);
  const url = `${base}${TRAVEL_CLAIM_PATH}`;
  const res = await fetchFn(url, {
    method: "POST",
    headers: buildGrowthHeaders(account),
    body: JSON.stringify({ record_id: recordId })
  });
  const data = await res.json().catch(() => ({}));
  if (res.ok && (data.code === 0 || data.code === 200)) {
    const rewardCredit = data.data?.reward_credit || 0;
    return { ok: true, rewardCredit, message: `\u9886\u53D6\u65C5\u884C\u5956\u52B1\u6210\u529F\uFF0C\u83B7\u5F97 +${rewardCredit} \u79EF\u5206\uFF01` };
  }
  return { ok: false, message: data.msg || `\u9886\u53D6\u65C5\u884C\u5956\u52B1\u5931\u8D25 (HTTP ${res.status})` };
}
async function runTravelForAccount(account, fetchFn = fetch) {
  if (account.auth?.realm === "global") {
    return { status: "skipped", reason: "global_account_no_travel" };
  }
  let buddy = await getBuddyInfo(account, fetchFn);
  if (!buddy) {
    await agreeBuddy(account, fetchFn);
    const adoptRes = await adoptFirstBuddy(account, fetchFn);
    if (!adoptRes.ok) {
      return { status: "adopt_failed", detail: adoptRes.message };
    }
    buddy = await getBuddyInfo(account, fetchFn);
  }
  const ts = await getTravelStatus(account, fetchFn);
  if (ts.state === "error") {
    return { status: "status_error", detail: ts.error };
  }
  const results = { buddy, initialStatus: ts, actions: [] };
  if (ts.state === "arrived") {
    const claimRes = await claimTravel(account, ts.recordId, fetchFn);
    results.actions.push({ action: "claim", ...claimRes });
    const freshStatus = await getTravelStatus(account, fetchFn);
    if (freshStatus.state === "idle" && !freshStatus.dailyLimitReached) {
      const departRes = await departTravel(account, 4, fetchFn);
      results.actions.push({ action: "depart", ...departRes });
    }
  } else if (ts.state === "idle") {
    if (ts.dailyLimitReached) {
      results.actions.push({ action: "skip", message: "\u4ECA\u65E5\u6D3E\u51FA\u6B21\u6570\u5DF2\u8FBE\u4E0A\u9650 (00:00 CST \u91CD\u7F6E)" });
    } else {
      const departRes = await departTravel(account, 4, fetchFn);
      results.actions.push({ action: "depart", ...departRes });
    }
  } else if (ts.state === "traveling") {
    results.actions.push({
      action: "skip",
      message: `\u732B\u732B\u6B63\u5728\u65C5\u884C\u4E2D (\u8BB0\u5F55ID: ${ts.recordId})\uFF0C\u7B49\u5F85\u5230\u7AD9`
    });
  }
  return { status: "ok", results };
}

// src/upstream/growth.js
import crypto2 from "node:crypto";

// src/upstream/checkin.js
async function performCheckin(account, fetchFn = fetch) {
  if (!account || !account.auth?.accessToken) {
    return { ok: false, status: "NO_TOKEN", message: "\u8D26\u53F7\u672A\u767B\u5F55\u6216\u65E0\u6709\u6548\u4EE4\u724C" };
  }
  const isGlobal = account.auth?.realm === "global";
  const base = isGlobal ? GLOBAL_BASE : CN_BILLING_BASE;
  const path4 = isGlobal ? GLOBAL_TRIAL_PATH : DAILY_CHECKIN_PATH_CN;
  const url = `${base}${path4}`;
  try {
    const res = await fetchFn(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${account.auth.accessToken}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-User-Id": account.account?.uid || "",
        "X-CodeBuddy-Request": "1",
        "Origin": base,
        "Referer": `${base}/`,
        "User-Agent": "WorkBuddy/5.5.4"
      },
      body: JSON.stringify({})
    });
    const data = await res.json().catch(() => ({}));
    const msg = data.msg || data.message || "";
    const low = msg.toLowerCase();
    if (res.ok && (data.code === 0 || data.code === 200)) {
      return { ok: true, status: "SUCCESS", message: isGlobal ? "\u8BD5\u7528\u989D\u5EA6\u9886\u53D6\u6210\u529F (+Trial)" : "\u7B7E\u5230\u6210\u529F" };
    }
    if (low.includes("\u5DF2\u7B7E\u5230") || low.includes("already") || data.code === 10001 || data.code === 14001 || data.code === 14051) {
      return {
        ok: true,
        status: "ALREADY",
        message: isGlobal ? "\u8BD5\u7528\u52A0\u901F\u5305\u6B64\u524D\u5DF2\u9886\u53D6\u8FC7" : "\u4ECA\u65E5\u5DF2\u5B8C\u6210\u7B7E\u5230"
      };
    }
    return {
      ok: false,
      status: "FAIL",
      message: msg || `\u4E0A\u6E38\u8FD4\u56DE\u9519\u8BEF (HTTP ${res.status}, code: ${data.code})`
    };
  } catch (err) {
    return { ok: false, status: "ERROR", message: `\u7F51\u7EDC\u5F02\u5E38: ${err.message}` };
  }
}

// src/upstream/tasks.js
import crypto from "node:crypto";
var WEB_BASE = "https://www.workbuddy.cn";
var DESKTOP_UA = "WorkBuddy/5.5.6 WorkBuddy/5.5.6 CLI/2.137.1";
var WEB_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36";
var LIBRARY_DOC_URL = "https://www.workbuddy.cn/space/d/o0KWYeynteVv06UnAZqIFm";
var TASK_MAPPING = {
  create_canvas: { kind: "canvas", target: 1, title: "\u521B\u5EFA\u753B\u677F" },
  template_5: { kind: "template", target: 5, title: "\u4F7F\u7528 5 \u4E2A\u6A21\u677F" },
  expert_5: { kind: "expert", target: 5, title: "\u53EC\u5524 5 \u6B21\u4E13\u5BB6" },
  Expert_team_use_3: { kind: "team", target: 3, title: "\u53EC\u5524 3 \u6B21\u4E13\u5BB6\u56E2" },
  skill_1: { kind: "skill", target: 1, title: "\u5C1D\u9C9C\u70ED\u95E8\u6280\u80FD" },
  automation_1: { kind: "automation", target: 1, title: "\u8BBE\u7F6E\u81EA\u52A8\u5316\u4EFB\u52A1" },
  playbook_prompt: { kind: "playbook", target: 1, title: "\u63A2\u7D22\u4F18\u79C0\u7075\u611F" },
  Expert_lighthouse: { kind: "lighthouse", target: 1, title: "\u4F53\u9A8C\u300C\u817E\u8BAF\u8F7B\u91CF\u4E91\u300D\u4E13\u5BB6" },
  Buddy_App: { kind: "buddy5", target: 1, title: "\u4F53\u9A8C WorkBuddy \u300C\u53D1\u73B0\u5E94\u7528\u300D" },
  Buddy_App_QQ: { kind: "buddy5", target: 1, title: "\u4F53\u9A8C\u4F01\u9E45\u6559\u5E08\u52A9\u624B" },
  Hp_Appearance: { kind: "skin", target: 1, title: "\u66F4\u6362\u5916\u89C2\u76AE\u80A4" },
  chat_5: { kind: "chat", target: 5, title: "\u548C AI \u804A\u5929 5 \u6B21" },
  Model_chat_GLM5_2: { kind: "glmchat", target: 1, title: "\u4F53\u9A8C GLM-5.2 \u5BF9\u8BDD" },
  "Model_chat_GLM5.2": { kind: "glmchat", target: 1, title: "\u4F53\u9A8C GLM-5.2 \u5BF9\u8BDD" },
  black_cat: { kind: "cat", target: 3, title: "\u591C\u732B\u5B50\u4EFB\u52A1 (23:00-08:00)" },
  RichMeow_Chat: { kind: "richmeow", target: 1, title: "\u684C\u9762\u7AEF\u5BF9\u8BDD 1 \u6B21" },
  Library_read: { kind: "library", target: 1, title: "\u4F53\u9A8C\u300C\u8D44\u6599\u5E93\u300D" },
  expert_use_maidehao: { kind: "fixed_expert", target: 1, expertId: "ex_GDl31WahyIH0", title: "\u4F53\u9A8C\u300C\u4E2D\u56FD\u7535\u5546\u8FD0\u8425\u4E13\u5BB6\u300D" },
  expert_use_douyinyin: { kind: "fixed_expert", target: 1, expertId: "ex_FbY5nlWTqDod", title: "\u4F53\u9A8C\u300C\u6296\u97F3\u7B56\u7565\u5E08\u300D" },
  expert_use_shangjia_xuanchuan: { kind: "fixed_expert", target: 1, expertId: "ex_Weo3x2EZuSDm", title: "\u4F53\u9A8C\u300C\u5546\u5BB6\u5BA3\u4F20\u9875\u4E0E\u6D77\u62A5\u8BBE\u8BA1\u5E08\u300D" },
  expert_use_bowangwang: { kind: "fixed_expert", target: 1, expertId: "ex_WZY136wV5aMt", title: "\u4F53\u9A8C\u300C\u76F4\u64AD\u7535\u5546\u6559\u7EC3\u300D" },
  WorkBuddy_Valorant: { kind: "fixed_expert", target: 1, expertId: "ex_xQHHD1u5Jkua", title: "\u4F53\u9A8C\u300C\u65E0\u754F\u5951\u7EA6\u62FC\u8C46\u4E13\u5BB6\u300D" },
  wb_wechat_oa_subscribe_task: { unforgeable: true, reason: "\u9700\u5173\u6CE8\u5FAE\u4FE1\u516C\u4F17\u53F7\u5916\u90E8\u56DE\u8C03" },
  Expert_Philanthropy: { unforgeable: true, reason: "\u9700\u771F\u5B9E\u6350\u6B3E" }
};
var DEFAULT_SCENES = [
  { id: "0", name: "\u5E7B\u706F\u7247" },
  { id: "2", name: "\u89C6\u9891\u751F\u6210" },
  { id: "4", name: "\u6DF1\u5EA6\u7814\u7A76" },
  { id: "6", name: "\u6587\u6863\u5904\u7406" },
  { id: "8", name: "\u6570\u636E\u5206\u6790" }
];
var DEFAULT_EXPERTS = [
  { id: "ContentCreator", name: "\u5185\u5BB9\u521B\u4F5C\u4E13\u5BB6" },
  { id: "UiDesigner", name: "UI\u8BBE\u8BA1\u5E08" },
  { id: "DataAnalyticsReporter", name: "\u6570\u636E\u5206\u6790\u62A5\u544A\u5E08" },
  { id: "ChinaEcommerceOperationsExpert", name: "\u4E2D\u56FD\u7535\u5546\u8FD0\u8425\u4E13\u5BB6" },
  { id: "DouyinStrategist", name: "\u6296\u97F3\u7B56\u7565\u5E08" }
];
var DEFAULT_TEAMS = [
  { id: "CloudOpsTeam", name: "\u4E91\u8FD0\u7EF4\u56E2\u961F" },
  { id: "SoftwareCompany", name: "\u8F6F\u4EF6\u5F00\u53D1\u56E2\u961F" },
  { id: "TradingAgentTeam", name: "\u91CF\u5316\u4EA4\u6613\u56E2\u961F" }
];
function deriveId(uid, salt) {
  return crypto.createHash("md5").update(`${salt}:${uid}`).digest("hex").slice(0, 36);
}
function desktopFingerprint(account) {
  const uid = account.account?.uid || "";
  const nickname = account.account?.nickname || "";
  const now = Date.now();
  return {
    timezone: "Asia/Shanghai",
    reportDelay: 2e3,
    userId: uid,
    username: nickname,
    userNickname: nickname,
    product: "SaaS",
    releaseDate: 1789036585355,
    commit: "5f9692923c93033111c51ad7b003eb80204a9b75",
    ideName: "WorkBuddy",
    ideType: "WorkBuddy",
    ideVersion: "5.5.6",
    machineId: deriveId(uid, "machine"),
    sessionId: deriveId(uid, "session"),
    extName: "workbuddy-desktop",
    extVersion: "5.5.6",
    os: "win32",
    arch: "x64",
    osVersion: "10.0.26220",
    cpuCores: 20,
    memorySize: 24,
    timestamp: now,
    presentAt: now
  };
}
async function fetchGrowthTasks(account, fetchFn = fetch) {
  if (account.auth?.realm === "global") return [];
  const base = CN_CHAT_BASE;
  const url = `${base}/v2/activity/growth/tasks`;
  try {
    const res = await fetchFn(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${account.auth.accessToken}`,
        "X-User-Id": account.account?.uid || "",
        "Accept": "application/json, text/plain, */*",
        "User-Agent": "WorkBuddy/1.2.34"
      }
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && (data.code === 0 || data.code === 200)) {
      return data.data?.tasks || [];
    }
    return [];
  } catch (err) {
    return [];
  }
}
async function acceptGrowthTasks(account, taskCodes, fetchFn = fetch) {
  if (account.auth?.realm === "global" || !taskCodes.length) return true;
  const base = CN_CHAT_BASE;
  const url = `${base}/v2/activity/growth/tasks/accept`;
  try {
    const res = await fetchFn(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${account.auth.accessToken}`,
        "X-User-Id": account.account?.uid || "",
        "Content-Type": "application/json",
        "User-Agent": "WorkBuddy/1.2.34"
      },
      body: JSON.stringify({ task_codes: taskCodes })
    });
    return res.ok;
  } catch (_) {
    return false;
  }
}
async function claimGrowthTask(account, taskCode, fetchFn = fetch) {
  const uid = account.account?.uid || "";
  const token = account.auth?.accessToken || "";
  try {
    const chatUrl = `${CN_CHAT_BASE}/activity/growth/tasks/${taskCode}/claim`;
    const res = await fetchFn(chatUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "X-User-Id": uid,
        "Accept": "application/json, text/plain, */*",
        "User-Agent": "WorkBuddy/1.2.34"
      }
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && (data.code === 0 || data.code === 200)) {
      const d = data.data || {};
      return {
        ok: true,
        already: Boolean(d.already_claimed),
        credit: d.credit || 0,
        energy: d.energy || 0,
        message: d.already_claimed ? "\u5956\u52B1\u5DF2\u5728\u8D26" : `\u9886\u53D6\u6210\u529F (+${d.credit || 0} \u79EF\u5206)`
      };
    }
    if (res.status === 400) {
      const webUrl = `${WEB_BASE}/activity/growth/tasks/${taskCode}/claim`;
      const webRes = await fetchFn(webUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json, text/plain, */*",
          "Content-Type": "application/json",
          "Origin": WEB_BASE,
          "Referer": `${WEB_BASE}/profile/growth-center`,
          "x-client-platform": "web",
          "User-Agent": WEB_UA,
          "X-User-Id": uid,
          "X-Domain": WEB_BASE
        }
      });
      const webData = await webRes.json().catch(() => ({}));
      if (webRes.ok && (webData.code === 0 || webData.code === 200)) {
        const d = webData.data || {};
        return {
          ok: true,
          already: Boolean(d.already_claimed),
          credit: d.credit || 0,
          energy: d.energy || 0,
          message: d.already_claimed ? "\u5956\u52B1\u5DF2\u5728\u8D26" : `Web\u7AEF\u964D\u7EA7\u9886\u53D6\u6210\u529F (+${d.credit || 0} \u79EF\u5206)`
        };
      }
    }
    return { ok: false, message: data.msg || `\u9886\u53D6\u5931\u8D25 (HTTP ${res.status})` };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}
function buildDesktopChatEvents(account) {
  const uid = account.account?.uid || "";
  const now = Date.now();
  const convId = `wb-desk-${now}`;
  const reqId = `${convId}-req`;
  const msgId = `${convId}-msg`;
  const modelId = "deepseek-v4-flash";
  const modelName = "DeepSeek V4 Flash";
  return [
    {
      eventCode: "agent_task_created",
      source: "LOCAL",
      name: "working",
      task_target: "local",
      mode: "craft",
      requestModelId: modelId,
      requestModelName: modelName,
      conversationId: convId,
      messageId: msgId,
      userId: uid
    },
    {
      eventCode: "chat_message_send",
      messageId: `${msgId}-assistant`,
      historyCount: 0,
      traceId: reqId,
      rootRequestId: reqId,
      parentConversationId: convId,
      agentName: "cli",
      agentType: "main",
      userId: uid
    },
    {
      eventCode: "chat_request_send",
      inputLength: 24,
      traceId: reqId,
      rootRequestId: reqId,
      parentConversationId: convId,
      agentName: "cli",
      agentType: "main",
      userId: uid
    },
    {
      eventCode: "chat_message_response",
      messageId: `${msgId}-assistant`,
      responseModelId: modelId,
      inputToken: 120,
      outputToken: 80,
      totalToken: 200,
      isSuccessful: true,
      finishReason: "stop",
      firstTokenAt: now,
      traceId: reqId,
      conversationId: convId,
      rootRequestId: reqId,
      parentConversationId: convId,
      agentName: "cli",
      agentType: "main",
      userId: uid
    },
    {
      eventCode: "chat_message_status",
      messageId: `${msgId}-assistant`,
      messageErrorCode: "0",
      traceId: reqId,
      rootRequestId: reqId,
      parentConversationId: convId,
      agentName: "cli",
      agentType: "main",
      userId: uid
    },
    {
      eventCode: "chat_request_response",
      mode: "craft",
      toolCallCount: 0,
      inputToken: 120,
      outputToken: 80,
      totalToken: 200,
      isSuccessful: true,
      finishReason: "stop",
      rootRequestId: reqId,
      parentConversationId: convId,
      userId: uid
    }
  ];
}
function buildBuddy5Events(account) {
  const uid = account.account?.uid || "";
  const buddyId = "cb_y5Dy46tPQGGWtueMxXbe";
  const buddyName = "\u4F01\u9E45\u6559\u5E08\u52A9\u624B";
  return [
    { eventCode: "buddyapp_discover_click", mode: "LOCAL", buddyId, buddyName, userId: uid },
    { eventCode: "buddyapp_show", mode: "LOCAL", buddyId, buddyName, position: 2, elementId: buddyId, elementName: buddyName, userId: uid },
    { eventCode: "buddyapp_enter_click", mode: "LOCAL", buddyId, buddyName, position: 2, elementId: buddyId, elementName: buddyName, isFirstPage: true, userId: uid },
    { eventCode: "buddyapp_auth_confirm_click", mode: "LOCAL", buddyId, buddyName, elementId: buddyId, elementName: buddyName, userId: uid },
    { eventCode: "buddyapp_bindaccount_skip_click", mode: "LOCAL", buddyId, buddyName, elementId: buddyId, elementName: buddyName, userId: uid }
  ];
}
async function sendDesktopEvents(account, events, fetchFn = fetch) {
  const fp = desktopFingerprint(account);
  const enriched = events.map((e) => ({ ...e, ...fp }));
  const base = CN_CHAT_BASE;
  const url = `${base}${REPORT_PATH}`;
  const res = await fetchFn(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${account.auth.accessToken}`,
      "Accept": "application/json, text/plain, */*",
      "Content-Type": "application/json;charset=UTF-8",
      "User-Agent": DESKTOP_UA,
      "X-Domain": base,
      "X-Product": "SaaS",
      "X-Request-ID": `${deriveId(account.account.uid, "req")}${Date.now() % 1e5}`,
      "X-User-Id": account.account?.uid || ""
    },
    body: JSON.stringify(enriched)
  });
  return res.ok;
}
async function sendWebEvent(account, eventCode, pageUrl, elementId, elementName, fetchFn = fetch) {
  const now = Date.now();
  const uid = account.account?.uid || "";
  const ev = {
    eventCode,
    timestamp: now,
    reportDelay: 0,
    pageURL: pageUrl,
    elementId,
    elementName,
    os: "Win32",
    userAgent: WEB_UA,
    machineId: deriveId(uid, "webmachine"),
    userId: uid,
    userNickname: account.account?.nickname || ""
  };
  const res = await fetchFn(`${WEB_BASE}${REPORT_PATH}`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "x-client-platform": "web",
      "Origin": WEB_BASE,
      "Referer": pageUrl,
      "User-Agent": WEB_UA,
      "X-User-Id": uid,
      "X-Domain": WEB_BASE
    },
    body: JSON.stringify([ev])
  });
  return res.ok;
}
async function lightUpTask(account, code, spec, count, fetchFn = fetch) {
  const uid = account.account?.uid || "";
  const baseBilling = CN_BILLING_BASE;
  const reportBillingUrl = `${baseBilling}${REPORT_PATH}`;
  const sendBillingJson = async (events) => {
    const res = await fetchFn(reportBillingUrl, {
      method: "POST",
      headers: {
        "Accept": "application/json, text/plain, */*",
        "Content-Type": "application/json",
        "Origin": baseBilling,
        "Referer": `${baseBilling}/`,
        "User-Agent": "WorkBuddy/1.2.34",
        "Authorization": `Bearer ${account.auth.accessToken}`,
        "X-User-Id": uid
      },
      body: JSON.stringify(events)
    });
    return res.ok;
  };
  switch (spec.kind) {
    case "canvas": {
      const now = Date.now();
      const events = Array.from({ length: count }, (_, i) => ({
        eventCode: "wbx_design_canvas_task_create",
        timestamp: now + i * 200,
        reportDelay: 0,
        conversationId: `wbx-conv-${now}-${i}`,
        requestId: `wbx-req-${now}-${i}`,
        source: "summon_keyword",
        isCustomModel: false,
        name: "",
        inputLength: 12,
        id: `wbx-canvas-${now}-${i}`,
        cost: 0,
        isSuccessful: true,
        userId: uid
      }));
      return sendBillingJson(events);
    }
    case "template": {
      const now = Date.now();
      const events = Array.from({ length: count }, (_, i) => {
        const sc = DEFAULT_SCENES[i % DEFAULT_SCENES.length];
        return {
          eventCode: "agent_task_created_with_template",
          timestamp: now + i * 200,
          reportDelay: 0,
          isCustomModel: true,
          id: sc.id,
          name: sc.name,
          requestId: `wb-tmpl-${now}-${i}`,
          conversationId: `wb-tmpl-conv-${now}-${i}`,
          userId: uid
        };
      });
      return sendBillingJson(events);
    }
    case "expert": {
      const now = Date.now();
      const events = Array.from({ length: count }, (_, i) => {
        const exp = DEFAULT_EXPERTS[i % DEFAULT_EXPERTS.length];
        return {
          eventCode: "expert_actual_use",
          timestamp: now + i * 200,
          reportDelay: 0,
          mode: "CLOUD",
          id: exp.id,
          name: exp.name,
          expertTitle: exp.name,
          expertType: "agent",
          source: "builtin",
          cost: 0,
          characterCount: 12,
          conversationId: `wb-exp-conv-${now}-${i}`,
          requestId: `wb-exp-req-${now}-${i}`,
          messageId: `wb-exp-msg-${now}-${i}`,
          requestModelId: "deepseek-v4-flash",
          requestModelName: "DeepSeek V4 Flash",
          userId: uid
        };
      });
      return sendBillingJson(events);
    }
    case "team": {
      const now = Date.now();
      const events = Array.from({ length: count }, (_, i) => {
        const tm = DEFAULT_TEAMS[i % DEFAULT_TEAMS.length];
        return {
          eventCode: "expert_actual_use",
          timestamp: now + i * 200,
          reportDelay: 0,
          mode: "CLOUD",
          id: tm.id,
          name: tm.name,
          expertTitle: tm.name,
          expertType: "team",
          source: "builtin",
          cost: 0,
          characterCount: 12,
          conversationId: `wb-team-conv-${now}-${i}`,
          requestId: `wb-team-req-${now}-${i}`,
          messageId: `wb-team-msg-${now}-${i}`,
          requestModelId: "deepseek-v4-flash",
          requestModelName: "DeepSeek V4 Flash",
          userId: uid
        };
      });
      return sendBillingJson(events);
    }
    case "fixed_expert": {
      const now = Date.now();
      const expId = spec.expertId || "ex_GDl31WahyIH0";
      const events = Array.from({ length: count }, (_, i) => ({
        eventCode: "expert_actual_use",
        timestamp: now + i * 200,
        reportDelay: 0,
        mode: "CLOUD",
        id: expId,
        name: spec.title || "\u6D3B\u52A8\u4E13\u5BB6",
        expertTitle: spec.title || "\u6D3B\u52A8\u4E13\u5BB6",
        expertType: "agent",
        source: "builtin",
        cost: 0,
        characterCount: 12,
        conversationId: `wb-fexp-conv-${now}-${i}`,
        requestId: `wb-fexp-req-${now}-${i}`,
        messageId: `wb-fexp-msg-${now}-${i}`,
        requestModelId: "deepseek-v4-flash",
        requestModelName: "DeepSeek V4 Flash",
        userId: uid
      }));
      return sendBillingJson(events);
    }
    case "lighthouse": {
      const now = Date.now();
      const events = Array.from({ length: count }, (_, i) => ({
        eventCode: "expert_actual_use",
        timestamp: now + i * 200,
        reportDelay: 0,
        mode: "CLOUD",
        id: "ex_2cvvUZQhDyeJ",
        name: "\u817E\u8BAF\u8F7B\u91CF\u4E91\u4E13\u5BB6",
        expertTitle: "\u817E\u8BAF\u8F7B\u91CF\u4E91\u4E13\u5BB6",
        type: "02-Engineering",
        expertType: "agent",
        version: "1.0.2",
        source: "builtin",
        cost: 0,
        characterCount: 12,
        conversationId: `wb-lh-conv-${now}-${i}`,
        requestId: `wb-lh-req-${now}-${i}`,
        messageId: `wb-lh-msg-${now}-${i}`,
        requestModelId: "deepseek-v4-flash",
        requestModelName: "DeepSeek V4 Flash",
        userId: uid
      }));
      return sendBillingJson(events);
    }
    case "skill": {
      const now = Date.now();
      const events = Array.from({ length: count }, (_, i) => ({
        eventCode: "skill_info",
        timestamp: now + i * 200,
        reportDelay: 0,
        skillId: "skill_2096525080079265792",
        skillName: "pptx",
        action: "use",
        conversationId: `wb-skill-conv-${now}-${i}`,
        requestId: `wb-skill-req-${now}-${i}`,
        userId: uid
      }));
      return sendBillingJson(events);
    }
    case "automation": {
      const now = Date.now();
      const events = Array.from({ length: count }, (_, i) => ({
        eventCode: "automated_task_create_suc",
        timestamp: now + i * 200,
        reportDelay: 0,
        name: "\u6BCF\u5468\u4E94\u81EA\u52A8\u751F\u6210\u5468\u62A5",
        source: "manually",
        modelId: "deepseek-v4-flash",
        conversationId: `wb-auto-conv-${now}-${i}`,
        requestId: `wb-auto-req-${now}-${i}`,
        schedule: { type: "recurring", rrule: "FREQ=WEEKLY;BYDAY=FR;BYHOUR=9;BYMINUTE=0" },
        prompt: "\u6BCF\u5468\u4E94\u81EA\u52A8\u6574\u7406\u672C\u5468\u5DE5\u4F5C\uFF0C\u751F\u6210\u4E00\u4EFD\u5468\u62A5\u3002",
        userId: uid
      }));
      return sendBillingJson(events);
    }
    case "playbook": {
      const now = Date.now();
      const events = Array.from({ length: count }, (_, i) => ({
        eventCode: "playbook_prompt_send",
        timestamp: now + i * 200,
        reportDelay: 0,
        id: "worker-ledger-freedom-dashboard",
        name: "\u6253\u5DE5\u4EBA\u5C0F\u8D26\u672C",
        promptLength: 20,
        isOfficial: 1,
        source: "discover",
        conversationId: `wb-pb-conv-${now}-${i}`,
        requestId: `wb-pb-req-${now}-${i}`,
        userId: uid
      }));
      return sendBillingJson(events);
    }
    case "skin": {
      const now = Date.now();
      const events = Array.from({ length: count }, (_, i) => ({
        eventCode: "appearance_skin_apply",
        timestamp: now + i * 200,
        reportDelay: 0,
        action: "apply",
        source: "settings_close",
        id: "theme-tkmw7j",
        name: "\u548C\u5E73\u7CBE\u82F1\u6FC0\u6218\u91D1\u79CB",
        vipLevel: "free",
        series: "craft",
        userId: uid
      }));
      return sendBillingJson(events);
    }
    case "chat":
    case "glmchat":
    case "cat": {
      const now = Date.now();
      const isGlm = spec.kind === "glmchat" || spec.kind === "cat";
      const events = Array.from({ length: count }, (_, i) => ({
        eventCode: "chat_request_send",
        timestamp: now + i * 200,
        reportDelay: 0,
        mode: spec.kind === "cat" ? "night" : "craft",
        conversationId: `wb-chat-conv-${now}-${i}`,
        requestId: `wb-chat-req-${now}-${i}`,
        inputLength: 12,
        requestModelId: isGlm ? "glm-5.2" : "deepseek-v4-flash",
        requestModelName: isGlm ? "GLM-5.2" : "DeepSeek V4 Flash",
        agentName: "default",
        agentType: "conversation",
        userId: uid
      }));
      return sendBillingJson(events);
    }
    case "richmeow": {
      const events = buildDesktopChatEvents(account);
      return sendDesktopEvents(account, events, fetchFn);
    }
    case "buddy5": {
      const events = buildBuddy5Events(account);
      return sendDesktopEvents(account, events, fetchFn);
    }
    case "library": {
      return sendWebEvent(
        account,
        "web_element_click",
        LIBRARY_DOC_URL,
        "library_doc_intro_click",
        "\u8D44\u6599\u5E93\u4ECB\u7ECD\u70B9\u51FB",
        fetchFn
      );
    }
    default:
      return false;
  }
}
async function runAllGrowthTasks(account, fetchFn = fetch) {
  if (account.auth?.realm === "global") {
    return { ok: true, reason: "global_account_skipped" };
  }
  const logs = [];
  let creditGained = 0;
  let energyGained = 0;
  let tasks = await fetchGrowthTasks(account, fetchFn);
  if (!tasks.length) {
    return { ok: false, message: "\u672A\u83B7\u53D6\u5230\u6210\u957F\u4EFB\u52A1\u5217\u8868" };
  }
  const unaccepted = tasks.filter((t) => t.accept_status === "not_accepted").map((t) => t.task_code);
  if (unaccepted.length > 0) {
    await acceptGrowthTasks(account, unaccepted, fetchFn);
    logs.push({ step: "accept_tasks", count: unaccepted.length, codes: unaccepted });
    tasks = await fetchGrowthTasks(account, fetchFn);
  }
  for (const t of tasks) {
    const code = t.task_code;
    const spec = TASK_MAPPING[code];
    if (!spec || spec.unforgeable) {
      continue;
    }
    const cur = t.progress?.current || 0;
    const target = t.progress?.target || spec.target || 1;
    if (t.accept_status !== "claimed" && t.accept_status !== "completed" && cur < target) {
      const need = target - cur;
      try {
        const ok = await lightUpTask(account, code, spec, need, fetchFn);
        logs.push({ step: `lightup_${code}`, title: spec.title || code, count: need, ok });
      } catch (err) {
        logs.push({ step: `lightup_${code}`, title: spec.title || code, ok: false, error: err.message });
      }
    }
  }
  await new Promise((r) => setTimeout(r, 1500));
  const freshTasks = await fetchGrowthTasks(account, fetchFn);
  for (const t of freshTasks) {
    const code = t.task_code;
    const spec = TASK_MAPPING[code] || {};
    const cur = t.progress?.current || 0;
    const target = t.progress?.target || spec.target || 1;
    if (t.accept_status === "completed" || cur >= target && t.accept_status !== "claimed") {
      const claimRes = await claimGrowthTask(account, code, fetchFn);
      if (claimRes.ok) {
        creditGained += claimRes.credit || 0;
        energyGained += claimRes.energy || 0;
        logs.push({
          step: `claim_${code}`,
          title: t.title || spec.title || code,
          credit: claimRes.credit,
          message: claimRes.message
        });
      }
    }
  }
  return {
    ok: true,
    totalTasks: tasks.length,
    creditGained,
    energyGained,
    logs,
    summary: `\u6210\u957F\u4EFB\u52A1\u5168\u81EA\u52A8\u6536\u5272\u5B8C\u6210\uFF01\u672C\u6B21\u65B0\u5165\u8D26 +${creditGained} \u79EF\u5206\uFF0C+${energyGained} \u80FD\u91CF`
  };
}

// src/upstream/growth.js
function getChatBase2(account) {
  return account.auth?.realm === "global" ? GLOBAL_BASE : CN_CHAT_BASE;
}
function getBillingBase(account) {
  return account.auth?.realm === "global" ? GLOBAL_BASE : CN_BILLING_BASE;
}
function buildHeaders(base, account) {
  const headers = {
    "Accept": "application/json, text/plain, */*",
    "Content-Type": "application/json",
    "Origin": base,
    "Referer": `${base}/`,
    "X-Requested-With": "XMLHttpRequest",
    "User-Agent": "WorkBuddy/1.2.34 WorkBuddy/1.2.34 CLI/1.2.34"
  };
  if (account.auth?.accessToken) {
    headers["Authorization"] = `Bearer ${account.auth.accessToken}`;
  }
  if (account.account?.uid) {
    headers["X-User-Id"] = account.account.uid;
  }
  if (account.account?.enterpriseId) {
    headers["X-Enterprise-Id"] = account.account.enterpriseId;
  }
  return headers;
}
function getYesterdayDateCST(now = /* @__PURE__ */ new Date()) {
  const cstOffset = 8 * 60 * 60 * 1e3;
  const cstTime = new Date(now.getTime() + cstOffset);
  cstTime.setUTCDate(cstTime.getUTCDate() - 1);
  return cstTime.toISOString().slice(0, 10);
}
async function reportActiveChat(account, burst = 5, fetchFn = fetch) {
  if (account.auth?.realm === "global") return { ok: true, status: "skipped_global" };
  const uid = account.account?.uid;
  if (!uid) return { ok: false, message: "\u8D26\u53F7\u7F3A\u5931 UID" };
  const base = getBillingBase(account);
  const url = `${base}${REPORT_PATH}`;
  const now = Date.now();
  const convId = `wb2api-conv-${now}`;
  const events = [];
  for (let i = 0; i < burst; i++) {
    const ts = now + i * 200;
    events.push({
      eventCode: "chat_request_send",
      timestamp: ts,
      reportDelay: 0,
      mode: "craft",
      conversationId: convId,
      requestId: `${convId}-${i}`,
      inputLength: 16,
      requestModelId: "deepseek-v4-flash",
      requestModelName: "DeepSeek V4 Flash",
      isPlan: false,
      isAutoExecuteTerminal: false,
      isAutoModify: false,
      codebaseEnable: false,
      maxToken: 0,
      maxSteps: 0,
      temperature: 0,
      maxRetries: 0,
      mentionContexts: [],
      knowledgeId: [],
      knowledgeName: [],
      codebaseId: "",
      mentionContextCount: 0,
      command: "",
      expertId: "",
      recommendId: "",
      skillId: "",
      skillCount: 0,
      totalCount: 0,
      fileUri: "",
      presentAt: ts,
      traceId: "",
      rootRequestId: convId,
      parentConversationId: convId,
      agentName: "default",
      agentType: "conversation",
      userId: uid
    });
  }
  try {
    const res = await fetchFn(url, {
      method: "POST",
      headers: buildHeaders(base, account),
      body: JSON.stringify(events)
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && (data.code === 0 || data.code === 200)) {
      return { ok: true, burst, message: `\u6210\u529F\u4E0A\u62A5 ${burst} \u6761\u5BF9\u8BDD\u6D3B\u8DC3\u4E8B\u4EF6 (\u70B9\u4EAE\u6D3B\u8DC3\u4E0E\u9886\u517B\u95E8\u69DB)` };
    }
    return { ok: false, message: data.msg || `\u4E0A\u62A5\u5931\u8D25 (HTTP ${res.status})` };
  } catch (err) {
    return { ok: false, message: `\u4E0A\u62A5\u5F02\u5E38: ${err.message}` };
  }
}
async function claimGift(account, fetchFn = fetch) {
  if (account.auth?.realm === "global") return { ok: true, status: "skipped_global" };
  const base = getBillingBase(account);
  const url = `${base}${CLAIM_GIFT_PATH}`;
  try {
    const res = await fetchFn(url, {
      method: "POST",
      headers: buildHeaders(base, account),
      body: JSON.stringify({})
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && (data.code === 0 || data.code === 200)) {
      const credit = data.data?.credit || 0;
      return { ok: true, credit, message: `\u65B0\u624B\u793C\u5305\u9886\u53D6\u6210\u529F\uFF0C\u83B7\u5F97 +${credit} \u79EF\u5206\uFF01` };
    }
    return { ok: false, message: data.msg || "\u65B0\u624B\u793C\u5305\u5DF2\u9886\u6216\u65E0\u53EF\u9886" };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}
async function claimCompensation(account, fetchFn = fetch) {
  if (account.auth?.realm === "global") return { ok: true, status: "skipped_global" };
  const base = getBillingBase(account);
  const url = `${base}${CLAIM_COMPENSATION_PATH}`;
  try {
    const res = await fetchFn(url, {
      method: "POST",
      headers: buildHeaders(base, account),
      body: JSON.stringify({})
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && (data.code === 0 || data.code === 200)) {
      const credit = data.data?.credit || 0;
      return { ok: true, credit, message: `\u6D3B\u52A8\u8865\u507F\u9886\u53D6\u6210\u529F\uFF0C\u83B7\u5F97 +${credit} \u79EF\u5206\uFF01` };
    }
    return { ok: false, message: data.msg || "\u6D3B\u52A8\u8865\u507F\u5DF2\u9886\u6216\u5F53\u524D\u65E0\u8865\u507F" };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}
async function getStreak(account, fetchFn = fetch) {
  const base = getChatBase2(account);
  const url = `${base}${STREAK_PATH}`;
  try {
    const res = await fetchFn(url, {
      method: "GET",
      headers: buildHeaders(base, account)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.code !== 0 && data.code !== 200) {
      return { days: 0, redemptionStatus: null, makeupCards: { balance: 0, max: 0 } };
    }
    const d = data.data || {};
    return {
      days: d.streak?.days || 0,
      redemptionStatus: d.redemption_status || null,
      makeupCards: d.makeup_cards || { balance: 0, max: 0 }
    };
  } catch (err) {
    return { days: 0, redemptionStatus: null, makeupCards: { balance: 0, max: 0 } };
  }
}
async function redeemStreakTier(account, tier, fetchFn = fetch) {
  const base = getChatBase2(account);
  const url = `${base}${REDEEM_PATH}`;
  const clientToken = `redeem-${tier}-${crypto2.randomUUID()}`;
  try {
    const res = await fetchFn(url, {
      method: "POST",
      headers: buildHeaders(base, account),
      body: JSON.stringify({ tier, client_token: clientToken })
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && (data.code === 0 || data.code === 200)) {
      const d = data.data || {};
      return {
        ok: true,
        tier,
        creditGranted: d.credit_granted || 0,
        energyGranted: d.energy_granted || 0,
        cardsGranted: d.cards_granted || 0,
        chancesGranted: d.chances_granted || 0,
        message: `\u6210\u529F\u5151\u6362 ${tier} \u91CC\u7A0B\u7891\u5956\u52B1\uFF1A+${d.credit_granted || 0} \u79EF\u5206\uFF0C\u9001 ${d.chances_granted || 0} \u6B21\u62BD\u5956\uFF01`
      };
    }
    return { ok: false, tier, message: data.msg || `\u5151\u6362 ${tier} \u5931\u8D25` };
  } catch (err) {
    return { ok: false, tier, message: err.message };
  }
}
async function getLotteryChances(account, fetchFn = fetch) {
  const base = getChatBase2(account);
  const url = `${base}${LOTTERY_CHANCES_PATH}`;
  try {
    const res = await fetchFn(url, {
      method: "GET",
      headers: buildHeaders(base, account)
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && (data.code === 0 || data.code === 200)) {
      return data.data?.balance || 0;
    }
    return 0;
  } catch (err) {
    return 0;
  }
}
async function drawLottery(account, fetchFn = fetch) {
  const base = getChatBase2(account);
  const url = `${base}${LOTTERY_DRAW_PATH}`;
  const clientToken = `draw-${crypto2.randomUUID()}`;
  try {
    const res = await fetchFn(url, {
      method: "POST",
      headers: buildHeaders(base, account),
      body: JSON.stringify({ client_token: clientToken })
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && (data.code === 0 || data.code === 200)) {
      const d = data.data || {};
      return {
        ok: true,
        prizeName: d.prize_name || "\u7CBE\u7F8E\u5956\u54C1",
        prizeType: d.prize_type || "credit",
        creditAmount: d.credit_amount || 0,
        message: `\u62BD\u4E2D [${d.prize_name || "\u5956\u52B1"}] (+${d.credit_amount || 0} \u79EF\u5206)`
      };
    }
    return { ok: false, message: data.msg || "\u62BD\u5956\u672A\u4E2D\u6216\u6B21\u6570\u5DF2\u8017\u5C3D" };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}
async function checkAndUseMakeupCard(account, fetchFn = fetch) {
  if (account.auth?.realm === "global") return { ok: false, reason: "skipped_global" };
  try {
    const streakInfo = await getStreak(account, fetchFn);
    if ((streakInfo.makeupCards?.balance || 0) <= 0) {
      return { ok: false, reason: "no_cards" };
    }
    const base = getChatBase2(account);
    const heatmapRes = await fetchFn(`${base}${HEATMAP_PATH}`, {
      method: "GET",
      headers: buildHeaders(base, account)
    });
    const heatmapData = await heatmapRes.json().catch(() => ({}));
    const cells = heatmapData.data?.cells || [];
    const yesterday = getYesterdayDateCST();
    const yesterdayCell = cells.find((c) => c.date && c.date.startsWith(yesterday));
    if (yesterdayCell && yesterdayCell.score === 0) {
      const useRes = await fetchFn(`${base}${MAKEUP_CARD_PATH}`, {
        method: "POST",
        headers: buildHeaders(base, account),
        body: JSON.stringify({ target_date: yesterday })
      });
      const useData = await useRes.json().catch(() => ({}));
      if (useRes.ok && (useData.code === 0 || useData.code === 200)) {
        return { ok: true, patchedDate: yesterday, message: `\u6210\u529F\u4F7F\u7528\u8865\u7B7E\u5361\u62EF\u6551\u6628\u65E5 (${yesterday}) \u8FDE\u767B\uFF01` };
      }
    }
    return { ok: false, reason: "no_missed_day" };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
async function claimAllWelfare(account, fetchFn = fetch) {
  const log = [];
  let totalCreditsGained = 0;
  const checkinRes = await performCheckin(account, fetchFn);
  log.push({ step: "checkin", ...checkinRes });
  if (account.auth?.realm === "global") {
    return {
      realm: "global",
      totalCreditsGained,
      log,
      summary: checkinRes.message || "\u56FD\u9645\u7248\u8BD5\u7528\u798F\u5229\u5904\u7406\u5B8C\u6BD5"
    };
  }
  const reportRes = await reportActiveChat(account, 5, fetchFn);
  log.push({ step: "report_active", ...reportRes });
  const giftRes = await claimGift(account, fetchFn);
  if (giftRes.ok && giftRes.credit) totalCreditsGained += giftRes.credit;
  log.push({ step: "claim_gift", ...giftRes });
  const compRes = await claimCompensation(account, fetchFn);
  if (compRes.ok && compRes.credit) totalCreditsGained += compRes.credit;
  log.push({ step: "claim_compensation", ...compRes });
  const travelRes = await runTravelForAccount(account, fetchFn);
  if (travelRes.results?.actions) {
    for (const act of travelRes.results.actions) {
      if (act.action === "claim" && act.rewardCredit) {
        totalCreditsGained += act.rewardCredit;
      }
    }
  }
  log.push({ step: "cat_travel", ...travelRes });
  const streak = await getStreak(account, fetchFn);
  log.push({ step: "streak_info", streakDays: streak.days, makeupCards: streak.makeupCards?.balance || 0 });
  const rs = streak.redemptionStatus;
  if (rs) {
    const tiers = ["7d", "14d", "28d"];
    for (const tier of tiers) {
      const statusKey = `tier_${tier}_status`;
      if (rs[statusKey] === "available") {
        const redeemRes = await redeemStreakTier(account, tier, fetchFn);
        if (redeemRes.ok && redeemRes.creditGranted) {
          totalCreditsGained += redeemRes.creditGranted;
        }
        log.push({ step: `redeem_${tier}`, ...redeemRes });
      }
    }
  }
  let chances = await getLotteryChances(account, fetchFn);
  let draws = 0;
  while (chances > 0 && draws < 10) {
    draws++;
    const drawRes = await drawLottery(account, fetchFn);
    if (drawRes.ok && drawRes.creditAmount) {
      totalCreditsGained += drawRes.creditAmount;
    }
    log.push({ step: `draw_lottery_${draws}`, ...drawRes });
    chances = await getLotteryChances(account, fetchFn);
  }
  const cardRes = await checkAndUseMakeupCard(account, fetchFn);
  if (cardRes.ok) {
    log.push({ step: "makeup_card", ...cardRes });
  }
  try {
    const taskRes = await runAllGrowthTasks(account, fetchFn);
    if (taskRes.ok && taskRes.creditGained) {
      totalCreditsGained += taskRes.creditGained;
    }
    log.push({ step: "growth_tasks", ...taskRes });
  } catch (e) {
    log.push({ step: "growth_tasks", ok: false, error: e.message });
  }
  return {
    realm: "cn",
    totalCreditsGained,
    log,
    summary: `\u798F\u5229\u4E0E\u6210\u957F\u4EFB\u52A1\u5168\u5957\u62C9\u6EE1\uFF01\u7D2F\u8BA1\u5230\u8D26 +${totalCreditsGained} \u79EF\u5206`
  };
}

// src/pool/scheduler.js
var STICKY_TTL_MS = 15 * 60 * 1e3;
var KEEPALIVE_INTERVAL_MS = 5 * 60 * 1e3;
var TOKEN_REFRESH_WINDOW_MS = 2 * 60 * 60 * 1e3;
function stripModelRealm(model = "") {
  return String(model).replace(/^(cn|global):/i, "");
}
var Scheduler = class {
  constructor(accountStore, options = {}) {
    this.store = accountStore;
    this.client = options.client || null;
    this.configStore = options.configStore || null;
    this.maxInFlightCN = options.maxInFlightCN || 3;
    this.maxInFlightGlobal = options.maxInFlightGlobal || 2;
    this.queueTimeoutMs = options.queueTimeoutMs ?? 5e3;
    this.circuitBreakers = /* @__PURE__ */ new Map();
    this.modelBreakers = /* @__PURE__ */ new Map();
    this.inFlight = /* @__PURE__ */ new Map();
    this.stickyMap = /* @__PURE__ */ new Map();
    this.accountStats = /* @__PURE__ */ new Map();
    this.waiters = [];
    this.autoTimer = null;
    this.keepaliveTimer = null;
  }
  _getLimits() {
    const cfg = this.configStore ? this.configStore.getAll() : null;
    return {
      maxInFlightCN: cfg?.maxInFlightCN || this.maxInFlightCN,
      maxInFlightGlobal: cfg?.maxInFlightGlobal || this.maxInFlightGlobal,
      queueTimeoutMs: cfg?.queueTimeoutMs ?? this.queueTimeoutMs
    };
  }
  getLimitForAccount(account) {
    const { maxInFlightCN, maxInFlightGlobal } = this._getLimits();
    return account?.auth?.realm === "global" ? maxInFlightGlobal : maxInFlightCN;
  }
  getInFlight(uid) {
    return this.inFlight.get(uid) || 0;
  }
  isCoolingDown(uid, model = "") {
    const now = Date.now();
    const cb = this.circuitBreakers.get(uid);
    if (cb && now < cb.cooldownUntil) {
      return true;
    }
    if (model) {
      const bare = stripModelRealm(model);
      const mb = this.modelBreakers.get(`${uid}::${bare}`);
      if (mb && now < mb.cooldownUntil) {
        return true;
      }
    }
    return false;
  }
  /**
   * 申请账号槽位租约
   */
  acquire(account) {
    if (!account || account.disabled) return false;
    const uid = account.account?.uid;
    if (!uid) return false;
    const current = this.inFlight.get(uid) || 0;
    const limit = this.getLimitForAccount(account);
    if (current >= limit) {
      return false;
    }
    this.inFlight.set(uid, current + 1);
    return true;
  }
  /**
   * 释放账号槽位租约并唤醒排队等待者
   */
  release(account) {
    if (!account) return;
    const uid = account.account?.uid;
    if (!uid) return;
    const current = this.inFlight.get(uid) || 0;
    if (current <= 1) {
      this.inFlight.delete(uid);
    } else {
      this.inFlight.set(uid, current - 1);
    }
    this._notifyWaiters();
  }
  _notifyWaiters() {
    if (this.waiters.length === 0) return;
    const pending = this.waiters.splice(0, this.waiters.length);
    for (const w of pending) {
      clearTimeout(w.timer);
      w.resolve(true);
    }
  }
  /**
   * 当候选账号仅因并发饱和无法取得槽位时，进入短时 FIFO 等待队列
   */
  acquireWithQueue(candidatesFn, timeoutMs = 5e3) {
    const candidates = candidatesFn();
    for (const acc of candidates) {
      if (this.acquire(acc)) {
        return Promise.resolve(acc);
      }
    }
    if (!timeoutMs || timeoutMs <= 0) {
      return Promise.resolve(null);
    }
    const deadline = Date.now() + timeoutMs;
    return new Promise((resolve) => {
      const tryOnce = () => {
        const latest = candidatesFn();
        for (const acc of latest) {
          if (this.acquire(acc)) {
            resolve(acc);
            return;
          }
        }
        const remaining = deadline - Date.now();
        if (remaining <= 0) {
          resolve(null);
          return;
        }
        const waiter = {
          resolve: () => tryOnce(),
          timer: setTimeout(() => {
            const idx = this.waiters.indexOf(waiter);
            if (idx !== -1) this.waiters.splice(idx, 1);
            resolve(null);
          }, remaining)
        };
        if (waiter.timer.unref) waiter.timer.unref();
        this.waiters.push(waiter);
      };
      tryOnce();
    });
  }
  _getOrCreateStats(uid) {
    let st = this.accountStats.get(uid);
    if (!st) {
      st = {
        successCount: 0,
        failCount: 0,
        lastSuccessAt: null,
        lastErrorAt: null,
        lastErrorMsg: "",
        lastModel: ""
      };
      this.accountStats.set(uid, st);
    }
    return st;
  }
  /**
   * 记录调用成功，重置对应熔断器并更新统计
   */
  recordSuccess(account, model = "") {
    const uid = account?.account?.uid;
    if (!uid) return;
    this.circuitBreakers.delete(uid);
    if (model) {
      this.modelBreakers.delete(`${uid}::${stripModelRealm(model)}`);
    }
    const st = this._getOrCreateStats(uid);
    st.successCount += 1;
    st.lastSuccessAt = Date.now();
    if (model) st.lastModel = stripModelRealm(model);
  }
  /**
   * 记录调用异常，按错误类型分流进入模型级软熔断或账号级熔断
   */
  recordFailure(account, kind, message = "", model = "") {
    const uid = account?.account?.uid;
    if (!uid) return;
    const bareModel = stripModelRealm(model);
    const st = this._getOrCreateStats(uid);
    st.failCount += 1;
    st.lastErrorAt = Date.now();
    st.lastErrorMsg = message;
    if (bareModel) st.lastModel = bareModel;
    if (kind === ErrKind.CONTENT_BLOCKED || kind === ErrKind.BAD_PARAMS || kind === ErrKind.PROMPT_TOO_LONG) {
      return;
    }
    if (bareModel && (kind === ErrKind.NOT_FOUND || kind === ErrKind.SOFT_RATE || kind === ErrKind.SERVER)) {
      const mKey = `${uid}::${bareModel}`;
      const mb = this.modelBreakers.get(mKey) || { failures: 0, cooldownUntil: 0, kind: "", reason: "" };
      mb.failures += 1;
      mb.kind = kind;
      mb.reason = message;
      let cooldownMs2 = 45e3;
      if (kind === ErrKind.NOT_FOUND) {
        cooldownMs2 = 15 * 60 * 1e3;
      } else if (kind === ErrKind.SOFT_RATE) {
        cooldownMs2 = Math.min(3e4 * Math.pow(2, mb.failures - 1), 10 * 60 * 1e3);
      } else if (kind === ErrKind.SERVER) {
        cooldownMs2 = Math.min(3e4 * mb.failures, 18e4);
      }
      mb.cooldownUntil = Date.now() + cooldownMs2;
      this.modelBreakers.set(mKey, mb);
      console.warn(`[scheduler] \u8D26\u53F7 ${uid} \u6A21\u578B [${bareModel}] \u89E6\u53D1\u6A21\u578B\u7EA7\u8F6F\u7194\u65AD (${kind}), \u51B7\u5374 ${Math.round(cooldownMs2 / 1e3)}s: ${message}`);
      return;
    }
    const cb = this.circuitBreakers.get(uid) || { failures: 0, cooldownUntil: 0, kind: "", reason: "" };
    cb.failures += 1;
    cb.kind = kind;
    cb.reason = message;
    let cooldownMs = 6e4;
    switch (kind) {
      case ErrKind.SOFT_RATE:
        cooldownMs = Math.min(3e4 * Math.pow(2, cb.failures - 1), 6e5);
        break;
      case ErrKind.HARD_CREDIT:
        cooldownMs = 18e5;
        break;
      case ErrKind.SESSION_DEAD:
        cooldownMs = 72e5;
        break;
      case ErrKind.ACCOUNT_FAULT:
        cooldownMs = 432e5;
        break;
      case ErrKind.WAF_BLOCK:
        cooldownMs = 18e4;
        break;
      default:
        cooldownMs = 45e3;
    }
    cb.cooldownUntil = Date.now() + cooldownMs;
    this.circuitBreakers.set(uid, cb);
    console.warn(`[scheduler] \u8D26\u53F7 ${uid} \u89E6\u53D1\u8D26\u53F7\u7EA7\u7194\u65AD\u4FDD\u62A4 (${kind}), \u51B7\u5374\u65F6\u957F ${Math.round(cooldownMs / 1e3)}s: ${message}`);
  }
  /**
   * 清除单个账号的账号级与模型级冷却状态
   */
  clearCooldown(uid) {
    if (!uid) return false;
    let cleared = this.circuitBreakers.delete(uid);
    const prefix = `${uid}::`;
    for (const key of this.modelBreakers.keys()) {
      if (key.startsWith(prefix)) {
        this.modelBreakers.delete(key);
        cleared = true;
      }
    }
    return cleared;
  }
  /**
   * 一键清除所有账号及模型冷却状态
   */
  clearAllCooldowns() {
    const count = this.circuitBreakers.size + this.modelBreakers.size;
    this.circuitBreakers.clear();
    this.modelBreakers.clear();
    return count;
  }
  /**
   * 获取账号运行期诊断信息
   */
  getAccountDiagnostics(uid) {
    const acc = this.store.get(uid);
    const now = Date.now();
    const cb = this.circuitBreakers.get(uid);
    const coolingDown = !!(cb && now < cb.cooldownUntil);
    const modelCooldowns = [];
    const prefix = `${uid}::`;
    for (const [key, mb] of this.modelBreakers.entries()) {
      if (key.startsWith(prefix) && now < mb.cooldownUntil) {
        modelCooldowns.push({
          model: key.slice(prefix.length),
          kind: mb.kind,
          reason: mb.reason,
          cooldownUntil: mb.cooldownUntil,
          remainingSec: Math.ceil((mb.cooldownUntil - now) / 1e3)
        });
      }
    }
    return {
      uid,
      disabled: !!acc?.disabled,
      disabledReason: acc?.disabledReason || "",
      inFlight: this.getInFlight(uid),
      limit: acc ? this.getLimitForAccount(acc) : this.maxInFlightCN,
      coolingDown,
      cooldownUntil: coolingDown ? cb.cooldownUntil : 0,
      cooldownRemainingSec: coolingDown ? Math.ceil((cb.cooldownUntil - now) / 1e3) : 0,
      kind: coolingDown ? cb.kind : "",
      reason: coolingDown ? cb.reason : "",
      failures: cb?.failures || 0,
      modelCooldowns,
      stats: { ...this._getOrCreateStats(uid) }
    };
  }
  _getStickyUid(sessionKey, bareModel) {
    if (!sessionKey) return null;
    const key = `${sessionKey}::${bareModel || ""}`;
    const entry = this.stickyMap.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.stickyMap.delete(key);
      return null;
    }
    return entry.uid;
  }
  _setStickyUid(sessionKey, bareModel, uid) {
    if (!sessionKey || !uid) return;
    if (this.stickyMap.size > 2e3) {
      const now = Date.now();
      for (const [k, v] of this.stickyMap.entries()) {
        if (now > v.expiresAt) this.stickyMap.delete(k);
      }
      if (this.stickyMap.size > 2e3) {
        this.stickyMap.clear();
      }
    }
    this.stickyMap.set(`${sessionKey}::${bareModel || ""}`, {
      uid,
      expiresAt: Date.now() + STICKY_TTL_MS
    });
  }
  /**
   * 选出当前最佳可用账号候选序列（跳过手动停用账号，融合 Sticky 亲和性、熔断状态与并发度）
   */
  pickCandidates(targetRealm = null, options = {}) {
    const accounts = this.store.getAll().filter((a) => !a.disabled);
    if (accounts.length === 0) return [];
    const now = Date.now();
    const bareModel = stripModelRealm(options.bareModel || "");
    const stickyUid = this._getStickyUid(options.sessionKey, bareModel);
    const scored = accounts.map((acc) => {
      const uid = acc.account.uid;
      const isGlobal = acc.auth?.realm === "global";
      const realm = isGlobal ? "global" : "cn";
      const inFlight = this.inFlight.get(uid) || 0;
      const limit = this.getLimitForAccount(acc);
      let penalty = 0;
      const cb = this.circuitBreakers.get(uid);
      if (cb && now < cb.cooldownUntil) {
        penalty += 1e5;
      }
      if (bareModel) {
        const mb = this.modelBreakers.get(`${uid}::${bareModel}`);
        if (mb && now < mb.cooldownUntil) {
          penalty += 8e4;
        }
      }
      if (inFlight >= limit) {
        penalty += 5e4;
      }
      penalty += inFlight * 1e3;
      if (targetRealm && targetRealm !== realm) {
        penalty += 5e3;
      }
      if (stickyUid && uid === stickyUid) {
        penalty -= 500;
      }
      if (uid === this.store.activeUid) {
        penalty -= 50;
      }
      return { account: acc, score: penalty };
    });
    scored.sort((a, b) => a.score - b.score);
    return scored.map((s) => s.account);
  }
  /**
   * 执行带模型级软熔断、并发排队与自动轮换的请求执行流
   */
  async executeWithFailover(model, reqFn, options = {}) {
    const rawModel = String(model || "");
    const targetRealm = rawModel.startsWith("global:") ? "global" : rawModel.startsWith("cn:") ? "cn" : null;
    const bareModel = stripModelRealm(rawModel);
    const { queueTimeoutMs } = this._getLimits();
    const waitMs = options.queueTimeoutMs ?? queueTimeoutMs;
    const allEnabled = this.store.getAll().filter((a) => !a.disabled);
    if (allEnabled.length === 0) {
      throw new Error("\u5F53\u524D\u65E0\u53EF\u7528\u542F\u7528\u8D26\u53F7\uFF0C\u8BF7\u5728\u8BBE\u7F6E\u4E2D\u6DFB\u52A0\u6216\u542F\u7528\u81F3\u5C11\u4E00\u4E2A WorkBuddy / CodeBuddy \u8D26\u53F7");
    }
    const pickOpts = { sessionKey: options.sessionKey, bareModel };
    let candidates = this.pickCandidates(targetRealm, pickOpts);
    let lastError = null;
    const attempted = /* @__PURE__ */ new Set();
    const tryAccount = async (account) => {
      attempted.add(account.account.uid);
      try {
        const result = await reqFn(account);
        if (result && result.ok === false) {
          this.recordFailure(account, result.kind, result.message, bareModel);
          this.release(account);
          const err = new Error(result.message);
          err.status = result.status;
          err.kind = result.kind;
          err.nonRetryable = result.kind === ErrKind.CONTENT_BLOCKED || result.kind === ErrKind.BAD_PARAMS || result.kind === ErrKind.PROMPT_TOO_LONG;
          if (err.nonRetryable) {
            throw err;
          }
          if (result.kind === ErrKind.SOFT_RATE || result.kind === ErrKind.HARD_CREDIT || result.kind === ErrKind.SESSION_DEAD || result.kind === ErrKind.NOT_FOUND || result.kind === ErrKind.WAF_BLOCK || result.kind === ErrKind.SERVER) {
            lastError = err;
            console.log(`[scheduler] \u8D26\u53F7 ${account.account.uid} [${bareModel || rawModel}] \u9047 ${result.kind}\uFF0C\u81EA\u52A8\u5207\u6362\u4E0B\u4E00\u4E2A\u8D26\u53F7...`);
            return null;
          }
          throw err;
        }
        this.recordSuccess(account, bareModel);
        if (options.sessionKey) {
          this._setStickyUid(options.sessionKey, bareModel, account.account.uid);
        }
        return {
          ...result,
          account,
          release: () => this.release(account)
        };
      } catch (err) {
        if (err.nonRetryable) {
          this.release(account);
          throw err;
        }
        const errKind = err.kind || ErrKind.CLIENT;
        this.recordFailure(account, errKind, err.message, bareModel);
        this.release(account);
        lastError = err;
        console.warn(`[scheduler] \u8D26\u53F7 ${account.account.uid} \u8C03\u7528\u5F02\u5E38 (${errKind})\uFF0C\u5C1D\u8BD5\u5BB9\u707E\u8F6E\u6362:`, err.message);
        return null;
      }
    };
    for (const account of candidates) {
      if (!this.acquire(account)) {
        continue;
      }
      const res = await tryAccount(account);
      if (res) return res;
    }
    if (attempted.size === 0 && waitMs > 0) {
      const queuedAcc = await this.acquireWithQueue(() => {
        return this.pickCandidates(targetRealm, pickOpts).filter(
          (a) => !this.isCoolingDown(a.account.uid, bareModel)
        );
      }, waitMs);
      if (queuedAcc) {
        const res = await tryAccount(queuedAcc);
        if (res) return res;
      }
    }
    throw lastError || new Error("\u6240\u6709\u53EF\u7528\u8D26\u53F7\u5747\u5E76\u53D1\u5360\u6EE1\u6216\u5904\u4E8E\u51B7\u5374\u4FDD\u62A4\u671F\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5");
  }
  /**
   * 批量刷新全部账号 Token（主动续期）
   */
  async refreshAllTokens(onlyExpiringSoon = false) {
    if (!this.client) {
      return { total: 0, refreshed: 0, skipped: 0, failed: 0, results: [] };
    }
    const accounts = this.store.getAll();
    const now = Date.now();
    let refreshed = 0;
    let skipped = 0;
    let failed = 0;
    const results = [];
    for (const acc of accounts) {
      const uid = acc.account?.uid;
      if (!acc.auth?.refreshToken) {
        skipped++;
        results.push({ uid, status: "skipped", reason: "no_refresh_token" });
        continue;
      }
      const expAt = acc.auth?.expiresAt || 0;
      if (onlyExpiringSoon && expAt > 0 && expAt - now > TOKEN_REFRESH_WINDOW_MS) {
        skipped++;
        results.push({ uid, status: "skipped", reason: "still_fresh" });
        continue;
      }
      try {
        await this.client.refreshToken(acc);
        this.store.upsert(acc);
        const cb = this.circuitBreakers.get(uid);
        if (cb && cb.kind === ErrKind.SESSION_DEAD) {
          this.circuitBreakers.delete(uid);
        }
        refreshed++;
        results.push({ uid, status: "refreshed" });
      } catch (err) {
        failed++;
        results.push({ uid, status: "failed", error: err.message });
      }
      await new Promise((r) => setTimeout(r, 300));
    }
    return { total: accounts.length, refreshed, skipped, failed, results };
  }
  /**
   * 保活巡检：仅刷新即将过期（2 小时内）或缺失过期时间的账号
   */
  async refreshKeepalive() {
    return this.refreshAllTokens(true);
  }
  /**
   * 对所有国内账号批量巡检猫猫旅行（领养、领奖、派出）
   */
  async runAllTravel() {
    const accounts = this.store.getAll().filter((a) => !a.disabled && a.auth?.realm !== "global");
    const results = [];
    for (const acc of accounts) {
      try {
        const res = await runTravelForAccount(acc);
        results.push({ uid: acc.account.uid, nickname: acc.account.nickname, ...res });
      } catch (err) {
        results.push({ uid: acc.account.uid, nickname: acc.account.nickname, status: "error", error: err.message });
      }
      await new Promise((r) => setTimeout(r, 800));
    }
    return results;
  }
  /**
   * 对全量账号批量吃满全套福利（签到+活跃+礼包+补偿+猫猫+连登+抽奖）
   */
  async runAllWelfare() {
    const accounts = this.store.getAll().filter((a) => !a.disabled);
    const results = [];
    for (const acc of accounts) {
      try {
        const res = await claimAllWelfare(acc);
        results.push({ uid: acc.account.uid, nickname: acc.account.nickname, ...res });
      } catch (err) {
        results.push({ uid: acc.account.uid, nickname: acc.account.nickname, status: "error", error: err.message });
      }
      await new Promise((r) => setTimeout(r, 1e3));
    }
    return results;
  }
  /**
   * 启动后台自动化排程任务（猫猫旅行巡检 + 福利吃满 + 每 5 分钟 Token 保活）
   */
  startAutoRoutines(intervalMs = 2 * 60 * 60 * 1e3) {
    if (!this.autoTimer) {
      console.log(`[scheduler] \u542F\u52A8\u540E\u53F0\u81EA\u52A8\u5316\u6392\u7A0B\uFF1A\u732B\u732B\u65C5\u884C\u4E0E Token \u4FDD\u6D3B (\u5DE1\u68C0\u5468\u671F ${Math.round(intervalMs / 6e4)} \u5206\u949F)`);
      this.autoTimer = setInterval(async () => {
        const cfg = this.configStore ? this.configStore.getAll() : {};
        try {
          if (cfg.autoCheckin !== false) {
            await this.runAllWelfare();
          } else if (cfg.autoTravel !== false) {
            await this.runAllTravel();
          }
        } catch (e) {
          console.warn("[scheduler] \u81EA\u52A8\u798F\u5229/\u65C5\u884C\u5DE1\u68C0\u5F02\u5E38:", e.message);
        }
      }, intervalMs);
      if (this.autoTimer.unref) this.autoTimer.unref();
    }
    if (!this.keepaliveTimer) {
      this.keepaliveTimer = setInterval(async () => {
        const cfg = this.configStore ? this.configStore.getAll() : {};
        if (cfg.autoRefreshToken === false) return;
        try {
          await this.refreshKeepalive();
        } catch (e) {
          console.warn("[scheduler] Token \u4FDD\u6D3B\u5237\u65B0\u5F02\u5E38:", e.message);
        }
      }, KEEPALIVE_INTERVAL_MS);
      if (this.keepaliveTimer.unref) this.keepaliveTimer.unref();
    }
  }
  /**
   * 停止后台自动化排程与保活定时器
   */
  stopAutoRoutines() {
    if (this.autoTimer) {
      clearInterval(this.autoTimer);
      this.autoTimer = null;
    }
    if (this.keepaliveTimer) {
      clearInterval(this.keepaliveTimer);
      this.keepaliveTimer = null;
    }
    const pending = this.waiters.splice(0, this.waiters.length);
    for (const w of pending) {
      clearTimeout(w.timer);
      w.resolve(false);
    }
  }
};

// src/upstream/client.js
import crypto4 from "node:crypto";

// src/upstream/payload.js
import crypto3 from "node:crypto";

// src/upstream/efforts.js
function getEffortCapability(realm, modelId) {
  const bareModel = modelId.replace(/^(cn:|global:|solo:|trae:)/i, "");
  const isGlobal = realm === "global" || modelId.startsWith("global:");
  const table = isGlobal ? GLOBAL_EFFORT_FALLBACK : CN_EFFORT_FALLBACK;
  return table[bareModel] || null;
}
function normalizeReasoningEffort(realm, modelId, effort) {
  if (!effort || typeof effort !== "string") return null;
  const lower = effort.trim().toLowerCase();
  if (lower === "off" || lower === "none" || lower === "default") {
    return null;
  }
  const cap = getEffortCapability(realm, modelId);
  if (!cap) {
    const allowed = ["low", "medium", "high", "xhigh", "max"];
    return allowed.includes(lower) ? lower : null;
  }
  if (cap.efforts && cap.efforts.includes(lower)) {
    return lower;
  }
  return cap.defaultEffort || null;
}

// src/upstream/payload.js
var REWRITE_RULES = [
  [
    "You are Claude Code, Anthropic's official CLI for Claude",
    "You are Claude Code, Anthropic's official CLI tool for Claude"
  ],
  [
    "Main branch (you will usually use this for PRs)",
    "Default branch (you will usually use this for PRs)"
  ],
  [
    "You are a coding agent running in the Codex CLI, a terminal-based coding assistant.",
    "You are a coding agent running in the Codex CLI tool, a terminal-based coding assistant."
  ],
  [
    "To give feedback, users should report the issue at https://github.com/anthropics/claude-code/issues",
    "To provide feedback, users should report the issue at https://github.com/anthropics/claude-code/issues"
  ],
  [
    "11128",
    "11-128"
  ]
];
function sanitizeText(text) {
  if (typeof text !== "string" || !text) return text;
  let out = text;
  const needsSanitize = out.includes("x-anthropic-billing-header") || out.includes("X-Anthropic-Billing-Header") || out.includes("cc_") || out.includes("You are Claude Code") || out.includes("Main branch (") || out.includes("Codex CLI") || out.includes("github.com/anthropics/") || out.includes("11128");
  if (!needsSanitize) return out;
  for (const [src, dst] of REWRITE_RULES) {
    if (out.includes(src)) {
      out = out.split(src).join(dst);
    }
  }
  out = out.replace(/x-anthropic-billing-header:[^;\n]*;?\s*/gi, "");
  out = out.replace(/x-anthropic-billing-header/gi, "x-anthropic-billing-hdr");
  if (out.includes("cc_")) {
    out = out.replace(/\bcc_[a-z0-9_]+=[^;\n]*;?\s*/gi, "");
  }
  return out;
}
function sanitizeAndNormalizeMessages(messages, realm) {
  if (!Array.isArray(messages)) return [];
  const result = messages.map((m) => {
    if (!m || typeof m !== "object") return m;
    const msg = { ...m };
    if (typeof msg.role === "string" && msg.role.trim().toLowerCase() === "developer") {
      msg.role = "system";
    }
    if (typeof msg.content === "string") {
      msg.content = sanitizeText(msg.content);
    } else if (Array.isArray(msg.content)) {
      msg.content = msg.content.map((part) => {
        if (!part || typeof part !== "object") return part;
        if (part.type === "text" && typeof part.text === "string") {
          return { ...part, text: sanitizeText(part.text) };
        }
        return part;
      });
    }
    if (Array.isArray(msg.tool_calls)) {
      msg.tool_calls = msg.tool_calls.map((tc) => {
        if (tc?.function && typeof tc.function.arguments === "string") {
          return {
            ...tc,
            function: {
              ...tc.function,
              arguments: sanitizeText(tc.function.arguments)
            }
          };
        }
        return tc;
      });
    }
    return msg;
  });
  if (realm === "global" && result.length > 0) {
    const firstRole = String(result[0]?.role || "").trim().toLowerCase();
    if (firstRole !== "system") {
      result.unshift({ role: "system", content: "You are a helpful assistant." });
    }
  }
  return result;
}
function cleanupOrphanToolMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0) return messages;
  const validToolCallIds = /* @__PURE__ */ new Set();
  const resolvedToolResultIds = /* @__PURE__ */ new Set();
  for (const m of messages) {
    if (m.role === "assistant" && Array.isArray(m.tool_calls)) {
      for (const tc of m.tool_calls) {
        if (tc?.id) validToolCallIds.add(tc.id);
      }
    }
    if (m.role === "tool" && m.tool_call_id) {
      resolvedToolResultIds.add(m.tool_call_id);
    }
  }
  return messages.filter((m) => {
    if (m.role === "tool" && m.tool_call_id) {
      return validToolCallIds.has(m.tool_call_id);
    }
    return true;
  });
}
function normalizeToolChoice(obj) {
  if (!("tool_choice" in obj)) return;
  const tc = obj.tool_choice;
  if (typeof tc === "string") {
    if (tc.trim().toLowerCase() === "none") {
      delete obj.tool_choice;
      delete obj.tools;
      delete obj.functions;
    }
    return;
  }
  if (tc && typeof tc === "object") {
    const typ = String(tc.type || "").trim().toLowerCase();
    if (typ === "none") {
      delete obj.tool_choice;
      delete obj.tools;
      delete obj.functions;
    } else if (typ === "auto" || typ === "required") {
      obj.tool_choice = typ;
    } else if (typ === "function") {
      const name2 = String(tc.function?.name || tc.name || "").trim();
      obj.tool_choice = name2 || "auto";
    } else {
      delete obj.tool_choice;
    }
    return;
  }
  delete obj.tool_choice;
}
function translateMaxCompletionTokens(obj) {
  if ("max_completion_tokens" in obj) {
    const alias = obj.max_completion_tokens;
    delete obj.max_completion_tokens;
    if (!("max_tokens" in obj) && typeof alias === "number" && alias > 0) {
      obj.max_tokens = Math.floor(alias);
    }
  }
}
function applyDeepSeekThinking(obj, bareModel) {
  const isDeepSeek = bareModel.toLowerCase().startsWith("deepseek");
  if (!isDeepSeek) return;
  const explicitDisabled = String(obj.thinking?.type || "").toLowerCase() === "disabled";
  if (explicitDisabled) {
    delete obj.reasoning_effort;
    delete obj.reasoningEffort;
  } else {
    obj.thinking = { type: "enabled" };
    if (!obj.reasoning_effort && !obj.reasoningEffort) {
      obj.reasoning_effort = "high";
    }
  }
  const thinkingEnabled = obj.thinking?.type === "enabled";
  const hasTrace = (obj.messages || []).some(
    (m) => typeof m.reasoning === "string" && m.reasoning || "reasoning_content" in m
  );
  if (thinkingEnabled || hasTrace) {
    obj.messages = (obj.messages || []).map((m) => {
      if (m.role !== "assistant") return m;
      if (typeof m.reasoning_content === "string") return m;
      const copy = { ...m };
      copy.reasoning_content = typeof copy.reasoning === "string" ? copy.reasoning : "";
      return copy;
    });
  }
}
function buildPromptCacheKey(uid, conversationId) {
  const uid8 = (uid || "-").slice(0, 8);
  const sum = crypto3.createHash("sha256").update(`${uid || ""}|${conversationId || ""}`).digest("hex");
  return `wb2a-${uid8}-${sum.slice(0, 32)}`;
}
function prepareOutboundPayload(reqBody, preparedMessages, { realm, uid, bareModel, conversationId }) {
  const obj = { ...reqBody };
  obj.model = bareModel;
  obj.stream = true;
  if (!obj.stream_options) {
    obj.stream_options = { include_usage: true };
  }
  translateMaxCompletionTokens(obj);
  let msgs = sanitizeAndNormalizeMessages(preparedMessages, realm);
  msgs = cleanupOrphanToolMessages(msgs);
  obj.messages = msgs;
  normalizeToolChoice(obj);
  applyDeepSeekThinking(obj, bareModel);
  const rawEffort = obj.reasoning_effort || obj.reasoningEffort;
  const normalizedEffort = normalizeReasoningEffort(realm, bareModel, rawEffort);
  delete obj.reasoningEffort;
  if (normalizedEffort) {
    obj.reasoning_effort = normalizedEffort;
  } else {
    delete obj.reasoning_effort;
  }
  if (!obj.conversation_id) obj.conversation_id = conversationId;
  if (!obj.conversationId) obj.conversationId = conversationId;
  if (!obj.prompt_cache_key) {
    obj.prompt_cache_key = buildPromptCacheKey(uid, obj.conversation_id);
  }
  return obj;
}

// src/upstream/vision.js
async function inlineImageUrl(url, timeoutMs = 15e3) {
  if (!url || typeof url !== "string") return url;
  if (url.startsWith("data:image/")) return url;
  if (!/^https?:\/\//i.test(url)) return url;
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(timeoutMs),
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const contentType = res.headers.get("content-type") || "image/jpeg";
    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    return `data:${contentType};base64,${base64}`;
  } catch (err) {
    console.warn(`[vision] \u56FE\u7247\u8FDC\u7AEF\u5185\u8054\u5931\u8D25 (${url}):`, err.message);
    return null;
  }
}
async function prepareMessagesWithVision(messages) {
  if (!Array.isArray(messages)) return messages;
  const processed = [];
  for (const msg of messages) {
    if (!msg || typeof msg !== "object") {
      processed.push(msg);
      continue;
    }
    if (typeof msg.content === "string") {
      processed.push(msg);
      continue;
    }
    if (Array.isArray(msg.content)) {
      const newParts = [];
      for (const part of msg.content) {
        if (!part || typeof part !== "object") continue;
        if (part.type === "image_url" && part.image_url?.url) {
          const inlined = await inlineImageUrl(part.image_url.url);
          if (inlined) {
            newParts.push({
              type: "image_url",
              image_url: { url: inlined }
            });
          } else {
            newParts.push({
              type: "text",
              text: `[\u56FE\u7247\u65E0\u6CD5\u52A0\u8F7D: ${part.image_url.url}]`
            });
          }
          continue;
        }
        if (part.type === "image" && part.source?.data) {
          const mime = part.source.media_type || "image/png";
          newParts.push({
            type: "image_url",
            image_url: { url: `data:${mime};base64,${part.source.data}` }
          });
          continue;
        }
        if (part.type === "document" || part.type === "file") {
          const text = part.text || part.content || `[\u9644\u4EF6: ${part.name || "\u6587\u6863"}]`;
          newParts.push({ type: "text", text });
          continue;
        }
        newParts.push(part);
      }
      processed.push({ ...msg, content: newParts });
      continue;
    }
    processed.push(msg);
  }
  return processed;
}

// src/upstream/video.js
function isVideoModel(model) {
  if (!model || typeof model !== "string") return false;
  const m = model.toLowerCase();
  return m.includes("kling") || m.includes("keling") || m.includes("\u53EF\u7075") || m.includes("minimax-video") || m.includes("hailuo") || m.includes("\u6D77\u87BA");
}
function extractVideoPrompt(messages) {
  if (!Array.isArray(messages) || messages.length === 0) {
    return { prompt: "", imageUrl: "" };
  }
  let prompt = "";
  let imageUrl = "";
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg.role === "user") {
      if (typeof msg.content === "string") {
        prompt = msg.content;
      } else if (Array.isArray(msg.content)) {
        for (const part of msg.content) {
          if (part.type === "text") {
            prompt += (prompt ? " " : "") + part.text;
          } else if (part.type === "image_url" && part.image_url?.url) {
            imageUrl = part.image_url.url;
          }
        }
      }
      break;
    }
  }
  return { prompt: prompt || "\u751F\u6210\u9AD8\u8D28\u91CF\u81EA\u7136\u666F\u89C2\u89C6\u9891", imageUrl };
}
async function executeVideoChatBridge(account, model, messages, onChunk) {
  const isGlobal = account.auth?.realm === "global";
  const base = isGlobal ? GLOBAL_BASE : CN_CHAT_BASE;
  const { prompt, imageUrl } = extractVideoPrompt(messages);
  const normalizedModel = model.includes("minimax") || model.includes("hailuo") || model.includes("\u6D77\u87BA") ? "minimax-video-h3" : "kling-video-v3";
  const reqBody = {
    model: normalizedModel,
    prompt,
    seconds: 5,
    ...imageUrl ? { image_url: imageUrl } : {}
  };
  onChunk?.(`\u{1F3AC} \u6B63\u5728\u63D0\u4EA4 ${normalizedModel} \u89C6\u9891\u751F\u6210\u4EFB\u52A1...

\u63D0\u793A\u8BCD: "${prompt}"

`);
  const createRes = await fetch(`${base}${VIDEO_GENERATIONS_PATH}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${account.auth.accessToken}`,
      "Content-Type": "application/json",
      "X-User-Id": account.account?.uid || "",
      "Origin": base,
      "User-Agent": "WorkBuddy/1.2.34"
    },
    body: JSON.stringify(reqBody)
  });
  const createData = await createRes.json().catch(() => ({}));
  if (!createRes.ok || createData.code !== 0 && createData.code !== 200) {
    throw new Error(createData.msg || `\u89C6\u9891\u4EFB\u52A1\u521B\u5EFA\u5931\u8D25 (${createRes.status})`);
  }
  const taskId = createData.data?.id || createData.id;
  if (!taskId) {
    throw new Error("\u672A\u83B7\u53D6\u5230\u89C6\u9891\u4EFB\u52A1 ID");
  }
  onChunk?.(`\u23F3 \u4EFB\u52A1 ID: \`${taskId}\`\uFF0C\u6B63\u5728\u6392\u961F\u6E32\u67D3\u4E2D\uFF0C\u8BF7\u7A0D\u5019...

`);
  const startTime = Date.now();
  while (Date.now() - startTime < 18e4) {
    await new Promise((r) => setTimeout(r, 4e3));
    try {
      const queryRes = await fetch(`${base}${VIDEO_GENERATIONS_PATH}/${taskId}`, {
        headers: {
          "Authorization": `Bearer ${account.auth.accessToken}`,
          "X-User-Id": account.account?.uid || "",
          "Origin": base,
          "User-Agent": "WorkBuddy/1.2.34"
        }
      });
      const queryData = await queryRes.json().catch(() => ({}));
      const status = queryData.data?.status || queryData.status;
      if (status === "completed" || status === "succeeded" || status === "success") {
        const videoUrl = queryData.data?.data?.[0]?.url || queryData.data?.url || queryData.url;
        onChunk?.(`

\u2705 \u89C6\u9891\u751F\u6210\u6210\u529F\uFF01

[\u25B6 \u70B9\u51FB\u64AD\u653E\u89C6\u9891](${videoUrl})

<video controls src="${videoUrl}" width="100%"></video>
`);
        return videoUrl;
      }
      if (status === "failed" || status === "error") {
        throw new Error(queryData.data?.error?.message || queryData.msg || "\u89C6\u9891\u751F\u6210\u4EFB\u52A1\u5931\u8D25");
      }
      onChunk?.(`.`);
    } catch (e) {
      if (e.message.includes("\u5931\u8D25")) throw e;
    }
  }
  throw new Error("\u89C6\u9891\u6E32\u67D3\u8D85\u65F6\uFF0C\u8BF7\u7A0D\u540E\u68C0\u67E5");
}

// src/upstream/client.js
var CLIENT_VERSION = "5.5.4";
var CLI_VERSION = "2.137.1";
function deriveAccountStableID(uid, purpose) {
  return crypto4.createHash("sha256").update(`wb2a:${purpose}:${uid || ""}`).digest("hex").slice(0, 36);
}
function isValidHexTrace(s) {
  return typeof s === "string" && /^[0-9a-f]{16}$|^[0-9a-f]{32}$/i.test(s);
}
var UpstreamClient = class {
  constructor(options = {}) {
    this.proxy = options.proxy || process.env.HTTPS_PROXY || process.env.HTTP_PROXY || "";
    this.customUA = options.userAgent || "";
    this.onTokenRefresh = options.onTokenRefresh || null;
  }
  getChatBase(account) {
    return account.auth?.realm === "global" ? GLOBAL_BASE : CN_CHAT_BASE;
  }
  getBillingBase(account) {
    return account.auth?.realm === "global" ? GLOBAL_BASE : CN_BILLING_BASE;
  }
  getOrigin(account) {
    return account.auth?.realm === "global" ? GLOBAL_BASE : CN_BILLING_BASE;
  }
  /**
   * 构造上游全量统一请求头（全面对齐官方桌面端通道校验与追踪头族）
   */
  buildHeaders(account, isChat = false, meta = {}) {
    const isGlobal = account.auth?.realm === "global";
    const origin = this.getOrigin(account);
    const platform = isGlobal ? "WorkBuddy AI" : "WorkBuddy";
    const fullUA = `WorkBuddy/${CLIENT_VERSION} ${platform}/${CLIENT_VERSION} CLI/${CLI_VERSION}`;
    const uid = account.account?.uid || "";
    const headers = {
      "Accept": isChat ? "application/json, text/event-stream" : "application/json",
      "Content-Type": "application/json",
      "Origin": origin,
      "Referer": `${origin}/`,
      "X-Requested-With": "XMLHttpRequest",
      "User-Agent": this.customUA || (isChat ? fullUA : `WorkBuddy/${CLIENT_VERSION}`),
      "X-CodeBuddy-Request": "1",
      "Accept-Language": isGlobal ? "en-US" : "zh-CN"
    };
    if (uid) {
      headers["X-Machine-ID"] = deriveAccountStableID(uid, "machine");
      headers["X-Session-ID"] = deriveAccountStableID(uid, "session");
      headers["X-User-Id"] = uid;
    } else {
      headers["X-No-User-Id"] = "1";
    }
    if (account.auth?.accessToken) {
      headers["Authorization"] = `Bearer ${account.auth.accessToken}`;
    } else if (isChat) {
      headers["X-No-Authorization"] = "1";
    }
    if (isGlobal) {
      headers["X-No-Enterprise-Id"] = "1";
      headers["X-Domain"] = "www.workbuddy.ai";
    } else {
      if (account.account?.enterpriseId) {
        headers["X-Enterprise-Id"] = account.account.enterpriseId;
      } else {
        headers["X-No-Enterprise-Id"] = "1";
      }
      if (account.auth?.domain) {
        headers["X-Domain"] = account.auth.domain;
      } else {
        headers["X-No-Department-Info"] = "1";
      }
    }
    if (isChat) {
      headers["X-Agent-Purpose"] = "conversation";
      headers["X-IDE-Name"] = "WorkBuddy";
      headers["X-IDE-Type"] = "WorkBuddy";
      headers["X-IDE-Version"] = CLIENT_VERSION;
      headers["X-Product"] = "WorkBuddy";
      const convId = meta.conversationId || crypto4.randomUUID();
      const convReqId = meta.conversationRequestId || crypto4.randomBytes(16).toString("hex");
      const msgId = crypto4.randomBytes(16).toString("hex");
      const traceId = meta.traceId || convReqId;
      const b3Trace = isValidHexTrace(convReqId) ? convReqId : msgId;
      headers["X-Conversation-ID"] = convId;
      headers["X-Conversation-Request-ID"] = convReqId;
      headers["X-Conversation-Message-ID"] = msgId;
      headers["X-Request-ID"] = msgId;
      headers["X-Root-Request-ID"] = convReqId;
      headers["X-Trace-ID"] = traceId;
      headers["X-B3-TraceId"] = b3Trace;
      headers["X-B3-SpanId"] = msgId.slice(0, 16);
      headers["X-B3-Sampled"] = "1";
    }
    return headers;
  }
  /**
   * 错误归类逻辑
   */
  classifyError(status, bodyText) {
    const text = (bodyText || "").toLowerCase();
    if (status === 401 || text.includes("12153") || text.includes("token expired") || text.includes("session dead")) {
      return ErrKind.SESSION_DEAD;
    }
    if (status === 402 || text.includes("credit") || text.includes("balance") || text.includes("\u4F59\u989D\u4E0D\u8DB3") || text.includes("\u79EF\u5206\u4E0D\u8DB3")) {
      return ErrKind.HARD_CREDIT;
    }
    if (status === 429 || text.includes("6004") || text.includes("rate limit") || text.includes("frequency")) {
      return ErrKind.SOFT_RATE;
    }
    if (text.includes("11128") || text.includes("content") || text.includes("sensitive") || text.includes("violation")) {
      return ErrKind.CONTENT_BLOCKED;
    }
    if (status === 403) {
      return ErrKind.WAF_BLOCK;
    }
    if (text.includes("11140") || text.includes("account blocked") || text.includes("trial not activated")) {
      return ErrKind.ACCOUNT_FAULT;
    }
    if (text.includes("11115") || text.includes("prompt is too long")) {
      return ErrKind.PROMPT_TOO_LONG;
    }
    if (text.includes("11101") || text.includes("unmarshal") || text.includes("bad param")) {
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
      throw new Error("No refresh token available");
    }
    const base = this.getChatBase(account);
    const url = `${base}${TOKEN_REFRESH_PATH}`;
    const headers = this.buildHeaders(account, false);
    headers["X-Refresh-Token"] = account.auth.refreshToken;
    headers["X-Auth-Refresh-Source"] = "workbuddy";
    const res = await fetch(url, {
      method: "POST",
      headers,
      signal: AbortSignal.timeout(15e3)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.code !== 0 && data.code !== 200) {
      throw new Error(data.msg || `Token \u5237\u65B0\u5931\u8D25 (HTTP ${res.status})`);
    }
    const payload = data.data || {};
    const newAccess = payload.accessToken || payload.access_token;
    const newRefresh = payload.refreshToken || payload.refresh_token || account.auth.refreshToken;
    const expiresIn = payload.expiresIn || 7200;
    if (!newAccess) {
      throw new Error("\u672A\u8FD4\u56DE\u6709\u6548 accessToken");
    }
    account.auth.accessToken = newAccess;
    account.auth.refreshToken = newRefresh;
    account.auth.expiresAt = Date.now() + expiresIn * 1e3;
    account.updatedAt = Date.now();
    if (typeof this.onTokenRefresh === "function") {
      try {
        this.onTokenRefresh(account);
      } catch (_) {
      }
    }
    return account;
  }
  /**
   * 拉取账号余额与套餐信息
   */
  async fetchBalance(account) {
    const isGlobal = account.auth?.realm === "global";
    const base = this.getBillingBase(account);
    const primaryPath = isGlobal ? BILLING_METER_PATH_GLOBAL : BILLING_METER_PATH_CN;
    const fallbackPath = isGlobal ? BILLING_METER_PATH_CN : BILLING_METER_PATH_GLOBAL;
    const doRequest = async (path4) => {
      const url = `${base}${path4}`;
      const res2 = await fetch(url, {
        method: "POST",
        headers: this.buildHeaders(account, false),
        body: JSON.stringify({}),
        signal: AbortSignal.timeout(1e4)
      });
      const data2 = await res2.json().catch(() => ({}));
      return { res: res2, data: data2 };
    };
    let { res, data } = await doRequest(primaryPath);
    const isAuthErr = res.status === 401 || data.code === 401 || data.code === 12153 || data.code === 10002 || typeof data.msg === "string" && /token|auth|expire|unauthorized/i.test(data.msg);
    if (isAuthErr && account.auth?.refreshToken) {
      try {
        await this.refreshToken(account);
        const retry = await doRequest(primaryPath);
        res = retry.res;
        data = retry.data;
      } catch (err) {
        throw new Error(`Token \u5DF2\u5931\u6548\u4E14\u5237\u65B0\u5931\u8D25: ${err.message}`);
      }
    }
    if (res.status === 404) {
      const fallback = await doRequest(fallbackPath);
      if (fallback.res.ok) {
        res = fallback.res;
        data = fallback.data;
      }
    }
    if (!res.ok || data.code !== 0 && data.code !== 200) {
      throw new Error(data.msg || `\u67E5\u8BE2\u4F59\u989D\u5931\u8D25 (${res.status})`);
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
    const soonWindowMs = 7 * 86400 * 1e3;
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
        const pkgName = String(a.PackageName || "\u79EF\u5206\u5305");
        const lowName = pkgName.toLowerCase();
        if (lowName.includes("subscription") || lowName.includes("\u8BA2\u9605") || lowName.includes("free plan") || lowName.includes("base")) {
          baseRemain += pRemain;
        } else if (lowName.includes("bonus") || lowName.includes("gift") || lowName.includes("\u8BD5\u7528") || lowName.includes("\u8D60\u9001") || lowName.includes("\u6D3B\u52A8") || lowName.includes("trial")) {
          bonusRemain += pRemain;
        } else {
          purchasedRemain += pRemain;
        }
        const expireStr = a.CycleEndTime || a.ExpiredTime || "";
        if (expireStr && pRemain > 0) {
          const expMs = Date.parse(expireStr);
          if (!Number.isNaN(expMs) && expMs > nowMs && expMs - nowMs <= soonWindowMs) {
            expiringRemain += pRemain;
          }
        }
        if (pRemain > 0 || a.Status !== 3 && pSize > 0) {
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
          name: p.packageName || p.name || "\u79EF\u5206\u5305",
          remain: pr,
          used: pu,
          size: pr + pu,
          expireTime: p.expireTime || p.expiresAt || ""
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
    const isGlobal = account.auth?.realm === "global";
    const base = this.getChatBase(account);
    const prefix = isGlobal ? "global:" : "cn:";
    const models = [];
    const seen = /* @__PURE__ */ new Set();
    const addItem = (item) => {
      const bare = item.id || item.model || item.name;
      if (!bare || item.disabled) return;
      const fullId = /^(cn:|global:)/i.test(bare) ? bare : `${prefix}${bare}`;
      if (seen.has(fullId)) return;
      seen.add(fullId);
      models.push({
        id: fullId,
        bareId: bare,
        realm: isGlobal ? "global" : "cn",
        name: item.displayName || item.name || bare,
        contextWindow: item.maxInputTokens || item.contextWindow || item.context_length || 2e5,
        maxTokens: item.maxOutputTokens || item.maxTokens || 32e3,
        supportsImages: Boolean(item.supportsImages ?? item.multimodal ?? true),
        supportedEfforts: item.reasoning?.efforts || item.supportedEfforts || null,
        rate: item.rate || "\u6807\u51C6"
      });
    };
    for (const path4 of [V3_CONFIG_PATH, "/v2/models"]) {
      try {
        const res = await fetch(`${base}${path4}`, {
          headers: this.buildHeaders(account, false),
          signal: AbortSignal.timeout(8e3)
        });
        if (res.ok) {
          const json = await res.json().catch(() => ({}));
          const list = json.data?.models || json.models || (Array.isArray(json.data) ? json.data : []);
          for (const item of list) addItem(item);
        }
      } catch (_) {
      }
    }
    if (!isGlobal || models.length === 0) {
      try {
        const cnRes = await fetch(`${base}${CN_MODELS_PATH}`, {
          headers: this.buildHeaders(account, false),
          signal: AbortSignal.timeout(8e3)
        });
        if (cnRes.ok) {
          const cnData = await cnRes.json().catch(() => ({}));
          const list = Array.isArray(cnData.data) ? cnData.data : cnData.data?.models || [];
          for (const item of list) addItem(item);
        }
      } catch (_) {
      }
    }
    return models;
  }
  /**
   * 发起流式 Chat Completions 调用
   */
  async chatStream(account, reqBody, signal, meta = {}) {
    const realm = account.auth?.realm || "cn";
    const uid = account.account?.uid || "";
    const bareModel = (reqBody.model || "").replace(/^(cn:|global:|solo:|trae:)/i, "");
    if (isVideoModel(bareModel)) {
      return {
        isVideo: true,
        executeVideo: (onChunk) => executeVideoChatBridge(account, bareModel, reqBody.messages, onChunk)
      };
    }
    const preparedMessages = await prepareMessagesWithVision(reqBody.messages);
    const conversationId = reqBody.conversation_id || reqBody.conversationId || meta.conversationId || crypto4.randomUUID();
    const convReqId = meta.conversationRequestId || crypto4.randomBytes(16).toString("hex");
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
      method: "POST",
      headers,
      body: JSON.stringify(upstreamBody),
      signal
    });
    if (res.status === 401 && account.auth?.refreshToken) {
      try {
        await this.refreshToken(account);
        const retryHeaders = this.buildHeaders(account, true, chatMeta);
        res = await fetch(url, {
          method: "POST",
          headers: retryHeaders,
          body: JSON.stringify(upstreamBody),
          signal
        });
      } catch (_) {
      }
    }
    if (!res.ok) {
      let errText = await res.text().catch(() => "");
      let kind = this.classifyError(res.status, errText);
      if (kind === ErrKind.CONTENT_BLOCKED || res.status === 403) {
        const degradedMsgs = upstreamBody.messages.map(
          (m) => m.role === "system" ? { ...m, content: "You are a helpful AI coding assistant." } : m
        );
        const degradedBody = { ...upstreamBody, messages: degradedMsgs };
        try {
          const degRes = await fetch(url, {
            method: "POST",
            headers: this.buildHeaders(account, true, chatMeta),
            body: JSON.stringify(degradedBody),
            signal
          });
          if (degRes.ok) {
            return {
              ok: true,
              status: degRes.status,
              response: degRes,
              bodyStream: degRes.body
            };
          }
          errText = await degRes.text().catch(() => errText);
          kind = this.classifyError(degRes.status, errText);
        } catch (_) {
        }
      }
      return {
        ok: false,
        status: res.status,
        kind,
        message: errText || `\u4E0A\u6E38\u8FD4\u56DE HTTP ${res.status}`
      };
    }
    return {
      ok: true,
      status: res.status,
      response: res,
      bodyStream: res.body
    };
  }
};

// src/pool/ledger.js
import fs3 from "node:fs";
import path3 from "node:path";
import os3 from "node:os";
var UsageLedger = class {
  constructor(options = {}) {
    this.dshHome = options.dshHome || process.env.DSH_HOME || path3.join(os3.homedir(), ".dsh");
    this.filePath = path3.join(this.dshHome, ".workbuddy2api-usage.json");
    this.data = {
      days: {},
      // 'YYYY-MM-DD' -> { requests, inputTokens, outputTokens, models: {}, hours: {} }
      summary: { totalRequests: 0, totalInputTokens: 0, totalOutputTokens: 0 }
    };
    this.load();
  }
  load() {
    try {
      if (fs3.existsSync(this.filePath)) {
        this.data = JSON.parse(fs3.readFileSync(this.filePath, "utf8"));
      }
    } catch (_) {
    }
  }
  save() {
    try {
      if (!fs3.existsSync(this.dshHome)) {
        fs3.mkdirSync(this.dshHome, { recursive: true });
      }
      const keys = Object.keys(this.data.days).sort();
      if (keys.length > 60) {
        for (const oldKey of keys.slice(0, keys.length - 60)) {
          delete this.data.days[oldKey];
        }
      }
      fs3.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), "utf8");
    } catch (_) {
    }
  }
  getTodayKey() {
    const d = /* @__PURE__ */ new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
  record(model, inputTokens = 0, outputTokens = 0, cacheHit = false) {
    const today = this.getTodayKey();
    const hour = String((/* @__PURE__ */ new Date()).getHours());
    if (!this.data.days[today]) {
      this.data.days[today] = {
        requests: 0,
        inputTokens: 0,
        outputTokens: 0,
        cacheHits: 0,
        models: {},
        hours: {}
      };
    }
    const day = this.data.days[today];
    day.requests += 1;
    day.inputTokens += inputTokens;
    day.outputTokens += outputTokens;
    if (cacheHit) day.cacheHits = (day.cacheHits || 0) + 1;
    day.models[model] = (day.models[model] || 0) + 1;
    if (!day.hours[hour]) {
      day.hours[hour] = { requests: 0, tokens: 0 };
    }
    day.hours[hour].requests += 1;
    day.hours[hour].tokens += inputTokens + outputTokens;
    this.data.summary.totalRequests += 1;
    this.data.summary.totalInputTokens += inputTokens;
    this.data.summary.totalOutputTokens += outputTokens;
    this.save();
  }
  getStats() {
    const today = this.getTodayKey();
    const todayData = this.data.days[today] || { requests: 0, inputTokens: 0, outputTokens: 0, cacheHits: 0, hours: {}, models: {} };
    const dates = [];
    const now = /* @__PURE__ */ new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 864e5);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const item = this.data.days[k] || { requests: 0, inputTokens: 0, outputTokens: 0, cacheHits: 0 };
      const totalTokens = item.inputTokens + item.outputTokens;
      const hitRate = item.requests > 0 ? Math.round((item.cacheHits || 0) / item.requests * 100) : 0;
      dates.push({
        date: k.slice(5),
        requests: item.requests,
        tokens: totalTokens,
        hitRate
      });
    }
    const hourly = [];
    for (let h = 0; h < 24; h++) {
      const sh = String(h);
      hourly.push({
        hour: `${sh}\u65F6`,
        tokens: todayData.hours?.[sh]?.tokens || 0,
        requests: todayData.hours?.[sh]?.requests || 0
      });
    }
    return {
      today: {
        requests: todayData.requests,
        inputTokens: todayData.inputTokens,
        outputTokens: todayData.outputTokens,
        totalTokens: todayData.inputTokens + todayData.outputTokens,
        models: todayData.models
      },
      summary: this.data.summary,
      trend7d: dates,
      hourly
    };
  }
  /**
   * 重置本地用量统计账本
   */
  reset() {
    this.data = {
      days: {},
      summary: { totalRequests: 0, totalInputTokens: 0, totalOutputTokens: 0 }
    };
    this.save();
  }
};

// src/server/loopback.js
import http from "node:http";

// src/server/sse.js
function writeSSEHeaders(res) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    "Connection": "keep-alive",
    "X-Accel-Buffering": "no",
    "Access-Control-Allow-Origin": "*"
  });
  if (res.flush) res.flush();
}
function extractUsageFromPayload(parsed) {
  const u = parsed?.usage;
  if (!u || typeof u !== "object") return null;
  const promptTokens = Number(u.prompt_tokens ?? u.input_tokens ?? 0) || 0;
  const completionTokens = Number(u.completion_tokens ?? u.output_tokens ?? 0) || 0;
  const totalTokens = Number(u.total_tokens ?? promptTokens + completionTokens) || 0;
  const cachedTokens = Number(
    u.prompt_tokens_details?.cached_tokens ?? u.cache_read_input_tokens ?? u.cached_tokens ?? 0
  ) || 0;
  return {
    promptTokens,
    completionTokens,
    totalTokens,
    cachedTokens,
    cacheHit: cachedTokens > 0
  };
}
function startSSEHeartbeat(res, intervalMs = SSE_PING_INTERVAL_MS, isSafeToPing = null) {
  if (!res) return () => {
  };
  const timer = setInterval(() => {
    try {
      if (res.writableEnded || res.destroyed) {
        clearInterval(timer);
        return;
      }
      if (typeof isSafeToPing === "function" && !isSafeToPing()) {
        return;
      }
      res.write(": ping\n\n");
      if (res.flush) res.flush();
    } catch (_) {
      clearInterval(timer);
    }
  }, intervalMs);
  if (timer.unref) timer.unref();
  return () => clearInterval(timer);
}
function createSSELinePump(res, onEventOrOptions = {}) {
  const opts = typeof onEventOrOptions === "function" ? { onEvent: onEventOrOptions } : onEventOrOptions || {};
  const {
    onEvent = null,
    forwardRaw = true,
    heartbeatMs = SSE_PING_INTERVAL_MS
  } = opts;
  let buffer = "";
  let trailingCR = false;
  let lastActivityAt = Date.now();
  let stopped = false;
  let usagePromptTokens = 0;
  let usageCompletionTokens = 0;
  let cacheHit = false;
  let sawContentChars = 0;
  let sawDone = false;
  const stopHeartbeat = res && heartbeatMs > 0 ? startSSEHeartbeat(res, heartbeatMs, () => {
    if (stopped) return false;
    return buffer.length === 0 && Date.now() - lastActivityAt >= Math.max(500, heartbeatMs - 200);
  }) : () => {
  };
  const emitFrame = (rawFrame) => {
    const trimmed = rawFrame.trim();
    if (!trimmed) return;
    const lines = rawFrame.split("\n");
    const dataLines = [];
    for (const line of lines) {
      if (line.startsWith("data:")) {
        dataLines.push(line.slice(5).trimStart());
      }
    }
    const dataStr = dataLines.join("\n").trim();
    if (dataStr === "[DONE]") {
      sawDone = true;
      if (typeof onEvent === "function") {
        onEvent(null, "[DONE]", rawFrame);
      }
    } else if (dataStr) {
      let parsed = null;
      try {
        parsed = JSON.parse(dataStr);
      } catch (_) {
      }
      if (parsed) {
        const extracted = extractUsageFromPayload(parsed);
        if (extracted) {
          if (extracted.promptTokens > 0) usagePromptTokens = Math.max(usagePromptTokens, extracted.promptTokens);
          if (extracted.completionTokens > 0) usageCompletionTokens = Math.max(usageCompletionTokens, extracted.completionTokens);
          if (extracted.cacheHit) cacheHit = true;
        }
        const choice0 = parsed.choices?.[0];
        const delta = choice0?.delta;
        if (delta) {
          if (typeof delta.content === "string") sawContentChars += delta.content.length;
          if (typeof delta.reasoning_content === "string") sawContentChars += delta.reasoning_content.length;
        }
      }
      if (typeof onEvent === "function") {
        onEvent(parsed, dataStr, rawFrame);
      }
    } else if (typeof onEvent === "function") {
      onEvent(null, "", rawFrame);
    }
    if (forwardRaw && res && !res.writableEnded) {
      res.write(`${rawFrame}

`);
      if (res.flush) res.flush();
      lastActivityAt = Date.now();
    }
  };
  return {
    push(chunkText) {
      if (!chunkText || stopped) return;
      let normalized = (trailingCR ? "\r" : "") + String(chunkText);
      trailingCR = normalized.endsWith("\r");
      if (trailingCR) {
        normalized = normalized.slice(0, -1);
      }
      normalized = normalized.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
      buffer += normalized;
      lastActivityAt = Date.now();
      let sepIdx;
      while ((sepIdx = buffer.indexOf("\n\n")) !== -1) {
        const frame = buffer.slice(0, sepIdx);
        buffer = buffer.slice(sepIdx + 2);
        emitFrame(frame);
      }
    },
    finish() {
      if (stopped) return;
      if (trailingCR) {
        buffer += "\n";
        trailingCR = false;
      }
      if (buffer.trim().length > 0) {
        emitFrame(buffer);
      }
      buffer = "";
      if (forwardRaw && res && !res.writableEnded && !sawDone) {
        res.write("data: [DONE]\n\n");
      }
      stopped = true;
      stopHeartbeat();
    },
    stop() {
      stopped = true;
      stopHeartbeat();
    },
    markActivity() {
      lastActivityAt = Date.now();
    },
    getUsage() {
      const completionTokens = usageCompletionTokens > 0 ? usageCompletionTokens : sawContentChars > 0 ? Math.max(1, Math.ceil(sawContentChars / 3)) : 0;
      return {
        promptTokens: usagePromptTokens,
        completionTokens,
        cacheHit
      };
    }
  };
}
function formatOpenAIChunk(id, model, deltaContent, finishReason = null) {
  const payload = {
    id: id || `chatcmpl-${Date.now()}`,
    object: "chat.completion.chunk",
    created: Math.floor(Date.now() / 1e3),
    model: model || "workbuddy",
    choices: [
      {
        index: 0,
        delta: deltaContent ? { content: deltaContent } : {},
        finish_reason: finishReason
      }
    ]
  };
  return `data: ${JSON.stringify(payload)}

`;
}

// src/server/messages.js
import crypto5 from "node:crypto";
function genId(prefix = "msg") {
  return `${prefix}_${crypto5.randomBytes(10).toString("hex")}`;
}
function safeJsonParse(str, fallback = {}) {
  if (typeof str !== "string" || !str.trim()) return fallback;
  try {
    return JSON.parse(str);
  } catch (_) {
    return fallback;
  }
}
function stringifyAnthropicContent(content) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return content ? JSON.stringify(content) : "";
  return content.map((b) => {
    if (typeof b === "string") return b;
    if (b?.type === "text") return b.text || "";
    if (b?.type === "image") return "[image]";
    return JSON.stringify(b);
  }).filter(Boolean).join("\n");
}
function mapStopReason(finishReason) {
  switch (finishReason) {
    case "tool_calls":
      return "tool_use";
    case "length":
      return "max_tokens";
    case "content_filter":
      return "refusal";
    default:
      return "end_turn";
  }
}
function anthropicToOpenAI(body = {}) {
  const messages = [];
  if (typeof body.system === "string" && body.system) {
    messages.push({ role: "system", content: body.system });
  } else if (Array.isArray(body.system)) {
    const sysText = body.system.map((b) => typeof b === "string" ? b : b?.text || "").filter(Boolean).join("\n");
    if (sysText) {
      messages.push({ role: "system", content: sysText });
    }
  }
  for (const msg of body.messages || []) {
    if (!msg) continue;
    if (msg.role === "user") {
      if (typeof msg.content === "string") {
        messages.push({ role: "user", content: msg.content });
        continue;
      }
      if (!Array.isArray(msg.content)) {
        messages.push({ role: "user", content: String(msg.content || "") });
        continue;
      }
      const toolResults = [];
      const userParts = [];
      for (const block of msg.content) {
        if (!block) continue;
        if (block.type === "tool_result") {
          toolResults.push({
            role: "tool",
            tool_call_id: block.tool_use_id || "",
            content: stringifyAnthropicContent(block.content)
          });
        } else if (block.type === "text") {
          userParts.push({ type: "text", text: block.text || "" });
        } else if (block.type === "image" && block.source) {
          if (block.source.type === "base64") {
            const mime = block.source.media_type || "image/png";
            userParts.push({
              type: "image_url",
              image_url: { url: `data:${mime};base64,${block.source.data || ""}` }
            });
          } else if (block.source.type === "url" && block.source.url) {
            userParts.push({
              type: "image_url",
              image_url: { url: block.source.url }
            });
          }
        }
      }
      for (const tr of toolResults) {
        messages.push(tr);
      }
      if (userParts.length > 0) {
        if (userParts.every((p) => p.type === "text")) {
          messages.push({
            role: "user",
            content: userParts.map((p) => p.text).join("\n")
          });
        } else {
          messages.push({ role: "user", content: userParts });
        }
      }
      continue;
    }
    if (msg.role === "assistant") {
      if (typeof msg.content === "string") {
        messages.push({ role: "assistant", content: msg.content });
        continue;
      }
      if (!Array.isArray(msg.content)) {
        messages.push({ role: "assistant", content: String(msg.content || "") });
        continue;
      }
      let textAcc = "";
      let thinkingAcc = "";
      const toolCalls = [];
      for (const block of msg.content) {
        if (!block) continue;
        if (block.type === "thinking") {
          thinkingAcc += block.thinking || "";
        } else if (block.type === "text") {
          textAcc += block.text || "";
        } else if (block.type === "tool_use") {
          toolCalls.push({
            id: block.id || genId("call"),
            type: "function",
            function: {
              name: block.name || "",
              arguments: typeof block.input === "string" ? block.input : JSON.stringify(block.input || {})
            }
          });
        }
      }
      const outMsg = {
        role: "assistant",
        content: textAcc || (toolCalls.length > 0 ? null : "")
      };
      if (thinkingAcc) outMsg.reasoning_content = thinkingAcc;
      if (toolCalls.length > 0) outMsg.tool_calls = toolCalls;
      messages.push(outMsg);
      continue;
    }
    messages.push({
      role: msg.role || "user",
      content: stringifyAnthropicContent(msg.content)
    });
  }
  const openaiPayload = {
    model: body.model || "",
    messages,
    max_tokens: body.max_tokens || 8192,
    stream: !!body.stream
  };
  if (typeof body.temperature === "number") openaiPayload.temperature = body.temperature;
  if (typeof body.top_p === "number") openaiPayload.top_p = body.top_p;
  if (Array.isArray(body.stop_sequences) && body.stop_sequences.length > 0) {
    openaiPayload.stop = body.stop_sequences;
  }
  if (Array.isArray(body.tools) && body.tools.length > 0) {
    openaiPayload.tools = body.tools.map((t) => ({
      type: "function",
      function: {
        name: t.name,
        description: t.description || "",
        parameters: t.input_schema || { type: "object", properties: {} }
      }
    }));
  }
  if (body.tool_choice) {
    const tc = body.tool_choice;
    if (tc.type === "auto") openaiPayload.tool_choice = "auto";
    else if (tc.type === "any") openaiPayload.tool_choice = "required";
    else if (tc.type === "none") openaiPayload.tool_choice = "none";
    else if (tc.type === "tool" && tc.name) {
      openaiPayload.tool_choice = { type: "function", function: { name: tc.name } };
    }
  }
  if (body.thinking?.type === "enabled") {
    const budget = Number(body.thinking.budget_tokens || 0);
    if (budget > 24576) openaiPayload.reasoning_effort = "max";
    else if (budget > 8192) openaiPayload.reasoning_effort = "high";
    else if (budget > 2048) openaiPayload.reasoning_effort = "medium";
    else openaiPayload.reasoning_effort = "high";
  }
  return openaiPayload;
}
function openAIToAnthropicResponse(completion, requestedModel) {
  const choice = completion?.choices?.[0] || {};
  const msg = choice.message || {};
  const content = [];
  if (msg.reasoning_content) {
    content.push({ type: "thinking", thinking: msg.reasoning_content });
  }
  if (msg.content) {
    content.push({ type: "text", text: msg.content });
  }
  if (Array.isArray(msg.tool_calls)) {
    for (const tc of msg.tool_calls) {
      content.push({
        type: "tool_use",
        id: tc.id || genId("toolu"),
        name: tc.function?.name || "",
        input: safeJsonParse(tc.function?.arguments, {})
      });
    }
  }
  if (content.length === 0) {
    content.push({ type: "text", text: "" });
  }
  const u = completion?.usage || {};
  const cached = u.prompt_tokens_details?.cached_tokens || 0;
  return {
    id: completion?.id?.startsWith("msg_") ? completion.id : genId("msg"),
    type: "message",
    role: "assistant",
    model: requestedModel || completion?.model || "workbuddy",
    content,
    stop_reason: mapStopReason(choice.finish_reason),
    stop_sequence: null,
    usage: {
      input_tokens: u.prompt_tokens || 0,
      output_tokens: u.completion_tokens || 0,
      ...cached > 0 ? { cache_read_input_tokens: cached } : {}
    }
  };
}
function sendAnthropicEvent(res, eventName, data) {
  if (!res || res.writableEnded) return;
  res.write(`event: ${eventName}
data: ${JSON.stringify(data)}

`);
  if (res.flush) res.flush();
}
function createAnthropicStreamEmitter(res, requestedModel) {
  writeSSEHeaders(res);
  const messageId = genId("msg");
  let started = false;
  let nextBlockIdx = 0;
  let activeSimpleBlock = null;
  const openToolBlocks = /* @__PURE__ */ new Map();
  let finishReason = null;
  let finalUsage = { promptTokens: 0, completionTokens: 0, cachedTokens: 0 };
  let ended = false;
  const ensureMessageStart = () => {
    if (started) return;
    started = true;
    sendAnthropicEvent(res, "message_start", {
      type: "message_start",
      message: {
        id: messageId,
        type: "message",
        role: "assistant",
        model: requestedModel || "workbuddy",
        content: [],
        stop_reason: null,
        stop_sequence: null,
        usage: { input_tokens: 0, output_tokens: 0 }
      }
    });
  };
  const closeActiveSimpleBlock = () => {
    if (!activeSimpleBlock) return;
    sendAnthropicEvent(res, "content_block_stop", {
      type: "content_block_stop",
      index: activeSimpleBlock.index
    });
    activeSimpleBlock = null;
  };
  const closeAllToolBlocks = () => {
    for (const tb of openToolBlocks.values()) {
      if (!tb.closed) {
        sendAnthropicEvent(res, "content_block_stop", {
          type: "content_block_stop",
          index: tb.blockIndex
        });
        tb.closed = true;
      }
    }
  };
  ensureMessageStart();
  return {
    pushOpenAIEvent(parsed) {
      if (!parsed || ended) return;
      if (parsed.usage) {
        const pt = Number(parsed.usage.prompt_tokens || 0);
        const ct = Number(parsed.usage.completion_tokens || 0);
        const cached = Number(parsed.usage.prompt_tokens_details?.cached_tokens || 0);
        if (pt > 0) finalUsage.promptTokens = Math.max(finalUsage.promptTokens, pt);
        if (ct > 0) finalUsage.completionTokens = Math.max(finalUsage.completionTokens, ct);
        if (cached > 0) finalUsage.cachedTokens = Math.max(finalUsage.cachedTokens, cached);
      }
      const choice = parsed.choices?.[0];
      if (!choice) return;
      if (choice.finish_reason) {
        finishReason = choice.finish_reason;
      }
      const delta = choice.delta || {};
      if (typeof delta.reasoning_content === "string" && delta.reasoning_content.length > 0) {
        if (activeSimpleBlock && activeSimpleBlock.type !== "thinking") {
          closeActiveSimpleBlock();
        }
        if (!activeSimpleBlock) {
          const idx = nextBlockIdx++;
          activeSimpleBlock = { index: idx, type: "thinking" };
          sendAnthropicEvent(res, "content_block_start", {
            type: "content_block_start",
            index: idx,
            content_block: { type: "thinking", thinking: "" }
          });
        }
        sendAnthropicEvent(res, "content_block_delta", {
          type: "content_block_delta",
          index: activeSimpleBlock.index,
          delta: { type: "thinking_delta", thinking: delta.reasoning_content }
        });
      }
      if (typeof delta.content === "string" && delta.content.length > 0) {
        if (activeSimpleBlock && activeSimpleBlock.type !== "text") {
          closeActiveSimpleBlock();
        }
        if (!activeSimpleBlock) {
          const idx = nextBlockIdx++;
          activeSimpleBlock = { index: idx, type: "text" };
          sendAnthropicEvent(res, "content_block_start", {
            type: "content_block_start",
            index: idx,
            content_block: { type: "text", text: "" }
          });
        }
        sendAnthropicEvent(res, "content_block_delta", {
          type: "content_block_delta",
          index: activeSimpleBlock.index,
          delta: { type: "text_delta", text: delta.content }
        });
      }
      if (Array.isArray(delta.tool_calls)) {
        closeActiveSimpleBlock();
        for (const tc of delta.tool_calls) {
          const tcIdx = tc.index ?? 0;
          let entry = openToolBlocks.get(tcIdx);
          if (!entry) {
            const blockIndex = nextBlockIdx++;
            entry = {
              blockIndex,
              id: tc.id || genId("toolu"),
              name: tc.function?.name || "",
              closed: false
            };
            openToolBlocks.set(tcIdx, entry);
            sendAnthropicEvent(res, "content_block_start", {
              type: "content_block_start",
              index: blockIndex,
              content_block: {
                type: "tool_use",
                id: entry.id,
                name: entry.name,
                input: {}
              }
            });
          }
          const argPart = tc.function?.arguments;
          if (typeof argPart === "string" && argPart.length > 0) {
            sendAnthropicEvent(res, "content_block_delta", {
              type: "content_block_delta",
              index: entry.blockIndex,
              delta: { type: "input_json_delta", partial_json: argPart }
            });
          }
        }
      }
    },
    finish(fallbackUsage = null) {
      if (ended) return;
      ended = true;
      closeActiveSimpleBlock();
      closeAllToolBlocks();
      const stopReason = mapStopReason(finishReason || (openToolBlocks.size > 0 ? "tool_calls" : "stop"));
      const outTokens = finalUsage.completionTokens || fallbackUsage?.completionTokens || 0;
      const inTokens = finalUsage.promptTokens || fallbackUsage?.promptTokens || 0;
      sendAnthropicEvent(res, "message_delta", {
        type: "message_delta",
        delta: {
          stop_reason: stopReason,
          stop_sequence: null
        },
        usage: {
          output_tokens: outTokens,
          input_tokens: inTokens
        }
      });
      sendAnthropicEvent(res, "message_stop", { type: "message_stop" });
      if (!res.writableEnded) res.end();
    }
  };
}

// src/server/responses.js
import crypto6 from "node:crypto";
function genId2(prefix = "resp") {
  return `${prefix}_${crypto6.randomBytes(10).toString("hex")}`;
}
function flattenResponseContent(content) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return content ? String(content) : "";
  const parts = [];
  for (const part of content) {
    if (!part) continue;
    if (typeof part === "string") {
      parts.push({ type: "text", text: part });
    } else if (part.type === "input_text" || part.type === "output_text" || part.type === "text") {
      parts.push({ type: "text", text: part.text || "" });
    } else if (part.type === "input_image" || part.type === "image_url") {
      const url = typeof part.image_url === "string" ? part.image_url : part.image_url?.url;
      if (url) parts.push({ type: "image_url", image_url: { url } });
    }
  }
  if (parts.length > 0 && parts.every((p) => p.type === "text")) {
    return parts.map((p) => p.text).join("\n");
  }
  return parts;
}
function responsesToChatPayload(body = {}) {
  const messages = [];
  if (typeof body.instructions === "string" && body.instructions.trim()) {
    messages.push({ role: "system", content: body.instructions });
  }
  if (typeof body.input === "string") {
    messages.push({ role: "user", content: body.input });
  } else if (Array.isArray(body.input)) {
    for (const item of body.input) {
      if (!item) continue;
      if (item.type === "function_call") {
        messages.push({
          role: "assistant",
          content: null,
          tool_calls: [
            {
              id: item.call_id || item.id || genId2("call"),
              type: "function",
              function: {
                name: item.name || "",
                arguments: typeof item.arguments === "string" ? item.arguments : JSON.stringify(item.arguments || {})
              }
            }
          ]
        });
      } else if (item.type === "function_call_output") {
        messages.push({
          role: "tool",
          tool_call_id: item.call_id || "",
          content: typeof item.output === "string" ? item.output : JSON.stringify(item.output || "")
        });
      } else {
        const role = item.role || "user";
        messages.push({
          role,
          content: flattenResponseContent(item.content)
        });
      }
    }
  }
  const chatPayload = {
    model: body.model || "",
    messages,
    stream: !!body.stream
  };
  if (body.max_output_tokens) chatPayload.max_tokens = body.max_output_tokens;
  if (typeof body.temperature === "number") chatPayload.temperature = body.temperature;
  if (typeof body.top_p === "number") chatPayload.top_p = body.top_p;
  if (body.reasoning?.effort) chatPayload.reasoning_effort = body.reasoning.effort;
  if (body.prompt_cache_key) chatPayload.prompt_cache_key = body.prompt_cache_key;
  if (Array.isArray(body.tools) && body.tools.length > 0) {
    chatPayload.tools = body.tools.map((t) => {
      if (t.function) return t;
      return {
        type: "function",
        function: {
          name: t.name || "",
          description: t.description || "",
          parameters: t.parameters || { type: "object", properties: {} }
        }
      };
    });
  }
  if (body.tool_choice) chatPayload.tool_choice = body.tool_choice;
  return chatPayload;
}
function chatCompletionToResponseObject(completion, requestedModel) {
  const choice = completion?.choices?.[0] || {};
  const msg = choice.message || {};
  const u = completion?.usage || {};
  const output = [];
  if (msg.reasoning_content) {
    output.push({
      id: genId2("rs"),
      type: "reasoning",
      summary: [{ type: "summary_text", text: msg.reasoning_content }]
    });
  }
  const text = msg.content || "";
  if (text || (!Array.isArray(msg.tool_calls) || msg.tool_calls.length === 0)) {
    output.push({
      id: genId2("msg"),
      type: "message",
      status: "completed",
      role: "assistant",
      content: [{ type: "output_text", text, annotations: [] }]
    });
  }
  if (Array.isArray(msg.tool_calls)) {
    for (const tc of msg.tool_calls) {
      output.push({
        id: genId2("fc"),
        type: "function_call",
        status: "completed",
        call_id: tc.id || genId2("call"),
        name: tc.function?.name || "",
        arguments: tc.function?.arguments || "{}"
      });
    }
  }
  return {
    id: genId2("resp"),
    object: "response",
    created_at: Math.floor(Date.now() / 1e3),
    status: "completed",
    model: requestedModel || completion?.model || "workbuddy",
    output,
    output_text: text,
    usage: {
      input_tokens: u.prompt_tokens || 0,
      output_tokens: u.completion_tokens || 0,
      total_tokens: (u.prompt_tokens || 0) + (u.completion_tokens || 0)
    }
  };
}
function sendResponsesEvent(res, type, data) {
  if (!res || res.writableEnded) return;
  res.write(`event: ${type}
data: ${JSON.stringify({ type, ...data })}

`);
  if (res.flush) res.flush();
}
function createResponsesStreamEmitter(res, requestedModel) {
  writeSSEHeaders(res);
  const respId = genId2("resp");
  const msgItemId = genId2("msg");
  const createdAt = Math.floor(Date.now() / 1e3);
  let msgOpened = false;
  let textAcc = "";
  let reasoningAcc = "";
  const toolMap = /* @__PURE__ */ new Map();
  let finalUsage = { promptTokens: 0, completionTokens: 0 };
  let ended = false;
  sendResponsesEvent(res, "response.created", {
    response: {
      id: respId,
      object: "response",
      created_at: createdAt,
      status: "in_progress",
      model: requestedModel || "workbuddy",
      output: []
    }
  });
  const ensureMsgOpened = () => {
    if (msgOpened) return;
    msgOpened = true;
    sendResponsesEvent(res, "response.output_item.added", {
      output_index: 0,
      item: {
        id: msgItemId,
        type: "message",
        status: "in_progress",
        role: "assistant",
        content: []
      }
    });
    sendResponsesEvent(res, "response.content_part.added", {
      item_id: msgItemId,
      output_index: 0,
      content_index: 0,
      part: { type: "output_text", text: "", annotations: [] }
    });
  };
  return {
    pushOpenAIEvent(parsed) {
      if (!parsed || ended) return;
      if (parsed.usage) {
        const pt = Number(parsed.usage.prompt_tokens || 0);
        const ct = Number(parsed.usage.completion_tokens || 0);
        if (pt > 0) finalUsage.promptTokens = Math.max(finalUsage.promptTokens, pt);
        if (ct > 0) finalUsage.completionTokens = Math.max(finalUsage.completionTokens, ct);
      }
      const delta = parsed.choices?.[0]?.delta || {};
      if (typeof delta.reasoning_content === "string" && delta.reasoning_content.length > 0) {
        reasoningAcc += delta.reasoning_content;
        sendResponsesEvent(res, "response.reasoning_summary_text.delta", {
          delta: delta.reasoning_content
        });
      }
      if (typeof delta.content === "string" && delta.content.length > 0) {
        ensureMsgOpened();
        textAcc += delta.content;
        sendResponsesEvent(res, "response.output_text.delta", {
          item_id: msgItemId,
          output_index: 0,
          content_index: 0,
          delta: delta.content
        });
      }
      if (Array.isArray(delta.tool_calls)) {
        for (const tc of delta.tool_calls) {
          const idx = tc.index ?? 0;
          let entry = toolMap.get(idx);
          if (!entry) {
            entry = {
              itemId: genId2("fc"),
              callId: tc.id || genId2("call"),
              name: tc.function?.name || "",
              arguments: "",
              outputIndex: idx + (msgOpened ? 1 : 0)
            };
            toolMap.set(idx, entry);
            sendResponsesEvent(res, "response.output_item.added", {
              output_index: entry.outputIndex,
              item: {
                id: entry.itemId,
                type: "function_call",
                status: "in_progress",
                call_id: entry.callId,
                name: entry.name,
                arguments: ""
              }
            });
          }
          const argPart = tc.function?.arguments;
          if (typeof argPart === "string" && argPart.length > 0) {
            entry.arguments += argPart;
            sendResponsesEvent(res, "response.function_call_arguments.delta", {
              item_id: entry.itemId,
              output_index: entry.outputIndex,
              delta: argPart
            });
          }
        }
      }
    },
    finish(fallbackUsage = null) {
      if (ended) return;
      ended = true;
      const output = [];
      if (reasoningAcc) {
        output.push({
          id: genId2("rs"),
          type: "reasoning",
          summary: [{ type: "summary_text", text: reasoningAcc }]
        });
      }
      if (msgOpened) {
        sendResponsesEvent(res, "response.output_text.done", {
          item_id: msgItemId,
          output_index: 0,
          content_index: 0,
          text: textAcc
        });
        const msgItem = {
          id: msgItemId,
          type: "message",
          status: "completed",
          role: "assistant",
          content: [{ type: "output_text", text: textAcc, annotations: [] }]
        };
        sendResponsesEvent(res, "response.output_item.done", {
          output_index: 0,
          item: msgItem
        });
        output.push(msgItem);
      }
      for (const entry of toolMap.values()) {
        const fcItem = {
          id: entry.itemId,
          type: "function_call",
          status: "completed",
          call_id: entry.callId,
          name: entry.name,
          arguments: entry.arguments || "{}"
        };
        sendResponsesEvent(res, "response.function_call_arguments.done", {
          item_id: entry.itemId,
          output_index: entry.outputIndex,
          arguments: fcItem.arguments
        });
        sendResponsesEvent(res, "response.output_item.done", {
          output_index: entry.outputIndex,
          item: fcItem
        });
        output.push(fcItem);
      }
      const inTok = finalUsage.promptTokens || fallbackUsage?.promptTokens || 0;
      const outTok = finalUsage.completionTokens || fallbackUsage?.completionTokens || 0;
      sendResponsesEvent(res, "response.completed", {
        response: {
          id: respId,
          object: "response",
          created_at: createdAt,
          status: "completed",
          model: requestedModel || "workbuddy",
          output,
          output_text: textAcc,
          usage: {
            input_tokens: inTok,
            output_tokens: outTok,
            total_tokens: inTok + outTok
          }
        }
      });
      if (!res.writableEnded) res.end();
    }
  };
}

// src/server/loopback.js
function readJsonBody(req, res, maxBytes = 25 * 1024 * 1024) {
  return new Promise((resolve) => {
    const chunks = [];
    let total = 0;
    let aborted = false;
    req.on("data", (chunk) => {
      if (aborted) return;
      total += chunk.length;
      if (total > maxBytes) {
        aborted = true;
        if (!res.headersSent) {
          res.writeHead(413, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: { message: "Request entity too large", type: "invalid_request_error" } }));
        }
        resolve(null);
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      if (aborted) return;
      const raw = Buffer.concat(chunks).toString("utf8").trim();
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (_) {
        if (!res.headersSent) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: { message: "Invalid JSON request body", type: "invalid_request_error" } }));
        }
        resolve(null);
      }
    });
    req.on("error", () => {
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
    res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  }
  res.end(JSON.stringify(payload));
}
var LoopbackGateway = class {
  constructor(scheduler, client, ledger, options = {}) {
    this.scheduler = scheduler;
    this.client = client;
    this.ledger = ledger;
    this.configStore = options.configStore || null;
    this.preferredPort = options.port ?? this.configStore?.get("gatewayPort") ?? DEFAULT_GATEWAY_PORT;
    this.apiKey = options.apiKey || "";
    this.modelAliases = { ...DEFAULT_MODEL_ALIASES, ...options.aliases || {} };
    this.enabledModels = new Set(options.enabledModels || []);
    this.dashboardHandler = options.dashboardHandler || null;
    this.pluginRouterHandler = options.pluginRouterHandler || null;
    this.discoveredModels = [];
    this.lastModelFetchAt = 0;
    this.videoTaskAccountMap = /* @__PURE__ */ new Map();
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
      apiKey: cfg.apiKey ?? this.apiKey ?? "",
      aliases: { ...DEFAULT_MODEL_ALIASES, ...this.modelAliases || {}, ...cfg.aliases || {} },
      enabledModels: Array.isArray(cfg.enabledModels) ? cfg.enabledModels : [...this.enabledModels],
      freeModels: Array.isArray(cfg.freeModels) && cfg.freeModels.length > 0 ? cfg.freeModels : ["global:deepseek-v4.1-flash", "cn:hy4free"],
      promptMode: cfg.promptMode || "none",
      promptText: cfg.promptText || ""
    };
  }
  checkAuth(req, url) {
    const { apiKey } = this._getRuntimeConfig();
    if (!apiKey) return true;
    const authHeader = String(req.headers["authorization"] || "");
    const bearer = authHeader.toLowerCase().startsWith("bearer ") ? authHeader.slice(7).trim() : "";
    const xKey = String(req.headers["x-api-key"] || "").trim();
    const queryKey = url.searchParams.get("key") || "";
    return bearer === apiKey || xKey === apiKey || queryKey === apiKey;
  }
  resolveModel(requestedModel) {
    const { aliases, freeModels } = this._getRuntimeConfig();
    let target = String(requestedModel || "auto-free").trim() || "auto-free";
    const seen = /* @__PURE__ */ new Set();
    while (aliases[target] && !seen.has(target)) {
      seen.add(target);
      target = aliases[target];
    }
    if (target === "auto-free") {
      target = freeModels[0] || "global:deepseek-v4.1-flash";
    }
    return target;
  }
  applyPromptMode(payload) {
    const { promptMode, promptText } = this._getRuntimeConfig();
    if (!promptMode || promptMode === "none" || promptMode === "passthrough" || !promptText || !Array.isArray(payload.messages)) {
      return;
    }
    if (promptMode === "replace" || promptMode === "custom") {
      const rest = payload.messages.filter((m) => m?.role !== "system" && m?.role !== "developer");
      payload.messages = [{ role: "system", content: promptText }, ...rest];
      return;
    }
    if (promptMode === "append") {
      const sysIdx = payload.messages.findIndex((m) => m?.role === "system" || m?.role === "developer");
      if (sysIdx !== -1 && typeof payload.messages[sysIdx].content === "string") {
        payload.messages[sysIdx] = {
          ...payload.messages[sysIdx],
          content: `${payload.messages[sysIdx].content}

${promptText}`
        };
      } else {
        payload.messages = [{ role: "system", content: promptText }, ...payload.messages];
      }
    }
  }
  /**
   * 主动拉取并合并上游最新 CN + Global 动态模型列表
   */
  async refreshDiscoveredModels() {
    const accounts = this.scheduler.store.getAll().filter((a) => !a.disabled);
    const cnAcc = accounts.find((a) => a.auth?.realm !== "global");
    const globalAcc = accounts.find((a) => a.auth?.realm === "global");
    const picked = [cnAcc, globalAcc].filter(Boolean);
    if (picked.length === 0) return this.getMergedModels(true);
    const discoveredMap = /* @__PURE__ */ new Map();
    for (const acc of picked) {
      try {
        const items = await this.client.fetchModels(acc);
        for (const item of items) {
          if (item?.id && !discoveredMap.has(item.id)) {
            discoveredMap.set(item.id, item);
          }
        }
      } catch (e) {
        console.warn(`[loopback] \u52A8\u6001\u62C9\u53D6 ${acc.auth?.realm} \u6A21\u578B\u76EE\u5F55\u5931\u8D25:`, e.message);
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
    const merged = /* @__PURE__ */ new Map();
    for (const m of STATIC_MODELS) {
      merged.set(m.id, { ...m, source: "static" });
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
          realm: dm.realm || "cn",
          contextWindow: dm.contextWindow || 128e3,
          maxTokens: dm.maxTokens || 32e3,
          supportsImages: !!dm.supportsImages,
          supportedEfforts: dm.supportedEfforts || [],
          rate: dm.rate || "\u52A8\u6001",
          badge: "\u65B0\u53D1\u73B0",
          source: "discovered"
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
      object: "model",
      created: 1726e6,
      owned_by: m.source === "discovered" ? "workbuddy-upstream" : "workbuddy2api",
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
          object: "model",
          created: 1726e6,
          owned_by: "workbuddy2api-alias",
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
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "*");
      if (req.method === "OPTIONS") {
        res.writeHead(200);
        res.end();
        return;
      }
      const url = new URL(req.url, `http://${req.headers.host || "127.0.0.1"}`);
      const pathname = url.pathname;
      try {
        if (req.method === "GET" && (pathname === "/" || pathname === "/console" || pathname === "/dashboard") && typeof this.dashboardHandler === "function" && url.searchParams.get("format") !== "json") {
          const handled = await this.dashboardHandler(req, res, pathname, url);
          if (handled) return;
        }
        if (pathname.startsWith("/plugins/dsh-workbuddy2api/") && typeof this.pluginRouterHandler === "function") {
          const handled = await this.pluginRouterHandler(req, res, pathname, url);
          if (handled) return;
        }
        if (req.method === "GET" && (pathname === "/health" || pathname === "/healthz" || pathname === "/status" || pathname === "/")) {
          const allAcc = this.scheduler.store.getAll();
          sendJson(res, 200, {
            status: "ok",
            service: "dsh-workbuddy2api",
            version: "1.1.0",
            port: this.actualPort || this.preferredPort,
            accounts: allAcc.length,
            enabledAccounts: allAcc.filter((a) => !a.disabled).length,
            active: this.scheduler.store.activeUid,
            discoveredModels: this.discoveredModels.length,
            uptimeSec: Math.floor((Date.now() - this.startedAt) / 1e3)
          });
          return;
        }
        if (!this.checkAuth(req, url)) {
          sendJson(res, 401, {
            error: { message: "Invalid or missing gateway API key", type: "authentication_error" }
          });
          return;
        }
        if (req.method === "GET" && pathname === "/v1/stats") {
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
        if (req.method === "POST" && pathname === "/v1/stats/reset") {
          this.ledger.reset();
          sendJson(res, 200, { ok: true, message: "\u7528\u91CF\u8D26\u672C\u5DF2\u6E05\u7A7A" });
          return;
        }
        if (req.method === "GET" && (pathname === "/v1/models" || pathname === "/models")) {
          const includeAll = url.searchParams.get("all") === "1";
          sendJson(res, 200, {
            object: "list",
            data: this.getModelsList(includeAll)
          });
          return;
        }
        if (req.method === "POST" && (pathname === "/v1/chat/completions" || pathname === "/chat/completions")) {
          const body = await readJsonBody(req, res);
          if (!body) return;
          await this.executeChatPipeline(req, res, body, "chat", body.model);
          return;
        }
        if (req.method === "POST" && (pathname === "/v1/messages" || pathname === "/messages")) {
          const body = await readJsonBody(req, res);
          if (!body) return;
          const openaiPayload = anthropicToOpenAI(body);
          await this.executeChatPipeline(req, res, openaiPayload, "anthropic", body.model);
          return;
        }
        if (req.method === "POST" && (pathname === "/v1/responses" || pathname === "/responses")) {
          const body = await readJsonBody(req, res);
          if (!body) return;
          const openaiPayload = responsesToChatPayload(body);
          await this.executeChatPipeline(req, res, openaiPayload, "responses", body.model);
          return;
        }
        if (req.method === "POST" && (pathname === "/v1/videos/generations" || pathname === "/v2/videos/generations")) {
          await this.handleVideoCreate(req, res);
          return;
        }
        if (req.method === "GET" && (pathname === "/v1/videos/tasks" || pathname === "/v2/videos/tasks")) {
          sendJson(res, 200, {
            object: "list",
            data: [...this.videoTaskAccountMap.entries()].map(([id, info]) => ({ id, ...info }))
          });
          return;
        }
        const videoMatch = pathname.match(/^\/v[12]\/videos\/(?:tasks|generations)\/([^/]+)$/);
        if (req.method === "GET" && videoMatch) {
          await this.handleVideoQuery(res, decodeURIComponent(videoMatch[1]));
          return;
        }
        sendJson(res, 404, { error: { message: "Not Found", type: "invalid_request_error" } });
      } catch (err) {
        if (!res.headersSent) {
          sendJson(res, 500, { error: { message: err.message, type: "api_error" } });
        }
      }
    });
    return new Promise((resolve) => {
      let retried = false;
      this.server.once("listening", () => {
        this.actualPort = this.server.address().port;
        console.log(`[loopback] \u{1F680} \u591A\u534F\u8BAE\u517C\u5BB9\u7F51\u5173\u4E0E\u63A7\u5236\u53F0\u5DF2\u5C31\u7EEA: http://127.0.0.1:${this.actualPort}/`);
        resolve(this.actualPort);
      });
      this.server.on("error", (err) => {
        if (err.code === "EADDRINUSE") {
          if (!retried && this.preferredPort !== 0) {
            retried = true;
            setTimeout(() => {
              this.server?.listen(this.preferredPort, "0.0.0.0");
            }, 200);
            return;
          }
          console.warn(`[loopback] \u7AEF\u53E3 ${this.preferredPort} \u88AB\u5360\u7528\uFF0C\u81EA\u52A8\u5206\u914D\u53EF\u7528\u7AEF\u53E3...`);
          this.server?.listen(0, "0.0.0.0");
        }
      });
      this.server.listen(this.preferredPort, "0.0.0.0");
    });
  }
  /**
   * 统一多协议对话执行流水线（支持 OpenAI Chat / Anthropic Messages / OpenAI Responses）
   */
  async executeChatPipeline(req, res, body, protocol = "chat", requestedModel = "") {
    const rawModel = requestedModel || body.model || "auto-free";
    const actualModel = this.resolveModel(rawModel);
    body.model = actualModel;
    this.applyPromptMode(body);
    const isStream = Boolean(body.stream);
    const reqId = `chatcmpl-${Date.now()}`;
    const conversationId = req.headers["x-conversation-id"] || req.headers["x-session-id"] || body.conversation_id || body.conversationId || "";
    const meta = {
      conversationId,
      conversationRequestId: req.headers["x-conversation-request-id"],
      traceId: req.headers["x-trace-id"]
    };
    const sessionKey = body.prompt_cache_key || conversationId || "";
    try {
      const execution = await this.scheduler.executeWithFailover(
        actualModel,
        async (account) => await this.client.chatStream(account, body, void 0, meta),
        { sessionKey }
      );
      if (execution.isVideo) {
        try {
          if (isStream) {
            if (protocol === "anthropic") {
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
              res.write(formatOpenAIChunk(reqId, rawModel, "", "stop"));
              res.write("data: [DONE]\n\n");
              res.end();
            }
          } else {
            let fullText2 = "";
            await execution.executeVideo((chunk) => {
              fullText2 += chunk;
            });
            const completion = {
              id: reqId,
              object: "chat.completion",
              created: Math.floor(Date.now() / 1e3),
              model: rawModel,
              choices: [{ index: 0, message: { role: "assistant", content: fullText2 }, finish_reason: "stop" }],
              usage: { prompt_tokens: 20, completion_tokens: Math.max(1, Math.ceil(fullText2.length / 4)) }
            };
            if (protocol === "anthropic") {
              sendJson(res, 200, openAIToAnthropicResponse(completion, rawModel));
            } else if (protocol === "responses") {
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
      const onResClose = () => {
        if (!res.writableEnded) {
          clientClosed = true;
          reader.cancel().catch(() => {
          });
        }
      };
      res.on("close", onResClose);
      if (isStream) {
        let emitter = null;
        if (protocol === "anthropic") {
          emitter = createAnthropicStreamEmitter(res, rawModel);
        } else if (protocol === "responses") {
          emitter = createResponsesStreamEmitter(res, rawModel);
        } else {
          writeSSEHeaders(res);
        }
        const pump = createSSELinePump(res, {
          forwardRaw: protocol === "chat",
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
          res.off("close", onResClose);
          execution.release();
          const u = pump.getUsage();
          this.ledger.record(actualModel, u.promptTokens, u.completionTokens, u.cacheHit);
        }
        return;
      }
      let fullText = "";
      let reasoningText = "";
      let finishReason = "stop";
      const toolCalls = /* @__PURE__ */ new Map();
      const aggPump = createSSELinePump(null, {
        forwardRaw: false,
        heartbeatMs: 0,
        onEvent: (parsed) => {
          const choice = parsed?.choices?.[0];
          if (!choice) return;
          const delta = choice.delta || {};
          if (typeof delta.content === "string") fullText += delta.content;
          if (typeof delta.reasoning_content === "string") reasoningText += delta.reasoning_content;
          if (Array.isArray(delta.tool_calls)) {
            for (const tc of delta.tool_calls) {
              if (!tc) continue;
              const idx = typeof tc.index === "number" ? tc.index : toolCalls.size;
              const cur = toolCalls.get(idx) || {
                id: "",
                type: "function",
                function: { name: "", arguments: "" }
              };
              if (tc.id) cur.id = tc.id;
              if (tc.type) cur.type = tc.type;
              if (tc.function?.name) cur.function.name += tc.function.name;
              if (typeof tc.function?.arguments === "string") cur.function.arguments += tc.function.arguments;
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
        res.off("close", onResClose);
        execution.release();
      }
      const message = {
        role: "assistant",
        content: toolCalls.size > 0 && !fullText ? null : fullText
      };
      if (reasoningText) message.reasoning_content = reasoningText;
      if (toolCalls.size > 0) {
        message.tool_calls = [...toolCalls.entries()].sort((a, b) => a[0] - b[0]).map(([, v]) => ({
          id: v.id || `call_${Date.now()}`,
          type: v.type || "function",
          function: {
            name: v.function.name,
            arguments: v.function.arguments || "{}"
          }
        }));
        if (finishReason === "stop") finishReason = "tool_calls";
      }
      const usage = aggPump.getUsage();
      const completionObj = {
        id: reqId,
        object: "chat.completion",
        created: Math.floor(Date.now() / 1e3),
        model: rawModel,
        choices: [{ index: 0, message, finish_reason: finishReason }],
        usage: {
          prompt_tokens: usage.promptTokens,
          completion_tokens: usage.completionTokens,
          total_tokens: usage.promptTokens + usage.completionTokens
        }
      };
      if (protocol === "anthropic") {
        sendJson(res, 200, openAIToAnthropicResponse(completionObj, rawModel));
      } else if (protocol === "responses") {
        sendJson(res, 200, chatCompletionToResponseObject(completionObj, rawModel));
      } else {
        sendJson(res, 200, completionObj);
      }
      this.ledger.record(actualModel, usage.promptTokens, usage.completionTokens, usage.cacheHit);
    } catch (err) {
      if (!res.headersSent) {
        const status = err.status && err.status >= 400 && err.status < 600 ? err.status : 500;
        if (protocol === "anthropic") {
          sendJson(res, status, {
            type: "error",
            error: { type: "api_error", message: err.message }
          });
        } else {
          sendJson(res, status, {
            error: { message: err.message, type: "api_error" }
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
    const rawModel = String(body.model || "kling-video-v3");
    const resolved = this.resolveModel(rawModel);
    const normalizedModel = resolved.includes("minimax") || resolved.includes("hailuo") || resolved.includes("\u6D77\u87BA") ? "minimax-video-h3" : "kling-video-v3";
    const execution = await this.scheduler.executeWithFailover(resolved, async (account) => {
      const base = this.client.getChatBase(account);
      const upRes = await fetch(`${base}${VIDEO_GENERATIONS_PATH}`, {
        method: "POST",
        headers: this.client.buildHeaders(account, false),
        body: JSON.stringify({ ...body, model: normalizedModel }),
        signal: AbortSignal.timeout(3e4)
      });
      const data = await upRes.json().catch(() => ({}));
      if (!upRes.ok || data.code !== 0 && data.code !== 200) {
        return {
          ok: false,
          status: upRes.status,
          kind: this.client.classifyError(upRes.status, data),
          message: data.msg || data.message || `\u89C6\u9891\u4EFB\u52A1\u521B\u5EFA\u5931\u8D25 (${upRes.status})`
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
          status: execution.data?.data?.status || execution.data?.status || "queued"
        });
      }
      sendJson(res, 200, {
        id: taskId,
        object: "video.generation",
        model: normalizedModel,
        ...execution.data?.data || execution.data || {}
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
        signal: AbortSignal.timeout(15e3)
      });
      const data = await upRes.json().catch(() => ({}));
      if (!upRes.ok) {
        return {
          ok: false,
          status: upRes.status,
          kind: this.client.classifyError(upRes.status, data),
          message: data.msg || `\u67E5\u8BE2\u89C6\u9891\u4EFB\u52A1\u5931\u8D25 (${upRes.status})`
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
    const execution = await this.scheduler.executeWithFailover("kling-video-v3", queryAccount);
    try {
      sendJson(res, 200, execution.data?.data || execution.data);
    } finally {
      execution.release();
    }
  }
  stop() {
    if (this.server) {
      try {
        this.server.closeAllConnections?.();
      } catch (_) {
      }
      try {
        this.server.closeIdleConnections?.();
      } catch (_) {
      }
      try {
        this.server.close();
      } catch (_) {
      }
      this.server = null;
    }
  }
};

// src/upstream/oauth.js
var oauthSessions = /* @__PURE__ */ new Map();
function getOAuthEndpoints(realm) {
  if (realm === "global") {
    return { base: GLOBAL_BASE, origin: GLOBAL_BASE };
  }
  return { base: CN_CHAT_BASE, origin: CN_BILLING_BASE };
}
function buildOAuthHeaders(origin, accessToken = "") {
  const h = {
    "Content-Type": "application/json",
    "Accept": "application/json, text/plain, */*",
    "X-Requested-With": "XMLHttpRequest",
    "Origin": origin,
    "Referer": `${origin}/`,
    "User-Agent": "CLI/2.63.2 CodeBuddy/2.63.2"
  };
  if (accessToken) {
    h["Authorization"] = `Bearer ${accessToken}`;
  }
  return h;
}
async function startOAuthFlow(realm = "cn") {
  const targetRealm = realm === "global" ? "global" : "cn";
  const { base, origin } = getOAuthEndpoints(targetRealm);
  const res = await fetch(`${base}/v2/plugin/auth/state?platform=CLI`, {
    method: "POST",
    headers: buildOAuthHeaders(origin),
    body: JSON.stringify({}),
    signal: AbortSignal.timeout(15e3)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.code !== 0) {
    throw new Error(data.msg || `\u83B7\u53D6\u6388\u6743\u94FE\u63A5\u5931\u8D25 (HTTP ${res.status})`);
  }
  const state = data.data?.state;
  const authUrl = (data.data?.authUrl || "").trim();
  if (!state || !authUrl) {
    throw new Error("\u4E0A\u6E38\u672A\u8FD4\u56DE\u5B8C\u6574\u7684 OAuth \u6388\u6743\u5730\u5740\u6216 state");
  }
  const now = Date.now();
  for (const [k, s] of oauthSessions.entries()) {
    if (now - s.createdAt > 15 * 60 * 1e3) oauthSessions.delete(k);
  }
  oauthSessions.set(state, { realm: targetRealm, createdAt: now });
  return { state, url: authUrl, realm: targetRealm };
}
async function pollOAuthFlow(realm, state, store) {
  const sess = oauthSessions.get(state);
  const targetRealm = sess?.realm || (realm === "global" ? "global" : "cn");
  const { base, origin } = getOAuthEndpoints(targetRealm);
  let res;
  try {
    res = await fetch(`${base}/v2/plugin/auth/token?state=${encodeURIComponent(state)}`, {
      method: "GET",
      headers: buildOAuthHeaders(origin),
      signal: AbortSignal.timeout(1e4)
    });
  } catch (err) {
    return { success: false, waiting: true, notice: `\u7B49\u5F85\u6388\u6743\u54CD\u5E94 (${err.message})` };
  }
  const tokData = await res.json().catch(() => ({}));
  if (!res.ok || tokData.code !== 0 || !tokData.data?.accessToken) {
    return { success: false, waiting: true };
  }
  const tok = tokData.data;
  const domain = tok.domain || (targetRealm === "global" ? "www.workbuddy.ai" : "copilot.tencent.com");
  let acct = {};
  try {
    const acctRes = await fetch(`${base}/v2/plugin/login/account?state=${encodeURIComponent(state)}`, {
      method: "GET",
      headers: buildOAuthHeaders(origin, tok.accessToken),
      signal: AbortSignal.timeout(1e4)
    });
    const acctJson = await acctRes.json().catch(() => ({}));
    if (acctJson.code === 0 && acctJson.data) {
      acct = acctJson.data;
    }
  } catch (_) {
  }
  const claims = parseJWTClaims(tok.accessToken) || {};
  const uid = String(
    acct.uid || acct.userId || claims.sub || claims.uid || `wb-${Date.now().toString(36)}`
  ).trim();
  const nickname = String(
    acct.nickname || acct.userName || claims.email || claims.name || claims.nickname || `Account-${uid.slice(0, 8)}`
  ).trim();
  const enterpriseId = String(acct.enterpriseId || "").trim();
  const provider = String(acct.provider || acct.idp || acct.loginType || acct.type || claims.provider || "").trim();
  const expiresIn = Number(tok.expiresIn) > 0 && Number(tok.expiresIn) < 86400 * 30 ? Number(tok.expiresIn) : 7200;
  const accountObj = {
    account: { uid, nickname, enterpriseId, provider },
    auth: {
      realm: targetRealm,
      accessToken: tok.accessToken,
      refreshToken: tok.refreshToken || "",
      expiresAt: Date.now() + expiresIn * 1e3,
      domain
    },
    disabled: false,
    disabledReason: "",
    source: "oauth-browser"
  };
  store.upsert(accountObj);
  store.setActive(uid);
  oauthSessions.delete(state);
  return {
    success: true,
    waiting: false,
    account: {
      uid,
      nickname,
      realm: targetRealm,
      provider
    }
  };
}

// src/upstream/trial.js
async function claimGlobalTrial(account, client) {
  if (!account || account.auth?.realm !== "global") {
    return { ok: false, claimed: false, message: "\u4EC5\u56FD\u9645\u7248 (global) \u8D26\u53F7\u652F\u6301\u9886\u53D6 Trial \u52A0\u6CB9\u5305" };
  }
  const doPost = async () => {
    const headers = client ? client.buildHeaders(account, false) : {
      "Authorization": `Bearer ${account.auth.accessToken}`,
      "Content-Type": "application/json",
      "Accept": "application/json",
      "X-CodeBuddy-Request": "1",
      "Origin": GLOBAL_BASE,
      "Referer": `${GLOBAL_BASE}/`
    };
    const res2 = await fetch(`${GLOBAL_BASE}${GLOBAL_TRIAL_PATH}`, {
      method: "POST",
      headers,
      body: JSON.stringify({}),
      signal: AbortSignal.timeout(1e4)
    });
    const data2 = await res2.json().catch(() => ({}));
    return { res: res2, data: data2 };
  };
  let { res, data } = await doPost();
  if (res.status === 401 && client && account.auth?.refreshToken) {
    try {
      await client.refreshToken(account);
      const retry = await doPost();
      res = retry.res;
      data = retry.data;
    } catch (_) {
    }
  }
  const already = data.code === 14051 || typeof data.msg === "string" && /already|14051|已领取/i.test(data.msg);
  if (already) {
    return { ok: true, claimed: false, message: "\u8BE5\u56FD\u9645\u7248\u8D26\u53F7\u5DF2\u9886\u8FC7 Trial \u52A0\u6CB9\u5305\uFF08\u65E0\u9700\u91CD\u590D\u9886\u53D6\uFF09" };
  }
  if (!res.ok || data.code !== 0 && data.code !== 200) {
    return { ok: false, claimed: false, message: data.msg || `\u9886\u53D6\u5931\u8D25 (HTTP ${res.status})` };
  }
  return { ok: true, claimed: true, message: "\u6210\u529F\u9886\u53D6\u56FD\u9645\u7248 IDE Trial \u52A0\u901F\u79EF\u5206\u5305\uFF01", data: data.data };
}

// src/upstream/invite.js
function cleanRawUid(uid) {
  return String(uid || "").replace(/^(cn_|global_|workbuddy_)/i, "").trim();
}
function defaultInviteCode(account) {
  return cleanRawUid(account?.account?.uid || "");
}
function defaultInviteUrl(account, code) {
  const c = code || defaultInviteCode(account);
  return account?.auth?.realm === "global" ? `https://www.workbuddy.ai/i/${c}` : `https://workbuddy.cn/i/${c}`;
}
async function fetchInviteInfo(account) {
  if (!account?.account?.uid) {
    throw new Error("\u8D26\u53F7\u4FE1\u606F\u65E0\u6548");
  }
  const isGlobal = account.auth?.realm === "global";
  const base = isGlobal ? GLOBAL_BASE : CN_BILLING_BASE;
  let code = defaultInviteCode(account);
  let url = defaultInviteUrl(account, code);
  let invitedCount = 0;
  let rewardCredit = 0;
  const endpoints = [
    "/activity/growth/user/invite",
    "/activity/growth/invite/info",
    "/portal/activity/share/info",
    "/activity/growth/share/info"
  ];
  const headers = {
    "Authorization": `Bearer ${account.auth.accessToken}`,
    "Accept": "application/json",
    "Content-Type": "application/json",
    "X-CodeBuddy-Request": "1",
    "Origin": base,
    "Referer": `${base}/`
  };
  for (const ep of endpoints) {
    try {
      const res = await fetch(`${base}${ep}`, {
        method: "GET",
        headers,
        signal: AbortSignal.timeout(6e3)
      });
      if (!res.ok) continue;
      const json = await res.json().catch(() => ({}));
      if (json.code !== 0 || !json.data) continue;
      const d = json.data;
      code = d.invite_code || d.code || d.share_code || code;
      url = d.invite_url || d.share_url || defaultInviteUrl(account, code);
      invitedCount = Number(d.invited_count || 0);
      rewardCredit = Number(d.reward_credit || 0);
      break;
    } catch (_) {
    }
  }
  return {
    inviteCode: code,
    inviteUrl: url,
    invitedCount,
    rewardCredit
  };
}
async function bindInviteCode(account, inviteCode) {
  const cleanCode = String(inviteCode || "").trim();
  if (!cleanCode) {
    return { ok: false, message: "\u9080\u8BF7\u7801\u4E0D\u80FD\u4E3A\u7A7A" };
  }
  const isGlobal = account.auth?.realm === "global";
  const base = isGlobal ? GLOBAL_BASE : CN_BILLING_BASE;
  const endpoints = [
    "/activity/growth/invite/accept",
    "/activity/growth/user/bind-inviter",
    "/billing/meter/invite/bind"
  ];
  const headers = {
    "Authorization": `Bearer ${account.auth.accessToken}`,
    "Accept": "application/json",
    "Content-Type": "application/json",
    "X-CodeBuddy-Request": "1",
    "Origin": base,
    "Referer": `${base}/`
  };
  let lastMsg = "\u6240\u6709\u9080\u8BF7\u7ED1\u5B9A\u7AEF\u70B9\u5747\u672A\u54CD\u5E94\u6216\u5DF2\u7ED1\u5B9A\u8FC7";
  for (const ep of endpoints) {
    try {
      const res = await fetch(`${base}${ep}`, {
        method: "POST",
        headers,
        body: JSON.stringify({ invite_code: cleanCode, code: cleanCode }),
        signal: AbortSignal.timeout(8e3)
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.code === 0) {
        const reward = Number(json.data?.credit || json.data?.reward_credit || 0);
        return { ok: true, reward, message: reward > 0 ? `\u7ED1\u5B9A\u6210\u529F\uFF0C\u83B7\u5F97 +${reward} \u79EF\u5206` : "\u9080\u8BF7\u7ED1\u5B9A\u6210\u529F" };
      }
      if (json.msg) lastMsg = json.msg;
    } catch (e) {
      lastMsg = e.message;
    }
  }
  return { ok: false, message: lastMsg };
}

// src/pool/import-export.js
import zlib from "node:zlib";
var CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();
function crc32(buf) {
  let c = 4294967295;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 255] ^ c >>> 8;
  }
  return (c ^ 4294967295) >>> 0;
}
function buildZipBuffer(files) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  for (const file of files) {
    const nameBuf = Buffer.from(file.name, "utf8");
    const dataBuf = Buffer.isBuffer(file.content) ? file.content : Buffer.from(file.content, "utf8");
    const compressed = zlib.deflateRawSync(dataBuf);
    const crc = crc32(dataBuf);
    const lfh = Buffer.alloc(30);
    lfh.writeUInt32LE(67324752, 0);
    lfh.writeUInt16LE(20, 4);
    lfh.writeUInt16LE(2048, 6);
    lfh.writeUInt16LE(8, 8);
    lfh.writeUInt16LE(0, 10);
    lfh.writeUInt16LE(0, 12);
    lfh.writeUInt32LE(crc, 14);
    lfh.writeUInt32LE(compressed.length, 18);
    lfh.writeUInt32LE(dataBuf.length, 22);
    lfh.writeUInt16LE(nameBuf.length, 26);
    lfh.writeUInt16LE(0, 28);
    localParts.push(lfh, nameBuf, compressed);
    const cdh = Buffer.alloc(46);
    cdh.writeUInt32LE(33639248, 0);
    cdh.writeUInt16LE(20, 4);
    cdh.writeUInt16LE(20, 6);
    cdh.writeUInt16LE(2048, 8);
    cdh.writeUInt16LE(8, 10);
    cdh.writeUInt16LE(0, 12);
    cdh.writeUInt16LE(0, 14);
    cdh.writeUInt32LE(crc, 16);
    cdh.writeUInt32LE(compressed.length, 20);
    cdh.writeUInt32LE(dataBuf.length, 24);
    cdh.writeUInt16LE(nameBuf.length, 28);
    cdh.writeUInt16LE(0, 30);
    cdh.writeUInt16LE(0, 32);
    cdh.writeUInt16LE(0, 34);
    cdh.writeUInt16LE(0, 36);
    cdh.writeUInt32LE(0, 38);
    cdh.writeUInt32LE(offset, 42);
    centralParts.push(cdh, nameBuf);
    offset += 30 + nameBuf.length + compressed.length;
  }
  const centralSize = centralParts.reduce((s, b) => s + b.length, 0);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(101010256, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(files.length, 8);
  eocd.writeUInt16LE(files.length, 10);
  eocd.writeUInt32LE(centralSize, 12);
  eocd.writeUInt32LE(offset, 16);
  eocd.writeUInt16LE(0, 20);
  return Buffer.concat([...localParts, ...centralParts, eocd]);
}
function parseZipEntries(buf) {
  const entries = [];
  let eocdOffset = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) {
    if (buf.readUInt32LE(i) === 101010256) {
      eocdOffset = i;
      break;
    }
  }
  if (eocdOffset === -1) return entries;
  const cdOffset = buf.readUInt32LE(eocdOffset + 16);
  const totalEntries = buf.readUInt16LE(eocdOffset + 10);
  let pos = cdOffset;
  for (let i = 0; i < totalEntries && pos + 46 <= buf.length; i++) {
    if (buf.readUInt32LE(pos) !== 33639248) break;
    const method = buf.readUInt16LE(pos + 10);
    const compSize = buf.readUInt32LE(pos + 20);
    const nameLen = buf.readUInt16LE(pos + 28);
    const extraLen = buf.readUInt16LE(pos + 30);
    const commentLen = buf.readUInt16LE(pos + 32);
    const localOffset = buf.readUInt32LE(pos + 42);
    const name2 = buf.toString("utf8", pos + 46, pos + 46 + nameLen);
    pos += 46 + nameLen + extraLen + commentLen;
    if (name2.endsWith("/") || localOffset + 30 > buf.length) continue;
    if (buf.readUInt32LE(localOffset) !== 67324752) continue;
    const lNameLen = buf.readUInt16LE(localOffset + 26);
    const lExtraLen = buf.readUInt16LE(localOffset + 28);
    const dataStart = localOffset + 30 + lNameLen + lExtraLen;
    const dataEnd = dataStart + compSize;
    if (dataEnd > buf.length) continue;
    const compBuf = buf.subarray(dataStart, dataEnd);
    try {
      let content = null;
      if (method === 0) content = Buffer.from(compBuf);
      else if (method === 8) content = zlib.inflateRawSync(compBuf);
      if (content) entries.push({ name: name2, content });
    } catch (_) {
    }
  }
  return entries;
}
function stripComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, "").split(/\r?\n/).filter((l) => {
    const t = l.trim();
    return t && !t.startsWith("//") && !t.startsWith("#");
  }).join("\n").trim();
}
function normalizeAccountObject(raw, defaultRealm = "global") {
  if (!raw || typeof raw !== "object") return null;
  const accessToken = raw.auth?.accessToken || raw.auth?.access_token || raw.accessToken || raw.access_token || raw.token || "";
  const refreshToken = raw.auth?.refreshToken || raw.auth?.refresh_token || raw.refreshToken || raw.refresh_token || "";
  if (!accessToken && !refreshToken) return null;
  const claims = parseJWTClaims(accessToken) || parseJWTClaims(refreshToken) || {};
  const uid = raw.account?.uid || raw.uid || raw.userId || claims.sub || claims.uid || `user-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  let realm = (raw.auth?.realm || raw.realm || "").toLowerCase();
  if (!realm) {
    const domainStr = String(raw.auth?.domain || raw.domain || claims.iss || "").toLowerCase();
    if (domainStr.includes("codebuddy") || domainStr.includes("tencent")) realm = "cn";
    else if (domainStr.includes("workbuddy")) realm = "global";
    else realm = defaultRealm;
  }
  const nickname = raw.account?.nickname || raw.nickname || raw.userName || raw.email || claims.email || claims.name || claims.nickname || `Account-${String(uid).slice(0, 8)}`;
  return {
    account: {
      uid: String(uid),
      nickname: String(nickname),
      enterpriseId: raw.account?.enterpriseId || raw.enterpriseId || "",
      provider: raw.account?.provider || raw.provider || claims.provider || ""
    },
    auth: {
      realm: realm === "cn" ? "cn" : "global",
      accessToken,
      refreshToken: refreshToken || accessToken,
      expiresAt: raw.auth?.expiresAt || raw.expiresAt || (claims.exp ? claims.exp * 1e3 : Date.now() + 72e5),
      domain: raw.auth?.domain || raw.domain || (realm === "cn" ? "copilot.tencent.com" : "www.workbuddy.ai")
    },
    disabled: Boolean(raw.disabled),
    disabledReason: raw.disabledReason || "",
    source: raw.source || "batch-import",
    updatedAt: Date.now()
  };
}
function extractAccountCandidates(input, defaultRealm = "global") {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(String(input || ""), "utf8");
  const candidates = [];
  if (buf.length >= 4 && buf[0] === 80 && buf[1] === 75) {
    const zipEntries = parseZipEntries(buf);
    for (const entry of zipEntries) {
      const low = entry.name.toLowerCase();
      if (low.endsWith(".json") || low.endsWith(".txt") || low.endsWith(".info")) {
        const subRealm = low.includes("cn") ? "cn" : low.includes("global") ? "global" : defaultRealm;
        candidates.push(...extractAccountCandidates(entry.content, subRealm));
      }
    }
    return candidates;
  }
  const clean = stripComments(buf.toString("utf8"));
  if (!clean) return candidates;
  const extractFromValue = (val) => {
    if (Array.isArray(val)) {
      let added = false;
      for (const item of val) {
        if (extractFromValue(item)) added = true;
      }
      return added;
    }
    if (val && typeof val === "object") {
      for (const key of ["accounts", "auths", "data", "items", "list", "account_list", "tokens", "result"]) {
        if (key in val) {
          if (extractFromValue(val[key])) return true;
        }
      }
      const single = normalizeAccountObject(val, defaultRealm);
      if (single) {
        candidates.push(single);
        return true;
      }
    }
    return false;
  };
  if (clean.startsWith("[") || clean.startsWith("{")) {
    try {
      const parsed = JSON.parse(clean);
      if (extractFromValue(parsed)) return candidates;
    } catch (_) {
    }
  }
  for (const rawLine of clean.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    if (line.startsWith("{") || line.startsWith("[")) {
      try {
        const obj = JSON.parse(line);
        if (extractFromValue(obj)) continue;
      } catch (_) {
      }
    }
    let accessToken = "";
    let refreshToken = "";
    if (line.includes("----")) {
      const parts = line.split("----").map((s) => s.trim()).filter(Boolean);
      if (parts.length >= 2) {
        accessToken = parts[0];
        refreshToken = parts[1];
      }
    } else if (line.includes("|")) {
      const parts = line.split("|").map((s) => s.trim()).filter(Boolean);
      if (parts.length >= 2) {
        accessToken = parts[0];
        refreshToken = parts[1];
      }
    } else if (line.includes(":") && !line.startsWith("http")) {
      const idx = line.indexOf(":");
      accessToken = line.slice(0, idx).trim();
      refreshToken = line.slice(idx + 1).trim();
    } else {
      refreshToken = line;
      accessToken = line;
    }
    if (refreshToken || accessToken) {
      const acc = normalizeAccountObject({ accessToken, refreshToken }, defaultRealm);
      if (acc) candidates.push(acc);
    }
  }
  return candidates;
}
async function batchImportAccounts(input, store, client, defaultRealm = "global") {
  const candidates = extractAccountCandidates(input, defaultRealm);
  const results = [];
  let imported = 0;
  let updated = 0;
  let failed = 0;
  for (const cand of candidates) {
    try {
      const existed = Boolean(store.get(cand.account.uid));
      let verified = false;
      if (cand.auth.refreshToken) {
        try {
          await client.refreshToken(cand);
          verified = true;
        } catch (_) {
        }
      }
      if (!verified) {
        await client.fetchBalance(cand);
      }
      store.upsert(cand);
      if (existed) updated++;
      else imported++;
      results.push({ uid: cand.account.uid, nickname: cand.account.nickname, realm: cand.auth.realm, ok: true });
    } catch (err) {
      failed++;
      results.push({ uid: cand.account.uid, nickname: cand.account.nickname, ok: false, error: err.message });
    }
  }
  return {
    ok: true,
    total: candidates.length,
    imported,
    updated,
    failed,
    results
  };
}
function exportBackupZip(store) {
  const accounts = store.getAll();
  const files = accounts.map((acc) => ({
    name: `${acc.auth?.realm || "global"}-${acc.account.uid}.json`,
    content: JSON.stringify(acc, null, 2)
  }));
  return buildZipBuffer(files);
}

// src/server/dashboard-html.js
function renderConsoleHtml(opts = {}) {
  const port = opts.port || 7863;
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>WorkBuddy 2API Console \u2014 DSH \u9AD8\u53EF\u7528\u7F51\u5173</title>
  <style>
    :root {
      --bg: #050811;
      --bg-card: rgba(13, 19, 36, 0.88);
      --bg-elevated: rgba(20, 29, 54, 0.92);
      --border: rgba(0, 229, 255, 0.22);
      --border-strong: rgba(0, 229, 255, 0.5);
      --cyan: #00e5ff;
      --emerald: #00e676;
      --amber: #ffab40;
      --magenta: #ff2e93;
      --purple: #b388ff;
      --text: #e6f1ff;
      --text-dim: #8b9bb4;
      --radius: 10px;
      --font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", monospace;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      font-family: var(--font);
      background: radial-gradient(circle at 15% 15%, rgba(0,229,255,0.08), transparent 45%),
                  radial-gradient(circle at 85% 20%, rgba(255,46,147,0.07), transparent 40%),
                  var(--bg);
      color: var(--text);
      min-height: 100vh;
    }
    .topbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 24px;
      border-bottom: 1px solid var(--border);
      background: rgba(5, 8, 17, 0.9);
      backdrop-filter: blur(12px);
      position: sticky;
      top: 0;
      z-index: 50;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 700;
      font-size: 16px;
      letter-spacing: 0.5px;
    }
    .brand-badge {
      padding: 3px 8px;
      border-radius: 999px;
      font-size: 11px;
      background: rgba(0, 230, 118, 0.14);
      border: 1px solid rgba(0, 230, 118, 0.4);
      color: var(--emerald);
    }
    .nav {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }
    .nav-btn {
      background: transparent;
      border: 1px solid transparent;
      color: var(--text-dim);
      padding: 7px 14px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
      transition: all 0.18s;
    }
    .nav-btn:hover { color: var(--text); border-color: var(--border); }
    .nav-btn.active {
      background: rgba(0, 229, 255, 0.12);
      border-color: var(--cyan);
      color: var(--cyan);
      box-shadow: 0 0 12px rgba(0, 229, 255, 0.15);
    }
    .container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 20px 24px 60px;
    }
    .grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; margin-bottom: 18px; }
    .grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 16px; margin-bottom: 18px; }
    .card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 16px;
      box-shadow: 0 8px 28px rgba(0, 0, 0, 0.35);
    }
    .card-title {
      font-size: 13px;
      color: var(--text-dim);
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .kpi { font-size: 26px; font-weight: 700; color: var(--cyan); }
    .kpi.green { color: var(--emerald); }
    .kpi.pink { color: var(--magenta); }
    .sub-row { font-size: 12px; color: var(--text-dim); margin-top: 6px; display: flex; gap: 12px; flex-wrap: wrap; }
    .toolbar { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; align-items: center; }
    button.btn {
      background: rgba(0, 229, 255, 0.12);
      border: 1px solid var(--border-strong);
      color: var(--cyan);
      padding: 7px 13px;
      border-radius: 7px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 600;
      transition: all 0.15s;
    }
    button.btn:hover { background: rgba(0, 229, 255, 0.24); transform: translateY(-1px); }
    button.btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
    button.btn-green { background: rgba(0, 230, 118, 0.14); border-color: rgba(0, 230, 118, 0.45); color: var(--emerald); }
    button.btn-green:hover { background: rgba(0, 230, 118, 0.25); }
    button.btn-pink { background: rgba(255, 46, 147, 0.14); border-color: rgba(255, 46, 147, 0.45); color: var(--magenta); }
    button.btn-amber { background: rgba(255, 171, 64, 0.14); border-color: rgba(255, 171, 64, 0.45); color: var(--amber); }
    button.btn-sm { padding: 4px 9px; font-size: 11px; }
    input, select, textarea {
      background: rgba(8, 12, 24, 0.9);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 7px 10px;
      border-radius: 7px;
      font-size: 12px;
      font-family: inherit;
    }
    input:focus, select:focus, textarea:focus { outline: none; border-color: var(--cyan); }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { text-align: left; padding: 10px 8px; border-bottom: 1px solid rgba(139, 155, 180, 0.12); vertical-align: middle; }
    th { color: var(--text-dim); font-weight: 600; }
    .tag {
      display: inline-block;
      padding: 2px 7px;
      border-radius: 5px;
      font-size: 11px;
      font-weight: 600;
    }
    .tag-cn { background: rgba(0, 230, 118, 0.14); color: var(--emerald); border: 1px solid rgba(0, 230, 118, 0.35); }
    .tag-global { background: rgba(179, 136, 255, 0.16); color: var(--purple); border: 1px solid rgba(179, 136, 255, 0.35); }
    .tag-warn { background: rgba(255, 171, 64, 0.16); color: var(--amber); border: 1px solid rgba(255, 171, 64, 0.35); }
    .tag-err { background: rgba(255, 46, 147, 0.16); color: var(--magenta); border: 1px solid rgba(255, 46, 147, 0.35); }
    .hidden { display: none !important; }
    .modal-backdrop {
      position: fixed; inset: 0; background: rgba(2, 4, 10, 0.8); backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center; z-index: 200;
    }
    .modal {
      width: 560px; max-width: 94vw; background: var(--bg-elevated);
      border: 1px solid var(--border-strong); border-radius: 12px; padding: 20px;
    }
    .bar-chart { display: flex; align-items: flex-end; gap: 6px; height: 110px; padding-top: 12px; }
    .bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; height: 100%; justify-content: flex-end; }
    .bar-fill { width: 100%; background: linear-gradient(180deg, var(--cyan), rgba(0,229,255,0.25)); border-radius: 4px 4px 0 0; min-height: 2px; }
    .bar-lbl { font-size: 10px; color: var(--text-dim); }
    .toast {
      position: fixed; bottom: 20px; right: 20px; background: var(--bg-elevated);
      border: 1px solid var(--cyan); padding: 10px 16px; border-radius: 8px;
      font-size: 12px; z-index: 300; box-shadow: 0 8px 24px rgba(0,0,0,0.6);
    }
    pre.code {
      background: #03060e; border: 1px solid rgba(0,229,255,0.18);
      border-radius: 8px; padding: 12px; overflow-x: auto; font-size: 11px; color: #a5f3fc;
    }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .form-field { display: flex; flex-direction: column; gap: 5px; font-size: 12px; }
    .form-field label { color: var(--text-dim); }
  </style>
</head>
<body>
  <div class="topbar">
    <div class="brand">
      <span>\u26A1 WORKBUDDY 2API</span>
      <span class="brand-badge" id="gatewayBadge">ONLINE :${port}</span>
    </div>
    <div class="nav">
      <button class="nav-btn active" onclick="switchTab('pool')">\u8D26\u53F7\u6C60\u603B\u89C8</button>
      <button class="nav-btn" onclick="switchTab('welfare')">\u732B\u732B &amp; \u798F\u5229 &amp; \u9080\u8BF7</button>
      <button class="nav-btn" onclick="switchTab('tasks')">\u6210\u957F\u4EFB\u52A1</button>
      <button class="nav-btn" onclick="switchTab('models')">\u6A21\u578B &amp; \u522B\u540D</button>
      <button class="nav-btn" onclick="switchTab('usage')">\u7528\u91CF\u7EDF\u8BA1</button>
      <button class="nav-btn" onclick="switchTab('settings')">\u7F51\u5173\u8BBE\u7F6E</button>
    </div>
  </div>

  <div class="container">
    <!-- TAB 1: POOL -->
    <div id="tab-pool">
      <div class="grid-3" id="realmSummaryCards"></div>

      <div class="toolbar">
        <button class="btn btn-green" onclick="startOAuth('cn')">+ \u56FD\u5185\u7248 OAuth \u767B\u5F55</button>
        <button class="btn" onclick="startOAuth('global')">+ \u56FD\u9645\u7248 OAuth \u767B\u5F55</button>
        <button class="btn" onclick="openImportModal()">\u6279\u91CF / ZIP \u5BFC\u5165</button>
        <button class="btn" onclick="exportZip()">\u5BFC\u51FA ZIP \u5907\u4EFD</button>
        <button class="btn btn-amber" onclick="refreshAllTokens()">\u5237\u65B0\u5168\u90E8 Token</button>
        <button class="btn btn-pink" onclick="clearAllCooldowns()">\u4E00\u952E\u6E05\u9664\u7194\u65AD</button>
        <button class="btn" onclick="loadStatus(true)">\u21BB \u6781\u901F\u5237\u65B0\u79EF\u5206</button>
      </div>

      <div class="card">
        <div class="card-title">
          <span>\u8D26\u53F7\u6C60\u5B9E\u65F6\u8C03\u5EA6\u4E0E\u5065\u5EB7\u770B\u677F</span>
          <span id="poolCountInfo"></span>
        </div>
        <div style="overflow-x:auto">
          <table>
            <thead>
              <tr>
                <th>\u8D26\u53F7</th>
                <th>\u533A\u670D</th>
                <th>\u5B9E\u65F6\u79EF\u5206</th>
                <th>\u5305\u6784\u6210</th>
                <th>\u8FD0\u884C\u72B6\u6001</th>
                <th>\u5E76\u53D1</th>
                <th>\u64CD\u4F5C</th>
              </tr>
            </thead>
            <tbody id="accountsTbody"></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 2: WELFARE & TRAVEL & INVITE -->
    <div id="tab-welfare" class="hidden">
      <div class="toolbar">
        <select id="welfareUidSelect" onchange="loadWelfareAndInvite()"></select>
        <button class="btn btn-green" onclick="batchClaimAll()">\u5168\u53F7\u4E00\u952E\u5403\u6EE1\u798F\u5229</button>
        <button class="btn" onclick="batchRunTravel()">\u5168\u53F7\u5DE1\u68C0\u732B\u732B\u65C5\u884C</button>
        <button class="btn btn-amber" onclick="singleCheckin()">\u5F53\u524D\u53F7\u6BCF\u65E5\u7B7E\u5230</button>
        <button class="btn" onclick="drawLottery()">\u8FDE\u767B\u62BD\u5956</button>
      </div>
      <div class="grid-2">
        <div class="card">
          <div class="card-title"><span>\u{1F431} \u732B\u732B\u65C5\u884C\u7BA1\u5BB6</span><button class="btn btn-sm" onclick="departTravel()">\u6D3E\u51FA\u65C5\u884C</button></div>
          <div id="travelBox" class="sub-row">\u9009\u62E9\u56FD\u5185\u7248\u8D26\u53F7\u67E5\u770B\u732B\u732B\u72B6\u6001...</div>
        </div>
        <div class="card">
          <div class="card-title"><span>\u{1F381} \u4E13\u5C5E\u9080\u8BF7\u4E0E\u53D7\u9080\u7ED1\u5B9A</span><button class="btn btn-sm" onclick="loadWelfareAndInvite()">\u5237\u65B0</button></div>
          <div id="inviteBox" class="sub-row" style="margin-bottom:10px">\u52A0\u8F7D\u4E2D...</div>
          <div style="display:flex;gap:8px;margin-top:8px">
            <input id="bindInviteInput" placeholder="\u8F93\u5165\u63A8\u8350\u4EBA\u9080\u8BF7\u7801\u7ED1\u5B9A\u9886\u79EF\u5206" style="flex:1" />
            <button class="btn btn-green btn-sm" onclick="bindInvite()">\u7ACB\u5373\u7ED1\u5B9A</button>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-title"><span>\u8FDE\u767B\u6D3B\u52A8 &amp; \u6700\u8FD1\u6267\u884C\u65E5\u5FD7</span></div>
        <pre class="code" id="welfareLog">\u7B49\u5F85\u64CD\u4F5C...</pre>
      </div>
    </div>

    <!-- TAB 3: GROWTH TASKS -->
    <div id="tab-tasks" class="hidden">
      <div class="toolbar">
        <select id="tasksUidSelect" onchange="loadTasks()"></select>
        <button class="btn btn-green" onclick="runTasks(false)">\u4E00\u952E\u5168\u81EA\u52A8\u70B9\u4EAE\u5E76\u6536\u5272</button>
        <button class="btn btn-amber" onclick="runTasks(true)">\u5168\u91CF\u56FD\u5185\u53F7\u4E00\u952E\u81EA\u52A8\u5316\u4EFB\u52A1</button>
        <button class="btn" onclick="loadTasks()">\u21BB \u5237\u65B0\u4EFB\u52A1\u5217\u8868</button>
      </div>
      <div class="card">
        <div class="card-title"><span>\u5168\u81EA\u52A8\u6210\u957F\u79EF\u5206\u4EFB\u52A1\u6E05\u5355 (18+ \u9879)</span><span id="tasksSummary"></span></div>
        <div id="tasksList"></div>
      </div>
    </div>

    <!-- TAB 4: MODELS -->
    <div id="tab-models" class="hidden">
      <div class="toolbar">
        <button class="btn btn-green" onclick="discoverModels()">\u{1F50D} \u4ECE\u4E0A\u6E38\u52A8\u6001\u53D1\u73B0\u6700\u65B0\u6A21\u578B</button>
        <button class="btn" onclick="saveModelsConfig()">\u{1F4BE} \u4FDD\u5B58\u542F\u7528\u8FC7\u6EE4\u4E0E\u522B\u540D</button>
        <input id="modelSearch" placeholder="\u8FC7\u6EE4\u6A21\u578B ID..." oninput="renderModelsTable()" />
      </div>
      <div class="grid-2">
        <div class="card">
          <div class="card-title"><span>\u6A21\u578B\u76EE\u5F55\uFF08\u7A7A\u52FE\u9009\u8868\u793A\u5168\u90E8\u653E\u884C\uFF09</span><span id="modelCountLabel"></span></div>
          <div style="max-height:480px;overflow:auto">
            <table>
              <thead><tr><th>\u542F\u7528</th><th>\u6A21\u578B ID</th><th>\u533A\u670D</th><th>\u8D39\u7387</th><th>\u4E0A\u4E0B\u6587</th></tr></thead>
              <tbody id="modelsTbody"></tbody>
            </table>
          </div>
        </div>
        <div class="card">
          <div class="card-title"><span>\u6A21\u578B\u522B\u540D\u6620\u5C04 (JSON) &amp; auto-free \u8DEF\u7531</span></div>
          <div class="form-field" style="margin-bottom:10px">
            <label>auto-free \u4F18\u5148\u5019\u9009 (\u9017\u53F7\u5206\u9694):</label>
            <input id="freeModelsInput" />
          </div>
          <div class="form-field">
            <label>\u6A21\u578B\u522B\u540D\u8868 JSON (\u4F8B: { "gpt-4o": "global:gpt-6-astra" }):</label>
            <textarea id="aliasesTextarea" rows="16"></textarea>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 5: USAGE -->
    <div id="tab-usage" class="hidden">
      <div class="toolbar">
        <button class="btn" onclick="loadUsage()">\u21BB \u5237\u65B0\u7528\u91CF</button>
        <button class="btn btn-pink" onclick="resetUsage()">\u6E05\u7A7A\u672C\u5730\u7528\u91CF\u8D26\u672C</button>
      </div>
      <div class="grid-3" id="usageSummaryCards"></div>
      <div class="grid-2">
        <div class="card">
          <div class="card-title"><span>\u8FD1 7 \u5929\u8BF7\u6C42\u4E0E Token \u8D70\u52BF</span></div>
          <div class="bar-chart" id="chart7d"></div>
        </div>
        <div class="card">
          <div class="card-title"><span>\u4ECA\u65E5 24 \u5C0F\u65F6\u70ED\u5EA6\u5206\u5E03</span></div>
          <div class="bar-chart" id="chart24h"></div>
        </div>
      </div>
    </div>

    <!-- TAB 6: SETTINGS -->
    <div id="tab-settings" class="hidden">
      <div class="card" style="margin-bottom:16px">
        <div class="card-title"><span>\u7F51\u5173\u8FD0\u884C\u53C2\u6570\u4E0E\u81EA\u52A8\u5316\u7B56\u7565 (\u6301\u4E45\u5316\u81F3 $DSH_HOME/.workbuddy2api-config.json)</span></div>
        <div class="form-grid">
          <div class="form-field">
            <label>\u7F51\u5173\u9274\u6743 API Key (\u7559\u7A7A\u4E0D\u6821\u9A8C):</label>
            <input id="cfgApiKey" placeholder="sk-..." />
          </div>
          <div class="form-field">
            <label>HTTP \u4EE3\u7406 (\u5982 http://127.0.0.1:7890):</label>
            <input id="cfgProxy" placeholder="\u7559\u7A7A\u76F4\u8FDE" />
          </div>
          <div class="form-field">
            <label>\u56FD\u5185\u7248 CN \u5355\u53F7\u6700\u5927\u5E76\u53D1:</label>
            <input id="cfgMaxCN" type="number" min="1" max="20" />
          </div>
          <div class="form-field">
            <label>\u56FD\u9645\u7248 Global \u5355\u53F7\u6700\u5927\u5E76\u53D1:</label>
            <input id="cfgMaxGlobal" type="number" min="1" max="20" />
          </div>
          <div class="form-field">
            <label>\u5E76\u53D1\u6392\u961F\u7B49\u5F85\u8D85\u65F6 (ms):</label>
            <input id="cfgQueueTimeout" type="number" min="0" max="60000" />
          </div>
          <div class="form-field">
            <label>System Prompt \u6CE8\u5165\u6A21\u5F0F:</label>
            <select id="cfgPromptMode">
              <option value="none">\u5173\u95ED (\u4FDD\u6301\u539F\u6837)</option>
              <option value="append">\u8FFD\u52A0\u5230\u672B\u5C3E (append)</option>
              <option value="replace">\u5168\u5C40\u66FF\u6362 (replace)</option>
            </select>
          </div>
        </div>
        <div class="form-field" style="margin-top:12px">
          <label>System Prompt \u81EA\u5B9A\u4E49\u6587\u672C:</label>
          <textarea id="cfgPromptText" rows="3"></textarea>
        </div>
        <div class="toolbar" style="margin-top:12px;margin-bottom:0">
          <label><input type="checkbox" id="cfgAutoCheckin" /> \u542F\u52A8\u81EA\u52A8\u798F\u5229/\u7B7E\u5230</label>
          <label><input type="checkbox" id="cfgAutoTravel" /> \u542F\u52A8\u81EA\u52A8\u732B\u732B\u65C5\u884C</label>
          <label><input type="checkbox" id="cfgAutoRefresh" /> 5\u5206\u949F\u81EA\u52A8 Token \u4FDD\u6D3B</label>
          <button class="btn btn-green" style="margin-left:auto" onclick="saveConfig()">\u{1F4BE} \u4FDD\u5B58\u914D\u7F6E\u7ACB\u5373\u751F\u6548</button>
        </div>
      </div>

      <div class="card">
        <div class="card-title"><span>\u591A\u534F\u8BAE\u7AEF\u70B9\u63A5\u5165\u6307\u5357</span></div>
        <pre class="code" id="guideCode"></pre>
      </div>
    </div>
  </div>

  <!-- IMPORT MODAL -->
  <div id="importModal" class="modal-backdrop hidden">
    <div class="modal">
      <div class="card-title"><span>\u6279\u91CF\u5BFC\u5165\u8D26\u53F7 (\u652F\u6301 ZIP \u538B\u7F29\u5305 / JSON \u6570\u7EC4 / \u5305\u88C5\u5BF9\u8C61 / token----refreshToken \u5361\u5BC6)</span><button class="btn btn-sm btn-pink" onclick="closeImportModal()">\u5173\u95ED</button></div>
      <div class="form-field" style="margin-bottom:10px">
        <label>\u9ED8\u8BA4\u533A\u670D\uFF08\u65E0\u660E\u786E\u6807\u8BB0\u65F6\u751F\u6548\uFF09:</label>
        <select id="importRealm">
          <option value="global">\u56FD\u9645\u7248 (Global / workbuddy.ai)</option>
          <option value="cn">\u56FD\u5185\u7248 (CN / codebuddy.cn)</option>
        </select>
      </div>
      <div class="form-field" style="margin-bottom:10px">
        <label>\u4E0A\u4F20 .zip / .json / .txt \u6587\u4EF6:</label>
        <input type="file" id="importFileInput" accept=".zip,.json,.txt,.info" />
      </div>
      <div class="form-field" style="margin-bottom:12px">
        <label>\u6216\u76F4\u63A5\u7C98\u8D34\u5185\u5BB9\uFF08\u652F\u6301 # / // \u6CE8\u91CA\u884C\uFF09:</label>
        <textarea id="importTextarea" rows="8" placeholder="\u652F\u6301\u683C\u5F0F:&#10;access_token----refresh_token&#10;[ { &quot;auth&quot;: { &quot;accessToken&quot;: &quot;...&quot;, &quot;refreshToken&quot;: &quot;...&quot;, &quot;realm&quot;: &quot;global&quot; } } ]"></textarea>
      </div>
      <div style="display:flex;justify-content:flex-end;gap:8px">
        <button class="btn btn-green" onclick="submitImport()">\u{1F680} \u9A8C\u8BC1\u8FDE\u901A\u5E76\u5BFC\u5165</button>
      </div>
      <pre class="code hidden" id="importResultBox" style="margin-top:10px"></pre>
    </div>
  </div>

  <!-- OAUTH MODAL -->
  <div id="oauthModal" class="modal-backdrop hidden">
    <div class="modal">
      <div class="card-title"><span id="oauthTitle">OAuth \u6388\u6743\u767B\u5F55</span><button class="btn btn-sm btn-pink" onclick="closeOAuthModal()">\u53D6\u6D88</button></div>
      <p style="font-size:12px;color:var(--text-dim)">\u8BF7\u5728\u65B0\u6253\u5F00\u7684\u6D4F\u89C8\u5668\u7A97\u53E3\u5B8C\u6210\u767B\u5F55\u6388\u6743\uFF0C\u63A7\u5236\u53F0\u6B63\u5728\u81EA\u52A8\u8F6E\u8BE2\u56DE\u8C03...</p>
      <div style="margin:10px 0"><a id="oauthLink" href="#" target="_blank" style="color:var(--cyan);word-break:break-all;font-size:12px"></a></div>
      <div id="oauthStatusText" class="tag tag-warn">\u7B49\u5F85\u7528\u6237\u5B8C\u6210\u7F51\u9875\u6388\u6743...</div>
    </div>
  </div>

  <div id="toast" class="toast hidden"></div>

  <script>
    const API = '/plugins/dsh-workbuddy2api';
    let state = { accounts: [], activeUid: null, summary: {}, models: [], aliases: {}, enabledModels: [], freeModels: [], config: {} };
    let oauthPollTimer = null;

    function toast(msg) {
      const el = document.getElementById('toast');
      el.textContent = msg;
      el.classList.remove('hidden');
      setTimeout(() => el.classList.add('hidden'), 3500);
    }

    async function api(path, opts = {}) {
      const res = await fetch(API + path, opts);
      return await res.json();
    }

    function switchTab(tab) {
      const tabs = ['pool', 'welfare', 'tasks', 'models', 'usage', 'settings'];
      tabs.forEach((t, idx) => {
        document.getElementById('tab-' + t).classList.toggle('hidden', t !== tab);
        document.querySelectorAll('.nav-btn')[idx].classList.toggle('active', t === tab);
      });
      if (tab === 'welfare') loadWelfareAndInvite();
      if (tab === 'tasks') loadTasks();
      if (tab === 'models') loadModels();
      if (tab === 'usage') loadUsage();
      if (tab === 'settings') renderSettings();
    }

    async function loadStatus(refresh = false) {
      try {
        const data = await api('/status' + (refresh ? '?refresh=1' : ''));
        if (!data.ok) return;
        state.accounts = data.accounts || [];
        state.activeUid = data.activeUid;
        state.summary = data.summary || {};
        state.aliases = data.aliases || {};
        state.enabledModels = data.enabledModels || [];
        state.config = data.config || {};
        document.getElementById('gatewayBadge').textContent = 'ONLINE :' + (data.gatewayPort || ${port});
        renderSummary();
        renderAccounts();
        syncUidSelectors();
        renderSettings();
      } catch (e) {
        toast('\u52A0\u8F7D\u72B6\u6001\u5931\u8D25: ' + e.message);
      }
    }

    function renderSummary() {
      const s = state.summary || {};
      const all = s.all || { remain: 0, total: 0, count: 0, enabledCount: 0, baseRemain: 0, bonusRemain: 0, purchasedRemain: 0, expiringRemain: 0 };
      const cn = s.cn || { remain: 0, total: 0, count: 0, enabledCount: 0 };
      const gl = s.global || { remain: 0, total: 0, count: 0, enabledCount: 0 };

      document.getElementById('realmSummaryCards').innerHTML = [
        { title: '\u5168\u6C60\u5408\u8BA1 (All)', kpi: all.remain, sub: '\u53EF\u7528\u8D26\u53F7 ' + all.enabledCount + '/' + all.count + ' | \u57FA\u7840 ' + (all.baseRemain||0) + ' \xB7 \u8D60\u9001 ' + (all.bonusRemain||0) + ' \xB7 \u5145\u503C ' + (all.purchasedRemain||0), cls: '' },
        { title: '\u56FD\u5185\u7248 (CodeBuddy CN)', kpi: cn.remain, sub: '\u542F\u7528 ' + cn.enabledCount + '/' + cn.count + ' | \u603B\u989D ' + (cn.total||0), cls: 'green' },
        { title: '\u56FD\u9645\u7248 (WorkBuddy AI)', kpi: gl.remain, sub: '\u542F\u7528 ' + gl.enabledCount + '/' + gl.count + ' | 7\u65E5\u5230\u671F ' + (gl.expiringRemain||0), cls: 'pink' }
      ].map(c => '<div class="card"><div class="card-title"><span>' + c.title + '</span></div><div class="kpi ' + c.cls + '">' + Number(c.kpi||0).toLocaleString() + '</div><div class="sub-row">' + c.sub + '</div></div>').join('');
    }

    function renderAccounts() {
      const tbody = document.getElementById('accountsTbody');
      document.getElementById('poolCountInfo').textContent = '\u5171 ' + state.accounts.length + ' \u4E2A\u8D26\u53F7';
      tbody.innerHTML = state.accounts.map(acc => {
        const b = acc.balance || {};
        const d = acc.diagnostics || {};
        const isAct = acc.uid === state.activeUid;
        const realmTag = acc.realm === 'global' ? '<span class="tag tag-global">GLOBAL</span>' : '<span class="tag tag-cn">CN</span>';
        let healthTag = '<span class="tag tag-cn">\u5065\u5EB7</span>';
        if (acc.disabled) healthTag = '<span class="tag tag-err">\u5DF2\u505C\u7528</span>';
        else if (d.coolingDown) healthTag = '<span class="tag tag-warn">\u51B7\u5374 ' + (d.cooldownRemainingSec||0) + 's</span>';
        else if (d.modelCooldowns && d.modelCooldowns.length > 0) healthTag = '<span class="tag tag-warn">' + d.modelCooldowns.length + '\u6A21\u578B\u9650\u6D41</span>';

        const pkgText = '\u57FA:' + (b.baseRemain||0) + ' \u8D60:' + (b.bonusRemain||0) + ' \u8D2D:' + (b.purchasedRemain||0);
        return '<tr>' +
          '<td><strong>' + escapeHtml(acc.nickname || acc.uid) + '</strong>' + (isAct ? ' <span class="tag tag-cn">\u4F18\u5148</span>' : '') + '<br><span style="color:var(--text-dim);font-size:11px">' + escapeHtml(acc.uid) + '</span></td>' +
          '<td>' + realmTag + '</td>' +
          '<td style="font-weight:700;color:var(--cyan)">' + Number(b.remain || 0).toLocaleString() + '<br><span style="color:var(--text-dim);font-size:10px">/ ' + Number(b.total || 0).toLocaleString() + '</span></td>' +
          '<td style="font-size:11px;color:var(--text-dim)">' + pkgText + '<br>\u6D3B\u8DC3\u5305: ' + (b.activePackCount||0) + '</td>' +
          '<td>' + healthTag + '<br><span style="font-size:10px;color:var(--text-dim)">\u6210\u529F:' + (d.stats?.successCount||0) + ' \u5931\u8D25:' + (d.stats?.failCount||0) + '</span></td>' +
          '<td>' + (acc.inFlight || 0) + ' / ' + (d.limit || 3) + '</td>' +
          '<td style="display:flex;gap:4px;flex-wrap:wrap">' +
            (isAct ? '' : '<button class="btn btn-sm" onclick="switchAcc(\\'' + acc.uid + '\\')">\u4F18\u5148</button>') +
            '<button class="btn btn-sm" onclick="adminAction(\\'' + acc.uid + '\\', \\'refresh\\')">\u5237\u65B0</button>' +
            (acc.disabled
              ? '<button class="btn btn-sm btn-green" onclick="adminAction(\\'' + acc.uid + '\\', \\'enable\\')">\u542F\u7528</button>'
              : '<button class="btn btn-sm btn-pink" onclick="adminAction(\\'' + acc.uid + '\\', \\'disable\\')">\u505C\u7528</button>') +
            ((d.coolingDown || (d.modelCooldowns && d.modelCooldowns.length))
              ? '<button class="btn btn-sm btn-amber" onclick="adminAction(\\'' + acc.uid + '\\', \\'revive\\')">\u89E3\u9664\u7194\u65AD</button>' : '') +
            (acc.realm === 'global'
              ? '<button class="btn btn-sm btn-green" onclick="adminAction(\\'' + acc.uid + '\\', \\'trial\\')">\u9886Trial</button>' : '') +
            '<button class="btn btn-sm btn-pink" onclick="deleteAcc(\\'' + acc.uid + '\\')">\u5220</button>' +
          '</td>' +
        '</tr>';
      }).join('');
    }

    function escapeHtml(s) {
      return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    function syncUidSelectors() {
      const opts = state.accounts.map(a => '<option value="' + a.uid + '" ' + (a.uid === state.activeUid ? 'selected' : '') + '>[' + a.realm.toUpperCase() + '] ' + escapeHtml(a.nickname) + '</option>').join('');
      const wSel = document.getElementById('welfareUidSelect');
      const tSel = document.getElementById('tasksUidSelect');
      const prevW = wSel.value;
      const prevT = tSel.value;
      wSel.innerHTML = opts;
      tSel.innerHTML = opts;
      if (prevW) wSel.value = prevW;
      if (prevT) tSel.value = prevT;
    }

    async function switchAcc(uid) {
      await api('/accounts/switch', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid }) });
      toast('\u5DF2\u5207\u6362\u4F18\u5148\u8D26\u53F7');
      loadStatus();
    }

    async function deleteAcc(uid) {
      if (!confirm('\u786E\u8BA4\u4ECE\u8D26\u53F7\u6C60\u5220\u9664 ' + uid + ' \u5417\uFF1F')) return;
      await api('/accounts/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid }) });
      toast('\u8D26\u53F7\u5DF2\u5220\u9664');
      loadStatus();
    }

    async function adminAction(uid, action) {
      toast('\u6B63\u5728\u6267\u884C ' + action + ' ...');
      const res = await api('/accounts/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, action })
      });
      toast(res.message || (res.ok ? '\u64CD\u4F5C\u6210\u529F' : res.error || '\u64CD\u4F5C\u5931\u8D25'));
      loadStatus();
    }

    async function refreshAllTokens() {
      toast('\u6B63\u5728\u6279\u91CF\u5237\u65B0 Token \u4E0E\u79EF\u5206...');
      const res = await api('/accounts/refresh-all', { method: 'POST' });
      toast('\u5237\u65B0\u5B8C\u6210: \u6210\u529F ' + res.refreshed + ', \u5931\u8D25 ' + res.failed);
      loadStatus(true);
    }

    async function clearAllCooldowns() {
      const res = await api('/accounts/clear-all-cooldowns', { method: 'POST' });
      toast('\u5DF2\u6E05\u9664\u6240\u6709\u7194\u65AD (' + (res.cleared || 0) + ')');
      loadStatus();
    }

    async function startOAuth(realm) {
      try {
        const res = await api('/oauth/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ realm })
        });
        if (!res.ok) throw new Error(res.error);
        document.getElementById('oauthTitle').textContent = (realm === 'global' ? '\u56FD\u9645\u7248 WorkBuddy AI' : '\u56FD\u5185\u7248 CodeBuddy') + ' OAuth \u767B\u5F55';
        document.getElementById('oauthLink').href = res.url;
        document.getElementById('oauthLink').textContent = res.url;
        document.getElementById('oauthStatusText').textContent = '\u7B49\u5F85\u6D4F\u89C8\u5668\u6388\u6743\u4E2D...';
        document.getElementById('oauthModal').classList.remove('hidden');
        window.open(res.url, '_blank');

        if (oauthPollTimer) clearInterval(oauthPollTimer);
        oauthPollTimer = setInterval(async () => {
          const poll = await api('/oauth/poll', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ realm, state: res.state })
          });
          if (poll.success) {
            clearInterval(oauthPollTimer);
            oauthPollTimer = null;
            document.getElementById('oauthModal').classList.add('hidden');
            toast('OAuth \u767B\u5F55\u6210\u529F\uFF1A' + (poll.account?.account?.nickname || '\u65B0\u8D26\u53F7'));
            loadStatus(true);
          }
        }, 2000);
      } catch (e) {
        toast('\u53D1\u8D77 OAuth \u5931\u8D25: ' + e.message);
      }
    }

    function closeOAuthModal() {
      if (oauthPollTimer) clearInterval(oauthPollTimer);
      oauthPollTimer = null;
      document.getElementById('oauthModal').classList.add('hidden');
    }

    function openImportModal() {
      document.getElementById('importResultBox').classList.add('hidden');
      document.getElementById('importModal').classList.remove('hidden');
    }
    function closeImportModal() {
      document.getElementById('importModal').classList.add('hidden');
    }

    async function submitImport() {
      const realm = document.getElementById('importRealm').value;
      const fileEl = document.getElementById('importFileInput');
      const textVal = document.getElementById('importTextarea').value;
      let payload = { defaultRealm: realm, content: textVal };

      if (fileEl.files && fileEl.files[0]) {
        const buf = await fileEl.files[0].arrayBuffer();
        const bytes = new Uint8Array(buf);
        let bin = '';
        for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
        payload = { defaultRealm: realm, base64Zip: btoa(bin) };
      }

      toast('\u6B63\u5728\u6821\u9A8C\u51ED\u8BC1\u5E76\u5BFC\u5165...');
      const res = await api('/accounts/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const box = document.getElementById('importResultBox');
      box.textContent = JSON.stringify(res, null, 2);
      box.classList.remove('hidden');
      toast('\u5BFC\u5165\u5B8C\u6210: \u65B0\u589E ' + res.imported + ' / \u66F4\u65B0 ' + res.updated + ' / \u5931\u8D25 ' + res.failed);
      loadStatus(true);
    }

    function exportZip() {
      window.location.href = API + '/accounts/export.zip';
    }

    async function loadWelfareAndInvite() {
      const uid = document.getElementById('welfareUidSelect').value || state.activeUid;
      if (!uid) return;
      try {
        const [tr, gr, inv] = await Promise.all([
          api('/travel/status?uid=' + encodeURIComponent(uid)),
          api('/growth/status?uid=' + encodeURIComponent(uid)),
          api('/invite/info?uid=' + encodeURIComponent(uid))
        ]);
        document.getElementById('travelBox').textContent = tr.ok
          ? '\u732B\u732B: ' + (tr.buddy?.name || '\u672A\u9886\u517B') + ' | \u72B6\u6001: ' + (tr.travel?.state || '\u672A\u77E5') + ' | \u5956\u52B1: ' + (tr.travel?.reward_credit || 0)
          : (tr.message || '\u4EC5\u56FD\u5185\u7248\u652F\u6301\u732B\u732B\u65C5\u884C');
        document.getElementById('inviteBox').innerHTML = inv.ok
          ? '\u6211\u7684\u9080\u8BF7\u7801: <strong style="color:var(--cyan)">' + escapeHtml(inv.info.inviteCode) + '</strong> | \u94FE\u63A5: <a style="color:var(--emerald)" target="_blank" href="' + inv.info.inviteUrl + '">' + escapeHtml(inv.info.inviteUrl) + '</a> (\u5DF2\u9080 ' + inv.info.invitedCount + ' \u4EBA)'
          : '\u65E0\u6CD5\u83B7\u53D6\u9080\u8BF7\u4FE1\u606F';
        document.getElementById('welfareLog').textContent = JSON.stringify({ streak: gr.streak, chances: gr.chances }, null, 2);
      } catch (e) {}
    }

    async function departTravel() {
      const uid = document.getElementById('welfareUidSelect').value || state.activeUid;
      const res = await api('/travel/depart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid }) });
      document.getElementById('welfareLog').textContent = JSON.stringify(res, null, 2);
      loadWelfareAndInvite();
    }

    async function batchRunTravel() {
      toast('\u6B63\u5728\u5DE1\u68C0\u5168\u91CF\u56FD\u5185\u8D26\u53F7\u732B\u732B\u65C5\u884C...');
      const res = await api('/travel/run-all', { method: 'POST' });
      document.getElementById('welfareLog').textContent = JSON.stringify(res, null, 2);
      toast('\u5DE1\u68C0\u5B8C\u6210');
      loadStatus(true);
    }

    async function batchClaimAll() {
      toast('\u6B63\u5728\u5168\u53F7\u6536\u5272\u5168\u5957\u798F\u5229\uFF08\u7B7E\u5230+\u6D3B\u8DC3+\u793C\u5305+\u8865\u507F+\u732B\u732B+\u62BD\u5956\uFF09...');
      const res = await api('/growth/claim-all', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ all: true }) });
      document.getElementById('welfareLog').textContent = JSON.stringify(res, null, 2);
      toast('\u5168\u53F7\u798F\u5229\u6536\u5272\u5B8C\u6210');
      loadStatus(true);
    }

    async function singleCheckin() {
      const uid = document.getElementById('welfareUidSelect').value || state.activeUid;
      const res = await api('/checkin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid }) });
      document.getElementById('welfareLog').textContent = JSON.stringify(res, null, 2);
      toast(res.message || '\u7B7E\u5230\u6267\u884C\u5B8C\u6210');
      loadStatus(true);
    }

    async function drawLottery() {
      const uid = document.getElementById('welfareUidSelect').value || state.activeUid;
      const res = await api('/growth/lottery/draw', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid }) });
      document.getElementById('welfareLog').textContent = JSON.stringify(res, null, 2);
      loadWelfareAndInvite();
    }

    async function bindInvite() {
      const uid = document.getElementById('welfareUidSelect').value || state.activeUid;
      const inviteCode = document.getElementById('bindInviteInput').value.trim();
      const res = await api('/invite/bind', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid, inviteCode }) });
      toast(res.message || '\u7ED1\u5B9A\u5B8C\u6210');
      document.getElementById('welfareLog').textContent = JSON.stringify(res, null, 2);
    }

    async function loadTasks() {
      const uid = document.getElementById('tasksUidSelect').value || state.activeUid;
      if (!uid) return;
      const res = await api('/tasks/list?uid=' + encodeURIComponent(uid));
      const listEl = document.getElementById('tasksList');
      if (!res.ok) {
        listEl.innerHTML = '<div style="color:var(--magenta)">' + escapeHtml(res.message || '\u52A0\u8F7D\u5931\u8D25') + '</div>';
        return;
      }
      const items = res.tasks || [];
      document.getElementById('tasksSummary').textContent = '\u5171 ' + items.length + ' \u9879\u4EFB\u52A1';
      listEl.innerHTML = items.map(t =>
        '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:12px">' +
          '<div><strong>' + escapeHtml(t.name || t.title || t.code) + '</strong> <span style="color:var(--text-dim)">(' + escapeHtml(t.code || '') + ')</span></div>' +
          '<div><span class="tag ' + (t.claimed ? 'tag-cn' : t.completed ? 'tag-warn' : 'tag-err') + '">' + (t.claimed ? '\u5DF2\u9886\u5956' : t.completed ? '\u5F85\u9886\u53D6' : '\u5F85\u89E6\u53D1') + '</span></div>' +
        '</div>'
      ).join('') || '<div class="sub-row">\u5F53\u524D\u8D26\u53F7\u6682\u65E0\u53EF\u67E5\u8BE2\u6210\u957F\u4EFB\u52A1</div>';
    }

    async function runTasks(all) {
      const uid = document.getElementById('tasksUidSelect').value || state.activeUid;
      toast(all ? '\u6B63\u5728\u5168\u91CF\u56FD\u5185\u53F7\u81EA\u52A8\u8DD1\u6210\u957F\u4EFB\u52A1...' : '\u6B63\u5728\u5168\u81EA\u52A8\u70B9\u4EAE\u5E76\u6536\u5272\u4EFB\u52A1...');
      const res = await api('/tasks/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, all })
      });
      toast('\u6210\u957F\u4EFB\u52A1\u81EA\u52A8\u6536\u5272\u5B8C\u6210');
      loadTasks();
      loadStatus(true);
    }

    async function loadModels() {
      const res = await api('/models');
      if (!res.ok) return;
      state.models = res.models || [];
      state.enabledModels = res.enabledModels || [];
      state.aliases = res.aliases || {};
      state.freeModels = res.freeModels || [];
      document.getElementById('freeModelsInput').value = state.freeModels.join(', ');
      document.getElementById('aliasesTextarea').value = JSON.stringify(state.aliases, null, 2);
      renderModelsTable();
    }

    function renderModelsTable() {
      const q = (document.getElementById('modelSearch').value || '').toLowerCase();
      const enabledSet = new Set(state.enabledModels);
      const filtered = state.models.filter(m => !q || m.id.toLowerCase().includes(q));
      document.getElementById('modelCountLabel').textContent = '\u5171 ' + filtered.length + ' \u4E2A\u6A21\u578B';
      document.getElementById('modelsTbody').innerHTML = filtered.map(m =>
        '<tr>' +
          '<td><input type="checkbox" class="model-chk" value="' + escapeHtml(m.id) + '" ' + (enabledSet.has(m.id) ? 'checked' : '') + ' /></td>' +
          '<td><strong>' + escapeHtml(m.id) + '</strong>' + (m.source === 'discovered' ? ' <span class="tag tag-global">\u52A8\u6001</span>' : '') + '</td>' +
          '<td>' + escapeHtml(m.realm) + '</td>' +
          '<td>' + escapeHtml(m.rate || '-') + '</td>' +
          '<td>' + Math.round((m.contextWindow || 0) / 1000) + 'k</td>' +
        '</tr>'
      ).join('');
    }

    async function discoverModels() {
      toast('\u6B63\u5728\u5411\u4E0A\u6E38\u53D1\u73B0\u6700\u65B0\u53EF\u7528\u6A21\u578B...');
      const res = await api('/models/discover', { method: 'POST' });
      toast('\u6A21\u578B\u76EE\u5F55\u540C\u6B65\u5B8C\u6210\uFF0C\u603B\u8BA1 ' + (res.models?.length || 0) + ' \u4E2A\u6A21\u578B');
      loadModels();
    }

    async function saveModelsConfig() {
      const enabledModels = Array.from(document.querySelectorAll('.model-chk:checked')).map(el => el.value);
      const freeModels = document.getElementById('freeModelsInput').value.split(',').map(s => s.trim()).filter(Boolean);
      let aliases = state.aliases;
      try {
        aliases = JSON.parse(document.getElementById('aliasesTextarea').value);
      } catch (e) {
        toast('\u522B\u540D JSON \u683C\u5F0F\u6709\u8BEF: ' + e.message);
        return;
      }
      await api('/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabledModels, aliases, freeModels })
      });
      toast('\u6A21\u578B\u8FC7\u6EE4\u4E0E\u522B\u540D\u89C4\u5219\u5DF2\u4FDD\u5B58');
      loadModels();
    }

    async function loadUsage() {
      const res = await api('/usage');
      if (!res.ok) return;
      const st = res.stats;
      document.getElementById('usageSummaryCards').innerHTML = [
        { title: '\u4ECA\u65E5\u8BF7\u6C42 / \u603B\u8BF7\u6C42', kpi: st.today.requests + ' / ' + st.summary.totalRequests, cls: '' },
        { title: '\u4ECA\u65E5\u8F93\u5165 Tokens', kpi: st.today.inputTokens.toLocaleString(), cls: 'green' },
        { title: '\u4ECA\u65E5\u8F93\u51FA Tokens', kpi: st.today.outputTokens.toLocaleString(), cls: 'pink' }
      ].map(c => '<div class="card"><div class="card-title"><span>' + c.title + '</span></div><div class="kpi ' + c.cls + '">' + c.kpi + '</div></div>').join('');

      const max7 = Math.max(1, ...st.trend7d.map(d => d.tokens));
      document.getElementById('chart7d').innerHTML = st.trend7d.map(d =>
        '<div class="bar-col" title="' + d.date + ': ' + d.tokens + ' tokens (' + d.requests + ' reqs)"><div class="bar-fill" style="height:' + Math.max(4, Math.round(d.tokens / max7 * 90)) + '%"></div><div class="bar-lbl">' + d.date + '</div></div>'
      ).join('');

      const max24 = Math.max(1, ...st.hourly.map(h => h.tokens));
      document.getElementById('chart24h').innerHTML = st.hourly.map(h =>
        '<div class="bar-col" title="' + h.hour + ': ' + h.tokens + ' tokens"><div class="bar-fill" style="height:' + Math.max(3, Math.round(h.tokens / max24 * 90)) + '%"></div><div class="bar-lbl">' + h.hour.replace('\u65F6','') + '</div></div>'
      ).join('');
    }

    async function resetUsage() {
      if (!confirm('\u786E\u8BA4\u6E05\u7A7A\u5168\u90E8\u672C\u5730\u7EDF\u8BA1\u7528\u91CF\u8D26\u672C\u5417\uFF1F')) return;
      await api('/stats/reset', { method: 'POST' });
      toast('\u7528\u91CF\u8D26\u672C\u5DF2\u6E05\u7A7A');
      loadUsage();
    }

    function renderSettings() {
      const c = state.config || {};
      document.getElementById('cfgApiKey').value = c.apiKey || '';
      document.getElementById('cfgProxy').value = c.proxy || '';
      document.getElementById('cfgMaxCN').value = c.maxInFlightCN || 3;
      document.getElementById('cfgMaxGlobal').value = c.maxInFlightGlobal || 2;
      document.getElementById('cfgQueueTimeout').value = c.queueTimeoutMs ?? 5000;
      document.getElementById('cfgPromptMode').value = c.promptMode || 'none';
      document.getElementById('cfgPromptText').value = c.promptText || '';
      document.getElementById('cfgAutoCheckin').checked = c.autoCheckin !== false;
      document.getElementById('cfgAutoTravel').checked = c.autoTravel !== false;
      document.getElementById('cfgAutoRefresh').checked = c.autoRefreshToken !== false;

      const base = window.location.origin;
      document.getElementById('guideCode').textContent =
        '# OpenAI Chat Completions (Cursor / Cherry Studio / DSH / OpenCode)\\n' +
        'Base URL : ' + base + '/v1\\n' +
        'Chat URL : ' + base + '/v1/chat/completions\\n' +
        'Models   : ' + base + '/v1/models\\n\\n' +
        '# Anthropic Messages (Claude Code / Cline)\\n' +
        'ANTHROPIC_BASE_URL=' + base + '\\n' +
        'Messages : ' + base + '/v1/messages\\n\\n' +
        '# OpenAI Responses API & Video Generation\\n' +
        'Responses: ' + base + '/v1/responses\\n' +
        'Videos   : ' + base + '/v1/videos/generations';
    }

    async function saveConfig() {
      const payload = {
        apiKey: document.getElementById('cfgApiKey').value.trim(),
        proxy: document.getElementById('cfgProxy').value.trim(),
        maxInFlightCN: Number(document.getElementById('cfgMaxCN').value) || 3,
        maxInFlightGlobal: Number(document.getElementById('cfgMaxGlobal').value) || 2,
        queueTimeoutMs: Number(document.getElementById('cfgQueueTimeout').value) || 0,
        promptMode: document.getElementById('cfgPromptMode').value,
        promptText: document.getElementById('cfgPromptText').value,
        autoCheckin: document.getElementById('cfgAutoCheckin').checked,
        autoTravel: document.getElementById('cfgAutoTravel').checked,
        autoRefreshToken: document.getElementById('cfgAutoRefresh').checked
      };
      const res = await api('/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      state.config = res.config || payload;
      toast('\u7F51\u5173\u914D\u7F6E\u5DF2\u4FDD\u5B58\u5E76\u5373\u65F6\u751F\u6548');
    }

    loadStatus(false);
    setInterval(() => loadStatus(false), 30000);
  </script>
</body>
</html>`;
}

// src/server/web-routes.js
function sendJson2(res, status, data) {
  if (res.writableEnded) return;
  if (!res.headersSent) {
    res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  }
  res.end(JSON.stringify(data));
}
function parseRawBody(req, maxBytes = 25 * 1024 * 1024) {
  return new Promise((resolve) => {
    const chunks = [];
    let total = 0;
    req.on("data", (c) => {
      total += c.length;
      if (total <= maxBytes) chunks.push(c);
    });
    req.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
    req.on("error", () => resolve(Buffer.alloc(0)));
  });
}
async function parseJsonBody(req) {
  const buf = await parseRawBody(req);
  if (!buf || buf.length === 0) return {};
  try {
    return JSON.parse(buf.toString("utf8"));
  } catch (_) {
    return {};
  }
}
function createEmptyRealmSummary() {
  return {
    count: 0,
    enabledCount: 0,
    healthyCount: 0,
    remain: 0,
    total: 0,
    used: 0,
    baseRemain: 0,
    bonusRemain: 0,
    purchasedRemain: 0,
    expiringRemain: 0
  };
}
function accumulateSummary(bucket, acc, bal, coolingDown) {
  bucket.count += 1;
  if (!acc.disabled) {
    bucket.enabledCount += 1;
    if (!coolingDown) bucket.healthyCount += 1;
  }
  if (bal && !bal.error) {
    bucket.remain += Number(bal.remain || 0);
    bucket.total += Number(bal.total || 0);
    bucket.used += Number(bal.used || 0);
    bucket.baseRemain += Number(bal.baseRemain || 0);
    bucket.bonusRemain += Number(bal.bonusRemain || 0);
    bucket.purchasedRemain += Number(bal.purchasedRemain || 0);
    bucket.expiringRemain += Number(bal.expiringRemain || 0);
  }
}
function registerWebRoutes(ctx, deps) {
  const { scheduler, client, ledger, loopback, configStore } = deps;
  const store = scheduler.store;
  const balanceCache = /* @__PURE__ */ new Map();
  const BALANCE_TTL = 2e4;
  async function getAccountBalance(account, force = false) {
    if (!account) return null;
    const uid = account.account.uid;
    const cached = balanceCache.get(uid);
    if (!force && cached && Date.now() - cached.fetchedAt < BALANCE_TTL) {
      return cached.data;
    }
    try {
      const bal = await client.fetchBalance(account);
      balanceCache.set(uid, { data: bal, fetchedAt: Date.now() });
      return bal;
    } catch (err) {
      if (cached) return cached.data;
      return {
        remain: 0,
        total: 0,
        used: 0,
        baseRemain: 0,
        bonusRemain: 0,
        purchasedRemain: 0,
        expiringRemain: 0,
        packCount: 0,
        activePackCount: 0,
        packages: [],
        error: err.message,
        fetchedAt: Date.now()
      };
    }
  }
  const invalidateBalance = (uid) => {
    if (uid) balanceCache.delete(uid);
    else balanceCache.clear();
  };
  const getRuntimeCfg = () => configStore ? configStore.getAll() : {};
  const routes = [
    // 1. 全局状态、3-Realm 积分汇总与诊断看板
    {
      path: "/plugins/dsh-workbuddy2api/status",
      handler: async (req, res) => {
        const u = new URL(req.url, "http://localhost");
        const force = u.searchParams.get("refresh") === "1";
        const all = store.getAll();
        const active = store.getActive();
        const summary = {
          all: createEmptyRealmSummary(),
          cn: createEmptyRealmSummary(),
          global: createEmptyRealmSummary()
        };
        const accounts = await Promise.all(all.map(async (a) => {
          const uid = a.account.uid;
          const bal = await getAccountBalance(a, force && !a.disabled);
          const diag = scheduler.getAccountDiagnostics(uid);
          const realmKey = a.auth?.realm === "global" ? "global" : "cn";
          accumulateSummary(summary.all, a, bal, diag.coolingDown);
          accumulateSummary(summary[realmKey], a, bal, diag.coolingDown);
          return {
            uid,
            nickname: a.account.nickname,
            realm: a.auth.realm,
            enterpriseId: a.account.enterpriseId || "",
            provider: a.account.provider || "",
            disabled: Boolean(a.disabled),
            disabledReason: a.disabledReason || "",
            source: a.source || "",
            inFlight: diag.inFlight,
            coolingDown: diag.coolingDown,
            diagnostics: diag,
            expiresAt: a.auth.expiresAt,
            updatedAt: a.updatedAt,
            balance: bal
          };
        }));
        const balance = active ? await getAccountBalance(active, force) : null;
        const cfg = getRuntimeCfg();
        sendJson2(res, 200, {
          ok: true,
          activeUid: store.activeUid,
          accounts,
          balance,
          summary,
          gatewayPort: loopback.actualPort || loopback.preferredPort,
          aliases: { ...DEFAULT_MODEL_ALIASES, ...cfg.aliases || {} },
          enabledModels: cfg.enabledModels || Array.from(loopback.enabledModels),
          freeModels: cfg.freeModels || [],
          discoveredModelsCount: loopback.discoveredModels?.length || 0,
          config: cfg,
          stats: ledger.getStats()
        });
      }
    },
    // 2. 切换优先账号
    {
      path: "/plugins/dsh-workbuddy2api/accounts/switch",
      handler: async (req, res) => {
        const body = await parseJsonBody(req);
        const success = store.setActive(body.uid);
        sendJson2(res, 200, { ok: success, activeUid: store.activeUid });
      }
    },
    // 3. 粘贴单条 Token 添加账号（自动解析 JWT 字段与认证验证）
    {
      path: "/plugins/dsh-workbuddy2api/accounts/add",
      handler: async (req, res) => {
        try {
          const body = await parseJsonBody(req);
          const rawAccess = (body.accessToken || body.token || body.refreshToken || "").trim();
          const rawRefresh = (body.refreshToken || body.token || "").trim();
          if (!rawAccess && !rawRefresh) {
            sendJson2(res, 400, { ok: false, error: "Token \u6216 Refresh Token \u4E0D\u80FD\u4E3A\u7A7A" });
            return;
          }
          const claims = parseJWTClaims(rawAccess) || parseJWTClaims(rawRefresh) || {};
          const uid = body.uid || claims.sub || claims.uid || `user-${Date.now().toString(36)}`;
          let realm = (body.realm || "").toLowerCase();
          if (!realm) {
            const iss = String(claims.iss || "").toLowerCase();
            realm = iss.includes("codebuddy") || iss.includes("tencent") ? "cn" : "global";
          }
          const nickname = body.nickname || claims.nickname || claims.name || claims.email || `Account-${String(uid).slice(0, 6)}`;
          const candidate = {
            account: {
              uid: String(uid),
              nickname: String(nickname),
              enterpriseId: body.enterpriseId || "",
              provider: claims.provider || ""
            },
            auth: {
              realm: realm === "cn" ? "cn" : "global",
              accessToken: rawAccess || rawRefresh,
              refreshToken: rawRefresh || rawAccess,
              expiresAt: claims.exp ? claims.exp * 1e3 : Date.now() + 72e5,
              domain: realm === "cn" ? "copilot.tencent.com" : "www.workbuddy.ai"
            }
          };
          try {
            if (candidate.auth.refreshToken) {
              await client.refreshToken(candidate);
            } else {
              await client.fetchBalance(candidate);
            }
          } catch (e) {
            await client.fetchBalance(candidate);
          }
          store.upsert(candidate);
          invalidateBalance(candidate.account.uid);
          sendJson2(res, 200, { ok: true, account: candidate });
        } catch (err) {
          sendJson2(res, 400, { ok: false, error: `\u8D26\u53F7\u51ED\u8BC1\u9A8C\u8BC1\u5931\u8D25: ${err.message}` });
        }
      }
    },
    // 4. 删除账号
    {
      path: "/plugins/dsh-workbuddy2api/accounts/delete",
      handler: async (req, res) => {
        const body = await parseJsonBody(req);
        const deleted = store.delete(body.uid);
        invalidateBalance(body.uid);
        sendJson2(res, 200, { ok: deleted });
      }
    },
    // 5. 批量导入账号 (支持 ZIP 二进制流 / JSON base64Zip / 多格式文本卡密)
    {
      path: "/plugins/dsh-workbuddy2api/accounts/import",
      handler: async (req, res) => {
        try {
          const u = new URL(req.url, "http://localhost");
          const contentType = String(req.headers["content-type"] || "").toLowerCase();
          const rawBuf = await parseRawBody(req);
          let input = rawBuf;
          let defaultRealm = u.searchParams.get("realm") || "global";
          const looksBinaryZip = contentType.includes("application/zip") || contentType.includes("application/octet-stream") || rawBuf.length >= 2 && rawBuf[0] === 80 && rawBuf[1] === 75;
          if (!looksBinaryZip) {
            const text = rawBuf.toString("utf8");
            if (contentType.includes("application/json") || text.trim().startsWith("{")) {
              try {
                const parsed = JSON.parse(text);
                if (parsed.defaultRealm) defaultRealm = parsed.defaultRealm;
                if (parsed.base64Zip) {
                  input = Buffer.from(parsed.base64Zip, "base64");
                } else if (typeof parsed.content === "string") {
                  input = parsed.content;
                } else {
                  input = text;
                }
              } catch (_) {
                input = text;
              }
            } else {
              input = text;
            }
          }
          const result = await batchImportAccounts(input, store, client, defaultRealm);
          invalidateBalance();
          sendJson2(res, 200, result);
        } catch (err) {
          sendJson2(res, 400, { ok: false, error: `\u6279\u91CF\u5BFC\u5165\u5931\u8D25: ${err.message}` });
        }
      }
    },
    // 6. 导出完整账号池 ZIP 备份包
    {
      path: "/plugins/dsh-workbuddy2api/accounts/export.zip",
      handler: async (_req, res) => {
        const zipBuf = exportBackupZip(store);
        const stamp = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
        res.writeHead(200, {
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename="workbuddy2api-backup-${stamp}.zip"`,
          "Content-Length": String(zipBuf.length)
        });
        res.end(zipBuf);
      }
    },
    // 7. 账号运行管控 (启用 / 停用 / 解除熔断复活 / 刷新 Token & 积分 / 国际版领 Trial)
    {
      path: "/plugins/dsh-workbuddy2api/accounts/admin",
      handler: async (req, res) => {
        try {
          const body = await parseJsonBody(req);
          const { uid, action } = body;
          const acc = store.get(uid);
          if (!acc) {
            sendJson2(res, 404, { ok: false, error: "\u8D26\u53F7\u672A\u627E\u5230" });
            return;
          }
          if (action === "enable") {
            store.setDisabled(uid, false, "");
            scheduler.clearCooldown(uid);
            sendJson2(res, 200, { ok: true, message: `\u5DF2\u542F\u7528\u8D26\u53F7 ${acc.account.nickname}` });
            return;
          }
          if (action === "disable") {
            store.setDisabled(uid, true, body.reason || "\u624B\u52A8\u505C\u7528");
            sendJson2(res, 200, { ok: true, message: `\u5DF2\u505C\u7528\u8D26\u53F7 ${acc.account.nickname}` });
            return;
          }
          if (action === "revive" || action === "clearCooldown") {
            scheduler.clearCooldown(uid);
            sendJson2(res, 200, { ok: true, message: `\u5DF2\u89E3\u9664 ${acc.account.nickname} \u5168\u90E8\u51B7\u5374\u72B6\u6001` });
            return;
          }
          if (action === "refresh") {
            if (acc.auth?.refreshToken) {
              await client.refreshToken(acc);
              store.upsert(acc);
            }
            scheduler.clearCooldown(uid);
            invalidateBalance(uid);
            const balance = await getAccountBalance(acc, true);
            sendJson2(res, 200, { ok: true, message: "Token \u4E0E\u79EF\u5206\u5DF2\u5237\u65B0", balance });
            return;
          }
          if (action === "trial") {
            const trialRes = await claimGlobalTrial(acc, client);
            invalidateBalance(uid);
            sendJson2(res, trialRes.ok ? 200 : 400, trialRes);
            return;
          }
          sendJson2(res, 400, { ok: false, error: `\u672A\u77E5\u7BA1\u63A7\u52A8\u4F5C: ${action}` });
        } catch (err) {
          sendJson2(res, 500, { ok: false, error: err.message });
        }
      }
    },
    // 8. 全局一键解除所有熔断 & 批量刷新全部 Token
    {
      path: "/plugins/dsh-workbuddy2api/accounts/clear-all-cooldowns",
      handler: async (_req, res) => {
        const cleared = scheduler.clearAllCooldowns();
        sendJson2(res, 200, { ok: true, cleared, message: `\u5DF2\u6E05\u7406 ${cleared} \u6761\u7194\u65AD\u51B7\u5374\u8BB0\u5F55` });
      }
    },
    {
      path: "/plugins/dsh-workbuddy2api/accounts/refresh-all",
      handler: async (_req, res) => {
        const result = await scheduler.refreshAllTokens(false);
        invalidateBalance();
        sendJson2(res, 200, { ok: true, ...result });
      }
    },
    // 9. 官方 OAuth 网页一键授权登录
    {
      path: "/plugins/dsh-workbuddy2api/oauth/start",
      handler: async (req, res) => {
        try {
          const body = await parseJsonBody(req);
          const flow = await startOAuthFlow(body.realm || "cn");
          sendJson2(res, 200, { ok: true, ...flow });
        } catch (err) {
          sendJson2(res, 400, { ok: false, error: err.message });
        }
      }
    },
    {
      path: "/plugins/dsh-workbuddy2api/oauth/poll",
      handler: async (req, res) => {
        try {
          const body = await parseJsonBody(req);
          const poll = await pollOAuthFlow(body.realm || "cn", body.state, store);
          if (poll.success && poll.account?.account?.uid) {
            invalidateBalance(poll.account.account.uid);
          }
          sendJson2(res, 200, { ok: true, ...poll });
        } catch (err) {
          sendJson2(res, 400, { ok: false, error: err.message });
        }
      }
    },
    // 10. 官方邀请码与受邀绑定中心
    {
      path: "/plugins/dsh-workbuddy2api/invite/info",
      handler: async (req, res) => {
        const u = new URL(req.url, "http://localhost");
        const uid = u.searchParams.get("uid") || store.activeUid;
        const target = store.get(uid);
        if (!target) {
          sendJson2(res, 404, { ok: false, message: "\u8D26\u53F7\u672A\u627E\u5230" });
          return;
        }
        try {
          const info = await fetchInviteInfo(target);
          sendJson2(res, 200, { ok: true, uid, info });
        } catch (err) {
          sendJson2(res, 500, { ok: false, message: err.message });
        }
      }
    },
    {
      path: "/plugins/dsh-workbuddy2api/invite/bind",
      handler: async (req, res) => {
        const body = await parseJsonBody(req);
        const uid = body.uid || store.activeUid;
        const target = store.get(uid);
        if (!target) {
          sendJson2(res, 404, { ok: false, message: "\u8D26\u53F7\u672A\u627E\u5230" });
          return;
        }
        const result = await bindInviteCode(target, body.inviteCode);
        invalidateBalance(target.account.uid);
        sendJson2(res, result.ok ? 200 : 400, result);
      }
    },
    // 11. 每日签到 (支持单号或全量签到)
    {
      path: "/plugins/dsh-workbuddy2api/checkin",
      handler: async (req, res) => {
        const body = await parseJsonBody(req);
        if (body.all) {
          const list = store.getAll().filter((a) => !a.disabled);
          const results = [];
          for (const acc of list) {
            try {
              const r = await performCheckin(acc);
              results.push({ uid: acc.account.uid, nickname: acc.account.nickname, ...r });
            } catch (e) {
              results.push({ uid: acc.account.uid, nickname: acc.account.nickname, ok: false, message: e.message });
            }
          }
          invalidateBalance();
          sendJson2(res, 200, { ok: true, results, message: `\u5DF2\u5B8C\u6210 ${results.length} \u4E2A\u8D26\u53F7\u7B7E\u5230\u5DE1\u68C0` });
          return;
        }
        const target = body.uid && store.get(body.uid) || store.getActive();
        if (!target) {
          sendJson2(res, 400, { ok: false, message: "\u65E0\u53EF\u7528\u8D26\u53F7" });
          return;
        }
        const result = await performCheckin(target);
        invalidateBalance(target.account.uid);
        sendJson2(res, 200, result);
      }
    },
    // 12. 用量统计与账本重置
    {
      path: "/plugins/dsh-workbuddy2api/usage",
      handler: async (_req, res) => {
        sendJson2(res, 200, { ok: true, stats: ledger.getStats() });
      }
    },
    {
      path: "/plugins/dsh-workbuddy2api/stats/reset",
      handler: async (_req, res) => {
        ledger.reset();
        sendJson2(res, 200, { ok: true, message: "\u7528\u91CF\u8D26\u672C\u5DF2\u91CD\u7F6E" });
      }
    },
    // 13. 模型目录动态发现、启用过滤与别名持久化
    {
      path: "/plugins/dsh-workbuddy2api/models",
      handler: async (req, res) => {
        if (req.method === "POST") {
          const body = await parseJsonBody(req);
          const patch = {};
          if (Array.isArray(body.enabledModels)) {
            patch.enabledModels = body.enabledModels;
            loopback.enabledModels = new Set(body.enabledModels);
          }
          if (body.aliases && typeof body.aliases === "object") {
            patch.aliases = body.aliases;
            loopback.modelAliases = { ...DEFAULT_MODEL_ALIASES, ...body.aliases };
          }
          if (Array.isArray(body.freeModels)) {
            patch.freeModels = body.freeModels;
          }
          const updated = configStore ? configStore.update(patch) : patch;
          sendJson2(res, 200, {
            ok: true,
            enabledModels: updated.enabledModels || Array.from(loopback.enabledModels),
            aliases: updated.aliases || loopback.modelAliases,
            freeModels: updated.freeModels || []
          });
        } else {
          const cfg = getRuntimeCfg();
          sendJson2(res, 200, {
            ok: true,
            models: loopback.getMergedModels(true),
            enabledModels: cfg.enabledModels || Array.from(loopback.enabledModels),
            aliases: { ...DEFAULT_MODEL_ALIASES, ...cfg.aliases || {} },
            freeModels: cfg.freeModels || []
          });
        }
      }
    },
    {
      path: "/plugins/dsh-workbuddy2api/models/discover",
      handler: async (_req, res) => {
        const models = await loopback.refreshDiscoveredModels();
        sendJson2(res, 200, {
          ok: true,
          models,
          discoveredCount: loopback.discoveredModels?.length || 0
        });
      }
    },
    // 14. 网关持久化配置读写
    {
      path: "/plugins/dsh-workbuddy2api/config",
      handler: async (req, res) => {
        if (!configStore) {
          sendJson2(res, 501, { ok: false, error: "ConfigStore \u672A\u521D\u59CB\u5316" });
          return;
        }
        if (req.method === "POST") {
          const body = await parseJsonBody(req);
          const updated = configStore.update(body);
          if (typeof body.proxy === "string") {
            client.proxy = body.proxy;
          }
          if (typeof body.maxInFlightCN === "number") {
            scheduler.maxInFlightCN = updated.maxInFlightCN;
          }
          if (typeof body.maxInFlightGlobal === "number") {
            scheduler.maxInFlightGlobal = updated.maxInFlightGlobal;
          }
          if (typeof body.queueTimeoutMs === "number") {
            scheduler.queueTimeoutMs = updated.queueTimeoutMs;
          }
          sendJson2(res, 200, { ok: true, config: updated });
        } else {
          sendJson2(res, 200, { ok: true, config: configStore.getAll() });
        }
      }
    },
    // 15. 猫猫旅行系列接口
    {
      path: "/plugins/dsh-workbuddy2api/travel/status",
      handler: async (req, res) => {
        const u = new URL(req.url, "http://localhost");
        const uid = u.searchParams.get("uid") || store.activeUid;
        const target = store.get(uid);
        if (!target) {
          sendJson2(res, 404, { ok: false, message: "\u8D26\u53F7\u672A\u627E\u5230" });
          return;
        }
        const buddy = await getBuddyInfo(target);
        const travel = await getTravelStatus(target);
        sendJson2(res, 200, { ok: true, uid, buddy, travel });
      }
    },
    {
      path: "/plugins/dsh-workbuddy2api/travel/depart",
      handler: async (req, res) => {
        const body = await parseJsonBody(req);
        const uid = body.uid || store.activeUid;
        const target = store.get(uid);
        if (!target) {
          sendJson2(res, 404, { ok: false, message: "\u8D26\u53F7\u672A\u627E\u5230" });
          return;
        }
        const result = await departTravel(target, body.locationId || 4);
        sendJson2(res, 200, result);
      }
    },
    {
      path: "/plugins/dsh-workbuddy2api/travel/claim",
      handler: async (req, res) => {
        const body = await parseJsonBody(req);
        const uid = body.uid || store.activeUid;
        const target = store.get(uid);
        if (!target) {
          sendJson2(res, 404, { ok: false, message: "\u8D26\u53F7\u672A\u627E\u5230" });
          return;
        }
        const result = await claimTravel(target, body.recordId);
        invalidateBalance(target.account.uid);
        sendJson2(res, 200, result);
      }
    },
    {
      path: "/plugins/dsh-workbuddy2api/travel/run-all",
      handler: async (_req, res) => {
        const results = await scheduler.runAllTravel();
        invalidateBalance();
        sendJson2(res, 200, { ok: true, results });
      }
    },
    // 16. 连登抽奖与全套福利
    {
      path: "/plugins/dsh-workbuddy2api/growth/status",
      handler: async (req, res) => {
        const u = new URL(req.url, "http://localhost");
        const uid = u.searchParams.get("uid") || store.activeUid;
        const target = store.get(uid);
        if (!target) {
          sendJson2(res, 404, { ok: false, message: "\u8D26\u53F7\u672A\u627E\u5230" });
          return;
        }
        const streak = await getStreak(target);
        const chances = await getLotteryChances(target);
        sendJson2(res, 200, { ok: true, uid, streak, chances });
      }
    },
    {
      path: "/plugins/dsh-workbuddy2api/growth/claim-all",
      handler: async (req, res) => {
        const body = await parseJsonBody(req);
        if (body.all) {
          const results = await scheduler.runAllWelfare();
          invalidateBalance();
          sendJson2(res, 200, { ok: true, results });
          return;
        }
        const uid = body.uid || store.activeUid;
        const target = store.get(uid);
        if (!target) {
          sendJson2(res, 404, { ok: false, message: "\u8D26\u53F7\u672A\u627E\u5230" });
          return;
        }
        const result = await claimAllWelfare(target);
        invalidateBalance(target.account.uid);
        sendJson2(res, 200, { ok: true, uid, result });
      }
    },
    {
      path: "/plugins/dsh-workbuddy2api/growth/lottery/draw",
      handler: async (req, res) => {
        const body = await parseJsonBody(req);
        const uid = body.uid || store.activeUid;
        const target = store.get(uid);
        if (!target) {
          sendJson2(res, 404, { ok: false, message: "\u8D26\u53F7\u672A\u627E\u5230" });
          return;
        }
        const result = await drawLottery(target);
        const chances = await getLotteryChances(target);
        invalidateBalance(target.account.uid);
        sendJson2(res, 200, { ok: true, uid, result, remainingChances: chances });
      }
    },
    // 17. 全自动成长任务（支持单号查询/触发与全号一键跑完）
    {
      path: "/plugins/dsh-workbuddy2api/tasks/list",
      handler: async (req, res) => {
        const u = new URL(req.url, "http://localhost");
        const uid = u.searchParams.get("uid") || store.activeUid;
        const target = store.get(uid);
        if (!target) {
          sendJson2(res, 404, { ok: false, message: "\u8D26\u53F7\u672A\u627E\u5230" });
          return;
        }
        const tasks = await fetchGrowthTasks(target);
        sendJson2(res, 200, { ok: true, uid, tasks });
      }
    },
    {
      path: "/plugins/dsh-workbuddy2api/tasks/run",
      handler: async (req, res) => {
        const body = await parseJsonBody(req);
        if (body.all) {
          const cnAccs = store.getAll().filter((a) => !a.disabled && a.auth?.realm !== "global");
          const results = [];
          for (const acc of cnAccs) {
            try {
              const r = await runAllGrowthTasks(acc);
              results.push({ uid: acc.account.uid, nickname: acc.account.nickname, ok: true, result: r });
            } catch (e) {
              results.push({ uid: acc.account.uid, nickname: acc.account.nickname, ok: false, error: e.message });
            }
            await new Promise((r) => setTimeout(r, 800));
          }
          invalidateBalance();
          sendJson2(res, 200, { ok: true, results });
          return;
        }
        const uid = body.uid || store.activeUid;
        const target = store.get(uid);
        if (!target) {
          sendJson2(res, 404, { ok: false, message: "\u8D26\u53F7\u672A\u627E\u5230" });
          return;
        }
        const result = await runAllGrowthTasks(target);
        invalidateBalance(target.account.uid);
        sendJson2(res, 200, { ok: true, uid, result });
      }
    },
    // 18. 极速实时余额刷新
    {
      path: "/plugins/dsh-workbuddy2api/balance",
      handler: async (req, res) => {
        const u = new URL(req.url, "http://localhost");
        const uid = u.searchParams.get("uid") || store.activeUid;
        const target = store.get(uid);
        if (!target) {
          sendJson2(res, 404, { ok: false, message: "\u8D26\u53F7\u672A\u627E\u5230" });
          return;
        }
        try {
          const balance = await getAccountBalance(target, true);
          sendJson2(res, 200, { ok: true, uid, balance });
        } catch (err) {
          sendJson2(res, 500, { ok: false, error: err.message });
        }
      }
    }
  ];
  const routeMap = new Map(routes.map((r) => [r.path, r.handler]));
  const handlePluginRoute = async (req, res, pathname) => {
    const handler = routeMap.get(pathname);
    if (!handler) return false;
    try {
      await handler(req, res);
    } catch (err) {
      if (!res.headersSent) {
        sendJson2(res, 500, { ok: false, error: err.message });
      }
    }
    return true;
  };
  if (loopback) {
    loopback.setPluginRouterHandler(handlePluginRoute);
    loopback.setDashboardHandler(async (_req, res) => {
      if (!res.headersSent) {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      }
      res.end(renderConsoleHtml({ port: loopback.actualPort || loopback.preferredPort }));
      return true;
    });
  }
  if (ctx?.effect) {
    ctx.effect(() => {
      const disposers = [];
      if (ctx.webServer && typeof ctx.webServer.register === "function") {
        for (const route of routes) {
          try {
            const dispose = ctx.webServer.register({
              kind: "exact",
              path: route.path,
              handler: route.handler
            });
            if (dispose) disposers.push(dispose);
          } catch (_) {
          }
        }
      }
      return () => {
        for (const d of disposers) {
          try {
            d();
          } catch (_) {
          }
        }
      };
    }, "dsh-workbuddy2api web routes");
  }
  return { routes, handlePluginRoute };
}

// src/adapter/pi-ai-adapter.js
function extractText(content) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content.filter((b) => b && (b.type === "text" || b.type === "input_text") && typeof b.text === "string").map((b) => b.text).join("\n");
}
async function toOpenAIRequest(options, ctx) {
  const messages = [];
  if (typeof options.system === "string" && options.system.trim()) {
    messages.push({ role: "system", content: options.system });
  }
  for (const msg of options.messages || []) {
    if (!msg) continue;
    if (msg.role === "system" || msg.role === "developer") {
      const txt = extractText(msg.content);
      if (txt) messages.push({ role: "system", content: txt });
      continue;
    }
    if (msg.role === "user") {
      if (typeof msg.content === "string") {
        messages.push({ role: "user", content: msg.content });
        continue;
      }
      const parts = [];
      let hasMedia = false;
      for (const b of msg.content || []) {
        if (!b) continue;
        if (b.type === "text" && b.text) {
          parts.push({ type: "text", text: b.text });
        } else if (b.type === "image") {
          hasMedia = true;
          if (b.url || b.image_url) {
            parts.push({ type: "image_url", image_url: { url: b.url || b.image_url?.url } });
          } else if (b.attachment && ctx?.get) {
            try {
              const attachments = ctx.get("attachments");
              if (attachments?.readImageRequest) {
                const img = await attachments.readImageRequest(
                  b.attachment,
                  { width: b.attachment.width || 2048, height: b.attachment.height || 2048, maxBytes: 2 * 1024 * 1024 },
                  options.signal
                );
                const b64 = Buffer.from(img.data).toString("base64");
                parts.push({
                  type: "image_url",
                  image_url: { url: `data:${img.mediaType || "image/png"};base64,${b64}` }
                });
              }
            } catch (_) {
              parts.push({ type: "text", text: `[\u56FE\u7247\u9644\u4EF6: ${b.attachment?.attachmentId || "image"}]` });
            }
          }
        }
      }
      if (!hasMedia) {
        messages.push({ role: "user", content: extractText(msg.content) });
      } else {
        messages.push({ role: "user", content: parts.length > 0 ? parts : "" });
      }
      continue;
    }
    if (msg.role === "assistant") {
      const contentArr = Array.isArray(msg.content) ? msg.content : [];
      const text = typeof msg.content === "string" ? msg.content : contentArr.filter((b) => b?.type === "text").map((b) => b.text).join("");
      const reasoning = contentArr.filter((b) => b?.type === "reasoning" || b?.type === "thinking").map((b) => b.text || "").join("");
      const toolCalls = contentArr.filter((b) => b?.type === "tool-call" || b?.type === "toolCall").map((b) => ({
        id: String(b.id || `call_${Date.now()}`),
        type: "function",
        function: {
          name: b.name,
          arguments: typeof b.arguments === "string" ? b.arguments : JSON.stringify(b.arguments || {})
        }
      }));
      const outMsg = { role: "assistant", content: text || "" };
      if (reasoning) outMsg.reasoning_content = reasoning;
      if (toolCalls.length > 0) outMsg.tool_calls = toolCalls;
      messages.push(outMsg);
      continue;
    }
    if (msg.role === "tool") {
      messages.push({
        role: "tool",
        tool_call_id: String(msg.toolCallId || ""),
        content: extractText(msg.content) || (msg.isError ? "Tool execution failed" : "ok")
      });
    }
  }
  const tools = Array.isArray(options.tools) ? options.tools.filter((t) => t && !t.deferLoading).map((t) => ({
    type: "function",
    function: {
      name: t.name,
      description: t.description || "",
      parameters: t.parameters || { type: "object", properties: {} }
    }
  })) : void 0;
  return {
    model: options.model,
    messages,
    stream: true,
    ...tools && tools.length > 0 ? { tools, tool_choice: "auto" } : {},
    ...options.temperature !== void 0 ? { temperature: options.temperature } : {},
    ...options.maxTokens !== void 0 ? { max_tokens: options.maxTokens } : {},
    ...options.reasoningEffort ? { reasoning_effort: options.reasoningEffort } : {},
    ...options.sessionId ? { conversation_id: String(options.sessionId) } : {}
  };
}
function createWorkBuddyAdapter(loopback, enabledModelsFn, runtimeDeps = {}) {
  const { scheduler, client, ledger, ctx } = runtimeDeps;
  const getBaseUrl = () => `http://127.0.0.1:${loopback.actualPort || 7863}/v1`;
  const getRawCatalog = () => {
    const enabled = enabledModelsFn ? enabledModelsFn() : [];
    const isFiltered = Array.isArray(enabled) && enabled.length > 0;
    return STATIC_MODELS.filter((m) => !isFiltered || enabled.includes(m.id));
  };
  const getCatalogModels = (provider = PROVIDER_ALIAS) => {
    return getRawCatalog().map((m) => {
      const suffix = m.rate ? ` \xB7 ${m.rate}` : "";
      const badgeSuffix = m.badge ? ` \xB7 ${m.badge}` : "";
      return {
        provider,
        id: m.id,
        name: `${m.name}${suffix}${badgeSuffix}`,
        inputModalities: m.supportsImages ? ["text", "image"] : ["text"]
      };
    });
  };
  const adapter = {
    providerInfo(provider) {
      return {
        id: provider,
        name: provider === PROVIDER_ALIAS ? "WorkBuddy 2API (\u5185\u7F6E\u514D\u5BC6)" : "WorkBuddy (\u5185\u7F6E\u514D\u5BC6)"
      };
    },
    providerRetryPolicy(_provider) {
      return void 0;
    },
    imageRequestPricing(_provider, _model) {
      return void 0;
    },
    imageRequestTarget(_provider, _model, image) {
      return {
        width: image.width,
        height: image.height,
        maxBytes: image.bytes
      };
    },
    async listModels(provider = PROVIDER_ALIAS) {
      return getCatalogModels(provider);
    },
    async resolveModel(provider, model, _signal) {
      let actualProvider = provider;
      let actualModel = model;
      if (model === void 0 || typeof model === "object" && model !== null) {
        actualModel = provider;
        actualProvider = PROVIDER_ALIAS;
      }
      const found = STATIC_MODELS.find((m) => m.id === actualModel);
      return {
        provider: actualProvider,
        id: actualModel,
        name: found ? `${found.name}${found.rate ? ` \xB7 ${found.rate}` : ""}` : actualModel,
        inputModalities: found?.supportsImages ? ["text", "image"] : ["text"],
        context: { contextWindow: found?.contextWindow || 2e5 },
        defaultMaxTokens: found?.maxTokens || 32e3,
        reasoning: {
          efforts: [
            { id: "low", name: "Low" },
            { id: "medium", name: "Medium" },
            { id: "high", name: "High" },
            { id: "xhigh", name: "XHigh" }
          ],
          defaultEffort: "high"
        }
      };
    },
    async prepareCall(provider, model, signal) {
      const resolvedModel = await this.resolveModel(provider, model, signal);
      return {
        model: resolvedModel,
        stream: (options) => this.stream(options)
      };
    },
    async *stream(options) {
      const actualModel = loopback.resolveModel(options.model || "auto-free");
      const reqBody = await toOpenAIRequest({ ...options, model: actualModel }, ctx);
      let execution = null;
      let nextBlockIndex = 0;
      let reasoningIdx = null;
      let reasoningBuf = "";
      let textIdx = null;
      let textBuf = "";
      const toolCalls = /* @__PURE__ */ new Map();
      let lastUsage = null;
      let finishReason = "";
      let hasContent = false;
      let totalChars = 0;
      const closeReasoning = async function* () {
        if (reasoningIdx !== null) {
          totalChars += reasoningBuf.length;
          yield {
            type: "block-end",
            index: reasoningIdx,
            block: { type: "reasoning", text: reasoningBuf }
          };
          reasoningIdx = null;
          reasoningBuf = "";
        }
      };
      const closeText = async function* () {
        if (textIdx !== null) {
          totalChars += textBuf.length;
          yield {
            type: "block-end",
            index: textIdx,
            block: { type: "text", text: textBuf }
          };
          textIdx = null;
          textBuf = "";
        }
      };
      const closeTools = async function* () {
        for (const tc of toolCalls.values()) {
          if (!tc.closed) {
            tc.closed = true;
            yield {
              type: "block-end",
              index: tc.blockIdx,
              block: {
                type: "tool-call",
                id: tc.id,
                name: tc.name,
                arguments: tc.args || "{}"
              }
            };
          }
        }
      };
      try {
        if (scheduler && client) {
          execution = await scheduler.executeWithFailover(actualModel, async (account) => {
            return await client.chatStream(account, reqBody, options.signal, {
              conversationId: options.sessionId ? String(options.sessionId) : void 0
            });
          });
        } else {
          const res = await fetch(`${getBaseUrl()}/chat/completions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(reqBody),
            signal: options.signal
          });
          if (!res.ok) {
            throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
          }
          execution = { bodyStream: res.body, release: () => {
          } };
        }
        if (execution.isVideo) {
          const idx = nextBlockIndex++;
          hasContent = true;
          yield { type: "block-start", index: idx, blockType: "text" };
          let fullVideoText = "";
          await execution.executeVideo((chunk) => {
            fullVideoText += chunk;
          });
          yield { type: "text-delta", index: idx, text: fullVideoText };
          yield { type: "block-end", index: idx, block: { type: "text", text: fullVideoText } };
          yield { type: "usage", usage: { inputTokens: 10, outputTokens: 50, totalTokens: 60 } };
          yield { type: "finish", reason: { kind: "stop" } };
          ledger?.record?.(actualModel, 10, 50);
          return;
        }
        const reader = execution.bodyStream.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split(/\r?\n/);
          buffer = lines.pop() || "";
          for (const rawLine of lines) {
            const line = rawLine.trim();
            if (!line || line.startsWith(":")) continue;
            if (!line.startsWith("data:")) continue;
            const dataStr = line.slice(5).trim();
            if (dataStr === "[DONE]") continue;
            let parsed;
            try {
              parsed = JSON.parse(dataStr);
            } catch (_) {
              continue;
            }
            if (parsed.usage) {
              lastUsage = parsed.usage;
            }
            const choice = parsed.choices?.[0];
            if (!choice) continue;
            if (choice.finish_reason) {
              finishReason = choice.finish_reason;
            }
            const delta = choice.delta || {};
            const rDelta = delta.reasoning_content ?? delta.reasoning ?? "";
            if (rDelta) {
              hasContent = true;
              if (reasoningIdx === null) {
                reasoningIdx = nextBlockIndex++;
                yield { type: "block-start", index: reasoningIdx, blockType: "reasoning" };
              }
              reasoningBuf += rDelta;
              yield { type: "reasoning-delta", index: reasoningIdx, text: rDelta };
            }
            if (typeof delta.content === "string" && delta.content.length > 0) {
              yield* closeReasoning();
              hasContent = true;
              if (textIdx === null) {
                textIdx = nextBlockIndex++;
                yield { type: "block-start", index: textIdx, blockType: "text" };
              }
              textBuf += delta.content;
              yield { type: "text-delta", index: textIdx, text: delta.content };
            }
            if (Array.isArray(delta.tool_calls) && delta.tool_calls.length > 0) {
              yield* closeReasoning();
              yield* closeText();
              hasContent = true;
              for (const tcDelta of delta.tool_calls) {
                const sIdx = tcDelta.index ?? 0;
                let tracked = toolCalls.get(sIdx);
                if (!tracked) {
                  tracked = {
                    blockIdx: nextBlockIndex++,
                    id: tcDelta.id || `call_${Date.now()}_${sIdx}`,
                    name: tcDelta.function?.name || "",
                    args: "",
                    closed: false
                  };
                  toolCalls.set(sIdx, tracked);
                  yield { type: "block-start", index: tracked.blockIdx, blockType: "tool-call" };
                } else {
                  if (tcDelta.id) tracked.id = tcDelta.id;
                  if (tcDelta.function?.name) tracked.name = tcDelta.function.name;
                }
                const argDelta = tcDelta.function?.arguments || "";
                if (argDelta) {
                  tracked.args += argDelta;
                }
                yield {
                  type: "tool-call-delta",
                  index: tracked.blockIdx,
                  id: tracked.id,
                  ...tracked.name ? { name: tracked.name } : {},
                  argumentsDelta: argDelta
                };
              }
            }
          }
        }
        yield* closeReasoning();
        yield* closeText();
        yield* closeTools();
        const inTok = lastUsage?.prompt_tokens ?? 20;
        const outTok = lastUsage?.completion_tokens ?? Math.max(1, Math.ceil(totalChars / 4));
        const cachedTok = lastUsage?.prompt_tokens_details?.cached_tokens ?? 0;
        ledger?.record?.(actualModel, inTok, outTok, cachedTok > 0);
        yield {
          type: "usage",
          usage: {
            inputTokens: inTok,
            outputTokens: outTok,
            totalTokens: inTok + outTok,
            ...cachedTok > 0 ? { cacheReadTokens: cachedTok } : {}
          }
        };
        if (options.signal?.aborted) {
          yield { type: "finish", reason: { kind: "aborted" } };
        } else if (finishReason === "tool_calls" || toolCalls.size > 0) {
          yield { type: "finish", reason: { kind: "tool-calls" } };
        } else if (finishReason === "length") {
          yield { type: "finish", reason: { kind: "max-tokens" } };
        } else if (!hasContent) {
          yield {
            type: "finish",
            reason: {
              kind: "error",
              failure: { code: "EMPTY_RESPONSE", message: "Upstream completed with empty response" }
            }
          };
        } else {
          yield { type: "finish", reason: { kind: "stop" } };
        }
      } catch (err) {
        if (options.signal?.aborted) {
          yield { type: "finish", reason: { kind: "aborted", failure: { code: "ABORTED", message: err.message } } };
        } else {
          yield {
            type: "finish",
            reason: {
              kind: "error",
              failure: { code: err.kind || "PI_AI_ERROR", message: err.message || String(err) }
            }
          };
        }
      } finally {
        execution?.release?.();
      }
    }
  };
  return {
    providerName: PROVIDER_NAME,
    aliases: [PROVIDER_ALIAS, PROVIDER_NAME],
    adapter,
    getCatalogModels
  };
}
function registerLlmProvider(ctx, adapterObj) {
  const llm = ctx.llm;
  if (!llm || typeof llm.registerAdapter !== "function") return () => {
  };
  let disposeAdapter = null;
  try {
    const routes = [];
    const existing = llm.adapters;
    if (!existing || !existing.has(PROVIDER_ALIAS)) {
      routes.push(PROVIDER_ALIAS);
    }
    if (!existing || !existing.has(PROVIDER_NAME)) {
      routes.push(PROVIDER_NAME);
    }
    if (routes.length === 0) {
      console.warn("[adapter] workbuddy \u4E0E workbuddy2api \u5747\u5DF2\u88AB\u5360\u7528\uFF0C\u8DF3\u8FC7\u91CD\u590D\u6CE8\u518C");
      return () => {
      };
    }
    disposeAdapter = llm.registerAdapter(routes, adapterObj.adapter);
    console.log(`[adapter] \u2705 \u6210\u529F\u5411 DSH LLM \u6CE8\u518C\u539F\u751F\u514D\u5BC6 Provider: ${routes.join(", ")}`);
  } catch (err) {
    console.warn("[adapter] \u6CE8\u518C DSH LLM \u9002\u914D\u5668\u5F02\u5E38:", err.message);
  }
  return () => {
    try {
      disposeAdapter?.();
    } catch (_) {
    }
  };
}

// src/index.js
var name = "dsh-workbuddy2api";
var inject = ["webServer"];
function apply(ctx, rawConfig) {
  const configStore = new ConfigStore(rawConfig || {});
  const cfg = configStore.getAll();
  ctx.logger?.info?.("\u{1F680} [dsh-workbuddy2api] \u6B63\u5728\u521D\u59CB\u5316 WorkBuddy 2API \u5168\u529F\u80FD\u7F51\u5173\u63D2\u4EF6...");
  const store = new AccountStore({ authDir: cfg.authDir });
  const client = new UpstreamClient({
    proxy: cfg.proxy,
    onTokenRefresh: (acc) => store.upsert(acc)
  });
  const scheduler = new Scheduler(store, {
    client,
    configStore,
    maxInFlightCN: cfg.maxInFlightCN,
    maxInFlightGlobal: cfg.maxInFlightGlobal,
    queueTimeoutMs: cfg.queueTimeoutMs
  });
  const ledger = new UsageLedger();
  const loopback = new LoopbackGateway(scheduler, client, ledger, {
    configStore,
    port: cfg.gatewayPort,
    apiKey: cfg.apiKey,
    aliases: cfg.aliases,
    enabledModels: cfg.enabledModels
  });
  registerWebRoutes(ctx, { scheduler, client, ledger, loopback, configStore });
  loopback.start().then(() => {
    loopback.refreshDiscoveredModels().catch(() => {
    });
  }).catch((err) => {
    ctx.logger?.error?.("[dsh-workbuddy2api] Loopback \u7F51\u5173\u542F\u52A8\u5F02\u5E38:", err);
  });
  const adapterObj = createWorkBuddyAdapter(
    loopback,
    () => configStore.get("enabledModels") || Array.from(loopback.enabledModels),
    { scheduler, client, ledger, ctx }
  );
  let disposeLlm = null;
  if (typeof ctx.inject === "function") {
    ctx.inject(["llm"], (llmCtx) => {
      const d = registerLlmProvider(llmCtx, adapterObj);
      llmCtx.effect?.(() => d, "dsh-workbuddy2api llm lifecycle");
    });
  } else if (ctx.llm) {
    disposeLlm = registerLlmProvider(ctx, adapterObj);
  }
  let startupTimer = null;
  scheduler.startAutoRoutines();
  if (cfg.autoCheckin !== false) {
    startupTimer = setTimeout(async () => {
      const active = store.getActive();
      if (active && !active.disabled) {
        try {
          ctx.logger?.info?.(`[dsh-workbuddy2api] \u542F\u52A8\u81EA\u52A8\u5316\u4F8B\u884C\u4EFB\u52A1\uFF1A\u5F00\u59CB\u6267\u884C\u5F53\u524D\u8D26\u53F7 (${active.account.nickname}) \u798F\u5229\u4E0E\u732B\u732B\u65C5\u884C...`);
          const welfareRes = await claimAllWelfare(active);
          ctx.logger?.info?.(`[dsh-workbuddy2api] \u4F8B\u884C\u798F\u5229\u7ED3\u679C: ${welfareRes.summary}`);
        } catch (e) {
          ctx.logger?.warn?.(`[dsh-workbuddy2api] \u542F\u52A8\u81EA\u52A8\u5316\u4F8B\u884C\u4EFB\u52A1\u8B66\u544A: ${e.message}`);
        }
      }
    }, 3e3);
    if (startupTimer.unref) startupTimer.unref();
  }
  ctx.effect?.(() => {
    return () => {
      if (startupTimer) clearTimeout(startupTimer);
      ctx.logger?.info?.("[dsh-workbuddy2api] \u6B63\u5728\u505C\u6B62\u7F51\u5173\u5E76\u91CA\u653E\u8D44\u6E90...");
      scheduler.stopAutoRoutines();
      loopback.stop();
      if (disposeLlm) disposeLlm();
    };
  }, "dsh-workbuddy2api lifecycle");
  console.log(`[dsh-workbuddy2api] \u2705 \u63D2\u4EF6\u52A0\u8F7D\u5B8C\u6BD5\uFF0C\u5DF2\u5C31\u7EEA\u8D26\u53F7: ${store.getAll().length} \u4E2A`);
}
export {
  AccountStore,
  ConfigStore,
  LoopbackGateway,
  PROVIDER_ALIAS,
  PROVIDER_NAME,
  SETTINGS_NS,
  Scheduler,
  UpstreamClient,
  UsageLedger,
  apply,
  batchImportAccounts,
  bindInviteCode,
  claimAllWelfare,
  claimGlobalTrial,
  claimTravel,
  departTravel,
  drawLottery,
  exportBackupZip,
  fetchGrowthTasks,
  fetchInviteInfo,
  getBuddyInfo,
  getStreak,
  getTravelStatus,
  inject,
  name,
  performCheckin,
  pollOAuthFlow,
  reportActiveChat,
  runAllGrowthTasks,
  runTravelForAccount,
  startOAuthFlow
};

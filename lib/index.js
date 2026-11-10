// src/config.js
var defaultConfig = {
  authDir: "c:\\Work\\workbody\\workbuddy2api\\auths",
  gatewayPort: 7863,
  maxInFlightCN: 3,
  maxInFlightGlobal: 2,
  autoCheckin: true,
  proxy: "",
  enabledModels: [],
  aliases: {}
};
function unwrapConfig(raw) {
  if (!raw || typeof raw !== "object") return { ...defaultConfig };
  return {
    ...defaultConfig,
    ...raw
  };
}

// src/pool/account-store.js
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
var AccountStore = class {
  constructor(options = {}) {
    this.dshHome = options.dshHome || process.env.DSH_HOME || path.join(os.homedir(), ".dsh");
    this.storePath = path.join(this.dshHome, ".workbuddy2api-accounts.json");
    this.authDir = options.authDir || "c:\\Work\\workbody\\workbuddy2api\\auths";
    this.accounts = /* @__PURE__ */ new Map();
    this.activeUid = null;
    this.init();
  }
  init() {
    try {
      if (fs.existsSync(this.storePath)) {
        const raw = JSON.parse(fs.readFileSync(this.storePath, "utf8"));
        if (Array.isArray(raw.accounts)) {
          for (const acc of raw.accounts) {
            if (acc.account?.uid) {
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
    this.importFromAuthDir(this.authDir);
    this.importFromCodeBuddyCli();
    if (!this.activeUid && this.accounts.size > 0) {
      this.activeUid = this.accounts.keys().next().value;
    }
    this.save();
  }
  /**
   * 从 auths 目录导入已有 JSON 账号凭据
   */
  importFromAuthDir(dirPath) {
    if (!dirPath || !fs.existsSync(dirPath)) return;
    try {
      const files = fs.readdirSync(dirPath).filter((f) => f.endsWith(".json"));
      for (const file of files) {
        try {
          const filePath = path.join(dirPath, file);
          const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));
          const uid = raw.account?.uid || raw.uid;
          if (uid && !this.accounts.has(uid)) {
            const acc = {
              account: {
                uid,
                nickname: raw.account?.nickname || raw.nickname || `Account-${uid.slice(0, 8)}`,
                enterpriseId: raw.account?.enterpriseId || raw.enterpriseId || ""
              },
              auth: {
                realm: raw.auth?.realm || raw.realm || "global",
                accessToken: raw.auth?.accessToken || raw.accessToken || "",
                refreshToken: raw.auth?.refreshToken || raw.refreshToken || "",
                expiresAt: raw.auth?.expiresAt || raw.expiresAt || 0,
                domain: raw.auth?.domain || raw.domain || ""
              },
              source: "workbuddy2api-auths",
              updatedAt: Date.now()
            };
            this.accounts.set(uid, acc);
            console.log(`[account-store] \u6210\u529F\u540C\u6B65\u5BFC\u5165\u5DF2\u6709\u8D26\u53F7: ${uid} (${acc.auth.realm})`);
          }
        } catch (_) {
        }
      }
    } catch (err) {
      console.warn("[account-store] \u5BFC\u5165 auths \u76EE\u5F55\u5F02\u5E38:", err.message);
    }
  }
  /**
   * 自动探测本机 CodeBuddy CLI 凭证
   */
  importFromCodeBuddyCli() {
    const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), "AppData", "Local");
    const cliAuthDir = path.join(localAppData, "CodeBuddyExtension", "Data", "Public", "auth");
    if (!fs.existsSync(cliAuthDir)) return;
    try {
      const files = fs.readdirSync(cliAuthDir).filter((f) => f.endsWith(".info"));
      for (const f of files) {
        try {
          const content = fs.readFileSync(path.join(cliAuthDir, f), "utf8");
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
                realm: "cn",
                accessToken: token,
                refreshToken: data.refreshToken || data.refresh_token || "",
                expiresAt: Date.now() + 36e5 * 2,
                domain: data.domain || ""
              },
              source: "codebuddy-cli",
              updatedAt: Date.now()
            });
            console.log(`[account-store] \u81EA\u52A8\u8DDF\u968F CodeBuddy CLI \u767B\u5F55\u8D26\u53F7: ${uid}`);
          }
        } catch (_) {
        }
      }
    } catch (_) {
    }
  }
  save() {
    try {
      if (!fs.existsSync(this.dshHome)) {
        fs.mkdirSync(this.dshHome, { recursive: true });
      }
      const data = {
        activeUid: this.activeUid,
        accounts: Array.from(this.accounts.values())
      };
      fs.writeFileSync(this.storePath, JSON.stringify(data, null, 2), { mode: 384 });
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
  upsert(account) {
    const uid = account.account?.uid;
    if (!uid) throw new Error("Account must have a valid uid");
    account.updatedAt = Date.now();
    this.accounts.set(uid, account);
    if (!this.activeUid) {
      this.activeUid = uid;
    }
    this.save();
    return account;
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
  const path3 = isGlobal ? GLOBAL_TRIAL_PATH : DAILY_CHECKIN_PATH_CN;
  const url = `${base}${path3}`;
  try {
    const res = await fetchFn(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${account.auth.accessToken}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-User-Id": account.account?.uid || "",
        "Origin": base,
        "Referer": `${base}/`,
        "User-Agent": "WorkBuddy/1.2.34"
      },
      body: JSON.stringify({})
    });
    const data = await res.json().catch(() => ({}));
    const msg = data.msg || data.message || "";
    const low = msg.toLowerCase();
    if (res.ok && (data.code === 0 || data.code === 200)) {
      return { ok: true, status: "SUCCESS", message: isGlobal ? "\u8BD5\u7528\u989D\u5EA6\u9886\u53D6\u6210\u529F" : "\u7B7E\u5230\u6210\u529F" };
    }
    if (low.includes("\u5DF2\u7B7E\u5230") || low.includes("already") || data.code === 10001 || data.code === 14001) {
      return { ok: true, status: "ALREADY", message: "\u4ECA\u65E5\u5DF2\u5B8C\u6210\u7B7E\u5230" };
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
var Scheduler = class {
  constructor(accountStore, options = {}) {
    this.store = accountStore;
    this.maxInFlightCN = options.maxInFlightCN || 3;
    this.maxInFlightGlobal = options.maxInFlightGlobal || 2;
    this.circuitBreakers = /* @__PURE__ */ new Map();
    this.inFlight = /* @__PURE__ */ new Map();
    this.autoTimer = null;
  }
  getInFlight(uid) {
    return this.inFlight.get(uid) || 0;
  }
  isCoolingDown(uid) {
    const cb = this.circuitBreakers.get(uid);
    if (!cb) return false;
    if (Date.now() < cb.cooldownUntil) return true;
    return false;
  }
  /**
   * 申请账号槽位租约
   */
  acquire(account) {
    const uid = account.account.uid;
    const current = this.inFlight.get(uid) || 0;
    const limit = account.auth?.realm === "global" ? this.maxInFlightGlobal : this.maxInFlightCN;
    if (current >= limit) {
      return false;
    }
    this.inFlight.set(uid, current + 1);
    return true;
  }
  /**
   * 释放账号槽位租约
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
  }
  /**
   * 记录调用成功，重置熔断器
   */
  recordSuccess(account) {
    const uid = account.account?.uid;
    if (!uid) return;
    this.circuitBreakers.delete(uid);
  }
  /**
   * 记录调用异常，按错误类型进入相应等级的冷却退避
   */
  recordFailure(account, kind, message = "") {
    const uid = account.account?.uid;
    if (!uid) return;
    if (kind === ErrKind.CONTENT_BLOCKED || kind === ErrKind.BAD_PARAMS || kind === ErrKind.PROMPT_TOO_LONG) {
      return;
    }
    let cb = this.circuitBreakers.get(uid) || { failures: 0, cooldownUntil: 0, reason: "" };
    cb.failures += 1;
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
    console.warn(`[scheduler] \u8D26\u53F7 ${uid} \u89E6\u53D1\u7194\u65AD\u4FDD\u62A4 (${kind}), \u51B7\u5374\u65F6\u957F ${Math.round(cooldownMs / 1e3)}s: ${message}`);
  }
  /**
   * 选出当前最佳账号候选序列（支持三因子加权与同域优先）
   */
  pickCandidates(targetRealm = null) {
    const accounts = this.store.getAll();
    if (accounts.length === 0) return [];
    const now = Date.now();
    const scored = accounts.map((acc) => {
      const uid = acc.account.uid;
      const isGlobal = acc.auth?.realm === "global";
      const realm = isGlobal ? "global" : "cn";
      const inFlight = this.inFlight.get(uid) || 0;
      const limit = isGlobal ? this.maxInFlightGlobal : this.maxInFlightCN;
      let penalty = 0;
      const cb = this.circuitBreakers.get(uid);
      if (cb && now < cb.cooldownUntil) {
        penalty += 1e5;
      }
      if (inFlight >= limit) {
        penalty += 5e4;
      }
      penalty += inFlight * 1e3;
      if (targetRealm && targetRealm !== realm) {
        penalty += 2e3;
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
   * 执行带智能自愈与自动轮换的请求执行流
   */
  async executeWithFailover(model, reqFn) {
    const targetRealm = model.startsWith("global:") ? "global" : model.startsWith("cn:") ? "cn" : null;
    const candidates = this.pickCandidates(targetRealm);
    if (candidates.length === 0) {
      throw new Error("\u5F53\u524D\u8D26\u53F7\u6C60\u4E3A\u7A7A\uFF0C\u8BF7\u5728\u8BBE\u7F6E\u4E2D\u6DFB\u52A0\u81F3\u5C11\u4E00\u4E2A WorkBuddy / CodeBuddy \u8D26\u53F7");
    }
    let lastError = null;
    for (const account of candidates) {
      const acquired = this.acquire(account);
      if (!acquired) {
        continue;
      }
      try {
        const result = await reqFn(account);
        if (result && result.ok === false) {
          this.recordFailure(account, result.kind, result.message);
          this.release(account);
          lastError = new Error(result.message);
          lastError.status = result.status;
          lastError.kind = result.kind;
          lastError.nonRetryable = result.kind === ErrKind.CONTENT_BLOCKED || result.kind === ErrKind.BAD_PARAMS || result.kind === ErrKind.PROMPT_TOO_LONG;
          if (lastError.nonRetryable) {
            throw lastError;
          }
          if (result.kind === ErrKind.SOFT_RATE || result.kind === ErrKind.HARD_CREDIT || result.kind === ErrKind.SESSION_DEAD || result.kind === ErrKind.WAF_BLOCK || result.kind === ErrKind.SERVER) {
            console.log(`[scheduler] \u8D26\u53F7 ${account.account.uid} \u9047 ${result.kind}\uFF0C\u81EA\u52A8\u5207\u6362\u81F3\u4E0B\u4E00\u4E2A\u8D26\u53F7...`);
            continue;
          }
          throw lastError;
        }
        this.recordSuccess(account);
        return {
          ...result,
          account,
          release: () => this.release(account)
        };
      } catch (err) {
        if (err.nonRetryable) {
          throw err;
        }
        this.recordFailure(account, ErrKind.CLIENT, err.message);
        this.release(account);
        lastError = err;
        console.warn(`[scheduler] \u8D26\u53F7 ${account.account.uid} \u8C03\u7528\u5F02\u5E38\uFF0C\u5C1D\u8BD5\u5BB9\u707E\u8F6E\u6362:`, err.message);
      }
    }
    throw lastError || new Error("\u6240\u6709\u53EF\u7528\u8D26\u53F7\u5747\u5E76\u53D1\u5360\u6EE1\u6216\u5904\u4E8E\u51B7\u5374\u4FDD\u62A4\u671F\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5");
  }
  /**
   * 对所有国内账号批量巡检猫猫旅行（领养、领奖、派出）
   */
  async runAllTravel() {
    const accounts = this.store.getAll().filter((a) => a.auth?.realm !== "global");
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
    const accounts = this.store.getAll();
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
   * 启动后台自动化排程任务（默认每 2 小时自动巡检一次猫猫旅行与福利）
   */
  startAutoRoutines(intervalMs = 2 * 60 * 60 * 1e3) {
    if (this.autoTimer) return;
    console.log(`[scheduler] \u542F\u52A8\u540E\u53F0\u81EA\u52A8\u5316\u6392\u7A0B\uFF1A\u732B\u732B\u65C5\u884C\u5DE1\u68C0\u4E0E\u798F\u5229\u7BA1\u5BB6 (\u6BCF ${Math.round(intervalMs / 6e4)} \u5206\u949F\u81EA\u52A8\u8FD0\u884C)`);
    this.autoTimer = setInterval(async () => {
      try {
        await this.runAllTravel();
      } catch (e) {
        console.warn("[scheduler] \u81EA\u52A8\u65C5\u884C\u5DE1\u68C0\u5F02\u5E38:", e.message);
      }
    }, intervalMs);
  }
  /**
   * 停止后台自动化排程
   */
  stopAutoRoutines() {
    if (this.autoTimer) {
      clearInterval(this.autoTimer);
      this.autoTimer = null;
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
    const doRequest = async (path3) => {
      const url = `${base}${path3}`;
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
    let packages = [];
    const accounts = raw.Response?.Data?.Accounts || data.Response?.Data?.Accounts || [];
    if (Array.isArray(accounts) && accounts.length > 0) {
      for (const a of accounts) {
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
        if (pRemain > 0 || a.Status !== 3 && pSize > 0) {
          packages.push({
            name: a.PackageName || "\u79EF\u5206\u5305",
            remain: pRemain,
            used: pUsed,
            size: pSize,
            expireTime: a.CycleEndTime || a.ExpiredTime || ""
          });
        }
      }
    } else if (Array.isArray(raw.userPackageList)) {
      for (const p of raw.userPackageList) {
        remain += p.remain || 0;
        packages.push({
          name: p.packageName || p.name || "\u79EF\u5206\u5305",
          remain: p.remain || 0,
          used: p.used || 0,
          expireTime: p.expireTime || p.expiresAt || ""
        });
      }
    } else {
      remain = raw.totalRemain ?? raw.remain ?? raw.points ?? 0;
    }
    return {
      remain,
      packages,
      fetchedAt: Date.now()
    };
  }
  /**
   * 向上游发现真实可用模型
   */
  async fetchModels(account) {
    const base = this.getChatBase(account);
    const models = [];
    const seen = /* @__PURE__ */ new Set();
    try {
      const v3Res = await fetch(`${base}${V3_CONFIG_PATH}`, {
        headers: this.buildHeaders(account, false),
        signal: AbortSignal.timeout(8e3)
      });
      if (v3Res.ok) {
        const v3Data = await v3Res.json().catch(() => ({}));
        const list = v3Data.data?.models || v3Data.models || [];
        for (const item of list) {
          const id = item.id || item.name;
          if (id && !item.disabled && !seen.has(id)) {
            seen.add(id);
            models.push({
              id,
              name: item.displayName || item.name || id,
              contextWindow: item.contextWindow || 2e5,
              maxTokens: item.maxTokens || 32e3,
              supportsImages: Boolean(item.supportsImages || item.multimodal),
              rate: item.rate || "\u6807\u51C6"
            });
          }
        }
      }
    } catch (_) {
    }
    if (models.length === 0) {
      try {
        const cnRes = await fetch(`${base}${CN_MODELS_PATH}`, {
          headers: this.buildHeaders(account, false),
          signal: AbortSignal.timeout(8e3)
        });
        if (cnRes.ok) {
          const cnData = await cnRes.json().catch(() => ({}));
          const list = cnData.data || [];
          for (const item of list) {
            const id = item.id || item.model;
            if (id && !seen.has(id)) {
              seen.add(id);
              models.push({
                id,
                name: item.name || id,
                contextWindow: item.context_length || 2e5,
                maxTokens: 32e3,
                supportsImages: true,
                rate: item.rate || "\u6807\u51C6"
              });
            }
          }
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
      const errText = await res.text().catch(() => "");
      const kind = this.classifyError(res.status, errText);
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
import fs2 from "node:fs";
import path2 from "node:path";
import os2 from "node:os";
var UsageLedger = class {
  constructor(options = {}) {
    this.dshHome = options.dshHome || process.env.DSH_HOME || path2.join(os2.homedir(), ".dsh");
    this.filePath = path2.join(this.dshHome, ".workbuddy2api-usage.json");
    this.data = {
      days: {},
      // 'YYYY-MM-DD' -> { requests, inputTokens, outputTokens, models: {}, hours: {} }
      summary: { totalRequests: 0, totalInputTokens: 0, totalOutputTokens: 0 }
    };
    this.load();
  }
  load() {
    try {
      if (fs2.existsSync(this.filePath)) {
        this.data = JSON.parse(fs2.readFileSync(this.filePath, "utf8"));
      }
    } catch (_) {
    }
  }
  save() {
    try {
      if (!fs2.existsSync(this.dshHome)) {
        fs2.mkdirSync(this.dshHome, { recursive: true });
      }
      const keys = Object.keys(this.data.days).sort();
      if (keys.length > 60) {
        for (const oldKey of keys.slice(0, keys.length - 60)) {
          delete this.data.days[oldKey];
        }
      }
      fs2.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), "utf8");
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
function startSSEHeartbeat(res, intervalMs = SSE_PING_INTERVAL_MS) {
  const timer = setInterval(() => {
    try {
      if (!res.writableEnded) {
        res.write(": ping\n\n");
        if (res.flush) res.flush();
      }
    } catch (_) {
      clearInterval(timer);
    }
  }, intervalMs);
  return () => clearInterval(timer);
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

// src/server/loopback.js
var LoopbackGateway = class {
  constructor(scheduler, client, ledger, options = {}) {
    this.scheduler = scheduler;
    this.client = client;
    this.ledger = ledger;
    this.preferredPort = options.port || DEFAULT_GATEWAY_PORT;
    this.apiKey = options.apiKey || "";
    this.modelAliases = { ...DEFAULT_MODEL_ALIASES, ...options.aliases || {} };
    this.enabledModels = new Set(options.enabledModels || []);
    this.server = null;
    this.actualPort = null;
  }
  resolveModel(requestedModel) {
    let target = this.modelAliases[requestedModel] || requestedModel;
    if (target === "auto-free") {
      target = "global:deepseek-v4.1-flash";
    }
    return target;
  }
  getModelsList() {
    const list = STATIC_MODELS.map((m) => ({
      id: m.id,
      object: "model",
      created: 1726e6,
      owned_by: "workbuddy2api",
      permission: [],
      root: m.id,
      parent: null,
      context_length: m.contextWindow,
      max_tokens: m.maxTokens,
      multimodal: m.supportsImages,
      billing_rate: m.rate,
      badge: m.badge || null
    }));
    for (const [alias, target] of Object.entries(this.modelAliases)) {
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
    this.server = http.createServer((req, res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "*");
      if (req.method === "OPTIONS") {
        res.writeHead(200);
        res.end();
        return;
      }
      const url = new URL(req.url, `http://${req.headers.host || "127.0.0.1"}`);
      const pathname = url.pathname;
      if (pathname === "/health" || pathname === "/" || pathname === "/status") {
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({
          status: "ok",
          service: "dsh-workbuddy2api",
          version: "1.0.0",
          accounts: this.scheduler.store.getAll().length,
          active: this.scheduler.store.activeUid
        }));
        return;
      }
      if (req.method === "GET" && (pathname === "/v1/models" || pathname === "/models")) {
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({
          object: "list",
          data: this.getModelsList()
        }));
        return;
      }
      if (req.method === "POST" && (pathname === "/v1/chat/completions" || pathname === "/chat/completions")) {
        this.handleChatCompletions(req, res);
        return;
      }
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: { message: "Not Found", type: "invalid_request_error" } }));
    });
    return new Promise((resolve) => {
      this.server.listen(this.preferredPort, "0.0.0.0", () => {
        this.actualPort = this.server.address().port;
        console.log(`[loopback] \u{1F680} OpenAI \u517C\u5BB9\u7F51\u5173\u5DF2\u5C31\u7EEA: http://127.0.0.1:${this.actualPort}/v1`);
        resolve(this.actualPort);
      });
      this.server.on("error", (err) => {
        if (err.code === "EADDRINUSE") {
          console.warn(`[loopback] \u7AEF\u53E3 ${this.preferredPort} \u88AB\u5360\u7528\uFF0C\u81EA\u52A8\u968F\u673A\u5206\u914D\u53EF\u7528\u7AEF\u53E3...`);
          this.server.listen(0, "0.0.0.0", () => {
            this.actualPort = this.server.address().port;
            console.log(`[loopback] \u{1F680} \u7F51\u5173\u5DF2\u7ED1\u5B9A\u7A7A\u95F2\u7AEF\u53E3: http://127.0.0.1:${this.actualPort}/v1`);
            resolve(this.actualPort);
          });
        }
      });
    });
  }
  async handleChatCompletions(req, res) {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", async () => {
      let body;
      try {
        body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      } catch (e) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: { message: "Invalid JSON request body" } }));
        return;
      }
      const rawModel = body.model || "auto-free";
      const actualModel = this.resolveModel(rawModel);
      body.model = actualModel;
      const isStream = Boolean(body.stream);
      const reqId = `chatcmpl-${Date.now()}`;
      const meta = {
        conversationId: req.headers["x-conversation-id"] || req.headers["x-session-id"] || body.conversation_id || body.conversationId,
        conversationRequestId: req.headers["x-conversation-request-id"],
        traceId: req.headers["x-trace-id"]
      };
      try {
        const execution = await this.scheduler.executeWithFailover(actualModel, async (account) => {
          return await this.client.chatStream(account, body, void 0, meta);
        });
        if (execution.isVideo) {
          if (isStream) {
            writeSSEHeaders(res);
            await execution.executeVideo((chunk) => {
              res.write(formatOpenAIChunk(reqId, actualModel, chunk));
            });
            res.write(formatOpenAIChunk(reqId, actualModel, "", "stop"));
            res.write("data: [DONE]\n\n");
            res.end();
          } else {
            let fullText = "";
            await execution.executeVideo((chunk) => {
              fullText += chunk;
            });
            res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
            res.end(JSON.stringify({
              id: reqId,
              object: "chat.completion",
              created: Math.floor(Date.now() / 1e3),
              model: actualModel,
              choices: [{ index: 0, message: { role: "assistant", content: fullText }, finish_reason: "stop" }]
            }));
          }
          execution.release();
          this.ledger.record(actualModel, 10, 50);
          return;
        }
        if (isStream) {
          writeSSEHeaders(res);
          const stopHeartbeat = startSSEHeartbeat(res);
          let promptTokens = 0;
          let completionTokens = 0;
          const stream = execution.bodyStream;
          const reader = stream.getReader();
          const decoder = new TextDecoder();
          req.on("close", () => {
            reader.cancel().catch(() => {
            });
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
          const stream = execution.bodyStream;
          const reader = stream.getReader();
          const decoder = new TextDecoder();
          let fullText = "";
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              const chunk = decoder.decode(value, { stream: true });
              const lines = chunk.split("\n");
              for (const line of lines) {
                if (line.startsWith("data:") && !line.includes("[DONE]")) {
                  try {
                    const parsed = JSON.parse(line.slice(5).trim());
                    const delta = parsed.choices?.[0]?.delta?.content || "";
                    fullText += delta;
                  } catch (_) {
                  }
                }
              }
            }
          } finally {
            execution.release();
          }
          res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
          res.end(JSON.stringify({
            id: reqId,
            object: "chat.completion",
            created: Math.floor(Date.now() / 1e3),
            model: actualModel,
            choices: [{ index: 0, message: { role: "assistant", content: fullText }, finish_reason: "stop" }]
          }));
          this.ledger.record(actualModel, 30, fullText.length / 4);
        }
      } catch (err) {
        if (!res.headersSent) {
          const status = err.status && err.status >= 400 && err.status < 600 ? err.status : 500;
          res.writeHead(status, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: { message: err.message, type: "api_error" } }));
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
};

// src/server/web-routes.js
function registerWebRoutes(ctx, deps) {
  const { scheduler, client, ledger, loopback } = deps;
  const store = scheduler.store;
  const balanceCache = /* @__PURE__ */ new Map();
  const BALANCE_TTL = 3e4;
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
      return { remain: 0, packages: [], error: err.message, fetchedAt: Date.now() };
    }
  }
  const invalidateBalance = (uid) => {
    if (uid) balanceCache.delete(uid);
    else balanceCache.clear();
  };
  const routes = [
    // 1. 状态总览接口
    {
      path: "/plugins/dsh-workbuddy2api/status",
      handler: async (req, res) => {
        const u = new URL(req.url, "http://localhost");
        const force = u.searchParams.get("refresh") === "1";
        const all = store.getAll();
        const active = store.getActive();
        const accounts = await Promise.all(all.map(async (a) => {
          const isAct = a.account.uid === store.activeUid;
          const bal = await getAccountBalance(a, force && isAct);
          return {
            uid: a.account.uid,
            nickname: a.account.nickname,
            realm: a.auth.realm,
            inFlight: scheduler.getInFlight(a.account.uid),
            coolingDown: scheduler.isCoolingDown(a.account.uid),
            expiresAt: a.auth.expiresAt,
            updatedAt: a.updatedAt,
            balance: bal
          };
        }));
        let balance = null;
        if (active) {
          balance = await getAccountBalance(active, force);
        }
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
          ok: true,
          activeUid: store.activeUid,
          accounts,
          balance,
          gatewayPort: loopback.actualPort,
          aliases: loopback.modelAliases,
          enabledModels: Array.from(loopback.enabledModels)
        }));
      }
    },
    // 2. 账号切换接口
    {
      path: "/plugins/dsh-workbuddy2api/accounts/switch",
      handler: async (req, res) => {
        const body = await parseJsonBody(req);
        const success = store.setActive(body.uid);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: success, activeUid: store.activeUid }));
      }
    },
    // 3. 粘贴 Token 添加账号接口
    {
      path: "/plugins/dsh-workbuddy2api/accounts/add",
      handler: async (req, res) => {
        try {
          const body = await parseJsonBody(req);
          const rawToken = (body.token || body.refreshToken || "").trim();
          const realm = body.realm || "global";
          const nickname = body.nickname || `Account-${Date.now().toString().slice(-4)}`;
          if (!rawToken) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ ok: false, error: "Token \u6216 Refresh Token \u4E0D\u80FD\u4E3A\u7A7A" }));
            return;
          }
          const candidate = {
            account: {
              uid: body.uid || `user-${Date.now().toString(36)}`,
              nickname,
              enterpriseId: body.enterpriseId || ""
            },
            auth: {
              realm,
              accessToken: body.accessToken || rawToken,
              refreshToken: rawToken,
              expiresAt: Date.now() + 72e5,
              domain: ""
            }
          };
          try {
            await client.refreshToken(candidate);
          } catch (e) {
            await client.fetchBalance(candidate);
          }
          store.upsert(candidate);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: true, account: candidate }));
        } catch (err) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: false, error: `\u8D26\u53F7\u51ED\u8BC1\u9A8C\u8BC1\u5931\u8D25: ${err.message}` }));
        }
      }
    },
    // 4. 删除账号接口
    {
      path: "/plugins/dsh-workbuddy2api/accounts/delete",
      handler: async (req, res) => {
        const body = await parseJsonBody(req);
        const deleted = store.delete(body.uid);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: deleted }));
      }
    },
    // 5. 手动每日签到接口
    {
      path: "/plugins/dsh-workbuddy2api/checkin",
      handler: async (req, res) => {
        const active = store.getActive();
        if (!active) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: false, message: "\u65E0\u53EF\u7528\u8D26\u53F7" }));
          return;
        }
        const result = await performCheckin(active);
        invalidateBalance(active.account.uid);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(result));
      }
    },
    // 6. 用量账本统计接口
    {
      path: "/plugins/dsh-workbuddy2api/usage",
      handler: async (req, res) => {
        const stats = ledger.getStats();
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true, stats }));
      }
    },
    // 7. 模型启用过滤与别名配置
    {
      path: "/plugins/dsh-workbuddy2api/models",
      handler: async (req, res) => {
        if (req.method === "POST") {
          const body = await parseJsonBody(req);
          if (Array.isArray(body.enabledModels)) {
            loopback.enabledModels = new Set(body.enabledModels);
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: true, enabledModels: Array.from(loopback.enabledModels) }));
        } else {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: true, models: STATIC_MODELS }));
        }
      }
    },
    // 8. 猫猫旅行状态查询接口
    {
      path: "/plugins/dsh-workbuddy2api/travel/status",
      handler: async (req, res) => {
        const u = new URL(req.url, "http://localhost");
        const uid = u.searchParams.get("uid") || store.activeUid;
        const target = store.get(uid);
        if (!target) {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: false, message: "\u8D26\u53F7\u672A\u627E\u5230" }));
          return;
        }
        const buddy = await getBuddyInfo(target);
        const travel = await getTravelStatus(target);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true, uid, buddy, travel }));
      }
    },
    // 9. 派出猫猫旅行接口
    {
      path: "/plugins/dsh-workbuddy2api/travel/depart",
      handler: async (req, res) => {
        const body = await parseJsonBody(req);
        const uid = body.uid || store.activeUid;
        const target = store.get(uid);
        if (!target) {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: false, message: "\u8D26\u53F7\u672A\u627E\u5230" }));
          return;
        }
        const result = await departTravel(target, body.locationId || 4);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(result));
      }
    },
    // 10. 领取猫猫旅行到站奖励接口
    {
      path: "/plugins/dsh-workbuddy2api/travel/claim",
      handler: async (req, res) => {
        const body = await parseJsonBody(req);
        const uid = body.uid || store.activeUid;
        const target = store.get(uid);
        if (!target) {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: false, message: "\u8D26\u53F7\u672A\u627E\u5230" }));
          return;
        }
        const result = await claimTravel(target, body.recordId);
        invalidateBalance(target.account.uid);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(result));
      }
    },
    // 11. 批量单趟旅行巡检接口
    {
      path: "/plugins/dsh-workbuddy2api/travel/run-all",
      handler: async (req, res) => {
        const results = await scheduler.runAllTravel();
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true, results }));
      }
    },
    // 12. 连登与成长活动状态查询
    {
      path: "/plugins/dsh-workbuddy2api/growth/status",
      handler: async (req, res) => {
        const u = new URL(req.url, "http://localhost");
        const uid = u.searchParams.get("uid") || store.activeUid;
        const target = store.get(uid);
        if (!target) {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: false, message: "\u8D26\u53F7\u672A\u627E\u5230" }));
          return;
        }
        const streak = await getStreak(target);
        const chances = await getLotteryChances(target);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true, uid, streak, chances }));
      }
    },
    // 13. 一键吃满全套福利 (单个或全部)
    {
      path: "/plugins/dsh-workbuddy2api/growth/claim-all",
      handler: async (req, res) => {
        const body = await parseJsonBody(req);
        if (body.all) {
          const results = await scheduler.runAllWelfare();
          invalidateBalance();
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: true, results }));
          return;
        }
        const uid = body.uid || store.activeUid;
        const target = store.get(uid);
        if (!target) {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: false, message: "\u8D26\u53F7\u672A\u627E\u5230" }));
          return;
        }
        const result = await claimAllWelfare(target);
        invalidateBalance(target.account.uid);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true, uid, result }));
      }
    },
    // 14. 连登抽奖
    {
      path: "/plugins/dsh-workbuddy2api/growth/lottery/draw",
      handler: async (req, res) => {
        const body = await parseJsonBody(req);
        const uid = body.uid || store.activeUid;
        const target = store.get(uid);
        if (!target) {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: false, message: "\u8D26\u53F7\u672A\u627E\u5230" }));
          return;
        }
        const result = await drawLottery(target);
        const chances = await getLotteryChances(target);
        invalidateBalance(target.account.uid);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true, uid, result, remainingChances: chances }));
      }
    },
    // 15. 成长任务清单查询
    {
      path: "/plugins/dsh-workbuddy2api/tasks/list",
      handler: async (req, res) => {
        const u = new URL(req.url, "http://localhost");
        const uid = u.searchParams.get("uid") || store.activeUid;
        const target = store.get(uid);
        if (!target) {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: false, message: "\u8D26\u53F7\u672A\u627E\u5230" }));
          return;
        }
        const tasks = await fetchGrowthTasks(target);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true, uid, tasks }));
      }
    },
    // 16. 成长任务一键自动点亮与收割
    {
      path: "/plugins/dsh-workbuddy2api/tasks/run",
      handler: async (req, res) => {
        const body = await parseJsonBody(req);
        const uid = body.uid || store.activeUid;
        const target = store.get(uid);
        if (!target) {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: false, message: "\u8D26\u53F7\u672A\u627E\u5230" }));
          return;
        }
        const result = await runAllGrowthTasks(target);
        invalidateBalance(target.account.uid);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true, uid, result }));
      }
    },
    // 17. 极速实时余额查询与主动刷新
    {
      path: "/plugins/dsh-workbuddy2api/balance",
      handler: async (req, res) => {
        const u = new URL(req.url, "http://localhost");
        const uid = u.searchParams.get("uid") || store.activeUid;
        const target = store.get(uid);
        if (!target) {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: false, message: "\u8D26\u53F7\u672A\u627E\u5230" }));
          return;
        }
        try {
          const balance = await getAccountBalance(target, true);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: true, uid, balance }));
        } catch (err) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: false, error: err.message }));
        }
      }
    }
  ];
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
async function parseJsonBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch (_) {
        resolve({});
      }
    });
  });
}

// src/adapter/pi-ai-adapter.js
function createWorkBuddyAdapter(loopback, enabledModelsFn) {
  const getBaseUrl = () => `http://127.0.0.1:${loopback.actualPort || 7863}/v1`;
  const getCatalogModels = () => {
    const baseUrl = getBaseUrl();
    const enabled = enabledModelsFn ? enabledModelsFn() : [];
    const isFiltered = Array.isArray(enabled) && enabled.length > 0;
    return STATIC_MODELS.filter((m) => !isFiltered || enabled.includes(m.id)).map((m) => {
      const suffix = m.rate ? ` \xB7 ${m.rate}` : "";
      const badgeSuffix = m.badge ? ` \xB7 ${m.badge}` : "";
      return {
        id: m.id,
        name: `${m.name}${suffix}${badgeSuffix}`,
        provider: PROVIDER_NAME,
        contextWindow: m.contextWindow || 2e5,
        maxTokens: m.maxTokens || 32e3,
        input: m.supportsImages ? ["text", "image"] : ["text"],
        baseUrl,
        api: "openai-completions"
      };
    });
  };
  const adapter = {
    async listModels() {
      return getCatalogModels();
    },
    async resolveModel(modelId) {
      const models = getCatalogModels();
      const found = models.find((m) => m.id === modelId);
      if (found) return found;
      return {
        id: modelId,
        name: modelId,
        provider: PROVIDER_NAME,
        contextWindow: 2e5,
        maxTokens: 32e3,
        input: ["text", "image"],
        baseUrl: getBaseUrl(),
        api: "openai-completions"
      };
    },
    async chat(request, options = {}) {
      const res = await fetch(`${getBaseUrl()}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${loopback.apiKey || "sk-wb2a-internal"}`
        },
        body: JSON.stringify(request),
        signal: options.signal
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Request failed with ${res.status}`);
      }
      return res;
    }
  };
  return {
    providerName: PROVIDER_NAME,
    aliases: [PROVIDER_NAME, PROVIDER_ALIAS],
    adapter,
    getCatalogModels
  };
}
function registerLlmProvider(ctx, adapterObj) {
  if (!ctx.llm) return () => {
  };
  let disposeAdapter = null;
  let disposeProviders = null;
  try {
    if (typeof ctx.llm.registerAdapter === "function") {
      disposeAdapter = ctx.llm.registerAdapter(adapterObj.aliases, adapterObj.adapter);
    }
    if (typeof ctx.llm.registerConfigurableProviders === "function") {
      disposeProviders = ctx.llm.registerConfigurableProviders([
        {
          provider: PROVIDER_NAME,
          displayName: "WorkBuddy 2API",
          settingsNs: SETTINGS_NS,
          settingsPath: [],
          declared: false
        }
      ]);
    }
    console.log(`[adapter] \u6210\u529F\u5411 DSH LLM \u6CE8\u518C Provider: ${PROVIDER_NAME} & ${PROVIDER_ALIAS}`);
  } catch (err) {
    console.warn("[adapter] \u6CE8\u518C DSH LLM \u9002\u914D\u5668\u5F02\u5E38 (\u964D\u7EA7\u8FD0\u884C):", err.message);
  }
  return () => {
    if (disposeAdapter) disposeAdapter();
    if (disposeProviders) disposeProviders();
  };
}

// src/index.js
var name = "dsh-workbuddy2api";
function apply(ctx, rawConfig) {
  const config = unwrapConfig(rawConfig);
  ctx.logger?.info?.("\u{1F680} [dsh-workbuddy2api] \u6B63\u5728\u521D\u59CB\u5316 WorkBuddy 2API \u7F51\u5173\u63D2\u4EF6...");
  const store = new AccountStore({ authDir: config.authDir });
  const client = new UpstreamClient({
    proxy: config.proxy,
    onTokenRefresh: (acc) => store.upsert(acc)
  });
  const scheduler = new Scheduler(store, {
    maxInFlightCN: config.maxInFlightCN,
    maxInFlightGlobal: config.maxInFlightGlobal
  });
  const ledger = new UsageLedger();
  const loopback = new LoopbackGateway(scheduler, client, ledger, {
    port: config.gatewayPort,
    aliases: config.aliases,
    enabledModels: config.enabledModels
  });
  loopback.start().catch((err) => {
    ctx.logger?.error?.("[dsh-workbuddy2api] Loopback \u7F51\u5173\u542F\u52A8\u5F02\u5E38:", err);
  });
  registerWebRoutes(ctx, { scheduler, client, ledger, loopback });
  const adapterObj = createWorkBuddyAdapter(loopback, () => Array.from(loopback.enabledModels));
  const disposeLlm = registerLlmProvider(ctx, adapterObj);
  if (config.autoCheckin !== false) {
    scheduler.startAutoRoutines();
    setTimeout(async () => {
      const active = store.getActive();
      if (active) {
        try {
          ctx.logger?.info?.(`[dsh-workbuddy2api] \u542F\u52A8\u81EA\u52A8\u5316\u4F8B\u884C\u4EFB\u52A1\uFF1A\u5F00\u59CB\u6267\u884C\u5F53\u524D\u8D26\u53F7 (${active.account.nickname}) \u798F\u5229\u4E0E\u732B\u732B\u65C5\u884C...`);
          const welfareRes = await claimAllWelfare(active);
          ctx.logger?.info?.(`[dsh-workbuddy2api] \u4F8B\u884C\u798F\u5229\u7ED3\u679C: ${welfareRes.summary}`);
        } catch (e) {
          ctx.logger?.warn?.(`[dsh-workbuddy2api] \u542F\u52A8\u81EA\u52A8\u5316\u4F8B\u884C\u4EFB\u52A1\u8B66\u544A: ${e.message}`);
        }
      }
    }, 3e3);
  }
  ctx.effect?.(() => {
    return () => {
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
  LoopbackGateway,
  PROVIDER_ALIAS,
  PROVIDER_NAME,
  SETTINGS_NS,
  Scheduler,
  UpstreamClient,
  UsageLedger,
  apply,
  claimAllWelfare,
  claimTravel,
  departTravel,
  drawLottery,
  fetchGrowthTasks,
  getBuddyInfo,
  getStreak,
  getTravelStatus,
  name,
  performCheckin,
  reportActiveChat,
  runAllGrowthTasks,
  runTravelForAccount
};

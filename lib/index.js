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
var ENTERPRISE_MODELS_PATH = "/v2/enterprises/personal/models";
var ENTERPRISE_MODELS_FALLBACK_PATH = "/console/enterprises/personal/models";
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
var SERVICE_VERSION = "1.3.0";
var GITHUB_REPO = "XCool-603/dsh-workbuddy2api";
var DEFAULT_GATEWAY_PORT = 7863;
var DEFAULT_STREAM_IDLE_TIMEOUT_MS = 9e4;
var SSE_PING_INTERVAL_MS = 3e3;
var ErrKind = {
  NONE: "none",
  HARD_CREDIT: "hard_credit",
  SOFT_RATE: "soft_rate",
  SESSION_DEAD: "session_dead",
  NOT_FOUND: "not_found",
  MODEL_BLOCKED: "model_blocked",
  IMAGE_INVALID: "image_invalid",
  SERVER: "server",
  CONTENT_BLOCKED: "content_blocked",
  BAD_PARAMS: "bad_params",
  ACCOUNT_FAULT: "account_fault",
  PROMPT_TOO_LONG: "prompt_too_long",
  WAF_BLOCK: "waf_block",
  CLIENT: "client"
};
function parseCreditMultiplier(rawCredits, tags = []) {
  const s = String(rawCredits || "").replace(/credits?/gi, "").trim();
  const numMatch = s.match(/x?\s*([0-9]+(?:\.[0-9]+)?)/i);
  const multiplier = numMatch ? Number(numMatch[1]) : null;
  const tagList = Array.isArray(tags) ? tags : [];
  let badge = "";
  for (const tag of tagList) {
    if (typeof tag === "string" && tag.startsWith("badge:")) {
      const parts = tag.split(":");
      if (parts[1]) {
        badge = parts[1];
        break;
      }
    }
  }
  const isFree = multiplier === 0 || badge.includes("\u514D\u8D39") || /free\s*now/i.test(badge);
  const rate = multiplier !== null ? `x${multiplier.toFixed(2)}` : s || "-";
  return {
    credits: s || "",
    rate,
    multiplier,
    isFree,
    badge
  };
}
var CN_EFFORT_FALLBACK = {
  "hy4free": { efforts: ["high"], defaultEffort: "high" },
  "hy4std": { efforts: ["high"], defaultEffort: "high" },
  "hy4-preview-x": { efforts: ["high"], defaultEffort: "high" },
  "hy3": { efforts: ["high"], defaultEffort: "high" },
  "hy3-x": { efforts: ["low", "high"], defaultEffort: "high" },
  "glm-5.3": { efforts: ["low", "high", "max"], defaultEffort: "high" },
  "glm-5.3-flash": { efforts: ["low", "high", "max"], defaultEffort: "high" },
  "glm-5.2": { efforts: ["medium", "high"], defaultEffort: "medium" },
  "glm-4.6v": { efforts: ["medium"], defaultEffort: "medium" },
  "minimax-m2.5": { efforts: ["medium"], defaultEffort: "medium" },
  "minimax-m3.1-flash": { efforts: ["low", "medium", "high", "xhigh", "max"], defaultEffort: "high" },
  "kimi-k3-1": { efforts: ["medium"], defaultEffort: "medium" },
  "kimi-k3.1-pro": { efforts: ["low", "high", "max"], defaultEffort: "high" },
  "kimi-k2.8-preview": { efforts: ["low", "high", "max"], defaultEffort: "high" },
  "kimi-k2.5": { efforts: ["medium"], defaultEffort: "medium" },
  "kimi-k2-thinking": { efforts: ["medium"], defaultEffort: "medium" },
  "deepseek-v4-flash": { efforts: ["high"], defaultEffort: "high" },
  "deepseek-v4.1-flash": { efforts: ["low", "high", "max"], defaultEffort: "high" },
  "deepseek-v4-pro": { efforts: ["high"], defaultEffort: "high" },
  "deepseek-v3-2-volc": { efforts: ["medium"], defaultEffort: "medium" },
  "hunyuan-2.0-thinking": { efforts: ["medium"], defaultEffort: "medium" },
  "space-bunny": { efforts: ["low", "medium", "high", "xhigh", "max"], defaultEffort: "high" },
  "step-5-preview": { efforts: ["low", "medium", "high"], defaultEffort: "high" },
  "mimo-v2.6-pro": { efforts: ["high"], defaultEffort: "high" }
};
var GLOBAL_EFFORT_FALLBACK = {
  "max-model": { efforts: ["high"], defaultEffort: "high" },
  "hy4free": { efforts: ["high"], defaultEffort: "high" },
  "hy4std": { efforts: ["high"], defaultEffort: "high" },
  "hy3": { efforts: ["low", "high"], defaultEffort: "high" },
  "deepseek-v4.1-flash-sg": { efforts: ["low", "high", "max"], defaultEffort: "high" },
  "deepseek-v4.1-flash": { efforts: ["high"], defaultEffort: "high" },
  "gpt-6-astra": { efforts: ["low", "medium", "high", "xhigh", "max"], defaultEffort: "high" },
  "gpt-6.1-sol": { efforts: ["low", "medium", "high", "xhigh"], defaultEffort: "high" },
  "gpt-6-sol": { efforts: ["low", "medium", "high", "xhigh"], defaultEffort: "high" },
  "gpt-6-luna": { efforts: ["low", "medium", "high", "xhigh"], defaultEffort: "high" },
  "gpt-5.6-sol": { efforts: ["low", "medium", "high", "xhigh", "max"], defaultEffort: "high" },
  "gpt-5.6-terra": { efforts: ["low", "medium", "high", "xhigh", "max"], defaultEffort: "high" },
  "gpt-5.6-luna": { efforts: ["low", "medium", "high", "xhigh", "max"], defaultEffort: "high" },
  "grok-4.7": { efforts: ["low", "medium", "high", "xhigh"], defaultEffort: "high" },
  "gemini-3.8-flash": { efforts: ["low", "medium", "high"], defaultEffort: "high" },
  "glm-5.3": { efforts: ["low", "high", "max"], defaultEffort: "high" },
  "glm-5.3-flash": { efforts: ["low", "high", "max"], defaultEffort: "high" },
  "kimi-k3.1-pro": { efforts: ["low", "high", "max"], defaultEffort: "high" },
  "kimi-k3.1-pro-highspeed": { efforts: ["low", "high", "max"], defaultEffort: "high" },
  "kimi-k3": { efforts: ["medium"], defaultEffort: "medium" },
  "minimax-m3.1-flash": { efforts: ["low", "medium", "high", "xhigh", "max"], defaultEffort: "high" }
};
function mEntry(opts) {
  const parsed = parseCreditMultiplier(opts.credits, opts.tags);
  return {
    id: opts.id,
    bareId: opts.id.replace(/^(cn|global):/i, ""),
    name: opts.name,
    description: opts.description || "",
    realm: opts.realm,
    contextWindow: opts.contextWindow || 2e5,
    maxTokens: opts.maxTokens || 32e3,
    supportsImages: Boolean(opts.supportsImages),
    supportsReasoning: Boolean(opts.supportsReasoning),
    supportsToolCall: Boolean(opts.supportsToolCall ?? true),
    supportedEfforts: opts.supportedEfforts || [],
    defaultEffort: opts.defaultEffort || "",
    credits: parsed.credits,
    rate: opts.rate || parsed.rate,
    multiplier: opts.multiplier ?? parsed.multiplier,
    isFree: opts.isFree ?? parsed.isFree,
    badge: opts.badge || parsed.badge || "",
    tags: opts.tags || [],
    vendor: opts.vendor || ""
  };
}
var STATIC_MODELS = [
  mEntry({
    id: "auto-free",
    name: "Auto Free (\u667A\u80FD\u514D\u8D39\u6A21\u578B\u8DEF\u7531)",
    description: "\u4F18\u5148\u8DEF\u7531\u5F53\u524D\u53EF\u7528 x0.00 \u514D\u8D39\u65D7\u8230\u4E0E\u8D85\u4F4E\u500D\u7387\u6A21\u578B",
    realm: "auto",
    contextWindow: 96e4,
    maxTokens: 64e3,
    supportsImages: true,
    supportsReasoning: true,
    credits: "x0.00",
    isFree: true,
    badge: "\u667A\u80FD\u514D\u8D39"
  }),
  // Global 国际版真实倍率目录
  mEntry({ id: "global:hy4free", name: "Hy4 Free (Global)", description: "\u6700\u65B0\u65D7\u8230\u6A21\u578B\uFF0CAgent\u4E0E\u591A\u6A21\u4E13\u957F", realm: "global", contextWindow: 96e4, maxTokens: 64e3, supportsImages: true, supportsReasoning: true, supportedEfforts: ["high"], credits: "x0.00", badge: "\u514D\u8D39" }),
  mEntry({ id: "global:hy3", name: "Hy3 (Global)", description: "\u6DF7\u5143\u601D\u8003\u6A21\u578B\uFF0C\u589E\u5F3A\u63A8\u7406\u80FD\u529B", realm: "global", contextWindow: 2e5, maxTokens: 32e3, supportsReasoning: true, supportedEfforts: ["low", "high"], credits: "x0.00", badge: "Free now" }),
  mEntry({ id: "global:gpt-6-luna", name: "GPT-6-Luna (Global)", description: "\u9AD8\u541E\u5410\u9AD8\u6027\u4EF7\u6BD4\u8F7B\u91CF\u4EFB\u52A1\u6A21\u578B", realm: "global", contextWindow: 272e3, maxTokens: 72e3, supportsImages: true, supportsReasoning: true, supportedEfforts: ["low", "medium", "high", "xhigh"], credits: "x0.07" }),
  mEntry({ id: "global:glm-5.3-flash", name: "GLM-5.3-Flash (Global)", description: "\u539F\u751F\u591A\u6A21\u6001\u89C6\u89C9\u4E0E\u6781\u901F\u7F16\u7A0B\u6A21\u578B", realm: "global", contextWindow: 1e6, maxTokens: 32e3, supportsImages: true, supportsReasoning: true, supportedEfforts: ["low", "high", "max"], credits: "x0.08" }),
  mEntry({ id: "global:minimax-m3.1-flash", name: "MiniMax-M3.1-Flash (Global)", description: "\u539F\u751F\u591A\u6A21\u6001 Agent \u4E0E\u6781\u901F\u63A8\u7406", realm: "global", contextWindow: 2e5, maxTokens: 32e3, supportsImages: true, supportsReasoning: true, supportedEfforts: ["low", "medium", "high", "xhigh", "max"], credits: "x0.08" }),
  mEntry({ id: "global:deepseek-v4.1-flash-sg", name: "DeepSeek-V4.1-Flash (Global)", description: "DeepSeek \u65D7\u8230\u6A21\u578B\uFF0C1M \u4E0A\u4E0B\u6587\u7A97\u53E3\uFF0C\u539F\u751F\u591A\u6A21\u6001", realm: "global", contextWindow: 1e6, maxTokens: 128e3, supportsImages: true, supportsReasoning: true, supportedEfforts: ["low", "high", "max"], credits: "x0.11" }),
  mEntry({ id: "global:gpt-5.6-luna", name: "GPT-5.6-Luna (Global)", description: "OpenAI \u8F7B\u91CF\u6A21\u578B\uFF0C\u54CD\u5E94\u5FEB\u901F", realm: "global", contextWindow: 272e3, maxTokens: 64e3, supportsImages: true, supportsReasoning: true, supportedEfforts: ["low", "medium", "high", "xhigh", "max"], credits: "x0.14" }),
  mEntry({ id: "global:default-model", name: "Auto (Global)", description: "\u5FEB\u901F\u54CD\u5E94\uFF0C\u9002\u5408\u65E5\u5E38\u95EE\u7B54\u548C\u7B80\u5355\u4EFB\u52A1", realm: "global", contextWindow: 176e3, maxTokens: 24e3, supportsImages: true, credits: "x0.15" }),
  mEntry({ id: "global:hy4std", name: "Hy4 Standard (Global)", description: "\u6DF7\u5143\u65D7\u8230\u6807\u51C6\u7248", realm: "global", contextWindow: 96e4, maxTokens: 64e3, supportsImages: true, supportsReasoning: true, supportedEfforts: ["high"], credits: "x0.29" }),
  mEntry({ id: "global:glm-5.3", name: "GLM-5.3 (Global)", description: "\u80FD\u529B\u5747\u8861\uFF0C\u9002\u5408\u957F\u7A0B\u5DE5\u7A0B\u4EFB\u52A1", realm: "global", contextWindow: 1e6, maxTokens: 32e3, supportsImages: true, supportsReasoning: true, supportedEfforts: ["low", "high", "max"], credits: "x0.69" }),
  mEntry({ id: "global:gemini-3.8-flash", name: "Gemini-3.8-Flash (Global)", description: "\u80FD\u529B\u5747\u8861\uFF0C\u591A\u6A21\u6001\u9AD8\u6548\u63A8\u7406", realm: "global", contextWindow: 1e6, maxTokens: 65536, supportsImages: true, supportsReasoning: true, supportedEfforts: ["low", "medium", "high"], credits: "x0.95" }),
  mEntry({ id: "global:kimi-k3.1-pro", name: "Kimi-K3.1-Pro (Global)", description: "3\u4E07\u4EBF\u7EA7\u53C2\u6570\u5168\u80FD\u6A21\u578B", realm: "global", contextWindow: 256e3, maxTokens: 32e3, supportsImages: true, supportsReasoning: true, supportedEfforts: ["low", "high", "max"], credits: "x0.97" }),
  mEntry({ id: "global:gpt-6.1-sol", name: "GPT-6.1-Sol (Global)", description: "\u4E13\u4E3A\u590D\u6742\u7F16\u7801\u4E0E\u667A\u80FD\u4F53\u5DE5\u4F5C\u6D41\u6784\u5EFA", realm: "global", contextWindow: 272e3, maxTokens: 72e3, supportsImages: true, supportsReasoning: true, supportedEfforts: ["low", "medium", "high", "xhigh"], credits: "x1.33", badge: "\u7F16\u7801\u4E3B\u529B" }),
  mEntry({ id: "global:gpt-6-sol", name: "GPT-6-Sol (Global)", description: "\u590D\u6742\u7F16\u7801\u4E0E\u957F\u7A0B Agent \u65D7\u8230", realm: "global", contextWindow: 272e3, maxTokens: 72e3, supportsImages: true, supportsReasoning: true, supportedEfforts: ["low", "medium", "high", "xhigh"], credits: "x1.33" }),
  mEntry({ id: "global:max-model", name: "Max (Global)", description: "\u66F4\u5F3A\u7684\u6DF1\u5EA6\u63A8\u7406\u80FD\u529B", realm: "global", contextWindow: 272e3, maxTokens: 72e3, supportsImages: true, supportsReasoning: true, credits: "x1.33" }),
  mEntry({ id: "global:gpt-5.6-terra", name: "GPT-5.6-Terra (Global)", description: "OpenAI \u5747\u8861\u4E3B\u529B\u6A21\u578B", realm: "global", contextWindow: 272e3, maxTokens: 64e3, supportsImages: true, supportsReasoning: true, supportedEfforts: ["low", "medium", "high", "xhigh", "max"], credits: "x1.39" }),
  mEntry({ id: "global:kimi-k3.1-pro-highspeed", name: "Kimi-K3.1-Pro-Highspeed (Global)", description: "2-3x \u6781\u901F\u8F93\u51FA\u65D7\u8230", realm: "global", contextWindow: 256e3, maxTokens: 32e3, supportsImages: true, supportsReasoning: true, supportedEfforts: ["low", "high", "max"], credits: "x1.56" }),
  mEntry({ id: "global:kimi-k3", name: "Kimi-K3 (Global)", description: "\u590D\u6742\u957F\u7A0B\u4E0E\u524D\u7AEF\u5F00\u53D1\u4E13\u957F", realm: "global", contextWindow: 2e5, maxTokens: 32e3, supportsReasoning: true, credits: "x1.62" }),
  mEntry({ id: "global:grok-4.7", name: "Grok-4.7 (Global)", description: "SpaceXAI \u524D\u6CBF\u7F16\u7A0B\u4E0E\u79D1\u7814\u5DE5\u4F5C\u6A21\u578B", realm: "global", contextWindow: 256e3, maxTokens: 64e3, supportsImages: true, supportsReasoning: true, supportedEfforts: ["low", "medium", "high", "xhigh"], credits: "x1.90" }),
  mEntry({ id: "global:gpt-5.6-sol", name: "GPT-5.6-Sol (Global)", description: "OpenAI \u6DF1\u5EA6\u957F\u7A0B\u63A8\u7406", realm: "global", contextWindow: 272e3, maxTokens: 72e3, supportsImages: true, supportsReasoning: true, supportedEfforts: ["low", "medium", "high", "xhigh", "max"], credits: "x3.47" }),
  mEntry({ id: "global:gpt-6-astra", name: "GPT-6-Astra (Global)", description: "OpenAI \u9876\u7EA7\u590D\u6742\u63A8\u7406\u65D7\u8230", realm: "global", contextWindow: 272e3, maxTokens: 72e3, supportsImages: true, supportsReasoning: true, supportedEfforts: ["low", "medium", "high", "xhigh", "max"], credits: "x6.67", badge: "\u6700\u9AD8\u500D\u7387" }),
  // CN 国内版真实倍率目录
  mEntry({ id: "cn:hy4free", name: "Hy4 \u9650\u65F6\u514D\u8D39 (CN)", description: "\u6700\u65B0\u65D7\u8230\u6A21\u578B\uFF0CAgent\u4E0E\u591A\u6A21\u4E13\u957F", realm: "cn", contextWindow: 96e4, maxTokens: 64e3, supportsImages: true, supportsReasoning: true, supportedEfforts: ["high"], credits: "x0.00", badge: "\u9650\u65F6\u514D\u8D39" }),
  mEntry({ id: "cn:hy3", name: "Hy3 \u9650\u65F6\u514D\u8D39 (CN)", description: "\u6DF7\u5143\u601D\u8003\u6A21\u578B\uFF0C\u589E\u5F3A\u63A8\u7406\u80FD\u529B", realm: "cn", contextWindow: 2e5, maxTokens: 32e3, supportsReasoning: true, credits: "x0.00", badge: "\u9650\u65F6\u514D\u8D39" }),
  mEntry({ id: "cn:hunyuan-2.0-thinking", name: "Hunyuan-2.0-Thinking (CN)", description: "\u6DF7\u5143 2.0 \u601D\u8003\u8F7B\u91CF\u6A21\u578B", realm: "cn", contextWindow: 128e3, maxTokens: 16e3, supportsReasoning: true, credits: "x0.04" }),
  mEntry({ id: "cn:hy3-x", name: "Hy3-X (CN)", description: "\u6DF7\u5143\u601D\u8003\u589E\u5F3A\u7248", realm: "cn", contextWindow: 2e5, maxTokens: 32e3, supportsReasoning: true, supportedEfforts: ["low", "high"], credits: "x0.05" }),
  mEntry({ id: "cn:glm-5.3-flash", name: "GLM-5.3-Flash (CN)", description: "\u539F\u751F\u591A\u6A21\u6001\u89C6\u89C9\u6A21\u578B", realm: "cn", contextWindow: 1e6, maxTokens: 32e3, supportsImages: true, supportsReasoning: true, supportedEfforts: ["low", "high", "max"], credits: "x0.08" }),
  mEntry({ id: "cn:minimax-m3.1-flash", name: "MiniMax-M3.1-Flash (CN)", description: "\u6781\u901F\u7F16\u7A0B\u4E0E\u529E\u516C\u591A\u6A21\u6001", realm: "cn", contextWindow: 2e5, maxTokens: 32e3, supportsImages: true, supportsReasoning: true, supportedEfforts: ["low", "medium", "high", "xhigh", "max"], credits: "x0.08" }),
  mEntry({ id: "cn:space-bunny", name: "Space-Bunny (CN)", description: "\u6781\u5FEB\u7F16\u7801\u533F\u540D\u5927\u6A21\u578B\uFF0C\u652F\u6301\u591A\u6A21\u6001", realm: "cn", contextWindow: 2e5, maxTokens: 32e3, supportsImages: true, supportsReasoning: true, supportedEfforts: ["low", "medium", "high", "xhigh", "max"], credits: "x0.08" }),
  mEntry({ id: "cn:deepseek-v4.1-flash", name: "DeepSeek-V4.1-Flash (CN)", description: "V4.1-Flash \u6700\u65B0\u7248\uFF0C1M \u4E0A\u4E0B\u6587\uFF0C\u539F\u751F\u591A\u6A21\u6001", realm: "cn", contextWindow: 1e6, maxTokens: 128e3, supportsImages: true, supportsReasoning: true, supportedEfforts: ["low", "high", "max"], credits: "x0.11" }),
  mEntry({ id: "cn:glm-4.6v", name: "GLM-4.6V (CN)", description: "\u89C6\u89C9\u591A\u6A21\u6001\u6A21\u578B", realm: "cn", contextWindow: 128e3, maxTokens: 16e3, supportsImages: true, credits: "x0.11" }),
  mEntry({ id: "cn:mimo-v2.6-pro", name: "MiMo-V2.6-Pro (CN)", description: "Xiaomi \u65D7\u8230\u63A8\u7406\u6A21\u578B", realm: "cn", contextWindow: 256e3, maxTokens: 32e3, supportsReasoning: true, credits: "x0.13" }),
  mEntry({ id: "cn:fast-model", name: "\u5FEB\u901F Fast (CN)", description: "\u4F18\u5148\u54CD\u5E94\u901F\u5EA6\uFF0C\u9002\u5408\u7B80\u5355\u95EE\u7B54", realm: "cn", contextWindow: 2e5, maxTokens: 32e3, credits: "x0.15" }),
  mEntry({ id: "cn:deepseek-v4-flash", name: "DeepSeek-V4-Flash (CN)", description: "1M \u4E0A\u4E0B\u6587\u65D7\u8230\u5FEB\u901F\u7248", realm: "cn", contextWindow: 1e6, maxTokens: 64e3, supportsImages: true, supportsReasoning: true, credits: "x0.17" }),
  mEntry({ id: "cn:minimax-m2.5", name: "MiniMax-M2.5 (CN)", description: "\u7ECF\u5178\u5747\u8861\u5BF9\u8BDD\u6A21\u578B", realm: "cn", contextWindow: 2e5, maxTokens: 32e3, credits: "x0.18" }),
  mEntry({ id: "cn:glm-4.7", name: "GLM-4.7 (CN)", description: "\u667A\u8C31\u8F7B\u91CF\u4EE3\u7801\u6A21\u578B", realm: "cn", contextWindow: 128e3, maxTokens: 16e3, credits: "x0.23" }),
  mEntry({ id: "cn:hy4std", name: "Hy4 Standard (CN)", description: "\u6DF7\u5143\u65D7\u8230\u6807\u51C6\u7248", realm: "cn", contextWindow: 96e4, maxTokens: 64e3, supportsImages: true, supportsReasoning: true, credits: "x0.29" }),
  mEntry({ id: "cn:step-5-preview", name: "Step-5-Preview (CN)", description: "\u9636\u8DC3 StepFun \u65D7\u8230\u57FA\u6A21", realm: "cn", contextWindow: 256e3, maxTokens: 32e3, supportsReasoning: true, supportedEfforts: ["low", "medium", "high"], credits: "x0.33" }),
  mEntry({ id: "cn:kimi-k2.5", name: "Kimi-K2.5 (CN)", description: "\u957F\u6587\u672C\u901A\u7528\u6A21\u578B", realm: "cn", contextWindow: 2e5, maxTokens: 32e3, credits: "x0.45" }),
  mEntry({ id: "cn:balanced-model", name: "\u5747\u8861 Balanced (CN)", description: "\u517C\u987E\u901F\u5EA6\u4E0E\u8D28\u91CF", realm: "cn", contextWindow: 256e3, maxTokens: 32e3, credits: "x0.50" }),
  mEntry({ id: "cn:deepseek-v4-pro", name: "DeepSeek-V4-Pro (CN)", description: "DeepSeek \u6DF1\u5EA6\u79D1\u7814/\u4EE3\u7801\u65D7\u8230", realm: "cn", contextWindow: 1e6, maxTokens: 64e3, supportsImages: true, supportsReasoning: true, credits: "x0.51" }),
  mEntry({ id: "cn:glm-5.3", name: "GLM-5.3 (CN)", description: "\u590D\u6742\u8F6F\u4EF6\u5DE5\u7A0B\u4E0E\u957F\u7A0B Agent \u65D7\u8230", realm: "cn", contextWindow: 1e6, maxTokens: 32e3, supportsImages: true, supportsReasoning: true, supportedEfforts: ["low", "high", "max"], credits: "x0.69" }),
  mEntry({ id: "cn:glm-5.2", name: "GLM-5.2 (CN)", description: "1M \u4E0A\u4E0B\u6587\uFF0C\u591C\u95F4\u6298\u6263\u6A21\u578B", realm: "cn", contextWindow: 1e6, maxTokens: 32e3, supportsImages: true, supportsReasoning: true, credits: "x0.79", badge: "\u591C\u95F4\u6298\u6263" }),
  mEntry({ id: "cn:kimi-k3.1-pro", name: "Kimi-K3.1-Pro (CN)", description: "Kimi 3\u4E07\u4EBF\u53C2\u6570\u5168\u80FD\u5347\u7EA7\u7248", realm: "cn", contextWindow: 256e3, maxTokens: 32e3, supportsReasoning: true, supportedEfforts: ["low", "high", "max"], credits: "x0.97" }),
  mEntry({ id: "cn:kimi-k3-1", name: "Kimi-K3-1 (CN)", description: "\u590D\u6742\u957F\u7A0B\u4E0E\u524D\u7AEF\u5F00\u53D1\u4E13\u957F", realm: "cn", contextWindow: 2e5, maxTokens: 32e3, supportsReasoning: true, credits: "x1.62" }),
  // 视频大模型
  mEntry({ id: "kling-video-v3", name: "Kling 3.0 \u53EF\u7075\u89C6\u9891\u76F4\u51FA", description: "\u6587\u751F\u89C6\u9891 / \u56FE\u751F\u89C6\u9891\u5927\u6A21\u578B", realm: "video", contextWindow: 8192, maxTokens: 2048, supportsImages: true, rate: "\u89C6\u9891", badge: "\u53EF\u70753.0" }),
  mEntry({ id: "minimax-video-h3", name: "MiniMax-H3 \u6D77\u87BA\u89C6\u9891\u76F4\u51FA", description: "\u6D77\u87BA\u9AD8\u6E05\u89C6\u9891\u751F\u6210\u6A21\u578B", realm: "video", contextWindow: 8192, maxTokens: 2048, supportsImages: true, rate: "\u89C6\u9891", badge: "\u6D77\u87BAH3" })
];
var DEFAULT_MODEL_ALIASES = {
  "deepseek-chat": "cn:deepseek-v4.1-flash",
  "deepseek-reasoner": "cn:deepseek-v4-pro",
  "gpt-4o": "global:gpt-6.1-sol",
  "gpt-4o-mini": "global:gpt-6-luna",
  "claude-3-5-sonnet": "global:gpt-6.1-sol",
  "claude-3-7-sonnet": "global:gpt-6-astra",
  "gemini-flash": "global:gemini-3.8-flash",
  "kling-v3-std": "kling-video-v3",
  "kling-v3-pro": "kling-video-v3",
  "keling": "kling-video-v3",
  "hailuo": "minimax-video-h3"
};

// src/config.js
var defaultScheduleConfig = {
  checkinHours: [9, 21],
  travelHours: [9, 21],
  tasksHours: [11],
  schoolHours: [12],
  catHours: [1],
  keepaliveHours: [22],
  activityReportCount: 5,
  checkinEnabled: true,
  travelEnabled: true,
  tasksEnabled: true,
  schoolEnabled: true,
  catEnabled: true,
  keepaliveEnabled: true
};
var defaultIPWhitelistConfig = {
  enabled: false,
  allowedIPs: [],
  allowLocalhost: true
};
var defaultAlertsConfig = {
  enabled: false,
  webhooks: [],
  events: ["ban", "401", "cooling", "low_credit"],
  minCredit: 50
};
var defaultConfig = {
  authDir: "",
  gatewayPort: 7863,
  apiKey: "",
  webPassword: "",
  allowRegister: false,
  portalAsHome: false,
  maxInFlightCN: 3,
  maxInFlightGlobal: 2,
  queueTimeoutMs: 6e4,
  streamIdleTimeoutMs: DEFAULT_STREAM_IDLE_TIMEOUT_MS,
  deviceTokenPath: "",
  autoCheckin: true,
  autoTravel: true,
  autoTasks: true,
  autoRefreshToken: true,
  autoFreeEnabled: true,
  promptMode: "none",
  // 'none' | 'passthrough' | 'append' | 'replace' | 'custom'
  promptText: "",
  proxy: "",
  enabledModels: [],
  aliases: { ...DEFAULT_MODEL_ALIASES },
  modelRoutes: {},
  freeModels: ["global:hy4free", "cn:hy4free", "global:hy3", "cn:hy3", "global:deepseek-v4.1-flash-sg", "cn:deepseek-v4.1-flash"],
  schedule: { ...defaultScheduleConfig },
  ipWhitelist: { ...defaultIPWhitelistConfig },
  alerts: { ...defaultAlertsConfig }
};
function normalizeHoursList(list, fallback) {
  if (!Array.isArray(list) || list.length === 0) return [...fallback];
  const valid = list.map((h) => Number(h)).filter((h) => Number.isInteger(h) && h >= 0 && h <= 23);
  return valid.length > 0 ? [...new Set(valid)].sort((a, b) => a - b) : [...fallback];
}
function unwrapConfig(raw) {
  const src = raw && typeof raw === "object" ? raw : {};
  const schedIn = src.schedule && typeof src.schedule === "object" ? src.schedule : {};
  const ipIn = src.ipWhitelist && typeof src.ipWhitelist === "object" ? src.ipWhitelist : {};
  const alertsIn = src.alerts && typeof src.alerts === "object" ? src.alerts : {};
  return {
    ...defaultConfig,
    ...src,
    aliases: {
      ...DEFAULT_MODEL_ALIASES,
      ...src.aliases && typeof src.aliases === "object" ? src.aliases : {}
    },
    modelRoutes: src.modelRoutes && typeof src.modelRoutes === "object" ? { ...src.modelRoutes } : {},
    enabledModels: Array.isArray(src.enabledModels) ? [...src.enabledModels] : [],
    freeModels: Array.isArray(src.freeModels) && src.freeModels.length > 0 ? [...src.freeModels] : [...defaultConfig.freeModels],
    schedule: {
      ...defaultScheduleConfig,
      ...schedIn,
      checkinHours: normalizeHoursList(schedIn.checkinHours, defaultScheduleConfig.checkinHours),
      travelHours: normalizeHoursList(schedIn.travelHours, defaultScheduleConfig.travelHours),
      tasksHours: normalizeHoursList(schedIn.tasksHours, defaultScheduleConfig.tasksHours),
      schoolHours: normalizeHoursList(schedIn.schoolHours, defaultScheduleConfig.schoolHours),
      catHours: normalizeHoursList(schedIn.catHours, defaultScheduleConfig.catHours),
      keepaliveHours: normalizeHoursList(schedIn.keepaliveHours, defaultScheduleConfig.keepaliveHours),
      activityReportCount: Math.max(1, Number(schedIn.activityReportCount ?? defaultScheduleConfig.activityReportCount) || 5)
    },
    ipWhitelist: {
      ...defaultIPWhitelistConfig,
      ...ipIn,
      allowedIPs: Array.isArray(ipIn.allowedIPs) ? [...ipIn.allowedIPs] : [],
      allowLocalhost: ipIn.allowLocalhost !== void 0 ? Boolean(ipIn.allowLocalhost) : true
    },
    alerts: {
      ...defaultAlertsConfig,
      ...alertsIn,
      webhooks: Array.isArray(alertsIn.webhooks) ? alertsIn.webhooks.filter(Boolean) : [],
      events: Array.isArray(alertsIn.events) && alertsIn.events.length > 0 ? [...alertsIn.events] : [...defaultAlertsConfig.events],
      minCredit: Math.max(0, Number(alertsIn.minCredit ?? defaultAlertsConfig.minCredit) || 0)
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
    return unwrapConfig(this.data);
  }
  update(patch = {}) {
    const merged = { ...this.data };
    for (const [k, v] of Object.entries(patch)) {
      if (v === void 0) continue;
      if (k === "aliases" && v && typeof v === "object") {
        merged.aliases = { ...v };
      } else if (k === "modelRoutes" && v && typeof v === "object") {
        merged.modelRoutes = { ...v };
      } else if (k === "schedule" && v && typeof v === "object") {
        merged.schedule = { ...merged.schedule, ...v };
      } else if (k === "ipWhitelist" && v && typeof v === "object") {
        merged.ipWhitelist = { ...merged.ipWhitelist, ...v };
      } else if (k === "alerts" && v && typeof v === "object") {
        merged.alerts = { ...merged.alerts, ...v };
      } else if (k === "enabledModels" && Array.isArray(v)) {
        merged.enabledModels = [...v];
      } else if (k === "freeModels" && Array.isArray(v)) {
        merged.freeModels = [...v];
      } else if (k in defaultConfig) {
        merged[k] = v;
      }
    }
    this.data = unwrapConfig(merged);
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
    this._authWatchTimer = null;
    this._lastAuthFingerprint = "";
    this._fileSignatures = /* @__PURE__ */ new Map();
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
              acc.manualDisabled = Boolean(acc.manualDisabled);
              acc.manualDisabledReason = acc.manualDisabledReason || "";
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
      const enabledFirst = this.getAll().find((a) => !this.isAccountUnavailable(a));
      this.activeUid = enabledFirst?.account?.uid || this.accounts.keys().next().value;
    }
    this.save();
  }
  importFromAuthDir(dirPath, options = {}) {
    if (!dirPath || !fs2.existsSync(dirPath)) return { added: 0, updated: 0 };
    let added = 0;
    let updated = 0;
    const updateExisting = Boolean(options.updateExisting);
    try {
      const files = fs2.readdirSync(dirPath).filter((f) => f.endsWith(".json"));
      for (const file of files) {
        try {
          const filePath = path2.join(dirPath, file);
          const stat = fs2.statSync(filePath);
          const sig = `${stat.mtimeMs}|${stat.size}`;
          if (updateExisting && this._fileSignatures.get(filePath) === sig) {
            continue;
          }
          const raw = JSON.parse(fs2.readFileSync(filePath, "utf8"));
          const uid = raw.account?.uid || raw.uid;
          if (!uid) continue;
          const realm = raw.auth?.realm || raw.realm || (file.includes("cn") ? "cn" : "global");
          const accessToken = raw.auth?.accessToken || raw.accessToken || "";
          const refreshToken = raw.auth?.refreshToken || raw.refreshToken || "";
          const expiresAt = raw.auth?.expiresAt || raw.expiresAt || 0;
          const domain = raw.auth?.domain || raw.domain || "";
          if (!this.accounts.has(uid)) {
            const acc = {
              account: {
                uid,
                nickname: raw.account?.nickname || raw.nickname || `Account-${uid.slice(0, 8)}`,
                enterpriseId: raw.account?.enterpriseId || raw.enterpriseId || "",
                provider: raw.account?.provider || raw.provider || ""
              },
              auth: {
                realm,
                accessToken,
                refreshToken,
                expiresAt,
                domain
              },
              disabled: Boolean(raw.disabled),
              disabledReason: raw.disabledReason || "",
              manualDisabled: Boolean(raw.manualDisabled),
              manualDisabledReason: raw.manualDisabledReason || "",
              source: "workbuddy2api-auths",
              updatedAt: Date.now()
            };
            this.accounts.set(uid, acc);
            added++;
          } else if (updateExisting) {
            const existing = this.accounts.get(uid);
            const accessChanged = Boolean(accessToken && accessToken !== existing.auth?.accessToken);
            const refreshChanged = Boolean(refreshToken && refreshToken !== existing.auth?.refreshToken);
            if (accessChanged || refreshChanged) {
              existing.auth = {
                ...existing.auth || {},
                realm: realm || existing.auth?.realm || "cn",
                accessToken: accessToken || existing.auth?.accessToken || "",
                refreshToken: refreshToken || existing.auth?.refreshToken || "",
                expiresAt: expiresAt || existing.auth?.expiresAt || 0,
                domain: domain || existing.auth?.domain || ""
              };
              if (accessChanged) {
                existing.disabled = false;
                existing.disabledReason = "";
                existing.sessionDeadStreak = 0;
              }
              existing.updatedAt = Date.now();
              updated++;
            }
          }
          this._fileSignatures.set(filePath, sig);
        } catch (_) {
        }
      }
    } catch (err) {
      console.warn("[account-store] \u5BFC\u5165 auths \u76EE\u5F55\u5F02\u5E38:", err.message);
    }
    return { added, updated };
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
  isAccountUnavailable(acc) {
    return Boolean(acc?.disabled || acc?.manualDisabled);
  }
  setDisabled(uid, disabled, reason = "") {
    const acc = this.accounts.get(uid);
    if (!acc) return false;
    acc.disabled = Boolean(disabled);
    acc.disabledReason = disabled ? reason || "\u7CFB\u7EDF\u505C\u7528" : "";
    acc.manualDisabled = Boolean(disabled);
    acc.manualDisabledReason = disabled ? reason || "\u624B\u52A8\u505C\u7528" : "";
    acc.updatedAt = Date.now();
    this.save();
    return true;
  }
  setAutoDisabled(uid, disabled, reason = "") {
    const acc = this.accounts.get(uid);
    if (!acc) return false;
    acc.disabled = Boolean(disabled);
    acc.disabledReason = disabled ? reason || "\u81EA\u52A8\u7194\u65AD\u7981\u7528" : "";
    acc.updatedAt = Date.now();
    this.save();
    return true;
  }
  setManualDisabled(uid, disabled, reason = "manual") {
    const acc = this.accounts.get(uid);
    if (!acc) return false;
    const prev = Boolean(acc.manualDisabled);
    acc.manualDisabled = Boolean(disabled);
    acc.manualDisabledReason = disabled ? reason || "manual" : "";
    acc.updatedAt = Date.now();
    this.save();
    return { found: true, changed: prev !== acc.manualDisabled, acc };
  }
  reviveAccount(uid) {
    const acc = this.accounts.get(uid);
    if (!acc) return false;
    const changed = Boolean(acc.disabled || acc.disabledReason);
    acc.disabled = false;
    acc.disabledReason = "";
    acc.sessionDeadStreak = 0;
    acc.updatedAt = Date.now();
    this.save();
    return { found: true, changed, acc };
  }
  updateAccountToken(uid, accessToken, refreshToken = "", expiresInSec = 7200) {
    const acc = this.accounts.get(uid);
    if (!acc) return null;
    if (accessToken) acc.auth.accessToken = String(accessToken).trim();
    if (refreshToken) acc.auth.refreshToken = String(refreshToken).trim();
    acc.auth.expiresAt = Date.now() + Math.max(300, Number(expiresInSec || 7200)) * 1e3;
    acc.disabled = false;
    acc.disabledReason = "";
    acc.manualDisabled = false;
    acc.manualDisabledReason = "";
    acc.sessionDeadStreak = 0;
    acc.updatedAt = Date.now();
    this.save();
    return acc;
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
      manualDisabled: account.manualDisabled !== void 0 ? Boolean(account.manualDisabled) : Boolean(existing?.manualDisabled),
      manualDisabledReason: account.manualDisabledReason ?? existing?.manualDisabledReason ?? "",
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
  getAuthWatchDirs() {
    return [
      ...new Set(
        [this.authDir, path2.join(this.dshHome, "workbuddy2api-auths")].filter(Boolean)
      )
    ];
  }
  _computeAuthDirsFingerprint(dirs = this.getAuthWatchDirs()) {
    const entries = [];
    for (const dir of dirs) {
      if (!dir || !fs2.existsSync(dir)) continue;
      try {
        const files = fs2.readdirSync(dir).filter((f) => f.endsWith(".json")).sort();
        for (const f of files) {
          try {
            const st = fs2.statSync(path2.join(dir, f));
            entries.push(`${dir}|${f}|${st.mtimeMs}|${st.size}`);
          } catch (_) {
          }
        }
      } catch (_) {
      }
    }
    return entries.join(";");
  }
  /**
   * 扫描被监控的 auths 目录，热加载新增或更新了 Token 的账号（保留既有禁用/统计状态）
   */
  scanAuthDirsOnce(dirs = this.getAuthWatchDirs()) {
    const fp = this._computeAuthDirsFingerprint(dirs);
    if (fp === this._lastAuthFingerprint) {
      return { changed: false, added: 0, updated: 0 };
    }
    this._lastAuthFingerprint = fp;
    let added = 0;
    let updated = 0;
    for (const dir of dirs) {
      const res = this.importFromAuthDir(dir, { updateExisting: true });
      added += res.added;
      updated += res.updated;
    }
    if (added > 0 || updated > 0) {
      if ((!this.activeUid || !this.accounts.has(this.activeUid)) && this.accounts.size > 0) {
        const enabledFirst = this.getAll().find((a) => !this.isAccountUnavailable(a));
        this.activeUid = enabledFirst?.account?.uid || this.accounts.keys().next().value;
      }
      this.save();
      console.log(`[account-store] auths \u76EE\u5F55\u70ED\u91CD\u8F7D\u5B8C\u6210: \u65B0\u589E ${added}, \u66F4\u65B0 ${updated}`);
      return { changed: true, added, updated };
    }
    return { changed: false, added: 0, updated: 0 };
  }
  /**
   * 启动 auths 目录后台轮询监听（默认 5s 一次，对齐 Go pool/watch.go）
   */
  startAuthDirWatch(intervalMs = 5e3, dirs = null) {
    if (this._authWatchTimer) return;
    const watchDirs = dirs && Array.isArray(dirs) ? dirs : this.getAuthWatchDirs();
    this._lastAuthFingerprint = this._computeAuthDirsFingerprint(watchDirs);
    this._authWatchTimer = setInterval(() => {
      try {
        this.scanAuthDirsOnce(watchDirs);
      } catch (err) {
        console.warn("[account-store] auths \u76EE\u5F55\u70ED\u91CD\u8F7D\u8F6E\u8BE2\u5F02\u5E38:", err.message);
      }
    }, Math.max(50, Number(intervalMs) || 5e3));
    if (this._authWatchTimer.unref) this._authWatchTimer.unref();
  }
  stopAuthDirWatch() {
    if (this._authWatchTimer) {
      clearInterval(this._authWatchTimer);
      this._authWatchTimer = null;
    }
  }
};

// src/pool/scheduler.js
import fs3 from "node:fs";
import path3 from "node:path";

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
  const path8 = isGlobal ? GLOBAL_TRIAL_PATH : DAILY_CHECKIN_PATH_CN;
  const url = `${base}${path8}`;
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
  black_cat: { kind: "cat", target: 3, nightOnly: true, title: "\u591C\u732B\u5B50\u4EFB\u52A1 (23:00-08:00 CST)" },
  first_buddy: { kind: "buddyfirst", target: 1, title: "\u9886\u517B\u7B2C\u4E00\u53EA AI \u5BA0\u7269" },
  RichMeow_Chat: { kind: "richmeow", target: 1, title: "\u684C\u9762\u7AEF\u5BF9\u8BDD 1 \u6B21" },
  Library_read: { kind: "library", target: 1, title: "\u4F53\u9A8C\u300C\u8D44\u6599\u5E93\u300D" },
  skill_share: { kind: "skillshare", target: 1, title: "\u5206\u4EAB\u70ED\u95E8\u6280\u80FD\u7ED9\u597D\u53CB" },
  Sequential_Tasks_1: { kind: "minichat", target: 1, title: "\u5C0F\u7A0B\u5E8F\u8F7B\u91CF\u5BF9\u8BDD 1 \u6B21" },
  school_season: { kind: "schoolseason", target: 1, title: "\u5F00\u5B66\u5B63\u4E3B\u9898\u6D3B\u52A8\u4EFB\u52A1" },
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
    case "buddyfirst": {
      const adoptRes = await adoptFirstBuddy(account, fetchFn);
      return Boolean(adoptRes?.ok);
    }
    case "skillshare": {
      const now = Date.now();
      const skillId = "skill_2096525080079265792";
      const skillName = "pptx";
      const events = [
        { eventCode: "skill_share_entry_click", skillId, skillName, skillType: "market", skillSource: "official", entry: "detail", status: "safe", actionSuccessful: true, clickAt: now, userId: uid },
        { eventCode: "skill_share_channel_action", skillId, skillName, skillType: "market", action: "wechat", panelAction: "click", panelType: "mini_program_card", isSuccessful: true, cost: 0, id: `share-${now}`, actionAt: now, userId: uid },
        { eventCode: "skill_share_channel_action", skillId, skillName, skillType: "market", action: "wechat", panelAction: "success", panelType: "mini_program_card", isSuccessful: true, cost: 12, id: `share-${now}`, actionAt: now, userId: uid },
        { eventCode: "skill_share_channel_action", skillId, skillName, skillType: "market", action: "link", panelAction: "success", panelType: "clipboard", isSuccessful: true, cost: 12, id: `share-${now}-link`, actionAt: now, userId: uid }
      ];
      return sendDesktopEvents(account, events, fetchFn);
    }
    case "minichat":
    case "schoolseason": {
      const now = Date.now();
      const cid = `wb-mp-${now}`;
      const ev = {
        eventCode: "chat_request_send",
        timestamp: now,
        reportDelay: 0,
        source: "mini_program",
        ideName: "wx_app_cloud",
        ideType: "WorkBuddy_MP",
        extName: "workbuddy-mp",
        extVersion: "2.4.0",
        mode: "chat",
        conversationId: cid,
        requestId: cid,
        inputLength: 12,
        mentionContexts: [],
        mentionContextCount: 0,
        userId: uid
      };
      if (spec.kind === "schoolseason") ev.activityId = "school_open_day_2026";
      return sendBillingJson([ev]);
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
function isCSTNightWindow(now = /* @__PURE__ */ new Date()) {
  const cstHour = new Date(now.getTime() + 8 * 3600 * 1e3).getUTCHours();
  return cstHour >= 23 || cstHour < 8;
}
async function runNightCatTask(account, fetchFn = fetch) {
  if (account?.auth?.realm === "global") return { ok: true, skipped: true };
  if (!isCSTNightWindow()) {
    return { ok: true, skipped: true, reason: "outside_cst_night_window_23_08" };
  }
  const spec = TASK_MAPPING.black_cat;
  const ok = await lightUpTask(account, "black_cat", spec, spec.target || 3, fetchFn);
  await new Promise((r) => setTimeout(r, 1200));
  const claimRes = await claimGrowthTask(account, "black_cat", fetchFn);
  return { ok: ok || claimRes.ok, ...claimRes };
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

// src/upstream/school.js
import crypto3 from "node:crypto";
var SCHOOL_BASE = `${CN_BILLING_BASE}/portal/activity/school`;
var FRESHMAN_BASE = `${CN_BILLING_BASE}/portal/activity/freshman`;
var TEACHER_BASE = `${CN_BILLING_BASE}/portal/activity/teacher`;
var ACTIVITY_ID = "school_open_day_2026";
var MP_UA = "Mozilla/5.0 (Linux; Android 14; MicroMessenger/8.0.49 WeChat/0.8.0 MiniProgramEnv/android; wkbrowser xweb)";
var DESKTOP_UA2 = "WorkBuddy/5.5.6 WorkBuddy/5.5.6 CLI/2.137.1";
var SCHOOL_PRIZE_LABELS = {
  school_credit_6: { label: "6\u79EF\u5206", type: "credit" },
  school_credit_66: { label: "66\u79EF\u5206", type: "credit" },
  school_voucher_luckin: { label: "\u745E\u5E78\u5496\u556115\u5143\u5238", type: "voucher" },
  school_voucher_kfc_ok: { label: "\u80AF\u5FB7\u57FAOK\u9910\u5238", type: "voucher" },
  school_voucher_kfc_ice: { label: "\u80AF\u5FB7\u57FA\u51B0\u6DC7\u6DCB\u5238", type: "voucher" },
  school_voucher_kugou: { label: "\u9177\u72D7\u4F1A\u5458\u6708\u5361\u5238", type: "voucher" }
};
function deriveId2(uid, salt) {
  return crypto3.createHash("md5").update(`${salt}:${uid || ""}`).digest("hex").slice(0, 36);
}
function buildMpHeaders(token, extra = {}) {
  return {
    "Authorization": `Bearer ${token}`,
    "Accept": "application/json",
    "Content-Type": "application/json",
    "User-Agent": MP_UA,
    ...extra
  };
}
async function mpJson(url, token, method = "GET", body = null, fetchFn = fetch, extraHeaders = {}) {
  const res = await fetchFn(url, {
    method,
    headers: buildMpHeaders(token, extraHeaders),
    ...body !== null ? { body: JSON.stringify(body) } : {},
    signal: AbortSignal.timeout(15e3)
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok && data?.code === 0, data };
}
async function fetchSchoolStatus(account, fetchFn = fetch) {
  if (!account || account.auth?.realm === "global") {
    return { ok: true, skipped: true, reason: "global_account_skipped", inPeriod: false, tasks: [] };
  }
  const token = account.auth?.accessToken || "";
  if (!token) return { ok: false, error: "\u8D26\u53F7\u7F3A\u5C11\u6709\u6548 accessToken" };
  try {
    const tasksRes = await mpJson(`${SCHOOL_BASE}/tasks`, token, "GET", null, fetchFn);
    if (!tasksRes.ok) {
      return {
        ok: false,
        status: tasksRes.status,
        error: tasksRes.data?.message || tasksRes.data?.msg || `HTTP ${tasksRes.status}`
      };
    }
    const d = tasksRes.data?.data || {};
    const cfgRes = await mpJson(`${SCHOOL_BASE}/config`, token, "GET", null, fetchFn).catch(() => null);
    const freshRes = await mpJson(`${FRESHMAN_BASE}/profile`, token, "GET", null, fetchFn).catch(() => null);
    const teacherRes = await mpJson(`${TEACHER_BASE}/profile`, token, "GET", null, fetchFn).catch(() => null);
    return {
      ok: true,
      inPeriod: Boolean(d.in_period),
      tasks: d.tasks || [],
      chance: cfgRes?.ok ? cfgRes.data?.data?.chance || {} : {},
      freshman: freshRes?.ok ? freshRes.data?.data : null,
      teacher: teacherRes?.ok ? teacherRes.data?.data : null
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
async function fetchSchoolExpert(token, fetchFn = fetch) {
  try {
    const res = await mpJson(
      `${CN_BILLING_BASE}/v2/operation-platform/market/expert/list`,
      token,
      "POST",
      {
        edition_mode: "all,domestic",
        page: 1,
        page_size: 20,
        sort_by: "use_count",
        sort_order: "desc",
        categories: ["16-BackToSchool"],
        expert_type: "agent"
      },
      fetchFn
    );
    const experts = res.data?.data?.experts || [];
    for (const e of experts) {
      if (e?.expert_id) {
        const dn = typeof e.display_name_zh === "object" ? e.display_name_zh?.zh : e.display_name_zh;
        return { id: e.expert_id, name: dn || e.expert_id };
      }
    }
  } catch (_) {
  }
  return { id: "ex_jB0dyFIQJEWa", name: "\u8BBA\u5C0F\u821F" };
}
function buildSchoolDesktopEvents(account) {
  const uid = account.account?.uid || "";
  const nick = account.account?.nickname || "";
  const now = Date.now();
  const conv = `wbdesk-${now}`;
  const fp = {
    timezone: "Asia/Shanghai",
    reportDelay: 2e3,
    userId: uid,
    username: nick,
    userNickname: nick,
    product: "SaaS",
    releaseDate: 1789036585355,
    commit: "5f9692923c93033111c51ad7b003eb80204a9b75",
    ideName: "WorkBuddy",
    ideType: "WorkBuddy",
    ideVersion: "5.5.6",
    machineId: deriveId2(uid, "machine"),
    sessionId: deriveId2(uid, "session"),
    extName: "workbuddy-desktop",
    extVersion: "5.5.6",
    os: "win32",
    arch: "x64",
    osVersion: "10.0.26220",
    cpuCores: 20,
    memorySize: 24,
    timestamp: now,
    presentAt: now,
    activityId: ACTIVITY_ID
  };
  return [
    { eventCode: "agent_task_created", source: "LOCAL", name: "working", task_target: "local", mode: "craft", conversationId: conv, messageId: conv, ...fp },
    { eventCode: "chat_message_send", messageId: `${conv}-assistant`, traceId: conv, rootRequestId: conv, parentConversationId: conv, agentName: "cli", agentType: "main", ...fp },
    { eventCode: "chat_request_send", inputLength: 24, traceId: conv, rootRequestId: conv, parentConversationId: conv, agentName: "cli", agentType: "main", ...fp },
    { eventCode: "chat_message_response", messageId: `${conv}-assistant`, responseModelId: "fast-model", inputToken: 120, outputToken: 80, totalToken: 200, isSuccessful: true, finishReason: "stop", firstTokenAt: now, traceId: conv, conversationId: conv, rootRequestId: conv, parentConversationId: conv, ...fp },
    { eventCode: "chat_message_status", messageId: `${conv}-assistant`, messageErrorCode: "0", traceId: conv, rootRequestId: conv, parentConversationId: conv, ...fp },
    { eventCode: "chat_request_response", mode: "craft", toolCallCount: 0, inputToken: 120, outputToken: 80, totalToken: 200, isSuccessful: true, finishReason: "stop", rootRequestId: conv, parentConversationId: conv, ...fp }
  ];
}
async function runSchoolActivity(account, options = {}) {
  const fetchFn = options.fetchFn || fetch;
  if (!account || account.auth?.realm === "global") {
    return { ok: true, skipped: true, reason: "global_account_skipped", prizes: [], creditGained: 0 };
  }
  const uid = account.account?.uid || "";
  const token = account.auth?.accessToken || "";
  if (!token) return { ok: false, error: "\u8D26\u53F7\u7F3A\u5C11\u6709\u6548 token" };
  const statusInfo = await fetchSchoolStatus(account, fetchFn);
  if (!statusInfo.ok) return statusInfo;
  if (!statusInfo.inPeriod) {
    return { ok: true, inPeriod: false, skipped: true, message: "\u5F00\u5B66\u5B63\u6D3B\u52A8\u5F53\u524D\u672A\u5728\u5468\u671F\u5185 (in_period=false)", prizes: [], creditGained: 0 };
  }
  const logs = [];
  for (const t of statusInfo.tasks) {
    const code = t.task_code;
    const st = String(t.status || "").toLowerCase();
    if (!code || st === "claimed" || code === "task_student_verify") continue;
    if (st === "pending") {
      await mpJson(`${SCHOOL_BASE}/tasks/${code}/viewed`, token, "POST", {}, fetchFn).catch(() => {
      });
    }
    if (st !== "completed") {
      if (code === "share_invite") {
        await mpJson(`${SCHOOL_BASE}/tasks/share-complete`, token, "POST", { channel: "wechat" }, fetchFn).catch(() => {
        });
        logs.push({ code, action: "share-complete" });
      } else if (code === "chat_3_times") {
        const need = Math.max(1, (t.target_count || 3) - (t.progress || 0));
        for (let i = 0; i < need; i++) {
          const cid = `wbmp-${Date.now()}-${i}`;
          await mpJson(`${CN_BILLING_BASE}${REPORT_PATH}`, token, "POST", [{
            eventCode: "chat_request_send",
            timestamp: Date.now(),
            reportDelay: 0,
            source: "mini_program",
            ideName: "wx_app_cloud",
            ideType: "WorkBuddy_MP",
            extName: "workbuddy-mp",
            extVersion: "SaaS",
            mode: "chat",
            conversationId: cid,
            requestId: cid,
            inputLength: 12,
            activityId: ACTIVITY_ID,
            userId: uid
          }], fetchFn).catch(() => {
          });
        }
        logs.push({ code, action: "mini_chat", count: need });
      } else if (code === "desktop_chat_1_time") {
        await mpJson(`${CN_CHAT_BASE}${REPORT_PATH}`, token, "POST", buildSchoolDesktopEvents(account), fetchFn, {
          "X-Product": "SaaS",
          "User-Agent": DESKTOP_UA2
        }).catch(() => {
        });
        logs.push({ code, action: "desktop_seq" });
      } else if (code === "expert_use") {
        const exp = await fetchSchoolExpert(token, fetchFn);
        const conv = `wbexp-${Date.now()}`;
        await mpJson(`${CN_BILLING_BASE}${REPORT_PATH}`, token, "POST", [{
          eventCode: "expert_actual_use",
          timestamp: Date.now(),
          reportDelay: 0,
          source: "mini_program",
          ideName: "wx_app_cloud",
          ideType: "WorkBuddy_MP",
          extName: "workbuddy-mp",
          extVersion: "SaaS",
          machineId: deriveId2(uid, "machine"),
          userId: uid,
          userNickname: account.account?.nickname || "",
          id: exp.id,
          name: exp.id,
          expertTitle: exp.name,
          type: "send_message",
          characterCount: 12,
          expertType: "agent",
          conversationId: conv,
          activityId: ACTIVITY_ID
        }], fetchFn).catch(() => {
        });
        logs.push({ code, action: "expert_use", expert: exp.name });
      }
    }
    const claimRes = await mpJson(`${SCHOOL_BASE}/tasks/${code}/claim`, token, "POST", {}, fetchFn).catch(() => null);
    if (claimRes?.ok) {
      logs.push({ code, action: "claim", ok: true });
    }
  }
  const prizes = [];
  let creditGained = 0;
  const cfgCheck = await fetchSchoolStatus(account, fetchFn);
  let bal = cfgCheck.chance?.balance || 0;
  let guard = 0;
  while (bal > 0 && guard < 20) {
    guard++;
    const drawRes = await mpJson(`${SCHOOL_BASE}/wheel/draw`, token, "POST", { draw_uuid: crypto3.randomUUID() }, fetchFn).catch(() => null);
    if (!drawRes || drawRes.data?.code === 40900 || !drawRes.ok) break;
    const dd = drawRes.data?.data || {};
    const pc = dd.prize_code || "?";
    const cr = Number(dd.credit_amount || 0);
    creditGained += cr;
    const spec = SCHOOL_PRIZE_LABELS[pc];
    prizes.push({ prizeCode: pc, credit: cr, label: spec ? spec.label : pc });
    bal = Number(dd.chance_balance ?? bal - 1);
  }
  return {
    ok: true,
    inPeriod: true,
    logs,
    prizes,
    creditGained,
    summary: `\u5F00\u5B66\u5B63\u6267\u884C\u5B8C\u6BD5: \u5B8C\u6210\u52A8\u4F5C ${logs.length} \u9879, \u8F6C\u76D8\u62BD\u5956 ${prizes.length} \u6B21 (+${creditGained} \u79EF\u5206)`
  };
}

// src/upstream/hint.js
var NO_HEALTHY_ACCOUNT_HINT = "no healthy account available in pool; check /status or retry later";
function codeMarker(lower, code) {
  return lower.includes(`"code":${code}`) || lower.includes(`"code": ${code}`) || lower.includes(`"code":"${code}"`) || lower.includes(`"code": "${code}"`) || lower.includes(`"code":'${code}'`);
}
function isModelParamInvalid(body = "") {
  const lower = String(body).toLowerCase();
  return codeMarker(lower, "11133") || lower.includes("model_param_invalid") || lower.includes("invalid request parameters") || lower.includes("request parameters do not meet the current model requirements");
}
function isInvalidImageData(body = "") {
  const lower = String(body).toLowerCase();
  return codeMarker(lower, "11135") || lower.includes("invalid_image_data") || lower.includes("replace the image");
}
function isModelBlockedBody(body = "") {
  const lower = String(body).toLowerCase();
  return codeMarker(lower, "11102") || lower.includes("model_not_found") || lower.includes("model not found") || lower.includes("does not exist") || lower.includes("unsupported model");
}
function requestHasImagePart(body = {}) {
  const msgs = Array.isArray(body?.messages) ? body.messages : [];
  for (const m of msgs) {
    if (!m || !Array.isArray(m.content)) continue;
    for (const part of m.content) {
      if (part?.type === "image_url" || part?.type === "image" || part?.type === "input_image") {
        return true;
      }
    }
  }
  return false;
}
function getGatewayHint(kind, msg = "", ctx = {}) {
  if (isModelParamInvalid(msg)) {
    if (ctx.hasImage && ctx.modelInCatalog && !ctx.modelSupportsImages) {
      return `model ${ctx.model || ""} does not support images; pick one with supports_images=true from /v1/models`;
    }
    return "request parameters were rejected by the model provider; check message format and model capabilities";
  }
  if (isInvalidImageData(msg)) {
    return "image data rejected by upstream; use a real/valid image, may need a new conversation";
  }
  switch (kind) {
    case ErrKind.PROMPT_TOO_LONG:
      return "request context exceeds the model's limit; reduce history/message size";
    case ErrKind.IMAGE_INVALID:
      return "image request was rejected by upstream; check image_url format and image data";
    case ErrKind.WAF_BLOCK:
      return "upstream WAF blocked the gateway; retry after the block window";
    case ErrKind.SOFT_RATE:
      return "rate limited by upstream; retry after reset";
    case ErrKind.ACCOUNT_FAULT:
      return "account-level fault at upstream (auth/quota state); the gateway will rotate or disable this account";
    case ErrKind.SESSION_DEAD:
      return "account session expired at upstream; the account is disabled until re-login";
    case ErrKind.HARD_CREDIT:
      return "account credits exhausted at upstream; waiting for daily check-in to restore";
    case ErrKind.MODEL_BLOCKED:
      return "upstream has no such model on this backend; switch model or retry on another account";
    case ErrKind.CONTENT_BLOCKED:
      return "request content was rejected by content policy; adjust the prompt and retry";
    default:
      return "";
  }
}
function injectFrameGatewayHint(parsed, ctx = {}, classifyFn = null) {
  if (!parsed || typeof parsed !== "object" || !parsed.error) return null;
  if (parsed.error.gateway_hint) return null;
  const rawText = JSON.stringify(parsed);
  let kind = ErrKind.NONE;
  if (typeof classifyFn === "function") {
    kind = classifyFn(400, rawText);
  }
  const msg = parsed.error.message || rawText;
  const hint = getGatewayHint(kind, msg, ctx);
  if (!hint) return null;
  return {
    ...parsed,
    error: {
      ...parsed.error,
      gateway_hint: hint
    }
  };
}
function parseQuotaResetAt(quota) {
  if (!quota || typeof quota !== "object") return 0;
  const raw = quota.reset_at ?? quota.resetAt ?? quota.next_reset_at ?? quota.nextResetAt;
  if (raw === void 0 || raw === null || raw === "") return 0;
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return raw < 1e11 ? Math.floor(raw * 1e3) : Math.floor(raw);
  }
  const str = String(raw).trim();
  if (/^\d+$/.test(str)) {
    const n = Number(str);
    return n < 1e11 ? n * 1e3 : n;
  }
  const parsed = Date.parse(str);
  return Number.isNaN(parsed) ? 0 : parsed;
}
function getNextMidnightCSTMs(nowMs = Date.now()) {
  const cstOffset = 8 * 3600 * 1e3;
  const d = new Date(nowMs + cstOffset);
  d.setUTCHours(24, 0, 0, 0);
  return d.getTime() - cstOffset;
}

// src/pool/scheduler.js
var STICKY_TTL_MS = 15 * 60 * 1e3;
var KEEPALIVE_INTERVAL_MS = 5 * 60 * 1e3;
var SCHEDULE_TICK_MS = 60 * 1e3;
var TOKEN_REFRESH_WINDOW_MS = 2 * 60 * 60 * 1e3;
var WAF_IP_WINDOW_MS = 60 * 1e3;
var WAF_IP_THRESHOLD = 2;
var MODEL_BLOCK_BASE_MS = 6 * 3600 * 1e3;
var MODEL_BLOCK_MAX_MS = 24 * 3600 * 1e3;
var CONSECUTIVE_FAIL_THRESHOLD = 5;
var DEGRADE_COOLDOWN_MS = 300 * 1e3;
function stripModelRealm(model = "") {
  return String(model).replace(/^(cn|global|solo|trae):/i, "");
}
function getCSTDateHour() {
  const cst = new Date(Date.now() + 8 * 3600 * 1e3);
  return {
    date: cst.toISOString().slice(0, 10),
    hour: cst.getUTCHours(),
    slot: `${cst.toISOString().slice(0, 10)}-${cst.getUTCHours()}`
  };
}
var WafIPGate = class {
  constructor(windowMs = WAF_IP_WINDOW_MS, threshold = WAF_IP_THRESHOLD) {
    this.windowMs = windowMs;
    this.threshold = threshold;
    this.hits = /* @__PURE__ */ new Map();
    this.until = 0;
  }
  active(now = Date.now()) {
    return now < this.until;
  }
  noteWaf(uid, now = Date.now()) {
    if (this.active(now)) return true;
    if (uid) this.hits.set(uid, now);
    for (const [k, ts] of this.hits.entries()) {
      if (now - ts > this.windowMs) this.hits.delete(k);
    }
    if (this.hits.size >= this.threshold) {
      this.until = now + this.windowMs;
      this.hits.clear();
      console.warn(`[waf-ip] 60s \u5185 ${this.threshold}+ \u4E0D\u540C\u8D26\u53F7\u547D\u4E2D 403\uFF0C\u542F\u7528 IP \u7EA7\u6B62\u635F\u81F3 ${new Date(this.until).toISOString()}`);
      return true;
    }
    return false;
  }
};
var DegradeGate = class {
  constructor() {
    this.until = 0;
  }
  active(now = Date.now()) {
    return now < this.until;
  }
  trigger(now = Date.now()) {
    if (!this.active(now)) {
      this.until = getNextMidnightCSTMs(now);
    }
    return this.until;
  }
};
var Scheduler = class {
  constructor(accountStore, options = {}) {
    this.store = accountStore;
    this.client = options.client || null;
    this.configStore = options.configStore || null;
    this.alertManager = options.alertManager || null;
    this.maxInFlightCN = options.maxInFlightCN || 3;
    this.maxInFlightGlobal = options.maxInFlightGlobal || 2;
    this.queueTimeoutMs = options.queueTimeoutMs ?? 5e3;
    this.circuitBreakers = /* @__PURE__ */ new Map();
    this.modelBreakers = /* @__PURE__ */ new Map();
    this.routeModelBreakers = /* @__PURE__ */ new Map();
    this.inFlight = /* @__PURE__ */ new Map();
    this.inFlightRequests = /* @__PURE__ */ new Map();
    this.accountCredits = /* @__PURE__ */ new Map();
    this.stickyMap = /* @__PURE__ */ new Map();
    this.accountStats = /* @__PURE__ */ new Map();
    this.consecutiveFails = /* @__PURE__ */ new Map();
    this.waiters = [];
    this.wafIPGate = new WafIPGate();
    this.degradeGate = new DegradeGate();
    this._executedScheduleSlots = /* @__PURE__ */ new Set();
    const dshHome = options.dshHome || accountStore?.dshHome || "";
    this.statePath = options.statePath === false ? "" : options.statePath || (dshHome ? path3.join(dshHome, ".workbuddy2api-state.json") : "");
    this._stateSaveTimer = null;
    this._loadState();
    this.autoTimer = null;
    this.scheduleTimer = null;
    this.keepaliveTimer = null;
  }
  _loadState() {
    if (!this.statePath) return;
    try {
      if (!fs3.existsSync(this.statePath)) return;
      const raw = JSON.parse(fs3.readFileSync(this.statePath, "utf8"));
      const now = Date.now();
      if (raw.degradeUntil && raw.degradeUntil > now) {
        this.degradeGate.until = Number(raw.degradeUntil);
      }
      if (raw.circuitBreakers && typeof raw.circuitBreakers === "object") {
        for (const [k, v] of Object.entries(raw.circuitBreakers)) {
          if (v && v.cooldownUntil > now) this.circuitBreakers.set(k, v);
        }
      }
      if (raw.modelBreakers && typeof raw.modelBreakers === "object") {
        for (const [k, v] of Object.entries(raw.modelBreakers)) {
          if (v && v.cooldownUntil > now) this.modelBreakers.set(k, v);
        }
      }
      if (raw.accountCredits && typeof raw.accountCredits === "object") {
        for (const [k, v] of Object.entries(raw.accountCredits)) {
          if (v && typeof v === "object") this.accountCredits.set(k, v);
        }
      }
    } catch (err) {
      console.warn("[scheduler] \u8BFB\u53D6\u6301\u4E45\u5316\u8FD0\u884C\u72B6\u6001\u5F02\u5E38:", err.message);
    }
  }
  flushState() {
    if (this._stateSaveTimer) {
      clearTimeout(this._stateSaveTimer);
      this._stateSaveTimer = null;
    }
    if (!this.statePath) return;
    try {
      const now = Date.now();
      const circuitBreakers = {};
      for (const [k, v] of this.circuitBreakers.entries()) {
        if (v && v.cooldownUntil > now) circuitBreakers[k] = v;
      }
      const modelBreakers = {};
      for (const [k, v] of this.modelBreakers.entries()) {
        if (v && v.cooldownUntil > now) modelBreakers[k] = v;
      }
      const accountCredits = {};
      for (const [k, v] of this.accountCredits.entries()) {
        accountCredits[k] = v;
      }
      const payload = {
        savedAt: now,
        degradeUntil: this.degradeGate.active(now) ? this.degradeGate.until : 0,
        circuitBreakers,
        modelBreakers,
        accountCredits
      };
      fs3.mkdirSync(path3.dirname(this.statePath), { recursive: true });
      const tmpPath = `${this.statePath}.tmp`;
      fs3.writeFileSync(tmpPath, JSON.stringify(payload, null, 2), "utf8");
      fs3.renameSync(tmpPath, this.statePath);
    } catch (err) {
      console.warn("[scheduler] \u4FDD\u5B58\u6301\u4E45\u5316\u8FD0\u884C\u72B6\u6001\u5F02\u5E38:", err.message);
    }
  }
  _scheduleSaveState() {
    if (!this.statePath) return;
    if (this._stateSaveTimer) return;
    this._stateSaveTimer = setTimeout(() => {
      this._stateSaveTimer = null;
      this.flushState();
    }, 200);
    if (this._stateSaveTimer.unref) this._stateSaveTimer.unref();
  }
  updateAccountCredits(uid, remain = 0, expiringRemain = 0) {
    if (!uid) return;
    this.accountCredits.set(uid, {
      remain: Number(remain || 0),
      expiringRemain: Number(expiringRemain || 0),
      updatedAt: Date.now()
    });
    this._scheduleSaveState();
  }
  beginInFlight(reqId, info) {
    if (!reqId) return;
    this.inFlightRequests.set(reqId, {
      id: reqId,
      ...info,
      startedAt: Date.now()
    });
  }
  endInFlight(reqId) {
    if (!reqId) return;
    this.inFlightRequests.delete(reqId);
  }
  getInFlightRequests() {
    const now = Date.now();
    return [...this.inFlightRequests.values()].map((r) => ({
      ...r,
      elapsedMs: now - (r.startedAt || now)
    }));
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
  isAccountUnavailable(acc) {
    if (!acc) return true;
    return typeof this.store?.isAccountUnavailable === "function" ? this.store.isAccountUnavailable(acc) : Boolean(acc.disabled || acc.manualDisabled);
  }
  tripRouteModel(modelId, ttlMs = 6e4) {
    if (!modelId) return;
    this.routeModelBreakers.set(String(modelId), Date.now() + ttlMs);
  }
  isRouteModelCooling(modelId) {
    if (!modelId) return false;
    const until = this.routeModelBreakers.get(String(modelId)) || 0;
    if (Date.now() < until) return true;
    if (until > 0) this.routeModelBreakers.delete(String(modelId));
    return false;
  }
  /**
   * 申请账号槽位租约
   */
  acquire(account) {
    if (this.isAccountUnavailable(account)) return false;
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
   * 记录调用成功，重置对应熔断器与连续失败计数并更新统计
   */
  recordSuccess(account, model = "") {
    const uid = account?.account?.uid;
    if (!uid) return;
    const hadCb = this.circuitBreakers.delete(uid);
    const hadMb = model ? this.modelBreakers.delete(`${uid}::${stripModelRealm(model)}`) : false;
    this.consecutiveFails.delete(uid);
    const st = this._getOrCreateStats(uid);
    st.successCount += 1;
    st.lastSuccessAt = Date.now();
    if (model) st.lastModel = stripModelRealm(model);
    if (hadCb || hadMb) {
      this._scheduleSaveState();
    }
  }
  /**
   * 记录瞬态失败（5 次连续未知/传输错误触发 300s 固定临时降级，不叠加延长已有冷却，对齐 Go pool/degrade.go）
   */
  noteTransientFailure(uid, kind = "transient", message = "") {
    if (!uid) return false;
    const next = (this.consecutiveFails.get(uid) || 0) + 1;
    this.consecutiveFails.set(uid, next);
    if (next < CONSECUTIVE_FAIL_THRESHOLD) {
      console.warn(`[degrade] \u8D26\u53F7 ${uid} \u77AC\u6001\u5F02\u5E38 (${next}/${CONSECUTIVE_FAIL_THRESHOLD}, ${kind}): ${message}`);
      return false;
    }
    const now = Date.now();
    const prev = this.circuitBreakers.get(uid);
    if (prev && now < prev.cooldownUntil) {
      return false;
    }
    this.consecutiveFails.delete(uid);
    this.circuitBreakers.set(uid, {
      failures: next,
      cooldownUntil: now + DEGRADE_COOLDOWN_MS,
      kind: kind || "degraded",
      reason: `\u8FDE\u7EED ${next} \u6B21\u77AC\u6001\u5F02\u5E38\u964D\u7EA7 ${DEGRADE_COOLDOWN_MS / 1e3}s: ${message}`
    });
    this._scheduleSaveState();
    console.warn(`[degrade] \u8D26\u53F7 ${uid} \u8FDE\u7EED ${next} \u6B21\u5F02\u5E38\uFF0C\u89E6\u53D1\u56FA\u5B9A ${DEGRADE_COOLDOWN_MS / 1e3}s \u4E34\u65F6\u964D\u7EA7: ${message}`);
    return true;
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
    if (kind === ErrKind.CONTENT_BLOCKED || kind === ErrKind.BAD_PARAMS || kind === ErrKind.PROMPT_TOO_LONG || kind === ErrKind.IMAGE_INVALID) {
      return;
    }
    if (bareModel && kind === ErrKind.MODEL_BLOCKED) {
      const mKey = `${uid}::${bareModel}`;
      const prev = this.modelBreakers.get(mKey) || { failures: 0, cooldownUntil: 0, kind: "", reason: "" };
      const hits = prev.failures + 1;
      const ttl = Math.min(MODEL_BLOCK_MAX_MS, MODEL_BLOCK_BASE_MS * Math.pow(2, Math.min(hits - 1, 2)));
      this.modelBreakers.set(mKey, {
        failures: hits,
        cooldownUntil: Date.now() + ttl,
        kind,
        reason: `11102 ${message}`
      });
      this._scheduleSaveState();
      console.warn(`[scheduler] \u8D26\u53F7 ${uid} \u6A21\u578B [${bareModel}] 11102 \u540E\u7AEF\u4E0D\u652F\u6301\uFF0C\u8D1F\u7F13\u5B58 ${Math.round(ttl / 36e5)}h`);
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
      this._scheduleSaveState();
      console.warn(`[scheduler] \u8D26\u53F7 ${uid} \u6A21\u578B [${bareModel}] \u89E6\u53D1\u6A21\u578B\u7EA7\u8F6F\u7194\u65AD (${kind}), \u51B7\u5374 ${Math.round(cooldownMs2 / 1e3)}s: ${message}`);
      return;
    }
    if (!kind || kind === ErrKind.CLIENT || kind === "unknown" || kind === "network") {
      this.noteTransientFailure(uid, kind || "transient", message);
      return;
    }
    this.consecutiveFails.delete(uid);
    const cb = this.circuitBreakers.get(uid) || { failures: 0, cooldownUntil: 0, kind: "", reason: "" };
    cb.failures += 1;
    cb.kind = kind;
    cb.reason = message;
    let cooldownMs = 6e4;
    const acc = this.store.get(uid);
    const nick = acc?.account?.nickname || uid;
    switch (kind) {
      case ErrKind.SOFT_RATE:
        cooldownMs = Math.min(3e4 * Math.pow(2, cb.failures - 1), 6e5);
        break;
      case ErrKind.HARD_CREDIT:
        cooldownMs = 18e5;
        break;
      case ErrKind.SESSION_DEAD:
        cooldownMs = 72e5;
        this.alertManager?.notifyAuthFailed(uid, nick, message);
        if (cb.failures >= 2 && typeof this.store.setAutoDisabled === "function") {
          this.store.setAutoDisabled(uid, true, `\u51ED\u8BC1\u5931\u6548(401/12153): ${String(message).slice(0, 80)}`);
          this.alertManager?.notifyBan(uid, nick, "\u8FDE\u7EED 401/12153 \u4F1A\u8BDD\u5931\u6548\u81EA\u52A8\u7981\u7528");
        }
        break;
      case ErrKind.ACCOUNT_FAULT:
        cooldownMs = 432e5;
        if (typeof this.store.setAutoDisabled === "function") {
          this.store.setAutoDisabled(uid, true, `\u8D26\u53F7\u5F02\u5E38(11140): ${String(message).slice(0, 80)}`);
        }
        this.alertManager?.notifyBan(uid, nick, message);
        break;
      case ErrKind.WAF_BLOCK:
        cooldownMs = 18e4;
        this.wafIPGate.noteWaf(uid);
        break;
      default:
        cooldownMs = 45e3;
    }
    cb.cooldownUntil = Date.now() + cooldownMs;
    this.circuitBreakers.set(uid, cb);
    this._scheduleSaveState();
    console.warn(`[scheduler] \u8D26\u53F7 ${uid} \u89E6\u53D1\u8D26\u53F7\u7EA7\u7194\u65AD\u4FDD\u62A4 (${kind}), \u51B7\u5374\u65F6\u957F ${Math.round(cooldownMs / 1e3)}s: ${message}`);
  }
  /**
   * 免费模型额度耗尽触发的模型级精准墙钟冷却（对齐 quota.reset_at 或次日 00:00 CST，上限 24h）
   */
  cooldownFreeQuotaModel(uid, resetAtMs = 0, model = "", reason = "") {
    const bare = stripModelRealm(model);
    if (!uid || !bare) return;
    const now = Date.now();
    const maxCap = now + 24 * 3600 * 1e3;
    let until = resetAtMs && resetAtMs > now ? resetAtMs : getNextMidnightCSTMs(now);
    if (until > maxCap) until = maxCap;
    this.modelBreakers.set(`${uid}::${bare}`, {
      failures: 1,
      cooldownUntil: until,
      resetAt: until,
      kind: ErrKind.SOFT_RATE,
      reason: reason || "free_quota_exhausted"
    });
    this._scheduleSaveState();
    console.warn(`[free-guard] \u8D26\u53F7 ${uid} \u514D\u8D39\u6A21\u578B [${bare}] \u989D\u5EA6\u8017\u5C3D\uFF0C\u6A21\u578B\u7EA7\u9501\u5B9A\u81F3 ${new Date(until).toISOString()}`);
  }
  /**
   * 当巡检发现账号重新获得有效积分余额（remain > 0）时自动解除积分不足引发的冷却/自动禁用（绝不覆盖 manualDisabled）
   */
  reenableIfCredits(uid, remain = 0) {
    if (!uid || Number(remain || 0) <= 0) return false;
    const acc = this.store.get(uid);
    if (!acc || acc.manualDisabled) return false;
    let changed = false;
    if (acc.disabled && /credit|余额|11111|11112|402|quota/i.test(acc.disabledReason || "") && typeof this.store.reviveAccount === "function") {
      this.store.reviveAccount(uid);
      changed = true;
    }
    const cb = this.circuitBreakers.get(uid);
    if (cb && (cb.kind === ErrKind.HARD_CREDIT || /credit|余额|11111|11112|quota/i.test(cb.reason || ""))) {
      this.circuitBreakers.delete(uid);
      changed = true;
    }
    if (changed) {
      this._scheduleSaveState();
      console.log(`[scheduler] \u8D26\u53F7 ${uid} \u68C0\u6D4B\u5230\u53EF\u7528\u4F59\u989D (${remain})\uFF0C\u5DF2\u81EA\u52A8\u89E3\u9664\u79EF\u5206\u51B7\u5374`);
    }
    return changed;
  }
  /**
   * 清除单个账号的账号级与模型级冷却状态
   */
  clearCooldown(uid) {
    if (!uid) return false;
    let cleared = this.circuitBreakers.delete(uid);
    this.consecutiveFails.delete(uid);
    const prefix = `${uid}::`;
    for (const key of this.modelBreakers.keys()) {
      if (key.startsWith(prefix)) {
        this.modelBreakers.delete(key);
        cleared = true;
      }
    }
    if (cleared) this._scheduleSaveState();
    return cleared;
  }
  /**
   * 一键清除所有账号及模型冷却状态
   */
  clearAllCooldowns() {
    const count = this.circuitBreakers.size + this.modelBreakers.size + this.routeModelBreakers.size;
    this.circuitBreakers.clear();
    this.modelBreakers.clear();
    this.routeModelBreakers.clear();
    this.consecutiveFails.clear();
    if (count > 0) this._scheduleSaveState();
    return count;
  }
  getCountsDetailed(realmFilter = null) {
    const now = Date.now();
    const list = this.store.getAll().filter((a) => !realmFilter || (a.auth?.realm || "cn") === realmFilter);
    let total = 0;
    let healthy = 0;
    let cooling = 0;
    let disabled = 0;
    let manualDisabled = 0;
    let inFlightFull = 0;
    for (const acc of list) {
      total++;
      if (acc.manualDisabled) manualDisabled++;
      if (acc.disabled || acc.manualDisabled) {
        disabled++;
        continue;
      }
      const cb = this.circuitBreakers.get(acc.account.uid);
      if (cb && now < cb.cooldownUntil) {
        cooling++;
        continue;
      }
      if (this.getInFlight(acc.account.uid) >= this.getLimitForAccount(acc)) {
        inFlightFull++;
        continue;
      }
      healthy++;
    }
    return { total, healthy, cooling, disabled, manualDisabled, inFlightFull };
  }
  getPoolDiagnostics(bareModel = "", targetRealm = null) {
    const now = Date.now();
    const list = this.store.getAll().filter((a) => !targetRealm || (a.auth?.realm || "cn") === targetRealm);
    let earliestResetAt = 0;
    let rateLimitedCount = 0;
    let disabledCount = 0;
    let busyCount = 0;
    for (const acc of list) {
      if (this.isAccountUnavailable(acc)) {
        disabledCount++;
        continue;
      }
      const uid = acc.account.uid;
      const cb = this.circuitBreakers.get(uid);
      const mb = bareModel ? this.modelBreakers.get(`${uid}::${stripModelRealm(bareModel)}`) : null;
      const coolingUntil = Math.max(cb && now < cb.cooldownUntil ? cb.cooldownUntil : 0, mb && now < mb.cooldownUntil ? mb.cooldownUntil : 0);
      if (coolingUntil > 0) {
        rateLimitedCount++;
        if (!earliestResetAt || coolingUntil < earliestResetAt) earliestResetAt = coolingUntil;
        continue;
      }
      if (this.getInFlight(uid) >= this.getLimitForAccount(acc)) {
        busyCount++;
      }
    }
    const isRateLimited = list.length > 0 && rateLimitedCount > 0 && rateLimitedCount + disabledCount >= list.length;
    return {
      total: list.length,
      disabled: disabledCount,
      rateLimited: rateLimitedCount,
      inFlightFull: busyCount,
      isRateLimited,
      earliestResetAt,
      retryAfterSec: earliestResetAt > now ? Math.ceil((earliestResetAt - now) / 1e3) : 0,
      summary: `total=${list.length} disabled=${disabledCount} cooling=${rateLimitedCount} busy=${busyCount}`
    };
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
      manualDisabled: !!acc?.manualDisabled,
      manualDisabledReason: acc?.manualDisabledReason || "",
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
   * 选出当前最佳可用账号候选序列（跳过手动/自动停用账号，融合 Sticky 亲和性、熔断状态与并发度）
   */
  pickCandidates(targetRealm = null, options = {}) {
    const accounts = this.store.getAll().filter((a) => !this.isAccountUnavailable(a));
    if (accounts.length === 0) return [];
    const now = Date.now();
    const bareModel = stripModelRealm(options.bareModel || "");
    const stickyUid = this._getStickyUid(options.sessionKey, bareModel);
    let maxRemain = 0;
    for (const acc of accounts) {
      const c = this.accountCredits.get(acc.account.uid);
      if (c && c.remain > maxRemain) maxRemain = c.remain;
    }
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
      const creditInfo = this.accountCredits.get(uid);
      if (creditInfo && creditInfo.remain > 0) {
        if (maxRemain > 0) {
          penalty -= creditInfo.remain / maxRemain * 120;
        }
        if (creditInfo.expiringRemain > 0) {
          const expRatio = Math.min(1, creditInfo.expiringRemain / creditInfo.remain);
          penalty -= expRatio * 180;
        }
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
    const allEnabled = this.store.getAll().filter((a) => !this.isAccountUnavailable(a));
    if (allEnabled.length === 0) {
      throw new Error("\u5F53\u524D\u65E0\u53EF\u7528\u542F\u7528\u8D26\u53F7\uFF0C\u8BF7\u5728\u8BBE\u7F6E\u4E2D\u6DFB\u52A0\u6216\u542F\u7528\u81F3\u5C11\u4E00\u4E2A WorkBuddy / CodeBuddy \u8D26\u53F7");
    }
    if (this.wafIPGate.active()) {
      const wafErr = new Error("waf ip-level block: upstream firewall is blocking the gateway IP, rotation stopped");
      wafErr.status = 403;
      wafErr.kind = ErrKind.WAF_BLOCK;
      wafErr.code = "waf_ip_blocked";
      throw wafErr;
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
          err.nonRetryable = result.kind === ErrKind.CONTENT_BLOCKED || result.kind === ErrKind.BAD_PARAMS || result.kind === ErrKind.PROMPT_TOO_LONG || result.kind === ErrKind.IMAGE_INVALID;
          if (err.nonRetryable) {
            throw err;
          }
          if (result.kind === ErrKind.WAF_BLOCK && this.wafIPGate.active()) {
            err.code = "waf_ip_blocked";
            throw err;
          }
          if (result.kind === ErrKind.SOFT_RATE || result.kind === ErrKind.HARD_CREDIT || result.kind === ErrKind.SESSION_DEAD || result.kind === ErrKind.NOT_FOUND || result.kind === ErrKind.MODEL_BLOCKED || result.kind === ErrKind.ACCOUNT_FAULT || result.kind === ErrKind.WAF_BLOCK || result.kind === ErrKind.SERVER) {
            lastError = err;
            console.log(`[scheduler] \u8D26\u53F7 ${account.account.uid} [${bareModel || rawModel}] \u9047 ${result.kind}\uFF0C\u81EA\u52A8\u5207\u6362\u4E0B\u4E00\u4E2A\u8D26\u53F7...`);
            return null;
          }
          throw err;
        }
        if (result?.degradedTriggered) {
          this.degradeGate.trigger();
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
        if (err.code === "waf_ip_blocked") throw err;
        console.warn(`[scheduler] \u8D26\u53F7 ${account.account.uid} \u8C03\u7528\u5F02\u5E38 (${errKind})\uFF0C\u5C1D\u8BD5\u5BB9\u707E\u8F6E\u6362:`, err.message);
        return null;
      }
    };
    for (const account of candidates) {
      if (this.wafIPGate.active()) break;
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
    const diag = this.getPoolDiagnostics(bareModel, targetRealm);
    if (diag.isRateLimited) {
      this.alertManager?.notifyAllCooling(targetRealm || "all", bareModel || rawModel);
      const err = lastError || new Error("rate limited: all accounts are cooling down");
      if (!err.status || err.status >= 500) err.status = 429;
      if (diag.retryAfterSec > 0) err.retryAfterSec = diag.retryAfterSec;
      throw err;
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
   * 对全量账号批量执行每日签到
   */
  async runAllSignin() {
    const accounts = this.store.getAll().filter((a) => !a.disabled);
    const results = [];
    for (const acc of accounts) {
      try {
        const res = await performCheckin(acc);
        results.push({ uid: acc.account.uid, nickname: acc.account.nickname, ...res });
      } catch (err) {
        results.push({ uid: acc.account.uid, nickname: acc.account.nickname, ok: false, error: err.message });
      }
      await new Promise((r) => setTimeout(r, 500));
    }
    return results;
  }
  /**
   * 对所有国内账号批量执行全量成长任务与活动领奖
   */
  async runAllTasks() {
    const accounts = this.store.getAll().filter((a) => !a.disabled && a.auth?.realm !== "global");
    const results = [];
    for (const acc of accounts) {
      try {
        const res = await runAllGrowthTasks(acc);
        results.push({ uid: acc.account.uid, nickname: acc.account.nickname, ok: true, result: res });
      } catch (err) {
        results.push({ uid: acc.account.uid, nickname: acc.account.nickname, ok: false, error: err.message });
      }
      await new Promise((r) => setTimeout(r, 800));
    }
    return results;
  }
  /**
   * 对所有国内账号批量执行开学季活动（领任务 + 自动点灯 + 领积分 + 大转盘抽奖，保留手动停用账号参与）
   */
  async runAllSchool(options = {}) {
    const accounts = this.store.getAll().filter((a) => !a.disabled && a.auth?.realm !== "global");
    const results = [];
    for (const acc of accounts) {
      try {
        const res = await runSchoolActivity(acc, options);
        results.push({ uid: acc.account.uid, nickname: acc.account.nickname, ...res });
      } catch (err) {
        results.push({ uid: acc.account.uid, nickname: acc.account.nickname, ok: false, error: err.message });
      }
      await new Promise((r) => setTimeout(r, 800));
    }
    return results;
  }
  /**
   * 对所有国内账号在 CST 23:00-08:00 窗口批量执行「深夜猫猫 / black_cat」任务
   */
  async runAllNightCat(now = /* @__PURE__ */ new Date()) {
    if (!isCSTNightWindow(now)) {
      return [];
    }
    const accounts = this.store.getAll().filter((a) => !a.disabled && a.auth?.realm !== "global");
    const results = [];
    for (const acc of accounts) {
      try {
        const res = await runNightCatTask(acc);
        results.push({ uid: acc.account.uid, nickname: acc.account.nickname, ...res });
      } catch (err) {
        results.push({ uid: acc.account.uid, nickname: acc.account.nickname, ok: false, error: err.message });
      }
      await new Promise((r) => setTimeout(r, 500));
    }
    return results;
  }
  async _runScheduledHourTick() {
    const cfg = this.configStore ? this.configStore.getAll() : {};
    const sched = cfg.schedule || {};
    const { hour, slot } = getCSTDateHour();
    const oncePerSlot = (tag, fn) => {
      const key = `${tag}:${slot}`;
      if (this._executedScheduleSlots.has(key)) return;
      this._executedScheduleSlots.add(key);
      if (this._executedScheduleSlots.size > 200) {
        const first = this._executedScheduleSlots.keys().next().value;
        this._executedScheduleSlots.delete(first);
      }
      Promise.resolve().then(fn).catch((e) => console.warn(`[scheduler] \u5B9A\u65F6\u6392\u7A0B(${tag})\u5F02\u5E38:`, e.message));
    };
    if (sched.checkinEnabled !== false && cfg.autoCheckin !== false && (sched.checkinHours || [9, 21]).includes(hour)) {
      oncePerSlot("checkin", () => this.runAllWelfare());
    }
    if (sched.travelEnabled !== false && cfg.autoTravel !== false && (sched.travelHours || [9, 21]).includes(hour)) {
      oncePerSlot("travel", () => this.runAllTravel());
    }
    if (sched.tasksEnabled !== false && cfg.autoTasks !== false && (sched.tasksHours || [11]).includes(hour)) {
      oncePerSlot("tasks", () => this.runAllTasks());
    }
    if (sched.schoolEnabled !== false && (sched.schoolHours || [12]).includes(hour)) {
      oncePerSlot("school", () => this.runAllSchool());
    }
    if (sched.catEnabled !== false && (sched.catHours || [1]).includes(hour) && isCSTNightWindow()) {
      oncePerSlot("nightcat", () => this.runAllNightCat());
    }
    if (sched.keepaliveEnabled !== false && cfg.autoRefreshToken !== false && (sched.keepaliveHours || [22]).includes(hour)) {
      oncePerSlot("keepalive", () => this.refreshAllTokens(false));
    }
  }
  /**
   * 启动后台自动化排程任务（定时小时排程 + 保活刷新 + 兜底巡检 + auths 热监听）
   */
  startAutoRoutines(intervalMs = 2 * 60 * 60 * 1e3) {
    this.store?.startAuthDirWatch?.(5e3);
    if (!this.scheduleTimer) {
      this.scheduleTimer = setInterval(() => {
        this._runScheduledHourTick().catch(() => {
        });
      }, SCHEDULE_TICK_MS);
      if (this.scheduleTimer.unref) this.scheduleTimer.unref();
    }
    if (!this.autoTimer) {
      console.log(`[scheduler] \u542F\u52A8\u540E\u53F0\u81EA\u52A8\u5316\u6392\u7A0B\uFF1A\u5B9A\u65F6\u6574\u70B9\u4EFB\u52A1\u4E0E Token \u4FDD\u6D3B (\u515C\u5E95\u5DE1\u68C0 ${Math.round(intervalMs / 6e4)} \u5206\u949F)`);
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
    this.store?.stopAuthDirWatch?.();
    if (this._stateSaveTimer) {
      this.flushState();
    }
    if (this.scheduleTimer) {
      clearInterval(this.scheduleTimer);
      this.scheduleTimer = null;
    }
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
import crypto5 from "node:crypto";
import fs5 from "node:fs";

// src/upstream/payload.js
import crypto4 from "node:crypto";

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
function repackToolResultBlocks(messages) {
  if (!Array.isArray(messages) || messages.length === 0) return messages;
  const out = [];
  let i = 0;
  while (i < messages.length) {
    const m = messages[i];
    out.push(m);
    i++;
    if (!m || m.role !== "assistant" || !Array.isArray(m.tool_calls) || m.tool_calls.length === 0) {
      continue;
    }
    const expectedIds = new Set(m.tool_calls.map((tc) => tc?.id).filter(Boolean));
    if (expectedIds.size === 0) continue;
    const results = [];
    const between = [];
    while (i < messages.length && results.length < expectedIds.size) {
      const cur = messages[i];
      if (!cur || typeof cur !== "object") {
        between.push(cur);
        i++;
        continue;
      }
      if (cur.role === "tool") {
        results.push(cur);
        i++;
        continue;
      }
      if (results.length === 0) {
        break;
      }
      if (cur.role === "assistant" && Array.isArray(cur.tool_calls) && cur.tool_calls.length > 0) {
        break;
      }
      between.push(cur);
      i++;
    }
    out.push(...results, ...between);
  }
  return out;
}
function cleanupOrphanToolMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0) return messages;
  const callIds = /* @__PURE__ */ new Set();
  const resultIds = /* @__PURE__ */ new Set();
  for (const m of messages) {
    if (!m || typeof m !== "object") continue;
    if (m.role === "assistant" && Array.isArray(m.tool_calls)) {
      for (const tc of m.tool_calls) {
        if (tc?.id) callIds.add(tc.id);
      }
    } else if (m.role === "tool" && m.tool_call_id) {
      resultIds.add(m.tool_call_id);
    }
  }
  if (callIds.size === 0 && resultIds.size === 0) return messages;
  const keepCalls = /* @__PURE__ */ new Set();
  for (const id of callIds) {
    if (resultIds.has(id)) keepCalls.add(id);
  }
  const cleaned = [];
  for (const m of messages) {
    if (!m || typeof m !== "object") {
      cleaned.push(m);
      continue;
    }
    if (m.role === "tool") {
      if (m.tool_call_id && keepCalls.has(m.tool_call_id)) {
        cleaned.push(m);
      }
      continue;
    }
    if (m.role === "assistant" && Array.isArray(m.tool_calls) && m.tool_calls.length > 0) {
      const keptCalls = m.tool_calls.filter((tc) => tc?.id && keepCalls.has(tc.id));
      if (keptCalls.length === m.tool_calls.length) {
        cleaned.push(m);
      } else {
        const nextMsg = { ...m };
        if (keptCalls.length > 0) {
          nextMsg.tool_calls = keptCalls;
        } else {
          delete nextMsg.tool_calls;
          if (!nextMsg.content) nextMsg.content = "";
        }
        cleaned.push(nextMsg);
      }
      continue;
    }
    cleaned.push(m);
  }
  return cleaned;
}
function isTruncatedArguments(raw) {
  const trimmed = String(raw ?? "").trim();
  if (!trimmed) return false;
  try {
    JSON.parse(trimmed);
    return false;
  } catch (_) {
    return true;
  }
}
function dropTruncatedToolCalls(calls = []) {
  if (!Array.isArray(calls)) return [];
  return calls.filter((c) => {
    if (!c?.function) return true;
    return !isTruncatedArguments(c.function.arguments);
  });
}
var DEGRADED_SYSTEM_PROMPT = "You are a helpful assistant. Respond in the user's language, follow the user's instructions, and be direct and concise.";
function pruneOldestHistory(payload) {
  if (!payload || !Array.isArray(payload.messages) || payload.messages.length <= 2) {
    return { pruned: false, payload };
  }
  const msgs = payload.messages;
  let firstNonSystem = 0;
  while (firstNonSystem < msgs.length) {
    const r = String(msgs[firstNonSystem]?.role || "").toLowerCase();
    if (r !== "system" && r !== "developer") break;
    firstNonSystem++;
  }
  if (firstNonSystem >= msgs.length - 1) {
    return { pruned: false, payload };
  }
  let nextTurn = firstNonSystem + 1;
  while (nextTurn < msgs.length - 1) {
    const r = String(msgs[nextTurn]?.role || "").toLowerCase();
    if (r === "user") break;
    nextTurn++;
  }
  if (nextTurn >= msgs.length) {
    return { pruned: false, payload };
  }
  const nextMsgs = [...msgs.slice(0, firstNonSystem), ...msgs.slice(nextTurn)];
  return {
    pruned: true,
    payload: { ...payload, messages: nextMsgs }
  };
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
  const sum = crypto4.createHash("sha256").update(`${uid || ""}|${conversationId || ""}`).digest("hex");
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
  msgs = repackToolResultBlocks(msgs);
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

// src/upstream/model-catalog.js
import fs4 from "node:fs";
import path4 from "node:path";
import os3 from "node:os";
var MODELS_DEV_URL = "https://models.dev/api.json";
var FETCH_COOLDOWN_MS = 5 * 60 * 1e3;
var NEGATIVE_TTL_MS = 24 * 60 * 60 * 1e3;
var DEFAULT_CONTEXT_WINDOW = 2e5;
var OFFICIAL_VENDOR_PRIORITY = [
  "anthropic",
  "openai",
  "google",
  "deepseek",
  "zai",
  "z-ai",
  "moonshotai",
  "minimax",
  "alibaba",
  "tencent"
];
var OFFICIAL_SEED_LIMITS = {
  "glm-5.2": { ctx: 1e6, max: 131072 },
  "glm-5.1": { ctx: 2e5, max: 131072 },
  "glm-5.3": { ctx: 1e6, max: 131072 },
  "glm-5.3-flash": { ctx: 1e6, max: 131072 },
  "glm-5v-turbo": { ctx: 2e5, max: 131072 },
  "kimi-k2.7": { ctx: 256e3, max: 65536 },
  "kimi-k2.6": { ctx: 256e3, max: 262144 },
  "kimi-k2.5": { ctx: 164e3, max: 262144 },
  "kimi-k3": { ctx: 1048576, max: 131072 },
  "kimi-k2.8-preview": { ctx: 1048576, max: 131072 },
  "minimax-m3": { ctx: 512e3, max: 512e3 },
  "hy3": { ctx: 192e3, max: 64e3 },
  "hy3-preview": { ctx: 262144, max: 64e3 },
  "hy4-preview": { ctx: 1e6, max: 64e3 },
  "hy4-preview-x": { ctx: 1e6, max: 64e3 },
  "deepseek-v4-pro": { ctx: 1e6, max: 384e3 },
  "deepseek-v4-flash": { ctx: 1e6, max: 384e3 },
  "deepseek-v4.1-flash": { ctx: 1e6, max: 384e3 },
  "gpt-6-astra": { ctx: 105e4, max: 128e3 },
  "gpt-5.6-sol": { ctx: 105e4, max: 128e3 },
  "gpt-5.6-terra": { ctx: 105e4, max: 128e3 },
  "gpt-5.6-luna": { ctx: 105e4, max: 128e3 },
  "gpt-5.5": { ctx: 105e4, max: 128e3 },
  "gpt-5.4": { ctx: 105e4, max: 128e3 },
  "gpt-5.3-codex": { ctx: 4e5, max: 128e3 },
  "gemini-3.5-flash": { ctx: 1048576, max: 65536 },
  "auto": { ctx: 168e3, max: 32e3 }
};
var CURATED_LIMITS = [
  { match: /^claude-/, ctx: 2e5, max: 64e3 },
  { match: /^gpt-5|^gpt-6/, ctx: 4e5, max: 128e3 },
  { match: /^o3|^o4/, ctx: 2e5, max: 1e5 },
  { match: /^gemini-3|^gemini-2\.5/, ctx: 1048576, max: 65536 },
  { match: /^deepseek-/, ctx: 131072, max: 16384 },
  { match: /^glm-/, ctx: 2e5, max: 32768 },
  { match: /^kimi-/, ctx: 262144, max: 32768 },
  { match: /^minimax-/, ctx: 2e5, max: 32768 },
  { match: /^qwen/, ctx: 262144, max: 32768 },
  { match: /^hy|^hunyuan/, ctx: 131072, max: 16384 }
];
function stripPrefix(id = "") {
  return String(id || "").replace(/^(cn:|global:|solo:|trae:)/i, "").trim().toLowerCase();
}
var ModelCatalogEnricher = class {
  constructor(options = {}) {
    this.dshHome = options.dshHome || process.env.DSH_HOME || path4.join(os3.homedir(), ".dsh");
    this.cachePath = path4.join(this.dshHome, ".workbuddy-models-cache.json");
    this.fetchFn = options.fetchFn || fetch;
    this.cache = {};
    this.negatives = /* @__PURE__ */ new Map();
    this.lastFetchAt = 0;
    this.fetchingPromise = null;
    this._load();
  }
  _load() {
    try {
      if (fs4.existsSync(this.cachePath)) {
        const raw = JSON.parse(fs4.readFileSync(this.cachePath, "utf8"));
        if (raw && typeof raw.models === "object") {
          this.cache = raw.models;
        }
      }
    } catch (_) {
    }
  }
  _save() {
    try {
      if (!fs4.existsSync(this.dshHome)) {
        fs4.mkdirSync(this.dshHome, { recursive: true });
      }
      fs4.writeFileSync(
        this.cachePath,
        JSON.stringify({ updatedAt: Date.now(), models: this.cache }, null, 2),
        "utf8"
      );
    } catch (_) {
    }
  }
  lookupLimits(modelId, upstreamCtx = 0, upstreamMax = 0) {
    if (upstreamCtx > 0) {
      return {
        contextWindow: upstreamCtx,
        maxTokens: upstreamMax > 0 ? upstreamMax : 32e3
      };
    }
    const bare = stripPrefix(modelId);
    const exactSeed = OFFICIAL_SEED_LIMITS[bare];
    if (exactSeed) {
      return {
        contextWindow: exactSeed.ctx,
        maxTokens: upstreamMax > 0 ? upstreamMax : exactSeed.max
      };
    }
    const cached = this.cache[bare];
    if (cached && cached.ctx > 0) {
      return {
        contextWindow: cached.ctx,
        maxTokens: upstreamMax > 0 ? upstreamMax : cached.max || 32e3
      };
    }
    for (const rule of CURATED_LIMITS) {
      if (rule.match.test(bare)) {
        return {
          contextWindow: rule.ctx,
          maxTokens: upstreamMax > 0 ? upstreamMax : rule.max
        };
      }
    }
    this.scheduleModelsDevRefresh(bare);
    return {
      contextWindow: DEFAULT_CONTEXT_WINDOW,
      maxTokens: upstreamMax > 0 ? upstreamMax : 32e3
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
        headers: { "Accept": "application/json", "User-Agent": "dsh-workbuddy2api" },
        signal: AbortSignal.timeout(5e3)
      });
      if (!res.ok) return;
      const doc = await res.json().catch(() => null);
      if (!doc || typeof doc !== "object") return;
      const byBare = /* @__PURE__ */ new Map();
      for (const [providerId, pObj] of Object.entries(doc)) {
        const modelsObj = pObj?.models;
        if (!modelsObj || typeof modelsObj !== "object") continue;
        const pLower = providerId.toLowerCase();
        const isOfficial = OFFICIAL_VENDOR_PRIORITY.includes(pLower);
        for (const [mKey, mVal] of Object.entries(modelsObj)) {
          const ctx = Number(mVal?.limit?.context || 0);
          const max = Number(mVal?.limit?.output || 0);
          if (ctx <= 0) continue;
          const tail = mKey.includes("/") ? mKey.split("/").pop() : mKey;
          const norm = tail.trim().toLowerCase();
          if (!norm) continue;
          const prev = byBare.get(norm);
          if (!prev || !prev.isOfficial && isOfficial) {
            byBare.set(norm, { ctx, max: max > 0 ? max : 32e3, isOfficial });
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
          if (this.negatives.size > 1e3) {
            const first = this.negatives.keys().next().value;
            this.negatives.delete(first);
          }
        }
        this._save();
      }
    } catch (_) {
    }
  }
};

// src/upstream/client.js
var CLIENT_VERSION = "5.5.4";
var CLI_VERSION = "2.137.1";
function deriveAccountStableID(uid, purpose) {
  return crypto5.createHash("sha256").update(`wb2a:${purpose}:${uid || ""}`).digest("hex").slice(0, 36);
}
function isValidHexTrace(s) {
  return typeof s === "string" && /^[0-9a-f]{16}$|^[0-9a-f]{32}$/i.test(s);
}
var UpstreamClient = class {
  constructor(options = {}) {
    this.configStore = options.configStore || null;
    this.proxy = options.proxy || process.env.HTTPS_PROXY || process.env.HTTP_PROXY || "";
    this.customUA = options.userAgent || "";
    this.onTokenRefresh = options.onTokenRefresh || null;
    this.deviceTokenPath = options.deviceTokenPath || process.env.WB_DEVICE_TOKEN_FILE || "";
    this._deviceTokenCache = { path: "", token: "", readAt: 0 };
    this.modelCatalog = options.modelCatalog || new ModelCatalogEnricher({ dshHome: options.dshHome });
    this.refreshFlights = /* @__PURE__ */ new Map();
  }
  readDeviceToken() {
    const filePath = String(this.configStore?.get("deviceTokenPath") || this.deviceTokenPath || "").trim();
    if (!filePath) return "";
    const now = Date.now();
    if (this._deviceTokenCache.path === filePath && now - this._deviceTokenCache.readAt < 5 * 60 * 1e3) {
      return this._deviceTokenCache.token;
    }
    let token = "";
    try {
      const stat = fs5.statSync(filePath);
      if (stat.isFile() && stat.size > 0 && stat.size <= 1024) {
        token = fs5.readFileSync(filePath, "utf8").trim();
      }
    } catch (_) {
    }
    this._deviceTokenCache = { path: filePath, token, readAt: now };
    return token;
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
      const convId = meta.conversationId || crypto5.randomUUID();
      const convReqId = meta.conversationRequestId || crypto5.randomBytes(16).toString("hex");
      const msgId = crypto5.randomBytes(16).toString("hex");
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
      const devTok = this.readDeviceToken();
      if (devTok) {
        headers["X-Device-Token"] = devTok;
      }
    }
    return headers;
  }
  /**
   * 错误归类逻辑
   */
  classifyError(status, bodyText) {
    const raw = typeof bodyText === "string" ? bodyText : JSON.stringify(bodyText || "");
    const text = raw.toLowerCase();
    if (status === 401 || text.includes("12153") || text.includes("token expired") || text.includes("session dead")) {
      return ErrKind.SESSION_DEAD;
    }
    if (status === 402 || text.includes("credit") || text.includes("balance") || text.includes("\u4F59\u989D\u4E0D\u8DB3") || text.includes("\u79EF\u5206\u4E0D\u8DB3")) {
      return ErrKind.HARD_CREDIT;
    }
    if (status === 429 || text.includes("6004") || text.includes("rate limit") || text.includes("frequency")) {
      return ErrKind.SOFT_RATE;
    }
    if (isInvalidImageData(text) || text.includes("image_invalid") || text.includes("invalid image")) {
      return ErrKind.IMAGE_INVALID;
    }
    if (isModelBlockedBody(text) || status === 404) {
      return ErrKind.MODEL_BLOCKED;
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
  /**
   * 刷新账号 Token（按 uid 单飞 coalescing，防止并发请求重复消费单次 refreshToken）
   */
  refreshToken(account) {
    const uid = account?.account?.uid || "";
    if (!uid) return this._doRefreshToken(account);
    if (this.refreshFlights.has(uid)) {
      return this.refreshFlights.get(uid);
    }
    const flight = Promise.resolve().then(() => this._doRefreshToken(account)).finally(() => {
      if (this.refreshFlights.get(uid) === flight) {
        this.refreshFlights.delete(uid);
      }
    });
    this.refreshFlights.set(uid, flight);
    return flight;
  }
  async _doRefreshToken(account) {
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
    const doRequest = async (path8) => {
      const url = `${base}${path8}`;
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
      if (!item || typeof item !== "object") return;
      const bare = item.id || item.model || item.name;
      if (!bare || item.disabled) return;
      const fullId = /^(cn:|global:)/i.test(bare) ? bare : `${prefix}${bare}`;
      if (seen.has(fullId)) return;
      seen.add(fullId);
      const rateInfo = parseCreditMultiplier(item.credits || item.rate, item.tags);
      const supportedEfforts = Array.isArray(item.reasoning?.supportedEfforts) ? item.reasoning.supportedEfforts : item.reasoning?.effort ? [item.reasoning.effort] : item.supportedEfforts || [];
      const defaultEffort = item.reasoning?.defaultEffort || item.reasoning?.effort || "";
      const rawCtx = Number(item.maxInputTokens || item.maxAllowedSize || item.contextWindow || item.context_length || 0);
      const rawMax = Number(item.maxOutputTokens || item.maxTokens || 0);
      const limits = this.modelCatalog.lookupLimits(bare, rawCtx, rawMax);
      models.push({
        id: fullId,
        bareId: bare,
        realm: isGlobal ? "global" : "cn",
        name: item.displayName || item.name || bare,
        description: item.descriptionZh || item.descriptionEn || item.description || "",
        credits: rateInfo.credits,
        rate: rateInfo.rate,
        multiplier: rateInfo.multiplier,
        isFree: rateInfo.isFree,
        badge: rateInfo.badge,
        vendor: item.vendor || "",
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
    const probeGet = async (path8) => {
      let res = await fetch(`${base}${path8}`, {
        headers: this.buildHeaders(account, false),
        signal: AbortSignal.timeout(1e4)
      });
      if (res.status === 401 && account.auth?.refreshToken) {
        try {
          await this.refreshToken(account);
          res = await fetch(`${base}${path8}`, {
            headers: this.buildHeaders(account, false),
            signal: AbortSignal.timeout(1e4)
          });
        } catch (_) {
        }
      }
      if (!res.ok) return null;
      return await res.json().catch(() => null);
    };
    for (const path8 of [ENTERPRISE_MODELS_PATH, ENTERPRISE_MODELS_FALLBACK_PATH]) {
      try {
        const json = await probeGet(path8);
        if (json && (json.code === 0 || json.code === 200 || Array.isArray(json.data) || json.data?.models)) {
          const list = json.data?.models || (Array.isArray(json.data) ? json.data : json.models || []);
          for (const item of list) addItem(item);
          if (models.length > 0) break;
        }
      } catch (_) {
      }
    }
    if (models.length === 0) {
      for (const path8 of [V3_CONFIG_PATH, "/v2/models", CN_MODELS_PATH]) {
        try {
          const json = await probeGet(path8);
          if (!json) continue;
          const list = json.data?.config?.models || json.data?.models || json.models || (Array.isArray(json.data) ? json.data : []);
          for (const item of list) addItem(item);
        } catch (_) {
        }
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
    const conversationId = reqBody.conversation_id || reqBody.conversationId || meta.conversationId || crypto5.randomUUID();
    const convReqId = meta.conversationRequestId || crypto5.randomBytes(16).toString("hex");
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
          (m) => m.role === "system" ? { ...m, content: DEGRADED_SYSTEM_PROMPT } : m
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
              degradedTriggered: true,
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
import fs6 from "node:fs";
import path5 from "node:path";
import os4 from "node:os";
function round2(n) {
  return Math.round((Number(n) || 0) * 100) / 100;
}
function round3(n) {
  return Math.round((Number(n) || 0) * 1e3) / 1e3;
}
function createEmptyModelBucket() {
  return {
    requests: 0,
    success: 0,
    failed: 0,
    inputTokens: 0,
    outputTokens: 0,
    cacheHitTokens: 0,
    cacheMissTokens: 0,
    cacheWriteTokens: 0,
    credit: 0,
    creditSamples: 0,
    ttfbSumMs: 0,
    ttfbCount: 0,
    latSumMs: 0,
    genSecSum: 0,
    lastSeen: 0
  };
}
var UsageLedger = class {
  constructor(options = {}) {
    this.dshHome = options.dshHome || process.env.DSH_HOME || path5.join(os4.homedir(), ".dsh");
    this.filePath = path5.join(this.dshHome, ".workbuddy2api-usage.json");
    this.recentLogs = [];
    this.nextLogId = 1;
    this.data = {
      days: {},
      modelStats: {},
      summary: {
        totalRequests: 0,
        totalSuccess: 0,
        totalFailed: 0,
        totalInputTokens: 0,
        totalOutputTokens: 0,
        totalCredit: 0
      }
    };
    this.load();
  }
  load() {
    try {
      if (fs6.existsSync(this.filePath)) {
        const disk = JSON.parse(fs6.readFileSync(this.filePath, "utf8"));
        this.data = {
          days: disk.days || {},
          modelStats: disk.modelStats || {},
          summary: {
            totalRequests: 0,
            totalSuccess: 0,
            totalFailed: 0,
            totalInputTokens: 0,
            totalOutputTokens: 0,
            totalCredit: 0,
            ...disk.summary || {}
          }
        };
      }
    } catch (_) {
    }
  }
  save() {
    try {
      if (!fs6.existsSync(this.dshHome)) {
        fs6.mkdirSync(this.dshHome, { recursive: true });
      }
      const keys = Object.keys(this.data.days).sort();
      if (keys.length > 60) {
        for (const oldKey of keys.slice(0, keys.length - 60)) {
          delete this.data.days[oldKey];
        }
      }
      fs6.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), "utf8");
    } catch (_) {
    }
  }
  getTodayKey() {
    const d = /* @__PURE__ */ new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
  /**
   * 写入单次请求消费与指标记录（兼容旧 4 参数及新版详情对象）
   */
  record(model, inputTokens = 0, outputTokens = 0, cacheHit = false, extra = {}) {
    const today = this.getTodayKey();
    const hour = String((/* @__PURE__ */ new Date()).getHours());
    const inTok = Math.max(0, Math.round(Number(inputTokens) || 0));
    const outTok = Math.max(0, Math.round(Number(outputTokens) || 0));
    const credit = Math.max(0, Number(extra.credit || 0) || 0);
    const hasCredit = Boolean(extra.hasCredit || credit > 0);
    const success = extra.success !== false;
    const ttfbMs = Math.max(0, Number(extra.ttfbMs || 0) || 0);
    const durationMs = Math.max(0, Number(extra.durationMs || 0) || 0);
    const cacheHitTokens = Math.max(0, Number(extra.cacheHitTokens || 0) || 0);
    const cacheMissTokens = Math.max(0, Number(extra.cacheMissTokens || 0) || 0);
    const cacheWriteTokens = Math.max(0, Number(extra.cacheWriteTokens || 0) || 0);
    if (!this.data.days[today]) {
      this.data.days[today] = {
        requests: 0,
        inputTokens: 0,
        outputTokens: 0,
        credit: 0,
        cacheHits: 0,
        models: {},
        modelStats: {},
        hours: {}
      };
    }
    const day = this.data.days[today];
    if (!day.modelStats) day.modelStats = {};
    day.requests += 1;
    day.inputTokens += inTok;
    day.outputTokens += outTok;
    day.credit = round3((day.credit || 0) + credit);
    if (cacheHit || cacheHitTokens > 0) day.cacheHits = (day.cacheHits || 0) + 1;
    day.models[model] = (day.models[model] || 0) + 1;
    if (!day.hours[hour]) {
      day.hours[hour] = { requests: 0, tokens: 0, credit: 0 };
    }
    day.hours[hour].requests += 1;
    day.hours[hour].tokens += inTok + outTok;
    day.hours[hour].credit = round3((day.hours[hour].credit || 0) + credit);
    const updateBucket = (bucket) => {
      bucket.requests += 1;
      if (success) bucket.success += 1;
      else bucket.failed += 1;
      bucket.inputTokens += inTok;
      bucket.outputTokens += outTok;
      bucket.cacheHitTokens += cacheHitTokens;
      bucket.cacheMissTokens += cacheMissTokens;
      bucket.cacheWriteTokens += cacheWriteTokens;
      if (hasCredit) {
        bucket.credit = round3((bucket.credit || 0) + credit);
        bucket.creditSamples = (bucket.creditSamples || 0) + 1;
      }
      if (ttfbMs > 0) {
        bucket.ttfbSumMs += ttfbMs;
        bucket.ttfbCount += 1;
      }
      if (durationMs > 0) {
        bucket.latSumMs += durationMs;
        const genMs = durationMs > ttfbMs ? durationMs - ttfbMs : durationMs;
        if (outTok > 0 && genMs > 0) {
          bucket.genSecSum += genMs / 1e3;
        }
      }
      bucket.lastSeen = Date.now();
      return bucket;
    };
    const mKey = String(model || "unknown");
    day.modelStats[mKey] = updateBucket(day.modelStats[mKey] || createEmptyModelBucket());
    if (!this.data.modelStats) this.data.modelStats = {};
    this.data.modelStats[mKey] = updateBucket(this.data.modelStats[mKey] || createEmptyModelBucket());
    this.data.summary.totalRequests += 1;
    if (success) this.data.summary.totalSuccess = (this.data.summary.totalSuccess || 0) + 1;
    else this.data.summary.totalFailed = (this.data.summary.totalFailed || 0) + 1;
    this.data.summary.totalInputTokens += inTok;
    this.data.summary.totalOutputTokens += outTok;
    this.data.summary.totalCredit = round3((this.data.summary.totalCredit || 0) + credit);
    this.save();
  }
  /**
   * 写入一条实时请求流水日志（供控制台实时监控展示）
   */
  addRequestLog(entry) {
    const now = /* @__PURE__ */ new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const item = {
      id: this.nextLogId++,
      timestamp: Date.now(),
      time: `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`,
      model: entry.model || "-",
      rate: entry.rate || "-",
      mode: entry.mode || "stream",
      protocol: entry.protocol || "openai",
      status: entry.status || 200,
      uid: entry.uid ? String(entry.uid).slice(0, 8) : "-",
      account: entry.account || "-",
      realm: entry.realm || "-",
      ttfbMs: Math.round(Number(entry.ttfbMs || 0)),
      durationMs: Math.round(Number(entry.durationMs || 0)),
      promptTokens: Math.round(Number(entry.promptTokens || 0)),
      completionTokens: Math.round(Number(entry.completionTokens || 0)),
      totalTokens: Math.round(Number(entry.promptTokens || 0) + Number(entry.completionTokens || 0)),
      tokensPerSec: Number(entry.tokensPerSec || 0),
      credit: entry.hasCredit ? round3(entry.credit) : null,
      cacheHit: Boolean(entry.cacheHit),
      error: entry.error || ""
    };
    this.recentLogs.unshift(item);
    if (this.recentLogs.length > 100) {
      this.recentLogs.length = 100;
    }
    return item;
  }
  getRecentLogs() {
    return [...this.recentLogs];
  }
  getAvailableDates() {
    const today = this.getTodayKey();
    const keys = Object.keys(this.data.days || {});
    if (!keys.includes(today)) keys.push(today);
    return keys.sort().reverse();
  }
  _buildBreakdown(rawModelStats = {}, modelCatalogMap = null) {
    const list = [];
    for (const [modelId, st] of Object.entries(rawModelStats || {})) {
      const totalTok = (st.inputTokens || 0) + (st.outputTokens || 0);
      const hitDenom = (st.cacheHitTokens || 0) + (st.cacheMissTokens || 0);
      const cacheHitRate = hitDenom > 0 ? Math.round((st.cacheHitTokens || 0) / hitDenom * 100) : 0;
      const meta = modelCatalogMap?.get(modelId) || modelCatalogMap?.get(`global:${modelId}`) || modelCatalogMap?.get(`cn:${modelId}`);
      list.push({
        model: modelId,
        rate: meta?.rate || "-",
        multiplier: meta?.multiplier ?? null,
        isFree: Boolean(meta?.isFree),
        requests: st.requests || 0,
        success: st.success || 0,
        failed: st.failed || 0,
        inputTokens: st.inputTokens || 0,
        outputTokens: st.outputTokens || 0,
        totalTokens: totalTok,
        cacheHitTokens: st.cacheHitTokens || 0,
        cacheMissTokens: st.cacheMissTokens || 0,
        cacheHitRate,
        credit: round3(st.credit || 0),
        creditPerReq: st.requests > 0 ? round3((st.credit || 0) / st.requests) : 0,
        costPer1k: totalTok > 0 && st.credit > 0 ? round3(st.credit / totalTok * 1e3) : 0,
        avgTtfbMs: st.ttfbCount > 0 ? Math.round(st.ttfbSumMs / st.ttfbCount) : 0,
        avgLatencyMs: st.requests > 0 ? Math.round((st.latSumMs || 0) / st.requests) : 0,
        tokensPerSec: st.genSecSum > 0.05 ? round2((st.outputTokens || 0) / st.genSecSum) : 0,
        lastSeen: st.lastSeen || 0
      });
    }
    list.sort((a, b) => b.requests - a.requests);
    return list;
  }
  getStats(modelCatalogMap = null, targetDate = "") {
    const today = this.getTodayKey();
    const activeDate = targetDate && this.data.days[targetDate] ? targetDate : today;
    const dayData = this.data.days[activeDate] || {
      requests: 0,
      inputTokens: 0,
      outputTokens: 0,
      credit: 0,
      cacheHits: 0,
      hours: {},
      models: {},
      modelStats: {}
    };
    const dates = [];
    const now = /* @__PURE__ */ new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 864e5);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const item = this.data.days[k] || { requests: 0, inputTokens: 0, outputTokens: 0, credit: 0, cacheHits: 0 };
      const totalTokens = item.inputTokens + item.outputTokens;
      const hitRate = item.requests > 0 ? Math.round((item.cacheHits || 0) / item.requests * 100) : 0;
      dates.push({
        date: k.slice(5),
        fullDate: k,
        requests: item.requests,
        tokens: totalTokens,
        credit: round3(item.credit || 0),
        hitRate
      });
    }
    const hourly = [];
    for (let h = 0; h < 24; h++) {
      const sh = String(h);
      hourly.push({
        hour: `${sh}\u65F6`,
        tokens: dayData.hours?.[sh]?.tokens || 0,
        requests: dayData.hours?.[sh]?.requests || 0,
        credit: round3(dayData.hours?.[sh]?.credit || 0)
      });
    }
    const modelBreakdown = targetDate ? this._buildBreakdown(dayData.modelStats || {}, modelCatalogMap) : this._buildBreakdown(this.data.modelStats || {}, modelCatalogMap);
    return {
      activeDate,
      availableDates: this.getAvailableDates(),
      today: {
        requests: dayData.requests,
        inputTokens: dayData.inputTokens,
        outputTokens: dayData.outputTokens,
        totalTokens: dayData.inputTokens + dayData.outputTokens,
        credit: round3(dayData.credit || 0),
        models: dayData.models
      },
      summary: this.data.summary,
      trend7d: dates,
      hourly,
      modelBreakdown,
      recentLogs: this.getRecentLogs()
    };
  }
  /**
   * 重置本地用量统计账本
   */
  reset() {
    this.data = {
      days: {},
      modelStats: {},
      summary: {
        totalRequests: 0,
        totalSuccess: 0,
        totalFailed: 0,
        totalInputTokens: 0,
        totalOutputTokens: 0,
        totalCredit: 0
      }
    };
    this.recentLogs = [];
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
  const cacheHitTokens = Number(
    u.prompt_cache_hit_tokens ?? u.prompt_tokens_details?.cached_tokens ?? u.cache_read_input_tokens ?? u.cached_tokens ?? 0
  ) || 0;
  const cacheMissTokens = Number(u.prompt_cache_miss_tokens ?? 0) || 0;
  const cacheWriteTokens = Number(u.prompt_cache_write_tokens ?? 0) || 0;
  const hasCredit = typeof u.credit === "number" && !Number.isNaN(u.credit);
  const credit = hasCredit ? Number(u.credit) : 0;
  return {
    promptTokens,
    completionTokens,
    totalTokens,
    cachedTokens: cacheHitTokens,
    cacheHitTokens,
    cacheMissTokens,
    cacheWriteTokens,
    cacheHit: cacheHitTokens > 0,
    credit,
    hasCredit,
    quota: u.quota && typeof u.quota === "object" ? u.quota : null
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
    heartbeatMs = SSE_PING_INTERVAL_MS,
    startTime = Date.now(),
    transformErrorFrame = null
  } = opts;
  let buffer = "";
  let trailingCR = false;
  let lastActivityAt = Date.now();
  let stopped = false;
  let usagePromptTokens = 0;
  let usageCompletionTokens = 0;
  let usageCacheHitTokens = 0;
  let usageCacheMissTokens = 0;
  let usageCacheWriteTokens = 0;
  let usageCredit = 0;
  let hasCredit = false;
  let quota = null;
  let cacheHit = false;
  let sawContentChars = 0;
  let sawDone = false;
  let firstDataAt = 0;
  let lastDataAt = 0;
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
        const now = Date.now();
        if (!firstDataAt) firstDataAt = now;
        lastDataAt = now;
        const extracted = extractUsageFromPayload(parsed);
        if (extracted) {
          if (extracted.promptTokens > 0) usagePromptTokens = Math.max(usagePromptTokens, extracted.promptTokens);
          if (extracted.completionTokens > 0) usageCompletionTokens = Math.max(usageCompletionTokens, extracted.completionTokens);
          if (extracted.cacheHitTokens > 0) usageCacheHitTokens = Math.max(usageCacheHitTokens, extracted.cacheHitTokens);
          if (extracted.cacheMissTokens > 0) usageCacheMissTokens = Math.max(usageCacheMissTokens, extracted.cacheMissTokens);
          if (extracted.cacheWriteTokens > 0) usageCacheWriteTokens = Math.max(usageCacheWriteTokens, extracted.cacheWriteTokens);
          if (extracted.cacheHit) cacheHit = true;
          if (extracted.hasCredit) {
            hasCredit = true;
            usageCredit = Math.max(usageCredit, extracted.credit);
          }
          if (extracted.quota) quota = extracted.quota;
        }
        const choice0 = parsed.choices?.[0];
        const delta = choice0?.delta;
        if (delta) {
          if (typeof delta.content === "string") sawContentChars += delta.content.length;
          if (typeof delta.reasoning_content === "string") sawContentChars += delta.reasoning_content.length;
        }
      }
      if (parsed && parsed.error && typeof transformErrorFrame === "function") {
        const patched = transformErrorFrame(parsed);
        if (patched) {
          parsed = patched;
          rawFrame = `data: ${JSON.stringify(patched)}`;
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
      const ttfbMs = firstDataAt > startTime ? firstDataAt - startTime : 0;
      const genSec = lastDataAt > firstDataAt ? (lastDataAt - firstDataAt) / 1e3 : 0;
      const tokensPerSec = genSec > 0.05 && completionTokens > 0 ? Number((completionTokens / genSec).toFixed(1)) : 0;
      return {
        promptTokens: usagePromptTokens,
        completionTokens,
        totalTokens: usagePromptTokens + completionTokens,
        cacheHit,
        cacheHitTokens: usageCacheHitTokens,
        cacheMissTokens: usageCacheMissTokens,
        cacheWriteTokens: usageCacheWriteTokens,
        credit: usageCredit,
        hasCredit,
        quota,
        ttfbMs,
        tokensPerSec
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
import crypto6 from "node:crypto";
function genId(prefix = "msg") {
  return `${prefix}_${crypto6.randomBytes(10).toString("hex")}`;
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
  if (body.metadata && typeof body.metadata === "object") {
    openaiPayload.metadata = body.metadata;
  }
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
      if (parsed.error) {
        ended = true;
        closeActiveSimpleBlock();
        closeAllToolBlocks();
        sendAnthropicEvent(res, "error", {
          type: "error",
          error: {
            type: parsed.error.type || "api_error",
            message: parsed.error.message || "Upstream streaming error",
            ...parsed.error.gateway_hint ? { gateway_hint: parsed.error.gateway_hint } : {}
          }
        });
        if (!res.writableEnded) res.end();
        return;
      }
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
function estimateAnthropicInputTokens(body = {}) {
  let cjkChars = 0;
  let otherChars = 0;
  let imageTokens = 0;
  let messageOverhead = 0;
  const countText = (str) => {
    if (!str || typeof str !== "string") return;
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      if (code >= 19968 && code <= 40959) cjkChars++;
      else otherChars++;
    }
  };
  const countContent = (content) => {
    if (typeof content === "string") {
      countText(content);
      return;
    }
    if (!Array.isArray(content)) return;
    for (const block of content) {
      if (!block) continue;
      if (typeof block === "string") {
        countText(block);
      } else if (block.type === "text" || block.type === "thinking") {
        countText(block.text || block.thinking || "");
      } else if (block.type === "tool_use") {
        countText(block.name || "");
        countText(typeof block.input === "string" ? block.input : JSON.stringify(block.input || {}));
      } else if (block.type === "tool_result") {
        countContent(block.content);
      } else if (block.type === "image") {
        imageTokens += 1024;
      } else {
        countText(JSON.stringify(block));
      }
    }
  };
  if (body.system) countContent(body.system);
  if (Array.isArray(body.messages)) {
    for (const msg of body.messages) {
      messageOverhead += 4;
      if (msg?.content) countContent(msg.content);
    }
  }
  if (Array.isArray(body.tools) && body.tools.length > 0) {
    countText(JSON.stringify(body.tools));
  }
  return Math.max(1, Math.round(cjkChars * 0.7 + otherChars * 0.28 + messageOverhead + imageTokens));
}

// src/upstream/session.js
import crypto7 from "node:crypto";
var PROCESS_SALT = crypto7.randomBytes(16).toString("hex");
function contentSignature(content) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  let out = "";
  for (const part of content) {
    if (!part) continue;
    if (typeof part === "string") {
      out += part;
      continue;
    }
    const typ = String(part.type || "").trim();
    if (!typ || typ === "text") {
      out += part.text || "";
    } else {
      const hash = crypto7.createHash("sha256").update(JSON.stringify(part)).digest("hex").slice(0, 8);
      out += `[${typ}:${hash}]`;
    }
  }
  return out;
}
function extractSessionKey(reqHeaders = {}, body = {}) {
  const meta = body?.metadata && typeof body.metadata === "object" ? body.metadata : {};
  return meta.conversation_id || meta.conversationId || body?.conversation_id || body?.conversationId || reqHeaders["x-conversation-id"] || reqHeaders["x-session-id"] || body?.prompt_cache_key || "";
}
function resolveConversationId(reqHeaders = {}, body = {}) {
  const meta = body?.metadata && typeof body.metadata === "object" ? body.metadata : {};
  return meta.conversation_id || meta.conversationId || body?.conversation_id || body?.conversationId || reqHeaders["x-conversation-id"] || "";
}
function stickyFallbackKey(body = {}) {
  const meta = body?.metadata && typeof body.metadata === "object" ? body.metadata : {};
  if (meta.user_id || body?.user_id) return "";
  const msgs = Array.isArray(body?.messages) ? body.messages : [];
  for (const m of msgs) {
    if (m?.role !== "user") continue;
    const text = contentSignature(m.content).trim();
    if (!text) return "";
    const sum = crypto7.createHash("sha256").update(text).digest("hex").slice(0, 32);
    return `fb:${sum}`;
  }
  return "";
}
function turnKey(body = {}) {
  const msgs = Array.isArray(body?.messages) ? body.messages : [];
  for (let i = msgs.length - 1; i >= 0; i--) {
    if (msgs[i]?.role !== "user") continue;
    const sig = contentSignature(msgs[i].content);
    if (!sig) return "";
    return `u${i}:${sig}`;
  }
  return "";
}
function deriveTurnRequestId(sessionKey = "", tKey = "") {
  if (!tKey && !sessionKey) {
    return crypto7.randomBytes(16).toString("hex");
  }
  const combined = tKey && sessionKey ? `${sessionKey}:${tKey}` : tKey || sessionKey;
  return crypto7.createHash("sha256").update(`${PROCESS_SALT}|${combined}`).digest("hex").slice(0, 32);
}
function uuidForKey(key = "") {
  if (!key) return crypto7.randomUUID();
  const h = crypto7.createHash("sha256").update(`wb2a-uuid:${key}`).digest();
  h[6] = h[6] & 15 | 64;
  h[8] = h[8] & 63 | 128;
  const hex = h.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

// src/server/responses.js
import crypto8 from "node:crypto";
function genId2(prefix = "resp") {
  return `${prefix}_${crypto8.randomBytes(10).toString("hex")}`;
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

// src/server/ip-whitelist.js
import net from "node:net";
import os5 from "node:os";
function normalizeIP(ip = "") {
  let s = String(ip || "").trim();
  if (!s) return "";
  if (s.startsWith("[") && s.includes("]")) {
    s = s.slice(1, s.indexOf("]"));
  } else if (s.includes(":") && s.includes(".") && s.lastIndexOf(":") > s.lastIndexOf(".")) {
    s = s.slice(0, s.lastIndexOf(":"));
  }
  const zoneIdx = s.indexOf("%");
  if (zoneIdx !== -1) s = s.slice(0, zoneIdx);
  if (s.toLowerCase().startsWith("::ffff:")) {
    const mapped = s.slice(7);
    if (net.isIPv4(mapped)) return mapped;
  }
  return s;
}
function ipv4ToBigInt(ip) {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return null;
  return BigInt(parts[0]) << 24n | BigInt(parts[1]) << 16n | BigInt(parts[2]) << 8n | BigInt(parts[3]);
}
function ipv6ToBigInt(ip) {
  let expanded = ip.toLowerCase();
  if (expanded.includes("::")) {
    const halves = expanded.split("::");
    if (halves.length > 2) return null;
    const left = halves[0] ? halves[0].split(":") : [];
    const right = halves[1] ? halves[1].split(":") : [];
    const missing = 8 - (left.length + right.length);
    if (missing < 0) return null;
    expanded = [...left, ...Array(missing).fill("0"), ...right].join(":");
  }
  const groups = expanded.split(":");
  if (groups.length !== 8) return null;
  let val = 0n;
  for (const g of groups) {
    if (!/^[0-9a-f]{1,4}$/.test(g)) return null;
    val = val << 16n | BigInt(parseInt(g, 16));
  }
  return val;
}
function isLoopbackIP(ip) {
  const norm = normalizeIP(ip);
  if (!norm) return false;
  if (norm === "::1") return true;
  if (net.isIPv4(norm)) {
    return norm.startsWith("127.");
  }
  return false;
}
function isPrivateOrLinkLocalIP(ip) {
  const norm = normalizeIP(ip);
  if (!norm) return false;
  if (isLoopbackIP(norm)) return true;
  if (net.isIPv4(norm)) {
    const [a, b] = norm.split(".").map(Number);
    if (a === 10) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 169 && b === 254) return true;
    return false;
  }
  const low = norm.toLowerCase();
  return low.startsWith("fc") || low.startsWith("fd") || low.startsWith("fe80:");
}
function parseCIDREntry(rawEntry) {
  const tok = String(rawEntry || "").trim();
  if (!tok) return null;
  if (!tok.includes("/")) {
    const ip2 = normalizeIP(tok);
    const kind2 = net.isIP(ip2);
    if (!kind2) throw new Error(`\u65E0\u6548\u7684 IP \u5730\u5740: ${tok}`);
    const bits = kind2 === 4 ? 32 : 128;
    const val2 = kind2 === 4 ? ipv4ToBigInt(ip2) : ipv6ToBigInt(ip2);
    return { raw: ip2, version: kind2, bits, netVal: val2, mask: (1n << BigInt(bits)) - 1n };
  }
  const [rawIp, rawPrefix] = tok.split("/");
  const ip = normalizeIP(rawIp);
  const kind = net.isIP(ip);
  const prefix = Number(rawPrefix);
  const maxBits = kind === 4 ? 32 : 128;
  if (!kind || !Number.isInteger(prefix) || prefix < 0 || prefix > maxBits) {
    throw new Error(`\u65E0\u6548\u7684 CIDR \u7F51\u6BB5: ${tok}`);
  }
  const val = kind === 4 ? ipv4ToBigInt(ip) : ipv6ToBigInt(ip);
  const shift = BigInt(maxBits - prefix);
  const fullMask = (1n << BigInt(maxBits)) - 1n;
  const mask = prefix === 0 ? 0n : fullMask ^ (1n << shift) - 1n;
  return { raw: `${ip}/${prefix}`, version: kind, bits: prefix, netVal: val & mask, mask };
}
function parseWhitelistEntries(entries = []) {
  const tokens = [];
  for (const item of entries) {
    for (const part of String(item || "").split(/[\s,;]+/)) {
      const t = part.trim();
      if (t) tokens.push(t);
    }
  }
  const parsed = [];
  const normalized = [];
  const seen = /* @__PURE__ */ new Set();
  for (const tok of tokens) {
    const rule = parseCIDREntry(tok);
    if (rule && !seen.has(rule.raw)) {
      seen.add(rule.raw);
      parsed.push(rule);
      normalized.push(rule.raw);
    }
  }
  return { parsed, normalized };
}
function extractTrustedClientIP(req) {
  const rawRemote = normalizeIP(req?.socket?.remoteAddress || "");
  const trustedProxy = isLoopbackIP(rawRemote) || isPrivateOrLinkLocalIP(rawRemote);
  if (trustedProxy && req?.headers) {
    const xff = String(req.headers["x-forwarded-for"] || "");
    if (xff) {
      for (const part of xff.split(",")) {
        const cand = normalizeIP(part);
        if (net.isIP(cand)) return cand;
      }
    }
    const xrip = normalizeIP(req.headers["x-real-ip"] || "");
    if (net.isIP(xrip)) return xrip;
  }
  return rawRemote || "127.0.0.1";
}
function detectRuntimeIPs() {
  const ifs = os5.networkInterfaces();
  const ipv4s = [];
  const ipv6s = [];
  for (const list of Object.values(ifs)) {
    if (!Array.isArray(list)) continue;
    for (const item of list) {
      if (!item || item.internal) continue;
      if (item.family === "IPv4") {
        ipv4s.push(item.address);
      } else if (item.family === "IPv6" && !item.address.toLowerCase().startsWith("fe80:")) {
        ipv6s.push(item.address);
      }
    }
  }
  return [.../* @__PURE__ */ new Set([...ipv4s.sort(), ...ipv6s.sort()])];
}
function checkIPWhitelist(req, wlConfig = {}) {
  const clientIP = extractTrustedClientIP(req);
  if (!wlConfig || !wlConfig.enabled) {
    return { allowed: true, clientIP };
  }
  if (wlConfig.allowLocalhost !== false && isLoopbackIP(clientIP)) {
    return { allowed: true, clientIP };
  }
  const version = net.isIP(clientIP);
  if (!version) {
    return { allowed: false, clientIP };
  }
  const val = version === 4 ? ipv4ToBigInt(clientIP) : ipv6ToBigInt(clientIP);
  if (val === null) return { allowed: false, clientIP };
  try {
    const { parsed } = parseWhitelistEntries(wlConfig.allowedIPs || []);
    for (const rule of parsed) {
      if (rule.version === version && (val & rule.mask) === rule.netVal) {
        return { allowed: true, clientIP };
      }
    }
  } catch (_) {
  }
  return { allowed: false, clientIP };
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
    this.portalHandler = options.portalHandler || null;
    this.pluginRouterHandler = options.pluginRouterHandler || null;
    this.userManager = options.userManager || null;
    this.alertManager = options.alertManager || null;
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
  setPortalHandler(fn) {
    this.portalHandler = fn;
  }
  setPluginRouterHandler(fn) {
    this.pluginRouterHandler = fn;
  }
  _getRuntimeConfig() {
    const cfg = this.configStore ? this.configStore.getAll() : {};
    return {
      apiKey: cfg.apiKey ?? this.apiKey ?? "",
      aliases: { ...DEFAULT_MODEL_ALIASES, ...this.modelAliases || {}, ...cfg.aliases || {} },
      modelRoutes: cfg.modelRoutes && typeof cfg.modelRoutes === "object" ? cfg.modelRoutes : {},
      autoFreeEnabled: cfg.autoFreeEnabled !== false,
      portalAsHome: Boolean(cfg.portalAsHome),
      enabledModels: Array.isArray(cfg.enabledModels) ? cfg.enabledModels : [...this.enabledModels],
      freeModels: Array.isArray(cfg.freeModels) && cfg.freeModels.length > 0 ? cfg.freeModels : ["global:hy4free", "cn:hy4free", "global:hy3", "cn:hy3", "global:deepseek-v4.1-flash-sg"],
      promptMode: cfg.promptMode || "none",
      promptText: cfg.promptText || "",
      streamIdleTimeoutMs: Math.max(1e4, Number(cfg.streamIdleTimeoutMs || DEFAULT_STREAM_IDLE_TIMEOUT_MS)),
      ipWhitelist: cfg.ipWhitelist || { enabled: false, allowedIPs: [], allowLocalhost: true }
    };
  }
  getModelCatalogMap() {
    const map = /* @__PURE__ */ new Map();
    for (const m of this.getMergedModels(true)) {
      map.set(m.id, m);
      if (m.bareId && !map.has(m.bareId)) {
        map.set(m.bareId, m);
      }
    }
    return map;
  }
  _extractProvidedApiKey(req, url) {
    const authHeader = String(req.headers["authorization"] || "");
    const bearer = authHeader.toLowerCase().startsWith("bearer ") ? authHeader.slice(7).trim() : "";
    const xKey = String(req.headers["x-api-key"] || "").trim();
    const queryKey = url.searchParams.get("key") || "";
    return bearer || xKey || queryKey || "";
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
    const enabledRealms = new Set(enabledAccs.map((a) => a.auth?.realm || "cn"));
    const rawList = [
      ...Array.isArray(freeModels) ? freeModels : [],
      ...Array.isArray(modelRoutes["auto-free"]) ? modelRoutes["auto-free"] : [],
      ...Array.isArray(modelRoutes["free"]) ? modelRoutes["free"] : [],
      ...this.discoveredModels.filter((m) => m.isFree).map((m) => m.id),
      "global:hy4free",
      "cn:hy4free",
      "cn:deepseek-v4.1-flash",
      "global:deepseek-v4.1-flash-sg",
      "cn:glm-4-flash"
    ];
    const deduped = [];
    const seen = /* @__PURE__ */ new Set();
    for (const item of rawList) {
      const m = String(item || "").trim();
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
    const realmsSet = enabledRealms || new Set(accs.map((a) => a.auth?.realm || "cn"));
    for (const m of candidates) {
      if (this.scheduler.isRouteModelCooling(m)) {
        coolingModels.push(m);
        continue;
      }
      const r = m.startsWith("global:") ? "global" : m.startsWith("cn:") ? "cn" : null;
      const bare = m.replace(/^(cn:|global:|solo:|trae:)/i, "");
      const hasHealthyAcc = accs.some((a) => {
        const accRealm = a.auth?.realm || "cn";
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
    let target = String(requestedModel || "auto-free").trim() || "auto-free";
    const seen = /* @__PURE__ */ new Set();
    while (aliases[target] && !seen.has(target)) {
      seen.add(target);
      target = aliases[target];
    }
    if (target === "auto-free" || target === "free") {
      const list = this.getFreeModelCandidates();
      return list.length > 0 ? list : ["global:hy4free", "cn:hy4free"];
    }
    if (Array.isArray(modelRoutes[target]) && modelRoutes[target].length > 0) {
      return this.sortCandidatesByHealth([...modelRoutes[target]]);
    }
    const clean = target.replace(/^(cn:|global:)/i, "").toLowerCase();
    if (["hy4free", "hy4-free", "hunyuan-free", "hunyuan4-free"].includes(clean)) {
      const base = target.startsWith("cn:") ? ["cn:hy4free", "cn:hy4flash-exp1", "cn:hy4flash-exp2", "cn:hy4flash-exp3", "global:hy4free"] : ["global:hy4free", "cn:hy4free", "cn:hy4flash-exp1", "cn:hy4flash-exp2"];
      return this.sortCandidatesByHealth(base);
    }
    return [target];
  }
  resolveModel(requestedModel) {
    return this.resolveModelCandidates(requestedModel)[0] || "global:hy4free";
  }
  applyPromptMode(payload) {
    if (!Array.isArray(payload.messages)) return;
    const { promptMode, promptText } = this._getRuntimeConfig();
    if ((promptMode === "none" || promptMode === "passthrough" || promptMode === "append") && this.scheduler.degradeGate?.active()) {
      const rest = payload.messages.filter((m) => m?.role !== "system" && m?.role !== "developer");
      payload.messages = [{ role: "system", content: DEGRADED_SYSTEM_PROMPT }, ...rest];
      return;
    }
    if (!promptMode || promptMode === "none" || promptMode === "passthrough" || !promptText) {
      return;
    }
    if (promptMode === "replace" || promptMode === "custom") {
      const rest = payload.messages.filter((m) => m?.role !== "system" && m?.role !== "developer");
      payload.messages = [{ role: "system", content: promptText }, ...rest];
      return;
    }
    if (promptMode === "append") {
      let insertAt = 0;
      while (insertAt < payload.messages.length) {
        const r = String(payload.messages[insertAt]?.role || "").toLowerCase();
        if (r !== "system" && r !== "developer") break;
        insertAt++;
      }
      const next = [...payload.messages];
      next.splice(insertAt, 0, { role: "system", content: promptText });
      payload.messages = next;
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
          name: dm.name || existing.name,
          description: dm.description || existing.description,
          credits: dm.credits || existing.credits,
          rate: dm.rate && dm.rate !== "-" ? dm.rate : existing.rate,
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
          source: "upstream"
        });
      } else {
        merged.set(dm.id, {
          ...dm,
          badge: dm.badge || "\u65B0\u53D1\u73B0",
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
  getModelsList(includeDisabled = false, includeBare = false) {
    const { aliases, modelRoutes, autoFreeEnabled } = this._getRuntimeConfig();
    const formatModelEntry = (m, overrideId = null) => {
      const id = overrideId || m.id;
      const prefix = m.rate && m.rate !== "-" && m.rate !== "\u89C6\u9891" ? `[${m.rate} credit] ` : "";
      return {
        id,
        object: "model",
        created: 1726e6,
        owned_by: m.source === "discovered" || m.source === "upstream" ? "workbuddy-upstream" : "workbuddy2api",
        permission: [],
        root: m.id,
        parent: overrideId ? m.id : null,
        name: m.name,
        description: `${prefix}${m.description || m.name || ""}`.trim(),
        credits: m.credits || m.rate || "",
        multiplier: m.multiplier ?? null,
        is_free: Boolean(m.isFree),
        billing_rate: m.rate || "-",
        badge: m.badge || null,
        vendor: m.vendor || "",
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
        reasoning_default_effort: m.defaultEffort || "",
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
      const freeDesc = `[x0.00 credit] \u667A\u80FD\u514D\u8D39\u6A21\u578B\u81EA\u52A8\u8DEF\u7531\u6C60 (\u4F18\u5148: ${freeCandidates.slice(0, 5).join(" -> ")})`;
      for (const vid of ["auto-free", "free"]) {
        if (!list.some((m) => m.id === vid)) {
          list.push({
            id: vid,
            name: vid === "auto-free" ? "Auto Free (\u667A\u80FD\u514D\u8D39\u6A21\u578B\u8DEF\u7531\u6C60)" : "Free (\u667A\u80FD\u514D\u8D39\u8DEF\u7531\u522B\u540D)",
            description: freeDesc,
            object: "model",
            created: 17536e5,
            owned_by: "system",
            credits: "x0.00",
            multiplier: 0,
            is_free: true,
            billing_rate: "x0.00",
            context_length: 131072,
            max_output_tokens: 16384,
            supports_reasoning: true,
            supports_tool_call: true
          });
        }
      }
    }
    for (const [groupName, targets] of Object.entries(modelRoutes)) {
      if (groupName === "auto-free" || groupName === "free") continue;
      if (!Array.isArray(targets) || targets.length === 0) continue;
      if (!list.some((m) => m.id === groupName)) {
        list.push({
          id: groupName,
          name: `${groupName} (\u81EA\u5B9A\u4E49\u6A21\u578B\u6545\u969C\u8F6C\u79FB\u7EC4)`,
          description: `\u6545\u969C\u8F6C\u79FB\u961F\u5217: ${targets.join(" -> ")}`,
          object: "model",
          created: 17536e5,
          owned_by: "workbuddy2api-route",
          supports_tool_call: true
        });
      }
    }
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
  getPublicStatusSnapshot() {
    const allAcc = this.scheduler.store.getAll();
    const overall = this.scheduler.getCountsDetailed();
    const cnCounts = this.scheduler.getCountsDetailed("cn");
    const globalCounts = this.scheduler.getCountsDetailed("global");
    const stats = this.ledger.getStats(this.getModelCatalogMap());
    let totalRemain = 0;
    for (const acc of allAcc) {
      const cred = typeof acc.balance?.remain === "number" ? acc.balance.remain : typeof acc.remainCredits === "number" ? acc.remainCredits : 0;
      totalRemain += cred;
    }
    return {
      status: overall.healthy > 0 ? "ok" : "degraded",
      service: "dsh-workbuddy2api",
      version: SERVICE_VERSION,
      port: this.actualPort || this.preferredPort,
      total: overall.total,
      healthy: overall.healthy,
      cooling: overall.cooling,
      disabled: overall.disabled,
      manual_disabled: overall.manualDisabled,
      in_flight_full: overall.inFlightFull,
      remain: totalRemain,
      realm_totals: { cn: cnCounts, global: globalCounts },
      sticky_sessions: this.scheduler.stickyMap.size,
      discoveredModels: this.discoveredModels.length,
      waf_ip_blocked: this.scheduler.wafIPGate.active(),
      degrade_active: this.scheduler.degradeGate.active(),
      today: stats.today,
      uptimeSec: Math.floor((Date.now() - this.startedAt) / 1e3)
    };
  }
  getStatusPayload() {
    const base = this.getPublicStatusSnapshot();
    const accounts = this.scheduler.store.getAll().map((acc) => {
      const diag = this.scheduler.getAccountDiagnostics(acc.account.uid);
      return {
        uid: acc.account.uid,
        nickname: acc.account.nickname,
        realm: acc.auth?.realm || "cn",
        ...diag
      };
    });
    return { ...base, accounts, active: this.scheduler.store.activeUid };
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
        const runtimeCfg = this._getRuntimeConfig();
        const ipCheck = checkIPWhitelist(req, runtimeCfg.ipWhitelist);
        if (!ipCheck.allowed) {
          sendJson(res, 403, {
            error: {
              message: `Access denied by IP whitelist (client: ${ipCheck.clientIP})`,
              type: "access_denied",
              code: "ip_not_allowed"
            }
          });
          return;
        }
        if (req.method === "GET" && (pathname === "/ui/public/status" || pathname === "/plugins/dsh-workbuddy2api/public/status")) {
          sendJson(res, 200, {
            ok: true,
            ...this.getPublicStatusSnapshot(),
            models: this.getModelsList(false, false).slice(0, 80)
          });
          return;
        }
        if (req.method === "GET" && (pathname === "/portal" || pathname === "/" && runtimeCfg.portalAsHome) && typeof this.portalHandler === "function" && url.searchParams.get("format") !== "json") {
          const handled = await this.portalHandler(req, res, pathname, url);
          if (handled) return;
        }
        if (req.method === "GET" && (pathname === "/" || pathname === "/console" || pathname === "/dashboard") && typeof this.dashboardHandler === "function" && url.searchParams.get("format") !== "json") {
          const handled = await this.dashboardHandler(req, res, pathname, url);
          if (handled) return;
        }
        if (pathname.startsWith("/plugins/dsh-workbuddy2api/") && typeof this.pluginRouterHandler === "function") {
          const handled = await this.pluginRouterHandler(req, res, pathname, url);
          if (handled) return;
        }
        if (req.method === "GET" && (pathname === "/health" || pathname === "/")) {
          const allAcc = this.scheduler.store.getAll();
          sendJson(res, 200, {
            status: "ok",
            service: "dsh-workbuddy2api",
            version: SERVICE_VERSION,
            port: this.actualPort || this.preferredPort,
            accounts: allAcc.length,
            enabledAccounts: allAcc.filter((a) => !this.scheduler.isAccountUnavailable(a)).length,
            active: this.scheduler.store.activeUid,
            discoveredModels: this.discoveredModels.length,
            uptimeSec: Math.floor((Date.now() - this.startedAt) / 1e3)
          });
          return;
        }
        if (req.method === "GET" && pathname === "/healthz") {
          const snap = this.getPublicStatusSnapshot();
          res.setHeader("X-Service", "dsh-workbuddy2api");
          sendJson(res, snap.healthy > 0 ? 200 : 503, {
            healthy: snap.healthy,
            total: snap.total,
            service: "dsh-workbuddy2api",
            realm_servable: {
              cn: snap.realm_totals.cn.healthy > 0,
              global: snap.realm_totals.global.healthy > 0
            }
          });
          return;
        }
        if (!this.checkAuth(req, url)) {
          const authErr = req._authError || { status: 401, message: "Invalid or missing gateway API key" };
          sendJson(res, authErr.status, {
            error: {
              message: authErr.message,
              type: authErr.status === 429 ? "rate_limit_error" : "authentication_error"
            }
          });
          return;
        }
        if (req.method === "GET" && pathname === "/status") {
          sendJson(res, 200, this.getStatusPayload());
          return;
        }
        const adminMatch = pathname.match(/^\/admin\/accounts\/([^/]+)\/(disable|enable|revive)$/);
        if (req.method === "POST" && adminMatch) {
          const targetUid = decodeURIComponent(adminMatch[1]);
          const action = adminMatch[2];
          const body = await readJsonBody(req, res) || {};
          let op = null;
          if (action === "disable") {
            op = this.scheduler.store.setManualDisabled(targetUid, true, body.reason || "manual");
          } else if (action === "enable") {
            op = this.scheduler.store.setManualDisabled(targetUid, false, "");
          } else {
            op = this.scheduler.store.reviveAccount(targetUid);
            this.scheduler.clearCooldown(targetUid);
          }
          if (!op || !op.found) {
            sendJson(res, 404, { error: { message: `account not found: ${targetUid}`, type: "not_found" } });
            return;
          }
          sendJson(res, 200, {
            uid: targetUid,
            manual_disabled: Boolean(op.acc.manualDisabled),
            manual_reason: op.acc.manualDisabledReason || "",
            disabled: Boolean(op.acc.disabled),
            changed: Boolean(op.changed)
          });
          return;
        }
        if (req.method === "GET" && pathname === "/v1/stats") {
          const allAcc = this.scheduler.store.getAll();
          const dateParam = url.searchParams.get("date") || "";
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
        if (req.method === "POST" && pathname === "/v1/stats/reset") {
          this.ledger.reset();
          sendJson(res, 200, { ok: true, message: "\u7528\u91CF\u8D26\u672C\u5DF2\u6E05\u7A7A" });
          return;
        }
        if (req.method === "GET" && (pathname === "/v1/models" || pathname === "/models")) {
          const includeAll = url.searchParams.get("all") === "1";
          const ua = String(req.headers["user-agent"] || "").toLowerCase();
          const includeBare = url.searchParams.get("bare") === "true" || req.headers["x-include-bare-models"] === "true" || /new-api|one-api|openai|langchain/.test(ua);
          sendJson(res, 200, {
            object: "list",
            data: this.getModelsList(includeAll, includeBare)
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
        if (req.method === "POST" && (pathname === "/v1/messages/count_tokens" || pathname === "/messages/count_tokens")) {
          const body = await readJsonBody(req, res);
          if (!body) return;
          sendJson(res, 200, { input_tokens: estimateAnthropicInputTokens(body) });
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
  _handleObservedUsageCost(accUid, modelId, modelMeta, usage, sessionKey) {
    if (!accUid || !usage) return;
    const quota = usage.quota;
    const isFree = Boolean(modelMeta?.isFree);
    if (!isFree) return;
    const charged = Boolean(usage.hasCredit && usage.credit > 0);
    const quotaFull = Boolean(quota && Number(quota.percent || 0) >= 100);
    if (!charged && !quotaFull) return;
    const resetAtMs = parseQuotaResetAt(quota);
    const bare = String(modelId || "").replace(/^(cn:|global:|solo:|trae:)/i, "");
    const reason = `free quota exhausted (credit=${Number(usage.credit || 0).toFixed(2)}, quota=${Number(quota?.percent || 0)}%)`;
    const targets = /* @__PURE__ */ new Set([bare]);
    if (Array.isArray(quota?.shared_models)) {
      for (const sm of quota.shared_models) {
        const cleanSm = String(sm || "").trim();
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
  async executeChatPipeline(req, res, body, protocol = "chat", requestedModel = "") {
    const rawModel = requestedModel || body.model || "auto-free";
    const candidates = this.resolveModelCandidates(rawModel);
    const baseBody = { ...body };
    const reqHasImage = requestHasImagePart(baseBody);
    const isStream = Boolean(baseBody.stream);
    const reqId = `chatcmpl-${Date.now()}`;
    const runtimeCfg = this._getRuntimeConfig();
    const explicitSession = extractSessionKey(req.headers, baseBody);
    const sessionKey = explicitSession || stickyFallbackKey(baseBody) || "";
    const tKey = turnKey(baseBody);
    const derivedReqId = req.headers["x-conversation-request-id"] || deriveTurnRequestId(sessionKey, tKey);
    const conversationId = resolveConversationId(req.headers, baseBody) || (sessionKey ? uuidForKey(sessionKey) : "");
    const meta = {
      conversationId,
      conversationRequestId: derivedReqId,
      traceId: req.headers["x-trace-id"]
    };
    const reqStartedAt = Date.now();
    const catalogMap = this.getModelCatalogMap();
    const reqUser = req._wbUser || null;
    let actualModel = candidates[0] || "global:hy4free";
    let modelMeta = catalogMap.get(actualModel) || catalogMap.get(actualModel.replace(/^(cn:|global:)/i, ""));
    let modelRate = modelMeta?.rate || "-";
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
        modelMeta = catalogMap.get(actualModel) || catalogMap.get(actualModel.replace(/^(cn:|global:)/i, ""));
        modelRate = modelMeta?.rate || "-";
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
                  ...await this.client.chatStream(account, workingBody, ctrl.signal, meta),
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
                console.warn(`[loopback] 11115 \u4E0A\u4E0B\u6587\u8D85\u9650\uFF0C\u81EA\u52A8\u88C1\u526A\u6700\u65E9\u5BF9\u8BDD\u8F6E\u6B21\u62A2\u6551\u91CD\u8BD5 (${pruneAttempts}/2)...`);
                continue;
              }
            }
            lastCandErr = innerErr;
            if (innerErr.kind === ErrKind.CONTENT_BLOCKED || innerErr.kind === ErrKind.IMAGE_INVALID || innerErr.kind === ErrKind.PROMPT_TOO_LONG || innerErr.kind === ErrKind.BAD_PARAMS || innerErr.code === "waf_ip_blocked") {
              throw innerErr;
            }
            if (candIdx < candidates.length - 1) {
              this.scheduler.tripRouteModel(candModel, 6e4);
              console.warn(`[failover] \u5019\u9009\u6A21\u578B ${candModel} \u4E0D\u53EF\u7528 (${innerErr.message})\uFF0C\u81EA\u52A8\u5207\u6362\u81F3 ${candidates[candIdx + 1]}`);
            }
            break;
          }
        }
        if (execution) break;
      }
      if (!execution) {
        throw lastCandErr || new Error("all accounts and candidate models are unavailable, please retry later");
      }
      const accUid = execution.account?.account?.uid || "";
      const accNick = execution.account?.account?.nickname || accUid.slice(0, 8) || "-";
      const accRealm = execution.account?.auth?.realm || "-";
      this.scheduler.beginInFlight(reqId, {
        uid: accUid,
        nickname: accNick,
        realm: accRealm,
        model: actualModel,
        rate: modelRate,
        mode: isStream ? "stream" : "sync",
        protocol
      });
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
          const durationMs2 = Date.now() - reqStartedAt;
          this.ledger.record(actualModel, 20, 60, false, { durationMs: durationMs2, success: true });
          this.ledger.addRequestLog({
            model: actualModel,
            rate: modelRate,
            mode: isStream ? "stream" : "sync",
            protocol,
            status: 200,
            uid: accUid,
            account: accNick,
            realm: accRealm,
            ttfbMs: 0,
            durationMs: durationMs2,
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
            reader.cancel().catch(() => {
            });
          }, idleMs);
          if (idleTimer.unref) idleTimer.unref();
        }
      };
      const onResClose = () => {
        if (!res.writableEnded) {
          clientClosed = true;
          execution.abortController?.abort?.();
          reader.cancel().catch(() => {
          });
        }
      };
      res.on("close", onResClose);
      const hintCtx = {
        model: actualModel.replace(/^(cn:|global:)/i, ""),
        hasImage: reqHasImage,
        modelInCatalog: Boolean(modelMeta),
        modelSupportsImages: Boolean(modelMeta?.supportsImages ?? true)
      };
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
          startTime: reqStartedAt,
          transformErrorFrame: (errParsed) => injectFrameGatewayHint(errParsed, hintCtx, (st, txt) => this.client.classifyError(st, txt)),
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
          res.off("close", onResClose);
          this.scheduler.endInFlight(reqId);
          execution.release();
          const u = pump.getUsage();
          if (this.userManager && reqUser && u.hasCredit && u.credit > 0) {
            this.userManager.deductUserCredit(reqUser, u.credit);
          }
          this._handleObservedUsageCost(accUid, actualModel, modelMeta, u, sessionKey);
          const durationMs2 = Date.now() - reqStartedAt;
          this.ledger.record(actualModel, u.promptTokens, u.completionTokens, u.cacheHit, {
            ...u,
            durationMs: durationMs2,
            success: !clientClosed
          });
          this.ledger.addRequestLog({
            model: actualModel,
            rate: modelRate,
            mode: "stream",
            protocol,
            status: 200,
            uid: accUid,
            account: accNick,
            realm: accRealm,
            ...u,
            durationMs: durationMs2
          });
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
        startTime: reqStartedAt,
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
        res.off("close", onResClose);
        this.scheduler.endInFlight(reqId);
        execution.release();
      }
      let assembledCalls = [...toolCalls.entries()].sort((a, b) => a[0] - b[0]).map(([, v]) => ({
        id: v.id || `call_${Date.now()}`,
        type: v.type || "function",
        function: {
          name: v.function.name,
          arguments: v.function.arguments || ""
        }
      }));
      assembledCalls = dropTruncatedToolCalls(assembledCalls).map((c) => ({
        ...c,
        function: { ...c.function, arguments: c.function.arguments || "{}" }
      }));
      const message = {
        role: "assistant",
        content: assembledCalls.length > 0 && !fullText ? null : fullText
      };
      if (reasoningText) message.reasoning_content = reasoningText;
      if (assembledCalls.length > 0) {
        message.tool_calls = assembledCalls;
        if (finishReason === "stop") finishReason = "tool_calls";
      }
      const usage = aggPump.getUsage();
      if (this.userManager && reqUser && usage.hasCredit && usage.credit > 0) {
        this.userManager.deductUserCredit(reqUser, usage.credit);
      }
      this._handleObservedUsageCost(accUid, actualModel, modelMeta, usage, sessionKey);
      const durationMs = Date.now() - reqStartedAt;
      const completionObj = {
        id: reqId,
        object: "chat.completion",
        created: Math.floor(Date.now() / 1e3),
        model: rawModel,
        choices: [{ index: 0, message, finish_reason: finishReason }],
        usage: {
          prompt_tokens: usage.promptTokens,
          completion_tokens: usage.completionTokens,
          total_tokens: usage.promptTokens + usage.completionTokens,
          ...usage.hasCredit ? { credit: usage.credit, cost_credits: usage.credit } : {}
        }
      };
      if (protocol === "anthropic") {
        sendJson(res, 200, openAIToAnthropicResponse(completionObj, rawModel));
      } else if (protocol === "responses") {
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
        mode: "sync",
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
      const status = err.status && err.status >= 400 && err.status < 600 ? err.status : err.kind === ErrKind.SOFT_RATE ? 429 : 503;
      if (err.retryAfterSec > 0 && !res.headersSent) {
        res.setHeader("Retry-After", String(err.retryAfterSec));
      }
      const errKind = err.kind || ErrKind.NONE;
      const gatewayHint = getGatewayHint(errKind, err.message, {
        model: actualModel.replace(/^(cn:|global:)/i, ""),
        hasImage: reqHasImage,
        modelInCatalog: Boolean(modelMeta),
        modelSupportsImages: Boolean(modelMeta?.supportsImages ?? true)
      }) || NO_HEALTHY_ACCOUNT_HINT;
      const durationMs = Date.now() - reqStartedAt;
      this.ledger.record(actualModel, 0, 0, false, { durationMs, success: false });
      this.ledger.addRequestLog({
        model: actualModel,
        rate: modelRate,
        mode: isStream ? "stream" : "sync",
        protocol,
        status,
        uid: "-",
        account: "-",
        realm: "-",
        durationMs,
        error: err.message
      });
      if (!res.headersSent) {
        if (protocol === "anthropic") {
          sendJson(res, status, {
            type: "error",
            error: {
              type: err.code || "api_error",
              message: err.message,
              gateway_hint: gatewayHint
            }
          });
        } else {
          sendJson(res, status, {
            error: {
              message: err.message,
              type: err.code || "api_error",
              code: err.code || (status === 429 ? "rate_limit_exceeded" : "no_healthy_account"),
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

// src/server/alerts.js
function maskWebhookUrl(u = "") {
  if (u.length <= 20) return u;
  return `${u.slice(0, 15)}...${u.slice(-5)}`;
}
function formatWebhookPayload(url, text, event = "alert") {
  const lower = String(url || "").toLowerCase();
  if (lower.includes("feishu.cn") || lower.includes("larksuite.com")) {
    return { msg_type: "text", content: { text } };
  }
  if (lower.includes("qyapi.weixin.qq.com") || lower.includes("dingtalk.com")) {
    return { msgtype: "text", text: { content: text } };
  }
  if (lower.includes("api.telegram.org")) {
    return { text };
  }
  if (lower.includes("discord.com/api/webhooks") || lower.includes("discordapp.com/api/webhooks")) {
    return { content: text };
  }
  return {
    event,
    text,
    timestamp: Math.floor(Date.now() / 1e3)
  };
}
var AlertManager = class {
  constructor(options = {}) {
    this.configStore = options.configStore || null;
    this.fetchFn = options.fetchFn || fetch;
    this.lastAlertAt = /* @__PURE__ */ new Map();
    this.history = [];
  }
  getConfig() {
    const cfg = this.configStore ? this.configStore.getAll() : {};
    const alerts = cfg.alerts || {};
    return {
      enabled: Boolean(alerts.enabled),
      webhooks: Array.isArray(alerts.webhooks) ? alerts.webhooks.filter(Boolean) : [],
      events: Array.isArray(alerts.events) && alerts.events.length > 0 ? alerts.events : ["ban", "401", "cooling", "low_credit"],
      minCredit: Math.max(0, Number(alerts.minCredit ?? 50) || 0)
    };
  }
  isEventAllowed(event) {
    const cfg = this.getConfig();
    if (!cfg.enabled || cfg.webhooks.length === 0) return false;
    if (cfg.events.length === 0) return true;
    return cfg.events.some((e) => String(e).toLowerCase() === String(event).toLowerCase());
  }
  _shouldThrottle(key, intervalMs) {
    const now = Date.now();
    const last = this.lastAlertAt.get(key) || 0;
    if (now - last < intervalMs) return true;
    this.lastAlertAt.set(key, now);
    if (this.lastAlertAt.size > 500) {
      const firstKey = this.lastAlertAt.keys().next().value;
      this.lastAlertAt.delete(firstKey);
    }
    return false;
  }
  _recordHistory(event, summary, results) {
    this.history.unshift({
      id: `alt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      event,
      summary: summary.slice(0, 200),
      time: (/* @__PURE__ */ new Date()).toISOString(),
      results
    });
    if (this.history.length > 30) {
      this.history.length = 30;
    }
  }
  async _sendSingleWebhook(rawUrl, text, event) {
    const payload = formatWebhookPayload(rawUrl, text, event);
    const res = await this.fetchFn(rawUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8e3)
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return true;
  }
  async dispatch(text, event = "alert") {
    const { webhooks } = this.getConfig();
    if (webhooks.length === 0) {
      return { ok: false, results: [{ target: "-", ok: false, error: "\u672A\u914D\u7F6E\u4EFB\u4F55 Webhook \u5730\u5740" }] };
    }
    const results = [];
    for (const url of webhooks) {
      try {
        await this._sendSingleWebhook(url, text, event);
        results.push({ target: maskWebhookUrl(url), ok: true });
      } catch (err) {
        console.warn(`[alert] webhook \u53D1\u9001\u5931\u8D25 (${maskWebhookUrl(url)}): ${err.message}`);
        results.push({ target: maskWebhookUrl(url), ok: false, error: err.message });
      }
    }
    this._recordHistory(event, text, results);
    return { ok: results.some((r) => r.ok), results };
  }
  notifyBan(uid, nick, reason) {
    if (!this.isEventAllowed("ban")) return;
    if (this._shouldThrottle(`ban:${uid}`, 15 * 60 * 1e3)) return;
    const msg = `\u{1F6A8}\u3010DSH-WorkBuddy2API \u544A\u8B66\u3011\u8D26\u53F7\u5F02\u5E38\u5C01\u7981/\u505C\u7528
\u2022 \u8D26\u53F7: ${nick || "-"} (${uid})
\u2022 \u539F\u56E0: ${reason}
\u2022 \u65F6\u95F4: ${(/* @__PURE__ */ new Date()).toLocaleString("zh-CN", { hour12: false })}
\u2022 \u5EFA\u8BAE: \u8BF7\u5728\u63A7\u5236\u53F0\u68C0\u67E5\u8D26\u53F7\u72B6\u6001\u6216\u91CD\u65B0\u6388\u6743 Token\u3002`;
    this.dispatch(msg, "ban").catch(() => {
    });
  }
  notifyAuthFailed(uid, nick, errMsg) {
    if (!this.isEventAllowed("401")) return;
    if (this._shouldThrottle(`401:${uid}`, 15 * 60 * 1e3)) return;
    const msg = `\u26A0\uFE0F\u3010DSH-WorkBuddy2API \u544A\u8B66\u3011\u8D26\u53F7\u51ED\u8BC1\u5931\u6548 (401/12153)
\u2022 \u8D26\u53F7: ${nick || "-"} (${uid})
\u2022 \u9519\u8BEF: ${String(errMsg || "").slice(0, 180)}
\u2022 \u65F6\u95F4: ${(/* @__PURE__ */ new Date()).toLocaleString("zh-CN", { hour12: false })}`;
    this.dispatch(msg, "401").catch(() => {
    });
  }
  notifyAllCooling(realm, model) {
    if (!this.isEventAllowed("cooling")) return;
    if (this._shouldThrottle(`cooling:${realm || "all"}:${model}`, 10 * 60 * 1e3)) return;
    const msg = `\u{1F525}\u3010DSH-WorkBuddy2API \u544A\u8B66\u3011\u5168\u6C60\u51B7\u5374/\u65E0\u53EF\u7528\u5065\u5EB7\u8D26\u53F7
\u2022 \u57DF: ${realm || "all"}
\u2022 \u6A21\u578B: ${model}
\u2022 \u65F6\u95F4: ${(/* @__PURE__ */ new Date()).toLocaleString("zh-CN", { hour12: false })}
\u2022 \u5EFA\u8BAE: \u8BF7\u8865\u5145\u540C\u57DF\u8D26\u53F7\u6216\u5F00\u542F auto-free \u591A\u6A21\u578B\u515C\u5E95\u3002`;
    this.dispatch(msg, "cooling").catch(() => {
    });
  }
  notifyLowCredit(uid, nick, remainCredits) {
    if (!this.isEventAllowed("low_credit")) return;
    const { minCredit } = this.getConfig();
    if (remainCredits >= minCredit) return;
    if (this._shouldThrottle(`low_credit:${uid}`, 60 * 60 * 1e3)) return;
    const msg = `\u{1F4B0}\u3010DSH-WorkBuddy2API \u544A\u8B66\u3011\u8D26\u53F7\u79EF\u5206\u4F4E\u4E8E\u9884\u8B66\u9608\u503C
\u2022 \u8D26\u53F7: ${nick || "-"} (${uid})
\u2022 \u5269\u4F59\u79EF\u5206: ${remainCredits} (< \u9608\u503C ${minCredit})
\u2022 \u65F6\u95F4: ${(/* @__PURE__ */ new Date()).toLocaleString("zh-CN", { hour12: false })}`;
    this.dispatch(msg, "low_credit").catch(() => {
    });
  }
  async sendTestAlert() {
    const msg = `\u{1F514}\u3010DSH-WorkBuddy2API \u6D4B\u8BD5\u901A\u77E5\u3011
\u2022 \u72B6\u6001: Webhook \u544A\u8B66\u901A\u9053\u8FDE\u901A\u6B63\u5E38
\u2022 \u65F6\u95F4: ${(/* @__PURE__ */ new Date()).toLocaleString("zh-CN", { hour12: false })}`;
    return this.dispatch(msg, "test");
  }
};

// src/server/auth-users.js
import fs7 from "node:fs";
import path6 from "node:path";
import os6 from "node:os";
import crypto9 from "node:crypto";
var SESSION_COOKIE_NAME = "wb2a_session";
var SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1e3;
function generateRandomHex(bytes = 16) {
  return crypto9.randomBytes(bytes).toString("hex");
}
function generateUserApiKey() {
  return `sk-wb2a-${generateRandomHex(20)}`;
}
function hashPassword(password, salt) {
  return crypto9.createHash("sha256").update(`${salt}:${password}`).digest("hex");
}
function getTodayCST() {
  return new Date(Date.now() + 8 * 3600 * 1e3).toISOString().slice(0, 10);
}
function parseCookies(req) {
  const raw = String(req?.headers?.cookie || "");
  const map = {};
  for (const part of raw.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (k) {
      try {
        map[k] = decodeURIComponent(v);
      } catch (_) {
        map[k] = v;
      }
    }
  }
  return map;
}
var UserManager = class {
  constructor(options = {}) {
    this.dshHome = options.dshHome || process.env.DSH_HOME || path6.join(os6.homedir(), ".dsh");
    this.configStore = options.configStore || null;
    this.filePath = path6.join(this.dshHome, ".workbuddy2api-users.json");
    this.users = /* @__PURE__ */ new Map();
    this.byApiKey = /* @__PURE__ */ new Map();
    this.sessions = /* @__PURE__ */ new Map();
    this.rpmBuckets = /* @__PURE__ */ new Map();
    this.loginFailures = /* @__PURE__ */ new Map();
    this._load();
  }
  _load() {
    try {
      if (fs7.existsSync(this.filePath)) {
        const raw = JSON.parse(fs7.readFileSync(this.filePath, "utf8"));
        const list = Array.isArray(raw?.users) ? raw.users : [];
        for (const u of list) {
          if (!u?.username) continue;
          const norm = this._normalizeUser(u);
          this.users.set(norm.username, norm);
          if (norm.apiKey) this.byApiKey.set(norm.apiKey, norm);
        }
      }
    } catch (_) {
    }
    if (!this.users.has("admin")) {
      this._initDefaultAdmin();
    }
  }
  _normalizeUser(u) {
    return {
      id: u.id || `u_${generateRandomHex(6)}`,
      username: String(u.username).trim().toLowerCase(),
      passwordHash: u.passwordHash || "",
      salt: u.salt || generateRandomHex(16),
      role: u.role === "admin" ? "admin" : "user",
      apiKey: u.apiKey || generateUserApiKey(),
      disabled: Boolean(u.disabled),
      createdAt: u.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
      dailyCreditLimit: Math.max(0, Number(u.dailyCreditLimit || 0) || 0),
      usedCreditToday: Math.max(0, Number(u.usedCreditToday || 0) || 0),
      lastCreditDay: u.lastCreditDay || getTodayCST(),
      rpm: Math.max(0, Number(u.rpm || 0) || 0)
    };
  }
  _initDefaultAdmin() {
    const cfg = this.configStore ? this.configStore.getAll() : {};
    const salt = generateRandomHex(16);
    const pw = cfg.webPassword || "";
    const admin = {
      id: "u_admin",
      username: "admin",
      passwordHash: pw ? hashPassword(pw, salt) : "",
      salt,
      role: "admin",
      apiKey: cfg.apiKey || generateUserApiKey(),
      disabled: false,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      dailyCreditLimit: 0,
      usedCreditToday: 0,
      lastCreditDay: getTodayCST(),
      rpm: 0
    };
    this.users.set("admin", admin);
    this.byApiKey.set(admin.apiKey, admin);
    this._save();
  }
  _save() {
    try {
      if (!fs7.existsSync(this.dshHome)) {
        fs7.mkdirSync(this.dshHome, { recursive: true });
      }
      const data = { users: [...this.users.values()] };
      fs7.writeFileSync(this.filePath, JSON.stringify(data, null, 2), { mode: 384 });
    } catch (_) {
    }
  }
  hasWebPassword() {
    const cfgPw = this.configStore?.get("webPassword");
    const admin = this.users.get("admin");
    return Boolean(cfgPw && cfgPw.length > 0 || admin?.passwordHash);
  }
  setAdminPassword(newPassword = "") {
    const admin = this.users.get("admin") || this._normalizeUser({ username: "admin", role: "admin", id: "u_admin" });
    if (!newPassword) {
      admin.passwordHash = "";
    } else {
      admin.salt = generateRandomHex(16);
      admin.passwordHash = hashPassword(newPassword, admin.salt);
    }
    this.users.set("admin", admin);
    if (this.configStore) {
      this.configStore.update({ webPassword: newPassword });
    }
    this._save();
    return { hasPassword: Boolean(newPassword) };
  }
  listUsers() {
    const today = getTodayCST();
    return [...this.users.values()].map((u) => {
      const usedToday = u.lastCreditDay === today ? u.usedCreditToday : 0;
      return {
        id: u.id,
        username: u.username,
        role: u.role,
        apiKey: u.apiKey,
        disabled: u.disabled,
        createdAt: u.createdAt,
        dailyCreditLimit: u.dailyCreditLimit,
        usedCreditToday: Number(usedToday.toFixed(2)),
        rpm: u.rpm
      };
    });
  }
  authenticate(username, password, clientIP = "127.0.0.1") {
    const now = Date.now();
    const fail = this.loginFailures.get(clientIP);
    if (fail && fail.lockedUntil > now) {
      const waitSec = Math.ceil((fail.lockedUntil - now) / 1e3);
      throw new Error(`\u5C1D\u8BD5\u8FC7\u4E8E\u9891\u7E41\uFF0C\u8BF7 ${waitSec} \u79D2\u540E\u518D\u8BD5`);
    }
    const uname = String(username || "").trim().toLowerCase();
    const user = this.users.get(uname);
    if (!user) {
      this._recordLoginFail(clientIP);
      throw new Error("\u7528\u6237\u540D\u6216\u5BC6\u7801\u9519\u8BEF");
    }
    if (user.disabled) {
      throw new Error("\u8D26\u53F7\u5DF2\u88AB\u7BA1\u7406\u5458\u7981\u7528");
    }
    const cfgPw = this.configStore?.get("webPassword") || "";
    const adminBypass = uname === "admin" && !user.passwordHash && !cfgPw;
    let ok = adminBypass;
    if (!ok) {
      if (uname === "admin" && cfgPw && password === cfgPw) {
        ok = true;
      } else if (user.passwordHash) {
        const expected = hashPassword(password || "", user.salt);
        ok = expected === user.passwordHash;
      }
    }
    if (!ok) {
      this._recordLoginFail(clientIP);
      throw new Error("\u7528\u6237\u540D\u6216\u5BC6\u7801\u9519\u8BEF");
    }
    this.loginFailures.delete(clientIP);
    const token = generateRandomHex(24);
    this.sessions.set(token, {
      username: user.username,
      userId: user.id,
      role: user.role,
      expiresAt: now + SESSION_TTL_MS
    });
    if (this.sessions.size > 1e3) {
      for (const [k, s] of this.sessions.entries()) {
        if (s.expiresAt < now) this.sessions.delete(k);
      }
    }
    return { token, user: this._sanitizeUser(user) };
  }
  _recordLoginFail(ip) {
    const now = Date.now();
    const cur = this.loginFailures.get(ip) || { count: 0, lockedUntil: 0 };
    cur.count += 1;
    if (cur.count >= 6) {
      cur.lockedUntil = now + 5 * 60 * 1e3;
      cur.count = 0;
    }
    this.loginFailures.set(ip, cur);
  }
  _sanitizeUser(u) {
    const today = getTodayCST();
    return {
      id: u.id,
      username: u.username,
      role: u.role,
      apiKey: u.apiKey,
      disabled: u.disabled,
      dailyCreditLimit: u.dailyCreditLimit,
      usedCreditToday: u.lastCreditDay === today ? u.usedCreditToday : 0,
      rpm: u.rpm
    };
  }
  getSessionUser(req) {
    const cookies = parseCookies(req);
    const token = cookies[SESSION_COOKIE_NAME] || req?.headers?.["x-session-token"] || "";
    if (!token) return null;
    const sess = this.sessions.get(token);
    if (!sess) return null;
    if (sess.expiresAt < Date.now()) {
      this.sessions.delete(token);
      return null;
    }
    const u = this.users.get(sess.username);
    if (!u || u.disabled) return null;
    return this._sanitizeUser(u);
  }
  logout(req) {
    const cookies = parseCookies(req);
    const token = cookies[SESSION_COOKIE_NAME] || req?.headers?.["x-session-token"] || "";
    if (token) this.sessions.delete(token);
  }
  checkWebAuth(req) {
    if (!this.hasWebPassword()) {
      const admin = this.users.get("admin");
      return { ok: true, user: admin ? this._sanitizeUser(admin) : { id: "u_admin", username: "admin", role: "admin" } };
    }
    const user = this.getSessionUser(req);
    if (!user) return { ok: false, user: null };
    return { ok: true, user };
  }
  createUser({ username, password, role = "user", dailyCreditLimit = 0, rpm = 0 }) {
    const uname = String(username || "").trim().toLowerCase();
    if (!uname || uname.length < 2 || !/^[a-z0-9_.-]+$/.test(uname)) {
      throw new Error("\u7528\u6237\u540D\u683C\u5F0F\u975E\u6CD5 (\u4EC5\u9650 2 \u4F4D\u4EE5\u4E0A\u5B57\u6BCD/\u6570\u5B57/._-)");
    }
    if (this.users.has(uname)) {
      throw new Error(`\u7528\u6237\u540D ${uname} \u5DF2\u5B58\u5728`);
    }
    if (!password || String(password).length < 4) {
      throw new Error("\u5BC6\u7801\u957F\u5EA6\u81F3\u5C11 4 \u4F4D");
    }
    const salt = generateRandomHex(16);
    const user = this._normalizeUser({
      id: `u_${generateRandomHex(6)}`,
      username: uname,
      passwordHash: hashPassword(password, salt),
      salt,
      role: role === "admin" ? "admin" : "user",
      apiKey: generateUserApiKey(),
      dailyCreditLimit,
      rpm
    });
    this.users.set(uname, user);
    this.byApiKey.set(user.apiKey, user);
    this._save();
    return this._sanitizeUser(user);
  }
  toggleUser(username, disabled) {
    const u = this.users.get(String(username || "").toLowerCase());
    if (!u) throw new Error("\u7528\u6237\u4E0D\u5B58\u5728");
    if (u.username === "admin") throw new Error("\u4E0D\u80FD\u7981\u7528\u9ED8\u8BA4\u7BA1\u7406\u5458");
    u.disabled = disabled !== void 0 ? Boolean(disabled) : !u.disabled;
    this._save();
    return this._sanitizeUser(u);
  }
  setUserRole(username, role) {
    const u = this.users.get(String(username || "").toLowerCase());
    if (!u) throw new Error("\u7528\u6237\u4E0D\u5B58\u5728");
    if (u.username === "admin") throw new Error("\u4E0D\u80FD\u4FEE\u6539\u9ED8\u8BA4\u7BA1\u7406\u5458\u89D2\u8272");
    u.role = role === "admin" ? "admin" : "user";
    this._save();
    return this._sanitizeUser(u);
  }
  setUserQuota(username, dailyCreditLimit, rpm) {
    const u = this.users.get(String(username || "").toLowerCase());
    if (!u) throw new Error("\u7528\u6237\u4E0D\u5B58\u5728");
    u.dailyCreditLimit = Math.max(0, Number(dailyCreditLimit || 0) || 0);
    u.rpm = Math.max(0, Number(rpm || 0) || 0);
    this._save();
    return this._sanitizeUser(u);
  }
  resetUserPassword(username, newPassword) {
    const u = this.users.get(String(username || "").toLowerCase());
    if (!u) throw new Error("\u7528\u6237\u4E0D\u5B58\u5728");
    if (!newPassword || String(newPassword).length < 4) throw new Error("\u5BC6\u7801\u957F\u5EA6\u81F3\u5C11 4 \u4F4D");
    u.salt = generateRandomHex(16);
    u.passwordHash = hashPassword(newPassword, u.salt);
    this._save();
    return this._sanitizeUser(u);
  }
  resetUserApiKey(username) {
    const u = this.users.get(String(username || "").toLowerCase());
    if (!u) throw new Error("\u7528\u6237\u4E0D\u5B58\u5728");
    this.byApiKey.delete(u.apiKey);
    u.apiKey = generateUserApiKey();
    this.byApiKey.set(u.apiKey, u);
    this._save();
    return this._sanitizeUser(u);
  }
  deleteUser(username) {
    const uname = String(username || "").toLowerCase();
    const u = this.users.get(uname);
    if (!u) throw new Error("\u7528\u6237\u4E0D\u5B58\u5728");
    if (u.username === "admin") throw new Error("\u4E0D\u80FD\u5220\u9664\u9ED8\u8BA4\u7BA1\u7406\u5458");
    this.users.delete(uname);
    this.byApiKey.delete(u.apiKey);
    this._save();
    return true;
  }
  /**
   * 校验 API 请求凭据 (兼容全局网关 apiKey 与各租户专属 sk-wb2a-... Key)，含 RPM 与日配额校验
   */
  verifyApiRequest(providedKey, globalApiKey = "") {
    const key = String(providedKey || "").trim();
    const hasGlobalKey = Boolean(globalApiKey && globalApiKey.trim());
    if (!key) {
      if (!hasGlobalKey) {
        return { ok: true, user: null };
      }
      return { ok: false, status: 401, message: "Invalid or missing gateway API key" };
    }
    if (hasGlobalKey && key === globalApiKey.trim()) {
      return { ok: true, user: this.users.get("admin") || null };
    }
    const user = this.byApiKey.get(key);
    if (!user) {
      if (!hasGlobalKey) {
        return { ok: true, user: null };
      }
      return { ok: false, status: 401, message: "Invalid gateway API key" };
    }
    if (user.disabled) {
      return { ok: false, status: 403, message: `User account ${user.username} is disabled` };
    }
    const today = getTodayCST();
    if (user.lastCreditDay !== today) {
      user.lastCreditDay = today;
      user.usedCreditToday = 0;
    }
    if (user.dailyCreditLimit > 0 && user.usedCreditToday >= user.dailyCreditLimit) {
      return {
        ok: false,
        status: 429,
        message: `Daily credit quota exceeded (${user.usedCreditToday.toFixed(2)} / ${user.dailyCreditLimit})`
      };
    }
    if (user.rpm > 0) {
      const now = Date.now();
      const bucket = this.rpmBuckets.get(key);
      if (!bucket || now - bucket.windowStart >= 6e4) {
        this.rpmBuckets.set(key, { windowStart: now, count: 1 });
      } else if (bucket.count >= user.rpm) {
        return { ok: false, status: 429, message: `Rate limit exceeded (RPM ${user.rpm})` };
      } else {
        bucket.count += 1;
      }
    }
    return { ok: true, user };
  }
  deductUserCredit(user, creditAmount = 0) {
    if (!user?.username || !(creditAmount > 0)) return;
    const real = this.users.get(user.username);
    if (!real) return;
    const today = getTodayCST();
    if (real.lastCreditDay !== today) {
      real.lastCreditDay = today;
      real.usedCreditToday = 0;
    }
    real.usedCreditToday = Number((real.usedCreditToday + creditAmount).toFixed(4));
    this._save();
  }
  static get cookieName() {
    return SESSION_COOKIE_NAME;
  }
};

// src/server/web-routes.js
import fs8 from "node:fs";
import os7 from "node:os";
import path7 from "node:path";

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
var INVITATION_V2_PREFIX = "/activity/workbuddy/invitation/v2";
var BIND_ERROR_MESSAGES = {
  12301: "\u9080\u8BF7\u7801\u65E0\u6548\u6216\u4E0D\u5B58\u5728\uFF08\u6CE8\u610F\u56FD\u9645\u7248\u4E0E\u56FD\u5185\u7248\u4E0D\u4E92\u901A\uFF09",
  12302: "\u4E0D\u80FD\u7ED1\u5B9A\u81EA\u5DF1\u7684\u9080\u8BF7\u7801",
  12303: "\u5F53\u524D\u8D26\u53F7\u5DF2\u7ECF\u7ED1\u5B9A\u8FC7\u9080\u8BF7\u4EBA\uFF0C\u4E0D\u53EF\u91CD\u590D\u7ED1\u5B9A",
  12304: "\u4EC5\u9650\u65B0\u6CE8\u518C\u8D26\u53F7\u53EF\u7ED1\u5B9A\u9080\u8BF7\u7801",
  12305: "\u5F53\u524D\u9080\u8BF7\u6D3B\u52A8\u5DF2\u7ED3\u675F",
  12306: "\u6D3B\u52A8\u6216\u533A\u670D\u4E0D\u5339\u914D\uFF08\u8BF7\u6838\u5BF9\u56FD\u5185\u7248/\u56FD\u9645\u7248\uFF09",
  12310: "\u5F53\u524D\u8D26\u53F7\u5DF2\u7ECF\u7ED1\u5B9A\u8FC7\u9080\u8BF7\u4EBA\uFF0C\u4E0D\u53EF\u91CD\u590D\u7ED1\u5B9A",
  12311: "\u4EC5\u9650\u65B0\u6CE8\u518C\u8D26\u53F7\u53EF\u7ED1\u5B9A\u9080\u8BF7\u7801",
  12312: "\u5F53\u524D\u9080\u8BF7\u6D3B\u52A8\u5DF2\u7ED3\u675F",
  12313: "\u4E0D\u80FD\u7ED1\u5B9A\u81EA\u5DF1\u7684\u9080\u8BF7\u7801",
  12314: "\u6D3B\u52A8\u6216\u533A\u670D\u4E0D\u5339\u914D",
  12317: "\u5DF2\u8D85\u8FC7\u65B0\u7528\u6237\u7ED1\u5B9A\u65F6\u95F4\u7A97\u53E3",
  12319: "\u9080\u8BF7\u7801\u65E0\u6548\u6216\u5DF2\u5931\u6548"
};
function extractInviteCode(input) {
  const raw = String(input || "").trim();
  if (!raw) return "";
  if (raw.includes("://") || raw.includes("inviteCode=") || raw.includes("invite_code=") || raw.includes("code=")) {
    try {
      const normalized = raw.startsWith("http") ? raw : `https://www.workbuddy.ai/?${raw.replace(/^[/?]+/, "")}`;
      const u = new URL(normalized);
      const picked = u.searchParams.get("inviteCode") || u.searchParams.get("invite_code") || u.searchParams.get("code");
      if (picked) return picked.trim();
    } catch (_) {
    }
  }
  return raw;
}
function buildInviteUrl(account, code) {
  const c = String(code || "").trim();
  if (!c) return "";
  return account?.auth?.realm === "global" ? `https://www.workbuddy.ai/?inviteCode=${encodeURIComponent(c)}` : `https://www.workbuddy.cn/events/invite?inviteCode=${encodeURIComponent(c)}`;
}
async function fetchJsonWithRefresh(url, options, account, client) {
  const exec = async () => {
    const res2 = await fetch(url, {
      ...options,
      headers: {
        ...options.headers || {},
        "Authorization": `Bearer ${account.auth.accessToken}`
      },
      signal: AbortSignal.timeout(8e3)
    });
    const json2 = await res2.json().catch(() => ({}));
    return { res: res2, json: json2 };
  };
  let { res, json } = await exec();
  const isAuthErr = res.status === 401 || json.code === 401 || json.code === 12153 || json.code === 10002;
  if (isAuthErr && client && account.auth?.refreshToken) {
    try {
      await client.refreshToken(account);
      ({ res, json } = await exec());
    } catch (_) {
    }
  }
  return { res, json };
}
async function fetchInviteInfo(account, client = null) {
  if (!account?.account?.uid) {
    throw new Error("\u8D26\u53F7\u4FE1\u606F\u65E0\u6548");
  }
  const isGlobal = account.auth?.realm === "global";
  const base = isGlobal ? GLOBAL_BASE : CN_BILLING_BASE;
  const headers = {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "X-CodeBuddy-Request": "1",
    "Origin": base,
    "Referer": `${base}/`
  };
  const [codeRes, rewardsRes, recordsRes, progressRes] = await Promise.all([
    fetchJsonWithRefresh(`${base}${INVITATION_V2_PREFIX}/my-code`, { method: "GET", headers }, account, client).catch((e) => ({ res: { ok: false }, json: { msg: e.message } })),
    fetchJsonWithRefresh(`${base}${INVITATION_V2_PREFIX}/my-rewards`, { method: "GET", headers }, account, client).catch(() => ({ res: { ok: false }, json: {} })),
    fetchJsonWithRefresh(`${base}${INVITATION_V2_PREFIX}/invite-records`, { method: "GET", headers }, account, client).catch(() => ({ res: { ok: false }, json: {} })),
    fetchJsonWithRefresh(`${base}${INVITATION_V2_PREFIX}/my-progress`, { method: "GET", headers }, account, client).catch(() => ({ res: { ok: false }, json: {} }))
  ]);
  const codeData = codeRes.res.ok && codeRes.json.code === 0 ? codeRes.json.data || {} : null;
  const progData = progressRes.res.ok && progressRes.json.code === 0 ? progressRes.json.data || {} : null;
  const rewData = rewardsRes.res.ok && rewardsRes.json.code === 0 ? rewardsRes.json.data || {} : null;
  const recData = recordsRes.res.ok && recordsRes.json.code === 0 ? recordsRes.json.data || {} : null;
  const inviteCode = String(codeData?.invite_code || progData?.invite_code || "").trim();
  const inviteUrl = buildInviteUrl(account, inviteCode);
  const invitedCount = Number(
    recData?.total_invited ?? progData?.invite_count ?? 0
  );
  const validInviteCount = Number(
    recData?.total_used ?? rewData?.valid_invite_count ?? progData?.valid_invite_count ?? 0
  );
  const rewardCredit = Number(
    rewData?.total_credits ?? recData?.total_credits ?? progData?.total_credits ?? 0
  );
  return {
    inviteCode,
    inviteUrl,
    expiresAt: codeData?.expires_at || "never",
    invitedCount,
    validInviteCount,
    rewardCredit,
    baseCredits: Number(rewData?.base_credits ?? progData?.base_credits ?? 0),
    promotionCredits: Number(rewData?.promotion_credits ?? progData?.promotion_credits ?? 0),
    paymentCredits: Number(rewData?.payment_credits ?? progData?.payment_credits ?? 0),
    capValue: Number(rewData?.cap_value ?? 3e4),
    friends: recData?.friends || progData?.invited_users || [],
    error: !inviteCode && codeRes.json?.msg ? codeRes.json.msg : ""
  };
}
async function bindInviteCode(account, inviteInput, client = null) {
  const cleanCode = extractInviteCode(inviteInput);
  if (!cleanCode) {
    return { ok: false, message: "\u9080\u8BF7\u7801\u4E0D\u80FD\u4E3A\u7A7A" };
  }
  const isGlobal = account.auth?.realm === "global";
  const base = isGlobal ? GLOBAL_BASE : CN_BILLING_BASE;
  const headers = {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "X-CodeBuddy-Request": "1",
    "Origin": base,
    "Referer": `${base}/`
  };
  try {
    const { res, json } = await fetchJsonWithRefresh(
      `${base}${INVITATION_V2_PREFIX}/bind`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ inviteCode: cleanCode })
      },
      account,
      client
    );
    if (res.ok && json.code === 0) {
      const reward = Number(json.data?.credit || json.data?.reward_credit || json.data?.granted_credits || 0);
      return {
        ok: true,
        inviteCode: cleanCode,
        reward,
        message: reward > 0 ? `\u7ED1\u5B9A\u6210\u529F\uFF0C\u83B7\u5F97 +${reward} \u79EF\u5206\uFF01` : "\u9080\u8BF7\u7801\u7ED1\u5B9A\u6210\u529F\uFF01"
      };
    }
    const mapped = BIND_ERROR_MESSAGES[json.code];
    return {
      ok: false,
      code: json.code,
      message: mapped || json.msg || `\u7ED1\u5B9A\u5931\u8D25 (HTTP ${res.status})`
    };
  } catch (err) {
    return { ok: false, message: `\u7ED1\u5B9A\u8BF7\u6C42\u5F02\u5E38: ${err.message}` };
  }
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
var SHARED_CSS = `
  :root {
    --bg: #f4f7fb;
    --bg-card: #ffffff;
    --bg-soft: #f8fafc;
    --border: #dbe5f1;
    --border-strong: #93c5fd;
    --cyan: #2563eb;
    --cyan-dark: #1d4ed8;
    --emerald: #059669;
    --amber: #d97706;
    --magenta: #dc2626;
    --text: #0f172a;
    --text-dim: #64748b;
    --radius: 12px;
    --font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; padding: 0; font-family: var(--font);
    background: radial-gradient(circle at 10% 10%, rgba(37,99,235,0.06), transparent 42%),
                radial-gradient(circle at 90% 15%, rgba(14,165,233,0.05), transparent 40%), var(--bg);
    color: var(--text); min-height: 100vh;
  }
  .topbar {
    display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;
    padding: 12px 24px; border-bottom: 1px solid var(--border);
    background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(12px);
    position: sticky; top: 0; z-index: 50; box-shadow: 0 2px 10px rgba(15, 23, 42, 0.04);
  }
  .brand { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 16px; color: #1e3a8a; }
  .brand-badge {
    padding: 3px 9px; border-radius: 999px; font-size: 11px;
    background: #eff6ff; border: 1px solid #bfdbfe; color: #2563eb; font-weight: 600;
  }
  .nav { display: flex; gap: 5px; flex-wrap: wrap; align-items: center; }
  .nav-btn {
    background: transparent; border: 1px solid transparent; color: #475569;
    padding: 7px 12px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.16s;
  }
  .nav-btn:hover { color: #2563eb; background: #f1f5f9; }
  .nav-btn.active {
    background: #eff6ff; border-color: #93c5fd; color: #2563eb; font-weight: 600;
    box-shadow: 0 1px 4px rgba(37, 99, 235, 0.1);
  }
  .container { max-width: 1300px; margin: 0 auto; padding: 20px 24px 64px; }
  .grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; margin-bottom: 18px; }
  .grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 16px; margin-bottom: 18px; }
  .guide-card { border: 1px solid #dbe5f1; border-radius: 10px; padding: 12px; background: #f8fafc; transition: all 0.2s; }
  .guide-card:hover { border-color: #93c5fd; }
  .card {
    background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
    padding: 18px; box-shadow: 0 4px 16px rgba(15, 35, 75, 0.05); margin-bottom: 16px;
  }
  .card-title {
    font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 10px;
    display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap;
  }
  .kpi { font-size: 28px; font-weight: 700; color: #2563eb; }
  .kpi.green { color: #059669; }
  .kpi.pink { color: #0284c7; }
  .sub-row { font-size: 12px; color: var(--text-dim); margin-top: 6px; display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
  .toolbar { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; align-items: center; }
  button.btn, a.btn {
    display: inline-flex; align-items: center; gap: 4px; text-decoration: none;
    background: #eff6ff; border: 1px solid #bfdbfe; color: #2563eb;
    padding: 7px 13px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.15s;
  }
  button.btn:hover, a.btn:hover { background: #dbeafe; border-color: #93c5fd; transform: translateY(-1px); }
  button.btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
  button.btn-green { background: #ecfdf5; border-color: #a7f3d0; color: #059669; }
  button.btn-green:hover { background: #d1fae5; }
  button.btn-pink { background: #fef2f2; border-color: #fecaca; color: #dc2626; }
  button.btn-pink:hover { background: #fee2e2; }
  button.btn-amber { background: #fffbeb; border-color: #fde68a; color: #d97706; }
  button.btn-amber:hover { background: #fef3c7; }
  button.btn-sm, a.btn-sm { padding: 4px 9px; font-size: 11px; }
  input, select, textarea {
    background: #ffffff; border: 1px solid #cbd5e1; color: var(--text);
    padding: 7px 10px; border-radius: 8px; font-size: 12px; font-family: inherit;
  }
  input:focus, select:focus, textarea:focus {
    outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
  }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th, td { text-align: left; padding: 10px 8px; border-bottom: 1px solid #edf2f7; vertical-align: middle; }
  th { color: #64748b; font-weight: 600; background: #f8fafc; }
  .tag { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; }
  .tag-cn { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
  .tag-global { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }
  .tag-warn { background: #fffbeb; color: #d97706; border: 1px solid #fde68a; }
  .tag-err { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
  .hidden { display: none !important; }
  .modal-backdrop {
    position: fixed; inset: 0; background: rgba(15, 23, 42, 0.36); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center; z-index: 200;
  }
  .modal {
    width: 600px; max-width: 94vw; max-height: 90vh; overflow-y: auto; background: #ffffff;
    border: 1px solid #bfdbfe; border-radius: 14px; padding: 20px; box-shadow: 0 20px 50px rgba(15, 23, 42, 0.18);
  }
  .bar-chart { display: flex; align-items: flex-end; gap: 6px; height: 110px; padding-top: 12px; }
  .bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; height: 100%; justify-content: flex-end; }
  .bar-fill { width: 100%; background: linear-gradient(180deg, #2563eb, #93c5fd); border-radius: 4px 4px 0 0; min-height: 2px; }
  .bar-lbl { font-size: 10px; color: var(--text-dim); }
  .toast {
    position: fixed; bottom: 20px; right: 20px; background: #ffffff;
    border: 1px solid #93c5fd; color: #1e3a8a; padding: 10px 16px; border-radius: 10px;
    font-size: 12px; font-weight: 500; z-index: 300; box-shadow: 0 8px 24px rgba(37, 99, 235, 0.15);
  }
  pre.code {
    background: #f8fafc; border: 1px solid #dbe5f1; border-radius: 8px; padding: 12px;
    overflow-x: auto; font-size: 11px; color: #1e3a8a; font-family: Consolas, Monaco, monospace;
  }
  .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
  .form-field { display: flex; flex-direction: column; gap: 5px; font-size: 12px; }
  .form-field label { color: #475569; font-weight: 500; }
`;
function renderPortalHtml(opts = {}) {
  const port = opts.port || 7863;
  const ver = opts.version || SERVICE_VERSION;
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>WorkBuddy 2API \u670D\u52A1\u95E8\u6237 \u2014 DSH Gateway</title>
  <style>${SHARED_CSS}</style>
</head>
<body>
  <div class="topbar">
    <div class="brand">
      <span>\u26A1 WORKBUDDY 2API</span>
      <span class="brand-badge">PORTAL v${ver} \xB7 :${port}</span>
    </div>
    <div class="nav">
      <a class="btn btn-sm" href="/console">\u8FDB\u5165\u7BA1\u7406\u63A7\u5236\u53F0 \u2197</a>
    </div>
  </div>
  <div class="container">
    <div class="card">
      <div class="card-title">
        <span>\u670D\u52A1\u5B9E\u65F6\u8FD0\u884C\u603B\u89C8</span>
        <button class="btn btn-sm" onclick="loadPublic()">\u21BB \u5237\u65B0\u72B6\u6001</button>
      </div>
      <div class="grid-3" id="portalSummary">\u52A0\u8F7D\u4E2D...</div>
    </div>
    <div class="card">
      <div class="card-title"><span>\u53EF\u7528\u6A21\u578B\u4E0E\u5B98\u65B9\u500D\u7387\u6E05\u5355</span><span id="portalModelCount"></span></div>
      <div style="max-height:480px;overflow:auto">
        <table>
          <thead><tr><th>\u6A21\u578B ID</th><th>\u500D\u7387</th><th>\u533A\u670D</th><th>\u4E0A\u4E0B\u6587</th><th>\u80FD\u529B</th></tr></thead>
          <tbody id="portalModelsTbody"></tbody>
        </table>
      </div>
    </div>
    <div class="card">
      <div class="card-title"><span>API \u5FEB\u901F\u63A5\u5165</span></div>
      <div id="portalGuide" class="grid-2" style="margin-bottom:0"></div>
    </div>
  </div>
  <script>
    function esc(s) {
      return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }
    async function loadPublic() {
      const r = await fetch('/plugins/dsh-workbuddy2api/public/status');
      const d = await r.json();
      const cn = d.realm_totals?.cn || {};
      const gl = d.realm_totals?.global || {};
      document.getElementById('portalSummary').innerHTML = [
        { t: '\u5168\u6C60\u5065\u5EB7\u8D26\u53F7', v: (d.healthy || 0) + ' / ' + (d.total || 0), s: '\u51B7\u5374: ' + (d.cooling || 0) + ' \xB7 \u5728\u9014\u5360\u6EE1: ' + (d.in_flight_full || 0), c: '' },
        { t: '\u56FD\u5185\u7248 (CN) \u53EF\u7528\u5EA6', v: (cn.healthy || 0) + ' / ' + (cn.total || 0), s: '\u4ECA\u65E5\u5168\u6C60\u8BF7\u6C42 ' + (d.today?.requests || 0) + ' \u6B21', c: 'green' },
        { t: '\u56FD\u9645\u7248 (Global) \u53EF\u7528\u5EA6', v: (gl.healthy || 0) + ' / ' + (gl.total || 0), s: '\u5DF2\u53D1\u73B0\u52A8\u6001\u6A21\u578B ' + (d.discoveredModels || 0) + ' \u4E2A', c: 'pink' }
      ].map(x => '<div class="card" style="margin:0"><div class="card-title"><span>' + x.t + '</span></div><div class="kpi ' + x.c + '">' + x.v + '</div><div class="sub-row">' + x.s + '</div></div>').join('');
      const ms = d.models || [];
      document.getElementById('portalModelCount').textContent = '\u5171 ' + ms.length + ' \u4E2A\u516C\u5F00\u6A21\u578B';
      document.getElementById('portalModelsTbody').innerHTML = ms.map(m => {
        const caps = [];
        if (m.supports_images) caps.push('\u89C6\u89C9');
        if (m.supports_reasoning) caps.push('\u601D\u8003');
        if (m.supports_tool_call) caps.push('\u5DE5\u5177');
        return '<tr><td><strong>' + esc(m.id) + '</strong></td><td><span class="tag ' + (m.is_free ? 'tag-cn' : 'tag-global') + '">' + esc(m.billing_rate || m.credits || '-') + '</span></td><td>' + esc(m.realm || 'auto') + '</td><td>' + Math.round((m.context_length || 200000) / 1000) + 'k</td><td>' + (caps.join(' \xB7 ') || '\u6587\u672C') + '</td></tr>';
      }).join('');
      const base = location.origin;
      document.getElementById('portalGuide').innerHTML = [
        { t: 'OpenAI Chat \u7AEF\u70B9', u: base + '/v1', d: '\u9002\u7528 Cline / Cherry Studio / Roo Code' },
        { t: 'Claude Code (Anthropic)', u: base, d: '\u8BBE\u7F6E ANTHROPIC_BASE_URL=' + base },
        { t: 'OpenAI Responses (Codex)', u: base + '/v1/responses', d: '\u517C\u5BB9 Codex CLI \u539F\u751F\u4EA4\u4E92' },
        { t: '\u7F51\u5173\u5065\u5EB7\u63A2\u9488', u: base + '/healthz', d: '\u89C6\u9891\u751F\u6210\u63A5\u53E3: ' + base + '/v1/videos/generations' }
      ].map(g => '<div style="border:1px solid #dbe5f1;border-radius:8px;padding:10px;background:#f8fafc"><div style="font-weight:600;font-size:12px;color:#1e3a8a">' + g.t + '</div><div style="font-family:Consolas,monospace;font-size:11px;color:#2563eb;margin:4px 0">' + esc(g.u) + '</div><div style="font-size:11px;color:#64748b">' + esc(g.d) + '</div></div>').join('');
    }
    loadPublic();
  </script>
</body>
</html>`;
}
function renderConsoleHtml(opts = {}) {
  const port = opts.port || 7863;
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>WorkBuddy 2API Console \u2014 DSH \u9AD8\u53EF\u7528\u7F51\u5173</title>
  <style>${SHARED_CSS}</style>
</head>
<body>
  <div class="topbar">
    <div class="brand">
      <span>\u26A1 WORKBUDDY 2API</span>
      <span class="brand-badge" id="gatewayBadge">ONLINE v${SERVICE_VERSION} :${port}</span>
      <span id="userBadge" class="tag tag-cn hidden"></span>
    </div>
    <div class="nav">
      <button class="nav-btn active" onclick="switchTab('pool')">\u8D26\u53F7\u6C60\u603B\u89C8</button>
      <button class="nav-btn" onclick="switchTab('models')">\u6A21\u578B &amp; \u500D\u7387</button>
      <button class="nav-btn" onclick="switchTab('playground')">\u5728\u7EBF\u8C03\u8BD5 &amp; \u6D41\u6C34</button>
      <button class="nav-btn" onclick="switchTab('usage')">\u7528\u91CF\u4E0E\u6263\u8D39</button>
      <button class="nav-btn" onclick="switchTab('welfare')">\u732B\u732B &amp; \u798F\u5229 &amp; \u9080\u8BF7</button>
      <button class="nav-btn" onclick="switchTab('tasks')">\u6210\u957F\u4EFB\u52A1</button>
      <button class="nav-btn" onclick="switchTab('settings')">\u5B89\u5168 \xB7 \u544A\u8B66 \xB7 \u7528\u6237 \xB7 DSH</button>
      <a class="btn btn-sm" href="#" onclick="openExternalUrl(getApiOrigin() + '/portal');return false;">\u95E8\u6237 \u2197</a>
      <button id="logoutBtn" class="btn btn-sm btn-pink hidden" onclick="doLogout()">\u9000\u51FA</button>
    </div>
  </div>

  <div class="container">
    <!-- TAB 1: POOL -->
    <div id="tab-pool">
      <div class="grid-3" id="realmSummaryCards"></div>

      <div class="toolbar">
        <button class="btn btn-green" onclick="startOAuth('cn')">+ \u56FD\u5185\u7248 OAuth</button>
        <button class="btn" onclick="startOAuth('global')">+ \u56FD\u9645\u7248 OAuth</button>
        <button class="btn" onclick="openAddTokenModal()">+ \u7C98\u8D34 Token \u6DFB\u52A0</button>
        <button class="btn" onclick="openImportModal()">\u6279\u91CF / ZIP \u5BFC\u5165</button>
        <button class="btn" onclick="exportZip()">\u5BFC\u51FA ZIP \u5907\u4EFD</button>
        <button class="btn btn-green" onclick="batchCheckin()">\u5168\u6C60\u6BCF\u65E5\u7B7E\u5230</button>
        <button class="btn" onclick="batchTrial()">\u56FD\u9645\u7248\u6279\u91CF\u9886Trial</button>
        <button class="btn btn-amber" onclick="refreshAllTokens()">\u5237\u65B0\u5168\u90E8 Token</button>
        <button class="btn btn-pink" onclick="clearAllCooldowns()">\u6E05\u9664\u7194\u65AD</button>
        <button class="btn" onclick="openOverviewModal('balance')">\u4F59\u989D\u603B\u89C8</button>
        <button class="btn" onclick="openOverviewModal('packs')">\u79EF\u5206\u5305\u603B\u89C8</button>
        <button class="btn" onclick="loadStatus(true)">\u21BB \u6781\u901F\u5237\u65B0</button>
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
                <th>\u7B7E\u5230/\u5065\u5EB7\u72B6\u6001</th>
                <th>\u5E76\u53D1</th>
                <th>\u64CD\u4F5C</th>
              </tr>
            </thead>
            <tbody id="accountsTbody"></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 2: MODELS & RATES -->
    <div id="tab-models" class="hidden">
      <div class="toolbar">
        <button class="btn btn-green" onclick="discoverModels()">\u{1F50D} \u540C\u6B65\u4E0A\u6E38\u5B9E\u65F6\u500D\u7387\u76EE\u5F55</button>
        <button class="btn" onclick="saveModelsConfig()">\u{1F4BE} \u4FDD\u5B58\u8DEF\u7531 \xB7 \u8FC7\u6EE4 \xB7 \u522B\u540D</button>
        <select id="modelFilterMode" onchange="renderModelsTable()">
          <option value="all">\u5168\u90E8\u6A21\u578B</option>
          <option value="free">\u{1F381} \u4EC5\u514D\u8D39 (x0.00)</option>
          <option value="low">\u{1F48E} \u8D85\u4F4E\u500D\u7387 (\u22640.2x)</option>
          <option value="cn">\u{1F1E8}\u{1F1F3} \u56FD\u5185\u7248 (CN)</option>
          <option value="global">\u{1F310} \u56FD\u9645\u7248 (Global)</option>
          <option value="reasoning">\u{1F9E0} \u652F\u6301\u601D\u8003</option>
        </select>
        <input id="modelSearch" placeholder="\u641C\u7D22\u6A21\u578B ID / \u63CF\u8FF0..." oninput="renderModelsTable()" style="min-width:180px" />
        <label style="font-size:12px"><input type="checkbox" id="autoFreeToggle" /> \u5F00\u653E auto-free \u865A\u62DF\u514D\u8D39\u6C60</label>
      </div>
      <div class="grid-2" style="grid-template-columns: 1.55fr 1fr;">
        <div class="card">
          <div class="card-title"><span>\u4E0A\u6E38\u6A21\u578B\u4E0E\u5B9E\u65F6\u79EF\u5206\u500D\u7387\u76EE\u5F55\uFF08\u7A7A\u52FE\u9009\u8868\u793A\u5168\u90E8\u653E\u884C\uFF09</span><span id="modelCountLabel"></span></div>
          <div style="max-height:540px;overflow:auto">
            <table>
              <thead><tr><th>\u542F\u7528</th><th>\u6A21\u578B ID / \u8BF4\u660E</th><th>\u500D\u7387</th><th>\u80FD\u529B &amp; \u601D\u8003\u6863\u4F4D</th><th>\u533A\u670D</th><th>\u4E0A\u4E0B\u6587</th><th>\u64CD\u4F5C</th></tr></thead>
              <tbody id="modelsTbody"></tbody>
            </table>
          </div>
        </div>
        <div class="card">
          <div class="card-title">
            <span>auto-free \u4F18\u5148\u7EA7 / \u6545\u969C\u8F6C\u79FB\u8DEF\u7531 / \u6A21\u578B\u522B\u540D</span>
            <button class="btn btn-sm" onclick="addClaudePresetAliases()">+ Claude Code \u5E38\u7528\u6620\u5C04</button>
          </div>
          <div class="form-field" style="margin-bottom:10px">
            <label>auto-free \u667A\u80FD\u514D\u8D39\u8DEF\u7531\u987A\u5E8F (\u9017\u53F7\u5206\u9694):</label>
            <input id="freeModelsInput" />
          </div>

          <div style="border-top:1px solid #edf2f7;padding-top:10px;margin-bottom:10px">
            <div style="font-size:12px;font-weight:600;color:#475569;margin-bottom:6px">\u6545\u969C\u8F6C\u79FB\u8DEF\u7531\u7EC4 (\u5982 fast \u2794 \u4E3B\u6A21\u578B \u2192 \u5907\u9009\u6A21\u578B)</div>
            <div id="routesVisualList" style="display:flex;flex-direction:column;gap:6px;margin-bottom:8px"></div>
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              <input id="newRouteName" placeholder="\u7EC4\u540D\u5982 fast" style="width:110px" />
              <input id="newRouteTargets" placeholder="\u5019\u9009\u6A21\u578B\u9017\u53F7\u5206\u9694\u5982 cn:deepseek-v4.1-flash, global:hy4free" style="flex:1;min-width:160px" />
              <button class="btn btn-sm btn-green" onclick="addVisualRoute()">+ \u6DFB\u52A0\u8DEF\u7531\u7EC4</button>
            </div>
          </div>

          <div style="border-top:1px solid #edf2f7;padding-top:10px;margin-bottom:10px">
            <div style="font-size:12px;font-weight:600;color:#475569;margin-bottom:6px">\u5BA2\u6237\u7AEF\u6A21\u578B\u522B\u540D\u6620\u5C04 (\u6536\u5230\u5DE6\u4FA7\u540D\u79F0\u81EA\u52A8\u8F6C\u53D1\u5230\u53F3\u4FA7\u771F\u5B9E\u6A21\u578B)</div>
            <div id="aliasesVisualList" style="display:flex;flex-direction:column;gap:6px;max-height:210px;overflow-y:auto;margin-bottom:8px"></div>
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              <input id="newAliasFrom" placeholder="\u5BA2\u6237\u7AEF\u8BF7\u6C42\u540D\u5982 claude-sonnet-4-6" style="flex:1;min-width:130px" />
              <input id="newAliasTo" placeholder="\u6620\u5C04\u5230\u771F\u5B9E\u6A21\u578B\u5982 global:gpt-6.1-sol" style="flex:1;min-width:130px" />
              <button class="btn btn-sm btn-green" onclick="addVisualAlias()">+ \u6DFB\u52A0\u522B\u540D</button>
            </div>
          </div>

          <details style="font-size:11px;color:var(--text-dim)">
            <summary style="cursor:pointer;user-select:none">\u9AD8\u7EA7 JSON \u539F\u6587\u89C6\u56FE (\u81EA\u52A8\u540C\u6B65)</summary>
            <div class="form-field" style="margin-top:8px">
              <label>modelRoutes JSON:</label>
              <textarea id="modelRoutesTextarea" rows="4" oninput="syncVisualFromJson()"></textarea>
            </div>
            <div class="form-field" style="margin-top:6px">
              <label>aliases JSON:</label>
              <textarea id="aliasesTextarea" rows="5" oninput="syncVisualFromJson()"></textarea>
            </div>
          </details>
        </div>
      </div>
    </div>

    <!-- TAB 3: PLAYGROUND & LIVE LOGS -->
    <div id="tab-playground" class="hidden">
      <div class="grid-2">
        <div class="card">
          <div class="card-title"><span>\u{1F9EA} \u5728\u7EBF\u5BF9\u8BDD\u6D4B\u8BD5 (\u652F\u6301\u56FE\u7247/\u6587\u672C\u9644\u4EF6)</span><span id="pgStatsBadge" class="tag tag-global">\u5C31\u7EEA</span></div>
          <div class="form-grid" style="margin-bottom:10px">
            <div class="form-field">
              <label>\u9009\u62E9\u6D4B\u8BD5\u6A21\u578B (\u9644\u5E26\u5B9E\u65F6\u500D\u7387):</label>
              <select id="pgModelSelect"></select>
            </div>
            <div class="form-field">
              <label>\u601D\u8003\u5F3A\u5EA6 (reasoning_effort):</label>
              <select id="pgEffortSelect">
                <option value="">\u9ED8\u8BA4</option>
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
                <option value="xhigh">xhigh</option>
                <option value="max">max</option>
              </select>
            </div>
          </div>
          <div class="form-field" style="margin-bottom:8px">
            <label>\u6D4B\u8BD5\u63D0\u793A\u8BCD:</label>
            <textarea id="pgPromptInput" rows="3" placeholder="\u4F60\u597D\uFF0C\u8BF7\u7528\u4E00\u53E5\u8BDD\u4ECB\u7ECD\u4F60\u81EA\u5DF1"></textarea>
          </div>
          <div class="toolbar" style="margin-bottom:10px">
            <input type="file" id="pgFileInput" accept="image/*,.txt,.md,.json,.js,.py,.go" onchange="handlePgFile(event)" style="max-width:210px" />
            <span id="pgAttachBadge" class="tag tag-cn hidden"></span>
            <button id="pgAttachClear" class="btn btn-sm btn-pink hidden" onclick="clearPgAttachment()">\u6E05\u9664\u9644\u4EF6</button>
            <label style="font-size:12px"><input type="checkbox" id="pgStreamChk" checked /> \u6D41\u5F0F SSE</label>
            <button class="btn btn-green" onclick="runPlayground()">\u{1F680} \u53D1\u9001\u6D4B\u8BD5</button>
          </div>
          <pre class="code" id="pgOutputBox" style="min-height:140px;max-height:320px;white-space:pre-wrap">\u7B49\u5F85\u53D1\u9001\u6D4B\u8BD5...</pre>
        </div>

        <div class="card">
          <div class="card-title">
            <span>\u{1F4E1} \u5728\u9014\u5E76\u53D1 &amp; \u6700\u8FD1\u8BF7\u6C42\u5B9E\u65F6\u6D41\u6C34</span>
            <button class="btn btn-sm" onclick="loadLogs()">\u21BB \u5237\u65B0\u6D41\u6C34</button>
          </div>
          <div id="inFlightBox" class="sub-row" style="margin-bottom:10px">\u5F53\u524D\u65E0\u5728\u9014\u8BF7\u6C42</div>
          <div style="max-height:380px;overflow:auto">
            <table>
              <thead><tr><th>\u65F6\u95F4</th><th>\u6A21\u578B</th><th>\u500D\u7387</th><th>\u8D26\u53F7</th><th>\u72B6\u6001</th><th>TTFB/Tokens/\u901F\u7387</th><th>\u6263\u8D39</th></tr></thead>
              <tbody id="logsTbody"></tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 4: USAGE & CREDIT BREAKDOWN -->
    <div id="tab-usage" class="hidden">
      <div class="toolbar">
        <label style="font-size:12px;color:#475569">\u6309\u5386\u53F2\u65E5\u671F\u67E5\u770B:</label>
        <select id="usageDateSelect" onchange="loadUsage(this.value)"></select>
        <button class="btn" onclick="loadUsage()">\u21BB \u5237\u65B0\u7EDF\u8BA1</button>
        <button class="btn btn-pink" onclick="resetUsage()">\u6E05\u7A7A\u672C\u5730\u7528\u91CF\u8D26\u672C</button>
      </div>
      <div class="grid-3" id="usageSummaryCards"></div>
      <div class="grid-2">
        <div class="card">
          <div class="card-title"><span>\u8FD1 7 \u5929\u8BF7\u6C42\u4E0E Token \u8D70\u52BF</span></div>
          <div class="bar-chart" id="chart7d"></div>
        </div>
        <div class="card">
          <div class="card-title"><span>\u9009\u4E2D\u65E5 24 \u5C0F\u65F6\u70ED\u5EA6\u5206\u5E03</span></div>
          <div class="bar-chart" id="chart24h"></div>
        </div>
      </div>
      <div class="card">
        <div class="card-title"><span>\u{1F4CA} \u6309\u6A21\u578B\u500D\u7387\u3001\u7F13\u5B58\u547D\u4E2D\u4E0E\u5B9E\u6D4B\u6263\u8D39\u6392\u884C</span></div>
        <div style="overflow-x:auto">
          <table>
            <thead>
              <tr>
                <th>\u6A21\u578B</th>
                <th>\u5B98\u65B9\u500D\u7387</th>
                <th>\u8BF7\u6C42 (\u6210\u529F/\u5931\u8D25)</th>
                <th>\u8F93\u5165/\u8F93\u51FA Token</th>
                <th>\u7F13\u5B58\u547D\u4E2D\u7387</th>
                <th>\u7D2F\u8BA1\u6263\u8D39</th>
                <th>\u5747\u8017 / 1k\u5355\u4EF7</th>
                <th>\u5747TTFB / \u541E\u5410</th>
              </tr>
            </thead>
            <tbody id="usageModelsTbody"></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 5: WELFARE & TRAVEL & INVITE -->
    <div id="tab-welfare" class="hidden">
      <div class="toolbar">
        <select id="welfareUidSelect" onchange="loadWelfareAndInvite()"></select>
        <button class="btn btn-green" onclick="batchClaimAll()">\u{1F381} \u5168\u53F7\u4E00\u952E\u5403\u6EE1\u798F\u5229</button>
        <button class="btn" onclick="batchRunTravel()">\u{1F431} \u5168\u53F7\u5DE1\u68C0\u732B\u732B\u65C5\u884C</button>
        <button class="btn btn-amber" onclick="singleCheckin()">\u{1F4C5} \u5F53\u524D\u53F7\u6BCF\u65E5\u7B7E\u5230</button>
        <button class="btn" onclick="claimGiftAndComp()">\u{1F389} \u9886\u65B0\u624B\u793C/\u8865\u507F</button>
        <button class="btn" onclick="drawLottery()">\u{1F3B0} \u8FDE\u767B\u62BD\u4E00\u6B21</button>
      </div>
      <div class="grid-2">
        <div class="card">
          <div class="card-title">
            <span>\u{1F431} \u732B\u732B\u65C5\u884C\u7BA1\u5BB6</span>
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              <button class="btn btn-sm btn-green hidden" id="btnAdoptCat" onclick="adoptCat()">+ \u9886\u517B\u5C0F\u732B(+300\u5206)</button>
              <button class="btn btn-sm btn-amber hidden" id="btnClaimCat" onclick="claimCatReward()">\u{1F381} \u9886\u53D6\u5230\u7AD9\u5956\u52B1</button>
              <button class="btn btn-sm" onclick="runSingleTravel()">\u26A1 \u5355\u53F7\u81EA\u52A8\u8DD1</button>
            </div>
          </div>
          <div id="travelVisualBox" style="font-size:12px;line-height:1.7;margin-bottom:10px">\u9009\u62E9\u56FD\u5185\u7248\u8D26\u53F7\u67E5\u770B\u732B\u732B\u72B6\u6001...</div>
          <div style="display:flex;gap:6px;align-items:center;border-top:1px solid #edf2f7;padding-top:10px">
            <label style="font-size:11px;color:#475569">\u76EE\u7684\u5730:</label>
            <select id="travelLocSelect" style="flex:1">
              <option value="4">\u5730\u70B9 4 \xB7 \u53E4\u9547\u5BA2\u6808 (\u63A8\u8350)</option>
              <option value="1">\u5730\u70B9 1 \xB7 \u68EE\u6797\u8425\u5730</option>
              <option value="2">\u5730\u70B9 2 \xB7 \u6D77\u6EE8\u706F\u5854</option>
              <option value="3">\u5730\u70B9 3 \xB7 \u96EA\u5C71\u6728\u5C4B</option>
            </select>
            <button class="btn btn-sm" onclick="departTravel()">\u6D3E\u51FA\u65C5\u884C</button>
          </div>
        </div>
        <div class="card">
          <div class="card-title">
            <span>\u{1F381} \u4E13\u5C5E\u9080\u8BF7\u4E0E\u53D7\u9080\u7ED1\u5B9A (v2)</span>
            <button class="btn btn-sm" onclick="loadWelfareAndInvite()">\u21BB \u5237\u65B0</button>
          </div>
          <div id="inviteBox" style="font-size:12px;line-height:1.8;margin-bottom:10px">\u52A0\u8F7D\u4E2D...</div>
          <div style="display:flex;gap:8px;margin-top:8px">
            <input id="bindInviteInput" placeholder="\u8F93\u5165\u63A8\u8350\u4EBA\u9080\u8BF7\u7801\u6216\u5B8C\u6574\u9080\u8BF7\u94FE\u63A5\u7ED1\u5B9A" style="flex:1" />
            <button class="btn btn-green btn-sm" onclick="bindInvite()">\u7ACB\u5373\u7ED1\u5B9A</button>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">
          <span>\u{1F525} \u8FDE\u767B\u91CC\u7A0B\u7891 \xB7 \u8865\u7B7E\u5361 \xB7 \u62BD\u5956\u6B21\u6570</span>
          <button class="btn btn-sm" onclick="runMakeupCard()">\u{1FA79} \u68C0\u67E5\u5E76\u7528\u8865\u7B7E\u5361</button>
        </div>
        <div id="streakVisualBox" style="font-size:12px">\u52A0\u8F7D\u4E2D...</div>
      </div>

      <div class="card">
        <div class="card-title"><span>\u{1F4CB} \u64CD\u4F5C\u6267\u884C\u7ED3\u679C\u660E\u7EC6</span><span id="welfareSummaryBadge" class="tag tag-global">\u5C31\u7EEA</span></div>
        <div id="welfareResultBox" style="font-size:12px;color:var(--text-dim)">\u70B9\u51FB\u4E0A\u65B9\u4EFB\u610F\u64CD\u4F5C\u6309\u94AE\u540E\uFF0C\u5C06\u5728\u6B64\u5C55\u793A\u6E05\u6670\u7684\u7ED3\u679C\u6C47\u603B\u4E0E\u5404\u8D26\u53F7\u660E\u7EC6\u3002</div>
      </div>
    </div>

    <!-- TAB 6: GROWTH TASKS -->
    <div id="tab-tasks" class="hidden">
      <div class="toolbar">
        <select id="tasksUidSelect" onchange="loadTasks()"></select>
        <button class="btn btn-green" onclick="runTasks(false)">\u26A1 \u4E00\u952E\u70B9\u4EAE\u5E76\u6536\u5272\u6210\u957F\u4EFB\u52A1</button>
        <button class="btn btn-amber" onclick="runTasks(true)">\u{1F310} \u5168\u53F7\u81EA\u52A8\u6210\u957F\u4EFB\u52A1</button>
        <button class="btn" onclick="runSchoolActivity(false)">\u{1F3EB} \u5F00\u5B66\u5B63\u4EFB\u52A1+\u8F6C\u76D8(\u5355\u53F7)</button>
        <button class="btn btn-green" onclick="runSchoolActivity(true)">\u{1F393} \u5168\u53F7\u5F00\u5B66\u5B63\u62BD\u5956</button>
        <button class="btn" onclick="runNightCat()">\u{1F989} \u6DF1\u591C\u732B\u732B(23-08\u70B9)</button>
        <button class="btn" onclick="loadTasks()">\u21BB \u5237\u65B0\u4EFB\u52A1</button>
      </div>
      <div class="card">
        <div class="card-title">
          <span>\u{1F393} \u5F00\u5B66\u5B63\u6D3B\u52A8 (school_open_day_2026) &amp; \u5927\u8F6C\u76D8\u62BD\u5956</span>
          <span id="schoolStatusBadge" class="tag tag-global">\u68C0\u6D4B\u4E2D...</span>
        </div>
        <div id="schoolVisualBox" style="font-size:12px;color:var(--text-dim)">\u9009\u62E9\u56FD\u5185\u7248\u8D26\u53F7\u540E\u81EA\u52A8\u663E\u793A\u5F00\u5B66\u5B63\u4EFB\u52A1\u8FDB\u5EA6\u3001\u5927\u8F6C\u76D8\u6B21\u6570\u53CA\u62BD\u5956\u6536\u83B7\u3002</div>
      </div>
      <div class="card">
        <div class="card-title"><span>\u{1F4CB} \u5168\u81EA\u52A8\u6210\u957F\u79EF\u5206\u4EFB\u52A1\u6E05\u5355 (\u652F\u6301\u8FDB/\u9886\u5956\u72B6\u6001\u5B9E\u65F6\u6838\u5BF9)</span><span id="tasksSummary"></span></div>
        <div id="tasksList"></div>
      </div>
    </div>

    <!-- TAB 7: SECURITY, ALERTS, USERS, SCHEDULE & DSH SETTINGS -->
    <div id="tab-settings" class="hidden">
      <div class="card">
        <div class="card-title"><span>\u7F51\u5173\u6838\u5FC3\u53C2\u6570\u4E0E\u81EA\u52A8\u5316\u7B56\u7565</span><button class="btn btn-green btn-sm" onclick="saveConfig()">\u{1F4BE} \u4FDD\u5B58\u6838\u5FC3\u53C2\u6570</button></div>
        <div class="form-grid">
          <div class="form-field"><label>\u7F51\u5173\u9274\u6743 API Key (\u7559\u7A7A\u4E0D\u6821\u9A8C):</label><input id="cfgApiKey" placeholder="sk-..." /></div>
          <div class="form-field"><label>HTTP \u4EE3\u7406 (\u5982 http://127.0.0.1:7890):</label><input id="cfgProxy" placeholder="\u7559\u7A7A\u76F4\u8FDE" /></div>
          <div class="form-field"><label>\u56FD\u5185\u7248 CN \u5355\u53F7\u6700\u5927\u5E76\u53D1:</label><input id="cfgMaxCN" type="number" min="1" max="20" /></div>
          <div class="form-field"><label>\u56FD\u9645\u7248 Global \u5355\u53F7\u6700\u5927\u5E76\u53D1:</label><input id="cfgMaxGlobal" type="number" min="1" max="20" /></div>
          <div class="form-field"><label>\u6392\u961F\u7B49\u5F85\u8D85\u65F6 (ms):</label><input id="cfgQueueTimeout" type="number" min="0" max="60000" /></div>
          <div class="form-field"><label>\u6D41\u5F0F\u7A7A\u95F2\u65AD\u8FDE\u8D85\u65F6 (ms):</label><input id="cfgIdleTimeout" type="number" min="10000" max="600000" /></div>
          <div class="form-field">
            <label>System Prompt \u6CE8\u5165\u6A21\u5F0F:</label>
            <select id="cfgPromptMode">
              <option value="none">\u5173\u95ED (\u4FDD\u6301\u539F\u6837)</option>
              <option value="append">\u8FFD\u52A0\u5230\u672B\u5C3E (append)</option>
              <option value="replace">\u5168\u5C40\u66FF\u6362 (replace)</option>
            </select>
          </div>
          <div class="form-field"><label>X-Device-Token \u6587\u4EF6\u8DEF\u5F84 (\u53EF\u9009):</label><input id="cfgDeviceToken" placeholder="~/.dsh/device_token" /></div>
        </div>
        <div class="form-field" style="margin-top:10px">
          <label>System Prompt \u81EA\u5B9A\u4E49\u6587\u672C:</label>
          <textarea id="cfgPromptText" rows="2"></textarea>
        </div>
        <div class="toolbar" style="margin-top:10px;margin-bottom:0">
          <label><input type="checkbox" id="cfgAutoCheckin" /> \u81EA\u52A8\u798F\u5229/\u7B7E\u5230</label>
          <label><input type="checkbox" id="cfgAutoTravel" /> \u81EA\u52A8\u732B\u732B\u65C5\u884C</label>
          <label><input type="checkbox" id="cfgAutoTasks" /> \u81EA\u52A8\u6210\u957F\u4EFB\u52A1</label>
          <label><input type="checkbox" id="cfgAutoRefresh" /> 5\u5206\u949F Token \u4FDD\u6D3B</label>
          <label><input type="checkbox" id="cfgPortalHome" /> \u9996\u9875(/)\u8BBE\u4E3A\u516C\u5F00\u95E8\u6237 (/console \u8FDB\u540E\u53F0)</label>
        </div>
      </div>

      <div class="grid-2">
        <!-- \u5B9A\u65F6\u5C0F\u65F6\u6392\u7A0B -->
        <div class="card">
          <div class="card-title"><span>\u23F0 CST \u6574\u70B9\u81EA\u52A8\u5316\u6392\u7A0B\u5C0F\u65F6</span><button class="btn btn-green btn-sm" onclick="saveScheduleConfig()">\u4FDD\u5B58\u6392\u7A0B</button></div>
          <div class="form-grid">
            <div class="form-field"><label>\u7B7E\u5230\u798F\u5229\u5C0F\u65F6 (\u9017\u53F7):</label><input id="schCheckin" placeholder="9, 21" /></div>
            <div class="form-field"><label>\u732B\u732B\u65C5\u884C\u5C0F\u65F6 (\u9017\u53F7):</label><input id="schTravel" placeholder="9, 21" /></div>
            <div class="form-field"><label>\u6210\u957F\u4EFB\u52A1\u5C0F\u65F6 (\u9017\u53F7):</label><input id="schTasks" placeholder="11" /></div>
            <div class="form-field"><label>\u5F00\u5B66\u5B63\u6D3B\u52A8\u5C0F\u65F6 (\u9017\u53F7):</label><input id="schSchool" placeholder="12" /></div>
            <div class="form-field"><label>\u6DF1\u591C\u732B\u732B\u5C0F\u65F6 (23-08):</label><input id="schCat" placeholder="1" /></div>
            <div class="form-field"><label>\u5168\u6C60\u4FDD\u6D3B\u5C0F\u65F6 (\u9017\u53F7):</label><input id="schKeepalive" placeholder="22" /></div>
          </div>
        </div>

        <!-- \u63A7\u5236\u53F0\u5BC6\u7801\u4E0E\u7248\u672C\u81EA\u68C0 -->
        <div class="card">
          <div class="card-title"><span>\u{1F510} \u63A7\u5236\u53F0\u8BBF\u95EE\u5BC6\u7801 &amp; \u7248\u672C\u68C0\u6D4B</span><span id="pwStatusBadge" class="tag tag-cn">\u514D\u5BC6\u5355\u673A\u6A21\u5F0F</span></div>
          <div style="display:flex;gap:8px;margin-bottom:12px">
            <input id="cfgWebPassword" type="password" placeholder="\u8F93\u5165\u65B0\u63A7\u5236\u53F0\u5BC6\u7801 (\u7559\u7A7A\u70B9\u51FB\u4FDD\u5B58\u5219\u6E05\u9664\u5BC6\u7801)" style="flex:1" />
            <button class="btn btn-amber btn-sm" onclick="saveWebPassword()">\u8BBE\u7F6E/\u6E05\u9664\u5BC6\u7801</button>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid #edf2f7;padding-top:10px">
            <span id="updateInfoSpan" style="font-size:12px;color:#475569">\u5F53\u524D\u7248\u672C: v${SERVICE_VERSION} (${GITHUB_REPO})</span>
            <button class="btn btn-sm" onclick="checkUpdate()">\u68C0\u67E5 GitHub \u65B0\u7248\u672C</button>
          </div>
        </div>
      </div>

      <div class="grid-2">
        <!-- IP \u767D\u540D\u5355 -->
        <div class="card">
          <div class="card-title"><span>\u{1F6E1}\uFE0F IP / CIDR \u8BBF\u95EE\u767D\u540D\u5355</span><button class="btn btn-green btn-sm" onclick="saveIPWhitelist()">\u4FDD\u5B58\u767D\u540D\u5355</button></div>
          <div class="toolbar" style="margin-bottom:8px">
            <label><input type="checkbox" id="ipWlEnabled" /> \u542F\u7528\u767D\u540D\u5355\u6821\u9A8C</label>
            <label><input type="checkbox" id="ipWlLocal" checked /> \u59CB\u7EC8\u653E\u884C\u672C\u673A\u56DE\u73AF (127.0.0.1/::1)</label>
            <button class="btn btn-sm" onclick="addClientIP()">+ \u6DFB\u52A0\u5F53\u524D\u8BBF\u95EE IP</button>
          </div>
          <div id="ipRuntimeInfo" class="sub-row" style="margin-bottom:8px">\u5F53\u524D\u6765\u8BBF IP: -</div>
          <textarea id="ipWlList" rows="3" placeholder="\u6BCF\u884C\u6216\u9017\u53F7\u5206\u9694 IP / CIDR\uFF0C\u5982: 192.168.1.0/24, 10.0.0.5" style="width:100%"></textarea>
        </div>

        <!-- Webhook \u544A\u8B66 -->
        <div class="card">
          <div class="card-title">
            <span>\u{1F514} \u591A\u901A\u9053 Webhook \u98CE\u63A7\u544A\u8B66</span>
            <div style="display:flex;gap:6px">
              <button class="btn btn-amber btn-sm" onclick="testAlerts()">\u53D1\u9001\u6D4B\u8BD5\u544A\u8B66</button>
              <button class="btn btn-green btn-sm" onclick="saveAlerts()">\u4FDD\u5B58\u544A\u8B66</button>
            </div>
          </div>
          <div class="toolbar" style="margin-bottom:8px">
            <label><input type="checkbox" id="alertEnabled" /> \u542F\u7528\u544A\u8B66</label>
            <label>\u4F4E\u79EF\u5206\u9608\u503C: <input id="alertMinCredit" type="number" style="width:72px" value="50" /></label>
          </div>
          <div class="toolbar" style="margin-bottom:8px;font-size:11px">
            <label><input type="checkbox" class="alert-evt" value="ban" checked /> \u5C01\u53F7/\u7981\u7528</label>
            <label><input type="checkbox" class="alert-evt" value="401" checked /> 401\u5931\u6548</label>
            <label><input type="checkbox" class="alert-evt" value="cooling" checked /> \u5168\u6C60\u51B7\u5374</label>
            <label><input type="checkbox" class="alert-evt" value="low_credit" checked /> \u4F4E\u79EF\u5206\u9884\u8B66</label>
          </div>
          <textarea id="alertHooks" rows="3" placeholder="Webhook URL (\u652F\u6301 \u98DE\u4E66 / \u4F01\u5FAE / \u9489\u9489 / Telegram / Discord / \u901A\u7528 JSON)" style="width:100%"></textarea>
        </div>
      </div>

      <!-- \u591A\u7528\u6237\u4E0E\u79DF\u6237\u914D\u989D\u7BA1\u63A7 -->
      <div class="card">
        <div class="card-title">
          <span>\u{1F465} \u591A\u79DF\u6237\u7528\u6237\u3001\u4E13\u5C5E API Key \u4E0E\u914D\u989D\u7BA1\u63A7</span>
          <div style="display:flex;gap:8px;align-items:center">
            <label style="font-size:12px"><input type="checkbox" id="allowRegChk" onchange="toggleAllowRegister(this.checked)" /> \u5F00\u653E\u7528\u6237\u81EA\u52A9\u6CE8\u518C</label>
            <button class="btn btn-sm" onclick="loadAdminUsers()">\u21BB \u5237\u65B0\u7528\u6237\u5217\u8868</button>
          </div>
        </div>
        <div class="toolbar" style="margin-bottom:10px">
          <input id="newUserName" placeholder="\u7528\u6237\u540D" style="width:120px" />
          <input id="newUserPass" type="password" placeholder="\u5BC6\u7801(\u22654\u4F4D)" style="width:120px" />
          <select id="newUserRole"><option value="user">\u666E\u901A\u7528\u6237</option><option value="admin">\u7BA1\u7406\u5458</option></select>
          <input id="newUserQuota" type="number" placeholder="\u65E5\u9650\u989D(0\u4E0D\u9650)" style="width:115px" />
          <input id="newUserRpm" type="number" placeholder="RPM(0\u4E0D\u9650)" style="width:105px" />
          <button class="btn btn-green btn-sm" onclick="createTenantUser()">+ \u65B0\u589E\u79DF\u6237</button>
        </div>
        <div style="overflow-x:auto">
          <table>
            <thead><tr><th>\u7528\u6237\u540D</th><th>\u89D2\u8272</th><th>\u4E13\u5C5E API Key</th><th>\u4ECA\u65E5\u5DF2\u8017 / \u65E5\u4E0A\u9650</th><th>RPM</th><th>\u72B6\u6001</th><th>\u64CD\u4F5C</th></tr></thead>
            <tbody id="adminUsersTbody"></tbody>
          </table>
        </div>
      </div>

      <!-- DSH \u6302\u8F7D\u68C0\u6D4B -->
      <div class="card">
        <div class="card-title">
          <span>\u{1F50C} DeepSeek Harness (DSH) \u684C\u9762\u7AEF\u914D\u7F6E\u68C0\u6D4B\u4E0E\u4E00\u952E\u540C\u6B65</span>
          <div style="display:flex;gap:6px">
            <button class="btn btn-sm" onclick="checkDsh()">\u68C0\u6D4B\u72B6\u6001</button>
            <button class="btn btn-green btn-sm" onclick="syncDsh()">\u4E00\u952E\u540C\u6B65 baseURL</button>
          </div>
        </div>
        <div id="dshCheckBox" class="sub-row">\u70B9\u51FB\u300C\u68C0\u6D4B\u72B6\u6001\u300D\u68C0\u67E5\u672C\u673A cordis.patch.yml \u4E0E\u63D2\u4EF6\u6302\u8F7D</div>
      </div>

      <div class="card">
        <div class="card-title"><span>\u{1F50C} \u5176\u4ED6 IDE / CLI \u4E00\u952E\u63A5\u5165\u6307\u5357 (Claude Code \xB7 Codex \xB7 Cursor \xB7 Cline)</span></div>
        <div id="guideCardsGrid" class="grid-2" style="margin-bottom:0"></div>
      </div>
    </div>

    <!-- \u5E95\u90E8\u4E13\u5C5E\u54C1\u724C\u72B6\u6001\u4E0E\u5FEB\u901F\u94FE\u63A5 -->
    <footer style="margin-top:24px;padding:16px 4px 8px;border-top:1px solid #dbe5f1;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;font-size:11px;color:var(--text-dim)">
      <div style="display:flex;align-items:center;gap:6px">
        <span style="font-weight:700;color:var(--blue)">\u26A1 WorkBuddy 2API</span>
        <span>\xB7 \u4F01\u4E1A\u7EA7\u9AD8\u5E76\u53D1\u591A\u8D26\u53F7\u8F6E\u8BE2\u4E0E\u6A21\u578B\u805A\u5408\u7F51\u5173</span>
      </div>
      <div style="display:flex;gap:14px;align-items:center">
        <a href="/healthz" target="_blank" style="color:var(--blue);text-decoration:none">\u5065\u5EB7\u63A2\u9488 (/healthz)</a>
        <a href="/portal" target="_blank" style="color:var(--blue);text-decoration:none">\u516C\u5F00\u95E8\u6237 (/portal)</a>
        <a href="https://github.com/XCool-603/dsh-workbuddy2api" target="_blank" style="color:var(--text-dim);text-decoration:none">GitHub \u4ED3\u5E93 \u2197</a>
      </div>
    </footer>
  </div>

  <!-- MODALS -->
  <div id="packsModal" class="modal-backdrop hidden">
    <div class="modal" style="width:680px">
      <div class="card-title"><span id="packsModalTitle">\u660E\u7EC6\u603B\u89C8</span><button class="btn btn-sm btn-pink" onclick="closeModal('packsModal')">\u5173\u95ED</button></div>
      <div id="packsModalToolbar" class="toolbar hidden">
        <button class="btn btn-sm" onclick="setOverviewRealm('all')">\u5168\u90E8</button>
        <button class="btn btn-sm btn-green" onclick="setOverviewRealm('cn')">\u56FD\u5185\u7248 CN</button>
        <button class="btn btn-sm" onclick="setOverviewRealm('global')">\u56FD\u9645\u7248 Global</button>
      </div>
      <div style="max-height:440px;overflow:auto">
        <table>
          <thead id="packsModalThead"><tr><th>\u540D\u79F0</th><th>\u7C7B\u578B</th><th>\u5269\u4F59</th><th>\u603B\u91CF</th><th>\u5DF2\u7528</th><th>\u5230\u671F\u65F6\u95F4</th></tr></thead>
          <tbody id="packsModalTbody"></tbody>
        </table>
      </div>
    </div>
  </div>

  <div id="accountDetailModal" class="modal-backdrop hidden">
    <div class="modal" style="width:640px">
      <div class="card-title"><span id="accDetailTitle">\u8D26\u53F7\u8BE6\u7EC6\u6863\u6848</span><button class="btn btn-sm btn-pink" onclick="closeModal('accountDetailModal')">\u5173\u95ED</button></div>
      <div id="accDetailBody" style="font-size:12px;line-height:1.8"></div>
    </div>
  </div>

  <div id="updateTokenModal" class="modal-backdrop hidden">
    <div class="modal">
      <div class="card-title"><span id="updTokenTitle">\u4E00\u952E\u66F4\u65B0\u51ED\u8BC1 Token / \u6551\u6D3B\u8D26\u53F7</span><button class="btn btn-sm btn-pink" onclick="closeModal('updateTokenModal')">\u5173\u95ED</button></div>
      <input type="hidden" id="updTokenUid" />
      <div class="form-field" style="margin-bottom:10px"><label>\u65B0 Access Token (\u53EF\u9009):</label><textarea id="updAccessInput" rows="3"></textarea></div>
      <div class="form-field" style="margin-bottom:12px"><label>\u65B0 Refresh Token (\u63A8\u8350):</label><textarea id="updRefreshInput" rows="3"></textarea></div>
      <div style="display:flex;justify-content:flex-end;gap:8px"><button class="btn btn-green" onclick="submitUpdateToken()">\u9A8C\u8BC1\u5E76\u6551\u6D3B\u8D26\u53F7</button></div>
    </div>
  </div>

  <div id="addTokenModal" class="modal-backdrop hidden">
    <div class="modal">
      <div class="card-title"><span>+ \u7C98\u8D34 Token \u6DFB\u52A0\u5355\u4E2A\u8D26\u53F7</span><button class="btn btn-sm btn-pink" onclick="closeModal('addTokenModal')">\u5173\u95ED</button></div>
      <div class="form-grid" style="margin-bottom:10px">
        <div class="form-field">
          <label>\u8D26\u53F7\u533A\u670D:</label>
          <select id="addTokenRealm"><option value="global">\u56FD\u9645\u7248 (Global / workbuddy.ai)</option><option value="cn">\u56FD\u5185\u7248 (CN / codebuddy.cn)</option></select>
        </div>
        <div class="form-field">
          <label>\u5907\u6CE8\u6635\u79F0 (\u53EF\u9009):</label>
          <input id="addTokenNick" placeholder="\u5982\uFF1A\u4E3B\u529B\u6D4B\u8BD5\u53F7" />
        </div>
      </div>
      <div class="form-field" style="margin-bottom:12px">
        <label>\u7C98\u8D34 Refresh Token \u6216 Access Token:</label>
        <textarea id="addTokenValue" rows="4" placeholder="\u652F\u6301\u81EA\u52A8\u8BC6\u522B JWT UID\uFF0C\u4F18\u5148\u586B Refresh Token \u53EF\u957F\u671F\u81EA\u52A8\u4FDD\u6D3B"></textarea>
      </div>
      <div style="display:flex;justify-content:flex-end;gap:8px">
        <button class="btn btn-green" onclick="submitAddToken()">\u{1F680} \u9A8C\u8BC1\u8FDE\u901A\u5E76\u5165\u6C60</button>
      </div>
    </div>
  </div>

  <div id="importModal" class="modal-backdrop hidden">
    <div class="modal">
      <div class="card-title"><span>\u6279\u91CF\u5BFC\u5165\u8D26\u53F7 (ZIP / JSON / token----refreshToken)</span><button class="btn btn-sm btn-pink" onclick="closeModal('importModal')">\u5173\u95ED</button></div>
      <div class="form-field" style="margin-bottom:10px">
        <label>\u9ED8\u8BA4\u533A\u670D\uFF08\u65E0\u660E\u786E\u6807\u8BB0\u65F6\u751F\u6548\uFF09:</label>
        <select id="importRealm"><option value="global">\u56FD\u9645\u7248 (Global / workbuddy.ai)</option><option value="cn">\u56FD\u5185\u7248 (CN / codebuddy.cn)</option></select>
      </div>
      <div class="form-field" style="margin-bottom:10px"><label>\u4E0A\u4F20 .zip / .json / .txt \u6587\u4EF6:</label><input type="file" id="importFileInput" accept=".zip,.json,.txt,.info" /></div>
      <div class="form-field" style="margin-bottom:12px"><label>\u6216\u76F4\u63A5\u7C98\u8D34\u6587\u672C:</label><textarea id="importTextarea" rows="7" placeholder="accessToken----refreshToken \u6216 JSON"></textarea></div>
      <div style="display:flex;justify-content:flex-end;gap:8px"><button class="btn btn-green" onclick="submitImport()">\u{1F680} \u9A8C\u8BC1\u8FDE\u901A\u5E76\u5BFC\u5165</button></div>
      <div id="importResultBox" class="hidden" style="margin-top:12px"></div>
    </div>
  </div>

  <div id="oauthModal" class="modal-backdrop hidden">
    <div class="modal">
      <div class="card-title"><span id="oauthTitle">OAuth \u6388\u6743\u767B\u5F55</span><button class="btn btn-sm btn-pink" onclick="closeOAuthModal()">\u53D6\u6D88</button></div>
      <p style="font-size:12px;color:var(--text-dim)">\u8BF7\u5728\u65B0\u6253\u5F00\u7684\u6D4F\u89C8\u5668\u7A97\u53E3\u5B8C\u6210\u767B\u5F55\u6388\u6743\uFF0C\u63A7\u5236\u53F0\u6B63\u5728\u81EA\u52A8\u8F6E\u8BE2\u56DE\u8C03...</p>
      <div style="margin:10px 0"><a id="oauthLink" href="#" target="_blank" style="color:var(--cyan);word-break:break-all;font-size:12px"></a></div>
      <div id="oauthStatusText" class="tag tag-warn">\u7B49\u5F85\u7528\u6237\u5B8C\u6210\u7F51\u9875\u6388\u6743...</div>
    </div>
  </div>

  <div id="loginModal" class="modal-backdrop hidden">
    <div class="modal" style="width:420px">
      <div class="card-title"><span>\u{1F510} WorkBuddy 2API \u63A7\u5236\u53F0\u9274\u6743</span></div>
      <div style="display:flex;gap:6px;margin-bottom:12px">
        <button class="btn btn-sm" id="tabLoginBtn" onclick="switchAuthTab('login')">\u5BC6\u7801\u767B\u5F55</button>
        <button class="btn btn-sm hidden" id="tabRegBtn" onclick="switchAuthTab('register')">\u6CE8\u518C\u8D26\u53F7</button>
      </div>
      <div class="form-field" style="margin-bottom:10px"><label>\u7528\u6237\u540D:</label><input id="loginUser" value="admin" /></div>
      <div class="form-field" style="margin-bottom:12px"><label>\u5BC6\u7801:</label><input id="loginPass" type="password" onkeydown="if(event.key==='Enter')submitAuth()" /></div>
      <button class="btn btn-green" style="width:100%;justify-content:center" onclick="submitAuth()">\u767B\u5F55\u8FDB\u5165\u63A7\u5236\u53F0</button>
      <div id="loginErrBox" style="color:var(--magenta);font-size:12px;margin-top:8px"></div>
    </div>
  </div>

  <div id="toast" class="toast hidden"></div>

  <script>
    const API = (window.__WB2A_API_ORIGIN__ || '') + '/plugins/dsh-workbuddy2api';
    function getApiOrigin() { return window.__WB2A_API_ORIGIN__ || window.location.origin; }
    function openExternalUrl(url) {
      if (typeof window.__wb2aOpenExternal === 'function') window.__wb2aOpenExternal(url);
      else window.open(url, '_blank');
    }
    async function askConfirm(msg) {
      if (typeof window.__wb2aConfirm === 'function') return window.__wb2aConfirm(msg);
      return window.confirm(msg);
    }
    async function askPrompt(msg, defVal) {
      if (typeof window.__wb2aPrompt === 'function') return window.__wb2aPrompt(msg, defVal);
      return window.prompt(msg, defVal);
    }
    let state = { accounts: [], activeUid: null, summary: {}, models: [], aliases: {}, modelRoutes: {}, autoFreeEnabled: true, freeModels: [], config: {}, runtimeNetwork: {}, auth: {} };
    let oauthPollTimer = null;
    let pgAttachment = null; // { kind: 'image' | 'text', name, data }
    let overviewMode = 'packs';
    let overviewRealm = 'all';
    let authMode = 'login';

    function toast(msg) {
      const el = document.getElementById('toast');
      el.textContent = msg;
      el.classList.remove('hidden');
      setTimeout(() => el.classList.add('hidden'), 3500);
    }

    function escapeHtml(s) {
      return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

    async function api(path, opts = {}) {
      const res = await fetch(API + path, opts);
      const data = await res.json().catch(() => ({}));
      if (res.status === 401 && data.authRequired) {
        showLoginModal(true);
      }
      return data;
    }

    function showLoginModal(allowReg = false) {
      document.getElementById('tabRegBtn').classList.toggle('hidden', !state.auth?.allowRegister && !allowReg);
      document.getElementById('loginModal').classList.remove('hidden');
    }

    function switchAuthTab(mode) { authMode = mode; document.getElementById('loginErrBox').textContent = ''; }

    async function submitAuth() {
      const username = document.getElementById('loginUser').value.trim() || 'admin';
      const password = document.getElementById('loginPass').value;
      const endpoint = authMode === 'register' ? '/auth/register' : '/auth/login';
      const res = await fetch(API + endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        document.getElementById('loginErrBox').textContent = data.error || '\u8BA4\u8BC1\u5931\u8D25';
        return;
      }
      if (authMode === 'register') {
        authMode = 'login';
        toast('\u6CE8\u518C\u6210\u529F\uFF0C\u8BF7\u767B\u5F55');
        return;
      }
      closeModal('loginModal');
      loadStatus(true);
    }

    async function doLogout() {
      await fetch(API + '/auth/logout', { method: 'POST' });
      showLoginModal(true);
    }

    function switchTab(tab) {
      const tabs = ['pool', 'models', 'playground', 'usage', 'welfare', 'tasks', 'settings'];
      tabs.forEach((t, idx) => {
        document.getElementById('tab-' + t).classList.toggle('hidden', t !== tab);
        document.querySelectorAll('.nav-btn')[idx].classList.toggle('active', t === tab);
      });
      if (tab === 'welfare') loadWelfareAndInvite();
      if (tab === 'tasks') loadTasks();
      if (tab === 'models') loadModels();
      if (tab === 'playground') { loadModels(); loadLogs(); }
      if (tab === 'usage') loadUsage();
      if (tab === 'settings') { renderSettings(); loadAdminUsers(); checkDsh(); }
    }

    async function loadStatus(refresh = false) {
      try {
        const data = await api('/status' + (refresh ? '?refresh=1' : ''));
        if (!data.ok) return;
        state.accounts = data.accounts || [];
        state.activeUid = data.activeUid;
        state.summary = data.summary || {};
        state.aliases = data.aliases || {};
        state.modelRoutes = data.modelRoutes || {};
        state.autoFreeEnabled = data.autoFreeEnabled !== false;
        state.enabledModels = data.enabledModels || [];
        state.config = data.config || {};
        state.runtimeNetwork = data.runtimeNetwork || {};
        state.auth = data.auth || {};
        document.getElementById('gatewayBadge').textContent = 'ONLINE v' + (data.serviceVersion || '${SERVICE_VERSION}') + ' :' + (data.gatewayPort || ${port});
        const ub = document.getElementById('userBadge');
        const lb = document.getElementById('logoutBtn');
        if (state.auth.hasPassword && state.auth.currentUser) {
          ub.textContent = state.auth.currentUser.username + ' (' + state.auth.currentUser.role + ')';
          ub.classList.remove('hidden');
          lb.classList.remove('hidden');
        } else {
          ub.classList.add('hidden');
          lb.classList.add('hidden');
        }
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
      const all = s.all || {}; const cn = s.cn || {}; const gl = s.global || {};
      document.getElementById('realmSummaryCards').innerHTML = [
        { title: '\u5168\u6C60\u5408\u8BA1 (All)', kpi: all.remain, sub: '\u5065\u5EB7 ' + (all.healthyCount||0) + ' / \u542F\u7528 ' + (all.enabledCount||0) + ' / \u5171 ' + (all.count||0) + ' | \u57FA ' + (all.baseRemain||0) + ' \u8D60 ' + (all.bonusRemain||0), cls: '' },
        { title: '\u56FD\u5185\u7248 (CodeBuddy CN)', kpi: cn.remain, sub: '\u53EF\u7528 ' + (cn.enabledCount||0) + '/' + (cn.count||0) + ' | \u603B\u989D ' + (cn.total||0), cls: 'green' },
        { title: '\u56FD\u9645\u7248 (WorkBuddy AI)', kpi: gl.remain, sub: '\u53EF\u7528 ' + (gl.enabledCount||0) + '/' + (gl.count||0) + ' | 7\u65E5\u5230\u671F ' + (gl.expiringRemain||0), cls: 'pink' }
      ].map(c => '<div class="card" style="margin:0;cursor:pointer" onclick="openOverviewModal(\\'balance\\')"><div class="card-title"><span>' + c.title + '</span></div><div class="kpi ' + c.cls + '">' + Number(c.kpi||0).toLocaleString() + '</div><div class="sub-row">' + c.sub + '</div></div>').join('');
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
        if (acc.manualDisabled) healthTag = '<span class="tag tag-err">\u624B\u52A8\u505C\u7528</span>';
        else if (acc.disabled) healthTag = '<span class="tag tag-err">\u81EA\u52A8\u7981\u7528</span>';
        else if (d.coolingDown) healthTag = '<span class="tag tag-warn">\u51B7\u5374 ' + (d.cooldownRemainingSec||0) + 's</span>';
        else if (d.modelCooldowns && d.modelCooldowns.length > 0) healthTag = '<span class="tag tag-warn">' + d.modelCooldowns.length + '\u6A21\u578B\u9650\u6D41</span>';
        const chkTag = acc.checkinState ? (' <span class="tag ' + (acc.checkinState.ok ? 'tag-cn' : 'tag-warn') + '">' + (acc.checkinState.ok ? '\u4ECA\u65E5\u5DF2\u7B7E' : '\u5F85\u91CD\u8BD5') + '</span>') : '';
        const pkgText = '\u57FA:' + (b.baseRemain||0) + ' \u8D60:' + (b.bonusRemain||0) + ' \u8D2D:' + (b.purchasedRemain||0);
        return '<tr>' +
          '<td><strong>' + escapeHtml(acc.nickname || acc.uid) + '</strong>' + (isAct ? ' <span class="tag tag-cn">\u4F18\u5148</span>' : '') + '<br><span style="color:var(--text-dim);font-size:11px">' + escapeHtml(acc.uid) + '</span></td>' +
          '<td>' + realmTag + '</td>' +
          '<td style="font-weight:700;color:var(--cyan)">' + Number(b.remain || 0).toLocaleString() + '<br><span style="color:var(--text-dim);font-size:10px">/ ' + Number(b.total || 0).toLocaleString() + '</span></td>' +
          '<td style="font-size:11px;color:var(--text-dim)">' + pkgText + '<br>\u6D3B\u8DC3\u5305: ' + (b.activePackCount||0) + ' <button class="btn btn-sm" style="padding:1px 6px;margin-left:4px" onclick="openPacksModal(\\'' + acc.uid + '\\')">\u660E\u7EC6</button></td>' +
          '<td>' + healthTag + chkTag + '<br><span style="font-size:10px;color:var(--text-dim)">\u6210\u529F:' + (d.stats?.successCount||0) + ' \u5931\u8D25:' + (d.stats?.failCount||0) + '</span></td>' +
          '<td>' + (acc.inFlight || 0) + ' / ' + (d.limit || 3) + '</td>' +
          '<td style="display:flex;gap:4px;flex-wrap:wrap">' +
            (isAct ? '' : '<button class="btn btn-sm" onclick="switchAcc(\\'' + acc.uid + '\\')">\u4F18\u5148</button>') +
            '<button class="btn btn-sm" onclick="openAccountDetail(\\'' + acc.uid + '\\')">\u8BE6\u60C5</button>' +
            '<button class="btn btn-sm" onclick="openUpdateToken(\\'' + acc.uid + '\\')">\u6362Token</button>' +
            (acc.manualDisabled
              ? '<button class="btn btn-sm btn-green" onclick="adminAction(\\'' + acc.uid + '\\', \\'manualEnable\\')">\u6062\u590D</button>'
              : '<button class="btn btn-sm btn-pink" onclick="adminAction(\\'' + acc.uid + '\\', \\'disable\\')">\u505C\u7528</button>') +
            ((acc.disabled || d.coolingDown || (d.modelCooldowns && d.modelCooldowns.length))
              ? '<button class="btn btn-sm btn-amber" onclick="adminAction(\\'' + acc.uid + '\\', \\'revive\\')">\u590D\u6D3B/\u89E3\u7194\u65AD</button>' : '') +
            '<button class="btn btn-sm btn-pink" onclick="deleteAcc(\\'' + acc.uid + '\\')">\u5220</button>' +
          '</td>' +
        '</tr>';
      }).join('');
    }

    function syncUidSelectors() {
      const opts = state.accounts.map(a => '<option value="' + a.uid + '" ' + (a.uid === state.activeUid ? 'selected' : '') + '>[' + a.realm.toUpperCase() + '] ' + escapeHtml(a.nickname) + '</option>').join('');
      const wSel = document.getElementById('welfareUidSelect');
      const tSel = document.getElementById('tasksUidSelect');
      const prevW = wSel.value; const prevT = tSel.value;
      wSel.innerHTML = opts; tSel.innerHTML = opts;
      if (prevW) wSel.value = prevW; if (prevT) tSel.value = prevT;
    }

    async function switchAcc(uid) { await api('/accounts/switch', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid }) }); toast('\u5DF2\u5207\u6362\u4F18\u5148\u8D26\u53F7'); loadStatus(); }
    async function deleteAcc(uid) { if (!(await askConfirm('\u786E\u8BA4\u5220\u9664 ' + uid + ' \u5417\uFF1F'))) return; await api('/accounts/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid }) }); toast('\u5DF2\u5220\u9664'); loadStatus(); }
    async function adminAction(uid, action) {
      toast('\u6267\u884C ' + action + ' ...');
      const res = await api('/accounts/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid, action }) });
      toast(res.message || (res.ok ? '\u6210\u529F' : res.error));
      loadStatus(action === 'refresh' || action === 'trial');
    }
    async function refreshAllTokens() { toast('\u6B63\u5728\u6279\u91CF\u5237\u65B0...'); const res = await api('/accounts/refresh-all', { method: 'POST' }); toast('\u5237\u65B0: \u6210\u529F ' + res.refreshed + ', \u5931\u8D25 ' + res.failed); loadStatus(true); }
    async function clearAllCooldowns() { const res = await api('/accounts/clear-all-cooldowns', { method: 'POST' }); toast('\u5DF2\u6E05\u7406 ' + (res.cleared || 0) + ' \u6761\u51B7\u5374'); loadStatus(); }
    async function batchCheckin() { toast('\u6B63\u5728\u6279\u91CF\u7B7E\u5230...'); const res = await api('/checkin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ all: true }) }); toast(res.message || '\u5B8C\u6210'); loadStatus(true); }
    async function batchTrial() { toast('\u6B63\u5728\u4E3A\u56FD\u9645\u7248\u8D26\u53F7\u6279\u91CF\u9886 Trial...'); const res = await api('/trial/batch', { method: 'POST' }); toast('\u6267\u884C\u5B8C\u6210: ' + (res.results?.length || 0) + ' \u4E2A'); loadStatus(true); }

    function openUpdateToken(uid) {
      const acc = state.accounts.find(a => a.uid === uid);
      document.getElementById('updTokenUid').value = uid;
      document.getElementById('updTokenTitle').textContent = '\u66F4\u65B0\u51ED\u8BC1 \u2014 ' + (acc?.nickname || uid);
      document.getElementById('updAccessInput').value = '';
      document.getElementById('updRefreshInput').value = '';
      document.getElementById('updateTokenModal').classList.remove('hidden');
    }
    async function submitUpdateToken() {
      const uid = document.getElementById('updTokenUid').value;
      const accessToken = document.getElementById('updAccessInput').value.trim();
      const refreshToken = document.getElementById('updRefreshInput').value.trim();
      const res = await api('/accounts/update_token', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, accessToken, refreshToken })
      });
      toast(res.message || res.error || '\u5B8C\u6210');
      if (res.ok) { closeModal('updateTokenModal'); loadStatus(true); }
    }

    async function openAccountDetail(uid) {
      const acc = state.accounts.find(a => a.uid === uid);
      if (!acc) return;
      document.getElementById('accDetailTitle').textContent = (acc.nickname || uid) + ' (' + acc.realm.toUpperCase() + ') \u8BE6\u60C5';
      const d = acc.diagnostics || {};
      const b = acc.balance || {};
      const invRes = await api('/invite/info?uid=' + encodeURIComponent(uid)).catch(() => ({}));
      const inv = invRes.info || {};
      document.getElementById('accDetailBody').innerHTML =
        '<div><strong>UID:</strong> ' + escapeHtml(acc.uid) + ' | <strong>\u72B6\u6001:</strong> ' + (acc.disabledReason || acc.manualDisabledReason || '\u6B63\u5E38') + '</div>' +
        '<div><strong>\u5269\u4F59\u79EF\u5206:</strong> ' + (b.remain || 0) + ' / ' + (b.total || 0) + ' (7\u65E5\u8FC7\u671F: ' + (b.expiringRemain || 0) + ')</div>' +
        '<div><strong>\u4E13\u5C5E\u9080\u8BF7\u7801:</strong> ' + escapeHtml(inv.inviteCode || '-') + ' | <strong>\u53D7\u9080\u4EBA\u6570:</strong> ' + (inv.invitedCount || 0) + '</div>' +
        '<div style="margin-top:8px"><strong>\u6A21\u578B\u7EA7\u9650\u6D41\u51B7\u5374:</strong> ' + ((d.modelCooldowns || []).map(c => c.model + '(' + c.remainingSec + 's)').join(', ') || '\u65E0') + '</div>' +
        '<div class="toolbar" style="margin-top:12px">' +
          '<button class="btn btn-sm" onclick="adminAction(\\'' + uid + '\\', \\'refresh\\')">\u5237\u65B0\u4F59\u989D\u4E0EToken</button>' +
          (acc.realm === 'global' ? '<button class="btn btn-sm btn-green" onclick="adminAction(\\'' + uid + '\\', \\'trial\\')">\u9886\u53D6 Trial</button>' : '') +
          '<button class="btn btn-sm btn-amber" onclick="adminAction(\\'' + uid + '\\', \\'revive\\')">\u89E3\u9664\u51B7\u5374\u590D\u6D3B</button>' +
        '</div>';
      document.getElementById('accountDetailModal').classList.remove('hidden');
    }

    function openOverviewModal(mode) {
      overviewMode = mode;
      document.getElementById('packsModalToolbar').classList.remove('hidden');
      renderOverviewBody();
      document.getElementById('packsModal').classList.remove('hidden');
    }
    function setOverviewRealm(r) { overviewRealm = r; renderOverviewBody(); }
    function renderOverviewBody() {
      const accs = state.accounts.filter(a => overviewRealm === 'all' || a.realm === overviewRealm);
      if (overviewMode === 'balance') {
        document.getElementById('packsModalTitle').textContent = '\u5168\u6C60\u8D26\u53F7\u4F59\u989D\u603B\u89C8 (' + accs.length + '\u4E2A)';
        document.getElementById('packsModalThead').innerHTML = '<tr><th>\u8D26\u53F7</th><th>\u533A\u670D</th><th>\u5269\u4F59\u79EF\u5206</th><th>\u57FA\u7840/\u8D60\u9001/\u8D2D\u4E70</th><th>7\u65E5\u8FC7\u671F</th><th>\u72B6\u6001</th></tr>';
        document.getElementById('packsModalTbody').innerHTML = accs.map(a => {
          const b = a.balance || {};
          return '<tr><td><strong>' + escapeHtml(a.nickname) + '</strong></td><td>' + a.realm + '</td><td style="color:var(--cyan);font-weight:700">' + (b.remain || 0) + '</td><td>' + (b.baseRemain||0) + '/' + (b.bonusRemain||0) + '/' + (b.purchasedRemain||0) + '</td><td>' + (b.expiringRemain||0) + '</td><td>' + (a.disabled || a.manualDisabled ? '\u505C\u7528' : '\u6D3B\u8DC3') + '</td></tr>';
        }).join('');
      } else {
        document.getElementById('packsModalTitle').textContent = '\u5168\u6C60\u79EF\u5206\u5305\u660E\u7EC6\u6C47\u603B';
        document.getElementById('packsModalThead').innerHTML = '<tr><th>\u6240\u5C5E\u8D26\u53F7</th><th>\u5305\u540D\u79F0</th><th>\u5269\u4F59</th><th>\u603B\u91CF</th><th>\u5DF2\u7528</th><th>\u5230\u671F\u65F6\u95F4</th></tr>';
        const rows = [];
        for (const a of accs) {
          for (const p of (a.balance?.packages || [])) {
            rows.push('<tr><td>' + escapeHtml(a.nickname) + ' (' + a.realm + ')</td><td>' + escapeHtml(p.name) + '</td><td style="color:var(--cyan);font-weight:700">' + (p.remain ?? 0) + '</td><td>' + (p.size ?? p.total ?? 0) + '</td><td>' + (p.used ?? 0) + '</td><td>' + escapeHtml(p.expireTime || '\u6C38\u4E45') + '</td></tr>');
          }
        }
        document.getElementById('packsModalTbody').innerHTML = rows.join('') || '<tr><td colspan="6">\u6682\u65E0\u6D3B\u8DC3\u79EF\u5206\u5305</td></tr>';
      }
    }

    function openPacksModal(uid) {
      const acc = state.accounts.find(a => a.uid === uid);
      if (!acc) return;
      document.getElementById('packsModalToolbar').classList.add('hidden');
      const packs = acc.balance?.packages || [];
      document.getElementById('packsModalTitle').textContent = (acc.nickname || uid) + ' \u2014 \u79EF\u5206\u5305\u660E\u7EC6 (' + packs.length + '\u4E2A)';
      document.getElementById('packsModalThead').innerHTML = '<tr><th>\u79EF\u5206\u5305\u540D\u79F0</th><th>\u7C7B\u578B</th><th>\u5269\u4F59</th><th>\u603B\u91CF</th><th>\u5DF2\u7528</th><th>\u5230\u671F\u65F6\u95F4</th></tr>';
      document.getElementById('packsModalTbody').innerHTML = packs.map(p =>
        '<tr><td>' + escapeHtml(p.name) + '</td><td>' + escapeHtml(p.type || '-') + '</td><td style="font-weight:700;color:var(--cyan)">' + (p.remain ?? 0) + '</td><td>' + (p.size ?? p.total ?? 0) + '</td><td>' + (p.used ?? 0) + '</td><td>' + escapeHtml(p.expireTime || '\u6C38\u4E45') + '</td></tr>'
      ).join('') || '<tr><td colspan="6" style="color:var(--text-dim)">\u6682\u65E0\u6FC0\u6D3B\u79EF\u5206\u5305\u8BB0\u5F55</td></tr>';
      document.getElementById('packsModal').classList.remove('hidden');
    }

    async function startOAuth(realm) {
      const res = await api('/oauth/start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ realm }) });
      if (!res.ok) return toast('\u53D1\u8D77\u5931\u8D25: ' + res.error);
      document.getElementById('oauthTitle').textContent = (realm === 'global' ? '\u56FD\u9645\u7248 WorkBuddy AI' : '\u56FD\u5185\u7248 CodeBuddy') + ' OAuth \u767B\u5F55';
      document.getElementById('oauthLink').href = res.url; document.getElementById('oauthLink').textContent = res.url;
      document.getElementById('oauthModal').classList.remove('hidden');
      openExternalUrl(res.url);
      if (oauthPollTimer) clearInterval(oauthPollTimer);
      oauthPollTimer = setInterval(async () => {
        const poll = await api('/oauth/poll', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ realm, state: res.state }) });
        if (poll.success) {
          clearInterval(oauthPollTimer); oauthPollTimer = null;
          closeModal('oauthModal'); toast('\u767B\u5F55\u6210\u529F: ' + (poll.account?.account?.nickname || '\u65B0\u8D26\u53F7')); loadStatus(true);
        }
      }, 2000);
    }
    function closeOAuthModal() { if (oauthPollTimer) clearInterval(oauthPollTimer); oauthPollTimer = null; closeModal('oauthModal'); }
    function openImportModal() { document.getElementById('importResultBox').classList.add('hidden'); document.getElementById('importModal').classList.remove('hidden'); }
    function openAddTokenModal() {
      document.getElementById('addTokenValue').value = '';
      document.getElementById('addTokenNick').value = '';
      document.getElementById('addTokenModal').classList.remove('hidden');
    }
    async function submitAddToken() {
      const token = document.getElementById('addTokenValue').value.trim();
      const nickname = document.getElementById('addTokenNick').value.trim();
      const realm = document.getElementById('addTokenRealm').value || 'global';
      if (!token) return toast('\u8BF7\u5148\u7C98\u8D34 Access \u6216 Refresh Token');
      toast('\u6B63\u5728\u9A8C\u8BC1\u8D26\u53F7\u8FDE\u901A\u6027\u5E76\u5165\u6C60...');
      const res = await api('/accounts/add', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, realm, nickname }) });
      if (!res.ok) return toast('\u274C \u6DFB\u52A0\u5931\u8D25: ' + (res.error || '\u672A\u77E5\u9519\u8BEF'));
      closeModal('addTokenModal');
      toast('\u2705 \u5DF2\u6DFB\u52A0\u8D26\u53F7: ' + (res.account?.account?.nickname || '\u65B0\u8D26\u53F7'));
      loadStatus(true);
    }
    async function submitImport() {
      const realm = document.getElementById('importRealm').value;
      const fileEl = document.getElementById('importFileInput');
      let payload = { defaultRealm: realm, content: document.getElementById('importTextarea').value };
      if (fileEl.files && fileEl.files[0]) {
        const bytes = new Uint8Array(await fileEl.files[0].arrayBuffer());
        let bin = ''; for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
        payload = { defaultRealm: realm, base64Zip: btoa(bin) };
      }
      const res = await api('/accounts/import', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const box = document.getElementById('importResultBox');
      const items = res.details || res.results || res.items || [];
      const rowsHtml = items.slice(0, 30).map(it =>
        '<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #e2e8f0;font-size:11px">' +
          '<span><strong>' + escapeHtml(it.nickname || it.uid || '\u672A\u547D\u540D') + '</strong> \xB7 ' + escapeHtml(it.realm || realm) + '</span>' +
          '<span class="tag ' + (it.ok !== false ? 'tag-cn' : 'tag-err') + '">' + escapeHtml(it.status || (it.ok !== false ? '\u6210\u529F' : (it.error || '\u5931\u8D25'))) + '</span>' +
        '</div>'
      ).join('');
      box.innerHTML =
        '<div style="padding:10px;border-radius:8px;background:#f8fafc;border:1px solid #dbe5f1">' +
          '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:' + (rowsHtml ? '8px' : '0') + '">' +
            '<span class="tag tag-cn">\u2705 \u65B0\u589E ' + (res.imported || 0) + ' \u4E2A</span>' +
            '<span class="tag tag-global">\u{1F504} \u66F4\u65B0 ' + (res.updated || 0) + ' \u4E2A</span>' +
            '<span class="tag ' + ((res.failed || 0) > 0 ? 'tag-err' : 'tag-cn') + '">\u274C \u5931\u8D25 ' + (res.failed || 0) + ' \u4E2A</span>' +
            (res.error ? '<span style="font-size:11px;color:var(--magenta)">' + escapeHtml(res.error) + '</span>' : (!res.total ? '<span style="font-size:11px;color:var(--amber)">\u672A\u8BC6\u522B\u5230\u6709\u6548\u8D26\u53F7\uFF0C\u8BF7\u68C0\u67E5\u7C98\u8D34\u683C\u5F0F</span>' : '')) +
          '</div>' +
          rowsHtml +
        '</div>';
      box.classList.remove('hidden');
      toast('\u5BFC\u5165\u5B8C\u6210: \u65B0\u589E ' + (res.imported || 0) + ' / \u66F4\u65B0 ' + (res.updated || 0) + ' / \u5931\u8D25 ' + (res.failed || 0)); loadStatus(true);
    }
    function exportZip() {
      if (typeof window.__wb2aExportZip === 'function') window.__wb2aExportZip();
      else window.location.href = API + '/accounts/export.zip';
    }

    function setWelfareResult(summary, badgeText, badgeCls, rowsHtml) {
      const b = document.getElementById('welfareSummaryBadge');
      if (b) { b.textContent = badgeText || '\u5B8C\u6210'; b.className = 'tag ' + (badgeCls || 'tag-cn'); }
      const box = document.getElementById('welfareResultBox');
      if (box) {
        box.innerHTML = '<div style="font-weight:600;color:#0f172a;margin-bottom:8px">' + escapeHtml(summary) + '</div>' + (rowsHtml || '');
      }
    }

    function renderBatchAccountTable(items, mode) {
      if (!Array.isArray(items) || items.length === 0) return '<div class="sub-row">\u672C\u6B21\u6682\u65E0\u7B26\u5408\u6761\u4EF6\u7684\u56FD\u5185\u7248\u6216\u53EF\u7528\u8D26\u53F7\u3002</div>';
      return '<div style="overflow-x:auto"><table><thead><tr><th>\u8D26\u53F7</th><th>\u72B6\u6001</th><th>\u7ED3\u679C\u8BE6\u60C5</th><th>\u6536\u76CA</th></tr></thead><tbody>' +
        items.map(it => {
          let detail = it.message || it.summary || it.status || '-';
          let gain = '-';
          let ok = it.ok !== false && it.status !== 'error' && it.status !== 'adopt_failed';
          if (mode === 'travel') {
            const acts = it.results?.actions || [];
            detail = acts.length ? acts.map(a => a.message || a.action).join('\uFF1B') : (it.detail || it.reason || it.status || '\u5DF2\u5B8C\u6210');
            const c = acts.reduce((acc, a) => acc + Number(a.rewardCredit || 0), 0);
            if (c > 0) gain = '+' + c + ' \u79EF\u5206';
          } else if (mode === 'welfare') {
            const c = Number(it.totalCreditsGained || 0);
            if (c > 0) gain = '+' + c + ' \u79EF\u5206';
            const steps = Array.isArray(it.log) ? it.log.filter(l => l.ok && l.message).slice(0, 3).map(l => l.message).join(' \xB7 ') : '';
            if (steps) detail = steps;
          } else if (mode === 'school') {
            const c = Number(it.creditGained || 0);
            if (c > 0) gain = '+' + c + ' \u79EF\u5206';
            detail = it.summary || it.message || it.error || '\u5DF2\u5B8C\u6210';
          }
          return '<tr><td><strong>' + escapeHtml(it.nickname || it.uid || '-') + '</strong></td>' +
            '<td><span class="tag ' + (ok ? 'tag-cn' : 'tag-warn') + '">' + (ok ? '\u6210\u529F' : '\u8DF3\u8FC7/\u5F02\u5E38') + '</span></td>' +
            '<td>' + escapeHtml(detail) + '</td>' +
            '<td style="font-weight:700;color:var(--emerald)">' + escapeHtml(gain) + '</td></tr>';
        }).join('') +
      '</tbody></table></div>';
    }

    async function loadWelfareAndInvite() {
      const uid = document.getElementById('welfareUidSelect').value || state.activeUid; if (!uid) return;
      const [tr, gr, inv] = await Promise.all([
        api('/travel/status?uid=' + encodeURIComponent(uid)),
        api('/growth/status?uid=' + encodeURIComponent(uid)),
        api('/invite/info?uid=' + encodeURIComponent(uid))
      ]);
      const trBox = document.getElementById('travelVisualBox');
      const btnAdopt = document.getElementById('btnAdoptCat');
      const btnClaim = document.getElementById('btnClaimCat');
      if (!tr.ok || tr.travel?.isGlobal) {
        btnAdopt.classList.add('hidden'); btnClaim.classList.add('hidden');
        trBox.innerHTML = '<span class="tag tag-global">\u56FD\u9645\u7248\u65E0\u732B\u732B\u4F53\u7CFB</span> <span style="color:var(--text-dim)">' + escapeHtml(tr.travel?.message || tr.message || '\u8BF7\u5207\u6362 CN \u56FD\u5185\u7248\u8D26\u53F7') + '</span>';
      } else {
        const buddy = tr.buddy;
        const ts = tr.travel || {};
        btnAdopt.classList.toggle('hidden', Boolean(buddy));
        btnClaim.classList.toggle('hidden', ts.state !== 'arrived');
        const stMap = { idle: '\u7A7A\u95F2\u5F85\u6D3E\u51FA', traveling: '\u65C5\u884C\u63A2\u7D22\u4E2D', arrived: '\u{1F389} \u5DF2\u5230\u7AD9\u53EF\u9886\u5956', unsupported: '\u4E0D\u652F\u6301', error: '\u67E5\u8BE2\u5F02\u5E38' };
        const stCls = ts.state === 'arrived' ? 'tag-cn' : ts.state === 'traveling' ? 'tag-global' : 'tag-warn';
        trBox.innerHTML =
          '<div><strong>\u5BA0\u7269\u6863\u6848:</strong> ' + (buddy ? ('<span class="tag tag-cn">' + escapeHtml(buddy.name) + '</span>') : '<span class="tag tag-warn">\u5C1A\u672A\u9886\u517B\uFF08\u70B9\u53F3\u4E0A\u89D2\u9886\u517B\u9001 300 \u5206\uFF09</span>') + '</div>' +
          '<div style="margin-top:4px"><strong>\u65C5\u884C\u72B6\u6001:</strong> <span class="tag ' + stCls + '">' + escapeHtml(stMap[ts.state] || ts.state || '\u672A\u77E5') + '</span>' +
          ' \xB7 \u5F85\u9886\u5956\u52B1: <strong style="color:var(--emerald)">+' + (ts.rewardCredit || 0) + ' \u79EF\u5206</strong>' +
          (ts.dailyLimitReached ? ' \xB7 <span class="tag tag-err">\u4ECA\u65E5\u6B21\u6570\u5DF2\u8FBE\u4E0A\u9650</span>' : '') + '</div>';
      }

      document.getElementById('inviteBox').innerHTML = inv.ok
        ? '<div><strong>\u4E13\u5C5E\u9080\u8BF7\u7801:</strong> <span style="color:var(--cyan);font-weight:700;font-size:14px">' + escapeHtml(inv.info.inviteCode || '\u6682\u672A\u5206\u914D') + '</span></div>' +
          '<div><strong>\u9080\u8BF7\u6218\u7EE9:</strong> \u5DF2\u9080 <strong>' + (inv.info.invitedCount || 0) + '</strong> \u4EBA (\u6709\u6548 ' + (inv.info.validInviteCount || 0) + ') \xB7 \u7D2F\u8BA1\u83B7\u5956 <strong style="color:var(--emerald)">+' + (inv.info.rewardCredit || 0) + '</strong> / ' + (inv.info.capValue || 30000) + ' \u79EF\u5206</div>' +
          '<div><strong>\u9080\u8BF7\u94FE\u63A5:</strong> ' + (inv.info.inviteUrl ? '<a style="color:var(--cyan)" target="_blank" href="' + escapeHtml(inv.info.inviteUrl) + '">' + escapeHtml(inv.info.inviteUrl) + '</a>' : '-') + '</div>'
        : '<span style="color:var(--text-dim)">\u65E0\u6CD5\u83B7\u53D6\u9080\u8BF7\u4FE1\u606F</span>';

      const sk = gr.streak || {};
      const cards = sk.makeupCards?.balance || 0;
      const chances = typeof gr.chances === 'number' ? gr.chances : (gr.chancesRemaining || 0);
      const tiers = gr.tiers || [];
      const tierHtml = tiers.map(t => {
        const av = t.status === 'available';
        const cl = t.status === 'claimed';
        return '<div style="border:1px solid #dbe5f1;border-radius:8px;padding:8px 12px;background:#f8fafc;display:flex;align-items:center;gap:10px">' +
          '<div><strong>' + escapeHtml(t.label) + '</strong><br><span style="font-size:11px;color:var(--text-dim)">' + (cl ? '\u2705 \u5DF2\u5151\u6362' : av ? '\u{1F31F} \u53EF\u9886\u53D6' : '\u23F3 \u672A\u89E3\u9501') + '</span></div>' +
          (av ? '<button class="btn btn-sm btn-green" onclick="redeemTier(\\'' + t.tier + '\\')">\u7ACB\u5373\u5151\u6362</button>' : '') +
        '</div>';
      }).join('');
      document.getElementById('streakVisualBox').innerHTML =
        '<div style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:10px">' +
          '<span><strong>\u5F53\u524D\u8FDE\u767B:</strong> <span class="tag tag-cn">' + (sk.days || 0) + ' \u5929</span></span>' +
          '<span><strong>\u8865\u7B7E\u5361\u4F59\u989D:</strong> <span class="tag tag-global">' + cards + ' / ' + (sk.makeupCards?.max || 3) + ' \u5F20</span></span>' +
          '<span><strong>\u5269\u4F59\u62BD\u5956\u6B21\u6570:</strong> <span class="tag ' + (chances > 0 ? 'tag-warn' : 'tag-global') + '">' + chances + ' \u6B21</span></span>' +
        '</div>' +
        '<div style="display:flex;gap:10px;flex-wrap:wrap">' + tierHtml + '</div>';
    }

    async function adoptCat() {
      const uid = document.getElementById('welfareUidSelect').value || state.activeUid;
      toast('\u6B63\u5728\u9886\u517B\u7B2C\u4E00\u53EA AI \u5C0F\u732B...');
      const res = await api('/travel/adopt', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid }) });
      setWelfareResult(res.message || (res.ok ? '\u9886\u517B\u6210\u529F +300 \u79EF\u5206' : '\u9886\u517B\u672A\u5B8C\u6210'), res.ok ? '\u9886\u517B\u6210\u529F' : '\u63D0\u793A', res.ok ? 'tag-cn' : 'tag-warn', '');
      loadWelfareAndInvite(); loadStatus(true);
    }
    async function claimCatReward() {
      const uid = document.getElementById('welfareUidSelect').value || state.activeUid;
      const tr = await api('/travel/status?uid=' + encodeURIComponent(uid));
      const recordId = tr.travel?.recordId || 0;
      const res = await api('/travel/claim', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid, recordId }) });
      setWelfareResult(res.message || '\u65C5\u884C\u5956\u52B1\u68C0\u67E5\u5B8C\u6210', res.ok ? '\u9886\u5956\u6210\u529F' : '\u63D0\u793A', res.ok ? 'tag-cn' : 'tag-warn', '');
      loadWelfareAndInvite(); loadStatus(true);
    }
    async function runSingleTravel() {
      const uid = document.getElementById('welfareUidSelect').value || state.activeUid;
      toast('\u6B63\u5728\u81EA\u52A8\u5DE1\u68C0\u5F53\u524D\u8D26\u53F7\u732B\u732B...');
      const res = await api('/travel/run', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid }) });
      setWelfareResult(res.summary || '\u5DE1\u68C0\u5B8C\u6210', res.ok ? '\u5B8C\u6210' : '\u8DF3\u8FC7', res.ok ? 'tag-cn' : 'tag-warn', '');
      loadWelfareAndInvite(); loadStatus(true);
    }
    async function departTravel() {
      const uid = document.getElementById('welfareUidSelect').value || state.activeUid;
      const locationId = Number(document.getElementById('travelLocSelect').value || 4);
      const res = await api('/travel/depart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid, locationId }) });
      setWelfareResult(res.message || '\u6D3E\u51FA\u6307\u4EE4\u5DF2\u63D0\u4EA4', res.ok ? '\u5DF2\u6D3E\u51FA' : '\u63D0\u793A', res.ok ? 'tag-cn' : 'tag-warn', '');
      loadWelfareAndInvite();
    }
    async function batchRunTravel() {
      toast('\u6B63\u5728\u5168\u53F7\u5DE1\u68C0\u732B\u732B\u65C5\u884C...');
      const res = await api('/travel/run-all', { method: 'POST' });
      setWelfareResult(res.message || '\u5168\u6C60\u732B\u732B\u5DE1\u68C0\u5B8C\u6210', '\u5168\u6C60\u5DE1\u68C0', 'tag-cn', renderBatchAccountTable(res.results, 'travel'));
      toast('\u5DE1\u68C0\u5B8C\u6210'); loadStatus(true);
    }
    async function batchClaimAll() {
      toast('\u6B63\u5728\u4E3A\u6240\u6709\u8D26\u53F7\u81EA\u52A8\u9886\u6EE1\u5168\u5957\u798F\u5229...');
      const res = await api('/growth/claim-all', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ all: true }) });
      setWelfareResult(res.message || '\u5168\u53F7\u798F\u5229\u9886\u53D6\u5B8C\u6210', '\u5168\u53F7\u5B8C\u6210', 'tag-cn', renderBatchAccountTable(res.results, 'welfare'));
      toast('\u5168\u53F7\u798F\u5229\u5B8C\u6210'); loadStatus(true);
    }
    async function singleCheckin() {
      const uid = document.getElementById('welfareUidSelect').value || state.activeUid;
      const res = await api('/checkin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid }) });
      setWelfareResult(res.message || '\u7B7E\u5230\u5B8C\u6210', res.ok ? '\u7B7E\u5230\u6210\u529F' : '\u5DF2\u7B7E/\u8DF3\u8FC7', res.ok ? 'tag-cn' : 'tag-warn', '');
      toast(res.message || '\u5B8C\u6210'); loadStatus(true);
    }
    async function claimGiftAndComp() {
      const uid = document.getElementById('welfareUidSelect').value || state.activeUid;
      const res = await api('/growth/gift', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid }) });
      const rows = (res.items || []).map(it =>
        '<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #e2e8f0"><span><strong>' + escapeHtml(it.name) + '</strong>: ' + escapeHtml(it.message || '-') + '</span><span class="tag ' + (it.ok ? 'tag-cn' : 'tag-warn') + '">' + (it.credit ? '+' + it.credit + '\u5206' : (it.ok ? '\u6210\u529F' : '\u5DF2\u9886/\u65E0')) + '</span></div>'
      ).join('');
      setWelfareResult(res.message || '\u793C\u5305\u68C0\u67E5\u5B8C\u6210', '\u793C\u5305/\u6D3B\u8DC3', 'tag-cn', rows);
      loadStatus(true);
    }
    async function redeemTier(tier) {
      const uid = document.getElementById('welfareUidSelect').value || state.activeUid;
      const res = await api('/growth/redeem', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid, tier }) });
      setWelfareResult(res.message || '\u5151\u6362\u5B8C\u6210', res.ok ? '\u5DF2\u5151\u6362' : '\u63D0\u793A', res.ok ? 'tag-cn' : 'tag-warn', '');
      loadWelfareAndInvite(); loadStatus(true);
    }
    async function runMakeupCard() {
      const uid = document.getElementById('welfareUidSelect').value || state.activeUid;
      const res = await api('/growth/makeup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid }) });
      setWelfareResult(res.message || '\u8865\u7B7E\u68C0\u67E5\u5B8C\u6210', res.ok ? '\u5DF2\u8865\u7B7E' : '\u65E0\u9700\u8865\u7B7E', res.ok ? 'tag-cn' : 'tag-global', '');
      loadWelfareAndInvite();
    }
    async function drawLottery() {
      const uid = document.getElementById('welfareUidSelect').value || state.activeUid;
      const res = await api('/growth/lottery/draw', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid }) });
      const r = res.result || {};
      setWelfareResult(r.message || (r.ok ? '\u62BD\u5956\u6210\u529F' : '\u6682\u65E0\u53EF\u7528\u62BD\u5956\u6B21\u6570'), r.ok ? '\u{1F389} \u4E2D\u5956' : '\u63D0\u793A', r.ok ? 'tag-cn' : 'tag-warn', '');
      loadWelfareAndInvite(); loadStatus(true);
    }
    async function bindInvite() {
      const uid = document.getElementById('welfareUidSelect').value || state.activeUid;
      const inviteCode = document.getElementById('bindInviteInput').value.trim();
      const res = await api('/invite/bind', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid, inviteCode }) });
      toast(res.message || '\u5B8C\u6210');
      setWelfareResult(res.message || '\u9080\u8BF7\u7ED1\u5B9A\u5904\u7406\u5B8C\u6BD5', res.ok ? '\u7ED1\u5B9A\u6210\u529F' : '\u7ED1\u5B9A\u5931\u8D25', res.ok ? 'tag-cn' : 'tag-err', '');
    }

    async function loadSchoolStatus(uid) {
      const badge = document.getElementById('schoolStatusBadge');
      const box = document.getElementById('schoolVisualBox');
      if (!badge || !box) return;
      const res = await api('/school/status?uid=' + encodeURIComponent(uid));
      const st = res.status || {};
      if (st.skipped) {
        badge.textContent = '\u4EC5\u56FD\u5185\u7248\u652F\u6301'; badge.className = 'tag tag-global';
        box.textContent = '\u5F53\u524D\u9009\u4E2D\u8D26\u53F7\u4E3A\u56FD\u9645\u7248 (Global)\uFF0C\u5F00\u5B66\u5B63\u6D3B\u52A8\u4E0E\u62BD\u5956\u4EC5\u652F\u6301\u4E2D\u56FD\u533A\u8D26\u53F7\u3002';
        return;
      }
      if (!st.ok) {
        badge.textContent = '\u62C9\u53D6\u5931\u8D25'; badge.className = 'tag tag-err';
        box.textContent = st.error || '\u67E5\u8BE2\u5F00\u5B66\u5B63\u6D3B\u52A8\u5931\u8D25';
        return;
      }
      if (!st.inPeriod) {
        badge.textContent = '\u5F53\u524D\u672A\u5728\u6D3B\u52A8\u671F'; badge.className = 'tag tag-warn';
        box.textContent = '\u5F53\u524D\u8D26\u53F7\u5F00\u5B66\u5B63\u6D3B\u52A8\u7A97\u53E3\u6682\u672A\u5F00\u542F (in_period=false)\u3002';
        return;
      }
      badge.textContent = '\u6D3B\u52A8\u8FDB\u884C\u4E2D \xB7 \u62BD\u5956\u4F59\u989D ' + (st.chance?.balance || 0) + ' \u6B21';
      badge.className = 'tag tag-cn';
      const ts = st.tasks || [];
      box.innerHTML = ts.map(t => {
        const done = t.status === 'claimed' || t.status === 'completed';
        return '<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #edf2f7">' +
          '<span><strong>' + escapeHtml(t.title || t.task_code) + '</strong> <span style="color:var(--text-dim)">(' + (t.progress || 0) + '/' + (t.target_count || 1) + ')</span></span>' +
          '<span class="tag ' + (done ? 'tag-cn' : 'tag-warn') + '">' + escapeHtml(t.status || 'pending') + '</span></div>';
      }).join('') || '\u6D3B\u52A8\u8FDB\u884C\u4E2D\uFF0C\u53EF\u76F4\u63A5\u70B9\u51FB\u4E0A\u65B9\u300C\u5F00\u5B66\u5B63\u4EFB\u52A1+\u8F6C\u76D8\u300D\u6267\u884C\u6253\u5361\u4E0E\u62BD\u5956\u3002';
    }

    async function loadTasks() {
      const uid = document.getElementById('tasksUidSelect').value || state.activeUid; if (!uid) return;
      loadSchoolStatus(uid);
      const res = await api('/tasks/list?uid=' + encodeURIComponent(uid));
      const listEl = document.getElementById('tasksList');
      if (!res.ok) { listEl.innerHTML = '<div style="color:var(--magenta)">' + escapeHtml(res.message || '\u52A0\u8F7D\u5931\u8D25') + '</div>'; return; }
      const items = res.tasks || [];
      const claimedCnt = items.filter(t => t.accept_status === 'claimed').length;
      document.getElementById('tasksSummary').textContent = '\u5171 ' + items.length + ' \u9879 (\u5DF2\u9886\u5956 ' + claimedCnt + ' \u9879)';
      listEl.innerHTML = items.map(t => {
        const st = t.accept_status || 'pending';
        const cur = t.progress?.current ?? 0;
        const tgt = t.progress?.target ?? 1;
        const rew = t.reward_credit ? ('+' + t.reward_credit + ' \u5206') : '';
        const stLabel = st === 'claimed' ? '\u2705 \u5DF2\u9886\u5956' : st === 'completed' ? '\u{1F31F} \u53EF\u9886\u53D6' : st === 'accepted' ? '\u23F3 \u8FDB\u884C\u4E2D' : '\u26AA \u5F85\u89E6\u53D1';
        const stCls = st === 'claimed' ? 'tag-cn' : st === 'completed' ? 'tag-warn' : st === 'accepted' ? 'tag-global' : 'tag-err';
        return '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #e2e8f0;font-size:12px">' +
          '<div><strong>' + escapeHtml(t.title || t.task_code || '\u672A\u547D\u540D\u4EFB\u52A1') + '</strong> <span style="color:var(--text-dim)">(' + escapeHtml(t.task_code || '-') + ')</span>' +
          (rew ? ' <span class="tag tag-global">' + rew + '</span>' : '') + '</div>' +
          '<div style="display:flex;gap:8px;align-items:center"><span style="color:var(--text-dim);font-size:11px">\u8FDB\u5EA6 ' + cur + '/' + tgt + '</span><span class="tag ' + stCls + '">' + stLabel + '</span></div></div>';
      }).join('') || '<div class="sub-row">\u5F53\u524D\u8D26\u53F7\u6682\u65E0\u53EF\u67E5\u8BE2\u6210\u957F\u4EFB\u52A1\uFF08\u6210\u957F\u4EFB\u52A1\u4EC5\u9762\u5411\u56FD\u5185\u7248\u8D26\u53F7\uFF09</div>';
    }

    async function runTasks(all) {
      const uid = document.getElementById('tasksUidSelect').value || state.activeUid;
      toast('\u6B63\u5728\u81EA\u52A8\u70B9\u4EAE\u4E0E\u6536\u5272\u6210\u957F\u4EFB\u52A1...');
      const res = await api('/tasks/run', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid, all }) });
      if (all) toast('\u5168\u6C60\u6210\u957F\u4EFB\u52A1\u5DF2\u5B8C\u6210 (' + (res.results?.length || 0) + ' \u4E2A\u56FD\u5185\u53F7)');
      else toast(res.result?.summary || '\u6210\u957F\u4EFB\u52A1\u6267\u884C\u5B8C\u6210');
      loadTasks(); loadStatus(true);
    }

    async function runSchoolActivity(all) {
      const uid = document.getElementById('tasksUidSelect').value || state.activeUid;
      toast(all ? '\u6B63\u5728\u5168\u6C60\u5DE1\u68C0\u5F00\u5B66\u5B63\u6D3B\u52A8\u4E0E\u8F6C\u76D8\u62BD\u5956...' : '\u6B63\u5728\u6267\u884C\u5355\u53F7\u5F00\u5B66\u5B63\u6D3B\u52A8\u4E0E\u8F6C\u76D8\u62BD\u5956...');
      const res = await api('/school/run', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid, all }) });
      const badge = document.getElementById('schoolStatusBadge');
      const box = document.getElementById('schoolVisualBox');
      if (all) {
        badge.textContent = '\u5168\u6C60\u5DF2\u5B8C\u6210'; badge.className = 'tag tag-cn';
        box.innerHTML = renderBatchAccountTable(res.results, 'school');
      } else {
        const r = res.result || {};
        badge.textContent = r.inPeriod === false ? '\u672A\u5728\u6D3B\u52A8\u671F' : ('+' + (r.creditGained || 0) + ' \u79EF\u5206');
        badge.className = 'tag ' + (r.ok ? 'tag-cn' : 'tag-err');
        const prizeTags = (r.prizes || []).map(p => '<span class="tag tag-cn">\u{1F381} ' + escapeHtml(p.label || p.prizeCode) + (p.credit ? ' (+' + p.credit + ')' : '') + '</span>').join(' ');
        box.innerHTML = '<div style="font-weight:600;color:#0f172a;margin-bottom:6px">' + escapeHtml(r.summary || r.message || r.error || '\u6267\u884C\u5B8C\u6BD5') + '</div>' + (prizeTags ? '<div>\u672C\u8F6E\u8F6C\u76D8\u5956\u54C1: ' + prizeTags + '</div>' : '');
      }
      toast('\u5F00\u5B66\u5B63\u6D3B\u52A8\u4E0E\u62BD\u5956\u5B8C\u6210');
      loadStatus(true);
    }

    async function runNightCat() {
      toast('\u6B63\u5728\u68C0\u67E5\u5E76\u8FD0\u884C\u6DF1\u591C\u732B\u732B\u4EFB\u52A1...');
      const res = await api('/tasks/nightcat', { method: 'POST' });
      toast(res.message || '\u5B8C\u6210');
      if (res.ok) loadTasks();
    }

    function rateBadgeHtml(m) {
      const rate = m?.rate || '-';
      const mul = typeof m?.multiplier === 'number' ? m.multiplier : null;
      let cls = 'tag-global';
      if (m?.isFree || mul === 0) cls = 'tag-cn';
      else if (mul !== null && mul > 3.0) cls = 'tag-err';
      else if (mul !== null && mul > 1.0) cls = 'tag-warn';
      const label = (m?.isFree || mul === 0) ? ('\u514D\u8D39 ' + rate) : rate;
      const extraBadge = m?.badge ? ' <span class="tag tag-err">' + escapeHtml(m.badge) + '</span>' : '';
      return '<span class="tag ' + cls + '">' + escapeHtml(label) + '</span>' + extraBadge;
    }

    function renderVisualRoutesAndAliases() {
      const rList = document.getElementById('routesVisualList');
      const aList = document.getElementById('aliasesVisualList');
      if (rList) {
        const rEntries = Object.entries(state.modelRoutes || {});
        rList.innerHTML = rEntries.map(([g, ts]) =>
          '<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 8px;background:#f8fafc;border:1px solid #dbe5f1;border-radius:8px;font-size:11px">' +
            '<span><strong style="color:var(--cyan)">' + escapeHtml(g) + '</strong> \u2794 ' + escapeHtml(Array.isArray(ts) ? ts.join(' \u2192 ') : String(ts)) + '</span>' +
            '<button class="btn btn-sm btn-pink" onclick="removeVisualRoute(\\'' + escapeHtml(g) + '\\')">\u5220</button>' +
          '</div>'
        ).join('') || '<div class="sub-row">\u6682\u672A\u914D\u7F6E\u81EA\u5B9A\u4E49\u8DEF\u7531\u7EC4</div>';
      }
      if (aList) {
        const aEntries = Object.entries(state.aliases || {});
        aList.innerHTML = aEntries.map(([from, to]) =>
          '<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 8px;background:#f8fafc;border:1px solid #dbe5f1;border-radius:8px;font-size:11px">' +
            '<span><strong>' + escapeHtml(from) + '</strong> \u2794 <span style="color:var(--emerald)">' + escapeHtml(to) + '</span></span>' +
            '<button class="btn btn-sm btn-pink" onclick="removeVisualAlias(\\'' + escapeHtml(from) + '\\')">\u5220</button>' +
          '</div>'
        ).join('') || '<div class="sub-row">\u6682\u672A\u914D\u7F6E\u6A21\u578B\u522B\u540D</div>';
      }
      const rtArea = document.getElementById('modelRoutesTextarea');
      const alArea = document.getElementById('aliasesTextarea');
      if (rtArea) rtArea.value = JSON.stringify(state.modelRoutes || {}, null, 2);
      if (alArea) alArea.value = JSON.stringify(state.aliases || {}, null, 2);
    }
    function syncVisualFromJson() {
      try {
        state.modelRoutes = JSON.parse(document.getElementById('modelRoutesTextarea').value || '{}');
        state.aliases = JSON.parse(document.getElementById('aliasesTextarea').value || '{}');
        renderVisualRoutesAndAliases();
      } catch (_) {}
    }
    function addVisualRoute() {
      const name = document.getElementById('newRouteName').value.trim();
      const ts = document.getElementById('newRouteTargets').value.split(',').map(s => s.trim()).filter(Boolean);
      if (!name || ts.length === 0) return toast('\u8BF7\u586B\u5199\u7EC4\u540D\u548C\u81F3\u5C11\u4E00\u4E2A\u76EE\u6807\u6A21\u578B');
      state.modelRoutes = { ...(state.modelRoutes || {}), [name]: ts };
      document.getElementById('newRouteName').value = '';
      document.getElementById('newRouteTargets').value = '';
      renderVisualRoutesAndAliases();
    }
    function removeVisualRoute(name) {
      const next = { ...(state.modelRoutes || {}) }; delete next[name]; state.modelRoutes = next;
      renderVisualRoutesAndAliases();
    }
    function addVisualAlias() {
      const from = document.getElementById('newAliasFrom').value.trim();
      const to = document.getElementById('newAliasTo').value.trim();
      if (!from || !to) return toast('\u8BF7\u586B\u5199\u8BF7\u6C42\u6A21\u578B\u540D\u548C\u6620\u5C04\u76EE\u6807');
      state.aliases = { ...(state.aliases || {}), [from]: to };
      document.getElementById('newAliasFrom').value = '';
      document.getElementById('newAliasTo').value = '';
      renderVisualRoutesAndAliases();
    }
    function removeVisualAlias(from) {
      const next = { ...(state.aliases || {}) }; delete next[from]; state.aliases = next;
      renderVisualRoutesAndAliases();
    }
    function addClaudePresetAliases() {
      state.aliases = {
        ...(state.aliases || {}),
        'claude-sonnet-4-6': 'global:gpt-6.1-sol',
        'claude-opus-4-6': 'global:gpt-6-astra',
        'claude-haiku-4-5': 'cn:deepseek-v4.1-flash'
      };
      renderVisualRoutesAndAliases();
      toast('\u5DF2\u6DFB\u52A0 Claude Code \u5E38\u7528\u522B\u540D\u6620\u5C04\uFF08\u70B9\u51FB\u4FDD\u5B58\u6309\u94AE\u751F\u6548\uFF09');
    }

    async function loadModels() {
      const res = await api('/models'); if (!res.ok) return;
      state.models = res.models || []; state.enabledModels = res.enabledModels || [];
      state.aliases = res.aliases || {}; state.freeModels = res.freeModels || [];
      state.modelRoutes = res.modelRoutes || {}; state.autoFreeEnabled = res.autoFreeEnabled !== false;
      document.getElementById('autoFreeToggle').checked = state.autoFreeEnabled;
      document.getElementById('freeModelsInput').value = state.freeModels.join(', ');
      renderVisualRoutesAndAliases();
      renderModelsTable();
      const pgSel = document.getElementById('pgModelSelect');
      if (pgSel) {
        const cur = pgSel.value;
        pgSel.innerHTML = state.models.map(m => '<option value="' + escapeHtml(m.id) + '">' + escapeHtml(m.id) + ' [' + escapeHtml(m.rate || '-') + ']</option>').join('');
        if (cur) pgSel.value = cur;
      }
    }

    function testModelInPlayground(modelId) { switchTab('playground'); const sel = document.getElementById('pgModelSelect'); if (sel) sel.value = modelId; }
    async function quickPingModel(modelId) {
      toast('\u6B63\u5728\u6D4B\u901F ' + modelId + ' ...');
      const t0 = Date.now();
      const res = await fetch(API + '/playground/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: modelId, stream: false, max_tokens: 32, messages: [{ role: 'user', content: 'Say OK' }] })
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) toast('\u2705 ' + modelId + ' \u8FDE\u901A (' + (Date.now() - t0) + 'ms)');
      else toast('\u274C ' + modelId + ' \u5931\u8D25: ' + (json.error?.message || res.status));
    }

    function renderModelsTable() {
      const q = (document.getElementById('modelSearch').value || '').toLowerCase();
      const mode = document.getElementById('modelFilterMode').value || 'all';
      const enabledSet = new Set(state.enabledModels);
      const filtered = state.models.filter(m => {
        if (q && !(m.id.toLowerCase().includes(q) || (m.name||'').toLowerCase().includes(q))) return false;
        if (mode === 'free' && !m.isFree && m.multiplier !== 0) return false;
        if (mode === 'low' && (m.multiplier === null || m.multiplier === undefined || m.multiplier > 0.2)) return false;
        if (mode === 'cn' && m.realm !== 'cn') return false;
        if (mode === 'global' && m.realm !== 'global') return false;
        if (mode === 'reasoning' && !m.supportsReasoning && !(m.supportedEfforts && m.supportedEfforts.length)) return false;
        return true;
      });
      document.getElementById('modelCountLabel').textContent = '\u663E\u793A ' + filtered.length + ' / \u5171 ' + state.models.length + ' \u4E2A\u6A21\u578B';
      document.getElementById('modelsTbody').innerHTML = filtered.map(m => {
        const caps = [];
        if (m.supportsImages) caps.push('\u89C6\u89C9');
        if (m.supportsReasoning || (m.supportedEfforts && m.supportedEfforts.length)) caps.push('\u601D\u8003');
        if (m.supportsToolCall) caps.push('\u5DE5\u5177');
        return '<tr><td><input type="checkbox" class="model-chk" value="' + escapeHtml(m.id) + '" ' + (enabledSet.has(m.id) ? 'checked' : '') + ' /></td>' +
          '<td><strong>' + escapeHtml(m.id) + '</strong><br><span style="color:var(--text-dim);font-size:11px">' + escapeHtml(m.description || m.name || '') + '</span></td>' +
          '<td>' + rateBadgeHtml(m) + '</td><td style="font-size:11px">' + (caps.join(' \xB7 ') || '\u6587\u672C') + '</td>' +
          '<td><span class="tag ' + (m.realm === 'cn' ? 'tag-cn' : 'tag-global') + '">' + escapeHtml(m.realm) + '</span></td>' +
          '<td>' + Math.round((m.contextWindow || 0) / 1000) + 'k / ' + Math.round((m.maxTokens || 0) / 1000) + 'k</td>' +
          '<td style="display:flex;gap:4px"><button class="btn btn-sm" onclick="quickPingModel(\\'' + escapeHtml(m.id) + '\\')">\u26A1\u6D4B</button><button class="btn btn-sm" onclick="testModelInPlayground(\\'' + escapeHtml(m.id) + '\\')">\u8BD5\u8DD1</button></td></tr>';
      }).join('');
    }

    async function discoverModels() { toast('\u6B63\u5728\u53D1\u73B0\u4E0A\u6E38\u6700\u65B0\u6A21\u578B...'); const res = await api('/models/discover', { method: 'POST' }); toast('\u5B8C\u6210\uFF0C\u5171 ' + (res.models?.length || 0) + ' \u4E2A'); loadModels(); }
    async function saveModelsConfig() {
      const enabledModels = Array.from(document.querySelectorAll('.model-chk:checked')).map(el => el.value);
      const freeModels = document.getElementById('freeModelsInput').value.split(',').map(s => s.trim()).filter(Boolean);
      const autoFreeEnabled = document.getElementById('autoFreeToggle').checked;
      let aliases = state.aliases || {};
      let modelRoutes = state.modelRoutes || {};
      const alArea = document.getElementById('aliasesTextarea');
      const rtArea = document.getElementById('modelRoutesTextarea');
      try {
        if (alArea && alArea.value.trim()) aliases = JSON.parse(alArea.value);
        if (rtArea && rtArea.value.trim()) modelRoutes = JSON.parse(rtArea.value);
      } catch (e) {
        return toast('\u9AD8\u7EA7 JSON \u683C\u5F0F\u9519\u8BEF: ' + e.message);
      }
      await api('/models', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enabledModels, aliases, modelRoutes, freeModels, autoFreeEnabled }) });
      toast('\u6A21\u578B\u8DEF\u7531\u3001\u8FC7\u6EE4\u4E0E\u522B\u540D\u5DF2\u4FDD\u5B58'); loadModels();
    }

    async function loadLogs() {
      const res = await api('/logs'); if (!res.ok) return;
      const inFlight = res.inFlight || [];
      document.getElementById('inFlightBox').innerHTML = inFlight.length > 0 ? inFlight.map(r => '<span class="tag tag-warn">[' + escapeHtml(r.model) + ' ' + escapeHtml(r.rate) + '] ' + escapeHtml(r.nickname) + ' (' + Math.round(r.elapsedMs / 1000) + 's)</span>').join(' ') : '\u5F53\u524D\u65E0\u5728\u9014\u8BF7\u6C42\uFF08\u5E76\u53D1\u7A7A\u95F2\uFF09';
      const logs = res.logs || [];
      document.getElementById('logsTbody').innerHTML = logs.map(l =>
        '<tr><td>' + escapeHtml(l.time) + '</td><td><strong>' + escapeHtml(l.model) + '</strong><br><span style="font-size:10px;color:var(--text-dim)">' + escapeHtml(l.protocol + '/' + l.mode) + '</span></td><td><span class="tag tag-global">' + escapeHtml(l.rate || '-') + '</span></td><td>' + escapeHtml(l.account || l.uid) + '</td><td><span class="tag ' + (l.status >= 400 ? 'tag-err' : 'tag-cn') + '">' + l.status + '</span></td><td>' + (l.ttfbMs ? l.ttfbMs + 'ms / ' : '') + l.totalTokens + ' tok' + (l.tokensPerSec ? ' / ' + l.tokensPerSec + ' t/s' : '') + '</td><td>' + (l.credit !== null && l.credit !== undefined ? ('-' + l.credit) : '-') + '</td></tr>'
      ).join('') || '<tr><td colspan="7" style="color:var(--text-dim)">\u6682\u65E0\u8BF7\u6C42\u6D41\u6C34\u8BB0\u5F55</td></tr>';
    }

    function handlePgFile(ev) {
      const file = ev.target.files?.[0]; if (!file) return;
      const badge = document.getElementById('pgAttachBadge');
      const clr = document.getElementById('pgAttachClear');
      const reader = new FileReader();
      if (file.type.startsWith('image/')) {
        reader.onload = () => { pgAttachment = { kind: 'image', name: file.name, data: reader.result }; badge.textContent = '\u{1F4F7} ' + file.name; badge.classList.remove('hidden'); clr.classList.remove('hidden'); };
        reader.readAsDataURL(file);
      } else {
        reader.onload = () => { pgAttachment = { kind: 'text', name: file.name, data: String(reader.result || '').slice(0, 32000) }; badge.textContent = '\u{1F4C4} ' + file.name; badge.classList.remove('hidden'); clr.classList.remove('hidden'); };
        reader.readAsText(file);
      }
    }
    function clearPgAttachment() { pgAttachment = null; document.getElementById('pgFileInput').value = ''; document.getElementById('pgAttachBadge').classList.add('hidden'); document.getElementById('pgAttachClear').classList.add('hidden'); }

    async function runPlayground() {
      const model = document.getElementById('pgModelSelect').value || 'auto-free';
      const effort = document.getElementById('pgEffortSelect').value;
      const prompt = document.getElementById('pgPromptInput').value.trim() || '\u4F60\u597D\uFF0C\u8BF7\u7528\u4E00\u53E5\u8BDD\u4ECB\u7ECD\u4F60\u81EA\u5DF1';
      const stream = document.getElementById('pgStreamChk').checked;
      const outEl = document.getElementById('pgOutputBox'); const badge = document.getElementById('pgStatsBadge');
      outEl.textContent = '\u23F3 \u6B63\u5728\u8BF7\u6C42 ' + model + ' ...'; badge.textContent = '\u8BF7\u6C42\u4E2D...';

      let contentPayload = prompt;
      if (pgAttachment?.kind === 'image') {
        contentPayload = [{ type: 'text', text: prompt }, { type: 'image_url', image_url: { url: pgAttachment.data } }];
      } else if (pgAttachment?.kind === 'text') {
        contentPayload = prompt + '\\n\\n[\u9644\u4EF6: ' + pgAttachment.name + ']\\n' + pgAttachment.data;
      }

      const body = { model, stream, messages: [{ role: 'user', content: contentPayload }] };
      if (effort) body.reasoning_effort = effort;
      const t0 = Date.now(); let firstTokenMs = 0;

      const res = await fetch(API + '/playground/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) { outEl.textContent = '\u274C HTTP ' + res.status + ': ' + await res.text(); badge.textContent = '\u5931\u8D25 ' + res.status; loadLogs(); return; }
      if (stream) {
        outEl.textContent = ''; const reader = res.body.getReader(); const dec = new TextDecoder();
        let buf = '', acc = '', reasoning = '', usage = null;
        while (true) {
          const { done, value } = await reader.read(); if (done) break;
          buf += dec.decode(value, { stream: true }).replace(/\\r\\n/g, '\\n');
          let idx;
          while ((idx = buf.indexOf('\\n\\n')) !== -1) {
            const frame = buf.slice(0, idx); buf = buf.slice(idx + 2);
            for (const line of frame.split('\\n')) {
              if (!line.startsWith('data:')) continue;
              const d = line.slice(5).trim(); if (!d || d === '[DONE]') continue;
              try {
                const p = JSON.parse(d); if (p.usage) usage = p.usage;
                const delta = p.choices?.[0]?.delta || {};
                if (delta.reasoning_content) { if (!firstTokenMs) firstTokenMs = Date.now() - t0; reasoning += delta.reasoning_content; }
                if (delta.content) { if (!firstTokenMs) firstTokenMs = Date.now() - t0; acc += delta.content; }
                outEl.textContent = (reasoning ? '[\u601D\u8003\u8FC7\u7A0B]\\n' + reasoning + '\\n\\n[\u56DE\u7B54\u6B63\u6587]\\n' : '') + acc;
              } catch (_) {}
            }
          }
        }
        badge.textContent = 'TTFB ' + (firstTokenMs || (Date.now()-t0)) + 'ms | \u603B\u8017\u65F6 ' + (Date.now()-t0) + 'ms | Tok ' + (usage?.total_tokens || '-');
      } else {
        const json = await res.json(); const msg = json.choices?.[0]?.message || {};
        outEl.textContent = (msg.reasoning_content ? '[\u601D\u8003\u8FC7\u7A0B]\\n' + msg.reasoning_content + '\\n\\n[\u56DE\u7B54\u6B63\u6587]\\n' : '') + (msg.content || JSON.stringify(json, null, 2));
        badge.textContent = '\u8017\u65F6 ' + (Date.now()-t0) + 'ms | Tok ' + (json.usage?.total_tokens || '-');
      }
      loadLogs();
    }

    async function loadUsage(dateStr = '') {
      const selEl = document.getElementById('usageDateSelect');
      const targetDate = dateStr || selEl?.value || '';
      const res = await api('/usage' + (targetDate ? '?date=' + encodeURIComponent(targetDate) : ''));
      if (!res.ok) return;
      const st = res.stats;
      if (selEl && Array.isArray(st.availableDates)) {
        selEl.innerHTML = st.availableDates.map(d => '<option value="' + d + '" ' + (d === st.activeDate ? 'selected' : '') + '>' + d + '</option>').join('');
      }
      document.getElementById('usageSummaryCards').innerHTML = [
        { title: (st.activeDate || '\u4ECA\u65E5') + ' \u8BF7\u6C42 / \u603B\u8BF7\u6C42', kpi: st.today.requests + ' / ' + st.summary.totalRequests, sub: '\u5F53\u65E5\u6263\u8D39 ' + (st.today.credit || 0) + ' \u79EF\u5206', cls: '' },
        { title: '\u5F53\u65E5\u8F93\u5165 / \u8F93\u51FA Tokens', kpi: (st.today.totalTokens || 0).toLocaleString(), sub: '\u5165 ' + st.today.inputTokens.toLocaleString() + ' / \u51FA ' + st.today.outputTokens.toLocaleString(), cls: 'green' },
        { title: '\u5386\u53F2\u7D2F\u8BA1\u6D88\u8017\u79EF\u5206', kpi: Number(st.summary.totalCredit || 0).toFixed(2), sub: '\u603B\u6210\u529F ' + (st.summary.totalSuccess || 0) + ' / \u5931\u8D25 ' + (st.summary.totalFailed || 0), cls: 'pink' }
      ].map(c => '<div class="card" style="margin:0"><div class="card-title"><span>' + c.title + '</span></div><div class="kpi ' + c.cls + '">' + c.kpi + '</div><div class="sub-row">' + c.sub + '</div></div>').join('');
      const max7 = Math.max(1, ...st.trend7d.map(d => d.tokens));
      document.getElementById('chart7d').innerHTML = st.trend7d.map(d => '<div class="bar-col" title="' + d.date + ': ' + d.tokens + ' tok"><div class="bar-fill" style="height:' + Math.max(4, Math.round(d.tokens / max7 * 90)) + '%"></div><div class="bar-lbl">' + d.date + '</div></div>').join('');
      const max24 = Math.max(1, ...st.hourly.map(h => h.tokens));
      document.getElementById('chart24h').innerHTML = st.hourly.map(h => '<div class="bar-col" title="' + h.hour + ': ' + h.tokens + ' tok"><div class="bar-fill" style="height:' + Math.max(3, Math.round(h.tokens / max24 * 90)) + '%"></div><div class="bar-lbl">' + h.hour.replace('\u65F6','') + '</div></div>').join('');
      document.getElementById('usageModelsTbody').innerHTML = (st.modelBreakdown || []).map(r =>
        '<tr><td><strong>' + escapeHtml(r.model) + '</strong></td><td>' + rateBadgeHtml(r) + '</td><td>' + r.requests + ' (' + r.success + '/' + r.failed + ')</td><td>' + r.inputTokens.toLocaleString() + ' / ' + r.outputTokens.toLocaleString() + '</td><td>' + (r.cacheHitRate || 0) + '%</td><td style="font-weight:700;color:var(--cyan)">' + (r.credit || 0) + '</td><td>' + (r.creditPerReq || 0) + ' / ' + (r.costPer1k || 0) + '</td><td>' + (r.avgTtfbMs || 0) + 'ms / ' + (r.tokensPerSec || 0) + ' t/s</td></tr>'
      ).join('') || '<tr><td colspan="8">\u5C1A\u65E0\u6A21\u578B\u6D88\u8017\u8BB0\u5F55</td></tr>';
    }
    async function resetUsage() { if (!(await askConfirm('\u786E\u8BA4\u6E05\u7A7A\u5168\u90E8\u7EDF\u8BA1\u8D26\u672C\u5417\uFF1F'))) return; await api('/stats/reset', { method: 'POST' }); toast('\u5DF2\u6E05\u7A7A'); loadUsage(); }

    function copyText(text, label) {
      if (typeof window.__wb2aCopyText === 'function') {
        window.__wb2aCopyText(text, label);
        toast('\u5DF2\u590D\u5236 ' + label);
        return;
      }
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => toast('\u5DF2\u590D\u5236 ' + label)).catch(() => {});
    }
    let _guideCopyList = [];
    function copyGuide(idx, btnEl) {
      const item = _guideCopyList[idx];
      if (item) {
        copyText(item.copy, item.title);
        if (btnEl) {
          const orig = btnEl.innerHTML;
          btnEl.innerHTML = '\u2713 \u5DF2\u590D\u5236';
          btnEl.style.color = '#059669';
          btnEl.style.borderColor = '#a7f3d0';
          setTimeout(() => {
            btnEl.innerHTML = orig;
            btnEl.style.color = '';
            btnEl.style.borderColor = '';
          }, 1800);
        }
      }
    }

    function renderGuideCards(base) {
      const el = document.getElementById('guideCardsGrid'); if (!el) return;
      _guideCopyList = [
        { title: 'OpenAI Chat \u534F\u8BAE (Cline / Cherry / Roo / Cursor)', val: base + '/v1', copy: base + '/v1', tip: 'Base URL \u586B\u5165\u6B64\u5730\u5740\uFF0CKey \u7559\u7A7A\u6216\u586B\u914D\u7F6E\u503C\uFF1B\u52A0 ?bare=true \u8FD4\u56DE\u65E0\u524D\u7F00\u6A21\u578B\u540D' },
        { title: 'Claude Code CLI (Anthropic /v1/messages)', val: 'ANTHROPIC_BASE_URL=' + base, copy: '$env:ANTHROPIC_BASE_URL="' + base + '" ; $env:ANTHROPIC_API_KEY="sk-local"', tip: '\u652F\u6301 count_tokens \u4E0E\u6D41\u5F0F\u9519\u5E27\uFF0C\u5EFA\u8BAE\u5728\u300C\u6A21\u578B\u4E0E\u522B\u540D\u300D\u4E2D\u5F00\u542F Claude Code \u6620\u5C04' },
        { title: 'Codex CLI (OpenAI Responses /v1/responses)', val: base + '/v1/responses', copy: base + '/v1', tip: '\u539F\u751F\u652F\u6301 reasoning_effort \u4E0E tool_call \u8F6C\u6362\uFF0CBase URL \u540C\u586B /v1' },
        { title: '\u5065\u5EB7\u63A2\u9488 / \u516C\u5F00\u72B6\u6001\u4E0E\u89C6\u9891\u751F\u6210', val: base + '/healthz', copy: base + '/healthz', tip: '\u89C6\u9891\u751F\u6210: ' + base + '/v1/videos/generations \xB7 \u516C\u5F00\u95E8\u6237: ' + base + '/portal' }
      ];
      el.innerHTML = _guideCopyList.map((c, idx) =>
        '<div class="guide-card">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">' +
            '<strong style="font-size:12px;color:#1e3a8a">' + escapeHtml(c.title) + '</strong>' +
            '<button class="btn btn-sm" onclick="copyGuide(' + idx + ', this)">\u{1F4CB} \u590D\u5236</button>' +
          '</div>' +
          '<div style="font-family:Consolas,monospace;font-size:11px;color:#2563eb;word-break:break-all;margin-bottom:5px;background:#ffffff;padding:4px 8px;border-radius:6px;border:1px solid #e2e8f0">' + escapeHtml(c.val) + '</div>' +
          '<div style="font-size:11px;color:#64748b">' + escapeHtml(c.tip) + '</div>' +
        '</div>'
      ).join('');
    }

    function renderSettings() {
      const c = state.config || {};
      document.getElementById('cfgApiKey').value = c.apiKey || '';
      document.getElementById('cfgProxy').value = c.proxy || '';
      document.getElementById('cfgMaxCN').value = c.maxInFlightCN || 3;
      document.getElementById('cfgMaxGlobal').value = c.maxInFlightGlobal || 2;
      document.getElementById('cfgQueueTimeout').value = c.queueTimeoutMs ?? 60000;
      document.getElementById('cfgIdleTimeout').value = c.streamIdleTimeoutMs ?? 90000;
      document.getElementById('cfgPromptMode').value = c.promptMode || 'none';
      document.getElementById('cfgDeviceToken').value = c.deviceTokenPath || '';
      document.getElementById('cfgPromptText').value = c.promptText || '';
      document.getElementById('cfgAutoCheckin').checked = c.autoCheckin !== false;
      document.getElementById('cfgAutoTravel').checked = c.autoTravel !== false;
      document.getElementById('cfgAutoTasks').checked = c.autoTasks !== false;
      document.getElementById('cfgAutoRefresh').checked = c.autoRefreshToken !== false;
      document.getElementById('cfgPortalHome').checked = Boolean(c.portalAsHome);

      const sch = c.schedule || {};
      document.getElementById('schCheckin').value = (sch.checkinHours || [9,21]).join(', ');
      document.getElementById('schTravel').value = (sch.travelHours || [9,21]).join(', ');
      document.getElementById('schTasks').value = (sch.tasksHours || [11]).join(', ');
      document.getElementById('schSchool').value = (sch.schoolHours || [12]).join(', ');
      document.getElementById('schCat').value = (sch.catHours || [1]).join(', ');
      document.getElementById('schKeepalive').value = (sch.keepaliveHours || [22]).join(', ');

      document.getElementById('pwStatusBadge').textContent = state.auth?.hasPassword ? '\u5DF2\u5F00\u542F\u5BC6\u7801\u9501\u5B9A' : '\u514D\u5BC6\u5355\u673A\u6A21\u5F0F';
      document.getElementById('pwStatusBadge').className = 'tag ' + (state.auth?.hasPassword ? 'tag-warn' : 'tag-cn');

      const wl = c.ipWhitelist || {};
      document.getElementById('ipWlEnabled').checked = Boolean(wl.enabled);
      document.getElementById('ipWlLocal').checked = wl.allowLocalhost !== false;
      document.getElementById('ipWlList').value = (wl.allowedIPs || []).join('\\n');
      const net = state.runtimeNetwork || {};
      document.getElementById('ipRuntimeInfo').textContent = '\u5F53\u524D\u6765\u8BBF IP: ' + (net.clientIP || '-') + ' | \u672C\u673A\u7F51\u5361: ' + ((net.detectedIPs || []).join(', ') || '-');

      const al = c.alerts || {};
      document.getElementById('alertEnabled').checked = Boolean(al.enabled);
      document.getElementById('alertMinCredit').value = al.minCredit ?? 50;
      document.getElementById('alertHooks').value = (al.webhooks || []).join('\\n');
      const evSet = new Set(al.events || ['ban','401','cooling','low_credit']);
      document.querySelectorAll('.alert-evt').forEach(el => { el.checked = evSet.has(el.value); });

      renderGuideCards(getApiOrigin());
    }

    async function saveConfig() {
      const payload = {
        apiKey: document.getElementById('cfgApiKey').value.trim(),
        proxy: document.getElementById('cfgProxy').value.trim(),
        maxInFlightCN: Number(document.getElementById('cfgMaxCN').value) || 3,
        maxInFlightGlobal: Number(document.getElementById('cfgMaxGlobal').value) || 2,
        queueTimeoutMs: Number(document.getElementById('cfgQueueTimeout').value) || 0,
        streamIdleTimeoutMs: Number(document.getElementById('cfgIdleTimeout').value) || 90000,
        promptMode: document.getElementById('cfgPromptMode').value,
        deviceTokenPath: document.getElementById('cfgDeviceToken').value.trim(),
        promptText: document.getElementById('cfgPromptText').value,
        autoCheckin: document.getElementById('cfgAutoCheckin').checked,
        autoTravel: document.getElementById('cfgAutoTravel').checked,
        autoTasks: document.getElementById('cfgAutoTasks').checked,
        autoRefreshToken: document.getElementById('cfgAutoRefresh').checked,
        portalAsHome: document.getElementById('cfgPortalHome').checked
      };
      const res = await api('/config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      state.config = res.config || payload;
      toast('\u6838\u5FC3\u53C2\u6570\u5DF2\u4FDD\u5B58\u5E76\u5373\u65F6\u751F\u6548');
    }

    async function saveScheduleConfig() {
      const parseHrs = id => document.getElementById(id).value.split(',').map(s => Number(s.trim())).filter(n => Number.isInteger(n) && n >= 0 && n <= 23);
      const res = await api('/config/schedule', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schedule: {
            checkinHours: parseHrs('schCheckin'),
            travelHours: parseHrs('schTravel'),
            tasksHours: parseHrs('schTasks'),
            schoolHours: parseHrs('schSchool'),
            catHours: parseHrs('schCat'),
            keepaliveHours: parseHrs('schKeepalive')
          }
        })
      });
      toast(res.message || '\u6392\u7A0B\u5DF2\u4FDD\u5B58');
    }

    async function saveWebPassword() {
      const password = document.getElementById('cfgWebPassword').value;
      const res = await api('/config/password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
      toast(res.message || '\u5B8C\u6210');
      loadStatus();
    }

    function addClientIP() {
      const ip = state.runtimeNetwork?.clientIP; if (!ip) return;
      const el = document.getElementById('ipWlList');
      const cur = el.value.split(/[\\r\\n,;]+/).map(s => s.trim()).filter(Boolean);
      if (!cur.includes(ip)) cur.push(ip);
      el.value = cur.join('\\n');
    }
    async function saveIPWhitelist() {
      const allowedIPs = document.getElementById('ipWlList').value.split(/[\\r\\n,;]+/).map(s => s.trim()).filter(Boolean);
      const res = await api('/config/ip_whitelist', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: document.getElementById('ipWlEnabled').checked, allowLocalhost: document.getElementById('ipWlLocal').checked, allowedIPs })
      });
      toast(res.message || res.error);
    }

    async function saveAlerts() {
      const events = Array.from(document.querySelectorAll('.alert-evt:checked')).map(x => x.value);
      const res = await api('/config/alerts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: document.getElementById('alertEnabled').checked,
          minCredit: Number(document.getElementById('alertMinCredit').value || 50),
          webhooksText: document.getElementById('alertHooks').value,
          events
        })
      });
      toast(res.message || '\u544A\u8B66\u5DF2\u4FDD\u5B58');
    }
    async function testAlerts() { const res = await api('/config/alerts/test', { method: 'POST' }); toast(res.message || res.error); }

    async function checkUpdate() {
      document.getElementById('updateInfoSpan').textContent = '\u6B63\u5728\u68C0\u67E5 GitHub \u7248\u672C...';
      const res = await api('/system/update/check');
      if (!res.ok) document.getElementById('updateInfoSpan').textContent = res.error || '\u68C0\u67E5\u5931\u8D25';
      else document.getElementById('updateInfoSpan').innerHTML = '\u5F53\u524D v' + escapeHtml(res.currentVersion) + ' \xB7 \u6700\u65B0 <strong>' + escapeHtml(res.latestVersion) + '</strong> ' + (res.hasUpdate ? '<span class="tag tag-warn">\u6709\u65B0\u7248\u672C</span>' : '<span class="tag tag-cn">\u5DF2\u662F\u6700\u65B0</span>');
    }

    async function loadAdminUsers() {
      const res = await api('/admin/users'); if (!res.ok) return;
      document.getElementById('allowRegChk').checked = Boolean(res.allowRegister);
      document.getElementById('adminUsersTbody').innerHTML = (res.users || []).map(u =>
        '<tr><td><strong>' + escapeHtml(u.username) + '</strong></td><td>' + u.role + '</td><td style="font-family:monospace;font-size:11px">' + escapeHtml(u.apiKey) + '</td><td>' + (u.usedCreditToday||0) + ' / ' + (u.dailyCreditLimit || '\u4E0D\u9650') + '</td><td>' + (u.rpm || '\u4E0D\u9650') + '</td><td><span class="tag ' + (u.disabled ? 'tag-err' : 'tag-cn') + '">' + (u.disabled ? '\u7981\u7528' : '\u6B63\u5E38') + '</span></td>' +
        '<td style="display:flex;gap:4px;flex-wrap:wrap">' +
          '<button class="btn btn-sm" onclick="adminResetKey(\\'' + u.username + '\\')">\u91CD\u7F6EKey</button>' +
          '<button class="btn btn-sm" onclick="adminSetQuota(\\'' + u.username + '\\')">\u914D\u989D</button>' +
          (u.username !== 'admin' ? '<button class="btn btn-sm btn-amber" onclick="adminToggleUser(\\'' + u.username + '\\',' + (!u.disabled) + ')">' + (u.disabled ? '\u542F\u7528' : '\u7981\u7528') + '</button><button class="btn btn-sm btn-pink" onclick="adminDeleteUser(\\'' + u.username + '\\')">\u5220</button>' : '') +
        '</td></tr>'
      ).join('');
    }
    async function createTenantUser() {
      const res = await api('/admin/users/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: document.getElementById('newUserName').value.trim(), password: document.getElementById('newUserPass').value, role: document.getElementById('newUserRole').value, dailyCreditLimit: Number(document.getElementById('newUserQuota').value || 0), rpm: Number(document.getElementById('newUserRpm').value || 0) }) });
      toast(res.ok ? '\u79DF\u6237\u521B\u5EFA\u6210\u529F' : (res.error || '\u5931\u8D25')); loadAdminUsers();
    }
    async function adminToggleUser(username, disabled) { await api('/admin/users/toggle', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, disabled }) }); loadAdminUsers(); }
    async function adminResetKey(username) { await api('/admin/users/reset_key', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username }) }); toast('Key \u5DF2\u91CD\u7F6E'); loadAdminUsers(); }
    async function adminDeleteUser(username) { if (!(await askConfirm('\u5220\u9664\u7528\u6237 ' + username + ' ?'))) return; await api('/admin/users/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username }) }); loadAdminUsers(); }
    async function adminSetQuota(username) {
      const q = await askPrompt('\u8F93\u5165\u6BCF\u65E5\u79EF\u5206\u4E0A\u9650 (0 \u8868\u793A\u4E0D\u9650):', '100'); if (q === null) return;
      const r = await askPrompt('\u8F93\u5165\u6BCF\u5206\u949F\u8BF7\u6C42 RPM \u4E0A\u9650 (0 \u8868\u793A\u4E0D\u9650):', '30'); if (r === null) return;
      await api('/admin/users/quota', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, dailyCreditLimit: Number(q), rpm: Number(r) }) });
      loadAdminUsers();
    }
    async function toggleAllowRegister(val) { await api('/admin/system/allow_register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ allowRegister: val }) }); }

    async function checkDsh() {
      const box = document.getElementById('dshCheckBox');
      const res = await api('/dsh/check');
      if (!res.ok) { box.textContent = '\u68C0\u6D4B\u5931\u8D25'; return; }
      box.innerHTML = '\u63D2\u4EF6\u5B89\u88C5: <span class="tag ' + (res.installedInProfile ? 'tag-cn' : 'tag-err') + '">' + (res.installedInProfile ? '\u5DF2\u5B89\u88C5' : '\u672A\u6CE8\u518C') + '</span> | Patch baseURL: <span class="tag ' + (res.baseUrlMatched ? 'tag-cn' : 'tag-warn') + '">' + (res.baseUrlMatched ? '\u5DF2\u5BF9\u9F50 (' + escapeHtml(res.expectedBaseUrl) + ')' : '\u672A\u5BF9\u9F50') + '</span>';
    }
    async function syncDsh() { const res = await api('/dsh/sync', { method: 'POST' }); toast(res.message || '\u5B8C\u6210'); checkDsh(); }

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
  if (!acc.disabled && !acc.manualDisabled) {
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
  const { scheduler, client, ledger, loopback, configStore, userManager, alertManager } = deps;
  const store = scheduler.store;
  const balanceCache = /* @__PURE__ */ new Map();
  const checkinStateMap = /* @__PURE__ */ new Map();
  const BALANCE_TTL = 2e4;
  function markCheckinState(uid, res) {
    if (!uid || !res) return;
    const todayCST = new Date(Date.now() + 8 * 3600 * 1e3).toISOString().slice(0, 10);
    checkinStateMap.set(uid, {
      date: todayCST,
      ok: Boolean(res.ok),
      status: res.status || (res.ok ? "SUCCESS" : "FAIL"),
      message: res.message || ""
    });
  }
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
      scheduler.updateAccountCredits(uid, bal.remain, bal.expiringRemain);
      scheduler.reenableIfCredits(uid, bal.remain);
      alertManager?.notifyLowCredit(uid, account.account.nickname, bal.remain);
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
  const requireAdmin = (req, res) => {
    if (!userManager) return true;
    const auth = userManager.checkWebAuth(req);
    if (!auth.ok) {
      sendJson2(res, 401, { ok: false, authRequired: true, error: "\u8BF7\u5148\u767B\u5F55\u63A7\u5236\u53F0" });
      return false;
    }
    if (auth.user?.role !== "admin") {
      sendJson2(res, 403, { ok: false, error: "\u9700\u8981\u7BA1\u7406\u5458\u6743\u9650" });
      return false;
    }
    return true;
  };
  const routes = [
    // 1. 全局状态、3-Realm 积分汇总与诊断看板
    {
      path: "/plugins/dsh-workbuddy2api/status",
      handler: async (req, res) => {
        const u = new URL(req.url, "http://localhost");
        const force = u.searchParams.get("refresh") === "1";
        const dateParam = u.searchParams.get("date") || "";
        const sessionAuth = userManager ? userManager.checkWebAuth(req) : { ok: true, user: { username: "admin", role: "admin" } };
        const all = store.getAll();
        const active = store.getActive();
        const summary = {
          all: createEmptyRealmSummary(),
          cn: createEmptyRealmSummary(),
          global: createEmptyRealmSummary()
        };
        const todayCST = new Date(Date.now() + 8 * 3600 * 1e3).toISOString().slice(0, 10);
        const accounts = await Promise.all(all.map(async (a) => {
          const uid = a.account.uid;
          const bal = await getAccountBalance(a, force && !scheduler.isAccountUnavailable(a));
          const diag = scheduler.getAccountDiagnostics(uid);
          const realmKey = a.auth?.realm === "global" ? "global" : "cn";
          const chk = checkinStateMap.get(uid);
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
            manualDisabled: Boolean(a.manualDisabled),
            manualDisabledReason: a.manualDisabledReason || "",
            source: a.source || "",
            inFlight: diag.inFlight,
            coolingDown: diag.coolingDown,
            diagnostics: diag,
            expiresAt: a.auth.expiresAt,
            updatedAt: a.updatedAt,
            balance: bal,
            checkinState: chk && chk.date === todayCST ? chk : null
          };
        }));
        const balance = active ? await getAccountBalance(active, force) : null;
        const cfg = getRuntimeCfg();
        const visibleAccounts = sessionAuth.ok && sessionAuth.user?.role === "user" ? [] : accounts;
        sendJson2(res, 200, {
          ok: true,
          serviceVersion: SERVICE_VERSION,
          activeUid: store.activeUid,
          accounts: visibleAccounts,
          balance,
          summary,
          gatewayPort: loopback.actualPort || loopback.preferredPort,
          aliases: { ...DEFAULT_MODEL_ALIASES, ...cfg.aliases || {} },
          modelRoutes: cfg.modelRoutes || {},
          autoFreeEnabled: cfg.autoFreeEnabled !== false,
          freeCandidates: loopback.getFreeModelCandidates(),
          enabledModels: cfg.enabledModels || Array.from(loopback.enabledModels),
          freeModels: cfg.freeModels || [],
          discoveredModelsCount: loopback.discoveredModels?.length || 0,
          inFlightRequests: scheduler.getInFlightRequests(),
          wafIpBlocked: scheduler.wafIPGate.active(),
          degradeActive: scheduler.degradeGate.active(),
          runtimeNetwork: {
            detectedIPs: detectRuntimeIPs(),
            clientIP: extractTrustedClientIP(req)
          },
          auth: {
            hasPassword: userManager ? userManager.hasWebPassword() : false,
            authenticated: sessionAuth.ok,
            currentUser: sessionAuth.user || null,
            allowRegister: Boolean(cfg.allowRegister)
          },
          alertHistory: alertManager?.history || [],
          config: cfg,
          stats: ledger.getStats(loopback.getModelCatalogMap(), dateParam)
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
          if (action === "manualEnable") {
            store.setManualDisabled(uid, false, "");
            sendJson2(res, 200, { ok: true, message: `\u5DF2\u89E3\u9664\u8D26\u53F7 ${acc.account.nickname} \u624B\u52A8\u505C\u7528` });
            return;
          }
          if (action === "disable") {
            store.setManualDisabled(uid, true, body.reason || "\u624B\u52A8\u505C\u7528");
            sendJson2(res, 200, { ok: true, message: `\u5DF2\u624B\u52A8\u505C\u7528\u8D26\u53F7 ${acc.account.nickname}` });
            return;
          }
          if (action === "revive" || action === "clearCooldown") {
            store.reviveAccount(uid);
            scheduler.clearCooldown(uid);
            sendJson2(res, 200, { ok: true, message: `\u5DF2\u590D\u6D3B\u5E76\u89E3\u9664 ${acc.account.nickname} \u81EA\u52A8\u7981\u7528/\u51B7\u5374\u72B6\u6001` });
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
    {
      path: "/plugins/dsh-workbuddy2api/accounts/update_token",
      handler: async (req, res) => {
        try {
          const body = await parseJsonBody(req);
          const { uid, accessToken, refreshToken } = body;
          const existing = store.get(uid);
          if (!existing) {
            sendJson2(res, 404, { ok: false, error: "\u8D26\u53F7\u672A\u627E\u5230" });
            return;
          }
          const rawAccess = String(accessToken || "").trim();
          const rawRefresh = String(refreshToken || "").trim();
          if (!rawAccess && !rawRefresh) {
            sendJson2(res, 400, { ok: false, error: "\u5FC5\u987B\u63D0\u4F9B\u65B0 Access Token \u6216 Refresh Token" });
            return;
          }
          const acc = store.updateAccountToken(uid, rawAccess || existing.auth.accessToken, rawRefresh || existing.auth.refreshToken);
          if (acc.auth.refreshToken && !rawAccess) {
            await client.refreshToken(acc);
            store.upsert(acc);
          }
          scheduler.clearCooldown(uid);
          invalidateBalance(uid);
          const balance = await getAccountBalance(acc, true);
          sendJson2(res, 200, { ok: true, message: `\u5DF2\u66F4\u65B0\u5E76\u6551\u6D3B\u8D26\u53F7 ${acc.account.nickname}`, balance });
        } catch (err) {
          sendJson2(res, 400, { ok: false, error: `\u51ED\u8BC1\u66F4\u65B0\u5931\u8D25: ${err.message}` });
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
          const info = await fetchInviteInfo(target, client);
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
        const result = await bindInviteCode(target, body.inviteCode, client);
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
              markCheckinState(acc.account.uid, r);
              results.push({ uid: acc.account.uid, nickname: acc.account.nickname, ...r });
            } catch (e) {
              const errRes = { ok: false, status: "FAIL", message: e.message };
              markCheckinState(acc.account.uid, errRes);
              results.push({ uid: acc.account.uid, nickname: acc.account.nickname, ...errRes });
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
        markCheckinState(target.account.uid, result);
        invalidateBalance(target.account.uid);
        sendJson2(res, 200, result);
      }
    },
    {
      path: "/plugins/dsh-workbuddy2api/trial/batch",
      handler: async (_req, res) => {
        const globals = store.getAll().filter((a) => !scheduler.isAccountUnavailable(a) && a.auth?.realm === "global");
        const results = [];
        for (const acc of globals) {
          try {
            const r = await claimGlobalTrial(acc, client);
            results.push({ uid: acc.account.uid, nickname: acc.account.nickname, ...r });
          } catch (e) {
            results.push({ uid: acc.account.uid, nickname: acc.account.nickname, ok: false, error: e.message });
          }
        }
        invalidateBalance();
        sendJson2(res, 200, { ok: true, results });
      }
    },
    // 12. 用量统计（含历史日期筛选、按模型倍率/消耗明细）、实时请求流水与账本重置
    {
      path: "/plugins/dsh-workbuddy2api/usage",
      handler: async (req, res) => {
        const u = new URL(req.url, "http://localhost");
        const dateParam = u.searchParams.get("date") || "";
        sendJson2(res, 200, {
          ok: true,
          stats: ledger.getStats(loopback.getModelCatalogMap(), dateParam),
          inFlightRequests: scheduler.getInFlightRequests()
        });
      }
    },
    {
      path: "/plugins/dsh-workbuddy2api/logs",
      handler: async (_req, res) => {
        sendJson2(res, 200, {
          ok: true,
          logs: ledger.getRecentLogs(),
          inFlight: scheduler.getInFlightRequests()
        });
      }
    },
    {
      path: "/plugins/dsh-workbuddy2api/playground/chat",
      handler: async (req, res) => {
        const body = await parseJsonBody(req);
        if (!body || !body.messages) {
          sendJson2(res, 400, { ok: false, error: "\u8BF7\u6C42\u4F53\u7F3A\u5C11 messages" });
          return;
        }
        await loopback.executeChatPipeline(req, res, body, "chat", body.model);
      }
    },
    {
      path: "/plugins/dsh-workbuddy2api/dsh/check",
      handler: async (_req, res) => {
        const dshHome = store.dshHome || process.env.DSH_HOME || path7.join(os7.homedir(), ".dsh");
        const profilePkgPath = path7.join(dshHome, "profiles", "desktop", "package.json");
        const patchPath = path7.join(dshHome, "profiles", "desktop", "cordis.patch.yml");
        const port = loopback.actualPort || loopback.preferredPort || 7863;
        const expectedBaseUrl = `http://127.0.0.1:${port}/v1`;
        let installedInProfile = false;
        let baseUrlMatched = false;
        let patchPreview = "";
        try {
          if (fs8.existsSync(profilePkgPath)) {
            const pkg = JSON.parse(fs8.readFileSync(profilePkgPath, "utf8"));
            installedInProfile = Boolean(pkg.dependencies?.["dsh-workbuddy2api"]);
          }
          if (fs8.existsSync(patchPath)) {
            const yml = fs8.readFileSync(patchPath, "utf8");
            baseUrlMatched = yml.includes(expectedBaseUrl);
            patchPreview = yml.split(/\r?\n/).slice(0, 60).join("\n");
          }
        } catch (_) {
        }
        sendJson2(res, 200, {
          ok: true,
          dshHome,
          installedInProfile,
          baseUrlMatched,
          expectedBaseUrl,
          patchPath,
          patchPreview
        });
      }
    },
    {
      path: "/plugins/dsh-workbuddy2api/dsh/sync",
      handler: async (_req, res) => {
        const dshHome = store.dshHome || process.env.DSH_HOME || path7.join(os7.homedir(), ".dsh");
        const patchPath = path7.join(dshHome, "profiles", "desktop", "cordis.patch.yml");
        const port = loopback.actualPort || loopback.preferredPort || 7863;
        const expectedBaseUrl = `http://127.0.0.1:${port}/v1`;
        try {
          let content = fs8.existsSync(patchPath) ? fs8.readFileSync(patchPath, "utf8") : "";
          if (content.includes("baseURL:")) {
            content = content.replace(/(workbuddy:[\s\S]*?baseURL:\s*).*/, `$1${expectedBaseUrl}`);
          }
          fs8.mkdirSync(path7.dirname(patchPath), { recursive: true });
          fs8.writeFileSync(patchPath, content, "utf8");
          sendJson2(res, 200, { ok: true, message: `\u5DF2\u540C\u6B65 baseURL -> ${expectedBaseUrl}`, expectedBaseUrl });
        } catch (err) {
          sendJson2(res, 500, { ok: false, error: err.message });
        }
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
          if (body.modelRoutes && typeof body.modelRoutes === "object") {
            patch.modelRoutes = body.modelRoutes;
          }
          if (typeof body.autoFreeEnabled === "boolean") {
            patch.autoFreeEnabled = body.autoFreeEnabled;
          }
          const updated = configStore ? configStore.update(patch) : patch;
          sendJson2(res, 200, {
            ok: true,
            enabledModels: updated.enabledModels || Array.from(loopback.enabledModels),
            aliases: updated.aliases || loopback.modelAliases,
            freeModels: updated.freeModels || [],
            modelRoutes: updated.modelRoutes || {},
            autoFreeEnabled: updated.autoFreeEnabled !== false
          });
        } else {
          const cfg = getRuntimeCfg();
          sendJson2(res, 200, {
            ok: true,
            models: loopback.getMergedModels(true),
            enabledModels: cfg.enabledModels || Array.from(loopback.enabledModels),
            aliases: { ...DEFAULT_MODEL_ALIASES, ...cfg.aliases || {} },
            freeModels: cfg.freeModels || [],
            modelRoutes: cfg.modelRoutes || {},
            autoFreeEnabled: cfg.autoFreeEnabled !== false
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
      path: "/plugins/dsh-workbuddy2api/travel/adopt",
      handler: async (req, res) => {
        const body = await parseJsonBody(req);
        const uid = body.uid || store.activeUid;
        const target = store.get(uid);
        if (!target) {
          sendJson2(res, 404, { ok: false, message: "\u8D26\u53F7\u672A\u627E\u5230" });
          return;
        }
        if (target.auth?.realm === "global") {
          sendJson2(res, 400, { ok: false, message: "\u4EC5\u56FD\u5185\u7248\u8D26\u53F7\u652F\u6301\u732B\u732B\u7CFB\u7EDF" });
          return;
        }
        await agreeBuddy(target);
        let adoptRes = await adoptFirstBuddy(target);
        if (!adoptRes.ok && adoptRes.incomplete) {
          await reportActiveChat(target, 5);
          adoptRes = await adoptFirstBuddy(target);
        }
        const buddy = await getBuddyInfo(target);
        invalidateBalance(target.account.uid);
        sendJson2(res, 200, { ...adoptRes, buddy });
      }
    },
    {
      path: "/plugins/dsh-workbuddy2api/travel/run",
      handler: async (req, res) => {
        const body = await parseJsonBody(req);
        const uid = body.uid || store.activeUid;
        const target = store.get(uid);
        if (!target) {
          sendJson2(res, 404, { ok: false, message: "\u8D26\u53F7\u672A\u627E\u5230" });
          return;
        }
        const resRun = await runTravelForAccount(target);
        invalidateBalance(target.account.uid);
        const acts = resRun.results?.actions || [];
        const summary = resRun.status === "ok" ? acts.map((a) => a.message).filter(Boolean).join("\uFF1B") || "\u732B\u732B\u65C5\u884C\u5DE1\u68C0\u5B8C\u6210" : resRun.detail || resRun.reason || "\u732B\u732B\u5DE1\u68C0\u8DF3\u8FC7\u6216\u5931\u8D25";
        sendJson2(res, 200, { ok: resRun.status === "ok", summary, ...resRun });
      }
    },
    {
      path: "/plugins/dsh-workbuddy2api/travel/run-all",
      handler: async (_req, res) => {
        const results = await scheduler.runAllTravel();
        invalidateBalance();
        sendJson2(res, 200, {
          ok: true,
          results,
          message: `\u5DF2\u5B8C\u6210 ${results.length} \u4E2A\u56FD\u5185\u7248\u8D26\u53F7\u732B\u732B\u65C5\u884C\u5DE1\u68C0`
        });
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
        const rs = streak.redemptionStatus || {};
        const tiers = [
          { tier: "7d", label: "7\u5929\u8FDE\u767B\u793C", status: rs.tier_7d_status || "locked" },
          { tier: "14d", label: "14\u5929\u8FDE\u767B\u793C", status: rs.tier_14d_status || "locked" },
          { tier: "28d", label: "28\u5929\u8FDE\u767B\u793C", status: rs.tier_28d_status || "locked" }
        ];
        sendJson2(res, 200, { ok: true, uid, streak, tiers, chances, chancesRemaining: chances });
      }
    },
    {
      path: "/plugins/dsh-workbuddy2api/growth/redeem",
      handler: async (req, res) => {
        const body = await parseJsonBody(req);
        const uid = body.uid || store.activeUid;
        const target = store.get(uid);
        if (!target) {
          sendJson2(res, 404, { ok: false, message: "\u8D26\u53F7\u672A\u627E\u5230" });
          return;
        }
        const tier = body.tier || "7d";
        const result = await redeemStreakTier(target, tier);
        invalidateBalance(target.account.uid);
        sendJson2(res, 200, result);
      }
    },
    {
      path: "/plugins/dsh-workbuddy2api/growth/makeup",
      handler: async (req, res) => {
        const body = await parseJsonBody(req);
        const uid = body.uid || store.activeUid;
        const target = store.get(uid);
        if (!target) {
          sendJson2(res, 404, { ok: false, message: "\u8D26\u53F7\u672A\u627E\u5230" });
          return;
        }
        const result = await checkAndUseMakeupCard(target);
        const msgMap = {
          no_cards: "\u5F53\u524D\u6CA1\u6709\u53EF\u7528\u7684\u8865\u7B7E\u5361",
          no_missed_day: "\u6628\u65E5\u5DF2\u6253\u5361\u6216\u65E0\u9700\u8865\u7B7E",
          skipped_global: "\u56FD\u9645\u7248\u8D26\u53F7\u65E0\u8FDE\u767B\u8865\u7B7E\u4F53\u7CFB"
        };
        sendJson2(res, 200, {
          ...result,
          message: result.message || msgMap[result.reason] || "\u8865\u7B7E\u68C0\u67E5\u5B8C\u6210"
        });
      }
    },
    {
      path: "/plugins/dsh-workbuddy2api/growth/gift",
      handler: async (req, res) => {
        const body = await parseJsonBody(req);
        const uid = body.uid || store.activeUid;
        const target = store.get(uid);
        if (!target) {
          sendJson2(res, 404, { ok: false, message: "\u8D26\u53F7\u672A\u627E\u5230" });
          return;
        }
        const activeRes = await reportActiveChat(target, 5);
        const giftRes = await claimGift(target);
        const compRes = await claimCompensation(target);
        const totalCredits = (giftRes.ok ? giftRes.credit || 0 : 0) + (compRes.ok ? compRes.credit || 0 : 0);
        invalidateBalance(target.account.uid);
        sendJson2(res, 200, {
          ok: Boolean(activeRes.ok || giftRes.ok || compRes.ok),
          totalCredits,
          items: [
            { name: "\u5BF9\u8BDD\u6D3B\u8DC3\u4E0A\u62A5", ...activeRes },
            { name: "\u65B0\u624B\u793C\u5305", ...giftRes },
            { name: "\u6D3B\u52A8\u8865\u507F", ...compRes }
          ],
          message: `\u6D3B\u8DC3\u4E0E\u793C\u5305\u5DE1\u68C0\u5B8C\u6210\uFF0C\u7D2F\u8BA1\u83B7\u5F97 +${totalCredits} \u79EF\u5206`
        });
      }
    },
    {
      path: "/plugins/dsh-workbuddy2api/growth/claim-all",
      handler: async (req, res) => {
        const body = await parseJsonBody(req);
        if (body.all) {
          const results = await scheduler.runAllWelfare();
          invalidateBalance();
          sendJson2(res, 200, {
            ok: true,
            results,
            message: `\u5DF2\u5B8C\u6210 ${results.length} \u4E2A\u8D26\u53F7\u7684\u5168\u5957\u798F\u5229\u4E0E\u6210\u957F\u4EFB\u52A1`
          });
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
        sendJson2(res, 200, { ok: true, uid, result, message: result.summary });
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
    // 17.1 开学季活动 (school_open_day_2026) 盘点、自动点灯、领积分与大转盘抽奖
    {
      path: "/plugins/dsh-workbuddy2api/school/status",
      handler: async (req, res) => {
        const u = new URL(req.url, "http://localhost");
        const uid = u.searchParams.get("uid") || store.activeUid;
        const target = store.get(uid);
        if (!target) {
          sendJson2(res, 404, { ok: false, message: "\u8D26\u53F7\u672A\u627E\u5230" });
          return;
        }
        const status = await fetchSchoolStatus(target);
        sendJson2(res, 200, { ok: Boolean(status?.ok), uid, status });
      }
    },
    {
      path: "/plugins/dsh-workbuddy2api/school/run",
      handler: async (req, res) => {
        const body = await parseJsonBody(req);
        const opts = {
          lightUp: body.lightUp !== false,
          claim: body.claim !== false,
          draw: body.draw !== false
        };
        if (body.all) {
          const results = await scheduler.runAllSchool(opts);
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
        const result = await runSchoolActivity(target, opts);
        invalidateBalance(target.account.uid);
        sendJson2(res, 200, { ok: Boolean(result?.ok), uid, result });
      }
    },
    {
      path: "/plugins/dsh-workbuddy2api/tasks/nightcat",
      handler: async (_req, res) => {
        const inWindow = isCSTNightWindow();
        if (!inWindow) {
          sendJson2(res, 200, {
            ok: false,
            inWindow: false,
            results: [],
            message: "\u5F53\u524D\u4E0D\u5728\u6DF1\u591C\u732B\u732B\u4EFB\u52A1\u65F6\u95F4\u7A97\u53E3\uFF08\u9700\u5317\u4EAC\u65F6\u95F4 23:00\u201308:00\uFF09"
          });
          return;
        }
        const results = await scheduler.runAllNightCat();
        invalidateBalance();
        sendJson2(res, 200, {
          ok: true,
          inWindow: true,
          results,
          message: `\u5DF2\u5B8C\u6210 ${results.length} \u4E2A\u56FD\u5185\u7248\u8D26\u53F7\u6DF1\u591C\u732B\u732B\u5DE1\u68C0`
        });
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
    },
    // 19. 控制台登录鉴权、自助注册与个人 API Key 管理
    {
      path: "/plugins/dsh-workbuddy2api/auth/me",
      handler: async (req, res) => {
        if (!userManager) {
          sendJson2(res, 200, { ok: true, hasPassword: false, authenticated: true, user: { username: "admin", role: "admin" } });
          return;
        }
        const cfg = getRuntimeCfg();
        const check = userManager.checkWebAuth(req);
        sendJson2(res, 200, {
          ok: true,
          hasPassword: userManager.hasWebPassword(),
          authenticated: check.ok,
          allowRegister: Boolean(cfg.allowRegister),
          user: check.ok ? check.user : null
        });
      }
    },
    {
      path: "/plugins/dsh-workbuddy2api/auth/login",
      handler: async (req, res) => {
        if (!userManager) {
          sendJson2(res, 501, { ok: false, error: "UserManager \u672A\u521D\u59CB\u5316" });
          return;
        }
        try {
          const body = await parseJsonBody(req);
          const clientIP = extractTrustedClientIP(req);
          const { token, user } = userManager.authenticate(body.username || "admin", body.password || "", clientIP);
          res.setHeader(
            "Set-Cookie",
            `${UserManager.cookieName}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 86400}`
          );
          sendJson2(res, 200, { ok: true, user, token });
        } catch (err) {
          sendJson2(res, 401, { ok: false, error: err.message });
        }
      }
    },
    {
      path: "/plugins/dsh-workbuddy2api/auth/logout",
      handler: async (req, res) => {
        userManager?.logout(req);
        res.setHeader(
          "Set-Cookie",
          `${UserManager.cookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
        );
        sendJson2(res, 200, { ok: true });
      }
    },
    {
      path: "/plugins/dsh-workbuddy2api/auth/register",
      handler: async (req, res) => {
        if (!userManager) {
          sendJson2(res, 501, { ok: false, error: "UserManager \u672A\u521D\u59CB\u5316" });
          return;
        }
        const cfg = getRuntimeCfg();
        if (!cfg.allowRegister) {
          sendJson2(res, 403, { ok: false, error: "\u7BA1\u7406\u5458\u5DF2\u5173\u95ED\u81EA\u52A9\u6CE8\u518C\u529F\u80FD" });
          return;
        }
        try {
          const body = await parseJsonBody(req);
          const user = userManager.createUser({
            username: body.username,
            password: body.password,
            role: "user"
          });
          sendJson2(res, 200, { ok: true, user });
        } catch (err) {
          sendJson2(res, 400, { ok: false, error: err.message });
        }
      }
    },
    {
      path: "/plugins/dsh-workbuddy2api/user/apikey/reset",
      handler: async (req, res) => {
        if (!userManager) {
          sendJson2(res, 501, { ok: false, error: "UserManager \u672A\u521D\u59CB\u5316" });
          return;
        }
        const auth = userManager.checkWebAuth(req);
        if (!auth.ok || !auth.user) {
          sendJson2(res, 401, { ok: false, error: "\u8BF7\u5148\u767B\u5F55" });
          return;
        }
        const updated = userManager.resetUserApiKey(auth.user.username);
        sendJson2(res, 200, { ok: true, apiKey: updated.apiKey, user: updated });
      }
    },
    // 20. 控制台密码、IP/CIDR 白名单、Webhook 告警与自动化排程设置
    {
      path: "/plugins/dsh-workbuddy2api/config/password",
      handler: async (req, res) => {
        if (!userManager) {
          sendJson2(res, 501, { ok: false, error: "UserManager \u672A\u521D\u59CB\u5316" });
          return;
        }
        const body = await parseJsonBody(req);
        const result = userManager.setAdminPassword(String(body.password || ""));
        sendJson2(res, 200, {
          ok: true,
          ...result,
          message: result.hasPassword ? "\u63A7\u5236\u53F0\u767B\u5F55\u5BC6\u7801\u5DF2\u66F4\u65B0\u542F\u7528" : "\u63A7\u5236\u53F0\u5BC6\u7801\u5DF2\u6E05\u9664\uFF08\u5355\u673A\u514D\u5BC6\u6A21\u5F0F\uFF09"
        });
      }
    },
    {
      path: "/plugins/dsh-workbuddy2api/config/ip_whitelist",
      handler: async (req, res) => {
        if (req.method === "GET") {
          const cfg = getRuntimeCfg();
          sendJson2(res, 200, {
            ok: true,
            ipWhitelist: cfg.ipWhitelist,
            detectedIPs: detectRuntimeIPs(),
            clientIP: extractTrustedClientIP(req)
          });
          return;
        }
        try {
          const body = await parseJsonBody(req);
          const { normalized } = parseWhitelistEntries(Array.isArray(body.allowedIPs) ? body.allowedIPs : []);
          const next = {
            enabled: Boolean(body.enabled),
            allowedIPs: normalized,
            allowLocalhost: body.allowLocalhost !== false
          };
          const updated = configStore ? configStore.update({ ipWhitelist: next }) : { ipWhitelist: next };
          sendJson2(res, 200, {
            ok: true,
            ipWhitelist: updated.ipWhitelist,
            message: "IP \u767D\u540D\u5355\u89C4\u5219\u5DF2\u4FDD\u5B58\u5E76\u5373\u65F6\u751F\u6548"
          });
        } catch (err) {
          sendJson2(res, 400, { ok: false, error: err.message });
        }
      }
    },
    {
      path: "/plugins/dsh-workbuddy2api/config/alerts",
      handler: async (req, res) => {
        if (req.method === "GET") {
          const cfg = getRuntimeCfg();
          sendJson2(res, 200, {
            ok: true,
            alerts: cfg.alerts,
            history: alertManager?.history || []
          });
          return;
        }
        const body = await parseJsonBody(req);
        const webhooks = Array.isArray(body.webhooks) ? body.webhooks.map((s) => String(s).trim()).filter(Boolean) : String(body.webhooksText || "").split(/[\r\n,;]+/).map((s) => s.trim()).filter(Boolean);
        const events = Array.isArray(body.events) && body.events.length > 0 ? body.events : ["ban", "401", "cooling", "low_credit"];
        const nextAlerts = {
          enabled: Boolean(body.enabled),
          webhooks,
          events,
          minCredit: Math.max(0, Number(body.minCredit ?? 50) || 0)
        };
        const updated = configStore ? configStore.update({ alerts: nextAlerts }) : { alerts: nextAlerts };
        sendJson2(res, 200, {
          ok: true,
          alerts: updated.alerts,
          message: "Webhook \u98CE\u63A7\u544A\u8B66\u914D\u7F6E\u5DF2\u4FDD\u5B58"
        });
      }
    },
    {
      path: "/plugins/dsh-workbuddy2api/config/alerts/test",
      handler: async (_req, res) => {
        if (!alertManager) {
          sendJson2(res, 501, { ok: false, error: "AlertManager \u672A\u521D\u59CB\u5316" });
          return;
        }
        const result = await alertManager.sendTestAlert();
        sendJson2(res, result.ok ? 200 : 400, {
          ...result,
          history: alertManager.history,
          message: result.ok ? "\u6D4B\u8BD5\u544A\u8B66\u5DF2\u6210\u529F\u63A8\u9001" : "\u6D4B\u8BD5\u544A\u8B66\u63A8\u9001\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5 Webhook \u5730\u5740"
        });
      }
    },
    {
      path: "/plugins/dsh-workbuddy2api/config/schedule",
      handler: async (req, res) => {
        const body = await parseJsonBody(req);
        const updated = configStore ? configStore.update({
          schedule: body.schedule,
          autoCheckin: body.autoCheckin,
          autoTravel: body.autoTravel,
          autoTasks: body.autoTasks,
          autoRefreshToken: body.autoRefreshToken
        }) : body;
        sendJson2(res, 200, { ok: true, config: updated, message: "\u81EA\u52A8\u5316\u6392\u7A0B\u8BBE\u7F6E\u5DF2\u4FDD\u5B58" });
      }
    },
    // 21. 多租户用户与配额管控 (admin 专属)
    {
      path: "/plugins/dsh-workbuddy2api/admin/users",
      handler: async (_req, res) => {
        if (!userManager) {
          sendJson2(res, 200, { ok: true, users: [], allowRegister: false });
          return;
        }
        const cfg = getRuntimeCfg();
        sendJson2(res, 200, {
          ok: true,
          users: userManager.listUsers(),
          allowRegister: Boolean(cfg.allowRegister)
        });
      }
    },
    {
      path: "/plugins/dsh-workbuddy2api/admin/users/create",
      handler: async (req, res) => {
        try {
          const body = await parseJsonBody(req);
          const user = userManager.createUser(body);
          sendJson2(res, 200, { ok: true, user });
        } catch (err) {
          sendJson2(res, 400, { ok: false, error: err.message });
        }
      }
    },
    {
      path: "/plugins/dsh-workbuddy2api/admin/users/toggle",
      handler: async (req, res) => {
        try {
          const body = await parseJsonBody(req);
          const user = userManager.toggleUser(body.username, body.disabled);
          sendJson2(res, 200, { ok: true, user });
        } catch (err) {
          sendJson2(res, 400, { ok: false, error: err.message });
        }
      }
    },
    {
      path: "/plugins/dsh-workbuddy2api/admin/users/role",
      handler: async (req, res) => {
        try {
          const body = await parseJsonBody(req);
          const user = userManager.setUserRole(body.username, body.role);
          sendJson2(res, 200, { ok: true, user });
        } catch (err) {
          sendJson2(res, 400, { ok: false, error: err.message });
        }
      }
    },
    {
      path: "/plugins/dsh-workbuddy2api/admin/users/quota",
      handler: async (req, res) => {
        try {
          const body = await parseJsonBody(req);
          const user = userManager.setUserQuota(body.username, body.dailyCreditLimit, body.rpm);
          sendJson2(res, 200, { ok: true, user });
        } catch (err) {
          sendJson2(res, 400, { ok: false, error: err.message });
        }
      }
    },
    {
      path: "/plugins/dsh-workbuddy2api/admin/users/reset_password",
      handler: async (req, res) => {
        try {
          const body = await parseJsonBody(req);
          const user = userManager.resetUserPassword(body.username, body.password);
          sendJson2(res, 200, { ok: true, user });
        } catch (err) {
          sendJson2(res, 400, { ok: false, error: err.message });
        }
      }
    },
    {
      path: "/plugins/dsh-workbuddy2api/admin/users/reset_key",
      handler: async (req, res) => {
        try {
          const body = await parseJsonBody(req);
          const user = userManager.resetUserApiKey(body.username);
          sendJson2(res, 200, { ok: true, user });
        } catch (err) {
          sendJson2(res, 400, { ok: false, error: err.message });
        }
      }
    },
    {
      path: "/plugins/dsh-workbuddy2api/admin/users/delete",
      handler: async (req, res) => {
        try {
          const body = await parseJsonBody(req);
          userManager.deleteUser(body.username);
          sendJson2(res, 200, { ok: true });
        } catch (err) {
          sendJson2(res, 400, { ok: false, error: err.message });
        }
      }
    },
    {
      path: "/plugins/dsh-workbuddy2api/admin/system/allow_register",
      handler: async (req, res) => {
        const body = await parseJsonBody(req);
        const updated = configStore ? configStore.update({ allowRegister: Boolean(body.allowRegister) }) : body;
        sendJson2(res, 200, { ok: true, allowRegister: Boolean(updated.allowRegister) });
      }
    },
    // 22. GitHub Releases 版本检查
    {
      path: "/plugins/dsh-workbuddy2api/system/update/check",
      handler: async (_req, res) => {
        try {
          const apiRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`, {
            headers: { "Accept": "application/vnd.github.v3+json", "User-Agent": "dsh-workbuddy2api-updater" },
            signal: AbortSignal.timeout(8e3)
          });
          if (apiRes.status === 404) {
            const tagsRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/tags?per_page=1`, {
              headers: { "Accept": "application/vnd.github.v3+json", "User-Agent": "dsh-workbuddy2api-updater" },
              signal: AbortSignal.timeout(8e3)
            });
            const tags = await tagsRes.json().catch(() => []);
            const latestTag = Array.isArray(tags) && tags[0]?.name ? tags[0].name : `v${SERVICE_VERSION}`;
            const normLatest2 = latestTag.replace(/^v/i, "");
            sendJson2(res, 200, {
              ok: true,
              currentVersion: SERVICE_VERSION,
              latestVersion: latestTag,
              hasUpdate: normLatest2 !== SERVICE_VERSION && latestTag !== `v${SERVICE_VERSION}`,
              repoUrl: `https://github.com/${GITHUB_REPO}`,
              releaseNotes: "\u5F53\u524D\u4ED3\u5E93\u6682\u65E0\u6B63\u5F0F Release\uFF0C\u5DF2\u8BFB\u53D6\u6700\u65B0 Git Tag\u3002"
            });
            return;
          }
          if (!apiRes.ok) {
            throw new Error(`GitHub API HTTP ${apiRes.status}`);
          }
          const rel = await apiRes.json();
          const latestVersion = String(rel.tag_name || "").trim();
          const normLatest = latestVersion.replace(/^v/i, "");
          sendJson2(res, 200, {
            ok: true,
            currentVersion: SERVICE_VERSION,
            latestVersion,
            hasUpdate: Boolean(normLatest && normLatest !== SERVICE_VERSION),
            releaseTitle: rel.name || latestVersion,
            releaseNotes: rel.body || "",
            releaseUrl: rel.html_url || `https://github.com/${GITHUB_REPO}/releases`,
            publishedAt: rel.published_at || ""
          });
        } catch (err) {
          sendJson2(res, 200, {
            ok: false,
            currentVersion: SERVICE_VERSION,
            repoUrl: `https://github.com/${GITHUB_REPO}`,
            error: `\u68C0\u67E5\u66F4\u65B0\u5931\u8D25: ${err.message}`
          });
        }
      }
    }
  ];
  const PUBLIC_PATHS = /* @__PURE__ */ new Set([
    "/plugins/dsh-workbuddy2api/auth/me",
    "/plugins/dsh-workbuddy2api/auth/login",
    "/plugins/dsh-workbuddy2api/auth/logout",
    "/plugins/dsh-workbuddy2api/auth/register",
    "/plugins/dsh-workbuddy2api/public/status"
  ]);
  const USER_PATHS = /* @__PURE__ */ new Set([
    "/plugins/dsh-workbuddy2api/status",
    "/plugins/dsh-workbuddy2api/usage",
    "/plugins/dsh-workbuddy2api/logs",
    "/plugins/dsh-workbuddy2api/models",
    "/plugins/dsh-workbuddy2api/playground/chat",
    "/plugins/dsh-workbuddy2api/user/apikey/reset"
  ]);
  const routeMap = new Map(routes.map((r) => [r.path, r.handler]));
  const handlePluginRoute = async (req, res, pathname) => {
    const handler = routeMap.get(pathname);
    if (!handler) return false;
    try {
      if (userManager && !PUBLIC_PATHS.has(pathname)) {
        const auth = userManager.checkWebAuth(req);
        req._wbSessionUser = auth.user;
        if (!auth.ok) {
          sendJson2(res, 401, { ok: false, authRequired: true, error: "\u8BF7\u5148\u767B\u5F55\u63A7\u5236\u53F0" });
          return true;
        }
        if (auth.user?.role !== "admin" && !USER_PATHS.has(pathname)) {
          sendJson2(res, 403, { ok: false, error: "\u4EC5\u7BA1\u7406\u5458\u53EF\u6267\u884C\u6B64\u64CD\u4F5C" });
          return true;
        }
      }
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
    loopback.setPortalHandler(async (_req, res) => {
      if (!res.headersSent) {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      }
      res.end(renderPortalHtml({ port: loopback.actualPort || loopback.preferredPort, version: SERVICE_VERSION }));
      return true;
    });
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

// src/runtime.js
function createGatewayRuntime(options = {}) {
  const rawConfig = options.rawConfig || {};
  const storeOpts = options.dshHome ? { dshHome: options.dshHome } : void 0;
  const configStore = new ConfigStore(rawConfig, storeOpts);
  const cfg = configStore.getAll();
  const resolvedHome = options.dshHome || configStore.dshHome;
  const store = new AccountStore({
    dshHome: resolvedHome,
    authDir: options.authDir ?? cfg.authDir,
    skipDiscovery: Boolean(options.skipDiscovery)
  });
  const alertManager = new AlertManager({ configStore });
  const userManager = new UserManager({ configStore, dshHome: resolvedHome });
  const client = new UpstreamClient({
    configStore,
    dshHome: resolvedHome,
    proxy: options.proxy ?? cfg.proxy,
    onTokenRefresh: (acc) => store.upsert(acc)
  });
  const scheduler = new Scheduler(store, {
    client,
    configStore,
    alertManager,
    dshHome: resolvedHome,
    maxInFlightCN: cfg.maxInFlightCN,
    maxInFlightGlobal: cfg.maxInFlightGlobal,
    queueTimeoutMs: cfg.queueTimeoutMs
  });
  const ledger = new UsageLedger({ dshHome: resolvedHome });
  const port = options.port ?? cfg.gatewayPort;
  const loopback = new LoopbackGateway(scheduler, client, ledger, {
    configStore,
    userManager,
    alertManager,
    port,
    apiKey: cfg.apiKey,
    aliases: cfg.aliases,
    enabledModels: cfg.enabledModels
  });
  const routesInfo = registerWebRoutes(options.ctx || null, {
    scheduler,
    client,
    ledger,
    loopback,
    configStore,
    userManager,
    alertManager
  });
  let startupTimer = null;
  let started = false;
  const log = options.logger || console;
  async function start() {
    if (started) {
      return loopback.actualPort || port;
    }
    started = true;
    const boundPort = await loopback.start();
    loopback.refreshDiscoveredModels().catch(() => {
    });
    scheduler.startAutoRoutines();
    if (cfg.autoCheckin !== false && !options.skipInitialWelfare) {
      startupTimer = setTimeout(async () => {
        const active = store.getActive();
        if (active && !active.disabled) {
          try {
            log?.info?.(`[workbuddy2api] \u542F\u52A8\u81EA\u52A8\u5316\u4F8B\u884C\u4EFB\u52A1\uFF1A\u5F00\u59CB\u6267\u884C\u5F53\u524D\u8D26\u53F7 (${active.account.nickname}) \u798F\u5229\u4E0E\u732B\u732B\u65C5\u884C...`);
            const welfareRes = await claimAllWelfare(active);
            log?.info?.(`[workbuddy2api] \u4F8B\u884C\u798F\u5229\u7ED3\u679C: ${welfareRes.summary}`);
          } catch (e) {
            log?.warn?.(`[workbuddy2api] \u542F\u52A8\u81EA\u52A8\u5316\u4F8B\u884C\u4EFB\u52A1\u8B66\u544A: ${e.message}`);
          }
        }
      }, 3e3);
      if (startupTimer.unref) startupTimer.unref();
    }
    return boundPort;
  }
  function stop() {
    if (startupTimer) {
      clearTimeout(startupTimer);
      startupTimer = null;
    }
    scheduler.stopAutoRoutines();
    loopback.stop();
    started = false;
  }
  return {
    dshHome: resolvedHome,
    configStore,
    store,
    alertManager,
    userManager,
    client,
    scheduler,
    ledger,
    loopback,
    routesInfo,
    start,
    stop
  };
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
  ctx.logger?.info?.("\u{1F680} [dsh-workbuddy2api] \u6B63\u5728\u521D\u59CB\u5316 WorkBuddy 2API \u5168\u529F\u80FD\u7F51\u5173\u63D2\u4EF6...");
  const runtime = createGatewayRuntime({
    ctx,
    rawConfig: rawConfig || {},
    logger: ctx.logger
  });
  const { configStore, store, client, scheduler, ledger, loopback } = runtime;
  runtime.start().catch((err) => {
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
  ctx.effect?.(() => {
    return () => {
      ctx.logger?.info?.("[dsh-workbuddy2api] \u6B63\u5728\u505C\u6B62\u7F51\u5173\u5E76\u91CA\u653E\u8D44\u6E90...");
      runtime.stop();
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

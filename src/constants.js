/**
 * constants.js - WorkBuddy 2API 常量、端点、模型与推理档位表
 */

export const CN_CHAT_BASE = 'https://copilot.tencent.com';
export const CN_BILLING_BASE = 'https://www.codebuddy.cn';
export const GLOBAL_BASE = 'https://www.workbuddy.ai';

export const CHAT_COMPLETIONS_PATH = '/v2/chat/completions';
export const TOKEN_REFRESH_PATH = '/v2/plugin/auth/token/refresh';
export const CN_MODELS_PATH = '/v2/plugin/auth/models';
export const V3_CONFIG_PATH = '/v3/config';

export const BILLING_METER_PATH_CN = '/v2/billing/meter/get-user-resource';
export const BILLING_METER_PATH_GLOBAL = '/billing/meter/get-user-resource';
export const DAILY_CHECKIN_PATH_CN = '/v2/billing/meter/daily-checkin';
export const DAILY_CHECKIN_PATH_GLOBAL = '/billing/meter/daily-checkin';
export const GLOBAL_TRIAL_PATH = '/billing/ide/trial';
export const VIDEO_GENERATIONS_PATH = '/v2/videos/generations';

// 猫猫旅行 (Cat Travel) 与成长活动端点
export const TRAVEL_STATUS_PATH = '/activity/growth/buddy/travel/status';
export const TRAVEL_DEPART_PATH = '/activity/growth/buddy/travel/depart';
export const TRAVEL_CLAIM_PATH = '/activity/growth/buddy/travel/claim';
export const BUDDY_INFO_PATH = '/activity/growth/buddy/info';
export const BUDDY_FIRST_PATH = '/activity/growth/buddy/first';
export const BUDDY_AGREEMENT_PATH = '/activity/growth/buddy/agreement';
export const STREAK_PATH = '/activity/growth/streak';
export const REDEEM_PATH = '/activity/growth/redeem';
export const LOTTERY_CHANCES_PATH = '/activity/growth/lottery/chances';
export const LOTTERY_DRAW_PATH = '/activity/growth/lottery/draw';
export const REPORT_PATH = '/v2/report';
export const HEATMAP_PATH = '/activity/growth/heatmap';
export const MAKEUP_CARD_PATH = '/activity/growth/makeup-cards/use';
export const CLAIM_GIFT_PATH = '/billing/meter/claim-gift';
export const CLAIM_COMPENSATION_PATH = '/billing/meter/claim-compensation';

export const PROVIDER_NAME = 'workbuddy';
export const PROVIDER_ALIAS = 'workbuddy2api';
export const SETTINGS_NS = 'settings.workbuddy2api';
export const SIDEBAR_PANEL_ID = 'workbuddy2api-panel';

export const DEFAULT_GATEWAY_PORT = 7863;
export const DEFAULT_IDLE_TIMEOUT_MS = 300000;
export const SSE_PING_INTERVAL_MS = 3000;

/** 错误分类枚举 */
export const ErrKind = {
  NONE: 'none',
  HARD_CREDIT: 'hard_credit',       // 余额不足 (402)
  SOFT_RATE: 'soft_rate',           // 429 / 6004 软限流
  SESSION_DEAD: 'session_dead',     // 401 凭证失效
  NOT_FOUND: 'not_found',           // 404
  SERVER: 'server',                 // 5xx
  CONTENT_BLOCKED: 'content_blocked', // 400 敏感词/策略拦截
  BAD_PARAMS: 'bad_params',         // 400 参数格式
  ACCOUNT_FAULT: 'account_fault',   // 11140 账号被禁
  PROMPT_TOO_LONG: 'prompt_too_long', // 11115
  WAF_BLOCK: 'waf_block',           // 403
  CLIENT: 'client',
};

/** 推理思考档位表 (按 realm 分流) */
export const CN_EFFORT_FALLBACK = {
  'deepseek-v4-flash': { efforts: ['low', 'high', 'max'], defaultEffort: 'high' },
  'deepseek-v4.1-flash': { efforts: ['low', 'high', 'max'], defaultEffort: 'high' },
  'deepseek-v4-pro': { efforts: ['low', 'high', 'xhigh'], defaultEffort: 'high' },
  'hy4-preview': { efforts: ['high'], defaultEffort: 'high' },
  'hy4-preview-x': { efforts: ['high'], defaultEffort: 'high' },
  'hy4free': { efforts: ['high'], defaultEffort: 'high' },
  'hy3': { efforts: ['low', 'high'], defaultEffort: 'high' },
  'hy3-x': { efforts: ['low', 'high'], defaultEffort: 'high' },
  'glm-5.3': { efforts: ['low', 'high', 'max'], defaultEffort: 'high' },
  'glm-5.3-flash': { efforts: ['low', 'high', 'max'], defaultEffort: 'high' },
  'glm-5.2': { efforts: ['high', 'xhigh'], defaultEffort: 'high' },
  'glm-5.1': { efforts: ['medium'], defaultEffort: 'medium' },
  'glm-5v-turbo': { efforts: ['medium'], defaultEffort: 'medium' },
  'kimi-k3-1': { efforts: ['medium'], defaultEffort: 'medium' },
  'kimi-k2.7': { efforts: ['medium'], defaultEffort: 'medium' },
  'kimi-k2.6': { efforts: ['medium'], defaultEffort: 'medium' },
  'minimax-m3': { efforts: ['medium'], defaultEffort: 'medium' },
};

export const GLOBAL_EFFORT_FALLBACK = {
  'fast-model': { efforts: ['medium'], defaultEffort: 'medium' },
  'balanced-model': { efforts: ['medium'], defaultEffort: 'medium' },
  'primary-model': { efforts: ['high'], defaultEffort: 'high' },
  'hy4-preview-f': { efforts: ['high'], defaultEffort: 'high' },
  'hy3': { efforts: ['low', 'high'], defaultEffort: 'high' },
  'deepseek-v4.1-flash': { efforts: ['high'], defaultEffort: 'high' },
  'gpt-6-astra': { efforts: ['low', 'medium', 'high', 'xhigh', 'max'], defaultEffort: 'high' },
  'gpt-5.6-sol': { efforts: ['low', 'medium', 'high', 'xhigh', 'max'], defaultEffort: 'high' },
  'gpt-5.6-terra': { efforts: ['low', 'medium', 'high', 'xhigh', 'max'], defaultEffort: 'high' },
  'gpt-5.6-luna': { efforts: ['low', 'medium', 'high', 'xhigh', 'max'], defaultEffort: 'high' },
  'gpt-5.5': { efforts: ['low', 'medium', 'high', 'xhigh'], defaultEffort: 'high' },
  'gpt-5.4': { efforts: ['low', 'medium', 'high', 'xhigh'], defaultEffort: 'high' },
  'gpt-5.3-codex': { efforts: ['medium'], defaultEffort: 'medium' },
  'gemini-3.5-flash': { efforts: ['medium'], defaultEffort: 'medium' },
  'glm-5.3': { efforts: ['low', 'high', 'max'], defaultEffort: 'high' },
  'glm-5.2': { efforts: ['high', 'xhigh'], defaultEffort: 'high' },
  'kimi-k3': { efforts: ['medium'], defaultEffort: 'medium' },
  'kimi-k2.6': { efforts: ['medium'], defaultEffort: 'medium' },
};

/** 静态内置模型完整兜底清单 (CN + Global + Auto-Free + Video) */
export const STATIC_MODELS = [
  // 智能路由池
  {
    id: 'auto-free',
    name: 'Auto Free (智能免费模型路由池)',
    realm: 'auto',
    contextWindow: 1000000,
    maxTokens: 128000,
    supportsImages: true,
    rate: '免费',
    badge: '智能路由'
  },
  // Global 国际版模型
  {
    id: 'global:deepseek-v4.1-flash',
    name: 'DeepSeek-V4.1-Flash (Global)',
    realm: 'global',
    contextWindow: 1000000,
    maxTokens: 128000,
    supportsImages: true,
    rate: 'x0.05',
    badge: '推荐'
  },
  {
    id: 'global:glm-5.3-flash',
    name: 'GLM-5.3-Flash (Global)',
    realm: 'global',
    contextWindow: 1000000,
    maxTokens: 32000,
    supportsImages: true,
    rate: 'x0.05'
  },
  {
    id: 'global:gpt-6-astra',
    name: 'GPT-6-Astra (Global)',
    realm: 'global',
    contextWindow: 1000000,
    maxTokens: 128000,
    supportsImages: true,
    rate: 'x1.00',
    badge: '旗舰'
  },
  {
    id: 'global:gpt-5.6-sol',
    name: 'GPT-5.6-Sol (Global)',
    realm: 'global',
    contextWindow: 1000000,
    maxTokens: 128000,
    supportsImages: false,
    rate: 'x0.50'
  },
  {
    id: 'global:gemini-3.5-flash',
    name: 'Gemini-3.5-Flash (Global)',
    realm: 'global',
    contextWindow: 1000000,
    maxTokens: 65536,
    supportsImages: true,
    rate: 'x0.10'
  },
  {
    id: 'global:primary-model',
    name: 'Primary 主力 (Global)',
    realm: 'global',
    contextWindow: 272000,
    maxTokens: 72000,
    supportsImages: true,
    rate: '主力'
  },
  {
    id: 'global:fast-model',
    name: 'Fast 极速 (Global)',
    realm: 'global',
    contextWindow: 200000,
    maxTokens: 32000,
    supportsImages: false,
    rate: '极速'
  },
  {
    id: 'global:balanced-model',
    name: 'Balanced 均衡 (Global)',
    realm: 'global',
    contextWindow: 256000,
    maxTokens: 32000,
    supportsImages: true,
    rate: '均衡'
  },
  // CN 国内版模型
  {
    id: 'cn:hy4free',
    name: 'Hunyuan-4-Free (CN)',
    realm: 'cn',
    contextWindow: 960000,
    maxTokens: 64000,
    supportsImages: true,
    rate: 'x0.00',
    badge: '限时免费'
  },
  {
    id: 'cn:deepseek-v4.1-flash',
    name: 'DeepSeek-V4.1-Flash (CN)',
    realm: 'cn',
    contextWindow: 1000000,
    maxTokens: 128000,
    supportsImages: true,
    rate: 'x0.05'
  },
  {
    id: 'cn:deepseek-v4-pro',
    name: 'DeepSeek-V4-Pro (CN)',
    realm: 'cn',
    contextWindow: 176000,
    maxTokens: 24000,
    supportsImages: true,
    rate: 'x1.00'
  },
  {
    id: 'cn:glm-5.3',
    name: 'GLM-5.3 (CN)',
    realm: 'cn',
    contextWindow: 1000000,
    maxTokens: 32000,
    supportsImages: true,
    rate: 'x0.30'
  },
  {
    id: 'cn:glm-5.3-flash',
    name: 'GLM-5.3-Flash (CN)',
    realm: 'cn',
    contextWindow: 1000000,
    maxTokens: 32000,
    supportsImages: true,
    rate: 'x0.05'
  },
  {
    id: 'cn:kimi-k3-1',
    name: 'Kimi-K3-1 (CN)',
    realm: 'cn',
    contextWindow: 200000,
    maxTokens: 32000,
    supportsImages: false,
    rate: 'x0.30'
  },
  {
    id: 'cn:minimax-m3',
    name: 'MiniMax-M3 (CN)',
    realm: 'cn',
    contextWindow: 200000,
    maxTokens: 32000,
    supportsImages: false,
    rate: 'x0.20'
  },
  // 视频生成大模型
  {
    id: 'kling-video-v3',
    name: 'Kling 3.0 可灵视频直出',
    realm: 'video',
    contextWindow: 8192,
    maxTokens: 2048,
    supportsImages: true,
    rate: '视频',
    badge: '可灵3.0'
  },
  {
    id: 'minimax-video-h3',
    name: 'MiniMax-H3 海螺视频直出',
    realm: 'video',
    contextWindow: 8192,
    maxTokens: 2048,
    supportsImages: true,
    rate: '视频',
    badge: '海螺H3'
  }
];

/** 默认模型别名表 (兼容各类客户端 Cursor/Dify/Claude/Cherry) */
export const DEFAULT_MODEL_ALIASES = {
  'deepseek-chat': 'global:deepseek-v4.1-flash',
  'deepseek-reasoner': 'cn:deepseek-v4-pro',
  'gpt-4o': 'global:gpt-6-astra',
  'gpt-4o-mini': 'global:deepseek-v4.1-flash',
  'claude-3-5-sonnet': 'global:primary-model',
  'claude-3-7-sonnet': 'global:gpt-6-astra',
  'gemini-flash': 'global:gemini-3.5-flash',
  'kling-v3-std': 'kling-video-v3',
  'kling-v3-pro': 'kling-video-v3',
  'keling': 'kling-video-v3',
  'hailuo': 'minimax-video-h3'
};

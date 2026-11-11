/**
 * constants.js - WorkBuddy 2API 常量、端点、真实模型倍率目录与推理档位表
 */

export const CN_CHAT_BASE = 'https://copilot.tencent.com';
export const CN_BILLING_BASE = 'https://www.codebuddy.cn';
export const GLOBAL_BASE = 'https://www.workbuddy.ai';

export const CHAT_COMPLETIONS_PATH = '/v2/chat/completions';
export const TOKEN_REFRESH_PATH = '/v2/plugin/auth/token/refresh';
export const ENTERPRISE_MODELS_PATH = '/v2/enterprises/personal/models';
export const ENTERPRISE_MODELS_FALLBACK_PATH = '/console/enterprises/personal/models';
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
  HARD_CREDIT: 'hard_credit',
  SOFT_RATE: 'soft_rate',
  SESSION_DEAD: 'session_dead',
  NOT_FOUND: 'not_found',
  SERVER: 'server',
  CONTENT_BLOCKED: 'content_blocked',
  BAD_PARAMS: 'bad_params',
  ACCOUNT_FAULT: 'account_fault',
  PROMPT_TOO_LONG: 'prompt_too_long',
  WAF_BLOCK: 'waf_block',
  CLIENT: 'client'
};

/**
 * 解析上游模型积分倍率文本 ("x0.05 credits" / "x0.00" / "x6.67")
 */
export function parseCreditMultiplier(rawCredits, tags = []) {
  const s = String(rawCredits || '').replace(/credits?/gi, '').trim();
  const numMatch = s.match(/x?\s*([0-9]+(?:\.[0-9]+)?)/i);
  const multiplier = numMatch ? Number(numMatch[1]) : null;
  const tagList = Array.isArray(tags) ? tags : [];

  let badge = '';
  for (const tag of tagList) {
    if (typeof tag === 'string' && tag.startsWith('badge:')) {
      const parts = tag.split(':');
      if (parts[1]) {
        badge = parts[1];
        break;
      }
    }
  }

  const isFree =
    multiplier === 0 ||
    badge.includes('免费') ||
    /free\s*now/i.test(badge);

  const rate = multiplier !== null
    ? `x${multiplier.toFixed(2)}`
    : (s || '-');

  return {
    credits: s || '',
    rate,
    multiplier,
    isFree,
    badge
  };
}

/** 推理思考档位表 (按 realm 分流，依据官方实时下发目录校准) */
export const CN_EFFORT_FALLBACK = {
  'hy4free': { efforts: ['high'], defaultEffort: 'high' },
  'hy4std': { efforts: ['high'], defaultEffort: 'high' },
  'hy4-preview-x': { efforts: ['high'], defaultEffort: 'high' },
  'hy3': { efforts: ['high'], defaultEffort: 'high' },
  'hy3-x': { efforts: ['low', 'high'], defaultEffort: 'high' },
  'glm-5.3': { efforts: ['low', 'high', 'max'], defaultEffort: 'high' },
  'glm-5.3-flash': { efforts: ['low', 'high', 'max'], defaultEffort: 'high' },
  'glm-5.2': { efforts: ['medium', 'high'], defaultEffort: 'medium' },
  'glm-4.6v': { efforts: ['medium'], defaultEffort: 'medium' },
  'minimax-m2.5': { efforts: ['medium'], defaultEffort: 'medium' },
  'minimax-m3.1-flash': { efforts: ['low', 'medium', 'high', 'xhigh', 'max'], defaultEffort: 'high' },
  'kimi-k3-1': { efforts: ['medium'], defaultEffort: 'medium' },
  'kimi-k3.1-pro': { efforts: ['low', 'high', 'max'], defaultEffort: 'high' },
  'kimi-k2.8-preview': { efforts: ['low', 'high', 'max'], defaultEffort: 'high' },
  'kimi-k2.5': { efforts: ['medium'], defaultEffort: 'medium' },
  'kimi-k2-thinking': { efforts: ['medium'], defaultEffort: 'medium' },
  'deepseek-v4-flash': { efforts: ['high'], defaultEffort: 'high' },
  'deepseek-v4.1-flash': { efforts: ['low', 'high', 'max'], defaultEffort: 'high' },
  'deepseek-v4-pro': { efforts: ['high'], defaultEffort: 'high' },
  'deepseek-v3-2-volc': { efforts: ['medium'], defaultEffort: 'medium' },
  'hunyuan-2.0-thinking': { efforts: ['medium'], defaultEffort: 'medium' },
  'space-bunny': { efforts: ['low', 'medium', 'high', 'xhigh', 'max'], defaultEffort: 'high' },
  'step-5-preview': { efforts: ['low', 'medium', 'high'], defaultEffort: 'high' },
  'mimo-v2.6-pro': { efforts: ['high'], defaultEffort: 'high' }
};

export const GLOBAL_EFFORT_FALLBACK = {
  'max-model': { efforts: ['high'], defaultEffort: 'high' },
  'hy4free': { efforts: ['high'], defaultEffort: 'high' },
  'hy4std': { efforts: ['high'], defaultEffort: 'high' },
  'hy3': { efforts: ['low', 'high'], defaultEffort: 'high' },
  'deepseek-v4.1-flash-sg': { efforts: ['low', 'high', 'max'], defaultEffort: 'high' },
  'deepseek-v4.1-flash': { efforts: ['high'], defaultEffort: 'high' },
  'gpt-6-astra': { efforts: ['low', 'medium', 'high', 'xhigh', 'max'], defaultEffort: 'high' },
  'gpt-6.1-sol': { efforts: ['low', 'medium', 'high', 'xhigh'], defaultEffort: 'high' },
  'gpt-6-sol': { efforts: ['low', 'medium', 'high', 'xhigh'], defaultEffort: 'high' },
  'gpt-6-luna': { efforts: ['low', 'medium', 'high', 'xhigh'], defaultEffort: 'high' },
  'gpt-5.6-sol': { efforts: ['low', 'medium', 'high', 'xhigh', 'max'], defaultEffort: 'high' },
  'gpt-5.6-terra': { efforts: ['low', 'medium', 'high', 'xhigh', 'max'], defaultEffort: 'high' },
  'gpt-5.6-luna': { efforts: ['low', 'medium', 'high', 'xhigh', 'max'], defaultEffort: 'high' },
  'grok-4.7': { efforts: ['low', 'medium', 'high', 'xhigh'], defaultEffort: 'high' },
  'gemini-3.8-flash': { efforts: ['low', 'medium', 'high'], defaultEffort: 'high' },
  'glm-5.3': { efforts: ['low', 'high', 'max'], defaultEffort: 'high' },
  'glm-5.3-flash': { efforts: ['low', 'high', 'max'], defaultEffort: 'high' },
  'kimi-k3.1-pro': { efforts: ['low', 'high', 'max'], defaultEffort: 'high' },
  'kimi-k3.1-pro-highspeed': { efforts: ['low', 'high', 'max'], defaultEffort: 'high' },
  'kimi-k3': { efforts: ['medium'], defaultEffort: 'medium' },
  'minimax-m3.1-flash': { efforts: ['low', 'medium', 'high', 'xhigh', 'max'], defaultEffort: 'high' }
};

function mEntry(opts) {
  const parsed = parseCreditMultiplier(opts.credits, opts.tags);
  return {
    id: opts.id,
    bareId: opts.id.replace(/^(cn|global):/i, ''),
    name: opts.name,
    description: opts.description || '',
    realm: opts.realm,
    contextWindow: opts.contextWindow || 200000,
    maxTokens: opts.maxTokens || 32000,
    supportsImages: Boolean(opts.supportsImages),
    supportsReasoning: Boolean(opts.supportsReasoning),
    supportsToolCall: Boolean(opts.supportsToolCall ?? true),
    supportedEfforts: opts.supportedEfforts || [],
    defaultEffort: opts.defaultEffort || '',
    credits: parsed.credits,
    rate: opts.rate || parsed.rate,
    multiplier: opts.multiplier ?? parsed.multiplier,
    isFree: opts.isFree ?? parsed.isFree,
    badge: opts.badge || parsed.badge || '',
    tags: opts.tags || [],
    vendor: opts.vendor || ''
  };
}

/** 静态基线模型完整目录（真实对齐官方 /v2/enterprises/personal/models 倍率） */
export const STATIC_MODELS = [
  mEntry({
    id: 'auto-free',
    name: 'Auto Free (智能免费模型路由)',
    description: '优先路由当前可用 x0.00 免费旗舰与超低倍率模型',
    realm: 'auto',
    contextWindow: 960000,
    maxTokens: 64000,
    supportsImages: true,
    supportsReasoning: true,
    credits: 'x0.00',
    isFree: true,
    badge: '智能免费'
  }),
  // Global 国际版真实倍率目录
  mEntry({ id: 'global:hy4free', name: 'Hy4 Free (Global)', description: '最新旗舰模型，Agent与多模专长', realm: 'global', contextWindow: 960000, maxTokens: 64000, supportsImages: true, supportsReasoning: true, supportedEfforts: ['high'], credits: 'x0.00', badge: '免费' }),
  mEntry({ id: 'global:hy3', name: 'Hy3 (Global)', description: '混元思考模型，增强推理能力', realm: 'global', contextWindow: 200000, maxTokens: 32000, supportsReasoning: true, supportedEfforts: ['low', 'high'], credits: 'x0.00', badge: 'Free now' }),
  mEntry({ id: 'global:gpt-6-luna', name: 'GPT-6-Luna (Global)', description: '高吞吐高性价比轻量任务模型', realm: 'global', contextWindow: 272000, maxTokens: 72000, supportsImages: true, supportsReasoning: true, supportedEfforts: ['low', 'medium', 'high', 'xhigh'], credits: 'x0.07' }),
  mEntry({ id: 'global:glm-5.3-flash', name: 'GLM-5.3-Flash (Global)', description: '原生多模态视觉与极速编程模型', realm: 'global', contextWindow: 1000000, maxTokens: 32000, supportsImages: true, supportsReasoning: true, supportedEfforts: ['low', 'high', 'max'], credits: 'x0.08' }),
  mEntry({ id: 'global:minimax-m3.1-flash', name: 'MiniMax-M3.1-Flash (Global)', description: '原生多模态 Agent 与极速推理', realm: 'global', contextWindow: 200000, maxTokens: 32000, supportsImages: true, supportsReasoning: true, supportedEfforts: ['low', 'medium', 'high', 'xhigh', 'max'], credits: 'x0.08' }),
  mEntry({ id: 'global:deepseek-v4.1-flash-sg', name: 'DeepSeek-V4.1-Flash (Global)', description: 'DeepSeek 旗舰模型，1M 上下文窗口，原生多模态', realm: 'global', contextWindow: 1000000, maxTokens: 128000, supportsImages: true, supportsReasoning: true, supportedEfforts: ['low', 'high', 'max'], credits: 'x0.11' }),
  mEntry({ id: 'global:gpt-5.6-luna', name: 'GPT-5.6-Luna (Global)', description: 'OpenAI 轻量模型，响应快速', realm: 'global', contextWindow: 272000, maxTokens: 64000, supportsImages: true, supportsReasoning: true, supportedEfforts: ['low', 'medium', 'high', 'xhigh', 'max'], credits: 'x0.14' }),
  mEntry({ id: 'global:default-model', name: 'Auto (Global)', description: '快速响应，适合日常问答和简单任务', realm: 'global', contextWindow: 176000, maxTokens: 24000, supportsImages: true, credits: 'x0.15' }),
  mEntry({ id: 'global:hy4std', name: 'Hy4 Standard (Global)', description: '混元旗舰标准版', realm: 'global', contextWindow: 960000, maxTokens: 64000, supportsImages: true, supportsReasoning: true, supportedEfforts: ['high'], credits: 'x0.29' }),
  mEntry({ id: 'global:glm-5.3', name: 'GLM-5.3 (Global)', description: '能力均衡，适合长程工程任务', realm: 'global', contextWindow: 1000000, maxTokens: 32000, supportsImages: true, supportsReasoning: true, supportedEfforts: ['low', 'high', 'max'], credits: 'x0.69' }),
  mEntry({ id: 'global:gemini-3.8-flash', name: 'Gemini-3.8-Flash (Global)', description: '能力均衡，多模态高效推理', realm: 'global', contextWindow: 1000000, maxTokens: 65536, supportsImages: true, supportsReasoning: true, supportedEfforts: ['low', 'medium', 'high'], credits: 'x0.95' }),
  mEntry({ id: 'global:kimi-k3.1-pro', name: 'Kimi-K3.1-Pro (Global)', description: '3万亿级参数全能模型', realm: 'global', contextWindow: 256000, maxTokens: 32000, supportsImages: true, supportsReasoning: true, supportedEfforts: ['low', 'high', 'max'], credits: 'x0.97' }),
  mEntry({ id: 'global:gpt-6.1-sol', name: 'GPT-6.1-Sol (Global)', description: '专为复杂编码与智能体工作流构建', realm: 'global', contextWindow: 272000, maxTokens: 72000, supportsImages: true, supportsReasoning: true, supportedEfforts: ['low', 'medium', 'high', 'xhigh'], credits: 'x1.33', badge: '编码主力' }),
  mEntry({ id: 'global:gpt-6-sol', name: 'GPT-6-Sol (Global)', description: '复杂编码与长程 Agent 旗舰', realm: 'global', contextWindow: 272000, maxTokens: 72000, supportsImages: true, supportsReasoning: true, supportedEfforts: ['low', 'medium', 'high', 'xhigh'], credits: 'x1.33' }),
  mEntry({ id: 'global:max-model', name: 'Max (Global)', description: '更强的深度推理能力', realm: 'global', contextWindow: 272000, maxTokens: 72000, supportsImages: true, supportsReasoning: true, credits: 'x1.33' }),
  mEntry({ id: 'global:gpt-5.6-terra', name: 'GPT-5.6-Terra (Global)', description: 'OpenAI 均衡主力模型', realm: 'global', contextWindow: 272000, maxTokens: 64000, supportsImages: true, supportsReasoning: true, supportedEfforts: ['low', 'medium', 'high', 'xhigh', 'max'], credits: 'x1.39' }),
  mEntry({ id: 'global:kimi-k3.1-pro-highspeed', name: 'Kimi-K3.1-Pro-Highspeed (Global)', description: '2-3x 极速输出旗舰', realm: 'global', contextWindow: 256000, maxTokens: 32000, supportsImages: true, supportsReasoning: true, supportedEfforts: ['low', 'high', 'max'], credits: 'x1.56' }),
  mEntry({ id: 'global:kimi-k3', name: 'Kimi-K3 (Global)', description: '复杂长程与前端开发专长', realm: 'global', contextWindow: 200000, maxTokens: 32000, supportsReasoning: true, credits: 'x1.62' }),
  mEntry({ id: 'global:grok-4.7', name: 'Grok-4.7 (Global)', description: 'SpaceXAI 前沿编程与科研工作模型', realm: 'global', contextWindow: 256000, maxTokens: 64000, supportsImages: true, supportsReasoning: true, supportedEfforts: ['low', 'medium', 'high', 'xhigh'], credits: 'x1.90' }),
  mEntry({ id: 'global:gpt-5.6-sol', name: 'GPT-5.6-Sol (Global)', description: 'OpenAI 深度长程推理', realm: 'global', contextWindow: 272000, maxTokens: 72000, supportsImages: true, supportsReasoning: true, supportedEfforts: ['low', 'medium', 'high', 'xhigh', 'max'], credits: 'x3.47' }),
  mEntry({ id: 'global:gpt-6-astra', name: 'GPT-6-Astra (Global)', description: 'OpenAI 顶级复杂推理旗舰', realm: 'global', contextWindow: 272000, maxTokens: 72000, supportsImages: true, supportsReasoning: true, supportedEfforts: ['low', 'medium', 'high', 'xhigh', 'max'], credits: 'x6.67', badge: '最高倍率' }),
  // CN 国内版真实倍率目录
  mEntry({ id: 'cn:hy4free', name: 'Hy4 限时免费 (CN)', description: '最新旗舰模型，Agent与多模专长', realm: 'cn', contextWindow: 960000, maxTokens: 64000, supportsImages: true, supportsReasoning: true, supportedEfforts: ['high'], credits: 'x0.00', badge: '限时免费' }),
  mEntry({ id: 'cn:hy3', name: 'Hy3 限时免费 (CN)', description: '混元思考模型，增强推理能力', realm: 'cn', contextWindow: 200000, maxTokens: 32000, supportsReasoning: true, credits: 'x0.00', badge: '限时免费' }),
  mEntry({ id: 'cn:hunyuan-2.0-thinking', name: 'Hunyuan-2.0-Thinking (CN)', description: '混元 2.0 思考轻量模型', realm: 'cn', contextWindow: 128000, maxTokens: 16000, supportsReasoning: true, credits: 'x0.04' }),
  mEntry({ id: 'cn:hy3-x', name: 'Hy3-X (CN)', description: '混元思考增强版', realm: 'cn', contextWindow: 200000, maxTokens: 32000, supportsReasoning: true, supportedEfforts: ['low', 'high'], credits: 'x0.05' }),
  mEntry({ id: 'cn:glm-5.3-flash', name: 'GLM-5.3-Flash (CN)', description: '原生多模态视觉模型', realm: 'cn', contextWindow: 1000000, maxTokens: 32000, supportsImages: true, supportsReasoning: true, supportedEfforts: ['low', 'high', 'max'], credits: 'x0.08' }),
  mEntry({ id: 'cn:minimax-m3.1-flash', name: 'MiniMax-M3.1-Flash (CN)', description: '极速编程与办公多模态', realm: 'cn', contextWindow: 200000, maxTokens: 32000, supportsImages: true, supportsReasoning: true, supportedEfforts: ['low', 'medium', 'high', 'xhigh', 'max'], credits: 'x0.08' }),
  mEntry({ id: 'cn:space-bunny', name: 'Space-Bunny (CN)', description: '极快编码匿名大模型，支持多模态', realm: 'cn', contextWindow: 200000, maxTokens: 32000, supportsImages: true, supportsReasoning: true, supportedEfforts: ['low', 'medium', 'high', 'xhigh', 'max'], credits: 'x0.08' }),
  mEntry({ id: 'cn:deepseek-v4.1-flash', name: 'DeepSeek-V4.1-Flash (CN)', description: 'V4.1-Flash 最新版，1M 上下文，原生多模态', realm: 'cn', contextWindow: 1000000, maxTokens: 128000, supportsImages: true, supportsReasoning: true, supportedEfforts: ['low', 'high', 'max'], credits: 'x0.11' }),
  mEntry({ id: 'cn:glm-4.6v', name: 'GLM-4.6V (CN)', description: '视觉多模态模型', realm: 'cn', contextWindow: 128000, maxTokens: 16000, supportsImages: true, credits: 'x0.11' }),
  mEntry({ id: 'cn:mimo-v2.6-pro', name: 'MiMo-V2.6-Pro (CN)', description: 'Xiaomi 旗舰推理模型', realm: 'cn', contextWindow: 256000, maxTokens: 32000, supportsReasoning: true, credits: 'x0.13' }),
  mEntry({ id: 'cn:fast-model', name: '快速 Fast (CN)', description: '优先响应速度，适合简单问答', realm: 'cn', contextWindow: 200000, maxTokens: 32000, credits: 'x0.15' }),
  mEntry({ id: 'cn:deepseek-v4-flash', name: 'DeepSeek-V4-Flash (CN)', description: '1M 上下文旗舰快速版', realm: 'cn', contextWindow: 1000000, maxTokens: 64000, supportsImages: true, supportsReasoning: true, credits: 'x0.17' }),
  mEntry({ id: 'cn:minimax-m2.5', name: 'MiniMax-M2.5 (CN)', description: '经典均衡对话模型', realm: 'cn', contextWindow: 200000, maxTokens: 32000, credits: 'x0.18' }),
  mEntry({ id: 'cn:glm-4.7', name: 'GLM-4.7 (CN)', description: '智谱轻量代码模型', realm: 'cn', contextWindow: 128000, maxTokens: 16000, credits: 'x0.23' }),
  mEntry({ id: 'cn:hy4std', name: 'Hy4 Standard (CN)', description: '混元旗舰标准版', realm: 'cn', contextWindow: 960000, maxTokens: 64000, supportsImages: true, supportsReasoning: true, credits: 'x0.29' }),
  mEntry({ id: 'cn:step-5-preview', name: 'Step-5-Preview (CN)', description: '阶跃 StepFun 旗舰基模', realm: 'cn', contextWindow: 256000, maxTokens: 32000, supportsReasoning: true, supportedEfforts: ['low', 'medium', 'high'], credits: 'x0.33' }),
  mEntry({ id: 'cn:kimi-k2.5', name: 'Kimi-K2.5 (CN)', description: '长文本通用模型', realm: 'cn', contextWindow: 200000, maxTokens: 32000, credits: 'x0.45' }),
  mEntry({ id: 'cn:balanced-model', name: '均衡 Balanced (CN)', description: '兼顾速度与质量', realm: 'cn', contextWindow: 256000, maxTokens: 32000, credits: 'x0.50' }),
  mEntry({ id: 'cn:deepseek-v4-pro', name: 'DeepSeek-V4-Pro (CN)', description: 'DeepSeek 深度科研/代码旗舰', realm: 'cn', contextWindow: 1000000, maxTokens: 64000, supportsImages: true, supportsReasoning: true, credits: 'x0.51' }),
  mEntry({ id: 'cn:glm-5.3', name: 'GLM-5.3 (CN)', description: '复杂软件工程与长程 Agent 旗舰', realm: 'cn', contextWindow: 1000000, maxTokens: 32000, supportsImages: true, supportsReasoning: true, supportedEfforts: ['low', 'high', 'max'], credits: 'x0.69' }),
  mEntry({ id: 'cn:glm-5.2', name: 'GLM-5.2 (CN)', description: '1M 上下文，夜间折扣模型', realm: 'cn', contextWindow: 1000000, maxTokens: 32000, supportsImages: true, supportsReasoning: true, credits: 'x0.79', badge: '夜间折扣' }),
  mEntry({ id: 'cn:kimi-k3.1-pro', name: 'Kimi-K3.1-Pro (CN)', description: 'Kimi 3万亿参数全能升级版', realm: 'cn', contextWindow: 256000, maxTokens: 32000, supportsReasoning: true, supportedEfforts: ['low', 'high', 'max'], credits: 'x0.97' }),
  mEntry({ id: 'cn:kimi-k3-1', name: 'Kimi-K3-1 (CN)', description: '复杂长程与前端开发专长', realm: 'cn', contextWindow: 200000, maxTokens: 32000, supportsReasoning: true, credits: 'x1.62' }),
  // 视频大模型
  mEntry({ id: 'kling-video-v3', name: 'Kling 3.0 可灵视频直出', description: '文生视频 / 图生视频大模型', realm: 'video', contextWindow: 8192, maxTokens: 2048, supportsImages: true, rate: '视频', badge: '可灵3.0' }),
  mEntry({ id: 'minimax-video-h3', name: 'MiniMax-H3 海螺视频直出', description: '海螺高清视频生成模型', realm: 'video', contextWindow: 8192, maxTokens: 2048, supportsImages: true, rate: '视频', badge: '海螺H3' })
];

/** 默认模型别名表 (兼容各类客户端 Cursor/Dify/Claude/Cherry) */
export const DEFAULT_MODEL_ALIASES = {
  'deepseek-chat': 'cn:deepseek-v4.1-flash',
  'deepseek-reasoner': 'cn:deepseek-v4-pro',
  'gpt-4o': 'global:gpt-6.1-sol',
  'gpt-4o-mini': 'global:gpt-6-luna',
  'claude-3-5-sonnet': 'global:gpt-6.1-sol',
  'claude-3-7-sonnet': 'global:gpt-6-astra',
  'gemini-flash': 'global:gemini-3.8-flash',
  'kling-v3-std': 'kling-video-v3',
  'kling-v3-pro': 'kling-video-v3',
  'keling': 'kling-video-v3',
  'hailuo': 'minimax-video-h3'
};

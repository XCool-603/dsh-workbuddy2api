/**
 * hint.js - 网关错误附加排查建议 (error.gateway_hint) 与 Quota 重置时间解析
 * 严格遵循透传原则：不篡改上游 error.message 原文，仅并列注入可读排错提示。
 */

import { ErrKind } from '../constants.js';

export const NO_HEALTHY_ACCOUNT_HINT =
  'no healthy account available in pool; check /status or retry later';

function codeMarker(lower, code) {
  return (
    lower.includes(`"code":${code}`) ||
    lower.includes(`"code": ${code}`) ||
    lower.includes(`"code":"${code}"`) ||
    lower.includes(`"code": "${code}"`) ||
    lower.includes(`"code":'${code}'`)
  );
}

export function isModelParamInvalid(body = '') {
  const lower = String(body).toLowerCase();
  return (
    codeMarker(lower, '11133') ||
    lower.includes('model_param_invalid') ||
    lower.includes('invalid request parameters') ||
    lower.includes('request parameters do not meet the current model requirements')
  );
}

export function isInvalidImageData(body = '') {
  const lower = String(body).toLowerCase();
  return (
    codeMarker(lower, '11135') ||
    lower.includes('invalid_image_data') ||
    lower.includes('replace the image')
  );
}

export function isModelBlockedBody(body = '') {
  const lower = String(body).toLowerCase();
  return (
    codeMarker(lower, '11102') ||
    lower.includes('model_not_found') ||
    lower.includes('model not found') ||
    lower.includes('does not exist') ||
    lower.includes('unsupported model')
  );
}

export function requestHasImagePart(body = {}) {
  const msgs = Array.isArray(body?.messages) ? body.messages : [];
  for (const m of msgs) {
    if (!m || !Array.isArray(m.content)) continue;
    for (const part of m.content) {
      if (part?.type === 'image_url' || part?.type === 'image' || part?.type === 'input_image') {
        return true;
      }
    }
  }
  return false;
}

/**
 * 按错误分类、上游原文与请求上下文返回结构化 gateway_hint
 */
export function getGatewayHint(kind, msg = '', ctx = {}) {
  if (isModelParamInvalid(msg)) {
    if (ctx.hasImage && ctx.modelInCatalog && !ctx.modelSupportsImages) {
      return `model ${ctx.model || ''} does not support images; pick one with supports_images=true from /v1/models`;
    }
    return 'request parameters were rejected by the model provider; check message format and model capabilities';
  }

  if (isInvalidImageData(msg)) {
    return 'image data rejected by upstream; use a real/valid image, may need a new conversation';
  }

  switch (kind) {
    case ErrKind.PROMPT_TOO_LONG:
      return "request context exceeds the model's limit; reduce history/message size";
    case ErrKind.IMAGE_INVALID:
      return 'image request was rejected by upstream; check image_url format and image data';
    case ErrKind.WAF_BLOCK:
      return 'upstream WAF blocked the gateway; retry after the block window';
    case ErrKind.SOFT_RATE:
      return 'rate limited by upstream; retry after reset';
    case ErrKind.ACCOUNT_FAULT:
      return 'account-level fault at upstream (auth/quota state); the gateway will rotate or disable this account';
    case ErrKind.SESSION_DEAD:
      return 'account session expired at upstream; the account is disabled until re-login';
    case ErrKind.HARD_CREDIT:
      return 'account credits exhausted at upstream; waiting for daily check-in to restore';
    case ErrKind.MODEL_BLOCKED:
      return 'upstream has no such model on this backend; switch model or retry on another account';
    case ErrKind.CONTENT_BLOCKED:
      return 'request content was rejected by content policy; adjust the prompt and retry';
    default:
      return '';
  }
}

/**
 * 从 SSE error 帧中推断 gateway_hint，并对 error 帧注入 gateway_hint 后返回新帧文本
 */
export function injectFrameGatewayHint(parsed, ctx = {}, classifyFn = null) {
  if (!parsed || typeof parsed !== 'object' || !parsed.error) return null;
  if (parsed.error.gateway_hint) return null;

  const rawText = JSON.stringify(parsed);
  let kind = ErrKind.NONE;
  if (typeof classifyFn === 'function') {
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

/**
 * 解析上游 usage.quota 内的 reset_at 时间戳（支持 ISO 字符串 / 秒 / 毫秒）
 */
export function parseQuotaResetAt(quota) {
  if (!quota || typeof quota !== 'object') return 0;
  const raw = quota.reset_at ?? quota.resetAt ?? quota.next_reset_at ?? quota.nextResetAt;
  if (raw === undefined || raw === null || raw === '') return 0;

  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return raw < 1e11 ? Math.floor(raw * 1000) : Math.floor(raw);
  }
  const str = String(raw).trim();
  if (/^\d+$/.test(str)) {
    const n = Number(str);
    return n < 1e11 ? n * 1000 : n;
  }
  const parsed = Date.parse(str);
  return Number.isNaN(parsed) ? 0 : parsed;
}

/**
 * 计算下一次 Asia/Shanghai (UTC+8) 零点时间戳 (ms)
 */
export function getNextMidnightCSTMs(nowMs = Date.now()) {
  const cstOffset = 8 * 3600 * 1000;
  const d = new Date(nowMs + cstOffset);
  d.setUTCHours(24, 0, 0, 0);
  return d.getTime() - cstOffset;
}

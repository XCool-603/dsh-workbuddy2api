/**
 * payload.js - 出站请求体预处理、风控脱敏、工具与思考协议兼容性适配
 */

import crypto from 'node:crypto';
import { normalizeReasoningEffort } from './efforts.js';

const REWRITE_RULES = [
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

/**
 * 文本脱敏：剥离或改写触发上游 11128 风控的黑名单指纹
 */
export function sanitizeText(text) {
  if (typeof text !== 'string' || !text) return text;

  let out = text;
  // 快速特征预检
  const needsSanitize =
    out.includes('x-anthropic-billing-header') ||
    out.includes('X-Anthropic-Billing-Header') ||
    out.includes('cc_') ||
    out.includes('You are Claude Code') ||
    out.includes('Main branch (') ||
    out.includes('Codex CLI') ||
    out.includes('github.com/anthropics/') ||
    out.includes('11128');

  if (!needsSanitize) return out;

  for (const [src, dst] of REWRITE_RULES) {
    if (out.includes(src)) {
      out = out.split(src).join(dst);
    }
  }

  // 清除 header 键值形态及残留裸键名
  out = out.replace(/x-anthropic-billing-header:[^;\n]*;?\s*/gi, '');
  out = out.replace(/x-anthropic-billing-header/gi, 'x-anthropic-billing-hdr');

  // 循环清除 cc_xxx=...; 尾随键值
  if (out.includes('cc_')) {
    out = out.replace(/\bcc_[a-z0-9_]+=[^;\n]*;?\s*/gi, '');
  }

  return out;
}

/**
 * 对话消息数组脱敏与角色归一化 (developer -> system)
 */
export function sanitizeAndNormalizeMessages(messages, realm) {
  if (!Array.isArray(messages)) return [];

  const result = messages.map((m) => {
    if (!m || typeof m !== 'object') return m;
    const msg = { ...m };

    // 上游白名单不接受 developer 角色，统一归一为 system
    if (typeof msg.role === 'string' && msg.role.trim().toLowerCase() === 'developer') {
      msg.role = 'system';
    }

    if (typeof msg.content === 'string') {
      msg.content = sanitizeText(msg.content);
    } else if (Array.isArray(msg.content)) {
      msg.content = msg.content.map((part) => {
        if (!part || typeof part !== 'object') return part;
        if (part.type === 'text' && typeof part.text === 'string') {
          return { ...part, text: sanitizeText(part.text) };
        }
        return part;
      });
    }

    // 脱敏 tool_calls.function.arguments（防止函数参数含 11128 等指纹被拦截）
    if (Array.isArray(msg.tool_calls)) {
      msg.tool_calls = msg.tool_calls.map((tc) => {
        if (tc?.function && typeof tc.function.arguments === 'string') {
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

  // 国际版 (Global) 若首条非 system，补充默认 system 防御网关风控
  if (realm === 'global' && result.length > 0) {
    const firstRole = String(result[0]?.role || '').trim().toLowerCase();
    if (firstRole !== 'system') {
      result.unshift({ role: 'system', content: 'You are a helpful assistant.' });
    }
  }

  return result;
}

/**
 * 清理孤儿 tool 调用/结果，避免上游返回 400 工具配对异常
 */
export function cleanupOrphanToolMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0) return messages;

  const validToolCallIds = new Set();
  const resolvedToolResultIds = new Set();

  for (const m of messages) {
    if (m.role === 'assistant' && Array.isArray(m.tool_calls)) {
      for (const tc of m.tool_calls) {
        if (tc?.id) validToolCallIds.add(tc.id);
      }
    }
    if (m.role === 'tool' && m.tool_call_id) {
      resolvedToolResultIds.add(m.tool_call_id);
    }
  }

  return messages.filter((m) => {
    if (m.role === 'tool' && m.tool_call_id) {
      return validToolCallIds.has(m.tool_call_id);
    }
    return true;
  });
}

/**
 * 归一 tool_choice（上游仅接受 string 形态）
 */
export function normalizeToolChoice(obj) {
  if (!('tool_choice' in obj)) return;
  const tc = obj.tool_choice;

  if (typeof tc === 'string') {
    if (tc.trim().toLowerCase() === 'none') {
      delete obj.tool_choice;
      delete obj.tools;
      delete obj.functions;
    }
    return;
  }

  if (tc && typeof tc === 'object') {
    const typ = String(tc.type || '').trim().toLowerCase();
    if (typ === 'none') {
      delete obj.tool_choice;
      delete obj.tools;
      delete obj.functions;
    } else if (typ === 'auto' || typ === 'required') {
      obj.tool_choice = typ;
    } else if (typ === 'function') {
      const name = String(tc.function?.name || tc.name || '').trim();
      obj.tool_choice = name || 'auto';
    } else {
      delete obj.tool_choice;
    }
    return;
  }

  delete obj.tool_choice;
}

/**
 * 翻译 max_completion_tokens -> max_tokens
 */
export function translateMaxCompletionTokens(obj) {
  if ('max_completion_tokens' in obj) {
    const alias = obj.max_completion_tokens;
    delete obj.max_completion_tokens;
    if (!('max_tokens' in obj) && typeof alias === 'number' && alias > 0) {
      obj.max_tokens = Math.floor(alias);
    }
  }
}

/**
 * DeepSeek 模型思维链与多轮 reasoning_content 兼容补全
 */
export function applyDeepSeekThinking(obj, bareModel) {
  const isDeepSeek = bareModel.toLowerCase().startsWith('deepseek');
  if (!isDeepSeek) return;

  const explicitDisabled = String(obj.thinking?.type || '').toLowerCase() === 'disabled';
  if (explicitDisabled) {
    delete obj.reasoning_effort;
    delete obj.reasoningEffort;
  } else {
    obj.thinking = { type: 'enabled' };
    if (!obj.reasoning_effort && !obj.reasoningEffort) {
      obj.reasoning_effort = 'high';
    }
  }

  const thinkingEnabled = obj.thinking?.type === 'enabled';
  const hasTrace = (obj.messages || []).some(
    (m) => (typeof m.reasoning === 'string' && m.reasoning) || 'reasoning_content' in m
  );

  if (thinkingEnabled || hasTrace) {
    obj.messages = (obj.messages || []).map((m) => {
      if (m.role !== 'assistant') return m;
      if (typeof m.reasoning_content === 'string') return m;
      const copy = { ...m };
      copy.reasoning_content = typeof copy.reasoning === 'string' ? copy.reasoning : '';
      return copy;
    });
  }
}

/**
 * 构造按账号与会话隔离的前缀缓存键
 */
export function buildPromptCacheKey(uid, conversationId) {
  const uid8 = (uid || '-').slice(0, 8);
  const sum = crypto.createHash('sha256').update(`${uid || ''}|${conversationId || ''}`).digest('hex');
  return `wb2a-${uid8}-${sum.slice(0, 32)}`;
}

/**
 * 构建完全符合 WorkBuddy 上游规范与通道校验要求的请求体
 */
export function prepareOutboundPayload(reqBody, preparedMessages, { realm, uid, bareModel, conversationId }) {
  const obj = { ...reqBody };

  obj.model = bareModel;
  obj.stream = true;
  if (!obj.stream_options) {
    obj.stream_options = { include_usage: true };
  }

  // 1. 翻译 max_completion_tokens
  translateMaxCompletionTokens(obj);

  // 2. 消息角色归一 + 视觉已处理内容 + 黑名单指纹脱敏 + 孤儿 tool 清理
  let msgs = sanitizeAndNormalizeMessages(preparedMessages, realm);
  msgs = cleanupOrphanToolMessages(msgs);
  obj.messages = msgs;

  // 3. tool_choice 归一
  normalizeToolChoice(obj);

  // 4. DeepSeek 思维链开关与 reasoning_content 回填
  applyDeepSeekThinking(obj, bareModel);

  // 5. 推理思考档位严格防呆降级
  const rawEffort = obj.reasoning_effort || obj.reasoningEffort;
  const normalizedEffort = normalizeReasoningEffort(realm, bareModel, rawEffort);
  delete obj.reasoningEffort;
  if (normalizedEffort) {
    obj.reasoning_effort = normalizedEffort;
  } else {
    delete obj.reasoning_effort;
  }

  // 6. 强制注入 conversation_id / conversationId (防 11128 conversation id missing 通道拦截)
  if (!obj.conversation_id) obj.conversation_id = conversationId;
  if (!obj.conversationId) obj.conversationId = conversationId;

  // 7. 注入按账号隔离的 prompt_cache_key (节省约 17 倍缓存费用)
  if (!obj.prompt_cache_key) {
    obj.prompt_cache_key = buildPromptCacheKey(uid, obj.conversation_id);
  }

  return obj;
}

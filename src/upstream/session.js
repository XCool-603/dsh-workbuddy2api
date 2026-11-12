/**
 * session.js - 会话级 Sticky 兜底键与轮级 (Turn-level) X-Conversation-Request-ID 聚合派生
 */

import crypto from 'node:crypto';

const PROCESS_SALT = crypto.randomBytes(16).toString('hex');

export function contentSignature(content) {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';
  let out = '';
  for (const part of content) {
    if (!part) continue;
    if (typeof part === 'string') {
      out += part;
      continue;
    }
    const typ = String(part.type || '').trim();
    if (!typ || typ === 'text') {
      out += part.text || '';
    } else {
      const hash = crypto.createHash('sha256').update(JSON.stringify(part)).digest('hex').slice(0, 8);
      out += `[${typ}:${hash}]`;
    }
  }
  return out;
}

export function extractSessionKey(reqHeaders = {}, body = {}) {
  const meta = body?.metadata && typeof body.metadata === 'object' ? body.metadata : {};
  return (
    meta.conversation_id ||
    meta.conversationId ||
    body?.conversation_id ||
    body?.conversationId ||
    reqHeaders['x-conversation-id'] ||
    reqHeaders['x-session-id'] ||
    body?.prompt_cache_key ||
    ''
  );
}

export function resolveConversationId(reqHeaders = {}, body = {}) {
  const meta = body?.metadata && typeof body.metadata === 'object' ? body.metadata : {};
  return (
    meta.conversation_id ||
    meta.conversationId ||
    body?.conversation_id ||
    body?.conversationId ||
    reqHeaders['x-conversation-id'] ||
    ''
  );
}

/**
 * 为未带 conversation_id 的客户端 (Codex / OpenAI SDK / DSH) 基于首条 user 消息派生稳定会话级 Sticky 键
 * 若请求显式带有 user_id (避免把不同并行对话全绑定同一账号)，遵循 anti-monopoly 约定回落空串
 */
export function stickyFallbackKey(body = {}) {
  const meta = body?.metadata && typeof body.metadata === 'object' ? body.metadata : {};
  if (meta.user_id || body?.user_id) return '';

  const msgs = Array.isArray(body?.messages) ? body.messages : [];
  for (const m of msgs) {
    if (m?.role !== 'user') continue;
    const text = contentSignature(m.content).trim();
    if (!text) return '';
    const sum = crypto.createHash('sha256').update(text).digest('hex').slice(0, 32);
    return `fb:${sum}`;
  }
  return '';
}

/**
 * 基于末条 user 消息序号与内容签名派生轮级聚合键，确保同轮多步 tool_call 与换号重试共享同一个 X-Conversation-Request-ID
 */
export function turnKey(body = {}) {
  const msgs = Array.isArray(body?.messages) ? body.messages : [];
  for (let i = msgs.length - 1; i >= 0; i--) {
    if (msgs[i]?.role !== 'user') continue;
    const sig = contentSignature(msgs[i].content);
    if (!sig) return '';
    return `u${i}:${sig}`;
  }
  return '';
}

export function deriveTurnRequestId(sessionKey = '', tKey = '') {
  if (!tKey && !sessionKey) {
    return crypto.randomBytes(16).toString('hex');
  }
  const combined = tKey && sessionKey ? `${sessionKey}:${tKey}` : (tKey || sessionKey);
  return crypto.createHash('sha256').update(`${PROCESS_SALT}|${combined}`).digest('hex').slice(0, 32);
}

export function uuidForKey(key = '') {
  if (!key) return crypto.randomUUID();
  const h = crypto.createHash('sha256').update(`wb2a-uuid:${key}`).digest();
  h[6] = (h[6] & 0x0f) | 0x40;
  h[8] = (h[8] & 0x3f) | 0x80;
  const hex = h.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

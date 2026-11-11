/**
 * sse.js - 高可用行缓冲 SSE 协议引擎与无污染保活心跳
 */

import { SSE_PING_INTERVAL_MS } from '../constants.js';

/**
 * 为 HTTP 响应写入标准 SSE 响应头
 */
export function writeSSEHeaders(res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
    'Access-Control-Allow-Origin': '*'
  });
  if (res.flush) res.flush();
}

/**
 * 从任意响应体或 SSE 增量帧中提取标准 Token 用量统计
 */
export function extractUsageFromPayload(parsed) {
  const u = parsed?.usage;
  if (!u || typeof u !== 'object') return null;

  const promptTokens = Number(u.prompt_tokens ?? u.input_tokens ?? 0) || 0;
  const completionTokens = Number(u.completion_tokens ?? u.output_tokens ?? 0) || 0;
  const totalTokens = Number(u.total_tokens ?? (promptTokens + completionTokens)) || 0;
  const cachedTokens = Number(
    u.prompt_tokens_details?.cached_tokens ??
    u.cache_read_input_tokens ??
    u.cached_tokens ??
    0
  ) || 0;

  return {
    promptTokens,
    completionTokens,
    totalTokens,
    cachedTokens,
    cacheHit: cachedTokens > 0
  };
}

/**
 * 启动防超时 SSE 心跳保活定时器（支持通过 isSafeToPing 回调避免截断半包 JSON）
 */
export function startSSEHeartbeat(res, intervalMs = SSE_PING_INTERVAL_MS, isSafeToPing = null) {
  if (!res) return () => {};
  const timer = setInterval(() => {
    try {
      if (res.writableEnded || res.destroyed) {
        clearInterval(timer);
        return;
      }
      if (typeof isSafeToPing === 'function' && !isSafeToPing()) {
        return;
      }
      res.write(': ping\n\n');
      if (res.flush) res.flush();
    } catch (_) {
      clearInterval(timer);
    }
  }, intervalMs);
  if (timer.unref) timer.unref();

  return () => clearInterval(timer);
}

/**
 * 创建严格按 `\n\n` 完整事件边界切片的 SSE 泵：
 * - 确保 `: ping\n\n` 保活心跳绝不插入半截 `data: {...` 帧内部
 * - 自动从流式帧提取真实 prompt_tokens / completion_tokens / cached_tokens
 * - 支持透传模式 (forwardRaw: true) 或协议转换模式 (forwardRaw: false + onEvent)
 */
export function createSSELinePump(res, onEventOrOptions = {}) {
  const opts = typeof onEventOrOptions === 'function'
    ? { onEvent: onEventOrOptions }
    : (onEventOrOptions || {});

  const {
    onEvent = null,
    forwardRaw = true,
    heartbeatMs = SSE_PING_INTERVAL_MS
  } = opts;

  let buffer = '';
  let trailingCR = false;
  let lastActivityAt = Date.now();
  let stopped = false;
  let usagePromptTokens = 0;
  let usageCompletionTokens = 0;
  let cacheHit = false;
  let sawContentChars = 0;
  let sawDone = false;

  const stopHeartbeat = res && heartbeatMs > 0
    ? startSSEHeartbeat(res, heartbeatMs, () => {
        if (stopped) return false;
        // 仅当缓冲区为空（处于完整 SSE 事件之间，且距上次写盘足够空闲）时发送保活注释帧
        return buffer.length === 0 && (Date.now() - lastActivityAt >= Math.max(500, heartbeatMs - 200));
      })
    : () => {};

  const emitFrame = (rawFrame) => {
    const trimmed = rawFrame.trim();
    if (!trimmed) return;

    const lines = rawFrame.split('\n');
    const dataLines = [];
    for (const line of lines) {
      if (line.startsWith('data:')) {
        dataLines.push(line.slice(5).trimStart());
      }
    }

    const dataStr = dataLines.join('\n').trim();
    if (dataStr === '[DONE]') {
      sawDone = true;
      if (typeof onEvent === 'function') {
        onEvent(null, '[DONE]', rawFrame);
      }
    } else if (dataStr) {
      let parsed = null;
      try {
        parsed = JSON.parse(dataStr);
      } catch (_) {}

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
          if (typeof delta.content === 'string') sawContentChars += delta.content.length;
          if (typeof delta.reasoning_content === 'string') sawContentChars += delta.reasoning_content.length;
        }
      }

      if (typeof onEvent === 'function') {
        onEvent(parsed, dataStr, rawFrame);
      }
    } else if (typeof onEvent === 'function') {
      // 纯注释或 event: 行
      onEvent(null, '', rawFrame);
    }

    if (forwardRaw && res && !res.writableEnded) {
      res.write(`${rawFrame}\n\n`);
      if (res.flush) res.flush();
      lastActivityAt = Date.now();
    }
  };

  return {
    push(chunkText) {
      if (!chunkText || stopped) return;
      let normalized = (trailingCR ? '\r' : '') + String(chunkText);
      trailingCR = normalized.endsWith('\r');
      if (trailingCR) {
        normalized = normalized.slice(0, -1);
      }
      normalized = normalized.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

      buffer += normalized;
      lastActivityAt = Date.now();

      let sepIdx;
      while ((sepIdx = buffer.indexOf('\n\n')) !== -1) {
        const frame = buffer.slice(0, sepIdx);
        buffer = buffer.slice(sepIdx + 2);
        emitFrame(frame);
      }
    },

    finish() {
      if (stopped) return;
      if (trailingCR) {
        buffer += '\n';
        trailingCR = false;
      }
      if (buffer.trim().length > 0) {
        emitFrame(buffer);
      }
      buffer = '';
      if (forwardRaw && res && !res.writableEnded && !sawDone) {
        res.write('data: [DONE]\n\n');
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
      const completionTokens = usageCompletionTokens > 0
        ? usageCompletionTokens
        : (sawContentChars > 0 ? Math.max(1, Math.ceil(sawContentChars / 3)) : 0);
      return {
        promptTokens: usagePromptTokens,
        completionTokens,
        cacheHit
      };
    }
  };
}

/**
 * 将流式消息包装为标准 OpenAI 增量格式帧
 */
export function formatOpenAIChunk(id, model, deltaContent, finishReason = null) {
  const payload = {
    id: id || `chatcmpl-${Date.now()}`,
    object: 'chat.completion.chunk',
    created: Math.floor(Date.now() / 1000),
    model: model || 'workbuddy',
    choices: [
      {
        index: 0,
        delta: deltaContent ? { content: deltaContent } : {},
        finish_reason: finishReason
      }
    ]
  };
  return `data: ${JSON.stringify(payload)}\n\n`;
}

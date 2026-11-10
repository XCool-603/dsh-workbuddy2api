/**
 * sse.js - 高可用流式 SSE 协议引擎与防超时保活心跳
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
 * 启动防超时 SSE 心跳保活定时器（发送 : ping 空帧）
 */
export function startSSEHeartbeat(res, intervalMs = SSE_PING_INTERVAL_MS) {
  const timer = setInterval(() => {
    try {
      if (!res.writableEnded) {
        res.write(': ping\n\n');
        if (res.flush) res.flush();
      }
    } catch (_) {
      clearInterval(timer);
    }
  }, intervalMs);

  return () => clearInterval(timer);
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

/**
 * messages.js - Anthropic Messages API (/v1/messages) 与 OpenAI Chat Completions 双向无损转换器
 */

import crypto from 'node:crypto';
import { writeSSEHeaders } from './sse.js';

function genId(prefix = 'msg') {
  return `${prefix}_${crypto.randomBytes(10).toString('hex')}`;
}

function safeJsonParse(str, fallback = {}) {
  if (typeof str !== 'string' || !str.trim()) return fallback;
  try {
    return JSON.parse(str);
  } catch (_) {
    return fallback;
  }
}

function stringifyAnthropicContent(content) {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return content ? JSON.stringify(content) : '';
  return content
    .map((b) => {
      if (typeof b === 'string') return b;
      if (b?.type === 'text') return b.text || '';
      if (b?.type === 'image') return '[image]';
      return JSON.stringify(b);
    })
    .filter(Boolean)
    .join('\n');
}

function mapStopReason(finishReason) {
  switch (finishReason) {
    case 'tool_calls':
      return 'tool_use';
    case 'length':
      return 'max_tokens';
    case 'content_filter':
      return 'refusal';
    default:
      return 'end_turn';
  }
}

/**
 * 将 Anthropic /v1/messages 请求转换为内部统一 OpenAI Chat Completions 格式
 */
export function anthropicToOpenAI(body = {}) {
  const messages = [];

  if (typeof body.system === 'string' && body.system) {
    messages.push({ role: 'system', content: body.system });
  } else if (Array.isArray(body.system)) {
    const sysText = body.system
      .map((b) => (typeof b === 'string' ? b : b?.text || ''))
      .filter(Boolean)
      .join('\n');
    if (sysText) {
      messages.push({ role: 'system', content: sysText });
    }
  }

  for (const msg of body.messages || []) {
    if (!msg) continue;

    if (msg.role === 'user') {
      if (typeof msg.content === 'string') {
        messages.push({ role: 'user', content: msg.content });
        continue;
      }
      if (!Array.isArray(msg.content)) {
        messages.push({ role: 'user', content: String(msg.content || '') });
        continue;
      }

      const toolResults = [];
      const userParts = [];

      for (const block of msg.content) {
        if (!block) continue;
        if (block.type === 'tool_result') {
          toolResults.push({
            role: 'tool',
            tool_call_id: block.tool_use_id || '',
            content: stringifyAnthropicContent(block.content)
          });
        } else if (block.type === 'text') {
          userParts.push({ type: 'text', text: block.text || '' });
        } else if (block.type === 'image' && block.source) {
          if (block.source.type === 'base64') {
            const mime = block.source.media_type || 'image/png';
            userParts.push({
              type: 'image_url',
              image_url: { url: `data:${mime};base64,${block.source.data || ''}` }
            });
          } else if (block.source.type === 'url' && block.source.url) {
            userParts.push({
              type: 'image_url',
              image_url: { url: block.source.url }
            });
          }
        }
      }

      for (const tr of toolResults) {
        messages.push(tr);
      }

      if (userParts.length > 0) {
        if (userParts.every((p) => p.type === 'text')) {
          messages.push({
            role: 'user',
            content: userParts.map((p) => p.text).join('\n')
          });
        } else {
          messages.push({ role: 'user', content: userParts });
        }
      }
      continue;
    }

    if (msg.role === 'assistant') {
      if (typeof msg.content === 'string') {
        messages.push({ role: 'assistant', content: msg.content });
        continue;
      }
      if (!Array.isArray(msg.content)) {
        messages.push({ role: 'assistant', content: String(msg.content || '') });
        continue;
      }

      let textAcc = '';
      let thinkingAcc = '';
      const toolCalls = [];

      for (const block of msg.content) {
        if (!block) continue;
        if (block.type === 'thinking') {
          thinkingAcc += block.thinking || '';
        } else if (block.type === 'text') {
          textAcc += block.text || '';
        } else if (block.type === 'tool_use') {
          toolCalls.push({
            id: block.id || genId('call'),
            type: 'function',
            function: {
              name: block.name || '',
              arguments: typeof block.input === 'string'
                ? block.input
                : JSON.stringify(block.input || {})
            }
          });
        }
      }

      const outMsg = {
        role: 'assistant',
        content: textAcc || (toolCalls.length > 0 ? null : '')
      };
      if (thinkingAcc) outMsg.reasoning_content = thinkingAcc;
      if (toolCalls.length > 0) outMsg.tool_calls = toolCalls;
      messages.push(outMsg);
      continue;
    }

    messages.push({
      role: msg.role || 'user',
      content: stringifyAnthropicContent(msg.content)
    });
  }

  const openaiPayload = {
    model: body.model || '',
    messages,
    max_tokens: body.max_tokens || 8192,
    stream: !!body.stream
  };

  if (body.metadata && typeof body.metadata === 'object') {
    openaiPayload.metadata = body.metadata;
  }

  if (typeof body.temperature === 'number') openaiPayload.temperature = body.temperature;
  if (typeof body.top_p === 'number') openaiPayload.top_p = body.top_p;
  if (Array.isArray(body.stop_sequences) && body.stop_sequences.length > 0) {
    openaiPayload.stop = body.stop_sequences;
  }

  if (Array.isArray(body.tools) && body.tools.length > 0) {
    openaiPayload.tools = body.tools.map((t) => ({
      type: 'function',
      function: {
        name: t.name,
        description: t.description || '',
        parameters: t.input_schema || { type: 'object', properties: {} }
      }
    }));
  }

  if (body.tool_choice) {
    const tc = body.tool_choice;
    if (tc.type === 'auto') openaiPayload.tool_choice = 'auto';
    else if (tc.type === 'any') openaiPayload.tool_choice = 'required';
    else if (tc.type === 'none') openaiPayload.tool_choice = 'none';
    else if (tc.type === 'tool' && tc.name) {
      openaiPayload.tool_choice = { type: 'function', function: { name: tc.name } };
    }
  }

  if (body.thinking?.type === 'enabled') {
    const budget = Number(body.thinking.budget_tokens || 0);
    if (budget > 24576) openaiPayload.reasoning_effort = 'max';
    else if (budget > 8192) openaiPayload.reasoning_effort = 'high';
    else if (budget > 2048) openaiPayload.reasoning_effort = 'medium';
    else openaiPayload.reasoning_effort = 'high';
  }

  return openaiPayload;
}

/**
 * 将聚合后的 OpenAI 完整响应转换为 Anthropic Message 对象
 */
export function openAIToAnthropicResponse(completion, requestedModel) {
  const choice = completion?.choices?.[0] || {};
  const msg = choice.message || {};
  const content = [];

  if (msg.reasoning_content) {
    content.push({ type: 'thinking', thinking: msg.reasoning_content });
  }
  if (msg.content) {
    content.push({ type: 'text', text: msg.content });
  }
  if (Array.isArray(msg.tool_calls)) {
    for (const tc of msg.tool_calls) {
      content.push({
        type: 'tool_use',
        id: tc.id || genId('toolu'),
        name: tc.function?.name || '',
        input: safeJsonParse(tc.function?.arguments, {})
      });
    }
  }
  if (content.length === 0) {
    content.push({ type: 'text', text: '' });
  }

  const u = completion?.usage || {};
  const cached = u.prompt_tokens_details?.cached_tokens || 0;

  return {
    id: completion?.id?.startsWith('msg_') ? completion.id : genId('msg'),
    type: 'message',
    role: 'assistant',
    model: requestedModel || completion?.model || 'workbuddy',
    content,
    stop_reason: mapStopReason(choice.finish_reason),
    stop_sequence: null,
    usage: {
      input_tokens: u.prompt_tokens || 0,
      output_tokens: u.completion_tokens || 0,
      ...(cached > 0 ? { cache_read_input_tokens: cached } : {})
    }
  };
}

function sendAnthropicEvent(res, eventName, data) {
  if (!res || res.writableEnded) return;
  res.write(`event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`);
  if (res.flush) res.flush();
}

/**
 * 创建 Anthropic SSE 流式事件发射器（接收上游 OpenAI 增量帧并输出 Anthropic 原生 SSE）
 */
export function createAnthropicStreamEmitter(res, requestedModel) {
  writeSSEHeaders(res);
  const messageId = genId('msg');

  let started = false;
  let nextBlockIdx = 0;
  let activeSimpleBlock = null; // { index, type: 'thinking' | 'text' }
  const openToolBlocks = new Map(); // openai tool index -> { blockIndex }
  let finishReason = null;
  let finalUsage = { promptTokens: 0, completionTokens: 0, cachedTokens: 0 };
  let ended = false;

  const ensureMessageStart = () => {
    if (started) return;
    started = true;
    sendAnthropicEvent(res, 'message_start', {
      type: 'message_start',
      message: {
        id: messageId,
        type: 'message',
        role: 'assistant',
        model: requestedModel || 'workbuddy',
        content: [],
        stop_reason: null,
        stop_sequence: null,
        usage: { input_tokens: 0, output_tokens: 0 }
      }
    });
  };

  const closeActiveSimpleBlock = () => {
    if (!activeSimpleBlock) return;
    sendAnthropicEvent(res, 'content_block_stop', {
      type: 'content_block_stop',
      index: activeSimpleBlock.index
    });
    activeSimpleBlock = null;
  };

  const closeAllToolBlocks = () => {
    for (const tb of openToolBlocks.values()) {
      if (!tb.closed) {
        sendAnthropicEvent(res, 'content_block_stop', {
          type: 'content_block_stop',
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
        sendAnthropicEvent(res, 'error', {
          type: 'error',
          error: {
            type: parsed.error.type || 'api_error',
            message: parsed.error.message || 'Upstream streaming error',
            ...(parsed.error.gateway_hint ? { gateway_hint: parsed.error.gateway_hint } : {})
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

      // 1. 思考内容块
      if (typeof delta.reasoning_content === 'string' && delta.reasoning_content.length > 0) {
        if (activeSimpleBlock && activeSimpleBlock.type !== 'thinking') {
          closeActiveSimpleBlock();
        }
        if (!activeSimpleBlock) {
          const idx = nextBlockIdx++;
          activeSimpleBlock = { index: idx, type: 'thinking' };
          sendAnthropicEvent(res, 'content_block_start', {
            type: 'content_block_start',
            index: idx,
            content_block: { type: 'thinking', thinking: '' }
          });
        }
        sendAnthropicEvent(res, 'content_block_delta', {
          type: 'content_block_delta',
          index: activeSimpleBlock.index,
          delta: { type: 'thinking_delta', thinking: delta.reasoning_content }
        });
      }

      // 2. 文本输出块
      if (typeof delta.content === 'string' && delta.content.length > 0) {
        if (activeSimpleBlock && activeSimpleBlock.type !== 'text') {
          closeActiveSimpleBlock();
        }
        if (!activeSimpleBlock) {
          const idx = nextBlockIdx++;
          activeSimpleBlock = { index: idx, type: 'text' };
          sendAnthropicEvent(res, 'content_block_start', {
            type: 'content_block_start',
            index: idx,
            content_block: { type: 'text', text: '' }
          });
        }
        sendAnthropicEvent(res, 'content_block_delta', {
          type: 'content_block_delta',
          index: activeSimpleBlock.index,
          delta: { type: 'text_delta', text: delta.content }
        });
      }

      // 3. 工具调用块
      if (Array.isArray(delta.tool_calls)) {
        closeActiveSimpleBlock();
        for (const tc of delta.tool_calls) {
          const tcIdx = tc.index ?? 0;
          let entry = openToolBlocks.get(tcIdx);
          if (!entry) {
            const blockIndex = nextBlockIdx++;
            entry = {
              blockIndex,
              id: tc.id || genId('toolu'),
              name: tc.function?.name || '',
              closed: false
            };
            openToolBlocks.set(tcIdx, entry);
            sendAnthropicEvent(res, 'content_block_start', {
              type: 'content_block_start',
              index: blockIndex,
              content_block: {
                type: 'tool_use',
                id: entry.id,
                name: entry.name,
                input: {}
              }
            });
          }
          const argPart = tc.function?.arguments;
          if (typeof argPart === 'string' && argPart.length > 0) {
            sendAnthropicEvent(res, 'content_block_delta', {
              type: 'content_block_delta',
              index: entry.blockIndex,
              delta: { type: 'input_json_delta', partial_json: argPart }
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

      const stopReason = mapStopReason(finishReason || (openToolBlocks.size > 0 ? 'tool_calls' : 'stop'));
      const outTokens = finalUsage.completionTokens || fallbackUsage?.completionTokens || 0;
      const inTokens = finalUsage.promptTokens || fallbackUsage?.promptTokens || 0;

      sendAnthropicEvent(res, 'message_delta', {
        type: 'message_delta',
        delta: {
          stop_reason: stopReason,
          stop_sequence: null
        },
        usage: {
          output_tokens: outTokens,
          input_tokens: inTokens
        }
      });

      sendAnthropicEvent(res, 'message_stop', { type: 'message_stop' });
      if (!res.writableEnded) res.end();
    }
  };
}

/**
 * 估算 Anthropic Messages 请求的输入 Token 数（用于 /v1/messages/count_tokens）
 */
export function estimateAnthropicInputTokens(body = {}) {
  let cjkChars = 0;
  let otherChars = 0;
  let imageTokens = 0;
  let messageOverhead = 0;

  const countText = (str) => {
    if (!str || typeof str !== 'string') return;
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      if (code >= 0x4e00 && code <= 0x9fff) cjkChars++;
      else otherChars++;
    }
  };

  const countContent = (content) => {
    if (typeof content === 'string') {
      countText(content);
      return;
    }
    if (!Array.isArray(content)) return;
    for (const block of content) {
      if (!block) continue;
      if (typeof block === 'string') {
        countText(block);
      } else if (block.type === 'text' || block.type === 'thinking') {
        countText(block.text || block.thinking || '');
      } else if (block.type === 'tool_use') {
        countText(block.name || '');
        countText(typeof block.input === 'string' ? block.input : JSON.stringify(block.input || {}));
      } else if (block.type === 'tool_result') {
        countContent(block.content);
      } else if (block.type === 'image') {
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

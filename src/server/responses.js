/**
 * responses.js - OpenAI Responses API (/v1/responses) 双向协议适配器
 */

import crypto from 'node:crypto';
import { writeSSEHeaders } from './sse.js';

function genId(prefix = 'resp') {
  return `${prefix}_${crypto.randomBytes(10).toString('hex')}`;
}

function flattenResponseContent(content) {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return content ? String(content) : '';
  const parts = [];
  for (const part of content) {
    if (!part) continue;
    if (typeof part === 'string') {
      parts.push({ type: 'text', text: part });
    } else if (part.type === 'input_text' || part.type === 'output_text' || part.type === 'text') {
      parts.push({ type: 'text', text: part.text || '' });
    } else if (part.type === 'input_image' || part.type === 'image_url') {
      const url = typeof part.image_url === 'string' ? part.image_url : part.image_url?.url;
      if (url) parts.push({ type: 'image_url', image_url: { url } });
    }
  }
  if (parts.length > 0 && parts.every((p) => p.type === 'text')) {
    return parts.map((p) => p.text).join('\n');
  }
  return parts;
}

/**
 * 将 OpenAI /v1/responses 请求转换为内部统一 OpenAI Chat Completions 负载
 */
export function responsesToChatPayload(body = {}) {
  const messages = [];

  if (typeof body.instructions === 'string' && body.instructions.trim()) {
    messages.push({ role: 'system', content: body.instructions });
  }

  if (typeof body.input === 'string') {
    messages.push({ role: 'user', content: body.input });
  } else if (Array.isArray(body.input)) {
    for (const item of body.input) {
      if (!item) continue;
      if (item.type === 'function_call') {
        messages.push({
          role: 'assistant',
          content: null,
          tool_calls: [
            {
              id: item.call_id || item.id || genId('call'),
              type: 'function',
              function: {
                name: item.name || '',
                arguments: typeof item.arguments === 'string'
                  ? item.arguments
                  : JSON.stringify(item.arguments || {})
              }
            }
          ]
        });
      } else if (item.type === 'function_call_output') {
        messages.push({
          role: 'tool',
          tool_call_id: item.call_id || '',
          content: typeof item.output === 'string' ? item.output : JSON.stringify(item.output || '')
        });
      } else {
        const role = item.role || 'user';
        messages.push({
          role,
          content: flattenResponseContent(item.content)
        });
      }
    }
  }

  const chatPayload = {
    model: body.model || '',
    messages,
    stream: !!body.stream
  };

  if (body.max_output_tokens) chatPayload.max_tokens = body.max_output_tokens;
  if (typeof body.temperature === 'number') chatPayload.temperature = body.temperature;
  if (typeof body.top_p === 'number') chatPayload.top_p = body.top_p;
  if (body.reasoning?.effort) chatPayload.reasoning_effort = body.reasoning.effort;
  if (body.prompt_cache_key) chatPayload.prompt_cache_key = body.prompt_cache_key;

  if (Array.isArray(body.tools) && body.tools.length > 0) {
    chatPayload.tools = body.tools.map((t) => {
      if (t.function) return t;
      return {
        type: 'function',
        function: {
          name: t.name || '',
          description: t.description || '',
          parameters: t.parameters || { type: 'object', properties: {} }
        }
      };
    });
  }
  if (body.tool_choice) chatPayload.tool_choice = body.tool_choice;

  return chatPayload;
}

/**
 * 将聚合后的 ChatCompletion 对象转换为 OpenAI Responses 非流式对象
 */
export function chatCompletionToResponseObject(completion, requestedModel) {
  const choice = completion?.choices?.[0] || {};
  const msg = choice.message || {};
  const u = completion?.usage || {};
  const output = [];

  if (msg.reasoning_content) {
    output.push({
      id: genId('rs'),
      type: 'reasoning',
      summary: [{ type: 'summary_text', text: msg.reasoning_content }]
    });
  }

  const text = msg.content || '';
  if (text || (!Array.isArray(msg.tool_calls) || msg.tool_calls.length === 0)) {
    output.push({
      id: genId('msg'),
      type: 'message',
      status: 'completed',
      role: 'assistant',
      content: [{ type: 'output_text', text, annotations: [] }]
    });
  }

  if (Array.isArray(msg.tool_calls)) {
    for (const tc of msg.tool_calls) {
      output.push({
        id: genId('fc'),
        type: 'function_call',
        status: 'completed',
        call_id: tc.id || genId('call'),
        name: tc.function?.name || '',
        arguments: tc.function?.arguments || '{}'
      });
    }
  }

  return {
    id: genId('resp'),
    object: 'response',
    created_at: Math.floor(Date.now() / 1000),
    status: 'completed',
    model: requestedModel || completion?.model || 'workbuddy',
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
  res.write(`event: ${type}\ndata: ${JSON.stringify({ type, ...data })}\n\n`);
  if (res.flush) res.flush();
}

/**
 * 创建 OpenAI Responses SSE 流式发射器
 */
export function createResponsesStreamEmitter(res, requestedModel) {
  writeSSEHeaders(res);
  const respId = genId('resp');
  const msgItemId = genId('msg');
  const createdAt = Math.floor(Date.now() / 1000);

  let msgOpened = false;
  let textAcc = '';
  let reasoningAcc = '';
  const toolMap = new Map();
  let finalUsage = { promptTokens: 0, completionTokens: 0 };
  let ended = false;

  sendResponsesEvent(res, 'response.created', {
    response: {
      id: respId,
      object: 'response',
      created_at: createdAt,
      status: 'in_progress',
      model: requestedModel || 'workbuddy',
      output: []
    }
  });

  const ensureMsgOpened = () => {
    if (msgOpened) return;
    msgOpened = true;
    sendResponsesEvent(res, 'response.output_item.added', {
      output_index: 0,
      item: {
        id: msgItemId,
        type: 'message',
        status: 'in_progress',
        role: 'assistant',
        content: []
      }
    });
    sendResponsesEvent(res, 'response.content_part.added', {
      item_id: msgItemId,
      output_index: 0,
      content_index: 0,
      part: { type: 'output_text', text: '', annotations: [] }
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

      if (typeof delta.reasoning_content === 'string' && delta.reasoning_content.length > 0) {
        reasoningAcc += delta.reasoning_content;
        sendResponsesEvent(res, 'response.reasoning_summary_text.delta', {
          delta: delta.reasoning_content
        });
      }

      if (typeof delta.content === 'string' && delta.content.length > 0) {
        ensureMsgOpened();
        textAcc += delta.content;
        sendResponsesEvent(res, 'response.output_text.delta', {
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
              itemId: genId('fc'),
              callId: tc.id || genId('call'),
              name: tc.function?.name || '',
              arguments: '',
              outputIndex: idx + (msgOpened ? 1 : 0)
            };
            toolMap.set(idx, entry);
            sendResponsesEvent(res, 'response.output_item.added', {
              output_index: entry.outputIndex,
              item: {
                id: entry.itemId,
                type: 'function_call',
                status: 'in_progress',
                call_id: entry.callId,
                name: entry.name,
                arguments: ''
              }
            });
          }
          const argPart = tc.function?.arguments;
          if (typeof argPart === 'string' && argPart.length > 0) {
            entry.arguments += argPart;
            sendResponsesEvent(res, 'response.function_call_arguments.delta', {
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
          id: genId('rs'),
          type: 'reasoning',
          summary: [{ type: 'summary_text', text: reasoningAcc }]
        });
      }

      if (msgOpened) {
        sendResponsesEvent(res, 'response.output_text.done', {
          item_id: msgItemId,
          output_index: 0,
          content_index: 0,
          text: textAcc
        });
        const msgItem = {
          id: msgItemId,
          type: 'message',
          status: 'completed',
          role: 'assistant',
          content: [{ type: 'output_text', text: textAcc, annotations: [] }]
        };
        sendResponsesEvent(res, 'response.output_item.done', {
          output_index: 0,
          item: msgItem
        });
        output.push(msgItem);
      }

      for (const entry of toolMap.values()) {
        const fcItem = {
          id: entry.itemId,
          type: 'function_call',
          status: 'completed',
          call_id: entry.callId,
          name: entry.name,
          arguments: entry.arguments || '{}'
        };
        sendResponsesEvent(res, 'response.function_call_arguments.done', {
          item_id: entry.itemId,
          output_index: entry.outputIndex,
          arguments: fcItem.arguments
        });
        sendResponsesEvent(res, 'response.output_item.done', {
          output_index: entry.outputIndex,
          item: fcItem
        });
        output.push(fcItem);
      }

      const inTok = finalUsage.promptTokens || fallbackUsage?.promptTokens || 0;
      const outTok = finalUsage.completionTokens || fallbackUsage?.completionTokens || 0;

      sendResponsesEvent(res, 'response.completed', {
        response: {
          id: respId,
          object: 'response',
          created_at: createdAt,
          status: 'completed',
          model: requestedModel || 'workbuddy',
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

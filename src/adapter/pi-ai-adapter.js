/**
 * pi-ai-adapter.js - DeepSeek Harness 原生 LlmAdapter 适配器与 Provider 注册绑定
 * 完全实现 @deepseek-ai/dsh-llm 的 LlmAdapter 接口规范，支持免密内置模型调度、
 * 流式思维链、全工具调用、用量统计与多账号容灾。
 */

import { PROVIDER_NAME, PROVIDER_ALIAS, STATIC_MODELS } from '../constants.js';

function extractText(content) {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';
  return content
    .filter((b) => b && (b.type === 'text' || b.type === 'input_text') && typeof b.text === 'string')
    .map((b) => b.text)
    .join('\n');
}

/**
 * 将 DSH GenerateOptions 转换为 OpenAI Chat Completions 消息与工具格式
 */
async function toOpenAIRequest(options, ctx) {
  const messages = [];

  if (typeof options.system === 'string' && options.system.trim()) {
    messages.push({ role: 'system', content: options.system });
  }

  for (const msg of options.messages || []) {
    if (!msg) continue;

    if (msg.role === 'system' || msg.role === 'developer') {
      const txt = extractText(msg.content);
      if (txt) messages.push({ role: 'system', content: txt });
      continue;
    }

    if (msg.role === 'user') {
      if (typeof msg.content === 'string') {
        messages.push({ role: 'user', content: msg.content });
        continue;
      }
      const parts = [];
      let hasMedia = false;
      for (const b of msg.content || []) {
        if (!b) continue;
        if (b.type === 'text' && b.text) {
          parts.push({ type: 'text', text: b.text });
        } else if (b.type === 'image') {
          hasMedia = true;
          if (b.url || b.image_url) {
            parts.push({ type: 'image_url', image_url: { url: b.url || b.image_url?.url } });
          } else if (b.attachment && ctx?.get) {
            try {
              const attachments = ctx.get('attachments');
              if (attachments?.readImageRequest) {
                const img = await attachments.readImageRequest(
                  b.attachment,
                  { width: b.attachment.width || 2048, height: b.attachment.height || 2048, maxBytes: 2 * 1024 * 1024 },
                  options.signal
                );
                const b64 = Buffer.from(img.data).toString('base64');
                parts.push({
                  type: 'image_url',
                  image_url: { url: `data:${img.mediaType || 'image/png'};base64,${b64}` }
                });
              }
            } catch (_) {
              parts.push({ type: 'text', text: `[图片附件: ${b.attachment?.attachmentId || 'image'}]` });
            }
          }
        }
      }
      if (!hasMedia) {
        messages.push({ role: 'user', content: extractText(msg.content) });
      } else {
        messages.push({ role: 'user', content: parts.length > 0 ? parts : '' });
      }
      continue;
    }

    if (msg.role === 'assistant') {
      const contentArr = Array.isArray(msg.content) ? msg.content : [];
      const text = typeof msg.content === 'string'
        ? msg.content
        : contentArr.filter((b) => b?.type === 'text').map((b) => b.text).join('');
      const reasoning = contentArr
        .filter((b) => b?.type === 'reasoning' || b?.type === 'thinking')
        .map((b) => b.text || '')
        .join('');
      const toolCalls = contentArr
        .filter((b) => b?.type === 'tool-call' || b?.type === 'toolCall')
        .map((b) => ({
          id: String(b.id || `call_${Date.now()}`),
          type: 'function',
          function: {
            name: b.name,
            arguments: typeof b.arguments === 'string' ? b.arguments : JSON.stringify(b.arguments || {})
          }
        }));

      const outMsg = { role: 'assistant', content: text || '' };
      if (reasoning) outMsg.reasoning_content = reasoning;
      if (toolCalls.length > 0) outMsg.tool_calls = toolCalls;
      messages.push(outMsg);
      continue;
    }

    if (msg.role === 'tool') {
      messages.push({
        role: 'tool',
        tool_call_id: String(msg.toolCallId || ''),
        content: extractText(msg.content) || (msg.isError ? 'Tool execution failed' : 'ok')
      });
    }
  }

  const tools = Array.isArray(options.tools)
    ? options.tools
        .filter((t) => t && !t.deferLoading)
        .map((t) => ({
          type: 'function',
          function: {
            name: t.name,
            description: t.description || '',
            parameters: t.parameters || { type: 'object', properties: {} }
          }
        }))
    : undefined;

  return {
    model: options.model,
    messages,
    stream: true,
    ...(tools && tools.length > 0 ? { tools, tool_choice: 'auto' } : {}),
    ...(options.temperature !== undefined ? { temperature: options.temperature } : {}),
    ...(options.maxTokens !== undefined ? { max_tokens: options.maxTokens } : {}),
    ...(options.reasoningEffort ? { reasoning_effort: options.reasoningEffort } : {}),
    ...(options.sessionId ? { conversation_id: String(options.sessionId) } : {})
  };
}

export function createWorkBuddyAdapter(loopback, enabledModelsFn, runtimeDeps = {}) {
  const { scheduler, client, ledger, ctx } = runtimeDeps;
  const getBaseUrl = () => `http://127.0.0.1:${loopback.actualPort || 7863}/v1`;

  const getRawCatalog = () => {
    const enabled = enabledModelsFn ? enabledModelsFn() : [];
    const isFiltered = Array.isArray(enabled) && enabled.length > 0;
    return STATIC_MODELS.filter((m) => !isFiltered || enabled.includes(m.id));
  };

  const getCatalogModels = (provider = PROVIDER_ALIAS) => {
    return getRawCatalog().map((m) => {
      const suffix = m.rate ? ` · ${m.rate}` : '';
      const badgeSuffix = m.badge ? ` · ${m.badge}` : '';
      return {
        provider,
        id: m.id,
        name: `${m.name}${suffix}${badgeSuffix}`,
        inputModalities: m.supportsImages ? ['text', 'image'] : ['text']
      };
    });
  };

  /**
   * 构造完全符合 @deepseek-ai/dsh-llm LlmAdapter 契约的原生适配器
   */
  const adapter = {
    providerInfo(provider) {
      return {
        id: provider,
        name: provider === PROVIDER_ALIAS ? 'WorkBuddy 2API (内置免密)' : 'WorkBuddy (内置免密)'
      };
    },

    providerRetryPolicy(_provider) {
      return undefined;
    },

    imageRequestPricing(_provider, _model) {
      return undefined;
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
      // 兼容单元测试单参数调用与 DSH 官方三参数调用
      let actualProvider = provider;
      let actualModel = model;
      if (model === undefined || (typeof model === 'object' && model !== null)) {
        actualModel = provider;
        actualProvider = PROVIDER_ALIAS;
      }

      const found = STATIC_MODELS.find((m) => m.id === actualModel);
      return {
        provider: actualProvider,
        id: actualModel,
        name: found ? `${found.name}${found.rate ? ` · ${found.rate}` : ''}` : actualModel,
        inputModalities: found?.supportsImages ? ['text', 'image'] : ['text'],
        context: { contextWindow: found?.contextWindow || 200000 },
        defaultMaxTokens: found?.maxTokens || 32000,
        reasoning: {
          efforts: [
            { id: 'low', name: 'Low' },
            { id: 'medium', name: 'Medium' },
            { id: 'high', name: 'High' },
            { id: 'xhigh', name: 'XHigh' }
          ],
          defaultEffort: 'high'
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
      const actualModel = loopback.resolveModel(options.model || 'auto-free');
      const reqBody = await toOpenAIRequest({ ...options, model: actualModel }, ctx);

      let execution = null;
      let nextBlockIndex = 0;
      let reasoningIdx = null;
      let reasoningBuf = '';
      let textIdx = null;
      let textBuf = '';
      const toolCalls = new Map(); // stream tcIdx -> { blockIdx, id, name, args }
      let lastUsage = null;
      let finishReason = '';
      let hasContent = false;

      let totalChars = 0;
      const closeReasoning = async function* () {
        if (reasoningIdx !== null) {
          totalChars += reasoningBuf.length;
          yield {
            type: 'block-end',
            index: reasoningIdx,
            block: { type: 'reasoning', text: reasoningBuf }
          };
          reasoningIdx = null;
          reasoningBuf = '';
        }
      };

      const closeText = async function* () {
        if (textIdx !== null) {
          totalChars += textBuf.length;
          yield {
            type: 'block-end',
            index: textIdx,
            block: { type: 'text', text: textBuf }
          };
          textIdx = null;
          textBuf = '';
        }
      };

      const closeTools = async function* () {
        for (const tc of toolCalls.values()) {
          if (!tc.closed) {
            tc.closed = true;
            yield {
              type: 'block-end',
              index: tc.blockIdx,
              block: {
                type: 'tool-call',
                id: tc.id,
                name: tc.name,
                arguments: tc.args || '{}'
              }
            };
          }
        }
      };

      try {
        if (scheduler && client) {
          execution = await scheduler.executeWithFailover(actualModel, async (account) => {
            return await client.chatStream(account, reqBody, options.signal, {
              conversationId: options.sessionId ? String(options.sessionId) : undefined
            });
          });
        } else {
          // 降级：走本地 Loopback HTTP
          const res = await fetch(`${getBaseUrl()}/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reqBody),
            signal: options.signal
          });
          if (!res.ok) {
            throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
          }
          execution = { bodyStream: res.body, release: () => {} };
        }

        // 视频模型适配
        if (execution.isVideo) {
          const idx = nextBlockIndex++;
          hasContent = true;
          yield { type: 'block-start', index: idx, blockType: 'text' };
          let fullVideoText = '';
          await execution.executeVideo((chunk) => {
            fullVideoText += chunk;
          });
          yield { type: 'text-delta', index: idx, text: fullVideoText };
          yield { type: 'block-end', index: idx, block: { type: 'text', text: fullVideoText } };
          yield { type: 'usage', usage: { inputTokens: 10, outputTokens: 50, totalTokens: 60 } };
          yield { type: 'finish', reason: { kind: 'stop' } };
          ledger?.record?.(actualModel, 10, 50);
          return;
        }

        const reader = execution.bodyStream.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split(/\r?\n/);
          buffer = lines.pop() || '';

          for (const rawLine of lines) {
            const line = rawLine.trim();
            if (!line || line.startsWith(':')) continue;
            if (!line.startsWith('data:')) continue;
            const dataStr = line.slice(5).trim();
            if (dataStr === '[DONE]') continue;

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

            // 1. Reasoning / Thinking delta
            const rDelta = delta.reasoning_content ?? delta.reasoning ?? '';
            if (rDelta) {
              hasContent = true;
              if (reasoningIdx === null) {
                reasoningIdx = nextBlockIndex++;
                yield { type: 'block-start', index: reasoningIdx, blockType: 'reasoning' };
              }
              reasoningBuf += rDelta;
              yield { type: 'reasoning-delta', index: reasoningIdx, text: rDelta };
            }

            // 2. Text content delta
            if (typeof delta.content === 'string' && delta.content.length > 0) {
              yield* closeReasoning();
              hasContent = true;
              if (textIdx === null) {
                textIdx = nextBlockIndex++;
                yield { type: 'block-start', index: textIdx, blockType: 'text' };
              }
              textBuf += delta.content;
              yield { type: 'text-delta', index: textIdx, text: delta.content };
            }

            // 3. Tool calls delta (注意跳过空数组 tool_calls: [])
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
                    name: tcDelta.function?.name || '',
                    args: '',
                    closed: false
                  };
                  toolCalls.set(sIdx, tracked);
                  yield { type: 'block-start', index: tracked.blockIdx, blockType: 'tool-call' };
                } else {
                  if (tcDelta.id) tracked.id = tcDelta.id;
                  if (tcDelta.function?.name) tracked.name = tcDelta.function.name;
                }

                const argDelta = tcDelta.function?.arguments || '';
                if (argDelta) {
                  tracked.args += argDelta;
                }

                yield {
                  type: 'tool-call-delta',
                  index: tracked.blockIdx,
                  id: tracked.id,
                  ...(tracked.name ? { name: tracked.name } : {}),
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
          type: 'usage',
          usage: {
            inputTokens: inTok,
            outputTokens: outTok,
            totalTokens: inTok + outTok,
            ...(cachedTok > 0 ? { cacheReadTokens: cachedTok } : {})
          }
        };

        if (options.signal?.aborted) {
          yield { type: 'finish', reason: { kind: 'aborted' } };
        } else if (finishReason === 'tool_calls' || toolCalls.size > 0) {
          yield { type: 'finish', reason: { kind: 'tool-calls' } };
        } else if (finishReason === 'length') {
          yield { type: 'finish', reason: { kind: 'max-tokens' } };
        } else if (!hasContent) {
          yield {
            type: 'finish',
            reason: {
              kind: 'error',
              failure: { code: 'EMPTY_RESPONSE', message: 'Upstream completed with empty response' }
            }
          };
        } else {
          yield { type: 'finish', reason: { kind: 'stop' } };
        }
      } catch (err) {
        if (options.signal?.aborted) {
          yield { type: 'finish', reason: { kind: 'aborted', failure: { code: 'ABORTED', message: err.message } } };
        } else {
          yield {
            type: 'finish',
            reason: {
              kind: 'error',
              failure: { code: err.kind || 'PI_AI_ERROR', message: err.message || String(err) }
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

export function registerLlmProvider(ctx, adapterObj) {
  const llm = ctx.llm;
  if (!llm || typeof llm.registerAdapter !== 'function') return () => {};

  let disposeAdapter = null;
  try {
    // 动态避让冲突：始终注册内置别名 workbuddy2api；若 workbuddy 未被 llm-pi-ai 占用则一并接管
    const routes = [];
    const existing = llm.adapters;
    if (!existing || !existing.has(PROVIDER_ALIAS)) {
      routes.push(PROVIDER_ALIAS);
    }
    if (!existing || !existing.has(PROVIDER_NAME)) {
      routes.push(PROVIDER_NAME);
    }
    if (routes.length === 0) {
      console.warn('[adapter] workbuddy 与 workbuddy2api 均已被占用，跳过重复注册');
      return () => {};
    }

    disposeAdapter = llm.registerAdapter(routes, adapterObj.adapter);
    console.log(`[adapter] ✅ 成功向 DSH LLM 注册原生免密 Provider: ${routes.join(', ')}`);
  } catch (err) {
    console.warn('[adapter] 注册 DSH LLM 适配器异常:', err.message);
  }

  return () => {
    try { disposeAdapter?.(); } catch (_) {}
  };
}

/**
 * pi-ai-adapter.js - DeepSeek Harness LLM 适配器与 Provider 注册绑定
 */

import { PROVIDER_NAME, PROVIDER_ALIAS, SETTINGS_NS, STATIC_MODELS } from '../constants.js';

export function createWorkBuddyAdapter(loopback, enabledModelsFn) {
  const getBaseUrl = () => `http://127.0.0.1:${loopback.actualPort || 7863}/v1`;

  const getCatalogModels = () => {
    const baseUrl = getBaseUrl();
    const enabled = enabledModelsFn ? enabledModelsFn() : [];
    const isFiltered = Array.isArray(enabled) && enabled.length > 0;

    return STATIC_MODELS.filter((m) => !isFiltered || enabled.includes(m.id)).map((m) => {
      const suffix = m.rate ? ` · ${m.rate}` : '';
      const badgeSuffix = m.badge ? ` · ${m.badge}` : '';
      return {
        id: m.id,
        name: `${m.name}${suffix}${badgeSuffix}`,
        provider: PROVIDER_NAME,
        contextWindow: m.contextWindow || 200000,
        maxTokens: m.maxTokens || 32000,
        input: m.supportsImages ? ['text', 'image'] : ['text'],
        baseUrl: baseUrl,
        api: 'openai-completions'
      };
    });
  };

  /**
   * 构造兼容 DSH LLM Seam 的标准 Provider 适配器
   */
  const adapter = {
    async listModels() {
      return getCatalogModels();
    },

    async resolveModel(modelId) {
      const models = getCatalogModels();
      const found = models.find((m) => m.id === modelId);
      if (found) return found;
      return {
        id: modelId,
        name: modelId,
        provider: PROVIDER_NAME,
        contextWindow: 200000,
        maxTokens: 32000,
        input: ['text', 'image'],
        baseUrl: getBaseUrl(),
        api: 'openai-completions'
      };
    },

    async chat(request, options = {}) {
      // 通过本地 Loopback OpenAI 接口完成转发
      const res = await fetch(`${getBaseUrl()}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${loopback.apiKey || 'sk-wb2a-internal'}`
        },
        body: JSON.stringify(request),
        signal: options.signal
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Request failed with ${res.status}`);
      }

      return res;
    }
  };

  return {
    providerName: PROVIDER_NAME,
    aliases: [PROVIDER_NAME, PROVIDER_ALIAS],
    adapter,
    getCatalogModels
  };
}

export function registerLlmProvider(ctx, adapterObj) {
  if (!ctx.llm) return () => {};

  let disposeAdapter = null;
  let disposeProviders = null;

  try {
    if (typeof ctx.llm.registerAdapter === 'function') {
      disposeAdapter = ctx.llm.registerAdapter(adapterObj.aliases, adapterObj.adapter);
    }
    if (typeof ctx.llm.registerConfigurableProviders === 'function') {
      disposeProviders = ctx.llm.registerConfigurableProviders([
        {
          provider: PROVIDER_NAME,
          displayName: 'WorkBuddy 2API',
          settingsNs: SETTINGS_NS,
          settingsPath: [],
          declared: false
        }
      ]);
    }
    console.log(`[adapter] 成功向 DSH LLM 注册 Provider: ${PROVIDER_NAME} & ${PROVIDER_ALIAS}`);
  } catch (err) {
    console.warn('[adapter] 注册 DSH LLM 适配器异常 (降级运行):', err.message);
  }

  return () => {
    if (disposeAdapter) disposeAdapter();
    if (disposeProviders) disposeProviders();
  };
}

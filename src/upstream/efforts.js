/**
 * efforts.js - 推理档位（Reasoning Effort）产品级静态兜底与严格归一化表
 * 
 * 彻底解决由于传入不支持的档位（例如 "off" 或超界参数）引发的上游 11150 / 400 报错。
 */

import { CN_EFFORT_FALLBACK, GLOBAL_EFFORT_FALLBACK } from '../constants.js';

/**
 * 获取指定 realm 和模型的档位能力
 */
export function getEffortCapability(realm, modelId) {
  const bareModel = modelId.replace(/^(cn:|global:|solo:|trae:)/i, '');
  const isGlobal = realm === 'global' || modelId.startsWith('global:');
  const table = isGlobal ? GLOBAL_EFFORT_FALLBACK : CN_EFFORT_FALLBACK;
  return table[bareModel] || null;
}

/**
 * 严格归一化推理档位：
 * 1. 如果客户端传入了 "off"，绝不能发给上游（上游无 off 档位，发了必 11150），返回 null。
 * 2. 如果模型定义了受支持的档位列表，检查传入的 effort 是否在列表中；若在则保留，不在则降级为 defaultEffort 或 null。
 * 3. 针对国际版 deepseek-v4.1-flash：国际版只认 high，若传入 low/max 自动修正为 high。
 */
export function normalizeReasoningEffort(realm, modelId, effort) {
  if (!effort || typeof effort !== 'string') return null;
  const lower = effort.trim().toLowerCase();
  if (lower === 'off' || lower === 'none' || lower === 'default') {
    return null; // 不下发字段，交由模型默认行为
  }

  const cap = getEffortCapability(realm, modelId);
  if (!cap) {
    // 未知模型：仅放行常见标准档位
    const allowed = ['low', 'medium', 'high', 'xhigh', 'max'];
    return allowed.includes(lower) ? lower : null;
  }

  if (cap.efforts && cap.efforts.includes(lower)) {
    return lower;
  }

  // 传入了模型不支持的档位，回退至该模型的默认档位
  return cap.defaultEffort || null;
}

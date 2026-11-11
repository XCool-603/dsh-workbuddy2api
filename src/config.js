/**
 * config.js - 插件配置模式定义与运行时持久化管理
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { DEFAULT_MODEL_ALIASES } from './constants.js';

export const defaultConfig = {
  authDir: '',
  gatewayPort: 7863,
  apiKey: '',
  maxInFlightCN: 3,
  maxInFlightGlobal: 2,
  queueTimeoutMs: 60000,
  autoCheckin: true,
  autoTravel: true,
  autoRefreshToken: true,
  promptMode: 'none', // 'none' | 'passthrough' | 'append' | 'replace' | 'custom'
  promptText: '',
  proxy: '',
  enabledModels: [],
  aliases: { ...DEFAULT_MODEL_ALIASES },
  freeModels: ['global:hy4free', 'cn:hy4free', 'global:hy3', 'cn:hy3', 'global:deepseek-v4.1-flash-sg', 'cn:deepseek-v4.1-flash']
};

export function unwrapConfig(raw) {
  if (!raw || typeof raw !== 'object') {
    return { ...defaultConfig, aliases: { ...defaultConfig.aliases } };
  }
  return {
    ...defaultConfig,
    ...raw,
    aliases: {
      ...DEFAULT_MODEL_ALIASES,
      ...(raw.aliases || {})
    }
  };
}

export class ConfigStore {
  constructor(initialConfig = {}, options = {}) {
    const optHome = typeof options === 'string' ? options : options?.dshHome;
    this.dshHome = optHome || process.env.DSH_HOME || path.join(os.homedir(), '.dsh');
    this.configPath = path.join(this.dshHome, '.workbuddy2api-config.json');
    const override = initialConfig && typeof initialConfig === 'object' ? initialConfig : {};
    this.data = unwrapConfig(override);
    this.load(override);
  }

  load(override = {}) {
    try {
      if (fs.existsSync(this.configPath)) {
        const disk = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
        // 磁盘持久化配置优先生效，确保网关重启后 WebUI 修改的参数不丢失
        this.data = unwrapConfig({ ...override, ...disk });
      }
    } catch (e) {
      console.warn('[config-store] 读取持久化配置异常:', e.message);
    }
    return this.data;
  }

  get(key) {
    return this.data[key];
  }

  getAll() {
    return {
      ...this.data,
      aliases: { ...this.data.aliases },
      enabledModels: [...(this.data.enabledModels || [])],
      freeModels: [...(this.data.freeModels || [])]
    };
  }

  update(patch = {}) {
    const next = { ...this.data };
    for (const [k, v] of Object.entries(patch)) {
      if (v === undefined) continue;
      if (k === 'aliases' && v && typeof v === 'object') {
        next.aliases = { ...v };
      } else if (k === 'enabledModels' && Array.isArray(v)) {
        next.enabledModels = [...v];
      } else if (k === 'freeModels' && Array.isArray(v)) {
        next.freeModels = [...v];
      } else if (k in defaultConfig) {
        next[k] = v;
      }
    }
    this.data = next;
    this.save();
    return this.getAll();
  }

  save() {
    try {
      if (!fs.existsSync(this.dshHome)) {
        fs.mkdirSync(this.dshHome, { recursive: true });
      }
      fs.writeFileSync(this.configPath, JSON.stringify(this.data, null, 2), { mode: 0o600 });
    } catch (err) {
      console.warn('[config-store] 保存配置失败:', err.message);
    }
  }
}

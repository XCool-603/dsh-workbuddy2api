/**
 * config.js - 插件配置模式定义与运行时持久化管理
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { DEFAULT_MODEL_ALIASES, DEFAULT_STREAM_IDLE_TIMEOUT_MS } from './constants.js';

export const defaultScheduleConfig = {
  checkinHours: [9, 21],
  travelHours: [9, 21],
  tasksHours: [11],
  keepaliveHours: [22],
  activityReportCount: 5,
  checkinEnabled: true,
  travelEnabled: true,
  tasksEnabled: true,
  keepaliveEnabled: true
};

export const defaultIPWhitelistConfig = {
  enabled: false,
  allowedIPs: [],
  allowLocalhost: true
};

export const defaultAlertsConfig = {
  enabled: false,
  webhooks: [],
  events: ['ban', '401', 'cooling', 'low_credit'],
  minCredit: 50
};

export const defaultConfig = {
  authDir: '',
  gatewayPort: 7863,
  apiKey: '',
  webPassword: '',
  allowRegister: false,
  portalAsHome: false,
  maxInFlightCN: 3,
  maxInFlightGlobal: 2,
  queueTimeoutMs: 60000,
  streamIdleTimeoutMs: DEFAULT_STREAM_IDLE_TIMEOUT_MS,
  deviceTokenPath: '',
  autoCheckin: true,
  autoTravel: true,
  autoTasks: true,
  autoRefreshToken: true,
  autoFreeEnabled: true,
  promptMode: 'none', // 'none' | 'passthrough' | 'append' | 'replace' | 'custom'
  promptText: '',
  proxy: '',
  enabledModels: [],
  aliases: { ...DEFAULT_MODEL_ALIASES },
  modelRoutes: {},
  freeModels: ['global:hy4free', 'cn:hy4free', 'global:hy3', 'cn:hy3', 'global:deepseek-v4.1-flash-sg', 'cn:deepseek-v4.1-flash'],
  schedule: { ...defaultScheduleConfig },
  ipWhitelist: { ...defaultIPWhitelistConfig },
  alerts: { ...defaultAlertsConfig }
};

function normalizeHoursList(list, fallback) {
  if (!Array.isArray(list) || list.length === 0) return [...fallback];
  const valid = list
    .map((h) => Number(h))
    .filter((h) => Number.isInteger(h) && h >= 0 && h <= 23);
  return valid.length > 0 ? [...new Set(valid)].sort((a, b) => a - b) : [...fallback];
}

export function unwrapConfig(raw) {
  const src = raw && typeof raw === 'object' ? raw : {};
  const schedIn = src.schedule && typeof src.schedule === 'object' ? src.schedule : {};
  const ipIn = src.ipWhitelist && typeof src.ipWhitelist === 'object' ? src.ipWhitelist : {};
  const alertsIn = src.alerts && typeof src.alerts === 'object' ? src.alerts : {};

  return {
    ...defaultConfig,
    ...src,
    aliases: {
      ...DEFAULT_MODEL_ALIASES,
      ...(src.aliases && typeof src.aliases === 'object' ? src.aliases : {})
    },
    modelRoutes: src.modelRoutes && typeof src.modelRoutes === 'object' ? { ...src.modelRoutes } : {},
    enabledModels: Array.isArray(src.enabledModels) ? [...src.enabledModels] : [],
    freeModels: Array.isArray(src.freeModels) && src.freeModels.length > 0
      ? [...src.freeModels]
      : [...defaultConfig.freeModels],
    schedule: {
      ...defaultScheduleConfig,
      ...schedIn,
      checkinHours: normalizeHoursList(schedIn.checkinHours, defaultScheduleConfig.checkinHours),
      travelHours: normalizeHoursList(schedIn.travelHours, defaultScheduleConfig.travelHours),
      tasksHours: normalizeHoursList(schedIn.tasksHours, defaultScheduleConfig.tasksHours),
      keepaliveHours: normalizeHoursList(schedIn.keepaliveHours, defaultScheduleConfig.keepaliveHours),
      activityReportCount: Math.max(1, Number(schedIn.activityReportCount ?? defaultScheduleConfig.activityReportCount) || 5)
    },
    ipWhitelist: {
      ...defaultIPWhitelistConfig,
      ...ipIn,
      allowedIPs: Array.isArray(ipIn.allowedIPs) ? [...ipIn.allowedIPs] : [],
      allowLocalhost: ipIn.allowLocalhost !== undefined ? Boolean(ipIn.allowLocalhost) : true
    },
    alerts: {
      ...defaultAlertsConfig,
      ...alertsIn,
      webhooks: Array.isArray(alertsIn.webhooks) ? alertsIn.webhooks.filter(Boolean) : [],
      events: Array.isArray(alertsIn.events) && alertsIn.events.length > 0
        ? [...alertsIn.events]
        : [...defaultAlertsConfig.events],
      minCredit: Math.max(0, Number(alertsIn.minCredit ?? defaultAlertsConfig.minCredit) || 0)
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
    return unwrapConfig(this.data);
  }

  update(patch = {}) {
    const merged = { ...this.data };
    for (const [k, v] of Object.entries(patch)) {
      if (v === undefined) continue;
      if (k === 'aliases' && v && typeof v === 'object') {
        merged.aliases = { ...v };
      } else if (k === 'modelRoutes' && v && typeof v === 'object') {
        merged.modelRoutes = { ...v };
      } else if (k === 'schedule' && v && typeof v === 'object') {
        merged.schedule = { ...merged.schedule, ...v };
      } else if (k === 'ipWhitelist' && v && typeof v === 'object') {
        merged.ipWhitelist = { ...merged.ipWhitelist, ...v };
      } else if (k === 'alerts' && v && typeof v === 'object') {
        merged.alerts = { ...merged.alerts, ...v };
      } else if (k === 'enabledModels' && Array.isArray(v)) {
        merged.enabledModels = [...v];
      } else if (k === 'freeModels' && Array.isArray(v)) {
        merged.freeModels = [...v];
      } else if (k in defaultConfig) {
        merged[k] = v;
      }
    }
    this.data = unwrapConfig(merged);
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

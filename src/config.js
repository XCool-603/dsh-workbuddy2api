/**
 * config.js - 插件配置模式定义 (兼容 Cordis Schemastery 与原生配置解析)
 */

export const defaultConfig = {
  authDir: 'c:\\Work\\workbody\\workbuddy2api\\auths',
  gatewayPort: 7863,
  maxInFlightCN: 3,
  maxInFlightGlobal: 2,
  autoCheckin: true,
  proxy: '',
  enabledModels: [],
  aliases: {}
};

export function unwrapConfig(raw) {
  if (!raw || typeof raw !== 'object') return { ...defaultConfig };
  return {
    ...defaultConfig,
    ...raw
  };
}

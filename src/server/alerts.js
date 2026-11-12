/**
 * alerts.js - 多通道风控与运维 Webhook 告警管理器
 * 支持飞书 / 企业微信 / 钉钉 / Telegram / Discord / 通用 Webhook
 */

function maskWebhookUrl(u = '') {
  if (u.length <= 20) return u;
  return `${u.slice(0, 15)}...${u.slice(-5)}`;
}

function formatWebhookPayload(url, text, event = 'alert') {
  const lower = String(url || '').toLowerCase();
  if (lower.includes('feishu.cn') || lower.includes('larksuite.com')) {
    return { msg_type: 'text', content: { text } };
  }
  if (lower.includes('qyapi.weixin.qq.com') || lower.includes('dingtalk.com')) {
    return { msgtype: 'text', text: { content: text } };
  }
  if (lower.includes('api.telegram.org')) {
    return { text };
  }
  if (lower.includes('discord.com/api/webhooks') || lower.includes('discordapp.com/api/webhooks')) {
    return { content: text };
  }
  return {
    event,
    text,
    timestamp: Math.floor(Date.now() / 1000)
  };
}

export class AlertManager {
  constructor(options = {}) {
    this.configStore = options.configStore || null;
    this.fetchFn = options.fetchFn || fetch;
    this.lastAlertAt = new Map(); // throttleKey -> ts
    this.history = []; // 最近 30 条告警发送记录（便于控制台排查）
  }

  getConfig() {
    const cfg = this.configStore ? this.configStore.getAll() : {};
    const alerts = cfg.alerts || {};
    return {
      enabled: Boolean(alerts.enabled),
      webhooks: Array.isArray(alerts.webhooks) ? alerts.webhooks.filter(Boolean) : [],
      events: Array.isArray(alerts.events) && alerts.events.length > 0
        ? alerts.events
        : ['ban', '401', 'cooling', 'low_credit'],
      minCredit: Math.max(0, Number(alerts.minCredit ?? 50) || 0)
    };
  }

  isEventAllowed(event) {
    const cfg = this.getConfig();
    if (!cfg.enabled || cfg.webhooks.length === 0) return false;
    if (cfg.events.length === 0) return true;
    return cfg.events.some((e) => String(e).toLowerCase() === String(event).toLowerCase());
  }

  _shouldThrottle(key, intervalMs) {
    const now = Date.now();
    const last = this.lastAlertAt.get(key) || 0;
    if (now - last < intervalMs) return true;
    this.lastAlertAt.set(key, now);
    if (this.lastAlertAt.size > 500) {
      const firstKey = this.lastAlertAt.keys().next().value;
      this.lastAlertAt.delete(firstKey);
    }
    return false;
  }

  _recordHistory(event, summary, results) {
    this.history.unshift({
      id: `alt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      event,
      summary: summary.slice(0, 200),
      time: new Date().toISOString(),
      results
    });
    if (this.history.length > 30) {
      this.history.length = 30;
    }
  }

  async _sendSingleWebhook(rawUrl, text, event) {
    const payload = formatWebhookPayload(rawUrl, text, event);
    const res = await this.fetchFn(rawUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000)
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return true;
  }

  async dispatch(text, event = 'alert') {
    const { webhooks } = this.getConfig();
    if (webhooks.length === 0) {
      return { ok: false, results: [{ target: '-', ok: false, error: '未配置任何 Webhook 地址' }] };
    }

    const results = [];
    for (const url of webhooks) {
      try {
        await this._sendSingleWebhook(url, text, event);
        results.push({ target: maskWebhookUrl(url), ok: true });
      } catch (err) {
        console.warn(`[alert] webhook 发送失败 (${maskWebhookUrl(url)}): ${err.message}`);
        results.push({ target: maskWebhookUrl(url), ok: false, error: err.message });
      }
    }
    this._recordHistory(event, text, results);
    return { ok: results.some((r) => r.ok), results };
  }

  notifyBan(uid, nick, reason) {
    if (!this.isEventAllowed('ban')) return;
    if (this._shouldThrottle(`ban:${uid}`, 15 * 60 * 1000)) return;
    const msg =
      `🚨【DSH-WorkBuddy2API 告警】账号异常封禁/停用\n` +
      `• 账号: ${nick || '-'} (${uid})\n` +
      `• 原因: ${reason}\n` +
      `• 时间: ${new Date().toLocaleString('zh-CN', { hour12: false })}\n` +
      `• 建议: 请在控制台检查账号状态或重新授权 Token。`;
    this.dispatch(msg, 'ban').catch(() => {});
  }

  notifyAuthFailed(uid, nick, errMsg) {
    if (!this.isEventAllowed('401')) return;
    if (this._shouldThrottle(`401:${uid}`, 15 * 60 * 1000)) return;
    const msg =
      `⚠️【DSH-WorkBuddy2API 告警】账号凭证失效 (401/12153)\n` +
      `• 账号: ${nick || '-'} (${uid})\n` +
      `• 错误: ${String(errMsg || '').slice(0, 180)}\n` +
      `• 时间: ${new Date().toLocaleString('zh-CN', { hour12: false })}`;
    this.dispatch(msg, '401').catch(() => {});
  }

  notifyAllCooling(realm, model) {
    if (!this.isEventAllowed('cooling')) return;
    if (this._shouldThrottle(`cooling:${realm || 'all'}:${model}`, 10 * 60 * 1000)) return;
    const msg =
      `🔥【DSH-WorkBuddy2API 告警】全池冷却/无可用健康账号\n` +
      `• 域: ${realm || 'all'}\n` +
      `• 模型: ${model}\n` +
      `• 时间: ${new Date().toLocaleString('zh-CN', { hour12: false })}\n` +
      `• 建议: 请补充同域账号或开启 auto-free 多模型兜底。`;
    this.dispatch(msg, 'cooling').catch(() => {});
  }

  notifyLowCredit(uid, nick, remainCredits) {
    if (!this.isEventAllowed('low_credit')) return;
    const { minCredit } = this.getConfig();
    if (remainCredits >= minCredit) return;
    if (this._shouldThrottle(`low_credit:${uid}`, 60 * 60 * 1000)) return;
    const msg =
      `💰【DSH-WorkBuddy2API 告警】账号积分低于预警阈值\n` +
      `• 账号: ${nick || '-'} (${uid})\n` +
      `• 剩余积分: ${remainCredits} (< 阈值 ${minCredit})\n` +
      `• 时间: ${new Date().toLocaleString('zh-CN', { hour12: false })}`;
    this.dispatch(msg, 'low_credit').catch(() => {});
  }

  async sendTestAlert() {
    const msg =
      `🔔【DSH-WorkBuddy2API 测试通知】\n` +
      `• 状态: Webhook 告警通道连通正常\n` +
      `• 时间: ${new Date().toLocaleString('zh-CN', { hour12: false })}`;
    return this.dispatch(msg, 'test');
  }
}

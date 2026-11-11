/**
 * ledger.js - 本机 Token 与请求用量账本（支持 7 天走势、逐小时与按模型统计）
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

export class UsageLedger {
  constructor(options = {}) {
    this.dshHome = options.dshHome || process.env.DSH_HOME || path.join(os.homedir(), '.dsh');
    this.filePath = path.join(this.dshHome, '.workbuddy2api-usage.json');
    this.data = {
      days: {}, // 'YYYY-MM-DD' -> { requests, inputTokens, outputTokens, models: {}, hours: {} }
      summary: { totalRequests: 0, totalInputTokens: 0, totalOutputTokens: 0 }
    };
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.filePath)) {
        this.data = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
      }
    } catch (_) {}
  }

  save() {
    try {
      if (!fs.existsSync(this.dshHome)) {
        fs.mkdirSync(this.dshHome, { recursive: true });
      }
      // 保留最近 60 天数据
      const keys = Object.keys(this.data.days).sort();
      if (keys.length > 60) {
        for (const oldKey of keys.slice(0, keys.length - 60)) {
          delete this.data.days[oldKey];
        }
      }
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (_) {}
  }

  getTodayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  record(model, inputTokens = 0, outputTokens = 0, cacheHit = false) {
    const today = this.getTodayKey();
    const hour = String(new Date().getHours());

    if (!this.data.days[today]) {
      this.data.days[today] = {
        requests: 0,
        inputTokens: 0,
        outputTokens: 0,
        cacheHits: 0,
        models: {},
        hours: {}
      };
    }

    const day = this.data.days[today];
    day.requests += 1;
    day.inputTokens += inputTokens;
    day.outputTokens += outputTokens;
    if (cacheHit) day.cacheHits = (day.cacheHits || 0) + 1;

    // 模型统计
    day.models[model] = (day.models[model] || 0) + 1;

    // 小时统计
    if (!day.hours[hour]) {
      day.hours[hour] = { requests: 0, tokens: 0 };
    }
    day.hours[hour].requests += 1;
    day.hours[hour].tokens += inputTokens + outputTokens;

    // 汇总
    this.data.summary.totalRequests += 1;
    this.data.summary.totalInputTokens += inputTokens;
    this.data.summary.totalOutputTokens += outputTokens;

    this.save();
  }

  getStats() {
    const today = this.getTodayKey();
    const todayData = this.data.days[today] || { requests: 0, inputTokens: 0, outputTokens: 0, cacheHits: 0, hours: {}, models: {} };

    // 计算近 7 天走势
    const dates = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const item = this.data.days[k] || { requests: 0, inputTokens: 0, outputTokens: 0, cacheHits: 0 };
      const totalTokens = item.inputTokens + item.outputTokens;
      const hitRate = item.requests > 0 ? Math.round(((item.cacheHits || 0) / item.requests) * 100) : 0;
      dates.push({
        date: k.slice(5),
        requests: item.requests,
        tokens: totalTokens,
        hitRate
      });
    }

    // 24 小时分布
    const hourly = [];
    for (let h = 0; h < 24; h++) {
      const sh = String(h);
      hourly.push({
        hour: `${sh}时`,
        tokens: todayData.hours?.[sh]?.tokens || 0,
        requests: todayData.hours?.[sh]?.requests || 0
      });
    }

    return {
      today: {
        requests: todayData.requests,
        inputTokens: todayData.inputTokens,
        outputTokens: todayData.outputTokens,
        totalTokens: todayData.inputTokens + todayData.outputTokens,
        models: todayData.models
      },
      summary: this.data.summary,
      trend7d: dates,
      hourly
    };
  }

  /**
   * 重置本地用量统计账本
   */
  reset() {
    this.data = {
      days: {},
      summary: { totalRequests: 0, totalInputTokens: 0, totalOutputTokens: 0 }
    };
    this.save();
  }
}

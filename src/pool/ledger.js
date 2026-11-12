/**
 * ledger.js - 本机 Token、积分扣费、模型倍率耗时统计账本与实时请求流水记录
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

function round2(n) {
  return Math.round((Number(n) || 0) * 100) / 100;
}

function round3(n) {
  return Math.round((Number(n) || 0) * 1000) / 1000;
}

function createEmptyModelBucket() {
  return {
    requests: 0,
    success: 0,
    failed: 0,
    inputTokens: 0,
    outputTokens: 0,
    cacheHitTokens: 0,
    cacheMissTokens: 0,
    cacheWriteTokens: 0,
    credit: 0,
    creditSamples: 0,
    ttfbSumMs: 0,
    ttfbCount: 0,
    latSumMs: 0,
    genSecSum: 0,
    lastSeen: 0
  };
}

export class UsageLedger {
  constructor(options = {}) {
    this.dshHome = options.dshHome || process.env.DSH_HOME || path.join(os.homedir(), '.dsh');
    this.filePath = path.join(this.dshHome, '.workbuddy2api-usage.json');
    this.recentLogs = [];
    this.nextLogId = 1;
    this.data = {
      days: {},
      modelStats: {},
      summary: {
        totalRequests: 0,
        totalSuccess: 0,
        totalFailed: 0,
        totalInputTokens: 0,
        totalOutputTokens: 0,
        totalCredit: 0
      }
    };
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const disk = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
        this.data = {
          days: disk.days || {},
          modelStats: disk.modelStats || {},
          summary: {
            totalRequests: 0,
            totalSuccess: 0,
            totalFailed: 0,
            totalInputTokens: 0,
            totalOutputTokens: 0,
            totalCredit: 0,
            ...(disk.summary || {})
          }
        };
      }
    } catch (_) {}
  }

  save() {
    try {
      if (!fs.existsSync(this.dshHome)) {
        fs.mkdirSync(this.dshHome, { recursive: true });
      }
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

  /**
   * 写入单次请求消费与指标记录（兼容旧 4 参数及新版详情对象）
   */
  record(model, inputTokens = 0, outputTokens = 0, cacheHit = false, extra = {}) {
    const today = this.getTodayKey();
    const hour = String(new Date().getHours());
    const inTok = Math.max(0, Math.round(Number(inputTokens) || 0));
    const outTok = Math.max(0, Math.round(Number(outputTokens) || 0));
    const credit = Math.max(0, Number(extra.credit || 0) || 0);
    const hasCredit = Boolean(extra.hasCredit || credit > 0);
    const success = extra.success !== false;
    const ttfbMs = Math.max(0, Number(extra.ttfbMs || 0) || 0);
    const durationMs = Math.max(0, Number(extra.durationMs || 0) || 0);
    const cacheHitTokens = Math.max(0, Number(extra.cacheHitTokens || 0) || 0);
    const cacheMissTokens = Math.max(0, Number(extra.cacheMissTokens || 0) || 0);
    const cacheWriteTokens = Math.max(0, Number(extra.cacheWriteTokens || 0) || 0);

    if (!this.data.days[today]) {
      this.data.days[today] = {
        requests: 0,
        inputTokens: 0,
        outputTokens: 0,
        credit: 0,
        cacheHits: 0,
        models: {},
        modelStats: {},
        hours: {}
      };
    }

    const day = this.data.days[today];
    if (!day.modelStats) day.modelStats = {};
    day.requests += 1;
    day.inputTokens += inTok;
    day.outputTokens += outTok;
    day.credit = round3((day.credit || 0) + credit);
    if (cacheHit || cacheHitTokens > 0) day.cacheHits = (day.cacheHits || 0) + 1;
    day.models[model] = (day.models[model] || 0) + 1;

    if (!day.hours[hour]) {
      day.hours[hour] = { requests: 0, tokens: 0, credit: 0 };
    }
    day.hours[hour].requests += 1;
    day.hours[hour].tokens += inTok + outTok;
    day.hours[hour].credit = round3((day.hours[hour].credit || 0) + credit);

    const updateBucket = (bucket) => {
      bucket.requests += 1;
      if (success) bucket.success += 1;
      else bucket.failed += 1;
      bucket.inputTokens += inTok;
      bucket.outputTokens += outTok;
      bucket.cacheHitTokens += cacheHitTokens;
      bucket.cacheMissTokens += cacheMissTokens;
      bucket.cacheWriteTokens += cacheWriteTokens;
      if (hasCredit) {
        bucket.credit = round3((bucket.credit || 0) + credit);
        bucket.creditSamples = (bucket.creditSamples || 0) + 1;
      }
      if (ttfbMs > 0) {
        bucket.ttfbSumMs += ttfbMs;
        bucket.ttfbCount += 1;
      }
      if (durationMs > 0) {
        bucket.latSumMs += durationMs;
        const genMs = durationMs > ttfbMs ? durationMs - ttfbMs : durationMs;
        if (outTok > 0 && genMs > 0) {
          bucket.genSecSum += genMs / 1000;
        }
      }
      bucket.lastSeen = Date.now();
      return bucket;
    };

    const mKey = String(model || 'unknown');
    day.modelStats[mKey] = updateBucket(day.modelStats[mKey] || createEmptyModelBucket());

    // 持久化模型级聚合指标
    if (!this.data.modelStats) this.data.modelStats = {};
    this.data.modelStats[mKey] = updateBucket(this.data.modelStats[mKey] || createEmptyModelBucket());

    // 全局汇总
    this.data.summary.totalRequests += 1;
    if (success) this.data.summary.totalSuccess = (this.data.summary.totalSuccess || 0) + 1;
    else this.data.summary.totalFailed = (this.data.summary.totalFailed || 0) + 1;
    this.data.summary.totalInputTokens += inTok;
    this.data.summary.totalOutputTokens += outTok;
    this.data.summary.totalCredit = round3((this.data.summary.totalCredit || 0) + credit);

    this.save();
  }

  /**
   * 写入一条实时请求流水日志（供控制台实时监控展示）
   */
  addRequestLog(entry) {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const item = {
      id: this.nextLogId++,
      timestamp: Date.now(),
      time: `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`,
      model: entry.model || '-',
      rate: entry.rate || '-',
      mode: entry.mode || 'stream',
      protocol: entry.protocol || 'openai',
      status: entry.status || 200,
      uid: entry.uid ? String(entry.uid).slice(0, 8) : '-',
      account: entry.account || '-',
      realm: entry.realm || '-',
      ttfbMs: Math.round(Number(entry.ttfbMs || 0)),
      durationMs: Math.round(Number(entry.durationMs || 0)),
      promptTokens: Math.round(Number(entry.promptTokens || 0)),
      completionTokens: Math.round(Number(entry.completionTokens || 0)),
      totalTokens: Math.round(Number(entry.promptTokens || 0) + Number(entry.completionTokens || 0)),
      tokensPerSec: Number(entry.tokensPerSec || 0),
      credit: entry.hasCredit ? round3(entry.credit) : null,
      cacheHit: Boolean(entry.cacheHit),
      error: entry.error || ''
    };
    this.recentLogs.unshift(item);
    if (this.recentLogs.length > 100) {
      this.recentLogs.length = 100;
    }
    return item;
  }

  getRecentLogs() {
    return [...this.recentLogs];
  }

  getAvailableDates() {
    const today = this.getTodayKey();
    const keys = Object.keys(this.data.days || {});
    if (!keys.includes(today)) keys.push(today);
    return keys.sort().reverse();
  }

  _buildBreakdown(rawModelStats = {}, modelCatalogMap = null) {
    const list = [];
    for (const [modelId, st] of Object.entries(rawModelStats || {})) {
      const totalTok = (st.inputTokens || 0) + (st.outputTokens || 0);
      const hitDenom = (st.cacheHitTokens || 0) + (st.cacheMissTokens || 0);
      const cacheHitRate = hitDenom > 0 ? Math.round(((st.cacheHitTokens || 0) / hitDenom) * 100) : 0;
      const meta = modelCatalogMap?.get(modelId) || modelCatalogMap?.get(`global:${modelId}`) || modelCatalogMap?.get(`cn:${modelId}`);

      list.push({
        model: modelId,
        rate: meta?.rate || '-',
        multiplier: meta?.multiplier ?? null,
        isFree: Boolean(meta?.isFree),
        requests: st.requests || 0,
        success: st.success || 0,
        failed: st.failed || 0,
        inputTokens: st.inputTokens || 0,
        outputTokens: st.outputTokens || 0,
        totalTokens: totalTok,
        cacheHitTokens: st.cacheHitTokens || 0,
        cacheMissTokens: st.cacheMissTokens || 0,
        cacheHitRate,
        credit: round3(st.credit || 0),
        creditPerReq: st.requests > 0 ? round3((st.credit || 0) / st.requests) : 0,
        costPer1k: totalTok > 0 && st.credit > 0 ? round3((st.credit / totalTok) * 1000) : 0,
        avgTtfbMs: st.ttfbCount > 0 ? Math.round(st.ttfbSumMs / st.ttfbCount) : 0,
        avgLatencyMs: st.requests > 0 ? Math.round((st.latSumMs || 0) / st.requests) : 0,
        tokensPerSec: st.genSecSum > 0.05 ? round2((st.outputTokens || 0) / st.genSecSum) : 0,
        lastSeen: st.lastSeen || 0
      });
    }
    list.sort((a, b) => b.requests - a.requests);
    return list;
  }

  getStats(modelCatalogMap = null, targetDate = '') {
    const today = this.getTodayKey();
    const activeDate = targetDate && this.data.days[targetDate] ? targetDate : today;
    const dayData = this.data.days[activeDate] || {
      requests: 0,
      inputTokens: 0,
      outputTokens: 0,
      credit: 0,
      cacheHits: 0,
      hours: {},
      models: {},
      modelStats: {}
    };

    const dates = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const item = this.data.days[k] || { requests: 0, inputTokens: 0, outputTokens: 0, credit: 0, cacheHits: 0 };
      const totalTokens = item.inputTokens + item.outputTokens;
      const hitRate = item.requests > 0 ? Math.round(((item.cacheHits || 0) / item.requests) * 100) : 0;
      dates.push({
        date: k.slice(5),
        fullDate: k,
        requests: item.requests,
        tokens: totalTokens,
        credit: round3(item.credit || 0),
        hitRate
      });
    }

    const hourly = [];
    for (let h = 0; h < 24; h++) {
      const sh = String(h);
      hourly.push({
        hour: `${sh}时`,
        tokens: dayData.hours?.[sh]?.tokens || 0,
        requests: dayData.hours?.[sh]?.requests || 0,
        credit: round3(dayData.hours?.[sh]?.credit || 0)
      });
    }

    // 若指定了历史日期则按该日统计返回，否则返回全量累计模型 Breakdown
    const modelBreakdown = targetDate
      ? this._buildBreakdown(dayData.modelStats || {}, modelCatalogMap)
      : this._buildBreakdown(this.data.modelStats || {}, modelCatalogMap);

    return {
      activeDate,
      availableDates: this.getAvailableDates(),
      today: {
        requests: dayData.requests,
        inputTokens: dayData.inputTokens,
        outputTokens: dayData.outputTokens,
        totalTokens: dayData.inputTokens + dayData.outputTokens,
        credit: round3(dayData.credit || 0),
        models: dayData.models
      },
      summary: this.data.summary,
      trend7d: dates,
      hourly,
      modelBreakdown,
      recentLogs: this.getRecentLogs()
    };
  }

  /**
   * 重置本地用量统计账本
   */
  reset() {
    this.data = {
      days: {},
      modelStats: {},
      summary: {
        totalRequests: 0,
        totalSuccess: 0,
        totalFailed: 0,
        totalInputTokens: 0,
        totalOutputTokens: 0,
        totalCredit: 0
      }
    };
    this.recentLogs = [];
    this.save();
  }
}

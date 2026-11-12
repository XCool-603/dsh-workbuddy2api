/**
 * scheduler.js - 账号池智能调度引擎、模型级软熔断、Sticky 亲和路由与并发排队
 */

import fs from 'node:fs';
import path from 'node:path';
import { ErrKind } from '../constants.js';
import { runTravelForAccount } from '../upstream/travel.js';
import { claimAllWelfare } from '../upstream/growth.js';
import { performCheckin } from '../upstream/checkin.js';
import { runAllGrowthTasks, runNightCatTask, isCSTNightWindow } from '../upstream/tasks.js';
import { runSchoolActivity } from '../upstream/school.js';
import { getNextMidnightCSTMs } from '../upstream/hint.js';

const STICKY_TTL_MS = 15 * 60 * 1000;
const KEEPALIVE_INTERVAL_MS = 5 * 60 * 1000;
const SCHEDULE_TICK_MS = 60 * 1000;
const TOKEN_REFRESH_WINDOW_MS = 2 * 60 * 60 * 1000;
const WAF_IP_WINDOW_MS = 60 * 1000;
const WAF_IP_THRESHOLD = 2;
const MODEL_BLOCK_BASE_MS = 6 * 3600 * 1000;
const MODEL_BLOCK_MAX_MS = 24 * 3600 * 1000;
const CONSECUTIVE_FAIL_THRESHOLD = 5;
const DEGRADE_COOLDOWN_MS = 300 * 1000;

function stripModelRealm(model = '') {
  return String(model).replace(/^(cn|global|solo|trae):/i, '');
}

function getCSTDateHour() {
  const cst = new Date(Date.now() + 8 * 3600 * 1000);
  return {
    date: cst.toISOString().slice(0, 10),
    hour: cst.getUTCHours(),
    slot: `${cst.toISOString().slice(0, 10)}-${cst.getUTCHours()}`
  };
}

export class WafIPGate {
  constructor(windowMs = WAF_IP_WINDOW_MS, threshold = WAF_IP_THRESHOLD) {
    this.windowMs = windowMs;
    this.threshold = threshold;
    this.hits = new Map(); // uid -> ts
    this.until = 0;
  }

  active(now = Date.now()) {
    return now < this.until;
  }

  noteWaf(uid, now = Date.now()) {
    if (this.active(now)) return true;
    if (uid) this.hits.set(uid, now);
    for (const [k, ts] of this.hits.entries()) {
      if (now - ts > this.windowMs) this.hits.delete(k);
    }
    if (this.hits.size >= this.threshold) {
      this.until = now + this.windowMs;
      this.hits.clear();
      console.warn(`[waf-ip] 60s 内 ${this.threshold}+ 不同账号命中 403，启用 IP 级止损至 ${new Date(this.until).toISOString()}`);
      return true;
    }
    return false;
  }
}

export class DegradeGate {
  constructor() {
    this.until = 0;
  }

  active(now = Date.now()) {
    return now < this.until;
  }

  trigger(now = Date.now()) {
    if (!this.active(now)) {
      this.until = getNextMidnightCSTMs(now);
    }
    return this.until;
  }
}

export class Scheduler {
  constructor(accountStore, options = {}) {
    this.store = accountStore;
    this.client = options.client || null;
    this.configStore = options.configStore || null;
    this.alertManager = options.alertManager || null;
    this.maxInFlightCN = options.maxInFlightCN || 3;
    this.maxInFlightGlobal = options.maxInFlightGlobal || 2;
    this.queueTimeoutMs = options.queueTimeoutMs ?? 5000;

    this.circuitBreakers = new Map(); // uid -> { failures, cooldownUntil, kind, reason }
    this.modelBreakers = new Map();   // `${uid}::${bareModel}` -> { failures, cooldownUntil, kind, reason }
    this.routeModelBreakers = new Map(); // fullOrBareModel -> cooldownUntil (多模型路由级别熔断)
    this.inFlight = new Map();        // uid -> current concurrent count
    this.inFlightRequests = new Map();// reqId -> { id, uid, nickname, realm, model, rate, mode, startedAt }
    this.accountCredits = new Map();  // uid -> { remain, expiringRemain, updatedAt }
    this.stickyMap = new Map();       // `${sessionKey}::${bareModel}` -> { uid, expiresAt }
    this.accountStats = new Map();    // uid -> { successCount, failCount, lastSuccessAt, lastErrorAt, lastErrorMsg, lastModel }
    this.consecutiveFails = new Map(); // uid -> consecutive transient failure count
    this.waiters = [];

    this.wafIPGate = new WafIPGate();
    this.degradeGate = new DegradeGate();
    this._executedScheduleSlots = new Set();

    const dshHome = options.dshHome || accountStore?.dshHome || '';
    this.statePath = options.statePath === false
      ? ''
      : (options.statePath || (dshHome ? path.join(dshHome, '.workbuddy2api-state.json') : ''));
    this._stateSaveTimer = null;
    this._loadState();

    this.autoTimer = null;
    this.scheduleTimer = null;
    this.keepaliveTimer = null;
  }

  _loadState() {
    if (!this.statePath) return;
    try {
      if (!fs.existsSync(this.statePath)) return;
      const raw = JSON.parse(fs.readFileSync(this.statePath, 'utf8'));
      const now = Date.now();
      if (raw.degradeUntil && raw.degradeUntil > now) {
        this.degradeGate.until = Number(raw.degradeUntil);
      }
      if (raw.circuitBreakers && typeof raw.circuitBreakers === 'object') {
        for (const [k, v] of Object.entries(raw.circuitBreakers)) {
          if (v && v.cooldownUntil > now) this.circuitBreakers.set(k, v);
        }
      }
      if (raw.modelBreakers && typeof raw.modelBreakers === 'object') {
        for (const [k, v] of Object.entries(raw.modelBreakers)) {
          if (v && v.cooldownUntil > now) this.modelBreakers.set(k, v);
        }
      }
      if (raw.accountCredits && typeof raw.accountCredits === 'object') {
        for (const [k, v] of Object.entries(raw.accountCredits)) {
          if (v && typeof v === 'object') this.accountCredits.set(k, v);
        }
      }
    } catch (err) {
      console.warn('[scheduler] 读取持久化运行状态异常:', err.message);
    }
  }

  flushState() {
    if (this._stateSaveTimer) {
      clearTimeout(this._stateSaveTimer);
      this._stateSaveTimer = null;
    }
    if (!this.statePath) return;
    try {
      const now = Date.now();
      const circuitBreakers = {};
      for (const [k, v] of this.circuitBreakers.entries()) {
        if (v && v.cooldownUntil > now) circuitBreakers[k] = v;
      }
      const modelBreakers = {};
      for (const [k, v] of this.modelBreakers.entries()) {
        if (v && v.cooldownUntil > now) modelBreakers[k] = v;
      }
      const accountCredits = {};
      for (const [k, v] of this.accountCredits.entries()) {
        accountCredits[k] = v;
      }
      const payload = {
        savedAt: now,
        degradeUntil: this.degradeGate.active(now) ? this.degradeGate.until : 0,
        circuitBreakers,
        modelBreakers,
        accountCredits
      };
      fs.mkdirSync(path.dirname(this.statePath), { recursive: true });
      const tmpPath = `${this.statePath}.tmp`;
      fs.writeFileSync(tmpPath, JSON.stringify(payload, null, 2), 'utf8');
      fs.renameSync(tmpPath, this.statePath);
    } catch (err) {
      console.warn('[scheduler] 保存持久化运行状态异常:', err.message);
    }
  }

  _scheduleSaveState() {
    if (!this.statePath) return;
    if (this._stateSaveTimer) return;
    this._stateSaveTimer = setTimeout(() => {
      this._stateSaveTimer = null;
      this.flushState();
    }, 200);
    if (this._stateSaveTimer.unref) this._stateSaveTimer.unref();
  }

  updateAccountCredits(uid, remain = 0, expiringRemain = 0) {
    if (!uid) return;
    this.accountCredits.set(uid, {
      remain: Number(remain || 0),
      expiringRemain: Number(expiringRemain || 0),
      updatedAt: Date.now()
    });
    this._scheduleSaveState();
  }

  beginInFlight(reqId, info) {
    if (!reqId) return;
    this.inFlightRequests.set(reqId, {
      id: reqId,
      ...info,
      startedAt: Date.now()
    });
  }

  endInFlight(reqId) {
    if (!reqId) return;
    this.inFlightRequests.delete(reqId);
  }

  getInFlightRequests() {
    const now = Date.now();
    return [...this.inFlightRequests.values()].map((r) => ({
      ...r,
      elapsedMs: now - (r.startedAt || now)
    }));
  }

  _getLimits() {
    const cfg = this.configStore ? this.configStore.getAll() : null;
    return {
      maxInFlightCN: cfg?.maxInFlightCN || this.maxInFlightCN,
      maxInFlightGlobal: cfg?.maxInFlightGlobal || this.maxInFlightGlobal,
      queueTimeoutMs: cfg?.queueTimeoutMs ?? this.queueTimeoutMs
    };
  }

  getLimitForAccount(account) {
    const { maxInFlightCN, maxInFlightGlobal } = this._getLimits();
    return account?.auth?.realm === 'global' ? maxInFlightGlobal : maxInFlightCN;
  }

  getInFlight(uid) {
    return this.inFlight.get(uid) || 0;
  }

  isCoolingDown(uid, model = '') {
    const now = Date.now();
    const cb = this.circuitBreakers.get(uid);
    if (cb && now < cb.cooldownUntil) {
      return true;
    }
    if (model) {
      const bare = stripModelRealm(model);
      const mb = this.modelBreakers.get(`${uid}::${bare}`);
      if (mb && now < mb.cooldownUntil) {
        return true;
      }
    }
    return false;
  }

  isAccountUnavailable(acc) {
    if (!acc) return true;
    return typeof this.store?.isAccountUnavailable === 'function'
      ? this.store.isAccountUnavailable(acc)
      : Boolean(acc.disabled || acc.manualDisabled);
  }

  tripRouteModel(modelId, ttlMs = 60000) {
    if (!modelId) return;
    this.routeModelBreakers.set(String(modelId), Date.now() + ttlMs);
  }

  isRouteModelCooling(modelId) {
    if (!modelId) return false;
    const until = this.routeModelBreakers.get(String(modelId)) || 0;
    if (Date.now() < until) return true;
    if (until > 0) this.routeModelBreakers.delete(String(modelId));
    return false;
  }

  /**
   * 申请账号槽位租约
   */
  acquire(account) {
    if (this.isAccountUnavailable(account)) return false;
    const uid = account.account?.uid;
    if (!uid) return false;
    const current = this.inFlight.get(uid) || 0;
    const limit = this.getLimitForAccount(account);
    if (current >= limit) {
      return false;
    }
    this.inFlight.set(uid, current + 1);
    return true;
  }

  /**
   * 释放账号槽位租约并唤醒排队等待者
   */
  release(account) {
    if (!account) return;
    const uid = account.account?.uid;
    if (!uid) return;
    const current = this.inFlight.get(uid) || 0;
    if (current <= 1) {
      this.inFlight.delete(uid);
    } else {
      this.inFlight.set(uid, current - 1);
    }
    this._notifyWaiters();
  }

  _notifyWaiters() {
    if (this.waiters.length === 0) return;
    // 唤醒所有正在排队的等待者，各自重新竞争调度槽位
    const pending = this.waiters.splice(0, this.waiters.length);
    for (const w of pending) {
      clearTimeout(w.timer);
      w.resolve(true);
    }
  }

  /**
   * 当候选账号仅因并发饱和无法取得槽位时，进入短时 FIFO 等待队列
   */
  acquireWithQueue(candidatesFn, timeoutMs = 5000) {
    const candidates = candidatesFn();
    for (const acc of candidates) {
      if (this.acquire(acc)) {
        return Promise.resolve(acc);
      }
    }
    if (!timeoutMs || timeoutMs <= 0) {
      return Promise.resolve(null);
    }

    const deadline = Date.now() + timeoutMs;
    return new Promise((resolve) => {
      const tryOnce = () => {
        const latest = candidatesFn();
        for (const acc of latest) {
          if (this.acquire(acc)) {
            resolve(acc);
            return;
          }
        }
        const remaining = deadline - Date.now();
        if (remaining <= 0) {
          resolve(null);
          return;
        }
        const waiter = {
          resolve: () => tryOnce(),
          timer: setTimeout(() => {
            const idx = this.waiters.indexOf(waiter);
            if (idx !== -1) this.waiters.splice(idx, 1);
            resolve(null);
          }, remaining)
        };
        if (waiter.timer.unref) waiter.timer.unref();
        this.waiters.push(waiter);
      };
      tryOnce();
    });
  }

  _getOrCreateStats(uid) {
    let st = this.accountStats.get(uid);
    if (!st) {
      st = {
        successCount: 0,
        failCount: 0,
        lastSuccessAt: null,
        lastErrorAt: null,
        lastErrorMsg: '',
        lastModel: ''
      };
      this.accountStats.set(uid, st);
    }
    return st;
  }

  /**
   * 记录调用成功，重置对应熔断器与连续失败计数并更新统计
   */
  recordSuccess(account, model = '') {
    const uid = account?.account?.uid;
    if (!uid) return;
    const hadCb = this.circuitBreakers.delete(uid);
    const hadMb = model ? this.modelBreakers.delete(`${uid}::${stripModelRealm(model)}`) : false;
    this.consecutiveFails.delete(uid);
    const st = this._getOrCreateStats(uid);
    st.successCount += 1;
    st.lastSuccessAt = Date.now();
    if (model) st.lastModel = stripModelRealm(model);
    if (hadCb || hadMb) {
      this._scheduleSaveState();
    }
  }

  /**
   * 记录瞬态失败（5 次连续未知/传输错误触发 300s 固定临时降级，不叠加延长已有冷却，对齐 Go pool/degrade.go）
   */
  noteTransientFailure(uid, kind = 'transient', message = '') {
    if (!uid) return false;
    const next = (this.consecutiveFails.get(uid) || 0) + 1;
    this.consecutiveFails.set(uid, next);
    if (next < CONSECUTIVE_FAIL_THRESHOLD) {
      console.warn(`[degrade] 账号 ${uid} 瞬态异常 (${next}/${CONSECUTIVE_FAIL_THRESHOLD}, ${kind}): ${message}`);
      return false;
    }
    const now = Date.now();
    const prev = this.circuitBreakers.get(uid);
    if (prev && now < prev.cooldownUntil) {
      // 已处于冷却期间则不延长 cooldownUntil
      return false;
    }
    this.consecutiveFails.delete(uid);
    this.circuitBreakers.set(uid, {
      failures: next,
      cooldownUntil: now + DEGRADE_COOLDOWN_MS,
      kind: kind || 'degraded',
      reason: `连续 ${next} 次瞬态异常降级 ${DEGRADE_COOLDOWN_MS / 1000}s: ${message}`
    });
    this._scheduleSaveState();
    console.warn(`[degrade] 账号 ${uid} 连续 ${next} 次异常，触发固定 ${DEGRADE_COOLDOWN_MS / 1000}s 临时降级: ${message}`);
    return true;
  }

  /**
   * 记录调用异常，按错误类型分流进入模型级软熔断或账号级熔断
   */
  recordFailure(account, kind, message = '', model = '') {
    const uid = account?.account?.uid;
    if (!uid) return;

    const bareModel = stripModelRealm(model);
    const st = this._getOrCreateStats(uid);
    st.failCount += 1;
    st.lastErrorAt = Date.now();
    st.lastErrorMsg = message;
    if (bareModel) st.lastModel = bareModel;

    // 请求侧内容违规、图片无效或参数问题，属于客户端请求特征，不施加账号或模型熔断
    if (
      kind === ErrKind.CONTENT_BLOCKED ||
      kind === ErrKind.BAD_PARAMS ||
      kind === ErrKind.PROMPT_TOO_LONG ||
      kind === ErrKind.IMAGE_INVALID
    ) {
      return;
    }

    // 11102 模型不存在 / 不支持该后端：按 (账号, 模型) 指数退避 6h -> 12h -> 24h
    if (bareModel && kind === ErrKind.MODEL_BLOCKED) {
      const mKey = `${uid}::${bareModel}`;
      const prev = this.modelBreakers.get(mKey) || { failures: 0, cooldownUntil: 0, kind: '', reason: '' };
      const hits = prev.failures + 1;
      const ttl = Math.min(MODEL_BLOCK_MAX_MS, MODEL_BLOCK_BASE_MS * Math.pow(2, Math.min(hits - 1, 2)));
      this.modelBreakers.set(mKey, {
        failures: hits,
        cooldownUntil: Date.now() + ttl,
        kind,
        reason: `11102 ${message}`
      });
      this._scheduleSaveState();
      console.warn(`[scheduler] 账号 ${uid} 模型 [${bareModel}] 11102 后端不支持，负缓存 ${Math.round(ttl / 3600000)}h`);
      return;
    }

    // 模型级软熔断：仅隔离当前账号下的特定模型，避免误杀其他可用模型
    if (
      bareModel &&
      (kind === ErrKind.NOT_FOUND || kind === ErrKind.SOFT_RATE || kind === ErrKind.SERVER)
    ) {
      const mKey = `${uid}::${bareModel}`;
      const mb = this.modelBreakers.get(mKey) || { failures: 0, cooldownUntil: 0, kind: '', reason: '' };
      mb.failures += 1;
      mb.kind = kind;
      mb.reason = message;

      let cooldownMs = 45000;
      if (kind === ErrKind.NOT_FOUND) {
        cooldownMs = 15 * 60 * 1000;
      } else if (kind === ErrKind.SOFT_RATE) {
        cooldownMs = Math.min(30000 * Math.pow(2, mb.failures - 1), 10 * 60 * 1000);
      } else if (kind === ErrKind.SERVER) {
        cooldownMs = Math.min(30000 * mb.failures, 180000);
      }

      mb.cooldownUntil = Date.now() + cooldownMs;
      this.modelBreakers.set(mKey, mb);
      this._scheduleSaveState();
      console.warn(`[scheduler] 账号 ${uid} 模型 [${bareModel}] 触发模型级软熔断 (${kind}), 冷却 ${Math.round(cooldownMs / 1000)}s: ${message}`);
      return;
    }

    // 未知/传输/客户端瞬态异常走 NoteFailures 连续 5 次阈值保护，不立刻踢出账号池
    if (!kind || kind === ErrKind.CLIENT || kind === 'unknown' || kind === 'network') {
      this.noteTransientFailure(uid, kind || 'transient', message);
      return;
    }

    // 账号级熔断
    this.consecutiveFails.delete(uid);
    const cb = this.circuitBreakers.get(uid) || { failures: 0, cooldownUntil: 0, kind: '', reason: '' };
    cb.failures += 1;
    cb.kind = kind;
    cb.reason = message;

    let cooldownMs = 60000;
    const acc = this.store.get(uid);
    const nick = acc?.account?.nickname || uid;

    switch (kind) {
      case ErrKind.SOFT_RATE:
        cooldownMs = Math.min(30000 * Math.pow(2, cb.failures - 1), 600000);
        break;
      case ErrKind.HARD_CREDIT:
        cooldownMs = 1800000;
        break;
      case ErrKind.SESSION_DEAD:
        cooldownMs = 7200000;
        this.alertManager?.notifyAuthFailed(uid, nick, message);
        if (cb.failures >= 2 && typeof this.store.setAutoDisabled === 'function') {
          this.store.setAutoDisabled(uid, true, `凭证失效(401/12153): ${String(message).slice(0, 80)}`);
          this.alertManager?.notifyBan(uid, nick, '连续 401/12153 会话失效自动禁用');
        }
        break;
      case ErrKind.ACCOUNT_FAULT:
        cooldownMs = 43200000;
        if (typeof this.store.setAutoDisabled === 'function') {
          this.store.setAutoDisabled(uid, true, `账号异常(11140): ${String(message).slice(0, 80)}`);
        }
        this.alertManager?.notifyBan(uid, nick, message);
        break;
      case ErrKind.WAF_BLOCK:
        cooldownMs = 180000;
        this.wafIPGate.noteWaf(uid);
        break;
      default:
        cooldownMs = 45000;
    }

    cb.cooldownUntil = Date.now() + cooldownMs;
    this.circuitBreakers.set(uid, cb);
    this._scheduleSaveState();
    console.warn(`[scheduler] 账号 ${uid} 触发账号级熔断保护 (${kind}), 冷却时长 ${Math.round(cooldownMs / 1000)}s: ${message}`);
  }

  /**
   * 免费模型额度耗尽触发的模型级精准墙钟冷却（对齐 quota.reset_at 或次日 00:00 CST，上限 24h）
   */
  cooldownFreeQuotaModel(uid, resetAtMs = 0, model = '', reason = '') {
    const bare = stripModelRealm(model);
    if (!uid || !bare) return;
    const now = Date.now();
    const maxCap = now + 24 * 3600 * 1000;
    let until = resetAtMs && resetAtMs > now ? resetAtMs : getNextMidnightCSTMs(now);
    if (until > maxCap) until = maxCap;

    this.modelBreakers.set(`${uid}::${bare}`, {
      failures: 1,
      cooldownUntil: until,
      resetAt: until,
      kind: ErrKind.SOFT_RATE,
      reason: reason || 'free_quota_exhausted'
    });
    this._scheduleSaveState();
    console.warn(`[free-guard] 账号 ${uid} 免费模型 [${bare}] 额度耗尽，模型级锁定至 ${new Date(until).toISOString()}`);
  }

  /**
   * 当巡检发现账号重新获得有效积分余额（remain > 0）时自动解除积分不足引发的冷却/自动禁用（绝不覆盖 manualDisabled）
   */
  reenableIfCredits(uid, remain = 0) {
    if (!uid || Number(remain || 0) <= 0) return false;
    const acc = this.store.get(uid);
    if (!acc || acc.manualDisabled) return false;

    let changed = false;
    if (
      acc.disabled &&
      /credit|余额|11111|11112|402|quota/i.test(acc.disabledReason || '') &&
      typeof this.store.reviveAccount === 'function'
    ) {
      this.store.reviveAccount(uid);
      changed = true;
    }
    const cb = this.circuitBreakers.get(uid);
    if (cb && (cb.kind === ErrKind.HARD_CREDIT || /credit|余额|11111|11112|quota/i.test(cb.reason || ''))) {
      this.circuitBreakers.delete(uid);
      changed = true;
    }
    if (changed) {
      this._scheduleSaveState();
      console.log(`[scheduler] 账号 ${uid} 检测到可用余额 (${remain})，已自动解除积分冷却`);
    }
    return changed;
  }

  /**
   * 清除单个账号的账号级与模型级冷却状态
   */
  clearCooldown(uid) {
    if (!uid) return false;
    let cleared = this.circuitBreakers.delete(uid);
    this.consecutiveFails.delete(uid);
    const prefix = `${uid}::`;
    for (const key of this.modelBreakers.keys()) {
      if (key.startsWith(prefix)) {
        this.modelBreakers.delete(key);
        cleared = true;
      }
    }
    if (cleared) this._scheduleSaveState();
    return cleared;
  }

  /**
   * 一键清除所有账号及模型冷却状态
   */
  clearAllCooldowns() {
    const count = this.circuitBreakers.size + this.modelBreakers.size + this.routeModelBreakers.size;
    this.circuitBreakers.clear();
    this.modelBreakers.clear();
    this.routeModelBreakers.clear();
    this.consecutiveFails.clear();
    if (count > 0) this._scheduleSaveState();
    return count;
  }

  getCountsDetailed(realmFilter = null) {
    const now = Date.now();
    const list = this.store.getAll().filter((a) => !realmFilter || (a.auth?.realm || 'cn') === realmFilter);
    let total = 0;
    let healthy = 0;
    let cooling = 0;
    let disabled = 0;
    let manualDisabled = 0;
    let inFlightFull = 0;

    for (const acc of list) {
      total++;
      if (acc.manualDisabled) manualDisabled++;
      if (acc.disabled || acc.manualDisabled) {
        disabled++;
        continue;
      }
      const cb = this.circuitBreakers.get(acc.account.uid);
      if (cb && now < cb.cooldownUntil) {
        cooling++;
        continue;
      }
      if (this.getInFlight(acc.account.uid) >= this.getLimitForAccount(acc)) {
        inFlightFull++;
        continue;
      }
      healthy++;
    }
    return { total, healthy, cooling, disabled, manualDisabled, inFlightFull };
  }

  getPoolDiagnostics(bareModel = '', targetRealm = null) {
    const now = Date.now();
    const list = this.store.getAll().filter((a) => !targetRealm || (a.auth?.realm || 'cn') === targetRealm);
    let earliestResetAt = 0;
    let rateLimitedCount = 0;
    let disabledCount = 0;
    let busyCount = 0;

    for (const acc of list) {
      if (this.isAccountUnavailable(acc)) {
        disabledCount++;
        continue;
      }
      const uid = acc.account.uid;
      const cb = this.circuitBreakers.get(uid);
      const mb = bareModel ? this.modelBreakers.get(`${uid}::${stripModelRealm(bareModel)}`) : null;
      const coolingUntil = Math.max(cb && now < cb.cooldownUntil ? cb.cooldownUntil : 0, mb && now < mb.cooldownUntil ? mb.cooldownUntil : 0);
      if (coolingUntil > 0) {
        rateLimitedCount++;
        if (!earliestResetAt || coolingUntil < earliestResetAt) earliestResetAt = coolingUntil;
        continue;
      }
      if (this.getInFlight(uid) >= this.getLimitForAccount(acc)) {
        busyCount++;
      }
    }

    const isRateLimited = list.length > 0 && rateLimitedCount > 0 && rateLimitedCount + disabledCount >= list.length;
    return {
      total: list.length,
      disabled: disabledCount,
      rateLimited: rateLimitedCount,
      inFlightFull: busyCount,
      isRateLimited,
      earliestResetAt,
      retryAfterSec: earliestResetAt > now ? Math.ceil((earliestResetAt - now) / 1000) : 0,
      summary: `total=${list.length} disabled=${disabledCount} cooling=${rateLimitedCount} busy=${busyCount}`
    };
  }

  /**
   * 获取账号运行期诊断信息
   */
  getAccountDiagnostics(uid) {
    const acc = this.store.get(uid);
    const now = Date.now();
    const cb = this.circuitBreakers.get(uid);
    const coolingDown = !!(cb && now < cb.cooldownUntil);

    const modelCooldowns = [];
    const prefix = `${uid}::`;
    for (const [key, mb] of this.modelBreakers.entries()) {
      if (key.startsWith(prefix) && now < mb.cooldownUntil) {
        modelCooldowns.push({
          model: key.slice(prefix.length),
          kind: mb.kind,
          reason: mb.reason,
          cooldownUntil: mb.cooldownUntil,
          remainingSec: Math.ceil((mb.cooldownUntil - now) / 1000)
        });
      }
    }

    return {
      uid,
      disabled: !!acc?.disabled,
      disabledReason: acc?.disabledReason || '',
      manualDisabled: !!acc?.manualDisabled,
      manualDisabledReason: acc?.manualDisabledReason || '',
      inFlight: this.getInFlight(uid),
      limit: acc ? this.getLimitForAccount(acc) : this.maxInFlightCN,
      coolingDown,
      cooldownUntil: coolingDown ? cb.cooldownUntil : 0,
      cooldownRemainingSec: coolingDown ? Math.ceil((cb.cooldownUntil - now) / 1000) : 0,
      kind: coolingDown ? cb.kind : '',
      reason: coolingDown ? cb.reason : '',
      failures: cb?.failures || 0,
      modelCooldowns,
      stats: { ...this._getOrCreateStats(uid) }
    };
  }

  _getStickyUid(sessionKey, bareModel) {
    if (!sessionKey) return null;
    const key = `${sessionKey}::${bareModel || ''}`;
    const entry = this.stickyMap.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.stickyMap.delete(key);
      return null;
    }
    return entry.uid;
  }

  _setStickyUid(sessionKey, bareModel, uid) {
    if (!sessionKey || !uid) return;
    if (this.stickyMap.size > 2000) {
      const now = Date.now();
      for (const [k, v] of this.stickyMap.entries()) {
        if (now > v.expiresAt) this.stickyMap.delete(k);
      }
      if (this.stickyMap.size > 2000) {
        this.stickyMap.clear();
      }
    }
    this.stickyMap.set(`${sessionKey}::${bareModel || ''}`, {
      uid,
      expiresAt: Date.now() + STICKY_TTL_MS
    });
  }

  /**
   * 选出当前最佳可用账号候选序列（跳过手动/自动停用账号，融合 Sticky 亲和性、熔断状态与并发度）
   */
  pickCandidates(targetRealm = null, options = {}) {
    const accounts = this.store.getAll().filter((a) => !this.isAccountUnavailable(a));
    if (accounts.length === 0) return [];

    const now = Date.now();
    const bareModel = stripModelRealm(options.bareModel || '');
    const stickyUid = this._getStickyUid(options.sessionKey, bareModel);

    let maxRemain = 0;
    for (const acc of accounts) {
      const c = this.accountCredits.get(acc.account.uid);
      if (c && c.remain > maxRemain) maxRemain = c.remain;
    }

    const scored = accounts.map((acc) => {
      const uid = acc.account.uid;
      const isGlobal = acc.auth?.realm === 'global';
      const realm = isGlobal ? 'global' : 'cn';
      const inFlight = this.inFlight.get(uid) || 0;
      const limit = this.getLimitForAccount(acc);

      let penalty = 0;

      // 1. 账号级冷却重罚
      const cb = this.circuitBreakers.get(uid);
      if (cb && now < cb.cooldownUntil) {
        penalty += 100000;
      }

      // 2. 模型级软熔断重罚
      if (bareModel) {
        const mb = this.modelBreakers.get(`${uid}::${bareModel}`);
        if (mb && now < mb.cooldownUntil) {
          penalty += 80000;
        }
      }

      // 3. 槽位已满惩罚
      if (inFlight >= limit) {
        penalty += 50000;
      }

      // 4. 在途请求惩罚
      penalty += inFlight * 1000;

      // 5. 目标域偏好匹配
      if (targetRealm && targetRealm !== realm) {
        penalty += 5000;
      }

      // 6. Sticky 会话亲和奖励（保持 prompt cache 命中）
      if (stickyUid && uid === stickyUid) {
        penalty -= 500;
      }

      // 7. 三因子余额与快过期积分加权：优先消耗快过期积分，平衡池内积分比例
      const creditInfo = this.accountCredits.get(uid);
      if (creditInfo && creditInfo.remain > 0) {
        if (maxRemain > 0) {
          penalty -= (creditInfo.remain / maxRemain) * 120;
        }
        if (creditInfo.expiringRemain > 0) {
          const expRatio = Math.min(1, creditInfo.expiringRemain / creditInfo.remain);
          penalty -= expRatio * 180;
        }
      }

      // 8. 优先活跃账号微调
      if (uid === this.store.activeUid) {
        penalty -= 50;
      }

      return { account: acc, score: penalty };
    });

    scored.sort((a, b) => a.score - b.score);
    return scored.map((s) => s.account);
  }

  /**
   * 执行带模型级软熔断、并发排队与自动轮换的请求执行流
   */
  async executeWithFailover(model, reqFn, options = {}) {
    const rawModel = String(model || '');
    const targetRealm = rawModel.startsWith('global:') ? 'global' : rawModel.startsWith('cn:') ? 'cn' : null;
    const bareModel = stripModelRealm(rawModel);
    const { queueTimeoutMs } = this._getLimits();
    const waitMs = options.queueTimeoutMs ?? queueTimeoutMs;

    const allEnabled = this.store.getAll().filter((a) => !this.isAccountUnavailable(a));
    if (allEnabled.length === 0) {
      throw new Error('当前无可用启用账号，请在设置中添加或启用至少一个 WorkBuddy / CodeBuddy 账号');
    }

    if (this.wafIPGate.active()) {
      const wafErr = new Error('waf ip-level block: upstream firewall is blocking the gateway IP, rotation stopped');
      wafErr.status = 403;
      wafErr.kind = ErrKind.WAF_BLOCK;
      wafErr.code = 'waf_ip_blocked';
      throw wafErr;
    }

    const pickOpts = { sessionKey: options.sessionKey, bareModel };
    let candidates = this.pickCandidates(targetRealm, pickOpts);
    let lastError = null;
    const attempted = new Set();

    const tryAccount = async (account) => {
      attempted.add(account.account.uid);
      try {
        const result = await reqFn(account);

        if (result && result.ok === false) {
          this.recordFailure(account, result.kind, result.message, bareModel);
          this.release(account);
          const err = new Error(result.message);
          err.status = result.status;
          err.kind = result.kind;
          err.nonRetryable = (
            result.kind === ErrKind.CONTENT_BLOCKED ||
            result.kind === ErrKind.BAD_PARAMS ||
            result.kind === ErrKind.PROMPT_TOO_LONG ||
            result.kind === ErrKind.IMAGE_INVALID
          );
          if (err.nonRetryable) {
            throw err;
          }
          if (result.kind === ErrKind.WAF_BLOCK && this.wafIPGate.active()) {
            err.code = 'waf_ip_blocked';
            throw err;
          }
          if (
            result.kind === ErrKind.SOFT_RATE ||
            result.kind === ErrKind.HARD_CREDIT ||
            result.kind === ErrKind.SESSION_DEAD ||
            result.kind === ErrKind.NOT_FOUND ||
            result.kind === ErrKind.MODEL_BLOCKED ||
            result.kind === ErrKind.ACCOUNT_FAULT ||
            result.kind === ErrKind.WAF_BLOCK ||
            result.kind === ErrKind.SERVER
          ) {
            lastError = err;
            console.log(`[scheduler] 账号 ${account.account.uid} [${bareModel || rawModel}] 遇 ${result.kind}，自动切换下一个账号...`);
            return null;
          }
          throw err;
        }

        if (result?.degradedTriggered) {
          this.degradeGate.trigger();
        }
        this.recordSuccess(account, bareModel);
        if (options.sessionKey) {
          this._setStickyUid(options.sessionKey, bareModel, account.account.uid);
        }
        return {
          ...result,
          account,
          release: () => this.release(account)
        };
      } catch (err) {
        if (err.nonRetryable) {
          this.release(account);
          throw err;
        }
        const errKind = err.kind || ErrKind.CLIENT;
        this.recordFailure(account, errKind, err.message, bareModel);
        this.release(account);
        lastError = err;
        if (err.code === 'waf_ip_blocked') throw err;
        console.warn(`[scheduler] 账号 ${account.account.uid} 调用异常 (${errKind})，尝试容灾轮换:`, err.message);
        return null;
      }
    };

    for (const account of candidates) {
      if (this.wafIPGate.active()) break;
      if (!this.acquire(account)) {
        continue;
      }
      const res = await tryAccount(account);
      if (res) return res;
    }

    // 若尚未尝试任何账号（说明未冷却账号全部并发占满），尝试进入并发等待队列
    if (attempted.size === 0 && waitMs > 0) {
      const queuedAcc = await this.acquireWithQueue(() => {
        return this.pickCandidates(targetRealm, pickOpts).filter(
          (a) => !this.isCoolingDown(a.account.uid, bareModel)
        );
      }, waitMs);

      if (queuedAcc) {
        const res = await tryAccount(queuedAcc);
        if (res) return res;
      }
    }

    const diag = this.getPoolDiagnostics(bareModel, targetRealm);
    if (diag.isRateLimited) {
      this.alertManager?.notifyAllCooling(targetRealm || 'all', bareModel || rawModel);
      const err = lastError || new Error('rate limited: all accounts are cooling down');
      if (!err.status || err.status >= 500) err.status = 429;
      if (diag.retryAfterSec > 0) err.retryAfterSec = diag.retryAfterSec;
      throw err;
    }

    throw lastError || new Error('所有可用账号均并发占满或处于冷却保护期，请稍后重试');
  }

  /**
   * 批量刷新全部账号 Token（主动续期）
   */
  async refreshAllTokens(onlyExpiringSoon = false) {
    if (!this.client) {
      return { total: 0, refreshed: 0, skipped: 0, failed: 0, results: [] };
    }
    const accounts = this.store.getAll();
    const now = Date.now();
    let refreshed = 0;
    let skipped = 0;
    let failed = 0;
    const results = [];

    for (const acc of accounts) {
      const uid = acc.account?.uid;
      if (!acc.auth?.refreshToken) {
        skipped++;
        results.push({ uid, status: 'skipped', reason: 'no_refresh_token' });
        continue;
      }
      const expAt = acc.auth?.expiresAt || 0;
      if (onlyExpiringSoon && expAt > 0 && expAt - now > TOKEN_REFRESH_WINDOW_MS) {
        skipped++;
        results.push({ uid, status: 'skipped', reason: 'still_fresh' });
        continue;
      }
      try {
        await this.client.refreshToken(acc);
        this.store.upsert(acc);
        // 若此前因凭证失效处于冷却，立即恢复可用
        const cb = this.circuitBreakers.get(uid);
        if (cb && cb.kind === ErrKind.SESSION_DEAD) {
          this.circuitBreakers.delete(uid);
        }
        refreshed++;
        results.push({ uid, status: 'refreshed' });
      } catch (err) {
        failed++;
        results.push({ uid, status: 'failed', error: err.message });
      }
      await new Promise((r) => setTimeout(r, 300));
    }

    return { total: accounts.length, refreshed, skipped, failed, results };
  }

  /**
   * 保活巡检：仅刷新即将过期（2 小时内）或缺失过期时间的账号
   */
  async refreshKeepalive() {
    return this.refreshAllTokens(true);
  }

  /**
   * 对所有国内账号批量巡检猫猫旅行（领养、领奖、派出）
   */
  async runAllTravel() {
    const accounts = this.store.getAll().filter((a) => !a.disabled && a.auth?.realm !== 'global');
    const results = [];
    for (const acc of accounts) {
      try {
        const res = await runTravelForAccount(acc);
        results.push({ uid: acc.account.uid, nickname: acc.account.nickname, ...res });
      } catch (err) {
        results.push({ uid: acc.account.uid, nickname: acc.account.nickname, status: 'error', error: err.message });
      }
      await new Promise((r) => setTimeout(r, 800));
    }
    return results;
  }

  /**
   * 对全量账号批量吃满全套福利（签到+活跃+礼包+补偿+猫猫+连登+抽奖）
   */
  async runAllWelfare() {
    const accounts = this.store.getAll().filter((a) => !a.disabled);
    const results = [];
    for (const acc of accounts) {
      try {
        const res = await claimAllWelfare(acc);
        results.push({ uid: acc.account.uid, nickname: acc.account.nickname, ...res });
      } catch (err) {
        results.push({ uid: acc.account.uid, nickname: acc.account.nickname, status: 'error', error: err.message });
      }
      await new Promise((r) => setTimeout(r, 1000));
    }
    return results;
  }

  /**
   * 对全量账号批量执行每日签到
   */
  async runAllSignin() {
    const accounts = this.store.getAll().filter((a) => !a.disabled);
    const results = [];
    for (const acc of accounts) {
      try {
        const res = await performCheckin(acc);
        results.push({ uid: acc.account.uid, nickname: acc.account.nickname, ...res });
      } catch (err) {
        results.push({ uid: acc.account.uid, nickname: acc.account.nickname, ok: false, error: err.message });
      }
      await new Promise((r) => setTimeout(r, 500));
    }
    return results;
  }

  /**
   * 对所有国内账号批量执行全量成长任务与活动领奖
   */
  async runAllTasks() {
    const accounts = this.store.getAll().filter((a) => !a.disabled && a.auth?.realm !== 'global');
    const results = [];
    for (const acc of accounts) {
      try {
        const res = await runAllGrowthTasks(acc);
        results.push({ uid: acc.account.uid, nickname: acc.account.nickname, ok: true, result: res });
      } catch (err) {
        results.push({ uid: acc.account.uid, nickname: acc.account.nickname, ok: false, error: err.message });
      }
      await new Promise((r) => setTimeout(r, 800));
    }
    return results;
  }

  /**
   * 对所有国内账号批量执行开学季活动（领任务 + 自动点灯 + 领积分 + 大转盘抽奖，保留手动停用账号参与）
   */
  async runAllSchool(options = {}) {
    const accounts = this.store.getAll().filter((a) => !a.disabled && a.auth?.realm !== 'global');
    const results = [];
    for (const acc of accounts) {
      try {
        const res = await runSchoolActivity(acc, options);
        results.push({ uid: acc.account.uid, nickname: acc.account.nickname, ...res });
      } catch (err) {
        results.push({ uid: acc.account.uid, nickname: acc.account.nickname, ok: false, error: err.message });
      }
      await new Promise((r) => setTimeout(r, 800));
    }
    return results;
  }

  /**
   * 对所有国内账号在 CST 23:00-08:00 窗口批量执行「深夜猫猫 / black_cat」任务
   */
  async runAllNightCat(now = new Date()) {
    if (!isCSTNightWindow(now)) {
      return [];
    }
    const accounts = this.store.getAll().filter((a) => !a.disabled && a.auth?.realm !== 'global');
    const results = [];
    for (const acc of accounts) {
      try {
        const res = await runNightCatTask(acc);
        results.push({ uid: acc.account.uid, nickname: acc.account.nickname, ...res });
      } catch (err) {
        results.push({ uid: acc.account.uid, nickname: acc.account.nickname, ok: false, error: err.message });
      }
      await new Promise((r) => setTimeout(r, 500));
    }
    return results;
  }

  async _runScheduledHourTick() {
    const cfg = this.configStore ? this.configStore.getAll() : {};
    const sched = cfg.schedule || {};
    const { hour, slot } = getCSTDateHour();

    const oncePerSlot = (tag, fn) => {
      const key = `${tag}:${slot}`;
      if (this._executedScheduleSlots.has(key)) return;
      this._executedScheduleSlots.add(key);
      if (this._executedScheduleSlots.size > 200) {
        const first = this._executedScheduleSlots.keys().next().value;
        this._executedScheduleSlots.delete(first);
      }
      Promise.resolve().then(fn).catch((e) => console.warn(`[scheduler] 定时排程(${tag})异常:`, e.message));
    };

    if (sched.checkinEnabled !== false && cfg.autoCheckin !== false && (sched.checkinHours || [9, 21]).includes(hour)) {
      oncePerSlot('checkin', () => this.runAllWelfare());
    }
    if (sched.travelEnabled !== false && cfg.autoTravel !== false && (sched.travelHours || [9, 21]).includes(hour)) {
      oncePerSlot('travel', () => this.runAllTravel());
    }
    if (sched.tasksEnabled !== false && cfg.autoTasks !== false && (sched.tasksHours || [11]).includes(hour)) {
      oncePerSlot('tasks', () => this.runAllTasks());
    }
    if (sched.schoolEnabled !== false && (sched.schoolHours || [12]).includes(hour)) {
      oncePerSlot('school', () => this.runAllSchool());
    }
    if (sched.catEnabled !== false && (sched.catHours || [1]).includes(hour) && isCSTNightWindow()) {
      oncePerSlot('nightcat', () => this.runAllNightCat());
    }
    if (sched.keepaliveEnabled !== false && cfg.autoRefreshToken !== false && (sched.keepaliveHours || [22]).includes(hour)) {
      oncePerSlot('keepalive', () => this.refreshAllTokens(false));
    }
  }

  /**
   * 启动后台自动化排程任务（定时小时排程 + 保活刷新 + 兜底巡检 + auths 热监听）
   */
  startAutoRoutines(intervalMs = 2 * 60 * 60 * 1000) {
    this.store?.startAuthDirWatch?.(5000);

    if (!this.scheduleTimer) {
      this.scheduleTimer = setInterval(() => {
        this._runScheduledHourTick().catch(() => {});
      }, SCHEDULE_TICK_MS);
      if (this.scheduleTimer.unref) this.scheduleTimer.unref();
    }

    if (!this.autoTimer) {
      console.log(`[scheduler] 启动后台自动化排程：定时整点任务与 Token 保活 (兜底巡检 ${Math.round(intervalMs / 60000)} 分钟)`);
      this.autoTimer = setInterval(async () => {
        const cfg = this.configStore ? this.configStore.getAll() : {};
        try {
          if (cfg.autoCheckin !== false) {
            await this.runAllWelfare();
          } else if (cfg.autoTravel !== false) {
            await this.runAllTravel();
          }
        } catch (e) {
          console.warn('[scheduler] 自动福利/旅行巡检异常:', e.message);
        }
      }, intervalMs);
      if (this.autoTimer.unref) this.autoTimer.unref();
    }

    if (!this.keepaliveTimer) {
      this.keepaliveTimer = setInterval(async () => {
        const cfg = this.configStore ? this.configStore.getAll() : {};
        if (cfg.autoRefreshToken === false) return;
        try {
          await this.refreshKeepalive();
        } catch (e) {
          console.warn('[scheduler] Token 保活刷新异常:', e.message);
        }
      }, KEEPALIVE_INTERVAL_MS);
      if (this.keepaliveTimer.unref) this.keepaliveTimer.unref();
    }
  }

  /**
   * 停止后台自动化排程与保活定时器
   */
  stopAutoRoutines() {
    this.store?.stopAuthDirWatch?.();
    if (this._stateSaveTimer) {
      this.flushState();
    }
    if (this.scheduleTimer) {
      clearInterval(this.scheduleTimer);
      this.scheduleTimer = null;
    }
    if (this.autoTimer) {
      clearInterval(this.autoTimer);
      this.autoTimer = null;
    }
    if (this.keepaliveTimer) {
      clearInterval(this.keepaliveTimer);
      this.keepaliveTimer = null;
    }
    // 清理未完成的排队等待者
    const pending = this.waiters.splice(0, this.waiters.length);
    for (const w of pending) {
      clearTimeout(w.timer);
      w.resolve(false);
    }
  }
}

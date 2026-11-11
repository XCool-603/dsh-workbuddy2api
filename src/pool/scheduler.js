/**
 * scheduler.js - 账号池智能调度引擎、模型级软熔断、Sticky 亲和路由与并发排队
 */

import { ErrKind } from '../constants.js';
import { runTravelForAccount } from '../upstream/travel.js';
import { claimAllWelfare } from '../upstream/growth.js';

const STICKY_TTL_MS = 15 * 60 * 1000;
const KEEPALIVE_INTERVAL_MS = 5 * 60 * 1000;
const TOKEN_REFRESH_WINDOW_MS = 2 * 60 * 60 * 1000;

function stripModelRealm(model = '') {
  return String(model).replace(/^(cn|global):/i, '');
}

export class Scheduler {
  constructor(accountStore, options = {}) {
    this.store = accountStore;
    this.client = options.client || null;
    this.configStore = options.configStore || null;
    this.maxInFlightCN = options.maxInFlightCN || 3;
    this.maxInFlightGlobal = options.maxInFlightGlobal || 2;
    this.queueTimeoutMs = options.queueTimeoutMs ?? 5000;

    this.circuitBreakers = new Map(); // uid -> { failures, cooldownUntil, kind, reason }
    this.modelBreakers = new Map();   // `${uid}::${bareModel}` -> { failures, cooldownUntil, kind, reason }
    this.inFlight = new Map();        // uid -> current concurrent count
    this.stickyMap = new Map();       // `${sessionKey}::${bareModel}` -> { uid, expiresAt }
    this.accountStats = new Map();    // uid -> { successCount, failCount, lastSuccessAt, lastErrorAt, lastErrorMsg, lastModel }
    this.waiters = [];

    this.autoTimer = null;
    this.keepaliveTimer = null;
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

  /**
   * 申请账号槽位租约
   */
  acquire(account) {
    if (!account || account.disabled) return false;
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
   * 记录调用成功，重置对应熔断器并更新统计
   */
  recordSuccess(account, model = '') {
    const uid = account?.account?.uid;
    if (!uid) return;
    this.circuitBreakers.delete(uid);
    if (model) {
      this.modelBreakers.delete(`${uid}::${stripModelRealm(model)}`);
    }
    const st = this._getOrCreateStats(uid);
    st.successCount += 1;
    st.lastSuccessAt = Date.now();
    if (model) st.lastModel = stripModelRealm(model);
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

    // 请求侧内容违规或参数问题，属于客户端请求特征，不施加账号或模型熔断
    if (
      kind === ErrKind.CONTENT_BLOCKED ||
      kind === ErrKind.BAD_PARAMS ||
      kind === ErrKind.PROMPT_TOO_LONG
    ) {
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
      console.warn(`[scheduler] 账号 ${uid} 模型 [${bareModel}] 触发模型级软熔断 (${kind}), 冷却 ${Math.round(cooldownMs / 1000)}s: ${message}`);
      return;
    }

    // 账号级熔断
    const cb = this.circuitBreakers.get(uid) || { failures: 0, cooldownUntil: 0, kind: '', reason: '' };
    cb.failures += 1;
    cb.kind = kind;
    cb.reason = message;

    let cooldownMs = 60000;
    switch (kind) {
      case ErrKind.SOFT_RATE:
        cooldownMs = Math.min(30000 * Math.pow(2, cb.failures - 1), 600000);
        break;
      case ErrKind.HARD_CREDIT:
        cooldownMs = 1800000;
        break;
      case ErrKind.SESSION_DEAD:
        cooldownMs = 7200000;
        break;
      case ErrKind.ACCOUNT_FAULT:
        cooldownMs = 43200000;
        break;
      case ErrKind.WAF_BLOCK:
        cooldownMs = 180000;
        break;
      default:
        cooldownMs = 45000;
    }

    cb.cooldownUntil = Date.now() + cooldownMs;
    this.circuitBreakers.set(uid, cb);
    console.warn(`[scheduler] 账号 ${uid} 触发账号级熔断保护 (${kind}), 冷却时长 ${Math.round(cooldownMs / 1000)}s: ${message}`);
  }

  /**
   * 清除单个账号的账号级与模型级冷却状态
   */
  clearCooldown(uid) {
    if (!uid) return false;
    let cleared = this.circuitBreakers.delete(uid);
    const prefix = `${uid}::`;
    for (const key of this.modelBreakers.keys()) {
      if (key.startsWith(prefix)) {
        this.modelBreakers.delete(key);
        cleared = true;
      }
    }
    return cleared;
  }

  /**
   * 一键清除所有账号及模型冷却状态
   */
  clearAllCooldowns() {
    const count = this.circuitBreakers.size + this.modelBreakers.size;
    this.circuitBreakers.clear();
    this.modelBreakers.clear();
    return count;
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
   * 选出当前最佳可用账号候选序列（跳过手动停用账号，融合 Sticky 亲和性、熔断状态与并发度）
   */
  pickCandidates(targetRealm = null, options = {}) {
    const accounts = this.store.getAll().filter((a) => !a.disabled);
    if (accounts.length === 0) return [];

    const now = Date.now();
    const bareModel = stripModelRealm(options.bareModel || '');
    const stickyUid = this._getStickyUid(options.sessionKey, bareModel);

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

      // 7. 优先活跃账号微调
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

    const allEnabled = this.store.getAll().filter((a) => !a.disabled);
    if (allEnabled.length === 0) {
      throw new Error('当前无可用启用账号，请在设置中添加或启用至少一个 WorkBuddy / CodeBuddy 账号');
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
            result.kind === ErrKind.PROMPT_TOO_LONG
          );
          if (err.nonRetryable) {
            throw err;
          }
          if (
            result.kind === ErrKind.SOFT_RATE ||
            result.kind === ErrKind.HARD_CREDIT ||
            result.kind === ErrKind.SESSION_DEAD ||
            result.kind === ErrKind.NOT_FOUND ||
            result.kind === ErrKind.WAF_BLOCK ||
            result.kind === ErrKind.SERVER
          ) {
            lastError = err;
            console.log(`[scheduler] 账号 ${account.account.uid} [${bareModel || rawModel}] 遇 ${result.kind}，自动切换下一个账号...`);
            return null;
          }
          throw err;
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
        console.warn(`[scheduler] 账号 ${account.account.uid} 调用异常 (${errKind})，尝试容灾轮换:`, err.message);
        return null;
      }
    };

    for (const account of candidates) {
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
   * 启动后台自动化排程任务（猫猫旅行巡检 + 福利吃满 + 每 5 分钟 Token 保活）
   */
  startAutoRoutines(intervalMs = 2 * 60 * 60 * 1000) {
    if (!this.autoTimer) {
      console.log(`[scheduler] 启动后台自动化排程：猫猫旅行与 Token 保活 (巡检周期 ${Math.round(intervalMs / 60000)} 分钟)`);
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

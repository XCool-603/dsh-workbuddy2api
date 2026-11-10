/**
 * scheduler.js - 账号池智能调度引擎、三因子加权、熔断器与无感容灾轮换
 */

import { ErrKind } from '../constants.js';
import { runTravelForAccount } from '../upstream/travel.js';
import { claimAllWelfare } from '../upstream/growth.js';

export class Scheduler {
  constructor(accountStore, options = {}) {
    this.store = accountStore;
    this.maxInFlightCN = options.maxInFlightCN || 3;
    this.maxInFlightGlobal = options.maxInFlightGlobal || 2;
    this.circuitBreakers = new Map(); // uid -> { failures: 0, cooldownUntil: 0, reason: '' }
    this.inFlight = new Map();         // uid -> current concurrent count
    this.autoTimer = null;
  }

  getInFlight(uid) {
    return this.inFlight.get(uid) || 0;
  }

  isCoolingDown(uid) {
    const cb = this.circuitBreakers.get(uid);
    if (!cb) return false;
    if (Date.now() < cb.cooldownUntil) return true;
    return false;
  }

  /**
   * 申请账号槽位租约
   */
  acquire(account) {
    const uid = account.account.uid;
    const current = this.inFlight.get(uid) || 0;
    const limit = account.auth?.realm === 'global' ? this.maxInFlightGlobal : this.maxInFlightCN;
    if (current >= limit) {
      return false;
    }
    this.inFlight.set(uid, current + 1);
    return true;
  }

  /**
   * 释放账号槽位租约
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
  }

  /**
   * 记录调用成功，重置熔断器
   */
  recordSuccess(account) {
    const uid = account.account?.uid;
    if (!uid) return;
    this.circuitBreakers.delete(uid);
  }

  /**
   * 记录调用异常，按错误类型进入相应等级的冷却退避
   */
  recordFailure(account, kind, message = '') {
    const uid = account.account?.uid;
    if (!uid) return;

    let cb = this.circuitBreakers.get(uid) || { failures: 0, cooldownUntil: 0, reason: '' };
    cb.failures += 1;
    cb.reason = message;

    let cooldownMs = 60000; // 默认 1 分钟

    switch (kind) {
      case ErrKind.SOFT_RATE:
        // 429/6004 软限流：指数退避 30s, 60s, 120s... 封顶 10 分钟
        cooldownMs = Math.min(30000 * Math.pow(2, cb.failures - 1), 600000);
        break;
      case ErrKind.HARD_CREDIT:
        // 积分耗尽：长冷却 30 分钟
        cooldownMs = 1800000;
        break;
      case ErrKind.SESSION_DEAD:
        // 401 凭证失效：冷却 2 小时或等待重新登录
        cooldownMs = 7200000;
        break;
      case ErrKind.ACCOUNT_FAULT:
        // 11140 账号违规封禁：冷却 12 小时
        cooldownMs = 43200000;
        break;
      case ErrKind.WAF_BLOCK:
        // WAF 拦截：冷却 3 分钟
        cooldownMs = 180000;
        break;
      default:
        cooldownMs = 45000;
    }

    cb.cooldownUntil = Date.now() + cooldownMs;
    this.circuitBreakers.set(uid, cb);
    console.warn(`[scheduler] 账号 ${uid} 触发熔断保护 (${kind}), 冷却时长 ${Math.round(cooldownMs / 1000)}s: ${message}`);
  }

  /**
   * 选出当前最佳账号候选序列（支持三因子加权与同域优先）
   */
  pickCandidates(targetRealm = null) {
    const accounts = this.store.getAll();
    if (accounts.length === 0) return [];

    const now = Date.now();
    const scored = accounts.map((acc) => {
      const uid = acc.account.uid;
      const isGlobal = acc.auth?.realm === 'global';
      const realm = isGlobal ? 'global' : 'cn';
      const inFlight = this.inFlight.get(uid) || 0;
      const limit = isGlobal ? this.maxInFlightGlobal : this.maxInFlightCN;

      let penalty = 0;
      // 1. 冷却中账号重罚
      const cb = this.circuitBreakers.get(uid);
      if (cb && now < cb.cooldownUntil) {
        penalty += 100000;
      }

      // 2. 槽位已满惩罚
      if (inFlight >= limit) {
        penalty += 50000;
      }

      // 3. 在途请求惩罚
      penalty += inFlight * 1000;

      // 4. 目标域偏好匹配
      if (targetRealm && targetRealm !== realm) {
        penalty += 2000; // 跨域次选
      }

      // 5. 优先活跃账号微调
      if (uid === this.store.activeUid) {
        penalty -= 50;
      }

      return { account: acc, score: penalty };
    });

    scored.sort((a, b) => a.score - b.score);
    return scored.map((s) => s.account);
  }

  /**
   * 执行带智能自愈与自动轮换的请求执行流
   */
  async executeWithFailover(model, reqFn) {
    const targetRealm = model.startsWith('global:') ? 'global' : model.startsWith('cn:') ? 'cn' : null;
    const candidates = this.pickCandidates(targetRealm);

    if (candidates.length === 0) {
      throw new Error('当前账号池为空，请在设置中添加至少一个 WorkBuddy / CodeBuddy 账号');
    }

    let lastError = null;

    for (const account of candidates) {
      const acquired = this.acquire(account);
      if (!acquired) {
        continue; // 并发满，尝试下一个候选
      }

      try {
        const result = await reqFn(account);

        // 如果非流式调用且标记失败
        if (result && result.ok === false) {
          this.recordFailure(account, result.kind, result.message);
          this.release(account);
          lastError = new Error(result.message);
          // 若为可重试错误（429、余额、失效），继续轮换到下一个账号
          if (
            result.kind === ErrKind.SOFT_RATE ||
            result.kind === ErrKind.HARD_CREDIT ||
            result.kind === ErrKind.SESSION_DEAD ||
            result.kind === ErrKind.SERVER
          ) {
            console.log(`[scheduler] 账号 ${account.account.uid} 遇 ${result.kind}，自动切换至下一个账号...`);
            continue;
          }
          throw lastError;
        }

        // 成功建立连接
        this.recordSuccess(account);
        return {
          ...result,
          account,
          release: () => this.release(account)
        };
      } catch (err) {
        this.recordFailure(account, ErrKind.CLIENT, err.message);
        this.release(account);
        lastError = err;
        console.warn(`[scheduler] 账号 ${account.account.uid} 调用异常，尝试容灾轮换:`, err.message);
      }
    }

    throw lastError || new Error('所有可用账号均并发占满或处于冷却保护期，请稍后重试');
  }

  /**
   * 对所有国内账号批量巡检猫猫旅行（领养、领奖、派出）
   */
  async runAllTravel() {
    const accounts = this.store.getAll().filter(a => a.auth?.realm !== 'global');
    const results = [];
    for (const acc of accounts) {
      try {
        const res = await runTravelForAccount(acc);
        results.push({ uid: acc.account.uid, nickname: acc.account.nickname, ...res });
      } catch (err) {
        results.push({ uid: acc.account.uid, nickname: acc.account.nickname, status: 'error', error: err.message });
      }
      // 账号间礼貌限速 800ms
      await new Promise(r => setTimeout(r, 800));
    }
    return results;
  }

  /**
   * 对全量账号批量吃满全套福利（签到+活跃+礼包+补偿+猫猫+连登+抽奖）
   */
  async runAllWelfare() {
    const accounts = this.store.getAll();
    const results = [];
    for (const acc of accounts) {
      try {
        const res = await claimAllWelfare(acc);
        results.push({ uid: acc.account.uid, nickname: acc.account.nickname, ...res });
      } catch (err) {
        results.push({ uid: acc.account.uid, nickname: acc.account.nickname, status: 'error', error: err.message });
      }
      // 账号间礼貌限速 1000ms
      await new Promise(r => setTimeout(r, 1000));
    }
    return results;
  }

  /**
   * 启动后台自动化排程任务（默认每 2 小时自动巡检一次猫猫旅行与福利）
   */
  startAutoRoutines(intervalMs = 2 * 60 * 60 * 1000) {
    if (this.autoTimer) return;
    console.log(`[scheduler] 启动后台自动化排程：猫猫旅行巡检与福利管家 (每 ${Math.round(intervalMs / 60000)} 分钟自动运行)`);
    this.autoTimer = setInterval(async () => {
      try {
        await this.runAllTravel();
      } catch (e) {
        console.warn('[scheduler] 自动旅行巡检异常:', e.message);
      }
    }, intervalMs);
  }

  /**
   * 停止后台自动化排程
   */
  stopAutoRoutines() {
    if (this.autoTimer) {
      clearInterval(this.autoTimer);
      this.autoTimer = null;
    }
  }
}

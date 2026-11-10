/**
 * travel.js - WorkBuddy / CodeBuddy 猫猫旅行状态机与领养自动化
 * 对应上游 copilot.tencent.com growth 域
 */

import {
  CN_CHAT_BASE,
  GLOBAL_BASE,
  BUDDY_INFO_PATH,
  BUDDY_AGREEMENT_PATH,
  BUDDY_FIRST_PATH,
  TRAVEL_STATUS_PATH,
  TRAVEL_DEPART_PATH,
  TRAVEL_CLAIM_PATH
} from '../constants.js';

function getChatBase(account) {
  return account.auth?.realm === 'global' ? GLOBAL_BASE : CN_CHAT_BASE;
}

function buildGrowthHeaders(account) {
  const base = getChatBase(account);
  const headers = {
    'Accept': 'application/json, text/plain, */*',
    'Content-Type': 'application/json',
    'Origin': base,
    'Referer': `${base}/`,
    'X-Requested-With': 'XMLHttpRequest',
    'User-Agent': 'WorkBuddy/1.2.34 WorkBuddy/1.2.34 CLI/1.2.34'
  };

  if (account.auth?.accessToken) {
    headers['Authorization'] = `Bearer ${account.auth.accessToken}`;
  }
  if (account.account?.uid) {
    headers['X-User-Id'] = account.account.uid;
  }
  if (account.account?.enterpriseId) {
    headers['X-Enterprise-Id'] = account.account.enterpriseId;
  }
  return headers;
}

/**
 * 查询猫猫档案。无猫时返回 null
 */
export async function getBuddyInfo(account, fetchFn = fetch) {
  if (account.auth?.realm === 'global') return null;
  const base = getChatBase(account);
  const url = `${base}${BUDDY_INFO_PATH}`;

  try {
    const res = await fetchFn(url, {
      method: 'GET',
      headers: buildGrowthHeaders(account)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || (data.code !== 0 && data.code !== 200)) {
      return null;
    }
    const buddy = data.data?.buddy;
    if (!buddy || typeof buddy !== 'object' || !buddy.id) {
      return null;
    }
    return {
      id: buddy.id,
      name: buddy.name || '神秘小猫'
    };
  } catch (err) {
    return null;
  }
}

/**
 * 同意猫猫协议 (幂等)
 */
export async function agreeBuddy(account, fetchFn = fetch) {
  const base = getChatBase(account);
  const url = `${base}${BUDDY_AGREEMENT_PATH}`;

  const res = await fetchFn(url, {
    method: 'POST',
    headers: buildGrowthHeaders(account),
    body: JSON.stringify({ agree: true })
  });
  const data = await res.json().catch(() => ({}));
  return res.ok && (data.code === 0 || data.code === 200);
}

/**
 * 领养第一只猫送 300 积分
 */
export async function adoptFirstBuddy(account, fetchFn = fetch) {
  const base = getChatBase(account);
  const url = `${base}${BUDDY_FIRST_PATH}`;

  try {
    const res = await fetchFn(url, {
      method: 'POST',
      headers: buildGrowthHeaders(account),
      body: JSON.stringify({})
    });
    const data = await res.json().catch(() => ({}));
    const msg = (data.msg || '').toLowerCase();

    if (res.ok && (data.code === 0 || data.code === 200)) {
      return { ok: true, credit: 300, message: '领养第一只小猫成功，获得 +300 积分！' };
    }

    if (res.status === 400 && msg.includes('first_buddy task not completed yet')) {
      return { ok: false, incomplete: true, message: '领养前置门槛未达成(需先完成对话活跃上报)' };
    }

    return { ok: false, incomplete: false, message: data.msg || `领养请求失败 (HTTP ${res.status})` };
  } catch (err) {
    return { ok: false, incomplete: false, message: err.message };
  }
}

/**
 * 查询猫猫旅行状态
 */
export async function getTravelStatus(account, fetchFn = fetch) {
  if (account.auth?.realm === 'global') {
    return { isGlobal: true, state: 'unsupported', message: '国际版账号无猫猫旅行体系' };
  }

  const base = getChatBase(account);
  const url = `${base}${TRAVEL_STATUS_PATH}`;

  try {
    const res = await fetchFn(url, {
      method: 'GET',
      headers: buildGrowthHeaders(account)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || (data.code !== 0 && data.code !== 200)) {
      throw new Error(data.msg || `查询旅行状态失败 (HTTP ${res.status})`);
    }

    const d = data.data || {};
    return {
      state: d.state || 'idle', // idle / traveling / arrived
      dailyLimitReached: Boolean(d.daily_limit_reached),
      recordId: d.record_id || 0,
      rewardCredit: d.reward_credit || 0
    };
  } catch (err) {
    return { state: 'error', error: err.message };
  }
}

/**
 * 派出猫猫旅行 (固定 location_id = 4 古镇客栈)
 */
export async function departTravel(account, locationId = 4, fetchFn = fetch) {
  const base = getChatBase(account);
  const url = `${base}${TRAVEL_DEPART_PATH}`;

  const res = await fetchFn(url, {
    method: 'POST',
    headers: buildGrowthHeaders(account),
    body: JSON.stringify({ location_id: locationId })
  });

  const data = await res.json().catch(() => ({}));
  if (res.ok && (data.code === 0 || data.code === 200)) {
    return { ok: true, locationId, message: `成功派出猫猫前往地点 ${locationId}！` };
  }
  return { ok: false, message: data.msg || `派出失败 (HTTP ${res.status})` };
}

/**
 * 领取猫猫到站旅行奖励
 */
export async function claimTravel(account, recordId, fetchFn = fetch) {
  const base = getChatBase(account);
  const url = `${base}${TRAVEL_CLAIM_PATH}`;

  const res = await fetchFn(url, {
    method: 'POST',
    headers: buildGrowthHeaders(account),
    body: JSON.stringify({ record_id: recordId })
  });

  const data = await res.json().catch(() => ({}));
  if (res.ok && (data.code === 0 || data.code === 200)) {
    const rewardCredit = data.data?.reward_credit || 0;
    return { ok: true, rewardCredit, message: `领取旅行奖励成功，获得 +${rewardCredit} 积分！` };
  }
  return { ok: false, message: data.msg || `领取旅行奖励失败 (HTTP ${res.status})` };
}

/**
 * 单账号全流程旅行巡检状态机
 */
export async function runTravelForAccount(account, fetchFn = fetch) {
  if (account.auth?.realm === 'global') {
    return { status: 'skipped', reason: 'global_account_no_travel' };
  }

  // 1. 检查是否有猫
  let buddy = await getBuddyInfo(account, fetchFn);
  if (!buddy) {
    // 尝试领养
    await agreeBuddy(account, fetchFn);
    const adoptRes = await adoptFirstBuddy(account, fetchFn);
    if (!adoptRes.ok) {
      return { status: 'adopt_failed', detail: adoptRes.message };
    }
    buddy = await getBuddyInfo(account, fetchFn);
  }

  // 2. 检查当前旅行状态
  const ts = await getTravelStatus(account, fetchFn);
  if (ts.state === 'error') {
    return { status: 'status_error', detail: ts.error };
  }

  // 3. 状态机分发
  const results = { buddy, initialStatus: ts, actions: [] };

  if (ts.state === 'arrived') {
    // 已到站：领奖
    const claimRes = await claimTravel(account, ts.recordId, fetchFn);
    results.actions.push({ action: 'claim', ...claimRes });

    // 领完奖后若今日未到上限，顺带再次派出
    const freshStatus = await getTravelStatus(account, fetchFn);
    if (freshStatus.state === 'idle' && !freshStatus.dailyLimitReached) {
      const departRes = await departTravel(account, 4, fetchFn);
      results.actions.push({ action: 'depart', ...departRes });
    }
  } else if (ts.state === 'idle') {
    // 空闲中：若今日未达上限，立即派出
    if (ts.dailyLimitReached) {
      results.actions.push({ action: 'skip', message: '今日派出次数已达上限 (00:00 CST 重置)' });
    } else {
      const departRes = await departTravel(account, 4, fetchFn);
      results.actions.push({ action: 'depart', ...departRes });
    }
  } else if (ts.state === 'traveling') {
    results.actions.push({
      action: 'skip',
      message: `猫猫正在旅行中 (记录ID: ${ts.recordId})，等待到站`
    });
  }

  return { status: 'ok', results };
}

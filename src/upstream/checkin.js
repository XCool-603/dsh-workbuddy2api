/**
 * checkin.js - 每日签到与福利领取
 */

import {
  CN_BILLING_BASE,
  GLOBAL_BASE,
  DAILY_CHECKIN_PATH_CN,
  GLOBAL_TRIAL_PATH
} from '../constants.js';

/**
 * 为指定账号执行每日签到或福利领取
 */
export async function performCheckin(account, fetchFn = fetch) {
  if (!account || !account.auth?.accessToken) {
    return { ok: false, status: 'NO_TOKEN', message: '账号未登录或无有效令牌' };
  }

  const isGlobal = account.auth?.realm === 'global';
  const base = isGlobal ? GLOBAL_BASE : CN_BILLING_BASE;
  const path = isGlobal ? GLOBAL_TRIAL_PATH : DAILY_CHECKIN_PATH_CN;
  const url = `${base}${path}`;

  try {
    const res = await fetchFn(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${account.auth.accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-User-Id': account.account?.uid || '',
        'X-CodeBuddy-Request': '1',
        'Origin': base,
        'Referer': `${base}/`,
        'User-Agent': 'WorkBuddy/5.5.4'
      },
      body: JSON.stringify({})
    });

    const data = await res.json().catch(() => ({}));
    const msg = data.msg || data.message || '';
    const low = msg.toLowerCase();

    if (res.ok && (data.code === 0 || data.code === 200)) {
      return { ok: true, status: 'SUCCESS', message: isGlobal ? '试用额度领取成功 (+Trial)' : '签到成功' };
    }

    if (
      low.includes('已签到') ||
      low.includes('already') ||
      data.code === 10001 ||
      data.code === 14001 ||
      data.code === 14051
    ) {
      return {
        ok: true,
        status: 'ALREADY',
        message: isGlobal ? '试用加速包此前已领取过' : '今日已完成签到'
      };
    }

    return {
      ok: false,
      status: 'FAIL',
      message: msg || `上游返回错误 (HTTP ${res.status}, code: ${data.code})`
    };
  } catch (err) {
    return { ok: false, status: 'ERROR', message: `网络异常: ${err.message}` };
  }
}

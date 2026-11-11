/**
 * trial.js - 国际版 (Global) 专属一次性 IDE 试用加油包领取
 */

import { GLOBAL_BASE, GLOBAL_TRIAL_PATH } from '../constants.js';

export async function claimGlobalTrial(account, client) {
  if (!account || account.auth?.realm !== 'global') {
    return { ok: false, claimed: false, message: '仅国际版 (global) 账号支持领取 Trial 加油包' };
  }

  const doPost = async () => {
    const headers = client
      ? client.buildHeaders(account, false)
      : {
          'Authorization': `Bearer ${account.auth.accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CodeBuddy-Request': '1',
          'Origin': GLOBAL_BASE,
          'Referer': `${GLOBAL_BASE}/`
        };

    const res = await fetch(`${GLOBAL_BASE}${GLOBAL_TRIAL_PATH}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({}),
      signal: AbortSignal.timeout(10000)
    });
    const data = await res.json().catch(() => ({}));
    return { res, data };
  };

  let { res, data } = await doPost();

  if (res.status === 401 && client && account.auth?.refreshToken) {
    try {
      await client.refreshToken(account);
      const retry = await doPost();
      res = retry.res;
      data = retry.data;
    } catch (_) {}
  }

  // 幂等码 14051：已经领过
  const already =
    data.code === 14051 ||
    (typeof data.msg === 'string' && /already|14051|已领取/i.test(data.msg));

  if (already) {
    return { ok: true, claimed: false, message: '该国际版账号已领过 Trial 加油包（无需重复领取）' };
  }

  if (!res.ok || (data.code !== 0 && data.code !== 200)) {
    return { ok: false, claimed: false, message: data.msg || `领取失败 (HTTP ${res.status})` };
  }

  return { ok: true, claimed: true, message: '成功领取国际版 IDE Trial 加速积分包！', data: data.data };
}

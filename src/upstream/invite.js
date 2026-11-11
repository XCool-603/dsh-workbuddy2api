/**
 * invite.js - WorkBuddy / CodeBuddy 官方邀请体系 v2 (/activity/workbuddy/invitation/v2/*)
 */

import { CN_BILLING_BASE, GLOBAL_BASE } from '../constants.js';

const INVITATION_V2_PREFIX = '/activity/workbuddy/invitation/v2';

const BIND_ERROR_MESSAGES = {
  12301: '邀请码无效或不存在（注意国际版与国内版不互通）',
  12302: '不能绑定自己的邀请码',
  12303: '当前账号已经绑定过邀请人，不可重复绑定',
  12304: '仅限新注册账号可绑定邀请码',
  12305: '当前邀请活动已结束',
  12306: '活动或区服不匹配（请核对国内版/国际版）',
  12310: '当前账号已经绑定过邀请人，不可重复绑定',
  12311: '仅限新注册账号可绑定邀请码',
  12312: '当前邀请活动已结束',
  12313: '不能绑定自己的邀请码',
  12314: '活动或区服不匹配',
  12317: '已超过新用户绑定时间窗口',
  12319: '邀请码无效或已失效'
};

/**
 * 从原始输入或完整邀请 URL 中提取纯邀请码
 */
export function extractInviteCode(input) {
  const raw = String(input || '').trim();
  if (!raw) return '';
  if (raw.includes('://') || raw.includes('inviteCode=') || raw.includes('invite_code=') || raw.includes('code=')) {
    try {
      const normalized = raw.startsWith('http') ? raw : `https://www.workbuddy.ai/?${raw.replace(/^[/?]+/, '')}`;
      const u = new URL(normalized);
      const picked = u.searchParams.get('inviteCode') || u.searchParams.get('invite_code') || u.searchParams.get('code');
      if (picked) return picked.trim();
    } catch (_) {}
  }
  return raw;
}

/**
 * 兼容旧导出名（若无上游邀请码不再伪造假 UID 码）
 */
export function defaultInviteCode(account) {
  return account?.account?.inviteCode || '';
}

/**
 * 根据区服与官方真实邀请码生成可正常打开并自动绑定受邀关系的邀请链接
 * - 国际版 (global): https://www.workbuddy.ai/?inviteCode=<code>
 * - 国内版 (cn): https://www.workbuddy.cn/events/invite?inviteCode=<code>
 */
export function buildInviteUrl(account, code) {
  const c = String(code || '').trim();
  if (!c) return '';
  return account?.auth?.realm === 'global'
    ? `https://www.workbuddy.ai/?inviteCode=${encodeURIComponent(c)}`
    : `https://www.workbuddy.cn/events/invite?inviteCode=${encodeURIComponent(c)}`;
}

export const defaultInviteUrl = buildInviteUrl;

async function fetchJsonWithRefresh(url, options, account, client) {
  const exec = async () => {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        'Authorization': `Bearer ${account.auth.accessToken}`
      },
      signal: AbortSignal.timeout(8000)
    });
    const json = await res.json().catch(() => ({}));
    return { res, json };
  };

  let { res, json } = await exec();
  const isAuthErr = res.status === 401 || json.code === 401 || json.code === 12153 || json.code === 10002;
  if (isAuthErr && client && account.auth?.refreshToken) {
    try {
      await client.refreshToken(account);
      ({ res, json } = await exec());
    } catch (_) {}
  }
  return { res, json };
}

/**
 * 查询官方真实专属邀请码、可用邀请链接、激励统计与邀请好友明细
 */
export async function fetchInviteInfo(account, client = null) {
  if (!account?.account?.uid) {
    throw new Error('账号信息无效');
  }
  const isGlobal = account.auth?.realm === 'global';
  const base = isGlobal ? GLOBAL_BASE : CN_BILLING_BASE;

  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-CodeBuddy-Request': '1',
    'Origin': base,
    'Referer': `${base}/`
  };

  const [codeRes, rewardsRes, recordsRes, progressRes] = await Promise.all([
    fetchJsonWithRefresh(`${base}${INVITATION_V2_PREFIX}/my-code`, { method: 'GET', headers }, account, client).catch((e) => ({ res: { ok: false }, json: { msg: e.message } })),
    fetchJsonWithRefresh(`${base}${INVITATION_V2_PREFIX}/my-rewards`, { method: 'GET', headers }, account, client).catch(() => ({ res: { ok: false }, json: {} })),
    fetchJsonWithRefresh(`${base}${INVITATION_V2_PREFIX}/invite-records`, { method: 'GET', headers }, account, client).catch(() => ({ res: { ok: false }, json: {} })),
    fetchJsonWithRefresh(`${base}${INVITATION_V2_PREFIX}/my-progress`, { method: 'GET', headers }, account, client).catch(() => ({ res: { ok: false }, json: {} }))
  ]);

  const codeData = codeRes.res.ok && codeRes.json.code === 0 ? (codeRes.json.data || {}) : null;
  const progData = progressRes.res.ok && progressRes.json.code === 0 ? (progressRes.json.data || {}) : null;
  const rewData = rewardsRes.res.ok && rewardsRes.json.code === 0 ? (rewardsRes.json.data || {}) : null;
  const recData = recordsRes.res.ok && recordsRes.json.code === 0 ? (recordsRes.json.data || {}) : null;

  const inviteCode = String(codeData?.invite_code || progData?.invite_code || '').trim();
  const inviteUrl = buildInviteUrl(account, inviteCode);

  const invitedCount = Number(
    recData?.total_invited ??
    progData?.invite_count ??
    0
  );
  const validInviteCount = Number(
    recData?.total_used ??
    rewData?.valid_invite_count ??
    progData?.valid_invite_count ??
    0
  );
  const rewardCredit = Number(
    rewData?.total_credits ??
    recData?.total_credits ??
    progData?.total_credits ??
    0
  );

  return {
    inviteCode,
    inviteUrl,
    expiresAt: codeData?.expires_at || 'never',
    invitedCount,
    validInviteCount,
    rewardCredit,
    baseCredits: Number(rewData?.base_credits ?? progData?.base_credits ?? 0),
    promotionCredits: Number(rewData?.promotion_credits ?? progData?.promotion_credits ?? 0),
    paymentCredits: Number(rewData?.payment_credits ?? progData?.payment_credits ?? 0),
    capValue: Number(rewData?.cap_value ?? 30000),
    friends: recData?.friends || progData?.invited_users || [],
    error: !inviteCode && codeRes.json?.msg ? codeRes.json.msg : ''
  };
}

/**
 * 绑定邀请人邀请码（支持传入纯邀请码或完整邀请链接，返回精确状态说明）
 */
export async function bindInviteCode(account, inviteInput, client = null) {
  const cleanCode = extractInviteCode(inviteInput);
  if (!cleanCode) {
    return { ok: false, message: '邀请码不能为空' };
  }
  const isGlobal = account.auth?.realm === 'global';
  const base = isGlobal ? GLOBAL_BASE : CN_BILLING_BASE;

  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-CodeBuddy-Request': '1',
    'Origin': base,
    'Referer': `${base}/`
  };

  try {
    const { res, json } = await fetchJsonWithRefresh(
      `${base}${INVITATION_V2_PREFIX}/bind`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ inviteCode: cleanCode })
      },
      account,
      client
    );

    if (res.ok && json.code === 0) {
      const reward = Number(json.data?.credit || json.data?.reward_credit || json.data?.granted_credits || 0);
      return {
        ok: true,
        inviteCode: cleanCode,
        reward,
        message: reward > 0 ? `绑定成功，获得 +${reward} 积分！` : '邀请码绑定成功！'
      };
    }

    const mapped = BIND_ERROR_MESSAGES[json.code];
    return {
      ok: false,
      code: json.code,
      message: mapped || json.msg || `绑定失败 (HTTP ${res.status})`
    };
  } catch (err) {
    return { ok: false, message: `绑定请求异常: ${err.message}` };
  }
}

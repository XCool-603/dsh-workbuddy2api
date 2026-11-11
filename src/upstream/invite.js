/**
 * invite.js - 官方邀请体系（专属邀请码 / 邀请链接查询、受邀人绑定）
 */

import { CN_BILLING_BASE, GLOBAL_BASE } from '../constants.js';

function cleanRawUid(uid) {
  return String(uid || '')
    .replace(/^(cn_|global_|workbuddy_)/i, '')
    .trim();
}

export function defaultInviteCode(account) {
  return cleanRawUid(account?.account?.uid || '');
}

export function defaultInviteUrl(account, code) {
  const c = code || defaultInviteCode(account);
  return account?.auth?.realm === 'global'
    ? `https://www.workbuddy.ai/i/${c}`
    : `https://workbuddy.cn/i/${c}`;
}

export async function fetchInviteInfo(account) {
  if (!account?.account?.uid) {
    throw new Error('账号信息无效');
  }
  const isGlobal = account.auth?.realm === 'global';
  const base = isGlobal ? GLOBAL_BASE : CN_BILLING_BASE;

  let code = defaultInviteCode(account);
  let url = defaultInviteUrl(account, code);
  let invitedCount = 0;
  let rewardCredit = 0;

  const endpoints = [
    '/activity/growth/user/invite',
    '/activity/growth/invite/info',
    '/portal/activity/share/info',
    '/activity/growth/share/info'
  ];

  const headers = {
    'Authorization': `Bearer ${account.auth.accessToken}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-CodeBuddy-Request': '1',
    'Origin': base,
    'Referer': `${base}/`
  };

  for (const ep of endpoints) {
    try {
      const res = await fetch(`${base}${ep}`, {
        method: 'GET',
        headers,
        signal: AbortSignal.timeout(6000)
      });
      if (!res.ok) continue;
      const json = await res.json().catch(() => ({}));
      if (json.code !== 0 || !json.data) continue;
      const d = json.data;
      code = d.invite_code || d.code || d.share_code || code;
      url = d.invite_url || d.share_url || defaultInviteUrl(account, code);
      invitedCount = Number(d.invited_count || 0);
      rewardCredit = Number(d.reward_credit || 0);
      break;
    } catch (_) {}
  }

  return {
    inviteCode: code,
    inviteUrl: url,
    invitedCount,
    rewardCredit
  };
}

export async function bindInviteCode(account, inviteCode) {
  const cleanCode = String(inviteCode || '').trim();
  if (!cleanCode) {
    return { ok: false, message: '邀请码不能为空' };
  }
  const isGlobal = account.auth?.realm === 'global';
  const base = isGlobal ? GLOBAL_BASE : CN_BILLING_BASE;

  const endpoints = [
    '/activity/growth/invite/accept',
    '/activity/growth/user/bind-inviter',
    '/billing/meter/invite/bind'
  ];

  const headers = {
    'Authorization': `Bearer ${account.auth.accessToken}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-CodeBuddy-Request': '1',
    'Origin': base,
    'Referer': `${base}/`
  };

  let lastMsg = '所有邀请绑定端点均未响应或已绑定过';
  for (const ep of endpoints) {
    try {
      const res = await fetch(`${base}${ep}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ invite_code: cleanCode, code: cleanCode }),
        signal: AbortSignal.timeout(8000)
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.code === 0) {
        const reward = Number(json.data?.credit || json.data?.reward_credit || 0);
        return { ok: true, reward, message: reward > 0 ? `绑定成功，获得 +${reward} 积分` : '邀请绑定成功' };
      }
      if (json.msg) lastMsg = json.msg;
    } catch (e) {
      lastMsg = e.message;
    }
  }

  return { ok: false, message: lastMsg };
}

/**
 * oauth.js - WorkBuddy / CodeBuddy 官方 OAuth 网页一键授权登录与轮询
 */

import { CN_CHAT_BASE, CN_BILLING_BASE, GLOBAL_BASE } from '../constants.js';
import { parseJWTClaims } from '../pool/account-store.js';

const oauthSessions = new Map(); // state -> { realm, createdAt }

function getOAuthEndpoints(realm) {
  if (realm === 'global') {
    return { base: GLOBAL_BASE, origin: GLOBAL_BASE };
  }
  return { base: CN_CHAT_BASE, origin: CN_BILLING_BASE };
}

function buildOAuthHeaders(origin, accessToken = '') {
  const h = {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/plain, */*',
    'X-Requested-With': 'XMLHttpRequest',
    'Origin': origin,
    'Referer': `${origin}/`,
    'User-Agent': 'CLI/2.63.2 CodeBuddy/2.63.2'
  };
  if (accessToken) {
    h['Authorization'] = `Bearer ${accessToken}`;
  }
  return h;
}

/**
 * 发起 OAuth 登录流程，获取 state 与授权跳转 URL
 */
export async function startOAuthFlow(realm = 'cn') {
  const targetRealm = realm === 'global' ? 'global' : 'cn';
  const { base, origin } = getOAuthEndpoints(targetRealm);

  const res = await fetch(`${base}/v2/plugin/auth/state?platform=CLI`, {
    method: 'POST',
    headers: buildOAuthHeaders(origin),
    body: JSON.stringify({}),
    signal: AbortSignal.timeout(15000)
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.code !== 0) {
    throw new Error(data.msg || `获取授权链接失败 (HTTP ${res.status})`);
  }

  const state = data.data?.state;
  const authUrl = (data.data?.authUrl || '').trim();
  if (!state || !authUrl) {
    throw new Error('上游未返回完整的 OAuth 授权地址或 state');
  }

  // 清理超过 15 分钟的过期会话
  const now = Date.now();
  for (const [k, s] of oauthSessions.entries()) {
    if (now - s.createdAt > 15 * 60 * 1000) oauthSessions.delete(k);
  }
  oauthSessions.set(state, { realm: targetRealm, createdAt: now });

  return { state, url: authUrl, realm: targetRealm };
}

/**
 * 轮询 OAuth 授权结果，成功后自动抓取账号详情并入池
 */
export async function pollOAuthFlow(realm, state, store) {
  const sess = oauthSessions.get(state);
  const targetRealm = sess?.realm || (realm === 'global' ? 'global' : 'cn');
  const { base, origin } = getOAuthEndpoints(targetRealm);

  let res;
  try {
    res = await fetch(`${base}/v2/plugin/auth/token?state=${encodeURIComponent(state)}`, {
      method: 'GET',
      headers: buildOAuthHeaders(origin),
      signal: AbortSignal.timeout(10000)
    });
  } catch (err) {
    return { success: false, waiting: true, notice: `等待授权响应 (${err.message})` };
  }

  const tokData = await res.json().catch(() => ({}));
  if (!res.ok || tokData.code !== 0 || !tokData.data?.accessToken) {
    return { success: false, waiting: true };
  }

  const tok = tokData.data;
  const domain = tok.domain || (targetRealm === 'global' ? 'www.workbuddy.ai' : 'copilot.tencent.com');

  // 获取详细账户档案
  let acct = {};
  try {
    const acctRes = await fetch(`${base}/v2/plugin/login/account?state=${encodeURIComponent(state)}`, {
      method: 'GET',
      headers: buildOAuthHeaders(origin, tok.accessToken),
      signal: AbortSignal.timeout(10000)
    });
    const acctJson = await acctRes.json().catch(() => ({}));
    if (acctJson.code === 0 && acctJson.data) {
      acct = acctJson.data;
    }
  } catch (_) {}

  const claims = parseJWTClaims(tok.accessToken) || {};
  const uid = String(
    acct.uid ||
    acct.userId ||
    claims.sub ||
    claims.uid ||
    `wb-${Date.now().toString(36)}`
  ).trim();
  const nickname = String(
    acct.nickname ||
    acct.userName ||
    claims.email ||
    claims.name ||
    claims.nickname ||
    `Account-${uid.slice(0, 8)}`
  ).trim();
  const enterpriseId = String(acct.enterpriseId || '').trim();
  const provider = String(acct.provider || acct.idp || acct.loginType || acct.type || claims.provider || '').trim();

  const expiresIn = Number(tok.expiresIn) > 0 && Number(tok.expiresIn) < 86400 * 30
    ? Number(tok.expiresIn)
    : 7200;

  const accountObj = {
    account: { uid, nickname, enterpriseId, provider },
    auth: {
      realm: targetRealm,
      accessToken: tok.accessToken,
      refreshToken: tok.refreshToken || '',
      expiresAt: Date.now() + expiresIn * 1000,
      domain
    },
    disabled: false,
    disabledReason: '',
    source: 'oauth-browser'
  };

  store.upsert(accountObj);
  store.setActive(uid);
  oauthSessions.delete(state);

  return {
    success: true,
    waiting: false,
    account: {
      uid,
      nickname,
      realm: targetRealm,
      provider
    }
  };
}

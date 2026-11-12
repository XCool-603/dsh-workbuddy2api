/**
 * web-routes.js - 统一管控台与内网 Web API 路由中心（同时挂载至 DSH WebServer 与 Loopback 网关）
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { performCheckin } from '../upstream/checkin.js';
import {
  getBuddyInfo,
  agreeBuddy,
  adoptFirstBuddy,
  getTravelStatus,
  departTravel,
  claimTravel,
  runTravelForAccount
} from '../upstream/travel.js';
import {
  getStreak,
  redeemStreakTier,
  checkAndUseMakeupCard,
  claimGift,
  claimCompensation,
  reportActiveChat,
  getLotteryChances,
  drawLottery,
  claimAllWelfare
} from '../upstream/growth.js';
import {
  fetchGrowthTasks,
  runAllGrowthTasks,
  isCSTNightWindow
} from '../upstream/tasks.js';
import {
  fetchSchoolStatus,
  runSchoolActivity
} from '../upstream/school.js';
import { startOAuthFlow, pollOAuthFlow } from '../upstream/oauth.js';
import { claimGlobalTrial } from '../upstream/trial.js';
import { fetchInviteInfo, bindInviteCode } from '../upstream/invite.js';
import { batchImportAccounts, exportBackupZip } from '../pool/import-export.js';
import { parseJWTClaims } from '../pool/account-store.js';
import { renderConsoleHtml, renderPortalHtml } from './dashboard-html.js';
import { DEFAULT_MODEL_ALIASES, SERVICE_VERSION, GITHUB_REPO } from '../constants.js';
import { UserManager } from './auth-users.js';
import { extractTrustedClientIP, detectRuntimeIPs, parseWhitelistEntries } from './ip-whitelist.js';

function sendJson(res, status, data) {
  if (res.writableEnded) return;
  if (!res.headersSent) {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  }
  res.end(JSON.stringify(data));
}

function parseRawBody(req, maxBytes = 25 * 1024 * 1024) {
  return new Promise((resolve) => {
    const chunks = [];
    let total = 0;
    req.on('data', (c) => {
      total += c.length;
      if (total <= maxBytes) chunks.push(c);
    });
    req.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    req.on('error', () => resolve(Buffer.alloc(0)));
  });
}

async function parseJsonBody(req) {
  const buf = await parseRawBody(req);
  if (!buf || buf.length === 0) return {};
  try {
    return JSON.parse(buf.toString('utf8'));
  } catch (_) {
    return {};
  }
}

function createEmptyRealmSummary() {
  return {
    count: 0,
    enabledCount: 0,
    healthyCount: 0,
    remain: 0,
    total: 0,
    used: 0,
    baseRemain: 0,
    bonusRemain: 0,
    purchasedRemain: 0,
    expiringRemain: 0
  };
}

function accumulateSummary(bucket, acc, bal, coolingDown) {
  bucket.count += 1;
  if (!acc.disabled && !acc.manualDisabled) {
    bucket.enabledCount += 1;
    if (!coolingDown) bucket.healthyCount += 1;
  }
  if (bal && !bal.error) {
    bucket.remain += Number(bal.remain || 0);
    bucket.total += Number(bal.total || 0);
    bucket.used += Number(bal.used || 0);
    bucket.baseRemain += Number(bal.baseRemain || 0);
    bucket.bonusRemain += Number(bal.bonusRemain || 0);
    bucket.purchasedRemain += Number(bal.purchasedRemain || 0);
    bucket.expiringRemain += Number(bal.expiringRemain || 0);
  }
}

export function registerWebRoutes(ctx, deps) {
  const { scheduler, client, ledger, loopback, configStore, userManager, alertManager } = deps;
  const store = scheduler.store;

  const balanceCache = new Map();
  const checkinStateMap = new Map(); // uid -> { date, ok, status, message }
  const BALANCE_TTL = 20000; // 20s 实时缓存窗口

  function markCheckinState(uid, res) {
    if (!uid || !res) return;
    const todayCST = new Date(Date.now() + 8 * 3600 * 1000).toISOString().slice(0, 10);
    checkinStateMap.set(uid, {
      date: todayCST,
      ok: Boolean(res.ok),
      status: res.status || (res.ok ? 'SUCCESS' : 'FAIL'),
      message: res.message || ''
    });
  }

  async function getAccountBalance(account, force = false) {
    if (!account) return null;
    const uid = account.account.uid;
    const cached = balanceCache.get(uid);
    if (!force && cached && Date.now() - cached.fetchedAt < BALANCE_TTL) {
      return cached.data;
    }
    try {
      const bal = await client.fetchBalance(account);
      balanceCache.set(uid, { data: bal, fetchedAt: Date.now() });
      scheduler.updateAccountCredits(uid, bal.remain, bal.expiringRemain);
      scheduler.reenableIfCredits(uid, bal.remain);
      alertManager?.notifyLowCredit(uid, account.account.nickname, bal.remain);
      return bal;
    } catch (err) {
      if (cached) return cached.data;
      return {
        remain: 0,
        total: 0,
        used: 0,
        baseRemain: 0,
        bonusRemain: 0,
        purchasedRemain: 0,
        expiringRemain: 0,
        packCount: 0,
        activePackCount: 0,
        packages: [],
        error: err.message,
        fetchedAt: Date.now()
      };
    }
  }

  const invalidateBalance = (uid) => {
    if (uid) balanceCache.delete(uid);
    else balanceCache.clear();
  };

  const getRuntimeCfg = () => (configStore ? configStore.getAll() : {});
  const requireAdmin = (req, res) => {
    if (!userManager) return true;
    const auth = userManager.checkWebAuth(req);
    if (!auth.ok) {
      sendJson(res, 401, { ok: false, authRequired: true, error: '请先登录控制台' });
      return false;
    }
    if (auth.user?.role !== 'admin') {
      sendJson(res, 403, { ok: false, error: '需要管理员权限' });
      return false;
    }
    return true;
  };

  const routes = [
    // 1. 全局状态、3-Realm 积分汇总与诊断看板
    {
      path: '/plugins/dsh-workbuddy2api/status',
      handler: async (req, res) => {
        const u = new URL(req.url, 'http://localhost');
        const force = u.searchParams.get('refresh') === '1';
        const dateParam = u.searchParams.get('date') || '';
        const sessionAuth = userManager ? userManager.checkWebAuth(req) : { ok: true, user: { username: 'admin', role: 'admin' } };

        const all = store.getAll();
        const active = store.getActive();
        const summary = {
          all: createEmptyRealmSummary(),
          cn: createEmptyRealmSummary(),
          global: createEmptyRealmSummary()
        };
        const todayCST = new Date(Date.now() + 8 * 3600 * 1000).toISOString().slice(0, 10);

        const accounts = await Promise.all(all.map(async (a) => {
          const uid = a.account.uid;
          const bal = await getAccountBalance(a, force && !scheduler.isAccountUnavailable(a));
          const diag = scheduler.getAccountDiagnostics(uid);
          const realmKey = a.auth?.realm === 'global' ? 'global' : 'cn';
          const chk = checkinStateMap.get(uid);

          accumulateSummary(summary.all, a, bal, diag.coolingDown);
          accumulateSummary(summary[realmKey], a, bal, diag.coolingDown);

          return {
            uid,
            nickname: a.account.nickname,
            realm: a.auth.realm,
            enterpriseId: a.account.enterpriseId || '',
            provider: a.account.provider || '',
            disabled: Boolean(a.disabled),
            disabledReason: a.disabledReason || '',
            manualDisabled: Boolean(a.manualDisabled),
            manualDisabledReason: a.manualDisabledReason || '',
            source: a.source || '',
            inFlight: diag.inFlight,
            coolingDown: diag.coolingDown,
            diagnostics: diag,
            expiresAt: a.auth.expiresAt,
            updatedAt: a.updatedAt,
            balance: bal,
            checkinState: chk && chk.date === todayCST ? chk : null
          };
        }));

        const balance = active ? await getAccountBalance(active, force) : null;
        const cfg = getRuntimeCfg();
        const visibleAccounts =
          sessionAuth.ok && sessionAuth.user?.role === 'user' ? [] : accounts;

        sendJson(res, 200, {
          ok: true,
          serviceVersion: SERVICE_VERSION,
          activeUid: store.activeUid,
          accounts: visibleAccounts,
          balance,
          summary,
          gatewayPort: loopback.actualPort || loopback.preferredPort,
          aliases: { ...DEFAULT_MODEL_ALIASES, ...(cfg.aliases || {}) },
          modelRoutes: cfg.modelRoutes || {},
          autoFreeEnabled: cfg.autoFreeEnabled !== false,
          freeCandidates: loopback.getFreeModelCandidates(),
          enabledModels: cfg.enabledModels || Array.from(loopback.enabledModels),
          freeModels: cfg.freeModels || [],
          discoveredModelsCount: loopback.discoveredModels?.length || 0,
          inFlightRequests: scheduler.getInFlightRequests(),
          wafIpBlocked: scheduler.wafIPGate.active(),
          degradeActive: scheduler.degradeGate.active(),
          runtimeNetwork: {
            detectedIPs: detectRuntimeIPs(),
            clientIP: extractTrustedClientIP(req)
          },
          auth: {
            hasPassword: userManager ? userManager.hasWebPassword() : false,
            authenticated: sessionAuth.ok,
            currentUser: sessionAuth.user || null,
            allowRegister: Boolean(cfg.allowRegister)
          },
          alertHistory: alertManager?.history || [],
          config: cfg,
          stats: ledger.getStats(loopback.getModelCatalogMap(), dateParam)
        });
      }
    },

    // 2. 切换优先账号
    {
      path: '/plugins/dsh-workbuddy2api/accounts/switch',
      handler: async (req, res) => {
        const body = await parseJsonBody(req);
        const success = store.setActive(body.uid);
        sendJson(res, 200, { ok: success, activeUid: store.activeUid });
      }
    },

    // 3. 粘贴单条 Token 添加账号（自动解析 JWT 字段与认证验证）
    {
      path: '/plugins/dsh-workbuddy2api/accounts/add',
      handler: async (req, res) => {
        try {
          const body = await parseJsonBody(req);
          const rawAccess = (body.accessToken || body.token || body.refreshToken || '').trim();
          const rawRefresh = (body.refreshToken || body.token || '').trim();

          if (!rawAccess && !rawRefresh) {
            sendJson(res, 400, { ok: false, error: 'Token 或 Refresh Token 不能为空' });
            return;
          }

          const claims = parseJWTClaims(rawAccess) || parseJWTClaims(rawRefresh) || {};
          const uid = body.uid || claims.sub || claims.uid || `user-${Date.now().toString(36)}`;
          let realm = (body.realm || '').toLowerCase();
          if (!realm) {
            const iss = String(claims.iss || '').toLowerCase();
            realm = iss.includes('codebuddy') || iss.includes('tencent') ? 'cn' : 'global';
          }
          const nickname = body.nickname || claims.nickname || claims.name || claims.email || `Account-${String(uid).slice(0, 6)}`;

          const candidate = {
            account: {
              uid: String(uid),
              nickname: String(nickname),
              enterpriseId: body.enterpriseId || '',
              provider: claims.provider || ''
            },
            auth: {
              realm: realm === 'cn' ? 'cn' : 'global',
              accessToken: rawAccess || rawRefresh,
              refreshToken: rawRefresh || rawAccess,
              expiresAt: claims.exp ? claims.exp * 1000 : Date.now() + 7200000,
              domain: realm === 'cn' ? 'copilot.tencent.com' : 'www.workbuddy.ai'
            }
          };

          try {
            if (candidate.auth.refreshToken) {
              await client.refreshToken(candidate);
            } else {
              await client.fetchBalance(candidate);
            }
          } catch (e) {
            await client.fetchBalance(candidate);
          }

          store.upsert(candidate);
          invalidateBalance(candidate.account.uid);
          sendJson(res, 200, { ok: true, account: candidate });
        } catch (err) {
          sendJson(res, 400, { ok: false, error: `账号凭证验证失败: ${err.message}` });
        }
      }
    },

    // 4. 删除账号
    {
      path: '/plugins/dsh-workbuddy2api/accounts/delete',
      handler: async (req, res) => {
        const body = await parseJsonBody(req);
        const deleted = store.delete(body.uid);
        invalidateBalance(body.uid);
        sendJson(res, 200, { ok: deleted });
      }
    },

    // 5. 批量导入账号 (支持 ZIP 二进制流 / JSON base64Zip / 多格式文本卡密)
    {
      path: '/plugins/dsh-workbuddy2api/accounts/import',
      handler: async (req, res) => {
        try {
          const u = new URL(req.url, 'http://localhost');
          const contentType = String(req.headers['content-type'] || '').toLowerCase();
          const rawBuf = await parseRawBody(req);
          let input = rawBuf;
          let defaultRealm = u.searchParams.get('realm') || 'global';

          const looksBinaryZip =
            contentType.includes('application/zip') ||
            contentType.includes('application/octet-stream') ||
            (rawBuf.length >= 2 && rawBuf[0] === 0x50 && rawBuf[1] === 0x4b);

          if (!looksBinaryZip) {
            const text = rawBuf.toString('utf8');
            if (contentType.includes('application/json') || text.trim().startsWith('{')) {
              try {
                const parsed = JSON.parse(text);
                if (parsed.defaultRealm) defaultRealm = parsed.defaultRealm;
                if (parsed.base64Zip) {
                  input = Buffer.from(parsed.base64Zip, 'base64');
                } else if (typeof parsed.content === 'string') {
                  input = parsed.content;
                } else {
                  input = text;
                }
              } catch (_) {
                input = text;
              }
            } else {
              input = text;
            }
          }

          const result = await batchImportAccounts(input, store, client, defaultRealm);
          invalidateBalance();
          sendJson(res, 200, result);
        } catch (err) {
          sendJson(res, 400, { ok: false, error: `批量导入失败: ${err.message}` });
        }
      }
    },

    // 6. 导出完整账号池 ZIP 备份包
    {
      path: '/plugins/dsh-workbuddy2api/accounts/export.zip',
      handler: async (_req, res) => {
        const zipBuf = exportBackupZip(store);
        const stamp = new Date().toISOString().slice(0, 10);
        res.writeHead(200, {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="workbuddy2api-backup-${stamp}.zip"`,
          'Content-Length': String(zipBuf.length)
        });
        res.end(zipBuf);
      }
    },

    // 7. 账号运行管控 (启用 / 停用 / 解除熔断复活 / 刷新 Token & 积分 / 国际版领 Trial)
    {
      path: '/plugins/dsh-workbuddy2api/accounts/admin',
      handler: async (req, res) => {
        try {
          const body = await parseJsonBody(req);
          const { uid, action } = body;
          const acc = store.get(uid);
          if (!acc) {
            sendJson(res, 404, { ok: false, error: '账号未找到' });
            return;
          }

          if (action === 'enable') {
            store.setDisabled(uid, false, '');
            scheduler.clearCooldown(uid);
            sendJson(res, 200, { ok: true, message: `已启用账号 ${acc.account.nickname}` });
            return;
          }
          if (action === 'manualEnable') {
            store.setManualDisabled(uid, false, '');
            sendJson(res, 200, { ok: true, message: `已解除账号 ${acc.account.nickname} 手动停用` });
            return;
          }
          if (action === 'disable') {
            store.setManualDisabled(uid, true, body.reason || '手动停用');
            sendJson(res, 200, { ok: true, message: `已手动停用账号 ${acc.account.nickname}` });
            return;
          }
          if (action === 'revive' || action === 'clearCooldown') {
            store.reviveAccount(uid);
            scheduler.clearCooldown(uid);
            sendJson(res, 200, { ok: true, message: `已复活并解除 ${acc.account.nickname} 自动禁用/冷却状态` });
            return;
          }
          if (action === 'refresh') {
            if (acc.auth?.refreshToken) {
              await client.refreshToken(acc);
              store.upsert(acc);
            }
            scheduler.clearCooldown(uid);
            invalidateBalance(uid);
            const balance = await getAccountBalance(acc, true);
            sendJson(res, 200, { ok: true, message: 'Token 与积分已刷新', balance });
            return;
          }
          if (action === 'trial') {
            const trialRes = await claimGlobalTrial(acc, client);
            invalidateBalance(uid);
            sendJson(res, trialRes.ok ? 200 : 400, trialRes);
            return;
          }

          sendJson(res, 400, { ok: false, error: `未知管控动作: ${action}` });
        } catch (err) {
          sendJson(res, 500, { ok: false, error: err.message });
        }
      }
    },
    {
      path: '/plugins/dsh-workbuddy2api/accounts/update_token',
      handler: async (req, res) => {
        try {
          const body = await parseJsonBody(req);
          const { uid, accessToken, refreshToken } = body;
          const existing = store.get(uid);
          if (!existing) {
            sendJson(res, 404, { ok: false, error: '账号未找到' });
            return;
          }
          const rawAccess = String(accessToken || '').trim();
          const rawRefresh = String(refreshToken || '').trim();
          if (!rawAccess && !rawRefresh) {
            sendJson(res, 400, { ok: false, error: '必须提供新 Access Token 或 Refresh Token' });
            return;
          }
          const acc = store.updateAccountToken(uid, rawAccess || existing.auth.accessToken, rawRefresh || existing.auth.refreshToken);
          if (acc.auth.refreshToken && !rawAccess) {
            await client.refreshToken(acc);
            store.upsert(acc);
          }
          scheduler.clearCooldown(uid);
          invalidateBalance(uid);
          const balance = await getAccountBalance(acc, true);
          sendJson(res, 200, { ok: true, message: `已更新并救活账号 ${acc.account.nickname}`, balance });
        } catch (err) {
          sendJson(res, 400, { ok: false, error: `凭证更新失败: ${err.message}` });
        }
      }
    },

    // 8. 全局一键解除所有熔断 & 批量刷新全部 Token
    {
      path: '/plugins/dsh-workbuddy2api/accounts/clear-all-cooldowns',
      handler: async (_req, res) => {
        const cleared = scheduler.clearAllCooldowns();
        sendJson(res, 200, { ok: true, cleared, message: `已清理 ${cleared} 条熔断冷却记录` });
      }
    },
    {
      path: '/plugins/dsh-workbuddy2api/accounts/refresh-all',
      handler: async (_req, res) => {
        const result = await scheduler.refreshAllTokens(false);
        invalidateBalance();
        sendJson(res, 200, { ok: true, ...result });
      }
    },

    // 9. 官方 OAuth 网页一键授权登录
    {
      path: '/plugins/dsh-workbuddy2api/oauth/start',
      handler: async (req, res) => {
        try {
          const body = await parseJsonBody(req);
          const flow = await startOAuthFlow(body.realm || 'cn');
          sendJson(res, 200, { ok: true, ...flow });
        } catch (err) {
          sendJson(res, 400, { ok: false, error: err.message });
        }
      }
    },
    {
      path: '/plugins/dsh-workbuddy2api/oauth/poll',
      handler: async (req, res) => {
        try {
          const body = await parseJsonBody(req);
          const poll = await pollOAuthFlow(body.realm || 'cn', body.state, store);
          if (poll.success && poll.account?.account?.uid) {
            invalidateBalance(poll.account.account.uid);
          }
          sendJson(res, 200, { ok: true, ...poll });
        } catch (err) {
          sendJson(res, 400, { ok: false, error: err.message });
        }
      }
    },

    // 10. 官方邀请码与受邀绑定中心
    {
      path: '/plugins/dsh-workbuddy2api/invite/info',
      handler: async (req, res) => {
        const u = new URL(req.url, 'http://localhost');
        const uid = u.searchParams.get('uid') || store.activeUid;
        const target = store.get(uid);
        if (!target) {
          sendJson(res, 404, { ok: false, message: '账号未找到' });
          return;
        }
        try {
          const info = await fetchInviteInfo(target, client);
          sendJson(res, 200, { ok: true, uid, info });
        } catch (err) {
          sendJson(res, 500, { ok: false, message: err.message });
        }
      }
    },
    {
      path: '/plugins/dsh-workbuddy2api/invite/bind',
      handler: async (req, res) => {
        const body = await parseJsonBody(req);
        const uid = body.uid || store.activeUid;
        const target = store.get(uid);
        if (!target) {
          sendJson(res, 404, { ok: false, message: '账号未找到' });
          return;
        }
        const result = await bindInviteCode(target, body.inviteCode, client);
        invalidateBalance(target.account.uid);
        sendJson(res, result.ok ? 200 : 400, result);
      }
    },

    // 11. 每日签到 (支持单号或全量签到)
    {
      path: '/plugins/dsh-workbuddy2api/checkin',
      handler: async (req, res) => {
        const body = await parseJsonBody(req);
        if (body.all) {
          const list = store.getAll().filter((a) => !a.disabled);
          const results = [];
          for (const acc of list) {
            try {
              const r = await performCheckin(acc);
              markCheckinState(acc.account.uid, r);
              results.push({ uid: acc.account.uid, nickname: acc.account.nickname, ...r });
            } catch (e) {
              const errRes = { ok: false, status: 'FAIL', message: e.message };
              markCheckinState(acc.account.uid, errRes);
              results.push({ uid: acc.account.uid, nickname: acc.account.nickname, ...errRes });
            }
          }
          invalidateBalance();
          sendJson(res, 200, { ok: true, results, message: `已完成 ${results.length} 个账号签到巡检` });
          return;
        }

        const target = (body.uid && store.get(body.uid)) || store.getActive();
        if (!target) {
          sendJson(res, 400, { ok: false, message: '无可用账号' });
          return;
        }
        const result = await performCheckin(target);
        markCheckinState(target.account.uid, result);
        invalidateBalance(target.account.uid);
        sendJson(res, 200, result);
      }
    },
    {
      path: '/plugins/dsh-workbuddy2api/trial/batch',
      handler: async (_req, res) => {
        const globals = store.getAll().filter((a) => !scheduler.isAccountUnavailable(a) && a.auth?.realm === 'global');
        const results = [];
        for (const acc of globals) {
          try {
            const r = await claimGlobalTrial(acc, client);
            results.push({ uid: acc.account.uid, nickname: acc.account.nickname, ...r });
          } catch (e) {
            results.push({ uid: acc.account.uid, nickname: acc.account.nickname, ok: false, error: e.message });
          }
        }
        invalidateBalance();
        sendJson(res, 200, { ok: true, results });
      }
    },

    // 12. 用量统计（含历史日期筛选、按模型倍率/消耗明细）、实时请求流水与账本重置
    {
      path: '/plugins/dsh-workbuddy2api/usage',
      handler: async (req, res) => {
        const u = new URL(req.url, 'http://localhost');
        const dateParam = u.searchParams.get('date') || '';
        sendJson(res, 200, {
          ok: true,
          stats: ledger.getStats(loopback.getModelCatalogMap(), dateParam),
          inFlightRequests: scheduler.getInFlightRequests()
        });
      }
    },
    {
      path: '/plugins/dsh-workbuddy2api/logs',
      handler: async (_req, res) => {
        sendJson(res, 200, {
          ok: true,
          logs: ledger.getRecentLogs(),
          inFlight: scheduler.getInFlightRequests()
        });
      }
    },
    {
      path: '/plugins/dsh-workbuddy2api/playground/chat',
      handler: async (req, res) => {
        const body = await parseJsonBody(req);
        if (!body || !body.messages) {
          sendJson(res, 400, { ok: false, error: '请求体缺少 messages' });
          return;
        }
        await loopback.executeChatPipeline(req, res, body, 'chat', body.model);
      }
    },
    {
      path: '/plugins/dsh-workbuddy2api/dsh/check',
      handler: async (_req, res) => {
        const dshHome = store.dshHome || process.env.DSH_HOME || path.join(os.homedir(), '.dsh');
        const profilePkgPath = path.join(dshHome, 'profiles', 'desktop', 'package.json');
        const patchPath = path.join(dshHome, 'profiles', 'desktop', 'cordis.patch.yml');
        const port = loopback.actualPort || loopback.preferredPort || 7863;
        const expectedBaseUrl = `http://127.0.0.1:${port}/v1`;

        let installedInProfile = false;
        let baseUrlMatched = false;
        let patchPreview = '';

        try {
          if (fs.existsSync(profilePkgPath)) {
            const pkg = JSON.parse(fs.readFileSync(profilePkgPath, 'utf8'));
            installedInProfile = Boolean(pkg.dependencies?.['dsh-workbuddy2api']);
          }
          if (fs.existsSync(patchPath)) {
            const yml = fs.readFileSync(patchPath, 'utf8');
            baseUrlMatched = yml.includes(expectedBaseUrl);
            patchPreview = yml.split(/\r?\n/).slice(0, 60).join('\n');
          }
        } catch (_) {}

        sendJson(res, 200, {
          ok: true,
          dshHome,
          installedInProfile,
          baseUrlMatched,
          expectedBaseUrl,
          patchPath,
          patchPreview
        });
      }
    },
    {
      path: '/plugins/dsh-workbuddy2api/dsh/sync',
      handler: async (_req, res) => {
        const dshHome = store.dshHome || process.env.DSH_HOME || path.join(os.homedir(), '.dsh');
        const patchPath = path.join(dshHome, 'profiles', 'desktop', 'cordis.patch.yml');
        const port = loopback.actualPort || loopback.preferredPort || 7863;
        const expectedBaseUrl = `http://127.0.0.1:${port}/v1`;
        try {
          let content = fs.existsSync(patchPath) ? fs.readFileSync(patchPath, 'utf8') : '';
          if (content.includes('baseURL:')) {
            content = content.replace(/(workbuddy:[\s\S]*?baseURL:\s*).*/, `$1${expectedBaseUrl}`);
          }
          fs.mkdirSync(path.dirname(patchPath), { recursive: true });
          fs.writeFileSync(patchPath, content, 'utf8');
          sendJson(res, 200, { ok: true, message: `已同步 baseURL -> ${expectedBaseUrl}`, expectedBaseUrl });
        } catch (err) {
          sendJson(res, 500, { ok: false, error: err.message });
        }
      }
    },
    {
      path: '/plugins/dsh-workbuddy2api/stats/reset',
      handler: async (_req, res) => {
        ledger.reset();
        sendJson(res, 200, { ok: true, message: '用量账本已重置' });
      }
    },

    // 13. 模型目录动态发现、启用过滤与别名持久化
    {
      path: '/plugins/dsh-workbuddy2api/models',
      handler: async (req, res) => {
        if (req.method === 'POST') {
          const body = await parseJsonBody(req);
          const patch = {};
          if (Array.isArray(body.enabledModels)) {
            patch.enabledModels = body.enabledModels;
            loopback.enabledModels = new Set(body.enabledModels);
          }
          if (body.aliases && typeof body.aliases === 'object') {
            patch.aliases = body.aliases;
            loopback.modelAliases = { ...DEFAULT_MODEL_ALIASES, ...body.aliases };
          }
          if (Array.isArray(body.freeModels)) {
            patch.freeModels = body.freeModels;
          }
          if (body.modelRoutes && typeof body.modelRoutes === 'object') {
            patch.modelRoutes = body.modelRoutes;
          }
          if (typeof body.autoFreeEnabled === 'boolean') {
            patch.autoFreeEnabled = body.autoFreeEnabled;
          }
          const updated = configStore ? configStore.update(patch) : patch;
          sendJson(res, 200, {
            ok: true,
            enabledModels: updated.enabledModels || Array.from(loopback.enabledModels),
            aliases: updated.aliases || loopback.modelAliases,
            freeModels: updated.freeModels || [],
            modelRoutes: updated.modelRoutes || {},
            autoFreeEnabled: updated.autoFreeEnabled !== false
          });
        } else {
          const cfg = getRuntimeCfg();
          sendJson(res, 200, {
            ok: true,
            models: loopback.getMergedModels(true),
            enabledModels: cfg.enabledModels || Array.from(loopback.enabledModels),
            aliases: { ...DEFAULT_MODEL_ALIASES, ...(cfg.aliases || {}) },
            freeModels: cfg.freeModels || [],
            modelRoutes: cfg.modelRoutes || {},
            autoFreeEnabled: cfg.autoFreeEnabled !== false
          });
        }
      }
    },
    {
      path: '/plugins/dsh-workbuddy2api/models/discover',
      handler: async (_req, res) => {
        const models = await loopback.refreshDiscoveredModels();
        sendJson(res, 200, {
          ok: true,
          models,
          discoveredCount: loopback.discoveredModels?.length || 0
        });
      }
    },

    // 14. 网关持久化配置读写
    {
      path: '/plugins/dsh-workbuddy2api/config',
      handler: async (req, res) => {
        if (!configStore) {
          sendJson(res, 501, { ok: false, error: 'ConfigStore 未初始化' });
          return;
        }
        if (req.method === 'POST') {
          const body = await parseJsonBody(req);
          const updated = configStore.update(body);
          if (typeof body.proxy === 'string') {
            client.proxy = body.proxy;
          }
          if (typeof body.maxInFlightCN === 'number') {
            scheduler.maxInFlightCN = updated.maxInFlightCN;
          }
          if (typeof body.maxInFlightGlobal === 'number') {
            scheduler.maxInFlightGlobal = updated.maxInFlightGlobal;
          }
          if (typeof body.queueTimeoutMs === 'number') {
            scheduler.queueTimeoutMs = updated.queueTimeoutMs;
          }
          sendJson(res, 200, { ok: true, config: updated });
        } else {
          sendJson(res, 200, { ok: true, config: configStore.getAll() });
        }
      }
    },

    // 15. 猫猫旅行系列接口
    {
      path: '/plugins/dsh-workbuddy2api/travel/status',
      handler: async (req, res) => {
        const u = new URL(req.url, 'http://localhost');
        const uid = u.searchParams.get('uid') || store.activeUid;
        const target = store.get(uid);
        if (!target) {
          sendJson(res, 404, { ok: false, message: '账号未找到' });
          return;
        }
        const buddy = await getBuddyInfo(target);
        const travel = await getTravelStatus(target);
        sendJson(res, 200, { ok: true, uid, buddy, travel });
      }
    },
    {
      path: '/plugins/dsh-workbuddy2api/travel/depart',
      handler: async (req, res) => {
        const body = await parseJsonBody(req);
        const uid = body.uid || store.activeUid;
        const target = store.get(uid);
        if (!target) {
          sendJson(res, 404, { ok: false, message: '账号未找到' });
          return;
        }
        const result = await departTravel(target, body.locationId || 4);
        sendJson(res, 200, result);
      }
    },
    {
      path: '/plugins/dsh-workbuddy2api/travel/claim',
      handler: async (req, res) => {
        const body = await parseJsonBody(req);
        const uid = body.uid || store.activeUid;
        const target = store.get(uid);
        if (!target) {
          sendJson(res, 404, { ok: false, message: '账号未找到' });
          return;
        }
        const result = await claimTravel(target, body.recordId);
        invalidateBalance(target.account.uid);
        sendJson(res, 200, result);
      }
    },
    {
      path: '/plugins/dsh-workbuddy2api/travel/adopt',
      handler: async (req, res) => {
        const body = await parseJsonBody(req);
        const uid = body.uid || store.activeUid;
        const target = store.get(uid);
        if (!target) {
          sendJson(res, 404, { ok: false, message: '账号未找到' });
          return;
        }
        if (target.auth?.realm === 'global') {
          sendJson(res, 400, { ok: false, message: '仅国内版账号支持猫猫系统' });
          return;
        }
        await agreeBuddy(target);
        let adoptRes = await adoptFirstBuddy(target);
        if (!adoptRes.ok && adoptRes.incomplete) {
          await reportActiveChat(target, 5);
          adoptRes = await adoptFirstBuddy(target);
        }
        const buddy = await getBuddyInfo(target);
        invalidateBalance(target.account.uid);
        sendJson(res, 200, { ...adoptRes, buddy });
      }
    },
    {
      path: '/plugins/dsh-workbuddy2api/travel/run',
      handler: async (req, res) => {
        const body = await parseJsonBody(req);
        const uid = body.uid || store.activeUid;
        const target = store.get(uid);
        if (!target) {
          sendJson(res, 404, { ok: false, message: '账号未找到' });
          return;
        }
        const resRun = await runTravelForAccount(target);
        invalidateBalance(target.account.uid);
        const acts = resRun.results?.actions || [];
        const summary = resRun.status === 'ok'
          ? (acts.map((a) => a.message).filter(Boolean).join('；') || '猫猫旅行巡检完成')
          : (resRun.detail || resRun.reason || '猫猫巡检跳过或失败');
        sendJson(res, 200, { ok: resRun.status === 'ok', summary, ...resRun });
      }
    },
    {
      path: '/plugins/dsh-workbuddy2api/travel/run-all',
      handler: async (_req, res) => {
        const results = await scheduler.runAllTravel();
        invalidateBalance();
        sendJson(res, 200, {
          ok: true,
          results,
          message: `已完成 ${results.length} 个国内版账号猫猫旅行巡检`
        });
      }
    },

    // 16. 连登抽奖与全套福利
    {
      path: '/plugins/dsh-workbuddy2api/growth/status',
      handler: async (req, res) => {
        const u = new URL(req.url, 'http://localhost');
        const uid = u.searchParams.get('uid') || store.activeUid;
        const target = store.get(uid);
        if (!target) {
          sendJson(res, 404, { ok: false, message: '账号未找到' });
          return;
        }
        const streak = await getStreak(target);
        const chances = await getLotteryChances(target);
        const rs = streak.redemptionStatus || {};
        const tiers = [
          { tier: '7d', label: '7天连登礼', status: rs.tier_7d_status || 'locked' },
          { tier: '14d', label: '14天连登礼', status: rs.tier_14d_status || 'locked' },
          { tier: '28d', label: '28天连登礼', status: rs.tier_28d_status || 'locked' }
        ];
        sendJson(res, 200, { ok: true, uid, streak, tiers, chances, chancesRemaining: chances });
      }
    },
    {
      path: '/plugins/dsh-workbuddy2api/growth/redeem',
      handler: async (req, res) => {
        const body = await parseJsonBody(req);
        const uid = body.uid || store.activeUid;
        const target = store.get(uid);
        if (!target) {
          sendJson(res, 404, { ok: false, message: '账号未找到' });
          return;
        }
        const tier = body.tier || '7d';
        const result = await redeemStreakTier(target, tier);
        invalidateBalance(target.account.uid);
        sendJson(res, 200, result);
      }
    },
    {
      path: '/plugins/dsh-workbuddy2api/growth/makeup',
      handler: async (req, res) => {
        const body = await parseJsonBody(req);
        const uid = body.uid || store.activeUid;
        const target = store.get(uid);
        if (!target) {
          sendJson(res, 404, { ok: false, message: '账号未找到' });
          return;
        }
        const result = await checkAndUseMakeupCard(target);
        const msgMap = {
          no_cards: '当前没有可用的补签卡',
          no_missed_day: '昨日已打卡或无需补签',
          skipped_global: '国际版账号无连登补签体系'
        };
        sendJson(res, 200, {
          ...result,
          message: result.message || msgMap[result.reason] || '补签检查完成'
        });
      }
    },
    {
      path: '/plugins/dsh-workbuddy2api/growth/gift',
      handler: async (req, res) => {
        const body = await parseJsonBody(req);
        const uid = body.uid || store.activeUid;
        const target = store.get(uid);
        if (!target) {
          sendJson(res, 404, { ok: false, message: '账号未找到' });
          return;
        }
        const activeRes = await reportActiveChat(target, 5);
        const giftRes = await claimGift(target);
        const compRes = await claimCompensation(target);
        const totalCredits = (giftRes.ok ? (giftRes.credit || 0) : 0) + (compRes.ok ? (compRes.credit || 0) : 0);
        invalidateBalance(target.account.uid);
        sendJson(res, 200, {
          ok: Boolean(activeRes.ok || giftRes.ok || compRes.ok),
          totalCredits,
          items: [
            { name: '对话活跃上报', ...activeRes },
            { name: '新手礼包', ...giftRes },
            { name: '活动补偿', ...compRes }
          ],
          message: `活跃与礼包巡检完成，累计获得 +${totalCredits} 积分`
        });
      }
    },
    {
      path: '/plugins/dsh-workbuddy2api/growth/claim-all',
      handler: async (req, res) => {
        const body = await parseJsonBody(req);
        if (body.all) {
          const results = await scheduler.runAllWelfare();
          invalidateBalance();
          sendJson(res, 200, {
            ok: true,
            results,
            message: `已完成 ${results.length} 个账号的全套福利与成长任务`
          });
          return;
        }
        const uid = body.uid || store.activeUid;
        const target = store.get(uid);
        if (!target) {
          sendJson(res, 404, { ok: false, message: '账号未找到' });
          return;
        }
        const result = await claimAllWelfare(target);
        invalidateBalance(target.account.uid);
        sendJson(res, 200, { ok: true, uid, result, message: result.summary });
      }
    },
    {
      path: '/plugins/dsh-workbuddy2api/growth/lottery/draw',
      handler: async (req, res) => {
        const body = await parseJsonBody(req);
        const uid = body.uid || store.activeUid;
        const target = store.get(uid);
        if (!target) {
          sendJson(res, 404, { ok: false, message: '账号未找到' });
          return;
        }
        const result = await drawLottery(target);
        const chances = await getLotteryChances(target);
        invalidateBalance(target.account.uid);
        sendJson(res, 200, { ok: true, uid, result, remainingChances: chances });
      }
    },

    // 17. 全自动成长任务（支持单号查询/触发与全号一键跑完）
    {
      path: '/plugins/dsh-workbuddy2api/tasks/list',
      handler: async (req, res) => {
        const u = new URL(req.url, 'http://localhost');
        const uid = u.searchParams.get('uid') || store.activeUid;
        const target = store.get(uid);
        if (!target) {
          sendJson(res, 404, { ok: false, message: '账号未找到' });
          return;
        }
        const tasks = await fetchGrowthTasks(target);
        sendJson(res, 200, { ok: true, uid, tasks });
      }
    },
    {
      path: '/plugins/dsh-workbuddy2api/tasks/run',
      handler: async (req, res) => {
        const body = await parseJsonBody(req);
        if (body.all) {
          const cnAccs = store.getAll().filter((a) => !a.disabled && a.auth?.realm !== 'global');
          const results = [];
          for (const acc of cnAccs) {
            try {
              const r = await runAllGrowthTasks(acc);
              results.push({ uid: acc.account.uid, nickname: acc.account.nickname, ok: true, result: r });
            } catch (e) {
              results.push({ uid: acc.account.uid, nickname: acc.account.nickname, ok: false, error: e.message });
            }
            await new Promise((r) => setTimeout(r, 800));
          }
          invalidateBalance();
          sendJson(res, 200, { ok: true, results });
          return;
        }

        const uid = body.uid || store.activeUid;
        const target = store.get(uid);
        if (!target) {
          sendJson(res, 404, { ok: false, message: '账号未找到' });
          return;
        }
        const result = await runAllGrowthTasks(target);
        invalidateBalance(target.account.uid);
        sendJson(res, 200, { ok: true, uid, result });
      }
    },

    // 17.1 开学季活动 (school_open_day_2026) 盘点、自动点灯、领积分与大转盘抽奖
    {
      path: '/plugins/dsh-workbuddy2api/school/status',
      handler: async (req, res) => {
        const u = new URL(req.url, 'http://localhost');
        const uid = u.searchParams.get('uid') || store.activeUid;
        const target = store.get(uid);
        if (!target) {
          sendJson(res, 404, { ok: false, message: '账号未找到' });
          return;
        }
        const status = await fetchSchoolStatus(target);
        sendJson(res, 200, { ok: Boolean(status?.ok), uid, status });
      }
    },
    {
      path: '/plugins/dsh-workbuddy2api/school/run',
      handler: async (req, res) => {
        const body = await parseJsonBody(req);
        const opts = {
          lightUp: body.lightUp !== false,
          claim: body.claim !== false,
          draw: body.draw !== false
        };
        if (body.all) {
          const results = await scheduler.runAllSchool(opts);
          invalidateBalance();
          sendJson(res, 200, { ok: true, results });
          return;
        }
        const uid = body.uid || store.activeUid;
        const target = store.get(uid);
        if (!target) {
          sendJson(res, 404, { ok: false, message: '账号未找到' });
          return;
        }
        const result = await runSchoolActivity(target, opts);
        invalidateBalance(target.account.uid);
        sendJson(res, 200, { ok: Boolean(result?.ok), uid, result });
      }
    },
    {
      path: '/plugins/dsh-workbuddy2api/tasks/nightcat',
      handler: async (_req, res) => {
        const inWindow = isCSTNightWindow();
        if (!inWindow) {
          sendJson(res, 200, {
            ok: false,
            inWindow: false,
            results: [],
            message: '当前不在深夜猫猫任务时间窗口（需北京时间 23:00–08:00）'
          });
          return;
        }
        const results = await scheduler.runAllNightCat();
        invalidateBalance();
        sendJson(res, 200, {
          ok: true,
          inWindow: true,
          results,
          message: `已完成 ${results.length} 个国内版账号深夜猫猫巡检`
        });
      }
    },

    // 18. 极速实时余额刷新
    {
      path: '/plugins/dsh-workbuddy2api/balance',
      handler: async (req, res) => {
        const u = new URL(req.url, 'http://localhost');
        const uid = u.searchParams.get('uid') || store.activeUid;
        const target = store.get(uid);
        if (!target) {
          sendJson(res, 404, { ok: false, message: '账号未找到' });
          return;
        }
        try {
          const balance = await getAccountBalance(target, true);
          sendJson(res, 200, { ok: true, uid, balance });
        } catch (err) {
          sendJson(res, 500, { ok: false, error: err.message });
        }
      }
    },

    // 19. 控制台登录鉴权、自助注册与个人 API Key 管理
    {
      path: '/plugins/dsh-workbuddy2api/auth/me',
      handler: async (req, res) => {
        if (!userManager) {
          sendJson(res, 200, { ok: true, hasPassword: false, authenticated: true, user: { username: 'admin', role: 'admin' } });
          return;
        }
        const cfg = getRuntimeCfg();
        const check = userManager.checkWebAuth(req);
        sendJson(res, 200, {
          ok: true,
          hasPassword: userManager.hasWebPassword(),
          authenticated: check.ok,
          allowRegister: Boolean(cfg.allowRegister),
          user: check.ok ? check.user : null
        });
      }
    },
    {
      path: '/plugins/dsh-workbuddy2api/auth/login',
      handler: async (req, res) => {
        if (!userManager) {
          sendJson(res, 501, { ok: false, error: 'UserManager 未初始化' });
          return;
        }
        try {
          const body = await parseJsonBody(req);
          const clientIP = extractTrustedClientIP(req);
          const { token, user } = userManager.authenticate(body.username || 'admin', body.password || '', clientIP);
          res.setHeader(
            'Set-Cookie',
            `${UserManager.cookieName}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 86400}`
          );
          sendJson(res, 200, { ok: true, user, token });
        } catch (err) {
          sendJson(res, 401, { ok: false, error: err.message });
        }
      }
    },
    {
      path: '/plugins/dsh-workbuddy2api/auth/logout',
      handler: async (req, res) => {
        userManager?.logout(req);
        res.setHeader(
          'Set-Cookie',
          `${UserManager.cookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
        );
        sendJson(res, 200, { ok: true });
      }
    },
    {
      path: '/plugins/dsh-workbuddy2api/auth/register',
      handler: async (req, res) => {
        if (!userManager) {
          sendJson(res, 501, { ok: false, error: 'UserManager 未初始化' });
          return;
        }
        const cfg = getRuntimeCfg();
        if (!cfg.allowRegister) {
          sendJson(res, 403, { ok: false, error: '管理员已关闭自助注册功能' });
          return;
        }
        try {
          const body = await parseJsonBody(req);
          const user = userManager.createUser({
            username: body.username,
            password: body.password,
            role: 'user'
          });
          sendJson(res, 200, { ok: true, user });
        } catch (err) {
          sendJson(res, 400, { ok: false, error: err.message });
        }
      }
    },
    {
      path: '/plugins/dsh-workbuddy2api/user/apikey/reset',
      handler: async (req, res) => {
        if (!userManager) {
          sendJson(res, 501, { ok: false, error: 'UserManager 未初始化' });
          return;
        }
        const auth = userManager.checkWebAuth(req);
        if (!auth.ok || !auth.user) {
          sendJson(res, 401, { ok: false, error: '请先登录' });
          return;
        }
        const updated = userManager.resetUserApiKey(auth.user.username);
        sendJson(res, 200, { ok: true, apiKey: updated.apiKey, user: updated });
      }
    },

    // 20. 控制台密码、IP/CIDR 白名单、Webhook 告警与自动化排程设置
    {
      path: '/plugins/dsh-workbuddy2api/config/password',
      handler: async (req, res) => {
        if (!userManager) {
          sendJson(res, 501, { ok: false, error: 'UserManager 未初始化' });
          return;
        }
        const body = await parseJsonBody(req);
        const result = userManager.setAdminPassword(String(body.password || ''));
        sendJson(res, 200, {
          ok: true,
          ...result,
          message: result.hasPassword ? '控制台登录密码已更新启用' : '控制台密码已清除（单机免密模式）'
        });
      }
    },
    {
      path: '/plugins/dsh-workbuddy2api/config/ip_whitelist',
      handler: async (req, res) => {
        if (req.method === 'GET') {
          const cfg = getRuntimeCfg();
          sendJson(res, 200, {
            ok: true,
            ipWhitelist: cfg.ipWhitelist,
            detectedIPs: detectRuntimeIPs(),
            clientIP: extractTrustedClientIP(req)
          });
          return;
        }
        try {
          const body = await parseJsonBody(req);
          const { normalized } = parseWhitelistEntries(Array.isArray(body.allowedIPs) ? body.allowedIPs : []);
          const next = {
            enabled: Boolean(body.enabled),
            allowedIPs: normalized,
            allowLocalhost: body.allowLocalhost !== false
          };
          const updated = configStore ? configStore.update({ ipWhitelist: next }) : { ipWhitelist: next };
          sendJson(res, 200, {
            ok: true,
            ipWhitelist: updated.ipWhitelist,
            message: 'IP 白名单规则已保存并即时生效'
          });
        } catch (err) {
          sendJson(res, 400, { ok: false, error: err.message });
        }
      }
    },
    {
      path: '/plugins/dsh-workbuddy2api/config/alerts',
      handler: async (req, res) => {
        if (req.method === 'GET') {
          const cfg = getRuntimeCfg();
          sendJson(res, 200, {
            ok: true,
            alerts: cfg.alerts,
            history: alertManager?.history || []
          });
          return;
        }
        const body = await parseJsonBody(req);
        const webhooks = Array.isArray(body.webhooks)
          ? body.webhooks.map((s) => String(s).trim()).filter(Boolean)
          : String(body.webhooksText || '').split(/[\r\n,;]+/).map((s) => s.trim()).filter(Boolean);
        const events = Array.isArray(body.events) && body.events.length > 0
          ? body.events
          : ['ban', '401', 'cooling', 'low_credit'];
        const nextAlerts = {
          enabled: Boolean(body.enabled),
          webhooks,
          events,
          minCredit: Math.max(0, Number(body.minCredit ?? 50) || 0)
        };
        const updated = configStore ? configStore.update({ alerts: nextAlerts }) : { alerts: nextAlerts };
        sendJson(res, 200, {
          ok: true,
          alerts: updated.alerts,
          message: 'Webhook 风控告警配置已保存'
        });
      }
    },
    {
      path: '/plugins/dsh-workbuddy2api/config/alerts/test',
      handler: async (_req, res) => {
        if (!alertManager) {
          sendJson(res, 501, { ok: false, error: 'AlertManager 未初始化' });
          return;
        }
        const result = await alertManager.sendTestAlert();
        sendJson(res, result.ok ? 200 : 400, {
          ...result,
          history: alertManager.history,
          message: result.ok ? '测试告警已成功推送' : '测试告警推送失败，请检查 Webhook 地址'
        });
      }
    },
    {
      path: '/plugins/dsh-workbuddy2api/config/schedule',
      handler: async (req, res) => {
        const body = await parseJsonBody(req);
        const updated = configStore
          ? configStore.update({
              schedule: body.schedule,
              autoCheckin: body.autoCheckin,
              autoTravel: body.autoTravel,
              autoTasks: body.autoTasks,
              autoRefreshToken: body.autoRefreshToken
            })
          : body;
        sendJson(res, 200, { ok: true, config: updated, message: '自动化排程设置已保存' });
      }
    },

    // 21. 多租户用户与配额管控 (admin 专属)
    {
      path: '/plugins/dsh-workbuddy2api/admin/users',
      handler: async (_req, res) => {
        if (!userManager) {
          sendJson(res, 200, { ok: true, users: [], allowRegister: false });
          return;
        }
        const cfg = getRuntimeCfg();
        sendJson(res, 200, {
          ok: true,
          users: userManager.listUsers(),
          allowRegister: Boolean(cfg.allowRegister)
        });
      }
    },
    {
      path: '/plugins/dsh-workbuddy2api/admin/users/create',
      handler: async (req, res) => {
        try {
          const body = await parseJsonBody(req);
          const user = userManager.createUser(body);
          sendJson(res, 200, { ok: true, user });
        } catch (err) {
          sendJson(res, 400, { ok: false, error: err.message });
        }
      }
    },
    {
      path: '/plugins/dsh-workbuddy2api/admin/users/toggle',
      handler: async (req, res) => {
        try {
          const body = await parseJsonBody(req);
          const user = userManager.toggleUser(body.username, body.disabled);
          sendJson(res, 200, { ok: true, user });
        } catch (err) {
          sendJson(res, 400, { ok: false, error: err.message });
        }
      }
    },
    {
      path: '/plugins/dsh-workbuddy2api/admin/users/role',
      handler: async (req, res) => {
        try {
          const body = await parseJsonBody(req);
          const user = userManager.setUserRole(body.username, body.role);
          sendJson(res, 200, { ok: true, user });
        } catch (err) {
          sendJson(res, 400, { ok: false, error: err.message });
        }
      }
    },
    {
      path: '/plugins/dsh-workbuddy2api/admin/users/quota',
      handler: async (req, res) => {
        try {
          const body = await parseJsonBody(req);
          const user = userManager.setUserQuota(body.username, body.dailyCreditLimit, body.rpm);
          sendJson(res, 200, { ok: true, user });
        } catch (err) {
          sendJson(res, 400, { ok: false, error: err.message });
        }
      }
    },
    {
      path: '/plugins/dsh-workbuddy2api/admin/users/reset_password',
      handler: async (req, res) => {
        try {
          const body = await parseJsonBody(req);
          const user = userManager.resetUserPassword(body.username, body.password);
          sendJson(res, 200, { ok: true, user });
        } catch (err) {
          sendJson(res, 400, { ok: false, error: err.message });
        }
      }
    },
    {
      path: '/plugins/dsh-workbuddy2api/admin/users/reset_key',
      handler: async (req, res) => {
        try {
          const body = await parseJsonBody(req);
          const user = userManager.resetUserApiKey(body.username);
          sendJson(res, 200, { ok: true, user });
        } catch (err) {
          sendJson(res, 400, { ok: false, error: err.message });
        }
      }
    },
    {
      path: '/plugins/dsh-workbuddy2api/admin/users/delete',
      handler: async (req, res) => {
        try {
          const body = await parseJsonBody(req);
          userManager.deleteUser(body.username);
          sendJson(res, 200, { ok: true });
        } catch (err) {
          sendJson(res, 400, { ok: false, error: err.message });
        }
      }
    },
    {
      path: '/plugins/dsh-workbuddy2api/admin/system/allow_register',
      handler: async (req, res) => {
        const body = await parseJsonBody(req);
        const updated = configStore ? configStore.update({ allowRegister: Boolean(body.allowRegister) }) : body;
        sendJson(res, 200, { ok: true, allowRegister: Boolean(updated.allowRegister) });
      }
    },

    // 22. GitHub Releases 版本检查
    {
      path: '/plugins/dsh-workbuddy2api/system/update/check',
      handler: async (_req, res) => {
        try {
          const apiRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`, {
            headers: { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'dsh-workbuddy2api-updater' },
            signal: AbortSignal.timeout(8000)
          });
          if (apiRes.status === 404) {
            const tagsRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/tags?per_page=1`, {
              headers: { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'dsh-workbuddy2api-updater' },
              signal: AbortSignal.timeout(8000)
            });
            const tags = await tagsRes.json().catch(() => []);
            const latestTag = Array.isArray(tags) && tags[0]?.name ? tags[0].name : `v${SERVICE_VERSION}`;
            const normLatest = latestTag.replace(/^v/i, '');
            sendJson(res, 200, {
              ok: true,
              currentVersion: SERVICE_VERSION,
              latestVersion: latestTag,
              hasUpdate: normLatest !== SERVICE_VERSION && latestTag !== `v${SERVICE_VERSION}`,
              repoUrl: `https://github.com/${GITHUB_REPO}`,
              releaseNotes: '当前仓库暂无正式 Release，已读取最新 Git Tag。'
            });
            return;
          }
          if (!apiRes.ok) {
            throw new Error(`GitHub API HTTP ${apiRes.status}`);
          }
          const rel = await apiRes.json();
          const latestVersion = String(rel.tag_name || '').trim();
          const normLatest = latestVersion.replace(/^v/i, '');
          sendJson(res, 200, {
            ok: true,
            currentVersion: SERVICE_VERSION,
            latestVersion,
            hasUpdate: Boolean(normLatest && normLatest !== SERVICE_VERSION),
            releaseTitle: rel.name || latestVersion,
            releaseNotes: rel.body || '',
            releaseUrl: rel.html_url || `https://github.com/${GITHUB_REPO}/releases`,
            publishedAt: rel.published_at || ''
          });
        } catch (err) {
          sendJson(res, 200, {
            ok: false,
            currentVersion: SERVICE_VERSION,
            repoUrl: `https://github.com/${GITHUB_REPO}`,
            error: `检查更新失败: ${err.message}`
          });
        }
      }
    }
  ];

  // 公开免密端点与需会话鉴权控制
  const PUBLIC_PATHS = new Set([
    '/plugins/dsh-workbuddy2api/auth/me',
    '/plugins/dsh-workbuddy2api/auth/login',
    '/plugins/dsh-workbuddy2api/auth/logout',
    '/plugins/dsh-workbuddy2api/auth/register',
    '/plugins/dsh-workbuddy2api/public/status'
  ]);
  const USER_PATHS = new Set([
    '/plugins/dsh-workbuddy2api/status',
    '/plugins/dsh-workbuddy2api/usage',
    '/plugins/dsh-workbuddy2api/logs',
    '/plugins/dsh-workbuddy2api/models',
    '/plugins/dsh-workbuddy2api/playground/chat',
    '/plugins/dsh-workbuddy2api/user/apikey/reset'
  ]);

  // 构造统一路径分发表，供 Loopback 独立网关与 DSH WebServer 复用
  const routeMap = new Map(routes.map((r) => [r.path, r.handler]));
  const handlePluginRoute = async (req, res, pathname) => {
    const handler = routeMap.get(pathname);
    if (!handler) return false;
    try {
      if (userManager && !PUBLIC_PATHS.has(pathname)) {
        const auth = userManager.checkWebAuth(req);
        req._wbSessionUser = auth.user;
        if (!auth.ok) {
          sendJson(res, 401, { ok: false, authRequired: true, error: '请先登录控制台' });
          return true;
        }
        if (auth.user?.role !== 'admin' && !USER_PATHS.has(pathname)) {
          sendJson(res, 403, { ok: false, error: '仅管理员可执行此操作' });
          return true;
        }
      }
      await handler(req, res);
    } catch (err) {
      if (!res.headersSent) {
        sendJson(res, 500, { ok: false, error: err.message });
      }
    }
    return true;
  };

  if (loopback) {
    loopback.setPluginRouterHandler(handlePluginRoute);
    loopback.setPortalHandler(async (_req, res) => {
      if (!res.headersSent) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      }
      res.end(renderPortalHtml({ port: loopback.actualPort || loopback.preferredPort, version: SERVICE_VERSION }));
      return true;
    });
    loopback.setDashboardHandler(async (_req, res) => {
      if (!res.headersSent) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      }
      res.end(renderConsoleHtml({ port: loopback.actualPort || loopback.preferredPort }));
      return true;
    });
  }

  if (ctx?.effect) {
    ctx.effect(() => {
      const disposers = [];
      if (ctx.webServer && typeof ctx.webServer.register === 'function') {
        for (const route of routes) {
          try {
            const dispose = ctx.webServer.register({
              kind: 'exact',
              path: route.path,
              handler: route.handler
            });
            if (dispose) disposers.push(dispose);
          } catch (_) {}
        }
      }
      return () => {
        for (const d of disposers) {
          try { d(); } catch (_) {}
        }
      };
    }, 'dsh-workbuddy2api web routes');
  }

  return { routes, handlePluginRoute };
}

/**
 * web-routes.js - DSH 宿主 WebServer 内部通信路由注册
 * 
 * 供浏览器端卡片与前端面板无缝调用，进行多账号管理、模型选择、签到与用量查询
 */

import { performCheckin } from '../upstream/checkin.js';
import {
  getBuddyInfo,
  getTravelStatus,
  departTravel,
  claimTravel,
  runTravelForAccount
} from '../upstream/travel.js';
import {
  getStreak,
  getLotteryChances,
  drawLottery,
  claimAllWelfare
} from '../upstream/growth.js';
import {
  fetchGrowthTasks,
  runAllGrowthTasks
} from '../upstream/tasks.js';
import { STATIC_MODELS } from '../constants.js';

export function registerWebRoutes(ctx, deps) {
  const { scheduler, client, ledger, loopback } = deps;
  const store = scheduler.store;

  const balanceCache = new Map();
  const BALANCE_TTL = 30000;

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
      return bal;
    } catch (err) {
      if (cached) return cached.data;
      return { remain: 0, packages: [], error: err.message, fetchedAt: Date.now() };
    }
  }

  const invalidateBalance = (uid) => {
    if (uid) balanceCache.delete(uid);
    else balanceCache.clear();
  };

  const routes = [
    // 1. 状态总览接口
    {
      path: '/plugins/dsh-workbuddy2api/status',
      handler: async (req, res) => {
        const u = new URL(req.url, 'http://localhost');
        const force = u.searchParams.get('refresh') === '1';

        const all = store.getAll();
        const active = store.getActive();

        const accounts = await Promise.all(all.map(async (a) => {
          const isAct = a.account.uid === store.activeUid;
          const bal = await getAccountBalance(a, force && isAct);
          return {
            uid: a.account.uid,
            nickname: a.account.nickname,
            realm: a.auth.realm,
            inFlight: scheduler.getInFlight(a.account.uid),
            coolingDown: scheduler.isCoolingDown(a.account.uid),
            expiresAt: a.auth.expiresAt,
            updatedAt: a.updatedAt,
            balance: bal
          };
        }));

        let balance = null;
        if (active) {
          balance = await getAccountBalance(active, force);
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          ok: true,
          activeUid: store.activeUid,
          accounts,
          balance,
          gatewayPort: loopback.actualPort,
          aliases: loopback.modelAliases,
          enabledModels: Array.from(loopback.enabledModels)
        }));
      }
    },

    // 2. 账号切换接口
    {
      path: '/plugins/dsh-workbuddy2api/accounts/switch',
      handler: async (req, res) => {
        const body = await parseJsonBody(req);
        const success = store.setActive(body.uid);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: success, activeUid: store.activeUid }));
      }
    },

    // 3. 粘贴 Token 添加账号接口
    {
      path: '/plugins/dsh-workbuddy2api/accounts/add',
      handler: async (req, res) => {
        try {
          const body = await parseJsonBody(req);
          const rawToken = (body.token || body.refreshToken || '').trim();
          const realm = body.realm || 'global';
          const nickname = body.nickname || `Account-${Date.now().toString().slice(-4)}`;

          if (!rawToken) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: false, error: 'Token 或 Refresh Token 不能为空' }));
            return;
          }

          // 构造临时账号对象并向上游验证
          const candidate = {
            account: {
              uid: body.uid || `user-${Date.now().toString(36)}`,
              nickname,
              enterpriseId: body.enterpriseId || ''
            },
            auth: {
              realm,
              accessToken: body.accessToken || rawToken,
              refreshToken: rawToken,
              expiresAt: Date.now() + 7200000,
              domain: ''
            }
          };

          // 验证上游连通性与 Token 有效性
          try {
            await client.refreshToken(candidate);
          } catch (e) {
            // 如果刷新失败，尝试直接测试余额接口
            await client.fetchBalance(candidate);
          }

          store.upsert(candidate);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true, account: candidate }));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, error: `账号凭证验证失败: ${err.message}` }));
        }
      }
    },

    // 4. 删除账号接口
    {
      path: '/plugins/dsh-workbuddy2api/accounts/delete',
      handler: async (req, res) => {
        const body = await parseJsonBody(req);
        const deleted = store.delete(body.uid);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: deleted }));
      }
    },

    // 5. 手动每日签到接口
    {
      path: '/plugins/dsh-workbuddy2api/checkin',
      handler: async (req, res) => {
        const active = store.getActive();
        if (!active) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, message: '无可用账号' }));
          return;
        }

        const result = await performCheckin(active);
        invalidateBalance(active.account.uid);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      }
    },

    // 6. 用量账本统计接口
    {
      path: '/plugins/dsh-workbuddy2api/usage',
      handler: async (req, res) => {
        const stats = ledger.getStats();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, stats }));
      }
    },

    // 7. 模型启用过滤与别名配置
    {
      path: '/plugins/dsh-workbuddy2api/models',
      handler: async (req, res) => {
        if (req.method === 'POST') {
          const body = await parseJsonBody(req);
          if (Array.isArray(body.enabledModels)) {
            loopback.enabledModels = new Set(body.enabledModels);
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true, enabledModels: Array.from(loopback.enabledModels) }));
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true, models: STATIC_MODELS }));
        }
      }
    },

    // 8. 猫猫旅行状态查询接口
    {
      path: '/plugins/dsh-workbuddy2api/travel/status',
      handler: async (req, res) => {
        const u = new URL(req.url, 'http://localhost');
        const uid = u.searchParams.get('uid') || store.activeUid;
        const target = store.get(uid);
        if (!target) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, message: '账号未找到' }));
          return;
        }

        const buddy = await getBuddyInfo(target);
        const travel = await getTravelStatus(target);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, uid, buddy, travel }));
      }
    },

    // 9. 派出猫猫旅行接口
    {
      path: '/plugins/dsh-workbuddy2api/travel/depart',
      handler: async (req, res) => {
        const body = await parseJsonBody(req);
        const uid = body.uid || store.activeUid;
        const target = store.get(uid);
        if (!target) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, message: '账号未找到' }));
          return;
        }

        const result = await departTravel(target, body.locationId || 4);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      }
    },

    // 10. 领取猫猫旅行到站奖励接口
    {
      path: '/plugins/dsh-workbuddy2api/travel/claim',
      handler: async (req, res) => {
        const body = await parseJsonBody(req);
        const uid = body.uid || store.activeUid;
        const target = store.get(uid);
        if (!target) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, message: '账号未找到' }));
          return;
        }

        const result = await claimTravel(target, body.recordId);
        invalidateBalance(target.account.uid);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      }
    },

    // 11. 批量单趟旅行巡检接口
    {
      path: '/plugins/dsh-workbuddy2api/travel/run-all',
      handler: async (req, res) => {
        const results = await scheduler.runAllTravel();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, results }));
      }
    },

    // 12. 连登与成长活动状态查询
    {
      path: '/plugins/dsh-workbuddy2api/growth/status',
      handler: async (req, res) => {
        const u = new URL(req.url, 'http://localhost');
        const uid = u.searchParams.get('uid') || store.activeUid;
        const target = store.get(uid);
        if (!target) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, message: '账号未找到' }));
          return;
        }

        const streak = await getStreak(target);
        const chances = await getLotteryChances(target);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, uid, streak, chances }));
      }
    },

    // 13. 一键吃满全套福利 (单个或全部)
    {
      path: '/plugins/dsh-workbuddy2api/growth/claim-all',
      handler: async (req, res) => {
        const body = await parseJsonBody(req);
        if (body.all) {
          const results = await scheduler.runAllWelfare();
          invalidateBalance();
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true, results }));
          return;
        }

        const uid = body.uid || store.activeUid;
        const target = store.get(uid);
        if (!target) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, message: '账号未找到' }));
          return;
        }

        const result = await claimAllWelfare(target);
        invalidateBalance(target.account.uid);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, uid, result }));
      }
    },

    // 14. 连登抽奖
    {
      path: '/plugins/dsh-workbuddy2api/growth/lottery/draw',
      handler: async (req, res) => {
        const body = await parseJsonBody(req);
        const uid = body.uid || store.activeUid;
        const target = store.get(uid);
        if (!target) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, message: '账号未找到' }));
          return;
        }

        const result = await drawLottery(target);
        const chances = await getLotteryChances(target);
        invalidateBalance(target.account.uid);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, uid, result, remainingChances: chances }));
      }
    },

    // 15. 成长任务清单查询
    {
      path: '/plugins/dsh-workbuddy2api/tasks/list',
      handler: async (req, res) => {
        const u = new URL(req.url, 'http://localhost');
        const uid = u.searchParams.get('uid') || store.activeUid;
        const target = store.get(uid);
        if (!target) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, message: '账号未找到' }));
          return;
        }

        const tasks = await fetchGrowthTasks(target);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, uid, tasks }));
      }
    },

    // 16. 成长任务一键自动点亮与收割
    {
      path: '/plugins/dsh-workbuddy2api/tasks/run',
      handler: async (req, res) => {
        const body = await parseJsonBody(req);
        const uid = body.uid || store.activeUid;
        const target = store.get(uid);
        if (!target) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, message: '账号未找到' }));
          return;
        }

        const result = await runAllGrowthTasks(target);
        invalidateBalance(target.account.uid);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, uid, result }));
      }
    },

    // 17. 极速实时余额查询与主动刷新
    {
      path: '/plugins/dsh-workbuddy2api/balance',
      handler: async (req, res) => {
        const u = new URL(req.url, 'http://localhost');
        const uid = u.searchParams.get('uid') || store.activeUid;
        const target = store.get(uid);
        if (!target) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, message: '账号未找到' }));
          return;
        }

        try {
          const balance = await getAccountBalance(target, true);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true, uid, balance }));
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, error: err.message }));
        }
      }
    }
  ];

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

async function parseJsonBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch (_) {
        resolve({});
      }
    });
  });
}

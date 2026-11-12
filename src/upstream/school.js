/**
 * school.js - 纯 Node.js 开学季活动 (school_open_day_2026) 盘点、自动点亮、领奖与大转盘抽奖引擎
 * 完整对标 Go + school_open_day_2026.py，无需外部 Python 运行时即可直接执行
 */

import crypto from 'node:crypto';
import { CN_BILLING_BASE, CN_CHAT_BASE, REPORT_PATH } from '../constants.js';

const SCHOOL_BASE = `${CN_BILLING_BASE}/portal/activity/school`;
const FRESHMAN_BASE = `${CN_BILLING_BASE}/portal/activity/freshman`;
const TEACHER_BASE = `${CN_BILLING_BASE}/portal/activity/teacher`;
const ACTIVITY_ID = 'school_open_day_2026';

const MP_UA =
  'Mozilla/5.0 (Linux; Android 14; MicroMessenger/8.0.49 WeChat/0.8.0 MiniProgramEnv/android; wkbrowser xweb)';
const DESKTOP_UA = 'WorkBuddy/5.5.6 WorkBuddy/5.5.6 CLI/2.137.1';

export const SCHOOL_PRIZE_LABELS = {
  school_credit_6: { label: '6积分', type: 'credit' },
  school_credit_66: { label: '66积分', type: 'credit' },
  school_voucher_luckin: { label: '瑞幸咖啡15元券', type: 'voucher' },
  school_voucher_kfc_ok: { label: '肯德基OK餐券', type: 'voucher' },
  school_voucher_kfc_ice: { label: '肯德基冰淇淋券', type: 'voucher' },
  school_voucher_kugou: { label: '酷狗会员月卡券', type: 'voucher' }
};

function deriveId(uid, salt) {
  return crypto.createHash('md5').update(`${salt}:${uid || ''}`).digest('hex').slice(0, 36);
}

function buildMpHeaders(token, extra = {}) {
  return {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'User-Agent': MP_UA,
    ...extra
  };
}

async function mpJson(url, token, method = 'GET', body = null, fetchFn = fetch, extraHeaders = {}) {
  const res = await fetchFn(url, {
    method,
    headers: buildMpHeaders(token, extraHeaders),
    ...(body !== null ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(15000)
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok && data?.code === 0, data };
}

export async function fetchSchoolStatus(account, fetchFn = fetch) {
  if (!account || account.auth?.realm === 'global') {
    return { ok: true, skipped: true, reason: 'global_account_skipped', inPeriod: false, tasks: [] };
  }
  const token = account.auth?.accessToken || '';
  if (!token) return { ok: false, error: '账号缺少有效 accessToken' };

  try {
    const tasksRes = await mpJson(`${SCHOOL_BASE}/tasks`, token, 'GET', null, fetchFn);
    if (!tasksRes.ok) {
      return {
        ok: false,
        status: tasksRes.status,
        error: tasksRes.data?.message || tasksRes.data?.msg || `HTTP ${tasksRes.status}`
      };
    }
    const d = tasksRes.data?.data || {};
    const cfgRes = await mpJson(`${SCHOOL_BASE}/config`, token, 'GET', null, fetchFn).catch(() => null);
    const freshRes = await mpJson(`${FRESHMAN_BASE}/profile`, token, 'GET', null, fetchFn).catch(() => null);
    const teacherRes = await mpJson(`${TEACHER_BASE}/profile`, token, 'GET', null, fetchFn).catch(() => null);

    return {
      ok: true,
      inPeriod: Boolean(d.in_period),
      tasks: d.tasks || [],
      chance: cfgRes?.ok ? (cfgRes.data?.data?.chance || {}) : {},
      freshman: freshRes?.ok ? freshRes.data?.data : null,
      teacher: teacherRes?.ok ? teacherRes.data?.data : null
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function fetchSchoolExpert(token, fetchFn = fetch) {
  try {
    const res = await mpJson(
      `${CN_BILLING_BASE}/v2/operation-platform/market/expert/list`,
      token,
      'POST',
      {
        edition_mode: 'all,domestic',
        page: 1,
        page_size: 20,
        sort_by: 'use_count',
        sort_order: 'desc',
        categories: ['16-BackToSchool'],
        expert_type: 'agent'
      },
      fetchFn
    );
    const experts = res.data?.data?.experts || [];
    for (const e of experts) {
      if (e?.expert_id) {
        const dn = typeof e.display_name_zh === 'object' ? e.display_name_zh?.zh : e.display_name_zh;
        return { id: e.expert_id, name: dn || e.expert_id };
      }
    }
  } catch (_) {}
  return { id: 'ex_jB0dyFIQJEWa', name: '论小舟' };
}

function buildSchoolDesktopEvents(account) {
  const uid = account.account?.uid || '';
  const nick = account.account?.nickname || '';
  const now = Date.now();
  const conv = `wbdesk-${now}`;
  const fp = {
    timezone: 'Asia/Shanghai',
    reportDelay: 2000,
    userId: uid,
    username: nick,
    userNickname: nick,
    product: 'SaaS',
    releaseDate: 1789036585355,
    commit: '5f9692923c93033111c51ad7b003eb80204a9b75',
    ideName: 'WorkBuddy',
    ideType: 'WorkBuddy',
    ideVersion: '5.5.6',
    machineId: deriveId(uid, 'machine'),
    sessionId: deriveId(uid, 'session'),
    extName: 'workbuddy-desktop',
    extVersion: '5.5.6',
    os: 'win32',
    arch: 'x64',
    osVersion: '10.0.26220',
    cpuCores: 20,
    memorySize: 24,
    timestamp: now,
    presentAt: now,
    activityId: ACTIVITY_ID
  };

  return [
    { eventCode: 'agent_task_created', source: 'LOCAL', name: 'working', task_target: 'local', mode: 'craft', conversationId: conv, messageId: conv, ...fp },
    { eventCode: 'chat_message_send', messageId: `${conv}-assistant`, traceId: conv, rootRequestId: conv, parentConversationId: conv, agentName: 'cli', agentType: 'main', ...fp },
    { eventCode: 'chat_request_send', inputLength: 24, traceId: conv, rootRequestId: conv, parentConversationId: conv, agentName: 'cli', agentType: 'main', ...fp },
    { eventCode: 'chat_message_response', messageId: `${conv}-assistant`, responseModelId: 'fast-model', inputToken: 120, outputToken: 80, totalToken: 200, isSuccessful: true, finishReason: 'stop', firstTokenAt: now, traceId: conv, conversationId: conv, rootRequestId: conv, parentConversationId: conv, ...fp },
    { eventCode: 'chat_message_status', messageId: `${conv}-assistant`, messageErrorCode: '0', traceId: conv, rootRequestId: conv, parentConversationId: conv, ...fp },
    { eventCode: 'chat_request_response', mode: 'craft', toolCallCount: 0, inputToken: 120, outputToken: 80, totalToken: 200, isSuccessful: true, finishReason: 'stop', rootRequestId: conv, parentConversationId: conv, ...fp }
  ];
}

export async function runSchoolActivity(account, options = {}) {
  const fetchFn = options.fetchFn || fetch;
  if (!account || account.auth?.realm === 'global') {
    return { ok: true, skipped: true, reason: 'global_account_skipped', prizes: [], creditGained: 0 };
  }
  const uid = account.account?.uid || '';
  const token = account.auth?.accessToken || '';
  if (!token) return { ok: false, error: '账号缺少有效 token' };

  const statusInfo = await fetchSchoolStatus(account, fetchFn);
  if (!statusInfo.ok) return statusInfo;
  if (!statusInfo.inPeriod) {
    return { ok: true, inPeriod: false, skipped: true, message: '开学季活动当前未在周期内 (in_period=false)', prizes: [], creditGained: 0 };
  }

  const logs = [];
  for (const t of statusInfo.tasks) {
    const code = t.task_code;
    const st = String(t.status || '').toLowerCase();
    if (!code || st === 'claimed' || code === 'task_student_verify') continue;

    if (st === 'pending') {
      await mpJson(`${SCHOOL_BASE}/tasks/${code}/viewed`, token, 'POST', {}, fetchFn).catch(() => {});
    }

    if (st !== 'completed') {
      if (code === 'share_invite') {
        await mpJson(`${SCHOOL_BASE}/tasks/share-complete`, token, 'POST', { channel: 'wechat' }, fetchFn).catch(() => {});
        logs.push({ code, action: 'share-complete' });
      } else if (code === 'chat_3_times') {
        const need = Math.max(1, (t.target_count || 3) - (t.progress || 0));
        for (let i = 0; i < need; i++) {
          const cid = `wbmp-${Date.now()}-${i}`;
          await mpJson(`${CN_BILLING_BASE}${REPORT_PATH}`, token, 'POST', [{
            eventCode: 'chat_request_send', timestamp: Date.now(), reportDelay: 0,
            source: 'mini_program', ideName: 'wx_app_cloud', ideType: 'WorkBuddy_MP', extName: 'workbuddy-mp', extVersion: 'SaaS',
            mode: 'chat', conversationId: cid, requestId: cid, inputLength: 12, activityId: ACTIVITY_ID, userId: uid
          }], fetchFn).catch(() => {});
        }
        logs.push({ code, action: 'mini_chat', count: need });
      } else if (code === 'desktop_chat_1_time') {
        await mpJson(`${CN_CHAT_BASE}${REPORT_PATH}`, token, 'POST', buildSchoolDesktopEvents(account), fetchFn, {
          'X-Product': 'SaaS',
          'User-Agent': DESKTOP_UA
        }).catch(() => {});
        logs.push({ code, action: 'desktop_seq' });
      } else if (code === 'expert_use') {
        const exp = await fetchSchoolExpert(token, fetchFn);
        const conv = `wbexp-${Date.now()}`;
        await mpJson(`${CN_BILLING_BASE}${REPORT_PATH}`, token, 'POST', [{
          eventCode: 'expert_actual_use', timestamp: Date.now(), reportDelay: 0,
          source: 'mini_program', ideName: 'wx_app_cloud', ideType: 'WorkBuddy_MP', extName: 'workbuddy-mp', extVersion: 'SaaS',
          machineId: deriveId(uid, 'machine'), userId: uid, userNickname: account.account?.nickname || '',
          id: exp.id, name: exp.id, expertTitle: exp.name, type: 'send_message', characterCount: 12, expertType: 'agent',
          conversationId: conv, activityId: ACTIVITY_ID
        }], fetchFn).catch(() => {});
        logs.push({ code, action: 'expert_use', expert: exp.name });
      }
    }

    const claimRes = await mpJson(`${SCHOOL_BASE}/tasks/${code}/claim`, token, 'POST', {}, fetchFn).catch(() => null);
    if (claimRes?.ok) {
      logs.push({ code, action: 'claim', ok: true });
    }
  }

  // 自动清空转盘抽奖次数
  const prizes = [];
  let creditGained = 0;
  const cfgCheck = await fetchSchoolStatus(account, fetchFn);
  let bal = cfgCheck.chance?.balance || 0;
  let guard = 0;
  while (bal > 0 && guard < 20) {
    guard++;
    const drawRes = await mpJson(`${SCHOOL_BASE}/wheel/draw`, token, 'POST', { draw_uuid: crypto.randomUUID() }, fetchFn).catch(() => null);
    if (!drawRes || drawRes.data?.code === 40900 || !drawRes.ok) break;
    const dd = drawRes.data?.data || {};
    const pc = dd.prize_code || '?';
    const cr = Number(dd.credit_amount || 0);
    creditGained += cr;
    const spec = SCHOOL_PRIZE_LABELS[pc];
    prizes.push({ prizeCode: pc, credit: cr, label: spec ? spec.label : pc });
    bal = Number(dd.chance_balance ?? (bal - 1));
  }

  return {
    ok: true,
    inPeriod: true,
    logs,
    prizes,
    creditGained,
    summary: `开学季执行完毕: 完成动作 ${logs.length} 项, 转盘抽奖 ${prizes.length} 次 (+${creditGained} 积分)`
  };
}

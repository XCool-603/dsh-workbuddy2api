/**
 * tasks.js - WorkBuddy / CodeBuddy 成长任务全自动点亮与收割引擎
 * 
 * 逆向解析官方全部成长任务（18+ 任务项）：
 * 1. 自动拉取任务列表 (/v2/activity/growth/tasks)
 * 2. 自动接受未接任务 (/v2/activity/growth/tasks/accept)
 * 3. 针对不同任务类型构造真实指纹事件链进行上报 (模板/专家/技能/画布/桌面6连/资料库/轻量云/夜猫等)
 * 4. 自动回读并调用真实领奖端点入账 (+1450+ 积分与能量)
 */

import crypto from 'node:crypto';
import {
  CN_CHAT_BASE,
  CN_BILLING_BASE,
  GLOBAL_BASE,
  REPORT_PATH
} from '../constants.js';
import { adoptFirstBuddy } from './travel.js';

const WEB_BASE = 'https://www.workbuddy.cn';
const DESKTOP_UA = 'WorkBuddy/5.5.6 WorkBuddy/5.5.6 CLI/2.137.1';
const WEB_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36';
const LIBRARY_DOC_URL = 'https://www.workbuddy.cn/space/d/o0KWYeynteVv06UnAZqIFm';

// 任务配置映射字典
export const TASK_MAPPING = {
  create_canvas: { kind: 'canvas', target: 1, title: '创建画板' },
  template_5: { kind: 'template', target: 5, title: '使用 5 个模板' },
  expert_5: { kind: 'expert', target: 5, title: '召唤 5 次专家' },
  Expert_team_use_3: { kind: 'team', target: 3, title: '召唤 3 次专家团' },
  skill_1: { kind: 'skill', target: 1, title: '尝鲜热门技能' },
  automation_1: { kind: 'automation', target: 1, title: '设置自动化任务' },
  playbook_prompt: { kind: 'playbook', target: 1, title: '探索优秀灵感' },
  Expert_lighthouse: { kind: 'lighthouse', target: 1, title: '体验「腾讯轻量云」专家' },
  Buddy_App: { kind: 'buddy5', target: 1, title: '体验 WorkBuddy 「发现应用」' },
  Buddy_App_QQ: { kind: 'buddy5', target: 1, title: '体验企鹅教师助手' },
  Hp_Appearance: { kind: 'skin', target: 1, title: '更换外观皮肤' },
  chat_5: { kind: 'chat', target: 5, title: '和 AI 聊天 5 次' },
  Model_chat_GLM5_2: { kind: 'glmchat', target: 1, title: '体验 GLM-5.2 对话' },
  'Model_chat_GLM5.2': { kind: 'glmchat', target: 1, title: '体验 GLM-5.2 对话' },
  black_cat: { kind: 'cat', target: 3, nightOnly: true, title: '夜猫子任务 (23:00-08:00 CST)' },
  first_buddy: { kind: 'buddyfirst', target: 1, title: '领养第一只 AI 宠物' },
  RichMeow_Chat: { kind: 'richmeow', target: 1, title: '桌面端对话 1 次' },
  Library_read: { kind: 'library', target: 1, title: '体验「资料库」' },
  skill_share: { kind: 'skillshare', target: 1, title: '分享热门技能给好友' },
  Sequential_Tasks_1: { kind: 'minichat', target: 1, title: '小程序轻量对话 1 次' },
  school_season: { kind: 'schoolseason', target: 1, title: '开学季主题活动任务' },
  expert_use_maidehao: { kind: 'fixed_expert', target: 1, expertId: 'ex_GDl31WahyIH0', title: '体验「中国电商运营专家」' },
  expert_use_douyinyin: { kind: 'fixed_expert', target: 1, expertId: 'ex_FbY5nlWTqDod', title: '体验「抖音策略师」' },
  expert_use_shangjia_xuanchuan: { kind: 'fixed_expert', target: 1, expertId: 'ex_Weo3x2EZuSDm', title: '体验「商家宣传页与海报设计师」' },
  expert_use_bowangwang: { kind: 'fixed_expert', target: 1, expertId: 'ex_WZY136wV5aMt', title: '体验「直播电商教练」' },
  WorkBuddy_Valorant: { kind: 'fixed_expert', target: 1, expertId: 'ex_xQHHD1u5Jkua', title: '体验「无畏契约拼豆专家」' },
  wb_wechat_oa_subscribe_task: { unforgeable: true, reason: '需关注微信公众号外部回调' },
  Expert_Philanthropy: { unforgeable: true, reason: '需真实捐款' }
};

const DEFAULT_SCENES = [
  { id: '0', name: '幻灯片' },
  { id: '2', name: '视频生成' },
  { id: '4', name: '深度研究' },
  { id: '6', name: '文档处理' },
  { id: '8', name: '数据分析' }
];

const DEFAULT_EXPERTS = [
  { id: 'ContentCreator', name: '内容创作专家' },
  { id: 'UiDesigner', name: 'UI设计师' },
  { id: 'DataAnalyticsReporter', name: '数据分析报告师' },
  { id: 'ChinaEcommerceOperationsExpert', name: '中国电商运营专家' },
  { id: 'DouyinStrategist', name: '抖音策略师' }
];

const DEFAULT_TEAMS = [
  { id: 'CloudOpsTeam', name: '云运维团队' },
  { id: 'SoftwareCompany', name: '软件开发团队' },
  { id: 'TradingAgentTeam', name: '量化交易团队' }
];

function deriveId(uid, salt) {
  return crypto.createHash('md5').update(`${salt}:${uid}`).digest('hex').slice(0, 36);
}

function desktopFingerprint(account) {
  const uid = account.account?.uid || '';
  const nickname = account.account?.nickname || '';
  const now = Date.now();
  return {
    timezone: 'Asia/Shanghai',
    reportDelay: 2000,
    userId: uid,
    username: nickname,
    userNickname: nickname,
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
    presentAt: now
  };
}

/**
 * 查询当前成长任务全量清单
 */
export async function fetchGrowthTasks(account, fetchFn = fetch) {
  if (account.auth?.realm === 'global') return [];
  const base = CN_CHAT_BASE;
  const url = `${base}/v2/activity/growth/tasks`;

  try {
    const res = await fetchFn(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${account.auth.accessToken}`,
        'X-User-Id': account.account?.uid || '',
        'Accept': 'application/json, text/plain, */*',
        'User-Agent': 'WorkBuddy/1.2.34'
      }
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok && (data.code === 0 || data.code === 200)) {
      return data.data?.tasks || [];
    }
    return [];
  } catch (err) {
    return [];
  }
}

/**
 * 批量接受成长任务
 */
export async function acceptGrowthTasks(account, taskCodes, fetchFn = fetch) {
  if (account.auth?.realm === 'global' || !taskCodes.length) return true;
  const base = CN_CHAT_BASE;
  const url = `${base}/v2/activity/growth/tasks/accept`;

  try {
    const res = await fetchFn(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${account.auth.accessToken}`,
        'X-User-Id': account.account?.uid || '',
        'Content-Type': 'application/json',
        'User-Agent': 'WorkBuddy/1.2.34'
      },
      body: JSON.stringify({ task_codes: taskCodes })
    });
    return res.ok;
  } catch (_) {
    return false;
  }
}

/**
 * 领取单个成长任务奖励 (支持 chat 域降级 web 域)
 */
export async function claimGrowthTask(account, taskCode, fetchFn = fetch) {
  const uid = account.account?.uid || '';
  const token = account.auth?.accessToken || '';

  // 1. 尝试 chatBase (copilot.tencent.com)
  try {
    const chatUrl = `${CN_CHAT_BASE}/activity/growth/tasks/${taskCode}/claim`;
    const res = await fetchFn(chatUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-User-Id': uid,
        'Accept': 'application/json, text/plain, */*',
        'User-Agent': 'WorkBuddy/1.2.34'
      }
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok && (data.code === 0 || data.code === 200)) {
      const d = data.data || {};
      return {
        ok: true,
        already: Boolean(d.already_claimed),
        credit: d.credit || 0,
        energy: d.energy || 0,
        message: d.already_claimed ? '奖励已在账' : `领取成功 (+${d.credit || 0} 积分)`
      };
    }

    // 若返回 400，降级尝试 web 域
    if (res.status === 400) {
      const webUrl = `${WEB_BASE}/activity/growth/tasks/${taskCode}/claim`;
      const webRes = await fetchFn(webUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
          'Origin': WEB_BASE,
          'Referer': `${WEB_BASE}/profile/growth-center`,
          'x-client-platform': 'web',
          'User-Agent': WEB_UA,
          'X-User-Id': uid,
          'X-Domain': WEB_BASE
        }
      });
      const webData = await webRes.json().catch(() => ({}));
      if (webRes.ok && (webData.code === 0 || webData.code === 200)) {
        const d = webData.data || {};
        return {
          ok: true,
          already: Boolean(d.already_claimed),
          credit: d.credit || 0,
          energy: d.energy || 0,
          message: d.already_claimed ? '奖励已在账' : `Web端降级领取成功 (+${d.credit || 0} 积分)`
        };
      }
    }

    return { ok: false, message: data.msg || `领取失败 (HTTP ${res.status})` };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

/**
 * 构造桌面 6 连成功对话事件链 (点亮 RichMeow_Chat)
 */
function buildDesktopChatEvents(account) {
  const uid = account.account?.uid || '';
  const now = Date.now();
  const convId = `wb-desk-${now}`;
  const reqId = `${convId}-req`;
  const msgId = `${convId}-msg`;
  const modelId = 'deepseek-v4-flash';
  const modelName = 'DeepSeek V4 Flash';

  return [
    {
      eventCode: 'agent_task_created',
      source: 'LOCAL',
      name: 'working',
      task_target: 'local',
      mode: 'craft',
      requestModelId: modelId,
      requestModelName: modelName,
      conversationId: convId,
      messageId: msgId,
      userId: uid
    },
    {
      eventCode: 'chat_message_send',
      messageId: `${msgId}-assistant`,
      historyCount: 0,
      traceId: reqId,
      rootRequestId: reqId,
      parentConversationId: convId,
      agentName: 'cli',
      agentType: 'main',
      userId: uid
    },
    {
      eventCode: 'chat_request_send',
      inputLength: 24,
      traceId: reqId,
      rootRequestId: reqId,
      parentConversationId: convId,
      agentName: 'cli',
      agentType: 'main',
      userId: uid
    },
    {
      eventCode: 'chat_message_response',
      messageId: `${msgId}-assistant`,
      responseModelId: modelId,
      inputToken: 120,
      outputToken: 80,
      totalToken: 200,
      isSuccessful: true,
      finishReason: 'stop',
      firstTokenAt: now,
      traceId: reqId,
      conversationId: convId,
      rootRequestId: reqId,
      parentConversationId: convId,
      agentName: 'cli',
      agentType: 'main',
      userId: uid
    },
    {
      eventCode: 'chat_message_status',
      messageId: `${msgId}-assistant`,
      messageErrorCode: '0',
      traceId: reqId,
      rootRequestId: reqId,
      parentConversationId: convId,
      agentName: 'cli',
      agentType: 'main',
      userId: uid
    },
    {
      eventCode: 'chat_request_response',
      mode: 'craft',
      toolCallCount: 0,
      inputToken: 120,
      outputToken: 80,
      totalToken: 200,
      isSuccessful: true,
      finishReason: 'stop',
      rootRequestId: reqId,
      parentConversationId: convId,
      userId: uid
    }
  ];
}

/**
 * 构造 Buddy App 五连事件 (点亮 Buddy_App / Buddy_App_QQ)
 */
function buildBuddy5Events(account) {
  const uid = account.account?.uid || '';
  const buddyId = 'cb_y5Dy46tPQGGWtueMxXbe';
  const buddyName = '企鹅教师助手';

  return [
    { eventCode: 'buddyapp_discover_click', mode: 'LOCAL', buddyId, buddyName, userId: uid },
    { eventCode: 'buddyapp_show', mode: 'LOCAL', buddyId, buddyName, position: 2, elementId: buddyId, elementName: buddyName, userId: uid },
    { eventCode: 'buddyapp_enter_click', mode: 'LOCAL', buddyId, buddyName, position: 2, elementId: buddyId, elementName: buddyName, isFirstPage: true, userId: uid },
    { eventCode: 'buddyapp_auth_confirm_click', mode: 'LOCAL', buddyId, buddyName, elementId: buddyId, elementName: buddyName, userId: uid },
    { eventCode: 'buddyapp_bindaccount_skip_click', mode: 'LOCAL', buddyId, buddyName, elementId: buddyId, elementName: buddyName, userId: uid }
  ];
}

/**
 * 发送桌面指纹事件包
 */
async function sendDesktopEvents(account, events, fetchFn = fetch) {
  const fp = desktopFingerprint(account);
  const enriched = events.map(e => ({ ...e, ...fp }));
  const base = CN_CHAT_BASE;
  const url = `${base}${REPORT_PATH}`;

  const res = await fetchFn(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${account.auth.accessToken}`,
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json;charset=UTF-8',
      'User-Agent': DESKTOP_UA,
      'X-Domain': base,
      'X-Product': 'SaaS',
      'X-Request-ID': `${deriveId(account.account.uid, 'req')}${Date.now() % 100000}`,
      'X-User-Id': account.account?.uid || ''
    },
    body: JSON.stringify(enriched)
  });
  return res.ok;
}

/**
 * 发送 Web 域事件包 (点亮 Library_read)
 */
async function sendWebEvent(account, eventCode, pageUrl, elementId, elementName, fetchFn = fetch) {
  const now = Date.now();
  const uid = account.account?.uid || '';
  const ev = {
    eventCode,
    timestamp: now,
    reportDelay: 0,
    pageURL: pageUrl,
    elementId,
    elementName,
    os: 'Win32',
    userAgent: WEB_UA,
    machineId: deriveId(uid, 'webmachine'),
    userId: uid,
    userNickname: account.account?.nickname || ''
  };

  const res = await fetchFn(`${WEB_BASE}${REPORT_PATH}`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-client-platform': 'web',
      'Origin': WEB_BASE,
      'Referer': pageUrl,
      'User-Agent': WEB_UA,
      'X-User-Id': uid,
      'X-Domain': WEB_BASE
    },
    body: JSON.stringify([ev])
  });
  return res.ok;
}

/**
 * 为指定任务按需补齐上报事件
 */
async function lightUpTask(account, code, spec, count, fetchFn = fetch) {
  const uid = account.account?.uid || '';
  const baseBilling = CN_BILLING_BASE;
  const reportBillingUrl = `${baseBilling}${REPORT_PATH}`;

  const sendBillingJson = async (events) => {
    const res = await fetchFn(reportBillingUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'Origin': baseBilling,
        'Referer': `${baseBilling}/`,
        'User-Agent': 'WorkBuddy/1.2.34',
        'Authorization': `Bearer ${account.auth.accessToken}`,
        'X-User-Id': uid
      },
      body: JSON.stringify(events)
    });
    return res.ok;
  };

  switch (spec.kind) {
    case 'canvas': {
      const now = Date.now();
      const events = Array.from({ length: count }, (_, i) => ({
        eventCode: 'wbx_design_canvas_task_create',
        timestamp: now + i * 200,
        reportDelay: 0,
        conversationId: `wbx-conv-${now}-${i}`,
        requestId: `wbx-req-${now}-${i}`,
        source: 'summon_keyword',
        isCustomModel: false,
        name: '',
        inputLength: 12,
        id: `wbx-canvas-${now}-${i}`,
        cost: 0,
        isSuccessful: true,
        userId: uid
      }));
      return sendBillingJson(events);
    }

    case 'template': {
      const now = Date.now();
      const events = Array.from({ length: count }, (_, i) => {
        const sc = DEFAULT_SCENES[i % DEFAULT_SCENES.length];
        return {
          eventCode: 'agent_task_created_with_template',
          timestamp: now + i * 200,
          reportDelay: 0,
          isCustomModel: true,
          id: sc.id,
          name: sc.name,
          requestId: `wb-tmpl-${now}-${i}`,
          conversationId: `wb-tmpl-conv-${now}-${i}`,
          userId: uid
        };
      });
      return sendBillingJson(events);
    }

    case 'expert': {
      const now = Date.now();
      const events = Array.from({ length: count }, (_, i) => {
        const exp = DEFAULT_EXPERTS[i % DEFAULT_EXPERTS.length];
        return {
          eventCode: 'expert_actual_use',
          timestamp: now + i * 200,
          reportDelay: 0,
          mode: 'CLOUD',
          id: exp.id,
          name: exp.name,
          expertTitle: exp.name,
          expertType: 'agent',
          source: 'builtin',
          cost: 0,
          characterCount: 12,
          conversationId: `wb-exp-conv-${now}-${i}`,
          requestId: `wb-exp-req-${now}-${i}`,
          messageId: `wb-exp-msg-${now}-${i}`,
          requestModelId: 'deepseek-v4-flash',
          requestModelName: 'DeepSeek V4 Flash',
          userId: uid
        };
      });
      return sendBillingJson(events);
    }

    case 'team': {
      const now = Date.now();
      const events = Array.from({ length: count }, (_, i) => {
        const tm = DEFAULT_TEAMS[i % DEFAULT_TEAMS.length];
        return {
          eventCode: 'expert_actual_use',
          timestamp: now + i * 200,
          reportDelay: 0,
          mode: 'CLOUD',
          id: tm.id,
          name: tm.name,
          expertTitle: tm.name,
          expertType: 'team',
          source: 'builtin',
          cost: 0,
          characterCount: 12,
          conversationId: `wb-team-conv-${now}-${i}`,
          requestId: `wb-team-req-${now}-${i}`,
          messageId: `wb-team-msg-${now}-${i}`,
          requestModelId: 'deepseek-v4-flash',
          requestModelName: 'DeepSeek V4 Flash',
          userId: uid
        };
      });
      return sendBillingJson(events);
    }

    case 'fixed_expert': {
      const now = Date.now();
      const expId = spec.expertId || 'ex_GDl31WahyIH0';
      const events = Array.from({ length: count }, (_, i) => ({
        eventCode: 'expert_actual_use',
        timestamp: now + i * 200,
        reportDelay: 0,
        mode: 'CLOUD',
        id: expId,
        name: spec.title || '活动专家',
        expertTitle: spec.title || '活动专家',
        expertType: 'agent',
        source: 'builtin',
        cost: 0,
        characterCount: 12,
        conversationId: `wb-fexp-conv-${now}-${i}`,
        requestId: `wb-fexp-req-${now}-${i}`,
        messageId: `wb-fexp-msg-${now}-${i}`,
        requestModelId: 'deepseek-v4-flash',
        requestModelName: 'DeepSeek V4 Flash',
        userId: uid
      }));
      return sendBillingJson(events);
    }

    case 'lighthouse': {
      const now = Date.now();
      const events = Array.from({ length: count }, (_, i) => ({
        eventCode: 'expert_actual_use',
        timestamp: now + i * 200,
        reportDelay: 0,
        mode: 'CLOUD',
        id: 'ex_2cvvUZQhDyeJ',
        name: '腾讯轻量云专家',
        expertTitle: '腾讯轻量云专家',
        type: '02-Engineering',
        expertType: 'agent',
        version: '1.0.2',
        source: 'builtin',
        cost: 0,
        characterCount: 12,
        conversationId: `wb-lh-conv-${now}-${i}`,
        requestId: `wb-lh-req-${now}-${i}`,
        messageId: `wb-lh-msg-${now}-${i}`,
        requestModelId: 'deepseek-v4-flash',
        requestModelName: 'DeepSeek V4 Flash',
        userId: uid
      }));
      return sendBillingJson(events);
    }

    case 'skill': {
      const now = Date.now();
      const events = Array.from({ length: count }, (_, i) => ({
        eventCode: 'skill_info',
        timestamp: now + i * 200,
        reportDelay: 0,
        skillId: 'skill_2096525080079265792',
        skillName: 'pptx',
        action: 'use',
        conversationId: `wb-skill-conv-${now}-${i}`,
        requestId: `wb-skill-req-${now}-${i}`,
        userId: uid
      }));
      return sendBillingJson(events);
    }

    case 'automation': {
      const now = Date.now();
      const events = Array.from({ length: count }, (_, i) => ({
        eventCode: 'automated_task_create_suc',
        timestamp: now + i * 200,
        reportDelay: 0,
        name: '每周五自动生成周报',
        source: 'manually',
        modelId: 'deepseek-v4-flash',
        conversationId: `wb-auto-conv-${now}-${i}`,
        requestId: `wb-auto-req-${now}-${i}`,
        schedule: { type: 'recurring', rrule: 'FREQ=WEEKLY;BYDAY=FR;BYHOUR=9;BYMINUTE=0' },
        prompt: '每周五自动整理本周工作，生成一份周报。',
        userId: uid
      }));
      return sendBillingJson(events);
    }

    case 'playbook': {
      const now = Date.now();
      const events = Array.from({ length: count }, (_, i) => ({
        eventCode: 'playbook_prompt_send',
        timestamp: now + i * 200,
        reportDelay: 0,
        id: 'worker-ledger-freedom-dashboard',
        name: '打工人小账本',
        promptLength: 20,
        isOfficial: 1,
        source: 'discover',
        conversationId: `wb-pb-conv-${now}-${i}`,
        requestId: `wb-pb-req-${now}-${i}`,
        userId: uid
      }));
      return sendBillingJson(events);
    }

    case 'skin': {
      const now = Date.now();
      const events = Array.from({ length: count }, (_, i) => ({
        eventCode: 'appearance_skin_apply',
        timestamp: now + i * 200,
        reportDelay: 0,
        action: 'apply',
        source: 'settings_close',
        id: 'theme-tkmw7j',
        name: '和平精英激战金秋',
        vipLevel: 'free',
        series: 'craft',
        userId: uid
      }));
      return sendBillingJson(events);
    }

    case 'chat':
    case 'glmchat':
    case 'cat': {
      const now = Date.now();
      const isGlm = spec.kind === 'glmchat' || spec.kind === 'cat';
      const events = Array.from({ length: count }, (_, i) => ({
        eventCode: 'chat_request_send',
        timestamp: now + i * 200,
        reportDelay: 0,
        mode: spec.kind === 'cat' ? 'night' : 'craft',
        conversationId: `wb-chat-conv-${now}-${i}`,
        requestId: `wb-chat-req-${now}-${i}`,
        inputLength: 12,
        requestModelId: isGlm ? 'glm-5.2' : 'deepseek-v4-flash',
        requestModelName: isGlm ? 'GLM-5.2' : 'DeepSeek V4 Flash',
        agentName: 'default',
        agentType: 'conversation',
        userId: uid
      }));
      return sendBillingJson(events);
    }

    case 'richmeow': {
      const events = buildDesktopChatEvents(account);
      return sendDesktopEvents(account, events, fetchFn);
    }

    case 'buddy5': {
      const events = buildBuddy5Events(account);
      return sendDesktopEvents(account, events, fetchFn);
    }

    case 'buddyfirst': {
      const adoptRes = await adoptFirstBuddy(account, fetchFn);
      return Boolean(adoptRes?.ok);
    }

    case 'skillshare': {
      const now = Date.now();
      const skillId = 'skill_2096525080079265792';
      const skillName = 'pptx';
      const events = [
        { eventCode: 'skill_share_entry_click', skillId, skillName, skillType: 'market', skillSource: 'official', entry: 'detail', status: 'safe', actionSuccessful: true, clickAt: now, userId: uid },
        { eventCode: 'skill_share_channel_action', skillId, skillName, skillType: 'market', action: 'wechat', panelAction: 'click', panelType: 'mini_program_card', isSuccessful: true, cost: 0, id: `share-${now}`, actionAt: now, userId: uid },
        { eventCode: 'skill_share_channel_action', skillId, skillName, skillType: 'market', action: 'wechat', panelAction: 'success', panelType: 'mini_program_card', isSuccessful: true, cost: 12, id: `share-${now}`, actionAt: now, userId: uid },
        { eventCode: 'skill_share_channel_action', skillId, skillName, skillType: 'market', action: 'link', panelAction: 'success', panelType: 'clipboard', isSuccessful: true, cost: 12, id: `share-${now}-link`, actionAt: now, userId: uid }
      ];
      return sendDesktopEvents(account, events, fetchFn);
    }

    case 'minichat':
    case 'schoolseason': {
      const now = Date.now();
      const cid = `wb-mp-${now}`;
      const ev = {
        eventCode: 'chat_request_send',
        timestamp: now,
        reportDelay: 0,
        source: 'mini_program',
        ideName: 'wx_app_cloud',
        ideType: 'WorkBuddy_MP',
        extName: 'workbuddy-mp',
        extVersion: '2.4.0',
        mode: 'chat',
        conversationId: cid,
        requestId: cid,
        inputLength: 12,
        mentionContexts: [],
        mentionContextCount: 0,
        userId: uid
      };
      if (spec.kind === 'schoolseason') ev.activityId = 'school_open_day_2026';
      return sendBillingJson([ev]);
    }

    case 'library': {
      return sendWebEvent(
        account,
        'web_element_click',
        LIBRARY_DOC_URL,
        'library_doc_intro_click',
        '资料库介绍点击',
        fetchFn
      );
    }

    default:
      return false;
  }
}

export function isCSTNightWindow(now = new Date()) {
  const cstHour = new Date(now.getTime() + 8 * 3600 * 1000).getUTCHours();
  return cstHour >= 23 || cstHour < 8;
}

export async function runNightCatTask(account, fetchFn = fetch) {
  if (account?.auth?.realm === 'global') return { ok: true, skipped: true };
  if (!isCSTNightWindow()) {
    return { ok: true, skipped: true, reason: 'outside_cst_night_window_23_08' };
  }
  const spec = TASK_MAPPING.black_cat;
  const ok = await lightUpTask(account, 'black_cat', spec, spec.target || 3, fetchFn);
  await new Promise((r) => setTimeout(r, 1200));
  const claimRes = await claimGrowthTask(account, 'black_cat', fetchFn);
  return { ok: ok || claimRes.ok, ...claimRes };
}

/**
 * 全量自动执行：探查全部任务 -> 自动接取 -> 自动点亮未完成任务 -> 自动领奖
 */
export async function runAllGrowthTasks(account, fetchFn = fetch) {
  if (account.auth?.realm === 'global') {
    return { ok: true, reason: 'global_account_skipped' };
  }

  const logs = [];
  let creditGained = 0;
  let energyGained = 0;

  // 1. 获取所有任务
  let tasks = await fetchGrowthTasks(account, fetchFn);
  if (!tasks.length) {
    return { ok: false, message: '未获取到成长任务列表' };
  }

  // 2. 检查是否有未接取的任务，一键自动全部接取 (accept)
  const unaccepted = tasks.filter(t => t.accept_status === 'not_accepted').map(t => t.task_code);
  if (unaccepted.length > 0) {
    await acceptGrowthTasks(account, unaccepted, fetchFn);
    logs.push({ step: 'accept_tasks', count: unaccepted.length, codes: unaccepted });
    // 刷新任务状态
    tasks = await fetchGrowthTasks(account, fetchFn);
  }

  // 3. 逐项点亮可自动化任务
  for (const t of tasks) {
    const code = t.task_code;
    const spec = TASK_MAPPING[code];
    if (!spec || spec.unforgeable) {
      continue;
    }

    const cur = t.progress?.current || 0;
    const target = t.progress?.target || spec.target || 1;

    // 若尚未完成且可伪造点亮
    if (t.accept_status !== 'claimed' && t.accept_status !== 'completed' && cur < target) {
      const need = target - cur;
      try {
        const ok = await lightUpTask(account, code, spec, need, fetchFn);
        logs.push({ step: `lightup_${code}`, title: spec.title || code, count: need, ok });
      } catch (err) {
        logs.push({ step: `lightup_${code}`, title: spec.title || code, ok: false, error: err.message });
      }
    }
  }

  // 留出 1.5 秒等待腾讯上游后台写入并结算事件
  await new Promise(r => setTimeout(r, 1500));

  // 4. 重新拉取一次任务最新状态，执行 claim 领奖
  const freshTasks = await fetchGrowthTasks(account, fetchFn);
  for (const t of freshTasks) {
    const code = t.task_code;
    const spec = TASK_MAPPING[code] || {};
    const cur = t.progress?.current || 0;
    const target = t.progress?.target || spec.target || 1;

    // 若已达标但未领奖
    if (t.accept_status === 'completed' || (cur >= target && t.accept_status !== 'claimed')) {
      const claimRes = await claimGrowthTask(account, code, fetchFn);
      if (claimRes.ok) {
        creditGained += claimRes.credit || 0;
        energyGained += claimRes.energy || 0;
        logs.push({
          step: `claim_${code}`,
          title: t.title || spec.title || code,
          credit: claimRes.credit,
          message: claimRes.message
        });
      }
    }
  }

  return {
    ok: true,
    totalTasks: tasks.length,
    creditGained,
    energyGained,
    logs,
    summary: `成长任务全自动收割完成！本次新入账 +${creditGained} 积分，+${energyGained} 能量`
  };
}

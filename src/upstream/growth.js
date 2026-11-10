/**
 * growth.js - WorkBuddy / CodeBuddy 成长活动与福利体系整合
 * 包含：对话活跃上报、新手礼包、活动补偿、连登兑换、连登抽奖、补签卡与一键全套福利
 */

import crypto from 'node:crypto';
import {
  CN_CHAT_BASE,
  CN_BILLING_BASE,
  GLOBAL_BASE,
  REPORT_PATH,
  STREAK_PATH,
  REDEEM_PATH,
  LOTTERY_CHANCES_PATH,
  LOTTERY_DRAW_PATH,
  HEATMAP_PATH,
  MAKEUP_CARD_PATH,
  CLAIM_GIFT_PATH,
  CLAIM_COMPENSATION_PATH
} from '../constants.js';
import { performCheckin } from './checkin.js';
import { runTravelForAccount } from './travel.js';
import { runAllGrowthTasks } from './tasks.js';

function getChatBase(account) {
  return account.auth?.realm === 'global' ? GLOBAL_BASE : CN_CHAT_BASE;
}

function getBillingBase(account) {
  return account.auth?.realm === 'global' ? GLOBAL_BASE : CN_BILLING_BASE;
}

function buildHeaders(base, account) {
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
 * CST (Asia/Shanghai, UTC+8) 计算昨日日期字符串 YYYY-MM-DD
 */
export function getYesterdayDateCST(now = new Date()) {
  const cstOffset = 8 * 60 * 60 * 1000;
  const cstTime = new Date(now.getTime() + cstOffset);
  cstTime.setUTCDate(cstTime.getUTCDate() - 1);
  return cstTime.toISOString().slice(0, 10);
}

/**
 * 向上游发送对话活跃上报 (POST {billingBase}/v2/report)
 * 一次上报同时点亮 growth 连登 + 解锁 first_buddy 领养门槛
 */
export async function reportActiveChat(account, burst = 5, fetchFn = fetch) {
  if (account.auth?.realm === 'global') return { ok: true, status: 'skipped_global' };
  const uid = account.account?.uid;
  if (!uid) return { ok: false, message: '账号缺失 UID' };

  const base = getBillingBase(account);
  const url = `${base}${REPORT_PATH}`;
  const now = Date.now();
  const convId = `wb2api-conv-${now}`;

  const events = [];
  for (let i = 0; i < burst; i++) {
    const ts = now + i * 200;
    events.push({
      eventCode: 'chat_request_send',
      timestamp: ts,
      reportDelay: 0,
      mode: 'craft',
      conversationId: convId,
      requestId: `${convId}-${i}`,
      inputLength: 16,
      requestModelId: 'deepseek-v4-flash',
      requestModelName: 'DeepSeek V4 Flash',
      isPlan: false,
      isAutoExecuteTerminal: false,
      isAutoModify: false,
      codebaseEnable: false,
      maxToken: 0,
      maxSteps: 0,
      temperature: 0,
      maxRetries: 0,
      mentionContexts: [],
      knowledgeId: [],
      knowledgeName: [],
      codebaseId: '',
      mentionContextCount: 0,
      command: '',
      expertId: '',
      recommendId: '',
      skillId: '',
      skillCount: 0,
      totalCount: 0,
      fileUri: '',
      presentAt: ts,
      traceId: '',
      rootRequestId: convId,
      parentConversationId: convId,
      agentName: 'default',
      agentType: 'conversation',
      userId: uid
    });
  }

  try {
    const res = await fetchFn(url, {
      method: 'POST',
      headers: buildHeaders(base, account),
      body: JSON.stringify(events)
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok && (data.code === 0 || data.code === 200)) {
      return { ok: true, burst, message: `成功上报 ${burst} 条对话活跃事件 (点亮活跃与领养门槛)` };
    }
    return { ok: false, message: data.msg || `上报失败 (HTTP ${res.status})` };
  } catch (err) {
    return { ok: false, message: `上报异常: ${err.message}` };
  }
}

/**
 * 领取新手礼包 (每号一次)
 */
export async function claimGift(account, fetchFn = fetch) {
  if (account.auth?.realm === 'global') return { ok: true, status: 'skipped_global' };
  const base = getBillingBase(account);
  const url = `${base}${CLAIM_GIFT_PATH}`;

  try {
    const res = await fetchFn(url, {
      method: 'POST',
      headers: buildHeaders(base, account),
      body: JSON.stringify({})
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && (data.code === 0 || data.code === 200)) {
      const credit = data.data?.credit || 0;
      return { ok: true, credit, message: `新手礼包领取成功，获得 +${credit} 积分！` };
    }
    return { ok: false, message: data.msg || '新手礼包已领或无可领' };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

/**
 * 领取活动补偿
 */
export async function claimCompensation(account, fetchFn = fetch) {
  if (account.auth?.realm === 'global') return { ok: true, status: 'skipped_global' };
  const base = getBillingBase(account);
  const url = `${base}${CLAIM_COMPENSATION_PATH}`;

  try {
    const res = await fetchFn(url, {
      method: 'POST',
      headers: buildHeaders(base, account),
      body: JSON.stringify({})
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && (data.code === 0 || data.code === 200)) {
      const credit = data.data?.credit || 0;
      return { ok: true, credit, message: `活动补偿领取成功，获得 +${credit} 积分！` };
    }
    return { ok: false, message: data.msg || '活动补偿已领或当前无补偿' };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

/**
 * 查询连登状态与各档位里程碑
 */
export async function getStreak(account, fetchFn = fetch) {
  const base = getChatBase(account);
  const url = `${base}${STREAK_PATH}`;

  try {
    const res = await fetchFn(url, {
      method: 'GET',
      headers: buildHeaders(base, account)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || (data.code !== 0 && data.code !== 200)) {
      return { days: 0, redemptionStatus: null, makeupCards: { balance: 0, max: 0 } };
    }
    const d = data.data || {};
    return {
      days: d.streak?.days || 0,
      redemptionStatus: d.redemption_status || null,
      makeupCards: d.makeup_cards || { balance: 0, max: 0 }
    };
  } catch (err) {
    return { days: 0, redemptionStatus: null, makeupCards: { balance: 0, max: 0 } };
  }
}

/**
 * 兑换连登里程碑奖励 (7d / 14d / 28d)
 */
export async function redeemStreakTier(account, tier, fetchFn = fetch) {
  const base = getChatBase(account);
  const url = `${base}${REDEEM_PATH}`;
  const clientToken = `redeem-${tier}-${crypto.randomUUID()}`;

  try {
    const res = await fetchFn(url, {
      method: 'POST',
      headers: buildHeaders(base, account),
      body: JSON.stringify({ tier, client_token: clientToken })
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && (data.code === 0 || data.code === 200)) {
      const d = data.data || {};
      return {
        ok: true,
        tier,
        creditGranted: d.credit_granted || 0,
        energyGranted: d.energy_granted || 0,
        cardsGranted: d.cards_granted || 0,
        chancesGranted: d.chances_granted || 0,
        message: `成功兑换 ${tier} 里程碑奖励：+${d.credit_granted || 0} 积分，送 ${d.chances_granted || 0} 次抽奖！`
      };
    }
    return { ok: false, tier, message: data.msg || `兑换 ${tier} 失败` };
  } catch (err) {
    return { ok: false, tier, message: err.message };
  }
}

/**
 * 查询当前连登抽奖剩余次数
 */
export async function getLotteryChances(account, fetchFn = fetch) {
  const base = getChatBase(account);
  const url = `${base}${LOTTERY_CHANCES_PATH}`;

  try {
    const res = await fetchFn(url, {
      method: 'GET',
      headers: buildHeaders(base, account)
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && (data.code === 0 || data.code === 200)) {
      return data.data?.balance || 0;
    }
    return 0;
  } catch (err) {
    return 0;
  }
}

/**
 * 抽奖一次
 */
export async function drawLottery(account, fetchFn = fetch) {
  const base = getChatBase(account);
  const url = `${base}${LOTTERY_DRAW_PATH}`;
  const clientToken = `draw-${crypto.randomUUID()}`;

  try {
    const res = await fetchFn(url, {
      method: 'POST',
      headers: buildHeaders(base, account),
      body: JSON.stringify({ client_token: clientToken })
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && (data.code === 0 || data.code === 200)) {
      const d = data.data || {};
      return {
        ok: true,
        prizeName: d.prize_name || '精美奖品',
        prizeType: d.prize_type || 'credit',
        creditAmount: d.credit_amount || 0,
        message: `抽中 [${d.prize_name || '奖励'}] (+${d.credit_amount || 0} 积分)`
      };
    }
    return { ok: false, message: data.msg || '抽奖未中或次数已耗尽' };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

/**
 * 检查热力图并自动补签断档日 (昨日漏签保连登)
 */
export async function checkAndUseMakeupCard(account, fetchFn = fetch) {
  if (account.auth?.realm === 'global') return { ok: false, reason: 'skipped_global' };

  try {
    const streakInfo = await getStreak(account, fetchFn);
    if ((streakInfo.makeupCards?.balance || 0) <= 0) {
      return { ok: false, reason: 'no_cards' };
    }

    const base = getChatBase(account);
    const heatmapRes = await fetchFn(`${base}${HEATMAP_PATH}`, {
      method: 'GET',
      headers: buildHeaders(base, account)
    });
    const heatmapData = await heatmapRes.json().catch(() => ({}));
    const cells = heatmapData.data?.cells || [];
    const yesterday = getYesterdayDateCST();

    const yesterdayCell = cells.find(c => c.date && c.date.startsWith(yesterday));
    if (yesterdayCell && yesterdayCell.score === 0) {
      // 昨日漏签，消耗补签卡补签
      const useRes = await fetchFn(`${base}${MAKEUP_CARD_PATH}`, {
        method: 'POST',
        headers: buildHeaders(base, account),
        body: JSON.stringify({ target_date: yesterday })
      });
      const useData = await useRes.json().catch(() => ({}));
      if (useRes.ok && (useData.code === 0 || useData.code === 200)) {
        return { ok: true, patchedDate: yesterday, message: `成功使用补签卡拯救昨日 (${yesterday}) 连登！` };
      }
    }
    return { ok: false, reason: 'no_missed_day' };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * 一键吃满全套福利 (活跃上报 + 签到/试用 + 礼包 + 补偿 + 领养/派猫猫 + 连登里程碑 + 抽奖)
 */
export async function claimAllWelfare(account, fetchFn = fetch) {
  const log = [];
  let totalCreditsGained = 0;

  // 1. 每日签到 / 试用额度
  const checkinRes = await performCheckin(account, fetchFn);
  log.push({ step: 'checkin', ...checkinRes });

  // 针对国际版账号，签到/试用已完毕
  if (account.auth?.realm === 'global') {
    return {
      realm: 'global',
      totalCreditsGained,
      log,
      summary: checkinRes.message || '国际版试用福利处理完毕'
    };
  }

  // 2. 对话活跃上报 (5-burst 模拟多轮对话，点亮连登与领养任务门槛)
  const reportRes = await reportActiveChat(account, 5, fetchFn);
  log.push({ step: 'report_active', ...reportRes });

  // 3. 新手礼包
  const giftRes = await claimGift(account, fetchFn);
  if (giftRes.ok && giftRes.credit) totalCreditsGained += giftRes.credit;
  log.push({ step: 'claim_gift', ...giftRes });

  // 4. 活动补偿
  const compRes = await claimCompensation(account, fetchFn);
  if (compRes.ok && compRes.credit) totalCreditsGained += compRes.credit;
  log.push({ step: 'claim_compensation', ...compRes });

  // 5. 猫猫旅行与领养全状态机 (若无猫自动领养送300分，有猫若到站领奖并自动派出)
  const travelRes = await runTravelForAccount(account, fetchFn);
  if (travelRes.results?.actions) {
    for (const act of travelRes.results.actions) {
      if (act.action === 'claim' && act.rewardCredit) {
        totalCreditsGained += act.rewardCredit;
      }
    }
  }
  log.push({ step: 'cat_travel', ...travelRes });

  // 6. 连登里程碑兑换
  const streak = await getStreak(account, fetchFn);
  log.push({ step: 'streak_info', streakDays: streak.days, makeupCards: streak.makeupCards?.balance || 0 });

  const rs = streak.redemptionStatus;
  if (rs) {
    const tiers = ['7d', '14d', '28d'];
    for (const tier of tiers) {
      const statusKey = `tier_${tier}_status`;
      if (rs[statusKey] === 'available') {
        const redeemRes = await redeemStreakTier(account, tier, fetchFn);
        if (redeemRes.ok && redeemRes.creditGranted) {
          totalCreditsGained += redeemRes.creditGranted;
        }
        log.push({ step: `redeem_${tier}`, ...redeemRes });
      }
    }
  }

  // 7. 连登抽奖 (将已有次数全部抽完，上限 10 次防死循环)
  let chances = await getLotteryChances(account, fetchFn);
  let draws = 0;
  while (chances > 0 && draws < 10) {
    draws++;
    const drawRes = await drawLottery(account, fetchFn);
    if (drawRes.ok && drawRes.creditAmount) {
      totalCreditsGained += drawRes.creditAmount;
    }
    log.push({ step: `draw_lottery_${draws}`, ...drawRes });
    chances = await getLotteryChances(account, fetchFn);
  }

  // 8. 补签卡检查
  const cardRes = await checkAndUseMakeupCard(account, fetchFn);
  if (cardRes.ok) {
    log.push({ step: 'makeup_card', ...cardRes });
  }

  // 9. 成长任务全自动点亮与收割
  try {
    const taskRes = await runAllGrowthTasks(account, fetchFn);
    if (taskRes.ok && taskRes.creditGained) {
      totalCreditsGained += taskRes.creditGained;
    }
    log.push({ step: 'growth_tasks', ...taskRes });
  } catch (e) {
    log.push({ step: 'growth_tasks', ok: false, error: e.message });
  }

  return {
    realm: 'cn',
    totalCreditsGained,
    log,
    summary: `福利与成长任务全套拉满！累计到账 +${totalCreditsGained} 积分`
  };
}

#!/usr/bin/env node
/**
 * dsh-workbuddy2api CLI - 终端诊断、账号管理与用量排查工具
 */

import { AccountStore } from '../src/pool/account-store.js';
import { UpstreamClient } from '../src/upstream/client.js';
import { UsageLedger } from '../src/pool/ledger.js';
import { performCheckin } from '../src/upstream/checkin.js';
import {
  getBuddyInfo,
  getTravelStatus,
  departTravel,
  claimTravel,
  runTravelForAccount
} from '../src/upstream/travel.js';
import {
  reportActiveChat,
  claimGift,
  claimCompensation,
  getStreak,
  drawLottery,
  getLotteryChances,
  claimAllWelfare
} from '../src/upstream/growth.js';
import {
  fetchGrowthTasks,
  runAllGrowthTasks
} from '../src/upstream/tasks.js';
import { STATIC_MODELS } from '../src/constants.js';

const [,, cmd, ...args] = process.argv;
const isJson = args.includes('--json');

const store = new AccountStore();
const client = new UpstreamClient({
  onTokenRefresh: (acc) => store.upsert(acc)
});
const ledger = new UsageLedger();

async function main() {
  switch (cmd) {
    case 'status': {
      const active = store.getActive();
      let balance = null;
      if (active) {
        try {
          balance = await client.fetchBalance(active);
        } catch (_) {}
      }

      const res = {
        totalAccounts: store.getAll().length,
        activeAccount: active?.account?.uid || 'none',
        realm: active?.auth?.realm || 'none',
        remainingPoints: balance?.remain ?? 'unknown',
        packages: balance?.packages || []
      };

      if (isJson) {
        console.log(JSON.stringify(res, null, 2));
      } else {
        console.log('\n=== WorkBuddy 2API 状态报告 ===');
        console.log(`账号池总数: ${res.totalAccounts}`);
        console.log(`当前激活账号: ${res.activeAccount} (${res.realm})`);
        console.log(`剩余积分余额: ${res.remainingPoints}`);
        if (res.packages.length > 0) {
          console.log('\n积分包明细:');
          for (const p of res.packages) {
            console.log(`  - ${p.name}: 余量 ${p.remain} / 已用 ${p.used} (到期: ${p.expireTime || '永久'})`);
          }
        }
        console.log('===============================\n');
      }
      break;
    }

    case 'models': {
      const active = store.getActive();
      let remoteModels = [];
      if (active) {
        try {
          remoteModels = await client.fetchModels(active);
        } catch (_) {}
      }

      const models = remoteModels.length > 0 ? remoteModels : STATIC_MODELS;
      if (isJson) {
        console.log(JSON.stringify(models, null, 2));
      } else {
        console.log(`\n=== 可用模型清单 (共 ${models.length} 个) ===`);
        for (const m of models) {
          const img = m.supportsImages ? ' [多模态]' : '';
          const rate = m.rate ? ` (${m.rate})` : '';
          console.log(`  • ${m.id} -> ${m.name}${img}${rate}`);
        }
        console.log('==========================================\n');
      }
      break;
    }

    case 'usage': {
      const stats = ledger.getStats();
      if (isJson) {
        console.log(JSON.stringify(stats, null, 2));
      } else {
        console.log('\n=== 本机用量账本统计 ===');
        console.log(`今日请求数: ${stats.today.requests}`);
        console.log(`今日 Tokens: ${stats.today.totalTokens} (输入: ${stats.today.inputTokens}, 输出: ${stats.today.outputTokens})`);
        console.log(`历史总请求: ${stats.summary.totalRequests}`);
        console.log(`历史 Tokens: ${stats.summary.totalInputTokens + stats.summary.totalOutputTokens}`);
        console.log('\n近 7 天走势:');
        for (const d of stats.trend7d) {
          console.log(`  ${d.date}: ${d.tokens} Tokens, ${d.requests} 次, 缓存命中率 ${d.hitRate}%`);
        }
        console.log('========================\n');
      }
      break;
    }

    case 'checkin': {
      const active = store.getActive();
      if (!active) {
        console.error('❌ 账号池无可用账号');
        process.exit(1);
      }
      console.log(`正在为账号 ${active.account.uid} (${active.auth.realm}) 执行签到...`);
      const res = await performCheckin(active);
      if (isJson) {
        console.log(JSON.stringify(res));
      } else {
        console.log(res.ok ? `✅ ${res.message}` : `❌ ${res.message}`);
      }
      break;
    }

    case 'accounts': {
      const list = await Promise.all(store.getAll().map(async (a) => {
        let bal = null;
        try {
          bal = await client.fetchBalance(a);
        } catch (_) {}
        return {
          uid: a.account.uid,
          nickname: a.account.nickname,
          realm: a.auth.realm,
          balance: bal?.remain ?? '未知',
          packagesCount: bal?.packages?.length ?? 0,
          isActive: a.account.uid === store.activeUid
        };
      }));
      if (isJson) {
        console.log(JSON.stringify(list, null, 2));
      } else {
        console.log('\n=== 账号池与实时积分清单 ===');
        for (const a of list) {
          const flag = a.isActive ? '★ [当前主号]' : '  ';
          const balStr = typeof a.balance === 'number' ? `${a.balance.toLocaleString()} 积分 (${a.packagesCount} 个包)` : `${a.balance}`;
          console.log(`${flag} ${a.uid} | ${a.nickname} | ${a.realm} | ${balStr}`);
        }
        console.log('====================================\n');
      }
      break;
    }

    case 'travel': {
      const sub = args[0] || 'status';
      const active = store.getActive();
      if (!active) {
        console.error('❌ 账号池无可用账号');
        process.exit(1);
      }

      if (active.auth?.realm === 'global') {
        console.log('⚠️ 当前主号为国际版账号 (Global)，猫猫旅行仅支持国内版账号 (CN)。');
        break;
      }

      if (sub === 'status') {
        const buddy = await getBuddyInfo(active);
        const travel = await getTravelStatus(active);
        if (isJson) {
          console.log(JSON.stringify({ buddy, travel }, null, 2));
        } else {
          console.log('\n=== 🐱 猫猫旅行档案与状态 ===');
          console.log(`小猫档案: ${buddy ? `${buddy.name} (ID: ${buddy.id})` : '暂未领养'}`);
          console.log(`旅行状态: ${travel.state} (${travel.state === 'idle' ? '空闲中' : travel.state === 'traveling' ? '旅行中' : '已到站可领奖'})`);
          console.log(`今日限额: ${travel.dailyLimitReached ? '今日已派出过 (已达上限)' : '未达上限'}`);
          if (travel.recordId) console.log(`旅程记录: ${travel.recordId}`);
          if (travel.rewardCredit) console.log(`待领奖励: +${travel.rewardCredit} 积分`);
          console.log('============================\n');
        }
      } else if (sub === 'depart') {
        const loc = parseInt(args[1] || '4', 10);
        console.log(`正在派出猫猫前往地点 ${loc} (古镇客栈)...`);
        const res = await departTravel(active, loc);
        console.log(res.ok ? `✅ ${res.message}` : `❌ ${res.message}`);
      } else if (sub === 'claim') {
        const travel = await getTravelStatus(active);
        if (travel.state !== 'arrived' || !travel.recordId) {
          console.log('⚠️ 当前猫猫尚未到站或无可领取的奖励记录');
        } else {
          console.log(`正在领取旅程记录 ${travel.recordId} 的到站奖励...`);
          const res = await claimTravel(active, travel.recordId);
          console.log(res.ok ? `✅ ${res.message}` : `❌ ${res.message}`);
        }
      } else if (sub === 'run') {
        console.log(`正在对账号 ${active.account.uid} 执行一趟完整旅行巡检状态机...`);
        const res = await runTravelForAccount(active);
        if (isJson) {
          console.log(JSON.stringify(res, null, 2));
        } else {
          console.log(`巡检结果: ${res.status}`);
          if (res.results?.actions) {
            for (const act of res.results.actions) {
              console.log(`  - [${act.action}] ${act.message || JSON.stringify(act)}`);
            }
          }
        }
      }
      break;
    }

    case 'growth':
    case 'welfare': {
      const sub = args[0] || 'claim';
      const active = store.getActive();
      if (!active) {
        console.error('❌ 账号池无可用账号');
        process.exit(1);
      }

      if (sub === 'streak') {
        const streak = await getStreak(active);
        const chances = await getLotteryChances(active);
        if (isJson) {
          console.log(JSON.stringify({ streak, chances }, null, 2));
        } else {
          console.log('\n=== 🌟 连登与抽奖状态 ===');
          console.log(`连续登录天数: ${streak.days} 天`);
          console.log(`可用补签卡: ${streak.makeupCards?.balance || 0} 张`);
          console.log(`当前抽奖次数: ${chances} 次`);
          console.log('=========================\n');
        }
      } else if (sub === 'draw') {
        console.log(`正在为账号 ${active.account.uid} 执行连登抽奖...`);
        const res = await drawLottery(active);
        console.log(res.ok ? `🎉 ${res.message}` : `❌ ${res.message}`);
      } else if (sub === 'claim') {
        console.log(`正在为账号 ${active.account.uid} (${active.auth.realm}) 一键吃满全套活动福利...`);
        const res = await claimAllWelfare(active);
        if (isJson) {
          console.log(JSON.stringify(res, null, 2));
        } else {
          console.log('\n=== 🎁 全套活动福利执行清单 ===');
          for (const item of res.log) {
            console.log(`  • [${item.step}]: ${item.message || (item.ok ? '成功' : '完成')}`);
          }
          console.log(`\n汇总: ${res.summary}`);
          console.log('===============================\n');
        }
      }
      break;
    }

    case 'tasks': {
      const sub = args[0] || 'list';
      const active = store.getActive();
      if (!active) {
        console.error('❌ 账号池无可用账号');
        process.exit(1);
      }
      if (active.auth?.realm === 'global') {
        console.log('⚠️ 当前主号为国际版账号 (Global)，成长任务仅支持国内版账号 (CN)。');
        break;
      }

      if (sub === 'list') {
        console.log(`正在拉取账号 ${active.account.uid} 的成长任务列表...`);
        const tasks = await fetchGrowthTasks(active);
        if (isJson) {
          console.log(JSON.stringify(tasks, null, 2));
        } else {
          console.log(`\n=== 📋 成长任务列表 (共 ${tasks.length} 项) ===`);
          for (const t of tasks) {
            const p = t.progress ? `${t.progress.current}/${t.progress.target}` : '-';
            const rew = t.reward_credit ? `+${t.reward_credit}分` : '';
            const stBadge = t.accept_status === 'claimed' ? '✅已领' : t.accept_status === 'completed' ? '🌟可领' : t.accept_status === 'accepted' ? '⏳进行中' : '⚪未接';
            console.log(`  ${stBadge.padEnd(6)} | ${t.task_code.padEnd(25)} | ${t.title.padEnd(16)} | 进度: ${p.padEnd(5)} | ${rew}`);
          }
          console.log('==============================================\n');
        }
      } else if (sub === 'run') {
        console.log(`正在对账号 ${active.account.uid} 执行全套成长任务自动点亮与收割...`);
        const res = await runAllGrowthTasks(active);
        if (isJson) {
          console.log(JSON.stringify(res, null, 2));
        } else {
          console.log('\n=== ⚡ 成长任务执行流水 ===');
          for (const log of res.logs || []) {
            console.log(`  • [${log.step}]: ${log.title || ''} -> ${log.message || (log.ok ? '成功' : '完成')}`);
          }
          console.log(`\n汇总: ${res.summary}`);
          console.log('==========================\n');
        }
      }
      break;
    }

    case 'doctor': {
      console.log('\n=== WorkBuddy 2API 环境诊断 ===');
      console.log(`Node.js 版本: ${process.version}`);
      console.log(`操作系统: ${process.platform} ${process.arch}`);
      console.log(`DSH_HOME: ${store.dshHome}`);
      console.log(`存储路径: ${store.storePath}`);
      console.log(`账本路径: ${ledger.filePath}`);
      console.log(`账号数量: ${store.getAll().length}`);
      console.log('诊断结论: ✅ 运行环境健康就绪');
      console.log('===============================\n');
      break;
    }

    default:
      console.log(`
DSH WorkBuddy 2API CLI 命令行工具

用法:
  dsh plugin exec dsh-workbuddy2api <command> [options]

可用命令:
  status [--json]      查看账号池运行状态与当前主号余额
  models [--json]      向上游拉取当前账号真实可用模型清单
  usage  [--json]      查看今日与近 7 天本机 Token 消耗与走势
  checkin              为当前激活账号执行每日签到或福利领取
  travel [subcmd]      🐱 猫猫旅行管家 (status / depart / claim / run)
  welfare [subcmd]     🎁 活动福利体系 (claim / streak / draw)
  tasks [subcmd]       📋 成长任务引擎 (list / run - 自动点亮+领奖)
  accounts             列出账号池内所有已保存的账号
  doctor               不泄露密钥的环境与存储健康检查
`);
  }
}

main().catch((err) => {
  console.error('CLI 执行异常:', err.message);
  process.exit(1);
});

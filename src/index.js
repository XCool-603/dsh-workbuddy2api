/**
 * index.js - DSH WorkBuddy2API 宿主插件核心入口
 */

import { unwrapConfig } from './config.js';
import { AccountStore } from './pool/account-store.js';
import { Scheduler } from './pool/scheduler.js';
import { UpstreamClient } from './upstream/client.js';
import { UsageLedger } from './pool/ledger.js';
import { LoopbackGateway } from './server/loopback.js';
import { registerWebRoutes } from './server/web-routes.js';
import { createWorkBuddyAdapter, registerLlmProvider } from './adapter/pi-ai-adapter.js';
import { performCheckin } from './upstream/checkin.js';
import { runTravelForAccount, getBuddyInfo, getTravelStatus, departTravel, claimTravel } from './upstream/travel.js';
import { claimAllWelfare, reportActiveChat, getStreak, drawLottery } from './upstream/growth.js';
import { fetchGrowthTasks, runAllGrowthTasks } from './upstream/tasks.js';
import { PROVIDER_NAME, PROVIDER_ALIAS, SETTINGS_NS } from './constants.js';

export const name = 'dsh-workbuddy2api';

export function apply(ctx, rawConfig) {
  const config = unwrapConfig(rawConfig);
  ctx.logger?.info?.('🚀 [dsh-workbuddy2api] 正在初始化 WorkBuddy 2API 网关插件...');

  // 1. 初始化账号存储、上游客户端、调度器与用量账本
  const store = new AccountStore({ authDir: config.authDir });
  const client = new UpstreamClient({
    proxy: config.proxy,
    onTokenRefresh: (acc) => store.upsert(acc)
  });
  const scheduler = new Scheduler(store, {
    maxInFlightCN: config.maxInFlightCN,
    maxInFlightGlobal: config.maxInFlightGlobal
  });
  const ledger = new UsageLedger();

  // 2. 初始化并拉起本地 OpenAI 兼容 Loopback 网关
  const loopback = new LoopbackGateway(scheduler, client, ledger, {
    port: config.gatewayPort,
    aliases: config.aliases,
    enabledModels: config.enabledModels
  });

  loopback.start().catch((err) => {
    ctx.logger?.error?.('[dsh-workbuddy2api] Loopback 网关启动异常:', err);
  });

  // 3. 注册 DSH 内部通信 WebServer 路由
  registerWebRoutes(ctx, { scheduler, client, ledger, loopback });

  // 4. 注册 DSH LLM Provider 与 Adapter
  const adapterObj = createWorkBuddyAdapter(loopback, () => Array.from(loopback.enabledModels));
  const disposeLlm = registerLlmProvider(ctx, adapterObj);

  // 5. 自动每日签到与猫猫旅行排程 (若启用)
  if (config.autoCheckin !== false) {
    scheduler.startAutoRoutines();
    setTimeout(async () => {
      const active = store.getActive();
      if (active) {
        try {
          ctx.logger?.info?.(`[dsh-workbuddy2api] 启动自动化例行任务：开始执行当前账号 (${active.account.nickname}) 福利与猫猫旅行...`);
          const welfareRes = await claimAllWelfare(active);
          ctx.logger?.info?.(`[dsh-workbuddy2api] 例行福利结果: ${welfareRes.summary}`);
        } catch (e) {
          ctx.logger?.warn?.(`[dsh-workbuddy2api] 启动自动化例行任务警告: ${e.message}`);
        }
      }
    }, 3000);
  }

  // 6. 生命周期卸载清理
  ctx.effect?.(() => {
    return () => {
      ctx.logger?.info?.('[dsh-workbuddy2api] 正在停止网关并释放资源...');
      scheduler.stopAutoRoutines();
      loopback.stop();
      if (disposeLlm) disposeLlm();
    };
  }, 'dsh-workbuddy2api lifecycle');

  console.log(`[dsh-workbuddy2api] ✅ 插件加载完毕，已就绪账号: ${store.getAll().length} 个`);
}

export {
  AccountStore,
  Scheduler,
  UpstreamClient,
  UsageLedger,
  LoopbackGateway,
  performCheckin,
  runTravelForAccount,
  getBuddyInfo,
  getTravelStatus,
  departTravel,
  claimTravel,
  claimAllWelfare,
  reportActiveChat,
  getStreak,
  drawLottery,
  fetchGrowthTasks,
  runAllGrowthTasks,
  PROVIDER_NAME,
  PROVIDER_ALIAS,
  SETTINGS_NS
};

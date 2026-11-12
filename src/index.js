/**
 * index.js - DSH WorkBuddy2API 宿主插件核心入口
 */

import { createGatewayRuntime } from './runtime.js';
import { unwrapConfig, ConfigStore } from './config.js';
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
import { claimGlobalTrial } from './upstream/trial.js';
import { fetchInviteInfo, bindInviteCode } from './upstream/invite.js';
import { startOAuthFlow, pollOAuthFlow } from './upstream/oauth.js';
import { batchImportAccounts, exportBackupZip } from './pool/import-export.js';
import { PROVIDER_NAME, PROVIDER_ALIAS, SETTINGS_NS } from './constants.js';

export const name = 'dsh-workbuddy2api';
export const inject = ['webServer'];

export function apply(ctx, rawConfig) {
  ctx.logger?.info?.('🚀 [dsh-workbuddy2api] 正在初始化 WorkBuddy 2API 全功能网关插件...');

  const runtime = createGatewayRuntime({
    ctx,
    rawConfig: rawConfig || {},
    logger: ctx.logger
  });
  const { configStore, store, client, scheduler, ledger, loopback } = runtime;

  runtime.start().catch((err) => {
    ctx.logger?.error?.('[dsh-workbuddy2api] Loopback 网关启动异常:', err);
  });

  // 注册 DSH 原生 LLM Provider 与 Adapter
  const adapterObj = createWorkBuddyAdapter(
    loopback,
    () => configStore.get('enabledModels') || Array.from(loopback.enabledModels),
    { scheduler, client, ledger, ctx }
  );
  let disposeLlm = null;
  if (typeof ctx.inject === 'function') {
    ctx.inject(['llm'], (llmCtx) => {
      const d = registerLlmProvider(llmCtx, adapterObj);
      llmCtx.effect?.(() => d, 'dsh-workbuddy2api llm lifecycle');
    });
  } else if (ctx.llm) {
    disposeLlm = registerLlmProvider(ctx, adapterObj);
  }

  // 生命周期卸载清理（热重载时立即销毁占用的端口与全部定时器）
  ctx.effect?.(() => {
    return () => {
      ctx.logger?.info?.('[dsh-workbuddy2api] 正在停止网关并释放资源...');
      runtime.stop();
      if (disposeLlm) disposeLlm();
    };
  }, 'dsh-workbuddy2api lifecycle');

  console.log(`[dsh-workbuddy2api] ✅ 插件加载完毕，已就绪账号: ${store.getAll().length} 个`);
}

export {
  ConfigStore,
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
  claimGlobalTrial,
  fetchInviteInfo,
  bindInviteCode,
  startOAuthFlow,
  pollOAuthFlow,
  batchImportAccounts,
  exportBackupZip,
  PROVIDER_NAME,
  PROVIDER_ALIAS,
  SETTINGS_NS
};

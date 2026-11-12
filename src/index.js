/**
 * index.js - DSH WorkBuddy2API 宿主插件核心入口
 */

import { unwrapConfig, ConfigStore } from './config.js';
import { AccountStore } from './pool/account-store.js';
import { Scheduler } from './pool/scheduler.js';
import { UpstreamClient } from './upstream/client.js';
import { UsageLedger } from './pool/ledger.js';
import { LoopbackGateway } from './server/loopback.js';
import { AlertManager } from './server/alerts.js';
import { UserManager } from './server/auth-users.js';
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
  const configStore = new ConfigStore(rawConfig || {});
  const cfg = configStore.getAll();

  ctx.logger?.info?.('🚀 [dsh-workbuddy2api] 正在初始化 WorkBuddy 2API 全功能网关插件...');

  // 1. 初始化账号存储、上游客户端、告警管理器、多租户用户系统、调度器与用量账本
  const store = new AccountStore({ authDir: cfg.authDir });
  const alertManager = new AlertManager({ configStore });
  const userManager = new UserManager({ configStore, dshHome: configStore.dshHome });
  const client = new UpstreamClient({
    configStore,
    proxy: cfg.proxy,
    onTokenRefresh: (acc) => store.upsert(acc)
  });
  const scheduler = new Scheduler(store, {
    client,
    configStore,
    alertManager,
    maxInFlightCN: cfg.maxInFlightCN,
    maxInFlightGlobal: cfg.maxInFlightGlobal,
    queueTimeoutMs: cfg.queueTimeoutMs
  });
  const ledger = new UsageLedger();

  // 2. 初始化并拉起本地多协议兼容网关（OpenAI Chat / Anthropic / Responses / Video / White-Blue Console）
  const loopback = new LoopbackGateway(scheduler, client, ledger, {
    configStore,
    userManager,
    alertManager,
    port: cfg.gatewayPort,
    apiKey: cfg.apiKey,
    aliases: cfg.aliases,
    enabledModels: cfg.enabledModels
  });

  // 3. 注册全量内网管控台路由（同时挂载到 DSH WebServer 与 Loopback Console）
  registerWebRoutes(ctx, { scheduler, client, ledger, loopback, configStore, userManager, alertManager });

  loopback
    .start()
    .then(() => {
      // 网关就绪后静默同步一次上游动态模型目录
      loopback.refreshDiscoveredModels().catch(() => {});
    })
    .catch((err) => {
      ctx.logger?.error?.('[dsh-workbuddy2api] Loopback 网关启动异常:', err);
    });

  // 4. 注册 DSH 原生 LLM Provider 与 Adapter
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

  // 5. 自动每日签到、猫猫旅行与 5 分钟 Token 保活排程
  let startupTimer = null;
  scheduler.startAutoRoutines();
  if (cfg.autoCheckin !== false) {
    startupTimer = setTimeout(async () => {
      const active = store.getActive();
      if (active && !active.disabled) {
        try {
          ctx.logger?.info?.(`[dsh-workbuddy2api] 启动自动化例行任务：开始执行当前账号 (${active.account.nickname}) 福利与猫猫旅行...`);
          const welfareRes = await claimAllWelfare(active);
          ctx.logger?.info?.(`[dsh-workbuddy2api] 例行福利结果: ${welfareRes.summary}`);
        } catch (e) {
          ctx.logger?.warn?.(`[dsh-workbuddy2api] 启动自动化例行任务警告: ${e.message}`);
        }
      }
    }, 3000);
    if (startupTimer.unref) startupTimer.unref();
  }

  // 6. 生命周期卸载清理（热重载时立即销毁占用的端口与全部定时器）
  ctx.effect?.(() => {
    return () => {
      if (startupTimer) clearTimeout(startupTimer);
      ctx.logger?.info?.('[dsh-workbuddy2api] 正在停止网关并释放资源...');
      scheduler.stopAutoRoutines();
      loopback.stop();
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

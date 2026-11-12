/**
 * runtime.js - WorkBuddy 2API 共享网关运行时引擎
 * 同时被 DSH 宿主插件 (src/index.js)、独立 CLI serve 命令与 WorkBuddy/VS Code 扩展复用
 */

import { ConfigStore } from './config.js';
import { AccountStore } from './pool/account-store.js';
import { Scheduler } from './pool/scheduler.js';
import { UpstreamClient } from './upstream/client.js';
import { UsageLedger } from './pool/ledger.js';
import { LoopbackGateway } from './server/loopback.js';
import { AlertManager } from './server/alerts.js';
import { UserManager } from './server/auth-users.js';
import { registerWebRoutes } from './server/web-routes.js';
import { claimAllWelfare } from './upstream/growth.js';

export function createGatewayRuntime(options = {}) {
  const rawConfig = options.rawConfig || {};
  const storeOpts = options.dshHome ? { dshHome: options.dshHome } : undefined;
  const configStore = new ConfigStore(rawConfig, storeOpts);
  const cfg = configStore.getAll();
  const resolvedHome = options.dshHome || configStore.dshHome;

  const store = new AccountStore({
    dshHome: resolvedHome,
    authDir: options.authDir ?? cfg.authDir,
    skipDiscovery: Boolean(options.skipDiscovery)
  });
  const alertManager = new AlertManager({ configStore });
  const userManager = new UserManager({ configStore, dshHome: resolvedHome });
  const client = new UpstreamClient({
    configStore,
    dshHome: resolvedHome,
    proxy: options.proxy ?? cfg.proxy,
    onTokenRefresh: (acc) => store.upsert(acc)
  });
  const scheduler = new Scheduler(store, {
    client,
    configStore,
    alertManager,
    dshHome: resolvedHome,
    maxInFlightCN: cfg.maxInFlightCN,
    maxInFlightGlobal: cfg.maxInFlightGlobal,
    queueTimeoutMs: cfg.queueTimeoutMs
  });
  const ledger = new UsageLedger({ dshHome: resolvedHome });

  const port = options.port ?? cfg.gatewayPort;
  const loopback = new LoopbackGateway(scheduler, client, ledger, {
    configStore,
    userManager,
    alertManager,
    port,
    apiKey: cfg.apiKey,
    aliases: cfg.aliases,
    enabledModels: cfg.enabledModels
  });

  const routesInfo = registerWebRoutes(options.ctx || null, {
    scheduler,
    client,
    ledger,
    loopback,
    configStore,
    userManager,
    alertManager
  });

  let startupTimer = null;
  let started = false;
  const log = options.logger || console;

  async function start() {
    if (started) {
      return loopback.actualPort || port;
    }
    started = true;

    const boundPort = await loopback.start();
    loopback.refreshDiscoveredModels().catch(() => {});
    scheduler.startAutoRoutines();

    if (cfg.autoCheckin !== false && !options.skipInitialWelfare) {
      startupTimer = setTimeout(async () => {
        const active = store.getActive();
        if (active && !active.disabled) {
          try {
            log?.info?.(`[workbuddy2api] 启动自动化例行任务：开始执行当前账号 (${active.account.nickname}) 福利与猫猫旅行...`);
            const welfareRes = await claimAllWelfare(active);
            log?.info?.(`[workbuddy2api] 例行福利结果: ${welfareRes.summary}`);
          } catch (e) {
            log?.warn?.(`[workbuddy2api] 启动自动化例行任务警告: ${e.message}`);
          }
        }
      }, 3000);
      if (startupTimer.unref) startupTimer.unref();
    }

    return boundPort;
  }

  function stop() {
    if (startupTimer) {
      clearTimeout(startupTimer);
      startupTimer = null;
    }
    scheduler.stopAutoRoutines();
    loopback.stop();
    started = false;
  }

  return {
    dshHome: resolvedHome,
    configStore,
    store,
    alertManager,
    userManager,
    client,
    scheduler,
    ledger,
    loopback,
    routesInfo,
    start,
    stop
  };
}

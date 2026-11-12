/**
 * extension.js - WorkBuddy / VS Code 官方 VSIX 扩展主入口
 * 启动时自动探测并接管或内置拉起本地多协议网关，并在侧边栏 & 编辑器标签页提供完整白蓝控制台
 */

import http from 'node:http';
import * as vscode from 'vscode';
import { createGatewayRuntime } from '../../src/runtime.js';
import { renderConsoleHtml } from '../../src/server/dashboard-html.js';
import { SERVICE_VERSION } from '../../src/constants.js';
import { attachWebviewBridge, injectWebviewBridge } from './webview-bridge.js';
import { renderSidebarHtml } from './sidebar-html.js';

function probeGatewayHealth(port) {
  return new Promise((resolve) => {
    const req = http.get(
      { host: '127.0.0.1', port, path: '/health', timeout: 1500 },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          try {
            const data = JSON.parse(Buffer.concat(chunks).toString('utf8'));
            resolve(data && data.service === 'dsh-workbuddy2api' ? data : null);
          } catch (_) {
            resolve(null);
          }
        });
      }
    );
    req.on('error', () => resolve(null));
    req.on('timeout', () => {
      req.destroy();
      resolve(null);
    });
  });
}

function fetchStatusJson(port) {
  return new Promise((resolve) => {
    const req = http.get(
      { host: '127.0.0.1', port, path: '/plugins/dsh-workbuddy2api/public/status', timeout: 2500 },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          try {
            resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
          } catch (_) {
            resolve(null);
          }
        });
      }
    );
    req.on('error', () => resolve(null));
    req.on('timeout', () => {
      req.destroy();
      resolve(null);
    });
  });
}

let activeController = null;

export async function activate(context) {
  const output = vscode.window.createOutputChannel('WorkBuddy 2API');
  context.subscriptions.push(output);

  let runtime = null;
  let gatewayMode = 'stopped';
  let activePort = 7863;
  let sidebarViewRef = null;
  let consolePanelRef = null;
  let pollTimer = null;

  const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBar.command = 'workbuddy2api.openConsole';
  statusBar.text = '$(zap) WB2API 启动中...';
  statusBar.tooltip = 'WorkBuddy 2API 多账号网关（点击打开完整控制台）';
  statusBar.show();
  context.subscriptions.push(statusBar);

  function notifyViews() {
    const extState = { mode: gatewayMode, port: activePort, version: SERVICE_VERSION };
    if (sidebarViewRef) {
      sidebarViewRef.webview.postMessage({ type: 'wb2a:ext-update', state: extState });
    }
    if (consolePanelRef) {
      consolePanelRef.webview.postMessage({ type: 'wb2a:ext-update', state: extState });
    }
  }

  async function refreshStatusBar() {
    if (gatewayMode === 'stopped') {
      statusBar.text = '$(circle-slash) WB2API 未启动';
      return;
    }
    const pub = await fetchStatusJson(activePort);
    if (pub && pub.ok) {
      statusBar.text = `$(zap) WB2API :${activePort} · ${pub.healthy || 0}/${pub.total || 0} 号`;
      statusBar.tooltip = `WorkBuddy 2API (${gatewayMode === 'attached' ? '外部接管' : '内置运行'}) | 健康 ${pub.healthy}/${pub.total} | 点击打开全功能控制台`;
    } else {
      statusBar.text = `$(zap) WB2API :${activePort}`;
    }
  }

  async function ensureGateway(forceRestart = false) {
    const cfg = vscode.workspace.getConfiguration('workbuddy2api');
    const autoStart = cfg.get('autoStart', true);
    const rawPort = cfg.get('port', 7863);
    const configuredPort = rawPort === 0 ? 0 : (Number(rawPort) || 7863);
    const configuredHome = String(cfg.get('dshHome', '') || '').trim() || undefined;
    const configuredProxy = String(cfg.get('proxy', '') || '').trim() || undefined;

    if (forceRestart && runtime) {
      runtime.stop();
      runtime = null;
      gatewayMode = 'stopped';
    }

    const existing = configuredPort > 0 ? await probeGatewayHealth(configuredPort) : null;
    if (existing) {
      activePort = Number(existing.port || configuredPort);
      gatewayMode = 'attached';
      output.appendLine(`[gateway] 检测到已有服务运行于 127.0.0.1:${activePort}，已无缝接管共享`);
      await refreshStatusBar();
      notifyViews();
      return activePort;
    }

    if (!autoStart && !forceRestart) {
      activePort = configuredPort;
      gatewayMode = 'stopped';
      await refreshStatusBar();
      return activePort;
    }

    try {
      runtime = createGatewayRuntime({
        dshHome: configuredHome,
        port: configuredPort,
        proxy: configuredProxy,
        skipInitialWelfare: false,
        logger: {
          info: (m) => output.appendLine(`[INFO] ${m}`),
          warn: (m) => output.appendLine(`[WARN] ${m}`),
          error: (m, e) => output.appendLine(`[ERR] ${m} ${e?.message || ''}`)
        }
      });
      activePort = await runtime.start();
      gatewayMode = 'embedded';
      output.appendLine(`[gateway] 内置网关启动成功: http://127.0.0.1:${activePort}`);
    } catch (err) {
      gatewayMode = 'stopped';
      output.appendLine(`[ERR] 内置网关启动失败: ${err.message}`);
      vscode.window.showErrorMessage(`WorkBuddy 2API 网关启动失败: ${err.message}`);
    }

    await refreshStatusBar();
    notifyViews();
    return activePort;
  }

  function renderFullConsoleForWebview() {
    return injectWebviewBridge(renderConsoleHtml({ port: activePort }), activePort, {
      mode: gatewayMode,
      port: activePort,
      version: SERVICE_VERSION
    });
  }

  function openConsolePanel() {
    if (consolePanelRef) {
      consolePanelRef.reveal(vscode.ViewColumn.One);
      return;
    }
    const panel = vscode.window.createWebviewPanel(
      'workbuddy2api.console',
      'WorkBuddy 2API 控制台',
      vscode.ViewColumn.One,
      { enableScripts: true, retainContextWhenHidden: true }
    );
    consolePanelRef = panel;
    attachWebviewBridge(panel.webview, vscode, () => activePort, context.subscriptions);
    panel.webview.html = renderFullConsoleForWebview();
    panel.onDidDispose(() => {
      if (consolePanelRef === panel) consolePanelRef = null;
    });
  }

  const sidebarProvider = {
    resolveWebviewView(webviewView) {
      sidebarViewRef = webviewView;
      webviewView.webview.options = { enableScripts: true };
      attachWebviewBridge(webviewView.webview, vscode, () => activePort, context.subscriptions);
      webviewView.webview.html = injectWebviewBridge(
        renderSidebarHtml({ port: activePort, mode: gatewayMode, version: SERVICE_VERSION }),
        activePort,
        { mode: gatewayMode, port: activePort, version: SERVICE_VERSION }
      );
      webviewView.onDidDispose(() => {
        if (sidebarViewRef === webviewView) sidebarViewRef = null;
      });
    }
  };
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('workbuddy2api.sidebarView', sidebarProvider, {
      webviewOptions: { retainContextWhenHidden: true }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('workbuddy2api.openConsole', async () => {
      if (gatewayMode === 'stopped') await ensureGateway(false);
      openConsolePanel();
    }),
    vscode.commands.registerCommand('workbuddy2api.openBrowser', async () => {
      if (gatewayMode === 'stopped') await ensureGateway(false);
      vscode.env.openExternal(vscode.Uri.parse(`http://127.0.0.1:${activePort}/console`));
    }),
    vscode.commands.registerCommand('workbuddy2api.refreshPool', async () => {
      await refreshStatusBar();
      if (sidebarViewRef) {
        sidebarViewRef.webview.postMessage({ type: 'wb2a:ext-update', state: { mode: gatewayMode, port: activePort } });
      }
      vscode.window.showInformationMessage(`WorkBuddy 2API 状态已刷新 (:${activePort})`);
    }),
    vscode.commands.registerCommand('workbuddy2api.checkinAll', async () => {
      if (gatewayMode === 'stopped') await ensureGateway(false);
      const req = http.request(
        { host: '127.0.0.1', port: activePort, path: '/plugins/dsh-workbuddy2api/checkin', method: 'POST', headers: { 'Content-Type': 'application/json' } },
        (res) => {
          const chunks = [];
          res.on('data', (c) => chunks.push(c));
          res.on('end', () => {
            try {
              const d = JSON.parse(Buffer.concat(chunks).toString('utf8'));
              vscode.window.showInformationMessage(d.message || '全池每日签到完成');
            } catch (_) {
              vscode.window.showInformationMessage('全池每日签到已触发');
            }
          });
        }
      );
      req.write(JSON.stringify({ all: true }));
      req.end();
    }),
    vscode.commands.registerCommand('workbuddy2api.copyEndpoints', async () => {
      const choice = await vscode.window.showQuickPick(
        [
          { label: '复制 OpenAI Chat / Codex Base URL', value: `http://127.0.0.1:${activePort}/v1` },
          { label: '复制 Claude Code (Anthropic) 环境变量 (PowerShell)', value: `$env:ANTHROPIC_BASE_URL="http://127.0.0.1:${activePort}" ; $env:ANTHROPIC_API_KEY="sk-local"` },
          { label: '复制 Web 控制台地址', value: `http://127.0.0.1:${activePort}/console` }
        ],
        { placeHolder: '选择要复制的接入配置' }
      );
      if (choice) {
        await vscode.env.clipboard.writeText(choice.value);
        vscode.window.showInformationMessage(`已复制: ${choice.label}`);
      }
    }),
    vscode.commands.registerCommand('workbuddy2api.restartGateway', async () => {
      await ensureGateway(true);
      if (consolePanelRef) consolePanelRef.webview.html = renderFullConsoleForWebview();
      vscode.window.showInformationMessage(`WorkBuddy 2API 已就绪 (${gatewayMode === 'attached' ? '接管外部网关' : '内置运行'} :${activePort})`);
    })
  );

  await ensureGateway(false);
  pollTimer = setInterval(() => {
    refreshStatusBar().catch(() => {});
  }, 20000);
  if (pollTimer.unref) pollTimer.unref();

  activeController = {
    getPort: () => activePort,
    getMode: () => gatewayMode,
    dispose: () => {
      if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
      if (runtime && gatewayMode === 'embedded') {
        runtime.stop();
        runtime = null;
      }
      gatewayMode = 'stopped';
    }
  };
}

export function deactivate() {
  if (activeController) {
    activeController.dispose();
    activeController = null;
  }
}

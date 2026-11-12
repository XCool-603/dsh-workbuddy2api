/**
 * webview-bridge.js - WorkBuddy / VS Code Webview 与本地多协议网关的无障碍安全通信桥
 * 解决 Webview 沙箱下 CSP、CORS、Cookie、弹窗确认(confirm/prompt)、OAuth 外链与文件保存导出问题
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

export function buildWebviewBridgeScript(port, extraState = {}) {
  const origin = `http://127.0.0.1:${port}`;
  return `<script>
(function() {
  if (typeof acquireVsCodeApi !== 'function') return;
  const vscode = acquireVsCodeApi();
  window.__WB2A_VSCODE__ = vscode;
  window.__WB2A_API_ORIGIN__ = ${JSON.stringify(origin)};
  window.__WB2A_EXT_STATE__ = ${JSON.stringify(extraState)};

  const pendingFetch = new Map();
  const pendingDialog = new Map();
  let nextSeq = 1;
  const origFetch = window.fetch ? window.fetch.bind(window) : null;

  function b64ToBytes(b64) {
    const bin = atob(b64 || '');
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return arr;
  }

  window.addEventListener('message', (event) => {
    const msg = event.data;
    if (!msg || typeof msg.type !== 'string') return;

    if (msg.type === 'wb2a:dialog-res') {
      const p = pendingDialog.get(msg.reqId);
      if (p) {
        pendingDialog.delete(msg.reqId);
        p.resolve(msg.value);
      }
      return;
    }

    if (msg.type === 'wb2a:ext-update') {
      window.__WB2A_EXT_STATE__ = msg.state || {};
      window.dispatchEvent(new CustomEvent('wb2a:ext-state', { detail: msg.state || {} }));
      return;
    }

    const entry = pendingFetch.get(msg.reqId);
    if (!entry) return;

    if (msg.type === 'wb2a:fetch-start') {
      let streamCtrl = null;
      const stream = new ReadableStream({
        start(c) { streamCtrl = c; }
      });
      entry.ctrl = streamCtrl;
      const headers = new Headers(msg.headers || {});
      entry.resolve(new Response(stream, { status: msg.status || 200, statusText: msg.statusText || '', headers }));
    } else if (msg.type === 'wb2a:fetch-chunk') {
      if (entry.ctrl && msg.b64) {
        try { entry.ctrl.enqueue(b64ToBytes(msg.b64)); } catch (_) {}
      }
    } else if (msg.type === 'wb2a:fetch-end') {
      if (entry.ctrl) {
        try { entry.ctrl.close(); } catch (_) {}
      }
      pendingFetch.delete(msg.reqId);
    } else if (msg.type === 'wb2a:fetch-err') {
      const err = new Error(msg.error || 'Webview bridge fetch error');
      if (!entry.started) entry.reject(err);
      else if (entry.ctrl) try { entry.ctrl.error(err); } catch (_) {}
      pendingFetch.delete(msg.reqId);
    }
  });

  window.fetch = function(input, init = {}) {
    const rawUrl = typeof input === 'string' ? input : (input && input.url ? input.url : '');
    let targetPath = '';
    if (rawUrl.startsWith('/')) {
      targetPath = rawUrl;
    } else if (rawUrl.startsWith(window.__WB2A_API_ORIGIN__)) {
      targetPath = rawUrl.slice(window.__WB2A_API_ORIGIN__.length) || '/';
    } else if (!rawUrl.includes('://')) {
      targetPath = '/' + rawUrl;
    }

    if (!targetPath) {
      return origFetch ? origFetch(input, init) : Promise.reject(new Error('Unsupported fetch URL'));
    }

    const reqId = 'r_' + (nextSeq++);
    const method = (init.method || (input && input.method) || 'GET').toUpperCase();
    const hdrObj = {};
    try {
      const h = new Headers(init.headers || (input && input.headers) || {});
      h.forEach((v, k) => { hdrObj[k] = v; });
    } catch (_) {}

    let bodyStr = '';
    if (typeof init.body === 'string') bodyStr = init.body;
    else if (init.body != null) bodyStr = String(init.body);

    return new Promise((resolve, reject) => {
      const entry = {
        started: false,
        ctrl: null,
        resolve: (res) => { entry.started = true; resolve(res); },
        reject
      };
      pendingFetch.set(reqId, entry);
      vscode.postMessage({
        type: 'wb2a:fetch',
        reqId,
        path: targetPath,
        method,
        headers: hdrObj,
        body: bodyStr
      });
    });
  };

  function askDialog(type, payload) {
    const reqId = 'd_' + (nextSeq++);
    return new Promise((resolve) => {
      pendingDialog.set(reqId, { resolve });
      vscode.postMessage({ type, reqId, ...payload });
    });
  }

  window.__wb2aOpenExternal = (url) => vscode.postMessage({ type: 'wb2a:openExternal', url });
  window.__wb2aCopyText = (text, label) => vscode.postMessage({ type: 'wb2a:copyText', text, label });
  window.__wb2aExportZip = () => vscode.postMessage({ type: 'wb2a:exportZip' });
  window.__wb2aConfirm = (message) => askDialog('wb2a:confirm', { message });
  window.__wb2aPrompt = (message, defaultValue) => askDialog('wb2a:prompt', { message, defaultValue });
  window.__wb2aCommand = (command, args) => vscode.postMessage({ type: 'wb2a:command', command, args });
})();
</script>`;
}

export function injectWebviewBridge(rawHtml, port, extraState = {}) {
  const csp = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src http://127.0.0.1:* http://localhost:*; img-src * data: blob:;">`;
  const bridge = buildWebviewBridgeScript(port, extraState);
  let out = rawHtml;
  if (out.includes('</head>')) {
    out = out.replace('</head>', `${csp}\n${bridge}\n</head>`);
  } else {
    out = `${csp}\n${bridge}\n${out}`;
  }
  return out;
}

function collectHttpBuffer(port, reqPath, options = {}, cookiesMap = null) {
  return new Promise((resolve, reject) => {
    const headers = { ...(options.headers || {}) };
    if (cookiesMap && cookiesMap.size > 0 && !headers.cookie && !headers.Cookie) {
      headers.Cookie = [...cookiesMap.entries()].map(([k, v]) => `${k}=${v}`).join('; ');
    }
    const req = http.request(
      {
        host: '127.0.0.1',
        port,
        path: reqPath,
        method: options.method || 'GET',
        headers
      },
      (res) => {
        if (cookiesMap && Array.isArray(res.headers['set-cookie'])) {
          for (const sc of res.headers['set-cookie']) {
            const pair = String(sc).split(';')[0];
            const eq = pair.indexOf('=');
            if (eq > 0) {
              const k = pair.slice(0, eq).trim();
              const v = pair.slice(eq + 1).trim();
              if (v) cookiesMap.set(k, v);
              else cookiesMap.delete(k);
            }
          }
        }
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => resolve({ status: res.statusCode || 200, headers: res.headers, body: Buffer.concat(chunks) }));
        res.on('error', reject);
      }
    );
    req.setTimeout(30000, () => req.destroy(new Error('Request timeout')));
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

export function attachWebviewBridge(webview, vscode, getPort, disposables = []) {
  const cookieJar = new Map();

  const sub = webview.onDidReceiveMessage(async (msg) => {
    if (!msg || typeof msg.type !== 'string') return;
    const port = getPort();

    if (msg.type === 'wb2a:fetch') {
      const headers = { ...(msg.headers || {}) };
      if (cookieJar.size > 0 && !headers.cookie && !headers.Cookie) {
        headers.Cookie = [...cookieJar.entries()].map(([k, v]) => `${k}=${v}`).join('; ');
      }
      const req = http.request(
        {
          host: '127.0.0.1',
          port,
          path: msg.path || '/',
          method: msg.method || 'GET',
          headers
        },
        (res) => {
          if (Array.isArray(res.headers['set-cookie'])) {
            for (const sc of res.headers['set-cookie']) {
              const pair = String(sc).split(';')[0];
              const eq = pair.indexOf('=');
              if (eq > 0) {
                const k = pair.slice(0, eq).trim();
                const v = pair.slice(eq + 1).trim();
                if (v) cookieJar.set(k, v);
                else cookieJar.delete(k);
              }
            }
          }
          const flatHeaders = {};
          for (const [k, v] of Object.entries(res.headers)) {
            if (typeof v === 'string') flatHeaders[k] = v;
            else if (Array.isArray(v)) flatHeaders[k] = v.join(', ');
          }
          webview.postMessage({
            type: 'wb2a:fetch-start',
            reqId: msg.reqId,
            status: res.statusCode || 200,
            statusText: res.statusMessage || '',
            headers: flatHeaders
          });
          res.on('data', (chunk) => {
            webview.postMessage({
              type: 'wb2a:fetch-chunk',
              reqId: msg.reqId,
              b64: Buffer.from(chunk).toString('base64')
            });
          });
          res.on('end', () => {
            webview.postMessage({ type: 'wb2a:fetch-end', reqId: msg.reqId });
          });
          res.on('error', (err) => {
            webview.postMessage({ type: 'wb2a:fetch-err', reqId: msg.reqId, error: err.message });
          });
        }
      );
      req.setTimeout(180000, () => req.destroy(new Error('Gateway request timeout')));
      req.on('error', (err) => {
        webview.postMessage({ type: 'wb2a:fetch-err', reqId: msg.reqId, error: err.message });
      });
      if (msg.body) req.write(msg.body);
      req.end();
      return;
    }

    if (msg.type === 'wb2a:openExternal' && msg.url) {
      vscode.env.openExternal(vscode.Uri.parse(String(msg.url)));
      return;
    }

    if (msg.type === 'wb2a:copyText' && msg.text !== undefined) {
      await vscode.env.clipboard.writeText(String(msg.text));
      vscode.window.showInformationMessage(`已复制 ${msg.label || '内容'}`);
      return;
    }

    if (msg.type === 'wb2a:confirm') {
      const choice = await vscode.window.showWarningMessage(String(msg.message || '确认继续操作吗？'), { modal: true }, '确定');
      webview.postMessage({ type: 'wb2a:dialog-res', reqId: msg.reqId, value: choice === '确定' });
      return;
    }

    if (msg.type === 'wb2a:prompt') {
      const val = await vscode.window.showInputBox({
        prompt: String(msg.message || ''),
        value: msg.defaultValue !== undefined ? String(msg.defaultValue) : ''
      });
      webview.postMessage({ type: 'wb2a:dialog-res', reqId: msg.reqId, value: val === undefined ? null : val });
      return;
    }

    if (msg.type === 'wb2a:exportZip') {
      try {
        const res = await collectHttpBuffer(port, '/plugins/dsh-workbuddy2api/accounts/export.zip', { method: 'GET' }, cookieJar);
        if (res.status >= 400) {
          vscode.window.showErrorMessage('导出账号备份失败: HTTP ' + res.status);
          return;
        }
        const stamp = new Date().toISOString().slice(0, 10);
        const target = await vscode.window.showSaveDialog({
          defaultUri: vscode.Uri.file(path.join(process.env.USERPROFILE || process.env.HOME || process.cwd(), `workbuddy2api-backup-${stamp}.zip`)),
          filters: { 'ZIP Archive': ['zip'] }
        });
        if (target?.fsPath) {
          fs.writeFileSync(target.fsPath, res.body);
          vscode.window.showInformationMessage(`已导出账号备份至: ${target.fsPath}`);
        }
      } catch (err) {
        vscode.window.showErrorMessage(`导出备份失败: ${err.message}`);
      }
      return;
    }

    if (msg.type === 'wb2a:command' && typeof msg.command === 'string' && msg.command.startsWith('workbuddy2api.')) {
      vscode.commands.executeCommand(msg.command, ...(Array.isArray(msg.args) ? msg.args : []));
    }
  });

  disposables.push(sub);
  return sub;
}

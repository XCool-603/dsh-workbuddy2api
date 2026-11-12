/**
 * sidebar-html.js - WorkBuddy / VS Code 左侧活动栏白蓝清爽快捷概览侧边栏
 */

export function renderSidebarHtml(opts = {}) {
  const port = opts.port || 7863;
  const mode = opts.mode || 'embedded';
  const version = opts.version || '1.3.0';

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>WorkBuddy 2API</title>
  <style>
    :root {
      --bg: #f4f7fb;
      --card: #ffffff;
      --soft: #f8fafc;
      --border: #dbe5f1;
      --blue: #2563eb;
      --green: #059669;
      --amber: #d97706;
      --red: #dc2626;
      --text: #0f172a;
      --dim: #64748b;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0; padding: 10px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif;
      background: var(--bg); color: var(--text); font-size: 12px;
    }
    .card {
      background: var(--card); border: 1px solid var(--border); border-radius: 10px;
      padding: 10px; margin-bottom: 10px; box-shadow: 0 2px 8px rgba(15, 35, 75, 0.04);
    }
    .row-between { display: flex; justify-content: space-between; align-items: center; gap: 6px; flex-wrap: wrap; }
    .tag {
      display: inline-block; padding: 2px 7px; border-radius: 999px; font-size: 10px; font-weight: 600;
      background: #eff6ff; color: var(--blue); border: 1px solid #bfdbfe;
    }
    .tag-ok { background: #ecfdf5; color: var(--green); border-color: #a7f3d0; }
    .tag-warn { background: #fffbeb; color: var(--amber); border-color: #fde68a; }
    .tag-err { background: #fef2f2; color: var(--red); border-color: #fecaca; }
    .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-top: 8px; }
    .kpi-box { background: var(--soft); border: 1px solid var(--border); border-radius: 8px; padding: 7px 6px; text-align: center; }
    .kpi-val { font-size: 15px; font-weight: 700; color: var(--blue); }
    .kpi-lbl { font-size: 10px; color: var(--dim); margin-top: 2px; }
    .btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 4px;
      border: 1px solid #bfdbfe; background: #eff6ff; color: var(--blue);
      border-radius: 7px; padding: 6px 8px; font-size: 11px; font-weight: 600; cursor: pointer;
    }
    .btn:hover { background: #dbeafe; }
    .btn-primary { background: var(--blue); color: #ffffff; border-color: var(--blue); }
    .btn-primary:hover { background: #1d4ed8; }
    .btn-green { background: #ecfdf5; border-color: #a7f3d0; color: var(--green); }
    .btn-amber { background: #fffbeb; border-color: #fde68a; color: var(--amber); }
    .btn-sm { padding: 4px 7px; font-size: 10.5px; }
    .btn-block { width: 100%; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
    input, select, textarea {
      width: 100%; padding: 6px 8px; border-radius: 7px; border: 1px solid #cbd5e1;
      font-size: 11px; color: var(--text); background: #fff; font-family: inherit;
    }
    .msg-box {
      font-size: 11px; padding: 7px 9px; border-radius: 8px; background: #eff6ff;
      border: 1px solid #bfdbfe; color: #1e3a8a; line-height: 1.5; margin-bottom: 10px;
    }
    .hidden { display: none !important; }
    .acc-item {
      display: flex; justify-content: space-between; align-items: center; gap: 6px;
      padding: 6px 0; border-bottom: 1px solid #edf2f7; font-size: 11px;
    }
    .acc-item:last-child { border-bottom: none; }
  </style>
</head>
<body>
  <div class="card">
    <div class="row-between">
      <strong style="color:#1e3a8a;font-size:13px">⚡ WorkBuddy 2API</strong>
      <span id="gwBadge" class="tag tag-ok">${mode === 'attached' ? '外部接管' : '内置运行'} :${port}</span>
    </div>
    <div class="row-between" style="margin-top:4px;font-size:10px;color:var(--dim)">
      <span>版本 v${version}</span>
      <a href="#" style="color:var(--blue);text-decoration:none" onclick="loadData(true);return false;">↻ 刷新积分</a>
    </div>
    <div class="kpi-grid">
      <div class="kpi-box"><div class="kpi-val" id="kpiTotal">-</div><div class="kpi-lbl">全池剩余积分</div></div>
      <div class="kpi-box"><div class="kpi-val" id="kpiCn" style="color:var(--green)">-</div><div class="kpi-lbl">CN 健康</div></div>
      <div class="kpi-box"><div class="kpi-val" id="kpiGlobal">-</div><div class="kpi-lbl">Global 健康</div></div>
    </div>
    <div class="grid-2" style="margin-top:8px">
      <button class="btn btn-primary" onclick="runCmd('workbuddy2api.openConsole')">🖥️ 完整控制台</button>
      <button class="btn" onclick="runCmd('workbuddy2api.openBrowser')">🌐 浏览器打开</button>
    </div>
  </div>

  <div id="feedbackBox" class="msg-box hidden"></div>

  <div class="card">
    <div class="row-between" style="margin-bottom:6px">
      <strong style="font-size:12px">优先调度账号 &amp; 授权</strong>
      <span id="poolTotalCnt" style="font-size:10px;color:var(--dim)">0 账号</span>
    </div>
    <select id="activeSel" onchange="switchActive(this.value)" style="margin-bottom:6px"></select>
    <div class="grid-2">
      <button class="btn btn-green btn-sm" onclick="startOAuth('cn')">+ 国内版 OAuth</button>
      <button class="btn btn-sm" onclick="startOAuth('global')">+ 国际版 OAuth</button>
    </div>
    <details style="margin-top:8px">
      <summary style="cursor:pointer;font-size:11px;color:var(--dim)">+ 粘贴 Token 快速入池</summary>
      <div style="margin-top:6px;display:flex;flex-direction:column;gap:5px">
        <select id="sbAddRealm"><option value="global">国际版 (Global / workbuddy.ai)</option><option value="cn">国内版 (CN / codebuddy.cn)</option></select>
        <input id="sbAddNick" placeholder="备注昵称 (可选)" />
        <textarea id="sbAddTok" rows="2" placeholder="粘贴 Refresh Token 或 Access Token"></textarea>
        <button class="btn btn-primary btn-sm" onclick="quickAddToken()">验证并入池</button>
      </div>
    </details>
    <div id="oauthStatusBanner" class="hidden" style="margin-top:6px;font-size:11px;color:var(--amber)">等待网页完成授权...</div>
  </div>

  <div class="card">
    <div style="font-weight:600;font-size:12px;margin-bottom:6px">日常自动化操作</div>
    <div class="grid-2">
      <button class="btn btn-amber btn-sm" onclick="runAction('/checkin',{all:true},'全池每日签到')">📅 全池签到</button>
      <button class="btn btn-green btn-sm" onclick="runAction('/growth/claim-all',{all:true},'全号吃满福利')">🎁 吃满福利</button>
      <button class="btn btn-sm" onclick="runAction('/travel/run-all',{},'全池猫猫巡检')">🐱 猫猫巡检</button>
      <button class="btn btn-sm" onclick="runAction('/school/run',{all:true},'开学季抽奖')">🏫 开学季抽奖</button>
      <button class="btn btn-sm" onclick="runAction('/tasks/run',{all:true},'成长任务收割')">⚡ 成长任务</button>
      <button class="btn btn-sm" onclick="runAction('/accounts/clear-all-cooldowns',{},'清除冷却')">🔓 清除熔断</button>
    </div>
  </div>

  <div class="card">
    <div style="font-weight:600;font-size:12px;margin-bottom:6px">账号明细</div>
    <div id="miniAccountsList" style="max-height:180px;overflow-y:auto">加载中...</div>
  </div>

  <div class="card">
    <div style="font-weight:600;font-size:12px;margin-bottom:6px">本机 API 一键接入 (适用 Cline / Roo / Claude Code)</div>
    <div style="font-size:10.5px;color:var(--dim);margin-bottom:6px;word-break:break-all">
      OpenAI: <code>http://127.0.0.1:${port}/v1</code><br/>
      Anthropic: <code>http://127.0.0.1:${port}</code>
    </div>
    <div class="grid-2">
      <button class="btn btn-sm" onclick="copyCfg('openai')">复制 OpenAI URL</button>
      <button class="btn btn-sm" onclick="copyCfg('claude')">复制 Claude 命令</button>
    </div>
  </div>

  <script>
    const PORT = ${port};
    const API = 'http://127.0.0.1:' + PORT + '/plugins/dsh-workbuddy2api';
    let pollTimer = null;

    function esc(s) {
      return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    function showMsg(txt) {
      const el = document.getElementById('feedbackBox');
      el.textContent = txt;
      el.classList.remove('hidden');
    }

    function runCmd(cmd) {
      if (typeof window.__wb2aCommand === 'function') window.__wb2aCommand(cmd);
    }

    async function apiCall(path, opts = {}) {
      const r = await fetch(API + path, opts);
      return r.json().catch(() => ({}));
    }

    async function loadData(force = false) {
      try {
        const d = await apiCall('/status' + (force ? '?refresh=1' : ''));
        if (!d.ok) return;
        const s = d.summary || {};
        document.getElementById('kpiTotal').textContent = Number(s.all?.remain || 0).toLocaleString();
        document.getElementById('kpiCn').textContent = (s.cn?.healthyCount || 0) + '/' + (s.cn?.count || 0);
        document.getElementById('kpiGlobal').textContent = (s.global?.healthyCount || 0) + '/' + (s.global?.count || 0);

        const accs = d.accounts || [];
        document.getElementById('poolTotalCnt').textContent = accs.length + ' 账号';
        const sel = document.getElementById('activeSel');
        sel.innerHTML = accs.map(a =>
          '<option value="' + esc(a.uid) + '"' + (a.uid === d.activeUid ? ' selected' : '') + '>[' + esc((a.realm||'cn').toUpperCase()) + '] ' + esc(a.nickname || a.uid) + ' (' + Number(a.balance?.remain || 0).toLocaleString() + ' 分)</option>'
        ).join('') || '<option value="">暂无账号，请先授权或粘贴导入</option>';

        document.getElementById('miniAccountsList').innerHTML = accs.map(a => {
          const st = a.manualDisabled ? '手动停用' : a.disabled ? '禁用' : a.coolingDown ? '冷却' : '正常';
          const cls = a.manualDisabled || a.disabled ? 'tag-err' : a.coolingDown ? 'tag-warn' : 'tag-ok';
          return '<div class="acc-item">' +
            '<div><strong>' + esc(a.nickname || a.uid) + '</strong> <span style="color:var(--dim)">(' + esc(a.realm) + ')</span></div>' +
            '<div style="display:flex;gap:4px;align-items:center"><strong style="color:var(--blue)">' + Number(a.balance?.remain || 0).toLocaleString() + '</strong><span class="tag ' + cls + '">' + st + '</span></div>' +
          '</div>';
        }).join('') || '<div style="color:var(--dim);font-size:11px">暂无账号</div>';
      } catch (err) {
        const b = document.getElementById('gwBadge');
        b.textContent = '连接中...';
        b.className = 'tag tag-warn';
      }
    }

    async function switchActive(uid) {
      if (!uid) return;
      await apiCall('/accounts/switch', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid }) });
      showMsg('已切换当前优先账号');
      loadData(false);
    }

    async function quickAddToken() {
      const token = document.getElementById('sbAddTok').value.trim();
      const nickname = document.getElementById('sbAddNick').value.trim();
      const realm = document.getElementById('sbAddRealm').value;
      if (!token) return showMsg('请先粘贴 Access 或 Refresh Token');
      showMsg('正在验证 Token 连通性...');
      const res = await apiCall('/accounts/add', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, realm, nickname }) });
      if (!res.ok) return showMsg('添加失败: ' + (res.error || '未知错误'));
      document.getElementById('sbAddTok').value = '';
      document.getElementById('sbAddNick').value = '';
      showMsg('✅ 已添加账号: ' + (res.account?.account?.nickname || '新账号'));
      loadData(true);
    }

    async function startOAuth(realm) {
      showMsg('正在获取 ' + (realm === 'global' ? '国际版 WorkBuddy' : '国内版 CodeBuddy') + ' 授权链接...');
      const res = await apiCall('/oauth/start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ realm }) });
      if (!res.ok) return showMsg('OAuth 发起失败: ' + (res.error || '未知错误'));
      if (typeof window.__wb2aOpenExternal === 'function') window.__wb2aOpenExternal(res.url);
      const banner = document.getElementById('oauthStatusBanner');
      banner.classList.remove('hidden');
      banner.textContent = '已在浏览器打开授权页，等待完成登录...';
      if (pollTimer) clearInterval(pollTimer);
      pollTimer = setInterval(async () => {
        const p = await apiCall('/oauth/poll', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ realm, state: res.state }) });
        if (p.success) {
          clearInterval(pollTimer); pollTimer = null;
          banner.classList.add('hidden');
          showMsg('✅ OAuth 登录成功: ' + (p.account?.account?.nickname || '新账号'));
          loadData(true);
        }
      }, 2000);
    }

    async function runAction(path, body, title) {
      showMsg('正在执行 ' + title + ' ...');
      const res = await apiCall(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const msg = res.message || (res.results ? (title + '完成，共处理 ' + res.results.length + ' 个账号') : (title + '已完成'));
      showMsg('✅ ' + msg);
      loadData(true);
    }

    function copyCfg(kind) {
      if (kind === 'openai') {
        window.__wb2aCopyText?.('http://127.0.0.1:' + PORT + '/v1', 'OpenAI Base URL');
      } else {
        window.__wb2aCopyText?.('$env:ANTHROPIC_BASE_URL="http://127.0.0.1:' + PORT + '" ; $env:ANTHROPIC_API_KEY="sk-local"', 'Claude Code 环境变量');
      }
    }

    window.addEventListener('wb2a:ext-state', (e) => {
      const st = e.detail || {};
      const b = document.getElementById('gwBadge');
      if (st.port) {
        b.textContent = (st.mode === 'attached' ? '外部接管' : '内置运行') + ' :' + st.port;
        b.className = 'tag tag-ok';
      }
      loadData(false);
    });

    loadData(false);
    setInterval(() => loadData(false), 25000);
  </script>
</body>
</html>`;
}

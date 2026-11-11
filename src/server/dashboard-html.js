/**
 * dashboard-html.js - 独立免外部依赖 Cyberpunk 赛博控制台 HTML 渲染器
 */

export function renderConsoleHtml(opts = {}) {
  const port = opts.port || 7863;

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>WorkBuddy 2API Console — DSH 高可用网关</title>
  <style>
    :root {
      --bg: #050811;
      --bg-card: rgba(13, 19, 36, 0.88);
      --bg-elevated: rgba(20, 29, 54, 0.92);
      --border: rgba(0, 229, 255, 0.22);
      --border-strong: rgba(0, 229, 255, 0.5);
      --cyan: #00e5ff;
      --emerald: #00e676;
      --amber: #ffab40;
      --magenta: #ff2e93;
      --purple: #b388ff;
      --text: #e6f1ff;
      --text-dim: #8b9bb4;
      --radius: 10px;
      --font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", monospace;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      font-family: var(--font);
      background: radial-gradient(circle at 15% 15%, rgba(0,229,255,0.08), transparent 45%),
                  radial-gradient(circle at 85% 20%, rgba(255,46,147,0.07), transparent 40%),
                  var(--bg);
      color: var(--text);
      min-height: 100vh;
    }
    .topbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 24px;
      border-bottom: 1px solid var(--border);
      background: rgba(5, 8, 17, 0.9);
      backdrop-filter: blur(12px);
      position: sticky;
      top: 0;
      z-index: 50;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 700;
      font-size: 16px;
      letter-spacing: 0.5px;
    }
    .brand-badge {
      padding: 3px 8px;
      border-radius: 999px;
      font-size: 11px;
      background: rgba(0, 230, 118, 0.14);
      border: 1px solid rgba(0, 230, 118, 0.4);
      color: var(--emerald);
    }
    .nav {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }
    .nav-btn {
      background: transparent;
      border: 1px solid transparent;
      color: var(--text-dim);
      padding: 7px 14px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
      transition: all 0.18s;
    }
    .nav-btn:hover { color: var(--text); border-color: var(--border); }
    .nav-btn.active {
      background: rgba(0, 229, 255, 0.12);
      border-color: var(--cyan);
      color: var(--cyan);
      box-shadow: 0 0 12px rgba(0, 229, 255, 0.15);
    }
    .container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 20px 24px 60px;
    }
    .grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; margin-bottom: 18px; }
    .grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 16px; margin-bottom: 18px; }
    .card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 16px;
      box-shadow: 0 8px 28px rgba(0, 0, 0, 0.35);
    }
    .card-title {
      font-size: 13px;
      color: var(--text-dim);
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .kpi { font-size: 26px; font-weight: 700; color: var(--cyan); }
    .kpi.green { color: var(--emerald); }
    .kpi.pink { color: var(--magenta); }
    .sub-row { font-size: 12px; color: var(--text-dim); margin-top: 6px; display: flex; gap: 12px; flex-wrap: wrap; }
    .toolbar { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; align-items: center; }
    button.btn {
      background: rgba(0, 229, 255, 0.12);
      border: 1px solid var(--border-strong);
      color: var(--cyan);
      padding: 7px 13px;
      border-radius: 7px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 600;
      transition: all 0.15s;
    }
    button.btn:hover { background: rgba(0, 229, 255, 0.24); transform: translateY(-1px); }
    button.btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
    button.btn-green { background: rgba(0, 230, 118, 0.14); border-color: rgba(0, 230, 118, 0.45); color: var(--emerald); }
    button.btn-green:hover { background: rgba(0, 230, 118, 0.25); }
    button.btn-pink { background: rgba(255, 46, 147, 0.14); border-color: rgba(255, 46, 147, 0.45); color: var(--magenta); }
    button.btn-amber { background: rgba(255, 171, 64, 0.14); border-color: rgba(255, 171, 64, 0.45); color: var(--amber); }
    button.btn-sm { padding: 4px 9px; font-size: 11px; }
    input, select, textarea {
      background: rgba(8, 12, 24, 0.9);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 7px 10px;
      border-radius: 7px;
      font-size: 12px;
      font-family: inherit;
    }
    input:focus, select:focus, textarea:focus { outline: none; border-color: var(--cyan); }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { text-align: left; padding: 10px 8px; border-bottom: 1px solid rgba(139, 155, 180, 0.12); vertical-align: middle; }
    th { color: var(--text-dim); font-weight: 600; }
    .tag {
      display: inline-block;
      padding: 2px 7px;
      border-radius: 5px;
      font-size: 11px;
      font-weight: 600;
    }
    .tag-cn { background: rgba(0, 230, 118, 0.14); color: var(--emerald); border: 1px solid rgba(0, 230, 118, 0.35); }
    .tag-global { background: rgba(179, 136, 255, 0.16); color: var(--purple); border: 1px solid rgba(179, 136, 255, 0.35); }
    .tag-warn { background: rgba(255, 171, 64, 0.16); color: var(--amber); border: 1px solid rgba(255, 171, 64, 0.35); }
    .tag-err { background: rgba(255, 46, 147, 0.16); color: var(--magenta); border: 1px solid rgba(255, 46, 147, 0.35); }
    .hidden { display: none !important; }
    .modal-backdrop {
      position: fixed; inset: 0; background: rgba(2, 4, 10, 0.8); backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center; z-index: 200;
    }
    .modal {
      width: 560px; max-width: 94vw; background: var(--bg-elevated);
      border: 1px solid var(--border-strong); border-radius: 12px; padding: 20px;
    }
    .bar-chart { display: flex; align-items: flex-end; gap: 6px; height: 110px; padding-top: 12px; }
    .bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; height: 100%; justify-content: flex-end; }
    .bar-fill { width: 100%; background: linear-gradient(180deg, var(--cyan), rgba(0,229,255,0.25)); border-radius: 4px 4px 0 0; min-height: 2px; }
    .bar-lbl { font-size: 10px; color: var(--text-dim); }
    .toast {
      position: fixed; bottom: 20px; right: 20px; background: var(--bg-elevated);
      border: 1px solid var(--cyan); padding: 10px 16px; border-radius: 8px;
      font-size: 12px; z-index: 300; box-shadow: 0 8px 24px rgba(0,0,0,0.6);
    }
    pre.code {
      background: #03060e; border: 1px solid rgba(0,229,255,0.18);
      border-radius: 8px; padding: 12px; overflow-x: auto; font-size: 11px; color: #a5f3fc;
    }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .form-field { display: flex; flex-direction: column; gap: 5px; font-size: 12px; }
    .form-field label { color: var(--text-dim); }
  </style>
</head>
<body>
  <div class="topbar">
    <div class="brand">
      <span>⚡ WORKBUDDY 2API</span>
      <span class="brand-badge" id="gatewayBadge">ONLINE :${port}</span>
    </div>
    <div class="nav">
      <button class="nav-btn active" onclick="switchTab('pool')">账号池总览</button>
      <button class="nav-btn" onclick="switchTab('welfare')">猫猫 &amp; 福利 &amp; 邀请</button>
      <button class="nav-btn" onclick="switchTab('tasks')">成长任务</button>
      <button class="nav-btn" onclick="switchTab('models')">模型 &amp; 别名</button>
      <button class="nav-btn" onclick="switchTab('usage')">用量统计</button>
      <button class="nav-btn" onclick="switchTab('settings')">网关设置</button>
    </div>
  </div>

  <div class="container">
    <!-- TAB 1: POOL -->
    <div id="tab-pool">
      <div class="grid-3" id="realmSummaryCards"></div>

      <div class="toolbar">
        <button class="btn btn-green" onclick="startOAuth('cn')">+ 国内版 OAuth 登录</button>
        <button class="btn" onclick="startOAuth('global')">+ 国际版 OAuth 登录</button>
        <button class="btn" onclick="openImportModal()">批量 / ZIP 导入</button>
        <button class="btn" onclick="exportZip()">导出 ZIP 备份</button>
        <button class="btn btn-amber" onclick="refreshAllTokens()">刷新全部 Token</button>
        <button class="btn btn-pink" onclick="clearAllCooldowns()">一键清除熔断</button>
        <button class="btn" onclick="loadStatus(true)">↻ 极速刷新积分</button>
      </div>

      <div class="card">
        <div class="card-title">
          <span>账号池实时调度与健康看板</span>
          <span id="poolCountInfo"></span>
        </div>
        <div style="overflow-x:auto">
          <table>
            <thead>
              <tr>
                <th>账号</th>
                <th>区服</th>
                <th>实时积分</th>
                <th>包构成</th>
                <th>运行状态</th>
                <th>并发</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody id="accountsTbody"></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 2: WELFARE & TRAVEL & INVITE -->
    <div id="tab-welfare" class="hidden">
      <div class="toolbar">
        <select id="welfareUidSelect" onchange="loadWelfareAndInvite()"></select>
        <button class="btn btn-green" onclick="batchClaimAll()">全号一键吃满福利</button>
        <button class="btn" onclick="batchRunTravel()">全号巡检猫猫旅行</button>
        <button class="btn btn-amber" onclick="singleCheckin()">当前号每日签到</button>
        <button class="btn" onclick="drawLottery()">连登抽奖</button>
      </div>
      <div class="grid-2">
        <div class="card">
          <div class="card-title"><span>🐱 猫猫旅行管家</span><button class="btn btn-sm" onclick="departTravel()">派出旅行</button></div>
          <div id="travelBox" class="sub-row">选择国内版账号查看猫猫状态...</div>
        </div>
        <div class="card">
          <div class="card-title"><span>🎁 专属邀请与受邀绑定</span><button class="btn btn-sm" onclick="loadWelfareAndInvite()">刷新</button></div>
          <div id="inviteBox" class="sub-row" style="margin-bottom:10px">加载中...</div>
          <div style="display:flex;gap:8px;margin-top:8px">
            <input id="bindInviteInput" placeholder="输入推荐人邀请码绑定领积分" style="flex:1" />
            <button class="btn btn-green btn-sm" onclick="bindInvite()">立即绑定</button>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-title"><span>连登活动 &amp; 最近执行日志</span></div>
        <pre class="code" id="welfareLog">等待操作...</pre>
      </div>
    </div>

    <!-- TAB 3: GROWTH TASKS -->
    <div id="tab-tasks" class="hidden">
      <div class="toolbar">
        <select id="tasksUidSelect" onchange="loadTasks()"></select>
        <button class="btn btn-green" onclick="runTasks(false)">一键全自动点亮并收割</button>
        <button class="btn btn-amber" onclick="runTasks(true)">全量国内号一键自动化任务</button>
        <button class="btn" onclick="loadTasks()">↻ 刷新任务列表</button>
      </div>
      <div class="card">
        <div class="card-title"><span>全自动成长积分任务清单 (18+ 项)</span><span id="tasksSummary"></span></div>
        <div id="tasksList"></div>
      </div>
    </div>

    <!-- TAB 4: MODELS -->
    <div id="tab-models" class="hidden">
      <div class="toolbar">
        <button class="btn btn-green" onclick="discoverModels()">🔍 从上游动态发现最新模型</button>
        <button class="btn" onclick="saveModelsConfig()">💾 保存启用过滤与别名</button>
        <input id="modelSearch" placeholder="过滤模型 ID..." oninput="renderModelsTable()" />
      </div>
      <div class="grid-2">
        <div class="card">
          <div class="card-title"><span>模型目录（空勾选表示全部放行）</span><span id="modelCountLabel"></span></div>
          <div style="max-height:480px;overflow:auto">
            <table>
              <thead><tr><th>启用</th><th>模型 ID</th><th>区服</th><th>费率</th><th>上下文</th></tr></thead>
              <tbody id="modelsTbody"></tbody>
            </table>
          </div>
        </div>
        <div class="card">
          <div class="card-title"><span>模型别名映射 (JSON) &amp; auto-free 路由</span></div>
          <div class="form-field" style="margin-bottom:10px">
            <label>auto-free 优先候选 (逗号分隔):</label>
            <input id="freeModelsInput" />
          </div>
          <div class="form-field">
            <label>模型别名表 JSON (例: { "gpt-4o": "global:gpt-6-astra" }):</label>
            <textarea id="aliasesTextarea" rows="16"></textarea>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 5: USAGE -->
    <div id="tab-usage" class="hidden">
      <div class="toolbar">
        <button class="btn" onclick="loadUsage()">↻ 刷新用量</button>
        <button class="btn btn-pink" onclick="resetUsage()">清空本地用量账本</button>
      </div>
      <div class="grid-3" id="usageSummaryCards"></div>
      <div class="grid-2">
        <div class="card">
          <div class="card-title"><span>近 7 天请求与 Token 走势</span></div>
          <div class="bar-chart" id="chart7d"></div>
        </div>
        <div class="card">
          <div class="card-title"><span>今日 24 小时热度分布</span></div>
          <div class="bar-chart" id="chart24h"></div>
        </div>
      </div>
    </div>

    <!-- TAB 6: SETTINGS -->
    <div id="tab-settings" class="hidden">
      <div class="card" style="margin-bottom:16px">
        <div class="card-title"><span>网关运行参数与自动化策略 (持久化至 $DSH_HOME/.workbuddy2api-config.json)</span></div>
        <div class="form-grid">
          <div class="form-field">
            <label>网关鉴权 API Key (留空不校验):</label>
            <input id="cfgApiKey" placeholder="sk-..." />
          </div>
          <div class="form-field">
            <label>HTTP 代理 (如 http://127.0.0.1:7890):</label>
            <input id="cfgProxy" placeholder="留空直连" />
          </div>
          <div class="form-field">
            <label>国内版 CN 单号最大并发:</label>
            <input id="cfgMaxCN" type="number" min="1" max="20" />
          </div>
          <div class="form-field">
            <label>国际版 Global 单号最大并发:</label>
            <input id="cfgMaxGlobal" type="number" min="1" max="20" />
          </div>
          <div class="form-field">
            <label>并发排队等待超时 (ms):</label>
            <input id="cfgQueueTimeout" type="number" min="0" max="60000" />
          </div>
          <div class="form-field">
            <label>System Prompt 注入模式:</label>
            <select id="cfgPromptMode">
              <option value="none">关闭 (保持原样)</option>
              <option value="append">追加到末尾 (append)</option>
              <option value="replace">全局替换 (replace)</option>
            </select>
          </div>
        </div>
        <div class="form-field" style="margin-top:12px">
          <label>System Prompt 自定义文本:</label>
          <textarea id="cfgPromptText" rows="3"></textarea>
        </div>
        <div class="toolbar" style="margin-top:12px;margin-bottom:0">
          <label><input type="checkbox" id="cfgAutoCheckin" /> 启动自动福利/签到</label>
          <label><input type="checkbox" id="cfgAutoTravel" /> 启动自动猫猫旅行</label>
          <label><input type="checkbox" id="cfgAutoRefresh" /> 5分钟自动 Token 保活</label>
          <button class="btn btn-green" style="margin-left:auto" onclick="saveConfig()">💾 保存配置立即生效</button>
        </div>
      </div>

      <div class="card">
        <div class="card-title"><span>多协议端点接入指南</span></div>
        <pre class="code" id="guideCode"></pre>
      </div>
    </div>
  </div>

  <!-- IMPORT MODAL -->
  <div id="importModal" class="modal-backdrop hidden">
    <div class="modal">
      <div class="card-title"><span>批量导入账号 (支持 ZIP 压缩包 / JSON 数组 / 包装对象 / token----refreshToken 卡密)</span><button class="btn btn-sm btn-pink" onclick="closeImportModal()">关闭</button></div>
      <div class="form-field" style="margin-bottom:10px">
        <label>默认区服（无明确标记时生效）:</label>
        <select id="importRealm">
          <option value="global">国际版 (Global / workbuddy.ai)</option>
          <option value="cn">国内版 (CN / codebuddy.cn)</option>
        </select>
      </div>
      <div class="form-field" style="margin-bottom:10px">
        <label>上传 .zip / .json / .txt 文件:</label>
        <input type="file" id="importFileInput" accept=".zip,.json,.txt,.info" />
      </div>
      <div class="form-field" style="margin-bottom:12px">
        <label>或直接粘贴内容（支持 # / // 注释行）:</label>
        <textarea id="importTextarea" rows="8" placeholder="支持格式:&#10;access_token----refresh_token&#10;[ { &quot;auth&quot;: { &quot;accessToken&quot;: &quot;...&quot;, &quot;refreshToken&quot;: &quot;...&quot;, &quot;realm&quot;: &quot;global&quot; } } ]"></textarea>
      </div>
      <div style="display:flex;justify-content:flex-end;gap:8px">
        <button class="btn btn-green" onclick="submitImport()">🚀 验证连通并导入</button>
      </div>
      <pre class="code hidden" id="importResultBox" style="margin-top:10px"></pre>
    </div>
  </div>

  <!-- OAUTH MODAL -->
  <div id="oauthModal" class="modal-backdrop hidden">
    <div class="modal">
      <div class="card-title"><span id="oauthTitle">OAuth 授权登录</span><button class="btn btn-sm btn-pink" onclick="closeOAuthModal()">取消</button></div>
      <p style="font-size:12px;color:var(--text-dim)">请在新打开的浏览器窗口完成登录授权，控制台正在自动轮询回调...</p>
      <div style="margin:10px 0"><a id="oauthLink" href="#" target="_blank" style="color:var(--cyan);word-break:break-all;font-size:12px"></a></div>
      <div id="oauthStatusText" class="tag tag-warn">等待用户完成网页授权...</div>
    </div>
  </div>

  <div id="toast" class="toast hidden"></div>

  <script>
    const API = '/plugins/dsh-workbuddy2api';
    let state = { accounts: [], activeUid: null, summary: {}, models: [], aliases: {}, enabledModels: [], freeModels: [], config: {} };
    let oauthPollTimer = null;

    function toast(msg) {
      const el = document.getElementById('toast');
      el.textContent = msg;
      el.classList.remove('hidden');
      setTimeout(() => el.classList.add('hidden'), 3500);
    }

    async function api(path, opts = {}) {
      const res = await fetch(API + path, opts);
      return await res.json();
    }

    function switchTab(tab) {
      const tabs = ['pool', 'welfare', 'tasks', 'models', 'usage', 'settings'];
      tabs.forEach((t, idx) => {
        document.getElementById('tab-' + t).classList.toggle('hidden', t !== tab);
        document.querySelectorAll('.nav-btn')[idx].classList.toggle('active', t === tab);
      });
      if (tab === 'welfare') loadWelfareAndInvite();
      if (tab === 'tasks') loadTasks();
      if (tab === 'models') loadModels();
      if (tab === 'usage') loadUsage();
      if (tab === 'settings') renderSettings();
    }

    async function loadStatus(refresh = false) {
      try {
        const data = await api('/status' + (refresh ? '?refresh=1' : ''));
        if (!data.ok) return;
        state.accounts = data.accounts || [];
        state.activeUid = data.activeUid;
        state.summary = data.summary || {};
        state.aliases = data.aliases || {};
        state.enabledModels = data.enabledModels || [];
        state.config = data.config || {};
        document.getElementById('gatewayBadge').textContent = 'ONLINE :' + (data.gatewayPort || ${port});
        renderSummary();
        renderAccounts();
        syncUidSelectors();
        renderSettings();
      } catch (e) {
        toast('加载状态失败: ' + e.message);
      }
    }

    function renderSummary() {
      const s = state.summary || {};
      const all = s.all || { remain: 0, total: 0, count: 0, enabledCount: 0, baseRemain: 0, bonusRemain: 0, purchasedRemain: 0, expiringRemain: 0 };
      const cn = s.cn || { remain: 0, total: 0, count: 0, enabledCount: 0 };
      const gl = s.global || { remain: 0, total: 0, count: 0, enabledCount: 0 };

      document.getElementById('realmSummaryCards').innerHTML = [
        { title: '全池合计 (All)', kpi: all.remain, sub: '可用账号 ' + all.enabledCount + '/' + all.count + ' | 基础 ' + (all.baseRemain||0) + ' · 赠送 ' + (all.bonusRemain||0) + ' · 充值 ' + (all.purchasedRemain||0), cls: '' },
        { title: '国内版 (CodeBuddy CN)', kpi: cn.remain, sub: '启用 ' + cn.enabledCount + '/' + cn.count + ' | 总额 ' + (cn.total||0), cls: 'green' },
        { title: '国际版 (WorkBuddy AI)', kpi: gl.remain, sub: '启用 ' + gl.enabledCount + '/' + gl.count + ' | 7日到期 ' + (gl.expiringRemain||0), cls: 'pink' }
      ].map(c => '<div class="card"><div class="card-title"><span>' + c.title + '</span></div><div class="kpi ' + c.cls + '">' + Number(c.kpi||0).toLocaleString() + '</div><div class="sub-row">' + c.sub + '</div></div>').join('');
    }

    function renderAccounts() {
      const tbody = document.getElementById('accountsTbody');
      document.getElementById('poolCountInfo').textContent = '共 ' + state.accounts.length + ' 个账号';
      tbody.innerHTML = state.accounts.map(acc => {
        const b = acc.balance || {};
        const d = acc.diagnostics || {};
        const isAct = acc.uid === state.activeUid;
        const realmTag = acc.realm === 'global' ? '<span class="tag tag-global">GLOBAL</span>' : '<span class="tag tag-cn">CN</span>';
        let healthTag = '<span class="tag tag-cn">健康</span>';
        if (acc.disabled) healthTag = '<span class="tag tag-err">已停用</span>';
        else if (d.coolingDown) healthTag = '<span class="tag tag-warn">冷却 ' + (d.cooldownRemainingSec||0) + 's</span>';
        else if (d.modelCooldowns && d.modelCooldowns.length > 0) healthTag = '<span class="tag tag-warn">' + d.modelCooldowns.length + '模型限流</span>';

        const pkgText = '基:' + (b.baseRemain||0) + ' 赠:' + (b.bonusRemain||0) + ' 购:' + (b.purchasedRemain||0);
        return '<tr>' +
          '<td><strong>' + escapeHtml(acc.nickname || acc.uid) + '</strong>' + (isAct ? ' <span class="tag tag-cn">优先</span>' : '') + '<br><span style="color:var(--text-dim);font-size:11px">' + escapeHtml(acc.uid) + '</span></td>' +
          '<td>' + realmTag + '</td>' +
          '<td style="font-weight:700;color:var(--cyan)">' + Number(b.remain || 0).toLocaleString() + '<br><span style="color:var(--text-dim);font-size:10px">/ ' + Number(b.total || 0).toLocaleString() + '</span></td>' +
          '<td style="font-size:11px;color:var(--text-dim)">' + pkgText + '<br>活跃包: ' + (b.activePackCount||0) + '</td>' +
          '<td>' + healthTag + '<br><span style="font-size:10px;color:var(--text-dim)">成功:' + (d.stats?.successCount||0) + ' 失败:' + (d.stats?.failCount||0) + '</span></td>' +
          '<td>' + (acc.inFlight || 0) + ' / ' + (d.limit || 3) + '</td>' +
          '<td style="display:flex;gap:4px;flex-wrap:wrap">' +
            (isAct ? '' : '<button class="btn btn-sm" onclick="switchAcc(\\'' + acc.uid + '\\')">优先</button>') +
            '<button class="btn btn-sm" onclick="adminAction(\\'' + acc.uid + '\\', \\'refresh\\')">刷新</button>' +
            (acc.disabled
              ? '<button class="btn btn-sm btn-green" onclick="adminAction(\\'' + acc.uid + '\\', \\'enable\\')">启用</button>'
              : '<button class="btn btn-sm btn-pink" onclick="adminAction(\\'' + acc.uid + '\\', \\'disable\\')">停用</button>') +
            ((d.coolingDown || (d.modelCooldowns && d.modelCooldowns.length))
              ? '<button class="btn btn-sm btn-amber" onclick="adminAction(\\'' + acc.uid + '\\', \\'revive\\')">解除熔断</button>' : '') +
            (acc.realm === 'global'
              ? '<button class="btn btn-sm btn-green" onclick="adminAction(\\'' + acc.uid + '\\', \\'trial\\')">领Trial</button>' : '') +
            '<button class="btn btn-sm btn-pink" onclick="deleteAcc(\\'' + acc.uid + '\\')">删</button>' +
          '</td>' +
        '</tr>';
      }).join('');
    }

    function escapeHtml(s) {
      return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    function syncUidSelectors() {
      const opts = state.accounts.map(a => '<option value="' + a.uid + '" ' + (a.uid === state.activeUid ? 'selected' : '') + '>[' + a.realm.toUpperCase() + '] ' + escapeHtml(a.nickname) + '</option>').join('');
      const wSel = document.getElementById('welfareUidSelect');
      const tSel = document.getElementById('tasksUidSelect');
      const prevW = wSel.value;
      const prevT = tSel.value;
      wSel.innerHTML = opts;
      tSel.innerHTML = opts;
      if (prevW) wSel.value = prevW;
      if (prevT) tSel.value = prevT;
    }

    async function switchAcc(uid) {
      await api('/accounts/switch', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid }) });
      toast('已切换优先账号');
      loadStatus();
    }

    async function deleteAcc(uid) {
      if (!confirm('确认从账号池删除 ' + uid + ' 吗？')) return;
      await api('/accounts/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid }) });
      toast('账号已删除');
      loadStatus();
    }

    async function adminAction(uid, action) {
      toast('正在执行 ' + action + ' ...');
      const res = await api('/accounts/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, action })
      });
      toast(res.message || (res.ok ? '操作成功' : res.error || '操作失败'));
      loadStatus();
    }

    async function refreshAllTokens() {
      toast('正在批量刷新 Token 与积分...');
      const res = await api('/accounts/refresh-all', { method: 'POST' });
      toast('刷新完成: 成功 ' + res.refreshed + ', 失败 ' + res.failed);
      loadStatus(true);
    }

    async function clearAllCooldowns() {
      const res = await api('/accounts/clear-all-cooldowns', { method: 'POST' });
      toast('已清除所有熔断 (' + (res.cleared || 0) + ')');
      loadStatus();
    }

    async function startOAuth(realm) {
      try {
        const res = await api('/oauth/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ realm })
        });
        if (!res.ok) throw new Error(res.error);
        document.getElementById('oauthTitle').textContent = (realm === 'global' ? '国际版 WorkBuddy AI' : '国内版 CodeBuddy') + ' OAuth 登录';
        document.getElementById('oauthLink').href = res.url;
        document.getElementById('oauthLink').textContent = res.url;
        document.getElementById('oauthStatusText').textContent = '等待浏览器授权中...';
        document.getElementById('oauthModal').classList.remove('hidden');
        window.open(res.url, '_blank');

        if (oauthPollTimer) clearInterval(oauthPollTimer);
        oauthPollTimer = setInterval(async () => {
          const poll = await api('/oauth/poll', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ realm, state: res.state })
          });
          if (poll.success) {
            clearInterval(oauthPollTimer);
            oauthPollTimer = null;
            document.getElementById('oauthModal').classList.add('hidden');
            toast('OAuth 登录成功：' + (poll.account?.account?.nickname || '新账号'));
            loadStatus(true);
          }
        }, 2000);
      } catch (e) {
        toast('发起 OAuth 失败: ' + e.message);
      }
    }

    function closeOAuthModal() {
      if (oauthPollTimer) clearInterval(oauthPollTimer);
      oauthPollTimer = null;
      document.getElementById('oauthModal').classList.add('hidden');
    }

    function openImportModal() {
      document.getElementById('importResultBox').classList.add('hidden');
      document.getElementById('importModal').classList.remove('hidden');
    }
    function closeImportModal() {
      document.getElementById('importModal').classList.add('hidden');
    }

    async function submitImport() {
      const realm = document.getElementById('importRealm').value;
      const fileEl = document.getElementById('importFileInput');
      const textVal = document.getElementById('importTextarea').value;
      let payload = { defaultRealm: realm, content: textVal };

      if (fileEl.files && fileEl.files[0]) {
        const buf = await fileEl.files[0].arrayBuffer();
        const bytes = new Uint8Array(buf);
        let bin = '';
        for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
        payload = { defaultRealm: realm, base64Zip: btoa(bin) };
      }

      toast('正在校验凭证并导入...');
      const res = await api('/accounts/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const box = document.getElementById('importResultBox');
      box.textContent = JSON.stringify(res, null, 2);
      box.classList.remove('hidden');
      toast('导入完成: 新增 ' + res.imported + ' / 更新 ' + res.updated + ' / 失败 ' + res.failed);
      loadStatus(true);
    }

    function exportZip() {
      window.location.href = API + '/accounts/export.zip';
    }

    async function loadWelfareAndInvite() {
      const uid = document.getElementById('welfareUidSelect').value || state.activeUid;
      if (!uid) return;
      try {
        const [tr, gr, inv] = await Promise.all([
          api('/travel/status?uid=' + encodeURIComponent(uid)),
          api('/growth/status?uid=' + encodeURIComponent(uid)),
          api('/invite/info?uid=' + encodeURIComponent(uid))
        ]);
        document.getElementById('travelBox').textContent = tr.ok
          ? '猫猫: ' + (tr.buddy?.name || '未领养') + ' | 状态: ' + (tr.travel?.state || '未知') + ' | 奖励: ' + (tr.travel?.reward_credit || 0)
          : (tr.message || '仅国内版支持猫猫旅行');
        document.getElementById('inviteBox').innerHTML = inv.ok
          ? '我的邀请码: <strong style="color:var(--cyan)">' + escapeHtml(inv.info.inviteCode || '暂未分配') + '</strong> | 链接: ' +
            (inv.info.inviteUrl ? '<a style="color:var(--emerald)" target="_blank" href="' + inv.info.inviteUrl + '">' + escapeHtml(inv.info.inviteUrl) + '</a>' : '-') +
            ' | 已邀 ' + inv.info.invitedCount + ' 人 (有效 ' + (inv.info.validInviteCount || 0) + ') · 累计奖 ' + (inv.info.rewardCredit || 0) + ' 积分'
          : '无法获取邀请信息';
        document.getElementById('welfareLog').textContent = JSON.stringify({ streak: gr.streak, chances: gr.chances }, null, 2);
      } catch (e) {}
    }

    async function departTravel() {
      const uid = document.getElementById('welfareUidSelect').value || state.activeUid;
      const res = await api('/travel/depart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid }) });
      document.getElementById('welfareLog').textContent = JSON.stringify(res, null, 2);
      loadWelfareAndInvite();
    }

    async function batchRunTravel() {
      toast('正在巡检全量国内账号猫猫旅行...');
      const res = await api('/travel/run-all', { method: 'POST' });
      document.getElementById('welfareLog').textContent = JSON.stringify(res, null, 2);
      toast('巡检完成');
      loadStatus(true);
    }

    async function batchClaimAll() {
      toast('正在全号收割全套福利（签到+活跃+礼包+补偿+猫猫+抽奖）...');
      const res = await api('/growth/claim-all', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ all: true }) });
      document.getElementById('welfareLog').textContent = JSON.stringify(res, null, 2);
      toast('全号福利收割完成');
      loadStatus(true);
    }

    async function singleCheckin() {
      const uid = document.getElementById('welfareUidSelect').value || state.activeUid;
      const res = await api('/checkin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid }) });
      document.getElementById('welfareLog').textContent = JSON.stringify(res, null, 2);
      toast(res.message || '签到执行完成');
      loadStatus(true);
    }

    async function drawLottery() {
      const uid = document.getElementById('welfareUidSelect').value || state.activeUid;
      const res = await api('/growth/lottery/draw', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid }) });
      document.getElementById('welfareLog').textContent = JSON.stringify(res, null, 2);
      loadWelfareAndInvite();
    }

    async function bindInvite() {
      const uid = document.getElementById('welfareUidSelect').value || state.activeUid;
      const inviteCode = document.getElementById('bindInviteInput').value.trim();
      const res = await api('/invite/bind', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid, inviteCode }) });
      toast(res.message || '绑定完成');
      document.getElementById('welfareLog').textContent = JSON.stringify(res, null, 2);
    }

    async function loadTasks() {
      const uid = document.getElementById('tasksUidSelect').value || state.activeUid;
      if (!uid) return;
      const res = await api('/tasks/list?uid=' + encodeURIComponent(uid));
      const listEl = document.getElementById('tasksList');
      if (!res.ok) {
        listEl.innerHTML = '<div style="color:var(--magenta)">' + escapeHtml(res.message || '加载失败') + '</div>';
        return;
      }
      const items = res.tasks || [];
      document.getElementById('tasksSummary').textContent = '共 ' + items.length + ' 项任务';
      listEl.innerHTML = items.map(t =>
        '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);font-size:12px">' +
          '<div><strong>' + escapeHtml(t.name || t.title || t.code) + '</strong> <span style="color:var(--text-dim)">(' + escapeHtml(t.code || '') + ')</span></div>' +
          '<div><span class="tag ' + (t.claimed ? 'tag-cn' : t.completed ? 'tag-warn' : 'tag-err') + '">' + (t.claimed ? '已领奖' : t.completed ? '待领取' : '待触发') + '</span></div>' +
        '</div>'
      ).join('') || '<div class="sub-row">当前账号暂无可查询成长任务</div>';
    }

    async function runTasks(all) {
      const uid = document.getElementById('tasksUidSelect').value || state.activeUid;
      toast(all ? '正在全量国内号自动跑成长任务...' : '正在全自动点亮并收割任务...');
      const res = await api('/tasks/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, all })
      });
      toast('成长任务自动收割完成');
      loadTasks();
      loadStatus(true);
    }

    async function loadModels() {
      const res = await api('/models');
      if (!res.ok) return;
      state.models = res.models || [];
      state.enabledModels = res.enabledModels || [];
      state.aliases = res.aliases || {};
      state.freeModels = res.freeModels || [];
      document.getElementById('freeModelsInput').value = state.freeModels.join(', ');
      document.getElementById('aliasesTextarea').value = JSON.stringify(state.aliases, null, 2);
      renderModelsTable();
    }

    function renderModelsTable() {
      const q = (document.getElementById('modelSearch').value || '').toLowerCase();
      const enabledSet = new Set(state.enabledModels);
      const filtered = state.models.filter(m => !q || m.id.toLowerCase().includes(q));
      document.getElementById('modelCountLabel').textContent = '共 ' + filtered.length + ' 个模型';
      document.getElementById('modelsTbody').innerHTML = filtered.map(m =>
        '<tr>' +
          '<td><input type="checkbox" class="model-chk" value="' + escapeHtml(m.id) + '" ' + (enabledSet.has(m.id) ? 'checked' : '') + ' /></td>' +
          '<td><strong>' + escapeHtml(m.id) + '</strong>' + (m.source === 'discovered' ? ' <span class="tag tag-global">动态</span>' : '') + '</td>' +
          '<td>' + escapeHtml(m.realm) + '</td>' +
          '<td>' + escapeHtml(m.rate || '-') + '</td>' +
          '<td>' + Math.round((m.contextWindow || 0) / 1000) + 'k</td>' +
        '</tr>'
      ).join('');
    }

    async function discoverModels() {
      toast('正在向上游发现最新可用模型...');
      const res = await api('/models/discover', { method: 'POST' });
      toast('模型目录同步完成，总计 ' + (res.models?.length || 0) + ' 个模型');
      loadModels();
    }

    async function saveModelsConfig() {
      const enabledModels = Array.from(document.querySelectorAll('.model-chk:checked')).map(el => el.value);
      const freeModels = document.getElementById('freeModelsInput').value.split(',').map(s => s.trim()).filter(Boolean);
      let aliases = state.aliases;
      try {
        aliases = JSON.parse(document.getElementById('aliasesTextarea').value);
      } catch (e) {
        toast('别名 JSON 格式有误: ' + e.message);
        return;
      }
      await api('/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabledModels, aliases, freeModels })
      });
      toast('模型过滤与别名规则已保存');
      loadModels();
    }

    async function loadUsage() {
      const res = await api('/usage');
      if (!res.ok) return;
      const st = res.stats;
      document.getElementById('usageSummaryCards').innerHTML = [
        { title: '今日请求 / 总请求', kpi: st.today.requests + ' / ' + st.summary.totalRequests, cls: '' },
        { title: '今日输入 Tokens', kpi: st.today.inputTokens.toLocaleString(), cls: 'green' },
        { title: '今日输出 Tokens', kpi: st.today.outputTokens.toLocaleString(), cls: 'pink' }
      ].map(c => '<div class="card"><div class="card-title"><span>' + c.title + '</span></div><div class="kpi ' + c.cls + '">' + c.kpi + '</div></div>').join('');

      const max7 = Math.max(1, ...st.trend7d.map(d => d.tokens));
      document.getElementById('chart7d').innerHTML = st.trend7d.map(d =>
        '<div class="bar-col" title="' + d.date + ': ' + d.tokens + ' tokens (' + d.requests + ' reqs)"><div class="bar-fill" style="height:' + Math.max(4, Math.round(d.tokens / max7 * 90)) + '%"></div><div class="bar-lbl">' + d.date + '</div></div>'
      ).join('');

      const max24 = Math.max(1, ...st.hourly.map(h => h.tokens));
      document.getElementById('chart24h').innerHTML = st.hourly.map(h =>
        '<div class="bar-col" title="' + h.hour + ': ' + h.tokens + ' tokens"><div class="bar-fill" style="height:' + Math.max(3, Math.round(h.tokens / max24 * 90)) + '%"></div><div class="bar-lbl">' + h.hour.replace('时','') + '</div></div>'
      ).join('');
    }

    async function resetUsage() {
      if (!confirm('确认清空全部本地统计用量账本吗？')) return;
      await api('/stats/reset', { method: 'POST' });
      toast('用量账本已清空');
      loadUsage();
    }

    function renderSettings() {
      const c = state.config || {};
      document.getElementById('cfgApiKey').value = c.apiKey || '';
      document.getElementById('cfgProxy').value = c.proxy || '';
      document.getElementById('cfgMaxCN').value = c.maxInFlightCN || 3;
      document.getElementById('cfgMaxGlobal').value = c.maxInFlightGlobal || 2;
      document.getElementById('cfgQueueTimeout').value = c.queueTimeoutMs ?? 5000;
      document.getElementById('cfgPromptMode').value = c.promptMode || 'none';
      document.getElementById('cfgPromptText').value = c.promptText || '';
      document.getElementById('cfgAutoCheckin').checked = c.autoCheckin !== false;
      document.getElementById('cfgAutoTravel').checked = c.autoTravel !== false;
      document.getElementById('cfgAutoRefresh').checked = c.autoRefreshToken !== false;

      const base = window.location.origin;
      document.getElementById('guideCode').textContent =
        '# OpenAI Chat Completions (Cursor / Cherry Studio / DSH / OpenCode)\\n' +
        'Base URL : ' + base + '/v1\\n' +
        'Chat URL : ' + base + '/v1/chat/completions\\n' +
        'Models   : ' + base + '/v1/models\\n\\n' +
        '# Anthropic Messages (Claude Code / Cline)\\n' +
        'ANTHROPIC_BASE_URL=' + base + '\\n' +
        'Messages : ' + base + '/v1/messages\\n\\n' +
        '# OpenAI Responses API & Video Generation\\n' +
        'Responses: ' + base + '/v1/responses\\n' +
        'Videos   : ' + base + '/v1/videos/generations';
    }

    async function saveConfig() {
      const payload = {
        apiKey: document.getElementById('cfgApiKey').value.trim(),
        proxy: document.getElementById('cfgProxy').value.trim(),
        maxInFlightCN: Number(document.getElementById('cfgMaxCN').value) || 3,
        maxInFlightGlobal: Number(document.getElementById('cfgMaxGlobal').value) || 2,
        queueTimeoutMs: Number(document.getElementById('cfgQueueTimeout').value) || 0,
        promptMode: document.getElementById('cfgPromptMode').value,
        promptText: document.getElementById('cfgPromptText').value,
        autoCheckin: document.getElementById('cfgAutoCheckin').checked,
        autoTravel: document.getElementById('cfgAutoTravel').checked,
        autoRefreshToken: document.getElementById('cfgAutoRefresh').checked
      };
      const res = await api('/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      state.config = res.config || payload;
      toast('网关配置已保存并即时生效');
    }

    loadStatus(false);
    setInterval(() => loadStatus(false), 30000);
  </script>
</body>
</html>`;
}

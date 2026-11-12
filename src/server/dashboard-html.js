/**
 * dashboard-html.js - 白蓝清爽版独立管控台与公开展示门户渲染器
 */

import { SERVICE_VERSION, GITHUB_REPO } from '../constants.js';

const SHARED_CSS = `
  :root {
    --bg: #f4f7fb;
    --bg-card: #ffffff;
    --bg-soft: #f8fafc;
    --border: #dbe5f1;
    --border-strong: #93c5fd;
    --cyan: #2563eb;
    --cyan-dark: #1d4ed8;
    --emerald: #059669;
    --amber: #d97706;
    --magenta: #dc2626;
    --text: #0f172a;
    --text-dim: #64748b;
    --radius: 12px;
    --font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; padding: 0; font-family: var(--font);
    background: radial-gradient(circle at 10% 10%, rgba(37,99,235,0.06), transparent 42%),
                radial-gradient(circle at 90% 15%, rgba(14,165,233,0.05), transparent 40%), var(--bg);
    color: var(--text); min-height: 100vh;
  }
  .topbar {
    display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;
    padding: 12px 24px; border-bottom: 1px solid var(--border);
    background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(12px);
    position: sticky; top: 0; z-index: 50; box-shadow: 0 2px 10px rgba(15, 23, 42, 0.04);
  }
  .brand { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 16px; color: #1e3a8a; }
  .brand-badge {
    padding: 3px 9px; border-radius: 999px; font-size: 11px;
    background: #eff6ff; border: 1px solid #bfdbfe; color: #2563eb; font-weight: 600;
  }
  .nav { display: flex; gap: 5px; flex-wrap: wrap; align-items: center; }
  .nav-btn {
    background: transparent; border: 1px solid transparent; color: #475569;
    padding: 7px 12px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.16s;
  }
  .nav-btn:hover { color: #2563eb; background: #f1f5f9; }
  .nav-btn.active {
    background: #eff6ff; border-color: #93c5fd; color: #2563eb; font-weight: 600;
    box-shadow: 0 1px 4px rgba(37, 99, 235, 0.1);
  }
  .container { max-width: 1300px; margin: 0 auto; padding: 20px 24px 64px; }
  .grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; margin-bottom: 18px; }
  .grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 16px; margin-bottom: 18px; }
  .card {
    background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
    padding: 18px; box-shadow: 0 4px 16px rgba(15, 35, 75, 0.05); margin-bottom: 16px;
  }
  .card-title {
    font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 10px;
    display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap;
  }
  .kpi { font-size: 28px; font-weight: 700; color: #2563eb; }
  .kpi.green { color: #059669; }
  .kpi.pink { color: #0284c7; }
  .sub-row { font-size: 12px; color: var(--text-dim); margin-top: 6px; display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
  .toolbar { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; align-items: center; }
  button.btn, a.btn {
    display: inline-flex; align-items: center; gap: 4px; text-decoration: none;
    background: #eff6ff; border: 1px solid #bfdbfe; color: #2563eb;
    padding: 7px 13px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.15s;
  }
  button.btn:hover, a.btn:hover { background: #dbeafe; border-color: #93c5fd; transform: translateY(-1px); }
  button.btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
  button.btn-green { background: #ecfdf5; border-color: #a7f3d0; color: #059669; }
  button.btn-green:hover { background: #d1fae5; }
  button.btn-pink { background: #fef2f2; border-color: #fecaca; color: #dc2626; }
  button.btn-pink:hover { background: #fee2e2; }
  button.btn-amber { background: #fffbeb; border-color: #fde68a; color: #d97706; }
  button.btn-amber:hover { background: #fef3c7; }
  button.btn-sm, a.btn-sm { padding: 4px 9px; font-size: 11px; }
  input, select, textarea {
    background: #ffffff; border: 1px solid #cbd5e1; color: var(--text);
    padding: 7px 10px; border-radius: 8px; font-size: 12px; font-family: inherit;
  }
  input:focus, select:focus, textarea:focus {
    outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
  }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th, td { text-align: left; padding: 10px 8px; border-bottom: 1px solid #edf2f7; vertical-align: middle; }
  th { color: #64748b; font-weight: 600; background: #f8fafc; }
  .tag { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; }
  .tag-cn { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
  .tag-global { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }
  .tag-warn { background: #fffbeb; color: #d97706; border: 1px solid #fde68a; }
  .tag-err { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
  .hidden { display: none !important; }
  .modal-backdrop {
    position: fixed; inset: 0; background: rgba(15, 23, 42, 0.36); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center; z-index: 200;
  }
  .modal {
    width: 600px; max-width: 94vw; max-height: 90vh; overflow-y: auto; background: #ffffff;
    border: 1px solid #bfdbfe; border-radius: 14px; padding: 20px; box-shadow: 0 20px 50px rgba(15, 23, 42, 0.18);
  }
  .bar-chart { display: flex; align-items: flex-end; gap: 6px; height: 110px; padding-top: 12px; }
  .bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; height: 100%; justify-content: flex-end; }
  .bar-fill { width: 100%; background: linear-gradient(180deg, #2563eb, #93c5fd); border-radius: 4px 4px 0 0; min-height: 2px; }
  .bar-lbl { font-size: 10px; color: var(--text-dim); }
  .toast {
    position: fixed; bottom: 20px; right: 20px; background: #ffffff;
    border: 1px solid #93c5fd; color: #1e3a8a; padding: 10px 16px; border-radius: 10px;
    font-size: 12px; font-weight: 500; z-index: 300; box-shadow: 0 8px 24px rgba(37, 99, 235, 0.15);
  }
  pre.code {
    background: #f8fafc; border: 1px solid #dbe5f1; border-radius: 8px; padding: 12px;
    overflow-x: auto; font-size: 11px; color: #1e3a8a; font-family: Consolas, Monaco, monospace;
  }
  .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
  .form-field { display: flex; flex-direction: column; gap: 5px; font-size: 12px; }
  .form-field label { color: #475569; font-weight: 500; }
`;

export function renderPortalHtml(opts = {}) {
  const port = opts.port || 7863;
  const ver = opts.version || SERVICE_VERSION;
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>WorkBuddy 2API 服务门户 — DSH Gateway</title>
  <style>${SHARED_CSS}</style>
</head>
<body>
  <div class="topbar">
    <div class="brand">
      <span>⚡ WORKBUDDY 2API</span>
      <span class="brand-badge">PORTAL v${ver} · :${port}</span>
    </div>
    <div class="nav">
      <a class="btn btn-sm" href="/console">进入管理控制台 ↗</a>
    </div>
  </div>
  <div class="container">
    <div class="card">
      <div class="card-title">
        <span>服务实时运行总览</span>
        <button class="btn btn-sm" onclick="loadPublic()">↻ 刷新状态</button>
      </div>
      <div class="grid-3" id="portalSummary">加载中...</div>
    </div>
    <div class="card">
      <div class="card-title"><span>可用模型与官方倍率清单</span><span id="portalModelCount"></span></div>
      <div style="max-height:480px;overflow:auto">
        <table>
          <thead><tr><th>模型 ID</th><th>倍率</th><th>区服</th><th>上下文</th><th>能力</th></tr></thead>
          <tbody id="portalModelsTbody"></tbody>
        </table>
      </div>
    </div>
    <div class="card">
      <div class="card-title"><span>API 快速接入</span></div>
      <pre class="code" id="portalGuide"></pre>
    </div>
  </div>
  <script>
    function esc(s) {
      return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }
    async function loadPublic() {
      const r = await fetch('/plugins/dsh-workbuddy2api/public/status');
      const d = await r.json();
      const cn = d.realm_totals?.cn || {};
      const gl = d.realm_totals?.global || {};
      document.getElementById('portalSummary').innerHTML = [
        { t: '全池健康账号', v: (d.healthy || 0) + ' / ' + (d.total || 0), s: '冷却: ' + (d.cooling || 0) + ' · 在途占满: ' + (d.in_flight_full || 0), c: '' },
        { t: '国内版 (CN) 可用度', v: (cn.healthy || 0) + ' / ' + (cn.total || 0), s: '今日全池请求 ' + (d.today?.requests || 0) + ' 次', c: 'green' },
        { t: '国际版 (Global) 可用度', v: (gl.healthy || 0) + ' / ' + (gl.total || 0), s: '已发现动态模型 ' + (d.discoveredModels || 0) + ' 个', c: 'pink' }
      ].map(x => '<div class="card" style="margin:0"><div class="card-title"><span>' + x.t + '</span></div><div class="kpi ' + x.c + '">' + x.v + '</div><div class="sub-row">' + x.s + '</div></div>').join('');
      const ms = d.models || [];
      document.getElementById('portalModelCount').textContent = '共 ' + ms.length + ' 个公开模型';
      document.getElementById('portalModelsTbody').innerHTML = ms.map(m => {
        const caps = [];
        if (m.supports_images) caps.push('视觉');
        if (m.supports_reasoning) caps.push('思考');
        if (m.supports_tool_call) caps.push('工具');
        return '<tr><td><strong>' + esc(m.id) + '</strong></td><td><span class="tag ' + (m.is_free ? 'tag-cn' : 'tag-global') + '">' + esc(m.billing_rate || m.credits || '-') + '</span></td><td>' + esc(m.realm || 'auto') + '</td><td>' + Math.round((m.context_length || 200000) / 1000) + 'k</td><td>' + (caps.join(' · ') || '文本') + '</td></tr>';
      }).join('');
      const base = location.origin;
      document.getElementById('portalGuide').textContent =
        'OpenAI Base URL  : ' + base + '/v1\\nAnthropic Base   : ' + base + '\\nResponses API    : ' + base + '/v1/responses\\nHealthz Endpoint : ' + base + '/healthz';
    }
    loadPublic();
  </script>
</body>
</html>`;
}

export function renderConsoleHtml(opts = {}) {
  const port = opts.port || 7863;

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>WorkBuddy 2API Console — DSH 高可用网关</title>
  <style>${SHARED_CSS}</style>
</head>
<body>
  <div class="topbar">
    <div class="brand">
      <span>⚡ WORKBUDDY 2API</span>
      <span class="brand-badge" id="gatewayBadge">ONLINE v${SERVICE_VERSION} :${port}</span>
      <span id="userBadge" class="tag tag-cn hidden"></span>
    </div>
    <div class="nav">
      <button class="nav-btn active" onclick="switchTab('pool')">账号池总览</button>
      <button class="nav-btn" onclick="switchTab('models')">模型 &amp; 倍率</button>
      <button class="nav-btn" onclick="switchTab('playground')">在线调试 &amp; 流水</button>
      <button class="nav-btn" onclick="switchTab('usage')">用量与扣费</button>
      <button class="nav-btn" onclick="switchTab('welfare')">猫猫 &amp; 福利 &amp; 邀请</button>
      <button class="nav-btn" onclick="switchTab('tasks')">成长任务</button>
      <button class="nav-btn" onclick="switchTab('settings')">安全 · 告警 · 用户 · DSH</button>
      <a class="btn btn-sm" href="/portal" target="_blank">门户 ↗</a>
      <button id="logoutBtn" class="btn btn-sm btn-pink hidden" onclick="doLogout()">退出</button>
    </div>
  </div>

  <div class="container">
    <!-- TAB 1: POOL -->
    <div id="tab-pool">
      <div class="grid-3" id="realmSummaryCards"></div>

      <div class="toolbar">
        <button class="btn btn-green" onclick="startOAuth('cn')">+ 国内版 OAuth</button>
        <button class="btn" onclick="startOAuth('global')">+ 国际版 OAuth</button>
        <button class="btn" onclick="openImportModal()">批量 / ZIP 导入</button>
        <button class="btn" onclick="exportZip()">导出 ZIP 备份</button>
        <button class="btn btn-green" onclick="batchCheckin()">全池每日签到</button>
        <button class="btn" onclick="batchTrial()">国际版批量领Trial</button>
        <button class="btn btn-amber" onclick="refreshAllTokens()">刷新全部 Token</button>
        <button class="btn btn-pink" onclick="clearAllCooldowns()">清除熔断</button>
        <button class="btn" onclick="openOverviewModal('balance')">余额总览</button>
        <button class="btn" onclick="openOverviewModal('packs')">积分包总览</button>
        <button class="btn" onclick="loadStatus(true)">↻ 极速刷新</button>
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
                <th>签到/健康状态</th>
                <th>并发</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody id="accountsTbody"></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 2: MODELS & RATES -->
    <div id="tab-models" class="hidden">
      <div class="toolbar">
        <button class="btn btn-green" onclick="discoverModels()">🔍 同步上游实时倍率目录</button>
        <button class="btn" onclick="saveModelsConfig()">💾 保存路由 · 过滤 · 别名</button>
        <select id="modelFilterMode" onchange="renderModelsTable()">
          <option value="all">全部模型</option>
          <option value="free">🎁 仅免费 (x0.00)</option>
          <option value="low">💎 超低倍率 (≤0.2x)</option>
          <option value="cn">🇨🇳 国内版 (CN)</option>
          <option value="global">🌐 国际版 (Global)</option>
          <option value="reasoning">🧠 支持思考</option>
        </select>
        <input id="modelSearch" placeholder="搜索模型 ID / 描述..." oninput="renderModelsTable()" style="min-width:180px" />
        <label style="font-size:12px"><input type="checkbox" id="autoFreeToggle" /> 开放 auto-free 虚拟免费池</label>
      </div>
      <div class="grid-2" style="grid-template-columns: 1.55fr 1fr;">
        <div class="card">
          <div class="card-title"><span>上游模型与实时积分倍率目录（空勾选表示全部放行）</span><span id="modelCountLabel"></span></div>
          <div style="max-height:540px;overflow:auto">
            <table>
              <thead><tr><th>启用</th><th>模型 ID / 说明</th><th>倍率</th><th>能力 &amp; 思考档位</th><th>区服</th><th>上下文</th><th>操作</th></tr></thead>
              <tbody id="modelsTbody"></tbody>
            </table>
          </div>
        </div>
        <div class="card">
          <div class="card-title"><span>auto-free 优先级 / 故障转移路由组 / 模型别名</span></div>
          <div class="form-field" style="margin-bottom:10px">
            <label>auto-free 智能免费路由顺序 (逗号分隔):</label>
            <input id="freeModelsInput" />
          </div>
          <div class="form-field" style="margin-bottom:10px">
            <label>自定义模型故障转移组 modelRoutes (JSON):</label>
            <textarea id="modelRoutesTextarea" rows="5" placeholder='{"fast":["cn:deepseek-v4.1-flash","global:glm-4.7-flash"]}'></textarea>
          </div>
          <div class="form-field">
            <label>模型别名表 aliases (JSON):</label>
            <textarea id="aliasesTextarea" rows="10"></textarea>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 3: PLAYGROUND & LIVE LOGS -->
    <div id="tab-playground" class="hidden">
      <div class="grid-2">
        <div class="card">
          <div class="card-title"><span>🧪 在线对话测试 (支持图片/文本附件)</span><span id="pgStatsBadge" class="tag tag-global">就绪</span></div>
          <div class="form-grid" style="margin-bottom:10px">
            <div class="form-field">
              <label>选择测试模型 (附带实时倍率):</label>
              <select id="pgModelSelect"></select>
            </div>
            <div class="form-field">
              <label>思考强度 (reasoning_effort):</label>
              <select id="pgEffortSelect">
                <option value="">默认</option>
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
                <option value="xhigh">xhigh</option>
                <option value="max">max</option>
              </select>
            </div>
          </div>
          <div class="form-field" style="margin-bottom:8px">
            <label>测试提示词:</label>
            <textarea id="pgPromptInput" rows="3" placeholder="你好，请用一句话介绍你自己"></textarea>
          </div>
          <div class="toolbar" style="margin-bottom:10px">
            <input type="file" id="pgFileInput" accept="image/*,.txt,.md,.json,.js,.py,.go" onchange="handlePgFile(event)" style="max-width:210px" />
            <span id="pgAttachBadge" class="tag tag-cn hidden"></span>
            <button id="pgAttachClear" class="btn btn-sm btn-pink hidden" onclick="clearPgAttachment()">清除附件</button>
            <label style="font-size:12px"><input type="checkbox" id="pgStreamChk" checked /> 流式 SSE</label>
            <button class="btn btn-green" onclick="runPlayground()">🚀 发送测试</button>
          </div>
          <pre class="code" id="pgOutputBox" style="min-height:140px;max-height:320px;white-space:pre-wrap">等待发送测试...</pre>
        </div>

        <div class="card">
          <div class="card-title">
            <span>📡 在途并发 &amp; 最近请求实时流水</span>
            <button class="btn btn-sm" onclick="loadLogs()">↻ 刷新流水</button>
          </div>
          <div id="inFlightBox" class="sub-row" style="margin-bottom:10px">当前无在途请求</div>
          <div style="max-height:380px;overflow:auto">
            <table>
              <thead><tr><th>时间</th><th>模型</th><th>倍率</th><th>账号</th><th>状态</th><th>TTFB/Tokens/速率</th><th>扣费</th></tr></thead>
              <tbody id="logsTbody"></tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 4: USAGE & CREDIT BREAKDOWN -->
    <div id="tab-usage" class="hidden">
      <div class="toolbar">
        <label style="font-size:12px;color:#475569">按历史日期查看:</label>
        <select id="usageDateSelect" onchange="loadUsage(this.value)"></select>
        <button class="btn" onclick="loadUsage()">↻ 刷新统计</button>
        <button class="btn btn-pink" onclick="resetUsage()">清空本地用量账本</button>
      </div>
      <div class="grid-3" id="usageSummaryCards"></div>
      <div class="grid-2">
        <div class="card">
          <div class="card-title"><span>近 7 天请求与 Token 走势</span></div>
          <div class="bar-chart" id="chart7d"></div>
        </div>
        <div class="card">
          <div class="card-title"><span>选中日 24 小时热度分布</span></div>
          <div class="bar-chart" id="chart24h"></div>
        </div>
      </div>
      <div class="card">
        <div class="card-title"><span>📊 按模型倍率、缓存命中与实测扣费排行</span></div>
        <div style="overflow-x:auto">
          <table>
            <thead>
              <tr>
                <th>模型</th>
                <th>官方倍率</th>
                <th>请求 (成功/失败)</th>
                <th>输入/输出 Token</th>
                <th>缓存命中率</th>
                <th>累计扣费</th>
                <th>均耗 / 1k单价</th>
                <th>均TTFB / 吞吐</th>
              </tr>
            </thead>
            <tbody id="usageModelsTbody"></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 5: WELFARE & TRAVEL & INVITE -->
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
          <div class="card-title"><span>🎁 专属邀请与受邀绑定 (v2)</span><button class="btn btn-sm" onclick="loadWelfareAndInvite()">刷新</button></div>
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

    <!-- TAB 6: GROWTH TASKS -->
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

    <!-- TAB 7: SECURITY, ALERTS, USERS, SCHEDULE & DSH SETTINGS -->
    <div id="tab-settings" class="hidden">
      <div class="card">
        <div class="card-title"><span>网关核心参数与自动化策略</span><button class="btn btn-green btn-sm" onclick="saveConfig()">💾 保存核心参数</button></div>
        <div class="form-grid">
          <div class="form-field"><label>网关鉴权 API Key (留空不校验):</label><input id="cfgApiKey" placeholder="sk-..." /></div>
          <div class="form-field"><label>HTTP 代理 (如 http://127.0.0.1:7890):</label><input id="cfgProxy" placeholder="留空直连" /></div>
          <div class="form-field"><label>国内版 CN 单号最大并发:</label><input id="cfgMaxCN" type="number" min="1" max="20" /></div>
          <div class="form-field"><label>国际版 Global 单号最大并发:</label><input id="cfgMaxGlobal" type="number" min="1" max="20" /></div>
          <div class="form-field"><label>排队等待超时 (ms):</label><input id="cfgQueueTimeout" type="number" min="0" max="60000" /></div>
          <div class="form-field"><label>流式空闲断连超时 (ms):</label><input id="cfgIdleTimeout" type="number" min="10000" max="600000" /></div>
          <div class="form-field">
            <label>System Prompt 注入模式:</label>
            <select id="cfgPromptMode">
              <option value="none">关闭 (保持原样)</option>
              <option value="append">追加到末尾 (append)</option>
              <option value="replace">全局替换 (replace)</option>
            </select>
          </div>
          <div class="form-field"><label>X-Device-Token 文件路径 (可选):</label><input id="cfgDeviceToken" placeholder="~/.dsh/device_token" /></div>
        </div>
        <div class="form-field" style="margin-top:10px">
          <label>System Prompt 自定义文本:</label>
          <textarea id="cfgPromptText" rows="2"></textarea>
        </div>
        <div class="toolbar" style="margin-top:10px;margin-bottom:0">
          <label><input type="checkbox" id="cfgAutoCheckin" /> 自动福利/签到</label>
          <label><input type="checkbox" id="cfgAutoTravel" /> 自动猫猫旅行</label>
          <label><input type="checkbox" id="cfgAutoTasks" /> 自动成长任务</label>
          <label><input type="checkbox" id="cfgAutoRefresh" /> 5分钟 Token 保活</label>
          <label><input type="checkbox" id="cfgPortalHome" /> 首页(/)设为公开门户 (/console 进后台)</label>
        </div>
      </div>

      <div class="grid-2">
        <!-- 定时小时排程 -->
        <div class="card">
          <div class="card-title"><span>⏰ CST 整点自动化排程小时</span><button class="btn btn-green btn-sm" onclick="saveScheduleConfig()">保存排程</button></div>
          <div class="form-grid">
            <div class="form-field"><label>签到福利小时 (逗号):</label><input id="schCheckin" placeholder="9, 21" /></div>
            <div class="form-field"><label>猫猫旅行小时 (逗号):</label><input id="schTravel" placeholder="9, 21" /></div>
            <div class="form-field"><label>成长任务小时 (逗号):</label><input id="schTasks" placeholder="11" /></div>
            <div class="form-field"><label>全池保活小时 (逗号):</label><input id="schKeepalive" placeholder="22" /></div>
          </div>
        </div>

        <!-- 控制台密码与版本自检 -->
        <div class="card">
          <div class="card-title"><span>🔐 控制台访问密码 &amp; 版本检测</span><span id="pwStatusBadge" class="tag tag-cn">免密单机模式</span></div>
          <div style="display:flex;gap:8px;margin-bottom:12px">
            <input id="cfgWebPassword" type="password" placeholder="输入新控制台密码 (留空点击保存则清除密码)" style="flex:1" />
            <button class="btn btn-amber btn-sm" onclick="saveWebPassword()">设置/清除密码</button>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid #edf2f7;padding-top:10px">
            <span id="updateInfoSpan" style="font-size:12px;color:#475569">当前版本: v${SERVICE_VERSION} (${GITHUB_REPO})</span>
            <button class="btn btn-sm" onclick="checkUpdate()">检查 GitHub 新版本</button>
          </div>
        </div>
      </div>

      <div class="grid-2">
        <!-- IP 白名单 -->
        <div class="card">
          <div class="card-title"><span>🛡️ IP / CIDR 访问白名单</span><button class="btn btn-green btn-sm" onclick="saveIPWhitelist()">保存白名单</button></div>
          <div class="toolbar" style="margin-bottom:8px">
            <label><input type="checkbox" id="ipWlEnabled" /> 启用白名单校验</label>
            <label><input type="checkbox" id="ipWlLocal" checked /> 始终放行本机回环 (127.0.0.1/::1)</label>
            <button class="btn btn-sm" onclick="addClientIP()">+ 添加当前访问 IP</button>
          </div>
          <div id="ipRuntimeInfo" class="sub-row" style="margin-bottom:8px">当前来访 IP: -</div>
          <textarea id="ipWlList" rows="3" placeholder="每行或逗号分隔 IP / CIDR，如: 192.168.1.0/24, 10.0.0.5" style="width:100%"></textarea>
        </div>

        <!-- Webhook 告警 -->
        <div class="card">
          <div class="card-title">
            <span>🔔 多通道 Webhook 风控告警</span>
            <div style="display:flex;gap:6px">
              <button class="btn btn-amber btn-sm" onclick="testAlerts()">发送测试告警</button>
              <button class="btn btn-green btn-sm" onclick="saveAlerts()">保存告警</button>
            </div>
          </div>
          <div class="toolbar" style="margin-bottom:8px">
            <label><input type="checkbox" id="alertEnabled" /> 启用告警</label>
            <label>低积分阈值: <input id="alertMinCredit" type="number" style="width:72px" value="50" /></label>
          </div>
          <div class="toolbar" style="margin-bottom:8px;font-size:11px">
            <label><input type="checkbox" class="alert-evt" value="ban" checked /> 封号/禁用</label>
            <label><input type="checkbox" class="alert-evt" value="401" checked /> 401失效</label>
            <label><input type="checkbox" class="alert-evt" value="cooling" checked /> 全池冷却</label>
            <label><input type="checkbox" class="alert-evt" value="low_credit" checked /> 低积分预警</label>
          </div>
          <textarea id="alertHooks" rows="3" placeholder="Webhook URL (支持 飞书 / 企微 / 钉钉 / Telegram / Discord / 通用 JSON)" style="width:100%"></textarea>
        </div>
      </div>

      <!-- 多用户与租户配额管控 -->
      <div class="card">
        <div class="card-title">
          <span>👥 多租户用户、专属 API Key 与配额管控</span>
          <div style="display:flex;gap:8px;align-items:center">
            <label style="font-size:12px"><input type="checkbox" id="allowRegChk" onchange="toggleAllowRegister(this.checked)" /> 开放用户自助注册</label>
            <button class="btn btn-sm" onclick="loadAdminUsers()">↻ 刷新用户列表</button>
          </div>
        </div>
        <div class="toolbar" style="margin-bottom:10px">
          <input id="newUserName" placeholder="用户名" style="width:120px" />
          <input id="newUserPass" type="password" placeholder="密码(≥4位)" style="width:120px" />
          <select id="newUserRole"><option value="user">普通用户</option><option value="admin">管理员</option></select>
          <input id="newUserQuota" type="number" placeholder="日限额(0不限)" style="width:115px" />
          <input id="newUserRpm" type="number" placeholder="RPM(0不限)" style="width:105px" />
          <button class="btn btn-green btn-sm" onclick="createTenantUser()">+ 新增租户</button>
        </div>
        <div style="overflow-x:auto">
          <table>
            <thead><tr><th>用户名</th><th>角色</th><th>专属 API Key</th><th>今日已耗 / 日上限</th><th>RPM</th><th>状态</th><th>操作</th></tr></thead>
            <tbody id="adminUsersTbody"></tbody>
          </table>
        </div>
      </div>

      <!-- DSH 挂载检测 -->
      <div class="card">
        <div class="card-title">
          <span>🔌 DeepSeek Harness (DSH) 桌面端配置检测与一键同步</span>
          <div style="display:flex;gap:6px">
            <button class="btn btn-sm" onclick="checkDsh()">检测状态</button>
            <button class="btn btn-green btn-sm" onclick="syncDsh()">一键同步 baseURL</button>
          </div>
        </div>
        <div id="dshCheckBox" class="sub-row">点击「检测状态」检查本机 cordis.patch.yml 与插件挂载</div>
      </div>

      <div class="card">
        <div class="card-title"><span>多协议端点接入指南</span></div>
        <pre class="code" id="guideCode"></pre>
      </div>
    </div>
  </div>

  <!-- MODALS -->
  <div id="packsModal" class="modal-backdrop hidden">
    <div class="modal" style="width:680px">
      <div class="card-title"><span id="packsModalTitle">明细总览</span><button class="btn btn-sm btn-pink" onclick="closeModal('packsModal')">关闭</button></div>
      <div id="packsModalToolbar" class="toolbar hidden">
        <button class="btn btn-sm" onclick="setOverviewRealm('all')">全部</button>
        <button class="btn btn-sm btn-green" onclick="setOverviewRealm('cn')">国内版 CN</button>
        <button class="btn btn-sm" onclick="setOverviewRealm('global')">国际版 Global</button>
      </div>
      <div style="max-height:440px;overflow:auto">
        <table>
          <thead id="packsModalThead"><tr><th>名称</th><th>类型</th><th>剩余</th><th>总量</th><th>已用</th><th>到期时间</th></tr></thead>
          <tbody id="packsModalTbody"></tbody>
        </table>
      </div>
    </div>
  </div>

  <div id="accountDetailModal" class="modal-backdrop hidden">
    <div class="modal" style="width:640px">
      <div class="card-title"><span id="accDetailTitle">账号详细档案</span><button class="btn btn-sm btn-pink" onclick="closeModal('accountDetailModal')">关闭</button></div>
      <div id="accDetailBody" style="font-size:12px;line-height:1.8"></div>
    </div>
  </div>

  <div id="updateTokenModal" class="modal-backdrop hidden">
    <div class="modal">
      <div class="card-title"><span id="updTokenTitle">一键更新凭证 Token / 救活账号</span><button class="btn btn-sm btn-pink" onclick="closeModal('updateTokenModal')">关闭</button></div>
      <input type="hidden" id="updTokenUid" />
      <div class="form-field" style="margin-bottom:10px"><label>新 Access Token (可选):</label><textarea id="updAccessInput" rows="3"></textarea></div>
      <div class="form-field" style="margin-bottom:12px"><label>新 Refresh Token (推荐):</label><textarea id="updRefreshInput" rows="3"></textarea></div>
      <div style="display:flex;justify-content:flex-end;gap:8px"><button class="btn btn-green" onclick="submitUpdateToken()">验证并救活账号</button></div>
    </div>
  </div>

  <div id="importModal" class="modal-backdrop hidden">
    <div class="modal">
      <div class="card-title"><span>批量导入账号 (ZIP / JSON / token----refreshToken)</span><button class="btn btn-sm btn-pink" onclick="closeModal('importModal')">关闭</button></div>
      <div class="form-field" style="margin-bottom:10px">
        <label>默认区服（无明确标记时生效）:</label>
        <select id="importRealm"><option value="global">国际版 (Global / workbuddy.ai)</option><option value="cn">国内版 (CN / codebuddy.cn)</option></select>
      </div>
      <div class="form-field" style="margin-bottom:10px"><label>上传 .zip / .json / .txt 文件:</label><input type="file" id="importFileInput" accept=".zip,.json,.txt,.info" /></div>
      <div class="form-field" style="margin-bottom:12px"><label>或直接粘贴文本:</label><textarea id="importTextarea" rows="7" placeholder="accessToken----refreshToken 或 JSON"></textarea></div>
      <div style="display:flex;justify-content:flex-end;gap:8px"><button class="btn btn-green" onclick="submitImport()">🚀 验证连通并导入</button></div>
      <pre class="code hidden" id="importResultBox" style="margin-top:10px"></pre>
    </div>
  </div>

  <div id="oauthModal" class="modal-backdrop hidden">
    <div class="modal">
      <div class="card-title"><span id="oauthTitle">OAuth 授权登录</span><button class="btn btn-sm btn-pink" onclick="closeOAuthModal()">取消</button></div>
      <p style="font-size:12px;color:var(--text-dim)">请在新打开的浏览器窗口完成登录授权，控制台正在自动轮询回调...</p>
      <div style="margin:10px 0"><a id="oauthLink" href="#" target="_blank" style="color:var(--cyan);word-break:break-all;font-size:12px"></a></div>
      <div id="oauthStatusText" class="tag tag-warn">等待用户完成网页授权...</div>
    </div>
  </div>

  <div id="loginModal" class="modal-backdrop hidden">
    <div class="modal" style="width:420px">
      <div class="card-title"><span>🔐 WorkBuddy 2API 控制台鉴权</span></div>
      <div style="display:flex;gap:6px;margin-bottom:12px">
        <button class="btn btn-sm" id="tabLoginBtn" onclick="switchAuthTab('login')">密码登录</button>
        <button class="btn btn-sm hidden" id="tabRegBtn" onclick="switchAuthTab('register')">注册账号</button>
      </div>
      <div class="form-field" style="margin-bottom:10px"><label>用户名:</label><input id="loginUser" value="admin" /></div>
      <div class="form-field" style="margin-bottom:12px"><label>密码:</label><input id="loginPass" type="password" onkeydown="if(event.key==='Enter')submitAuth()" /></div>
      <button class="btn btn-green" style="width:100%;justify-content:center" onclick="submitAuth()">登录进入控制台</button>
      <div id="loginErrBox" style="color:var(--magenta);font-size:12px;margin-top:8px"></div>
    </div>
  </div>

  <div id="toast" class="toast hidden"></div>

  <script>
    const API = '/plugins/dsh-workbuddy2api';
    let state = { accounts: [], activeUid: null, summary: {}, models: [], aliases: {}, modelRoutes: {}, autoFreeEnabled: true, freeModels: [], config: {}, runtimeNetwork: {}, auth: {} };
    let oauthPollTimer = null;
    let pgAttachment = null; // { kind: 'image' | 'text', name, data }
    let overviewMode = 'packs';
    let overviewRealm = 'all';
    let authMode = 'login';

    function toast(msg) {
      const el = document.getElementById('toast');
      el.textContent = msg;
      el.classList.remove('hidden');
      setTimeout(() => el.classList.add('hidden'), 3500);
    }

    function escapeHtml(s) {
      return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

    async function api(path, opts = {}) {
      const res = await fetch(API + path, opts);
      const data = await res.json().catch(() => ({}));
      if (res.status === 401 && data.authRequired) {
        showLoginModal(true);
      }
      return data;
    }

    function showLoginModal(allowReg = false) {
      document.getElementById('tabRegBtn').classList.toggle('hidden', !state.auth?.allowRegister && !allowReg);
      document.getElementById('loginModal').classList.remove('hidden');
    }

    function switchAuthTab(mode) { authMode = mode; document.getElementById('loginErrBox').textContent = ''; }

    async function submitAuth() {
      const username = document.getElementById('loginUser').value.trim() || 'admin';
      const password = document.getElementById('loginPass').value;
      const endpoint = authMode === 'register' ? '/auth/register' : '/auth/login';
      const res = await fetch(API + endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        document.getElementById('loginErrBox').textContent = data.error || '认证失败';
        return;
      }
      if (authMode === 'register') {
        authMode = 'login';
        toast('注册成功，请登录');
        return;
      }
      closeModal('loginModal');
      loadStatus(true);
    }

    async function doLogout() {
      await fetch(API + '/auth/logout', { method: 'POST' });
      showLoginModal(true);
    }

    function switchTab(tab) {
      const tabs = ['pool', 'models', 'playground', 'usage', 'welfare', 'tasks', 'settings'];
      tabs.forEach((t, idx) => {
        document.getElementById('tab-' + t).classList.toggle('hidden', t !== tab);
        document.querySelectorAll('.nav-btn')[idx].classList.toggle('active', t === tab);
      });
      if (tab === 'welfare') loadWelfareAndInvite();
      if (tab === 'tasks') loadTasks();
      if (tab === 'models') loadModels();
      if (tab === 'playground') { loadModels(); loadLogs(); }
      if (tab === 'usage') loadUsage();
      if (tab === 'settings') { renderSettings(); loadAdminUsers(); checkDsh(); }
    }

    async function loadStatus(refresh = false) {
      try {
        const data = await api('/status' + (refresh ? '?refresh=1' : ''));
        if (!data.ok) return;
        state.accounts = data.accounts || [];
        state.activeUid = data.activeUid;
        state.summary = data.summary || {};
        state.aliases = data.aliases || {};
        state.modelRoutes = data.modelRoutes || {};
        state.autoFreeEnabled = data.autoFreeEnabled !== false;
        state.enabledModels = data.enabledModels || [];
        state.config = data.config || {};
        state.runtimeNetwork = data.runtimeNetwork || {};
        state.auth = data.auth || {};
        document.getElementById('gatewayBadge').textContent = 'ONLINE v' + (data.serviceVersion || '${SERVICE_VERSION}') + ' :' + (data.gatewayPort || ${port});
        const ub = document.getElementById('userBadge');
        const lb = document.getElementById('logoutBtn');
        if (state.auth.hasPassword && state.auth.currentUser) {
          ub.textContent = state.auth.currentUser.username + ' (' + state.auth.currentUser.role + ')';
          ub.classList.remove('hidden');
          lb.classList.remove('hidden');
        } else {
          ub.classList.add('hidden');
          lb.classList.add('hidden');
        }
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
      const all = s.all || {}; const cn = s.cn || {}; const gl = s.global || {};
      document.getElementById('realmSummaryCards').innerHTML = [
        { title: '全池合计 (All)', kpi: all.remain, sub: '健康 ' + (all.healthyCount||0) + ' / 启用 ' + (all.enabledCount||0) + ' / 共 ' + (all.count||0) + ' | 基 ' + (all.baseRemain||0) + ' 赠 ' + (all.bonusRemain||0), cls: '' },
        { title: '国内版 (CodeBuddy CN)', kpi: cn.remain, sub: '可用 ' + (cn.enabledCount||0) + '/' + (cn.count||0) + ' | 总额 ' + (cn.total||0), cls: 'green' },
        { title: '国际版 (WorkBuddy AI)', kpi: gl.remain, sub: '可用 ' + (gl.enabledCount||0) + '/' + (gl.count||0) + ' | 7日到期 ' + (gl.expiringRemain||0), cls: 'pink' }
      ].map(c => '<div class="card" style="margin:0;cursor:pointer" onclick="openOverviewModal(\\'balance\\')"><div class="card-title"><span>' + c.title + '</span></div><div class="kpi ' + c.cls + '">' + Number(c.kpi||0).toLocaleString() + '</div><div class="sub-row">' + c.sub + '</div></div>').join('');
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
        if (acc.manualDisabled) healthTag = '<span class="tag tag-err">手动停用</span>';
        else if (acc.disabled) healthTag = '<span class="tag tag-err">自动禁用</span>';
        else if (d.coolingDown) healthTag = '<span class="tag tag-warn">冷却 ' + (d.cooldownRemainingSec||0) + 's</span>';
        else if (d.modelCooldowns && d.modelCooldowns.length > 0) healthTag = '<span class="tag tag-warn">' + d.modelCooldowns.length + '模型限流</span>';
        const chkTag = acc.checkinState ? (' <span class="tag ' + (acc.checkinState.ok ? 'tag-cn' : 'tag-warn') + '">' + (acc.checkinState.ok ? '今日已签' : '待重试') + '</span>') : '';
        const pkgText = '基:' + (b.baseRemain||0) + ' 赠:' + (b.bonusRemain||0) + ' 购:' + (b.purchasedRemain||0);
        return '<tr>' +
          '<td><strong>' + escapeHtml(acc.nickname || acc.uid) + '</strong>' + (isAct ? ' <span class="tag tag-cn">优先</span>' : '') + '<br><span style="color:var(--text-dim);font-size:11px">' + escapeHtml(acc.uid) + '</span></td>' +
          '<td>' + realmTag + '</td>' +
          '<td style="font-weight:700;color:var(--cyan)">' + Number(b.remain || 0).toLocaleString() + '<br><span style="color:var(--text-dim);font-size:10px">/ ' + Number(b.total || 0).toLocaleString() + '</span></td>' +
          '<td style="font-size:11px;color:var(--text-dim)">' + pkgText + '<br>活跃包: ' + (b.activePackCount||0) + ' <button class="btn btn-sm" style="padding:1px 6px;margin-left:4px" onclick="openPacksModal(\\'' + acc.uid + '\\')">明细</button></td>' +
          '<td>' + healthTag + chkTag + '<br><span style="font-size:10px;color:var(--text-dim)">成功:' + (d.stats?.successCount||0) + ' 失败:' + (d.stats?.failCount||0) + '</span></td>' +
          '<td>' + (acc.inFlight || 0) + ' / ' + (d.limit || 3) + '</td>' +
          '<td style="display:flex;gap:4px;flex-wrap:wrap">' +
            (isAct ? '' : '<button class="btn btn-sm" onclick="switchAcc(\\'' + acc.uid + '\\')">优先</button>') +
            '<button class="btn btn-sm" onclick="openAccountDetail(\\'' + acc.uid + '\\')">详情</button>' +
            '<button class="btn btn-sm" onclick="openUpdateToken(\\'' + acc.uid + '\\')">换Token</button>' +
            (acc.manualDisabled
              ? '<button class="btn btn-sm btn-green" onclick="adminAction(\\'' + acc.uid + '\\', \\'manualEnable\\')">恢复</button>'
              : '<button class="btn btn-sm btn-pink" onclick="adminAction(\\'' + acc.uid + '\\', \\'disable\\')">停用</button>') +
            ((acc.disabled || d.coolingDown || (d.modelCooldowns && d.modelCooldowns.length))
              ? '<button class="btn btn-sm btn-amber" onclick="adminAction(\\'' + acc.uid + '\\', \\'revive\\')">复活/解熔断</button>' : '') +
            '<button class="btn btn-sm btn-pink" onclick="deleteAcc(\\'' + acc.uid + '\\')">删</button>' +
          '</td>' +
        '</tr>';
      }).join('');
    }

    function syncUidSelectors() {
      const opts = state.accounts.map(a => '<option value="' + a.uid + '" ' + (a.uid === state.activeUid ? 'selected' : '') + '>[' + a.realm.toUpperCase() + '] ' + escapeHtml(a.nickname) + '</option>').join('');
      const wSel = document.getElementById('welfareUidSelect');
      const tSel = document.getElementById('tasksUidSelect');
      const prevW = wSel.value; const prevT = tSel.value;
      wSel.innerHTML = opts; tSel.innerHTML = opts;
      if (prevW) wSel.value = prevW; if (prevT) tSel.value = prevT;
    }

    async function switchAcc(uid) { await api('/accounts/switch', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid }) }); toast('已切换优先账号'); loadStatus(); }
    async function deleteAcc(uid) { if (!confirm('确认删除 ' + uid + ' 吗？')) return; await api('/accounts/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid }) }); toast('已删除'); loadStatus(); }
    async function adminAction(uid, action) {
      toast('执行 ' + action + ' ...');
      const res = await api('/accounts/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid, action }) });
      toast(res.message || (res.ok ? '成功' : res.error));
      loadStatus(action === 'refresh' || action === 'trial');
    }
    async function refreshAllTokens() { toast('正在批量刷新...'); const res = await api('/accounts/refresh-all', { method: 'POST' }); toast('刷新: 成功 ' + res.refreshed + ', 失败 ' + res.failed); loadStatus(true); }
    async function clearAllCooldowns() { const res = await api('/accounts/clear-all-cooldowns', { method: 'POST' }); toast('已清理 ' + (res.cleared || 0) + ' 条冷却'); loadStatus(); }
    async function batchCheckin() { toast('正在批量签到...'); const res = await api('/checkin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ all: true }) }); toast(res.message || '完成'); loadStatus(true); }
    async function batchTrial() { toast('正在为国际版账号批量领 Trial...'); const res = await api('/trial/batch', { method: 'POST' }); toast('执行完成: ' + (res.results?.length || 0) + ' 个'); loadStatus(true); }

    function openUpdateToken(uid) {
      const acc = state.accounts.find(a => a.uid === uid);
      document.getElementById('updTokenUid').value = uid;
      document.getElementById('updTokenTitle').textContent = '更新凭证 — ' + (acc?.nickname || uid);
      document.getElementById('updAccessInput').value = '';
      document.getElementById('updRefreshInput').value = '';
      document.getElementById('updateTokenModal').classList.remove('hidden');
    }
    async function submitUpdateToken() {
      const uid = document.getElementById('updTokenUid').value;
      const accessToken = document.getElementById('updAccessInput').value.trim();
      const refreshToken = document.getElementById('updRefreshInput').value.trim();
      const res = await api('/accounts/update_token', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, accessToken, refreshToken })
      });
      toast(res.message || res.error || '完成');
      if (res.ok) { closeModal('updateTokenModal'); loadStatus(true); }
    }

    async function openAccountDetail(uid) {
      const acc = state.accounts.find(a => a.uid === uid);
      if (!acc) return;
      document.getElementById('accDetailTitle').textContent = (acc.nickname || uid) + ' (' + acc.realm.toUpperCase() + ') 详情';
      const d = acc.diagnostics || {};
      const b = acc.balance || {};
      const invRes = await api('/invite/info?uid=' + encodeURIComponent(uid)).catch(() => ({}));
      const inv = invRes.info || {};
      document.getElementById('accDetailBody').innerHTML =
        '<div><strong>UID:</strong> ' + escapeHtml(acc.uid) + ' | <strong>状态:</strong> ' + (acc.disabledReason || acc.manualDisabledReason || '正常') + '</div>' +
        '<div><strong>剩余积分:</strong> ' + (b.remain || 0) + ' / ' + (b.total || 0) + ' (7日过期: ' + (b.expiringRemain || 0) + ')</div>' +
        '<div><strong>专属邀请码:</strong> ' + escapeHtml(inv.inviteCode || '-') + ' | <strong>受邀人数:</strong> ' + (inv.invitedCount || 0) + '</div>' +
        '<div style="margin-top:8px"><strong>模型级限流冷却:</strong> ' + ((d.modelCooldowns || []).map(c => c.model + '(' + c.remainingSec + 's)').join(', ') || '无') + '</div>' +
        '<div class="toolbar" style="margin-top:12px">' +
          '<button class="btn btn-sm" onclick="adminAction(\\'' + uid + '\\', \\'refresh\\')">刷新余额与Token</button>' +
          (acc.realm === 'global' ? '<button class="btn btn-sm btn-green" onclick="adminAction(\\'' + uid + '\\', \\'trial\\')">领取 Trial</button>' : '') +
          '<button class="btn btn-sm btn-amber" onclick="adminAction(\\'' + uid + '\\', \\'revive\\')">解除冷却复活</button>' +
        '</div>';
      document.getElementById('accountDetailModal').classList.remove('hidden');
    }

    function openOverviewModal(mode) {
      overviewMode = mode;
      document.getElementById('packsModalToolbar').classList.remove('hidden');
      renderOverviewBody();
      document.getElementById('packsModal').classList.remove('hidden');
    }
    function setOverviewRealm(r) { overviewRealm = r; renderOverviewBody(); }
    function renderOverviewBody() {
      const accs = state.accounts.filter(a => overviewRealm === 'all' || a.realm === overviewRealm);
      if (overviewMode === 'balance') {
        document.getElementById('packsModalTitle').textContent = '全池账号余额总览 (' + accs.length + '个)';
        document.getElementById('packsModalThead').innerHTML = '<tr><th>账号</th><th>区服</th><th>剩余积分</th><th>基础/赠送/购买</th><th>7日过期</th><th>状态</th></tr>';
        document.getElementById('packsModalTbody').innerHTML = accs.map(a => {
          const b = a.balance || {};
          return '<tr><td><strong>' + escapeHtml(a.nickname) + '</strong></td><td>' + a.realm + '</td><td style="color:var(--cyan);font-weight:700">' + (b.remain || 0) + '</td><td>' + (b.baseRemain||0) + '/' + (b.bonusRemain||0) + '/' + (b.purchasedRemain||0) + '</td><td>' + (b.expiringRemain||0) + '</td><td>' + (a.disabled || a.manualDisabled ? '停用' : '活跃') + '</td></tr>';
        }).join('');
      } else {
        document.getElementById('packsModalTitle').textContent = '全池积分包明细汇总';
        document.getElementById('packsModalThead').innerHTML = '<tr><th>所属账号</th><th>包名称</th><th>剩余</th><th>总量</th><th>已用</th><th>到期时间</th></tr>';
        const rows = [];
        for (const a of accs) {
          for (const p of (a.balance?.packages || [])) {
            rows.push('<tr><td>' + escapeHtml(a.nickname) + ' (' + a.realm + ')</td><td>' + escapeHtml(p.name) + '</td><td style="color:var(--cyan);font-weight:700">' + (p.remain ?? 0) + '</td><td>' + (p.size ?? p.total ?? 0) + '</td><td>' + (p.used ?? 0) + '</td><td>' + escapeHtml(p.expireTime || '永久') + '</td></tr>');
          }
        }
        document.getElementById('packsModalTbody').innerHTML = rows.join('') || '<tr><td colspan="6">暂无活跃积分包</td></tr>';
      }
    }

    function openPacksModal(uid) {
      const acc = state.accounts.find(a => a.uid === uid);
      if (!acc) return;
      document.getElementById('packsModalToolbar').classList.add('hidden');
      const packs = acc.balance?.packages || [];
      document.getElementById('packsModalTitle').textContent = (acc.nickname || uid) + ' — 积分包明细 (' + packs.length + '个)';
      document.getElementById('packsModalThead').innerHTML = '<tr><th>积分包名称</th><th>类型</th><th>剩余</th><th>总量</th><th>已用</th><th>到期时间</th></tr>';
      document.getElementById('packsModalTbody').innerHTML = packs.map(p =>
        '<tr><td>' + escapeHtml(p.name) + '</td><td>' + escapeHtml(p.type || '-') + '</td><td style="font-weight:700;color:var(--cyan)">' + (p.remain ?? 0) + '</td><td>' + (p.size ?? p.total ?? 0) + '</td><td>' + (p.used ?? 0) + '</td><td>' + escapeHtml(p.expireTime || '永久') + '</td></tr>'
      ).join('') || '<tr><td colspan="6" style="color:var(--text-dim)">暂无激活积分包记录</td></tr>';
      document.getElementById('packsModal').classList.remove('hidden');
    }

    async function startOAuth(realm) {
      const res = await api('/oauth/start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ realm }) });
      if (!res.ok) return toast('发起失败: ' + res.error);
      document.getElementById('oauthTitle').textContent = (realm === 'global' ? '国际版 WorkBuddy AI' : '国内版 CodeBuddy') + ' OAuth 登录';
      document.getElementById('oauthLink').href = res.url; document.getElementById('oauthLink').textContent = res.url;
      document.getElementById('oauthModal').classList.remove('hidden');
      window.open(res.url, '_blank');
      if (oauthPollTimer) clearInterval(oauthPollTimer);
      oauthPollTimer = setInterval(async () => {
        const poll = await api('/oauth/poll', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ realm, state: res.state }) });
        if (poll.success) {
          clearInterval(oauthPollTimer); oauthPollTimer = null;
          closeModal('oauthModal'); toast('登录成功: ' + (poll.account?.account?.nickname || '新账号')); loadStatus(true);
        }
      }, 2000);
    }
    function closeOAuthModal() { if (oauthPollTimer) clearInterval(oauthPollTimer); oauthPollTimer = null; closeModal('oauthModal'); }
    function openImportModal() { document.getElementById('importResultBox').classList.add('hidden'); document.getElementById('importModal').classList.remove('hidden'); }
    async function submitImport() {
      const realm = document.getElementById('importRealm').value;
      const fileEl = document.getElementById('importFileInput');
      let payload = { defaultRealm: realm, content: document.getElementById('importTextarea').value };
      if (fileEl.files && fileEl.files[0]) {
        const bytes = new Uint8Array(await fileEl.files[0].arrayBuffer());
        let bin = ''; for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
        payload = { defaultRealm: realm, base64Zip: btoa(bin) };
      }
      const res = await api('/accounts/import', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const box = document.getElementById('importResultBox'); box.textContent = JSON.stringify(res, null, 2); box.classList.remove('hidden');
      toast('导入完成: 新增 ' + res.imported + ' / 更新 ' + res.updated + ' / 失败 ' + res.failed); loadStatus(true);
    }
    function exportZip() { window.location.href = API + '/accounts/export.zip'; }

    async function loadWelfareAndInvite() {
      const uid = document.getElementById('welfareUidSelect').value || state.activeUid; if (!uid) return;
      const [tr, gr, inv] = await Promise.all([
        api('/travel/status?uid=' + encodeURIComponent(uid)),
        api('/growth/status?uid=' + encodeURIComponent(uid)),
        api('/invite/info?uid=' + encodeURIComponent(uid))
      ]);
      document.getElementById('travelBox').textContent = tr.ok ? '猫猫: ' + (tr.buddy?.name || '未领养') + ' | 状态: ' + (tr.travel?.state || '未知') + ' | 奖励: ' + (tr.travel?.reward_credit || 0) : (tr.message || '仅国内版支持猫猫旅行');
      document.getElementById('inviteBox').innerHTML = inv.ok ? '邀请码: <strong style="color:var(--cyan)">' + escapeHtml(inv.info.inviteCode || '暂未分配') + '</strong> | 链接: ' + (inv.info.inviteUrl ? '<a style="color:var(--emerald)" target="_blank" href="' + inv.info.inviteUrl + '">' + escapeHtml(inv.info.inviteUrl) + '</a>' : '-') + ' | 已邀 ' + inv.info.invitedCount + ' 人 · 奖 ' + (inv.info.rewardCredit || 0) : '无法获取邀请信息';
      document.getElementById('welfareLog').textContent = JSON.stringify({ streak: gr.streak, chances: gr.chances }, null, 2);
    }
    async function departTravel() { const uid = document.getElementById('welfareUidSelect').value || state.activeUid; const res = await api('/travel/depart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid }) }); document.getElementById('welfareLog').textContent = JSON.stringify(res, null, 2); loadWelfareAndInvite(); }
    async function batchRunTravel() { const res = await api('/travel/run-all', { method: 'POST' }); document.getElementById('welfareLog').textContent = JSON.stringify(res, null, 2); toast('巡检完成'); loadStatus(true); }
    async function batchClaimAll() { const res = await api('/growth/claim-all', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ all: true }) }); document.getElementById('welfareLog').textContent = JSON.stringify(res, null, 2); toast('全号福利完成'); loadStatus(true); }
    async function singleCheckin() { const uid = document.getElementById('welfareUidSelect').value || state.activeUid; const res = await api('/checkin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid }) }); document.getElementById('welfareLog').textContent = JSON.stringify(res, null, 2); toast(res.message || '签到完成'); loadStatus(true); }
    async function drawLottery() { const uid = document.getElementById('welfareUidSelect').value || state.activeUid; const res = await api('/growth/lottery/draw', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid }) }); document.getElementById('welfareLog').textContent = JSON.stringify(res, null, 2); loadWelfareAndInvite(); }
    async function bindInvite() { const uid = document.getElementById('welfareUidSelect').value || state.activeUid; const inviteCode = document.getElementById('bindInviteInput').value.trim(); const res = await api('/invite/bind', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid, inviteCode }) }); toast(res.message || '完成'); document.getElementById('welfareLog').textContent = JSON.stringify(res, null, 2); }

    async function loadTasks() {
      const uid = document.getElementById('tasksUidSelect').value || state.activeUid; if (!uid) return;
      const res = await api('/tasks/list?uid=' + encodeURIComponent(uid));
      const listEl = document.getElementById('tasksList');
      if (!res.ok) { listEl.innerHTML = '<div style="color:var(--magenta)">' + escapeHtml(res.message || '加载失败') + '</div>'; return; }
      const items = res.tasks || [];
      document.getElementById('tasksSummary').textContent = '共 ' + items.length + ' 项任务';
      listEl.innerHTML = items.map(t => '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e2e8f0;font-size:12px"><div><strong>' + escapeHtml(t.name || t.title || t.code) + '</strong> <span style="color:var(--text-dim)">(' + escapeHtml(t.code || '') + ')</span></div><div><span class="tag ' + (t.claimed ? 'tag-cn' : t.completed ? 'tag-warn' : 'tag-err') + '">' + (t.claimed ? '已领奖' : t.completed ? '待领取' : '待触发') + '</span></div></div>').join('') || '<div class="sub-row">当前账号暂无可查询成长任务</div>';
    }
    async function runTasks(all) { const uid = document.getElementById('tasksUidSelect').value || state.activeUid; toast('正在执行成长任务...'); await api('/tasks/run', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid, all }) }); toast('任务完成'); loadTasks(); loadStatus(true); }

    function rateBadgeHtml(m) {
      const rate = m?.rate || '-';
      const mul = typeof m?.multiplier === 'number' ? m.multiplier : null;
      let cls = 'tag-global';
      if (m?.isFree || mul === 0) cls = 'tag-cn';
      else if (mul !== null && mul > 3.0) cls = 'tag-err';
      else if (mul !== null && mul > 1.0) cls = 'tag-warn';
      const label = (m?.isFree || mul === 0) ? ('免费 ' + rate) : rate;
      const extraBadge = m?.badge ? ' <span class="tag tag-err">' + escapeHtml(m.badge) + '</span>' : '';
      return '<span class="tag ' + cls + '">' + escapeHtml(label) + '</span>' + extraBadge;
    }

    async function loadModels() {
      const res = await api('/models'); if (!res.ok) return;
      state.models = res.models || []; state.enabledModels = res.enabledModels || [];
      state.aliases = res.aliases || {}; state.freeModels = res.freeModels || [];
      state.modelRoutes = res.modelRoutes || {}; state.autoFreeEnabled = res.autoFreeEnabled !== false;
      document.getElementById('autoFreeToggle').checked = state.autoFreeEnabled;
      document.getElementById('freeModelsInput').value = state.freeModels.join(', ');
      document.getElementById('modelRoutesTextarea').value = JSON.stringify(state.modelRoutes, null, 2);
      document.getElementById('aliasesTextarea').value = JSON.stringify(state.aliases, null, 2);
      renderModelsTable();
      const pgSel = document.getElementById('pgModelSelect');
      if (pgSel) {
        const cur = pgSel.value;
        pgSel.innerHTML = state.models.map(m => '<option value="' + escapeHtml(m.id) + '">' + escapeHtml(m.id) + ' [' + escapeHtml(m.rate || '-') + ']</option>').join('');
        if (cur) pgSel.value = cur;
      }
    }

    function testModelInPlayground(modelId) { switchTab('playground'); const sel = document.getElementById('pgModelSelect'); if (sel) sel.value = modelId; }
    async function quickPingModel(modelId) {
      toast('正在测速 ' + modelId + ' ...');
      const t0 = Date.now();
      const res = await fetch(API + '/playground/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: modelId, stream: false, max_tokens: 32, messages: [{ role: 'user', content: 'Say OK' }] })
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) toast('✅ ' + modelId + ' 连通 (' + (Date.now() - t0) + 'ms)');
      else toast('❌ ' + modelId + ' 失败: ' + (json.error?.message || res.status));
    }

    function renderModelsTable() {
      const q = (document.getElementById('modelSearch').value || '').toLowerCase();
      const mode = document.getElementById('modelFilterMode').value || 'all';
      const enabledSet = new Set(state.enabledModels);
      const filtered = state.models.filter(m => {
        if (q && !(m.id.toLowerCase().includes(q) || (m.name||'').toLowerCase().includes(q))) return false;
        if (mode === 'free' && !m.isFree && m.multiplier !== 0) return false;
        if (mode === 'low' && (m.multiplier === null || m.multiplier === undefined || m.multiplier > 0.2)) return false;
        if (mode === 'cn' && m.realm !== 'cn') return false;
        if (mode === 'global' && m.realm !== 'global') return false;
        if (mode === 'reasoning' && !m.supportsReasoning && !(m.supportedEfforts && m.supportedEfforts.length)) return false;
        return true;
      });
      document.getElementById('modelCountLabel').textContent = '显示 ' + filtered.length + ' / 共 ' + state.models.length + ' 个模型';
      document.getElementById('modelsTbody').innerHTML = filtered.map(m => {
        const caps = [];
        if (m.supportsImages) caps.push('视觉');
        if (m.supportsReasoning || (m.supportedEfforts && m.supportedEfforts.length)) caps.push('思考');
        if (m.supportsToolCall) caps.push('工具');
        return '<tr><td><input type="checkbox" class="model-chk" value="' + escapeHtml(m.id) + '" ' + (enabledSet.has(m.id) ? 'checked' : '') + ' /></td>' +
          '<td><strong>' + escapeHtml(m.id) + '</strong><br><span style="color:var(--text-dim);font-size:11px">' + escapeHtml(m.description || m.name || '') + '</span></td>' +
          '<td>' + rateBadgeHtml(m) + '</td><td style="font-size:11px">' + (caps.join(' · ') || '文本') + '</td>' +
          '<td><span class="tag ' + (m.realm === 'cn' ? 'tag-cn' : 'tag-global') + '">' + escapeHtml(m.realm) + '</span></td>' +
          '<td>' + Math.round((m.contextWindow || 0) / 1000) + 'k / ' + Math.round((m.maxTokens || 0) / 1000) + 'k</td>' +
          '<td style="display:flex;gap:4px"><button class="btn btn-sm" onclick="quickPingModel(\\'' + escapeHtml(m.id) + '\\')">⚡测</button><button class="btn btn-sm" onclick="testModelInPlayground(\\'' + escapeHtml(m.id) + '\\')">试跑</button></td></tr>';
      }).join('');
    }

    async function discoverModels() { toast('正在发现上游最新模型...'); const res = await api('/models/discover', { method: 'POST' }); toast('完成，共 ' + (res.models?.length || 0) + ' 个'); loadModels(); }
    async function saveModelsConfig() {
      const enabledModels = Array.from(document.querySelectorAll('.model-chk:checked')).map(el => el.value);
      const freeModels = document.getElementById('freeModelsInput').value.split(',').map(s => s.trim()).filter(Boolean);
      const autoFreeEnabled = document.getElementById('autoFreeToggle').checked;
      let aliases, modelRoutes;
      try { aliases = JSON.parse(document.getElementById('aliasesTextarea').value || '{}'); modelRoutes = JSON.parse(document.getElementById('modelRoutesTextarea').value || '{}'); }
      catch (e) { return toast('JSON 格式错误: ' + e.message); }
      await api('/models', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enabledModels, aliases, modelRoutes, freeModels, autoFreeEnabled }) });
      toast('模型路由、过滤与别名已保存'); loadModels();
    }

    async function loadLogs() {
      const res = await api('/logs'); if (!res.ok) return;
      const inFlight = res.inFlight || [];
      document.getElementById('inFlightBox').innerHTML = inFlight.length > 0 ? inFlight.map(r => '<span class="tag tag-warn">[' + escapeHtml(r.model) + ' ' + escapeHtml(r.rate) + '] ' + escapeHtml(r.nickname) + ' (' + Math.round(r.elapsedMs / 1000) + 's)</span>').join(' ') : '当前无在途请求（并发空闲）';
      const logs = res.logs || [];
      document.getElementById('logsTbody').innerHTML = logs.map(l =>
        '<tr><td>' + escapeHtml(l.time) + '</td><td><strong>' + escapeHtml(l.model) + '</strong><br><span style="font-size:10px;color:var(--text-dim)">' + escapeHtml(l.protocol + '/' + l.mode) + '</span></td><td><span class="tag tag-global">' + escapeHtml(l.rate || '-') + '</span></td><td>' + escapeHtml(l.account || l.uid) + '</td><td><span class="tag ' + (l.status >= 400 ? 'tag-err' : 'tag-cn') + '">' + l.status + '</span></td><td>' + (l.ttfbMs ? l.ttfbMs + 'ms / ' : '') + l.totalTokens + ' tok' + (l.tokensPerSec ? ' / ' + l.tokensPerSec + ' t/s' : '') + '</td><td>' + (l.credit !== null && l.credit !== undefined ? ('-' + l.credit) : '-') + '</td></tr>'
      ).join('') || '<tr><td colspan="7" style="color:var(--text-dim)">暂无请求流水记录</td></tr>';
    }

    function handlePgFile(ev) {
      const file = ev.target.files?.[0]; if (!file) return;
      const badge = document.getElementById('pgAttachBadge');
      const clr = document.getElementById('pgAttachClear');
      const reader = new FileReader();
      if (file.type.startsWith('image/')) {
        reader.onload = () => { pgAttachment = { kind: 'image', name: file.name, data: reader.result }; badge.textContent = '📷 ' + file.name; badge.classList.remove('hidden'); clr.classList.remove('hidden'); };
        reader.readAsDataURL(file);
      } else {
        reader.onload = () => { pgAttachment = { kind: 'text', name: file.name, data: String(reader.result || '').slice(0, 32000) }; badge.textContent = '📄 ' + file.name; badge.classList.remove('hidden'); clr.classList.remove('hidden'); };
        reader.readAsText(file);
      }
    }
    function clearPgAttachment() { pgAttachment = null; document.getElementById('pgFileInput').value = ''; document.getElementById('pgAttachBadge').classList.add('hidden'); document.getElementById('pgAttachClear').classList.add('hidden'); }

    async function runPlayground() {
      const model = document.getElementById('pgModelSelect').value || 'auto-free';
      const effort = document.getElementById('pgEffortSelect').value;
      const prompt = document.getElementById('pgPromptInput').value.trim() || '你好，请用一句话介绍你自己';
      const stream = document.getElementById('pgStreamChk').checked;
      const outEl = document.getElementById('pgOutputBox'); const badge = document.getElementById('pgStatsBadge');
      outEl.textContent = '⏳ 正在请求 ' + model + ' ...'; badge.textContent = '请求中...';

      let contentPayload = prompt;
      if (pgAttachment?.kind === 'image') {
        contentPayload = [{ type: 'text', text: prompt }, { type: 'image_url', image_url: { url: pgAttachment.data } }];
      } else if (pgAttachment?.kind === 'text') {
        contentPayload = prompt + '\\n\\n[附件: ' + pgAttachment.name + ']\\n' + pgAttachment.data;
      }

      const body = { model, stream, messages: [{ role: 'user', content: contentPayload }] };
      if (effort) body.reasoning_effort = effort;
      const t0 = Date.now(); let firstTokenMs = 0;

      const res = await fetch(API + '/playground/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) { outEl.textContent = '❌ HTTP ' + res.status + ': ' + await res.text(); badge.textContent = '失败 ' + res.status; loadLogs(); return; }
      if (stream) {
        outEl.textContent = ''; const reader = res.body.getReader(); const dec = new TextDecoder();
        let buf = '', acc = '', reasoning = '', usage = null;
        while (true) {
          const { done, value } = await reader.read(); if (done) break;
          buf += dec.decode(value, { stream: true }).replace(/\\r\\n/g, '\\n');
          let idx;
          while ((idx = buf.indexOf('\\n\\n')) !== -1) {
            const frame = buf.slice(0, idx); buf = buf.slice(idx + 2);
            for (const line of frame.split('\\n')) {
              if (!line.startsWith('data:')) continue;
              const d = line.slice(5).trim(); if (!d || d === '[DONE]') continue;
              try {
                const p = JSON.parse(d); if (p.usage) usage = p.usage;
                const delta = p.choices?.[0]?.delta || {};
                if (delta.reasoning_content) { if (!firstTokenMs) firstTokenMs = Date.now() - t0; reasoning += delta.reasoning_content; }
                if (delta.content) { if (!firstTokenMs) firstTokenMs = Date.now() - t0; acc += delta.content; }
                outEl.textContent = (reasoning ? '[思考过程]\\n' + reasoning + '\\n\\n[回答正文]\\n' : '') + acc;
              } catch (_) {}
            }
          }
        }
        badge.textContent = 'TTFB ' + (firstTokenMs || (Date.now()-t0)) + 'ms | 总耗时 ' + (Date.now()-t0) + 'ms | Tok ' + (usage?.total_tokens || '-');
      } else {
        const json = await res.json(); const msg = json.choices?.[0]?.message || {};
        outEl.textContent = (msg.reasoning_content ? '[思考过程]\\n' + msg.reasoning_content + '\\n\\n[回答正文]\\n' : '') + (msg.content || JSON.stringify(json, null, 2));
        badge.textContent = '耗时 ' + (Date.now()-t0) + 'ms | Tok ' + (json.usage?.total_tokens || '-');
      }
      loadLogs();
    }

    async function loadUsage(dateStr = '') {
      const selEl = document.getElementById('usageDateSelect');
      const targetDate = dateStr || selEl?.value || '';
      const res = await api('/usage' + (targetDate ? '?date=' + encodeURIComponent(targetDate) : ''));
      if (!res.ok) return;
      const st = res.stats;
      if (selEl && Array.isArray(st.availableDates)) {
        selEl.innerHTML = st.availableDates.map(d => '<option value="' + d + '" ' + (d === st.activeDate ? 'selected' : '') + '>' + d + '</option>').join('');
      }
      document.getElementById('usageSummaryCards').innerHTML = [
        { title: (st.activeDate || '今日') + ' 请求 / 总请求', kpi: st.today.requests + ' / ' + st.summary.totalRequests, sub: '当日扣费 ' + (st.today.credit || 0) + ' 积分', cls: '' },
        { title: '当日输入 / 输出 Tokens', kpi: (st.today.totalTokens || 0).toLocaleString(), sub: '入 ' + st.today.inputTokens.toLocaleString() + ' / 出 ' + st.today.outputTokens.toLocaleString(), cls: 'green' },
        { title: '历史累计消耗积分', kpi: Number(st.summary.totalCredit || 0).toFixed(2), sub: '总成功 ' + (st.summary.totalSuccess || 0) + ' / 失败 ' + (st.summary.totalFailed || 0), cls: 'pink' }
      ].map(c => '<div class="card" style="margin:0"><div class="card-title"><span>' + c.title + '</span></div><div class="kpi ' + c.cls + '">' + c.kpi + '</div><div class="sub-row">' + c.sub + '</div></div>').join('');
      const max7 = Math.max(1, ...st.trend7d.map(d => d.tokens));
      document.getElementById('chart7d').innerHTML = st.trend7d.map(d => '<div class="bar-col" title="' + d.date + ': ' + d.tokens + ' tok"><div class="bar-fill" style="height:' + Math.max(4, Math.round(d.tokens / max7 * 90)) + '%"></div><div class="bar-lbl">' + d.date + '</div></div>').join('');
      const max24 = Math.max(1, ...st.hourly.map(h => h.tokens));
      document.getElementById('chart24h').innerHTML = st.hourly.map(h => '<div class="bar-col" title="' + h.hour + ': ' + h.tokens + ' tok"><div class="bar-fill" style="height:' + Math.max(3, Math.round(h.tokens / max24 * 90)) + '%"></div><div class="bar-lbl">' + h.hour.replace('时','') + '</div></div>').join('');
      document.getElementById('usageModelsTbody').innerHTML = (st.modelBreakdown || []).map(r =>
        '<tr><td><strong>' + escapeHtml(r.model) + '</strong></td><td>' + rateBadgeHtml(r) + '</td><td>' + r.requests + ' (' + r.success + '/' + r.failed + ')</td><td>' + r.inputTokens.toLocaleString() + ' / ' + r.outputTokens.toLocaleString() + '</td><td>' + (r.cacheHitRate || 0) + '%</td><td style="font-weight:700;color:var(--cyan)">' + (r.credit || 0) + '</td><td>' + (r.creditPerReq || 0) + ' / ' + (r.costPer1k || 0) + '</td><td>' + (r.avgTtfbMs || 0) + 'ms / ' + (r.tokensPerSec || 0) + ' t/s</td></tr>'
      ).join('') || '<tr><td colspan="8">尚无模型消耗记录</td></tr>';
    }
    async function resetUsage() { if (!confirm('确认清空全部统计账本吗？')) return; await api('/stats/reset', { method: 'POST' }); toast('已清空'); loadUsage(); }

    function renderSettings() {
      const c = state.config || {};
      document.getElementById('cfgApiKey').value = c.apiKey || '';
      document.getElementById('cfgProxy').value = c.proxy || '';
      document.getElementById('cfgMaxCN').value = c.maxInFlightCN || 3;
      document.getElementById('cfgMaxGlobal').value = c.maxInFlightGlobal || 2;
      document.getElementById('cfgQueueTimeout').value = c.queueTimeoutMs ?? 60000;
      document.getElementById('cfgIdleTimeout').value = c.streamIdleTimeoutMs ?? 90000;
      document.getElementById('cfgPromptMode').value = c.promptMode || 'none';
      document.getElementById('cfgDeviceToken').value = c.deviceTokenPath || '';
      document.getElementById('cfgPromptText').value = c.promptText || '';
      document.getElementById('cfgAutoCheckin').checked = c.autoCheckin !== false;
      document.getElementById('cfgAutoTravel').checked = c.autoTravel !== false;
      document.getElementById('cfgAutoTasks').checked = c.autoTasks !== false;
      document.getElementById('cfgAutoRefresh').checked = c.autoRefreshToken !== false;
      document.getElementById('cfgPortalHome').checked = Boolean(c.portalAsHome);

      const sch = c.schedule || {};
      document.getElementById('schCheckin').value = (sch.checkinHours || [9,21]).join(', ');
      document.getElementById('schTravel').value = (sch.travelHours || [9,21]).join(', ');
      document.getElementById('schTasks').value = (sch.tasksHours || [11]).join(', ');
      document.getElementById('schKeepalive').value = (sch.keepaliveHours || [22]).join(', ');

      document.getElementById('pwStatusBadge').textContent = state.auth?.hasPassword ? '已开启密码锁定' : '免密单机模式';
      document.getElementById('pwStatusBadge').className = 'tag ' + (state.auth?.hasPassword ? 'tag-warn' : 'tag-cn');

      const wl = c.ipWhitelist || {};
      document.getElementById('ipWlEnabled').checked = Boolean(wl.enabled);
      document.getElementById('ipWlLocal').checked = wl.allowLocalhost !== false;
      document.getElementById('ipWlList').value = (wl.allowedIPs || []).join('\\n');
      const net = state.runtimeNetwork || {};
      document.getElementById('ipRuntimeInfo').textContent = '当前来访 IP: ' + (net.clientIP || '-') + ' | 本机网卡: ' + ((net.detectedIPs || []).join(', ') || '-');

      const al = c.alerts || {};
      document.getElementById('alertEnabled').checked = Boolean(al.enabled);
      document.getElementById('alertMinCredit').value = al.minCredit ?? 50;
      document.getElementById('alertHooks').value = (al.webhooks || []).join('\\n');
      const evSet = new Set(al.events || ['ban','401','cooling','low_credit']);
      document.querySelectorAll('.alert-evt').forEach(el => { el.checked = evSet.has(el.value); });

      const base = window.location.origin;
      document.getElementById('guideCode').textContent =
        'OpenAI Base URL  : ' + base + '/v1\\nAnthropic Base   : ' + base + '\\nResponses API    : ' + base + '/v1/responses\\nVideos API       : ' + base + '/v1/videos/generations\\nHealthz / Status : ' + base + '/healthz , ' + base + '/status';
    }

    async function saveConfig() {
      const payload = {
        apiKey: document.getElementById('cfgApiKey').value.trim(),
        proxy: document.getElementById('cfgProxy').value.trim(),
        maxInFlightCN: Number(document.getElementById('cfgMaxCN').value) || 3,
        maxInFlightGlobal: Number(document.getElementById('cfgMaxGlobal').value) || 2,
        queueTimeoutMs: Number(document.getElementById('cfgQueueTimeout').value) || 0,
        streamIdleTimeoutMs: Number(document.getElementById('cfgIdleTimeout').value) || 90000,
        promptMode: document.getElementById('cfgPromptMode').value,
        deviceTokenPath: document.getElementById('cfgDeviceToken').value.trim(),
        promptText: document.getElementById('cfgPromptText').value,
        autoCheckin: document.getElementById('cfgAutoCheckin').checked,
        autoTravel: document.getElementById('cfgAutoTravel').checked,
        autoTasks: document.getElementById('cfgAutoTasks').checked,
        autoRefreshToken: document.getElementById('cfgAutoRefresh').checked,
        portalAsHome: document.getElementById('cfgPortalHome').checked
      };
      const res = await api('/config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      state.config = res.config || payload;
      toast('核心参数已保存并即时生效');
    }

    async function saveScheduleConfig() {
      const parseHrs = id => document.getElementById(id).value.split(',').map(s => Number(s.trim())).filter(n => Number.isInteger(n) && n >= 0 && n <= 23);
      const res = await api('/config/schedule', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schedule: {
            checkinHours: parseHrs('schCheckin'),
            travelHours: parseHrs('schTravel'),
            tasksHours: parseHrs('schTasks'),
            keepaliveHours: parseHrs('schKeepalive')
          }
        })
      });
      toast(res.message || '排程已保存');
    }

    async function saveWebPassword() {
      const password = document.getElementById('cfgWebPassword').value;
      const res = await api('/config/password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
      toast(res.message || '完成');
      loadStatus();
    }

    function addClientIP() {
      const ip = state.runtimeNetwork?.clientIP; if (!ip) return;
      const el = document.getElementById('ipWlList');
      const cur = el.value.split(/[\\r\\n,;]+/).map(s => s.trim()).filter(Boolean);
      if (!cur.includes(ip)) cur.push(ip);
      el.value = cur.join('\\n');
    }
    async function saveIPWhitelist() {
      const allowedIPs = document.getElementById('ipWlList').value.split(/[\\r\\n,;]+/).map(s => s.trim()).filter(Boolean);
      const res = await api('/config/ip_whitelist', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: document.getElementById('ipWlEnabled').checked, allowLocalhost: document.getElementById('ipWlLocal').checked, allowedIPs })
      });
      toast(res.message || res.error);
    }

    async function saveAlerts() {
      const events = Array.from(document.querySelectorAll('.alert-evt:checked')).map(x => x.value);
      const res = await api('/config/alerts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: document.getElementById('alertEnabled').checked,
          minCredit: Number(document.getElementById('alertMinCredit').value || 50),
          webhooksText: document.getElementById('alertHooks').value,
          events
        })
      });
      toast(res.message || '告警已保存');
    }
    async function testAlerts() { const res = await api('/config/alerts/test', { method: 'POST' }); toast(res.message || res.error); }

    async function checkUpdate() {
      document.getElementById('updateInfoSpan').textContent = '正在检查 GitHub 版本...';
      const res = await api('/system/update/check');
      if (!res.ok) document.getElementById('updateInfoSpan').textContent = res.error || '检查失败';
      else document.getElementById('updateInfoSpan').innerHTML = '当前 v' + escapeHtml(res.currentVersion) + ' · 最新 <strong>' + escapeHtml(res.latestVersion) + '</strong> ' + (res.hasUpdate ? '<span class="tag tag-warn">有新版本</span>' : '<span class="tag tag-cn">已是最新</span>');
    }

    async function loadAdminUsers() {
      const res = await api('/admin/users'); if (!res.ok) return;
      document.getElementById('allowRegChk').checked = Boolean(res.allowRegister);
      document.getElementById('adminUsersTbody').innerHTML = (res.users || []).map(u =>
        '<tr><td><strong>' + escapeHtml(u.username) + '</strong></td><td>' + u.role + '</td><td style="font-family:monospace;font-size:11px">' + escapeHtml(u.apiKey) + '</td><td>' + (u.usedCreditToday||0) + ' / ' + (u.dailyCreditLimit || '不限') + '</td><td>' + (u.rpm || '不限') + '</td><td><span class="tag ' + (u.disabled ? 'tag-err' : 'tag-cn') + '">' + (u.disabled ? '禁用' : '正常') + '</span></td>' +
        '<td style="display:flex;gap:4px;flex-wrap:wrap">' +
          '<button class="btn btn-sm" onclick="adminResetKey(\\'' + u.username + '\\')">重置Key</button>' +
          '<button class="btn btn-sm" onclick="adminSetQuota(\\'' + u.username + '\\')">配额</button>' +
          (u.username !== 'admin' ? '<button class="btn btn-sm btn-amber" onclick="adminToggleUser(\\'' + u.username + '\\',' + (!u.disabled) + ')">' + (u.disabled ? '启用' : '禁用') + '</button><button class="btn btn-sm btn-pink" onclick="adminDeleteUser(\\'' + u.username + '\\')">删</button>' : '') +
        '</td></tr>'
      ).join('');
    }
    async function createTenantUser() {
      const res = await api('/admin/users/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: document.getElementById('newUserName').value.trim(), password: document.getElementById('newUserPass').value, role: document.getElementById('newUserRole').value, dailyCreditLimit: Number(document.getElementById('newUserQuota').value || 0), rpm: Number(document.getElementById('newUserRpm').value || 0) }) });
      toast(res.ok ? '租户创建成功' : (res.error || '失败')); loadAdminUsers();
    }
    async function adminToggleUser(username, disabled) { await api('/admin/users/toggle', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, disabled }) }); loadAdminUsers(); }
    async function adminResetKey(username) { await api('/admin/users/reset_key', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username }) }); toast('Key 已重置'); loadAdminUsers(); }
    async function adminDeleteUser(username) { if (!confirm('删除用户 ' + username + ' ?')) return; await api('/admin/users/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username }) }); loadAdminUsers(); }
    async function adminSetQuota(username) {
      const q = prompt('输入每日积分上限 (0 表示不限):', '100'); if (q === null) return;
      const r = prompt('输入每分钟请求 RPM 上限 (0 表示不限):', '30'); if (r === null) return;
      await api('/admin/users/quota', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, dailyCreditLimit: Number(q), rpm: Number(r) }) });
      loadAdminUsers();
    }
    async function toggleAllowRegister(val) { await api('/admin/system/allow_register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ allowRegister: val }) }); }

    async function checkDsh() {
      const box = document.getElementById('dshCheckBox');
      const res = await api('/dsh/check');
      if (!res.ok) { box.textContent = '检测失败'; return; }
      box.innerHTML = '插件安装: <span class="tag ' + (res.installedInProfile ? 'tag-cn' : 'tag-err') + '">' + (res.installedInProfile ? '已安装' : '未注册') + '</span> | Patch baseURL: <span class="tag ' + (res.baseUrlMatched ? 'tag-cn' : 'tag-warn') + '">' + (res.baseUrlMatched ? '已对齐 (' + escapeHtml(res.expectedBaseUrl) + ')' : '未对齐') + '</span>';
    }
    async function syncDsh() { const res = await api('/dsh/sync', { method: 'POST' }); toast(res.message || '完成'); checkDsh(); }

    loadStatus(false);
    setInterval(() => loadStatus(false), 30000);
  </script>
</body>
</html>`;
}

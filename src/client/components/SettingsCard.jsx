/**
 * SettingsCard.jsx - DSH WorkBuddy2API 6 标签页综合管理控制台
 */

import React, { useState, useEffect, useRef } from 'react';

function uint8ToBase64(bytes) {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

export function SettingsCard({ t }) {
  const [tab, setTab] = useState('accounts');
  const [status, setStatus] = useState(null);
  const [usage, setUsage] = useState(null);
  const [modelsData, setModelsData] = useState({ models: [], enabledModels: [], aliases: {}, freeModels: [] });
  const [loading, setLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  // 单号快速粘贴添加
  const [newToken, setNewToken] = useState('');
  const [newRealm, setNewRealm] = useState('global');
  const [newNickname, setNewNickname] = useState('');

  // 批量 / ZIP 导入弹窗
  const [importOpen, setImportOpen] = useState(false);
  const [importRealm, setImportRealm] = useState('global');
  const [importContent, setImportContent] = useState('');
  const [importFileBuf, setImportFileBuf] = useState(null);
  const [importResult, setImportResult] = useState(null);

  // OAuth 弹窗
  const [oauthModal, setOauthModal] = useState(null); // { realm, state, url, notice }
  const oauthTimerRef = useRef(null);

  // 福利 / 猫猫 / 邀请 / 成长任务 / 开学季
  const [selectedUid, setSelectedUid] = useState('');
  const [travelData, setTravelData] = useState(null);
  const [travelLoc, setTravelLoc] = useState(4);
  const [growthData, setGrowthData] = useState(null);
  const [inviteInfo, setInviteInfo] = useState(null);
  const [bindCodeInput, setBindCodeInput] = useState('');
  const [tasksList, setTasksList] = useState([]);
  const [schoolData, setSchoolData] = useState(null);
  const [schoolResult, setSchoolResult] = useState(null);
  const [welfareResult, setWelfareResult] = useState(null); // { title, badge, items: [{ label, ok, detail, gain }] }
  const [activityLogs, setActivityLogs] = useState([]);

  // 模型管理与倍率筛选
  const [modelSearch, setModelSearch] = useState('');
  const [modelFilter, setModelFilter] = useState('all');
  const [aliasesMap, setAliasesMap] = useState({});
  const [modelRoutesMap, setModelRoutesMap] = useState({});
  const [aliasesDraft, setAliasesDraft] = useState('{}');
  const [modelRoutesDraft, setModelRoutesDraft] = useState('{}');
  const [newRouteName, setNewRouteName] = useState('');
  const [newRouteTargets, setNewRouteTargets] = useState('');
  const [newAliasFrom, setNewAliasFrom] = useState('');
  const [newAliasTo, setNewAliasTo] = useState('');
  const [autoFreeDraft, setAutoFreeDraft] = useState(true);
  const [freeModelsDraft, setFreeModelsDraft] = useState('global:hy4free, cn:hy4free');

  // 积分包明细弹窗 / 换 Token 弹窗 / 在线调试与安全管理
  const [packsModalAcc, setPacksModalAcc] = useState(null);
  const [updTokenModal, setUpdTokenModal] = useState(null);
  const [liveLogs, setLiveLogs] = useState([]);
  const [inFlightList, setInFlightList] = useState([]);
  const [pgModel, setPgModel] = useState('auto-free');
  const [pgEffort, setPgEffort] = useState('');
  const [pgPrompt, setPgPrompt] = useState('你好，请用一句话自我介绍');
  const [pgAttach, setPgAttach] = useState(null);
  const [pgOutput, setPgOutput] = useState('等待发送测试请求...');
  const [pgMetrics, setPgMetrics] = useState('');
  const [pgRunning, setPgRunning] = useState(false);
  const [dshInfo, setDshInfo] = useState(null);
  const [usageDate, setUsageDate] = useState('');
  const [updateInfo, setUpdateInfo] = useState(null);

  // 网关设置 / 安全 / 告警 / 排程 / 多租户表单
  const [cfgDraft, setCfgDraft] = useState({
    apiKey: '',
    proxy: '',
    maxInFlightCN: 3,
    maxInFlightGlobal: 2,
    queueTimeoutMs: 60000,
    streamIdleTimeoutMs: 90000,
    deviceTokenPath: '',
    portalAsHome: false,
    promptMode: 'none',
    promptText: '',
    autoCheckin: true,
    autoTravel: true,
    autoTasks: true,
    autoRefreshToken: true
  });
  const [webPasswordDraft, setWebPasswordDraft] = useState('');
  const [ipWlDraft, setIpWlDraft] = useState({ enabled: false, allowLocalhost: true, text: '' });
  const [alertsDraft, setAlertsDraft] = useState({ enabled: false, minCredit: 50, webhooksText: '', events: ['ban', '401', 'cooling', 'low_credit'] });
  const [schedDraft, setSchedDraft] = useState({ checkin: '9, 21', travel: '9, 21', tasks: '11', school: '12', cat: '1', keepalive: '22' });
  const [usersList, setUsersList] = useState([]);
  const [newUserDraft, setNewUserDraft] = useState({ username: '', password: '', role: 'user', dailyCreditLimit: 0, rpm: 0 });

  const notifyBalanceUpdate = () => {
    try {
      window.dispatchEvent(new CustomEvent('wb2a:refresh-balance'));
    } catch (_) {}
  };

  const appendLog = (msg) => {
    setActivityLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 29)]);
  };

  const fetchStatus = async (refresh = false) => {
    try {
      const res = await fetch(`/plugins/dsh-workbuddy2api/status${refresh ? '?refresh=1' : ''}`);
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
        if (!selectedUid && data.activeUid) {
          setSelectedUid(data.activeUid);
        }
        if (data.config) {
          setCfgDraft((prev) => ({ ...prev, ...data.config }));
          const wl = data.config.ipWhitelist || {};
          setIpWlDraft({ enabled: Boolean(wl.enabled), allowLocalhost: wl.allowLocalhost !== false, text: (wl.allowedIPs || []).join('\n') });
          const al = data.config.alerts || {};
          setAlertsDraft({
            enabled: Boolean(al.enabled),
            minCredit: al.minCredit ?? 50,
            webhooksText: (al.webhooks || []).join('\n'),
            events: al.events || ['ban', '401', 'cooling', 'low_credit']
          });
          const sch = data.config.schedule || {};
          setSchedDraft({
            checkin: (sch.checkinHours || [9, 21]).join(', '),
            travel: (sch.travelHours || [9, 21]).join(', '),
            tasks: (sch.tasksHours || [11]).join(', '),
            school: (sch.schoolHours || [12]).join(', '),
            cat: (sch.catHours || [1]).join(', '),
            keepalive: (sch.keepaliveHours || [22]).join(', ')
          });
        }
      }
    } catch (_) {}
  };

  const fetchAdminUsers = async () => {
    try {
      const res = await fetch('/plugins/dsh-workbuddy2api/admin/users');
      if (res.ok) {
        const d = await res.json();
        setUsersList(d.users || []);
      }
    } catch (_) {}
  };

  const fetchModels = async () => {
    try {
      const res = await fetch('/plugins/dsh-workbuddy2api/models');
      if (res.ok) {
        const data = await res.json();
        setModelsData(data);
        setAliasesMap(data.aliases || {});
        setModelRoutesMap(data.modelRoutes || {});
        setAliasesDraft(JSON.stringify(data.aliases || {}, null, 2));
        setModelRoutesDraft(JSON.stringify(data.modelRoutes || {}, null, 2));
        setAutoFreeDraft(data.autoFreeEnabled !== false);
        setFreeModelsDraft((data.freeModels || ['global:hy4free', 'cn:hy4free']).join(', '));
      }
    } catch (_) {}
  };

  const fetchUsage = async (dateVal = usageDate) => {
    try {
      const res = await fetch(`/plugins/dsh-workbuddy2api/usage${dateVal ? `?date=${encodeURIComponent(dateVal)}` : ''}`);
      if (res.ok) {
        const data = await res.json();
        setUsage(data.stats);
      }
    } catch (_) {}
  };

  const fetchActivityPanel = async (uid) => {
    const target = uid || selectedUid || status?.activeUid;
    if (!target) return;
    try {
      const [trRes, grRes, invRes] = await Promise.all([
        fetch(`/plugins/dsh-workbuddy2api/travel/status?uid=${encodeURIComponent(target)}`),
        fetch(`/plugins/dsh-workbuddy2api/growth/status?uid=${encodeURIComponent(target)}`),
        fetch(`/plugins/dsh-workbuddy2api/invite/info?uid=${encodeURIComponent(target)}`)
      ]);
      if (trRes.ok) setTravelData(await trRes.json());
      if (grRes.ok) setGrowthData(await grRes.json());
      if (invRes.ok) {
        const invJson = await invRes.json();
        setInviteInfo(invJson.info || null);
      }
    } catch (_) {}
  };

  const fetchTasksPanel = async (uid) => {
    const target = uid || selectedUid || status?.activeUid;
    if (!target) return;
    try {
      const [tRes, sRes] = await Promise.all([
        fetch(`/plugins/dsh-workbuddy2api/tasks/list?uid=${encodeURIComponent(target)}`),
        fetch(`/plugins/dsh-workbuddy2api/school/status?uid=${encodeURIComponent(target)}`)
      ]);
      if (tRes.ok) {
        const data = await tRes.json();
        setTasksList(data.tasks || []);
      }
      if (sRes.ok) {
        const sData = await sRes.json();
        setSchoolData(sData.status || null);
      }
    } catch (_) {}
  };

  useEffect(() => {
    fetchStatus(false);
    fetchUsage();
    fetchModels();
    return () => {
      if (oauthTimerRef.current) clearInterval(oauthTimerRef.current);
    };
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/plugins/dsh-workbuddy2api/logs');
      if (res.ok) {
        const data = await res.json();
        setLiveLogs(data.logs || []);
        setInFlightList(data.inFlight || []);
      }
    } catch (_) {}
  };

  const fetchDshCheck = async () => {
    try {
      const res = await fetch('/plugins/dsh-workbuddy2api/dsh/check');
      if (res.ok) setDshInfo(await res.json());
    } catch (_) {}
  };

  const handlePgFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    if (file.type.startsWith('image/')) {
      reader.onload = () => setPgAttach({ kind: 'image', name: file.name, data: reader.result });
      reader.readAsDataURL(file);
    } else {
      reader.onload = () => setPgAttach({ kind: 'text', name: file.name, data: String(reader.result || '').slice(0, 32000) });
      reader.readAsText(file);
    }
  };

  const handleRunPlayground = async () => {
    setPgRunning(true);
    setPgOutput(`⏳ 正在请求 ${pgModel} ...`);
    setPgMetrics('请求中...');
    const t0 = Date.now();
    try {
      const promptText = pgPrompt.trim() || '你好';
      let contentPayload = promptText;
      if (pgAttach?.kind === 'image') {
        contentPayload = [
          { type: 'text', text: promptText },
          { type: 'image_url', image_url: { url: pgAttach.data } }
        ];
      } else if (pgAttach?.kind === 'text') {
        contentPayload = `${promptText}\n\n[附件 ${pgAttach.name}]\n${pgAttach.data}`;
      }
      const payload = {
        model: pgModel || 'auto-free',
        stream: false,
        messages: [{ role: 'user', content: contentPayload }]
      };
      if (pgEffort) payload.reasoning_effort = pgEffort;
      const res = await fetch('/plugins/dsh-workbuddy2api/playground/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!res.ok) {
        setPgOutput(`❌ HTTP ${res.status}: ${json.error?.message || JSON.stringify(json)}`);
        setPgMetrics(`失败 (${res.status})`);
      } else {
        const msg = json.choices?.[0]?.message || {};
        const u = json.usage || {};
        setPgOutput(
          `${msg.reasoning_content ? `[思考过程]\n${msg.reasoning_content}\n\n[回答正文]\n` : ''}${msg.content || JSON.stringify(json, null, 2)}`
        );
        const cr = u.credit !== undefined ? ` · 扣费 ${u.credit}` : '';
        setPgMetrics(`耗时 ${Date.now() - t0}ms · Tokens ${u.total_tokens || '-'}${cr}`);
      }
      fetchLogs();
      fetchUsage();
    } catch (e) {
      setPgOutput(`❌ 请求异常: ${e.message}`);
      setPgMetrics('异常');
    } finally {
      setPgRunning(false);
    }
  };

  useEffect(() => {
    if (tab === 'activity') fetchActivityPanel();
    if (tab === 'tasks') fetchTasksPanel();
    if (tab === 'models') fetchModels();
    if (tab === 'playground') { fetchModels(); fetchLogs(); }
    if (tab === 'usage') fetchUsage();
    if (tab === 'settings') { fetchDshCheck(); fetchAdminUsers(); }
  }, [tab, selectedUid]);

  const handleAddAccount = async () => {
    if (!newToken.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/plugins/dsh-workbuddy2api/accounts/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: newToken.trim(), realm: newRealm, nickname: newNickname.trim() })
      });
      const data = await res.json();
      setActionMsg(data.ok ? `✅ 账号添加成功: ${data.account?.account?.nickname}` : `❌ ${data.error}`);
      if (data.ok) {
        setNewToken('');
        setNewNickname('');
        await fetchStatus(true);
        notifyBalanceUpdate();
      }
    } catch (e) {
      setActionMsg(`❌ 添加异常: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminAction = async (uid, action) => {
    setLoading(true);
    try {
      const res = await fetch('/plugins/dsh-workbuddy2api/accounts/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, action })
      });
      const data = await res.json();
      setActionMsg(data.message ? `⚡ ${data.message}` : data.error || '操作完成');
      await fetchStatus(action === 'refresh' || action === 'trial');
      notifyBalanceUpdate();
    } catch (e) {
      setActionMsg(`❌ 操作失败: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStartOAuth = async (realm) => {
    setLoading(true);
    try {
      const res = await fetch('/plugins/dsh-workbuddy2api/oauth/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ realm })
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || '发起 OAuth 失败');
      setOauthModal({ realm, state: data.state, url: data.url, notice: '已打开浏览器授权页，等待回调确认...' });
      try {
        window.open(data.url, '_blank');
      } catch (_) {}

      if (oauthTimerRef.current) clearInterval(oauthTimerRef.current);
      oauthTimerRef.current = setInterval(async () => {
        try {
          const pRes = await fetch('/plugins/dsh-workbuddy2api/oauth/poll', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ realm, state: data.state })
          });
          const pData = await pRes.json();
          if (pData.success) {
            clearInterval(oauthTimerRef.current);
            oauthTimerRef.current = null;
            setOauthModal(null);
            setActionMsg(`🎉 OAuth 登录成功: ${pData.account?.account?.nickname || '新账号'}`);
            await fetchStatus(true);
            notifyBalanceUpdate();
          } else if (pData.notice) {
            setOauthModal((prev) => (prev ? { ...prev, notice: pData.notice } : prev));
          }
        } catch (_) {}
      }, 2000);
    } catch (e) {
      setActionMsg(`❌ OAuth 发起失败: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleImportFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setImportFileBuf(null);
      return;
    }
    const buf = new Uint8Array(await file.arrayBuffer());
    setImportFileBuf(buf);
  };

  const handleSubmitImport = async () => {
    setLoading(true);
    setImportResult(null);
    try {
      const payload = importFileBuf
        ? { defaultRealm: importRealm, base64Zip: uint8ToBase64(importFileBuf) }
        : { defaultRealm: importRealm, content: importContent };
      const res = await fetch('/plugins/dsh-workbuddy2api/accounts/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setImportResult(data);
      setActionMsg(`📥 导入完成: 新增 ${data.imported || 0} / 更新 ${data.updated || 0} / 失败 ${data.failed || 0}`);
      await fetchStatus(true);
      notifyBalanceUpdate();
    } catch (e) {
      setActionMsg(`❌ 批量导入失败: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleModel = (modelId) => {
    const current = new Set(modelsData.enabledModels || []);
    if (current.has(modelId)) current.delete(modelId);
    else current.add(modelId);
    setModelsData((prev) => ({ ...prev, enabledModels: Array.from(current) }));
  };

  const copyText = (txt, title) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(txt).then(() => setActionMsg(`📋 已复制 ${title}`)).catch(() => {});
    }
  };

  const syncModelsDraft = (nextAliases, nextRoutes) => {
    setAliasesMap(nextAliases);
    setModelRoutesMap(nextRoutes);
    setAliasesDraft(JSON.stringify(nextAliases, null, 2));
    setModelRoutesDraft(JSON.stringify(nextRoutes, null, 2));
  };

  const handleSaveModels = async () => {
    let parsedAliases = aliasesMap;
    let parsedRoutes = modelRoutesMap;
    try {
      if (aliasesDraft.trim()) parsedAliases = JSON.parse(aliasesDraft);
      if (modelRoutesDraft.trim()) parsedRoutes = JSON.parse(modelRoutesDraft);
    } catch (e) {
      setActionMsg(`❌ 高级 JSON 格式错误: ${e.message}`);
      return;
    }
    const freeModels = freeModelsDraft.split(',').map((s) => s.trim()).filter(Boolean);
    setLoading(true);
    try {
      const res = await fetch('/plugins/dsh-workbuddy2api/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabledModels: modelsData.enabledModels || [],
          aliases: parsedAliases,
          modelRoutes: parsedRoutes,
          autoFreeEnabled: autoFreeDraft,
          freeModels
        })
      });
      const data = await res.json();
      setActionMsg(data.ok ? '✅ 模型路由组、过滤与别名配置已保存' : `❌ 保存失败`);
      await fetchModels();
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/plugins/dsh-workbuddy2api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cfgDraft)
      });
      const data = await res.json();
      setActionMsg(data.ok ? '✅ 网关运行参数已保存并即时生效' : `❌ ${data.error}`);
      await fetchStatus(false);
    } finally {
      setLoading(false);
    }
  };

  const accounts = status?.accounts || [];
  const summary = status?.summary || {};
  const port = status?.gatewayPort || 7863;
  const gatewayUrl = `http://127.0.0.1:${port}/v1`;
  const consoleUrl = `http://127.0.0.1:${port}/console`;

  return (
    <div className="wb2a-card">
      <div className="wb2a-header">
        <div className="wb2a-title">
          <span>⚡ WorkBuddy 2API 全功能网关控制台</span>
          <span className="wb2a-badge wb2a-badge-success">在线 :{port}</span>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <a
            href={consoleUrl}
            target="_blank"
            rel="noreferrer"
            className="wb2a-btn wb2a-btn-secondary wb2a-btn-sm"
            style={{ textDecoration: 'none' }}
          >
            打开独立 Console ↗
          </a>
          <button className="wb2a-btn wb2a-btn-sm" onClick={() => fetchStatus(true)} disabled={loading}>
            ↻ 实时刷新
          </button>
        </div>
      </div>

      {actionMsg && (
        <div
          style={{
            marginBottom: 12,
            padding: '8px 12px',
            borderRadius: 8,
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            fontSize: 12,
            color: '#1e40af'
          }}
        >
          {actionMsg}
        </div>
      )}

      <div className="wb2a-tabs" style={{ flexWrap: 'wrap' }}>
        {[
          ['accounts', '总览与账号池'],
          ['models', '模型与倍率'],
          ['playground', '在线调试与流水'],
          ['usage', '用量与扣费'],
          ['activity', '猫猫旅行与福利'],
          ['tasks', '成长任务引擎'],
          ['settings', '网关设置与接入']
        ].map(([key, label]) => (
          <button
            key={key}
            className={`wb2a-tab-btn ${tab === key ? 'active' : ''}`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* TAB 1: 总览与账号池 */}
      {tab === 'accounts' && (
        <div>
          <div className="wb2a-summary-grid">
            {[
              ['全池合计 (All)', summary.all, '#2563eb'],
              ['国内版 (CodeBuddy CN)', summary.cn, '#059669'],
              ['国际版 (WorkBuddy AI)', summary.global, '#0284c7']
            ].map(([title, s = {}, color]) => (
              <div key={title} className="wb2a-realm-card">
                <div style={{ fontSize: 11, color: '#64748b' }}>{title}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color, margin: '4px 0' }}>
                  {Number(s.remain || 0).toLocaleString()}
                </div>
                <div style={{ fontSize: 10, color: '#64748b' }}>
                  可用 {s.enabledCount || 0}/{s.count || 0} · 基 {s.baseRemain || 0} · 赠 {s.bonusRemain || 0} · 购 {s.purchasedRemain || 0}
                </div>
              </div>
            ))}
          </div>

          <div className="wb2a-toolbar">
            <button className="wb2a-btn wb2a-btn-success wb2a-btn-sm" onClick={() => handleStartOAuth('cn')} disabled={loading}>
              + 国内版 OAuth 登录
            </button>
            <button className="wb2a-btn wb2a-btn-sm" onClick={() => handleStartOAuth('global')} disabled={loading}>
              + 国际版 OAuth 登录
            </button>
            <button className="wb2a-btn wb2a-btn-secondary wb2a-btn-sm" onClick={() => { setImportResult(null); setImportOpen(true); }}>
              批量 / ZIP 导入
            </button>
            <a
              href="/plugins/dsh-workbuddy2api/accounts/export.zip"
              className="wb2a-btn wb2a-btn-secondary wb2a-btn-sm"
              style={{ textDecoration: 'none' }}
            >
              导出 ZIP 备份
            </a>
            <button
              className="wb2a-btn wb2a-btn-warn wb2a-btn-sm"
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                try {
                  const r = await fetch('/plugins/dsh-workbuddy2api/accounts/refresh-all', { method: 'POST' });
                  const d = await r.json();
                  setActionMsg(`🔄 全池 Token 刷新: 成功 ${d.refreshed} / 跳过 ${d.skipped} / 失败 ${d.failed}`);
                  await fetchStatus(true);
                  notifyBalanceUpdate();
                } finally {
                  setLoading(false);
                }
              }}
            >
              全池刷新 Token
            </button>
            <button
              className="wb2a-btn wb2a-btn-danger wb2a-btn-sm"
              disabled={loading}
              onClick={async () => {
                const r = await fetch('/plugins/dsh-workbuddy2api/accounts/clear-all-cooldowns', { method: 'POST' });
                const d = await r.json();
                setActionMsg(`⚡ ${d.message}`);
                await fetchStatus(false);
              }}
            >
              一键清除全部熔断
            </button>
            <button
              className="wb2a-btn wb2a-btn-success wb2a-btn-sm"
              disabled={loading}
              onClick={async () => {
                const r = await fetch('/plugins/dsh-workbuddy2api/checkin', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ all: true })
                });
                const d = await r.json();
                setActionMsg(`📅 ${d.message || '批量签到完成'}`);
                await fetchStatus(true);
                notifyBalanceUpdate();
              }}
            >
              全池每日签到
            </button>
            <button
              className="wb2a-btn wb2a-btn-secondary wb2a-btn-sm"
              disabled={loading}
              onClick={async () => {
                const r = await fetch('/plugins/dsh-workbuddy2api/trial/batch', { method: 'POST' });
                const d = await r.json();
                setActionMsg(`🎁 国际版批量 Trial 执行完成 (${d.results?.length || 0})`);
                await fetchStatus(true);
                notifyBalanceUpdate();
              }}
            >
              批量领Trial
            </button>
          </div>

          {accounts.map((acc) => {
            const isAct = acc.uid === status?.activeUid;
            const bal = acc.balance || {};
            const diag = acc.diagnostics || {};
            return (
              <div key={acc.uid} className={`wb2a-account-item ${isAct ? 'active' : ''}`} style={{ flexWrap: 'wrap', gap: 10 }}>
                <div style={{ minWidth: 220, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <strong>{acc.nickname || acc.uid.slice(0, 10)}</strong>
                    <span className="wb2a-badge">{acc.realm}</span>
                    {isAct && <span className="wb2a-badge wb2a-badge-success">当前优先</span>}
                    {acc.manualDisabled && (
                      <span className="wb2a-badge" style={{ color: '#dc2626', background: '#fef2f2', borderColor: '#fecaca' }}>手动停用</span>
                    )}
                    {!acc.manualDisabled && acc.disabled && (
                      <span className="wb2a-badge" style={{ color: '#dc2626', background: '#fef2f2', borderColor: '#fecaca' }}>自动禁用</span>
                    )}
                    {!acc.disabled && !acc.manualDisabled && diag.coolingDown && (
                      <span className="wb2a-badge wb2a-badge-warn">熔断 {diag.cooldownRemainingSec}s</span>
                    )}
                    {diag.modelCooldowns?.length > 0 && (
                      <span className="wb2a-badge wb2a-badge-warn">{diag.modelCooldowns.length}模型冷却</span>
                    )}
                    {acc.checkinState && (
                      <span className={`wb2a-badge ${acc.checkinState.ok ? 'wb2a-badge-success' : 'wb2a-badge-warn'}`}>
                        {acc.checkinState.ok ? '今日已签' : '待重试'}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>
                    实时积分: <strong style={{ color: '#2563eb' }}>{Number(bal.remain || 0).toLocaleString()}</strong> / {Number(bal.total || 0).toLocaleString()}
                    {' · '}基:{bal.baseRemain || 0} 赠:{bal.bonusRemain || 0} 购:{bal.purchasedRemain || 0}
                    {' · '}并发: {acc.inFlight || 0}/{diag.limit || 3}
                    {' · '}成功/失败: {diag.stats?.successCount || 0}/{diag.stats?.failCount || 0}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  {!isAct && (
                    <button
                      className="wb2a-btn wb2a-btn-sm"
                      onClick={async () => {
                        await fetch('/plugins/dsh-workbuddy2api/accounts/switch', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ uid: acc.uid })
                        });
                        fetchStatus(false);
                        notifyBalanceUpdate();
                      }}
                    >
                      设优先
                    </button>
                  )}
                  <button className="wb2a-btn wb2a-btn-secondary wb2a-btn-sm" onClick={() => setPacksModalAcc(acc)}>
                    包明细({bal.activePackCount || 0})
                  </button>
                  <button
                    className="wb2a-btn wb2a-btn-secondary wb2a-btn-sm"
                    onClick={() => setUpdTokenModal({ uid: acc.uid, nickname: acc.nickname, accessToken: '', refreshToken: '' })}
                  >
                    换Token
                  </button>
                  <button className="wb2a-btn wb2a-btn-secondary wb2a-btn-sm" onClick={() => handleAdminAction(acc.uid, 'refresh')}>
                    刷新
                  </button>
                  <button
                    className={`wb2a-btn wb2a-btn-sm ${acc.manualDisabled ? 'wb2a-btn-success' : 'wb2a-btn-danger'}`}
                    onClick={() => handleAdminAction(acc.uid, acc.manualDisabled ? 'manualEnable' : 'disable')}
                  >
                    {acc.manualDisabled ? '恢复' : '停用'}
                  </button>
                  {(acc.disabled || diag.coolingDown || diag.modelCooldowns?.length > 0) && (
                    <button className="wb2a-btn wb2a-btn-warn wb2a-btn-sm" onClick={() => handleAdminAction(acc.uid, 'revive')}>
                      复活
                    </button>
                  )}
                  {acc.realm === 'global' && (
                    <button className="wb2a-btn wb2a-btn-success wb2a-btn-sm" onClick={() => handleAdminAction(acc.uid, 'trial')}>
                      领Trial
                    </button>
                  )}
                  <button
                    className="wb2a-btn wb2a-btn-danger wb2a-btn-sm"
                    onClick={async () => {
                      await fetch('/plugins/dsh-workbuddy2api/accounts/delete', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ uid: acc.uid })
                      });
                      fetchStatus(false);
                      notifyBalanceUpdate();
                    }}
                  >
                    删除
                  </button>
                </div>
              </div>
            );
          })}

          <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 12, color: '#475569', marginBottom: 6 }}>单条凭证快速入池（支持 Access / Refresh Token 自动解析）:</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <input
                className="wb2a-input"
                style={{ flex: 2, minWidth: 180 }}
                placeholder="粘贴 Refresh Token 或 Access Token"
                value={newToken}
                onChange={(e) => setNewToken(e.target.value)}
              />
              <input
                className="wb2a-input"
                style={{ flex: 1, minWidth: 100 }}
                placeholder="备注昵称 (可选)"
                value={newNickname}
                onChange={(e) => setNewNickname(e.target.value)}
              />
              <select className="wb2a-input" style={{ width: 110 }} value={newRealm} onChange={(e) => setNewRealm(e.target.value)}>
                <option value="global">Global</option>
                <option value="cn">CN</option>
              </select>
              <button className="wb2a-btn" onClick={handleAddAccount} disabled={loading}>
                + 添加
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 猫猫旅行与福利 & 邀请 */}
      {tab === 'activity' && (
        <div>
          <div className="wb2a-toolbar">
            <select
              className="wb2a-input"
              style={{ width: 220 }}
              value={selectedUid || status?.activeUid || ''}
              onChange={(e) => setSelectedUid(e.target.value)}
            >
              {accounts.map((a) => (
                <option key={a.uid} value={a.uid}>[{a.realm.toUpperCase()}] {a.nickname || a.uid}</option>
              ))}
            </select>
            <button
              className="wb2a-btn wb2a-btn-success wb2a-btn-sm"
              onClick={async () => {
                setLoading(true);
                try {
                  const res = await fetch('/plugins/dsh-workbuddy2api/growth/claim-all', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ all: true })
                  });
                  const data = await res.json();
                  const items = (data.results || []).map((r) => ({
                    label: r.nickname || r.uid,
                    ok: r.status !== 'error',
                    detail: (Array.isArray(r.log) ? r.log.filter((l) => l.ok && l.message).slice(0, 2).map((l) => l.message).join(' · ') : '') || r.summary || '已完成',
                    gain: r.totalCreditsGained ? `+${r.totalCreditsGained}分` : '-'
                  }));
                  setWelfareResult({ title: data.message || `已完成 ${items.length} 个账号全套福利`, badge: '全号完成', items });
                  appendLog(data.message || `全号吃满福利完成，共处理 ${items.length} 个账号`);
                  fetchStatus(true);
                  notifyBalanceUpdate();
                } finally {
                  setLoading(false);
                }
              }}
            >
              🎁 全号一键吃满福利
            </button>
            <button
              className="wb2a-btn wb2a-btn-sm"
              onClick={async () => {
                setLoading(true);
                try {
                  const res = await fetch('/plugins/dsh-workbuddy2api/travel/run-all', { method: 'POST' });
                  const data = await res.json();
                  const items = (data.results || []).map((r) => {
                    const acts = r.results?.actions || [];
                    const g = acts.reduce((acc, a) => acc + Number(a.rewardCredit || 0), 0);
                    return {
                      label: r.nickname || r.uid,
                      ok: r.status === 'ok',
                      detail: acts.map((a) => a.message).filter(Boolean).join('；') || r.detail || r.reason || '已完成',
                      gain: g > 0 ? `+${g}分` : '-'
                    };
                  });
                  setWelfareResult({ title: data.message || `全池猫猫巡检完成 (${items.length} 账号)`, badge: '猫猫巡检', items });
                  appendLog(data.message || `全池猫猫巡检完成，共 ${items.length} 个国内账号`);
                  fetchActivityPanel();
                } finally {
                  setLoading(false);
                }
              }}
            >
              🐱 全池巡检猫猫旅行
            </button>
            <button
              className="wb2a-btn wb2a-btn-warn wb2a-btn-sm"
              onClick={async () => {
                const res = await fetch('/plugins/dsh-workbuddy2api/checkin', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ all: true })
                });
                const d = await res.json();
                const items = (d.results || []).map((r) => ({
                  label: r.nickname || r.uid,
                  ok: Boolean(r.ok),
                  detail: r.message || r.status || '已完成',
                  gain: r.credit ? `+${r.credit}分` : '-'
                }));
                setWelfareResult({ title: d.message || '全池每日签到完成', badge: '每日签到', items });
                appendLog(d.message || '全池签到完成');
                fetchStatus(true);
                notifyBalanceUpdate();
              }}
            >
              📅 全号每日签到
            </button>
            <button
              className="wb2a-btn wb2a-btn-secondary wb2a-btn-sm"
              onClick={async () => {
                const res = await fetch('/plugins/dsh-workbuddy2api/growth/gift', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ uid: selectedUid || status?.activeUid })
                });
                const d = await res.json();
                setWelfareResult({
                  title: d.message || '礼包检查完成',
                  badge: '礼包/活跃',
                  items: (d.items || []).map((it) => ({
                    label: it.name,
                    ok: Boolean(it.ok),
                    detail: it.message || '-',
                    gain: it.credit ? `+${it.credit}分` : '-'
                  }))
                });
                appendLog(d.message || '礼包检查完成');
                fetchStatus(true);
              }}
            >
              🎉 领新手礼/补偿
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <div className="wb2a-realm-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 4 }}>
                <strong style={{ fontSize: 13 }}>🐱 猫猫旅行管家</strong>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {travelData?.ok && !travelData?.travel?.isGlobal && !travelData?.buddy && (
                    <button
                      className="wb2a-btn wb2a-btn-success wb2a-btn-sm"
                      onClick={async () => {
                        const res = await fetch('/plugins/dsh-workbuddy2api/travel/adopt', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ uid: selectedUid || status?.activeUid })
                        });
                        const d = await res.json();
                        setActionMsg(`${d.ok ? '🐱' : '⚠️'} ${d.message || '领养检查完成'}`);
                        appendLog(d.message || '领养请求已执行');
                        fetchActivityPanel();
                        fetchStatus(true);
                      }}
                    >
                      + 领养(+300)
                    </button>
                  )}
                  {travelData?.travel?.state === 'arrived' && (
                    <button
                      className="wb2a-btn wb2a-btn-warn wb2a-btn-sm"
                      onClick={async () => {
                        const res = await fetch('/plugins/dsh-workbuddy2api/travel/claim', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ uid: selectedUid || status?.activeUid, recordId: travelData.travel.recordId })
                        });
                        const d = await res.json();
                        setActionMsg(`${d.ok ? '🎁' : '⚠️'} ${d.message || '领奖完成'}`);
                        appendLog(d.message || '领取旅行奖励完成');
                        fetchActivityPanel();
                        fetchStatus(true);
                      }}
                    >
                      🎁 领奖励
                    </button>
                  )}
                  <button
                    className="wb2a-btn wb2a-btn-secondary wb2a-btn-sm"
                    onClick={async () => {
                      const res = await fetch('/plugins/dsh-workbuddy2api/travel/run', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ uid: selectedUid || status?.activeUid })
                      });
                      const d = await res.json();
                      setActionMsg(`🐱 ${d.summary || '单号巡检完成'}`);
                      appendLog(d.summary || '单号自动巡检完成');
                      fetchActivityPanel();
                      fetchStatus(true);
                    }}
                  >
                    ⚡ 自动跑
                  </button>
                </div>
              </div>
              <div style={{ fontSize: 12, color: '#475569', marginBottom: 8 }}>
                {travelData?.travel?.isGlobal ? (
                  <span>国际版账号无猫猫体系（请切换 CN 账号）</span>
                ) : (
                  <>
                    宠物: <strong>{travelData?.buddy?.name || '未领养'}</strong> · 状态:{' '}
                    <strong>
                      {travelData?.travel?.state === 'arrived'
                        ? '🎉 已到站可领奖'
                        : travelData?.travel?.state === 'traveling'
                          ? '✈️ 旅行中'
                          : travelData?.travel?.state === 'idle'
                            ? '空闲待派出'
                            : (travelData?.travel?.state || '-')}
                    </strong>
                    {' · '}待领奖励: <strong style={{ color: '#059669' }}>+{travelData?.travel?.rewardCredit ?? 0}</strong>
                  </>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <select className="wb2a-input" style={{ flex: 1 }} value={travelLoc} onChange={(e) => setTravelLoc(Number(e.target.value))}>
                  <option value={4}>地点 4 · 古镇客栈 (推荐)</option>
                  <option value={1}>地点 1 · 森林营地</option>
                  <option value={2}>地点 2 · 海滨灯塔</option>
                  <option value={3}>地点 3 · 雪山木屋</option>
                </select>
                <button
                  className="wb2a-btn wb2a-btn-sm"
                  onClick={async () => {
                    const res = await fetch('/plugins/dsh-workbuddy2api/travel/depart', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ uid: selectedUid || status?.activeUid, locationId: travelLoc })
                    });
                    const d = await res.json();
                    setActionMsg(`${d.ok ? '✅' : '⚠️'} ${d.message || '派出指令已发送'}`);
                    appendLog(d.message || '猫猫出发请求已发送');
                    fetchActivityPanel();
                  }}
                >
                  派出旅行
                </button>
              </div>
            </div>

            <div className="wb2a-realm-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 4 }}>
                <strong style={{ fontSize: 13 }}>🎰 连登里程碑与抽奖</strong>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    className="wb2a-btn wb2a-btn-secondary wb2a-btn-sm"
                    onClick={async () => {
                      const res = await fetch('/plugins/dsh-workbuddy2api/growth/makeup', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ uid: selectedUid || status?.activeUid })
                      });
                      const d = await res.json();
                      setActionMsg(`🩹 ${d.message || '补签检查完成'}`);
                      appendLog(d.message || '补签卡检查完成');
                      fetchActivityPanel();
                    }}
                  >
                    🩹 补签卡
                  </button>
                  <button
                    className="wb2a-btn wb2a-btn-success wb2a-btn-sm"
                    onClick={async () => {
                      const res = await fetch('/plugins/dsh-workbuddy2api/growth/lottery/draw', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ uid: selectedUid || status?.activeUid })
                      });
                      const d = await res.json();
                      const r = d.result || {};
                      setActionMsg(`${r.ok ? '🎉' : 'ℹ️'} ${r.message || '暂无可用抽奖次数'}`);
                      appendLog(r.message || '抽奖完成');
                      fetchActivityPanel();
                      notifyBalanceUpdate();
                    }}
                  >
                    抽一次奖
                  </button>
                </div>
              </div>
              <div style={{ fontSize: 12, color: '#475569', marginBottom: 8 }}>
                连登天数: <strong>{growthData?.streak?.days ?? 0} 天</strong>
                {' · '}补签卡: <strong>{growthData?.streak?.makeupCards?.balance ?? 0}</strong> 张
                {' · '}抽奖次数:{' '}
                <strong style={{ color: '#2563eb' }}>
                  {typeof growthData?.chances === 'number' ? growthData.chances : (growthData?.chancesRemaining ?? 0)}
                </strong> 次
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {(growthData?.tiers || []).map((t) => (
                  <div key={t.tier} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '3px 8px', borderRadius: 6, background: '#f8fafc', border: '1px solid #dbe5f1' }}>
                    <span>{t.label}: {t.status === 'claimed' ? '✅已领' : t.status === 'available' ? '🌟可领' : '⏳未解锁'}</span>
                    {t.status === 'available' && (
                      <button
                        className="wb2a-btn wb2a-btn-success wb2a-btn-sm"
                        style={{ padding: '1px 6px', fontSize: 10 }}
                        onClick={async () => {
                          const res = await fetch('/plugins/dsh-workbuddy2api/growth/redeem', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ uid: selectedUid || status?.activeUid, tier: t.tier })
                          });
                          const d = await res.json();
                          setActionMsg(`${d.ok ? '🎁' : '⚠️'} ${d.message || '兑换完成'}`);
                          appendLog(d.message || `兑换 ${t.tier} 完成`);
                          fetchActivityPanel();
                          fetchStatus(true);
                        }}
                      >
                        兑换
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="wb2a-realm-card" style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>🎁 官方专属邀请中心</div>
            <div style={{ fontSize: 12, color: '#475569', marginBottom: 8, lineHeight: 1.7 }}>
              邀请码: <strong style={{ color: '#2563eb' }}>{inviteInfo?.inviteCode || '暂未分配'}</strong>
              {' · '}已邀请: {inviteInfo?.invitedCount || 0} 人 (有效 {inviteInfo?.validInviteCount || 0})
              {' · '}累计奖励: <strong style={{ color: '#059669' }}>+{inviteInfo?.rewardCredit || 0}</strong> 积分
              <br />
              专属链接:{' '}
              {inviteInfo?.inviteUrl ? (
                <a href={inviteInfo.inviteUrl} target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontWeight: 500 }}>
                  {inviteInfo.inviteUrl}
                </a>
              ) : (
                <span>-</span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                className="wb2a-input"
                placeholder="粘贴推荐人邀请码或完整邀请链接进行绑定..."
                value={bindCodeInput}
                onChange={(e) => setBindCodeInput(e.target.value)}
              />
              <button
                className="wb2a-btn wb2a-btn-success wb2a-btn-sm"
                onClick={async () => {
                  const res = await fetch('/plugins/dsh-workbuddy2api/invite/bind', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ uid: selectedUid || status?.activeUid, inviteCode: bindCodeInput })
                  });
                  const d = await res.json();
                  appendLog(`邀请绑定: ${d.message || (d.ok ? '绑定成功' : '绑定失败')}`);
                  setActionMsg(`${d.ok ? '✅' : '❌'} ${d.message || '绑定请求已执行'}`);
                  fetchStatus(true);
                }}
              >
                立即绑定
              </button>
            </div>
          </div>

          {welfareResult && (
            <div className="wb2a-realm-card" style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <strong style={{ fontSize: 12 }}>📋 {welfareResult.title}</strong>
                <span className="wb2a-badge wb2a-badge-success">{welfareResult.badge}</span>
              </div>
              <div style={{ maxHeight: 190, overflowY: 'auto' }}>
                {(welfareResult.items || []).map((it, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #edf2f7', fontSize: 11, gap: 8 }}>
                    <span><strong>{it.label}</strong> · <span style={{ color: '#475569' }}>{it.detail}</span></span>
                    <span className={`wb2a-badge ${it.ok ? 'wb2a-badge-success' : 'wb2a-badge-warn'}`}>{it.gain !== '-' ? it.gain : (it.ok ? '成功' : '跳过')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activityLogs.length > 0 && (
            <div style={{ fontSize: 11, color: '#64748b', background: '#f8fafc', border: '1px solid #dbe5f1', borderRadius: 8, padding: '8px 10px' }}>
              {activityLogs.slice(0, 5).map((l, i) => (
                <div key={i} style={{ padding: '2px 0' }}>{l}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: 成长任务引擎 */}
      {tab === 'tasks' && (
        <div>
          <div className="wb2a-toolbar">
            <select
              className="wb2a-input"
              style={{ width: 220 }}
              value={selectedUid || status?.activeUid || ''}
              onChange={(e) => setSelectedUid(e.target.value)}
            >
              {accounts.map((a) => (
                <option key={a.uid} value={a.uid}>[{a.realm.toUpperCase()}] {a.nickname || a.uid}</option>
              ))}
            </select>
            <button
              className="wb2a-btn wb2a-btn-success wb2a-btn-sm"
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                try {
                  const res = await fetch('/plugins/dsh-workbuddy2api/tasks/run', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ uid: selectedUid || status?.activeUid })
                  });
                  const d = await res.json();
                  setActionMsg(`✅ ${d.result?.summary || '成长任务已全部自动触发与收割'}`);
                  await fetchTasksPanel();
                  await fetchStatus(true);
                  notifyBalanceUpdate();
                } finally {
                  setLoading(false);
                }
              }}
            >
              一键全自动点亮收割 (单号)
            </button>
            <button
              className="wb2a-btn wb2a-btn-warn wb2a-btn-sm"
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                try {
                  const res = await fetch('/plugins/dsh-workbuddy2api/tasks/run', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ all: true })
                  });
                  const d = await res.json();
                  setActionMsg(`✅ 已批量跑完 ${d.results?.length || 0} 个国内账号全套成长任务`);
                  await fetchTasksPanel();
                  await fetchStatus(true);
                  notifyBalanceUpdate();
                } finally {
                  setLoading(false);
                }
              }}
            >
              全量国内号自动跑任务
            </button>
            <button
              className="wb2a-btn wb2a-btn-sm"
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                try {
                  const res = await fetch('/plugins/dsh-workbuddy2api/school/run', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ uid: selectedUid || status?.activeUid })
                  });
                  const d = await res.json();
                  const r = d.result || {};
                  setSchoolResult({ mode: 'single', result: r });
                  setActionMsg(`🏫 ${r.summary || `开学季: 完成 ${r.logs?.length || 0} 步, 抽奖 ${r.prizes?.length || 0} 次 (+${r.creditGained || 0} 分)`}`);
                  await fetchTasksPanel();
                  await fetchStatus(true);
                  notifyBalanceUpdate();
                } finally {
                  setLoading(false);
                }
              }}
            >
              🏫 开学季活动+抽奖
            </button>
            <button
              className="wb2a-btn wb2a-btn-secondary wb2a-btn-sm"
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                try {
                  const res = await fetch('/plugins/dsh-workbuddy2api/school/run', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ all: true })
                  });
                  const d = await res.json();
                  setSchoolResult({ mode: 'all', results: d.results || [] });
                  setActionMsg(`🎓 全号开学季已完成 (${d.results?.length || 0} 账号)`);
                  await fetchTasksPanel();
                  await fetchStatus(true);
                  notifyBalanceUpdate();
                } finally {
                  setLoading(false);
                }
              }}
            >
              🎓 全号开学季抽奖
            </button>
            <button
              className="wb2a-btn wb2a-btn-secondary wb2a-btn-sm"
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                try {
                  const res = await fetch('/plugins/dsh-workbuddy2api/tasks/nightcat', { method: 'POST' });
                  const d = await res.json();
                  setActionMsg(`${d.ok ? '🦉' : '⏰'} ${d.message}`);
                  if (d.ok) await fetchTasksPanel();
                } finally {
                  setLoading(false);
                }
              }}
            >
              🦉 深夜猫猫(23-08)
            </button>
            <button className="wb2a-btn wb2a-btn-secondary wb2a-btn-sm" onClick={() => fetchTasksPanel()}>
              ↻ 刷新清单
            </button>
          </div>

          {schoolData && (
            <div className="wb2a-realm-card" style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <strong style={{ fontSize: 12 }}>🎓 开学季活动 (school_open_day_2026)</strong>
                <span className={`wb2a-badge ${schoolData.inPeriod ? 'wb2a-badge-success' : 'wb2a-badge-warn'}`}>
                  {schoolData.skipped ? '仅CN支持' : !schoolData.ok ? '获取失败' : schoolData.inPeriod ? `进行中 · 转盘 ${schoolData.chance?.balance || 0} 次` : '未在活动期'}
                </span>
              </div>
              {schoolData.inPeriod && (schoolData.tasks || []).length > 0 && (
                <div style={{ fontSize: 11, color: '#475569' }}>
                  {(schoolData.tasks || []).map((stItem, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid #edf2f7' }}>
                      <span>{stItem.title || stItem.task_code} ({stItem.progress || 0}/{stItem.target_count || 1})</span>
                      <span className={`wb2a-badge ${stItem.status === 'claimed' || stItem.status === 'completed' ? 'wb2a-badge-success' : 'wb2a-badge-warn'}`}>
                        {stItem.status || 'pending'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {schoolResult && schoolResult.mode === 'single' && (
                <div style={{ marginTop: 6, fontSize: 11, color: '#0f172a' }}>
                  <strong>{schoolResult.result?.summary || schoolResult.result?.message || '已执行'}</strong>
                  {(schoolResult.result?.prizes || []).length > 0 && (
                    <div style={{ marginTop: 4, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {schoolResult.result.prizes.map((p, idx) => (
                        <span key={idx} className="wb2a-badge wb2a-badge-success">
                          🎁 {p.label || p.prizeCode}{p.credit ? ` (+${p.credit})` : ''}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {schoolResult && schoolResult.mode === 'all' && (
                <div style={{ marginTop: 6, maxHeight: 140, overflowY: 'auto' }}>
                  {(schoolResult.results || []).map((r, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: '3px 0', borderBottom: '1px solid #edf2f7' }}>
                      <span><strong>{r.nickname || r.uid}</strong>: {r.summary || r.message || r.error || '完成'}</span>
                      <span className="wb2a-badge wb2a-badge-success">+{r.creditGained || 0}分</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {tasksList.map((task, idx) => {
              const st = task.accept_status || (task.claimed ? 'claimed' : task.completed ? 'completed' : 'pending');
              const cur = task.progress?.current ?? 0;
              const tgt = task.progress?.target ?? 1;
              return (
                <div key={task.task_code || task.code || idx} className="wb2a-account-item" style={{ padding: '8px 12px' }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{task.title || task.name || task.task_code}</div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>
                      {task.task_code || task.code} · 进度 {cur}/{tgt} · 奖励 +{task.reward_credit || 0} 分
                    </div>
                  </div>
                  <span className={`wb2a-badge ${st === 'claimed' ? 'wb2a-badge-success' : st === 'completed' ? 'wb2a-badge-warn' : ''}`}>
                    {st === 'claimed' ? '✅ 已领奖' : st === 'completed' ? '🌟 待领取' : st === 'accepted' ? '⏳ 进行中' : '⚪ 未开始'}
                  </span>
                </div>
              );
            })}
            {tasksList.length === 0 && (
              <div style={{ fontSize: 12, color: '#64748b', padding: 12 }}>当前选中账号暂无返回任务条目（成长任务主要面向 CN 国内版账号）</div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: 模型与倍率 */}
      {tab === 'models' && (
        <div>
          <div className="wb2a-toolbar">
            <button
              className="wb2a-btn wb2a-btn-success wb2a-btn-sm"
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                try {
                  const res = await fetch('/plugins/dsh-workbuddy2api/models/discover', { method: 'POST' });
                  const d = await res.json();
                  setActionMsg(`🔍 实时倍率目录同步完成，总计 ${d.models?.length || 0} 个模型`);
                  await fetchModels();
                } finally {
                  setLoading(false);
                }
              }}
            >
              🔍 同步上游实时倍率目录
            </button>
            <button className="wb2a-btn wb2a-btn-sm" onClick={handleSaveModels} disabled={loading}>
              💾 保存启用过滤与别名
            </button>
            <select
              className="wb2a-input"
              style={{ width: 150 }}
              value={modelFilter}
              onChange={(e) => setModelFilter(e.target.value)}
            >
              <option value="all">全部模型</option>
              <option value="free">🎁 仅免费 (x0.00)</option>
              <option value="low">💎 超省 (≤0.2x)</option>
              <option value="cn">国内版 (CN)</option>
              <option value="global">国际版 (Global)</option>
              <option value="reasoning">支持思考</option>
            </select>
            <input
              className="wb2a-input"
              style={{ width: 170 }}
              placeholder="搜索模型 ID / 说明..."
              value={modelSearch}
              onChange={(e) => setModelSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: 12 }}>
            <div style={{ maxHeight: 380, overflowY: 'auto', border: '1px solid #dbe5f1', borderRadius: 8, padding: 8, background: '#f8fafc' }}>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>
                模型列表与真实倍率（空勾选代表全部放行，点击试跑可验证连通与扣费）:
              </div>
              {(modelsData.models || [])
                .filter((m) => {
                  const q = modelSearch.toLowerCase();
                  if (q && !(m.id.toLowerCase().includes(q) || (m.name || '').toLowerCase().includes(q) || (m.description || '').toLowerCase().includes(q))) return false;
                  if (modelFilter === 'free' && !m.isFree && m.multiplier !== 0) return false;
                  if (modelFilter === 'low' && (m.multiplier === null || m.multiplier === undefined || m.multiplier > 0.2)) return false;
                  if (modelFilter === 'cn' && m.realm !== 'cn') return false;
                  if (modelFilter === 'global' && m.realm !== 'global') return false;
                  if (modelFilter === 'reasoning' && !m.supportsReasoning && !(m.supportedEfforts?.length)) return false;
                  return true;
                })
                .map((m) => {
                  const isFree = m.isFree || m.multiplier === 0;
                  const isHigh = typeof m.multiplier === 'number' && m.multiplier > 1.0;
                  const badgeCls = isFree ? 'wb2a-badge-success' : isHigh ? 'wb2a-badge-warn' : '';
                  return (
                    <div
                      key={m.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '6px 6px',
                        borderBottom: '1px solid #e2e8f0',
                        fontSize: 12,
                        gap: 6
                      }}
                    >
                      <label style={{ cursor: 'pointer', flex: 1 }}>
                        <input
                          type="checkbox"
                          checked={(modelsData.enabledModels || []).includes(m.id)}
                          onChange={() => handleToggleModel(m.id)}
                          style={{ marginRight: 6 }}
                        />
                        <strong>{m.id}</strong>
                        <span className={`wb2a-badge ${badgeCls}`} style={{ marginLeft: 5 }}>
                          {isFree ? `免费 ${m.rate || 'x0.00'}` : (m.rate || '-')}
                        </span>
                        {m.badge && (
                          <span className="wb2a-badge wb2a-badge-warn" style={{ marginLeft: 4 }}>
                            {m.badge}
                          </span>
                        )}
                        <div style={{ fontSize: 10, color: '#64748b', marginLeft: 20 }}>
                          {m.realm} · {Math.round((m.contextWindow || 0) / 1000)}k
                          {m.supportsImages ? ' · 视觉' : ''}
                          {(m.supportsReasoning || m.supportedEfforts?.length) ? ' · 思考' : ''}
                          {m.supportedEfforts?.length ? ` [${m.supportedEfforts.join('/')}]` : ''}
                        </div>
                      </label>
                      <button
                        className="wb2a-btn wb2a-btn-secondary wb2a-btn-sm"
                        onClick={() => {
                          setPgModel(m.id);
                          setTab('playground');
                        }}
                      >
                        试跑
                      </button>
                    </div>
                  );
                })}
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: 11, color: '#475569' }}>
                  <input
                    type="checkbox"
                    checked={autoFreeDraft}
                    onChange={(e) => setAutoFreeDraft(e.target.checked)}
                  />{' '}
                  开放 <code>auto-free</code> 免费兜底池
                </label>
                <button
                  className="wb2a-btn wb2a-btn-secondary wb2a-btn-sm"
                  onClick={() => {
                    const nextAl = {
                      ...aliasesMap,
                      'claude-sonnet-4-6': 'global:gpt-6.1-sol',
                      'claude-opus-4-6': 'global:gpt-6-astra',
                      'claude-haiku-4-5': 'cn:deepseek-v4.1-flash'
                    };
                    syncModelsDraft(nextAl, modelRoutesMap);
                    setActionMsg('✅ 已添加 Claude Code 常用映射（请点击保存按钮生效）');
                  }}
                >
                  + Claude Code 常用映射
                </button>
              </div>
              <div style={{ fontSize: 11, color: '#475569', marginBottom: 4 }}>auto-free 智能免费路由顺序 (逗号分隔):</div>
              <input
                className="wb2a-input"
                style={{ marginBottom: 8 }}
                value={freeModelsDraft}
                onChange={(e) => setFreeModelsDraft(e.target.value)}
              />

              <div style={{ fontSize: 11, fontWeight: 600, color: '#475569', marginBottom: 4 }}>自定义故障转移路由组 (如 fast):</div>
              <div style={{ maxHeight: 90, overflowY: 'auto', marginBottom: 6 }}>
                {Object.entries(modelRoutesMap).map(([gName, list]) => (
                  <div key={gName} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, padding: '3px 6px', background: '#f8fafc', border: '1px solid #dbe5f1', borderRadius: 6, marginBottom: 4 }}>
                    <span><strong>{gName}</strong> ➔ {Array.isArray(list) ? list.join(' → ') : String(list)}</span>
                    <button
                      className="wb2a-btn wb2a-btn-danger wb2a-btn-sm"
                      style={{ padding: '1px 6px', fontSize: 10 }}
                      onClick={() => {
                        const next = { ...modelRoutesMap };
                        delete next[gName];
                        syncModelsDraft(aliasesMap, next);
                      }}
                    >
                      删
                    </button>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                <input className="wb2a-input" style={{ width: 75 }} placeholder="组名" value={newRouteName} onChange={(e) => setNewRouteName(e.target.value)} />
                <input className="wb2a-input" style={{ flex: 1 }} placeholder="模型逗号分隔" value={newRouteTargets} onChange={(e) => setNewRouteTargets(e.target.value)} />
                <button
                  className="wb2a-btn wb2a-btn-sm"
                  onClick={() => {
                    const g = newRouteName.trim();
                    const ts = newRouteTargets.split(',').map((s) => s.trim()).filter(Boolean);
                    if (!g || ts.length === 0) return;
                    syncModelsDraft(aliasesMap, { ...modelRoutesMap, [g]: ts });
                    setNewRouteName('');
                    setNewRouteTargets('');
                  }}
                >
                  + 加组
                </button>
              </div>

              <div style={{ fontSize: 11, fontWeight: 600, color: '#475569', marginBottom: 4 }}>客户端模型别名映射:</div>
              <div style={{ maxHeight: 120, overflowY: 'auto', marginBottom: 6 }}>
                {Object.entries(aliasesMap).map(([from, to]) => (
                  <div key={from} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, padding: '3px 6px', background: '#f8fafc', border: '1px solid #dbe5f1', borderRadius: 6, marginBottom: 4 }}>
                    <span><strong>{from}</strong> ➔ <span style={{ color: '#059669' }}>{to}</span></span>
                    <button
                      className="wb2a-btn wb2a-btn-danger wb2a-btn-sm"
                      style={{ padding: '1px 6px', fontSize: 10 }}
                      onClick={() => {
                        const next = { ...aliasesMap };
                        delete next[from];
                        syncModelsDraft(next, modelRoutesMap);
                      }}
                    >
                      删
                    </button>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                <input className="wb2a-input" style={{ flex: 1 }} placeholder="请求名如 claude-sonnet-4-6" value={newAliasFrom} onChange={(e) => setNewAliasFrom(e.target.value)} />
                <input className="wb2a-input" style={{ flex: 1 }} placeholder="真实模型" value={newAliasTo} onChange={(e) => setNewAliasTo(e.target.value)} />
                <button
                  className="wb2a-btn wb2a-btn-sm"
                  onClick={() => {
                    const f = newAliasFrom.trim();
                    const t = newAliasTo.trim();
                    if (!f || !t) return;
                    syncModelsDraft({ ...aliasesMap, [f]: t }, modelRoutesMap);
                    setNewAliasFrom('');
                    setNewAliasTo('');
                  }}
                >
                  + 加别名
                </button>
              </div>

              <details style={{ fontSize: 11, color: '#64748b' }}>
                <summary style={{ cursor: 'pointer' }}>高级 JSON 视图 (可选手改)</summary>
                <textarea
                  className="wb2a-input"
                  rows={3}
                  style={{ fontFamily: 'monospace', marginTop: 4, marginBottom: 4 }}
                  value={modelRoutesDraft}
                  onChange={(e) => {
                    setModelRoutesDraft(e.target.value);
                    try { setModelRoutesMap(JSON.parse(e.target.value || '{}')); } catch (_) {}
                  }}
                />
                <textarea
                  className="wb2a-input"
                  rows={4}
                  value={aliasesDraft}
                  onChange={(e) => {
                    setAliasesDraft(e.target.value);
                    try { setAliasesMap(JSON.parse(e.target.value || '{}')); } catch (_) {}
                  }}
                  style={{ fontFamily: 'monospace' }}
                />
              </details>
            </div>
          </div>
        </div>
      )}

      {/* TAB: 在线调试与实时流水 */}
      {tab === 'playground' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: 12 }}>
            <div className="wb2a-realm-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <strong style={{ fontSize: 13 }}>🧪 在线对话测试 Playground (支持图/文附件)</strong>
                {pgMetrics && <span className="wb2a-badge">{pgMetrics}</span>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 6, marginBottom: 8 }}>
                <select className="wb2a-input" value={pgModel} onChange={(e) => setPgModel(e.target.value)}>
                  {(modelsData.models || []).map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.id} [{m.rate || '-'}]
                    </option>
                  ))}
                </select>
                <select className="wb2a-input" value={pgEffort} onChange={(e) => setPgEffort(e.target.value)}>
                  <option value="">思考档位: 默认</option>
                  <option value="low">low</option>
                  <option value="medium">medium</option>
                  <option value="high">high</option>
                  <option value="xhigh">xhigh</option>
                  <option value="max">max</option>
                </select>
              </div>
              <textarea
                className="wb2a-input"
                rows={3}
                style={{ marginBottom: 8 }}
                value={pgPrompt}
                onChange={(e) => setPgPrompt(e.target.value)}
                placeholder="输入测试提示词..."
              />
              <div className="wb2a-toolbar" style={{ marginBottom: 8 }}>
                <input type="file" accept="image/*,.txt,.md,.json,.js,.py" onChange={handlePgFileChange} style={{ fontSize: 11, maxWidth: 180 }} />
                {pgAttach && (
                  <button className="wb2a-btn wb2a-btn-danger wb2a-btn-sm" onClick={() => setPgAttach(null)}>
                    清除({pgAttach.name})
                  </button>
                )}
                <button className="wb2a-btn wb2a-btn-success wb2a-btn-sm" onClick={handleRunPlayground} disabled={pgRunning}>
                  {pgRunning ? '⏳ 请求执行中...' : '🚀 发送测试'}
                </button>
              </div>
              <pre className="wb2a-code" style={{ minHeight: 110, maxHeight: 220 }}>{pgOutput}</pre>
            </div>

            <div className="wb2a-realm-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <strong style={{ fontSize: 13 }}>📡 在途并发 &amp; 实时请求流水</strong>
                <button className="wb2a-btn wb2a-btn-secondary wb2a-btn-sm" onClick={fetchLogs}>↻ 刷新</button>
              </div>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>
                {inFlightList.length > 0
                  ? inFlightList.map((r) => `[${r.model} ${r.rate}] ${r.nickname}`).join(' · ')
                  : '当前无在途请求'}
              </div>
              <div style={{ maxHeight: 290, overflowY: 'auto' }}>
                {liveLogs.map((l) => (
                  <div key={l.id} style={{ padding: '5px 0', borderBottom: '1px solid #e2e8f0', fontSize: 11 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>
                        <strong>{l.model}</strong> <span className="wb2a-badge">{l.rate || '-'}</span>
                      </span>
                      <span className={`wb2a-badge ${l.status >= 400 ? 'wb2a-badge-warn' : 'wb2a-badge-success'}`}>
                        {l.status}
                      </span>
                    </div>
                    <div style={{ color: '#64748b', marginTop: 2 }}>
                      {l.time} · {l.account} · {l.totalTokens} tok · {l.ttfbMs ? `${l.ttfbMs}ms` : `${l.durationMs}ms`}
                      {l.tokensPerSec ? ` · ${l.tokensPerSec} t/s` : ''}
                      {l.credit !== null && l.credit !== undefined ? ` · 扣费 -${l.credit}` : ''}
                    </div>
                  </div>
                ))}
                {liveLogs.length === 0 && (
                  <div style={{ fontSize: 11, color: '#64748b' }}>暂无请求流水记录</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: 用量与实测扣费 */}
      {tab === 'usage' && (
        <div>
          <div className="wb2a-grid-stats">
            <div className="wb2a-stat-box">
              <div className="wb2a-stat-value">{usage?.today?.requests || 0} / {usage?.summary?.totalRequests || 0}</div>
              <div className="wb2a-stat-label">今日 / 历史请求</div>
            </div>
            <div className="wb2a-stat-box">
              <div className="wb2a-stat-value">{Number(usage?.today?.inputTokens || 0).toLocaleString()}</div>
              <div className="wb2a-stat-label">今日输入 Tokens</div>
            </div>
            <div className="wb2a-stat-box">
              <div className="wb2a-stat-value">{Number(usage?.today?.outputTokens || 0).toLocaleString()}</div>
              <div className="wb2a-stat-label">今日输出 Tokens</div>
            </div>
            <div className="wb2a-stat-box">
              <div className="wb2a-stat-value">{Number(usage?.summary?.totalCredit || 0).toFixed(2)}</div>
              <div className="wb2a-stat-label">累计实测消耗积分</div>
            </div>
          </div>

          <div className="wb2a-toolbar">
            <span style={{ fontSize: 11, color: '#475569' }}>按日期查看:</span>
            <select
              className="wb2a-input"
              style={{ width: 130 }}
              value={usageDate || usage?.activeDate || ''}
              onChange={(e) => {
                setUsageDate(e.target.value);
                fetchUsage(e.target.value);
              }}
            >
              {(usage?.availableDates || []).map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <button className="wb2a-btn wb2a-btn-secondary wb2a-btn-sm" onClick={() => fetchUsage(usageDate)}>
              ↻ 刷新统计
            </button>
            <button
              className="wb2a-btn wb2a-btn-danger wb2a-btn-sm"
              onClick={async () => {
                await fetch('/plugins/dsh-workbuddy2api/stats/reset', { method: 'POST' });
                setActionMsg('🧹 本地用量账本已清零');
                fetchUsage();
              }}
            >
              清空账本
            </button>
          </div>

          <div style={{ fontSize: 12, color: '#475569', marginBottom: 6 }}>按模型倍率与实测扣费明细:</div>
          <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid #dbe5f1', borderRadius: 8, marginBottom: 12, background: '#f8fafc' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <thead>
                <tr style={{ background: '#eff6ff', color: '#475569', textAlign: 'left' }}>
                  <th style={{ padding: 6 }}>模型</th>
                  <th style={{ padding: 6 }}>倍率</th>
                  <th style={{ padding: 6 }}>请求</th>
                  <th style={{ padding: 6 }}>Tokens</th>
                  <th style={{ padding: 6 }}>命中率</th>
                  <th style={{ padding: 6 }}>扣费</th>
                  <th style={{ padding: 6 }}>吞吐</th>
                </tr>
              </thead>
              <tbody>
                {(usage?.modelBreakdown || []).map((r) => (
                  <tr key={r.model} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: 6 }}><strong>{r.model}</strong></td>
                    <td style={{ padding: 6 }}><span className="wb2a-badge">{r.rate || '-'}</span></td>
                    <td style={{ padding: 6 }}>{r.requests}</td>
                    <td style={{ padding: 6 }}>{r.totalTokens.toLocaleString()}</td>
                    <td style={{ padding: 6 }}>{r.cacheHitRate}%</td>
                    <td style={{ padding: 6, color: '#2563eb', fontWeight: 700 }}>{r.credit}</td>
                    <td style={{ padding: 6 }}>{r.tokensPerSec || 0} t/s</td>
                  </tr>
                ))}
                {(!usage?.modelBreakdown || usage.modelBreakdown.length === 0) && (
                  <tr>
                    <td colSpan="7" style={{ padding: 10, color: '#64748b' }}>暂无分模型调用数据</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div style={{ fontSize: 12, color: '#475569', marginBottom: 6 }}>近 7 天请求与 Token 消耗明细:</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
            {(usage?.trend7d || []).map((d) => (
              <div key={d.date} className="wb2a-stat-box" style={{ padding: 8 }}>
                <div style={{ fontSize: 10, color: '#64748b' }}>{d.date}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#2563eb', margin: '3px 0' }}>
                  {d.requests} 次
                </div>
                <div style={{ fontSize: 10, color: '#64748b' }}>{Number(d.tokens || 0).toLocaleString()} tok</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: 网关设置与接口接入指南 */}
      {tab === 'settings' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: '#475569', marginBottom: 4 }}>网关 API Key (留空免鉴权):</div>
              <input
                className="wb2a-input"
                value={cfgDraft.apiKey || ''}
                onChange={(e) => setCfgDraft({ ...cfgDraft, apiKey: e.target.value })}
                placeholder="sk-workbuddy-..."
              />
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#475569', marginBottom: 4 }}>上游 HTTP 代理 (留空直连):</div>
              <input
                className="wb2a-input"
                value={cfgDraft.proxy || ''}
                onChange={(e) => setCfgDraft({ ...cfgDraft, proxy: e.target.value })}
                placeholder="http://127.0.0.1:7890"
              />
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#475569', marginBottom: 4 }}>国内版 CN 单号最大并发:</div>
              <input
                type="number"
                className="wb2a-input"
                value={cfgDraft.maxInFlightCN || 3}
                onChange={(e) => setCfgDraft({ ...cfgDraft, maxInFlightCN: Number(e.target.value) })}
              />
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#475569', marginBottom: 4 }}>国际版 Global 单号最大并发:</div>
              <input
                type="number"
                className="wb2a-input"
                value={cfgDraft.maxInFlightGlobal || 2}
                onChange={(e) => setCfgDraft({ ...cfgDraft, maxInFlightGlobal: Number(e.target.value) })}
              />
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#475569', marginBottom: 4 }}>并发队列等待超时 (ms):</div>
              <input
                type="number"
                className="wb2a-input"
                value={cfgDraft.queueTimeoutMs ?? 60000}
                onChange={(e) => setCfgDraft({ ...cfgDraft, queueTimeoutMs: Number(e.target.value) })}
              />
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#475569', marginBottom: 4 }}>流式空闲断连超时 (ms):</div>
              <input
                type="number"
                className="wb2a-input"
                value={cfgDraft.streamIdleTimeoutMs ?? 90000}
                onChange={(e) => setCfgDraft({ ...cfgDraft, streamIdleTimeoutMs: Number(e.target.value) })}
              />
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#475569', marginBottom: 4 }}>X-Device-Token 文件路径 (可选):</div>
              <input
                className="wb2a-input"
                placeholder="~/.dsh/device_token"
                value={cfgDraft.deviceTokenPath || ''}
                onChange={(e) => setCfgDraft({ ...cfgDraft, deviceTokenPath: e.target.value })}
              />
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#475569', marginBottom: 4 }}>System Prompt 注入模式:</div>
              <select
                className="wb2a-input"
                value={cfgDraft.promptMode || 'none'}
                onChange={(e) => setCfgDraft({ ...cfgDraft, promptMode: e.target.value })}
              >
                <option value="none">关闭 (保持请求原样)</option>
                <option value="append">追加末尾 (append)</option>
                <option value="replace">全局替换 (replace)</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: '#475569', marginBottom: 4 }}>自定义 System Prompt 文本:</div>
            <textarea
              className="wb2a-input"
              rows={3}
              value={cfgDraft.promptText || ''}
              onChange={(e) => setCfgDraft({ ...cfgDraft, promptText: e.target.value })}
            />
          </div>

          <div className="wb2a-toolbar" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 12, fontSize: 12, flexWrap: 'wrap' }}>
              <label>
                <input
                  type="checkbox"
                  checked={cfgDraft.autoCheckin !== false}
                  onChange={(e) => setCfgDraft({ ...cfgDraft, autoCheckin: e.target.checked })}
                />{' '}
                自动福利巡检
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={cfgDraft.autoTravel !== false}
                  onChange={(e) => setCfgDraft({ ...cfgDraft, autoTravel: e.target.checked })}
                />{' '}
                自动猫猫旅行
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={cfgDraft.autoTasks !== false}
                  onChange={(e) => setCfgDraft({ ...cfgDraft, autoTasks: e.target.checked })}
                />{' '}
                自动成长任务
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={cfgDraft.autoRefreshToken !== false}
                  onChange={(e) => setCfgDraft({ ...cfgDraft, autoRefreshToken: e.target.checked })}
                />{' '}
                5分钟Token保活
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={Boolean(cfgDraft.portalAsHome)}
                  onChange={(e) => setCfgDraft({ ...cfgDraft, portalAsHome: e.target.checked })}
                />{' '}
                首页(/)设为公开门户
              </label>
            </div>
            <button className="wb2a-btn wb2a-btn-success" onClick={handleSaveConfig} disabled={loading}>
              💾 保存网关配置
            </button>
          </div>

          <div className="wb2a-realm-card" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <strong style={{ fontSize: 12 }}>🛡️ 安全访问、密码锁定与 IP 白名单</strong>
              <span className={`wb2a-badge ${status?.auth?.hasPassword ? 'wb2a-badge-warn' : 'wb2a-badge-success'}`}>
                {status?.auth?.hasPassword ? '控制台已设密' : '单机免密模式'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              <input
                type="password"
                className="wb2a-input"
                placeholder="输入控制台新密码 (留空保存则清除)"
                value={webPasswordDraft}
                onChange={(e) => setWebPasswordDraft(e.target.value)}
              />
              <button
                className="wb2a-btn wb2a-btn-warn wb2a-btn-sm"
                onClick={async () => {
                  const r = await fetch('/plugins/dsh-workbuddy2api/config/password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password: webPasswordDraft })
                  });
                  const d = await r.json();
                  setActionMsg(`🔐 ${d.message || '完成'}`);
                  fetchStatus(false);
                }}
              >
                设密/清密
              </button>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 11, marginBottom: 6, flexWrap: 'wrap' }}>
              <label>
                <input
                  type="checkbox"
                  checked={ipWlDraft.enabled}
                  onChange={(e) => setIpWlDraft({ ...ipWlDraft, enabled: e.target.checked })}
                />{' '}
                启用 IP/CIDR 白名单
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={ipWlDraft.allowLocalhost}
                  onChange={(e) => setIpWlDraft({ ...ipWlDraft, allowLocalhost: e.target.checked })}
                />{' '}
                放行本机回环
              </label>
              <button
                className="wb2a-btn wb2a-btn-secondary wb2a-btn-sm"
                onClick={async () => {
                  const allowedIPs = ipWlDraft.text.split(/[\r\n,;]+/).map((s) => s.trim()).filter(Boolean);
                  const r = await fetch('/plugins/dsh-workbuddy2api/config/ip_whitelist', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ enabled: ipWlDraft.enabled, allowLocalhost: ipWlDraft.allowLocalhost, allowedIPs })
                  });
                  const d = await r.json();
                  setActionMsg(d.ok ? `🛡️ ${d.message}` : `❌ ${d.error}`);
                }}
              >
                保存白名单
              </button>
            </div>
            <textarea
              className="wb2a-input"
              rows={2}
              placeholder="每行或逗号分隔允许访问的 IP / CIDR，如 192.168.1.0/24"
              value={ipWlDraft.text}
              onChange={(e) => setIpWlDraft({ ...ipWlDraft, text: e.target.value })}
            />
          </div>

          <div className="wb2a-realm-card" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <strong style={{ fontSize: 12 }}>🔔 Webhook 风控告警 &amp; ⏰ CST 整点排程</strong>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  className="wb2a-btn wb2a-btn-warn wb2a-btn-sm"
                  onClick={async () => {
                    const r = await fetch('/plugins/dsh-workbuddy2api/config/alerts/test', { method: 'POST' });
                    const d = await r.json();
                    setActionMsg(d.ok ? `🔔 ${d.message}` : `❌ ${d.error}`);
                  }}
                >
                  发测试告警
                </button>
                <button
                  className="wb2a-btn wb2a-btn-success wb2a-btn-sm"
                  onClick={async () => {
                    const r = await fetch('/plugins/dsh-workbuddy2api/config/alerts', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        enabled: alertsDraft.enabled,
                        minCredit: Number(alertsDraft.minCredit || 50),
                        webhooksText: alertsDraft.webhooksText,
                        events: alertsDraft.events
                      })
                    });
                    const d = await r.json();
                    setActionMsg(`🔔 ${d.message || '告警已保存'}`);
                  }}
                >
                  保存告警
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, fontSize: 11, marginBottom: 6, alignItems: 'center', flexWrap: 'wrap' }}>
              <label>
                <input
                  type="checkbox"
                  checked={alertsDraft.enabled}
                  onChange={(e) => setAlertsDraft({ ...alertsDraft, enabled: e.target.checked })}
                />{' '}
                开启 Webhook 告警 (飞书/企微/钉钉/Telegram/Discord)
              </label>
              <label>
                低积分预警阈值:{' '}
                <input
                  type="number"
                  className="wb2a-input"
                  style={{ width: 70, display: 'inline-block' }}
                  value={alertsDraft.minCredit}
                  onChange={(e) => setAlertsDraft({ ...alertsDraft, minCredit: Number(e.target.value) })}
                />
              </label>
            </div>
            <textarea
              className="wb2a-input"
              rows={2}
              style={{ marginBottom: 8 }}
              placeholder="Webhook URL (换行分隔多个地址)"
              value={alertsDraft.webhooksText}
              onChange={(e) => setAlertsDraft({ ...alertsDraft, webhooksText: e.target.value })}
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr) auto', gap: 6, alignItems: 'end' }}>
              <div>
                <div style={{ fontSize: 10, color: '#64748b' }}>签到小时</div>
                <input className="wb2a-input" value={schedDraft.checkin} onChange={(e) => setSchedDraft({ ...schedDraft, checkin: e.target.value })} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#64748b' }}>猫猫小时</div>
                <input className="wb2a-input" value={schedDraft.travel} onChange={(e) => setSchedDraft({ ...schedDraft, travel: e.target.value })} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#64748b' }}>任务小时</div>
                <input className="wb2a-input" value={schedDraft.tasks} onChange={(e) => setSchedDraft({ ...schedDraft, tasks: e.target.value })} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#64748b' }}>开学季小时</div>
                <input className="wb2a-input" value={schedDraft.school} onChange={(e) => setSchedDraft({ ...schedDraft, school: e.target.value })} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#64748b' }}>夜猫小时</div>
                <input className="wb2a-input" value={schedDraft.cat} onChange={(e) => setSchedDraft({ ...schedDraft, cat: e.target.value })} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#64748b' }}>保活小时</div>
                <input className="wb2a-input" value={schedDraft.keepalive} onChange={(e) => setSchedDraft({ ...schedDraft, keepalive: e.target.value })} />
              </div>
              <button
                className="wb2a-btn wb2a-btn-sm"
                onClick={async () => {
                  const p = (s) => s.split(',').map((x) => Number(x.trim())).filter((n) => Number.isInteger(n) && n >= 0 && n <= 23);
                  await fetch('/plugins/dsh-workbuddy2api/config/schedule', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      schedule: {
                        checkinHours: p(schedDraft.checkin),
                        travelHours: p(schedDraft.travel),
                        tasksHours: p(schedDraft.tasks),
                        schoolHours: p(schedDraft.school),
                        catHours: p(schedDraft.cat),
                        keepaliveHours: p(schedDraft.keepalive)
                      }
                    })
                  });
                  setActionMsg('⏰ CST 自动排程小时已保存');
                }}
              >
                保存排程
              </button>
            </div>
          </div>

          <div className="wb2a-realm-card" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <strong style={{ fontSize: 12 }}>👥 多租户 Key 与版本更新检查 ({usersList.length} 用户)</strong>
              <button
                className="wb2a-btn wb2a-btn-secondary wb2a-btn-sm"
                onClick={async () => {
                  const r = await fetch('/plugins/dsh-workbuddy2api/system/update/check');
                  const d = await r.json();
                  setUpdateInfo(d);
                  setActionMsg(d.ok ? `🔄 当前 v${d.currentVersion} / 最新 ${d.latestVersion}` : `❌ ${d.error}`);
                }}
              >
                检查 GitHub 新版本
              </button>
            </div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
              <input className="wb2a-input" style={{ width: 100 }} placeholder="新用户名" value={newUserDraft.username} onChange={(e) => setNewUserDraft({ ...newUserDraft, username: e.target.value })} />
              <input className="wb2a-input" style={{ width: 100 }} type="password" placeholder="密码" value={newUserDraft.password} onChange={(e) => setNewUserDraft({ ...newUserDraft, password: e.target.value })} />
              <input className="wb2a-input" style={{ width: 85 }} type="number" placeholder="日限额" value={newUserDraft.dailyCreditLimit} onChange={(e) => setNewUserDraft({ ...newUserDraft, dailyCreditLimit: Number(e.target.value) })} />
              <input className="wb2a-input" style={{ width: 70 }} type="number" placeholder="RPM" value={newUserDraft.rpm} onChange={(e) => setNewUserDraft({ ...newUserDraft, rpm: Number(e.target.value) })} />
              <button
                className="wb2a-btn wb2a-btn-success wb2a-btn-sm"
                onClick={async () => {
                  const r = await fetch('/plugins/dsh-workbuddy2api/admin/users/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newUserDraft)
                  });
                  const d = await r.json();
                  setActionMsg(d.ok ? `👤 已创建租户 ${d.user?.username} (${d.user?.apiKey})` : `❌ ${d.error}`);
                  fetchAdminUsers();
                }}
              >
                + 添加租户
              </button>
            </div>
            {updateInfo && (
              <div style={{ fontSize: 11, color: '#475569', marginBottom: 4 }}>
                当前 v{updateInfo.currentVersion} · 最新 {updateInfo.latestVersion || '-'} {updateInfo.hasUpdate ? '⚠️ 有新版本可用' : '✅ 已是最新'}
              </div>
            )}
          </div>

          <div className="wb2a-realm-card" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <strong style={{ fontSize: 12 }}>🔌 DeepSeek Harness (DSH) 挂载自检与同步</strong>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="wb2a-btn wb2a-btn-secondary wb2a-btn-sm" onClick={fetchDshCheck}>检测</button>
                <button
                  className="wb2a-btn wb2a-btn-success wb2a-btn-sm"
                  onClick={async () => {
                    const res = await fetch('/plugins/dsh-workbuddy2api/dsh/sync', { method: 'POST' });
                    const d = await res.json();
                    setActionMsg(d.message || '已同步 DSH 配置');
                    fetchDshCheck();
                  }}
                >
                  同步 baseURL
                </button>
              </div>
            </div>
            <div style={{ fontSize: 11, color: '#475569' }}>
              Profile 注册: {dshInfo?.installedInProfile ? '✅ 已安装' : '⚪ 未检测'} · Patch 对齐: {dshInfo?.baseUrlMatched ? `✅ ${dshInfo.expectedBaseUrl}` : '⚠️ 未对齐'}
            </div>
          </div>

          <div className="wb2a-realm-card">
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>🔌 其他 IDE / CLI 一键接入卡片 (Claude Code · Codex · Cline · Cursor)</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { title: 'OpenAI Chat 兼容 (Cline/Cherry/Roo)', val: gatewayUrl, copy: gatewayUrl },
                { title: 'Claude Code CLI (Anthropic)', val: `http://127.0.0.1:${port}`, copy: `$env:ANTHROPIC_BASE_URL="http://127.0.0.1:${port}" ; $env:ANTHROPIC_API_KEY="sk-local"` },
                { title: 'Codex Responses API', val: `http://127.0.0.1:${port}/v1/responses`, copy: gatewayUrl },
                { title: '独立 Console / 公开 Portal', val: consoleUrl, copy: consoleUrl }
              ].map((c, idx) => (
                <div key={idx} style={{ background: '#f8fafc', border: '1px solid #dbe5f1', borderRadius: 8, padding: '8px 10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <strong style={{ fontSize: 11, color: '#1e3a8a' }}>{c.title}</strong>
                    <button className="wb2a-btn wb2a-btn-secondary wb2a-btn-sm" style={{ padding: '1px 6px', fontSize: 10 }} onClick={() => copyText(c.copy, c.title)}>复制</button>
                  </div>
                  <div style={{ fontFamily: 'Consolas, monospace', fontSize: 10, color: '#2563eb', wordBreak: 'break-all' }}>{c.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 换 Token 救活账号模态框 */}
      {updTokenModal && (
        <div className="wb2a-modal-backdrop">
          <div className="wb2a-modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <strong>更新凭证 / 救活账号 — {updTokenModal.nickname || updTokenModal.uid}</strong>
              <button className="wb2a-btn wb2a-btn-danger wb2a-btn-sm" onClick={() => setUpdTokenModal(null)}>
                关闭
              </button>
            </div>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 11, color: '#475569', marginBottom: 4 }}>新 Access Token (可选):</div>
              <textarea
                className="wb2a-input"
                rows={2}
                value={updTokenModal.accessToken}
                onChange={(e) => setUpdTokenModal({ ...updTokenModal, accessToken: e.target.value })}
              />
            </div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: '#475569', marginBottom: 4 }}>新 Refresh Token (推荐):</div>
              <textarea
                className="wb2a-input"
                rows={3}
                value={updTokenModal.refreshToken}
                onChange={(e) => setUpdTokenModal({ ...updTokenModal, refreshToken: e.target.value })}
              />
            </div>
            <button
              className="wb2a-btn wb2a-btn-success"
              onClick={async () => {
                const res = await fetch('/plugins/dsh-workbuddy2api/accounts/update_token', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(updTokenModal)
                });
                const d = await res.json();
                setActionMsg(d.ok ? `🔄 ${d.message}` : `❌ ${d.error}`);
                if (d.ok) {
                  setUpdTokenModal(null);
                  fetchStatus(true);
                  notifyBalanceUpdate();
                }
              }}
            >
              验证并立即救活账号
            </button>
          </div>
        </div>
      )}

      {/* OAUTH 授权模态框 */}
      {oauthModal && (
        <div className="wb2a-modal-backdrop">
          <div className="wb2a-modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <strong>{oauthModal.realm === 'global' ? '国际版 WorkBuddy AI' : '国内版 CodeBuddy'} OAuth 授权登录</strong>
              <button
                className="wb2a-btn wb2a-btn-danger wb2a-btn-sm"
                onClick={() => {
                  if (oauthTimerRef.current) clearInterval(oauthTimerRef.current);
                  setOauthModal(null);
                }}
              >
                取消
              </button>
            </div>
            <p style={{ fontSize: 12, color: '#475569' }}>
              若浏览器未自动弹出授权页面，请点击下方链接完成登录，系统正在自动轮询状态：
            </p>
            <div style={{ margin: '8px 0', wordBreak: 'break-all', fontSize: 11 }}>
              <a href={oauthModal.url} target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontWeight: 500 }}>
                {oauthModal.url}
              </a>
            </div>
            <div className="wb2a-badge wb2a-badge-warn">{oauthModal.notice}</div>
          </div>
        </div>
      )}

      {/* 批量 / ZIP 导入模态框 */}
      {importOpen && (
        <div className="wb2a-modal-backdrop">
          <div className="wb2a-modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <strong>批量 / ZIP 账号导入</strong>
              <button className="wb2a-btn wb2a-btn-danger wb2a-btn-sm" onClick={() => setImportOpen(false)}>
                关闭
              </button>
            </div>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 11, color: '#475569', marginBottom: 4 }}>默认区服:</div>
              <select className="wb2a-input" value={importRealm} onChange={(e) => setImportRealm(e.target.value)}>
                <option value="global">国际版 (Global / workbuddy.ai)</option>
                <option value="cn">国内版 (CN / codebuddy.cn)</option>
              </select>
            </div>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 11, color: '#475569', marginBottom: 4 }}>选择 .zip 备份包 / .json / .txt 文件:</div>
              <input type="file" accept=".zip,.json,.txt,.info" onChange={handleImportFileChange} />
            </div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: '#475569', marginBottom: 4 }}>或直接粘贴文本（支持 JSON / 注释 / access----refresh）:</div>
              <textarea
                className="wb2a-input"
                rows={6}
                value={importContent}
                onChange={(e) => setImportContent(e.target.value)}
                placeholder="accessToken----refreshToken"
              />
            </div>
            <button className="wb2a-btn wb2a-btn-success" onClick={handleSubmitImport} disabled={loading}>
              🚀 开始验证并批量入池
            </button>
            {importResult && (
              <div style={{ marginTop: 10, padding: 10, background: '#f8fafc', border: '1px solid #dbe5f1', borderRadius: 8, maxHeight: 180, overflowY: 'auto' }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                  <span className="wb2a-badge wb2a-badge-success">✅ 新增 {importResult.imported || 0}</span>
                  <span className="wb2a-badge">🔄 更新 {importResult.updated || 0}</span>
                  <span className={`wb2a-badge ${(importResult.failed || 0) > 0 ? 'wb2a-badge-warn' : 'wb2a-badge-success'}`}>❌ 失败 {importResult.failed || 0}</span>
                  {importResult.error && <span style={{ fontSize: 11, color: '#dc2626' }}>{importResult.error}</span>}
                  {!importResult.error && importResult.total === 0 && (
                    <span style={{ fontSize: 11, color: '#d97706' }}>未识别到有效凭证，请检查格式</span>
                  )}
                </div>
                {(importResult.details || importResult.results || importResult.items || []).slice(0, 20).map((it, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: '3px 0', borderBottom: '1px solid #e2e8f0' }}>
                    <span><strong>{it.nickname || it.uid || '未命名'}</strong> · {it.realm || importRealm}</span>
                    <span className={`wb2a-badge ${it.ok !== false ? 'wb2a-badge-success' : 'wb2a-badge-warn'}`}>{it.status || (it.ok !== false ? '成功' : (it.error || '失败'))}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 账号积分包明细模态框 */}
      {packsModalAcc && (
        <div className="wb2a-modal-backdrop">
          <div className="wb2a-modal" style={{ width: 600 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <strong>{packsModalAcc.nickname || packsModalAcc.uid} — 积分包明细</strong>
              <button className="wb2a-btn wb2a-btn-danger wb2a-btn-sm" onClick={() => setPacksModalAcc(null)}>
                关闭
              </button>
            </div>
            <div style={{ maxHeight: 340, overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                <thead>
                  <tr style={{ background: '#eff6ff', color: '#475569', textAlign: 'left' }}>
                    <th style={{ padding: 6 }}>名称</th>
                    <th style={{ padding: 6 }}>余量</th>
                    <th style={{ padding: 6 }}>总量</th>
                    <th style={{ padding: 6 }}>已用</th>
                    <th style={{ padding: 6 }}>到期时间</th>
                  </tr>
                </thead>
                <tbody>
                  {(packsModalAcc.balance?.packages || []).map((p, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: 6 }}><strong>{p.name}</strong></td>
                      <td style={{ padding: 6, color: '#2563eb', fontWeight: 700 }}>{p.remain}</td>
                      <td style={{ padding: 6 }}>{p.total}</td>
                      <td style={{ padding: 6 }}>{p.used}</td>
                      <td style={{ padding: 6, color: '#64748b' }}>{p.expireTime || '永久'}</td>
                    </tr>
                  ))}
                  {(!packsModalAcc.balance?.packages || packsModalAcc.balance.packages.length === 0) && (
                    <tr><td colSpan="5" style={{ padding: 10, color: '#64748b' }}>暂无活跃积分包明细</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

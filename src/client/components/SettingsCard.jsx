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

  // 福利 / 猫猫 / 邀请 / 成长任务
  const [selectedUid, setSelectedUid] = useState('');
  const [travelData, setTravelData] = useState(null);
  const [growthData, setGrowthData] = useState(null);
  const [inviteInfo, setInviteInfo] = useState(null);
  const [bindCodeInput, setBindCodeInput] = useState('');
  const [tasksList, setTasksList] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  // 模型管理与别名
  const [modelSearch, setModelSearch] = useState('');
  const [aliasesDraft, setAliasesDraft] = useState('{}');
  const [freeModelsDraft, setFreeModelsDraft] = useState('global:deepseek-v4.1-flash, cn:hy4free');

  // 网关设置表单
  const [cfgDraft, setCfgDraft] = useState({
    apiKey: '',
    proxy: '',
    maxInFlightCN: 3,
    maxInFlightGlobal: 2,
    queueTimeoutMs: 5000,
    promptMode: 'none',
    promptText: '',
    autoCheckin: true,
    autoTravel: true,
    autoRefreshToken: true
  });

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
        }
      }
    } catch (_) {}
  };

  const fetchModels = async () => {
    try {
      const res = await fetch('/plugins/dsh-workbuddy2api/models');
      if (res.ok) {
        const data = await res.json();
        setModelsData(data);
        setAliasesDraft(JSON.stringify(data.aliases || {}, null, 2));
        setFreeModelsDraft((data.freeModels || ['global:deepseek-v4.1-flash', 'cn:hy4free']).join(', '));
      }
    } catch (_) {}
  };

  const fetchUsage = async () => {
    try {
      const res = await fetch('/plugins/dsh-workbuddy2api/usage');
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
      const res = await fetch(`/plugins/dsh-workbuddy2api/tasks/list?uid=${encodeURIComponent(target)}`);
      if (res.ok) {
        const data = await res.json();
        setTasksList(data.tasks || []);
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

  useEffect(() => {
    if (tab === 'activity') fetchActivityPanel();
    if (tab === 'tasks') fetchTasksPanel();
    if (tab === 'models') fetchModels();
    if (tab === 'usage') fetchUsage();
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

  const handleSaveModels = async () => {
    let parsedAliases;
    try {
      parsedAliases = JSON.parse(aliasesDraft);
    } catch (e) {
      setActionMsg(`❌ 别名 JSON 格式错误: ${e.message}`);
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
          freeModels
        })
      });
      const data = await res.json();
      setActionMsg(data.ok ? '✅ 模型启用规则与别名配置已保存' : `❌ 保存失败`);
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
            padding: '7px 11px',
            borderRadius: 6,
            background: 'rgba(56,189,248,0.1)',
            border: '1px solid rgba(56,189,248,0.3)',
            fontSize: 12,
            color: '#bae6fd'
          }}
        >
          {actionMsg}
        </div>
      )}

      <div className="wb2a-tabs" style={{ flexWrap: 'wrap' }}>
        {[
          ['accounts', '总览与账号池'],
          ['activity', '猫猫旅行与福利'],
          ['tasks', '成长任务引擎'],
          ['models', '模型与别名'],
          ['usage', '积分与用量'],
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
              ['全池合计 (All)', summary.all, '#38bdf8'],
              ['国内版 (CodeBuddy CN)', summary.cn, '#4ade80'],
              ['国际版 (WorkBuddy AI)', summary.global, '#c084fc']
            ].map(([title, s = {}, color]) => (
              <div key={title} className="wb2a-realm-card">
                <div style={{ fontSize: 11, color: '#94a3b8' }}>{title}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color, margin: '4px 0' }}>
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
                    {acc.disabled && <span className="wb2a-badge" style={{ color: '#f87171', borderColor: '#f87171' }}>已停用</span>}
                    {!acc.disabled && diag.coolingDown && (
                      <span className="wb2a-badge wb2a-badge-warn">熔断 {diag.cooldownRemainingSec}s</span>
                    )}
                    {diag.modelCooldowns?.length > 0 && (
                      <span className="wb2a-badge wb2a-badge-warn">{diag.modelCooldowns.length}模型冷却</span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                    实时积分: <strong style={{ color: '#38bdf8' }}>{Number(bal.remain || 0).toLocaleString()}</strong> / {Number(bal.total || 0).toLocaleString()}
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
                  <button className="wb2a-btn wb2a-btn-secondary wb2a-btn-sm" onClick={() => handleAdminAction(acc.uid, 'refresh')}>
                    刷新
                  </button>
                  <button
                    className={`wb2a-btn wb2a-btn-sm ${acc.disabled ? 'wb2a-btn-success' : 'wb2a-btn-danger'}`}
                    onClick={() => handleAdminAction(acc.uid, acc.disabled ? 'enable' : 'disable')}
                  >
                    {acc.disabled ? '启用' : '停用'}
                  </button>
                  {(diag.coolingDown || diag.modelCooldowns?.length > 0) && (
                    <button className="wb2a-btn wb2a-btn-warn wb2a-btn-sm" onClick={() => handleAdminAction(acc.uid, 'revive')}>
                      解熔断
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

          <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #2a324b' }}>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>单条凭证快速入池（支持 Access / Refresh Token 自动解析）:</div>
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
                  appendLog(`全号吃满福利完成: ${JSON.stringify(data.results?.length || 0)} 个账号`);
                  fetchStatus(true);
                  notifyBalanceUpdate();
                } finally {
                  setLoading(false);
                }
              }}
            >
              全号一键吃满福利
            </button>
            <button
              className="wb2a-btn wb2a-btn-sm"
              onClick={async () => {
                setLoading(true);
                try {
                  const res = await fetch('/plugins/dsh-workbuddy2api/travel/run-all', { method: 'POST' });
                  const data = await res.json();
                  appendLog(`全池猫猫巡检完成 (${data.results?.length || 0} 个国内账号)`);
                  fetchActivityPanel();
                } finally {
                  setLoading(false);
                }
              }}
            >
              全池巡检猫猫旅行
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
                appendLog(d.message || '全池签到完成');
                fetchStatus(true);
                notifyBalanceUpdate();
              }}
            >
              全号每日签到
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <div className="wb2a-realm-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <strong style={{ fontSize: 13 }}>🐱 猫猫旅行管家</strong>
                <button
                  className="wb2a-btn wb2a-btn-sm"
                  onClick={async () => {
                    const res = await fetch('/plugins/dsh-workbuddy2api/travel/depart', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ uid: selectedUid || status?.activeUid })
                    });
                    const d = await res.json();
                    appendLog(`猫猫出发结果: ${JSON.stringify(d)}`);
                    fetchActivityPanel();
                  }}
                >
                  派出旅行
                </button>
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>
                宠物: {travelData?.buddy?.name || '未领养/仅CN支持'} · 状态: {travelData?.travel?.state || '-'} · 待领奖励: {travelData?.travel?.reward_credit || 0}
              </div>
            </div>

            <div className="wb2a-realm-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <strong style={{ fontSize: 13 }}>🎰 连登福利与抽奖</strong>
                <button
                  className="wb2a-btn wb2a-btn-success wb2a-btn-sm"
                  onClick={async () => {
                    const res = await fetch('/plugins/dsh-workbuddy2api/growth/lottery/draw', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ uid: selectedUid || status?.activeUid })
                    });
                    const d = await res.json();
                    appendLog(`抽奖结果: ${JSON.stringify(d.result)}`);
                    fetchActivityPanel();
                    notifyBalanceUpdate();
                  }}
                >
                  抽一次奖
                </button>
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>
                连登天数: {growthData?.streak?.streak_days ?? growthData?.streak?.days ?? '-'} · 抽奖次数: {growthData?.chances?.remaining ?? growthData?.chances?.chances ?? 0}
              </div>
            </div>
          </div>

          <div className="wb2a-realm-card" style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>🎁 官方专属邀请中心</div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>
              邀请码: <strong style={{ color: '#38bdf8' }}>{inviteInfo?.inviteCode || '-'}</strong>
              {' · '}专属链接: <a href={inviteInfo?.inviteUrl} target="_blank" rel="noreferrer" style={{ color: '#4ade80' }}>{inviteInfo?.inviteUrl || '-'}</a>
              {' · '}已邀请: {inviteInfo?.invitedCount || 0} 人
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                className="wb2a-input"
                placeholder="输入推荐人邀请码进行受邀绑定..."
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
                  appendLog(`邀请绑定: ${d.message || JSON.stringify(d)}`);
                  setActionMsg(d.message || '绑定请求已执行');
                  fetchStatus(true);
                }}
              >
                立即绑定
              </button>
            </div>
          </div>

          <pre className="wb2a-code" style={{ maxHeight: 160 }}>{activityLogs.join('\n') || '暂无活动日志'}</pre>
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
            <button className="wb2a-btn wb2a-btn-secondary wb2a-btn-sm" onClick={() => fetchTasksPanel()}>
              ↻ 刷新清单
            </button>
          </div>

          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {tasksList.map((task, idx) => {
              const st = task.accept_status || (task.claimed ? 'claimed' : task.completed ? 'completed' : 'pending');
              return (
                <div key={task.task_code || task.code || idx} className="wb2a-account-item" style={{ padding: '8px 12px' }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{task.title || task.name || task.task_code}</div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>
                      {task.task_code || task.code} · 奖励 +{task.reward_credit || 0}
                    </div>
                  </div>
                  <span className={`wb2a-badge ${st === 'claimed' ? 'wb2a-badge-success' : st === 'completed' ? 'wb2a-badge-warn' : ''}`}>
                    {st === 'claimed' ? '已领奖' : st === 'completed' ? '待领取' : st === 'accepted' ? '进行中' : '未开始'}
                  </span>
                </div>
              );
            })}
            {tasksList.length === 0 && (
              <div style={{ fontSize: 12, color: '#94a3b8', padding: 12 }}>当前选中账号暂无返回任务条目（成长任务主要面向 CN 国内版账号）</div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: 模型与别名 */}
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
                  setActionMsg(`🔍 模型目录同步成功，总计 ${d.models?.length || 0} 个可用模型`);
                  await fetchModels();
                } finally {
                  setLoading(false);
                }
              }}
            >
              🔍 从上游动态发现最新模型
            </button>
            <button className="wb2a-btn wb2a-btn-sm" onClick={handleSaveModels} disabled={loading}>
              💾 保存模型过滤与别名
            </button>
            <input
              className="wb2a-input"
              style={{ width: 180 }}
              placeholder="筛选模型 ID..."
              value={modelSearch}
              onChange={(e) => setModelSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12 }}>
            <div style={{ maxHeight: 340, overflowY: 'auto', border: '1px solid #2a324b', borderRadius: 8, padding: 8 }}>
              <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 6 }}>
                启用模型勾选（全不勾选代表默认全部放行）:
              </div>
              {(modelsData.models || [])
                .filter((m) => !modelSearch || m.id.toLowerCase().includes(modelSearch.toLowerCase()))
                .map((m) => (
                  <label
                    key={m.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '5px 6px',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      fontSize: 12,
                      cursor: 'pointer'
                    }}
                  >
                    <span>
                      <input
                        type="checkbox"
                        checked={(modelsData.enabledModels || []).includes(m.id)}
                        onChange={() => handleToggleModel(m.id)}
                        style={{ marginRight: 6 }}
                      />
                      <strong>{m.id}</strong>
                      {m.source === 'discovered' && <span className="wb2a-badge" style={{ marginLeft: 4 }}>动态</span>}
                    </span>
                    <span style={{ fontSize: 10, color: '#64748b' }}>
                      {m.realm} · {m.rate || '-'}
                    </span>
                  </label>
                ))}
            </div>

            <div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>auto-free 智能免费路由顺序 (逗号分隔):</div>
              <input
                className="wb2a-input"
                style={{ marginBottom: 10 }}
                value={freeModelsDraft}
                onChange={(e) => setFreeModelsDraft(e.target.value)}
              />
              <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>客户端模型别名映射表 (JSON):</div>
              <textarea
                className="wb2a-input"
                rows={12}
                value={aliasesDraft}
                onChange={(e) => setAliasesDraft(e.target.value)}
                style={{ fontFamily: 'monospace' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: 积分与用量 */}
      {tab === 'usage' && (
        <div>
          <div className="wb2a-grid-stats">
            <div className="wb2a-stat-box">
              <div className="wb2a-stat-value">{usage?.today?.requests || 0}</div>
              <div className="wb2a-stat-label">今日请求</div>
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
              <div className="wb2a-stat-value">{usage?.summary?.totalRequests || 0}</div>
              <div className="wb2a-stat-label">历史总请求</div>
            </div>
          </div>

          <div className="wb2a-toolbar">
            <button className="wb2a-btn wb2a-btn-secondary wb2a-btn-sm" onClick={fetchUsage}>
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

          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>近 7 天请求与 Token 消耗明细:</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
            {(usage?.trend7d || []).map((d) => (
              <div key={d.date} className="wb2a-stat-box" style={{ padding: 8 }}>
                <div style={{ fontSize: 10, color: '#64748b' }}>{d.date}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#38bdf8', margin: '3px 0' }}>
                  {d.requests} 次
                </div>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>{Number(d.tokens || 0).toLocaleString()} tok</div>
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
              <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>网关 API Key (留空免鉴权):</div>
              <input
                className="wb2a-input"
                value={cfgDraft.apiKey || ''}
                onChange={(e) => setCfgDraft({ ...cfgDraft, apiKey: e.target.value })}
                placeholder="sk-workbuddy-..."
              />
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>上游 HTTP 代理 (留空直连):</div>
              <input
                className="wb2a-input"
                value={cfgDraft.proxy || ''}
                onChange={(e) => setCfgDraft({ ...cfgDraft, proxy: e.target.value })}
                placeholder="http://127.0.0.1:7890"
              />
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>国内版 CN 单号最大并发:</div>
              <input
                type="number"
                className="wb2a-input"
                value={cfgDraft.maxInFlightCN || 3}
                onChange={(e) => setCfgDraft({ ...cfgDraft, maxInFlightCN: Number(e.target.value) })}
              />
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>国际版 Global 单号最大并发:</div>
              <input
                type="number"
                className="wb2a-input"
                value={cfgDraft.maxInFlightGlobal || 2}
                onChange={(e) => setCfgDraft({ ...cfgDraft, maxInFlightGlobal: Number(e.target.value) })}
              />
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>并发队列等待超时 (ms):</div>
              <input
                type="number"
                className="wb2a-input"
                value={cfgDraft.queueTimeoutMs ?? 5000}
                onChange={(e) => setCfgDraft({ ...cfgDraft, queueTimeoutMs: Number(e.target.value) })}
              />
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>System Prompt 注入模式:</div>
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
            <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>自定义 System Prompt 文本:</div>
            <textarea
              className="wb2a-input"
              rows={3}
              value={cfgDraft.promptText || ''}
              onChange={(e) => setCfgDraft({ ...cfgDraft, promptText: e.target.value })}
            />
          </div>

          <div className="wb2a-toolbar" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
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
                  checked={cfgDraft.autoRefreshToken !== false}
                  onChange={(e) => setCfgDraft({ ...cfgDraft, autoRefreshToken: e.target.checked })}
                />{' '}
                5分钟Token保活
              </label>
            </div>
            <button className="wb2a-btn wb2a-btn-success" onClick={handleSaveConfig} disabled={loading}>
              💾 保存网关配置
            </button>
          </div>

          <pre className="wb2a-code">
{`OpenAI Chat Base URL : ${gatewayUrl}
Anthropic Messages   : http://127.0.0.1:${port}/v1/messages
OpenAI Responses     : http://127.0.0.1:${port}/v1/responses
Video Generations    : http://127.0.0.1:${port}/v1/videos/generations
Cyberpunk Web Console: ${consoleUrl}`}
          </pre>
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
            <p style={{ fontSize: 12, color: '#94a3b8' }}>
              若浏览器未自动弹出授权页面，请点击下方链接完成登录，系统正在自动轮询状态：
            </p>
            <div style={{ margin: '8px 0', wordBreak: 'break-all', fontSize: 11 }}>
              <a href={oauthModal.url} target="_blank" rel="noreferrer" style={{ color: '#38bdf8' }}>
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
              <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>默认区服:</div>
              <select className="wb2a-input" value={importRealm} onChange={(e) => setImportRealm(e.target.value)}>
                <option value="global">国际版 (Global / workbuddy.ai)</option>
                <option value="cn">国内版 (CN / codebuddy.cn)</option>
              </select>
            </div>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>选择 .zip 备份包 / .json / .txt 文件:</div>
              <input type="file" accept=".zip,.json,.txt,.info" onChange={handleImportFileChange} />
            </div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>或直接粘贴文本（支持 JSON / 注释 / access----refresh）:</div>
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
              <pre className="wb2a-code" style={{ marginTop: 10, maxHeight: 160 }}>
                {JSON.stringify(importResult, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

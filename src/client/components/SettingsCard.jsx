/**
 * SettingsCard.jsx - DSH 设置卡片综合管理中枢
 * 支持：账号池智能调度、模型别名、积分账本、🐱 猫猫旅行管家、🎁 成长活动福利与连登抽奖、📋 成长任务全自动收割
 */

import React, { useState, useEffect } from 'react';

export function SettingsCard({ t }) {
  const [tab, setTab] = useState('accounts');
  const [status, setStatus] = useState(null);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newToken, setNewToken] = useState('');
  const [newRealm, setNewRealm] = useState('global');
  const [newNickname, setNewNickname] = useState('');

  // 活动与猫猫旅行状态
  const [travelData, setTravelData] = useState(null);
  const [growthData, setGrowthData] = useState(null);
  const [tasksList, setTasksList] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [actionMsg, setActionMsg] = useState('');

  const notifyBalanceUpdate = () => {
    try {
      window.dispatchEvent(new CustomEvent('wb2a:refresh-balance'));
    } catch (_) {}
  };

  const fetchStatus = async () => {
    try {
      const res = await fetch('/plugins/dsh-workbuddy2api/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
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

  const fetchActivity = async () => {
    try {
      const [tRes, gRes, taskRes] = await Promise.all([
        fetch('/plugins/dsh-workbuddy2api/travel/status'),
        fetch('/plugins/dsh-workbuddy2api/growth/status'),
        fetch('/plugins/dsh-workbuddy2api/tasks/list')
      ]);
      if (tRes.ok) {
        const td = await tRes.json();
        setTravelData(td);
      }
      if (gRes.ok) {
        const gd = await gRes.json();
        setGrowthData(gd);
      }
      if (taskRes.ok) {
        const kd = await taskRes.json();
        setTasksList(kd.tasks || []);
      }
    } catch (_) {}
  };

  useEffect(() => {
    fetchStatus();
    fetchUsage();
    fetchActivity();

    const onFocus = () => {
      fetchStatus();
      fetchActivity();
    };
    window.addEventListener('focus', onFocus);
    window.addEventListener('wb2a:refresh-balance', onFocus);

    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('wb2a:refresh-balance', onFocus);
    };
  }, []);

  const handleSwitchAccount = async (uid) => {
    setLoading(true);
    await fetch('/plugins/dsh-workbuddy2api/accounts/switch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid })
    });
    notifyBalanceUpdate();
    await fetchStatus();
    await fetchActivity();
    setLoading(false);
  };

  const handleAddAccount = async () => {
    if (!newToken.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/plugins/dsh-workbuddy2api/accounts/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: newToken.trim(),
          realm: newRealm,
          nickname: newNickname.trim() || undefined
        })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || '添加账号失败');
      } else {
        setNewToken('');
        setNewNickname('');
        await fetchStatus();
      }
    } catch (e) {
      alert(`网络异常: ${e.message}`);
    }
    setLoading(false);
  };

  const handleDeleteAccount = async (uid) => {
    if (!confirm(`确定要移除账号 ${uid} 吗？`)) return;
    await fetch('/plugins/dsh-workbuddy2api/accounts/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid })
    });
    await fetchStatus();
  };

  // 派出猫猫旅行
  const handleDepartTravel = async (locationId = 4) => {
    setLoading(true);
    setActionMsg('正在派出猫猫旅行...');
    try {
      const res = await fetch('/plugins/dsh-workbuddy2api/travel/depart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationId })
      });
      const data = await res.json();
      setActionMsg(data.message || (data.ok ? '派出成功' : '派出失败'));
      await fetchActivity();
    } catch (e) {
      setActionMsg(`派出异常: ${e.message}`);
    }
    setLoading(false);
  };

  // 领取猫猫到站旅行奖励
  const handleClaimTravel = async (recordId) => {
    setLoading(true);
    setActionMsg('正在领取猫猫旅行奖励...');
    try {
      const res = await fetch('/plugins/dsh-workbuddy2api/travel/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recordId })
      });
      const data = await res.json();
      setActionMsg(data.message || (data.ok ? '领取成功' : '领取失败'));
      await fetchActivity();
      await fetchStatus();
    } catch (e) {
      setActionMsg(`领取异常: ${e.message}`);
    }
    setLoading(false);
  };

  // 连登抽奖
  const handleDrawLottery = async () => {
    setLoading(true);
    setActionMsg('正在执行抽奖...');
    try {
      const res = await fetch('/plugins/dsh-workbuddy2api/growth/lottery/draw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (data.result?.ok) {
        setActionMsg(`🎉 ${data.result.message} (剩余 ${data.remainingChances} 次)`);
      } else {
        setActionMsg(data.result?.message || '抽奖完成');
      }
      await fetchActivity();
      await fetchStatus();
    } catch (e) {
      setActionMsg(`抽奖异常: ${e.message}`);
    }
    setLoading(false);
  };

  // 一键拉满全套福利 (活跃上报+签到+礼包+补偿+领养猫猫+派猫+连登+抽奖+成长任务)
  const handleClaimAllWelfare = async (all = false) => {
    setLoading(true);
    setActionMsg(all ? '正在为账号池所有账号批量拉满全套福利...' : '正在为当前账号执行全套活动与成长任务自动化...');
    try {
      const res = await fetch('/plugins/dsh-workbuddy2api/growth/claim-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all })
      });
      const data = await res.json();
      if (data.ok) {
        if (all) {
          setActionMsg(`✅ 全池批量拉满完成！共巡检 ${data.results?.length || 0} 个账号`);
        } else {
          setActionMsg(data.result?.summary || '福利与成长任务已全部完成');
          setActivityLogs(data.result?.log || []);
        }
      } else {
        setActionMsg(data.message || '执行异常');
      }
      await fetchActivity();
      await fetchStatus();
    } catch (e) {
      setActionMsg(`执行异常: ${e.message}`);
    }
    setLoading(false);
  };

  // 专门触发成长任务一键自动点亮与收割
  const handleRunAllTasks = async () => {
    setLoading(true);
    setActionMsg('⚡ 正在自动分析、模拟上报并收割所有成长任务...');
    try {
      const res = await fetch('/plugins/dsh-workbuddy2api/tasks/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (data.ok && data.result) {
        setActionMsg(data.result.summary || '成长任务收割完成');
        setActivityLogs(data.result.logs || []);
      } else {
        setActionMsg(data.message || '成长任务收割完成');
      }
      await fetchActivity();
      await fetchStatus();
    } catch (e) {
      setActionMsg(`成长任务执行异常: ${e.message}`);
    }
    setLoading(false);
  };

  const buddy = travelData?.buddy;
  const travel = travelData?.travel || {};
  const streak = growthData?.streak || {};
  const chances = growthData?.chances ?? 0;
  const claimedCount = tasksList.filter(t => t.accept_status === 'claimed').length;

  return (
    <div className="wb2a-card">
      <div className="wb2a-header">
        <div className="wb2a-title">
          <span>⚡ WorkBuddy 2API 网关中枢</span>
          <span className="wb2a-badge wb2a-badge-success">已连接</span>
        </div>
        <div style={{ fontSize: 12, color: '#94a3b8' }}>
          网关端口: <strong style={{ color: '#38bdf8' }}>{status?.gatewayPort || 7863}</strong>
        </div>
      </div>

      <div className="wb2a-tabs">
        <button className={`wb2a-tab-btn ${tab === 'accounts' ? 'active' : ''}`} onClick={() => setTab('accounts')}>
          账号池 ({status?.accounts?.length || 0})
        </button>
        <button className={`wb2a-tab-btn ${tab === 'activity' ? 'active' : ''}`} onClick={() => { setTab('activity'); fetchActivity(); }}>
          🐱 猫猫旅行与活动福利
        </button>
        <button className={`wb2a-tab-btn ${tab === 'models' ? 'active' : ''}`} onClick={() => setTab('models')}>
          模型与别名
        </button>
        <button className={`wb2a-tab-btn ${tab === 'usage' ? 'active' : ''}`} onClick={() => { setTab('usage'); fetchUsage(); }}>
          积分与用量
        </button>
        <button className={`wb2a-tab-btn ${tab === 'gateway' ? 'active' : ''}`} onClick={() => setTab('gateway')}>
          网关设置
        </button>
      </div>

      {/* 选项卡 1：账号池 */}
      {tab === 'accounts' && (
        <div>
          <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#cbd5e1' }}>多账号调度池 (支持国际版/国内版自动轮转与故障自愈)</span>
            <button className="wb2a-btn wb2a-btn-secondary" onClick={fetchStatus}>刷新状态</button>
          </div>

          {status?.accounts?.map((acc) => {
            const isActive = acc.uid === status.activeUid;
            const balRemain = acc.balance?.remain;
            const balText = typeof balRemain === 'number'
              ? `${balRemain.toLocaleString()} 积分`
              : (balRemain ?? '计算中...');
            return (
              <div key={acc.uid} className={`wb2a-account-item ${isActive ? 'active' : ''}`}>
                <div>
                  <div style={{ fontWeight: 600, color: isActive ? '#38bdf8' : '#f1f5f9', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span>{acc.nickname || acc.uid}</span>
                    {isActive && <span className="wb2a-badge wb2a-badge-success">当前主账号</span>}
                    {acc.coolingDown && <span className="wb2a-badge wb2a-badge-warn">冷却熔断中</span>}
                    <span className="wb2a-badge" style={{ background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
                      ⚡ {balText}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                    UID: {acc.uid} · 版本: {acc.realm === 'global' ? '国际版 (workbuddy.ai)' : '国内版 (codebuddy.cn)'} · 在途并发: {acc.inFlight}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {!isActive && (
                    <button className="wb2a-btn" onClick={() => handleSwitchAccount(acc.uid)} disabled={loading}>
                      设为主号
                    </button>
                  )}
                  <button className="wb2a-btn wb2a-btn-danger" onClick={() => handleDeleteAccount(acc.uid)}>
                    移除
                  </button>
                </div>
              </div>
            );
          })}

          {/* 粘贴 Token 添加账号 */}
          <div style={{ marginTop: 16, padding: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px dashed #2a324b' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#38bdf8', marginBottom: 8 }}>+ 粘贴 Token 添加账号</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input
                className="wb2a-input"
                placeholder="粘贴 refreshToken 或完整 JSON 凭证"
                value={newToken}
                onChange={(e) => setNewToken(e.target.value)}
              />
              <select
                className="wb2a-input"
                style={{ width: 120 }}
                value={newRealm}
                onChange={(e) => setNewRealm(e.target.value)}
              >
                <option value="global">国际版</option>
                <option value="cn">国内版</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="wb2a-input"
                placeholder="账号备注别名 (可选)"
                value={newNickname}
                onChange={(e) => setNewNickname(e.target.value)}
              />
              <button className="wb2a-btn" onClick={handleAddAccount} disabled={loading || !newToken.trim()}>
                {loading ? '正在验证...' : '验证并加入池'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 选项卡 2：🐱 猫猫旅行与活动福利 */}
      {tab === 'activity' && (
        <div>
          {/* 猫猫旅行状态看板 */}
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid #2a324b', borderRadius: 8, padding: 14, marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#38bdf8' }}>
                🐱 猫猫旅行管家 (Cat Travel)
              </div>
              <button className="wb2a-btn wb2a-btn-secondary" style={{ fontSize: 11 }} onClick={fetchActivity}>
                刷新状态
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 12 }}>
              <div className="wb2a-stat-box">
                <div className="wb2a-stat-value" style={{ fontSize: 15, color: '#f1f5f9' }}>
                  {buddy ? buddy.name : '未领养'}
                </div>
                <div className="wb2a-stat-label">小猫档案 (首次领养+300分)</div>
              </div>
              <div className="wb2a-stat-box">
                <div className="wb2a-stat-value" style={{ fontSize: 15 }}>
                  {travel.state === 'arrived' ? (
                    <span style={{ color: '#4ade80' }}>已到站 (待领奖)</span>
                  ) : travel.state === 'traveling' ? (
                    <span style={{ color: '#38bdf8' }}>旅行中...</span>
                  ) : travel.dailyLimitReached ? (
                    <span style={{ color: '#94a3b8' }}>今日已满</span>
                  ) : (
                    <span style={{ color: '#facc15' }}>空闲中</span>
                  )}
                </div>
                <div className="wb2a-stat-label">旅行状态</div>
              </div>
              <div className="wb2a-stat-box">
                <div className="wb2a-stat-value" style={{ fontSize: 15, color: '#4ade80' }}>
                  {travel.rewardCredit ? `+${travel.rewardCredit} 积分` : '0'}
                </div>
                <div className="wb2a-stat-label">到站待领积分</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                className="wb2a-btn"
                onClick={() => handleDepartTravel(4)}
                disabled={loading || travel.state === 'traveling' || travel.dailyLimitReached}
              >
                🚀 派出猫猫旅行 (古镇客栈)
              </button>
              {travel.state === 'arrived' && travel.recordId && (
                <button
                  className="wb2a-btn"
                  style={{ background: '#16a34a' }}
                  onClick={() => handleClaimTravel(travel.recordId)}
                  disabled={loading}
                >
                  🎁 领取到站奖励 (+{travel.rewardCredit} 分)
                </button>
              )}
            </div>
          </div>

          {/* 连登与抽奖中心 */}
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid #2a324b', borderRadius: 8, padding: 14, marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#facc15', marginBottom: 10 }}>
              🌟 连登里程碑与抽奖中心
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 12 }}>
              <div className="wb2a-stat-box">
                <div className="wb2a-stat-value">{streak.days || 0} 天</div>
                <div className="wb2a-stat-label">连续登录天数</div>
              </div>
              <div className="wb2a-stat-box">
                <div className="wb2a-stat-value">{streak.makeupCards?.balance || 0} 张</div>
                <div className="wb2a-stat-label">可用补签卡 (防断档)</div>
              </div>
              <div className="wb2a-stat-box">
                <div className="wb2a-stat-value" style={{ color: '#facc15' }}>{chances} 次</div>
                <div className="wb2a-stat-label">当前抽奖次数余额</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="wb2a-btn wb2a-btn-secondary"
                onClick={handleDrawLottery}
                disabled={loading || chances <= 0}
              >
                🎰 连登抽奖 ({chances} 次可用)
              </button>
            </div>
          </div>

          {/* 📋 成长任务全自动点亮与收割看板 */}
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid #2a324b', borderRadius: 8, padding: 14, marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#a78bfa' }}>
                  📋 官方成长任务全自动收割 ({claimedCount}/{tasksList.length} 已收割)
                </span>
                <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 8 }}>
                  覆盖模板使用、专家团队、轻量云、创建画布、桌面对话、资料库体验等全部加分项
                </span>
              </div>
              <button
                className="wb2a-btn"
                style={{ background: '#7c3aed', padding: '6px 14px' }}
                onClick={handleRunAllTasks}
                disabled={loading}
              >
                ⚡ 一键自动完成所有任务并领积分
              </button>
            </div>

            {/* 任务微型清单瀑布流 */}
            <div style={{ maxHeight: 180, overflowY: 'auto', background: 'rgba(0,0,0,0.25)', borderRadius: 6, padding: 8 }}>
              {tasksList.map(t => {
                const isClaimed = t.accept_status === 'claimed';
                const isCompleted = t.accept_status === 'completed';
                const cur = t.progress?.current ?? 0;
                const tgt = t.progress?.target ?? 1;
                return (
                  <div key={t.task_code} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 6px', fontSize: 12, borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: isClaimed ? '#4ade80' : isCompleted ? '#38bdf8' : '#facc15' }}>
                        {isClaimed ? '●' : '○'}
                      </span>
                      <span style={{ color: isClaimed ? '#94a3b8' : '#f1f5f9' }}>{t.title}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <span style={{ color: '#64748b', fontSize: 11 }}>{cur}/{tgt}</span>
                      <span style={{ color: isClaimed ? '#4ade80' : '#facc15', fontSize: 11 }}>
                        {isClaimed ? '已到账' : `+${t.reward_credit || 100}分`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 一键全套福利聚合操作 */}
          <div style={{ background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: 8, padding: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#38bdf8', marginBottom: 6 }}>
              ✨ 一键自动化福利引擎
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12 }}>
              按顺序串联执行：对话活跃5连发 + 每日签到 + 新手礼包 + 活动补偿 + 领养第一只猫（送300积分）+ 派出猫猫/到站领奖 + 连登各档位里程碑兑换 + 自动抽完所有抽奖机会 + 补签卡检查 + <strong>成长任务全自动点亮与收割</strong>。
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="wb2a-btn"
                style={{ padding: '8px 18px', fontWeight: 600 }}
                onClick={() => handleClaimAllWelfare(false)}
                disabled={loading}
              >
                🌟 当前主号一键吃满福利
              </button>
              <button
                className="wb2a-btn wb2a-btn-secondary"
                style={{ padding: '8px 18px' }}
                onClick={() => handleClaimAllWelfare(true)}
                disabled={loading}
              >
                🌐 全池账号批量巡检拉满
              </button>
            </div>

            {actionMsg && (
              <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(0,0,0,0.3)', borderRadius: 6, fontSize: 13, color: '#38bdf8' }}>
                {actionMsg}
              </div>
            )}

            {activityLogs.length > 0 && (
              <div style={{ marginTop: 10, background: 'rgba(0,0,0,0.4)', borderRadius: 6, padding: 10, maxHeight: 150, overflowY: 'auto', fontSize: 12 }}>
                <div style={{ fontWeight: 600, color: '#94a3b8', marginBottom: 4 }}>执行流水日志:</div>
                {activityLogs.map((log, idx) => (
                  <div key={idx} style={{ color: log.ok ? '#4ade80' : '#cbd5e1', padding: '2px 0' }}>
                    • [{log.step}]: {log.title || log.message || (log.ok ? '完成' : JSON.stringify(log))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 选项卡 3：模型与别名 */}
      {tab === 'models' && (
        <div>
          <div style={{ fontSize: 13, color: '#cbd5e1', marginBottom: 8 }}>常用第三方客户端模型别名映射 (Cursor / Dify / NextChat)</div>
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: 10, borderRadius: 6, marginBottom: 12 }}>
            {Object.entries(status?.aliases || {}).map(([alias, target]) => (
              <div key={alias} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 12 }}>
                <code style={{ color: '#38bdf8' }}>{alias}</code>
                <span style={{ color: '#94a3b8' }}>→</span>
                <code style={{ color: '#4ade80' }}>{target}</code>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>
            提示：所有上游模型均支持推理思考档位自动归一化（避免 11150 错误），并支持视频大模型（可灵 3.0 / 海螺 H3）直出！
          </div>
        </div>
      )}

      {/* 选项卡 4：积分与用量 */}
      {tab === 'usage' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: '#cbd5e1' }}>实时积分计量与本地 Token 账本</span>
            <button
              className="wb2a-btn wb2a-btn-secondary"
              style={{ fontSize: 11 }}
              onClick={() => { fetchStatus(); fetchUsage(); }}
              disabled={loading}
            >
              🔄 立即核对上游积分
            </button>
          </div>

          <div className="wb2a-grid-stats">
            <div className="wb2a-stat-box">
              <div className="wb2a-stat-value">{usage?.today?.totalTokens || 0}</div>
              <div className="wb2a-stat-label">今日总消耗 Tokens</div>
            </div>
            <div className="wb2a-stat-box">
              <div className="wb2a-stat-value">{usage?.today?.requests || 0}</div>
              <div className="wb2a-stat-label">今日请求次数</div>
            </div>
            <div className="wb2a-stat-box">
              <div className="wb2a-stat-value" style={{ color: '#38bdf8' }}>
                {typeof status?.balance?.remain === 'number' ? status.balance.remain.toLocaleString() : (status?.balance?.remain || '正常')}
              </div>
              <div className="wb2a-stat-label">当前主号实时可用积分</div>
            </div>
            <div className="wb2a-stat-box">
              <div className="wb2a-stat-value">{usage?.summary?.totalRequests || 0}</div>
              <div className="wb2a-stat-label">历史累计请求数</div>
            </div>
          </div>

          <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>近 7 天调用走势与缓存命中率</div>
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: 10, borderRadius: 6, marginBottom: 14 }}>
            {usage?.trend7d?.map((d) => (
              <div key={d.date} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '4px 0' }}>
                <span style={{ color: '#94a3b8' }}>{d.date}</span>
                <span style={{ color: '#38bdf8' }}>{d.tokens} Tokens ({d.requests} 次)</span>
                <span style={{ color: '#4ade80' }}>缓存命中: {d.hitRate}%</span>
              </div>
            ))}
          </div>

          {status?.balance?.packages?.length > 0 && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>
                当前有效积分权益包清单 (共 {status.balance.packages.length} 个)
              </div>
              <div style={{ maxHeight: 200, overflowY: 'auto', background: 'rgba(0,0,0,0.25)', padding: 8, borderRadius: 6 }}>
                {status.balance.packages.map((p, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, padding: '5px 4px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ color: '#f1f5f9', fontWeight: 500 }}>{p.name}</span>
                      <span style={{ color: '#64748b', fontSize: 10 }}>到期时间: {p.expireTime || '长期有效'}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ color: '#38bdf8', fontWeight: 600 }}>{p.remain}</span>
                      <span style={{ color: '#94a3b8', fontSize: 11 }}> / {p.size || (p.remain + p.used)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 选项卡 5：网关设置 */}
      {tab === 'gateway' && (
        <div>
          <div style={{ fontSize: 13, color: '#e2e8f0', marginBottom: 8, fontWeight: 600 }}>本地 OpenAI 兼容网关信息</div>
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 6, fontSize: 12 }}>
            <div style={{ marginBottom: 6 }}>
              <strong>API Base URL:</strong> <code style={{ color: '#38bdf8' }}>http://127.0.0.1:{status?.gatewayPort || 7863}/v1</code>
            </div>
            <div style={{ marginBottom: 6 }}>
              <strong>API Key:</strong> <code style={{ color: '#94a3b8' }}>随意填写（或留空）</code>
            </div>
            <div style={{ color: '#64748b', fontSize: 11, marginTop: 8 }}>
              可在 Cursor、Cherry Studio、Dify 等任何外部工具中直接配置上述 Base URL，享受与 DSH 完全一致的高可用账号池调度！
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

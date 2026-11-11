/**
 * ComposerDock.jsx - 输入框下方挂载的极速实时积分、三区合计与 Console 快捷入口
 */

import React, { useState, useEffect, useRef } from 'react';

export function ComposerDock() {
  const [balance, setBalance] = useState(null);
  const [summary, setSummary] = useState(null);
  const [activeAccount, setActiveAccount] = useState(null);
  const [gatewayPort, setGatewayPort] = useState(7863);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);

  const fetchStatus = async (forceRefresh = false) => {
    try {
      setLoading(true);
      const res = await fetch(`/plugins/dsh-workbuddy2api/status${forceRefresh ? '?refresh=1' : ''}`);
      if (res.ok) {
        const data = await res.json();
        setBalance(data.balance);
        setSummary(data.summary || null);
        if (data.gatewayPort) setGatewayPort(data.gatewayPort);
        const active = data.accounts?.find((a) => a.uid === data.activeUid);
        setActiveAccount(active);
      }
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus(false);

    const handleFocus = () => fetchStatus(false);
    const handleCustomUpdate = () => fetchStatus(false);

    window.addEventListener('focus', handleFocus);
    window.addEventListener('wb2a:refresh-balance', handleCustomUpdate);

    timerRef.current = setInterval(() => fetchStatus(false), 12000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('wb2a:refresh-balance', handleCustomUpdate);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formattedRemain = typeof balance?.remain === 'number'
    ? balance.remain.toLocaleString()
    : (balance?.remain ?? '就绪');

  const poolTotal = typeof summary?.all?.remain === 'number'
    ? summary.all.remain.toLocaleString()
    : null;

  return (
    <div className="wb2a-dock-line">
      <span>⚡ WorkBuddy 2API</span>
      <span>·</span>
      <span>
        实时积分:{' '}
        <strong
          style={{
            color: '#2563eb',
            fontWeight: 700
          }}
          title={balance?.packages?.length ? `已挂载 ${balance.packages.length} 个积分包` : ''}
        >
          {formattedRemain}
        </strong>
        {poolTotal && (
          <span style={{ color: '#64748b', marginLeft: 4 }}>
            (全池 {poolTotal})
          </span>
        )}
      </span>
      {activeAccount && (
        <>
          <span>·</span>
          <span style={{ color: '#334155' }}>
            {activeAccount.nickname || activeAccount.uid.slice(0, 8)} ({activeAccount.realm})
          </span>
        </>
      )}
      <button
        style={{
          background: 'transparent',
          border: 'none',
          color: loading ? '#2563eb' : '#64748b',
          cursor: 'pointer',
          fontSize: 12,
          padding: '0 2px',
          display: 'inline-flex',
          alignItems: 'center',
          transition: 'transform 0.3s ease',
          transform: loading ? 'rotate(180deg)' : 'none'
        }}
        onClick={() => fetchStatus(true)}
        disabled={loading}
        title="立即从上游刷新全池最新积分"
      >
        ⟳
      </button>
      <a
        href={`http://127.0.0.1:${gatewayPort}/console`}
        target="_blank"
        rel="noreferrer"
        style={{
          color: '#2563eb',
          textDecoration: 'none',
          fontSize: 11,
          fontWeight: 600,
          marginLeft: 2
        }}
        title="打开独立白蓝 Web 控制台"
      >
        控制台↗
      </a>
    </div>
  );
}

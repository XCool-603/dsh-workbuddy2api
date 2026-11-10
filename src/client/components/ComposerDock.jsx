/**
 * ComposerDock.jsx - 输入框下方挂载的极速实时积分与 Provider 状态徽章
 * 支持：毫秒级主动刷新、窗口聚焦自动同步、跨组件事件联动、后台静默轮询
 */

import React, { useState, useEffect, useRef } from 'react';

export function ComposerDock() {
  const [balance, setBalance] = useState(null);
  const [activeAccount, setActiveAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch('/plugins/dsh-workbuddy2api/status');
      if (res.ok) {
        const data = await res.json();
        setBalance(data.balance);
        const active = data.accounts?.find((a) => a.uid === data.activeUid);
        setActiveAccount(active);
      }
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. 初始化拉取
    fetchStatus();

    // 2. 窗口重获焦点时实时同步
    const handleFocus = () => {
      fetchStatus();
    };
    window.addEventListener('focus', handleFocus);

    // 3. 监听全局积分更新广播事件
    const handleCustomUpdate = () => {
      fetchStatus();
    };
    window.addEventListener('wb2a:refresh-balance', handleCustomUpdate);

    // 4. 定时轮询 (每 12 秒静默更新一次)
    timerRef.current = setInterval(fetchStatus, 12000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('wb2a:refresh-balance', handleCustomUpdate);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formattedRemain = typeof balance?.remain === 'number'
    ? balance.remain.toLocaleString()
    : (balance?.remain ?? '就绪');

  return (
    <div className="wb2a-dock-line">
      <span>⚡ WorkBuddy 2API</span>
      <span>·</span>
      <span>
        实时积分:{' '}
        <strong
          style={{
            color: '#38bdf8',
            fontWeight: 700,
            textShadow: '0 0 6px rgba(56,189,248,0.3)'
          }}
          title={balance?.packages?.length ? `已挂载 ${balance.packages.length} 个积分包` : ''}
        >
          {formattedRemain}
        </strong>
      </span>
      {activeAccount && (
        <>
          <span>·</span>
          <span style={{ color: '#cbd5e1' }}>
            账号: {activeAccount.nickname || activeAccount.uid.slice(0, 8)} ({activeAccount.realm})
          </span>
        </>
      )}
      <button
        style={{
          background: 'transparent',
          border: 'none',
          color: loading ? '#38bdf8' : '#94a3b8',
          cursor: 'pointer',
          fontSize: 12,
          padding: '0 2px',
          display: 'inline-flex',
          alignItems: 'center',
          transition: 'transform 0.3s ease',
          transform: loading ? 'rotate(180deg)' : 'none'
        }}
        onClick={fetchStatus}
        disabled={loading}
        title="立即从上游刷新最新积分"
      >
        ↻
      </button>
    </div>
  );
}

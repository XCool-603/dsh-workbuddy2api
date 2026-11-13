/**
 * ComposerDock.jsx - 输入框下方挂载的极速实时积分、三区合计与 Console 快捷入口 (现代胶囊美学)
 */

import React, { useState, useEffect, useRef } from 'react';

export function ComposerDock() {
  const [balance, setBalance] = useState(null);
  const [summary, setSummary] = useState(null);
  const [activeAccount, setActiveAccount] = useState(null);
  const [gatewayPort, setGatewayPort] = useState(7863);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
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

  const copyBaseUrl = async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    const url = `http://127.0.0.1:${gatewayPort}/v1`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const input = document.createElement('input');
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {}
  };

  const formattedRemain = typeof balance?.remain === 'number'
    ? balance.remain.toLocaleString()
    : (balance?.remain ?? '就绪');

  const poolTotal = typeof summary?.all?.remain === 'number'
    ? summary.all.remain.toLocaleString()
    : null;

  return (
    <div className="wb2a-dock-bar wb2a-dock-line">
      {/* 左侧：品牌标签、实时积分胶囊、优先账号 */}
      <div className="wb2a-dock-left">
        <span className="wb2a-dock-brand" title="WorkBuddy 2API 网关已在后台就绪运行">
          <span className="wb2a-dock-dot" />
          <span>⚡ WB2API</span>
        </span>

        <span className="wb2a-dock-divider" />

        <div
          className="wb2a-dock-chip wb2a-dock-chip-quota"
          title={balance?.packages?.length ? `已挂载 ${balance.packages.length} 个活跃积分包 (点击刷新)` : '当前主号可用积分'}
          onClick={() => fetchStatus(false)}
        >
          <span className="wb2a-dock-icon">💎</span>
          <span className="wb2a-dock-label">实时积分:</span>
          <strong className="wb2a-dock-val">{formattedRemain}</strong>
          {poolTotal && (
            <span className="wb2a-dock-chip-sub" title="全池所有账号剩余可用总额">
              全池 {poolTotal}
            </span>
          )}
        </div>

        {activeAccount && (
          <>
            <span className="wb2a-dock-divider" />
            <div
              className="wb2a-dock-chip wb2a-dock-chip-acc"
              title={`当前优先调度主号: ${activeAccount.nickname || activeAccount.uid} (${activeAccount.realm})`}
            >
              <span className="wb2a-dock-realm-flag">
                {activeAccount.realm === 'cn' ? '🇨🇳' : '🌐'}
              </span>
              <span className="wb2a-dock-acc-name">
                {activeAccount.nickname || activeAccount.uid.slice(0, 8)}
              </span>
            </div>
          </>
        )}
      </div>

      {/* 右侧：复制 BaseURL、刷新配额、控制台按钮 */}
      <div className="wb2a-dock-right">
        <button
          type="button"
          className={`wb2a-dock-btn wb2a-dock-btn-copy ${copied ? 'copied' : ''}`}
          onClick={copyBaseUrl}
          title={`一键复制 OpenAI 协议 Base URL: http://127.0.0.1:${gatewayPort}/v1`}
        >
          <span style={{ fontSize: 10 }}>{copied ? '✓' : '📋'}</span>
          <span>{copied ? '已复制' : '复制 BaseURL'}</span>
        </button>

        <button
          type="button"
          className={`wb2a-dock-btn wb2a-dock-btn-refresh ${loading ? 'is-loading' : ''}`}
          onClick={() => fetchStatus(true)}
          disabled={loading}
          title="立即从上游强制刷新全池最新积分"
        >
          <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
            <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z" />
            <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z" />
          </svg>
        </button>

        <a
          href={`http://127.0.0.1:${gatewayPort}/console`}
          target="_blank"
          rel="noreferrer"
          className="wb2a-dock-btn wb2a-dock-btn-console"
          title="在新标签页中打开 WorkBuddy 2API 白蓝全功能控制台"
        >
          <span>控制台</span>
          <span style={{ fontSize: 9 }}>↗</span>
        </a>
      </div>
    </div>
  );
}

/**
 * SidebarPanel.jsx - DSH 左侧栏图标与侧边抽屉面板
 */

import React from 'react';
import { SettingsCard } from './SettingsCard.jsx';

export function SidebarPanel({ close }) {
  return (
    <div style={{ padding: 16, height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0, color: '#38bdf8' }}>WorkBuddy 2API 控制台</h3>
        {close && (
          <button
            onClick={close}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 16 }}
          >
            ✕
          </button>
        )}
      </div>
      <SettingsCard />
    </div>
  );
}

export function SidebarGlyph() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24 }} title="WorkBuddy 2API">
      <span style={{ fontSize: 15 }}>⚡</span>
    </div>
  );
}

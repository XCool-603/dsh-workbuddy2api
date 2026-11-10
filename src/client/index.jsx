/**
 * client/index.jsx - DSH 客户端插件挂载入口
 */

import React from 'react';
import { SettingsCard } from './components/SettingsCard.jsx';
import { ComposerDock } from './components/ComposerDock.jsx';
import { SidebarPanel, SidebarGlyph } from './components/SidebarPanel.jsx';
import styles from './styles.css';

const STYLE_ID = 'dsh-workbuddy2api-styles';

function ensureStyles() {
  if (typeof document === 'undefined') return;
  let styleEl = document.getElementById(STYLE_ID);
  if (styleEl) {
    if (styleEl.textContent !== styles) styleEl.textContent = styles;
    return;
  }
  styleEl = document.createElement('style');
  styleEl.id = STYLE_ID;
  styleEl.setAttribute('data-plugin', 'dsh-workbuddy2api');
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);
}

export const name = 'dsh-workbuddy2api-client';
export const inject = ['slots'];

export function apply(ctx) {
  ensureStyles();

  const slots = ctx?.slots;
  if (!slots?.inject) {
    console.warn('[workbuddy2api] 客户端缺少 slots 服务，跳过挂载');
    return;
  }

  const namespace = 'settings.workbuddy2api';
  const label = 'WorkBuddy 2API';
  const disposers = [];

  const safeRegister = (slotName, factory) => {
    try {
      const dispose = slots.inject(slotName, factory);
      if (dispose) disposers.push(dispose);
    } catch (err) {
      console.warn(`[workbuddy2api] 挂载插槽 ${slotName} 跳过:`, err?.message || err);
    }
  };

  // 1. 设置中心：插件中心选项卡 (settings.plugins.tab)
  safeRegister('settings.plugins.tab', () =>
    slots.register(
      {
        name: 'settings.plugins.tab',
        id: 'workbuddy2api',
        order: 15,
        label: () => label,
        locale: namespace
      },
      SettingsCard
    )
  );

  // 2. 设置中心：顶级侧边栏分区 (settings.section)
  safeRegister('settings.section', () =>
    slots.register(
      {
        name: 'settings.section',
        id: 'workbuddy2api',
        order: 25,
        label: () => label,
        locale: namespace
      },
      SettingsCard
    )
  );

  // 3. 对话输入框底部实时积分条 (conversation.composer.dock)
  safeRegister('conversation.composer.dock', () =>
    slots.register(
      {
        name: 'conversation.composer.dock',
        id: 'workbuddy2api-dock',
        order: 10,
        locale: namespace
      },
      ComposerDock
    )
  );

  // 4. 插件管理器 Bundle 配置入口 (plugins.bundle.config)
  safeRegister('plugins.bundle.config', () =>
    slots.register(
      {
        name: 'plugins.bundle.config',
        key: 'dsh-workbuddy2api',
        locale: namespace
      },
      SettingsCard
    )
  );

  // 5. 左侧导航栏与主控面板 (sidebar.panellist & main)
  safeRegister('sidebar.panellist', () =>
    slots.register(
      {
        name: 'sidebar.panellist',
        id: 'workbuddy2api-sidebar',
        order: 15,
        label: () => label,
        locale: namespace
      },
      SidebarGlyph
    )
  );

  safeRegister('main', () =>
    slots.register(
      {
        name: 'main',
        key: 'workbuddy2api-sidebar',
        locale: namespace,
        inject: () => ({
          close: () => ctx.get?.('layout')?.selectPanel?.(null) ?? ctx.layout?.selectPanel?.(null)
        })
      },
      SidebarPanel
    )
  );

  ctx.effect?.(() => () => {
    for (const d of disposers.reverse()) {
      try { d?.(); } catch (_) {}
    }
    if (typeof document !== 'undefined') {
      document.getElementById(STYLE_ID)?.remove();
    }
  }, 'workbuddy2api.client');
}

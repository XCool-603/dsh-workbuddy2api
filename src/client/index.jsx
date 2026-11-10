/**
 * client/index.jsx - DSH 客户端插件挂载入口
 */

import React from 'react';
import { SettingsCard } from './components/SettingsCard.jsx';
import { ComposerDock } from './components/ComposerDock.jsx';
import { SidebarPanel, SidebarGlyph } from './components/SidebarPanel.jsx';
import styles from './styles.css';

// 动态注入样式
if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);
}

export function apply(ctx) {
  const namespace = 'settings.workbuddy2api';
  const label = 'WorkBuddy 2API';

  // 1. 设置中心卡片 (settings.plugins.tab)
  try {
    ctx.slots?.inject('settings.plugins.tab', () => {
      ctx.slots.register(
        {
          name: 'settings.plugins.tab',
          id: 'workbuddy2api',
          order: 15,
          label: () => label,
          locale: namespace
        },
        SettingsCard
      );
    });
  } catch (_) {}

  // 2. 设置中心分区兜底 (settings.section)
  try {
    ctx.slots?.inject('settings.section', () => {
      ctx.slots.register(
        {
          name: 'settings.section',
          id: 'workbuddy2api',
          order: 25,
          label: () => label,
          locale: namespace
        },
        SettingsCard
      );
    });
  } catch (_) {}

  // 3. 对话框底部积分条 (conversation.composer.dock)
  try {
    ctx.slots?.inject('conversation.composer.dock', () => {
      ctx.slots.register(
        {
          name: 'conversation.composer.dock',
          id: 'workbuddy2api-dock',
          order: 10,
          locale: namespace
        },
        ComposerDock
      );
    });
  } catch (_) {}

  // 4. Bundle 配置页入口
  try {
    ctx.slots?.inject('plugins.bundle.config', () => {
      ctx.slots.register(
        {
          name: 'plugins.bundle.config',
          key: 'dsh-workbuddy2api',
          locale: namespace
        },
        SettingsCard
      );
    });
  } catch (_) {}

  // 5. 左侧栏入口 (sidebar.panellist & main)
  try {
    ctx.slots?.inject('sidebar.panellist', () => {
      ctx.slots.register(
        {
          name: 'sidebar.panellist',
          id: 'workbuddy2api-sidebar',
          order: 15,
          label: () => label,
          locale: namespace
        },
        SidebarGlyph
      );
    });

    ctx.slots?.inject('main', () => {
      ctx.slots.register(
        {
          name: 'main',
          key: 'workbuddy2api-sidebar',
          locale: namespace,
          inject: () => ({
            close: () => ctx.layout?.selectPanel?.(null)
          })
        },
        SidebarPanel
      );
    });
  } catch (_) {}
}

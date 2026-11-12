/**
 * account-store.js - 多账号凭据存储、自动探测导入、启停与持久化
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

export function parseJWTClaims(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
    const decoded = Buffer.from(b64 + pad, 'base64').toString('utf8');
    return JSON.parse(decoded);
  } catch (_) {
    return null;
  }
}

export class AccountStore {
  constructor(options = {}) {
    this.dshHome = options.dshHome || process.env.DSH_HOME || path.join(os.homedir(), '.dsh');
    this.storePath = path.join(this.dshHome, '.workbuddy2api-accounts.json');
    this.authDir = options.authDir || '';
    this.skipDiscovery = Boolean(options.skipDiscovery);
    this.accounts = new Map();
    this.activeUid = null;
    this._authWatchTimer = null;
    this._lastAuthFingerprint = '';
    this._fileSignatures = new Map();
    this.init();
  }

  init() {
    // 1. 从插件主持久化文件加载
    try {
      if (fs.existsSync(this.storePath)) {
        const raw = JSON.parse(fs.readFileSync(this.storePath, 'utf8'));
        if (Array.isArray(raw.accounts)) {
          for (const acc of raw.accounts) {
            if (acc.account?.uid) {
              acc.disabled = Boolean(acc.disabled);
              acc.disabledReason = acc.disabledReason || '';
              acc.manualDisabled = Boolean(acc.manualDisabled);
              acc.manualDisabledReason = acc.manualDisabledReason || '';
              this.accounts.set(acc.account.uid, acc);
            }
          }
        }
        if (raw.activeUid) {
          this.activeUid = raw.activeUid;
        }
      }
    } catch (e) {
      console.warn('[account-store] 读取主存储异常:', e.message);
    }

    if (!this.skipDiscovery) {
      // 2. 自动发现并合并已有的 auths 目录
      const probeDirs = [
        this.authDir,
        path.join(this.dshHome, 'workbuddy2api-auths'),
        'c:\\Work\\workbody\\workbuddy2api\\auths',
        path.join(process.cwd(), 'auths')
      ].filter(Boolean);

      for (const dir of [...new Set(probeDirs)]) {
        this.importFromAuthDir(dir);
      }

      // 3. 自动探测本机 CodeBuddy CLI 登录态
      this.importFromCodeBuddyCli();
    }

    // 确保有激活账号
    if ((!this.activeUid || !this.accounts.has(this.activeUid)) && this.accounts.size > 0) {
      const enabledFirst = this.getAll().find((a) => !this.isAccountUnavailable(a));
      this.activeUid = enabledFirst?.account?.uid || this.accounts.keys().next().value;
    }

    this.save();
  }

  importFromAuthDir(dirPath, options = {}) {
    if (!dirPath || !fs.existsSync(dirPath)) return { added: 0, updated: 0 };
    let added = 0;
    let updated = 0;
    const updateExisting = Boolean(options.updateExisting);
    try {
      const files = fs.readdirSync(dirPath).filter((f) => f.endsWith('.json'));
      for (const file of files) {
        try {
          const filePath = path.join(dirPath, file);
          const stat = fs.statSync(filePath);
          const sig = `${stat.mtimeMs}|${stat.size}`;
          if (updateExisting && this._fileSignatures.get(filePath) === sig) {
            continue;
          }
          const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          const uid = raw.account?.uid || raw.uid;
          if (!uid) continue;

          const realm = raw.auth?.realm || raw.realm || (file.includes('cn') ? 'cn' : 'global');
          const accessToken = raw.auth?.accessToken || raw.accessToken || '';
          const refreshToken = raw.auth?.refreshToken || raw.refreshToken || '';
          const expiresAt = raw.auth?.expiresAt || raw.expiresAt || 0;
          const domain = raw.auth?.domain || raw.domain || '';

          if (!this.accounts.has(uid)) {
            const acc = {
              account: {
                uid,
                nickname: raw.account?.nickname || raw.nickname || `Account-${uid.slice(0, 8)}`,
                enterpriseId: raw.account?.enterpriseId || raw.enterpriseId || '',
                provider: raw.account?.provider || raw.provider || ''
              },
              auth: {
                realm,
                accessToken,
                refreshToken,
                expiresAt,
                domain
              },
              disabled: Boolean(raw.disabled),
              disabledReason: raw.disabledReason || '',
              manualDisabled: Boolean(raw.manualDisabled),
              manualDisabledReason: raw.manualDisabledReason || '',
              source: 'workbuddy2api-auths',
              updatedAt: Date.now()
            };
            this.accounts.set(uid, acc);
            added++;
          } else if (updateExisting) {
            const existing = this.accounts.get(uid);
            const accessChanged = Boolean(accessToken && accessToken !== existing.auth?.accessToken);
            const refreshChanged = Boolean(refreshToken && refreshToken !== existing.auth?.refreshToken);
            if (accessChanged || refreshChanged) {
              existing.auth = {
                ...(existing.auth || {}),
                realm: realm || existing.auth?.realm || 'cn',
                accessToken: accessToken || existing.auth?.accessToken || '',
                refreshToken: refreshToken || existing.auth?.refreshToken || '',
                expiresAt: expiresAt || existing.auth?.expiresAt || 0,
                domain: domain || existing.auth?.domain || ''
              };
              if (accessChanged) {
                existing.disabled = false;
                existing.disabledReason = '';
                existing.sessionDeadStreak = 0;
              }
              existing.updatedAt = Date.now();
              updated++;
            }
          }
          this._fileSignatures.set(filePath, sig);
        } catch (_) {}
      }
    } catch (err) {
      console.warn('[account-store] 导入 auths 目录异常:', err.message);
    }
    return { added, updated };
  }

  importFromCodeBuddyCli() {
    const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
    const cliAuthDir = path.join(localAppData, 'CodeBuddyExtension', 'Data', 'Public', 'auth');
    if (!fs.existsSync(cliAuthDir)) return;

    try {
      const files = fs.readdirSync(cliAuthDir).filter((f) => f.endsWith('.info'));
      for (const f of files) {
        try {
          const content = fs.readFileSync(path.join(cliAuthDir, f), 'utf8');
          const data = JSON.parse(content);
          const uid = data.uid || data.account?.uid;
          const token = data.token || data.accessToken || data.access_token;
          if (uid && token && !this.accounts.has(uid)) {
            this.accounts.set(uid, {
              account: {
                uid,
                nickname: data.nickname || data.userName || 'CodeBuddy-CLI',
                enterpriseId: data.enterpriseId || ''
              },
              auth: {
                realm: data.realm || 'cn',
                accessToken: token,
                refreshToken: data.refreshToken || data.refresh_token || '',
                expiresAt: Date.now() + 3600000 * 2,
                domain: data.domain || ''
              },
              disabled: false,
              disabledReason: '',
              source: 'codebuddy-cli',
              updatedAt: Date.now()
            });
          }
        } catch (_) {}
      }
    } catch (_) {}
  }

  save() {
    try {
      if (!fs.existsSync(this.dshHome)) {
        fs.mkdirSync(this.dshHome, { recursive: true });
      }
      const data = {
        activeUid: this.activeUid,
        accounts: Array.from(this.accounts.values())
      };
      fs.writeFileSync(this.storePath, JSON.stringify(data, null, 2), { mode: 0o600 });
    } catch (err) {
      console.warn('[account-store] 保存账号存储失败:', err.message);
    }
  }

  getAll() {
    return Array.from(this.accounts.values());
  }

  get(uid) {
    return this.accounts.get(uid);
  }

  getActive() {
    if (this.activeUid && this.accounts.has(this.activeUid)) {
      return this.accounts.get(this.activeUid);
    }
    const first = this.accounts.values().next().value;
    return first || null;
  }

  setActive(uid) {
    if (this.accounts.has(uid)) {
      this.activeUid = uid;
      this.save();
      return true;
    }
    return false;
  }

  isAccountUnavailable(acc) {
    return Boolean(acc?.disabled || acc?.manualDisabled);
  }

  setDisabled(uid, disabled, reason = '') {
    const acc = this.accounts.get(uid);
    if (!acc) return false;
    acc.disabled = Boolean(disabled);
    acc.disabledReason = disabled ? (reason || '系统停用') : '';
    acc.manualDisabled = Boolean(disabled);
    acc.manualDisabledReason = disabled ? (reason || '手动停用') : '';
    acc.updatedAt = Date.now();
    this.save();
    return true;
  }

  setAutoDisabled(uid, disabled, reason = '') {
    const acc = this.accounts.get(uid);
    if (!acc) return false;
    acc.disabled = Boolean(disabled);
    acc.disabledReason = disabled ? (reason || '自动熔断禁用') : '';
    acc.updatedAt = Date.now();
    this.save();
    return true;
  }

  setManualDisabled(uid, disabled, reason = 'manual') {
    const acc = this.accounts.get(uid);
    if (!acc) return false;
    const prev = Boolean(acc.manualDisabled);
    acc.manualDisabled = Boolean(disabled);
    acc.manualDisabledReason = disabled ? (reason || 'manual') : '';
    acc.updatedAt = Date.now();
    this.save();
    return { found: true, changed: prev !== acc.manualDisabled, acc };
  }

  reviveAccount(uid) {
    const acc = this.accounts.get(uid);
    if (!acc) return false;
    const changed = Boolean(acc.disabled || acc.disabledReason);
    acc.disabled = false;
    acc.disabledReason = '';
    acc.sessionDeadStreak = 0;
    acc.updatedAt = Date.now();
    this.save();
    return { found: true, changed, acc };
  }

  updateAccountToken(uid, accessToken, refreshToken = '', expiresInSec = 7200) {
    const acc = this.accounts.get(uid);
    if (!acc) return null;
    if (accessToken) acc.auth.accessToken = String(accessToken).trim();
    if (refreshToken) acc.auth.refreshToken = String(refreshToken).trim();
    acc.auth.expiresAt = Date.now() + Math.max(300, Number(expiresInSec || 7200)) * 1000;
    acc.disabled = false;
    acc.disabledReason = '';
    acc.manualDisabled = false;
    acc.manualDisabledReason = '';
    acc.sessionDeadStreak = 0;
    acc.updatedAt = Date.now();
    this.save();
    return acc;
  }

  upsert(account) {
    const uid = account.account?.uid;
    if (!uid) throw new Error('Account must have a valid uid');
    const existing = this.accounts.get(uid);
    const merged = {
      ...existing,
      ...account,
      account: { ...(existing?.account || {}), ...account.account },
      auth: { ...(existing?.auth || {}), ...account.auth },
      disabled: account.disabled !== undefined ? Boolean(account.disabled) : Boolean(existing?.disabled),
      disabledReason: account.disabledReason ?? existing?.disabledReason ?? '',
      manualDisabled: account.manualDisabled !== undefined ? Boolean(account.manualDisabled) : Boolean(existing?.manualDisabled),
      manualDisabledReason: account.manualDisabledReason ?? existing?.manualDisabledReason ?? '',
      updatedAt: Date.now()
    };
    this.accounts.set(uid, merged);
    if (!this.activeUid) {
      this.activeUid = uid;
    }
    this.save();
    return merged;
  }

  delete(uid) {
    const deleted = this.accounts.delete(uid);
    if (this.activeUid === uid) {
      this.activeUid = this.accounts.keys().next().value || null;
    }
    this.save();
    return deleted;
  }

  getAuthWatchDirs() {
    return [
      ...new Set(
        [this.authDir, path.join(this.dshHome, 'workbuddy2api-auths')].filter(Boolean)
      )
    ];
  }

  _computeAuthDirsFingerprint(dirs = this.getAuthWatchDirs()) {
    const entries = [];
    for (const dir of dirs) {
      if (!dir || !fs.existsSync(dir)) continue;
      try {
        const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
        for (const f of files) {
          try {
            const st = fs.statSync(path.join(dir, f));
            entries.push(`${dir}|${f}|${st.mtimeMs}|${st.size}`);
          } catch (_) {}
        }
      } catch (_) {}
    }
    return entries.join(';');
  }

  /**
   * 扫描被监控的 auths 目录，热加载新增或更新了 Token 的账号（保留既有禁用/统计状态）
   */
  scanAuthDirsOnce(dirs = this.getAuthWatchDirs()) {
    const fp = this._computeAuthDirsFingerprint(dirs);
    if (fp === this._lastAuthFingerprint) {
      return { changed: false, added: 0, updated: 0 };
    }
    this._lastAuthFingerprint = fp;
    let added = 0;
    let updated = 0;
    for (const dir of dirs) {
      const res = this.importFromAuthDir(dir, { updateExisting: true });
      added += res.added;
      updated += res.updated;
    }
    if (added > 0 || updated > 0) {
      if ((!this.activeUid || !this.accounts.has(this.activeUid)) && this.accounts.size > 0) {
        const enabledFirst = this.getAll().find((a) => !this.isAccountUnavailable(a));
        this.activeUid = enabledFirst?.account?.uid || this.accounts.keys().next().value;
      }
      this.save();
      console.log(`[account-store] auths 目录热重载完成: 新增 ${added}, 更新 ${updated}`);
      return { changed: true, added, updated };
    }
    return { changed: false, added: 0, updated: 0 };
  }

  /**
   * 启动 auths 目录后台轮询监听（默认 5s 一次，对齐 Go pool/watch.go）
   */
  startAuthDirWatch(intervalMs = 5000, dirs = null) {
    if (this._authWatchTimer) return;
    const watchDirs = dirs && Array.isArray(dirs) ? dirs : this.getAuthWatchDirs();
    this._lastAuthFingerprint = this._computeAuthDirsFingerprint(watchDirs);
    this._authWatchTimer = setInterval(() => {
      try {
        this.scanAuthDirsOnce(watchDirs);
      } catch (err) {
        console.warn('[account-store] auths 目录热重载轮询异常:', err.message);
      }
    }, Math.max(50, Number(intervalMs) || 5000));
    if (this._authWatchTimer.unref) this._authWatchTimer.unref();
  }

  stopAuthDirWatch() {
    if (this._authWatchTimer) {
      clearInterval(this._authWatchTimer);
      this._authWatchTimer = null;
    }
  }
}

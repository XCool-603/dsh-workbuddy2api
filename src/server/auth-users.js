/**
 * auth-users.js - 控制台登录鉴权、多租户用户管理、专属 API Key 与日配额 / RPM 频控
 * 当未设置 webPassword 时保持本机零门槛免密体验；配置密码或启用多用户后提供完整的 RBAC 与配额管控。
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';

const SESSION_COOKIE_NAME = 'wb2a_session';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function generateRandomHex(bytes = 16) {
  return crypto.randomBytes(bytes).toString('hex');
}

export function generateUserApiKey() {
  return `sk-wb2a-${generateRandomHex(20)}`;
}

function hashPassword(password, salt) {
  return crypto.createHash('sha256').update(`${salt}:${password}`).digest('hex');
}

function getTodayCST() {
  return new Date(Date.now() + 8 * 3600 * 1000).toISOString().slice(0, 10);
}

export function parseCookies(req) {
  const raw = String(req?.headers?.cookie || '');
  const map = {};
  for (const part of raw.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (k) {
      try {
        map[k] = decodeURIComponent(v);
      } catch (_) {
        map[k] = v;
      }
    }
  }
  return map;
}

export class UserManager {
  constructor(options = {}) {
    this.dshHome = options.dshHome || process.env.DSH_HOME || path.join(os.homedir(), '.dsh');
    this.configStore = options.configStore || null;
    this.filePath = path.join(this.dshHome, '.workbuddy2api-users.json');
    this.users = new Map(); // username -> user
    this.byApiKey = new Map(); // apiKey -> user
    this.sessions = new Map(); // token -> { username, role, userId, expiresAt }
    this.rpmBuckets = new Map(); // apiKey -> { windowStart, count }
    this.loginFailures = new Map(); // ip -> { count, lockedUntil }
    this._load();
  }

  _load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
        const list = Array.isArray(raw?.users) ? raw.users : [];
        for (const u of list) {
          if (!u?.username) continue;
          const norm = this._normalizeUser(u);
          this.users.set(norm.username, norm);
          if (norm.apiKey) this.byApiKey.set(norm.apiKey, norm);
        }
      }
    } catch (_) {}

    if (!this.users.has('admin')) {
      this._initDefaultAdmin();
    }
  }

  _normalizeUser(u) {
    return {
      id: u.id || `u_${generateRandomHex(6)}`,
      username: String(u.username).trim().toLowerCase(),
      passwordHash: u.passwordHash || '',
      salt: u.salt || generateRandomHex(16),
      role: u.role === 'admin' ? 'admin' : 'user',
      apiKey: u.apiKey || generateUserApiKey(),
      disabled: Boolean(u.disabled),
      createdAt: u.createdAt || new Date().toISOString(),
      dailyCreditLimit: Math.max(0, Number(u.dailyCreditLimit || 0) || 0),
      usedCreditToday: Math.max(0, Number(u.usedCreditToday || 0) || 0),
      lastCreditDay: u.lastCreditDay || getTodayCST(),
      rpm: Math.max(0, Number(u.rpm || 0) || 0)
    };
  }

  _initDefaultAdmin() {
    const cfg = this.configStore ? this.configStore.getAll() : {};
    const salt = generateRandomHex(16);
    const pw = cfg.webPassword || '';
    const admin = {
      id: 'u_admin',
      username: 'admin',
      passwordHash: pw ? hashPassword(pw, salt) : '',
      salt,
      role: 'admin',
      apiKey: cfg.apiKey || generateUserApiKey(),
      disabled: false,
      createdAt: new Date().toISOString(),
      dailyCreditLimit: 0,
      usedCreditToday: 0,
      lastCreditDay: getTodayCST(),
      rpm: 0
    };
    this.users.set('admin', admin);
    this.byApiKey.set(admin.apiKey, admin);
    this._save();
  }

  _save() {
    try {
      if (!fs.existsSync(this.dshHome)) {
        fs.mkdirSync(this.dshHome, { recursive: true });
      }
      const data = { users: [...this.users.values()] };
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), { mode: 0o600 });
    } catch (_) {}
  }

  hasWebPassword() {
    const cfgPw = this.configStore?.get('webPassword');
    const admin = this.users.get('admin');
    return Boolean((cfgPw && cfgPw.length > 0) || admin?.passwordHash);
  }

  setAdminPassword(newPassword = '') {
    const admin = this.users.get('admin') || this._normalizeUser({ username: 'admin', role: 'admin', id: 'u_admin' });
    if (!newPassword) {
      admin.passwordHash = '';
    } else {
      admin.salt = generateRandomHex(16);
      admin.passwordHash = hashPassword(newPassword, admin.salt);
    }
    this.users.set('admin', admin);
    if (this.configStore) {
      this.configStore.update({ webPassword: newPassword });
    }
    this._save();
    return { hasPassword: Boolean(newPassword) };
  }

  listUsers() {
    const today = getTodayCST();
    return [...this.users.values()].map((u) => {
      const usedToday = u.lastCreditDay === today ? u.usedCreditToday : 0;
      return {
        id: u.id,
        username: u.username,
        role: u.role,
        apiKey: u.apiKey,
        disabled: u.disabled,
        createdAt: u.createdAt,
        dailyCreditLimit: u.dailyCreditLimit,
        usedCreditToday: Number(usedToday.toFixed(2)),
        rpm: u.rpm
      };
    });
  }

  authenticate(username, password, clientIP = '127.0.0.1') {
    const now = Date.now();
    const fail = this.loginFailures.get(clientIP);
    if (fail && fail.lockedUntil > now) {
      const waitSec = Math.ceil((fail.lockedUntil - now) / 1000);
      throw new Error(`尝试过于频繁，请 ${waitSec} 秒后再试`);
    }

    const uname = String(username || '').trim().toLowerCase();
    const user = this.users.get(uname);
    if (!user) {
      this._recordLoginFail(clientIP);
      throw new Error('用户名或密码错误');
    }
    if (user.disabled) {
      throw new Error('账号已被管理员禁用');
    }

    const cfgPw = this.configStore?.get('webPassword') || '';
    const adminBypass = uname === 'admin' && !user.passwordHash && !cfgPw;
    let ok = adminBypass;
    if (!ok) {
      if (uname === 'admin' && cfgPw && password === cfgPw) {
        ok = true;
      } else if (user.passwordHash) {
        const expected = hashPassword(password || '', user.salt);
        ok = expected === user.passwordHash;
      }
    }

    if (!ok) {
      this._recordLoginFail(clientIP);
      throw new Error('用户名或密码错误');
    }

    this.loginFailures.delete(clientIP);
    const token = generateRandomHex(24);
    this.sessions.set(token, {
      username: user.username,
      userId: user.id,
      role: user.role,
      expiresAt: now + SESSION_TTL_MS
    });
    if (this.sessions.size > 1000) {
      for (const [k, s] of this.sessions.entries()) {
        if (s.expiresAt < now) this.sessions.delete(k);
      }
    }
    return { token, user: this._sanitizeUser(user) };
  }

  _recordLoginFail(ip) {
    const now = Date.now();
    const cur = this.loginFailures.get(ip) || { count: 0, lockedUntil: 0 };
    cur.count += 1;
    if (cur.count >= 6) {
      cur.lockedUntil = now + 5 * 60 * 1000;
      cur.count = 0;
    }
    this.loginFailures.set(ip, cur);
  }

  _sanitizeUser(u) {
    const today = getTodayCST();
    return {
      id: u.id,
      username: u.username,
      role: u.role,
      apiKey: u.apiKey,
      disabled: u.disabled,
      dailyCreditLimit: u.dailyCreditLimit,
      usedCreditToday: u.lastCreditDay === today ? u.usedCreditToday : 0,
      rpm: u.rpm
    };
  }

  getSessionUser(req) {
    const cookies = parseCookies(req);
    const token = cookies[SESSION_COOKIE_NAME] || req?.headers?.['x-session-token'] || '';
    if (!token) return null;
    const sess = this.sessions.get(token);
    if (!sess) return null;
    if (sess.expiresAt < Date.now()) {
      this.sessions.delete(token);
      return null;
    }
    const u = this.users.get(sess.username);
    if (!u || u.disabled) return null;
    return this._sanitizeUser(u);
  }

  logout(req) {
    const cookies = parseCookies(req);
    const token = cookies[SESSION_COOKIE_NAME] || req?.headers?.['x-session-token'] || '';
    if (token) this.sessions.delete(token);
  }

  checkWebAuth(req) {
    if (!this.hasWebPassword()) {
      const admin = this.users.get('admin');
      return { ok: true, user: admin ? this._sanitizeUser(admin) : { id: 'u_admin', username: 'admin', role: 'admin' } };
    }
    const user = this.getSessionUser(req);
    if (!user) return { ok: false, user: null };
    return { ok: true, user };
  }

  createUser({ username, password, role = 'user', dailyCreditLimit = 0, rpm = 0 }) {
    const uname = String(username || '').trim().toLowerCase();
    if (!uname || uname.length < 2 || !/^[a-z0-9_.-]+$/.test(uname)) {
      throw new Error('用户名格式非法 (仅限 2 位以上字母/数字/._-)');
    }
    if (this.users.has(uname)) {
      throw new Error(`用户名 ${uname} 已存在`);
    }
    if (!password || String(password).length < 4) {
      throw new Error('密码长度至少 4 位');
    }
    const salt = generateRandomHex(16);
    const user = this._normalizeUser({
      id: `u_${generateRandomHex(6)}`,
      username: uname,
      passwordHash: hashPassword(password, salt),
      salt,
      role: role === 'admin' ? 'admin' : 'user',
      apiKey: generateUserApiKey(),
      dailyCreditLimit,
      rpm
    });
    this.users.set(uname, user);
    this.byApiKey.set(user.apiKey, user);
    this._save();
    return this._sanitizeUser(user);
  }

  toggleUser(username, disabled) {
    const u = this.users.get(String(username || '').toLowerCase());
    if (!u) throw new Error('用户不存在');
    if (u.username === 'admin') throw new Error('不能禁用默认管理员');
    u.disabled = disabled !== undefined ? Boolean(disabled) : !u.disabled;
    this._save();
    return this._sanitizeUser(u);
  }

  setUserRole(username, role) {
    const u = this.users.get(String(username || '').toLowerCase());
    if (!u) throw new Error('用户不存在');
    if (u.username === 'admin') throw new Error('不能修改默认管理员角色');
    u.role = role === 'admin' ? 'admin' : 'user';
    this._save();
    return this._sanitizeUser(u);
  }

  setUserQuota(username, dailyCreditLimit, rpm) {
    const u = this.users.get(String(username || '').toLowerCase());
    if (!u) throw new Error('用户不存在');
    u.dailyCreditLimit = Math.max(0, Number(dailyCreditLimit || 0) || 0);
    u.rpm = Math.max(0, Number(rpm || 0) || 0);
    this._save();
    return this._sanitizeUser(u);
  }

  resetUserPassword(username, newPassword) {
    const u = this.users.get(String(username || '').toLowerCase());
    if (!u) throw new Error('用户不存在');
    if (!newPassword || String(newPassword).length < 4) throw new Error('密码长度至少 4 位');
    u.salt = generateRandomHex(16);
    u.passwordHash = hashPassword(newPassword, u.salt);
    this._save();
    return this._sanitizeUser(u);
  }

  resetUserApiKey(username) {
    const u = this.users.get(String(username || '').toLowerCase());
    if (!u) throw new Error('用户不存在');
    this.byApiKey.delete(u.apiKey);
    u.apiKey = generateUserApiKey();
    this.byApiKey.set(u.apiKey, u);
    this._save();
    return this._sanitizeUser(u);
  }

  deleteUser(username) {
    const uname = String(username || '').toLowerCase();
    const u = this.users.get(uname);
    if (!u) throw new Error('用户不存在');
    if (u.username === 'admin') throw new Error('不能删除默认管理员');
    this.users.delete(uname);
    this.byApiKey.delete(u.apiKey);
    this._save();
    return true;
  }

  /**
   * 校验 API 请求凭据 (兼容全局网关 apiKey 与各租户专属 sk-wb2a-... Key)，含 RPM 与日配额校验
   */
  verifyApiRequest(providedKey, globalApiKey = '') {
    const key = String(providedKey || '').trim();
    const hasGlobalKey = Boolean(globalApiKey && globalApiKey.trim());

    // 若未传入 key，且全局也未设置 apiKey，放行作为默认管理员请求
    if (!key) {
      if (!hasGlobalKey) {
        return { ok: true, user: null };
      }
      return { ok: false, status: 401, message: 'Invalid or missing gateway API key' };
    }

    if (hasGlobalKey && key === globalApiKey.trim()) {
      return { ok: true, user: this.users.get('admin') || null };
    }

    const user = this.byApiKey.get(key);
    if (!user) {
      if (!hasGlobalKey) {
        // 未开启全局网关 Key 且传了任意占位 key 时（常见 OpenAI SDK 默认 "sk-xxx"），允许以本地默认放行
        return { ok: true, user: null };
      }
      return { ok: false, status: 401, message: 'Invalid gateway API key' };
    }

    if (user.disabled) {
      return { ok: false, status: 403, message: `User account ${user.username} is disabled` };
    }

    const today = getTodayCST();
    if (user.lastCreditDay !== today) {
      user.lastCreditDay = today;
      user.usedCreditToday = 0;
    }

    if (user.dailyCreditLimit > 0 && user.usedCreditToday >= user.dailyCreditLimit) {
      return {
        ok: false,
        status: 429,
        message: `Daily credit quota exceeded (${user.usedCreditToday.toFixed(2)} / ${user.dailyCreditLimit})`
      };
    }

    if (user.rpm > 0) {
      const now = Date.now();
      const bucket = this.rpmBuckets.get(key);
      if (!bucket || now - bucket.windowStart >= 60000) {
        this.rpmBuckets.set(key, { windowStart: now, count: 1 });
      } else if (bucket.count >= user.rpm) {
        return { ok: false, status: 429, message: `Rate limit exceeded (RPM ${user.rpm})` };
      } else {
        bucket.count += 1;
      }
    }

    return { ok: true, user };
  }

  deductUserCredit(user, creditAmount = 0) {
    if (!user?.username || !(creditAmount > 0)) return;
    const real = this.users.get(user.username);
    if (!real) return;
    const today = getTodayCST();
    if (real.lastCreditDay !== today) {
      real.lastCreditDay = today;
      real.usedCreditToday = 0;
    }
    real.usedCreditToday = Number((real.usedCreditToday + creditAmount).toFixed(4));
    this._save();
  }

  static get cookieName() {
    return SESSION_COOKIE_NAME;
  }
}

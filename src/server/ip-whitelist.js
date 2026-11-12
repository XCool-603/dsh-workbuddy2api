/**
 * ip-whitelist.js - IPv4 / IPv6 与 CIDR 白名单访问控制及可信代理源 IP 提取
 */

import net from 'node:net';
import os from 'node:os';

function normalizeIP(ip = '') {
  let s = String(ip || '').trim();
  if (!s) return '';
  if (s.startsWith('[') && s.includes(']')) {
    s = s.slice(1, s.indexOf(']'));
  } else if (s.includes(':') && s.includes('.') && s.lastIndexOf(':') > s.lastIndexOf('.')) {
    // 处理 1.2.3.4:port
    s = s.slice(0, s.lastIndexOf(':'));
  }
  const zoneIdx = s.indexOf('%');
  if (zoneIdx !== -1) s = s.slice(0, zoneIdx);
  if (s.toLowerCase().startsWith('::ffff:')) {
    const mapped = s.slice(7);
    if (net.isIPv4(mapped)) return mapped;
  }
  return s;
}

function ipv4ToBigInt(ip) {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return null;
  return (
    (BigInt(parts[0]) << 24n) |
    (BigInt(parts[1]) << 16n) |
    (BigInt(parts[2]) << 8n) |
    BigInt(parts[3])
  );
}

function ipv6ToBigInt(ip) {
  let expanded = ip.toLowerCase();
  if (expanded.includes('::')) {
    const halves = expanded.split('::');
    if (halves.length > 2) return null;
    const left = halves[0] ? halves[0].split(':') : [];
    const right = halves[1] ? halves[1].split(':') : [];
    const missing = 8 - (left.length + right.length);
    if (missing < 0) return null;
    expanded = [...left, ...Array(missing).fill('0'), ...right].join(':');
  }
  const groups = expanded.split(':');
  if (groups.length !== 8) return null;
  let val = 0n;
  for (const g of groups) {
    if (!/^[0-9a-f]{1,4}$/.test(g)) return null;
    val = (val << 16n) | BigInt(parseInt(g, 16));
  }
  return val;
}

export function isLoopbackIP(ip) {
  const norm = normalizeIP(ip);
  if (!norm) return false;
  if (norm === '::1') return true;
  if (net.isIPv4(norm)) {
    return norm.startsWith('127.');
  }
  return false;
}

export function isPrivateOrLinkLocalIP(ip) {
  const norm = normalizeIP(ip);
  if (!norm) return false;
  if (isLoopbackIP(norm)) return true;
  if (net.isIPv4(norm)) {
    const [a, b] = norm.split('.').map(Number);
    if (a === 10) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 169 && b === 254) return true;
    return false;
  }
  const low = norm.toLowerCase();
  return low.startsWith('fc') || low.startsWith('fd') || low.startsWith('fe80:');
}

export function parseCIDREntry(rawEntry) {
  const tok = String(rawEntry || '').trim();
  if (!tok) return null;

  if (!tok.includes('/')) {
    const ip = normalizeIP(tok);
    const kind = net.isIP(ip);
    if (!kind) throw new Error(`无效的 IP 地址: ${tok}`);
    const bits = kind === 4 ? 32 : 128;
    const val = kind === 4 ? ipv4ToBigInt(ip) : ipv6ToBigInt(ip);
    return { raw: ip, version: kind, bits, netVal: val, mask: (1n << BigInt(bits)) - 1n };
  }

  const [rawIp, rawPrefix] = tok.split('/');
  const ip = normalizeIP(rawIp);
  const kind = net.isIP(ip);
  const prefix = Number(rawPrefix);
  const maxBits = kind === 4 ? 32 : 128;
  if (!kind || !Number.isInteger(prefix) || prefix < 0 || prefix > maxBits) {
    throw new Error(`无效的 CIDR 网段: ${tok}`);
  }
  const val = kind === 4 ? ipv4ToBigInt(ip) : ipv6ToBigInt(ip);
  const shift = BigInt(maxBits - prefix);
  const fullMask = (1n << BigInt(maxBits)) - 1n;
  const mask = prefix === 0 ? 0n : (fullMask ^ ((1n << shift) - 1n));
  return { raw: `${ip}/${prefix}`, version: kind, bits: prefix, netVal: val & mask, mask };
}

export function parseWhitelistEntries(entries = []) {
  const tokens = [];
  for (const item of entries) {
    for (const part of String(item || '').split(/[\s,;]+/)) {
      const t = part.trim();
      if (t) tokens.push(t);
    }
  }
  const parsed = [];
  const normalized = [];
  const seen = new Set();
  for (const tok of tokens) {
    const rule = parseCIDREntry(tok);
    if (rule && !seen.has(rule.raw)) {
      seen.add(rule.raw);
      parsed.push(rule);
      normalized.push(rule.raw);
    }
  }
  return { parsed, normalized };
}

export function extractTrustedClientIP(req) {
  const rawRemote = normalizeIP(req?.socket?.remoteAddress || '');
  const trustedProxy = isLoopbackIP(rawRemote) || isPrivateOrLinkLocalIP(rawRemote);

  if (trustedProxy && req?.headers) {
    const xff = String(req.headers['x-forwarded-for'] || '');
    if (xff) {
      for (const part of xff.split(',')) {
        const cand = normalizeIP(part);
        if (net.isIP(cand)) return cand;
      }
    }
    const xrip = normalizeIP(req.headers['x-real-ip'] || '');
    if (net.isIP(xrip)) return xrip;
  }

  return rawRemote || '127.0.0.1';
}

export function detectRuntimeIPs() {
  const ifs = os.networkInterfaces();
  const ipv4s = [];
  const ipv6s = [];
  for (const list of Object.values(ifs)) {
    if (!Array.isArray(list)) continue;
    for (const item of list) {
      if (!item || item.internal) continue;
      if (item.family === 'IPv4') {
        ipv4s.push(item.address);
      } else if (item.family === 'IPv6' && !item.address.toLowerCase().startsWith('fe80:')) {
        ipv6s.push(item.address);
      }
    }
  }
  return [...new Set([...ipv4s.sort(), ...ipv6s.sort()])];
}

export function checkIPWhitelist(req, wlConfig = {}) {
  const clientIP = extractTrustedClientIP(req);
  if (!wlConfig || !wlConfig.enabled) {
    return { allowed: true, clientIP };
  }
  if (wlConfig.allowLocalhost !== false && isLoopbackIP(clientIP)) {
    return { allowed: true, clientIP };
  }
  const version = net.isIP(clientIP);
  if (!version) {
    return { allowed: false, clientIP };
  }

  const val = version === 4 ? ipv4ToBigInt(clientIP) : ipv6ToBigInt(clientIP);
  if (val === null) return { allowed: false, clientIP };

  try {
    const { parsed } = parseWhitelistEntries(wlConfig.allowedIPs || []);
    for (const rule of parsed) {
      if (rule.version === version && (val & rule.mask) === rule.netVal) {
        return { allowed: true, clientIP };
      }
    }
  } catch (_) {}

  return { allowed: false, clientIP };
}

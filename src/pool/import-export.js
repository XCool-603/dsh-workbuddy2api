/**
 * import-export.js - 全格式批量账号导入与 ZIP/JSON 备份导出引擎
 * 支持：ZIP 压缩包、JSON 数组、第三方包装对象({data}/{accounts}/{tokens})、
 *       带 // 或 # 注释的宽松 JSON、卡密文本 (accessToken----refreshToken / token:refreshToken / 裸 refreshToken)
 */

import zlib from 'node:zlib';
import { parseJWTClaims } from './account-store.js';

// CRC32 查表实现（用于纯 Node ZIP 打包）
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

/**
 * 纯 Node 构建标准 ZIP 归档缓冲区
 * @param {Array<{ name: string, content: Buffer|string }>} files
 */
export function buildZipBuffer(files) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const file of files) {
    const nameBuf = Buffer.from(file.name, 'utf8');
    const dataBuf = Buffer.isBuffer(file.content) ? file.content : Buffer.from(file.content, 'utf8');
    const compressed = zlib.deflateRawSync(dataBuf);
    const crc = crc32(dataBuf);

    // Local file header (30 bytes + nameLen)
    const lfh = Buffer.alloc(30);
    lfh.writeUInt32LE(0x04034b50, 0);
    lfh.writeUInt16LE(20, 4); // version needed
    lfh.writeUInt16LE(0x0800, 6); // UTF-8 filename flag
    lfh.writeUInt16LE(8, 8); // deflate method
    lfh.writeUInt16LE(0, 10);
    lfh.writeUInt16LE(0, 12);
    lfh.writeUInt32LE(crc, 14);
    lfh.writeUInt32LE(compressed.length, 18);
    lfh.writeUInt32LE(dataBuf.length, 22);
    lfh.writeUInt16LE(nameBuf.length, 26);
    lfh.writeUInt16LE(0, 28);

    localParts.push(lfh, nameBuf, compressed);

    // Central directory header (46 bytes + nameLen)
    const cdh = Buffer.alloc(46);
    cdh.writeUInt32LE(0x02014b50, 0);
    cdh.writeUInt16LE(20, 4);
    cdh.writeUInt16LE(20, 6);
    cdh.writeUInt16LE(0x0800, 8);
    cdh.writeUInt16LE(8, 10);
    cdh.writeUInt16LE(0, 12);
    cdh.writeUInt16LE(0, 14);
    cdh.writeUInt32LE(crc, 16);
    cdh.writeUInt32LE(compressed.length, 20);
    cdh.writeUInt32LE(dataBuf.length, 24);
    cdh.writeUInt16LE(nameBuf.length, 28);
    cdh.writeUInt16LE(0, 30);
    cdh.writeUInt16LE(0, 32);
    cdh.writeUInt16LE(0, 34);
    cdh.writeUInt16LE(0, 36);
    cdh.writeUInt32LE(0, 38);
    cdh.writeUInt32LE(offset, 42);

    centralParts.push(cdh, nameBuf);
    offset += 30 + nameBuf.length + compressed.length;
  }

  const centralSize = centralParts.reduce((s, b) => s + b.length, 0);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(files.length, 8);
  eocd.writeUInt16LE(files.length, 10);
  eocd.writeUInt32LE(centralSize, 12);
  eocd.writeUInt32LE(offset, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, ...centralParts, eocd]);
}

/**
 * 纯 Node 解析 ZIP 归档内的有效文件列表
 */
export function parseZipEntries(buf) {
  const entries = [];
  // 定位 End of Central Directory (0x06054b50)
  let eocdOffset = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocdOffset = i;
      break;
    }
  }
  if (eocdOffset === -1) return entries;

  const cdOffset = buf.readUInt32LE(eocdOffset + 16);
  const totalEntries = buf.readUInt16LE(eocdOffset + 10);
  let pos = cdOffset;

  for (let i = 0; i < totalEntries && pos + 46 <= buf.length; i++) {
    if (buf.readUInt32LE(pos) !== 0x02014b50) break;
    const method = buf.readUInt16LE(pos + 10);
    const compSize = buf.readUInt32LE(pos + 20);
    const nameLen = buf.readUInt16LE(pos + 28);
    const extraLen = buf.readUInt16LE(pos + 30);
    const commentLen = buf.readUInt16LE(pos + 32);
    const localOffset = buf.readUInt32LE(pos + 42);
    const name = buf.toString('utf8', pos + 46, pos + 46 + nameLen);

    pos += 46 + nameLen + extraLen + commentLen;

    if (name.endsWith('/') || localOffset + 30 > buf.length) continue;
    if (buf.readUInt32LE(localOffset) !== 0x04034b50) continue;

    const lNameLen = buf.readUInt16LE(localOffset + 26);
    const lExtraLen = buf.readUInt16LE(localOffset + 28);
    const dataStart = localOffset + 30 + lNameLen + lExtraLen;
    const dataEnd = dataStart + compSize;
    if (dataEnd > buf.length) continue;

    const compBuf = buf.subarray(dataStart, dataEnd);
    try {
      let content = null;
      if (method === 0) content = Buffer.from(compBuf);
      else if (method === 8) content = zlib.inflateRawSync(compBuf);
      if (content) entries.push({ name, content });
    } catch (_) {}
  }
  return entries;
}

function stripComments(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split(/\r?\n/)
    .filter((l) => {
      const t = l.trim();
      return t && !t.startsWith('//') && !t.startsWith('#');
    })
    .join('\n')
    .trim();
}

/**
 * 将原始对象标准化为 DSH Account 凭据格式
 */
export function normalizeAccountObject(raw, defaultRealm = 'global') {
  if (!raw || typeof raw !== 'object') return null;

  const accessToken =
    raw.auth?.accessToken ||
    raw.auth?.access_token ||
    raw.accessToken ||
    raw.access_token ||
    raw.token ||
    '';
  const refreshToken =
    raw.auth?.refreshToken ||
    raw.auth?.refresh_token ||
    raw.refreshToken ||
    raw.refresh_token ||
    '';

  if (!accessToken && !refreshToken) return null;

  const claims = parseJWTClaims(accessToken) || parseJWTClaims(refreshToken) || {};
  const uid =
    raw.account?.uid ||
    raw.uid ||
    raw.userId ||
    claims.sub ||
    claims.uid ||
    `user-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

  let realm = (raw.auth?.realm || raw.realm || '').toLowerCase();
  if (!realm) {
    const domainStr = String(raw.auth?.domain || raw.domain || claims.iss || '').toLowerCase();
    if (domainStr.includes('codebuddy') || domainStr.includes('tencent')) realm = 'cn';
    else if (domainStr.includes('workbuddy')) realm = 'global';
    else realm = defaultRealm;
  }

  const nickname =
    raw.account?.nickname ||
    raw.nickname ||
    raw.userName ||
    raw.email ||
    claims.email ||
    claims.name ||
    claims.nickname ||
    `Account-${String(uid).slice(0, 8)}`;

  return {
    account: {
      uid: String(uid),
      nickname: String(nickname),
      enterpriseId: raw.account?.enterpriseId || raw.enterpriseId || '',
      provider: raw.account?.provider || raw.provider || claims.provider || ''
    },
    auth: {
      realm: realm === 'cn' ? 'cn' : 'global',
      accessToken,
      refreshToken: refreshToken || accessToken,
      expiresAt: raw.auth?.expiresAt || raw.expiresAt || (claims.exp ? claims.exp * 1000 : Date.now() + 7200000),
      domain: raw.auth?.domain || raw.domain || (realm === 'cn' ? 'copilot.tencent.com' : 'www.workbuddy.ai')
    },
    disabled: Boolean(raw.disabled),
    disabledReason: raw.disabledReason || '',
    source: raw.source || 'batch-import',
    updatedAt: Date.now()
  };
}

/**
 * 从任意文本或 ZIP 缓冲区解析出全部候选账号对象
 */
export function extractAccountCandidates(input, defaultRealm = 'global') {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(String(input || ''), 'utf8');
  const candidates = [];

  // 1. 检测是否为 PKZIP 压缩包
  if (buf.length >= 4 && buf[0] === 0x50 && buf[1] === 0x4b) {
    const zipEntries = parseZipEntries(buf);
    for (const entry of zipEntries) {
      const low = entry.name.toLowerCase();
      if (low.endsWith('.json') || low.endsWith('.txt') || low.endsWith('.info')) {
        const subRealm = low.includes('cn') ? 'cn' : low.includes('global') ? 'global' : defaultRealm;
        candidates.push(...extractAccountCandidates(entry.content, subRealm));
      }
    }
    return candidates;
  }

  const clean = stripComments(buf.toString('utf8'));
  if (!clean) return candidates;

  const extractFromValue = (val) => {
    if (Array.isArray(val)) {
      let added = false;
      for (const item of val) {
        if (extractFromValue(item)) added = true;
      }
      return added;
    }
    if (val && typeof val === 'object') {
      for (const key of ['accounts', 'auths', 'data', 'items', 'list', 'account_list', 'tokens', 'result']) {
        if (key in val) {
          if (extractFromValue(val[key])) return true;
        }
      }
      const single = normalizeAccountObject(val, defaultRealm);
      if (single) {
        candidates.push(single);
        return true;
      }
    }
    return false;
  };

  // 2. 尝试整体 JSON 解析（数组、包装对象或单对象）
  if (clean.startsWith('[') || clean.startsWith('{')) {
    try {
      const parsed = JSON.parse(clean);
      if (extractFromValue(parsed)) return candidates;
    } catch (_) {}
  }

  // 3. 逐行识别（NDJSON / 单行 JSON 数组 / 卡密文本 access----refresh / token:refresh / 裸 token）
  for (const rawLine of clean.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith('{') || line.startsWith('[')) {
      try {
        const obj = JSON.parse(line);
        if (extractFromValue(obj)) continue;
      } catch (_) {}
    }

    // 分隔符格式：---- / | / : / 逗号
    let accessToken = '';
    let refreshToken = '';
    if (line.includes('----')) {
      const parts = line.split('----').map((s) => s.trim()).filter(Boolean);
      if (parts.length >= 2) {
        accessToken = parts[0];
        refreshToken = parts[1];
      }
    } else if (line.includes('|')) {
      const parts = line.split('|').map((s) => s.trim()).filter(Boolean);
      if (parts.length >= 2) {
        accessToken = parts[0];
        refreshToken = parts[1];
      }
    } else if (line.includes(':') && !line.startsWith('http')) {
      const idx = line.indexOf(':');
      accessToken = line.slice(0, idx).trim();
      refreshToken = line.slice(idx + 1).trim();
    } else {
      refreshToken = line;
      accessToken = line;
    }

    if (refreshToken || accessToken) {
      const acc = normalizeAccountObject({ accessToken, refreshToken }, defaultRealm);
      if (acc) candidates.push(acc);
    }
  }

  return candidates;
}

/**
 * 批量验证并导入账号进池
 */
export async function batchImportAccounts(input, store, client, defaultRealm = 'global') {
  const candidates = extractAccountCandidates(input, defaultRealm);
  const results = [];
  let imported = 0;
  let updated = 0;
  let failed = 0;

  for (const cand of candidates) {
    try {
      const existed = Boolean(store.get(cand.account.uid));
      // 验证连通性（先尝试 refreshToken，若无或失败再试 fetchBalance）
      let verified = false;
      if (cand.auth.refreshToken) {
        try {
          await client.refreshToken(cand);
          verified = true;
        } catch (_) {}
      }
      if (!verified) {
        await client.fetchBalance(cand);
      }
      store.upsert(cand);
      if (existed) updated++;
      else imported++;
      results.push({ uid: cand.account.uid, nickname: cand.account.nickname, realm: cand.auth.realm, ok: true });
    } catch (err) {
      failed++;
      results.push({ uid: cand.account.uid, nickname: cand.account.nickname, ok: false, error: err.message });
    }
  }

  return {
    ok: true,
    total: candidates.length,
    imported,
    updated,
    failed,
    results
  };
}

/**
 * 将账号池导出为标准的 ZIP 备份包
 */
export function exportBackupZip(store) {
  const accounts = store.getAll();
  const files = accounts.map((acc) => ({
    name: `${acc.auth?.realm || 'global'}-${acc.account.uid}.json`,
    content: JSON.stringify(acc, null, 2)
  }));
  return buildZipBuffer(files);
}

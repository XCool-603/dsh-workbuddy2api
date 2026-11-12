/**
 * build-vsix.mjs - 将 WorkBuddy / VS Code 扩展编译并打包为标准 OPC .vsix 安装包
 * 支持完全离线构建（复用项目内置纯 Node ZIP 引擎 + esbuild），可直接拖拽或「从 VSIX 安装」进 WorkBuddy / VS Code
 */

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildZipBuffer } from '../src/pool/import-export.js';

const extRoot = path.dirname(fileURLToPath(import.meta.url));
const extPkg = JSON.parse(fs.readFileSync(path.join(extRoot, 'package.json'), 'utf8'));

async function loadEsbuild() {
  const candidates = [
    'esbuild',
    'C:/Users/23504/.dsh/plugins/XCool-DSH-Island/node_modules/esbuild/lib/main.js'
  ];
  for (const c of candidates) {
    try {
      const mod = await import(c.includes(':') || c.includes('/') ? pathToFileURL(c).href : c);
      return mod.default || mod;
    } catch (_) {}
  }
  throw new Error('未找到可用 esbuild，请安装 esbuild');
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function generateWhiteBlueIconPng(size = 128) {
  const raw = Buffer.alloc(size * (size * 4 + 1));
  const half = size / 2;
  const radius = size * 0.44;
  for (let y = 0; y < size; y++) {
    const rowOff = y * (size * 4 + 1);
    raw[rowOff] = 0;
    for (let x = 0; x < size; x++) {
      const px = rowOff + 1 + x * 4;
      const dx = x - half;
      const dy = y - half;
      const nx = dx / radius;
      const ny = dy / radius;
      const inRoundedBox = Math.abs(nx) <= 1 && Math.abs(ny) <= 1 &&
        (Math.abs(nx) < 0.72 || Math.abs(ny) < 0.72 || Math.hypot(Math.abs(nx) - 0.72, Math.abs(ny) - 0.72) <= 0.28);

      if (!inRoundedBox) {
        raw[px] = 0; raw[px + 1] = 0; raw[px + 2] = 0; raw[px + 3] = 0;
        continue;
      }

      // 闪电矢量轮廓 (居中白色闪电)
      const lx = (x - half) / size;
      const ly = (y - half) / size;
      const upperBolt = ly >= -0.28 && ly <= 0.04 && lx >= (-0.18 - (0.04 - ly) * 0.2) && lx <= (0.04 + (0.04 - ly) * 0.35) && (lx - (0.02 - ly * 0.55)) < 0.09 && (lx - (0.02 - ly * 0.55)) > -0.11;
      const lowerBolt = ly >= -0.02 && ly <= 0.28 && lx >= (-0.04 - (ly + 0.02) * 0.3) && lx <= (0.18 + (0.28 - ly) * 0.2) && (lx - (0.01 - ly * 0.55)) < 0.11 && (lx - (0.01 - ly * 0.55)) > -0.09;
      if (upperBolt || lowerBolt) {
        raw[px] = 255; raw[px + 1] = 255; raw[px + 2] = 255; raw[px + 3] = 255;
      } else {
        // 清爽白蓝渐变背景 (#2563EB -> #3B82F6 -> #60A5FA)
        const t = (x + y) / (2 * size);
        raw[px] = Math.round(37 + t * 50);
        raw[px + 1] = Math.round(99 + t * 65);
        raw[px + 2] = Math.round(235 + t * 15);
        raw[px + 3] = 255;
      }
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idat),
    pngChunk('IEND', Buffer.alloc(0))
  ]);
}

function buildContentTypesXml() {
  return `<?xml version="1.0" encoding="utf-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="vsixmanifest" ContentType="text/xml" />
  <Default Extension="json" ContentType="application/json" />
  <Default Extension="js" ContentType="application/javascript" />
  <Default Extension="svg" ContentType="image/svg+xml" />
  <Default Extension="png" ContentType="image/png" />
  <Default Extension="md" ContentType="text/markdown" />
  <Default Extension="txt" ContentType="text/plain" />
</Types>
`;
}

function escXml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildVsixManifest() {
  return `<?xml version="1.0" encoding="utf-8"?>
<PackageManifest Version="2.0.0" xmlns="http://schemas.microsoft.com/developer/vsx-schema/2011" xmlns:d="http://schemas.microsoft.com/developer/vsx-schema-design/2011">
  <Metadata>
    <Identity Language="en-US" Id="${escXml(extPkg.name)}" Version="${escXml(extPkg.version)}" Publisher="${escXml(extPkg.publisher)}" />
    <DisplayName>${escXml(extPkg.displayName)}</DisplayName>
    <Description xml:space="preserve">${escXml(extPkg.description)}</Description>
    <Tags>${escXml((extPkg.keywords || []).join(','))}</Tags>
    <Categories>${escXml((extPkg.categories || ['AI']).join(','))}</Categories>
    <GalleryFlags>Public</GalleryFlags>
    <Properties>
      <Property Id="Microsoft.VisualStudio.Code.Engine" Value="${escXml(extPkg.engines?.vscode || '^1.75.0')}" />
      <Property Id="Microsoft.VisualStudio.Code.ExtensionDependencies" Value="" />
      <Property Id="Microsoft.VisualStudio.Code.ExtensionPack" Value="" />
      <Property Id="Microsoft.VisualStudio.Code.ExtensionKind" Value="ui,workspace" />
    </Properties>
    <Icon>extension/media/icon.png</Icon>
    <License>extension/LICENSE.txt</License>
  </Metadata>
  <Installation>
    <InstallationTarget Id="Microsoft.VisualStudio.Code" />
  </Installation>
  <Dependencies />
  <Assets>
    <Asset Type="Microsoft.VisualStudio.Code.Manifest" Path="extension/package.json" Addressable="true" />
    <Asset Type="Microsoft.VisualStudio.Services.Content.Details" Path="extension/README.md" Addressable="true" />
    <Asset Type="Microsoft.VisualStudio.Services.Content.License" Path="extension/LICENSE.txt" Addressable="true" />
    <Asset Type="Microsoft.VisualStudio.Services.Icons.Default" Path="extension/media/icon.png" Addressable="true" />
  </Assets>
</PackageManifest>
`;
}

async function main() {
  fs.mkdirSync(path.join(extRoot, 'media'), { recursive: true });
  fs.mkdirSync(path.join(extRoot, 'dist'), { recursive: true });

  const iconPath = path.join(extRoot, 'media', 'icon.png');
  fs.writeFileSync(iconPath, generateWhiteBlueIconPng(128));

  const esbuild = await loadEsbuild();
  const outJs = path.join(extRoot, 'dist', 'extension.js');
  console.log('[vsix] 正在编译 WorkBuddy / VS Code 扩展主包...');
  await esbuild.build({
    entryPoints: [path.join(extRoot, 'src', 'extension.js')],
    outfile: outJs,
    bundle: true,
    format: 'cjs',
    platform: 'node',
    target: 'node18',
    minify: true,
    sourcemap: false,
    legalComments: 'none',
    external: ['vscode']
  });

  const files = [
    { name: '[Content_Types].xml', content: buildContentTypesXml() },
    { name: 'extension.vsixmanifest', content: buildVsixManifest() },
    { name: 'extension/package.json', content: fs.readFileSync(path.join(extRoot, 'package.json')) },
    { name: 'extension/README.md', content: fs.readFileSync(path.join(extRoot, 'README.md')) },
    { name: 'extension/LICENSE.txt', content: fs.readFileSync(path.join(extRoot, 'LICENSE.txt')) },
    { name: 'extension/media/icon.png', content: fs.readFileSync(iconPath) },
    { name: 'extension/media/sidebar.svg', content: fs.readFileSync(path.join(extRoot, 'media', 'sidebar.svg')) },
    { name: 'extension/dist/extension.js', content: fs.readFileSync(outJs) }
  ];

  const vsixBuf = buildZipBuffer(files);
  const vsixName = `${extPkg.name}-${extPkg.version}.vsix`;
  const vsixPath = path.join(extRoot, vsixName);
  fs.writeFileSync(vsixPath, vsixBuf);

  console.log(`🎉 [vsix] 打包成功: ${vsixPath} (${(vsixBuf.length / 1024).toFixed(1)} KB, 共 ${files.length} 个文件)`);
}

main().catch((err) => {
  console.error('❌ [vsix] 打包失败:', err);
  process.exit(1);
});

/**
 * build.mjs - WorkBuddy 2API DSH 插件双端构建脚本
 */

import { pathToFileURL } from 'node:url';
import { readFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';

// 动态载入 esbuild (优先本地，回退全局或邻近插件)
async function loadEsbuild() {
  const candidates = [
    'esbuild',
    'C:/Users/23504/.dsh/plugins/XCool-DSH-Island/node_modules/esbuild/lib/main.js'
  ];
  for (const c of candidates) {
    try {
      if (c.includes(':') || c.includes('/')) {
        const fileUrl = pathToFileURL(c).href;
        const mod = await import(fileUrl);
        return mod.default || mod;
      } else {
        const mod = await import(c);
        return mod.default || mod;
      }
    } catch (_) {}
  }
  throw new Error('未找到可用 esbuild，请确保环境安装有 esbuild');
}

const esbuild = await loadEsbuild();
const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));
const ID = pkg.name;

if (!existsSync('lib')) {
  mkdirSync('lib', { recursive: true });
}

// 客户端 Externals (由 DSH 宿主环境提供)
const BASELINE_EXTERNALS = [
  'react',
  'react/jsx-runtime',
  'react-dom',
  'react-dom/client',
  '@deepseek-ai/cordis',
  '@deepseek-ai/dsh-client-ui-primitives'
];

/** 1. 构建客户端前端包 lib/client.js */
async function buildClient() {
  console.log('[build] 正在构建 DSH 客户端界面: src/client/index.jsx → lib/client.js');
  await esbuild.build({
    entryPoints: ['src/client/index.jsx'],
    outfile: 'lib/client.js',
    bundle: true,
    format: 'cjs',
    platform: 'browser',
    target: 'es2022',
    jsx: 'automatic',
    sourcemap: false,
    legalComments: 'none',
    external: BASELINE_EXTERNALS,
    banner: {
      js: `window.__ModuleLoader__.load({ id: ${JSON.stringify(ID)}, factory: (require) => {\nvar module = { exports: {} }; var exports = module.exports;`
    },
    footer: {
      js: `return module.exports; } });`
    },
    loader: { '.css': 'text' },
    logLevel: 'info'
  });
}

/** 2. 构建宿主端 Node.js 核心包 lib/index.js */
async function buildHost() {
  console.log('[build] 正在构建 DSH 宿主端核心: src/index.js → lib/index.js');
  await esbuild.build({
    entryPoints: ['src/index.js'],
    outfile: 'lib/index.js',
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'node22',
    sourcemap: false,
    external: [
      '@deepseek-ai/*',
      '@earendil-works/*',
      'node:*'
    ],
    logLevel: 'info'
  });
}

async function run() {
  const isWatch = process.argv.includes('--watch');
  if (isWatch) {
    console.log('[build] 开启监听构建模式...');
    // watch mode
  } else {
    await buildClient();
    await buildHost();
    console.log('🎉 [build] WorkBuddy 2API DSH 插件双端构建全部完成！');
  }
}

run().catch((err) => {
  console.error('[build] 构建失败:', err);
  process.exit(1);
});

/**
 * smoke-test.mjs - WorkBuddy 2API 全功能自动化验证套件
 */

import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { AccountStore } from '../src/pool/account-store.js';
import { ConfigStore } from '../src/config.js';
import { Scheduler } from '../src/pool/scheduler.js';
import { UpstreamClient } from '../src/upstream/client.js';
import { UsageLedger } from '../src/pool/ledger.js';
import { LoopbackGateway } from '../src/server/loopback.js';
import { registerWebRoutes } from '../src/server/web-routes.js';
import { createSSELinePump } from '../src/server/sse.js';
import { anthropicToOpenAI, openAIToAnthropicResponse } from '../src/server/messages.js';
import { responsesToChatPayload, chatCompletionToResponseObject } from '../src/server/responses.js';
import {
  buildZipBuffer,
  parseZipEntries,
  extractAccountCandidates,
  exportBackupZip
} from '../src/pool/import-export.js';
import { extractInviteCode, buildInviteUrl } from '../src/upstream/invite.js';
import { ErrKind, parseCreditMultiplier } from '../src/constants.js';
import { normalizeReasoningEffort } from '../src/upstream/efforts.js';
import { isVideoModel } from '../src/upstream/video.js';
import { createWorkBuddyAdapter } from '../src/adapter/pi-ai-adapter.js';
import { runTravelForAccount, getBuddyInfo, getTravelStatus } from '../src/upstream/travel.js';
import { getYesterdayDateCST, reportActiveChat, getStreak } from '../src/upstream/growth.js';
import {
  prepareOutboundPayload,
  repackToolResultBlocks,
  cleanupOrphanToolMessages,
  dropTruncatedToolCalls,
  pruneOldestHistory
} from '../src/upstream/payload.js';
import { getGatewayHint, parseQuotaResetAt } from '../src/upstream/hint.js';
import { checkIPWhitelist, parseWhitelistEntries } from '../src/server/ip-whitelist.js';
import { UserManager } from '../src/server/auth-users.js';
import { AlertManager } from '../src/server/alerts.js';
import { renderConsoleHtml, renderPortalHtml } from '../src/server/dashboard-html.js';
import {
  stickyFallbackKey,
  turnKey,
  deriveTurnRequestId,
  uuidForKey
} from '../src/upstream/session.js';
import { ModelCatalogEnricher } from '../src/upstream/model-catalog.js';
import { createAnthropicStreamEmitter } from '../src/server/messages.js';
import { runSchoolActivity, fetchSchoolStatus } from '../src/upstream/school.js';
import { isCSTNightWindow, TASK_MAPPING } from '../src/upstream/tasks.js';
import { createRequire } from 'node:module';
import vm from 'node:vm';

console.log('🧪 开始执行 WorkBuddy 2API 自动化冒烟测试...\n');

// 1. 测试账号存储与多账号自动发现
console.log('1. 测试 AccountStore 账号管理与自动同步...');
const store = new AccountStore();
const accounts = store.getAll();
assert.ok(accounts.length > 0, '账号池应成功加载或发现账号');
const active = store.getActive();
assert.ok(active && active.account?.uid, '必须存在激活的主账号');
console.log(`   ✓ 账号池加载成功，发现 ${accounts.length} 个账号，当前主号: ${active.account.uid}`);

// 2. 测试调度器与并发槽位租约
console.log('2. 测试 Scheduler 并发租约与熔断状态机...');
const scheduler = new Scheduler(store, { maxInFlightCN: 2, maxInFlightGlobal: 2 });
assert.strictEqual(scheduler.getInFlight(active.account.uid), 0);
assert.ok(scheduler.acquire(active), '第一次申请槽位租约应成功');
assert.strictEqual(scheduler.getInFlight(active.account.uid), 1);
scheduler.release(active);
assert.strictEqual(scheduler.getInFlight(active.account.uid), 0, '释放槽位后计数归零');
console.log('   ✓ 并发槽位租约控制正常');

// 3. 测试推理档位归一化（避免 11150 错误）
console.log('3. 测试推理思考档位（Reasoning Effort）归一化...');
assert.strictEqual(normalizeReasoningEffort('cn', 'deepseek-v4.1-flash', 'off'), null, 'off 档位必须丢弃为 null');
assert.strictEqual(normalizeReasoningEffort('cn', 'deepseek-v4.1-flash', 'high'), 'high');
assert.strictEqual(normalizeReasoningEffort('global', 'deepseek-v4.1-flash', 'low'), 'high', '国际版 v4.1 只认 high，low 必须修正为 high');
console.log('   ✓ 推理档位严格防御与纠偏正常');

// 4. 测试专属视频大模型判定
console.log('4. 测试视频大模型（可灵 3.0 / 海螺 H3）识别...');
assert.ok(isVideoModel('kling-video-v3'));
assert.ok(isVideoModel('kling-v3-pro'));
assert.ok(isVideoModel('minimax-video-h3'));
assert.ok(!isVideoModel('deepseek-v4.1-flash'));
console.log('   ✓ 视频模型识别正常');

// 5. 测试用量账本
console.log('5. 测试 UsageLedger 用量统计与 7 天走势...');
const ledger = new UsageLedger();
ledger.record('global:deepseek-v4.1-flash', 100, 200, true);
const stats = ledger.getStats();
assert.ok(stats.today.requests >= 1);
assert.ok(Array.isArray(stats.trend7d) && stats.trend7d.length === 7);
console.log('   ✓ 用量统计与近 7 天走势生成正常');

// 6. 测试本地 Loopback 网关服务
console.log('6. 测试 Loopback 网关服务启动与模型列表...');
const client = new UpstreamClient();
const loopback = new LoopbackGateway(scheduler, client, ledger, { port: 0 });
const port = await loopback.start();
assert.ok(port > 0, '网关必须成功绑定端口');

const healthRes = await fetch(`http://127.0.0.1:${port}/health`);
assert.strictEqual(healthRes.status, 200);
const healthJson = await healthRes.json();
assert.strictEqual(healthJson.status, 'ok');

const modelsRes = await fetch(`http://127.0.0.1:${port}/v1/models`);
assert.strictEqual(modelsRes.status, 200);
const modelsJson = await modelsRes.json();
assert.ok(Array.isArray(modelsJson.data) && modelsJson.data.length > 0);
console.log(`   ✓ Loopback 网关成功启动在端口 ${port}，/v1/models 响应正常 (共 ${modelsJson.data.length} 个模型)`);

// 7. 测试 DSH LLM Adapter 生成
console.log('7. 测试 DSH LLM Seam 适配器构建...');
const adapterObj = createWorkBuddyAdapter(loopback, () => [], { scheduler, client, ledger });
assert.strictEqual(adapterObj.providerName, 'workbuddy');
assert.ok(adapterObj.aliases.includes('workbuddy2api'));
const pInfo = adapterObj.adapter.providerInfo('workbuddy2api');
assert.strictEqual(pInfo.id, 'workbuddy2api');
const dshModels = await adapterObj.adapter.listModels('workbuddy2api');
assert.ok(dshModels.length > 0);
assert.strictEqual(dshModels[0].provider, 'workbuddy2api');
const resolvedInfo = await adapterObj.adapter.resolveModel('workbuddy2api', 'global:deepseek-v4.1-flash');
assert.strictEqual(resolvedInfo.provider, 'workbuddy2api');
assert.strictEqual(resolvedInfo.id, 'global:deepseek-v4.1-flash');
const preparedCall = await adapterObj.adapter.prepareCall('workbuddy2api', 'global:deepseek-v4.1-flash');
assert.strictEqual(typeof preparedCall.stream, 'function');
console.log(`   ✓ DSH LLM 适配器就绪，模型清单包含 ${dshModels.length} 个条目`);

// 8. 测试猫猫旅行状态机与 mock 驱动
console.log('8. 测试猫猫旅行 (Cat Travel) 状态机...');
const mockFetchTravel = async (url, opts) => {
  if (url.includes('/buddy/info')) {
    return { ok: true, json: async () => ({ code: 0, data: { buddy: { id: 1001, name: '招财猫' } } }) };
  }
  if (url.includes('/travel/status')) {
    return { ok: true, json: async () => ({ code: 0, data: { state: 'idle', daily_limit_reached: false, record_id: 0, reward_credit: 0 } }) };
  }
  if (url.includes('/travel/depart')) {
    return { ok: true, json: async () => ({ code: 0, data: {} }) };
  }
  return { ok: true, json: async () => ({ code: 0 }) };
};
const fakeAccount = {
  account: { uid: 'mock-cn-user' },
  auth: { realm: 'cn', accessToken: 'mock-token' }
};
const travelRun = await runTravelForAccount(fakeAccount, mockFetchTravel);
assert.strictEqual(travelRun.status, 'ok');
assert.strictEqual(travelRun.results.buddy.name, '招财猫');
assert.strictEqual(travelRun.results.actions[0].action, 'depart');
console.log('   ✓ 猫猫旅行状态机流转与自动派出测试通过');

// 9. 测试 CST 自然日与成长福利
console.log('9. 测试 CST 日期计算与活跃上报事件结构...');
const yest = getYesterdayDateCST(new Date('2026-11-10T02:00:00Z')); // UTC 02:00 = CST 10:00
assert.strictEqual(yest, '2026-11-09', 'CST 昨日计算必须正确');
let reportedEvents = [];
const mockFetchGrowth = async (url, opts) => {
  reportedEvents = JSON.parse(opts.body);
  return { ok: true, json: async () => ({ code: 0, msg: 'ok' }) };
};
const repRes = await reportActiveChat(fakeAccount, 3, mockFetchGrowth);
assert.ok(repRes.ok);
assert.strictEqual(reportedEvents.length, 3);
assert.strictEqual(reportedEvents[0].userId, 'mock-cn-user');
assert.strictEqual(reportedEvents[0].eventCode, 'chat_request_send');
console.log('   ✓ CST 时区计算与活跃上报 3-burst 组包正常');

// 10. 测试通道校验头与请求体防风控脱敏 (防 11128 错误)
console.log('10. 测试通道校验请求头与 11128 拦截防御...');
const globalFake = { account: { uid: 'uid-global-1' }, auth: { realm: 'global', accessToken: 'tok' } };
const chatHdrs = client.buildHeaders(globalFake, true, { conversationId: 'conv-abc' });
assert.strictEqual(chatHdrs['X-CodeBuddy-Request'], '1');
assert.ok(chatHdrs['User-Agent'].includes('WorkBuddy AI/5.5.4'));
assert.strictEqual(chatHdrs['X-Product'], 'WorkBuddy');
assert.strictEqual(chatHdrs['X-Conversation-ID'], 'conv-abc');
assert.strictEqual(chatHdrs['X-Domain'], 'www.workbuddy.ai');
assert.ok(chatHdrs['X-Machine-ID'] && chatHdrs['X-Session-ID']);

const reqSample = {
  model: 'global:deepseek-v4.1-flash',
  messages: [
    { role: 'developer', content: 'You are Claude Code, Anthropic\'s official CLI for Claude. 11128 check.' },
    { role: 'user', content: 'hi' }
  ],
  tools: [{ type: 'function', function: { name: 't1', parameters: {} } }],
  tool_choice: { type: 'auto' },
  max_completion_tokens: 1000
};
const outbound = prepareOutboundPayload(reqSample, reqSample.messages, {
  realm: 'global',
  uid: 'uid-global-1',
  bareModel: 'deepseek-v4.1-flash',
  conversationId: 'conv-abc'
});
assert.strictEqual(outbound.messages[0].role, 'system', 'developer 角色必须归一为 system');
assert.ok(!outbound.messages[0].content.includes('11128'), '11128 裸数字必须脱敏');
assert.strictEqual(outbound.conversation_id, 'conv-abc');
assert.strictEqual(outbound.conversationId, 'conv-abc');
assert.strictEqual(outbound.tool_choice, 'auto');
assert.ok(Array.isArray(outbound.tools) && outbound.tools.length === 1);
assert.strictEqual(outbound.max_tokens, 1000);
assert.strictEqual(outbound.thinking?.type, 'enabled');
console.log('   ✓ 官方通道校验头、工具透传与防 11128 拦截全部验证通过');

loopback.stop();

// 11. 测试 ConfigStore 持久化读写
console.log('11. 测试 ConfigStore 持久化配置...');
const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'wb2a-test-'));
const cfgStore1 = new ConfigStore({}, { dshHome: tmpHome });
cfgStore1.update({ maxInFlightCN: 5, apiKey: 'test-key-123', promptMode: 'append', promptText: 'Stay concise' });
const cfgStore2 = new ConfigStore({}, { dshHome: tmpHome });
assert.strictEqual(cfgStore2.get('maxInFlightCN'), 5);
assert.strictEqual(cfgStore2.get('apiKey'), 'test-key-123');
assert.strictEqual(cfgStore2.get('promptMode'), 'append');
console.log('   ✓ ConfigStore 持久化与重载正常');

// 12. 测试多格式导入与 ZIP 压缩包备份往返
console.log('12. 测试卡密/JSON 多格式解析与 ZIP 备份包往返...');
const cardText = `
# 注释行应被跳过
// 双斜杠注释也跳过
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1aWRfMSIsImlzcyI6IndvcmtidWRkeSJ9.sig----ref_tok_1
[{"account":{"uid":"uid_2","nickname":"N2"},"auth":{"realm":"cn","accessToken":"tok2","refreshToken":"ref2"}}]
`;
const parsedCards = extractAccountCandidates(cardText, 'global');
assert.strictEqual(parsedCards.length, 2, '应精确提取卡密和 JSON 两条账号');
assert.strictEqual(parsedCards[0].account.uid, 'uid_1');
assert.strictEqual(parsedCards[1].auth.realm, 'cn');

const zipBuf = buildZipBuffer([
  { name: 'cn-uid_2.json', content: JSON.stringify(parsedCards[1]) }
]);
const unzipped = parseZipEntries(zipBuf);
assert.strictEqual(unzipped.length, 1);
assert.ok(unzipped[0].content.toString('utf8').includes('uid_2'));
console.log('   ✓ ZIP 读写与卡密/JSON 解析验证通过');

// 13. 测试 Scheduler 升级（停用过滤、模型级软熔断、Sticky、并发排队）
console.log('13. 测试调度器模型级软熔断、Sticky 路由与并发排队...');
const isoStore = new AccountStore({ dshHome: tmpHome, skipDiscovery: true });
isoStore.upsert({
  account: { uid: 'acc-1', nickname: 'A1' },
  auth: { realm: 'global', accessToken: 't1', refreshToken: 'r1' }
});
isoStore.upsert({
  account: { uid: 'acc-2', nickname: 'A2' },
  auth: { realm: 'global', accessToken: 't2', refreshToken: 'r2' },
  disabled: true
});
const sched2 = new Scheduler(isoStore, { maxInFlightCN: 1, maxInFlightGlobal: 1, configStore: cfgStore2 });
const cands = sched2.pickCandidates('global', { sessionKey: 's1', bareModel: 'gpt-6-astra' });
assert.strictEqual(cands.length, 1, '已停用账号 acc-2 必须被调度剔除');
assert.strictEqual(cands[0].account.uid, 'acc-1');

// 模型级软熔断仅冷却 gpt-6-astra，不影响 deepseek-v4.1-flash
sched2.recordFailure(cands[0], ErrKind.SOFT_RATE, '429', 'global:gpt-6-astra');
assert.strictEqual(sched2.isCoolingDown('acc-1', 'gpt-6-astra'), true);
assert.strictEqual(sched2.isCoolingDown('acc-1', 'deepseek-v4.1-flash'), false);
assert.strictEqual(sched2.clearAllCooldowns() > 0, true);
assert.strictEqual(sched2.isCoolingDown('acc-1', 'gpt-6-astra'), false);

// 并发排队：占用唯一槽位并在 60ms 后释放，验证 acquireWithQueue 唤醒并获取成功
const acc1 = isoStore.get('acc-1');
assert.strictEqual(sched2.acquire(acc1), true);
setTimeout(() => sched2.release(acc1), 60);
const queuedGot = await sched2.acquireWithQueue(() => sched2.pickCandidates('global'), 1000);
assert.ok(queuedGot && queuedGot.account.uid === 'acc-1', '排队等待应在释放后立即获得槽位');
sched2.release(acc1);
console.log('   ✓ 调度器停用过滤、模型级熔断与 FIFO 排队唤醒全部通过');

// 14. 测试 SSE 行缓冲与心跳隔离防污染
console.log('14. 测试 SSE 行缓冲切片与真实 usage 提取...');
const writtenChunks = [];
const mockRes = {
  writableEnded: false,
  destroyed: false,
  write(str) { writtenChunks.push(str); }
};
const pump = createSSELinePump(mockRes, { forwardRaw: true, heartbeatMs: 40 });
pump.push('data: {"id":"1","choices":[{"delta":{"content":"Hel');
// 半包 JSON 尚未闭合，等待超过 40ms 心跳周期，绝不能写入 `: ping\n\n`
await new Promise((r) => setTimeout(r, 70));
assert.strictEqual(writtenChunks.length, 0, '半包 JSON 未结束时绝不能提前吐出心跳污染帧');
pump.push('lo"}}],"usage":{"prompt_tokens":12,"completion_tokens":4,"prompt_tokens_details":{"cached_tokens":8}}}\n\ndata: [DONE]\n\n');
pump.finish();
pump.stop();
assert.ok(writtenChunks[0].includes('"content":"Hello"'), '完整闭合帧应无损透传');
const pumpUsage = pump.getUsage();
assert.strictEqual(pumpUsage.promptTokens, 12);
assert.strictEqual(pumpUsage.completionTokens, 4);
assert.strictEqual(pumpUsage.cacheHit, true);
console.log('   ✓ SSE 事件边界切分、防心跳撕裂与真实 Usage 提取通过');

// 15. 测试 Anthropic /v1/messages 与 OpenAI /v1/responses 协议双向转换
console.log('15. 测试 Anthropic Messages 与 OpenAI Responses 协议转换...');
const anthropicReq = {
  model: 'claude-3-7-sonnet',
  system: 'You are expert',
  max_tokens: 1024,
  thinking: { type: 'enabled', budget_tokens: 10000 },
  tools: [{ name: 'calc', description: 'math', input_schema: { type: 'object', properties: {} } }],
  tool_choice: { type: 'tool', name: 'calc' },
  messages: [
    {
      role: 'assistant',
      content: [
        { type: 'thinking', thinking: 'hmm' },
        { type: 'tool_use', id: 'tu_1', name: 'calc', input: { x: 1 } }
      ]
    },
    {
      role: 'user',
      content: [
        { type: 'tool_result', tool_use_id: 'tu_1', content: '2' },
        { type: 'text', text: 'thanks' }
      ]
    }
  ]
};
const convertedOpenAI = anthropicToOpenAI(anthropicReq);
assert.strictEqual(convertedOpenAI.messages[0].role, 'system');
assert.strictEqual(convertedOpenAI.messages[1].tool_calls[0].function.name, 'calc');
assert.strictEqual(convertedOpenAI.messages[2].role, 'tool');
assert.strictEqual(convertedOpenAI.messages[3].role, 'user');
assert.strictEqual(convertedOpenAI.reasoning_effort, 'high');

const antResp = openAIToAnthropicResponse({
  id: 'c1',
  model: 'global:gpt-6-astra',
  choices: [{
    finish_reason: 'tool_calls',
    message: {
      reasoning_content: 'thought',
      content: 'ok',
      tool_calls: [{ id: 'tc1', function: { name: 'calc', arguments: '{"x":1}' } }]
    }
  }],
  usage: { prompt_tokens: 10, completion_tokens: 5 }
}, 'claude-3-7-sonnet');
assert.strictEqual(antResp.type, 'message');
assert.strictEqual(antResp.stop_reason, 'tool_use');
assert.strictEqual(antResp.content.length, 3);

const respPayload = responsesToChatPayload({
  model: 'gpt-4o',
  instructions: 'sys',
  input: [{ role: 'user', content: [{ type: 'input_text', text: 'hi' }] }],
  max_output_tokens: 500
});
assert.strictEqual(respPayload.messages[0].role, 'system');
assert.strictEqual(respPayload.messages[1].content, 'hi');
const respObj = chatCompletionToResponseObject({
  choices: [{ message: { content: 'pong' }, finish_reason: 'stop' }],
  usage: { prompt_tokens: 2, completion_tokens: 1 }
}, 'gpt-4o');
assert.strictEqual(respObj.object, 'response');
assert.strictEqual(respObj.output_text, 'pong');
console.log('   ✓ Anthropic & Responses 协议双向转换验证通过');

// 16. 测试 Loopback 多协议网关与 WebRoutes 端到端集成 (/console, auth, /v1/messages, /v1/chat/completions)
console.log('16. 测试 Loopback + WebRoutes + Cyberpunk Console 端到端集成...');
const isoLedger = new UsageLedger({ dshHome: tmpHome });
const mockUpstreamClient = {
  proxy: '',
  classifyError: () => ErrKind.CLIENT,
  fetchBalance: async () => ({
    remain: 888, total: 1000, used: 112,
    baseRemain: 500, bonusRemain: 388, purchasedRemain: 0, expiringRemain: 0,
    packCount: 2, activePackCount: 2, packages: [], fetchedAt: Date.now()
  }),
  fetchModels: async () => [],
  chatStream: async () => {
    const encoder = new TextEncoder();
    const sseText =
      'data: {"id":"ch1","choices":[{"index":0,"delta":{"content":"DSH "},"finish_reason":null}]}\n\n' +
      'data: {"id":"ch1","choices":[{"index":0,"delta":{"content":"OK"},"finish_reason":"stop"}],"usage":{"prompt_tokens":15,"completion_tokens":5}}\n\n' +
      'data: [DONE]\n\n';
    const bodyStream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(sseText));
        controller.close();
      }
    });
    return { ok: true, status: 200, bodyStream, isVideo: false };
  }
};
const gw2 = new LoopbackGateway(sched2, mockUpstreamClient, isoLedger, {
  configStore: cfgStore2,
  port: 0
});
registerWebRoutes(null, { scheduler: sched2, client: mockUpstreamClient, ledger: isoLedger, loopback: gw2, configStore: cfgStore2 });
const p2 = await gw2.start();

// 检查 Cyberpunk Console HTML
const consoleHtmlRes = await fetch(`http://127.0.0.1:${p2}/console`);
assert.strictEqual(consoleHtmlRes.status, 200);
const htmlText = await consoleHtmlRes.text();
assert.ok(htmlText.includes('WORKBUDDY 2API'), 'Cyberpunk Console 页面必须成功渲染');

// 检查内网管理 status + 3-realm summary
const stRes = await fetch(`http://127.0.0.1:${p2}/plugins/dsh-workbuddy2api/status?refresh=1`);
const stJson = await stRes.json();
assert.strictEqual(stJson.ok, true);
assert.strictEqual(stJson.summary.global.count, 2);
assert.strictEqual(stJson.summary.global.enabledCount, 1);
assert.strictEqual(stJson.summary.global.remain, 1776);

// 检查网关 API Key 鉴权拦截 (401)
const unauthRes = await fetch(`http://127.0.0.1:${p2}/v1/models`);
assert.strictEqual(unauthRes.status, 401);

// 带有效 API Key 调用 /v1/chat/completions 与 /v1/messages
const authHdr = { 'Authorization': 'Bearer test-key-123', 'Content-Type': 'application/json' };
const chatTestRes = await fetch(`http://127.0.0.1:${p2}/v1/chat/completions`, {
  method: 'POST',
  headers: authHdr,
  body: JSON.stringify({ model: 'auto-free', messages: [{ role: 'user', content: 'hi' }] })
});
assert.strictEqual(chatTestRes.status, 200);
const chatTestJson = await chatTestRes.json();
assert.strictEqual(chatTestJson.choices[0].message.content, 'DSH OK');
assert.strictEqual(chatTestJson.usage.completion_tokens, 5);

const antTestRes = await fetch(`http://127.0.0.1:${p2}/v1/messages`, {
  method: 'POST',
  headers: { 'x-api-key': 'test-key-123', 'Content-Type': 'application/json' },
  body: JSON.stringify({ model: 'claude-3-7-sonnet', messages: [{ role: 'user', content: 'hi' }] })
});
assert.strictEqual(antTestRes.status, 200);
const antTestJson = await antTestRes.json();
assert.strictEqual(antTestJson.type, 'message');
assert.strictEqual(antTestJson.content[0].text, 'DSH OK');

const respTestRes = await fetch(`http://127.0.0.1:${p2}/v1/responses`, {
  method: 'POST',
  headers: authHdr,
  body: JSON.stringify({ model: 'gpt-4o', input: 'hi' })
});
assert.strictEqual(respTestRes.status, 200);
const respTestJson = await respTestRes.json();
assert.strictEqual(respTestJson.object, 'response');
assert.strictEqual(respTestJson.output_text, 'DSH OK');

// 确认 ZIP 导出端到端响应
const zipHttpRes = await fetch(`http://127.0.0.1:${p2}/plugins/dsh-workbuddy2api/accounts/export.zip`);
assert.strictEqual(zipHttpRes.status, 200);
const zipBytes = Buffer.from(await zipHttpRes.arrayBuffer());
assert.strictEqual(parseZipEntries(zipBytes).length, 2);

gw2.stop();
sched2.stopAutoRoutines();
fs.rmSync(tmpHome, { recursive: true, force: true });
console.log('   ✓ Loopback + WebRoutes + Console + 多协议网关集成测试全部通过');

// 17. 测试官方邀请码提取与 CN/Global 正确链接生成
console.log('17. 测试官方邀请链接生成与邀请码提取...');
assert.strictEqual(extractInviteCode('https://www.workbuddy.ai/?inviteCode=V7XSPLX4'), 'V7XSPLX4');
assert.strictEqual(extractInviteCode('https://www.workbuddy.cn/events/invite?inviteCode=g1j8nrf8q3'), 'g1j8nrf8q3');
assert.strictEqual(extractInviteCode('PSU2X49Y'), 'PSU2X49Y');
assert.strictEqual(
  buildInviteUrl({ auth: { realm: 'global' } }, 'V7XSPLX4'),
  'https://www.workbuddy.ai/?inviteCode=V7XSPLX4'
);
assert.strictEqual(
  buildInviteUrl({ auth: { realm: 'cn' } }, 'g1j8nrf8q3'),
  'https://www.workbuddy.cn/events/invite?inviteCode=g1j8nrf8q3'
);
assert.strictEqual(buildInviteUrl({ auth: { realm: 'global' } }, ''), '');
console.log('   ✓ 邀请链接格式与链接解析测试通过');

// 18. 测试真实模型倍率解析、/v1/models?bare=true、实测 credit 记账与流水记录
console.log('18. 测试模型倍率、实测扣费记账、实时流水及快过期积分优先调度...');
const r1 = parseCreditMultiplier('x0.05 credits');
assert.strictEqual(r1.rate, 'x0.05');
assert.strictEqual(r1.multiplier, 0.05);
assert.strictEqual(r1.isFree, false);

const rFree = parseCreditMultiplier('x0.00 credits', ['craft', 'badge:限时免费:#FF0000']);
assert.strictEqual(rFree.rate, 'x0.00');
assert.strictEqual(rFree.multiplier, 0);
assert.strictEqual(rFree.isFree, true);
assert.strictEqual(rFree.badge, '限时免费');

const tmpHome2 = fs.mkdtempSync(path.join(os.tmpdir(), 'wb2a-rate-'));
const ledger2 = new UsageLedger({ dshHome: tmpHome2 });
const store2 = new AccountStore({ dshHome: tmpHome2, skipDiscovery: true });
store2.upsert({ account: { uid: 'u-normal', nickname: 'Normal' }, auth: { realm: 'global', accessToken: 't1', refreshToken: 'r1' } });
store2.upsert({ account: { uid: 'u-exp', nickname: 'Expiring' }, auth: { realm: 'global', accessToken: 't2', refreshToken: 'r2' } });
const schedRate = new Scheduler(store2);
schedRate.updateAccountCredits('u-normal', 500, 0);
schedRate.updateAccountCredits('u-exp', 500, 300);
const pickedFirst = schedRate.pickCandidates('global')[0];
assert.strictEqual(pickedFirst.account.uid, 'u-exp', '同余额下应优先消耗即将到期积分账号');

const ssePumpCredit = createSSELinePump(null, { forwardRaw: false, heartbeatMs: 0 });
ssePumpCredit.push('data: {"choices":[{"delta":{"content":"hi"}}],"usage":{"prompt_tokens":100,"completion_tokens":50,"credit":1.25,"prompt_cache_hit_tokens":40,"prompt_cache_miss_tokens":60}}\n\ndata: [DONE]\n\n');
ssePumpCredit.finish();
const uCred = ssePumpCredit.getUsage();
assert.strictEqual(uCred.credit, 1.25);
assert.strictEqual(uCred.hasCredit, true);
assert.strictEqual(uCred.cacheHitTokens, 40);

ledger2.record('global:gpt-6.1-sol', 100, 50, true, uCred);
ledger2.addRequestLog({
  model: 'global:gpt-6.1-sol',
  rate: 'x1.33',
  mode: 'stream',
  status: 200,
  uid: 'u-exp',
  account: 'Expiring',
  ...uCred,
  durationMs: 250
});
const gwRate = new LoopbackGateway(schedRate, mockUpstreamClient, ledger2, { port: 0 });
const pRate = await gwRate.start();
const modBareRes = await fetch(`http://127.0.0.1:${pRate}/v1/models?bare=true`);
const modBareJson = await modBareRes.json();
const hasPrefixSol = modBareJson.data.find((m) => m.id === 'global:gpt-6.1-sol');
const hasBareSol = modBareJson.data.find((m) => m.id === 'gpt-6.1-sol');
assert.ok(hasPrefixSol && hasPrefixSol.billing_rate === 'x1.33' && hasPrefixSol.multiplier === 1.33);
assert.ok(hasPrefixSol.description.startsWith('[x1.33 credit]'));
assert.ok(hasBareSol, '?bare=true 必须同时透出裸模型名');

const statsRes = await fetch(`http://127.0.0.1:${pRate}/v1/stats`);
const statsJson = await statsRes.json();
assert.strictEqual(statsJson.summary.totalCredit, 1.25);
assert.strictEqual(statsJson.modelBreakdown[0].rate, 'x1.33');
assert.strictEqual(statsJson.modelBreakdown[0].credit, 1.25);
assert.strictEqual(statsJson.recentLogs.length, 1);

gwRate.stop();
schedRate.stopAutoRoutines();
fs.rmSync(tmpHome2, { recursive: true, force: true });
console.log('   ✓ 模型真实倍率解析、实测扣费记账、裸模型名透出与快过期优先调度全部通过');

// 19. 测试 Tool Call 深度容错（插队重排 / 对称孤儿清理 / 截断丢弃 / 历史裁剪 / Gateway Hint）
console.log('19. 测试 Tool Call 重排、对称孤儿清理、残缺参数过滤与 Gateway Hint...');
const interleavedMsgs = [
  {
    role: 'assistant',
    tool_calls: [
      { id: 'c1', type: 'function', function: { name: 'read', arguments: '{}' } },
      { id: 'c2', type: 'function', function: { name: 'ls', arguments: '{}' } }
    ]
  },
  { role: 'tool', tool_call_id: 'c1', content: 'ok1' },
  { role: 'user', content: 'image resize notice injected between tool outputs' },
  { role: 'tool', tool_call_id: 'c2', content: 'ok2' }
];
const repacked = repackToolResultBlocks(interleavedMsgs);
assert.strictEqual(repacked[1].role, 'tool');
assert.strictEqual(repacked[2].role, 'tool');
assert.strictEqual(repacked[3].role, 'user', '插队消息必须被挪到本组 parallel tool 结果之后');

const asymMsgs = [
  {
    role: 'assistant',
    tool_calls: [
      { id: 'c1', type: 'function', function: { name: 'a', arguments: '{}' } },
      { id: 'c2', type: 'function', function: { name: 'b', arguments: '{}' } }
    ]
  },
  { role: 'tool', tool_call_id: 'c1', content: 'ok' },
  { role: 'tool', tool_call_id: 'orphan-x', content: 'orphan' }
];
const symCleaned = cleanupOrphanToolMessages(asymMsgs);
assert.strictEqual(symCleaned.length, 2, '无调用方的孤儿 tool 必须删除');
assert.strictEqual(symCleaned[0].tool_calls.length, 1, '无结果配对的 assistant tool_call (c2) 也必须对称删除');
assert.strictEqual(symCleaned[0].tool_calls[0].id, 'c1');

const keptCalls = dropTruncatedToolCalls([
  { id: 'ok1', function: { name: 'ping', arguments: '' } },
  { id: 'ok2', function: { name: 'calc', arguments: '{"a":1}' } },
  { id: 'bad3', function: { name: 'edit', arguments: '{"path":"/tmp/' } }
]);
assert.strictEqual(keptCalls.length, 2, '空参工具与合法JSON应保留，半截残缺JSON工具调用必须丢弃');

const prunedRes = pruneOldestHistory({
  messages: [
    { role: 'system', content: 'sys' },
    { role: 'user', content: 'turn1' },
    { role: 'assistant', content: 'ans1' },
    { role: 'user', content: 'turn2' }
  ]
});
assert.ok(prunedRes.pruned && prunedRes.payload.messages.length === 2 && prunedRes.payload.messages[1].content === 'turn2');

const hintImg = getGatewayHint(ErrKind.BAD_PARAMS, '{"code":11133,"msg":"model_param_invalid"}', {
  model: 'deepseek-v4',
  hasImage: true,
  modelInCatalog: true,
  modelSupportsImages: false
});
assert.ok(hintImg.includes('does not support images'));
assert.ok(getGatewayHint(ErrKind.WAF_BLOCK, '').includes('WAF'));
console.log('   ✓ Tool Call 深度容错、上下文自动裁剪与 Gateway Hint 验证通过');

// 20. 测试 auto-free 多模型顺延故障转移、免费额度 Quota 墙钟锁定、WAF IP 止损与控制台 HTML 语法校验
console.log('20. 测试 auto-free 跨免费模型自动切换、Quota 锁定与 WAF IP 止损...');
const tmpHome3 = fs.mkdtempSync(path.join(os.tmpdir(), 'wb2a-parity-'));
const cfg3 = new ConfigStore({ freeModels: ['global:hy4free', 'cn:hy4free'], autoFreeEnabled: true }, { dshHome: tmpHome3 });
const store3 = new AccountStore({ dshHome: tmpHome3, skipDiscovery: true });
store3.upsert({ account: { uid: 'acc-gl', nickname: 'GL' }, auth: { realm: 'global', accessToken: 't1', refreshToken: 'r1' } });
store3.upsert({ account: { uid: 'acc-cn', nickname: 'CN' }, auth: { realm: 'cn', accessToken: 't2', refreshToken: 'r2' } });
const ledger3 = new UsageLedger({ dshHome: tmpHome3 });
const sched3 = new Scheduler(store3, { configStore: cfg3 });
let triedModels = [];
const mockFailoverClient = {
  async chatStream(account, reqBody) {
    triedModels.push(`${account.auth.realm}:${reqBody.model}`);
    if (reqBody.model.includes('hy4free') && account.auth.realm === 'global') {
      return { ok: false, status: 429, kind: ErrKind.SOFT_RATE, message: '{"code":6004,"msg":"rate limited"}' };
    }
    const enc = new TextEncoder();
    const sse =
      'data: {"id":"1","choices":[{"delta":{"content":"fallback-ok"}}],"usage":{"prompt_tokens":5,"completion_tokens":5,"quota":{"percent":100,"reset_at":"2099-01-01T00:00:00Z","shared_models":["hy3"]}}}\n\ndata: [DONE]\n\n';
    return {
      ok: true,
      status: 200,
      bodyStream: new ReadableStream({
        start(ctrl) {
          ctrl.enqueue(enc.encode(sse));
          ctrl.close();
        }
      })
    };
  },
  classifyError: () => ErrKind.NONE,
  async fetchModels() { return []; }
};
const gw3 = new LoopbackGateway(sched3, mockFailoverClient, ledger3, { configStore: cfg3, port: 0 });
const p3 = await gw3.start();
const foRes = await fetch(`http://127.0.0.1:${p3}/v1/chat/completions`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ model: 'auto-free', stream: false, messages: [{ role: 'user', content: 'hi' }] })
});
assert.strictEqual(foRes.status, 200);
const foJson = await foRes.json();
assert.strictEqual(foJson.choices[0].message.content, 'fallback-ok', 'global:hy4free 429 应自动回落下一个可用候选/域');
assert.ok(sched3.isCoolingDown('acc-cn', 'hy4free') || sched3.isCoolingDown('acc-cn', 'hy3'), 'usage.quota.percent>=100 后应对免费模型及 shared_models 墙钟锁定');

// 测试管理员 /admin/accounts/:uid/disable|enable|revive 及 /healthz + /status
const admDis = await fetch(`http://127.0.0.1:${p3}/admin/accounts/acc-gl/disable`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason: 'ops_maint' })
});
const admDisJson = await admDis.json();
assert.strictEqual(admDisJson.manual_disabled, true);
const hzRes = await fetch(`http://127.0.0.1:${p3}/healthz`);
assert.strictEqual(hzRes.status, 200);
assert.strictEqual(hzRes.headers.get('x-service'), 'dsh-workbuddy2api');
const stRes3 = await fetch(`http://127.0.0.1:${p3}/status`);
const stJson3 = await stRes3.json();
assert.strictEqual(stJson3.manual_disabled, 1);

// 验证控制台与门户页面渲染及内联 JS 语法零错误
const consoleHtml = renderConsoleHtml({ port: p3 });
const portalHtml = renderPortalHtml({ port: p3 });
const scriptMatch = consoleHtml.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(scriptMatch && portalHtml.includes('PORTAL'), 'Console 与 Portal HTML 应正常生成');
new vm.Script(scriptMatch[1]);

gw3.stop();
sched3.stopAutoRoutines();
fs.rmSync(tmpHome3, { recursive: true, force: true });
console.log('   ✓ auto-free 顺延故障转移、Quota 锁定、/healthz /status /admin 与控制台 JS 编译全部通过');

// 21. 测试 IP/CIDR 白名单、多租户用户配额/RPM 与 Webhook 多格式告警分发
console.log('21. 测试 IP/CIDR 白名单、多租户配额/RPM 与 Webhook 告警...');
const tmpHome4 = fs.mkdtempSync(path.join(os.tmpdir(), 'wb2a-sec-'));
const cfg4 = new ConfigStore({
  webPassword: 'secret-pass',
  alerts: { enabled: true, webhooks: ['https://open.feishu.cn/open-apis/bot/v2/hook/test'], events: ['ban', 'cooling'], minCredit: 50 }
}, { dshHome: tmpHome4 });
const wlParsed = parseWhitelistEntries(['192.168.10.0/24', '10.0.0.5']);
assert.strictEqual(wlParsed.normalized.length, 2);
const allowRes = checkIPWhitelist(
  { socket: { remoteAddress: '127.0.0.1' }, headers: { 'x-forwarded-for': '192.168.10.88' } },
  { enabled: true, allowedIPs: wlParsed.normalized, allowLocalhost: false }
);
assert.strictEqual(allowRes.allowed, true, '经可信代理透传的白名单网段 IP 应放行');
const denyRes = checkIPWhitelist(
  { socket: { remoteAddress: '8.8.8.8' }, headers: { 'x-forwarded-for': '192.168.10.88' } },
  { enabled: true, allowedIPs: wlParsed.normalized, allowLocalhost: false }
);
assert.strictEqual(denyRes.allowed, false, '公网直连伪造 X-Forwarded-For 不得绕过 IP 白名单');

const um4 = new UserManager({ configStore: cfg4, dshHome: tmpHome4 });
assert.strictEqual(um4.hasWebPassword(), true);
const authAdmin = um4.authenticate('admin', 'secret-pass', '127.0.0.1');
assert.ok(authAdmin.token && authAdmin.user.role === 'admin');
const tenant = um4.createUser({ username: 'alice', password: 'pw1234', role: 'user', dailyCreditLimit: 5, rpm: 2 });
assert.strictEqual(um4.verifyApiRequest(tenant.apiKey, '').ok, true);
assert.strictEqual(um4.verifyApiRequest(tenant.apiKey, '').ok, true);
const rpmBlocked = um4.verifyApiRequest(tenant.apiKey, '');
assert.strictEqual(rpmBlocked.status, 429, '超出 RPM 上限必须被拦截');
um4.deductUserCredit(tenant, 5);
const quotaBlocked = um4.verifyApiRequest(tenant.apiKey, '');
assert.strictEqual(quotaBlocked.status, 429, '超过日积分上限必须被拦截');

let hookPayloads = [];
const alertMgr4 = new AlertManager({
  configStore: cfg4,
  fetchFn: async (_u, opts) => {
    hookPayloads.push(JSON.parse(opts.body));
    return { ok: true, status: 200 };
  }
});
const alertRes = await alertMgr4.sendTestAlert();
assert.ok(alertRes.ok && hookPayloads[0].msg_type === 'text', '飞书 Webhook 格式必须正确编码');
fs.rmSync(tmpHome4, { recursive: true, force: true });
console.log('   ✓ IP/CIDR 白名单防伪造、多租户 RPM/日限额与 Webhook 告警测试通过');

// 22. 测试 Session Sticky 兜底/轮级 ID、model.json 种子表、Singleflight Refresh 与 Anthropic 扩展
console.log('22. 测试 Session 亲和派生、model.json 上限表、Token 单飞与 Anthropic count_tokens/流式错帧...');
const fb1 = stickyFallbackKey({ messages: [{ role: 'user', content: 'Build my app' }] });
const fb2 = stickyFallbackKey({ messages: [{ role: 'user', content: 'Build my app' }, { role: 'assistant', content: 'ok' }, { role: 'user', content: 'next' }] });
assert.ok(fb1.startsWith('fb:') && fb1 === fb2, '同一对话首条消息派生的 Sticky 兜底键必须保持一致');
assert.strictEqual(stickyFallbackKey({ metadata: { user_id: 'u-1' }, messages: [{ role: 'user', content: 'Build' }] }), '', '带 user_id 不得使用全局兜底键');

const tk1 = turnKey({ messages: [{ role: 'user', content: 'run tests' }] });
const tk2 = turnKey({ messages: [{ role: 'user', content: 'run tests' }, { role: 'assistant', content: null, tool_calls: [{ id: 'c1' }] }, { role: 'tool', tool_call_id: 'c1', content: 'ok' }] });
assert.strictEqual(tk1, tk2, '同一用户轮次内的 tool_call 续接必须保持相同 TurnKey');
assert.strictEqual(deriveTurnRequestId(fb1, tk1), deriveTurnRequestId(fb1, tk2), '同轮 X-Conversation-Request-ID 必须一致');
assert.match(uuidForKey(fb1), /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);

const tmpCatDir = fs.mkdtempSync(path.join(os.tmpdir(), 'wb2a-cat-'));
const enricher = new ModelCatalogEnricher({ dshHome: tmpCatDir });
assert.deepStrictEqual(enricher.lookupLimits('cn:deepseek-v4-pro'), { contextWindow: 1000000, maxTokens: 384000 });
assert.deepStrictEqual(enricher.lookupLimits('global:gpt-5.3-codex'), { contextWindow: 400000, maxTokens: 128000 });
assert.deepStrictEqual(enricher.lookupLimits('kimi-k2.6'), { contextWindow: 256000, maxTokens: 262144 });

// Singleflight refresh 测试
let refreshCalls = 0;
const origFetch = globalThis.fetch;
globalThis.fetch = async (url, opts) => {
  if (String(url).includes('/v2/plugin/auth/token/refresh')) {
    refreshCalls++;
    await new Promise((r) => setTimeout(r, 30));
    return {
      ok: true,
      status: 200,
      json: async () => ({ code: 0, data: { accessToken: 'new-acc-tok', refreshToken: 'new-ref-tok', expiresIn: 7200 } })
    };
  }
  return origFetch(url, opts);
};
try {
  const sfClient = new UpstreamClient();
  const sfAcc = { account: { uid: 'uid-sf-1', nickname: 'sf' }, auth: { realm: 'cn', accessToken: 'old', refreshToken: 'ref-1' } };
  await Promise.all([sfClient.refreshToken(sfAcc), sfClient.refreshToken(sfAcc), sfClient.refreshToken(sfAcc)]);
  assert.strictEqual(refreshCalls, 1, '同 UID 并发 refreshToken 必须单飞去重为 1 次上游调用');
  assert.strictEqual(sfAcc.auth.accessToken, 'new-acc-tok');
} finally {
  globalThis.fetch = origFetch;
}

// Anthropic mid-stream error 帧与 /v1/messages/count_tokens
let sseBuf = '';
let sseEnded = false;
const mockRes2 = {
  headersSent: false,
  writableEnded: false,
  writeHead: () => { mockRes2.headersSent = true; },
  write: (s) => { sseBuf += s; },
  end: () => { sseEnded = true; mockRes2.writableEnded = true; }
};
const antEmitter = createAnthropicStreamEmitter(mockRes2, 'claude-sonnet-4-6');
antEmitter.pushOpenAIEvent({ choices: [{ delta: { content: 'hi' } }] });
antEmitter.pushOpenAIEvent({ error: { message: 'quota hit', type: 'rate_limit_error', gateway_hint: 'all cooling' } });
assert.ok(sseEnded && sseBuf.includes('event: error') && sseBuf.includes('gateway_hint'), 'Anthropic 流中遇到上游 error 帧必须输出 event: error 并关闭流');

const tmpHome5 = fs.mkdtempSync(path.join(os.tmpdir(), 'wb2a-w2-'));
const cfg5 = new ConfigStore({}, { dshHome: tmpHome5 });
const store5 = new AccountStore({ dshHome: tmpHome5, skipDiscovery: true });
store5.upsert({ account: { uid: 'u-w2-1', nickname: 'w2' }, auth: { realm: 'cn', accessToken: 't', refreshToken: 'r', expiresAt: Date.now() + 999999 } });
const sched5 = new Scheduler(store5, { configStore: cfg5, dshHome: tmpHome5 });
const gw5 = new LoopbackGateway({ preferredPort: 0, scheduler: sched5, client: new UpstreamClient(), ledger: new UsageLedger({ filePath: path.join(tmpHome5, 'l.json') }), configStore: cfg5 });
const p5 = await gw5.start();
const ctRes = await fetch(`http://127.0.0.1:${p5}/v1/messages/count_tokens`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'claude-sonnet-4-6',
    system: 'You are concise.',
    messages: [{ role: 'user', content: 'Hello world 中文测试' }]
  })
});
const ctJson = await ctRes.json();
assert.ok(ctRes.ok && typeof ctJson.input_tokens === 'number' && ctJson.input_tokens > 5, '/v1/messages/count_tokens 必须返回正整数估算 Token 数');
gw5.stop();
fs.rmSync(tmpCatDir, { recursive: true, force: true });
console.log('   ✓ Session 亲和、model.json 上限表、Token 单飞与 Anthropic count_tokens/错帧测试通过');

// 23. 测试状态持久化 (.workbuddy2api-state.json)、NoteFailures 5次阈值、积分自动复活与 auths 热重载
console.log('23. 测试状态持久化、NoteFailures 瞬态保护、积分恢复与 auths 目录热重载...');
const tmpAuthWatch = path.join(tmpHome5, 'workbuddy2api-auths');
fs.mkdirSync(tmpAuthWatch, { recursive: true });
for (let i = 1; i <= 4; i++) {
  sched5.recordFailure(store5.get('u-w2-1'), ErrKind.CLIENT, `net err ${i}`);
  assert.strictEqual(sched5.isCoolingDown('u-w2-1'), false, '前 4 次瞬态异常不得立刻触发账号冷却');
}
sched5.recordFailure(store5.get('u-w2-1'), ErrKind.CLIENT, 'net err 5');
assert.strictEqual(sched5.isCoolingDown('u-w2-1'), true, '第 5 次瞬态异常应触发 300s 临时降级');

store5.upsert({ account: { uid: 'u-w2-2', nickname: 'credit-acct' }, auth: { realm: 'cn', accessToken: 't2', refreshToken: 'r2', expiresAt: Date.now() + 999999 } });
sched5.recordFailure(store5.get('u-w2-2'), ErrKind.HARD_CREDIT, 'no credit');
assert.strictEqual(sched5.isCoolingDown('u-w2-2'), true);
assert.strictEqual(sched5.reenableIfCredits('u-w2-2', 50), true, '检测到有效余额 > 0 应自动解除 HARD_CREDIT 冷却');
assert.strictEqual(sched5.isCoolingDown('u-w2-2'), false);

// 持久化状态保存与恢复验证
sched5.cooldownFreeQuotaModel('u-w2-1', Date.now() + 3600000, 'glm-4.6', 'quota exhausted');
sched5.flushState();
const sched5Reloaded = new Scheduler(store5, { configStore: cfg5, dshHome: tmpHome5 });
assert.strictEqual(sched5Reloaded.isCoolingDown('u-w2-1', 'glm-4.6'), true, '重启后新建 Scheduler 应从 .workbuddy2api-state.json 恢复未过期模型冷却');

// manualDisabled 不影响福利/签到/任务名单
store5.setManualDisabled('u-w2-2', true, 'ops-pause');
assert.strictEqual(store5.isAccountUnavailable(store5.get('u-w2-2')), true);
assert.strictEqual(store5.getAll().filter((a) => !a.disabled).length, 2, 'manualDisabled 账号不得设置 disabled=true，仍保留福利/保活资格');

// auths 目录热重载验证
fs.writeFileSync(
  path.join(tmpAuthWatch, 'cn-hotdrop.json'),
  JSON.stringify({ uid: 'u-hot-99', nickname: 'HotDrop', realm: 'cn', accessToken: 'tok-hot-1', refreshToken: 'ref-hot-1' }),
  'utf8'
);
const hotRes = store5.scanAuthDirsOnce();
assert.ok(hotRes.changed && hotRes.added === 1 && store5.get('u-hot-99')?.auth?.accessToken === 'tok-hot-1', 'auths 热扫描应自动导入新落盘凭证');
// 更新已有文件 token 且不覆盖 manualDisabled
store5.setManualDisabled('u-hot-99', true, 'keep-manual');
await new Promise((r) => setTimeout(r, 20));
fs.writeFileSync(
  path.join(tmpAuthWatch, 'cn-hotdrop.json'),
  JSON.stringify({ uid: 'u-hot-99', nickname: 'HotDrop', realm: 'cn', accessToken: 'tok-hot-2', refreshToken: 'ref-hot-2' }),
  'utf8'
);
const hotUpd = store5.scanAuthDirsOnce();
assert.ok(hotUpd.updated === 1 && store5.get('u-hot-99').auth.accessToken === 'tok-hot-2' && store5.get('u-hot-99').manualDisabled === true, '热重载更新 Token 时必须保留原有 manualDisabled 状态');
sched5.stopAutoRoutines();
sched5Reloaded.stopAutoRoutines();
console.log('   ✓ 运行态持久化、NoteFailures 5次阈值、积分自动解冻与 auths 热重载测试通过');

// 24. 测试开学季活动引擎、扩展成长任务映射、CST夜猫窗口、/school/status 路由与 Console JS 编译
console.log('24. 测试开学季活动/转盘引擎、扩展成长任务映射与 Console JS 语法...');
assert.strictEqual(isCSTNightWindow(new Date('2026-04-12T17:00:00Z')), true, 'UTC 17:00 = CST 01:00 应命中夜猫窗口');
assert.strictEqual(isCSTNightWindow(new Date('2026-04-12T04:00:00Z')), false, 'UTC 04:00 = CST 12:00 不得命中夜猫窗口');
for (const k of ['first_buddy', 'skill_share', 'Sequential_Tasks_1', 'school_season']) {
  assert.ok(TASK_MAPPING[k], `TASK_MAPPING 必须包含 ${k}`);
}

let drawSeq = 0;
const mockSchoolFetch = async (url) => {
  const u = String(url);
  if (u.endsWith('/school/tasks')) {
    return {
      ok: true,
      status: 200,
      json: async () => ({
        code: 0,
        data: {
          in_period: true,
          tasks: [
            { task_code: 'share_invite', status: 'pending' },
            { task_code: 'chat_3_times', status: 'in_progress', target_count: 2, progress: 1 }
          ]
        }
      })
    };
  }
  if (u.endsWith('/school/config')) {
    return { ok: true, status: 200, json: async () => ({ code: 0, data: { chance: { balance: 2 } } }) };
  }
  if (u.endsWith('/wheel/draw')) {
    drawSeq++;
    if (drawSeq === 1) {
      return { ok: true, status: 200, json: async () => ({ code: 0, data: { prize_code: 'school_credit_66', credit_amount: 66, chance_balance: 1 } }) };
    }
    return { ok: true, status: 200, json: async () => ({ code: 40900, message: 'no chances' }) };
  }
  return { ok: true, status: 200, json: async () => ({ code: 0, data: {} }) };
};
const skippedSchool = await fetchSchoolStatus({ account: { uid: 'u-gl-1' }, auth: { realm: 'global', accessToken: 't' } });
assert.strictEqual(skippedSchool.skipped, true, '国际版账号应自动跳过开学季活动');

const schoolRes = await runSchoolActivity(
  { account: { uid: 'u-sch-1', nickname: 'stu' }, auth: { realm: 'cn', accessToken: 'tok-s' } },
  { fetchFn: mockSchoolFetch }
);
assert.strictEqual(schoolRes.ok, true);
assert.strictEqual(schoolRes.creditGained, 66);
assert.strictEqual(schoolRes.prizes.length, 1);

// 注册包含 /school/* 与扩展交互路由的 web-routes 与 Console HTML 语法检查
const reg6 = registerWebRoutes({}, { scheduler: sched5Reloaded, client: new UpstreamClient(), ledger: new UsageLedger({ filePath: path.join(tmpHome5, 'l2.json') }), loopback: gw5, configStore: cfg5 });
for (const p of ['/plugins/dsh-workbuddy2api/school/status', '/plugins/dsh-workbuddy2api/school/run', '/plugins/dsh-workbuddy2api/travel/adopt', '/plugins/dsh-workbuddy2api/travel/run', '/plugins/dsh-workbuddy2api/growth/redeem', '/plugins/dsh-workbuddy2api/growth/makeup', '/plugins/dsh-workbuddy2api/growth/gift', '/plugins/dsh-workbuddy2api/tasks/nightcat']) {
  assert.ok(reg6.routes.some((r) => r.path === p), `应注册扩展控制台路由: ${p}`);
}
const htmlW2 = renderConsoleHtml({ port: p5 });
assert.ok(
  htmlW2.includes('schSchool') &&
  htmlW2.includes('addTokenModal') &&
  htmlW2.includes('aliasesVisualList') &&
  htmlW2.includes('streakVisualBox') &&
  htmlW2.includes('schoolVisualBox') &&
  !htmlW2.includes('id="welfareLog"') &&
  !htmlW2.includes('id="schoolLog"'),
  'Console HTML 应采用结构化可视面板而非裸 JSON 输出框'
);
const sm2 = htmlW2.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(sm2 && sm2[1], 'Console HTML 必须包含完整脚本');
new vm.Script(sm2[1]);

fs.rmSync(tmpHome5, { recursive: true, force: true });
console.log('   ✓ 开学季活动/抽奖、夜猫窗口、4项扩展成长任务与 Console JS 语法测试通过');

// 25. 测试 WorkBuddy / VS Code .vsix OPC 包结构、内置网关拉起、Webview 通信桥与侧边栏脚本
console.log('25. 测试 WorkBuddy / VS Code .vsix 安装包、内置网关自动拉起与 Webview 通信桥...');
const vsixPath = path.resolve('vscode-extension/workbuddy2api-gateway-1.3.0.vsix');
assert.ok(fs.existsSync(vsixPath), '必须先生成 .vsix 扩展安装包');
const vsixEntries = parseZipEntries(fs.readFileSync(vsixPath));
const entryMap = new Map(vsixEntries.map((e) => [e.name, e.content]));
for (const reqFile of ['[Content_Types].xml', 'extension.vsixmanifest', 'extension/package.json', 'extension/media/icon.png', 'extension/media/sidebar.svg', 'extension/dist/extension.js']) {
  assert.ok(entryMap.has(reqFile), `.vsix 必须包含 OPC 文件: ${reqFile}`);
}
assert.ok(entryMap.get('[Content_Types].xml').toString('utf8').includes('Extension="vsixmanifest"'), '[Content_Types].xml 格式必须合法');
assert.ok(entryMap.get('extension.vsixmanifest').toString('utf8').includes('Microsoft.VisualStudio.Code'), 'extension.vsixmanifest 必须声明 VS Code/WorkBuddy 目标');
const pngMagic = entryMap.get('extension/media/icon.png').subarray(0, 4);
assert.deepStrictEqual([...pngMagic], [137, 80, 78, 71], 'icon.png 必须是合法 PNG 文件');

const tmpHome6 = fs.mkdtempSync(path.join(os.tmpdir(), 'wb2a-vsix-'));
const reqFn = createRequire(import.meta.url);
let registeredViewProvider = null;
let openedPanelHtml = '';
let panelMsgHandler = null;
const registeredCmds = {};
const postedFromPanel = [];
const mockVscode = {
  ViewColumn: { One: 1 },
  StatusBarAlignment: { Right: 2 },
  MarkdownString: class {
    constructor(val = '') { this.value = val; this.isTrusted = false; this.supportHtml = false; }
    appendMarkdown(s) { this.value += s; return this; }
  },
  Uri: { parse: (s) => ({ toString: () => s }), file: (s) => ({ fsPath: s }) },
  workspace: {
    getConfiguration: () => ({
      get: (k, d) => (k === 'port' ? 0 : k === 'dshHome' ? tmpHome6 : d)
    })
  },
  env: { openExternal: () => {}, clipboard: { writeText: async () => {} } },
  window: {
    createOutputChannel: () => ({ appendLine: () => {}, dispose: () => {} }),
    createStatusBarItem: () => ({ show: () => {}, dispose: () => {}, text: '', tooltip: '', command: '' }),
    registerWebviewViewProvider: (_id, prov) => { registeredViewProvider = prov; return { dispose: () => {} }; },
    createWebviewPanel: (_id, _t) => ({
      reveal: () => {},
      onDidDispose: () => {},
      webview: {
        get html() { return openedPanelHtml; },
        set html(v) { openedPanelHtml = v; },
        onDidReceiveMessage: (fn) => { panelMsgHandler = fn; return { dispose: () => {} }; },
        postMessage: (m) => { postedFromPanel.push(m); }
      }
    }),
    showInformationMessage: async () => {},
    showWarningMessage: async () => '确定',
    showInputBox: async () => '100',
    showErrorMessage: async (m) => { throw new Error('Unexpected extension error: ' + m); }
  },
  commands: {
    registerCommand: (id, fn) => { registeredCmds[id] = fn; return { dispose: () => {} }; },
    executeCommand: (id, ...args) => registeredCmds[id]?.(...args)
  }
};
const extCode = entryMap.get('extension/dist/extension.js').toString('utf8');
const extMod = { exports: {} };
const extRunner = new vm.Script(`(function(require, module, exports){ ${extCode} })`).runInThisContext();
extRunner((id) => (id === 'vscode' ? mockVscode : reqFn(id)), extMod, extMod.exports);
const mockExtCtx = { subscriptions: [] };
try {
  await extMod.exports.activate(mockExtCtx);
  assert.ok(registeredViewProvider && registeredCmds['workbuddy2api.openConsole'], '扩展激活后必须注册侧边栏 View 与全部命令');

  // 验证侧边栏 Webview HTML 及脚本语法
  let sidebarHtml = '';
  registeredViewProvider.resolveWebviewView({
    webview: { options: {}, onDidReceiveMessage: () => ({ dispose: () => {} }), postMessage: () => {}, set html(v) { sidebarHtml = v; }, get html() { return sidebarHtml; } },
    onDidDispose: () => {}
  });
  assert.ok(sidebarHtml.includes('WorkBuddy 2API') && sidebarHtml.includes('acquireVsCodeApi'), '侧边栏 HTML 必须包含 Webview 通信桥');
  for (const sm of sidebarHtml.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
    new vm.Script(sm[1]);
  }

  // 验证全功能控制台面板 HTML 及通过 Webview 通信桥调用 /public/status API
  await registeredCmds['workbuddy2api.openConsole']();
  assert.ok(openedPanelHtml.includes('__WB2A_API_ORIGIN__') && openedPanelHtml.includes('aliasesVisualList'), '全功能控制台 Webview 应完整渲染并注入通信桥');
  for (const sm of openedPanelHtml.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
    new vm.Script(sm[1]);
  }
  assert.ok(typeof panelMsgHandler === 'function');
  await panelMsgHandler({ type: 'wb2a:fetch', reqId: 't-1', path: '/plugins/dsh-workbuddy2api/public/status', method: 'GET', headers: {} });
  for (let i = 0; i < 30; i++) {
    if (postedFromPanel.some((m) => m.type === 'wb2a:fetch-end' && m.reqId === 't-1')) break;
    await new Promise((r) => setTimeout(r, 20));
  }
  const startMsg = postedFromPanel.find((m) => m.type === 'wb2a:fetch-start' && m.reqId === 't-1');
  const bodyChunks = postedFromPanel.filter((m) => m.type === 'wb2a:fetch-chunk' && m.reqId === 't-1').map((m) => Buffer.from(m.b64, 'base64'));
  const parsedPub = JSON.parse(Buffer.concat(bodyChunks).toString('utf8'));
  assert.ok(startMsg && startMsg.status === 200 && parsedPub.ok === true, 'Webview 通信桥应成功代理 /public/status HTTP 请求并返回合法 JSON');
} finally {
  extMod.exports.deactivate();
  fs.rmSync(tmpHome6, { recursive: true, force: true });
}
console.log('   ✓ WorkBuddy / VS Code .vsix OPC 打包、扩展激活、侧边栏与控制台 Webview 通信桥全部通过');

console.log('\n🎉 所有 25 项自动化全功能验证测试全部通过！');

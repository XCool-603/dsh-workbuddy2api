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
import { ErrKind } from '../src/constants.js';
import { normalizeReasoningEffort } from '../src/upstream/efforts.js';
import { isVideoModel } from '../src/upstream/video.js';
import { createWorkBuddyAdapter } from '../src/adapter/pi-ai-adapter.js';
import { runTravelForAccount, getBuddyInfo, getTravelStatus } from '../src/upstream/travel.js';
import { getYesterdayDateCST, reportActiveChat, getStreak } from '../src/upstream/growth.js';
import { prepareOutboundPayload } from '../src/upstream/payload.js';

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

console.log('\n🎉 所有 17 项自动化全功能验证测试全部通过！');

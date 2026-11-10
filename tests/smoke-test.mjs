/**
 * smoke-test.mjs - WorkBuddy 2API 全功能自动化验证套件
 */

import assert from 'node:assert';
import { AccountStore } from '../src/pool/account-store.js';
import { Scheduler } from '../src/pool/scheduler.js';
import { UpstreamClient } from '../src/upstream/client.js';
import { UsageLedger } from '../src/pool/ledger.js';
import { LoopbackGateway } from '../src/server/loopback.js';
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
console.log('\n🎉 所有自动化冒烟测试全部通过！');

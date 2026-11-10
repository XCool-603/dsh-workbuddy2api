# DSH WorkBuddy2API Connect & Gateway

**DSH Plugin Version of WorkBuddy 2API** — A high-availability model gateway and multi-account scheduler built natively for **DeepSeek Harness (DSH)**.

It carries over 100% of the capabilities from `workbuddy2api` while providing native Cordis integration, interactive DSH Web/Desktop UI, and a standard OpenAI-compatible local API endpoint.

---

## 🌟 Key Features

- **Dual-Realm Balancing (CN & Global)**: Seamless integration with both Tencent Cloud CodeBuddy (`copilot.tencent.com`) and WorkBuddy AI (`workbuddy.ai`).
- **Multi-Account Pooling & High Availability**: Dynamic round-robin, 3-factor weighted scheduler, concurrency slot leasing, and automatic failover across accounts on rate limits or errors.
- **Circuit Breaker**: Automatic backoff and cooling on 429/6004 soft rate limits, credit exhaustion, or temporary upstream glitches.
- **Full Model Matrix**: Covers all CN models, Global models, the `auto-free` smart route pool, and Kling 3.0 / MiniMax-H3 video models.
- **Reasoning Effort Defense**: Strictly normalizes reasoning efforts (`low`, `medium`, `high`, `xhigh`, `max`) without passing invalid parameters like `off` (preventing 11150 errors).
- **Multi-Modal Vision**: Automatic conversion of remote image URLs into Base64 Data URLs, plus document text extraction.
- **Automatic Daily Check-in & Welfare**: Scheduled auto check-in and welfare claims for both Chinese and Global accounts.
- **Cat Travel & Buddy Adoption (🐱 猫猫旅行与领养管家)**: 
  - 自动领养第一只小猫（首领送 +300 积分）
  - 自动巡检猫猫旅行状态（空闲 / 旅行中 / 已到站可领奖）
  - 到站自动领奖并秒发派出前往地点 4（古镇客栈）
- **Full Growth & Welfare System (🌟 全套成长活动与连登福利)**:
  - 对话活跃上报（5 连发点亮连登热力图与领养门槛）
  - 新手礼包与活动补偿一键领取
  - 连登里程碑兑换（7天/14天/28天各档位自动领奖）
  - 连登抽奖（全自动消耗已有抽奖机会抽积分与实物）
  - 补签卡检查（昨日断档自动消耗补签卡保住连登天数）
  - **成长任务全自动收割引擎（18+ 项官方成长任务一键点亮+领奖）**：模板使用(5次)、专家召唤(5次)、专家团队(3次)、腾讯轻量云、创建画布、桌面端对话、发现应用(企鹅教师助手)、资料库体验、热门技能体验、自动化任务设置等，全自动伪造指纹事件上报点亮并收割入账 +1750+ 积分！
- **Native DSH Plugin + Local OpenAI Gateway**: Native Cordis plugin offering interactive settings cards, dedicated "🐱 猫猫旅行与活动福利" 交互控制台、composer credit dock, and sidebar panels, alongside a local HTTP endpoint on `http://127.0.0.1:7863/v1`.
- **Built-in CLI**: Comprehensive subcommands (`status`, `models`, `usage`, `checkin`, `travel`, `welfare`, `tasks`, `accounts`, `doctor`).

---

## 🚀 Quick Start

Build the client UI and host engine:
```sh
node build.mjs
```

Run test suite:
```sh
npm test
```

CLI Usage:
```sh
node bin/dsh-workbuddy2api.js status
node bin/dsh-workbuddy2api.js models
node bin/dsh-workbuddy2api.js checkin
node bin/dsh-workbuddy2api.js travel status
node bin/dsh-workbuddy2api.js travel depart
node bin/dsh-workbuddy2api.js welfare claim
node bin/dsh-workbuddy2api.js welfare streak
node bin/dsh-workbuddy2api.js welfare draw
```

External OpenAI-compatible tools (Cursor, Cherry Studio, NextChat):
- **Base URL**: `http://127.0.0.1:7863/v1`
- **API Key**: Any string (e.g. `sk-wb2a-internal`)

## License

MIT License

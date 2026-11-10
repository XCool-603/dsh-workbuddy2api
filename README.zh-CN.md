# DSH WorkBuddy2API Connect & Gateway

**DSH 插件版 WorkBuddy 2API** —— 专为 DeepSeek Harness (DSH) 打造的现代化高可用大模型网关与调度中枢。

全面继承并强化原版 `workbuddy2api` 的全部特性，原生内嵌于 DSH 插件体系中，同时对外提供标准 OpenAI 兼容接口。

---

## 🌟 核心特性全览

### 1. 🌐 双域容灾融合调度 (CN & Global)
- **国内版 (copilot.tencent.com)**：原生适配 CodeBuddy SaaS 接口、企业端点与腾讯云认证体系；
- **国际版 (workbuddy.ai)**：无缝支持 WorkBuddy AI 国际站（Google、Twitter/X、GitHub 登录态）；
- **同邮箱多渠道隔离**：同一邮箱不同登录渠道（如 Google 与 Twitter/X）自动分配独立槽位与文件隔离，向上游透传纯净 `X-User-Id`，绝不相互覆盖。

### 2. ⚡ 多账号池轮转与无感容灾自愈 (Multi-Account Pooling)
- **自动同步与发现**：自动发现并同步宿主机 `workbuddy2api/auths/*.json`、CodeBuddy CLI 登录态及 App 凭证；
- **三因子加权随机调度**：综合积分余量、空闲时长与即将过期状态动态加权选号；
- **并发槽位硬约束**：严格管理单账号在途请求上限（国内版默认 3，国际版默认 2），拒绝并发打崩；
- **智能熔断冷却**：命中 429 / 6004 软限流时自动进入指数退避（30s~10m）；命中 402 余额不足进入 30 分钟长冷却；命中 11140 自动隔离；
- **跨账号与跨域无感轮换 (Auto-Failover)**：当某个账号在途满或遭遇限流时，请求自动切换至下一个健康账号，客户端零等待。

### 3. 🎯 全模型矩阵与智能路由 (Smart Model Routing)
- **涵盖全部官方模型**：
  - **国内版**：`deepseek-v4-flash`, `deepseek-v4.1-flash`, `deepseek-v4-pro`, `glm-5.3`, `glm-5.3-flash`, `glm-5.2`, `glm-5.1`, `kimi-k3-1`, `kimi-k2.7`, `minimax-m3`, `hy3`, `hy4free` (限时免费) 等；
  - **国际版**：`deepseek-v4.1-flash`, `glm-5.3-flash`, `gpt-6-astra`, `gpt-5.6-sol`, `gpt-5.6-terra`, `gemini-3.5-flash`, `primary-model`, `fast-model`, `balanced-model` 等；
- **智能免费模型路由池 (`auto-free`)**：无需关心具体模型名，自动在所有可用免费/低消耗模型间智能分流；
- **自定义模型别名映射 (Model Alias Engine)**：原生兼容 `deepseek-chat`、`gpt-4o`、`claude-3-5-sonnet` 等常见客户端名称；
- **思考强度严格防御 (Reasoning Effort Normalization)**：严格校验并纠偏模型推理档位（`low`, `medium`, `high`, `xhigh`, `max`），彻底根除因下发 `off` 引发的 `11150 invalid parameter` 报错；
- **专属视频大模型直出 (Kling 3.0 & MiniMax-H3)**：支持快手可灵 3.0 (`kling-video-v3`) 与海螺 H3 (`minimax-video-h3`) 文生视频/图生视频，在对话流中直接渲染视频播放链接与 Markdown。

### 4. 👁️ 全模态视觉与多格式文档解析
- **视觉格式兼容**：全支持 OpenAI `image_url` 与 Claude `type: image` (Base64)；
- **远端图片自动内联**：自动将网络图片抓取并转化为 Base64 Data URL，彻底根除上游只认 Base64 导致的 11133 报错；
- **多格式代码与文档清洗**：直接支持向模型发送 `.txt`、`.md`、`.pdf`、`.py`、`.json` 等文件，自动清洗提取为上下文。

### 5. 🎁 每日自动签到与福利领航
- **自动每日签到**：插件启动与后台定时自动对活跃账号执行签到领取积分；
- **一键福利领取**：支持国际版试用加油包与国内版成长活动奖励一键领取。

### 6. 📊 本机用量账本与 7 天走势
- **独立用量账本**：持久化存储于 `$DSH_HOME/.workbuddy2api-usage.json`（保留 60 天）；
- **可视化大盘**：统计今日请求数、输入/输出 Token、24 小时逐小时分布及近 7 天缓存命中率走势。

### 7. 🔌 双模接入架构：DSH 原生插件 + 本地 OpenAI 网关
- **DSH 原生 LLM 适配器**：注册 `workbuddy` 与 `workbuddy2api` 提供方，在 DSH 模型选择器中直接可选；
- **DSH 交互卡片与侧边栏**：提供全功能设置中心、对话输入框下方常驻积分条与侧边抽屉面板；
- **本地 OpenAI 兼容网关**：内置轻量级 HTTP 服务（默认端口 `:7863`），提供标准 `/v1/chat/completions` 与 `/v1/models`，外部工具（Cursor、Cherry Studio、Dify、NextChat）可直接对接使用！

---

## 📦 快速安装与配置

### 1. 作为 DSH 插件载入

#### 方式 A：本地软链接开发模式（推荐）
在 DSH 用户插件目录创建符号链接：
```powershell
# Windows PowerShell 管理员运行
New-Item -ItemType SymbolicLink -Path "$env:USERPROFILE\.dsh\plugins\dsh-workbuddy2api" -Target "C:\Work\workbody\dsh-workbuddy2api"
```

在你的 DSH Profile（如 `~/.dsh/profiles/desktop/package.json`）中添加依赖声明：
```json
{
  "dependencies": {
    "dsh-workbuddy2api": "link:C:/Users/23504/.dsh/plugins/dsh-workbuddy2api"
  },
  "dsh": {
    "profile": {
      "bundles": [
        "dsh-workbuddy2api"
      ]
    }
  }
}
```

在 `cordis.patch.yml` 中自动注入：
```yaml
- insert:
    - id: llm-workbuddy2api
      name: dsh-workbuddy2api
```

#### 方式 B：CLI 命令行安装
```sh
dsh plugin --profile desktop add C:/Work/workbody/dsh-workbuddy2api
dsh --profile desktop
```

---

## 🛠️ CLI 命令行工具

通过 DSH CLI 执行管理与诊断：

```sh
# 查看当前账号池状态与余额
dsh plugin --profile desktop exec dsh-workbuddy2api status

# 机器可读 JSON 输出
dsh plugin --profile desktop exec dsh-workbuddy2api status --json

# 向上游发现真实可用模型清单
dsh plugin --profile desktop exec dsh-workbuddy2api models

# 查看今日与近 7 天用量及缓存走势
dsh plugin --profile desktop exec dsh-workbuddy2api usage

# 为当前账号手动执行签到
dsh plugin --profile desktop exec dsh-workbuddy2api checkin

# 列出所有账号与激活状态
dsh plugin --profile desktop exec dsh-workbuddy2api accounts

# 环境诊断
dsh plugin --profile desktop exec dsh-workbuddy2api doctor
```

---

## 🌐 外部第三方客户端接入

本插件启动后在后台持续运行本地 OpenAI 兼容网关：
- **Base URL**: `http://127.0.0.1:7863/v1`
- **API Key**: 任意填写（如 `sk-wb2a-internal`）
- **支持端点**: `/v1/chat/completions`, `/v1/models`

在 Cursor、Cherry Studio、Dify 或 NextChat 中填入以上 Base URL，即可享受与 DSH 完全一致的多账号池负载均衡与自愈调度能力！

---

## 📄 许可证

MIT License

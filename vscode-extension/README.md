# WorkBuddy 2API Gateway & Pool Console (WorkBuddy / VS Code 扩展)

直接在 **WorkBuddy IDE**、**CodeBuddy IDE**、**VS Code** 或兼容编辑器中安装使用的 `.vsix` 扩展版本：

- **自动启动 / 智能接管本地网关**：打开编辑器即自动探测本机 `:7863` 端口；若尚无网关则内置拉起完整多协议服务，若 DSH 或另一窗口已在运行则自动共享复用，互不冲突。
- **侧边栏快捷概览面板**：点击左侧活动栏 ⚡ **WorkBuddy 2API** 图标，即可查看全池 CN/Global 实时积分、切换优先账号、发起 OAuth 扫码登录、粘贴 Token 入池、一键执行每日签到 / 吃满福利 / 猫猫巡检 / 开学季抽奖，或复制 OpenAI / Claude Code 接入配置。
- **编辑器全功能白蓝控制台**：支持一键在编辑器标签页打开完整 7 标签页白蓝控制台（账号池、实时倍率目录与可视化别名、多模态 Playground 实时流水、用量统计图表、猫猫连登与邀请中心、成长任务 & 开学季活动、多租户安全设置）。
- **与 DSH 共用同一账号池**：默认共用 `~/.dsh/.workbuddy2api-accounts.json` 与用量配置，双端数据无缝同步。

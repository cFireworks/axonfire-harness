# axonfire-harness

基于本机 WorkBuddy 5.3.14 样本、逐模块恢复的 Agent Harness。保留 OpenAI Agents SDK 依赖，并提供开箱即用的本地 CLI 与 Web 工作台。

> 这是进行中的代码还原项目，不是官方 WorkBuddy，也不宣称已 100% 还原全部产品逻辑。Web UI 是新增的独立宿主，不是原版界面。已还原部分、证据和剩余边界见 [还原状态](docs/recovery-status.md)。

## 快速开始

需要 Node.js **22.19+** 和 npm。无需安装原版应用。

```sh
git clone https://github.com/cFireworks/axonfire-harness.git
cd axonfire-harness
npm ci
npm run build
npm run demo
```

打开 **http://127.0.0.1:3080**。离线演示无需密钥：经过真实 SDK 与还原 harness，但使用固定模型回复，不访问远端或执行工具。

使用自己的模型：

```sh
cp .env.example .env
# 编辑 .env，填写 OPENAI_API_KEY、OPENAI_BASE_URL、CODEBUDDY_MODEL
npm start
```

模型接口为 **OpenAI-compatible Chat Completions**，必须显式配置地址。不会读取已安装 WorkBuddy 的账户、令牌或聊天记录。密钥只在本地服务端使用，不发送给浏览器。不要把 `.env` 提交到仓库。

CLI 使用同一核心：

```sh
npm run cli -- --help
npm run cli -- --cwd /absolute/path/to/project
npm run cli -- -p "了解这个项目" --cwd /absolute/path/to/project
# 非交互模式只允许明确批准的工具，例如：
npm run cli -- -p "读取 README.md" --allow-tools Read --cwd /absolute/path/to/project
```

Web 工具调用逐次审批，支持流式回复、历史恢复、取消、上下文压缩和 Agent 问答。会话默认保存在工作目录的 `.axonfire/`；CLI 兼容原 standalone 宿主的 `.workbuddy-harness/`。这些目录均被 Git 忽略。

## 仓库结构

借鉴 [deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) 的应用 / 核心包 / 文档分层；不引入其插件框架、不替换已还原逻辑。

```text
apps/
  cli/                   axonfire 启动器：CLI / Web
  web/                   本地 HTTP + SSE 宿主、静态工作台、宿主测试
packages/
  harness/
    src/                 还原核心及明确标记的 standalone adapters
    config/              固定样本配置与原始 prompt
    test/                核心回归测试
    scripts/             配置校验 / 原样本 AST 与行为差分
docs/                    还原报告、历史批次、使用与架构边界
scripts/                 仓库级验证入口
```

没有把核心拆成大量空包；原模块之间的相对路径、配置读取和依赖版本保持稳定。SDK 版本固定为 `@openai/agents* 0.5.2`、`openai 6.25.0`，不重新实现 SDK。

## 验证

```sh
npm run check
npm test
npm run smoke:runtime
npm run smoke:launchers
npm run verify:config
# 可选：需要自行提供固定 SHA 的合法本地样本，不随仓库分发
npm run verify:recovery -- /absolute/path/to/codebuddy.js
```

最新验证：794 项核心测试、10 项 Web 宿主测试、716 项编译后 smoke、42 组原样本差分通过。原 ProductManager 默认驱动配置合并、动态 provider 与 Agent/命令刷新；现已接入原 CustomAgents/CustomCommands 文件发现、Models/CustomModels、模型解析/过滤及企业策略。支持 SDK 初始化覆盖、原 MCP prompt renderer，以及项目 `.codebuddy/agents/`、`commands/`、`models.json`（路径与缓存边界见使用说明）。完整权限服务和原审批控制器通过 `nativePermissions`、`nativeApprovals` 显式使用；`sdkControl` 或 `nativeMcp` 默认启用这两条 native 路径及原生 MCP 宿主。stdio / HTTP / SSE 使用显式配置，SDK MCP 通过 initialize 注册。CLI/Web 默认保留兼容审批宿主。配置中的 115 个原始 prompt 和固定哈希保持不变。详细边界见 [还原状态](docs/recovery-status.md)，安装与启动验证见 [使用说明](docs/getting-started.md)。

本地工作台演示：

![Axonfire 本地演示](docs/images/web-demo.png)

## 范围与安全

这是有本地文件 / Shell 能力的开发工具，**审批不是操作系统沙箱**。只在可信工作目录运行；不要审批不了解的命令。Web 固定监听 `127.0.0.1`，检查 Host、Origin 和 CSRF token，不提供公网部署、多用户认证或远程访问。不要直接通过反向代理暴露。

仓库不包含安装包、完整原始 bundle、个人凭据和运行记录。配置/还原片段来自分析样本；不能据此认定其全部拥有可重新授权的开源许可证。仅在你有权使用的范围内研究、验证和使用，保留依赖自身的许可证与通知。

锁定旧依赖当前仍有 **16 项 npm audit 告警**，尚未做可能改变还原行为的强制升级。原生 MCP 独立依赖按样本固定为 `@modelcontextprotocol/sdk 1.24.3`，不替换 OpenAI SDK 自身的传递依赖。

- [启动说明与故障排查](docs/getting-started.md)
- [核心还原详细说明（历史命令以新目录为准）](docs/reconstruction.md)
- [逐模块还原状态与未恢复边界](docs/recovery-status.md)
- [架构与宿主边界](docs/architecture.md)

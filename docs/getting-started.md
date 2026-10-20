# 启动与验证

从仓库根目录执行 `npm ci && npm run build`，然后 `npm run demo`（离线）或 `npm start`（读取自己配置的 `.env`）。编译产物位于 `packages/harness/dist`，不提交到 Git。

Web 的 `--cwd` 指定工具工作目录：`npm start -- --cwd /absolute/path/to/project`。端口可用 `--port 3081` 或 `AXONFIRE_PORT` 配置。状态目录可用 `AXONFIRE_STATE_DIR` 指定。修改模型配置后重启服务；API key 不通过页面输入或浏览器持久化。

默认模型配置沿用样本；接入兼容供应商时应显式指定自己的模型名。`.env.example` 的模型只是配置示例，不代表对供应商当前可用模型的保证。普通聊天只需兼容 Chat Completions 的供应商，产品特定 WebFetch/媒体/IDE/外部 channel 能力仍需要独立适配与配置，不能仅靠一个模型 API key 代替。

`npm run cli -- --help` 不需要密钥或网络。CLI `-p` 为非交互单轮，未明确授权的工具默认拒绝；交互模式逐次询问。Web 与 CLI 的默认状态目录分离，可以通过 CLI `--state-dir` 或 Web `AXONFIRE_STATE_DIR` 显式共用。

本机端口被占用时换端口。浏览器请使用打印的 `http://127.0.0.1:端口`，不能替换成 `localhost` 或代理域名；这是 Host 校验设计。页面显示未配置时检查 `.env` 位于仓库根目录且密钥、接口均非空。模型失败只显示安全的通用错误，避免把上游异常中的认证头传给页面。

核心测试与 Web 宿主测试不使用本机真实模型账户，差分验证则需要固定样本 SHA-256 `4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd`。不包含样本的普通 checkout 仍可安装、编译、离线演示和运行回归测试。

历史报告中的根级 `src/`、`config/`、`test/`、`scripts/verify-*.ts` 现位于 `packages/harness/`。原逐项 `verify:*` 命令加 `-w @axonfire/harness`；推荐直接使用根级 `npm run verify:recovery -- /absolute/path/to/codebuddy.js` 执行全套差分。

## 本批验收（2026-10-20）

仅克隆本项目到干净目录，不复制安装包、原 bundle 或现有 node_modules：`npm ci`、`npm run build`、`npm test`（619 核心 + 10 宿主）、`npm run verify:config` 全部通过。独立 `npm run smoke:launchers` 启动 CLI help，再启动临时端口 Web demo，通过真实 SDK / harness 获取流式完成事件并正常退出。编译后 smoke 541 项与显式样本输入的 34 组差分通过。依赖锁中的既有包版本无变化。

浏览器手动验收实际发送了一轮离线演示消息，确认增量文本、会话列表更新和完成后按钮状态恢复；截图位于 `docs/images/web-demo.png`。没有使用真实供应商密钥验证远端模型；没有据此声明所有供应商兼容或产品全部能力已恢复。CI 只是已加入仓库的定义，远端执行结果需以 GitHub Actions 实际记录为准。

权限服务后续批次已将门槛提升为652核心 + 10宿主、574编译smoke、36组差分。嵌入API的 `createHarness({ nativePermissions: true, ... })` 可启用已恢复的完整权限分类与SDK回调；它目前仍使用兼容审批控制器和独立宿主guard，不是原产品的全套审批/SettingsManager/Auto classifier。默认CLI/Web行为保持可用，不需要启用该开发者选项。

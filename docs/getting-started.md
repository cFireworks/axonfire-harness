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

审批控制器后续批次已将门槛提升为672核心 + 10宿主、594编译smoke、37组差分。嵌入API的 `createHarness({ nativePermissions: true, nativeApprovals: true, ... })` 可同时启用完整原权限分类/SDK缓存与完整原InterruptionService控制器。两项独立开关默认关闭，CLI/Web仍使用可用的兼容审批宿主；不需要为了启动启用开发者选项。

`approvalController` 可注入 `sdkPermissionClient.requestPermission(toolName, input, callId)`、`sdkHooksManager`、workflow resolver、mandatory target判断、trace和广播诊断依赖。会话 `options.inputFormat = "stream-json"` 且非ACP时走SDK客户端，不再同时询问本地UI；显式客户端返回allowed后会登记独立宿主guard授权，updatedInput按源码浅合并。未配置SDK客户端会进入源码的错误拒绝路径，不伪造同意。普通text路径仍通过 `approveTool` / `askUserQuestion` 交互，默认不自动允许。

以上不等于原产品的完整SDK启动程序、ACP服务、SettingsManager磁盘持久化或Auto classifier backend已恢复。特别是原控制器CLI拒绝会abort并记录skipRun结果，而非调用RunState.reject后继续执行；宿主等待该结果落盘后结束。模型和所有依赖版本未升级。

## SDK 控制协议（嵌入 API）

最新SDK协议批次门槛为693核心 + 10宿主、615编译smoke、38组差分。核心SDK控制与初始化的12个原类、四个SessionManager override方法、75处完整方法/函数AST与794组协议比较通过。

提供 `createHarness({ ...modelOptions, sdkControl: { stdout: controlOutput } })`，其中 `controlOutput` 是调用方拥有的Node Writable式对象（write/once/removeListener）。不会自动绑定process.stdin、读取安装应用的账户，或把新协议误当成现有CLI flags。建议使用独立控制通道，不与普通文本/日志混流；控制输出按源码为JSONL。`sdkControl` 默认启用 `nativePermissions` / `nativeApprovals`，新打开的会话走 `inputFormat: stream-json`。

将收到的控制对象传入 `harness.sdkControl.receive(message)`，或将已完成JSONL分帧的单行传入 `receiveLine(line)`。外层输入读取、普通user消息到prompt的投递、断线检测仍由嵌入方负责。断线时调用 `sdkControl.close()`，关闭整个harness时也会自动清理；不会关闭调用方拥有的输出stream。

例如权限请求的回复结构（request_id原样对应收到的perm_请求）：

```json
{"type":"control_response","response":{"subtype":"success","request_id":"perm_...","response":{"allowed":true,"updatedInput":{"content":"由调用方确认的内容"}}}}
```

`hook_`、`mcp_`、`elic_`响应也按原前缀分发；MCP成功payload为 `response.mcp_response`，Hook成功payload为原hook输出对象。权限请求默认无超时，Hook默认60秒；关闭可取消全部pending。`initialize`、`get_available_modes`、`get_available_models`、`set_permission_mode`、`set_model`已注册。独立宿主默认initialize返回account:null，不映射模型API key为产品账号。

`sdkControl.initializeDependencies` 可提供原ProductManager/env/MCP/账号等依赖。未提供ProductManager时systemPrompt/appendSystemPrompt/agents动态覆盖明确返回错误；环境切换和SDK MCP server注册同样需要真实adapter，不返回假成功。原类完整方法保留，但SDK stdin/headless启动程序、鉴权命令、ProductManager刷新、SDK MCP server及MCP Hook proxy还不能视为完成。显式SDK客户端allowed可授权独立guard；Hook allow与完整native政策到guard的统一仍是后续默认路径对齐边界。

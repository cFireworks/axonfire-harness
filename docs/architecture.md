# 架构与还原边界

`apps/cli/axonfire.mjs` 是统一入口：默认导入核心 CLI，`web` 子命令启动本地工作台。核心 CLI 保留 detached teammate 的内部入口，避免目录调整破坏子进程启动。

`apps/web/server.mjs` 使用 Node HTTP、fetch SSE 和静态 UI，不引入框架依赖。HTTP 请求只适配 `createHarness`、`openSession`、`prompt`、`compact` 和已有 SessionStore；不实现第二套 agent loop。工具审批和 AskUserQuestion 通过独立同源请求回复给正在运行的调用；连接断开、取消、超时均不会自动批准。

`packages/harness` 保留原来的模块组织，`src` 与 `config` 一起移动，因此源码和编译后的配置寻址仍有效。公开包入口导出 `createHarness` 和类型；SDK、模型配置、prompt、Session、Agent、工具、hook、workflow 等逻辑不由 Web 重写。独立宿主与原样本逐方法恢复部分在源文件和历史报告中区分。

Web 使用单运行槽以避免用户在同一进程对多个会话并发修改共享运行状态；不是多用户服务。固定 IPv4 loopback 地址，拒绝其它 Host / Origin，写接口需要随机 CSRF token，不返回 API key、不序列化上游异常。默认工具审批只能保护当前宿主边界，不等同于原产品完整 ToolPermissionService 或 OS 隔离。

结果分派默认使用完整原 `InterruptionService.waitFor`，与 SessionManager 的 stream/history/gate 消费者分开。默认/非默认 Agent、headless、错误收尾和 Stop 续跑由原方法驱动；主 prompt 不再补发 Stop。独立宿主仅增加历史刷盘与异步续跑发布 barrier。较早报告中将该剩余分派归为 SessionManager 的表述已在还原状态中纠正。

下一批还原重点是完整 handleInterruptions / SDK 权限请求拒绝分支及 MCP hook proxy。新增 Web UI 不计为这些原逻辑已经还原。之后继续 AutoMode backend、SettingsManager 持久化与 ProductManager / plugin refresh。

完整 ToolPermissionService、PermissionUtils、CommandUtils、八个策略和两个审批缓存入口现已恢复，通过 `createHarness({ nativePermissions: true, ... })` 显式连接真实 SDK；`harness.permissions` 提供完整核心对象。默认 UI 仍使用既有审批宿主，待原 InterruptionService 控制器整体替换后再统一默认路径。独立执行 guard 与原分类器有明确边界，Hook allow不会自动撤销该guard。宿主内存 settings adapter 和未配置的 Auto classifier 也不等于原产品持久化/模型服务。审批暂停应从相同RunState恢复，参考 [OpenAI Docs](https://developers.openai.com/api/docs/guides/agents/guardrails-approvals)；SDK0.5.2的实际回调次数以本地测试为准。

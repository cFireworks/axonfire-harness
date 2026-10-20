# 架构与还原边界

`apps/cli/axonfire.mjs` 是统一入口：默认导入核心 CLI，`web` 子命令启动本地工作台。核心 CLI 保留 detached teammate 的内部入口，避免目录调整破坏子进程启动。

`apps/web/server.mjs` 使用 Node HTTP、fetch SSE 和静态 UI，不引入框架依赖。HTTP 请求只适配 `createHarness`、`openSession`、`prompt`、`compact` 和已有 SessionStore；不实现第二套 agent loop。工具审批和 AskUserQuestion 通过独立同源请求回复给正在运行的调用；连接断开、取消、超时均不会自动批准。

`packages/harness` 保留原来的模块组织，`src` 与 `config` 一起移动，因此源码和编译后的配置寻址仍有效。公开包入口导出 `createHarness` 和类型；SDK、模型配置、prompt、Session、Agent、工具、hook、workflow 等逻辑不由 Web 重写。独立宿主与原样本逐方法恢复部分在源文件和历史报告中区分。

Web 使用单运行槽以避免用户在同一进程对多个会话并发修改共享运行状态；不是多用户服务。固定 IPv4 loopback 地址，拒绝其它 Host / Origin，写接口需要随机 CSRF token，不返回 API key、不序列化上游异常。默认工具审批只能保护当前宿主边界，不等同于原产品完整 ToolPermissionService 或 OS 隔离。

结果分派默认使用完整原 `InterruptionService.waitFor`，与 SessionManager 的 stream/history/gate 消费者分开。默认/非默认 Agent、headless、错误收尾和 Stop 续跑由原方法驱动；主 prompt 不再补发 Stop。独立宿主仅增加历史刷盘与异步续跑发布 barrier。较早报告中将该剩余分派归为 SessionManager 的表述已在还原状态中纠正。

完整InterruptionService（原构造器及32个成员）、ToolAlwaysApprovalService和BackgroundTaskToolApprovalService现已直接移植。`nativeApprovals: true`将原approve/reject、queue、handleInterruptions、SDK permission request/denial与callbacks接到同一结果所有权桥接；不修改原方法体的批准/拒绝/compaction/channel race分支。独立宿主额外跟踪原fire-and-forget run与早期Deferred拒绝，并等待sole stream consumer刷盘。CLI/Web的默认兼容控制器暂时保留，不能将开发者路径与默认路径混为一谈。

完整 ToolPermissionService、PermissionUtils、CommandUtils、八个策略和两个审批缓存入口通过 `nativePermissions: true` 显式连接真实 SDK；`harness.permissions` 提供完整核心对象，可与 `nativeApprovals` 组合。独立执行 guard 与原分类器有明确边界，Hook allow不会自动撤销该guard；显式注入的SDK人工权限客户端allowed与本地人工approve一样登记guard授权，拒绝从不登记。宿主内存 settings adapter 和未配置的 Auto classifier 也不等于原产品持久化/模型服务。审批暂停应从相同RunState恢复，参考 [OpenAI Docs](https://developers.openai.com/api/docs/guides/agents/guardrails-approvals)；SDK0.5.2的实际回调次数以本地测试为准。

SDK控制协议现由原StdoutWriter、Permission/Hooks/McpMessage/Elicitation客户端、ControlSignalHandler和初始化/模式/模型handler组成，所有I/O在工厂闭包显式注入。提供 `sdkControl` 时自动连接原Hook调用与权限控制器，默认启用两条native权限路径；`receive/receiveLine`消费控制响应，输出按JSONL保留原前缀分发和stdout背压行为。独立宿主拥有定时器/drain监听/拒绝Promise的清理，不添加原请求中不存在的默认permission timeout，不关闭外部stream。

初始化handler的完整原方法已移植，但其ProductManager刷新、环境切换、SDK MCP server创建依赖不能由空adapter伪装完成。默认宿主对未接入的动态覆盖返回明确错误，模型API key也不映射成原账号token。完整stdin/headless parser、SDK鉴权命令及产品启动与该可用控制组件仍有区别。

下一批优先完整McpServerManager的server/tool/Hook proxy与SDK MCP server，随后ProductManager初始化覆盖与刷新、SDK输入/启动、AutoMode backend和SettingsManager持久化。统一默认审批时还须验证原policy allow与独立guard的边界，不能只因为可选路径测试通过就声明默认已等价。新增Web UI不计为这些原产品服务已恢复。

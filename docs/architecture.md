# 架构与还原边界

`apps/cli/axonfire.mjs` 是统一入口：默认导入核心 CLI，`web` 子命令启动本地工作台。核心 CLI 保留 detached teammate 的内部入口，避免目录调整破坏子进程启动。

`apps/web/server.mjs` 使用 Node HTTP、fetch SSE 和静态 UI，不引入框架依赖。HTTP 请求只适配 `createHarness`、`openSession`、`prompt`、`compact` 和已有 SessionStore；不实现第二套 agent loop。工具审批和 AskUserQuestion 通过独立同源请求回复给正在运行的调用；连接断开、取消、超时均不会自动批准。

`packages/harness` 保留原来的模块组织，`src` 与 `config` 一起移动，因此源码和编译后的配置寻址仍有效。公开包入口导出 `createHarness` 和类型；SDK、模型配置、prompt、Session、Agent、工具、hook、workflow 等逻辑不由 Web 重写。独立宿主与原样本逐方法恢复部分在源文件和历史报告中区分。

Web 使用单运行槽以避免用户在同一进程对多个会话并发修改共享运行状态；不是多用户服务。固定 IPv4 loopback 地址，拒绝其它 Host / Origin，写接口需要随机 CSRF token，不返回 API key、不序列化上游异常。默认工具审批只能保护当前宿主边界，不等同于原产品完整 ToolPermissionService 或 OS 隔离。

结果分派默认使用完整原 `InterruptionService.waitFor`，与 SessionManager 的 stream/history/gate 消费者分开。默认/非默认 Agent、headless、错误收尾和 Stop 续跑由原方法驱动；主 prompt 不再补发 Stop。独立宿主仅增加历史刷盘与异步续跑发布 barrier。较早报告中将该剩余分派归为 SessionManager 的表述已在还原状态中纠正。

完整InterruptionService（原构造器及32个成员）、ToolAlwaysApprovalService和BackgroundTaskToolApprovalService现已直接移植。`nativeApprovals: true`将原approve/reject、queue、handleInterruptions、SDK permission request/denial与callbacks接到同一结果所有权桥接；不修改原方法体的批准/拒绝/compaction/channel race分支。独立宿主额外跟踪原fire-and-forget run与早期Deferred拒绝，并等待sole stream consumer刷盘。CLI/Web的默认兼容控制器暂时保留，不能将开发者路径与默认路径混为一谈。

完整 ToolPermissionService、PermissionUtils、CommandUtils、八个策略和两个审批缓存入口通过 `nativePermissions: true` 显式连接真实 SDK；`harness.permissions` 提供完整核心对象，可与 `nativeApprovals` 组合。独立执行 guard 与原分类器有明确边界，Hook allow不会自动撤销该guard；显式注入的SDK人工权限客户端allowed与本地人工approve一样登记guard授权，拒绝从不登记。宿主内存 settings adapter 和未配置的 Auto classifier 也不等于原产品持久化/模型服务。审批暂停应从相同RunState恢复，参考 [OpenAI Docs](https://developers.openai.com/api/docs/guides/agents/guardrails-approvals)；SDK0.5.2的实际回调次数以本地测试为准。

SDK控制协议现由原StdoutWriter、Permission/Hooks/McpMessage/Elicitation客户端、ControlSignalHandler和初始化/模式/模型handler组成，所有I/O在工厂闭包显式注入。提供 `sdkControl` 时自动连接原Hook调用与权限控制器，默认启用两条native权限路径；`receive/receiveLine`消费控制响应，输出按JSONL保留原前缀分发和stdout背压行为。独立宿主拥有定时器/drain监听/拒绝Promise的清理，不添加原请求中不存在的默认permission timeout，不关闭外部stream。

初始化handler的完整原方法已移植；SDK MCP server和ProductManager现接入原生宿主，prompt/Agent初始化覆盖由原provider→merger→发布→AgentManager重建实现。环境切换仍需真实adapter，模型API key也不映射成原账号token。完整stdin/headless parser、SDK鉴权命令及产品启动与这些可用控制组件仍有区别。

原生MCP模块将server/tool/Hook proxy、六个remote override、SDK server/JSON-RPC transport、transport registry、subagent白名单、JSONC配置工具与结果截断/落盘按完整原类/函数移植。外层 `native-mcp-host` 只负责显式配置、DI与资源所有权，不扫描安装账户或配置。已有Agent持有同一个live connectedServersCache，增删连接通过splice更新；工具元数据收集仍调用原proxy.listTools。

样本bundle中的SDK mcpToFunctionTool会把descriptor.needsApproval传入tool，npm固定0.5.2没有该字段传递。AgentFactory在安装SDK转换后仅补回此字段，不改SDK转换器、缓存或node_modules。真实SDK的拒绝测试验证底层tools/call没有执行。独立MCP依赖使用别名固定样本1.24.3，OpenAI SDK自身依赖不改。

原manager替换underlying连接时会fire-and-forget close，外层宿主跟踪这些Promise，shutdown等待当前与已替换连接关闭，清理自有timer/subscription；不改原manager的方法体。stdio Hook endpoint、产品OAuth、channel security/遥测/支付/ACP传输仍为可注入边界，不能以空adapter计为恢复。

顶层McpManager现以完整原类驱动scope合并、revision队列、runtime generation、拒绝/删除eviction、tools/list_changed重索引及settle等待；配置、连接、模型、批准/toggle和ready服务也为原类。McpRegistry在原生模式下仅转发同一live cache和manager API，不再自建连接发布条件。源码要求active且当前代次索引已提交才可见；不能把“TCP已连上”当作工具已准备好。native projection拒绝手工register外部实例绕过配置。

新增projection host只拥有外部依赖、scope来源和异步关闭屏障；延迟工作、inflight连接与旧实例dispose全部被跟踪，原方法体不重写。文件配置路径默认重定向到owned state，filesystem读取需显式选择；项目级配置批准默认使用内存settings adapter，外部可注入持久化实现。原插件组件来自显式getActivePlugins，同AgentManager可共用来源，但不冒充产品插件加载器/自动事件服务。

显式nativeMcp现在与sdkControl一样默认启用nativePermissions/nativeApprovals，保证DeferExecuteTool→MCP也经过原分类/暂停/恢复。真实SDK测试覆盖项目批准前无握手、批准后索引→ToolSearch→DeferExecute→HTTP调用，以及工具拒绝时无底层调用；普通CLI/Web默认仍未切换原生入口。

原ProductManager、五种merge strategy及DefaultProductMerger、Client/Env/CLI options/SDK initialize/Plugins/MCP prompt/default providers、GzipUtils/MemoryLocalStorage和MCP prompt renderer已逐类移植。稳定与volatile配置分离，原provider优先级、同优先级反序、原finally同步队列/失败语义和480秒proxy过期/2秒节流不重写。压缩包的匿名provider constructor.name仍保持缩写，不能因可读类名命中原字符串prefetch名单而改变样本调度。

ConfigWatch/McpWatch原类驱动缓存失效、CWD重绑与状态变化后的sync，独立host只负责自有FS/环境/缓存/定时器和发布关闭屏障。默认不加载原账户、远端产品配置或安装缓存。新快照同步更新同一个ProductConfiguration视图，ToolManager清描述缓存，CommandManager刷新，AgentManager监听原onDidChange重建；SDK初始化等待该重建。原插件完整刷新事务、Cloud product provider和SettingsManager磁盘服务不因该链路可运行就算完成。SDK instructions的职责参考[OpenAI Docs](https://developers.openai.com/api/docs/guides/agents/define-agents)，实际调用与生命周期仍按锁定0.5.2及真实SDK回归。

CustomAgents/CustomCommands、Models/CustomModels、AgentModelResolver、AvailableModelsFilter、企业custom-model filter及Craft-to-cli同步现默认加入同一个ProductManager。原DirectoryScan、颜色、加载时变量与plugin变量完整方法，以及原模型能力目录/类型/策略常量的纯factory一并保留；目录数据不当作新SDK实现。SDK自定义model/provider边界参考[OpenAI Docs](https://developers.openai.com/api/docs/guides/agents/models)，实际API版本仍锁定0.5.2。

`native-product-source-host`只负责owned路径、显式认证/REST/工作区适配器与生命周期：默认认证为空，不读取安装账号，也不调用真实企业服务。原企业策略core/CLI/disk/cloud类全部保留；匿名/个人/feature-off、远端检查、失败开放/旧拒绝保留由原方法决定，不以永远allowed的stub替代。默认user-home映射到本次state，policy缓存也不接原账号目录。原本不返回unsubscribe的Models.init订阅在宿主边界追踪；关闭时清订阅、interval/immediate、watch和inflight策略/磁盘任务。

注意原AgentManager只淘汰plugin缓存：删除普通Agent文件后，新product快照不再包含它，但先前注册过的非插件SDK Agent仍可能由get(name)取出。命令删除会刷新命令表。这个原样本行为保持不变，不能把文件发现已恢复表述为所有旧实例都被清理。

下一批优先插件跨服务刷新事务及Cloud product/环境服务，随后SDK输入/启动/鉴权、Hook服务端、AutoMode backend和SettingsManager持久化。统一默认审批时还须验证原policy allow与独立guard的边界，不能只因为可选路径测试通过就声明默认已等价。新增Web UI不计为这些原产品服务已恢复。

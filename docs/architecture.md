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

PluginManager完整194成员、七类extension loader及loader manager、PluginRuntimeRefreshService、reload命令和输出样式manager现已移植。默认owned plugin host启动原manager，只有显式目录进入inline来源；同一active snapshot供Product provider、AgentManager、Hooks、MCP及LSP消费。完整原刷新队列在beforeCommit比较MCP有效server名称，提交后刷新各服务；AgentService使用已有原join屏障，继续从同名托管Agent取新实例。本地/Git/HTTP/ZIP市场现由完整原provider/Factory、Storage、ConfigManager、BuiltInProvider、LocalInstaller、Git检测/转换/回退和FileLock/UpdateChecker实现。原Git/npm/subdir安装器、OptionsStorage和ErrorCollector也默认接入；原SettingsManager、CLI设置/来源队列及PluginPolicy现为默认依赖。内置资源物化/解析、PluginController与Validator已接入显式资源根；MCPB与完整产品bootstrap/session-addon编排仍未恢复；Cloud product原四类已接入，认证和REST保留显式宿主边界。

seed链分开Desktop与CLI两种所有权：43个原函数负责source/不可变cache物化、复制和默认候选；5个原函数及完整候选initializer负责资源发现；原PluginController.reconcileWorkbuddyBuiltin通过builtin-seed队列包裹已有PluginManager锁定metadata事务。独立host只提供显式资源/state/version/platform、Promise/readline/同步FS边界与启动等待；没有执行Electron bootstrap，也不自动分发/运行资源附带的第三方二进制。原metadata成功而projection失败的返回值、回滚范围、同版本cache不刷新等边界保留。

市场存储使用原`known_marketplaces.json`、原子临时文件/rename、损坏备份、legacy cache引用修复、进程内写队列和mkdir/lock.json跨进程协议；原市场存储拿锁失败会继续无跨进程锁执行，这个降级行为保留而不是宣传为强一致事务。FileLock的第三方Mutex按样本依赖async-mutex 0.5.0，完整类保留其Map缓存。独立宿主把市场和锁路径限制在本次state，并等待市场inflight写入后关闭；该文件桥不是OS沙箱，也不是原fs-extra。内置市场provider本身为完整原类，但宿主默认显式空profile，不自动使用原配置JSON里的生产市场；可经`nativePlugins.builtInMarketplaces`显式提供。

ZIP的19个完整原helper保留下载/HEAD重定向与60/30秒超时、ETag/Last-Modified、本地mtime、单目录展平、权限、路径检查和重命名退避；provider保留404-only main/master回退、staging/backup原子替换及双失败备份保留、孤儿清理和UUID版本缓存。HTTP provider只下载marketplace/plugin清单，不擅自新增资源下载；gzip helper不解tar，ZIP provider临时名仍固定.zip，这些边界也按原实现测试。

编译后并行测试还暴露原FileLock的发布竞态：mkdir成功但lock.json尚未写入时，另一个进程会把缺少metadata当作stale并删除，可能出现双owner和丢更新。原类与还原类均由确定性barrier复现；不修改原协议。真实跨进程正向测试明确在有效lock.json上争用并控制调度，不据其通过宣传所有并发下强一致。市场存储还有原拿锁失败降级，两者均须与接口/控制流保真区分。

`owned-marketplace-io`仅负责request/response、AbortController、ZIP打开/entry stream、子进程和关闭屏障，不重写上述决策。默认Git adapter无shell，clone目标与更新cwd限于state；原reset --hard/clean -fd只作用于自有clone，不作用于用户项目。Git HOME/config与SSH身份/agent隔离，不读取安装账号；认证SSH需显式注入`nativePlugins.marketplaceRuntime.exec`。真实HTTPS证书/代理/私有仓库未由本地fixture证明。依赖yauzl按样本固定3.2.0并记录其告警，不以修改原实现或强制升级冒充等价。

独立安装器沿原顺序加入同一个installer集合，Manager的tag/SHA/ref/cache决策现在使用owned Git接口。Git保留完整40位SHA/分支/默认HEAD路径，subdir保留filter=tree:0、no-cone sparse checkout、祖先repo查找及pull失败重装；npm保留install spec、prefix、120秒与registry透传，**未添加ignore-scripts**。只启用可信包：npm生命周期脚本会执行，owned cwd/HOME与无shell并不是OS沙箱，也不保证任意脚本孙进程树的清理。默认npm config/cache重定向到state，不读取系统账号或用户npmrc。

原OptionsStorage处理敏感/非敏感拆分、跨存储迁移、缓存与替换；敏感值原样明文写入本次state的credentials.json，首次创建0600，不使用系统Keychain，也不保证加严既有文件mode。非敏感默认使用完整原SettingsManager的USER/pluginConfigs（state/settings.json）；旧plugins/plugin-options.json窄adapter仅保留兼容与缺失项迁移，源文件保留。显式`nativePlugins.settings`或`nativePlugins.dependencies.pluginOptionSettings`可替换该依赖。原ErrorCollector的100条上限、timestamp排序和plugin/source匹配（并非pluginName/marketplaceName）保持不变。

设置宿主只适配三个scope路径/写入边界、CLI options事件来源及资源所有权；6个原类和deepDiffDefaults/normalizeReasoningEffort/getSettingsFilePath的方法体由独立AST核对。CLI和Web共用原设置加载器，原SettingsController/ValidateMiddleWare可由嵌入接口调用，但不冒充完整/internal/config路由bootstrap。原SettingsChange事件由独立桥同步排队原插件refresh，ConfigChange Hook仍为原fire-and-forget，宿主持有完成/关闭屏障。权限/MCP专用内存settings仍有明确独立边界，完整设置类不等于所有消费者均已100%接线。

新宿主只拥有路径、数据/平台adapter、订阅/定时器/immediate及所有原方法返回Promise的追踪，关闭时先拒绝新刷新，释放MCP/LSP I/O，再等待事务和旧任务，最后关闭ProductManager。Node fs桥写入限于owned state；signal=0只读存活检查保留，不允许通过该接口发送终止信号。原source的方法体与字符串不替换成宿主逻辑。原reload/builtin-seed的LSP刷新故意后台执行，host额外持有关闭屏障；默认显式LSP config由宿主补回，属于standalone配置兼容而非原方法变更。

CLI/Web共享本地命令分派，原reload executor负责caveat/input/output历史和force/ToolSearch/已有输出门槛，命令不经过SDK模型。Web同源/CSRF和单运行槽不变。插件可含自动执行Hook，必须显式信任目录，逐次工具审批不能作为插件沙箱。

插件刷新屏障位于产品服务与SDK运行之间，不重写SDK agent loop；职责边界参考[OpenAI Docs](https://developers.openai.com/api/docs/guides/agents/running-agents)。实际入参、stream完成与恢复行为仍以锁定0.5.2和本地真实SDK测试为准，不按现行文档升级依赖或替换原状态机。

Cloud四个完整原类的22个成员保留用户投影、精确ApiKey门槛、缓存/重试/合并决策；只在外层提供账户Subject、存储、日志、时钟、HTTP和Promise生命周期。类constructor.name也保留样本e0/tG/e_/eE，避免误触发ProductManager按名称选择的预取/缓存分支。owned单origin HTTP不是原CellJS REST或登录实现，默认匿名无外部请求。关闭不会改写原reset语义；正常运行的reset仍不取消旧重试，只有宿主close终止资源。成功重试不自动sync，force sync也不跳过用户8分钟缓存。

Desktop侧会话Addon链现有完整纯函数与ModeService三类、CWD错误类、原SessionManager.resolveRuntimeConfig成员。`createAddonSession`是明确新增的进程内宿主：每会话独立state/Settings/Product/Plugin/Agent实例，沿原manifest和buildAgentCliRuntimeArgs下发CLI scope，复用真实SDK。它不把多个会话的模式覆盖到一个全局ProductManager。显式close/resume重建可切模式，但没有替代原daemon SessionManager全类、ACP进程池、pending drain/自动restart及消息迁移；普通CLI/Web不默认走此factory。

源craft/expert默认bypassPermissions，这会绕过现有standalone mutation guard；该默认被保留而非改成兼容策略，嵌入者如需审批应显式default。原prompt-vars写入/健康检查/11109修复方法在owned随机temp根运行，关闭保留state，只移除本次temp；工作目录预检不会自动创建丢失的项目。借用的resolver/prompt renderer生命周期由调用方管理，不读取原账户或自动初始化模板服务。

后续继续完整资源prompt服务、daemon会话动态配置/自动重启、环境及完整SDK输入/启动/鉴权、Hook服务端和AutoMode backend。统一默认审批时还须验证原policy allow与独立guard的边界，不能只因为可选路径测试通过就声明默认已等价。新增Web UI不计为这些原产品服务已恢复。

# Recovery status

此文件区分“目标样本中逐字节保留”“从 bundle 控制流还原”“仅建立接口骨架”三类状态。百分比只描述当前重建工程，不代表原应用总体功能覆盖率。

## 已固化证据

- WorkBuddy：`5.3.14`
- Product commit：`825709d4641e734288fccb0f3c04114e67f713dd`
- `app.asar` SHA-256：`2206731a15f5f68e741fc82828026a18e667f94683f444a9568f69e12f7653a7`
- `codebuddy.js` SHA-256：`4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd`
- REA evidence：`ev_875f0d4d1e6a43839507573f957186fa7622897997a86c505abf0bc90c554ad4`
- bundle 内 memory policy 常量的规范化导出 SHA-256：`6d2bdeeef7bef8029396250abc25823d6db6784fe486dc6160ac35b7ba5729b0`（独立于 115 个 product prompts，运行时和 `verify:config` 均验证）

## 模块状态

| 顺序 | 模块              | 当前状态                     | 证据/缺口                                                                                                                                                                                                                                                                             |
| ---: | ----------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|    1 | OpenAI Agents SDK | 完成                         | 精确锁定 `@openai/agents* 0.5.2`、`openai 6.25.0`；SDK 不重写                                                                                                                                                                                                                         |
|    2 | Product config    | 100% 字节保留                | default/cloudhosted/internal/ioa/selfhosted/sandbox 六份原始 JSON；SHA 验证                                                                                                                                                                                                           |
|    2 | ProductManager / providers | 原manager、merger及文件/模型provider默认接入 | 首批19类/112处AST/743次比较；文件/模型15类及helper为118处AST/263次比较。插件刷新队列与原SettingsManager/PluginPolicy现默认接入，seed物化/交接已接显式资源根；Cloud四类22成员/8常量/38次比较现已默认接入，认证/REST为显式边界；Addon核心与独立后端已恢复（见后文）；原环境三类和BooleanUtils/6helper共21成员、397次比较现已接入；资源PromptService与九collector/22份模板现已接入，完整UserPromptService/17 sections已提供独立ACP宿主，Addon显式promptAcp已接原meta/首轮核心与ACP→SDK链，完整SessionManager/RPC/回放、daemon动态会话编排和登录/鉴权仍待补，不等于完整产品bootstrap |
|    2 | PluginManager / loaders / refresh | 完整核心类、市场、安装器和设置/策略主路径默认接入 | 首批14完整类含PluginManager194成员与七loader/事务/reload/style：294处AST/472次比较；市场/锁15类+19helper：129处AST/584次比较；Git/npm/subdir/Options/ErrorCollector5类：45处AST/120次比较。原PluginPolicy与Settings/CLI服务已默认连接，支持磁盘启停/卸载/重启及实时产品策略；资源seed/MCPB与完整产品控制器仍待补 |
|    2 | Settings / PluginPolicy | 6完整类与原常量默认接入 | SettingsManager/Controller/ValidateMiddleWare、CliSettings/SettingSourcesProvider、PluginPolicy，另3个helper共66处完整AST、9个pure factory与94次有限行为比较；JSONC/作用域/缓存/损坏拒写/锁/Hook/CLI队列和策略事件保留。权限/MCP/SDK消费者已补原分scope读写和关闭屏障（另105成员/154组联合复验）；完整路由/环境bootstrap仍未据此宣称恢复 |
|    2 | Builtin seed / plugin controller | 原物化与metadata交接链已接入 | 43个Desktop seed/复制函数、5个资源解析函数/7级候选、完整PluginController23方法及Validator/Error类：78处AST、12初始化表达式、113次有限比较。显式资源根启动接原manager事务/刷新；第三方二进制不分发，完整Electron/daemon/session-addon未据此标为恢复 |
|    2 | Prompt registry   | 原内容保留、资源与用户组合核心已恢复 | 115个product模板、284,899 Unicode code point不变；另22份Desktop模板/风格逐字节校验。资源PromptService/Renderer和九collector完整移植；UserPromptService与17 sections（18类91成员/141函数/58初始化）提供独立ACP宿主，Addon promptAcp已接原meta/首轮核心与SDK转换，完整SessionManager/RPC/回放及外部Docs engine仍待补 |
|    2 | Tool registry | 47个不同名称均有handler | 原48条声明含一条重复Agent。新增WeChatReply/WeComReply与bridge，默认CLI声明不变；WeCom连接沿原逻辑补入已构造Agent内存tools。47/47只是名称覆盖，已有工具的客户端/宿主分支、动态缓存/插件等仍待补；不是整体100% |
|    2 | AgentManager | 完整原类移植，68个非constructor方法结构对照 | eager构建/ready与models屏障、pending/force重建/指纹、CLI/handoff/asTool、模型继承/related/env、插件replace/volatile expert/settings优先级、MCP首轮等待/原生defer/权限门槛已恢复；74个原YAML模块factory逐字保留。独立host明确适配DI/Deferred/Emitter，不等于完整ProductManager/插件loader/工具索引热刷新服务 |
|    7 | MemoryManager / 条件规则 | 八类完整服务和依赖链已接入 | Manager/Loader/Parser/Cache/Validator/GlobMatcher/Subdirectory/ConditionalRules，原LRU、Path/Import/Glob/Markdown/context helper、tool注入/run interceptor；67个完整方法AST与282次比较。user/project/local发现、import/缓存/Hook、常驻提醒、Read/Write/Edit条件匹配接真实SDK；相关性/entrypoint/freshness及原提取RunState现已接入；watchers/UI与通用Hook命令执行器仍未完成 |
|    3 | SessionManager    | 主路径高覆盖                 | JSONL/meta、append锁、活动历史、六个原processor、原七个结果生命周期方法、DraftStore/abortable iterator/gate/content-filter/idle-start已接。新增完整InputHistoryService、八类响应interceptor及反向DI顺序、原业务码映射/Token/PTL截断：982次差分+25项专项；Hook命令执行器、产品配置live refresh/完整视图和Telemetry transport仍待补，非完整原SessionManager |
|    3 | Input/image pipeline | 原处理器方法和宿主主路径已接 | Default10/Parent9/Function8/Result7/Usage6/Exit4按原provider正priority/降序；37套renderer、ImageFilter850默认接入，Rehydration1050现默认接入原blob服务；Compression1075现默认接原ImageUtils/Jimp，803次原codec图/Read方法差分+11项专项。另535次原三blob服务/四SessionStore方法差分+13项专项，不再以假blob依赖充当默认存储 |
|    3 | SessionStore      | 文件协议主路径已实现         | 原始 `.jsonl`/`.meta.json`、`agent-*` 子 Agent 路径、默认 1000 条/用户轮次边界、64KB 逆向分块读取、损坏行跳过、storeId/runtime sessionId 区分、legacy text block 修复、跨项目查找/列表、usage snake_case、图片/工具结果外置接口已实现；原blob三服务与四个外置方法现已恢复；原产品项目目录编码/完整媒体接线仍待补；Read直接去重/压缩与原codec已恢复 |
|    3 | Run state machine | 原始迁移表与事件投影差分通过 | 原生 13 状态/20 事件的完整表、非法迁移忽略、legacy agentState/phase metadata、日志、busy/idle/queue-busy、force idle 与 runStateSubject 去重已恢复；`getChange$(session,true)` 原语义是跳过当前值并发出 void，不是 emitCurrent。有限事件矩阵已与原类逐项比较；完整产品 UI projection service/宿主接线仍待补 |
|    3 | AgentFactory / lifecycle | 原生 Agent 事件接线差分通过 | Agent start/end/tool/handoff、activeRunContext 与旧回合结束过滤、9 个 bypass 名称与仅 pre-message summary purpose gate、工具参数原正则递归重写、MCP AsyncLocalStorage call context 已恢复；真实 SDK 保持 0.5.2，不改 SDK 内部。独立 bootstrap 注入 factory，手动构造 AgentManager 时需显式传入 |
|    4 | AgentService      | 主控制流高覆盖               | `run`、`runDefault`、`runOneTime`、override、fork、插件刷新点、旧 run 中止、stream result 发布已实现                                                                                                                                                                                  |
|    5 | RunnerFactory     | 关键过滤器高覆盖             | 完整 loop detector 尾部扫描/4与40次阈值/Read 同文件/停止 Prompt/marker，1,411 组原类差分通过；自动 compact 判定、30s cooldown、JSON/jsonrepair/`">"` 修复、精确重试 Prompt 已实现 |
|    5 | ModelConfig interceptor | 本批主逻辑差分通过 | priority=900、request > CLI > default、未知 ID 继承基础配置、1.0 默认 temperature、100k output cap、递归 handoff、session/global thinking、MAX_THINKING_TOKENS、default effort/max→xhigh、summary/verbosity/fallback 已恢复；972 组样本类对照通过，独立 env cap 单测通过；日志/遥测侧效应未移植 |
|    5 | ModelProvider     | transport 主路径高覆盖       | endpoint 优先级、`/chat/completions` 归一化、凭证/cache/SDK model、会话与内部 header、providerData/extra_vars、自定义模型兼容、reasoning summary、连接级单次 retry、首 token/idle timeout、finish grace、SSE tool-call ID 去重均已接入；Axios/OTel/遥测侧效应待补 |
|    5 | Core file tools   | 主路径高覆盖                 | 三个原始 Zod schema、1-based paging、2000 行/字符限制、256KB/100MB 限制、binary/Notebook/image、行号格式、读后写和外部修改保护、CRLF/BOM、唯一/全量替换已实现；原ImageUtils完整类/Jimp0.22.12与Read图片方法、模型/二进制门槛、blob去重已恢复；非UTF编码全集、其他文本Read原方法/错误码复核及遥测待补                                                                            |
|    5 | Core search tools | 主路径高覆盖                 | 原始 Glob/Grep schema、60s Glob timeout、ripgrep、node_modules/.git 排除、mtime 排序、分页、三种 Grep 输出、上下文/类型/multiline 参数、50,000 字符截断已实现                                                                                                                         |
|    5 | Core shell tools  | 核心控制流已实现             | 原始 Bash/PowerShell schema、120s/600s timeout、30k/150k 限制、上下文 env、前台 envelope、6 位 task ID、显式后台、timeout 转后台、后台输出/kill 已实现；sandbox orchestrator、ConPTY、safe-delete、安全分类和 UI streaming 待补                                                   |
|    6 | Permission flow | 完整原控制器/权限服务及SDK控制客户端 | 原InterruptionService、always/background审批、权限/缓存/模式策略已移植；SDK JSONL权限/Hook/MCP消息/elicitation客户端与dispatcher已接真实SDK。显式sdkControl或nativeMcp默认启用nativePermissions/nativeApprovals及原生MCP projection/server/proxy；SDK启动/鉴权/产品初始化依赖、policy到独立guard统一、Auto backend/专用Settings消费者接线仍待补，普通CLI/Web默认不变 |
|    6 | AgentTask         | 完成/失败仲裁与主生命周期差分通过 | setup/execute/cleanup、new/resume/fork、model/permission/hooks/skills/转发/usage 主路径保留；agent_end/idle、stream final-step guard、retryInProgress/compaction、200ms/120s 压缩轮询/重挂、精确取消、原错误 rethrow、Hook best-effort、RESULT delimiter、nullish resume meta 与 teammate failure 已恢复。executePhaseWithRetry 无内部重试循环；普通会话重试现由 InterruptionService 负责，45s throttle/watchdog 已确认属于 Workflow 并在对应链路恢复；独立 result reset/落盘 barrier 为 host adapter |
|    6 | Agent tool | 同步/Worktree/进程内与显式进程外 Team 接入真实 SDK | 原 schema、env max turns、model variant、fork boilerplate/child 检测、disabled fork、父 toolCall id、同步/中断/错误码 19920..19923/subAgent meta 已恢复。真实 SDK 验证 Explore→Read→独立 transcript→resume、子审批、Worktree、Team，以及子任务网络重试不误判失败。spawn chain/重名/颜色/rollback/失败后 chain 拒绝保持原行为；默认保持原 in-process，显式 standalone override 接 detached-process；全部权限宿主分支仍待补 |
|    6 | AgentTaskManager | 核心调度与 Team 策略接入 | register/get/alias/status/session/wait/cancel/events、5 分钟 TTL/60s cleanup、20 个已完成 Team session 上限、4s 通知延迟/30s dedup/末成员强制通知/10s auto-team cleanup 已恢复；现接 TeamManager/registry/mailbox/cleanup adapter，长时间调度/全部失败竞态未穷举 |
|    6 | Task storage/CRUD | 文件协议与 handler 已接入 | 原始 subject/description/activeForm/status/blocks/blockedBy/owner/metadata、scope 优先级、TaskCreate 调用序号 ID、数字递增、原子 tmp/rename、metadata null 删除、todo 全完成隐藏、hook payload、mkdir+lock.json/进程存活/过期清理均已恢复；完整 Hook 执行器待补 |
|    6 | TaskOutput/Stop | agent/shell/Workflow 已接入 | 原 agent/shell 输出/等待/取消与旧 KillShell schema/文案保留；通用 BackgroundTaskRegistry 的 add/get/kill/session kill/5 分钟 TTL、60s unref cleanup、Workflow 输出/停止与 backgroundTaskSubject 已接入。Workflow 最终输出/完成通知/SDK 续跑验证通过；完整产品 background UI、所有 shell completion 自动通知与资源路径编码仍待补 |
|    6 | Team runtime      | 进程内/外主路径及 SDK 验证通过 | TeamManager/Registry、in-process backend、成员 spawn/respawn/状态/mailbox/forceKill/destroy、leader polling、ShutdownCoordinator、roster Prompt 与 Worktree cleanup、failure registry 已恢复。新增 DaemonProcessManager、detached/tmux backend/registry、HTTP mailbox/PermissionBridge/REST controllers、TeammateRunner 与 SSE bridge；原类 1,021 次差分通过。真实 fork 验证 leader 审批/Read/后续消息/历史/退出及活动流和失败 PID 清理；tmux 只用假命令验证，完整 rich-queue 前端/所有 Plan 状态/产品 Gateway/ACP/真实 tmux 宿主未完成 |
|    6 | Interruption 错误恢复 | 原错误分支差分与 SDK 验证通过 | ECONNRESET/ECONNABORTED/ETIMEDOUT 与最近 3 条活动历史 marker、首 token timeout 2 次/其他 stream timeout 1 次及 2s×次数 delay、成功后清零；SyntaxError/ModelBehaviorError 最近 4 条/2 marker 上限、deferred/未知工具纠正与终止 Prompt、silentAbort/未完成 call 回注/状态与 child 路由已恢复。独立 SessionManager 不抢先 RUN_FAILED，宿主等待恢复发布后再决定抛错；完整主 UI Stop Hook/profiler/telemetry/权限 callback 分支未完成 |
|    6 | Team tools        | 原 schema/文案/身份路由与 SDK 通过 | TeamCreate/Delete 非 deferred、SendMessage 默认直接暴露、原 allowlist/env gate、meta/active delete barrier、身份拒绝冒充 leader、main alias/未知收件人 inbox/broadcast、shutdown 默认 approve/协调器/kill、Plan response 与 renderer 已恢复；外部进程 mailbox/审批/关闭协议已接独立宿主；完整原生前端视图与 Plan 状态仍待补 |
|    6 | Session hooks     | 子 Agent 关键事件已实现      | scoped registry、admin trust gate、`SubagentStart`/`SubagentStop`/`TeammateIdle`/`Notification` 的真实 payload 与 blocking feedback 已实现；其余 HookEvent、命令执行器和 transcript 文件生命周期待补                                                                                       |
|    7 | Compaction        | 工程压缩与策略主路径已实现   | 原始 XML engineering compact 通过 105 组安装包类差分；PreMessage/MaxToken/Blocking 策略、15% 工程摘要充分性阈值、24k summary maxTokens、末批工具输出截断重试、5 轮 fallback、连续 5 次上限、pending interruption gate、静默中止/恢复、摘要 Prompt、历史逻辑边界、继续消息和环境 override 已恢复；Blocking 的 ACP 60s result 观察、compact-agent microcompact、全部 hook/telemetry 侧效应仍待补 |
|    7 | Memory extraction | 提取主路径与磁盘扫描已实现   | enabled/disabled 环境优先级、settings、消息游标、已有 memory write 检测、异步提取、隔离 RunContext/5 工具/5 turns、bypass 后恢复、无 transcript 污染、完整提取 Prompt 与独立 policy hash、4096-byte frontmatter 扫描/200 文件上限、manifest、MemoryLoadContext 已恢复；MemoryManager规则发现/导入/cache及条件注入现已恢复；MemoryRelevance/entrypoint/context/read freshness和原提取类现已恢复；产品REST/UI/watchers仍待补 |
|    7 | Deferred tools    | 主路径高覆盖                 | MiniSearch `7.2.0` 索引、name boost=2/prefix/OR、精确 lookup、fuzzy fallback、3/20/30,000 限制、agent/session allowlist、Defer/NoDefer、AJV `8.17.1` allErrors/coerceTypes、builtin/MCP 分流、图片与 sideband meta 转换均已实现；本批补 wrapper deny/allow、目标强制审批、mandatory flag/target adapter、MCP 权限名转发并通过目标类差分。独立宿主只接 intrinsic approval+host guard，完整 classifier/mandatory target 服务、ACP progress/UI broadcast 与透明代理静态配置解析待补 |
|    7 | Plan mode | handler 与默认 deferred 链路已验证 | Enter/Exit 原始 schema、旧 mode 保存/恢复、plan 文件命名/读写/缺失文案、子 Agent 禁用、teammate plan_approval_request、拒绝 Prompt/skipRun、PlanStrategy 的旧策略委派/计划文件放行已恢复；真实 SDK 验证默认 deferred→计划写入→Exit 审批→恢复。完整 Team lead approval response/宿主策略全集待接 |
|    7 | AskUserQuestion | 真实 SDK 人工问答已接通 | 原始 advertised schema 与运行时友好校验差异、legacy normalization、19201..19204/90003/90004、ACP/stream-json/print capability、自由文本/三类跳过动作、early answer/per-call waiter/timeout/abort、wait span adapter 已恢复；宿主 callback 覆盖模型预填答案，真实 SDK 单次批准后消费答案。原产品 UI、ACP 连接与实际遥测 exporter 未接 |
|    7 | Skill / SlashCommand | 核心 handler 与 SDK 验证通过 | Skill 精确/短名/显示名/歧义、legacy 参数、session 替换、命令 fallback、fork AgentTask/model/hook 信任门、原始结果和插件遥测 adapter 已恢复；SlashCommand 原始 schema/审批委派/本地与自定义分流已恢复。原配置 19 个 Agent 均不暴露 SlashCommand，独立入口保留此边界；legacy handler 通过显式 SDK Agent 验证 |
|    7 | SkillManage | 原始指引/文件读取协议已恢复 | 原 feature gate（当前 false）、list/create/modify/delete、30 条详情/30k 字符、registry 结构/失败回退、registry 或 agent_created 双来源判定、短名歧义/目录 100 条/模板与原始 workflow 文案已恢复。handler 不直接创建、写入或删除；真实 SDK 在显式内存 feature overlay 下通过默认 deferred 调用验证 |
|    7 | NotebookEdit | 文件状态机与差分通过 | 原 schema、参数错误、隐式 insert/replace、绝对 .ipynb、50MiB 上限、JSON/nbformat/cells 校验、cell ID 精确/索引/partial、source 换行、创建/替换/插入/删除、execution/output 字段细节、refresh read state 已恢复；当前 Agent 均不暴露该 legacy handler，SDK 显式注册验证。原生文件遥测/代码比例报告与 sandbox 文件权限父类宿主仍为 adapter |
|    7 | StructuredOutput | 动态 schema 与完成反馈已接入 | AJV allErrors、会话 schema string/object/identity cache/fallback、输出捕获/context factory、SessionStart format gate/JSON 检查、Stop priority200/最多 3 条 meta 强制反馈/第 4 次 Stop 完成、dispose/completionDeferred 已恢复；真实 SDK 验证校验失败后重试和跨会话 schema 隔离。嵌入入口已接通，完整 JSON/stream-json 视图和通用 Hook/AgentCompletionWaiter 框架尚未恢复 |
|    7 | Cron tools / scheduler | 主路径及真实 SDK 队列验证通过 | 原 schema/参数/文案、session-only 模型任务、50 cap、本地时间五段解析/DOM-DOW OR/数字前缀、确定性 jitter、3 天过期最后触发、storage/owner lock/文件 watch/missed 通知、500ms tick/5s owner retry、enabled/env gate 已恢复。保留 durable-delete 数量等原行为；19 个原 Agent 均不暴露 Cron，不扩大 allowlist；原生遥测和 stop/async init 全竞态仍未穷举 |
|    7 | Message queue | core manager/interceptor 与宿主 drain 接通 | queueSubject、编辑/held/图片回填、合并/teammate 隔离、priority1800 的 legacy/deferred/busy 分流、QueueDispatchUtils feature/env gate 已恢复。独立宿主 idle drain 接真实 SDK、JSONL 和输出回调，保留原 deferred=true；RichMessageQueueManager/完整 request processors/UI 仍未恢复，独立 drain 不是原桌面前端 |
|    7 | Worktree | 核心 service/session/工具与 SDK 隔离验证通过 | schema/aliases/审批/文案、name/PR parser、base branch/remote fallback、Git create/reuse/list/remove、初始化设置/软链接/include、allSettled 变更检测、CWD ALS/observable、session Hook/退出与逐字提示已恢复。原 19 Agent 均不暴露 Enter/Leave；独立 CWD adapter 不改变 embedding process.cwd，关闭时 dirty/hook 默认 keep。Workflow spawner lease 已验证 SDK 隔离 Read/保留父修改/清理干净 checkout；原生 Hook executor、tmux UI、产品 startup/exit、Bun.Glob 全平台与完整 Workflow 主入口仍待补 |
|    7 | Skill provider / descriptions | Workspace provider 主路径差分通过 | project/user/connector/session-dir/bundled、深度 5/并发 32/symlink、metadata 四类优先顺序、visibility/颜色/品牌与变量、clone cache/force、描述 8k 预算/150 cap/200 总数仅削减 user/protected/collision/agent.skills 已恢复，description vars 与 frontmatter preload 已接入；插件 loader/seed 物化、描述缓存/热刷新生命周期仍待补 |
|    7 | Command / reference runtime | 核心协议、改写拦截与 Workflow 命令接入 | 57 normal+4 conditional 元数据、model-invocation allowlist、条件 feature/env、作用域覆盖、parse/register/local execute、CommandMessageUtils 全套 XML/history、参数/inline Bash/@引用已恢复；新增 AgentSwitch priority1600、AgentManager.getCommands、agent/model/allowedTools/custom/MCP/skill 改写与 Workflow 两个本地 executor。CLI 分派与 host DI 明确为适配；其余 executor/UI、MCP prompt renderer、插件物化及 Shell sandbox/PTY 待补 |
|    7 | PromptContext/interceptors | 核心注入已接入 | 顺序 initializer/in-flight coalescing、系统/Git/语言/模型/会话/feature、prompt-vars primitive 校验/快照/防覆盖、Env(priority2000)、SkipRun(1700)、SystemReminder(1200)、UserQueryWrapper(1025) 已接入；规则来源 adapter、IDE 2000 字符截断、Hook context consume、channel/MCP symbol 注入与 user-query 合并已恢复。MemoryPrompt initializer和真实规则来源/条件priority1740已接入；插件/扩展initializer、Windows shell factory及遥测日志副作用仍待补 |
|    7 | MCP               | 原projection/config/connection及proxy/transport完整类已接入 | 上批底层157处AST/752次比较与30项专项之后，新增顶层McpManager等14类、146处完整AST/279次比较与25项专项；scope优先级/项目批准/revision队列/generation隔离/索引提交/热刷新/settle及原JSONC配置写入已接真实SDK。产品插件自动编排、完整CLI命令/UI、OAuth/Hook服务端/产品channel security仍待补 |
|    8 | Workflow          | 主链、控制层与命令/事件桥差分通过 | Execution/Factory、Acorn8.16.0 Parser、Compiler/prelude、root/nested VM、durability/hash/budget/journal/record/registry、Spawner/AgentTask/schema/watchdog/Worktree 已恢复；主链1,412次。第37个 handler WorkflowTool、Manager/PauseGate/快照/saveAs/recent/provider/后台通知恢复，控制层536次。新增 `/workflows`、`/save-workflow`、保存命令注入/专用指令分支、AcpBridge/PrintModeHandler及显式宿主接线，1,488次差分；保留空 prompt 与完整ID限制。真实SDK、CLI、本地JSONL/跨OS进程cache验证通过；产品React UI/完整ACP生命周期/完整stream-json视图、内置脚本资源及全状态崩溃恢复待补 |
|    8 | Record/replay     | 原模型/Store协议替换兼容骨架，启动与离线CLI已接通 | 原RecordingStoreImpl同步JSONL/metadata/覆盖/队列推断/peek/consume/fallback/count/close、RecordingModel请求先写/stream offsets、ReplayModel错误类/仅model strict/倍率、Provider模式/env均恢复；2,282次差分。13项专项含真实SDK录制/重放、新进程CLI与工具权限守卫；不承诺全产品bootstrap/磁盘故障/全并发状态空间，重放不等于dry run |
|    8 | WebFetch / WebSearch | 原handler、协议/本地/SDK主链已接入 | 第38/39个handler：schema/错误/freshness/域名筛选、API请求头/IOA/超时/结果投影、WebFetch API优先竞跑/本地HTML/Turndown7.2.1/100k截断/15k分析/15分钟URL缓存/contentAnalyzer/逐字回退Prompt/网络策略/遥测映射；托管Security Center转换及V3/V2/file网络来源已接。544次差分+15项专项，真实SDK和CLI仅本地受控HTTP验证；产品服务认证/远端检索、完整Sandbox/UI/所有平台故障仍未恢复 |
|    8 | DelegateTool | handler/Manager/变更消息/描述刷新已接入 | 第40个handler，Zod3 schema及原包转换器JSON、全局connection/空session/timeout透传、注册覆盖/索引/清理/回调、ACP added/removed、嵌套结果/错误与描述变量/cache失效/已构造Agent刷新均恢复；282次差分与15项专项，真实SDK回合通过内存客户端验证。完整ACP transport/认证/产品AgentManager生命周期及CLI连接参数仍未恢复 |
|    9 | Standalone bootstrap/CLI | 已编译与本地端到端验证 | createHarness注册47个不同handler，接入AgentTask/TaskManager/TaskStorage/Skill/commands/StructuredOutput/Cron/队列/Worktree/CWD、进程内/显式detached-process Team、SDK runner/transport/JSONL、压缩/memory/interruption；媒体端点/token含CLI/child纯数据传递；Delegate/LSP/ComputerUse显式DI，不自动连接IDE或新增桌面allowlist；结果解包/多模态请求和显式原生渠道client/factory及owned I/O关闭接通，默认不connect/不扫描安装账号。Workflow后台通知/TaskOutput/Stop与关闭barrier已接；CLI有--web-endpoint/独立web token、--team-backend及--serve --teammate-mode入口。默认按原env gate/in-process，close先停止本次SDK/PID再清理Team。子进程预热/trace/审批/minimal loopback Gateway明确为host adapter；完整产品CLI/JSON view/Gateway/ACP/classifier/MCP权限/渠道自动连接/配置UI/安全服务与其余宿主分支待补 |
|    8 | ComputerUse / multimodal | 原handler、命令协议与结果/请求主链已接入 | 第45个handler，14动作/Zod3/完整说明、macOS命令/共享缩放/cliclick缓存/错误文案保留；priority7工具结果/MCP转换、请求清理/图片数组/MIME恢复。1,028次固定SHA差分+18项专项，真实SDK到本地HTTP的截图回注闭环使用全假桌面I/O；真实OS授权/视觉质量、Telemetry/UI仍未验证或恢复 |
|    8 | WeChat/WeCom channels | 工具/bridge及原client协议接入 | bridge/manager/审批1,810次差分+29项专项；新增client/API/auth/media/store/factory/registry/watchdog，1,016次差分+29项专项。显式native opt-in/手动connect，真实loopback HTTP/WS/SDK闭环。真实服务/TLS、自动连接middleware/UI、完整ChannelSecurityManager未验证或未恢复；原依赖风险另列 |

## 不能宣称 100% 的部分

通用Hook最新进度：六个完整原类（Manager/Executor/Prompt/Scoped/Session/Tool）和原工具执行wrapper已移植，默认createHarness现接会话/工具/子Agent/Task/compact/Worktree/InstructionsLoaded，shell发现/匹配谓词/watchPaths已补。表内早期“执行器待补”不再指这些核心类缺失；完整ToolPermissionService/SDK审批前缓存、MCP elicitation/输出替换、service proxy及产品Startup/插件服务仍有缺口。旧session facade保留兼容但不是默认路径，不能把它和native实现混同。

两套回复handler/完整bridge/manager/审批和原client/API/auth/media/store/factory/registry均已接入，47个名称都有handler；仍不等于完整harness达到100%。仅受控本地HTTP/WS和自有凭证验证，真实服务认证/TLS/全部平台兼容未证明；完整ChannelSecurityManager/MCP通知校验、RemoteControl自动连接middleware/配置UI/代理与telemetry、AgentManager核心现已恢复，但完整ProductManager/PluginRuntimeRefreshService仍有缺口。guard allow_always只放行本次，不代表原持久审批规则已补齐。

媒体新增第42–44个handler ImageGen/ImageEdit/VideoGen、完整ImageService/VideoService方法与ImageToolHookInputProcessor。370次原类/包内schema转换器差分+19项专项，真实SDK默认deferred图片/视频及显式legacy编辑、独立CLI协议/权限/落盘验证通过；原ImageEdit不暴露、feature/model-tag、schema/Prompt和Agent allowlist不变。默认REST为显式fetch适配，不等同原RestOperations/Axios全拦截器、认证刷新/产品进度UI；Hook输入类未伪装成已接完整Hook/图片rehydration/blob管线。

LSP作为第41个handler已恢复：工具九种operation/schema/原格式，完整Client的stdio/握手/反向消息/文档打开/归一化/关闭，Manager注册/懒启动/coalescing/重试/状态/插件reload/warmup/drain，711次差分+16项专项。原19个Agent均不声明LSP，不扩大默认allowlist；插件来源与工作目录显式DI。仅本工程fixture语言进程和显式SDK注册验证，完整产品插件loader/startup/reload宿主、真实第三方服务兼容、真实Windows进程和全部竞态仍未完成。

- 48条工具声明含重复Agent，实际47个不同名称均已注册handler。名称覆盖不是整体harness或各handler全宿主分支100%；渠道真实服务/完整安全校验、插件、权限分类、完整CLI/UI等仍有下述缺口。
- 渠道沿原保留全局最后上下文/FIFO审批/不绑定答复chat、WeCom未知路由可复用旧chatid、客户端/实例fallback、重复connected计数、@mention只取末词、2abc选项解析、dataURL按basename误判、仅local>20MiB检查、远端body无大小限制/完整截止时间。注册settings/allowed-list不是全部入站/工具发送授权；只允许可信客户端和消息源。关闭时订阅/timer/迟到发送守卫与入站SDK流abort/barrier是独立host ownership适配，不是原类新增的方法。
- ComputerUse是普通function tool，不是SDK内置computer tool，原19个Agent不暴露；Darwin+精确env gate之外仍要宿主审批。其低层execute不检查gate/abort，wait不可取消，cliclick负缓存/并发null、跨调用缩放、同毫秒截图覆盖均保留。独立host的stateDir/每harness工厂是明确适配，未操作真实桌面/授权/依赖安装。原工具结果及模型请求处理器已恢复，仍不等于全部输入处理链、mandatory分类器或UI/遥测；自定义ModelProvider需自行处理请求。
- Delegate只有显式内存connection/注册依赖注入，不自动连接IDE或冒充完整ACP。单一全局connection、空session、ID毫秒碰撞、inputSchema仅说明、父取消/断开不取消pending、timeout只透传、旧provider索引与clearTools不通知均保留原行为；默认宿主审批不受客户端requiresApproval=false绕过。当前cache仅覆盖Delegate，不冒充完整ToolSearch fingerprint/插件描述生命周期。
- 媒体保留原边界：输出目录在参数检查前创建、mkdir不在catch内、共享outputDir并发覆盖、秒级同名文件覆盖/部分写入、后缀不代表编码、MIME按扩展名、raw-base64排斥斜杠、dataURL内容不验证、相对输入按process CWD。HTTP输入/下载不走WebFetch策略、视频10分钟门槛不能中断挂起请求、sleep listener残留；配置会导致本地文件上传，只接受可信端点/配置并保留宿主审批。产品media凭证与模型key/web token分开，真实服务认证/生成质量和codec、完整原REST/代理/mandatory权限/所有故障仍待补。
- LSP原边界保留：外层server key决定languageId、覆盖不清旧extension/旧client、maxRestarts=0回退3、运行崩溃保留manager旧status/下次lazy获取才重启；didOpen只发送一次/version1不刷新、LocationLink数组被filter丢弃、hover只取第一项并将MarkupContent按plaintext格式化；500ms+1000ms启动门槛，startupTimeout不覆盖initialize/请求、父abort无JSON-RPC取消、shutdown未清败选timer、cleanup不等进程退出且无PID失败对象保留。独立host关闭清本次identity gate/owned clients以释放请求、防止重启，是单独适配；不提供可信进程隔离，不自动装服务或修改CLI/原Agent声明。
- Web工具保留非安全边界：不解析DNS、IPv6括号/映射缺口、策略配置early allow、请求后才拒跨host重定向、URL-only跨会话缓存、WebSearch父abort不传播、fetch头部timeout不涵盖全部body、API父abort listener未移除；不宣称SSRF防护/安全沙箱。网页服务endpoint/token需显式配置，模型key不复用；主题色/客户端信息/无遥测默认与依赖注入为宿主适配。完整BashSandboxManager及命令/文件策略应用、原产品认证和远端服务内部实现不在本批完成范围。
- Agent 同步委派、子会话恢复、Worktree 隔离、进程内/显式 detached-process Team 与会话错误恢复已验证；SubagentThrottleRetry/停滞 watchdog 属于 Workflow，已在原 spawner 子链恢复，非普通 AgentTask 的通用重试。Team 协议类不代表完整 Gateway/ACP/UI/所有 Plan approval 状态/权限分支；插件/扩展与MemoryController REST/UI/managed来源等仍待补齐，MemoryManager规则发现/条件注入核心已接入。
- Team inbox 采用原 read-modify-write JSON，无原子并发锁；spawn chain 失败后持续拒绝、低层路径/递归删除/Worktree force fallback 均保留原行为，不等于安全沙箱或全并发状态空间保证。独立宿主 leader/member idle 唤醒复用已有队列 drain，不冒充完整 RichMessageQueueManager/request processors/UI；状态机表和非法迁移已经逐项差分，不代表全组件并发状态空间穷举。
- 外部 Team 原行为保留：TeamMember 默认硬编码 in-process，registry 不自动接入；自然退出的进程成员 isActive 不查 PID；初始发送失败仍留 backend PID map；Runner 只等 runDefault 发布，不等 SDK 完成，SIGTERM 只置 shuttingDown；PermissionBridge findLeaderSession 的团队检查被逗号表达式丢弃，watcher 猴子补丁的 timeout/overlap 清理缺陷仍在；HTTP mailbox 成功坏 JSON 返回 undefined，而权限 client fail closed；IPv6 URL.hostname 带方括号被判远程；SSE 非空历史只重放不订阅、callId 不参与 call_id/id 优先级。独立 host 的 PID ledger/SDK abort-settle/审批 relay/路径与请求大小限制单独标注，不改写原类缺陷。最小 loopback Gateway 无完整 ACP/认证/沙箱，x-codebuddy-request 不是身份认证，不可公网转发。
- 独立 cached resume 清除旧 result、完成后等待 SDK/JSONL、额外 teardown 旧 abort listener 属于 host adapter。当前createHarness返回前已完成原AgentManager eager启动，不再需要调用方getDefault预热来规避旧lazy提示初始化自等待；直接构造Manager须注册工具后start，并close显式宿主订阅。完整产品Startup/PluginRuntimeRefreshService仍未恢复。
- Worktree 原生 Hook 命令执行器、tmux UI、产品启动参数/退出选择、Workflow isolation host 尚未恢复；CWD 的 embedding adapter 与原 process.chdir 明确分开。原 remove 的递归删除 fallback、tracked-file probe 失败放行、porcelain trim/slice 偏差等保留源行为，不能等同于安全边界或所有平台验证。
- WorkBuddy 插件系统、完整 HookEvent/命令执行器、React输入历史/条件规则watchers与产品控制器UI，以及 interruption 的 SDK callback 权限客户端/错误恢复仍有未接入分支。InputHistory服务、八类响应interceptor、业务码映射和aborted-draft/gate/idle-start核心现已移植；真实产品配置刷新/热重建、完整UI/telemetry未因此完成。
- ModelProvider 的 OTel span、Galileo/增长遥测、IOA 默认 header 和 Axios interceptor 侧效应尚未移植；请求/流主路径已经接通。
- Workflow 主运行、Manager/暂停/快照/后台工具/通知、跨 OS 进程 journal cache、原列表/保存命令、ACP progress/print JSON 协议已恢复；产品 React UI、完整 ACP 生命周期/输出视图、SDK tracing host、原内置脚本资源、全部故障/跨进程崩溃恢复与宿主策略仍不完整。暂未定位独立的 WorkflowTraceWriter 类，不以 print handler 冒充 trace writer。低层路径由 host 注入，独立根不冒充产品项目编码。
- 保存命令元数据 prompt 是空字符串，原 CommandInterceptors.isCommand 要求非空，AgentManager 默认仅自动附加 custom/MCP commands；专用 Workflow 改写分支不能据此宣称默认可达。原 `/save-workflow` usage 说支持8位ID，实际 manager不解析前缀；两处原行为均保留。ACP仅取当前异步会话、无owner fallback；print JSON在writer try外序列化，BigInt等序列化错误不被writer catch吞掉。CLI本地分派、显式writer/ACP依赖注入为宿主适配，不补隐式策略或全局stdout副作用。
- Workflow 保留样本可见行为：activity 只看最后工具时间，adapter.abort 仅中止 task.abortController，不保证 watchdog 即停止底层 SDK；root abort racer 结束运行不表示子请求结束。部分 hook 取消后永久 pending；reserve 不预留并发 token、无预算 deduct 不记 spent，reserve 失败还在 semaphore try/finally 外；cache 命中不重写 agent_finished；nested phase 不记录且缺 body 会抛原 TypeError；nested timer 与 root timer 不同。独立 harness close 单独取消/等待仍注册 SDK 任务。Prelude/扫描/Node VM 不是安全隔离，host 构造函数按原暴露，只运行受信任脚本；不声称恢复了额外权限策略或安全沙箱。
- ErrorUtils 本批只恢复重试谓词与相关文案，非整个错误/计费/遥测映射模块。原 null 输入可能触发 TypeError 的谓词边界保留；当前无色独立宿主使用纯文本错误展示，升级链接/ANSI 仍属于外部 presentation adapter。
- 已提供可启动的独立 CLI/bootstrap，验证真实 SDK、原 transport、本地 HTTP SSE 工具调用与跨进程 JSONL resume；不等同于完整 WorkBuddy CLI、所有工具/权限分类器或真实产品服务端验证。
- 服务端策略不在本地安装包中，只能做黑盒兼容。

## 下一批恢复顺序

Workflow 控制层保留原生细节：resolveSession 忽略 ID 只取当前异步会话；snapshot 异步竞态/不存在时回退目录、saveAs 覆盖、recent 仅内存；restartAgent 只取消并记 invalidated；finalizeRun 先复制 detail 再 dispose，并 cancelPending 全 emitter。原工具 args 只接受 string，默认 CLI Agent 不声明 Workflow；独立宿主显式绑定当前会话、检查 disable gate、按 parent 分配 runtime，并等待本次快照/finalizer。generic BackgroundTaskRegistry 的产品 bg-tasks 路径 cleanup 由注入决定，独立 host 不猜测/删除未映射目录。原 notifier 提前置 notified/失败不重试、raw task-id、XML/原提示、busy/ACP drain 分流已恢复，不宣称原桌面队列/全部 shell 通知接线完成。

1. 原ToolPermissionService/SDK审批前PreToolUse缓存及PermissionRequest/Denied接线、MCP自动elicitation/输出替换、Hook服务代理/产品Startup与SessionStart自动首消息。六个完整Hook核心类、默认会话/工具/子Agent/Task/compact/Worktree/InstructionsLoaded、shell发现/匹配谓词/watchPaths已恢复，不重复计数；命令原生无统一abort/rewake支持，不能捏造。MemoryContext/Relevance/Extraction/Stop/Freshness和规则发现/注入、InputHistory、aborted-draft/response gate/idle-start及blob/codec核心已接入；完整媒体/UI接线和Telemetry transport仍待补。
2. ProductManager/config provider、完整插件loader/物化/Extension、PluginRuntimeRefreshService与ToolManager索引/缓存失效生命周期；再补RichMessageQueueManager/deferred processors和Worktree产品入口/Hook/tmux。AgentManager完整类/eager/rebuild/ready及插件组合已恢复，47个registry名称已有handler，仍不等于全产品启动与远端策略恢复。
3. Workflow React UI/产品lifecycle/完整stream-json/tracing宿主、内置脚本资源及崩溃恢复（/workflows、/save-workflow、命令改写、ACP/print事件桥、record/replay主路径已恢复，不重复）；完整生命周期/磁盘故障矩阵待回补。
4. Team 完整 Gateway/ACP/前端视图、跨进程 Plan/权限全状态和真实 tmux 宿主接线（detached/HTTP/SSE/ShutdownCoordinator/failure registry 核心已恢复）。
5. 回补 Bash sandbox/PTY/safe-delete 与 ModelProvider OTel/遥测宿主分支。
6. 接通 DeferExecuteTool 完整 classifier/mandatory-target 服务、透明代理配置解析和 MCP progress/UI broadcast 宿主分支（审批转发控制流已恢复并差分）。

每完成一批都必须满足：`npm run verify:config && npm run check && npm test && npm run build`。

本批证据定位（解码后的 bundle JS offset）：ModelConfig 类 `7122560..7126281`；loop detector 类 `7207144..7210301`，marker 定义 module `40038`。`verify:model-config` 972 组与 `verify:loop` 1,411 组差分均通过；这些计数不涵盖完整业务状态空间，不宣称全 harness 100%。

本批新增证据：AgentTaskManager `6938245..6948289`；Agent `11853702..11868971`；TaskOutput `11871294..11877034`；TaskCreate `11878834..11881602`；TaskGet `11882713..11884149`；TaskUpdate `11886284..11888544`；TaskList `11889858..11891561`；KillShell `11907242..11908295`；TaskStop `11909163..11911279`；TaskStorage `12177331..12180570`。`verify:tasks` 在 hash 验证后的 VM 目标类与重建实现之间执行 495 组 schema/CRUD/持久化/结果/fork Prompt 等比较；不覆盖完整 Team/worktree/异常状态空间。

本批新增证据：PlanStorage `12170604..12172463`；PlanStrategy `11577909..11579866`；Enter `11893642..11895876`；Exit `11898187..11903027`；Ask `11500785..11504469`；AskService `7222438..7228156`；Defer `12008364..12018235`；PromptContext `7698068` 起；PromptVars `7755614..7758563`；SystemReminder `7148490..7155494`；UserQueryWrapper `7120151..7120981`；Env `7098273..7098467`；SkipRun `7116734..7117040`。`verify:interaction` 对 hash 固定的样本目标类做 1,438 组 schema/行为比较；所有 Prompt 模板和原始配置继续逐字节保留，不把有限差分称作全分支 100%。

最新证据：Skill `11919499..11926988`；SlashCommand `11914165..11917177`；CustomCommandRenderer `7649414..7650992`；Workspace SkillProductProvider `9921736..9926463`；ReferenceService `9942584..9945696`；CommandManager `7542703` 起；ToolManager 描述预算在 `11657350..11681925` 类内；builtin declarations `7528426` 与 conditional `7537267` 起。`verify:skills` 在固定 hash 原始目标类与重建实现之间通过 536 组比较，涵盖 handler/schema/结果、fork 配置/错误、渲染、元数据、预算、扫描、变量、命令 local history、引用 token 截断。新配置 `config/recovered-builtin-commands.json` 是原始声明的求值数据，不替换或修改 `config/original`；PRODUCT_NAME=CodeBuddy 已核对目标模块常量。

最新证据：SkillManage `11929601..11938484`；NotebookEdit `11844914..11851712`；StructuredOutput `11998971..12000593`；StructuredOutputStopHook `8484193..8485073`；SessionStartHook `8486296` 起；ContextImpl `8962324..8962707`、Factory `8962715..8963017`；feedback template module `54954`。`verify:management-output` 753 组对照涵盖参数/错误、registry/list/template/文案、Notebook 持久化结果、schema/context/Start/Stop Hook；排除 telemetry/sandbox 的原生宿主副作用。

最新证据：Cron helper module `48935`（`7847494` 起）、state `7853292..7854715`、storage `7854929` 起、scheduler `8433274..8436873`、service `8437554..8439536`；CronCreate `12061370..12063241`、Delete `12064081..12064779`、List `12065615..12066616`；MessageQueueManager `11093993..11096012`、QueueDispatchUtils `13351509..13352372`，MessageQueue interceptor 在 `7117655` 前后。`verify:cron` 在固定 hash 的原模块/类与重建实现之间通过 1,442 组比较，涵盖 schema/文案、解析/时间/jitter、内存与 durable 状态、存储/lock、owner retry/missed/最后触发、队列编辑/图片合并与 legacy/deferred interceptor。Timer/owner 测试使用可控 clock/storage，不启动真实产品或外部服务。

最新证据：WorktreeService `13413904..13418608`；SessionManager `13422043..13428097`；Initializer `13430239..13434960`；ChangeDetector `13435488..13436847`；NameGenerator `13437640..13437912`；PRParser `13438636..13439095`；CwdService `13441020..13441541`；ContextInterceptor `13442613..13443444`；Enter `12056034..12057158`；Leave `12058504..12060359`。`verify:worktree` 在 hash 固定原类与重建实现之间通过 1,519 组比较，覆盖 schema/文案/PR/命名/CWD、初始化/变更检测、base branch/Git 命令序列、create/reuse/list/remove fallback、session/Hook payload/退出与逐字 context prompt。Git 网络操作以 stub 差分、真实 Git SDK 链路只在临时仓库测试；不覆盖原生 Hook executor、tmux UI 与 Bun.Glob 全平台语义。

最新证据：TeamManager `8378071..8383696`；TeamCreate `12185238..12187024`；TeamDelete `12043568..12045075`；SendMessage `12045874..12054922`；TeamMember `6995005..7004426`；Registry `7004450..7005055`；InProcess backend `6989786..6991010`；ShutdownCoordinator `6992109..6994648`；leader polling `12182179..12185238`；TeamContext `7180171..7183219`；Worktree cleanup `8388023..8389368`；Agent spawn 在 `11853702..11868971` 类内。`verify:team` 对 hash 固定原类与恢复实现通过 1,432 组比较，涵盖 schema/文案/文件/身份/协议、backend/成员 spawn/respawn/状态、关闭回应/超时、派生重名/回滚/失败 chain、leader 收件/roster Prompt 和 Worktree cleanup。SDK 原配置继续逐字节验证；不覆盖真实 detached-process/HTTP 服务或所有竞态。

最新证据：RunState types module `71389`；完整状态表 `11165469..11173010`，类 `11173014..11178903`，runState property `10995874` 起；AgentFactory `7063971..7065964`；AgentTask `6952421..6977558`，错误 helper `6949040` 起、resume meta `6951242` 起；RunResultUtils `13255534` 起；失败提示函数 `7184359` 起、interceptor `7185305..7186430`；工具参数重写规则 `11892453` 起、MCP context module `80539`。`verify:lifecycle` 对固定 hash 样本做 7,358 次比较，包含 13×21（含无效事件）×3 metadata 矩阵的结果/副作用/日志/派生读数、subject 去重、bypass/旧 RunContext、完成/错误/取消/压缩/retry 分支、原错误 rethrow/严格 silentAbort、恢复 metadata、脱敏/分类/TTL/逐字提示与重写/context。此数量是断言比较次数，非 7,358 个独立场景；真实退避重试、压缩全部竞态和 detached-process 仍不在覆盖承诺内。

新增证据：InterruptionService 原类 `11047102..11089570`（重点为 waitFor 的成功/错误完成路径、marker/计数方法）；ErrorUtils 重试谓词/format `13075544` 起，timeout 类型 `9382292` 前后。`verify:recovery-retry` 对固定 hash 样本通过 2,801 次比较，覆盖 network/timeout/empty stream/syntax/model/wrapped/deferred/auth/cancel、pending call/窗口/child/silentAbort/abort/legacy-deferred dispatch、原顺序/metadata/Prompt/Stop Hook 通知边界及 helper 状态判定；engine TypeError 仅比较类型，不比较含压缩局部变量名的引擎消息。

新增证据：Workflow errors/concurrency `8694784` 起；preamble 常量 `8700757`、builder `8701265` 起；WorktreeIsolation `8858551..8859533`；schema retry `8859575..8860184`、validator `8860325` 起、validation error `8862119` 起；abort bridge `8862343`、watchdog `8862692..8863355`、throttle `8863448..8864297`、sleep `8864298` 起；spawner `8865193..8867173`；AgentTaskExecution `8868809..8870571`、preview helper `8870950` 前后。`verify:workflow-subagents` 通过 1,139 次原类比较，覆盖错误码/常量、abort/watchdog/fake clock、限流门槛与 45s 单次重试、sleep-abort、schema parse/defaults/失败/correction、逐字 preamble、Worktree release、metrics/cleanup/abort forwarding 与 spawner 重试顺序；不覆盖完整 Workflow 主脚本/持久化/沙箱。

本批实测：211 项测试通过；编译 JS 上 `smoke:runtime` 133 项通过，CLI --help 启动通过。新增 23 项：普通会话网络恢复/上限/真实 SDK deferred-tool 纠正/首 token timeout/子任务不误报失败，Workflow throttle/watchdog/abort/schema/Prompt/Worktree/adapter，以及 SDK schema 纠正与真实 Git 隔离 Read。全量测试中发现无 socket 的 mock 流遇到原 unref timeout 会提前退出；仅为该测试增加存活句柄，运行时计时器语义未改。此前各模块测试与差分全部回归；SDK 保持 0.5.2，全部离线或 loopback，不读取宿主凭证，有限测试不等于完整 harness 100%。

最新外部 Team 证据：DetachedProcess backend `8401515..8403168`；tmux `8403979..8407658`；registry `8408738..8409549`；PermissionBridgeClient `8410552..8412136`；Runner `8412968..8417181`；PermissionBridgeService `8418746..8422004`；mailbox/HTTP/factory `8422800` 起；DetachedMemberSseBridge `8282427..8289110`；DaemonProcessManager `8975002..8978316`；REST response helpers `10151569` 起，permission/team controllers `10469300`/`10471700` 前后。`verify:team-external` 对固定 SHA 样本执行 1,021 次参数/env/信号/失败顺序、模拟 tmux、transport 分类/HTTP header/timeout/响应、审批/取消/逗号表达式、SSE 转换与 Runner 格式比较；控制器以实际 loopback HTTP 验证，不把宿主 adapter 或所有异步竞态计入原类差分。

最新实测：224 项全量测试、146 项编译 JS smoke，新增 13 项外部 Team 专项；真实 fork 验证初始任务→leader Read 审批→结果/后续 mailbox→shutdown→历史/父 Team 保留、活动请求中 close 及发送失败 PID 清理。源码 TS fork 的 tsx loader 解析为绝对路径，编译 JS fork 不依赖 tsx；子入口补齐原 Startup 的默认 Agent 预热前提。SDK 仍为 0.5.2，原配置与 115 Prompt 不变。下一主缺口是 Workflow 主执行器/编译器/沙箱及剩余工具，而非重复恢复已验证 Team 子链。

最新 Workflow 主链证据：Semaphore `8697308..8697995`；runtime prelude `8698413..8700101`；Execution `8702580..8713535` 与 preview/format helpers；CallDurability `8714923..8716595`；factory `8717151..8717811`；resolver `8719312..8722229`；parser `8846075..8851731`（样本 Acorn 8.16.0）；compiler `8852562..8856864`；progress `8857538..8858372`；NestedRunner `8871665..8873121`；AbortRacer `8873145..8873565`；AbortAwareTimer `8873671..8874761`；SandboxBuilder `8874789..8875787`；Runner `8876331..8880561`；hasher `8882430..8882702`；budget `8883418..8883883`；FileJournal/factory/snapshot `8884575` 起；RecordWriter `8886966..8887483`；registry/meta-head helpers `8888365` 起。`verify:workflow-core` 对固定 SHA 原类执行 1,412 次比较，涵盖解析/错误位置/offset、原 prelude 字符串、扫描启发式/包装、Agent/cache/phase/事件、parallel/pipeline、budget/hash/journal 投影、root/nested VM、resolver、abort/timer 与 meta helper；不是所有 UI/持久化故障/并发状态空间。

最新实测：241 项测试通过、163 项编译 JS smoke，新增 17 项 Workflow 核心测试；真实 SDK 完成编译脚本→结构化子 Agent→journal 落盘→resume/cache 不重复模型调用，并验证 root abort 和实际 SDK 子任务取消的不同边界。主运行类已替换早期猜测骨架（包括 hook 签名），独立入口为 createWorkflowRuntime；当前 handler 数仍为 36/47。SDK 0.5.2、六份配置与 115 Prompt 保持不变；尚未完成整个 harness。

最新 Workflow 控制层证据：PauseGate `8902629..8903230`；Manager `8903785..8910018`，SAFE_NAME_RE 在其后；StaticBuiltinWorkflowProvider `8892273..8893039`；WorkflowTool `12164717..12168718`；BackgroundTaskNotifier `6983141..6985756`；ToolManager generic background methods `11671594` 起；TruncateBuffer `11320355` 起；disable helper `13411199` 起。固定 SHA 的 `verify:workflow-control` 通过 536 次 schema/原文、pause/abort、Manager start/参数/状态/进度/detail/finalize、通知 XML/meta/去重/drain、tool 立即返回/最终输出/状态/callId、buffer/TTL 比较。快照/saveAs/builtin 文件协议由真实临时目录测试，不把全部宿主 UI/竞态算入差分。

最新实测：255 项全量测试、177 项编译 JS smoke，新增 14 项控制层测试。真实 SDK 通过原 DeferExecuteTool→Workflow 后台执行→子 Agent→最终文件/通知→leader idle 续跑，输出保留原 Agent ID 尾注；真实新 Node 进程从旧 journal 恢复、命中 cache 且不调用模型。TaskOutput/Stop、关闭收尾和直接/deferred 禁用 gate 已验证，handler 数为 37/47；SDK 0.5.2、全部原配置/Prompt 不变。目标仍未全部完成。

最新命令/事件桥证据：CommandInterceptors `7088984..7093909`（AgentSwitch priority1600）；AgentManager.getCommands `7043292` 起；WorkflowsCommandExecutor `7662202..7663498`、formatElapsed 紧随；SaveWorkflowCommandExecutor `7665117..7667019`；WorkflowAcpBridge `8893656..8895753`；WorkflowPrintModeHandler `8897019..8898409`；CommandMessageUtils `13045260..13049605`。`verify:workflow-presentation` 在固定 SHA 原类 VM 中通过1,488次比较：caveat原文字面量、完整XML构造/解析、命令/Skill/channel/agent/model/allowedTools/保存专用指令、列表/参数/原usage/history、ACP与print字段矩阵、订阅/取消/当前会话与连接/错误门槛。数量为断言比较次数，不是独立场景数。

最新实测：269项全量测试、191项编译JS smoke，新增14项命令/事件桥专项。验证本地列表/保存不请求模型、完整ID/空prompt缺陷、保存刷新与跨宿主历史恢复、真实SDK改写、显式executor覆盖、ACP/print/关闭取消订阅、编译CLI `-p /workflows` 和 `-p /save-workflow`。全部旧差分、check/build/help与原配置校验通过。37/47 handler、SDK0.5.2和115个原Prompt保持不变；当前仍不宣称完整harness达到100%。

最新录制/重放证据：RecordingStoreImpl `9009857..9012563`、RecordingModel `9012653..9013585`、serializeRequest紧随、ReplayModel `9013666..9014705`、ReplayExhaustedError `9014731..9014999`、ReplayTypeMismatchError `9015028..9015276`、RecordReplayModelProvider `9015846..9016315`、配置module26314（`9941xxx`）。`verify:record-replay` 固定SHA后通过2,282次比较，包含env真值/互斥、原metadata五键、signal剔除/错误/提前停流/事件顺序、Replay类型/耗尽/模型strict/倍率timer、queue分布/peek/consume/回退/close、Provider日志与路由，并对原类与重建类分别执行真实临时文件I/O、坏文件/初始化错误/metadata回填。数量是断言次数，不是独立业务场景。

本批纠正早期错误兼容逻辑：原strict仅校验modelName，不比较请求；speed是offset差值除倍率，不是每事件固定sleep；RecordingModel构造顺序delegate/modelName/store；原Store不使用turn-object append/next接口。已按原重建完整类和协议，不保留不符合样本的旧接口。SDK0.5.2未改写。Store首次使用覆盖recording.jsonl、仅剔除signal、无敏感信息脱敏；加载接受任意metadata.replayEnv键回填空值，坏文件首次失败即置initialized，close不重置队列/标志；同模型并发响应按完成/落盘顺序重放，均保留源行为。recordReplayEnv是显式宿主DI，不冒充完整process env隔离或安全策略。

最新实测：282项全量测试、204项编译JS smoke，新增13项录制/重放专项；真实SDK录制工具回合后，在无API key/baseURL的全新CLI进程重放、显式批准并重新执行Write。权限缺失时相同录制不会写文件；不同prompt仍可返回旧模型输出，验证非request严格匹配/非dry-run边界。全部旧差分、配置/check/build/help回归通过；仍为37/47 handler，完整harness目标未全部完成。

最新网页工具证据：WebFetch `11809212..11824073`（static cache在后）；helper/limits/schema `118079xx`起；WebSearch `11827419..11831956`（schema紧前）；IOAUtils `13282850..13283616`、常量module24618；Security Center translator module71445 `15624xxx..15626xxx`；parse/read managed policy `73258xx..73265xx`；BashSandboxManager.loadConfig `7331106`起的网络合并分支。主handler方法体机械移植后添加TypeScript注解/显式DI，原内嵌fallbackPrompt未改写。`verify:web-tools` 固定SHA后通过544次比较，包含schema/原常量/header值、URL/domain/IP/HTML/meta/逐字Prompt、cache边界、API优先竞跑/长度门槛、网络策略/请求体/结果/错误、AI回退、IOA与托管策略矩阵；数量是断言次数，不是独立场景数。所有真实产品远端服务均未调用。

最新实测：297项全量测试、219项编译JS smoke，新增15项网页工具专项。真实SDK默认WebSearch访问本地产品协议端点，WebFetch本地HTML经真实contentAnalyzer回合后返回父会话；新CLI进程可单独配置web端点/token并重放工具请求，工具审批仍开启。Security Center V3/V2/file优先级与托管网络覆盖已接入默认projection，完整Sandbox lifecycle/文件/命令执行仍待补。补齐standalone detached child的纯数据web端点/token传递；不序列化内存callbacks。修正Team fixture teardown：先close/等待本次runtime，再删临时目录，未更改原Team调度。此前全部差分、配置/check/build/help回归通过，原配置/115个Prompt与SDK0.5.2不变。当前39/47 handler，仍不满足完整harness全部还原的完成条件。

最新Delegate证据：Manager `8375029..8377400`；schema紧前/handler `12067549..12068556`；ACP handleDelegateToolsChanged `6905059..6906164`；ToolManager描述注入 `11665171` 起、callback/invalidate `11679936..116808xx`；AgentManager.getAll `7043xxx`。`verify:delegate` 固定SHA后通过282次比较，覆盖原包实际schema转换器、注册/覆盖/索引/清理/通知失败、连接/timeout/status/异常、嵌套结果/raw getter读取次数、ACP变更/部分注册、描述变量/刷新缓存/Agent列表。Zod3.25.67别名与转换器3.25.2并存SDK的Zod4；转换器实际JSON已与包内版本一致，不承诺整个转换库版本或全输入等价。

最新实测：312项全量测试、234项编译JS smoke，新增15项Delegate专项，真实SDK模型回合经内存客户端转发原样输入并回注结果、验证默认审批、Agent identity/model保持与关闭清理；无真实IDE/外部产品服务或凭证访问。修正旧Bash测试固定80ms等待假设，改等实际任务完成，运行时未改。全部19个差分脚本、配置/check/build/help通过；40/47 handler，SDK0.5.2、六份原配置和115 Prompt不变。完整ACP/UI、剩余工具及其他宿主缺口继续推进，整体目标未完成。

最新LSP证据：类型/枚举module12490 `9146380`起；resolveCommand/helper紧前；Client `11971809..11982082`；Manager `11983089..11990110`；schema `119914xx`起/Tool `11992011..11997772`；PathUtils文件解析/normalize/unixToWindows `13336036`起。`verify:lsp` 固定SHA后在VM装载原类/包内schema转换器，711次比较涵盖schema/coerce/坐标、九种operation与原文/50截断、符号/Location/hover/completion归一、workspace root优先级、完整初始化参数/服务端反向请求与通知、document-open缓存/缺连接/读失败、Windows where过滤/启动spawn env/固定时序、注册/旧映射/无效配置/重试与Manager状态、shutdown/cleanup/timer残留及路径。数量是断言比较次数，不等于711个独立场景；引擎TypeError比较类型，不比较含局部变量名的消息。

最新实测：328项全量测试、250项编译JS smoke，新增16项LSP专项。真实stdio fixture子进程完成initialize/服务端configuration请求与capability/progress ack、didOpen一次快照、九操作相关调用、崩溃后lazy重启、startupTimeout/挂起request关闭、missing executable/unsupported transport；显式SDK注册调用LSP并回注结果，原19 Agent均不声明它的边界不变。standalone close额外清本次注册identity gate、清理owned clients（含被覆盖者）以解除初始化/SDK等待和避免关闭时重启，不改原Manager/Client类。20个差分脚本、配置/check/build/CLI help回归通过，41/47 handler。SDK0.5.2、六份原配置和115 Prompt不变；完整plugin loader/lifecycle、真实第三方语言服务兼容与Windows进程、其余6工具和其他宿主缺口仍待推进，整体目标保持未完成。

最新媒体证据：ImageGen `12001889..12004324`；ImageEdit `12021234..12023170`；ImageService `12024390..12031124`；VideoGen `12033776..12035596`；VideoService `12037069..12041876`，poll interval5000/max600000与Kling fallback常量紧前；BaseImageParameters/ImageEditExtendParameters及4个tag在module57651 `121969xx`附近；image PostToolUse输入processor `85064xx`附近；对应env常量module在`11219xxx`附近。完整ToolNames 53项字符串表也已保留并比较，含未进入47-name产品registry的legacy名称，不将常量声明当成handler实现。

`verify:media`固定SHA后通过370次原类/包内schema转换器比较：原schema/描述、常量表、feature/env/model gate、四tag优先级、Hunyuan/Gemini/其他请求分流、图片输入/MIME/HTTP/错误、服务认证/response与submit/poll边界、原handler result/renderer、Hook输入以及受控临时文件命名/内容。方法体机械移植后加TS注解/显式runtime，类型别名同时保留BaseImageParameters/ImageEditExtendParameters。不是370个独立场景，也不覆盖完整产品RestOperations/认证刷新/图片重注入/全I/O并发故障。

最新实测：347项全量测试、269项编译JS smoke，新增19项媒体专项：真实SDK默认deferred ImageGen/VideoGen、显式SDK legacy ImageEdit（仅内存feature/model overlay）、CLI无模型凭证重放后调用本地产品协议服务、权限守卫、分离media token、HTTP输入与本地输出、目录竞态/同名覆盖、错误/MIME/视频轮询/取消/sleep listener与Hook输入。测试字节不代表实际图片/视频编码或生成质量；未调用真实产品媒体服务。CLI新增--media-endpoint/WORKBUDDY_HARNESS_MEDIA_ACCESS_TOKEN并向detached child只传纯数据；SDK0.5.2/六份原配置/115 Prompt不变。21个差分脚本、配置/check/build/help回归通过，当前44个handler覆盖47-name产品registry，仍缺ComputerUse/WeChatReply/WeComReply及多项宿主分支，整体目标未完成。

## ComputerUse与多模态结果恢复批次

原工具类 `12149394..12152228`、执行器从 `function isDarwin`（12137xxx）至computer_use_tool_decorate、schema/validation从 `let u2`（121476xx）至 `let u4=class`；坐标/键表/AppleScript/Quartz脚本、14动作、描述/renderer/错误字符串均来自固定SHA样本。此处偏移均为JS字符串UTF-16索引。PathUtils.getHomeDir在13330739附近，保留非空CODEBUDDY_CONFIG_DIR原值，否则homedir/.codebuddy；独立host只映射自身stateDir。原19个Agent不声明ComputerUse，未更改原配置或启用默认工具；普通function tool继续使用SDK0.5.2。系统依赖不内嵌、不自动安装，不直接调用当前桌面验证。

截图先screencapture，再并行探测原图/Finder尺寸，sips最长边1280/JPEG75，最后压缩图尺寸更新共享scale。压缩失败继续、探测失败1:1、cliclick一次检测的正/负缓存及并发null、截屏同毫秒覆盖/无清理、鼠标参数缩放但返回坐标未缩放、cursor原值、AppleScript fallback与Quartz滚动、hold/wait clamp/超时、无父abort都按原实现。schema动作字段可选与handler后验校验不合并；handler screenshot无display参数，即使底层支持。execute不替代gate或审批；直接调用是不受保护的底层接口。

补回截图依赖而非仅接handler：FunctionCallResultAgentInputItemProcessor `11041906..11044215`、ToolResult.is/from（121923xx）、ToolMessageModelRequestProcessor `8559013..8561670`、ImageUtils magic-bytes/base64检测（13202xxx起）。完整工具结果留在providerData.toolResult，output只解包一次；MCP input_text/image/file逆转换、空text过滤；请求移除无效tool-call/result配对、私有toolResult、空消息/末尾assistant，图片字符串数组转image_url。保留原null/type/name异常边界和blob-ref优先级，不凭猜测补name或统一吞异常。ModelProvider.normalizeNewToolResults不再为空，并在getModel时处理最新结果；SessionManager历史复制与SDK raw共享providerData避免二次解包是host兼容处理。完整DefaultInputItemProcessor/FunctionCall processor、telemetry、ImageFilter/Rehydration/blob服务尚未全接，不能据此宣称所有媒体管线完成。

`verify:computer-use`通过1,028次固定SHA原类/包内schema转换器比较：schema/验证/gate、所有动作/键脚本、命令参数/时序/scale、平台/cache、权限/读取错误、工具结果/MCP/请求清理/blob优先级和MIME。不是1,028个独立场景，也未穷举所有并发/平台故障。18项专项含真实SDK+真实模型transport+本地HTTP服务的截图回注：下一次请求确为image_url数组，历史记录可持久化；所有execFile/mkdir/截图readFile/timer均为假实现，只使用受控fixture字节。未读取屏幕、输入键鼠、变更系统权限或访问真实模型/产品服务，未验证真实JPEG编码/视觉识别/远端接受能力。

本批最新实测：365项全量测试、287项编译JS smoke；22个差分脚本全部回归，check/build/原配置校验与编译CLI help通过。45/47个handler已接，仍缺WeChatReply/WeComReply及上表宿主分支；115个Prompt/六份配置/原Agent allowlist/SDK0.5.2不变。旧Delegate测试仅纠正期望的结果解包层级，旧TaskCreate历史fixture补齐原协议必需name；未放宽运行时错误边界。整体目标保持进行中。

## WeChat/WeCom channel恢复批次

固定SHA样本证据（均为JS UTF-16偏移）：WeChatReply `12068622..12072932`，WeComReply `12073361..12076598`；WechatChannelBridge `9955951..9970590`，WecomBotChannelBridge `9995529..10011968`；ChannelManager `7360067..7363197`，ChannelPermissionAdapter `7366430..7367715`；protocol/schema模块37402从7357294起，channel instructions为两bridge前的eT/eM常量。原handler/bridge方法机械移植，仅加TS/显式runtime；动态AgentService导入仍保留Promise.then/await边界。两份逐字channel提示独立于原115个product prompts；SDK继续锁0.5.2，六份JSON及Prompt内容未改。

两个工具的schema可选字段、isEnabled任一connected、needsApproval=false、不同返回/错误文本原样保留。WeChat的chat_id验证/误拼接分支/token短值检查、图像caption合发/普通文件先text后file（不回滚）；WeCom的local→remote→image→text优先级、media时忽略caption、20MiB仅local检查、extension判型/dataURL filename怪异值、30s fetch/path回退与uploadMedia/sendMediaMessage参数均恢复。低层handler不替代宿主审批，发送本地文件会交给客户端，不是安全文件沙箱。

完整bridge包含客户端订阅/连接注册/刷新、实例rename（WeChat）、原路由/解析/context、permission/Ask/suggestion、逐字中文确认/格式化、群聊前缀、用户channel XML/meta/附件、busy队列/idle AgentService唤醒、WeCom local命令/TUI-only清单、combine输出收集与错误。原CLI声明两工具不变；WeCom连接会修改已构造Agent内存tools并刷新，WeChat只刷新。全局FIFO许可不绑定chat、未知输入deny+1s转发（丢媒体meta）、Ask numeric prefix/@mention末词、建议替换/跨session取消、last route/首connected fallback等缺陷未擅自修复。

ChannelManager注册capabilities/permission relay、settings/allowed/development-channel解析、广播/FIFO消费；审批ID原alphabet的5字符、随机碰撞覆盖、无TTL/timeout、cancel只删索引不resolve等恢复。注入工厂为空时不连接、不发消息、两工具不启用。显式`channels.wechat/wecom`接收getAll/get已有可信客户端；不是原factory、账号存储或传输实现。接已有SystemReminder channelServers源和InterruptionService relay；独立host额外处理普通guard内人工等待/abort/local callback竞争、SDK Ask审批一次性guard授权、订阅/计时器/迟到发送关闭守卫、入站所有者SDK流abort与完成barrier，不断开调用方客户端，也不改变原run发布流后返回的边界。guard的allow_always只作用本次，持久审批服务仍缺。

WeCom连接刷新暴露此前lazy AgentManager.ready把“任一缓存Agent”当ready，造成Explore先构造后CLI描述渲染等待自身。原AgentManager `7025572..7059651` 中_ready独立初始化false、rebuild结束才置true；独立host现映射为默认Agent已缓存才ready，并加真实SDK先Explore/后CLI回归。没有声称原eager构建、rebuild队列、模型readyDeferred/插件热更新已完整恢复。

`verify:channels`通过1,810次固定SHA原类/包内schema转换器比较，涵盖schema/说明/错误/逐字instructions、文件/URL/媒体、路由/连接/rename、事件/唤醒/队列、权限/Ask/建议/本地命令、manager/adapter状态与日志。不是1,810个独立场景，不代表全异步竞态、真实认证/加密协议或系统平台兼容已穷举。29项专项含真实SDK文本/文件、原提示/JSONL、渠道允许/拒绝/abort、Ask暂停/答案回注、原连接后allowlist与磁盘配置不变、入站唤醒/关闭活动流。所有网络、客户端发送/上传均为注入假实现；文件仅本次临时fixture，未读取账号凭证或向真实联系人发消息。

本批最新实测：394项全量测试、316项编译JS smoke，23个差分脚本全部回归，check/build/配置校验/编译CLI help通过。47/47名称handler已接；原SDK/六份配置/115 Prompt保持不变。整体目标仍进行中，下一阶段应恢复原渠道client/factory/registry与传输、核心输入/blob处理和AgentManager/权限/宿主剩余分支，不能以工具名称覆盖宣布完整harness完成。

## 渠道原客户端、认证与媒体协议恢复批次

固定SHA原包（UTF-16索引）：WechatClient `9976556..9987096`，WecomBotClient `10020791..10036952`，WechatApi `9947251..9949214`，LivenessWatchdog `9946223..9946941`，PollWatchdog `9976129..9976483`，WechatClientFactory `9973452..9975439`，WecomBotClientFactory `10015182..10017282`，LongConnectionClientRegistry `10079261..10079689`。辅助模块83782从9946943、3470从9949216、35714从9987098、88795从9990426、20816从9991114、39437从10036954、305从9946024、73196从10515449起。两套原客户端/factory/registry和API/QR/store/加解密/helper/watchdog原方法机械移植，加入TS与显式I/O依赖；原模块级credential/media函数、逐项常量/枚举/DI symbol同时保留，未把factory的getAll/get骨架当真实实现。

WechatApi保留URL/认证/UIN/base_info、UTF8长度、ret/HTTP/JSON/AbortError边界。getupdates45s、sendmessage/getuploadurl15s、getconfig/sendtyping10s；headers返回后即清超时/外部abort监听，body仍可挂起。WechatClient保留QR后_pending→account ID改名/回调、owner lock、poll过滤/type/state、cursor/-14、去重500、退避与typing，disconnect清backoff timer不resolve已等待Promise。caption/image在client中分两条消息，而不是原handler一次sendImageReply就等于单条API消息；文件media_type=3但message item type=4、aes_key采用hex字符串的base64等细节未规范化。

Wechat媒体原AES-128-ECB/PKCS padding、MD5、random filekey/key、getuploadurl优先级、CDN binary/header与raw16/hex32 key解析、temp命名和extensionForType均恢复。full_url/上传地址不做域名/协议/大小/统一timeout隔离，原下载必须有AES key；来源/路径仅可可信，不当成安全文件服务。WeCom媒体保留HTTPS/suffix/redirect:error、plaintext JPEG/PNG/GIF/BMP/WebP优先于aeskey、AES-256-CBC/IV前16/1–32 padding与原STT/mixed文本、错误/落盘/filename规则。

WecomBotClient保留Node ws/Bun选择、subscribe/任意成功响应在connecting时的原判断、req_id pending、stream/chunk/async markdown/media/welcome、消息/事件回调、去重1000、heartbeat30s/watchdog>90s、指数退避和源socket状态。上传512KiB/chunk、100块上限/MD5、三次retry/500–1000ms、空文件init/finish、缺upload/media ID错误保留；普通发送不等待ack。连接30s timer原生不清、pending无socket也会arm、disconnect不总是同步reject pending、error/close/重连及falsy msgid等原边界不被宿主假装修复。Bun日志字面量在机械替换中发现偏差后已恢复，并新增原模块Bun分支差分；真实Bun/Windows宿主仍未验证。

credential store保留instances.json/legacy credentials*.json迁移、共享.tmp/尝试0600/rename、重复/坏文件处理、WeChat pending cleanup/保存开关和账号前8字符清理、WeCom suffix/default env与保存记录来源顺序。QR bot_type3、35s poll/8min总门槛/1s sleep/最多3次refresh、scaned拼写、确认缺字段及缺instanceId的原异常边界均保留；qrcode utf8/M/margin0/version/catch空串和getVersion回退1恢复。WeCom180s/3s配置轮询、中文提示与状态事件恢复。保存为明文，没有新增加密vault/实例名安全校验/跨进程锁，legacy文件不删除；factory加载后默认断开，create/duplicate/remove/rename/index/register行为保持原类。

独立宿主新增`channels.native`和`channelClients`：提供实例/自有credentials可初始化原factory，但仍需显式connect；默认没有客户端，不读已安装应用账号、不连接真实服务。仅显式loadSavedInstances才批量initialize，per-instance原init/connect缺凭证仍会读/迁移独立stateDir；Wechat给定凭证是内存provider overlay，WeCom走原create参数。host native env默认{}，不借用模型/web/media token。原低层模块直接API仍有原home/env默认值，调用方需自行限定范围。批量初始化与原I/O实现不等同完整RemoteControlAutoConnectMiddleware/登录配置UI/代理/安全服务/产品DI bootstrap。

host ownership另跟踪本次自建client/timers/socket构造/HTTP请求：关闭时dispose owned clients、reject pending uploads、clear遗留timer、阻止迟到WS构造和新请求，owned fetch对headers后挂起body也可中止。外部注入client不由native owner disconnect。原类的deadline/锁/退避逻辑未改变；QR/配置/backoff原等待无完整取消协议，纯headers响应的ownership ledger可留到close，关闭不等于撤回已经发送消息。真实SDK取消后仍可能进入model adapter，测试fixture现尊重已aborted signal并拒绝开始新流，未改SDK内部循环去掩盖这个边界。

依赖证据为原cli/package.json qrcode1.5.4及app node_modules/ws8.18.3。新增独立alias ws-native8.18.3，`npm ls`确认SDK原ws8.22.0未被替换，Agents SDK仍0.5.2。此旧ws存在[高危内存耗尽](https://github.com/websockets/ws/security/advisories/GHSA-96hv-2xvq-fx4p)与[未初始化内存泄露](https://github.com/websockets/ws/security/advisories/GHSA-58qx-3vcg-4xpx)告警，本轮npm audit共11项（5 moderate/6 high，含既有依赖）。为还原保留原版本但默认不connect，未自动audit fix改写依赖；不是生产安全背书，也不据此断言原应用Bun原生分支受到同一Node ws问题影响。

`verify:channel-clients`在固定SHA原模块/类之间通过1,016次比较：常量/模块接口、QR/state/错误/迁移、API头/body/ret、CDN上传/密文/解密、CBC padding/URL、内容提取/文案、完整poll/connect/rename/退避/帧、upload retry、watchdog/Node/Bun、factory与registry日志/状态。全部I/O/clock/random/socket边界注入，比较数不是独立业务场景数，不穷举真实平台/协议变化/并发。另29项专项用真实临时凭证文件、本地HTTP QR与long-poll→真实SDK→API回复、本地WebSocket subscribe/callback→SDK→分块上传/发送、pending body/关闭/迟到构造验证。账号/token/key/file均为自有fixture；未访问真实微信/企业微信/模型服务、读取安装账号或发真实联系人消息。真实TLS、服务认证/编码/服务器内部逻辑、产品UI/自动连接/全状态仍未证明。

本批最新实测：423项全量测试、345项编译JS smoke；24个差分脚本全部回归，配置/check/build/编译CLI help通过。47个产品工具名、SDK0.5.2、六份配置/115 Prompt不变。下一阶段优先input/history/blob与原AgentManager/权限/MemoryManager等核心来源和宿主缺口；整体目标保持进行中，未以本批或handler名称覆盖宣称完整harness完成。

## 原生输入处理与图片历史拦截器批次

固定SHA样本的UTF-16区间：Default `11036587..11037814`、ParentIdLinkage `11038139..11039351`、FunctionCall `11039444..11041199`、既有Result `11041906..11044215`、Usage `11044508..11045003`、原公开名ExitPlanModeInputItemProcessor `11045096..11045850`。ImageFilter `7127682..7129711`、Rehydration `7111289..7113649`、Compression `7114393..7115673`；时间helper从10956732、InputItemUtils子集13267xxx/13270xxx、PathUtils13337xxx、SummaryUtils13376xxx，原priority enum111845xx、DI symbol11183391；原provider排序器116xxx。37套工具renderer各自原区间在源码注释保存；PowerShell redactor12173724起。构造改为显式依赖注入，保留方法体/关键字符串/priority/公开方法名；未执行原应用初始化、读取安装账号或访问真实服务。

原六个输入处理器按正priority筛选/降序运行，原Telemetry5未填假实现。Default的Agent仅取result.lastAgent（不是session.agentName fallback）；custom/sub-agent两tag/color、成功compact marker和meta compactType继承；SummaryUtils原case-sensitive提取和case-insensitive envelope探测混用、空白summary不算成功等边界照保留。Parent按原replay compact/系统队友消息规则修复self/missing/cycle并维护lastUserMessageId；子Agent判断依赖storeId差异。普通消息悬空parent不被擅自修正；compact assistant标记不自动等价为用户replay边界。五个时间helper保留零/有限数/无效时间和非对象set边界。

FunctionCall parseDisplayText、SyntaxError discard、非语法错误吞掉与DeferExecuteTool→Workflow预载条件/错误debug完整移植；37份原renderer接入ToolManager，每实例隔离mutable数组。含ToolSearch/Workflow/Cron formatter、路径/URL、PowerShell脱敏。脱敏只作用argumentsDisplayText，raw arguments/录制/其他日志仍可能含敏感信息，不是全链路密钥保护。单属性缺失可能TypeError被吞、formatter返回空串有效、数组跳过、对象/null参数边界均保留。ExitPlanMode调用和结果都按原读取/快照计划，保留Warning与error文案。既有FunctionCallResult工具结果与SDK raw元数据共享路径不变。

ImageFilter默认接入Model900之后、priority850：精确model id且supportsImages严格false才过滤；user input_image、RunState.history、工具output.text JSON数组/单对象image/image_url规则不扩展为递归清理。Compression1075/Rehydration1050方法完整移植，imageHistory.imageUtils/blobService显式依赖后接入并供SessionStore保存图片。保留原先压缩后回填的顺序；reset/no-ref短路、settings/track在try外、JSON blob正则、错误warn、retainRounds nullish默认2/零值等原边界。没有将测试blob/codec依赖写成默认算法；原内容寻址文件布局、轮次保留/placeholder/去重、真实压缩codec及图片工具全链仍待补。

独立宿主明确适配：有pipeline时停用原手工元数据分支，旧直接嵌入构造不传pipeline仍保留兼容分支；工作/主目录经utilities注入，不假装全局process.chdir。SDK流消费者与tool execute并行，新增异步processor曾暴露TaskCreate ordinal竞态；beforeExecute等待session现有history锁，未改原TaskCreate或processor算法。18项专项含SDK Read元数据/usage/JSONL、预载自有Workflow且不执行、unsupported-image过滤、显式测试blob/codec先压缩后回填闭环，既有TaskCreate序号/恢复测试继续通过。

`verify:history-pipeline`现通过1,261次固定SHA差分：原类、独立原helper子集/原enum/原provider过滤排序、37套renderer及redactor、时间helper的返回/错误/变更/调用日志。TypeError对比归一化引擎文案，有限fixture不等于全状态空间或所有坏对象输入证明。25个差分脚本回归通过；本批最新441项全量测试、363项编译JS smoke、check/build/config/编译CLI help通过。SDK0.5.2、六配置和115 Prompt未变。

整体目标继续进行中。下一步优先原blob/压缩codec、aborted-draft/response gate/idle timer与完整InputHistory服务，再推进eager AgentManager、MemoryManager/插件命令等剩余产品宿主；不把可编译启动、handler名称覆盖或本批有限差分当作完整harness已经100%还原。

## 原Blob/图片历史/工具结果外置批次

固定SHA原包UTF-16：BlobStoreImpl `7343391..7344212`、ImageBlobServiceImpl `7345147..7353749`、ToolResultBlobServiceImpl `7355182..7356920`；SessionStore的replaceImageDataWithBlobRef `10982845..10983449`、replaceImageInFunctionCallOutput `10983449..10984924`、externalizeToolResultIfNeeded `10984924..10985512`、externalizeStructuredArrayOutput `10985512..10986118`。PathUtils getBlobsDir/getBlobPath/mimeToExt13331083起，MIME_EXT_MAP13339544起，ImageUtils MIME异步检测13203887起/映射13209024起，FileUtils.formatFileSize13094789起。三个DI symbol原名保留，MAX_VERSIONS_PER_SOURCE=3、50KB阈值、2048 preview、占位/日志原文和方法完整移植，仅增加TS/显式I/O构造边界。

Blob按解码后字节SHA256寻址、前两位分桶、MIME决定扩展名；existsSync命中不重写/不验证现存文件哈希，无原子rename/并发锁。storeFromDataUri保留严格正则（不接受空body/额外charset），storeFromFile按原magic优先/扩展名fallback MIME；空blob存在也因空base64为falsy而回填placeholder。ref.blob_path不决定实际read路径；source/original_filename影响展示。类型守卫只检查type/blob_id字符串，不验证64位hash或可信路径。

图片历史：所有user计轮次、不排skipRun/reminder；按blob_id最后item筛选候选后，对每source留最近三个版本，无source候选单独保留。整item入选可令同item另一旧blob也回填，不改成每blob强去重。user扁平/嵌套input_image、工具output与toolResult内容、image_url中对象/JSON引用均按原轻量规则处理；缺失/旧版/空blob用原placeholder，单个JSON对象不被processContentArray递归展开。new/unchanged/duplicate及source变更分支、重置tracking、JSON正则fallback均保留。

ToolResultBlobService保留env parseInt以及NaN/0/负门槛；shouldExternalize比较UTF-16 length，预览也是code unit切片，并非文案所称UTF-8字节。parent+agent-*路径、普通session路径、spill file envelope/read/cleanupSession与catch边界保留。SessionStore四原方法替代手工近似，外置和图片数组按元素catch/warn继续；fallback仍只匹配长data URI。只缩短output，providerData.toolResult原UI完整内容可能仍大，不宣称全JSONL尺寸上限或完整Bash原生stream-spill接线。

独立host默认创建真实三服务：根目录映射到自己的stateDir/blobs与stateDir/sessions，不自动读产品home/project目录。Rehydration现默认接入；ModelProvider/HTTP请求处理器注入真实ImageBlobService，JSONL保存引用、模型请求仍回填data URI。显式imageHistory.blobService/codec与blobs I/O override保留；不把它们默认当假实现。close不清除外置文件，保留resume；cleanupSession只作为显式低层方法存在。完整产品项目目录编码、Read直接track/dedup/压缩、真实codec与媒体/stream spill接线仍待补。

安全边界不能由fidelity推导：原ID/路径不校验，存在非原子并发写、现存blob信任、低层cleanup递归删除/任意路径read等能力；仅用于可信历史和可信显式依赖，不可向不可信客户端暴露或当作文件沙箱。测试所有真实文件写入/清理仅在自有mkdtemp目录，不触及安装账号、真实联系人、真实模型服务或系统屏幕。

13项新专项通过，另将已有ComputerUse SDK+loopback HTTP测试加强为“请求图片仍正确，JSONL为blob ref且不含原data URI，实际blob字节与fixture相同”；真正跨harness重启恢复图片和close保留外置文件通过。`verify:blobs`535次固定SHA差分执行原三服务、独立原helper子集和四个SessionStore方法，比较返回/异常/输入变更/内存FS/日志。535不是535个独立场景，也未穷举多进程/磁盘故障/恶意对象状态。

最新454项全量测试、376项编译JS smoke、26个差分脚本、check/build/config/编译CLI help通过。SDK0.5.2、六份JSON及115 Prompt未变。整体目标继续进行中；下一阶段继续原压缩codec/Read图像路径、aborted-draft/response gate/idle timer与完整InputHistory、eager AgentManager/MemoryManager/插件命令等，不能以本批或可启动替代完整harness目标。

## 原ImageUtils/Jimp与Read图片分支批次

固定SHA、UTF-16：ImageUtils完整类 `13202774..13208907`（23静态方法+三个原常量），所属84024模块 `13108540..13209592`；Read.isImageFile从11696110、readImageFile从11696313至read_tool_decorate前；ModelUtils.getCurrentModel从13320247、ToolExecutionError从12196419。原Jimp配置、CODEBUDDY_CODE_IMAGE_COMPRESSION_MAX_DIMENSION和两套profile在ImageUtils前；Read模型图片错误1010/压缩省略1011与图片helper的1001/1002/1003取原enum。原SessionFactory conditionalRules={pendingTriggers,processedRules}从10997841附近保留，Read登记pendingTriggers；完整条件规则来源/执行尚未因此恢复。

完整ImageUtils不只是resize：1080档maxBase64Size512000/maxRawBytes384000/qualities85,70,50,30；2000档5242880/3932160/80,60,40,20。env parseInt/负数/NaN回退、unsupported warning、profile0返回undefined、原regex、round等比缩放、MIME探测、JPEG重压/转换顺序、throwOnFailure、resolution-limit和失败省略保持。base64字节估算round(.75*长度)未扣padding；解码失败的小内容可以保留原串，0在Read/profile绕过但直接compressImage仍有原尝试/失败日志。没有增加额外强拒绝/安全校验策略。

新锁定原包依赖jimp0.22.12，未升级SDK。captured-image-module从固化bundle装载84024及其依赖共89个模块，运行原内嵌Jimp编解码器；未启动应用entry，文件/网络/字体加载边界阻断，process/env/logger为fixture。PNG/JPEG/BMP实际编码data URI逐字节对照独立安装原版本Jimp，含真实resize、重编码、高熵降质，不是只用假codec自洽。instrumented codec另验证全部quality循环、read/buffer失败与省略控制流。可信源码VM不是安全沙箱，也未证明全部Jimp功能、Bun/浏览器、字体/URL路径和恶意图片安全。

Read替换旧扩展名直发分支：模型family格式列表+原1024字节binary probe，再判断supportsImages严格false。ModelUtils子集按default Agent、session.request/options和name/id，不识别aliases；未知包装custom模型。若干format函数对无分隔符裸文件名own.bmp与裸扩展名bmp结果不同，保留。Read先access/stat/read-state、重复读取原字节/MIME、存原图blob并track，再压缩；unchanged/duplicate提示、标题size/压缩比、blob失败warn/fallback和错误边界保留。ANSI仅String/pure text宿主适配；其他文本Read/文件工具原方法与错误码仍需完整复核，不据此宣称整个Read类100%。

第一次压缩省略后tracking仍有效，第二次可能返回unchanged；先存原图，压缩后的output也可能另存blob。字符串型providerData.toolResult.content仍可能含data URI，即使output已改blob；loopback测试同时断言此原行为，未为全JSONL无图片字节而改源码。压缩无CPU/内存隔离、timeout/完整取消，文件多次读也非原子快照。直接嵌入CoreFileTools无model/blob DI的默认format/fallback与产品DI区分；imageHistory窄codec override只影响输入interceptor，完整codec/env可由imageCodec注入。

11项新测试：真实PNG缩放/MIME、高熵转JPEG、错误/省略、模型/二进制门槛、原图重复/复制/变化、失败后去重、模型解析、默认input interceptor真实SDK回注；loopback HTTP+真实SDK连续三次Read得到压缩image_url、unchanged、duplicate并校验blob字节/JSONL。verify:image-codec通过803次固定SHA比较，含完整公开面/常量、Read/model方法和调用次序；TypeError文案归一化，真实编码路径另做完整字符串相等检查，非全状态空间证明。

当前npm audit报告15个受影响依赖项（9 moderate/6 high，非15个独立漏洞），Jimp链file-type等增加moderate项，phin标deprecated。为保真未audit fix/跨大版本升级，原ws-native8.18.3既有风险仍在。仅自有测试图片/临时目录与本地HTTP，未读取安装账号/屏幕、联系真实用户或请求真实服务，不宣称生产安全。

最新465项全量测试、387项编译JS smoke、27个差分脚本全部回归，check/build/config/编译CLI help通过。SDK0.5.2/OpenAI6.25.0、六配置/115 Prompt未变。整体目标继续进行中；下一阶段优先aborted-draft/response gate/idle timer和完整InputHistory，再推进eager AgentManager/MemoryManager/插件命令、媒体/条件规则等未完成宿主，不以本批可启动或有限差分代替完整harness目标。

## 结果生命周期与中断草稿批次

固定SHA、UTF-16：AbortedStreamDraftStore完整类`10949890..10954861`；createAbortableIterator从`10955502`，其前A_闭包读取CODEBUDDY_ABORT_GRACE_MS；原SessionManager类`10956217..10977596`，本批选取resetIdleTimer、emitSessionStart、initRunResultHandler、handleRunResult、handleStreamRunResult、handleContentFilteredResponse、handleNonStreamRunResult七个方法。InputItemUtils四个content-filter方法在`13270xxx`，notice英文常量从`13273180`；InterruptionService的_hasInterruptions快照在`110638xx`。方法体加TS注解与显式DI，原分支/字符串未改写；不执行整个应用模块或读取安装登录态。

DraftStore按原先后顺序记录reasoning/output_text_delta/tool参数，支持ChatCompletions index→callId以及Responses call_id路径；raw Chat content不冒充output_text_delta，Responses arguments不补item_id/index fallback。committed refs/keys避免重复，reset只清草稿，不清已提交集合。flush顺序reasoning→assistant→tools，输出incomplete/isPartialAborted，允许未闭合JSON；复制content/rawContent避免快照别名。保留原字段/空值/缺name丢弃边界，不承诺全部并发状态下无损。

迭代器每轮race next/abort；abort后等待默认3000ms或正parseInt环境值，timer按原unref。宽限内next仍可完成，到期同步调用return但不await其promise；已abort时迭代器异常记日志退出，未abort则抛出。预先abort不发起next。取消后native stream按当前session.abortSignal判定，可能与初始捕获signal不同；不擅自把原语义改成即时取消/可靠资源回收。

结果处理保留request/message observer入口、流/非流分支、RUN_FAILED、completed等待、gate和end observer顺序。retry gate按_hasInterruptions ?? live interruptions，再network/result.error、completed retryable model/stream timeout、retryInProgress、isCompressing，再interceptor计算；严格true才拦截，单个失败warn继续，捕获的旧resolver不被重叠result覆盖。gate先resolve再end telemetry；自动retry分支清telemetry并跳过报告。非流只追加newItems.rawItem。stream恢复timestamp/metadata、tool streaming别名、最后响应item的rawUsage回填、response.id覆盖、空输出silentAbort和structured例外、model/combine转发及abort草稿落盘。

content-filter沿原messageId匹配最早过滤响应，使用原parentId、真实用户candidate和逐字notice创建skipRun分支，去重并historyReload；空messageId不捏造。idle定时60000ms，busy重新安排、idle发原通知；startup/resume复用WeakMap里首次promise，完成/失败后仍不删除。订阅显式init会替换旧者；新增host ensure只在首次启动初始化，避免每个SDK回合重播旧BehaviorSubject。

独立宿主新增per-result gate/error/consumer ledger，等待异步后续result与历史flush；终止计划/审批拒绝用独立terminal ledger返回，不修改原gate或滥用__cancelNudge。原TaskCreate扫描history计算序号；新增host指定callId的发布屏障保证执行前该记录已落地，不修改其算法。关闭清理owned timer/subscription。未配置resultLifecycle的旧SessionManager嵌入入口保留兼容实现，createHarness默认使用新生命周期。

sessionLifecycle显式支持interceptors、onSessionStart/onNotification、timers/env、telemetryService/galileoSessionBridge和mapMessageErrorCode。原业务错误码映射尚未移植，不用error.code猜替；默认mapper空返回、observer离线空适配。生产六类响应interceptor全集、通用Hook命令执行器、完整InputHistory服务、Galileo/telemetry transport、ACP/print最终输出宿主仍未因此恢复。OpenAI Docs仅用于核对SDK结果边界，运行时仍使用0.5.2而非升级后的API。

`verify:session-result`共682次原包比较：完整DraftStore、iterator、七个SessionManager方法和四个过滤helper；固定UUID/clock/timers/observer，RunResultUtils/ErrorUtils与基础InputItemUtils使用此前已恢复依赖。比较是断言次数，不是682个独立业务场景。20项新增专项另验证真实SDK部分reasoning/text/tool参数取消→JSONL只落一次→下一回合，真实模型transport+loopback HTTP/SSE保留32hex messageId/model/timestamp，以及CLI gate等待延迟续跑；无真实账号、外网模型、联系人或桌面交互。

全量485项测试和编译JS smoke407项通过，28个差分脚本全部回归；check/build/config/编译CLI help通过。六份JSON/115 Prompt、SDK0.5.2/OpenAI6.25.0未变。整体目标继续进行中；下一步按完整InputHistory、生产响应interceptor/Hook、eager AgentManager与MemoryManager/插件命令推进，不以本批有限差分或可编译启动宣称完整harness已经100%还原。

## InputHistory与生产响应拦截器批次

固定SHA、UTF-16：InputHistoryServiceImpl完整类`11139187..11142447`，10个方法及原构造字段；常量history.jsonl和InputHistoryService symbol在11183xxx。响应类：ContextTruncation `11097159..11101525`、finishReasonError `11102390..11106192`、TextualToolCall `11107081..11110592`、TruncatedToolCall `11111362..11112484`、QueuedMessagesCleanup `11112796..11113108`、MediaContentError `11113694..11125692`、FallbackModelError `11127506..11129255`、ModelPermissionError `11130150..11131571`，共52个原方法。静态字段/regex/逐字Prompt沿原赋值恢复。Component metadata push从37824、autoBind反向绑定从53076，默认链按原反序，非源码正序猜测。

InputHistory是UI用户输入记录，不是模型transcript分支。保留JSONL追加、project选择、最近100条/时间排序、display+project连续去重、legacy input_history fallback但不落盘、writeLock/finally释放、坏JSON行告警和无schema校验。maxHistorySize=10000、cleanupDelay=5000，stat.size达到120×maxHistorySize才读行/保留末尾上限；cleanupHistory默认30天。只有本实例append串行，cleanup没有跨进程锁/原子替换，源类没有mkdir/close/敏感信息脱敏。不修改这些边界来冒充原实现。

独立宿主映射到自身stateDir/history.jsonl，legacy reader仅显式DI，不读取已安装应用数据。CLI交互模式按Node readline载入/保存用户输入，print/内部model turns不写UI记录；原React的搜索/模式前缀/粘贴状态机不在本批恢复范围。owner关闭清timer并等待append锁/已经开始的异步cleanup，这是单列host资源接线，不是原类新增协议。cleanup低层方法可能重写文件，仅操作明确传入的工程数据；不将其视为跨进程安全数据库。

八类默认链为ModelPermissionError→FallbackModelError→MediaContentError→QueuedMessagesCleanup→TruncatedToolCall→TextualToolCall→finishReasonError→ContextTruncation；显式sessionLifecycle.interceptors整体替换默认链。truncated JSON先discard/记录工具名，finishReason length按最近15项/最多2个marker纠正，内嵌Write/MultiEdit/Edit/Bash提示与terminal notice逐字保留。Textual最多1次，排除fenced/inline code，只匹配原invoke正则；CLEAN_RETRY_ENABLED在模块加载时读取CODEBUDDY_TEXTUAL_TOOL_CALL_CLEAN_RETRY，只有精确0关闭。getTurnRawItems优先历史messageId，否则newItems.rawItem；没有transport messageId时原discard可能只标SDK对象、不标历史副本，该边界已专项保留。

媒体按原pattern表判IMAGE_SIZE_TOO_LARGE/REQUEST_BODY_TOO_LARGE/TOO_MANY_IMAGES/INVALID_IMAGE/MULTIMODAL_CONTENT_SHAPE；最旧/最近图片选择、tool output/JSON/provider内容/路径/blob-ref处理、替换占位及逐字recovery Prompt完整移植。GIF拒绝码11125/11133/11135只替换用户GIF，不自动发起重试；普通媒体marker上限10，body/shape无可移除媒体才走PTL截断。错误内层message及JSON解析的原优先级、重复视图计数等不猜测式修正。

补回TokenUtils完整类、PtlErrorUtils namespace、HistoryTruncateUtils namespace与三个原InputItemUtils消息构造方法/自定义类型判断。PTL先EMERGENCY_AUTO force compact，false/throw再fallback；compact limit/pending approval禁止fallback，compact agent自己PTL跳过，continue during compact走确定性截断。按token gap或20% API rounds删旧，单组则按50%匹配工具对删旧，至少保留一组/一对；marker、skipRun/isCompactInternal/isPtlRecovery/isMediaBodyRecovery字段保留，最多3个PTL marker。中文1.8/其余4字符估算、图片占位、JSON/循环对象fallback沿原；RunnerFactory和ContextCompactSummarizer的末尾工具结果估算已替换旧近似stripImages路径。TokenUtils单独模块避免history/input初始化循环。

ErrorUtils恢复原ServerErrorCode enum、extractBizCode/overload/quota/input-length分类及mapMessageErrorCode所需原helper，支持嵌套错误/response.data、status/statusCode、responseBody、429内层data.code优先及原3001/3002/3003/3004/3006/default映射。SessionResultRuntime默认不再使用空mapper，root注入捕获产品配置；普通Interruption网络重试仍保持ECONNRESET/ECONNABORTED/ETIMEDOUT，未扩大为全部HTTP错误。完整ErrorUtils其余presentation/ACP等未据此宣称全集还原。

fallback保留print gate、same-model/已激活检查，overload先primary重试一次、quota直接切、原meta与bypassMessageQueue输入。原CLI选项`--fallback-model <model>`从7409394，现接到HarnessOptions.fallbackModel/session.options。真实CLI子进程+本地HTTP验证请求模型严格primary/primary/fallback且stdout最终答案正常；无远端服务。权限码11136仅通过显式productRefresh.sync(true)适配强制刷新/追加模型列表；offline默认明确拒绝live sync，不假装刷新固化配置。AgentManager核心live重建现已恢复；完整ProductManager远端sync与插件刷新编排仍待恢复。

`verify:history-response`982次比较涵盖完整InputHistory方法面及文字、八类方法面/静态字段/regex/内嵌Prompt与日志模板、原autoBind反序、业务enum/分类/映射、Token/PTL/截断/输入helper。原类/namespace在VM中隔离执行；FS/clock/UUID/observers为受控依赖，已有基础InputItemUtils/HistoryUtils明确复用，不执行应用bootstrap。982是断言次数，不是独立业务场景数，不证明全部并发/多进程/UI/真实产品策略。

25项新增专项另验证真实SDK的length续跑、textual清理、PTL截断、fallback切模；真实transport+loopback HTTP/SSE验证messageId/discard和11136刷新，真实CLI子进程覆盖原fallback参数。最新510项全量测试、432项编译JS smoke、29个原包差分脚本通过；check/build/config与编译CLI help通过。SDK0.5.2/OpenAI6.25.0、六份JSON/115 Prompt均未修改；未登录真实账号、访问真实模型/产品服务、联系人或桌面。

该批结束时整体目标仍进行中；其后的AgentManager恢复见下节。InputHistory服务和这八类响应核心已恢复，但原React/ACP/print最终输出视图、遥测transport和全部配置/并发状态仍有缺口；不以可编译启动或有限差分替代完整harness目标。

## AgentManager / eager bootstrap / 插件组合批次

同一固定SHA样本继续静态提取，不重新读取安装账号。AgentManagerImpl完整类`7025572..7059651`移植至`src/agents/native-agent-manager.ts`；68个非constructor方法（含ready getter和静态skills fingerprint）、原constructor字段初始化，以及A2/A3/A4/A8/A5/A6全部初始化表达式均做结构对照。保留原控制流/表达式/内嵌Prompt，只加TS注解和显式DI/env/clock/timer/profiler/compose/delegate边界；不是用整包bootstrap充当还原代码。SDK0.5.2保持外部依赖，构建factory不额外注入model/modelSettings，运行前ModelConfig继续负责配置。

原init会settings.list，再等ProductConfiguration，standby只在activation后启动；eager注册全部CLI-tag配置，当前19个Agent在createHarness返回前均就绪。get/getAgentConfig等ready并异步查Map，missing get返回undefined；getAll直接列Map而不触发构造/等ready。普通refresh只替tools不换实例；配置rebuild创建新SDK Agent，WeakSet保留旧managed实例，ensure的第四参数可将当前tools回写给旧实例。ensure返回void；AgentService/AgentTask/命令/压缩及测试调用方已同步接口，未知session Agent按原resolveAgentForSession回退default但不重写请求metadata。

pending/force重建合并、settled emitter/3000ms默认等待/timeout=0无限等待、失败记录与forced refresh rethrow、首次placeholder models独立屏障、CLI config force gate、custom command/skills/plugin指纹全部保留。指纹只取instruction/description长度与前32字符，model部分只取ID；同ID内容替换/仅模型删除可能被跳过，普通删除Agent可留旧Map记录，初次build失败也会开放ready。工具注入自身改变初次配置指纹可能导致下一次额外构建。这些行为有明确测试，不修改成“更合理”的全量hash/删除策略，也不宣称全部竞态已穷举。

完整registerAgent包含递归handoff/asTool、参数JSON/失败日志、handoff prompt/inputFilter/reset、custom默认移除Agent、显式mcp工具/server proxy/白名单、11个internal generator例外及原SendMessage/ExitPlan注入。模型选择包含custom/chat继承、alias/name/ID、disabled fallback、trust用户未知ID、lite/reasoning/env/defaultRelatedModels。完整plugin方法包含settings.agent/CLI、plugin replace、volatile persona expert Prompt、headers归一、source解析/fingerprint、standalone注册清理、MCP whitelist同步、output-style与default指令渲染。

原plugin composer全部helper`7018190..7024410`恢复到独立factory：仅builtin welcome root组合enabled interaction plugin；多个mode警告跳过，compose条件分支仅处理interactionMode/welcomeMode/workMode，其他Nunjucks块原样保留；include路径/循环/未知原文、frontmatter/变量替换、fallback fragment与工具union均保留。原MarkdownUtils三个方法、PermissionUtils三个方法恢复；frontmatter解析不换npm版本，`captured-yaml.ts`保留原module43519及其74个依赖factory，逐factory原始文本比较。vendor loader只允许process/buffer/util，不启动产品模块或读取账号。

Toolspec module8844的parseSingle/parseToolSpecs/augment、原ToolDeferOverlay与cache，以及DeferToolConfigServiceImpl`12005561..12006914`恢复。保留lenient warnings、重复/冲突last modifier、nested/comma错误、ToolSearch/DeferExecute no-defer补入、overlay返回force-defer/force-no-defer、env→settings→feature/default优先级。工具gate恢复整工具deny（排除MCP/scoped）、大小写精确allow、不擅自把*扩展为通配、alias scoped过滤、delegate原8工具白名单与Plan限制。MCP首session等待按server/overlay候选筛选，2000ms deadline，合并并发prewait；外部abort可重试，内部超时/异常按原completed语义，取消监听与timer沿原清理。

独立host只替代缺失的桌面服务：Deferred/Emitter框架、显式settings/product snapshot/命令/prompts/工具/MCP/prewarm/plugin I/O。createHarness启动时注册全部工具后start，close清理自身config订阅并等待rebuild。显式插件目录需可信；未自动扫描安装插件/账号，MCP whitelist adapter当前只记录注册意图，不冒充完整原SDK权限client。ProductManager/providers远端sync、完整Plugin/Extension loader与物化、PluginRuntimeRefreshService、ToolManager完整fingerprint/index/cache生命周期仍待恢复；standby激活/真实服务/MCP自动加载也不因原类移植而宣称完整产品启动已恢复。

`verify:agent-manager`559次比较包含68个完整方法AST/constructor与内嵌常量Prompt、原spec/composer全函数AST、74个YAML factory逐字文本、原类隔离VM行为与副作用。DI/Deferred/Emitter/SDK为明确依赖边界；VM跨realm的Promise.all调度可不同，独立Agent的日志/副作用按值和数量比较，重建/MCP竞态另测屏障与状态，不将任意调度顺序当契约。有限比较不等于559个独立场景或全配置/并发状态空间100%。旧delegate/命令差分的Object.create夹具已改用原Map字段，不改变native方法来迁就旧字段。

14项新增专项覆盖eager/Map、模型与instruction指纹、重建合并/失败/placeholder/standby、MCP deadline/abort/managed旧实例、原权限gate、插件persona/真实临时文件组合，以及真实SDK Read、显式config事件重建后模型请求和缺Agent回退。最新524项全量测试、446项编译JS smoke通过；30个原包差分脚本、check/build/config与编译CLI help通过。SDK/OpenAI锁定版本、六份JSON和115 Prompt未修改；只用owned临时文件、内存/假时钟、本地fixture服务，未访问真实产品/模型/联系人/桌面。

该批结束时整体目标仍进行中；其后的MemoryManager与条件规则恢复见下节。仍不将完整类移植、可编译启动或有限差分称为完整harness的100%还原。

## MemoryManager / 条件规则完整加载链批次

继续使用同一固化SHA原包，均为JS UTF-16偏移：Manager`9313253..9314720`、Loader`9316053..9320988`、Parser`9322398..9322964`、Cache`9323568..9323772`、Validator`9324564..9324969`、GlobMatcher`9325634..9326091`、LRU`9326727..9327035`、Subdirectory`9327165..9329952`、ConditionalRules`9331562..9332942`。上述八类服务完整移植至native-memory-services，原方法控制流/字段/日志/内嵌Prompt保留；框架DI、FS/Path/Hooks显式注入，不用原包bootstrap运行产品。

补回原MarkdownUtils小frontmatter/parser/list、MemoryLoadContextUtils、完整ImportUtils/GlobUtils和五个PathUtils方法（Memory路径、isPathInside、file:/~/@/separator/Windows路径处理）。规则解析明确不用上批的YAML parser；当前memory-store的公共小parser也转发同一原生方法，避免提取scanner与规则加载语义分叉。Glob由原module70941及45919两factory逐字保留，不猜npm版本或改用fast-glob；module3238所有MemoryScope/Type、文件名、40k和section header与原导出比较。

Loader并行加载user/project/project-local，共享loadedMemories/visitedDirectories；project主文件自祖先到当前、遍历不含系统根，当前`.codebuddy/rules`递归，user从config home主文件/rules，local只当前目录。CODEBUDDY.md/.mdc、AGENTS.md/.mdc按组首个成功者优先，`.codebuddy/`主文件另取首个；只加载.md/.mdc，symlink realpath与目录去重沿原。PathUtils默认写project优先已存在CODEBUDDY.md再AGENTS.md，否则CODEBUDDY.md；user写配置根，其余scope按源码落local。addFact去前置hyphen、substring去重、逐字section插入/换行，直接writeFile后仅清主cache，不伪造原子锁/事务。

Parser仅支持原小frontmatter，`paths`为逗号字符串/多行列表；brace切分保留`{a,b}`，inline `[a,b]`仍是普通字符串，alwaysApply/paths决定always/manual。Validator默认拒enabled=false、alwaysApply=false且无paths；import忽略这些开关，但仍限40k UTF-16。@import跳过代码块/行内code，支持相对/绝对/~/任意外部路径；loaded realpath优先去重并追加importedFrom，深度>=5跳过，directory import不读取列表。循环已在Map时直接命中，不擅自新增循环告警或改写路径/标点匹配。

Cache缓存Promise并合并并发，拒绝也保留直到clear；不是自动watcher。Subdirectory以原200/200/100 LRU缓存chain/dir/file，negative sentinel也缓存；从触发文件目录向上加载，不含cwd自身及其`.codebuddy`内部，主文件仅CODEBUDDY.md/.mdc，不额外加AGENTS；相对glob锚定子目录，非法/空glob回退dir/**，native isPathInside自身返回false。Glob按normalizePath和matchBase匹配，数组为逐项OR而非ordered include/exclude，大小写、dotfile、negation/extglob/braces沿原minimatch，未扩展为权限沙箱。

ConditionalRulesService.consume先匹配manual主规则与subdirectory规则，按触发/候选顺序匹配并即刻记录processedRules，再清pending和构造原完整conditional_workspace_rules Prompt；无匹配也清pending，匹配异常则不会走清理。会话同路径只注入一次；若结果非ToolResult甚至null导致追加失败，已经processed的状态不回滚。原ToolManager.injectConditionalRules方法从116794xx完整提取，Read/Write/Edit/MultiEdit未抛异常且truthy返回后接入原方法；工具结果string直接追加、非string按String(value||'')转换。完整ToolManager.execute/hooks/checkpoint/classifier编排仍未因此恢复，现有guard/handler与post边界为standalone接线，不宣称整类已移植。

原ConditionalRulesAgentRunInterceptor`7106105..7106449`（priority1740）默认接入Array input run路径，消费其他待触发并注入last user；不增加skipRun/meta过滤。MemoryPromptContext按原scope get注入user/project（scope查询本身不按type过滤），SystemReminder实际来源按always筛user/project/local。原pendingTriggers此前只记录不消费，image-codec旧测试的“保留pending”断言现改为消费后为空，原图片编码/HTTP/JSONL验证全部保留。

InstructionsLoaded保留原payload/cwd/空transcript/memory_type和session_start reason、每条best-effort警告；loader fire-and-forget，不等待Hook。独立host显式接instructionsHooks，close额外等待自身已经派发的Hook作为ownership边界；没有隐式加载/执行shell配置。默认配置home绑定本harness stateDir，不读取已安装~/.codebuddy；可显式memoryRules.homeDir/userHomeDir覆盖。规则及import可读取cwd外文件，只应接受可信文件；任何这些服务或Node VM/子目录校验都不是安全隔离。

`verify:memory-rules`282次比较包含67个完整方法AST与原constructor字段、常量/Prompt、两原minimatch factory逐字文本、规则发现/import/disabled/深度/去重、cache拒绝/clear、子目录负缓存、glob/path、section写入、Hook及注入行为。原类隔离VM只给内存FS/Hook和明确Path边界，不启动原应用。并行独立加载的日志/I/O按值和数量比较，业务顺序另由祖先/优先级/processed场景验证；计数不是独立场景，也不穷举全部平台/文件故障/并发。

新增18项专项覆盖上述协议及真实SDK常驻user/project/local规则、Read+子目录规则结果/历史、Write无需Read触发且仍需审批、手动pending run注入/clear后新session重载，以及真实CLI→loopback Chat Completions携带项目规则。最新542项全量测试、464项编译JS smoke、31个源码差分脚本、check/build/config和编译CLI help通过。SDK0.5.2/OpenAI6.25.0、六份JSON/115 Prompt和memory policy hash未改；无真实模型/产品服务、账号、联系人或桌面访问。

该批结束时整体目标仍进行中；其后的MemoryContext/Relevance/Extraction/Freshness恢复见下节。当前原MemoryController REST/UI、watchers、完整企业managed来源/远端策略仍有缺口，不将八服务/可运行或有限差分等同完整memory子系统或全harness100%。

## Auto memory / entrypoint / relevance / extraction / freshness批次

固定SHA、JS UTF-16证据：MemoryContextInterceptor完整类`7167120..7175582`、MemoryRelevanceServiceImpl`9342347..9344463`、MemoryExtractionServiceImpl`9348849..9352982`、StopHook`9354814..9355075`、FreshnessPostToolHook`9355943..9356698`。五类完整移植；SDK Agent/RunContext/RunState仍引用本地0.5.2，不重写、不升级。官方[运行边界说明](https://developers.openai.com/api/docs/guides/agents/running-agents)只用于SDK边界核对，实际恢复以固化bundle及本地0.5.2代码为准，不引入当前文档的新API。

MemoryContext保留priority1150、Array/skipRun/compact gate，auto-memory默认true、typed默认true、relevance默认false、extraction默认false。disable-auto 1/0先于MEMORY_ENABLED，再settings；typed/team/relevance/extraction各自env优先与大小写/不trim行为原样保留。shouldInject按user数量1、continue/continued与首user的memory role标记判断；query在注入前提取，剥除原四类reminder/命令标签，不新增meta过滤。team身份按env→settings→Git→OS，team关闭也仍查询身份；GitUtils.getGitUserName原完整方法恢复，只读固定git config user.name、5000ms/utf-8/stdio/trim/异常undefined。

原entrypoint builder六函数（typed/search/lines/prompt及extract opener/prompt）、freshness四函数、scanner四函数完整恢复。typed先trim、200行/40000 UTF-16（虽常量名BYTES）、整行优先截断与逐字WARNING；legacy独立保持200行/40000截断、不trim空白和Current MEMORY.md段。完整policy/TYPES/WHAT_NOT/WHEN_TO_ACCESS/TRUSTING_RECALL、保存/计划/任务/历史搜索文案及extraGuidelines均保留。public buildExtractPrompt转发原同步函数，旧手写Prompt拼装不再作为生产路径；policy hash继续6d2bdeeef7bef8029396250abc25823d6db6784fe486dc6160ac35b7ba5729b0，独立于115 product prompts。

Scanner原readFileHead采用stat+createReadStream bounded byte范围/高水位、data/end/error/close/abort处理；4096头部、200条、递归.md/排除basename MEMORY.md、allSettled跳坏项/mtime排序、原metadata与manifest均恢复。memory-store公共接口转发原scanner。scan预先abort会返回空列表，但直接readFileHead无precheck会正常读取；没有替原代码补更“合理”的即时取消/额外大小限制。目录错误除ENOENT仍原warn，freshness以floor/clamp算天，<=1天不提示，>=2天原逐字提醒。

Relevance先按surfaced排除，再独立session调用memorySelector；原Query/manifest/recent tools Prompt、贪婪JSON正则、selected_memories数组/有效文件名过滤、重复项保留和错误/abort返回空保持。MemoryContext在读文件前即加入surfaced，读取失败也不回滚；每个文件含age/body/旧memory caveat。选取前AGENT_STARTED与50ms不可取消等待保留；parent abort后skipRun、原incomplete Interrupted by user history、forceIdle(memory-aborted-by-user)，不额外启动主模型。SDK实测后续回合不重复选择已surfaced路径。

Extraction旧手写核心已由完整原类替换；旧构造器facade继承原类，只保留extract/shouldExtract两legacy embedding辅助，不是doExtract生产路径。保留单例inProgress/游标、两条新user/assistant门槛、原assistant.content工具写入形态检查（不自行扩大为所有SDK flat call）、工具筛选五名、共享modelSettings、独立conversationRequestId、RunContext浅拷贝、RunState maxTurns5、runnerProvider与runWithoutHistory文本流消费、permission/purpose恢复/成功advanceCursor/失败仅日志。预先已abort的父signal不补主动检查、成功后原listener不主动移除等边界未改写。bypassPermissions不等于目录沙箱，Prompt的只写memory约束并非强制文件策略。

StopHook event Stop/Low800按source仅非TTY等待；FreshnessHook PostToolUse/Normal500/matcher Read，只检查原project memory字符串prefix（不是安全path验证），stat失败debug退出。原追加内容经宿主ToolManager成功truthy结果边界包装为tool-hint，再执行条件规则，原字符串/非字符串转换保留。完整通用Hook执行器、PostToolUse配置/异步/失败编排并未因此完成，不能把两个原Hook类当成完整HookManager。

九个原Path helper、两个MessageUtils方法和Git helper恢复。独立host默认project memory/stateDir/memory、transcript/stateDir/sessions，导出原layout helper供显式宿主使用；team按原cwd/.codebuddy/memories/@id。project目录由本宿主bootstrap创建，team目录准备/企业managed/产品Startup仍未据此证明。Git cwd绑定CwdService，提供显式Git/OS/FS/env/clock/UUID/timer/path overrides；不读取已安装WorkBuddy登录态。CLI model现进入settings model适配，避免相关性lite在自定义端点错误退回捕获产品模型；SDK实测selector与主回合都用显式外部model。runner scope和close清剩余aux session observers/timers为明确ownership adapter，不改变原类分支。

`verify:auto-memory`597次固定SHA比较、54个完整方法/函数AST（另constructor字段），覆盖五类、完整builders/scanner/freshness、Path/Message/Git helper，所有内嵌Prompt/regex/flags/branch控制流。VM仅给受控memory I/O/SDK依赖，未启动原应用；SDK0.5.2作为明确外部依赖。差分AST索引已缓存，避免每个fixture重复遍历全包；不是通过缩小行为矩阵来加速。有限比较不等于597个独立业务场景，不覆盖所有时钟/并发/文件故障或平台。

新增23项专项：entrypoint/flags/team/query、scanner4096/200/pre-abort、freshness/Git、选择重复/未知/abort/unreadable状态、原RunState5与失败恢复、StopTTY；真实SDK验证entrypoint新session重载、selector→主请求→后续去重、CLI model、Read旧memory嵌套提示、实际extraction Write且主历史/文本无污染、选取中取消；CLI经loopback SSE验证entrypoint。最新565项全量测试、487项编译JS smoke、32个源码差分、check/build/config及编译CLI help通过。原SDK/OpenAI锁定版本、六份JSON/115 Prompt/policy hash未改，无真实模型/产品服务、联系人或桌面操作；Git身份只执行原只读命令，新专项可注入假身份。

整体目标继续进行中。下一阶段优先通用Hook配置/匹配/命令执行器与完整HookManager，再推进ProductManager/插件刷新编排。MemoryController REST/UI、watchers、完整managed/remote policy来源、全部Startup/权限/输出视图与遥测仍有缺口，不将本批核心链、可编译启动或有限差分视为整个harness100%还原。

## 通用 Hook 核心执行与协议批次

新增四个完整原类：HookExecutorImpl `8446794..8452932`、HookManagerImpl `8454850..8469415`、PromptHookServiceImpl `8474519..8476927`、ScopedHookRegistryImpl `8477754..8478813`。位移均为固定bundle的UTF-16索引。仅增加TS注解和显式DI/I/O映射；不用原bundle整体作运行时。保留constructor WeakSet/Map字段，未把前一批两个memory内部Hook当成完整HookManager。

命令部分恢复shell/直接PowerShell选择、六个Windows路径转换、NODE_OPTIONS清空、JSON stdin去session、stdout/stderr/exit/error/EPIPE、60s默认timeout、TERM/延迟KILL及原killed guard、首JSON对象分块/字符串转义async probe、4096阈值、asyncTimeout毫秒和detach。保留原缺陷：asyncRewake虽透传但不消费；不支持通用AbortSignal；非零exit（除2和null）可能覆盖JSON deny为allowed；循环输入先在debug JSON序列化抛错；原延迟kill guard不保证杀掉忽略TERM的进程，detach timer不随正常退出自动清理。独立host close另行回收本次记录的child/timer，不宣称进程树沙箱。

Manager恢复input processors、internal/local并发及SDK后置执行、三种matcher各自fallback、settings/plugin/scoped来源、if表达式语法/委托、来源/type/shell/if去重、WeakSet once、plugin env三套alias、service proxy URL准备、HTTP header允许变量插值及超时/异常协议。聚合按原浅合并，additionalContext后者覆盖而非拼接；只拼字符串continuation message，保留completionPromise barrier；SDK updatedInput与command modifiedInput不同字段保留。HTTP非2xx/异常放行、计时不覆盖body、opts.signal未消费；allowedEnvVars不是command环境隔离。只接受可信显式Hook，不连接真实产品/读取安装凭证。

Prompt恢复全部参数JSON、首个$ARGUMENTS替换、JSON/markdown/正文fallback解析、空/失败响应放行与空object/array拒绝；Stop/SubagentStop历史评估用真实SDK0.5.2 Agent clone、RunState(maxTurns=1)、父RunContext复用、history修复/custom过滤、stream消费和purpose finally恢复。options.timeout未在原PromptService内落实，不补造超时机制。普通prompt/agent类型按原都调用同一Prompt服务；impossible/onResult/continueOnBlock/preventContinuation按原处理。115份product Prompt、memory policy及SDK/OpenAI锁定版本不改。OpenAI Docs只核对状态/stream边界，不替换固定版本行为。

Registry按全局scope注册，缺sourceId打stamp、agent Stop改SubagentStop、合并已有事件、不按当前session自动隔离；与旧按session查询的兼容facade明确分离。恢复28个HookEvent、NotificationType、HookPriority含数字反向映射，以及全部EVENTS_WITHOUT_MATCHER/事件输入输出说明/标题；说明中的productName由显式metadata工厂注入。InputItemUtils.createHookMessage `13266826..13267176`也完整对照。

`createGenericHookHost`要求显式workDir、shell选择和permissionUtils底层谓词，可注入settings/plugins/sdk callbacks/endpoint/internal hooks/input processors及Prompt模型依赖。默认不扫描安装配置、插件或账号；无产品endpoint不伪造服务代理。Host目前是可使用的显式嵌入入口，尚未默认替换createHarness中的session/tool/structured/memory Hook分派；shell发现、完整PermissionUtils及产品service proxy controller不在本批完成范围。

验证：52个完整方法/函数AST、constructor原字段、三项事件metadata完整AST、事件/通知/priority协议，1,077次固定SHA比较。新增26项专项，真实自有node子进程读取stdin/修改参数、detach/关闭、loopback HTTP和真实SDK历史RunState都通过；其余Win/timeout/错误/并发分支使用fake I/O/clock，未运行真实Windows/产品命令或真实模型。

最新门槛：591项全量测试、513项编译JS smoke、33个源码差分脚本、check/build/config与编译CLI help通过。仍不声称100%还原；下一批优先完整SessionHookManager/ToolHookManager、权限底层/平台shell发现、watchPaths/服务代理及默认生命周期接线，之后继续ProductManager/插件刷新编排。

## Session / Tool Hook 生命周期与默认接线批次

完整SessionHookManagerImpl `11017694..11034969`和ToolHookManagerImpl `11942842..11947638`已按原控制流移植；ToolManager `11657350..11681925`中的getPlainToolInput/executeToolWithHooks/extractRawResponse三个完整方法单独恢复为NativeToolExecutionPipeline。纠正检索歧义：`9186841..9198615`属于MCP ServerManager，不能将其记作ToolHookManager。位移均为固定bundle UTF-16索引。

默认createHarness改用createHookLifecycleHost。SessionStart/idle Notification复用既有barrier；UserPromptSubmit按原addHistory的真实/noncompact/root条件，在输入处理和发布后、append前派发。Stop主完成/失败/取消由独立宿主调用完整原方法，消费continuation并传stop_hook_active；structuredStart/Stop、memory Stop/Freshness统一provider排序，删除旧的分别执行，避免重复提取和反馈。TaskCreated/Completed、SubagentStart/Stop/TeammateIdle、compact前后、WorktreeCreate/Remove、InstructionsLoaded和图片HookInputProcessor均已接通。旧SessionHookManager/scoped兼容facade仍保留，但不再用于默认运行路径。

Stop只在completed且未abort时接续；preventContinuation、显式continueRequest和blocking feedback按原优先级。正常仲裁在没有continuation时发FinalStop，Stop自身异常转StopFailure。SessionStart忽略blocking，保存additionalContext/initialUserMessage并设置watchPaths；PreCompact仅返回allowed且未suppress的stdout，不补造额外阻断策略。完整产品SessionStart自动首消息、原SessionManager onResult的SDK interrupted/non-default/headless分支仍待移植，不能把独立main prompt的接线视为全部原结果生命周期。

工具wrapper保留callId pre-cache消费、value包装和输入浅合并、IDE变换/sandboxWrite/backup/支付/检查点依赖边界、truthy成功后PostToolUse及条件规则、失败PostToolUseFailure和Error hint追加。PreToolUse拒绝在execution try之外，不额外发Failure；updatedInput与command modifiedInput仍不混同。完整ToolHookManager恢复event-name判断、MCP专属updatedOutput、response_flag/thrown错误、持续时间、registered error resolver/原错误分类和Galileo调用参数。工具宿主仍保留显式审批guard；完整原ToolPermissionService/SDK暂停前PreToolUse缓存、PermissionRequest/Denied自动分派、MCP输出替换/elicitation、IDE/fileTrack/checkpoint/payment服务与遥测transport并未因此完成，未配置依赖明确为空adapter。

补齐原watchPaths `11015934..11016717`、last assistant helper `11017263..11017687`、trigger/session ID helper、可见消息/XML处理、完整ToolErrorCode/PermissionDeniedError、八个文件/命令匹配方法、七个shell发现函数和完整WindowsBashUtils。micromatch/which的15个factory原文保留，不猜版本升级。命令解析服务可显式注入，默认沿源码regex fallback；它不是安全分类器。watchPaths沿原fs.watch/递归/rename add-or-unlink，不加debounce或路径沙箱；与memory规则热加载watcher是不同服务。宿主close另行清本次拥有的watchers/children/timers，不改原方法逻辑。

验证：70个完整方法/函数AST、884次固定SHA比较，覆盖两个完整类、三个工具wrapper、输入/XML边界、权限/平台helper、错误码和15个factory原文。新增28项专项：默认真实SDK Hook上下文/阻断/Stop续跑/工具改写/失败回注、Task/compact/子Agent事件、真实自有node命令和once跨session、Prompt evaluator历史隔离、真实自有fs.watch与结束清理。Windows/故障/计时分支使用fake I/O；无真实产品账号/模型服务、联系人或桌面操作。

最新门槛：619项全量测试、541项最新编译JS smoke、34个源码差分、check/build/config及编译CLI help全部通过；六份原JSON、115 Prompt、memory policy和SDK/OpenAI固定版本不变。OpenAI Docs只核对审批/状态边界，不按现行文档升级SDK。整体目标继续进行，下一批优先原onResult/审批与Hook服务代理，再继续ProductManager/插件热刷新。

## Axonfire 仓库分层与本地 Web 宿主批次

按用户要求建立 axonfire-harness 仓库；还原基线保留为本地/远端历史提交。参照 deepseek-harness 的 apps/packages/docs 分层，但未导入其 Cordis/插件架构。原 src/config/test/scripts/tsconfig 整体移至 packages/harness，SDK 与模型依赖版本、原配置和 prompt 不变。原报告移至 docs/reconstruction.md 与本文件；历史根级路径按 packages/harness 映射。

新增 apps/cli 统一启动器、apps/web 本地工作台、npm workspaces、.env.example、根级全量差分入口和 CI 定义。新 Web 宿主明确不属于原版 UI 或原产品 Gateway：使用同一 createHarness 与真实 Agents SDK，支持流式文本、会话列表/恢复、上下文压缩、逐次工具审批、AskUserQuestion 和取消。离线 demo 注入固定模型，不调用远端服务或工具；不把它记作真实供应商验证。

Web 固定监听 127.0.0.1，校验 Host/Origin/CSRF，限制请求体，审批超时/取消/断连不会自动允许，单回合运行槽避免共享状态并发冲突；模型密钥不发送给浏览器，不序列化可能包含认证头的上游异常。不是 OS 沙箱、多用户服务或公网部署方案。

迁移后619项核心回归、541项编译 smoke、34组样本差分以及原配置哈希门槛通过。新增10项宿主测试，包括真实SDK通过Web调用Write的允许与拒绝、恢复与压缩、取消/断连、问答、输入和跨源校验。浏览器离线演示已实际运行并保存截图。样本差分的默认输入不再绑定本机目录，须显式提供原bundle路径或 WORKBUDDY_BUNDLE；原安装包/完整bundle不随仓库发布。

下一批核心还原顺序保持不变：原 SessionManager onResult/onResultError/SDK interruption、审批缓存与 ToolPermissionService / Hook proxy，然后 ProductManager/插件刷新。新的使用界面不代表这些原产品边界已完成。

## InterruptionService 完整结果分派批次

先纠正归属：此前报告将 Stop 完成/错误的剩余分派统称为 SessionManager onResult/onResultError；固定样本中 `11047102..11089570` 的拥有者实际上是 InterruptionService。核心方法为完整 `waitFor` (`11062476..11077211`)，不是另一个尚未找到的同名 SessionManager 方法。原 SessionManager 的 stream/history/gate 已在既有 SessionResultLifecycle 内恢复，两条订阅路径应分别保留。

新增 `native-interruption-result-dispatcher.ts`，直接移植完整 waitFor、continueAgentWithMessage、startupProfiler getter、sanitizeToolNotFoundMessage 及四个 retry helper。方法体仅把结果订阅替换为显式所有权桥接；容器查找、时钟、调度器和依赖工具在工厂闭包中注入，不拆分或重排原 catch/finally 分支。新入口默认接入 createHarness，移除 Root prompt 里另行执行 Stop、拼接续跑和错误补发 Stop 的代码。

保留以下源码行为：默认 Agent 完成传 `stopReason: completed`，消费 session hookContexts 中一次性的 stopHookActive，续跑通过 setImmediate 调度；非默认 Agent 的 Stop 不传 options，丢弃 continuation；child 不执行 root Stop。headless deferred 可能在分支和 finally 重复 resolve，并非改造成一次性事件。结果中断标志在分派前打 stamp；最终 agent_end 只在 model_done/idle 发出，避免覆盖新 run。silentAbort 将没有结果的 call 标 incomplete、清 silentAbort 并不执行 failed Stop。完整错误分支保留 pending call 回填、网络/首 token/流超时/模型错误的优先顺序、次数上限、提示原文、队列开关与 finally 的 resultAbortSignalMap 删除。

完整 continueAgentWithMessage 保留 5 秒 idle wait、前后两次 abort 检查和源码的计时器行为：异步 idle 变化回调不清 timeout，只有立即 idle 检查清除；宿主关闭时另外清理本次拥有的剩余计时器。独立宿主在调用服务或 Stop 前等待自己的历史消费者刷盘，并跟踪 setImmediate 续跑的发布完成，使 CLI/Web 不先返回旧回合结果；这些显式桥接不计作原产品逻辑或 SDK 重写。

验证：8 个完整方法 AST、902 组固定 SHA 行为差分，覆盖默认/非默认/缺少 lastAgent、child/abort/interruption、Stop continuation/active/异常、final/非 final、队列开关，以及网络/模型/语法/包装错误/鉴权/流超时和 silentAbort。新增12项专项，包括真实SDK终止失败/取消恰好一次 Stop、网络重试后唯一 completed Stop、绕过 root prompt 的非默认 Agent 完成。既有默认 Stop 续跑、真实 SDK 工具审批与子 Agent 回归继续保留。

边界仍明确：本批恢复的是完整结果分派，不是完整 InterruptionService 类。审批队列、handleInterruptions 的 ACP/SDK interrupt 拒绝路径、requestSdkPermission/PermissionRequest callbacks、完整 ToolPermissionService、PreToolUse 审批缓存和 MCP Hook proxy 仍待进一步移植；此前的兼容审批宿主仍提供可用功能，不能把它等同于原实现。ProductManager/插件热刷新随后推进。OpenAI Docs 仅核对审批应从 RunState 恢复的边界，继续锁定本地 SDK 0.5.2。

REA 对本次选定单 bundle 的受限重分析在 45 秒预算内超时；不把失败输出视为新的证据或提高覆盖率。继续使用此前 REA 证据链、固定 SHA 校验、原方法 AST 与原样本 VM 差分。原安装包、完整 bundle、超时分析日志均不进入发布仓库。

本批门槛：631项核心测试、10项Web宿主测试、553项编译JS smoke、35组样本差分、check/build/config和CLI/Web实际启动全部通过。六份配置JSON、115个prompt、memory policy及SDK依赖锁定版本保持不变，发布前基本凭据/运行记录扫描未发现命中。目标仍在进行，不宣称整个harness已100%恢复。

下一批已定位的原类：ToolPermissionService `11948949..11968077`，包含 checkPermission/doCheckPermission/needsApproval、PermissionRequest/Denied、executeAndCachePreToolUseHooks/cachePreToolUseResult、策略/规则/危险命令与更新持久化等27个方法（含constructor）；另一个 preToolUseHookResults.set 位于 DeferExecute 包装 `12008364..12018235`，不可仅恢复前者便认为缓存链路完整。随后对接完整 handleInterruptions / requestSdkPermission，再继续 MCP Hook proxy 与 ProductManager/插件热刷新。这些定位本身不计为已恢复代码。

## 完整 ToolPermissionService / 规则 / 风险与审批缓存批次

完整 ToolPermissionService `11948949..11968077`（27方法含constructor）、完整 PermissionUtils `13340331..13350579`（31方法）、完整 CommandUtils 与模块级辅助函数/正则表 `13050284..13060942`，以及 Default/AcceptEdits/Plan/Bypass/Work/Delegate/DontAsk/Auto 八个原策略均已直接移植。另恢复 BaseTool 与13种具体工具的权限参数/类型/别名元数据、完整危险allow规则过滤器、模块75753的host识别缓存。方法体只加TS类型，实例字段/容器/时钟/进程和宿主服务在外层工厂注入；没有按测试结果重写权限优先级。

保留原先后顺序：deny → 可信allow → 非print命令安全检查 → ask规则 → bypass可用性与危险命令判断 → 非可信allow → 非MCP策略 → 不可提示时deny → 默认ask。可信allow本身可越过命令安全检查，未信任目录的project/local allow不能；Auto过滤危险allow。规则deny只需匹配一个子命令，命令allow必须所有子命令都匹配；重定向不按普通前缀allow。MCP权限按精确名/server/server wildcard处理，不借用builtin aliases。完整doCheckPermission和mode finalization的DontAsk、Auto降级/熔断/超长/denialLimit/headless abort分支均在本批范围。

needsApproval完整恢复PreToolUse、PermissionRequest/Denied分派、deny不要求SDK审批但缓存拒绝的协议、回调updatedInput、无callId时抛原PermissionDeniedError，以及异常回退ask。原DeferExecute构造器的整个审批arrow和defaultNeedsApproval单独移植为native-defer-approval：包装器deny写缓存、mandatory判断、intrinsic true、MCP/bare名和target参数解析顺序均保留；其余Defer执行/MCP转换仍沿既有实现，不能据此认为整个原类都已替换。

真实SDK0.5.2验证发现needsApproval在首次暂停和state恢复时均会重新运行，因此PreToolUse可执行两次并覆盖同一个callId缓存，执行包装只消费最后一次缓存。本批保留该行为，不增加源码不存在的“已有缓存则跳过”。测试分别证明直接Write、cached deny不触达文件系统、PermissionRequest改写、Defer外层deny不执行target Pre以及已索引Defer builtin审批后的实际写入。所有写入都在自有临时目录，危险命令只作为分类器字符串输入，从未执行。

宿主入口：createHarness返回permissions（service/permissionUtils/strategies/commands/pathUtils与initializeContext），`nativePermissions: true`显式连接BaseTool默认needsApproval和Defer SDK callback；permissionHost可注入scoped settings、auto classifier、sandbox配置/信任/Hook adapter。为避免把未恢复的审批控制器伪装成原实现，该SDK路径暂不默认启用。现有默认CLI/Web审批仍可用；独立执行guard继续保留，所以原PermissionRequest allow不自动撤销宿主额外审批。默认scoped settings更新保存在宿主内存中，不声称已恢复原SettingsManager的磁盘持久化；Auto backend未配置时明确不可用，不调用真实模型或伪造分类结果。命令策略是否为WorkBuddy Desktop按原CODEBUDDY_HOST/argv缓存检测，不能因分析对象是桌面应用便对独立CLI硬编码true。

验证：118个完整方法/函数AST、18张原正则/常量表AST、1,920组原样本行为比较；新增21项专项包含5项实际SDK直接/Defer运行验证与权限别名的跨宿主隔离。配置中的115个prompt、原JSON和SDK/OpenAI锁定版本不变。OpenAI Docs仅用于核对审批从RunState恢复的边界，SDK重复回调事实以锁定版本源码与实际测试为准。

下一批优先完整InterruptionService审批控制器（approve/reject/queue/handleInterruptions/requestSdkPermission/SDK hooks与denials），对齐默认SDK接线与兼容审批宿主，再补MCP Hook proxy、AutoMode classifier backend、SettingsManager持久化、ProductManager/插件刷新；本批未把这些依赖标成完成。

最新门槛：652项核心测试、10项Web宿主测试、574项编译JS smoke、36组样本差分、check/build/config和CLI/Web实际启动全部通过。发布前基本凭据/运行记录扫描未发现命中，未升级任何SDK或模型依赖。整体目标继续进行。

## 完整 InterruptionService 审批控制器批次

`native-interruption-service.ts`直接移植原类 `11047102..11089570` 的完整constructor及其余32个成员，复用此前完整结果分派的外部依赖绑定，不再用手写兼容handleInterruptions代表原实现。另直接移植ToolAlwaysApprovalService `11939394..11942161`（11成员）、BackgroundTaskToolApprovalService `6987547..6988678`（4成员）、原Deferred/CustomError/ErrorUtil、四个审批异常类和两个trace取消helper。完整class/member AST去除TS注解后与固定SHA样本比较；仅waitFor的结果订阅改为显式所有权桥接，原容器、时钟、诊断和客户端依赖在工厂闭包注入。

原approve的always分支委派helper，由helper检查风险、记录签名、applyUpdate后批准state，控制器不额外强造state.approve。Session缓存跨工具共享同一session Set的原结构保留；child审批可同步main。危险Bash和ExitPlanMode不加入always缓存，但本次人工同意仍批准。后台任务原approve helper与handle各调用一次state.approve，保留重复调用，不按“理想实现”去重。

队列保留对象身份键、main/child/team缓存、sourceSession fallback、sandbox全局pending占用与orphan迁移、head元数据、广播参数和清理顺序。只有sandbox出队/取消触发原跨队列提升，普通队列不补造相同行为。原sandbox批准不额外发permissionResolved；拒绝与cancel的广播仍按原分支。控制器原方法返回undefined，兼容facade在外层转换为已有boolean/count接口。

完整handle保留后台/direct-approve mode ceiling、FullAccess/子AcceptEdits/Bypass的优先级、危险命令与mandatory Defer例外、always缓存和同工具pending检查、workflow源码预载、200ms UI延迟、pre-hook reason回填、Notification best-effort、local/channel race、deny_and_exit_plan模式恢复、abort与compaction区别。CLI普通拒绝silentAbort+abort+agent_end并异步发送工具特有skipRun结果；ACP或SDK interrupt拒绝中止且root发interrupted Stop，不进行拒绝续跑。compaction catch只break，不设置普通拒绝标志，所以末尾仍调用state continuation，这是固定样本行为，未擅自“修正”。

SDK请求保留缺失callId直接approve、参数JSON解析失败转reject、PermissionRequest回调顺序、空transcript_path/cwd/callId和timeout秒转毫秒（默认60s）、单callback异常仅warn并继续、result-owned abort signal、updatedInput浅合并、精确permissionDenials字段以及SdkPermissionDeniedError.interrupt。缺失callId自动approve属于原行为，不代表宿主会绕过独立执行guard。外部SDK客户端/Hook callback transport没有伪造实现；默认不可用依赖明确拒绝/为空回调集合。mandatory target判断仍为显式adapter，未冒充完整ModelUtils支付/高额度服务。

嵌入API新增`nativeApprovals: true`与`approvalController`，可和`nativePermissions: true`组合。原类通过InterruptionService facade接入；独立宿主在class外等待自己的历史消费者，并跟踪原fire-and-forget service.run和setImmediate续跑，使prompt不会提前返回旧结果。Deferred原constructor不改；外部所有权子类只观察200ms UI窗口内可能发生的早期拒绝，避免Node未处理拒绝。skipRun结果落盘后关闭宿主gate，不强迫再生成一次模型结果。宿主close清理本次拥有的订阅和计时器。

stream-json且非ACP时，不与本地approveTool同时竞争，沿原SDK客户端路径；显式人工SDK客户端allowed后登记宿主guard授权，拒绝不登记，输入改写真正传到工具。Hook PermissionRequest allow与SDK人工客户端同意仍是不同来源，前者不会隐式撤销独立guard。CLI/Web默认保留兼容控制器，两项native选项均未默认启用；不能据此宣称所有入口已经统一为原产品协议。

验证：58处完整成员/helper AST、1,100组固定SHA行为比较，包含完整控制器waitFor桥接、模式/child/后台/六种决策、危险/mandatory工具、SDK/ACP/缺ID/回调故障/interrupt矩阵、channel/ceiling/workflow、跨会话sandbox与普通队列。新增20项专项，其中6项使用实际SDK和自有临时目录，覆盖批准暂停恢复/实际Write、拒绝skipRun历史、Defer路由、SDK客户端真实输入改写、interrupt拒绝和取消前无文件副作用。危险命令仅为分类器字符串，不执行；没有访问真实产品账户、联系人、远端模型或桌面。

本批门槛：672项核心测试、10项Web宿主测试、594项最新编译JS smoke、37组源码差分、check/build/config和实际CLI/Web launcher验证通过。六份原JSON、115个prompt、memory policy与固定SDK依赖保持不变。OpenAI Docs只用于核对SDK审批状态边界，不按现行文档替换锁定版本。

下一批优先SDK PermissionClient / SDKHooksManager transport与MCP Hook proxy，随后统一默认审批接线，再推进AutoMode classifier backend、SettingsManager磁盘持久化及ProductManager/插件刷新。完整控制器方法已恢复不等于其所有外部产品服务完成，整体目标继续进行。

## SDK 控制客户端、JSONL 与初始化协议批次

直接移植12个完整原类：StdoutWriter `7794169..7794674`、SdkPermissionClientImpl `7795251..7796834`、SdkHooksManagerImpl `7797641..7800832`、SdkMcpMessageClientImpl `7801845..7803380`、SdkElicitationClientImpl `7804207..7805343`、ControlSignalHandlerImpl `7806184..7808272`、SdkInitializeStateServiceImpl `7810342..7810807`、InitializeHandler `7811554..7814144`、SetPermissionMode/GetAvailableModes/GetAvailableModels/SetModel四个handler。补原control predicates、HOOK_EVENTS/60秒请求配置/产品环境值、Deferred与createAbortController无限监听helper，以及SessionManager `10977093..10977351` 的四个override map方法。class constructor和方法体仅加TS注解；stdout、clock、timers、Deferred所有权与容器服务在外层注入，不改原JSON协议字段。

权限请求使用perm_、默认不创建timeout，仅显式正timeout生效；can_use_tool保留agent_id/permission_suggestions/blocked_path/decision_reason的truthy展开。成功返回allowed默认false及reason/interrupt/updatedInput；错误、单次取消/全取消按原错误文本清理Map和timer。Hook请求使用hook_、默认60秒，executeHooks按matcher构造所有callback并Promise.allSettled，聚合保留deny > ask > allow、system/additionalContext顺序和最后停止原因。即使已有deny，后续allow的updatedInput仍可复制进结果；未擅自删除该字段。clearHooks清请求但不清capabilities，setHooks不取消既有pending，invalid regex回退精确文本。

MCP message客户端使用mcp_，携带server_name/message，成功必须有truthy mcp_response；abort/listener cleanup/cancel保留原路径。elicitation使用elic_，create可取消，complete发送control_notification(channel:elicitation)。这两个客户端是SDK控制通道的一端，不等于已恢复SdkMcpServer/transport或MCP Hook proxy。

ControlSignalHandler按三种消息类型和四种response ID前缀路由，request按subtype provider查找；保留60秒超时、cancel abort、handler失败回复error、未知subtype错误和finally清理。StdoutWriter按原JSON.stringify+换行、write(false)后drain、批量flush及部分splice保留背压行为，没有重排或重复输出。InitializeState仅由markSynced推进fingerprint；clear本身不推进，因而可能连续返回true，这是原行为。

Initialize完整保留环境/endpoint优先级、Hook与capabilities配置、elicitation form标记、MCP注册与SDK overrides并行、ProductManager.sync(true)/失败返回/重建屏障、命令/样式/模型/原账号字段映射。SetPermissionMode原支持六种，而availableModes仍只列四种，文案不替换；Plan初始化计划路径；当前session不匹配拒绝，尚无session但给ID时存override。SetModel同时更新requestOptions/options/CLI settings/override；GetAvailableModels按原排除url/apiKey后返回rawModels。未新增原类不存在的“全字段脱敏”行为，也未接触真实账号。

新增createSdkControlHost，返回原clients/control/init state，receive/receiveLine处理调用方提供的控制对象/完整单行。所有输出只写显式提供的Writable式对象，不自动绑定stdin。外层所有权观察原unused Deferred拒绝、close清pending/timers/drain listeners、禁止关闭后再发新请求，不结束调用方stream。原类sendRequest抛错的清理行为没有修改；host shutdown另行清本次拥有的状态。既有class原方法与host adapter分开标注。

createHarness的显式sdkControl默认启用nativePermissions/nativeApprovals，并连接同一原SDK hooks manager与权限客户端。新会话inputFormat:stream-json、不竞争本地UI；SDK允许后登记独立guard授权，真实input rewrite通过工具执行验证。断连取消请求后不再启动后续模型run，harness.close也会关闭其拥有的SDK控制组件。初始化基础metadata、available modes/models、模式/模型更新已注册；默认account:null，绝不把模型API key映射成产品账号。动态system/append/agents覆盖在ProductManager adapter缺失时明确错误，环境切换与SDK MCP创建依赖同样不可伪装成功，原完整handler仍可通过显式initializeDependencies组合验证。

验证：75处完整方法/函数AST、3组常量表检查、794组固定SHA行为比较。覆盖四类客户端请求/错误/缺payload/取消/超时/abort与晚到响应、Hook顺序/匹配/聚合、控制超时/取消/provider失败、initialize环境/账号/同步失败/重建、六种模式/缺session/mismatch/model更新矩阵。新增21项专项，其中6项经真实SDK，验证JSONL人工批准与实际Write改写、interrupt拒绝无文件副作用、Pre两次/Post/Stop回调、initialize/modes/model状态、真正pending权限请求的断连清理与不续发模型。其余使用自有临时目录、假时钟/消息/账户/输出，不访问安装应用令牌、真实模型或联系人。

本批门槛：693项核心测试、10项Web宿主测试、615项编译JS smoke、38组差分、check/build/config和实际CLI/Web启动均通过。固定SDK/OpenAI依赖、六份配置JSON、115个prompt与memory policy不变。OpenAI Docs仅核对SDK生命周期边界，不用当前文档改写锁定0.5.2的运行行为。

剩余边界：普通CLI/Web默认仍为兼容审批宿主；SDK控制组件不等于原stdin/headless startup或鉴权命令全集。完整McpServerManager `9186841..9198615` 的server/tool/Hook proxy、SdkMcpServer与重写transport已定位但本批没有把定位计为实现；下一批优先恢复其完整依赖链。之后继续ProductManager动态初始化/插件刷新、Auto classifier backend、SettingsManager磁盘持久化，并统一原policy allow到执行guard的默认语义。整体目标保持进行中，不以当前门槛代替最终完成标准。

## MCP 原生 proxy、transport 与 SDK server 批次

本批延续固定5.3.14样本和REA证据，不执行整个应用bootstrap。以下均为bundle UTF-16索引，不是字节偏移；类方法仅加TS注解与外层DI，不将新宿主逻辑记为原源码。

- stdio两类 `9163484..9167354`、`9167384..9168040`；SSE两类 `9168078..9172056`、`9172084..9172734`；HTTP两类 `9172783..9176847`、`9176886..9177569`。
- SdkMcpTransport `9177633..9178529`、SdkMcpServer `9179086..9185768`，McpServerManager `9186841..9198615`，McpTransportManager `9284064..9285512`。
- 完整McpSubagentToolManager `9288945..9289339`、McpUtils `13306418..13309176`；结果处理13函数 `9153118..9157667`，UI三函数 `9306064..9307806`，另恢复span/header/progress/sideband/channel/配置指纹helper。原JSONC module52537 factory逐字保留，不猜替代npm parser版本。

原server/tool proxy包含schema归一化、工具前缀/transparent aliases/builtin passthrough、defer overlay和子Agent白名单、needsApproval、PreToolUse改写/拒绝/错误best-effort、PostToolUse与payment替换顺序、非枚举is_error/_meta、sideband与UI广播。保留原空builtin分支，不将其误改成缺失实现；原SDK server.callTool只接受两参数、不转发第三参数progress/meta，也不按新版SDK行为“修正”。

remote override恢复listTools缓存/30秒失败cooldown、原toolFilter、call timeout/signal/progress、模型X-Model-ID的AsyncLocal隔离、错误清理和close。McpUtils默认tool timeout为原值100,000,000ms，不能误写成100秒；配置写入保留原atomic/symlink/模式/fallback。结果保留原4*token字符预算、image不计数且保留、audio/resource/link截断、大结果父/子Agent目录与完整读取提示。channel helper保持原SDK/generic的不同bypass分支；未用真实联系人验证。

`native-mcp-host` 是明确新增的拥有者：只连接显式配置，注入DI、管理timer/subscription、等待创建及关闭，包括原disposeUnderlying已移除但仍异步关闭的旧连接。重复initialize复用相同活跃transport，不重复SDK握手。stdio依赖调用方Hook endpoint；默认抛错。OAuth默认不伪造登录，产品channel security/支付/遥测/ACP传输仍需显式adapter。

两处跨模块接线由真实SDK测试发现并对照源码修复。其一，完整顶层McpManager（尚未移植）在`9201138..9223000`持有稳定connectedServersCache并splice更新，而AgentManager.refreshAgentTools不会替换mcpServers；独立registry现遵循相同live-array契约，初始化后添加和删除工具均可见。其二，样本SDK mcpToFunctionTool会转发needsApproval，但npm固定0.5.2未转发。AgentFactory仅在安装SDK转换后补这一descriptor字段，保留SDK依赖、转换器和缓存，不修改node_modules/不vendor SDK源码。允许/拒绝实际调用真实SDK验证，拒绝时无底层tools/call。

嵌入API提供`nativeMcp`、`connectNativeMcp`与`nativeMcp.delete/close`；`sdkControl`默认接入同一宿主，原initialize可添加SDK MCP server。普通CLI/Web不新增假称原版的配置flags；默认兼容审批宿主不变。独立MCP依赖按样本固定别名`mcp-sdk-native = npm:@modelcontextprotocol/sdk@1.24.3`，此前lock中的已有包版本未变，OpenAI SDK/OpenAI版本不变。此次安装audit为16项（9 moderate / 7 high），未做改变还原行为的强制升级。

`verify:mcp-native`核对12个完整类的全部成员与34个helper，共157处AST，另逐字核对JSONC factory；752次差分为400个proxy矩阵、64个filter/defer矩阵和288个大结果比较，使用隔离VM与fake I/O。McpUtils/UI等完整类/函数主要由AST覆盖，不把752次比较夸大成所有方法全行为状态空间。30项专项覆盖原hook/alias/meta/whitelist、JSONC自有临时文件、结果落盘、transport abort/cooldown/progress/并发header、稳定proxy/cache、关闭屏障；真实SDK经JSONL MCP allow/deny/重复initialize，及真实stdio子进程、loopback HTTP/SSE和完整harness审批/执行/删除均通过。未用真实账号、产品服务或远端模型。

本批门槛：723核心测试、10Web宿主测试、645最新编译JS smoke、39组样本差分、check/build/config、CLI/Web实际启动全部通过。六份JSON/115 Prompt与memory policy哈希保持不变；OpenAI Docs仅辅助核对MCP集成边界，不以现行文档覆盖锁定SDK行为。

下一批优先完整顶层McpManager配置来源/代次reconcile/权限/索引与热刷新，之后ProductManager动态初始化、SDK输入/鉴权与Hook服务端、Auto backend和SettingsManager持久化。完整ServerManager不等于完整产品McpManager；整体目标继续进行，不宣称100%完成。

## 顶层 MCP 配置、代次投影与热刷新批次

本批保持固定样本SHA、REA证据和SDK版本，不执行原应用bootstrap。完整移植14个原类，以下仍为UTF-16索引：McpManager `9201138..9223000`（constructor及48个方法），McpConfigManager `9227386..9235183`、McpConfigStore `9237347..9240044`、McpConnectionManager `9240751..9243796`、McpPermissionsManager `9277575..9279382`、McpToggleManager `9280501..9282018`、McpLogService `9283117..9283188`；McpServerModelImpl `9286093..9286776`、McpServerModelManager `9287338..9288224`、McpReadyService `9290013..9291502`、McpCliConfigInitializer `9292999..9293699`、McpConfigEnvExpandService `9294448..9295818`、McpConfigDiagnosticsManager `9296334..9297907`、McpPluginRegistry `9301052..9301648`。

另恢复stableConfigValue/computeProjectedConfigFingerprint `9200766..9201128`、isTransportAlreadyStartedError `9240666..9240744`、完整环境展开helper `13069545..13069734`（保留原`${UPPER_CASE:-default}` regex），PathUtils.getMcpFilePath/resolveMcpFilePath `13328983..13329658`。原module73850的scope/status/priority/默认配置/diagnostic severity/文件名/shortDescription常量与原factory导出比较；startup phase使用原mcp_config_load。ObjectUtils.copy边界保持原JSON stringify/parse语义，不以structuredClone替换。

顶层manager保留原优先级internal > sdk > dynamic > local > project > user > plugin；投影指纹包含完整归一化配置和allowed决策，稳定传输指纹不变也可触发proxy配置投影。保留desired/projected/queued revision、失败后tail恢复、并发list等待稳定尾、runtime generation、连接与索引提交屏障、旧model/orphan状态过滤、拒绝期间晚到create的二次清理，以及旧listTools/defer/index结果的丢弃和当前代索引恢复。原连接active并不自动可见；对应代次索引提交之后才splice进同一个connectedServersCache。SDK类型按原逻辑跳过defer索引。

ConfigManager保留同scope的inflight读合并、原type推断字段与typed对象透传、plugin组件合并、dynamic初始化10秒race/缓存优先、setting source过滤、filesystem/plugin失效、per-read环境展开与diagnostic去重。ConfigStore保留JSONC注释/无关字段、project-local的projects[workDir]嵌套与atomic写入。两个容易被“顺手修复”的细节现专门锁测试：文件配置delete不会自动抹掉已缓存的scope view，需要显式invalidate；read(PLUGIN)分支先于shouldLoadFromFilesystem，不能把strictDynamic误改成禁读所有特殊scope。

ConnectionManager保留同model的inflight join、不同model supersede、Unauthorized状态和already-started恢复、reconnect/disconnect分支；模型保留状态变化去重、原Emitter/随机state及scope优先级。项目配置批准先于transport创建，CLI settings覆盖project-local批准设置；toggle按原project或local作用域写disabled列表。Ready服务等待的是配置触发而非强制所有网络就绪；指定name/timeout/abort的settle等待由原manager负责。原CLI配置initializer支持inline JSON或显式文件、strict flag和once guard，但未据此宣称完整CLI parser/产品启动已恢复。

`native-mcp-projection-host` 为明确新增owned composition：注入scoped settings、插件来源、FS/home路径、clock/DI；跟踪订阅、setImmediate、inflight连接及异步清理，关闭屏障等待创建/重建与旧实例close；不修改原类决策。McpRegistry在native模式转发真实manager/ready/cache，旧compat模式保留旧settle等待行为；原生连接不再接受手工register绕过配置。root的nativeMcp默认使用同一AgentManager显式plugin来源，可单独覆盖；插件加载器和ProductManager的自动刷新事件仍未实现。

显式nativeMcp现在与sdkControl一样默认启用nativePermissions/nativeApprovals，使ToolSearch→DeferExecuteTool→MCP真正使用原权限检查与暂停/恢复。调用方仍可明确覆盖开发者开关；不能据此把关闭native后的compat路径当成完整策略。普通CLI/Web默认不变。用户/全局MCP路径默认重定向到owned state/mcp，filesystemScopes默认空，不读取安装应用配置；显式project写入仍修改调用方项目文件。原项目批准settings默认仅内存，可注入自有持久化list/set；完整SettingsManager磁盘服务仍待补。

`verify:mcp-manager`共146处完整类成员/函数/Path方法AST，另核对module常量；279次有限行为比较为168个scope/批准/defer/连接失败/禁用组合、32个项目批准决策组合、16个替换/索引刷新/toggle/删除流程、7个环境helper输入、28个strict/source/scope读取矩阵和28个remote/stdio环境展开矩阵。独立VM直接执行原类，服务/FS/clock/网络均为fake；跨realm Promise可能让独立日志交错，比较日志的值/数量而非任意调度顺序，关键提交/撤销顺序由手动gate专项验证。有限矩阵不证明全平台/并发/产品状态空间100%。

新增25项专项覆盖上述主链、同scope缓存失效/队列竞态、晚到索引/create清理、orphan状态、settle abort/timeout、JSONC真实临时文件与嵌套、env/diagnostics、toggle、CLI strict初始化、prompt title alias、OAuth接口边界和plugin registry。真实SDK两例均先验证project批准前无HTTP握手，再批准配置、索引后ToolSearch→DeferExecute→自有loopback HTTP；允许时只执行一次，拒绝时无tools/call，之后撤销配置清空连接和索引。没有真实账号、外网模型、联系人或桌面操作。

本批门槛：748核心、10Web宿主、670最新编译JS smoke、40组样本差分、check/build/config及CLI/Web实际启动通过。依赖锁、SDK/OpenAI版本、六份JSON/115 Prompt和memory policy哈希均未修改；当前旧依赖audit 16项风险未强制升级。下一批优先完整ProductManager初始化覆盖、配置/插件跨服务刷新、命令物化，再补SDK输入/鉴权/Hook服务端、Auto classifier backend与SettingsManager持久化；整体目标继续进行，不能以当前完整MCP类群或可编译启动代替整个harness最终完成。

## ProductManager、原合并策略与动态配置发布批次

保持固定5.3.14样本/SHA与REA证据。完整ProductManagerImpl `15588491..15597577`（constructor及17个成员）已移植；缓存key/endpoint/env/version key、MAX_CACHE_TTL=480000、PROXY_SYNC_THROTTLE_MS=2000及PRODUCT_CONFIGURATION_CACHE_TIMEOUT=480000均按原值。以下位移仍为UTF-16索引，方法仅加TS注解与外层DI。

完整五策略：Override `15599132..15599242`、Merge `15599371..15599892`、SmartMerge `15600057..15601365`、DeepSmartMerge `15601498..15602636`、CommandsSmartMerge `15602777..15603887`；DefaultProductMerger `15604751..15605166`。保留undefined/null/数组/primitive语义、按id/name合并、Symbol.for('@genie/product:overrideMode')的replace锁、builtInMarketPluginsMerge原路径例外、deep primitive去重/循环WeakSet、commands路径和Galileo四字段不完整时禁用/清字段。优先级provider排序按原Prioritizeable规则：正值、降序稳定sort，ProductManager再reverse，因此同优先级应用顺序也反转，不能用随手的升序sort替换。

原provider与renderer首批完整类：CliOptionsProductProvider `9877981..9880084`、SdkInitializeProductProvider `9881205..9881847`、PluginsProductProvider `9912987..9913726`、McpPromptProductProvider `9915058..9916130`、DefaultProductProvider `15261645..15261742`、ClientProductProvider `15628995..15629918`、EnvProductProvider `15639250..15640120`；McpPromptRendererImpl `7652318..7654310`。原Agent-definition转换/system-prompt override两函数 `9876813..9877412` 一并恢复。补完整GzipUtils `15627963..15628249`、MemoryLocalStorage `15669496..15669815`，默认分别使用Node zlib与自有内存实例，不扫描安装应用缓存。

ProductManager保留sync/finally队列、stable与volatile快照、强制标记、条件独立/endpoint-dependent prefetch、发布Proxy、data level防止晚到cache覆盖新server结果、gzip/base64缓存及endpoint/environment恢复、过期读取节流、网络环境解析和完整feature过滤。源finally链若先前拒绝，后续doSync可运行但返回的Promise仍保留旧拒绝，这个怪异语义也有回归，不改成“成功恢复”。DisableMultimodalGeneration追加的中英capability_constraints整段文字通过完整AST保留，重复过滤不追加；terminal变量和bundled skill basename过滤亦保留。原六份JSON/115个registry prompt未修改，新增内嵌文案不伪算为新增registry prompt。

constructor.name是本批独立核查点。原manager用可读provider名称字符串判断prefetch，而压缩包相关类是tB/tI/tz/tV/eE或eS=eu等匿名赋值名；Component decorator仅登记元数据，不重命名。移植后通过显式name descriptor保留样本名称（公开类接口仍用原导出名，例如CliOptionsProductProvider），不因可读TS类名意外激活原包未命中的分支。差分另用真实命中名单的named fake provider覆盖条件并行分支，不将该分支测试当作所有默认provider在样本中都并行。

完整ConfigWatchServiceImpl `9893732..9902774`、McpWatchServiceImpl `9904348..9905553`恢复，合计19个完整原类。保留2秒watch setup、3秒change debounce、rename即时刷新、文件类型过滤、CWD失效/重绑、memory/settings/skill/plugin/MCP缓存调用、Windows目录512阈值与递归失败降级、EMFILE停用、MCP connected/disconnected合并sync。新增owned host跟踪setup/Promise/subscription/FS watcher、关闭中的初始化与发布，避免晚到任务在close后重挂载；不改原watcher决策。依赖中缺少完整SettingsManager.clearCache/插件服务时，仍按原能力检查处理，不以空方法计为已恢复。

默认createHarness现使用原ProductManager，固定JSON作为base客户端快照；现有Skill provider与显式commands/skills参数通过标记清楚的宿主provider接线，额外provider可显式注入。每次发布更新同一个ProductConfiguration视图及其索引，清ToolManager描述cache、刷新CommandManager，并经原onDidChange重建eager AgentManager。SDK initialize真实应用systemPrompt/appendSystemPrompt/custom agents，等待原重建屏障，不再是假成功或默认“依赖缺失”。插件组件provider忽略settings字段，volatile重放从稳定快照开始，移除插件不残留其instructions/命令。MCP prompt provider、原renderer与Command interceptor已打通，引号参数/剩余参数、角色和资源文本按源码转换。

独立Product host默认环境对象为空、缓存为自有MemoryLocalStorage，home/watch路径为当前state/工作目录；不读取原账号/安装缓存，不请求原配置服务。显式productRuntime.env/storage/providers可注入自有来源，模型API key仍不映射为产品账号。当前接入的是完整manager与首批provider，不是整个provider注册表：Cloud/Models/Agent-model/CustomAgents与CustomCommands文件发现、完整ProductEnvService、API-key-helper及插件原子跨服务刷新事务仍待补。ConfigWatch看见commands/agents文件变化只会调用sync，不能据此声称尚缺的文件发现provider已工作。完整stdin/CLI鉴权/Hook服务端与SettingsManager磁盘也仍未恢复。

`verify:product-manager`核对112处完整成员/函数AST，包括19类与两helper，另验证原module常量和manager静态字段；743次有限比较：五策略11×11输入共605组，24组stable/volatile/错误/名称分支同步流程，6组sync/async缓存，108组platform/512阈值/changeType/rename-change watcher矩阵。原factory/类在独立VM执行，FS/clock/provider为fake；合并顺序按最终值验证，独立日志交错按值/数量比较。有限矩阵不是所有provider、平台或并发状态空间100%。

新增27项专项覆盖策略/循环/replace、gzip/cache晚到和finally失败、命名分支、proxy节流、feature prompt、原SDK/CLI/Env/Client provider、优先级、watch路由/EMFILE/Windows、取消与发布错误恢复。三条真实SDK链路验证initialize prompt/custom-agent确实进入模型请求、插件移除后的Agent/命令刷新、原MCP prompt经自有loopback HTTP回注；另用真正的owned fs.watch rename验证skill配置刷新，测试等待期间仅ref自有watcher，结束关闭。均不使用真实账号、外网模型、联系人或桌面。

本批775核心、10Web宿主、697编译JS smoke、41组样本差分、check/build/config与CLI/Web实际启动通过；固定SDK/OpenAI、依赖锁、六份JSON/115 Prompt与memory policy保持不变。OpenAI Docs仅核对Agent instructions/运行时上下文边界，实际行为仍以锁定SDK与原样本为准。整体目标继续进行；下一批优先原CustomAgents/CustomCommands发现器、Models/Agent-model provider及插件刷新事务，再推进环境/SDK启动与剩余宿主服务，不以本批完整类群宣称整个harness已100%完成。

## 文件发现、模型来源/解析与企业策略批次

本批补齐上一批明确缺失的文件/模型provider，不替换SDK或六份原JSON。以下仍为固定SHA样本的UTF-16位移，不是字节位移。

- 完整CustomCommandsProductProvider `9884646..9886370`、CustomAgentsProductProvider `9887502..9889624`、ModelsProductProvider `9908398..9911296`、CustomModelsProductProvider `15631247..15637656`。
- 完整AgentModelResolverProvider `15242324..15243876`、AvailableModelsFilterProvider `15244778..15245391`、EnterpriseCustomModelPolicyFilterProvider `15215137..15216830`、CraftToCliAgentModelsSyncProvider `9883035..9883686`。8个provider默认加入同一个原ProductManager，不是只导出未使用类。
- 完整EnterpriseCustomModelPolicyServiceImpl `15218023..15226745`、CliEnterpriseCustomModelPolicyServiceImpl `15205780..15209592`、PolicyDiskCacheImpl `15211363..15212558`、CloudEnterprisePolicyService `15212826..15214360`。CLI策略服务默认接入；Cloud服务完整类可显式使用，不冒充Cloud product provider已恢复。
- 完整DirectoryScanUtils `13223474..13224875`、ColorUtils `13220744..13223330`、MissingPluginUserConfigError `9813953..9814156`。原Path四个目录方法、环境变量展开、两种加载时变量方法及13个plugin变量/环境/Hook配置函数一并恢复。简单frontmatter复用已恢复MemoryMarkdownUtils，完整YAML复用原74模块parser。

模型能力目录与类型/策略常量保留原纯module factory：55119/66954/95198/47023/17489/90276的原文gzip保存在独立文件，解压后合成文本SHA-256 `914831e9049e5296cd6211bd03b0d15cb7b6a5b2e12c8220af1a5d30a6bcacea`；不是安装包或SDK代码副本。Ceph检测82005完整factory单独保留，并验证其AST。目录元数据是固定样本快照，不代表当前模型服务可用性或推荐。

文件发现保留project后user数组顺序、嵌套命令冒号名、大小写敏感`.md`、canonical realpath、symlink循环去重、100深度上限与Ceph跳过；命令与Agent的两种frontmatter不能混用。加载时变量保留session占位到运行期，plugin敏感option在content中保留原提示，不泄露实际值。模型配置保留user/project两阶段merge、原disabled默认、custom-local前缀/alias、URL的replace symbol、env解析、能力补全和availableModels原列表规则；项目primitive列表可替换user列表，并非无条件union两层。

企业模型接口保留480秒cache、30秒起指数退避/300秒上限、force绕过、旧成功结果fallback和chat模型反向unshift关系。Agent模型解析只按id/name，不按alias，variant置前、unknown保留、explicit限制与Craft补入按原逻辑。企业策略保留owner切换隔离、并发fetch合并、5分钟/30秒cache、1.5秒timeout、URL enterprise编码、401匿名不缓存、未知错误fail-open、旧denial的stale-cache、远端allowed变化触发sync和磁盘stale先回后刷新；不以永远allowed的policy stub代替。

新source host只接owned路径、认证/REST/workspace适配器及资源所有权：默认认证为空，产品REST必须显式注入，不读取安装账号或原用户home。user路径默认重定向state；环境默认空，显式productRuntime.env才参与展开。跟踪原未保存的Models.init订阅、策略interval/immediate、queueMicrotask、watch与inflight策略/磁盘任务；close等待自有任务并阻止晚到sync。watch:false是明确的独立宿主选项，不改原provider的解析方法。

保留一个重要原行为：普通Agent文件删除后，product快照不含其定义，但原AgentManager仅清plugin registry，已构建的非plugin SDK Agent可能仍由get(name)取出。测试明确断言该差异，不以修改原manager使测试“更合理”。命令更新/删除真实刷新命令表；原静态prompt registry数量与内容不变。

`verify:product-sources`验证15个完整原类、变量函数与Path方法，共118处完整成员/函数AST；263次有限比较覆盖模型解析/过滤、成功/失败/force/cache/backoff、企业policy响应/时钟、实际临时文件及symlink/深度、frontmatter、变量/颜色、两层models.json与feature矩阵、policy filter/Craft同步。原完整方法体在同一显式DI边界执行，7个纯factory另做原文/AST核对；不是独立运行完整原bootstrap，也不是全状态空间100%。

新增19项专项含真实SDK文件命令改写/刷新/删除、原Agent缓存行为、models.json经原WorkBuddyModelProvider到自有loopback Chat Completions SSE，以及真实models.json watch/debounce/close。所有文件/HTTP/账号/时钟均自有或fake，不访问原应用账户、真实企业/模型服务、联系人或桌面。

本批794核心、10Web宿主、716编译JS smoke、42组样本差分、check/build/config与CLI/Web实际启动通过。SDK/OpenAI、依赖锁、六份JSON/115 Prompt与memory policy不变；旧依赖audit风险不因本批功能恢复消失。下一批优先插件跨服务刷新事务、Cloud product与环境服务，再推进SDK输入/启动/鉴权、Hook服务端、Auto classifier backend和SettingsManager持久化。核心方法/字符串的有限AST与差分结果不等于整个harness已100%恢复，整体目标继续进行。

## 完整插件管理类、本地组件加载与跨服务刷新批次

沿用固定5.3.14样本SHA及原REA证据，不执行安装应用bootstrap。另以完整原module28579的惰性factory片段运行REA静态分析，得到派生Evidence `ev_f226988140af2bc7a440a361edb602a2c24000edd0d9f1b77f47888c89f758ed`；该fragment有原UTF-16来源说明，500-node/100-unknown边界下关系覆盖明确为partial，不把它当完整应用控制流证据。后续移植与差分仍逐项核对固定原bundle。

完整PluginManagerImpl `9624900..9758187`含constructor及193个方法，PluginDependencyResolutionError `9624672..9624889`；恢复初始化/缓存代次/installed registry迁移与原子写入/路径及seed判定/版本和依赖闭包/安装启停与策略流程/inline来源/组件cache和active快照等全部成员。完整类存在不等于每条外部服务已接通；默认独立host只使用owned路径和显式本地目录，不下载市场内容。

完整PluginLoaderManager `9617689..9621098`；七loader分别为Agent `9583201..9587093`、Command `9588330..9591824`、Skill `9593102..9597847`、Hook `9599266..9602081`、MCP `9603335..9608128`、LSP `9609592..9612038`、OutputStyle `9613296..9616389`。manifest路径配置/默认目录/递归与去重、完整YAML与简单frontmatter、插件命名/model id/name差异、Hook schema和环境/user_config、MCP JSONC与缺type推断/LSP env/输出样式namespace及settings.json覆写均保留；MCPB动态模块仍需下载/提取backend，不伪造可用。

完整PluginRuntimeRefreshService `9832687..9835683`、PluginMcpToolChangeBlockedError `9832171..9832559`、pluginMcpServerConfigs `9832560..9832680`。队列按refreshTail串行；prepareDesiredState先执行；startup/prewarm/builtin/reload的desired-state与repair分支保持原样。reload的beforeCommit比较投影与期望有效MCP名称，按排序added/removed抛逐字错误；先校验再更新registry/active snapshot，失败不提交。提交后按原序刷新MCP、LSP、工具cache、full/volatile Product、命令、样式和Agent；reload/builtin LSP故意后台，启动等其他原因等待。失败调用本身拒绝，但settled tail吞该错误并允许下一事务，不沿用ProductManager的sticky-rejection队列语义。

完整ReloadPluginsCommandExecutor `7626670..7628827`和OutputStyleManagerImpl `9420919..9423931`恢复。reload保留原force/ToolSearch/已有outputTokens门槛、caveat/input/output与计数文案；本地命令不发模型请求。输出样式保留built-in先、ancestor根到当前、plugin最后且首次同名保留的原顺序，不改成“最近目录覆盖”。原source仅比较MCP有效名称，不检测同名配置内容变化；依赖修复后的第二次active提交原本不再运行同一MCP阻断校验，两点均明确测试保留。

原helper包括mapWithConcurrencyLimit、resolveDependencyClosure、cache-marker exit注册、parseFrontmatterHooks和extended Hook env gate、两个filesystem并发函数，以及8组原Zod3 schema表达式。module6527/47962/26106三个纯constant factory原文保留，合成SHA-256 `edd7b1253f42337215c19e8f8c684283c6108e60949e093dadfe0ade5c1d67cb`；metadata不是完整bundle或SDK源码。新增精确固定样本`semver 7.7.2`依赖，其他既有依赖、SDK/OpenAI、六份JSON/115 Prompt和memory policy均不变；audit仍为16项旧风险。

默认createHarness拥有原PluginManager及loader，空配置时不扫描任何安装插件；CLI/Web的repeatable `--plugin-dir`与嵌入nativePlugins.directories传入显式可信目录。共享active snapshot进入Product/Agent/Hooks/MCP/LSP，接上AgentService已有原refresh join与托管Agent替换屏障；删除插件manifest并reload会清除plugin-tag Agent/命令/Hook/style。legacy只读agentManager.plugins保持原来兼容边界，不冒充完整事务manager。完整manager adapter可显式共用，避免两个不一致的plugin owner。

新增owned host区分原方法与平台bootstrap：默认市场/managed-policy来源未配置，原Installer/MarketplaceFactory、资源seed/MCPB、真实磁盘Settings/Options/跨进程锁/Git执行仍需后续服务，不把空数据来源记为这些服务完成。Node文件桥不是原fs-extra；写入/删除限制到本次state并检查外部symlink，进程接口仅允许signal0只读存活检查。原启动5秒auto-update timer、immediate/订阅/原方法返回Promise与background LSP均由宿主跟踪；close拒绝新刷新，释放I/O后等事务，再关闭Product并清理自有cache marker。LSP显式standalone配置在原reload后重新注册，属于宿主适配。

补保留module94377 `13019243..13020520`完整semver包装factory：Bun的order/satisfies/valid快速分支、Node fallback以及始终委派semver的range/coerce等方法不合并成一套近似算法。Node依赖锁定7.7.2；另验证原factory的AST/摘要并用受控Bun适配器测试分支，不据此宣称完整Bun产品bootstrap已恢复。

Web/嵌入入口新增同CLI的本地命令分派，原executor结果先刷JSONL再返回/流式输出，不调用第二套loop。Web同源/CSRF/单运行槽不变；可信插件可自动执行Hook，逐次工具审批不是插件沙箱，不自动扩展legacy工具/MCP allowlist。

`verify:plugins`核对14完整类及全部方法体、helper/并发函数/8组schema共294处完整AST，3纯factory另核对；472次有限比较覆盖reason/desired reload/修复/失败矩阵、MCP有效名称、manager路径/registry/scope/version/依赖闭包。原完整方法体使用同一owned DI边界，不独立执行完整产品bootstrap，也未穷举全部194方法的磁盘/安装/并发状态空间。

新增24项核心专项与1项Web测试：真实本地七loader、模型规则、快照校验/冻结/cache晚到/依赖guard、队列顺序/失败/背景LSP、命令文案和路径保护；真实SDK跨插件Agent/命令/输出样式/Hook刷新及删除、刷新屏障、MCP阻断前0次握手/force后自有HTTP连接；独立CLI进程和Web均验证reload不发模型请求。模型/HTTP/命令子进程与文件均为自有或fake，不读取安装账号或访问真实模型/联系人/桌面。

门槛：818核心、11Web宿主、740编译JS smoke、43组样本差分、check/build/config及CLI/Web启动通过。下一批优先市场/资源seed和持久化依赖、Cloud product/环境服务，再推进SDK输入/启动/鉴权、Hook服务端、Auto backend与默认审批统一。完整核心类/本地主路径可运行不等于整个harness或产品bootstrap已100%恢复，整体目标继续进行。

## 本地市场与持久化依赖批次

直接移植9个完整类：FileLockServiceImpl `9144647..9146302`、BaseMarketplace `9536013..9537667`、DirectoryMarketplace `9538211..9539998`、MarketplaceFactory `9555538..9556101`、MarketplaceStorage `9556732..9563889`、MarketplaceConfigManager `9565529..9567108`、BuiltInMarketplaceProvider `9573457..9574515`、GitFallbackCoordinator `9579120..9579902`、LocalPluginInstaller `9780911..9782967`。上述为固定SHA样本的UTF-16索引；方法体只加TS注解，DI在外层绑定。module13423 `9805697..9807385`的原名称/官方来源/默认自动更新policy纯factory整体保留并校验AST与SHA，不用近似规则替代原白名单。

市场存储恢复原进程内Promise写队列、mkdir/lock.json跨进程协议、PID signal=0、过期/损坏锁最多三次移除、路径截断、临时JSON/原子rename与100/200/400/800/1000ms退避、损坏`.broken-<timestamp>`备份和legacy cache引用迁移。原FileLock保留Mutex Map，不再用上一版tails近似；第三方async-mutex按CLI样本固定0.5.0。注意原Storage获取文件锁失败会降级为进程内锁；完整控制流恢复不等于所有失败下仍有跨进程强一致性。原init失败Promise也保持sticky，不自行重试。

默认owned plugin host以原Factory加载已保存的本地目录市场；ConfigManager按user/project/project-local/CLI的原规则合并，显式作用域配置可在启动时添加市场。原LocalInstaller验证名字和词法路径边界，Directory provider合并插件manifest、缓存/coalesce及浅克隆均保留。Object source只读取`url`、manifest字段可覆盖条目、storageName写盘不保留name字段等原行为不修正。市场记录默认写`<state>/plugins/known_marketplaces.json`，锁写`<state>/tmp`，不读取安装应用账户或真实市场目录。

BuiltInMarketplaceProvider为完整原类，独立host默认通过显式空profile关闭样本生产市场；原六份产品JSON完全不改。可显式注入`nativePlugins.builtInMarketplaces`及远端provider，不能据此宣称Git/HTTP/ZIP下载器已恢复。GitFallbackCoordinator对本地source直接返回原对象；远端detector/converter仍为明确的未配置依赖。原命名policy通过动态模块入口接入ConfigManager→PluginManager安装链，不绕过受保护名称校验。telemetry仅独立日志sink，不冒充网络transport。

Node文件桥改成明确只读接口和受控写方法，移除展开fs.promises带来的未包装mutator；补move与utimes，阻止已有最终文件symlink向state外写入。该桥仍有TOCTOU和可信插件边界，不是OS沙箱，也不是原fs-extra。宿主追踪Storage/Config/BuiltIn返回的Promise，关闭等待已发起写入完成；不修改原类存储决策。

REA再次分析从module65117精确截取的惰性输入，证据`ev_b68ebceab157f73c4b6dd34384736380ab7a81d2651dda2b3a93da5b0c843ab9`，500节点/每文件500节点、100 unknown及45秒上限。语义图因unknown上限为partial/truncated；不执行工厂或原bootstrap。此派生小片段证据仅补充文件锁语义图，不代表完整bundle或全部市场服务覆盖。

`verify:marketplaces`核对9完整类/63成员的完整AST、1个原policy factory及381次有限比较。新增24项专项覆盖真实自有子进程锁竞争/并发写入、备份/迁移/退避/失败恢复、目录缓存/manifest覆盖、作用域合并、命名policy、默认host add/重启、配置驱动安装与close写入屏障；真实SDK两次启动均加载持久化市场的Agent/命令并消费Prompt。PID故障分支使用fake probe；模型为fake，未访问真实模型、生产市场、联系人或桌面。

最新门槛：842核心、11Web宿主、764编译JS smoke、44组样本差分、check/build/config与实际CLI/Web启动。另在不含原应用/bundle/旧node_modules的暂存快照副本完成全新npm ci、check/build、CLI/Web启动、48项插件/市场编译后测试及11项Web测试。保留SDK/OpenAI锁定版本、六份原JSON、115个Prompt和memory policy摘要；旧audit仍16项，未强制升级。下一批继续远端Git/HTTP/ZIP provider、更新检查/原子替换/安装器及资源seed，再补Options/完整策略/磁盘Settings、Cloud product与其余产品bootstrap；整体目标尚未完成。

## 远端市场provider与更新链路批次

完整移植GithubMarketplace `9540634..9543574`、HttpMarketplace `9544069..9547325`、ZipMarketplace `9547937..9555429`、MarketplaceUpdateChecker `9569105..9572073`、GitAvailabilityDetector `9575670..9576155`、GitToZipUrlConverter `9576904..9577492`。索引仍为固定SHA原样本UTF-16；市场/锁批次累计15完整类。完整module14783中19个helper `9845680..9851651`按函数移植，不执行其原module或应用bootstrap；第三方yauzl按CLI样本固定3.2.0，不复制第三方源码或改写SDK。

Factory默认创建真实Git/HTTP/ZIP provider，不再返回未配置的Symbol；UpdateChecker、BuiltinProvider、Git detector/converter/coordinator接入同一宿主。Git保留浅clone、当前branch fetch、reset --hard/clean -fd、无效目录移除/重clone、manifest命名对齐。HTTP保留先取manifest再update的两次fetch、完整base URL拼接、metadata目录探测缓存、旧metadata清理和单插件失败继续；它只下载清单，不假称已下载所有插件资源。

ZIP保留重定向/60秒下载与30秒HEAD超时、ETag/Last-Modified/本地mtime、UUID版本种子与60秒默认检查节流、404-only main/master互换、临时提取/staging/backup交换、恢复失败时保留backup、旧孤儿匹配清理。原helper保留yauzl路径检查、permissions、忽略__MACOSX后单目录展平、rename退避；gzip helper只解压不解tar，provider临时文件固定.zip，使tgz输入仍有原失败边界。它不是带总大小/条目数限制的安全解包器。原提取按entry input end推进，未改写为另一套pipeline/发布时序。

新增owned-marketplace-io只负责显式网络/流/ZIP打开/子进程和关闭所有权：下载/清单abort、未使用响应体排空、关闭已有与late-open归档、read stream end与close差异、等待自有资源。默认Git仅支持原市场所需命令，clone目标和更新cwd限制在state；HOME/Git config隔离，不使用安装账号、SSH identity/agent。认证SSH需显式exec adapter。原provider中的reset/clean在测试中只作用于新建自有fixture clone，未操作用户checkout。source方法体与原字符串不因这个adapter而改变；adapter不是execa/fs-extra或OS沙箱。

`verify:marketplaces`扩展为129处完整成员/函数AST、12个原常量initializer（含7条转换规则/分支/缓存值）及1个policy factory，584次有限比较。新增203次原类/原helper与还原代码的owned DI比较覆盖Git命令/探测、URL转换、HTTP错误、slug/格式/版本、HEAD分类、分支回退、真实归档提取与回滚。新增27项专项覆盖自有HTTP/HEAD/redirect、ZIP本地与远端安装/更新、etag跳过/UUID提交、unsafe path/单目录/gzip、双失败backup保留、关闭中下载与late-open、真实自有file:// Git clone/update。真实SDK在两次启动中从显式远端ZIP配置安装/恢复版本cache、Agent/命令并消费原Prompt，第二次不重复GET。真实生产网络、TLS、代理、私有仓库认证及全部平台/并发状态未据此证明。

REA惰性module14783派生证据`ev_f99aa1ee5da288fab92c030d50e9b0dd0ad331a27d0414af734e0382285afb41`，750节点/每文件750节点与150 unknown上限、45秒；语义图partial/truncated，不代表完整应用覆盖。

全量编译smoke首次运行发现原FileLock元数据发布竞态：一个进程mkdir后尚未写lock.json，另一个进程的isLockStale会因metadata缺失返回true并删除它，两个owner随后都能返回acquire成功，真实fixture曾丢失a2更新。新增确定性barrier在原类与还原类中复现双owner，完整AST也仍一致，不为通过测试修改生产协议。跨进程正向测试改为有效记录上的明确争用/调度，仍检查两个真实进程的全部6条记录；不声称涵盖创建窗口或所有并发。当前市场存储并非强一致方案，源码保真不等于修复原bug。

多套全量验证/编译并行时，既有真实fs.watch用例另出现一次10秒超时；未据此修改watcher方法或放宽deadline。该27项suite单独复测通过，停止并行构建后的完整源码870项及11项Web测试通过；编译后792项也通过。这些记录不把操作系统事件交付/所有负载下时序称作已穷举。

本批仅新增yauzl及其新传递依赖，既有版本完全未变；锁定SDK/OpenAI、六份JSON、115 Prompt和memory policy摘要均不变。npm audit现17项（10中危/7高危），其中yauzl3.2.0新增[GHSA-gmq8-994r-jv83](https://github.com/advisories/GHSA-gmq8-994r-jv83)中危告警。当前原路径不调用该告警涉及的entry.getLastModDate，但不宣称总体安全，也不通过升级破坏样本保真；只用可信归档。

最新门槛：870核心、11Web宿主、792编译JS smoke、44组样本差分、check/build/config与实际CLI/Web启动。另从暂存快照在无原应用/bundle/旧node_modules的全新目录验证npm ci/check/build、76项编译后插件/市场测试、11项Web测试与CLI/Web实际回复。下一批继续独立Git/npm/subdir插件安装器、Options/原策略/磁盘Settings及资源seed、Cloud product和其余产品bootstrap，整体目标仍未完成。

## 独立插件安装器与Options/ErrorCollector批次

移植5个完整原类：GitPluginInstaller `9784026..9788420`、NpmPluginInstaller `9789325..9790587`、GitSubdirPluginInstaller `9791710..9795641`、PluginErrorCollector `9796644..9797503`、PluginOptionsStorageImpl `9818861..9822846`。以上均为固定SHA样本的UTF-16索引；45处完整成员AST与5个原常量initializer（含env/正则/100条上限）验证，120次原类/还原类owned DI有限比较。UUID无参v4以Node crypto适配，Emitter/FS/Settings/进程在工厂注入，不执行原bootstrap，不改SDK依赖或原方法体。

三个installer加入默认同一个集合，原Manager的Git版本/tag/cache方法接入owned执行器。Git保留完整40位SHA、ref与默认分支的不同fetch/checkout/reset/clean分支、SHA验证失败清理和错误收集；sparse保留filter=tree:0、no-cone、120/60/30秒超时、嵌套path与祖先.git查找、pull失败清理/重装。npm保留package/versionConstraint优先级、prefix/no-save/registry透传和120秒超时；没有偷偷添加ignore-scripts。实际fixture的安装脚本正常执行，说明信任/权限边界，不能把owned路径适配当作沙箱或完整孙进程树清理保证。

原NPM正则接受前导连字符，install后仍检查包目录；原update将installedPath上溯两层再交给install，包含scoped包时也保留嵌套prefix边界。sparse checkout失败会删除clone，但checkout成功后不存在subdir会保留目录；update失败会清理找到的repo再重装。测试只使用自有clone，外部写/删除被standalone FS/cwd边界拒绝；不操作用户checkout、不访问生产registry/仓库。默认Git/npm HOME/config/cache不读取安装账号或用户npmrc，认证仍需显式适配。

OptionsStorage恢复USER/pluginConfigs与pluginSecrets拆分、敏感值精确true/转字符串、合并/跨存储scrub、cache别名/clear、has/delete与词字符占位替换。默认敏感文件位于本次state/credentials.json，明文、首次创建0600；已有mode不保证收紧。损坏JSON读作空，下次保存可覆盖损坏内容；保留原无锁read-modify-write，非事务。敏感先写、非敏感失败时可能已存新secret却仍保留旧缓存，确定性测试覆盖，不添加原实现没有的rollback/自动清缓存。

非敏感默认使用新增owned-plugin-option-settings，只保存USER/pluginConfigs到state/plugins/plugin-options.json，有本进程写队列/临时rename，不冒充完整原SettingsManager，也不保证跨进程RMW事务。调用方显式提供nativePlugins.settings或dependencies.pluginOptionSettings时沿用其get/set/list，read-only视图的失败仍由原类处理。默认loader与Manager动态容器共用原OptionsStorage，真实SDK验证保存→reload→组件变量替换→重启；模型请求不含测试secret。ErrorCollector默认替换原数组占位，保留100条上限、Date排序和plugin/source查询键，不擅自把pluginName/marketplaceName改作匹配键。

适配桥另修正mkdirp对this的依赖：原类通过(0, fs.mkdirp)无绑定调用，原fs-extra支持，之前Node桥不支持；现在保持同一owned范围并支持无绑定调用。新增installer/Options Promise纳入关闭屏障，错误Emitter只释放自建实例；ownedHandleCount也包含已有I/O资源。不是通过改原方法来掩盖宿主缺口。

新增29项专项：真实自有Git/SHA/sparse更新，真实本地npm tarball+loopback registry与生命周期脚本，Git/npm/subdir各两次真实SDK安装/版本cache/Agent/command恢复，选项拆分/迁移/部分失败/损坏文件/cache/替换/delete、原ErrorCollector筛选与窄Settings边界。模型是fake，registry/仓库/进程/文件均为自有，未操作真实账户、联系人或桌面。REA对惰性module2845生成派生证据`ev_cdbe6f3bf44d8099f0443e3b3e408b28dc8b0b86ace1e411008bb040bb28ba52`，750节点/150unknown/45秒上限，语义图partial/truncated，不当作完整应用覆盖。

最新门槛：899核心、11Web宿主、821编译JS smoke、45组样本差分、check/build/config与CLI/Web实际启动；全新暂存快照副本无原应用/bundle/旧node_modules，npm ci/check/build、105项插件/市场/安装器编译后测试、11项Web测试与CLI/Web启动均通过。SDK/OpenAI固定版本、六份JSON/115 Prompt/memory policy摘要与依赖锁均不变，已有17项audit风险未强制升级。下一批推进完整PluginPolicy/磁盘Settings与资源seed/Cloud product/其余bootstrap；安装器与选项可用不等于完整产品控制器或整个harness已100%恢复。

## 原Settings、CLI加载队列与PluginPolicy批次

移植6个完整类：PluginPolicyServiceImpl `9824149..9826670`、CliSettingSourcesProvider `11188750..11191471`、CliSettingsProvider `11193064..11196069`、SettingsManagerImpl `11202361..11209123`、SettingsController `11210623..11211440`、SettingsValidateMiddleWare `11213940..11214445`。另保留deepDiffDefaults `11201978..11202354`、normalizeReasoningEffort `11192966..11193057`和PathUtils.getSettingsFilePath `13328279..13328565`。均为固定SHA样本的UTF-16索引，不是字节偏移。

`verify:settings`核对66处完整成员/函数AST、9个原pure factory payload/hash及94次原类/还原类有限比较。factory包括原DEFAULT_SETTINGS/作用域/白名单/优先级、sandbox默认值和ObjectUtils；后者copy是原JSON.parse(JSON.stringify)而非structuredClone。sandbox只恢复纯配置，不意味着已恢复BashSandbox执行器。Console NATIVE、startup phase、effort列表与policy regex另核对固定样本，独立验证不执行原应用bootstrap。

原SettingsManager成为默认磁盘服务：USER为state/settings.json，PROJECT和PROJECT_LOCAL为cwd/.codebuddy/settings.json及settings.local.json。保留JSONC注释/尾逗号、原默认差分写入、scope Mutex与文件锁、60秒缓存、固定.tmp/rename、失败清理、同步change事件与后台ConfigChange Hook。数组Set并集、四个subkey递归合并、其他对象后覆盖、USER磁盘默认浅合并、数组作为有效object读入等源码边界不修饰。损坏JSON经50/100ms重试后标记并拒写；修复后仅clearCache不够，还须成功读取清标记，不自动备份/改写原文件。无效非object值不缓存也不标损坏。

CLI服务保留初始化Deferred、串行loadChain、来源顺序/去重与无效项处理。none只排除磁盘scope，CLI始终允许；JSON对象字符串或相对cwd文件、model/effort优先级保留。CLI/Web启动器新增--settings/--setting-sources/--effort，teammate独立入口显式传递同一配置；不宣称已恢复整个原CLI解析/SDK启动协议。logger按原代码可能记录CLI JSON，不用于传递账户密钥。

原PluginPolicy读取ProductManager.builtInMarketPluginsMerge并监听更新；regex、重复ID后项覆盖、五个字段差异检测、strict-false限制、Map.has自动安装语义与恒false的市场阻断检查保持。version/metadata单独变化不触发策略事件。不用空数组服务冒充实现；固定六份产品JSON中该字段未配置时为空仍为实际数据结果。默认内置市场仍用显式owned profile，未暗中启用生产市场。

默认OptionsStorage现依赖同一SettingsManager，非敏感USER/pluginConfigs不再用窄adapter。旧plugins/plugin-options.json只迁移新配置缺失的插件项，旧文件保留且不覆盖现有项；敏感credentials原实现不变。源change事件由明确宿主桥同步排队原settings-change刷新，AgentService可join；原controller/middleware可在嵌入接口使用，不假称已有完整/internal/config路由/UI。全局CWD及ConfigWatch连接原clearCache。显式nativePlugins.settings继续作为插件scope覆盖，global options.settings为只读覆盖；旧agentManager.plugins兼容路径不自动建立此宿主。权限/MCP局部内存settings仍独立，下一步需核对其原消费者接线而非重复恢复Settings类。

新增23项设置专项：作用域/JSONC/default diff/缓存/拒写/数组/CLI/锁降级/并发update/rename失败、Controller/middleware、policy差异、owned symlink边界、加载队列/关闭、旧文件迁移；真实SDK验证磁盘插件禁用→重启→启用→卸载、live Product策略禁止操作、原ConfigChange命令Hook和CWD路径切换。CLI实际子进程验证none排除磁盘SessionStart Hook且effort覆盖JSON；Web launcher使用同样参数运行离线SDK回复。全部模型/仓库/进程/文件/loopback均为自有，不读取安装账号、不操作桌面或联系人。

专项暴露并修正新owned设置FS桥对悬空symlink的检查，未改原类。全量首跑另暴露兼容审批Deferred的拒绝所有权：Notification Hook现异步读盘，human deny可早于后续await，导致两项用例出现未接管rejection。只在独立兼容Deferred构造时添加观察catch，调用方仍等待原rejecting promise并按原逻辑拒绝；新增确定性异步notification用例，不改完整原InterruptionController方法。原FileLock发布竞态和拿锁失败继续写的已知边界仍保留，不宣称强一致。

REA对惰性module35151派生证据`ev_0619b7b365f46fa0637acb8a6655910fbebbc870b97fda1fc0d1a40f855ac7ea`；750节点/每文件750节点、150 unknown与45秒上限，semantic graph为partial/truncated，不等于完整应用覆盖。115 Prompt、六份JSON、memory policy摘要、SDK/OpenAI版本和依赖锁均未修改。

最新门槛：923核心、11Web宿主、844编译JS smoke（821既有+23设置）、46组样本差分、check/build/config与实际CLI/Web启动全部通过。全新暂存快照无原应用/bundle/旧node_modules，npm ci/check/build、136项编译后插件/市场/设置/兼容审批测试、11项Web测试和CLI/Web实际启动均通过。发布审计567个文件未发现所检查的凭据/运行文件；此扫描不是安全证明，原17项audit风险未强制升级。下一批推进资源seed/Cloud product/其余产品bootstrap及权限/MCP专用settings消费者，整体目标保持未完成。

## 内置资源seed、资源解析与PluginController批次

Desktop样本`main/index.js` SHA-256为`ec41f11bec48bc4fcb81477a8695083161047db303504b03f2ef87dbf6d27935`；`main/workbuddy-product-config.js`为`3a3e001bb227550087d735d07e470a9d06ac8d29141ea1764e0eb48c6e467251`。移植前者safe-copy-dir、builtin-plugin-marketplace-materializer和seed-builtin-plugins三个完整相关函数集合（43个函数），后者完整bundled-assets解析（5个函数及7候选initializer）。位置表由`native-builtin-seed.ts`/`native-bundled-assets.ts`导出，均为各自文件UTF-16索引。另移植固定CLI SHA的PluginController `9763415..9773771`（23方法）、ManifestValidationError `9839074..9839229`及PluginValidatorImpl `9839237..9844910`（6方法），不执行Electron或CLI原bootstrap。

`verify:builtin-seed`核对78处完整成员/函数AST、12处原常量/初始化表达式（包括两个validator正则和完整候选数组），并执行113次原函数/原类与port的有限输出/调用/文件树比较。validator仍是原弱字段检查，不升级为另一套严格schema；依赖semver沿原wrapper。controller保留parsePluginId的split边界、未知scope回user、dry-run/TTY确认、原打印文案、ManifestValidationError身份，以及metadata未提交就抛错、metadata已提交而投影失败返回冻结结果的区别。

物化保留source/cache两树、清单metadata.workbuddySeed/revision/sourceRoots、平台筛选、首项去重、旧两段cache布局恢复、symlink修复/拒绝、canonical路径检查、staging/backup交换与回滚、snapshot有效性验证、orphan marker清理。无版本fallback沿原appVersion+BUILD_COMMIT；有效同版本snapshot不因body更新被重写，新增版本不覆盖旧版本。原safeCopy逐文件read probe/copy，跳过symlink/特殊条目并记录失败，不调用fs.cpSync。source copy不完整会throw；snapshot部分复制则丢弃staging并返回false；原writeJsonAtomic在rename失败时可遗留固定.tmp，均未为测试而修饰成统一事务。

默认候选只考虑builtin-plugin类目，mode/template/skill/mcp-app不全局盖章。IntentRecommend非精确true走all；否则TencentPptxBuiltinDefaultEnabled精确false可使defaults集合为空/none；默认白名单与原字符串保留。已有enabledPlugins键不覆盖，不机器生成false。资源不存在/无支持平台时原函数返回空seed结果，而非偷偷发送available=false删除已有注册。

物化不写CLI元数据，原PluginController把metadataRequest交给原builtin-seed刷新队列与PluginManager已有锁定注册/默认值/installed事务。失败按原tracker回滚新鲜USER基线中的相关ID及市场记录，不回滚已物化文件，也不假称回滚已发布到所有消费者的运行时副作用。用户损坏JSON继续拒写并保留原字节。原FileLock发布窗口竞态及拿锁失败降级仍在；同步物化本身没有新增跨进程强锁，不宣称强一致。

CLI/Web新增`--builtin-assets`，嵌入为`nativePlugins.builtinSeed`及`pluginHost.builtinSeedHost.seed()`；没有显式资源根不探测安装应用。原7级资源解析允许parent/../../候选，resourcesPath仅显式注入，不能把assetsRoot当硬读取沙箱。Node同步FS桥仅允许state/plugins内写，独立宿主串行持有seed/metadata Promise并等待初始投影；Controller host拥有console/readline并关闭自己的确认问题。这里不复刻Electron原15秒提示的后台RPC交接、daemon会话池再刷新或session-addon编排。独立CLI的isWorkBuddyDesktop依然false，不能为凑覆盖硬编码为Desktop；桌面专用mode/template全snapshot注册/会话选择尚需对应bootstrap。

新增29项专项含真实自有文件物化/两版本cache/旧布局恢复、copy/probe与rename注入失败、双restore失败backup保留、symlink/marker/canonical路径、默认开关/白名单/平台、JSON遗留tmp、原validator/controller/TTY与关闭、metadata回滚/损坏拒写及7级资源候选。真实SDK消费seeded Agent/命令、两次启动恢复、保留显式false、升级registry/旧snapshot orphan marker；CLI实际子进程及Web launcher使用owned资源，Web再执行原reload检查Enabled:1。模型为fake，没有调用生产服务或读取账户。

另在拥有权明确的临时state中，对固定样本实际资源进行原函数/port纯物化和哈希比较：清单SHA为`88dd94749e2bd98e6464e2f3d23c8d8c4d37b7beb06d24b7b193328c567a5412`，均成功产出metadataRequest，1193个物化文件条目一致。没有import/执行其Hook、MCP、Shell或原生程序；测试后的自有副本已删除。资源包内附带支付CLI、vendor压缩包和其他第三方二进制，不随本仓库分发。此比较不证明第三方程序可在所有平台或真实账户中运行，资源prompt/程序的分发与完整Addon链仍须独立处理。

端到端升级暴露并修复两个旧宿主绑定缺口：native path helper会返回macOS /private/var真实路径，原owned插件FS仅认/var词法根导致orphan标记失败；现在接受同一配置state的canonical根并仍拒绝根删除/外部/悬空symlink写入。OutputStyleManager原import为fs/promises，旧host却传入回调版fs；现分离loader的fs与style的fs/promises，真实workspace样式加载回归通过。均未改原方法体/字符串。

REA对惰性Desktop函数片段生成`ev_6a384acd64576685eca56eab8e395268fc3931c3b7fd69d73e5e793bb91c5a37`，750节点/每文件750节点、150unknown、45秒；semantic graph为partial/truncated。六份JSON、115 Prompt、memory policy摘要、SDK/OpenAI版本和依赖锁均未变。

最新门槛：952核心、11Web、873编译JS smoke（821既有+23设置+29seed）、47组样本差分、check/build/config与实际CLI/Web启动全部通过。无原应用/bundle/旧node_modules的全新暂存快照通过npm ci/check/build、165项编译后插件/市场/设置/审批/seed测试、11项Web测试及实际seed/reload启动；不借助本机已安装资源即可编译和运行owned演示。发布审计578文件未发现所检查的凭据/运行文件，非安全证明；既有17项audit风险未强制升级。下一批继续Cloud product、资源prompt/会话Addon编排、权限/MCP专用settings消费者及剩余产品bootstrap；整体目标未完成。

## Cloud 产品配置、用户投影与缓存/重试批次

完整移植四类：UserinfoProviderImpl `7241866..7242195`、CloudPreProductProvider `9907133..9907405`、CloudProductManagerImpl `15252547..15256941`、CloudProductProvider `15258449..15260416`，仍为固定CLI SHA样本的UTF-16索引。完整22个成员AST去除TS注解后与原样本一致；另独立核对8个初始化表达式/字符串和原匿名class的e0/tG/e_/eE名称。类名不是纯可读性问题，改成可读name会改变ProductManager按constructor.name判断的预取/缓存分支，因此显式保留样本名。

四类默认接入现有ProductManager与来源provider，不是单独未使用代码。预门槛priority9999，Cloud priority10000；有效accessToken且tokenType不等于精确ApiKey才通过。Userinfo只认truthy account.uid，保留缺失auth时的原TypeError，不将模型API key伪装成账户。默认独立匿名账户不访问远端。登录/完整原REST中间件没有据此恢复；需要嵌入者显式传入账户Subject和REST或单origin HTTP transport，不读取安装应用令牌。

保留原缓存和失败边界：内存只按userId索引，不按URL/endpoint；8分钟有效期，到期等于边界即失效，返回同一对象引用。远端失败先退过期内存/存储记录，再由全局retrying门槛按1/2/4/8/16秒重试，错误日志大于60秒才重报；匿名不缓存/不重试。磁盘协议key为cloud_product_config_cache，最多20条，读命中移到尾部但不检查年龄/刷新ts/写回内存。默认仍是原MemoryLocalStorage而非凭方法名宣称磁盘持久化；跨重启通过显式owned get/set adapter实测。reset只清内存和retrying/configuration，不删磁盘也不取消旧worker，可能允许重试并行；宿主close另收敛资源。重试成功只暖缓存，不自动ProductManager.sync；force sync也不绕过Cloud内存TTL。

CloudProvider原位删除远端endpoint/stagingEndpoint，再浅排除deploymentType；内存别名因而也被修改。CODEBUDDY_REMOTE_CONFIG_DISABLED只认1/true。CommandsSmartMerge取远端nullish回退本地，disabled/失败不重置cached strategy。CloudAgentsSmartMerge下同名Agent本地字段优先，远端显式models例外；models按远端列表遍历合并，同id远端字段覆盖，未出现的本地模型被删除，null/无id保留。不开启smart标志时不擅自补Agent列表。

新增owned Node HTTP只负责显式origin、可选显式header、repos[]参数、JSON响应包装、5000ms超时、取消/response与timer关闭屏障，不冒充原CellJS/Axios或生产认证。拒绝跨origin和redirect，不自动把账户token加到HTTP/模型请求。ProductHost的独立Promise桥追踪原fire-and-forget、在close唤醒sleep并等待旧任务，正常reset保留原语义。任意外部adapter若忽略signal，close仍须等待其settle；不宣称可强杀任意第三方Promise。

`verify:cloud-product`新增第48组源码校验：22完整成员、8独立常量、38组原完整方法体/port有限行为比较；覆盖精确账户/env门槛、缓存别名/过期回退/LRU、全局重试/重置并行、原TypeError、权威模型列表/Agent合并/策略状态、日志与错误格式。不是所有并发/生产账户/服务端策略状态空间穷举。22项专项运行测试另含真实owned loopback HTTP、body超时/abort、close无后续I/O、显式存储重启，以及真实SDK消费Cloud Agent/模型和两次显式同步后的prompt变化，产品token不进入模型请求。

REA对四类惰性片段再次分析，证据`ev_d040e81908e84846b52c594362210aa335501f03305da79a5b914e6f3c019f11`；750节点/每文件750节点、150unknown、45秒上限，semantic graph为partial/truncated。未执行原bootstrap。六份JSON、115原Prompt/memory policy摘要、SDK/OpenAI版本和依赖锁均未变。

最新门槛：974核心、11Web、895编译JS smoke（821既有+23设置+29seed+22Cloud）、48组源码差分、check/build/config与实际CLI/Web启动全部通过。无原应用/bundle/旧node_modules的全新暂存快照重新npm ci/check/build，246项编译后Cloud/产品/插件/市场/设置/审批/seed测试及11项Web测试、CLI/Web实际seed/reload启动全部通过。发布审计585文件在所检查规则内无发现，不是安全证明；既有17项audit告警（10中危/7高危）不强制升级。后续继续资源prompt/会话Addon编排、权限/MCP专用settings消费者、环境服务与剩余产品启动/鉴权链；整体目标未完成。

## Desktop 会话 Addon、模式配置与原 CLI 交接批次

新增固定样本：`main/initialize.js` SHA-256 `528d3bffc67c5244d1a641e0cfc13c2be4ef7943c248b390125b76d70880ed19`，`main/workbuddy-auth-product-coordinator.js` SHA-256 `8624215504229c4b6190f5c2172da270e015cc96871e90b261786f047e4c6e78`。源码中的明确region证明Addon核心位于Desktop服务侧，不是CLI Agent loop。所有位置仍是对应文件UTF-16索引，由SESSION_MODE_FUNCTIONS/CLASSES/CONSTANTS及SESSION_ADDON_FUNCTIONS/CLASSES/CONSTANTS完整导出。verify额外样本可分别用WORKBUDDY_DESKTOP_INITIALIZE和WORKBUDDY_MODE_COORDINATOR指定；默认读取CLI旁main目录，不执行原bootstrap。

完整移植DefaultModeHandler、ExpertModeHandler、ModeService三个类（coordinator变量声明`1070369..1071833`、`1072148..1073261`、`1073595..1074401`），CWD错误类及原预检；完整mode-tools-config/runtime-config、Storage plugin-context规范化、micro-scene/user-resource/work-mode packs、pack registry、session expander/composer/manifest、会话plugin-context投影、原runtime resolver/log-details、cli-runtime-args和prompt-vars文件/修复函数。另移植原Desktop SessionManager.resolveRuntimeConfig成员`4767659..4768528`连接resolver、manifest与expansion，不冒充已移植该大类全部方法。总计93完整函数、13类成员（含字段/constructor和该单独成员）、18初始化表达式，去除TS注解后独立AST一致；SDK依赖不改写。

保留原决定：craft/ask/plan/expert工具名单完整（含Defer(...)、read_me/show_widget等），plan用craft prompt但plan权限，expert必须expertId；ModeService最后以非undefined显式输入覆盖handler返回，mcpConfig例外由handler优先。permissionMode只接受原五种，离开plan用permissionModeBeforePlan或bypass；welcome coding/working输入规范化为code/work，raw非空runtimeIdentity不trim返回。restartFingerprint只含结构字段，不含model/渲染日期/记忆。

会话选型启用welcome/interaction/prompt-common，不把mode/template列入机器默认USER seed。原专家craft→expert选择、micro-scene未解析warning、project resource provenance、先到先得Addon ID去重、八种bucket、prompt仅摘要、sorted stable JSON/SHA且generatedAt不参与hash均保留。enabledPlugins摘要仅排除精确false（null也算启用）；合成时禁用未选中work-mode前缀插件，用户插件保留。持久化plugin context则仅保留boolean启停，trim/去重/排序并剔除派生模式；这两套语义不能合并成一套近似normalizer。

原buildAgentCliRuntimeArgs只在work-mode承担prompt/tools时抑制旧参数；显式用户覆盖保留。allowedTools、permission/model、sessionSettings/trustedDirectories、language/envRouteMode、strict MCP与prompt-vars参数保留原顺序。根cwd的trustedDirectories原表达式会生成`//**`，没有擅自修正成`/**`。原session resolver还保留Claw路径比较失败不禁用支付插件、明确匹配时将weixinpay session-local置false；Claw目录查找由显式owned callback提供，不调用原会创建/修改系统默认workspace的全局服务。

原prompt文件、prompt-vars写入/健康检查/修复与11109错误协议已接入：缺失/损坏JSON/shape/内容不匹配修复，目标必须canonical path，目录不可写、写失败和修复后仍不健康保留原reason。底层函数仅改fs/os/Date闭包DI；独立宿主将OS temp根重定向到本次state内随机目录。原异步cwd stat/access预检不替调用方创建丢失项目目录。

新增明确标记的createSessionAddonHost与createAddonSession是独立宿主，不是原daemon进程池：每会话独占state/完整Settings/Product/Plugin/Agent实例，在原CLI scope应用合成设置，真实SDK消费原插件settings.agent和fragment composer。两个并行ask/craft实例经owned资源验证互不污染，不把mode写入USER。通过显式close/resume重建验证同ID模式变化后新prompt与既有历史；尚未恢复原pending配置排队、自动backend restart、ACP/pool或队列迁移。普通CLI/Web入口保持原standalone默认，新的Desktop风格入口目前是嵌入API。显式systemPrompt无需原资源；完整资源PromptService仍待恢复，可注入renderer，未提供时沿原fallback。

权限边界必须明确：原craft/expert默认bypassPermissions会绕过standalone工具guard，这个默认被保留。真实SDK测试只对owned文件验证其写入行为，同时验证显式default拒绝同一写入；若需人工审批，应显式default。可信设置/插件Hook仍可自动执行，不是OS沙箱。后端state根canonical化，进程内同路径独占，拒绝session state symlink；不是跨进程daemon锁。borrowed resolver忽略取消时close等待settle，不擅自销毁外部PromptService。

`verify:session-addons`为第49组源码差分，93函数/13类成员/18初始化项、204组有限原完整方法体/port比较；包含模式/权限/选型矩阵、manifest及CLI参数、存储context、resolver/Claw/变量、prompt-vars故障、cwd errno。18专项另验证真实SDK、并行mode插件、close/resume、明确bypass/default边界、原文件修复和显式新sessionId启动/并发防重。不是全daemon/生产账户/所有模式资源或全部并发状态空间100%。

REA对93函数及相关类/初始化项的惰性派生片段分析，证据`ev_6c46f709037be3790dba543b7f4434d73cf2a3618aeb02a7e9b73cf88718f959`；750节点/每文件750节点、150unknown、45秒上限，semantic graph明确partial/truncated。六份JSON、115个原Prompt与memory policy摘要、SDK/OpenAI版本和依赖锁未变。

本批编译后全量运行暴露旧fs.watch测试的不确定性：测试名为rename但用writeFile创建文件，change分支的3秒fake clock未推进。首次改真实rename及防抖驱动后，全量通过但干净快照仍超时，说明不能将其仅归因于防抖。现fixture在5秒内用真实rename探针等待实际OS投递进入原hotReload，再检查配置/关闭；记录投递event/filename以便无事件时诊断，不假设watch返回即完成OS就绪。防抖只推进测试自己的clock，不直接调用原performHotReload制造成功；原watcher与确定性时序测试均不改变。

最新门槛：992核心、11Web、913编译JS smoke（821既有+23设置+29seed+22Cloud+18Addon）、49组样本源码差分、check/build/config及实际CLI/Web启动全部通过。最终不含原应用/bundle/旧node_modules的全新暂存快照重新npm ci/check/build，264项编译后Addon/Cloud/产品/插件/市场/设置/审批/seed及11项Web测试、CLI/Web实际seed/reload启动均通过；修正后的真实OS watcher测试另独立连续5次通过。早前失败快照和修复原因如上，不以某次重试绿灯掩盖旧fixture问题。发布审计592文件未发现所检查的凭据/运行文件，不是安全证明；既有17项audit告警保持不变。后续优先完整权限/MCP settings消费者、资源PromptService及daemon会话动态配置/自动重启、环境与鉴权链；整体目标仍未完成。

## 原 SettingsManager 的权限、MCP 与 SDK 消费者批次

本批不是把若干存储Map写成JSON兼容层，而是让已恢复的原类直接共享同一个完整SettingsManager和原CLI provider。固定CLI SHA仍为`4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd`。原SettingsManagerImpl `11202361..11209123`、CliSettingsProvider `11193064..11196069`、ToolPermissionService `11948949..11968077`、PermissionUtils `13340331..13350579`、McpPermissionsManager `9277575..9279382`、InitializeHandler `7811554..7814144`、SetModelHandler `7825195..7826336`均保持原完整方法体。本批联合复验7类105成员，而非宣称又新移植105个方法；所有索引为固定样本UTF-16。

移除root的permissionSettings Map，权限服务现在直接注入harness.settingsManager，MCP permissions和SDK initialize也指向该实例。仅使用外部只读agentManager.plugins时也创建原SettingsHost，不再因没有PluginHost而缺失scope存储、CLI队列、ConfigChange和cwd cache失效。独立MCP projection未传settings时创建自己的原SettingsHost，USER根为显式getHomeDir；传入borrowed adapter则原样使用且不擅自close。filesystemScopes仍默认不扫描原应用或外部服务器。

补正公开Session的权限上下文接口和初值：调用原PermissionUtils.createDefaultToolPermissionContext生成九来源allow/deny/ask（policySettings、flagSettings、userSettings、projectSettings、localSettings、cliArg、command、session、sandbox）、独立目录Map及两个flag，替代旧三字段近似结构。源样本SessionManager.create/SessionMiddleware有initializeContext调用（调用点约10963387、11000932）；独立host现在在公开openSession完成options之后、SessionStart之前调用同一原方法，辅助会话仍有工具首次初始化。未据此声称整个原SessionFactory/Middleware均已移植。

保留实际scope语义：userSettings/projectSettings/localSettings分别写USER/PROJECT/PROJECT_LOCAL；session/cliArg不持久化。原get/list显式scope不应用setting-sources合并过滤；故none的合并视图可只含CLI，但权限初始化仍读取四scope，MCP仍读取local+CLI。原PROJECT/LOCAL allow是否成为可信allow仍由directoryTrustService决定，不能借此次接线自动提升项目可信度。只读options.settings不是四个native scope，显式permissionHost.settingsManager/projection.settings仍有优先级。

MCP批准/拒绝沿原两个set写enabledMcpjsonServers/disabledMcpjsonServers，approveAll写enableAllProjectMcpServers；local与CLI采用浅字段覆盖，CLI显式拒绝不会被local批准撤销，USER同名字段不是该类来源。它们不等于McpConfigStore的disabledMcpServers transport开关。共享cwd事件清理原settings cache，独立宿主可显式传入cwdService；关闭释放借用observable的订阅。

SDK initialize原switchEnvironmentIfNeeded先set enterpriseEndpoint（默认USER）再switch环境，现前一步真实落盘，即使后一步adapter失败也保留原部分写入。真实ProductEnv/Auth链仍待恢复，不自动请求生产账户。SDK set_model现在调用原CLI provider.set，仍不写USER、不触发SettingsManager.onDidChange，独立facade仅记录哪些CLI键来自SDK并读取真实provider值，不再另存一份模型数据。自定义can_use_tool响应并不支持updatedPermissions；原解析只返回allowed/reason/interrupt/updatedInput，没有添加看似兼容的额外持久化协议。

错误边界不改写：applyUpdate先更新内存再persist，I/O失败不回滚；损坏scope可按原set无写入返回，不能把Promise resolve解释为保存成功。MCP两个set不是事务，第二个失败保留第一个；always-approve原缓存与持久化顺序仍在。原文件锁发布竞态、拿锁失败继续执行也不修饰为强事务；独立state根并非全机器唯一锁域，项目scope文件由项目共享。

独立所有权桥持有权限update及原fire-and-forget always-approve Promise，MCP权限调用也纳入projection drain。PluginHost停止新刷新后等待消费者settle，再关闭共享SettingsHost；依赖失败不被当作仍在运行。设置方法外层以AsyncLocalStorage的活动操作计数允许旧写入/ConfigChange读写收敛，完成后旧async上下文失效，close拒绝新事务并释放订阅/重试timer。该层不是原业务方法，也不是OS沙箱；外部adapter忽略取消时仍需自行settle，未宣称所有平台/所有teardown错误均已穷举。

新增第50组`verify:settings-consumers`：7完整类105成员AST再核对，154组原类/port联合场景使用完整原SettingsManager实际自有临时文件，连接权限更新/MCP批准/SDK CLI与endpoint方法，对照磁盘字节、scope视图、context/模式、CLI状态、Hook数据和错误。29专项另覆盖真实SDK重启deny、实际owned MCP连接批准/拒绝/重启、CLI优先级、corrupt/外部symlink拒写、关闭时两次set/always-approve、过期async token、borrowed adapter、真实ConfigChange命令Hook及fallback宿主cwd。不是全并发/账户/服务端/所有CLI消费者100%。

REA对上述七个惰性完整类再次分析，证据`ev_e4d6aa312fc274bf8969d8201a0188d3758131be352c407b76d1ad7cea83aceb`；750节点/每文件750节点、150unknown、45秒，semantic graph为partial/truncated。未执行原bootstrap，SDK/OpenAI锁定版本、依赖锁、六份JSON、115 Prompt与memory policy摘要均未改。

本批最终门槛：1021核心、11Web、942编译JS smoke（821既有+23设置+29seed+22Cloud+18Addon+29消费者）、50组样本源码差分及check/build/config、CLI/Web实际启动全部通过。新的暂存快照不含原应用/bundle/旧node_modules，重新npm ci/check/build，314项编译后设置消费者/Addon/Cloud/产品/插件/市场/设置/权限/seed/SDK控制专项、11项Web测试及实际CLI/Web seed/reload启动全部通过。发布审计594文件，在所检查的凭据/运行文件规则内无发现，不是安全证明；既有17项audit风险（10中危/7高危）未强制升级。后续继续资源PromptService、daemon会话动态配置/自动重启、client-settings endpoint与完整环境/鉴权/启动链；原消费者接线已恢复不等于整个harness全部100%完成。

## 原产品环境服务与 client-settings endpoint 批次

固定CLI SHA不变。新增完整ProductEnvServiceImpl `9860010..9862805`、ClientInternetEnviromentProductProvider `9865679..9868185`、SettingsEndpointProductProvider `9890783..9892221`及BooleanUtils `15165544..15165887`，共4类21成员；完整findProductJson `9862806..9862889`、resolveEnvFromSessionFileSync `9862889..9864084`、matchDomainList `9864084..9864267`、isBuiltinModelsDisabled `15245802..15245976`、stripBuiltinModelsIfDisabled `15246138..15246237`、ObjectUtils.isChanged原函数 `15169398..15169461`共6函数。所有索引为固定样本UTF-16；完整方法体/参数AST核对，不只对照选中分支。保留原tl/td/eM constructor.name，不因可读命名误触发ProductManager按名字选择的预取逻辑。

原环境getCurrent依次检查settings.env新/旧拼写、显式env新/旧拼写、产品networkEnvironment、当前session域名；provider的顺序却为settings新、env新、settings旧、env旧、current.networkEnvironment、ENV_PRODUCT_CLI_ACCOUNT_TYPE，再尝试productConfigEnv。这个差别及字符串productConfigEnv按字符再查env的边界均保留。switch先提交env/lastSwitchedEnv再sync并吞异常，同一值不重试；switchBySession保留显式设置/环境覆盖保护。域名通配符仍只跨单标签，其他regex元字符不全面转义，非法模式仍可throw。

ClientInternetEnviromentProductProvider按lower-case环境名加载product.<env>.json，6005优先级在endpoint provider6000之后合并，故环境JSON显式endpoint可覆盖settings endpoint。deploymentType先看current endpoint是否符合cloudHostedDomain，再按selfhosted/cloudhosted推断；缺文件保留原警告/降级且不缓存失败，成功JSON永久Map缓存、不被force/磁盘改写/strip-model env改变自动清除。stripBuiltinModelsIfDisabled与完整BooleanUtils实际原语义及抛错类型均保留，六份原JSON不改。

SettingsEndpointProductProvider保留10秒TTL、force不跳过、显式env变化即失效；三个配置值沿原trim，不做类型强制修复。selfhosted/cloudhosted且enterpriseEndpoint非空优先，其后staging+current stagingEndpoint，再普通endpoint。原SettingsChange清cachedConfig并generateConfig，仅ObjectUtils.isChanged(lastConfig,next)才触发原fire-and-forget sync；不擅自把全部设置变化都变成环境重建。

root默认注入同一原SettingsManager；SDK initialize的switchEnvironmentIfNeeded现在实际调用原环境服务，USER enterpriseEndpoint持久化后经原ProductManager发布/Agent重建，并可关闭/重启恢复。sdkControl.initializeDependencies仍最后覆盖；默认匿名account:null，显式sources.authenticationManager可作为借用来源，但模型API key不冒充产品token。ProductManager/环境/默认Cloud沿同一显式env对象，不写process.env。独立ProductHost未给manager时拥有完整SettingsHost，clearSettingsCache也接同一实例；不关闭借用manager。

earlyEnvInit/同步session推断未删改原方法。原PathUtils/平台home只读桥把真实home重定向至本次state/product-environment/platform-home，仅允许产品JSON和state内USER/session布局；默认无session文件，不读取安装账户/真实home。显式resourcesRoot可以换可信产品文件，symlink越界/资源路径穿越被桥拒绝，不是OS沙箱或全部竞态防护。early helper先检查authentication.id，直接读USER不应用setting-sources合并过滤，损坏JSON分支和三平台布局均测试；none不是禁止所有读盘。真实认证storage/登录命令和自动AuthenticationManager→switchBySession调用链仍待恢复。

所有权桥跟踪原settings回调、未await的sync和已接受的服务/嵌套方法，使用活动async token允许旧任务收敛而拒绝新调用。root在关闭共享SettingsHost之前先关闭环境入口并join；独立ProductHost并发start共享初始化屏障，close等待unfinished start，不会在close后又挂载环境订阅。借用ProductManager通过代理保留prototype方法及原this。

全量回归一度暴露连续权限规则测试磁盘allow丢失；不能简单当作测试噪声。现用受控真实临时文件读时序，完整原SettingsManager、endpoint和ToolPermissionService联合对照：慢读先捕获Write；新写提交Write+Read；旧读晚到回填60秒cache；下一次remove Write从旧cache构造set，磁盘变空而context保留Read。原类与port均确定性复现。未通过新增全局锁改变源码语义；旧串行转换测试在每步等待environment/settings消费者settle，并单列这一丢规则的竞态测试。源get/set非事务、cache无版本屏障这一风险明确保留。

第51组verify:product-environment涵盖4完整类21成员/6函数及398组有限行为比较，其中1组是上述跨完整原类的真实文件竞态；27专项覆盖三平台owned早期推断、scope/none、TTL/永久缓存、JSON优先级、SDK完整initialize/真实SDK调用/重启、Agent刷新、设置回调、原型receiver、并发start/close及安全路径边界。不是全认证、所有并发或整个harness100%。

REA对四个惰性完整类和三个session helper再次静态分析，证据`ev_617c617aa0417d2060733603a0d0c2cb61cb798f9824fe67291f73d1fcd2da21`；750节点/每文件750、150unknown、45秒，semantic graph为partial/truncated，未执行原bootstrap。SDK/OpenAI版本、依赖锁、六份JSON、115 Prompt及memory policy摘要保持不变。

本批最终门槛：1048核心、11Web、969编译JS smoke（942既有+27环境专项）、51组样本源码差分、check/build/config与实际CLI/Web启动全部通过。无原应用/bundle/旧node_modules的全新暂存快照重新npm ci/check/build，341项编译后环境/设置消费者/Addon/Cloud/产品/插件/市场/设置/权限/seed/SDK控制测试、11项Web测试及CLI/Web实际seed/reload启动均通过。发布审计601文件，在所检查的凭据/运行文件规则内无发现，不是安全证明；既有17项audit告警（10中危/7高危）未强制升级。上述失败时序已明确区分原竞态与串行测试前提，不以一次重试通过代替原因分析。后续优先WorkbuddySystemPromptService/原PromptRenderer与九collector/资源模板，再继续daemon动态配置/自动重启、完整认证storage/登录/SDK启动及其他产品providers；整体目标仍未完成。

## 原资源 PromptService、九 collector 与 Desktop 文本批次

coordinator SHA仍为8624215504229c4b6190f5c2172da270e015cc96871e90b261786f047e4c6e78。完整原Binary/Collaboration/Env/ExpertManagement/ExpertPromptSlot/Identity/Memory/Personalization/UserMemory九collector、PromptRendererImpl、WorkbuddySystemPromptService及archive TimeoutError，共12类67成员；原archive logger/mutex/file-lock/path/timeout/读写删迁移及prompt/template/proxy helper合计60函数、36初始化。另initialize.js完整resolveCliSettingsLanguage `5425992..5426506`（SHA528d3bffc67c5244d1a641e0cfc13c2be4ef7943c248b390125b76d70880ed19）使全函数为61。全部UTF-16定位与SHA/表见源码catalog；未执行Desktop bootstrap。

runtime-context完整13声明保留env/context/default优先级与dropUndefined，样本SHA9dc270ab82e397b64bf8984e840562236c5b46435a208e8204fc14ef6b112f43。原Node代理agent-base/helpers、HttpProxyAgent、HttpsProxyAgent及parseProxyResponse共5个完整惰性CJS factory单独固化net-log.js SHA。其builtin与debug sink只作显式外部依赖，不把它们冒充完整net-log/PAC/企业HTTP栈。SDK/OpenAI、Nunjucks依赖锁均未改。

新增config/desktop-prompts的15份tpl、7份style按原字节复制（不只是归一化字符串），manifest与verify:config独立核对SHA和字节数；115 product prompt、六份JSON及memory policy原摘要不变。模板kind选择仍scene mode优先于expertId，welcome code/design文件缺失沿原fallback，plain缺失抛原搜索路径错误。未知kind可先在path.join抛TypeError，未擅自增加fallback。原Nunjucks Environment(null,{autoescape:false})、逐次compile/render及collector顺序均保持。

身份初始化保留wx/default模板、短期workspaceInitInFlight共用而非永久initialized标志、workspace-state版本与BOOTSTRAP首次补种/删除完成/用户自定义文件跳过onboarding；expert仍物化基础文件但不注入Bootstrap/Identity。stale expertId+ask会选Ask模板但vars仍按isExpert处理，未“修复”另一层语义。默认SOUL/USER/IDENTITY/BOOTSTRAP的原文与截断notice不改。

Personalization先app-config对象（空对象也阻断legacy），再legacy settings.json；七种style、trim与非法类型原样处理。locale由app配置/系统locale得出，EnvCollector不直接消费request.locale；CLI参数沿原resolveCliSettingsLanguage得到简体中文/English。项目/用户记忆8k/4k、身份/二进制/云记忆10k均是JS UTF-16 substring边界；原提示文字和代码阈值不强行统一。disableLocalSkillsMemory不禁用云记忆，expertManagement和generateMemoryEnabled严格false及远端feature门槛均保留。

UserMemory按configDir+uid共用pending Promise，本地/空结果1秒、非空远端30秒；远端空/失败有另一个30秒cooldown，不阻止1秒后重读新增本地档案。UID存在且local非空时不要求token；legacy memery经原queueMicrotask→writeProfile→per-uid mutex→跨进程锁→版本守卫/backup/temp/rename完整迁移，旧文件保留。RAW_JSON解析/UID重标记/markdown fallback、相同版本跳过/旧版本拒绝、purge路径安全方法均未改。原跨进程锁协议不是全系统强一致保证。

完整原fetchProfile仍选择product endpoint或固定生产fallback、GET /api/memory/profile、5秒timeout；空authHeaders对象会抑制Bearer fallback，而不是自动合并token。sourceProxy helpers保留HTTPS_PROXY等优先级、loopback/NO_PROXY后缀与日志脱敏。独立host默认不允许任何网络origin，即使显式给了token；授权origin与代理origin都要显式列出。自有HTTP和真实captured HTTP proxy agent已实际验证，不访问目标域名/生产服务。响应流错误与close通过外部资源桥转交原error分支，不称所有网络底层行为100%等价。

createResourcePromptHost的Node FS边界只允许自有state、当前项目和可信templates读取，写入仅自有state；平台home重定向到state/home，默认app-config位于home/.workbuddy/app/app-config.json，不与CLI四scope设置混为同一存储。原git探测仍实际执行只读git rev-parse；HOME/显式env由桥拥有，不修改宿主process.env。symlink越界和Addon内部.resource-prompts符号链接被拒绝；不是OS沙箱，不执行原登录或BinaryManager安装/探测服务。

所有权桥持有原warmup/collector/helper的Promise，归档async声明在外层observer重绑，方法体不改。关闭会销毁自有请求/响应/代理socket/Git进程、join真实close事件，等待已接受的归档迁移（含延迟tmp写/锁释放），再释放TTL timer与cache。外部product/auth/binary adapter忽略取消时仍需自行settle，未声称任意借用adapter可强制终止。

createAddonSession无显式resolver/service时默认建立该宿主，把原vars与语言交到CLI；资源状态位于stateRoot/.resource-prompts，关闭保留文件。显式prompt仍优先，borrowed service/resolver不被擅自cleanup；resourcePrompts:false保留旧fallback边界。普通CLI/Web不改成Desktop入口；原mode插件抑制legacy prompt/tools仍需显式可信assetsRoot，新增tpl不代表整套插件/第三方二进制已发布。默认每独立后端的renderer/cache隔离、产品为原固定快照，应用级共享和live ProductManager/Auth需显式借用，未冒充原应用单例bootstrap。

首条身份/个性化隐藏块的实际调用者为完整WorkbuddyUserPromptService/IdentityContextSection，包含first-turn/clear/meta、Teams/Connector/文件与项目引用/additional-data分支。本批恢复原renderUserContext接口与全部模板输出，但未用近似字符串拼接替代整个UserPromptService，实际SDK消息注入链仍列为下一模块；不因变量文件/三个render方法可用就标记完整产品Prompt pipeline已恢复。

第52组verify:resource-prompts：12完整类67成员、61全函数、36初始化AST，13 runtime声明、5完整proxy factory、22资源字节；186组有限原类/port行为场景。验证用原Nunjucks24个compiler/runtime factory，禁用其可选chokidar加载，不启动watcher或app。29专项覆盖真实SDK vars/CLI语言、identity/bootstrap/个性化/memory、cache/cooldown、原归档/迁移、HTTP/proxy、真实Git和关闭屏障等，不是全平台/所有并发/企业账户100%。

REA对12完整惰性类、60 helper及36初始化做静态分析，证据ev_2bb30afdeff5c63ccd456050615b841ad79c980e6fdd84f9f8a128c0e300be88；750节点/每文件750、150unknown、45秒，semantic graph仍partial/truncated。该证据不含后来单列的CLI语言helper，不用静态关系冒充真实业务执行。

本批最终门槛：1077核心、11Web、998编译JS smoke（969既有+29资源专项）、52组源码差分、check/build/config及CLI/Web实际启动全部通过。新的全暂存快照无原应用/bundle/旧node_modules，重新npm ci/check/build，通过370项编译后资源/环境/设置消费者/Addon/Cloud/产品/插件/市场/设置/权限/seed/SDK控制、11项Web测试及实际CLI/Web seed/reload启动；22份Desktop资源304358字节另独立核对。五份原style带末尾空行，未为diff-check裁掉原字节；.gitattributes仅对捕获资源保留文本字节/末尾空行并防止EOL转换，其他代码diff-check无新增问题。发布审计634文件，在所检查的凭据/运行文件规则内无发现，不是安全证明；既有17项audit风险（10中危/7高危）未强制升级。后续继续完整WorkbuddyUserPromptService/sections与首条隐藏上下文、默认文本插件资源、daemon动态配置/重启和完整认证/启动链；整个目标仍未完成。

## 2026-10-20：完整用户PromptService与17 sections的独立ACP宿主

固定`workbuddy-auth-product-coordinator.js` SHA仍为`8624215504229c4b6190f5c2172da270e015cc96871e90b261786f047e4c6e78`。恢复完整`WorkbuddyUserPromptService`、17个section，共18类91成员；141个完整helper和58个初始化包括XML/CDATA、Teams固定prompt、NetDrive文件类型/大小限制、元数据/附件解析、命令URI与市场查找、frontmatter、腾讯文档选区和路径扫描/灰度策略。公开文件内catalog逐项列出原UTF-16范围；不混淆为字节offset。115 product prompts、6原JSON、22 Desktop资产与SDK依赖版本均未修改。

服务保留原懒加载section顺序、first_turn/every_turn、clear-session/alreadyInjectedUserContext、Legacy additional_data合并和Teams user-context/additional-data分层。包括首条身份调用、用户规则/项目信息、实际命令内容注入、专家切换/取消、工作摘要、项目指令更新与撤销提醒、Connector状态、Agent Mail虚拟项、todo/message chips占位符、微信/IMA/乐享/网盘附件和Ardot/style/image/mode/plan原提示词。所有本批恢复的class initializer、完整函数和const initializer逐项AST对照，非只对比几个method片段；两个原可选链括号单独prettier-ignore，防止格式化改变AST结构。

源边界一并保留：网盘缓存按session建键，先Set标记再await，因此并发第二次不join Promise；skipCall无缓存不标记，普通失败缓存null、17201/17210清三个project缓存；同session换project仍复用旧结果。项目指令以trim正文去重而非version/project；空正文不清旧值，work-summary优先todo再meta并跨轮保留。Connector diff仅id/status，名称变化不再注入，空配置不清指纹；无ConnectorService连虚拟Agent Mail也不输出。Todo引用提取能从URI回落id，而chip替换只认metadata.todoId，不能“修正”为两者都回落。异常IMA percent escape仍throw；原8000/20000等各处UTF-16字数与字符串逻辑不统一重写。

`createUserPromptHost`是新增独立所有权/DI桥：默认拥有原资源PromptHost，真正调用其renderUserContext；也可借用且不关闭。借用Connector/Expert/Product/Authentication、项目根和项目指令resolver，不读取安装账户、不自动请求原项目服务。只读桥允许state/project/templates及明确pluginReadRoots，检查现存祖先与symlink，允许macOS `/var`/`/private/var`显式根别名，不宣称OS沙箱/TOCTOU保护。close拒绝新服务调用，等待在途组合和owned资源写入，调用原cleanup再释放section图；不改原业务method，也不关闭借用服务。

TencentDocsAdditionalSection完整声明、selection/file-path parser、严格个人/企业/VPC feature gate、最多512 session FIFO和fallback调用分支已恢复；外部`@tencent/tencent-docs-ai-engine`真实renderer及完整DocumentService仍未恢复。启用AI edit却不给引擎adapter会明确报错，不塞空renderer当作完成。第53组verify:user-prompts的78场有限比较使用明确的外部engine/identity doubles，仅验证源section的调用参数、顺序、门控与缓存；独立29专项另覆盖真实资源模板身份组合、源码不一致、插件文件、祖先/symlink限制及关闭屏障。不能把替身输出当原外部引擎prompt字节已核对。

REA对本批18类/141函数/58初始化的惰性片段做静态分析，证据`ev_67c767e485d8ba0c1567b31ced36d7369726abc58667119671911ea78dd4a296`；13915 AST nodes，无parse失败。semantic graph上限750节点/150 unknown、45秒，仍partial/truncated；不执行应用bootstrap，不把静态边证明为运行时等价。

**仍未接通原SessionManager→ACP/SDK消息链**：本批公开API接受ACP blocks，不冒充AgentInputItems，不用本地计数器猜首轮；CLI/Web和Addon默认prompt路径尚未改。原meta富化、真实历史首轮/重放判定、附件/codec、默认插件文本、daemon动态配置/重启、完整登录/认证和BinaryManager仍待继续。完整模块声明还原与独立组合成功，不等于整个harness 100%。

全量与首次干净安装验证再次命中原settings慢读回填旧cache导致权限规则/模式丢失的既有风险。仅在首个更新之前和各步骤间等待消费者仍不能排除后续fire-and-forget读取；因此这个只断言串行权限转换的测试显式environment:false，仍运行真实权限服务/SettingsHost，其余默认环境集成测试不关闭。已有完整原类/port确定性竞态对照继续验证丢规则的失败时序，不给原SettingsManager加锁或改缓存版本语义，也不把重跑通过当修复。

最终门槛：check/build、1106核心+11Web、1027项编译JS smoke、53组源码/行为差分、config原字节校验及CLI/Web真实启动全部通过。新的全暂存快照不带原应用/bundle或旧node_modules，重新npm ci/check/build，通过154项编译后用户Prompt/资源Prompt/环境/设置消费者/Addon/Cloud测试、11项Web和真实CLI/Web seed/reload启动；22 Desktop资产仍为304358字节。发布审计640文件，在所检查的凭据/运行文件规则内无发现；既有17项依赖告警（10中危/7高危）不强制升级。下一批沿原`SessionManager.composePromptForBackend/enrichPromptMeta`、`hasUserMessageSinceLastCompact`状态与ACP codec推进实际后端消息链，不用会话长度近似压缩后的首轮。整个目标仍未完成。

## 2026-10-20：原 ACP 输入转换与首轮核心接入 Addon/真实 SDK

沿固定CLI SHA `4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd`与initialize SHA `528d3bffc67c5244d1a641e0cfc13c2be4ef7943c248b390125b76d70880ed19`继续。8个完整惰性CJS factory：12502 AcpUtils、18703 prompt-codec、80742 XML、56037 StreamJsonUtils、38548 timestamps、83473 AnsiUtils、69466 Agent符号/常量、67330 compact常量/策略helper；保留全部factory AST，不只复制几个输入case。另恢复原getVisibleTodoItems及applyAcpPromptTimestamp。原ToolNames沿已恢复枚举依赖，不复制其整个带zod与产品schema的模块；外部UI/EditFile/DI依赖为明确adapter，未知访问会报错，不用空对象算法假装恢复。

原CLI renderer的annotatePromptDerivedContent、injectTrackingMeta、tryExecuteLocalCommand完整3方法恢复。annotation仅第一个multi-block user且input_text多于1才加command hint，单块command的原遗漏不修；image-path附加文本导致的index计数原行为也保留。local command在SDK转换/图片写盘前执行；stats/rewind按原分支输出TUI-only提醒。本宿主只让原parser认识这两个不可执行名字，不注册假TUI执行器、不改变普通CLI command map。其他本地命令走实际CommandManager，纯文本输入不因加ACP接口而成为新agent loop。

initialize SessionManager选取完整8方法：enrichPromptMeta、composePromptForBackend、recordSessionEvent、updatePromptHistoryState、recordSyntheticUserPromptEvent、persistLastUserPromptExpertSelection、enqueueSessionEffect、flushSessionEffects；另15个完整helper支持metadata、原始事件去重、expert v1持久化、compact/separator和首轮判定。文件明确标记fragment，不把这8方法冒充整个大类/daemon。`isCompactInternalEventPayload`保留两个嵌套可选链括号并prettier-ignore，AST不做宽松忽略。

关键证据改变了“恢复历史是否算首轮”的判断：原session创建标志始终false，sessionHasPriorUserMessages只返回hasUserMessageSinceLastCompact；recordSessionEvent在isReplay时不调用updatePromptHistoryState。因此新backend恢复SDK历史仍重新注入首轮上下文，不能从history.length或user-message计数推断。实时user chunk置true，原compact/internal/separator清false并清上一位专家。合成原始用户事件在backend send之前记入，所以即使发送失败也不回滚该标志；本轮看到compact时不把旧expert重新写回。meta富化克隆请求，daemon/session上的上一专家覆盖请求伪造值；projectId与原truthy/trim差别保留。

新增`createAcpInputHost`为独立SDK所有权桥，Addon公开惰性`promptAcp({prompt,_meta},options)`入口：原UserPromptService组合 → 合成原始用户事件 → 原local command → AcpUtils.promptToUserMessage → StreamJsonUtils.parseMessagesFromPipeInput → annotation/timestamp → 既有backend/AgentService/真实SDK。没有手工把ACP blocks强转AgentInputItems，也不重新实现SDK。SDK inputSubject的新增历史经原AcpUtils投影驱动原状态；回放只按isReplay记录。独立接口返回文本，不冒充完整ACP RPC PromptResponse；原`.prompt`和CLI/Web默认入口不改，`acpInput:false`可禁用。

默认借用Addon资源PromptHost，保留原renderUserContext/17 sections；必要时单独owned创建。metadata storage用既有SDK session.meta.axonfireAcpOwnerRecord与SessionStore的明确adapter承载原v1专家结构，不模拟原账号/history数据库。state/project/显式readRoots限定图片读取；缓存仅写owned acp-input/cli/clipboard-images，保留原时间/sha1扩展名与existing absolute path优先，不写process.env、不扫描已安装home。外部image path不合法则回落到传入base64；source.type:text document原来只加base64 URI前缀但不编码，未“修复”。Addon内部acp-input拒绝symlink，路径桥不等于OS沙箱或TOCTOU保护。

关闭时先拒新ACP入口并关闭SDK后端，join已接受组合/异步观察者/原effect chain，再释放owned用户Prompt服务和借用资源，避免先关resource导致旧组合中途失败。原source synthetic/live通知的异步sink也由外层跟踪/记录rejection。普通SDK入口与ACP入口的原后端并发保护仍存在；外层ACP同会话拒绝第二次组合，不承诺完整daemon排队/cancel barrier。

第54组verify:acp-input对8完整factory、原Session 8方法/15helper、renderer3方法与2个额外helper逐项完整AST核对，并做235组有限行为比较：协议/元数据/徽标encode-decode、隐藏文本、文件/选区/图片、stream JSON/document、原meta/去重/合成事件/首轮/replay/compact及expert v1边界。验证原代码来自惰性declaration replacement，没有执行应用bootstrap。21专项另经真实SDK验证首轮/续轮、Teams引用、图片缓存、失败重试不回滚、恢复backend重新注入、真实history publication驱动compact、local reload/TUI提醒、时间戳、专家持久化/清除、并发/关闭、symlink与sink rejection；不等于所有平台、全部图片/文档或所有RPC分支穷尽证明。

REA静态证据`ev_677282a144de12af579ad9262517f0d232530cc36cf8dc803c0d504ed76f016e`覆盖本批惰性原声明，22657 AST nodes、0 parse失败；750 semantic节点/150 unknown、45秒，仍partial/truncated，不把静态边当运行时等价。OpenAI Docs核对了[官方SDK入口](https://developers.openai.com/api/docs/guides/agents/quickstart)，实际契约仍以本地锁定0.5.2源码和原调用链为准，未按当前文档升级SDK或替换SDK输入实现；测试仅自有Model/loopback，不调用生产模型或安装账号。

剩余范围：完整AcpView/RPC/连接认证/广播/队列与cancel barrier、SessionManager任务/Plan/权限请求回放与真实HistoryStore、原全局配置/插件home共享、动态mode/runtime自动重启/回收、真实Auth与BinaryManager、腾讯文档外部engine等仍未恢复。本批SDK入口可用不代表整个产品消息pipeline和完整harness 100%；默认文本插件资产/全部第三方二进制也不能据此算完成。

最终门槛：check/build、1127核心+11Web、1048编译JS smoke、54组源码/行为差分及config/CLI/Web启动全部通过。新的全暂存快照无原应用/bundle/旧node_modules，重新npm ci/check/build，通过175项编译后ACP/用户Prompt/资源Prompt/环境/设置消费者/Addon/Cloud相关测试、11项Web、CLI/Web seed/reload实际启动与原字节配置检查。115 product prompts、6 JSON、22 Desktop资源（304358字节）及SDK依赖未改。发布审计647文件，在所检查的凭据/运行文件规则内无发现；既有17项依赖告警（10中危/7高危）保留。后续继续完整原CLI AcpView/通知tracking与daemon会话控制，不把本批8个SessionManager方法与SDK示例当成整体目标完成。

## 2026-10-20：完整 ACP Agent/View、团队桥与流式协议核心

固定 CLI SHA 保持 `4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd`。新增完整 AcpAgentImpl（95 成员）、JsonStreamParser（17）、AcpView（22）、AcpTeamBridge（21）、DetachedMemberSseBridge（13）、AcpToolInterceptor（28）、TelemetryUtils（9）、RequestError（12），合计 8 类 217 成员。Agent 16 个完整函数、View 2 个函数以及关联常量一并保留；另 5 个完整惰性 factory 包含 Deferred、协议 tokens、W3C trace、历史 fork/用户消息 ID 和 ErrorUtils。新 wrapper 只承担显式模块解析/时钟/定时器，完整类体与声明的编译后 AST 对照，不执行原 74428 巨大模块的 bootstrap。

原生转发器不再只剩输入转换：保留 phase/progress/input/model/result/interruption 订阅、工具 pending/delta/done 与原 JsonStreamParser、tracking/compact generation/response-model 元数据、旧 result 忽略、interceptorGate/compact continue 抑制、团队终态与 session-idle 双重完成门槛、ModelBehaviorError 自校正、权限拒绝 cancelled 通知、审批 ACK 等待/客户端-abort-本地竞争和 WeakSet 去重。完整 ErrorUtils 恢复覆盖先前窄接口未导出的 getErrorMessage、stream timeout、empty stream、retryable model 等协议依赖。

保留源边界：Agent 5000 毫秒 ACK 超时返回 false、View abort 抛 AbortError；取消后不足 500 毫秒（含负差值）短路；busy prompt 走 queued 分支；background drain 在运行前清空队列且失败不恢复；iterator return 后仍先读取已停放项；退出 plan 的先前模式恢复、Ask ID 512 上限、空/重复 denial ID 过滤不重写。完整声明恢复不意味着这些原行为全部理想或可直接当新产品默认策略。

第55组 verify:acp-protocol 对 8 完整类/217 成员、29 声明、5 完整 factory 做 AST 核对；36 组有限差分包含增量 JSON 的全部切分位置、RPC/trace/mention/history/cache、ACK/abort、queue/iterator、审批各 outcome/本地竞争、compact/retry/team idle 和清理。协议客户端/外部服务为明确测试 doubles，不算原服务已上线。另一个真实 Agents SDK 集成通过既有 AgentService/SessionManager/TaskManager 跑 owned Read、工具结果、文本流和第二轮历史重放；只在该 fixture 显式 bypassPermissions，避免同时运行两个审批 owner，不修改默认安全策略。共37项新增测试。

REA 对三份惰性模块的静态证据为 `ev_fad57295cf09e96e53ed43bdf1ace2615cd12bf0bc75828c7bf81803122e30e2`，35243 AST nodes、3文件、0 parse failures。semantic graph 上限750节点/150 unknown、45秒，仍 partial/truncated；不将静态图或有限差分当整体运行时等价证明。

接线边界明确：公开 createNativeAcpAgent/createNativeAcpView/createNativeAcpPrimitives；依赖缺失明确抛错，不注入空业务服务。默认只含原 RequestError，不冒充完整 ACP transport SDK；外部 transport 需显式提供模块38113。CLI/Web、Addon.prompt 与上一阶段 promptAcp 默认链路不改。完整 View/Agent 类体已经恢复，但 RPC/连接 guard/广播、usage/title/friction 服务生产接线、审批 owner 切换仍待继续；Desktop SessionManager/HistoryStore/Plan 重放、daemon mode 自动重启、全局插件配置、真实认证/BinaryManager/外部 Docs 引擎等也未完成。SDK依赖、115 product prompts、6 JSON、22 Desktop资产字节未修改。参见 [ACP 协议核心](acp-protocol.md)。

最终门槛：check/build、1164核心+11Web、1085项编译JS smoke、55组源码/行为验证、原字节配置及CLI/Web实际启动全部通过。新的全暂存快照不带原应用/bundle/旧node_modules，重新npm ci/check/build，通过212项编译后ACP协议/输入/用户Prompt/资源/环境/设置消费者/Addon/Cloud相关测试、11项Web及CLI/Web seed/reload实际启动和配置检查。发布审计656文件，在所检查的凭据/运行文件规则内无发现，不是安全证明；既有17项依赖告警（10中危/7高危）保留。下一批优先恢复完整 friction/title 等源依赖，明确审批归属，再接完整View/RPC/广播与daemon会话控制；整个目标仍未完成。

## 2026-10-20：ACP 完整源服务、导出接口与 View 执行依赖接通

固定 CLI SHA 仍为 `4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd`。新增完整 SessionTitleServiceImpl（16成员）、FrictionAnalysisServiceImpl（9）、FrictionRecallClientImpl（1）、AcpBroadcastServiceImpl（26）、AcpUsagePublisherImpl（13）、UsageUtils（5），合计6类70成员、17全函数、15初始化。8完整惰性factory保留标题helpers、MessageContentUtils/MessageUtils、SessionUtils、usage分类/上下文构建器和完整ProductFeature/FeatureToggle枚举。原title/friction/recall模块16个导出getter单独AST核对，含Service/Client DI Symbols与同一Impl引用；getModule(68593/18945/43324)对应原导出，不只移植Impl而漏掉接口。巨大74428/93039模块未冒充全量恢复或执行其bootstrap。

保留原标题非TTY/force/env门槛、最短2 UTF-16 units、三次失败放弃、15000毫秒race、custom-title优先、generation ID、完整session prompt和JSON/regex解析。friction的boolean true gate、3000毫秒/POST/原路径、19个类型映射和root-cause集合、request/session去重、20/10条历史窗口、300字execution signal均按原实现；最高score结构合格但标签无效不尝试次高，上报前先标记reported导致失败不重试，不“修复”为新的策略。

广播原origin排除、tracking/compact/subagent、permission/question/checkpoint和session_end idle+0毫秒复查保留；ACK超时是2000毫秒而非主Agent/View的5000。usage保留250毫秒coalesce、used/size/cost/message/category去重、原快照request ID、团队stage先标记后发送及失败不重试、cache token优先级、CJK/ASCII/图片/hidden-section与token总数守恒分配。找不到model.maxInputTokens时原样skip/warn，不用估算上限制造一条成功usage。

createAcpServicesHost为明确新增所有权/DI桥，借用真实SDK backend与父ACP有边界的resolver，原类方法不改。外层shim观察嵌套/fire-and-forget Promise并保留facade方法name/arity/稳定引用；原未await的terminal updater、计数器和日志异步回调也被观察并保留receiver。close先拒新服务调用/连接登记，停broadcast/usage订阅，保持旧title/broadcast timeout race，join后清owned timers/连接/prompt状态图；不关闭借用backend/client/REST/Event/terminal服务。超时赢race不取消借用模型，请求/外部adapter自己负责传输和取消，这不是OS沙箱或所有借用操作终止证明。

默认没有远端recall/report网络能力；功能开启而缺少adapter时明确错误进入原catch/log，不塞空召回或假telemetry当完成。friction capture/tryReport方法可供原telemetry链调用，但还未自动恢复Galileo/EventService和request-send hook。原DI decorators不执行；新服务宿主不是原全局App/bootstrap。

第56组verify:acp-services核对完整声明/类体、8 factory和16导出getter，再做18组有限行为差分。另6项宿主/真实SDK测试，共24项：完整原AcpView.executePrompt以实际AgentService/SessionManager/TaskManager执行Read、工具结果、两轮历史、旁路广播、session_end、usage和原标题生成；另验关闭期间title/broadcast/未await回调、方法引用/arity、借用backend继续可用以及默认不连接外部服务。协议/recall/report边界使用明确doubles；SDK模型和文件均为owned fixture，单独bypassPermissions以避免两个审批owner，不据此声称默认ACP审批已等价。

CLI/Web、Addon.prompt与promptAcp默认入口未切换。后续仍需完整RPC/NDJSON/HTTP/连接guard/认证、审批owner及入口切换、Source request-send telemetry/标题Hook、Desktop SessionManager/HistoryStore/Plan重放、daemon mode动态配置/自动重启、真实Auth/BinaryManager/外部Docs引擎等。完整View直接执行与原组件保真比上一阶段更接近目标，但整个harness仍未完成；[ACP服务边界](acp-services.md)明确列出剩余范围。

REA对本批两份源服务/所有权宿主的静态证据为 `ev_f0869863d3a63ce4b2b839a0f8477b290519e9867fb087e94e010638f435d02a`，16007 AST nodes、2文件、0 parse failures。semantic graph 上限750节点/150 unknown、45秒，仍partial/truncated；不执行应用bootstrap，不把静态图或有限差分当整个harness运行时等价。SDK依赖、115 product prompts、6原JSON与22份Desktop模板字节保持不变。

最终门槛：check/build、1188核心+11Web、1109项编译JS smoke、56组源码/行为验证、原字节配置与CLI/Web实际启动全部通过。新的全暂存快照不带原应用/bundle/旧node_modules，重新npm ci/check/build，通过236项编译后ACP服务/协议/输入/用户Prompt/资源/环境/设置消费者/Addon/Cloud测试、11项Web和实际CLI/Web seed/reload启动及配置检查。发布审计664文件，在所检查的凭据/运行文件规则内无发现，不是安全证明；既有17项依赖告警（10中危/7高危）不强制升级。后续继续完整RPC/连接manager/guard、入口与审批owner切换、原request-send telemetry/标题Hook以及daemon会话控制；整个目标仍未完成。

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
|    2 | Prompt registry   | 100% 内容保留                | 115 模板、284,899 Unicode code point；Nunjucks `autoescape:false`、编译缓存、失败回退                                                                                                                                                                                                 |
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
|    6 | Permission flow | 完整原控制器/权限服务及SDK控制客户端 | 原InterruptionService、always/background审批、权限/缓存/模式策略已移植；SDK JSONL权限/Hook/MCP消息/elicitation客户端与dispatcher已接真实SDK。显式sdkControl默认启用nativePermissions/nativeApprovals；SDK启动/鉴权/产品初始化依赖、MCP server/proxy、policy到独立guard统一、Auto backend/SettingsManager仍待补，普通CLI/Web默认不变 |
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
|    7 | MCP               | resources 主路径高覆盖       | ready barrier、连接状态集合、显式 `mcp__server__tool` 白名单、connector URI、resource/template catalog、List/Read、二进制落盘、connector-proxy fallback、5 秒 WaitForMcpServers 分类与原始文案已实现；真实 MCP manager 生命周期、OAuth/transport 与动态工具刷新待接 |
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

# WorkBuddy Harness Reconstruction

WorkBuddy `5.3.14` Agent Harness 的固化证据驱动逆向还原工程。

## 原则

- OpenAI Agents SDK 保持目标应用使用的 `0.5.2` 依赖，不重写 SDK。
- `config/original/*.json` 是从目标安装包逐字节复制的配置证据。
- WorkBuddy 自定义 Harness 按静态证据重建。
- `src` 包含原类/方法控制流移植（TS注解与显式I/O依赖）及独立host adapter，不把整包当运行时启动；变量名和原TS类型未全部恢复，验证范围分别记录。
- 尚未完成动态验证的分支必须标记为 `reconstruction`，不能伪装成已验证事实。

## 当前模块

- 产品配置加载与完整性校验
- Nunjucks Prompt 注册、缓存和渲染
- PromptContext 顺序初始化、pending 合并、系统/Git/语言/模型/会话/feature 上下文与 prompt-vars 文件快照
- Env/SystemReminder/UserQueryWrapper/SkipRun interceptor，规则来源、IDE/channel/MCP 与 Hook context 注入
- Session 与原生 13 状态 / 20 事件迁移表、phase/legacy state 投影和 observable
- 原SessionManager结果/流/响应gate、AbortedStreamDraftStore、中断宽限迭代器、内容过滤分支和idle/start Hook调度
- 原InputHistoryService、八类生产响应interceptor、业务错误码映射及Token/PTL/确定性历史截断
- 六个原生输入处理器、父链修复、工具参数展示/Workflow源码预载、模型图片过滤；图片压缩与回填拦截器可显式接入
- AgentFactory 生命周期接线、旧 RunContext 结束事件过滤、工具参数重写与 MCP call context
- Tool 注册、权限过滤和 defer overlay
- 原AgentManager完整类：eager构建、ready/models barrier、合并重建、模型选择、handoff、插件替换/临时persona与工具刷新
- AgentService 四种运行入口
- RunnerFactory 输入修复和自动压缩判定
- ModelConfig interceptor：request > CLI > default、max token cap、thinking/effort/budget
- ToolCallLoopDetector：原始 4/40 次阈值、Read 同文件检测、停止 Prompt 与单次 marker
- OpenAI-compatible ModelProvider
- WorkBuddy fetch transport adapter（header/providerData、custom model 兼容、SSE timeout/normalization）
- Read / Write / Edit 文件工具与 read-before-edit 状态保护
- WebFetch / WebSearch 原 handler、API/本地抓取竞跑、HTML/AI 分析、缓存、网络策略与结构化结果
- DelegateTool、客户端注册表、ACP工具变更消息、动态描述缓存与已构造Agent工具刷新
- LSP九种操作、stdio客户端、握手/服务端回调、懒启动/重试/插件重载与独立宿主关闭
- ImageGen/ImageEdit/VideoGen、共享图片服务、视频任务提交/轮询/下载与图片Hook输入处理器
- ComputerUse的14种macOS动作、截图缩放/命令执行协议，以及工具结果到模型多模态请求的处理链
- WeChatReply/WeComReply、两套原生channel bridge、消息路由/提示/入站唤醒/审批与本地命令；客户端仅显式注入
- WechatClient/WecomBotClient、HTTP长轮询/WebSocket帧与分块上传、媒体加解密、QR/凭证迁移、原factory/registry；可显式启用恢复客户端，默认不连接
- Glob / Grep 搜索工具（ripgrep 主路径与 fallback）
- Bash / PowerShell schema、前台执行、后台任务和 timeout 转后台
- AgentTask 完整阶段生命周期、fork/resume、frontmatter hooks、skills 预加载、reasoning override 与跨 session 事件转发
- AgentTask 的 agent_end/idle 完成仲裁、压缩/重试中结果过滤、精确取消标记与 teammate failure 脱敏/分类/leader 提示
- InterruptionService 网络/流超时/模型错误恢复、重试窗口/上限与 deferred 工具纠正 Prompt
- Workflow 原生子 Agent spawner、限流退避/watchdog/abort bridge、schema 纠正、Worktree lease 与 AgentTask adapter
- Workflow 原生主执行器/解析器/编译器/prelude、root/nested VM、取消计时器、journal/cache/budget、registry 与 run record
- Agent/TaskCreate/TaskGet/TaskUpdate/TaskList/TaskOutput/TaskStop/KillShell handlers；运行中任务与持久化待办分别管理
- TaskStorageService 的数字 ID/优先序号、JSON 原子写入、metadata 合并/删除、跨进程 lock.json 协议
- EnterPlanMode / ExitPlanMode、PlanStorage、Plan 权限委派策略；AskUserQuestion 原始 schema、友好校验、路由与自由文本/跳过动作
- Skill / legacy SlashCommand handler，命令参数/内联 Bash/文件引用渲染、fork Skill 与子会话落盘
- Workspace SkillProductProvider：扫描/metadata/visibility/变量替换/cache，Skill/SlashCommand/Agent 描述预算与技能清单注入
- CommandManager 的命令优先级、注册/解析/本地执行协议；61 条 built-in/conditional 声明（不是 61 个已恢复的执行器）
- SkillManage 的 registry/frontmatter 范围判定、列表/模板/修改删除指引（不直接写入或删除技能）
- NotebookEdit 的 cell ID 匹配、插入/替换/删除、源代码换行、50MiB 限制和读文件状态刷新
- StructuredOutput 动态 JSON Schema、AJV、context factory、SessionStart/Stop 与强制反馈完成屏障
- CronCreate / CronDelete / CronList、cron 本地时间解析/jitter/过期、持久文件与 owner lock、missed 通知和调度服务
- MessageQueueManager 的编辑/hold/图片回填、legacy/deferred 消息拦截与独立宿主 idle dispatch
- EnterWorktree / LeaveWorktree、Git/PR base branch、初始化/变更检测、Hook payload、CWD/上下文提示与 Agent Worktree 隔离
- AgentTaskManager 的等待/取消/状态事件、5 分钟 TTL、Team 通知去重与清理 adapter
- PermissionManager ACP 请求、5 分钟超时和回调协议
- Agents SDK interruption 串行队列、主/子/Team 路由、channel relay、permission broadcast 与工具专属拒绝结果回注
- 文件型 TeamMailbox、TeammateIdleTracker 和 Team lead immediate inbox dispatch
- TeamManager/TeamCreate/TeamDelete/SendMessage、进程内与 detached-process teammate 后端、命名/后台派生、自动组队、成员续跑与关闭协调器
- DaemonProcessManager、tmux backend/registry、HTTP mailbox/审批桥、TeammateRunner、endpoint 文件与 DetachedMemberSseBridge 原生协议
- TeamContext 的原始 teammate/lead Prompt、roster 变化重注入与 leader 收件轮询
- scoped Session hooks（SubagentStart/SubagentStop/TeammateIdle/Notification）
- 原生HookManager/Executor/Prompt/ScopedRegistry及完整SessionHookManager/ToolHookManager，原工具执行wrapper、watchPaths、shell发现/匹配谓词；会话/工具/子Agent/Task/compact/Worktree/InstructionsLoaded已默认接线
- ToolSearch MiniSearch 索引、精确 schema 查找与 defer overlay
- DeferExecuteTool AJV 参数校验、builtin/MCP 执行与 MCP 多模态结果转换
- MCP resource catalog、List/ReadMcpResource、WaitForMcpServers
- XML engineering compaction、PreMessage/MaxToken/Blocking 摘要策略与失败回退
- SessionStore 追加式 JSONL/meta 持久化、恢复与活动历史分支
- Memory extraction 游标、完整 Prompt、独立 policy hash 和磁盘 memory scanner
- 原MemoryContext/Relevance/Extraction/Stop/Freshness完整类、typed/legacy entrypoint、query选择、取消与Read过期提示
- 原MemoryManager/Loader/Parser/Cache/Validator、子目录LRU与GlobMatcher，规则发现/import、常驻提醒和Read/Write/Edit条件注入
- MCP 准备与白名单
- Workflow 并发/流水线/嵌套运行
- RecordingModel / ReplayModel
- 独立 createHarness 组合入口、交互/单轮 CLI、跨进程 resume、取消/审批等待/安全退出

## 启动

Auto-memory现在按原包默认开启（后台extraction仍默认关闭、relevance selection默认关闭）。首轮/continue/缺少首user memory标记时，priority1150注入原typed或legacy Prompt与`<state-dir>/memory/MEMORY.md`。typed保留200行/40000 UTF-16上限和原WARNING；legacy保留自己的截断逻辑。既有会话沿用已加载context，新会话可读取更新后的entrypoint，不伪造实时watcher。

`settings.get('memory')`可设`autoMemoryEnabled/typedMemory/relevanceSelection/memoryExtraction/teamMemory`；原env `CODEBUDDY_DISABLE_AUTO_MEMORY`、`CODEBUDDY_MEMORY_ENABLED`、`CODEBUDDY_TYPED_MEMORY_ENABLED`、`CODEBUDDY_TEAM_MEMORY_ENABLED`、`CODEBUDDY_USER_ID`以及RELEVANCE/EXTRACTION_ENABLED/DISABLED优先级均保留。空格不被统一trim，不擅自归一化原差异。相关性开启后先调用memorySelector，读取JSON selected_memories中仍存在的文件名，排除当前session已surfaced路径；选中即标记，读取失败也不回滚。取消保留50ms等待、skipRun、Interrupted by user历史与forceIdle，不将source逻辑改成新的取消协议。

`autoMemory`嵌入选项可显式注入env/FS/clock/UUID、project/team/transcript路径和Git/OS身份。默认project目录与transcript指向本宿主stateDir，原生路径layout helper仍导出可用；team按原项目`.codebuddy/memories/@id`，身份按env→settings→只读`git config user.name`→OS，Git超时5000ms。独立宿主把Git cwd绑定CwdService，默认不读取已安装WorkBuddy配置/登录态。只加载可信memory文件：内容会进入模型请求；任意文件/路径权限仍由宿主控制，prefix检查不是沙箱。

Read旧project memory的PostToolUse追加原memory-freshness（年龄floor/clamp，<=1天无提示），再按原工具流程包入tool-hint，随后执行条件规则注入；完整通用Hook命令编排仍未完成。后台提取使用原完整类与SDK RunContext/RunState，5工具/5turn、独立conversationRequestId、runWithoutHistory文本消费、permission/purpose恢复及游标沿原。它使用bypassPermissions，Prompt中的“只写memory目录”不是强制沙箱；父signal预先已abort仍不补主动检查、成功后原abort listener不主动清理等边界保留。旧MemoryExtractionService构造器转接原类，仅extract/shouldExtract保留legacy embedding兼容辅助，不是默认运行路径。

规则来源已默认接通：user在`<state-dir>/CODEBUDDY.md`（其次`.mdc`）及`<state-dir>/rules`；project从工作目录祖先到当前目录依次寻找CODEBUDDY.md/.mdc、AGENTS.md/.mdc及对应`.codebuddy/`主文件，再递归当前`.codebuddy/rules`；local只读当前CODEBUDDY.local.md/.mdc。每组主文件仅取第一个成功加载项，祖先主文件遍历不含系统根目录。嵌入选项`memoryRules.homeDir`可显式改user配置根，默认不读已安装的`~/.codebuddy`；`userHomeDir`控制原`~/`import展开。

frontmatter沿原小解析器，条件字段是`paths`，不是`globs`；支持逗号字符串/多行列表和brace-aware切分，内联`[a,b]`不会按YAML数组解析。enabled/alwaysApply、@import深度5/realpath去重/40k UTF-16限制、子目录相对glob与200/200/100 LRU均保留。常驻规则进入system-reminder；Read/Write/Edit/MultiEdit未抛异常且truthy返回后将匹配规则追加工具结果，运行前priority1740消费其余触发，session按规则路径仅注入一次。缺少匹配项也清pending；这不是权限分类器或文件访问沙箱。

`harness.memoryRules.manager`暴露get/addFact/write/clear，`memoryRules.clear()`同时清主cache与子目录cache；源码cache不自动监视磁盘变化，失败Promise和负缓存也保留到clear。addFact只做原section插入/substring去重和直接文件写入，无原子写/跨进程锁。规则可import工作区外的任意路径，symlink、`~/`和@字符按原解析，不擅自限制为cwd；只加载可信规则。`memoryRules.instructionsHooks`显式接InstructionsLoaded，loader不等待Hook，独立close等待本次已派发Hook；未自动执行规则目录中的shell命令。MemoryRelevance/entrypoint/context、Read freshness和原提取RunState现已接入；通用Hook命令执行器、watchers/产品UI仍待恢复，不将八类服务当成整个memory子系统完成。

AgentManager现使用固定样本的完整原类（68个非constructor方法及原字段初始化），不再使用手写lazy构造器。`createHarness()`返回前完成eager构建；直接`new AgentManager(...)`的嵌入方须在注册工具、接入CommandManager后`await agents.start()`，结束时`await agents.close()`。`get/getAgentConfig`均异步；缺失`get`返回undefined，`getAll`不等待ready，`ensureAgentToolsFreshForRun`返回void而不是Agent。具体SDK实例由get取得，普通工具刷新保持identity，配置重建会创建新实例，旧managed实例仍可同步新工具。

`createHarness.agentManager`可显式注入`getConfiguration/onConfigurationChange`、settings、plugins、outputStyles、prewarm和MCP依赖。原生pending/force重建合并、ready/modelsReady屏障、CLI筛选、handoff、custom/MCP授权、模型继承/related/环境覆盖、插件replace→volatile expert prompt→settings.agent优先序已恢复。内嵌expert Prompt和插件条件/include/fallback工具合并保持原文，frontmatter使用原包74个YAML模块，不换解析器版本。只接受受信任的显式插件配置/目录；不会自动扫描安装账号或插件。MCP白名单host当前只记录注册意图，完整客户端middleware、ProductManager远端刷新、PluginRuntimeRefreshService与ToolManager完整索引/缓存生命周期仍未恢复。

保留源码边界：instruction指纹只取长度和前32字符；同ID模型内容更新/仅模型删除可能跳过重建；普通删除Agent配置可能仍留在Map；初次构建失败仍开放ready屏障，但getDefault/refreshAgents保留错误；首次session MCP等待最多2000ms，外部abort可重试，超时/失败按原路径视为completed。它们不是健壮性承诺，不擅自修正源码行为。

需要 Node.js `>=22.19`；先执行 `npm install && npm run build`。

```bash
npm start -- --help

# 在当前 shell 中设置你自己的凭证；不读取已安装 WorkBuddy 的登录态。
export CODEBUDDY_API_KEY='your-key'
export CODEBUDDY_BASE_URL='https://your-compatible-endpoint.example/v1'

npm start -- --cwd /absolute/path/to/project --model your-model-id

# 单轮模式；只显式允许列出的工具。
npm start -- --cwd /absolute/path/to/project --model your-model-id \
  --allow-tools Read,Glob,Grep -p '阅读项目并解释入口'

# 使用 stderr 输出的 Session ID 续聊；使用相同 cwd/state-dir。
npm start -- --cwd /absolute/path/to/project --model your-model-id \
  --resume SESSION_ID -p '继续'
```

交互命令：`/session`、`/compact`、`/exit`。默认数据目录是 `<cwd>/.workbuddy-harness`，可用 `--state-dir` 修改。凭证也接受 `OPENAI_API_KEY`，地址也接受 `OPENAI_BASE_URL`；必须显式配置地址，避免隐式连接产品服务端。模型名可以是原始配置 ID/alias 或兼容端点的自定义 ID。

独立 CLI 是本工程新增的宿主适配层，不是 WorkBuddy 完整 CLI 的逐字还原。默认每次工具执行都需用户确认；非交互模式未显式批准的工具会被拒绝。`--allow-tools` 是此宿主的名称白名单，非原产品的完整权限分类器。`--permission-mode bypassPermissions` 明确允许工具自由执行；未恢复 sandbox/PTY，不能视为隔离环境。MCP 生命周期/SDK 原生 MCP 权限客户端尚未接通，CLI 当前不自动加载外部 MCP 服务器。

`--permission-mode plan` 可从 Plan 模式开始；计划保存于 `<state-dir>/plans`。Enter 保存旧 mode，Exit 审批通过后恢复；Plan 文件写入不重复询问，其他操作沿用旧 mode 的宿主策略（Plan 不是 blanket read-only 权限）。默认 deferred 的 Exit 也会先暂停 SDK、经用户批准再执行。`allowedPrompts` 按原 schema 保留，不擅自扩展为宿主自动授权规则。交互 AskUserQuestion 支持数字选项、自由文本和 `/skip`、`/done`、`/chat`；print 模式按样本禁用该工具。

`--prompt-vars-file /absolute/path/vars.json` 接收 `{ "version": 1, "variables": { "key": "value" } }`；值只允许 primitive/null，不覆盖已有上下文，过滤原型相关键。沿用原样本的选中文件快照缓存，同一路径文件修改不会立即重载，切换或移除选项才失效。`createHarness` 可注入 `askUserQuestion` 和 `reminderSources`。Env interceptor 会按样本将 settings.env 写入进程环境；MemoryManager规则发现/导入/缓存与条件注入现已接通；Windows shell factory、插件/扩展的其余PromptContext来源与完整生命周期仍未接齐。

技能默认扫描 `<cwd>/.codebuddy/skills`、`<state-dir>/skills`、`<state-dir>/connector-skills`，也接受 `CODEBUDDY_SESSION_SKILL_DIRS` 的单一路径（按原样本不拆分列表）；`createHarness.skillPaths` 可显式指定各根路径与 bundled seed snapshots，`skills/commands` 可注入宿主配置。不会隐式加载已安装 WorkBuddy 的整个插件目录。技能加载采用原有 frontmatter、最大深度 5、默认并发 32、metadata 顺序和缓存；`skillProvider.provide({ force: true })` 可重载。`Skill` 支持完整名、无歧义短名、显示名、legacy command 参数、session/skill-dir 变量、内联加载与 detached fork AgentTask；frontmatter skills 也接入子 Agent 预加载。

批准 Skill/自定义命令会允许其渲染过程执行 `!\`shell command\`` 并展开 `@path` 引用。只加载可信技能；独立宿主的 inline shell 是可取消的进程适配器，不是原产品 sandbox/PTY。引用沿用 5 层、256 KiB、约 25k token、1000 目录条目的限制及 PARTIAL view 原始警告。Skill 描述保留 8k 字符预算、单描述 150 字符、200 个总技能上限（只裁减 user-level）、protected skill 策略、disabled 技能与 builtin 名称冲突规则。

原配置保留 SlashCommand 声明，但当前 19 个 Agent 均未声明该工具；本工程不擅自加入默认 allowlist，模型通常通过 Skill 的 slash fallback 调用命令。旧 SlashCommand 通过显式 SDK Agent 注册单独验证。`commandExecutors/commandHost` 用于接入本地命令；没有伪造未恢复的原生 UI 执行器。`/review`、`/exit` 等模型禁用内置命令仍会被拦截，同名自定义命令不绕过此限制。完整插件 Skill loader、seed 物化、native executor/UI、描述缓存与插件热刷新生命周期仍待补齐。

`SkillManage` 沿用原 `productFeatures.SkillManage` gate（当前原配置为 false）。它只返回技能创建/修改/删除指引，绝不直接删除目录或写 registry；范围由 `agent-created-skills.json` 或 `agent_created: true` frontmatter 判定，前 30 个技能显示详情、其余仅名称、最多 30k 字符。模板中 `agent_created` 与部分操作文案中的 `agent-created` 拼写差异也按原文保留。`NotebookEdit` 虽有产品工具声明，但同样未被当前 19 个 Agent 暴露；保留独立 handler 与 SDK 显式注册验证，不扩大默认 allowlist。它不会替所有修改场景清空执行结果；行为差异已用原类差分覆盖。

嵌入式入口可用 `createHarness({ ..., jsonSchema: JSON.stringify(schema), outputFormat: "json" })` 或 `openSession(undefined, { jsonSchema, outputFormat })` 启用结构化输出，读取 `session.structuredOutput`。动态参数支持 JSON schema/function，运行前在正确的 session async scope 中生成。沿用 source gate：只有 json/stream-json 格式创建 completion context；普通最终回答未调用工具时最多追加 3 条强制反馈，第四次 Stop 结束等待；已经捕获输出则完成，不额外重试。缺少/无效 schema 的 fallback、同一对象引用不重复 compile、原始输出或 data 包装、meta feedback 均保留。独立 CLI 目前仍输出文本；这里的 outputFormat 是恢复的会话配置，不宣称完整产品 JSON/stream-json 视图协议已经恢复。

Cron 工具同样未被原配置的 19 个 Agent 暴露，不自动扩大 allowlist；显式 SDK Agent 可注册调用。模型版 CronCreate 不提供 durable 参数，默认创建 session-only recurring job；持久任务通过 `cronState` 嵌入 API 创建。状态管理器初始 disabled，创建任务后启用；若仅恢复已有持久任务，需要宿主显式启用。`cronStorageDir` 默认 `<state-dir>/cron`，不会读取已安装应用的定时任务。文件沿用 `scheduled_tasks.json`/`scheduled_tasks.lock`，单个 owner 调度 durable job、其他会话仍调度自身内存任务；仅 `CODEBUDDY_DISABLE_CRON=1` 禁用。500ms tick、50 个上限、3 天 recurring 过期和确定性 jitter 均保留原逻辑，包括已过期任务最后触发一次、durable 删除数量不计入返回值等原样本行为。

调度输入经 `queueSubject`/MessageQueue interceptor 进入真实 SDK 回合；独立宿主补充 idle drain 与 `onScheduledOutput` 回调，CLI 显示输出，忙碌会话等待当前回合结束。此 drain 是替代尚未恢复的桌面 deferred dispatch 前端的宿主适配器；原 `MessageQueueDeferredDispatch=true` 配置未修改。状态机的完整原始迁移表（含非法迁移忽略）已差分验证；RichMessageQueueManager、完整 request processors/UI、调度遥测仍待补，不将队列主路径测试视为完整产品恢复。

`--memory-extraction` 可选启用后台 memory 提取，保存位置为 `<state-dir>/memory`；沿用样本的隔离 transcript、5 工具/5 turns 与 bypass 权限行为，默认不开启。`createHarness` 同时提供 `openSession/prompt/compact/waitForMemory/close` 供嵌入；同一会话拒绝重叠 `prompt`，退出时中止活动请求、等待落盘并清理自身后台任务。

Agent 委派、独立子会话与恢复已接入；子 Agent 使用原始 `agent-` + 8 位 ID，SDK `toolCall details` 会透传到直接与 deferred builtin 调用，用于父调用关联和 TaskCreate 序号。待办保存于 `<state-dir>/tasks/<scope>/<id>.json`；scope 沿用 `CODEBUDDY_TASK_LIST_ID` → parent session → current session 的优先级，Team host 可注入独立 scope。任务输出保存于 `<state-dir>/task-output`。`TaskStop` 与旧 `KillShell` 是不同的 schema/返回文案，并非简单互相改名。

Team 进程内路径现已接入，沿用原 `CODEBUDDY_CODE_EXPERIMENTAL_AGENT_TEAMS` gate：只有字符串 `"0"` 关闭，关闭时 Agent 的 `run_in_background` 按原逻辑同步执行。TeamCreate/Delete 明确非 deferred，SendMessage 默认直接暴露；不修改原 Agent allowlist。具名 Agent 需已有 Team；后台 Agent 自动创建 `_auto_<session-id>`。派生链串行处理名称冲突、颜色与失败回滚，保留原 Promise chain 失败后后续派生继续失败的行为。TeamContext 使用逐字保存的 `team-sys-prompt`/`team-lead-prompt`，成员名单变化时重新注入。

Team 配置与 inbox 位于 `<state-dir>/teams/<name>`；共享 Task CRUD 位于 `<state-dir>/tasks/<team>`。未知收件人仍写入 inbox 并提示 pending；`main` 路由到 `team-lead`，身份不明的会话拒绝冒充 leader。关闭/Plan 协议保留原默认批准、request_id、renderer 和文案；ShutdownCoordinator 保留 15s 默认、环境变量数字前缀、timeout=0 无限等待、发送失败/超时强制终止及 cancelAll。成员完成后收到新消息会从原子会话 transcript 续跑；只有 shutdown_request 时自动回应，不额外启动模型。

leader/member 的 mailbox 2s 轮询、忙碌排队/idle 唤醒、leader 关闭回应去重已恢复；独立宿主继续用此前的 idle drain 替代尚未恢复的完整 RichMessageQueueManager/request processors/UI，并在关闭时等待 detached SDK 执行退出、清理本次创建的 Team。保留原 JSON read-modify-write inbox 协议，不伪造原子锁，不能宣称并发写不丢消息。低层 Team 路径/递归删除和 Worktree force fallback 仍不是安全沙箱，只可传入受信任名称/目录；宿主工具审批保持开启。完整 Stop Hook/UI、Plan approval 全状态及产品 Gateway/ACP 宿主仍待补齐。

外部进程链现可显式使用 `--team-backend detached-process`，或 `createHarness({ ..., teamBackend: "detached-process" })`。必须提供显式 API key/baseURL；内存 ModelProvider 不能跨进程传递。默认仍为原 TeamMember 的 in-process，不把 registry 自动检测接到原本未调用它的路径。真实子进程支持初始分配、leader 工具审批、后续 mailbox、关闭回应、历史落盘与 PID 清理；宿主额外追踪本次 fork 的 PID，收回初始 mailbox 发送失败造成的孤立进程，先停止子进程再删除父会话创建的 Team。tmux 命令类已恢复并用假命令验证，CLI 尚不支持 tmux override，没有操作真实用户 pane。

嵌入时可提供 `onTeamMemberUpdate(event)`，待 endpoint 文件出现后调用 `await harness.detachedTeamHost.connectMember(leaderSession, teamName, memberName)`；返回 false 表示未就绪，由调用方决定重试。原 bridge 发现非空历史时只重放历史，不再建立实时 SSE；保留 call_id/id 的原优先级。`StandaloneTeamGateway` 是仅绑定 loopback 的最小独立适配器，提供恢复的 Team REST controller 和当前会话 ACP observation，不是完整 Gateway/ACP。`x-codebuddy-request: 1` 不是认证；不要代理到公网。宿主额外限制 HTTP 请求大小与 Team 路径，低层原类未据此改写。原 Runner 只探测 PermissionBridgeClient 可用性，真正审批 relay、SDK settle/abort、默认 Agent 预热及退出收尾均明确属于 standalone adapter。

AgentFactory 已按原 Agent 级事件接线，旧 RunContext 的 `agent_end` 不覆盖新回合；保留 9 个 bypass Agent 名称及仅 `context_summary_pre_message` 的 purpose gate。工具参数递归替换规则保留原未转义正则行为，MCP call context 使用原 `AsyncLocalStorage.enterWith/clear` 协议。AgentTask 在执行前订阅 `agent_end`/runState idle，以 `_currentStep=next_step_final_output` 保护流结果访问；压缩/外部 retry 期间忽略暂时 error/cancel/finalOutput，显式 kill 优先，取消文案严格匹配 `Task was interrupted by user`。`executePhaseWithRetry` 的原名不意味着内部存在重试循环；普通会话错误重试在 InterruptionService，45 秒限流退避/watchdog 则属于 Workflow，不会无差别加到普通 AgentTask 上。

正式 teammate 失败写入 registry（auth/network/model/unknown），错误按原规则移除 URL query、认证 token、API key 并截断 500 UTF-16 字符；leader priority1160 注入逐字 `Teammate Failure Report`（10 分钟 TTL、历史 marker 去重、teammate 自身不注入）。Start/Stop Hook 和最终输出捕获失败按原逻辑不使任务失败，输出保留 `--- RESULT ---` 分隔。独立宿主在原完成仲裁后额外等待 SDK/JSONL 落盘，并在 cached resume 时清除旧 result，以模拟原 SessionFactory 新建 resultSubject；这些适配不伪装成原产品代码。当前createHarness返回前已完成原生eager构建，不再需要额外getDefault预热；直接构造AgentManager须在注册完工具后显式start。

普通会话恢复保留原策略：仅 ECONNRESET/ECONNABORTED/ETIMEDOUT 归为 network；最近 3 条活动历史中的网络重试 marker 限制连续重试；首 token timeout 最多重试 2 次、其他 stream timeout 最多 1 次，每次延迟 2s×次数，最终输出后计数归零。模型 SyntaxError/ModelBehaviorError 使用最近 4 条历史、2 个 marker 的上限；不存在工具与直接调用 deferred 工具的纠正/停止 Prompt 逐字恢复。silentAbort、未完成 tool call 的 incomplete/error 结果、主/子任务事件顺序保留；不会把任意 HTTP 429/5xx 当作普通会话自动重试。超时错误类及 EmptyStreamError 的继承关系已按样本修正。独立 SessionManager 把错误生命周期交给 InterruptionService，宿主先等待错误回注/新 result 发布，再决定抛错，避免重试前误判失败；主 UI 的完整 Stop Hook/profiler/telemetry 分支仍未恢复。

结果生命周期现由 `SessionResultLifecycle` 移植原SessionManager的七个方法：流/非流消费、response interceptor gate、内容过滤fork、idle timer和SessionStart合并。原始模型事件写入timestamp和message/model/request/trace元数据，最后响应项补rawUsage；非流读取newItems而不是output。gate按中断快照、网络错误、完成异常、retryInProgress、压缩及响应interceptor顺序计算，只有interceptor严格返回true才继续等待；单个interceptor失败记日志后继续。InterruptionService保留`_hasInterruptions`快照，显式false不被后续live数组覆盖。

`AbortedStreamDraftStore`保留文本、reasoning和ChatCompletions/Responses工具片段，按reasoning→assistant→tool顺序落盘为incomplete/isPartialAborted，按对象和id/callId去重；不强行补全未结束的JSON参数。`CODEBUDDY_ABORT_GRACE_MS`在iterator工厂创建时parseInt，正数有效，默认3000ms；宽限到期不await iterator.return，不能据此宣称所有挂起模型都已取消或所有竞态无损。内容过滤notice的原英文文本、skipRun、parentId和strippedUserMessageId保留，同messageId去重并发historyReload；不捏造空messageId。空模型output沿原silentAbort，structuredOutput例外。

嵌入可注入 `createHarness({ ..., sessionLifecycle: { interceptors, onSessionStart, onNotification, timers, env, telemetryService, galileoSessionBridge, mapMessageErrorCode } })`。idle每60000ms检查，busy重置，idle调用原`CodeBuddy is waiting for your input`/`idle_prompt`；startup/resume复用WeakMap中的首次promise，完成或失败后也不删除。独立host关闭释放本次timer/subscription；ensure初始化不重复重放BehaviorSubject。CLI消费捕获到的gate，等待异步后续result；终止审批/计划拒绝用host独立ledger结束，不篡改原gate。TaskCreate执行前增加指定call历史发布屏障，避免原序号算法早于异步落盘。

这些是原方法控制流与显式宿主边界，不是完整SessionManager/ACP还原。该批20项专项与682次原包差分分开计数；真实SDK和本地HTTP/SSE验证部分草稿落盘、后续回合及延迟gate续跑。其后InputHistory、八类生产响应interceptor和原业务错误码映射已继续恢复；通用Hook执行器、完整原CLI/React视图和Galileo/telemetry transport仍待补，observer默认保持明确的离线适配。

## 输入历史与生产响应拦截器

`InputHistoryServiceImpl`完整原类保存按project区分的用户输入，不是SDK会话transcript/分支服务。默认在本工程`<stateDir>/history.jsonl`追加`display/pastedContents/timestamp/project`，getHistoryForProject默认取最近100条并按时间正序返回。仅内存中上一次display+project相同会去重，不比较pastedContents，也不跨重启去重。坏JSON行warn跳过，其他合法JSON不补schema。legacy `input_history`通过显式`inputHistory.localStorage`读取，仅作fallback，不自动迁移/落盘，也不读取已安装产品的LocalStorage。

原writeLock只串行本实例addHistory，失败也释放；cleanup没有跨进程锁或原子替换。每次成功append重设5000ms cleanup，文件达到120×10000字节才扫描，超10000行保留最后10000；cleanupHistory默认30天，是显式低层方法，不自动清理安装目录。清理沿原规则可能重写记录，不是安全备份方案。独立host关闭会清本次timer、等待writeLock和已开始的cleanup，这是单独的资源所有权适配。CLI交互模式载入/保存输入，print和内部Agent/重试不写UI输入历史；Node readline不是原React历史搜索/模式前缀/粘贴UI还原。

原Component把metadata push入数组，autoBind反向绑定；默认响应链据此为：ModelPermissionError → FallbackModelError → MediaContentError → QueuedMessagesCleanup → TruncatedToolCall → TextualToolCall → finishReasonError → ContextTruncation。八类52个原方法体及内嵌Prompt/常量已移植，`sessionLifecycle.interceptors`显式提供时整体替换默认链；不擅自按源码声明正序执行。`harness.responseInterceptors`可检查实例。

length先丢弃无效JSON的tool call，再按最近15条活动历史最多重试2次；Write/MultiEdit/Edit/Bash的逐字缩小操作提示保留。文本工具恢复只识别代码块/inline code之外的原`<invoke name="...">...</invoke>`正则，不把所有工具名文本当调用；最多重试1次，默认清理assistant模型输入，模块加载时`CODEBUDDY_TEXTUAL_TOOL_CALL_CLEAN_RETRY=0`才禁用。若自定义Model没有messageId，原fallback只标记SDK raw item，已复制的history项可能不带discard，不捏造request ID去掩盖此边界。

媒体错误按原pattern分型：too-many移除最旧图片，其他已识别媒体错误移除最近图片，覆盖user/tool output/JSON/providerData视图；GIF码11125/11133/11135只替换用户GIF，不自动重试。常规媒体恢复最多10次，body/shape无图可移除时复用PTL确定性截断。PTL优先emergency-auto强制压缩，失败再按token gap或组数删最旧API round；单组按call/result配对截断，至少保留一组/一对，补原marker，最多3个PTL marker；pending approval/compact limit沿原阻止fallback。TokenUtils对中文按1.8字符估算、其他按4字符，图片使用原占位符；Runner/Compactor的末尾工具结果估算现接此原实现，不再使用早期近似stripImages。

`--fallback-model <id>`/`createHarness({fallbackModel})`只在print模式生效：overload先同primary重试一次，再切fallback；quota exhausted直接切，已激活不重复切，fallback等于当前模型则跳过。业务分类和错误码映射取原ErrorUtils enum/helper，保留nested/status/responseBody/429优先级及3001/3002/3003/3004/3006/default分流，不把普通retry的network分类扩大成全部429。模型权限码11136强制`productRefresh.sync(true)`并把可选模型列表追加到原错误；offline默认明确拒绝live sync，不伪装已刷新。完整产品配置热重建与认证/服务端策略仍待补；遥测方法的调用顺序保留，默认不发送生产telemetry/refund事件。

982次固定SHA差分包含上述类/辅助函数、默认DI顺序、静态配置/正则和内嵌Prompt/log模板。25项专项另含真实SDK的length/文本工具/PTL/fallback，以及本地HTTP/SSE和实际CLI子进程验证；未访问真实产品/模型端点。SDK接线仅按[OpenAI Docs的结果/状态说明](https://developers.openai.com/api/docs/guides/agents/results)核对边界，实际接口仍锁定0.5.2，不用当前文档替代样本实现。

Workflow 子 Agent 可以通过 `await harness.createWorkflowSubagentSpawner(session)` 获取，再以 `spawn({ prompt, abortSignal, schema?, isolation?, label?, ... })` 执行；这只是子链入口，后台工具 handler 见下方。子链保留 180s 默认 stall、至少 5s 的 watchdog 检查、45s 单次 throttle backoff，以及低于 50 tokens/耗时超过 stall 一半/无 stopReason 与 structured 的启发式门槛。Schema 校验支持 fenced/balanced JSON、Ajv defaults/不强制类型转换，最多两次纠正且始终基于原 prompt；结果含 metrics/sessionId/工具快照，结束移除 Task registry。Worktree lease 干净即删、有改动或探测失败则保留；已用真实 SDK 验证 schema 纠正与隔离 Read、不覆盖父工作区修改。

原生边界也保留：Workflow adapter.abort 只调用 task.abortController，而不是 kill/子会话 abort；当前样本可见路径没有额外的请求取消桥，因此 watchdog 触发不保证底层 SDK 请求退出。只有工具调用时间戳用于刷新 activity；Prompt 中宣称禁用 Agent/SendMessage 也不等于该 adapter 实现了额外权限策略。root abort racer 结束主运行不意味着子请求已退出；独立 harness close 会另外取消/等待仍注册的 SDK 任务，已单测验证。Workflow handler、Manager/PauseGate、快照、provider、后台通知、原列表/保存命令与 ACP progress 协议已接通；产品 React UI、完整 ACP lifecycle/输出视图仍待补。

Workflow 主运行链已替换早期骨架，可显式嵌入（仅运行受信任脚本）：

```ts
const workflow = await harness.createWorkflowRuntime(session);
const request = await workflow.prepare({
  script: 'await phase("analysis"); return agent("Analyze the input", {label:"worker"});',
}, { runId: "first", args: { input: "example" } });
const result = await workflow.run(request);
// 对同样调用链，resumeFromRunId: "first" 从 journal 复用成功结果。
```

解析器使用样本相同的 Acorn `8.16.0`，只 literalize `meta`，保留 export 字符偏移、11 个字段及错误位置；编译器保留原确定性扫描/字符串和 template 启发式、async expression/body 包装。Runtime prelude v1 原文保留：冻结 Date 到 epoch，拒绝 Date.now/parse/UTC、Math.random 与 performance.now。root/nested VM 的 30s 同步超时、参数 JSON clone、host built-ins、日志与 nested phase/timer 差异均按样本恢复。Node VM 和这些启发式不是安全沙箱，host 构造函数仍暴露，不能用来执行不受信任代码或承诺确定性隔离。

主 hook 签名是 `agent(prompt, options?)`、`parallel(jobs, options?)`/`parallel(items, mapFn, options?)`、两种 pipeline、phase/log/workflow；不保留旧猜测骨架的不同接口。最多 1000 次 Agent、50 项 batch、原动态并发上限、200 条 Agent 快照与 4096 UTF-16 预览均恢复。journal 为串行 JSONL（0600），损坏行跳过/失效事件清除结果；v2 chained SHA-256 只包含 prompt/agentType/model/isolation/schema/maxTurns。run record 使用原 `workflows/wf_<id>.json` 名称，独立 state 根替代产品的项目路径编码；journal 在 `sessions/<session>/subagents/workflows/wf_<id>/journal.jsonl`。

原生缺陷不掩盖：取消后部分 hook 永久 pending，由外层 racer 结束；budget.reserve 只检查、不预留并发 token，未配置 budget 时 spent 仍为 0；reserve 失败在 semaphore try/finally 之外；缓存命中不重新写入 agent_finished journal；nested phase 要求 body 且不记录 phase；完成事件会 debounce，关键事件可能先发出。主链已验证 SDK→schema→journal→resume/cache，后台工具和跨进程 journal 复用已验证；产品 UI、所有宿主策略/竞态和崩溃恢复仍不宣称 100%。

Workflow 后台工具现按原 schema 注册，`args` 严格为 string，未知字段拒绝；`CODEBUDDY_DISABLE_WORKFLOWS=1` 或 settings.disableWorkflows=true 禁用，独立宿主也在直接/deferred target 分流处执行该 gate。原默认 Agent allowlist 没有 Workflow，不擅自添加；SDK 测试用显式内存 overlay 暴露它，配置文件未改。工具立即返回原 workflow-started renderer/runId，完成后写 .output、更新状态，再入队逐字 task-notification，宿主 idle drain 唤醒 leader。TaskOutput/TaskStop 已共用通用任务注册表。

可通过 `(await harness.createWorkflowRuntime(session)).manager` 使用 start/pause/resume/abort/abortAgent/restartAgent/listActive/listRecent/getRunDetail/saveAs。Manager 保留原当前会话查找（忽略传入 sessionId）、未来 Agent 调用前的 pause gate、50 条 recent、快照 SHA 去重、saveAs 名称校验/覆盖文件/刷新 registry 行为。`restartAgent` 实际只取消并写 invalidated，并不立即重派；getRunDetail 只查内存，不从磁盘补历史。原 snapshot 写入不 await，极快结束可能没有 record.scriptPath；独立 close 仅增加本次快照/finalizer 的收尾 barrier，未改核心竞态。

StaticBuiltinWorkflowProvider 已恢复 suffix/meta/8KiB 文本扫描、inflight 合并和 sticky cache；可注入 `workflowBuiltinDir`，但捕获的 CLI 中没有 builtin/workflows 脚本资源，不伪造其内容。通用 notifier 的 XML/metadata/去重与原 drain 分支已恢复，独立宿主将 deferred drain 接回现有队列；不冒充完整 ACP/桌面前端。

原 `/workflows` 和 `/save-workflow <runId> <name> [--scope=project|user]` 执行器现已接通 CLI 的 `-p` 与交互模式；本地命令不进入模型请求，沿用原 Markdown 输出、参数/错误/用法文案和 history 协议（CommandManager 与 executor 各追加 caveat，共四条）。嵌入时可调用 `commandManager.executeLocalCommand({name, args, session})`，之后 `sessions.flushHistory(session)`；`harness.prompt` 仍是模型入口，不冒充产品 UI 的本地命令分派。保存使用完整 run ID；原 usage 虽写支持 8 位前缀，但实现不补全，按样本保留。默认 state 根替代产品 user 根，`--scope=user` 写入 `<state-dir>/workflows`。

CommandInterceptors 的 AgentSwitch priority1600、AgentManager.getCommands、command tag/agent/model/allowedTools、custom/MCP/builtin 渲染、skill 同名优先级/裸名字匹配/channel 解包/会话变量，以及 CommandMessageUtils 全套 XML 解析/构造已恢复。MCP prompt renderer 仍需显式 `mcpPromptRenderer` adapter，缺少时明确报错。保存 registry 的命令元数据为 `prompt:""`，而 `isCommand` 要求非空；默认 Agent 也只自动附加 custom/MCP commands，不自动附加 dynamic-workflow。因此恢复了原专用指令分支，但不会偷偷修通 `/saved-name`、新增 local executor 或扩大原 Workflow allowlist。需要运行时使用显式 Workflow tool 或 manager API。

WorkflowAcpBridge 与 WorkflowPrintModeHandler 的字段、原文日志、订阅/取消、错误边界已恢复。嵌入选项 `workflowEventWriter: {write(text)}` 显式安装逐行 JSON 事件输出；`getWorkflowAcpAgentManager()` 注入具有 `get(id).getConnection().sessionUpdate(...)` 的宿主。默认不额外写 stdout。ACP 沿用 `sessions.getCurrent().meta.acpConnectionId`（不是按事件 runId 寻找 owner），发送 `session_info_update` 和 `codebuddy.ai/workflow*` metadata；无当前会话即丢弃。agent finished 仍由原 emitter debounce，取消 pending 可能丢弃完成事件。此事件 writer 不是完整 CLI stream-json schema，也不是 SDK trace writer；产品 UI/ACP lifecycle/完整输出视图仍待补。

Agent 配置中的 `isolation: "worktree"` 已接入真实 Git checkout 与 async-local CWD：无变化清理，有变化保留，不复制主仓库未提交修改。TaskCreated/TaskCompleted hook payload 已恢复，完整 Hook 命令执行器仍待补。

Worktree 核心通过 `worktreeSessions.createSession(nameOrBoolean, { baseBranch })`、`worktreeTools` 与显式 SDK Agent 使用；原 19 个 Agent 均不暴露 EnterWorktree/LeaveWorktree，保持原 allowlist。沿用 `<git-root>/.codebuddy/worktrees/<name>`、`worktree-` 分支前缀、随机命名、GitHub/GitLab/CNB PR 解析和 remote default branch/fetch fallback。创建时复制 settings.local.json、配置 hooksPath、按设置软链接非 tracked 目录并处理 `.worktreeinclude`。初始化使用目标 bundle 非 Bun 分支的 fast-glob 协议；Bun.Glob 的平台差异未验证。WorktreeCreate/Remove 的原始 payload/路径校验/失败处理已恢复，可注入 `worktreeHooks`；通用 Hook 命令执行器、tmux UI、完整产品启动参数与交互退出选择尚未恢复。

WorktreeContext 的原始 system-reminder 已逐字核对；文件/搜索/Bash/引用/PromptContext/transcript 动态读取 CwdService。原 session manager 默认会 `process.chdir`；独立宿主改为本地 CWD 适配，不改变嵌入者进程目录。关闭宿主时按原 handleExit 删除 clean worktree，对 dirty/hook 的待确认选择默认 keep。低层 `WorktreeService.remove` 保留原 Git remove 失败后递归删除的 fallback，只能传入已确认的 Worktree 路径；模型工具调用仍需宿主批准。`force=true` 会丢弃更改。检测保留原 porcelain trim/slice 偏差，“unpushed commits”按进入时 HEAD 计算，不等于与远端比较；tracked-file 检测失败时保留原 fail-open，不能把初始化协议视作安全沙箱。

此宿主禁用模型/工具/根 trace 导出，不改 SDK 全局 tracing 设置；SDK 的流式完成与恢复接口以本地锁定 `0.5.2` 和[官方运行说明](https://developers.openai.com/api/docs/guides/agents/running-agents)交叉核对。

## 网页工具

WebFetch/WebSearch 已作为第38/39个handler接入，保持原默认Agent已有的声明，不修改配置或扩大allowlist。schema/参数错误、权限URL参数/classifier输入、Search freshness/域名过滤/结果原文/rawResponse、WebFetch规范化/15分钟静态缓存/HTML清理/元数据/AI回退提示均按样本恢复。Turndown锁定样本版本7.2.1（atx heading），不以简单去标签替代。

网页服务不是模型Chat Completions端点。嵌入可提供 `webTools: {endpoint, accessToken, account?, clientInfo?, ...}`；CLI使用 `--web-endpoint <product-service-url>` 和单独的 `WORKBUDDY_HARNESS_WEB_ACCESS_TOKEN`。两者为显式standalone适配，不是伪造原产品配置项。没有配置时不使用捕获的腾讯端点，也不复用模型API key：WebSearch报原Authentication错误；WebFetch可回退本地抓取。仅声明端点/token可传至detached teammate，内存fetch/配置函数不能跨进程序列化。没有验证真实产品服务端认证或搜索质量，不用通用搜索冒充原API。

WebFetch会并发启动API和本地抓取，优先等待API（不是谁快用谁），API成功取消本地，API失败才取本地结果。API20秒、本地30秒、100000字符截断；API内容超过15000字符才进一步分析，本地结果始终分析。`CODEBUDDY_DISABLE_WEB_FETCH_REMOTE_API` 仅精确 `"true"`，或productFeatures.WebFetchRemoteApi为false，才禁用API。分析调用原contentAnalyzer/模板，沿用单次流式文本消费；失败或空输出使用原回退Prompt/summary。默认审批仍适用于两个工具。

网络判定前清理user settings cache；独立宿主读取sandbox网络配置，并按原优先级解析 `ACC_PRODUCT_CONFIG_V3`→V2→`ACC_PRODUCT_CONFIG_PATH` 的clientSecurity，应用托管networkAccess列表。首个非null来源即停止，即使它是unmanaged；不合并后续来源。完整Security Center转换函数已恢复，但这里只接网络projection，不冒充完整BashSandboxManager/命令安全/文件权限/lifecycle。可显式注入 `webTools.networkConfig` 使用实际宿主服务。

保留原边界：网络检查不做DNS解析，IPv6括号/映射地址有缺口；无network配置或networkPolicyEnabled=false时提前放行。重定向到异host是在请求后才拒绝，不能当SSRF隔离。缓存跨会话按规范化URL共享，忽略prompt/身份；每次仍先检查网络策略。HTTP自动改HTTPS及GitHub包含字符串替换保留原启发式；本地非2xx但有body仍处理。WebSearch不传父会话取消，计时器只覆盖fetch到响应头；WebFetch API父abort listener不移除，本地body读取也不受已清除的头部timeout约束。这些原行为不是安全保证。遥测字段映射/截断已恢复，默认无外部遥测导出；主题色使用纯文本adapter。仍需受信任端点、凭证、宿主审批和外部网络边界。

## 微信/企业微信channel

第46/47个handler恢复 `WechatReplyTool`、`WecomReplyTool`，以及完整 `WechatChannelBridge`、`WecomBotChannelBridge`、`ChannelManagerImpl`、`ChannelPermissionAdapterImpl` 的原方法。schema、描述、错误/返回文案、两份channel instructions常量来自固定SHA样本；除TypeScript/显式依赖注入外不合并行为。SDK接线按[OpenAI Docs](https://developers.openai.com/api/docs/guides/tools)核对，仍保留0.5.2。47个产品工具名称均已有handler，但不是全部宿主分支/完整产品CLI已恢复。

可继续注入已有客户端：`createHarness({ ..., channels: { wechat: {getAll: () => trustedWechatClients, get: id => ...}, wecom: {getAll: () => trustedWecomClients, get: id => ...} } })`。接口为status/clientType/instanceId、onMessage/onStatusChange observable，以及原sendReply/sendImageReply/sendFileReply或sendAsyncReply/uploadMedia/sendMediaMessage。getAll/get本身不是客户端传输实现；另有下节恢复出的原客户端/factory/registry可选用。默认没有客户端、不读取已安装应用账号、不连接服务、不新增CLI登录入口；连接检查仅看任一status===connected，不是认证验证。

原CLI只声明这两个回复工具，原非CLI默认不暴露。WeChat连接只刷新已构造Agent；WeCom会先把WeComReply推入这些Agent的内存tools，再刷新。原JSON/115 Prompt不改，但WeCom连接后的内存allowlist确实会变化；未构造Agent不假装已注册。两个handler的needsApproval=false保持原值，独立宿主执行守卫仍要求审批来源，不以此元数据绕过守卫。显式channel host可通过原适配器向注入客户端发送人类确认；普通工具在guard内等待，SDK暂停工具通过InterruptionService竞争本地/渠道结果。guard的allow_always目前只放行本次调用，不等同完整产品ToolAlwaysApprovalService的持久规则。

WeChat先检查chat_id和text/file_path，短context_token（非空且<10）拒绝；ID不自动trim、不强制格式，只有无内容分支才做空格/中文/长度>128的误拼接提示。jpg/jpeg/png/gif/webp/bmp把图片+caption交给client的一次sendImageReply，但恢复出的原client实际会分别发送caption和image两条API消息；其他后缀先text再file，部分成功不回滚。WeCom按file_path→file_url→image_url→text选一项，媒体分支忽略text。只对local stat.size>20MiB拒绝；远端/数据URL不做此大小检查。类型按文件名后缀，data:image/png;base64,...会按原怪异basename判为file而非image；30s fetch signal不是整个上传的截止时间，无DNS/URL/内容大小隔离。file_url也沿原逻辑接受./或/本地路径，不提供可信文件沙箱。

WeChat路由优先chat映射→最后sourceClient→第一个connected，parseChatId仅用于userId解析，找不到实例时退回legacy字符串；实例ID含下划线仍有歧义。WeCom缺route优先沿用上一次platformData，缺chatid才按wecom_字符串截取，目标可能沿用旧chat；实例断开也可回退首个connected。所有这些原边界均保留，不视为安全的账号/收件人绑定。只注入可信客户端和消息源，发送文件可能把本地内容交给客户端。

入站消息保留属性XML转义、原文body、附件meta、会话channel标记、busy入队/idle唤醒。Ask/permission/suggestion先于普通消息消费；permission使用全局FIFO最旧项、不绑定回复chat，未知答复deny后1000ms转发原文且不带附件meta。WeCom的@mention仅保留最后空格后的词，parseInt允许2abc选第二项；多问逐题、建议替换/跨session拒绝、plan退出q、中文审批文案与本地命令/TUI-only清单保留。connected事件重复计数、初始status不主动补计数、订阅/最后上下文等状态保留原逻辑。channelsEnabled/allowed-list只控制注册，原bridge不因此过滤全部入站消息；完整ChannelSecurityManager/MCP通知来源校验仍未接，不能作为权限隔离。

ChannelManager原capability/注册/指令/广播/FIFO队列和设置解析、审批5位字母ID/碰撞覆盖/无超时/取消不resolve均恢复。独立host的abort race、发送关闭守卫、订阅/timer清理和入站SDK流关闭barrier明确为适配：不改变原run在发布流后返回的边界，不断开调用方客户端。旧lazy AgentManager已由完整原类替换；启动返回前eager构建19个CLI Agent，WeCom连接顺序刷新实际运行时配置，测试等待真实刷新屏障，不再假设固定microtask数量。

29项专项和1,810次原包差分涵盖上述路径。真实SDK验证文本/文件、审批允许/拒绝/abort、Ask中断、入站唤醒/JSONL、先子Agent启动与关闭活动流；客户端发送/上传/网络均为受控假实现，文件仅用本次临时fixture。没有给真实联系人发消息、调用微信/企业微信服务或读取账号凭证，也不证明真实服务认证/加密传输/全竞态已经恢复。

## 恢复出的渠道客户端

新增完整 `WechatClient`、`WechatApi`、`WecomBotClient`、两套原credential module/factory、`LongConnectionClientRegistryImpl`、`LivenessWatchdog/PollWatchdog`，Wechat CDN与WeCom媒体helper。常量/原模块级凭证与media函数、枚举和DI symbol一并保留；显式工厂供独立harness隔离依赖，不重写原方法体。

嵌入在现有model配置外传 `channels: {native: {wechatInstances: [{instanceId: "bot", credentials: suppliedWechatCredentials}], wecomInstances: [{instanceId: "bot", credentials: suppliedWecomCredentials}]}}`，然后显式 `await harness.channelClients.wechatFactory.get("bot").connect()` 或对应wecomFactory。提供的Wechat凭证是内存provider overlay，WeCom按原create参数传入；不自动持久化输入凭证，不自动connect。批量加载自身stateDir中的存储需 `loadSavedInstances:true`；per-instance原init/connect在缺凭证时仍可能读/迁移该stateDir，再发出QR或等待配置。`channels.native.env`默认{}，不扫描真实进程账号环境；可显式提供env。`channels.native.io`覆盖同步fs/网络/crypto/clock/socket-loader等边界，既有异步reply工具文件I/O仍由`channels.io`控制。原模块级直接API保留原home/env默认值，调用方须自行限定路径；独立harness只映射自己的stateDir，不读已安装WorkBuddy账号目录。

凭证为 `channels/{wechat,wecom}/instances.json` 明文JSON，保留legacy credentials*.json迁移、共享.tmp文件/尝试chmod0600/rename、Wechat _pending清理与QR后ID更新。没有进程间存储锁、路径/实例ID清洗或凭证加密；旧文件不自动删除。WeCom保留实例后缀env→default env→保存配置的resolve规则，而factory加载已存实例时可直接使用保存凭证；duplicate create仍报错。Wechat QR协议bot_type=3、35s status poll、8min总门槛/1s间隔、最多3次refresh、scaned原拼写、confirmed校验和pending不落盘均恢复；WeCom缺凭证时原180s/3s等待及中文配置说明保留。没有真实扫码或账号登录验证。

Wechat API保留 /ilink/bot/*、UIN随机4字节转十进制再base64、AuthorizationType/可选Bearer/UTF8 Content-Length/base_info。getupdates45s、发送/上传URL15s、配置/typing10s；原post在headers后清timer/外部abort listener，body仍可能挂起。poll的-14断开、游标/消息过滤、500去重、owner lock fail-open、指数退避+jitter以及清backoff timer不resolve等待者等原边界保留。CDN是AES-128-ECB/MD5/PKCS padding，支持raw16或base64(hex32) key、上传全URL优先、x-encrypted-param回传；下载full_url无域名/协议/大小/统一timeout守卫，不冒充安全下载器。

WeCom保留Bun原生WebSocket/Node ws选择、subscribe、stream/markdown/media/welcome、响应req_id匹配、30s pending与连接timer、30s heartbeat/90s watchdog、重连/去重1000与原消息/STT/mixed文案。上传512KiB/chunk、最多100块（50MiB）、MD5、每chunk最多3次/500与1000ms等待，零字节也init/finish；非upload发送不等服务端ack，不承诺送达。媒体入站仅HTTPS可信suffix且redirect:error，已识别JPEG/PNG/GIF/BMP/WebP可绕过解密；其余AES-256-CBC，IV取key前16字节、padding范围1–32。无body大小限制，保留原不支持的媒体分支和错误日志。

独立native-client ownership另管自建客户端、请求、socket构造与timers：关闭可中止headers后挂起的body，拒绝迟到WS构造/新请求，释放pending upload；不改原类timer/重连缺陷，也不主动disconnect外部注入客户端。原QR/配置/backoff没有完整可取消协议；仅检查headers而不读body的响应，其ownership ledger可保留到close。关闭不是撤回已发送消息，也不是原应用所有生命周期/网络代理/RemoteControl自动连接middleware/配置UI已恢复。

依赖按样本保留qrcode1.5.4及独立alias `ws-native = ws8.18.3`，SDK原ws8.22.0未替换。该旧ws有[高危内存耗尽告警](https://github.com/websockets/ws/security/advisories/GHSA-96hv-2xvq-fx4p)及[内存泄露告警](https://github.com/websockets/ws/security/advisories/GHSA-58qx-3vcg-4xpx)；本轮npm audit共11项（含既有依赖），没有自动audit fix改动原版本。此构建用于受控还原验证，不是生产安全背书；可显式注入其他socket loader，但那是兼容/加固适配而非样本依赖还原。

新增29项专项、1,016次原模块/类差分：真实临时凭证文件、本地HTTP QR/长轮询→真实SDK→原API回复、本地WebSocket订阅/回调→SDK→分块上传/媒体消息，以及挂起body/关闭、Node/Bun选择、加解密/帧/存储/错误。Bun分支以注入ctor验证，未验证真实Bun/Windows宿主；所有token/key/account/payload自有fixture，未调用真实微信/企业微信/模型服务或读取安装账号。有限差分不等于1,016个独立场景或真实服务/全部竞态已穷举。

## 原ImageUtils与Read图片路径

已恢复原`ImageUtils`完整类（23个静态方法、三个常量），默认接入输入ImageCompression interceptor和Read图片分支。依赖按原安装包锁定`jimp@0.22.12`，SDK不变。2000档：maxBase64Size=5,242,880、maxRawBytes=3,932,160、JPEG qualities=[80,60,40,20]；1080档：512,000／384,000／[85,70,50,30]。原env `CODEBUDDY_CODE_IMAGE_COMPRESSION_MAX_DIMENSION`保留parseInt、负值/无效回退、非支持档位warning；0令profile/Read跳过压缩，但直接compressImage/interceptor的0维调用仍按原处理，不添加全局提前跳过。

按原算法先等比缩放（round尺寸、检测出的真实MIME），超大小上限再逐档重压JPEG／转JPEG，仍过大返回空串。解码失败对小图通常保留原data URI，对resolution-limit错误或超profile大小则省略；regex、base64字节估算、quality顺序、warn/throwOnFailure和所有原文保留。不是“解码失败必定拒绝”。Read识别需同时通过模型family格式名单与1024字节二进制探测，不再仅看扩展名。模型不支持图片返回原1010；压缩省略为1011，图片helper的ENOENT/EACCES/path为1001/1002/1003。文本Read/其他文件工具仍有独立待复核分支，不据此宣称整个Read类逐方法100%。

Read先存原图blob并track，再决定压缩；同路径同hash返回原`[Image unchanged]`，不同路径同hash返回`[Image reference]`。第一次压缩省略后tracking也可能令第二次返回unchanged，沿原保留。ModelUtils.getCurrentModel子集使用default Agent及会话request/options，以name/id查找、不识别aliases；未知包装自定义model。格式工具接受绝对路径或裸扩展名，但某些方法不把`own.bmp`当`bmp`，保留此原边界。`HarnessSession.conditionalRules`包含原pendingTriggers/processedRules集合，Read登记触发路径；原条件规则发现/匹配/注入现已接入，完整产品UI/watchers与相关性选择仍待补。

`imageCodec`可显式注入codec/env/logger；默认使用原Jimp规则。既有`imageHistory.imageUtils`窄接口仍只覆盖输入interceptor，Read使用完整nativeImageUtils。直接构造CoreFileTools没有model/blob依赖时是明确嵌入adapter：默认format family，blob失败走原warn/fallback，而非完整产品DI。

本批803次固定SHA差分不仅运行原ImageUtils类，还装载原84024及其内嵌依赖，共89个模块（不启动应用entry、禁用文件/网络/字体加载），以真实PNG/JPEG/BMP的编码字节对比独立安装的原版本Jimp；另验证高熵图降质、失败/quality调用序、Read与ModelUtils子集。11项专项包含真实SDK/loopback HTTP连续Read的压缩图片→unchanged→duplicate，以及实际blob文件。VM仅运行可信固化代码，不是对恶意代码/图片的安全沙箱；未穷举所有格式、Bun/浏览器、字体/URL路径和全部故障。

保留原存储缺口：Read的字符串型providerData.toolResult.content可能仍含data URI，即使output已换blob；不能保证整个JSONL没有图片字节。压缩也无CPU/内存隔离或完整取消协议。当前npm audit为15个受影响依赖项（9 moderate/6 high，非15个独立漏洞）；新增Jimp链带入file-type等旧依赖风险，仍保留原版本并记录，未自动audit fix/跨大版本升级，不宜直接生产使用。

## Blob存储、图片历史与工具结果外置

`BlobStoreImpl`、`ImageBlobServiceImpl`和`ToolResultBlobServiceImpl`已从固定SHA原包恢复并默认接入独立宿主，不再使用测试blob依赖作为默认实现。图片写入`<stateDir>/blobs/<SHA256前两位>/<SHA256>.<原MIME映射扩展名>`，同内容同MIME复用；工具输出位于`<stateDir>/sessions/<session>/tool-results/<callId>.txt`，agent-*子会话走parent/subagents分支。stateDir/sessions替代原PathUtils产品项目目录，是明确的宿主路径适配，不自动扫描安装目录。`blobs`可显式注入原生I/O边界，`imageHistory.blobService`仍支持覆盖；默认不在close时删除外置文件，保留resume能力。

图片历史按原算法计算最近用户消息边界（包括skipRun/reminder等user），按blob_id最后出现位置选择候选，再对每个source保留最近三个版本；选择单位是整条item，混合blob可能因此一起回填。未保留、缺失或零字节blob变成原`[Image from ... - stored at: ...]`占位文本。支持user blob/input_image嵌套、tool output字符串/结构化toolResult、image_url中的blob对象/序列化引用；不擅自扩展成任意嵌套对象递归遍历。原source变更的new/unchanged/duplicate、轻量类型检查和JSON正则边界都保留。

SessionStore的四个原方法已替换先前手写近似，包括逐元素失败继续、字符串fallback替换和外置失败warn。默认模型transport已注入真实ImageBlobService：JSONL保存引用，HTTP请求回填实际data URI。原ComputerUse loopback SDK测试加强为同时检查请求图片、JSONL无原data URI，以及blob文件字节相同。自定义ModelProvider仍需自行实现请求归一化，不保证原模型transport处理器会自动作用于第三方provider。

工具结果默认门槛50×1024，`CODEBUDDY_TOOL_RESULT_THRESHOLD_KB`沿原parseInt；比较和preview实际使用JS UTF-16字符串长度，虽文案写KB/bytes，却不是UTF-8字节计量。0/负数/NaN、2048 preview、spilled-file包裹和清理方法照原。只替换output，不保证providerData.toolResult中的完整UI内容同时缩短；不宣称整个JSONL必然缩小。

这是可信本地历史/工具运行时，不是安全文件服务：原blob/call/session ID不校验路径，不验证现存blob哈希、不加跨进程锁或原子写，ref中的blob_path主要用于展示；不要对不可信历史或外部客户端直接暴露底层方法/cleanupSession。所有清理验证仅针对自有临时目录。真实压缩codec与Read图片去重/压缩现已恢复；Bash原生stream spill及完整媒体工具接线仍未完成。

本批13项专项、535次固定SHA差分覆盖真实文件去重/重载、版本/轮次/混合item、MIME/占位、异常、阈值/预览/子会话路径、四个SessionStore原方法和SDK跨harness恢复。所有模型测试使用本地fixture或loopback，不调用真实服务。

## 输入与历史处理管线

`AgentInputItemPipeline`按原provider的priority>0筛选及降序执行。独立宿主接入Default(10)、ParentIdLinkage(9)、FunctionCall(8)、FunctionCallResult(7)、Usage(6)、ExitPlanMode(4)；未将未恢复的Telemetry(5)替换成假实现。可直接导入原公开名`ExitPlanModeInputItemProcessor`和`AgentInputItemProcessor` DI symbol。SessionManager配置此pipeline时不再运行被替代的手工补元数据分支；未配置pipeline的旧嵌入入口仍保留兼容行为，不冒充完整原SessionManager。

恢复UUID/sessionId/时间、result-only Agent归属、custom/sub-agent/color、成功压缩标记、父链循环/自环/悬空父节点修复和lastUserMessageId。原SessionUtils以storeId与id不同判定子Agent，不以meta.parentSessionId判定。只对可重放压缩消息/系统队友消息修复悬空或循环父节点；普通消息不被额外修正。压缩助手标记不等同于用户压缩边界。时间戳五个原helper保留有限数字/零/非对象行为。

37套原工具argumentRenderer已接回ToolManager（每个manager独立对象，显式handler可覆盖），含Read/Write路径、WebFetch首URL、Workflow/Cron/ToolSearch自定义格式和PowerShell token脱敏。FunctionCall只在已注册工具存在时解析；原JSON SyntaxError置discard，缺少单一展示字段可能抛TypeError并被process吞掉，不猜测补值。DeferExecuteTool→Workflow仅在缺少非空inline script且有name/scriptPath时预载源码，失败只debug。ExitPlanMode按原逻辑在调用/结果阶段读取计划并快照，保留两条Warning原文。

ImageFilter(priority850)、ImageRehydration(1050)、ImageCompression(1075)现均默认接入原实现。过滤仅对精确model id且supportsImages===false，保留RunState.history/原JSON范围；排序仍为先压缩、后回填、再Model配置/过滤。真实blob服务及原Jimp codec现已恢复，详见前两节；完整媒体/产品UI接线仍待补。settings读取/track发生在rehydration的try外，正文处理失败才warn；无blob仍reset tracking。独立宿主PathUtils目录注入不是原全局process.chdir。

本批18项专项包含真实SDK的Read历史落盘、Workflow源码预载、图片过滤，以及显式测试blob/codec依赖的先压缩后回填闭环。工具执行前等待本次history锁是独立宿主适配：避免异步处理器尚未发布调用时TaskCreate提前计算ordinal；原processor/TaskCreate算法未为通过测试而改写。1,261次固定SHA原类/方法/renderer/排序器差分验证有限行为，不是全状态空间证明。没有请求真实模型服务或读取安装账号；aborted-draft、完整response gate/idle timer、Telemetry与完整媒体/产品UI仍是下一阶段缺口。

## ComputerUse与多模态结果

第45个handler恢复 `ComputerUseTool`、原Zod3 schema、执行器及说明/结果文案。它是普通function tool，并非SDK内置computer tool；底层使用 `/usr/sbin/screencapture`、`/usr/bin/sips`、`/usr/bin/osascript`、可选cliclick和Quartz Python。仅Darwin且 `CODEBUDDY_COMPUTER_USE_ENABLED` 精确为 `true`/`1` 时通过可用性检查。原19个Agent都未声明它，本工程不改原allowlist，也不新增默认CLI桌面控制入口。低层execute不检查gate或权限，不可用作审批守卫；需要可信的显式宿主接线。SDK继续保留0.5.2依赖。

截图为JPEG，最长边1280、quality75；截图前后探测与Finder逻辑屏幕尺寸决定共享坐标比例。schema文字称logical pixels，但执行时仍乘此比例，鼠标返回未缩放坐标、cursor_position返回原查询值，均保留原行为。cliclick检测（含失败）永久缓存；检测未完成时并发调用可读到null。双击AppleScript fallback是连续两次click；middle/triple/move/drag需要cliclick。原key表/修饰键/AppleScript转义、CRLF输入、hold 0–30秒、wait 0–60秒、Quartz滚动轴与权限错误文案均恢复。没有额外排队、abort取消或截图清理；同毫秒文件可覆盖，缩放状态跨调用共享。子命令通常timeout5s，hold增加3s；不是整个调用的统一截止时间。

嵌入可用 `createHarness({ ..., computerUse: { platform, env, execFile, mkdir, readFile, now, ... } })` 注入边界。原路径为 `CODEBUDDY_CONFIG_DIR`（非空原值不trim）或 `~/.codebuddy` 下的computer-use；独立宿主明确映射为自身 `<stateDir>/computer-use`，不向已安装应用目录写入。构造独立executor隔离各harness，默认导出单例保留模块共享语义；独立工厂是依赖注入适配，不冒充原全局DI生命周期。macOS还需要宿主的Accessibility/Screen Recording授权以及可选cliclick/PyObjC；本批没有安装依赖、修改授权或操作真实桌面。

连带恢复 `FunctionCallResultAgentInputItemProcessor`（priority7）、`ToolResult.is/from`、模型请求处理器与magic-bytes MIME检测：先把工具结果内容解包一次并将完整原结果保存在providerData.toolResult，再将字符串中的图片数组转为多模态内容、删除HTTP请求内私有toolResult字段。MCP structured内容反向转换、空text过滤、无效tool-call/result配对移除、空消息/末尾assistant清理和blob-ref分支优先级沿原实现；缺少name/null的原异常边界未被猜测式修复。SessionManager复制记录与SDK raw共享结果元数据，避免下一次getModel重复解包。ModelProvider的空桩已替换为最新newItems归一化；六个原input processor与ImageFilter现已接入，Rehydration默认接入，Compression需codec；完整媒体全接线和UI/telemetry仍不完整。注入自定义ModelProvider时需自行完成其请求归一化。

新增18项专项和1,028次固定SHA原类/包内schema转换器差分，覆盖上述协议/参数/脚本/缓存/错误/结果与请求处理。真实SDK和本地ChatCompletions协议服务验证下一次HTTP请求含image_url数组及历史持久化；所有桌面命令、目录/截图读取与计时器均为注入假实现，仅使用fixture字节，不代表真实系统授权、图像编码/视觉质量、远端模型接受能力或所有并发/平台状态空间已验证。

## 图片与视频工具

第42–44个handler恢复 `ImageGenTool`、`ImageEditTool`、`VideoGenTool`、`ImageServiceImpl`、`VideoServiceImpl` 和 `ImageToolHookInputProcessor`。方法体从固定SHA样本机械移植，仅加TypeScript注解和显式依赖；Zod3 schema与包内实际转换器已对照，内嵌说明/原115个Prompt不改。原CLI/general-purpose只声明ImageGen和VideoGen，ImageEdit仍为未暴露legacy；feature/env/model tag gates保留原规则，不扩大Agent allowlist。env只把精确`true`/`1`视为开启；VideoGen只查feature，不要求预置模型。低层execute本身不是gate/权限守卫，宿主审批仍需保留。

这些工具使用产品 `/v2/images/generations`、`/v2/images/edits`、`/v2/videos/generations`、`/v2/videos/tasks` 协议，不以OpenAI通用图片API替代。嵌入提供 `mediaTools: {endpoint, accessToken, ...}`；CLI配置 `--media-endpoint <product-service-url>` 和 `WORKBUDDY_HARNESS_MEDIA_ACCESS_TOKEN`。不复用聊天模型key、web token或捕获的产品端点，未登录报原Authentication错误。端点/token的纯数据配置传给detached child，callbacks/restOperations/configuration函数不跨进程序列化。默认REST实现是显式fetch宿主适配，支持原服务使用的JSON/arraybuffer/错误response形状；不是完整产品RestOperations/Axios拦截器、代理、认证刷新、追踪或真实服务端认证还原，可注入 `mediaTools.restOperations`。SDK接线按[官方工具说明](https://developers.openai.com/api/docs/guides/tools)核对，实际接口仍锁定0.5.2。

模型选择顺序为session options→对应CODEBUDDY环境变量→merged settings→第一个带tag模型→原fallback；保留textToImageModel/imageToImageModel/textToVideoModel/imageToVideoModel四个key和原ID。Hunyuan/Gemini/其他模型请求字段分流不合并：默认size1024x1024，Hunyuan的revise以`{value:false}`也发送；Gemini忽略quality/style/background等。schema无n字段，工具也不转发n，即使service底层支持；footnote“16字符”和quality/style/size的文字说明不等于运行时约束。ImageGen支持1–3输入图但要求配置内存在image-to-image模型；ImageEdit是单图schema。VideoGen允许last_image没有image、seconds=0/负值沿原传递，service非法resolution回退720P，watermark固定true。

输出目录先初始化再校验prompt/image，mkdir错误在工具catch外，空prompt也可能创建目录。图片输入按dataURL→小写http(s)→raw base64启发式→文件路径分流；raw启发式拒含`/`的字符串（包括部分合法base64），dataURL不验证实际编码，文件按扩展名判MIME而非内容。相对输入文件按embedding进程CWD读取，不擅自改为异步worktree CWD。HTTP输入、结果下载不经过WebFetch网络策略/缓存，不做DNS/IP隔离或内容大小限制；文件输入会上传至配置的产品端点，只使用可信端点与权限来源。图片强制.png/视频强制.mp4后缀，不转码或校验内容。

图片服务的outputDir在ImageGen/ImageEdit/跨会话间共享，竞态可写入后一次设置的目录；文件名是prompt前30个UTF-16字符清理+秒级时间戳，重复可覆盖同名文件。图片首张无序号、后续_2；多视频则从_1开始。保留非原子逐文件写入、部分成功和无碰撞保护，不把这些原行为当数据安全保证。视频每5秒查询，时间差严格大于600000ms才超时（单个挂起请求可突破此门槛）；download timeout120s。sleep完成不移除abort listener，取消/轮询取消文案不同。共享服务无额外任务取消API或进度UI，不增加隐式重试。

PostToolUse输入处理器priority100已恢复，但完整Hook管线仍未接：ImageGen即使使用image分支也按原注入text-to-image的image_model；VideoGen不处理。ANSI文件链接用纯路径adapter；完整媒体接线、产品图片/视频视图、RestOperations全宿主分支与mandatory审批/classifier仍是缺口。370次差分和19项专项包括真实SDK的默认deferred ImageGen/VideoGen、显式legacy ImageEdit、CLI离线录制重放后调用本地协议服务与实际文件写入；fixture只返回受控测试字节，不是实际生成质量、编码有效性或真实产品认证验证。

## LSP语言服务

第41个handler恢复 `LSPTool`、`LSPClientImpl`、`LSPManagerImpl` 及路径解析。保持样本 `vscode-jsonrpc 8.2.1`、`vscode-uri 3.1.0`，不自行重写JSON-RPC framing。原19个Agent均未声明LSP，因此默认模型不会获得它；handler存在不等于默认工具可见。独立宿主仍需工具审批，配置也不是安全沙箱：受信任语言服务器会作为本地进程执行并继承环境，Windows命令解析保留原where.exe插值，不能接受不可信配置。

嵌入提供 `createHarness({ ..., lsp: { servers: { typescript: {command: "/absolute/path/to/server", args: ["--stdio"], extensionToLanguage: {".ts": "typescript"}, settings: {}, initializationOptions: {}, startupTimeout: 30000, shutdownTimeout: 5000, restartOnCrash: true, maxRestarts: 3, eager: false} } } })`，或注入 `lsp.pluginManager.getActivePlugins()` 返回原 `{plugin:{name,marketplaceName},components:{lspServers}}` 结构。workspaceFolders/配置workspaceFolder/CWD的优先级保留；插件注册可reload/串行化。未自动扫描或加载已安装WorkBuddy插件、下载语言服务或增加CLI的配置开关。默认CLI仍保持原allowlist；测试仅通过显式SDK注册使用LSP，嵌入也可显式调用 `harness.lspTool.execute(input)`（该低层调用和其他低层handler一样不替代宿主权限守卫）。

原schema需要operation/filePath/line/character，包括documentSymbol/workspaceSymbol；坐标描述为1-based，handler执行时减1，Zod3 coerce仅用于原schema定义，SDK注册仍使用转换后的JSON schema/非strict，不补本地schema强校验。workspaceSymbol固定发送空query；结果上限50只应用references/document/workspace symbols与incoming/outgoing calls，definition/implementation/prepareCallHierarchy不截断。只格式化顶层symbols、只查首个prepared hierarchy item；hover只取数组第一项，MarkupContent被转成plaintext code block而非直接Markdown渲染。client另有typeDefinition/completion方法，但不扩充工具的九种operation。

保留源边界：extensionToLanguage只使用小写扩展名key，实际languageId取外层server key；覆盖server不清旧映射或关闭旧client。maxRestarts=0实际回退3；成功启动重置计数，运行后崩溃不立即改manager status/自动重启，下次懒获取才重启。固定500ms进程门槛+1000ms连接等待，startupTimeout只约束连接等待，不覆盖initialize及后续request；父abort不取消JSON-RPC。didOpen按URI只发送一次/version1，后续磁盘修改无didChange/didSave；LocationLink数组被原先行filter丢弃，尽管握手宣告linkSupport。file:前缀只剥离不解码百分号，@路径先查字面文件再回退，Windows/POSIX路径分支保留。

原shutdown race不清理败选timeout；cleanup只对有PID进程发送SIGTERM/Windows taskkill，不等待确认退出或强杀升级，失败spawn对象无PID时仍保留。独立host不安装原init匿名exit监听，而是显式等待配置加载；close先使本次注册identity gate失效，释放owned clients（含已被覆盖者）的挂起请求，再等待SDK/manager drain，防止关闭中重启。这是单独标注的宿主资源适配，不改原Manager/Client类的控制流；非完整产品plugin lifecycle、进程树隔离或所有平台竞态恢复。711次原包差分与16项专项覆盖含真实stdio/SDK、崩溃懒重启、握手/回调、原schema/转换器、启动超时和挂起初始化关闭；未接真实第三方语言服务评测。

## 客户端委托工具

第40个handler是 `DelegateTool`，不是子Agent委派：它把注册工具转发给外部客户端。恢复 `DelegateToolManagerImpl`、ACP `handleDelegateToolsChanged`、动态列表/完整inputSchema描述、变更回调和Agent刷新。`AgentManager.getAll()` 只返回当前Map中的实例，不自行构造Agent；当前原生启动流程已提前构建全部19个CLI Agent。原配置只有CLI Agent声明此工具；注册表非空才暴露，不以connection健康作为gate，也不扩大其他Agent allowlist。

嵌入可注入 `createHarness({ ..., delegateConnection, delegateTools: [{id, definition, providerId}] })`；连接实现 `extMethod(method, params)`。动态注册使用 `harness.delegateToolsChangedHandler.handleDelegateToolsChanged({changeType: "added", providerId, tools: [...]})`，移除使用 `changeType: "removed"`。`definition` 包括name/description/inputSchema及可选provider/category/requiresApproval；默认宿主仍需显式批准DelegateTool，`requiresApproval:false` 不绕过守卫。这里是显式依赖注入，不会自动连接已安装IDE，也未恢复完整ACP transport/认证/会话生命周期或CLI客户端连接参数；detached child不序列化内存connection。

原协议使用单一全局connection（后设置覆盖前设置）、`_codebuddy.ai/delegateTool`、空 `sessionId`、`delegate-${toolId}-${Date.now()}` 和 `timeout || 30000`。timeout仅透传，不启动harness超时计时器；父取消/clearConnection不取消已发出的请求。provider仅用于清理注册，不参与连接路由；重名覆盖不清旧provider索引，清旧provider可能移除新工具。`clearTools` 不调用变更回调，可能保留旧描述；register/unregister才失效缓存并刷新已构造Agent。当前仅恢复Delegate描述缓存，非全部ToolSearch fingerprint/插件热更新。

保留原Zod3 schema、静态说明/115模板、嵌套 `ToolResult.from` 包装、falsy output回退和错误转换；客户端inputSchema只作为描述，不在handler本地验证。schema使用Zod3.25.67别名与转换器3.25.2兼容SDK的Zod4环境，已直接比较包内原转换器的实际JSON输出一致，不声称转换器全部输入行为或版本一致。注册定义保留引用、available-tools忽略session、单毫秒callId可能重复、异常后的部分注册均为原边界，不能当作多租户隔离或安全执行器。SDK接线遵循[官方工具说明](https://developers.openai.com/api/docs/guides/tools)，实际运行接口以锁定0.5.2为准。

## 模型录制与离线重放

已按原 RecordingStoreImpl/RecordingModel/ReplayModel/RecordReplayModelProvider 替换早期兼容骨架。不是 SDK 内部录制：它在 ModelProvider 边界同步写入 `<CODEBUDDY_RECORD_DIR>/recording.jsonl`，重放时不解析或请求原网络模型，仍运行真实 SDK agent/tool loop。精确接口以锁定的 SDK 0.5.2 为准，并与[官方模型/Provider 说明](https://developers.openai.com/api/docs/guides/agents/models)交叉核对。

```bash
# 已按前文设置 API key；录制目录应使用新的、专用于本次运行的绝对路径
CODEBUDDY_RECORD_DIR=/absolute/new-recording npm start -- --base-url https://your-compatible-endpoint/v1 --model your-model -p "your prompt"
# 不需要 API key/base URL；使用相同 model 名。工具仍需显式批准
CODEBUDDY_REPLAY_DIR=/absolute/new-recording npm start -- --model your-model -p "replay input"
```

两种目录环境变量不能同时为真。`CODEBUDDY_REPLAY_SPEED` 通过 parseFloat 解释为时间倍率：正数时按事件 offset 差值除以倍率等待，默认0不等待；只等待大于1ms的间隔。`CODEBUDDY_REPLAY_STRICT` 任何非空字符串（含 `"0"`/`"false"`）都启用，但只校验记录的模型名，不比较 request、prompt 或工具结果。早期 `strict request diff` 与固定每事件 sleep 的实现不符合样本，已删除。

协议是 metadata/version1、request、response 或 stream_response，后者含 `{event, offsetMs}`。录制只剔除 request.signal；失败请求、流异常或调用者提前结束时只留下 request，不写部分响应。Store 按文件物理顺序建立模型队列，从 request.turnId 推断缺失 modelName；未知模型从剩余响应最多的队列回退（平局取先插入者），已存在但耗尽的模型不会回退。计数是总响应数，不随消费递减。同模型并发完成逆序也按响应落盘顺序重放，不按请求turnId匹配；不把它包装成确定性测试保证。

重要：首次懒初始化会覆盖现有 `recording.jsonl`，不做脱敏、加密、追加旧录制或锁/原子替换，文件权限沿用Node默认/umask。原始 prompts、providerData/headers 等可能含敏感信息，只使用受信任且可丢弃的录制目录。metadata保存五个指定的非空环境开关；读取则将任意 replayEnv 键回填至当前未设置/空值项，不额外校验version/schema。坏JSON/缺文件首次抛错后 initialized 已为true，再调用不会自动重读。只重放可信文件；录制的工具调用会重新执行，仍通过宿主权限守卫，不是 dry run，也不会直接回放旧工具结果。

嵌入可提供 `recordReplayEnv`，用于隔离本模块模式/速度/strict/metadata环境；省略时按原使用 process.env。这个 adapter 不替换其他服务的全局环境读取。`harness.recordingStore` 与 `recordReplayProvider` 对外开放，close 在本次SDK任务收尾后关闭写入；相对录制路径沿用 embedding进程CWD，推荐绝对路径。此模块不恢复所有产品启动/退出、磁盘故障/全并发副作用，也不改变默认工具allowlist。

## 验证

```bash
npm install
npm run verify:config
npm run check
npm test
npm run build
npm run smoke:runtime
```

配置校验使用目标样本的 SHA-256，并验证 19 Agent、48 工具、44 模型、115 Prompt、284,899 个 Unicode code point（JavaScript UTF-16 `length` 为 284,902）。

当前实测619项测试通过，`smoke:runtime`在编译产物上运行541项。最新批新增28项Hook生命周期专项，涵盖默认入口的真实SDK参数改写/失败反馈/Stop续跑/子Agent、配置命令/Prompt Hook和真实自有fs.watch；既有模块继续全量回归。SDK0.5.2、六份配置/115 Prompt保持不变。没有登录真实产品账号、发送真实联系人消息或访问真实产品/模型服务。

如持有本次固化的原始 `codebuddy.js`，可执行独立差分（先验证 bundle SHA，再在 VM 中仅装载目标类；不启动应用）：

```bash
npm run verify:loop -- /absolute/path/to/codebuddy.js
npm run verify:model-config -- /absolute/path/to/codebuddy.js
npm run verify:tasks -- /absolute/path/to/codebuddy.js
npm run verify:interaction -- /absolute/path/to/codebuddy.js
npm run verify:skills -- /absolute/path/to/codebuddy.js
npm run verify:management-output -- /absolute/path/to/codebuddy.js
npm run verify:cron -- /absolute/path/to/codebuddy.js
npm run verify:worktree -- /absolute/path/to/codebuddy.js
npm run verify:team -- /absolute/path/to/codebuddy.js
npm run verify:lifecycle -- /absolute/path/to/codebuddy.js
npm run verify:recovery-retry -- /absolute/path/to/codebuddy.js
npm run verify:workflow-subagents -- /absolute/path/to/codebuddy.js
npm run verify:team-external -- /absolute/path/to/codebuddy.js
npm run verify:workflow-core -- /absolute/path/to/codebuddy.js
npm run verify:workflow-control -- /absolute/path/to/codebuddy.js
npm run verify:workflow-presentation -- /absolute/path/to/codebuddy.js
npm run verify:record-replay -- /absolute/path/to/codebuddy.js
npm run verify:web-tools -- /absolute/path/to/codebuddy.js
npm run verify:delegate -- /absolute/path/to/codebuddy.js
npm run verify:lsp -- /absolute/path/to/codebuddy.js
npm run verify:media -- /absolute/path/to/codebuddy.js
npm run verify:computer-use -- /absolute/path/to/codebuddy.js
npm run verify:channels -- /absolute/path/to/codebuddy.js
npm run verify:channel-clients -- /absolute/path/to/codebuddy.js
npm run verify:history-pipeline -- /absolute/path/to/codebuddy.js
npm run verify:blobs -- /absolute/path/to/codebuddy.js
npm run verify:image-codec -- /absolute/path/to/codebuddy.js
npm run verify:session-result -- /absolute/path/to/codebuddy.js
npm run verify:history-response -- /absolute/path/to/codebuddy.js
npm run verify:agent-manager -- /absolute/path/to/codebuddy.js
npm run verify:memory-rules -- /absolute/path/to/codebuddy.js
npm run verify:auto-memory -- /absolute/path/to/codebuddy.js
npm run verify:generic-hooks -- /absolute/path/to/codebuddy.js
npm run verify:hook-lifecycle -- /absolute/path/to/codebuddy.js
```

新增 record/replay 差分通过2,282次，包含原类真实临时文件I/O、metadata/env、队列回退、录制与重放错误、严格模型名校验、事件时间倍率及Provider模式；以下既有模块的差分本轮也全部回归。
网页工具/IOA/托管策略另通过544次原类/函数差分，涵盖schema/限制常量/header原值、格式/逐字回退Prompt、网络/缓存/API与本地竞跑、请求/结果/错误、AI回退与Security Center转换/来源优先级；不等于所有超时/网络故障/平台或完整安全中心状态空间。
Delegate另通过282次固定SHA原类/包内schema转换器差分，涵盖注册索引/回调、连接/timeout/status/异常、handler包装、ACP变更、描述变量/cache刷新与getAll；不等于完整ACP宿主或所有异步竞态。
LSP另通过711次固定SHA原类/包内schema转换器差分，涵盖schema/coerce/坐标、九种操作/截断/原文、Location/hover/completion归一、握手/反向消息、开文档/关闭、注册/状态/重试/插件provider、路径与Windows命令/启动参数和时序；不是711个独立业务场景，也不涵盖完整plugin loader或所有OS/竞态。
媒体工具/服务/Hook另通过370次固定SHA原类/包内schema转换器差分：schema、feature/env gate、各model-tag优先级与请求分支、图片输入/MIME/错误、视频submit/poll/边界、原tool result/render文案、Hook输入及真实临时文件保存；不代表完整RestOperations/认证/全并发/磁盘故障状态空间。
ComputerUse与工具结果/模型请求/MIME处理器另通过1,028次固定SHA比较；所有桌面I/O与timer为注入假实现，不代表1,028个独立业务场景或真实OS授权/视觉验证。
两套channel工具/bridge/manager/审批另通过1,810次固定SHA比较；包含原schema转换/文案/逐字提示、路由、入站/队列/唤醒、Ask/permission/suggestion、local command和manager/adapter状态。不代表1,810个独立业务场景，不覆盖真实client传输/认证、全并发或完整ChannelSecurityManager。
渠道client/API/media/auth/watchdog/factory/registry另通过1,016次固定SHA比较；原网络/存储/随机/时钟/QR/socket边界为注入fixture，真实I/O/SDK的另29项测试不混入差分计数。真实服务认证/全部平台/竞态、完整安全与UI等仍未证明。

输入/历史批次另通过1,261次固定SHA比较：原六个processor、三个图片interceptor、37份原renderer、helper子集和原provider排序/无效priority过滤。与18项运行测试分开计数；25个差分脚本均回归。原blob存储/压缩算法本体不在此证明范围。

最新blob批次另通过535次固定SHA比较：原三服务、路径/MIME/文件大小helper子集和四个SessionStore方法；26个差分脚本全部回归。此批恢复原blob存储/轮次算法，不将未恢复的压缩codec算作已完成。

最新image-codec批次另通过803次固定SHA比较，含原内嵌codec图与真实编码字节；27个差分脚本全部回归。对照范围见本页ImageUtils节，不是全部跨平台/恶意输入状态空间证明。

最新session-result批次通过682次固定SHA比较，28个差分脚本全部回归：完整原DraftStore、abortable iterator、七个SessionManager方法及四个content-filter helper。UUID/时间/observer是受控注入；已有RunResultUtils/ErrorUtils/基础InputItemUtils作为明确依赖边界，不把它们重复计为独立恢复。比较次数不是独立业务场景数，也未穷举所有取消/并发/生产响应interceptor。

最新history-response批次通过982次固定SHA比较；全量29个差分脚本回归。包含InputHistory完整类、八类响应interceptor及原DI反序、静态字段/正则/Prompt模板、业务码enum/分类/映射、Token/PTL/历史截断和输入helper。I/O/observer使用受控依赖，当前已有基础历史/输入方法为显式边界；不是982个独立业务场景，不代表全部配置热替换、并发清理、完整UI或生产遥测已恢复。

最新AgentManager批次通过559次固定SHA比较，30个差分脚本回归：68个完整方法AST/constructor字段初始化/内嵌Prompt常量、原spec/composer函数、74个YAML factory逐字文本，以及重建/失败/barrier/插件/MCP/gate/模型矩阵。框架DI/Deferred/Emitter、SDK和受控I/O为显式边界；并行Agent的跨VM日志按值/数量比较，重建/MCP屏障另验证因果状态。比较次数不是独立场景数，不证明全产品启动、全部竞态或配置provider/插件loader已恢复。

最新memory-rules批次通过282次固定SHA比较，31个差分脚本回归：八类服务/LRU/依赖helper、工具注入与run interceptor共67个完整方法AST，原两个minimatch factory逐字保留，有限规则发现/import/cache/glob/写入/Hook/Prompt行为。I/O/Hook为受控内存依赖；18项SDK/CLI专项另计，均只读写owned临时文件/本地HTTP。比较次数不是独立业务场景，不证明完整memory relevance/entrypoint/UI、跨平台或全部并发状态空间。

最新auto-memory批次597次固定SHA比较、54个完整方法/函数AST，32个差分脚本回归。范围含五个完整类、scanner、所有typed/legacy/提取Prompt函数、freshness、路径与Git helper；源SDK保持0.5.2依赖。23项SDK/CLI专项另计，涵盖选择/去重/取消、真实memory写入而不污染主历史、freshness与entrypoint；VM使用内存I/O/受控timer，不能据此证明全部并发/平台/产品UI/Hook执行器已恢复。

最新通用Hook批次：四个完整原类与协议/helper，52个完整方法/函数AST、1,077次固定SHA比较，另对事件说明/标题/无matcher列表的完整AST、28事件/通知/数字priority反向映射作校验。33个差分脚本继续回归。有限验证不代表完整Hook生命周期或整个harness100%。

### 通用 Hook 的显式嵌入入口

`createGenericHookHost(options)`返回`manager/executor/promptService/registry/runtime/close`。`workDir`、`shell.isWindows/getShellConfiguration`以及`permissionUtils.matchCommandRule/matchFileRule`必须由嵌入方显式提供；本批恢复`if`表达式解析和委托，不冒充完整PermissionUtils/平台shell发现。可选注入settings、plugins、SDK hooks、endpoint、internal hooks和input processors provider；Prompt Hook还需AgentService，或AgentManager/RunnerProvider。

配置形状为`settings.get('hooks') → { [event]: [{ matcher?, hooks: [...] }] }`，不是平铺命令列表。`manager.executeHooks(event,input,options?)`按原顺序运行input processors→internal/local并发→聚合→SDK callbacks。低层`createGenericHookHost`仍默认provider为空；默认`createHarness`现在使用下节的`createHookLifecycleHost`并注册四个structured/memory Hook及图片input processor。没有产品service-proxy endpoint，不扫描安装配置/账号/插件。旧SessionHookManager/scoped facade保留兼容，但默认运行路径已改为native实现。

`registry.register(scopeId, hooks, {isAgent,sourceLabel})`按原全局registry枚举各scope，不按当前session隔离；给缺少sourceId的Hook打stamp，agent的Stop转SubagentStop。`once`只对command exitCode===0记录WeakSet对象身份，不跨进程持久化。

只执行受信任的显式Hook。原executor继承process env并清空NODE_OPTIONS；command的allowedEnvVars不是进程环境沙箱，HTTP仅用它控制header变量插值。命令exit2强制阻断，其余非零可能放行；HTTP非2xx/异常和Prompt执行失败防御性放行。HTTP计时到收到响应头为止，不涵盖完整body。asyncTimeout单位为毫秒；asyncRewake虽传入但原executor不消费。命令/Prompt timeout、signal支持不一致，不补造统一取消协议。close仅清本host记录的child/timer，不改变原类控制流，也不是进程树隔离器。

Prompt历史评估保留SDK0.5.2的独立RunState(maxTurns=1)、原父RunContext复用、历史call/result修复与custom过滤、evaluator clone、purpose恢复；不抄写SDK，也不修改115份product Prompt。OpenAI Docs用于核对流/状态边界，实际还原以固定样本和本地锁定SDK为准，未按当前文档升级接口。

### 默认 Hook 生命周期与剩余边界

`harness.hooks`现在默认提供`manager/executor/promptService/registry/sessionManager/toolManager/pipeline/close`。`createHookLifecycleHost`补齐原平台shell发现、WindowsBashUtils、文件/命令匹配、消息可见内容/XML处理、错误码与watchPaths依赖；原micromatch/which依赖的15个factory原文保留，不猜版本替换。嵌入参数`hooks`可显式注入env/FS/clock/which/平台、服务provider/插件/SDK callbacks、通知/遥测与缺失产品服务；默认只读取本宿主的settings。

SessionStart/idle Notification沿已有SessionManager barrier派发；UserPromptSubmit在输入处理/发布后、transcript append之前执行，仅主会话真实非compact user消息触发，阻断会抛HookBlockedError。上下文走原system-reminder；SessionStart允许initialUserMessage字段，但完整产品自动首消息/前端调度尚未恢复。SessionEnd负责清watchPaths，close再清本host拥有的watcher/child/timer。watchPaths是原fs.watch，不是memory规则热加载服务，也没有debounce/去重/沙箱保证。

Stop使用完整原SessionHookManager，只有completed且父signal未abort才续跑；显式continueRequest优先于blocking反馈，preventContinuation压过二者。宿主清理已消费request、传stop_hook_active并重新调用原AgentService，只有终止时发FinalStop；失败/取消不会因block而重新调用模型。structured/memory四个内部Hook经统一provider排序，移除先前单独调用，避免重复提取/重试。

工具通过原ToolManager的三个完整wrapper方法运行：消费pre-call缓存、合并updatedInput（含value包装）、IDE/sandbox/backup/执行/支付adapter边界、成功truthy结果才PostToolUse及conditional rules、失败调用PostToolUseFailure并把hint追加到Error；PreToolUse拒绝位于execution catch之外，不额外发Failure。完整ToolHookManager恢复response_flag/thrown错误码/持续时间和MCP专属updatedOutput协议；不能据此宣称完整MCP proxy输出替换、mandatory permission classifier或产品telemetry。

TaskCreated/TaskCompleted、SubagentStart/SubagentStop/TeammateIdle、compact前后、WorktreeCreate/Remove和InstructionsLoaded已接native分派。PermissionRequest/Denied、Elicitation/Result方法已原样恢复并可调用，但完整SDK暂停前的ToolPermissionService/审批缓存路径、MCP自动elicitation、service-proxy controller、ProductManager/plugin refresh/Startup UI仍待补；独立宿主审批callback仍是另一道guard，Hook allow不冒充完整原审批策略。IDE/fileTrack/checkpoint/payment等未配置服务明确为空adapter，可显式注入，不伪造已恢复。

本批70个完整方法/函数AST、884次固定SHA比较、15个依赖factory原文及完整ToolErrorCode映射，新增28项专项；34个源码差分、619项测试及541项编译JS smoke通过。OpenAI Docs只核对SDK审批/状态边界，SDK仍锁0.5.2。后续优先补齐原工具权限/审批与Hook服务代理，再继续ProductManager/插件热刷新；整体仍未达到100%。

已通过循环检测 1,411 组、模型配置 972 组、任务 495 组、交互/上下文 1,438 组、Skill/命令 536 组、管理/Notebook/StructuredOutput 753 组、Cron/消息队列 1,442 组、Worktree 1,519 组、Team 1,432 组对照，以及生命周期 7,358 次、会话错误恢复 2,801 次、Workflow 子 Agent 1,139 次、外部 Team 1,021 次、Workflow 主链 1,412 次、Workflow 控制层 536 次、命令/事件桥 1,488 次比较。Workflow 差分覆盖解析/错误位置、compiler 扫描/offset/包装、prelude 逐字输出、Agent/phase/cache/错误与事件顺序、并行/流水线、预算/hash/journal projection、根/嵌套 VM、resolver 路径、取消/计时器及 meta-head helper；新增覆盖命令改写/history 文案/保存参数/列表和 ACP/print 字段矩阵/订阅/错误。排除原生 telemetry、全部 UI/进程宿主副作用，且不等于全部状态空间穷举。原始 48 条工具声明含重复 Agent，实际 47 个名称；当前47个不同名称均已注册handler，但客户端传输/宿主分支仍未齐全（含 legacy handler，不等于默认 Agent 暴露数量）。完整产品CLI、客户端协议与宿主分支继续恢复，详见 `RECOVERY_STATUS.md`。本地兼容端点验证不等同于真实 WorkBuddy 服务端认证/策略验证。

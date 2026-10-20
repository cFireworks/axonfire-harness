# 原 ACP 新会话与 HTTP/View 交接

固定 CLI SHA-256：`4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd`。本阶段连接已恢复的原业务类，不执行原 DI decorators、daemon/Electron 或整个 bundle bootstrap；SDK 继续保留 npm 依赖。

## 完整原父原语

`native-acp-parent-primitives.ts` 新增 4 个完整原类、10 成员：EndpointProviderImpl（3）、CliServerErrorHandler（3）、CliRuntimeOptions（3）、DefaultRestOperationsFactory（1）。另恢复完整 `pickDefinedCliSessionInitialOptions`；共12完整业务声明/表达式、9个非DI import declarator、3个完整 factory（43533 gateway/security tokens/header helper、45654 EndpointProvider token、1562 REST tokens/ResponseEntityUtil）。factory 内的类不重复计数。

初始化顺序按原声明/表达式/declarator 的源码位置保留；scope 使用同一 exports 对象，原 getter 与 CJS 标记不在 Object.assign 时丢弃。原 `Value("cell.client.config") → clientConfig` 调用、来源及目标独立核对；没有推断该配置的默认值。Axios 依赖 33584 由父宿主明确提供，恢复原 factory 不代表整个 REST client/拦截器容器已经还原。

- EndpointProvider.get 等原 Deferred。setServer 先 address，再 listening/error 事件与每10ms polling；第51次 poll 才抛文字为500ms的超时，清 timer/监听。Unix socket字符串和 listening但无address保留原错误；首次Deferred resolve后不会被后续server替换。
- endpoint 用显式 env 的 `SERVER__HOST || "127.0.0.1"`；原 IPv6 没有补中括号，不修改这个差异。
- CliRuntimeOptions.set 只选原指定会话选项，**不透传 cwd、print、inputFormat 等字段**；保留 undefined 排除、null保留和浅拷贝。onDidChange比较完整raw opts，即被过滤字段变化仍会发事件；共享嵌套数组被原地修改时可能反而不发。
- DefaultRestOperationsFactory.create 原样把 clientConfig 引用交给 `axios.default.create`，不做新合并。CliServerErrorHandler 始终 canHandle，priority=2，记录错误并以500返回原message；它不是秘密过滤器。
- `withSecurityHeader` 克隆headers并覆写 `x-codebuddy-request: "1"`。这不是认证 token，不足以保护对外 API；完整 gateway 服务没有因恢复这些 tokens 就完成。

## 真实新会话链

原 `AcpAgent.initializeSession` 等待真正 AuthenticationManager.initialized 和当前账户，创建原 sessionDeferred，使用原 CliRuntimeOptions/EndpointProvider/REST factory 发内部 HTTP。原 SessionMiddleWare 创建/保存/激活原 native session，原 Controller.run 在无 prompt 时返回该 session。原 MVC ViewResolver 根据父配置选择原 AcpView。

**只有原 AcpView.render 调用原 Agent.setSession**：发布当前session、usage注册、resolve原sessionDeferred，然后启动原prompt iterator。宿主不提前setSession、不手动resolve、不把现有session塞进创建流程。原 Agent 随后计算models/modes/config、发commands/workspace/usage，真实ACP SDK返回newSession响应。

这个RPC返回时内部HTTP仍在等待render循环；不是把HTTP请求完成当作会话就绪。后续ACP prompt唤醒该iterator，经完整原AgentService、5个原interceptor（UserInput/MessageQueue/History/Telemetry/State）、Manager/Store/Runner/Provider、完整原InterruptionService和固定SDK执行Read、保存JSONL并续轮。Manager仍为唯一SDK stream/history消费者；InterruptionService只订阅结果、运行原Stop/agent_end/combine分派，未伪造完成事件或安装第二个流消费者。

初次组合证明了旧fixture只记录waitFor不足以让ACP结束；现在实际使用32成员的完整原InterruptionService。legacy queue默认分支也保留，最终空输入调用由原MessageQueue interceptor跳过，不用改成deferred-dispatch开关来躲过该路径。

同一ACP连接再次newSession时，原View**先setSession再检查activeRenderConnections**：新HTTP跳过重复循环而结束，旧HTTP/原iterator继续，下一prompt采用原Manager新current session。测试验证旧subjects完成、新历史不含旧Read内容、实际SDK上下文为新session。宿主仅观察源setSession更新关闭目标，不另造会话切换逻辑。

## Native Write 审批装配

同一父链现接入 `createNativeSettingsHost` 的原 SettingsManager/CLI providers、`createHookLifecycleHost` 的原 Session/Tool Hook managers 与执行 pipeline，以及完整 ToolPermissionService/PermissionUtils/CommandUtils/八策略、always/background 审批类。原 SessionManager.create 和 SessionMiddleWare 都实际初始化权限 context；SDK needsApproval 走原服务，不把工具统一设置成 true/false，不申请 standalone ViewHost 的审批 lease。

确定模型请求写入自有临时文件，ACP Client 端作为明确的人类决定测试输入；原 AcpAgent.handleToolApproval 经真实 ACP requestPermission 接收 Allow/Reject/Always Allow，调用原 InterruptionService。四个场景验证：

- 批准前文件不存在，真正的原 pending/queue 指向当前 native session；批准后才写入 UTF-8 内容、恢复**同一个 SDK RunState**并保存最终回复。
- Reject 返回 cancelled，不执行写入，不伪造批准或模型继续；Cancel 在实际 permission RPC 待决时调用原 ACP cancel，也不写入。
- Always Allow 走原缓存/applyUpdate；同一会话第二轮对另一个新文件执行 Write，原权限门返回无需审批，确实没有第二次 requestPermission。规则仅在 session，不生成项目永久授权。
- 各场景结束后 pending$、interruption queue、item/session map 和 session interruption 清空；HTTP/iterator/任务监听与 owner 关闭仍通过既有回收屏障。

ToolPermissionHost 的可选 factory 注入只用于明确替换实现边界，默认仍为原还原类。参考侧另外装载固定样本中的原权限服务、utils、命令安全类、八策略和 always/background 类，与完整原父链成对运行；不是仅用还原服务对照自身。设置/Hook 的还原类在两侧共用，已有独立源码验证。

快速 ACP Reject 会在原 InterruptionService 的 200ms sleep 结束前拒绝 Deferred。参考加载器采用与还原宿主相同的被动 promise.catch 观察，避免 Node 提前报告 unhandled rejection；不替换 promise、resolve/reject、审批选择或原 32 成员控制器类体。该资源所有权桥不计为原业务源码的一部分。

## 新增资源所有权桥

`createAcpRendezvousHost` 与已有 `createAcpViewHost` 不同：前者由真实HTTP/MVC调用render，支持源新会话交接；后者借用一个已创建的 standalone session/审批lease。两者都不复制agent loop，不把新的桥称作原源码。

```ts
import { createAcpRendezvousHost } from "@axonfire/harness/protocol/acp-rendezvous-host.js";

const host = createAcpRendezvousHost({
  runtime: sourceRuntime,
  agentManager: sourceAcpRegistry,
  logger,
  dependencies: { sessionManager, stateMachine, agentService, commandManager,
    interruptionService, taskStorage, broadcastService, frictionAnalysisService },
});
// 把host.view交给原ViewProvider；父配置明确选择viewName="acp"。
// 专用原Agent通过host.rpcAgent(agent)交给原ACP AgentSideConnection。
```

这是嵌入接口示意，所有父服务须真实装配，不是无需依赖可启动的认证server。host调用原View.init，跟踪render、原iterator、RPC/prompt Deferred、异步订阅、task监听与自有timer。失败构造清timer；即使source在finally之前失败也回收已观察到的外部监听。

原Agent须专用：运行时临时观察原setSession和sessionDeferred字段，保持真实对象/返回/调用，不resolve它们；关闭才拒绝尚未结束的owned Deferred，包括close开始后才赋入的Deferred。拒绝并发拥有同一Agent，结束后恢复原字段/方法descriptor。rpc facade拒绝关闭后的新调用；source render失败会阻止后续无人消费的RPC。裸source对象仍是受信任API，不是安全沙箱。

close先关闭RPC准入，需要时用原cancel，再结束原iterator、拒绝未完成prompt、等待自有Promise/订阅并清timer/监听。取消失败仍执行其余回收，最终报告AggregateError；不把运行中的source状态强制改成idle。borrowed auth/REST/SDK等操作如果不结束，close并不能凭空取消它们，父宿主必须提供可收尾的依赖。

父关闭顺序：先停外部准入 → rendezvous.close → 等原HTTP middleware结束/自有REST请求完成 → 关闭services/ACP streams → 关闭HTTP namespace/认证/backend等父资源。此桥不自动关闭借用的server、registry、services或backend。仅借用SDK构造/运行边缘设本地Noop trace，不修改SDK文件或全局tracing processors。

## 证据与边界

```sh
npm run smoke:acp-parent
npm run verify:acp-parent -w @axonfire/harness -- /absolute/path/codebuddy.js
```

27项专项：13个父原语场景、6个真实ACP SDK/Node HTTP/完整原View+native执行链+真实SDK集成（单会话/同连接切换/四种Write审批）、8个新增owner独立测试。第65组验证核对全部新增源码body/绑定/完整factory/Value，13组原片段差分，再用完整原HTTP、AgentService/utilities、Runner、auth、ACP Agent/View/lifecycle/services/registry、权限和审批类重复六组集成。既有已校验的native Manager/Store/ingress、设置/Hook及修改版ACP SDK仍共用，不声称重放整个原应用或所有第三方库。

仅用自有临时工作/状态文件、随机127.0.0.1端口、额外随机capability和确定模型。原custom-token storage从显式owned配置产生账户，未预填auth Subject；JWT decoder为明确外部库double，非产品登录/验签。REST的底层Axios位置为有origin限制的owned fetch adapter；原factory/create/endpoint/内部header逻辑实际运行。Node JSON parser、no-team/task、Ask等待span观察与telemetry等外缘仍为明确测试适配器；设置、Hook和权限初始化已接原核心，但未配置 Auto classifier、外部 Hook callback 或生产账户。不靠bypassPermissions；四种Write有限场景不证明父链Ask/Plan/所有模式/所有取消竞态已经完成。

OpenAI Docs仅核对[SDK运行与恢复边界](https://developers.openai.com/api/docs/guides/agents/running-agents)与[同一RunState审批恢复](https://developers.openai.com/api/docs/guides/agents/guardrails-approvals)，不替换原状态机或升级锁定SDK。完整默认公共装配器、生产认证/磁盘账户库、load/resume/fork的父端到端、父链Ask/Plan审批、真实gateway/REST/bootstrap、Desktop HistoryStore、daemon重启/回放等仍需继续。默认CLI/Web保持可用，但尚未切换成完整原生父启动入口。

REA 6.7.0对新增owner和原父原语两份惰性源码的静态证据为`ev_df0d0239eaa1eae1e1d2dfb43036302bc6750bada187af4f6e6c9ca9ac5e8bed`：3864 AST nodes、2 parsed files、0 skipped / parse failures。750 semantic nodes / 每文件750、150 unknown / 每文件150、45秒限制下仍partial/truncated；没有执行bootstrap，不能以静态图证明整个运行时等价。

本轮权限宿主与父链装配的两份惰性副本补充REA证据 `ev_cbae15d40f0a5bf82b76fd2c2661b44113fd42daab6646b739883cdb6f3ca919`：6327 AST nodes、2 parsed、0 skipped/parse failures。参数同上，仍 partial/truncated；静态有限覆盖不计为完整运行时等价证明。

# 完整 ACP View 循环与审批归属

本阶段把完整 AcpAgentImpl、AcpView.render/iterator、广播/usage/friction 源服务、样本 ACP SDK 与真实 OpenAI Agents SDK 连起来。面向**显式接入的现有 backend session**，不伪造登录/新会话，也没有切换 CLI/Web 默认入口。现有 `npm ci && npm run build && npm run demo` 仍可用。

## 源依赖

固定 CLI SHA：`4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd`，catalog 偏移为 UTF-16。`native-acp-lifecycle.ts` 恢复：

- 6 个完整惰性 factory：7357 task outcome/error-category、66742 outcome 优先级、95449 ReferenceService token、99006 session 接口/phase、71389 完整 run-state 枚举/helpers、50523 取消清理。
- HostCapabilityProvider 完整类及环境键/能力常量，CliExternalUriOpener 完整类。不执行注册 decorators，不冒充整个聚合模块 79814/71915。
- 团队 follow-up 的 5 个完整函数及原 WeakSet：set/isLeadInboxPaused、getRichQueueManager、pause/resumeTeamLeadFollowUpDispatch。

保留原取消顺序与失败容错：取消 interruption；Plan 恢复 prePlan/default，非 Plan 清残留；只给 in_progress 任务加取消 metadata，不改 status；更新使用 allSettled；compact 检测兼顾 isCompressing 和 lastAgent；queue 浅拷贝到 lastCancelledQueue 而不清原队列；清 progress、复位压缩。团队 pause 不覆盖其他用户 pauseReason，resume 只恢复 cancel 原因。URI 先发通知再调用 UrlUtils，打开失败返回 false。全部 factory/8 完整声明做 AST 核对，另 14 组有限行为差分。

## 新增宿主

`createAcpViewHost(options)` 是明确的新增所有权适配层，**不改写原 Agent/View 业务方法**。父宿主必须提供完整 source DI、真实 connection/AgentManager、已有 session、ServicesHost 和 HTTP Context；不能填空业务服务。

```ts
import { createAcpViewHost } from "@axonfire/harness/protocol/acp-view-host.js";

const host = createAcpViewHost({
  backend, session, agent, agentManager, services, runtime,
  followUpPauseState: lifecycle.team,
  runInContext, logger,
});
await host.start();
// AgentSideConnection 注册 host.rpcAgent 这个关闭门禁 facade；
// 连接工厂可惰性转发到它，不能在 close 后直接调用裸 agent.prompt。
const result = await host.prompt({
  sessionId: session.id, prompt: [{ type: "text", text: "hello" }],
});
await host.close();
```

start 等到原 iterator 已订阅，实际执行完整 render 循环，不替代为一次 executePrompt。rpcAgent 的方法仍调用同一个 source Agent，不伪造未知实现。Agent 的 InterruptionService DI 必须指向 `backend.approvalOwners.interruptionService`，构造时核对。

`approvalOwners` 是 backend 内存中的精确 session 对象 lease，不写 meta、不随历史恢复。只能由 idle、无待决队列、没有 standalone 正在执行的真实主会话取得，子会话不能单独抢占。旧 UI 仅在实际主会话的当前 item 与真实 queue 中均有同一对象时让出；不能靠伪造 parent ID/ACP 标志跳过。

原 handleToolApproval 仍完成 ACK、客户端/abort/本地竞争与 approve/reject。原控制器接受该待决 item 后，适配层登记 standalone 执行器的一次性 call ID/name 凭据，Defer 对应真实目标名。自动 Read/规则放行/Always Allow 则被动观察原 native permission gate 的结果，不重复分类或请求旧 UI。原 needsApproval=false 也可能表示 deny 已缓存，allowed=false/permissionDecision=deny 不产生凭据，原 hook pipeline 继续阻止执行。SDK 审批仍先运行，不因 lease 自动批准，不启用 bypassPermissions；过期、无 state、非 owned、sandbox resolution 不从人工审批路径产生凭据。宿主要求 nativePermissions 与 nativeApprovals 都已启用。

占用期间旧 backend.prompt/compact 不得同时进入该会话，后台派发唤醒原 View.triggerDrain。释放后恢复旧入口。TeamLeadInboxPoller 仅对该 session 借用原 WeakSet，释放保留最终暂停状态，避免两套不一致的取消标记。

## 关闭边界

宿主拥有 View、iterator、lease、自有 task listeners/subscriptions/timers 和已接受调用。外围观察原 async 订阅的 Promise、SDK result.completed、history/result handling、审批续跑、任务存储与未 await 队列分支。start 失败和异常退出可观察；临时方法/facade 不改原类体。

关闭先拒新入口，必要时原 cancel，再结束 iterator、拒绝未完成 owned Deferred、取消待决审批、等待自有执行。原取消可能留下 CANCELLING；只在 SDK/审批清空且 abort 已发生的 owned 关闭屏障上 forceIdle，不改运行中的取消逻辑。View interval 通过外围 runtime 注入拥有，类体 AST 不变。

最后清自有监听/定时器，恢复临时方法/ACP 选项，取消本次 usage 登记，释放 pause state 与 lease。rpcAgent 在关闭后明确报错，不把新请求送入无人消费的 promptEvent。

**backend、services、Agent、连接和外部 REST/认证/终端均为借用**。父宿主先停外部接收，关闭 ViewHost，再关闭 ServicesHost/连接/后端；本组件不会终止任意借用网络操作。裸 Agent/底层 service 是受信任嵌入 API，不是安全沙箱。未添加公网 listener。

## 验证与剩余范围

```sh
npm run smoke:acp-view
npm run verify:acp-lifecycle -w @axonfire/harness -- /absolute/path/codebuddy.js
```

34 项专项：14 组源依赖、7 个归属边界和 13 个完整 View/SDK 场景，覆盖批准/拒绝/Defer Write、自动 Read、Always Allow 后第二次 Write、deny=false 无落盘、第二轮历史、队列唤醒、取消、关闭后 RPC 拒绝、legacy 恢复、异步设置等待、错误 Context/start 失败。模型、工作文件和协议 pipe 是 owned fixture；不读取安装账号，不请求生产模型，不靠 bypassPermissions。

源码验证另用完整原 Agent/View/primitive/services/ACP SDK（参考侧完整原 Zod factory）装入同一真实 SDK 后端，对批准、拒绝、Defer Write、自动 Read、Always Allow、deny rule 做六组成对运行，比较关键回复、审批参数、工具状态、副作用与回收计数。仅归一化临时目录，不把这些有限运行称为时间/随机 metadata 的穷尽证明；源声明仍独立 AST 对照。

集成发现：原 View 后台 drain 发出的产品 `session_end` 扩展，会被样本 SDK 的 ClientSideConnection schema 以 -32602 拒收。测试分别核对发包与丢弃，**未改宽 schema**，并新增原 SDK/Zod 差分。产品前端可能采用不同通知消费者，此证据不证明原 UI 收不到消息。

内部新会话路由的控制器、工厂、中间件及完整原 CLI Manager/Store 已单独恢复，见[会话入口](session-ingress.md)与[原生会话栈](native-session-stack.md)；完整原 AgentService/前置链和 RunnerFactory/Provider 已连接原 Manager 验证，见[原生执行链](native-agent-run.md)与[Runner 创建链](native-runner.md)。[HTTP/MVC/CLS 核心](native-http.md)现已恢复，并通过自有真实 HTTP/JSON view 打通上述原执行链；这不包含原 AcpView 新会话 rendezvous、真实认证和默认父 bootstrap。其余仍待：启动入口、真实 AuthenticationManager/网关、Ask/Plan/回放端到端、Desktop SessionManager/HistoryStore、daemon 模式重启回收、request-send telemetry/标题 Hook、原生/外部 Docs 服务。现有会话的完整协议循环不等于整个产品 100% 还原。

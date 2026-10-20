# 完整原生 CLI SessionManager / Store

固定 CLI SHA-256：`4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd`。`packages/harness/src/sessions/native-session-stack.ts` 保存完整原惰性声明，不执行 DI decorators、原应用 bootstrap 或安装账户查找。

后续[公开原生会话栈父装配](native-session-stack-host.md)已将实例装配、Subject/RX/调度与写盘所有权移出测试helper；完整原48组件差分+2SDK成对验证及ACP父链/冷恢复均已改接。普通CLI/Web默认入口仍待完整父装配迁移，不以新增所有权桥冒称原产品bootstrap。

| 组件 | 完整范围 |
| --- | --- |
| SessionManagerImpl | 构造器及全部 37 方法（38 成员） |
| SessionStoreImpl | 构造器及全部 27 方法（28 成员） |
| AbortedStreamDraftStore | 构造器及全部 20 方法（21 成员） |
| 本地依赖 | 完整 createAbortableIterator、abort grace 初始化、history limit 常量/函数及 Store 初始化声明 |
| 惰性 factory | 完整 73571 反向读行、95695 持久化开关、89483 content-block sanitizer |

合计 3 类 87 成员、7 完整声明、3 完整 factory。偏移按原 UTF-16 记录；这不是整个 71915 聚合模块，也不是 Electron/Desktop 的全部会话实现。

## 接口与默认入口

后续[完整原生执行链](native-agent-run.md)现已直接连接本 Manager/Store 验证，不再需要下文历史批次中的旧 AgentService facade；其原 History/Telemetry 顺序也通过空 meta 冷加载。默认入口仍未切换。

```ts
import { createNativeSessionStack } from "@axonfire/harness/sessions/native-session-stack.js";

const native = createNativeSessionStack({
  modules: explicitModules,
  getModule: resolveParentModule,
  env: explicitEnvironment,
  argv: explicitArguments,
  // 父宿主还可以拥有 setTimeout/clearTimeout、Date。
});
const manager = new native.SessionManagerImpl();
const store = new native.SessionStoreImpl();
// 原 decorators 不执行；父宿主必须注入真实 sessionFactory/store/permissions/hooks 等服务。
```

另外返回 `AbortedStreamDraftStore`、`createAbortableIterator`、`resolveSessionMaxItems`、`isSessionPersistenceDisabled`，便于明确嵌入/验证。只为列出的 3 个 factory 提供局部惰性 loader；其他依赖必须显式提供。`process.env/argv` 默认为空，不隐式拿宿主进程参数决定是否落盘。PathUtils/文件系统也是显式依赖，不能直接指向安装应用的账户/历史目录。

**CLI/Web 默认路径暂未切换。** 现有独立宿主 SessionManager/SessionStore 承担多会话缓存、补默认值、异步所有权和 Web 生命周期，不能用其 green tests 宣称与完整原类相同。完整声明已恢复不等于父 runtime 已完成接线；新类也没有新增无认证 listener。

## 保留的原生命周期

- create 初始化权限、session count、队列/inbox 注册和可选 result consumer，但不设置当前 session，也不隐式 save。入口中间件的 save/setCurrent 仍是独立步骤。
- getCurrent 优先 AsyncLocalStorage，再查 HTTP Context 的 Request scope。
- 相同 ID 的 setCurrent 保留旧对象和历史；合并 options，meta 只补旧对象缺少的键，忽略新 undefined。非 reverted 时重算 lastMessageId；旧 signal 已 abort 时新建 controller。
- 不同 ID 时完成旧 result/input/historyReload/model/background/agentState/interruption/localExecute/permission/queue 十个 subject，取消旧 result subscription/idle timer、停进度/cron、清 tasks。原代码不在此完成 combine/runState/phase/progress 等其他 subject，没有给它“补齐”。
- addHistory 按会话 promise 顺序执行 processors→history/input/combine→UserPromptSubmit→checkpoint→append→idle timer。已排队调用继承前一失败；Hook 失败可能留下已经发布但未落盘的历史。runWithoutHistory 为异步局部状态。
- emitSessionStart 的 startup/resume 加入原 WeakMap 缓存；原缓存不会在完成后删除，同一对象后续 resume 仍可能重用已完成 Promise。没有改成每次重跑 Hook。
- 原 result subscription 仍以同一真实 SDK stream 为单消费者，更新 state/gate、记录 metadata、运行 interceptors 并处理 telemetry。重新 init handler 会触发 BehaviorSubject 的旧结果重放；cancel-nudge 在这些更新前跳过。
- 取消使用完整 abortable iterator 和 DraftStore，将未提交文本/推理/tool-call 草稿写成 `status: incomplete` / `providerData.isPartialAborted: true`；不把它当成功的最终回复。idle notification 仍为 60000 ms；abort grace 默认 3000 ms、按原环境校验。
- remove 清 result/timer/start time/tasks/cron，但原 override maps 不在此清除；thinking=false 丢弃 effort，null 删除，undefined 仍可能抛错。

## 保留的原落盘行为

- 当前项目、显式 cwd preferred 项目、跨项目、`agent-*` 子目录定位；逻辑 sessionId 与物理 storeId、parent/subagents 路径保持原分支。listing/most recent 排除原判定的 subagent/compaction session，保留 since/workdir 过滤和排序。
- 完整反向 reader 按源 separator/UTF-8/chunk 算法工作，Store 调用的 chunk size 为 65536。损坏 JSON 行跳过，limit/用户边界与额外 100 项规则不改写；没有用现有独立 reverseLines 代替。大于一个 chunk 的中文/emoji transcript 也成对验证，但不是任意编码/字节切分的穷尽证明。
- save 不覆盖已有非空 JSONL；只写非空 meta，不删除之前的 meta 文件。没有 meta 文件时 reload 可得 `meta === undefined`，不擅自补 `{}`。
- saveHistory 每次追加整个 history，重复调用会重复写，不改成覆盖/去重。
- transform 浅拷贝；时间戳 truthy 判定可能把 0 覆盖为 now，而 Manager 的 finite-number 判断会保留 0。usage/cache 字段转旧格式、cwd 的 summary/topic 排除、图片 blob、结构化输出/大文本 externalize 都保留。部分原对象 timestamp/output/嵌套 toolResult 会被修改。
- 原写锁 Map 存的是 `previous.then(() => gate)`，finally 却比较 `gate`，正常调用后条目保留；gate 仍在 finally 释放，IO 失败后下一次 append 可继续。保留测试与原内存保留行为，没有静默修复。
- Store 的 ID/path 接口是可信内部 API，不自带 middleware 的 ID 校验、通用路径沙箱或跨进程文件锁。审批也不是 OS sandbox。

## 验证与 SDK 接线边界

```sh
npm run smoke:session-stack
npm run verify:session-stack -w @axonfire/harness -- /absolute/path/codebuddy.js
```

48 组有限行为差分及 2 项真实 SDK 集成，共 50 专项。AST 验证覆盖完整类体/声明、factory、模块绑定；参考侧只替换并执行通过检查的原惰性声明，未运行应用入口。

真实 SDK 集成使用完整原 Manager/Store/Factory/DraftStore、已有已还原 AgentService/Runner/Read/历史 processors 和 owned 模型/文件，验证 Read→JSONL→新建原 Manager 的冷恢复续聊、真实 stream cancel 的 partial 文本落盘。验证器对原 Manager/Store/DraftStore 再各跑一次，两组成对比较；对比确定的类型/回复/副作用/用量等关键结果，不宣称随机 SDK IDs/metadata 全部等价。

现有 AgentService 额外调用 `ensureRunResultHandler`；测试 facade 仅把这个名字委托到原 `handleRunResult`，不加第二个 result consumer，也不改类体。这是明确的测试接线，不是完整原 AgentService/bootstrap。首次失败揭示了空 meta 冷加载与现有 HistoryAgentRunInterceptor 的不兼容；保留独立断言，成功用例显式 seed 非空 owned meta 并按入口顺序 save，不在原 Store 中补值。

测试中的权限初始化、HTTP attributes、Hook/checkpoint/队列注册、telemetry/galileo 边界是明确 doubles；图片/工具结果 blob 服务和文件系统是真实的还原实现/owned IO。作用域 LocalNoopTrace 防止测试产生线上追踪，不改全局 SDK processor。匿名 model-provider 初始化不伪造产品账户，也未调用生产 API。

OpenAI Docs 仅核对[SDK运行/流式与续跑边界](https://developers.openai.com/api/docs/guides/agents/running-agents)，还原依据仍为固定样本和锁定 SDK。下一步仍是完整原 AgentService/父 runtime 接线、HTTP Context→session middleware→View rendezvous、真实认证及默认入口迁移；Desktop HistoryStore/daemon/回放等也未因本批自动完成。

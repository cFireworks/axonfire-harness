# 原生内部会话入口

固定 WorkBuddy 5.3.14 CLI SHA-256 为 `4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd`。本批完整移植 `native-session-ingress.ts` 中的源声明，不执行应用 bootstrap、DI 或 HTTP decorators。

| 原组件 | 还原范围 | 关键依赖/边界 |
| --- | --- | --- |
| AgentController | 全部 3 方法、原 STANDARD_HEADERS | 注入 AgentManager、AgentService、SessionManager、logger |
| SessionFactoryImpl | 完整 create、2 个默认状态、runState 属性 helper | RxJS subjects、UsageUtils、PermissionUtils、abort/ID 与 sandbox store |
| SessionMiddleWare | 构造器及全部 17 方法、setupFired 静态值 | 原当前会话/存储、设置、权限、插件 barrier、Hook、目录信任等 |
| SandboxApprovalStoreImpl | 构造器及全部 4 方法、完整 key helper | 仅内存 session approval，不是 OS sandbox |
| 三个会话错误类 | 完整构造器与原消息 | 原 CustomError 由显式 common 依赖提供 |

合计 7 类、30 成员、10 完整声明、2 静态赋值、2 个自引用 var。常量记录原 UTF-16 偏移，不称其为字节偏移；没有冒充完整的 66545/6513/71915 聚合模块。

## 显式嵌入接口

```ts
import { createNativeSessionIngress } from "@axonfire/harness/sessions/native-session-ingress.js";

// sourceRuntime 必须提供完整所需的显式 modules/getModule，不使用安装应用账户。
const native = createNativeSessionIngress(sourceRuntime);
const sessionFactory = new native.SessionFactoryImpl();
const middleware = new native.SessionMiddleWare();
const controller = new native.AgentController();
// 原 DI decorators 不执行；由父 runtime 注入真实服务后才能调用。
```

工厂返回这 4 个类，错误类/helper 保持其原声明作用域。缺少依赖会明确失败，不会补空权限服务或“已登录”账户。一个父 runtime 应复用一个工厂闭包；每请求新建闭包会重置原类共享 `setupFired`，不是源语义。该接口不是新的默认 CLI/Web 启动器。

原 route 元数据为 `GET /internal/agent/models → getModels`、`POST /internal/agent → run`，POST 的 Body 参数是 0、Header 参数是 1；验证不执行 decorator。这里只记录/恢复入口代码，**没有新增 listener**。真实 HTTP path resolver、matcher、request context、连接 guard、安全 token 与认证仍需父 runtime 统一接线。不要把内部控制器暴露为无认证公网 API。

## 原行为保留

- `sessionId` 字符串优先于 `resume`；精确当前会话优先于磁盘；continue 无当前会话才读 most recent。未找到的显式 ID 可以新建，而字符串 resume 未找到会抛原错误。空 ID 的 truthiness 分支也保留。
- fork 的 resume/ID/continue 分支和校验次序保留；history/meta 浅拷贝，写入 forkedFrom，并 force save；不是深克隆。
- 工厂返回原 plain object，不是现有独立宿主的 HarnessSession。Usage 来自活动分支历史；seed history/queue/options/requestOptions 保留引用，abort/subjects/权限 context 独立创建。固定 RxJS 的 ReplaySubject(0) 实际仍缓存一条。
- runState setter 仅 status 或 lastTransition.at 改变时发布；同 status/time 的其他字段变化会被抑制，undefined 使用原默认值。
- 插件 refresh barrier 在目录信任之前；print/ACP 跳过目录信任。SessionStart Hook 不阻塞 handle；Setup 为类级一次性，执行前设置标志，失败记录且不重试。sessionStartReadyPromise 按 identity 清理，旧完成不会误删新 barrier。
- 原 Hook 的 `finally` 返回 Promise 没有被保存；若 SessionStart job 本身拒绝，仍可能出现未观察的 rejection。本批不改源方法，也未声称提供完整安全异步宿主。
- 权限模式按 override、显式/现有模式、dangerouslySkipPermissions/设置路径处理；Auto 仍要求 availability，设置 Auto 还要求允许授权的 scope。Plan 的 prePlanPermissionMode 只在源分支记录，不给 override Plan 补新逻辑。
- applyOverrideModel 总会赋值，undefined 也会清旧 requestOptions.model。Defer/NoDefer 的解析、补工具、warning 和非法 permission rule 的原错误文本保留。
- 控制器保留 print 等待和普通模式 setImmediate 不等待；maxTurns 仍直接 Number 转换。stream-json 非法行报错。标准 header 黑名单按小写匹配，自定义字段保留原大小写；全是标准 header 时不会清掉旧自定义 header。该黑名单**不是通用凭据过滤器**。
- getModels 去除顶层 url/apiKey，其余 metadata 保留，不能据此承诺递归清除秘密。模型枚举异常记录后返回空列表。

## 验证

```sh
npm run smoke:session-ingress
npm run verify:session-ingress -w @axonfire/harness -- /absolute/path/codebuddy.js
```

源码验证对全部完整声明/类体、静态配置、自引用、模块绑定、route 和参数位置核对 AST；参考侧只执行经校验的原惰性声明。44 组有限行为差分覆盖以上主要分支；另 2 项测试运行完整原 ACP Agent，验证匿名认证以及初始化失败在 REST/new-session rendezvous 之前拒绝。认证初始化和会话服务在这些组件测试里是明确的 owned doubles，不是原产品账户实现；没有读取账户、发生产请求或伪造登录成功。

本文件对应入口组件测试中的 SessionManager 仍是明确的 in-memory double，不冒充原实现。完整原 CLI Manager/Store 现已另行恢复并通过真实 SDK 集成，见[原生会话栈](native-session-stack.md)。已确认其同 ID 合并/异 ID 完成旧 subjects、空 meta 冷恢复等与现有独立宿主不同；只有继续接通原 AgentService、父 HTTP Context 和 Agent.setSession/View handshake 后，才能把这些入口称作完整新会话父 runtime。默认 CLI/Web、已有 ACP ViewHost、115 product prompts/22 Desktop 文本/6 JSON、SDK 依赖均未改写。

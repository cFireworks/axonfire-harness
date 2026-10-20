# ACP 协议核心：完整声明与接线边界

固定 WorkBuddy 5.3.14 CLI 样本 SHA-256：`4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd`。公开 catalog 的范围是 UTF-16 offset，不是字节位置；不分发整个 bundle，不执行它的 bootstrap。

本层已经恢复完整 `AcpAgentImpl`（95 成员）、`JsonStreamParser`（17）、`AcpView`（22）、`AcpTeamBridge`（21）、`DetachedMemberSseBridge`（13）、`AcpToolInterceptor`（28）、`TelemetryUtils`（9）和 `RequestError`（12）。合计 8 类、217 成员；另外 5 个完整惰性 factory 包含 Deferred、协议 DI tokens、W3C trace、历史 fork/用户 ID 查找及完整 ErrorUtils。业务函数、配置常量、内嵌文本均保留原声明，并对编译后的完整 AST 核对，不只截取几个方法比较。

## 现有可运行入口

普通 CLI/Web 与 Addon `.prompt()` 仍沿既有 SDK 宿主运行。`createAddonSession().promptAcp(...)` 仍是上一阶段的 ACP 输入组合入口，返回文本，不是完整 ACP RPC 服务。本阶段没有自动把完整 AcpView/Agent 注入这些默认入口。

完整协议类通过 `createNativeAcpAgent(runtime)`、`createNativeAcpView(runtime)`、`createNativeAcpPrimitives(runtime)` 导出。它们是供下一阶段接线的原始完整组件，不是“调用无参构造即可登录连接”的应用服务。`runtime.modules` / `runtime.getModule` 对应 catalog 中的源模块 ID；依赖缺失会明确报错，不以空服务或伪造通知补全。原实例的 DI、连接、广播、命令、会话、任务、审批、标题与遥测服务必须由宿主明确提供；这些 factory 不查找安装账户、不扫描真实用户目录、不启动后台传输。

`createNativeAcpPrimitives` 默认只提供从样本抽取的 RequestError，**不包含完整 ACP transport SDK**。读取 `AgentSideConnection`、`ndJsonStream` 等 transport 导出会报错；如有真实依赖，须显式注入 `runtime.modules[38113]`，返回的 RequestError 与协议使用的构造器保持同一引用。此 primitive loader 优先使用 modules 覆盖，其次自身已恢复 factory，getModule 只为未恢复依赖提供回落。OpenAI SDK 仍直接使用仓库锁定的 npm 依赖，没有复制或重写其 agent loop。

## 本阶段验证

```sh
npm ci
npm run check
npm run build
npm run smoke:acp-protocol
# 必须由调用方提供自己持有的固定原样本；公开仓库不附带它。
npm run verify:acp-protocol -w @axonfire/harness -- /absolute/path/to/codebuddy.js
```

36 组原声明/还原声明的有限差分使用同一显式测试边界，包含所有切分位置的增量 JSON、RPC 错误分类、tracking 优先级、W3C、mention、文件缓存、5 秒 ACK 超时、500 毫秒取消屏障、迭代器、busy queue、审批结果与竞争、compact/retry 抑制、团队终态与 idle 双重门槛。测试中的连接/审批客户端是 doubles，不是已经接通的原服务。

另一个集成测试使用真实 Agents SDK、既有 AgentService/SessionManager/TaskManager、owned 文件和离线模型，验证完整原转发器观察 Read 调用/结果、文本流、第二轮历史重放和订阅清理。该测试显式设置 fixture 的 bypassPermissions，避免两个审批 owner；这不是默认安全策略调整，也不证明完整 ACP 审批接线已经完成。

## 必须保留的源行为

- 会话通知最多等待 5000 毫秒；超时丢弃该通知，已取消时不发。View 的 abort 会抛 AbortError，Agent 的发送方法返回 false，不能统一改成同一结果。
- 取消后不足 500 毫秒（包括时间回拨导致负差值）短路执行；恰好 500 毫秒不在屏障内。
- busy prompt 走原 queued 分支；后台任务 drain 在调用模型前清空队列，失败不还原。
- prompt iterator 的 return 先退订，但后续 next 仍先返回已停放的项；不能擅自改成丢弃。
- 审批先等工具通知 ACK，再竞争客户端、abort 与本地决定；同一对象由 WeakSet 去重。退出 plan、权限拒绝取消通知和 Ask ID 的 512 上限保持原样。
- 旧 result、compact 内部 result 和重试 gate 不应提前结束；团队终态还必须满足源 session-idle 门槛。

这些是源控制流，不是所有行为都值得在新产品中照搬。保真与后续安全/可靠性改造应分开提交。

## 尚未完成

完整 RPC/NDJSON/HTTP/连接 guard、广播和 usage/title/friction 等服务的生产接线；CLI/Web 与 ACP 审批 owner 切换；完整 Desktop SessionManager/HistoryStore/Plan 重放；daemon 动态配置与自动重启；真实认证、BinaryManager 和外部 Docs 引擎仍待继续。完整类体 AST 相同与有限测试通过，不构成整个 harness 的 100% 等价证明。

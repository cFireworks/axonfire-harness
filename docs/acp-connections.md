# ACP 连接、Stream 与样本 SDK

本阶段恢复完整的连接组件和样本内修改版 ACP SDK，不替换 OpenAI Agents SDK，也不切换默认 CLI/Web、Addon.prompt 或 promptAcp。现有开箱即用入口仍是 `npm ci && npm run build && npm run demo`。本页的 ACP 组件是显式嵌入接口，尚不是独立可用的原产品 ACP 业务服务器。

## 源码与接口

固定 WorkBuddy 5.3.14 CLI SHA：`4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd`。源码 catalog 偏移均为 JavaScript UTF-16 索引，不是文件字节。

`src/protocol/native-acp-connections.ts` 提供 `createNativeAcpConnections(runtime)`：

| 完整原类 | 成员数 | 范围 |
| --- | ---: | --- |
| AcpAgentManagerImpl | 7 | 连接 Agent Map、删除与 Delegate 清理 |
| AcpServerImpl | 5 | transport 订阅、AgentSideConnection、断连历史 flush |
| AcpContextImpl | 3 | ACP mode |
| AcpController | 4 | GET / POST connect / POST / DELETE |
| AcpTransportManagerImpl | 4 | 创建、重复 ID 拒绝、关闭 |
| AcpTransportImpl | 6 | stream 与 connectionId，原 init/close 空方法 |
| AcpTransportFactoryImpl | 1 | stream 创建与 transport 绑定 |
| AcpStreamManagerImpl | 38 | stdio、HTTP SSE、RPC 路由、背压、超时与取消回收 |
| AcpConnectionGuardImpl | 10 | 容量、token、TTL、死连接和空闲淘汰 |
| AcpSecurityMiddleware | 6 | CORS、loopback、认证与 token 检查 |

共 10 类 84 成员，另 16 完整函数、4 初始化值、6 个类外静态赋值及原 `var eG` 自引用。保留匿名赋值类的构造器名 `eG` 和完整声明 AST，不改为一个相似的新类。HTTP 装饰器不执行，但四条路由、controller prefix、目标方法以及 POST 的 `@Body` 参数零由原注解核对：

| Method | Path | 原方法 |
| --- | --- | --- |
| GET | /api/v1/acp | get |
| POST | /api/v1/acp/connect | connect |
| POST | /api/v1/acp | post |
| DELETE | /api/v1/acp | delete |

`runtime.modules/getModule` 按 catalog 提供 RxJS、node:stream、HTTP Context、crypto、ContainerUtil、协议与 Logger 依赖。stdio 必须显式提供 `runtime.stdin/stdout`；默认不读取真实终端。DI 属性赋值、init/setup 和真实 Agent 工厂仍由宿主负责，不能缺少依赖时注入空业务服务。

## 修改版 ACP SDK 与 Zod

样本 manifest 标注 `@agentclientprotocol/sdk 0.25.0`，但其完整 factory 38113 包含产品扩展，不能根据版本号断言 stock npm 包等价。`src/vendor/captured-acp-sdk.ts` 保留该完整惰性 factory：5 类、88 成员、6 个完整顶层函数和内联 schema；不执行应用 bootstrap。导出 ClientSideConnection、TerminalHandle、PROTOCOL_VERSION、ndJsonStream、RequestError、AGENT_METHODS、AgentSideConnection、CLIENT_METHODS。

```ts
import { createCapturedAcpSdk } from "@axonfire/harness/vendor/captured-acp-sdk.js";
import { createNativeAcpPrimitives } from "@axonfire/harness/protocol/native-acp-primitives.js";

const sdk = createCapturedAcpSdk();
const primitives = createNativeAcpPrimitives({ modules: { 38113: sdk } });
// primitives.protocol.AgentSideConnection / ndJsonStream 使用完整样本 SDK；
// 协议与 sdk.RequestError 保持同一构造器引用。
```

旧 primitive loader 的无参默认值仍仅提供 RequestError，避免静默改变此前嵌入契约。上面只是依赖组合，不会启动监听、登录、创建模型客户端或读安装账号。

原 factory 25223 的 Zod core 实际是 **4.0.0**，不是项目根 `zod 4.3.5`。`acp-zod-runtime.ts` 从现有锁定的 `zod3@3.25.67` 依赖加载其 v4 子目录，隔离该旧包内部裸 `zod/*` 自引用，限制在该包根目录内解析；断言包版本和 core ABI。没有复制整个 Zod 库、修改 node_modules、升级依赖或影响 OpenAI SDK 的 Zod。源码差分参考侧执行完整原 Zod factory，而非复用移植侧 npm runtime。

## 保留的原行为与所有权

- 默认连接上限 32、token TTL 86400000ms；`CODEBUDDY_ACP_MAX_CONNECTIONS` / `CODEBUDDY_ACP_TOKEN_TTL_MS` env 优先于 gateway.maxConnections/tokenTtlMs，最小 TTL 60000ms。原数值转换仍接受部分小数和 Infinity；过期条件为 `now > expiresAt`，活动更新不延长 expiry。容量检查先于同 ID 替换；忙连接不淘汰，死连接可绕过 5000ms 空闲宽限。
- POST 同时要求 Accept 包含 application/json 和 text/event-stream，Content-Type 包含 application/json。initialize 标志在 SDK schema 校验前置 true；失败后再次 initialize 仍被原逻辑拒绝。RPC id 0 有效，批量 stream 等待所有 ID 回复。
- 背压等待 drain，并移除临时 close/error/drain listener；write/flush 失败返回 false。若没有 drain/close/error，原等待本身没有额外超时。
- prompt idle timeout 为 1800000ms；POST heartbeat 为 30000ms，心跳本身也会续 idle deadline。客户端审批请求暂停 idle timer，任意客户端 POST 活动恢复；不能宣传为硬 30 分钟执行上限。
- cancel grace 为 5000ms，orphan sweep 输出正常 `stopReason: cancelled`；无心跳的 idle reclaim 输出 -32800。原首个 orphan sweep 会清其他 in-flight 标记但留下它们的 POST stream；保留并测试该不一致，不在源类中修正。
- `AcpServerImpl.stop()` 只清 mode/running/Agent Map，保留 transport 订阅。原 transport.close 为空，StreamManager.close 不结束 incoming ReadableStream；独立宿主必须关闭自己拥有的输入/controller、HTTP listener、SSE response 和定时器。测试显式完成这些回收，不能把 stop 返回当所有资源已释放。
- 原安全 middleware 缺少 auth/CORS/guard 依赖会直接 next，loopback 会绕过认证/token。这里不提供默认公网 listener，也不把该组件称为完整认证；不能直接接公网或反向代理。已有 Web 宿主自己的 loopback/Host/Origin/CSRF 保护保持不变。

## 验证与未完成范围

```sh
npm run smoke:acp-connections
# 原样本不随仓库分发；需要固定 SHA bundle
npm run verify:acp-connections -w @axonfire/harness -- /absolute/path/codebuddy.js
```

29 组连接组件与 9 组 SDK/Zod 有限行为差分，共 38 组；完整类/函数/初始化/静态配置/路由及 SDK factory 另做 AST 核对。专项 41 项，额外三项经真实 owned PassThrough stdio 和 127.0.0.1 Node HTTP 运行原 Server/Controller/Stream 与完整 SDK，验证 UTF-8、双向 permission、独立 GET 通知和 DELETE。组件测试的业务 Agent、认证、终端、文件与模型均为明确 doubles，不读取安装账户、不连接原生产服务；它们不等于完整 AcpAgent/AcpView 业务链已接入 RPC。

尚需完整 Agent/View.render 迭代生命周期、默认审批 owner 的单一归属和实际入口切换、真实认证/完整网关服务、request-send telemetry/标题 Hook、Desktop SessionManager/HistoryStore/Plan 回放与 daemon 动态模式回收。源码声明恢复、有限差分和本地传输通过均不等于整个 harness 已 100% 还原。

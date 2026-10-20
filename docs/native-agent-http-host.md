# 可复用原生父 HTTP 装配

`createNativeAgentHttpHost` 把原先只存在于父链测试 helper 中的监听、路由装配与传输所有权移到 `src/http/native-agent-http-host.ts`。它不导入 `scripts/`、`test/` 或原 bundle，可以作为公开运行时模块使用。它是明确新增的父装配桥，不是声称已找到并恢复整个产品 bootstrap。

## 实际执行的原组件

沿用完整原 HTTP/CLS runtime：RouteBuilder、RouteProvider、RouteMetadataMatcher、八种参数 resolver、三种响应 resolver、MVC adapter、ViewResolver/Provider、HttpMiddleware、Dispatcher、MiddlewareProvider 和 HandlerExecutionChain。没有用测试 JSON view 替换 ACP View。路由及 Body/Header 参数来自此前逐项核对的 `SESSION_INGRESS_CONTROLLER/ROUTES/PARAMETERS`：`POST /internal/agent` 与 `GET /internal/agent/models`。

元数据只存于每个宿主的 WeakMap，经显式 Reflect 入口供原 RouteBuilder 读取，不污染全局 Reflect 或第三方类。先等待原 builder.build，成功后把本次结果交给原 provider.init/provide；这是为了收拢原 init 中没有 catch 的 fire-and-forget Promise，不直接 resolve 原 ACP sessionDeferred，也不改业务类体或路由规则。

调用方必须借入真实 controller、session middleware、View、pipeManager、error handler 和 EndpointProvider。原 SessionMiddleWare 继续负责会话创建/加载/激活，原 AcpView 继续是调用 Agent.setSession 的唯一交接点。完整父链的测试已从 `nativeHttpFixture` 改为使用这个公开宿主；其 12 种 Read/Write/Ask/Plan 场景及 4 冷恢复、4 异常入口，也在第65/67组中与完整原参考图成对运行。

## 嵌入接口

```ts
import { createNativeAgentHttpHost } from "@axonfire/harness/http/native-agent-http-host.js";

const http = createNativeAgentHttpHost({ logger });
// 用 http.native.getModule(47005) 向原会话栈注入同一个 Context，
// 并向原 REST factory 的底层 client 注入 http.post。
const origin = await http.start({
  controller, sessionMiddleware,
  views: [rendezvous.view], defaultViewName: "acp",
  errorHandlers: [cliServerErrorHandler], pipeManager,
  endpointProvider,
});
// origin 仅为本次监听地址；原 EndpointProvider.setServer 已在 start 中调用。
// 原 ACP initializeSession 仍走自己的 endpoint/REST/HTTP/View 交接。

http.stopAccepting();
await rendezvous.close(); // 先收尾借入的 SDK/iterator/View 操作
await http.close();
// 再关闭借入的 services、ACP streams、会话栈和认证等父资源。
```

这是嵌入示例，不是无需依赖即可启动的完整父入口。完整默认 AgentService/会话/认证/配置等装配仍须继续从测试边界迁到公开运行时；普通 CLI/Web 仍使用已有可用宿主。`GET models` 的序列化也由借入 View 决定，不在这里补造产品 JSON 模板或绕过 ViewResolver。

## 新桥的本地策略与所有权

- 只监听随机 `127.0.0.1` 端口（可显式指定 port）；默认 JSON body 上限1 MiB，可用 `maxBodyBytes` 配置。这些是新桥的选项，不伪称原 `Value` 配置或原产品默认值。
- 同时要求原 `x-codebuddy-request: 1` 和随机本机 capability。后者不是产品账户 token，默认32随机字节，不暴露在返回接口。显式 capability 至少32个可见ASCII字符。此本机保护不等于生产鉴权或完整网络安全证明。
- `post` 只允许当前宿主的精确 internal agent URL；拒绝其他origin/path、URL凭据、query/fragment，禁止跟随redirect。它向真实 HTTP 发JSON，并独立覆写本机授权头；原 REST factory、CliRuntimeOptions 和业务调用不改写。不接受外部 URL，也不默认访问安装账户或远端模型。
- 请求在原 MVC 前进行有界JSON解析；错误媒体415、无效/非对象JSON400、过大413、未授权403、非路由404、停止准入503。这些是新增 Node adapter 的行为，不宣称与尚未完整恢复的产品 Body/Cookie/HTTP Session 服务完全等价。query 使用本桥的简单键值投影，非完整 Express query 语义。
- 运行中的原 render/HTTP可能在 ACP newSession 返回后仍未结束。`stopAccepting` 不取消借入的 View/SDK，也不强制 state idle；调用方先收尾借入操作，再close监听、待决IO、请求解析和自有 namespace hooks。重复close共用一个Promise，关闭后不得重启。
- 启动失败（路由构建、端口占用、EndpointProvider失败）自动回滚监听/namespace。与start并发的close不会在其后重新发布running状态。借入的endpoint或View若不结束，宿主不能凭空取消它们；调用方仍必须提供可收尾的依赖。

OpenAI Docs仅用于核对[流式运行需要等待settled以及审批从原state续跑](https://developers.openai.com/api/docs/guides/agents/running-agents)，没有把HTTP就绪当成SDK完成，也没有换成托管Agents API或升级锁定SDK。

## 验证范围

新增15项独立测试：真实监听/原MVC和参数、原GET路由、并发原CLS、双重本机准入、JSON/媒体/大小边界、禁止外部传输、路由/动词边界、原error handler、路由失败/绑定失败/endpoint失败回滚、start-close竞态、两阶段关闭及半截请求体回收。独立测试的JSON view/controller是显式测试适配器；原ACP父链集成则借入完整原Controller/Ingress/View和真实SDK，不以这15项代替核心来源验证。

REA对公开宿主和改接后的父链两份惰性源码给出 `ev_b0aea3f15293ce0da56b4cb9c2abbef1ccb6f0d13869afb68b5a1230383f5421`：9433 AST nodes、2 parsed、0 skipped/parse failures；750 semantic/每文件750、150 unknown/每文件150、45秒限制下仍partial/truncated。没有执行原bootstrap，静态证据不证明完整运行时等价。

剩余：完整默认native父配置与启动入口、真正独立OS进程的恢复/daemon、生产auth/REST、原JSON/验证/pipe/Body/Cookie等宿主、跨cwd/全部配置模式、Desktop HistoryStore/回放。不能以本桥或可编译启动宣称整个harness100%还原。

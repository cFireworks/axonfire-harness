# 原生 HTTP / MVC / CLS 请求链

固定 WorkBuddy 5.3.14 CLI SHA-256：`4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd`。源码位置使用 UTF-16 偏移。`native-http-runtime.ts` 保存完整声明/惰性 factory，不执行原 DI decorators 或应用 bootstrap。

## 源码范围

| 部分 | 完整恢复内容 |
| --- | --- |
| HTTP 分派 | MiddlewareProvider、DispatcherImpl、HandlerExecutionChainImpl、HandlerMappingImpl、RequestMatcherImpl、HttpMiddleware、PathResolverImpl |
| Trace / 错误 | TraceMiddleware、TraceIdResolverImpl、TraceIdProviderImpl；Abstract/Default/Http/ValidationErrors handler 与 ErrorHandlerProvider |
| MVC 路由 | MvcHandlerAdapter、RouteMetadataMatcherImpl、RouteBuilder、RouteProviderImpl |
| 参数 / 响应 | MethodArgsResolverProvider、全部 8 个参数 resolver、ResponseResolverProvider、Session/Cookie/HeaderResponseResolver |
| View | ViewResolverProvider、ViewResolverImpl、ViewProvider |
| 完整依赖 factory | BaseContext、WebContext、Node async_hooks CLS、emitter-listener、shimmer、UrlPattern、compose、Express 转换 helper、Deferred、CustomError、ErrorUtil、UrlUtil、Prioritizeable、metadata helpers、HTTP 类型/枚举/tokens/headers 等 |

主要范围共 **35 类 / 75 成员、37 个完整声明、2 个 CJS 常量赋值、39 个完整 factory**。factory 内的 Context/Namespace 原型方法等由整个 factory 核对，不与 35 类重复计数。保留 `PATH_PARMAS_ATTR` 的原拼写。

CLS 使用样本中 Node >=8 的完整 `async_hooks` 分支（63192），不是 AsyncLocalStorage 近似；项目要求 Node >=22.19，不恢复 Node <8 分支。聚合模块提供明确的局部投影，并不声称其全部代码已恢复；找不到外部依赖时明确抛错。REST client、DI 容器、完整验证/pipe、Body/Cookie/HTTP Session 服务仍需父 runtime，不以空对象补成产品服务。

## 原配置项

以下 6 个 `Value` 注入的表达式、来源绑定和目标属性独立对照原样本；只恢复键，**未推断完整默认配置值**。

| 组件属性 | 配置键 |
| --- | --- |
| RequestMatcherImpl.cacheSize | `cell.web.route.cacheSize` |
| PathResolverImpl.serverPath | `cell.server.path`（原 `SERVER_PATH`） |
| TraceMiddleware.traceField | `cell.trace.responseField`（原 `TRACE_ID_RESPONSE_FIELD`） |
| TraceIdResolverImpl.traceField | `cell.trace.requestField`（原 `TRACE_ID_REQUEST_FIELD`） |
| MvcHandlerAdapter.mvcPath | `cell.mvc.path`（原 `MVC_PATH`） |
| ViewResolverImpl.defaultViewName | `cell.mvc.defaultViewName` |

`host.configuration` 返回实际键值，供父宿主显式注入；不会自动读取全局配置或安装账户。

## 显式宿主与所有权

```ts
import { createNativeHttpHost } from "@axonfire/harness/http/native-http-host.js";

const host = createNativeHttpHost({
  modules: { /* 真实所需的父服务；不是产品 bootstrap */ },
});
try {
  await host.run(request, response, async (context) => {
    // 原 Context 已进入真实 CLS；注入好的 dispatcher 在此执行。
    await dispatcher.dispatch(context);
  });
} finally {
  await host.close();
}
```

这是接口示意，`request/response/dispatcher` 均由嵌入者提供，不是无配置可启动的 server。开箱即用仍使用根目录 `npm run demo` / `npm start`；新增核心不会自动替换默认 Web 的 Node HTTP 宿主。

每个父 runtime 复用一个 host / native factory。它为原 CLS 提供独立 `process` facade 和 namespace registry、真实 Node 内建依赖及自有 hook 跟踪，**不覆盖真实 `process.namespaces`**。`run` 借用原 `namespace.runAndReturn` 保留同步返回/异常和 Promise；原 `Context.run` 仍返回 undefined，不改为 awaitable。host 不自动创建 HTTP Session，也不把 HTTP Session 当作产品账户。

close 拒绝新 run，等待所有 run 返回的 Promise，再禁用自有 hook、释放自有 namespace；构造中途失败也回收已创建 hook。没有等待由调用方另起且不返回的任意后台任务，没有关闭借用的 listener/response/父服务。父宿主应先停接收，等待业务任务，再关闭该 host。源码原 `destroyNamespace` 只 tombstone、不 disable hook 的行为不改，由宿主 close 补充自己的资源回收。

## 保留的行为

- 原 Request/Session/Application scope 的真值 fallback 和 Application 值 0 的差异；缺少 HTTP Session 会抛错，不自动造会话。
- 原 compose 洋葱顺序、重复 next 拒绝、同步返回/异常与原 handler matching/error fallback 顺序。
- 原优先级只接受正数、稳定排序和 provider 缓存。正则 route 的 specificity 为负，随后被原 Prioritizeable 过滤掉；测试保留该缺陷，不补路由。
- path 前缀用 startsWith；请求 method/cache/编码参数和 UrlPattern 的正则 match 数组保持原样，不改为统一对象。
- RouteProviderImpl 必须由父 runtime 调用原 `init()`（原 PostConstruct 未执行）。该方法不返回 build Promise、没有 catch；成功前 provide 一直 pending。重复 init 可更新内部 route，但同一个 Deferred 的 provide 仍保留首次 resolve 的结果。
- ViewResolver 会修改 model 的默认 view/header；MVC 的 falsy model 不渲染 view，但仍执行 response resolvers。错误 view 的原继承关系、response/end/skip 和 trace header 顺序不重写。
- 原 runPromise 无效返回路径可能留下 active context；组件测试显式清理，不修改其方法体。

UrlPattern parser 的原 EmptyStatement 也在完整 AST 比较范围内；该 factory 使用局部 prettier-ignore 保留，未通过放松 AST 校验隐藏格式化差异。

## 验证与真实 SDK

```sh
npm run smoke:native-http
npm run verify:native-http -w @axonfire/harness -- /absolute/path/codebuddy.js
```

34 项专项：32 个有限组件场景，加 2 项真实 Node HTTP + 固定 SDK 集成。第 63 组源码验证核对完整声明/类体/factory/绑定、CJS 原导出及 6 个配置注入，原片段再跑相同 32 + 2 组成对比较；不执行 bundle bootstrap。

真实 HTTP 集成仅监听随机 `127.0.0.1` 端口，测试自有 capability 在解析/分派前拒绝未授权请求。原 CLS → 路由构建/provider.init → middleware/参数 resolver → 完整原 SessionMiddleWare/Controller → 完整 AgentService/Manager/Store/Runner/Provider → 真实 npm SDK → Read 自有 UTF-8 文件 → JSONL → 第二轮回复。冷恢复模式使用全新原 Manager、空当前会话、直接从 owned 磁盘恢复，不预加载会话/填假 meta。SDK 模型回调实际读取请求头，依次为 `0, 0, 1`，验证 Read 后续模型调用和下一 HTTP 请求保持各自 CLS。

JSON view、Node JSON parser、pipe、权限/Hook/认证 initialized/telemetry 外缘是明确的测试适配器；模型为自有确定模型，未使用线上密钥。capability 不是原产品登录，JSON view 不是原 AcpView；参考侧替换完整原 HTTP、AgentService/utilities、Runner 片段，既有已校验的 session/ingress 依赖共用，不声称重放整个原应用。

REA 6.7.0 对 runtime/host 两份惰性源码的静态证据：`ev_8f8888af45c45262d005a3ccb4af4f9a06b99e861e6e82afa97ef8930b2570da`，16361 AST nodes、2 parsed files、0 parse failures；750 semantic nodes / 每文件 750、150 unknown / 每文件 150、45 秒限制，仍 partial/truncated。静态分析不是运行时整体等价证明。

OpenAI Docs 仅核对 [SDK 应用上下文和模型输入边界](https://developers.openai.com/api/docs/guides/agents/define-agents)；原逻辑和 SDK 版本仍以固定样本/依赖为准，不按现行文档重写。

下一步仍是原 `Agent.setSession` / AcpView 新会话 rendezvous、父资源所有权、实际 AuthenticationManager/网关及完整默认启动切换。Desktop HistoryStore、daemon 重启、Ask/Plan 回放、request-send 服务和外部 Docs 引擎等仍未完成，不能据本阶段称整个 harness 已 100% 还原。

# 原认证管理器与 provider 链

固定 CLI SHA-256：`4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd`。`src/auth/native-authentication.ts` 保存完整原类体与业务声明，不执行 DI decorators 或应用 bootstrap；偏移为 UTF-16。

原 ACP `initializeSession` 首先等待 `AuthenticationManager.initialized`，没有当前账户即拒绝，之后才发内部 HTTP 并等待 `Agent.setSession`。本阶段恢复这个前置依赖，**不通过预填“已登录” Subject 跳过门槛**，也不把模型 API key 当成产品账户。

## 范围

| 完整原类 | 原模块 / 成员数 |
| --- | --- |
| AuthenticationManagerImpl | 52521 / 25 |
| ExternalLinkAuthenticationProvider | 7327 / 25 |
| UserInfoContextVariableResolver | 78850 / 3 |
| AuthenticationHttpInterceptor | 34047 / 4 |
| DefaultAuthenticationStorage | 26968 / 5 |
| CustomTokenAuthenticationProvider | 15064 / 6 |
| CustomTokenAuthenticationStorageImpl | 40544 / 12 |
| WxAuthenticationProvider | 13832 / 14 |

合计 **8 个主要完整类 / 94 成员、44 个完整业务声明/表达式、3 个非 DI declarator**（self alias / enum alias / import interop），不把拆出的 declarator 称作完整原多变量声明。外部链接的 callback revision、license code enum/Set、全部 helper 和原导出赋值一起保留；manager 原 `MIN_REFRESH_DELAY_MS=15000` 独立赋值也核对。

15 个完整惰性 factory：67865 认证协议/tokens/headers/7 个错误类、63525 账户归一化/快照/匹配、54194 SubscriptionManager/DisposableComponent、66629 原异步调度、15694 原取消、96771 Emitter、74525 Event/CallbackList、5935 Disposable、44943 AIError/NotFoundError、8461 Deferred、26052 CustomError、99600 Prioritizeable、79845 AuthenticationType、55114 完整 ProductFeature/FeatureToggle、93280 ErrorUtil。factory 内的类不重复计入上表。

`51147` / `9151` / `17237` 仅投影已恢复的错误/枚举/ErrorUtil，不冒充整个聚合模块。原 ProductEnvService 已在此前环境模块恢复，此处不重复移植，不包括 IDE 原磁盘账户存储、登录 UI、真实 REST client 或完整产品 DI。

## 保留的状态与原差异

- doInit 先选择/缓存 storage，订阅存储更新，restore 后发布当前会话，再 resolve initialized。`init()` 是原 fire-and-forget；doInit 失败只记录日志，**不会 reject 或 resolve initialized**，不能在父入口假装初始化成功。
- storage 更新用 token 存在且完整 JSON 字符串相等才去重；重复 anonymous 不去重。环境切换/发布/刷新/产品 sync 依原 storageSessionRevision 检查排序。登录、登出、刷新和切账户分别保留原 authOperation/loginAttempt/committedLogin revisions，不简化为单个 busy 标志。
- 登录竞争先取消旧 sign context；旧 provider 迟到的成功不能提交。持久化串行 tail 同时接成功/失败回调，失败不堵后续任务。beforeStore/afterStore 和 logout marker 的原提交检查保留。
- logout 先使操作失效/取消 refresh/sign，再串行 beginLogout、尝试 remove、clean；clean 返回 false 时原 current Subject 可以保留，但 loggedOut 已为 true。dispose 完成 subject/订阅、取消自有 refresh timer；不等同于能取消所有借用网络请求。
- refresh 保留 30 秒 cooldown，WorkBuddy 缺 allAccounts 的 metadata 恢复例外、accountSwitch/refresh in-flight 检查、原 uid 与 idp 合并。非立即刷新使用原随机间隔并设最小 15 秒；失败的退避/次数与 Unauthorized 不重试保留，不换成新重试器。
- 默认 storage 只在内存保存，store/restore/clean 都发原 Subject。它不是原产品磁盘凭据库。
- custom-token 的 `CODEBUDDY_AUTH_TOKEN` / ACC env / spilled config 是 priority 信号；restore 真正读取 **合并后的 product authentication.attributes.token**，不直接用信号 token 冒充已合并配置。产品 config 单独有 token 但没有这些信号时也可能 priority=0；原 `store/clean` 是空方法，不能称其为持久化或 token 撤销。
- JWT 使用外部 `jsonwebtoken.decode(...,{complete:true})`，不是验签。sub/nickname/preferred_username/iss 的 sso 企业/domain 投影、显式 enterpriseId 优先和原 `0x1d1a94a1fff` 时限保持。JWT 库没有复制到本项目，使用时由父模块 94959 明确提供。
- 外部链接保留 300 秒总 timeout、1 秒 polling、原 token/account retry codes、account HTTP 401/403 的五次重试、license/IP 错误、platform/launch_schema whitelist/version/loginSessionId 和 browser=false 继续 polling。callback revision 防止旧登录清掉新 callback；未添加额外重试。
- HTTP interceptor 的 skip/no-auth/no-user/enterprise/department flags、Tenant/Domain 注入、401 token 匹配、产品 endpoint/override 与路径白名单保留。endpoint 用原 startsWith，**不是安全 origin 校验**；拦截器也不是通用秘密过滤器。不要把它直接用作跨 origin 认证边界。
- Wx provider 保留原 tmpcode 请求、启用账户筛选和日志（包含 tmpcode 的原 console.error）；真实 IDE 动态 require/服务仍需显式提供，不声称已恢复原登录环境。

## 显式嵌入与默认入口

```ts
import { createNativeAuthenticationRuntime } from "@axonfire/harness/auth/native-authentication.js";

const common = {};
const native = createNativeAuthenticationRuntime({
  process: { env: ownedEnv },
  modules: { 80699: common, /* RxJS、HTTP headers、遥测及所需外部库 */ },
  require: ownedRequire,
});
Object.assign(common, native.core);
const Manager = native.getModule(52521).AuthenticationManagerImpl;
const manager = new Manager();
// 父 runtime 显式注入 product/env、providers/storages、trace/logger/notifier 等后再调用原 init/doInit。
```

这是接口示意，不是无需依赖即可启动的认证 server。`native.getModule` 惰性解析，`native.classes` 会加载全部恢复 scope，因而要求其外部依赖齐备。默认 env 为空，动态 require 缺失会明确失败；缺依赖不会偷偷读取真实 process.env/安装账户或打开系统浏览器。调用方提供的 adapters 是受信任代码，不是 OS 沙箱。

当前 CLI/Web 仍经已有 standalone 宿主正常启动，没有切换默认产品认证或接通生产登录。后续原 `Agent.setSession` / AcpView 新会话 rendezvous 已接通完整父链，且[公开认证父宿主](native-authentication-host.md)现拥有实例创建/资源回收，并与真实Product配置合并验证；生产 REST/磁盘 auth storage、默认完整 bootstrap 仍待继续，不能将完整认证类等同于整个认证/父 harness 已完成。

## 验证

```sh
npm run smoke:authentication
npm run verify:authentication -w @axonfire/harness -- /absolute/path/codebuddy.js
```

36 项专项：34 个有限组件场景、1 个真实 owned loopback HTTP 登录/刷新/登出、1 个完整原管理器与原 ACP 的匿名门槛。第 64 组 verify 对所有类体/业务声明/非 DI declarator/CJS 绑定/完整 factory 做 AST 对照，再装入原片段成对比较相同场景；ACP 参考侧也替换完整原 Agent/View/primitive，不执行 bundle bootstrap。

HTTP 集成在随机 `127.0.0.1` 端口，以原 ExternalLink provider 请求 state→token→account→accounts，原 Manager/DefaultStorage 提交，再刷新和登出。remote 协议、capability、REST/URL opener、Product/telemetry 是明确的 owned adapters；账户由原 provider 响应路径产生，不预填 auth Subject，不是产品账户/生产认证。组件里的 JWT decoder、IDE、spilled 文件也是明确 doubles，不把它们算作外部库/真实 IDE 已验证。

REA 6.7.0 整文件 TS 与编译 JS 分析均遇到 `Maximum call stack size exceeded`，对应证据 `ev_05883e955f07910d921b04e7dbb5854184c5d6d52d19e3deea1b78bf0ac20911` / `ev_18fc9afde042ca8a15eeb221ce97415ef7890ee2d254332554ce93f2835d3de4`：各跳过 1 文件，不能称其“已成功分析”或以 parse_failures=0 掩盖跳过。

随后只从最终编译文件按完整 8 个 scope 函数、15 个 factory 提取 23 个惰性语法单元，不执行或改写业务体。拆分静态证据 `ev_db867704bd54dfe5e1efcdf5dcef4439ad343b1aba78286a1247ea79093c5754`：23 parsed files、19306 AST nodes、0 skipped / parse failures。750 semantic nodes / 每文件750、150 unknown / 每文件150、45秒限制下仍 partial/truncated；拆分不提供整个闭包/父 bootstrap 的完整跨单元关系证明。完整公开文件另由 AST/成对运行校验，不用拆分图替代。

OpenAI Docs 仅核对 [SDK 运行与恢复边界](https://developers.openai.com/api/docs/guides/agents/running-agents)，不更改 SDK 0.5.2、会话原语或本地产品认证。本文不宣称有限差分证明整个产品等价。

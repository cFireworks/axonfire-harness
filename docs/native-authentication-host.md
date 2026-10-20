# 公开原认证父装配

`createNativeAuthenticationHost` 把完整原 AuthenticationManager、DefaultStorage、CustomTokenStorage/Provider、ExternalLink/Wx Provider、UserInfoResolver 和 HTTP interceptor 的实例装配移到 `src/auth/native-authentication-host.ts`。它不是新的认证实现：94 个原成员、协议和业务 factory 仍来自 `native-authentication.ts`，本次没有修改核心类体、Prompt、产品配置或 SDK 依赖。

## 显式接入

```ts
import { createNativeAuthenticationHost } from "@axonfire/harness/auth/native-authentication-host.js";

const auth = createNativeAuthenticationHost({
  runtime: {
    process: { env: explicitAuthEnvironment },
    modules: explicitParentModules,
    require: explicitDependencyResolver,
  },
  dependencies: {
    logger, productManager, productEnvService, eventService,
    traceService, notifier, filePathService,
  },
  providers: explicitAuthenticationProviders,
  beforeClose: () => stopThisParentsBorrowedAuthOperations(),
});
const custom = auth.createCustomToken();
// 创建不隐式注册、不登录；须在第一次 storage/provider 选择之前接入。
auth.manager.authenticationStorages.push(custom.storage);
auth.providers.push(custom.provider);
const external = auth.createExternalLink({ clientInfoProvider, externalUriOpener, restOperations });
// 外部 provider 同样需要调用者明确注册，且配置须真正支持该类型。
const interceptor = auth.installHttpInterceptor(restOperations);
await auth.start();
// auth.manager.initialized 是原来的 Promise，不替换成桥自己的成功/失败屏障。

// 先停止借入 View/SDK 等认证消费者，再关闭 auth；共享 product/REST 最后由其 owner 释放。
await auth.close();
```

示例是嵌入接口，不是免依赖生产登录脚本。原 JWT decode、遥测、HTTP headers、URI/IDE/产品服务等依赖必须明确提供；惰性 classes 只加载访问到的原 scope，不为构造匿名 Manager 而伪造 JWT 或 IDE。`runtime.modules[80699]` 用独立 overlay 补齐已还原 core，不覆写借入 namespace；原 receiver、参数及开放时方法返回值保留。

默认 storage 是完整原内存 DefaultStorage，不是安装账户库。默认 providers 为空，不自动发现安装目录、读取真实 process.env 或创建已登录 Subject。创建 custom/external/Wx 不等于加入 provider registry；原 storage/provider 选择仍有缓存，不能在首次解析后靠修改数组冒称重新选择。借入 adapters 是受信任代码，不是安全沙箱。

## 保留的业务边界

- `start()` 调用原 `init()`，被动观察它实际启动的 `doInit()`。原初始化失败只记录 warn、原 `initialized` 继续 pending；桥的 start 可以拒绝，但不能伪造原 barrier 的成功或拒绝。原 doInit 的迟到 restore/发布顺序也不重写。
- `CODEBUDDY_AUTH_TOKEN`、ACC V2/V3 或 spilled 配置是 custom storage 的优先级信号；真正 restore 的 token 来自 `productManager.waitConfiguration(true)` 合并后 authentication.attributes.token。产品配置里单有 token、没有原信号时不擅自提高优先级。JWT 是原 decode 投影，不是签名验证或产品服务鉴权。
- provider 的重试、300000ms race、browserOpened=false 时的 OpenExternalLinkError 重分类、刷新/退避与 revision/持久化 gate 均由原类决定。桥不缩短原等待、不把错误换成匿名成功。
- HTTP 安装记录原 `initialize()` 在 request/response registry 返回的 ID，关闭仅 eject 本次 ID。原 headers/401/白名单和 endpoint.startsWith 误匹配细节保持；这不是安全 origin 检查，也不是通用秘密过滤器。必须使用支持 use/eject 的明确 registry。

## 所有权与关闭

公开 facade 关闭时拒绝新操作，允许之前接受的内部异步链收尾。宿主被动记录自己的原方法 Promise、产品配置/URL opener 订阅、timeout/interval、HTTP ID 与自有 Subjects，不接管共享产品、REST、浏览器或 IDE 的生命周期。

先调用原 Manager.dispose：它使旧 revision 失效、abort 当前 pending sign context、取消原刷新 Promise，不等于 logout、clean 或删除账户。再移除本次 HTTP ID、停止 interval、调用明确的 beforeClose，等待接受工作与原 sessionPersistenceTail；最后 unsubscribe、取消剩余未来 timeout、完成自有 Subject 并恢复 subscribe descriptor/释放 ALS。回收失败逐项记录，其余资源继续尝试释放，最后 AggregateError 报告。

不能在 close 开始就清空所有 timeout：原 polling/sleep 可能靠它完成取消检查。`Promise.race` 的败选 REST/轮询分支仍计入工作，不能把外层超时当作全部完成；父 owner 必须让自己的 borrowed transport/IDE/browser 操作收尾。忽略取消、永不结束的外部 Promise 仍可阻塞 close，宿主不擅自关闭共享服务或制造成功。`drain()` 同样可能等待未来刷新，不能当作任意时刻的“当前空闲”。

原匿名 `waitAuthSession()` 没有完成/取消路径；桥保留 pending Promise，但拥有并回收它的订阅，不把这个无限等待放进 close 的有限工作账本。消费该等待的其他父服务须先由其 owner 结束，不能据此认为完整父进程已经关闭。

## 验证和剩余前沿

authenticationFixture 现在只保留明确的测试 clock、DI、network/JWT/IDE doubles；实际 Manager/默认 storage/custom/external/Wx/用户变量创建与回收委托公开宿主。34 个原组件差分、1 个真实 owned HTTP 登录/刷新/登出、1 个原 ACP 匿名 gate，以及完整父链 12 场景、冷恢复4+异常4均经此装配；原参考侧仍加载固定样本原 factory。核心 AST/依赖绑定由既有源码验证约束，新增桥没有被冒称为恢复出的原类。

17 个新增专项覆盖原身份、幂等 start/close、初始化失败 barrier、匿名 waiter、配置/URL 订阅、HTTP ID 与部分安装失败、清理失败后继续回收、慢 restore、迟到登录、原刷新取消、原 polling sleep、借入 receiver/不 logout、失败后的串行持久化 tail，以及原 timeout 后仍存在的 REST 败选分支。

另用真实 `createNativeProductHost` 和原 EnvProductProvider/merger，在自有临时 home/work 目录禁用 watcher/cloud/environment，实际合并 ACC_PRODUCT_CONFIG_V3，再经原 custom storage restore 和 Manager 发布会话。明确断言 token 来自合并配置而非 CODEBUDDY_AUTH_TOKEN、原 enterprise/uid/decode 投影；JWT decoder仍是显式测试 double，不宣称真实签名/生产登录已验证。auth 关闭后借入 product Subject 仍开放，由 product owner 单独关闭。

REA 最终证据 `ev_764df34ba635212c199f20b15b658edaf8932875d063077b5a871d37abafea75`：6171 AST nodes、3 parsed、0 skipped/parse failures；750 semantic/每文件750、150 unknown/每文件150、45秒限制下 partial/truncated。只解析公开宿主、改接fixture和所有权/配置测试的惰性源码副本，不执行安装 bootstrap；有限图与成对测试不是全部运行时等价证明。全部验证只用 owned 文件、随机 loopback 和确定模型，不读取安装账户，不发生产认证/模型请求。

仍未完成：默认 CLI/Web 切换到完整原生父服务图、全部 interceptor 和配置模式、生产 REST/账户磁盘库/真实 IDE、独立 OS 进程/daemon 与跨 cwd 恢复、Desktop HistoryStore 等。普通 CLI/Web 保持可启动，但不能把本公开认证装配说成整个 harness 已 100% 完成。

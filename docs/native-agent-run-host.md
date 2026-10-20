# 公开原 AgentService / Runner 父装配

`createNativeAgentRunHost` 将原 AgentService、interceptor 实例，以及原 Runner Factory/Provider/loop 的父装配移入 `src/agents/native-agent-run-host.ts`。它使用此前完整还原的原类/utility factories，不重写运行循环、Prompt、权限或状态机，不导入scripts/test/bundle，不执行原产品bootstrap。

## 原组件和 SDK 边界

默认建立完整原 `AgentServiceImpl`、原 `native-agent-run-utilities` 工具链及产品SDK小包装。其模块25301默认指向锁定npm `@openai/agents-core`，不是复制SDK。`createInterceptor(name, dependencies)`实例化原name map中的类并显式注入依赖；未知名字报错，不补造类。interceptor顺序仍由借入的原provider决定，不在宿主猜测/重写排序规则。

`createRunner(configuration)`实例化完整原 `RunnerFactoryImpl`、`RunnerProviderImpl`、`ToolCallLoopDetectorImpl`。原Provider仍缓存同一个真实Runner；原Factory的model input filter、loop检测、截断恢复和自动压缩逻辑仍执行。方法返回装配对象，不隐式替换当前service.runnerProvider；显式赋值或构造时传runner配置才接入。旧独立CLI/Web的`createNativeRunnerHost`仍兼容存在，不把两种父图混为同一个默认bootstrap。

Facade保留原constructor/this、参数和开放时的返回值，未给原类补上新业务分支。公开宿主只管理自己创建的实例与异步资源，不close借入的账户、模型、插件、权限或会话服务，也不伪造已登录账户。

## 嵌入接口

```ts
import { createNativeAgentRunHost } from "@axonfire/harness/agents/native-agent-run-host.js";

const execution = createNativeAgentRunHost({
  runtime: { modules, getModule: resolveParentModule, env, platform },
  dependencies: {
    logger, authenticationManager, sessionManager, stateMachine,
    agentManager, agentRunInterceptorProvider, pluginRuntimeRefreshService,
    runnerProvider, // 借入现有provider；也可改用下面的runner构造选项
  },
});
const runner = execution.createRunner({
  modelProvider, sessionManager, agentManager, productManager,
  stateMachine, logger, telemetryService,
});
// 外部compactor须按runner.native.getModule(67330)的实际token绑定到同一父DI图。
execution.service.runnerProvider = runner.provider;
const history = execution.createInterceptor("HistoryAgentRunInterceptor", historyDependencies);
// 把history交给实际interceptor provider，不能将空依赖或猜测顺序当成完整产品配置。

http.stopAccepting();
await rendezvous.close(); // 原cancel/审批收尾；辅助run与其他borrowed transport也须由owner收尾
await http.close();
await acpServices.close();
await execution.close();
await sessions.close();
// 之后按依赖顺序释放其它本父图拥有的auth/model/config/Hook等资源。
```

也可用顶层runner配置在构造时创建并附接原Factory/Provider/loop；runnerProvider和runner装配至少明确提供一个。示例是父嵌入接口，不是无依赖启动脚本。完整模块/DI、路径、OS、配置和其余业务服务仍须显式借入；不要把模块resolver或interceptor依赖替换成空对象冒称默认产品实现。

## 不把发布 result 当完成

原run在Runner.run返回后发布result，但真实stream可能仍在执行。宿主在原sessionManager.run上下文交接处登记本次signal lease，仅对原resultAbortSignalMap匹配的发布被动观察completed。旧BehaviorSubject重放、lease以外的结果及不同signal的并发结果不会误加入本宿主的完成账本；不新增SDK iterator/text消费者，也不修改state/gate/usage或审批选择。sessionManager及会话对象仍由借入owner拥有。

一次性方法不发布主resultSubject，因此不能仅靠该订阅判断结束。对本宿主原Factory新建的专用SDK Runner，在实例边界观察原run方法返回值及其completed：仍调用原方法，返回原Promise/结果，Provider.runner和实际Runner对象身份不变；关闭后恢复原实例descriptor。未改SDK文件/全局prototype，也不为借入的Runner做这种实例修改。原one-time继续独自消费文本与累计usage，宿主不二次消费。借入provider的私有one-time流程仍须由其owner保证完整收尾，不能据此宣称所有第三方Runner都由本桥管理。

expected SDK completed rejection只被动等待settled，不改成新的业务错误/成功；原Manager/InterruptionService继续负责网络错误、取消、审批与恢复判定。原one-time、override、fork、插件刷新和interceptor边界由原类执行。

## 调度和关闭

- 开放期间按原时序调用SDK/源方法，不先插入一次额外microtask才执行其同步前缀。新的Facade准入在关闭时拒绝，之前接受的认证/插件/SDK/interceptor工作允许正常收尾。
- 自有skipRun队列drain及原Runner deferred compaction的immediate：尚未开始的可取消，已开始的Promise等待完成。注入手动调度器但无clearImmediate时使用本地lease取消，不误删宿主进程的其他immediate。
- 原50ms等待可能是接受工作所需Promise的resolve来源，所以不能在close开始时提前清掉全部timeout；先等接受工作/SDK完成，再清未来通知等自有timer。原延迟及unref返回handle保留，不缩短时间来通过测试。
- 关闭不主动abort借入会话，不close共享auth/models/插件/会话栈，不伪造idle或SDK成功。父owner须先停止View/审批/辅助run等准入，并使相关认证/刷新/模型/transport可收尾；对忽略abort或不结束的外部Promise，本桥不能凭空造完成。
- 重复close共用同一Promise。最终取消自有订阅、调度、ALS与实例观察；detached callback的同步/异步异常被动记录，清理后以AggregateError报告，不让它变成无人拥有的Node异常。正常调用者可处理的拒绝不重复归类为detached失败。

## 已改接的证明

agentRunFixture的Service、utilities和interceptor创建，nativeRunnerFixture与nativeRunnerSdk的原Factory/Provider/loop创建，以及完整ACP父链的Runner装配均已改用公开宿主。原AgentService 47组件+4 SDK、Runner 41组件+4 SDK、ACP父链12组和恢复4+4组继续经完整原参考图成对执行；未删除timestamp/usage来满足比较。

17项新增所有权测试覆盖原class/SDK依赖身份、非发布即完成、禁止额外iterator/text消费、SDK失败不重分类、旧/无关/不同signal结果隔离、认证等待/拒绝、关闭队列与通知timer、原50ms等待不被提前取消、detached失败回收、原Provider缓存、compaction取消/等待、关闭准入与不close借入资源，以及未发布主result的私有one-time completed/Runner descriptor恢复。私有完成边界专项使用明确自有Runner适配器；另4种真实SDK与完整ACP集成验证实际执行链，不把该适配器当SDK实现。

OpenAI Docs仅核对[流式执行需要settled、审批从同一state恢复](https://developers.openai.com/api/docs/guides/agents/running-agents)，还原依据仍为固定样本和原锁定SDK，未切托管Agents API。

REA最终证据 `ev_8c1bd7a8fc5c0c390563d5482ac9538b37dfc96a9edf4a2ab9559b862d637151`：10558 AST nodes、3 parsed、0 skipped/parse failures；750 semantic/每文件750、150unknown/每文件150、45秒限制下partial/truncated。只解析公开宿主/改接fixture/父ACP装配三份惰性源码，没有执行原bootstrap；静态图不证明完整运行时等价。

仍未完成：默认原生父认证/配置/ACP/全部interceptor服务图与CLI启动入口、独立OS进程/daemon恢复、生产auth/REST、跨cwd/全部模式、Desktop HistoryStore/回放等。当前5/15个选定interceptor的集成不等于完整产品默认全部拦截器已接线；普通CLI/Web仍可用，但尚未切换为完整原生默认父图。

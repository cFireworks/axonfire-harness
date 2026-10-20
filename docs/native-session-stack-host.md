# 公开原生会话栈父装配

`createNativeSessionStackHost` 把原先位于测试helper的会话实例装配与资源所有权移入 `src/sessions/native-session-stack-host.ts`。它默认实例化完整原 `SessionFactoryImpl`、`SessionManagerImpl`、`SessionStoreImpl`、`SessionMiddleWare` 和 `AgentController`，不重写这些类体，不导入scripts/test/bundle或执行原产品bootstrap。

## 原行为不变

- create仍只按原逻辑创建/初始化权限与注册，不隐式setCurrent或save；Store重载也经过同一个原Factory，所以冷载入对象同样由宿主拥有。
- getCurrent仍为原ALS→HTTP Request scope，没有补一个全局current fallback。构造器身份仍是原类，Facade保留原this、参数和开放时的返回值/Promise；新关闭准入只属于父宿主，不伪称原类存在close方法。
- Manager仍是唯一SDK stream/history消费者；原 resultSubject 的函数型next回调只被动观察返回的Promise，原回调、Promise、RX订阅及SDK消费路径不替换，不另消费一次stream。所有原interceptor/gate/DraftStore/usage/落盘行为仍由原类处理。
- 原idle timeout仍60000ms、abort grace仍按原配置；新宿主只跟踪原调度，未缩短延迟或在关闭时伪造idle/成功事件。原Controller的非print setImmediate也被跟踪：尚未开始的归本宿主取消，已开始的Promise等待收尾。
- 关闭不调用Manager.remove，不删JSONL/meta，不用saveHistory额外追加整个history；测试逐字节确认关闭不改变已经落盘的数据。

## 显式依赖接口

```ts
import { createNativeSessionStackHost } from "@axonfire/harness/sessions/native-session-stack-host.js";

const sessions = createNativeSessionStackHost({
  runtime: {
    modules: originalParentModules,
    getModule: resolveParentModule,
    env: explicitEnvironment,
    argv: explicitArguments,
  },
  manager: {
    logger, stateMachine, progressSyncService, cronSchedulerService,
    agentTaskManager, interruptionService, agentInputItemProcessorProvider,
    sessionHookManager, telemetryService, galileoSessionBridge, interceptors,
    userStateManager,
  },
  store: { logger, imageBlobService, toolResultBlobService },
  middleware: {
    logger, toolPermissionService, autoModePermissionService, settingsManager,
    directoryTrustService, sessionHookManager, channelManager,
  },
  controller: { logger, agentService, agentManager, completionWaiter },
  async closeSession(session) {
    // 由父owner收尾本会话在借入服务中的注册/任务；不能删除持久化文件，
    // 也不能擅自close共享的整个服务。实现须由完整父装配提供。
    await releaseThisParentsSessionRegistrations(session);
  },
});
// 与公开HTTP宿主共用 modules[47005] 的原Context，并使用同一个DI图。
await http.start({
  controller: sessions.controller, sessionMiddleware: sessions.middleware,
  views: [rendezvous.view], defaultViewName: "acp",
  errorHandlers, pipeManager, endpointProvider,
});

http.stopAccepting();
await rendezvous.close();
await http.close();
await acpServices.close(); // 先结束可能回调会话的借入观察者owner
await sessions.close();
```

这是父嵌入接口示意，不是无依赖启动脚本。模块图的PathUtils/权限/Hook/队列/状态等必须显式提供，Controller和Middleware的服务也必须一致：例如Manager.create通过ContainerUtil取权限服务，Middleware通过字段取权限服务，父装配须将二者指向同一实际服务。没有把占位对象、测试账户、模拟模型或空Hook当作默认产品实现。

宿主为FS/path/AsyncLocalStorage与锁定npm SDK提供内建模块，调用方可显式注入owned测试边界；不会发现安装home、账户或原进程env/argv。原类需要的其他模块/配置仍走明确父resolver。Store的原ID/path接口仍是可信内部API，不是文件沙箱；外部请求应经原Ingress校验，不应把未经校验的字符串交给裸Store。`closeSession`是必需所有权契约，宿主不能替共享父服务猜测注册的释放方式。

## 两种账本与关闭

短期工作账本包含接受的create/Store写盘、原result函数回调、服务调用和已执行调度的Promise。`drain()`等待这些工作，包括处理中追加的工作。长期scope账本单独包含原manager.run/runWithoutHistory和Middleware.handle/Controller.run，因为ACP的HTTP/View可能在newSession返回后继续运行；把这些scope加入普通drain会在父端到端形成死锁。

关闭停止新的Facade准入，保留已接受异步scope继续执行原历史处理的权限；取消未开始的自有调度，abort自有session，等待短期工作和长期scope。创建在close开始后才完成的对象也进入所有权集合。随后等待原session-start Hook Promise并逐会话调用显式release，最后等待原写锁/gate、取消自有订阅/timer、完成所有原Subject、禁用自有ALS并恢复Subject.subscribe descriptor。重复close返回同一Promise；单个release失败不会跳过剩余会话清理，完成后用AggregateError报告失败和被动捕获的detached异常。

原生业务类没有被加上新关闭分支；准入/资源归属是独立新桥。接受的工作与scope必须能结束：父owner先结束借入的View/SDK/transport/审批，以及可能继续回调会话的服务观察者；被closeSession/历史/Hook收尾依赖的服务则须保持可用，待本层收尾后再关闭。对忽略abort且永不结束的外部Promise，宿主不能凭空造完成；默认父进程还需提供正确依赖顺序。直接访问Subject、原构造器或借入依赖仍是可信嵌入接口，不是安全隔离。

## 已改接的验证

后续[公开原AgentService/Runner装配](native-agent-run-host.md)已继续迁出执行链实例化与调度收尾。它借用本会话owner，不擅自close或abort本层；真实SDK/ACP仍由原类执行。默认认证/配置/全部父服务图仍未完成。

原sessionStackFixture现在把所有实际实例/Subject/RX/timer所有权委托给公开宿主，只保留临时根、显式外缘服务和测试时钟等边界。原48组件差分+2真实SDK会话栈成对验证继续使用完整原类；ACP父链12场景和4冷恢复+4异常入口也实际经过公开会话宿主与公开HTTP宿主，第65/67组仍替换完整原参考图。

18项新增专项覆盖原类身份/create语义、Store冷载入对象回收、关闭JSONL/meta字节不变、未完成append及晚建timer、长期scope与drain区分、被动RX等待/descriptor恢复/异常、权限初始化失败与晚完成创建、release异常后完整回收、Controller immediate取消/等待、真实60秒timer回收、借入服务this与非拥有close、关闭后准入，以及AgentService/Runner组合fixture诊断getter不能被对象spread固化成旧数组。

测试外缘仍明确是owned临时文件/loopback/确定模型和显式服务，不读取安装账户，不发生产请求。普通CLI/Web尚未切换成完整原生默认父装配；本批也没有宣称独立OS进程或daemon恢复已经完成。

OpenAI Docs仅核对[本地history与审批state的不同用途](https://developers.openai.com/api/docs/guides/agents/results)：没有把JSONL恢复伪称成整个SDK RunState持久化，也未改锁定SDK或换用托管Agents API。

REA对公开宿主与改接fixture的两份惰性源码，最终证据 `ev_7587479b42bf2c0a05978e70b7f80f6a1d647f49999713c2a510a7bda141849f`：3423 AST nodes、2 parsed、0 skipped/parse failures；750 semantic/每文件750、150unknown/每文件150、45秒限制下partial/truncated，不是完整运行时等价证明。

剩余顺序：原AgentService/Runner/认证/配置父装配迁出测试边界、完整默认CLI入口与独立OS进程恢复，再继续生产auth/REST、跨cwd/配置模式、Desktop HistoryStore/回放、其他原服务外缘和并发分支。公开会话宿主只是完整harness的一个组成部分，不等于100%完成。

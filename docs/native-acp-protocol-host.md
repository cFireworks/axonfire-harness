# 公开原 ACP 协议组件装配

`createNativeAcpProtocolHost` 将原 Agent、View、ToolInterceptor 和完整原 primitives/input factories 的组件创建移入 `src/protocol/native-acp-protocol-host.ts`。运行时不导入 scripts/test/bundle，不执行安装应用或完整产品 bootstrap。此前恢复的8类217成员、协议/业务声明、Prompt、原配置与SDK依赖未重写；新增的是显式父装配和生命周期观察，不把桥的方法计为新增恢复的原类。

## 接入边界

```ts
import { createNativeAcpProtocolHost } from "@axonfire/harness/protocol/native-acp-protocol-host.js";

const protocol = createNativeAcpProtocolHost({
  runtime: {
    modules: explicitParentModules, // 同一父DI的ContainerUtil/Logger/tokens与协议SDK
    env: explicitEnvironment,
    fs: ownedFilesystem,
    os: explicitOS,
  },
  viewDependencies: explicitViewServices,
  beforeClose: async () => {
    await rendezvous.close();
    // 等待本父层真正拥有的RPC/forwarding/transport/terminal完成。
    await closeOwnedProtocolTransport();
  },
});
di.set(protocol.p.protocol.AcpToolInterceptor, protocol.toolInterceptor);
// 配齐原Agent的所有DI依赖后，才使用真实原协议SDK连接：
protocol.agent.setConnection(sourceConnection, connectionId);
// initialize/newSession/load/resume/prompt等仍调用原Agent方法。

http.stopAccepting();
await protocol.close();
// 再释放本父图拥有的执行、会话、认证与配置等服务。
```

这是显式嵌入接口，不是完整默认启动脚本。宿主不创建假认证、连接、账户、模型或会话。Agent getter仍由真实父DI取服务；View依赖明确注入，未自动init/render；ToolInterceptor不自动取得终端或扩展客户端能力。HTTP父交接的实际View仍由 `createAcpRendezvousHost` 拥有，不能把这里用于组件调用的View与它混作第二个默认渲染循环。

`sourceFactories` 可替换原参考factory以做固定样本对照，默认使用已恢复原实现。`runtime/modules/base/p/n/v` 暴露对应原模块和依赖图；自行用暴露的类额外构造实例，不自动成为此宿主拥有的对象。

## 接口与业务保持

- facade保留原constructor、实际receiver、开放期间方法参数/返回值和同一个原Promise；方法name/length与重复读取时的函数身份保持。原prototype/核心类体未改。关闭拒绝新的外部调用，但已登记的原事件/abort回调可完成内部调用，即使事件由外部触发、不带ALS上下文。
- 不替换调用者AbortSignal，不patch其addEventListener，不擅自abort借入会话/signal。forwarder必须由调用者取消或原正常终态结束；不能先清监听，留下永不settle的原Promise，再声称关闭成功。
- common/utility使用独立overlay，保留借入getter、晚绑定与token身份；新增/覆盖只写本宿主namespace，不污染父namespace。DI须显式补齐，不将缺失业务服务换为空对象。
- 原forwarder同步创建会话订阅期间，借用subscribe descriptor做短期观察，随即恢复；不替换借入session/Subject，不增加SDK stream/history消费者。原生会话提供可配置subscribe；拒绝不可配置边界时，前序lease全部回滚，不留半装配。
- 函数及Observer回调只被动观察异步工作，Observer receiver保留。RxJS `subscribe(Subscriber)`特殊重载保留传入的同一个Subscriber，不变成另一条订阅。

## Deferred、iterator与关闭

记录原Agent分配的sessionDeferred、tool-call ACK Deferred，以及原promptEvent发布的responseDeferred；不新增prompt消费者。关闭只拒绝这些待决工作，不制造答案或SDK成功，也不把外部直接发布的任意Deferred算作自己创建。

sessionDeferred属性观察可与rendezvous组合：委托既有setter，关闭恢复descriptor。rendezvous显式识别自己的getter lease，同一底层Agent即使换facade也不能同时被第二个rendezvous接管；释放后可复用。允许协议owner accessor不等于允许两条HTTP/View交接循环。

本宿主View创建的原prompt iterator在关闭时调用原return()，唤醒pending next并取消实际订阅；未开始迭代的对象也已有原订阅，需要原return()回收。原队列/park-before-return业务顺序保持，不自行消费或回答队列。

关闭顺序：拒绝新准入、停止自有interval、拒绝自有Deferred/return自有iterator、beforeClose、等待实际原工作与forwarder、清forwarding/URL订阅、完成自有Subjects并等待异步complete，最后unsubscribe、清剩余timer、恢复descriptor与释放ALS。同步清理和detached callback错误汇总后报告，其余资源继续尝试释放。重复close返回同一Promise。

原ACK为5000ms；原终端默认120000ms，成功race后原类不清败选timeout。现仅在factory外层增加显式timer注入，与Agent/View一致，完整原Bash类体未改、超时未缩短。close不能先删掉接受工作等待的timeout；实际方法结束后才清未来败选timer。

后台终端“Command started”不是后台分支完成。终端/连接是借入资源，父层必须在beforeClose结束自己的进程并等待原currentOutput/release续链；宿主不额外调用waitForExit消费一次，不杀共享终端或关闭共享SDK连接。对不结束的外部Promise、未取消的原forwarder或未收尾后台终端，不宣称已管理完整外部生命周期。

原认证初始化失败可能让auth.initialized保持pending，进而让原newSession等待；桥不会用模型key充当产品登录或伪造该barrier成功，也不宣称此时原调用已经收尾。完整父启动/失败退出策略仍须继续按样本恢复。

## 已改接与验证范围

acpProtocolFixture只保留明确clock/DI/连接/权限测试边界，原Agent/View/ToolInterceptor、core模块与回收改用公开宿主。protocol/services/view/认证gate/完整ACP父链与磁盘恢复均await实际关闭；真实父链继续仅由原AcpView.render调用Agent.setSession，原Manager为唯一SDK消费者，没有人工resolve新会话或使用JSON测试view替代。

21项新增专项覆盖原身份/方法/借入DI、overlay、会话lease/失败回滚、外部abort/不可配置signal方法、prompt/session Deferred、组合owner与重复接管拒绝、iterator、ACK准确时间、URL/借入Subject边界、detached/异步complete、Subscriber身份、清理失败、关闭准入、原终端超时/败选timer和明确后台收尾。另验证连续多轮的原订阅unsubscribe后即从账本移除，不把旧Subscriber/session闭包保留到整条连接关闭。终端均为owned协议适配器，没有执行真实shell命令。

原8类217成员/5完整factory仍由完整AST和源码成对行为校验；桥的专项不是全部产品等价证明。全部仅owned文件、随机loopback、确定模型和明确外部适配器，不读取安装账户或发生产请求。

REA最终证据 `ev_cee61bcad4e2ef0ab96bd12072a1c8fd935c6fd6c576edcfbe5e867895022c22`：9042 AST nodes、4 parsed、0 skipped/parse failures。750 semantic/每文件750、150 unknown/每文件150、45秒限制下partial/truncated；分析公开宿主、fixture、rendezvous组合和专项测试的惰性副本，未执行原bootstrap。静态图不证明完整跨模块/运行时等价。

剩余：完整默认父配置/ACP连接与全部interceptor图、CLI入口和独立OS进程/daemon恢复、生产REST/账户库、跨cwd/全部模式、Desktop HistoryStore等。普通CLI/Web保持可运行，但尚未切为完整原生默认bootstrap，整体还原继续进行中。

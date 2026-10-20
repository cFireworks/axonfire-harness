# ACP 标题、friction、广播与 usage 服务

本阶段沿固定 WorkBuddy 5.3.14 CLI 样本恢复完整 `SessionTitleServiceImpl`、`FrictionAnalysisServiceImpl`、`FrictionRecallClientImpl`、`AcpBroadcastServiceImpl`、`AcpUsagePublisherImpl` 和 `UsageUtils`，共 6 类、70 成员，另有 17 完整函数、15 初始化和 8 个完整惰性 factory。原生标题 helpers、MessageContentUtils/MessageUtils、SessionUtils、usage 分类/上下文构建器及 ProductFeature/FeatureToggle 枚举也在这些 factory 内完整保留。标题、friction、recall 的 16 个原模块导出 getter/DI tokens 单独核对，`getModule(68593/18945/43324)` 保留原接口映射，不只暴露 Impl。所有范围按 UTF-16 记录，编译后的完整声明与原 AST 独立核对。

## 可以使用什么

`createNativeAcpServices(runtime)` 提供原始完整组件。`createAcpServicesHost(options)` 是新增的进程内所有权宿主，借用现有 `createHarness` 的 AgentService、SessionManager、AgentManager、ProductManager 和状态机；提供 `title`、`friction`、`recall`、`broadcast`、`usage`，以及原 helpers。

此宿主面向 ACP 父宿主/嵌入者，需要提供同一父宿主的 `getModule` 和必要 `modules`。不是无需依赖的另一套 agent loop，也不自动发现安装环境。`modules[66545]` 需要原 AgentNames 等常量，`modules[22618]` 需要与父协议相同的 tokens，`modules[80699]` 的 DI 应返回父宿主共享的 AcpToolInterceptor/文件缓存，不能随意换成一个空缓存。已有 ACP 输入宿主的 `native.getModule` 可借用其有边界的 codec/XML/timestamps 等组件，但仅有这个 resolver 不等于完整父协议依赖已接齐。缺失依赖仍明确报错。

使用 `registerConnection(id, agent)` 登记显式借用的 ACP 客户端，`unregisterConnection(id)` 移除；客户端需要原 `getConnection()` 等方法，不是 Web UI 的网络 session 对象。登记不等于认证/连接 guard；不得直接把不可信网络连接交给此内部 API。

普通 CLI/Web 仍可按 README 启动；本阶段没有更换它们或 Addon.promptAcp 的默认入口。完整 `AcpView.executePrompt` 现已在真实 SDK 集成中跑通 Read、工具结果、两轮历史、旁路广播、usage 和标题生成，但 RPC/NDJSON/HTTP、审批 owner 切换以及 daemon 仍是下一层工作。

## 源行为及边界

- 标题：默认非 TTY 不生成，可明确 `setForceEnabled(true)`；环境禁用优先。最短 2 个 UTF-16 code units、最多 3 次失败、15000 毫秒 race。保留自定义标题优先、generation ID 过期保护、原 `<session>` prompt、JSON/正则解析和 `ai-title` 历史记录。超时不取消借用的模型请求。
- friction：召回和上报分别检查产品 gate，只认 boolean true。召回使用原 `/agenttool/v1/intent/recall`、POST、3000 毫秒参数；先选最高有效结构 score，再验证标签，最高条目标签无效不会改取下一条。保留 19 个 friction 类型映射、severity、root-cause 集合、历史 20/10 项窗口和 300 字符 execution signal。
- friction：先缓存尚无 request ID 的 prompt；按 session/request 去重。上报前先标记 reported，发送失败不重试，这个源行为不改。服务的捕获/报告方法可供原请求 telemetry 链调用，本宿主没有伪造 request-send telemetry 或声称完整 Galileo/EventService 已接入。
- 广播：排除 origin、保留 tracking/compact/subagent/parent 元数据；session_end 仅在源 idle/compact 条件允许且 0 毫秒复查后发送。ACK 最多等 **2000 毫秒**，与主 Agent/View 的 5000 毫秒不同。checkpoint 大 diff 仅发送给明确请求 detailedCheckpoint 且匹配 session 的客户端。
- usage：250 毫秒 stream 合并、used/size/cost/message/category 去重、正数 cache token 优先级、团队 stage 去重、snapshot request ID 保持原逻辑。size 不可用时跳过并警告，不编造 token 上限。分类保留 CJK/ASCII 权重、图片估计、hidden-section 和总 token 守恒分配；SDK Usage 直接依赖锁定的 OpenAI SDK。

默认不连接远端召回，也不发送外部 telemetry。启用对应功能时须明确借用 `restOperations`/`eventService`；缺失时由明确错误进入原 catch/log 分支，不返回伪造的召回结果。借用 REST adapter 必须自己实现原 timeout 参数的传输和取消，参数透传测试不能证明任意 adapter 的网络超时语义。

## 所有权与验证

宿主只在实例外层观察原方法返回的 Promise 和嵌套 fire-and-forget 调用，不改 class body；facade 保留方法 name、arity 和稳定引用。原来未 await 的 terminal updater/计数器和日志回调返回的 Promise 也会被观察，保留借用对象的 receiver。`flush()` 等待已接受任务；`close()` 拒绝新的服务 facade 调用和连接登记，先停广播/usage 订阅，保留在途标题/广播的 timeout race，join 任务后清 owned timers、连接索引与临时 prompt/state 图。借用的 SDK backend、客户端、模型、REST/Event/terminal updater 均不关闭。原 timeout 赢得 race 后，借用操作可能继续运行；这不是进程/网络沙箱或所有外部操作终止保证。

```sh
npm run check
npm run build
npm run smoke:acp-services -w @axonfire/harness
# 原样本由调用方自行提供，公开仓库不附带它。
npm run verify:acp-services -w @axonfire/harness -- /absolute/path/to/codebuddy.js
```

18 组原声明/还原声明的有限差分，加 6 项宿主/真实 SDK 测试，共 24 项。测试中的远端 recall、report、客户端与部分依赖为显式 doubles；真实 SDK 部分只用 owned 文件和离线模型，fixture 明确 bypassPermissions，不能据此证明默认 ACP 审批、原生产服务、所有输入/平台和整个 harness 已 100% 等价。

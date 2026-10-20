# 完整原生 Runner 创建链

固定 CLI SHA-256：`4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd`。`packages/harness/src/runner/native-runner.ts` 只保存完整惰性声明，原 decorators、聚合模块入口和应用 bootstrap 不执行；偏移为 UTF-16。

## 范围

| 组件 | 完整源码范围 |
| --- | --- |
| RunnerFactoryImpl | 原模块 43843，全部 5 方法：create/checkAutoCompact/injectSendNowItems/shouldCompact/filterTruncatedToolCalls |
| RunnerProviderImpl | 原模块 66545，完整 get 与 runner 缓存表达式 |
| ToolCallLoopDetectorImpl | 原模块 66545，全部 9 方法与同一声明中的阈值/blacklist/marker 初始化 |
| retry helper | 完整 buildTruncationRetryMessage、4 个工具专用 prompt、通用 prompt、retry/exhausted marker |
| 惰性 factory | 完整 40038（loop tokens）、67330（compact 配置/环境/枚举）、3927（NumberUtils） |

三个主要类合计 15 成员，5 完整声明、4 个原导出 getter；完整 factory 里的 NumberUtils 另由 factory 整体核对。不是整个 66545 模块，也不复制任何 SDK 实现。

## 原始行为

- create 的参数没有被使用。原创建配置只有 modelProvider 和 callModelInputFilter，不擅自添加 model/maxTurns/tracing 配置。
- 输入过滤按 loop → checkAutoCompact → truncated/content-filter cleanup → await injectSendNowItems → 非辅助 purpose 的 MODEL_REQUEST_STARTED 执行。loop 恢复分支尝试退款并直接返回；退款/状态事件异常按原日志分支处理。
- injectSendNowItems 在样本里就是完整 async 空方法，未给它补实现。
- shouldCompact 保留压缩中/abort/30 秒 cooldown/空 history/compact agent 等短路。用完整 UsageUtils 从历史寻找最新用量，不用 session.usage 或 result.rawResponses 冒充；追加 trailing tool-result token 估算。物理 storeId 与逻辑 id 不同才是 source subagent，parent metadata 本身不决定该分支。
- 阈值保留主/子 Agent emergency 优先级、原环境 override 与未知窗口 fallback；仅在有 meaningful post-compact history 时触发。配置/模型错误由原 catch 返回 false。
- emergency work 仍 setImmediate 延迟执行，force=true/type=emergency-auto；原 check/deferred 两层失败日志不重写。
- filter 在读取 length finish reason 后调用完整 HistoryUtils.applyContentFilterCleanup；该 cleanup 会删原 metadata 键。保留空 arguments 的已完成 result 特例、真实 jsonrepair、第二次 greater-than fix、retry/exhausted prompt 与原 callId 真值 fallback。
- 原过滤器不会把 function_call_output 按 function_call_result 一样删除；不“修正”这个差异。Provider 首次并发 get 也可能创建两次，只有 await 成功后才缓存；失败后下次重试。
- compact window 的 NumberUtils 先 Number 再 floor/clamp；`5e5` 得 500000，`500000junk` 回退 200000，正分数 0.1 经 floor 后 clamp 到 100000。原百分比 override 仍是 parseInt，不混成同一种解析方式。

## 默认宿主与原父 runtime

`createNativeRunner(runtime)` 暴露完整原类、局部惰性 loader 和原导出对象；SDK wrapper/jsonrepair/Manager/ModelProvider/遥测等依赖必须显式注入。

`createNativeRunnerHost(options)` 是新增的 standalone DI/资源所有权边界：连接完整原 History/Input/Purpose/SessionUtils/UsageUtils、既有原 TokenUtils 与真实 SDK。它不扫描安装账户，不提供生产认证或泛用 ACP 文件/OS 服务。只使用惰性常量/XML helper 时，不以真实文件系统或身份填充无关依赖。

现有 `RunnerFactory` 公开构造器保留兼容，内部已委托完整原 RunnerFactoryImpl；**CLI/Web 的 Runner 决策和默认 loop detector 现在走完整原类**，不再走旧近似 shouldCompact/input filter。其它父运行时仍是 standalone，不能据此声称整个原生启动入口已切换。

原 create 不包含 tracingDisabled。独立宿主的禁远端追踪策略只在借用 SDK constructor 的外缘加入，原方法体/SDK 文件不修改。宿主另外跟踪自有 deferred immediate/Promise，close 等待已安排的压缩任务，在释放会话前收尾；immediate 回调直接启动原 async 操作的同步前段，不额外推迟到下一个微任务，可控调度测试验证该时序。原 Provider 的并发缓存行为保持不变，不替换成 Promise 缓存。

## 验证

```sh
npm run smoke:native-runner
npm run verify:native-runner -w @axonfire/harness -- /absolute/path/codebuddy.js
```

49 项专项：41 组有限源码组件场景、4 项完整原 Runner/Provider/loop + AgentService/前置链/Manager/Store 的真实 SDK 测试、4 项独立宿主/公开接口/关闭屏障/兼容窗口测试。四个 SDK 模式是 Read 后空 meta 冷恢复、同 RunState 续轮、流式取消草稿、one-time 文本与 usage；全部仅用 owned 模型、工作文件、状态目录和显式服务外缘。

第 62 组源码校验核对全部声明/主要类/成员/绑定/getter/factory，再以原样本完整 Runner 和 AgentService 片段重复 41 + 4 组成对验证。测试中也修正了旧 fixture 的 UsageUtils 缺失 AgentNames 依赖：现在注入完整原常量与 History 工具，不通过伪造 usage 或降低阈值使测试通过。

OpenAI Docs 用于核对 [Runner/model provider 边界](https://developers.openai.com/api/docs/guides/agents/models)，实现仍按固定样本及 SDK 0.5.2。有限测试不能证明完整产品等价；父 HTTP Context → middleware → Agent.setSession/View rendezvous、真实认证、Desktop/daemon 等仍待恢复。

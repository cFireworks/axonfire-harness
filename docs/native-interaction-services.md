# 原生 Ask / Plan 服务与 ACP 父链

本批把原先的 AskService/PlanStorage 行为重写换成完整原类，并在原 ACP/HTTP/native session 执行链验证人工问答和计划审批。不是新增一套 agent loop，也未把本地 Web UI 称为原界面。

## 完整源码边界

固定 `codebuddy.js` SHA-256 为 `4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd`；位置均为 UTF-16，不是字节偏移。

| 来源 | 已保留内容 |
| --- | --- |
| module 40348 | 完整 AskServiceImpl 14 成员、getItemToolCallId、原导出 getter 与模块绑定 |
| module 78621 | 完整 PlanStorageServiceImpl 6 方法、原 token / getter / 绑定 |
| PlanModeUtils | 完整两方法与原三组命名词表，13252197..13252791 的原 declarator |
| 42086 / 8461 / 33563 | 完整 Ask token、Deferred、trace 属性/事件常量 factory |

两 scope 保留 7 个完整业务声明/表达式、9 个非 DI import declarator 及源初始化顺序；只移除原装饰器/bootstrap。PlanModeUtils 的 path / plans directory 在外缘显式提供，不宣称整个原 PathUtils 或 Logger/OTel 服务已恢复。完整类体和 factory 独立 AST 核对，不把测试通过直接当作全文还原证据。

`createNativeInteractionServices(runtime)` 暴露原 AskServiceImpl、PlanStorageServiceImpl、PlanModeUtils 和 getModule；RxJS、路径、文件 IO、plans directory、时钟/定时器由宿主注入。它不寻找安装账号、用户配置或生产端点。

公开 `new AskService()` 继承原 14 成员，仅在构造外缘注入 logger/init；原方法不再重写。`AnswerDeferred` 是同一个原 Deferred 构造器的类型化别名，保留实例判定。公开 `new PlanStorageService(directory)` 的六个方法全部委托原对象，保留显式目录 API。CLI/Web 因使用这些公开入口，也实际采用完整原服务，不仅测试夹具使用它们。

## 必须保留的原行为

- setAsk 以 rawItem.id 判定同一 item；替换会先 resolve 旧 legacy Deferred。earlyAnswers、waitingDeferreds、legacy currentDeferred 不是同一份答案队列。
- doneAsk 在无 toolCallId 且恰好一个 waiter 时回退投递；多个 waiter 时丢弃并记录警告。targeted doneAsk 没有 waiter 时把答案暂存 earlyAnswers。
- 若答案在 setAsk **之前**到达，setAsk 会消费 earlyAnswers 并只交给 legacy Deferred；后续 acquireAnswers 不会重复获得它。这一点由原片段证实，不把它改成广播答案。
- acquireAnswers 替换同 ID waiter 时拒绝旧 waiter；原 600000ms 默认、正有限 timeout、unref、预先/过程中 abort、finally 清监听/timer 都保留。
- span 覆盖、成功/失败/flush、原 attribute key 与常量保留；本批没有实际发送 OTel 流量。
- PlanStorage 支持缺失 meta 的惰性初始化，write 不创建目录、原 utf-8 编码、原异常重抛和 ENOENT/其它读错日志分支保留。随机命名原词表未变。

## 真实 ACP 父链

父装配共用真实 ACP SDK、Node loopback HTTP、原 MVC/CLS、原 SessionMiddleWare/Manager/Store、AcpView.render/setSession、AgentService、Runner 和完整 InterruptionService。现在给原 Agent 注入完整原 AskService，移除父链中的 Ask 等待 span double；PlanTools 使用完整原存储，原 ExitPlanMode input processor 和 Defer 权限适配器参与执行。原产品配置、工具暴露规则和 default permission mode 不变。

新增六组端到端场景：

- Ask 回答：原 requestPermission 待决时，经真实 `_codebuddy.ai/resolveInterruption` 扩展 RPC 提交 q_0 和数组回答；原 Agent 映射为问题文本并以逗号连接，再由原 AskService 投递给工具。真实后续模型输入/JSONL 含人工答案。
- Ask 跳过：同一扩展的 deny 走原 skip_question，**批准执行跳过结果**，不是整轮权限拒绝；后续模型确实收到原跳过文案。
- Ask 取消：真实 ACP cancel 停止待决问题，不批准或执行工具，也不再请求模型。
- Plan 批准：原默认 deferred EnterPlanMode 请求一次人工审批；原 Plan 策略允许仅写计划文件，无额外 Write 审批；deferred ExitPlanMode 再审批，批准后恢复之前模式并继续模型。
- Plan 拒绝：拒绝 Exit 不继续模型，ACP cancelled，计划文件及 plan 模式保留。
- 拒绝并退出：deferred Exit 的普通 options 没有直接 ExitPlanMode 才有的 reject_and_exit_plan；测试通过真实扩展 decision=rejectAndExitPlan，原 Agent 恢复 prePlan 模式，再拒绝，不伪造未公布的选项。

多次审批可以共享同一个 SDK RunState。验证记录最近一次 review 后的原 service.run 调用，区分 Enter 已批准与 Exit 被拒绝，不能用“之前曾恢复过该对象”证明最后审批已获准。回答/批准均恢复原状态；拒绝/取消后无额外模型调用。关闭只回收自有问题 waiter、span、timer/Subject，未改原类体或强制运行状态。

测试模型在 Plan 的下一次响应前等待原 inputSubject 确认上一次 function_call_result 已被唯一历史消费者接受。这是自有确定模型传输的时序屏障，不是拦截原业务类；不等待 result.completed/f.drain，避免消费者自等待。它消除了“无需审批的 Write 后，极快模型先于历史记账返回下一响应”的对照时序差异；usage 数值未删除或归一化，仍断言每次16 tokens的完整累加。另从原 Hook pipeline 外围被动观察实际执行，确认 Ask cancel 和 Plan reject/exit-reject 没有执行对应工具，而非仅凭模型次数猜测。

## 验证与限制

```sh
npm run smoke:interaction-services
npm run smoke:acp-parent
npm run verify:interaction-services -w @axonfire/harness -- /absolute/path/codebuddy.js
npm run verify:acp-parent -w @axonfire/harness -- /absolute/path/codebuddy.js
```

第66组源码验证检查上述完整类、声明、import/getter/原顺序、PlanModeUtils 和三个 factory，并做 8 组有限行为差分；另有公开构造器兼容测试。父链第65组从6扩展到12组成对真实 SDK 集成，参考侧也替换原 Ask/Plan 服务，而非两侧共用行为重写；既有设置/Hook/部分工具 handler 与 SDK 依赖仍共用，受各自已有验证约束，不称整个应用重放。

参考集成补齐显式 CLI commandSafety 外缘；没有缺省调用桌面 host detection 或 exec。ACP 错误工具保留完整原 ErrorUtils，避免被 session fixture 的较小 ModelErrorUtils 覆盖后掩盖真正异常。这些是装配修正，不是修改原业务分支以迎合测试。

REA 对完整服务和最终父装配两份惰性源码的证据为 `ev_4f154f7cb260c162193fcc55684e5423ac08c8fee4aeb2be145df47546b2b588`：10479 AST nodes、2 parsed、0 skipped/parse failures。750 semantic / 每文件750、150 unknown / 每文件150、45秒限制下 partial/truncated；静态图不证明完整运行时等价，也未执行原 bootstrap。

OpenAI Docs 仅核对[同一 RunState 的审批恢复边界](https://developers.openai.com/api/docs/guides/agents/guardrails-approvals)；固定 SDK 不升级或复制。仍需继续默认原生父装配、load/resume/fork、生产 auth/REST、Ask/Plan 的全部失败/并发/配置模式、Desktop 回放及遥测。有限问答/计划场景不等于完整 harness 已100%还原。

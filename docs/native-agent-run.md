# 完整原生 AgentService 与执行前置链

固定 CLI SHA-256 为 `4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd`。`packages/harness/src/agents/native-agent-run.ts` 保留完整惰性声明，不执行原 DI decorators、应用 bootstrap 或安装账户查找。偏移为原 UTF-16 位置。

## 恢复范围

- 完整 AgentServiceImpl：构造器及全部方法，包含 runDefault、run、前置链、插件刷新屏障、one-time、override 与 fork。
- 本聚合模块的 31 个完整 interceptor 类；连同 AgentService 共 32 类、169 成员、45 完整声明、9 个函数、19 个初始化值。原 name map 另引用此前还原的 WorktreeContextInterceptor，共 32 个 interceptor 名称，不将外部类重复计为本次完整类。
- 37 个原导出 getter、完整 constructor/name map、局部 helper、DeepResearch/Ultracode/teammate 等原文与配置判断；未把这些内嵌提示词重写成独立宿主模板。
- 完整 factory 69466（Agent tokens/constants）和 7340（SessionUtils）；`native-agent-run-utilities.ts` 另保存完整 77787（AgentPurpose）、18553（产品 SDK wrapper）、21580（HistoryUtils）、58830（InputItemUtils）、46943（MessageUtils）、2623（resend branch）、4636（summary/error），合计 9 个完整 factory。
- 动态 OS namespace import 需要的原 webpack namespace-loader IIFE 单独完整保留并核对；不执行整个 webpack 入口。

产品 SDK wrapper 只有重导出、8 种 custom input item 类型和 user ID 补充，**不是复制 OpenAI SDK**。其模块 25301 必须由真正的 `@openai/agents-core` 提供，版本仍固定 0.5.2。

## 显式使用

```ts
import { createNativeAgentRun } from "@axonfire/harness/agents/native-agent-run.js";
import { createNativeAgentRunUtilities } from "@axonfire/harness/agents/native-agent-run-utilities.js";

const utilities = createNativeAgentRunUtilities({ modules, getModule: resolveParentModule, env, platform });
const native = createNativeAgentRun({ modules, getModule: utilities.getModule, env, platform });
const service = new native.AgentServiceImpl();
// 父宿主仍须注入 authenticationManager、runnerProvider、sessionManager、
// agentManager、stateMachine、interceptor provider 等真实依赖。
// native.interceptorClasses 为 name -> constructor，不能把空对象当作完整服务。
```

`env/argv` 默认空，platform 默认 unsupported；计时器、Date、stdout 与其余模块由父宿主显式拥有。缺少模块在使用时拒绝，不自动扫描安装账户。源码中的 Sandbox、Memory、Insights、Team、StreamJson 等类完整保留，但其外部服务不因类体存在而自动可用。

## 保留的重要行为

- run 等待 authentication.initialized，然后取得 runner；maxTurns 使用原 Number/finite/positive 判断，1.5 仍被接受。bypassMessageQueue 只有严格 true 才从 SDK options 删除。
- run 在原 Manager.run 的异步上下文中发布 result 并登记 signal，不自行安装第二个 stream consumer、不自行赋值 session.state。取消连接旧、新 controller 的原行为保留。
- interceptor 按原 priority 执行；History 边界后等待插件刷新，仅将托管 Agent 重绑到同名新实例。RUN_PREPARING/FAILED/SKIPPED 及 queue drain 的所有权分支保持原样。
- 原 History 使用 optional metadata；原 Telemetry 在正确阶段创建 meta/rootRequestId。空 meta 冷加载可以直接走此完整链，未通过预填 `{}` 修改 Store，也不需要旧 AgentService 的 ensureRunResultHandler facade。
- one-time 独立消费文本并累计 usage，不发布主会话 result/history；override 使用原型派生 Agent 和 modelSettings 拷贝，permission bypass 的持久副作用保留；fork 过滤原历史、独立运行并恢复禁用工具。
- 原 History/resend/summary/Message/Input 工具方法整体保留。用户 query 包装、系统提醒、规则、图片过滤/rehydration、模型 effort 回退、取消/压缩边界不拿独立宿主近似方法替换。

## 验证与局限

```sh
npm run smoke:agent-run
npm run verify:agent-run -w @axonfire/harness -- /absolute/path/codebuddy.js
```

51 项专项测试：47 组有限组件场景，加 4 项真实固定 SDK 集成。源码校验同时对所有完整声明/类成员/factory/导出 getter/模块绑定/namespace loader 做 AST 比较，并以原样本完整片段重新执行上述 47 + 4 组成对验证，不执行产品 bootstrap。

真实 SDK 组合完整原 AgentService、15 个原 interceptor、原 Manager/Store/Factory、已还原 AgentManager/Factory/Read/ProductPromptRenderer：执行 Read 并写 JSONL、新建原 Manager 从空 meta 磁盘会话冷恢复、同 RunState 续轮、取消草稿及一次性 usage。原 `system-reminder-md` 提示词经真实模板渲染，显式 owned 规则文件确实进入模型输入。模型、文件、身份 fallback、telemetry、权限初始化和 memory 服务外缘都是明确的 owned test adapters；不伪造已登录产品账户，不访问生产服务。

这里直接使用真实 SDK Runner，**尚非完整原 RunnerFactory/Provider 的启动接线**。CLI/Web 默认仍为已验证的独立宿主。下一步须恢复原 Runner 构造与父 HTTP Context → middleware → Agent.setSession/View rendezvous、资源所有权和真实认证入口，才能切换默认原生父 runtime。有限行为测试与完整 AST 保真不能证明整个产品 100% 等价。

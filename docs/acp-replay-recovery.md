# 原 ACP 历史回放与父会话恢复

完整恢复 `codebuddy.js` module 67037：UTF-16 6918399..6929073，SHA-256 `4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd`。一个完整原 factory、16 个完整函数、原导出 getter / import / 常量 / 动态依赖顺序均保留。`createNativeAcpReplay(runtime).replay` 暴露原 collectSessionReplayEvents、emitSessionReplayEvents、isReplayShowPreCompactEnabled 和 env key；不执行应用 bootstrap。

## 原回放逻辑

- `CODEBUDDY_REPLAY_SHOW_PRE_COMPACT` 只接受 trim/lowercase 后的 `1` 或 `true`；原 HistoryUtils 决定活动父链、compact 与 revert 边界。reverted 且没有 lastMessageId 时活动历史为空。
- 先发 replay start / 标题，再转换原 AcpUtils 输出；顺序 offset、原时间戳、requestId、assistant/reasoning messageId、外层与 update 内层 metadata 保留，最后发 replay end。
- 预扫描 completed call IDs 和当前待决审批，只有没有结果、也不是待决审批的孤立工具调用被补 cancelled。
- MCP UI 从原持久化 toolResult/mcpUi 读取；可从 Defer 参数补原 MCP toolName，再读取 HTML。保留原300ms timeout、unref及早成功后未取消该timer的行为；父宿主拥有timer回收。reader rejection会让整个collect失败并标记trace失败，不改成静默吞错。
- 原任务artifact、checkpoint当前/备份内容比较、团队状态、当前interruption及usage分类都参与回放。外围服务失败保留原best-effort catch；回放输出按原顺序逐项await发送。恢复这些投影不等于整个任务/checkpoint/团队宿主已经恢复。

依赖显式注入：原 HistoryUtils/AcpUtils/timestamp/title/usage helpers，以及任务、checkpoint、文件版本、团队、trace服务。未配置时保留原异常/降级分支，不从安装目录或账号缓存自动寻找依赖；默认 env 为空。OpenAI SDK仍保留固定npm依赖。

## 原父链的恢复入口

验证使用真实 ACP SDK 和 Node loopback HTTP，经原 MVC/CLS、SessionMiddleWare/Factory、Manager/Store、AcpView.render/setSession、AgentService/Runner、完整InterruptionService继续执行真实SDK。

旧图先完成Read并写入原JSONL/meta，再完整关闭View、HTTP、ACP streams、服务、Subject和timer；第二个全新服务图仅借用同一自有磁盘根，不借用原session对象、SDK RunState或result。测试证明载入对象不同且state/result为空，旧历史确实进入新SDK请求，usage从32累加到64。这里是同一测试进程中的**完整服务图冷重建**，不是已经完成独立OS进程/daemon重启。

| 原入口 | 实际行为 |
| --- | --- |
| session/load | 从原Store恢复，原replay发送历史，再可继续新轮 |
| session/resume | 恢复同样历史但不回放旧消息，发布resume usage，再继续 |
| newSession + codebuddy.ai/continue | 内部body带continue，由原getMostRecent选择磁盘会话并回放 |
| session/fork | 修改版SDK有这个协议，但本版本AcpAgent没有unstable_forkSession；保留-32601和原诊断 |
| 内部HTTP forkSession/resume/sessionId | 原middleware创建并持久化分支，再用真实ACP load接入该分支 |

不为“支持fork”虚构新ACP方法：原CliRuntimeOptions白名单也不透传forkSession/resume/sessionId。fork测试通过内部HTTP原body入口执行，随后原ACP load交接。第一条render/iterator继续，两个后续HTTP请求结束，始终只有一个iterator。分支续跑后**源JSONL和meta字节都不变**，写入落在分支文件。

有意保留而未修正的原行为：

- CLI Store保存历史与meta，但不保存permissionMode Subject；seed会话在plan，冷图重新载入后是default，元数据标记和历史仍恢复。模型取当前父配置/CLI输入，不据此宣称桌面全部模式/模型配置已恢复。
- 缺失ID的load/resume未带字符串resume body，会按原middleware创建指定ID的空会话，而不是抛404；仍可正常执行SDK。
- 非法ID由原regex拒绝，经原HTTP500/ACP错误返回；失败的initializeSession暂留sessionRequest，随后成功resume覆盖并清除，不人为提前清空。
- fork源不存在时原入口失败，不创建目标文件，也不替换当前会话。

所有协议错误仍保留原SDK日志。负例只精确核对并登记预期method/code和诊断条目，任何额外错误仍使测试失败，不全局忽略error或清空日志。

## 验证与边界

```sh
npm run smoke:acp-replay
npm run verify:acp-replay -w @axonfire/harness -- /absolute/path/codebuddy.js
```

9组组件有限差分覆盖metadata/offset/usage、revert、孤立/已完成/待决工具、任务/checkpoint/团队/Plan投影、MCP HTML成功/失败/超时及emit顺序；4组冷恢复和4组异常入口执行完整真实ACP/HTTP/SDK，并与原片段成对运行。第67组核对完整factory和16函数AST，参考侧还替换完整原SessionManager/Store与SessionIngress；第65组既有12组父链也补上这两块原参考，不再共用迁移侧session实现。

新服务图采用显式自有时钟/UUID命名，比较完整回放包时只替换各自临时根前缀，不删除timestamp、offset或usage字段。只读写自有temp工作/状态文件与额外随机capability保护的loopback。任务/checkpoint/team/trace/底层HTTP等部分外缘是明确测试适配器，不是生产账户、远端REST或桌面UI。

OpenAI Docs仅用于核对[本地历史续轮与RunState恢复的区别](https://developers.openai.com/api/docs/guides/agents/results)，不把WorkBuddy存储替换成托管Agents API。

REA对完整回放模块、父装配和恢复场景三份惰性源码的最终证据为 `ev_aaad63cee936ed5d48ff5ca77468a470989df2b69d8ceb565f3faa3c838368eb`：12036 AST nodes、3 parsed、0 skipped/parse failures；750 semantic / 每文件750、150 unknown / 每文件150、45秒限制下仍partial/truncated。未运行原bootstrap，静态图不证明完整运行时等价。

仍需继续可复用默认native父装配、真实CLI/daemon进程重启、跨工作目录恢复/全部配置模式、生产auth/REST、Desktop HistoryStore与回放等；局部source AST及有限差分不等于完整harness已100%完成。

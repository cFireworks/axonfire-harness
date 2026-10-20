# 启动与验证

从仓库根目录执行 `npm ci && npm run build`，然后 `npm run demo`（离线）或 `npm start`（读取自己配置的 `.env`）。编译产物位于 `packages/harness/dist`，不提交到 Git。

Web 的 `--cwd` 指定工具工作目录：`npm start -- --cwd /absolute/path/to/project`。端口可用 `--port 3081` 或 `AXONFIRE_PORT` 配置。状态目录可用 `AXONFIRE_STATE_DIR` 指定。修改模型配置后重启服务；API key 不通过页面输入或浏览器持久化。

默认模型配置沿用样本；接入兼容供应商时应显式指定自己的模型名。`.env.example` 的模型只是配置示例，不代表对供应商当前可用模型的保证。普通聊天只需兼容 Chat Completions 的供应商，产品特定 WebFetch/媒体/IDE/外部 channel 能力仍需要独立适配与配置，不能仅靠一个模型 API key 代替。

`npm run cli -- --help` 不需要密钥或网络。CLI `-p` 为非交互单轮，未明确授权的工具默认拒绝；交互模式逐次询问。Web 与 CLI 的默认状态目录分离，可以通过 CLI `--state-dir` 或 Web `AXONFIRE_STATE_DIR` 显式共用。

本机端口被占用时换端口。浏览器请使用打印的 `http://127.0.0.1:端口`，不能替换成 `localhost` 或代理域名；这是 Host 校验设计。页面显示未配置时检查 `.env` 位于仓库根目录且密钥、接口均非空。模型失败只显示安全的通用错误，避免把上游异常中的认证头传给页面。

核心测试与 Web 宿主测试不使用本机真实模型账户，差分验证则需要固定样本 SHA-256 `4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd`。不包含样本的普通 checkout 仍可安装、编译、离线演示和运行回归测试。

历史报告中的根级 `src/`、`config/`、`test/`、`scripts/verify-*.ts` 现位于 `packages/harness/`。原逐项 `verify:*` 命令加 `-w @axonfire/harness`；推荐直接使用根级 `npm run verify:recovery -- /absolute/path/to/codebuddy.js` 执行全套差分。内置资源组还需要同一固定样本的Desktop main目录（index.js、workbuddy-product-config.js、common.js）；不在原app布局时设置`WORKBUDDY_DESKTOP_MAIN=/absolute/path/main/index.js`。这只用于差分验证，普通安装/编译/启动不需要原应用。

## 本批验收（2026-10-20）

仅克隆本项目到干净目录，不复制安装包、原 bundle 或现有 node_modules：`npm ci`、`npm run build`、`npm test`（619 核心 + 10 宿主）、`npm run verify:config` 全部通过。独立 `npm run smoke:launchers` 启动 CLI help，再启动临时端口 Web demo，通过真实 SDK / harness 获取流式完成事件并正常退出。编译后 smoke 541 项与显式样本输入的 34 组差分通过。依赖锁中的既有包版本无变化。

浏览器手动验收实际发送了一轮离线演示消息，确认增量文本、会话列表更新和完成后按钮状态恢复；截图位于 `docs/images/web-demo.png`。没有使用真实供应商密钥验证远端模型；没有据此声明所有供应商兼容或产品全部能力已恢复。CI 只是已加入仓库的定义，远端执行结果需以 GitHub Actions 实际记录为准。

审批控制器后续批次已将门槛提升为672核心 + 10宿主、594编译smoke、37组差分。嵌入API的 `createHarness({ nativePermissions: true, nativeApprovals: true, ... })` 可同时启用完整原权限分类/SDK缓存与完整原InterruptionService控制器。两项独立开关默认关闭，CLI/Web仍使用可用的兼容审批宿主；不需要为了启动启用开发者选项。

`approvalController` 可注入 `sdkPermissionClient.requestPermission(toolName, input, callId)`、`sdkHooksManager`、workflow resolver、mandatory target判断、trace和广播诊断依赖。会话 `options.inputFormat = "stream-json"` 且非ACP时走SDK客户端，不再同时询问本地UI；显式客户端返回allowed后会登记独立宿主guard授权，updatedInput按源码浅合并。未配置SDK客户端会进入源码的错误拒绝路径，不伪造同意。普通text路径仍通过 `approveTool` / `askUserQuestion` 交互，默认不自动允许。

以上不等于原产品的完整SDK启动程序、ACP服务、SettingsManager磁盘持久化或Auto classifier backend已恢复。特别是原控制器CLI拒绝会abort并记录skipRun结果，而非调用RunState.reject后继续执行；宿主等待该结果落盘后结束。模型和所有依赖版本未升级。

## SDK 控制协议（嵌入 API）

最新SDK协议批次门槛为693核心 + 10宿主、615编译smoke、38组差分。核心SDK控制与初始化的12个原类、四个SessionManager override方法、75处完整方法/函数AST与794组协议比较通过。

提供 `createHarness({ ...modelOptions, sdkControl: { stdout: controlOutput } })`，其中 `controlOutput` 是调用方拥有的Node Writable式对象（write/once/removeListener）。不会自动绑定process.stdin、读取安装应用的账户，或把新协议误当成现有CLI flags。建议使用独立控制通道，不与普通文本/日志混流；控制输出按源码为JSONL。`sdkControl` 默认启用 `nativePermissions` / `nativeApprovals`，新打开的会话走 `inputFormat: stream-json`。

将收到的控制对象传入 `harness.sdkControl.receive(message)`，或将已完成JSONL分帧的单行传入 `receiveLine(line)`。外层输入读取、普通user消息到prompt的投递、断线检测仍由嵌入方负责。断线时调用 `sdkControl.close()`，关闭整个harness时也会自动清理；不会关闭调用方拥有的输出stream。

例如权限请求的回复结构（request_id原样对应收到的perm_请求）：

```json
{"type":"control_response","response":{"subtype":"success","request_id":"perm_...","response":{"allowed":true,"updatedInput":{"content":"由调用方确认的内容"}}}}
```

`hook_`、`mcp_`、`elic_`响应也按原前缀分发；MCP成功payload为 `response.mcp_response`，Hook成功payload为原hook输出对象。权限请求默认无超时，Hook默认60秒；关闭可取消全部pending。`initialize`、`get_available_modes`、`get_available_models`、`set_permission_mode`、`set_model`已注册。独立宿主默认initialize返回account:null，不映射模型API key为产品账号。

`sdkControl.initializeDependencies` 可覆盖原ProductManager/env/账号等依赖。ProductManager现已默认接入：systemPrompt/appendSystemPrompt/agents经原provider合并后重建Agent，不再返回“缺少adapter”或只回复成功而不生效。环境切换仍需真实adapter，不返回假成功。后续MCP批次已接入原SdkMcpServer/transport与Hook proxy，见下节；SDK stdin/headless启动程序、鉴权命令及其余产品provider仍未完成。显式SDK客户端allowed可授权独立guard；Hook allow与完整native政策到guard的统一仍是后续默认路径对齐边界。

## 原生 MCP（嵌入 API）

最新门槛见[还原状态](recovery-status.md)末尾。完整原MCP类群、ProductManager、文件/模型providers及企业模型策略已接入。插件loader、active snapshot提交和完整刷新事务、本地/Git/HTTP/ZIP市场与市场存储/文件锁/更新检查现已接入。Git/npm/subdir安装器、原OptionsStorage/ErrorCollector、SettingsManager和PluginPolicy现默认接入；内置seed/controller/validator已接显式资源根。权限/MCP专用的局部内存settings消费者、Cloud product及完整产品bootstrap仍待补，不能因核心设置类恢复而宣称所有持久化接线完成。

普通嵌入调用可在已有模型配置上添加：

```js
const harness = await createHarness({
  ...modelOptions, // 现有 workDir / stateDir / 模型配置，或测试用 modelProvider
  nativeMcp: {
    servers: { owned: { type: "http", url: "http://127.0.0.1:4000/mcp" } },
  },
  approveTool: async (name, input, session) => askOperator({ name, input, session }),
});
try {
  const session = await harness.openSession();
  await harness.prompt(session, "调用 owned 的工具");
} finally {
  await harness.close();
}
```

地址仅为示例，需要你自己运行并信任该MCP服务；不自动启动示例端口或读取原应用配置。`nativeMcp.servers` 在创建时连接；后续可用 `harness.connectNativeMcp(name, config)` 添加/替换，`harness.nativeMcp.delete(name)` 删除。连接数组按源码保持同一动态对象，因此已创建Agent也能看到变化。`nativeMcp` 与 `sdkControl` 现在默认启用原权限服务和审批控制器，包括延迟MCP工具的审批；普通CLI/Web默认路径不变。不建议显式关闭这些native开关，兼容路径并不等价于原权限策略。

stdio配置按原字段提供 `command`、`args`、`env`，还必须提供 `nativeMcp.endpointProvider.get()`，返回由调用方实际拥有的Hook服务地址；缺省明确报错，不虚构产品网关。HTTP/SSE默认仅适合无鉴权公共服务或调用方显式配置的认证头；产品OAuth流程尚未还原，可通过 `oauthManager` 注入。执行stdio命令和连接任意URL具有本机权限，嵌入方负责配置可信度与网络限制。

提供 `sdkControl` 会默认创建原生MCP宿主。收到原 `initialize` 请求时，其中SDK MCP配置会注册到同一连接列表，并通过已恢复的 `mcp_` 请求/`response.mcp_response` 往返JSON-RPC。不要将 `type:"sdk"` 放入启动期 `servers`，应在控制接收器就绪后使用initialize，避免启动等待尚不可回复的协议。重复相同配置的initialize不重新握手；控制断线/关闭会终止pending请求。完整示例见 `packages/harness/test/mcp-native-runtime.test.ts`，测试仅启动自有loopback/stdio peer。

大结果落盘使用当前宿主state目录下的原生MCP输出路径，不读取安装应用数据；保留原完整读取提示、字符截断和image规则。OpenAI SDK仍是外部依赖，仅在Agent工厂补回样本SDK转换器的MCP `needsApproval` 字段，保证原proxy审批回调确实被调用。channel security、OAuth、遥测/支付与ACP广播仍为显式依赖边界，不因类方法已恢复就宣称整个产品服务完成。

### 配置作用域与热刷新

`harness.nativeMcp.projection` 提供原 `manager`、`config`、`configStore`、`permissions`、`toggle`、`diagnostics`、`ready` 等对象。配置优先级保持原序：internal > sdk > dynamic > local > project > user > plugin。项目级配置在批准前不会创建transport，也不允许listTools/getPrompt；批准连接后，原延迟索引提交完成才发布到Agent连接列表。

```js
const projection = harness.nativeMcp.projection;
await projection.manager.add("owned", { type: "http", url: trustedMcpUrl }, "project");
const pending = await projection.manager.getAllNeedingApproval();
// 经由自己的交互明确确认 pending 后，按实际选择调用 allow 或 deny
await projection.manager.allow(["owned"]);
await projection.manager.waitForPendingServers({ names: ["owned"], timeoutMs: 5000 });
await projection.drain(); // 独立宿主提供的异步/索引/关闭工作屏障
```

原 `manager.add` 默认scope是local，`connectNativeMcp` 为保持显式嵌入配置默认使用dynamic；传第三参数可指定scope。需要先等待用户批准的project配置应使用manager.add，而不是等待立即连接成功的connectNativeMcp。配置级allow不等于工具调用自动批准；实际调用仍遵循原ToolPermissionService/审批控制器。

`nativeMcp.projection.scopes` 可显式初始化各scope。`filesystemScopes` 默认空，不自动加载安装应用用户配置；按需传 `['project']`、`['project-local']` 或 `['user']`，其中project-local是SettingsScope名称，对应MCP的local。独立宿主将用户/全局路径重定向到state目录内的 `mcp/`，project路径仍按原 `.mcp.json` / `mcp.json` 优先级解析当前工作目录。显式写project配置会写入该项目的MCP文件；不是只写内存。项目批准settings默认只在当前进程内存保存，可注入projection.settings提供自己拥有的作用域list/set存储；这不等于完整原SettingsManager磁盘服务。

`config.invalidateFilesystemScopeCaches({ includeUser: true })` 后调用 `manager.list()` 重新投影文件配置；`manager.reloadPluginServers()` 失效并重投影插件配置。插件来源默认沿用显式 `agentManager.plugins`，也可用 `projection.plugins` 覆盖；不自动发现或安装真实插件。原ConfigManager对文件删除的缓存语义和strictDynamic的特殊scope读取顺序保持不变，详见测试。原生projection拥有连接时，不再接受 `harness.mcp.register` / `nativeMcp.registerExternal` 塞入绕过配置的实例，改用上述配置接口。

旧代连接、listTools或索引结果晚到时按原generation/fingerprint拒绝提交；配置撤销、删除与工具列表变化清理/重建索引。`close()`取消本宿主调度、订阅并等待当前/旧连接的关闭，不停止调用方外部服务。完整产品命令/UI、OAuth服务、插件自动事件编排与原SDK stdin程序仍未恢复。

## ProductManager 与配置刷新

`createHarness` 现在默认创建原ProductManager与五种原合并策略；`harness.product` 仍是供已有模块读取的live配置视图，`harness.productManager` 是拥有关闭检查与发布屏障的API，`harness.productRuntime.manager` 是完整原类。默认以固定原JSON为base，不请求原产品配置服务器、不读取安装应用账户或缓存。

```js
await harness.productManager.sync(true); // 全provider，包含force标记
await harness.agents.waitForRebuildSettled(0);
await harness.productManager.syncVolatileProviders(true); // 从稳定快照重放volatile provider
await harness.agents.waitForRebuildSettled(0);
```

同步后的prompt/Agent/tool描述索引与命令表会刷新。SDK控制通道的initialize现可应用systemPrompt、appendSystemPrompt和自定义agents（每项须有description/prompt），仍按原字段，不把自定义Agents SDK接口冒充原JSONL协议。MCP prompt在连接后通过原provider转成命令，原renderer负责引号参数、角色/资源文本和剩余参数；必要时调用全量sync等待发现，不把volatile sync误当成刷新全部MCP prompt。

`productRuntime.providers` 可附加显式provider（priority > 0，provide({force,current})；按需声明volatile）。默认接入原Client/Env/CLI options/SDK initialize/Plugins/MCP prompt/default provider、CustomAgents/CustomCommands、Models/CustomModels、Agent model解析/可用过滤/企业策略与Craft-to-cli同步，以及已有Skill provider和明确标记的宿主命令/skill选项适配器。Cloud product、完整环境/插件加载与原子跨服务刷新仍待补。插件组件来源默认沿用显式agentManager.plugins，移除插件后重放volatile快照不会残留其Agent instructions或命令。

### 本地 Agent、命令与模型文件

工作目录支持 `.codebuddy/agents/**/*.md`、`.codebuddy/commands/**/*.md` 和 `.codebuddy/models.json`。Agent采用完整YAML frontmatter，命令采用原简单frontmatter解析；不要假设两者对嵌套YAML的行为相同。子目录命令使用`dir:name`，执行时加`/`。新增目录可调用 `await harness.productManager.sync(true)` 显式刷新；已有受watch目录按原2秒初始化/3秒debounce规则刷新，models.json已有文件的独立watch使用1秒debounce。

用户路径重定向到本次state，**不是系统home或已安装WorkBuddy**：Agent为`<state>/agents/`，命令为`<state>/commands/`；WorkBuddy模型默认为`<state>/.workbuddy/models.json`，可由原`config.customUserDataDir`覆盖。嵌入时可显式传`productRuntime.env.WORKBUDDY_CONFIG_DIR` / `CODEBUDDY_CONFIG_DIR`改变模型路径，并通过该owned env展开`${KEY}`/`${URL}`；此env默认空对象，不自动拷贝宿主环境或安装账号。原模型前缀feature开启时，本地id变为`custom-local:<id>`，原id保留为alias。

企业来源仅通过`productRuntime.sources.authenticationManager`（含`currentSessionSubject`）与`restOperations.get`显式注入；原模型接口/策略URL、缓存与失败处理保持样本行为。默认无企业账号，永不从模型API key推断产品账号。策略磁盘缓存写入本次owned home下`.codebuddy/.policy-cache.json`，不是原应用缓存。`productRuntime.watch:false`禁用宿主watch，仍可手动sync。

删除普通Agent文件会移除配置快照中的定义；原AgentManager已注册的非插件实例缓存仍可能残留，这是保留的样本行为。自定义模型文件可能包含密钥，请勿提交实际凭据。`models.json`不是安全沙箱或受信任来源验证器。

## 可信本地插件与刷新

CLI：`npm run cli -- --plugin-dir /absolute/plugin --cwd /absolute/project`；Web：`npm start -- --plugin-dir /absolute/plugin`。参数可重复，路径相对于工作目录解析。嵌入时使用`nativePlugins: { directories: [...] }`，环境变量替换只消费显式`nativePlugins.env`，不自动复制安装应用账号或宿主环境。

插件目录中应有`.codebuddy-plugin/plugin.json`（也保留`.workbuddy-plugin`、`.claude-plugin`搜索顺序），至少声明`name`。原loader支持默认或manifest指定的Agent/command/skill目录、`hooks/hooks.json`、`.mcp.json`、`.lsp.json`、`output-styles`与`settings.json`。命令名为`/<plugin>:<command>`；插件Agent只认可当前模型id，命令另支持模型显示名转id，行为不同。Hooks和带user_config的配置保留原变量、敏感值隐藏及原Zod3校验。

输入`/reload-plugins`可刷新同一active snapshot及MCP/LSP/工具/配置/命令/输出样式/Agent。已产生模型输出、当前Agent不含ToolSearch且MCP有效server名称集改变时，原处理器要求`/reload-plugins --force`。该检查按有效名称集合，不是任意配置变化检测。SDK新运行等待刷新队列完成，再取重新构建的托管Agent。Web与嵌入`harness.prompt`也走本地命令分派；结果写JSONL并返回/流式输出，不多调用模型。

原PluginManager完整194个成员已移植，但不代表全部外部服务已恢复。市场Factory、本地/Git/HTTP/ZIP provider、Local/Git/npm/git-subdir安装器、Storage/ConfigManager/BuiltInProvider、FileLock/更新检查与原OptionsStorage/ErrorCollector现在默认接入；MCPB下载、真实完整磁盘Settings/策略服务仍需恢复或显式适配。Node文件桥不是原fs-extra，写入与清理限制在本次state，拒绝外部symlink路径；不是OS沙箱。无需安装WorkBuddy即可使用以上链路。

### 本地目录市场（嵌入接口）

市场根目录包含`.codebuddy-plugin/marketplace.json`（同样按原顺序兼容另两种metadata目录）。例如：

```json
{"name":"my-market","plugins":[{"name":"my-plugin","source":"./plugins/my-plugin"}]}
```

`plugins/my-plugin`仍采用上面的插件结构。默认可在`<state>/settings.json`配置`extraKnownMarketplaces`和`enabledPlugins`（见下方设置说明），无需注入存储。兼容的显式`nativePlugins.settings`作用域视图仍可用：在`get('extraKnownMarketplaces', 'user')`返回`{"my-market":{"source":{"source":"directory","url":"/absolute/market"}}}`，在`get('enabledPlugins', 'user')`返回`{"my-plugin@my-market":true}`，其他scope返回`undefined`，并提供`clearCache()`。原ConfigManager的对象source读取的是`url`而不是`path`，此处刻意保持原行为。显式只读视图不能承担修改启用状态；若覆盖默认服务，须自行提供需要的`update/set/list`接口。

`await harness.pluginManager.addMarketplace('/absolute/market')`也可添加可信目录；保存到`<state>/plugins/known_marketplaces.json`，重启后原manager恢复该记录。添加市场不等于批准/启用其全部插件。`pluginHost.marketplaceStorage`暴露原保存/移除API；修改后使用原刷新事务更新消费者。原PluginController与Validator现暴露于嵌入接口，但完整`/internal/plugin`路由bootstrap和Web市场管理界面尚未恢复，当前CLI/Web仍可用更直接的`--plugin-dir`。

### 内置资源物化与注册

```sh
npm run cli -- --builtin-assets /absolute/path/to/trusted/resources --cwd /your/project
npm start -- --builtin-assets /absolute/path/to/trusted/resources
```

可信资源根目录应包含`plugins/workbuddy-builtin`及其原市场清单/插件文件。默认不探测安装应用目录；没有显式参数时不执行物化。资源包中的原生二进制、vendor压缩包和第三方MCP程序不随本仓库分发，插件自身的服务/依赖/平台要求也不会被harness自动补齐。演示模型离线不等于显式插件的Hook被禁用，只加载你有权使用并信任的完整资源。

原资源解析器保留7级候选：显式Electron-style resourcesPath下的app.asar.unpacked/resources、app.asar.unpacked，然后root、root/../resources、root/resources、root/../..、root/../../resources。嵌入可经`nativePlugins.builtinSeed: { assetsRoot, appVersion?, resourcesPath?, platform? }`指定；resourcesPath只接受显式值，不读取已安装产品。原候选会查看父级目录，assetsRoot不是硬读取沙箱。写入桥限制到本次state/plugins；不修改资源源目录。

物化使用原两树布局：`<state>/plugins/marketplaces/workbuddy-builtin`为可替换source，`<state>/plugins/cache/workbuddy-builtin/<plugin>/<version>`为不可变snapshot。同版本有效snapshot不会因文件body变动而重拷贝；版本升级另建snapshot，不覆盖旧版本。无版本时使用原`5.3.14+825709d464` fallback（appVersion可注入）。逐文件复制跳过symlink并记录probe/copy失败；未改成fs.cpSync，也不能当作恶意资源的沙箱。

物化代码不写settings/known_marketplaces/installed registry。它产出原metadataRequest，由同一个原PluginController→PluginRuntimeRefreshService→PluginManager在原锁下提交注册/默认值/installed记录。模式沿实际ProductManager.productFeatures：IntentRecommend非精确true时all；否则按TencentPptxBuiltinDefaultEnabled的精确false门槛选择defaults或none。默认启用仅考虑category=builtin-plugin，all也不全局启用mode/template/skill/mcp-app；已有false/其他值不覆盖。注册失败回滚metadata，不删除已物化资源；原锁竞态和降级边界仍在。

`harness.pluginHost.builtinSeedHost.seed()`可重新物化并交接，返回`{materialization, metadata}`，controller返回的runtimeProjectionSucceeded=false代表metadata已提交但投影失败，并非原子回滚所有服务。`pluginHost.controller`保留原23个方法，`pluginHost.pluginValidator`提供原manifest校验。控制台/文件/TTY readline与Promise所有权由宿主适配；关闭会取消自己的确认问题并等待已接受任务。独立启动等待初始seed完成，不冒充Electron原15秒提示的后台RPC交接、daemon会话池刷新或完整session-addon路径。

跨进程锁位于`<state>/tmp/*.lock/lock.json`，只做PID的signal=0存活探测。市场存储拿锁失败时原逻辑会警告并降级为进程内锁；损坏JSON会先移动到`.broken-<timestamp>`，后续写入重建。原瞬时rename错误最多初次加5次重试。只加载可信市场：本地源路径检查为原词法边界，不能把它当作symlink隔离/插件沙箱。默认内置市场profile为空，不自动联网安装样本中的官方市场。

### 远端市场（嵌入接口）

文件锁另有保留的原竞态：新锁目录的lock.json发布前可能被另一进程当作坏锁回收，导致双持锁/丢更新。不要将多个写入进程的全部并发安全当作已证明；这不是强一致数据库。确定性原样本/还原对照及有效锁争用测试分开覆盖，不静默改写原协议。

同一`addMarketplace()`现支持显式可信的Git仓库、HTTP JSON或ZIP地址；例如`await harness.pluginManager.addMarketplace('https://your-trusted-host/market.zip')`。作用域设置也可使用`{"my-market":{"source":"url","url":"https://your-trusted-host/market.zip"}}`，由原parseSource按.zip识别；配合`enabledPlugins`选择具体插件，原启动链可解包、物化到版本cache并在重启后恢复。SDK只在插件启用后消费其Agent/命令/Hook，不默认批准全部市场内容。

Git克隆放在`<state>/plugins/marketplaces`；原更新会reset --hard并clean -fd，宿主仅允许在state内自有clone执行。默认Git需要PATH中存在git，不使用本机SSH key/agent或用户Git配置；认证SSH请显式注入`nativePlugins.marketplaceRuntime.exec`提供自己的实现。公开HTTPS仍依赖本机git/网络/TLS；测试仅使用自有file://仓库，未访问真实生产仓库。

HTTP provider按原实现只下载清单，并把插件路径附加到完整base URL（包括marketplace.json），不是浏览器式相对路径解析。ZIP下载/HEAD采用原重定向、ETag与版本检查逻辑；只有404触发main/master互换。`.tgz/.tar.gz`仍有原格式边界，不当作已支持完整tar市场。ZIP不限制总解压体积/条目数，插件可能自动执行Hook，只能使用可信输入，不提供公网解包接口。

ZIP第三方依赖固定样本`yauzl 3.2.0`，新增一项[中危时间戳解析告警](https://github.com/advisories/GHSA-gmq8-994r-jv83)，当前npm audit共17项（10中危/7高危）。原提取路径未调用告警对应的`entry.getLastModDate()`，这不等于整体安全证明；未自动升级或修改原控制流。远端TLS/代理/认证/真实市场资源与所有平台故障仍需继续验证。

### 独立插件来源与选项

可信市场的plugin entry支持原source形状：Git为`{"source":"url","url":"https://your-trusted-host/plugin.git","sha":"40位完整SHA"}`或`{"source":"github","repo":"owner/repo","ref":"main"}`；子目录为`{"source":"git-subdir","url":"...","path":"nested/plugin"}`，同样可带ref/sha；npm为`{"source":"npm","package":"your-package","versionConstraint":"^1.0.0","registry":"https://your-trusted-registry"}`。配置具体enabledPlugins后，原启动链选installer并物化到版本cache；Git/npm/subdir三种真实SDK路径和重启均已用自有fixture验证，未访问生产仓库/registry。

npm必须使用可信包和registry：原安装参数没有ignore-scripts，启用插件会运行npm生命周期脚本。默认HOME/npmrc/cache均重定向到本次state，但脚本不是沙箱，仍可访问宿主权限允许的资源。源码保留的名称正则接受前导连字符，不要把其视作完整argv安全校验。原npm.update还有嵌套prefix计算边界，未静默改成另一套更新算法。

声明userConfig的插件可经`await harness.pluginManager.savePluginOptions(name, marketplace, values)`保存，`getPluginOptions(name, marketplace)`读取。随后`await harness.pluginRuntimeRefresh.refresh('reload-command')`使loader重新消费。默认非敏感值现写`<state>/settings.json`的USER/pluginConfigs；敏感值按原实现转字符串、明文写`<state>/credentials.json`的pluginSecrets，首次创建mode0600，不加密、不读取已安装应用凭据。敏感标志只认精确true，未传入的旧值仍保留；跨存储写入不是事务，部分失败可能已写新secret但缓存仍旧。

`pluginHost.pluginOptionsStorage`暴露原load/save/delete/has/clear/substitute方法，`pluginHost.errorCollector`暴露原错误检索与清理。默认依赖完整原SettingsManager；旧`plugins/plugin-options.json`如存在会保留，并只迁移USER/pluginConfigs中缺失的插件项，不覆盖新文件已有项，不做跨存储事务。显式提供nativePlugins.settings时请提供原OptionsStorage需要的get/set/list；仅get的视图仍可加载，但保存/删除按原失败分支处理。完整`/plugin`控制器与市场管理UI仍未恢复。

`harness.pluginManager`为当前来源，`pluginRuntimeRefresh.refresh(reason, options)`为原队列服务，`pluginHost`暴露原类与宿主生命周期。已有`agentManager.plugins`只读adapter继续兼容，但不冒充完整manager，也不会自动启用原刷新事务；同时提供`nativePlugins`时必须明确共用同一个完整manager。显式LSP配置在插件刷新后由宿主重新注册，不被原LSP shutdown顺带清除。

插件可能含可执行Hooks，加载即表示信任其内容；本地命令/Hook不是OS沙箱，也不是逐次工具审批。MCP自动接线只在显式`nativeMcp`宿主启用时生效；CLI/Web新增目录参数并未暗中扩大MCP/legacy工具allowlist。卸下插件可删除其manifest后reload；原plugin-tag实例会被清理，和普通文件Agent缓存残留行为不同。

上一批全新空目录验证包括105项插件/市场/安装器编译后测试与11项Web测试；设置模块的最新门槛与干净快照结果见[还原状态](recovery-status.md)末尾。差分需用户自行提供固定SHA样本，日常构建/启动不需要原应用。semver仍7.7.2、async-mutex仍0.5.0、yauzl仍3.2.0，未改变依赖锁，audit风险仍17项，详见远端市场边界。

缓存默认用本宿主独立的原MemoryLocalStorage；可用`productRuntime.storage`注入自己拥有的get/set及可选getSync。缓存保留原gzip/base64、稳定快照与版本key，不自动读取原应用的本地存储。`productRuntime.env`是显式拥有的配置环境对象，默认空；原Env provider可处理其中的ACC_PRODUCT_CONFIG等字段，不会自动扫描进程中可能包含账号的产品配置环境。模型API key仍使用原CLI/Web自己的配置，不映射为产品账号。

原ConfigWatch/McpWatch服务默认接线：文件watch setup延迟2秒、change debounce 3秒、rename即时刷新；MCP connected/disconnected合并后触发全量sync。用户/项目路径沿宿主state/工作目录，不监听安装应用目录；`productRuntime.watch:false`可禁用。原watcher unref，不靠它保持进程存活，关闭会取消订阅、watcher及pending任务，防止关闭中的初始化重新挂载。默认已连接原SettingsManager.clearCache；全局CWD变化也清理设置缓存。

### Cloud 产品配置（嵌入接口）

原CloudPre/CloudProvider默认位于同一ProductManager的9999/10000优先级。无账户或精确`ApiKey`类型不会请求云配置；模型API key不作为产品账户。不会读取已安装应用令牌，也不自动请求生产Cloud endpoint。现阶段CLI/Web不提供登录UI；如需云配置，嵌入时显式提供自己拥有的账户和transport：

```ts
import { BehaviorSubject } from 'rxjs';
// createHarness 以及模型连接沿上文配置；以下只展示产品配置选项。
const cloudURL = 'http://127.0.0.1:4080'; // 自己控制的配置服务
const productRuntime = {
  cloud: {
    authenticationManager: {
      currentSessionSubject: new BehaviorSubject({
        account: { uid: 'my-owned-account' },
        auth: { accessToken: 'owned-product-token', tokenType: 'Bearer' },
      }),
    },
    transport: { baseURL: cloudURL },
  },
  providers: [{
    priority: 6000,
    async provide() {
      return { endpoint: cloudURL, config: { url: cloudURL + '/v3/config' } };
    },
  }],
};
// await createHarness({ ...yourModelOptions, productRuntime });
```

服务返回`{"data":{"agents":[],"models":[]}}`，transport负责外层HTTP响应包装。上述示例不发送认证header；如服务需要，可在`transport.headers`明确配置自己的header，令牌不会自动从账户映射。transport限定显式origin、不跟随重定向、5秒超时覆盖body；这是新增owned Node HTTP边界，不是原CellJS/Axios认证中间件。

远端models是权威列表，空数组会移除所有模型，实际使用须返回完整有效列表；要注册可用Agent还须含原`cli`标签和有效models。原CloudAgentsSmartMerge开启时同名Agent的本地字段优先，仅远端显式models覆盖。远端endpoint/stagingEndpoint/deploymentType不进入产品配置。产品配置endpoint与模型API baseURL不是同一配置，勿借前者隐式重定向模型请求。

`harness.productRuntime.cloudHost.manager`暴露原fetch/reset等接口；清指定用户缓存再`await harness.productManager.sync(true)`及`await harness.agents.waitForRebuildSettled(0)`可显式应用新配置。仅force sync不会绕过8分钟缓存，重试成功也不会自行发布产品更新。关闭harness会取消owned HTTP并唤醒/收敛后台重试。`productRuntime.cloud:false`显式排除这两个provider。

原`cloud_product_config_cache`默认落在本宿主的MemoryLocalStorage，方法名readDiskCache并不代表默认已持久化。需要跨重启时明确注入`cloud.localStorage`或`productRuntime.storage`的get/set协议；磁盘记录无过期检查，最多20条。Cloud缓存内容属于账户配置，不应提交到Git。

### 原生磁盘与 CLI 设置

默认按USER→PROJECT→PROJECT_LOCAL→CLI合并，路径分别为`<state>/settings.json`、`<cwd>/.codebuddy/settings.json`、`<cwd>/.codebuddy/settings.local.json`；不读取`~/.codebuddy`或安装应用设置。支持JSONC注释/尾逗号，USER叠加原DEFAULT_SETTINGS，写入剔除默认差值并保留注释。数组按原Set并集，hooks/permissions/memory/sandbox递归合并，其他对象后项覆盖。原USER磁盘sandbox读入是浅覆盖默认值，不擅自改为深覆盖。

```sh
npm run cli -- -p "你好" --setting-sources none --settings '{"reasoningEffort":"high"}'
npm start -- --settings /absolute/path/to/trusted-settings.jsonc --effort high
```

`--setting-sources user,project,local`可调整顺序；`none`只排除磁盘scope，CLI仍应用。`--settings`识别JSON对象字符串或相对cwd文件；`--effort`只接受minimal/low/medium/high/xhigh/max。它们在CLI和Web启动器均可用。文件可含自动执行Hook，只加载可信设置，none不是OS沙箱。原logger可能记录CLI设置对象，不要在设置JSON中放账户密钥；模型密钥仍用环境变量。

嵌入接口：`harness.settingsManager`为完整服务，提供get/list/set/add/remove/update/clearCache；`harness.settingsHost`拥有CLI队列和关闭屏障。`nativeSettings.cliOptions`可提供`settings/settingSources/model/effort`。显式`options.settings`仍是全局只读覆盖；显式`nativePlugins.settings`仅覆盖插件作用域视图，两者不是同一接口。仅使用旧`agentManager.plugins`且不启用nativePlugins时保留旧只读路径，不自动创建此设置宿主。

可调用`await harness.pluginManager.disablePlugins(['name'],'market')`、`enablePlugins`、`uninstallPlugins`，默认写原enabledPlugins配置。写入后自动排队原settings-change刷新；需要立即等待消费者完成时调用`await harness.pluginRuntimeRefresh.waitForRefreshSettled()`，或显式reload。原PluginPolicy从ProductManager的builtInMarketPluginsMerge读取并监听更新；canRemove/canSwitchoff/canEdit只认精确false，版本/说明单独变化不触发策略事件，市场阻断检查按原实现恒false。

损坏JSON重试后会标记scope并拒写，绝不自动修复/备份覆盖；手动修复后需clearCache并成功读取，单独clearCache不会移除损坏标志。缓存60秒，CLI scope不可经SettingsManager修改。文件锁复用原协议及其发布竞态/拿锁失败继续执行的边界，不能视为跨进程强事务；权限/MCP局部内存适配尚未全部切换为该服务。

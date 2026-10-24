// @ts-nocheck
// Whole original coordinator, dependency declarations and selected original initializers.
import * as nodeFs from 'node:fs';import * as nodeOs from 'node:os';import * as nodePath from 'node:path';import {fileURLToPath} from 'node:url';
export const AUTH_PRODUCT_COORDINATOR_SOURCE=[{"file":"common.js","sha256":"786cdfa0ec67e97753b4bc3e476f4582f10f4ccba694b5a9ec7de121478708a7","regions":[{"from":36018,"to":36626},{"from":37727,"to":79362},{"from":89840,"to":89888},{"from":2542088,"to":2542419},{"from":2542421,"to":2542511}],"names":["ProductEnviroment","MergeStrategy","ProductFeature","PRODUCT_CONFIGURATION_CACHE_TIMEOUT","ENV_KEY_CODEBUDDY_COPILOT_INTERNET_ENVIRONMENT"]},{"file":"dev-env-override.js","sha256":"0140fa688aa6ff713b28e87119774733d8e0e1621d319c086319933580e0e1f7","regions":[{"from":2767,"to":3039},{"from":3941,"to":4123},{"from":4124,"to":4240},{"from":4939,"to":5313},{"from":5957,"to":6256},{"from":6430,"to":6505},{"from":6567,"to":6673},{"from":6675,"to":6787},{"from":6789,"to":6824}],"names":["readCustomEnvs","getOverrideFilePath","isDevEnvOverrideEnabled","readDevEnv","resolveEndpointOverride","DEV_ENV_ENDPOINTS","ARDOT_DEV_ENV_ENDPOINTS","devEnvOverrideForceEnabled"]},{"file":"workbuddy-product-config.js","sha256":"3a3e001bb227550087d735d07e470a9d06ac8d29141ea1764e0eb48c6e467251","regions":[{"from":1176,"to":1228},{"from":1229,"to":1289},{"from":1290,"to":1471},{"from":1849,"to":2040},{"from":2474,"to":2500},{"from":3386,"to":3775},{"from":3776,"to":3934},{"from":3935,"to":4103},{"from":4511,"to":5341},{"from":5342,"to":5889},{"from":5890,"to":6387},{"from":6388,"to":6849},{"from":6850,"to":7285},{"from":7286,"to":7408},{"from":7409,"to":7713},{"from":7714,"to":7806},{"from":7807,"to":7914},{"from":7915,"to":8060},{"from":8061,"to":8160},{"from":8161,"to":8290},{"from":8291,"to":8382},{"from":8383,"to":8508},{"from":8874,"to":9126},{"from":9398,"to":10430},{"from":10431,"to":10706},{"from":10707,"to":11005},{"from":11006,"to":11204},{"from":11205,"to":11339},{"from":14766,"to":15491},{"from":15833,"to":19741},{"from":20387,"to":20845},{"from":20846,"to":21419},{"from":21729,"to":22345},{"from":22346,"to":22531},{"from":22532,"to":22956},{"from":22957,"to":23157},{"from":2560,"to":3314},{"from":8569,"to":8620},{"from":8622,"to":8685},{"from":8687,"to":8721},{"from":8723,"to":8762},{"from":8764,"to":8793},{"from":23463,"to":23530},{"from":23532,"to":23588},{"from":23590,"to":23637}],"names":["setBundledAssetsRoot","getAssetsRoot","getElectronResourcesPath","resolveBundledAsset","_root","CANDIDATES_FNS","resolveMacInstallChannelDir","resolveMacInstallChannelPath","resolveMacInstallChannelUpdateMarkerPath","reconcileMacInstallChannel","applyMacInstallChannelToProductConfiguration","consumeFreshUpdateMarker","getInstallChannelSeed","readInstallChannelRecord","readJsonFile","writeJsonAtomically","deleteFile","normalizeString","normalizeChannel","isRecord","getProductVersion","getBundleId","INSTALL_CHANNEL_FILE_NAME","UPDATE_MARKER_FILE_NAME","UPDATE_MARKER_TTL_MS","DEFAULT_APP_SUPPORT_NAME","consumedUpdateMarker","resolveAccProductConfigCachePath","assignAccProductConfigV3ToProcessEnv","setInlineAccProductConfigV3","readProductConfigurationFromDisk","getWorkbuddyBaseProductConfiguration","tryGetWorkbuddyBaseProductConfiguration","resolveWorkbuddyProductEnvironmentFromSession","buildWorkbuddyResolvedProductConfiguration","getMergedAuthenticationConfiguration","getWorkbuddyEnvironmentProductConfiguration","mergeNamedArrayLayers","mergeObjectLayers","isMatchingDomain","import_common","cachedBaseProductConfiguration","cachedBootstrapProductConfigurationEnv","cachedEnvironmentProductConfigurations","ACC_PRODUCT_CONFIG_PATH_ENV","ACC_PRODUCT_CONFIG_INLINE_ENV_MAX_BYTES"]},{"file":"workbuddy-auth-product-coordinator.js","sha256":"8624215504229c4b6190f5c2172da270e015cc96871e90b261786f047e4c6e78","regions":[{"from":2122554,"to":2122735},{"from":2122736,"to":2123160},{"from":2123314,"to":2123461},{"from":2123462,"to":2123869},{"from":2123870,"to":2124324},{"from":2124325,"to":2124438},{"from":2124439,"to":2124852},{"from":2125240,"to":2125548},{"from":2143071,"to":2143117},{"from":2143118,"to":2143258},{"from":2143259,"to":2143904},{"from":2143935,"to":2144040},{"from":2144128,"to":2144275},{"from":2144276,"to":2144439},{"from":2144440,"to":2144537},{"from":2144538,"to":2144645},{"from":2144646,"to":2144733},{"from":2144734,"to":2144922},{"from":2144923,"to":2145252},{"from":2145253,"to":2145356},{"from":2145357,"to":2145490},{"from":2145491,"to":2146164},{"from":2146312,"to":2146411},{"from":2146412,"to":2146582},{"from":2146583,"to":2146906},{"from":2146907,"to":2147073},{"from":2147232,"to":2147402},{"from":2147403,"to":2161487}],"names":["hasRemoteProductPayload","hasMeaningfulValue","hasProductExperimentOverlay","mergeExperimentModel","applyModelsExperimentOverlay","isTopLevelObjectConfig","applyTopLevelObjectExperimentOverlays","applyProductExperimentOverlay","DEFAULT_REMOTE_CONFIG_PATH","REMOTE_CONFIG_EXCLUDE_FIELDS","normalizeJsonValue","SENSITIVE_PRODUCT_LOG_KEYS","SENSITIVE_PRODUCT_LOG_KEY_SUFFIX","isSensitiveProductLogKey","normalizeSensitiveProductLogKey","isDownloadUrlKey","tryParseUrl","stripProductLogUrlParams","redactProductSnapshotLogValue","isJsonObject","appendJsonPath","collectJsonChangedPaths","VOLATILE_DOWNLOAD_URL_PARAMS","isVolatileDownloadUrlParam","stripSignedDownloadUrl","normalizeHostedCliRotationValue","hostedCliRotationKeyOfNormalized","WorkbuddyAuthProductCoordinator"]}] as const;
export function createNativeAuthProductCoordinator(runtime:any={}):any {
const process=runtime.process??globalThis.process,console=runtime.console??globalThis.console;
const fs=runtime.fs??nodeFs,os=runtime.os??nodeOs,path=nodePath,__dirname=runtime.dirname??nodePath.dirname(fileURLToPath(import.meta.url));
const common=(()=>{var ProductEnviroment,MergeStrategy,ProductFeature,PRODUCT_CONFIGURATION_CACHE_TIMEOUT,ENV_KEY_CODEBUDDY_COPILOT_INTERNET_ENVIRONMENT;MergeStrategy = /* @__PURE__ */ function(MergeStrategy) {
		/** 完全覆盖替换 */
		MergeStrategy["Override"] = "override";
		/** 相同字段覆盖，不同字段合并 */
		MergeStrategy["Merge"] = "merge";
		/** 智能合并（如数组对象根据 id/name 合并） */
		MergeStrategy["SmartMerge"] = "smartMerge";
		/**
		* 深度智能合并：
		* - 对象数组按 id/name 合并（同 SmartMerge）
		* - 对象内部的 primitive 数组（字符串/数字等）做去重 union 合并
		* 适用于需要在嵌套对象内累积 primitive 列表的场景，例如多个来源各自贡献 agent.models 列表。
		*/
		MergeStrategy["DeepSmartMerge"] = "deepSmartMerge";
		/** commands 字段使用智能合并，其他字段保持普通合并 */
		MergeStrategy["CommandsSmartMerge"] = "commandsSmartMerge";
		return MergeStrategy;
	}({});
ProductFeature = /* @__PURE__ */ function(ProductFeature) {
		/**
		* 聊天功能
		*/
		ProductFeature["Chat"] = "Chat";
		/**
		* 内联队话
		*/
		ProductFeature["InlineChat"] = "InlineChat";
		/**
		* 状态栏
		*/
		ProductFeature["StatusBar"] = "StatusBar";
		/**
		* 聊天变量，例如 #git
		*/
		ProductFeature["ChatVariable"] = "ChatVariable";
		/**
		* 内联代码补全功能
		*/
		ProductFeature["InlineCompletions"] = "InlineCompletions";
		/**
		* 下一次编辑建议补全功能
		*/
		ProductFeature["NesCompletions"] = "NesCompletions";
		/**
		* @deprecated 后续改为计算值，不再保留该 key
		* 代码运行时使用，保存除编辑器自身关于 NesCompletions 配置之外的其他配置合并后的结果
		*/
		ProductFeature["MergedNesCompletions"] = "MergedNesCompletions";
		/**
		* 斜杠命令功能，快速唤起功能，避免每次描述
		*
		* 例如：/fix 实际内容是针对所选代码中的问题提出修复方案
		*/
		ProductFeature["SlashCommand"] = "SlashCommand";
		/**
		* 生成提交消息功能
		*/
		ProductFeature["GenerateCommitMessage"] = "GenerateCommitMessage";
		/**
		* 生成 README 文件功能，快速总结
		*/
		ProductFeature["GenerateReadmeFile"] = "GenerateReadmeFile";
		/**
		* 配置后可以从云端获取模型名称
		*/
		ProductFeature["ConfigServer"] = "ConfigServer";
		/**
		* 模型服务 Stop 参数的补丁功能，用于处理部分模型返回不能终止问题
		*/
		ProductFeature["StopParamPatch"] = "StopParamPatch";
		/**
		* OpenAI 风格 API
		*/
		ProductFeature["OpenAIStyleAPI"] = "OpenAIStyleAPI";
		/**
		* 需要配置密钥
		*/
		ProductFeature["SecretKeyRequired"] = "SecretKeyRequired";
		/**
		* 以将相关文件信息 unshift 到 prompt 参数中的形式支持跨文件补全能力
		*/
		ProductFeature["MultiFileWithPromptParam"] = "MultiFileWithPromptParam";
		/**
		* 以将相关文件信息用 relatedFiles 参数传递的形式支持跨文件补全能力
		*/
		ProductFeature["MultiFileWithSeparateParams"] = "MultiFileWithSeparateParams";
		/**
		* 根据缩进修剪请求后处理器，主要剔除尾部多余的空白字符
		*/
		ProductFeature["TrimByIndentation"] = "TrimByIndentation";
		/**
		* 通用 AST 请求后处理器，跟进光标附近的语法特征控制补全粒度
		*/
		ProductFeature["ASTForCompletions"] = "ASTForCompletions";
		/**
		* 预取结果后处理器，预取下一行补全结果，提升补全速度
		*/
		ProductFeature["CompletionsPrefetching"] = "CompletionsPrefetching";
		/**
		* 在启用 CompletionsPrefetching 时，如果补全结果为空，不论此时光标位置在哪里，是否触发 NES 补全
		*/
		ProductFeature["NESPrefetchingAfterEmptyCompletion"] = "NESPrefetchingAfterEmptyCompletion";
		/**
		* 在补全结果被接受后，是否触发 NES 补全
		*/
		ProductFeature["TriggerNESAfterCompletionHasBeenAccepted"] = "TriggerNESAfterCompletionHasBeenAccepted";
		/**
		* 光标位置变化时预取补全结果，提升补全速度
		*/
		ProductFeature["CursorPositonPrefetching"] = "CursorPositonPrefetching";
		/**
		* 与当前补全代码相关的代码片段
		*/
		ProductFeature["CompletionsRelatedSnippets"] = "CompletionsRelatedSnippets";
		/**
		* 提取 import 声明作为元数据,让模型知道可用的 API (即使文件被截断)
		*/
		ProductFeature["ImportMetadataForCompletions"] = "ImportMetadataForCompletions";
		/**
		* 提取 IDE 智能提示(补全项)信息,让模型知道当前上下文可用的 API
		*/
		ProductFeature["CompletionItemsForCompletions"] = "CompletionItemsForCompletions";
		/**
		* 文档激活时触发 NES 补全
		*/
		ProductFeature["NesDocumentActiveChangeTrigger"] = "NesDocumentActiveChangeTrigger";
		/**
		* 预取下一行补全结果，提升补全速度的后置处理器
		*/
		ProductFeature["NesCompletionsPrefetching"] = "NesCompletionsPrefetching";
		/**
		* 开启 jump to here 功能
		*/
		ProductFeature["NesCompletionsJumpToHere"] = "NesCompletionsJumpToHere";
		/**
		* 代码补全内容行与后续行重叠的后置处理器，裁剪掉已存在的多个补全行
		*/
		ProductFeature["RemoveBelowExist"] = "RemoveBelowExist";
		/**
		* NES 类型代码补全结果的后置处理器，主要用于过滤重复的补全结果
		*/
		ProductFeature["NesRepeatFilter"] = "NesRepeatFilter";
		/**
		* NES 类型代码补全结果的后置处理器，主要用于过滤重复的补全结果以及提取最小的变更代码
		*/
		ProductFeature["NesRepeatFilterV2"] = "NesRepeatFilterV2";
		/**
		* NES 类型代码补全结果的后置处理器，主要用于修正 range
		*/
		ProductFeature["NesRangeFix"] = "NesRangeFix";
		/**
		* 代码补全结果与光标后续的代码融合功能
		*/
		ProductFeature["CompletionsResultFusion"] = "CompletionsResultFusion";
		/**
		* 聊天历史记录
		*/
		ProductFeature["ChatHistory"] = "ChatHistory";
		/**
		* 内联聊天选择追加到结果
		*/
		ProductFeature["InlineChatSelectionAppendToResult"] = "InlineChatSelectionAppendToResult";
		/**
		* 是否开启推荐对话的后置处理器
		*/
		ProductFeature["ChatFollowup"] = "ChatFollowup";
		/**
		* 是否兼容 CRLF 风格
		*/
		ProductFeature["CRLFCompatible"] = "CRLFCompatible";
		/**
		* 是否开启小灯泡功能
		*/
		ProductFeature["CodeAction"] = "CodeAction";
		/**
		* 是否开启IDE版本的小灯泡功能
		*/
		ProductFeature["CodeActionIDE"] = "CodeActionIDE";
		/**
		* 是否开启悬浮快捷键和菜单功能
		*/
		ProductFeature["FloatShortcut"] = "FloatShortcut";
		/**
		* 是否开启 Code Lens 功能
		*/
		ProductFeature["CodeLens"] = "CodeLens";
		/**
		* 是否开启内联对话意图识别
		*/
		ProductFeature["InlineChatIntentRecognition"] = "InlineChatIntentRecognition";
		/**
		* 是否开启多步代码补全功能
		*/
		ProductFeature["MultiStepCompletions"] = "MultiStepCompletions";
		/**
		* 是否开启 codebase 功能
		*/
		ProductFeature["Codebase"] = "Codebase";
		/**
		* 当前选定的模型不在可用的模型列表中时，是否使用默认的模型
		*/
		ProductFeature["UseDefaultModelIfCurrentNotInList"] = "UseDefaultModelIfCurrentNotInList";
		/**
		* 是否开启 MCP 功能
		*/
		ProductFeature["Mcp"] = "Mcp";
		/**
		* 是否开启 MCP 市场功能
		*/
		ProductFeature["McpMarket"] = "McpMarket";
		/**
		* 是否开启 MCP 安装指引功能（包括手动安装指引和操作指引）
		*/
		ProductFeature["McpInstallationGuide"] = "McpInstallationGuide";
		/**
		* 是否禁用 MCP Sampling 功能
		* 设置为 true 时，禁止 MCP 服务器通过客户端向 LLM 发起采样请求
		* @default false
		*/
		ProductFeature["DisableMcpSampling"] = "DisableMcpSampling";
		/**
		* 是否禁用 MCP Roots 功能
		* 设置为 true 时，禁止 MCP 服务器获取客户端的工作区根目录列表
		* @default false
		*/
		ProductFeature["DisableMcpRoots"] = "DisableMcpRoots";
		/**
		* 是否开启内存管理功能
		*/
		ProductFeature["MemoryManagement"] = "MemoryManagement";
		/**
		* 是否禁用 Memory 个性化功能
		* 设置为 true 时：
		* 1) 隐藏设置页 memory 个性化 Tab
		* 2) 禁用 UserProfileMemory（UserMemoryContent）提示词注入
		* @default false
		*/
		ProductFeature["DisableMemoryPersonalization"] = "DisableMemoryPersonalization";
		/**
		* 是否开启 POI 地图服务能力
		* 设置为 true 时：
		* 1) 显示设置页「账户管理」中的「地址信息」区块（AccountLocationSection）
		* 2) 显示安全中心「系统授权」中的位置信息开关（LocationConsentRow）
		* 3) 启用 pick_location MCP 工具注入
		* 4) 启用 POI RPC handlers（地图 API + 地址簿 CRUD）
		* 5) 启用 Facade proxy 侧 poi 能力
		* 6) 启用第三方 MCP callTool 时的 X-WorkBuddy-User-POI 请求头注入
		* @default false
		*/
		ProductFeature["PoiMap"] = "PoiMap";
		/**
		* 是否开启账户昵称编辑入口。缺省开启，下发 false 时关闭。
		*/
		ProductFeature["NicknameEditEnabled"] = "NicknameEditEnabled";
		/**
		* 支持选择图片
		*/
		ProductFeature["SelectImage"] = "SelectImage";
		/**
		* 支持选择 Figma
		*/
		ProductFeature["SelectFigma"] = "SelectFigma";
		/**
		* 支持选择组件
		*/
		ProductFeature["SelectComponent"] = "SelectComponent";
		/**
		* Aegis监控上报功能
		*/
		ProductFeature["Aegis"] = "Aegis";
		/**
		* 计费通知功能
		*/
		ProductFeature["BillingNotice"] = "BillingNotice";
		/**
		* VSCode Auth
		*/
		ProductFeature["VSCodeAuthProvider"] = "VSCodeAuthProvider";
		/**
		* 终端聊天功能
		*/
		ProductFeature["TerminalChatIDE"] = "TerminalChatIDE";
		/**
		* 内联聊天IDE功能
		*/
		ProductFeature["InlineChatIDE"] = "InlineChatIDE";
		/**
		* Baas集成
		*/
		ProductFeature["Integration"] = "Integration";
		ProductFeature["PdcFlow"] = "PdcFlow";
		ProductFeature["AdditionalPrompt"] = "AdditionalPrompt";
		/**
		* 是否开启自定义模型功能
		*/
		ProductFeature["CustomModel"] = "CustomModel";
		/**
		* 是否对 commands 字段使用 SmartMerge 策略
		*/
		ProductFeature["CommandsSmartMerge"] = "CommandsSmartMerge";
		/**
		* 是否使用 IDE 增强版本的文件写入和替换工具
		*/
		ProductFeature["WriteAndReplaceToolIDE"] = "WriteAndReplaceToolIDE";
		/**
		* 是否显示通用设置标签页
		*/
		ProductFeature["GeneralSettings"] = "GeneralSettings";
		/**
		* 是否开启计费功能
		*/
		ProductFeature["Billing"] = "Billing";
		/**
		* 是否开启自动模型选择功能
		*/
		ProductFeature["AutoMode"] = "AutoMode";
		ProductFeature["isIDE"] = "isIDE";
		/**
		* 是否开启 web fetch 功能
		*/
		ProductFeature["WebFetch"] = "WebFetch";
		/**
		* 是否开启对 web fetch 的结果用模型进行总结的能力
		*/
		ProductFeature["SummaryWebFetch"] = "SummaryWebFetch";
		/**
		* 是否开启浏览器扒取 Web 的能力
		*/
		ProductFeature["WebBrowserFetch"] = "WebBrowserFetch";
		/**
		* 是否开启 web search 功能
		*/
		ProductFeature["WebSearch"] = "WebSearch";
		/**
		* 是否开启动态添加 web search 功能
		*/
		ProductFeature["DynamicAddWebSearch"] = "DynamicAddWebSearch";
		/**
		* 是否开启 skills 功能
		*/
		ProductFeature["Skills"] = "Skills";
		/**
		* 是否开启 skill 安全扫描功能
		* @default false
		*/
		ProductFeature["SkillSecurityScan"] = "SkillSecurityScan";
		ProductFeature["SkillRecommend"] = "SkillRecommend";
		/**
		* 是否开启「意图召回（embedding 召回 skill / plugin suite / connector）」功能。。
		*/
		ProductFeature["IntentRecommend"] = "IntentRecommend";
		/**
		* 是否开启文本选择操作功能
		*/
		ProductFeature["CodeSelectionActions"] = "CodeSelectionActions";
		/**
		* 是否禁用文件删除工具
		* 当设置为 true 时，DELETE_FILES 工具将不会被注册
		*/
		ProductFeature["DisableDeleteFilesTool"] = "DisableDeleteFilesTool";
		/**
		* 是否禁用 HTML 流式 UI 展示工具
		* 当设置为 true 时，VISUALIZE_READ_ME 和 VISUALIZE_SHOW_WIDGET 工具将不会被注册
		*/
		ProductFeature["DisableHtmlStreamUIShow"] = "DisableHtmlStreamUIShow";
		/**
		* 是否启用 VSCode 的实验性 API
		*/
		ProductFeature["ProposalAPI"] = "ProposalAPI";
		/**
		* 是否开启了IDE内部预览功能
		*/
		ProductFeature["PreviewUrl"] = "PreviewUrl";
		/**
		* 是否使用编辑器原生能力来渲染 NES
		* 此功能依赖于实验性 API，因此需要同时开启 {@link ProposalAPI}
		* 并且需要当前编辑器支持对应的实验性 API （VSCode 版本大于等于 1.94.0）
		*/
		ProductFeature["NESNativeRenderer"] = "NESNativeRenderer";
		/**
		* 是否启用企业域登录
		*/
		ProductFeature["EnterpriseDomainLogin"] = "EnterpriseDomainLogin";
		/**
		* 是否根据已有的 session 切换环境，拉取不同配置
		*/
		ProductFeature["SwitchBySession"] = "SwitchBySession";
		ProductFeature["InternationalLogin"] = "InternationalLogin";
		/**
		* 是否开启 subagent 功能
		*/
		ProductFeature["Task"] = "Task";
		/**
		* 是否开启本地 models.json 配置功能
		*/
		ProductFeature["CustomModelsJSON"] = "CustomModelsJSON";
		/**
		* 是否给本地自定义模型 id 加 `custom-local:` 前缀，
		* 避免 SmartMerge 时与同 id 内置模型合并导致 tags 等字段被覆盖。
		* ModelProvider 在实际发送请求前会移除此前缀还原原始 model id。
		*/
		ProductFeature["CustomModelIdPrefix"] = "CustomModelIdPrefix";
		/**
		* 自定义模型「新增模型」表单是否默认不预选任何 provider（展示为空，由用户主动选择）。
		* @default false（不开启，保持默认预选 provider 的行为）
		* 海外版通过 product.json patch 下发 true（Issue #75224）。
		*/
		ProductFeature["CustomModelHideDefaultProvider"] = "CustomModelHideDefaultProvider";
		/**
		* 自定义模型 provider 名称是否只走 i18n（settings.models.providers.<id>），
		* 不再拼接 displayName。开启后 provider 名严格按当前语言的翻译展示。
		* @default false（不开启，保持「本地化名 / displayName」拼接行为）
		* 海外版通过 product.json patch 下发 true，避免中文 displayName 露出（Issue #75224）。
		*/
		ProductFeature["CustomModelProviderLabelI18nOnly"] = "CustomModelProviderLabelI18nOnly";
		/**
		* 远端云配置下发 agents 时，是否按 name 做 SmartMerge 而非整体替换。
		* 开启后本地 built-in agents 不会因远端下发而丢失。
		*/
		ProductFeature["CloudAgentsSmartMerge"] = "CloudAgentsSmartMerge";
		/**
		* 是否隐藏 custom/专享版中的登录页和聊天页品牌 logo 与法律链接。
		* @default false
		*/
		ProductFeature["HideCustomBrandingLogos"] = "HideCustomBrandingLogos";
		/**
		* 是否开启新的 CB Chat UI
		*/
		ProductFeature["CBChatUI"] = "CBChatUI";
		/**
		* 聊天消息队列能力
		* @default true
		*/
		ProductFeature["ChatMessageQueue"] = "ChatMessageQueue";
		/**
		* 是否启用由 plugin-chat 承担的消息队列派发主链路
		* @default false
		*/
		ProductFeature["MessageQueuePluginDispatch"] = "MessageQueuePluginDispatch";
		/**
		* Whether CLI defers message queue dispatch to the client (UI-driven).
		* When enabled, CLI stores the rich queue but does NOT auto-drain.
		* The client calls activateConversationMessageQueue to dequeue one item at a time.
		* @default false
		*/
		ProductFeature["MessageQueueDeferredDispatch"] = "MessageQueueDeferredDispatch";
		/**
		* 是否开启 Task List 功能（Plan Agent）
		*/
		ProductFeature["TaskList"] = "TaskList";
		/**
		* 是否开启Plan Mode
		*/
		ProductFeature["Plan"] = "Plan";
		/**
		* 文件替换工具：转义字符规范化匹配策略
		* 用于处理 LLM 过度转义的问题（如 \\n → \n）
		* @default true
		*/
		ProductFeature["ReplaceFileEscapeNormalization"] = "ReplaceFileEscapeNormalization";
		/**
		* 是否使用独立子进程终端（StandaloneTerminal）
		* true: 使用独立子进程执行命令
		* false: 使用 VS Code Terminal API
		* @default true
		*/
		ProductFeature["StandaloneTerminal"] = "StandaloneTerminal";
		/**
		* 文件替换工具：中文标点符号规范化匹配策略
		* 用于处理全角/半角标点符号的智能转换（如 ，→, ：→: 等）
		* @default true
		*/
		ProductFeature["ReplaceFileChinesePunctuationNormalization"] = "ReplaceFileChinesePunctuationNormalization";
		/**
		* 是否启用增强型请求解析器
		* 启用后，所有补全场景将由新架构处理，根据 completion/nes 开关决定 predict_types 参数
		*/
		ProductFeature["EnhancedCompletionRequest"] = "EnhancedCompletionRequest";
		/**
		* 是否在补全请求被取消(abort)后重新发送请求用于数据上报
		* 依赖 EnhancedCompletionRequest 开关启用
		*/
		ProductFeature["ReportAfterCancel"] = "ReportAfterCancel";
		/**
		* 禁用终端变量
		* 设置为 true 时，在聊天变量列表中不显示 Terminal 选项
		* 用于不支持终端的平台（如 Xcode）
		* @default false, 没有配置时默认为 false
		*/
		ProductFeature["DisableTerminalVariable"] = "DisableTerminalVariable";
		/**
		* 是否启用请求体 gzip 压缩
		* 设置为 true 时，会对发送给模型的请求体进行 gzip 压缩
		* @default false
		*/
		ProductFeature["RequestBodyGzip"] = "RequestBodyGzip";
		/**
		* 禁用积分消耗显示
		* 设置为 true 时，在反馈下拉菜单中不显示积分消耗和分割线
		* 设置为 false 或未配置时：
		* - Cloud-Hosted 部署类型：显示积分消耗
		* - SaaS 部署类型：仅对企业用户显示积分消耗
		* - 其他部署类型：不显示积分消耗
		* @default false
		*/
		ProductFeature["DisableCreditsConsumed"] = "DisableCreditsConsumed";
		/**
		* 是否展示用户菜单 / 设置面板中的「积分余额」数值并主动拉取积分
		* 设置为 true（默认）：展示数值 + 主动拉取 getAccountUsage / getAccount
		* 设置为 false：菜单项 label 改为「查看积分余额」，右侧不展示数值，
		*               不调用积分相关接口；点击行为优先走 productLinks.creditsRedirectUrl，
		*               否则维持原有跳转。用于 IOA 等不展示具体积分的环境（#46337）
		* @default true
		*/
		ProductFeature["ShowCreditsBalance"] = "ShowCreditsBalance";
		/**
		* 是否禁用积分入口（用户菜单「积分」项 + 设置页账户「积分」区块）
		* 设置为 true 时，完全隐藏积分入口（不展示菜单项与账户面板积分区块）。
		* 用于无积分体系的发行版（如海外版 workbuddy-ai）。
		* 注意与 ShowCreditsBalance 区分：ShowCreditsBalance 控制「是否展示积分数值」，
		* 本 flag 控制「积分入口是否存在」。
		* @default false（默认有积分入口）
		*/
		ProductFeature["DisableCreditsEntry"] = "DisableCreditsEntry";
		/**
		* 是否禁用设置页账户面板中的「前往管理中心」入口
		* 设置为 true 时隐藏该按钮。用于不具备 SaaS 官网 client-login 桥接能力的发行版
		* （如专享版 workbuddy-custom）：该入口原始跳转依赖 www.workbuddy.cn 的
		* `/console/client-login` APISIX 桥接路由 + SaaS 侧 login-server 签发的 deviceCode，
		* 在私有化部署形态下这些设施均不存在，跳转必然失败。
		* @default false（默认显示）
		*/
		ProductFeature["DisableManageCenterEntry"] = "DisableManageCenterEntry";
		/**
		* 是否禁用「我发布的应用」入口（设置页数据管理面板）
		* 设置为 true 时隐藏该入口，用于不提供应用发布能力的发行版（如海外版 workbuddy-ai）。
		* @default false（默认显示）
		*/
		ProductFeature["DisablePublishedApps"] = "DisablePublishedApps";
		/**
		* 是否禁用「已归档任务」入口（设置页数据管理面板）
		* 设置为 true 时隐藏该入口，用于不提供任务归档能力的发行版（如海外版 workbuddy-ai）。
		* @default false（默认显示）
		*/
		ProductFeature["DisableArchivedTasks"] = "DisableArchivedTasks";
		/**
		* 是否禁用「云端助理」相关入口（依赖 cloud agent 的能力）
		* 设置为 true 时强制把 `useCloudAssistantEntitlement` 返回的 `orchestratorEnabled` 压成 false，
		* 由此连带隐藏：助理页顶部「组建你的专属助理团队」营销 banner、助理 Tab 的 "Beta" 角标、
		* 以及拉取 / 注入云助理列表（specialist agents）的全部行为。
		*
		* 用于不接入 cloud agent 业务线的发行版（如专享版 workbuddy-custom），
		* 防止后端白名单或灰度策略放开后导致这些入口被动暴露。
		* 注意：与 DisableTeamsProject 互相独立——本 flag **不**控制「项目」入口。
		* @default false（默认服从服务端 orchestratorEnabled）
		*/
		ProductFeature["DisableCloudAssistantUpgradeBanner"] = "DisableCloudAssistantUpgradeBanner";
		/**
		* 是否禁用「项目」入口（左侧导航的 Teams Project 协作入口）
		* 设置为 true 时强制把 `useCloudAssistantEntitlement` 返回的 `teamsEnabled` 压成 false，
		* 由此隐藏左侧导航的「项目」按钮及其下挂的所有 project 任务。
		*
		* 用于不开放 Teams Project 协作能力的发行版（如专享版 workbuddy-custom），
		* 防止后端 Teams 灰度白名单放开后导致入口被动暴露。
		* 注意：与 DisableCloudAssistantUpgradeBanner 互相独立——本 flag **不**控制助理 banner / Beta 角标 / 云助理列表。
		* @default false（默认服从服务端 teamsEnabled）
		*/
		ProductFeature["DisableTeamsProject"] = "DisableTeamsProject";
		/**
		* 是否禁用「更多」菜单中的「灵感」入口
		* 设置为 true 时隐藏会话列表「更多」菜单里的灵感（探索）项，
		* 用于不需要对外提供探索 / 灵感能力的发行版（如专享版 workbuddy-custom）。
		* 注意：本 flag **不**关闭 `/discover` 路由本身——deep link / 浏览器历史
		* 仍可正常访问探索页，避免误伤标准版/海外版用户。
		* @default false（默认显示）
		*/
		ProductFeature["DisableInspirationEntry"] = "DisableInspirationEntry";
		/**
		* 是否在欢迎页展示「相关灵感」横向列表
		* 白名单语义：缺省 / false → 不展示；true → 展示。
		* 作为新功能默认关，由后端按发行版按需下发开启。
		* @default false（默认不展示）
		*/
		ProductFeature["HomePlaybooks"] = "HomePlaybooks";
		/**
		* 是否启用首页高考相关展示和入口。
		* 黑名单语义：缺省 / true → 展示；false → 隐藏。
		* 用于海外版下线 Gaokao Helper 等高考能力时按产品配置关闭。
		* @default true（默认展示）
		*/
		ProductFeature["GaokaoEnabled"] = "gaokaoEnabled";
		/**
		* 是否禁用欢迎页「相关灵感」的「换一批」按钮
		* 设置为 true 时隐藏该刷新按钮，用户只能看到首页默认展示的这批灵感卡片，
		* 无法翻出下一批。用于海外版：海外版部分灵感卡片存在多语言问题（内容仍为
		* 中文），首页默认展示的卡片没问题，隐藏「换一批」可避免用户翻出语言不对的卡片。
		* 注意：本 flag **不**影响卡片本身及点击进详情/启动——仅禁用批次切换。
		* 与 HomePlaybooks（控制整块显隐）互相独立。
		* @default false（默认展示「换一批」）
		*/
		ProductFeature["DisableHomePlaybookShuffle"] = "DisableHomePlaybookShuffle";
		/**
		* 是否禁用每日签到入口
		* 设置为 true 时隐藏签到功能，用于无积分/签到体系的发行版（如海外版）。
		* @default false（默认启用签到）
		*/
		ProductFeature["DisableCheckin"] = "DisableCheckin";
		/**
		* 是否禁用运营活动 Banner
		* 设置为 true 时不拉取/不展示活动 Banner，用于无运营活动的发行版（如海外版）。
		* @default false（默认启用活动 Banner）
		*/
		ProductFeature["DisableActivityBanner"] = "DisableActivityBanner";
		/**
		* 是否启用「外观主题」入口（设置页外观面板）——enable 语义，默认关。
		* 设置为 true 时展示个性主题/皮肤能力，由需要外观定制的发行版显式下发开启。
		* @default false（默认关闭外观，缺省/未下发时不展示入口）
		*/
		ProductFeature["EnableAppearance"] = "EnableAppearance";
		/**
		* 是否禁用积分购买引导（错误 Banner 中的充值引导）
		* 设置为 true 时错误走通用展示、不展示积分购买引导，用于无积分体系的发行版（如海外版）。
		* @default false（默认启用购买引导）
		*/
		ProductFeature["DisableCreditPurchaseGuide"] = "DisableCreditPurchaseGuide";
		/**
		* IM 通道可见性 flag（enable 语义，默认隐藏；仅"版本专属"通道使用，由各产品 product.json 显式开启）。
		* ChannelSlack / ChannelTelegram / ChannelDiscord 为海外专属；ChannelWechatKf 为国内专属。
		*/
		ProductFeature["ChannelSlack"] = "ChannelSlack";
		ProductFeature["ChannelTelegram"] = "ChannelTelegram";
		ProductFeature["ChannelDiscord"] = "ChannelDiscord";
		ProductFeature["ChannelWechatKf"] = "ChannelWechatKf";
		/**
		* 是否禁用上下文用量展示
		* 设置为 true 时，隐藏输入框底部的上下文用量环形进度条
		* @default false
		*/
		ProductFeature["DisableContextUsage"] = "DisableContextUsage";
		/**
		* 是否启用文件历史追踪功能
		* 启用后，会追踪用户编辑文件的历史变更并上报到服务端
		* @default false
		*/
		ProductFeature["FileHistoryTracker"] = "FileHistoryTracker";
		/**
		* 是否启用 Shell 集成修复功能
		* 当终端不支持 shell integration 时，尝试自动修复
		* @default false
		*/
		ProductFeature["ShellIntegrationFix"] = "ShellIntegrationFix";
		/**
		* 禁用 Codebase 的能力
		* 设置为 true 时，禁用所有功能
		* @default false
		*/
		ProductFeature["DisableCodebase"] = "DisableCodebase";
		/**
		* 禁用插件和插件市场的能力
		* 设置为 true 时，禁用所有功能
		* @default false
		*/
		ProductFeature["DisablePlugin"] = "DisablePlugin";
		/**
		* 禁用微信小程序集成入口
		* 设置为 true 时，隐藏会话列表和 Claw 设置中的微信小程序集成入口
		* @default false
		*/
		ProductFeature["DisableWechatMiniProgramIntegration"] = "DisableWechatMiniProgramIntegration";
		/**
		* 禁用企微 Bot 推送集成入口
		* 设置为 true 时，隐藏自动化任务面板中的「推送到企微群」开关
		* @default false
		*/
		ProductFeature["DisableWecomBotIntegration"] = "DisableWecomBotIntegration";
		/**
		* 是否启用微信文件分享（shareFile）路径。
		* 启用后，放开分享文件到微信的按钮；
		* @default false
		*/
		ProductFeature["EnableWechatShareFile"] = "EnableWechatShareFile";
		/**
		* 禁用登录页底部的法务链接（隐私政策、服务条款）
		* 设置为 true 时，LoginView 不渲染隐私政策和服务条款链接。
		* 用于 WorkBuddy 专享版（Cloud-Hosted）与私有化部署（Self-Hosted/Cloud-Hosted）
		* 等不需要展示腾讯公网法务链接的发行渠道。
		* @default false
		*/
		ProductFeature["DisableLoginLegalLinks"] = "DisableLoginLegalLinks";
		/**
		* 禁用 Bot 的 Webhook URL 配置模式
		* 设置为 true 时，Claw 渠道配置仅保留 WebSocket 模式
		* @default false
		*/
		ProductFeature["DisableBotWebhookUrl"] = "DisableBotWebhookUrl";
		/**
		* 禁用企微 AIBot 集成入口
		* 设置为 true 时，隐藏 Claw 设置中的企微 AIBot 通道配置
		* @default false
		*/
		ProductFeature["DisableWecomAibot"] = "DisableWecomAibot";
		/**
		* 允许在企微 AIBot websocket 模式下自定义 WebSocket 接入 URL
		* 启用后，Claw 设置面板会显示 customWsUrl 字段，用于私有化部署企业微信
		* （SDK 默认 wss://openws.work.weixin.qq.com 之外的自建网关）接入。
		* SaaS 公有云版本不开启，行为与默认 ws URL 一致。
		* @default false
		*/
		ProductFeature["EnableWecomAibotCustomWsUrl"] = "EnableWecomAibotCustomWsUrl";
		/**
		* 用户成长空间入口
		* 设置为 true 时，显示聊天输入框顶部右侧的成长空间入口
		* @default false
		*/
		ProductFeature["UserGrowth"] = "UserGrowth";
		/**
		* 禁用首页右上角"成长伙伴"宠物槽位（GrowthBuddy）
		*
		* 注意与 `UserGrowth` 的关系：
		* - `UserGrowth=false` 仅关闭成长空间的真实数据接口与"赚积分"入口，
		*   但 GrowthBuddy 槽位仍会渲染默认猫咪占位图（兜底用于其他企业版形态）。
		* - `DisableGrowthBuddySlot=true` 则进一步把整个 GrowthBuddy 槽位（包括默认占位图）
		*   完全隐藏，仅用于不希望暴露任何吉祥物入口的渠道（如专享版 workbuddy-custom）。
		*
		* @default false
		*/
		ProductFeature["DisableGrowthBuddySlot"] = "DisableGrowthBuddySlot";
		/**
		* 禁用运营位 Slot 系统（整体开关）
		*
		* 设置为 true 时，SlotConfigProvider 不拉取运营位配置，所有 slot 组件不渲染。
		* 用于尚未开放运营位的产品形态（如 Web 端）。
		*
		* @default false
		*/
		ProductFeature["DisableSlotSystem"] = "DisableSlotSystem";
		/**
		* 是否开启 LSP 功能
		* 设置为 true 时，启用 LSP 功能
		* @default false
		*/
		ProductFeature["LSP"] = "LSP";
		/**
		* 禁用 Hooks 功能
		* 设置为 true 时，不会加载和执行任何 hooks
		* @default false
		*/
		ProductFeature["DisableHooks"] = "DisableHooks";
		/**
		* 是否开启敏感仓库检测
		*/
		ProductFeature["RepositorySensitivityDetection"] = "RepositorySensitivityDetection";
		/**
		* 是否在 Banner 中显示装饰图片（右下角的吉祥物 Logo）
		* @default false
		*/
		ProductFeature["BannerDecorativeImage"] = "BannerDecorativeImage";
		/**
		* 是否开启系统内存监控功能
		* @default true
		*/
		ProductFeature["SystemMemoryMonitor"] = "SystemMemoryMonitor";
		/**
		* 是否使用 VSCode 主进程认证
		* 设置为 true 时，认证逻辑在 VSCode Electron 主进程中执行，使用 axios 发送 HTTP 请求
		* 设置为 false 时，使用原认证逻辑（Extension Host + RestOperations）
		* @default false
		*/
		ProductFeature["UseNativeAuth"] = "UseNativeAuth";
		/**
		* 是否展示账户管理菜单
		* 默认 true，配置为 false 时隐藏
		*/
		ProductFeature["ShowAccountManagementMenu"] = "ShowAccountManagementMenu";
		/**
		* 是否展示用户菜单中的「用量」入口
		* 设置为 true 时，用户菜单展示「用量」项，点击跳转到 endpoint/profile/usage。
		* 未配置 / false 一律不展示，避免账号或产品切换后旧值粘连导致入口泄露到不该展示的产品。
		* 仅在专享版（如 workbuddy-custom）等显式配置的发行渠道开启。
		* @default false
		*/
		ProductFeature["ShowUsageEntry"] = "ShowUsageEntry";
		/**
		* 是否开启图片生成功能
		* @default false
		*/
		ProductFeature["ImageGen"] = "ImageGen";
		/**
		* 是否开启图片编辑功能（图生图）
		* @default false
		*/
		ProductFeature["ImageEdit"] = "ImageEdit";
		/**
		* 是否启用文生视频功能
		*/
		ProductFeature["VideoGen"] = "VideoGen";
		/**
		* 是否禁用多 Agent 并发功能
		* 设置为 false（默认）：启用多 Agent 并发，不拦截导航、不停止任何正在运行的 Agent
		* 设置为 true：禁用多 Agent 并发，对话中进行跳转会进行拦截，显示确认框
		* @default false
		*/
		ProductFeature["DisableMultiAgentConcurrent"] = "DisableMultiAgentConcurrent";
		/**
		* 是否开启 MCP 工具延迟加载功能
		* 设置为 true 时，MCP 工具默认延迟加载，通过 ToolSearch 按需激活
		* @default true
		*/
		ProductFeature["DeferToolLoading"] = "DeferToolLoading";
		/**
		* 是否启用 DNS Fallback 查询
		* 设置为 true 时，当系统 DNS 返回 ENOTFOUND 时自动使用备用 DNS 服务器重新解析
		* @default false
		*/
		ProductFeature["DnsFallbackLookup"] = "EnableDnsFallback";
		/**
		* 是否禁用 Agent Team 功能
		* 设置为 true 时,禁用多 Agent 团队协作功能
		* @default false
		*/
		ProductFeature["DisableAgentTeam"] = "DisableAgentTeam";
		/**
		* 是否启用 Agents 入口
		* 设置为 true 时，显示标题栏"打开 Agents"按钮和欢迎页工作模式面板
		* 未设置或为 false 时，隐藏这些入口
		* @default false
		*/
		ProductFeature["Agents"] = "Agents";
		/**
		* 是否启用远程控制功能
		* 设置为 true 时,启用企业微信远程控制功能(仅 iOA 用户)
		* @default false
		*/
		ProductFeature["RemoteControl"] = "RemoteControl";
		/**
		* 是否启用文件 Diff 历史追踪功能
		* 启用后，会在本地追踪用户编辑文件的 diff 变更，用于代码补全上下文
		* @default false
		*/
		ProductFeature["FileDiffHistory"] = "FileDiffHistory";
		/**
		* 是否启用定时任务（Cron）功能
		* 启用后，支持 CronCreate/CronDelete/CronList 工具和 /loop Skill
		* @default true
		*/
		ProductFeature["ScheduledTasks"] = "ScheduledTasks";
		/**
		* 是否开启升级横幅功能
		* 设置为 true 时，在标题栏显示 Pro 升级推广横幅
		* @default false
		*/
		ProductFeature["BillingUpgradeBanner"] = "BillingUpgradeBanner";
		/**
		* 是否在菜单中显示 WorkBuddy 推广横幅
		* 设置为 true 时，在用户菜单中显示推广 Banner
		* @default false
		*/
		ProductFeature["WorkBuddyBanner"] = "WorkBuddyBanner";
		/**
		* 是否禁用 WorkBuddy 身份初始化机制
		* 设置为 true 时，跳过 WorkBuddy 的身份引导/初始化流程
		* @default false
		*/
		ProductFeature["DisableIdentityBootstrap"] = "DisableIdentityBootstrap";
		/**
		* 是否禁用身份自定义昵称功能
		* 设置为 true 时，始终使用 i18n 默认名（如"助理"），
		* 不读取 localStorage，也不从 IDENTITY.md 获取自定义名。
		* @default true
		*/
		ProductFeature["DisableIdentityCustomization"] = "DisableIdentityCustomization";
		/**
		* 是否允许用户编辑/修改助理名字
		* 设置为 true 时，用户可以编辑助理名字（可写）
		* 设置为 false 时，助理名字只读，用户不可修改
		* @default true
		*/
		ProductFeature["AllowIdentityNameEdit"] = "AllowIdentityNameEdit";
		/**
		* 是否禁用 TLS 证书验证
		* 设置为 true 时，所有 HTTPS 请求跳过 TLS 证书验证（rejectUnauthorized: false）
		* 用于私有化部署环境中使用自签名证书或内部 CA 签发证书的场景
		* @default false
		*/
		ProductFeature["DisableTlsVerification"] = "DisableTlsVerification";
		/**
		* 是否在非 Git 工作区显示文件变更
		* 设置为 true 时，无论是否为 Git 仓库都展示文件变更相关 UI
		* 设置为 false（默认）时，非 Git 工作区不发送 Checkpoint，隐藏文件变更相关 UI
		* @default false
		*/
		ProductFeature["ShowFileChangesForNonGitRepo"] = "ShowFileChangesForNonGitRepo";
		ProductFeature["Inspiration"] = "Inspiration";
		/**
		* 数据源连接器功能开关
		* 启用后，设置面板中显示连接器管理功能
		* @default false
		*/
		ProductFeature["Connector"] = "Connector";
		/**
		* TencentDesignX 设计能力开关
		* 设置为 true 时，启用 TencentDesignX 相关功能入口。
		* @default false
		*/
		ProductFeature["TencentDesignX"] = "TencentDesignX";
		/**
		* HTML 预览分享按钮开关
		* 启用后，HTML 文件预览面板的 actionbar 中展示分享按钮
		* @default true
		*/
		ProductFeature["HtmlPreviewShare"] = "HtmlPreviewShare";
		/**
		* 是否开启沙箱执行功能
		* 启用后，Bash 命令在隔离沙箱环境中执行，越权操作需用户确认
		* @default false
		*/
		ProductFeature["Sandbox"] = "Sandbox";
		/**
		* Sandbox 2.0 文件版本管理能力（FileProvider、NetworkExtension、SandboxHelper）
		* 控制文件版本管理 UI 入口、native 组件加载、构建签名步骤
		* 独立于 ProductFeature.Sandbox（bash 命令沙箱执行）
		* @default false
		*/
		ProductFeature["SandboxFileVersionManagement"] = "SandboxFileVersionManagement";
		/**
		* Skill 生命周期管理工具开关
		* 启用后，模型可通过 skill_manage 工具创建、修改、删除 skill
		* @default false
		*/
		ProductFeature["SkillManage"] = "SkillManage";
		/**
		* 腾讯文档知识库子功能开关
		* 在知识库（KnowledgeBase）容器开关启用的前提下，独立控制腾讯文档数据源的显示
		* @default false
		*/
		ProductFeature["TencentDocsKnowledge"] = "TencentDocsKnowledge";
		/**
		* 腾讯文档「AI 编辑」入口开关（C 端，user-id 维度灰度）。
		* 控制注入腾讯文档预览的 `__WB_DOCS_FEATURE_LIST__.aiEdit`：
		* 仅当对话场景（inConversation）且本开关命中时才注入 aiEdit=true。
		* 覆盖两类预览容器：
		* - 在线预览 webview（persist:agent-browser-preview-webview），主进程注入；
		* - 本地文档 OOPIF（SDK iframe），daemon 侧 local-docs-facade 据此决定是否追加
		*   `_wbchat=1` 对话标记（按账号选 C 端 / 企业 key）。
		* 由后端按 user-id 维度（比例 / 尾号 / 白名单）算好后下发，端侧不自行判定。
		* @default false
		*/
		ProductFeature["TencentDocsAiEdit"] = "TencentDocsAiEdit";
		/**
		* 腾讯文档「AI 编辑」入口开关（企业版，EnterpriseId 维度灰度）。
		* 与 TencentDocsAiEdit 相互独立：企业版在线预览容器（persist:tdoc-preview，
		* 含资料库 PreviewModal）以及企业账号下的本地文档预览读取此 key。默认关闭以保持
		* 企业侧不展示 AI 编辑入口（#59512），但可对特定企业按 EnterpriseId 维度灰度放开。
		* @default false
		*/
		ProductFeature["TencentDocsAiEditEnterprise"] = "TencentDocsAiEditEnterprise";
		/**
		* 内置 tencent-pptx 插件首次 seed 时默认开启。
		* 设置为 false 时跳过默认写入 enabledPlugins（kill-switch）。
		* @default true
		*/
		ProductFeature["TencentPptxBuiltinDefaultEnabled"] = "TencentPptxBuiltinDefaultEnabled";
		/**
		* 是否启用「腾讯乐享」知识库面板
		* 启用后，侧边栏"资料库" group 下显示"腾讯乐享"子项，主内容区可渲染 TencentLexiangPanel
		* @default false
		*/
		ProductFeature["TencentLexiangKnowledge"] = "TencentLexiangKnowledge";
		/**
		* 腾讯网盘知识库子功能开关
		* 在知识库（KnowledgeBase）容器开关启用的前提下，独立控制腾讯网盘相关入口的显示：
		* 云端文件 Tab、产物保存到我的网盘/项目资产、对话输入框网盘文件附件入口
		* @default false
		*/
		ProductFeature["TencentNetDriveKnowledge"] = "TencentNetDriveKnowledge";
		/**
		* 禁用"帮助与反馈"入口
		* 设置为 true 时，隐藏 Settings 左侧导航的 helpFeedback Tab，
		* 并在 SettingsModal 路由层将 helpFeedback 回退到默认面板
		* @default false
		*/
		ProductFeature["DisableHelpFeedback"] = "DisableHelpFeedback";
		/**
		* 展示"关注我们"二维码卡片（enable 语义，默认关闭）。
		*
		* 设置为 true 时，HelpFeedbackPanel 会在设置 → 帮助与反馈页底部渲染
		* 「公众号 / 视频号 / 小红书」等运营二维码卡片。仅腾讯内网员工版打开
		* （build/patches/workbuddy-desktop/product.internal.json），外网 SaaS /
		* 海外 / OneID 企业 / 私有化等发行渠道默认不展示，避免暴露仅供内部使用的
		* 运营账号入口。
		*
		* 消费方：packages/agent-ui/src/components/setting/components/panels/HelpFeedbackPanel.tsx
		* @default false
		*/
		ProductFeature["ShowAboutQRCodes"] = "ShowAboutQRCodes";
		/**
		* 禁用"使用文档"入口
		* 设置为 true 时，隐藏帮助菜单（主进程原生菜单 + 渲染端自渲染菜单）中
		* 跳转到外部使用文档（https://www.codebuddy.cn/docs/workbuddy/Overview）的菜单项。
		* 用于专享版等不希望暴露公版品牌帮助文档的发行渠道。
		* @default false
		*/
		ProductFeature["DisableDocumentation"] = "DisableDocumentation";
		/**
		* 禁用 Claw 设置中的"元宝派"通道
		* 设置为 true 时，ClawSettingsPanel 不渲染 yuanbao 通道卡片
		* @default false
		*/
		ProductFeature["DisableYuanbaoChannel"] = "DisableYuanbaoChannel";
		/**
		* 禁用对话区「元宝搜索引流位」（disable 语义）。issue #88614
		*
		* 设置为 true 时，MainContentCore 不渲染「腾讯元宝提供搜索」标注与
		* 「在腾讯元宝中查看更多」按钮，也不上报 wbyb_ 系列展示/点击埋点。
		*
		* 与 DisableYuanbaoChannel 严格区分（二者业务含义不同，禁止再复用同一开关）：
		*   - DisableYuanbaoChannel：屏蔽「助理设置 / 顶栏连接」里的元宝机器人接入入口（#63784）。
		*   - DisableYuanbaoSearchEntry（本 flag）：只控制对话区搜索引流位；#88614 从上者拆出，
		*     修复「屏蔽机器人入口」误伤「搜索引流流量」的问题。
		*
		* 各版本默认：除海外版（workbuddy-ai）显式下发 true 关闭外，其余版本缺省展示。
		* 国内版本刻意不写死，保留远端 /v3/config 紧急 kill switch 能力。
		* @default false（缺省展示搜索引流位）
		*/
		ProductFeature["DisableYuanbaoSearchEntry"] = "DisableYuanbaoSearchEntry";
		/**
		* 禁用多模态内容生成能力（视频生成、3D 模型生成、图片视频特效等）。
		* 设为 true 时，给主 agent 的 system prompt 追加 capability_constraints 提示，
		* 告知模型当前不支持此能力，避免模型反复搜索不存在的 skill / tool。
		*
		* 注：实际的 skill 过滤通过 ProductConfiguration.disabledBuiltinSkills 配置。
		* @default false
		*/
		ProductFeature["DisableMultimodalGeneration"] = "DisableMultimodalGeneration";
		/**
		* 「帮助优化模型」开关的版本默认值（PRD #44599 / 需求 #59561）。
		* 设为 true 时：用户未显式配置 `enableModelOptimization` 时，
		*   - 主进程发送 `X-Private-Data: true`（默认关闭模型优化）
		*   - 设置面板的 toggle 初始位置为「关」
		* 注意：本 flag 只控制**默认值**，不控制 UI 入口是否展示——
		* 「帮助优化模型」开关对所有产品形态恒展示，用户始终可以主动开/关。
		* 取代 #50218 早期实现里复用 `DisableYuanbaoChannel` 作为隐式默认值控制的做法，
		* 把"模型优化默认值"与"元宝通道开关"两套语义解耦。
		* SaaS 企业版（旗舰版）由 `account.enterpriseId` 运行时判断叠加，不通过本 flag。
		* @default false
		*/
		ProductFeature["DefaultModelOptimizationOff"] = "DefaultModelOptimizationOff";
		/**
		* 启用从操作系统读取 HTTP 代理配置
		* 设置为 true 时，自动探测 macOS scutil / Windows 注册表 / Linux gsettings
		* 中的 HTTP 代理并写入 HTTP_PROXY / NO_PROXY；
		* 默认 false，仅遵循显式的 HTTP_PROXY / http_proxy 环境变量
		* @default false
		*/
		ProductFeature["SystemProxyDetection"] = "SystemProxyDetection";
		/**
		* 禁用分享功能
		* 设置为 true 时，隐藏所有分享入口（任务分享、产物分享、HTML 预览分享）
		* @default false
		*/
		ProductFeature["DisableShareFeature"] = "DisableShareFeature";
		/**
		* 是否屏蔽首页快捷入口
		* 设置为 true 时，同时隐藏新版首页的 mode-selector（SceneTabs）和
		* quick-actions chip 行（HomeComposer 内）。输入框、HomeHeader、PracticeCases 不受影响。
		* @default false
		*/
		ProductFeature["DisableHomeQuickEntries"] = "DisableHomeQuickEntries";
		/**
		* 是否启用企业管理控制台入口
		* 设置为 true 时，对 IOA 企业版用户在会话列表头部显示"企业管理"入口按钮
		* @default false
		*/
		ProductFeature["EnterpriseConsole"] = "EnterpriseConsole";
		/**
		* 是否启用欢迎页应用连接器区块（claw-welcome-header__apps-container）
		* 设置为 true 时，欢迎页展示 QQ 邮箱 / 腾讯文档 / 腾讯会议 / 腾讯乐享 /
		* ima 笔记 / 企业微信等应用入口
		* @default false
		*/
		ProductFeature["WelcomeAppsConnectors"] = "WelcomeAppsConnectors";
		/**
		* 是否启用 Context Summary Agent 压缩策略（旧 key，保留向后兼容）。
		* @deprecated 请使用 ProductFeature.EnablePreMessageCompact
		* @default false
		*/
		ProductFeature["ContextSummaryAgent"] = "ContextSummaryAgent";
		/**
		* 是否启用 pre-message 自动压缩策略。
		* 新 key 存在时优先生效；旧 ContextSummaryAgent 仅在该 key 缺失时作为兼容 fallback。
		* WorkBuddy 的 USER_COMMAND (/compact) 在 compact router 中仍走 PreMessageCompactStrategy；
		* CBC 手动 /compact 由 compact agent 入口处理，不依赖该开关。
		* @default false
		*/
		ProductFeature["EnablePreMessageCompact"] = "enablePreMessageCompact";
		/**
		* 是否禁用专家管理功能
		* 设置为 true 时，跳过 WorkBuddy 专家sp/skill的注入
		* @default false
		*/
		ProductFeature["DisableExpertManagement"] = "DisableExpertManagement";
		/**
		* 禁用对话框中的语音输入（ASR）入口
		* 设置为 true 时，隐藏聊天输入框中的麦克风按钮，
		* 并禁用 Cmd+D / Ctrl+D 语音输入快捷键。
		* 用于专享版（workbuddy-custom）与私有化（selfhosted）等渠道。
		* @default false
		*/
		ProductFeature["DisableVoiceInput"] = "DisableVoiceInput";
		/**
		* 禁用 AI 消息的语音输出（TTS / 朗读）入口
		* 设置为 true 时，隐藏消息气泡下方的朗读按钮（喇叭图标），
		* 用户无法触发文本转语音播放。
		* 与 DisableVoiceInput 配套但相互独立：ASR 与 TTS 是两个独立产品能力，
		* 可分别开启/关闭。专享版（workbuddy-custom）与私有化（selfhosted）等渠道
		* 默认全部禁用。
		* @default false
		*/
		ProductFeature["DisableVoiceOutput"] = "DisableVoiceOutput";
		/**
		* 是否跳过自定义模型的 supportsToolCall 检测
		* 设置为 true 时，即使模型 supportsToolCall===false 也不移除请求体中的 tools/tool_choice 字段，
		* 由网关或模型服务自行处理工具调用兼容性
		* @default false
		*/
		ProductFeature["SkipToolCallSupportCheck"] = "SkipToolCallSupportCheck";
		/**
		* 是否启用「企业成员个人自定义模型」策略管控（远端灰度开关）。
		* 启用后，登录的企业账号（account.enterpriseId 非空）会查询
		* GET /v2/enterprises/:enterpriseId/member-custom-model-policy/user-check，
		* 当后端返回 allowed=false 时，由 EnterpriseCustomModelPolicyFilterProvider
		* 把所有由 ~/.codebuddy/models.json 与 <workspace>/.codebuddy/models.json
		* 引入的本地自定义模型（tags 含 'custom' 且 id 带 'custom-local:' 前缀）
		* 从 ctx.current.models 中过滤掉。
		* 关闭时整条链路完全旁路，service 不发请求、provider 不修改 models。
		* @default false
		*/
		ProductFeature["EnableEnterpriseCustomModelPolicy"] = "EnableEnterpriseCustomModelPolicy";
		/**
		* 是否启用「企业 Skill 上传策略」管控（远端灰度开关）。
		* 启用后，登录的企业账号（account.enterpriseId 非空）会查询
		* GET /v2/enterprises/:enterpriseId/skill-upload-policy/user-check，
		* 当后端返回 allowed=false 时，由 chat-ui Skills 面板隐藏顶部
		* 「+ 导入 Skill」按钮（不渲染 <Add ... />，DOM 中无残留）；
		* 已安装的 Skill 列表 / 启停 / 删除等其它能力不受影响。
		* 关闭时整条链路完全旁路，service 不发请求、UI 正常显示按钮。
		* @default false
		*/
		ProductFeature["EnableEnterpriseSkillUploadPolicy"] = "EnableEnterpriseSkillUploadPolicy";
		/**
		* 是否开启 WebFetch 远程 API 能力
		* 设置为 true 时，WebFetch 工具会通过远程 API 抓取网页内容（race 策略）
		* 设置为 false 时，仅使用本地抓取
		* @default true
		*/
		ProductFeature["WebFetchRemoteApi"] = "WebFetchRemoteApi";
		/**
		* 是否启用「企业 License 过期检查」管控（远端灰度开关）。
		* 启用后，登录的企业账号（account.enterpriseId 非空）会每 5 分钟查询一次
		* GET /console/enterprises/:enterpriseId/license，当 200 响应里的
		* licenseStatus 为 'expired' 或 'overdue' 时，desktop main 进程将
		* licenseUsable$ 置为 false → 通过 RPC channel `license:onChange` 推给 renderer
		* → ChatInput 的 send 按钮置灰 + tooltip。账号继续维持登录态，不再 logout。
		* 'normal' / 'probation' 视为可用，其余值（缺失 / 空串 / 未知值）以及任何
		* HTTP / 解析 / 网络异常一律 fail-open。
		*
		* - 仅 workbuddy-desktop 消费（vscode/cli/web 不读）
		* - 仅企业账号生效；个人/匿名账号短路不发请求
		* - 关闭时整条 LicenseOverviewService 链路旁路（不轮询、不发请求，licenseUsable$
		*   维持初值 usable=true，renderer send 按钮始终可点）
		*
		* 参见：docs/superpowers/specs/2026-06-10-license-disable-send-button-design.md
		* @default false
		*/
		ProductFeature["EnableEnterpriseLicenseCheck"] = "EnableEnterpriseLicenseCheck";
		/**
		* 是否启用「企业 Claw 渠道管控」（远端灰度开关）。
		* 启用后，登录的企业账号（account.enterpriseId 非空）会每 5 分钟查询一次
		* GET /v2/enterprises/:enterpriseId/claw/control，按 200 响应里的
		* masterEnabled / channels 字段计算「最终判定」并通过 RPC channel
		* `clawControl:onChange` 推给 renderer：总开关关闭隐藏左侧入口/助理设置/顶栏连接，
		* 被关渠道隐藏入口并强制断开已有绑定。字段缺失 / 非企业 / 任何
		* HTTP / 解析 / 网络异常一律 fail-open（masterEnabled=true、channels 为空=不限制）。
		*
		* - 仅 workbuddy-desktop 消费（vscode/cli/web 不读，Web facade stub 恒 fail-open）
		* - 仅企业账号生效；个人/匿名账号短路不发请求
		* - 关闭时整条 ClawControlService 链路旁路（不轮询、不发请求，clawControl$
		*   维持 fail-open 初值 → renderer 所有渠道入口照常展示、不强制断开）
		*
		* 参见 issue #53161。
		* @default false
		*/
		ProductFeature["EnableClawChannelControl"] = "EnableClawChannelControl";
		/**
		* 是否启用 AI 代码入库率统计能力
		*
		* 该能力仅面向企业版、私有化部署、专享版（VPC）客户；SaaS 版默认不启用。
		* 最终生效依赖：
		*   1) 部署层：后端 DeploymentEnv 必须是 enterprise / exclusive / i18n-exclusive
		*   2) 产品配置：product.json productFeatures.CodeAdoptionRate = true
		* 只有两层都启用时，端侧才会采集 AI 代码变更、commit diff 并上报入库率事件。
		*
		* 参见：
		*   - 实施方案 https://iwiki.woa.com/p/4020266859
		*   - 任务拆分 https://iwiki.woa.com/p/4020267027 (T1)
		* @default false
		*/
		ProductFeature["CodeAdoptionRate"] = "CodeAdoptionRate";
		/**
		* 是否启用用户 Prompt 情绪摩擦分析及指标上报。
		*
		* 只有 productFeatures.ChatPromptFrictionAnalysis 显式配置为 true 时才启用。
		* 关闭时不调用 Recall API，也不上报 chat_prompt_friction_analysis 事件。
		* @default false
		*/
		ProductFeature["ChatPromptFrictionAnalysis"] = "ChatPromptFrictionAnalysis";
		/**
		* 是否启用侧边栏「助理」（Claw）入口
		* 设置为 false 时，隐藏侧边栏的助理 tab
		* @default true
		*/
		ProductFeature["Claw"] = "Claw";
		/**
		* 是否启用侧边栏「自动化」入口
		* 设置为 false 时，隐藏侧边栏的自动化 tab
		* @default true
		*/
		ProductFeature["Automation"] = "Automation";
		/**
		* 是否启用「更多」菜单中的「灵感」（由探索改名而来）入口
		* 设置为 false 时，隐藏更多菜单中的灵感选项
		* @default true
		*/
		ProductFeature["Discover"] = "Discover";
		ProductFeature["AgentMail"] = "AgentMail";
		/**
		* 安全中心入口
		*
		* 控制设置页"安全中心"导航项与面板的显示。
		* 私有化 / 企业版默认开启；SaaS / Cloudhosted 默认关闭并回退到旧版"软件配置"面板。
		* 由 useSecurityCenterFeature() 消费，语义为 enable（true 才显示）。
		* @default false
		*/
		ProductFeature["EnableSecurityCenter"] = "EnableSecurityCenter";
		/**
		* host-mediated 微信支付（AI专属卡）运行时拦截总开关。
		* 启用后，工具结果命中微信支付触发（weixin:// 链接 / WeixinPay-Required）时
		* 由 host 接管：挂起工具、推送 elicitation 支付卡片、查单收口。关闭后完全透传，
		* 退回插件既有 LLM-mediated 流程，零副作用（不下单、不弹卡）。
		* 默认开，可经 /v3/config 远程下发 false 一键关停。
		* @default true
		*/
		ProductFeature["WeixinPayInterception"] = "WeixinPayInterception";
		/**
		* IOA IM 通道白名单资格
		*
		* 由 Unleash 按 DepartmentId 维度下发。为 true 时，IOA 用户/IOA 机器上的
		* 个人账号可在"查看"菜单中看到"允许非腾讯系 IM 通道"开关。
		* 开关默认关闭，用户手动开启后才解除非腾讯系 IM（飞书/钉钉/Slack 等）的限制。
		*
		* @default false
		*/
		ProductFeature["IOAImWhitelistEligible"] = "IOAImWhitelistEligible";
		/**
		* 首页实践案例功能开关
		* 控制首页是否展示实践案例入口（如 C++ 教程、Python 爬虫等）
		*
		* @default false
		*/
		ProductFeature["HomePracticeCases"] = "HomePracticeCases";
		/**
		* 隐藏内置预置 skill（issue #56021）。
		*
		* 设置为 true 时，新建任务输入 "/" 唤起的命令面板会过滤掉随包分发的内置预置
		* skill —— 当前包括：
		*   - ardot 设计助手（`ardot-design-assistant`）
		*   - weixinpay 微信支付（插件 skill `weixinpay-*` / 命令 `*:weixinpay:*`）
		*
		* 用于不提供上述能力的发行版（如专享版 workbuddy-custom）。缺省 / false 时
		* 行为不变，"/" 列表照常展示这些 skill。具体名称黑名单维护在
		* `@genie/agent-ui` 的 `utils/builtin-skill-visibility.ts`。
		* @default false
		*/
		ProductFeature["HidePresetBuiltinSkills"] = "HidePresetBuiltinSkills";
		/**
		* 隐藏更新就绪 Toast 上的「更新日志」按钮（issue #50176）。
		*
		* 设置为 true 时，左下角更新就绪 Toast（UpdateToast 的 ready 状态）只渲染
		* 「关闭」+「重启升级」两个按钮，不再展示「更新日志」入口。点击该入口会跳到
		* 通用 changelog 页（含 codebuddy / workbuddy 品牌字样），与专享版品牌冲突。
		*
		* 用于不希望暴露通用品牌名的发行版（如专享版 workbuddy-custom）。缺省 / false
		* 时行为不变，Toast 仍照常展示「更新日志」按钮。
		* @default false
		*/
		ProductFeature["DisableUpdateChangelog"] = "DisableUpdateChangelog";
		/**
		* 是否启用项目本地任务功能
		* 启用后，WorkBuddy 支持基于项目维度的本地任务管理
		* @default false
		*/
		ProductFeature["ProjectLocalTask"] = "ProjectLocalTask";
		/**
		* 是否启用项目列表「置顶」UI（enable 语义，默认关闭）。
		*
		* 启用后，项目首页卡片的 ⋯ 菜单出现「置顶 / 取消置顶」项，置顶项在列表中带角标并恒排最前。
		* 后端 pin/unpin API 与排序（pinned_at 优先）始终生效，本 flag 仅控制前端入口是否展示，
		* 便于灰度放量。缺省 / false → 不渲染任何置顶入口与角标。
		* @default false
		*/
		ProductFeature["EnableProjectPin"] = "EnableProjectPin";
		/**
		* 「委派给助理」入口是否对当前用户可见（enable 语义，默认关闭）。#64671
		*
		* 助理本体（530 版本）先在司内 IOA 环境放量，外网还没上线，
		* 所有把 todo 委派给助理的入口都要跟着做发行版门控，避免外网用户
		* 触达到「派给我的助理」→ 后端 403 / 静默无响应这类破损体验。
		*
		* 覆盖入口（同一开关统一控制）：
		*   1. 计划创建 drawer 底部「指派给我的助理」开关
		*   2. 待办详情右上角 header 的委派入口 TodoDelegateHeaderEntry
		*   3. 评论 @候选里的「{我}的助理」项
		*
		* 仅 IOA 发行版 patch（build/patches/workbuddy-desktop/product.ioa.json）
		* 显式配置 `TodoAssistantDelegate: true`；其他发行版缺省 → false → 整块入口不渲染。
		* 未来外网放量时改 product.json 即可，无需回改代码走完整发布。
		*
		* @default false
		*/
		ProductFeature["TodoAssistantDelegate"] = "TodoAssistantDelegate";
		/**
		* 是否禁用「SkillHub」入口（技能市场 discover 区的 SkillHub Tab）
		* 设置为 true 时，浏览态与搜索态均不渲染 SkillHub Tab 入口。
		* SkillHub 下多为中文资产，海外场景（如 workbuddy-ai）暂未适配，需要先屏蔽入口。
		* @default false（默认展示）
		*/
		ProductFeature["DisableSkillHub"] = "DisableSkillHub";
		/**
		* 是否禁用「存储扩容/升级」入口（disable 语义）。#73830 #73721
		*
		* 设置为 true 时：
		*   1. 隐藏资产库容量条的「升级/扩容」按钮；
		*   2. 上传超出剩余容量、或单文件超出免费上限时，不再展示指向升级/购买页的
		*      「前往升级」CTA，改为仅提示容量/大小已达上限。
		*
		* 用于暂不支持存储扩容的发行版（如海外版 workbuddy-ai）。
		* 缺省 / false 时行为不变（展示升级入口，跳国内升级/购买页）。
		* @default false
		*/
		ProductFeature["DisableStorageUpgradeEntry"] = "DisableStorageUpgradeEntry";
		/** 知识空间（Space）资料库入口开关（enable 语义，默认关闭）。
		*
		* 仅 SaaS WorkBuddy Desktop 客户端在 product.json 中显式开启；
		* 私有化、VPC、Web 端不配置此字段 → 默认关闭 → 整块能力不渲染。
		*
		* 关闭时：
		*   - SpaceKeepAlive 不挂载（不预加载 iframe）
		*   - isSpaceUrl 恒返回 false（markdown 链接 / deep link 不识别为 space）
		*   - warmupSpaceIframe 为 no-op
		* @default false
		*/
		ProductFeature["Space"] = "Space";
		/**
		* 是否禁用「技能套件」内置插件市场（workbuddy-builtin）分类 Tab 入口（disable 语义）。#75105
		* 设置为 true 时，skill 界面 plugins 区域不渲染 workbuddy-builtin 市场分类 Tab
		* （连同默认选中态、跨市场搜索聚合一并排除）。
		* workbuddy-builtin 下无对外展示资产，海外场景（如 workbuddy-ai）需要屏蔽该空入口。
		* @default false（默认展示）
		*/
		ProductFeature["DisableBuiltinPluginMarketplace"] = "DisableBuiltinPluginMarketplace";
		/**
		* 允许自定义菜单（`client-menu-webview` guest）内的跳转留在应用内置浏览器（enable 语义）。#78305
		*
		* 开启后**仅**对 partition = `client-menu-webview` 的 guest webview 生效：
		*   - 任意 http/https 目标 → 留在当前 guest 继续加载，不再 `shell.openExternal`；
		*   - `mailto:` / `tel:` → 交系统协议处理；
		*   - `file:` / `data:` / `javascript:` / `blob:` / 无法解析的 URL → 静默拒绝。
		* 其它 guest（腾讯文档导入/预览、MCP Apps、浏览器预览、乐享）完全不受影响。
		*
		* 动机：专享版 / 私有化客户的自定义菜单指向客户内网站点，其 SSO 登录链路
		* （业务页 → passport → 回调页）跨多个域名多跳。任一跳被外抛到系统浏览器，
		* Cookie 就写不回 guest session，表现为「登录成功但内嵌页仍未登录」。
		* 内网域名无法穷举，故按「部署形态」整体授信，而不是维护 host 白名单。
		*
		* 取代早期在代码里硬编码 `networkEnvironment ∈ {selfhosted, cloudhosted}` 的判定：
		* `networkEnvironment` 不是产品配置里的静态字段，而是由
		* `workbuddy-product-config.ts::resolveWorkbuddyProductEnvironmentFromSession()`
		* 按登录域名运行时派生。品牌定制包（`PRODUCT_PATCH`）的 endpoint 常落在
		* `internalDomain` 里而派生成 `Internal`，硬编码判定对它失效；且硬编码无法按客户 /
		* 按部署分别控制。改为开关后判据由「运行时域名派生」变成「部署时声明」。
		*
		* 配置落点（与既有 VPC 开关如 `DisableLoginLegalLinks`、`HtmlPreviewShare` 一致，
		* 三处同时配，缺一条就有客户形态漏配）：
		*   - `build/patches/workbuddy-desktop/product.selfhosted.json`  → 公版包 + 客户私有化域名
		*   - `build/patches/workbuddy-desktop/product.cloudhosted.json` → 公版包 + 云托管租户
		*   - `build/patches/workbuddy-custom/product.json`              → 专享版定制包
		*     （定制包构建会 unlink 掉 env 变体文件，只能走 base 层，见 `copy-cli.js`）
		* `IOA` / `Internal` 不配：那是腾讯内部形态而非客户 VPC 形态。
		*
		* 安全约定：本开关放宽导航边界，公版基线 `cli-saas/product.json` 显式置 false。
		* daemon 侧 `productFeatures` 合并顺序为 remote → base（base 覆盖 remote），base 缺
		* key 时远端 `/v3/config` 可注入 true。该 false 不影响 env 层覆盖——Desktop 本地合并
		* 顺序为 base → env → source（`Object.assign`，后写赢）。
		* @default false（缺省即关闭，行为与开关引入前逐字节一致）
		*/
		ProductFeature["EnableClientMenuInAppNavigation"] = "EnableClientMenuInAppNavigation";
		return ProductFeature;
	}({});
PRODUCT_CONFIGURATION_CACHE_TIMEOUT = 480 * 1e3;
ProductEnviroment = /* @__PURE__ */ function(ProductEnviroment) {
		ProductEnviroment["External"] = "external";
		ProductEnviroment["Internal"] = "internal";
		ProductEnviroment["IOA"] = "iOA";
		ProductEnviroment["Selfhosted"] = "selfhosted";
		ProductEnviroment["Cloudhosted"] = "cloudhosted";
		return ProductEnviroment;
	}({});
ENV_KEY_CODEBUDDY_COPILOT_INTERNET_ENVIRONMENT = "CODEBUDDY_COPILOT_INTERNET_ENVIRONMENT";
return {ProductEnviroment,MergeStrategy,ProductFeature,PRODUCT_CONFIGURATION_CACHE_TIMEOUT,ENV_KEY_CODEBUDDY_COPILOT_INTERNET_ENVIRONMENT};})();
const devEnvironment=(()=>{function readCustomEnvs() {
	if (!isDevEnvOverrideEnabled()) return [];
	try {
		const raw = fs.readFileSync(getOverrideFilePath(), "utf-8");
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed.customEnvs) ? parsed.customEnvs : [];
	} catch {
		return [];
	}
}
function getOverrideFilePath() {
	const configDir = process.env.WORKBUDDY_CONFIG_DIR?.trim() || path.join(os.homedir(), ".workbuddy");
	return path.join(configDir, "dev-env.json");
}
function isDevEnvOverrideEnabled() {
	return process.env.NODE_ENV === "development" || devEnvOverrideForceEnabled;
}
function readDevEnv() {
	if (!isDevEnvOverrideEnabled()) return "prod";
	try {
		const raw = fs.readFileSync(getOverrideFilePath(), "utf-8");
		const parsed = JSON.parse(raw);
		if (parsed.env === "staging" || parsed.env === "prod") return parsed.env;
		if (typeof parsed.env === "string" && parsed.env.startsWith("custom:")) return parsed.env;
	} catch {}
	return "prod";
}
function resolveEndpointOverride() {
	if (!isDevEnvOverrideEnabled()) return;
	const env = readDevEnv();
	if (env === "prod") return;
	if (env.startsWith("custom:")) {
		const name = env.slice(7);
		return readCustomEnvs().find((e) => e.name === name)?.endpoint;
	}
	return DEV_ENV_ENDPOINTS[env];
}
var DEV_ENV_ENDPOINTS, ARDOT_DEV_ENV_ENDPOINTS, devEnvOverrideForceEnabled;
DEV_ENV_ENDPOINTS = {
		prod: "https://copilot.tencent.com",
		staging: "https://staging.codebuddy.cn"
	};
ARDOT_DEV_ENV_ENDPOINTS = {
		prod: "https://ardot.tencent.com",
		staging: "https://test.ardot.tencent.com"
	};
devEnvOverrideForceEnabled = false;
return {readCustomEnvs,getOverrideFilePath,isDevEnvOverrideEnabled,readDevEnv,resolveEndpointOverride,DEV_ENV_ENDPOINTS,ARDOT_DEV_ENV_ENDPOINTS,devEnvOverrideForceEnabled};})();
const productConfig=(()=>{const require_common$1=common,require_dev_env_override=devEnvironment;function setBundledAssetsRoot(dir) {
	_root = dir;
}
function getAssetsRoot() {
	return _root ?? process.cwd();
}
function getElectronResourcesPath() {
	const resourcesPath = process.resourcesPath;
	return typeof resourcesPath === "string" && resourcesPath.length > 0 ? resourcesPath : void 0;
}
function resolveBundledAsset(...segments) {
	const root = getAssetsRoot();
	for (const fn of CANDIDATES_FNS) {
		const p = fn(root, segments);
		if (p && (0, fs.existsSync)(p)) return p;
	}
}
var _root, CANDIDATES_FNS;
function resolveMacInstallChannelDir(product, env = process.env) {
	const override = normalizeString(env.WORKBUDDY_INSTALL_CHANNEL_DIR);
	if (override) return override;
	const appSupportName = normalizeString(product?.productName) ?? normalizeString(product?.applicationName) ?? DEFAULT_APP_SUPPORT_NAME;
	return path.join(os.homedir(), "Library", "Application Support", appSupportName);
}
function resolveMacInstallChannelPath(product, env = process.env) {
	return path.join(resolveMacInstallChannelDir(product, env), INSTALL_CHANNEL_FILE_NAME);
}
function resolveMacInstallChannelUpdateMarkerPath(product, env = process.env) {
	return path.join(resolveMacInstallChannelDir(product, env), UPDATE_MARKER_FILE_NAME);
}
function reconcileMacInstallChannel(product, options) {
	if ((options?.platform ?? process.platform) !== "darwin") return;
	const channelPath = resolveMacInstallChannelPath(product, options?.env);
	if (consumedUpdateMarker || consumeFreshUpdateMarker(product, options)) return readInstallChannelRecord(channelPath);
	const seed = getInstallChannelSeed(product);
	if (seed?.mode === "channel-package" && seed.channel) {
		const record = {
			downloadChannel: seed.channel,
			source: seed.source,
			writtenAt: new Date(options?.now ?? Date.now()).toISOString(),
			appVersion: getProductVersion(product),
			bundleId: getBundleId(product)
		};
		writeJsonAtomically(channelPath, record);
		return record;
	}
	if (seed?.mode === "official") {
		deleteFile(channelPath);
		return;
	}
	return readInstallChannelRecord(channelPath);
}
function applyMacInstallChannelToProductConfiguration(product, options) {
	const record = reconcileMacInstallChannel(product, options);
	if (!record?.downloadChannel) return product;
	const config = isRecord(product.config) ? { ...product.config } : {};
	const rawBranding = config.channelBranding;
	const channelBranding = isRecord(rawBranding) ? { ...rawBranding } : {};
	channelBranding.channelId = record.downloadChannel;
	return {
		...product,
		downloadChannel: record.downloadChannel,
		config: {
			...config,
			channelBranding
		}
	};
}
function consumeFreshUpdateMarker(product, options) {
	const markerPath = resolveMacInstallChannelUpdateMarkerPath(product, options?.env);
	const marker = readJsonFile(markerPath);
	deleteFile(markerPath);
	if (marker?.source !== "auto-update" || typeof marker.startedAt !== "number") return false;
	const now = options?.now ?? Date.now();
	const isFresh = now - marker.startedAt >= 0 && now - marker.startedAt <= UPDATE_MARKER_TTL_MS;
	if (isFresh) consumedUpdateMarker = true;
	return isFresh;
}
function getInstallChannelSeed(product) {
	const rawSeed = product.installChannel;
	if (!isRecord(rawSeed)) return;
	const mode = normalizeString(rawSeed.mode);
	const channel = normalizeChannel(rawSeed.channel);
	if (mode === "channel-package" && channel) return {
		mode,
		channel,
		source: normalizeString(rawSeed.source) ?? "installChannel"
	};
	if (mode === "official") return {
		mode,
		source: normalizeString(rawSeed.source) ?? "installChannel"
	};
}
function readInstallChannelRecord(channelPath) {
	const record = readJsonFile(channelPath);
	const downloadChannel = normalizeChannel(record?.downloadChannel);
	if (!downloadChannel) return;
	return {
		downloadChannel,
		source: normalizeString(record?.source) ?? "persisted",
		writtenAt: normalizeString(record?.writtenAt) ?? "",
		appVersion: normalizeString(record?.appVersion),
		bundleId: normalizeString(record?.bundleId)
	};
}
function readJsonFile(filePath) {
	try {
		return JSON.parse(fs.readFileSync(filePath, "utf8"));
	} catch {
		return;
	}
}
function writeJsonAtomically(filePath, value) {
	fs.mkdirSync(path.dirname(filePath), {
		recursive: true,
		mode: 448
	});
	const tempPath = `${filePath}.tmp`;
	fs.writeFileSync(tempPath, `${JSON.stringify(value, null, 2)}\n`, {
		encoding: "utf8",
		mode: 384
	});
	fs.renameSync(tempPath, filePath);
}
function deleteFile(filePath) {
	try {
		fs.rmSync(filePath, { force: true });
	} catch {}
}
function normalizeString(value) {
	if (typeof value !== "string") return;
	return value.trim() || void 0;
}
function normalizeChannel(value) {
	const channel = normalizeString(value);
	if (!channel || /[\0\r\n]/.test(channel)) return;
	return channel;
}
function isRecord(value) {
	return !!value && typeof value === "object" && !Array.isArray(value);
}
function getProductVersion(product) {
	return normalizeString(product.productVersion) ?? normalizeString(product.genieVersion);
}
function getBundleId(product) {
	return normalizeString(product?.darwinBundleIdentifier);
}
var INSTALL_CHANNEL_FILE_NAME, UPDATE_MARKER_FILE_NAME, UPDATE_MARKER_TTL_MS, DEFAULT_APP_SUPPORT_NAME, consumedUpdateMarker;
function resolveAccProductConfigCachePath() {
	const base = process.env.WORKBUDDY_CONFIG_DIR?.trim() || process.env.CODEBUDDY_CONFIG_DIR?.trim() || path.join(os.homedir(), ".workbuddy");
	return path.join(base, "cache", "acc-product-config-v3.json");
}
function assignAccProductConfigV3ToProcessEnv(json) {
	if (process.platform !== "linux" || Buffer.byteLength(json, "utf8") <= ACC_PRODUCT_CONFIG_INLINE_ENV_MAX_BYTES) {
		setInlineAccProductConfigV3(json);
		return;
	}
	const configPath = resolveAccProductConfigCachePath();
	try {
		fs.mkdirSync(path.dirname(configPath), {
			recursive: true,
			mode: 448
		});
		const tempPath = `${configPath}.tmp`;
		fs.writeFileSync(tempPath, json, {
			encoding: "utf8",
			mode: 384
		});
		fs.renameSync(tempPath, configPath);
	} catch (error) {
		console.warn(`[WorkbuddyProductConfig] Failed to spill ACC_PRODUCT_CONFIG_V3 to ${configPath}, falling back to inline env (${Buffer.byteLength(json, "utf8")} bytes):`, error);
		setInlineAccProductConfigV3(json);
		return;
	}
	delete process.env.ACC_PRODUCT_CONFIG_V3;
	process.env[ACC_PRODUCT_CONFIG_PATH_ENV] = configPath;
	console.log(`[WorkbuddyProductConfig] Spilled oversized ACC_PRODUCT_CONFIG_V3 (${Buffer.byteLength(json, "utf8")} bytes) to ${configPath} to avoid execve E2BIG.`);
}
function setInlineAccProductConfigV3(json) {
	process.env.ACC_PRODUCT_CONFIG_V3 = json;
	const stalePath = process.env[ACC_PRODUCT_CONFIG_PATH_ENV];
	if (stalePath) try {
		fs.rmSync(stalePath, { force: true });
	} catch {}
	delete process.env[ACC_PRODUCT_CONFIG_PATH_ENV];
}
function readProductConfigurationFromDisk(fileName = "product.json") {
	const resolved = resolveBundledAsset("cli", fileName);
	if (resolved) try {
		return JSON.parse(fs.readFileSync(resolved, "utf-8"));
	} catch {}
	throw new Error(`[WorkbuddyProductConfig] Failed to locate cli/${fileName}.`);
}
function getWorkbuddyBaseProductConfiguration() {
	if (!cachedBaseProductConfiguration) cachedBaseProductConfiguration = readProductConfigurationFromDisk();
	return cachedBaseProductConfiguration;
}
function tryGetWorkbuddyBaseProductConfiguration() {
	try {
		return getWorkbuddyBaseProductConfiguration();
	} catch {
		return;
	}
}
function resolveWorkbuddyProductEnvironmentFromSession(session, sourceProduct) {
	const domain = session?.auth?.domain;
	if (!domain) return;
	const attributes = getMergedAuthenticationConfiguration(sourceProduct)?.attributes ?? {};
	if (isMatchingDomain(attributes.internalDomain, domain)) return require_common$1.ProductEnviroment.Internal;
	if (isMatchingDomain(attributes.iOADomain, domain)) return require_common$1.ProductEnviroment.IOA;
	if (isMatchingDomain(attributes.cloudHostedDomain, domain)) return require_common$1.ProductEnviroment.Cloudhosted;
	if (isMatchingDomain(attributes.externalDomain, domain)) return require_common$1.ProductEnviroment.External;
	return require_common$1.ProductEnviroment.Selfhosted;
}
function buildWorkbuddyResolvedProductConfiguration(options) {
	const base = getWorkbuddyBaseProductConfiguration();
	const source = options?.product;
	const networkEnvironment = options?.networkEnvironment ?? resolveWorkbuddyProductEnvironmentFromSession(options?.session, source ?? base) ?? source?.networkEnvironment ?? base.networkEnvironment;
	const environmentProduct = getWorkbuddyEnvironmentProductConfiguration(networkEnvironment);
	const authentication = getMergedAuthenticationConfiguration(source);
	const mergedProductFeatures = mergeObjectLayers(base.productFeatures, environmentProduct?.productFeatures, source?.productFeatures);
	if (process.env.WORKBUDDY_PRODUCT_CONFIG_DEBUG === "1") {
		console.log("[WorkbuddyProductConfig] networkEnvironment:", networkEnvironment);
		console.log("[WorkbuddyProductConfig] loaded environment config:", networkEnvironment ? `product.${networkEnvironment.toLowerCase()}.json` : "none");
		console.log("[WorkbuddyProductConfig] environmentProduct productFeatures:", environmentProduct?.productFeatures);
		console.log("[WorkbuddyProductConfig] base productFeatures:", base.productFeatures);
		console.log("[WorkbuddyProductConfig] source productFeatures:", source?.productFeatures);
		console.log("[WorkbuddyProductConfig] merged productFeatures:", JSON.stringify(mergedProductFeatures, null, 2));
	}
	let resolved = {
		...base,
		...environmentProduct,
		...source,
		networkEnvironment,
		authentication,
		productFeatures: mergedProductFeatures,
		featureToggles: mergeObjectLayers(base.featureToggles, environmentProduct?.featureToggles, source?.featureToggles),
		config: mergeObjectLayers(base.config, environmentProduct?.config, source?.config),
		prompts: mergeNamedArrayLayers(base.prompts, environmentProduct?.prompts, source?.prompts),
		agents: mergeNamedArrayLayers(base.agents, environmentProduct?.agents, source?.agents),
		models: options?.remoteHasModels && source?.models?.length ? source.models : mergeNamedArrayLayers(base.models, environmentProduct?.models, source?.models),
		skills: mergeNamedArrayLayers(base.skills, environmentProduct?.skills, source?.skills),
		tools: mergeNamedArrayLayers(base.tools, environmentProduct?.tools, source?.tools),
		modelPromotions: mergeNamedArrayLayers(base.modelPromotions, environmentProduct?.modelPromotions, source?.modelPromotions)
	};
	const useRemoteReplace = !!(options?.remoteHasModels && source?.models?.length);
	try {
		const logger = import_common.ContainerUtil.get(import_common.Logger);
		const getModelIds = (models) => models?.map((m) => m.id).filter(Boolean).join(", ") || "(none)";
		logger.info(`[buildResolvedProductConfig] remoteHasModels=${!!options?.remoteHasModels}, useRemoteReplace=${useRemoteReplace}, base=${base.models?.length ?? 0}, env=${environmentProduct?.models?.length ?? 0}, source=${source?.models?.length ?? 0}, resolved=${resolved.models?.length ?? 0}`);
		logger.info(`[buildResolvedProductConfig] base ids: ${getModelIds(base.models)}`);
		logger.info(`[buildResolvedProductConfig] env ids: ${getModelIds(environmentProduct?.models)}`);
		logger.info(`[buildResolvedProductConfig] source ids: ${getModelIds(source?.models)}`);
		logger.info(`[buildResolvedProductConfig] resolved ids: ${getModelIds(resolved.models)}`);
	} catch {}
	const endpointOverride = require_dev_env_override.resolveEndpointOverride();
	if (endpointOverride) {
		resolved.endpoint = endpointOverride;
		if (resolved.authentication) resolved.authentication = {
			...resolved.authentication,
			endpoint: endpointOverride
		};
	}
	if (process.env.NODE_ENV === "development" && resolved.authentication) {
		const baseId = resolved.authentication.id ?? "workbuddy-desktop";
		if (!baseId.endsWith("-dev")) resolved.authentication = {
			...resolved.authentication,
			id: `${baseId}-dev`
		};
	}
	resolved = applyMacInstallChannelToProductConfiguration(resolved);
	return resolved;
}
function getMergedAuthenticationConfiguration(sourceProduct) {
	const baseAuthentication = tryGetWorkbuddyBaseProductConfiguration()?.authentication;
	const sourceAuthentication = sourceProduct?.authentication;
	if (!baseAuthentication && !sourceAuthentication) return;
	return {
		...sourceAuthentication ?? {},
		...baseAuthentication ?? {},
		attributes: {
			...baseAuthentication?.attributes ?? {},
			...sourceAuthentication?.attributes ?? {}
		}
	};
}
function getWorkbuddyEnvironmentProductConfiguration(networkEnvironment) {
	if (!networkEnvironment) return;
	const cacheKey = networkEnvironment.toLowerCase();
	if (cachedEnvironmentProductConfigurations.has(cacheKey)) return cachedEnvironmentProductConfigurations.get(cacheKey);
	try {
		const product = readProductConfigurationFromDisk(`product.${cacheKey}.json`);
		delete product.authentication;
		cachedEnvironmentProductConfigurations.set(cacheKey, product);
		return product;
	} catch {
		cachedEnvironmentProductConfigurations.set(cacheKey, void 0);
		return;
	}
}
function mergeNamedArrayLayers(...layers) {
	const definedLayers = layers.filter((layer) => Array.isArray(layer));
	if (definedLayers.length === 0) return;
	const getKey = (item) => item.id ?? item.name;
	const result = [...definedLayers[0]];
	for (let i = 1; i < definedLayers.length; i++) for (const item of definedLayers[i]) {
		const key = getKey(item);
		if (key) {
			const existingIndex = result.findIndex((r) => getKey(r) === key);
			if (existingIndex >= 0) result[existingIndex] = {
				...result[existingIndex],
				...item
			};
			else result.push(item);
		} else result.push(item);
	}
	return result;
}
function mergeObjectLayers(...layers) {
	const definedLayers = layers.filter((layer) => !!layer);
	if (definedLayers.length === 0) return;
	return Object.assign({}, ...definedLayers);
}
function isMatchingDomain(configuredDomain, currentDomain) {
	if (!configuredDomain) return false;
	return (Array.isArray(configuredDomain) ? configuredDomain : [configuredDomain]).some((domainPattern) => {
		if (domainPattern === currentDomain) return true;
		if (!domainPattern.includes("*")) return false;
		return new RegExp(`^${domainPattern.replace(/\./g, "\\.").replace(/\*/g, "[^.]*")}$`).test(currentDomain);
	});
}
var import_common, cachedBaseProductConfiguration, cachedBootstrapProductConfigurationEnv, cachedEnvironmentProductConfigurations, ACC_PRODUCT_CONFIG_PATH_ENV, ACC_PRODUCT_CONFIG_INLINE_ENV_MAX_BYTES;
CANDIDATES_FNS = [
		(_root, segments) => {
			const resourcesPath = getElectronResourcesPath();
			return resourcesPath ? (0, path.join)(resourcesPath, "app.asar.unpacked", "resources", ...segments) : void 0;
		},
		(_root, segments) => {
			const resourcesPath = getElectronResourcesPath();
			return resourcesPath ? (0, path.join)(resourcesPath, "app.asar.unpacked", ...segments) : void 0;
		},
		(root, segments) => (0, path.join)(root, ...segments),
		(root, segments) => (0, path.join)(root, "..", "resources", ...segments),
		(root, segments) => (0, path.join)(root, "resources", ...segments),
		(root, segments) => (0, path.join)(root, "..", "..", ...segments),
		(root, segments) => (0, path.join)(root, "..", "..", "resources", ...segments)
	];
INSTALL_CHANNEL_FILE_NAME = "install-channel.json";
UPDATE_MARKER_FILE_NAME = "install-channel-update-marker.json";
UPDATE_MARKER_TTL_MS = 1800 * 1e3;
DEFAULT_APP_SUPPORT_NAME = "WorkBuddy";
consumedUpdateMarker = false;
cachedEnvironmentProductConfigurations = /* @__PURE__ */ new Map();
ACC_PRODUCT_CONFIG_PATH_ENV = "ACC_PRODUCT_CONFIG_PATH";
ACC_PRODUCT_CONFIG_INLINE_ENV_MAX_BYTES = 48e3;
import_common=runtime.di;if(runtime.assetsRoot)setBundledAssetsRoot(runtime.assetsRoot);return {setBundledAssetsRoot,getAssetsRoot,getElectronResourcesPath,resolveBundledAsset,_root,CANDIDATES_FNS,resolveMacInstallChannelDir,resolveMacInstallChannelPath,resolveMacInstallChannelUpdateMarkerPath,reconcileMacInstallChannel,applyMacInstallChannelToProductConfiguration,consumeFreshUpdateMarker,getInstallChannelSeed,readInstallChannelRecord,readJsonFile,writeJsonAtomically,deleteFile,normalizeString,normalizeChannel,isRecord,getProductVersion,getBundleId,INSTALL_CHANNEL_FILE_NAME,UPDATE_MARKER_FILE_NAME,UPDATE_MARKER_TTL_MS,DEFAULT_APP_SUPPORT_NAME,consumedUpdateMarker,resolveAccProductConfigCachePath,assignAccProductConfigV3ToProcessEnv,setInlineAccProductConfigV3,readProductConfigurationFromDisk,getWorkbuddyBaseProductConfiguration,tryGetWorkbuddyBaseProductConfiguration,resolveWorkbuddyProductEnvironmentFromSession,buildWorkbuddyResolvedProductConfiguration,getMergedAuthenticationConfiguration,getWorkbuddyEnvironmentProductConfiguration,mergeNamedArrayLayers,mergeObjectLayers,isMatchingDomain,import_common,cachedBaseProductConfiguration,cachedBootstrapProductConfigurationEnv,cachedEnvironmentProductConfigurations,ACC_PRODUCT_CONFIG_PATH_ENV,ACC_PRODUCT_CONFIG_INLINE_ENV_MAX_BYTES};})();
const require_common$2=common,require_workbuddy_product_config=productConfig,require_dev_env_override=devEnvironment;
function hasRemoteProductPayload(config) {
	if (!config) return false;
	return Object.entries(config).some(([key, value]) => key !== "mergeStrategy" && hasMeaningfulValue(value));
}
function hasMeaningfulValue(value) {
	if (value === void 0 || value === null) return false;
	if (typeof value === "string") return value.length > 0;
	if (typeof value === "number" || typeof value === "boolean") return true;
	if (Array.isArray(value)) return value.some((item) => hasMeaningfulValue(item));
	if (typeof value === "object") return Object.values(value).some((item) => hasMeaningfulValue(item));
	return false;
}
function hasProductExperimentOverlay(overlay) {
	if (!overlay) return false;
	return Object.keys(overlay).some((key) => overlay[key] !== void 0);
}
function mergeExperimentModel(base, overlay) {
	if (overlay === void 0) return base;
	if (Array.isArray(base) || Array.isArray(overlay)) return overlay;
	if (base && overlay && typeof base === "object" && typeof overlay === "object") {
		const result = { ...base };
		for (const key of Object.keys(overlay)) result[key] = mergeExperimentModel(base[key], overlay[key]);
		return result;
	}
	return overlay;
}
function applyModelsExperimentOverlay(baseModels, overlayModels) {
	if (overlayModels === void 0) return baseModels;
	if (!baseModels?.length) return baseModels;
	const result = [...baseModels];
	for (const overlayModel of overlayModels) {
		const modelIndex = result.findIndex((model) => model.id === overlayModel.id);
		if (modelIndex === -1) continue;
		result[modelIndex] = mergeExperimentModel(result[modelIndex], overlayModel);
	}
	return result;
}
function isTopLevelObjectConfig(value) {
	return !!value && typeof value === "object" && !Array.isArray(value);
}
function applyTopLevelObjectExperimentOverlays(base, overlay) {
	const result = {
		...base,
		...overlay
	};
	for (const key of Object.keys(overlay)) {
		if (key === "models") continue;
		const baseValue = base[key];
		const overlayValue = overlay[key];
		if (isTopLevelObjectConfig(baseValue) && isTopLevelObjectConfig(overlayValue)) result[key] = {
			...baseValue,
			...overlayValue
		};
	}
	return result;
}
function applyProductExperimentOverlay(base, overlay) {
	if (!hasProductExperimentOverlay(overlay)) return base;
	const effectiveOverlay = overlay;
	return {
		...applyTopLevelObjectExperimentOverlays(base, effectiveOverlay),
		models: applyModelsExperimentOverlay(base.models, effectiveOverlay.models)
	};
}
var DEFAULT_REMOTE_CONFIG_PATH = "/v3/config";
var REMOTE_CONFIG_EXCLUDE_FIELDS = [
	"deploymentType",
	"availableModels",
	"defaultRelatedModels",
	"productName",
	"defaultFolderName"
];
function normalizeJsonValue(value) {
	if (Array.isArray(value)) return value.map((item) => normalizeJsonValue(item));
	if (value && typeof value === "object") {
		const maybeJsonValue = value;
		if (typeof maybeJsonValue.toJSON === "function") return normalizeJsonValue(maybeJsonValue.toJSON());
		const source = value;
		const result = {};
		for (const key of Object.keys(source).sort()) {
			const normalized = normalizeJsonValue(source[key]);
			if (normalized !== void 0) result[key] = normalized;
		}
		return result;
	}
	if (typeof value === "undefined" || typeof value === "function" || typeof value === "symbol") return;
	return value;
}
var SENSITIVE_PRODUCT_LOG_KEYS = new Set([
	"authorization",
	"cookie",
	"passwordhash",
	"signature"
]);
var SENSITIVE_PRODUCT_LOG_KEY_SUFFIX = /(?:token|secret|password|passwd|credentials?|apikey|accesskey|secretkey|sessionkey|privatekey|publickey)$/;
function isSensitiveProductLogKey(normalizedKey) {
	return SENSITIVE_PRODUCT_LOG_KEYS.has(normalizedKey) || SENSITIVE_PRODUCT_LOG_KEY_SUFFIX.test(normalizedKey);
}
function normalizeSensitiveProductLogKey(key) {
	return key.toLowerCase().replace(/[_-]/g, "");
}
function isDownloadUrlKey(key) {
	return !!key && normalizeSensitiveProductLogKey(key) === "downloadurl";
}
function tryParseUrl(value) {
	try {
		return new URL(value);
	} catch {
		return;
	}
}
function stripProductLogUrlParams(value) {
	const url = tryParseUrl(value);
	if (!url || !url.search && !url.hash) return value;
	url.search = "";
	url.hash = "";
	return url.toString();
}
function redactProductSnapshotLogValue(key, value) {
	if (!key) return value;
	const normalizedKey = normalizeSensitiveProductLogKey(key);
	if (isSensitiveProductLogKey(normalizedKey)) return "<redacted>";
	if (normalizedKey === "downloadurl" && typeof value === "string") return stripProductLogUrlParams(value);
	return value;
}
function isJsonObject(value) {
	return !!value && typeof value === "object" && !Array.isArray(value);
}
function appendJsonPath(path, key) {
	return /^[A-Za-z_$][\w$]*$/.test(key) ? `${path}.${key}` : `${path}[${JSON.stringify(key)}]`;
}
function collectJsonChangedPaths(previous, next, path = "$", result = []) {
	if (Object.is(previous, next)) return result;
	if (Array.isArray(previous) && Array.isArray(next)) {
		const length = Math.max(previous.length, next.length);
		for (let i = 0; i < length; i += 1) collectJsonChangedPaths(previous[i], next[i], `${path}[${i}]`, result);
		return result;
	}
	if (isJsonObject(previous) && isJsonObject(next)) {
		const keys = new Set([...Object.keys(previous), ...Object.keys(next)]);
		for (const key of [...keys].sort()) collectJsonChangedPaths(previous[key], next[key], appendJsonPath(path, key), result);
		return result;
	}
	result.push(path);
	return result;
}
var VOLATILE_DOWNLOAD_URL_PARAMS = new Set([
	"sign",
	"t",
	"expires",
	"x-cos-security-token"
]);
function isVolatileDownloadUrlParam(name) {
	const normalized = name.toLowerCase();
	return VOLATILE_DOWNLOAD_URL_PARAMS.has(normalized) || normalized.startsWith("q-");
}
function stripSignedDownloadUrl(value) {
	const url = tryParseUrl(value);
	if (!url) return value;
	const volatileParams = [...url.searchParams.keys()].filter(isVolatileDownloadUrlParam);
	if (!volatileParams.length) return value;
	for (const name of volatileParams) url.searchParams.delete(name);
	return url.toString();
}
function normalizeHostedCliRotationValue(key, value) {
	if (isDownloadUrlKey(key) && typeof value === "string") return stripSignedDownloadUrl(value);
	return value;
}
function hostedCliRotationKeyOfNormalized(normalizedSnapshot) {
	return JSON.stringify(normalizedSnapshot, (key, value) => normalizeHostedCliRotationValue(key, value));
}
var WorkbuddyAuthProductCoordinator = class WorkbuddyAuthProductCoordinator {
	logger;
	authenticationManager;
	productManager;
	productMerger;
	cloudProductManager;
	experimentManager;
	lastPublishedEnv;
	/** lastPublishedEnv 的解析形态（同一次发布写入），供变更 diff 免去重复 JSON.parse。 */
	lastPublishedSnapshot;
	syncQueue = Promise.resolve();
	remoteSyncQueue = Promise.resolve();
	remoteProductOverlay;
	lastRemoteRefreshKey;
	lastRemoteRefreshAt = 0;
	lastNotifiedHostedCliSnapshotKey;
	hostedCliProductSnapshotChangeListeners = /* @__PURE__ */ new Set();
	/**
	* 等待当前的远端配置拉取完成。
	* 用于确保 getProductConfiguration RPC 返回的配置已包含远端 overlay。
	*/
	async waitRemoteReady() {
		await this.remoteSyncQueue;
		await this.experimentManager.waitReady();
	}
	getRemoteProductFeatures() {
		return this.remoteProductOverlay?.productFeatures;
	}
	init() {
		this.logger.setContext("WorkbuddyAuthProductCoordinator");
		this.authenticationManager.currentSessionSubject.subscribe((session) => {
			if (!session) {
				this.lastRemoteRefreshKey = void 0;
				this.lastRemoteRefreshAt = 0;
				this.cloudProductManager.reset();
				this.runInBackground(this.clearRemoteProductOverlay(), "clear remote product overlay after logout");
				this.runInBackground(this.publishResolvedSnapshot(void 0, this.productManager.getLocalConfiguration(), "auth-logout"), "publish resolved snapshot after logout");
				this.runInBackground(this.experimentManager.clear("logout"), "clear experiment product overlay after logout");
			}
		});
		this.productManager.configuration.subscribe(() => {
			const session = this.authenticationManager.currentSessionSubject.getValue();
			const localProduct = this.productManager.getLocalConfiguration();
			this.runInBackground(this.publishResolvedSnapshot(session, localProduct, "local-product-change"), "publish resolved snapshot after local product change");
		});
	}
	async publishResolvedSnapshot(session, product, source = "unspecified") {
		const effectiveSession = session ?? this.authenticationManager.currentSessionSubject.getValue();
		const resolvedSnapshot = require_workbuddy_product_config.buildWorkbuddyResolvedProductConfiguration({
			product: applyProductExperimentOverlay(await this.getResolvedSourceProduct(product) ?? {}, this.experimentManager.getOverlay()),
			session: effectiveSession,
			remoteHasModels: !!this.remoteProductOverlay?.models?.length
		});
		if (require_dev_env_override.resolveEndpointOverride()) this.logger.info(`[DevEnvOverride] Active — endpoint=${resolvedSnapshot.endpoint}`);
		const networkEnvironment = resolvedSnapshot.networkEnvironment;
		if (networkEnvironment) process.env[require_common$2.ENV_KEY_CODEBUDDY_COPILOT_INTERNET_ENVIRONMENT] = networkEnvironment;
		else delete process.env[require_common$2.ENV_KEY_CODEBUDDY_COPILOT_INTERNET_ENVIRONMENT];
		const normalizedSnapshot = normalizeJsonValue(resolvedSnapshot);
		const envValue = JSON.stringify(normalizedSnapshot);
		if (envValue === this.lastPublishedEnv) return;
		require_workbuddy_product_config.assignAccProductConfigV3ToProcessEnv(envValue);
		const hostedCliSnapshotKey = hostedCliRotationKeyOfNormalized(normalizedSnapshot);
		const hostedCliRotationChanged = hostedCliSnapshotKey !== this.lastNotifiedHostedCliSnapshotKey;
		this.logResolvedSnapshotChange(source, this.lastPublishedSnapshot, normalizedSnapshot, hostedCliRotationChanged);
		this.lastPublishedEnv = envValue;
		this.lastPublishedSnapshot = normalizedSnapshot;
		this.logger.info(`Published resolved workbuddy product snapshot to ACC_PRODUCT_CONFIG_V3 (source=${source})`);
		if (!hostedCliRotationChanged) {
			this.logger.info(`Skipped hosted CLI product snapshot notification because rotation key is unchanged (source=${source})`);
			return;
		}
		this.lastNotifiedHostedCliSnapshotKey = hostedCliSnapshotKey;
		this.notifyHostedCliProductSnapshotChanged({ envValue }, hostedCliSnapshotKey);
	}
	logResolvedSnapshotChange(source, previousSnapshot, nextSnapshot, hostedCliRotationChanged) {
		const changedPaths = collectJsonChangedPaths(previousSnapshot, nextSnapshot);
		const snapshotForLog = hostedCliRotationChanged ? `, snapshot=${JSON.stringify(nextSnapshot, (key, value) => redactProductSnapshotLogValue(key, value))}` : "";
		this.logger.info(`[ResolvedProductSnapshot] source=${source}, hostedCliRotationChanged=${hostedCliRotationChanged}, changedPaths=${JSON.stringify(changedPaths)}${snapshotForLog}`);
	}
	onHostedCliProductSnapshotChanged(listener) {
		this.hostedCliProductSnapshotChangeListeners.add(listener);
		return { dispose: () => {
			this.hostedCliProductSnapshotChangeListeners.delete(listener);
		} };
	}
	resolveEnvironment(session, product) {
		return require_workbuddy_product_config.resolveWorkbuddyProductEnvironmentFromSession(session, product);
	}
	getResolvedSnapshot(product, session) {
		return require_workbuddy_product_config.buildWorkbuddyResolvedProductConfiguration({
			product,
			session
		});
	}
	async syncResolvedProduct(session) {
		this.syncQueue = this.syncQueue.catch((error) => {
			this.logger.warn(`Previous resolved product sync failed: ${error}`);
		}).then(async () => {
			if (session && this.isSameIdentityWithFreshRemote(session)) return;
			await this.productManager.sync(true);
			if (!session) {
				this.lastRemoteRefreshKey = void 0;
				this.lastRemoteRefreshAt = 0;
				await this.clearRemoteProductOverlay();
				await this.experimentManager.clear("no-session");
				await this.publishResolvedSnapshot(void 0, this.productManager.getLocalConfiguration(), "sync-resolved-product:no-session");
				return;
			}
			await this.publishResolvedSnapshot(session, this.productManager.getLocalConfiguration(), "sync-resolved-product:local-before-remote");
			await this.refreshRemoteProductIfNeeded(session, this.productManager.getLocalConfiguration(), { force: true });
			await this.refreshExperimentProduct(session, this.productManager.getLocalConfiguration());
		});
		return this.syncQueue;
	}
	isSameIdentityWithFreshRemote(session) {
		const localProduct = this.productManager.getLocalConfiguration();
		if (!localProduct) return false;
		const refreshKey = this.getRemoteRefreshKey(session, localProduct);
		return !!refreshKey && refreshKey === this.lastRemoteRefreshKey && Date.now() - this.lastRemoteRefreshAt < 48e4;
	}
	async refreshExperimentProduct(session, localProduct) {
		const gateProduct = require_workbuddy_product_config.buildWorkbuddyResolvedProductConfiguration({
			product: await this.getResolvedSourceProduct(localProduct),
			session,
			remoteHasModels: !!this.remoteProductOverlay?.models?.length
		});
		await this.experimentManager.refresh(gateProduct, session, { force: true });
		await this.publishResolvedSnapshot(session, localProduct, "experiment-refresh");
	}
	async getResolvedSourceProduct(product) {
		if (!product) return this.remoteProductOverlay;
		if (!this.remoteProductOverlay) return product;
		return this.productMerger.merge(product, this.remoteProductOverlay);
	}
	/**
	* 按产品配置 8 分钟 TTL 刷新远端 overlay。
	*
	* `getProductConfiguration()` 读取 resolved product 前会触发 stale refresh，
	* 避免长期复用过期 overlay。
	*/
	async refreshRemoteProduct(options, session) {
		const currentSession = session ?? this.authenticationManager.currentSessionSubject.getValue();
		if (!currentSession) return;
		await this.productManager.waitConfiguration(true);
		await this.refreshRemoteProductIfNeeded(currentSession, this.productManager.getLocalConfiguration(), { force: options?.force });
	}
	async refreshRemoteProductIfStale(session) {
		return this.refreshRemoteProduct(void 0, session);
	}
	async refreshRemoteProductIfNeeded(session, product, options) {
		if (!session) return;
		const localProduct = product ?? this.productManager.getLocalConfiguration();
		if (!localProduct) return;
		const refreshKey = this.getRemoteRefreshKey(session, localProduct);
		if (!refreshKey) {
			this.lastRemoteRefreshAt = 0;
			await this.clearRemoteProductOverlay();
			await this.publishResolvedSnapshot(session, localProduct, "remote-refresh:no-key");
			return;
		}
		const isSameRefreshKey = refreshKey === this.lastRemoteRefreshKey;
		const isRemoteFresh = Date.now() - this.lastRemoteRefreshAt < require_common$2.PRODUCT_CONFIGURATION_CACHE_TIMEOUT;
		if (!options?.force && isSameRefreshKey && isRemoteFresh) return;
		const shouldPreserveOverlayOnFailure = this.lastRemoteRefreshKey === refreshKey;
		this.lastRemoteRefreshKey = refreshKey;
		this.remoteSyncQueue = this.remoteSyncQueue.catch((error) => {
			this.logger.warn(`Previous remote product refresh failed: ${error}`);
		}).then(async () => {
			if (!shouldPreserveOverlayOnFailure) {
				await this.clearRemoteProductOverlay();
				await this.publishResolvedSnapshot(session, localProduct, "remote-refresh:key-change-clear-overlay");
			}
			const remoteOverlay = await this.fetchRemoteProductOverlay(localProduct, session);
			if (remoteOverlay === void 0) return;
			this.remoteProductOverlay = remoteOverlay;
			this.lastRemoteRefreshAt = Date.now();
			await this.productManager.setResolvedOverlay(remoteOverlay);
			await this.publishResolvedSnapshot(session, localProduct, "remote-refresh:success");
		});
		return this.remoteSyncQueue;
	}
	async clearRemoteProductOverlay() {
		if (!this.remoteProductOverlay) return;
		this.remoteProductOverlay = void 0;
		await this.productManager.setResolvedOverlay(void 0);
	}
	getRemoteRefreshKey(session, product) {
		if (product.config?.disabled) return;
		if (!product.endpoint && !product.config?.url) return;
		return [
			session.account?.uid ?? "",
			session.account?.type ?? "",
			session.account?.enterpriseId ?? "",
			session.account?.oneidAccountId ?? "",
			session.account?.idp ?? "",
			product.endpoint ?? "",
			product.config?.url ?? DEFAULT_REMOTE_CONFIG_PATH,
			product.networkEnvironment ?? "",
			session.auth?.domain ?? ""
		].join("|");
	}
	async fetchRemoteProductOverlay(product, session) {
		const configUrl = product.config?.url ?? DEFAULT_REMOTE_CONFIG_PATH;
		const endpoint = this.productManager.getEndpoint();
		const xProduct = this.productManager.getCurrentConfiguration()?.deploymentType ?? this.productManager.configuration.getValue()?.deploymentType ?? "SaaS";
		const startedAt = Date.now();
		this.logger.info(`[RemoteConfig] Fetch start: configUrl=${configUrl}, endpoint=${endpoint || "undefined"}, xProduct=${xProduct}, domain=${session?.auth?.domain || "undefined"}, networkEnvironment=${product.networkEnvironment || "undefined"}`);
		try {
			const remoteProduct = await this.cloudProductManager.fetch(configUrl);
			const sanitized = this.omitRemoteExcludedFields(remoteProduct);
			if (!hasRemoteProductPayload(sanitized)) {
				this.logger.warn(`[RemoteConfig] Fetch returned empty/invalid config in ${Date.now() - startedAt}ms, preserving previous overlay`);
				return;
			}
			const remoteCommandsSmartMerge = remoteProduct.productFeatures?.CommandsSmartMerge;
			const localCommandsSmartMerge = product.productFeatures?.CommandsSmartMerge;
			const useCommandsSmartMerge = (remoteCommandsSmartMerge ?? localCommandsSmartMerge) === true;
			const mergeStrategy = useCommandsSmartMerge ? require_common$2.MergeStrategy.CommandsSmartMerge : require_common$2.MergeStrategy.Merge;
			const remoteModelsCount = remoteProduct.models?.length ?? 0;
			const remoteAgentsCount = remoteProduct.agents?.length ?? 0;
			const localModelsCount = product.models?.length ?? 0;
			const localAgentsCount = product.agents?.length ?? 0;
			this.logger.info(`[RemoteConfig] Fetch success in ${Date.now() - startedAt}ms: keys=${Object.keys(remoteProduct ?? {}).join(",") || "(empty)"}, remoteModels=${remoteModelsCount}, localModels=${localModelsCount}, remoteAgents=${remoteAgentsCount}, localAgents=${localAgentsCount}, mergeStrategy=${useCommandsSmartMerge ? "CommandsSmartMerge" : "Merge"}`);
			if (!!product.productFeatures?.[require_common$2.ProductFeature.CloudAgentsSmartMerge] && !!sanitized.agents && !!product.agents) {
				const beforeCount = sanitized.agents.length;
				sanitized.agents = this.smartMergeAgents(product.agents, sanitized.agents);
				const cliAgent = sanitized.agents.find((a) => a.name === "cli");
				this.logger.info(`[RemoteConfig] Agents SmartMerge: local=${localAgentsCount}, remote=${beforeCount}, merged=${sanitized.agents.length}` + (cliAgent ? `, cli.models=${JSON.stringify(cliAgent.models)}` : ""));
			}
			return {
				...sanitized,
				mergeStrategy
			};
		} catch (error) {
			this.logger.warn(`[RemoteConfig] Fetch failed in ${Date.now() - startedAt}ms: configUrl=${configUrl}, endpoint=${endpoint || "undefined"}, xProduct=${xProduct}, domain=${session?.auth?.domain || "undefined"}, error=${error}`);
			return;
		}
	}
	omitRemoteExcludedFields(config) {
		if (!config) return config;
		const sanitized = { ...config };
		delete sanitized.endpoint;
		delete sanitized.stagingEndpoint;
		for (const field of REMOTE_CONFIG_EXCLUDE_FIELDS) Reflect.deleteProperty(sanitized, field);
		return sanitized;
	}
	runInBackground(task, label) {
		task.catch((error) => {
			this.logger.warn(`Failed to ${label}: ${error}`);
		});
	}
	notifyHostedCliProductSnapshotChanged(event, notifiedKey) {
		for (const listener of this.hostedCliProductSnapshotChangeListeners) this.runInBackground(Promise.resolve(listener(event)).then(() => void 0).catch((error) => {
			if (this.lastNotifiedHostedCliSnapshotKey === notifiedKey) this.lastNotifiedHostedCliSnapshotKey = void 0;
			throw error;
		}), "handle hosted CLI product snapshot change");
	}
	/**
	* 按 name 对 agents 做 SmartMerge：
	* - 远端有、本地也有 → 以本地为基底，本地缺失的字段从云端补充，models 强制使用远端的
	* - 远端有、本地没有 → 追加
	* - 本地有、远端没有 → 保留
	*/
	smartMergeAgents(localAgents, remoteAgents) {
		const result = localAgents.map((agent) => ({ ...agent }));
		for (const remoteAgent of remoteAgents) {
			const idx = result.findIndex((a) => a.name === remoteAgent.name);
			if (idx >= 0) {
				const merged = {
					...remoteAgent,
					...result[idx]
				};
				if (remoteAgent.models !== void 0) merged.models = remoteAgent.models;
				result[idx] = merged;
			} else result.push(remoteAgent);
		}
		return result;
	}
};
return {hasRemoteProductPayload,hasMeaningfulValue,hasProductExperimentOverlay,mergeExperimentModel,applyModelsExperimentOverlay,isTopLevelObjectConfig,applyTopLevelObjectExperimentOverlays,applyProductExperimentOverlay,DEFAULT_REMOTE_CONFIG_PATH,REMOTE_CONFIG_EXCLUDE_FIELDS,normalizeJsonValue,SENSITIVE_PRODUCT_LOG_KEYS,SENSITIVE_PRODUCT_LOG_KEY_SUFFIX,isSensitiveProductLogKey,normalizeSensitiveProductLogKey,isDownloadUrlKey,tryParseUrl,stripProductLogUrlParams,redactProductSnapshotLogValue,isJsonObject,appendJsonPath,collectJsonChangedPaths,VOLATILE_DOWNLOAD_URL_PARAMS,isVolatileDownloadUrlParam,stripSignedDownloadUrl,normalizeHostedCliRotationValue,hostedCliRotationKeyOfNormalized,WorkbuddyAuthProductCoordinator,productConfig,devEnvironment,common};
}

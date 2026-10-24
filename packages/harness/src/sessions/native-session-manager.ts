// @ts-nocheck
// Complete original Desktop SessionManager and its lexical dependency closure.
import * as node_fs from 'node:fs';
import * as node_path from 'node:path';
import * as nodeOs from 'node:os';
import * as node_crypto from 'node:crypto';
export const SESSION_MANAGER_SOURCE=[{"file":"workbuddy-auth-product-coordinator.js","sha256":"8624215504229c4b6190f5c2172da270e015cc96871e90b261786f047e4c6e78","regions":[{"from":1060268,"to":1060870},{"from":1060871,"to":1060943},{"from":1060944,"to":1061310},{"from":1061311,"to":1061450},{"from":1061586,"to":1061745},{"from":1061746,"to":1061907},{"from":1062959,"to":1063019},{"from":1063287,"to":1063403},{"from":1063404,"to":1063535},{"from":1063536,"to":1063612},{"from":1063613,"to":1063697},{"from":1063698,"to":1063849},{"from":1064333,"to":1064522},{"from":1064523,"to":1064679},{"from":1064680,"to":1064878},{"from":1064879,"to":1065046},{"from":1065047,"to":1065178},{"from":1065179,"to":1065334},{"from":1065335,"to":1065461},{"from":1065462,"to":1066601},{"from":1066602,"to":1067738},{"from":1068202,"to":1068635},{"from":1068636,"to":1069829},{"from":1069830,"to":1069934},{"from":1069935,"to":1070005},{"from":1930742,"to":1930783},{"from":1930894,"to":1931344},{"from":1931345,"to":1931460},{"from":1931461,"to":1931552},{"from":1932250,"to":1932408}],"names":["CRAFT_TOOLS","PLAN_TOOLS","MODE_TOOLS_CONFIG","resolveModeTools","SESSION_SANDBOX_DISABLED_REASONS","normalizeSessionSandboxDisabledReason","SESSION_WELCOME_MODES","isSessionWelcomeMode","DEFAULT_MODE_PERMISSION_CONFIG","cloneDesiredConfig","cloneResolvedRuntimeConfig","normalizeSceneMode","normalizeWelcomeMode","toLegacySourceMode","normalizePermissionMode","normalizeNonPlanPermissionMode","normalizeRuntimeIdentity","normalizeSessionSettings","normalizeStringArray","normalizeAddonSelection","normalizeDesiredConfig","buildSessionRestartFingerprint","buildFallbackRuntimeConfig","resolveDefaultPermissionMode","resolveDefaultTools","policies","deriveSessionDeferredBuiltinPolicy","registerSessionDeferredBuiltinPolicy","unregisterSessionDeferredBuiltinPolicy","clonePolicy"]},{"file":"initialize.js","sha256":"528d3bffc67c5244d1a641e0cfc13c2be4ef7943c248b390125b76d70880ed19","regions":[{"from":226014,"to":226116},{"from":226722,"to":226886},{"from":226887,"to":227059},{"from":227060,"to":227399},{"from":227400,"to":228084},{"from":228085,"to":228421},{"from":228422,"to":228720},{"from":228721,"to":229620},{"from":3515180,"to":3515377},{"from":3515378,"to":3516028},{"from":3516029,"to":3516170},{"from":3516789,"to":3516959},{"from":3516960,"to":3519138},{"from":3519139,"to":3520032},{"from":3520033,"to":3521653},{"from":3521654,"to":3523008},{"from":4540160,"to":4540216},{"from":4540512,"to":4540724},{"from":4541207,"to":4541404},{"from":4542308,"to":4543431},{"from":4543513,"to":4543694},{"from":4543695,"to":4544168},{"from":4544169,"to":4544591},{"from":4544592,"to":4544739},{"from":4544740,"to":4545360},{"from":4545481,"to":4546002},{"from":4546122,"to":4546389},{"from":4546390,"to":4546686},{"from":4546687,"to":4547192},{"from":4547304,"to":4547362},{"from":4547363,"to":4547483},{"from":4547484,"to":4547651},{"from":4547652,"to":4547700},{"from":4547701,"to":4547743},{"from":4547744,"to":4547846},{"from":4547847,"to":4548123},{"from":4548124,"to":4548445},{"from":4548446,"to":4549881},{"from":4549989,"to":4550259},{"from":4550260,"to":4551762},{"from":4551873,"to":4551929},{"from":4551930,"to":4552031},{"from":4552032,"to":4552148},{"from":4552149,"to":4552708},{"from":4552709,"to":4552936},{"from":4552937,"to":4553071},{"from":4553072,"to":4553561},{"from":4553562,"to":4553698},{"from":4553699,"to":4554002},{"from":4554003,"to":4555343},{"from":4555344,"to":4555763},{"from":4555874,"to":4556039},{"from":4556040,"to":4556388},{"from":4556389,"to":4556699},{"from":4556700,"to":4557016},{"from":4557017,"to":4557284},{"from":4557285,"to":4560157},{"from":4560268,"to":4560394},{"from":4560395,"to":4560496},{"from":4560497,"to":4560931},{"from":4560932,"to":4561043},{"from":4561044,"to":4561617},{"from":4561709,"to":4561745},{"from":4561746,"to":4561786},{"from":4561787,"to":4561831},{"from":4561832,"to":4561857},{"from":4561858,"to":4561886},{"from":4562101,"to":4565520},{"from":4565761,"to":4566144},{"from":4566238,"to":4566339},{"from":4566340,"to":4566473},{"from":4566474,"to":4567415},{"from":4567416,"to":4568022},{"from":4568023,"to":4568691},{"from":4569188,"to":4569651},{"from":4569966,"to":4570523},{"from":4570610,"to":4570738},{"from":4570739,"to":4571011},{"from":4571012,"to":4571389},{"from":4571390,"to":4571517},{"from":4572371,"to":4572818},{"from":4572819,"to":4573213},{"from":4573214,"to":4573399},{"from":4573400,"to":4573639},{"from":4573640,"to":4573870},{"from":4573871,"to":4573996},{"from":4573997,"to":4574164},{"from":4574165,"to":4574650},{"from":4574651,"to":4574769},{"from":4574770,"to":4782941},{"from":4782942,"to":4783017},{"from":4783018,"to":4783126},{"from":4783127,"to":4783490},{"from":4783491,"to":4783647},{"from":4783648,"to":4783754},{"from":4783755,"to":4784407},{"from":4784408,"to":4784702},{"from":4784703,"to":4785005},{"from":4785006,"to":4785304},{"from":4785305,"to":4785455},{"from":4785456,"to":4785600},{"from":4785601,"to":4785820},{"from":4785821,"to":4785921},{"from":4785922,"to":4786268},{"from":4786269,"to":4786445},{"from":4786446,"to":4787745},{"from":4787746,"to":4788897},{"from":4789215,"to":4789550},{"from":4789551,"to":4789921},{"from":4789922,"to":4790102},{"from":4790103,"to":4790593},{"from":4790594,"to":4790910},{"from":4790911,"to":4791222},{"from":4791223,"to":4791442},{"from":4791443,"to":4791856},{"from":4791857,"to":4792086},{"from":4792087,"to":4792612},{"from":4792613,"to":4793081},{"from":4793082,"to":4793179},{"from":4793180,"to":4793417},{"from":4793418,"to":4793550},{"from":4793551,"to":4793687},{"from":4793688,"to":4794050},{"from":4794051,"to":4794566},{"from":4794567,"to":4795035},{"from":4795036,"to":4795868},{"from":4795869,"to":4795982},{"from":4795983,"to":4796145},{"from":4796181,"to":4796284},{"from":4796285,"to":4796436},{"from":4796437,"to":4796869},{"from":4796870,"to":4797151},{"from":4797152,"to":4797716},{"from":4797717,"to":4798062},{"from":4798063,"to":4798261},{"from":4798262,"to":4799102},{"from":4799103,"to":4799368},{"from":4799369,"to":4799918},{"from":4799919,"to":4801109},{"from":4801266,"to":4801469},{"from":4801470,"to":4801685},{"from":4801686,"to":4801870},{"from":4801871,"to":4802273},{"from":4802274,"to":4802407},{"from":4802408,"to":4803003},{"from":4803004,"to":4803110},{"from":4803506,"to":4804558}],"names":["isRecord$14","normalizeString$4","normalizeStringArray$2","normalizeEnabledPlugins","normalizeMarketplaceConfig","normalizeMarketplaces","createEmptySessionPluginContext","normalizeSessionPluginContext","createInitialTaskState","deriveTaskStatus","isTaskTerminal","isTerminalTaskStatus","reduceTaskStatus","normalizeTaskStatus","applyManualTaskStatus","restoreTaskStateFromStoredStatus","SESSION_CWD_UNAVAILABLE","SessionCwdUnavailableError","classifyErrno","assertSessionCwdUsable","formatLogDetailsSuffix","safeStringifyLogDetails","serializeLogErrorForDetails","serializeLogErrorCauseForDetails","sanitizeLogDetailValue","createMicroScenePack","skillItem","mcpItem","createUserProjectResourcePack","WORKBUDDY_BUILTIN_MARKETPLACE$1","WELCOME_MODE_PLUGIN_NAMES","INTERACTION_MODE_PLUGIN_NAMES","PROMPT_COMMON_PLUGIN_NAME","NETDRIVE_MCP_SERVER_NAME","toBuiltinPluginId","pluginItem$1","mcpDependencyItem","resolveWorkModePack","resolveInteractionModeForPrompt","resolveAddonPacks","WORKBUDDY_BUILTIN_MARKETPLACE","WORKBUDDY_WORK_MODE_PLUGIN_PREFIXES","readRecord","mergeEnabledPlugins","buildAddonComposeRestartFingerprint","parseToolNames","readSessionSettingsSummary","compactUnique","isWorkbuddyWorkModePluginId","expandSessionRuntimeConfig","applySessionAddonExpansionToRuntimeConfig","makeEmptyAddons","addonBucketForType","pushAddon","inferPluginSource","pluginItem","composeSessionAddons","summarizeText","sha256","stableJsonStringify$2","buildManifestHash","buildSessionAddonManifest","DEFAULT_CHECK_INTERVAL_MS","DEFAULT_TIMEOUT_THRESHOLD_MS","DEFAULT_AWAITING_INPUT_TIMEOUT_MS","MAX_LOG_ENTRIES","REPORTED_LOG_SLICE","NoResponseWatchdog","appendStateTransitionEntry","isRecord$4","filterDerivedPluginIds","projectSessionPluginContext","buildAddonSelectionFromPluginContext","buildSessionSettingsFromPluginContext","tryParseAcpUsageUpdate","tryParseAcpUsageByCategory","readCodebuddyMeta","createPluginRecommendationContinuationBarrier","readSessionSourceMode","readIsBackgroundAutomation","resolveDefaultCwdOrThrow","normalizeCwdPath","readProjectId","readSessionOwnerUserId","isCancelledStopReason","isFailedPromptStopReason","formatDiagnosticDetails","withPersistedSessionMeta","SESSION_RUNTIME_RECLAIM_POLICY","SessionManager","cloneSessionPayload","isRecord$3","stableJsonStringify$1","normalizeBackendPermissionMode$2","getRuntimeRestartIdentity","isSameSessionRuntimeConfig","resolveRuntimeReclaimIdleTimeoutMs","resolveRuntimeReclaimMaxActiveSessions","resolveRuntimeReclaimSweepIntervalMs","isHardTerminalExportStatus","isModelOnlyPatch","isUseSandboxOnlyPatch","hasOwn","hasExplicitPluginContextInput","hasExplicitWelcomeModeInput","restoreStoredPluginContext","syncAddonSelectionWithDesiredConfig","deriveToolsFromDisabled","getOwnerHistoryUserMessageId","isSyntheticOwnerHistoryEvent","getTeamMemberEventName","getOwnerHistoryInterruptionResolutionKey","getOwnerHistoryInterruptionRequestKey","isOwnerInputRequestPayload","getOwnerHistoryOffset","getOwnerHistoryMode","getHistoryReplayPhase","normalizeOwnerHistoryReplayPayload","sessionHasPriorUserMessages","toExpertSelectionIdentity","toPersistedExpertSelectionState","fromPersistedExpertSelectionState","extractTextFromContentBlocks","isCompactInternalEventPayload","isSessionSeparatorEventPayload","extractTeamUpdate","normalizeTeamMemberStatus","isActiveTeamMemberStatus","isActiveToolResultStatus","isTerminalToolCallStatus","deriveTerminalExportStatus","summarizePromptForLog","summarizePromptMetaForLog","summarizeTaskStateForLog","shouldEmitSyntheticPromptFailureStateUpdate","createPromptFailureStateUpdate","derivePromptFailureRuntimeState","extractPromptFailureRequestId","extractPromptFailureTraceId","isCompactFailedError","extractPromptFailureCode","extractPromptFailureData","serializeErrorForLog","serializeErrorCauseForLog","sanitizeLogValue","pickStringMeta","normalizeQueueForRestart"]}] as const;
export function createNativeSessionManager(runtime:any={}):any {
const console=runtime.console??globalThis.console;
const node_os=runtime.os??nodeOs;
const require_workbuddy_auth_product_coordinator=(()=>{
var CRAFT_TOOLS = [
	"Read",
	"Write",
	"Edit",
	"MultiEdit",
	"Glob",
	"Grep",
	"Bash",
	"PowerShell",
	"TaskCreate",
	"TaskGet",
	"TaskUpdate",
	"TaskList",
	"TaskStop",
	"TaskOutput",
	"WebFetch",
	"WebSearch",
	"Skill",
	"SkillManage",
	"AskUserQuestion",
	"Defer(LSP)",
	"Defer(ImageGen)",
	"Defer(VideoGen)",
	"Agent",
	"Defer(TeamCreate)",
	"Defer(TeamDelete)",
	"SendMessage",
	"ToolSearch",
	"DeferExecuteTool",
	"read_me",
	"show_widget",
	"present_files",
	"automation_update",
	"Defer(conversation_search)",
	"Defer(workbuddy_cloudstudio_deploy)",
	"ListMcpResources",
	"ReadMcpResource"
];
var PLAN_TOOLS = [
	...CRAFT_TOOLS,
	"EnterPlanMode",
	"ExitPlanMode"
];
var MODE_TOOLS_CONFIG = {
	craft: CRAFT_TOOLS.join(","),
	ask: [
		"Read",
		"AskUserQuestion",
		"WebFetch",
		"WebSearch",
		"Glob",
		"Grep",
		"read_me",
		"show_widget",
		"present_files",
		"automation_update",
		"Defer(conversation_search)",
		"ListMcpResources",
		"ReadMcpResource"
	].join(","),
	plan: PLAN_TOOLS.join(","),
	expert: PLAN_TOOLS.join(",")
};
function resolveModeTools(mode) {
	if (!mode) return MODE_TOOLS_CONFIG.craft;
	return MODE_TOOLS_CONFIG[mode] ?? MODE_TOOLS_CONFIG.craft;
}
var SESSION_SANDBOX_DISABLED_REASONS = [
	"security-center-setting-disabled",
	"session-local-environment-selected",
	"background-automation-no-approval-ui"
];
function normalizeSessionSandboxDisabledReason(value) {
	return typeof value === "string" && SESSION_SANDBOX_DISABLED_REASONS.includes(value) ? value : void 0;
}
var SESSION_WELCOME_MODES = [
	"code",
	"work",
	"design"
];
function isSessionWelcomeMode(value) {
	return typeof value === "string" && SESSION_WELCOME_MODES.includes(value);
}
var DEFAULT_MODE_PERMISSION_CONFIG = {
	craft: "bypassPermissions",
	ask: "default",
	plan: "plan",
	expert: "bypassPermissions"
};
function cloneDesiredConfig(config) {
	return config ? { ...config } : {};
}
function cloneResolvedRuntimeConfig(config) {
	return config ? { ...config } : {};
}
function normalizeSceneMode(mode) {
	switch (mode) {
		case "craft":
		case "ask":
		case "plan":
		case "expert": return mode;
		default: return;
	}
}
function normalizeWelcomeMode(mode) {
	if (isSessionWelcomeMode(mode)) return mode;
	switch (mode) {
		case "coding": return "code";
		case "working": return "work";
		default: return;
	}
}
function toLegacySourceMode(mode) {
	switch (mode) {
		case "code": return "coding";
		case "work": return "working";
		case "design": return "design";
	}
}
function normalizePermissionMode(mode) {
	switch (mode) {
		case "acceptEdits":
		case "bypassPermissions":
		case "fullAccess":
		case "default":
		case "plan": return mode;
		default: return;
	}
}
function normalizeNonPlanPermissionMode(mode) {
	const normalized = normalizePermissionMode(mode);
	return normalized && normalized !== "plan" ? normalized : void 0;
}
function normalizeRuntimeIdentity(identity) {
	return typeof identity === "string" && identity.trim() !== "" ? identity : void 0;
}
function normalizeSessionSettings(settings) {
	if (!settings || typeof settings !== "object" || Array.isArray(settings)) return;
	return { ...settings };
}
function normalizeStringArray(value) {
	return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
}
function normalizeAddonSelection(selection) {
	if (!selection || typeof selection !== "object" || Array.isArray(selection)) return;
	const input = selection;
	if (input.version !== 1 || typeof input.interactionMode !== "string") return;
	const projectResources = input.projectResources && typeof input.projectResources === "object" ? input.projectResources : void 0;
	const welcomeMode = normalizeWelcomeMode(input.welcomeMode);
	return {
		version: 1,
		...welcomeMode ? { welcomeMode } : {},
		interactionMode: input.interactionMode,
		microSceneIds: normalizeStringArray(input.microSceneIds),
		enabledPluginIds: normalizeStringArray(input.enabledPluginIds),
		promptContentBlockCount: typeof input.promptContentBlockCount === "number" ? input.promptContentBlockCount : 0,
		resourceLinkCount: typeof input.resourceLinkCount === "number" ? input.resourceLinkCount : 0,
		projectResources: {
			connectorSkillIds: normalizeStringArray(projectResources?.connectorSkillIds),
			mcpServerNames: normalizeStringArray(projectResources?.mcpServerNames),
			projectSkillNames: normalizeStringArray(projectResources?.projectSkillNames)
		}
	};
}
function normalizeDesiredConfig(config) {
	const rawPermissionMode = normalizePermissionMode(config.permissionMode);
	const normalizedPermissionMode = config.mode === "plan" ? "plan" : rawPermissionMode === "plan" ? normalizeNonPlanPermissionMode(config.permissionModeBeforePlan) ?? "bypassPermissions" : rawPermissionMode;
	return {
		mode: normalizeSceneMode(config.mode),
		expertId: config.expertId,
		expertMarketplace: config.expertMarketplace,
		locale: config.locale,
		runtimeIdentity: normalizeRuntimeIdentity(config.runtimeIdentity),
		model: config.model,
		systemPrompt: config.systemPrompt,
		tools: config.tools,
		permissionMode: normalizedPermissionMode,
		permissionModeBeforePlan: normalizeNonPlanPermissionMode(config.permissionModeBeforePlan),
		useSandboxCLI: config.useSandboxCLI,
		sandboxDisabledReason: config.useSandboxCLI === false ? normalizeSessionSandboxDisabledReason(config.sandboxDisabledReason) : void 0,
		welcomeMode: normalizeWelcomeMode(config.welcomeMode),
		sessionSettings: normalizeSessionSettings(config.sessionSettings),
		addonSelection: normalizeAddonSelection(config.addonSelection)
	};
}
function buildSessionRestartFingerprint(input) {
	return JSON.stringify({
		v: 1,
		mode: input.mode,
		expertId: input.expertId,
		expertMarketplace: input.expertMarketplace,
		locale: input.locale,
		runtimeIdentity: input.runtimeIdentity,
		explicitSystemPrompt: input.explicitSystemPrompt,
		tools: input.tools,
		welcomeMode: input.welcomeMode,
		cwd: input.cwd,
		permissionModeBeforePlan: input.permissionModeBeforePlan
	});
}
function buildFallbackRuntimeConfig(desiredConfig) {
	const runtimeIdentity = normalizeRuntimeIdentity(desiredConfig.runtimeIdentity);
	const tools = desiredConfig.tools ?? resolveDefaultTools(desiredConfig.mode);
	return {
		model: desiredConfig.model,
		systemPrompt: desiredConfig.systemPrompt,
		restartFingerprint: buildSessionRestartFingerprint({
			mode: desiredConfig.mode ?? "craft",
			expertId: desiredConfig.expertId,
			expertMarketplace: desiredConfig.expertMarketplace,
			locale: desiredConfig.locale,
			runtimeIdentity,
			explicitSystemPrompt: desiredConfig.systemPrompt,
			tools,
			welcomeMode: desiredConfig.welcomeMode,
			cwd: void 0,
			permissionModeBeforePlan: desiredConfig.permissionModeBeforePlan
		}),
		tools,
		permissionMode: desiredConfig.permissionMode ?? resolveDefaultPermissionMode(desiredConfig.mode),
		...desiredConfig.permissionModeBeforePlan ? { permissionModeBeforePlan: desiredConfig.permissionModeBeforePlan } : {},
		...runtimeIdentity ? { runtimeIdentity } : {},
		...desiredConfig.welcomeMode ? { welcomeMode: desiredConfig.welcomeMode } : {},
		...desiredConfig.sessionSettings ? { sessionSettings: desiredConfig.sessionSettings } : {}
	};
}
function resolveDefaultPermissionMode(mode) {
	return DEFAULT_MODE_PERMISSION_CONFIG[mode ?? "craft"];
}
function resolveDefaultTools(mode) {
	return resolveModeTools(mode);
}
var policies = /* @__PURE__ */ new Map();
function deriveSessionDeferredBuiltinPolicy(tools) {
	const specs = tools.split(",").map((value) => value.trim()).filter(Boolean);
	if (specs.includes("ToolSearch")) return { scope: "all" };
	const allowedTools = /* @__PURE__ */ new Set();
	for (const spec of specs) {
		const toolName = /^Defer\(\s*([^)]+?)\s*\)$/.exec(spec)?.[1]?.trim();
		if (toolName) allowedTools.add(toolName);
	}
	return {
		scope: "explicit-defer-only",
		allowedTools
	};
}
function registerSessionDeferredBuiltinPolicy(sessionId, policy) {
	policies.set(sessionId, clonePolicy(policy));
}
function unregisterSessionDeferredBuiltinPolicy(sessionId) {
	policies.delete(sessionId);
}
function clonePolicy(policy) {
	if (policy.scope === "all") return policy;
	return {
		scope: policy.scope,
		allowedTools: new Set(policy.allowedTools)
	};
}
return {CRAFT_TOOLS,PLAN_TOOLS,MODE_TOOLS_CONFIG,resolveModeTools,SESSION_SANDBOX_DISABLED_REASONS,normalizeSessionSandboxDisabledReason,SESSION_WELCOME_MODES,isSessionWelcomeMode,DEFAULT_MODE_PERMISSION_CONFIG,cloneDesiredConfig,cloneResolvedRuntimeConfig,normalizeSceneMode,normalizeWelcomeMode,toLegacySourceMode,normalizePermissionMode,normalizeNonPlanPermissionMode,normalizeRuntimeIdentity,normalizeSessionSettings,normalizeStringArray,normalizeAddonSelection,normalizeDesiredConfig,buildSessionRestartFingerprint,buildFallbackRuntimeConfig,resolveDefaultPermissionMode,resolveDefaultTools,policies,deriveSessionDeferredBuiltinPolicy,registerSessionDeferredBuiltinPolicy,unregisterSessionDeferredBuiltinPolicy,clonePolicy};
})();
function isRecord$14(value) {
	return !!value && typeof value === "object" && !Array.isArray(value);
}
function normalizeString$4(value) {
	if (typeof value !== "string") return;
	const normalized = value.trim();
	return normalized.length > 0 ? normalized : void 0;
}
function normalizeStringArray$2(value) {
	if (!Array.isArray(value)) return [];
	return Array.from(new Set(value.map(normalizeString$4).filter((item) => !!item))).sort();
}
function normalizeEnabledPlugins(value) {
	if (!isRecord$14(value)) return {};
	const entries = Object.entries(value).map(([pluginId, enabled]) => [pluginId.trim(), enabled]).filter((entry) => entry[0].length > 0 && typeof entry[1] === "boolean").sort(([left], [right]) => left.localeCompare(right));
	return Object.fromEntries(entries);
}
function normalizeMarketplaceConfig(value) {
	if (!isRecord$14(value)) return;
	const source = value.source;
	if (source !== "github" && source !== "git" && source !== "url" && source !== "zip") return;
	const repo = normalizeString$4(value.repo);
	const url = normalizeString$4(value.url);
	const metaUrl = normalizeString$4(value.metaUrl);
	const versionUrl = normalizeString$4(value.versionUrl);
	const autoUpdate = typeof value.autoUpdate === "boolean" ? value.autoUpdate : void 0;
	return {
		source,
		...repo ? { repo } : {},
		...url ? { url } : {},
		...metaUrl ? { metaUrl } : {},
		...autoUpdate !== void 0 ? { autoUpdate } : {},
		...versionUrl ? { versionUrl } : {}
	};
}
function normalizeMarketplaces(value) {
	if (!isRecord$14(value)) return {};
	const entries = Object.entries(value).map(([name, config]) => [name.trim(), normalizeMarketplaceConfig(config)]).filter((entry) => entry[0].length > 0 && !!entry[1]).sort(([left], [right]) => left.localeCompare(right));
	return Object.fromEntries(entries);
}
function createEmptySessionPluginContext() {
	return {
		version: 1,
		selectedPluginIds: [],
		microSceneIds: [],
		projectResources: {
			connectorSkillIds: [],
			mcpServerNames: [],
			projectSkillNames: []
		},
		pluginSettings: {
			enabledPlugins: {},
			extraKnownMarketplaces: {}
		}
	};
}
function normalizeSessionPluginContext(value) {
	if (!isRecord$14(value) || value.version !== 1) return;
	const projectResources = isRecord$14(value.projectResources) ? value.projectResources : {};
	const pluginSettings = isRecord$14(value.pluginSettings) ? value.pluginSettings : {};
	return {
		version: 1,
		selectedPluginIds: normalizeStringArray$2(value.selectedPluginIds),
		microSceneIds: normalizeStringArray$2(value.microSceneIds),
		projectResources: {
			connectorSkillIds: normalizeStringArray$2(projectResources.connectorSkillIds),
			mcpServerNames: normalizeStringArray$2(projectResources.mcpServerNames),
			projectSkillNames: normalizeStringArray$2(projectResources.projectSkillNames)
		},
		pluginSettings: {
			enabledPlugins: normalizeEnabledPlugins(pluginSettings.enabledPlugins),
			extraKnownMarketplaces: normalizeMarketplaces(pluginSettings.extraKnownMarketplaces)
		}
	};
}
function createInitialTaskState(sessionId, createdAt) {
	return {
		sessionId,
		runState: "idle",
		executionStage: null,
		terminalOutcome: null,
		lastTransitionAt: createdAt,
		turnSeq: 0
	};
}
function deriveTaskStatus(state) {
	if (state.archivedAt) return "archived";
	if (state.runState === "awaiting_input") return "pending";
	if (state.runState === "running" && state.executionStage === "planning") return "planning";
	if (state.runState === "running") return "working";
	if (state.runState === "terminated" || state.terminalOutcome === "terminated") return "terminated";
	if (state.runState === "errored" || state.terminalOutcome === "error") return "error";
	if (state.terminalOutcome === "failed") return "failed";
	if (state.terminalOutcome === "completed") return "completed";
	return state.turnSeq === 0 ? "pending" : "completed";
}
function isTaskTerminal(state) {
	return state.terminalOutcome !== null || state.runState === "errored" || state.runState === "terminated";
}
function isTerminalTaskStatus(status) {
	return status === "completed" || status === "failed" || status === "error" || status === "terminated" || status === "archived";
}
function reduceTaskStatus(state, signal) {
	const at = signal.timestamp ?? Date.now();
	if ((signal.type === "awaiting_input" || signal.type === "input_resolved") && isTaskTerminal(state)) return state;
	switch (signal.type) {
		case "turn_started": return {
			...state,
			runState: "running",
			executionStage: "planning",
			terminalOutcome: null,
			pendingInputKind: void 0,
			lastTransitionAt: at,
			lastActivityAt: at,
			turnSeq: state.turnSeq + 1,
			terminationReason: void 0
		};
		case "planning_started": return {
			...state,
			runState: "running",
			executionStage: "planning",
			terminalOutcome: null,
			pendingInputKind: void 0,
			lastTransitionAt: at
		};
		case "working_started": return {
			...state,
			runState: "running",
			executionStage: "working",
			terminalOutcome: null,
			pendingInputKind: void 0,
			lastTransitionAt: at
		};
		case "awaiting_input": return {
			...state,
			runState: "awaiting_input",
			pendingInputKind: signal.kind,
			lastTransitionAt: at,
			lastActivityAt: at
		};
		case "input_resolved":
			if (state.terminalOutcome !== null) return {
				...state,
				pendingInputKind: void 0,
				lastTransitionAt: at
			};
			return {
				...state,
				runState: "running",
				executionStage: state.executionStage ?? "working",
				pendingInputKind: void 0,
				lastTransitionAt: at
			};
		case "turn_completed": return {
			...state,
			runState: "idle",
			executionStage: null,
			terminalOutcome: "completed",
			pendingInputKind: void 0,
			lastTransitionAt: at,
			lastActivityAt: at
		};
		case "turn_failed": return {
			...state,
			runState: "idle",
			executionStage: null,
			terminalOutcome: "failed",
			pendingInputKind: void 0,
			lastTransitionAt: at
		};
		case "runtime_errored": return {
			...state,
			runState: "errored",
			executionStage: null,
			terminalOutcome: "error",
			pendingInputKind: void 0,
			lastTransitionAt: at
		};
		case "runtime_terminated": return {
			...state,
			runState: "terminated",
			executionStage: null,
			terminalOutcome: "terminated",
			pendingInputKind: void 0,
			lastTransitionAt: at,
			terminationReason: signal.reason
		};
		default: return state;
	}
}
function normalizeTaskStatus(rawStatus) {
	switch (rawStatus?.trim().toLowerCase().replace(/[\s-]+/g, "_")) {
		case "planning":
		case "preparing":
		case "connecting": return "planning";
		case "working":
		case "running":
		case "tool_start":
		case "tool_end":
		case "handoff":
		case "summarizing":
		case "waiting_team_members":
		case "model_requesting":
		case "model_streaming":
		case "model_done":
		case "tool_executing": return "working";
		case "pending":
		case "idle":
		case "await_input":
		case "awaitinput":
		case "waiting_input":
		case "waiting_user_input":
		case "connected": return "pending";
		case "completed":
		case "cancelled":
		case "canceled":
		case "done": return "completed";
		case "failed": return "failed";
		case "error": return "error";
		case "terminated": return "terminated";
		case "archived": return "archived";
		default: return "pending";
	}
}
function applyManualTaskStatus(state, status, timestamp = Date.now()) {
	if (status === "archived") return {
		...state,
		archivedAt: timestamp,
		lastTransitionAt: timestamp
	};
	const base = {
		...state,
		archivedAt: void 0,
		lastTransitionAt: timestamp
	};
	switch (status) {
		case "planning": return {
			...base,
			runState: "running",
			executionStage: "planning",
			terminalOutcome: null,
			pendingInputKind: void 0,
			turnSeq: Math.max(base.turnSeq, 1)
		};
		case "working": return {
			...base,
			runState: "running",
			executionStage: "working",
			terminalOutcome: null,
			pendingInputKind: void 0,
			turnSeq: Math.max(base.turnSeq, 1)
		};
		case "pending": return {
			...base,
			runState: "awaiting_input",
			executionStage: null,
			terminalOutcome: null,
			pendingInputKind: "user_input"
		};
		case "completed": return {
			...base,
			runState: "idle",
			executionStage: null,
			terminalOutcome: "completed",
			pendingInputKind: void 0,
			turnSeq: Math.max(base.turnSeq, 1)
		};
		case "failed": return {
			...base,
			runState: "idle",
			executionStage: null,
			terminalOutcome: "failed",
			pendingInputKind: void 0,
			turnSeq: Math.max(base.turnSeq, 1)
		};
		case "error": return {
			...base,
			runState: "errored",
			executionStage: null,
			terminalOutcome: "error",
			pendingInputKind: void 0,
			turnSeq: Math.max(base.turnSeq, 1)
		};
		case "terminated": return {
			...base,
			runState: "terminated",
			executionStage: null,
			terminalOutcome: "terminated",
			pendingInputKind: void 0,
			turnSeq: Math.max(base.turnSeq, 1)
		};
		default: return base;
	}
}
function restoreTaskStateFromStoredStatus(sessionId, createdAt, rawStatus, options) {
	const initial = createInitialTaskState(sessionId, createdAt);
	const normalized = normalizeTaskStatus(rawStatus);
	const onDecision = options?.onDecision;
	if (normalized === "archived" || normalized === "completed" || normalized === "failed" || normalized === "error" || normalized === "terminated") {
		onDecision?.({
			decision: "terminal-preserved",
			sessionId,
			rawStatus,
			normalized
		});
		return applyManualTaskStatus(initial, normalized, createdAt);
	}
	if (normalized === "planning" || normalized === "working" || normalized === "pending") {
		const updatedAt = options?.updatedAt;
		const threshold = options?.staleThresholdMs ?? 18e5;
		const now = options?.now?.() ?? Date.now();
		if (typeof updatedAt === "number" && now - updatedAt > threshold) {
			onDecision?.({
				decision: "stale-inflight-to-terminated",
				sessionId,
				rawStatus,
				normalized,
				updatedAt,
				now,
				ageMs: now - updatedAt
			});
			return applyManualTaskStatus(initial, "terminated", updatedAt);
		}
		onDecision?.({
			decision: "fallback-to-initial",
			sessionId,
			rawStatus,
			normalized,
			updatedAt,
			now
		});
		return initial;
	}
	onDecision?.({
		decision: "fallback-to-initial",
		sessionId,
		rawStatus,
		normalized
	});
	return initial;
}
var SESSION_CWD_UNAVAILABLE = "SESSION_CWD_UNAVAILABLE";
var SessionCwdUnavailableError = class extends Error {
	code = SESSION_CWD_UNAVAILABLE;
	data;
	constructor(message, data) {
		super(message);
		this.name = "SessionCwdUnavailableError";
		this.data = data;
	}
};
function classifyErrno(errno) {
	switch (errno) {
		case "ENOENT":
		case "ENOTDIR": return "missing";
		case "EACCES":
		case "EPERM": return "permission_denied";
		default: return "unknown";
	}
}
async function assertSessionCwdUsable(cwd) {
	let stat;
	try {
		stat = await node_fs.promises.stat(cwd);
	} catch (err) {
		const errno = err.code;
		const reason = classifyErrno(errno);
		throw new SessionCwdUnavailableError(reason === "missing" ? `Session working directory does not exist or was removed: ${cwd}` : reason === "permission_denied" ? `Permission denied for session working directory: ${cwd}` : `Cannot access session working directory: ${cwd} (${errno ?? "unknown"})`, {
			cwd,
			reason,
			errno,
			systemMessage: err instanceof Error ? err.message : String(err)
		});
	}
	if (!stat.isDirectory()) throw new SessionCwdUnavailableError(`Session working directory path is not a directory: ${cwd}`, {
		cwd,
		reason: "not_a_directory"
	});
	try {
		await node_fs.promises.access(cwd, node_fs.constants.R_OK | node_fs.constants.X_OK);
	} catch (err) {
		const errno = err.code;
		throw new SessionCwdUnavailableError(`Permission denied for session working directory: ${cwd}`, {
			cwd,
			reason: "permission_denied",
			errno,
			systemMessage: err instanceof Error ? err.message : String(err)
		});
	}
}
function formatLogDetailsSuffix(details) {
	if (details === void 0) return "";
	const detailsText = safeStringifyLogDetails(details);
	return detailsText ? ` ${detailsText}` : "";
}
function safeStringifyLogDetails(details) {
	if (details === null || details === void 0) return "";
	if (typeof details === "string") return details;
	try {
		return JSON.stringify(details, (_key, value) => {
			if (value instanceof Error) return serializeLogErrorForDetails(value);
			if (typeof value === "bigint") return value.toString();
			return value;
		});
	} catch {
		try {
			return String(details);
		} catch {
			return "[unserializable-log-details]";
		}
	}
}
function serializeLogErrorForDetails(error) {
	if (error instanceof Error) {
		const errorWithExtras = error;
		return {
			name: error.name,
			message: error.message,
			stack: error.stack,
			code: errorWithExtras.code,
			data: sanitizeLogDetailValue(errorWithExtras.data),
			cause: errorWithExtras.cause ? serializeLogErrorCauseForDetails(errorWithExtras.cause) : void 0
		};
	}
	return { message: String(error) };
}
function serializeLogErrorCauseForDetails(error) {
	if (error instanceof Error) return serializeLogErrorForDetails(error);
	return String(error);
}
function sanitizeLogDetailValue(value, depth = 0) {
	if (depth >= 3) return "[truncated]";
	if (value == null || typeof value === "number" || typeof value === "boolean" || typeof value === "string") return value;
	if (Array.isArray(value)) return value.slice(0, 10).map((item) => sanitizeLogDetailValue(item, depth + 1));
	if (value instanceof Error) return serializeLogErrorForDetails(value);
	if (typeof value === "object") {
		const entries = Object.entries(value).slice(0, 20);
		return Object.fromEntries(entries.map(([key, nested]) => [key, sanitizeLogDetailValue(nested, depth + 1)]));
	}
	return String(value);
}
function createMicroScenePack(microSceneIds) {
	return {
		id: "micro-scene:selection",
		source: "micro_scene",
		pluginIds: [],
		items: microSceneIds.map((sceneId) => ({
			id: `micro-scene:${sceneId}`,
			type: "plugin",
			source: "micro_scene",
			surfaces: ["runtime_only"],
			payloadSummary: { sceneId },
			provenance: {
				packId: "micro-scene:selection",
				channel: "addonSelection.microSceneIds"
			}
		})),
		validationWarnings: microSceneIds.length > 0 ? ["micro_scene_plugin_ids_unresolved"] : []
	};
}
function skillItem(id, channel, payloadKey) {
	return {
		id: `skill:${id}`,
		type: "skill",
		source: "runtime_only",
		surfaces: ["available_skills"],
		payloadSummary: { [payloadKey]: id },
		provenance: {
			packId: "user:project-resources",
			channel
		}
	};
}
function mcpItem(serverName) {
	return {
		id: `mcp:${serverName}`,
		type: "mcp",
		source: "runtime_only",
		surfaces: ["runtime_only"],
		payloadSummary: { serverName },
		provenance: {
			packId: "user:project-resources",
			channel: "addonSelection.projectResources.mcpServerNames"
		}
	};
}
function createUserProjectResourcePack(resources) {
	return {
		id: "user:project-resources",
		source: "runtime_only",
		pluginIds: [],
		items: [
			...resources.connectorSkillIds.map((skillId) => skillItem(skillId, "addonSelection.projectResources.connectorSkillIds", "skillId")),
			...resources.projectSkillNames.map((skillName) => skillItem(skillName, "addonSelection.projectResources.projectSkillNames", "skillName")),
			...resources.mcpServerNames.map(mcpItem)
		],
		validationWarnings: []
	};
}
var WORKBUDDY_BUILTIN_MARKETPLACE$1 = "workbuddy-builtin";
var WELCOME_MODE_PLUGIN_NAMES = {
	code: "welcomemode-code",
	work: "welcomemode-work",
	design: "welcomemode-design"
};
var INTERACTION_MODE_PLUGIN_NAMES = {
	ask: "interactionmode-ask",
	craft: "interactionmode-craft",
	expert: "interactionmode-expert",
	plan: "interactionmode-plan"
};
var PROMPT_COMMON_PLUGIN_NAME = "prompt-common";
var NETDRIVE_MCP_SERVER_NAME = "netdrive";
function toBuiltinPluginId(pluginName) {
	return `${pluginName}@${WORKBUDDY_BUILTIN_MARKETPLACE$1}`;
}
function pluginItem$1(pluginId, role, packId) {
	return {
		id: `plugin:${pluginId}`,
		type: "plugin",
		source: "work_mode",
		surfaces: ["runtime_only"],
		payloadSummary: {
			pluginId,
			role
		},
		provenance: {
			packId,
			channel: "addonRegistry.workMode"
		}
	};
}
function mcpDependencyItem(serverName, packId, dependencyOf) {
	return {
		id: `mcp:${serverName}`,
		type: "mcp",
		source: "work_mode",
		surfaces: ["runtime_only"],
		payloadSummary: {
			serverName,
			dependencyOf
		},
		provenance: {
			packId,
			channel: "addonRegistry.workMode.welcomeModeDependencies"
		}
	};
}
function resolveWorkModePack({ welcomeMode, interactionMode }) {
	const mode = interactionMode || "craft";
	const welcomeModePluginName = welcomeMode ? WELCOME_MODE_PLUGIN_NAMES[welcomeMode] : void 0;
	const interactionPluginName = INTERACTION_MODE_PLUGIN_NAMES[mode];
	const welcomeModeId = welcomeModePluginName ? toBuiltinPluginId(welcomeModePluginName) : void 0;
	const interactionModePluginId = interactionPluginName ? toBuiltinPluginId(interactionPluginName) : void 0;
	const promptCommonPluginId = toBuiltinPluginId(PROMPT_COMMON_PLUGIN_NAME);
	const id = `work-mode:${welcomeMode ?? "default"}:${mode}`;
	const validationWarnings = [...welcomeMode && !welcomeModePluginName ? [`unknown_welcome_mode:${welcomeMode}`] : [], ...!interactionPluginName ? [`unknown_interaction_mode:${mode}`] : []];
	return {
		id,
		source: "work_mode",
		pluginIds: [
			...welcomeModeId ? [welcomeModeId] : [],
			...interactionModePluginId ? [interactionModePluginId] : [],
			promptCommonPluginId
		],
		welcomeModeId,
		interactionModePluginId,
		promptCommonPluginId,
		items: [
			...welcomeModeId ? [pluginItem$1(welcomeModeId, "welcome_mode", id)] : [],
			...welcomeModeId ? [mcpDependencyItem(NETDRIVE_MCP_SERVER_NAME, id, welcomeModeId)] : [],
			...interactionModePluginId ? [pluginItem$1(interactionModePluginId, "interaction_mode", id)] : [],
			pluginItem$1(promptCommonPluginId, "prompt_common", id)
		],
		validationWarnings
	};
}
function resolveInteractionModeForPrompt({ desiredConfig }) {
	const interactionMode = desiredConfig.addonSelection?.interactionMode ?? desiredConfig.mode ?? "craft";
	if (desiredConfig.expertId && interactionMode === "craft") return "expert";
	return interactionMode;
}
function resolveAddonPacks({ desiredConfig, runtimeConfig }) {
	const selection = desiredConfig.addonSelection;
	const welcomeMode = selection?.welcomeMode ?? desiredConfig.welcomeMode ?? runtimeConfig.welcomeMode;
	const interactionMode = resolveInteractionModeForPrompt({ desiredConfig });
	const microSceneIds = selection?.microSceneIds ?? [];
	const enabledPluginIds = selection?.enabledPluginIds ?? [];
	const projectResources = selection?.projectResources ?? {
		connectorSkillIds: [],
		mcpServerNames: [],
		projectSkillNames: []
	};
	const workModePack = resolveWorkModePack({
		welcomeMode,
		interactionMode
	});
	const microScenePack = createMicroScenePack(microSceneIds);
	const userProjectResourcePack = createUserProjectResourcePack(projectResources);
	const validationWarnings = [
		...workModePack.validationWarnings,
		...microScenePack.validationWarnings,
		...userProjectResourcePack.validationWarnings
	];
	return {
		selected: {
			...welcomeMode ? { welcomeMode } : {},
			interactionMode,
			...workModePack.welcomeModeId ? { welcomeModeId: workModePack.welcomeModeId } : {},
			...workModePack.interactionModePluginId ? { interactionModePluginId: workModePack.interactionModePluginId } : {},
			...workModePack.promptCommonPluginId ? { promptCommonPluginId: workModePack.promptCommonPluginId } : {},
			microSceneIds,
			microScenePluginIds: [],
			enabledPluginIds,
			validationWarnings
		},
		packs: [
			workModePack,
			microScenePack,
			userProjectResourcePack
		]
	};
}
var WORKBUDDY_BUILTIN_MARKETPLACE = "workbuddy-builtin";
var WORKBUDDY_WORK_MODE_PLUGIN_PREFIXES = [
	"welcomemode-",
	"interactionmode-",
	"prompt-common"
];
function readRecord(value) {
	return value && typeof value === "object" && !Array.isArray(value) ? value : void 0;
}
function mergeEnabledPlugins(settings, pluginIds) {
	if (pluginIds.length === 0 && !settings) return;
	const enabledPlugins = { ...readRecord(settings?.enabledPlugins) ?? {} };
	const selectedWorkModePluginIds = pluginIds.filter(isWorkbuddyWorkModePluginId);
	for (const pluginId of Object.keys(enabledPlugins)) if (isWorkbuddyWorkModePluginId(pluginId) && !selectedWorkModePluginIds.includes(pluginId)) enabledPlugins[pluginId] = false;
	for (const pluginId of pluginIds) enabledPlugins[pluginId] = true;
	return {
		...settings ?? {},
		enabledPlugins
	};
}
function buildAddonComposeRestartFingerprint(runtimeConfig, expansion) {
	return JSON.stringify({
		base: runtimeConfig.restartFingerprint,
		addonCompose: { enabledPluginIds: expansion.selectedPlugins.enabledPluginIds }
	});
}
function parseToolNames(value) {
	if (!value) return [];
	return value.split(",").map((item) => item.trim()).filter(Boolean).sort();
}
function readSessionSettingsSummary(settings) {
	if (!settings) return;
	const enabledPlugins = readRecord(settings.enabledPlugins);
	const extraKnownMarketplaces = readRecord(settings.extraKnownMarketplaces);
	return {
		keys: Object.keys(settings).sort(),
		enabledPluginIds: enabledPlugins ? Object.keys(enabledPlugins).filter((id) => enabledPlugins[id] !== false).sort() : [],
		extraKnownMarketplaceNames: extraKnownMarketplaces ? Object.keys(extraKnownMarketplaces).sort() : []
	};
}
function compactUnique(values) {
	return Array.from(new Set(values.filter((value) => typeof value === "string" && value.length > 0)));
}
function isWorkbuddyWorkModePluginId(pluginId) {
	if (!pluginId.endsWith(`@${WORKBUDDY_BUILTIN_MARKETPLACE}`)) return false;
	const pluginName = pluginId.slice(0, -`@${WORKBUDDY_BUILTIN_MARKETPLACE}`.length);
	return WORKBUDDY_WORK_MODE_PLUGIN_PREFIXES.some((prefix) => pluginName.startsWith(prefix));
}
function expandSessionRuntimeConfig(input) {
	const { runtimeConfig, selected, systemPromptSummary } = input;
	const sessionSettings = readSessionSettingsSummary(runtimeConfig.sessionSettings);
	const tools = parseToolNames(runtimeConfig.tools);
	const workModePluginIds = compactUnique([
		selected.welcomeModeId,
		selected.interactionModePluginId,
		selected.promptCommonPluginId
	]);
	const sessionSettingPluginIds = (sessionSettings?.enabledPluginIds ?? []).filter((pluginId) => !isWorkbuddyWorkModePluginId(pluginId) || workModePluginIds.includes(pluginId));
	const enabledPluginIds = compactUnique([
		...workModePluginIds,
		...selected.microScenePluginIds,
		...selected.enabledPluginIds,
		...sessionSettingPluginIds
	]);
	const missingFromSessionSettings = enabledPluginIds.filter((pluginId) => !sessionSettingPluginIds.includes(pluginId));
	return {
		...sessionSettings ? { sessionSettings } : {},
		selectedPlugins: {
			enabledPluginIds,
			workModePluginIds,
			microScenePluginIds: selected.microScenePluginIds,
			sessionSettingPluginIds,
			missingFromSessionSettings
		},
		compose: {
			cliComposeEnabled: true,
			requiredPluginIds: workModePluginIds
		},
		...systemPromptSummary ? { systemPrompt: systemPromptSummary } : {},
		...tools.length > 0 ? { tools } : {},
		hiddenContextSections: [],
		mcpRuntime: []
	};
}
function applySessionAddonExpansionToRuntimeConfig(runtimeConfig, expansion) {
	const nextConfig = {
		...runtimeConfig,
		restartFingerprint: buildAddonComposeRestartFingerprint(runtimeConfig, expansion)
	};
	const sessionSettings = mergeEnabledPlugins(runtimeConfig.sessionSettings, expansion.selectedPlugins.enabledPluginIds);
	if (sessionSettings) nextConfig.sessionSettings = sessionSettings;
	return nextConfig;
}
function makeEmptyAddons() {
	return {
		systemPrompts: [],
		tools: [],
		mcp: [],
		skills: [],
		connectors: [],
		plugins: [],
		rules: [],
		subagents: []
	};
}
function addonBucketForType(item) {
	switch (item.type) {
		case "system_prompt": return "systemPrompts";
		case "tool": return "tools";
		case "mcp": return "mcp";
		case "skill": return "skills";
		case "connector": return "connectors";
		case "plugin": return "plugins";
		case "rule": return "rules";
		case "subagent": return "subagents";
	}
}
function pushAddon(addons, provenance, item, seenAddonIds) {
	if (seenAddonIds.has(item.id)) return;
	seenAddonIds.add(item.id);
	addons[addonBucketForType(item)].push(item);
	provenance.push({
		addonId: item.id,
		from: item.source,
		packId: item.provenance.packId,
		channel: item.provenance.channel
	});
}
function inferPluginSource(pluginId) {
	const [pluginName] = pluginId.split("@");
	if (pluginName?.startsWith("welcomemode-") || pluginName?.startsWith("interactionmode-") || pluginName === "prompt-common") return "work_mode";
	if (pluginId.endsWith("@workbuddy-builtin")) return "runtime_only";
	return "unknown";
}
function pluginItem(pluginId, source, packId, channel = "sessionSettings.enabledPlugins") {
	return {
		id: `plugin:${pluginId}`,
		type: "plugin",
		source,
		surfaces: ["runtime_only"],
		payloadSummary: { pluginId },
		provenance: {
			packId,
			channel
		}
	};
}
function composeSessionAddons({ desiredConfig, runtimeConfig, systemPromptSummary, hashText }) {
	const addons = makeEmptyAddons();
	const provenance = [];
	const seenAddonIds = /* @__PURE__ */ new Set();
	const resolvedPacks = resolveAddonPacks({
		desiredConfig,
		runtimeConfig
	});
	const expanded = expandSessionRuntimeConfig({
		runtimeConfig,
		selected: resolvedPacks.selected,
		systemPromptSummary
	});
	const selected = {
		...resolvedPacks.selected,
		enabledPluginIds: expanded.selectedPlugins.enabledPluginIds
	};
	for (const pack of resolvedPacks.packs) for (const item of pack.items) pushAddon(addons, provenance, item, seenAddonIds);
	if (systemPromptSummary) {
		const source = desiredConfig.systemPrompt ? "user" : "work_mode";
		pushAddon(addons, provenance, {
			id: desiredConfig.systemPrompt ? "system-prompt:explicit" : "system-prompt:mode-resolver",
			type: "system_prompt",
			source,
			surfaces: ["system_prompt"],
			payloadSummary: {
				...systemPromptSummary,
				resolver: desiredConfig.systemPrompt ? "SessionDesiredConfig.systemPrompt" : "ModeService.resolveOptions"
			},
			provenance: {
				packId: source === "work_mode" ? `work-mode:${selected.welcomeMode ?? "default"}:${selected.interactionMode ?? "craft"}` : "user:explicit-system-prompt",
				channel: desiredConfig.systemPrompt ? "desiredConfig.systemPrompt" : "runtimeConfig.systemPrompt"
			}
		}, seenAddonIds);
	}
	const toolNames = parseToolNames(runtimeConfig.tools);
	if (toolNames.length > 0) {
		const source = desiredConfig.tools ? "user" : "work_mode";
		pushAddon(addons, provenance, {
			id: `tools:${hashText(toolNames.join(","))}`,
			type: "tool",
			source,
			surfaces: ["tools"],
			payloadSummary: {
				count: toolNames.length,
				names: toolNames,
				resolver: desiredConfig.tools ? "SessionDesiredConfig.tools" : "ModeService.resolveOptions"
			},
			provenance: {
				packId: source === "work_mode" ? `work-mode:${selected.welcomeMode ?? "default"}:${selected.interactionMode ?? "craft"}` : "user:explicit-tools",
				channel: runtimeConfig.tools === desiredConfig.tools ? "desiredConfig.tools" : "runtimeConfig.tools"
			}
		}, seenAddonIds);
	}
	const sessionSettingPluginIds = new Set(expanded.sessionSettings?.enabledPluginIds ?? []);
	for (const pluginId of expanded.selectedPlugins.enabledPluginIds) {
		const source = inferPluginSource(pluginId);
		const fromSessionSettings = sessionSettingPluginIds.has(pluginId);
		pushAddon(addons, provenance, pluginItem(pluginId, source, source === "work_mode" ? `work-mode:${selected.welcomeMode ?? "default"}:${selected.interactionMode ?? "craft"}` : fromSessionSettings ? "session-settings" : "addon-selection:enabled-plugins", fromSessionSettings ? "sessionSettings.enabledPlugins" : "addonSelection.enabledPluginIds"), seenAddonIds);
	}
	return {
		selected,
		addons,
		expanded,
		provenance
	};
}
function summarizeText(value) {
	if (value === void 0) return;
	return {
		length: value.length,
		sha256: sha256(value)
	};
}
function sha256(value) {
	return (0, node_crypto.createHash)("sha256").update(value).digest("hex");
}
function stableJsonStringify$2(value) {
	if (Array.isArray(value)) return `[${value.map((item) => stableJsonStringify$2(item)).join(",")}]`;
	if (value && typeof value === "object") {
		const objectValue = value;
		return `{${Object.keys(objectValue).sort().filter((key) => objectValue[key] !== void 0).map((key) => `${JSON.stringify(key)}:${stableJsonStringify$2(objectValue[key])}`).join(",")}}`;
	}
	return JSON.stringify(value);
}
function buildManifestHash(manifestWithoutHash) {
	return sha256(stableJsonStringify$2(manifestWithoutHash));
}
function buildSessionAddonManifest({ sessionId, desiredConfig, runtimeConfig }) {
	const composition = composeSessionAddons({
		desiredConfig,
		runtimeConfig,
		systemPromptSummary: summarizeText(runtimeConfig.systemPrompt),
		hashText: sha256
	});
	const manifestBody = {
		version: 1,
		sessionId,
		selected: composition.selected,
		addons: composition.addons,
		expanded: composition.expanded,
		provenance: composition.provenance
	};
	return {
		...manifestBody,
		generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
		hash: buildManifestHash(manifestBody)
	};
}
var DEFAULT_CHECK_INTERVAL_MS = 3e4;
var DEFAULT_TIMEOUT_THRESHOLD_MS = 12e4;
var DEFAULT_AWAITING_INPUT_TIMEOUT_MS = 6e4;
var MAX_LOG_ENTRIES = 50;
var REPORTED_LOG_SLICE = 20;
var NoResponseWatchdog = class {
	timer = null;
	alreadyReported = false;
	checkIntervalMs;
	timeoutThresholdMs;
	awaitingInputTimeoutMs;
	now;
	constructor(session, reportTelemetry, config, now) {
		this.session = session;
		this.reportTelemetry = reportTelemetry;
		this.checkIntervalMs = config?.checkIntervalMs ?? DEFAULT_CHECK_INTERVAL_MS;
		this.timeoutThresholdMs = config?.timeoutThresholdMs ?? DEFAULT_TIMEOUT_THRESHOLD_MS;
		this.awaitingInputTimeoutMs = config?.awaitingInputTimeoutMs ?? DEFAULT_AWAITING_INPUT_TIMEOUT_MS;
		this.now = now ?? Date.now;
	}
	start() {
		this.stop();
		this.alreadyReported = false;
		this.timer = setInterval(() => this.tick(), this.checkIntervalMs);
	}
	stop() {
		if (this.timer) {
			clearInterval(this.timer);
			this.timer = null;
		}
	}
	/**
	* activity 恢复时复位上报标记，使"恢复后再次断流"能再次上报。
	*/
	resetReportedFlag() {
		this.alreadyReported = false;
	}
	tick() {
		if (!this.session.isProcessing || this.alreadyReported) return;
		if (!this.reportTelemetry) return;
		if (this.session.userCancelRequested) {
			this.stop();
			return;
		}
		if (this.session.taskState.runState === "awaiting_input") {
			const hasPending = this.session.hasPendingInput === true;
			const startedAt = this.session.awaitingInputStartedAt ?? this.session.lastBackendMessageAt ?? this.session.promptStartedAt ?? 0;
			const gap = this.now() - startedAt;
			if (gap >= (hasPending ? this.awaitingInputTimeoutMs : this.timeoutThresholdMs)) {
				this.report(gap);
				this.alreadyReported = true;
			}
			return;
		}
		const lastActivity = this.session.lastBackendMessageAt ?? this.session.promptStartedAt ?? 0;
		const gap = this.now() - lastActivity;
		if (gap >= this.timeoutThresholdMs) {
			this.report(gap);
			this.alreadyReported = true;
		}
	}
	report(activityGap) {
		if (!this.reportTelemetry) return;
		if (this.session.userCancelRequested) return;
		const now = this.now();
		const promptDuration = this.session.promptStartedAt ? Math.max(0, now - this.session.promptStartedAt) : 0;
		const currentTaskStatus = deriveTaskStatus(this.session.taskState);
		this.reportTelemetry("session_no_response_timeout", {
			mode: "LOCAL",
			task_id: this.session.sessionId,
			trace_id: this.session.promptTraceId ?? "unknown",
			request_id: this.session.promptRequestId ?? "unknown",
			duration_since_prompt_ms: promptDuration,
			duration_since_last_activity_ms: activityGap,
			current_run_state: this.session.taskState.runState,
			current_task_status: currentTaskStatus,
			last_signal_received_at: this.session.lastSignalReceivedAt ?? 0,
			has_received_any_activity: this.session.hasReceivedBackendActivity === true,
			stuck_in_awaiting_input: this.session.taskState.runState === "awaiting_input",
			has_pending_input: this.session.hasPendingInput === true,
			state_transition_path: this.formatStateTransitionPath()
		});
	}
	/**
	* 紧凑格式化状态转换路径：`signal:fromRun/fromTask→toRun/toTask@相对ms`，分号分隔。
	* 相对 ms = entry.timestamp - promptStartedAt，便于直观看"卡了多久"。
	*/
	formatStateTransitionPath() {
		const entries = this.session.stateTransitionLog.slice(-REPORTED_LOG_SLICE);
		const base = this.session.promptStartedAt ?? 0;
		return entries.map((e) => {
			const relMs = base ? e.timestamp - base : e.timestamp;
			const phase = e.phase ? `[${e.phase}]` : "";
			return `${e.signal}:${e.fromRunState}/${e.fromTaskStatus}→${e.toRunState}/${e.toTaskStatus}${phase}@${relMs}ms`;
		}).join(";");
	}
};
function appendStateTransitionEntry(log, entry) {
	const last = log[log.length - 1];
	const stateUnchanged = entry.fromRunState === entry.toRunState && entry.fromTaskStatus === entry.toTaskStatus;
	const phaseUnchanged = !entry.phase || last?.phase === entry.phase;
	if (stateUnchanged && phaseUnchanged) return;
	log.push(entry);
	while (log.length > MAX_LOG_ENTRIES) log.shift();
}
function isRecord$4(value) {
	return !!value && typeof value === "object" && !Array.isArray(value);
}
function filterDerivedPluginIds(pluginIds) {
	return pluginIds.filter((pluginId) => !isWorkbuddyWorkModePluginId(pluginId.trim()));
}
function projectSessionPluginContext(desiredConfig) {
	const empty = createEmptySessionPluginContext();
	const selection = desiredConfig.addonSelection;
	const sessionSettings = desiredConfig.sessionSettings;
	const rawEnabledPlugins = isRecord$4(sessionSettings?.enabledPlugins) ? sessionSettings.enabledPlugins : {};
	const enabledPlugins = Object.fromEntries(Object.entries(rawEnabledPlugins).filter(([pluginId]) => !isWorkbuddyWorkModePluginId(pluginId.trim())));
	const extraKnownMarketplaces = isRecord$4(sessionSettings?.extraKnownMarketplaces) ? sessionSettings.extraKnownMarketplaces : {};
	return normalizeSessionPluginContext({
		version: 1,
		selectedPluginIds: filterDerivedPluginIds(selection?.enabledPluginIds ?? []),
		microSceneIds: selection?.microSceneIds ?? [],
		projectResources: selection?.projectResources ?? empty.projectResources,
		pluginSettings: {
			enabledPlugins,
			extraKnownMarketplaces
		}
	}) ?? empty;
}
function buildAddonSelectionFromPluginContext(context, welcomeMode, interactionMode) {
	return {
		version: 1,
		...welcomeMode ? { welcomeMode } : {},
		interactionMode: interactionMode ?? "craft",
		microSceneIds: [...context.microSceneIds],
		enabledPluginIds: filterDerivedPluginIds(context.selectedPluginIds),
		promptContentBlockCount: 0,
		resourceLinkCount: 0,
		projectResources: {
			connectorSkillIds: [...context.projectResources.connectorSkillIds],
			mcpServerNames: [...context.projectResources.mcpServerNames],
			projectSkillNames: [...context.projectResources.projectSkillNames]
		}
	};
}
function buildSessionSettingsFromPluginContext(context) {
	const enabledPlugins = Object.fromEntries(Object.entries(context.pluginSettings.enabledPlugins).filter(([pluginId]) => !isWorkbuddyWorkModePluginId(pluginId.trim())));
	const extraKnownMarketplaces = Object.fromEntries(Object.entries(context.pluginSettings.extraKnownMarketplaces).map(([name, config]) => [name, { ...config }]));
	if (Object.keys(enabledPlugins).length === 0 && Object.keys(extraKnownMarketplaces).length === 0) return;
	return {
		...Object.keys(enabledPlugins).length > 0 ? { enabledPlugins } : {},
		...Object.keys(extraKnownMarketplaces).length > 0 ? { extraKnownMarketplaces } : {}
	};
}
function tryParseAcpUsageUpdate(update) {
	if (!update || typeof update !== "object") return null;
	const record = update;
	if (record.sessionUpdate !== "usage_update") return null;
	const used = record.used;
	const size = record.size;
	if (typeof used !== "number" || !Number.isFinite(used) || used < 0) return null;
	if (typeof size !== "number" || !Number.isFinite(size) || size < 0) return null;
	return {
		sessionUpdate: "usage_update",
		used,
		size
	};
}
function tryParseAcpUsageByCategory(meta) {
	if (!meta) return null;
	const raw = meta["codebuddy.ai/usageByCategory"];
	if (!raw || typeof raw !== "object") return null;
	const r = raw;
	if (r.version !== 1) return null;
	for (const key of [
		"systemPrompt",
		"conversation",
		"tools",
		"mcp",
		"skills"
	]) {
		const v = r[key];
		if (typeof v !== "number" || !Number.isFinite(v) || v < 0) return null;
	}
	return {
		systemPrompt: r.systemPrompt,
		conversation: r.conversation,
		tools: r.tools,
		mcp: r.mcp,
		skills: r.skills,
		version: 1
	};
}
function readCodebuddyMeta(meta) {
	const raw = meta?.["codebuddy.ai"];
	return raw && typeof raw === "object" ? raw : void 0;
}
function createPluginRecommendationContinuationBarrier() {
	let release;
	let released = false;
	return {
		settled: new Promise((resolve) => {
			release = () => {
				released = true;
				resolve();
			};
		}),
		get released() {
			return released;
		},
		release
	};
}
function readSessionSourceMode(meta) {
	const codebuddyMeta = readCodebuddyMeta(meta);
	const sourceMode = codebuddyMeta?.sourceMode;
	if (typeof sourceMode === "string" && sourceMode.trim().length > 0) return sourceMode.trim();
	const welcomeMode = codebuddyMeta?.welcomeMode;
	if (typeof welcomeMode === "string" && welcomeMode.trim().length > 0) return welcomeMode.trim();
}
function readIsBackgroundAutomation(meta) {
	return readCodebuddyMeta(meta)?.isBackgroundAutomation === true ? true : void 0;
}
function resolveDefaultCwdOrThrow() {
	try {
		return node_path.normalize(process.cwd());
	} catch (err) {
		const errno = err.code;
		const reason = classifyErrno(errno);
		throw new SessionCwdUnavailableError(`Daemon process.cwd() is unusable and no session cwd was supplied (${errno ?? "unknown"})`, {
			cwd: "<daemon process cwd unavailable>",
			reason,
			errno,
			systemMessage: err instanceof Error ? err.message : String(err)
		});
	}
}
function normalizeCwdPath(value) {
	if (typeof value !== "string") return;
	const trimmed = value.trim();
	if (!trimmed) return;
	const normalized = node_path.normalize(trimmed);
	const root = node_path.parse(normalized).root;
	let end = normalized.length;
	while (end > root.length && (normalized[end - 1] === "/" || normalized[end - 1] === "\\")) end -= 1;
	return normalized.slice(0, end);
}
function readProjectId(meta) {
	const projectId = readCodebuddyMeta(meta)?.projectId;
	return typeof projectId === "string" && projectId.trim().length > 0 ? projectId.trim() : void 0;
}
function readSessionOwnerUserId(meta) {
	const sessionOwnerUserId = readCodebuddyMeta(meta)?.sessionOwnerUserId;
	return typeof sessionOwnerUserId === "string" && sessionOwnerUserId.trim().length > 0 ? sessionOwnerUserId.trim() : void 0;
}
function isCancelledStopReason(reason) {
	if (typeof reason !== "string") return false;
	const normalized = reason.trim().toLowerCase();
	return normalized === "cancelled" || normalized === "canceled" || normalized === "cancel";
}
function isFailedPromptStopReason(reason) {
	return typeof reason === "string" && reason.trim().toLowerCase() === "failed";
}
function formatDiagnosticDetails(error) {
	if (error instanceof Error) return {
		name: error.name,
		message: error.message,
		stack: error.stack
	};
	return error;
}
function withPersistedSessionMeta(meta, options) {
	const nextCodebuddyMeta = {
		...readCodebuddyMeta(meta) ?? {},
		...options.sourceMode ? { sourceMode: options.sourceMode } : {},
		...options.isBackgroundAutomation ? { isBackgroundAutomation: true } : {},
		...options.sessionOwnerUserId ? { sessionOwnerUserId: options.sessionOwnerUserId } : {}
	};
	if (Object.keys(nextCodebuddyMeta).length === 0) return meta;
	return {
		...meta ?? {},
		"codebuddy.ai": nextCodebuddyMeta
	};
}
var SESSION_RUNTIME_RECLAIM_POLICY = {
	idleTimeoutMs: 900 * 1e3,
	sweepIntervalMs: 30 * 1e3,
	maxActiveSessions: 6
};
var SessionManager = class SessionManager {
	sessions = /* @__PURE__ */ new Map();
	historyStoreGeneration = 0;
	historyOwnerGeneration = 0;
	historySessionGenerations = /* @__PURE__ */ new Map();
	pendingSessionDisposals = /* @__PURE__ */ new Map();
	pendingSessionRestores = /* @__PURE__ */ new Map();
	/**
	* Permanent-delete fence for restore/prewarm races.
	*
	* The generation invalidates work that started before a delete/new-session
	* boundary; the tombstone rejects restore requests that arrive after deletion.
	*/
	sessionLifecycleGenerations = /* @__PURE__ */ new Map();
	deletedSessionIds = /* @__PURE__ */ new Set();
	/** Full permanent-delete operations; same-id creation waits through persistent cleanup. */
	pendingSessionDeletes = /* @__PURE__ */ new Map();
	/** Full RPC delete transactions, including business finalizers and deleted-event broadcast. */
	pendingSessionDeleteTransactions = /* @__PURE__ */ new Map();
	primedReplayStates = /* @__PURE__ */ new Map();
	sessionEffectChains = /* @__PURE__ */ new Map();
	/**
	* Process-local runtime sandbox switch. This is intentionally not a history
	* restore source from DB: renderer writes it from the current Security Center
	* switch, and server reuses it only across backend destroy/recreate in this
	* daemon process.
	*/
	runtimeSandboxOverrides = /* @__PURE__ */ new Map();
	/**
	* Per-session debounce timer for sidebar-meta-only changes (lastTransitionAt / lastActivityAt).
	*
	* Without debouncing, every CLI runtime signal — even ones that do NOT change the
	* derived TaskStatus — enqueues an effect (persist + emit) because `lastTransitionAt`
	* always changes (Date.now()). In real sessions this produces ~19x more effects than
	* actual status transitions, flooding the effect chain and delaying the terminal
	* "completed" push event by seconds.
	*
	* The timer coalesces rapid meta-only signals into a single effect. Any real status
	* change (`statusChanged === true`) clears the timer and enqueues immediately.
	*/
	sidebarMetaDebounceTimers = /* @__PURE__ */ new Map();
	static SIDEBAR_META_DEBOUNCE_MS = 2e3;
	runtimeReclaimEligibleSince = /* @__PURE__ */ new Map();
	runtimeReclaimingSessions = /* @__PURE__ */ new Set();
	/**
	* 已经 live-emit 过的 synthetic user prompt 去重键（`${sessionId}::${messageId}`）。
	*
	* 挂在 SessionManager 实例上而非 session 对象上——因为 Claw IM 的 destroyed-session
	* retry 会在两次 prompt 之间 restoreInactiveSessionState 重建 session（eventHistory 被清空），
	* 若只靠 session.eventHistory 去重，重建后第二次 prompt 仍会重复 live-emit 同一条用户消息，
	* 导致 UI 出现两个相同的用户气泡。用实例级集合可跨 session 重建稳定去重。
	*/
	liveEmittedSyntheticUserPromptKeys = /* @__PURE__ */ new Set();
	runtimeReclaimPromise = null;
	runtimeReclaimJanitorTimer;
	runtimeReclaimJanitorOptions;
	createBackend;
	recordStore;
	runtimeConfigResolver;
	userPromptComposer;
	userPromptComposerReady;
	pushEvent = () => {};
	/**
	* 作用域会话事件的进程内监听器（与 `session:event:${sessionId}` 是同一路事件流）。
	* 让服务端消费者（如 Claw IM 流式回复）无需轮询 eventHistory，即可以推送方式、
	* 低延迟地拿到 live agent 输出。以 sessionId 为 key。
	*/
	scopedEventListeners = /* @__PURE__ */ new Map();
	logger;
	disabledToolsResolver;
	onBeforePrompt;
	onAfterDelete;
	toolUsageObserver;
	usageCacheService;
	/**
	* 终态事件上报钩子（Issue #46366）。SessionManager 在任务状态机迁入终态时调用：
	* - completed → 'agent_task_completed'
	* - failed / error / terminated → 'agent_task_failed'
	* 由宿主装配时通过 SessionManagerOptions.reportTelemetry 注入；未注入时静默跳过。
	*/
	reportTelemetry;
	/**
	* 当前登录用户 userId 提供者（Issue #51810）。由宿主（Desktop）注入，用于在创建本地
	* session 首次落盘时立刻写入归属 userId，避免「userId 空窗口期」被切账号后的兜底逻辑
	* 错误归属。未注入时（Web/SDK）保持原行为。
	*/
	getCurrentUserId;
	noResponseWatchdogConfig;
	/**
	* POI 选择交互的阻塞登记中心（pick_location 工具用）。由宿主经 initialize 注入。
	* 未注入时（Web/SDK 无 POI 链路）emitPoiPickQuestion/answerPoiQuestion 退化为返回 false。
	*/
	poiQuestionRegistry;
	pluginRecommendationRegistry;
	cancelPluginRecommendationConnector;
	pluginRecommendationTelemetryReporter;
	pluginRecommendationRunSwitches = /* @__PURE__ */ new Set();
	pluginRecommendationContinuationBarriers = /* @__PURE__ */ new Map();
	/**
	* One-shot, process-local proof that a prompt was created by the recommendation
	* continuation path. RPC clients cannot forge object identity.
	*/
	pluginRecommendationContinuationPrompts = /* @__PURE__ */ new WeakSet();
	/** Serializes daemon-owned config mutations so conditional Expert binds are atomic across windows. */
	sessionConfigMutationTails = /* @__PURE__ */ new Map();
	initialize(options) {
		this.createBackend = options.createBackend;
		this.recordStore = options.recordStore;
		this.runtimeConfigResolver = options.runtimeConfigResolver;
		this.userPromptComposer = options.userPromptComposer;
		this.userPromptComposerReady = options.userPromptComposer?.initialize();
		this.logger = options.logger;
		this.disabledToolsResolver = options.disabledToolsResolver;
		this.onBeforePrompt = options.onBeforePrompt;
		this.onAfterDelete = options.onAfterDelete;
		this.toolUsageObserver = options.toolUsageObserver;
		this.usageCacheService = options.usageCacheService;
		if (options.runtimeReclaim) this.startRuntimeReclaimJanitor(options.runtimeReclaim);
		this.reportTelemetry = options.reportTelemetry;
		this.getCurrentUserId = options.getCurrentUserId;
		this.noResponseWatchdogConfig = options.noResponseWatchdog;
		this.poiQuestionRegistry = options.poiQuestionRegistry;
		this.pluginRecommendationRegistry = options.pluginRecommendationRegistry;
		this.cancelPluginRecommendationConnector = options.cancelPluginRecommendationConnector;
		this.pluginRecommendationTelemetryReporter = options.pluginRecommendationTelemetryReporter;
		this.pluginRecommendationRegistry?.setLifecycleSink((event) => {
			if (event.kind === "settled") this.cancelPendingRecommendationConnectors(event.request);
			const session = this.sessions.get(event.sessionId);
			if (!session) return;
			if (event.kind === "settled") {
				this.settleInputRequest(session, {
					kind: "tool",
					toolCallId: event.requestId
				});
				this.syncPendingInputStateAfterMutation(session);
				return;
			}
			this.replacePluginRecommendationElicitation(session, event.requestId, event.request);
		});
	}
	cancelPendingRecommendationConnectors(request) {
		if (request.type !== "connector" || !this.cancelPluginRecommendationConnector) return;
		for (const plugin of request.plugins) {
			if (plugin.status !== "connecting") continue;
			this.cancelPluginRecommendationConnector(plugin.pluginId).catch((error) => {
				this.logger?.warn?.("[plugin-recommendation] failed to cancel connector", {
					configId: plugin.pluginId,
					error: error instanceof Error ? error.message : String(error)
				});
			});
		}
	}
	setEventSink(sink) {
		this.pushEvent = sink;
	}
	async createSession(opts) {
		const session = await this.startSession(opts, "new");
		await this.emitSessionRecordUpsert(session.sessionId);
		return this.toSessionInfo(session);
	}
	async resumeSession(sessionId, cwd) {
		const session = await this.resumeInactiveSessionState(sessionId, cwd);
		return this.toSessionInfo(session);
	}
	async loadSession(sessionId, cwd, options) {
		const active = this.sessions.get(sessionId);
		if (!active) {
			const session = await this.loadInactiveSessionState(sessionId, cwd);
			return {
				...this.toSessionInfo(session),
				rendererHistoryReplayComplete: true
			};
		}
		const isLiveTurnActive = active.isProcessing === true || active.promptInvocationActive === true;
		let rendererHistoryReplayComplete = false;
		if (options?.forceRendererHistoryReplay && !isLiveTurnActive) {
			this.emitStoredSessionHistory(active);
			this.emitPendingInputs(active);
			rendererHistoryReplayComplete = true;
		} else if (options?.forceRendererHistoryReplay && isLiveTurnActive) {
			this.logDiagnostic("info", "[SessionManager] loadSession: partial history replay (live turn active)", {
				sessionId,
				isProcessing: active.isProcessing,
				promptInvocationActive: active.promptInvocationActive
			});
			this.emitStoredSessionHistoryLiveSafe(active);
			this.emitPendingInputs(active);
		} else this.emitStoredSessionControlState(active);
		return {
			...this.toSessionInfo(active),
			rendererHistoryReplayComplete
		};
	}
	async primeSessionReplay(sessionId, replayEvents, cwd, expectedHistoryStoreGeneration) {
		if (expectedHistoryStoreGeneration !== void 0 && expectedHistoryStoreGeneration !== this.getHistoryStoreGeneration(sessionId)) return;
		if (this.sessions.get(sessionId)) {
			await this.replaceSessionReplay(sessionId, replayEvents, cwd, expectedHistoryStoreGeneration);
			return;
		}
		const nextEvents = replayEvents.map((event) => cloneSessionPayload(event));
		this.primedReplayStates.set(sessionId, {
			cwd: normalizeCwdPath(cwd),
			events: nextEvents
		});
	}
	async replaceSessionReplay(sessionId, replayEvents, cwd, expectedHistoryStoreGeneration) {
		if (expectedHistoryStoreGeneration !== void 0 && expectedHistoryStoreGeneration !== this.getHistoryStoreGeneration(sessionId)) return;
		const active = this.sessions.get(sessionId);
		if (!active) {
			await this.primeSessionReplay(sessionId, replayEvents, cwd, expectedHistoryStoreGeneration);
			return;
		}
		this.replaceSessionReplayState(active, replayEvents, cwd);
		this.primedReplayStates.delete(sessionId);
	}
	replaceSessionReplayState(active, replayEvents, cwd) {
		const sessionId = active.sessionId;
		const normalizedCwd = normalizeCwdPath(cwd);
		if (normalizedCwd) active.cwd = normalizedCwd;
		const liveTail = active.ownerHistoryHydrated ? [] : active.eventHistory.filter((event) => getOwnerHistoryMode(event) !== "history").map((event) => cloneSessionPayload(event));
		const liveTaskState = { ...active.taskState };
		const livePendingPermissionRequests = new Map(active.pendingPermissionRequests);
		const livePendingQuestionRequests = new Map(active.pendingQuestionRequests);
		const livePendingElicitationRequests = new Map(active.pendingElicitationRequests);
		const preserveLiveControlState = active.isProcessing || active.stopRequested || livePendingPermissionRequests.size > 0 || livePendingQuestionRequests.size > 0 || livePendingElicitationRequests.size > 0;
		active.eventHistory = [];
		active.hasUserMessageSinceLastCompact = false;
		active.planSnapshot = void 0;
		active.toolResults.clear();
		active.pendingPermissionRequests.clear();
		active.pendingQuestionRequests.clear();
		active.pendingElicitationRequests.clear();
		const preReplayTaskState = { ...active.taskState };
		for (const replayEvent of replayEvents) this.hydrateSessionReplayPayload(active, replayEvent, "history");
		for (const liveEvent of liveTail) this.hydrateSessionReplayPayload(active, liveEvent, "live");
		if (preserveLiveControlState) {
			active.taskState = liveTaskState;
			active.pendingPermissionRequests.clear();
			active.pendingQuestionRequests.clear();
			active.pendingElicitationRequests.clear();
			for (const [requestId, pending] of livePendingPermissionRequests) active.pendingPermissionRequests.set(requestId, pending);
			for (const [toolCallId, pending] of livePendingQuestionRequests) active.pendingQuestionRequests.set(toolCallId, pending);
			for (const [elicitationId, pending] of livePendingElicitationRequests) active.pendingElicitationRequests.set(elicitationId, pending);
		} else if (isTaskTerminal(preReplayTaskState) && !isTaskTerminal(active.taskState)) {
			const previousStatus = deriveTaskStatus(preReplayTaskState);
			this.logDiagnostic("warn", `[SessionManager] replaceSessionReplay: replay reverted terminal status '${previousStatus}' to '${deriveTaskStatus(active.taskState)}' for session ${sessionId}, restoring terminal state`);
			active.taskState = { ...preReplayTaskState };
			active.pendingPermissionRequests.clear();
			active.pendingQuestionRequests.clear();
			active.pendingElicitationRequests.clear();
		}
		active.ownerHistoryHydrated = true;
	}
	getHistoryStoreGeneration(sessionId) {
		return sessionId ? this.historySessionGenerations.get(sessionId) ?? this.historyOwnerGeneration : this.historyOwnerGeneration;
	}
	invalidateStoredSessionHistory(sessionId) {
		this.historyStoreGeneration += 1;
		this.historySessionGenerations.set(sessionId, this.historyStoreGeneration);
		this.primedReplayStates.delete(sessionId);
		const active = this.sessions.get(sessionId);
		if (!active) return;
		active.ownerHistoryHydrated = false;
		active.eventHistory = [];
		active.hasUserMessageSinceLastCompact = false;
		active.bufferedScopedEventsDuringHistoryHydration = [];
		active.planSnapshot = void 0;
		active.toolResults.clear();
		active.pendingPermissionRequests.clear();
		active.pendingQuestionRequests.clear();
		active.pendingElicitationRequests.clear();
		this.syncPendingInputStateAfterMutation(active);
	}
	replayStoredSessionHistory(sessionId) {
		const active = this.sessions.get(sessionId);
		if (active?.ownerHistoryHydrated) {
			if (active.isProcessing === true || active.promptInvocationActive === true) {
				this.logDiagnostic("info", "[SessionManager] replayStoredSessionHistory: partial (live turn active)", {
					sessionId,
					isProcessing: active.isProcessing,
					promptInvocationActive: active.promptInvocationActive
				});
				this.emitStoredSessionHistoryLiveSafe(active);
				return {
					replayed: true,
					complete: false
				};
			}
			this.emitStoredSessionHistory(active);
			return {
				replayed: true,
				complete: true
			};
		}
		const primed = this.primedReplayStates.get(sessionId);
		if (!primed) return {
			replayed: false,
			complete: false
		};
		for (const payload of primed.events.map((event) => cloneSessionPayload(event))) this.emitScoped(sessionId, normalizeOwnerHistoryReplayPayload(payload));
		return {
			replayed: true,
			complete: true
		};
	}
	hasStoredSessionHistory(sessionId) {
		return this.sessions.get(sessionId)?.ownerHistoryHydrated === true || this.primedReplayStates.has(sessionId);
	}
	async replayPendingInputs(sessionId) {
		const session = await this.resolveReadySession(sessionId);
		this.emitPendingInputs(session);
	}
	replayActivePendingInputs(sessionId) {
		const session = this.sessions.get(sessionId);
		if (!session) return false;
		this.emitPendingInputs(session);
		return true;
	}
	async destroySession(sessionId) {
		this.releasePluginRecommendationContinuation(sessionId);
		this.pluginRecommendationRegistry?.cancelSession(sessionId, "session closed");
		let session = this.sessions.get(sessionId);
		if (!session) {
			await this.pendingSessionRestores.get(sessionId)?.promise.catch(() => void 0);
			session = this.sessions.get(sessionId);
		}
		if (!session) return;
		await this.disposeActiveSession(sessionId, session);
	}
	deleteSession(sessionId) {
		const pending = this.pendingSessionDeletes.get(sessionId);
		if (pending) return pending;
		const deletion = this.performDeleteSession(sessionId).finally(() => {
			if (this.pendingSessionDeletes.get(sessionId) === deletion) this.pendingSessionDeletes.delete(sessionId);
		});
		this.pendingSessionDeletes.set(sessionId, deletion);
		return deletion;
	}
	deleteSessionWithLifecycle(sessionId, lifecycle) {
		const pending = this.pendingSessionDeleteTransactions.get(sessionId);
		if (pending) return pending;
		let committed = false;
		const transaction = (async () => {
			try {
				if ((await lifecycle.beforeDelete?.() ?? "continue") === "cancelled") {
					await lifecycle.abortDelete?.();
					return "cancelled";
				}
				await this.deleteSession(sessionId);
				committed = true;
				try {
					await lifecycle.afterDelete?.();
				} catch (error) {
					this.logDiagnostic("error", "[SessionManager] deleteSession afterDelete failed", {
						sessionId,
						error: error instanceof Error ? error.message : String(error)
					});
				}
				return "deleted";
			} catch (error) {
				if (!committed) await lifecycle.abortDelete?.();
				throw error;
			}
		})().finally(() => {
			if (this.pendingSessionDeleteTransactions.get(sessionId) === transaction) this.pendingSessionDeleteTransactions.delete(sessionId);
		});
		this.pendingSessionDeleteTransactions.set(sessionId, transaction);
		return transaction;
	}
	async performDeleteSession(sessionId) {
		this.deletedSessionIds.add(sessionId);
		this.bumpSessionLifecycleGeneration(sessionId);
		this.pendingSessionRestores.delete(sessionId);
		this.invalidateStoredSessionHistory(sessionId);
		const session = this.sessions.get(sessionId);
		if (session) await this.disposeActiveSession(sessionId, session, { preserveHistory: false });
		this.primedReplayStates.delete(sessionId);
		this.runtimeSandboxOverrides.delete(sessionId);
		await this.onAfterDelete?.(sessionId).catch(() => {});
		const deletedKeyPrefix = `${sessionId}::`;
		for (const key of this.liveEmittedSyntheticUserPromptKeys) if (key.startsWith(deletedKeyPrefix)) this.liveEmittedSyntheticUserPromptKeys.delete(key);
		if (this.recordStore?.deleteSession) await this.recordStore.deleteSession(sessionId).catch(() => {});
		if (this.usageCacheService) await this.usageCacheService.purge(sessionId).catch(() => {});
	}
	async disposeActiveSession(sessionId, session, options) {
		const pending = this.pendingSessionDisposals.get(sessionId);
		if (pending) {
			await pending;
			return;
		}
		const preserveHistory = options?.preserveHistory !== false;
		const historyGeneration = this.getHistoryStoreGeneration(sessionId);
		this.sessions.delete(sessionId);
		require_workbuddy_auth_product_coordinator.unregisterSessionDeferredBuiltinPolicy(sessionId);
		this.pendingSessionRestores.delete(sessionId);
		this.runtimeReclaimEligibleSince.delete(sessionId);
		this.runtimeReclaimingSessions.delete(sessionId);
		session.disposing = true;
		const disposal = (async () => {
			await this.cancelBeforeDestroy(session).catch((error) => {
				console.warn("[SessionManager] disposeActiveSession: cancel before destroy failed:", error);
			});
			await this.flushSessionEffects(sessionId).catch((error) => {
				console.warn("[SessionManager] disposeActiveSession: flush effects failed:", error);
			});
			await this.awaitPendingBackendRestart(session, "disposeActiveSession").catch((error) => {
				console.warn("[SessionManager] disposeActiveSession: await backend restart failed:", error);
			});
			this.sessionEffectChains.delete(sessionId);
			this.clearSidebarMetaDebounce(sessionId);
			if (session.historyHydrationFallbackHandle) {
				clearTimeout(session.historyHydrationFallbackHandle);
				session.historyHydrationFallbackHandle = void 0;
			}
			session.noResponseWatchdog?.stop();
			await session.backend.destroy().catch(() => {});
			if (preserveHistory && session.ownerHistoryHydrated && this.getHistoryStoreGeneration(sessionId) === historyGeneration && !this.sessions.has(sessionId) && !this.primedReplayStates.has(sessionId)) this.primedReplayStates.set(sessionId, {
				cwd: normalizeCwdPath(session.cwd),
				events: session.eventHistory.map((event) => cloneSessionPayload(event))
			});
		})();
		this.pendingSessionDisposals.set(sessionId, disposal);
		try {
			await disposal;
		} finally {
			if (this.pendingSessionDisposals.get(sessionId) === disposal) this.pendingSessionDisposals.delete(sessionId);
		}
	}
	shouldProtectSessionFromDelete(session) {
		const { runState } = session.taskState;
		if (runState === "running" || runState === "awaiting_input" || runState === "stopping") return true;
		if (session.isProcessing || session.stopRequested) return true;
		if (session.pendingPermissionRequests.size > 0 || session.pendingQuestionRequests.size > 0 || session.pendingElicitationRequests.size > 0) return true;
		return this.hasUnsettledTeamRuntime(session);
	}
	async reclaimInactiveSessions(options = {}) {
		if (this.runtimeReclaimPromise) return this.runtimeReclaimPromise;
		const promise = this.runInactiveSessionReclaim(options).finally(() => {
			if (this.runtimeReclaimPromise === promise) this.runtimeReclaimPromise = null;
		});
		this.runtimeReclaimPromise = promise;
		return promise;
	}
	startRuntimeReclaimJanitor(options = {}) {
		this.stopRuntimeReclaimJanitor();
		this.runtimeReclaimJanitorOptions = { ...options };
		const sweepIntervalMs = resolveRuntimeReclaimSweepIntervalMs(options.sweepIntervalMs);
		if (!Number.isFinite(sweepIntervalMs)) return;
		const runSweep = () => {
			this.reclaimInactiveSessions(this.runtimeReclaimJanitorOptions).catch((error) => {
				this.logDiagnostic("warn", "[SessionManager] runtime reclaim janitor failed", error);
			});
		};
		this.runtimeReclaimJanitorTimer = setInterval(runSweep, sweepIntervalMs);
		this.runtimeReclaimJanitorTimer.unref?.();
		runSweep();
	}
	stopRuntimeReclaimJanitor() {
		if (this.runtimeReclaimJanitorTimer) {
			clearInterval(this.runtimeReclaimJanitorTimer);
			this.runtimeReclaimJanitorTimer = void 0;
		}
		this.runtimeReclaimJanitorOptions = void 0;
	}
	async runInactiveSessionReclaim(options) {
		const now = Date.now();
		const idleTimeoutMs = resolveRuntimeReclaimIdleTimeoutMs(options.idleTimeoutMs);
		const maxActiveSessions = resolveRuntimeReclaimMaxActiveSessions(options.maxActiveSessions);
		const activeSessionIds = new Set(this.sessions.keys());
		const eligibleCandidates = [];
		let ignoredCount = 0;
		let protectedCount = 0;
		let activeManagedSessionCount = 0;
		for (const sessionId of this.runtimeReclaimEligibleSince.keys()) if (!activeSessionIds.has(sessionId)) this.runtimeReclaimEligibleSince.delete(sessionId);
		for (const session of this.sessions.values()) {
			if (this.runtimeReclaimingSessions.has(session.sessionId)) continue;
			const sessionInfo = this.toSessionInfo(session);
			if (options.isSessionIgnored?.(sessionInfo)) {
				this.runtimeReclaimEligibleSince.delete(session.sessionId);
				ignoredCount += 1;
				continue;
			}
			activeManagedSessionCount += 1;
			if (this.shouldProtectSessionFromRuntimeReclaim(session)) {
				this.runtimeReclaimEligibleSince.delete(session.sessionId);
				protectedCount += 1;
				continue;
			}
			const eligibleSince = this.runtimeReclaimEligibleSince.get(session.sessionId) ?? now;
			this.runtimeReclaimEligibleSince.set(session.sessionId, eligibleSince);
			eligibleCandidates.push({
				session,
				eligibleSince
			});
		}
		eligibleCandidates.sort((left, right) => left.eligibleSince - right.eligibleSince);
		const willTriggerOverflow = Number.isFinite(maxActiveSessions) && activeManagedSessionCount > maxActiveSessions;
		if (willTriggerOverflow) this.logDiagnostic("debug", "[SessionManager] runtime reclaim decision", {
			totalSessions: this.sessions.size,
			activeManagedSessionCount,
			ignoredCount,
			protectedCount,
			eligibleCount: eligibleCandidates.length,
			maxActiveSessions,
			idleTimeoutMs,
			willTriggerOverflow
		});
		const reclaimed = [];
		const destroyedThisSweep = /* @__PURE__ */ new Set();
		if (willTriggerOverflow) {
			let overflow = activeManagedSessionCount - maxActiveSessions;
			for (const candidate of eligibleCandidates) {
				if (overflow <= 0) break;
				const reclaimedSession = await this.reclaimRuntimeSession(candidate.session, "max_active_sessions");
				if (reclaimedSession) {
					reclaimed.push(reclaimedSession);
					destroyedThisSweep.add(candidate.session.sessionId);
					overflow -= 1;
				}
			}
		}
		if (Number.isFinite(idleTimeoutMs) && idleTimeoutMs > 0) for (const candidate of eligibleCandidates) {
			if (destroyedThisSweep.has(candidate.session.sessionId)) continue;
			if (this.runtimeReclaimingSessions.has(candidate.session.sessionId)) continue;
			if (now - candidate.eligibleSince < idleTimeoutMs) continue;
			const reclaimedSession = await this.reclaimRuntimeSession(candidate.session, "background_idle_timeout");
			if (reclaimedSession) {
				reclaimed.push(reclaimedSession);
				destroyedThisSweep.add(candidate.session.sessionId);
			}
		}
		return {
			totalSessions: this.sessions.size,
			activeManagedSessionCount,
			ignoredCount,
			protectedCount,
			eligibleCount: eligibleCandidates.length,
			reclaimed
		};
	}
	shouldProtectSessionFromRuntimeReclaim(session) {
		if (!isTaskTerminal(session.taskState)) return true;
		if (this.shouldProtectSessionFromDelete(session)) return true;
		if (this.hasActiveToolCall(session)) return true;
		return false;
	}
	async reclaimRuntimeSession(session, reason) {
		const sessionId = session.sessionId;
		if (this.runtimeReclaimingSessions.has(sessionId)) return null;
		this.runtimeReclaimingSessions.add(sessionId);
		this.runtimeReclaimEligibleSince.delete(sessionId);
		const status = deriveTaskStatus(session.taskState);
		this.logDiagnostic("warn", "[SessionManager] reclaiming inactive runtime", {
			sessionId,
			status,
			reason
		});
		try {
			session.pendingPromptCancelCause = "runtime_reclaim";
			await this.destroySession(sessionId);
			return {
				sessionId,
				status,
				reason
			};
		} catch (error) {
			this.logDiagnostic("warn", "[SessionManager] failed to reclaim inactive runtime", {
				sessionId,
				status,
				reason,
				error: error instanceof Error ? error.message : String(error)
			});
			return null;
		} finally {
			this.runtimeReclaimingSessions.delete(sessionId);
		}
	}
	/**
	* If the session is actively processing a prompt, cancel it gracefully and
	* wait (with timeout) for prompt() to complete. This prevents "disconnected"
	* errors from surfacing to the user when destroy/delete is called on a busy session.
	*/
	async cancelBeforeDestroy(session, cause = "session_teardown") {
		if (!session.isProcessing) return;
		if (session.pendingPromptCancelCause === void 0) session.pendingPromptCancelCause = cause;
		this.requestProcessingStop(session);
		await session.backend.cancel().catch(() => {});
		await this.waitForProcessingEnd(session, 5e3);
	}
	/**
	* Wait for session.isProcessing to become false, with a hard timeout.
	* If the timeout elapses the caller will proceed with destroy regardless.
	*/
	waitForProcessingEnd(session, timeoutMs) {
		if (!session.isProcessing) return Promise.resolve();
		return new Promise((resolve) => {
			const start = Date.now();
			const check = () => {
				if (!session.isProcessing || Date.now() - start >= timeoutMs) {
					resolve();
					return;
				}
				setTimeout(check, 100);
			};
			check();
		});
	}
	hasSession(sessionId) {
		return this.sessions.has(sessionId);
	}
	/**
	* Invalidate captured event history plus replay-derived plan, tool, and
	* pending-input owner state for all active sessions.
	*
	* Called on account switch (different user login) so that stale owner state
	* (e.g. an orphaned pending AskUserQuestion) from the previous user cannot
	* be replayed while the new sidecar is being established. The next cold
	* repair repopulates the correct state.
	*/
	invalidateAllSessionHistory() {
		this.historyStoreGeneration += 1;
		this.historyOwnerGeneration = this.historyStoreGeneration;
		this.historySessionGenerations.clear();
		this.primedReplayStates.clear();
		for (const session of this.sessions.values()) {
			this.pluginRecommendationRegistry?.cancelSession(session.sessionId, "session history invalidated");
			session.eventHistory = [];
			session.ownerHistoryHydrated = false;
			session.hasUserMessageSinceLastCompact = false;
			session.bufferedScopedEventsDuringHistoryHydration = [];
			session.planSnapshot = void 0;
			session.toolResults.clear();
			session.pendingPermissionRequests.clear();
			session.pendingQuestionRequests.clear();
			session.pendingElicitationRequests.clear();
			session.pendingPluginRecommendations.clear();
		}
	}
	async listSessions(opts) {
		const all = [...this.sessions.values()];
		return (opts?.projectId !== void 0 ? all.filter((session) => session.projectId === opts.projectId) : all).map((session) => this.toSessionInfo(session));
	}
	/**
	* Returns sessions that are currently running or awaiting user input.
	*
	* "Active" 的精确定义基于 `taskState.runState`（而非 derived status），
	* 这样可以避免把"新建但从未运行"的 session 误判为 pending：
	*   - runState === 'running'：agent turn 正在 sidecar 中执行（planning / working）
	*   - runState === 'awaiting_input'：等待用户输入（permission / AskUserQuestion）
	*   - runState === 'stopping'：用户已请求停止但 sidecar 还在收尾
	*
	* 不计入 active 的状态：
	*   - 'idle'：从未运行 / 已 idle（含 turnSeq=0 的 derived 'pending'）
	*   - 'errored' / 'terminated'：已结束
	*
	* Used by the desktop host `before-quit` hook to decide whether to prompt
	* the user with "tasks in progress, confirm quit?" before shutdown.
	*/
	async getActiveSessions() {
		return (await this.listSessions()).filter((info) => {
			const session = this.sessions.get(info.sessionId);
			if (!session) return false;
			const { runState } = session.taskState;
			return runState === "running" || runState === "awaiting_input" || runState === "stopping";
		});
	}
	getSession(sessionId) {
		const session = this.sessions.get(sessionId);
		return session ? this.toSessionViewState(session) : void 0;
	}
	/**
	* 向现有会话补一条 synthetic assistant 文本，用于把运行时已知的失败原因
	* 回写到 transcript 中。
	*
	* 典型场景：自动化已创建会话并落了首条 user prompt，但在首个 assistant chunk
	* 之前超时/失败，此时真实 transcript 里只剩 prompt。调用方可用此方法补一条
	* "Run timed out" 之类的终态消息，让后续打开会话时不至于只有用户消息。
	*/
	appendSyntheticAssistantMessage(sessionId, text, extraMeta) {
		const session = this.sessions.get(sessionId);
		const normalizedText = typeof text === "string" ? text.trim() : "";
		if (!session || !normalizedText) return false;
		const messageId = (0, node_crypto.randomUUID)();
		const payload = {
			sessionId,
			update: {
				sessionUpdate: "agent_message_chunk",
				content: {
					type: "text",
					text: normalizedText
				},
				messageId
			},
			_meta: { "codebuddy.ai": {
				...extraMeta ?? {},
				messageId,
				syntheticOwnerHistory: true,
				mode: "stream"
			} }
		};
		this.hydrateSessionReplayPayload(session, payload, "live");
		this.emitOrBufferScopedEvent(session, payload);
		this.pushEvent("session:event", payload);
		return true;
	}
	/**
	* 返回 session 内按 toolCallId 索引的工具调用结果快照（浅拷贝 Map）。
	*
	* 用于 "需要从工具结果里拿结构化字段" 的场景（如 image_gen.images）。
	*
	* 返回新 Map 而不是直接暴露内部 Map，避免外部写入污染 SessionState。
	* entry 的字段与 ACP tool_call_update 对齐，不做额外 DTO 封装。
	*/
	getSessionToolResults(sessionId) {
		const session = this.sessions.get(sessionId);
		if (!session) return;
		return new Map(session.toolResults);
	}
	/**
	* 按 toolName 过滤查询工具结果。多条匹配时返回按 updatedAt 降序的数组。
	* 方便消费者一次拿到"最新一次某工具调用"的结果。
	*/
	getLatestToolResultByName(sessionId, toolName) {
		const session = this.sessions.get(sessionId);
		if (!session) return;
		let latest;
		for (const entry of session.toolResults.values()) {
			if (entry.toolName !== toolName) continue;
			if (!latest || entry.updatedAt > latest.updatedAt) latest = entry;
		}
		return latest;
	}
	/**
	* 拦截 tool_call / tool_call_update 事件，按 toolCallId 聚合到 session.toolResults。
	*
	* 协议参考：packages/agent-cli/src/node/utils/acp-utils.ts::convertInputItemToAcp
	* - tool_call 事件带 rawInput、title（工具名可能在 title、_meta、或 update.toolName）
	* - tool_call_update 事件带 status、content、rawOutput
	* - _meta['codebuddy.ai/toolName'] 是 agent-cli 约定的 canonical 工具名位置
	*
	* 所有字段都兼容地读——agent-cli 未来若新增字段不会影响兼容性。
	*/
	captureToolResultFromUpdate(session, notification) {
		const update = notification.update;
		if (!update) return;
		const sessionUpdate = update.sessionUpdate;
		if (sessionUpdate !== "tool_call" && sessionUpdate !== "tool_call_update") return;
		const toolCallId = typeof update.toolCallId === "string" ? update.toolCallId : void 0;
		if (!toolCallId) return;
		const prev = session.toolResults.get(toolCallId);
		const now = Date.now();
		const meta = update._meta;
		const metaToolName = typeof meta?.["codebuddy.ai/toolName"] === "string" ? meta["codebuddy.ai/toolName"] : void 0;
		const directToolName = typeof update.toolName === "string" ? update.toolName : void 0;
		const titleName = typeof update.title === "string" ? update.title : void 0;
		const toolName = metaToolName ?? directToolName ?? titleName ?? prev?.toolName;
		const status = typeof update.status === "string" ? update.status : prev?.status;
		const rawInput = update.rawInput !== void 0 ? update.rawInput : prev?.rawInput;
		const entry = {
			toolCallId,
			toolName,
			status,
			rawInput,
			rawOutput: update.rawOutput !== void 0 ? update.rawOutput : prev?.rawOutput,
			meta: meta ? {
				...prev?.meta ?? {},
				...meta
			} : prev?.meta,
			updatedAt: now
		};
		session.toolResults.set(toolCallId, entry);
		if (toolName === "suggest_plugin_install" && isTerminalToolCallStatus(status) && !this.pluginRecommendationRunSwitches.has(session.sessionId)) this.pluginRecommendationRegistry?.cancelRequest(session.sessionId, toolCallId, "the recommendation tool finished");
		if (this.toolUsageObserver) try {
			this.toolUsageObserver.observe({
				sessionId: session.sessionId,
				toolCallId,
				toolName,
				status,
				rawInput,
				sourceMode: readSessionSourceMode(session._meta),
				isBackgroundAutomation: readIsBackgroundAutomation(session._meta),
				occurredAt: now
			});
		} catch (err) {
			this.logger?.warn?.("toolUsageObserver.observe threw", {
				sessionId: session.sessionId,
				toolCallId,
				error: String(err)
			});
		}
	}
	async rememberSessionCwd(sessionId, cwd) {
		const normalized = normalizeCwdPath(cwd) ?? "";
		if (!normalized || !this.recordStore) return;
		const active = this.sessions.get(sessionId);
		if (active) {
			if (active.cwd === normalized) return;
			active.cwd = normalized;
			await this.upsertSessionRecord(sessionId, (current) => ({
				...current,
				cwd: normalized,
				updatedAt: Date.now()
			}));
			await this.emitSessionRecordUpsert(sessionId);
			return;
		}
		const current = await this.resolveStoredEntry(sessionId);
		if (current?.cwd === normalized) return;
		const now = Date.now();
		await this.recordStore.upsertSession({
			...current ?? {
				id: sessionId,
				status: "pending",
				createdAt: now
			},
			cwd: normalized,
			updatedAt: now
		});
		await this.emitSessionRecordUpsert(sessionId);
	}
	async listSessionRecords(options) {
		const stored = this.recordStore ? (await Promise.all((await this.recordStore.listSessions(options)).map((record) => this.reconcileInactiveStoredEntry(record)))).filter((record) => !!record) : [];
		const isQueryingArchived = this.isArchivedSessionListQuery(options?.filters);
		const records = stored.map((record) => this.toSessionRecord(record)).filter((record) => {
			if (isQueryingArchived) return normalizeTaskStatus(record.status) === "archived";
			return normalizeTaskStatus(record.status) !== "archived";
		});
		const storedIds = new Set(stored.map((record) => record.id));
		for (const session of this.sessions.values()) {
			if (storedIds.has(session.sessionId)) continue;
			const activeRecord = await this.resolveActiveSessionRecordForList(session, options, isQueryingArchived);
			if (activeRecord) records.push(activeRecord);
		}
		return this.applySessionRecordListFilters(records, options, isQueryingArchived);
	}
	async resolveActiveSessionRecordForList(session, options, isQueryingArchived) {
		let record = null;
		if (this.recordStore) {
			const existingRecord = await this.reconcileInactiveStoredEntry(await this.recordStore.getSession(session.sessionId));
			if (existingRecord) {
				if (existingRecord.deletedAt && !options?.includeDeleted) return null;
				if (!this.isSessionRecordVisibleForUser(existingRecord, options?.userId)) return null;
				record = this.toSessionRecord(existingRecord);
			}
		}
		record ??= this.toEphemeralSessionRecord(session);
		if (!this.isSessionRecordVisibleForUser(record, options?.userId)) return null;
		const status = normalizeTaskStatus(record.status);
		if (isQueryingArchived) return status === "archived" ? record : null;
		return status === "archived" ? null : record;
	}
	isSessionRecordVisibleForUser(entry, userId) {
		if (!userId) return true;
		const storedUserId = typeof entry?.userId === "string" ? entry.userId.trim() : "";
		return !storedUserId || storedUserId === userId;
	}
	async getSessionRecord(sessionId) {
		const stored = this.recordStore ? await this.reconcileInactiveStoredEntry(await this.recordStore.getSession(sessionId)) : null;
		if (stored) return this.toSessionRecord(stored);
		const active = this.sessions.get(sessionId);
		return active ? this.toEphemeralSessionRecord(active) : null;
	}
	async archiveSession(sessionId) {
		const active = this.sessions.get(sessionId);
		if (active) {
			this.applyExplicitTaskStatus(active, "archived");
			await this.flushSessionEffects(sessionId);
		} else {
			await this.upsertSessionRecord(sessionId, (current) => ({
				...current,
				status: "archived",
				archivedAt: Date.now(),
				updatedAt: current.updatedAt
			}));
			await this.emitSessionRecordUpsert(sessionId);
		}
		return { id: sessionId };
	}
	async renameSession(sessionId, title) {
		const active = this.sessions.get(sessionId);
		if (active) await this.enqueueSessionEffect(active, async () => {
			await this.upsertSessionRecord(sessionId, (current) => ({
				...current,
				customTitle: title,
				updatedAt: Date.now()
			}));
		});
		else await this.upsertSessionRecord(sessionId, (current) => ({
			...current,
			customTitle: title,
			updatedAt: Date.now()
		}));
		await this.emitSessionRecordUpsert(sessionId);
		this.emitScoped(sessionId, {
			sessionId,
			update: {
				sessionUpdate: "topic_update",
				title
			}
		});
		return { id: sessionId };
	}
	async moveSession(sessionId) {
		const active = this.sessions.get(sessionId);
		if (active) active.isPlayground = false;
		await this.upsertSessionRecord(sessionId, (current) => ({
			...current,
			isPlayground: false,
			updatedAt: Date.now()
		}));
		await this.emitSessionRecordUpsert(sessionId);
		return { id: sessionId };
	}
	/**
	* 给已有 session 打上 projectId 标签，标识它归属某个项目。
	*
	* 主要场景：
	*   - 测试 fixture 快速准备项目内会话
	*   - 未来"把任务移入项目"UI 入口的底层 API（v1 不暴露 UI）
	*
	* 不用于老数据迁移——项目尚处在新开发阶段，不考虑旧版"项目本地任务"数据兼容。
	*
	* 行为：
	*   - 活跃 session（在内存中）：直接更新 SessionState.projectId，触发持久化重写
	*   - 仅持久化 session：直接 upsert 到 record store
	*   - 不存在的 session：抛错，避免静默失败导致项目视图错位
	*   - 幂等：projectId 与现状相同时直接 return（不抖 updatedAt）
	*/
	async tagSessionWithProjectId(sessionId, projectId) {
		if (!projectId || !projectId.trim()) throw new Error("tagSessionWithProjectId: projectId must be a non-empty string");
		const trimmed = projectId.trim();
		const active = this.sessions.get(sessionId);
		if (active) {
			if (active.projectId === trimmed) return { id: sessionId };
			active.projectId = trimmed;
			if (this.recordStore) {
				const existing = await this.recordStore.getSession(sessionId);
				if (existing) await this.recordStore.upsertSession({
					...existing,
					projectId: trimmed,
					updatedAt: Date.now()
				});
			}
			await this.emitSessionRecordUpsert(sessionId);
			return { id: sessionId };
		}
		if (!this.recordStore) throw new Error(`tagSessionWithProjectId: session not found and no record store: ${sessionId}`);
		const existing = await this.recordStore.getSession(sessionId);
		if (!existing) throw new Error(`tagSessionWithProjectId: session not found: ${sessionId}`);
		if (existing.projectId === trimmed) return { id: sessionId };
		await this.recordStore.upsertSession({
			...existing,
			projectId: trimmed,
			updatedAt: Date.now()
		});
		await this.emitSessionRecordUpsert(sessionId);
		return { id: sessionId };
	}
	/**
	* 移除 session 的 projectId 标签（解绑项目归属）。
	*
	* 主要用于回滚迁移或对称的 untag 操作。v1 不暴露 UI；幂等。
	*/
	async untagSessionProjectId(sessionId) {
		const active = this.sessions.get(sessionId);
		if (active) {
			if (active.projectId === void 0) return { id: sessionId };
			active.projectId = void 0;
			if (this.recordStore) {
				const existing = await this.recordStore.getSession(sessionId);
				if (existing && existing.projectId !== void 0) {
					const { projectId: _removed, ...rest } = existing;
					await this.recordStore.upsertSession({
						...rest,
						updatedAt: Date.now()
					});
				}
			}
			await this.emitSessionRecordUpsert(sessionId);
			return { id: sessionId };
		}
		if (!this.recordStore) throw new Error(`untagSessionProjectId: session not found and no record store: ${sessionId}`);
		const existing = await this.recordStore.getSession(sessionId);
		if (!existing) throw new Error(`untagSessionProjectId: session not found: ${sessionId}`);
		if (existing.projectId === void 0) return { id: sessionId };
		const { projectId: _removed, ...rest } = existing;
		await this.recordStore.upsertSession({
			...rest,
			updatedAt: Date.now()
		});
		await this.emitSessionRecordUpsert(sessionId);
		return { id: sessionId };
	}
	async updateSessionStatus(sessionId, status) {
		const active = this.sessions.get(sessionId);
		const normalizedStatus = normalizeTaskStatus(status);
		if (active) {
			this.applyExplicitTaskStatus(active, normalizedStatus);
			await this.flushSessionEffects(sessionId);
		} else {
			await this.upsertSessionRecord(sessionId, (current) => ({
				...current,
				status: normalizedStatus,
				updatedAt: Date.now()
			}));
			await this.emitSessionRecordUpsert(sessionId);
		}
		return { id: sessionId };
	}
	async updateSessionConfig(sessionId, patch, resumeCwd, options) {
		const effectivePatch = !Object.prototype.hasOwnProperty.call(patch, "useSandboxCLI") && Object.prototype.hasOwnProperty.call(patch, "sandboxDisabledReason") ? Object.fromEntries(Object.entries(patch).filter(([key]) => key !== "sandboxDisabledReason")) : patch;
		this.logDiagnostic("info", "[SessionManager] updateSessionConfig called", {
			sessionId,
			patchKeys: Object.keys(effectivePatch),
			patchModel: effectivePatch.model,
			patchPermissionMode: effectivePatch.permissionMode,
			patchUseSandboxCLI: effectivePatch.useSandboxCLI,
			hasResumeCwd: !!(resumeCwd && resumeCwd.trim().length > 0)
		});
		return this.enqueueSessionConfigMutation(sessionId, async () => {
			let configUpdateApplied = true;
			const hasExpertPrecondition = Object.prototype.hasOwnProperty.call(options ?? {}, "expectedExpertId");
			const expectedExpertId = options?.expectedExpertId?.trim() || null;
			const updatedSession = await this.withReadySession(sessionId, async (session) => {
				if (hasExpertPrecondition && (session.desiredConfig.expertId?.trim() || null) !== expectedExpertId) {
					configUpdateApplied = false;
					return session;
				}
				options?.onPreconditionMatched?.();
				if (Object.keys(effectivePatch).length === 0) return session;
				const nextDesiredConfig = {
					...session.desiredConfig,
					...effectivePatch
				};
				if (Object.prototype.hasOwnProperty.call(effectivePatch, "useSandboxCLI")) nextDesiredConfig.sandboxDisabledReason = effectivePatch.useSandboxCLI === false ? effectivePatch.sandboxDisabledReason : void 0;
				await this.applyDesiredConfig(session, nextDesiredConfig, effectivePatch);
				return session;
			}, resumeCwd, { skipAwaitRestart: true });
			if (configUpdateApplied && typeof effectivePatch.useSandboxCLI === "boolean") this.runtimeSandboxOverrides.set(sessionId, {
				enabled: updatedSession.desiredConfig.useSandboxCLI === true,
				disabledReason: updatedSession.desiredConfig.sandboxDisabledReason
			});
			const info = this.toSessionInfo(updatedSession);
			return hasExpertPrecondition ? {
				...info,
				configUpdateApplied
			} : info;
		});
	}
	enqueueSessionConfigMutation(sessionId, operation) {
		const result = (this.sessionConfigMutationTails.get(sessionId) ?? Promise.resolve()).then(operation);
		const nextTail = result.then(() => void 0, () => void 0);
		this.sessionConfigMutationTails.set(sessionId, nextTail);
		nextTail.finally(() => {
			if (this.sessionConfigMutationTails.get(sessionId) === nextTail) this.sessionConfigMutationTails.delete(sessionId);
		});
		return result;
	}
	async prompt(sessionId, prompt, _meta) {
		if (!this.pluginRecommendationContinuationPrompts.delete(prompt)) await this.waitForPluginRecommendationContinuation(sessionId);
		const activeBeforePrompt = this.sessions.get(sessionId);
		const isClearSessionInjection = readCodebuddyMeta(_meta)?.isClearSession === true;
		const isCompactSessionPrompt = readCodebuddyMeta(_meta)?.isCompactSession === true;
		if (isCompactSessionPrompt && activeBeforePrompt?.justInsertedSeparator) {
			this.logDiagnostic("info", "[SessionManager] compact after separator: nothing to compress, skipping");
			activeBeforePrompt.justInsertedSeparator = false;
			return { stopReason: "end_turn" };
		}
		if (activeBeforePrompt) activeBeforePrompt.pendingPromptCancelCause = void 0;
		const resetTeamRuntimeBeforePrompt = !!activeBeforePrompt && !activeBeforePrompt.isProcessing;
		if (resetTeamRuntimeBeforePrompt && activeBeforePrompt) this.resetTeamRuntimeForNewTurn(activeBeforePrompt);
		try {
			const result = await this.withReadySession(sessionId, async (session) => {
				session.hasReceivedBackendActivity = false;
				if (session.pendingPermissionRequests.size > 0 || session.pendingQuestionRequests.size > 0 || session.pendingElicitationRequests.size > 0) {
					this.logDiagnostic("warn", "[SessionManager] prompt: cleaning stale input requests", {
						sessionId: session.sessionId,
						stalePermissions: session.pendingPermissionRequests.size,
						staleQuestions: session.pendingQuestionRequests.size,
						staleElicitations: session.pendingElicitationRequests.size
					});
					this.settleInputRequest(session, { kind: "all" });
					this.syncPendingInputStateAfterMutation(session);
				}
				if (!resetTeamRuntimeBeforePrompt) this.resetTeamRuntimeForNewTurn(session);
				const promptExpertSelection = toExpertSelectionIdentity(session.desiredConfig);
				const backendPrompt = await this.composePromptForBackend(session, prompt, _meta);
				this.recordSyntheticUserPromptEvent(session, prompt, _meta);
				const backend = await this.resolveBackendForPromptSend(session);
				session.promptInvocationActive = true;
				const wdMeta = readCodebuddyMeta(_meta);
				session.promptStartedAt = Date.now();
				session.promptTraceId = typeof wdMeta?.traceId === "string" ? wdMeta.traceId : void 0;
				session.promptRequestId = typeof wdMeta?.requestId === "string" ? wdMeta.requestId : void 0;
				session.stateTransitionLog = [];
				session.hasReceivedBackendActivity = false;
				session.lastSignalReceivedAt = void 0;
				session.awaitingInputStartedAt = void 0;
				session.hasPendingInput = false;
				this.startNoResponseWatchdog(session);
				this.onProcessingStarted(session);
				if (!isClearSessionInjection) this.applyTaskSignal(session, { type: "turn_started" });
				await this.flushSessionEffects(session.sessionId);
				session.lastBackendActivityAt = Date.now();
				const isAutomationBg = (_meta?.["codebuddy.ai"])?.isAutomationBackground;
				let accumulatedAssistantText = "";
				let sawCompactInternalEvent = false;
				let sawCompactInternalOutput = false;
				const toolCallMap = /* @__PURE__ */ new Map();
				const originalOnSessionUpdate = backend.onSessionUpdate;
				backend.onSessionUpdate = (notification) => {
					const update = notification?.update ?? notification;
					const updateType = update?.sessionUpdate;
					const isCompactInternal = isCompactInternalEventPayload(notification);
					if (isCompactInternal) sawCompactInternalEvent = true;
					if (updateType === "agent_message_chunk") if (isCompactInternal) sawCompactInternalOutput = true;
					else {
						const text = extractTextFromContentBlocks(update?.content);
						if (text) accumulatedAssistantText += text;
					}
					if (isAutomationBg) {
						if (updateType === "tool_call" || updateType === "tool_call_update") {
							const id = update?.toolCallId;
							if (id) {
								const existing = toolCallMap.get(id) || {};
								if (update?.title) existing.title = update.title;
								if (update?.kind) existing.kind = update.kind;
								if (update?.status) existing.status = update.status;
								if (update?.rawOutput !== void 0) existing.rawOutput = update.rawOutput;
								toolCallMap.set(id, existing);
							}
						}
					}
					originalOnSessionUpdate?.(notification);
				};
				try {
					const promptResponse = await backend.prompt({
						prompt: backendPrompt,
						_meta
					});
					if (Array.isArray(prompt) && prompt.length > 0) if (sawCompactInternalEvent) await this.flushSessionEffects(session.sessionId);
					else {
						session.lastUserPromptExpertSelection = promptExpertSelection;
						await this.flushSessionEffects(session.sessionId);
						await this.persistLastUserPromptExpertSelection(session);
					}
					if (accumulatedAssistantText || sawCompactInternalOutput) {
						const responseMeta = promptResponse._meta && typeof promptResponse._meta === "object" ? promptResponse._meta : {};
						const existingCodebuddyMeta = responseMeta["codebuddy.ai"];
						const responseCodebuddyMeta = existingCodebuddyMeta && typeof existingCodebuddyMeta === "object" ? existingCodebuddyMeta : {};
						promptResponse._meta = {
							...responseMeta,
							"codebuddy.ai": {
								...responseCodebuddyMeta,
								lastAssistantText: accumulatedAssistantText,
								...sawCompactInternalOutput && !accumulatedAssistantText ? { isSummaryOnly: true } : {}
							}
						};
					}
					if (isAutomationBg) {
						if (!promptResponse._meta) promptResponse._meta = {};
						const toolMessages = [...toolCallMap.entries()].map(([id, info]) => ({
							role: "tool",
							content: [{
								type: "tool-result",
								toolName: info.title || info.kind || "tool",
								toolCallId: id,
								result: {
									success: info.status === "completed",
									...info.rawOutput !== void 0 ? { result: info.rawOutput } : {}
								}
							}]
						}));
						promptResponse._meta["codebuddy.automation"] = {
							output: accumulatedAssistantText || void 0,
							lastAssistantText: accumulatedAssistantText || void 0,
							runResult: toolMessages.length > 0 ? { messages: toolMessages } : void 0,
							messageCount: toolMessages.length
						};
					}
					return promptResponse;
				} finally {
					backend.onSessionUpdate = originalOnSessionUpdate;
				}
			});
			const session = this.requireSession(sessionId);
			this.logDiagnostic("info", "[SessionManager] prompt completed — deciding turn outcome", {
				sessionId: session.sessionId,
				stopReason: result.stopReason,
				stopRequested: session.stopRequested,
				userCancelRequested: session.userCancelRequested,
				isProcessing: session.isProcessing,
				turnSeq: session.taskState.turnSeq,
				taskRunState: session.taskState.runState,
				isTurnAlreadyFinalized: this.isTurnCompletionAlreadyFinalized(session)
			});
			let promptCancelCause;
			if (isCancelledStopReason(result.stopReason)) {
				const cancelMeta = result._meta && typeof result._meta === "object" ? result._meta : {};
				const existingCause = cancelMeta["codebuddy.ai/cancelCause"];
				if (typeof existingCause === "string" && existingCause.trim().length > 0) promptCancelCause = existingCause.trim();
				else {
					promptCancelCause = session.pluginRecommendationCancelRequested ? "recommendation_switch" : session.userCancelRequested ? "user_cancel" : session.pendingPromptCancelCause ?? (session.stopRequested ? "session_teardown" : "unknown_interrupted");
					result._meta = {
						...cancelMeta,
						"codebuddy.ai/cancelCause": promptCancelCause
					};
				}
			}
			session.pendingPromptCancelCause = void 0;
			const isSystemInterruptCause = promptCancelCause === "backend_restart" || promptCancelCause === "session_teardown" || promptCancelCause === "runtime_reclaim";
			if (this.isTurnCompletionAlreadyFinalized(session)) {} else if (session.pluginRecommendationCancelRequested) {
				this.applyTaskSignal(session, {
					type: "turn_completed",
					stopReason: "recommendation_switch"
				});
				this.markTurnCompletionFinalized(session, "recommendation_switch");
				await this.onProcessingStopped(session, "interrupted");
			} else if (session.userCancelRequested) {
				this.applyTaskSignal(session, {
					type: "turn_completed",
					stopReason: "cancelled"
				});
				this.markTurnCompletionFinalized(session, "cancelled");
				await this.onProcessingStopped(session, "interrupted");
			} else if (session.stopRequested) {
				this.applyTaskSignal(session, {
					type: "runtime_terminated",
					reason: result.stopReason ?? "cancelled"
				});
				this.markTurnCompletionFinalized(session, result.stopReason ?? "cancelled");
				await this.onProcessingStopped(session, "interrupted");
			} else if (isSystemInterruptCause) {
				this.applyTaskSignal(session, {
					type: "runtime_terminated",
					reason: promptCancelCause
				});
				this.markTurnCompletionFinalized(session, promptCancelCause);
				await this.onProcessingStopped(session, "interrupted");
			} else if (isCancelledStopReason(result.stopReason)) {
				this.logDiagnostic("info", "[SessionManager] treating stale cancelled stopReason as normal completion", {
					sessionId: session.sessionId,
					stopReason: result.stopReason,
					stopRequested: session.stopRequested,
					userCancelRequested: session.userCancelRequested,
					turnSeq: session.taskState.turnSeq
				});
				if (!isTaskTerminal(session.taskState)) {
					this.applyTaskSignal(session, {
						type: "turn_completed",
						stopReason: result.stopReason
					});
					this.markTurnCompletionFinalized(session, result.stopReason);
					await this.onProcessingStopped(session, "complete");
				}
			} else if (this.shouldDeferTurnCompletion(session)) {
				this.deferTurnCompletion(session, result.stopReason);
				this.applyTaskSignal(session, { type: "working_started" });
			} else if (session.pendingQuestionRequests.size > 0) {
				this.markTurnCompletionFinalized(session, result.stopReason);
				await this.onProcessingStopped(session, "complete");
			} else if (!isTaskTerminal(session.taskState)) {
				if (!isClearSessionInjection) this.applyTaskSignal(session, {
					type: "turn_completed",
					stopReason: result.stopReason
				});
				this.markTurnCompletionFinalized(session, result.stopReason);
				await this.onProcessingStopped(session, "complete");
			}
			await this.flushSessionEffects(sessionId);
			if (isClearSessionInjection) session.justInsertedSeparator = true;
			else session.justInsertedSeparator = false;
			const resultMeta = result._meta && typeof result._meta === "object" ? result._meta : void 0;
			const acpErrorMessage = resultMeta?.["codebuddy.ai/errorMessage"];
			if (acpErrorMessage && result.stopReason === "refusal") {
				let parsedError = { message: acpErrorMessage };
				try {
					const parsed = JSON.parse(acpErrorMessage);
					if (parsed && typeof parsed === "object") parsedError = parsed;
				} catch {}
				const traceId = resultMeta?.["codebuddy.ai/traceId"];
				const errorPayload = {
					sessionId,
					update: { sessionUpdate: "session_info_update" },
					_meta: { "codebuddy.ai": {
						status: "failed",
						error: {
							message: parsedError.message || acpErrorMessage,
							...parsedError.code !== void 0 ? { code: parsedError.code } : {},
							...traceId ? { traceId } : {},
							...parsedError.data !== void 0 ? { data: parsedError.data } : {}
						}
					} }
				};
				this.emitOrBufferScopedEvent(session, errorPayload);
				this.pushEvent("session:event", errorPayload);
			}
			return result;
		} catch (error) {
			if (isCompactSessionPrompt && isCompactFailedError(error)) {
				this.logDiagnostic("info", "[SessionManager] compact_failed swallowed (nothing to compress post-separator)");
				const active = this.sessions.get(sessionId);
				if (active && !isTaskTerminal(active.taskState)) {
					this.applyTaskSignal(active, {
						type: "turn_completed",
						stopReason: "end_turn"
					});
					this.markTurnCompletionFinalized(active, "end_turn");
					await this.onProcessingStopped(active, "complete");
				}
				return { stopReason: "end_turn" };
			}
			const active = this.sessions.get(sessionId);
			const shouldEmitPromptFailureUpdate = active ? shouldEmitSyntheticPromptFailureStateUpdate(error) : false;
			const promptFailure = {
				sessionId,
				prompt: summarizePromptForLog(prompt),
				meta: summarizePromptMetaForLog(_meta),
				error: serializeErrorForLog(error),
				active: active ? {
					isProcessing: active.isProcessing,
					stopRequested: active.stopRequested,
					taskState: summarizeTaskStateForLog(active.taskState),
					pendingPermissions: active.pendingPermissionRequests.size,
					pendingQuestions: active.pendingQuestionRequests.size
				} : null
			};
			if (active && isTaskTerminal(active.taskState)) this.logDiagnostic("warn", "[SessionManager] prompt() rejected after terminal task state", promptFailure);
			else this.logDiagnostic("error", "[SessionManager] prompt() failed", promptFailure);
			if (active) {
				if (active.pluginRecommendationCancelRequested && !isTaskTerminal(active.taskState)) {
					this.applyTaskSignal(active, {
						type: "turn_completed",
						stopReason: "recommendation_switch"
					});
					this.markTurnCompletionFinalized(active, "recommendation_switch");
				} else if (active.userCancelRequested && !isTaskTerminal(active.taskState)) {
					this.applyTaskSignal(active, {
						type: "turn_completed",
						stopReason: "cancelled"
					});
					this.markTurnCompletionFinalized(active, "cancelled");
				} else if (active.stopRequested && !isTaskTerminal(active.taskState)) {
					this.applyTaskSignal(active, {
						type: "runtime_terminated",
						reason: "cancelled"
					});
					this.markTurnCompletionFinalized(active, "cancelled");
				} else if (!isTaskTerminal(active.taskState)) this.applyTaskSignal(active, {
					type: "runtime_errored",
					error: error instanceof Error ? error.message : String(error)
				});
				if (shouldEmitPromptFailureUpdate) this.emitOrBufferScopedEvent(active, createPromptFailureStateUpdate(active, _meta, error));
				await this.flushSessionEffects(sessionId);
				await this.onProcessingStopped(active, active.stopRequested ? "interrupted" : "error");
			}
			throw error;
		} finally {
			await this.finishPromptInvocation(sessionId);
		}
	}
	async finishPromptInvocation(sessionId) {
		const active = this.sessions.get(sessionId);
		if (!active) return;
		active.promptInvocationActive = false;
		const hadDeferredConfig = !!active.pendingDesiredConfig || !!active.pendingRuntimeConfig;
		try {
			await this.flushPendingRuntimeConfigIfIdle(active);
			if (hadDeferredConfig) this.logDiagnostic("info", `[SessionManager] POST_PROMPT_DRAIN sessionId=${sessionId} — flushed config deferred by in-flight prompt`);
		} catch (error) {
			this.logDiagnostic("warn", "[SessionManager] failed to flush runtime config after prompt invocation", formatDiagnosticDetails(error));
		}
	}
	logDiagnostic(level, message, details) {
		try {
			this.logger?.[level]?.(`${message}${formatLogDetailsSuffix(details)}`);
		} catch {}
	}
	/**
	* 从 elicitation/create 请求里取出关联的真实 toolCallId（仅用于诊断日志，
	* 不参与协议逻辑）。agent 侧把它塞在 `_meta['codebuddy.ai'].toolCallId`
	* （对齐 acp-message-accumulator 的读取路径）。
	*/
	extractElicitationToolCallId(request) {
		if (!request || typeof request !== "object") return;
		const meta = request._meta;
		if (!meta || typeof meta !== "object") return;
		const codebuddyMeta = meta["codebuddy.ai"];
		if (!codebuddyMeta || typeof codebuddyMeta !== "object") return;
		const toolCallId = codebuddyMeta.toolCallId;
		return typeof toolCallId === "string" ? toolCallId : void 0;
	}
	async cancel(sessionId, request) {
		await this.cancelSessionRun(sessionId, request, "user");
	}
	async cancelPluginRecommendationRun(sessionId, request) {
		try {
			await this.cancelSessionRun(sessionId, request, "recommendation_switch");
		} catch (error) {
			const session = this.sessions.get(sessionId);
			if (session?.pluginRecommendationCancelRequested) {
				session.pluginRecommendationCancelRequested = false;
				session.stopRequested = false;
			}
			throw error;
		}
	}
	async cancelSessionRun(sessionId, request, source) {
		await this.withReadySession(sessionId, async (session) => {
			const wasProcessing = session.isProcessing;
			const stopReason = source === "user" ? "cancelled" : "recommendation_switch";
			this.logDiagnostic("info", "[SessionManager] cancel() called", {
				sessionId: session.sessionId,
				source,
				runState: session.taskState.runState,
				pendingInputKind: session.taskState.pendingInputKind,
				isProcessing: session.isProcessing,
				stopRequested: session.stopRequested
			});
			session.userCancelRequested = source === "user";
			session.pluginRecommendationCancelRequested = source === "recommendation_switch";
			this.requestProcessingStop(session);
			await session.backend.cancel(request);
			const statusAfterCancel = deriveTaskStatus(session.taskState);
			const hasActiveTeamMembers = this.hasActiveTeamMembers(session);
			if (!wasProcessing && !isTaskTerminal(session.taskState) && !hasActiveTeamMembers && (statusAfterCancel === "planning" || statusAfterCancel === "working") && this.hasActiveToolCall(session)) this.finalizeStaleToolCallsForDetachedCancel(session);
			const canFinalizeDetachedCancel = !wasProcessing && !isTaskTerminal(session.taskState) && !hasActiveTeamMembers && !this.hasActiveToolCall(session) && (statusAfterCancel === "planning" || statusAfterCancel === "working");
			if (session.stopRequested && session.teamRuntime.deferredCompletion && !isTaskTerminal(session.taskState)) {
				this.applyTaskSignal(session, {
					type: "turn_completed",
					stopReason
				});
				this.markTurnCompletionFinalized(session, stopReason);
				await this.flushSessionEffects(sessionId);
				await this.onProcessingStopped(session, "interrupted");
			} else if (canFinalizeDetachedCancel) {
				this.applyTaskSignal(session, {
					type: "turn_completed",
					stopReason
				});
				await this.flushSessionEffects(session.sessionId);
			}
		});
	}
	finalizeStaleToolCallsForDetachedCancel(session) {
		let finalizedCount = 0;
		const now = Date.now();
		for (const entry of session.toolResults.values()) {
			if (entry.status !== "pending" && entry.status !== "in_progress") continue;
			entry.status = "failed";
			entry.updatedAt = now;
			finalizedCount += 1;
		}
		if (finalizedCount > 0) this.logDiagnostic("info", "[SessionManager] finalized stale tool calls for detached cancel", {
			sessionId: session.sessionId,
			finalizedCount
		});
	}
	async setSessionMode(sessionId, request) {
		await this.withReadySession(sessionId, async (session) => {
			await this.applyDesiredConfig(session, {
				...session.desiredConfig,
				permissionMode: require_workbuddy_auth_product_coordinator.normalizePermissionMode(request.modeId)
			});
		});
		return {};
	}
	async setSessionModel(sessionId, request) {
		await this.withReadySession(sessionId, async (session) => {
			await this.applyDesiredConfig(session, {
				...session.desiredConfig,
				model: request.modelId
			}, { model: request.modelId });
		});
		return {};
	}
	async setSessionConfigOption(sessionId, configId, value) {
		const session = this.sessions.get(sessionId);
		if (!session) {
			this.logDiagnostic("info", `[SessionManager] setSessionConfigOption skipped (inactive): sessionId=${sessionId}, configId=${configId}`);
			return;
		}
		await this.prepareBackendForOperation(session, "setSessionConfigOption");
		await session.backend.setSessionConfigOption(configId, value);
	}
	async respondToPermission(sessionId, requestId, optionId) {
		return this.withReadySession(sessionId, (session) => {
			const accepted = session.backend.respondToPermission(requestId, optionId);
			if (accepted) {
				this.settleInputRequest(session, {
					kind: "permission",
					requestId
				});
				this.syncPendingInputStateAfterMutation(session);
			}
			return accepted;
		});
	}
	async rejectPermission(sessionId, requestId, reason) {
		return this.withReadySession(sessionId, (session) => {
			const rejected = session.backend.rejectPermission(requestId, reason);
			if (rejected) {
				this.settleInputRequest(session, {
					kind: "permission",
					requestId
				});
				this.syncPendingInputStateAfterMutation(session);
			}
			return rejected;
		});
	}
	normalizeInterruptionResolution(result) {
		if (typeof result === "boolean") return {
			resolved: result,
			queued: false
		};
		return {
			resolved: result?.resolved === true,
			queued: result?.queued === true
		};
	}
	getPendingPermissionRequestIdsForToolCall(session, toolCallId) {
		const requestIds = [];
		for (const [requestId, pending] of session.pendingPermissionRequests) if (requestId === toolCallId || pending.request?.toolCall?.toolCallId === toolCallId) requestIds.push(requestId);
		return requestIds;
	}
	async resolveQuestionInput(session, toolCallId, decision, answers, reason) {
		const permissionRequestIdsBeforeResolve = this.getPendingPermissionRequestIdsForToolCall(session, toolCallId);
		const hadQuestionRequestBeforeResolve = session.pendingQuestionRequests.has(toolCallId);
		const rawSemanticResult = session.backend.resolveInterruption ? await session.backend.resolveInterruption(session.sessionId, toolCallId, decision, answers) : false;
		const semanticResult = this.normalizeInterruptionResolution(rawSemanticResult);
		const permissionRequestIds = [...new Set([...permissionRequestIdsBeforeResolve, ...this.getPendingPermissionRequestIdsForToolCall(session, toolCallId)])];
		const hasQuestionRequest = hadQuestionRequestBeforeResolve || session.pendingQuestionRequests.has(toolCallId);
		let permissionsResolved = permissionRequestIds.length === 0;
		if (permissionRequestIds.length > 0 && semanticResult.resolved) permissionsResolved = permissionRequestIds.map((requestId) => session.backend.respondToPermission(requestId, "allow")).every(Boolean);
		let questionResolved = !hasQuestionRequest;
		if (hasQuestionRequest) questionResolved = decision === "allow" ? session.backend.answerQuestion(toolCallId, answers ?? {}) : session.backend.cancelQuestion(toolCallId, reason);
		if (!permissionsResolved || !questionResolved) return false;
		if (permissionRequestIds.length > 0 || hasQuestionRequest) return true;
		return semanticResult.resolved || semanticResult.queued === true;
	}
	/**
	* Resolve a pending tool permission interruption via the broadcast
	* channel (`_codebuddy.ai/resolveInterruption` extMethod). Mirrors
	* `answerQuestion` / `cancelQuestion` shape but explicitly addresses
	* permission interruptions (no `answers` payload by default).
	*
	* Use this surface from the floating permission hovercard so the
	* decision dismisses both the broadcast channel and the still-pending
	* standard `requestPermission` JSON-RPC at the CLI handler side.
	*/
	async resolveInterruption(sessionId, toolCallId, decision, answers) {
		const log = (msg) => {
			this.logger?.info?.(msg);
			console.log(msg);
		};
		log(`[SessionManager] resolveInterruption called: sessionId=${sessionId}, toolCallId=${toolCallId}, decision=${decision}`);
		return this.withReadySession(sessionId, async (session) => {
			if (!session.backend.resolveInterruption) {
				log("[SessionManager] resolveInterruption: backend.resolveInterruption not available");
				return false;
			}
			log("[SessionManager] resolveInterruption: calling backend.resolveInterruption...");
			const result = this.normalizeInterruptionResolution(await session.backend.resolveInterruption(sessionId, toolCallId, decision, answers));
			log(`[SessionManager] resolveInterruption: backend returned resolved=${result.resolved} queued=${result.queued === true}`);
			if (result.resolved) {
				this.settleInputRequest(session, {
					kind: "tool",
					toolCallId
				});
				this.syncPendingInputStateAfterMutation(session);
			}
			return result.resolved;
		});
	}
	async respondToSandboxIntercept(sessionId, requestId, choice) {
		await this.withReadySession(sessionId, (session) => {
			const resolved = session.backend.respondToSandboxIntercept?.(requestId, choice);
			if (!resolved) console.warn(`[SessionManager] respondToSandboxIntercept: backend did not handle requestId=${requestId}`);
			if (resolved) {
				this.settleInputRequest(session, {
					kind: "permission",
					requestId
				});
				this.syncPendingInputStateAfterMutation(session);
			}
			return resolved ?? false;
		});
	}
	async answerQuestion(sessionId, toolCallId, answers) {
		return this.withReadySession(sessionId, async (session) => {
			const answered = await this.resolveQuestionInput(session, toolCallId, "allow", answers);
			if (answered) {
				this.settleInputRequest(session, {
					kind: "tool",
					toolCallId
				});
				this.syncPendingInputStateAfterMutation(session);
			}
			return answered;
		});
	}
	/**
	* 主动下推 poi_pick question 触发 renderer 渲染 POI 浮层（pick_location 工具用）。
	*
	* 走与自然 onQuestionRequest（backend 上报）完全一致的语义，避免裸推绕过 session
	* 状态机导致的：hydration/cold-restore subscription race、taskState 不进 awaiting_input、
	* reload/replay 丢浮层、全局 session:event 消费者不可见。
	*
	* 返回 true=已下推（session 存在且非终态）；false=session 不存在或已终态。
	* 终态/不存在时立即用 registry.answer(cancelled) 解挂 daemon 侧 ask() 的 pending，
	* 防止 handler 阻塞到 10 分钟超时（对齐 onElicitationRequest 的 terminal auto-cancel）。
	*
	* toolCallId 必须 == registry.ask 登记的 requestId，保证 answerPoiQuestion 精确命中。
	*/
	emitPoiPickQuestion(sessionId, toolCallId, reason) {
		const session = this.sessions.get(sessionId);
		if (!session || isTaskTerminal(session.taskState)) {
			this.logDiagnostic("info", "[SessionManager][PoiPick] skip push (terminal/absent), cancel registry pending", {
				sessionId,
				toolCallId,
				hasSession: !!session,
				taskState: session?.taskState.runState
			});
			this.poiQuestionRegistry?.answer(sessionId, toolCallId, {
				status: "cancelled",
				reason: "config_error"
			});
			return false;
		}
		const request = {
			sessionId,
			toolCallId,
			inputType: "poi_pick",
			poiPick: { reason }
		};
		this.applyTaskSignal(session, {
			type: "awaiting_input",
			kind: "question"
		});
		session.pendingQuestionRequests.set(toolCallId, {
			toolCallId,
			receivedAt: Date.now(),
			request
		});
		const payload = {
			type: "questionRequest",
			sessionId: session.sessionId,
			toolCallId,
			request
		};
		if (this.recordSessionEvent(session, payload) === "duplicate") return true;
		this.emitOrBufferScopedEvent(session, payload);
		this.pushEvent("session:event", payload);
		this.logDiagnostic("info", "[SessionManager][PoiPick] pushed questionRequest", {
			sessionId,
			toolCallId
		});
		return true;
	}
	/**
	* 回传 POI 选择结果（pick_location 工具）→ PoiQuestionRegistry.answer 解开 handler 阻塞，
	* 并清理 pendingQuestionRequests（否则 replay 会复活一张已应答的幽灵浮层）。
	*
	* 返回 false 表示 requestId 不存在 / session 不匹配 / registry 未注入（静默关闭面板）。
	*/
	answerPoiQuestion(sessionId, requestId, result) {
		const answered = this.poiQuestionRegistry?.answer(sessionId, requestId, result) ?? false;
		if (answered) {
			const session = this.sessions.get(sessionId);
			if (session) {
				this.settleInputRequest(session, {
					kind: "tool",
					toolCallId: requestId
				});
				this.syncPendingInputStateAfterMutation(session);
			}
		}
		return answered;
	}
	/**
	* 把 suggest_plugin_install 的会话级卡片放入 pending elicitation owner state。
	* requestId 同时作为 elicitationId、registry key 和 toolCallId，保证
	* reload/replay 与用户回传精确匹配。
	*/
	emitPluginRecommendationElicitation(sessionId, requestId, request) {
		const session = this.sessions.get(sessionId);
		if (!session || isTaskTerminal(session.taskState)) {
			this.pluginRecommendationRegistry?.cancelSession(sessionId, "the session is no longer active");
			return false;
		}
		this.applyTaskSignal(session, {
			type: "awaiting_input",
			kind: "question"
		});
		this.replacePluginRecommendationElicitation(session, requestId, request);
		this.logDiagnostic("info", "[SessionManager][PluginRecommendation] pushed elicitationRequest", {
			sessionId,
			requestId,
			type: request.type,
			candidateCount: request.plugins.length
		});
		this.pluginRecommendationTelemetryReporter?.report({
			event_name: "plugin_recommendation_shown",
			event_version: 1,
			recommendation_id: requestId,
			session_id_hash: "",
			agent_run_id: "",
			plugin_type: request.type,
			entry_point: "suggest_plugin_install",
			candidate_count: request.plugins.length,
			shown_candidate_ids: request.plugins.map((p) => p.pluginId),
			shown_at: Date.now()
		});
		return true;
	}
	async answerPluginRecommendation(sessionId, requestId, action) {
		const registry = this.pluginRecommendationRegistry;
		if (!registry) return {
			matched: false,
			settled: false
		};
		const pendingRequest = registry.getPendingRequest(sessionId, requestId);
		const currentExpertId = this.sessions.get(sessionId)?.desiredConfig.expertId;
		if ((action.type === "connection_started" || action.type === "expert_already_selected") && pendingRequest?.type === "expert" && currentExpertId) return registry.settleExpertAlreadySelected(sessionId, requestId);
		const shouldSwitchForExpert = action.type === "candidate_result" && action.status === "enabled" && pendingRequest?.type === "expert";
		const shouldSwitchForConnector = action.type === "apply" && pendingRequest?.type === "connector" && pendingRequest.plugins.some((plugin) => plugin.status === "connected" || plugin.status === "already_connected");
		if (shouldSwitchForExpert && currentExpertId !== action.pluginId) {
			if (currentExpertId) return registry.settleExpertAlreadySelected(sessionId, requestId);
			return {
				...registry.answer(sessionId, requestId, {
					type: "candidate_result",
					pluginId: action.pluginId,
					status: "failed",
					error: "Expert selection changed before the previous run could be cancelled."
				}),
				accepted: false
			};
		}
		if (!shouldSwitchForExpert && !shouldSwitchForConnector) return registry.answer(sessionId, requestId, action);
		const continuation = this.reservePluginRecommendationContinuation(sessionId);
		let continuationWillStart = false;
		this.pluginRecommendationRunSwitches.add(sessionId);
		let switchResult;
		try {
			try {
				await this.cancelPluginRecommendationRun(sessionId);
				const activeSession = this.sessions.get(sessionId);
				if (activeSession) await this.waitForProcessingEnd(activeSession, 5e3);
			} catch (error) {
				if (shouldSwitchForExpert) return {
					...registry.answer(sessionId, requestId, {
						type: "candidate_result",
						pluginId: action.pluginId,
						status: "failed",
						error: error instanceof Error ? error.message : String(error)
					}),
					accepted: false
				};
				return {
					matched: true,
					settled: false,
					accepted: false,
					request: registry.getPendingRequest(sessionId, requestId)
				};
			}
			if (shouldSwitchForExpert) {
				const expertIdAfterCancel = this.sessions.get(sessionId)?.desiredConfig.expertId;
				if (expertIdAfterCancel !== action.pluginId) {
					if (expertIdAfterCancel) return registry.settleExpertAlreadySelected(sessionId, requestId);
					return {
						...registry.answer(sessionId, requestId, {
							type: "candidate_result",
							pluginId: action.pluginId,
							status: "failed",
							error: "Expert selection changed while cancelling the previous run."
						}),
						accepted: false
					};
				}
			}
			switchResult = registry.answer(sessionId, requestId, action);
			continuationWillStart = switchResult.settled && (shouldSwitchForExpert || shouldSwitchForConnector);
		} finally {
			this.pluginRecommendationRunSwitches.delete(sessionId);
			if (!continuationWillStart) this.releaseReservedPluginRecommendationContinuation(sessionId, continuation.barrier);
		}
		if (switchResult.settled && shouldSwitchForExpert) {
			const enabledPlugin = pendingRequest?.plugins.find((plugin) => plugin.pluginId === action.pluginId);
			this.startExpertContinuationRun(continuation, sessionId, action.pluginId, enabledPlugin?.pluginName ?? action.pluginId, enabledPlugin?.expertType);
		} else if (switchResult.settled && shouldSwitchForConnector) this.startConnectorContinuationRun(continuation, sessionId, pendingRequest.plugins.filter((plugin) => plugin.status === "connected" || plugin.status === "already_connected").map((plugin) => plugin.pluginName));
		return switchResult;
	}
	/**
	* 服务端驱动的「启用专家」续跑（PRD §7.1/§6.3）。
	*
	* 用户在推荐卡里启用专家后，旧 run 已被 cancel、专家已绑定进 session config。
	* 这里由服务端补发一条中文用户消息，触发新 run 接着原任务走；专家 persona 由
	* system prompt（ExpertCollector）承载，因此这里不重复内联专家 prompt。
	* fire-and-forget：不阻塞 answerPluginRecommendation 的返回，失败仅记日志。
	*/
	startExpertContinuationRun(continuation, sessionId, expertId, expertName, expertType) {
		const mode = this.sessions.get(sessionId)?.desiredConfig.mode ?? "craft";
		const prompt = [{
			type: "text",
			text: `用户选择了${expertName}，请继续完成用户的任务。`
		}];
		const meta = { "codebuddy.ai": {
			mode,
			expertId,
			expertName,
			...expertType ? { expertType } : {},
			pluginRecommendationContinuation: true
		} };
		this.startPluginRecommendationContinuation(continuation, sessionId, () => this.promptPluginRecommendationContinuation(sessionId, prompt, meta), "expert");
	}
	startConnectorContinuationRun(continuation, sessionId, connectorNames) {
		const mode = this.sessions.get(sessionId)?.desiredConfig.mode ?? "craft";
		const prompt = [{
			type: "text",
			text: `用户已连接${connectorNames.join("、")}，请使用新连接的 Connector 继续完成用户的任务。`
		}];
		const meta = { "codebuddy.ai": {
			mode,
			pluginRecommendationContinuation: true,
			pluginRecommendationType: "connector",
			connectedConnectors: connectorNames
		} };
		this.startPluginRecommendationContinuation(continuation, sessionId, () => this.promptPluginRecommendationContinuation(sessionId, prompt, meta), "connector");
	}
	promptPluginRecommendationContinuation(sessionId, prompt, meta) {
		this.pluginRecommendationContinuationPrompts.add(prompt);
		return this.prompt(sessionId, prompt, meta);
	}
	startPluginRecommendationContinuation(continuation, sessionId, run, type) {
		const { barrier, previous } = continuation;
		(async () => {
			await previous?.settled;
			if (barrier.released) {
				this.logger?.warn?.(`[${type}-continuation] skipped released admission barrier for session ${sessionId}`);
				return;
			}
			await run();
		})().catch((error) => {
			this.logger?.error?.(`[${type}-continuation] failed to start continuation run for session ${sessionId}: ` + (error instanceof Error ? error.message : String(error)));
		}).finally(() => {
			this.releaseReservedPluginRecommendationContinuation(sessionId, barrier);
		});
	}
	reservePluginRecommendationContinuation(sessionId) {
		const previous = this.pluginRecommendationContinuationBarriers.get(sessionId);
		const barrier = createPluginRecommendationContinuationBarrier();
		this.pluginRecommendationContinuationBarriers.set(sessionId, barrier);
		return {
			barrier,
			previous
		};
	}
	async waitForPluginRecommendationContinuation(sessionId) {
		let barrier = this.pluginRecommendationContinuationBarriers.get(sessionId);
		while (barrier) {
			await barrier.settled;
			const nextBarrier = this.pluginRecommendationContinuationBarriers.get(sessionId);
			if (!nextBarrier || nextBarrier === barrier) return;
			barrier = nextBarrier;
		}
	}
	releaseReservedPluginRecommendationContinuation(sessionId, barrier) {
		barrier.release();
		if (this.pluginRecommendationContinuationBarriers.get(sessionId) === barrier) this.pluginRecommendationContinuationBarriers.delete(sessionId);
	}
	releasePluginRecommendationContinuation(sessionId) {
		this.pluginRecommendationContinuationBarriers.get(sessionId)?.release();
		this.pluginRecommendationContinuationBarriers.delete(sessionId);
	}
	isPluginRecommendationElicitation(request) {
		if (!request || typeof request !== "object") return false;
		const meta = request._meta;
		if (!meta || typeof meta !== "object") return false;
		const codebuddyMeta = meta["codebuddy.ai"];
		if (!codebuddyMeta || typeof codebuddyMeta !== "object") return false;
		const record = codebuddyMeta;
		return record.inputType === "plugin_recommendation" && !!record.pluginRecommendation && typeof record.pluginRecommendation === "object";
	}
	replacePluginRecommendationElicitation(session, requestId, recommendation) {
		const request = {
			sessionId: session.sessionId,
			toolCallId: requestId,
			mode: "form",
			message: recommendation.contextLabel ?? "",
			requestedSchema: {
				type: "object",
				properties: {}
			},
			_meta: { "codebuddy.ai": {
				elicitationId: requestId,
				toolCallId: requestId,
				inputType: "plugin_recommendation",
				pluginRecommendation: structuredClone(recommendation)
			} }
		};
		session.pendingElicitationRequests.set(requestId, {
			elicitationId: requestId,
			receivedAt: Date.now(),
			request
		});
		session.eventHistory = session.eventHistory.filter((payload) => !(payload.type === "elicitationRequest" && payload.elicitationId === requestId));
		const payload = {
			type: "elicitationRequest",
			sessionId: session.sessionId,
			elicitationId: requestId,
			request
		};
		this.recordSessionEvent(session, payload);
		this.emitOrBufferScopedEvent(session, payload);
		this.pushEvent("session:event", payload);
	}
	/**
	* 回传 elicitation/create 用户操作（微信支付卡片等）。
	* 作为原始 elicitation 请求的 JSON-RPC response 解开 agent 侧挂起的工具。
	*/
	async respondElicitation(sessionId, elicitationId, action, content) {
		return this.withReadySession(sessionId, async (session) => {
			const responded = session.backend.respondElicitation?.(elicitationId, action, content) ?? false;
			const hadPendingElicitation = session.pendingElicitationRequests.has(elicitationId);
			if (responded) this.settleInputRequest(session, {
				kind: "elicitation",
				elicitationId
			});
			this.logDiagnostic("info", "[SessionManager][Elicitation] respondElicitation", {
				sessionId: session.sessionId,
				elicitationId,
				action,
				responded,
				clearedElicitation: responded && hadPendingElicitation
			});
			if (responded) this.syncPendingInputStateAfterMutation(session);
			return responded;
		});
	}
	async cancelQuestion(sessionId, toolCallId, reason) {
		return this.withReadySession(sessionId, async (session) => {
			this.logDiagnostic("info", "[SessionManager] cancelQuestion() called", {
				sessionId: session.sessionId,
				toolCallId,
				reason,
				runState: session.taskState.runState,
				isProcessing: session.isProcessing
			});
			const cancelled = await this.resolveQuestionInput(session, toolCallId, "deny", void 0, reason);
			if (cancelled) {
				this.settleInputRequest(session, {
					kind: "tool",
					toolCallId
				});
				this.recordSyntheticQuestionCancelledEvent(session, toolCallId, reason);
				this.syncPendingInputStateAfterMutation(session);
			}
			return cancelled;
		});
	}
	clearPendingPermissionRequestsForToolCall(session, toolCallId) {
		const requestIds = this.getPendingPermissionRequestIdsForToolCall(session, toolCallId);
		for (const requestId of requestIds) session.pendingPermissionRequests.delete(requestId);
		return requestIds.length > 0;
	}
	/**
	* Remove a request after the backend has acknowledged that it is no longer
	* pending. Both the pending maps and eventHistory are owner state: clearing
	* only one of them lets a later owner replay/reclaim recreate the dialog.
	*/
	settleInputRequest(session, target) {
		let changed = false;
		switch (target.kind) {
			case "permission":
				changed = session.pendingPermissionRequests.delete(target.requestId);
				break;
			case "tool":
				changed = session.pendingQuestionRequests.delete(target.toolCallId);
				changed = this.clearPendingPermissionRequestsForToolCall(session, target.toolCallId) || changed;
				for (const [elicitationId, pending] of session.pendingElicitationRequests) if (this.extractElicitationToolCallId(pending.request) === target.toolCallId) {
					session.pendingElicitationRequests.delete(elicitationId);
					changed = true;
				}
				break;
			case "elicitation":
				changed = session.pendingElicitationRequests.delete(target.elicitationId);
				break;
			case "plugin_recommendation":
				changed = session.pendingPluginRecommendations.delete(target.recommendationId);
				break;
			case "all":
				changed = session.pendingPermissionRequests.size > 0 || session.pendingQuestionRequests.size > 0 || session.pendingElicitationRequests.size > 0 || session.pendingPluginRecommendations.size > 0;
				session.pendingPermissionRequests.clear();
				session.pendingQuestionRequests.clear();
				session.pendingElicitationRequests.clear();
				session.pendingPluginRecommendations.clear();
				break;
		}
		const previousHistoryLength = session.eventHistory.length;
		session.eventHistory = session.eventHistory.filter((payload) => !this.isSettledInputRequestPayload(payload, target));
		return changed || session.eventHistory.length !== previousHistoryLength;
	}
	isSettledInputRequestPayload(payload, target) {
		const type = typeof payload.type === "string" ? payload.type : void 0;
		if (target.kind === "all") return type === "permissionRequest" || type === "questionRequest" || type === "elicitationRequest" || type === "pluginRecommendationRequest";
		if (target.kind === "permission") return type === "permissionRequest" && payload.requestId === target.requestId;
		if (target.kind === "elicitation") return type === "elicitationRequest" && payload.elicitationId === target.elicitationId;
		if (target.kind === "plugin_recommendation") return type === "pluginRecommendationRequest" && payload.recommendationId === target.recommendationId;
		if (type === "questionRequest") return payload.toolCallId === target.toolCallId;
		if (type === "permissionRequest") {
			const request = payload.request;
			const toolCall = request && typeof request === "object" ? request.toolCall : void 0;
			const requestToolCallId = toolCall && typeof toolCall === "object" ? toolCall.toolCallId : void 0;
			return payload.requestId === target.toolCallId || requestToolCallId === target.toolCallId;
		}
		return type === "elicitationRequest" && this.extractElicitationToolCallId(payload.request) === target.toolCallId;
	}
	syncPendingInputStateAfterMutation(session) {
		const nextPendingKind = this.getLatestPendingInputKind(session);
		if (nextPendingKind) {
			this.applyTaskSignal(session, {
				type: "awaiting_input",
				kind: nextPendingKind
			});
			return;
		}
		this.applyTaskSignal(session, { type: "input_resolved" });
	}
	getLatestPendingInputKind(session) {
		let latestPermissionAt = -1;
		for (const pending of session.pendingPermissionRequests.values()) latestPermissionAt = Math.max(latestPermissionAt, pending.receivedAt);
		let latestQuestionAt = -1;
		for (const pending of session.pendingQuestionRequests.values()) latestQuestionAt = Math.max(latestQuestionAt, pending.receivedAt);
		for (const pending of session.pendingElicitationRequests.values()) latestQuestionAt = Math.max(latestQuestionAt, pending.receivedAt);
		let latestPluginRecAt = -1;
		for (const pending of session.pendingPluginRecommendations.values()) latestPluginRecAt = Math.max(latestPluginRecAt, pending.receivedAt);
		if (latestPermissionAt < 0 && latestQuestionAt < 0 && latestPluginRecAt < 0) return;
		if (latestPluginRecAt >= latestQuestionAt && latestPluginRecAt >= latestPermissionAt) return "plugin_recommendation";
		return latestQuestionAt >= latestPermissionAt ? "question" : "permission";
	}
	async getAvailableCommands(params) {
		const sessionId = this.resolveTargetSessionId(params?.sessionId);
		if (!sessionId) return [];
		const session = this.sessions.get(sessionId);
		if (!session) return [];
		await this.prepareBackendForOperation(session, "getAvailableCommands");
		return session.backend.getAvailableCommands(params ?? {});
	}
	async getSubagentList(params) {
		const sessionId = this.resolveTargetSessionId(params?.sessionId);
		if (!sessionId) return {
			subagents: [],
			results: []
		};
		const session = this.sessions.get(sessionId);
		if (!session) return {
			subagents: [],
			results: []
		};
		await this.prepareBackendForOperation(session, "getSubagentList");
		return session.backend.getSubagentList(params ?? {});
	}
	async respondToSampling(sessionId, response) {
		await this.withReadySession(sessionId, (session) => session.backend.respondToSampling(response));
	}
	async respondToRoots(sessionId, response) {
		await this.withReadySession(sessionId, (session) => session.backend.respondToRoots(response));
	}
	async requestYield(sessionId) {
		await this.withReadySession(sessionId, (session) => session.backend.requestYield());
		return true;
	}
	async getMessageQueue(sessionId) {
		const session = this.sessions.get(sessionId);
		if (!session) return;
		await this.prepareBackendForOperation(session, "getMessageQueue");
		return session.backend.getMessageQueue();
	}
	async saveMessageQueue(data) {
		const { sessionId, ...payload } = data;
		const session = this.sessions.get(sessionId);
		if (!session) return;
		await this.prepareBackendForOperation(session, "saveMessageQueue");
		await session.backend.saveMessageQueue(payload);
	}
	async enqueueMessage(sessionId, contentBlocks) {
		return this.withReadySession(sessionId, (session) => session.backend.enqueueMessage(contentBlocks));
	}
	async removeQueueItem(sessionId, itemId) {
		return this.withReadySession(sessionId, (session) => session.backend.removeQueueItem(itemId));
	}
	async popQueueItemForEdit(sessionId, itemId) {
		return this.withReadySession(sessionId, (session) => session.backend.popQueueItemForEdit(itemId));
	}
	async reorderQueue(sessionId, orderedIds) {
		return this.withReadySession(sessionId, (session) => session.backend.reorderQueue(orderedIds));
	}
	async sendQueueItemNow(sessionId, itemId) {
		return this.withReadySession(sessionId, (session) => session.backend.sendQueueItemNow(itemId));
	}
	async activateMessageQueue(sessionId) {
		return this.withReadySession(sessionId, (session) => session.backend.activateMessageQueue());
	}
	async pauseMessageQueue(sessionId, reason) {
		return this.withReadySession(sessionId, (session) => session.backend.pauseMessageQueue(reason));
	}
	async resumeMessageQueue(sessionId) {
		return this.withReadySession(sessionId, (session) => session.backend.resumeMessageQueue());
	}
	async cancelMessageQueue(sessionId) {
		return this.withReadySession(sessionId, (session) => session.backend.cancelMessageQueue());
	}
	async getQueueState(sessionId) {
		const session = this.sessions.get(sessionId);
		if (!session) return null;
		await this.prepareBackendForOperation(session, "getQueueState");
		return session.backend.getQueueState();
	}
	async destroyAll() {
		this.pluginRecommendationRegistry?.cancelAll("daemon stopped");
		for (const barrier of this.pluginRecommendationContinuationBarriers.values()) barrier.release();
		this.pluginRecommendationContinuationBarriers.clear();
		this.stopRuntimeReclaimJanitor();
		for (const timer of this.sidebarMetaDebounceTimers.values()) clearTimeout(timer);
		this.sidebarMetaDebounceTimers.clear();
		const ids = [...this.sessions.keys()];
		await Promise.allSettled(ids.map((id) => this.destroySession(id)));
		this.primedReplayStates.clear();
		this.runtimeSandboxOverrides.clear();
		this.runtimeReclaimEligibleSince.clear();
		this.runtimeReclaimingSessions.clear();
		this.userPromptComposer?.cleanup();
	}
	/**
	* 将 session 级属性回填到 prompt _meta 中。
	*
	* renderer 只在首次创建本地任务时显式传 projectId，后续追问或 loadSession
	* 恢复后再发消息时 _meta 中不带。此方法从 session state 补齐，确保
	* userPromptService 等下游消费方始终能拿到完整上下文。专家的上一轮
	* selection 也由 daemon 覆盖写入，避免依赖 renderer 的进程内 Map。
	*/
	enrichPromptMeta(session, _meta) {
		if (!_meta && !session.projectId && !session.lastUserPromptExpertSelection) return;
		const meta = _meta ? structuredClone(_meta) : {};
		const cbMeta = meta["codebuddy.ai"];
		const codebuddyMeta = cbMeta && typeof cbMeta === "object" ? cbMeta : {};
		if (session.projectId && !codebuddyMeta.projectId) codebuddyMeta.projectId = session.projectId;
		if (session.lastUserPromptExpertSelection) codebuddyMeta.previousExpertSelection = { ...session.lastUserPromptExpertSelection };
		else delete codebuddyMeta.previousExpertSelection;
		meta["codebuddy.ai"] = codebuddyMeta;
		return meta;
	}
	async composePromptForBackend(session, prompt, _meta) {
		if (!this.userPromptComposer || !Array.isArray(prompt) || prompt.length === 0) return prompt;
		await this.userPromptComposerReady;
		const metaProjectId = readProjectId(_meta);
		this.logger?.info?.(`[SessionManager] composing user prompt context ${JSON.stringify({
			sessionId: session.sessionId,
			sessionProjectId: session.projectId,
			metaProjectId,
			hasProjectId: !!(session.projectId || metaProjectId),
			hasPriorUserMessages: sessionHasPriorUserMessages(session),
			hasPromptMeta: !!_meta
		})}`);
		return this.userPromptComposer.composeUserPrompt({
			sessionId: session.sessionId,
			cwd: session.cwd,
			desiredConfig: session.desiredConfig,
			prompt: structuredClone(prompt),
			_meta: this.enrichPromptMeta(session, _meta),
			hasPriorUserMessages: sessionHasPriorUserMessages(session)
		});
	}
	async startSession(opts, kind, expectedLifecycleGeneration) {
		const cwd = normalizeCwdPath(opts.cwd) ?? resolveDefaultCwdOrThrow();
		await assertSessionCwdUsable(cwd);
		const requestedSessionId = opts.sessionId ?? (0, node_crypto.randomUUID)();
		if (kind === "new") {
			const pendingTransaction = this.pendingSessionDeleteTransactions.get(requestedSessionId);
			if (pendingTransaction) await pendingTransaction;
			const pendingDelete = this.pendingSessionDeletes.get(requestedSessionId);
			if (pendingDelete) await pendingDelete;
		}
		const lifecycleGeneration = kind === "new" ? this.beginNewSessionLifecycle(requestedSessionId) : expectedLifecycleGeneration ?? this.getSessionLifecycleGeneration(requestedSessionId);
		this.assertSessionLifecycleCurrent(requestedSessionId, lifecycleGeneration);
		await this.awaitPendingSessionDisposal(requestedSessionId);
		const storedEntry = kind !== "new" ? await this.resolveStoredEntry(requestedSessionId) : null;
		const createdAt = storedEntry?.createdAt ?? Date.now();
		const updatedAt = storedEntry?.updatedAt ?? createdAt;
		const lastActivityAt = storedEntry?.lastActivityAt;
		const resolvedDisabledTools = this.disabledToolsResolver ? this.disabledToolsResolver({
			cwd,
			callerDisabledTools: opts.disabledTools,
			kind
		}) : void 0;
		const baseEffectiveOpts = resolvedDisabledTools !== void 0 ? {
			...opts,
			disabledTools: resolvedDisabledTools
		} : opts;
		const effectiveOpts = storedEntry?.pluginContext ? restoreStoredPluginContext(baseEffectiveOpts, storedEntry.pluginContext, {
			sourceMode: storedEntry.sourceMode,
			mode: storedEntry.mode
		}) : baseEffectiveOpts;
		let desiredConfig = syncAddonSelectionWithDesiredConfig(this.buildDesiredConfig(effectiveOpts));
		if (!desiredConfig.mode && storedEntry?.mode) desiredConfig.mode = require_workbuddy_auth_product_coordinator.normalizeSceneMode(storedEntry.mode);
		if (!desiredConfig.model && storedEntry?.model) desiredConfig.model = storedEntry.model;
		if (!desiredConfig.expertId && storedEntry?.expertId) desiredConfig.expertId = storedEntry.expertId;
		if (desiredConfig.expertId && !desiredConfig.locale && storedEntry?.expertLocale) desiredConfig.locale = storedEntry.expertLocale;
		if (desiredConfig.expertId && !desiredConfig.runtimeIdentity && storedEntry?.expertRuntimeIdentity) desiredConfig.runtimeIdentity = storedEntry.expertRuntimeIdentity;
		if (desiredConfig.expertId && !desiredConfig.expertMarketplace && storedEntry?.expertMarketplace) desiredConfig.expertMarketplace = storedEntry.expertMarketplace;
		if (!desiredConfig.permissionMode && storedEntry?.permissionMode) desiredConfig.permissionMode = storedEntry.permissionMode;
		const runtimeSandboxOverride = this.runtimeSandboxOverrides.get(requestedSessionId);
		if (desiredConfig.useSandboxCLI === void 0 && runtimeSandboxOverride !== void 0) {
			desiredConfig.useSandboxCLI = runtimeSandboxOverride.enabled;
			desiredConfig.sandboxDisabledReason = runtimeSandboxOverride.disabledReason;
		}
		const sourceMode = hasExplicitWelcomeModeInput(opts.config) && desiredConfig.welcomeMode ? require_workbuddy_auth_product_coordinator.toLegacySourceMode(desiredConfig.welcomeMode) : readSessionSourceMode(opts._meta) ?? storedEntry?.sourceMode ?? (desiredConfig.welcomeMode ? require_workbuddy_auth_product_coordinator.toLegacySourceMode(desiredConfig.welcomeMode) : void 0);
		if (!desiredConfig.welcomeMode && sourceMode) desiredConfig.welcomeMode = require_workbuddy_auth_product_coordinator.normalizeWelcomeMode(sourceMode);
		desiredConfig = syncAddonSelectionWithDesiredConfig(require_workbuddy_auth_product_coordinator.normalizeDesiredConfig(desiredConfig));
		if (typeof desiredConfig.useSandboxCLI === "boolean") this.runtimeSandboxOverrides.set(requestedSessionId, {
			enabled: desiredConfig.useSandboxCLI,
			disabledReason: desiredConfig.sandboxDisabledReason
		});
		const isBackgroundAutomation = readIsBackgroundAutomation(opts._meta) ?? storedEntry?.isBackgroundAutomation;
		const currentUserId = this.getCurrentUserId?.();
		const storedProjectId = !!currentUserId && !!storedEntry?.userId && storedEntry.userId !== currentUserId ? void 0 : storedEntry?.projectId;
		const projectId = opts.projectId ?? readProjectId(opts._meta) ?? storedProjectId;
		if (projectId) opts.env = {
			...opts.env,
			CODEBUDDY_PROJECT_ID: projectId
		};
		const sessionOwnerUserId = readSessionOwnerUserId(opts._meta) ?? storedEntry?.userId ?? (typeof currentUserId === "string" && currentUserId.trim().length > 0 ? currentUserId.trim() : void 0);
		const effectiveMeta = withPersistedSessionMeta(opts._meta, {
			sourceMode,
			isBackgroundAutomation,
			sessionOwnerUserId
		});
		const runtimeConfig = await this.resolveRuntimeConfig({
			sessionId: requestedSessionId,
			cwd,
			desiredConfig
		});
		this.logDiagnostic("info", "[SessionManager] startSession model resolution", {
			sessionId: requestedSessionId,
			kind,
			optsModel: opts.model,
			optsConfigModel: opts.config?.model,
			storedEntryModel: storedEntry?.model,
			desiredConfigModel: desiredConfig.model,
			runtimeConfigModel: runtimeConfig.model,
			hasStoredEntry: !!storedEntry
		});
		const backend = this.requireCreateBackend()({
			backendId: opts.backendId,
			sessionId: requestedSessionId,
			cwd,
			runtimeConfig,
			env: opts.env,
			_meta: effectiveMeta
		});
		const session = {
			sessionId: requestedSessionId,
			cwd,
			createdAt,
			updatedAt,
			lastActivityAt,
			backend,
			userId: sessionOwnerUserId,
			isPlayground: opts.isPlayground,
			projectId,
			backendId: opts.backendId,
			env: opts.env,
			_meta: effectiveMeta,
			customTitle: opts.customTitle,
			desiredConfig,
			runtimeConfig,
			persistPluginContext: !!storedEntry?.pluginContext || hasExplicitPluginContextInput(opts.config),
			taskState: restoreTaskStateFromStoredStatus(requestedSessionId, createdAt, storedEntry?.status, {
				updatedAt: storedEntry?.updatedAt,
				onDecision: (decision) => {
					const level = decision.decision === "stale-inflight-to-terminated" ? "warn" : "info";
					this.logDiagnostic(level, `[TaskStatus] restore ${decision.decision}`, decision);
				}
			}),
			isProcessing: false,
			stopRequested: false,
			userCancelRequested: false,
			pluginRecommendationCancelRequested: false,
			pendingPermissionRequests: /* @__PURE__ */ new Map(),
			pendingQuestionRequests: /* @__PURE__ */ new Map(),
			pendingElicitationRequests: /* @__PURE__ */ new Map(),
			pendingPluginRecommendations: /* @__PURE__ */ new Map(),
			historyHydrationDepth: kind === "load" ? 1 : 0,
			awaitingHistoryReplayEnd: kind === "load",
			sawHistoryReplayStart: false,
			sawHistoryReplayContent: false,
			bufferedScopedEventsDuringHistoryHydration: [],
			ownerHistoryHydrated: kind === "new",
			eventHistory: [],
			hasUserMessageSinceLastCompact: false,
			lastUserPromptExpertSelection: fromPersistedExpertSelectionState(storedEntry?.lastUserPromptExpertSelection),
			toolResults: /* @__PURE__ */ new Map(),
			teamRuntime: { membersByName: /* @__PURE__ */ new Map() },
			stateTransitionLog: [],
			modeEpoch: 0
		};
		session.modeEpoch++;
		this.wireBackend(session);
		try {
			require_workbuddy_auth_product_coordinator.registerSessionDeferredBuiltinPolicy(requestedSessionId, require_workbuddy_auth_product_coordinator.deriveSessionDeferredBuiltinPolicy(require_workbuddy_auth_product_coordinator.resolveModeTools(runtimeConfig.addonManifest?.selected.interactionMode)));
			const handle = await backend.initialize(kind === "new" ? {
				kind: "new",
				request: {
					cwd,
					mcpServers: [],
					_meta: effectiveMeta
				}
			} : {
				kind,
				request: {
					sessionId: requestedSessionId,
					cwd,
					mcpServers: [],
					_meta: effectiveMeta
				}
			});
			if (handle.sessionId !== requestedSessionId) throw new Error(`[SessionManager] Backend "${backend.id}" returned mismatched session id: expected "${requestedSessionId}", got "${handle.sessionId}"`);
			this.assertSessionLifecycleCurrent(requestedSessionId, lifecycleGeneration);
			this.sessions.set(requestedSessionId, session);
			await this.ensureStoredSessionRecord(session, lifecycleGeneration);
			this.assertSessionLifecycleCurrent(requestedSessionId, lifecycleGeneration);
			if (desiredConfig.useSandboxCLI !== void 0) await session.backend.setSandboxMode(desiredConfig.useSandboxCLI, desiredConfig.sandboxDisabledReason).catch((err) => {
				console.warn("[SessionManager] startSession: setSandboxMode failed:", err);
			});
			const effectivePermissionMode = normalizeBackendPermissionMode$2(runtimeConfig.permissionMode);
			this.logDiagnostic("info", "[SessionManager] startSession: syncing permissionMode to backend", {
				sessionId: requestedSessionId,
				runtimePermissionMode: runtimeConfig.permissionMode || "(empty)",
				effectiveMode: effectivePermissionMode
			});
			await session.backend.setSessionMode({ modeId: effectivePermissionMode }).catch((err) => {
				console.warn("[SessionManager] startSession: setSessionMode failed:", err);
			});
			if (kind === "load") this.finishHistoryHydrationAfterBackendReplay(session);
			this.assertSessionLifecycleCurrent(requestedSessionId, lifecycleGeneration);
			if (this.sessions.get(requestedSessionId) !== session) throw new Error(`Session "${requestedSessionId}" startup was superseded by a newer lifecycle`);
			return session;
		} catch (error) {
			const errMsg = error instanceof Error ? error.message : String(error);
			const errStack = error instanceof Error ? error.stack?.slice(0, 500) : "";
			this.logDiagnostic("error", `[SessionManager] startSession FAILED: sessionId=${requestedSessionId}, kind=${kind}, error=${errMsg}`, { stack: errStack });
			if (kind === "load") this.finishHistoryHydration(session);
			if (this.sessions.get(requestedSessionId) === session) {
				this.sessions.delete(requestedSessionId);
				require_workbuddy_auth_product_coordinator.unregisterSessionDeferredBuiltinPolicy(requestedSessionId);
			} else if (!this.sessions.has(requestedSessionId)) require_workbuddy_auth_product_coordinator.unregisterSessionDeferredBuiltinPolicy(requestedSessionId);
			await backend.destroy().catch(() => {});
			throw error;
		}
	}
	wireBackend(session) {
		session.backend.onSessionUpdate = (notification) => {
			session.lastBackendActivityAt = Date.now();
			session.lastBackendMessageAt = Date.now();
			session.hasReceivedBackendActivity = true;
			session.noResponseWatchdog?.resetReportedFlag();
			if (!session.promptTraceId) {
				const notif = notification;
				const updateMeta = notif.update?._meta ?? notif._meta;
				const traceFromUpdate = typeof updateMeta?.["codebuddy.ai/traceId"] === "string" ? updateMeta["codebuddy.ai/traceId"] : void 0;
				if (traceFromUpdate) session.promptTraceId = traceFromUpdate;
			}
			const current = notification;
			const rawPayload = current.sessionId === session.sessionId ? notification : {
				...current,
				sessionId: session.sessionId
			};
			const usageUpdate = tryParseAcpUsageUpdate(rawPayload.update);
			if (usageUpdate) {
				if (this.usageCacheService) {
					const update = rawPayload.update;
					const meta = update?._meta;
					const costObj = update?.cost;
					const stageCredit = typeof costObj?.amount === "number" && Number.isFinite(costObj.amount) && costObj.amount >= 0 ? costObj.amount : void 0;
					const requestIdRaw = meta?.["codebuddy.ai/requestId"];
					const conversationRequestId = typeof requestIdRaw === "string" && requestIdRaw ? requestIdRaw : void 0;
					const existing = this.usageCacheService.getCached(session.sessionId);
					let credit = existing?.credit ? { ...existing.credit } : void 0;
					if (stageCredit !== void 0 && conversationRequestId) {
						if (!credit) credit = {};
						const prev = credit[conversationRequestId] ?? 0;
						credit[conversationRequestId] = prev + stageCredit;
					}
					const usageByCategory = tryParseAcpUsageByCategory(meta) ?? existing?.usageByCategory;
					this.usageCacheService.recordUsage(session.sessionId, {
						used: usageUpdate.used,
						size: usageUpdate.size,
						updatedAt: Date.now(),
						...credit ? { credit } : {},
						...usageByCategory ? { usageByCategory } : {}
					});
				}
				this.emitOrBufferScopedEvent(session, rawPayload);
				return;
			}
			{
				const updateType = rawPayload.update?.sessionUpdate;
				if (updateType === "current_mode_update" || updateType === "config_option_update") rawPayload.modeEpoch = session.modeEpoch;
			}
			if (getTeamMemberEventName(rawPayload)) {
				this.emitOrBufferScopedEvent(session, rawPayload);
				return;
			}
			const preparedPlan = this.preparePlanNotification(session, rawPayload);
			const payload = preparedPlan.payload;
			this.handleHistoryReplayBoundary(session, payload);
			if (this.recordSessionEvent(session, payload) === "duplicate") return;
			this.commitPreparedPlanSnapshot(session, preparedPlan);
			this.captureToolResultFromUpdate(session, payload);
			this.handleBackendSessionUpdate(session, payload);
			this.emitOrBufferScopedEvent(session, payload);
			const derivedPlan = this.createPlanNotificationFromTaskToolResult(session, payload);
			if (derivedPlan) {
				if (this.recordSessionEvent(session, derivedPlan.payload) !== "duplicate") {
					this.commitPreparedPlanSnapshot(session, derivedPlan);
					this.emitOrBufferScopedEvent(session, derivedPlan.payload);
				}
			}
			this.handleHistoryReplayCompletion(session, payload);
		};
		session.backend.onExtNotification = (event) => {
			if (event.method === "elicitation/complete") {
				const elicitationId = typeof event.params?.elicitationId === "string" ? event.params.elicitationId : void 0;
				if (elicitationId && this.settleInputRequest(session, {
					kind: "elicitation",
					elicitationId
				})) this.syncPendingInputStateAfterMutation(session);
			}
			this.emitOrBufferScopedEvent(session, {
				type: "extNotification",
				sessionId: session.sessionId,
				method: event.method,
				params: event.params
			});
		};
		session.backend.onQuestionRequest = (event) => {
			if (isTaskTerminal(session.taskState)) return;
			const receivedAt = Date.now();
			this.applyTaskSignal(session, {
				type: "awaiting_input",
				kind: "question"
			});
			session.pendingQuestionRequests.set(event.toolCallId, {
				toolCallId: event.toolCallId,
				receivedAt,
				request: event.request
			});
			const payload = {
				type: "questionRequest",
				sessionId: session.sessionId,
				toolCallId: event.toolCallId,
				request: event.request
			};
			if (this.recordSessionEvent(session, payload) === "duplicate") return;
			this.emitOrBufferScopedEvent(session, payload);
			this.pushEvent("session:event", payload);
		};
		session.backend.onElicitationRequest = (event) => {
			if (isTaskTerminal(session.taskState)) {
				session.backend.respondElicitation?.(event.elicitationId, "cancel");
				this.logDiagnostic("info", "[SessionManager][Elicitation] terminal turn, auto-cancel", {
					sessionId: session.sessionId,
					elicitationId: event.elicitationId
				});
				return;
			}
			const receivedAt = Date.now();
			this.applyTaskSignal(session, {
				type: "awaiting_input",
				kind: "question"
			});
			session.pendingElicitationRequests.set(event.elicitationId, {
				elicitationId: event.elicitationId,
				receivedAt,
				request: event.request
			});
			const payload = {
				type: "elicitationRequest",
				sessionId: session.sessionId,
				elicitationId: event.elicitationId,
				request: event.request
			};
			const recordResult = this.recordSessionEvent(session, payload);
			this.logDiagnostic("info", "[SessionManager][Elicitation] onElicitationRequest received", {
				sessionId: session.sessionId,
				elicitationId: event.elicitationId,
				toolCallId: this.extractElicitationToolCallId(event.request),
				recordResult
			});
			if (recordResult === "duplicate") return;
			this.emitOrBufferScopedEvent(session, payload);
			this.pushEvent("session:event", payload);
		};
		session.backend.onPermissionRequest = (event) => {
			if (isTaskTerminal(session.taskState)) return;
			const receivedAt = Date.now();
			this.applyTaskSignal(session, {
				type: "awaiting_input",
				kind: "permission"
			});
			const request = {
				...event.params,
				sessionId: session.sessionId
			};
			const payload = {
				type: "permissionRequest",
				sessionId: session.sessionId,
				requestId: event.requestId,
				request
			};
			session.pendingPermissionRequests.set(event.requestId, {
				requestId: event.requestId,
				receivedAt,
				request
			});
			this.emitOrBufferScopedEvent(session, payload);
			this.pushEvent("session:event", payload);
		};
		session.backend.onRuntimeSignal = (signal) => {
			this.applyTaskSignal(session, signal);
		};
		session.backend.onTransportActivity = () => {
			session.lastBackendActivityAt = Date.now();
		};
	}
	requireSession(sessionId) {
		const session = this.sessions.get(sessionId);
		if (session) return session;
		throw new Error(`Session "${sessionId}" not found`);
	}
	emitScoped(sessionId, payload) {
		this.pushEvent(`session:event:${sessionId}`, payload);
		const listeners = this.scopedEventListeners.get(sessionId);
		if (listeners && listeners.size > 0) for (const listener of listeners) try {
			listener(payload);
		} catch {}
	}
	/**
	* 订阅作用域会话事件（与驱动 `session:event:${sessionId}` 的是同一路事件流），
	* 进程内、推送式。供需要低延迟拿到 live agent 输出、又不想轮询的服务端消费者使用
	*（如流式 IM 回复）。返回取消订阅函数。
	*/
	subscribeSessionEvents(sessionId, listener) {
		let listeners = this.scopedEventListeners.get(sessionId);
		if (!listeners) {
			listeners = /* @__PURE__ */ new Set();
			this.scopedEventListeners.set(sessionId, listeners);
		}
		listeners.add(listener);
		return () => {
			const current = this.scopedEventListeners.get(sessionId);
			if (!current) return;
			current.delete(listener);
			if (current.size === 0) this.scopedEventListeners.delete(sessionId);
		};
	}
	emitOrBufferScopedEvent(session, payload) {
		if (this.shouldBufferScopedEventDuringHistoryHydration(session, payload)) {
			session.bufferedScopedEventsDuringHistoryHydration.push(cloneSessionPayload(payload));
			return;
		}
		this.emitScoped(session.sessionId, payload);
	}
	recordSessionEvent(session, payload, options) {
		if (!options?.isReplay) this.updatePromptHistoryState(session, payload);
		if (payload.update) {
			const offset = getOwnerHistoryMode(payload) === "stream" ? null : getOwnerHistoryOffset(payload);
			if (offset !== null) {
				if (session.eventHistory.findIndex((existing) => getOwnerHistoryOffset(existing) === offset) >= 0) return "duplicate";
			}
			const userMessageId = getOwnerHistoryUserMessageId(payload);
			if (userMessageId) {
				const existingIndex = session.eventHistory.findIndex((existing) => getOwnerHistoryUserMessageId(existing) === userMessageId);
				if (existingIndex >= 0) {
					const existing = session.eventHistory[existingIndex];
					const existingSynthetic = isSyntheticOwnerHistoryEvent(existing);
					const incomingSynthetic = isSyntheticOwnerHistoryEvent(payload);
					if (existingSynthetic && !incomingSynthetic) {
						session.eventHistory[existingIndex] = cloneSessionPayload(payload);
						return "replaced";
					}
					return "duplicate";
				}
			}
		}
		const interruptionRequestKey = getOwnerHistoryInterruptionRequestKey(payload);
		if (interruptionRequestKey) {
			const existingIndex = session.eventHistory.findIndex((existing) => getOwnerHistoryInterruptionRequestKey(existing) === interruptionRequestKey);
			if (existingIndex >= 0) {
				const existing = session.eventHistory[existingIndex];
				const existingMode = getOwnerHistoryMode(existing);
				const incomingMode = getOwnerHistoryMode(payload);
				if (existingMode === "history" && incomingMode === "stream") {
					session.eventHistory[existingIndex] = cloneSessionPayload(payload);
					return "replaced";
				}
				return "duplicate";
			}
		}
		const interruptionResolutionKey = getOwnerHistoryInterruptionResolutionKey(payload);
		if (interruptionResolutionKey) {
			const existingIndex = session.eventHistory.findIndex((existing) => getOwnerHistoryInterruptionResolutionKey(existing) === interruptionResolutionKey);
			if (existingIndex >= 0) {
				session.eventHistory[existingIndex] = cloneSessionPayload(payload);
				return "replaced";
			}
		}
		if (payload.update) {
			const update = payload.update;
			if (update.sessionUpdate === "tool_call_update") {
				const toolCallId = update.toolCallId;
				const hasStatus = update.status !== void 0;
				if (toolCallId && !hasStatus) for (let i = session.eventHistory.length - 1; i >= 0; i--) {
					const eu = session.eventHistory[i].update;
					if (!eu) continue;
					if (eu.sessionUpdate === "tool_call_update" && eu.toolCallId === toolCallId && eu.status === void 0) {
						session.eventHistory[i] = cloneSessionPayload(payload);
						return "replaced";
					}
					if (eu.sessionUpdate === "tool_call" || eu.sessionUpdate === "tool_call_update") break;
				}
			}
		}
		session.eventHistory.push(cloneSessionPayload(payload));
		return "added";
	}
	updatePromptHistoryState(session, payload) {
		if (isCompactInternalEventPayload(payload)) {
			session.hasUserMessageSinceLastCompact = false;
			session.lastUserPromptExpertSelection = void 0;
			this.enqueueSessionEffect(session, async () => {
				await this.persistLastUserPromptExpertSelection(session, null);
			}).catch(() => {});
			return;
		}
		if (payload.update?.sessionUpdate === "user_message_chunk") session.hasUserMessageSinceLastCompact = true;
	}
	recordSyntheticUserPromptEvent(session, prompt, meta) {
		if (!Array.isArray(prompt) || prompt.length === 0) return;
		const metaRecord = meta && typeof meta === "object" ? structuredClone(meta) : {};
		const rawCodebuddyMeta = metaRecord["codebuddy.ai"];
		const codebuddyMeta = rawCodebuddyMeta && typeof rawCodebuddyMeta === "object" ? { ...rawCodebuddyMeta } : {};
		const messageId = typeof codebuddyMeta.userMessageId === "string" && codebuddyMeta.userMessageId.trim().length > 0 ? codebuddyMeta.userMessageId : typeof metaRecord.messageId === "string" && metaRecord.messageId.trim().length > 0 ? metaRecord.messageId : (0, node_crypto.randomUUID)();
		codebuddyMeta.messageId = messageId;
		codebuddyMeta.messageRequestId = typeof codebuddyMeta.messageRequestId === "string" && codebuddyMeta.messageRequestId.trim().length > 0 ? codebuddyMeta.messageRequestId : messageId;
		codebuddyMeta.syntheticOwnerHistory = true;
		const payload = {
			sessionId: session.sessionId,
			update: {
				sessionUpdate: "user_message_chunk",
				content: prompt.map((block) => structuredClone(block))
			},
			_meta: {
				...metaRecord,
				"codebuddy.ai": codebuddyMeta
			}
		};
		const recordResult = this.recordSessionEvent(session, payload);
		if (codebuddyMeta.emitSyntheticUserPromptLive) {
			const dedupKey = `${session.sessionId}::${messageId}`;
			if (recordResult === "added" && !this.liveEmittedSyntheticUserPromptKeys.has(dedupKey)) {
				this.liveEmittedSyntheticUserPromptKeys.add(dedupKey);
				this.emitOrBufferScopedEvent(session, payload);
			}
		}
	}
	recordSyntheticQuestionCancelledEvent(session, toolCallId, reason) {
		const payload = {
			type: "questionCancelled",
			sessionId: session.sessionId,
			toolCallId,
			status: "executed",
			questionSkipped: true,
			...reason ? { reason } : {},
			_meta: { "codebuddy.ai": { syntheticOwnerHistory: true } }
		};
		this.recordSessionEvent(session, payload);
		this.emitOrBufferScopedEvent(session, payload);
		this.pushEvent("session:event", payload);
	}
	emitPendingInputs(session) {
		for (const pending of session.pendingPermissionRequests.values()) this.emitScoped(session.sessionId, {
			type: "permissionRequest",
			sessionId: session.sessionId,
			requestId: pending.requestId,
			request: pending.request,
			workbuddyReplayKind: "pendingInput"
		});
		for (const pending of session.pendingQuestionRequests.values()) this.emitScoped(session.sessionId, {
			type: "questionRequest",
			sessionId: session.sessionId,
			toolCallId: pending.toolCallId,
			request: pending.request,
			workbuddyReplayKind: "pendingInput"
		});
		for (const pending of session.pendingElicitationRequests.values()) {
			this.logDiagnostic("info", "[SessionManager][Elicitation] replay pendingElicitation on loadSession", {
				sessionId: session.sessionId,
				elicitationId: pending.elicitationId,
				toolCallId: this.extractElicitationToolCallId(pending.request)
			});
			this.emitScoped(session.sessionId, {
				type: "elicitationRequest",
				sessionId: session.sessionId,
				elicitationId: pending.elicitationId,
				request: pending.request,
				workbuddyReplayKind: "pendingInput"
			});
		}
	}
	emitStoredSessionControlState(session) {
		this.emitPendingInputs(session);
		if (session.planSnapshot) this.emitScoped(session.sessionId, normalizeOwnerHistoryReplayPayload(this.planSnapshotToEvent(session.planSnapshot)));
	}
	emitStoredSessionHistory(session) {
		const historySnapshot = session.eventHistory.map((event) => cloneSessionPayload(event));
		for (const payload of historySnapshot) {
			if (isOwnerInputRequestPayload(payload)) continue;
			this.emitScoped(session.sessionId, normalizeOwnerHistoryReplayPayload(payload));
		}
		if (session.planSnapshot) this.emitScoped(session.sessionId, normalizeOwnerHistoryReplayPayload(this.planSnapshotToEvent(session.planSnapshot)));
	}
	/**
	* live-stream 冲突安全的部分历史 replay。
	*
	* 场景：renderer 冷启（比如小程序建的 session，Desktop UI 第一次点开），
	* daemon 侧 session 正在跑 prompt。此时不能全量 replay eventHistory
	* （见 emitStoredSessionHistory 的注释：会与正在推的 live agent chunk 撞车）。
	*
	* 但用户 prompt (`user_message_chunk`) 是**上一轮**完整发送的、live stream
	* 不会重复推的事件，必须 replay 一次，否则 renderer 拿不到任何 user 消息。
	*
	* 逻辑：只挑 `sessionUpdate === 'user_message_chunk'` 的事件推给 renderer，
	* 其他事件（agent chunks、tool calls、plan updates 等）跳过，让 live stream
	* 自己推。plan snapshot 也不推——避免与 live plan update 撞车。
	*/
	emitStoredSessionHistoryLiveSafe(session) {
		const historySnapshot = session.eventHistory.map((event) => cloneSessionPayload(event));
		let emittedUserMessages = 0;
		for (const payload of historySnapshot) {
			if (isOwnerInputRequestPayload(payload)) continue;
			if (payload?.update?.sessionUpdate !== "user_message_chunk") continue;
			this.emitScoped(session.sessionId, normalizeOwnerHistoryReplayPayload(payload));
			emittedUserMessages += 1;
		}
		this.logDiagnostic("info", "[SessionManager] emitStoredSessionHistoryLiveSafe done", {
			sessionId: session.sessionId,
			totalEvents: historySnapshot.length,
			emittedUserMessages
		});
	}
	planSnapshotToEvent(snapshot) {
		return {
			sessionId: snapshot.sessionId,
			update: cloneSessionPayload(snapshot.update),
			...snapshot._meta ? { _meta: cloneSessionPayload(snapshot._meta) } : {}
		};
	}
	hydrateSessionReplayPayload(session, payload, source) {
		let clonedPayload = cloneSessionPayload(payload);
		const isReplay = source === "history";
		if (clonedPayload.update && typeof clonedPayload.update === "object") {
			const preparedPlan = this.preparePlanNotification(session, clonedPayload);
			clonedPayload = preparedPlan.payload;
			const effectivePayload = isReplay ? normalizeOwnerHistoryReplayPayload(clonedPayload) : clonedPayload;
			if (this.recordSessionEvent(session, effectivePayload, { isReplay }) === "duplicate") return;
			this.commitPreparedPlanSnapshot(session, preparedPlan);
			this.captureToolResultFromUpdate(session, effectivePayload);
			this.handleBackendSessionUpdate(session, effectivePayload);
			const derivedPlan = this.createPlanNotificationFromTaskToolResult(session, effectivePayload);
			if (derivedPlan) {
				const derivedPayload = isReplay ? normalizeOwnerHistoryReplayPayload(derivedPlan.payload) : derivedPlan.payload;
				if (this.recordSessionEvent(session, derivedPayload, { isReplay }) !== "duplicate") this.commitPreparedPlanSnapshot(session, {
					...derivedPlan,
					payload: derivedPayload
				});
			}
			return;
		}
		if (isReplay) clonedPayload = normalizeOwnerHistoryReplayPayload(clonedPayload);
		switch (typeof clonedPayload.type === "string" ? clonedPayload.type : null) {
			case "permissionRequest": {
				const requestId = typeof clonedPayload.requestId === "string" ? clonedPayload.requestId : null;
				const request = clonedPayload.request;
				if (!requestId || !request || typeof request !== "object") return;
				this.applyTaskSignal(session, {
					type: "awaiting_input",
					kind: "permission"
				});
				session.pendingPermissionRequests.set(requestId, {
					requestId,
					receivedAt: Date.now(),
					request: structuredClone(request)
				});
				break;
			}
			case "questionRequest": {
				const toolCallId = typeof clonedPayload.toolCallId === "string" ? clonedPayload.toolCallId : null;
				const request = clonedPayload.request;
				if (!toolCallId || !request || typeof request !== "object") return;
				const requestRecord = request;
				const isPluginRecommendation = requestRecord.inputType === "plugin_recommendation" && !!requestRecord.pluginRecommendation && typeof requestRecord.pluginRecommendation === "object";
				if (isReplay && isPluginRecommendation && !this.pluginRecommendationRegistry?.getPendingRequest(session.sessionId, toolCallId)) return;
				this.applyTaskSignal(session, {
					type: "awaiting_input",
					kind: "question"
				});
				session.pendingQuestionRequests.set(toolCallId, {
					toolCallId,
					receivedAt: Date.now(),
					request: structuredClone(request)
				});
				break;
			}
			case "elicitationRequest": {
				const elicitationId = typeof clonedPayload.elicitationId === "string" ? clonedPayload.elicitationId : null;
				const request = clonedPayload.request;
				if (!elicitationId || !request || typeof request !== "object") return;
				if (isReplay && this.isPluginRecommendationElicitation(request) && !this.pluginRecommendationRegistry?.getPendingRequest(session.sessionId, elicitationId)) return;
				this.applyTaskSignal(session, {
					type: "awaiting_input",
					kind: "question"
				});
				session.pendingElicitationRequests.set(elicitationId, {
					elicitationId,
					receivedAt: Date.now(),
					request: structuredClone(request)
				});
				break;
			}
			case "pluginRecommendationRequest": {
				const recommendationId = typeof clonedPayload.recommendationId === "string" ? clonedPayload.recommendationId : null;
				const request = clonedPayload.request;
				const deadline = clonedPayload.deadline;
				if (!recommendationId || !request || typeof request !== "object" || typeof deadline !== "number") return;
				const req = request;
				this.applyTaskSignal(session, {
					type: "awaiting_input",
					kind: "plugin_recommendation"
				});
				session.pendingPluginRecommendations.set(recommendationId, {
					recommendationId,
					type: req.type,
					deadline,
					receivedAt: Date.now(),
					candidates: req.plugins.map((p) => ({
						pluginId: p.pluginId,
						pluginName: p.pluginName ?? p.pluginId,
						description: p.description ?? ""
					})),
					candidateStates: Object.fromEntries(req.plugins.map((p) => [p.pluginId, "initial"])),
					candidateErrors: {},
					collectedChanges: [],
					countdownCancelled: false,
					settled: false
				});
				break;
			}
			case "questionCancelled": {
				const toolCallId = typeof clonedPayload.toolCallId === "string" ? clonedPayload.toolCallId : null;
				if (!toolCallId) return;
				this.pluginRecommendationRegistry?.cancelRequest(session.sessionId, toolCallId, "the recommendation question was cancelled");
				this.settleInputRequest(session, {
					kind: "tool",
					toolCallId
				});
				this.syncPendingInputStateAfterMutation(session);
				break;
			}
			default: return;
		}
		this.recordSessionEvent(session, clonedPayload, { isReplay });
	}
	async emitSessionRecordUpsert(sessionId) {
		const record = await this.getStoredEventSessionRecord(sessionId);
		if (!record) return;
		this.pushEvent("session:upserted", record);
	}
	async getStoredEventSessionRecord(sessionId) {
		const stored = this.recordStore ? await this.reconcileInactiveStoredEntry(await this.recordStore.getSession(sessionId)) : null;
		if (stored) return this.toSessionRecord(stored);
		const active = this.sessions.get(sessionId);
		return active ? this.toEphemeralSessionRecord(active) : null;
	}
	isArchivedSessionListQuery(filters) {
		return filters?.some((filter) => filter.field === "status" && String(filter.value).split(",").map((value) => value.trim().toLowerCase()).includes("archived")) ?? false;
	}
	applySessionRecordListFilters(records, options, skipArchivedStatusFilter = false) {
		if (!options) return records;
		let filtered = [...records];
		if (options.excludeCwds?.length) {
			const excludeSet = new Set(options.excludeCwds.map((c) => c.toLowerCase()));
			filtered = filtered.filter((record) => !record.cwd || !excludeSet.has(record.cwd.toLowerCase()));
		}
		if (options.title) {
			const keywords = options.title.trim().toLowerCase().split(/\s+/).filter(Boolean);
			filtered = filtered.filter((record) => {
				const name = record.name?.toLowerCase();
				if (!name) return false;
				return keywords.every((kw) => name.includes(kw));
			});
		}
		if (options.filters?.length) for (const filter of options.filters) {
			if (skipArchivedStatusFilter && filter.field === "status" && String(filter.value).toLowerCase().includes("archived")) continue;
			const values = String(filter.value).split(",").map((value) => value.trim().toLowerCase()).filter(Boolean);
			filtered = filtered.filter((record) => {
				if (filter.field === "sessionStatus") return values.includes(normalizeTaskStatus(record.status));
				const fieldValue = this.getSessionRecordField(record, filter.field);
				if (fieldValue === void 0 || fieldValue === null) return false;
				return values.includes(String(fieldValue).trim().toLowerCase());
			});
		}
		if (typeof options.dayRange === "number" && Number.isFinite(options.dayRange) && options.dayRange > 0) {
			const cutoff = /* @__PURE__ */ new Date();
			cutoff.setDate(cutoff.getDate() - (options.dayRange - 1));
			cutoff.setHours(0, 0, 0, 0);
			const cutoffTime = cutoff.getTime();
			filtered = filtered.filter((record) => typeof record.createdAt === "number" && record.createdAt >= cutoffTime);
		}
		if (options.sort) {
			const { orderBy, order = "asc" } = options.sort;
			filtered.sort((left, right) => {
				const leftValue = this.getSessionRecordField(left, orderBy);
				const rightValue = this.getSessionRecordField(right, orderBy);
				if (leftValue == null && rightValue == null) return 0;
				if (leftValue == null) return 1;
				if (rightValue == null) return -1;
				let comparison = 0;
				if (leftValue instanceof Date && rightValue instanceof Date) comparison = leftValue.getTime() - rightValue.getTime();
				else if (typeof leftValue === "string" && typeof rightValue === "string") comparison = leftValue.localeCompare(rightValue);
				else comparison = leftValue < rightValue ? -1 : leftValue > rightValue ? 1 : 0;
				return order === "desc" ? -comparison : comparison;
			});
		}
		return filtered;
	}
	getSessionRecordField(record, field) {
		return record[field];
	}
	async withReadySession(sessionId, action, resumeCwd, options) {
		const session = await this.resolveReadySession(sessionId, resumeCwd);
		await this.prepareBackendForOperation(session, "withReadySession", options);
		return action(session);
	}
	async prepareBackendForOperation(session, context, options) {
		if (options?.skipAwaitRestart) {
			this.logDiagnostic("info", `[SessionManager] SKIP_AWAIT_RESTART sessionId=${session.sessionId} context=${context} hasInFlightRestart=${!!session.pendingBackendRestart}`);
			return;
		}
		await this.awaitPendingBackendRestart(session, context);
		await this.flushPendingRuntimeConfigIfIdle(session, { throwOnRestartError: true });
	}
	async resolveBackendForPromptSend(session) {
		await this.applyPendingRuntimeConfigBeforePrompt(session);
		const prepare = this.onBeforePrompt;
		if (!prepare) return session.backend;
		const backend = session.backend;
		if (await this.runBeforePromptHook(session, prepare, backend)) session.promptPreparedBackend = backend;
		await this.applyPendingRuntimeConfigBeforePrompt(session);
		if (session.backend === backend) return backend;
		return this.resolveBackendForPromptSend(session);
	}
	async runBeforePromptHook(session, hook, backend) {
		try {
			await hook({
				sessionId: session.sessionId,
				desiredConfig: session.desiredConfig,
				backendRestarted: session.promptPreparedBackend !== void 0 && backend !== session.promptPreparedBackend
			});
			return true;
		} catch (hookError) {
			console.warn("[SessionManager] onBeforePrompt hook failed (non-fatal):", hookError);
			return false;
		}
	}
	async awaitPendingBackendRestart(session, context) {
		while (session.pendingBackendRestart) {
			const restartPromise = session.pendingBackendRestart;
			this.logDiagnostic("info", `[SessionManager] AWAITING_IN_FLIGHT_RESTART sessionId=${session.sessionId} context=${context}`);
			await restartPromise.catch(() => {});
			if (session.pendingBackendRestart === restartPromise) await Promise.resolve();
			if (session.pendingBackendRestart === restartPromise) session.pendingBackendRestart = void 0;
		}
	}
	async awaitPendingSessionDisposal(sessionId) {
		await this.pendingSessionDisposals.get(sessionId)?.catch(() => void 0);
	}
	async resolveReadySession(sessionId, resumeCwd) {
		const active = this.sessions.get(sessionId);
		if (active) return active;
		return this.resumeInactiveSessionState(sessionId, resumeCwd);
	}
	async resumeInactiveSessionState(sessionId, cwd) {
		return this.restoreInactiveSessionState(sessionId, cwd, "resume");
	}
	async loadInactiveSessionState(sessionId, cwd) {
		const active = this.sessions.get(sessionId);
		if (active) return active;
		const pendingRestore = this.pendingSessionRestores.get(sessionId);
		if (pendingRestore) {
			if (pendingRestore.kind === "load") return pendingRestore.promise;
			const resumed = await pendingRestore.promise;
			this.beginHistoryHydration(resumed);
			resumed.awaitingHistoryReplayEnd = true;
			resumed.sawHistoryReplayStart = false;
			resumed.sawHistoryReplayContent = false;
			const replayCwd = normalizeCwdPath(resumed.cwd) ?? normalizeCwdPath(cwd);
			if (!replayCwd) throw new Error(`Cannot replay inactive session "${sessionId}" without cwd`);
			try {
				await resumed.backend.loadSession({
					cwd: replayCwd,
					mcpServers: [],
					_meta: resumed._meta
				});
			} finally {
				this.finishHistoryHydrationAfterBackendReplay(resumed);
			}
			return resumed;
		}
		return this.restoreInactiveSessionState(sessionId, cwd, "load");
	}
	async restoreInactiveSessionState(sessionId, cwd, kind) {
		const lifecycleGeneration = this.getSessionLifecycleGeneration(sessionId);
		this.assertSessionLifecycleCurrent(sessionId, lifecycleGeneration);
		const active = this.sessions.get(sessionId);
		if (active) return active;
		const pendingRestore = this.pendingSessionRestores.get(sessionId);
		if (pendingRestore) {
			if (pendingRestore.kind === "load" || pendingRestore.kind === kind) return pendingRestore.promise;
		}
		const restorePromise = (async () => {
			this.logDiagnostic("info", `[SessionManager] restoreInactiveSessionState: sessionId=${sessionId}, kind=${kind}, cwd=${cwd ?? "undefined"}`);
			const requestedCwd = normalizeCwdPath(cwd);
			const storedEntry = await this.resolveStoredEntry(sessionId);
			const primedReplayAtStart = this.primedReplayStates.get(sessionId);
			const recordCwd = normalizeCwdPath(storedEntry?.cwd);
			const replayCwd = normalizeCwdPath(primedReplayAtStart?.cwd);
			let resolvedCwd = recordCwd ?? replayCwd ?? requestedCwd;
			if (requestedCwd && resolvedCwd && resolvedCwd !== requestedCwd) this.logDiagnostic("info", "[SessionManager] restoreInactiveSessionState: using historical cwd over requested cwd", {
				sessionId,
				kind,
				requestedCwd,
				recordCwd,
				replayCwd
			});
			if (!resolvedCwd && storedEntry) {
				const fallbackCwd = normalizeCwdPath(node_fs.mkdtempSync(node_path.join(node_os.tmpdir(), "wb-session-")));
				if (fallbackCwd) {
					this.logDiagnostic("info", "[SessionManager] restoreInactiveSessionState: created isolated fallback cwd for stored session without local cwd", {
						sessionId,
						kind,
						fallbackCwd
					});
					resolvedCwd = fallbackCwd;
				}
			}
			if (!resolvedCwd) throw new Error(`Cannot restore inactive session "${sessionId}" without cwd`);
			const resumed = await this.startSession({
				sessionId,
				cwd: resolvedCwd
			}, kind, lifecycleGeneration);
			const primedReplay = this.primedReplayStates.get(sessionId);
			if (primedReplay) {
				this.replaceSessionReplayState(resumed, primedReplay.events, primedReplay.cwd ?? resolvedCwd);
				this.primedReplayStates.delete(sessionId);
			}
			return resumed;
		})();
		this.pendingSessionRestores.set(sessionId, {
			kind,
			promise: restorePromise
		});
		try {
			return await restorePromise;
		} catch (restoreError) {
			const msg = restoreError instanceof Error ? restoreError.message : String(restoreError);
			this.logDiagnostic("error", `[SessionManager] restoreInactiveSessionState FAILED: sessionId=${sessionId}, kind=${kind}, error=${msg}`);
			throw restoreError;
		} finally {
			if (this.pendingSessionRestores.get(sessionId)?.promise === restorePromise) this.pendingSessionRestores.delete(sessionId);
		}
	}
	getSessionLifecycleGeneration(sessionId) {
		return this.sessionLifecycleGenerations.get(sessionId) ?? 0;
	}
	bumpSessionLifecycleGeneration(sessionId) {
		const generation = this.getSessionLifecycleGeneration(sessionId) + 1;
		this.sessionLifecycleGenerations.set(sessionId, generation);
		return generation;
	}
	beginNewSessionLifecycle(sessionId) {
		this.deletedSessionIds.delete(sessionId);
		return this.bumpSessionLifecycleGeneration(sessionId);
	}
	assertSessionLifecycleCurrent(sessionId, expectedGeneration) {
		if (this.deletedSessionIds.has(sessionId) || this.getSessionLifecycleGeneration(sessionId) !== expectedGeneration) throw new Error(`Session "${sessionId}" startup was superseded by permanent deletion`);
	}
	resolveTargetSessionId(preferredSessionId) {
		if (preferredSessionId) return preferredSessionId;
		return this.sessions.keys().next().value ?? null;
	}
	async ensureStoredSessionRecord(session, lifecycleGeneration) {
		const recordStore = this.recordStore;
		if (!recordStore) return;
		await this.enqueueSessionEffect(session, async () => {
			this.assertSessionLifecycleCurrent(session.sessionId, lifecycleGeneration);
			const existing = await recordStore.getSession(session.sessionId);
			this.assertSessionLifecycleCurrent(session.sessionId, lifecycleGeneration);
			const sessionSourceMode = readSessionSourceMode(session._meta);
			const isBackgroundAutomation = readIsBackgroundAutomation(session._meta);
			const pluginContext = session.persistPluginContext ? projectSessionPluginContext(session.desiredConfig) : void 0;
			if (existing) {
				const next = {
					...existing,
					...!existing.userId && session.userId ? { userId: session.userId } : {},
					...!existing.sourceMode && sessionSourceMode ? { sourceMode: sessionSourceMode } : {},
					...!existing.isBackgroundAutomation && isBackgroundAutomation ? { isBackgroundAutomation } : {},
					...!existing.mode && session.desiredConfig.mode ? { mode: session.desiredConfig.mode } : {},
					...!existing.model && session.desiredConfig.model ? { model: session.desiredConfig.model } : {},
					...!existing.expertId && session.desiredConfig.expertId ? { expertId: session.desiredConfig.expertId } : {},
					...!existing.expertLocale && session.desiredConfig.expertId && session.desiredConfig.locale ? { expertLocale: session.desiredConfig.locale } : {},
					...!existing.expertRuntimeIdentity && session.desiredConfig.expertId && session.desiredConfig.runtimeIdentity ? { expertRuntimeIdentity: session.desiredConfig.runtimeIdentity } : {},
					...!existing.expertMarketplace && session.desiredConfig.expertId && session.desiredConfig.expertMarketplace ? { expertMarketplace: session.desiredConfig.expertMarketplace } : {},
					...!existing.lastUserPromptExpertSelection ? { lastUserPromptExpertSelection: toPersistedExpertSelectionState(session.lastUserPromptExpertSelection) } : {},
					...!existing.projectId && session.projectId ? { projectId: session.projectId } : {},
					...pluginContext ? { pluginContext } : {}
				};
				if (next.userId !== existing.userId || next.sourceMode !== existing.sourceMode || next.isBackgroundAutomation !== existing.isBackgroundAutomation || next.mode !== existing.mode || next.model !== existing.model || next.expertId !== existing.expertId || next.expertLocale !== existing.expertLocale || next.expertRuntimeIdentity !== existing.expertRuntimeIdentity || next.expertMarketplace !== existing.expertMarketplace || stableJsonStringify$1(next.lastUserPromptExpertSelection) !== stableJsonStringify$1(existing.lastUserPromptExpertSelection) || next.projectId !== existing.projectId || stableJsonStringify$1(next.pluginContext) !== stableJsonStringify$1(existing.pluginContext)) await recordStore.upsertSession(next);
				return;
			}
			await recordStore.upsertSession(this.toStoredSessionRecord(session));
		});
	}
	async upsertSessionRecord(sessionId, transform) {
		if (!this.recordStore) return;
		const fallback = await this.recordStore.getSession(sessionId) ?? this.toStoredSessionRecord(this.requireSession(sessionId));
		const activeMeta = this.sessions.get(sessionId)?._meta;
		const activeSourceMode = readSessionSourceMode(activeMeta);
		const activeIsBackgroundAutomation = readIsBackgroundAutomation(activeMeta);
		const activeUserId = this.sessions.get(sessionId)?.userId;
		const next = transform({
			...fallback,
			...!fallback.userId && activeUserId ? { userId: activeUserId } : {},
			...!fallback.sourceMode && activeSourceMode ? { sourceMode: activeSourceMode } : {},
			...!fallback.isBackgroundAutomation && activeIsBackgroundAutomation ? { isBackgroundAutomation: true } : {}
		});
		const active = this.sessions.get(sessionId);
		if (active) {
			active.updatedAt = next.updatedAt;
			active.lastActivityAt = next.lastActivityAt;
		}
		await this.recordStore.upsertSession(next);
	}
	async persistLastUserPromptExpertSelection(session, selectionOverride) {
		try {
			const selection = selectionOverride === null ? void 0 : selectionOverride ?? session.lastUserPromptExpertSelection;
			await this.upsertSessionRecord(session.sessionId, (current) => ({
				...current,
				lastUserPromptExpertSelection: toPersistedExpertSelectionState(selection),
				updatedAt: current.updatedAt
			}));
		} catch (error) {
			this.logDiagnostic("warn", "[SessionManager] failed to persist expert selection prompt state", {
				sessionId: session.sessionId,
				error: error instanceof Error ? error.message : String(error)
			});
		}
	}
	enqueueSessionEffect(session, effect) {
		const sessionId = session.sessionId;
		if (this.sessions.get(sessionId) !== session) return Promise.resolve();
		const next = (this.sessionEffectChains.get(sessionId) ?? Promise.resolve()).catch(() => {}).then(effect).finally(() => {
			if (this.sessionEffectChains.get(sessionId) === next) this.sessionEffectChains.delete(sessionId);
		});
		this.sessionEffectChains.set(sessionId, next);
		return next;
	}
	enqueueSessionRecordUpsert(session) {
		this.enqueueSessionEffect(session, async () => {
			await this.emitSessionRecordUpsert(session.sessionId);
		});
	}
	scheduleDebouncedSidebarMetaUpdate(session) {
		const sessionId = session.sessionId;
		this.clearSidebarMetaDebounce(sessionId);
		const timer = setTimeout(() => {
			this.sidebarMetaDebounceTimers.delete(sessionId);
			if (!this.sessions.has(sessionId)) return;
			const currentStatus = deriveTaskStatus(session.taskState);
			this.enqueueSessionEffect(session, async () => {
				await this.persistDerivedTaskStatus(sessionId, currentStatus, session.taskState.lastTransitionAt, session.taskState.lastActivityAt);
				await this.emitSessionRecordUpsert(sessionId);
			});
		}, SessionManager.SIDEBAR_META_DEBOUNCE_MS);
		this.sidebarMetaDebounceTimers.set(sessionId, timer);
	}
	clearSidebarMetaDebounce(sessionId) {
		const existing = this.sidebarMetaDebounceTimers.get(sessionId);
		if (existing !== void 0) {
			clearTimeout(existing);
			this.sidebarMetaDebounceTimers.delete(sessionId);
		}
	}
	async flushSessionEffects(sessionId) {
		await (this.sessionEffectChains.get(sessionId) ?? Promise.resolve());
	}
	/**
	* 判断 session 是否存在 pending / in_progress 的 tool_call。
	*
	* `session.toolResults` 由 `captureToolResultFromUpdate` 按 ACP tool_call /
	* tool_call_update 事件增量维护，status 字段直接映射协议状态。
	*
	* 非 terminal 的 ACP tool_call 状态包括：
	* - `pending`：工具已创建但尚未开始执行
	* - `in_progress`：工具正在执行（典型：BashTool 长时间运行的子进程）
	*
	* Terminal 状态：`completed` / `failed`（与 agent-cli 的 AcpUtils 对齐）。
	*
	* 用途：经 `toSessionInfo()` 暴露为 `hasActiveToolCalls`，供
	* SessionManager 内建 runtime reclaim 保护正在等待 MCP 工具返回的 session，避免
	* 因"长时间无 session_update"被误回收。
	*/
	hasActiveToolCall(session) {
		for (const entry of session.toolResults.values()) if (isActiveToolResultStatus(entry.status)) return true;
		return false;
	}
	/**
	* 轮次落终态时清理隶属该轮的挂起态：授权 / 提问映射 + 残留的 in_progress 工具。
	*
	* 一个 permission / question 请求与一次 prompt turn 绑定；turn 结束（end_turn /
	* cancelled / failed / terminated）后它们即失效，必须清掉，否则：
	*   - 迟到的 respondToPermission 会经 syncPendingInputStateAfterMutation → input_resolved
	*     把已完成轮次复活成 working（典型：sandbox 授权超时被 agent 本地 deny 后用户才点）；
	*   - 残留的 in_progress 工具让 toSessionInfo 暴露的 hasActiveToolCalls 误报“仍在执行”。
	*
	* 仅在 applyTaskSignal 检测到“非终态 → 终态”跃迁时调用。team 由 shouldDeferTurnCompletion
	* 把 terminal 信号推迟到 team 真正 idle，故调用时机已保证不会误清进行中成员的挂起态。
	*/
	clearTurnScopedPendingState(session) {
		if (!this.pluginRecommendationRunSwitches.has(session.sessionId)) this.pluginRecommendationRegistry?.cancelSession(session.sessionId, "the session turn ended");
		this.settleInputRequest(session, { kind: "all" });
		const now = Date.now();
		for (const [toolCallId, entry] of session.toolResults) if (isActiveToolResultStatus(entry.status)) session.toolResults.set(toolCallId, {
			...entry,
			status: "failed",
			updatedAt: now
		});
	}
	applyTaskSignal(session, signal, phase) {
		const previousTaskState = session.taskState;
		const wasTerminal = isTaskTerminal(previousTaskState);
		const previousStatus = deriveTaskStatus(previousTaskState);
		if (signal.type === "turn_started" && previousTaskState.turnSeq === 0) session._taskStartedAt ??= signal.timestamp ?? Date.now();
		session.taskState = reduceTaskStatus(previousTaskState, signal);
		const nextStatus = deriveTaskStatus(session.taskState);
		appendStateTransitionEntry(session.stateTransitionLog, {
			signal: signal.type,
			timestamp: signal.timestamp ?? Date.now(),
			fromRunState: previousTaskState.runState,
			toRunState: session.taskState.runState,
			fromTaskStatus: previousStatus,
			toTaskStatus: nextStatus,
			phase
		});
		session.lastSignalReceivedAt = Date.now();
		if (session.taskState.runState === "awaiting_input" && previousTaskState.runState !== "awaiting_input") session.awaitingInputStartedAt = Date.now();
		if (session.taskState.runState !== "awaiting_input" && previousTaskState.runState === "awaiting_input") session.awaitingInputStartedAt = void 0;
		if (signal.type === "awaiting_input") session.hasPendingInput = true;
		if (signal.type === "input_resolved") session.hasPendingInput = false;
		if (!wasTerminal && isTaskTerminal(session.taskState)) this.clearTurnScopedPendingState(session);
		const statusChanged = previousStatus !== nextStatus;
		const sidebarMetaChanged = previousTaskState.lastTransitionAt !== session.taskState.lastTransitionAt || previousTaskState.lastActivityAt !== session.taskState.lastActivityAt || previousTaskState.pendingInputKind !== session.taskState.pendingInputKind;
		if (!statusChanged && !sidebarMetaChanged) return;
		if (statusChanged) {
			this.logDiagnostic("info", "[SessionManager] task state transition", {
				sessionId: session.sessionId,
				signal: signal.type,
				from: previousStatus,
				to: nextStatus,
				turnSeq: session.taskState.turnSeq
			});
			this.emitTerminalTaskEvent(session, previousStatus, nextStatus);
			this.clearSidebarMetaDebounce(session.sessionId);
			this.enqueueSessionEffect(session, async () => {
				await this.persistDerivedTaskStatus(session.sessionId, nextStatus, session.taskState.lastTransitionAt, session.taskState.lastActivityAt);
				await this.emitSessionRecordUpsert(session.sessionId);
			});
		} else this.scheduleDebouncedSidebarMetaUpdate(session);
	}
	applyExplicitTaskStatus(session, status) {
		const previousStatus = deriveTaskStatus(session.taskState);
		const wasTerminal = isTaskTerminal(session.taskState);
		session.taskState = applyManualTaskStatus(session.taskState, status);
		const nextStatus = deriveTaskStatus(session.taskState);
		if (!wasTerminal && isTaskTerminal(session.taskState)) this.clearTurnScopedPendingState(session);
		if (previousStatus === nextStatus) return;
		this.emitTerminalTaskEvent(session, previousStatus, nextStatus);
		this.enqueueSessionEffect(session, async () => {
			await this.persistDerivedTaskStatus(session.sessionId, nextStatus, session.taskState.lastTransitionAt, session.taskState.lastActivityAt);
			await this.emitSessionRecordUpsert(session.sessionId);
		});
	}
	/**
	* 任务状态机迁入终态时上报 telemetry 事件（Issue #46366）。
	*
	* 仅当宿主通过 SessionManagerOptions.reportTelemetry 注入了上报钩子时生效；
	* 未注入时静默跳过，保持 workbuddy domain 层零运行时埋点依赖。
	*
	* - completed → 'agent_task_completed'
	* - failed / error / terminated → 'agent_task_failed'（terminal_outcome 区分）
	*
	* 由调用方保证 previousStatus !== nextStatus，本方法仍做防御式早 return。
	* archived 由 UI 侧 'agent_task_archived' 独立事件覆盖，不在此处触发。
	*/
	emitTerminalTaskEvent(session, previousStatus, nextStatus) {
		if (!this.reportTelemetry) return;
		if (previousStatus === nextStatus) return;
		const effectiveStatus = nextStatus === "terminated" && isCancelledStopReason(session.taskState.terminationReason) ? "completed" : nextStatus;
		const isCompleted = effectiveStatus === "completed";
		if (!isCompleted && !(effectiveStatus === "failed" || effectiveStatus === "error" || effectiveStatus === "terminated")) return;
		const startedAt = session._taskStartedAt;
		const finishedAt = session.taskState.lastTransitionAt;
		const duration_ms = startedAt ? Math.max(0, finishedAt - startedAt) : 0;
		const total_steps = session.taskState.turnSeq;
		try {
			if (isCompleted) this.reportTelemetry("agent_task_completed", {
				mode: "LOCAL",
				task_id: session.sessionId,
				duration_ms,
				total_steps
			});
			else this.reportTelemetry("agent_task_failed", {
				mode: "LOCAL",
				task_id: session.sessionId,
				duration_ms,
				total_steps,
				terminal_outcome: effectiveStatus
			});
		} catch (error) {
			this.logDiagnostic("info", "[SessionManager] terminal task telemetry failed", {
				sessionId: session.sessionId,
				nextStatus,
				error: formatDiagnosticDetails(error)
			});
		}
	}
	async persistDerivedTaskStatus(sessionId, status, updatedAt, lastActivityAt) {
		if (!this.recordStore) return;
		if (status === "pending" || status === "planning" || status === "working") this.logDiagnostic("info", "[SessionManager] persistDerivedTaskStatus: writing non-terminal status to DB", {
			sessionId,
			status,
			updatedAt,
			stack: (/* @__PURE__ */ new Error()).stack?.split("\n").slice(1, 4).map((s) => s.trim()).join(" | ")
		});
		await this.upsertSessionRecord(sessionId, (current) => ({
			...current,
			status,
			updatedAt,
			lastActivityAt: lastActivityAt ?? current.lastActivityAt,
			archivedAt: status === "archived" ? current.archivedAt ?? Date.now() : current.archivedAt
		}));
	}
	preparePlanNotification(session, notification) {
		const update = notification.update;
		if (!isRecord$3(update) || update.sessionUpdate !== "plan") return { payload: notification };
		return this.createPreparedPlanNotification(session, notification, update);
	}
	createPreparedPlanNotification(session, notification, update) {
		const now = Date.now();
		const revision = this.resolvePlanRevision(session, notification, update);
		const entries = this.normalizePlanEntries(update.entries);
		const notificationMeta = this.withPlanOwnerMeta(isRecord$3(notification._meta) ? notification._meta : void 0, revision, now);
		const updateMeta = this.withPlanOwnerMeta(isRecord$3(update._meta) ? update._meta : void 0, revision, now);
		const normalizedUpdate = {
			...update,
			sessionUpdate: "plan",
			entries,
			_meta: updateMeta
		};
		return {
			payload: {
				...notification,
				sessionId: session.sessionId,
				update: normalizedUpdate,
				_meta: notificationMeta
			},
			snapshot: {
				sessionId: session.sessionId,
				update: cloneSessionPayload(normalizedUpdate),
				_meta: cloneSessionPayload(notificationMeta),
				revision,
				updatedAt: now
			}
		};
	}
	commitPreparedPlanSnapshot(session, prepared) {
		if (!prepared.snapshot) return;
		session.planSnapshot = cloneSessionPayload(prepared.snapshot);
	}
	resolvePlanRevision(session, notification, update) {
		const explicitRevision = this.readPlanRevision(notification._meta) ?? this.readPlanRevision(update._meta);
		const currentRevision = session.planSnapshot?.revision ?? 0;
		if (typeof explicitRevision === "number" && Number.isFinite(explicitRevision)) return Math.max(explicitRevision, currentRevision + 1);
		return currentRevision + 1;
	}
	readPlanRevision(meta) {
		if (!isRecord$3(meta)) return;
		const codebuddyMeta = isRecord$3(meta["codebuddy.ai"]) ? meta["codebuddy.ai"] : void 0;
		const revision = codebuddyMeta?.planRevision ?? codebuddyMeta?.revision;
		return typeof revision === "number" ? revision : void 0;
	}
	withPlanOwnerMeta(meta, revision, updatedAt) {
		const nextMeta = cloneSessionPayload(meta ?? {});
		nextMeta["codebuddy.ai"] = {
			...isRecord$3(nextMeta["codebuddy.ai"]) ? { ...nextMeta["codebuddy.ai"] } : {},
			isFullPlanSnapshot: true,
			planOwner: "session-manager",
			planRevision: revision,
			planUpdatedAt: updatedAt
		};
		return nextMeta;
	}
	normalizePlanEntries(entries) {
		if (!Array.isArray(entries)) return [];
		return entries.map((entry, index) => {
			const record = isRecord$3(entry) ? entry : { content: String(entry ?? "") };
			const rawMeta = isRecord$3(record._meta) ? cloneSessionPayload(record._meta) : {};
			const rawCodebuddyMeta = isRecord$3(rawMeta["codebuddy.ai"]) ? rawMeta["codebuddy.ai"] : {};
			const id = this.pickString(rawCodebuddyMeta.id, rawMeta.id, record.id) ?? `task-${index}`;
			const activeForm = this.pickString(rawCodebuddyMeta.activeForm, record.activeForm);
			const dependencies = this.pickStringArray(rawCodebuddyMeta.dependencies, rawMeta.dependencies, record.dependencies, record.blockedBy);
			const order = this.pickNumber(rawCodebuddyMeta.order, rawMeta.order, record.order) ?? index;
			const nextCodebuddyMeta = {
				...rawCodebuddyMeta,
				id,
				order
			};
			if (activeForm) nextCodebuddyMeta.activeForm = activeForm;
			if (dependencies.length > 0) nextCodebuddyMeta.dependencies = dependencies;
			const nextMeta = {
				...rawMeta,
				id,
				"codebuddy.ai": nextCodebuddyMeta
			};
			if (dependencies.length > 0) nextMeta.dependencies = dependencies;
			const createdAt = this.pickNumber(record.createdAt);
			const updatedAt = this.pickNumber(record.updatedAt);
			return {
				content: this.pickString(record.content, record.subject, record.title) ?? "",
				status: this.normalizePlanEntryStatus(record.status),
				priority: this.normalizePlanPriority(record.priority),
				...createdAt !== void 0 ? { createdAt } : {},
				...updatedAt !== void 0 ? { updatedAt } : {},
				_meta: nextMeta
			};
		});
	}
	createPlanNotificationFromTaskToolResult(session, notification) {
		const update = notification.update;
		if (!isRecord$3(update) || update.sessionUpdate !== "tool_call_update") return;
		if (update.status !== "completed") return;
		const toolName = this.extractToolNameForPlanDerivation(session, update);
		if (!toolName || ![
			"TaskCreate",
			"TaskUpdate",
			"TaskList"
		].includes(toolName)) return;
		const rawResponse = this.extractTaskRawResponse(update);
		const rawEntries = Array.isArray(rawResponse?.todos) ? rawResponse.todos : Array.isArray(rawResponse?.tasks) ? rawResponse.tasks : void 0;
		if (!rawEntries) return;
		const planUpdate = {
			sessionUpdate: "plan",
			entries: rawEntries
		};
		const planNotification = {
			sessionId: session.sessionId,
			update: planUpdate,
			_meta: { "codebuddy.ai": {
				source: toolName,
				derivedFromToolCallId: typeof update.toolCallId === "string" ? update.toolCallId : void 0
			} }
		};
		return this.createPreparedPlanNotification(session, planNotification, planUpdate);
	}
	extractToolNameForPlanDerivation(session, update) {
		const meta = isRecord$3(update._meta) ? update._meta : void 0;
		const flatToolName = meta?.["codebuddy.ai/toolName"];
		if (typeof flatToolName === "string") return flatToolName;
		const nestedToolName = (meta && isRecord$3(meta["codebuddy.ai"]) ? meta["codebuddy.ai"] : void 0)?.toolName;
		if (typeof nestedToolName === "string") return nestedToolName;
		const toolCallId = typeof update.toolCallId === "string" ? update.toolCallId : void 0;
		return toolCallId ? session.toolResults.get(toolCallId)?.toolName : void 0;
	}
	extractTaskRawResponse(update) {
		const rawOutput = update.rawOutput;
		if (isRecord$3(rawOutput)) {
			if (isRecord$3(rawOutput.rawResponse)) return cloneSessionPayload(rawOutput.rawResponse);
			if (rawOutput.task != null || rawOutput.tasks != null || rawOutput.todos != null || rawOutput.taskId != null || rawOutput.deleted != null) return cloneSessionPayload(rawOutput);
		}
		const meta = isRecord$3(update._meta) ? update._meta : void 0;
		const direct = meta?.["codebuddy.ai/rawResponse"];
		if (isRecord$3(direct)) return cloneSessionPayload(direct);
		const codebuddyMeta = meta && isRecord$3(meta["codebuddy.ai"]) ? meta["codebuddy.ai"] : void 0;
		if (isRecord$3(codebuddyMeta?.rawResponse)) return cloneSessionPayload(codebuddyMeta.rawResponse);
	}
	normalizePlanEntryStatus(value) {
		switch (value) {
			case "in_progress": return "in_progress";
			case "completed": return "completed";
			case "cancelled":
			case "deleted": return "cancelled";
			default: return "pending";
		}
	}
	normalizePlanPriority(value) {
		switch (value) {
			case "low":
			case "medium":
			case "high": return value;
			default: return;
		}
	}
	pickString(...values) {
		for (const value of values) if (typeof value === "string" && value.trim().length > 0) return value.trim();
	}
	pickNumber(...values) {
		for (const value of values) if (typeof value === "number" && Number.isFinite(value)) return value;
	}
	pickStringArray(...values) {
		for (const value of values) {
			if (!Array.isArray(value)) continue;
			const strings = value.filter((item) => typeof item === "string").map((item) => item.trim()).filter(Boolean);
			if (strings.length > 0) return strings;
		}
		return [];
	}
	handleBackendSessionUpdate(session, notification) {
		const update = notification.update ?? {};
		if ((typeof update.sessionUpdate === "string" ? update.sessionUpdate : "") === "tool_call_update" && typeof update.toolCallId === "string" && isTerminalToolCallStatus(update.status)) {
			if (this.settleInputRequest(session, {
				kind: "tool",
				toolCallId: update.toolCallId
			})) this.syncPendingInputStateAfterMutation(session);
		}
		const runtimeSignal = this.extractRuntimeSignalFromNotification(notification);
		if (runtimeSignal && this.shouldApplyRuntimeSignalFromNotification(session, notification, runtimeSignal)) this.applyTaskSignal(session, runtimeSignal, this.extractPhaseFromNotification(notification));
		this.handleTeamRuntimeUpdate(session, notification);
		const title = this.extractMeaningfulTitle(notification);
		if (!title) return;
		const isHistoryReplay = getOwnerHistoryMode(notification) === "history" || session.historyHydrationDepth > 0;
		this.enqueueSessionEffect(session, async () => {
			await this.upsertSessionRecord(session.sessionId, (current) => ({
				...current,
				customTitle: current.customTitle,
				title: current.customTitle ? current.title : title,
				updatedAt: isHistoryReplay ? current.updatedAt : Date.now()
			}));
			await this.emitSessionRecordUpsert(session.sessionId);
		});
	}
	shouldApplyRuntimeSignalFromNotification(session, notification, signal) {
		if (getOwnerHistoryMode(notification) === "history") return false;
		switch (signal.type) {
			case "planning_started":
			case "working_started":
			case "turn_completed":
			case "turn_failed":
			case "runtime_errored":
			case "runtime_terminated": return session.isProcessing || session.stopRequested;
			case "awaiting_input": return session.isProcessing;
			default: return true;
		}
	}
	handleTeamRuntimeUpdate(session, notification) {
		const teamUpdate = extractTeamUpdate(notification);
		if (!teamUpdate) return;
		switch (teamUpdate.type) {
			case "team_created":
				delete session.teamRuntime.teamName;
				delete session.teamRuntime.isAutoTeam;
				this.updateTeamRuntimeMetadata(session, teamUpdate);
				session.teamRuntime.membersByName.clear();
				session.teamRuntime.teamActive = true;
				session.teamRuntime.teamTrulyIdle = false;
				this.enqueueSessionRecordUpsert(session);
				return;
			case "team_deleted": {
				this.updateTeamRuntimeMetadata(session, teamUpdate);
				const deletedAfterTerminal = this.isTurnCompletionAlreadyFinalized(session) || isTaskTerminal(session.taskState) || session.teamRuntime.teamTrulyIdle === true;
				if (deletedAfterTerminal) this.settleActiveTeamMembers(session);
				session.teamRuntime.teamActive = false;
				session.teamRuntime.teamTrulyIdle = deletedAfterTerminal ? true : void 0;
				if (!deletedAfterTerminal && (session.teamRuntime.deferredCompletion || session.isProcessing)) session.teamRuntime.teamTrulyIdle = false;
				this.logDiagnostic("info", "[SessionManager/Team] team_deleted received", {
					sessionId: session.sessionId,
					hasDeferred: !!session.teamRuntime.deferredCompletion,
					teamTrulyIdle: session.teamRuntime.teamTrulyIdle
				});
				this.enqueueSessionRecordUpsert(session);
				return;
			}
			case "member_status_change": {
				const hadMembersBeforeUpdate = session.teamRuntime.membersByName.size > 0;
				this.updateTeamRuntimeMetadata(session, teamUpdate);
				this.updateTeamMembers(session, teamUpdate.members);
				if (this.isTurnCompletionAlreadyFinalized(session) || isTaskTerminal(session.taskState)) {
					if (this.shouldReactivateTerminalTeamTurn(session, hadMembersBeforeUpdate) && this.hasActiveTeamMembers(session)) {
						this.reactivateTerminalTeamTurn(session, "member_status_change");
						this.enqueueSessionRecordUpsert(session);
						return;
					}
					session.teamRuntime.teamActive = false;
					session.teamRuntime.teamTrulyIdle = true;
					this.settleActiveTeamMembers(session);
					this.logDiagnostic("debug", "[SessionManager/Team] ignored member_status_change after terminal turn", {
						sessionId: session.sessionId,
						memberCount: Array.isArray(teamUpdate.members) ? teamUpdate.members.length : 0
					});
					this.enqueueSessionRecordUpsert(session);
					return;
				}
				session.teamRuntime.teamActive = true;
				if (session.teamRuntime.teamTrulyIdle !== true || this.hasActiveTeamMembers(session)) session.teamRuntime.teamTrulyIdle = false;
				this.logDiagnostic("debug", "[SessionManager/Team] member_status_change received", {
					sessionId: session.sessionId,
					memberCount: Array.isArray(teamUpdate.members) ? teamUpdate.members.length : 0,
					activeCount: this.countActiveTeamMembers(session),
					hasDeferred: !!session.teamRuntime.deferredCompletion
				});
				this.maybeFinalizeDeferredTeamCompletion(session);
				this.enqueueSessionRecordUpsert(session);
				return;
			}
			case "team_idle":
				this.updateTeamRuntimeMetadata(session, teamUpdate);
				session.teamRuntime.teamTrulyIdle = true;
				this.settleActiveTeamMembers(session);
				this.logDiagnostic("info", "[SessionManager/Team] team_idle received", {
					sessionId: session.sessionId,
					hasDeferred: !!session.teamRuntime.deferredCompletion
				});
				this.maybeFinalizeDeferredTeamCompletion(session);
				this.enqueueSessionRecordUpsert(session);
				return;
			case "team_busy":
				this.updateTeamRuntimeMetadata(session, teamUpdate);
				if (this.isTurnCompletionAlreadyFinalized(session) || isTaskTerminal(session.taskState)) {
					if (this.shouldReactivateTerminalTeamTurn(session, session.teamRuntime.membersByName.size > 0)) {
						this.reactivateTerminalTeamTurn(session, "team_busy");
						this.enqueueSessionRecordUpsert(session);
						return;
					}
					session.teamRuntime.teamActive = false;
					session.teamRuntime.teamTrulyIdle = true;
					this.settleActiveTeamMembers(session);
					this.logDiagnostic("info", "[SessionManager/Team] ignored team_busy after terminal turn", {
						sessionId: session.sessionId,
						hasDeferred: !!session.teamRuntime.deferredCompletion
					});
					this.enqueueSessionRecordUpsert(session);
					return;
				}
				session.teamRuntime.teamActive = true;
				session.teamRuntime.teamTrulyIdle = false;
				this.logDiagnostic("info", "[SessionManager/Team] team_busy received", {
					sessionId: session.sessionId,
					hasDeferred: !!session.teamRuntime.deferredCompletion
				});
				this.enqueueSessionRecordUpsert(session);
				return;
			default: return;
		}
	}
	updateTeamRuntimeMetadata(session, teamUpdate) {
		if (typeof teamUpdate.teamName === "string" && teamUpdate.teamName.trim()) session.teamRuntime.teamName = teamUpdate.teamName.trim();
		if (typeof teamUpdate.isAutoTeam === "boolean") session.teamRuntime.isAutoTeam = teamUpdate.isAutoTeam;
		session.teamRuntime.updatedAt = Date.now();
	}
	resetTeamRuntimeForNewTurn(session) {
		const hadTeamRuntime = session.teamRuntime.updatedAt !== void 0 || session.teamRuntime.teamTrulyIdle !== void 0 || session.teamRuntime.teamActive !== void 0 || session.teamRuntime.membersByName.size > 0 || !!session.teamRuntime.teamName || session.teamRuntime.isAutoTeam !== void 0 || !!session.teamRuntime.deferredCompletion || session.teamRuntime.lastCompletedTurnSeq !== void 0 || session.teamRuntime.lastCompletedStopReason !== void 0;
		session.teamRuntime.membersByName.clear();
		delete session.teamRuntime.teamName;
		delete session.teamRuntime.isAutoTeam;
		delete session.teamRuntime.deferredCompletion;
		delete session.teamRuntime.lastCompletedTurnSeq;
		delete session.teamRuntime.lastCompletedStopReason;
		delete session.teamRuntime.teamTrulyIdle;
		if (hadTeamRuntime) {
			session.teamRuntime.teamActive = false;
			session.teamRuntime.updatedAt = Date.now();
		} else {
			delete session.teamRuntime.teamActive;
			delete session.teamRuntime.updatedAt;
		}
	}
	updateTeamMembers(session, members) {
		if (!Array.isArray(members)) return;
		session.teamRuntime.membersByName.clear();
		for (const member of members) {
			if (!member || typeof member !== "object") continue;
			const snapshot = this.toTeamMemberRuntimeState(member);
			if (!snapshot) continue;
			session.teamRuntime.membersByName.set(snapshot.name, snapshot);
		}
	}
	settleActiveTeamMembers(session) {
		for (const member of session.teamRuntime.membersByName.values()) if (isActiveTeamMemberStatus(member.status)) member.status = "completed";
	}
	toTeamMemberRuntimeState(member) {
		const name = typeof member.name === "string" ? member.name.trim() : "";
		if (!name) return null;
		const snapshot = {
			name,
			status: typeof member.status === "string" ? normalizeTeamMemberStatus(member.status) : "pending"
		};
		if (typeof member.color === "string") snapshot.color = member.color;
		if (typeof member.description === "string") snapshot.description = member.description;
		if (typeof member.taskId === "string") snapshot.taskId = member.taskId;
		if (typeof member.sessionId === "string") snapshot.sessionId = member.sessionId;
		if (member.tokenUsage && typeof member.tokenUsage === "object") {
			const tokenUsage = member.tokenUsage;
			const inputTokens = typeof tokenUsage.inputTokens === "number" ? tokenUsage.inputTokens : void 0;
			const outputTokens = typeof tokenUsage.outputTokens === "number" ? tokenUsage.outputTokens : void 0;
			if (inputTokens !== void 0 || outputTokens !== void 0) snapshot.tokenUsage = {
				inputTokens: inputTokens ?? 0,
				outputTokens: outputTokens ?? 0,
				lastContextWindow: typeof tokenUsage.lastContextWindow === "number" ? tokenUsage.lastContextWindow : void 0
			};
		}
		if (typeof member.toolCallCount === "number") snapshot.toolCallCount = member.toolCallCount;
		if (member.lastFailure && typeof member.lastFailure === "object") {
			const failure = member.lastFailure;
			const errorText = typeof failure.error === "string" ? failure.error.trim() : "";
			if (errorText) snapshot.lastFailure = {
				error: errorText,
				...typeof failure.category === "string" && failure.category ? { category: failure.category } : {}
			};
		}
		return snapshot;
	}
	shouldDeferTurnCompletion(session) {
		if (session.teamRuntime.teamTrulyIdle === true) return false;
		if (session.teamRuntime.teamActive) return true;
		if (this.hasActiveTeamMembers(session)) return true;
		if (session.teamRuntime.teamTrulyIdle === false) return true;
		return false;
	}
	hasActiveTeamMembers(session) {
		for (const member of session.teamRuntime.membersByName.values()) if (isActiveTeamMemberStatus(member.status)) return true;
		return false;
	}
	deferTurnCompletion(session, stopReason) {
		session.teamRuntime.deferredCompletion = {
			turnSeq: session.taskState.turnSeq,
			stopReason,
			requestedAt: Date.now()
		};
		this.logDiagnostic("info", "[SessionManager/Team] deferTurnCompletion", {
			sessionId: session.sessionId,
			turnSeq: session.taskState.turnSeq,
			stopReason,
			activeMemberCount: this.countActiveTeamMembers(session)
		});
	}
	shouldReactivateTerminalTeamTurn(session, hadMembersBeforeTerminalUpdate) {
		if (hadMembersBeforeTerminalUpdate) return false;
		if (!this.isTurnCompletionAlreadyFinalized(session)) return false;
		if (deriveTaskStatus(session.taskState) !== "completed") return false;
		if (session.teamRuntime.teamTrulyIdle !== true) return false;
		const stopReason = session.teamRuntime.lastCompletedStopReason;
		return stopReason === void 0 || stopReason === "end_turn";
	}
	reactivateTerminalTeamTurn(session, source) {
		const stopReason = session.teamRuntime.lastCompletedStopReason ?? "end_turn";
		delete session.teamRuntime.lastCompletedTurnSeq;
		delete session.teamRuntime.lastCompletedStopReason;
		session.teamRuntime.teamActive = true;
		session.teamRuntime.teamTrulyIdle = false;
		session.teamRuntime.updatedAt = Date.now();
		this.onProcessingStarted(session);
		this.deferTurnCompletion(session, stopReason);
		this.applyTaskSignal(session, { type: "working_started" });
		this.logDiagnostic("info", "[SessionManager/Team] reactivated terminal team turn", {
			sessionId: session.sessionId,
			source,
			stopReason,
			activeMemberCount: this.countActiveTeamMembers(session)
		});
	}
	maybeFinalizeDeferredTeamCompletion(session) {
		if (!session.teamRuntime.deferredCompletion) return;
		if (this.hasActiveTeamMembers(session)) return;
		if (session.teamRuntime.teamTrulyIdle === false || session.teamRuntime.teamActive && session.teamRuntime.teamTrulyIdle !== true) {
			this.logDiagnostic("debug", "[SessionManager/Team] maybeFinalize: waiting for team_idle signal", {
				sessionId: session.sessionId,
				hasActiveMembers: this.hasActiveTeamMembers(session),
				teamTrulyIdle: session.teamRuntime.teamTrulyIdle
			});
			return;
		}
		const deferred = session.teamRuntime.deferredCompletion;
		session.teamRuntime.deferredCompletion = void 0;
		if (!deferred) return;
		if (session.teamRuntime.lastCompletedTurnSeq === deferred.turnSeq) return;
		this.logDiagnostic("info", "[SessionManager/Team] deferred finalize (normal)", {
			sessionId: session.sessionId,
			turnSeq: deferred.turnSeq
		});
		let finalizedStopReason = deferred.stopReason;
		if (session.userCancelRequested) {
			finalizedStopReason = "cancelled";
			this.applyTaskSignal(session, {
				type: "turn_completed",
				stopReason: "cancelled",
				timestamp: deferred.requestedAt
			});
		} else if (session.stopRequested || isCancelledStopReason(deferred.stopReason)) {
			finalizedStopReason = deferred.stopReason ?? "cancelled";
			this.applyTaskSignal(session, {
				type: "runtime_terminated",
				reason: deferred.stopReason ?? "cancelled",
				timestamp: deferred.requestedAt
			});
		} else if (isFailedPromptStopReason(deferred.stopReason)) this.applyTaskSignal(session, {
			type: "turn_failed",
			error: deferred.stopReason,
			timestamp: deferred.requestedAt
		});
		else this.applyTaskSignal(session, {
			type: "turn_completed",
			stopReason: deferred.stopReason,
			timestamp: deferred.requestedAt
		});
		this.markTurnCompletionFinalized(session, finalizedStopReason);
		const processingStopReason = session.stopRequested ? "interrupted" : isFailedPromptStopReason(finalizedStopReason) ? "error" : "complete";
		this.onProcessingStopped(session, processingStopReason).catch(() => {});
	}
	isTurnCompletionAlreadyFinalized(session) {
		return session.teamRuntime.lastCompletedTurnSeq === session.taskState.turnSeq;
	}
	markTurnCompletionFinalized(session, stopReason) {
		const hadTeamRuntime = session.teamRuntime.teamActive === true || session.teamRuntime.teamTrulyIdle !== void 0 || session.teamRuntime.membersByName.size > 0;
		session.teamRuntime.lastCompletedTurnSeq = session.taskState.turnSeq;
		if (stopReason === void 0) delete session.teamRuntime.lastCompletedStopReason;
		else session.teamRuntime.lastCompletedStopReason = stopReason;
		session.teamRuntime.deferredCompletion = void 0;
		session.teamRuntime.teamActive = false;
		if (hadTeamRuntime) {
			session.teamRuntime.teamTrulyIdle = true;
			session.teamRuntime.updatedAt = Date.now();
			this.settleActiveTeamMembers(session);
		}
	}
	countActiveTeamMembers(session) {
		let count = 0;
		for (const member of session.teamRuntime.membersByName.values()) if (isActiveTeamMemberStatus(member.status)) count += 1;
		return count;
	}
	shouldBufferScopedEventDuringHistoryHydration(session, payload) {
		if (session.historyHydrationDepth <= 0) return false;
		if (!payload || typeof payload !== "object") return true;
		return getOwnerHistoryMode(payload) !== "history";
	}
	beginHistoryHydration(session) {
		if (session.historyHydrationDepth === 0) session.bufferedScopedEventsDuringHistoryHydration.length = 0;
		if (session.historyHydrationFallbackHandle) {
			clearTimeout(session.historyHydrationFallbackHandle);
			session.historyHydrationFallbackHandle = void 0;
		}
		session.historyHydrationDepth += 1;
	}
	finishHistoryHydration(session) {
		session.historyHydrationDepth = Math.max(0, session.historyHydrationDepth - 1);
		if (session.historyHydrationDepth > 0) return;
		if (session.historyHydrationFallbackHandle) {
			clearTimeout(session.historyHydrationFallbackHandle);
			session.historyHydrationFallbackHandle = void 0;
		}
		session.awaitingHistoryReplayEnd = false;
		session.sawHistoryReplayStart = false;
		session.sawHistoryReplayContent = false;
		const buffered = session.bufferedScopedEventsDuringHistoryHydration.splice(0);
		for (const payload of buffered) this.emitScoped(session.sessionId, payload);
	}
	handleHistoryReplayBoundary(session, notification) {
		if (getOwnerHistoryMode(notification) === "history") session.sawHistoryReplayContent = true;
		if (getHistoryReplayPhase(notification) === "start") {
			session.sawHistoryReplayStart = true;
			if (session.historyHydrationFallbackHandle) {
				clearTimeout(session.historyHydrationFallbackHandle);
				session.historyHydrationFallbackHandle = void 0;
			}
			if (session.historyHydrationDepth <= 0) this.beginHistoryHydration(session);
			session.awaitingHistoryReplayEnd = true;
		}
	}
	handleHistoryReplayCompletion(session, notification) {
		if (getHistoryReplayPhase(notification) !== "end" || !session.awaitingHistoryReplayEnd) return;
		if (session.historyHydrationFallbackHandle) {
			clearTimeout(session.historyHydrationFallbackHandle);
			session.historyHydrationFallbackHandle = void 0;
		}
		session.awaitingHistoryReplayEnd = false;
		this.finishHistoryHydration(session);
	}
	finishHistoryHydrationAfterBackendReplay(session) {
		if (session.awaitingHistoryReplayEnd && !session.sawHistoryReplayStart) {
			if (session.sawHistoryReplayContent) {
				session.awaitingHistoryReplayEnd = false;
				this.finishHistoryHydration(session);
				return;
			}
			if (session.historyHydrationFallbackHandle) clearTimeout(session.historyHydrationFallbackHandle);
			session.historyHydrationFallbackHandle = setTimeout(() => {
				session.historyHydrationFallbackHandle = void 0;
				if (session.awaitingHistoryReplayEnd && !session.sawHistoryReplayStart) {
					session.awaitingHistoryReplayEnd = false;
					this.finishHistoryHydration(session);
				}
			}, 50);
			return;
		}
		if (!session.awaitingHistoryReplayEnd && session.historyHydrationDepth > 0) this.finishHistoryHydration(session);
	}
	extractRuntimeSignalFromNotification(notification) {
		const update = notification.update ?? {};
		const updateType = typeof update.sessionUpdate === "string" ? update.sessionUpdate : "";
		const normalizedPhase = this.extractAgentPhase(update, notification);
		if (normalizedPhase === "planning") return { type: "planning_started" };
		if (normalizedPhase === "working") return { type: "working_started" };
		if (updateType === "agent_message_chunk" || updateType === "tool_call" || updateType === "tool_call_update") return { type: "working_started" };
		const rawState = this.extractRawRuntimeState(update, notification);
		if (!rawState) return null;
		switch (rawState) {
			case "planning":
			case "preparing":
			case "model_requesting": return { type: "planning_started" };
			case "working":
			case "running":
			case "model_streaming":
			case "model_done":
			case "tool_executing":
			case "tool_start":
			case "tool_end":
			case "handoff":
			case "summarizing":
			case "waiting_team_members": return { type: "working_started" };
			case "pending":
			case "await_input":
			case "awaitinput":
			case "waiting_input":
			case "waiting_user_input": return {
				type: "awaiting_input",
				kind: "user_input"
			};
			case "completed":
			case "done": return { type: "turn_completed" };
			case "cancelled":
			case "canceled": return {
				type: "runtime_terminated",
				reason: rawState
			};
			case "failed": return { type: "turn_failed" };
			case "error": return { type: "runtime_errored" };
			case "terminated": return { type: "runtime_terminated" };
			default: return null;
		}
	}
	extractAgentPhase(update, notification) {
		const notificationMeta = notification._meta;
		const notificationCodeBuddyMeta = notificationMeta?.["codebuddy.ai"];
		const phaseInfo = update._meta?.["codebuddy.ai/agentPhase"] ?? notificationMeta?.["codebuddy.ai/agentPhase"] ?? notificationCodeBuddyMeta?.agentPhase;
		if (!phaseInfo || typeof phaseInfo !== "object") return null;
		switch (typeof phaseInfo.phase === "string" ? phaseInfo.phase : null) {
			case "preparing":
			case "model_requesting": return "planning";
			case "model_streaming":
			case "model_done":
			case "tool_executing": return "working";
			default: return null;
		}
	}
	/**
	* 从 notification 提取细粒度阶段，用于无响应分析区分"卡在 LLM 还是 tool"。
	* 映射 ACP rawState / sessionUpdate 类型 → llm_request / llm_stream / tool / planning / summarizing / handoff。
	*/
	extractPhaseFromNotification(notification) {
		const update = notification.update ?? {};
		const notificationMeta = notification._meta;
		const cbMeta = notificationMeta?.["codebuddy.ai"];
		const phaseInfo = update._meta?.["codebuddy.ai/agentPhase"] ?? notificationMeta?.["codebuddy.ai/agentPhase"] ?? cbMeta?.agentPhase;
		const agentPhase = phaseInfo && typeof phaseInfo === "object" ? phaseInfo.phase : void 0;
		const rawState = typeof update.currentState === "string" ? update.currentState : "";
		const updateType = typeof update.sessionUpdate === "string" ? update.sessionUpdate : "";
		const source = (typeof agentPhase === "string" ? agentPhase : "") || rawState || updateType;
		return this.classifyPhase(source);
	}
	classifyPhase(source) {
		if (!source) return;
		if (source === "preparing" || source === "model_requesting") return "llm_request";
		if (source === "model_streaming" || source === "model_done" || source === "agent_message_chunk") return "llm_stream";
		if (source.includes("tool")) return "tool";
		if (source === "planning") return "planning";
		if (source === "summarizing") return "summarizing";
		if (source === "handoff") return "handoff";
	}
	extractRawRuntimeState(update, notification) {
		const direct = typeof update.currentState === "string" ? update.currentState : void 0;
		const updateMetaStatus = typeof update._meta?.status === "string" ? update._meta.status : void 0;
		const codebuddyMeta = notification._meta;
		const nested = typeof codebuddyMeta?.["codebuddy.ai"]?.state === "string" ? codebuddyMeta["codebuddy.ai"].state : void 0;
		const raw = direct ?? updateMetaStatus ?? nested;
		return raw ? raw.trim().toLowerCase().replace(/[\s-]+/g, "_") : null;
	}
	extractMeaningfulTitle(notification) {
		const update = notification.update ?? {};
		if (update.sessionUpdate !== "session_info_update" || typeof update.title !== "string") return null;
		const trimmed = update.title.trim();
		if (!trimmed || trimmed === "新建任务中" || trimmed === "Creating Task" || trimmed === "(No content)" || trimmed === "/compact" || /^<image_local_path>[\s\S]*<\/image_local_path>$/.test(trimmed)) return null;
		return trimmed;
	}
	async resolveStoredEntry(sessionId) {
		if (!this.recordStore) return null;
		return this.reconcileInactiveStoredEntry(await this.recordStore.getSession(sessionId));
	}
	async reconcileInactiveStoredEntry(entry) {
		if (!entry) return null;
		if (this.sessions.has(entry.id) || !this.recordStore) return entry;
		const normalized = normalizeTaskStatus(entry.status);
		if (normalized !== "planning" && normalized !== "working" && normalized !== "pending") return entry;
		const reconciled = {
			...entry,
			status: "terminated",
			updatedAt: entry.updatedAt
		};
		await this.recordStore.upsertSession(reconciled);
		return reconciled;
	}
	async applyDesiredConfig(session, nextDesiredConfig, explicitPatch) {
		const hasExplicitAddonSelectionPatch = !!explicitPatch && Object.prototype.hasOwnProperty.call(explicitPatch, "addonSelection");
		nextDesiredConfig = syncAddonSelectionWithDesiredConfig(nextDesiredConfig, hasExplicitAddonSelectionPatch);
		const hasExplicitToolsPatch = !!explicitPatch && Object.prototype.hasOwnProperty.call(explicitPatch, "tools");
		const persistenceOptions = {
			hasExplicitExpertPatch: !!explicitPatch && Object.prototype.hasOwnProperty.call(explicitPatch, "expertId"),
			hasExplicitWelcomeModePatch: hasExplicitWelcomeModeInput(explicitPatch),
			hasExplicitPluginContextPatch: hasExplicitPluginContextInput(explicitPatch)
		};
		if (!!nextDesiredConfig.addonSelection && !hasExplicitToolsPatch) nextDesiredConfig = {
			...nextDesiredConfig,
			tools: void 0
		};
		else if (nextDesiredConfig.mode && nextDesiredConfig.mode !== session.desiredConfig.mode && !hasExplicitToolsPatch) {
			const resolvedDisabledTools = this.disabledToolsResolver ? this.disabledToolsResolver({
				cwd: session.cwd,
				callerDisabledTools: void 0,
				kind: "update"
			}) : void 0;
			nextDesiredConfig = {
				...nextDesiredConfig,
				tools: deriveToolsFromDisabled(nextDesiredConfig.mode, resolvedDisabledTools)
			};
		}
		const normalizedDesired = require_workbuddy_auth_product_coordinator.normalizeDesiredConfig(nextDesiredConfig);
		const hasExplicitSandboxPatch = !!explicitPatch && Object.prototype.hasOwnProperty.call(explicitPatch, "useSandboxCLI");
		if (normalizedDesired.useSandboxCLI !== void 0 && (hasExplicitSandboxPatch || normalizedDesired.useSandboxCLI !== session.desiredConfig.useSandboxCLI)) await session.backend.setSandboxMode(normalizedDesired.useSandboxCLI, normalizedDesired.sandboxDisabledReason);
		if (isUseSandboxOnlyPatch(explicitPatch)) {
			session.desiredConfig = require_workbuddy_auth_product_coordinator.cloneDesiredConfig(normalizedDesired);
			await this.persistSessionDesiredConfig(session, persistenceOptions);
			return;
		}
		await assertSessionCwdUsable(session.cwd);
		const nextRuntimeConfig = isModelOnlyPatch(explicitPatch) && !session.pendingBackendRestart && !session.pendingDesiredConfig && !session.pendingRuntimeConfig ? require_workbuddy_auth_product_coordinator.cloneResolvedRuntimeConfig({
			...session.runtimeConfig,
			model: normalizedDesired.model
		}) : await this.resolveRuntimeConfig({
			sessionId: session.sessionId,
			cwd: session.cwd,
			desiredConfig: normalizedDesired,
			currentRuntimeConfig: session.runtimeConfig
		});
		const result = await session.backend.reconfigure({ runtimeConfig: nextRuntimeConfig });
		if (session.disposing) return;
		this.logDiagnostic("info", "[SessionManager] applyDesiredConfig reconfigure result", {
			sessionId: session.sessionId,
			resultKind: result.kind,
			currentModel: session.runtimeConfig?.model,
			nextModel: nextRuntimeConfig.model,
			isProcessing: session.isProcessing
		});
		require_workbuddy_auth_product_coordinator.registerSessionDeferredBuiltinPolicy(session.sessionId, require_workbuddy_auth_product_coordinator.deriveSessionDeferredBuiltinPolicy(require_workbuddy_auth_product_coordinator.resolveModeTools(nextRuntimeConfig.addonManifest?.selected.interactionMode)));
		if (result.kind === "restart_required") {
			this.logDiagnostic("info", `[SessionManager] RESTART_REQUIRED sessionId=${session.sessionId} reason=${result.reason} hasInFlightRestart=${!!session.pendingBackendRestart}`);
			session.desiredConfig = require_workbuddy_auth_product_coordinator.cloneDesiredConfig(normalizedDesired);
			session.pendingDesiredConfig = require_workbuddy_auth_product_coordinator.cloneDesiredConfig(normalizedDesired);
			session.pendingRuntimeConfig = require_workbuddy_auth_product_coordinator.cloneResolvedRuntimeConfig(nextRuntimeConfig);
			session.modeEpoch++;
			await this.persistSessionDesiredConfig(session, persistenceOptions);
			if (!session.hasPendingFlush) {
				session.hasPendingFlush = true;
				this.logDiagnostic("info", `[SessionManager] FLUSH_FIRE sessionId=${session.sessionId} — fire-and-forget flush started`);
				this.flushPendingRuntimeConfigIfIdle(session).catch((error) => {
					console.warn("[SessionManager] applyDesiredConfig: deferred flush failed (non-fatal):", error);
				}).finally(() => {
					session.hasPendingFlush = false;
					this.logDiagnostic("info", `[SessionManager] FLUSH_DONE sessionId=${session.sessionId} — flush completed, accepting new flushes`);
				});
			} else this.logDiagnostic("info", `[SessionManager] FLUSH_DEDUP sessionId=${session.sessionId} — skipped (existing flush will consume latest config)`);
		} else {
			session.desiredConfig = require_workbuddy_auth_product_coordinator.cloneDesiredConfig(normalizedDesired);
			session.runtimeConfig = require_workbuddy_auth_product_coordinator.cloneResolvedRuntimeConfig(nextRuntimeConfig);
			session.pendingDesiredConfig = void 0;
			session.pendingRuntimeConfig = void 0;
			await this.persistSessionDesiredConfig(session, persistenceOptions);
		}
	}
	async persistSessionDesiredConfig(session, options) {
		if (options.hasExplicitPluginContextPatch) session.persistPluginContext = true;
		const persistedWelcomeMode = session.desiredConfig.welcomeMode ?? session.desiredConfig.addonSelection?.welcomeMode;
		if (options.hasExplicitWelcomeModePatch && persistedWelcomeMode) session._meta = withPersistedSessionMeta(session._meta, { sourceMode: require_workbuddy_auth_product_coordinator.toLegacySourceMode(persistedWelcomeMode) });
		await this.upsertSessionRecord(session.sessionId, (current) => {
			const shouldClearExpert = options.hasExplicitExpertPatch && !session.desiredConfig.expertId;
			return {
				...current,
				cwd: session.cwd,
				mode: session.desiredConfig.mode ?? current.mode,
				model: session.desiredConfig.model ?? current.model,
				expertId: shouldClearExpert ? "" : session.desiredConfig.expertId ?? current.expertId,
				expertLocale: shouldClearExpert ? "" : session.desiredConfig.expertId ? session.desiredConfig.locale ?? current.expertLocale : current.expertLocale,
				expertRuntimeIdentity: shouldClearExpert ? "" : session.desiredConfig.expertId ? session.desiredConfig.runtimeIdentity ?? current.expertRuntimeIdentity : current.expertRuntimeIdentity,
				expertMarketplace: shouldClearExpert ? "" : session.desiredConfig.expertId ? session.desiredConfig.expertMarketplace ?? current.expertMarketplace : current.expertMarketplace,
				useSandboxCLI: session.desiredConfig.useSandboxCLI ?? current.useSandboxCLI,
				permissionMode: session.desiredConfig.permissionMode ?? current.permissionMode,
				...options.hasExplicitWelcomeModePatch && persistedWelcomeMode ? { sourceMode: require_workbuddy_auth_product_coordinator.toLegacySourceMode(persistedWelcomeMode) } : {},
				...session.persistPluginContext ? { pluginContext: projectSessionPluginContext(session.desiredConfig) } : {},
				updatedAt: current.updatedAt
			};
		});
	}
	async applyPendingRuntimeConfigBeforePrompt(session) {
		await this.flushPendingRuntimeConfigIfIdle(session, { throwOnRestartError: true });
	}
	shouldDeferRuntimeConfigDrain(session) {
		const defer = session.promptInvocationActive === true;
		if (defer) this.logDiagnostic("info", `[SessionManager] DEFER_DRAIN_INFLIGHT_PROMPT sessionId=${session.sessionId} hasPendingDesired=${!!session.pendingDesiredConfig} hasPendingRuntime=${!!session.pendingRuntimeConfig}`);
		return defer;
	}
	async flushPendingRuntimeConfigIfIdle(session, options) {
		while (true) {
			if (session.disposing) return;
			if (session.pendingBackendRestart) {
				await this.awaitPendingBackendRestart(session, "flushPendingRuntimeConfigIfIdle");
				continue;
			}
			if (session.isProcessing || session.stopRequested || this.shouldDeferRuntimeConfigDrain(session)) return;
			if (!session.pendingDesiredConfig || !session.pendingRuntimeConfig) return;
			const restartPromise = Promise.resolve().then(() => this.drainPendingRuntimeConfigWhileIdle(session));
			session.pendingBackendRestart = restartPromise;
			try {
				await restartPromise;
			} catch (error) {
				if (error instanceof SessionCwdUnavailableError) console.warn("[SessionManager] Pending runtime config drop: session cwd unavailable", {
					sessionId: session.sessionId,
					reason: error.data.reason,
					cwd: error.data.cwd
				});
				else console.warn("[SessionManager] Failed to apply pending runtime config:", error);
				if (options?.throwOnRestartError) throw error;
				return;
			} finally {
				if (session.pendingBackendRestart === restartPromise) session.pendingBackendRestart = void 0;
			}
		}
	}
	async drainPendingRuntimeConfigWhileIdle(session) {
		while (!session.disposing && !session.isProcessing && !session.stopRequested && !this.shouldDeferRuntimeConfigDrain(session) && session.pendingDesiredConfig && session.pendingRuntimeConfig) {
			const desiredConfig = require_workbuddy_auth_product_coordinator.cloneDesiredConfig(session.pendingDesiredConfig);
			const runtimeConfig = require_workbuddy_auth_product_coordinator.cloneResolvedRuntimeConfig(session.pendingRuntimeConfig);
			session.pendingDesiredConfig = void 0;
			session.pendingRuntimeConfig = void 0;
			if (isSameSessionRuntimeConfig(session.runtimeConfig, runtimeConfig)) {
				this.logDiagnostic("info", `[SessionManager] SKIP_RESTART_SAME_CONFIG sessionId=${session.sessionId}`);
				require_workbuddy_auth_product_coordinator.registerSessionDeferredBuiltinPolicy(session.sessionId, require_workbuddy_auth_product_coordinator.deriveSessionDeferredBuiltinPolicy(require_workbuddy_auth_product_coordinator.resolveModeTools(runtimeConfig.addonManifest?.selected.interactionMode)));
				session.desiredConfig = desiredConfig;
				session.runtimeConfig = runtimeConfig;
				continue;
			}
			this.logDiagnostic("info", `[SessionManager] RESTART_BACKEND sessionId=${session.sessionId}`);
			try {
				await this.restartSessionBackend(session, desiredConfig, runtimeConfig);
			} catch (error) {
				if (error instanceof SessionCwdUnavailableError) throw error;
				if (!session.pendingDesiredConfig) session.pendingDesiredConfig = require_workbuddy_auth_product_coordinator.cloneDesiredConfig(desiredConfig);
				if (!session.pendingRuntimeConfig) session.pendingRuntimeConfig = require_workbuddy_auth_product_coordinator.cloneResolvedRuntimeConfig(runtimeConfig);
				throw error;
			}
		}
	}
	async restartSessionBackend(session, desiredConfig, runtimeConfig) {
		await assertSessionCwdUsable(session.cwd);
		const previousBackend = session.backend;
		const previousRuntimeConfig = session.runtimeConfig;
		let queueSnapshot;
		try {
			queueSnapshot = await previousBackend.getMessageQueue();
		} catch (error) {
			console.warn("[SessionManager] restartSessionBackend: snapshot message queue failed (continuing restart):", error instanceof Error ? error.message : String(error));
		}
		const replacement = this.requireCreateBackend()({
			backendId: session.backendId,
			sessionId: session.sessionId,
			cwd: session.cwd,
			runtimeConfig,
			env: session.env,
			_meta: session._meta
		});
		try {
			require_workbuddy_auth_product_coordinator.registerSessionDeferredBuiltinPolicy(session.sessionId, require_workbuddy_auth_product_coordinator.deriveSessionDeferredBuiltinPolicy(require_workbuddy_auth_product_coordinator.resolveModeTools(runtimeConfig.addonManifest?.selected.interactionMode)));
			if (session.pendingPromptCancelCause === void 0) session.pendingPromptCancelCause = "backend_restart";
			await previousBackend.releaseRuntime?.().catch(() => {});
			await previousBackend.destroy().catch(() => {});
			const handle = await replacement.initialize({
				kind: "load",
				request: {
					sessionId: session.sessionId,
					cwd: session.cwd,
					mcpServers: [],
					_meta: session._meta
				}
			});
			if (handle.sessionId !== session.sessionId) throw new Error(`[SessionManager] Backend "${replacement.id}" returned mismatched session id: expected "${session.sessionId}", got "${handle.sessionId}"`);
			session.backend = replacement;
			session.desiredConfig = require_workbuddy_auth_product_coordinator.cloneDesiredConfig(desiredConfig);
			session.runtimeConfig = require_workbuddy_auth_product_coordinator.cloneResolvedRuntimeConfig(runtimeConfig);
			session.modeEpoch++;
			this.wireBackend(session);
			const restoredQueue = normalizeQueueForRestart(queueSnapshot, session.sessionId);
			if (restoredQueue) await session.backend.saveMessageQueue(restoredQueue).catch((error) => {
				console.warn("[SessionManager] restartSessionBackend: restore message queue failed:", error instanceof Error ? error.message : String(error));
			});
			queueSnapshot = void 0;
			if (runtimeConfig.model) await session.backend.setSessionModel({ modelId: runtimeConfig.model }).catch((err) => {
				console.warn("[SessionManager] restartSessionBackend: setSessionModel failed:", err);
			});
			const effectivePermissionMode = normalizeBackendPermissionMode$2(runtimeConfig.permissionMode);
			await session.backend.setSessionMode({ modeId: effectivePermissionMode }).catch((err) => {
				console.warn("[SessionManager] restartSessionBackend: setSessionMode failed:", err);
			});
			if (desiredConfig.useSandboxCLI !== void 0) await session.backend.setSandboxMode(desiredConfig.useSandboxCLI, desiredConfig.sandboxDisabledReason).catch((err) => {
				console.warn("[SessionManager] restartSessionBackend: setSandboxMode failed:", err);
			});
		} catch (error) {
			require_workbuddy_auth_product_coordinator.registerSessionDeferredBuiltinPolicy(session.sessionId, require_workbuddy_auth_product_coordinator.deriveSessionDeferredBuiltinPolicy(require_workbuddy_auth_product_coordinator.resolveModeTools(previousRuntimeConfig.addonManifest?.selected.interactionMode)));
			await replacement.destroy().catch(() => {});
			throw error;
		}
	}
	async resolveRuntimeConfig(args) {
		const resolvedConfig = this.runtimeConfigResolver ? require_workbuddy_auth_product_coordinator.cloneResolvedRuntimeConfig(await this.runtimeConfigResolver.resolveConfig({
			sessionId: args.sessionId,
			cwd: args.cwd,
			desiredConfig: require_workbuddy_auth_product_coordinator.cloneDesiredConfig(args.desiredConfig),
			currentRuntimeConfig: args.currentRuntimeConfig ?? null
		})) : require_workbuddy_auth_product_coordinator.buildFallbackRuntimeConfig(args.desiredConfig);
		const addonManifest = buildSessionAddonManifest({
			sessionId: args.sessionId,
			desiredConfig: args.desiredConfig,
			runtimeConfig: resolvedConfig
		});
		return require_workbuddy_auth_product_coordinator.cloneResolvedRuntimeConfig({
			...applySessionAddonExpansionToRuntimeConfig(resolvedConfig, addonManifest.expanded),
			addonManifest
		});
	}
	onProcessingStarted(session) {
		session.isProcessing = true;
		session.stopRequested = false;
		session.userCancelRequested = false;
	}
	requestProcessingStop(session) {
		if (!session.isProcessing) return;
		session.stopRequested = true;
	}
	async onProcessingStopped(session, _reason) {
		if (!(session.taskState.runState === "awaiting_input")) {
			session.isProcessing = false;
			session.noResponseWatchdog?.stop();
		}
		session.stopRequested = false;
		session.userCancelRequested = false;
		session.pluginRecommendationCancelRequested = false;
		await this.flushPendingRuntimeConfigIfIdle(session);
	}
	startNoResponseWatchdog(session) {
		session.noResponseWatchdog?.stop();
		session.noResponseWatchdog = new NoResponseWatchdog(session, this.reportTelemetry, this.noResponseWatchdogConfig);
		session.noResponseWatchdog.start();
	}
	buildDesiredConfig(opts) {
		const mode = require_workbuddy_auth_product_coordinator.normalizeSceneMode(opts.config?.mode ?? opts.mode);
		const explicitTools = opts.config?.tools ?? opts.tools;
		const shouldUsePluginComposeTools = !!opts.config?.addonSelection;
		const tools = explicitTools ?? (shouldUsePluginComposeTools ? void 0 : deriveToolsFromDisabled(mode, opts.disabledTools));
		return require_workbuddy_auth_product_coordinator.normalizeDesiredConfig({
			...opts.config,
			mode,
			expertId: opts.config?.expertId ?? opts.expertId,
			locale: opts.config?.locale ?? opts.locale,
			model: opts.config?.model ?? opts.model,
			systemPrompt: opts.config?.systemPrompt ?? opts.systemPrompt,
			tools,
			permissionMode: opts.config?.permissionMode ?? opts.permissionMode,
			permissionModeBeforePlan: opts.config?.permissionModeBeforePlan ?? "bypassPermissions"
		});
	}
	requireCreateBackend() {
		if (this.createBackend) return this.createBackend;
		throw new Error("SessionManager has not been initialized");
	}
	/**
	* 导出给列表 / hydrate 的展示状态。
	*
	* 解决的问题：用户 cancel 后，主界面会先停下，但 team session 在等待
	* `team_idle` 收尾期间，内部 `taskState` 还不是终态。若这里直接导出真实
	* `taskState`，列表和 hydrate 会把 session 又显示成进行中。
	*
	* 这里故意只做展示态投影，不改内部 `taskState`：内部状态仍要保留
	* “还在等 team_idle 收尾” 这个事实；对外则应把这段窗口显示为用户中止。
	*
	* 只有在“用户显式 stop + 已进入 deferredCompletion + 内部尚未终态”时，
	* 才把导出状态投影成 `terminated`。
	*/
	deriveExportedTaskStatus(session) {
		const taskStatus = deriveTaskStatus(session.taskState);
		if (isHardTerminalExportStatus(taskStatus)) return taskStatus;
		if (isTaskTerminal(session.taskState)) return deriveTerminalExportStatus(session.taskState);
		if (session.stopRequested && session.teamRuntime.deferredCompletion && !isTaskTerminal(session.taskState)) return "terminated";
		if (this.deriveExportedPendingInputKind(session)) return "pending";
		if (this.hasUnsettledTeamRuntime(session)) return "working";
		return taskStatus;
	}
	deriveExportedPendingInputKind(session) {
		const fromRequests = this.getLatestPendingInputKind(session);
		const fromTaskState = session.taskState.pendingInputKind;
		const result = fromRequests ?? fromTaskState;
		if (result) this.logDiagnostic("info", `[SessionManager] deriveExportedPendingInputKind: returning '${result}'`, {
			sessionId: session.sessionId,
			fromRequests,
			fromTaskState,
			pendingPermissionCount: session.pendingPermissionRequests.size,
			pendingQuestionCount: session.pendingQuestionRequests.size,
			runState: session.taskState.runState,
			isProcessing: session.isProcessing
		});
		return result;
	}
	hasUnsettledTeamRuntime(session) {
		if (session.teamRuntime.teamTrulyIdle === true) return false;
		if (session.teamRuntime.teamActive || session.teamRuntime.teamTrulyIdle === false) return true;
		return this.hasActiveTeamMembers(session);
	}
	toSessionTeamRuntimeMemberView(member) {
		return {
			name: member.name,
			status: member.status,
			...member.color ? { color: member.color } : {},
			...member.description ? { description: member.description } : {},
			...member.taskId ? { taskId: member.taskId } : {},
			...member.sessionId ? { sessionId: member.sessionId } : {},
			...member.tokenUsage ? { tokenUsage: { ...member.tokenUsage } } : {},
			...member.toolCallCount !== void 0 ? { toolCallCount: member.toolCallCount } : {},
			...member.lastFailure ? { lastFailure: { ...member.lastFailure } } : {}
		};
	}
	toSessionTeamRuntimeView(session) {
		const members = [...session.teamRuntime.membersByName.values()].map((member) => this.toSessionTeamRuntimeMemberView(member));
		if (!(session.teamRuntime.updatedAt !== void 0 || session.teamRuntime.teamTrulyIdle !== void 0 || members.length > 0)) return;
		return {
			isInTeam: session.teamRuntime.teamActive === true || session.teamRuntime.teamTrulyIdle !== void 0 || members.length > 0,
			...session.teamRuntime.teamName ? { teamName: session.teamRuntime.teamName } : {},
			...session.teamRuntime.isAutoTeam !== void 0 ? { isAutoTeam: session.teamRuntime.isAutoTeam } : {},
			...session.teamRuntime.teamActive !== void 0 ? { teamActive: session.teamRuntime.teamActive } : {},
			...session.teamRuntime.teamTrulyIdle !== void 0 ? { teamTrulyIdle: session.teamRuntime.teamTrulyIdle } : {},
			hasActiveMembers: session.teamRuntime.teamTrulyIdle === true ? false : this.hasActiveTeamMembers(session),
			members,
			...session.teamRuntime.updatedAt !== void 0 ? { updatedAt: session.teamRuntime.updatedAt } : {}
		};
	}
	toSessionInfo(session) {
		const configEntries = Object.entries(require_workbuddy_auth_product_coordinator.cloneDesiredConfig(session.desiredConfig)).filter(([, value]) => value !== void 0);
		const config = configEntries.length > 0 ? Object.fromEntries(configEntries) : void 0;
		const teamRuntime = this.toSessionTeamRuntimeView(session);
		const isTerminal = isTaskTerminal(session.taskState);
		return {
			sessionId: session.sessionId,
			cwd: session.cwd,
			createdAt: session.createdAt,
			updatedAt: session.updatedAt,
			lastActivityAt: session.lastActivityAt ?? session.taskState.lastActivityAt,
			userId: session.userId || void 0,
			config,
			isBackgroundAutomation: readIsBackgroundAutomation(session._meta),
			sourceMode: readSessionSourceMode(session._meta),
			status: this.deriveExportedTaskStatus(session),
			pendingInputKind: isTerminal ? void 0 : this.deriveExportedPendingInputKind(session),
			hasActiveTeamMembers: this.hasActiveTeamMembers(session),
			hasActiveToolCalls: !isTerminal && this.hasActiveToolCall(session),
			lastBackendActivityAt: session.lastBackendActivityAt,
			isProcessing: session.isProcessing,
			...teamRuntime ? { teamRuntime } : {},
			projectId: session.projectId,
			modeEpoch: session.modeEpoch
		};
	}
	toSessionViewState(session) {
		const info = this.toSessionInfo(session);
		const isTerminal = isTaskTerminal(session.taskState);
		return {
			...info,
			eventHistory: session.eventHistory.map((event) => cloneSessionPayload(event)),
			...session.planSnapshot ? { planSnapshot: cloneSessionPayload(session.planSnapshot) } : {},
			pendingPermissions: isTerminal ? [] : [...session.pendingPermissionRequests.values()].map(({ requestId, request }) => ({
				requestId,
				request: cloneSessionPayload(request)
			})),
			pendingQuestions: isTerminal ? [] : [...session.pendingQuestionRequests.values()].map(({ toolCallId, request }) => ({
				toolCallId,
				request: cloneSessionPayload(request)
			})),
			pendingElicitations: isTerminal ? [] : [...session.pendingElicitationRequests.values()].map(({ elicitationId, request }) => ({
				elicitationId,
				request: cloneSessionPayload(request)
			})),
			isProcessing: session.isProcessing,
			stopRequested: session.stopRequested
		};
	}
	toEphemeralSessionRecord(session) {
		const teamRuntime = this.toSessionTeamRuntimeView(session);
		const isTerminal = isTaskTerminal(session.taskState);
		return {
			id: session.sessionId,
			sessionId: session.sessionId,
			userId: session.userId || void 0,
			name: session.customTitle || "新任务",
			status: this.deriveExportedTaskStatus(session),
			pendingInputKind: isTerminal ? void 0 : this.deriveExportedPendingInputKind(session),
			createdAt: session.createdAt,
			updatedAt: session.updatedAt,
			lastActivityAt: session.lastActivityAt ?? session.taskState.lastActivityAt,
			cwd: session.cwd,
			type: "local",
			isPlayground: !!session.isPlayground,
			isBackgroundAutomation: readIsBackgroundAutomation(session._meta),
			sourceMode: readSessionSourceMode(session._meta),
			model: session.desiredConfig.model,
			expertId: session.desiredConfig.expertId,
			expertLocale: session.desiredConfig.expertId ? session.desiredConfig.locale : void 0,
			expertRuntimeIdentity: session.desiredConfig.expertId ? session.desiredConfig.runtimeIdentity : void 0,
			expertMarketplace: session.desiredConfig.expertId ? session.desiredConfig.expertMarketplace : void 0,
			...teamRuntime ? { teamRuntime } : {},
			permissionMode: session.desiredConfig.permissionMode,
			useSandboxCLI: session.desiredConfig.useSandboxCLI,
			...session.projectId ? { projectId: session.projectId } : {}
		};
	}
	toSessionRecord(entry) {
		const active = this.sessions.get(entry.id);
		const derivedStatus = active ? this.deriveExportedTaskStatus(active) : normalizeTaskStatus(entry.status);
		if (derivedStatus === "pending" && active) this.logDiagnostic("info", "[SessionManager] toSessionRecord: active session derived as pending", {
			sessionId: entry.id,
			runState: active.taskState.runState,
			executionStage: active.taskState.executionStage,
			terminalOutcome: active.taskState.terminalOutcome,
			turnSeq: active.taskState.turnSeq,
			pendingInputKind: active.taskState.pendingInputKind,
			isProcessing: active.isProcessing,
			pendingPermissionCount: active.pendingPermissionRequests.size,
			pendingQuestionCount: active.pendingQuestionRequests.size,
			entryStatus: entry.status
		});
		const lastActivityAt = active?.taskState.lastActivityAt ?? entry.lastActivityAt;
		const teamRuntime = active ? this.toSessionTeamRuntimeView(active) : void 0;
		const isTerminal = active ? isTaskTerminal(active.taskState) : isTerminalTaskStatus(derivedStatus);
		return {
			id: entry.id,
			sessionId: entry.id,
			userId: entry.userId || void 0,
			name: entry.customTitle || entry.title || void 0,
			status: derivedStatus,
			pendingInputKind: active && !isTerminal ? this.deriveExportedPendingInputKind(active) : void 0,
			createdAt: entry.createdAt,
			updatedAt: entry.updatedAt,
			lastActivityAt,
			archivedAt: entry.archivedAt,
			cwd: entry.cwd,
			type: "local",
			isPlayground: !!entry.isPlayground,
			isUserDefinedTitle: !!entry.customTitle,
			isBackgroundAutomation: entry.isBackgroundAutomation,
			sourceMode: entry.sourceMode,
			mode: active?.desiredConfig.mode ?? entry.mode,
			model: active?.desiredConfig.model ?? entry.model,
			expertId: active?.desiredConfig.expertId ?? entry.expertId,
			expertLocale: (active?.desiredConfig.expertId ? active.desiredConfig.locale : void 0) ?? entry.expertLocale,
			expertRuntimeIdentity: (active?.desiredConfig.expertId ? active.desiredConfig.runtimeIdentity : void 0) ?? entry.expertRuntimeIdentity,
			expertMarketplace: (active?.desiredConfig.expertId ? active.desiredConfig.expertMarketplace : void 0) ?? entry.expertMarketplace,
			...teamRuntime ? { teamRuntime } : {},
			permissionMode: active?.desiredConfig.permissionMode ?? entry.permissionMode,
			useSandboxCLI: active?.desiredConfig.useSandboxCLI ?? entry.useSandboxCLI,
			projectId: entry.projectId
		};
	}
	toStoredSessionRecord(session) {
		const sourceMode = readSessionSourceMode(session._meta);
		const isBackgroundAutomation = readIsBackgroundAutomation(session._meta);
		return {
			id: session.sessionId,
			cwd: session.cwd,
			userId: session.userId ?? "",
			customTitle: session.customTitle,
			status: deriveTaskStatus(session.taskState),
			createdAt: session.createdAt,
			updatedAt: session.updatedAt ?? session.createdAt,
			lastActivityAt: session.lastActivityAt ?? session.taskState.lastActivityAt,
			isPlayground: !!session.isPlayground,
			isBackgroundAutomation,
			sourceMode,
			mode: session.desiredConfig.mode,
			model: session.desiredConfig.model,
			expertId: session.desiredConfig.expertId,
			expertLocale: session.desiredConfig.expertId ? session.desiredConfig.locale : void 0,
			expertRuntimeIdentity: session.desiredConfig.expertId ? session.desiredConfig.runtimeIdentity : void 0,
			expertMarketplace: session.desiredConfig.expertId ? session.desiredConfig.expertMarketplace : void 0,
			lastUserPromptExpertSelection: toPersistedExpertSelectionState(session.lastUserPromptExpertSelection),
			permissionMode: session.desiredConfig.permissionMode,
			projectId: session.projectId,
			useSandboxCLI: session.desiredConfig.useSandboxCLI,
			...session.persistPluginContext ? { pluginContext: projectSessionPluginContext(session.desiredConfig) } : {}
		};
	}
	/**
	* Broadcast an agent-level ACP extension method to every active session's
	* backend. Used by the host process (e.g. plugin change notifications in
	* `host-services.notifyPluginChange`) to push state invalidation into all
	* connected sidecars at once.
	*
	* Each individual backend call is isolated: failures on one session do
	* not abort the fan-out. Backends that do not implement `extMethod`
	* (interface made it optional for non-ACP or mock backends) are skipped.
	*/
	async broadcastExtMethod(method, params = {}) {
		const calls = [];
		for (const session of this.sessions.values()) {
			const backend = session.backend;
			if (!backend || typeof backend.extMethod !== "function") continue;
			calls.push(backend.extMethod(method, params).then(() => void 0).catch((error) => {
				console.warn(`[SessionManager] broadcastExtMethod(${method}) failed for session:`, error);
			}));
		}
		await Promise.allSettled(calls);
	}
	/**
	* Call an ACP extension method on a specific session's backend.
	* Unlike `broadcastExtMethod` which fans out to all sessions, this
	* targets a single session by ID and propagates the result/error
	* directly to the caller.
	*
	* @throws Error if the session does not exist or its backend does
	*         not support extMethod.
	*/
	async callExtMethod(sessionId, method, params = {}) {
		return this.withReadySession(sessionId, async (session) => {
			const backend = session.backend;
			if (!backend || typeof backend.extMethod !== "function") throw new Error(`[SessionManager] Session "${sessionId}" backend does not support extMethod`);
			return backend.extMethod(method, params);
		});
	}
};
function cloneSessionPayload(payload) {
	return structuredClone(payload);
}
function isRecord$3(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
function stableJsonStringify$1(value) {
	if (Array.isArray(value)) return `[${value.map((item) => stableJsonStringify$1(item)).join(",")}]`;
	if (isRecord$3(value)) return `{${Object.keys(value).sort().filter((key) => value[key] !== void 0).map((key) => `${JSON.stringify(key)}:${stableJsonStringify$1(value[key])}`).join(",")}}`;
	return JSON.stringify(value);
}
function normalizeBackendPermissionMode$2(mode) {
	return require_workbuddy_auth_product_coordinator.normalizePermissionMode(mode) ?? "bypassPermissions";
}
function getRuntimeRestartIdentity(config) {
	return config?.restartFingerprint ?? config?.systemPrompt;
}
function isSameSessionRuntimeConfig(left, right) {
	return (left?.model ?? void 0) === (right?.model ?? void 0) && getRuntimeRestartIdentity(left) === getRuntimeRestartIdentity(right) && (left?.tools ?? void 0) === (right?.tools ?? void 0) && (left?.permissionMode ?? void 0) === (right?.permissionMode ?? void 0) && (left?.permissionModeBeforePlan ?? void 0) === (right?.permissionModeBeforePlan ?? void 0) && stableJsonStringify$1(left?.promptVariables) === stableJsonStringify$1(right?.promptVariables) && (left?.runtimeIdentity ?? void 0) === (right?.runtimeIdentity ?? void 0) && (left?.welcomeMode ?? void 0) === (right?.welcomeMode ?? void 0);
}
function resolveRuntimeReclaimIdleTimeoutMs(configured) {
	const value = Number.isFinite(configured) ? configured : void 0;
	if (typeof value === "number" && value <= 0) return Number.POSITIVE_INFINITY;
	return typeof value === "number" ? value : SESSION_RUNTIME_RECLAIM_POLICY.idleTimeoutMs;
}
function resolveRuntimeReclaimMaxActiveSessions(configured) {
	const value = Number.isFinite(configured) ? configured : void 0;
	if (typeof value === "number" && value <= 0) return Number.POSITIVE_INFINITY;
	return typeof value === "number" ? value : SESSION_RUNTIME_RECLAIM_POLICY.maxActiveSessions;
}
function resolveRuntimeReclaimSweepIntervalMs(configured) {
	const value = Number.isFinite(configured) ? configured : void 0;
	if (typeof value === "number" && value <= 0) return Number.POSITIVE_INFINITY;
	return typeof value === "number" ? value : SESSION_RUNTIME_RECLAIM_POLICY.sweepIntervalMs;
}
function isHardTerminalExportStatus(status) {
	return status === "failed" || status === "error" || status === "terminated" || status === "archived";
}
function isModelOnlyPatch(patch) {
	return !!patch && Object.keys(patch).length === 1 && Object.prototype.hasOwnProperty.call(patch, "model");
}
function isUseSandboxOnlyPatch(patch) {
	return !!patch && Object.prototype.hasOwnProperty.call(patch, "useSandboxCLI") && Object.keys(patch).every((key) => key === "useSandboxCLI" || key === "sandboxDisabledReason");
}
function hasOwn(value, key) {
	return !!value && Object.prototype.hasOwnProperty.call(value, key);
}
function hasExplicitPluginContextInput(config) {
	if (!config) return false;
	if (hasOwn(config, "addonSelection")) return true;
	if (!hasOwn(config, "sessionSettings")) return false;
	if (!config.sessionSettings) return true;
	return hasOwn(config.sessionSettings, "enabledPlugins") || hasOwn(config.sessionSettings, "extraKnownMarketplaces");
}
function hasExplicitWelcomeModeInput(config) {
	return !!config && (hasOwn(config, "welcomeMode") || !!config.addonSelection && hasOwn(config.addonSelection, "welcomeMode"));
}
function restoreStoredPluginContext(opts, context, stored) {
	const config = opts.config ?? {};
	const nextAddonSelection = hasOwn(config, "addonSelection") ? config.addonSelection : buildAddonSelectionFromPluginContext(context, require_workbuddy_auth_product_coordinator.normalizeWelcomeMode(config.welcomeMode ?? readSessionSourceMode(opts._meta) ?? stored.sourceMode), require_workbuddy_auth_product_coordinator.normalizeSceneMode(config.mode ?? opts.mode ?? stored.mode));
	let nextSessionSettings = config.sessionSettings;
	if (!hasOwn(config, "sessionSettings")) nextSessionSettings = buildSessionSettingsFromPluginContext(context);
	else if (config.sessionSettings) {
		const storedSettings = buildSessionSettingsFromPluginContext(context);
		if (storedSettings) nextSessionSettings = {
			...storedSettings,
			...config.sessionSettings,
			...hasOwn(config.sessionSettings, "enabledPlugins") ? { enabledPlugins: config.sessionSettings.enabledPlugins } : {},
			...hasOwn(config.sessionSettings, "extraKnownMarketplaces") ? { extraKnownMarketplaces: config.sessionSettings.extraKnownMarketplaces } : {}
		};
	}
	return {
		...opts,
		config: {
			...config,
			addonSelection: nextAddonSelection,
			...nextSessionSettings !== void 0 ? { sessionSettings: nextSessionSettings } : {}
		}
	};
}
function syncAddonSelectionWithDesiredConfig(config, preferAddonSelection = false) {
	if (!config.addonSelection) return config;
	const addonInteractionMode = require_workbuddy_auth_product_coordinator.normalizeSceneMode(config.addonSelection.interactionMode);
	const addonWelcomeMode = require_workbuddy_auth_product_coordinator.normalizeWelcomeMode(config.addonSelection.welcomeMode);
	const nextInteractionMode = preferAddonSelection ? addonInteractionMode ?? config.mode : config.mode ?? addonInteractionMode;
	const nextWelcomeMode = preferAddonSelection ? addonWelcomeMode ?? config.welcomeMode : config.welcomeMode ?? addonWelcomeMode;
	const nextAddonSelection = {
		...config.addonSelection,
		...nextInteractionMode ? { interactionMode: nextInteractionMode } : {},
		...nextWelcomeMode ? { welcomeMode: nextWelcomeMode } : {},
		enabledPluginIds: config.addonSelection.enabledPluginIds.filter((pluginId) => !isWorkbuddyWorkModePluginId(pluginId))
	};
	return {
		...config,
		...nextInteractionMode ? { mode: nextInteractionMode } : {},
		...nextWelcomeMode ? { welcomeMode: nextWelcomeMode } : {},
		addonSelection: nextAddonSelection
	};
}
function deriveToolsFromDisabled(mode, disabledTools) {
	if (!disabledTools || disabledTools.length === 0) return;
	const disabledSet = new Set(disabledTools);
	return require_workbuddy_auth_product_coordinator.resolveModeTools(mode).split(",").map((t) => t.trim()).filter(Boolean).filter((tool) => !disabledSet.has(tool)).join(",");
}
function getOwnerHistoryUserMessageId(payload) {
	if (payload.update?.sessionUpdate !== "user_message_chunk") return null;
	const meta = payload._meta?.["codebuddy.ai"];
	if (!meta || typeof meta !== "object") return null;
	const messageId = meta.messageId ?? meta.userMessageId;
	return typeof messageId === "string" && messageId.trim().length > 0 ? messageId : null;
}
function isSyntheticOwnerHistoryEvent(payload) {
	const meta = payload._meta?.["codebuddy.ai"];
	return !!meta && typeof meta === "object" && meta.syntheticOwnerHistory === true;
}
function getTeamMemberEventName(payload) {
	const metas = [payload.update?._meta, payload._meta];
	for (const meta of metas) {
		const direct = meta?.["codebuddy.ai/memberEvent"];
		if (typeof direct === "string" && direct.trim()) return direct.trim();
		const nested = meta?.["codebuddy.ai"];
		if (nested && typeof nested === "object") {
			const memberName = nested.memberEvent;
			if (typeof memberName === "string" && memberName.trim()) return memberName.trim();
		}
	}
	return null;
}
function getOwnerHistoryInterruptionResolutionKey(payload) {
	const type = typeof payload.type === "string" ? payload.type : null;
	const toolCallId = typeof payload.toolCallId === "string" ? payload.toolCallId : null;
	if (type !== "questionCancelled" || !toolCallId) return null;
	return `${type}:${toolCallId}`;
}
function getOwnerHistoryInterruptionRequestKey(payload) {
	const type = typeof payload.type === "string" ? payload.type : null;
	const toolCallId = typeof payload.toolCallId === "string" ? payload.toolCallId : null;
	if (type !== "questionRequest" || !toolCallId) return null;
	return `${type}:${toolCallId}`;
}
function isOwnerInputRequestPayload(payload) {
	const type = typeof payload.type === "string" ? payload.type : null;
	return type === "permissionRequest" || type === "questionRequest" || type === "elicitationRequest";
}
function getOwnerHistoryOffset(payload) {
	const meta = payload._meta?.["codebuddy.ai"];
	if (!meta || typeof meta !== "object") return null;
	const rawOffset = meta.offset;
	if (typeof rawOffset === "number" && Number.isFinite(rawOffset)) return rawOffset;
	if (typeof rawOffset === "string") {
		const parsed = Number.parseInt(rawOffset, 10);
		return Number.isFinite(parsed) ? parsed : null;
	}
	return null;
}
function getOwnerHistoryMode(payload) {
	const meta = payload._meta?.["codebuddy.ai"];
	if (!meta || typeof meta !== "object") return null;
	const mode = meta.mode;
	return mode === "history" || mode === "stream" ? mode : null;
}
function getHistoryReplayPhase(payload) {
	const notificationMeta = payload._meta;
	const updateMeta = typeof payload.update?._meta === "object" ? payload.update._meta : void 0;
	const candidates = [
		updateMeta?.["codebuddy.ai/historyReplay"],
		notificationMeta?.["codebuddy.ai/historyReplay"],
		(updateMeta?.["codebuddy.ai"])?.historyReplay,
		(notificationMeta?.["codebuddy.ai"])?.historyReplay
	];
	for (const candidate of candidates) if (candidate === "start" || candidate === "end") return candidate;
	return null;
}
function normalizeOwnerHistoryReplayPayload(payload) {
	const nextPayload = cloneSessionPayload(payload);
	const existingMeta = nextPayload._meta;
	const existingCodebuddyMeta = existingMeta?.["codebuddy.ai"];
	const codebuddyMeta = existingCodebuddyMeta && typeof existingCodebuddyMeta === "object" ? existingCodebuddyMeta : {};
	nextPayload._meta = {
		...existingMeta ?? {},
		"codebuddy.ai": {
			...codebuddyMeta,
			mode: "history"
		}
	};
	return nextPayload;
}
function sessionHasPriorUserMessages(session) {
	return session.hasUserMessageSinceLastCompact;
}
function toExpertSelectionIdentity(desiredConfig) {
	const id = desiredConfig.expertId?.trim();
	if (!id) return;
	const marketplace = desiredConfig.expertMarketplace?.trim();
	return {
		id,
		...marketplace ? { marketplace } : {}
	};
}
function toPersistedExpertSelectionState(selection) {
	return {
		version: 1,
		selection: selection ? { ...selection } : null
	};
}
function fromPersistedExpertSelectionState(state) {
	return state?.version === 1 && state.selection ? { ...state.selection } : void 0;
}
function extractTextFromContentBlocks(content) {
	if (typeof content === "string") return content;
	if (Array.isArray(content)) return content.map(extractTextFromContentBlocks).join("");
	if (!content || typeof content !== "object") return "";
	const block = content;
	if (block.type === "text" && typeof block.text === "string") return block.text;
	return "";
}
function isCompactInternalEventPayload(payload) {
	const updateMeta = payload.update?._meta;
	const notifMeta = payload._meta;
	if (updateMeta?.["codebuddy.ai/isCompactInternal"] === true) return true;
	if (notifMeta?.["codebuddy.ai/isCompactInternal"] === true) return true;
	if ((updateMeta?.["codebuddy.ai"])?.["codebuddy.ai/isCompactInternal"] === true) return true;
	if ((notifMeta?.["codebuddy.ai"])?.["codebuddy.ai/isCompactInternal"] === true) return true;
	return isSessionSeparatorEventPayload(payload);
}
function isSessionSeparatorEventPayload(payload) {
	const updateMeta = payload.update?._meta;
	const notifMeta = payload._meta;
	if (updateMeta?.isSessionSeparator === true || notifMeta?.isSessionSeparator === true) return true;
	const updateNested = updateMeta?.["codebuddy.ai"];
	const notifNested = notifMeta?.["codebuddy.ai"];
	if (updateNested?.isSessionSeparator === true) return true;
	if (notifNested?.isSessionSeparator === true) return true;
	return false;
}
function extractTeamUpdate(notification) {
	const rootMeta = notification._meta;
	const updateMeta = notification.update?._meta;
	const direct = rootMeta?.["codebuddy.ai/teamUpdate"] ?? updateMeta?.["codebuddy.ai/teamUpdate"];
	const nestedCodebuddy = rootMeta?.["codebuddy.ai"] ?? updateMeta?.["codebuddy.ai"];
	const nested = nestedCodebuddy && typeof nestedCodebuddy === "object" ? nestedCodebuddy.teamUpdate : void 0;
	const teamUpdate = direct ?? nested;
	if (!teamUpdate || typeof teamUpdate !== "object") return null;
	const type = teamUpdate.type;
	if (type !== "team_created" && type !== "team_deleted" && type !== "member_status_change" && type !== "team_idle" && type !== "team_busy") return null;
	return {
		type,
		teamName: teamUpdate.teamName,
		isAutoTeam: teamUpdate.isAutoTeam,
		members: teamUpdate.members
	};
}
function normalizeTeamMemberStatus(rawStatus) {
	return rawStatus.trim().toLowerCase().replace(/[\s-]+/g, "_");
}
function isActiveTeamMemberStatus(status) {
	const normalized = normalizeTeamMemberStatus(status);
	return normalized === "pending" || normalized === "running";
}
function isActiveToolResultStatus(status) {
	return status === "pending" || status === "in_progress";
}
function isTerminalToolCallStatus(status) {
	return status === "completed" || status === "failed" || status === "cancelled" || status === "canceled";
}
function deriveTerminalExportStatus(state) {
	if (state.archivedAt) return "archived";
	if (state.runState === "terminated" || state.terminalOutcome === "terminated") return "terminated";
	if (state.runState === "errored" || state.terminalOutcome === "error") return "error";
	if (state.terminalOutcome === "failed") return "failed";
	if (state.terminalOutcome === "completed") return "completed";
	return deriveTaskStatus(state);
}
function summarizePromptForLog(prompt) {
	return {
		itemCount: Array.isArray(prompt) ? prompt.length : 0,
		itemTypes: Array.isArray(prompt) ? prompt.slice(0, 10).map((item) => item && typeof item === "object" && typeof item.type === "string" ? item.type : typeof item) : []
	};
}
function summarizePromptMetaForLog(meta) {
	if (!meta || typeof meta !== "object") return null;
	const metaRecord = meta;
	const codebuddyMeta = metaRecord["codebuddy.ai"];
	return {
		keys: Object.keys(metaRecord).slice(0, 20),
		requestId: pickStringMeta(metaRecord["codebuddy.ai/requestId"]),
		messageId: pickStringMeta(metaRecord["codebuddy.ai/messageId"]),
		messageRequestId: pickStringMeta(metaRecord["codebuddy.ai/messageRequestId"]),
		codebuddyKeys: codebuddyMeta && typeof codebuddyMeta === "object" ? Object.keys(codebuddyMeta).slice(0, 20) : []
	};
}
function summarizeTaskStateForLog(taskState) {
	return {
		turnSeq: taskState.turnSeq,
		runState: taskState.runState,
		executionStage: taskState.executionStage,
		pendingInputKind: taskState.pendingInputKind,
		terminalOutcome: taskState.terminalOutcome,
		archivedAt: taskState.archivedAt,
		lastTransitionAt: taskState.lastTransitionAt
	};
}
function shouldEmitSyntheticPromptFailureStateUpdate(error) {
	if (!error || typeof error !== "object") return true;
	const record = error;
	return !(record.code && (record.data || record._meta));
}
function createPromptFailureStateUpdate(session, meta, error) {
	const currentState = derivePromptFailureRuntimeState(session.taskState, session.stopRequested);
	const requestId = extractPromptFailureRequestId(meta);
	const traceId = extractPromptFailureTraceId(meta, error);
	const errorData = extractPromptFailureData(error);
	return {
		sessionId: session.sessionId,
		update: {
			sessionUpdate: "state_update",
			currentState,
			timestamp: Date.now()
		},
		_meta: { "codebuddy.ai": {
			currentState,
			state: currentState,
			...requestId ? { requestId } : {},
			error: {
				code: extractPromptFailureCode(error),
				message: error instanceof Error ? error.message : String(error),
				...requestId ? { requestId } : {},
				...traceId ? { traceId } : {},
				...errorData !== void 0 ? { data: errorData } : {}
			}
		} }
	};
}
function derivePromptFailureRuntimeState(taskState, stopRequested) {
	if (stopRequested) return "cancelled";
	if (taskState.terminalOutcome === "completed") return "completed";
	if (taskState.terminalOutcome === "terminated") return "terminated";
	return "error";
}
function extractPromptFailureRequestId(meta) {
	if (!meta || typeof meta !== "object") return;
	const metaRecord = meta;
	const codebuddyMeta = metaRecord["codebuddy.ai"];
	const codebuddyRecord = codebuddyMeta && typeof codebuddyMeta === "object" ? codebuddyMeta : void 0;
	return pickStringMeta(metaRecord["codebuddy.ai/requestId"]) ?? pickStringMeta(metaRecord["codebuddy.ai/messageRequestId"]) ?? pickStringMeta(codebuddyRecord?.requestId) ?? pickStringMeta(codebuddyRecord?.messageRequestId) ?? pickStringMeta(codebuddyRecord?.userMessageId);
}
function extractPromptFailureTraceId(meta, error) {
	if (error && typeof error === "object") {
		const errorRecord = error;
		const nestedMeta = errorRecord._meta;
		if (nestedMeta && typeof nestedMeta === "object") {
			const nestedMetaRecord = nestedMeta;
			const nestedCodebuddyMeta = nestedMetaRecord["codebuddy.ai"];
			const nestedCodebuddyRecord = nestedCodebuddyMeta && typeof nestedCodebuddyMeta === "object" ? nestedCodebuddyMeta : void 0;
			const errorTraceId = pickStringMeta(nestedMetaRecord.traceId) ?? pickStringMeta(nestedMetaRecord["codebuddy.ai/traceId"]) ?? pickStringMeta(nestedCodebuddyRecord?.traceId);
			if (errorTraceId) return errorTraceId;
		}
		const directTraceId = pickStringMeta(errorRecord.traceId) ?? pickStringMeta(errorRecord.trace_id);
		if (directTraceId) return directTraceId;
	}
	if (!meta || typeof meta !== "object") return;
	const metaRecord = meta;
	const codebuddyMeta = metaRecord["codebuddy.ai"];
	const codebuddyRecord = codebuddyMeta && typeof codebuddyMeta === "object" ? codebuddyMeta : void 0;
	return pickStringMeta(metaRecord.traceId) ?? pickStringMeta(metaRecord["codebuddy.ai/traceId"]) ?? pickStringMeta(codebuddyRecord?.traceId);
}
function isCompactFailedError(error) {
	if (!error || typeof error !== "object") return false;
	const err = error;
	if (err.code === -32004) return err.data?.reason === "compact_failed";
	return false;
}
function extractPromptFailureCode(error) {
	if (error && typeof error === "object") {
		const code = error.code;
		if (typeof code === "string" || typeof code === "number") return code;
	}
	return "PROMPT_FAILED";
}
function extractPromptFailureData(error) {
	if (!error || typeof error !== "object") return;
	const record = error;
	if (record.data !== void 0) return sanitizeLogValue(record.data);
}
function serializeErrorForLog(error) {
	if (error instanceof Error) {
		const errorWithExtras = error;
		return {
			name: error.name,
			message: error.message,
			stack: error.stack,
			code: errorWithExtras.code,
			data: sanitizeLogValue(errorWithExtras.data),
			cause: errorWithExtras.cause ? serializeErrorCauseForLog(errorWithExtras.cause) : void 0
		};
	}
	return { message: String(error) };
}
function serializeErrorCauseForLog(error) {
	if (error instanceof Error) return serializeErrorForLog(error);
	return String(error);
}
function sanitizeLogValue(value, depth = 0) {
	if (depth >= 3) return "[truncated]";
	if (value == null || typeof value === "number" || typeof value === "boolean" || typeof value === "string") return value;
	if (Array.isArray(value)) return value.slice(0, 10).map((item) => sanitizeLogValue(item, depth + 1));
	if (value instanceof Error) return serializeErrorForLog(value);
	if (typeof value === "object") {
		const entries = Object.entries(value).slice(0, 20);
		return Object.fromEntries(entries.map(([key, nested]) => [key, sanitizeLogValue(nested, depth + 1)]));
	}
	return String(value);
}
function pickStringMeta(value) {
	return typeof value === "string" && value.length > 0 ? value : void 0;
}
function normalizeQueueForRestart(snapshot, sessionId) {
	if (!snapshot || typeof snapshot !== "object") return;
	const data = snapshot;
	const recoverable = (Array.isArray(data.items) ? data.items : []).filter((item) => {
		if (!item || typeof item !== "object") return false;
		const status = item.status;
		return status === "pending" || status === "sending";
	}).map((item) => ({
		...item,
		status: "pending",
		lastAttemptAt: void 0
	})).sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0)).map((item, index) => ({
		...item,
		order: index
	}));
	if (recoverable.length === 0) return;
	const now = Date.now();
	const keepPaused = data.runtime?.paused === true && data.runtime?.pauseReason === "error";
	return {
		version: typeof data.version === "number" ? data.version : 0,
		conversationId: sessionId,
		updatedAt: now,
		items: recoverable,
		runtime: {
			activated: false,
			paused: keepPaused,
			pauseReason: keepPaused ? "error" : void 0,
			lastError: keepPaused ? data.runtime?.lastError : void 0,
			updatedAt: now
		}
	};
}
return {SessionManager,coordinator:require_workbuddy_auth_product_coordinator};
}

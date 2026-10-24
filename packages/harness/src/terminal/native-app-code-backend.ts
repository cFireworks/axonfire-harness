// @ts-nocheck
import {createNativeAppCliEnvironment} from './native-app-cli-environment.js';
export const APP_CODE_BACKEND_SOURCE={"sources":[{"file":"workbuddy-auth-product-coordinator.js","sha256":"8624215504229c4b6190f5c2172da270e015cc96871e90b261786f047e4c6e78"},{"file":"initialize.js","sha256":"528d3bffc67c5244d1a641e0cfc13c2be4ef7943c248b390125b76d70880ed19"}],"regions":[{"file":"workbuddy-auth-product-coordinator.js","from":337130,"to":337179},{"file":"workbuddy-auth-product-coordinator.js","from":337180,"to":337239},{"file":"workbuddy-auth-product-coordinator.js","from":337404,"to":337467},{"file":"workbuddy-auth-product-coordinator.js","from":337468,"to":337512},{"file":"workbuddy-auth-product-coordinator.js","from":337513,"to":337563},{"file":"workbuddy-auth-product-coordinator.js","from":337564,"to":337929},{"file":"workbuddy-auth-product-coordinator.js","from":337930,"to":337988},{"file":"workbuddy-auth-product-coordinator.js","from":337989,"to":338071},{"file":"workbuddy-auth-product-coordinator.js","from":338072,"to":338158},{"file":"workbuddy-auth-product-coordinator.js","from":338516,"to":338573},{"file":"workbuddy-auth-product-coordinator.js","from":338620,"to":338666},{"file":"workbuddy-auth-product-coordinator.js","from":338732,"to":338964},{"file":"workbuddy-auth-product-coordinator.js","from":339081,"to":339373},{"file":"workbuddy-auth-product-coordinator.js","from":339585,"to":339917},{"file":"workbuddy-auth-product-coordinator.js","from":340026,"to":342191},{"file":"initialize.js","from":3461763,"to":3462035},{"file":"initialize.js","from":3462588,"to":3462626},{"file":"initialize.js","from":3462864,"to":3463326},{"file":"initialize.js","from":3463420,"to":3465888}],"names":["CONNECTOR_PROXY_MCP_NAME","WORKBUDDY_SESSION_ID_HEADER","WORKBUDDY_WELCOME_MODE_HEADER","BUILTIN_ARDOT_MCP_SERVER_NAME","BUILTIN_NETDRIVE_MCP_SERVER_NAME","BUILTIN_NETDRIVE_TOOL_NAMES","CONVERSATION_SEARCH_TOOL_NAME","AGENT_MAIL_UPLOAD_ATTACHMENT_TOOL_NAME","AGENT_MAIL_DOWNLOAD_ATTACHMENT_TOOL_NAME","TOOL_SHORT_DESCRIPTION_META_KEY","PICK_LOCATION_TOOL_NAME","BUILTIN_TOOL_NAMES","DEFERRED_BUILTIN_TOOL_NAMES","resolveEffectiveDeferredBuiltinNames","buildConnectorProxyMcpConfig","getHostedCliSessionOwnerKey","POI_MAP_GATE_TAG","isPoiMapEnabled","createWorkbuddyAppServerCodeBackend"]} as const;
export function createNativeAppCodeBackend(runtime:any={}):any {
const console=runtime.console??globalThis.console;
const {resolveWorkbuddyAppServerCodeCliPath,buildWorkbuddyAppServerCodeCliEnv}=runtime.cliEnvironment??createNativeAppCliEnvironment(runtime);
// BEGIN ORIGINAL
var CONNECTOR_PROXY_MCP_NAME = "connector-proxy";
var WORKBUDDY_SESSION_ID_HEADER = "X-WorkBuddy-Session-Id";
var WORKBUDDY_WELCOME_MODE_HEADER = "X-WorkBuddy-Welcome-Mode";
var BUILTIN_ARDOT_MCP_SERVER_NAME = "ardot";
var BUILTIN_NETDRIVE_MCP_SERVER_NAME = "netdrive";
var BUILTIN_NETDRIVE_TOOL_NAMES = [
	"netdrive_tdrive.dir_create",
	"netdrive_tdrive.dir_list",
	"netdrive_tdrive.file_upload",
	"netdrive_tdrive.file_upload_complete",
	"netdrive_tdrive.file_download",
	"netdrive_tdrive.file_move",
	"netdrive_tdrive.file_rename",
	"netdrive_tdrive.file_delete",
	"netdrive_tdrive.search_file",
	"netdrive_tdrive.search_content"
];
var CONVERSATION_SEARCH_TOOL_NAME = "conversation_search";
var AGENT_MAIL_UPLOAD_ATTACHMENT_TOOL_NAME = "mcp__agent-mail__upload_attachment";
var AGENT_MAIL_DOWNLOAD_ATTACHMENT_TOOL_NAME = "mcp__agent-mail__download_attachment";
var TOOL_SHORT_DESCRIPTION_META_KEY = "shortDescription";
var PICK_LOCATION_TOOL_NAME = "pick_location";
var BUILTIN_TOOL_NAMES = [
	"present_files",
	"connect_cloud_service",
	"connect_open_platform",
	"automation_update",
	"read_me",
	"show_widget",
	CONVERSATION_SEARCH_TOOL_NAME,
	"workbuddy_cloudstudio_deploy",
	"agentic_search"
];
var DEFERRED_BUILTIN_TOOL_NAMES = new Set([
	"connect_cloud_service",
	"connect_open_platform",
	"workbuddy_marketplace_skill",
	"workbuddy_cloudstudio_deploy",
	AGENT_MAIL_UPLOAD_ATTACHMENT_TOOL_NAME,
	AGENT_MAIL_DOWNLOAD_ATTACHMENT_TOOL_NAME,
	PICK_LOCATION_TOOL_NAME,
	"agentic_search"
]);
function resolveEffectiveDeferredBuiltinNames(builtinToolNames, poiMapEnabled) {
	const effective = new Set(DEFERRED_BUILTIN_TOOL_NAMES);
	if (poiMapEnabled === false) effective.delete(PICK_LOCATION_TOOL_NAME);
	if (builtinToolNames.includes("conversation_search")) effective.add(CONVERSATION_SEARCH_TOOL_NAME);
	return effective;
}
function buildConnectorProxyMcpConfig(port, options = {}) {
	if (!Number.isFinite(port) || port <= 0) {
		console.warn(`[ConnectorProxy] MCP startup config requested but proxy server not ready (port=${port})`);
		return "";
	}
	const { connectorToolServerMap, proxySecret } = options;
	const builtinToolNames = options.cloudMemoryEnabled === false ? BUILTIN_TOOL_NAMES.filter((name) => name !== CONVERSATION_SEARCH_TOOL_NAME) : BUILTIN_TOOL_NAMES;
	const effectiveDeferredBuiltinNames = resolveEffectiveDeferredBuiltinNames(builtinToolNames, options.poiMapEnabled);
	const tools = {};
	for (const name of builtinToolNames) {
		const isDeferred = effectiveDeferredBuiltinNames.has(name);
		tools[name] = {
			defer_loading: isDeferred,
			...isDeferred ? { bare_name: true } : {}
		};
	}
	for (const name of effectiveDeferredBuiltinNames) tools[name] = {
		...tools[name],
		defer_loading: true,
		bare_name: true
	};
	if (connectorToolServerMap) for (const [name, serverName] of Object.entries(connectorToolServerMap)) {
		if (options.cloudMemoryEnabled === false && name === "conversation_search") continue;
		if (options.netdriveEnabled === false && serverName === "netdrive") continue;
		if (!tools[name]) tools[name] = { server_name: serverName };
	}
	if (connectorToolServerMap) for (const [name, serverName] of Object.entries(connectorToolServerMap)) {
		if (serverName !== "ardot") continue;
		tools[name] = {
			...tools[name],
			server_name: BUILTIN_ARDOT_MCP_SERVER_NAME,
			defer_loading: false
		};
	}
	if (options.netdriveEnabled !== false) {
		for (const name of BUILTIN_NETDRIVE_TOOL_NAMES) if (!tools[name]) tools[name] = {
			server_name: BUILTIN_NETDRIVE_MCP_SERVER_NAME,
			defer_loading: true
		};
	}
	const serverConfig = {
		type: "http",
		url: `http://127.0.0.1:${port}/mcp`,
		defer_loading: true,
		tools,
		transparent_proxy: true,
		builtin_tools: [...builtinToolNames, ...[...effectiveDeferredBuiltinNames].filter((name) => !builtinToolNames.includes(name))]
	};
	if (proxySecret) serverConfig.headers = { Authorization: `Bearer ${proxySecret}` };
	return JSON.stringify({ mcpServers: { [CONNECTOR_PROXY_MCP_NAME]: serverConfig } });
}
function getHostedCliSessionOwnerKey(session) {
	if (!session?.account?.uid && !session?.auth?.domain && !session?.account?.enterpriseId) return;
	return [
		session?.account?.uid ?? "",
		session?.auth?.domain ?? "",
		session?.account?.enterpriseId ?? ""
	].join("|");
}
var POI_MAP_GATE_TAG = "[PoiMapGate]";
function isPoiMapEnabled(productManager, logger) {
	const merged = productManager.configuration?.getValue()?.productFeatures;
	const current = productManager.getCurrentConfiguration?.()?.productFeatures;
	const features = merged ?? current;
	const source = merged ? "configuration" : current ? "getCurrentConfiguration" : "none";
	const poiMap = features?.PoiMap === true;
	logger?.info(`${POI_MAP_GATE_TAG} poiMap=${poiMap} source=${source}`);
	return poiMap;
}
function createWorkbuddyAppServerCodeBackend(options) {
	const { celljs, platform, runtimeManager, tencentDocsMcp } = options;
	return options.createBackend(runtimeManager, {
		logger: celljs.logger,
		getAppPath: () => platform.appRootPath,
		isAppPackaged: () => platform.isPackaged,
		getAppVersion: () => platform.appVersion,
		getSystemLocale: () => platform.appLocale(),
		getConfigDir: () => platform.configDir,
		getUserDataDir: () => platform.dataDir,
		readAppConfigValue: (key) => celljs.configService.get(key),
		resolveProxyEnv: options.resolveProxyEnv,
		resolveCliPath: () => resolveWorkbuddyAppServerCodeCliPath(options),
		buildEnv: (extra) => buildWorkbuddyAppServerCodeCliEnv(options, extra),
		resolveBundledAsset: options.adapters.resolveBundledAsset,
		requireBundledAsset: options.adapters.requireBundledAsset,
		getBootstrapProductConfigEnv: options.adapters.getBootstrapProductConfigEnv,
		getProcessProxyEnv: options.adapters.getProcessProxyEnv,
		storeSessionCreateTiming: options.adapters.storeSessionCreateTiming,
		resolveCliEnvRouteMode: options.adapters.resolveCliEnvRouteMode,
		reportPromptForwardingEvent: options.adapters.reportPromptForwardingEvent,
		reportPromptDoneEvent: options.adapters.reportPromptDoneEvent,
		reportPromptTrace: options.adapters.reportPromptTrace,
		getQimei36: options.adapters.getQimei36,
		getMcpConfig: (ctx) => require_workbuddy_auth_product_coordinator.buildConnectorProxyMcpConfig(celljs.connectorProxyServer.getPort(), {
			cloudMemoryEnabled: celljs.configService.get("generateMemoryEnabled") !== false,
			proxySecret: celljs.connectorProxyServer.getProxySecret(),
			poiMapEnabled: isPoiMapEnabled(celljs.productManager),
			netdriveEnabled: !!ctx?.projectId,
			connectorToolServerMap: celljs.connectorMcpProxy?.getToolServerMap()
		}),
		getAgentExtraEnv: tencentDocsMcp?.resolveAgentEnv.bind(tencentDocsMcp),
		getConnectorTokenEnv: () => celljs.connectorService.getSkillOnlyTokenEnv(),
		getProjectSessionEnv: (sessionId) => options.adapters.getProjectSessionEnv?.(sessionId),
		getProjectMcpServersForSession: (sessionId) => options.adapters.getProjectMcpServersForSession?.(sessionId),
		getAgentTeamsEnv: (sessionId) => options.agentTeamsEnvResolver.resolveForSession(sessionId),
		isAuthenticated: () => getHostedCliSessionOwnerKey(celljs.authenticationManager.currentSessionSubject.getValue()) !== void 0,
		auditStore: options.auditStore,
		cliPrewarmPool: options.cliPrewarmPool
	});
}
// END ORIGINAL
const require_workbuddy_auth_product_coordinator={buildConnectorProxyMcpConfig};
return {CONNECTOR_PROXY_MCP_NAME,WORKBUDDY_SESSION_ID_HEADER,WORKBUDDY_WELCOME_MODE_HEADER,BUILTIN_ARDOT_MCP_SERVER_NAME,BUILTIN_NETDRIVE_MCP_SERVER_NAME,BUILTIN_NETDRIVE_TOOL_NAMES,CONVERSATION_SEARCH_TOOL_NAME,AGENT_MAIL_UPLOAD_ATTACHMENT_TOOL_NAME,AGENT_MAIL_DOWNLOAD_ATTACHMENT_TOOL_NAME,TOOL_SHORT_DESCRIPTION_META_KEY,PICK_LOCATION_TOOL_NAME,BUILTIN_TOOL_NAMES,DEFERRED_BUILTIN_TOOL_NAMES,resolveEffectiveDeferredBuiltinNames,buildConnectorProxyMcpConfig,getHostedCliSessionOwnerKey,POI_MAP_GATE_TAG,isPoiMapEnabled,createWorkbuddyAppServerCodeBackend};
}

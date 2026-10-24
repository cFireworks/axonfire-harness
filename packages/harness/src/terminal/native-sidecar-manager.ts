// @ts-nocheck
import {createNativeSidecarClientInfo} from './native-sidecar-client-info.js';
import {createNativeSidecarCommon} from './native-sidecar-common.js';
import {createNativeSidecarRuntimeContext} from './native-sidecar-runtime-context.js';
import {createNativeSidecarProxyEnvironment} from './native-sidecar-proxy-env.js';
import {createNativeSidecarLogger} from './native-sidecar-logger.js';
import {createNativeSidecarCliProductEnvironment} from './native-sidecar-cli-product-env.js';
// Original manager and runtime environment/file helpers, preserved declaration-for-declaration.
import * as nodeFs from 'node:fs';
import * as nodePath from 'node:path';
import * as nodeOs from 'node:os';
import * as nodeCrypto from 'node:crypto';
import * as nodeChildProcess from 'node:child_process';
import * as nodeNet from 'node:net';
import {fileURLToPath} from 'node:url';
import {createNativeSidecarEnvironment} from './native-sidecar-environment.js';
import {createNativeSidecarClient} from './native-sidecar-client.js';
import {createNativeSessionReplayTransport} from '../sessions/native-session-replay-transport.js';
export const SIDECAR_MANAGER_SOURCE={"file":"cli-prewarm-pool.js","sha256":"ecb7ff634b205288b5ea236519f01292a0a2d02802e1bded03d382532ec3f296","declarations":[{"names":["DEFAULT_AGENT_CLI_BUNDLED_RUNTIME_CONFIG"],"from":6550,"to":6676},{"names":["buildAgentCliRuntimeEnv"],"from":6677,"to":10232},{"names":["prependDirsToEnvPath"],"from":10420,"to":10745},{"names":["resolveDisabledManagedRuntimeTypes"],"from":10746,"to":10991},{"names":["stringValues"],"from":10992,"to":11169},{"names":["copyProcessEnv"],"from":11170,"to":11343},{"names":["fsp"],"from":11462,"to":11489},{"names":["resolveAgentCliConnectorBin"],"from":11490,"to":11762},{"names":["resolveAgentCliPythonEnvBin"],"from":11763,"to":12020},{"names":["resolveAgentCliExecutablePath"],"from":12021,"to":12614},{"names":["listAgentCliManagedBinDirs"],"from":12615,"to":13445},{"names":["listAgentCliManagedBinDirsAsync"],"from":13446,"to":14305},{"names":["readManagedBundledRuntimeFromEnv"],"from":14581,"to":15515},{"names":["readAgentCliBundledRuntimeConfig"],"from":15516,"to":16115},{"names":["readAgentCliBundledRuntimeConfigAsync"],"from":16116,"to":16724},{"names":["readAgentCliAppConfigValue"],"from":16725,"to":16988},{"names":["resolveAgentCliRuntimeDirs"],"from":16989,"to":17195},{"names":["resolveAgentCliConfigDir"],"from":17196,"to":17458},{"names":["resolveAgentCliUserDataDir"],"from":17459,"to":17682},{"names":["listAgentCliEnabledPluginDirs"],"from":17683,"to":18473},{"names":["listAgentCliEnabledPluginDirsAsync"],"from":18474,"to":19289},{"names":["normalizeAgentCliBuiltinSkillsDir"],"from":19290,"to":19521},{"names":["compareVersionsDesc"],"from":19522,"to":19906},{"names":["resolveInjectedPath"],"from":19907,"to":20026},{"names":["TAG$1"],"from":20607,"to":20638},{"names":["HOST_RUNTIME_SESSION_ID"],"from":20639,"to":20694},{"names":["HOST_ENDPOINT_WAIT_TIMEOUT_MS"],"from":20695,"to":20735},{"names":["HOST_ENDPOINT_PROBE_TIMEOUT_MS"],"from":20736,"to":20777},{"names":["HOST_RUNTIME_INSTANCE_ID_ENV"],"from":20778,"to":20845},{"names":["HOST_RUNTIME_HEALTH_PATH"],"from":20846,"to":20894},{"names":["MAX_PING_RETRIES"],"from":20968,"to":20994},{"names":["PING_RETRY_DELAY_MS"],"from":21036,"to":21066},{"names":["STALE_PIPE_RECLAIM_TIMEOUT_MS"],"from":21393,"to":21433},{"names":["STALE_PIPE_PROBE_INTERVAL_MS"],"from":21517,"to":21556},{"names":["SIDECAR_STDERR_TAIL_LINES"],"from":21659,"to":21694},{"names":["sidecarScopedLogger"],"from":21695,"to":21719},{"names":["resolveSidecarScopedLogger"],"from":21720,"to":21902},{"names":["formatSidecarLogArgs"],"from":21903,"to":22167},{"names":["sidecarLog"],"from":22168,"to":22439},{"names":["isExpectedSidecarShutdownLine"],"from":22440,"to":22596},{"names":["isHostedCliRuntimeSessionId"],"from":22597,"to":22760},{"names":["USE_SYSTEM_CA_NODE_OPTION"],"from":22761,"to":22811},{"names":["CODEBUDDY_QIMEI36_ENV_KEY"],"from":22812,"to":22864},{"names":["buildSidecarProcessEnv"],"from":22865,"to":23229},{"names":["defaultResolveBundledAsset"],"from":23230,"to":23270},{"names":["defaultGetBootstrapProductConfigEnv"],"from":23271,"to":23335},{"names":["resolveWorkbuddySidecarBundledAsset"],"from":23336,"to":24312},{"names":["withWorkbuddySidecarDefaults"],"from":24313,"to":24875},{"names":["getHostedCliCwd"],"from":24876,"to":24985},{"names":["getProxyEnvFromProcess"],"from":24986,"to":25463},{"names":["defaultResolveProxyEnv"],"from":25464,"to":25541},{"names":["HostRuntimeStartSupersededError"],"from":25542,"to":25747},{"names":["HostRuntimeIdentityMismatchError"],"from":25748,"to":25972},{"names":["sidecarCrashWatcher"],"from":25973,"to":25997},{"names":["bindSidecarCrashWatcher"],"from":25998,"to":26065},{"names":["SidecarManager"],"from":26066,"to":60496},{"names":["createWorkbuddySidecarManager"],"from":60497,"to":60683},{"names":["waitForControlPathFree"],"from":61563,"to":62353},{"names":["extractHttpEndpoint"],"from":62354,"to":62451},{"names":["waitForEndpoint"],"from":62452,"to":63598},{"names":["probeHostRuntimeEndpoint"],"from":63599,"to":65256},{"names":["waitForHostRuntimeEndpoint"],"from":65257,"to":66362},{"names":["isHostRuntimeEndpointReachable"],"from":66363,"to":66576},{"names":["isEndpointReachable"],"from":66577,"to":66717},{"names":["resolveCLIPath"],"from":66718,"to":67635},{"names":["pathExists"],"from":67636,"to":67765},{"names":["unlinkFileSafeAsync"],"from":67766,"to":67871},{"names":["buildCliEnvAsync"],"from":67872,"to":68091},{"names":["createBuildCliEnvContext"],"from":68092,"to":68874},{"names":["resolveBuildCliEnvIoAsync"],"from":68875,"to":69967},{"names":["buildCliEnvFromResolved"],"from":69968,"to":73698}]} as const;
export function createNativeSidecarManager(runtime:any={}):any {
const fs=nodeFs, node_fs=nodeFs, path=nodePath, node_path=nodePath, os=nodeOs, node_os=nodeOs;
const crypto=nodeCrypto, node_crypto=nodeCrypto, child_process=runtime.childProcess ?? nodeChildProcess, net=runtime.net ?? nodeNet;
const process=runtime.process ?? globalThis.process, console=runtime.console ?? globalThis.console, fetch=runtime.fetch ?? globalThis.fetch;
const __dirname=runtime.dirname ?? nodePath.dirname(fileURLToPath(import.meta.url));
const require_cli_process_env=runtime.environment ?? createNativeSidecarEnvironment({process});
const {SidecarClient}=runtime.client ?? createNativeSidecarClient({environment:require_cli_process_env,console});
const require_gateway_secret=runtime.gateway ?? createNativeSessionReplayTransport();
const require_logger=runtime.loggerModule ?? createNativeSidecarLogger({console}), require_runtime_context=runtime.runtimeContext ?? createNativeSidecarRuntimeContext({process}), require_proxy_env=runtime.proxyEnv ?? createNativeSidecarProxyEnvironment(), require_client_info_env=runtime.clientInfo ?? createNativeSidecarClientInfo({process}), require_cli_product_env=runtime.productEnv ?? createNativeSidecarCliProductEnvironment({process}), require_common=runtime.common ?? createNativeSidecarCommon({process});
var DEFAULT_AGENT_CLI_BUNDLED_RUNTIME_CONFIG = {
	enabled: true,
	tools: {
		node: true,
		python: true,
		gitBash: true
	}
};
function buildAgentCliRuntimeEnv(options) {
	const env = {
		DISABLE_AUTOUPDATER: "1",
		ELECTRON_RUN_AS_NODE: "1",
		CODEBUDDY_GIT_REPO_SCAN_DISABLED: "1",
		CODEBUDDY_PROMPT_SUGGESTION_DISABLED: "1",
		CODEBUDDY_CONFIG_DIR: options.configDir,
		WORKBUDDY_CONFIG_DIR: options.configDir,
		WORKBUDDY_DATA_FOLDER_NAME: options.dataFolderName?.trim() || options.processEnv?.WORKBUDDY_DATA_FOLDER_NAME?.trim() || ".workbuddy",
		...require_gateway_secret.gatewaySecretEnv(),
		CODEBUDDY_DISABLE_CRON: "1",
		CODEBUDDY_INCLUDE_TOPIC_MESSAGE: "1",
		CODEBUDDY_CODE_DISABLE_SESSION_SUMMARY: "1",
		CODEBUDDY_BUILTIN_SKILLS_DIR: options.builtinSkillsDir,
		CODEBUDDY_DISABLE_AUTO_MEMORY: "1",
		CODEBUDDY_DISABLE_SYSTEM_REMINDER_MD: "1",
		CODEBUDDY_DISABLE_REQUEST_VALIDATION: "1",
		CODEBUDDY_SKIP_GIT_BASH_CHECK: "1",
		CODEBUDDY_HOST: "workbuddy-desktop",
		CODEBUDDY_HIGH_CREDIT_APPROVAL_ENABLED: "1",
		CODEBUDDY_DISABLE_EXTENDED_PLUGIN_HOOKS: "1",
		CODEBUDDY_DISABLE_SESSION_HISTORY_CLEANUP: "1",
		CODEBUDDY_POWERSHELL_USE_PTY: "1",
		CODEBUDDY_REPLAY_SHOW_PRE_COMPACT: "1",
		CODEBUDDY_REASONING_ONLY_END_TURN: "1",
		CODEBUDDY_CODE_IMAGE_COMPRESSION_MAX_DIMENSION: "1080",
		CODEBUDDY_SKILL_TOOL_CHAR_BUDGET: "30000",
		CODEBUDDY_DISABLE_FORK_SUBAGENT: "1",
		CODEBUDDY_ENABLE_SECURITY_AUDIT: "1",
		...stringValues(options.clientInfoEnv)
	};
	if (options.productConfigEnv) env.ACC_PRODUCT_CONFIG_V3 = options.productConfigEnv;
	if (options.productConfigPathEnv) env.ACC_PRODUCT_CONFIG_PATH = options.productConfigPathEnv;
	if (options.hostedCliInternetEnv) env.CODEBUDDY_INTERNET_ENVIRONMENT = options.hostedCliInternetEnv;
	if (options.pluginDirs) env.CODEBUDDY_PLUGIN_DIRS = options.pluginDirs;
	Object.assign(env, stringValues(options.proxyEnv));
	const runtimeConfig = options.bundledRuntimeConfig ?? DEFAULT_AGENT_CLI_BUNDLED_RUNTIME_CONFIG;
	const rtEnabled = runtimeConfig.enabled !== false;
	const managedNodeBinDirs = rtEnabled && runtimeConfig.tools?.node !== false ? options.managedNodeBinDirs ?? [] : [];
	const extraPathParts = [];
	extraPathParts.push(...managedNodeBinDirs);
	if (rtEnabled && runtimeConfig.tools?.python !== false) extraPathParts.push(...options.managedPythonBinDirs ?? []);
	extraPathParts.push(options.cliConnectorBin);
	if (rtEnabled && runtimeConfig.tools?.python !== false && options.pythonConnectorEnvBin) extraPathParts.push(options.pythonConnectorEnvBin);
	env.WORKBUDDY_EXTRA_PATHS = extraPathParts.filter(Boolean).join(options.pathDelimiter);
	const processEnv = options.processEnv ?? {};
	prependDirsToEnvPath(env, managedNodeBinDirs, processEnv, options.pathDelimiter);
	if (rtEnabled && runtimeConfig.tools?.gitBash !== false && processEnv.CODEBUDDY_CODE_GIT_BASH_PATH) env.CODEBUDDY_CODE_GIT_BASH_PATH = processEnv.CODEBUDDY_CODE_GIT_BASH_PATH;
	const disabledTypes = resolveDisabledManagedRuntimeTypes(runtimeConfig, options.registeredBinaryTypes ?? []);
	if (disabledTypes.length > 0) env.WORKBUDDY_MANAGED_RUNTIME_DISABLED = disabledTypes.join(",");
	copyProcessEnv(env, processEnv, [
		"SANDBOX_CLI_SHOW_CONSOLE",
		"SANDBOX_CLI_PATH",
		"CODEBUDDY_DISABLE_WEB_FETCH_REMOTE_API",
		"CODEBUDDY_PRE_MESSAGE_COMPACT_PCT",
		"CODEBUDDY_AUTOCOMPACT_PCT_OVERRIDE",
		"CODEBUDDY_ENGINEERING_COMPACT_SUFFICIENCY_PCT",
		"WEIXINPAY_MOCK_OUTCOME"
	]);
	const devEndpointOverride = require_common.getProductEndpointOverride().resolve();
	if (devEndpointOverride) env[require_common.WORKBUDDY_DEV_ENDPOINT_OVERRIDE_ENV] = devEndpointOverride;
	if (options.extra) Object.assign(env, options.extra);
	return env;
}
function prependDirsToEnvPath(env, dirs, processEnv, pathDelimiter) {
	if (dirs.length === 0) return;
	const pathKey = Object.keys(processEnv).find((key) => key.toLowerCase() === "path") ?? "PATH";
	const base = env[pathKey] ?? processEnv[pathKey] ?? "";
	env[pathKey] = [...dirs, base].filter(Boolean).join(pathDelimiter);
}
function resolveDisabledManagedRuntimeTypes(runtimeConfig, registeredBinaryTypes) {
	if (runtimeConfig.enabled === false) return [...registeredBinaryTypes];
	return registeredBinaryTypes.filter((type) => runtimeConfig.tools?.[type] === false);
}
function stringValues(input) {
	const output = {};
	for (const [key, value] of Object.entries(input ?? {})) if (typeof value === "string") output[key] = value;
	return output;
}
function copyProcessEnv(env, processEnv, keys) {
	for (const key of keys) {
		const value = processEnv[key];
		if (typeof value === "string" && value) env[key] = value;
	}
}
var fsp = node_fs.promises;
function resolveAgentCliConnectorBin({ homeDir, platform }) {
	return platform === "win32" ? node_path.join(homeDir, ".workbuddy", "binaries", "node", "cli-connector-packages") : node_path.join(homeDir, ".workbuddy", "binaries", "node", "cli-connector-packages", "bin");
}
function resolveAgentCliPythonEnvBin({ homeDir, platform }) {
	const envDir = node_path.join(homeDir, ".workbuddy", "binaries", "python", "envs", "default");
	return platform === "win32" ? node_path.join(envDir, "Scripts") : node_path.join(envDir, "bin");
}
function resolveAgentCliExecutablePath({ bundledCliPaths = [], monorepoCliPath, envCliPath, exists = node_fs.existsSync }) {
	for (const bundledPath of bundledCliPaths) if (typeof bundledPath === "string" && bundledPath.trim()) return {
		path: bundledPath,
		source: "bundled"
	};
	if (typeof monorepoCliPath === "string" && monorepoCliPath.trim() && exists(monorepoCliPath)) return {
		path: monorepoCliPath,
		source: "monorepo"
	};
	const normalizedEnvPath = envCliPath?.trim();
	if (normalizedEnvPath && exists(normalizedEnvPath)) return {
		path: normalizedEnvPath,
		source: "env"
	};
}
function listAgentCliManagedBinDirs({ homeDir, platform, binaryType }) {
	const versionsDir = node_path.join(homeDir, ".workbuddy", "binaries", binaryType, "versions");
	try {
		const entries = node_fs.readdirSync(versionsDir);
		const validEntries = [];
		for (const entry of entries) {
			if (entry.includes(".installing.") || entry.includes(".__extract_temp__")) continue;
			const versionRoot = node_path.join(versionsDir, entry);
			try {
				if (!node_fs.statSync(versionRoot).isDirectory()) continue;
			} catch {
				continue;
			}
			validEntries.push(entry);
		}
		validEntries.sort(compareVersionsDesc);
		return validEntries.map((entry) => {
			const versionRoot = node_path.join(versionsDir, entry);
			return platform === "win32" ? versionRoot : node_path.join(versionRoot, "bin");
		});
	} catch {
		return [];
	}
}
async function listAgentCliManagedBinDirsAsync({ homeDir, platform, binaryType }) {
	const versionsDir = node_path.join(homeDir, ".workbuddy", "binaries", binaryType, "versions");
	try {
		const entries = await fsp.readdir(versionsDir);
		const validEntries = (await Promise.all(entries.map(async (entry) => {
			if (entry.includes(".installing.") || entry.includes(".__extract_temp__")) return;
			const versionRoot = node_path.join(versionsDir, entry);
			try {
				return (await fsp.stat(versionRoot)).isDirectory() ? entry : void 0;
			} catch {
				return;
			}
		}))).filter((entry) => !!entry);
		validEntries.sort(compareVersionsDesc);
		return validEntries.map((entry) => {
			const versionRoot = node_path.join(versionsDir, entry);
			return platform === "win32" ? versionRoot : node_path.join(versionRoot, "bin");
		});
	} catch {
		return [];
	}
}
function readManagedBundledRuntimeFromEnv() {
	for (const key of require_cli_product_env.AGENT_CLI_PRODUCT_CONFIG_ENV_KEYS) {
		const raw = process.env[key];
		if (!raw) continue;
		try {
			const sc = JSON.parse(raw)?.clientSecurity;
			const policy = require_common.translateRemoteSecurityCenter(sc);
			if (policy.managed && policy.bundledRuntime) return {
				enabled: policy.bundledRuntime.enabled,
				tools: { ...policy.bundledRuntime.tools }
			};
		} catch {}
	}
	const configFilePath = process.env[require_cli_product_env.AGENT_CLI_PRODUCT_CONFIG_PATH_ENV_KEY];
	if (configFilePath) try {
		const raw = node_fs.readFileSync(configFilePath, "utf8");
		const sc = JSON.parse(raw)?.clientSecurity;
		const policy = require_common.translateRemoteSecurityCenter(sc);
		if (policy.managed && policy.bundledRuntime) return {
			enabled: policy.bundledRuntime.enabled,
			tools: { ...policy.bundledRuntime.tools }
		};
	} catch {}
}
function readAgentCliBundledRuntimeConfig(userDataDir) {
	const managed = readManagedBundledRuntimeFromEnv();
	if (managed) return managed;
	try {
		const configPath = node_path.join(userDataDir, "app-config.json");
		const raw = node_fs.readFileSync(configPath, "utf8");
		const rt = JSON.parse(raw)?.bundledRuntime;
		if (rt && typeof rt === "object") return {
			enabled: rt.enabled !== false,
			tools: {
				node: rt.tools?.node !== false,
				python: rt.tools?.python !== false,
				gitBash: rt.tools?.gitBash !== false
			}
		};
	} catch {}
	return DEFAULT_AGENT_CLI_BUNDLED_RUNTIME_CONFIG;
}
async function readAgentCliBundledRuntimeConfigAsync(userDataDir) {
	const managed = readManagedBundledRuntimeFromEnv();
	if (managed) return managed;
	try {
		const configPath = node_path.join(userDataDir, "app-config.json");
		const raw = await fsp.readFile(configPath, "utf8");
		const rt = JSON.parse(raw)?.bundledRuntime;
		if (rt && typeof rt === "object") return {
			enabled: rt.enabled !== false,
			tools: {
				node: rt.tools?.node !== false,
				python: rt.tools?.python !== false,
				gitBash: rt.tools?.gitBash !== false
			}
		};
	} catch {}
	return DEFAULT_AGENT_CLI_BUNDLED_RUNTIME_CONFIG;
}
function readAgentCliAppConfigValue(key, { userDataDir }) {
	try {
		const configPath = node_path.join(userDataDir, "app-config.json");
		const raw = node_fs.readFileSync(configPath, "utf8");
		return JSON.parse(raw)?.[key] ?? null;
	} catch {
		return null;
	}
}
function resolveAgentCliRuntimeDirs(options) {
	const configDir = resolveAgentCliConfigDir(options);
	return {
		configDir,
		userDataDir: resolveAgentCliUserDataDir({
			...options,
			configDir
		})
	};
}
function resolveAgentCliConfigDir({ getConfigDir, homeDir, processEnv = process.env, defaultConfigDirname = ".workbuddy" }) {
	return resolveInjectedPath(getConfigDir) || processEnv.WORKBUDDY_CONFIG_DIR?.trim() || node_path.join(homeDir, defaultConfigDirname);
}
function resolveAgentCliUserDataDir({ getUserDataDir, processEnv = process.env, configDir }) {
	return resolveInjectedPath(getUserDataDir) || processEnv.WORKBUDDY_USER_DATA_DIR?.trim() || node_path.join(configDir, "app");
}
function listAgentCliEnabledPluginDirs(configDir) {
	try {
		const settingsPath = node_path.join(configDir, "settings.json");
		if (!node_fs.existsSync(settingsPath)) return [];
		const enabledPlugins = JSON.parse(node_fs.readFileSync(settingsPath, "utf-8")).enabledPlugins || {};
		const dirs = [];
		for (const [pluginId, enabled] of Object.entries(enabledPlugins)) {
			if (!enabled) continue;
			const atIdx = pluginId.indexOf("@");
			if (atIdx <= 0) continue;
			const pluginName = pluginId.substring(0, atIdx);
			const marketplace = pluginId.substring(atIdx + 1);
			const pluginDir = node_path.join(configDir, "plugins", "marketplaces", marketplace, "plugins", pluginName);
			if (node_fs.existsSync(pluginDir)) dirs.push(pluginDir);
		}
		return dirs;
	} catch {
		return [];
	}
}
async function listAgentCliEnabledPluginDirsAsync(configDir) {
	try {
		const settingsPath = node_path.join(configDir, "settings.json");
		const raw = await fsp.readFile(settingsPath, "utf-8");
		const enabledPlugins = JSON.parse(raw).enabledPlugins || {};
		return (await Promise.all(Object.entries(enabledPlugins).map(async ([pluginId, enabled]) => {
			if (!enabled) return;
			const atIdx = pluginId.indexOf("@");
			if (atIdx <= 0) return;
			const pluginName = pluginId.substring(0, atIdx);
			const marketplace = pluginId.substring(atIdx + 1);
			const pluginDir = node_path.join(configDir, "plugins", "marketplaces", marketplace, "plugins", pluginName);
			try {
				await fsp.access(pluginDir);
				return pluginDir;
			} catch {
				return;
			}
		}))).filter((dir) => !!dir);
	} catch {
		return [];
	}
}
function normalizeAgentCliBuiltinSkillsDir(resolvedPath) {
	if (resolvedPath.includes("app.asar") && !resolvedPath.includes("app.asar.unpacked")) return resolvedPath.replace("app.asar", "app.asar.unpacked");
	return resolvedPath;
}
function compareVersionsDesc(a, b) {
	const partsA = a.split(".").map(Number);
	const partsB = b.split(".").map(Number);
	const len = Math.max(partsA.length, partsB.length);
	for (let i = 0; i < len; i++) {
		const na = partsA[i] || 0;
		const nb = partsB[i] || 0;
		if (Number.isNaN(na) || Number.isNaN(nb)) return b.localeCompare(a);
		if (nb !== na) return nb - na;
	}
	return 0;
}
function resolveInjectedPath(resolvePath) {
	try {
		return resolvePath?.().trim() || void 0;
	} catch {
		return;
	}
}
var TAG$1 = "[SidecarManager]";
var HOST_RUNTIME_SESSION_ID = "__workbuddy_cli_host__";
var HOST_ENDPOINT_WAIT_TIMEOUT_MS = 3e4;
var HOST_ENDPOINT_PROBE_TIMEOUT_MS = 1e3;
var HOST_RUNTIME_INSTANCE_ID_ENV = "CODEBUDDY_RUNTIME_INSTANCE_ID";
var HOST_RUNTIME_HEALTH_PATH = "/api/v1/health";
var MAX_PING_RETRIES = 10;
var PING_RETRY_DELAY_MS = 300;
var STALE_PIPE_RECLAIM_TIMEOUT_MS = 2e3;
var STALE_PIPE_PROBE_INTERVAL_MS = 150;
var SIDECAR_STDERR_TAIL_LINES = 20;
var sidecarScopedLogger;
function resolveSidecarScopedLogger() {
	if (!sidecarScopedLogger) sidecarScopedLogger = require_logger.createWorkbuddyScopedLogger("sidecar-manager");
	return sidecarScopedLogger;
}
function formatSidecarLogArgs(args) {
	return args.map((arg) => {
		if (typeof arg === "string") return arg;
		if (arg instanceof Error) return arg.stack ?? arg.message;
		try {
			return JSON.stringify(arg);
		} catch {
			return String(arg);
		}
	}).join(" ");
}
var sidecarLog = {
	info: (...args) => resolveSidecarScopedLogger().info(formatSidecarLogArgs(args)),
	warn: (...args) => resolveSidecarScopedLogger().warn(formatSidecarLogArgs(args)),
	error: (...args) => resolveSidecarScopedLogger().error(formatSidecarLogArgs(args))
};
function isExpectedSidecarShutdownLine(line) {
	return line === "[Sidecar] Shutting down..." || /^\[Sidecar\] Killing session .+ \(pid=\d+\)$/.test(line);
}
function isHostedCliRuntimeSessionId(sessionId) {
	return sessionId === HOST_RUNTIME_SESSION_ID || Boolean(sessionId?.startsWith(`${HOST_RUNTIME_SESSION_ID}-`));
}
var USE_SYSTEM_CA_NODE_OPTION = "--use-system-ca";
var CODEBUDDY_QIMEI36_ENV_KEY = "CODEBUDDY_QIMEI36";
function buildSidecarProcessEnv(cliEnv, hostEnv = process.env, overrides = {}) {
	return {
		...hostEnv,
		...cliEnv.CODEBUDDY_CONFIG_DIR ? { CODEBUDDY_CONFIG_DIR: cliEnv.CODEBUDDY_CONFIG_DIR } : {},
		...cliEnv.WORKBUDDY_CONFIG_DIR ? { WORKBUDDY_CONFIG_DIR: cliEnv.WORKBUDDY_CONFIG_DIR } : {},
		...overrides,
		ELECTRON_RUN_AS_NODE: "1",
		NODE_OPTIONS: ""
	};
}
function defaultResolveBundledAsset() {}
function defaultGetBootstrapProductConfigEnv() {
	return "{}";
}
function resolveWorkbuddySidecarBundledAsset(...segments) {
	const appPath = require_runtime_context.getWorkbuddyRuntimeAppPath();
	const resourcesPath = process.env.WORKBUDDY_RESOURCES_PATH?.trim() || (path.basename(appPath) === "app.asar" ? path.dirname(appPath) : void 0);
	const candidates = [
		resourcesPath ? path.join(resourcesPath, "app.asar.unpacked", "resources", ...segments) : void 0,
		resourcesPath ? path.join(resourcesPath, "app.asar.unpacked", ...segments) : void 0,
		path.join(appPath, ...segments),
		path.join(appPath, "resources", ...segments),
		path.join(appPath, "..", "resources", ...segments),
		path.join(appPath, "..", "..", ...segments),
		path.join(appPath, "..", "..", "resources", ...segments),
		resourcesPath ? path.join(resourcesPath, ...segments) : void 0,
		resourcesPath ? path.join(resourcesPath, "resources", ...segments) : void 0
	];
	for (const candidate of candidates) if (candidate && fs.existsSync(candidate)) return candidate;
}
function withWorkbuddySidecarDefaults(dependencies = {}) {
	return {
		getRuntimeAppPath: require_runtime_context.getWorkbuddyRuntimeAppPath,
		getRuntimeAppVersion: require_runtime_context.getWorkbuddyRuntimeAppVersion,
		getRuntimeConfigDir: require_runtime_context.getWorkbuddyRuntimeConfigDir,
		getRuntimeUserDataDir: require_runtime_context.getWorkbuddyRuntimeUserDataDir,
		resolveBundledAsset: resolveWorkbuddySidecarBundledAsset,
		getBootstrapProductConfigEnv: defaultGetBootstrapProductConfigEnv,
		hostId: "workbuddy-desktop",
		...dependencies
	};
}
function getHostedCliCwd(sessionId) {
	return path.join((0, os.tmpdir)(), "workbuddy-host-cli", sessionId);
}
function getProxyEnvFromProcess() {
	const httpProxy = process.env.HTTP_PROXY || process.env.http_proxy;
	const httpsProxy = process.env.HTTPS_PROXY || process.env.https_proxy;
	const env = {};
	if (httpProxy) env.HTTP_PROXY = httpProxy;
	if (httpsProxy) env.HTTPS_PROXY = httpsProxy;
	if (httpProxy || httpsProxy) {
		env.NO_PROXY = require_proxy_env.mergeNoProxy(process.env.NO_PROXY || process.env.no_proxy);
		env.NODE_OPTIONS = USE_SYSTEM_CA_NODE_OPTION;
	}
	return env;
}
async function defaultResolveProxyEnv() {
	return getProxyEnvFromProcess();
}
var HostRuntimeStartSupersededError = class extends Error {
	constructor() {
		super("Hosted CLI runtime start was superseded by a newer generation");
		this.name = "HostRuntimeStartSupersededError";
	}
};
var HostRuntimeIdentityMismatchError = class extends Error {
	constructor(endpoint, reason) {
		super(`Hosted CLI runtime identity mismatch at ${endpoint}: ${reason}`);
		this.name = "HostRuntimeIdentityMismatchError";
	}
};
var sidecarCrashWatcher;
function bindSidecarCrashWatcher(fn) {
	sidecarCrashWatcher = fn;
}
var SidecarManager = class {
	constructor(dependencies = {}) {
		this.dependencies = dependencies;
	}
	client = null;
	prewarmPool = null;
	startPromise = null;
	hostEndpoint = null;
	hostSessionId = null;
	hostRuntimeInstanceId = null;
	hostRuntimePid = null;
	hostEndpointGeneration = null;
	hostStartPromise = null;
	hostResetPromise = null;
	hostRotationQueue = Promise.resolve();
	hostRuntimeGeneration = 0;
	hostRuntimeCandidateSessionIds = /* @__PURE__ */ new Set();
	hostRuntimeStartControllers = /* @__PURE__ */ new Set();
	disposed = false;
	/** 上次通知监听者的 host endpoint，用于判定端点是否真正变化（轮转/崩溃恢复），不受中途置 null 影响 */
	lastNotifiedHostEndpoint = null;
	hostEndpointChangedListeners = /* @__PURE__ */ new Set();
	async onStart() {}
	async onStop() {
		this.disposed = true;
		await this.shutdown();
	}
	/**
	* Pre-warm the sidecar process so that the first `createSession()` call
	* does not pay the full spawn + ping-retry cost.
	*
	* Safe to call multiple times — deduplicates via `ensureStarted()`.
	* Failures are non-fatal; callers should `.catch()` and log.
	*/
	async warmup() {
		await this.getHostEndpoint();
	}
	/**
	* Create a session in the sidecar (starts sidecar on first call).
	*/
	async createSession(params) {
		sidecarLog.info(`createSession: sessionId=${params.sessionId}, port=${params.port}, cwd=${params.cwd}`);
		await this.ensureStarted();
		const client = this.getClientOrThrow("create session");
		if (params.sessionId) {
			const matched = (await client.listSessions()).find((session) => session.sessionId === params.sessionId);
			if (matched) {
				const matchedEndpoint = extractHttpEndpoint(matched.acpEndpoint);
				if (matchedEndpoint && !await isEndpointReachable(matchedEndpoint)) {
					sidecarLog.info(`createSession: stale session ${params.sessionId} endpoint ${matchedEndpoint} not reachable, killing and creating fresh`);
					await client.killSession(params.sessionId).catch(() => {});
				} else {
					sidecarLog.info(`createSession: reconnecting existing session ${params.sessionId}, acpEndpoint=${matched.acpEndpoint}`);
					return client.reconnectSession(params.sessionId, params.cols, params.rows);
				}
			}
		}
		const handle = await client.createSession(params);
		sidecarLog.info(`createSession: created, sessionId=${params.sessionId}, acpEndpoint=${handle.acpEndpoint}, pid=${handle.pid ?? "unknown"}`);
		return handle;
	}
	/**
	* Kill a session in the sidecar.
	*/
	async killSession(sessionId) {
		if (!this.client || !this.client.isConnected) return;
		return this.client.killSession(sessionId);
	}
	async resizeSession(sessionId, cols, rows) {
		if (!this.client || !this.client.isConnected) return;
		return this.client.resizeSession(sessionId, cols, rows);
	}
	async listSessions() {
		await this.ensureStarted();
		return this.getClientOrThrow("list sessions").listSessions();
	}
	async getHostEndpoint() {
		if (this.disposed) throw new Error(`${TAG$1} Manager is disposed`);
		while (true) {
			if (this.hostResetPromise) {
				await this.hostResetPromise;
				continue;
			}
			const cachedEndpoint = this.hostEndpoint;
			const cachedSessionId = this.hostSessionId;
			const cachedRuntimeInstanceId = this.hostRuntimeInstanceId;
			const cachedRuntimePid = this.hostRuntimePid;
			const cachedGeneration = this.hostEndpointGeneration;
			if (cachedEndpoint && cachedRuntimeInstanceId) {
				const reachable = await isHostRuntimeEndpointReachable(cachedEndpoint, cachedRuntimeInstanceId, cachedRuntimePid ?? void 0);
				if (this.hostEndpoint !== cachedEndpoint || this.hostSessionId !== cachedSessionId || this.hostRuntimeInstanceId !== cachedRuntimeInstanceId || this.hostRuntimePid !== cachedRuntimePid || this.hostEndpointGeneration !== cachedGeneration) continue;
				if (reachable) return cachedEndpoint;
			}
			if (this.hostStartPromise) try {
				return (await this.hostStartPromise).endpoint;
			} catch (error) {
				if (error instanceof HostRuntimeStartSupersededError) continue;
				throw error;
			}
			if (this.hostEndpoint && this.hostEndpointGeneration !== this.hostRuntimeGeneration) {
				await this.hostRotationQueue;
				continue;
			}
			this.hostEndpoint = null;
			this.hostSessionId = null;
			this.hostRuntimeInstanceId = null;
			this.hostRuntimePid = null;
			this.hostEndpointGeneration = null;
			if (!this.hostStartPromise) {
				const generation = this.hostRuntimeGeneration;
				this.hostStartPromise = this.startHostRuntime(generation);
			}
			try {
				return (await this.hostStartPromise).endpoint;
			} catch (error) {
				if (error instanceof HostRuntimeStartSupersededError) continue;
				throw error;
			}
		}
	}
	/**
	* 订阅 host runtime 端点变化（轮转 / 崩溃恢复后端口变更）。
	* 用于让依赖该端点的下游（如 ConnectorMcpProxy 注入的 CODEBUDDY_SERVICE_PROXY_URL）刷新。
	* 仅在端点从一个已通知值变为不同值时触发，首次 provision 不触发。返回取消订阅函数。
	*/
	/**
	* 注入 prewarm 池引用（可选，装配层在池创建成功后调用）。
	*
	* prewarm 命中的会话绕过了 sidecar 会话表（自持 ACP 端点，不经过
	* `createSession` RPC），`listSessions()` 看不到它们；注入后
	* `getAllActiveEndpoints()` 会把池的活跃 endpoint 一并合并进来。
	*/
	setPrewarmPool(pool) {
		this.prewarmPool = pool;
	}
	/**
	* 返回所有活跃 sidecar session 的 HTTP endpoint 列表。
	*
	* 用于需要广播到所有会话 sidecar 的场景（如安全中心规则实时同步）。
	* 每个 session 的 acpEndpoint 去掉 /api/v1/acp 后缀得到 HTTP base URL。
	* 若 listSessions 失败（sidecar 未启动等），静默返回空数组。
	*
	* 合并了 prewarm 池已 activate 的会话 endpoint（见 setPrewarmPool 注释）——
	* 否则走池命中路径建立的会话永远不会收到广播。
	*/
	async getAllActiveEndpoints() {
		let sidecarEndpoints = [];
		try {
			sidecarEndpoints = (await this.listSessions()).map((s) => s.acpEndpoint).filter((ep) => typeof ep === "string" && ep.length > 0).map((ep) => extractHttpEndpoint(ep));
		} catch (error) {
			console.warn(TAG$1, "getAllActiveEndpoints: listSessions failed, falling back to empty:", error);
			sidecarEndpoints = [];
		}
		const prewarmEndpoints = this.prewarmPool?.getActiveEndpoints() ?? [];
		return Array.from(new Set([...sidecarEndpoints, ...prewarmEndpoints]));
	}
	/**
	* 按 sessionId 解析该会话的 ACP HTTP base（去掉 /api/v1/acp 后缀）。
	*
	* 查询顺序：
	* 1. 先从 `listSessions()`（普通 sidecar 会话表）查；
	* 2. 查不到时回退到 prewarm 池的 `getActiveEndpointForSession()`——prewarm
	*    命中的会话绕过 sidecar 会话表（自持 ACP 端点，不经 createSession RPC），
	*    不会出现在 `listSessions()` 里。
	*
	* issue #62459：`ExpertPluginService.switchExpertPluginForSession()` 依赖此
	* 方法拿到 ACP endpoint 去调 /api/v1/plugins/switch 注入专家身份。此前只查
	* `listSessions()`，prewarm 会话查不到 → 返回空 → 专家 plugin switch degrade，
	* 专家 plugin、子 agent 与工具的 session 级激活失效。
	*
	* 找不到（两处都没有）或 listSessions 抛错时，仍会尝试 prewarm 池兜底；
	* 都拿不到则返回 undefined。
	*/
	async resolveSessionHttpBase(sessionId) {
		if (!sessionId) return;
		try {
			const acpEndpoint = (await this.listSessions()).find((entry) => entry.sessionId === sessionId)?.acpEndpoint;
			if (typeof acpEndpoint === "string" && acpEndpoint) return extractHttpEndpoint(acpEndpoint);
		} catch (error) {
			sidecarLog.warn(`${TAG$1} resolveSessionHttpBase: listSessions failed, falling back to prewarm pool: ${error instanceof Error ? error.message : String(error)}`);
		}
		return this.prewarmPool?.getActiveEndpointForSession?.(sessionId);
	}
	onHostEndpointChanged(listener) {
		this.hostEndpointChangedListeners.add(listener);
		return () => {
			this.hostEndpointChangedListeners.delete(listener);
		};
	}
	emitHostEndpointChanged(endpoint) {
		for (const listener of this.hostEndpointChangedListeners) try {
			listener(endpoint);
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			sidecarLog.warn(`${TAG$1} hostEndpointChanged listener error: ${message}`);
		}
	}
	async rotateHostRuntime(reason = "product-config-change") {
		if (this.disposed) throw new Error(`${TAG$1} Manager is disposed`);
		if (this.hostResetPromise) await this.hostResetPromise;
		if (!this.hostEndpoint && !this.hostStartPromise) {
			sidecarLog.info(`${TAG$1} rotateHostRuntime skipped: no active hosted CLI runtime (generation=${this.hostRuntimeGeneration}, reason=${reason})`);
			return;
		}
		const generation = ++this.hostRuntimeGeneration;
		this.abortPendingHostRuntimeStarts();
		sidecarLog.info(`${TAG$1} rotateHostRuntime requested: generation=${generation}, reason=${reason}`);
		this.hostRotationQueue = this.hostRotationQueue.catch((error) => {
			sidecarLog.warn(`${TAG$1} Previous hosted CLI runtime rotation failed: ${error instanceof Error ? error.message : String(error)}`);
		}).then(() => this.doRotateHostRuntime(generation, reason));
		return this.hostRotationQueue;
	}
	resetHostRuntime() {
		if (this.hostResetPromise) return this.hostResetPromise;
		const trackedResetPromise = this.doResetHostRuntime().finally(() => {
			if (this.hostResetPromise === trackedResetPromise) this.hostResetPromise = null;
		});
		this.hostResetPromise = trackedResetPromise;
		return trackedResetPromise;
	}
	async doResetHostRuntime() {
		const activeSessionId = this.hostSessionId;
		const clientAtReset = this.client;
		const pendingHostStart = this.hostStartPromise;
		const pendingRotation = this.hostRotationQueue;
		const hadRuntimeState = Boolean(this.hostEndpoint || this.hostSessionId || this.hostStartPromise);
		if (hadRuntimeState) this.hostRuntimeGeneration += 1;
		this.abortPendingHostRuntimeStarts();
		sidecarLog.info(`${TAG$1} resetHostRuntime requested: generation=${this.hostRuntimeGeneration}, activeSession=${activeSessionId ?? "none"}, action=${hadRuntimeState ? "invalidate" : "noop"}`);
		this.hostEndpoint = null;
		this.hostSessionId = null;
		this.hostRuntimeInstanceId = null;
		this.hostRuntimePid = null;
		this.hostEndpointGeneration = null;
		this.hostStartPromise = null;
		await Promise.allSettled([...pendingHostStart ? [pendingHostStart] : [], pendingRotation]);
		if (!clientAtReset || !clientAtReset.isConnected) return;
		await this.cleanupHostedCliRuntimeSessions("reset-host-runtime", void 0, [activeSessionId]);
		if (this.client !== clientAtReset) return;
		try {
			clientAtReset.dispose();
		} catch {}
		if (this.client === clientAtReset) this.client = null;
		this.startPromise = null;
	}
	async captureSession(sessionId, lines) {
		await this.ensureStarted();
		return this.getClientOrThrow("capture session").captureSession(sessionId, lines);
	}
	attachDataSocket(sessionId) {
		if (!this.client || !this.client.isConnected) throw new Error(`${TAG$1} Sidecar not started`);
		return this.client.attachDataSocket(sessionId);
	}
	/**
	* Gracefully shut down the sidecar process and disconnect.
	*/
	async shutdown() {
		this.hostRuntimeGeneration += 1;
		this.abortPendingHostRuntimeStarts();
		this.hostEndpoint = null;
		this.hostSessionId = null;
		this.hostRuntimeInstanceId = null;
		this.hostRuntimePid = null;
		this.hostEndpointGeneration = null;
		this.hostStartPromise = null;
		this.startPromise = null;
		if (!this.client) return;
		try {
			if (this.client.isConnected) await this.client.shutdown();
		} catch (err) {
			console.warn(TAG$1, "Shutdown RPC failed (sidecar may already be gone):", err);
		} finally {
			this.client.dispose();
			this.client = null;
		}
	}
	/**
	* Ensure a sidecar process is running and we have a connected client.
	*
	* Strategy:
	* 1. Read PID file — if exists, try to ping the existing sidecar.
	* 2. If ping succeeds, reuse the existing sidecar.
	* 3. Otherwise, spawn a new sidecar and wait for it to become ready.
	*/
	async ensureSidecar() {
		sidecarLog.info(`${TAG$1} ensureSidecar: starting`);
		await this.cleanupLegacySidecarArtifacts();
		const existing = this.readPidFile();
		if (existing) {
			sidecarLog.info(`${TAG$1} ensureSidecar: found PID file (pid=${existing.pid}, version=${existing.version})`);
			let client;
			try {
				client = new SidecarClient();
				await client.connect();
				const ping = await client.ping();
				if (ping.version !== 3) {
					sidecarLog.info(`${TAG$1} ensureSidecar: protocol version changed (running=${ping.version}, expected=3); restarting sidecar`);
					const closed = await client.shutdown();
					client.dispose();
					client = void 0;
					if (!closed || !await waitForControlPathFree(require_cli_process_env.controlSocketPath(), STALE_PIPE_RECLAIM_TIMEOUT_MS)) throw new Error(`${TAG$1} Incompatible sidecar v${ping.version} did not release its control socket`);
					try {
						fs.unlinkSync(require_cli_process_env.pidFilePath());
					} catch {}
					await this.spawnSidecar();
					return;
				}
				sidecarLog.info(`${TAG$1} ensureSidecar: reconnected to existing sidecar (pid=${ping.pid}, uptime=${ping.uptime}ms, version=${ping.version})`);
				console.info(TAG$1, `Reconnected to existing sidecar (pid=${ping.pid}, uptime=${ping.uptime}ms)`);
				this.adoptClient(client);
				return;
			} catch (err) {
				client?.dispose();
				sidecarLog.info(`${TAG$1} ensureSidecar: stale PID file, existing sidecar not reachable (error=${err instanceof Error ? err.message : String(err)}), attempting recovery`);
				console.info(TAG$1, "Stale PID file — existing sidecar not reachable, attempting recovery");
				if (!await this.cleanupStaleFiles(existing.pid)) throw new Error(`${TAG$1} Control socket/pipe is still occupied after attempting to terminate the stale sidecar (pid=${existing.pid}). On Windows this usually means another process is holding the named pipe, or the kernel has not yet released the pipe name. Please check for leftover codebuddy/electron processes in Task Manager and terminate them, or reboot the machine.`);
			}
		} else sidecarLog.info(`${TAG$1} ensureSidecar: no PID file found, spawning new sidecar`);
		await this.spawnSidecar();
	}
	/**
	* Spawn a new sidecar process.
	*
	* The sidecar entry point is the bundled desktop-local sidecar entry.
	* We run it under the Electron binary with ELECTRON_RUN_AS_NODE=1 so it
	* executes as a plain Node.js process.
	*/
	async spawnSidecar() {
		if (this.disposed) throw new Error(`${TAG$1} Manager is disposed`);
		const token = (0, crypto.randomUUID)();
		const entryPath = this.resolveSidecarEntry();
		const execPath = this.dependencies.processExecPath ?? process.execPath;
		const args = [
			...this.dependencies.processExecArgv ?? [],
			entryPath,
			"--token",
			token
		];
		console.info(TAG$1, `Spawning sidecar: ${execPath} ${args.join(" ")}`);
		sidecarLog.info(`${TAG$1} Spawning sidecar: execPath=${execPath}, args=${JSON.stringify(args)}, entryPath=${entryPath}`);
		const cliEnv = await buildCliEnvAsync({ ELECTRON_RUN_AS_NODE: "1" }, await this.resolveProxyEnv(), this.dependencies);
		await new Promise((resolve) => setImmediate(resolve));
		const child = (0, child_process.spawn)(execPath, args, {
			detached: true,
			stdio: [
				"ignore",
				"ignore",
				"pipe"
			],
			windowsHide: true,
			env: buildSidecarProcessEnv(cliEnv, process.env, this.dependencies.env ?? {})
		});
		sidecarCrashWatcher?.(child);
		const stderrTail = [];
		child.stderr?.on("data", (data) => {
			const text = data.toString().trim();
			if (!text) return;
			const lines = text.split(/\r?\n/).filter(Boolean);
			if (!this.disposed || !lines.every(isExpectedSidecarShutdownLine)) sidecarLog.warn(`[sidecar-stderr] ${text}`);
			for (const line of lines) {
				if (!line) continue;
				stderrTail.push(line);
				if (stderrTail.length > SIDECAR_STDERR_TAIL_LINES) stderrTail.shift();
			}
		});
		child.unref();
		const cliHealthCollector = this.dependencies.getCliHealthCollector?.();
		const spawnTime = Date.now();
		let earlyExit = null;
		const earlyExitPromise = new Promise((_, reject) => {
			child.once("exit", (code, signal) => {
				earlyExit = {
					code,
					signal
				};
				sidecarLog.warn(`Sidecar process exited: pid=${pid}, code=${code}, signal=${signal}, uptime=${Date.now() - spawnTime}ms`);
				if (code !== 0 && code !== null) cliHealthCollector?.recordCliCrash(code, signal);
				const tail = stderrTail.length ? `\nSidecar stderr tail:\n${stderrTail.join("\n")}` : "";
				reject(/* @__PURE__ */ new Error(`${TAG$1} Sidecar exited during startup (pid=${pid}, code=${code}, signal=${signal}).${tail}`));
			});
		});
		earlyExitPromise.catch(() => {});
		const pid = child.pid;
		if (pid == null) throw new Error(`${TAG$1} Failed to spawn sidecar — no PID returned`);
		await this.writePidFile({
			pid,
			token,
			version: 3
		});
		try {
			await Promise.race([this.waitForReady(), earlyExitPromise]);
		} catch (err) {
			if (!earlyExit) cliHealthCollector?.recordCliCrash(null, "STARTUP_FAILED");
			const baseMessage = err instanceof Error ? err.message : String(err);
			const tail = !earlyExit && stderrTail.length ? `\nSidecar stderr tail:\n${stderrTail.join("\n")}` : "";
			throw new Error(`${baseMessage}${tail}`);
		}
		console.info(TAG$1, `Sidecar spawned (pid=${pid})`);
		cliHealthCollector?.recordCliStart(Date.now() - spawnTime);
	}
	/**
	* Poll the sidecar control socket until it responds to ping.
	*/
	async waitForReady() {
		sidecarLog.info(`${TAG$1} waitForReady: polling sidecar control socket (max ${MAX_PING_RETRIES} retries, ${PING_RETRY_DELAY_MS}ms delay)`);
		for (let i = 0; i < MAX_PING_RETRIES; i++) {
			let client;
			try {
				client = new SidecarClient();
				await client.connect();
				await client.ping();
				sidecarLog.info(`${TAG$1} waitForReady: sidecar ready after ${i + 1} attempt(s)`);
				this.adoptClient(client);
				return;
			} catch (err) {
				client?.dispose();
				if (i === MAX_PING_RETRIES - 1) sidecarLog.error(`${TAG$1} waitForReady: giving up after ${MAX_PING_RETRIES} retries (lastError=${err instanceof Error ? err.message : String(err)})`);
				await this.delay(PING_RETRY_DELAY_MS);
			}
		}
		throw new Error(`${TAG$1} Sidecar did not become ready after ${MAX_PING_RETRIES} retries`);
	}
	/**
	* Install a freshly-connected client and wire up the socket-close
	* callback. When the IPC socket dies unexpectedly (e.g. sidecar crashed
	* or a transient disconnect), the client becomes a shell with
	* `isConnected === false`; we clear `this.client` so the next
	* `ensureStarted()` re-spawns or reconnects instead of short-circuiting
	* on a stale reference and throwing "Not connected".
	*/
	adoptClient(client) {
		this.client = client;
		client.onClose(() => {
			if (this.client === client) {
				console.warn(TAG$1, "Sidecar client socket closed; clearing stale reference");
				this.client = null;
				this.hostEndpoint = null;
				this.hostSessionId = null;
				this.hostRuntimeInstanceId = null;
				this.hostRuntimePid = null;
				this.hostEndpointGeneration = null;
				this.hostStartPromise = null;
				this.hostRuntimeGeneration += 1;
				this.abortPendingHostRuntimeStarts();
				sidecarLog.warn(`${TAG$1} Sidecar client socket closed; host runtime invalidated, generation=${this.hostRuntimeGeneration}`);
			}
		});
	}
	/**
	* Resolve the sidecar entry.js path.
	*
	* In development the entry lives in the monorepo source tree.
	* In production it will be bundled alongside the Electron app.
	*/
	resolveSidecarEntry() {
		if (this.dependencies.resolveSidecarEntry) return this.dependencies.resolveSidecarEntry();
		return path.resolve(__dirname, "./sidecar-entry.js");
	}
	readPidFile() {
		const filePath = require_cli_process_env.pidFilePath();
		try {
			const raw = fs.readFileSync(filePath, "utf-8");
			return JSON.parse(raw);
		} catch {
			return null;
		}
	}
	async writePidFile(data) {
		const filePath = require_cli_process_env.pidFilePath();
		const dir = path.dirname(filePath);
		await fs.promises.mkdir(dir, {
			recursive: true,
			mode: 448
		});
		await fs.promises.chmod(dir, 448).catch(() => void 0);
		await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
	}
	/**
	* Recover from a stale pid file when the previous sidecar is unreachable.
	*
	* On Windows this is non-trivial: the control named pipe may still be
	* held by either the old sidecar process itself (crashed but not fully
	* reaped) or by the kernel short-listing the pipe name after all handles
	* closed. Naively respawning will race `EADDRINUSE` on the new sidecar's
	* `listen()`, which then exits code 1 and the main process burns through
	* 10×300ms of ping retries with no diagnostic.
	*
	* Steps:
	*   1. If `stalePid` is still alive, SIGTERM it (TerminateProcess on Win).
	*   2. Remove the pid file eagerly so a concurrent retry doesn't re-read
	*      the same PID.
	*   3. Poll the control socket/pipe path until it is free to listen on,
	*      or the timeout expires.
	*
	* Returns `true` when the control path is reclaimed and spawning is safe,
	* `false` when it is still occupied (caller should surface a specific
	* error instead of spawning a doomed child).
	*/
	async cleanupStaleFiles(stalePid) {
		console.info(TAG$1, `Clearing stale sidecar pid file for unreachable process ${stalePid}`);
		let processAlive = false;
		try {
			process.kill(stalePid, 0);
			processAlive = true;
		} catch {}
		if (processAlive) {
			sidecarLog.warn(`${TAG$1} Stale sidecar pid=${stalePid} still alive, sending SIGTERM`);
			try {
				process.kill(stalePid, "SIGTERM");
			} catch (err) {
				sidecarLog.warn(`${TAG$1} Failed to terminate stale sidecar pid=${stalePid}: ${err.message}`);
			}
		}
		try {
			fs.unlinkSync(require_cli_process_env.pidFilePath());
		} catch {}
		const sockPath = require_cli_process_env.controlSocketPath();
		const free = await waitForControlPathFree(sockPath, STALE_PIPE_RECLAIM_TIMEOUT_MS);
		if (!free) sidecarLog.error(`${TAG$1} Control path ${sockPath} still occupied after ${STALE_PIPE_RECLAIM_TIMEOUT_MS}ms; refusing to spawn`);
		return free;
	}
	/**
	* Shut down any pre-migration sidecar and remove its leftover files under
	* `~/.workbuddy`. Idempotent.
	*
	* Shutdown RPC target differs by platform:
	*   POSIX   — the legacy control socket path.
	*   Windows — no RPC shutdown. Named pipes are still stable across the
	*             migration, so we only clean obsolete filesystem remnants and
	*             leave any live sidecar/session state untouched.
	*/
	async cleanupLegacySidecarArtifacts() {
		const legacyDir = require_cli_process_env.workbuddyConfigDir();
		const legacyControlSock = path.join(legacyDir, "sidecar.sock");
		const legacyPidFile = path.join(legacyDir, "sidecar.pid");
		const legacySessionsDir = path.join(legacyDir, "sessions");
		if (!require_cli_process_env.isNamedPipe() && legacyControlSock === require_cli_process_env.controlSocketPath()) return;
		const [hasLegacyPidFile, hasLegacyControlSock, hasLegacySessionsDir] = await Promise.all([
			pathExists(legacyPidFile),
			pathExists(legacyControlSock),
			pathExists(legacySessionsDir)
		]);
		if (!(hasLegacyPidFile || hasLegacyControlSock || hasLegacySessionsDir)) return;
		const shutdownTarget = legacyControlSock;
		const shouldTryRpc = !require_cli_process_env.isNamedPipe() && hasLegacyControlSock;
		let rpcSent = false;
		let sidecarExited = false;
		if (shouldTryRpc) {
			let client;
			try {
				client = new SidecarClient(shutdownTarget);
				await client.connect();
				sidecarExited = await client.shutdown();
				rpcSent = true;
			} catch (err) {
				const code = err?.code;
				if (code !== "ENOENT" && code !== "ECONNREFUSED") console.warn(TAG$1, `Legacy sidecar at ${shutdownTarget} not reachable:`, err);
			} finally {
				client?.dispose();
			}
		}
		if (rpcSent && !sidecarExited) {
			console.warn(TAG$1, `Legacy sidecar at ${shutdownTarget} did not exit within ${require_cli_process_env.SIDECAR_GRACEFUL_EXIT_TIMEOUT_MS}ms; leaving files for next launch`);
			return;
		}
		await Promise.all([unlinkFileSafeAsync(legacyControlSock), unlinkFileSafeAsync(legacyPidFile)]);
		try {
			for (const entry of await fs.promises.readdir(legacySessionsDir)) if (entry.endsWith(".sock")) await unlinkFileSafeAsync(path.join(legacySessionsDir, entry));
			await fs.promises.rmdir(legacySessionsDir);
		} catch {}
	}
	ensureStarted() {
		if (this.disposed) return Promise.reject(/* @__PURE__ */ new Error(`${TAG$1} Manager is disposed`));
		if (this.hostResetPromise) return this.hostResetPromise.then(() => this.ensureStarted());
		if (this.client && this.client.isConnected) return Promise.resolve();
		if (this.client && !this.client.isConnected) {
			console.warn(TAG$1, "Discarding stale sidecar client (socket closed) before re-initialization");
			try {
				this.client.dispose();
			} catch {}
			this.client = null;
			this.hostEndpoint = null;
			this.hostSessionId = null;
			this.hostRuntimeInstanceId = null;
			this.hostRuntimePid = null;
			this.hostEndpointGeneration = null;
			this.hostStartPromise = null;
			this.hostRuntimeGeneration += 1;
			this.abortPendingHostRuntimeStarts();
			sidecarLog.warn(`${TAG$1} Discarding stale sidecar client; host runtime invalidated, generation=${this.hostRuntimeGeneration}`);
		}
		if (!this.startPromise) {
			const trackedPromise = this.ensureSidecar().finally(() => {
				if (this.startPromise === trackedPromise) this.startPromise = null;
			});
			this.startPromise = trackedPromise;
		}
		return this.startPromise;
	}
	getClientOrThrow(action) {
		if (!this.client) throw new Error(`${TAG$1} Sidecar client unavailable while attempting to ${action}`);
		return this.client;
	}
	resolveProxyEnv() {
		return this.dependencies.resolveProxyEnv?.() ?? defaultResolveProxyEnv();
	}
	delay(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
	startHostRuntime(generation = this.hostRuntimeGeneration) {
		const trackedStartPromise = this.ensureHostEndpoint(generation).finally(() => {
			if (this.hostStartPromise === trackedStartPromise) this.hostStartPromise = null;
		});
		return trackedStartPromise;
	}
	abortPendingHostRuntimeStarts() {
		for (const controller of this.hostRuntimeStartControllers) controller.abort();
	}
	async cleanupHostedCliRuntimeSessions(reason, keepSessionId, knownSessionIds = []) {
		const isProtectedSession = (sessionId) => sessionId === keepSessionId || sessionId === this.hostSessionId || this.hostRuntimeCandidateSessionIds.has(sessionId);
		const sessionIdsToKill = /* @__PURE__ */ new Set();
		const addSessionId = (sessionId) => {
			if (isHostedCliRuntimeSessionId(sessionId) && !isProtectedSession(sessionId)) sessionIdsToKill.add(sessionId);
		};
		for (const sessionId of knownSessionIds) addSessionId(sessionId);
		if (this.client?.isConnected) try {
			const sessions = await this.client.listSessions();
			for (const session of sessions) addSessionId(session.sessionId);
		} catch (error) {
			sidecarLog.warn(`${TAG$1} Failed to list hosted CLI runtime sessions for cleanup (reason=${reason}): ${error instanceof Error ? error.message : String(error)}`);
		}
		if (!sessionIdsToKill.size) return;
		const sessionIds = [...sessionIdsToKill];
		sidecarLog.info(`${TAG$1} cleanupHostedCliRuntimeSessions: reason=${reason}, keep=${keepSessionId ?? "none"}, sessions=${sessionIds.join(",")}`);
		await Promise.all(sessionIds.map(async (sessionId) => {
			if (isProtectedSession(sessionId)) return;
			try {
				await this.killSession(sessionId);
			} catch (error) {
				sidecarLog.warn(`${TAG$1} Failed to stop stale hosted CLI runtime session ${sessionId} (reason=${reason}): ${error instanceof Error ? error.message : String(error)}`);
			}
		}));
	}
	async doRotateHostRuntime(generation, reason) {
		if (generation !== this.hostRuntimeGeneration) {
			sidecarLog.info(`${TAG$1} Skipping stale hosted CLI runtime rotation: generation=${generation}, current=${this.hostRuntimeGeneration}`);
			return;
		}
		const previousEndpoint = this.hostEndpoint;
		const previousSessionId = this.hostSessionId;
		const previousRuntimeInstanceId = this.hostRuntimeInstanceId;
		const previousRuntimePid = this.hostRuntimePid;
		if (!previousEndpoint && !this.hostStartPromise) {
			sidecarLog.info(`${TAG$1} No active hosted CLI runtime to rotate; next start will use latest env (generation=${generation}, reason=${reason})`);
			return;
		}
		if (!previousEndpoint) {
			sidecarLog.info(`${TAG$1} Hosted CLI runtime is already starting; generation bump will force latest env (generation=${generation}, reason=${reason})`);
			return;
		}
		const previousReachable = previousRuntimeInstanceId ? await isHostRuntimeEndpointReachable(previousEndpoint, previousRuntimeInstanceId, previousRuntimePid ?? void 0) : false;
		if (generation !== this.hostRuntimeGeneration) return;
		if (this.hostEndpoint !== previousEndpoint || this.hostSessionId !== previousSessionId || this.hostRuntimeInstanceId !== previousRuntimeInstanceId || this.hostRuntimePid !== previousRuntimePid) {
			sidecarLog.info(`${TAG$1} Active hosted CLI runtime changed while rotation probe was in flight; skipping stale result`);
			return;
		}
		if (!previousReachable) {
			sidecarLog.info(`${TAG$1} Active hosted CLI runtime is not reachable; next start will use latest env (generation=${generation}, reason=${reason})`);
			this.hostEndpoint = null;
			this.hostSessionId = null;
			this.hostRuntimeInstanceId = null;
			this.hostRuntimePid = null;
			this.hostEndpointGeneration = null;
			return;
		}
		let nextRuntime;
		try {
			nextRuntime = await this.ensureHostEndpoint(generation);
		} catch (error) {
			if (error instanceof HostRuntimeStartSupersededError) return;
			throw error;
		}
		sidecarLog.info(`${TAG$1} Hosted CLI runtime rotated: old=${previousSessionId ?? "none"}, new=${nextRuntime.sessionId}, reason=${reason}`);
	}
	async ensureHostEndpoint(generation = this.hostRuntimeGeneration) {
		if (this.disposed) throw new Error(`${TAG$1} Manager is disposed`);
		const startedAt = Date.now();
		const mcpConfig = this.dependencies.getMcpConfig?.();
		const proxyEnv = await this.resolveProxyEnv();
		const agentExtraEnv = await (this.dependencies.getAgentExtraEnv?.() ?? {});
		const qimei36 = (await this.dependencies.getQimei36?.())?.trim();
		const qimeiEnv = qimei36 ? { [CODEBUDDY_QIMEI36_ENV_KEY]: qimei36 } : {};
		const cliEnvRouteMode = this.dependencies.resolveCliEnvRouteMode?.();
		const baseCliEnv = await buildCliEnvAsync({
			ELECTRON_RUN_AS_NODE: "1",
			...this.dependencies.getConnectorTokenEnv?.() ?? {},
			...agentExtraEnv,
			...qimeiEnv
		}, proxyEnv, this.dependencies);
		const readinessTimeoutMs = this.dependencies.hostEndpointWaitTimeoutMs ?? HOST_ENDPOINT_WAIT_TIMEOUT_MS;
		if (generation !== this.hostRuntimeGeneration) throw new HostRuntimeStartSupersededError();
		const sessionId = this.createHostRuntimeSessionId(generation);
		const runtimeInstanceId = (0, crypto.randomUUID)();
		const cwd = getHostedCliCwd(sessionId);
		await fs.promises.mkdir(cwd, { recursive: true });
		if (generation !== this.hostRuntimeGeneration) throw new HostRuntimeStartSupersededError();
		const cliEnv = {
			...baseCliEnv,
			[HOST_RUNTIME_INSTANCE_ID_ENV]: runtimeInstanceId
		};
		sidecarLog.info(`${TAG$1} ensureHostEndpoint: starting generation=${generation}, current=${this.hostRuntimeGeneration}, sessionId=${sessionId}, port=auto, runtimeInstanceId=${runtimeInstanceId}, mcpConfig=${mcpConfig ? "yes" : "no"}, routeMode=${cliEnvRouteMode ?? "default"}`);
		this.hostRuntimeCandidateSessionIds.add(sessionId);
		const startController = new AbortController();
		this.hostRuntimeStartControllers.add(startController);
		try {
			const createPromise = this.createHostedRuntimeSession({
				sessionId,
				command: this.dependencies.processExecPath ?? process.execPath,
				args: [
					resolveCLIPath(this.dependencies),
					"--serve",
					"--no-session-persistence",
					"--setting-sources",
					"user",
					...cliEnvRouteMode ? ["--settings", JSON.stringify({ envRouteMode: cliEnvRouteMode })] : [],
					...mcpConfig ? [
						"--mcp-config",
						mcpConfig,
						"--strict-mcp-config"
					] : []
				],
				cwd,
				env: cliEnv,
				port: 0
			}, generation, startController.signal);
			const supersededPromise = new Promise((_, reject) => {
				const rejectSuperseded = () => {
					this.killSession(sessionId).catch(() => void 0);
					reject(new HostRuntimeStartSupersededError());
				};
				if (startController.signal.aborted) {
					rejectSuperseded();
					return;
				}
				startController.signal.addEventListener("abort", rejectSuperseded, { once: true });
			});
			createPromise.then(() => {
				if (startController.signal.aborted) return this.killSession(sessionId).catch(() => void 0);
			}, () => void 0);
			const runtimeHandle = await Promise.race([createPromise, supersededPromise]);
			const endpoint = extractHttpEndpoint(runtimeHandle.acpEndpoint);
			const runtimePid = runtimeHandle.pid;
			sidecarLog.info(`${TAG$1} ensureHostEndpoint: child reported endpoint generation=${generation}, sessionId=${sessionId}, endpoint=${endpoint}, pid=${runtimePid ?? "unknown"}`);
			await waitForHostRuntimeEndpoint(endpoint, runtimeInstanceId, runtimePid, readinessTimeoutMs, () => generation !== this.hostRuntimeGeneration);
			if (generation !== this.hostRuntimeGeneration) throw new HostRuntimeStartSupersededError();
			const previousHostSessionId = this.hostSessionId;
			this.hostEndpoint = endpoint;
			this.hostSessionId = sessionId;
			this.hostRuntimeInstanceId = runtimeInstanceId;
			this.hostRuntimePid = runtimePid ?? null;
			this.hostEndpointGeneration = generation;
			this.cleanupHostedCliRuntimeSessions("ensure-host-endpoint", sessionId, [previousHostSessionId]).catch(() => {});
			if (this.lastNotifiedHostEndpoint && this.lastNotifiedHostEndpoint !== endpoint) this.emitHostEndpointChanged(endpoint);
			this.lastNotifiedHostEndpoint = endpoint;
			sidecarLog.info(`${TAG$1} ensureHostEndpoint: ready generation=${generation}, sessionId=${sessionId}, endpoint=${endpoint}, pid=${runtimePid ?? "unknown"}, elapsedMs=${Date.now() - startedAt}`);
			return {
				sessionId,
				endpoint,
				runtimeInstanceId,
				pid: runtimePid
			};
		} catch (error) {
			const superseded = error instanceof HostRuntimeStartSupersededError;
			sidecarLog.info(`${TAG$1} ensureHostEndpoint: start failed generation=${generation}, current=${this.hostRuntimeGeneration}, superseded=${superseded}, killing session=${sessionId}`);
			await this.killSession(sessionId).catch(() => {});
			throw error;
		} finally {
			this.hostRuntimeCandidateSessionIds.delete(sessionId);
			this.hostRuntimeStartControllers.delete(startController);
		}
	}
	createHostRuntimeSessionId(generation) {
		return `${HOST_RUNTIME_SESSION_ID}-${generation}-${(0, crypto.randomUUID)().slice(0, 8)}`;
	}
	async createHostedRuntimeSession(params, generation, signal) {
		await this.ensureStarted();
		if (signal.aborted || generation !== this.hostRuntimeGeneration) throw new HostRuntimeStartSupersededError();
		return this.getClientOrThrow("create hosted CLI runtime").createSession(params);
	}
};
function createWorkbuddySidecarManager(dependencies = {}) {
	return new SidecarManager(withWorkbuddySidecarDefaults({
		resolveProxyEnv: defaultResolveProxyEnv,
		...dependencies
	}));
}
function waitForControlPathFree(target, timeoutMs) {
	const deadline = Date.now() + timeoutMs;
	return new Promise((resolve) => {
		const probe = () => {
			if (Date.now() >= deadline) {
				resolve(false);
				return;
			}
			const socket = net.createConnection(target);
			let settled = false;
			const finalize = (result) => {
				if (settled) return;
				settled = true;
				socket.destroy();
				if (result === "free") resolve(true);
				else if (result === "occupied") resolve(false);
				else setTimeout(probe, STALE_PIPE_PROBE_INTERVAL_MS).unref();
			};
			socket.once("connect", () => finalize("occupied"));
			socket.once("error", (err) => {
				if (err.code === "ENOENT" || err.code === "ECONNREFUSED") finalize("free");
				else finalize("retry");
			});
		};
		probe();
	});
}
function extractHttpEndpoint(acpEndpoint) {
	return acpEndpoint.replace(/\/api\/v1\/acp$/, "");
}
function waitForEndpoint(endpoint, timeoutMs = HOST_ENDPOINT_WAIT_TIMEOUT_MS, isSuperseded) {
	return new Promise((resolve, reject) => {
		const rejectIfSuperseded = () => {
			if (!isSuperseded?.()) return false;
			reject(new HostRuntimeStartSupersededError());
			return true;
		};
		const match = endpoint.match(/^https?:\/\/([^/:]+):(\d+)/);
		if (!match) {
			resolve();
			return;
		}
		const [, host, rawPort] = match;
		const port = Number(rawPort);
		const deadline = Date.now() + timeoutMs;
		let delay = 50;
		const tryConnect = () => {
			if (rejectIfSuperseded()) return;
			const socket = net.createConnection({
				host,
				port
			}, () => {
				socket.destroy();
				if (!rejectIfSuperseded()) resolve();
			});
			socket.on("error", () => {
				socket.destroy();
				if (rejectIfSuperseded()) return;
				if (Date.now() >= deadline) {
					reject(/* @__PURE__ */ new Error(`${TAG$1} Host endpoint ${endpoint} not reachable after ${timeoutMs}ms`));
					return;
				}
				const currentDelay = delay;
				delay = Math.min(Math.ceil(delay * 1.5), 500);
				setTimeout(tryConnect, currentDelay);
			});
		};
		tryConnect();
	});
}
async function probeHostRuntimeEndpoint(endpoint, expectedRuntimeInstanceId, expectedPid, timeoutMs) {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), timeoutMs);
	try {
		const response = await fetch(`${endpoint}${HOST_RUNTIME_HEALTH_PATH}`, {
			headers: {
				"X-CodeBuddy-Request": "1",
				...require_gateway_secret.gatewaySecretHeaders()
			},
			signal: controller.signal
		});
		if (!response.ok) return {
			kind: "identity-mismatch",
			reason: `health returned HTTP ${response.status}`
		};
		let payload;
		try {
			payload = await response.json();
		} catch {
			return {
				kind: "identity-mismatch",
				reason: "health returned a non-JSON response"
			};
		}
		const envelope = payload && typeof payload === "object" ? payload : void 0;
		const health = envelope?.data && typeof envelope.data === "object" ? envelope.data : envelope;
		if (health?.status !== "ok") return {
			kind: "identity-mismatch",
			reason: "health status was not ok"
		};
		if (health.runtimeInstanceId !== expectedRuntimeInstanceId) return {
			kind: "identity-mismatch",
			reason: `runtime identity mismatch (expected=${expectedRuntimeInstanceId}, actual=${String(health.runtimeInstanceId ?? "missing")})`
		};
		if (expectedPid !== void 0 && health.pid !== expectedPid) return {
			kind: "identity-mismatch",
			reason: `runtime pid mismatch (expected=${expectedPid}, actual=${String(health.pid ?? "missing")})`
		};
		return { kind: "ready" };
	} catch (error) {
		return {
			kind: "unreachable",
			reason: error instanceof Error ? error.message : String(error)
		};
	} finally {
		clearTimeout(timeout);
	}
}
async function waitForHostRuntimeEndpoint(endpoint, expectedRuntimeInstanceId, expectedPid, timeoutMs = HOST_ENDPOINT_WAIT_TIMEOUT_MS, isSuperseded) {
	const deadline = Date.now() + timeoutMs;
	let delay = 50;
	while (true) {
		if (isSuperseded?.()) throw new HostRuntimeStartSupersededError();
		const remainingMs = Math.max(1, deadline - Date.now());
		const result = await probeHostRuntimeEndpoint(endpoint, expectedRuntimeInstanceId, expectedPid, Math.min(HOST_ENDPOINT_PROBE_TIMEOUT_MS, remainingMs));
		if (isSuperseded?.()) throw new HostRuntimeStartSupersededError();
		if (result.kind === "ready") return;
		if (result.kind === "identity-mismatch") throw new HostRuntimeIdentityMismatchError(endpoint, result.reason);
		if (Date.now() >= deadline) throw new Error(`${TAG$1} Host endpoint ${endpoint} not reachable with matching runtime identity after ${timeoutMs}ms (lastError=${result.reason})`);
		const currentDelay = Math.min(delay, Math.max(1, deadline - Date.now()));
		delay = Math.min(Math.ceil(delay * 1.5), 500);
		await new Promise((resolve) => setTimeout(resolve, currentDelay));
	}
}
async function isHostRuntimeEndpointReachable(endpoint, expectedRuntimeInstanceId, expectedPid) {
	return (await probeHostRuntimeEndpoint(endpoint, expectedRuntimeInstanceId, expectedPid, 500)).kind === "ready";
}
async function isEndpointReachable(endpoint) {
	try {
		await waitForEndpoint(endpoint, 500);
		return true;
	} catch {
		return false;
	}
}
function resolveCLIPath(options = {}) {
	const resolveAsset = options.resolveBundledAsset ?? defaultResolveBundledAsset;
	const bundled = resolveAsset("cli", "bin", "codebuddy") ?? resolveAsset("cli", "dist", "codebuddy.js");
	const appPath = (options.getRuntimeAppPath ?? require_runtime_context.getWorkbuddyRuntimeAppPath)();
	const monorepoBin = path.join(path.resolve(appPath, "..", ".."), "packages", "agent-cli", "bin", "codebuddy");
	const envPath = process.env.CODEBUDDY_CODE_PATH;
	const resolution = resolveAgentCliExecutablePath({
		bundledCliPaths: [bundled],
		monorepoCliPath: monorepoBin,
		envCliPath: envPath
	});
	if (resolution?.source === "env") sidecarLog.warn(`${TAG$1} resolveCLIPath: bundled CLI not found, falling back to CODEBUDDY_CODE_PATH=${envPath}`);
	if (resolution) return resolution.path;
	throw new Error(`${TAG$1} CLI not found.\n  - cli/bin/codebuddy
  - cli/dist/codebuddy.js`);
}
async function pathExists(filePath) {
	try {
		await fs.promises.access(filePath);
		return true;
	} catch {
		return false;
	}
}
async function unlinkFileSafeAsync(filePath) {
	try {
		await fs.promises.unlink(filePath);
	} catch {}
}
async function buildCliEnvAsync(extra, proxyEnv, options = {}) {
	const context = createBuildCliEnvContext(options);
	return buildCliEnvFromResolved(extra, proxyEnv, context, await resolveBuildCliEnvIoAsync(context));
}
function createBuildCliEnvContext(options = {}) {
	const getRuntimeAppVersion = options.getRuntimeAppVersion ?? require_runtime_context.getWorkbuddyRuntimeAppVersion;
	const getRuntimeConfigDir = options.getRuntimeConfigDir ?? require_runtime_context.getWorkbuddyRuntimeConfigDir;
	const getRuntimeUserDataDir = options.getRuntimeUserDataDir ?? require_runtime_context.getWorkbuddyRuntimeUserDataDir;
	return {
		runtimeAppVersion: getRuntimeAppVersion(),
		runtimeConfigDir: getRuntimeConfigDir(),
		runtimeUserDataDir: getRuntimeUserDataDir(),
		resolveAsset: options.resolveBundledAsset ?? defaultResolveBundledAsset,
		getBootstrapProductConfigEnv: options.getBootstrapProductConfigEnv ?? defaultGetBootstrapProductConfigEnv,
		hostId: options.hostId ?? "workbuddy-server"
	};
}
async function resolveBuildCliEnvIoAsync(context) {
	const [pluginDirs, productEnv, rtConfig] = await Promise.all([
		listAgentCliEnabledPluginDirsAsync(context.runtimeConfigDir),
		require_cli_product_env.resolveAgentCliProductEnvAsync({
			processEnv: process.env,
			fallbackProductConfigEnv: process.env.ACC_PRODUCT_CONFIG_V3 ? void 0 : context.getBootstrapProductConfigEnv()
		}),
		readAgentCliBundledRuntimeConfigAsync(context.runtimeUserDataDir)
	]);
	const rtEnabled = rtConfig.enabled !== false;
	const [managedNodeBinDirs, managedPythonBinDirs] = await Promise.all([rtEnabled && rtConfig.tools?.node !== false ? listAgentCliManagedBinDirsAsync({
		homeDir: (0, os.homedir)(),
		platform: process.platform,
		binaryType: "node"
	}) : Promise.resolve([]), rtEnabled && rtConfig.tools?.python !== false ? listAgentCliManagedBinDirsAsync({
		homeDir: (0, os.homedir)(),
		platform: process.platform,
		binaryType: "python"
	}) : Promise.resolve([])]);
	return {
		pluginDirs: pluginDirs.join(path.delimiter),
		productEnv,
		rtConfig,
		managedNodeBinDirs,
		managedPythonBinDirs
	};
}
function buildCliEnvFromResolved(extra, proxyEnv, context, resolved) {
	const env = {
		DISABLE_AUTOUPDATER: "1",
		ELECTRON_RUN_AS_NODE: "1",
		CODEBUDDY_GIT_REPO_SCAN_DISABLED: "1",
		CODEBUDDY_PROMPT_SUGGESTION_DISABLED: "1",
		CODEBUDDY_CONFIG_DIR: context.runtimeConfigDir,
		WORKBUDDY_CONFIG_DIR: context.runtimeConfigDir,
		WORKBUDDY_DATA_FOLDER_NAME: process.env.WORKBUDDY_DATA_FOLDER_NAME?.trim() || ".workbuddy",
		...require_gateway_secret.gatewaySecretEnv(),
		CODEBUDDY_DISABLE_REQUEST_VALIDATION: "1",
		CODEBUDDY_SKIP_GIT_BASH_CHECK: "1",
		CODEBUDDY_HOST: context.hostId,
		CODEBUDDY_DISABLE_EXTENDED_PLUGIN_HOOKS: "1",
		CODEBUDDY_DISABLE_SESSION_HISTORY_CLEANUP: "1",
		CODEBUDDY_INCLUDE_TOPIC_MESSAGE: "1",
		CODEBUDDY_CODE_DISABLE_SESSION_SUMMARY: "1",
		CODEBUDDY_BUILTIN_SKILLS_DIR: context.resolveAsset?.("plugins", "workbuddy-builtin", "skills") ?? path.join(process.cwd(), "resources", "plugins", "workbuddy-builtin", "skills"),
		CODEBUDDY_POWERSHELL_USE_PTY: "1",
		CODEBUDDY_REPLAY_SHOW_PRE_COMPACT: "1",
		CODEBUDDY_SKILL_TOOL_CHAR_BUDGET: "30000",
		CODEBUDDY_DISABLE_FORK_SUBAGENT: "1",
		CODEBUDDY_ENABLE_SECURITY_AUDIT: "1",
		WORKBUDDY_NODE_ENV: process.env.NODE_ENV || "production",
		...require_client_info_env.buildWorkbuddyClientInfoEnv({
			getAppVersion: () => context.runtimeAppVersion,
			resolveBundledAsset: context.resolveAsset
		})
	};
	if (resolved.pluginDirs) env.CODEBUDDY_PLUGIN_DIRS = resolved.pluginDirs;
	if (resolved.productEnv.productConfigPathEnv) env.ACC_PRODUCT_CONFIG_PATH = resolved.productEnv.productConfigPathEnv;
	else if (resolved.productEnv.productConfigEnv) env.ACC_PRODUCT_CONFIG_V3 = resolved.productEnv.productConfigEnv;
	if (resolved.productEnv.hostedCliInternetEnv) env[require_cli_product_env.AGENT_CLI_HOSTED_INTERNET_ENVIRONMENT_KEY] = resolved.productEnv.hostedCliInternetEnv;
	const rtConfig = resolved.rtConfig;
	const rtEnabled = rtConfig.enabled !== false;
	if (rtEnabled && rtConfig.tools?.gitBash !== false && process.env.CODEBUDDY_CODE_GIT_BASH_PATH) env.CODEBUDDY_CODE_GIT_BASH_PATH = process.env.CODEBUDDY_CODE_GIT_BASH_PATH;
	if (process.env.CODEBUDDY_PRE_MESSAGE_COMPACT_PCT) env.CODEBUDDY_PRE_MESSAGE_COMPACT_PCT = process.env.CODEBUDDY_PRE_MESSAGE_COMPACT_PCT;
	if (process.env.CODEBUDDY_AUTOCOMPACT_PCT_OVERRIDE) env.CODEBUDDY_AUTOCOMPACT_PCT_OVERRIDE = process.env.CODEBUDDY_AUTOCOMPACT_PCT_OVERRIDE;
	if (process.env.CODEBUDDY_ENGINEERING_COMPACT_SUFFICIENCY_PCT) env.CODEBUDDY_ENGINEERING_COMPACT_SUFFICIENCY_PCT = process.env.CODEBUDDY_ENGINEERING_COMPACT_SUFFICIENCY_PCT;
	if (proxyEnv) Object.assign(env, proxyEnv);
	const cliConnectorBin = resolveAgentCliConnectorBin({
		homeDir: (0, os.homedir)(),
		platform: process.platform
	});
	const extraPathParts = [];
	const managedNodeBinDirs = rtEnabled && rtConfig.tools?.node !== false ? resolved.managedNodeBinDirs : [];
	extraPathParts.push(...managedNodeBinDirs);
	if (rtEnabled && rtConfig.tools?.python !== false) extraPathParts.push(...resolved.managedPythonBinDirs);
	extraPathParts.push(cliConnectorBin);
	env.WORKBUDDY_EXTRA_PATHS = extraPathParts.filter(Boolean).join(process.platform === "win32" ? ";" : ":");
	prependDirsToEnvPath(env, managedNodeBinDirs, process.env, path.delimiter);
	const disabledTypes = [];
	if (!rtEnabled) disabledTypes.push(...require_client_info_env.getRegisteredBinaryTypes());
	else for (const type of require_client_info_env.getRegisteredBinaryTypes()) if (rtConfig.tools?.[type] === false) disabledTypes.push(type);
	if (disabledTypes.length > 0) env.WORKBUDDY_MANAGED_RUNTIME_DISABLED = disabledTypes.join(",");
	env.CODEBUDDY_HOST_CAPABILITIES = "elicitation.form,weixinpay.interception";
	if (extra) Object.assign(env, extra);
	return env;
}
return {DEFAULT_AGENT_CLI_BUNDLED_RUNTIME_CONFIG,buildAgentCliRuntimeEnv,prependDirsToEnvPath,resolveDisabledManagedRuntimeTypes,stringValues,copyProcessEnv,fsp,resolveAgentCliConnectorBin,resolveAgentCliPythonEnvBin,resolveAgentCliExecutablePath,listAgentCliManagedBinDirs,listAgentCliManagedBinDirsAsync,readManagedBundledRuntimeFromEnv,readAgentCliBundledRuntimeConfig,readAgentCliBundledRuntimeConfigAsync,readAgentCliAppConfigValue,resolveAgentCliRuntimeDirs,resolveAgentCliConfigDir,resolveAgentCliUserDataDir,listAgentCliEnabledPluginDirs,listAgentCliEnabledPluginDirsAsync,normalizeAgentCliBuiltinSkillsDir,compareVersionsDesc,resolveInjectedPath,TAG$1,HOST_RUNTIME_SESSION_ID,HOST_ENDPOINT_WAIT_TIMEOUT_MS,HOST_ENDPOINT_PROBE_TIMEOUT_MS,HOST_RUNTIME_INSTANCE_ID_ENV,HOST_RUNTIME_HEALTH_PATH,MAX_PING_RETRIES,PING_RETRY_DELAY_MS,STALE_PIPE_RECLAIM_TIMEOUT_MS,STALE_PIPE_PROBE_INTERVAL_MS,SIDECAR_STDERR_TAIL_LINES,sidecarScopedLogger,resolveSidecarScopedLogger,formatSidecarLogArgs,sidecarLog,isExpectedSidecarShutdownLine,isHostedCliRuntimeSessionId,USE_SYSTEM_CA_NODE_OPTION,CODEBUDDY_QIMEI36_ENV_KEY,buildSidecarProcessEnv,defaultResolveBundledAsset,defaultGetBootstrapProductConfigEnv,resolveWorkbuddySidecarBundledAsset,withWorkbuddySidecarDefaults,getHostedCliCwd,getProxyEnvFromProcess,defaultResolveProxyEnv,HostRuntimeStartSupersededError,HostRuntimeIdentityMismatchError,sidecarCrashWatcher,bindSidecarCrashWatcher,SidecarManager,createWorkbuddySidecarManager,waitForControlPathFree,extractHttpEndpoint,waitForEndpoint,probeHostRuntimeEndpoint,waitForHostRuntimeEndpoint,isHostRuntimeEndpointReachable,isEndpointReachable,resolveCLIPath,pathExists,unlinkFileSafeAsync,buildCliEnvAsync,createBuildCliEnvContext,resolveBuildCliEnvIoAsync,buildCliEnvFromResolved};
}

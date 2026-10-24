// @ts-nocheck
// Complete original application client-info provider and registry/protocol helpers.
import * as nodeFs from 'node:fs';import * as nodeCrypto from 'node:crypto';import * as nodeChildProcess from 'node:child_process';import * as nodeUtil from 'node:util';import {BehaviorSubject} from 'rxjs';import {createNativeSidecarClientInfo} from '../terminal/native-sidecar-client-info.js';import {createNativeSidecarRuntimeContext} from '../terminal/native-sidecar-runtime-context.js';
export const WORKBUDDY_CLIENT_INFO_SOURCE={"sources":[{"file":"module-base.js","sha256":"edd9910d7cc967033c89a723f69ab449b59dd57aff78bcada77a973e95733a53"},{"file":"common.js","sha256":"786cdfa0ec67e97753b4bc3e476f4582f10f4ccba694b5a9ec7de121478708a7"}],"regions":[{"file":"module-base.js","from":32370,"to":32467},{"file":"module-base.js","from":32468,"to":32703},{"file":"module-base.js","from":32704,"to":33109},{"file":"module-base.js","from":33110,"to":33144},{"file":"module-base.js","from":33214,"to":33284},{"file":"module-base.js","from":33286,"to":33325},{"file":"module-base.js","from":33619,"to":33647},{"file":"module-base.js","from":33648,"to":33743},{"file":"module-base.js","from":33744,"to":33792},{"file":"module-base.js","from":33793,"to":33830},{"file":"module-base.js","from":33831,"to":38161},{"file":"module-base.js","from":39432,"to":39528},{"file":"common.js","from":695238,"to":695406},{"file":"common.js","from":1018344,"to":1018921},{"file":"common.js","from":1018923,"to":1020097},{"file":"common.js","from":1020099,"to":1020486},{"file":"common.js","from":1020729,"to":1021679}]} as const;
export function createNativeWorkbuddyClientInfo(runtime:any={}){
const process=runtime.process??globalThis.process,node_fs=runtime.fs??nodeFs,node_crypto=runtime.crypto??nodeCrypto,node_child_process=runtime.childProcess??nodeChildProcess,node_util=nodeUtil;const require_client_info_env=runtime.clientInfoEnv??createNativeSidecarClientInfo(runtime),require_runtime_context=runtime.runtimeContext??createNativeSidecarRuntimeContext(runtime);var ENV_CLIENT_INFO_KEYS,ClientPlatform,IDETypes,getIDEType;const EnvUtils={isNodeRuntime};const require_common$2={BehaviorSubject,EnvUtils,get ENV_CLIENT_INFO_KEYS(){return ENV_CLIENT_INFO_KEYS},get IDETypes(){return IDETypes},getIDEType:(value)=>getIDEType(value)};
async function readWindowsDownloadChannel(regValueName) {
	return registryReader(regValueName);
}
async function defaultRegistryReader(regValueName) {
	if (process.platform !== "win32") return;
	for (const root of ["HKCU", "HKLM"]) {
		const channel = await queryRegistryValue(root, regValueName);
		if (channel) return channel;
	}
}
async function queryRegistryValue(root, regValueName) {
	try {
		const { stdout } = await execFileAsync("reg", [
			"query",
			`${root}\\Software\\${regValueName}`,
			"/v",
			"DownloadChannel"
		], {
			encoding: "utf8",
			timeout: 3e3,
			windowsHide: true
		});
		const match = stdout.match(/DownloadChannel\s+REG_SZ\s+(.+)/);
		if (match && match[1]) return match[1].trim() || void 0;
	} catch {}
}
var execFileAsync, registryReader;
execFileAsync = (0, node_util.promisify)(node_child_process.execFile);
registryReader = defaultRegistryReader;
var clientInfoAssetResolver;
function setWorkbuddyClientInfoAssetResolver(resolver) {
	clientInfoAssetResolver = resolver;
}
var WORKBUDDY_PLUGIN_NAME = "workbuddy-desktop";
var WORKBUDDY_PLATFORM = "WorkBuddy";
var WorkbuddyClientInfoProvider = class WorkbuddyClientInfoProvider {
	productManager;
	filePathService;
	clientInfo;
	fallbackSessionId = node_crypto.randomUUID();
	downloadChannelProbeStarted = false;
	clientInfo$ = new require_common$2.BehaviorSubject(void 0);
	initialize() {
		this.initClientInfo();
		this.productManager.configuration.subscribe(() => {
			this.initClientInfo();
		});
	}
	async get() {
		return Promise.resolve(this.clientInfo ?? this.initClientInfo());
	}
	initClientInfo() {
		const product = this.productManager.getCurrentConfiguration();
		const processEnvInfo = this.getProcessEnvInfo();
		const fallbackVersion = this.resolveProductVersion();
		const reportPlatform = product?.applicationName || WORKBUDDY_PLATFORM;
		const clientInfo = {
			machineId: require_client_info_env.resolveHostMachineId(),
			sessionId: this.fallbackSessionId,
			platform: reportPlatform,
			platformVersion: product?.platformVersion || fallbackVersion,
			productName: product?.productName || "",
			applicationName: product?.applicationName || "",
			productVersion: product?.productVersion || fallbackVersion,
			pluginName: WORKBUDDY_PLUGIN_NAME,
			pluginVersion: fallbackVersion,
			ideType: reportPlatform,
			downloadChannel: product?.downloadChannel,
			userAgentExtension: this.resolveBundledCliUserAgent(),
			...processEnvInfo
		};
		clientInfo.productName = this.resolveProductName(clientInfo.productName);
		if (processEnvInfo.platform && !processEnvInfo.ideType) clientInfo.ideType = require_common$2.getIDEType(clientInfo.platform);
		this.filePathService?.setIDEType(clientInfo.ideType ?? require_common$2.IDETypes.VSCode);
		this.clientInfo = clientInfo;
		this.clientInfo$.next(clientInfo);
		if (!this.downloadChannelProbeStarted && !processEnvInfo.downloadChannel && require_common$2.EnvUtils.isNodeRuntime() && process.platform === "win32") {
			this.downloadChannelProbeStarted = true;
			this.probeWindowsDownloadChannel().catch(() => {});
		}
		return clientInfo;
	}
	async probeWindowsDownloadChannel() {
		const channel = await readWindowsDownloadChannel(this.resolveWin32RegValueName());
		if (!channel || !this.clientInfo) return;
		this.clientInfo = {
			...this.clientInfo,
			downloadChannel: channel
		};
		this.clientInfo$.next(this.clientInfo);
		if (!process.env.CODEBUDDY_CLIENT_INFO_DOWNLOAD_CHANNEL) process.env.CODEBUDDY_CLIENT_INFO_DOWNLOAD_CHANNEL = channel;
	}
	resolveWin32RegValueName() {
		const fallback = "WorkBuddy";
		const product = this.productManager.getCurrentConfiguration();
		if (product?.win32RegValueName) return product.win32RegValueName;
		if (product?.applicationName) return product.applicationName;
		const resolved = resolveClientInfoAsset("product.json");
		if (resolved) try {
			const json = JSON.parse(node_fs.readFileSync(resolved, "utf-8"));
			if (typeof json.win32RegValueName === "string" && json.win32RegValueName) return json.win32RegValueName;
			if (typeof json.applicationName === "string" && json.applicationName) return json.applicationName;
		} catch {}
		return fallback;
	}
	resolveProductVersion() {
		return require_runtime_context.getWorkbuddyRuntimeAppVersion();
	}
	resolveProductName(fallbackName) {
		const resolved = resolveClientInfoAsset("product.json");
		if (resolved) try {
			const product = JSON.parse(node_fs.readFileSync(resolved, "utf-8"));
			if (typeof product.productName === "string" && product.productName) return product.productName;
		} catch {}
		return fallbackName || "";
	}
	getProcessEnvInfo() {
		const info = {};
		if (require_common$2.EnvUtils.isNodeRuntime() && process.env) for (const key of Object.keys(require_common$2.ENV_CLIENT_INFO_KEYS)) {
			const propKey = key;
			const envKey = require_common$2.ENV_CLIENT_INFO_KEYS[propKey];
			if (envKey in process.env && process.env[envKey]) info[propKey] = process.env[envKey];
		}
		return info;
	}
	resolveBundledCliUserAgent() {
		const resolved = resolveClientInfoAsset("cli", "package.json");
		if (!resolved) return;
		try {
			const pkg = JSON.parse(node_fs.readFileSync(resolved, "utf-8"));
			const ver = pkg.version;
			if (ver && ver !== "0.0.0") return `CLI/${ver}`;
			const customPkg = pkg.publishConfig?.customPackage;
			if (typeof customPkg?.version === "string" && customPkg.version) return `CLI/${customPkg.version}`;
		} catch {}
	}
};
function resolveClientInfoAsset(...segments) {
	return clientInfoAssetResolver?.(...segments);
}
function isNodeRuntime() {
			if (Object.prototype.toString.call(typeof process !== "undefined" ? process : 0) === "[object process]") return true;
			return false;
		}
ENV_CLIENT_INFO_KEYS = {
		machineId: "CLIENT_INFO_MACHINE_ID",
		sessionId: "CLIENT_INFO_SESSION_ID",
		platform: "CLIENT_INFO_PLATFORM",
		platformVersion: "CLIENT_INFO_PLATFORM_VERSION",
		productName: "CLIENT_INFO_PRODUCT_NAME",
		applicationName: "CLIENT_INFO_APPLICATION_NAME",
		productVersion: "CLIENT_INFO_PRODUCT_VERSION",
		ideType: "CLIENT_INFO_IDE_TYPE",
		pluginName: "CLIENT_INFO_PLUGIN_NAME",
		pluginVersion: "CLIENT_INFO_PLUGIN_VERSION",
		downloadChannel: "CODEBUDDY_CLIENT_INFO_DOWNLOAD_CHANNEL",
		userAgentExtension: "CLIENT_INFO_USER_AGENT_EXTENSION"
	};
ClientPlatform = /* @__PURE__ */ function(ClientPlatform) {
		ClientPlatform["VSCODE"] = "VSCode";
		ClientPlatform["VSCODE_ANY_DEV"] = "VSCodeAnyDev";
		ClientPlatform["JETBRAINS_INTELLIJ_IDEA"] = "JetBrainsIntelliJIdea";
		ClientPlatform["JETBRAINS_PYCHARM"] = "JetBrainsPyCharm";
		ClientPlatform["JETBRAINS_WEBSTORM"] = "JetBrainsWebStorm";
		ClientPlatform["JETBRAINS_GOLAND"] = "JetBrainsGoLand";
		ClientPlatform["JETBRAINS_APPCODE"] = "JetBrainsAppCode";
		ClientPlatform["JETBRAINS_CLION"] = "JetBrainsCLion";
		ClientPlatform["JETBRAINS_PHPSTORM"] = "JetBrainsPhpStorm";
		ClientPlatform["JETBRAINS_DATAGRIP"] = "JetBrainsDataGrip";
		ClientPlatform["JETBRAINS_RUBYMINE"] = "JetBrainsRubyMine";
		ClientPlatform["JETBRAINS_RIDER"] = "JetBrainsRider";
		ClientPlatform["ANDROID_STUDIO"] = "AndroidStudio";
		ClientPlatform["VIM"] = "Vim";
		ClientPlatform["NEOVIM"] = "NeoVim";
		ClientPlatform["XCODE"] = "XCode";
		ClientPlatform["VISUAL_STUDIO"] = "VisualStudio";
		ClientPlatform["WEB_CHAT"] = "WebChat";
		ClientPlatform["WX_IDE"] = "WXIDE";
		ClientPlatform["CODE_BUDDY_IDE"] = "CodeBuddyIDE";
		ClientPlatform["CLI"] = "CLI";
		return ClientPlatform;
	}({});
IDETypes = /* @__PURE__ */ function(IDETypes) {
		IDETypes["VSCode"] = "VSCode";
		IDETypes["JetBrains"] = "JetBrains";
		IDETypes["Vim"] = "Vim";
		IDETypes["XCode"] = "XCode";
		IDETypes["VisualStudio"] = "VisualStudio";
		IDETypes["WebChat"] = "WebChat";
		IDETypes["WXIDE"] = "WXIDE";
		IDETypes["CodeBuddyIDE"] = "CodeBuddyIDE";
		IDETypes["CLI"] = "CLI";
		return IDETypes;
	}({});
getIDEType = (platform) => {
		if (EnvUtils.isNodeRuntime()) {
			if (process.env.ACC_IDE_TYPE) return process.env.ACC_IDE_TYPE;
			if (process.env[ENV_CLIENT_INFO_KEYS.ideType]) return process.env[ENV_CLIENT_INFO_KEYS.ideType];
			if (process.env.ACC_USER_ID) return `web-${platform}`;
		}
		if (platform.includes("VSCode")) return IDETypes.VSCode;
		if (platform.includes("JetBrains")) return IDETypes.JetBrains;
		if (platform.includes("Vim")) return IDETypes.Vim;
		if (platform.includes(ClientPlatform.XCODE)) return IDETypes.XCode;
		if (platform.includes(ClientPlatform.VISUAL_STUDIO)) return IDETypes.VisualStudio;
		if (platform.includes(ClientPlatform.CODE_BUDDY_IDE)) return IDETypes.CodeBuddyIDE;
		if (platform.includes(ClientPlatform.WX_IDE)) return IDETypes.WXIDE;
		if (platform.includes(ClientPlatform.WEB_CHAT)) return IDETypes.WebChat;
		if (platform.includes(ClientPlatform.CLI)) return IDETypes.CLI;
		return IDETypes.VSCode;
	};
return {WorkbuddyClientInfoProvider,setWorkbuddyClientInfoAssetResolver,readWindowsDownloadChannel,getIDEType,ENV_CLIENT_INFO_KEYS};
}

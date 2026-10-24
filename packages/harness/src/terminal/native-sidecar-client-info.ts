// @ts-nocheck
import * as nodeFs from 'node:fs';
import * as nodeOs from 'node:os';
import * as nodePath from 'node:path';
import * as nodeCrypto from 'node:crypto';
import * as nodeChildProcess from 'node:child_process';
import * as nodeUtil from 'node:util';
export const SERVICE_SOURCE={"sources":[{"file":"chunk.js","sha256":"d92687c96377faa98b2524502408c7a73328d6dc4e702c7a61c575218e3f75b4"},{"file":"client-info-env.js","sha256":"b353fc2393d2d504aeae11afc5b45e8ba5149c7e30155cb885397f17ef8a2439"}],"regions":[{"file":"chunk.js","from":303,"to":369},{"file":"client-info-env.js","from":8122,"to":8147},{"file":"client-info-env.js","from":8148,"to":8306},{"file":"client-info-env.js","from":8421,"to":8436},{"file":"client-info-env.js","from":8437,"to":9999},{"file":"client-info-env.js","from":10664,"to":11422},{"file":"client-info-env.js","from":11423,"to":11512},{"file":"client-info-env.js","from":11513,"to":14196},{"file":"client-info-env.js","from":14304,"to":14385},{"file":"client-info-env.js","from":14413,"to":14573},{"file":"client-info-env.js","from":14574,"to":14598},{"file":"client-info-env.js","from":14599,"to":14796},{"file":"client-info-env.js","from":116155,"to":116170},{"file":"client-info-env.js","from":116171,"to":116220},{"file":"client-info-env.js","from":116221,"to":116717},{"file":"client-info-env.js","from":116718,"to":117115},{"file":"client-info-env.js","from":117116,"to":117817},{"file":"client-info-env.js","from":117818,"to":118079},{"file":"client-info-env.js","from":118265,"to":118302},{"file":"client-info-env.js","from":118303,"to":118351},{"file":"client-info-env.js","from":118352,"to":118366},{"file":"client-info-env.js","from":118367,"to":118388},{"file":"client-info-env.js","from":118389,"to":118416},{"file":"client-info-env.js","from":118417,"to":118779},{"file":"client-info-env.js","from":119250,"to":119348},{"file":"client-info-env.js","from":119349,"to":120232},{"file":"client-info-env.js","from":120233,"to":120352},{"file":"client-info-env.js","from":120353,"to":120681},{"file":"client-info-env.js","from":120682,"to":121130}],"names":["__esmMin","COS_PRELOAD_BASE_URL","init_cos_preload","nodeConfig","init_node_config","signDarwinPythonWithEntitlements","execFileAsync$2","PYTHON_DARWIN_ENTITLEMENTS","RE_DISABLE_LIB_VALIDATION","pythonConfig","init_python_config","getRegisteredBinaryTypes","getBinaryTypeConfig","BINARY_TYPE_CONFIGS","init_type_configs","cachedUuid","uuidRegex","linuxUuid","osxUuid","winUuid","machineIdSync","WORKBUDDY_PLATFORM","WORKBUDDY_PLUGIN_NAME","cachedEnv","cachedEnvVersion","cachedEnvAssetResolver","buildWorkbuddyClientInfoEnv","resolveHostMachineId","getCachedBaseEnv","resolveDesktopVersion","resolveBundledProductName","resolveBundledCliVersion"]} as const;
export function createNativeSidecarClientInfo(runtime:any={}):any {
const process=runtime.process ?? globalThis.process;
const node_fs=runtime.fs ?? nodeFs,fs=node_fs,node_os={default:runtime.os ?? nodeOs},os=runtime.os ?? nodeOs,path=nodePath,node_crypto=runtime.crypto ?? nodeCrypto,node_child_process=runtime.childProcess ?? nodeChildProcess,child_process=node_child_process,util=nodeUtil;
// BEGIN ORIGINAL
var __esmMin = (fn, res) => () => (fn && (res = fn(fn = 0)), res);
const require_chunk={__esmMin};
var COS_PRELOAD_BASE_URL;
var init_cos_preload = require_chunk.__esmMin((() => {
	COS_PRELOAD_BASE_URL = "https://acc-1258344699.cos.ap-guangzhou.myqcloud.com/workbuddy/binaries";
}));
var nodeConfig;
var init_node_config = require_chunk.__esmMin((() => {
	init_cos_preload();
	nodeConfig = {
		executableName: {
			unix: "node",
			win32: "node.exe"
		},
		parseVersion: (output) => {
			const match = output.match(/v?(\d+\.\d+\.\d+)/);
			return match ? match[1] : null;
		},
		versionVerifyRegex: /v?\d+\.\d+\.\d+/,
		downloadSources: [
			{
				name: "cos-preloaded",
				urlTemplate: `${COS_PRELOAD_BASE_URL}/node/{filename}`,
				priority: 0
			},
			{
				name: "npmmirror",
				urlTemplate: "https://npmmirror.com/mirrors/node/v{version}/{filename}",
				priority: 1
			},
			{
				name: "nodejs-official",
				urlTemplate: "{url}",
				priority: 2
			}
		],
		systemSearchPaths: {
			darwin: ["/usr/local/bin/node", "/opt/homebrew/bin/node"],
			linux: ["/usr/local/bin/node", "/usr/bin/node"],
			win32: [
				"C:\\Program Files\\nodejs\\node.exe",
				"%PROGRAMFILES%\\nodejs\\node.exe",
				"%APPDATA%\\nvm\\v*\\node.exe",
				"%USERPROFILE%\\.volta\\bin\\node.exe"
			]
		},
		blockedEnvVars: ["NODE_PATH", "NPM_CONFIG_PREFIX"],
		buildIsolatedEnv: (binary) => {
			const env = { NPM_CONFIG_LOGLEVEL: "error" };
			if (binary.installPath) {
				const npmConfigDir = path.join(binary.installPath, ".npm-config");
				env.NPM_CONFIG_USERCONFIG = path.join(npmConfigDir, ".npmrc");
				env.NPM_CONFIG_GLOBALCONFIG = path.join(npmConfigDir, ".npmrc");
				env.NPM_CONFIG_CACHE = path.join(binary.installPath, ".npm-cache");
			}
			return env;
		},
		promptInstructions: "For Node.js packages: use `npm install` (local). Never `npm install -g`."
	};
}));
async function signDarwinPythonWithEntitlements(execPath) {
	try {
		const { stdout } = await execFileAsync$2("codesign", [
			"-d",
			"--entitlements",
			"-",
			"--xml",
			execPath
		], { encoding: "utf8" });
		if (RE_DISABLE_LIB_VALIDATION.test(stdout)) return;
	} catch {}
	const plistPath = path.join(os.tmpdir(), `wb-py-ent-${process.pid}-${Date.now()}.plist`);
	await fs.promises.writeFile(plistPath, PYTHON_DARWIN_ENTITLEMENTS, "utf8");
	try {
		await execFileAsync$2("codesign", ["--remove-signature", execPath]);
		await execFileAsync$2("codesign", [
			"--sign",
			"-",
			"--force",
			"--options",
			"runtime",
			"--entitlements",
			plistPath,
			execPath
		]);
	} finally {
		await fs.promises.unlink(plistPath).catch(() => void 0);
	}
}
var execFileAsync$2, PYTHON_DARWIN_ENTITLEMENTS, RE_DISABLE_LIB_VALIDATION, pythonConfig;
var init_python_config = require_chunk.__esmMin((() => {
	init_cos_preload();
	execFileAsync$2 = (0, util.promisify)(child_process.execFile);
	PYTHON_DARWIN_ENTITLEMENTS = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.cs.allow-jit</key><true/>
    <key>com.apple.security.cs.allow-unsigned-executable-memory</key><true/>
    <key>com.apple.security.cs.allow-dyld-environment-variables</key><true/>
    <key>com.apple.security.cs.disable-library-validation</key><true/>
</dict>
</plist>
`;
	RE_DISABLE_LIB_VALIDATION = /<key>\s*com\.apple\.security\.cs\.disable-library-validation\s*<\/key>\s*<true\s*\/>/i;
	pythonConfig = {
		executableName: {
			unix: "python3",
			win32: "python.exe"
		},
		parseVersion: (output) => {
			const match = output.match(/Python\s+(\d+\.\d+\.\d+)/i);
			return match ? match[1] : null;
		},
		versionVerifyRegex: /Python\s+\d+\.\d+\.\d+/i,
		downloadSources: [{
			name: "cos-preloaded",
			urlTemplate: `${COS_PRELOAD_BASE_URL}/python/{filename}`,
			priority: 0
		}, {
			name: "github-releases",
			urlTemplate: "{url}",
			priority: 1
		}],
		systemSearchPaths: {
			darwin: [
				"/usr/bin/python3",
				"/usr/local/bin/python3",
				"/opt/homebrew/bin/python3",
				"/opt/homebrew/opt/python@3.11/bin/python3",
				"/opt/homebrew/opt/python@3.12/bin/python3",
				"/opt/homebrew/opt/python@3.13/bin/python3"
			],
			linux: [
				"/usr/bin/python3",
				"/usr/local/bin/python3",
				"/usr/bin/python3.11",
				"/usr/bin/python3.12",
				"/usr/bin/python3.13"
			],
			win32: [
				"C:\\Python3*\\python.exe",
				"%LOCALAPPDATA%\\Programs\\Python\\Python3*\\python.exe",
				"%USERPROFILE%\\AppData\\Local\\Programs\\Python\\Python3*\\python.exe",
				"%PROGRAMFILES%\\Python3*\\python.exe",
				"%LOCALAPPDATA%\\Microsoft\\WindowsApps\\python3.exe"
			]
		},
		blockedEnvVars: [
			"PYTHONPATH",
			"PYTHONHOME",
			"PYTHONUSERBASE",
			"VIRTUAL_ENV",
			"CONDA_PREFIX",
			"CONDA_DEFAULT_ENV",
			"PYENV_ROOT",
			"PYENV_VERSION",
			"PIP_INDEX_URL",
			"PIP_TRUSTED_HOST"
		],
		buildIsolatedEnv: () => ({
			PIP_NO_INPUT: "1",
			PYTHONUNBUFFERED: "1",
			PYTHONNOUSERSITE: "1",
			PYTHONDONTWRITEBYTECODE: "1",
			PIP_CONFIG_FILE: process.platform === "win32" ? "NUL" : "/dev/null"
		}),
		promptInstructions: "For Python packages: use `<python-path> -m venv .venv` + `.venv/bin/pip install`. Never `pip install` globally.",
		postInstall: async (_tempDir, execPath, platform) => {
			if (platform !== "darwin") return;
			await signDarwinPythonWithEntitlements(execPath);
		}
	};
}));
function getRegisteredBinaryTypes() {
	return Object.keys(BINARY_TYPE_CONFIGS);
}
function getBinaryTypeConfig(type) {
	const config = BINARY_TYPE_CONFIGS[type];
	if (!config) throw new Error(`Unknown binary type: ${type}`);
	return config;
}
var BINARY_TYPE_CONFIGS;
var init_type_configs = require_chunk.__esmMin((() => {
	init_node_config();
	init_python_config();
	init_cos_preload();
	BINARY_TYPE_CONFIGS = {
		python: pythonConfig,
		node: nodeConfig
	};
}));
var cachedUuid;
var uuidRegex = /\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/;
function linuxUuid() {
	try {
		const content = (0, node_fs.readFileSync)("/var/lib/dbus/machine-id", { encoding: "utf8" });
		if (!content) return (0, node_crypto.randomUUID)();
		let formatted = content.replace(/\s+/, "");
		if (!/-/.test(formatted) && formatted.length > 20) formatted = `${formatted.slice(0, 8)}-${formatted.slice(8, 12)}-${formatted.slice(12, 16)}-${formatted.slice(16, 20)}-${formatted.slice(20)}`;
		return formatted;
	} catch {
		return (0, node_crypto.randomUUID)();
	}
}
function osxUuid() {
	try {
		const stdout = (0, node_child_process.execFileSync)("ioreg", [
			"-rd1",
			"-c",
			"IOPlatformExpertDevice"
		], { encoding: "utf8" });
		for (const line of stdout.split("\n")) if (/IOPlatformUUID/.test(line) && uuidRegex.test(line)) {
			const match = uuidRegex.exec(line)?.[0];
			if (match) return match;
		}
	} catch {}
	return (0, node_crypto.randomUUID)();
}
function winUuid() {
	try {
		const stdout = (0, node_child_process.execFileSync)("reg", [
			"query",
			"HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Cryptography",
			"/v",
			"MachineGuid"
		], {
			encoding: "utf8",
			windowsHide: true
		});
		const match = uuidRegex.exec(stdout);
		if (match) return match[0];
	} catch {
		try {
			const stdout = (0, node_child_process.execFileSync)("wmic", [
				"csproduct",
				"get",
				"UUID"
			], {
				encoding: "utf8",
				windowsHide: true
			});
			for (const line of stdout.split("\n")) if (uuidRegex.test(line)) {
				const match = uuidRegex.exec(line)?.[0];
				if (match) return match;
			}
		} catch {}
	}
	return (0, node_crypto.randomUUID)();
}
function machineIdSync() {
	if (cachedUuid) return cachedUuid;
	const resolver = {
		darwin: osxUuid,
		win32: winUuid,
		linux: linuxUuid
	}[node_os.default.platform()];
	cachedUuid = resolver ? resolver() : (0, node_crypto.randomUUID)();
	return cachedUuid;
}
var WORKBUDDY_PLATFORM = "WorkBuddy";
var WORKBUDDY_PLUGIN_NAME = "workbuddy-desktop";
var cachedEnv;
var cachedEnvVersion;
var cachedEnvAssetResolver;
function buildWorkbuddyClientInfoEnv(options = {}) {
	const result = { ...getCachedBaseEnv(options) };
	const channel = process.env.CODEBUDDY_CLIENT_INFO_DOWNLOAD_CHANNEL;
	if (channel) result.CODEBUDDY_CLIENT_INFO_DOWNLOAD_CHANNEL = channel;
	const machineId = resolveHostMachineId();
	if (machineId) result.CLIENT_INFO_MACHINE_ID = machineId;
	return result;
}
function resolveHostMachineId() {
	return process.env.CLIENT_INFO_MACHINE_ID || machineIdSync();
}
function getCachedBaseEnv(options) {
	const version = resolveDesktopVersion(options);
	const assetResolver = options.resolveBundledAsset;
	if (cachedEnv && cachedEnvVersion === version && cachedEnvAssetResolver === assetResolver) return cachedEnv;
	const productName = resolveBundledProductName(assetResolver) ?? WORKBUDDY_PLATFORM;
	const cliVersion = resolveBundledCliVersion(assetResolver);
	cachedEnv = {
		CLIENT_INFO_PLATFORM: WORKBUDDY_PLATFORM,
		CLIENT_INFO_PLATFORM_VERSION: version,
		CLIENT_INFO_IDE_TYPE: WORKBUDDY_PLATFORM,
		CLIENT_INFO_PRODUCT_NAME: productName,
		CLIENT_INFO_PRODUCT_VERSION: version,
		CLIENT_INFO_PLUGIN_NAME: WORKBUDDY_PLUGIN_NAME,
		CLIENT_INFO_PLUGIN_VERSION: version,
		...cliVersion ? { CLIENT_INFO_USER_AGENT_EXTENSION: `CLI/${cliVersion}` } : {}
	};
	cachedEnvVersion = version;
	cachedEnvAssetResolver = assetResolver;
	return cachedEnv;
}
function resolveDesktopVersion(options) {
	try {
		return options.getAppVersion?.() ?? "";
	} catch {
		return "";
	}
}
function resolveBundledProductName(resolveBundledAsset) {
	const resolved = resolveBundledAsset?.("product.json");
	if (!resolved) return;
	try {
		const product = JSON.parse(node_fs.readFileSync(resolved, "utf-8"));
		if (typeof product.productName === "string" && product.productName) return product.productName;
	} catch {}
}
function resolveBundledCliVersion(resolveBundledAsset) {
	const resolved = resolveBundledAsset?.("cli", "package.json");
	if (!resolved) return;
	try {
		const pkg = JSON.parse(node_fs.readFileSync(resolved, "utf-8"));
		const ver = pkg.version;
		if (ver && ver !== "0.0.0") return ver;
		const customPkg = pkg.publishConfig?.customPackage;
		if (typeof customPkg?.version === "string" && customPkg.version) return customPkg.version;
	} catch {}
}
// END ORIGINAL
init_type_configs();
return {__esmMin,COS_PRELOAD_BASE_URL,init_cos_preload,nodeConfig,init_node_config,signDarwinPythonWithEntitlements,execFileAsync$2,PYTHON_DARWIN_ENTITLEMENTS,RE_DISABLE_LIB_VALIDATION,pythonConfig,init_python_config,getRegisteredBinaryTypes,getBinaryTypeConfig,BINARY_TYPE_CONFIGS,init_type_configs,cachedUuid,uuidRegex,linuxUuid,osxUuid,winUuid,machineIdSync,WORKBUDDY_PLATFORM,WORKBUDDY_PLUGIN_NAME,cachedEnv,cachedEnvVersion,cachedEnvAssetResolver,buildWorkbuddyClientInfoEnv,resolveHostMachineId,getCachedBaseEnv,resolveDesktopVersion,resolveBundledProductName,resolveBundledCliVersion};
}

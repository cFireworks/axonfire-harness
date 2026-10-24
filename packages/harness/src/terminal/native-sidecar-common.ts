// @ts-nocheck
import * as nodeFs from 'node:fs';
import * as nodeOs from 'node:os';
import * as nodePath from 'node:path';
import * as nodeCrypto from 'node:crypto';
import * as nodeChildProcess from 'node:child_process';
import * as nodeUtil from 'node:util';
export const SERVICE_SOURCE={"sources":[{"file":"common.js","sha256":"786cdfa0ec67e97753b4bc3e476f4582f10f4ccba694b5a9ec7de121478708a7"}],"regions":[{"file":"common.js","from":82321,"to":82404},{"file":"common.js","from":82405,"to":82518},{"file":"common.js","from":82596,"to":82791},{"file":"common.js","from":82792,"to":85012},{"file":"common.js","from":1005520,"to":1005606},{"file":"common.js","from":1005607,"to":1005681},{"file":"common.js","from":1006230,"to":1006302},{"file":"common.js","from":1006304,"to":1006356},{"file":"common.js","from":1006358,"to":1006471},{"file":"common.js","from":1006473,"to":1006561}],"names":["isObject$2","toStringArray","toPrefixRules","translateRemoteSecurityCenter","setProductEndpointOverride","getProductEndpointOverride","WORKBUDDY_DEV_ENDPOINT_OVERRIDE_ENV"]} as const;
export function createNativeSidecarCommon(runtime:any={}):any {
const process=runtime.process ?? globalThis.process;
var WORKBUDDY_DEV_ENDPOINT_OVERRIDE_ENV,productEndpointOverride,_earlyEnvOverride;
// BEGIN ORIGINAL
function isObject$2(value) {
	return typeof value === "object" && value !== null;
}
function toStringArray(value) {
	return Array.isArray(value) ? value.filter((v) => typeof v === "string") : [];
}
function toPrefixRules(prefixes) {
	return toStringArray(prefixes).map((p) => p.trim().split(/\s+/).filter(Boolean)).filter((tokens) => tokens.length > 0).map((tokens) => ({ prefix: tokens }));
}
function translateRemoteSecurityCenter(clientSecurity) {
	if (!isObject$2(clientSecurity)) return { managed: false };
	const config = clientSecurity.config;
	if (!isObject$2(config)) return { managed: false };
	const hasSandbox = "sandbox" in config;
	const hasDataSecurity = "dataSecurity" in config;
	const hasRuntime = "runtime" in config;
	const policy = { managed: hasSandbox || hasDataSecurity || hasRuntime };
	const sandbox = config.sandbox;
	if (isObject$2(sandbox)) {
		if (typeof sandbox.enabled === "boolean") policy.sandboxEnabled = sandbox.enabled;
		if (typeof sandbox.showDefaultPermission === "boolean") policy.showDefaultPermission = sandbox.showDefaultPermission;
		const net = sandbox.networkAccess;
		if (isObject$2(net)) policy.network = {
			allowedDomains: toStringArray(net.whitelistDomains),
			deniedDomains: toStringArray(net.blacklistDomains),
			denyAll: net.mode === "deny_all_with_whitelist"
		};
		const fp = sandbox.fileProtection;
		if (isObject$2(fp)) policy.fileSafety = {
			blocklist: toStringArray(fp.protectPaths),
			allowlist: toStringArray(fp.whitelist)
		};
		const cc = sandbox.commandControl;
		if (isObject$2(cc)) policy.commandSafety = {
			allow: toPrefixRules(cc.allowPrefixes),
			ask: toPrefixRules(cc.askPrefixes)
		};
	}
	const ds = config.dataSecurity;
	if (isObject$2(ds)) {
		const threshold = typeof ds.batchDeleteApprovalThreshold === "number" ? ds.batchDeleteApprovalThreshold : 0;
		policy.dataSecurity = {
			securityGatewayEnabled: typeof ds.secureGatewayEnabled === "boolean" ? ds.secureGatewayEnabled : void 0,
			transmissionEncryptionEnabled: typeof ds.transitEncryption === "boolean" ? ds.transitEncryption : void 0,
			deleteProtectionEnabled: ds.deleteProtection === true,
			batchDeleteApprovalThreshold: threshold,
			safeDeleteRuntimeEnabled: ds.deleteProtection === true
		};
	}
	const rt = config.runtime;
	if (isObject$2(rt)) {
		const tools = isObject$2(rt.tools) ? rt.tools : {};
		policy.bundledRuntime = {
			enabled: rt.enabled !== false,
			tools: {
				node: tools.nodejs !== false,
				python: tools.python !== false,
				gitBash: tools.gitBash !== false,
				brokeredShell: tools.brokeredShell !== false
			}
		};
	}
	return policy;
}
function setProductEndpointOverride(override) {
	productEndpointOverride = override;
}
function getProductEndpointOverride() {
	return productEndpointOverride;
}
WORKBUDDY_DEV_ENDPOINT_OVERRIDE_ENV = "WORKBUDDY_DEV_ENDPOINT_OVERRIDE";
productEndpointOverride = { resolve: () => void 0 };
_earlyEnvOverride = typeof process !== "undefined" ? process.env?.[WORKBUDDY_DEV_ENDPOINT_OVERRIDE_ENV] : void 0;
if (_earlyEnvOverride) setProductEndpointOverride({ resolve: () => _earlyEnvOverride });
// END ORIGINAL

return {isObject$2,toStringArray,toPrefixRules,translateRemoteSecurityCenter,setProductEndpointOverride,getProductEndpointOverride,WORKBUDDY_DEV_ENDPOINT_OVERRIDE_ENV};
}

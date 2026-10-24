// @ts-nocheck
// Original declarations and selected dependency initializers retained verbatim.
import * as nodeFs from 'node:fs';
import * as nodePath from 'node:path';
import * as nodeOs from 'node:os';
export const SERVICE_SOURCE={"sources":[{"file":"runtime-context.js","sha256":"9dc270ab82e397b64bf8984e840562236c5b46435a208e8204fc14ef6b112f43"}],"segments":[{"file":"runtime-context.js","from":277,"to":312},{"file":"runtime-context.js","from":313,"to":355},{"file":"runtime-context.js","from":356,"to":380},{"file":"runtime-context.js","from":381,"to":508},{"file":"runtime-context.js","from":509,"to":644},{"file":"runtime-context.js","from":645,"to":775},{"file":"runtime-context.js","from":776,"to":908},{"file":"runtime-context.js","from":909,"to":1058},{"file":"runtime-context.js","from":1059,"to":1198},{"file":"runtime-context.js","from":1199,"to":1381},{"file":"runtime-context.js","from":1382,"to":1567},{"file":"runtime-context.js","from":1568,"to":1697},{"file":"runtime-context.js","from":1698,"to":1861}],"names":["DEFAULT_APP_NAME","DEFAULT_CONFIG_DIRNAME","runtimeContext","configureWorkbuddyRuntimeContext","getWorkbuddyRuntimeAppName","getWorkbuddyRuntimeAppVersion","getWorkbuddyRuntimeAppPath","getWorkbuddyRuntimePromptTemplatesDir","getWorkbuddyRuntimeLocale","getWorkbuddyRuntimeConfigDir","getWorkbuddyRuntimeUserDataDir","getWorkbuddyRuntimeLogsDir","dropUndefined"]} as const;
export function createNativeSidecarRuntimeContext(runtime:any={}):any {
const process=runtime.process ?? globalThis.process, console=runtime.console ?? globalThis.console;
const node_path=nodePath,node_os=runtime.os ?? nodeOs;
// BEGIN ORIGINAL
var DEFAULT_APP_NAME = "WorkBuddy";
var DEFAULT_CONFIG_DIRNAME = ".workbuddy";
var runtimeContext = {};
function configureWorkbuddyRuntimeContext(options) {
	runtimeContext = {
		...runtimeContext,
		...dropUndefined(options)
	};
}
function getWorkbuddyRuntimeAppName() {
	return process.env.WORKBUDDY_APP_NAME?.trim() || runtimeContext.appName || DEFAULT_APP_NAME;
}
function getWorkbuddyRuntimeAppVersion() {
	return process.env.WORKBUDDY_APP_VERSION?.trim() || runtimeContext.appVersion || "";
}
function getWorkbuddyRuntimeAppPath() {
	return process.env.WORKBUDDY_APP_PATH?.trim() || runtimeContext.appPath || process.cwd();
}
function getWorkbuddyRuntimePromptTemplatesDir() {
	return process.env.WORKBUDDY_PROMPT_TEMPLATES_DIR?.trim() || runtimeContext.promptTemplatesDir;
}
function getWorkbuddyRuntimeLocale() {
	return process.env.WORKBUDDY_LOCALE?.trim() || runtimeContext.locale || process.env.LANG || "en";
}
function getWorkbuddyRuntimeConfigDir() {
	return process.env.WORKBUDDY_CONFIG_DIR?.trim() || runtimeContext.configDir || node_path.join(node_os.homedir(), DEFAULT_CONFIG_DIRNAME);
}
function getWorkbuddyRuntimeUserDataDir() {
	return process.env.WORKBUDDY_USER_DATA_DIR?.trim() || runtimeContext.userDataDir || node_path.join(getWorkbuddyRuntimeConfigDir(), "app");
}
function getWorkbuddyRuntimeLogsDir(...segments) {
	return node_path.join(getWorkbuddyRuntimeConfigDir(), "logs", ...segments);
}
function dropUndefined(value) {
	const result = {};
	for (const [key, entry] of Object.entries(value)) if (entry !== void 0) result[key] = entry;
	return result;
}
// END ORIGINAL
return {DEFAULT_APP_NAME,DEFAULT_CONFIG_DIRNAME,runtimeContext,configureWorkbuddyRuntimeContext,getWorkbuddyRuntimeAppName,getWorkbuddyRuntimeAppVersion,getWorkbuddyRuntimeAppPath,getWorkbuddyRuntimePromptTemplatesDir,getWorkbuddyRuntimeLocale,getWorkbuddyRuntimeConfigDir,getWorkbuddyRuntimeUserDataDir,getWorkbuddyRuntimeLogsDir,dropUndefined};
}

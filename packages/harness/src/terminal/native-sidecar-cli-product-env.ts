// @ts-nocheck
// Original declarations and selected dependency initializers retained verbatim.
import * as nodeFs from 'node:fs';
import * as nodePath from 'node:path';
import * as nodeOs from 'node:os';
export const SERVICE_SOURCE={"sources":[{"file":"cli-product-env.js","sha256":"24f55af8cb6e028e5755d0c9731f037acd0116a82ba80e557ad75a499258d7f2"},{"file":"common.js","sha256":"786cdfa0ec67e97753b4bc3e476f4582f10f4ccba694b5a9ec7de121478708a7"}],"segments":[{"file":"common.js","from":2542088,"to":2542511},{"file":"cli-product-env.js","from":219,"to":1105},{"file":"cli-product-env.js","from":1106,"to":2014},{"file":"cli-product-env.js","from":2015,"to":2351},{"file":"cli-product-env.js","from":2352,"to":2710},{"file":"cli-product-env.js","from":2711,"to":3393},{"file":"cli-product-env.js","from":3394,"to":4098},{"file":"cli-product-env.js","from":4099,"to":4431},{"file":"cli-product-env.js","from":4432,"to":4778},{"file":"cli-product-env.js","from":4779,"to":4929},{"file":"cli-product-env.js","from":4930,"to":5055},{"file":"cli-product-env.js","from":5147,"to":5165},{"file":"cli-product-env.js","from":5167,"to":5254},{"file":"cli-product-env.js","from":5256,"to":5322},{"file":"cli-product-env.js","from":5324,"to":5401}],"names":["resolveAgentCliProductEnv","resolveAgentCliProductEnvAsync","applyAgentCliHostedProductEnvironment","applyAgentCliHostedProductEnvironmentAsync","resolveAgentCliHostedInternetEnvironment","resolveAgentCliHostedInternetEnvironmentAsync","readAgentCliProductConfigJsonByKey","readAgentCliProductConfigJsonByKeyAsync","isAgentCliProductEnvironment","fsp","AGENT_CLI_PRODUCT_CONFIG_ENV_KEYS","AGENT_CLI_PRODUCT_CONFIG_PATH_ENV_KEY","AGENT_CLI_HOSTED_INTERNET_ENVIRONMENT_KEY","ProductEnviroment","ENV_KEY_CODEBUDDY_COPILOT_INTERNET_ENVIRONMENT"]} as const;
export function createNativeSidecarCliProductEnvironment(runtime:any={}):any {
const process=runtime.process ?? globalThis.process, console=runtime.console ?? globalThis.console;
const fs=runtime.fs ?? nodeFs;
var ProductEnviroment, ENV_KEY_CODEBUDDY_COPILOT_INTERNET_ENVIRONMENT;
// BEGIN ORIGINAL
ProductEnviroment = /* @__PURE__ */ function(ProductEnviroment) {
		ProductEnviroment["External"] = "external";
		ProductEnviroment["Internal"] = "internal";
		ProductEnviroment["IOA"] = "iOA";
		ProductEnviroment["Selfhosted"] = "selfhosted";
		ProductEnviroment["Cloudhosted"] = "cloudhosted";
		return ProductEnviroment;
	}({});
	ENV_KEY_CODEBUDDY_COPILOT_INTERNET_ENVIRONMENT = "CODEBUDDY_COPILOT_INTERNET_ENVIRONMENT";
const require_common={ProductEnviroment,ENV_KEY_CODEBUDDY_COPILOT_INTERNET_ENVIRONMENT};
function resolveAgentCliProductEnv({ processEnv = process.env, productConfigEnv, productConfigPathEnv, fallbackProductConfigEnv, fallbackProductConfigPathEnv } = {}) {
	const resolvedProductConfigPathEnv = productConfigPathEnv ?? processEnv["ACC_PRODUCT_CONFIG_PATH"] ?? fallbackProductConfigPathEnv;
	const resolvedProductConfigEnv = productConfigEnv ?? (resolvedProductConfigPathEnv ? void 0 : processEnv.ACC_PRODUCT_CONFIG_V3) ?? (resolvedProductConfigPathEnv ? void 0 : fallbackProductConfigEnv);
	const env = {
		ACC_PRODUCT_CONFIG_V3: resolvedProductConfigEnv,
		[AGENT_CLI_PRODUCT_CONFIG_PATH_ENV_KEY]: resolvedProductConfigPathEnv
	};
	applyAgentCliHostedProductEnvironment(env, processEnv);
	return {
		productConfigEnv: resolvedProductConfigEnv,
		productConfigPathEnv: resolvedProductConfigPathEnv,
		hostedCliInternetEnv: env[AGENT_CLI_HOSTED_INTERNET_ENVIRONMENT_KEY]
	};
}
async function resolveAgentCliProductEnvAsync({ processEnv = process.env, productConfigEnv, productConfigPathEnv, fallbackProductConfigEnv, fallbackProductConfigPathEnv } = {}) {
	const resolvedProductConfigPathEnv = productConfigPathEnv ?? processEnv["ACC_PRODUCT_CONFIG_PATH"] ?? fallbackProductConfigPathEnv;
	const resolvedProductConfigEnv = productConfigEnv ?? (resolvedProductConfigPathEnv ? void 0 : processEnv.ACC_PRODUCT_CONFIG_V3) ?? (resolvedProductConfigPathEnv ? void 0 : fallbackProductConfigEnv);
	const env = {
		ACC_PRODUCT_CONFIG_V3: resolvedProductConfigEnv,
		[AGENT_CLI_PRODUCT_CONFIG_PATH_ENV_KEY]: resolvedProductConfigPathEnv
	};
	await applyAgentCliHostedProductEnvironmentAsync(env, processEnv);
	return {
		productConfigEnv: resolvedProductConfigEnv,
		productConfigPathEnv: resolvedProductConfigPathEnv,
		hostedCliInternetEnv: env[AGENT_CLI_HOSTED_INTERNET_ENVIRONMENT_KEY]
	};
}
function applyAgentCliHostedProductEnvironment(env, processEnv = process.env) {
	const networkEnvironment = resolveAgentCliHostedInternetEnvironment(env, processEnv);
	if (networkEnvironment) env[AGENT_CLI_HOSTED_INTERNET_ENVIRONMENT_KEY] = networkEnvironment;
	else delete env[AGENT_CLI_HOSTED_INTERNET_ENVIRONMENT_KEY];
	return env;
}
async function applyAgentCliHostedProductEnvironmentAsync(env, processEnv = process.env) {
	const networkEnvironment = await resolveAgentCliHostedInternetEnvironmentAsync(env, processEnv);
	if (networkEnvironment) env[AGENT_CLI_HOSTED_INTERNET_ENVIRONMENT_KEY] = networkEnvironment;
	else delete env[AGENT_CLI_HOSTED_INTERNET_ENVIRONMENT_KEY];
	return env;
}
function resolveAgentCliHostedInternetEnvironment(env, processEnv = process.env) {
	const mergedEnv = env ? {
		...processEnv,
		...env
	} : processEnv;
	for (const key of AGENT_CLI_PRODUCT_CONFIG_ENV_KEYS) {
		const configValue = readAgentCliProductConfigJsonByKey(key, mergedEnv);
		if (!configValue) continue;
		try {
			const networkEnvironment = JSON.parse(configValue)?.networkEnvironment;
			if (isAgentCliProductEnvironment(networkEnvironment)) return networkEnvironment;
		} catch {}
	}
	const currentEnvironment = processEnv[require_common.ENV_KEY_CODEBUDDY_COPILOT_INTERNET_ENVIRONMENT];
	if (isAgentCliProductEnvironment(currentEnvironment)) return currentEnvironment;
}
async function resolveAgentCliHostedInternetEnvironmentAsync(env, processEnv = process.env) {
	const mergedEnv = env ? {
		...processEnv,
		...env
	} : processEnv;
	for (const key of AGENT_CLI_PRODUCT_CONFIG_ENV_KEYS) {
		const configValue = await readAgentCliProductConfigJsonByKeyAsync(key, mergedEnv);
		if (!configValue) continue;
		try {
			const networkEnvironment = JSON.parse(configValue)?.networkEnvironment;
			if (isAgentCliProductEnvironment(networkEnvironment)) return networkEnvironment;
		} catch {}
	}
	const currentEnvironment = processEnv[require_common.ENV_KEY_CODEBUDDY_COPILOT_INTERNET_ENVIRONMENT];
	if (isAgentCliProductEnvironment(currentEnvironment)) return currentEnvironment;
}
function readAgentCliProductConfigJsonByKey(key, env = process.env) {
	const inline = env[key];
	if (inline) return inline;
	if (key !== "ACC_PRODUCT_CONFIG_V3") return;
	const filePath = env[AGENT_CLI_PRODUCT_CONFIG_PATH_ENV_KEY];
	if (!filePath) return;
	try {
		return fs.readFileSync(filePath, "utf8");
	} catch {
		return;
	}
}
async function readAgentCliProductConfigJsonByKeyAsync(key, env = process.env) {
	const inline = env[key];
	if (inline) return inline;
	if (key !== "ACC_PRODUCT_CONFIG_V3") return;
	const filePath = env[AGENT_CLI_PRODUCT_CONFIG_PATH_ENV_KEY];
	if (!filePath) return;
	try {
		return await fsp.readFile(filePath, "utf8");
	} catch {
		return;
	}
}
function isAgentCliProductEnvironment(value) {
	return typeof value === "string" && Object.values(require_common.ProductEnviroment).includes(value);
}
var fsp, AGENT_CLI_PRODUCT_CONFIG_ENV_KEYS, AGENT_CLI_PRODUCT_CONFIG_PATH_ENV_KEY, AGENT_CLI_HOSTED_INTERNET_ENVIRONMENT_KEY;
fsp = fs.promises;
AGENT_CLI_PRODUCT_CONFIG_ENV_KEYS = ["ACC_PRODUCT_CONFIG_V3", "ACC_PRODUCT_CONFIG_V2"];
AGENT_CLI_PRODUCT_CONFIG_PATH_ENV_KEY = "ACC_PRODUCT_CONFIG_PATH";
AGENT_CLI_HOSTED_INTERNET_ENVIRONMENT_KEY = "CODEBUDDY_INTERNET_ENVIRONMENT";
// END ORIGINAL
return {resolveAgentCliProductEnv,resolveAgentCliProductEnvAsync,applyAgentCliHostedProductEnvironment,applyAgentCliHostedProductEnvironmentAsync,resolveAgentCliHostedInternetEnvironment,resolveAgentCliHostedInternetEnvironmentAsync,readAgentCliProductConfigJsonByKey,readAgentCliProductConfigJsonByKeyAsync,isAgentCliProductEnvironment,fsp,AGENT_CLI_PRODUCT_CONFIG_ENV_KEYS,AGENT_CLI_PRODUCT_CONFIG_PATH_ENV_KEY,AGENT_CLI_HOSTED_INTERNET_ENVIRONMENT_KEY,ProductEnviroment,ENV_KEY_CODEBUDDY_COPILOT_INTERNET_ENVIRONMENT};
}

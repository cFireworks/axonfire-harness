// @ts-nocheck
// Original Desktop environment file and development endpoint providers.
import * as node_path from 'node:path';import {fileURLToPath} from 'node:url';import {createNativeDesktopProductInterceptors} from '../http/native-desktop-product-interceptors.js';
export const DESKTOP_ENVIRONMENT_PROVIDERS_SOURCE=[{"file":"common.js","sha256":"786cdfa0ec67e97753b4bc3e476f4582f10f4ccba694b5a9ec7de121478708a7","regions":[{"from":89890,"to":90639}]},{"file":"module-base.js","sha256":"edd9910d7cc967033c89a723f69ab449b59dd57aff78bcada77a973e95733a53","regions":[{"from":39701,"to":39756},{"from":40085,"to":40225},{"from":40226,"to":40517},{"from":41766,"to":43864}]}] as const;
export function createNativeDesktopEnvironmentProviders(runtime:any={}){
const process=runtime.process??globalThis.process,__dirname=runtime.dirname??node_path.dirname(fileURLToPath(import.meta.url));var ProductProviderPriority;
(function(_ProductProviderPriority) {
		_ProductProviderPriority.CLIENT = 5e3;
		_ProductProviderPriority.CLIENT_SETTINGS_ENDPOINT = 6e3;
		_ProductProviderPriority.CLOUD_PRE = 9999;
		_ProductProviderPriority.CLOUD = 1e4;
		_ProductProviderPriority.MODELS = 100100;
		_ProductProviderPriority.AGENTS = 100200;
		_ProductProviderPriority.AGENT_MODEL_RESOLVER = 100300;
		_ProductProviderPriority.CLIENT_SETTINGS = 11e3;
		_ProductProviderPriority.WORKSPACE = 15e3;
		_ProductProviderPriority.MODEL_SETTINGS = 18e3;
		_ProductProviderPriority.ENV = 2e4;
		_ProductProviderPriority.OPTIONS = 21e3;
		_ProductProviderPriority.MODEL_CHECK = 24e3;
		_ProductProviderPriority.DEFAULT = 25e3;
	})(ProductProviderPriority || (ProductProviderPriority = {}));
const interceptors=runtime.interceptors??createNativeDesktopProductInterceptors(runtime),require_common$2={ProductProviderPriority,setProductEndpointOverride:interceptors.setProductEndpointOverride};
var devEnvEndpointResolver = { resolve: () => void 0 };
function setDevEnvEndpointResolver(resolver) {
	devEnvEndpointResolver = resolver;
	require_common$2.setProductEndpointOverride(resolver);
}
var WorkbuddyDevEnvEndpointProductProvider = class WorkbuddyDevEnvEndpointProductProvider {
	priority = require_common$2.ProductProviderPriority.CLIENT - 1e3;
	async provide(_ctx) {
		const endpoint = devEnvEndpointResolver.resolve();
		if (!endpoint) return {};
		return { endpoint };
	}
};
var WorkbuddyInternetEnviromentProductProvider = class WorkbuddyInternetEnviromentProductProvider {
	priority = require_common$2.ProductProviderPriority.CLIENT + 5;
	fs;
	configBasePath;
	logger;
	cachedProducts = /* @__PURE__ */ new Map();
	init() {
		this.logger.setContext("WorkbuddyInternetEnviromentProductProvider");
	}
	async provide(ctx) {
		const environment = this.resolveEnvironment(ctx.current);
		if (!environment || !this.fs) return {};
		const cacheKey = environment.toLowerCase();
		if (this.cachedProducts.has(cacheKey)) return this.cachedProducts.get(cacheKey);
		const fileName = `product.${cacheKey}.json`;
		try {
			const productPath = this.resolveProductPath(fileName);
			if (!productPath) return {};
			const content = this.fs.readFileSync(productPath, { encoding: "utf-8" });
			const product = JSON.parse(content.toString());
			delete product.authentication;
			this.cachedProducts.set(cacheKey, product);
			return product;
		} catch (error) {
			this.logger.debug(`Failed to read ${fileName}`, error);
			return {};
		}
	}
	resolveEnvironment(current) {
		return process.env["CODEBUDDY_COPILOT_INTERNET_ENVIRONMENT"] || current.networkEnvironment || this.getNetworkEnvironmentFromConfigEnv(current.productConfigEnv);
	}
	resolveProductPath(fileName) {
		const candidates = [
			this.configBasePath ? node_path.join(this.configBasePath, fileName) : void 0,
			node_path.join(__dirname, fileName),
			node_path.join(__dirname, "..", fileName),
			node_path.join(__dirname, "..", "..", fileName)
		].filter((candidate) => !!candidate);
		for (const candidate of candidates) if (this.fs?.existsSync(candidate)) return candidate;
		this.logger.debug(`Failed to find ${fileName}`);
	}
	getNetworkEnvironmentFromConfigEnv(envKeyOrKeys) {
		if (!envKeyOrKeys) return;
		const keys = typeof envKeyOrKeys === "string" ? [envKeyOrKeys] : envKeyOrKeys;
		for (const key of keys) {
			const value = process.env[key];
			if (!value) continue;
			try {
				const config = JSON.parse(value);
				if (config.networkEnvironment) return config.networkEnvironment;
			} catch {}
		}
	}
};
return {ProductProviderPriority,interceptors,setDevEnvEndpointResolver,WorkbuddyDevEnvEndpointProductProvider,WorkbuddyInternetEnviromentProductProvider};
}

// @ts-nocheck
// Verbatim Desktop class and base declarations with explicit outer framework/Node bindings.
import * as nodeFs from 'node:fs';import * as nodeOs from 'node:os';import * as nodePath from 'node:path';import {createRequire} from 'node:module';import {BehaviorSubject} from 'rxjs';import {Emitter} from 'vscode-jsonrpc';import {createNativeAuthProductCoordinator} from './native-auth-product-coordinator.js';
const require=createRequire(import.meta.url);
export const DESKTOP_PRODUCT_MANAGER_SOURCE=[{"file":"common.js","sha256":"786cdfa0ec67e97753b4bc3e476f4582f10f4ccba694b5a9ec7de121478708a7","regions":[{"from":972247,"to":972490},{"from":676056,"to":677623},{"from":746589,"to":748561},{"from":972611,"to":972682},{"from":972684,"to":972709},{"from":972711,"to":972740},{"from":972742,"to":973141},{"from":973585,"to":973816},{"from":973818,"to":989015}]},{"file":"workbuddy-product-config.js","sha256":"3a3e001bb227550087d735d07e470a9d06ac8d29141ea1764e0eb48c6e467251","regions":[{"from":14424,"to":14765},{"from":19742,"to":19959},{"from":19960,"to":20386},{"from":15492,"to":15832}]},{"file":"workbuddy-auth-product-coordinator.js","sha256":"8624215504229c4b6190f5c2172da270e015cc96871e90b261786f047e4c6e78","regions":[{"from":2125693,"to":2125719},{"from":2125720,"to":2125811},{"from":2125812,"to":2133607}]}] as const;
export function createNativeDesktopProductManager(runtime:any={}) {
const process=runtime.process??globalThis.process,console=runtime.console??globalThis.console,fs=runtime.fs??nodeFs,os=runtime.os??nodeOs,path=nodePath;
const Date=runtime.Date??globalThis.Date,setTimeout=runtime.setTimeout??globalThis.setTimeout,clearTimeout=runtime.clearTimeout??globalThis.clearTimeout;
const dependencies=runtime.coordinatorApi??createNativeAuthProductCoordinator(runtime);
const import_common$42={Emitter:runtime.Emitter??Emitter,ContainerUtil:{get:()=>runtime.logger??console}};
var ObjectUtils,BooleanUtils,_bun,bunGzip,bunGunzip,_gzipSync,_gunzipSync,GzipUtils,_ProductManagerImpl,DataLevel,ProductManagerImpl;
const ProductFeature=dependencies.common.ProductFeature;
function getZlib() {
	if (!_gzipSync) {
		const zlib$2 = require(
			/* webpackIgnore: true */
			"zlib"
		);
		_gzipSync = zlib$2.gzipSync;
		_gunzipSync = zlib$2.gunzipSync;
	}
	return {
		gzipSync: _gzipSync,
		gunzipSync: _gunzipSync
	};
}
(function(_ObjectUtils) {
		function deepMergeWith(target, source, customizer) {
			if (source === void 0 || source === null) return target;
			if (typeof source !== "object" || typeof target !== "object") return source;
			const result = Array.isArray(target) ? [...target] : { ...target };
			for (const key of Object.keys(source)) {
				const customResult = customizer(result[key], source[key], key);
				if (customResult !== void 0) result[key] = customResult;
				else if (typeof source[key] === "object" && source[key] !== null && !Array.isArray(source[key]) && typeof result[key] === "object" && result[key] !== null && !Array.isArray(result[key])) result[key] = deepMergeWith(result[key], source[key], customizer);
				else result[key] = source[key];
			}
			return result;
		}
		function merge(...objects) {
			const customize = (objValue, srcValue) => {
				if (Array.isArray(objValue)) return srcValue;
			};
			const last = objects[objects.length - 1];
			const customizer = typeof last === "function" ? last : customize;
			const sources = typeof last === "function" ? objects.slice(0, -1) : objects;
			let result = sources[0];
			for (let i = 1; i < sources.length; i++) result = deepMergeWith(result, sources[i], customizer);
			return result;
		}
		_ObjectUtils.merge = merge;
		function isChanged(obj, newObj) {
			return JSON.stringify(obj) !== JSON.stringify(newObj);
		}
		_ObjectUtils.isChanged = isChanged;
		function copy(obj) {
			return JSON.parse(JSON.stringify(obj));
		}
		_ObjectUtils.copy = copy;
	})(ObjectUtils || (ObjectUtils = {}));
BooleanUtils = class {
		/**
		* 检查字符串是否表示 "true"
		* 支持多种表示 true 的值: "1", "true", "yes", "on"
		*
		* @param value 要检查的值
		* @returns 是否为 truthy 值
		*
		* @example
		* ```typescript
		* BooleanUtils.isTruthy('1')      // true
		* BooleanUtils.isTruthy('true')   // true
		* BooleanUtils.isTruthy('yes')    // true
		* BooleanUtils.isTruthy('on')     // true
		* BooleanUtils.isTruthy('false')  // false
		* BooleanUtils.isTruthy(undefined) // false
		* ```
		*/
		static isTruthy(value) {
			if (!value) return false;
			if (typeof value === "boolean") return value;
			const normalized = value.toLowerCase().trim();
			return [
				"1",
				"true",
				"yes",
				"on"
			].includes(normalized);
		}
		/**
		* 检查字符串是否表示 "false"
		* 支持多种表示 false 的值: "0", "false", "no", "off"
		*
		* @param value 要检查的值
		* @returns 是否为 falsy 值
		*
		* @example
		* ```typescript
		* BooleanUtils.isFalsy('0')       // true
		* BooleanUtils.isFalsy('false')   // true
		* BooleanUtils.isFalsy('no')      // true
		* BooleanUtils.isFalsy('off')     // true
		* BooleanUtils.isFalsy('true')    // false
		* BooleanUtils.isFalsy(undefined) // false
		* ```
		*/
		static isFalsy(value) {
			if (value === void 0) return false;
			if (typeof value === "boolean") return !value;
			if (!value) return false;
			const normalized = value.toLowerCase().trim();
			return [
				"0",
				"false",
				"no",
				"off"
			].includes(normalized);
		}
		/**
		* 将字符串转换为布尔值
		*
		* @param value 要转换的值
		* @param defaultValue 默认值（当无法确定时返回）
		* @returns 转换后的布尔值
		*
		* @example
		* ```typescript
		* BooleanUtils.toBoolean('true')           // true
		* BooleanUtils.toBoolean('false')          // false
		* BooleanUtils.toBoolean('invalid', true)  // true (使用默认值)
		* BooleanUtils.toBoolean(undefined, false) // false (使用默认值)
		* ```
		*/
		static toBoolean(value, defaultValue = false) {
			if (this.isTruthy(value)) return true;
			if (this.isFalsy(value)) return false;
			return defaultValue;
		}
	};
_bun = typeof globalThis.Bun !== "undefined" ? globalThis.Bun : void 0;
bunGzip = _bun?.gzipSync;
bunGunzip = _bun?.gunzipSync;
GzipUtils = class {
		static compress(input) {
			if (bunGzip) return Buffer.from(bunGzip(Buffer.from(input))).toString("base64");
			return getZlib().gzipSync(input).toString("base64");
		}
		static decompress(input) {
			const buf = Buffer.from(input, "base64");
			if (bunGunzip) return Buffer.from(bunGunzip(buf)).toString("utf-8");
			return getZlib().gunzipSync(buf).toString("utf-8");
		}
	};
DataLevel = /* @__PURE__ */ function(DataLevel) {
		DataLevel[DataLevel["none"] = 0] = "none";
		DataLevel[DataLevel["cache"] = 1] = "cache";
		DataLevel[DataLevel["server"] = 2] = "server";
		return DataLevel;
	}(DataLevel || {});
ProductManagerImpl = class ProductManagerImpl {
		static {
			_ProductManagerImpl = this;
		}
		constructor() {
			this.onDidChangeEmitter = new import_common$42.Emitter();
			this.onDidChange = this.onDidChangeEmitter.event;
			this.lastSyncTime = 0;
			this.configuration = new BehaviorSubject(void 0);
			this.promise = Promise.resolve();
			this.dataLevel = DataLevel.none;
			this.lastProxySyncTime = 0;
		}
		static {
			this.cacheKeyPrefix = "CodeBuddy-Product-Cache";
		}
		static {
			this.endpointCacheKey = "CodeBuddy-Endpoint-Cache";
		}
		static {
			this.envCacheKey = "CodeBuddy-Environment-Cache";
		}
		static {
			this.ENV_KEY = "CODEBUDDY_INTERNET_ENVIRONMENT";
		}
		static {
			this.PRODUCT_VERSION_ENV_KEY = "CLIENT_INFO_PRODUCT_VERSION";
		}
		/**
		* 计算实际使用的 cache key。
		* 注入版本号 → `CodeBuddy-Product-Cache:<version>`（版本隔离）。
		* 未注入 → `CodeBuddy-Product-Cache`（兼容老的全局共享 key）。
		*/
		static getCacheKey() {
			const version = process.env?.[_ProductManagerImpl.PRODUCT_VERSION_ENV_KEY];
			return version ? `${_ProductManagerImpl.cacheKeyPrefix}:${version}` : _ProductManagerImpl.cacheKeyPrefix;
		}
		static {
			this.MAX_CACHE_TTL = 1e3 * 60 * 8;
		}
		static {
			this.PROXY_SYNC_THROTTLE_MS = 2e3;
		}
		init() {
			this.loadFromCache();
			this.sync();
		}
		loadFromCache() {
			if (BooleanUtils.isTruthy(process.env?.["CODEBUDDY_DISABLE_PRODUCT_CACHE"])) return;
			const getSync = this.localStorage.getSync?.bind(this.localStorage);
			if (!getSync) {
				this.loadFromCacheAsync();
				return;
			}
			try {
				const cachedEndpoint = getSync(_ProductManagerImpl.endpointCacheKey);
				if (cachedEndpoint) {
					this.cachedEndpoint = cachedEndpoint;
					this.currentEndpoint = cachedEndpoint;
				}
				const rawCache = getSync(_ProductManagerImpl.getCacheKey());
				let cache;
				if (typeof rawCache === "string") try {
					cache = JSON.parse(GzipUtils.decompress(rawCache));
				} catch {}
				else if (rawCache && typeof rawCache === "object") cache = rawCache;
				if (this.dataLevel >= DataLevel.cache || cache === void 0) return;
				this._configuration = cache;
				this.configuration.next(this._configuration);
				this.dataLevel = DataLevel.cache;
				if (!process.env[_ProductManagerImpl.ENV_KEY]) {
					const bootstrapEnv = _ProductManagerImpl.resolveNetworkEnvironmentFromProductConfigEnv(cache);
					if (bootstrapEnv) process.env[_ProductManagerImpl.ENV_KEY] = bootstrapEnv;
					else {
						const cachedEnv = getSync(_ProductManagerImpl.envCacheKey);
						if (cachedEnv) process.env[_ProductManagerImpl.ENV_KEY] = cachedEnv;
					}
				}
			} catch {}
		}
		/** Async fallback for environments without sync localStorage */
		async loadFromCacheAsync() {
			const cachedEndpoint = await this.localStorage.get(_ProductManagerImpl.endpointCacheKey);
			if (cachedEndpoint) {
				this.cachedEndpoint = cachedEndpoint;
				this.currentEndpoint = cachedEndpoint;
			}
			const rawCache = await this.localStorage.get(_ProductManagerImpl.getCacheKey());
			let cache;
			if (typeof rawCache === "string") try {
				cache = JSON.parse(GzipUtils.decompress(rawCache));
			} catch {}
			else if (rawCache && typeof rawCache === "object") cache = rawCache;
			if (this.dataLevel >= DataLevel.cache || cache === void 0) return;
			this._configuration = cache;
			this.configuration.next(this._configuration);
			this.dataLevel = DataLevel.cache;
			if (!process.env[_ProductManagerImpl.ENV_KEY]) {
				const bootstrapEnv = _ProductManagerImpl.resolveNetworkEnvironmentFromProductConfigEnv(cache);
				if (bootstrapEnv) process.env[_ProductManagerImpl.ENV_KEY] = bootstrapEnv;
				else {
					const cachedEnv = await this.localStorage.get(_ProductManagerImpl.envCacheKey);
					if (cachedEnv) process.env[_ProductManagerImpl.ENV_KEY] = cachedEnv;
				}
			}
		}
		/**
		* Resolve networkEnvironment from the bootstrap product config env variables
		* (e.g. ACC_PRODUCT_CONFIG_V3). When the CLI is spawned as a child process,
		* the parent injects a fresh product snapshot via these env vars — its
		* networkEnvironment is more authoritative than the localStorage cache.
		*/
		static resolveNetworkEnvironmentFromProductConfigEnv(config) {
			const envKeys = config?.productConfigEnv;
			if (!envKeys) return;
			const keys = typeof envKeys === "string" ? [envKeys] : envKeys;
			for (const key of keys) {
				const raw = process.env[key];
				if (!raw) continue;
				try {
					const parsed = JSON.parse(raw);
					if (parsed?.networkEnvironment) return parsed.networkEnvironment;
				} catch {}
			}
		}
		async saveToCache() {
			try {
				const configToCache = this._stableConfiguration ?? this._configuration;
				const jsonStr = JSON.stringify(configToCache);
				const compressed = await GzipUtils.compress(jsonStr);
				await this.localStorage.set(_ProductManagerImpl.getCacheKey(), compressed);
			} catch (error) {
				import_common$42.ContainerUtil.get(import_common$42.Logger).error(`Failed to save product cache: ${error}`, _ProductManagerImpl.name);
			}
			if (this.currentEndpoint && this.currentEndpoint !== this.cachedEndpoint) {
				this.cachedEndpoint = this.currentEndpoint;
				await this.localStorage.set(_ProductManagerImpl.endpointCacheKey, this.currentEndpoint);
			}
			const currentEnv = process.env[_ProductManagerImpl.ENV_KEY];
			if (currentEnv) await this.localStorage.set(_ProductManagerImpl.envCacheKey, currentEnv);
		}
		getEndpoint() {
			return this.currentEndpoint?.replace(/\/+$/, "") ?? "";
		}
		getCurrentConfiguration() {
			return this.currentConfiguration;
		}
		/**
		* 判断当前是否运行在预发环境。
		* 条件：当前 endpoint 与 currentConfiguration.stagingEndpoint 完全相等。
		* 未解析到 stagingEndpoint 时返回 false。
		*/
		isStagingEnv() {
			const staging = this.currentConfiguration?.stagingEndpoint;
			if (!staging) return false;
			return this.getEndpoint() === staging.replace(/\/+$/, "");
		}
		/**
		* 供 proxy get 拦截器使用的节流版 sync
		* - 节流：第一次调用立即执行,2s内的后续调用被合并
		* - 防抖：窗口期内的最后一次调用会在窗口结束后执行
		*/
		throttledSyncForProxy() {
			const now = Date.now();
			const timeSinceLastSync = now - this.lastProxySyncTime;
			if (timeSinceLastSync >= _ProductManagerImpl.PROXY_SYNC_THROTTLE_MS) {
				if (this.proxySyncThrottleTimer) {
					clearTimeout(this.proxySyncThrottleTimer);
					this.proxySyncThrottleTimer = void 0;
				}
				this.lastProxySyncTime = now;
				this.sync();
				return;
			}
			if (this.proxySyncThrottleTimer) clearTimeout(this.proxySyncThrottleTimer);
			const delay = _ProductManagerImpl.PROXY_SYNC_THROTTLE_MS - timeSinceLastSync;
			this.proxySyncThrottleTimer = setTimeout(() => {
				this.proxySyncThrottleTimer = void 0;
				this.lastProxySyncTime = Date.now();
				this.sync();
			}, delay);
		}
		/**
		* 同步产品配置
		* @param force 是否强制同步(跳过缓存)
		*/
		async sync(force) {
			this.lastSyncTime = Date.now();
			this.promise = this.promise.finally(() => this.doSync(force));
			return this.promise;
		}
		/**
		* Rebuild only the runtime-only Product layer.
		*
		* Plugin, CLI-option and SDK-initialize providers are volatile: their
		* output belongs to the current process/request and must not be persisted.
		* Replaying them from the last stable baseline both removes stale plugin
		* entries and preserves the original provider order, without entering the
		* Cloud/Models provider chain.
		*/
		async syncVolatileProviders(force) {
			this.lastSyncTime = Date.now();
			this.promise = this.promise.finally(() => this.doSyncVolatileProviders(force));
			return this.promise;
		}
		async doSyncVolatileProviders(force) {
			const providers = [...await this.productProviderProvider.sort()].reverse().filter((provider) => provider.volatile);
			const stableBase = this._stableConfiguration ?? this._configuration ?? {};
			const ctx = {
				force: !!force,
				current: this.cloneConfiguration(stableBase)
			};
			try {
				for (const productProvider of providers) {
					const config = await productProvider.provide(ctx);
					ctx.current = await this.productMerger.merge(ctx.current, config);
					this.currentConfiguration = ctx.current;
				}
			} catch (error) {
				try {
					import_common$42.ContainerUtil.get(import_common$42.Logger).error(`Error while syncing volatile product providers: ${error}`, _ProductManagerImpl.name);
				} catch (error2) {
					console.error(`Error while syncing volatile product providers: ${error2}`);
				}
			}
			if (ctx.current.endpoint) this.currentEndpoint = ctx.current.endpoint;
			this.currentConfiguration = ctx.current;
			this.applyProductFeatureFilters(ctx.current);
			if (!ObjectUtils.isChanged(this._configuration, ctx.current)) return;
			this._configuration = ctx.current;
			const proxy = new Proxy(ctx.current, { get: (target, p) => {
				if (Date.now() - this.lastSyncTime > 48e4) this.throttledSyncForProxy();
				return target[p];
			} });
			this.dataLevel = DataLevel.server;
			this.configuration.next(proxy);
			this.onDidChangeEmitter.fire();
		}
		async doSync(force) {
			const sorted = await this.productProviderProvider.sort();
			const baseFromStable = this._stableConfiguration ? this.cloneConfiguration(this._stableConfiguration) : {};
			const ctx = {
				force: !!force,
				current: baseFromStable
			};
			const independentProviderNames = new Set([
				"McpPromptProductProvider",
				"CustomAgentsProductProvider",
				"CustomCommandsProductProvider",
				"ApiKeyHelperProductProvider",
				"SkillProductProvider",
				"PluginsProductProvider"
			]);
			const endpointModifyingNames = new Set([
				"ClientProductProvider",
				"SettingsEndpointProductProvider",
				"ClientInternetEnviromentProductProvider",
				"WorkbuddyDevEnvEndpointProductProvider"
			]);
			const endpointDependentNames = new Set(["CloudProductProvider", "ModelsProductProvider"]);
			const independentPromises = /* @__PURE__ */ new Map();
			const providers = [...sorted].reverse();
			let lastEndpointModifier;
			for (const provider of providers) if (endpointModifyingNames.has(provider.constructor.name)) lastEndpointModifier = provider;
			for (const provider of providers) if (independentProviderNames.has(provider.constructor.name)) independentPromises.set(provider, provider.provide(ctx).catch((error) => {
				import_common$42.ContainerUtil.get(import_common$42.Logger).debug(`Error in independent provider ${provider.constructor.name}: ${error}`);
				return {};
			}));
			const stableProviderConfigs = [];
			let hasVolatileProvider = false;
			try {
				for (const productProvider of providers) {
					let config;
					if (independentPromises.has(productProvider)) config = await independentPromises.get(productProvider);
					else config = await productProvider.provide(ctx);
					if (productProvider.volatile) hasVolatileProvider = true;
					else stableProviderConfigs.push(config);
					ctx.current = await this.productMerger.merge(ctx.current, config);
					this.currentConfiguration = ctx.current;
					const newConfigUrl = ctx.current.config?.url;
					if (this.previousConfigUrl !== newConfigUrl) {
						import_common$42.ContainerUtil.get(import_common$42.Logger).info(`[ProductManager] config.url 变更: 从 "${this.previousConfigUrl ?? "undefined"}" 变更为 "${newConfigUrl ?? "undefined"}" (Provider: ${productProvider.constructor.name})`);
						this.previousConfigUrl = newConfigUrl;
					}
					if (productProvider === lastEndpointModifier && ctx.current.endpoint) {
						for (const p of providers) if (endpointDependentNames.has(p.constructor.name) && !independentPromises.has(p)) independentPromises.set(p, p.provide(ctx).catch((error) => {
							import_common$42.ContainerUtil.get(import_common$42.Logger).debug(`Error in endpoint-dependent provider ${p.constructor.name}: ${error}`);
							return {};
						}));
					}
				}
			} catch (error) {
				try {
					import_common$42.ContainerUtil.get(import_common$42.Logger).error(`Error while syncing product configuration: ${error}`, _ProductManagerImpl.name);
				} catch (error2) {
					console.error(`Error while syncing product configuration: ${error2}`);
				}
			}
			if (ctx.current.endpoint) this.currentEndpoint = ctx.current.endpoint;
			this.applyProductFeatureFilters(ctx.current);
			if (hasVolatileProvider) {
				let stableConfig = {};
				for (const config of stableProviderConfigs) stableConfig = await this.productMerger.merge(stableConfig, config);
				this._stableConfiguration = stableConfig;
			} else this._stableConfiguration = void 0;
			if (!ObjectUtils.isChanged(this._configuration, ctx.current)) return;
			this._configuration = ctx.current;
			const proxy = new Proxy(ctx.current, { get: (target, p) => {
				if (Date.now() - this.lastSyncTime > 48e4) this.throttledSyncForProxy();
				return target[p];
			} });
			this.dataLevel = DataLevel.server;
			this.configuration.next(proxy);
			this.onDidChangeEmitter.fire();
			this.saveToCache();
		}
		async waitConfiguration(waitSync = false) {
			if (waitSync) await this.promise;
			return new Promise((resolve) => {
				const subscription = this.configuration.subscribe((config) => {
					if (config) {
						resolve(config);
						setTimeout(() => {
							subscription.unsubscribe();
						}, 0);
					}
				});
			});
		}
		/**
		* 深克隆产品配置，用于在 doSync 入口将 _stableConfiguration 作为本轮合并 base 时
		* 避免 provider 链直接修改上一轮稳定快照。
		*
		* ProductConfiguration 是已知的 JSON 可序列化结构（types/product.ts），使用
		* JSON 往返足够；如未来引入非可序列化字段（Date / Map / Set 等）需要替换实现。
		*/
		cloneConfiguration(config) {
			return JSON.parse(JSON.stringify(config));
		}
		/**
		* 根据 productFeatures 过滤配置
		* 将配置过滤逻辑集中在此处，确保所有消费配置的地方都能获得一致的结果
		*/
		applyProductFeatureFilters(config) {
			if (config.productFeatures?.[ProductFeature.DisableTerminalVariable] && config.variables) config.variables = config.variables.filter((v) => v.type !== "terminal");
			if (config.productFeatures?.[ProductFeature.DisableMultimodalGeneration]) {
				if (config.agents) {
					const noMultimodalNotice = `

<capability_constraints>
IMPORTANT: 当前产品不支持视频生成、3D 模型生成、图片视频特效等多模态内容生成能力。当用户请求生成视频、3D 模型、动画或类似多媒体内容时，请直接告知用户该功能暂不可用，不要尝试搜索或调用任何相关 skill / tool（包括但不限于 ToolSearch、Skill、workbuddy_search_marketplace_skill 等去查找视频/3D 相关能力）。
IMPORTANT: This product does not support video generation, 3D model generation, or any multimodal/multimedia content generation. When the user requests such content, decline directly and do NOT attempt to search for or invoke any related skill or tool (including but not limited to ToolSearch / Skill / workbuddy_search_marketplace_skill).
</capability_constraints>`;
					config.agents = config.agents.map((agent) => {
						if (!agent.tags?.includes("default")) return agent;
						if (agent.appendInstructions?.includes("<capability_constraints>")) return agent;
						return {
							...agent,
							appendInstructions: (agent.appendInstructions ?? "") + noMultimodalNotice
						};
					});
				}
			}
			if (config.disabledBuiltinSkills?.length && config.skills) {
				const disabled = new Set(config.disabledBuiltinSkills);
				config.skills = config.skills.filter((skill) => {
					if (skill.source !== "bundled") return true;
					const segments = skill.baseDirectory.replace(/[\\/]+$/, "").split(/[\\/]/);
					const dirName = segments[segments.length - 1] ?? "";
					return !disabled.has(dirName);
				});
			}
		}
	};
const {hasProductExperimentOverlay,applyProductExperimentOverlay}=dependencies;
const {tryGetWorkbuddyBaseProductConfiguration,resolveWorkbuddyProductEnvironmentFromSession}=dependencies.productConfig;
const require_common$2={...dependencies.common,ProductManagerImpl,ObjectUtils},require_dev_env_override=dependencies.devEnvironment,import_common=runtime.di;
function getWorkbuddyAuthenticationConfiguration() {
	const auth = tryGetWorkbuddyBaseProductConfiguration()?.authentication;
	if (!auth) return;
	if (process.env.NODE_ENV === "development") {
		const baseId = auth.id ?? "workbuddy-desktop";
		if (!baseId.endsWith("-dev")) return {
			...auth,
			id: `${baseId}-dev`
		};
	}
	return auth;
}
function getWorkbuddyAuthFilePath() {
	const authenticationId = getWorkbuddyAuthenticationConfiguration()?.id;
	if (!authenticationId) return;
	return path.join(getSharedAuthDirectory(), `${authenticationId}.info`);
}
function getSharedAuthDirectory() {
	switch (process.platform) {
		case "darwin": return path.join(os.homedir(), "Library", "Application Support", "CodeBuddyExtension", "Data", "Public", "auth");
		case "win32": return path.join(os.homedir(), "AppData", "Local", "CodeBuddyExtension", "Data", "Public", "auth");
		default: return path.join(os.homedir(), ".local", "share", "CodeBuddyExtension", "Data", "Public", "auth");
	}
}
function resolveWorkbuddyProductEnvironmentFromSessionFile() {
	const authPath = getWorkbuddyAuthFilePath();
	if (!authPath || !fs.existsSync(authPath) || fs.existsSync(`${authPath}.logged-out`)) return;
	try {
		return resolveWorkbuddyProductEnvironmentFromSession(JSON.parse(fs.readFileSync(authPath, "utf-8")));
	} catch {
		return;
	}
}
const require_workbuddy_product_config={...dependencies.productConfig,resolveWorkbuddyProductEnvironmentFromSessionFile};
var SERVER_DATA_LEVEL = 2;
var NOOP_LOGGER = {
	info: () => {},
	warn: () => {},
	error: () => {},
	debug: () => {}
};
var WorkbuddyProductManager = class WorkbuddyProductManager extends require_common$2.ProductManagerImpl {
	localConfiguration = {};
	/** 自定义模型 provider 的独立输出，用于在 overlay merge 后重新叠加 */
	customModelsOverride = {};
	/** 企业模型 provider 的独立输出，用于在远端 overlay merge 后叠加 */
	enterpriseModelsOverride = {};
	resolvedOverlay;
	/** TAB 实验配置 overlay，仅保存在内存中，按顶层 key 替换最终 product 配置。 */
	experimentOverlay;
	async doSync(force) {
		const providers = [...await this.productProviderProvider.sort()].reverse().filter((provider) => !this.isExternallyOwnedProvider(provider));
		let localConfig = {};
		const stableProviderConfigs = [];
		let hasVolatileProvider = false;
		let customModelsConfig = {};
		let enterpriseModelsConfig = {};
		try {
			for (const productProvider of providers) {
				const config = await productProvider.provide({
					force: !!force,
					current: localConfig
				});
				if (productProvider.volatile) hasVolatileProvider = true;
				else stableProviderConfigs.push(config);
				if (this.isCustomModelsProvider(productProvider)) customModelsConfig = config;
				if (this.isEnterpriseModelsProvider(productProvider)) enterpriseModelsConfig = config;
				localConfig = await this.productMerger.merge(localConfig, config);
				this.trackConfigUrlChange(localConfig, productProvider);
				if (localConfig.endpoint) this.currentEndpoint = localConfig.endpoint;
			}
		} catch (error) {
			console.error(`[ProductManager] Error while syncing product configuration: ${error}`);
		}
		this.localConfiguration = localConfig;
		this.customModelsOverride = customModelsConfig;
		this.enterpriseModelsOverride = enterpriseModelsConfig;
		this._stableConfiguration = hasVolatileProvider ? await this.buildStableConfiguration(stableProviderConfigs) : localConfig;
		await this.publishResolvedConfiguration();
	}
	getLocalConfiguration() {
		return this.localConfiguration;
	}
	async setResolvedOverlay(overlay) {
		this.resolvedOverlay = overlay;
		await this.publishResolvedConfiguration();
	}
	getExperimentOverlay() {
		return this.experimentOverlay;
	}
	async setExperimentOverlay(overlay) {
		this.experimentOverlay = overlay;
		await this.publishResolvedConfiguration();
	}
	isExternallyOwnedProvider(provider) {
		return provider.constructor.name === "EnvProductProvider" || provider.constructor.name === "CloudProductProvider" || provider.constructor.name === "CustomModelsProductProvider" || provider.constructor.name === "ModelsProductProvider" || provider.constructor.name === "WorkspaceProductProvider" || provider.constructor.name === "AvailableModelsFilterProvider";
	}
	isCustomModelsProvider(provider) {
		return provider.constructor.name === "WorkbuddyCustomModelsProductProvider";
	}
	isEnterpriseModelsProvider(provider) {
		return provider.constructor.name === "WorkbuddyEnterpriseModelsProductProvider";
	}
	async buildStableConfiguration(stableProviderConfigs) {
		let stableConfig = {};
		for (const config of stableProviderConfigs) stableConfig = await this.productMerger.merge(stableConfig, config);
		return stableConfig;
	}
	async publishResolvedConfiguration() {
		let logger;
		try {
			logger = import_common.ContainerUtil.get(import_common.Logger);
		} catch {
			logger = NOOP_LOGGER;
		}
		const localModelsCount = (this.localConfiguration ?? {}).models?.length ?? 0;
		const overlayModelsCount = (this.resolvedOverlay ?? {}).models?.length ?? 0;
		let resolvedConfig = await this.productMerger.merge(this.localConfiguration ?? {}, this.resolvedOverlay ?? {});
		const afterMergeModelsCount = resolvedConfig.models?.length ?? 0;
		logger.info(`[Merge] Step 1 (local + overlay): localModels=${localModelsCount}, overlayModels=${overlayModelsCount}, mergedModels=${afterMergeModelsCount}`);
		const environmentProduct = require_workbuddy_product_config.getWorkbuddyEnvironmentProductConfiguration(resolvedConfig.networkEnvironment ?? require_workbuddy_product_config.resolveWorkbuddyProductEnvironmentFromSessionFile());
		if (environmentProduct?.productFeatures) resolvedConfig = {
			...resolvedConfig,
			productFeatures: {
				...resolvedConfig.productFeatures,
				...environmentProduct.productFeatures
			}
		};
		console.log("[WorkbuddyProductManager] publishResolvedConfiguration 合并后 Connector:", resolvedConfig.productFeatures?.Connector);
		if (hasProductExperimentOverlay(this.experimentOverlay)) {
			const beforeModelsCount = resolvedConfig.models?.length ?? 0;
			const beforeProductFeaturesCount = Object.keys(resolvedConfig.productFeatures ?? {}).length;
			const overlayKeys = Object.keys(this.experimentOverlay ?? {});
			resolvedConfig = applyProductExperimentOverlay(resolvedConfig, this.experimentOverlay);
			logger.info(`[ExperimentConfig] Apply overlay: keys=${overlayKeys.join(",") || "(empty)"}, beforeModels=${beforeModelsCount}, afterModels=${resolvedConfig.models?.length ?? 0}, beforeProductFeatures=${beforeProductFeaturesCount}, afterProductFeatures=${Object.keys(resolvedConfig.productFeatures ?? {}).length}`);
		}
		const enterpriseModelsCount = this.enterpriseModelsOverride.models?.length ?? 0;
		if (this.enterpriseModelsOverride.models?.length) resolvedConfig = await this.productMerger.merge(resolvedConfig, {
			...this.enterpriseModelsOverride,
			mergeStrategy: require_common$2.MergeStrategy.DeepSmartMerge
		});
		logger.info(`[Merge] Step 2 (+enterprise): enterpriseModels=${enterpriseModelsCount}, totalModels=${resolvedConfig.models?.length ?? 0}`);
		const customModelsCount = this.customModelsOverride.models?.length ?? 0;
		if (this.customModelsOverride.models?.length) resolvedConfig = await this.productMerger.merge(resolvedConfig, {
			...this.customModelsOverride,
			mergeStrategy: require_common$2.MergeStrategy.SmartMerge
		});
		logger.info(`[Merge] Step 3 (+custom): customModels=${customModelsCount}, totalModels=${resolvedConfig.models?.length ?? 0}`);
		const mergedPromotions = require_workbuddy_product_config.mergeNamedArrayLayers(this.localConfiguration?.modelPromotions, environmentProduct?.modelPromotions, this.resolvedOverlay?.modelPromotions);
		resolvedConfig = {
			...resolvedConfig,
			modelPromotions: mergedPromotions
		};
		resolvedConfig = this.applyAvailableModelsFilter(resolvedConfig);
		const cliAgent = resolvedConfig.agents?.find((a) => a.name === "cli");
		logger.info(`[Merge] Step 4 (availableModels filter): finalModels=${resolvedConfig.models?.length ?? 0}` + (cliAgent ? `, cli.models=${JSON.stringify(cliAgent.models)}` : ""));
		this.applyProductFeatureFilters(resolvedConfig);
		const endpointOverride = require_dev_env_override.resolveEndpointOverride();
		if (endpointOverride) resolvedConfig = {
			...resolvedConfig,
			endpoint: endpointOverride
		};
		const isChanged = require_common$2.ObjectUtils.isChanged(this._configuration, resolvedConfig);
		this.currentConfiguration = resolvedConfig;
		if (resolvedConfig.endpoint) this.currentEndpoint = resolvedConfig.endpoint;
		if (!isChanged) return;
		this._configuration = resolvedConfig;
		const proxy = new Proxy(resolvedConfig, { get: (target, p) => {
			if (Date.now() - this.lastSyncTime > 48e4) this.throttledSyncForProxy();
			return target[p];
		} });
		this.dataLevel = SERVER_DATA_LEVEL;
		this.configuration.next(proxy);
		this.onDidChangeEmitter.fire();
		await this.saveToCache();
	}
	applyAvailableModelsFilter(config) {
		if (!config.models || !config.availableModels?.length) return config;
		return {
			...config,
			models: config.models.filter((model) => config.availableModels?.includes(model.id))
		};
	}
	trackConfigUrlChange(config, provider) {
		const newConfigUrl = config.config?.url;
		if (this.previousConfigUrl === newConfigUrl) return;
		this.previousConfigUrl = newConfigUrl;
	}
	getEndpoint() {
		return require_dev_env_override.resolveEndpointOverride() ?? super.getEndpoint();
	}
};
return {WorkbuddyProductManager,ProductManagerImpl,DataLevel,ObjectUtils,BooleanUtils,GzipUtils,getWorkbuddyAuthenticationConfiguration,productConfig:require_workbuddy_product_config};
}

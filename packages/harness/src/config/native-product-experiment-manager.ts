// @ts-nocheck
// Original declarations; only timer boundaries and outer DI assembly are host-bound.
export const PRODUCT_EXPERIMENT_SOURCE={"file":"workbuddy-auth-product-coordinator.js","sha256":"8624215504229c4b6190f5c2172da270e015cc96871e90b261786f047e4c6e78","names":["hasProductExperimentOverlay","DEFAULT_EXPERIMENT_CONFIG_PATH","DEFAULT_EXPERIMENT_POLLING_INTERVAL_MS","MIN_EXPERIMENT_POLLING_INTERVAL_MS","hasExperimentId","WorkbuddyProductExperimentManager"],"regions":[{"from":2123314,"to":2123461},{"from":2134045,"to":2134120},{"from":2134121,"to":2134176},{"from":2134177,"to":2134227},{"from":2134228,"to":2134377},{"from":2134378,"to":2140551}]} as const;
export function createNativeProductExperimentManager(runtime:any={}) {
const setInterval=runtime.setInterval??globalThis.setInterval,clearInterval=runtime.clearInterval??globalThis.clearInterval;
function hasProductExperimentOverlay(overlay) {
	if (!overlay) return false;
	return Object.keys(overlay).some((key) => overlay[key] !== void 0);
}
var DEFAULT_EXPERIMENT_CONFIG_PATH = "/v2/feature-flag/api/product-config";
var DEFAULT_EXPERIMENT_POLLING_INTERVAL_MS = 900 * 1e3;
var MIN_EXPERIMENT_POLLING_INTERVAL_MS = 60 * 1e3;
function hasExperimentId(data) {
	if (data?.exp_id === void 0 || data.exp_id === null) return false;
	return String(data.exp_id).trim().length > 0;
}
var WorkbuddyProductExperimentManager = class WorkbuddyProductExperimentManager {
	logger;
	restOperations;
	productManager;
	authenticationManager;
	gitInfoCollector;
	syncQueue = Promise.resolve();
	pollingTimer;
	pollingIntervalMs;
	experimentOverlay;
	refreshGeneration = 0;
	init() {
		this.logger.setContext("WorkbuddyProductExperimentManager");
	}
	async waitReady() {
		await this.syncQueue;
	}
	getOverlay() {
		return this.experimentOverlay;
	}
	async refresh(product, session, options) {
		this.syncQueue = this.syncQueue.catch((error) => {
			this.logger.warn(`Previous experiment config refresh failed: ${error}`);
		}).then(() => this.doRefresh(product, session, options));
		return this.syncQueue;
	}
	async clear(reason = "clear") {
		this.refreshGeneration++;
		this.stopPolling(reason);
		if (!this.experimentOverlay) return;
		this.logger.info(`[ExperimentConfig] Clear overlay: reason=${reason}`);
		this.experimentOverlay = void 0;
		await this.productManager.setExperimentOverlay(void 0);
	}
	async doRefresh(product, session, _options) {
		const refreshGeneration = this.refreshGeneration;
		const effectiveSession = session ?? this.authenticationManager.currentSessionSubject.getValue();
		if (!effectiveSession) {
			await this.clear("no-session");
			return;
		}
		const effectiveProduct = product ?? await this.productManager.waitConfiguration();
		if (!this.isRefreshCurrent(refreshGeneration, effectiveSession)) {
			this.stopPolling("stale-session");
			return;
		}
		const experimentOptions = this.normalizeOptions(effectiveProduct.productFeatureExperiment);
		this.logger.info(`[ExperimentConfig] gate: enabled=${experimentOptions.enabled === true}, pollingEnabled=${experimentOptions.pollingEnabled === true}, intervalMs=${experimentOptions.pollingIntervalMs}, url=${DEFAULT_EXPERIMENT_CONFIG_PATH}`);
		if (experimentOptions.enabled !== true) {
			await this.clear("disabled");
			return;
		}
		try {
			const experimentProduct = await this.fetchExperimentProduct(experimentOptions, effectiveProduct, refreshGeneration, effectiveSession);
			if (!this.isRefreshCurrent(refreshGeneration, effectiveSession)) {
				this.stopPolling("stale-session");
				return;
			}
			if (!hasProductExperimentOverlay(experimentProduct)) {
				this.logger.info("[ExperimentConfig] Fetch empty: clear experiment overlay");
				this.experimentOverlay = void 0;
				await this.productManager.setExperimentOverlay(void 0);
				return;
			}
			this.experimentOverlay = experimentProduct;
			await this.productManager.setExperimentOverlay(experimentProduct);
			if (!this.isRefreshCurrent(refreshGeneration, effectiveSession)) {
				this.experimentOverlay = void 0;
				await this.productManager.setExperimentOverlay(void 0);
				this.stopPolling("stale-session");
				return;
			}
		} catch (error) {
			this.logger.warn(`[ExperimentConfig] Fetch failed: error=${error}`);
		} finally {
			if (this.isRefreshCurrent(refreshGeneration, effectiveSession)) this.updatePolling(experimentOptions);
			else this.stopPolling("stale-session");
		}
	}
	isRefreshCurrent(refreshGeneration, session) {
		return this.refreshGeneration === refreshGeneration && this.authenticationManager.currentSessionSubject.getValue() === session;
	}
	normalizeOptions(options) {
		const rawInterval = options?.pollingIntervalMs;
		const pollingIntervalMs = typeof rawInterval === "number" && Number.isFinite(rawInterval) ? Math.max(rawInterval, MIN_EXPERIMENT_POLLING_INTERVAL_MS) : DEFAULT_EXPERIMENT_POLLING_INTERVAL_MS;
		return {
			enabled: options?.enabled === true,
			pollingEnabled: options?.pollingEnabled === true,
			pollingIntervalMs
		};
	}
	async fetchExperimentProduct(_options, _product, refreshGeneration, session) {
		const startedAt = Date.now();
		const endpoint = this.productManager.getEndpoint();
		if (!endpoint) {
			this.logger.warn(`[ExperimentConfig] Fetch skipped: endpoint is missing, url=${DEFAULT_EXPERIMENT_CONFIG_PATH}`);
			return;
		}
		this.logger.info(`[ExperimentConfig] Fetch start: url=${DEFAULT_EXPERIMENT_CONFIG_PATH}`);
		const repos = await this.collectRepos();
		if (!this.isRefreshCurrent(refreshGeneration, session)) return;
		const responseData = (await this.restOperations.post(DEFAULT_EXPERIMENT_CONFIG_PATH, void 0, {
			timeout: 5e3,
			baseURL: endpoint,
			params: { repos: repos.map((item) => item.url) }
		}))?.data?.data;
		const hasExpId = hasExperimentId(responseData);
		const data = hasExpId ? responseData?.value ?? {} : {};
		this.logger.info(`[ExperimentConfig] Fetch success: expId=${responseData?.exp_id ?? "(empty)"}, ignored=${!hasExpId}, keys=${Object.keys(data).join(",") || "(empty)"}, models=${data.models?.length ?? 0}, elapsedMs=${Date.now() - startedAt}`);
		return data;
	}
	async collectRepos() {
		if (!this.gitInfoCollector) return [];
		try {
			return (await this.gitInfoCollector.collect())?.repositories ?? [];
		} catch (error) {
			this.logger.warn(`[ExperimentConfig] collect repos failed: ${error}`);
			return [];
		}
	}
	updatePolling(options) {
		if (options.enabled !== true || options.pollingEnabled !== true) {
			this.stopPolling("polling-disabled");
			return;
		}
		if (this.pollingTimer && this.pollingIntervalMs === options.pollingIntervalMs) return;
		this.stopPolling("restart");
		this.pollingIntervalMs = options.pollingIntervalMs;
		this.pollingTimer = setInterval(() => {
			this.refreshFromCurrentState().catch((error) => {
				this.logger.warn(`[ExperimentConfig] Polling refresh failed: ${error}`);
			});
		}, options.pollingIntervalMs);
		this.pollingTimer.unref?.();
		this.logger.info(`[ExperimentConfig] Polling started: intervalMs=${options.pollingIntervalMs}`);
	}
	stopPolling(reason) {
		if (!this.pollingTimer) {
			this.pollingIntervalMs = void 0;
			return;
		}
		clearInterval(this.pollingTimer);
		this.pollingTimer = void 0;
		this.pollingIntervalMs = void 0;
		this.logger.info(`[ExperimentConfig] Polling stopped: reason=${reason}`);
	}
	async refreshFromCurrentState() {
		const session = this.authenticationManager.currentSessionSubject.getValue();
		const product = await this.productManager.waitConfiguration();
		await this.refresh(product, session);
	}
};
return {hasProductExperimentOverlay,DEFAULT_EXPERIMENT_CONFIG_PATH,DEFAULT_EXPERIMENT_POLLING_INTERVAL_MS,MIN_EXPERIMENT_POLLING_INTERVAL_MS,hasExperimentId,WorkbuddyProductExperimentManager};
}

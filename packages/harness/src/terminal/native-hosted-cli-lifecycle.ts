// @ts-nocheck
import {createNativeAppCliEnvironment} from './native-app-cli-environment.js';
import {createNativeCliPrewarmPool} from './native-cli-prewarm-pool.js';
export const HOSTED_CLI_LIFECYCLE_SOURCE={"sources":[{"file":"initialize.js","sha256":"528d3bffc67c5244d1a641e0cfc13c2be4ef7943c248b390125b76d70880ed19"},{"file":"workbuddy-auth-product-coordinator.js","sha256":"8624215504229c4b6190f5c2172da270e015cc96871e90b261786f047e4c6e78"}],"regions":[{"file":"workbuddy-auth-product-coordinator.js","name":"APP_CONFIG_KEY_PREWARM_POOL_SIZE","from":908434,"to":908491},{"file":"workbuddy-auth-product-coordinator.js","name":"getPrewarmPoolSizeFromAppConfig","from":908695,"to":908907},{"file":"workbuddy-auth-product-coordinator.js","name":"parsePrewarmPoolSizeEnv","from":909370,"to":909606},{"file":"initialize.js","name":"persistPrewarmPoolSizeCache","from":4828948,"to":4829342},{"file":"initialize.js","name":"bindHostedCliAuthLifecycle","from":3459385,"to":3461762},{"file":"initialize.js","name":"getHostedCliSessionOwnerKey","from":3461763,"to":3462035},{"file":"initialize.js","name":"bootstrapPoolStatements","from":5738098,"to":5739995},{"file":"initialize.js","name":"productSnapshotSubscription","from":5108287,"to":5109028}]} as const;
// Whole original declarations plus contiguous AppServer assembly statements.
export function createNativeHostedCliLifecycle(runtime:any={}):any {
const process=runtime.process??globalThis.process;
const cliEnvironment=runtime.cliEnvironment??createNativeAppCliEnvironment({process,gateway:runtime.gateway,os:runtime.os});
const require_cli_prewarm_pool=runtime.prewarm??createNativeCliPrewarmPool({process});
var APP_CONFIG_KEY_PREWARM_POOL_SIZE = "prewarmPoolSize";
function getPrewarmPoolSizeFromAppConfig(svc, fallback) {
	const raw = svc.get(APP_CONFIG_KEY_PREWARM_POOL_SIZE);
	if (typeof raw !== "number" || !Number.isInteger(raw) || raw < 0) return fallback;
	return raw;
}
function parsePrewarmPoolSizeEnv(raw) {
	if (raw === void 0) return;
	const trimmed = raw.trim();
	if (!/^\d+$/.test(trimmed)) return;
	const value = Number(trimmed);
	return Number.isSafeInteger(value) && value >= 0 ? value : void 0;
}
async function persistPrewarmPoolSizeCache(deps, rawValue) {
	if (typeof rawValue !== "number" || !Number.isInteger(rawValue) || rawValue < 0) return;
	try {
		await deps.configService.set(require_workbuddy_auth_product_coordinator.APP_CONFIG_KEY_PREWARM_POOL_SIZE, rawValue);
	} catch (error) {
		deps.logger?.warn?.("[ConfigFacade] persist prewarmPoolSize cache failed:", String(error));
	}
}
function bindHostedCliAuthLifecycle(params) {
	let lastSessionOwnerKey = getHostedCliSessionOwnerKey(params.authenticationManager.currentSessionSubject.getValue());
	let resetQueue = Promise.resolve();
	const subscription = params.authenticationManager.currentSessionSubject.subscribe((session) => {
		const nextSessionOwnerKey = getHostedCliSessionOwnerKey(session);
		if (nextSessionOwnerKey === lastSessionOwnerKey) return;
		const previousSessionOwnerKey = lastSessionOwnerKey;
		lastSessionOwnerKey = nextSessionOwnerKey;
		const reason = `auth-owner-change (${previousSessionOwnerKey ?? "none"} -> ${nextSessionOwnerKey ?? "none"})`;
		resetQueue = resetQueue.catch((error) => {
			params.logger.warn(`[HostedCliAuthLifecycle] Previous sidecar reset failed: ${error}`);
		}).then(async () => {
			params.logger.info(`[HostedCliAuthLifecycle] Auth owner changed (${previousSessionOwnerKey ?? "none"} -> ${nextSessionOwnerKey ?? "none"}), resetting hosted CLI host runtime`);
			if (!nextSessionOwnerKey && params.sessionManager) {
				params.logger.info("[HostedCliAuthLifecycle] Logout detected, invalidating session history");
				params.sessionManager.invalidateAllSessionHistory();
			}
			await params.runtimeManager.resetHostRuntime();
			params.logger.info(`[HostedCliAuthLifecycle] resetHostRuntime done, hasAgentBackend=${!!params.agentBackend}`);
			if (params.prewarmPool) try {
				params.logger.info("[HostedCliAuthLifecycle] flushing prewarm pool");
				await params.prewarmPool.flush();
				params.logger.info("[HostedCliAuthLifecycle] prewarm pool flushed");
			} catch (error) {
				params.logger.warn(`[HostedCliAuthLifecycle] Failed to flush prewarm pool: ${error}`);
			}
			if (params.agentBackend) try {
				params.logger.info(`[HostedCliAuthLifecycle] calling agentBackend.resetActiveSessions; reason=${reason}`);
				await params.agentBackend.resetActiveSessions(reason);
				params.logger.info(`[HostedCliAuthLifecycle] resetActiveSessions completed; reason=${reason}`);
			} catch (error) {
				params.logger.warn(`[HostedCliAuthLifecycle] Failed to reset active agent sessions: ${error}`);
			}
		}).catch((error) => {
			params.logger.warn(`[HostedCliAuthLifecycle] Failed to reset hosted CLI host runtime: ${error}`);
			throw error;
		});
	});
	return { async stop() {
		subscription.unsubscribe();
		await resetQueue.catch(() => {});
	} };
}
function getHostedCliSessionOwnerKey(session) {
	if (!session?.account?.uid && !session?.auth?.domain && !session?.account?.enterpriseId) return;
	return [
		session?.account?.uid ?? "",
		session?.auth?.domain ?? "",
		session?.account?.enterpriseId ?? ""
	].join("|");
}
const require_workbuddy_auth_product_coordinator={APP_CONFIG_KEY_PREWARM_POOL_SIZE,getPrewarmPoolSizeFromAppConfig,parsePrewarmPoolSizeEnv};
async function initializePrewarmPool({celljs,logger,runtimeManager,codeBackendFactoryOptions,resolveWorkbuddyAppServerCodeCliPath=cliEnvironment.resolveWorkbuddyAppServerCodeCliPath,buildWorkbuddyAppServerCodeCliEnv=cliEnvironment.buildWorkbuddyAppServerCodeCliEnv}) {
const PREWARM_POOL_SIZE_DEFAULT = 1;
	const prewarmPoolSizeEnvRaw = process.env.WORKBUDDY_CLI_PREWARM_POOL_SIZE;
	const prewarmPoolSizeEnv = require_workbuddy_auth_product_coordinator.parsePrewarmPoolSizeEnv(prewarmPoolSizeEnvRaw);
	if (prewarmPoolSizeEnvRaw !== void 0 && prewarmPoolSizeEnv === void 0) logger.warn?.(`[BootstrapServer] WORKBUDDY_CLI_PREWARM_POOL_SIZE=${JSON.stringify(prewarmPoolSizeEnvRaw)} is not a non-negative decimal integer; falling back to app-config/default`);
	const prewarmPoolSize = prewarmPoolSizeEnv ?? require_workbuddy_auth_product_coordinator.getPrewarmPoolSizeFromAppConfig(celljs.configService, PREWARM_POOL_SIZE_DEFAULT);
	let cliPrewarmPool;
	if (Number.isFinite(prewarmPoolSize) && prewarmPoolSize > 0) try {
		const cliPath = resolveWorkbuddyAppServerCodeCliPath(codeBackendFactoryOptions);
		const qimei36 = await codeBackendFactoryOptions.adapters.getQimei36?.();
		const buildPrewarmBaselineEnv = () => buildWorkbuddyAppServerCodeCliEnv(codeBackendFactoryOptions, qimei36 ? { CODEBUDDY_QIMEI36: qimei36 } : void 0);
		const baselineEnv = buildPrewarmBaselineEnv();
		const poolLogger = celljs.logger ?? logger;
		cliPrewarmPool = new require_cli_prewarm_pool.CliPrewarmPool({
			execPath: process.execPath,
			cliPath,
			baselineEnv,
			baselineEnvProvider: buildPrewarmBaselineEnv,
			poolSize: prewarmPoolSize,
			logger: {
				info: (msg, ...rest) => poolLogger.info(msg, ...rest),
				warn: (msg, ...rest) => poolLogger.warn(msg, ...rest),
				error: (msg, ...rest) => poolLogger.error(msg, ...rest)
			}
		});
		cliPrewarmPool.start();
		codeBackendFactoryOptions.cliPrewarmPool = cliPrewarmPool;
		runtimeManager.setPrewarmPool?.(cliPrewarmPool);
	} catch (err) {
		logger.warn?.("[BootstrapServer] cliPrewarmPool init failed; falling back to cold start", { error: err instanceof Error ? err.message : String(err) });
		cliPrewarmPool = void 0;
	}
return cliPrewarmPool;
}
function bindProductSnapshot({celljs,logger,runtimeManager,prewarmPool}) {
const productSnapshotSubscription = celljs.coordinator.onHostedCliProductSnapshotChanged(async () => {
		logger.info("[DaemonBackgroundServices] Hosted CLI product snapshot changed; requesting host runtime rotation");
		try {
			await runtimeManager.rotateHostRuntime("hosted-cli-product-snapshot-change");
		} catch (error) {
			logger.warn("[DaemonBackgroundServices] Hosted CLI runtime rotation after product snapshot change failed:", error instanceof Error ? error.message : String(error));
		}
		if (prewarmPool) try {
			await prewarmPool.flush();
		} catch (error) {
			logger.warn("[DaemonBackgroundServices] Prewarm pool flush after product snapshot change failed:", error instanceof Error ? error.message : String(error));
		}
	});
return productSnapshotSubscription;
}
return {APP_CONFIG_KEY_PREWARM_POOL_SIZE,getPrewarmPoolSizeFromAppConfig,parsePrewarmPoolSizeEnv,persistPrewarmPoolSizeCache,bindHostedCliAuthLifecycle,getHostedCliSessionOwnerKey,initializePrewarmPool,bindProductSnapshot};
}

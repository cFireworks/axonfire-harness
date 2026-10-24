// @ts-nocheck
// Complete original Desktop session host attachment and RPC registration.
import { createNativeTerminalProxy } from '../terminal/native-terminal-proxy.js';
import * as node_path from 'node:path';
import * as node_crypto from 'node:crypto';
export const HOST_RUNTIME_MAIN_SHA256='528d3bffc67c5244d1a641e0cfc13c2be4ef7943c248b390125b76d70880ed19';
export const HOST_RUNTIME_MAIN_FUNCTIONS=[["attachWorkbuddyAppServerSessionRuntime",5023694,5025618],["isIgnoredCwd",5026411,5026673],["registerWorkbuddyDaemonSessionRuntimeHandlers",5020062,5020410],["registerWorkbuddySessionAuxiliaryHandlers",3586131,3590718],["registerWorkbuddySessionCreateConfigHandlers",3565997,3571309],["isClawWorkspaceCwd$1",3561209,3561446],["createOrReuseClawSession",3563348,3565996],["applyExplicitConfigToReusedClawSession",3563014,3563347],["buildExplicitConfigPatch",3562237,3563013],["getLatestClawSessionFromRuntimeSessions",3561827,3562236],["toSessionInfoFromViewState",3561447,3561826],["registerWorkbuddySessionLoadHandler",3574425,3583957],["normalizeLoadCwd",3573416,3573810],["createReplayLoadResult",3573811,3574424],["normalizeTaskStatus",3519139,3520032],["findReplayCwd",3573225,3573415],["trimEventsFromFirstUserMessage",3572327,3572621],["markRendererHistoryReplayPayload",3572037,3572326],["toScopedSessionReplayPayload",3571713,3572036],["isTerminalTaskStatus",3516789,3516959],["mapTaskStatusToStopReason",3572994,3573224],["registerSessionRuntimeRouteStateHandler",2035855,2036060],["startTerminalProxy",5025619,5026410],["isMissingSessionReplayError",3571387,3571592],["isAutomationWorkspaceCwd",3571593,3571712],["isOwnerReplayHydratablePayload",3572622,3572993]] as const;
export const HOST_RUNTIME_MAIN_VARIABLES=[["SESSION_RUNTIME_ROUTE_STATE_CHANNEL",2034254,2034325],["WORKBUDDY_SESSION_AUX_RPC_CHANNELS",3523578,3524196],["RENDERER_HISTORY_REPLAY_META_KEY",3571314,3571385],["SESSION_RUNTIME_RECLAIM_POLICY",4574655,4574768]] as const;
export const HOST_RUNTIME_COORDINATOR_SHA256='8624215504229c4b6190f5c2172da270e015cc96871e90b261786f047e4c6e78';
export const HOST_RUNTIME_COORDINATOR_FUNCTIONS=[] as const;
export const HOST_RUNTIME_COORDINATOR_VARIABLES=[["SESSION_RPC_CHANNELS",283316,285782]] as const;

export function createNativeSessionHostRuntime(runtime:any={}):any {
const setTimeout=runtime.setTimeout ?? globalThis.setTimeout;
const TerminalProxy=runtime.TerminalProxy ?? createNativeTerminalProxy().TerminalProxy;
const require_logger$1=runtime.loggerModule;
function attachWorkbuddyAppServerSessionRuntime(options) {
	const logger = options.logger ?? console;
	let routeState = {};
	const isSessionIgnored = (session) => {
		if (isIgnoredCwd(session, options.ignoredCwd)) return true;
		if (!options.windowFocus.isFocused()) return false;
		return !!routeState.taskId && routeState.taskId === session.sessionId;
	};
	const reclaimOptions = {
		...SESSION_RUNTIME_RECLAIM_POLICY,
		isSessionIgnored
	};
	const scheduleRuntimeSweep = () => {
		options.sessionManager.reclaimInactiveSessions(reclaimOptions).catch((error) => {
			logger.warn("[SessionManager] Failed to sweep session runtimes", { error: error instanceof Error ? error.message : String(error) });
		});
	};
	options.sessionManager.startRuntimeReclaimJanitor({
		...reclaimOptions,
		sweepIntervalMs: SESSION_RUNTIME_RECLAIM_POLICY.sweepIntervalMs
	});
	options.endpoint.onAllClientsDisconnected?.(() => {
		const fileWatchService = options.handlers.auxiliary.getFileWatchService();
		if (!fileWatchService) return;
		logger.info("[AppServer] all renderer clients disconnected, releasing all file watch subscriptions");
		fileWatchService.releaseAllSubscriptions?.();
	});
	registerWorkbuddyDaemonSessionRuntimeHandlers(options.endpoint, {
		...options.handlers,
		load: {
			...options.handlers.load,
			scheduleRuntimeSweep: options.handlers.load.scheduleRuntimeSweep ?? scheduleRuntimeSweep
		},
		routeState: { updateRouteState: (nextRouteState) => {
			const record = nextRouteState && typeof nextRouteState === "object" ? nextRouteState : {};
			routeState = {
				pathname: typeof record.pathname === "string" ? record.pathname : void 0,
				taskId: typeof record.taskId === "string" ? record.taskId : void 0
			};
		} }
	});
	const terminalProxy = startTerminalProxy(options);
	return {
		scheduleRuntimeSweep,
		stop() {
			options.sessionManager.stopRuntimeReclaimJanitor();
			terminalProxy?.stop();
		}
	};
}
function isIgnoredCwd(session, ignoredCwd) {
	if (!ignoredCwd) return false;
	const cwd = typeof session.cwd === "string" ? session.cwd.trim() : "";
	return cwd.length > 0 && node_path.resolve(cwd).toLowerCase() === node_path.resolve(ignoredCwd).toLowerCase();
}
function registerWorkbuddyDaemonSessionRuntimeHandlers(endpoint, deps) {
	registerWorkbuddySessionAuxiliaryHandlers(endpoint, deps.auxiliary);
	registerWorkbuddySessionCreateConfigHandlers(endpoint, deps.createConfig);
	registerWorkbuddySessionLoadHandler(endpoint, deps.load);
	registerSessionRuntimeRouteStateHandler(endpoint, deps.routeState);
}
function registerWorkbuddySessionAuxiliaryHandlers(registry, deps) {
	registry.handle(WORKBUDDY_SESSION_AUX_RPC_CHANNELS.GET_ACTIVE_SESSIONS, () => deps.sessionManager.getActiveSessions());
	registry.handle(WORKBUDDY_SESSION_AUX_RPC_CHANNELS.GET_SESSION_ARTIFACTS, async (sessionId) => {
		const artifacts = deps.getArtifactsService();
		if (!artifacts || typeof sessionId !== "string") return [];
		return artifacts.getSessionArtifacts(sessionId);
	});
	registry.handle(WORKBUDDY_SESSION_AUX_RPC_CHANNELS.LOCAL_DOCS_REGISTER_MEDIA_ARTIFACT, async (params) => {
		const mediaService = deps.getMediaService?.();
		if (!mediaService) return {
			success: false,
			error: "MediaArtifactService not available"
		};
		const { sessionId, filePath } = params ?? {};
		if (typeof sessionId !== "string" || !sessionId) return {
			success: false,
			error: "sessionId is required"
		};
		if (typeof filePath !== "string" || !filePath) return {
			success: false,
			error: "filePath is required"
		};
		try {
			mediaService.registerExplicitMedia({
				sessionId,
				filePath,
				sourceType: "present_files"
			});
			await mediaService.pushMediaForFile(sessionId, filePath, {
				sourceTool: "PresentFiles",
				allowUnknownExtension: true
			});
			return { success: true };
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : String(error)
			};
		}
	});
	registry.handle(WORKBUDDY_SESSION_AUX_RPC_CHANNELS.FILE_WATCH_SUBSCRIBE, async (filePath) => {
		const fileWatch = deps.getFileWatchService();
		if (!fileWatch) throw new Error("FileWatchService not initialized");
		if (typeof filePath !== "string" || filePath.length === 0) throw new Error("fileWatch:subscribe: filePath must be a non-empty string");
		return { id: fileWatch.subscribe(filePath) };
	});
	registry.handle(WORKBUDDY_SESSION_AUX_RPC_CHANNELS.FILE_WATCH_UNSUBSCRIBE, async (id) => {
		const fileWatch = deps.getFileWatchService();
		if (!fileWatch) return { ok: true };
		if (typeof id !== "string" || id.length === 0) return { ok: false };
		fileWatch.unsubscribe(id);
		return { ok: true };
	});
	registry.handle(WORKBUDDY_SESSION_AUX_RPC_CHANNELS.DIRECTORY_WATCH_SUBSCRIBE, async (params) => {
		const mediaService = deps.getMediaService?.();
		if (!mediaService?.subscribeDirectoryWatch) return { id: void 0 };
		const { sessionId, dirPath } = params ?? {};
		if (typeof sessionId !== "string" || sessionId.length === 0) throw new Error("directoryWatch:subscribe: sessionId must be a non-empty string");
		if (typeof dirPath !== "string" || dirPath.length === 0) throw new Error("directoryWatch:subscribe: dirPath must be a non-empty string");
		return { id: mediaService.subscribeDirectoryWatch(sessionId, dirPath) };
	});
	registry.handle(WORKBUDDY_SESSION_AUX_RPC_CHANNELS.DIRECTORY_WATCH_UNSUBSCRIBE, async (id) => {
		const mediaService = deps.getMediaService?.();
		if (!mediaService?.unsubscribeDirectoryWatch) return { ok: true };
		if (typeof id !== "string" || id.length === 0) return { ok: false };
		mediaService.unsubscribeDirectoryWatch(id);
		return { ok: true };
	});
	registry.handle(WORKBUDDY_SESSION_AUX_RPC_CHANNELS.DIRECTORY_WATCH_RELEASE_SESSION, async (sessionId) => {
		const mediaService = deps.getMediaService?.();
		if (!mediaService?.releaseDirectoryWatchSession) return { ok: true };
		if (typeof sessionId !== "string" || sessionId.length === 0) return { ok: false };
		mediaService.releaseDirectoryWatchSession(sessionId);
		return { ok: true };
	});
	registry.handle(require_workbuddy_auth_product_coordinator.SESSION_RPC_CHANNELS.GET_PERSISTED_USAGE, async (sessionId) => {
		if (typeof sessionId !== "string" || sessionId.trim().length === 0) return;
		return deps.usageCache.getPersisted(sessionId);
	});
	registry.handle(require_workbuddy_auth_product_coordinator.SESSION_RPC_CHANNELS.GET_LAST_USAGE_EVENT, async (sessionId) => {
		if (typeof sessionId !== "string" || sessionId.trim().length === 0) return;
		return deps.usageCache.getLastEvent(sessionId);
	});
	registry.handle(WORKBUDDY_SESSION_AUX_RPC_CHANNELS.LOCAL_EXPERTS_GET_WATCH_PATH, async () => ({ filePath: deps.localExperts.getCustomExpertWatchPath() }));
	registry.handle(WORKBUDDY_SESSION_AUX_RPC_CHANNELS.LOCAL_EXPERTS_GET_PLUGIN_JSON_PATH, async (expertId) => {
		if (typeof expertId !== "string" || expertId.trim().length === 0) return { filePath: void 0 };
		if (expertId.includes("/") || expertId.includes("\\") || expertId.includes("..")) return { filePath: void 0 };
		return { filePath: deps.localExperts.getCustomExpertPluginJsonPath(expertId) };
	});
}
function registerWorkbuddySessionCreateConfigHandlers(registry, deps) {
	registry.handle(require_workbuddy_auth_product_coordinator.SESSION_RPC_CHANNELS.CREATE, async (params) => {
		const opts = params ?? {};
		const handlerStartedAt = Date.now();
		deps.logger?.info("[session-create] main createSession handler enter", { cwd: typeof opts.cwd === "string" ? opts.cwd : void 0 });
		if (isClawWorkspaceCwd$1(opts.cwd, deps.claw.cwd) && typeof opts.tools === "string" && opts.tools.length > 0) {
			const blacklist = new Set(deps.claw.disabledTools);
			const filteredStr = opts.tools.split(",").map((t) => t.trim()).filter((t) => t.length > 0 && !blacklist.has(t)).join(",");
			if (filteredStr !== opts.tools) {
				deps.logger?.warn("[Daemon][Claw] createSession: overriding explicit tools in Claw workspace", {
					cwd: opts.cwd,
					removed: opts.tools.split(",").filter((t) => blacklist.has(t.trim()))
				});
				opts.tools = filteredStr;
			}
		}
		const expertId = opts.config?.expertId ?? opts.expertId;
		let preloadedExpertType;
		if (typeof expertId === "string" && expertId.length > 0 && deps.expertResolver && deps.agentTeams) try {
			const resolved = await deps.expertResolver.resolveExpertLocation(expertId, opts.config?.expertMarketplace);
			if (resolved) {
				const { manifest } = resolved;
				preloadedExpertType = manifest.expertType;
				const envValue = deps.agentTeams.resolveEnv({ expertType: manifest.expertType });
				opts.env = {
					...opts.env,
					[deps.agentTeams.envKey]: envValue
				};
				deps.logger?.info(`[AgentTeamsEnvResolver] createSession preload expertId=${expertId} expertType=${manifest.expertType} env=${envValue}`);
			}
		} catch (err) {
			deps.logger?.warn("[AgentTeamsEnvResolver] createSession preload failed", {
				expertId,
				error: err instanceof Error ? err.message : String(err)
			});
		}
		if (opts.projectResources && opts.projectId && !opts.sessionId) opts.sessionId = (0, node_crypto.randomUUID)();
		const projectResourcesSessionId = opts.sessionId;
		let projectResourcesRegistered = false;
		if (opts.projectId && opts.projectResources && projectResourcesSessionId && deps.projectResources) try {
			const projectEnv = await deps.projectResources.registerSession(projectResourcesSessionId, opts.projectId, opts.projectResources);
			opts.env = {
				...opts.env,
				...projectEnv
			};
			projectResourcesRegistered = true;
		} catch (error) {
			deps.logger?.warn("[session-create] projectResources install failed (non-blocking)", error);
		}
		const result = await createOrReuseClawSession(opts, {
			clawCwd: deps.claw.cwd,
			clawService: deps.claw.service,
			sessionManager: deps.sessionManager,
			inFlightCreates: deps.claw.inFlightCreates,
			logger: deps.logger
		});
		deps.logger?.info("[session-create] main createSession handler done", {
			durationMs: Date.now() - handlerStartedAt,
			sessionId: result.sessionId
		});
		if (preloadedExpertType !== void 0 && result.sessionId) deps.agentTeams?.recordSessionExpertType(result.sessionId, preloadedExpertType);
		if (opts.projectId && result.sessionId && !projectResourcesRegistered) if (opts.projectResources && deps.projectResources) try {
			await deps.projectResources.registerSession(result.sessionId, opts.projectId, opts.projectResources);
		} catch (error) {
			deps.logger?.warn("[session-create] projectResources late install failed (non-blocking)", error);
		}
		else deps.projectResources?.registerSessionFromRecord(result.sessionId, opts.projectId);
		else if (opts.projectId && result.sessionId && projectResourcesRegistered && result.sessionId !== projectResourcesSessionId) deps.projectResources?.registerSessionFromRecord(result.sessionId, opts.projectId);
		return result;
	});
	registry.handle(require_workbuddy_auth_product_coordinator.SESSION_RPC_CHANNELS.UPDATE_CONFIG, async (sessionId, patch, resumeCwd, options) => {
		let shouldRecordExpertType = false;
		let resolvedExpertType;
		if (typeof sessionId === "string" && sessionId.length > 0 && patch && typeof patch === "object" && "expertId" in patch) {
			const expertIdInPatch = patch.expertId;
			if (typeof expertIdInPatch === "string" && expertIdInPatch.length > 0) try {
				const expertMarketplace = patch.expertMarketplace;
				const resolved = await deps.expertResolver?.resolveExpertLocation(expertIdInPatch, typeof expertMarketplace === "string" ? expertMarketplace : void 0);
				if (resolved) {
					resolvedExpertType = resolved.manifest.expertType;
					shouldRecordExpertType = true;
				}
			} catch (err) {
				deps.logger?.warn("[AgentTeamsEnvResolver] updateSessionConfig preload failed", {
					sessionId,
					expertId: expertIdInPatch,
					error: err instanceof Error ? err.message : String(err)
				});
			}
			else if (expertIdInPatch === "" || expertIdInPatch === null) shouldRecordExpertType = true;
		}
		return deps.sessionManager.updateSessionConfig(sessionId, patch ?? {}, resumeCwd, {
			...options && typeof options === "object" ? options : {},
			...shouldRecordExpertType ? { onPreconditionMatched: () => {
				deps.agentTeams?.recordSessionExpertType(sessionId, resolvedExpertType);
				deps.logger?.info(`[AgentTeamsEnvResolver] updateSessionConfig preload sessionId=${String(sessionId)} expertType=${String(resolvedExpertType)}`);
			} } : {}
		});
	});
}
function isClawWorkspaceCwd$1(cwd, clawCwd) {
	if (!cwd) return false;
	const trimmed = cwd.trim();
	if (trimmed.length === 0) return false;
	return node_path.resolve(trimmed).toLowerCase() === node_path.resolve(clawCwd).toLowerCase();
}
async function createOrReuseClawSession(opts, deps) {
	if (!isClawWorkspaceCwd$1(opts.cwd, deps.clawCwd)) return deps.sessionManager.createSession(opts);
	const key = node_path.resolve((opts.cwd || deps.clawCwd).trim()).toLowerCase();
	const existing = deps.inFlightCreates.get(key);
	if (existing) {
		deps.logger?.info?.("[Daemon][Claw] createSession join in-flight create", {
			cwd: opts.cwd,
			requestedMode: opts.config?.mode ?? opts.mode
		});
		const info = await existing;
		return await applyExplicitConfigToReusedClawSession(info.sessionId, opts, deps) ?? info;
	}
	const promise = (async () => {
		const latestRuntimeSession = getLatestClawSessionFromRuntimeSessions(await deps.sessionManager.listSessions(), deps.clawCwd);
		if (latestRuntimeSession) {
			const active = deps.sessionManager.getSession(latestRuntimeSession.sessionId);
			if (active) {
				deps.logger?.info?.("[Daemon][Claw] createSession reuse runtime session", {
					sessionId: latestRuntimeSession.sessionId,
					cwd: latestRuntimeSession.cwd
				});
				return await applyExplicitConfigToReusedClawSession(latestRuntimeSession.sessionId, opts, deps) ?? toSessionInfoFromViewState(active);
			}
			deps.logger?.info?.("[Daemon][Claw] createSession return runtime session info", {
				sessionId: latestRuntimeSession.sessionId,
				cwd: latestRuntimeSession.cwd
			});
			return await applyExplicitConfigToReusedClawSession(latestRuntimeSession.sessionId, opts, deps) ?? latestRuntimeSession;
		}
		const latest = deps.clawService.getLatestActiveConversation();
		if (latest && isClawWorkspaceCwd$1(latest.cwd, deps.clawCwd)) {
			const active = deps.sessionManager.getSession(latest.agentSessionId);
			if (active) {
				deps.logger?.info?.("[Daemon][Claw] createSession reuse active session", {
					sessionId: latest.agentSessionId,
					cwd: latest.cwd
				});
				return await applyExplicitConfigToReusedClawSession(latest.agentSessionId, opts, deps) ?? toSessionInfoFromViewState(active);
			}
			deps.logger?.info?.("[Daemon][Claw] createSession resume stored session", {
				sessionId: latest.agentSessionId,
				cwd: latest.cwd
			});
			const resumed = await deps.sessionManager.resumeSession(latest.agentSessionId, latest.cwd);
			return await applyExplicitConfigToReusedClawSession(resumed.sessionId, opts, deps) ?? resumed;
		}
		deps.logger?.info?.("[Daemon][Claw] createSession create new session", { cwd: opts.cwd });
		return deps.sessionManager.createSession(opts);
	})();
	deps.inFlightCreates.set(key, promise);
	try {
		return await promise;
	} finally {
		if (deps.inFlightCreates.get(key) === promise) deps.inFlightCreates.delete(key);
	}
}
async function applyExplicitConfigToReusedClawSession(sessionId, opts, deps) {
	const patch = buildExplicitConfigPatch(opts);
	if (!patch) return;
	deps.logger?.info?.("[Daemon][Claw] apply explicit config to reused session", {
		sessionId,
		mode: patch.mode
	});
	return deps.sessionManager.updateSessionConfig(sessionId, patch);
}
function buildExplicitConfigPatch(opts) {
	const patch = { ...opts.config ?? {} };
	if (opts.mode !== void 0 && patch.mode === void 0) patch.mode = opts.mode;
	if (opts.model !== void 0 && patch.model === void 0) patch.model = opts.model;
	if (opts.permissionMode !== void 0 && patch.permissionMode === void 0) patch.permissionMode = opts.permissionMode;
	if (opts.expertId !== void 0 && patch.expertId === void 0) patch.expertId = opts.expertId;
	if (opts.locale !== void 0 && patch.locale === void 0) patch.locale = opts.locale;
	if (opts.systemPrompt !== void 0 && patch.systemPrompt === void 0) patch.systemPrompt = opts.systemPrompt;
	if (opts.tools !== void 0 && patch.tools === void 0) patch.tools = opts.tools;
	return Object.keys(patch).length > 0 ? patch : void 0;
}
function getLatestClawSessionFromRuntimeSessions(sessions, clawCwd) {
	let latest;
	let latestActivityAt = -1;
	for (const session of sessions) {
		if (!isClawWorkspaceCwd$1(session.cwd, clawCwd)) continue;
		const activityAt = session.lastBackendActivityAt ?? session.createdAt;
		if (!latest || activityAt > latestActivityAt) {
			latest = session;
			latestActivityAt = activityAt;
		}
	}
	return latest;
}
function toSessionInfoFromViewState(session) {
	return {
		sessionId: session.sessionId,
		userId: session.userId,
		cwd: session.cwd,
		createdAt: session.createdAt,
		config: session.config,
		status: session.status,
		pendingInputKind: session.pendingInputKind,
		hasActiveTeamMembers: session.hasActiveTeamMembers,
		lastBackendActivityAt: session.lastBackendActivityAt
	};
}
function registerWorkbuddySessionLoadHandler(registry, deps) {
	const pendingLoadSessions = /* @__PURE__ */ new Map();
	const inFlightReplayAbort = /* @__PURE__ */ new Map();
	const isMissingReplayError = deps.isMissingSessionReplayError ?? isMissingSessionReplayError;
	const isAutomationCwd = deps.isAutomationWorkspaceCwd ?? isAutomationWorkspaceCwd;
	registry.handle(require_workbuddy_auth_product_coordinator.SESSION_RPC_CHANNELS.LOAD, async (sessionId, params) => {
		if (typeof sessionId !== "string" || sessionId.trim().length === 0) throw new Error("Session ID is required");
		deps.logger?.info(`[Daemon] LOAD session: sessionId=${sessionId}, params=${JSON.stringify(params)}`);
		const requestedCwd = normalizeLoadCwd(params?.cwd);
		const loadRequestId = typeof params?.requestId === "string" ? params.requestId?.trim() : void 0;
		const forceRendererHistoryReplay = params?.forceRendererHistoryReplay === true;
		deps.recordMainLoadTime?.(loadRequestId || sessionId);
		const historyGeneration = deps.sessionManager.getHistoryStoreGeneration(sessionId);
		const loadKey = `${historyGeneration}\0${sessionId}\0${requestedCwd || ""}\0${forceRendererHistoryReplay ? "force" : "normal"}`;
		const pendingLoad = pendingLoadSessions.get(loadKey);
		if (pendingLoad && !pendingLoad.controller.signal.aborted) {
			deps.logger?.info(`[Daemon] LOAD deduped: sessionId=${sessionId}, requestId=${loadRequestId || "n/a"}`);
			return pendingLoad.promise;
		}
		pendingLoadSessions.delete(loadKey);
		for (const [staleId, staleReplay] of inFlightReplayAbort) {
			staleReplay.controller.abort();
			inFlightReplayAbort.delete(staleId);
			deps.logger?.info(`[Daemon] LOAD aborting stale replay for "${staleId}" (superseded by "${sessionId}")`);
		}
		const replayAbortController = new AbortController();
		inFlightReplayAbort.set(sessionId, { controller: replayAbortController });
		const assertCurrent = () => {
			if (replayAbortController.signal.aborted) throw replayAbortController.signal.reason ?? /* @__PURE__ */ new Error(`Session replay aborted for "${sessionId}"`);
			if (deps.sessionManager.getHistoryStoreGeneration(sessionId) !== historyGeneration) throw new Error(`Session history generation changed while loading "${sessionId}"`);
		};
		const loadPromise = (async () => {
			const activeOwnerSnapshot = deps.sessionManager.getSession(sessionId);
			const storedReplay = deps.sessionManager.replayStoredSessionHistory(sessionId);
			if (storedReplay.replayed) {
				const record = activeOwnerSnapshot ?? await deps.sessionManager.getSessionRecord(sessionId);
				assertCurrent();
				if (record?.projectId) deps.projectResources?.registerSessionFromRecord(sessionId, record.projectId);
				const resolvedCwd = normalizeLoadCwd(activeOwnerSnapshot?.cwd) ?? normalizeLoadCwd(record?.cwd) ?? requestedCwd;
				if (resolvedCwd) {
					await deps.sessionManager.rememberSessionCwd(sessionId, resolvedCwd);
					assertCurrent();
					if (deps.media && !deps.media.getSessionCwd(sessionId)) deps.media.registerSession(sessionId, resolvedCwd);
				}
				deps.sessionManager.replayActivePendingInputs(sessionId);
				deps.scheduleRuntimeSweep?.();
				return createReplayLoadResult(sessionId, record, void 0, resolvedCwd, storedReplay.complete);
			}
			const record = await deps.sessionManager.getSessionRecord(sessionId);
			assertCurrent();
			if (record?.projectId) deps.projectResources?.registerSessionFromRecord(sessionId, record.projectId);
			const replayRequestCwd = requestedCwd || (typeof record?.cwd === "string" && record.cwd.trim() ? record.cwd : void 0) || (typeof activeOwnerSnapshot?.cwd === "string" && activeOwnerSnapshot.cwd.trim() ? activeOwnerSnapshot.cwd : void 0);
			let replay;
			try {
				replay = await deps.requestSessionReplay(sessionId, {
					signal: replayAbortController.signal,
					cwd: replayRequestCwd
				});
			} catch (error) {
				if (replayAbortController.signal.aborted) {
					deps.logger?.info(`[Daemon] LOAD replay aborted for "${sessionId}" (superseded by newer load)`);
					throw error;
				}
				if (isMissingReplayError(error) && (record?.isBackgroundAutomation || isAutomationCwd(requestedCwd))) {
					deps.logger?.warn(`[Daemon] Automation session replay missing for "${sessionId}"; propagate to UI fallback`, error);
					throw error;
				}
				deps.logger?.warn(`[Daemon] Failed to fetch session replay for "${sessionId}", keeping renderer on stored snapshot without restoring a runtime`, error);
				const resolvedCwd = requestedCwd || (typeof record?.cwd === "string" && record.cwd.trim() ? record.cwd : void 0);
				if (resolvedCwd) await deps.sessionManager.rememberSessionCwd(sessionId, resolvedCwd);
				if (deps.media && resolvedCwd && !deps.media.getSessionCwd(sessionId)) deps.media.registerSession(sessionId, resolvedCwd);
				deps.scheduleRuntimeSweep?.();
				return {
					sessionId,
					loaded: true,
					rendererHistoryReplayComplete: false
				};
			}
			assertCurrent();
			const replayChannel = `${require_workbuddy_auth_product_coordinator.SESSION_RPC_CHANNELS.EVENT}:${sessionId}`;
			const resolvedCwd = normalizeLoadCwd(record?.cwd) ?? normalizeLoadCwd(replay.cwd) ?? findReplayCwd(replay.events) ?? requestedCwd;
			if (resolvedCwd) {
				await deps.sessionManager.rememberSessionCwd(sessionId, resolvedCwd);
				assertCurrent();
			}
			if (deps.media && resolvedCwd) deps.media.registerSession(sessionId, resolvedCwd);
			const effectiveEvents = replay.historyInfo?.truncated ? trimEventsFromFirstUserMessage(replay.events) : replay.events;
			replay.events = effectiveEvents;
			const ownerReplayPayloads = effectiveEvents.map(toScopedSessionReplayPayload).filter(isOwnerReplayHydratablePayload);
			if (deps.sessionManager.hasSession(sessionId)) await deps.sessionManager.replaceSessionReplay(sessionId, ownerReplayPayloads, resolvedCwd, historyGeneration);
			else await deps.sessionManager.primeSessionReplay(sessionId, ownerReplayPayloads, resolvedCwd, historyGeneration);
			assertCurrent();
			const mainPushStartedAt = Date.now();
			try {
				if (replay.historyInfo?.truncated) registry.push(replayChannel, {
					type: "historyInfo",
					sessionId,
					...replay.historyInfo
				});
				const push = (channel, data) => registry.push(channel, data);
				for (const event of effectiveEvents) {
					const scopedPayload = markRendererHistoryReplayPayload(toScopedSessionReplayPayload(event));
					if (!(deps.replayLifecycle?.(replayChannel, scopedPayload, push) ?? false)) registry.push(replayChannel, scopedPayload);
				}
			} finally {
				replay.replayTiming = {
					...replay.replayTiming || {},
					events: replay.events.length,
					mainPushMs: Date.now() - mainPushStartedAt
				};
				deps.replayingSessions?.delete(sessionId);
			}
			deps.sessionManager.replayActivePendingInputs(sessionId);
			deps.scheduleRuntimeSweep?.();
			try {
				const sessionInfo = deps.sessionManager.getSession(sessionId);
				const rawStatus = sessionInfo?.status ?? record?.status;
				const status = typeof rawStatus === "string" ? normalizeTaskStatus(rawStatus) : void 0;
				const isBackendIdle = !sessionInfo || !sessionInfo.isProcessing;
				const shouldSendSynthetic = !sessionInfo || status && isTerminalTaskStatus(status) || status && !isTerminalTaskStatus(status) && isBackendIdle;
				deps.logger?.info(`[DaemonBootstrap] LOAD synthetic check: sessionId=${sessionId}, status=${status}, isProcessing=${sessionInfo?.isProcessing}, isBackendIdle=${isBackendIdle}, shouldSendSynthetic=${shouldSendSynthetic}`);
				if (shouldSendSynthetic) {
					const stopReason = status && isTerminalTaskStatus(status) ? mapTaskStatusToStopReason(status) : "end_turn";
					const scheduledEventCount = sessionInfo?.eventHistory.length ?? ownerReplayPayloads.length;
					if (!status || !isTerminalTaskStatus(status)) deps.sessionManager.updateSessionStatus(sessionId, "completed").catch((err) => {
						deps.logger?.warn(`[DaemonBootstrap] Failed to update idle loaded session "${sessionId}" to completed:`, err);
					});
					setTimeout(() => {
						const currentSession = deps.sessionManager.getSession(sessionId);
						const currentEventCount = currentSession?.eventHistory.length;
						if (currentSession?.isProcessing === true || scheduledEventCount !== void 0 && currentEventCount !== void 0 && currentEventCount !== scheduledEventCount) {
							deps.logger?.info(`[DaemonBootstrap] Skip stale LOAD synthetic promptResponse: sessionId=${sessionId}, isProcessing=${currentSession?.isProcessing}, scheduledEventCount=${scheduledEventCount}, currentEventCount=${currentEventCount}`);
							return;
						}
						registry.push(`${require_workbuddy_auth_product_coordinator.SESSION_RPC_CHANNELS.EVENT}:${sessionId}`, {
							type: "promptResponse",
							sessionId,
							origin: "synthetic",
							response: {
								stopReason,
								_meta: {}
							}
						});
					}, 500);
				}
			} catch (synthErr) {
				deps.logger?.warn(`[DaemonBootstrap] Failed to push synthetic promptResponse for hydrated session "${sessionId}":`, synthErr);
			}
			return createReplayLoadResult(sessionId, record, replay.replayTiming, resolvedCwd);
		})();
		pendingLoadSessions.set(loadKey, {
			promise: loadPromise,
			controller: replayAbortController
		});
		try {
			return await loadPromise;
		} finally {
			if (pendingLoadSessions.get(loadKey)?.promise === loadPromise) pendingLoadSessions.delete(loadKey);
			if (inFlightReplayAbort.get(sessionId)?.controller === replayAbortController) inFlightReplayAbort.delete(sessionId);
		}
	});
}
function normalizeLoadCwd(value) {
	if (typeof value !== "string") return;
	const trimmed = value.trim();
	if (!trimmed) return;
	const normalized = node_path.normalize(trimmed);
	const root = node_path.parse(normalized).root;
	let end = normalized.length;
	while (end > root.length && (normalized[end - 1] === "/" || normalized[end - 1] === "\\")) end -= 1;
	return normalized.slice(0, end);
}
function createReplayLoadResult(sessionId, record, replayTiming, fallbackCwd, rendererHistoryReplayComplete = true) {
	const { status: rawStatus, ...recordRest } = record ?? {};
	const normalizedRecord = record ? {
		...recordRest,
		...typeof rawStatus === "string" ? { status: normalizeTaskStatus(rawStatus) } : {}
	} : void 0;
	return {
		...normalizedRecord ?? {},
		id: normalizedRecord?.id ?? normalizedRecord?.sessionId ?? sessionId,
		sessionId,
		cwd: normalizeLoadCwd(normalizedRecord?.cwd) ?? fallbackCwd,
		loaded: true,
		rendererHistoryReplayComplete,
		...replayTiming ? { replayTiming } : {}
	};
}
function normalizeTaskStatus(rawStatus) {
	switch (rawStatus?.trim().toLowerCase().replace(/[\s-]+/g, "_")) {
		case "planning":
		case "preparing":
		case "connecting": return "planning";
		case "working":
		case "running":
		case "tool_start":
		case "tool_end":
		case "handoff":
		case "summarizing":
		case "waiting_team_members":
		case "model_requesting":
		case "model_streaming":
		case "model_done":
		case "tool_executing": return "working";
		case "pending":
		case "idle":
		case "await_input":
		case "awaitinput":
		case "waiting_input":
		case "waiting_user_input":
		case "connected": return "pending";
		case "completed":
		case "cancelled":
		case "canceled":
		case "done": return "completed";
		case "failed": return "failed";
		case "error": return "error";
		case "terminated": return "terminated";
		case "archived": return "archived";
		default: return "pending";
	}
}
function findReplayCwd(events) {
	for (const event of events) {
		if (event.type !== "sessionUpdate") continue;
		const cwd = normalizeLoadCwd(event.update?.cwd);
		if (cwd) return cwd;
	}
}
function trimEventsFromFirstUserMessage(events) {
	for (let i = 0; i < events.length; i += 1) {
		const event = events[i];
		if (event.type !== "sessionUpdate") continue;
		if (event.update?.sessionUpdate === "user_message_chunk") return i === 0 ? events : events.slice(i);
	}
	return events;
}
function markRendererHistoryReplayPayload(payload) {
	const existingMeta = payload._meta && typeof payload._meta === "object" && !Array.isArray(payload._meta) ? payload._meta : {};
	return {
		...payload,
		_meta: {
			...existingMeta,
			[RENDERER_HISTORY_REPLAY_META_KEY]: true
		}
	};
}
function toScopedSessionReplayPayload(event) {
	if (event.type === "sessionUpdate") return {
		sessionId: event.sessionId,
		update: event.update,
		...event._meta ? { _meta: event._meta } : {}
	};
	return {
		type: "extNotification",
		sessionId: event.sessionId,
		method: event.method,
		params: event.params ?? {}
	};
}
function isTerminalTaskStatus(status) {
	return status === "completed" || status === "failed" || status === "error" || status === "terminated" || status === "archived";
}
function mapTaskStatusToStopReason(status) {
	switch (status) {
		case "terminated": return "cancelled";
		case "failed":
		case "error":
		case "completed":
		case "archived": return "end_turn";
		default: return "end_turn";
	}
}
function registerSessionRuntimeRouteStateHandler(registry, deps) {
	registry.handle(SESSION_RUNTIME_ROUTE_STATE_CHANNEL, async (payload) => {
		deps.updateRouteState(payload);
		return { ok: true };
	});
}
function startTerminalProxy(options) {
	const httpServer = options.endpoint.getHttpServer?.();
	if (!httpServer || !options.resolveDataSocketPath) return;
	const fallbackLogger = require_logger$1.createWorkbuddyScopedLogger("terminal-proxy");
	const terminalProxy = new TerminalProxy({
		resolveDataSocketPath: options.resolveDataSocketPath,
		logger: {
			log: (...args) => (options.logger?.log ?? options.logger?.info ?? fallbackLogger.log)(...args),
			warn: (...args) => (options.logger?.warn ?? fallbackLogger.warn)(...args),
			error: (...args) => (options.logger?.error ?? fallbackLogger.error)(...args)
		}
	});
	terminalProxy.start(httpServer, options.endpoint.getToken?.() ?? "");
	options.logger?.info("[AppServer] TerminalProxy attached to HTTP server");
	return terminalProxy;
}
function isMissingSessionReplayError(error) {
	const message = error instanceof Error ? error.message : String(error ?? "");
	return /\bENOENT\b|no such file|not found|\u4e0d\u5b58\u5728/i.test(message);
}
function isAutomationWorkspaceCwd(cwd) {
	return typeof cwd === "string" && /workbuddy-server-automation/i.test(cwd);
}
function isOwnerReplayHydratablePayload(payload) {
	const payloadType = typeof payload.type === "string" ? payload.type : null;
	if (payloadType === "questionRequest" || payloadType === "permissionRequest" || payloadType === "questionCancelled" || payloadType === "elicitationRequest") return true;
	return Boolean(payload.update && typeof payload.update === "object");
}
const SESSION_RUNTIME_ROUTE_STATE_CHANNEL = "sessionRuntime:updateRouteState";
const WORKBUDDY_SESSION_AUX_RPC_CHANNELS = {
	GET_ACTIVE_SESSIONS: "daemon:getActiveSessions",
	GET_SESSION_ARTIFACTS: "getSessionArtifacts",
	FILE_WATCH_SUBSCRIBE: "fileWatch:subscribe",
	FILE_WATCH_UNSUBSCRIBE: "fileWatch:unsubscribe",
	DIRECTORY_WATCH_SUBSCRIBE: "directoryWatch:subscribe",
	DIRECTORY_WATCH_UNSUBSCRIBE: "directoryWatch:unsubscribe",
	DIRECTORY_WATCH_RELEASE_SESSION: "directoryWatch:releaseSession",
	LOCAL_EXPERTS_GET_WATCH_PATH: "localExperts:getWatchPath",
	LOCAL_EXPERTS_GET_PLUGIN_JSON_PATH: "localExperts:getPluginJsonPath",
	LOCAL_DOCS_REGISTER_MEDIA_ARTIFACT: "localDocs:registerMediaArtifact"
};
const RENDERER_HISTORY_REPLAY_META_KEY = "codebuddy.ai/rendererHistoryReplay";
const SESSION_RUNTIME_RECLAIM_POLICY = {
	idleTimeoutMs: 900 * 1e3,
	sweepIntervalMs: 30 * 1e3,
	maxActiveSessions: 6
};
const SESSION_RPC_CHANNELS = {
	CREATE: "session:create",
	DESTROY: "session:destroy",
	DELETE: "session:delete",
	LIST: "session:list",
	LOAD: "session:load",
	GET: "session:get",
	GET_TEAM_RUNTIME: "session:getTeamRuntime",
	UPSERTED: "session:upserted",
	DELETED: "session:deleted",
	SEND_MESSAGE: "session:sendMessage",
	CANCEL: "session:cancel",
	RESOLVE_PERMISSION: "session:resolvePermission",
	REJECT_PERMISSION: "session:rejectPermission",
	RESOLVE_INTERRUPTION: "session:resolveInterruption",
	ANSWER_QUESTION: "session:answerQuestion",
	CANCEL_QUESTION: "session:cancelQuestion",
	ANSWER_POI_QUESTION: "session:answerPoiQuestion",
	ANSWER_PLUGIN_RECOMMENDATION: "session:answerPluginRecommendation",
	PUSH_SESSION_POI: "session:pushSessionPoi",
	RESPOND_ELICITATION: "session:respondElicitation",
	SET_MODE: "session:setMode",
	SET_MODEL: "session:setModel",
	SET_CONFIG_OPTION: "session:setConfigOption",
	UPDATE_CONFIG: "session:updateConfig",
	ARCHIVE: "session:archive",
	RENAME: "session:rename",
	MOVE: "session:move",
	UPDATE_STATUS: "session:updateStatus",
	GET_AVAILABLE_COMMANDS: "session:getAvailableCommands",
	GET_SUBAGENT_LIST: "session:getSubagentList",
	RESPOND_TO_SAMPLING: "session:respondToSampling",
	RESPOND_TO_ROOTS: "session:respondToRoots",
	REQUEST_YIELD: "session:requestYield",
	GET_MESSAGE_QUEUE: "session:getMessageQueue",
	SAVE_MESSAGE_QUEUE: "session:saveMessageQueue",
	ENQUEUE_MESSAGE: "session:enqueueMessage",
	REMOVE_QUEUE_ITEM: "session:removeQueueItem",
	POP_QUEUE_ITEM_FOR_EDIT: "session:popQueueItemForEdit",
	REORDER_QUEUE: "session:reorderQueue",
	SEND_QUEUE_ITEM_NOW: "session:sendQueueItemNow",
	ACTIVATE_QUEUE: "session:activateQueue",
	PAUSE_QUEUE: "session:pauseQueue",
	RESUME_QUEUE: "session:resumeQueue",
	CANCEL_QUEUE: "session:cancelQueue",
	GET_QUEUE_STATE: "session:getQueueState",
	REPORT_RUNTIME_EVENT: "session:reportRuntimeEvent",
	ACP_REQUEST: "session:acpRequest",
	EVENT: "session:event",
	NAVIGATE: "session:navigate",
	NOTIFY_PERMISSION_PENDING_APPROVAL: "session:notifyPermissionPendingApproval",
	NOTIFY_PERMISSION_RESOLVED_FROM_LOCAL: "session:notifyPermissionResolvedFromLocal",
	NOTIFY_LISTENER_READY: "session:notifyListenerReady",
	GET_PERSISTED_USAGE: "session:getPersistedUsage",
	GET_LAST_USAGE_EVENT: "session:getLastUsageEvent",
	ROLLBACK: "session:rollback",
	PIN: "session:pin",
	UNPIN: "session:unpin",
	REORDER_PINNED: "session:reorderPinned",
	MIGRATE_PINS: "session:migratePins"
};
const require_workbuddy_auth_product_coordinator={SESSION_RPC_CHANNELS};
return {attachWorkbuddyAppServerSessionRuntime,registerWorkbuddyDaemonSessionRuntimeHandlers,registerWorkbuddySessionCreateConfigHandlers,registerWorkbuddySessionAuxiliaryHandlers,SESSION_RPC_CHANNELS,WORKBUDDY_SESSION_AUX_RPC_CHANNELS,SESSION_RUNTIME_ROUTE_STATE_CHANNEL};
}

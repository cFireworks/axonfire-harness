// @ts-nocheck
// Complete original Desktop LOAD handler and helper declarations.
import * as node_path from 'node:path';
export const LOAD_RPC_MAIN_SHA256='528d3bffc67c5244d1a641e0cfc13c2be4ef7943c248b390125b76d70880ed19';
export const LOAD_RPC_MAIN_FUNCTIONS=[["registerWorkbuddySessionLoadHandler",3574425,3583957],["normalizeLoadCwd",3573416,3573810],["createReplayLoadResult",3573811,3574424],["normalizeTaskStatus",3519139,3520032],["findReplayCwd",3573225,3573415],["trimEventsFromFirstUserMessage",3572327,3572621],["markRendererHistoryReplayPayload",3572037,3572326],["toScopedSessionReplayPayload",3571713,3572036],["isTerminalTaskStatus",3516789,3516959],["mapTaskStatusToStopReason",3572994,3573224],["isMissingSessionReplayError",3571387,3571592],["isAutomationWorkspaceCwd",3571593,3571712],["isOwnerReplayHydratablePayload",3572622,3572993]] as const;
export const LOAD_RPC_MAIN_VARIABLES=[["RENDERER_HISTORY_REPLAY_META_KEY",3571314,3571385]] as const;
export const LOAD_RPC_COORDINATOR_SHA256='8624215504229c4b6190f5c2172da270e015cc96871e90b261786f047e4c6e78';
export const LOAD_RPC_COORDINATOR_FUNCTIONS=[] as const;
export const LOAD_RPC_COORDINATOR_VARIABLES=[["SESSION_RPC_CHANNELS",283316,285782]] as const;

export function createNativeSessionLoadRpc(runtime:any={}):any {
const setTimeout=runtime.setTimeout ?? globalThis.setTimeout;
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
const RENDERER_HISTORY_REPLAY_META_KEY = "codebuddy.ai/rendererHistoryReplay";
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
return {registerWorkbuddySessionLoadHandler,SESSION_RPC_CHANNELS};
}

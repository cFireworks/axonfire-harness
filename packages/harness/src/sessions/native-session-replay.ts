// @ts-nocheck
// Complete original replay replacement, priming and payload hydration methods.
import * as node_path from "node:path";
export const SESSION_REPLAY_SHA256='528d3bffc67c5244d1a641e0cfc13c2be4ef7943c248b390125b76d70880ed19';
export const SESSION_REPLAY_MEMBERS=[["replaceSessionReplayState",4583987,4586576],["primeSessionReplay",4582913,4583472],["replaceSessionReplay",4583474,4583985],["hydrateSessionReplayPayload",4694058,4699033],["isPluginRecommendationElicitation",4653944,4654427]] as const;
export const SESSION_REPLAY_FUNCTIONS=[["normalizeCwdPath",4572819,4573213],["getOwnerHistoryMode",4791857,4792086],["cloneSessionPayload",4782942,4783017],["isTaskTerminal",3516029,3516170],["deriveTaskStatus",3515378,3516028],["normalizeOwnerHistoryReplayPayload",4792613,4793081]] as const;
export function attachNativeSessionReplay(controller:any,deps:any={}):any {
function normalizeCwdPath(value) {
	if (typeof value !== "string") return;
	const trimmed = value.trim();
	if (!trimmed) return;
	const normalized = node_path.normalize(trimmed);
	const root = node_path.parse(normalized).root;
	let end = normalized.length;
	while (end > root.length && (normalized[end - 1] === "/" || normalized[end - 1] === "\\")) end -= 1;
	return normalized.slice(0, end);
}
function getOwnerHistoryMode(payload) {
	const meta = payload._meta?.["codebuddy.ai"];
	if (!meta || typeof meta !== "object") return null;
	const mode = meta.mode;
	return mode === "history" || mode === "stream" ? mode : null;
}
function cloneSessionPayload(payload) {
	return structuredClone(payload);
}
function isTaskTerminal(state) {
	return state.terminalOutcome !== null || state.runState === "errored" || state.runState === "terminated";
}
function deriveTaskStatus(state) {
	if (state.archivedAt) return "archived";
	if (state.runState === "awaiting_input") return "pending";
	if (state.runState === "running" && state.executionStage === "planning") return "planning";
	if (state.runState === "running") return "working";
	if (state.runState === "terminated" || state.terminalOutcome === "terminated") return "terminated";
	if (state.runState === "errored" || state.terminalOutcome === "error") return "error";
	if (state.terminalOutcome === "failed") return "failed";
	if (state.terminalOutcome === "completed") return "completed";
	return state.turnSeq === 0 ? "pending" : "completed";
}
function normalizeOwnerHistoryReplayPayload(payload) {
	const nextPayload = cloneSessionPayload(payload);
	const existingMeta = nextPayload._meta;
	const existingCodebuddyMeta = existingMeta?.["codebuddy.ai"];
	const codebuddyMeta = existingCodebuddyMeta && typeof existingCodebuddyMeta === "object" ? existingCodebuddyMeta : {};
	nextPayload._meta = {
		...existingMeta ?? {},
		"codebuddy.ai": {
			...codebuddyMeta,
			mode: "history"
		}
	};
	return nextPayload;
}
class NativeSessionReplay {
replaceSessionReplayState(active, replayEvents, cwd) {
		const sessionId = active.sessionId;
		const normalizedCwd = normalizeCwdPath(cwd);
		if (normalizedCwd) active.cwd = normalizedCwd;
		const liveTail = active.ownerHistoryHydrated ? [] : active.eventHistory.filter((event) => getOwnerHistoryMode(event) !== "history").map((event) => cloneSessionPayload(event));
		const liveTaskState = { ...active.taskState };
		const livePendingPermissionRequests = new Map(active.pendingPermissionRequests);
		const livePendingQuestionRequests = new Map(active.pendingQuestionRequests);
		const livePendingElicitationRequests = new Map(active.pendingElicitationRequests);
		const preserveLiveControlState = active.isProcessing || active.stopRequested || livePendingPermissionRequests.size > 0 || livePendingQuestionRequests.size > 0 || livePendingElicitationRequests.size > 0;
		active.eventHistory = [];
		active.hasUserMessageSinceLastCompact = false;
		active.planSnapshot = void 0;
		active.toolResults.clear();
		active.pendingPermissionRequests.clear();
		active.pendingQuestionRequests.clear();
		active.pendingElicitationRequests.clear();
		const preReplayTaskState = { ...active.taskState };
		for (const replayEvent of replayEvents) this.hydrateSessionReplayPayload(active, replayEvent, "history");
		for (const liveEvent of liveTail) this.hydrateSessionReplayPayload(active, liveEvent, "live");
		if (preserveLiveControlState) {
			active.taskState = liveTaskState;
			active.pendingPermissionRequests.clear();
			active.pendingQuestionRequests.clear();
			active.pendingElicitationRequests.clear();
			for (const [requestId, pending] of livePendingPermissionRequests) active.pendingPermissionRequests.set(requestId, pending);
			for (const [toolCallId, pending] of livePendingQuestionRequests) active.pendingQuestionRequests.set(toolCallId, pending);
			for (const [elicitationId, pending] of livePendingElicitationRequests) active.pendingElicitationRequests.set(elicitationId, pending);
		} else if (isTaskTerminal(preReplayTaskState) && !isTaskTerminal(active.taskState)) {
			const previousStatus = deriveTaskStatus(preReplayTaskState);
			this.logDiagnostic("warn", `[SessionManager] replaceSessionReplay: replay reverted terminal status '${previousStatus}' to '${deriveTaskStatus(active.taskState)}' for session ${sessionId}, restoring terminal state`);
			active.taskState = { ...preReplayTaskState };
			active.pendingPermissionRequests.clear();
			active.pendingQuestionRequests.clear();
			active.pendingElicitationRequests.clear();
		}
		active.ownerHistoryHydrated = true;
	}
async primeSessionReplay(sessionId, replayEvents, cwd, expectedHistoryStoreGeneration) {
		if (expectedHistoryStoreGeneration !== void 0 && expectedHistoryStoreGeneration !== this.getHistoryStoreGeneration(sessionId)) return;
		if (this.sessions.get(sessionId)) {
			await this.replaceSessionReplay(sessionId, replayEvents, cwd, expectedHistoryStoreGeneration);
			return;
		}
		const nextEvents = replayEvents.map((event) => cloneSessionPayload(event));
		this.primedReplayStates.set(sessionId, {
			cwd: normalizeCwdPath(cwd),
			events: nextEvents
		});
	}
async replaceSessionReplay(sessionId, replayEvents, cwd, expectedHistoryStoreGeneration) {
		if (expectedHistoryStoreGeneration !== void 0 && expectedHistoryStoreGeneration !== this.getHistoryStoreGeneration(sessionId)) return;
		const active = this.sessions.get(sessionId);
		if (!active) {
			await this.primeSessionReplay(sessionId, replayEvents, cwd, expectedHistoryStoreGeneration);
			return;
		}
		this.replaceSessionReplayState(active, replayEvents, cwd);
		this.primedReplayStates.delete(sessionId);
	}
hydrateSessionReplayPayload(session, payload, source) {
		let clonedPayload = cloneSessionPayload(payload);
		const isReplay = source === "history";
		if (clonedPayload.update && typeof clonedPayload.update === "object") {
			const preparedPlan = this.preparePlanNotification(session, clonedPayload);
			clonedPayload = preparedPlan.payload;
			const effectivePayload = isReplay ? normalizeOwnerHistoryReplayPayload(clonedPayload) : clonedPayload;
			if (this.recordSessionEvent(session, effectivePayload, { isReplay }) === "duplicate") return;
			this.commitPreparedPlanSnapshot(session, preparedPlan);
			this.captureToolResultFromUpdate(session, effectivePayload);
			this.handleBackendSessionUpdate(session, effectivePayload);
			const derivedPlan = this.createPlanNotificationFromTaskToolResult(session, effectivePayload);
			if (derivedPlan) {
				const derivedPayload = isReplay ? normalizeOwnerHistoryReplayPayload(derivedPlan.payload) : derivedPlan.payload;
				if (this.recordSessionEvent(session, derivedPayload, { isReplay }) !== "duplicate") this.commitPreparedPlanSnapshot(session, {
					...derivedPlan,
					payload: derivedPayload
				});
			}
			return;
		}
		if (isReplay) clonedPayload = normalizeOwnerHistoryReplayPayload(clonedPayload);
		switch (typeof clonedPayload.type === "string" ? clonedPayload.type : null) {
			case "permissionRequest": {
				const requestId = typeof clonedPayload.requestId === "string" ? clonedPayload.requestId : null;
				const request = clonedPayload.request;
				if (!requestId || !request || typeof request !== "object") return;
				this.applyTaskSignal(session, {
					type: "awaiting_input",
					kind: "permission"
				});
				session.pendingPermissionRequests.set(requestId, {
					requestId,
					receivedAt: Date.now(),
					request: structuredClone(request)
				});
				break;
			}
			case "questionRequest": {
				const toolCallId = typeof clonedPayload.toolCallId === "string" ? clonedPayload.toolCallId : null;
				const request = clonedPayload.request;
				if (!toolCallId || !request || typeof request !== "object") return;
				const requestRecord = request;
				const isPluginRecommendation = requestRecord.inputType === "plugin_recommendation" && !!requestRecord.pluginRecommendation && typeof requestRecord.pluginRecommendation === "object";
				if (isReplay && isPluginRecommendation && !this.pluginRecommendationRegistry?.getPendingRequest(session.sessionId, toolCallId)) return;
				this.applyTaskSignal(session, {
					type: "awaiting_input",
					kind: "question"
				});
				session.pendingQuestionRequests.set(toolCallId, {
					toolCallId,
					receivedAt: Date.now(),
					request: structuredClone(request)
				});
				break;
			}
			case "elicitationRequest": {
				const elicitationId = typeof clonedPayload.elicitationId === "string" ? clonedPayload.elicitationId : null;
				const request = clonedPayload.request;
				if (!elicitationId || !request || typeof request !== "object") return;
				if (isReplay && this.isPluginRecommendationElicitation(request) && !this.pluginRecommendationRegistry?.getPendingRequest(session.sessionId, elicitationId)) return;
				this.applyTaskSignal(session, {
					type: "awaiting_input",
					kind: "question"
				});
				session.pendingElicitationRequests.set(elicitationId, {
					elicitationId,
					receivedAt: Date.now(),
					request: structuredClone(request)
				});
				break;
			}
			case "pluginRecommendationRequest": {
				const recommendationId = typeof clonedPayload.recommendationId === "string" ? clonedPayload.recommendationId : null;
				const request = clonedPayload.request;
				const deadline = clonedPayload.deadline;
				if (!recommendationId || !request || typeof request !== "object" || typeof deadline !== "number") return;
				const req = request;
				this.applyTaskSignal(session, {
					type: "awaiting_input",
					kind: "plugin_recommendation"
				});
				session.pendingPluginRecommendations.set(recommendationId, {
					recommendationId,
					type: req.type,
					deadline,
					receivedAt: Date.now(),
					candidates: req.plugins.map((p) => ({
						pluginId: p.pluginId,
						pluginName: p.pluginName ?? p.pluginId,
						description: p.description ?? ""
					})),
					candidateStates: Object.fromEntries(req.plugins.map((p) => [p.pluginId, "initial"])),
					candidateErrors: {},
					collectedChanges: [],
					countdownCancelled: false,
					settled: false
				});
				break;
			}
			case "questionCancelled": {
				const toolCallId = typeof clonedPayload.toolCallId === "string" ? clonedPayload.toolCallId : null;
				if (!toolCallId) return;
				this.pluginRecommendationRegistry?.cancelRequest(session.sessionId, toolCallId, "the recommendation question was cancelled");
				this.settleInputRequest(session, {
					kind: "tool",
					toolCallId
				});
				this.syncPendingInputStateAfterMutation(session);
				break;
			}
			default: return;
		}
		this.recordSessionEvent(session, clonedPayload, { isReplay });
	}
isPluginRecommendationElicitation(request) {
		if (!request || typeof request !== "object") return false;
		const meta = request._meta;
		if (!meta || typeof meta !== "object") return false;
		const codebuddyMeta = meta["codebuddy.ai"];
		if (!codebuddyMeta || typeof codebuddyMeta !== "object") return false;
		const record = codebuddyMeta;
		return record.inputType === "plugin_recommendation" && !!record.pluginRecommendation && typeof record.pluginRecommendation === "object";
	}
}
for(const name of ["replaceSessionReplayState","primeSessionReplay","replaceSessionReplay","hydrateSessionReplayPayload","isPluginRecommendationElicitation"])Object.defineProperty(controller,name,Object.getOwnPropertyDescriptor(NativeSessionReplay.prototype,name));
controller.primedReplayStates ??= new Map();
if(deps.pluginRecommendationRegistry!==undefined)controller.pluginRecommendationRegistry=deps.pluginRecommendationRegistry;
return controller;
}

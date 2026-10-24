// @ts-nocheck
// Complete original SessionManager cancellation, queue and extension entrypoints.
export const SESSION_OPERATIONS_SHA256="528d3bffc67c5244d1a641e0cfc13c2be4ef7943c248b390125b76d70880ed19";
export const SESSION_OPERATIONS_FUNCTIONS=[["deriveTaskStatus",3515378,3516028],["isTaskTerminal",3516029,3516170]] as const;
export const SESSION_OPERATIONS_MEMBERS=[["cancel",4633892,4633988],["cancelPluginRecommendationRun",4633990,4634376],["cancelSessionRun",4634378,4636317],["finalizeStaleToolCallsForDetachedCancel",4636319,4636818],["getMessageQueue",4662824,4663046],["saveMessageQueue",4663048,4663316],["enqueueMessage",4663318,4663472],["removeQueueItem",4663474,4663616],["popQueueItemForEdit",4663618,4663768],["reorderQueue",4663770,4663914],["sendQueueItemNow",4663916,4664060],["activateMessageQueue",4664062,4664200],["pauseMessageQueue",4664202,4664348],["resumeMessageQueue",4664350,4664484],["cancelMessageQueue",4664486,4664620],["getQueueState",4664622,4664843],["requestYield",4662686,4662822],["getAvailableCommands",4661637,4661983],["getSubagentList",4661985,4662388],["respondToSampling",4662390,4662539],["respondToRoots",4662541,4662684],["broadcastExtMethod",4781782,4782236],["callExtMethod",4782577,4782938],["resolveTargetSessionId",4709421,4709573]] as const;
export function attachNativeSessionOperations(controller:any,deps:any={}):any {
const console=deps.console??globalThis.console;
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
function isTaskTerminal(state) {
	return state.terminalOutcome !== null || state.runState === "errored" || state.runState === "terminated";
}
class NativeSessionOperations {
async cancel(sessionId, request) {
		await this.cancelSessionRun(sessionId, request, "user");
	}
async cancelPluginRecommendationRun(sessionId, request) {
		try {
			await this.cancelSessionRun(sessionId, request, "recommendation_switch");
		} catch (error) {
			const session = this.sessions.get(sessionId);
			if (session?.pluginRecommendationCancelRequested) {
				session.pluginRecommendationCancelRequested = false;
				session.stopRequested = false;
			}
			throw error;
		}
	}
async cancelSessionRun(sessionId, request, source) {
		await this.withReadySession(sessionId, async (session) => {
			const wasProcessing = session.isProcessing;
			const stopReason = source === "user" ? "cancelled" : "recommendation_switch";
			this.logDiagnostic("info", "[SessionManager] cancel() called", {
				sessionId: session.sessionId,
				source,
				runState: session.taskState.runState,
				pendingInputKind: session.taskState.pendingInputKind,
				isProcessing: session.isProcessing,
				stopRequested: session.stopRequested
			});
			session.userCancelRequested = source === "user";
			session.pluginRecommendationCancelRequested = source === "recommendation_switch";
			this.requestProcessingStop(session);
			await session.backend.cancel(request);
			const statusAfterCancel = deriveTaskStatus(session.taskState);
			const hasActiveTeamMembers = this.hasActiveTeamMembers(session);
			if (!wasProcessing && !isTaskTerminal(session.taskState) && !hasActiveTeamMembers && (statusAfterCancel === "planning" || statusAfterCancel === "working") && this.hasActiveToolCall(session)) this.finalizeStaleToolCallsForDetachedCancel(session);
			const canFinalizeDetachedCancel = !wasProcessing && !isTaskTerminal(session.taskState) && !hasActiveTeamMembers && !this.hasActiveToolCall(session) && (statusAfterCancel === "planning" || statusAfterCancel === "working");
			if (session.stopRequested && session.teamRuntime.deferredCompletion && !isTaskTerminal(session.taskState)) {
				this.applyTaskSignal(session, {
					type: "turn_completed",
					stopReason
				});
				this.markTurnCompletionFinalized(session, stopReason);
				await this.flushSessionEffects(sessionId);
				await this.onProcessingStopped(session, "interrupted");
			} else if (canFinalizeDetachedCancel) {
				this.applyTaskSignal(session, {
					type: "turn_completed",
					stopReason
				});
				await this.flushSessionEffects(session.sessionId);
			}
		});
	}
finalizeStaleToolCallsForDetachedCancel(session) {
		let finalizedCount = 0;
		const now = Date.now();
		for (const entry of session.toolResults.values()) {
			if (entry.status !== "pending" && entry.status !== "in_progress") continue;
			entry.status = "failed";
			entry.updatedAt = now;
			finalizedCount += 1;
		}
		if (finalizedCount > 0) this.logDiagnostic("info", "[SessionManager] finalized stale tool calls for detached cancel", {
			sessionId: session.sessionId,
			finalizedCount
		});
	}
async getMessageQueue(sessionId) {
		const session = this.sessions.get(sessionId);
		if (!session) return;
		await this.prepareBackendForOperation(session, "getMessageQueue");
		return session.backend.getMessageQueue();
	}
async saveMessageQueue(data) {
		const { sessionId, ...payload } = data;
		const session = this.sessions.get(sessionId);
		if (!session) return;
		await this.prepareBackendForOperation(session, "saveMessageQueue");
		await session.backend.saveMessageQueue(payload);
	}
async enqueueMessage(sessionId, contentBlocks) {
		return this.withReadySession(sessionId, (session) => session.backend.enqueueMessage(contentBlocks));
	}
async removeQueueItem(sessionId, itemId) {
		return this.withReadySession(sessionId, (session) => session.backend.removeQueueItem(itemId));
	}
async popQueueItemForEdit(sessionId, itemId) {
		return this.withReadySession(sessionId, (session) => session.backend.popQueueItemForEdit(itemId));
	}
async reorderQueue(sessionId, orderedIds) {
		return this.withReadySession(sessionId, (session) => session.backend.reorderQueue(orderedIds));
	}
async sendQueueItemNow(sessionId, itemId) {
		return this.withReadySession(sessionId, (session) => session.backend.sendQueueItemNow(itemId));
	}
async activateMessageQueue(sessionId) {
		return this.withReadySession(sessionId, (session) => session.backend.activateMessageQueue());
	}
async pauseMessageQueue(sessionId, reason) {
		return this.withReadySession(sessionId, (session) => session.backend.pauseMessageQueue(reason));
	}
async resumeMessageQueue(sessionId) {
		return this.withReadySession(sessionId, (session) => session.backend.resumeMessageQueue());
	}
async cancelMessageQueue(sessionId) {
		return this.withReadySession(sessionId, (session) => session.backend.cancelMessageQueue());
	}
async getQueueState(sessionId) {
		const session = this.sessions.get(sessionId);
		if (!session) return null;
		await this.prepareBackendForOperation(session, "getQueueState");
		return session.backend.getQueueState();
	}
async requestYield(sessionId) {
		await this.withReadySession(sessionId, (session) => session.backend.requestYield());
		return true;
	}
async getAvailableCommands(params) {
		const sessionId = this.resolveTargetSessionId(params?.sessionId);
		if (!sessionId) return [];
		const session = this.sessions.get(sessionId);
		if (!session) return [];
		await this.prepareBackendForOperation(session, "getAvailableCommands");
		return session.backend.getAvailableCommands(params ?? {});
	}
async getSubagentList(params) {
		const sessionId = this.resolveTargetSessionId(params?.sessionId);
		if (!sessionId) return {
			subagents: [],
			results: []
		};
		const session = this.sessions.get(sessionId);
		if (!session) return {
			subagents: [],
			results: []
		};
		await this.prepareBackendForOperation(session, "getSubagentList");
		return session.backend.getSubagentList(params ?? {});
	}
async respondToSampling(sessionId, response) {
		await this.withReadySession(sessionId, (session) => session.backend.respondToSampling(response));
	}
async respondToRoots(sessionId, response) {
		await this.withReadySession(sessionId, (session) => session.backend.respondToRoots(response));
	}
async broadcastExtMethod(method, params = {}) {
		const calls = [];
		for (const session of this.sessions.values()) {
			const backend = session.backend;
			if (!backend || typeof backend.extMethod !== "function") continue;
			calls.push(backend.extMethod(method, params).then(() => void 0).catch((error) => {
				console.warn(`[SessionManager] broadcastExtMethod(${method}) failed for session:`, error);
			}));
		}
		await Promise.allSettled(calls);
	}
async callExtMethod(sessionId, method, params = {}) {
		return this.withReadySession(sessionId, async (session) => {
			const backend = session.backend;
			if (!backend || typeof backend.extMethod !== "function") throw new Error(`[SessionManager] Session "${sessionId}" backend does not support extMethod`);
			return backend.extMethod(method, params);
		});
	}
resolveTargetSessionId(preferredSessionId) {
		if (preferredSessionId) return preferredSessionId;
		return this.sessions.keys().next().value ?? null;
	}
}
for(const [name] of SESSION_OPERATIONS_MEMBERS) Object.defineProperty(controller,name,Object.getOwnPropertyDescriptor(NativeSessionOperations.prototype,name));
for(const name of ['sessions','withReadySession','prepareBackendForOperation','requestProcessingStop','hasActiveTeamMembers','hasActiveToolCall','applyTaskSignal','markTurnCompletionFinalized','flushSessionEffects','onProcessingStopped','logDiagnostic']) if(deps[name]!==undefined) controller[name]=deps[name];
return controller;
}

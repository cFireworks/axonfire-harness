// @ts-nocheck
// Complete original renderer loading, stored history and pending input replay methods.
import * as node_path from "node:path";
export const SESSION_LOADING_SHA256='528d3bffc67c5244d1a641e0cfc13c2be4ef7943c248b390125b76d70880ed19';
export const SESSION_LOADING_MEMBERS=[["loadSession",4581783,4582911],["replayStoredSessionHistory",4587445,4588438],["hasStoredSessionHistory",4588440,4588591],["replayPendingInputs",4588593,4588730],["replayActivePendingInputs",4588732,4588901],["emitStoredSessionHistory",4692213,4692675],["emitStoredSessionHistoryLiveSafe",4693199,4693846],["loadInactiveSessionState",4704957,4705935],["emitStoredSessionControlState",4691985,4692211],["emitPendingInputs",4690848,4691983],["planSnapshotToEvent",4693848,4694056]] as const;
export const SESSION_LOADING_FUNCTIONS=[["cloneSessionPayload",4782942,4783017],["normalizeOwnerHistoryReplayPayload",4792613,4793081],["isOwnerInputRequestPayload",4791223,4791442],["normalizeCwdPath",4572819,4573213]] as const;
export function attachNativeSessionLoading(controller:any,deps:any={}):any {
function cloneSessionPayload(payload) {
	return structuredClone(payload);
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
function isOwnerInputRequestPayload(payload) {
	const type = typeof payload.type === "string" ? payload.type : null;
	return type === "permissionRequest" || type === "questionRequest" || type === "elicitationRequest";
}
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
class NativeSessionLoading {
async loadSession(sessionId, cwd, options) {
		const active = this.sessions.get(sessionId);
		if (!active) {
			const session = await this.loadInactiveSessionState(sessionId, cwd);
			return {
				...this.toSessionInfo(session),
				rendererHistoryReplayComplete: true
			};
		}
		const isLiveTurnActive = active.isProcessing === true || active.promptInvocationActive === true;
		let rendererHistoryReplayComplete = false;
		if (options?.forceRendererHistoryReplay && !isLiveTurnActive) {
			this.emitStoredSessionHistory(active);
			this.emitPendingInputs(active);
			rendererHistoryReplayComplete = true;
		} else if (options?.forceRendererHistoryReplay && isLiveTurnActive) {
			this.logDiagnostic("info", "[SessionManager] loadSession: partial history replay (live turn active)", {
				sessionId,
				isProcessing: active.isProcessing,
				promptInvocationActive: active.promptInvocationActive
			});
			this.emitStoredSessionHistoryLiveSafe(active);
			this.emitPendingInputs(active);
		} else this.emitStoredSessionControlState(active);
		return {
			...this.toSessionInfo(active),
			rendererHistoryReplayComplete
		};
	}
replayStoredSessionHistory(sessionId) {
		const active = this.sessions.get(sessionId);
		if (active?.ownerHistoryHydrated) {
			if (active.isProcessing === true || active.promptInvocationActive === true) {
				this.logDiagnostic("info", "[SessionManager] replayStoredSessionHistory: partial (live turn active)", {
					sessionId,
					isProcessing: active.isProcessing,
					promptInvocationActive: active.promptInvocationActive
				});
				this.emitStoredSessionHistoryLiveSafe(active);
				return {
					replayed: true,
					complete: false
				};
			}
			this.emitStoredSessionHistory(active);
			return {
				replayed: true,
				complete: true
			};
		}
		const primed = this.primedReplayStates.get(sessionId);
		if (!primed) return {
			replayed: false,
			complete: false
		};
		for (const payload of primed.events.map((event) => cloneSessionPayload(event))) this.emitScoped(sessionId, normalizeOwnerHistoryReplayPayload(payload));
		return {
			replayed: true,
			complete: true
		};
	}
hasStoredSessionHistory(sessionId) {
		return this.sessions.get(sessionId)?.ownerHistoryHydrated === true || this.primedReplayStates.has(sessionId);
	}
async replayPendingInputs(sessionId) {
		const session = await this.resolveReadySession(sessionId);
		this.emitPendingInputs(session);
	}
replayActivePendingInputs(sessionId) {
		const session = this.sessions.get(sessionId);
		if (!session) return false;
		this.emitPendingInputs(session);
		return true;
	}
emitStoredSessionHistory(session) {
		const historySnapshot = session.eventHistory.map((event) => cloneSessionPayload(event));
		for (const payload of historySnapshot) {
			if (isOwnerInputRequestPayload(payload)) continue;
			this.emitScoped(session.sessionId, normalizeOwnerHistoryReplayPayload(payload));
		}
		if (session.planSnapshot) this.emitScoped(session.sessionId, normalizeOwnerHistoryReplayPayload(this.planSnapshotToEvent(session.planSnapshot)));
	}
emitStoredSessionHistoryLiveSafe(session) {
		const historySnapshot = session.eventHistory.map((event) => cloneSessionPayload(event));
		let emittedUserMessages = 0;
		for (const payload of historySnapshot) {
			if (isOwnerInputRequestPayload(payload)) continue;
			if (payload?.update?.sessionUpdate !== "user_message_chunk") continue;
			this.emitScoped(session.sessionId, normalizeOwnerHistoryReplayPayload(payload));
			emittedUserMessages += 1;
		}
		this.logDiagnostic("info", "[SessionManager] emitStoredSessionHistoryLiveSafe done", {
			sessionId: session.sessionId,
			totalEvents: historySnapshot.length,
			emittedUserMessages
		});
	}
async loadInactiveSessionState(sessionId, cwd) {
		const active = this.sessions.get(sessionId);
		if (active) return active;
		const pendingRestore = this.pendingSessionRestores.get(sessionId);
		if (pendingRestore) {
			if (pendingRestore.kind === "load") return pendingRestore.promise;
			const resumed = await pendingRestore.promise;
			this.beginHistoryHydration(resumed);
			resumed.awaitingHistoryReplayEnd = true;
			resumed.sawHistoryReplayStart = false;
			resumed.sawHistoryReplayContent = false;
			const replayCwd = normalizeCwdPath(resumed.cwd) ?? normalizeCwdPath(cwd);
			if (!replayCwd) throw new Error(`Cannot replay inactive session "${sessionId}" without cwd`);
			try {
				await resumed.backend.loadSession({
					cwd: replayCwd,
					mcpServers: [],
					_meta: resumed._meta
				});
			} finally {
				this.finishHistoryHydrationAfterBackendReplay(resumed);
			}
			return resumed;
		}
		return this.restoreInactiveSessionState(sessionId, cwd, "load");
	}
emitStoredSessionControlState(session) {
		this.emitPendingInputs(session);
		if (session.planSnapshot) this.emitScoped(session.sessionId, normalizeOwnerHistoryReplayPayload(this.planSnapshotToEvent(session.planSnapshot)));
	}
emitPendingInputs(session) {
		for (const pending of session.pendingPermissionRequests.values()) this.emitScoped(session.sessionId, {
			type: "permissionRequest",
			sessionId: session.sessionId,
			requestId: pending.requestId,
			request: pending.request,
			workbuddyReplayKind: "pendingInput"
		});
		for (const pending of session.pendingQuestionRequests.values()) this.emitScoped(session.sessionId, {
			type: "questionRequest",
			sessionId: session.sessionId,
			toolCallId: pending.toolCallId,
			request: pending.request,
			workbuddyReplayKind: "pendingInput"
		});
		for (const pending of session.pendingElicitationRequests.values()) {
			this.logDiagnostic("info", "[SessionManager][Elicitation] replay pendingElicitation on loadSession", {
				sessionId: session.sessionId,
				elicitationId: pending.elicitationId,
				toolCallId: this.extractElicitationToolCallId(pending.request)
			});
			this.emitScoped(session.sessionId, {
				type: "elicitationRequest",
				sessionId: session.sessionId,
				elicitationId: pending.elicitationId,
				request: pending.request,
				workbuddyReplayKind: "pendingInput"
			});
		}
	}
planSnapshotToEvent(snapshot) {
		return {
			sessionId: snapshot.sessionId,
			update: cloneSessionPayload(snapshot.update),
			...snapshot._meta ? { _meta: cloneSessionPayload(snapshot._meta) } : {}
		};
	}
}
for(const name of ["loadSession","replayStoredSessionHistory","hasStoredSessionHistory","replayPendingInputs","replayActivePendingInputs","emitStoredSessionHistory","emitStoredSessionHistoryLiveSafe","loadInactiveSessionState","emitStoredSessionControlState","emitPendingInputs","planSnapshotToEvent"])Object.defineProperty(controller,name,Object.getOwnPropertyDescriptor(NativeSessionLoading.prototype,name));
controller.primedReplayStates ??= new Map();

return controller;
}

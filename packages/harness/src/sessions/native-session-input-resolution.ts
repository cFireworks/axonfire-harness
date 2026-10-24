// @ts-nocheck
// Complete original SessionManager input-resolution methods; lifecycle/state hooks remain explicit.
export const SESSION_INPUT_RESOLUTION_SHA256="528d3bffc67c5244d1a641e0cfc13c2be4ef7943c248b390125b76d70880ed19";
export const SESSION_INPUT_RESOLUTION_FUNCTIONS=[] as const;
export const SESSION_INPUT_RESOLUTION_MEMBERS=[["respondToPermission",4637821,4638209],["rejectPermission",4638211,4638589],["normalizeInterruptionResolution",4638591,4638813],["resolveQuestionInput",4639116,4640613],["resolveInterruption",4641099,4642158],["respondToSandboxIntercept",4642160,4642691],["answerQuestion",4642693,4643091],["respondElicitation",4655568,4656319],["cancelQuestion",4656321,4657030],["recordSyntheticQuestionCancelledEvent",4690390,4690846]] as const;
export function attachNativeSessionInputResolution(controller:any,deps:any={}):any {
const console=deps.console??globalThis.console;
class NativeSessionInputResolution {
async respondToPermission(sessionId, requestId, optionId) {
		return this.withReadySession(sessionId, (session) => {
			const accepted = session.backend.respondToPermission(requestId, optionId);
			if (accepted) {
				this.settleInputRequest(session, {
					kind: "permission",
					requestId
				});
				this.syncPendingInputStateAfterMutation(session);
			}
			return accepted;
		});
	}
async rejectPermission(sessionId, requestId, reason) {
		return this.withReadySession(sessionId, (session) => {
			const rejected = session.backend.rejectPermission(requestId, reason);
			if (rejected) {
				this.settleInputRequest(session, {
					kind: "permission",
					requestId
				});
				this.syncPendingInputStateAfterMutation(session);
			}
			return rejected;
		});
	}
normalizeInterruptionResolution(result) {
		if (typeof result === "boolean") return {
			resolved: result,
			queued: false
		};
		return {
			resolved: result?.resolved === true,
			queued: result?.queued === true
		};
	}
async resolveQuestionInput(session, toolCallId, decision, answers, reason) {
		const permissionRequestIdsBeforeResolve = this.getPendingPermissionRequestIdsForToolCall(session, toolCallId);
		const hadQuestionRequestBeforeResolve = session.pendingQuestionRequests.has(toolCallId);
		const rawSemanticResult = session.backend.resolveInterruption ? await session.backend.resolveInterruption(session.sessionId, toolCallId, decision, answers) : false;
		const semanticResult = this.normalizeInterruptionResolution(rawSemanticResult);
		const permissionRequestIds = [...new Set([...permissionRequestIdsBeforeResolve, ...this.getPendingPermissionRequestIdsForToolCall(session, toolCallId)])];
		const hasQuestionRequest = hadQuestionRequestBeforeResolve || session.pendingQuestionRequests.has(toolCallId);
		let permissionsResolved = permissionRequestIds.length === 0;
		if (permissionRequestIds.length > 0 && semanticResult.resolved) permissionsResolved = permissionRequestIds.map((requestId) => session.backend.respondToPermission(requestId, "allow")).every(Boolean);
		let questionResolved = !hasQuestionRequest;
		if (hasQuestionRequest) questionResolved = decision === "allow" ? session.backend.answerQuestion(toolCallId, answers ?? {}) : session.backend.cancelQuestion(toolCallId, reason);
		if (!permissionsResolved || !questionResolved) return false;
		if (permissionRequestIds.length > 0 || hasQuestionRequest) return true;
		return semanticResult.resolved || semanticResult.queued === true;
	}
async resolveInterruption(sessionId, toolCallId, decision, answers) {
		const log = (msg) => {
			this.logger?.info?.(msg);
			console.log(msg);
		};
		log(`[SessionManager] resolveInterruption called: sessionId=${sessionId}, toolCallId=${toolCallId}, decision=${decision}`);
		return this.withReadySession(sessionId, async (session) => {
			if (!session.backend.resolveInterruption) {
				log("[SessionManager] resolveInterruption: backend.resolveInterruption not available");
				return false;
			}
			log("[SessionManager] resolveInterruption: calling backend.resolveInterruption...");
			const result = this.normalizeInterruptionResolution(await session.backend.resolveInterruption(sessionId, toolCallId, decision, answers));
			log(`[SessionManager] resolveInterruption: backend returned resolved=${result.resolved} queued=${result.queued === true}`);
			if (result.resolved) {
				this.settleInputRequest(session, {
					kind: "tool",
					toolCallId
				});
				this.syncPendingInputStateAfterMutation(session);
			}
			return result.resolved;
		});
	}
async respondToSandboxIntercept(sessionId, requestId, choice) {
		await this.withReadySession(sessionId, (session) => {
			const resolved = session.backend.respondToSandboxIntercept?.(requestId, choice);
			if (!resolved) console.warn(`[SessionManager] respondToSandboxIntercept: backend did not handle requestId=${requestId}`);
			if (resolved) {
				this.settleInputRequest(session, {
					kind: "permission",
					requestId
				});
				this.syncPendingInputStateAfterMutation(session);
			}
			return resolved ?? false;
		});
	}
async answerQuestion(sessionId, toolCallId, answers) {
		return this.withReadySession(sessionId, async (session) => {
			const answered = await this.resolveQuestionInput(session, toolCallId, "allow", answers);
			if (answered) {
				this.settleInputRequest(session, {
					kind: "tool",
					toolCallId
				});
				this.syncPendingInputStateAfterMutation(session);
			}
			return answered;
		});
	}
async respondElicitation(sessionId, elicitationId, action, content) {
		return this.withReadySession(sessionId, async (session) => {
			const responded = session.backend.respondElicitation?.(elicitationId, action, content) ?? false;
			const hadPendingElicitation = session.pendingElicitationRequests.has(elicitationId);
			if (responded) this.settleInputRequest(session, {
				kind: "elicitation",
				elicitationId
			});
			this.logDiagnostic("info", "[SessionManager][Elicitation] respondElicitation", {
				sessionId: session.sessionId,
				elicitationId,
				action,
				responded,
				clearedElicitation: responded && hadPendingElicitation
			});
			if (responded) this.syncPendingInputStateAfterMutation(session);
			return responded;
		});
	}
async cancelQuestion(sessionId, toolCallId, reason) {
		return this.withReadySession(sessionId, async (session) => {
			this.logDiagnostic("info", "[SessionManager] cancelQuestion() called", {
				sessionId: session.sessionId,
				toolCallId,
				reason,
				runState: session.taskState.runState,
				isProcessing: session.isProcessing
			});
			const cancelled = await this.resolveQuestionInput(session, toolCallId, "deny", void 0, reason);
			if (cancelled) {
				this.settleInputRequest(session, {
					kind: "tool",
					toolCallId
				});
				this.recordSyntheticQuestionCancelledEvent(session, toolCallId, reason);
				this.syncPendingInputStateAfterMutation(session);
			}
			return cancelled;
		});
	}
recordSyntheticQuestionCancelledEvent(session, toolCallId, reason) {
		const payload = {
			type: "questionCancelled",
			sessionId: session.sessionId,
			toolCallId,
			status: "executed",
			questionSkipped: true,
			...reason ? { reason } : {},
			_meta: { "codebuddy.ai": { syntheticOwnerHistory: true } }
		};
		this.recordSessionEvent(session, payload);
		this.emitOrBufferScopedEvent(session, payload);
		this.pushEvent("session:event", payload);
	}
}
for(const [name] of SESSION_INPUT_RESOLUTION_MEMBERS) Object.defineProperty(controller,name,Object.getOwnPropertyDescriptor(NativeSessionInputResolution.prototype,name));
for(const name of ['withReadySession','settleInputRequest','syncPendingInputStateAfterMutation','getPendingPermissionRequestIdsForToolCall','logger','logDiagnostic','recordSessionEvent','emitOrBufferScopedEvent','pushEvent']) if(deps[name]!==undefined) controller[name]=deps[name];
return controller;
}

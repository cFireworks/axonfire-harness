// @ts-nocheck
// Complete original inactive runtime reclaim and janitor methods.

export const SESSION_RECLAIM_SHA256='528d3bffc67c5244d1a641e0cfc13c2be4ef7943c248b390125b76d70880ed19';
export const SESSION_RECLAIM_MEMBERS=[["reclaimInactiveSessions",4594300,4594637],["startRuntimeReclaimJanitor",4594639,4595262],["stopRuntimeReclaimJanitor",4595264,4595483],["runInactiveSessionReclaim",4595485,4598617],["shouldProtectSessionFromRuntimeReclaim",4598619,4598859],["reclaimRuntimeSession",4598861,4599760]] as const;
export const SESSION_RECLAIM_FUNCTIONS=[["resolveRuntimeReclaimSweepIntervalMs",4785006,4785304],["resolveRuntimeReclaimIdleTimeoutMs",4784408,4784702],["resolveRuntimeReclaimMaxActiveSessions",4784703,4785005],["isTaskTerminal",3516029,3516170],["deriveTaskStatus",3515378,3516028]] as const;
export const SESSION_RECLAIM_VARIABLES=[["SESSION_RUNTIME_RECLAIM_POLICY",4574655,4574768]] as const;
export function attachNativeSessionReclaim(controller:any,runtime:any={}):any {
const Date=runtime.Date ?? globalThis.Date;
const setInterval=runtime.setInterval ?? globalThis.setInterval;
const clearInterval=runtime.clearInterval ?? globalThis.clearInterval;
const SESSION_RUNTIME_RECLAIM_POLICY = {
	idleTimeoutMs: 900 * 1e3,
	sweepIntervalMs: 30 * 1e3,
	maxActiveSessions: 6
};
function resolveRuntimeReclaimSweepIntervalMs(configured) {
	const value = Number.isFinite(configured) ? configured : void 0;
	if (typeof value === "number" && value <= 0) return Number.POSITIVE_INFINITY;
	return typeof value === "number" ? value : SESSION_RUNTIME_RECLAIM_POLICY.sweepIntervalMs;
}
function resolveRuntimeReclaimIdleTimeoutMs(configured) {
	const value = Number.isFinite(configured) ? configured : void 0;
	if (typeof value === "number" && value <= 0) return Number.POSITIVE_INFINITY;
	return typeof value === "number" ? value : SESSION_RUNTIME_RECLAIM_POLICY.idleTimeoutMs;
}
function resolveRuntimeReclaimMaxActiveSessions(configured) {
	const value = Number.isFinite(configured) ? configured : void 0;
	if (typeof value === "number" && value <= 0) return Number.POSITIVE_INFINITY;
	return typeof value === "number" ? value : SESSION_RUNTIME_RECLAIM_POLICY.maxActiveSessions;
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
class NativeSessionReclaim {
async reclaimInactiveSessions(options = {}) {
		if (this.runtimeReclaimPromise) return this.runtimeReclaimPromise;
		const promise = this.runInactiveSessionReclaim(options).finally(() => {
			if (this.runtimeReclaimPromise === promise) this.runtimeReclaimPromise = null;
		});
		this.runtimeReclaimPromise = promise;
		return promise;
	}
startRuntimeReclaimJanitor(options = {}) {
		this.stopRuntimeReclaimJanitor();
		this.runtimeReclaimJanitorOptions = { ...options };
		const sweepIntervalMs = resolveRuntimeReclaimSweepIntervalMs(options.sweepIntervalMs);
		if (!Number.isFinite(sweepIntervalMs)) return;
		const runSweep = () => {
			this.reclaimInactiveSessions(this.runtimeReclaimJanitorOptions).catch((error) => {
				this.logDiagnostic("warn", "[SessionManager] runtime reclaim janitor failed", error);
			});
		};
		this.runtimeReclaimJanitorTimer = setInterval(runSweep, sweepIntervalMs);
		this.runtimeReclaimJanitorTimer.unref?.();
		runSweep();
	}
stopRuntimeReclaimJanitor() {
		if (this.runtimeReclaimJanitorTimer) {
			clearInterval(this.runtimeReclaimJanitorTimer);
			this.runtimeReclaimJanitorTimer = void 0;
		}
		this.runtimeReclaimJanitorOptions = void 0;
	}
async runInactiveSessionReclaim(options) {
		const now = Date.now();
		const idleTimeoutMs = resolveRuntimeReclaimIdleTimeoutMs(options.idleTimeoutMs);
		const maxActiveSessions = resolveRuntimeReclaimMaxActiveSessions(options.maxActiveSessions);
		const activeSessionIds = new Set(this.sessions.keys());
		const eligibleCandidates = [];
		let ignoredCount = 0;
		let protectedCount = 0;
		let activeManagedSessionCount = 0;
		for (const sessionId of this.runtimeReclaimEligibleSince.keys()) if (!activeSessionIds.has(sessionId)) this.runtimeReclaimEligibleSince.delete(sessionId);
		for (const session of this.sessions.values()) {
			if (this.runtimeReclaimingSessions.has(session.sessionId)) continue;
			const sessionInfo = this.toSessionInfo(session);
			if (options.isSessionIgnored?.(sessionInfo)) {
				this.runtimeReclaimEligibleSince.delete(session.sessionId);
				ignoredCount += 1;
				continue;
			}
			activeManagedSessionCount += 1;
			if (this.shouldProtectSessionFromRuntimeReclaim(session)) {
				this.runtimeReclaimEligibleSince.delete(session.sessionId);
				protectedCount += 1;
				continue;
			}
			const eligibleSince = this.runtimeReclaimEligibleSince.get(session.sessionId) ?? now;
			this.runtimeReclaimEligibleSince.set(session.sessionId, eligibleSince);
			eligibleCandidates.push({
				session,
				eligibleSince
			});
		}
		eligibleCandidates.sort((left, right) => left.eligibleSince - right.eligibleSince);
		const willTriggerOverflow = Number.isFinite(maxActiveSessions) && activeManagedSessionCount > maxActiveSessions;
		if (willTriggerOverflow) this.logDiagnostic("debug", "[SessionManager] runtime reclaim decision", {
			totalSessions: this.sessions.size,
			activeManagedSessionCount,
			ignoredCount,
			protectedCount,
			eligibleCount: eligibleCandidates.length,
			maxActiveSessions,
			idleTimeoutMs,
			willTriggerOverflow
		});
		const reclaimed = [];
		const destroyedThisSweep = /* @__PURE__ */ new Set();
		if (willTriggerOverflow) {
			let overflow = activeManagedSessionCount - maxActiveSessions;
			for (const candidate of eligibleCandidates) {
				if (overflow <= 0) break;
				const reclaimedSession = await this.reclaimRuntimeSession(candidate.session, "max_active_sessions");
				if (reclaimedSession) {
					reclaimed.push(reclaimedSession);
					destroyedThisSweep.add(candidate.session.sessionId);
					overflow -= 1;
				}
			}
		}
		if (Number.isFinite(idleTimeoutMs) && idleTimeoutMs > 0) for (const candidate of eligibleCandidates) {
			if (destroyedThisSweep.has(candidate.session.sessionId)) continue;
			if (this.runtimeReclaimingSessions.has(candidate.session.sessionId)) continue;
			if (now - candidate.eligibleSince < idleTimeoutMs) continue;
			const reclaimedSession = await this.reclaimRuntimeSession(candidate.session, "background_idle_timeout");
			if (reclaimedSession) {
				reclaimed.push(reclaimedSession);
				destroyedThisSweep.add(candidate.session.sessionId);
			}
		}
		return {
			totalSessions: this.sessions.size,
			activeManagedSessionCount,
			ignoredCount,
			protectedCount,
			eligibleCount: eligibleCandidates.length,
			reclaimed
		};
	}
shouldProtectSessionFromRuntimeReclaim(session) {
		if (!isTaskTerminal(session.taskState)) return true;
		if (this.shouldProtectSessionFromDelete(session)) return true;
		if (this.hasActiveToolCall(session)) return true;
		return false;
	}
async reclaimRuntimeSession(session, reason) {
		const sessionId = session.sessionId;
		if (this.runtimeReclaimingSessions.has(sessionId)) return null;
		this.runtimeReclaimingSessions.add(sessionId);
		this.runtimeReclaimEligibleSince.delete(sessionId);
		const status = deriveTaskStatus(session.taskState);
		this.logDiagnostic("warn", "[SessionManager] reclaiming inactive runtime", {
			sessionId,
			status,
			reason
		});
		try {
			session.pendingPromptCancelCause = "runtime_reclaim";
			await this.destroySession(sessionId);
			return {
				sessionId,
				status,
				reason
			};
		} catch (error) {
			this.logDiagnostic("warn", "[SessionManager] failed to reclaim inactive runtime", {
				sessionId,
				status,
				reason,
				error: error instanceof Error ? error.message : String(error)
			});
			return null;
		} finally {
			this.runtimeReclaimingSessions.delete(sessionId);
		}
	}
}
for(const name of ["reclaimInactiveSessions","startRuntimeReclaimJanitor","stopRuntimeReclaimJanitor","runInactiveSessionReclaim","shouldProtectSessionFromRuntimeReclaim","reclaimRuntimeSession"])Object.defineProperty(controller,name,Object.getOwnPropertyDescriptor(NativeSessionReclaim.prototype,name));
controller.runtimeReclaimEligibleSince ??= new Map();
controller.runtimeReclaimingSessions ??= new Set();
controller.runtimeReclaimPromise ??= null;
return controller;
}

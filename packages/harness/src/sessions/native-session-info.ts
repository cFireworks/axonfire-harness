// @ts-nocheck
// Complete original session info, exported status and team view methods.
import * as node_path from "node:path";
import { createNativeSessionModes } from "./native-session-modes.js";
export const SESSION_INFO_SHA256='528d3bffc67c5244d1a641e0cfc13c2be4ef7943c248b390125b76d70880ed19';
export const SESSION_INFO_MEMBERS=[["toSessionInfo",4773824,4775084],["toSessionTeamRuntimeView",4772762,4773822],["toSessionTeamRuntimeMemberView",4772182,4772760],["deriveExportedTaskStatus",4770759,4771299],["deriveExportedPendingInputKind",4771301,4771934],["toSessionViewState",4775086,4776077],["getSession",4603324,4603460],["hasSession",4600850,4600915],["getSessionRecord",4610491,4610821],["rememberSessionCwd",4607671,4608493],["updateSessionStatus",4615085,4615592],["toSessionRecord",4777479,4779911],["toEphemeralSessionRecord",4776079,4777477]] as const;
export const SESSION_INFO_FUNCTIONS=[["isTaskTerminal",3516029,3516170],["readIsBackgroundAutomation",4571390,4571517],["readCodebuddyMeta",4570610,4570738],["readSessionSourceMode",4571012,4571389],["deriveTaskStatus",3515378,3516028],["isHardTerminalExportStatus",4785305,4785455],["deriveTerminalExportStatus",4796437,4796869],["cloneSessionPayload",4782942,4783017],["normalizeCwdPath",4572819,4573213],["normalizeTaskStatus",3519139,3520032],["isTerminalTaskStatus",3516789,3516959]] as const;
export function attachNativeSessionInfo(controller:any,deps:any={}):any {
const require_workbuddy_auth_product_coordinator = createNativeSessionModes();
function isTaskTerminal(state) {
	return state.terminalOutcome !== null || state.runState === "errored" || state.runState === "terminated";
}
function readIsBackgroundAutomation(meta) {
	return readCodebuddyMeta(meta)?.isBackgroundAutomation === true ? true : void 0;
}
function readCodebuddyMeta(meta) {
	const raw = meta?.["codebuddy.ai"];
	return raw && typeof raw === "object" ? raw : void 0;
}
function readSessionSourceMode(meta) {
	const codebuddyMeta = readCodebuddyMeta(meta);
	const sourceMode = codebuddyMeta?.sourceMode;
	if (typeof sourceMode === "string" && sourceMode.trim().length > 0) return sourceMode.trim();
	const welcomeMode = codebuddyMeta?.welcomeMode;
	if (typeof welcomeMode === "string" && welcomeMode.trim().length > 0) return welcomeMode.trim();
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
function isHardTerminalExportStatus(status) {
	return status === "failed" || status === "error" || status === "terminated" || status === "archived";
}
function deriveTerminalExportStatus(state) {
	if (state.archivedAt) return "archived";
	if (state.runState === "terminated" || state.terminalOutcome === "terminated") return "terminated";
	if (state.runState === "errored" || state.terminalOutcome === "error") return "error";
	if (state.terminalOutcome === "failed") return "failed";
	if (state.terminalOutcome === "completed") return "completed";
	return deriveTaskStatus(state);
}
function cloneSessionPayload(payload) {
	return structuredClone(payload);
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
function isTerminalTaskStatus(status) {
	return status === "completed" || status === "failed" || status === "error" || status === "terminated" || status === "archived";
}
class NativeSessionInfo {
toSessionInfo(session) {
		const configEntries = Object.entries(require_workbuddy_auth_product_coordinator.cloneDesiredConfig(session.desiredConfig)).filter(([, value]) => value !== void 0);
		const config = configEntries.length > 0 ? Object.fromEntries(configEntries) : void 0;
		const teamRuntime = this.toSessionTeamRuntimeView(session);
		const isTerminal = isTaskTerminal(session.taskState);
		return {
			sessionId: session.sessionId,
			cwd: session.cwd,
			createdAt: session.createdAt,
			updatedAt: session.updatedAt,
			lastActivityAt: session.lastActivityAt ?? session.taskState.lastActivityAt,
			userId: session.userId || void 0,
			config,
			isBackgroundAutomation: readIsBackgroundAutomation(session._meta),
			sourceMode: readSessionSourceMode(session._meta),
			status: this.deriveExportedTaskStatus(session),
			pendingInputKind: isTerminal ? void 0 : this.deriveExportedPendingInputKind(session),
			hasActiveTeamMembers: this.hasActiveTeamMembers(session),
			hasActiveToolCalls: !isTerminal && this.hasActiveToolCall(session),
			lastBackendActivityAt: session.lastBackendActivityAt,
			isProcessing: session.isProcessing,
			...teamRuntime ? { teamRuntime } : {},
			projectId: session.projectId,
			modeEpoch: session.modeEpoch
		};
	}
toSessionTeamRuntimeView(session) {
		const members = [...session.teamRuntime.membersByName.values()].map((member) => this.toSessionTeamRuntimeMemberView(member));
		if (!(session.teamRuntime.updatedAt !== void 0 || session.teamRuntime.teamTrulyIdle !== void 0 || members.length > 0)) return;
		return {
			isInTeam: session.teamRuntime.teamActive === true || session.teamRuntime.teamTrulyIdle !== void 0 || members.length > 0,
			...session.teamRuntime.teamName ? { teamName: session.teamRuntime.teamName } : {},
			...session.teamRuntime.isAutoTeam !== void 0 ? { isAutoTeam: session.teamRuntime.isAutoTeam } : {},
			...session.teamRuntime.teamActive !== void 0 ? { teamActive: session.teamRuntime.teamActive } : {},
			...session.teamRuntime.teamTrulyIdle !== void 0 ? { teamTrulyIdle: session.teamRuntime.teamTrulyIdle } : {},
			hasActiveMembers: session.teamRuntime.teamTrulyIdle === true ? false : this.hasActiveTeamMembers(session),
			members,
			...session.teamRuntime.updatedAt !== void 0 ? { updatedAt: session.teamRuntime.updatedAt } : {}
		};
	}
toSessionTeamRuntimeMemberView(member) {
		return {
			name: member.name,
			status: member.status,
			...member.color ? { color: member.color } : {},
			...member.description ? { description: member.description } : {},
			...member.taskId ? { taskId: member.taskId } : {},
			...member.sessionId ? { sessionId: member.sessionId } : {},
			...member.tokenUsage ? { tokenUsage: { ...member.tokenUsage } } : {},
			...member.toolCallCount !== void 0 ? { toolCallCount: member.toolCallCount } : {},
			...member.lastFailure ? { lastFailure: { ...member.lastFailure } } : {}
		};
	}
deriveExportedTaskStatus(session) {
		const taskStatus = deriveTaskStatus(session.taskState);
		if (isHardTerminalExportStatus(taskStatus)) return taskStatus;
		if (isTaskTerminal(session.taskState)) return deriveTerminalExportStatus(session.taskState);
		if (session.stopRequested && session.teamRuntime.deferredCompletion && !isTaskTerminal(session.taskState)) return "terminated";
		if (this.deriveExportedPendingInputKind(session)) return "pending";
		if (this.hasUnsettledTeamRuntime(session)) return "working";
		return taskStatus;
	}
deriveExportedPendingInputKind(session) {
		const fromRequests = this.getLatestPendingInputKind(session);
		const fromTaskState = session.taskState.pendingInputKind;
		const result = fromRequests ?? fromTaskState;
		if (result) this.logDiagnostic("info", `[SessionManager] deriveExportedPendingInputKind: returning '${result}'`, {
			sessionId: session.sessionId,
			fromRequests,
			fromTaskState,
			pendingPermissionCount: session.pendingPermissionRequests.size,
			pendingQuestionCount: session.pendingQuestionRequests.size,
			runState: session.taskState.runState,
			isProcessing: session.isProcessing
		});
		return result;
	}
toSessionViewState(session) {
		const info = this.toSessionInfo(session);
		const isTerminal = isTaskTerminal(session.taskState);
		return {
			...info,
			eventHistory: session.eventHistory.map((event) => cloneSessionPayload(event)),
			...session.planSnapshot ? { planSnapshot: cloneSessionPayload(session.planSnapshot) } : {},
			pendingPermissions: isTerminal ? [] : [...session.pendingPermissionRequests.values()].map(({ requestId, request }) => ({
				requestId,
				request: cloneSessionPayload(request)
			})),
			pendingQuestions: isTerminal ? [] : [...session.pendingQuestionRequests.values()].map(({ toolCallId, request }) => ({
				toolCallId,
				request: cloneSessionPayload(request)
			})),
			pendingElicitations: isTerminal ? [] : [...session.pendingElicitationRequests.values()].map(({ elicitationId, request }) => ({
				elicitationId,
				request: cloneSessionPayload(request)
			})),
			isProcessing: session.isProcessing,
			stopRequested: session.stopRequested
		};
	}
getSession(sessionId) {
		const session = this.sessions.get(sessionId);
		return session ? this.toSessionViewState(session) : void 0;
	}
hasSession(sessionId) {
		return this.sessions.has(sessionId);
	}
async getSessionRecord(sessionId) {
		const stored = this.recordStore ? await this.reconcileInactiveStoredEntry(await this.recordStore.getSession(sessionId)) : null;
		if (stored) return this.toSessionRecord(stored);
		const active = this.sessions.get(sessionId);
		return active ? this.toEphemeralSessionRecord(active) : null;
	}
async rememberSessionCwd(sessionId, cwd) {
		const normalized = normalizeCwdPath(cwd) ?? "";
		if (!normalized || !this.recordStore) return;
		const active = this.sessions.get(sessionId);
		if (active) {
			if (active.cwd === normalized) return;
			active.cwd = normalized;
			await this.upsertSessionRecord(sessionId, (current) => ({
				...current,
				cwd: normalized,
				updatedAt: Date.now()
			}));
			await this.emitSessionRecordUpsert(sessionId);
			return;
		}
		const current = await this.resolveStoredEntry(sessionId);
		if (current?.cwd === normalized) return;
		const now = Date.now();
		await this.recordStore.upsertSession({
			...current ?? {
				id: sessionId,
				status: "pending",
				createdAt: now
			},
			cwd: normalized,
			updatedAt: now
		});
		await this.emitSessionRecordUpsert(sessionId);
	}
async updateSessionStatus(sessionId, status) {
		const active = this.sessions.get(sessionId);
		const normalizedStatus = normalizeTaskStatus(status);
		if (active) {
			this.applyExplicitTaskStatus(active, normalizedStatus);
			await this.flushSessionEffects(sessionId);
		} else {
			await this.upsertSessionRecord(sessionId, (current) => ({
				...current,
				status: normalizedStatus,
				updatedAt: Date.now()
			}));
			await this.emitSessionRecordUpsert(sessionId);
		}
		return { id: sessionId };
	}
toSessionRecord(entry) {
		const active = this.sessions.get(entry.id);
		const derivedStatus = active ? this.deriveExportedTaskStatus(active) : normalizeTaskStatus(entry.status);
		if (derivedStatus === "pending" && active) this.logDiagnostic("info", "[SessionManager] toSessionRecord: active session derived as pending", {
			sessionId: entry.id,
			runState: active.taskState.runState,
			executionStage: active.taskState.executionStage,
			terminalOutcome: active.taskState.terminalOutcome,
			turnSeq: active.taskState.turnSeq,
			pendingInputKind: active.taskState.pendingInputKind,
			isProcessing: active.isProcessing,
			pendingPermissionCount: active.pendingPermissionRequests.size,
			pendingQuestionCount: active.pendingQuestionRequests.size,
			entryStatus: entry.status
		});
		const lastActivityAt = active?.taskState.lastActivityAt ?? entry.lastActivityAt;
		const teamRuntime = active ? this.toSessionTeamRuntimeView(active) : void 0;
		const isTerminal = active ? isTaskTerminal(active.taskState) : isTerminalTaskStatus(derivedStatus);
		return {
			id: entry.id,
			sessionId: entry.id,
			userId: entry.userId || void 0,
			name: entry.customTitle || entry.title || void 0,
			status: derivedStatus,
			pendingInputKind: active && !isTerminal ? this.deriveExportedPendingInputKind(active) : void 0,
			createdAt: entry.createdAt,
			updatedAt: entry.updatedAt,
			lastActivityAt,
			archivedAt: entry.archivedAt,
			cwd: entry.cwd,
			type: "local",
			isPlayground: !!entry.isPlayground,
			isUserDefinedTitle: !!entry.customTitle,
			isBackgroundAutomation: entry.isBackgroundAutomation,
			sourceMode: entry.sourceMode,
			mode: active?.desiredConfig.mode ?? entry.mode,
			model: active?.desiredConfig.model ?? entry.model,
			expertId: active?.desiredConfig.expertId ?? entry.expertId,
			expertLocale: (active?.desiredConfig.expertId ? active.desiredConfig.locale : void 0) ?? entry.expertLocale,
			expertRuntimeIdentity: (active?.desiredConfig.expertId ? active.desiredConfig.runtimeIdentity : void 0) ?? entry.expertRuntimeIdentity,
			expertMarketplace: (active?.desiredConfig.expertId ? active.desiredConfig.expertMarketplace : void 0) ?? entry.expertMarketplace,
			...teamRuntime ? { teamRuntime } : {},
			permissionMode: active?.desiredConfig.permissionMode ?? entry.permissionMode,
			useSandboxCLI: active?.desiredConfig.useSandboxCLI ?? entry.useSandboxCLI,
			projectId: entry.projectId
		};
	}
toEphemeralSessionRecord(session) {
		const teamRuntime = this.toSessionTeamRuntimeView(session);
		const isTerminal = isTaskTerminal(session.taskState);
		return {
			id: session.sessionId,
			sessionId: session.sessionId,
			userId: session.userId || void 0,
			name: session.customTitle || "新任务",
			status: this.deriveExportedTaskStatus(session),
			pendingInputKind: isTerminal ? void 0 : this.deriveExportedPendingInputKind(session),
			createdAt: session.createdAt,
			updatedAt: session.updatedAt,
			lastActivityAt: session.lastActivityAt ?? session.taskState.lastActivityAt,
			cwd: session.cwd,
			type: "local",
			isPlayground: !!session.isPlayground,
			isBackgroundAutomation: readIsBackgroundAutomation(session._meta),
			sourceMode: readSessionSourceMode(session._meta),
			model: session.desiredConfig.model,
			expertId: session.desiredConfig.expertId,
			expertLocale: session.desiredConfig.expertId ? session.desiredConfig.locale : void 0,
			expertRuntimeIdentity: session.desiredConfig.expertId ? session.desiredConfig.runtimeIdentity : void 0,
			expertMarketplace: session.desiredConfig.expertId ? session.desiredConfig.expertMarketplace : void 0,
			...teamRuntime ? { teamRuntime } : {},
			permissionMode: session.desiredConfig.permissionMode,
			useSandboxCLI: session.desiredConfig.useSandboxCLI,
			...session.projectId ? { projectId: session.projectId } : {}
		};
	}
}
for(const name of ["toSessionInfo","toSessionTeamRuntimeView","toSessionTeamRuntimeMemberView","deriveExportedTaskStatus","deriveExportedPendingInputKind","toSessionViewState","getSession","hasSession","getSessionRecord","rememberSessionCwd","updateSessionStatus","toSessionRecord","toEphemeralSessionRecord"])Object.defineProperty(controller,name,Object.getOwnPropertyDescriptor(NativeSessionInfo.prototype,name));


return controller;
}

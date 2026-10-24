// @ts-nocheck
// Complete original notification state and deferred team-completion methods.
export const SESSION_TEAM_STATE_SHA256='528d3bffc67c5244d1a641e0cfc13c2be4ef7943c248b390125b76d70880ed19';
export const SESSION_TEAM_STATE_MEMBERS=[["handleBackendSessionUpdate",4730347,4731685],["handleTeamRuntimeUpdate",4732158,4736830],["shouldDeferTurnCompletion",4740411,4740700],["extractRuntimeSignalFromNotification",4748540,4750149],["shouldApplyRuntimeSignalFromNotification",4731687,4732156],["extractPhaseFromNotification",4750967,4751694],["extractMeaningfulTitle",4752678,4753129],["updateTeamRuntimeMetadata",4736832,4737171],["enqueueSessionRecordUpsert",4714633,4714788],["isTurnCompletionAlreadyFinalized",4744572,4744699],["settleActiveTeamMembers",4738566,4738744],["updateTeamMembers",4738192,4738564],["shouldReactivateTerminalTeamTurn",4741285,4741748],["hasActiveTeamMembers",4740702,4740877],["reactivateTerminalTeamTurn",4741750,4742474],["countActiveTeamMembers",4745389,4745582],["maybeFinalizeDeferredTeamCompletion",4742476,4744570],["extractAgentPhase",4750151,4750795],["extractRawRuntimeState",4752146,4752676],["classifyPhase",4751696,4752144],["toTeamMemberRuntimeState",4738746,4740409],["onProcessingStarted",4768530,4768666],["deferTurnCompletion",4740879,4741283],["markTurnCompletionFinalized",4744701,4745387],["onProcessingStopped",4768774,4769140]] as const;
export const SESSION_TEAM_STATE_FUNCTIONS=[["isTerminalToolCallStatus",4796285,4796436],["getOwnerHistoryMode",4791857,4792086],["extractTeamUpdate",4795036,4795868],["isTaskTerminal",3516029,3516170],["isActiveTeamMemberStatus",4795983,4796145],["normalizeTeamMemberStatus",4795869,4795982],["deriveTaskStatus",3515378,3516028],["isCancelledStopReason",4573640,4573870],["isFailedPromptStopReason",4573871,4573996]] as const;
export function attachNativeSessionTeamState(controller:any,deps:any={}):any {
function isTerminalToolCallStatus(status) {
	return status === "completed" || status === "failed" || status === "cancelled" || status === "canceled";
}
function getOwnerHistoryMode(payload) {
	const meta = payload._meta?.["codebuddy.ai"];
	if (!meta || typeof meta !== "object") return null;
	const mode = meta.mode;
	return mode === "history" || mode === "stream" ? mode : null;
}
function extractTeamUpdate(notification) {
	const rootMeta = notification._meta;
	const updateMeta = notification.update?._meta;
	const direct = rootMeta?.["codebuddy.ai/teamUpdate"] ?? updateMeta?.["codebuddy.ai/teamUpdate"];
	const nestedCodebuddy = rootMeta?.["codebuddy.ai"] ?? updateMeta?.["codebuddy.ai"];
	const nested = nestedCodebuddy && typeof nestedCodebuddy === "object" ? nestedCodebuddy.teamUpdate : void 0;
	const teamUpdate = direct ?? nested;
	if (!teamUpdate || typeof teamUpdate !== "object") return null;
	const type = teamUpdate.type;
	if (type !== "team_created" && type !== "team_deleted" && type !== "member_status_change" && type !== "team_idle" && type !== "team_busy") return null;
	return {
		type,
		teamName: teamUpdate.teamName,
		isAutoTeam: teamUpdate.isAutoTeam,
		members: teamUpdate.members
	};
}
function isTaskTerminal(state) {
	return state.terminalOutcome !== null || state.runState === "errored" || state.runState === "terminated";
}
function isActiveTeamMemberStatus(status) {
	const normalized = normalizeTeamMemberStatus(status);
	return normalized === "pending" || normalized === "running";
}
function normalizeTeamMemberStatus(rawStatus) {
	return rawStatus.trim().toLowerCase().replace(/[\s-]+/g, "_");
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
function isCancelledStopReason(reason) {
	if (typeof reason !== "string") return false;
	const normalized = reason.trim().toLowerCase();
	return normalized === "cancelled" || normalized === "canceled" || normalized === "cancel";
}
function isFailedPromptStopReason(reason) {
	return typeof reason === "string" && reason.trim().toLowerCase() === "failed";
}
class NativeSessionTeamState {
handleBackendSessionUpdate(session, notification) {
		const update = notification.update ?? {};
		if ((typeof update.sessionUpdate === "string" ? update.sessionUpdate : "") === "tool_call_update" && typeof update.toolCallId === "string" && isTerminalToolCallStatus(update.status)) {
			if (this.settleInputRequest(session, {
				kind: "tool",
				toolCallId: update.toolCallId
			})) this.syncPendingInputStateAfterMutation(session);
		}
		const runtimeSignal = this.extractRuntimeSignalFromNotification(notification);
		if (runtimeSignal && this.shouldApplyRuntimeSignalFromNotification(session, notification, runtimeSignal)) this.applyTaskSignal(session, runtimeSignal, this.extractPhaseFromNotification(notification));
		this.handleTeamRuntimeUpdate(session, notification);
		const title = this.extractMeaningfulTitle(notification);
		if (!title) return;
		const isHistoryReplay = getOwnerHistoryMode(notification) === "history" || session.historyHydrationDepth > 0;
		this.enqueueSessionEffect(session, async () => {
			await this.upsertSessionRecord(session.sessionId, (current) => ({
				...current,
				customTitle: current.customTitle,
				title: current.customTitle ? current.title : title,
				updatedAt: isHistoryReplay ? current.updatedAt : Date.now()
			}));
			await this.emitSessionRecordUpsert(session.sessionId);
		});
	}
handleTeamRuntimeUpdate(session, notification) {
		const teamUpdate = extractTeamUpdate(notification);
		if (!teamUpdate) return;
		switch (teamUpdate.type) {
			case "team_created":
				delete session.teamRuntime.teamName;
				delete session.teamRuntime.isAutoTeam;
				this.updateTeamRuntimeMetadata(session, teamUpdate);
				session.teamRuntime.membersByName.clear();
				session.teamRuntime.teamActive = true;
				session.teamRuntime.teamTrulyIdle = false;
				this.enqueueSessionRecordUpsert(session);
				return;
			case "team_deleted": {
				this.updateTeamRuntimeMetadata(session, teamUpdate);
				const deletedAfterTerminal = this.isTurnCompletionAlreadyFinalized(session) || isTaskTerminal(session.taskState) || session.teamRuntime.teamTrulyIdle === true;
				if (deletedAfterTerminal) this.settleActiveTeamMembers(session);
				session.teamRuntime.teamActive = false;
				session.teamRuntime.teamTrulyIdle = deletedAfterTerminal ? true : void 0;
				if (!deletedAfterTerminal && (session.teamRuntime.deferredCompletion || session.isProcessing)) session.teamRuntime.teamTrulyIdle = false;
				this.logDiagnostic("info", "[SessionManager/Team] team_deleted received", {
					sessionId: session.sessionId,
					hasDeferred: !!session.teamRuntime.deferredCompletion,
					teamTrulyIdle: session.teamRuntime.teamTrulyIdle
				});
				this.enqueueSessionRecordUpsert(session);
				return;
			}
			case "member_status_change": {
				const hadMembersBeforeUpdate = session.teamRuntime.membersByName.size > 0;
				this.updateTeamRuntimeMetadata(session, teamUpdate);
				this.updateTeamMembers(session, teamUpdate.members);
				if (this.isTurnCompletionAlreadyFinalized(session) || isTaskTerminal(session.taskState)) {
					if (this.shouldReactivateTerminalTeamTurn(session, hadMembersBeforeUpdate) && this.hasActiveTeamMembers(session)) {
						this.reactivateTerminalTeamTurn(session, "member_status_change");
						this.enqueueSessionRecordUpsert(session);
						return;
					}
					session.teamRuntime.teamActive = false;
					session.teamRuntime.teamTrulyIdle = true;
					this.settleActiveTeamMembers(session);
					this.logDiagnostic("debug", "[SessionManager/Team] ignored member_status_change after terminal turn", {
						sessionId: session.sessionId,
						memberCount: Array.isArray(teamUpdate.members) ? teamUpdate.members.length : 0
					});
					this.enqueueSessionRecordUpsert(session);
					return;
				}
				session.teamRuntime.teamActive = true;
				if (session.teamRuntime.teamTrulyIdle !== true || this.hasActiveTeamMembers(session)) session.teamRuntime.teamTrulyIdle = false;
				this.logDiagnostic("debug", "[SessionManager/Team] member_status_change received", {
					sessionId: session.sessionId,
					memberCount: Array.isArray(teamUpdate.members) ? teamUpdate.members.length : 0,
					activeCount: this.countActiveTeamMembers(session),
					hasDeferred: !!session.teamRuntime.deferredCompletion
				});
				this.maybeFinalizeDeferredTeamCompletion(session);
				this.enqueueSessionRecordUpsert(session);
				return;
			}
			case "team_idle":
				this.updateTeamRuntimeMetadata(session, teamUpdate);
				session.teamRuntime.teamTrulyIdle = true;
				this.settleActiveTeamMembers(session);
				this.logDiagnostic("info", "[SessionManager/Team] team_idle received", {
					sessionId: session.sessionId,
					hasDeferred: !!session.teamRuntime.deferredCompletion
				});
				this.maybeFinalizeDeferredTeamCompletion(session);
				this.enqueueSessionRecordUpsert(session);
				return;
			case "team_busy":
				this.updateTeamRuntimeMetadata(session, teamUpdate);
				if (this.isTurnCompletionAlreadyFinalized(session) || isTaskTerminal(session.taskState)) {
					if (this.shouldReactivateTerminalTeamTurn(session, session.teamRuntime.membersByName.size > 0)) {
						this.reactivateTerminalTeamTurn(session, "team_busy");
						this.enqueueSessionRecordUpsert(session);
						return;
					}
					session.teamRuntime.teamActive = false;
					session.teamRuntime.teamTrulyIdle = true;
					this.settleActiveTeamMembers(session);
					this.logDiagnostic("info", "[SessionManager/Team] ignored team_busy after terminal turn", {
						sessionId: session.sessionId,
						hasDeferred: !!session.teamRuntime.deferredCompletion
					});
					this.enqueueSessionRecordUpsert(session);
					return;
				}
				session.teamRuntime.teamActive = true;
				session.teamRuntime.teamTrulyIdle = false;
				this.logDiagnostic("info", "[SessionManager/Team] team_busy received", {
					sessionId: session.sessionId,
					hasDeferred: !!session.teamRuntime.deferredCompletion
				});
				this.enqueueSessionRecordUpsert(session);
				return;
			default: return;
		}
	}
shouldDeferTurnCompletion(session) {
		if (session.teamRuntime.teamTrulyIdle === true) return false;
		if (session.teamRuntime.teamActive) return true;
		if (this.hasActiveTeamMembers(session)) return true;
		if (session.teamRuntime.teamTrulyIdle === false) return true;
		return false;
	}
extractRuntimeSignalFromNotification(notification) {
		const update = notification.update ?? {};
		const updateType = typeof update.sessionUpdate === "string" ? update.sessionUpdate : "";
		const normalizedPhase = this.extractAgentPhase(update, notification);
		if (normalizedPhase === "planning") return { type: "planning_started" };
		if (normalizedPhase === "working") return { type: "working_started" };
		if (updateType === "agent_message_chunk" || updateType === "tool_call" || updateType === "tool_call_update") return { type: "working_started" };
		const rawState = this.extractRawRuntimeState(update, notification);
		if (!rawState) return null;
		switch (rawState) {
			case "planning":
			case "preparing":
			case "model_requesting": return { type: "planning_started" };
			case "working":
			case "running":
			case "model_streaming":
			case "model_done":
			case "tool_executing":
			case "tool_start":
			case "tool_end":
			case "handoff":
			case "summarizing":
			case "waiting_team_members": return { type: "working_started" };
			case "pending":
			case "await_input":
			case "awaitinput":
			case "waiting_input":
			case "waiting_user_input": return {
				type: "awaiting_input",
				kind: "user_input"
			};
			case "completed":
			case "done": return { type: "turn_completed" };
			case "cancelled":
			case "canceled": return {
				type: "runtime_terminated",
				reason: rawState
			};
			case "failed": return { type: "turn_failed" };
			case "error": return { type: "runtime_errored" };
			case "terminated": return { type: "runtime_terminated" };
			default: return null;
		}
	}
shouldApplyRuntimeSignalFromNotification(session, notification, signal) {
		if (getOwnerHistoryMode(notification) === "history") return false;
		switch (signal.type) {
			case "planning_started":
			case "working_started":
			case "turn_completed":
			case "turn_failed":
			case "runtime_errored":
			case "runtime_terminated": return session.isProcessing || session.stopRequested;
			case "awaiting_input": return session.isProcessing;
			default: return true;
		}
	}
extractPhaseFromNotification(notification) {
		const update = notification.update ?? {};
		const notificationMeta = notification._meta;
		const cbMeta = notificationMeta?.["codebuddy.ai"];
		const phaseInfo = update._meta?.["codebuddy.ai/agentPhase"] ?? notificationMeta?.["codebuddy.ai/agentPhase"] ?? cbMeta?.agentPhase;
		const agentPhase = phaseInfo && typeof phaseInfo === "object" ? phaseInfo.phase : void 0;
		const rawState = typeof update.currentState === "string" ? update.currentState : "";
		const updateType = typeof update.sessionUpdate === "string" ? update.sessionUpdate : "";
		const source = (typeof agentPhase === "string" ? agentPhase : "") || rawState || updateType;
		return this.classifyPhase(source);
	}
extractMeaningfulTitle(notification) {
		const update = notification.update ?? {};
		if (update.sessionUpdate !== "session_info_update" || typeof update.title !== "string") return null;
		const trimmed = update.title.trim();
		if (!trimmed || trimmed === "新建任务中" || trimmed === "Creating Task" || trimmed === "(No content)" || trimmed === "/compact" || /^<image_local_path>[\s\S]*<\/image_local_path>$/.test(trimmed)) return null;
		return trimmed;
	}
updateTeamRuntimeMetadata(session, teamUpdate) {
		if (typeof teamUpdate.teamName === "string" && teamUpdate.teamName.trim()) session.teamRuntime.teamName = teamUpdate.teamName.trim();
		if (typeof teamUpdate.isAutoTeam === "boolean") session.teamRuntime.isAutoTeam = teamUpdate.isAutoTeam;
		session.teamRuntime.updatedAt = Date.now();
	}
enqueueSessionRecordUpsert(session) {
		this.enqueueSessionEffect(session, async () => {
			await this.emitSessionRecordUpsert(session.sessionId);
		});
	}
isTurnCompletionAlreadyFinalized(session) {
		return session.teamRuntime.lastCompletedTurnSeq === session.taskState.turnSeq;
	}
settleActiveTeamMembers(session) {
		for (const member of session.teamRuntime.membersByName.values()) if (isActiveTeamMemberStatus(member.status)) member.status = "completed";
	}
updateTeamMembers(session, members) {
		if (!Array.isArray(members)) return;
		session.teamRuntime.membersByName.clear();
		for (const member of members) {
			if (!member || typeof member !== "object") continue;
			const snapshot = this.toTeamMemberRuntimeState(member);
			if (!snapshot) continue;
			session.teamRuntime.membersByName.set(snapshot.name, snapshot);
		}
	}
shouldReactivateTerminalTeamTurn(session, hadMembersBeforeTerminalUpdate) {
		if (hadMembersBeforeTerminalUpdate) return false;
		if (!this.isTurnCompletionAlreadyFinalized(session)) return false;
		if (deriveTaskStatus(session.taskState) !== "completed") return false;
		if (session.teamRuntime.teamTrulyIdle !== true) return false;
		const stopReason = session.teamRuntime.lastCompletedStopReason;
		return stopReason === void 0 || stopReason === "end_turn";
	}
hasActiveTeamMembers(session) {
		for (const member of session.teamRuntime.membersByName.values()) if (isActiveTeamMemberStatus(member.status)) return true;
		return false;
	}
reactivateTerminalTeamTurn(session, source) {
		const stopReason = session.teamRuntime.lastCompletedStopReason ?? "end_turn";
		delete session.teamRuntime.lastCompletedTurnSeq;
		delete session.teamRuntime.lastCompletedStopReason;
		session.teamRuntime.teamActive = true;
		session.teamRuntime.teamTrulyIdle = false;
		session.teamRuntime.updatedAt = Date.now();
		this.onProcessingStarted(session);
		this.deferTurnCompletion(session, stopReason);
		this.applyTaskSignal(session, { type: "working_started" });
		this.logDiagnostic("info", "[SessionManager/Team] reactivated terminal team turn", {
			sessionId: session.sessionId,
			source,
			stopReason,
			activeMemberCount: this.countActiveTeamMembers(session)
		});
	}
countActiveTeamMembers(session) {
		let count = 0;
		for (const member of session.teamRuntime.membersByName.values()) if (isActiveTeamMemberStatus(member.status)) count += 1;
		return count;
	}
maybeFinalizeDeferredTeamCompletion(session) {
		if (!session.teamRuntime.deferredCompletion) return;
		if (this.hasActiveTeamMembers(session)) return;
		if (session.teamRuntime.teamTrulyIdle === false || session.teamRuntime.teamActive && session.teamRuntime.teamTrulyIdle !== true) {
			this.logDiagnostic("debug", "[SessionManager/Team] maybeFinalize: waiting for team_idle signal", {
				sessionId: session.sessionId,
				hasActiveMembers: this.hasActiveTeamMembers(session),
				teamTrulyIdle: session.teamRuntime.teamTrulyIdle
			});
			return;
		}
		const deferred = session.teamRuntime.deferredCompletion;
		session.teamRuntime.deferredCompletion = void 0;
		if (!deferred) return;
		if (session.teamRuntime.lastCompletedTurnSeq === deferred.turnSeq) return;
		this.logDiagnostic("info", "[SessionManager/Team] deferred finalize (normal)", {
			sessionId: session.sessionId,
			turnSeq: deferred.turnSeq
		});
		let finalizedStopReason = deferred.stopReason;
		if (session.userCancelRequested) {
			finalizedStopReason = "cancelled";
			this.applyTaskSignal(session, {
				type: "turn_completed",
				stopReason: "cancelled",
				timestamp: deferred.requestedAt
			});
		} else if (session.stopRequested || isCancelledStopReason(deferred.stopReason)) {
			finalizedStopReason = deferred.stopReason ?? "cancelled";
			this.applyTaskSignal(session, {
				type: "runtime_terminated",
				reason: deferred.stopReason ?? "cancelled",
				timestamp: deferred.requestedAt
			});
		} else if (isFailedPromptStopReason(deferred.stopReason)) this.applyTaskSignal(session, {
			type: "turn_failed",
			error: deferred.stopReason,
			timestamp: deferred.requestedAt
		});
		else this.applyTaskSignal(session, {
			type: "turn_completed",
			stopReason: deferred.stopReason,
			timestamp: deferred.requestedAt
		});
		this.markTurnCompletionFinalized(session, finalizedStopReason);
		const processingStopReason = session.stopRequested ? "interrupted" : isFailedPromptStopReason(finalizedStopReason) ? "error" : "complete";
		this.onProcessingStopped(session, processingStopReason).catch(() => {});
	}
extractAgentPhase(update, notification) {
		const notificationMeta = notification._meta;
		const notificationCodeBuddyMeta = notificationMeta?.["codebuddy.ai"];
		const phaseInfo = update._meta?.["codebuddy.ai/agentPhase"] ?? notificationMeta?.["codebuddy.ai/agentPhase"] ?? notificationCodeBuddyMeta?.agentPhase;
		if (!phaseInfo || typeof phaseInfo !== "object") return null;
		switch (typeof phaseInfo.phase === "string" ? phaseInfo.phase : null) {
			case "preparing":
			case "model_requesting": return "planning";
			case "model_streaming":
			case "model_done":
			case "tool_executing": return "working";
			default: return null;
		}
	}
extractRawRuntimeState(update, notification) {
		const direct = typeof update.currentState === "string" ? update.currentState : void 0;
		const updateMetaStatus = typeof update._meta?.status === "string" ? update._meta.status : void 0;
		const codebuddyMeta = notification._meta;
		const nested = typeof codebuddyMeta?.["codebuddy.ai"]?.state === "string" ? codebuddyMeta["codebuddy.ai"].state : void 0;
		const raw = direct ?? updateMetaStatus ?? nested;
		return raw ? raw.trim().toLowerCase().replace(/[\s-]+/g, "_") : null;
	}
classifyPhase(source) {
		if (!source) return;
		if (source === "preparing" || source === "model_requesting") return "llm_request";
		if (source === "model_streaming" || source === "model_done" || source === "agent_message_chunk") return "llm_stream";
		if (source.includes("tool")) return "tool";
		if (source === "planning") return "planning";
		if (source === "summarizing") return "summarizing";
		if (source === "handoff") return "handoff";
	}
toTeamMemberRuntimeState(member) {
		const name = typeof member.name === "string" ? member.name.trim() : "";
		if (!name) return null;
		const snapshot = {
			name,
			status: typeof member.status === "string" ? normalizeTeamMemberStatus(member.status) : "pending"
		};
		if (typeof member.color === "string") snapshot.color = member.color;
		if (typeof member.description === "string") snapshot.description = member.description;
		if (typeof member.taskId === "string") snapshot.taskId = member.taskId;
		if (typeof member.sessionId === "string") snapshot.sessionId = member.sessionId;
		if (member.tokenUsage && typeof member.tokenUsage === "object") {
			const tokenUsage = member.tokenUsage;
			const inputTokens = typeof tokenUsage.inputTokens === "number" ? tokenUsage.inputTokens : void 0;
			const outputTokens = typeof tokenUsage.outputTokens === "number" ? tokenUsage.outputTokens : void 0;
			if (inputTokens !== void 0 || outputTokens !== void 0) snapshot.tokenUsage = {
				inputTokens: inputTokens ?? 0,
				outputTokens: outputTokens ?? 0,
				lastContextWindow: typeof tokenUsage.lastContextWindow === "number" ? tokenUsage.lastContextWindow : void 0
			};
		}
		if (typeof member.toolCallCount === "number") snapshot.toolCallCount = member.toolCallCount;
		if (member.lastFailure && typeof member.lastFailure === "object") {
			const failure = member.lastFailure;
			const errorText = typeof failure.error === "string" ? failure.error.trim() : "";
			if (errorText) snapshot.lastFailure = {
				error: errorText,
				...typeof failure.category === "string" && failure.category ? { category: failure.category } : {}
			};
		}
		return snapshot;
	}
onProcessingStarted(session) {
		session.isProcessing = true;
		session.stopRequested = false;
		session.userCancelRequested = false;
	}
deferTurnCompletion(session, stopReason) {
		session.teamRuntime.deferredCompletion = {
			turnSeq: session.taskState.turnSeq,
			stopReason,
			requestedAt: Date.now()
		};
		this.logDiagnostic("info", "[SessionManager/Team] deferTurnCompletion", {
			sessionId: session.sessionId,
			turnSeq: session.taskState.turnSeq,
			stopReason,
			activeMemberCount: this.countActiveTeamMembers(session)
		});
	}
markTurnCompletionFinalized(session, stopReason) {
		const hadTeamRuntime = session.teamRuntime.teamActive === true || session.teamRuntime.teamTrulyIdle !== void 0 || session.teamRuntime.membersByName.size > 0;
		session.teamRuntime.lastCompletedTurnSeq = session.taskState.turnSeq;
		if (stopReason === void 0) delete session.teamRuntime.lastCompletedStopReason;
		else session.teamRuntime.lastCompletedStopReason = stopReason;
		session.teamRuntime.deferredCompletion = void 0;
		session.teamRuntime.teamActive = false;
		if (hadTeamRuntime) {
			session.teamRuntime.teamTrulyIdle = true;
			session.teamRuntime.updatedAt = Date.now();
			this.settleActiveTeamMembers(session);
		}
	}
async onProcessingStopped(session, _reason) {
		if (!(session.taskState.runState === "awaiting_input")) {
			session.isProcessing = false;
			session.noResponseWatchdog?.stop();
		}
		session.stopRequested = false;
		session.userCancelRequested = false;
		session.pluginRecommendationCancelRequested = false;
		await this.flushPendingRuntimeConfigIfIdle(session);
	}
}
for(const name of ["handleBackendSessionUpdate","handleTeamRuntimeUpdate","shouldDeferTurnCompletion","extractRuntimeSignalFromNotification","shouldApplyRuntimeSignalFromNotification","extractPhaseFromNotification","extractMeaningfulTitle","updateTeamRuntimeMetadata","enqueueSessionRecordUpsert","isTurnCompletionAlreadyFinalized","settleActiveTeamMembers","updateTeamMembers","shouldReactivateTerminalTeamTurn","hasActiveTeamMembers","reactivateTerminalTeamTurn","countActiveTeamMembers","maybeFinalizeDeferredTeamCompletion","extractAgentPhase","extractRawRuntimeState","classifyPhase","toTeamMemberRuntimeState","onProcessingStarted","deferTurnCompletion","markTurnCompletionFinalized","onProcessingStopped"])Object.defineProperty(controller,name,Object.getOwnPropertyDescriptor(NativeSessionTeamState.prototype,name));
return controller;
}

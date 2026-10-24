// @ts-nocheck
// Complete original prompt invocation and watchdog control flow.
import * as node_crypto from "node:crypto";
export const SESSION_PROMPT_CONTROLLER_SHA256='528d3bffc67c5244d1a641e0cfc13c2be4ef7943c248b390125b76d70880ed19';
export const SESSION_PROMPT_CONTROLLER_MEMBERS=[["prompt",4618226,4632551],["finishPromptInvocation",4632553,4633186],["resetTeamRuntimeForNewTurn",4737173,4738190],["composePromptForBackend",4666440,4667314],["enrichPromptMeta",4665811,4666438],["recordSyntheticUserPromptEvent",4688825,4690388],["waitForPluginRecommendationContinuation",4653147,4653503],["startNoResponseWatchdog",4769142,4769372],["pluginRecommendationContinuationPrompts",4578940,4579012]] as const;
export const SESSION_PROMPT_CONTROLLER_FUNCTIONS=[["readCodebuddyMeta",4570610,4570738],["toExpertSelectionIdentity",4793180,4793417],["isCompactInternalEventPayload",4794051,4794566],["isSessionSeparatorEventPayload",4794567,4795035],["extractTextFromContentBlocks",4793688,4794050],["isCancelledStopReason",4573640,4573870],["isTaskTerminal",3516029,3516170],["isCompactFailedError",4801266,4801469],["shouldEmitSyntheticPromptFailureStateUpdate",4798063,4798261],["summarizePromptForLog",4796870,4797151],["summarizePromptMetaForLog",4797152,4797716],["pickStringMeta",4803004,4803110],["serializeErrorForLog",4801871,4802273],["sanitizeLogValue",4802408,4803003],["serializeErrorCauseForLog",4802274,4802407],["summarizeTaskStateForLog",4797717,4798062],["createPromptFailureStateUpdate",4798262,4799102],["derivePromptFailureRuntimeState",4799103,4799368],["extractPromptFailureRequestId",4799369,4799918],["extractPromptFailureTraceId",4799919,4801109],["extractPromptFailureData",4801686,4801870],["extractPromptFailureCode",4801470,4801685],["formatDiagnosticDetails",4573997,4574164],["readProjectId",4573214,4573399],["sessionHasPriorUserMessages",4793082,4793179],["NoResponseWatchdog",4562101,4565520],["deriveTaskStatus",3515378,3516028],["DEFAULT_CHECK_INTERVAL_MS",4561709,4561745],["DEFAULT_TIMEOUT_THRESHOLD_MS",4561746,4561786],["DEFAULT_AWAITING_INPUT_TIMEOUT_MS",4561787,4561831],["REPORTED_LOG_SLICE",4561858,4561886]] as const;
export function attachNativeSessionPromptController(controller:any,deps:any={}):any {
function readCodebuddyMeta(meta) {
	const raw = meta?.["codebuddy.ai"];
	return raw && typeof raw === "object" ? raw : void 0;
}
function toExpertSelectionIdentity(desiredConfig) {
	const id = desiredConfig.expertId?.trim();
	if (!id) return;
	const marketplace = desiredConfig.expertMarketplace?.trim();
	return {
		id,
		...marketplace ? { marketplace } : {}
	};
}
function isCompactInternalEventPayload(payload) {
	const updateMeta = payload.update?._meta;
	const notifMeta = payload._meta;
	if (updateMeta?.["codebuddy.ai/isCompactInternal"] === true) return true;
	if (notifMeta?.["codebuddy.ai/isCompactInternal"] === true) return true;
	if ((updateMeta?.["codebuddy.ai"])?.["codebuddy.ai/isCompactInternal"] === true) return true;
	if ((notifMeta?.["codebuddy.ai"])?.["codebuddy.ai/isCompactInternal"] === true) return true;
	return isSessionSeparatorEventPayload(payload);
}
function isSessionSeparatorEventPayload(payload) {
	const updateMeta = payload.update?._meta;
	const notifMeta = payload._meta;
	if (updateMeta?.isSessionSeparator === true || notifMeta?.isSessionSeparator === true) return true;
	const updateNested = updateMeta?.["codebuddy.ai"];
	const notifNested = notifMeta?.["codebuddy.ai"];
	if (updateNested?.isSessionSeparator === true) return true;
	if (notifNested?.isSessionSeparator === true) return true;
	return false;
}
function extractTextFromContentBlocks(content) {
	if (typeof content === "string") return content;
	if (Array.isArray(content)) return content.map(extractTextFromContentBlocks).join("");
	if (!content || typeof content !== "object") return "";
	const block = content;
	if (block.type === "text" && typeof block.text === "string") return block.text;
	return "";
}
function isCancelledStopReason(reason) {
	if (typeof reason !== "string") return false;
	const normalized = reason.trim().toLowerCase();
	return normalized === "cancelled" || normalized === "canceled" || normalized === "cancel";
}
function isTaskTerminal(state) {
	return state.terminalOutcome !== null || state.runState === "errored" || state.runState === "terminated";
}
function isCompactFailedError(error) {
	if (!error || typeof error !== "object") return false;
	const err = error;
	if (err.code === -32004) return err.data?.reason === "compact_failed";
	return false;
}
function shouldEmitSyntheticPromptFailureStateUpdate(error) {
	if (!error || typeof error !== "object") return true;
	const record = error;
	return !(record.code && (record.data || record._meta));
}
function summarizePromptForLog(prompt) {
	return {
		itemCount: Array.isArray(prompt) ? prompt.length : 0,
		itemTypes: Array.isArray(prompt) ? prompt.slice(0, 10).map((item) => item && typeof item === "object" && typeof item.type === "string" ? item.type : typeof item) : []
	};
}
function summarizePromptMetaForLog(meta) {
	if (!meta || typeof meta !== "object") return null;
	const metaRecord = meta;
	const codebuddyMeta = metaRecord["codebuddy.ai"];
	return {
		keys: Object.keys(metaRecord).slice(0, 20),
		requestId: pickStringMeta(metaRecord["codebuddy.ai/requestId"]),
		messageId: pickStringMeta(metaRecord["codebuddy.ai/messageId"]),
		messageRequestId: pickStringMeta(metaRecord["codebuddy.ai/messageRequestId"]),
		codebuddyKeys: codebuddyMeta && typeof codebuddyMeta === "object" ? Object.keys(codebuddyMeta).slice(0, 20) : []
	};
}
function pickStringMeta(value) {
	return typeof value === "string" && value.length > 0 ? value : void 0;
}
function serializeErrorForLog(error) {
	if (error instanceof Error) {
		const errorWithExtras = error;
		return {
			name: error.name,
			message: error.message,
			stack: error.stack,
			code: errorWithExtras.code,
			data: sanitizeLogValue(errorWithExtras.data),
			cause: errorWithExtras.cause ? serializeErrorCauseForLog(errorWithExtras.cause) : void 0
		};
	}
	return { message: String(error) };
}
function sanitizeLogValue(value, depth = 0) {
	if (depth >= 3) return "[truncated]";
	if (value == null || typeof value === "number" || typeof value === "boolean" || typeof value === "string") return value;
	if (Array.isArray(value)) return value.slice(0, 10).map((item) => sanitizeLogValue(item, depth + 1));
	if (value instanceof Error) return serializeErrorForLog(value);
	if (typeof value === "object") {
		const entries = Object.entries(value).slice(0, 20);
		return Object.fromEntries(entries.map(([key, nested]) => [key, sanitizeLogValue(nested, depth + 1)]));
	}
	return String(value);
}
function serializeErrorCauseForLog(error) {
	if (error instanceof Error) return serializeErrorForLog(error);
	return String(error);
}
function summarizeTaskStateForLog(taskState) {
	return {
		turnSeq: taskState.turnSeq,
		runState: taskState.runState,
		executionStage: taskState.executionStage,
		pendingInputKind: taskState.pendingInputKind,
		terminalOutcome: taskState.terminalOutcome,
		archivedAt: taskState.archivedAt,
		lastTransitionAt: taskState.lastTransitionAt
	};
}
function createPromptFailureStateUpdate(session, meta, error) {
	const currentState = derivePromptFailureRuntimeState(session.taskState, session.stopRequested);
	const requestId = extractPromptFailureRequestId(meta);
	const traceId = extractPromptFailureTraceId(meta, error);
	const errorData = extractPromptFailureData(error);
	return {
		sessionId: session.sessionId,
		update: {
			sessionUpdate: "state_update",
			currentState,
			timestamp: Date.now()
		},
		_meta: { "codebuddy.ai": {
			currentState,
			state: currentState,
			...requestId ? { requestId } : {},
			error: {
				code: extractPromptFailureCode(error),
				message: error instanceof Error ? error.message : String(error),
				...requestId ? { requestId } : {},
				...traceId ? { traceId } : {},
				...errorData !== void 0 ? { data: errorData } : {}
			}
		} }
	};
}
function derivePromptFailureRuntimeState(taskState, stopRequested) {
	if (stopRequested) return "cancelled";
	if (taskState.terminalOutcome === "completed") return "completed";
	if (taskState.terminalOutcome === "terminated") return "terminated";
	return "error";
}
function extractPromptFailureRequestId(meta) {
	if (!meta || typeof meta !== "object") return;
	const metaRecord = meta;
	const codebuddyMeta = metaRecord["codebuddy.ai"];
	const codebuddyRecord = codebuddyMeta && typeof codebuddyMeta === "object" ? codebuddyMeta : void 0;
	return pickStringMeta(metaRecord["codebuddy.ai/requestId"]) ?? pickStringMeta(metaRecord["codebuddy.ai/messageRequestId"]) ?? pickStringMeta(codebuddyRecord?.requestId) ?? pickStringMeta(codebuddyRecord?.messageRequestId) ?? pickStringMeta(codebuddyRecord?.userMessageId);
}
function extractPromptFailureTraceId(meta, error) {
	if (error && typeof error === "object") {
		const errorRecord = error;
		const nestedMeta = errorRecord._meta;
		if (nestedMeta && typeof nestedMeta === "object") {
			const nestedMetaRecord = nestedMeta;
			const nestedCodebuddyMeta = nestedMetaRecord["codebuddy.ai"];
			const nestedCodebuddyRecord = nestedCodebuddyMeta && typeof nestedCodebuddyMeta === "object" ? nestedCodebuddyMeta : void 0;
			const errorTraceId = pickStringMeta(nestedMetaRecord.traceId) ?? pickStringMeta(nestedMetaRecord["codebuddy.ai/traceId"]) ?? pickStringMeta(nestedCodebuddyRecord?.traceId);
			if (errorTraceId) return errorTraceId;
		}
		const directTraceId = pickStringMeta(errorRecord.traceId) ?? pickStringMeta(errorRecord.trace_id);
		if (directTraceId) return directTraceId;
	}
	if (!meta || typeof meta !== "object") return;
	const metaRecord = meta;
	const codebuddyMeta = metaRecord["codebuddy.ai"];
	const codebuddyRecord = codebuddyMeta && typeof codebuddyMeta === "object" ? codebuddyMeta : void 0;
	return pickStringMeta(metaRecord.traceId) ?? pickStringMeta(metaRecord["codebuddy.ai/traceId"]) ?? pickStringMeta(codebuddyRecord?.traceId);
}
function extractPromptFailureData(error) {
	if (!error || typeof error !== "object") return;
	const record = error;
	if (record.data !== void 0) return sanitizeLogValue(record.data);
}
function extractPromptFailureCode(error) {
	if (error && typeof error === "object") {
		const code = error.code;
		if (typeof code === "string" || typeof code === "number") return code;
	}
	return "PROMPT_FAILED";
}
function formatDiagnosticDetails(error) {
	if (error instanceof Error) return {
		name: error.name,
		message: error.message,
		stack: error.stack
	};
	return error;
}
function readProjectId(meta) {
	const projectId = readCodebuddyMeta(meta)?.projectId;
	return typeof projectId === "string" && projectId.trim().length > 0 ? projectId.trim() : void 0;
}
function sessionHasPriorUserMessages(session) {
	return session.hasUserMessageSinceLastCompact;
}
var NoResponseWatchdog = class {
	timer = null;
	alreadyReported = false;
	checkIntervalMs;
	timeoutThresholdMs;
	awaitingInputTimeoutMs;
	now;
	constructor(session, reportTelemetry, config, now) {
		this.session = session;
		this.reportTelemetry = reportTelemetry;
		this.checkIntervalMs = config?.checkIntervalMs ?? DEFAULT_CHECK_INTERVAL_MS;
		this.timeoutThresholdMs = config?.timeoutThresholdMs ?? DEFAULT_TIMEOUT_THRESHOLD_MS;
		this.awaitingInputTimeoutMs = config?.awaitingInputTimeoutMs ?? DEFAULT_AWAITING_INPUT_TIMEOUT_MS;
		this.now = now ?? Date.now;
	}
	start() {
		this.stop();
		this.alreadyReported = false;
		this.timer = setInterval(() => this.tick(), this.checkIntervalMs);
	}
	stop() {
		if (this.timer) {
			clearInterval(this.timer);
			this.timer = null;
		}
	}
	/**
	* activity 恢复时复位上报标记，使"恢复后再次断流"能再次上报。
	*/
	resetReportedFlag() {
		this.alreadyReported = false;
	}
	tick() {
		if (!this.session.isProcessing || this.alreadyReported) return;
		if (!this.reportTelemetry) return;
		if (this.session.userCancelRequested) {
			this.stop();
			return;
		}
		if (this.session.taskState.runState === "awaiting_input") {
			const hasPending = this.session.hasPendingInput === true;
			const startedAt = this.session.awaitingInputStartedAt ?? this.session.lastBackendMessageAt ?? this.session.promptStartedAt ?? 0;
			const gap = this.now() - startedAt;
			if (gap >= (hasPending ? this.awaitingInputTimeoutMs : this.timeoutThresholdMs)) {
				this.report(gap);
				this.alreadyReported = true;
			}
			return;
		}
		const lastActivity = this.session.lastBackendMessageAt ?? this.session.promptStartedAt ?? 0;
		const gap = this.now() - lastActivity;
		if (gap >= this.timeoutThresholdMs) {
			this.report(gap);
			this.alreadyReported = true;
		}
	}
	report(activityGap) {
		if (!this.reportTelemetry) return;
		if (this.session.userCancelRequested) return;
		const now = this.now();
		const promptDuration = this.session.promptStartedAt ? Math.max(0, now - this.session.promptStartedAt) : 0;
		const currentTaskStatus = deriveTaskStatus(this.session.taskState);
		this.reportTelemetry("session_no_response_timeout", {
			mode: "LOCAL",
			task_id: this.session.sessionId,
			trace_id: this.session.promptTraceId ?? "unknown",
			request_id: this.session.promptRequestId ?? "unknown",
			duration_since_prompt_ms: promptDuration,
			duration_since_last_activity_ms: activityGap,
			current_run_state: this.session.taskState.runState,
			current_task_status: currentTaskStatus,
			last_signal_received_at: this.session.lastSignalReceivedAt ?? 0,
			has_received_any_activity: this.session.hasReceivedBackendActivity === true,
			stuck_in_awaiting_input: this.session.taskState.runState === "awaiting_input",
			has_pending_input: this.session.hasPendingInput === true,
			state_transition_path: this.formatStateTransitionPath()
		});
	}
	/**
	* 紧凑格式化状态转换路径：`signal:fromRun/fromTask→toRun/toTask@相对ms`，分号分隔。
	* 相对 ms = entry.timestamp - promptStartedAt，便于直观看"卡了多久"。
	*/
	formatStateTransitionPath() {
		const entries = this.session.stateTransitionLog.slice(-REPORTED_LOG_SLICE);
		const base = this.session.promptStartedAt ?? 0;
		return entries.map((e) => {
			const relMs = base ? e.timestamp - base : e.timestamp;
			const phase = e.phase ? `[${e.phase}]` : "";
			return `${e.signal}:${e.fromRunState}/${e.fromTaskStatus}→${e.toRunState}/${e.toTaskStatus}${phase}@${relMs}ms`;
		}).join(";");
	}
};
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
var DEFAULT_CHECK_INTERVAL_MS = 3e4;
var DEFAULT_TIMEOUT_THRESHOLD_MS = 12e4;
var DEFAULT_AWAITING_INPUT_TIMEOUT_MS = 6e4;
var REPORTED_LOG_SLICE = 20;
class NativeSessionPrompt {
async prompt(sessionId, prompt, _meta) {
		if (!this.pluginRecommendationContinuationPrompts.delete(prompt)) await this.waitForPluginRecommendationContinuation(sessionId);
		const activeBeforePrompt = this.sessions.get(sessionId);
		const isClearSessionInjection = readCodebuddyMeta(_meta)?.isClearSession === true;
		const isCompactSessionPrompt = readCodebuddyMeta(_meta)?.isCompactSession === true;
		if (isCompactSessionPrompt && activeBeforePrompt?.justInsertedSeparator) {
			this.logDiagnostic("info", "[SessionManager] compact after separator: nothing to compress, skipping");
			activeBeforePrompt.justInsertedSeparator = false;
			return { stopReason: "end_turn" };
		}
		if (activeBeforePrompt) activeBeforePrompt.pendingPromptCancelCause = void 0;
		const resetTeamRuntimeBeforePrompt = !!activeBeforePrompt && !activeBeforePrompt.isProcessing;
		if (resetTeamRuntimeBeforePrompt && activeBeforePrompt) this.resetTeamRuntimeForNewTurn(activeBeforePrompt);
		try {
			const result = await this.withReadySession(sessionId, async (session) => {
				session.hasReceivedBackendActivity = false;
				if (session.pendingPermissionRequests.size > 0 || session.pendingQuestionRequests.size > 0 || session.pendingElicitationRequests.size > 0) {
					this.logDiagnostic("warn", "[SessionManager] prompt: cleaning stale input requests", {
						sessionId: session.sessionId,
						stalePermissions: session.pendingPermissionRequests.size,
						staleQuestions: session.pendingQuestionRequests.size,
						staleElicitations: session.pendingElicitationRequests.size
					});
					this.settleInputRequest(session, { kind: "all" });
					this.syncPendingInputStateAfterMutation(session);
				}
				if (!resetTeamRuntimeBeforePrompt) this.resetTeamRuntimeForNewTurn(session);
				const promptExpertSelection = toExpertSelectionIdentity(session.desiredConfig);
				const backendPrompt = await this.composePromptForBackend(session, prompt, _meta);
				this.recordSyntheticUserPromptEvent(session, prompt, _meta);
				const backend = await this.resolveBackendForPromptSend(session);
				session.promptInvocationActive = true;
				const wdMeta = readCodebuddyMeta(_meta);
				session.promptStartedAt = Date.now();
				session.promptTraceId = typeof wdMeta?.traceId === "string" ? wdMeta.traceId : void 0;
				session.promptRequestId = typeof wdMeta?.requestId === "string" ? wdMeta.requestId : void 0;
				session.stateTransitionLog = [];
				session.hasReceivedBackendActivity = false;
				session.lastSignalReceivedAt = void 0;
				session.awaitingInputStartedAt = void 0;
				session.hasPendingInput = false;
				this.startNoResponseWatchdog(session);
				this.onProcessingStarted(session);
				if (!isClearSessionInjection) this.applyTaskSignal(session, { type: "turn_started" });
				await this.flushSessionEffects(session.sessionId);
				session.lastBackendActivityAt = Date.now();
				const isAutomationBg = (_meta?.["codebuddy.ai"])?.isAutomationBackground;
				let accumulatedAssistantText = "";
				let sawCompactInternalEvent = false;
				let sawCompactInternalOutput = false;
				const toolCallMap = /* @__PURE__ */ new Map();
				const originalOnSessionUpdate = backend.onSessionUpdate;
				backend.onSessionUpdate = (notification) => {
					const update = notification?.update ?? notification;
					const updateType = update?.sessionUpdate;
					const isCompactInternal = isCompactInternalEventPayload(notification);
					if (isCompactInternal) sawCompactInternalEvent = true;
					if (updateType === "agent_message_chunk") if (isCompactInternal) sawCompactInternalOutput = true;
					else {
						const text = extractTextFromContentBlocks(update?.content);
						if (text) accumulatedAssistantText += text;
					}
					if (isAutomationBg) {
						if (updateType === "tool_call" || updateType === "tool_call_update") {
							const id = update?.toolCallId;
							if (id) {
								const existing = toolCallMap.get(id) || {};
								if (update?.title) existing.title = update.title;
								if (update?.kind) existing.kind = update.kind;
								if (update?.status) existing.status = update.status;
								if (update?.rawOutput !== void 0) existing.rawOutput = update.rawOutput;
								toolCallMap.set(id, existing);
							}
						}
					}
					originalOnSessionUpdate?.(notification);
				};
				try {
					const promptResponse = await backend.prompt({
						prompt: backendPrompt,
						_meta
					});
					if (Array.isArray(prompt) && prompt.length > 0) if (sawCompactInternalEvent) await this.flushSessionEffects(session.sessionId);
					else {
						session.lastUserPromptExpertSelection = promptExpertSelection;
						await this.flushSessionEffects(session.sessionId);
						await this.persistLastUserPromptExpertSelection(session);
					}
					if (accumulatedAssistantText || sawCompactInternalOutput) {
						const responseMeta = promptResponse._meta && typeof promptResponse._meta === "object" ? promptResponse._meta : {};
						const existingCodebuddyMeta = responseMeta["codebuddy.ai"];
						const responseCodebuddyMeta = existingCodebuddyMeta && typeof existingCodebuddyMeta === "object" ? existingCodebuddyMeta : {};
						promptResponse._meta = {
							...responseMeta,
							"codebuddy.ai": {
								...responseCodebuddyMeta,
								lastAssistantText: accumulatedAssistantText,
								...sawCompactInternalOutput && !accumulatedAssistantText ? { isSummaryOnly: true } : {}
							}
						};
					}
					if (isAutomationBg) {
						if (!promptResponse._meta) promptResponse._meta = {};
						const toolMessages = [...toolCallMap.entries()].map(([id, info]) => ({
							role: "tool",
							content: [{
								type: "tool-result",
								toolName: info.title || info.kind || "tool",
								toolCallId: id,
								result: {
									success: info.status === "completed",
									...info.rawOutput !== void 0 ? { result: info.rawOutput } : {}
								}
							}]
						}));
						promptResponse._meta["codebuddy.automation"] = {
							output: accumulatedAssistantText || void 0,
							lastAssistantText: accumulatedAssistantText || void 0,
							runResult: toolMessages.length > 0 ? { messages: toolMessages } : void 0,
							messageCount: toolMessages.length
						};
					}
					return promptResponse;
				} finally {
					backend.onSessionUpdate = originalOnSessionUpdate;
				}
			});
			const session = this.requireSession(sessionId);
			this.logDiagnostic("info", "[SessionManager] prompt completed — deciding turn outcome", {
				sessionId: session.sessionId,
				stopReason: result.stopReason,
				stopRequested: session.stopRequested,
				userCancelRequested: session.userCancelRequested,
				isProcessing: session.isProcessing,
				turnSeq: session.taskState.turnSeq,
				taskRunState: session.taskState.runState,
				isTurnAlreadyFinalized: this.isTurnCompletionAlreadyFinalized(session)
			});
			let promptCancelCause;
			if (isCancelledStopReason(result.stopReason)) {
				const cancelMeta = result._meta && typeof result._meta === "object" ? result._meta : {};
				const existingCause = cancelMeta["codebuddy.ai/cancelCause"];
				if (typeof existingCause === "string" && existingCause.trim().length > 0) promptCancelCause = existingCause.trim();
				else {
					promptCancelCause = session.pluginRecommendationCancelRequested ? "recommendation_switch" : session.userCancelRequested ? "user_cancel" : session.pendingPromptCancelCause ?? (session.stopRequested ? "session_teardown" : "unknown_interrupted");
					result._meta = {
						...cancelMeta,
						"codebuddy.ai/cancelCause": promptCancelCause
					};
				}
			}
			session.pendingPromptCancelCause = void 0;
			const isSystemInterruptCause = promptCancelCause === "backend_restart" || promptCancelCause === "session_teardown" || promptCancelCause === "runtime_reclaim";
			if (this.isTurnCompletionAlreadyFinalized(session)) {} else if (session.pluginRecommendationCancelRequested) {
				this.applyTaskSignal(session, {
					type: "turn_completed",
					stopReason: "recommendation_switch"
				});
				this.markTurnCompletionFinalized(session, "recommendation_switch");
				await this.onProcessingStopped(session, "interrupted");
			} else if (session.userCancelRequested) {
				this.applyTaskSignal(session, {
					type: "turn_completed",
					stopReason: "cancelled"
				});
				this.markTurnCompletionFinalized(session, "cancelled");
				await this.onProcessingStopped(session, "interrupted");
			} else if (session.stopRequested) {
				this.applyTaskSignal(session, {
					type: "runtime_terminated",
					reason: result.stopReason ?? "cancelled"
				});
				this.markTurnCompletionFinalized(session, result.stopReason ?? "cancelled");
				await this.onProcessingStopped(session, "interrupted");
			} else if (isSystemInterruptCause) {
				this.applyTaskSignal(session, {
					type: "runtime_terminated",
					reason: promptCancelCause
				});
				this.markTurnCompletionFinalized(session, promptCancelCause);
				await this.onProcessingStopped(session, "interrupted");
			} else if (isCancelledStopReason(result.stopReason)) {
				this.logDiagnostic("info", "[SessionManager] treating stale cancelled stopReason as normal completion", {
					sessionId: session.sessionId,
					stopReason: result.stopReason,
					stopRequested: session.stopRequested,
					userCancelRequested: session.userCancelRequested,
					turnSeq: session.taskState.turnSeq
				});
				if (!isTaskTerminal(session.taskState)) {
					this.applyTaskSignal(session, {
						type: "turn_completed",
						stopReason: result.stopReason
					});
					this.markTurnCompletionFinalized(session, result.stopReason);
					await this.onProcessingStopped(session, "complete");
				}
			} else if (this.shouldDeferTurnCompletion(session)) {
				this.deferTurnCompletion(session, result.stopReason);
				this.applyTaskSignal(session, { type: "working_started" });
			} else if (session.pendingQuestionRequests.size > 0) {
				this.markTurnCompletionFinalized(session, result.stopReason);
				await this.onProcessingStopped(session, "complete");
			} else if (!isTaskTerminal(session.taskState)) {
				if (!isClearSessionInjection) this.applyTaskSignal(session, {
					type: "turn_completed",
					stopReason: result.stopReason
				});
				this.markTurnCompletionFinalized(session, result.stopReason);
				await this.onProcessingStopped(session, "complete");
			}
			await this.flushSessionEffects(sessionId);
			if (isClearSessionInjection) session.justInsertedSeparator = true;
			else session.justInsertedSeparator = false;
			const resultMeta = result._meta && typeof result._meta === "object" ? result._meta : void 0;
			const acpErrorMessage = resultMeta?.["codebuddy.ai/errorMessage"];
			if (acpErrorMessage && result.stopReason === "refusal") {
				let parsedError = { message: acpErrorMessage };
				try {
					const parsed = JSON.parse(acpErrorMessage);
					if (parsed && typeof parsed === "object") parsedError = parsed;
				} catch {}
				const traceId = resultMeta?.["codebuddy.ai/traceId"];
				const errorPayload = {
					sessionId,
					update: { sessionUpdate: "session_info_update" },
					_meta: { "codebuddy.ai": {
						status: "failed",
						error: {
							message: parsedError.message || acpErrorMessage,
							...parsedError.code !== void 0 ? { code: parsedError.code } : {},
							...traceId ? { traceId } : {},
							...parsedError.data !== void 0 ? { data: parsedError.data } : {}
						}
					} }
				};
				this.emitOrBufferScopedEvent(session, errorPayload);
				this.pushEvent("session:event", errorPayload);
			}
			return result;
		} catch (error) {
			if (isCompactSessionPrompt && isCompactFailedError(error)) {
				this.logDiagnostic("info", "[SessionManager] compact_failed swallowed (nothing to compress post-separator)");
				const active = this.sessions.get(sessionId);
				if (active && !isTaskTerminal(active.taskState)) {
					this.applyTaskSignal(active, {
						type: "turn_completed",
						stopReason: "end_turn"
					});
					this.markTurnCompletionFinalized(active, "end_turn");
					await this.onProcessingStopped(active, "complete");
				}
				return { stopReason: "end_turn" };
			}
			const active = this.sessions.get(sessionId);
			const shouldEmitPromptFailureUpdate = active ? shouldEmitSyntheticPromptFailureStateUpdate(error) : false;
			const promptFailure = {
				sessionId,
				prompt: summarizePromptForLog(prompt),
				meta: summarizePromptMetaForLog(_meta),
				error: serializeErrorForLog(error),
				active: active ? {
					isProcessing: active.isProcessing,
					stopRequested: active.stopRequested,
					taskState: summarizeTaskStateForLog(active.taskState),
					pendingPermissions: active.pendingPermissionRequests.size,
					pendingQuestions: active.pendingQuestionRequests.size
				} : null
			};
			if (active && isTaskTerminal(active.taskState)) this.logDiagnostic("warn", "[SessionManager] prompt() rejected after terminal task state", promptFailure);
			else this.logDiagnostic("error", "[SessionManager] prompt() failed", promptFailure);
			if (active) {
				if (active.pluginRecommendationCancelRequested && !isTaskTerminal(active.taskState)) {
					this.applyTaskSignal(active, {
						type: "turn_completed",
						stopReason: "recommendation_switch"
					});
					this.markTurnCompletionFinalized(active, "recommendation_switch");
				} else if (active.userCancelRequested && !isTaskTerminal(active.taskState)) {
					this.applyTaskSignal(active, {
						type: "turn_completed",
						stopReason: "cancelled"
					});
					this.markTurnCompletionFinalized(active, "cancelled");
				} else if (active.stopRequested && !isTaskTerminal(active.taskState)) {
					this.applyTaskSignal(active, {
						type: "runtime_terminated",
						reason: "cancelled"
					});
					this.markTurnCompletionFinalized(active, "cancelled");
				} else if (!isTaskTerminal(active.taskState)) this.applyTaskSignal(active, {
					type: "runtime_errored",
					error: error instanceof Error ? error.message : String(error)
				});
				if (shouldEmitPromptFailureUpdate) this.emitOrBufferScopedEvent(active, createPromptFailureStateUpdate(active, _meta, error));
				await this.flushSessionEffects(sessionId);
				await this.onProcessingStopped(active, active.stopRequested ? "interrupted" : "error");
			}
			throw error;
		} finally {
			await this.finishPromptInvocation(sessionId);
		}
	}
async finishPromptInvocation(sessionId) {
		const active = this.sessions.get(sessionId);
		if (!active) return;
		active.promptInvocationActive = false;
		const hadDeferredConfig = !!active.pendingDesiredConfig || !!active.pendingRuntimeConfig;
		try {
			await this.flushPendingRuntimeConfigIfIdle(active);
			if (hadDeferredConfig) this.logDiagnostic("info", `[SessionManager] POST_PROMPT_DRAIN sessionId=${sessionId} — flushed config deferred by in-flight prompt`);
		} catch (error) {
			this.logDiagnostic("warn", "[SessionManager] failed to flush runtime config after prompt invocation", formatDiagnosticDetails(error));
		}
	}
resetTeamRuntimeForNewTurn(session) {
		const hadTeamRuntime = session.teamRuntime.updatedAt !== void 0 || session.teamRuntime.teamTrulyIdle !== void 0 || session.teamRuntime.teamActive !== void 0 || session.teamRuntime.membersByName.size > 0 || !!session.teamRuntime.teamName || session.teamRuntime.isAutoTeam !== void 0 || !!session.teamRuntime.deferredCompletion || session.teamRuntime.lastCompletedTurnSeq !== void 0 || session.teamRuntime.lastCompletedStopReason !== void 0;
		session.teamRuntime.membersByName.clear();
		delete session.teamRuntime.teamName;
		delete session.teamRuntime.isAutoTeam;
		delete session.teamRuntime.deferredCompletion;
		delete session.teamRuntime.lastCompletedTurnSeq;
		delete session.teamRuntime.lastCompletedStopReason;
		delete session.teamRuntime.teamTrulyIdle;
		if (hadTeamRuntime) {
			session.teamRuntime.teamActive = false;
			session.teamRuntime.updatedAt = Date.now();
		} else {
			delete session.teamRuntime.teamActive;
			delete session.teamRuntime.updatedAt;
		}
	}
async composePromptForBackend(session, prompt, _meta) {
		if (!this.userPromptComposer || !Array.isArray(prompt) || prompt.length === 0) return prompt;
		await this.userPromptComposerReady;
		const metaProjectId = readProjectId(_meta);
		this.logger?.info?.(`[SessionManager] composing user prompt context ${JSON.stringify({
			sessionId: session.sessionId,
			sessionProjectId: session.projectId,
			metaProjectId,
			hasProjectId: !!(session.projectId || metaProjectId),
			hasPriorUserMessages: sessionHasPriorUserMessages(session),
			hasPromptMeta: !!_meta
		})}`);
		return this.userPromptComposer.composeUserPrompt({
			sessionId: session.sessionId,
			cwd: session.cwd,
			desiredConfig: session.desiredConfig,
			prompt: structuredClone(prompt),
			_meta: this.enrichPromptMeta(session, _meta),
			hasPriorUserMessages: sessionHasPriorUserMessages(session)
		});
	}
enrichPromptMeta(session, _meta) {
		if (!_meta && !session.projectId && !session.lastUserPromptExpertSelection) return;
		const meta = _meta ? structuredClone(_meta) : {};
		const cbMeta = meta["codebuddy.ai"];
		const codebuddyMeta = cbMeta && typeof cbMeta === "object" ? cbMeta : {};
		if (session.projectId && !codebuddyMeta.projectId) codebuddyMeta.projectId = session.projectId;
		if (session.lastUserPromptExpertSelection) codebuddyMeta.previousExpertSelection = { ...session.lastUserPromptExpertSelection };
		else delete codebuddyMeta.previousExpertSelection;
		meta["codebuddy.ai"] = codebuddyMeta;
		return meta;
	}
recordSyntheticUserPromptEvent(session, prompt, meta) {
		if (!Array.isArray(prompt) || prompt.length === 0) return;
		const metaRecord = meta && typeof meta === "object" ? structuredClone(meta) : {};
		const rawCodebuddyMeta = metaRecord["codebuddy.ai"];
		const codebuddyMeta = rawCodebuddyMeta && typeof rawCodebuddyMeta === "object" ? { ...rawCodebuddyMeta } : {};
		const messageId = typeof codebuddyMeta.userMessageId === "string" && codebuddyMeta.userMessageId.trim().length > 0 ? codebuddyMeta.userMessageId : typeof metaRecord.messageId === "string" && metaRecord.messageId.trim().length > 0 ? metaRecord.messageId : (0, node_crypto.randomUUID)();
		codebuddyMeta.messageId = messageId;
		codebuddyMeta.messageRequestId = typeof codebuddyMeta.messageRequestId === "string" && codebuddyMeta.messageRequestId.trim().length > 0 ? codebuddyMeta.messageRequestId : messageId;
		codebuddyMeta.syntheticOwnerHistory = true;
		const payload = {
			sessionId: session.sessionId,
			update: {
				sessionUpdate: "user_message_chunk",
				content: prompt.map((block) => structuredClone(block))
			},
			_meta: {
				...metaRecord,
				"codebuddy.ai": codebuddyMeta
			}
		};
		const recordResult = this.recordSessionEvent(session, payload);
		if (codebuddyMeta.emitSyntheticUserPromptLive) {
			const dedupKey = `${session.sessionId}::${messageId}`;
			if (recordResult === "added" && !this.liveEmittedSyntheticUserPromptKeys.has(dedupKey)) {
				this.liveEmittedSyntheticUserPromptKeys.add(dedupKey);
				this.emitOrBufferScopedEvent(session, payload);
			}
		}
	}
async waitForPluginRecommendationContinuation(sessionId) {
		let barrier = this.pluginRecommendationContinuationBarriers.get(sessionId);
		while (barrier) {
			await barrier.settled;
			const nextBarrier = this.pluginRecommendationContinuationBarriers.get(sessionId);
			if (!nextBarrier || nextBarrier === barrier) return;
			barrier = nextBarrier;
		}
	}
startNoResponseWatchdog(session) {
		session.noResponseWatchdog?.stop();
		session.noResponseWatchdog = new NoResponseWatchdog(session, this.reportTelemetry, this.noResponseWatchdogConfig);
		session.noResponseWatchdog.start();
	}
pluginRecommendationContinuationPrompts = /* @__PURE__ */ new WeakSet();
}
for(const name of ["prompt","finishPromptInvocation","resetTeamRuntimeForNewTurn","composePromptForBackend","enrichPromptMeta","recordSyntheticUserPromptEvent","waitForPluginRecommendationContinuation","startNoResponseWatchdog"])Object.defineProperty(controller,name,Object.getOwnPropertyDescriptor(NativeSessionPrompt.prototype,name));
controller.pluginRecommendationContinuationPrompts ??= new NativeSessionPrompt().pluginRecommendationContinuationPrompts;
for(const name of ['userPromptComposer','userPromptComposerReady','logger','reportTelemetry','noResponseWatchdogConfig'])if(deps[name]!==undefined)controller[name]=deps[name];
return controller;
}

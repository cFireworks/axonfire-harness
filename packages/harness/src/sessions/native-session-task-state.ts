// @ts-nocheck
// Complete original task state transitions, input settlement and persistence routing.
export const SESSION_TASK_STATE_SHA256 =
  "528d3bffc67c5244d1a641e0cfc13c2be4ef7943c248b390125b76d70880ed19";
export const SESSION_TASK_STATE_MEMBERS = [
  ["applyTaskSignal", 4717509, 4719910],
  ["applyExplicitTaskStatus", 4719912, 4720674],
  ["emitTerminalTaskEvent", 4721071, 4722324],
  ["persistDerivedTaskStatus", 4722326, 4723036],
  ["scheduleDebouncedSidebarMetaUpdate", 4714790, 4715467],
  ["clearSidebarMetaDebounce", 4715469, 4715688],
  ["clearTurnScopedPendingState", 4717027, 4717507],
  ["hasActiveToolCall", 4716329, 4716485],
  ["settleInputRequest", 4657551, 4659111],
  ["isSettledInputRequestPayload", 4659113, 4660358],
  ["clearPendingPermissionRequestsForToolCall", 4657032, 4657312],
  ["getPendingPermissionRequestIdsForToolCall", 4638815, 4639114],
  ["extractElicitationToolCallId", 4633491, 4633890],
  ["SIDEBAR_META_DEBOUNCE_MS", 4576830, 4576868],
] as const;
export const SESSION_TASK_STATE_FUNCTIONS = [
  ["isTaskTerminal", 3516029, 3516170],
  ["deriveTaskStatus", 3515378, 3516028],
  ["reduceTaskStatus", 3516960, 3519138],
  ["appendStateTransitionEntry", 4565761, 4566144],
  ["applyManualTaskStatus", 3520033, 3521653],
  ["isCancelledStopReason", 4573640, 4573870],
  ["formatDiagnosticDetails", 4573997, 4574164],
  ["isActiveToolResultStatus", 4796181, 4796284],
  ["MAX_LOG_ENTRIES", 4561832, 4561857],
] as const;
export function attachNativeSessionTaskState(
  controller: any,
  deps: any = {},
): any {
  function isTaskTerminal(state) {
    return (
      state.terminalOutcome !== null ||
      state.runState === "errored" ||
      state.runState === "terminated"
    );
  }
  function deriveTaskStatus(state) {
    if (state.archivedAt) return "archived";
    if (state.runState === "awaiting_input") return "pending";
    if (state.runState === "running" && state.executionStage === "planning")
      return "planning";
    if (state.runState === "running") return "working";
    if (
      state.runState === "terminated" ||
      state.terminalOutcome === "terminated"
    )
      return "terminated";
    if (state.runState === "errored" || state.terminalOutcome === "error")
      return "error";
    if (state.terminalOutcome === "failed") return "failed";
    if (state.terminalOutcome === "completed") return "completed";
    return state.turnSeq === 0 ? "pending" : "completed";
  }
  function reduceTaskStatus(state, signal) {
    const at = signal.timestamp ?? Date.now();
    if (
      (signal.type === "awaiting_input" || signal.type === "input_resolved") &&
      isTaskTerminal(state)
    )
      return state;
    switch (signal.type) {
      case "turn_started":
        return {
          ...state,
          runState: "running",
          executionStage: "planning",
          terminalOutcome: null,
          pendingInputKind: void 0,
          lastTransitionAt: at,
          lastActivityAt: at,
          turnSeq: state.turnSeq + 1,
          terminationReason: void 0,
        };
      case "planning_started":
        return {
          ...state,
          runState: "running",
          executionStage: "planning",
          terminalOutcome: null,
          pendingInputKind: void 0,
          lastTransitionAt: at,
        };
      case "working_started":
        return {
          ...state,
          runState: "running",
          executionStage: "working",
          terminalOutcome: null,
          pendingInputKind: void 0,
          lastTransitionAt: at,
        };
      case "awaiting_input":
        return {
          ...state,
          runState: "awaiting_input",
          pendingInputKind: signal.kind,
          lastTransitionAt: at,
          lastActivityAt: at,
        };
      case "input_resolved":
        if (state.terminalOutcome !== null)
          return {
            ...state,
            pendingInputKind: void 0,
            lastTransitionAt: at,
          };
        return {
          ...state,
          runState: "running",
          executionStage: state.executionStage ?? "working",
          pendingInputKind: void 0,
          lastTransitionAt: at,
        };
      case "turn_completed":
        return {
          ...state,
          runState: "idle",
          executionStage: null,
          terminalOutcome: "completed",
          pendingInputKind: void 0,
          lastTransitionAt: at,
          lastActivityAt: at,
        };
      case "turn_failed":
        return {
          ...state,
          runState: "idle",
          executionStage: null,
          terminalOutcome: "failed",
          pendingInputKind: void 0,
          lastTransitionAt: at,
        };
      case "runtime_errored":
        return {
          ...state,
          runState: "errored",
          executionStage: null,
          terminalOutcome: "error",
          pendingInputKind: void 0,
          lastTransitionAt: at,
        };
      case "runtime_terminated":
        return {
          ...state,
          runState: "terminated",
          executionStage: null,
          terminalOutcome: "terminated",
          pendingInputKind: void 0,
          lastTransitionAt: at,
          terminationReason: signal.reason,
        };
      default:
        return state;
    }
  }
  function appendStateTransitionEntry(log, entry) {
    const last = log[log.length - 1];
    const stateUnchanged =
      entry.fromRunState === entry.toRunState &&
      entry.fromTaskStatus === entry.toTaskStatus;
    const phaseUnchanged = !entry.phase || last?.phase === entry.phase;
    if (stateUnchanged && phaseUnchanged) return;
    log.push(entry);
    while (log.length > MAX_LOG_ENTRIES) log.shift();
  }
  function applyManualTaskStatus(state, status, timestamp = Date.now()) {
    if (status === "archived")
      return {
        ...state,
        archivedAt: timestamp,
        lastTransitionAt: timestamp,
      };
    const base = {
      ...state,
      archivedAt: void 0,
      lastTransitionAt: timestamp,
    };
    switch (status) {
      case "planning":
        return {
          ...base,
          runState: "running",
          executionStage: "planning",
          terminalOutcome: null,
          pendingInputKind: void 0,
          turnSeq: Math.max(base.turnSeq, 1),
        };
      case "working":
        return {
          ...base,
          runState: "running",
          executionStage: "working",
          terminalOutcome: null,
          pendingInputKind: void 0,
          turnSeq: Math.max(base.turnSeq, 1),
        };
      case "pending":
        return {
          ...base,
          runState: "awaiting_input",
          executionStage: null,
          terminalOutcome: null,
          pendingInputKind: "user_input",
        };
      case "completed":
        return {
          ...base,
          runState: "idle",
          executionStage: null,
          terminalOutcome: "completed",
          pendingInputKind: void 0,
          turnSeq: Math.max(base.turnSeq, 1),
        };
      case "failed":
        return {
          ...base,
          runState: "idle",
          executionStage: null,
          terminalOutcome: "failed",
          pendingInputKind: void 0,
          turnSeq: Math.max(base.turnSeq, 1),
        };
      case "error":
        return {
          ...base,
          runState: "errored",
          executionStage: null,
          terminalOutcome: "error",
          pendingInputKind: void 0,
          turnSeq: Math.max(base.turnSeq, 1),
        };
      case "terminated":
        return {
          ...base,
          runState: "terminated",
          executionStage: null,
          terminalOutcome: "terminated",
          pendingInputKind: void 0,
          turnSeq: Math.max(base.turnSeq, 1),
        };
      default:
        return base;
    }
  }
  function isCancelledStopReason(reason) {
    if (typeof reason !== "string") return false;
    const normalized = reason.trim().toLowerCase();
    return (
      normalized === "cancelled" ||
      normalized === "canceled" ||
      normalized === "cancel"
    );
  }
  function formatDiagnosticDetails(error) {
    if (error instanceof Error)
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    return error;
  }
  function isActiveToolResultStatus(status) {
    return status === "pending" || status === "in_progress";
  }
  var MAX_LOG_ENTRIES = 50;
  class SessionManager {
    applyTaskSignal(session, signal, phase) {
      const previousTaskState = session.taskState;
      const wasTerminal = isTaskTerminal(previousTaskState);
      const previousStatus = deriveTaskStatus(previousTaskState);
      if (signal.type === "turn_started" && previousTaskState.turnSeq === 0)
        session._taskStartedAt ??= signal.timestamp ?? Date.now();
      session.taskState = reduceTaskStatus(previousTaskState, signal);
      const nextStatus = deriveTaskStatus(session.taskState);
      appendStateTransitionEntry(session.stateTransitionLog, {
        signal: signal.type,
        timestamp: signal.timestamp ?? Date.now(),
        fromRunState: previousTaskState.runState,
        toRunState: session.taskState.runState,
        fromTaskStatus: previousStatus,
        toTaskStatus: nextStatus,
        phase,
      });
      session.lastSignalReceivedAt = Date.now();
      if (
        session.taskState.runState === "awaiting_input" &&
        previousTaskState.runState !== "awaiting_input"
      )
        session.awaitingInputStartedAt = Date.now();
      if (
        session.taskState.runState !== "awaiting_input" &&
        previousTaskState.runState === "awaiting_input"
      )
        session.awaitingInputStartedAt = void 0;
      if (signal.type === "awaiting_input") session.hasPendingInput = true;
      if (signal.type === "input_resolved") session.hasPendingInput = false;
      if (!wasTerminal && isTaskTerminal(session.taskState))
        this.clearTurnScopedPendingState(session);
      const statusChanged = previousStatus !== nextStatus;
      const sidebarMetaChanged =
        previousTaskState.lastTransitionAt !==
          session.taskState.lastTransitionAt ||
        previousTaskState.lastActivityAt !== session.taskState.lastActivityAt ||
        previousTaskState.pendingInputKind !==
          session.taskState.pendingInputKind;
      if (!statusChanged && !sidebarMetaChanged) return;
      if (statusChanged) {
        this.logDiagnostic("info", "[SessionManager] task state transition", {
          sessionId: session.sessionId,
          signal: signal.type,
          from: previousStatus,
          to: nextStatus,
          turnSeq: session.taskState.turnSeq,
        });
        this.emitTerminalTaskEvent(session, previousStatus, nextStatus);
        this.clearSidebarMetaDebounce(session.sessionId);
        this.enqueueSessionEffect(session, async () => {
          await this.persistDerivedTaskStatus(
            session.sessionId,
            nextStatus,
            session.taskState.lastTransitionAt,
            session.taskState.lastActivityAt,
          );
          await this.emitSessionRecordUpsert(session.sessionId);
        });
      } else this.scheduleDebouncedSidebarMetaUpdate(session);
    }
    applyExplicitTaskStatus(session, status) {
      const previousStatus = deriveTaskStatus(session.taskState);
      const wasTerminal = isTaskTerminal(session.taskState);
      session.taskState = applyManualTaskStatus(session.taskState, status);
      const nextStatus = deriveTaskStatus(session.taskState);
      if (!wasTerminal && isTaskTerminal(session.taskState))
        this.clearTurnScopedPendingState(session);
      if (previousStatus === nextStatus) return;
      this.emitTerminalTaskEvent(session, previousStatus, nextStatus);
      this.enqueueSessionEffect(session, async () => {
        await this.persistDerivedTaskStatus(
          session.sessionId,
          nextStatus,
          session.taskState.lastTransitionAt,
          session.taskState.lastActivityAt,
        );
        await this.emitSessionRecordUpsert(session.sessionId);
      });
    }
    emitTerminalTaskEvent(session, previousStatus, nextStatus) {
      if (!this.reportTelemetry) return;
      if (previousStatus === nextStatus) return;
      const effectiveStatus =
        nextStatus === "terminated" &&
        isCancelledStopReason(session.taskState.terminationReason)
          ? "completed"
          : nextStatus;
      const isCompleted = effectiveStatus === "completed";
      if (
        !isCompleted &&
        !(
          effectiveStatus === "failed" ||
          effectiveStatus === "error" ||
          effectiveStatus === "terminated"
        )
      )
        return;
      const startedAt = session._taskStartedAt;
      const finishedAt = session.taskState.lastTransitionAt;
      const duration_ms = startedAt ? Math.max(0, finishedAt - startedAt) : 0;
      const total_steps = session.taskState.turnSeq;
      try {
        if (isCompleted)
          this.reportTelemetry("agent_task_completed", {
            mode: "LOCAL",
            task_id: session.sessionId,
            duration_ms,
            total_steps,
          });
        else
          this.reportTelemetry("agent_task_failed", {
            mode: "LOCAL",
            task_id: session.sessionId,
            duration_ms,
            total_steps,
            terminal_outcome: effectiveStatus,
          });
      } catch (error) {
        this.logDiagnostic(
          "info",
          "[SessionManager] terminal task telemetry failed",
          {
            sessionId: session.sessionId,
            nextStatus,
            error: formatDiagnosticDetails(error),
          },
        );
      }
    }
    async persistDerivedTaskStatus(
      sessionId,
      status,
      updatedAt,
      lastActivityAt,
    ) {
      if (!this.recordStore) return;
      if (status === "pending" || status === "planning" || status === "working")
        this.logDiagnostic(
          "info",
          "[SessionManager] persistDerivedTaskStatus: writing non-terminal status to DB",
          {
            sessionId,
            status,
            updatedAt,
            stack: /* @__PURE__ */ new Error().stack
              ?.split("\n")
              .slice(1, 4)
              .map((s) => s.trim())
              .join(" | "),
          },
        );
      await this.upsertSessionRecord(sessionId, (current) => ({
        ...current,
        status,
        updatedAt,
        lastActivityAt: lastActivityAt ?? current.lastActivityAt,
        archivedAt:
          status === "archived"
            ? (current.archivedAt ?? Date.now())
            : current.archivedAt,
      }));
    }
    scheduleDebouncedSidebarMetaUpdate(session) {
      const sessionId = session.sessionId;
      this.clearSidebarMetaDebounce(sessionId);
      const timer = setTimeout(() => {
        this.sidebarMetaDebounceTimers.delete(sessionId);
        if (!this.sessions.has(sessionId)) return;
        const currentStatus = deriveTaskStatus(session.taskState);
        this.enqueueSessionEffect(session, async () => {
          await this.persistDerivedTaskStatus(
            sessionId,
            currentStatus,
            session.taskState.lastTransitionAt,
            session.taskState.lastActivityAt,
          );
          await this.emitSessionRecordUpsert(sessionId);
        });
      }, SessionManager.SIDEBAR_META_DEBOUNCE_MS);
      this.sidebarMetaDebounceTimers.set(sessionId, timer);
    }
    clearSidebarMetaDebounce(sessionId) {
      const existing = this.sidebarMetaDebounceTimers.get(sessionId);
      if (existing !== void 0) {
        clearTimeout(existing);
        this.sidebarMetaDebounceTimers.delete(sessionId);
      }
    }
    clearTurnScopedPendingState(session) {
      if (!this.pluginRecommendationRunSwitches.has(session.sessionId))
        this.pluginRecommendationRegistry?.cancelSession(
          session.sessionId,
          "the session turn ended",
        );
      this.settleInputRequest(session, { kind: "all" });
      const now = Date.now();
      for (const [toolCallId, entry] of session.toolResults)
        if (isActiveToolResultStatus(entry.status))
          session.toolResults.set(toolCallId, {
            ...entry,
            status: "failed",
            updatedAt: now,
          });
    }
    hasActiveToolCall(session) {
      for (const entry of session.toolResults.values())
        if (isActiveToolResultStatus(entry.status)) return true;
      return false;
    }
    settleInputRequest(session, target) {
      let changed = false;
      switch (target.kind) {
        case "permission":
          changed = session.pendingPermissionRequests.delete(target.requestId);
          break;
        case "tool":
          changed = session.pendingQuestionRequests.delete(target.toolCallId);
          changed =
            this.clearPendingPermissionRequestsForToolCall(
              session,
              target.toolCallId,
            ) || changed;
          for (const [
            elicitationId,
            pending,
          ] of session.pendingElicitationRequests)
            if (
              this.extractElicitationToolCallId(pending.request) ===
              target.toolCallId
            ) {
              session.pendingElicitationRequests.delete(elicitationId);
              changed = true;
            }
          break;
        case "elicitation":
          changed = session.pendingElicitationRequests.delete(
            target.elicitationId,
          );
          break;
        case "plugin_recommendation":
          changed = session.pendingPluginRecommendations.delete(
            target.recommendationId,
          );
          break;
        case "all":
          changed =
            session.pendingPermissionRequests.size > 0 ||
            session.pendingQuestionRequests.size > 0 ||
            session.pendingElicitationRequests.size > 0 ||
            session.pendingPluginRecommendations.size > 0;
          session.pendingPermissionRequests.clear();
          session.pendingQuestionRequests.clear();
          session.pendingElicitationRequests.clear();
          session.pendingPluginRecommendations.clear();
          break;
      }
      const previousHistoryLength = session.eventHistory.length;
      session.eventHistory = session.eventHistory.filter(
        (payload) => !this.isSettledInputRequestPayload(payload, target),
      );
      return changed || session.eventHistory.length !== previousHistoryLength;
    }
    isSettledInputRequestPayload(payload, target) {
      const type = typeof payload.type === "string" ? payload.type : void 0;
      if (target.kind === "all")
        return (
          type === "permissionRequest" ||
          type === "questionRequest" ||
          type === "elicitationRequest" ||
          type === "pluginRecommendationRequest"
        );
      if (target.kind === "permission")
        return (
          type === "permissionRequest" && payload.requestId === target.requestId
        );
      if (target.kind === "elicitation")
        return (
          type === "elicitationRequest" &&
          payload.elicitationId === target.elicitationId
        );
      if (target.kind === "plugin_recommendation")
        return (
          type === "pluginRecommendationRequest" &&
          payload.recommendationId === target.recommendationId
        );
      if (type === "questionRequest")
        return payload.toolCallId === target.toolCallId;
      if (type === "permissionRequest") {
        const request = payload.request;
        const toolCall =
          request && typeof request === "object" ? request.toolCall : void 0;
        const requestToolCallId =
          toolCall && typeof toolCall === "object"
            ? toolCall.toolCallId
            : void 0;
        return (
          payload.requestId === target.toolCallId ||
          requestToolCallId === target.toolCallId
        );
      }
      return (
        type === "elicitationRequest" &&
        this.extractElicitationToolCallId(payload.request) === target.toolCallId
      );
    }
    clearPendingPermissionRequestsForToolCall(session, toolCallId) {
      const requestIds = this.getPendingPermissionRequestIdsForToolCall(
        session,
        toolCallId,
      );
      for (const requestId of requestIds)
        session.pendingPermissionRequests.delete(requestId);
      return requestIds.length > 0;
    }
    getPendingPermissionRequestIdsForToolCall(session, toolCallId) {
      const requestIds = [];
      for (const [requestId, pending] of session.pendingPermissionRequests)
        if (
          requestId === toolCallId ||
          pending.request?.toolCall?.toolCallId === toolCallId
        )
          requestIds.push(requestId);
      return requestIds;
    }
    extractElicitationToolCallId(request) {
      if (!request || typeof request !== "object") return;
      const meta = request._meta;
      if (!meta || typeof meta !== "object") return;
      const codebuddyMeta = meta["codebuddy.ai"];
      if (!codebuddyMeta || typeof codebuddyMeta !== "object") return;
      const toolCallId = codebuddyMeta.toolCallId;
      return typeof toolCallId === "string" ? toolCallId : void 0;
    }
    static SIDEBAR_META_DEBOUNCE_MS = 2e3;
  }
  controller.sidebarMetaDebounceTimers ??= new Map();
  controller.pluginRecommendationRunSwitches ??= new Map();
  for (const name of [
    "applyTaskSignal",
    "applyExplicitTaskStatus",
    "emitTerminalTaskEvent",
    "persistDerivedTaskStatus",
    "scheduleDebouncedSidebarMetaUpdate",
    "clearSidebarMetaDebounce",
    "clearTurnScopedPendingState",
    "hasActiveToolCall",
    "settleInputRequest",
    "isSettledInputRequestPayload",
    "clearPendingPermissionRequestsForToolCall",
    "getPendingPermissionRequestIdsForToolCall",
    "extractElicitationToolCallId",
  ])
    Object.defineProperty(
      controller,
      name,
      Object.getOwnPropertyDescriptor(SessionManager.prototype, name),
    );
  for (const name of [
    "reportTelemetry",
    "pluginRecommendationRegistry",
    "emitSessionRecordUpsert",
  ])
    if (deps[name] !== undefined) controller[name] = deps[name];
  return controller;
}

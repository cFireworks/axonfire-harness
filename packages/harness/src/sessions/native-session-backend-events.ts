// @ts-nocheck
// Complete original backend callback wiring; downstream history/plan/team handlers are explicit dependencies.
export const SESSION_BACKEND_EVENTS_SHA256 =
  "528d3bffc67c5244d1a641e0cfc13c2be4ef7943c248b390125b76d70880ed19";
export const SESSION_BACKEND_EVENTS_MEMBERS = [
  ["wireBackend", 4677514, 4684159],
] as const;
export const SESSION_BACKEND_EVENTS_FUNCTIONS = [
  ["tryParseAcpUsageUpdate", 4569188, 4569651],
  ["tryParseAcpUsageByCategory", 4569966, 4570523],
  ["getTeamMemberEventName", 4790103, 4790593],
  ["isTaskTerminal", 3516029, 3516170],
] as const;
export function attachNativeSessionBackendEvents(
  controller: any,
  deps: any = {},
): any {
  function tryParseAcpUsageUpdate(update) {
    if (!update || typeof update !== "object") return null;
    const record = update;
    if (record.sessionUpdate !== "usage_update") return null;
    const used = record.used;
    const size = record.size;
    if (typeof used !== "number" || !Number.isFinite(used) || used < 0)
      return null;
    if (typeof size !== "number" || !Number.isFinite(size) || size < 0)
      return null;
    return {
      sessionUpdate: "usage_update",
      used,
      size,
    };
  }
  function tryParseAcpUsageByCategory(meta) {
    if (!meta) return null;
    const raw = meta["codebuddy.ai/usageByCategory"];
    if (!raw || typeof raw !== "object") return null;
    const r = raw;
    if (r.version !== 1) return null;
    for (const key of [
      "systemPrompt",
      "conversation",
      "tools",
      "mcp",
      "skills",
    ]) {
      const v = r[key];
      if (typeof v !== "number" || !Number.isFinite(v) || v < 0) return null;
    }
    return {
      systemPrompt: r.systemPrompt,
      conversation: r.conversation,
      tools: r.tools,
      mcp: r.mcp,
      skills: r.skills,
      version: 1,
    };
  }
  function getTeamMemberEventName(payload) {
    const metas = [payload.update?._meta, payload._meta];
    for (const meta of metas) {
      const direct = meta?.["codebuddy.ai/memberEvent"];
      if (typeof direct === "string" && direct.trim()) return direct.trim();
      const nested = meta?.["codebuddy.ai"];
      if (nested && typeof nested === "object") {
        const memberName = nested.memberEvent;
        if (typeof memberName === "string" && memberName.trim())
          return memberName.trim();
      }
    }
    return null;
  }
  function isTaskTerminal(state) {
    return (
      state.terminalOutcome !== null ||
      state.runState === "errored" ||
      state.runState === "terminated"
    );
  }
  class NativeSessionBackendEvents {
    wireBackend(session) {
      session.backend.onSessionUpdate = (notification) => {
        session.lastBackendActivityAt = Date.now();
        session.lastBackendMessageAt = Date.now();
        session.hasReceivedBackendActivity = true;
        session.noResponseWatchdog?.resetReportedFlag();
        if (!session.promptTraceId) {
          const notif = notification;
          const updateMeta = notif.update?._meta ?? notif._meta;
          const traceFromUpdate =
            typeof updateMeta?.["codebuddy.ai/traceId"] === "string"
              ? updateMeta["codebuddy.ai/traceId"]
              : void 0;
          if (traceFromUpdate) session.promptTraceId = traceFromUpdate;
        }
        const current = notification;
        const rawPayload =
          current.sessionId === session.sessionId
            ? notification
            : {
                ...current,
                sessionId: session.sessionId,
              };
        const usageUpdate = tryParseAcpUsageUpdate(rawPayload.update);
        if (usageUpdate) {
          if (this.usageCacheService) {
            const update = rawPayload.update;
            const meta = update?._meta;
            const costObj = update?.cost;
            const stageCredit =
              typeof costObj?.amount === "number" &&
              Number.isFinite(costObj.amount) &&
              costObj.amount >= 0
                ? costObj.amount
                : void 0;
            const requestIdRaw = meta?.["codebuddy.ai/requestId"];
            const conversationRequestId =
              typeof requestIdRaw === "string" && requestIdRaw
                ? requestIdRaw
                : void 0;
            const existing = this.usageCacheService.getCached(
              session.sessionId,
            );
            let credit = existing?.credit ? { ...existing.credit } : void 0;
            if (stageCredit !== void 0 && conversationRequestId) {
              if (!credit) credit = {};
              const prev = credit[conversationRequestId] ?? 0;
              credit[conversationRequestId] = prev + stageCredit;
            }
            const usageByCategory =
              tryParseAcpUsageByCategory(meta) ?? existing?.usageByCategory;
            this.usageCacheService.recordUsage(session.sessionId, {
              used: usageUpdate.used,
              size: usageUpdate.size,
              updatedAt: Date.now(),
              ...(credit ? { credit } : {}),
              ...(usageByCategory ? { usageByCategory } : {}),
            });
          }
          this.emitOrBufferScopedEvent(session, rawPayload);
          return;
        }
        {
          const updateType = rawPayload.update?.sessionUpdate;
          if (
            updateType === "current_mode_update" ||
            updateType === "config_option_update"
          )
            rawPayload.modeEpoch = session.modeEpoch;
        }
        if (getTeamMemberEventName(rawPayload)) {
          this.emitOrBufferScopedEvent(session, rawPayload);
          return;
        }
        const preparedPlan = this.preparePlanNotification(session, rawPayload);
        const payload = preparedPlan.payload;
        this.handleHistoryReplayBoundary(session, payload);
        if (this.recordSessionEvent(session, payload) === "duplicate") return;
        this.commitPreparedPlanSnapshot(session, preparedPlan);
        this.captureToolResultFromUpdate(session, payload);
        this.handleBackendSessionUpdate(session, payload);
        this.emitOrBufferScopedEvent(session, payload);
        const derivedPlan = this.createPlanNotificationFromTaskToolResult(
          session,
          payload,
        );
        if (derivedPlan) {
          if (
            this.recordSessionEvent(session, derivedPlan.payload) !==
            "duplicate"
          ) {
            this.commitPreparedPlanSnapshot(session, derivedPlan);
            this.emitOrBufferScopedEvent(session, derivedPlan.payload);
          }
        }
        this.handleHistoryReplayCompletion(session, payload);
      };
      session.backend.onExtNotification = (event) => {
        if (event.method === "elicitation/complete") {
          const elicitationId =
            typeof event.params?.elicitationId === "string"
              ? event.params.elicitationId
              : void 0;
          if (
            elicitationId &&
            this.settleInputRequest(session, {
              kind: "elicitation",
              elicitationId,
            })
          )
            this.syncPendingInputStateAfterMutation(session);
        }
        this.emitOrBufferScopedEvent(session, {
          type: "extNotification",
          sessionId: session.sessionId,
          method: event.method,
          params: event.params,
        });
      };
      session.backend.onQuestionRequest = (event) => {
        if (isTaskTerminal(session.taskState)) return;
        const receivedAt = Date.now();
        this.applyTaskSignal(session, {
          type: "awaiting_input",
          kind: "question",
        });
        session.pendingQuestionRequests.set(event.toolCallId, {
          toolCallId: event.toolCallId,
          receivedAt,
          request: event.request,
        });
        const payload = {
          type: "questionRequest",
          sessionId: session.sessionId,
          toolCallId: event.toolCallId,
          request: event.request,
        };
        if (this.recordSessionEvent(session, payload) === "duplicate") return;
        this.emitOrBufferScopedEvent(session, payload);
        this.pushEvent("session:event", payload);
      };
      session.backend.onElicitationRequest = (event) => {
        if (isTaskTerminal(session.taskState)) {
          session.backend.respondElicitation?.(event.elicitationId, "cancel");
          this.logDiagnostic(
            "info",
            "[SessionManager][Elicitation] terminal turn, auto-cancel",
            {
              sessionId: session.sessionId,
              elicitationId: event.elicitationId,
            },
          );
          return;
        }
        const receivedAt = Date.now();
        this.applyTaskSignal(session, {
          type: "awaiting_input",
          kind: "question",
        });
        session.pendingElicitationRequests.set(event.elicitationId, {
          elicitationId: event.elicitationId,
          receivedAt,
          request: event.request,
        });
        const payload = {
          type: "elicitationRequest",
          sessionId: session.sessionId,
          elicitationId: event.elicitationId,
          request: event.request,
        };
        const recordResult = this.recordSessionEvent(session, payload);
        this.logDiagnostic(
          "info",
          "[SessionManager][Elicitation] onElicitationRequest received",
          {
            sessionId: session.sessionId,
            elicitationId: event.elicitationId,
            toolCallId: this.extractElicitationToolCallId(event.request),
            recordResult,
          },
        );
        if (recordResult === "duplicate") return;
        this.emitOrBufferScopedEvent(session, payload);
        this.pushEvent("session:event", payload);
      };
      session.backend.onPermissionRequest = (event) => {
        if (isTaskTerminal(session.taskState)) return;
        const receivedAt = Date.now();
        this.applyTaskSignal(session, {
          type: "awaiting_input",
          kind: "permission",
        });
        const request = {
          ...event.params,
          sessionId: session.sessionId,
        };
        const payload = {
          type: "permissionRequest",
          sessionId: session.sessionId,
          requestId: event.requestId,
          request,
        };
        session.pendingPermissionRequests.set(event.requestId, {
          requestId: event.requestId,
          receivedAt,
          request,
        });
        this.emitOrBufferScopedEvent(session, payload);
        this.pushEvent("session:event", payload);
      };
      session.backend.onRuntimeSignal = (signal) => {
        this.applyTaskSignal(session, signal);
      };
      session.backend.onTransportActivity = () => {
        session.lastBackendActivityAt = Date.now();
      };
    }
  }
  Object.defineProperty(
    controller,
    "wireBackend",
    Object.getOwnPropertyDescriptor(
      NativeSessionBackendEvents.prototype,
      "wireBackend",
    ),
  );
  for (const name of [
    "usageCacheService",
    "emitOrBufferScopedEvent",
    "preparePlanNotification",
    "handleHistoryReplayBoundary",
    "recordSessionEvent",
    "commitPreparedPlanSnapshot",
    "captureToolResultFromUpdate",
    "handleBackendSessionUpdate",
    "createPlanNotificationFromTaskToolResult",
    "handleHistoryReplayCompletion",
    "pushEvent",
  ])
    if (deps[name] !== undefined) controller[name] = deps[name];
  return controller;
}

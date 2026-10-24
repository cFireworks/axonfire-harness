import assert from "node:assert/strict";
import type { attachNativeSessionBackendEvents } from "../../src/sessions/native-session-backend-events.js";
import { attachNativeSessionTaskState } from "../../src/sessions/native-session-task-state.js";
import { attachNativeSessionCleanup } from "../../src/sessions/native-session-cleanup.js";
type Factory = typeof attachNativeSessionBackendEvents;
function fixture(attach: Factory) {
  const calls: string[] = [],
    emitted: any[] = [],
    pushed: any[] = [],
    signals: any[] = [],
    cancelled: any[] = [],
    usage: any[] = [];
  let cached: any,
    duplicate = false,
    derived: any;
  const session: any = {
    sessionId: "owned",
    backend: { respondElicitation: (...a: any[]) => cancelled.push(a) },
    modeEpoch: 7,
    taskState: {
      sessionId: "owned",
      runState: "running",
      executionStage: "working",
      terminalOutcome: null,
      turnSeq: 1,
      lastTransitionAt: 10,
    },
    stateTransitionLog: [],
    eventHistory: [],
    toolResults: new Map(),
    pendingPermissionRequests: new Map(),
    pendingQuestionRequests: new Map(),
    pendingElicitationRequests: new Map(),
    pendingPluginRecommendations: new Map(),
    noResponseWatchdog: { resetReportedFlag: () => calls.push("watchdog") },
  };
  const controller: any = {
    logDiagnostic() {},
    applyTaskSignal: (_s: any, x: any) => signals.push(x),
    settleInputRequest: () => true,
    syncPendingInputStateAfterMutation: () => calls.push("sync"),
    extractElicitationToolCallId: () => undefined,
  };
  attach(controller, {
    usageCacheService: {
      getCached: () => cached,
      recordUsage: (_id: string, x: any) => {
        cached = x;
        usage.push(x);
      },
    },
    emitOrBufferScopedEvent: (_s: any, x: any) => {
      calls.push("emit");
      emitted.push(x);
    },
    preparePlanNotification: (_s: any, payload: any) => {
      calls.push("prepare");
      return { payload };
    },
    handleHistoryReplayBoundary: () => calls.push("boundary"),
    recordSessionEvent: () => {
      calls.push("record");
      return duplicate ? "duplicate" : "recorded";
    },
    commitPreparedPlanSnapshot: () => calls.push("commit"),
    captureToolResultFromUpdate: () => calls.push("tool"),
    handleBackendSessionUpdate: () => calls.push("update"),
    createPlanNotificationFromTaskToolResult: () => {
      calls.push("derive");
      return derived;
    },
    handleHistoryReplayCompletion: () => calls.push("complete"),
    pushEvent: (...a: any[]) => pushed.push(a),
  });
  controller.wireBackend(session);
  return {
    controller,
    session,
    calls,
    emitted,
    pushed,
    signals,
    cancelled,
    usage,
    setCached(x: any) {
      cached = x;
    },
    setDuplicate(x: boolean) {
      duplicate = x;
    },
    setDerived(x: any) {
      derived = x;
    },
  };
}
export const sessionBackendEventsScenarios: Array<
  [string, (attach: Factory) => Promise<void>]
> = [
  [
    "normal update corrects identity and preserves full ordered pipeline",
    async (attach) => {
      const f = fixture(attach),
        raw = {
          sessionId: "foreign",
          update: {
            sessionUpdate: "agent_message_chunk",
            content: { type: "text", text: "owned" },
          },
        };
      f.session.backend.onSessionUpdate(raw);
      assert.equal(raw.sessionId, "foreign");
      assert.equal(f.emitted[0].sessionId, "owned");
      assert.deepEqual(f.calls, [
        "watchdog",
        "prepare",
        "boundary",
        "record",
        "commit",
        "tool",
        "update",
        "emit",
        "derive",
        "complete",
      ]);
      assert.equal(f.session.hasReceivedBackendActivity, true);
      assert.equal(typeof f.session.lastBackendMessageAt, "number");
    },
  ],
  [
    "duplicate normal updates stop after boundary while derived plans have independent recording",
    async (attach) => {
      const f = fixture(attach);
      f.setDuplicate(true);
      f.session.backend.onSessionUpdate({ sessionId: "owned", update: {} });
      assert.deepEqual(f.calls, ["watchdog", "prepare", "boundary", "record"]);
      f.calls.length = 0;
      f.setDuplicate(false);
      const derived = {
        payload: { sessionId: "owned", update: { sessionUpdate: "plan" } },
      };
      f.setDerived(derived);
      f.session.backend.onSessionUpdate({ sessionId: "owned", update: {} });
      assert.deepEqual(f.calls, [
        "watchdog",
        "prepare",
        "boundary",
        "record",
        "commit",
        "tool",
        "update",
        "emit",
        "derive",
        "record",
        "commit",
        "emit",
        "complete",
      ]);
      assert.equal(f.emitted[1], derived.payload);
    },
  ],
  [
    "usage accumulates per-request credit and validates categories without normal history",
    async (attach) => {
      const f = fixture(attach);
      const credit = { r: 2 };
      const categories = {
        version: 1,
        systemPrompt: 1,
        conversation: 2,
        tools: 3,
        mcp: 4,
        skills: 5,
      };
      f.setCached({ credit, usageByCategory: categories });
      f.session.backend.onSessionUpdate({
        sessionId: "foreign",
        update: {
          sessionUpdate: "usage_update",
          used: 3,
          size: 8,
          cost: { amount: 0.5 },
          _meta: {
            "codebuddy.ai/requestId": "r",
            "codebuddy.ai/usageByCategory": { version: 1, systemPrompt: -1 },
          },
        },
      });
      assert.deepEqual(f.calls, ["watchdog", "emit"]);
      assert.deepEqual(f.usage[0].credit, { r: 2.5 });
      assert.deepEqual(credit, { r: 2 });
      assert.deepEqual(f.usage[0].usageByCategory, categories);
      f.session.backend.onSessionUpdate({
        sessionId: "owned",
        update: {
          sessionUpdate: "usage_update",
          used: 0,
          size: 0,
          cost: { amount: Infinity },
          _meta: {
            "codebuddy.ai/requestId": "r",
            "codebuddy.ai/usageByCategory": { ...categories, tools: 9 },
          },
        },
      });
      assert.equal(f.usage[1].credit.r, 2.5);
      assert.equal(f.usage[1].usageByCategory.tools, 9);
      assert.equal(f.emitted[0].sessionId, "owned");
    },
  ],
  [
    "invalid usage enters ordinary pipeline; valid usage emits without cache service",
    async (attach) => {
      for (const used of [-1, Infinity, NaN, "1"]) {
        const f = fixture(attach);
        f.session.backend.onSessionUpdate({
          sessionId: "owned",
          update: { sessionUpdate: "usage_update", used, size: 2 },
        });
        assert.equal(f.usage.length, 0);
        assert.ok(f.calls.includes("update"));
      }
      const f = fixture(attach);
      delete f.controller.usageCacheService;
      f.session.backend.onSessionUpdate({
        sessionId: "owned",
        update: { sessionUpdate: "usage_update", used: 1, size: 2 },
      });
      assert.deepEqual(f.calls, ["watchdog", "emit"]);
    },
  ],
  [
    "team member events bypass history and mode epochs mutate only normalized payload",
    async (attach) => {
      const f = fixture(attach);
      const raw = {
        sessionId: "owned",
        update: {
          sessionUpdate: "current_mode_update",
          _meta: { "codebuddy.ai": { memberEvent: " member " } },
        },
      };
      f.session.backend.onSessionUpdate(raw);
      assert.deepEqual(f.calls, ["watchdog", "emit"]);
      assert.equal((raw as any).modeEpoch, 7);
      const other = {
        sessionId: "foreign",
        update: { sessionUpdate: "config_option_update" },
      };
      f.session.backend.onSessionUpdate(other);
      assert.equal((other as any).modeEpoch, undefined);
      assert.equal(f.emitted.at(-1).modeEpoch, 7);
    },
  ],
  [
    "trace precedence and transport-only activity preserve message flags",
    async (attach) => {
      const f = fixture(attach);
      f.session.backend.onTransportActivity();
      assert.equal(typeof f.session.lastBackendActivityAt, "number");
      assert.equal(f.session.lastBackendMessageAt, undefined);
      assert.equal(f.session.hasReceivedBackendActivity, undefined);
      f.session.backend.onSessionUpdate({
        sessionId: "owned",
        _meta: { "codebuddy.ai/traceId": "top" },
        update: { _meta: {} },
      });
      assert.equal(f.session.promptTraceId, undefined);
      f.session.backend.onSessionUpdate({
        sessionId: "owned",
        update: { _meta: { "codebuddy.ai/traceId": "first" } },
      });
      f.session.backend.onSessionUpdate({
        sessionId: "owned",
        update: { _meta: { "codebuddy.ai/traceId": "later" } },
      });
      assert.equal(f.session.promptTraceId, "first");
      const signal = { type: "working_started" };
      f.session.backend.onRuntimeSignal(signal);
      assert.equal(f.signals.at(-1), signal);
    },
  ],
  [
    "permission emits twice without history dedupe and uses owning session identity",
    async (attach) => {
      const f = fixture(attach);
      f.session.backend.onPermissionRequest({
        requestId: "p",
        params: { sessionId: "foreign", toolCall: { toolCallId: "t" } },
      });
      assert.equal(
        f.session.pendingPermissionRequests.get("p").request.sessionId,
        "owned",
      );
      assert.deepEqual(f.calls, ["emit"]);
      assert.deepEqual(f.signals, [
        { type: "awaiting_input", kind: "permission" },
      ]);
      assert.equal(f.pushed[0][0], "session:event");
      assert.equal(f.pushed[0][1], f.emitted[0]);
      assert.equal(f.session.eventHistory.length, 0);
    },
  ],
  [
    "question and elicitation update pending maps before duplicate suppression",
    async (attach) => {
      const f = fixture(attach);
      f.setDuplicate(true);
      f.session.backend.onQuestionRequest({
        toolCallId: "q",
        request: { text: "question" },
      });
      f.session.backend.onElicitationRequest({
        elicitationId: "e",
        request: { message: "elicit" },
      });
      assert.equal(f.session.pendingQuestionRequests.size, 1);
      assert.equal(f.session.pendingElicitationRequests.size, 1);
      assert.equal(f.signals.length, 2);
      assert.equal(f.emitted.length, 0);
      assert.equal(f.pushed.length, 0);
      f.setDuplicate(false);
      f.session.backend.onElicitationRequest({
        elicitationId: "e",
        request: { message: "new" },
      });
      assert.equal(f.emitted[0].request.message, "new");
      assert.equal(f.pushed.length, 1);
    },
  ],
  [
    "terminal turns ignore permission/question and synchronously cancel elicitation",
    async (attach) => {
      const f = fixture(attach);
      f.session.taskState.terminalOutcome = "completed";
      f.session.backend.onQuestionRequest({ toolCallId: "q", request: {} });
      f.session.backend.onPermissionRequest({ requestId: "p", params: {} });
      f.session.backend.onElicitationRequest({
        elicitationId: "e",
        request: {},
      });
      assert.deepEqual(f.cancelled, [["e", "cancel"]]);
      assert.equal(f.signals.length, 0);
      assert.equal(f.emitted.length, 0);
      f.session.backend.respondElicitation = () => {
        throw Error("owned cancellation");
      };
      assert.throws(
        () =>
          f.session.backend.onElicitationRequest({
            elicitationId: "e2",
            request: {},
          }),
        /owned cancellation/,
      );
    },
  ],
  [
    "extension completion settles real task input maps and preserves terminal state",
    async (attach) => {
      const f = fixture(attach);
      Object.assign(f.controller, {
        sessions: new Map([["owned", f.session]]),
        enqueueSessionEffect() {},
      });
      attachNativeSessionCleanup(f.controller, {
        unregisterSessionDeferredBuiltinPolicy() {},
      });
      attachNativeSessionTaskState(f.controller);
      f.session.backend.onElicitationRequest({
        elicitationId: "e",
        request: {},
      });
      assert.equal(f.session.taskState.runState, "awaiting_input");
      f.session.backend.onExtNotification({
        method: "elicitation/complete",
        params: { elicitationId: "e" },
      });
      assert.equal(f.session.pendingElicitationRequests.size, 0);
      assert.equal(f.session.taskState.runState, "running");
      assert.equal(f.emitted.at(-1).type, "extNotification");
      f.session.backend.onRuntimeSignal({
        type: "turn_completed",
        timestamp: 20,
      });
      f.session.backend.onElicitationRequest({
        elicitationId: "late",
        request: {},
      });
      assert.equal(f.session.taskState.terminalOutcome, "completed");
      assert.deepEqual(f.cancelled, [["late", "cancel"]]);
      f.controller.clearSidebarMetaDebounce("owned");
    },
  ],
];

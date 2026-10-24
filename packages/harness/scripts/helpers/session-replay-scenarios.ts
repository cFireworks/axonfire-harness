import assert from "node:assert/strict";
import type { attachNativeSessionReplay } from "../../src/sessions/native-session-replay.js";
import { attachNativeSessionTaskState } from "../../src/sessions/native-session-task-state.js";
import { attachNativeSessionCleanup } from "../../src/sessions/native-session-cleanup.js";
import { attachNativeSessionHistory } from "../../src/sessions/native-session-history.js";
import { attachNativeSessionPlans } from "../../src/sessions/native-session-plans.js";
import { attachNativeSessionToolResults } from "../../src/sessions/native-session-tool-results.js";
import { attachNativeSessionTeamState } from "../../src/sessions/native-session-team-state.js";
type Factory = typeof attachNativeSessionReplay;
export function sessionReplayFixture(attach: Factory) {
  const warnings: any[] = [],
    effects: Promise<any>[] = [];
  const s: any = {
    sessionId: "owned",
    cwd: "/owned",
    taskState: {
      sessionId: "owned",
      runState: "running",
      executionStage: "working",
      terminalOutcome: null,
      turnSeq: 1,
      lastTransitionAt: 1,
    },
    teamRuntime: { membersByName: new Map() },
    stateTransitionLog: [],
    eventHistory: [],
    toolResults: new Map(),
    pendingPermissionRequests: new Map(),
    pendingQuestionRequests: new Map(),
    pendingElicitationRequests: new Map(),
    pendingPluginRecommendations: new Map(),
    historyHydrationDepth: 0,
    ownerHistoryHydrated: false,
  };
  const c: any = {
    sessions: new Map([["owned", s]]),
    logDiagnostic: (...x: any[]) => warnings.push(x),
    enqueueSessionEffect(_s: any, fn: any) {
      const p = Promise.resolve().then(fn);
      effects.push(p);
      return p;
    },
    async emitSessionRecordUpsert() {},
    async persistLastUserPromptExpertSelection() {},
    async flushPendingRuntimeConfigIfIdle() {},
  };
  attachNativeSessionCleanup(c, {
    unregisterSessionDeferredBuiltinPolicy() {},
  });
  attachNativeSessionTaskState(c);
  attachNativeSessionHistory(c, { pushEvent() {} });
  attachNativeSessionPlans(c);
  attachNativeSessionToolResults(c);
  attachNativeSessionTeamState(c);
  attach(c);
  return {
    c,
    s,
    warnings,
    async drain() {
      await Promise.all(effects);
    },
    close() {
      c.clearSidebarMetaDebounce("owned");
    },
  };
}
const msg = (text: string, mode = "stream"): any => ({
  sessionId: "owned",
  update: {
    sessionUpdate: "agent_message_chunk",
    content: { type: "text", text },
  },
  _meta: { "codebuddy.ai": { mode } },
});
export const sessionReplayScenarios: Array<
  [string, (attach: Factory) => Promise<void>]
> = [
  [
    "inactive priming clones events and rejects stale generations",
    async (attach) => {
      const f = sessionReplayFixture(attach);
      try {
        f.c.sessions.clear();
        const generation = f.c.getHistoryStoreGeneration("owned"),
          input = [msg("original")];
        await f.c.primeSessionReplay(
          "owned",
          input,
          " /owned/../next/ ",
          generation,
        );
        input[0].update.content.text = "changed";
        assert.equal(f.c.primedReplayStates.get("owned").cwd, "/next");
        assert.equal(
          f.c.primedReplayStates.get("owned").events[0].update.content.text,
          "original",
        );
        f.c.historySessionGenerations.set("owned", 1);
        await f.c.replaceSessionReplay(
          "owned",
          [msg("stale")],
          "/stale",
          generation,
        );
        assert.equal(
          f.c.primedReplayStates.get("owned").events[0].update.content.text,
          "original",
        );
      } finally {
        f.close();
      }
    },
  ],
  [
    "initial hydration appends live tail after new history and normalizes replay mode",
    async (attach) => {
      const f = sessionReplayFixture(attach);
      try {
        f.s.eventHistory = [msg("old-history", "history"), msg("live")];
        const input = msg("new", "stream");
        f.c.replaceSessionReplayState(f.s, [input], "/new/");
        assert.deepEqual(
          f.s.eventHistory.map((e: any) => e.update.content.text),
          ["new", "live"],
        );
        assert.equal(f.s.eventHistory[0]._meta["codebuddy.ai"].mode, "history");
        assert.equal(input._meta["codebuddy.ai"].mode, "stream");
        assert.equal(f.s.cwd, "/new");
        assert.equal(f.s.ownerHistoryHydrated, true);
        f.c.replaceSessionReplayState(f.s, [msg("replacement")]);
        assert.deepEqual(
          f.s.eventHistory.map((e: any) => e.update.content.text),
          ["replacement"],
        );
      } finally {
        f.close();
      }
    },
  ],
  [
    "live processing preserves task and input objects while replacing historical content",
    async (attach) => {
      const f = sessionReplayFixture(attach);
      try {
        f.s.isProcessing = true;
        const pending = {
          requestId: "live",
          receivedAt: 2,
          request: { toolCall: { toolCallId: "t" } },
        };
        f.s.pendingPermissionRequests.set("live", pending);
        const before = { ...f.s.taskState };
        f.c.replaceSessionReplayState(f.s, [
          {
            type: "questionRequest",
            toolCallId: "history-q",
            request: { question: "old" },
          },
        ]);
        assert.deepEqual(f.s.taskState, before);
        assert.equal(f.s.pendingPermissionRequests.get("live"), pending);
        assert.equal(f.s.pendingQuestionRequests.size, 0);
        assert.equal(f.s.eventHistory[0].toolCallId, "history-q");
      } finally {
        f.close();
      }
    },
  ],
  [
    "pending input alone preserves control state even without processing",
    async (attach) => {
      const f = sessionReplayFixture(attach);
      try {
        f.s.taskState.runState = "awaiting_input";
        const req = { request: { message: "live" } };
        f.s.pendingElicitationRequests.set("live", req);
        f.c.replaceSessionReplayState(f.s, []);
        assert.equal(f.s.taskState.runState, "awaiting_input");
        assert.equal(f.s.pendingElicitationRequests.get("live"), req);
        assert.equal(f.s.ownerHistoryHydrated, true);
      } finally {
        f.close();
      }
    },
  ],
  [
    "terminal state survives history while original terminal guard still permits pending-map hydration",
    async (attach) => {
      const f = sessionReplayFixture(attach);
      try {
        f.c.applyTaskSignal(f.s, { type: "turn_completed", timestamp: 10 });
        f.c.replaceSessionReplayState(f.s, [
          {
            type: "permissionRequest",
            requestId: "p",
            request: { toolCall: { toolCallId: "t" } },
          },
        ]);
        assert.equal(f.s.taskState.terminalOutcome, "completed");
        assert.equal(f.s.pendingPermissionRequests.size, 1);
        assert.equal(f.s.hasPendingInput, true);
      } finally {
        f.close();
      }
    },
  ],
  [
    "tool and plan state rebuild from recorded results and duplicate offsets skip later result",
    async (attach) => {
      const f = sessionReplayFixture(attach);
      try {
        const update = {
          sessionUpdate: "tool_call_update",
          toolCallId: "task",
          status: "completed",
          _meta: { "codebuddy.ai/toolName": "TaskList" },
          rawOutput: { tasks: [{ subject: "restored task" }] },
        };
        const payload = { update, _meta: { "codebuddy.ai": { offset: 1 } } };
        f.c.replaceSessionReplayState(f.s, [
          payload,
          { ...payload, update: { ...update, status: "failed" } },
        ]);
        assert.equal(f.s.toolResults.get("task").status, "completed");
        assert.equal(
          f.s.planSnapshot.update.entries[0].content,
          "restored task",
        );
        assert.equal(f.s.eventHistory.length, 2);
        assert.ok(
          f.s.eventHistory.every(
            (x: any) => x._meta["codebuddy.ai"].mode === "history",
          ),
        );
      } finally {
        f.close();
      }
    },
  ],
  [
    "plugin recommendation replay requires pending registry only for question and elicitation forms",
    async (attach) => {
      const f = sessionReplayFixture(attach);
      try {
        const question = {
          type: "questionRequest",
          toolCallId: "q",
          request: {
            inputType: "plugin_recommendation",
            pluginRecommendation: {},
          },
        };
        const elicitation = {
          type: "elicitationRequest",
          elicitationId: "e",
          request: {
            _meta: {
              "codebuddy.ai": {
                inputType: "plugin_recommendation",
                pluginRecommendation: {},
              },
            },
          },
        };
        f.c.hydrateSessionReplayPayload(f.s, question, "history");
        f.c.hydrateSessionReplayPayload(f.s, elicitation, "history");
        assert.equal(f.s.eventHistory.length, 0);
        f.c.pluginRecommendationRegistry = { getPendingRequest: () => ({}) };
        f.c.hydrateSessionReplayPayload(f.s, question, "history");
        f.c.hydrateSessionReplayPayload(f.s, elicitation, "history");
        assert.equal(f.s.pendingQuestionRequests.size, 1);
        assert.equal(f.s.pendingElicitationRequests.size, 1);
        f.c.hydrateSessionReplayPayload(
          f.s,
          {
            type: "pluginRecommendationRequest",
            recommendationId: "r",
            deadline: 5,
            request: { type: "skill", plugins: [{ pluginId: "p" }] },
          },
          "history",
        );
        assert.equal(
          f.s.pendingPluginRecommendations.get("r").candidates[0].pluginName,
          "p",
        );
        f.c.replaceSessionReplayState(f.s, []);
        assert.equal(f.s.pendingPluginRecommendations.size, 1);
      } finally {
        f.close();
      }
    },
  ],
  [
    "question cancellation settles matching requests and cancels registry ownership",
    async (attach) => {
      const f = sessionReplayFixture(attach),
        cancelled: any[] = [];
      try {
        f.c.pluginRecommendationRegistry = {
          cancelRequest: (...a: any[]) => cancelled.push(a),
        };
        f.c.hydrateSessionReplayPayload(
          f.s,
          { type: "questionRequest", toolCallId: "q", request: {} },
          "live",
        );
        f.c.hydrateSessionReplayPayload(
          f.s,
          { type: "questionCancelled", toolCallId: "q" },
          "history",
        );
        assert.equal(f.s.pendingQuestionRequests.size, 0);
        assert.equal(f.s.taskState.runState, "running");
        assert.equal(cancelled[0][1], "q");
        assert.deepEqual(
          f.s.eventHistory.map((x: any) => x.type),
          ["questionCancelled"],
        );
      } finally {
        f.close();
      }
    },
  ],
  [
    "active replacement clears primed data after success but malformed input leaves partial reset",
    async (attach) => {
      const f = sessionReplayFixture(attach);
      try {
        f.c.primedReplayStates.set("owned", { events: [] });
        await f.c.primeSessionReplay(
          "owned",
          [msg("active")],
          "/active",
          f.c.getHistoryStoreGeneration("owned"),
        );
        assert.equal(f.c.primedReplayStates.has("owned"), false);
        assert.equal(f.s.eventHistory.length, 1);
        f.s.ownerHistoryHydrated = false;
        assert.throws(
          () =>
            f.c.replaceSessionReplayState(f.s, [
              {
                type: "pluginRecommendationRequest",
                recommendationId: "bad",
                deadline: 1,
                request: {},
              },
            ]),
          /map/,
        );
        assert.equal(f.s.eventHistory.length, 0);
        assert.equal(f.s.ownerHistoryHydrated, false);
      } finally {
        f.close();
      }
    },
  ],
];

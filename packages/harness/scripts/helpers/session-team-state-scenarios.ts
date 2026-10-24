import assert from "node:assert/strict";
import type { attachNativeSessionTeamState } from "../../src/sessions/native-session-team-state.js";
import { attachNativeSessionTaskState } from "../../src/sessions/native-session-task-state.js";
import { attachNativeSessionCleanup } from "../../src/sessions/native-session-cleanup.js";
type Factory = typeof attachNativeSessionTeamState;
function fixture(attach: Factory) {
  const effects: Promise<any>[] = [],
    emits: any[] = [],
    stops: any[] = [];
  let record: any = { title: "old", updatedAt: 1 };
  const s: any = {
    sessionId: "owned",
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
    isProcessing: true,
    historyHydrationDepth: 0,
    noResponseWatchdog: { stop: () => stops.push("watchdog") },
  };
  const c: any = {
    sessions: new Map([["owned", s]]),
    logDiagnostic() {},
    enqueueSessionEffect(_s: any, fn: any) {
      const p = Promise.resolve().then(fn);
      effects.push(p);
      return p;
    },
    async upsertSessionRecord(_id: string, fn: any) {
      record = fn(record);
    },
    async emitSessionRecordUpsert() {
      emits.push({ ...record });
    },
    async flushPendingRuntimeConfigIfIdle() {
      stops.push("flush");
    },
  };
  attachNativeSessionCleanup(c, {
    unregisterSessionDeferredBuiltinPolicy() {},
  });
  attachNativeSessionTaskState(c);
  attach(c);
  return {
    c,
    s,
    emits,
    stops,
    get record() {
      return record;
    },
    set record(r: any) {
      record = r;
    },
    async drain() {
      await Promise.all(effects);
      await Promise.resolve();
    },
    close() {
      c.clearSidebarMetaDebounce("owned");
    },
  };
}
const team = (type: string, extra: any = {}): any => ({
  _meta: { "codebuddy.ai/teamUpdate": { type, ...extra } },
});
export const sessionTeamStateScenarios: Array<
  [string, (attach: Factory) => Promise<void>]
> = [
  [
    "runtime extraction honors agent phase before event type and normalized raw state",
    async (attach) => {
      const { c } = fixture(attach);
      assert.deepEqual(
        c.extractRuntimeSignalFromNotification({
          update: {
            sessionUpdate: "tool_call",
            currentState: "completed",
            _meta: { "codebuddy.ai/agentPhase": { phase: "model_requesting" } },
          },
        }),
        { type: "planning_started" },
      );
      assert.deepEqual(
        c.extractRuntimeSignalFromNotification({
          update: {
            sessionUpdate: "agent_message_chunk",
            currentState: "error",
          },
        }),
        { type: "working_started" },
      );
      assert.deepEqual(
        c.extractRuntimeSignalFromNotification({
          update: { currentState: " Waiting-User-Input " },
        }),
        { type: "awaiting_input", kind: "user_input" },
      );
      assert.deepEqual(
        c.extractRuntimeSignalFromNotification({
          update: { currentState: "CANCELED" },
        }),
        { type: "runtime_terminated", reason: "canceled" },
      );
      assert.equal(c.classifyPhase("tool_executing"), "tool");
    },
  ],
  [
    "history and inactive gates suppress runtime transitions while stop allows terminal signals",
    async (attach) => {
      const f = fixture(attach);
      try {
        f.c.handleBackendSessionUpdate(f.s, {
          update: { currentState: "completed" },
          _meta: { "codebuddy.ai": { mode: "history" } },
        });
        assert.equal(f.s.taskState.terminalOutcome, null);
        f.s.isProcessing = false;
        f.c.handleBackendSessionUpdate(f.s, {
          update: { currentState: "completed" },
        });
        assert.equal(f.s.taskState.terminalOutcome, null);
        f.s.stopRequested = true;
        f.c.handleBackendSessionUpdate(f.s, {
          update: { currentState: "completed" },
        });
        assert.equal(f.s.taskState.terminalOutcome, "completed");
      } finally {
        f.close();
      }
    },
  ],
  [
    "terminal tool updates settle matching pending input before applying working state",
    async (attach) => {
      const f = fixture(attach);
      try {
        f.s.pendingQuestionRequests.set("t", {});
        f.s.eventHistory = [{ type: "questionRequest", toolCallId: "t" }];
        f.c.handleBackendSessionUpdate(f.s, {
          update: {
            sessionUpdate: "tool_call_update",
            toolCallId: "t",
            status: "completed",
          },
        });
        assert.equal(f.s.pendingQuestionRequests.size, 0);
        assert.equal(f.s.eventHistory.length, 0);
        assert.equal(f.s.taskState.runState, "running");
        assert.equal(f.s.hasPendingInput, false);
      } finally {
        f.close();
      }
    },
  ],
  [
    "team creation resets old metadata and member snapshots replace the complete roster",
    async (attach) => {
      const f = fixture(attach);
      try {
        f.s.teamRuntime.teamName = "old";
        f.s.teamRuntime.isAutoTeam = true;
        f.s.teamRuntime.membersByName.set("old", {});
        f.c.handleTeamRuntimeUpdate(f.s, team("team_created"));
        assert.equal(f.s.teamRuntime.teamName, undefined);
        assert.equal(f.s.teamRuntime.isAutoTeam, undefined);
        assert.equal(f.s.teamRuntime.membersByName.size, 0);
        f.c.handleTeamRuntimeUpdate(
          f.s,
          team("member_status_change", {
            teamName: " next ",
            isAutoTeam: false,
            members: [
              null,
              { name: " " },
              {
                name: " a ",
                status: " RUNNING ",
                tokenUsage: { inputTokens: -1 },
                lastFailure: { error: " failure ", category: "test" },
              },
              { name: "b", status: "done" },
            ],
          }),
        );
        assert.equal(f.s.teamRuntime.teamName, "next");
        assert.equal(f.c.countActiveTeamMembers(f.s), 1);
        assert.equal(
          f.s.teamRuntime.membersByName.get("a").tokenUsage.inputTokens,
          -1,
        );
        assert.equal(
          f.s.teamRuntime.membersByName.get("a").lastFailure.error,
          "failure",
        );
        f.c.updateTeamMembers(f.s, []);
        assert.equal(f.s.teamRuntime.membersByName.size, 0);
      } finally {
        f.close();
      }
    },
  ],
  [
    "deferred completion waits for explicit idle even after members report completed",
    async (attach) => {
      const f = fixture(attach);
      try {
        f.c.handleTeamRuntimeUpdate(f.s, team("team_created"));
        f.c.handleTeamRuntimeUpdate(
          f.s,
          team("member_status_change", {
            members: [{ name: "a", status: "running" }],
          }),
        );
        assert.equal(f.c.shouldDeferTurnCompletion(f.s), true);
        f.c.deferTurnCompletion(f.s, "end_turn");
        f.c.handleTeamRuntimeUpdate(
          f.s,
          team("member_status_change", {
            members: [{ name: "a", status: "completed" }],
          }),
        );
        assert.equal(f.s.taskState.terminalOutcome, null);
        assert.ok(f.s.teamRuntime.deferredCompletion);
        f.c.handleTeamRuntimeUpdate(f.s, team("team_idle"));
        await f.drain();
        assert.equal(f.s.taskState.terminalOutcome, "completed");
        assert.equal(f.s.isProcessing, false);
        assert.equal(f.s.teamRuntime.lastCompletedTurnSeq, 1);
        assert.deepEqual(f.stops, ["watchdog", "flush"]);
        f.c.handleTeamRuntimeUpdate(f.s, team("team_idle"));
        assert.deepEqual(f.stops, ["watchdog", "flush"]);
      } finally {
        f.close();
      }
    },
  ],
  [
    "user cancel, stop request and failed reason preserve distinct final outcomes",
    async (attach) => {
      for (const [flag, reason, outcome] of [
        ["userCancelRequested", "failed", "completed"],
        ["stopRequested", "end_turn", "terminated"],
        ["none", " FAILED ", "failed"],
      ] as const) {
        const f = fixture(attach);
        try {
          f.s[flag] = true;
          f.c.deferTurnCompletion(f.s, reason);
          f.c.maybeFinalizeDeferredTeamCompletion(f.s);
          await f.drain();
          assert.equal(f.s.taskState.terminalOutcome, outcome);
          assert.equal(f.s.isProcessing, false);
          assert.equal(f.s.userCancelRequested, false);
          assert.equal(f.s.stopRequested, false);
        } finally {
          f.close();
        }
      }
    },
  ],
  [
    "deleted team during processing remains unsettled until idle",
    async (attach) => {
      const f = fixture(attach);
      try {
        f.c.deferTurnCompletion(f.s, "end_turn");
        f.c.handleTeamRuntimeUpdate(f.s, team("team_deleted"));
        assert.equal(f.s.teamRuntime.teamActive, false);
        assert.equal(f.s.teamRuntime.teamTrulyIdle, false);
        assert.equal(f.c.shouldDeferTurnCompletion(f.s), true);
        f.c.maybeFinalizeDeferredTeamCompletion(f.s);
        assert.equal(f.s.taskState.terminalOutcome, null);
        f.c.handleTeamRuntimeUpdate(f.s, team("team_idle"));
        assert.equal(f.s.taskState.terminalOutcome, "completed");
      } finally {
        f.close();
      }
    },
  ],
  [
    "late first team reactivates a normally completed turn but old members and cancellation forbid it",
    async (attach) => {
      for (const blocked of ["none", "members", "cancel"]) {
        const f = fixture(attach);
        try {
          f.c.applyTaskSignal(f.s, { type: "turn_completed" });
          f.s.teamRuntime.teamActive = true;
          f.c.markTurnCompletionFinalized(
            f.s,
            blocked === "cancel" ? "cancelled" : "end_turn",
          );
          f.s.isProcessing = false;
          if (blocked === "members")
            f.s.teamRuntime.membersByName.set("old", {
              name: "old",
              status: "completed",
            });
          f.c.handleTeamRuntimeUpdate(
            f.s,
            team("member_status_change", {
              members: [{ name: "late", status: "running" }],
            }),
          );
          if (blocked === "none") {
            assert.equal(f.s.taskState.terminalOutcome, null);
            assert.equal(f.s.isProcessing, true);
            assert.ok(f.s.teamRuntime.deferredCompletion);
            f.c.handleTeamRuntimeUpdate(f.s, team("team_idle"));
            assert.equal(f.s.taskState.terminalOutcome, "completed");
          } else {
            assert.equal(f.s.taskState.terminalOutcome, "completed");
            assert.equal(
              f.s.teamRuntime.membersByName.get("late").status,
              "completed",
            );
          }
        } finally {
          f.close();
        }
      }
    },
  ],
  [
    "title filtering preserves custom titles and replay timestamps",
    async (attach) => {
      const f = fixture(attach);
      try {
        for (const title of [
          " Creating Task ",
          "新建任务中",
          "(No content)",
          "/compact",
          "<image_local_path>x</image_local_path>",
        ])
          assert.equal(
            f.c.extractMeaningfulTitle({
              update: { sessionUpdate: "session_info_update", title },
            }),
            null,
          );
        f.c.handleBackendSessionUpdate(f.s, {
          update: { sessionUpdate: "session_info_update", title: " new " },
          _meta: { "codebuddy.ai": { mode: "history" } },
        });
        await f.drain();
        assert.equal(f.record.title, "new");
        assert.equal(f.record.updatedAt, 1);
        f.record = { title: "mine", customTitle: true, updatedAt: 1 };
        f.c.handleBackendSessionUpdate(f.s, {
          update: { sessionUpdate: "session_info_update", title: "other" },
        });
        await f.drain();
        assert.equal(f.record.title, "mine");
        assert.ok(f.record.updatedAt > 1);
      } finally {
        f.close();
      }
    },
  ],
  [
    "processing stop keeps awaiting-input ownership but resets cancellation flags and flushes",
    async (attach) => {
      const f = fixture(attach);
      try {
        f.s.taskState.runState = "awaiting_input";
        f.s.stopRequested = true;
        f.s.userCancelRequested = true;
        f.s.pluginRecommendationCancelRequested = true;
        await f.c.onProcessingStopped(f.s, "complete");
        assert.equal(f.s.isProcessing, true);
        assert.deepEqual(f.stops, ["flush"]);
        assert.equal(f.s.pluginRecommendationCancelRequested, false);
        f.c.onProcessingStarted(f.s);
        assert.equal(f.s.userCancelRequested, false);
      } finally {
        f.close();
      }
    },
  ],
  [
    "explicit idle overrides active-member deferral predicate but finalizer still checks members",
    async (attach) => {
      const f = fixture(attach);
      try {
        f.s.teamRuntime.teamTrulyIdle = true;
        f.s.teamRuntime.membersByName.set("a", {
          name: "a",
          status: "running",
        });
        assert.equal(f.c.shouldDeferTurnCompletion(f.s), false);
        f.c.deferTurnCompletion(f.s, "end_turn");
        f.c.maybeFinalizeDeferredTeamCompletion(f.s);
        assert.equal(f.s.taskState.terminalOutcome, null);
        f.c.settleActiveTeamMembers(f.s);
        f.c.maybeFinalizeDeferredTeamCompletion(f.s);
        assert.equal(f.s.taskState.terminalOutcome, "completed");
      } finally {
        f.close();
      }
    },
  ],
];

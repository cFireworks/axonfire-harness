import assert from "node:assert/strict";
import type { attachNativeSessionTaskState } from "../../src/sessions/native-session-task-state.js";
type Factory = typeof attachNativeSessionTaskState;
function fixture(attach: Factory) {
  const writes: any[] = [],
    telemetry: any[] = [],
    effects: Array<() => Promise<void>> = [],
    emissions: string[] = [],
    cancellations: any[] = [];
  const session: any = {
    sessionId: "owned",
    taskState: {
      sessionId: "owned",
      runState: "idle",
      executionStage: null,
      terminalOutcome: null,
      lastTransitionAt: 10,
      turnSeq: 0,
    },
    stateTransitionLog: [],
    toolResults: new Map(),
    pendingPermissionRequests: new Map(),
    pendingQuestionRequests: new Map(),
    pendingElicitationRequests: new Map(),
    pendingPluginRecommendations: new Map(),
    eventHistory: [],
  };
  let record: any = {
    sessionId: "owned",
    status: "pending",
    updatedAt: 10,
    lastActivityAt: 9,
  };
  const controller: any = {
    sessions: new Map([["owned", session]]),
    recordStore: {},
    logDiagnostic() {},
    enqueueSessionEffect(_s: any, fn: () => Promise<void>) {
      effects.push(fn);
    },
    async upsertSessionRecord(_id: string, fn: any) {
      record = fn(record);
      writes.push({ ...record });
    },
  };
  attach(controller, {
    reportTelemetry: (...args: any[]) => telemetry.push(args),
    emitSessionRecordUpsert: async (id: string) => {
      emissions.push(id);
    },
    pluginRecommendationRegistry: {
      cancelSession: (...args: any[]) => cancellations.push(args),
    },
  });
  return {
    controller,
    session,
    writes,
    telemetry,
    effects,
    emissions,
    cancellations,
    async drain() {
      while (effects.length) await effects.shift()!();
    },
    close() {
      controller.clearSidebarMetaDebounce("owned");
    },
  };
}
export const sessionTaskStateScenarios: Array<
  [string, (attach: Factory) => Promise<void>]
> = [
  [
    "ordered turn transitions persist status and terminal telemetry",
    async (attach) => {
      const f = fixture(attach);
      try {
        for (const [type, timestamp] of [
          ["turn_started", 100],
          ["working_started", 110],
          ["turn_completed", 160],
        ] as const) {
          f.controller.applyTaskSignal(f.session, { type, timestamp });
          await f.drain();
        }
        assert.deepEqual(
          f.writes.map((x) => [x.status, x.updatedAt]),
          [
            ["planning", 100],
            ["working", 110],
            ["completed", 160],
          ],
        );
        assert.equal(f.session._taskStartedAt, 100);
        assert.equal(f.session.taskState.turnSeq, 1);
        assert.equal(f.emissions.length, 3);
        assert.deepEqual(f.telemetry, [
          [
            "agent_task_completed",
            {
              mode: "LOCAL",
              task_id: "owned",
              duration_ms: 60,
              total_steps: 1,
            },
          ],
        ]);
      } finally {
        f.close();
      }
    },
  ],
  [
    "terminal transition settles all input history and only active tool results",
    async (attach) => {
      const f = fixture(attach);
      try {
        for (const k of [
          "pendingPermissionRequests",
          "pendingQuestionRequests",
          "pendingElicitationRequests",
          "pendingPluginRecommendations",
        ])
          f.session[k].set("x", {});
        f.session.eventHistory = [
          "permissionRequest",
          "questionRequest",
          "elicitationRequest",
          "pluginRecommendationRequest",
          "update",
        ].map((type) => ({ type }));
        for (const status of ["pending", "in_progress", "completed", "failed"])
          f.session.toolResults.set(status, { status, updatedAt: 1 });
        assert.equal(f.controller.hasActiveToolCall(f.session), true);
        f.controller.applyTaskSignal(f.session, {
          type: "runtime_errored",
          timestamp: 20,
        });
        assert.deepEqual(f.session.eventHistory, [{ type: "update" }]);
        for (const k of [
          "pendingPermissionRequests",
          "pendingQuestionRequests",
          "pendingElicitationRequests",
          "pendingPluginRecommendations",
        ])
          assert.equal(f.session[k].size, 0);
        assert.equal(f.controller.hasActiveToolCall(f.session), false);
        assert.equal(f.session.toolResults.get("completed").updatedAt, 1);
        assert.equal(f.cancellations.length, 1);
        const state = f.session.taskState;
        f.controller.applyTaskSignal(f.session, {
          type: "awaiting_input",
          kind: "permission",
          timestamp: 21,
        });
        assert.equal(f.session.taskState, state);
        assert.equal(f.session.hasPendingInput, true);
        f.controller.applyTaskSignal(f.session, {
          type: "input_resolved",
          timestamp: 22,
        });
        assert.equal(f.session.taskState, state);
        assert.equal(f.session.hasPendingInput, false);
      } finally {
        f.close();
      }
    },
  ],
  [
    "tool-scoped settlement matches nested permission and elicitation metadata",
    async (attach) => {
      const f = fixture(attach);
      try {
        const request = { toolCall: { toolCallId: "tool" } };
        const elicitation = {
          _meta: { "codebuddy.ai": { toolCallId: "tool" } },
        };
        f.session.pendingPermissionRequests.set("p", { request });
        f.session.pendingPermissionRequests.set("keep", {
          request: { toolCall: { toolCallId: "other" } },
        });
        f.session.pendingQuestionRequests.set("tool", {});
        f.session.pendingElicitationRequests.set("e", { request: elicitation });
        f.session.eventHistory = [
          { type: "permissionRequest", requestId: "p", request },
          { type: "elicitationRequest", request: elicitation },
          { type: "questionRequest", toolCallId: "tool" },
          { type: "permissionRequest", requestId: "keep" },
        ];
        assert.equal(
          f.controller.settleInputRequest(f.session, {
            kind: "tool",
            toolCallId: "tool",
          }),
          true,
        );
        assert.deepEqual(
          [...f.session.pendingPermissionRequests.keys()],
          ["keep"],
        );
        assert.equal(f.session.pendingQuestionRequests.size, 0);
        assert.equal(f.session.pendingElicitationRequests.size, 0);
        assert.deepEqual(f.session.eventHistory, [
          { type: "permissionRequest", requestId: "keep" },
        ]);
        assert.equal(
          f.controller.settleInputRequest(f.session, {
            kind: "tool",
            toolCallId: "tool",
          }),
          false,
        );
      } finally {
        f.close();
      }
    },
  ],
  [
    "input waits preserve execution stage and measure entry versus repeated waits",
    async (attach) => {
      const f = fixture(attach);
      try {
        f.controller.applyTaskSignal(f.session, {
          type: "turn_started",
          timestamp: 100,
        });
        f.controller.applyTaskSignal(f.session, {
          type: "awaiting_input",
          kind: "question",
          timestamp: 110,
        });
        const entered = f.session.awaitingInputStartedAt;
        assert.equal(typeof entered, "number");
        f.controller.applyTaskSignal(f.session, {
          type: "awaiting_input",
          kind: "permission",
          timestamp: 120,
        });
        assert.equal(f.session.awaitingInputStartedAt, entered);
        assert.equal(f.session.taskState.pendingInputKind, "permission");
        f.controller.applyTaskSignal(f.session, {
          type: "input_resolved",
          timestamp: 130,
        });
        assert.equal(f.session.awaitingInputStartedAt, undefined);
        assert.equal(f.session.taskState.executionStage, "planning");
        assert.equal(f.session.hasPendingInput, false);
      } finally {
        f.close();
      }
    },
  ],
  [
    "deferred persistence captures status but reads later state timestamps",
    async (attach) => {
      const f = fixture(attach);
      try {
        f.controller.applyTaskSignal(f.session, {
          type: "turn_started",
          timestamp: 100,
        });
        f.controller.applyTaskSignal(f.session, {
          type: "turn_completed",
          timestamp: 200,
        });
        await f.drain();
        assert.deepEqual(
          f.writes.map((x) => [x.status, x.updatedAt, x.lastActivityAt]),
          [
            ["planning", 200, 200],
            ["completed", 200, 200],
          ],
        );
      } finally {
        f.close();
      }
    },
  ],
  [
    "manual archive retains archive marker through runtime signals and explicit unarchive",
    async (attach) => {
      const f = fixture(attach);
      try {
        f.controller.applyExplicitTaskStatus(f.session, "archived");
        await f.drain();
        assert.ok(f.session.taskState.archivedAt);
        assert.ok(f.writes[0].archivedAt);
        f.controller.applyTaskSignal(f.session, {
          type: "turn_started",
          timestamp: 100,
        });
        assert.ok(f.session.taskState.archivedAt);
        assert.equal(f.telemetry.length, 0);
        f.controller.applyExplicitTaskStatus(f.session, "working");
        await f.drain();
        assert.equal(f.session.taskState.archivedAt, undefined);
        assert.equal(f.writes.at(-1).status, "working");
        assert.ok(
          f.writes.at(-1).archivedAt,
          "original persistence retains stored archive marker",
        );
      } finally {
        f.close();
      }
    },
  ],
  [
    "cancelled termination is completion telemetry and telemetry failure is swallowed",
    async (attach) => {
      const f = fixture(attach);
      try {
        f.controller.applyTaskSignal(f.session, {
          type: "turn_started",
          timestamp: 100,
        });
        f.controller.applyTaskSignal(f.session, {
          type: "runtime_terminated",
          reason: "cancelled",
          timestamp: 90,
        });
        assert.equal(f.telemetry[0][0], "agent_task_completed");
        assert.equal(f.telemetry[0][1].duration_ms, 0);
        assert.equal(f.session.taskState.runState, "terminated");
        f.controller.reportTelemetry = () => {
          throw Error("owned telemetry");
        };
        f.controller.applyExplicitTaskStatus(f.session, "working");
        f.controller.applyTaskSignal(f.session, {
          type: "turn_failed",
          timestamp: 150,
        });
        assert.equal(f.session.taskState.terminalOutcome, "failed");
      } finally {
        f.close();
      }
    },
  ],
  [
    "transition journal suppresses no-op phases and retains last fifty transitions",
    async (attach) => {
      const f = fixture(attach);
      try {
        f.controller.applyTaskSignal(f.session, {
          type: "unknown",
          timestamp: 20,
        });
        assert.equal(f.session.stateTransitionLog.length, 0);
        f.controller.applyTaskSignal(
          f.session,
          { type: "unknown", timestamp: 21 },
          "phase",
        );
        assert.equal(f.session.stateTransitionLog.length, 1);
        f.controller.applyTaskSignal(
          f.session,
          { type: "unknown", timestamp: 22 },
          "phase",
        );
        assert.equal(f.session.stateTransitionLog.length, 1);
        for (let i = 0; i < 60; i++)
          f.controller.applyTaskSignal(f.session, {
            type: i % 2 ? "working_started" : "planning_started",
            timestamp: 100 + i,
          });
        assert.equal(f.session.stateTransitionLog.length, 50);
        assert.equal(f.session.stateTransitionLog[0].timestamp, 110);
      } finally {
        f.close();
      }
    },
  ],
  [
    "debounced metadata is cancelled on disposal and coalesces same-status activity",
    async (attach) => {
      const f = fixture(attach);
      try {
        f.controller.applyTaskSignal(f.session, {
          type: "turn_started",
          timestamp: 100,
        });
        await f.drain();
        f.controller.applyTaskSignal(f.session, {
          type: "planning_started",
          timestamp: 110,
        });
        const first = f.controller.sidebarMetaDebounceTimers.get("owned");
        f.controller.applyTaskSignal(f.session, {
          type: "planning_started",
          timestamp: 120,
        });
        assert.notEqual(
          f.controller.sidebarMetaDebounceTimers.get("owned"),
          first,
        );
        await new Promise((r) => setTimeout(r, 2050));
        await f.drain();
        assert.equal(f.writes.at(-1).updatedAt, 120);
        assert.equal(f.writes.length, 2);
        f.controller.applyTaskSignal(f.session, {
          type: "planning_started",
          timestamp: 130,
        });
        f.controller.sessions.delete("owned");
        await new Promise((r) => setTimeout(r, 2050));
        await f.drain();
        assert.equal(f.writes.length, 2);
        assert.equal(f.controller.sidebarMetaDebounceTimers.size, 0);
      } finally {
        f.close();
      }
    },
  ],
  [
    "recommendation run switch suppresses registry cancellation without preserving requests",
    async (attach) => {
      const f = fixture(attach);
      try {
        f.controller.pluginRecommendationRunSwitches.set("owned", {});
        f.session.pendingPluginRecommendations.set("r", {});
        f.controller.applyTaskSignal(f.session, {
          type: "turn_completed",
          timestamp: 100,
        });
        assert.equal(f.cancellations.length, 0);
        assert.equal(f.session.pendingPluginRecommendations.size, 0);
      } finally {
        f.close();
      }
    },
  ],
];

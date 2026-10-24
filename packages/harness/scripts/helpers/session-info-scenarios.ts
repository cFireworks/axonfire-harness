import assert from "node:assert/strict";
import type { attachNativeSessionInfo } from "../../src/sessions/native-session-info.js";
import { attachNativeSessionReplay } from "../../src/sessions/native-session-replay.js";
import { sessionReplayFixture } from "./session-replay-scenarios.js";
type Factory = typeof attachNativeSessionInfo;
function fixture(attach: Factory) {
  const f = sessionReplayFixture(attachNativeSessionReplay);
  Object.assign(f.s, {
    createdAt: 10,
    updatedAt: 20,
    lastBackendActivityAt: 30,
    userId: "user",
    projectId: "project",
    modeEpoch: 2,
    isProcessing: false,
  });
  f.s.desiredConfig = {};
  attach(f.c);
  return f;
}
export const sessionInfoScenarios: [
  string,
  (attach: Factory) => Promise<void>,
][] = [
  [
    "info preserves timestamps and shallow config semantics while omitting undefined entries",
    async (attach) => {
      const f = fixture(attach);
      try {
        const nested = { retained: true };
        f.s.desiredConfig = {
          model: "model",
          unset: undefined,
          nested,
          explicitNull: null,
        };
        f.s.taskState.lastActivityAt = 40;
        const info = f.c.toSessionInfo(f.s);
        assert.equal(info.sessionId, "owned");
        assert.equal(info.cwd, "/owned");
        assert.equal(info.createdAt, 10);
        assert.equal(info.updatedAt, 20);
        assert.equal(info.lastActivityAt, 40);
        assert.equal(info.lastBackendActivityAt, 30);
        assert.equal(info.projectId, "project");
        assert.equal(info.modeEpoch, 2);
        assert.deepEqual(info.config, {
          model: "model",
          nested,
          explicitNull: null,
        });
        assert.notEqual(info.config, f.s.desiredConfig);
        assert.equal(info.config.nested, nested);
        info.config.model = "changed";
        assert.equal(f.s.desiredConfig.model, "model");
        f.s.lastActivityAt = 0;
        f.s.userId = "";
        f.s.desiredConfig = { unset: undefined };
        const empty = f.c.toSessionInfo(f.s);
        assert.equal(empty.lastActivityAt, 0);
        assert.equal(empty.userId, undefined);
        assert.equal(empty.config, undefined);
      } finally {
        f.close();
      }
    },
  ],
  [
    "metadata uses strict automation boolean and trimmed source then welcome mode",
    async (attach) => {
      const f = fixture(attach);
      try {
        f.s._meta = {
          "codebuddy.ai": {
            isBackgroundAutomation: true,
            sourceMode: " custom ",
            welcomeMode: "ask",
          },
        };
        assert.equal(f.c.toSessionInfo(f.s).isBackgroundAutomation, true);
        assert.equal(f.c.toSessionInfo(f.s).sourceMode, "custom");
        f.s._meta["codebuddy.ai"] = {
          isBackgroundAutomation: "true",
          sourceMode: " ",
          welcomeMode: " plan ",
        };
        assert.equal(f.c.toSessionInfo(f.s).isBackgroundAutomation, undefined);
        assert.equal(f.c.toSessionInfo(f.s).sourceMode, "plan");
        f.s._meta = { "codebuddy.ai": "invalid" };
        assert.equal(f.c.toSessionInfo(f.s).sourceMode, undefined);
      } finally {
        f.close();
      }
    },
  ],
  [
    "terminal export overrides running and pending signals but keeps active team visibility",
    async (attach) => {
      const f = fixture(attach);
      try {
        f.s.pendingQuestionRequests.set("q", { receivedAt: 5 });
        f.s.toolResults.set("t", { status: "in_progress" });
        f.s.teamRuntime.membersByName.set("m", {
          name: "m",
          status: "running",
        });
        for (const outcome of ["completed", "failed", "error", "terminated"]) {
          f.s.taskState.terminalOutcome = outcome;
          const info = f.c.toSessionInfo(f.s);
          assert.equal(info.status, outcome);
          assert.equal(info.pendingInputKind, undefined);
          assert.equal(info.hasActiveToolCalls, false);
          assert.equal(info.hasActiveTeamMembers, true);
        }
        f.s.taskState.archivedAt = 1;
        assert.equal(f.c.toSessionInfo(f.s).status, "archived");
      } finally {
        f.close();
      }
    },
  ],
  [
    "pending request recency and tie order override task-state input",
    async (attach) => {
      const f = fixture(attach);
      try {
        f.s.taskState.pendingInputKind = "permission";
        f.s.pendingPermissionRequests.set("p", { receivedAt: 10 });
        f.s.pendingQuestionRequests.set("q", { receivedAt: 10 });
        assert.equal(f.c.toSessionInfo(f.s).pendingInputKind, "question");
        f.s.pendingPluginRecommendations.set("r", { receivedAt: 10 });
        assert.equal(
          f.c.toSessionInfo(f.s).pendingInputKind,
          "plugin_recommendation",
        );
        f.s.pendingElicitationRequests.set("e", { receivedAt: 11 });
        assert.equal(f.c.toSessionInfo(f.s).pendingInputKind, "question");
        assert.equal(f.c.toSessionInfo(f.s).status, "pending");
        for (const map of [
          f.s.pendingPermissionRequests,
          f.s.pendingQuestionRequests,
          f.s.pendingPluginRecommendations,
          f.s.pendingElicitationRequests,
        ])
          map.clear();
        assert.equal(f.c.toSessionInfo(f.s).pendingInputKind, "permission");
      } finally {
        f.close();
      }
    },
  ],
  [
    "stop with deferred team completion precedes pending input and unsettled team overrides idle",
    async (attach) => {
      const f = fixture(attach);
      try {
        f.s.taskState.runState = "idle";
        f.s.teamRuntime.teamActive = true;
        assert.equal(f.c.toSessionInfo(f.s).status, "working");
        f.s.pendingPermissionRequests.set("p", { receivedAt: 1 });
        assert.equal(f.c.toSessionInfo(f.s).status, "pending");
        f.s.stopRequested = true;
        f.s.teamRuntime.deferredCompletion = { stopReason: "end_turn" };
        assert.equal(f.c.toSessionInfo(f.s).status, "terminated");
        // Exported termination does not itself make taskState terminal.
        assert.equal(f.c.toSessionInfo(f.s).pendingInputKind, "permission");
      } finally {
        f.close();
      }
    },
  ],
  [
    "team view presence and truly-idle override retain original asymmetry",
    async (attach) => {
      const f = fixture(attach);
      try {
        f.s.teamRuntime.teamActive = true;
        f.s.teamRuntime.teamName = "alone";
        assert.equal(f.c.toSessionInfo(f.s).teamRuntime, undefined);
        f.s.teamRuntime.membersByName.set("m", {
          name: "m",
          status: "running",
        });
        f.s.teamRuntime.teamTrulyIdle = true;
        const info = f.c.toSessionInfo(f.s);
        assert.equal(info.hasActiveTeamMembers, true);
        assert.equal(info.teamRuntime.hasActiveMembers, false);
        assert.equal(info.teamRuntime.isInTeam, true);
        f.s.teamRuntime.membersByName.clear();
        f.s.teamRuntime.teamActive = false;
        f.s.teamRuntime.teamTrulyIdle = undefined;
        f.s.teamRuntime.updatedAt = 0;
        assert.equal(f.c.toSessionInfo(f.s).teamRuntime.isInTeam, false);
        assert.equal(f.c.toSessionInfo(f.s).teamRuntime.updatedAt, 0);
      } finally {
        f.close();
      }
    },
  ],
  [
    "member views clone usage and failure objects and preserve explicit zero counts",
    async (attach) => {
      const f = fixture(attach);
      try {
        const m = {
          name: "m",
          status: "idle",
          color: "",
          description: "desc",
          taskId: "task",
          sessionId: "child",
          tokenUsage: { total: 3 },
          toolCallCount: 0,
          lastFailure: { message: "failure" },
        };
        f.s.teamRuntime.membersByName.set("m", m);
        const view = f.c.toSessionInfo(f.s).teamRuntime.members[0];
        assert.equal(view.color, undefined);
        assert.equal(view.toolCallCount, 0);
        assert.equal(view.sessionId, "child");
        view.tokenUsage.total = 8;
        view.lastFailure.message = "changed";
        assert.equal(m.tokenUsage.total, 3);
        assert.equal(m.lastFailure.message, "failure");
      } finally {
        f.close();
      }
    },
  ],
  [
    "view lookup clones history and hides terminal requests; active cwd and status mutations use recovered methods",
    async (attach) => {
      const f = fixture(attach);
      try {
        f.s.eventHistory = [{ update: { value: 1 } }];
        f.s.pendingQuestionRequests.set("q", {
          toolCallId: "q",
          request: { value: 1 },
        });
        const view = f.c.getSession("owned");
        view.eventHistory[0].update.value = 2;
        view.pendingQuestions[0].request.value = 2;
        assert.equal(f.s.eventHistory[0].update.value, 1);
        assert.equal(f.s.pendingQuestionRequests.get("q").request.value, 1);
        assert.equal(f.c.hasSession("owned"), true);
        assert.equal(f.c.getSession("missing"), undefined);
        f.s.taskState.terminalOutcome = "completed";
        assert.deepEqual(f.c.getSession("owned").pendingQuestions, []);
        const writes: any[] = [];
        f.c.recordStore = {};
        f.c.upsertSessionRecord = async (id: string, change: any) =>
          writes.push([id, change({ retained: true })]);
        await f.c.rememberSessionCwd("owned", " /next/../target/ ");
        assert.equal(f.s.cwd, "/target");
        assert.equal(writes[0][1].retained, true);
        assert.equal(writes[0][1].cwd, "/target");
        await f.c.rememberSessionCwd("owned", "/target");
        assert.equal(writes.length, 1);
        f.c.flushSessionEffects = async () => f.drain();
        await f.c.updateSessionStatus("owned", "RUNNING");
        assert.equal(f.s.taskState.runState, "running");
        assert.equal(f.c.toSessionInfo(f.s).status, "pending");
      } finally {
        f.close();
      }
    },
  ],
  [
    "inactive cwd persistence and stored record lookup preserve original precedence",
    async (attach) => {
      const f = fixture(attach);
      try {
        f.c.sessions.clear();
        const writes: any[] = [];
        f.c.recordStore = {
          upsertSession: async (entry: any) => writes.push(entry),
          getSession: async () => ({ id: "stored" }),
        };
        f.c.resolveStoredEntry = async () => null;
        await f.c.rememberSessionCwd("missing", "/new/");
        assert.equal(writes[0].id, "missing");
        assert.equal(writes[0].status, "pending");
        assert.equal(writes[0].cwd, "/new");
        f.c.reconcileInactiveStoredEntry = async (entry: any) => entry;
        assert.equal((await f.c.getSessionRecord("missing")).id, "stored");
        assert.equal((await f.c.getSessionRecord("missing")).type, "local");
        f.c.recordStore.getSession = async () => null;
        assert.equal(await f.c.getSessionRecord("missing"), null);
        f.c.sessions.set("owned", f.s);
        const ephemeral = await f.c.getSessionRecord("owned");
        assert.equal(ephemeral.id, "owned");
        assert.equal(ephemeral.name, "新任务");
      } finally {
        f.close();
      }
    },
  ],
];

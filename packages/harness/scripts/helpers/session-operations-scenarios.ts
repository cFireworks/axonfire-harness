import assert from "node:assert/strict";
type Attach = (controller: any, deps?: any) => any;
function fixture(attach: Attach) {
  const calls: any[] = [];
  const session: any = {
    sessionId: "owned",
    isProcessing: false,
    stopRequested: false,
    taskState: {
      runState: "running",
      executionStage: "executing",
      terminalOutcome: null,
      turnSeq: 1,
    },
    teamRuntime: { deferredCompletion: null },
    toolResults: new Map(),
    backend: {
      cancel: async (...args: any[]) => calls.push(["cancel", ...args]),
    },
  };
  const sessions = new Map([["owned", session]]);
  const controller = attach(
    {},
    {
      sessions,
      console: { warn: (...args: any[]) => calls.push(["warn", ...args]) },
      withReadySession: async (id: string, fn: any) => {
        assert.equal(id, "owned");
        calls.push(["ready"]);
        return fn(session);
      },
      prepareBackendForOperation: async (s: any, op: string) => {
        assert.equal(s, session);
        calls.push(["prepare", op]);
      },
      requestProcessingStop: (s: any) => {
        s.stopRequested = true;
        calls.push(["stop"]);
      },
      hasActiveTeamMembers: (s: any) => Boolean(s.activeTeam),
      hasActiveToolCall: (s: any) =>
        [...s.toolResults.values()].some((e: any) =>
          ["pending", "in_progress"].includes(e.status),
        ),
      applyTaskSignal: (_s: any, signal: any) => calls.push(["signal", signal]),
      markTurnCompletionFinalized: (_s: any, reason: string) =>
        calls.push(["finalized", reason]),
      flushSessionEffects: async (id: string) => calls.push(["flush", id]),
      onProcessingStopped: async (_s: any, reason: string) =>
        calls.push(["stopped", reason]),
      logDiagnostic() {},
    },
  );
  return { controller, session, sessions, calls };
}
export const sessionOperationsScenarios: Array<
  [string, (attach: Attach) => Promise<void>]
> = [
  [
    "detached user cancel finalizes stale tools and flushes completion",
    async (attach) => {
      const f = fixture(attach);
      const stale = { status: "pending", updatedAt: 1 },
        live = { status: "in_progress", updatedAt: 2 },
        complete = { status: "completed", updatedAt: 3 };
      f.session.toolResults = new Map([
        ["a", stale],
        ["b", live],
        ["c", complete],
      ]);
      assert.equal(await f.controller.cancel("owned", { token: 1 }), undefined);
      assert.equal(f.session.userCancelRequested, true);
      assert.equal(f.session.pluginRecommendationCancelRequested, false);
      assert.equal(stale.status, "failed");
      assert.equal(live.status, "failed");
      assert.ok(stale.updatedAt > 1);
      assert.equal(stale.updatedAt, live.updatedAt);
      assert.deepEqual(complete, { status: "completed", updatedAt: 3 });
      assert.deepEqual(f.calls, [
        ["ready"],
        ["stop"],
        ["cancel", { token: 1 }],
        ["signal", { type: "turn_completed", stopReason: "cancelled" }],
        ["flush", "owned"],
      ]);
    },
  ],
  [
    "active, terminal, pending-input and active-team cancels do not fabricate detached completion",
    async (attach) => {
      for (const patch of [
        { isProcessing: true },
        { activeTeam: true },
        { taskState: { runState: "awaiting_input", terminalOutcome: null } },
        { taskState: { runState: "running", terminalOutcome: "completed" } },
      ]) {
        const f = fixture(attach);
        Object.assign(f.session, patch);
        f.session.toolResults.set("t", { status: "pending" });
        await f.controller.cancel("owned", {});
        assert.deepEqual(f.calls, [["ready"], ["stop"], ["cancel", {}]]);
        assert.equal(f.session.toolResults.get("t").status, "pending");
      }
    },
  ],
  [
    "deferred team completion finalizes before effects and processing-stop callback",
    async (attach) => {
      const f = fixture(attach);
      f.session.isProcessing = true;
      f.session.activeTeam = true;
      f.session.teamRuntime.deferredCompletion = { reason: "end_turn" };
      await f.controller.cancelPluginRecommendationRun("owned", {});
      assert.equal(f.session.userCancelRequested, false);
      assert.equal(f.session.pluginRecommendationCancelRequested, true);
      assert.deepEqual(f.calls, [
        ["ready"],
        ["stop"],
        ["cancel", {}],
        [
          "signal",
          { type: "turn_completed", stopReason: "recommendation_switch" },
        ],
        ["finalized", "recommendation_switch"],
        ["flush", "owned"],
        ["stopped", "interrupted"],
      ]);
    },
  ],
  [
    "recommendation cancellation failure resets its flags; user failure preserves stop intent",
    async (attach) => {
      for (const recommendation of [false, true]) {
        const f = fixture(attach);
        f.session.backend.cancel = async () => {
          throw Error("owned cancel failure");
        };
        await assert.rejects(
          f.controller[
            recommendation ? "cancelPluginRecommendationRun" : "cancel"
          ]("owned", {}),
          /owned cancel failure/,
        );
        assert.equal(f.session.stopRequested, !recommendation);
        assert.equal(f.session.pluginRecommendationCancelRequested, false);
        assert.equal(f.session.userCancelRequested, !recommendation);
        assert.deepEqual(f.calls, [["ready"], ["stop"]]);
      }
    },
  ],
  [
    "inactive queue reads/saves return original sentinels without starting a backend",
    async (attach) => {
      const f = fixture(attach);
      f.sessions.clear();
      assert.equal(await f.controller.getMessageQueue("missing"), undefined);
      assert.equal(
        await f.controller.saveMessageQueue({
          sessionId: "missing",
          items: [],
        }),
        undefined,
      );
      assert.equal(await f.controller.getQueueState("missing"), null);
      assert.deepEqual(f.calls, []);
    },
  ],
  [
    "active queue access prepares backend and strips sessionId from save payload",
    async (attach) => {
      const f = fixture(attach);
      f.session.backend.getMessageQueue = async () => ({ items: [1] });
      f.session.backend.getQueueState = async () => ({ paused: true });
      f.session.backend.saveMessageQueue = async (data: any) => {
        f.calls.push(["save", data]);
        return "ignored";
      };
      assert.deepEqual(await f.controller.getMessageQueue("owned"), {
        items: [1],
      });
      assert.deepEqual(await f.controller.getQueueState("owned"), {
        paused: true,
      });
      assert.equal(
        await f.controller.saveMessageQueue({
          sessionId: "owned",
          version: 3,
          items: [1],
        }),
        undefined,
      );
      assert.deepEqual(f.calls, [
        ["prepare", "getMessageQueue"],
        ["prepare", "getQueueState"],
        ["prepare", "saveMessageQueue"],
        ["save", { version: 3, items: [1] }],
      ]);
    },
  ],
  [
    "queue mutations forward exact arguments through readiness",
    async (attach) => {
      for (const [method, args] of [
        ["enqueueMessage", [[{ type: "text", text: "queued" }]]],
        ["removeQueueItem", ["id"]],
        ["popQueueItemForEdit", ["id"]],
        ["reorderQueue", [["b", "a"]]],
        ["sendQueueItemNow", ["id"]],
        ["activateMessageQueue", []],
        ["pauseMessageQueue", ["error"]],
        ["resumeMessageQueue", []],
        ["cancelMessageQueue", []],
      ] as Array<[string, any[]]>) {
        const f = fixture(attach);
        const result = { method };
        f.session.backend[method] = async (...values: any[]) => {
          f.calls.push(["backend", ...values]);
          return result;
        };
        assert.equal(await f.controller[method]("owned", ...args), result);
        assert.deepEqual(f.calls, [["ready"], ["backend", ...args]]);
      }
    },
  ],
  [
    "command/subagent lookup uses explicit ID or first map entry and original empty shapes",
    async (attach) => {
      const f = fixture(attach);
      f.session.backend.getAvailableCommands = async (p: any) => ({
        commands: p,
      });
      f.session.backend.getSubagentList = async (p: any) => ({
        subagents: [p],
      });
      assert.deepEqual(await f.controller.getAvailableCommands(), {
        commands: {},
      });
      assert.deepEqual(
        await f.controller.getSubagentList({ sessionId: "owned", cwd: "x" }),
        { subagents: [{ sessionId: "owned", cwd: "x" }] },
      );
      assert.deepEqual(
        await f.controller.getAvailableCommands({ sessionId: "missing" }),
        [],
      );
      assert.deepEqual(
        await f.controller.getSubagentList({ sessionId: "missing" }),
        { subagents: [], results: [] },
      );
      assert.deepEqual(f.calls, [
        ["prepare", "getAvailableCommands"],
        ["prepare", "getSubagentList"],
      ]);
      f.sessions.clear();
      assert.equal(f.controller.resolveTargetSessionId(), null);
      assert.deepEqual(await f.controller.getAvailableCommands(), []);
    },
  ],
  [
    "yield/sampling/roots preserve return contracts and backend failures",
    async (attach) => {
      const f = fixture(attach);
      for (const method of [
        "requestYield",
        "respondToSampling",
        "respondToRoots",
      ])
        f.session.backend[method] = async (...args: any[]) => {
          f.calls.push([method, ...args]);
          return "backend result";
        };
      assert.equal(await f.controller.requestYield("owned"), true);
      assert.equal(
        await f.controller.respondToSampling("owned", { id: 1 }),
        undefined,
      );
      assert.equal(
        await f.controller.respondToRoots("owned", { roots: [] }),
        undefined,
      );
      assert.deepEqual(f.calls, [
        ["ready"],
        ["requestYield"],
        ["ready"],
        ["respondToSampling", { id: 1 }],
        ["ready"],
        ["respondToRoots", { roots: [] }],
      ]);
      f.session.backend.requestYield = async () => {
        throw Error("owned yield failure");
      };
      await assert.rejects(
        f.controller.requestYield("owned"),
        /owned yield failure/,
      );
    },
  ],
  [
    "extension calls reject unsupported backends; broadcast contains async failures but preserves synchronous throws",
    async (attach) => {
      const f = fixture(attach);
      await assert.rejects(
        f.controller.callExtMethod("owned", "m"),
        /does not support extMethod/,
      );
      f.calls.length = 0;
      f.session.backend.extMethod = async (...args: any[]) => {
        f.calls.push(["ext", ...args]);
        return { ok: true };
      };
      assert.deepEqual(await f.controller.callExtMethod("owned", "m"), {
        ok: true,
      });
      f.sessions.set("reject", {
        backend: {
          extMethod: async () => {
            throw Error("async failure");
          },
        },
      });
      f.sessions.set("unsupported", { backend: {} });
      await f.controller.broadcastExtMethod("m", { value: 1 });
      assert.deepEqual(f.calls.slice(0, 3), [
        ["ready"],
        ["ext", "m", {}],
        ["ext", "m", { value: 1 }],
      ]);
      assert.equal(f.calls.filter((v) => v[0] === "warn").length, 1);
      f.sessions.set("throw", {
        backend: {
          extMethod: () => {
            throw Error("sync failure");
          },
        },
      });
      await assert.rejects(
        f.controller.broadcastExtMethod("m"),
        /sync failure/,
      );
    },
  ],
];

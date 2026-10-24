import assert from "node:assert/strict";
import { attachNativeSessionCleanup } from "../../src/sessions/native-session-cleanup.js";
type Attach = typeof attachNativeSessionCleanup;
function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((r) => (resolve = r));
  return { promise, resolve };
}
function fixture(attach: Attach) {
  const calls: string[] = [];
  const session: any = {
    sessionId: "s",
    cwd: " /owned/a/../project/ ",
    isProcessing: false,
    ownerHistoryHydrated: true,
    eventHistory: [{ type: "owned", nested: { value: 1 } }],
    toolResults: new Map([["t", {}]]),
    pendingPermissionRequests: new Map([["p", { receivedAt: 1 }]]),
    pendingQuestionRequests: new Map(),
    pendingElicitationRequests: new Map(),
    pendingPluginRecommendations: new Map(),
    taskState: { runState: "idle" },
    teamRuntime: { membersByName: new Map(), teamActive: false },
    backend: {
      async cancel() {
        calls.push("cancel");
        session.isProcessing = false;
      },
      async destroy() {
        calls.push("destroy");
      },
    },
    noResponseWatchdog: {
      stop() {
        calls.push("watchdog");
      },
    },
  };
  const controller: any = {
    sessions: new Map([["s", session]]),
    pendingSessionRestores: new Map(),
    pendingSessionDisposals: new Map(),
    pendingSessionDeletes: new Map(),
    pendingSessionDeleteTransactions: new Map(),
    deletedSessionIds: new Set(),
    sessionLifecycleGenerations: new Map(),
    primedReplayStates: new Map(),
    runtimeSandboxOverrides: new Map(),
    sessionEffectChains: new Map(),
    bumpSessionLifecycleGeneration(id: string) {
      this.sessionLifecycleGenerations.set(
        id,
        (this.sessionLifecycleGenerations.get(id) ?? 0) + 1,
      );
      calls.push("generation");
    },
    async flushSessionEffects() {
      calls.push("flush");
    },
    async awaitPendingBackendRestart() {
      calls.push("restart");
    },
    logDiagnostic() {
      calls.push("diagnostic");
    },
    recordStore: {
      async deleteSession() {
        calls.push("record-delete");
      },
    },
  };
  attach(controller, {
    unregisterSessionDeferredBuiltinPolicy() {
      calls.push("unregister");
    },
    applyTaskSignal(_s: any, signal: any) {
      calls.push(signal.type);
    },
    onAfterDelete: async () => {
      calls.push("after-delete");
    },
    usageCacheService: {
      async purge() {
        calls.push("purge");
      },
    },
    console: {
      warn() {
        calls.push("warn");
      },
    },
  });
  return { controller, session, calls };
}
export const sessionCleanupScenarios: Array<
  [string, (attach: Attach) => Promise<void>]
> = [
  [
    "close drains in order and preserves a cloned hydrated replay without deleting storage",
    async (attach) => {
      const { controller: c, session: s, calls } = fixture(attach);
      s.isProcessing = true;
      await c.destroySession("s");
      assert.deepEqual(calls, [
        "unregister",
        "cancel",
        "flush",
        "restart",
        "watchdog",
        "destroy",
      ]);
      assert.equal(s.pendingPromptCancelCause, "session_teardown");
      assert.equal(s.stopRequested, true);
      assert.equal(c.sessions.has("s"), false);
      assert.equal(c.pendingSessionDisposals.size, 0);
      const replay = c.primedReplayStates.get("s");
      assert.equal(replay.cwd, "/owned/project");
      assert.deepEqual(replay.events, s.eventHistory);
      assert.notEqual(replay.events[0], s.eventHistory[0]);
      assert.equal(c.deletedSessionIds.has("s"), false);
    },
  ],
  [
    "disposal is single-flight and preserves a newer pending map entry",
    async (attach) => {
      const { controller: c, session: s, calls } = fixture(attach);
      const gate = deferred();
      s.backend.destroy = async () => {
        calls.push("destroy");
        await gate.promise;
      };
      const a = c.disposeActiveSession("s", s);
      const b = c.disposeActiveSession("s", s);
      await new Promise((r) => setImmediate(r));
      const newer = Promise.resolve();
      c.pendingSessionDisposals.set("s", newer);
      gate.resolve();
      await Promise.all([a, b]);
      assert.equal(calls.filter((x) => x === "destroy").length, 1);
      assert.equal(c.pendingSessionDisposals.get("s"), newer);
    },
  ],
  [
    "history generation change or newer owner prevents replay priming",
    async (attach) => {
      for (const change of ["generation", "owner", "primed", "unhydrated"]) {
        const { controller: c, session: s } = fixture(attach);
        const gate = deferred();
        s.backend.destroy = () => gate.promise;
        const pending = c.destroySession("s");
        await new Promise((r) => setImmediate(r));
        if (change === "generation") c.invalidateStoredSessionHistory("s");
        if (change === "owner") c.sessions.set("s", { newer: true });
        if (change === "primed") c.primedReplayStates.set("s", { newer: true });
        if (change === "unhydrated") s.ownerHistoryHydrated = false;
        gate.resolve();
        await pending;
        assert.deepEqual(
          c.primedReplayStates.get("s"),
          change === "primed" ? { newer: true } : undefined,
        );
      }
    },
  ],
  [
    "delete fences lifecycle and clears history and caches even when optional cleanup rejects",
    async (attach) => {
      const { controller: c, session: s, calls } = fixture(attach);
      c.runtimeSandboxOverrides.set("s", true);
      c.liveEmittedSyntheticUserPromptKeys = new Set(["s::one", "other::one"]);
      c.onAfterDelete = async () => {
        calls.push("after-delete");
        throw Error("hook");
      };
      c.recordStore.deleteSession = async () => {
        calls.push("record-delete");
        throw Error("disk");
      };
      c.usageCacheService.purge = async () => {
        calls.push("purge");
        throw Error("cache");
      };
      await c.deleteSession("s");
      assert.equal(c.deletedSessionIds.has("s"), true);
      assert.equal(c.sessionLifecycleGenerations.get("s"), 1);
      assert.equal(s.ownerHistoryHydrated, false);
      assert.deepEqual(s.eventHistory, []);
      assert.equal(s.pendingPermissionRequests.size, 0);
      assert.equal(c.runtimeSandboxOverrides.size, 0);
      assert.deepEqual(
        [...c.liveEmittedSyntheticUserPromptKeys],
        ["other::one"],
      );
      assert.equal(c.primedReplayStates.size, 0);
      assert.ok(calls.indexOf("generation") < calls.indexOf("destroy"));
      assert.ok(calls.indexOf("destroy") < calls.indexOf("record-delete"));
      assert.ok(calls.includes("input_resolved"));
      assert.equal(c.pendingSessionDeletes.size, 0);
    },
  ],
  [
    "duplicate delete shares promise and cleanup does not remove a newer deletion",
    async (attach) => {
      const { controller: c } = fixture(attach);
      const gate = deferred();
      c.onAfterDelete = () => gate.promise;
      const a = c.deleteSession("s");
      assert.equal(c.deleteSession("s"), a);
      await new Promise((r) => setImmediate(r));
      const newer = Promise.resolve();
      c.pendingSessionDeletes.set("s", newer);
      gate.resolve();
      await a;
      assert.equal(c.pendingSessionDeletes.get("s"), newer);
    },
  ],
  [
    "business delete lifecycle can abort and shares a transaction through afterDelete",
    async (attach) => {
      const { controller: c, calls } = fixture(attach);
      assert.equal(
        await c.deleteSessionWithLifecycle("s", {
          beforeDelete: async () => "cancelled",
          abortDelete: async () => calls.push("abort"),
        }),
        "cancelled",
      );
      assert.equal(c.sessions.has("s"), true);
      assert.deepEqual(calls, ["abort"]);
      const gate = deferred();
      const first = c.deleteSessionWithLifecycle("s", {
        afterDelete: () => gate.promise,
      });
      assert.equal(c.deleteSessionWithLifecycle("s", {}), first);
      await new Promise((r) => setImmediate(r));
      assert.equal(c.pendingSessionDeleteTransactions.size, 1);
      gate.resolve();
      assert.equal(await first, "deleted");
      assert.equal(c.pendingSessionDeleteTransactions.size, 0);
    },
  ],
  [
    "precommit failure aborts while postcommit failure logs and keeps deleted result",
    async (attach) => {
      const { controller: c, calls } = fixture(attach);
      await assert.rejects(
        c.deleteSessionWithLifecycle("s", {
          beforeDelete: async () => {
            throw Error("before");
          },
          abortDelete: async () => calls.push("abort"),
        }),
        /before/,
      );
      assert.equal(c.sessions.has("s"), true);
      assert.ok(calls.includes("abort"));
      assert.equal(
        await c.deleteSessionWithLifecycle("s", {
          afterDelete: async () => {
            throw Error("after");
          },
          abortDelete: async () => calls.push("unexpected-abort"),
        }),
        "deleted",
      );
      assert.ok(calls.includes("diagnostic"));
      assert.equal(calls.includes("unexpected-abort"), false);
    },
  ],
  [
    "destroy waits for an in-flight restore and closes its resulting session",
    async (attach) => {
      const { controller: c, session: s, calls } = fixture(attach);
      c.sessions.clear();
      const gate = deferred();
      c.pendingSessionRestores.set("s", {
        promise: gate.promise.then(() => c.sessions.set("s", s)),
      });
      const pending = c.destroySession("s");
      gate.resolve();
      await pending;
      assert.equal(c.sessions.size, 0);
      assert.ok(calls.includes("destroy"));
    },
  ],
  [
    "cancel/effect/restart/destroy errors preserve original best-effort cleanup",
    async (attach) => {
      const { controller: c, session: s, calls } = fixture(attach);
      c.cancelBeforeDestroy = async () => {
        throw Error("cancel");
      };
      c.flushSessionEffects = async () => {
        throw Error("flush");
      };
      c.awaitPendingBackendRestart = async () => {
        throw Error("restart");
      };
      s.backend.destroy = async () => {
        calls.push("destroy");
        throw Error("destroy");
      };
      await c.destroySession("s");
      assert.equal(calls.filter((x) => x === "warn").length, 3);
      assert.ok(c.primedReplayStates.has("s"));
      assert.equal(c.pendingSessionDisposals.size, 0);
    },
  ],
  [
    "watchdog failure rejects disposal after removal and still clears its pending slot",
    async (attach) => {
      const { controller: c, session: s, calls } = fixture(attach);
      s.noResponseWatchdog.stop = () => {
        throw Error("watchdog");
      };
      await assert.rejects(c.destroySession("s"), /watchdog/);
      assert.equal(c.sessions.size, 0);
      assert.equal(c.pendingSessionDisposals.size, 0);
      assert.equal(calls.includes("destroy"), false);
      assert.equal(c.primedReplayStates.size, 0);
    },
  ],
  [
    "destroyAll releases recommendation barriers and timers then clears retained state",
    async (attach) => {
      const { controller: c, calls } = fixture(attach);
      c.pluginRecommendationContinuationBarriers.set("s", {
        release: () => calls.push("release"),
      });
      c.pluginRecommendationRegistry = {
        cancelAll: () => calls.push("cancel-all"),
        cancelSession: () => calls.push("cancel-session"),
      };
      c.userPromptComposer = { cleanup: () => calls.push("composer") };
      c.runtimeReclaimJanitorTimer = setInterval(() => {}, 60000);
      c.sidebarMetaDebounceTimers.set(
        "s",
        setTimeout(() => {}, 60000),
      );
      c.runtimeReclaimEligibleSince.set("s", 1);
      await c.destroyAll();
      assert.equal(c.runtimeReclaimJanitorTimer, undefined);
      assert.equal(c.sidebarMetaDebounceTimers.size, 0);
      assert.equal(c.primedReplayStates.size, 0);
      assert.equal(c.runtimeReclaimEligibleSince.size, 0);
      assert.equal(calls[0], "cancel-all");
      assert.ok(calls.includes("release"));
      assert.equal(calls.at(-1), "composer");
    },
  ],
  [
    "delete protection includes pending input and active teammates but is a separate predicate",
    async (attach) => {
      const { controller: c, session: s } = fixture(attach);
      assert.equal(c.shouldProtectSessionFromDelete(s), true);
      s.pendingPermissionRequests.clear();
      assert.equal(c.shouldProtectSessionFromDelete(s), false);
      s.teamRuntime.membersByName.set("member", { status: " Running " });
      assert.equal(c.shouldProtectSessionFromDelete(s), true);
      s.teamRuntime.teamTrulyIdle = true;
      assert.equal(c.shouldProtectSessionFromDelete(s), false);
      s.taskState.runState = "awaiting_input";
      assert.equal(c.shouldProtectSessionFromDelete(s), true);
      await c.deleteSession("s");
      assert.equal(
        c.sessions.size,
        0,
        "delete itself does not consult the protection predicate",
      );
    },
  ],
];

import assert from "node:assert/strict";
import type { createNativeSessionLoadRpc } from "../../src/sessions/native-session-load-rpc.js";
type Factory = typeof createNativeSessionLoadRpc;
function deferred() {
  let resolve!: (x?: any) => void;
  const promise = new Promise<any>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}
function fixture(factory: Factory) {
  const timers: { fn: () => void; ms: number }[] = [],
    pushes: any[] = [],
    calls: any[] = [];
  const runtime = factory({
    setTimeout: (fn: () => void, ms: number) => {
      timers.push({ fn, ms });
      return timers.length;
    },
  });
  const state: any = {
    generation: 0,
    owner: undefined,
    record: { id: "s", cwd: "/stored", status: "completed" },
    stored: { replayed: false, complete: false },
  };
  const manager: any = {
    getHistoryStoreGeneration: () => state.generation,
    getSession: () => state.owner,
    getSessionRecord: async () => state.record,
    replayStoredSessionHistory: () => state.stored,
    hasSession: () => !!state.owner,
    rememberSessionCwd: async (...args: any[]) => calls.push(["cwd", ...args]),
    replayActivePendingInputs: (...args: any[]) =>
      calls.push(["inputs", ...args]),
    replaceSessionReplay: async (...args: any[]) =>
      calls.push(["replace", ...args]),
    primeSessionReplay: async (...args: any[]) =>
      calls.push(["prime", ...args]),
    updateSessionStatus: async (...args: any[]) =>
      calls.push(["status", ...args]),
  };
  const deps: any = {
    sessionManager: manager,
    requestSessionReplay: async () => ({ events: [] }),
    scheduleRuntimeSweep: () => calls.push(["sweep"]),
    replayingSessions: new Set(["s"]),
    recordMainLoadTime: (id: string) => calls.push(["time", id]),
  };
  let load: any;
  runtime.registerWorkbuddySessionLoadHandler(
    {
      handle: (channel: string, fn: any) => {
        assert.equal(channel, runtime.SESSION_RPC_CHANNELS.LOAD);
        load = fn;
      },
      push: (channel: string, payload: any) => pushes.push([channel, payload]),
    },
    deps,
  );
  return { state, manager, deps, timers, pushes, calls, load, runtime };
}
const event = (kind: string, text: string): any => ({
  type: "sessionUpdate",
  sessionId: "s",
  update: {
    sessionUpdate: kind + "_message_chunk",
    content: { type: "text", text },
  },
});
export const sessionLoadRpcScenarios: [
  string,
  (factory: Factory) => Promise<void>,
][] = [
  [
    "validates identity and reuses stored replay without HTTP",
    async (factory) => {
      const f = fixture(factory);
      await assert.rejects(f.load(" "), /Session ID is required/);
      f.state.stored = { replayed: true, complete: false };
      f.state.owner = {
        sessionId: "s",
        cwd: " /active/../owner/ ",
        status: "Running",
        projectId: "project",
      };
      f.deps.requestSessionReplay = async () => {
        throw Error("must not fetch");
      };
      f.deps.projectResources = {
        registerSessionFromRecord: (...x: any[]) =>
          f.calls.push(["project", ...x]),
      };
      const result = await f.load("s", {
        forceRendererHistoryReplay: true,
        requestId: " request ",
      });
      assert.equal(result.cwd, "/owner");
      assert.equal(result.status, "working");
      assert.equal(result.loaded, true);
      assert.equal(result.rendererHistoryReplayComplete, false);
      assert.ok(f.calls.some((x) => x[0] === "inputs"));
      assert.ok(f.calls.some((x) => x[0] === "project"));
      assert.equal(f.calls[0][1], "request");
      assert.equal(f.timers.length, 0);
    },
  ],
  [
    "same generation/cwd/force deduplicates pending HTTP despite different request IDs",
    async (factory) => {
      const f = fixture(factory),
        gate = deferred();
      let requests = 0;
      f.deps.requestSessionReplay = async () => {
        requests++;
        return gate.promise;
      };
      const one = f.load("s", { cwd: "/a/../b/", requestId: "one" });
      const two = f.load("s", { cwd: "/b", requestId: "two" });
      await Promise.resolve();
      assert.equal(requests, 1);
      gate.resolve({ events: [] });
      assert.deepEqual(await one, await two);
      assert.equal(f.calls.filter((x) => x[0] === "prime").length, 1);
    },
  ],
  [
    "new session aborts superseded replay and permits replacement load",
    async (factory) => {
      const f = fixture(factory),
        entered = deferred();
      f.deps.requestSessionReplay = (id: string, { signal }: any) => {
        if (id === "next") return Promise.resolve({ events: [] });
        entered.resolve();
        return new Promise((_r, reject) =>
          signal.addEventListener("abort", () => reject(signal.reason), {
            once: true,
          }),
        );
      };
      const old = f.load("s");
      const rejected = assert.rejects(old, { name: "AbortError" });
      await entered.promise;
      assert.equal((await f.load("next")).sessionId, "next");
      await rejected;
      assert.equal(f.calls.filter((x) => x[0] === "prime").length, 1);
    },
  ],
  [
    "generation change rejects stale HTTP completion before owner mutation",
    async (factory) => {
      const f = fixture(factory),
        gate = deferred(),
        entered = deferred();
      f.deps.requestSessionReplay = async () => {
        entered.resolve();
        return gate.promise;
      };
      const pending = f.load("s");
      await entered.promise;
      f.state.generation++;
      gate.resolve({ events: [event("user", "stale")] });
      await assert.rejects(pending, /generation changed/);
      assert.equal(f.calls.filter((x) => x[0] === "prime").length, 0);
      assert.equal(f.pushes.length, 0);
    },
  ],
  [
    "truncated replay trims to first user, separates owner hydration and renderer extensions",
    async (factory) => {
      const f = fixture(factory);
      const replay = {
        events: [
          event("agent", "cut"),
          event("user", "start"),
          { type: "extNotification", sessionId: "s", method: "owned" },
          event("agent", "answer"),
        ],
        historyInfo: { truncated: true, limit: 5 },
        replayTiming: { serverMs: 1 },
      };
      f.deps.requestSessionReplay = async (_id: string, options: any) => {
        assert.equal(options.cwd, "/requested");
        return replay;
      };
      const result = await f.load("s", { cwd: "/requested" });
      assert.equal(result.cwd, "/stored");
      assert.equal(replay.events.length, 3);
      const primed = f.calls.find((x) => x[0] === "prime");
      assert.equal(primed[2].length, 2);
      assert.equal(primed[4], 0);
      assert.equal(f.pushes[0][1].type, "historyInfo");
      assert.equal(f.pushes.length, 4);
      assert.ok(
        f.pushes
          .slice(1)
          .every(
            (x) => x[1]._meta["codebuddy.ai/rendererHistoryReplay"] === true,
          ),
      );
      assert.equal(f.deps.replayingSessions.has("s"), false);
      assert.equal(result.replayTiming.events, 3);
      assert.equal(f.timers[0]!.ms, 500);
      f.timers[0]!.fn();
      assert.equal(f.pushes.at(-1)[1].response.stopReason, "end_turn");
    },
  ],
  [
    "active owner replaces replay and lifecycle hook may consume renderer events",
    async (factory) => {
      const f = fixture(factory);
      f.state.owner = {
        status: "working",
        isProcessing: true,
        eventHistory: [],
      };
      f.deps.requestSessionReplay = async () => ({
        events: [event("user", "start")],
      });
      f.deps.replayLifecycle = (_channel: any, payload: any) => {
        assert.equal(payload._meta["codebuddy.ai/rendererHistoryReplay"], true);
        return true;
      };
      await f.load("s");
      assert.equal(f.calls.filter((x) => x[0] === "replace").length, 1);
      assert.equal(f.pushes.length, 0);
      assert.equal(f.timers.length, 0);
    },
  ],
  [
    "ordinary replay failure returns incomplete snapshot while missing automation replay propagates",
    async (factory) => {
      const f = fixture(factory);
      f.deps.requestSessionReplay = async () => {
        throw Error("not found");
      };
      assert.deepEqual(await f.load("s", { cwd: "/fallback" }), {
        sessionId: "s",
        loaded: true,
        rendererHistoryReplayComplete: false,
      });
      assert.equal(f.calls.find((x) => x[0] === "cwd")[2], "/fallback");
      f.state.record.isBackgroundAutomation = true;
      await assert.rejects(f.load("s"), /not found/);
      f.state.record.isBackgroundAutomation = false;
      await assert.rejects(
        f.load("s", { cwd: "/tmp/workbuddy-server-automation-owned" }),
        /not found/,
      );
    },
  ],
  [
    "delayed synthetic completion skips changed history and newly processing owner",
    async (factory) => {
      for (const change of ["history", "processing", "none"]) {
        const f = fixture(factory);
        f.state.owner = {
          status: "terminated",
          isProcessing: false,
          eventHistory: [],
        };
        await f.load("s");
        assert.equal(f.timers.length, 1);
        if (change === "history") f.state.owner.eventHistory.push({});
        if (change === "processing") f.state.owner.isProcessing = true;
        f.timers[0]!.fn();
        assert.equal(f.pushes.length, change === "none" ? 1 : 0);
        if (change === "none")
          assert.equal(f.pushes[0][1].response.stopReason, "cancelled");
      }
    },
  ],
  [
    "renderer failure still clears replay marker after owner hydration",
    async (factory) => {
      const f = fixture(factory);
      f.deps.requestSessionReplay = async () => ({
        events: [event("user", "start")],
      });
      f.deps.replayLifecycle = () => {
        throw Error("renderer failure");
      };
      await assert.rejects(f.load("s"), /renderer failure/);
      assert.equal(f.calls.filter((x) => x[0] === "prime").length, 1);
      assert.equal(f.deps.replayingSessions.has("s"), false);
      assert.equal(f.timers.length, 0);
    },
  ],
];

import { processLifecycleFixture } from "./process-lifecycle-scenarios.js";
import assert from "node:assert/strict";
import { createNativeTelemetryExit } from "../../src/runtime/native-telemetry-exit.js";
export function telemetryExitFixture(
  factory = createNativeTelemetryExit,
  patch: any = {},
) {
  const calls: any[] = [],
    timers = new Map<any, any>(),
    metrics = Symbol("metrics"),
    trace = Symbol("trace");
  let now = 1000;
  const runtime = {
    Date: { now: () => now },
    setTimeout: (fn: any, ms: number) => {
      const h = { unref: () => calls.push(["unref", ms]) };
      timers.set(h, { fn, ms });
      return h;
    },
    clearTimeout: (h: any) => timers.delete(h),
    modules: {
      80699: {
        ContainerUtil: {
          get: (token: any) => {
            if (patch.missing) throw Error("missing");
            return token === metrics
              ? {
                  flushOnly: async (ms: number) => {
                    calls.push(["flush", ms]);
                    now += patch.advance ?? 0;
                    if (patch.fail) throw Error("owned");
                    await patch.pending;
                  },
                  flushAndShutdown: async (ms: number) => {
                    calls.push(["shutdown", ms]);
                    if (patch.fail) throw Error("owned");
                    await patch.pending;
                  },
                }
              : {
                  forceFlush: async () => {
                    calls.push(["trace"]);
                    if (patch.fail) throw Error("owned");
                    await patch.pending;
                  },
                };
          },
        },
      },
      92735: { TraceService: trace },
      8395: { AgentMetricsAggregator: metrics },
    },
  };
  return { n: factory(runtime), runtime, calls, timers };
}
export const TELEMETRY_EXIT_CASES: {
  name: string;
  run(factory: typeof createNativeTelemetryExit): Promise<any>;
}[] = [
  {
    name: "flush applies 80 percent remaining budget and trace runs concurrently",
    async run(factory) {
      const f = telemetryExitFixture(factory, { advance: 100 });
      await f.n.flushTelemetryBeforeExit(1000);
      assert.deepEqual(
        f.calls.filter((x) => x[0] !== "unref"),
        [["flush", 800], ["trace"]],
      );
      assert.ok(f.calls.some((x) => x[0] === "unref" && x[1] === 900));
      assert.equal(f.timers.size, 0);
      return f.calls;
    },
  },
  {
    name: "flush is repeatable but shutdown caches the exact promise",
    async run(factory) {
      const f = telemetryExitFixture(factory);
      await f.n.flushTelemetryBeforeExit();
      await f.n.flushTelemetryBeforeExit();
      const p = f.n.shutdownTelemetryBeforeExit(300),
        q = f.n.shutdownTelemetryBeforeExit(900);
      assert.equal(p, q);
      await p;
      assert.equal(f.calls.filter((x) => x[0] === "shutdown").length, 1);
      assert.equal(f.calls.filter((x) => x[0] === "flush").length, 2);
      assert.equal(f.timers.size, 0);
      return f.calls;
    },
  },
  {
    name: "nonpositive first shutdown caches no-op until original reset hook",
    async run(factory) {
      const f = telemetryExitFixture(factory);
      await f.n.flushTelemetryBeforeExit(0);
      await f.n.shutdownTelemetryBeforeExit(0);
      await f.n.shutdownTelemetryBeforeExit(500);
      assert.equal(f.calls.length, 0);
      f.n._resetFlushPromiseForTest();
      await f.n.shutdownTelemetryBeforeExit(500);
      assert.equal(f.calls[0][0], "shutdown");
      return f.calls;
    },
  },
  {
    name: "service lookup and flush failures are swallowed and timers cleared",
    async run(factory) {
      const out = [];
      for (const patch of [{ missing: true }, { fail: true }]) {
        const f = telemetryExitFixture(factory, patch);
        await f.n.flushTelemetryBeforeExit();
        await f.n.shutdownTelemetryBeforeExit();
        assert.equal(f.timers.size, 0);
        out.push(f.calls);
      }
      return out;
    },
  },
  {
    name: "timeout resolves without cancelling pending operations",
    async run(factory) {
      let release: any;
      const pending = new Promise<void>((r) => (release = r)),
        f = telemetryExitFixture(factory, { pending });
      const p = f.n.flushTelemetryBeforeExit(20);
      assert.equal(f.calls.filter((x) => x[0] === "unref").length, 2);
      for (const [h, t] of f.timers) {
        f.timers.delete(h);
        t.fn();
      }
      await p;
      release();
      await Promise.resolve();
      await Promise.resolve();
      return f.calls;
    },
  },
];

TELEMETRY_EXIT_CASES.push({
  name: "original process exit calls actual telemetry helper at both shutdown stages",
  async run(factory) {
    const t = telemetryExitFixture(factory),
      f = processLifecycleFixture(undefined, { telemetry: t.n });
    await f.api.exit("clear");
    assert.deepEqual(
      t.calls.filter((c) => c[0] !== "unref"),
      [["flush", 1200], ["trace"], ["shutdown", 1200], ["trace"]],
    );
    assert.equal(f.calls.filter((c) => c[0] === "session.end").length, 1);
    assert.equal(f.calls.at(-1)[0], "safe.exit");
    assert.equal(t.timers.size, 0);
    assert.equal(f.timeouts.size, 0);
    return { root: f.calls, telemetry: t.calls };
  },
});

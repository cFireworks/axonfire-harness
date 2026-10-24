import assert from "node:assert/strict";
import { createNativeAgentMetrics } from "../../src/runtime/native-agent-metrics.js";
import { telemetryExitFixture } from "./telemetry-exit-scenarios.js";
export function agentMetricsFixture(
  factory = createNativeAgentMetrics,
  patch: any = {},
) {
  const events: any[] = [],
    warnings: any[] = [],
    registrations: any[] = [],
    timers = new Map<any, any>();
  const decorate =
    (kind: string) =>
    (...args: any[]) =>
    (target: any, key: any) => {
      registrations.push([
        kind,
        args.map((a) => (typeof a === "symbol" ? a.description : a)),
        key,
      ]);
    };
  const runtime = {
    Date: { now: () => 1000 },
    setInterval: (fn: any, ms: number) => {
      const h = { unref: () => events.push(["unref", ms]) };
      timers.set(h, { fn, ms });
      return h;
    },
    clearInterval: (h: any) => timers.delete(h),
    modules: {
      80699: {
        Autowired: decorate("Autowired"),
        Component: decorate("Component"),
        ApplicationLifecycle: Symbol("ApplicationLifecycle"),
      },
      92735: { Logger: Symbol("Logger") },
      40602: { GalileoService: Symbol("GalileoService") },
    },
  };
  const native = factory(runtime),
    galileo = Object.fromEntries(
      ["logInfo", "addCounter", "recordDuration", "forceFlush", "shutdown"].map(
        (k) => [
          k,
          (...a: any[]) => {
            events.push([k, ...a]);
            if (patch.fail === k) throw Error("owned failure");
          },
        ],
      ),
    ),
    metrics: any = Object.assign(new native.AgentMetricsAggregatorImpl(), {
      galileo,
      logger: { warn: (s: any) => warnings.push(s) },
    });
  return { native, metrics, events, warnings, timers, registrations };
}
export const AGENT_METRICS_CASES: {
  name: string;
  run(factory: typeof createNativeAgentMetrics): Promise<any>;
}[] = [
  {
    name: "original metrics window emits request/tool/task/token totals and resets",
    async run(factory) {
      const f = agentMetricsFixture(factory),
        m = f.metrics;
      m.recordRequestResult(
        0,
        undefined,
        "model",
        undefined,
        undefined,
        "Model",
      );
      m.recordRequestResult(429, "RATE", "model", "failure", "r1", "Model");
      m.recordToolCallsGenerated(2);
      m.recordToolResult("Read", true);
      m.recordToolResult(
        "Read",
        false,
        "DENIED",
        "blocked",
        "call",
        "server",
        "403",
      );
      m.recordTokenUsage(20, 5, 10, "model", undefined, "Model");
      m.recordCacheRate(10, 20);
      m.recordTaskOutcome("SUCCESS", { scene: "chat", agentName: "owned" });
      m.flush();
      assert.equal(m.window.requestTotal, 0);
      assert.equal(m.window.tokenByModel.size, 0);
      assert.ok(
        f.events.some((e) => e[1] === "agent.cache_rate_pct" && e[2] === 50),
      );
      assert.ok(
        f.events.some(
          (e) => e[1] === "agent.tool_callback_rate_pct" && e[2] === 100,
        ),
      );
      assert.ok(
        f.events.some(
          (e) => e[1] === "agent.tool.total" && e[3].mcp_server === "server",
        ),
      );
      const count = f.events.length;
      m.flush();
      assert.equal(f.events.length, count);
      return f.events;
    },
  },
  {
    name: "cache and generated-call counters alone do not trigger original flush guard",
    async run(factory) {
      const f = agentMetricsFixture(factory),
        m = f.metrics;
      m.recordCacheRate(5, 10);
      m.recordToolCallsGenerated(2);
      m.flush();
      assert.equal(f.events.length, 0);
      assert.equal(m.window.cacheTokensTotal, 5);
      m.recordRequestResult(0);
      m.flush();
      assert.equal(m.window.cacheTokensTotal, 0);
      assert.ok(
        f.events.some((e) => e[1] === "agent.cache_rate_pct" && e[2] === 50),
      );
      return f.events;
    },
  },
  {
    name: "periodic lifecycle is unrefed and shutdown only flushes final window when timer exists",
    async run(factory) {
      const a = agentMetricsFixture(factory);
      a.metrics.recordRequestResult(0);
      await a.metrics.flushAndShutdown(50);
      assert.equal(a.metrics.window.requestTotal, 1);
      assert.deepEqual(a.events, [["shutdown", 50]]);
      const f = agentMetricsFixture(factory);
      f.metrics.onStart();
      assert.equal([...f.timers.values()][0].ms, 30000);
      f.metrics.recordRequestResult(0);
      await f.metrics.flushAndShutdown(80);
      assert.equal(f.timers.size, 0);
      assert.equal(f.metrics.window.requestTotal, 0);
      assert.equal(f.events.at(-1)[0], "shutdown");
      return {
        notStarted: a.events,
        started: f.events,
        registrations: f.registrations,
      };
    },
  },
  {
    name: "flush failures discard the window but export errors warn without rejecting exit",
    async run(factory) {
      const out = [];
      for (const fail of ["addCounter", "forceFlush", "shutdown"]) {
        const f = agentMetricsFixture(factory, { fail });
        f.metrics.onStart();
        f.metrics.recordRequestResult(0);
        await f.metrics.flushOnly(100);
        await f.metrics.flushAndShutdown(100);
        assert.equal(f.metrics.window.requestTotal, 0);
        assert.ok(f.warnings.length > 0);
        assert.equal(f.timers.size, 0);
        out.push({ events: f.events, warnings: f.warnings });
      }
      return out;
    },
  },
  {
    name: "error details truncate at original 500 code units and outcome tags use last model",
    async run(factory) {
      const f = agentMetricsFixture(factory),
        m = f.metrics;
      m.recordRequestResult(1, undefined, "m", "x".repeat(501), "r", "M");
      m.recordToolResult("Bash", false, undefined, "y".repeat(501));
      m.recordTaskOutcome("CANCELLED");
      m.recordTaskOutcome("UNKNOWN");
      assert.equal(f.events[0][2].error_message.length, 500);
      assert.equal(f.events[1][2].error_message.length, 500);
      assert.equal(f.events[2][2].model, "m");
      assert.equal(f.events[2][2].failure_category, "cancelled");
      assert.equal(m.resolveTaskFailureCategory("not-known"), undefined);
      return f.events;
    },
  },
  {
    name: "actual metrics aggregator participates in both original telemetry exit stages",
    async run(factory) {
      const f = agentMetricsFixture(factory),
        t = telemetryExitFixture();
      const prior = t.runtime.modules[80699].ContainerUtil.get;
      t.runtime.modules[80699].ContainerUtil.get = (token: any) =>
        token === t.runtime.modules[8395].AgentMetricsAggregator
          ? f.metrics
          : prior(token);
      f.metrics.onStart();
      f.metrics.recordRequestResult(0);
      await t.n.flushTelemetryBeforeExit(1000);
      f.metrics.recordRequestResult(0);
      await t.n.shutdownTelemetryBeforeExit(500);
      assert.ok(f.events.some((e) => e[0] === "forceFlush" && e[1] === 800));
      assert.ok(f.events.some((e) => e[0] === "shutdown" && e[1] === 400));
      assert.equal(f.timers.size, 0);
      assert.equal(t.timers.size, 0);
      return { events: f.events, trace: t.calls };
    },
  },
];

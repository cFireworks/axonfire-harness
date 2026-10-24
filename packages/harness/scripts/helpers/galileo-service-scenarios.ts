import assert from "node:assert/strict";
import { createNativeGalileoService } from "../../src/runtime/native-galileo-service.js";
export function galileoServiceFixture(
  factory = createNativeGalileoService,
  patch: any = {},
) {
  const events: any[] = [],
    warnings: any[] = [],
    env: any = { ...patch.env };
  let change: any;
  const config: any = {
    enabled: true,
    canExportOtlp: true,
    fingerprint: "one",
    issues: [],
    endpoint: "https://owned.invalid",
    metricsUrl: "https://owned.invalid/m",
    tracesUrl: "https://owned.invalid/t",
    logsUrl: "https://owned.invalid/l",
    app: "owned",
    server: "test",
    ...patch.config,
  };
  const provider = (name: string) => ({
    forceFlush: async () => {
      events.push([name, "flush"]);
      if (patch.fail === name) throw Error("owned failure");
    },
    shutdown: async () => {
      events.push([name, "shutdown"]);
    },
  });
  const meterProvider = provider("meter"),
    traceProvider = provider("trace"),
    logProvider = provider("log");
  const span = {
    setAttributes: (a: any) => events.push(["attrs", a]),
    addEvent: (a: any) => events.push(["event", a]),
    end: () => events.push(["end"]),
  };
  const meter = {
    createHistogram: (name: string, options: any) => {
      events.push(["histogram", name, options]);
      return { record: (...a: any[]) => events.push(["record", ...a]) };
    },
    createCounter: (name: string, options: any) => {
      events.push(["counter", name, options]);
      return { add: (...a: any[]) => events.push(["add", ...a]) };
    },
  };
  const noop =
    () =>
    (..._args: any[]) => {};
  const http = {
    request: (...args: any[]) => {
      events.push(["request", ...args]);
      return "owned";
    },
  };
  const runtime: any = {
    process: {
      env,
      pid: 42,
      platform: "owned",
      arch: "arm64",
      version: "v-test",
    },
    SetupGalileo: async (a: any) => events.push(["setup", a]),
    Logger: class {
      logger = { _loggerProvider: logProvider };
      constructor(a: any) {
        events.push(["logger", a]);
      }
      info(...a: any[]) {
        events.push(["info", ...a]);
      }
      error(...a: any[]) {
        events.push(["error", ...a]);
      }
    },
    modules: {
      40602: { GalileoService: Symbol("GalileoService") },
      48161: {
        cpus: () => [{ model: "owned cpu" }],
        release: () => "test",
        totalmem: () => 8 * 1024 ** 3,
      },
      80699: {
        Autowired: noop,
        Optional: noop,
        Component: noop,
        ApplicationLifecycle: Symbol("ApplicationLifecycle"),
      },
      86482: { AuthenticationManager: Symbol("AuthenticationManager") },
      9151: {
        ProductManager: Symbol("ProductManager"),
        ClientInfoProvider: Symbol("ClientInfoProvider"),
        resolveGalileoConfig: () => ({ ...config }),
      },
      92735: {
        Logger: Symbol("Logger"),
        TracerProvider: Symbol("TracerProvider"),
      },
      23258: {
        trace: {
          getTracer: () => ({
            startSpan: (name: string) => {
              events.push(["startSpan", name]);
              return span;
            },
          }),
          getTracerProvider: () => ({ getDelegate: () => traceProvider }),
        },
      },
      37366: {
        metrics: {
          getMeter: () => meter,
          getMeterProvider: () => meterProvider,
        },
      },
      11447: { ValueType: { DOUBLE: 1, INT: 0 } },
      15183: { NamespaceValues: { Development: "dev", Production: "prod" } },
      64007: {
        HttpsProxyAgent: class {
          constructor(
            public url: string,
            public options: any,
          ) {}
        },
      },
      44708: http,
    },
  };
  const native = factory(runtime),
    service: any = Object.assign(new native.GalileoServiceImpl(), {
      logger: {
        warn: (s: any) => warnings.push(s),
        info: (s: any) => events.push(["diagnostic", s]),
      },
      productManager: {
        waitConfiguration: async () => ({ galileo: { patchName: "patch" } }),
        onDidChange: (fn: any) => {
          change = fn;
          return { dispose: () => events.push(["dispose"]) };
        },
      },
      clientInfoProvider: { get: async () => ({ productVersion: "1.2" }) },
      authenticationManager: {
        currentSessionSubject: {
          subscribe: (fn: any) => {
            fn({ account: { uid: "owned-uid" } });
            return { unsubscribe: () => events.push(["unsubscribe"]) };
          },
        },
      },
      tracerProvider: {
        attachPrimaryProcessorToGlobalProvider: async () =>
          events.push(["attach"]),
      },
    });
  return {
    native,
    service,
    events,
    warnings,
    env,
    config,
    http,
    runtime,
    change: () => change?.(),
  };
}
export const GALILEO_SERVICE_CASES: {
  name: string;
  run(factory: typeof createNativeGalileoService): Promise<any>;
}[] = [
  {
    name: "explicit disable and invalid configuration skip SDK setup",
    async run(factory) {
      const a = galileoServiceFixture(factory, {
        env: { DISABLE_GALILEO: "0" },
      });
      a.service.initialize();
      await a.service.waitReady();
      assert.equal(a.env.GALILEO_ENABLE, "false");
      assert.equal(a.events.length, 0);
      const b = galileoServiceFixture(factory, {
        config: { canExportOtlp: false, issues: ["invalid"] },
      });
      b.service.initialize();
      await b.service.waitReady();
      assert.equal(b.service.isReady(), false);
      assert.equal(b.events.length, 0);
      return [a.env, b.env, b.warnings];
    },
  },
  {
    name: "original setup captures providers, identity dimensions and instrument caches",
    async run(factory) {
      const f = galileoServiceFixture(factory);
      f.service.initialize();
      await f.service.waitReady();
      assert.equal(f.service.isReady(), true);
      assert.equal(f.env.GALILEO_SDK_READY, "1");
      f.service.recordDuration("duration", 2, { uid: "override" });
      f.service.recordDuration("duration", 3);
      f.service.addCounter("count", 0);
      f.service.addCounter("count", 2);
      f.service.addCounter("count", 3);
      f.service.logError("error", { nil: null, n: 2 });
      assert.equal(f.events.filter((e) => e[0] === "histogram").length, 1);
      assert.equal(f.events.filter((e) => e[0] === "counter").length, 1);
      assert.equal(f.events.find((e) => e[0] === "record")[2].uid, "owned-uid");
      assert.equal(f.events.find((e) => e[0] === "error")[2].nil, "");
      f.service.onStop();
      assert.deepEqual(f.events.slice(-3), [
        ["unsubscribe"],
        ["dispose"],
        ["end"],
      ]);
      return [f.events, f.env];
    },
  },
  {
    name: "flush catches provider failure and shutdown flushes all before closing once",
    async run(factory) {
      const f = galileoServiceFixture(factory, { fail: "meter" });
      f.service.initialize();
      await f.service.waitReady();
      f.events.length = 0;
      await f.service.forceFlush();
      await f.service.shutdown();
      await f.service.shutdown();
      assert.equal(f.service.isReady(), false);
      assert.equal(f.events.filter((e) => e[1] === "shutdown").length, 3);
      assert.deepEqual(f.events.slice(-6), [
        ["meter", "flush"],
        ["trace", "flush"],
        ["log", "flush"],
        ["meter", "shutdown"],
        ["trace", "shutdown"],
        ["log", "shutdown"],
      ]);
      assert.equal(f.warnings.length, 2);
      return [f.events, f.warnings];
    },
  },
  {
    name: "configuration fingerprint change shuts down and rebuilds only valid routes",
    async run(factory) {
      const f = galileoServiceFixture(factory);
      f.service.initialize();
      await f.service.waitReady();
      await f.service.handleProductConfigurationChanged();
      assert.equal(f.events.filter((e) => e[0] === "setup").length, 1);
      f.config.fingerprint = "two";
      await f.service.handleProductConfigurationChanged();
      assert.equal(f.events.filter((e) => e[0] === "setup").length, 2);
      f.config.fingerprint = "three";
      f.config.enabled = false;
      await f.service.handleProductConfigurationChanged();
      assert.equal(f.env.GALILEO_ENABLE, "false");
      assert.equal(f.service.isReady(), false);
      f.service.onStop();
      f.config.fingerprint = "four";
      await f.service.handleProductConfigurationChanged();
      assert.equal(f.service.galileoFingerprint, "three");
      return [f.events, f.env, f.warnings];
    },
  },
  {
    name: "HTTPS proxy rewrite matches only captured collector hostname and patches once",
    async run(factory) {
      const f = galileoServiceFixture(factory, {
        env: { HTTPS_PROXY: "http://owned-proxy.invalid" },
      });
      f.service.patchOtlpHttpProxyAgent("owned.invalid");
      f.http.request("https://owned.invalid/v1/traces");
      f.http.request({ hostname: "owned.invalid", path: "/m" });
      f.http.request("https://other.invalid");
      f.service.patchOtlpHttpProxyAgent("other.invalid");
      const requests = f.events.filter((e) => e[0] === "request");
      assert.equal(requests[0][2].agent.url, "http://owned-proxy.invalid");
      assert.equal(requests[1][1].agent.url, "http://owned-proxy.invalid");
      assert.equal(requests[2].length, 2);
      assert.equal(
        f.native.isGalileoOtlpRequest("not a url", "owned.invalid"),
        false,
      );
      return JSON.parse(JSON.stringify(f.events));
    },
  },
  {
    name: "timeout resolves without cancellation and no-budget flush still invokes providers",
    async run(factory) {
      const f = galileoServiceFixture(factory);
      f.service.initialize();
      await f.service.waitReady();
      let callback: any,
        unrefs = 0,
        clears = 0;
      f.runtime.setTimeout = undefined;
      const g = galileoServiceFixture(factory);
      g.runtime.setTimeout = (fn: any) => {
        callback = fn;
        return { unref: () => unrefs++ };
      };
      g.runtime.clearTimeout = () => clears++;
      const native = factory(g.runtime),
        service: any = new native.GalileoServiceImpl();
      let resolve: any;
      const pending = new Promise((r) => (resolve = r)),
        wait = service.withTimeout(pending, 1, "owned");
      callback();
      await wait;
      resolve(7);
      await Promise.resolve();
      assert.equal(unrefs, 1);
      assert.equal(clears, 1);
      f.events.length = 0;
      await f.service.forceFlush(0);
      assert.equal(f.events.filter((e) => e[1] === "flush").length, 3);
      return [f.events, unrefs, clears];
    },
  },
];

import { agentMetricsFixture } from "./agent-metrics-scenarios.js";
import { telemetryExitFixture } from "./telemetry-exit-scenarios.js";
import { tracingFixture } from "./tracing-scenarios.js";
GALILEO_SERVICE_CASES.push({
  name: "actual Galileo, metrics and TraceService participate in both exit stages",
  async run(factory) {
    const f = galileoServiceFixture(factory),
      m = agentMetricsFixture(),
      t = telemetryExitFixture(),
      tr = tracingFixture(undefined, { config: { galileo: { enable: true } } });
    f.service.initialize();
    await f.service.waitReady();
    await tr.service.init();
    m.metrics.galileo = f.service;
    m.metrics.onStart();
    m.metrics.recordRequestResult(0);
    const original = t.runtime.modules[80699].ContainerUtil.get;
    t.runtime.modules[80699].ContainerUtil.get = (token: any) =>
      token === t.runtime.modules[8395].AgentMetricsAggregator
        ? m.metrics
        : token === t.runtime.modules[92735].TraceService
          ? tr.service
          : original(token);
    await t.n.flushTelemetryBeforeExit(1000);
    m.metrics.recordRequestResult(0);
    await t.n.shutdownTelemetryBeforeExit(500);
    assert.equal(f.service.isReady(), false);
    assert.equal(m.timers.size, 0);
    assert.equal(t.timers.size, 0);
    assert.equal(f.events.filter((e) => e[1] === "shutdown").length, 3);
    assert.deepEqual(tr.calls, [["global.flush"], ["global.flush"]]);
    assert.ok(f.events.some((e) => e[0] === "counter"));
    return { galileo: f.events, trace: tr.calls };
  },
});

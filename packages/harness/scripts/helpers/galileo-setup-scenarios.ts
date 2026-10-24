import assert from "node:assert/strict";
import * as http from "node:http";
import { gunzipSync } from "node:zlib";
import { once } from "node:events";
import { basicTracerFixture } from "./basic-tracer-scenarios.js";
import { galileoMetricFixture } from "./galileo-metric-exporter-scenarios.js";
import { createNativeMetricReader } from "../../src/runtime/native-metric-reader.js";
import { createNativeMeterProvider } from "../../src/runtime/native-meter-provider.js";
import { createNativeGalileoMeters } from "../../src/runtime/native-galileo-meters.js";
import { createNativeGalileoSelfMonitor } from "../../src/runtime/native-galileo-self-monitor.js";
import { createNativeGalileoSetup } from "../../src/runtime/native-galileo-setup.js";
export function galileoSetupFixture(
  factory: typeof createNativeGalileoSetup,
  endpoint = "http://127.0.0.1:1/owned",
  configModule?: any,
) {
  const f = basicTracerFixture(),
    m = galileoMetricFixture(),
    events: any[] = [],
    instruments: any[] = [],
    owned: any[] = [],
    messages: any[] = [];
  const sdk = {
      ...f.exporters.sdk,
      TRACE_COLLECTOR_ADDR: endpoint,
      METRICS_COLLECTOR_ADDR: endpoint,
      LOG_COLLECTOR_ADDR: endpoint,
      OCP_ADDR: endpoint,
    },
    enums = f.exporters.getModule(15183);
  const readers: any = createNativeMetricReader({
    metrics: m.n,
    diag: f.context.diag,
    internal: f.context.internal,
    exportResult: f.galileo.getModule(36275),
    modules: { 2339: { diag: f.context.diag } },
  });
  const providers: any = createNativeMeterProvider({
    readers,
    metrics: m.n,
    serializers: f.runtime.serializers,
    resources: f.resources,
    diag: f.context.diag,
    modules: { 33835: f.context.getModule(33835) },
  });
  const shared = {
    readers,
    metrics: m.n,
    providers,
    resources: f.resources,
    enums,
    sdk,
  };
  const meters = createNativeGalileoMeters({
      ...shared,
      getModule: (id: number) =>
        id === 36182 ? providers.getModule(id) : f.context.getModule(id),
    }),
    self = createNativeGalileoSelfMonitor(shared);
  class Instrument {
    config: any;
    tracer: any;
    meter: any;
    constructor(config: any) {
      this.config = config;
      instruments.push(this);
    }
    setTracerProvider(p: any) {
      this.tracer = p;
      events.push("tracer");
    }
    setMeterProvider(p: any) {
      this.meter = p;
      events.push("meter");
    }
    setLoggerProvider(p: any) {
      events.push("logger");
    }
    getConfig() {
      return { enabled: false };
    }
    enable() {
      events.push("enable");
    }
    disable() {
      events.push("disable");
    }
  }
  const modules: any = {
    86097: {
      Config: class {
        constructor(o: any) {
          events.push("config");
        }
        async startPull() {
          events.push("pull");
        }
        getMetricsConfig() {
          return [];
        }
        getData() {
          return [{ key: "owned_header", values: ["yes"] }];
        }
      },
    },
    9808: { HttpInstrumentation: Instrument },
    8009: { FetchInstrumentation: Instrument },
    3057: {
      TrpcClientInstrumentation: Instrument,
      TrpcServerInstrumentation: Instrument,
    },
  };
  if (configModule) modules[86097] = configModule;
  f.context.context.disable();
  const n: any = factory({
    registry: {},
    resources: f.resources,
    enums,
    sdk,
    trace: f.n.trace,
    metrics: meters.metrics,
    profilerSupport: {
      NODE_VERSION_SUPPORTED: false,
      MIN_NODE_VERSION: "18.0.0",
    },
    process: {
      env: { HOST_IP: "10.0.0.1", POD_NAME: "app.bj" },
      platform: "darwin",
      versions: { node: "23.9.0" },
    },
    console: Object.fromEntries(
      ["log", "warn", "error"].map((k) => [
        k,
        (...args: any[]) => messages.push([k, ...args]),
      ]),
    ),
    transport: f.runtime.transport,
    getSelfMeterProvider: (...a: any[]) => {
      const p = self.getSelfMeterProvider(a[0], a[1], a[2], a[3]);
      owned.push(p);
      events.push("self");
      return p;
    },
    registerTracerProvider: (a: any) => {
      const p = f.galileo.registerTracerProvider(a);
      owned.push(p);
      events.push("trace");
      return p;
    },
    registerMeterProvider: (a: any) => {
      const p = meters.registerMeterProvider(a);
      owned.push(p);
      events.push("business");
      return p;
    },
    getModule: (id: number) => modules[id] ?? f.galileo.getModule(id),
  });
  return {
    ...f,
    n,
    meters,
    instrumentationModules: modules,
    sdk,
    enums,
    events,
    instruments,
    owned,
    messages,
    async close() {
      await Promise.all(owned.map((p) => p.shutdown()));
      n.logs.disable();
      meters.metrics.disable();
      f.n.trace.disable();
      f.n.propagation.disable();
      f.context.context.disable();
    },
  };
}
const base = {
  app: "owned",
  server: "server",
  platform: "local",
  namespace: "test",
  enableHTTP: true,
  enableTRPC: false,
  enableFetch: true,
  isEncrypted: false,
};
export const GALILEO_SETUP_CASES: {
  name: string;
  run(factory: typeof createNativeGalileoSetup): Promise<any>;
}[] = [
  {
    name: "SetupGalileo validates original flags and profiling config and preserves machine/header helpers",
    async run(factory) {
      const f = galileoSetupFixture(factory);
      try {
        const invalid = [
          null,
          [],
          {},
          { ...base, enableHTTP: false, enableTRPC: false },
          { ...base, filter: [] },
          { ...base, profiling: { enable: "yes" } },
          { ...base, profiling: { exporter: { timeoutMs: 0 } } },
        ];
        for (const v of invalid) {
          assert.equal(f.n.checkConfigValid(v), false);
          assert.equal(await f.n.SetupGalileo(v), undefined);
        }
        assert.equal(f.owned.length, 0);
        assert.equal(f.n.checkConfigValid(base), true);
        assert.deepEqual(f.n.getMachineInfo(), {
          hostIP: "10.0.0.1",
          container: "app.bj",
        });
        assert.equal(
          f.n.deriveProfilesAddr("https://a.sg.tgalileo.com/traces"),
          f.sdk.PROFILE_COLLECTOR_SG_ADDR,
        );
        const filtered = f.n.filterUserExtFields({
          [f.sdk.RESERVED_USER_EXT_FIELDS[0]]: "yes",
          other: "omit",
        });
        assert.deepEqual(Object.values(filtered), ["yes"]);
        const emitted: any[] = [];
        const early = f.n.logs.getLogger("early");
        early.emit({ body: "ignored" });
        f.n.logs.setGlobalLoggerProvider({
          getLogger: () => ({ emit: (r: any) => emitted.push(r.body) }),
        });
        early.emit({ body: "active" });
        assert.deepEqual(emitted, ["active"]);
        return { messages: f.messages, filtered, emitted };
      } finally {
        await f.close();
      }
    },
  },
  {
    name: "SetupGalileo initializes actual trace and metric providers and wires instrument hooks before real HTTP exports",
    async run(factory) {
      const packets: any[] = [];
      const server = http.createServer(async (req, res) => {
        const chunks = [];
        for await (const c of req) chunks.push(c);
        let data = Buffer.concat(chunks);
        if (req.headers["content-encoding"] === "gzip") data = gunzipSync(data);
        packets.push(JSON.parse(data.toString()));
        res.end("{}");
      });
      server.listen(0, "127.0.0.1");
      await once(server, "listening");
      const f = galileoSetupFixture(
        factory,
        `http://127.0.0.1:${(server.address() as any).port}/otlp`,
      );
      try {
        assert.equal(
          await f.n.SetupGalileo({
            ...base,
            traceConfig: {
              enable: true,
              processor: {
                enableTraceBody: false,
                sampler: { fraction: 1, enableParentSample: true },
              },
            },
            startIncomingSpan: () => ({ custom: "incoming" }),
            filterIncomingRequest: (r: any) => r.ignore,
          }),
          undefined,
        );
        assert.deepEqual(f.events.slice(0, 5), [
          "config",
          "pull",
          "self",
          "trace",
          "business",
        ]);
        assert.equal(f.instruments.length, 2);
        assert.ok(
          f.instruments.every(
            (i) => i.tracer === f.owned[1] && i.meter === f.owned[2],
          ),
        );
        const cfg = f.instruments[0].config;
        assert.equal(
          cfg.startIncomingSpanHook({ headers: { owned_header: "yes" } })
            .custom,
          "incoming",
        );
        assert.equal(
          cfg.startIncomingSpanHook({ headers: { owned_header: "yes" } })
            .owned_header,
          "yes",
        );
        assert.equal(cfg.ignoreIncomingRequestHook({ ignore: true }), true);
        assert.equal(
          cfg.ignoreOutgoingRequestHook({ hostname: "127.0.0.1" }),
          true,
        );
        const trace = f.instruments[0].tracer.getTracer("setup");
        const span = trace.startSpan("setup-span", { startTime: [1, 0] });
        cfg.applyCustomAttributesOnSpan(span);
        span.end([2, 0]);
        f.meters.metrics
          .getMeter("setup")
          .createCounter(f.enums.ClientServerMetrics.ClientStartedTotal, {
            valueType: 0,
          })
          .add(3, { owned: "yes" });
        await Promise.all(f.owned.map((p) => p.forceFlush()));
        const names = packets.flatMap((p) =>
          (p.resourceSpans ?? []).flatMap((r: any) =>
            r.scopeSpans.flatMap((s: any) => s.spans.map((x: any) => x.name)),
          ),
        );
        const metrics = packets.flatMap((p) =>
          (p.resourceMetrics ?? []).flatMap((r: any) =>
            r.scopeMetrics.flatMap((s: any) =>
              s.metrics.map((m: any) => ({
                name: m.name,
                values: m.sum.dataPoints.map((d: any) =>
                  Number(d.asInt ?? d.asDouble),
                ),
              })),
            ),
          ),
        );
        assert.deepEqual(names, ["setup-span"]);
        assert.deepEqual(metrics, [
          { name: f.enums.ClientServerMetrics.ClientStartedTotal, values: [3] },
        ]);
        return { events: f.events, names, metrics };
      } finally {
        await f.close();
        server.close();
        await once(server, "close");
      }
    },
  },
  {
    name: "SetupGalileo retains original failure when remote configuration is disabled",
    async run(factory) {
      const f = galileoSetupFixture(factory);
      try {
        await assert.rejects(
          f.n.SetupGalileo({ ...base, enableRemoteConfig: false }),
          /getMetricsConfig/,
        );
        assert.deepEqual(f.events, ["self", "trace"]);
        return f.events;
      } finally {
        await f.close();
      }
    },
  },
];

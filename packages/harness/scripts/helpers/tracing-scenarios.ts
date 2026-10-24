import assert from "node:assert/strict";
import { createNativeTracing } from "../../src/runtime/native-tracing.js";
export function tracingFixture(factory = createNativeTracing, patch: any = {}) {
  const calls: any[] = [],
    logs: any[] = [],
    registrations: any[] = [];
  let count = 0;
  const span = (id = count) => ({
    spanContext: () => ({
      traceId: "trace" + id,
      spanId: "span" + id,
      traceFlags: 1,
    }),
    setStatus: (x: any) => calls.push(["status", x]),
    end: (x: any) => calls.push(["end", x]),
    setAttributes: (x: any) => calls.push(["attributes", x]),
    addEvent: (...x: any[]) => calls.push(["event", ...x]),
    recordException: (...x: any[]) => calls.push(["exception", ...x]),
  });
  const tracer = {
    startSpan: (name: any, opts: any, ctx: any) => {
      count++;
      calls.push(["span", name, opts, ctx]);
      return span();
    },
  };
  const globalProvider = {
    forceFlush: async () => calls.push(["global.flush"]),
    shutdown: async () => calls.push(["global.shutdown"]),
  };
  const decorator =
    (kind: string) =>
    (...args: any[]) =>
    (target: any, key: any) => {
      registrations.push([
        kind,
        args.map((x) => (typeof x === "symbol" ? x.description : x)),
        key,
      ]);
    };
  class Provider {
    constructor(options: any) {
      calls.push([
        "provider",
        {
          resource: { attributes: { ...options.resource.attributes } },
          idGenerator: {
            trace: typeof options.idGenerator.generateTraceId,
            span: typeof options.idGenerator.generateSpanId,
          },
          spanProcessors: options.spanProcessors.map((p: any) => ({
            label: p.exporter.label,
            options: p.exporter.delegate.options,
          })),
        },
      ]);
    }
    register() {
      calls.push(["register"]);
    }
    getTracer(...args: any[]) {
      calls.push(["tracer", ...args]);
      return tracer;
    }
    async forceFlush() {
      calls.push(["provider.flush"]);
    }
    async shutdown() {
      calls.push(["provider.shutdown"]);
    }
  }
  class Exporter {
    constructor(public options?: any) {
      calls.push(["exporter", options]);
    }
  }
  const runtime = {
    process: { env: patch.env ?? {} },
    Date: { now: () => 1000 },
    setTimeout: (fn: any) => {
      queueMicrotask(fn);
      return {};
    },
    modules: {
      80699: {
        Autowired: decorator("Autowired"),
        AutowiredProvider: decorator("Provider"),
        Optional: decorator("Optional"),
        Component: decorator("Component"),
        Logger: Symbol("Logger"),
      },
      9151: { ProductManager: Symbol("ProductManager") },
      47763: {
        TraceFlags: { SAMPLED: 1 },
        SpanKind: { CLIENT: 2 },
        SpanStatusCode: { UNSET: 0, OK: 1, ERROR: 2 },
        ROOT_CONTEXT: "root",
        context: { active: () => "active" },
        trace: {
          setSpanContext: (ctx: any, s: any) => ({ ctx, s }),
          setSpan: (ctx: any, s: any) => ({ ctx, parent: s.spanContext() }),
          getTracer: () => tracer,
          getTracerProvider: () => ({ getDelegate: () => globalProvider }),
        },
      },
      51147: { TRACE_ID_HEADER: "x-owned-trace" },
      13896: { OTLPTraceExporter: Exporter },
      85081: {
        Resource: class {
          constructor(public attributes: any) {}
        },
      },
      89752: {
        BasicTracerProvider: Provider,
        BatchSpanProcessor: class {
          constructor(public exporter: any) {}
        },
        ConsoleSpanExporter: Exporter,
        RandomIdGenerator: class {
          generateTraceId() {
            return "random-trace";
          }
          generateSpanId() {
            return "random-span";
          }
        },
      },
    },
  };
  const native = factory(runtime),
    logger = Object.fromEntries(
      ["info", "warn", "error", "setContext"].map((k) => [
        k,
        (...args: any[]) => logs.push([k, ...args]),
      ]),
    ),
    provider: any = Object.assign(new native.TracerProviderImpl(), {
      logger,
      productManager: { waitConfiguration: async () => patch.config ?? {} },
      resourcesProviders: {
        get: () => [{ provide: async () => ({ owned: "resource" }) }],
      },
    }),
    service: any = Object.assign(new native.TraceServiceImpl(), {
      tracerProvider: provider,
    });
  return {
    native,
    provider,
    service,
    runtime,
    calls,
    logs,
    registrations,
    tracer,
  };
}
export const TRACING_CASES: {
  name: string;
  run(factory: typeof createNativeTracing): Promise<any>;
}[] = [
  {
    name: "disabled tracing creates empty spans and provider init installs nothing",
    async run(factory) {
      const f = tracingFixture(factory);
      await f.service.init();
      const span = f.service.startTrace("owned");
      assert.deepEqual(span.requestHeaders, {});
      assert.equal(span.traceId, "");
      assert.equal(f.calls.length, 0);
      await f.service.shutdown();
      return { calls: f.calls, logs: f.logs, registrations: f.registrations };
    },
  },
  {
    name: "standalone provider resolves endpoint headers resources and restarts in original order",
    async run(factory) {
      const f = tracingFixture(factory, {
        env: {
          OTEL_EXPORTER_OTLP_ENDPOINT: "http://owned.invalid/",
          OTEL_EXPORTER_OTLP_HEADERS: "env=one",
          OTEL_RESOURCE_ATTRIBUTES: "owned=override",
        },
        config: {
          endpoint: "http://product.invalid",
          telemetry: {
            tracing: { enabled: true, headers: { product: "two" } },
          },
        },
      });
      await f.service.init({ serviceName: "owned-service" });
      assert.equal(f.calls[0][1].url, "http://owned.invalid/v1/traces");
      assert.deepEqual(f.calls[0][1].headers, {
        Connection: "keep-alive",
        product: "two",
        env: "one",
      });
      assert.equal(f.calls[1][1].resource.attributes.owned, "override");
      await f.service.restart({ serviceName: "second" });
      assert.ok(f.calls.some((c) => c[0] === "provider.shutdown"));
      return { calls: f.calls, logs: f.logs };
    },
  },
  {
    name: "Galileo global provider flushes delegate but never shuts it down",
    async run(factory) {
      const f = tracingFixture(factory, {
        config: { galileo: { enable: true } },
      });
      await f.service.init();
      assert.equal(f.provider.useGlobalProvider, true);
      await f.service.shutdown();
      assert.deepEqual(f.calls, [["global.flush"]]);
      assert.equal(f.provider.provider, undefined);
      return { calls: f.calls, logs: f.logs };
    },
  },
  {
    name: "trace cache reuses root span and preserves original FIFO duplicate-id eviction",
    async run(factory) {
      const f = tracingFixture(factory);
      f.provider.tracer = f.tracer;
      const a = f.service.startTrace("first", "owned");
      assert.equal(f.service.startTrace("again", "trace1"), a);
      for (let i = 0; i < 101; i++)
        f.service.setTrace("duplicate", { span: a });
      assert.equal(f.service.getTrace("duplicate"), undefined);
      assert.equal(f.service.traceList.length, 100);
      return {
        calls: f.calls,
        size: f.service.traces.size,
        list: f.service.traceList,
      };
    },
  },
  {
    name: "root and child spans preserve option precedence, remote parent headers and statuses",
    async run(factory) {
      const f = tracingFixture(factory);
      f.provider.tracer = f.tracer;
      const root = f.service.startTrace(
        "root",
        "fixed",
        { kind: 9, startTime: 0 },
        "parent",
      );
      assert.equal(f.calls[0][2].kind, 2);
      assert.equal(f.calls[0][2].startTime, 1000);
      assert.equal(root.requestHeaders["X-B3-ParentSpanId"], "parent");
      const child = root.startSpan("child", { kind: 9 });
      assert.equal(f.calls[1][2].kind, 9);
      child.markAsFailed("owned", 10);
      root.markAsSuccessful(20);
      assert.equal(f.provider.idGenerator.generateTraceId(), "fixed");
      assert.equal(f.provider.idGenerator.generateTraceId(), "random-trace");
      return { calls: f.calls, headers: root.requestHeaders };
    },
  },
  {
    name: "environment helpers retain precedence, unsupported warnings and percent decoding",
    async run(factory) {
      const f = tracingFixture(factory),
        env = f.native.getModule(63984);
      const parsed = env.readOtelTraceEnv({
        CODEBUDDY_CODE_ENABLE_TELEMETRY: "false",
        CLAUDE_CODE_ENABLE_TELEMETRY: "true",
        OTEL_TRACES_EXPORTER: "unknown",
        OTEL_EXPORTER_OTLP_ENDPOINT: "http://owned/",
        OTEL_EXPORTER_OTLP_TRACES_HEADERS: "a=x%20y,b=%ZZ,a=last",
        OTEL_EXPORTER_OTLP_PROTOCOL: "grpc",
      });
      assert.equal(parsed.enabledByEnv, false);
      assert.equal(parsed.endpoint, "http://owned/v1/traces");
      assert.deepEqual(parsed.headers, { a: "last", b: "%ZZ" });
      assert.equal(parsed.warnings.length, 2);
      assert.equal(
        env.readGalileoViewSpanEnabled({
          GALILEO_SDK_READY: "1",
          DISABLE_TELEMETRY: "0",
        }),
        false,
      );
      return parsed;
    },
  },
  {
    name: "logging exporter forwards result and delegates optional flush and shutdown",
    async run(factory) {
      const f = tracingFixture(factory),
        events: any[] = [];
      const wrapped = new (f.native.getModule(86504).LoggingSpanExporter)(
        {
          export: (spans: any, cb: any) => cb({ code: 0 }),
          shutdown: async () => events.push("shutdown"),
        },
        { info: (s: any) => events.push(s), error: (s: any) => events.push(s) },
        "owned",
      );
      wrapped.export(
        [
          { spanContext: () => ({ traceId: "a" }) },
          { spanContext: () => ({ traceId: "a" }) },
        ],
        (r: any) => events.push(r),
      );
      await wrapped.forceFlush();
      await wrapped.shutdown();
      assert.match(events[0], /Exported 2 spans, traceIds: a/);
      return events;
    },
  },
];

import { telemetryExitFixture } from "./telemetry-exit-scenarios.js";
TRACING_CASES.push({
  name: "actual TraceService joins both telemetry exit flush stages without shutting shared provider",
  async run(factory) {
    const f = tracingFixture(factory, {
        config: { galileo: { enable: true } },
      }),
      t = telemetryExitFixture();
    await f.service.init();
    const prior = t.runtime.modules[80699].ContainerUtil.get;
    t.runtime.modules[80699].ContainerUtil.get = (token: any) =>
      token === t.runtime.modules[92735].TraceService
        ? f.service
        : prior(token);
    await t.n.flushTelemetryBeforeExit(1000);
    await t.n.shutdownTelemetryBeforeExit(500);
    assert.deepEqual(f.calls, [["global.flush"], ["global.flush"]]);
    assert.equal(t.timers.size, 0);
    return { calls: f.calls, telemetry: t.calls };
  },
});

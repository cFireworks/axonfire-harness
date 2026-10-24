import assert from "node:assert/strict";
import * as http from "node:http";
import { once } from "node:events";
import { galileoExporterFixture } from "./galileo-exporters-scenarios.js";
import { exportContextFixture } from "./export-context-scenarios.js";
import { createNativeOtelEnvironment } from "../../src/runtime/native-otel-environment.js";
import { createNativeOtelResource } from "../../src/runtime/native-otel-resource.js";
import { createNativeLoggerProvider } from "../../src/runtime/native-logger-provider.js";
export function loggerProviderFixture(
  factory: typeof createNativeLoggerProvider = createNativeLoggerProvider,
) {
  const f = galileoExporterFixture(),
    context = exportContextFixture().n,
    environment = createNativeOtelEnvironment({ process: { env: {} } }),
    resources = createNativeOtelResource({
      process: { argv0: "owned-node" },
      diag: context.diag,
    });
  context.context.setGlobalContextManager(
    new context.AsyncLocalStorageContextManager().enable(),
  );
  const n: any = factory({
    serializers: f.runtime.serializers,
    context,
    environment,
    resources,
    diag: context.diag,
    getModule: (id: number) =>
      id === 55733
        ? environment.getModule(id)
        : id === 2339
          ? { diag: context.diag }
          : context.getModule(id),
  });
  return { ...f, n, exporters: f.n, context, resources };
}
const record = (body: string) => ({
  body,
  severityText: "INFO",
  severityNumber: 9,
  timestamp: [1, 2],
  observedTimestamp: [1, 3],
  attributes: { owned: "yes" },
});
export const LOGGER_PROVIDER_CASES: {
  name: string;
  run(factory: typeof createNativeLoggerProvider): Promise<any>;
}[] = [
  {
    name: "actual logger creates readonly records with scope limits and trace context",
    async run(factory) {
      const f = loggerProviderFixture(factory),
        p = new f.n.LoggerProvider({
          logRecordLimits: {
            attributeCountLimit: 2,
            attributeValueLengthLimit: 3,
          },
        }),
        captured: any[] = [];
      p.addLogRecordProcessor({
        onEmit: (r: any) => captured.push(r),
        forceFlush: async () => {},
        shutdown: async () => {},
      });
      try {
        const logger = p.getLogger("owned", "1", { schemaUrl: "owned:schema" });
        assert.equal(
          p.getLogger("owned", "1", { schemaUrl: "owned:schema" }),
          logger,
        );
        const span = {
            traceId: "0123456789abcdef0123456789abcdef",
            spanId: "0123456789abcdef",
            traceFlags: 1,
          },
          ctx = f.n.trace.setSpanContext(f.context.ROOT_CONTEXT, span);
        f.context.context.with(ctx, () =>
          logger.emit({
            ...record("owned"),
            attributes: { first: "abcdef", second: 2, third: "drop" },
          }),
        );
        const r = captured[0];
        assert.deepEqual(r.attributes, { first: "abc", second: 2 });
        assert.equal(r.droppedAttributesCount, 1);
        assert.equal(r.spanContext.traceId, span.traceId);
        r.setAttribute("later", "no");
        assert.equal(r.attributes.later, undefined);
        return {
          attributes: r.attributes,
          dropped: r.droppedAttributesCount,
          span: r.spanContext,
          scope: r.instrumentationScope,
          time: r.hrTime,
        };
      } finally {
        await p.shutdown();
        f.context.context.disable();
      }
    },
  },
  {
    name: "batch processor flushes actual log records and shutdown is singleflight",
    async run(factory) {
      const f = loggerProviderFixture(factory),
        calls: any[] = [],
        e = {
          export: (records: any[], cb: any) => {
            calls.push(["export", records.map((r) => r.body)]);
            cb({ code: 0 });
          },
          shutdown: async () => calls.push(["shutdown"]),
        },
        batch = new f.n.BatchLogRecordProcessor(e, {
          scheduledDelayMillis: 60000,
          maxExportBatchSize: 2,
          maxQueueSize: 10,
        }),
        p = new f.n.LoggerProvider();
      p.addLogRecordProcessor(batch);
      try {
        const l = p.getLogger("owned");
        l.emit(record("one"));
        l.emit(record("two"));
        l.emit(record("three"));
        await p.forceFlush();
        await Promise.all([p.shutdown(), p.shutdown()]);
        assert.equal(calls.filter((c) => c[0] === "shutdown").length, 1);
        assert.deepEqual(
          calls.filter((c) => c[0] === "export").flatMap((c) => c[1]),
          ["one", "two", "three"],
        );
        assert.equal(p.getLogger("after"), f.n.getModule(99997).NOOP_LOGGER);
        return calls;
      } finally {
        await p.shutdown();
        f.context.context.disable();
      }
    },
  },
  {
    name: "batch export waits for asynchronous resource attributes before delivering",
    async run(factory) {
      const f = loggerProviderFixture(factory);
      let resolve: any;
      const resource = new f.resources.Resource(
          { owned: "sync" },
          new Promise((v) => (resolve = v)),
        ),
        calls: any[] = [],
        p = new f.n.LoggerProvider({ resource }),
        batch = new f.n.BatchLogRecordProcessor(
          {
            export: (r: any[], cb: any) => {
              calls.push(r[0].resource.attributes);
              cb({ code: 0 });
            },
            shutdown: async () => {},
          },
          { scheduledDelayMillis: 60000 },
        );
      p.addLogRecordProcessor(batch);
      try {
        p.getLogger("owned").emit(record("async"));
        const flush = p.forceFlush();
        await Promise.resolve();
        assert.equal(calls.length, 0);
        resolve({ owned: "async", ready: true });
        await flush;
        assert.equal(calls[0].owned, "async");
        assert.equal(calls[0].ready, true);
        return calls;
      } finally {
        await p.shutdown();
        f.context.context.disable();
      }
    },
  },
  {
    name: "actual LoggerProvider and batch processor deliver through concrete Galileo exporter",
    async run(factory) {
      let received: any;
      const server = http.createServer(async (req, res) => {
        const chunks = [];
        for await (const c of req) chunks.push(c);
        received = JSON.parse(Buffer.concat(chunks).toString());
        res.end("{}");
      });
      server.listen(0, "127.0.0.1");
      await once(server, "listening");
      const f = loggerProviderFixture(factory),
        e = new f.exporters.GalileoEncryptedLogExporter(
          {
            url:
              "http://127.0.0.1:" + (server.address() as any).port + "/v1/logs",
          },
          { enabled: false },
        ),
        batch = new f.n.BatchLogRecordProcessor(e, {
          scheduledDelayMillis: 60000,
        }),
        p = new f.n.LoggerProvider({
          resource: new f.resources.Resource({ "service.name": "owned" }),
        });
      p.addLogRecordProcessor(batch);
      try {
        p.getLogger("actual-logger", "1").emit(record("from actual logger"));
        await p.forceFlush();
        const r = received.resourceLogs[0];
        assert.equal(
          r.scopeLogs[0].logRecords[0].body.stringValue,
          "from actual logger",
        );
        assert.equal(r.scopeLogs[0].scope.name, "actual-logger");
        assert.ok(
          r.resource.attributes.some(
            (a: any) =>
              a.key === "telemetry.sdk.version" &&
              a.value.stringValue === "1.30.1",
          ),
        );
        return received;
      } finally {
        await p.shutdown();
        f.context.context.disable();
        await new Promise<void>((r) => server.close(() => r()));
      }
    },
  },
];

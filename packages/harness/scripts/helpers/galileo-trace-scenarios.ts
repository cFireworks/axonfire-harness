import assert from "node:assert/strict";
import * as http from "node:http";
import { gunzipSync } from "node:zlib";
import { once } from "node:events";
import { loggerProviderFixture } from "./logger-provider-scenarios.js";
import { createNativeOtelEnvironment } from "../../src/runtime/native-otel-environment.js";
import { createNativeGalileoTrace } from "../../src/runtime/native-galileo-trace.js";
function fixture(factory: typeof createNativeGalileoTrace) {
  const f = loggerProviderFixture(),
    environment = createNativeOtelEnvironment({ process: { env: {} } }),
    providers: any[] = [];
  const n: any = factory({
    sdk: f.exporters.sdk,
    exporters: f.exporters,
    context: f.context,
    tracerProviders: {
      BasicTracerProvider: class {
        options: any;
        registration: any;
        constructor(o: any) {
          this.options = o;
          providers.push(this);
        }
        register(o: any) {
          this.registration = o;
        }
      },
    },
    getModule: (id: number) =>
      id === 23258
        ? { trace: f.n.trace }
        : id === 70000
          ? environment.getModule(id)
          : id === 2339
            ? { diag: f.context.diag }
            : [33835, 65890].includes(id)
              ? f.context.getModule(id)
              : f.n.getModule(id),
  });
  return { ...f, n, spanTrace: f.n.trace, providers };
}
const traceId = "0123456789abcdef0123456789abcdef",
  spanId = "0123456789abcdef";
export const GALILEO_TRACE_CASES: {
  name: string;
  run(factory: typeof createNativeGalileoTrace): Promise<any>;
}[] = [
  {
    name: "actual ratio and parent samplers preserve normalization, validation and local/remote parent decisions",
    async run(factory) {
      const f = fixture(factory);
      try {
        const ratios = [-1, 0, 0.5, 1, 2, NaN, "1"].map((v) => {
          const s = new f.n.TraceIdRatioBasedSampler(v);
          return {
            name: s.toString(),
            valid: s.shouldSample(null, traceId).decision,
            invalid: s.shouldSample(null, "0".repeat(32)).decision,
          };
        });
        assert.deepEqual(
          ratios.map((r) => r.valid),
          [0, 0, 2, 2, 2, 0, 0],
        );
        assert.ok(ratios.every((r) => r.invalid === 0));
        const s = new f.n.ParentBasedSampler({
            root: new f.n.AlwaysOffSampler(),
          }),
          parent = [];
        for (const isRemote of [false, true])
          for (const traceFlags of [0, 1]) {
            const ctx = f.spanTrace.setSpanContext(f.context.context.active(), {
              traceId,
              spanId,
              isRemote,
              traceFlags,
            });
            parent.push(
              s.shouldSample(ctx, traceId, "owned", 0, {}, []).decision,
            );
          }
        assert.deepEqual(parent, [0, 2, 0, 2]);
        return { ratios, parent };
      } finally {
        f.context.context.disable();
      }
    },
  },
  {
    name: "Galileo registration preserves processor options and sampler filter parent remote random precedence",
    async run(factory) {
      const f = fixture(factory);
      const results = [];
      try {
        for (const kind of [
          "off",
          "filter",
          "parent",
          "remote",
          "random",
          "none",
        ]) {
          const p = f.n.registerTracerProvider({
            resource: new f.resources.Resource({ owned: "yes" }),
            addr: "http://127.0.0.1:1/traces",
            encryption: { enabled: false },
            filter: {
              calleeMethod: kind === "filter" ? ["blocked"] : [],
              callerMethod: [],
            },
            traceConfig: {
              local: {
                enable: kind !== "off",
                processor: {
                  sampler: {
                    fraction: 1,
                    enableParentSample: kind === "parent",
                    enableRandomSample: kind === "random",
                  },
                },
              },
              remote: { getData: () => [{ key: "owned", values: ["match"] }] },
            },
          });
          const processor = p.options.spanProcessors[0];
          assert.equal(processor._maxQueueSize, 100);
          assert.equal(processor._maxExportBatchSize, 20);
          assert.equal(processor._scheduledDelayMillis, 5000);
          assert.equal(processor._exportTimeoutMillis, 10000);
          const ctx = f.spanTrace.setSpanContext(f.context.context.active(), {
            traceId,
            spanId,
            traceFlags: 0,
          });
          results.push(
            p.options.sampler.shouldSample(
              ctx,
              traceId,
              "owned",
              0,
              {
                "trpc.callee_method": "blocked",
                owned: kind === "remote" ? "matches" : "no",
              },
              [],
            ).decision,
          );
          assert.ok(p.registration.contextManager);
        }
        assert.deepEqual(results, [0, 0, 0, 2, 2, 0]);
        return results;
      } finally {
        for (const p of f.providers) {
          await p.options.spanProcessors[0].shutdown();
          p.registration.contextManager.disable();
        }
        f.context.context.disable();
      }
    },
  },
  {
    name: "actual BatchSpanProcessor drops unsampled spans and exports sampled batches with suppressed context over HTTP",
    async run(factory) {
      const f = fixture(factory),
        packets: any[] = [],
        suppression: boolean[] = [];
      const server = http.createServer(async (req, res) => {
        const chunks = [];
        for await (const c of req) chunks.push(c);
        assert.equal(req.headers["content-encoding"], "gzip");
        packets.push(JSON.parse(gunzipSync(Buffer.concat(chunks)).toString()));
        res.end("{}");
      });
      server.listen(0, "127.0.0.1");
      await once(server, "listening");
      const exporter = new f.exporters.GalileoEncryptedTraceExporter(
          {
            url: `http://127.0.0.1:${(server.address() as any).port}/traces`,
            compression: "gzip",
          },
          { enabled: false },
        ),
        emit = exporter.export.bind(exporter);
      exporter.export = (spans: any, cb: any) => {
        suppression.push(
          f.context.isTracingSuppressed(f.context.context.active()),
        );
        emit(spans, cb);
      };
      const p = new f.n.BatchSpanProcessor(exporter, {
        maxExportBatchSize: 2,
        maxQueueSize: 10,
        scheduledDelayMillis: 60000,
      });
      try {
        for (const [name, flags] of [
          ["ignored", 0],
          ["first", 1],
          ["second", 1],
          ["third", 1],
        ] as const)
          p.onEnd({
            name,
            spanContext: () => ({ traceId, spanId, traceFlags: flags }),
            resource: new f.resources.Resource({ owned: "trace" }),
            instrumentationLibrary: { name: "owned", version: "1" },
            kind: 0,
            startTime: [1, 2],
            endTime: [2, 3],
            attributes: {},
            status: { code: 0 },
            events: [],
            links: [],
            droppedAttributesCount: 0,
            droppedEventsCount: 0,
            droppedLinksCount: 0,
          });
        await p.forceFlush();
        await p.shutdown();
        const names = packets
          .flatMap((p) =>
            p.resourceSpans.flatMap((r: any) =>
              r.scopeSpans.flatMap((s: any) => s.spans.map((x: any) => x.name)),
            ),
          )
          .sort();
        assert.deepEqual(names, ["first", "second", "third"]);
        assert.ok(suppression.every(Boolean));
        assert.equal(
          f.context.isTracingSuppressed(f.context.context.active()),
          false,
        );
        return { names, suppression };
      } finally {
        await p.shutdown();
        f.context.context.disable();
        server.close();
        await once(server, "close");
      }
    },
  },
];

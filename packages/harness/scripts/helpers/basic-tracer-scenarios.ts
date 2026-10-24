import assert from "node:assert/strict";
import * as http from "node:http";
import { gunzipSync } from "node:zlib";
import { once } from "node:events";
import { performance } from "node:perf_hooks";
import { loggerProviderFixture } from "./logger-provider-scenarios.js";
import { createNativeOtelEnvironment } from "../../src/runtime/native-otel-environment.js";
import { createNativeGalileoTrace } from "../../src/runtime/native-galileo-trace.js";
import { createNativeBasicTracer } from "../../src/runtime/native-basic-tracer.js";
export function basicTracerFixture(
  factory: typeof createNativeBasicTracer = createNativeBasicTracer,
) {
  const f = loggerProviderFixture(),
    env = createNativeOtelEnvironment({ process: { env: {} } });
  let galileo: any;
  let n: any;
  const parent = (id: number): any => {
    if ([69700, 14515, 62207, 84992, 72544, 11440].includes(id))
      return galileo.getModule(id);
    if (id === 23258) return { trace: n.trace };
    if (id === 2339) return { diag: f.context.diag };
    if ([70000, 6023, 55733].includes(id)) return env.getModule(id);
    if ([78766, 92321].includes(id)) return f.resources.getModule(id);
    if ([20662, 3250, 44874].includes(id)) return f.runtime.http.getModule(id);
    if (id === 41437) return f.runtime.serializers.getModule(id);
    if (id === 32047) return { otperformance: performance };
    if ([70647, 58583, 57717, 98902, 33835, 65890].includes(id))
      return f.context.getModule(id);
    return f.n.getModule(id);
  };
  n = factory({ getModule: parent });
  galileo = createNativeGalileoTrace({
    getModule: parent,
    sdk: f.exporters.sdk,
    exporters: f.exporters,
    context: f.context,
    tracerProviders: n,
  });
  return { ...f, n, galileo, tracerNative: n };
}
function cleanup(f: any) {
  f.n.trace.disable();
  f.n.propagation.disable();
  f.context.context.disable();
}
const traceId = "0123456789abcdef0123456789abcdef";
export const BASIC_TRACER_CASES: {
  name: string;
  run(factory: typeof createNativeBasicTracer): Promise<any>;
}[] = [
  {
    name: "actual tracer creates parent child spans with limits events status and suppressed nonrecording spans",
    async run(factory) {
      const f = basicTracerFixture(factory),
        captured: any[] = [];
      let seq = 0;
      const p = new f.n.BasicTracerProvider({
        sampler: new f.galileo.AlwaysOnSampler(),
        idGenerator: {
          generateTraceId: () => traceId,
          generateSpanId: () => (++seq).toString(16).padStart(16, "0"),
        },
        spanLimits: {
          attributeCountLimit: 2,
          attributeValueLengthLimit: 4,
          eventCountLimit: 1,
        },
        spanProcessors: [
          {
            onStart: () => {},
            onEnd: (s: any) => captured.push(s),
            forceFlush: async () => {},
            shutdown: async () => {},
          },
        ],
      });
      try {
        const tracer = p.getTracer("owned", "1");
        assert.equal(tracer, p.getTracer("owned", "1"));
        tracer.startActiveSpan(
          "parent",
          {
            startTime: [1, 0],
            attributes: { one: "abcdef", two: 2, three: 3 },
          },
          (s: any) => {
            assert.equal(f.n.trace.getActiveSpan(), s);
            const c = tracer.startSpan("child", { startTime: [2, 0] });
            c.addEvent("first", {}, [2, 1]);
            c.addEvent("second", {}, [2, 2]);
            c.setStatus({ code: 2, message: "failed" });
            c.end([3, 0]);
            s.end([4, 0]);
          },
        );
        assert.equal(f.n.trace.getActiveSpan(), undefined);
        const suppressed = f.context.context.with(
          f.context.suppressTracing(f.context.context.active()),
          () => tracer.startSpan("suppressed"),
        );
        assert.equal(suppressed.isRecording(), false);
        await p.forceFlush();
        const rows = captured.map((s) => ({
          name: s.name,
          context: s.spanContext(),
          parent: s.parentSpanId,
          attributes: s.attributes,
          events: s.events,
          status: s.status,
          droppedAttributes: s.droppedAttributesCount,
          droppedEvents: s.droppedEventsCount,
          duration: s.duration,
        }));
        assert.equal(rows.length, 2);
        assert.equal(rows[0]!.parent, rows[1]!.context.spanId);
        assert.equal(rows[1]!.attributes.one, "abcd");
        assert.equal(rows[1]!.droppedAttributes, 1);
        assert.equal(rows[0]!.droppedEvents, 1);
        assert.equal(rows[0]!.events[0].name, "second");
        return rows;
      } finally {
        await p.shutdown();
        cleanup(f);
      }
    },
  },
  {
    name: "actual TraceAPI proxy registration and W3C trace baggage propagation use isolated registry",
    async run(factory) {
      const f = basicTracerFixture(factory),
        proxy = f.n.trace.getTracer("early"),
        p = new f.n.BasicTracerProvider({
          sampler: new f.galileo.AlwaysOnSampler(),
        });
      try {
        assert.equal(proxy.startSpan("before").isRecording(), false);
        p.register();
        const span = proxy.startSpan("after", { startTime: [1, 0] });
        assert.equal(span.isRecording(), true);
        let ctx = f.n.trace.setSpanContext(f.context.context.active(), {
          traceId,
          spanId: "0123456789abcdef",
          traceFlags: 1,
        });
        ctx = f.n.propagation.setBaggage(
          ctx,
          f.n.propagation.createBaggage({ owned: { value: "hello world" } }),
        );
        const carrier: any = {};
        f.n.propagation.inject(ctx, carrier);
        assert.equal(carrier.traceparent, `00-${traceId}-0123456789abcdef-01`);
        assert.equal(carrier.baggage, "owned=hello%20world");
        const extracted = f.n.propagation.extract(
            f.context.context.active(),
            carrier,
          ),
          spanContext = f.n.trace.getSpanContext(extracted);
        assert.equal(spanContext.isRemote, true);
        assert.equal(
          f.n.propagation.getBaggage(extracted).getEntry("owned").value,
          "hello world",
        );
        span.end([2, 0]);
        return { carrier, spanContext };
      } finally {
        await p.shutdown();
        cleanup(f);
      }
    },
  },
  {
    name: "Galileo registers actual BasicTracerProvider and exports real ended spans over gzip HTTP",
    async run(factory) {
      const f = basicTracerFixture(factory),
        packets: any[] = [];
      const server = http.createServer(async (req, res) => {
        const chunks = [];
        for await (const c of req) chunks.push(c);
        assert.equal(req.headers["content-encoding"], "gzip");
        packets.push(JSON.parse(gunzipSync(Buffer.concat(chunks)).toString()));
        res.end("{}");
      });
      server.listen(0, "127.0.0.1");
      await once(server, "listening");
      f.context.context.disable();
      const p = f.galileo.registerTracerProvider({
        resource: new f.resources.Resource({ owned: "real-span" }),
        addr: `http://127.0.0.1:${(server.address() as any).port}/traces`,
        encryption: { enabled: false },
        filter: { calleeMethod: [], callerMethod: [] },
        traceConfig: {
          local: {
            enable: true,
            processor: { sampler: { fraction: 1, enableParentSample: true } },
          },
          remote: null,
        },
      });
      try {
        await f.n.trace
          .getTracer("owned-http", "1")
          .startActiveSpan("root", { startTime: [1, 0] }, async (s: any) => {
            await Promise.resolve();
            assert.equal(f.n.trace.getActiveSpan(), s);
            const child = f.n.trace
              .getTracer("owned-http", "1")
              .startSpan("child", {
                startTime: [2, 0],
                attributes: { owned: "yes" },
              });
            child.end([3, 0]);
            s.end([4, 0]);
          });
        await p.forceFlush();
        const spans = packets.flatMap((p) =>
          p.resourceSpans.flatMap((r: any) =>
            r.scopeSpans.flatMap((s: any) => s.spans),
          ),
        );
        assert.equal(spans.length, 2);
        const root = spans.find((s: any) => s.name === "root"),
          child = spans.find((s: any) => s.name === "child");
        assert.equal(root.traceId, child.traceId);
        assert.equal(child.parentSpanId, root.spanId);
        assert.equal(root.startTimeUnixNano, "1000000000");
        return spans
          .map((s: any) => ({
            name: s.name,
            attributes: s.attributes,
            start: s.startTimeUnixNano,
            end: s.endTimeUnixNano,
          }))
          .sort((a: any, b: any) => a.name.localeCompare(b.name));
      } finally {
        await p.shutdown();
        cleanup(f);
        server.close();
        await once(server, "close");
      }
    },
  },
];

import assert from "node:assert/strict";
import * as http from "node:http";
import * as https from "node:https";
import * as crypto from "node:crypto";
import * as zlib from "node:zlib";
import { once } from "node:events";
import { performance } from "node:perf_hooks";
import { createNativeOtlpSerializers } from "../../src/runtime/native-otlp-serializers.js";
import { createNativeGalileoTransport } from "../../src/runtime/native-galileo-transport.js";
const runtime = {
  modules: { 32047: { otperformance: performance }, 70000: {} },
};
const decode = (v: Uint8Array) => JSON.parse(new TextDecoder().decode(v));
const context = {
  traceId: "0123456789abcdef0123456789abcdef",
  spanId: "0123456789abcdef",
  traceFlags: 1,
};
function span(resource: any = { attributes: { service: "owned" } }): any {
  return {
    resource,
    instrumentationLibrary: {
      name: "owned",
      version: "1",
      schemaUrl: "owned:schema",
    },
    spanContext: () => context,
    parentSpanId: "abcdef0123456789",
    name: "owned-span",
    kind: 2,
    startTime: [1700000000, 123],
    endTime: [1700000001, 456],
    attributes: { count: 2, ok: true, tags: ["a", "b"] },
    status: { code: 1 },
    events: [
      { name: "event", time: [1700000000, 789], attributes: { a: "b" } },
    ],
    links: [{ context, attributes: { linked: true } }],
    droppedAttributesCount: 0,
    droppedEventsCount: 0,
    droppedLinksCount: 0,
  };
}
export const OTLP_SERIALIZERS_CASES: {
  name: string;
  run(factory: typeof createNativeOtlpSerializers): Promise<any>;
}[] = [
  {
    name: "trace JSON preserves exact nanoseconds, hex IDs, grouping and span fields",
    async run(factory) {
      const n: any = factory(runtime),
        r = { attributes: { service: "owned" } },
        a = span(r),
        b = span(r),
        c = span({ attributes: { service: "owned" } }),
        out = decode(n.trace.serializeRequest([a, b, c]));
      assert.equal(out.resourceSpans.length, 2);
      const scopes = out.resourceSpans[0].scopeSpans;
      assert.equal(scopes.length, 1);
      assert.equal(scopes[0].spans.length, 2);
      const s = scopes[0].spans[0];
      assert.equal(s.startTimeUnixNano, "1700000000000000123");
      assert.equal(s.traceId, context.traceId);
      assert.equal(s.kind, 3);
      assert.equal(s.events[0].timeUnixNano, "1700000000000000789");
      assert.equal(s.links[0].spanId, context.spanId);
      assert.equal(scopes[0].schemaUrl, "owned:schema");
      return out;
    },
  },
  {
    name: "metrics JSON covers sum gauge histogram and exponential histogram shapes",
    async run(factory) {
      const n: any = factory(runtime),
        point = {
          attributes: { owned: true },
          startTime: [1, 2],
          endTime: [3, 4],
        },
        metric = (type: number, value: any, valueType = 0) => ({
          descriptor: {
            name: "m" + type,
            description: "owned",
            unit: "1",
            valueType,
          },
          dataPointType: type,
          aggregationTemporality: 0,
          isMonotonic: true,
          dataPoints: [{ ...point, value }],
        }),
        data = {
          resource: { attributes: {} },
          scopeMetrics: [
            {
              scope: { name: "owned", schemaUrl: "metric:schema" },
              metrics: [
                metric(3, 42),
                metric(2, 1.5, 1),
                metric(0, {
                  buckets: { counts: [1, 2], boundaries: [4] },
                  count: 3,
                  sum: 9,
                  min: 1,
                  max: 5,
                }),
                metric(1, {
                  count: 2,
                  sum: 7,
                  min: 2,
                  max: 5,
                  positive: { offset: 1, bucketCounts: [2] },
                  negative: { offset: 0, bucketCounts: [] },
                  scale: 2,
                  zeroCount: 0,
                }),
              ],
            },
          ],
        },
        out = decode(n.metrics.serializeRequest(data)),
        m = out.resourceMetrics[0].scopeMetrics[0].metrics;
      assert.equal(m[0].sum.aggregationTemporality, 1);
      assert.equal(m[0].sum.dataPoints[0].asInt, 42);
      assert.equal(m[1].gauge.dataPoints[0].asDouble, 1.5);
      assert.deepEqual(m[2].histogram.dataPoints[0].bucketCounts, [1, 2]);
      assert.equal(m[3].exponentialHistogram.dataPoints[0].scale, 2);
      return out;
    },
  },
  {
    name: "log JSON preserves structured values, context and observed timestamps",
    async run(factory) {
      const n: any = factory(runtime),
        resource = { attributes: { service: "owned" } },
        log = {
          resource,
          instrumentationScope: { name: "log", version: "1" },
          hrTime: [2, 3],
          hrTimeObserved: [4, 5],
          severityNumber: 9,
          severityText: "INFO",
          body: { nested: ["a", 2, null] },
          attributes: { ok: true, missing: undefined },
          spanContext: context,
          droppedAttributesCount: 0,
        },
        out = decode(
          n.logs.serializeRequest([
            log,
            { ...log, instrumentationScope: { name: "second" } },
          ]),
        );
      assert.equal(out.resourceLogs.length, 1);
      assert.equal(out.resourceLogs[0].scopeLogs.length, 2);
      const r = out.resourceLogs[0].scopeLogs[0].logRecords[0];
      assert.equal(r.observedTimeUnixNano, "4000000005");
      assert.equal(r.flags, 1);
      assert.equal(
        r.body.kvlistValue.values[0].value.arrayValue.values[2].constructor,
        Object,
      );
      return out;
    },
  },
  {
    name: "encoder long bits and helper modules preserve binary IDs and JSON response failures",
    async run(factory) {
      const n: any = factory(runtime),
        encoder = n.getOtlpEncoder(),
        time = encoder.encodeHrTime([5, 7]);
      assert.deepEqual(time, { low: 705032711, high: 1 });
      assert.deepEqual([...encoder.encodeSpanContext("00ffA1")], [0, 255, 161]);
      assert.deepEqual(n.toAnyValue(null), {});
      assert.deepEqual(
        n.getModule(41437).hrTimeDuration([1, 900000000], [2, 100000000]),
        [0, 200000000],
      );
      for (const s of [n.trace, n.metrics, n.logs]) {
        assert.deepEqual(
          s.deserializeResponse(
            new TextEncoder().encode('{"partialSuccess":{"rejectedSpans":2}}'),
          ),
          { partialSuccess: { rejectedSpans: 2 } },
        );
        assert.throws(
          () => s.deserializeResponse(new TextEncoder().encode("invalid")),
          SyntaxError,
        );
      }
      return { time, bytes: [...encoder.encodeSpanContext(context.spanId)] };
    },
  },
  {
    name: "captured trace serializer and captured transport deliver real loopback OTLP JSON",
    async run(factory) {
      let received: any;
      const server = http.createServer(async (req, res) => {
        const chunks = [];
        for await (const p of req) chunks.push(p);
        received = JSON.parse(
          zlib.gunzipSync(Buffer.concat(chunks)).toString(),
        );
        res.setHeader("Content-Type", "application/json");
        res.end('{"partialSuccess":{"rejectedSpans":0}}');
      });
      server.listen(0, "127.0.0.1");
      await once(server, "listening");
      const n: any = factory(runtime),
        transport = createNativeGalileoTransport({
          crypto,
          http,
          https,
          zlib,
          sdk: { SDK_VERSION: "owned" },
        }),
        t: any = new transport.GalileoEncryptedOtlpHttpTransport(
          {
            url:
              "http://127.0.0.1:" +
              (server.address() as any).port +
              "/v1/traces",
            compression: "gzip",
            headers: () => ({ "Content-Type": "application/json" }),
          },
          { enabled: false },
        );
      try {
        const out = await t.send(n.trace.serializeRequest([span()]), 2000);
        assert.equal(out.status, "success");
        assert.equal(
          received.resourceSpans[0].scopeSpans[0].spans[0].name,
          "owned-span",
        );
        assert.equal(
          n.trace.deserializeResponse(out.data).partialSuccess.rejectedSpans,
          0,
        );
        return received;
      } finally {
        t.shutdown();
        await new Promise<void>((r) => server.close(() => r()));
      }
    },
  },
];

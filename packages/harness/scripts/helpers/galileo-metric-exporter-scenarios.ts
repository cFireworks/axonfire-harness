import { createNativeOtelEnvironment } from "../../src/runtime/native-otel-environment.js";
import assert from "node:assert/strict";
import * as crypto from "node:crypto";
import * as http from "node:http";
import { once } from "node:events";
import { galileoExporterFixture } from "./galileo-exporters-scenarios.js";
import { createNativeGalileoMetricExporter } from "../../src/runtime/native-galileo-metric-exporter.js";
function fixture(
  factory: typeof createNativeGalileoMetricExporter = createNativeGalileoMetricExporter,
  preference = "cumulative",
) {
  const f = galileoExporterFixture();
  return {
    ...f,
    n: factory({
      ...f.runtime,
      sdk: f.n.sdk,
      diag: f.diag,
      Date: { now: () => 1000 },
      modules: {
        70000: createNativeOtelEnvironment({
          process: {
            env: {
              OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE: preference,
            },
          },
        }).getModule(70000),
        54601: crypto,
      },
    }) as any,
  };
}
export const GALILEO_METRIC_CASES: {
  name: string;
  run(factory: typeof createNativeGalileoMetricExporter): Promise<any>;
}[] = [
  {
    name: "metric exporter selects original cumulative delta lowmemory temporalities",
    async run(factory) {
      const results = [];
      for (const preference of [
        "cumulative",
        "delta",
        "lowmemory",
        "invalid",
      ]) {
        const f = fixture(factory, preference),
          e = new f.n.GalileoEncryptedMetricExporter(
            { url: "http://owned.invalid" },
            { enabled: false },
          );
        try {
          const types = Object.values(f.n.InstrumentType),
            values = types.map((t) => e.selectAggregationTemporality(t));
          results.push({ preference, types, values, warnings: f.warnings });
          if (preference === "cumulative" || preference === "invalid")
            assert.ok(values.every((v) => v === 1));
          if (preference === "lowmemory") {
            assert.equal(e.selectAggregationTemporality("COUNTER"), 0);
            assert.equal(
              e.selectAggregationTemporality("OBSERVABLE_COUNTER"),
              1,
            );
          }
          if (preference === "delta")
            assert.equal(e.selectAggregationTemporality("UP_DOWN_COUNTER"), 1);
        } finally {
          await e.shutdown();
        }
      }
      return results;
    },
  },
  {
    name: "explicit selectors override environment and default aggregation resolves all instruments",
    async run(factory) {
      const f = fixture(factory, "delta"),
        custom = { owned: true },
        selector = () => custom,
        e = new f.n.GalileoEncryptedMetricExporter(
          {
            temporalityPreference: 1,
            aggregationPreference: selector,
            url: "http://owned.invalid",
          },
          { enabled: false },
        );
      try {
        assert.equal(e.selectAggregation("COUNTER"), custom);
        assert.equal(e.selectAggregationTemporality("COUNTER"), 1);
        const out = [];
        for (const type of Object.values(f.n.InstrumentType)) {
          const descriptor = f.n.createInstrumentDescriptor("owned", type, {}),
            aggregator = f.n.Aggregation.Default().createAggregator(descriptor);
          out.push([type, aggregator.kind]);
        }
        assert.equal(
          f.n.Aggregation.Default().createAggregator({
            type: "unknown",
            advice: {},
          }).kind,
          0,
        );
        return { out, warnings: f.warnings };
      } finally {
        await e.shutdown();
      }
    },
  },
  {
    name: "sum aggregation retains monotonic reset and histogram bucket merge and diff",
    async run(factory) {
      const f = fixture(factory),
        desc = f.n.createInstrumentDescriptor("counter", "COUNTER", {}),
        sum = f.n.Aggregation.Sum().createAggregator(desc),
        a = sum.createAccumulation([1, 0]),
        b = sum.createAccumulation([2, 0]);
      a.record(5);
      a.record(3);
      b.record(2);
      assert.equal(a.toPointValue(), 8);
      assert.equal(sum.diff(a, b).reset, true);
      assert.equal(sum.merge(a, b).toPointValue(), 10);
      const hist = new f.n.ExplicitBucketHistogramAggregation([
          5,
          1,
          Infinity,
          -Infinity,
        ]).createAggregator({ type: "HISTOGRAM" }),
        h = hist.createAccumulation([1, 0]),
        j = hist.createAccumulation([1, 0]);
      for (const v of [0, 1, 3, 6]) h.record(v);
      j.record(2);
      assert.deepEqual(h.toPointValue().buckets, {
        boundaries: [1, 5],
        counts: [2, 1, 1],
      });
      const merged = hist.merge(h, j),
        diff = hist.diff(h, merged);
      assert.equal(merged.toPointValue().count, 5);
      assert.equal(diff.toPointValue().count, 1);
      return {
        sum: a.toPointValue(),
        hist: h.toPointValue(),
        merged: merged.toPointValue(),
        diff: diff.toPointValue(),
      };
    },
  },
  {
    name: "exponential histogram aggregation records both signs and merges accumulations",
    async run(factory) {
      const f = fixture(factory),
        agg = new f.n.ExponentialHistogramAggregation(
          20,
          true,
        ).createAggregator({ type: "HISTOGRAM" }),
        a = agg.createAccumulation([1, 0]),
        b = agg.createAccumulation([1, 0]);
      for (const v of [0, 1, 2, 4, -2, -8]) a.record(v);
      b.record(16);
      const merged = agg.merge(a, b),
        desc = f.n.createInstrumentDescriptor("hist", "HISTOGRAM", {}),
        data = agg.toMetricData(desc, 1, [[{}, merged]], [2, 0]);
      assert.equal(data.dataPoints[0].value.count, 7);
      assert.equal(data.dataPoints[0].value.zeroCount, 1);
      assert.equal(data.dataPoints[0].value.sum, 13);
      return data;
    },
  },
  {
    name: "metric exporter delivers actual aggregated metric data through recovered HTTP chain",
    async run(factory) {
      let received: any;
      const server = http.createServer(async (req, res) => {
        const chunks = [];
        for await (const c of req) chunks.push(c);
        received = {
          path: req.url,
          userAgent: req.headers["user-agent"],
          body: JSON.parse(Buffer.concat(chunks).toString()),
        };
        res.end("{}");
      });
      server.listen(0, "127.0.0.1");
      await once(server, "listening");
      const f = fixture(factory),
        e = new f.n.GalileoEncryptedMetricExporter(
          {
            url:
              "http://127.0.0.1:" +
              (server.address() as any).port +
              "/v1/metrics",
          },
          { enabled: false },
        );
      try {
        const d = f.n.createInstrumentDescriptor("owned_count", "COUNTER", {
            valueType: 0,
          }),
          a = e.selectAggregation("COUNTER").createAggregator(d),
          v = a.createAccumulation([1, 0]);
        v.record(3);
        v.record(4);
        const metric = a.toMetricData(
            d,
            e.selectAggregationTemporality("COUNTER"),
            [[{ owned: true }, v]],
            [2, 0],
          ),
          payload = {
            resource: { attributes: { service: "owned" } },
            scopeMetrics: [{ scope: { name: "owned" }, metrics: [metric] }],
          },
          r: any = await new Promise((resolve) => e.export(payload, resolve));
        assert.equal(r.code, 0, r.error?.message);
        await e.forceFlush();
        assert.equal(received.path, "/v1/metrics");
        assert.equal(
          received.body.resourceMetrics[0].scopeMetrics[0].metrics[0].sum
            .dataPoints[0].asInt,
          7,
        );
        return received;
      } finally {
        await e.shutdown();
        await new Promise<void>((r) => server.close(() => r()));
      }
    },
  },
];

export { fixture as galileoMetricFixture };

import assert from "node:assert/strict";
import * as http from "node:http";
import { gunzipSync } from "node:zlib";
import { once } from "node:events";
import { meterProviderFixture } from "./meter-provider-scenarios.js";
import { galileoExporterFixture } from "./galileo-exporters-scenarios.js";
import { createNativeGalileoMeters } from "../../src/runtime/native-galileo-meters.js";
function fixture(factory: typeof createNativeGalileoMeters) {
  const f = meterProviderFixture(),
    e = galileoExporterFixture().n;
  const n = factory({
    readers: f.n,
    metrics: f.metric.n,
    providers: f.providerNative,
    enums: e.getModule(15183),
    sdk: e.sdk,
    getModule: (id: number) =>
      id === 36182 ? f.providerNative.getModule(id) : f.context.getModule(id),
  });
  return { ...f, n, enums: e.getModule(15183), sdk: e.sdk };
}
export const GALILEO_METERS_CASES: {
  name: string;
  run(factory: typeof createNativeGalileoMeters): Promise<any>;
}[] = [
  {
    name: "business histogram buckets use defaults and last nonempty matching remote entry",
    async run(factory) {
      const f = fixture(factory);
      try {
        const names = f.enums.ClientServerMetrics,
          defaults = f.n.getEndBuckets(undefined),
          a = [1, 2],
          b = [3, 4];
        assert.equal(
          defaults.clientBuckets,
          f.sdk.METRICS_CONFIG.clientBuckets,
        );
        const result = f.n.getEndBuckets([
          { name: names.ClientHandledSeconds, buckets: a },
          { name: names.ClientHandledSeconds, buckets: [] },
          { name: "unknown", buckets: [9] },
          { name: names.ClientHandledSeconds, buckets: b },
          { name: names.ServerHandledSeconds, buckets: [5] },
        ]);
        assert.equal(result.clientBuckets, b);
        assert.deepEqual(result.serverBuckets, [5]);
        assert.equal(
          f.sdk.METRICS_CONFIG.clientBuckets,
          defaults.clientBuckets,
        );
        return { defaults, result };
      } finally {
        f.n.metrics.disable();
        f.context.context.disable();
      }
    },
  },
  {
    name: "actual business provider registers MetricsAPI and exports six configured delta views over gzip HTTP",
    async run(factory) {
      const packets: any[] = [],
        owned: any[] = [],
        f = fixture(factory);
      let calls = 0;
      const server = http.createServer(async (req, res) => {
        const chunks = [];
        for await (const c of req) chunks.push(c);
        assert.equal(req.headers["content-encoding"], "gzip");
        packets.push(JSON.parse(gunzipSync(Buffer.concat(chunks)).toString()));
        res.end("{}");
      });
      server.listen(0, "127.0.0.1");
      await once(server, "listening");
      try {
        const names = f.enums.ClientServerMetrics,
          before = f.n.metrics.getMeterProvider(),
          options = {
            resource: new f.resources.Resource({ owned: "business" }),
            addr: `http://127.0.0.1:${(server.address() as any).port}/metrics`,
            encryption: { enabled: false },
            remote: {
              getMetricsConfig: () => {
                calls++;
                return [
                  { name: names.ClientHandledSeconds, buckets: [0.5, 2] },
                  { name: names.ServerHandledSeconds, buckets: [0.1, 1] },
                ];
              },
            },
          };
        const p = f.n.registerMeterProvider(options);
        owned.push(p);
        assert.equal(calls, 1);
        assert.equal(f.n.metrics.getMeterProvider(), p);
        assert.notEqual(p, before);
        const meter = f.n.metrics.getMeter("business", "1");
        for (const name of [
          names.ClientStartedTotal,
          names.ClientHandledTotal,
          names.ServerStartedTotal,
          names.ServerHandledTotal,
        ])
          meter
            .createCounter(name, { valueType: 0 })
            .add(2, { route: "owned" });
        meter
          .createHistogram(names.ClientHandledSeconds)
          .record(0.75, { route: "owned" });
        meter
          .createHistogram(names.ServerHandledSeconds)
          .record(0.75, { route: "owned" });
        await p.forceFlush();
        assert.equal(calls, 1);
        const results = packets
          .flatMap((p) =>
            p.resourceMetrics.flatMap((r: any) =>
              r.scopeMetrics.flatMap((s: any) => s.metrics),
            ),
          )
          .map((m: any) => ({
            name: m.name,
            kind: m.sum ? "sum" : "histogram",
            temporality: (m.sum ?? m.histogram).aggregationTemporality,
            points: (m.sum ?? m.histogram).dataPoints.map((d: any) =>
              m.sum
                ? { value: Number(d.asInt ?? d.asDouble) }
                : {
                    bounds: d.explicitBounds,
                    counts: d.bucketCounts.map(Number),
                    count: Number(d.count),
                    sum: d.sum,
                  },
            ),
          }))
          .sort((a: any, b: any) => a.name.localeCompare(b.name));
        assert.equal(results.length, 6);
        assert.ok(results.every((m: any) => m.temporality === 1));
        assert.ok(
          results
            .filter((m: any) => m.kind === "sum")
            .every((m: any) => m.points[0].value === 2),
        );
        const client = results.find(
          (m: any) => m.name === names.ClientHandledSeconds,
        )!;
        const serv = results.find(
          (m: any) => m.name === names.ServerHandledSeconds,
        )!;
        assert.deepEqual(client.points, [
          { bounds: [0.5, 2], counts: [0, 1, 0], count: 1, sum: 0.75 },
        ]);
        assert.deepEqual(serv.points, [
          { bounds: [0.1, 1], counts: [0, 1, 0], count: 1, sum: 0.75 },
        ]);
        const second = f.n.registerMeterProvider(options);
        owned.push(second);
        assert.notEqual(second, p);
        assert.equal(f.n.metrics.getMeterProvider(), p);
        assert.equal(calls, 2);
        f.n.metrics.disable();
        assert.equal(f.n.metrics.getMeterProvider(), before);
        return { results, calls };
      } finally {
        await Promise.all(owned.map((p) => p.shutdown()));
        f.n.metrics.disable();
        f.context.context.disable();
        assert.equal(f.timers.size, 0);
        server.close();
        await once(server, "close");
      }
    },
  },
];

import { createNativeOtelResource } from "../../src/runtime/native-otel-resource.js";
import assert from "node:assert/strict";
import * as http from "node:http";
import { once } from "node:events";
import { metricReaderFixture } from "./metric-reader-scenarios.js";
import { createNativeMeterProvider } from "../../src/runtime/native-meter-provider.js";
export function meterProviderFixture(
  factory: typeof createNativeMeterProvider = createNativeMeterProvider,
) {
  const f = metricReaderFixture(),
    resources = createNativeOtelResource({
      process: { argv0: "owned-node" },
      diag: f.context.diag,
    }),
    n: any = factory({
      readers: f.n,
      metrics: f.metric.n,
      serializers: f.metric.runtime.serializers,
      resources,
      diag: { warn: () => {}, error: () => {}, debug: () => {} },
      modules: { 33835: f.context.getModule(33835) },
    });
  return { ...f, providerNative: n, resources };
}
function values(data: any) {
  return data.resourceMetrics.scopeMetrics.flatMap((s: any) =>
    s.metrics.map((m: any) => ({
      name: m.descriptor.name,
      type: m.dataPointType,
      points: m.dataPoints.map((p: any) => ({
        attributes: p.attributes,
        value: p.value,
      })),
      monotonic: m.isMonotonic,
    })),
  );
}
function setup(f: any, options: any = {}) {
  const reader = new f.n.MetricReader(),
    provider = new f.providerNative.MeterProvider({
      resource: new f.resources.Resource({ "service.name": "owned" }),

      readers: [reader],
      ...options,
    });
  reader.onShutdown = async () => {};
  reader.onForceFlush = async () => {};
  return { reader, provider, meter: provider.getMeter("owned", "1") };
}
export const METER_PROVIDER_CASES: {
  name: string;
  run(factory: typeof createNativeMeterProvider): Promise<any>;
}[] = [
  {
    name: "real MeterProvider creates instruments and reader collects real synchronous storage",
    async run(factory) {
      const f = meterProviderFixture(factory),
        { reader, provider, meter } = setup(f);
      try {
        assert.equal(provider.getMeter("owned", "1"), meter);
        const counter = meter.createCounter("count", { valueType: 0 }),
          up = meter.createUpDownCounter("balance"),
          gauge = meter.createGauge("gauge"),
          hist = meter.createHistogram("hist", {
            advice: { explicitBucketBoundaries: [1, 5] },
          });
        counter.add(3, { key: "a" });
        counter.add(4, { key: "a" });
        counter.add(-1, { key: "a" });
        up.add(-2);
        gauge.record(6);
        gauge.record(9);
        hist.record(2);
        hist.record(7);
        const out = values(await reader.collect());
        assert.equal(
          out.find((m: any) => m.name === "count").points[0].value,
          7,
        );
        assert.equal(
          out.find((m: any) => m.name === "balance").points[0].value,
          -2,
        );
        assert.equal(
          out.find((m: any) => m.name === "gauge").points[0].value,
          9,
        );
        assert.deepEqual(
          out.find((m: any) => m.name === "hist").points[0].value.buckets,
          { boundaries: [1, 5], counts: [0, 1, 1] },
        );
        return out;
      } finally {
        await provider.shutdown();
        f.context.context.disable();
      }
    },
  },
  {
    name: "observable callbacks and batch callbacks record through original asynchronous storage",
    async run(factory) {
      const f = meterProviderFixture(factory),
        { reader, provider, meter } = setup(f);
      try {
        const gauge = meter.createObservableGauge("observable"),
          count = meter.createObservableCounter("batch");
        const cb = (r: any) => r.observe(12, { owned: "single" }),
          batch = (r: any) => r.observe(count, 5, { owned: "batch" });
        gauge.addCallback(cb);
        meter.addBatchObservableCallback(batch, [count]);
        const out = values(await reader.collect());
        assert.equal(
          out.find((m: any) => m.name === "observable").points[0].value,
          12,
        );
        assert.equal(
          out.find((m: any) => m.name === "batch").points[0].value,
          5,
        );
        gauge.removeCallback(cb);
        meter.removeBatchObservableCallback(batch, [count]);
        return out;
      } finally {
        await provider.shutdown();
        f.context.context.disable();
      }
    },
  },
  {
    name: "views rename instruments and filter attributes in actual metric storage",
    async run(factory) {
      const f = meterProviderFixture(factory),
        view = new f.providerNative.View({
          instrumentName: "raw_count",
          name: "renamed_count",
          attributeKeys: ["keep"],
        }),
        { reader, provider, meter } = setup(f, { views: [view] });
      try {
        meter.createCounter("raw_count").add(2, { keep: "yes", drop: "no" });
        const out = values(await reader.collect());
        assert.equal(out[0].name, "renamed_count");
        assert.deepEqual(out[0].points[0].attributes, { keep: "yes" });
        assert.throws(() => new f.providerNative.View({}), /no selector/);
        assert.throws(
          () =>
            new f.providerNative.View({ instrumentName: "*", name: "invalid" }),
          /at most one/,
        );
        return out;
      } finally {
        await provider.shutdown();
        f.context.context.disable();
      }
    },
  },
  {
    name: "provider shutdown makes later getMeter return original no-op meter",
    async run(factory) {
      const f = meterProviderFixture(factory),
        { reader, provider } = setup(f);
      let flushed = 0,
        closed = 0;
      reader.onForceFlush = async () => {
        flushed++;
      };
      reader.onShutdown = async () => {
        closed++;
      };
      await provider.forceFlush();
      await provider.shutdown();
      await provider.shutdown();
      await provider.forceFlush();
      const noop = provider.getMeter("after");
      noop.createCounter("count").add(4);
      noop.createHistogram("hist").record(2);
      assert.equal(flushed, 1);
      assert.equal(closed, 1);
      assert.equal(noop, f.providerNative.getModule(36182).NOOP_METER);
      f.context.context.disable();
      return { flushed, closed };
    },
  },
  {
    name: "real MeterProvider counter flows through periodic reader and exporter to loopback HTTP",
    async run(factory) {
      let received: any;
      const server = http.createServer(async (req, res) => {
        const chunks = [];
        for await (const p of req) chunks.push(p);
        received = JSON.parse(Buffer.concat(chunks).toString());
        res.end("{}");
      });
      server.listen(0, "127.0.0.1");
      await once(server, "listening");
      const f = meterProviderFixture(factory),
        exporter = new f.metric.n.GalileoEncryptedMetricExporter(
          {
            url:
              "http://127.0.0.1:" +
              (server.address() as any).port +
              "/v1/metrics",
          },
          { enabled: false },
        ),
        reader = new f.n.PeriodicExportingMetricReader({ exporter }),
        provider = new f.providerNative.MeterProvider({
          resource: new f.resources.Resource({ "service.name": "owned" }),

          readers: [reader],
        });
      try {
        provider
          .getMeter("owned")
          .createCounter("http_count", { valueType: 0 })
          .add(17, { owned: true });
        await provider.forceFlush();
        const resourceAttributes =
          received.resourceMetrics[0].resource.attributes;
        assert.ok(
          resourceAttributes.some(
            (a: any) =>
              a.key === "telemetry.sdk.version" &&
              a.value.stringValue === "1.30.1",
          ),
        );
        assert.ok(
          resourceAttributes.some(
            (a: any) =>
              a.key === "service.name" && a.value.stringValue === "owned",
          ),
        );
        const m = received.resourceMetrics[0].scopeMetrics[0].metrics[0];
        assert.equal(m.name, "http_count");
        assert.equal(m.sum.dataPoints[0].asInt, 17);
        return { name: m.name, value: m.sum.dataPoints[0].asInt };
      } finally {
        await provider.shutdown();
        f.context.context.disable();
        await new Promise<void>((r) => server.close(() => r()));
      }
    },
  },
];

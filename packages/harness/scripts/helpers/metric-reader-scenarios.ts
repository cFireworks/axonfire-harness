import { exportContextFixture } from "./export-context-scenarios.js";
import assert from "node:assert/strict";
import * as http from "node:http";
import { once } from "node:events";
import { galileoMetricFixture } from "./galileo-metric-exporter-scenarios.js";
import { createNativeMetricReader } from "../../src/runtime/native-metric-reader.js";
function fixture(
  factory: typeof createNativeMetricReader = createNativeMetricReader,
) {
  const context = exportContextFixture().n;
  context.context.setGlobalContextManager(
    new context.AsyncLocalStorageContextManager().enable(),
  );
  const metric = galileoMetricFixture(),
    events: any[] = [],
    timers = new Map(),
    errors: any[] = [],
    diag = {
      debug: (...a: any[]) => events.push(["debug", ...a]),
      warn: (...a: any[]) => events.push(["warn", ...a]),
      error: (...a: any[]) => events.push(["error", ...a]),
    },
    n: any = factory({
      metrics: metric.n,
      diag,
      exportResult: { ExportResultCode: { SUCCESS: 0, FAILED: 1 } },
      internal: context.internal,
      modules: { 2339: { diag } },
      setInterval: (fn: any, ms: number) => {
        const h = { unref: () => events.push(["unref", ms]) };
        timers.set(h, fn);
        return h;
      },
      clearInterval: (h: any) => {
        events.push(["clear"]);
        timers.delete(h);
      },
    });
  n.getModule(60002).setGlobalErrorHandler((e: any) => errors.push(e.message));
  return { n, metric, events, timers, errors, context };
}
const result = (scopeMetrics: any[] = []) => ({
  resourceMetrics: { resource: { attributes: {} }, scopeMetrics },
  errors: [],
});
export const METRIC_READER_CASES: {
  name: string;
  run(factory: typeof createNativeMetricReader): Promise<any>;
}[] = [
  {
    name: "reader validates producer binding and combines external producer scopes and errors",
    async run(factory) {
      const f = fixture(factory),
        r = new f.n.MetricReader({
          metricProducers: [
            {
              collect: async () => ({
                ...result([{ scope: { name: "external" }, metrics: [] }]),
                errors: ["external-error"],
              }),
            },
          ],
        });
      await assert.rejects(r.collect(), /not bound/);
      const primary = result([{ scope: { name: "primary" }, metrics: [] }]);
      r.setMetricProducer({
        collect: async (opts: any) => {
          assert.equal(opts.timeoutMillis, 42);
          return primary;
        },
      });
      assert.throws(() => r.setMetricProducer({}), /bound/);
      const out = await r.collect({ timeoutMillis: 42 });
      assert.equal(
        out.resourceMetrics.resource,
        primary.resourceMetrics.resource,
      );
      assert.equal(out.resourceMetrics.scopeMetrics.length, 2);
      assert.deepEqual(out.errors, ["external-error"]);
      assert.equal(r.selectCardinalityLimit("COUNTER"), 2000);
      assert.equal(r.selectAggregationTemporality("COUNTER"), 1);
      return out;
    },
  },
  {
    name: "periodic reader starts unref timer and flush shutdown preserve original order",
    async run(factory) {
      const f = fixture(factory),
        e = {
          export: (_data: any, cb: any) => {
            assert.equal(
              f.context.isTracingSuppressed(f.context.context.active()),
              true,
            );
            f.events.push(["export"]);
            cb({ code: 0 });
          },
          forceFlush: async () => f.events.push(["flush"]),
          shutdown: async () => f.events.push(["shutdown"]),
        },
        r = new f.n.PeriodicExportingMetricReader({
          exporter: e,
          exportIntervalMillis: 20,
          exportTimeoutMillis: 10,
        });
      r.setMetricProducer({
        collect: async () => {
          f.events.push(["collect"]);
          return result([{ scope: { name: "owned" }, metrics: [] }]);
        },
      });
      assert.equal(f.timers.size, 1);
      await r.forceFlush();
      await r.shutdown();
      assert.equal(f.timers.size, 0);
      assert.deepEqual(f.events, [
        ["unref", 20],
        ["collect"],
        ["export"],
        ["flush"],
        ["clear"],
        ["collect"],
        ["export"],
        ["flush"],
        ["shutdown"],
      ]);
      await r.forceFlush();
      await r.shutdown();
      await assert.rejects(r.collect(), /shutdown/);
      assert.equal(f.events.at(-1)![0], "error");
      return f.events;
    },
  },
  {
    name: "reader validates periods skips empty collection and reports exporter failures",
    async run(factory) {
      const f = fixture(factory),
        e = {
          export: (_d: any, cb: any) =>
            cb({ code: 1, error: Error("owned export") }),
          forceFlush: async () => {},
          shutdown: async () => {},
        };
      for (const options of [
        { exportIntervalMillis: 0 },
        { exportTimeoutMillis: -1 },
        { exportIntervalMillis: 1, exportTimeoutMillis: 2 },
      ])
        assert.throws(
          () =>
            new f.n.PeriodicExportingMetricReader({ exporter: e, ...options }),
        );
      const r = new f.n.PeriodicExportingMetricReader({ exporter: e });
      let empty = true;
      r.setMetricProducer({
        collect: async () =>
          result(empty ? [] : [{ scope: { name: "owned" }, metrics: [] }]),
      });
      await r.forceFlush();
      assert.equal(f.errors.length, 0);
      empty = false;
      await r.forceFlush();
      assert.match(f.errors[0], /owned export/);
      empty = true;
      await r.shutdown();
      return f.errors;
    },
  },
  {
    name: "shutdown timeout leaves reader retryable and does not cancel its hook",
    async run(factory) {
      const f = fixture(factory),
        r = new f.n.MetricReader();
      let resolve: any,
        done = false;
      r.onShutdown = () =>
        new Promise(
          (v) =>
            (resolve = () => {
              done = true;
              v(undefined);
            }),
        );
      await assert.rejects(
        r.shutdown({ timeoutMillis: 5 }),
        /Operation timed out/,
      );
      assert.equal(r._shutdown, false);
      resolve();
      await Promise.resolve();
      assert.equal(done, true);
      r.onShutdown = async () => {};
      await r.shutdown();
      assert.equal(r._shutdown, true);
      return { done, shutdown: r._shutdown };
    },
  },
  {
    name: "periodic reader exports actual aggregate via concrete metric exporter and real HTTP",
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
      const f = fixture(factory),
        e = new f.metric.n.GalileoEncryptedMetricExporter(
          {
            url:
              "http://127.0.0.1:" +
              (server.address() as any).port +
              "/v1/metrics",
          },
          { enabled: false },
        ),
        r = new f.n.PeriodicExportingMetricReader({ exporter: e });
      try {
        const d = f.metric.n.createInstrumentDescriptor("owned", "COUNTER", {
            valueType: 0,
          }),
          a = r.selectAggregation("COUNTER").createAggregator(d),
          acc = a.createAccumulation([1, 0]);
        acc.record(9);
        const data = a.toMetricData(
          d,
          r.selectAggregationTemporality("COUNTER"),
          [[{}, acc]],
          [2, 0],
        );
        r.setMetricProducer({
          collect: async () =>
            result([{ scope: { name: "owned" }, metrics: [data] }]),
        });
        await r.forceFlush();
        assert.equal(
          received.resourceMetrics[0].scopeMetrics[0].metrics[0].sum
            .dataPoints[0].asInt,
          9,
        );
        assert.equal(f.errors.length, 0);
        return received;
      } finally {
        await r.shutdown();
        await new Promise<void>((v) => server.close(() => v()));
      }
    },
  },
];

export { fixture as metricReaderFixture };

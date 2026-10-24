import assert from "node:assert/strict";
import * as http from "node:http";
import { gunzipSync } from "node:zlib";
import { once } from "node:events";
import { galileoMetricFixture } from "./galileo-metric-exporter-scenarios.js";
import { loggerProviderFixture } from "./logger-provider-scenarios.js";
import { createNativeMetricReader } from "../../src/runtime/native-metric-reader.js";
import { createNativeMeterProvider } from "../../src/runtime/native-meter-provider.js";
import { createNativeGalileoLogger } from "../../src/runtime/native-galileo-logger.js";
import { createNativeGalileoSelfMonitor } from "../../src/runtime/native-galileo-self-monitor.js";
export const GALILEO_SELF_MONITOR_CASES: {
  name: string;
  run(factory: typeof createNativeGalileoSelfMonitor): Promise<any>;
}[] = [
  {
    name: "actual Galileo self-monitor resources, delta counters and logger integration export gzip over HTTP",
    async run(factory) {
      const packets: any[] = [],
        readers: any[] = [],
        owned: any[] = [],
        logs: any[] = [];
      const server = http.createServer(async (req, res) => {
        const chunks = [];
        for await (const c of req) chunks.push(c);
        const raw = Buffer.concat(chunks);
        packets.push({
          encoding: req.headers["content-encoding"],
          body: JSON.parse(
            (req.headers["content-encoding"] === "gzip"
              ? gunzipSync(raw)
              : raw
            ).toString(),
          ),
        });
        res.end("{}");
      });
      server.listen(0, "127.0.0.1");
      await once(server, "listening");
      const endpoint = `http://127.0.0.1:${(server.address() as any).port}/metrics`,
        f = loggerProviderFixture(),
        m = galileoMetricFixture(),
        enums = f.exporters.getModule(15183),
        sdk = {
          ...f.exporters.sdk,
          METRICS_COLLECTOR_ADDR: endpoint,
          METRICS_COLLECTOR_SG_ADDR: endpoint,
        };
      const readerNative: any = createNativeMetricReader({
        metrics: m.n,
        diag: f.context.diag,
        internal: f.context.internal,
        exportResult: f.n.getModule(36275),
        modules: { 2339: { diag: f.context.diag } },
      });
      const providers: any = createNativeMeterProvider({
        readers: readerNative,
        metrics: m.n,
        serializers: m.runtime.serializers,
        resources: f.resources,
        diag: f.context.diag,
        modules: { 33835: f.context.getModule(33835) },
      });
      const Reader = readerNative.PeriodicExportingMetricReader;
      const n = factory({
        readers: {
          ...readerNative,
          PeriodicExportingMetricReader: class extends Reader {
            constructor(o: any) {
              super(o);
              readers.push(this);
            }
          },
        },
        metrics: m.n,
        providers,
        resources: f.resources,
        enums,
        sdk,
      });
      try {
        const p = n.getSelfMeterProvider(
          enums.NamespaceValues.Production,
          "ignored",
          endpoint,
          { enabled: false },
        );
        owned.push(p);
        const attrs = p._sharedState.resource.attributes;
        assert.equal(
          attrs[enums.GalileoResourceAttributes.Target],
          "PCG-123.galileo.otp",
        );
        assert.equal(
          attrs[enums.GalileoResourceAttributes.EnvName],
          enums.EnvNameValues.Formal,
        );
        assert.equal(readers[0]._exportInterval, 30000);
        assert.equal(readers[0]._exportTimeout, 20000);
        assert.equal(readers[0]._interval.hasRef(), false);
        const c = p
          .getMeter(sdk.SELF_MONITOR, "")
          .createCounter("node_instrument_start", { valueType: 0 });
        c.add(2, { owned: "yes" });
        await p.forceFlush();
        c.add(3, { owned: "yes" });
        await p.forceFlush();
        const Base = f.n.LoggerProvider;
        const loggerNative: any = createNativeGalileoLogger({
          resources: f.resources,
          enums,
          sdk,
          context: f.context,
          providers: {
            ...f.n,
            LoggerProvider: class extends Base {
              constructor(o: any) {
                super(o);
                logs.push(this);
              }
            },
          },
          valueTypes: m.runtime.serializers.getModule(11447),
          exporters: f.exporters,
          resolveGalileoEncryptionConfig:
            f.runtime.transport.resolveGalileoEncryptionConfig,
          process: { env: {} },
          console: {},
          getSelfMeterProvider: (...args: any[]) => {
            const p = n.getSelfMeterProvider(args[0],args[1],args[2],args[3]);
            owned.push(p);
            return p;
          },
        });
        const logger = new loggerNative.Logger({
          namespace: "owned-development",
          env: "owned-env",
          app: "app",
          server: "server",
          platform: "owned",
          level: "warn",
          isEncrypted: false,
          logCollectorAddr: endpoint,
        });
        logger.info("filtered");
        logger.warn("visible");
        await logs[0].forceFlush();
        await owned[1].forceFlush();
        assert.equal(
          owned[1]._sharedState.resource.attributes[
            enums.GalileoResourceAttributes.EnvName
          ],
          "owned-env",
        );
        assert.notEqual(owned[0], owned[1]);
        const metrics = packets
          .filter((p) => p.body.resourceMetrics)
          .map((p) => ({
            encoding: p.encoding,
            metrics: p.body.resourceMetrics.flatMap((r: any) =>
              r.scopeMetrics.flatMap((s: any) =>
                s.metrics.map((m: any) => ({
                  name: m.name,
                  temporality: m.sum.aggregationTemporality,
                  values: m.sum.dataPoints.map((d: any) =>
                    Number(d.asInt ?? d.asDouble),
                  ),
                })),
              ),
            ),
          }));
        assert.equal(metrics.length, 3);
        assert.ok(metrics.every((p) => p.encoding === "gzip"));
        assert.deepEqual(metrics[0]!.metrics[0]!.values, [2]);
        assert.deepEqual(metrics[1]!.metrics[0]!.values, [3]);
        assert.equal(metrics[0]!.metrics[0]!.temporality, 1);
        const counts = Object.fromEntries(
          metrics[2]!.metrics.map((m: any) => [m.name, m.values]),
        );
        assert.deepEqual(counts, {
          node_instrument_start: [2],
          node_instrument_end: [1],
        });
        return { metrics, resource: attrs, counts };
      } finally {
        await Promise.all(logs.map((p) => p.shutdown()));
        await Promise.all(owned.map((p) => p.shutdown()));
        f.context.context.disable();
        server.close();
        await once(server, "close");
      }
    },
  },
];

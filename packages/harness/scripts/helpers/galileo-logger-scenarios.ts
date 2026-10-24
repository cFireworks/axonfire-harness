import assert from "node:assert/strict";
import * as http from "node:http";
import { once } from "node:events";
import { loggerProviderFixture } from "./logger-provider-scenarios.js";
import { createNativeGalileoLogger } from "../../src/runtime/native-galileo-logger.js";
export const GALILEO_LOGGER_CASES: {
  name: string;
  run(factory: typeof createNativeGalileoLogger): Promise<any>;
}[] = [
  {
    name: "outer logger preserves filtering, sampled override, attributes and counters through actual HTTP export",
    async run(factory) {
      const f = loggerProviderFixture(),
        payloads: any[] = [],
        providers: any[] = [],
        counts: any[] = [],
        printed: any[] = [];
      const server = http.createServer(async (req, res) => {
        const chunks = [];
        for await (const c of req) chunks.push(c);
        payloads.push(JSON.parse(Buffer.concat(chunks).toString()));
        res.end("{}");
      });
      server.listen(0, "127.0.0.1");
      await once(server, "listening");
      const Base = f.n.LoggerProvider;
      const n = factory({
        resources: f.resources,
        enums: f.exporters.getModule(15183),
        sdk: f.exporters.sdk,
        context: f.context,
        providers: {
          ...f.n,
          LoggerProvider: class extends Base {
            constructor(o: any) {
              super(o);
              providers.push(this);
            }
          },
        },
        valueTypes: { ValueType: { INT: 0 } },
        exporters: f.exporters,
        resolveGalileoEncryptionConfig:
          f.runtime.transport.resolveGalileoEncryptionConfig,
        process: { env: {} },
        console: Object.fromEntries(
          ["log", "info", "warn", "error", "debug", "trace"].map((k) => [
            k,
            (...a: any[]) => printed.push([k, ...a]),
          ]),
        ),
        getSelfMeterProvider: (...args: any[]) => ({
          getMeter: () => ({
            createCounter: (name: string) => ({
              add: (v: number, attrs: any) => counts.push({ name, v, attrs }),
            }),
          }),
        }),
      });
      try {
        const logger: any = new n.Logger({
          namespace: "test",
          platform: "owned",
          app: "app",
          server: "server",
          level: "WARN",
          mustLogTraced: true,
          isEncrypted: false,
          logCollectorAddr: `http://127.0.0.1:${(server.address() as any).port}/logs`,
        });
        assert.equal(logger.currentLevel, "warn");
        logger.info("filtered");
        logger.warn("accepted", { key: "yes" });
        logger.error("invalid attributes", { key: 5 });
        logger.updateLogRecorderAttributes({ updated: "yes" });
        assert.throws(
          () => logger.updateLogRecorderAttributes(null),
          /attributes is required/,
        );
        const span = {
          spanContext: () => ({
            traceId: "0123456789abcdef0123456789abcdef",
            spanId: "0123456789abcdef",
            traceFlags: 1,
          }),
          attributes: { "http.user_agent": "owned-agent" },
        };
        f.context.context.with(
          f.n.trace.setSpan(f.context.context.active(), span),
          () => logger.debug("sampled", { custom: "yes" }),
        );
        assert.throws(() => logger.method("unknown", "bad"), /not found/);
        logger.overrideConsole(); // Explicit owned console only.
        const circular: any = {};
        circular.self = circular;
        assert.equal(n.stringifyPlus(circular), '{"self":"[Circular self]"}');
        assert.equal(n.parseLevel("bad"), "trace");
        assert.equal(n.parseLevel(17), 17);
        await providers[0].forceFlush();
        const records = payloads
          .flatMap((p) =>
            p.resourceLogs.flatMap((r: any) =>
              r.scopeLogs.flatMap((s: any) => s.logRecords),
            ),
          )
          .map((r: any) => ({
            body: r.body.stringValue,
            severity: r.severityNumber,
            attrs: Object.fromEntries(
              r.attributes.map((a: any) => [a.key, a.value.stringValue]),
            ),
            traceId: r.traceId,
          }));
        assert.deepEqual(
          records.map((r) => r.body),
          ["accepted", "invalid attributes", "sampled"],
        );
        assert.equal(records[0]!.attrs.key, "yes");
        assert.equal(records[1]!.attrs.key, undefined);
        assert.equal(records[2]!.attrs.user_agent, "owned-agent");
        assert.equal(records[2]!.severity, 5);
        assert.equal(
          counts.filter((c) => c.name === "node_instrument_start").length,
          5,
        );
        assert.equal(
          counts.filter((c) => c.name === "node_instrument_end").length,
          3,
        );
        return { records, counts, printed };
      } finally {
        await Promise.all(providers.map((p) => p.shutdown()));
        f.context.context.disable();
        server.close();
        await once(server, "close");
      }
    },
  },
];

import assert from "node:assert/strict";
import * as http from "node:http";
import * as https from "node:https";
import * as crypto from "node:crypto";
import * as zlib from "node:zlib";
import { performance } from "node:perf_hooks";
import { once } from "node:events";
import { createNativeGalileoExporters } from "../../src/runtime/native-galileo-exporters.js";
import { createNativeOtlpExport } from "../../src/runtime/native-otlp-export.js";
import { createNativeOtlpHttp } from "../../src/runtime/native-otlp-http.js";
import { createNativeOtlpSerializers } from "../../src/runtime/native-otlp-serializers.js";
import { createNativeGalileoTransport } from "../../src/runtime/native-galileo-transport.js";
function fixture(factory: typeof createNativeGalileoExporters = createNativeGalileoExporters, env: any = {}) {
  const warnings: any[] = [],
    diag: any = {
      warn: (...a: any[]) => warnings.push(a),
      debug: () => {},
      error: () => {},
    };
  diag.createComponentLogger = () => diag;
  const modules: any = Object.fromEntries(
    [69700, 14515, 62207, 84992, 11440, 84746, 15086, 58611, 65692, 43106].map(
      (id) => [id, {}],
    ),
  );
  modules[2339] = { diag };
  const runtime = {
    exports: createNativeOtlpExport({ modules }),
    http: createNativeOtlpHttp({
      process: { env },
      diag,
      modules: { 58583: { DiagAPI: { instance: () => diag } } },
    }),
    serializers: createNativeOtlpSerializers({
      modules: { 32047: { otperformance: performance }, 70000: {} },
    }),
    transport: createNativeGalileoTransport({
      crypto,
      http,
      https,
      zlib,
      sdk: { SDK_VERSION: "unused-by-transport" },
    }),
  };
  return { n: factory(runtime) as any, warnings, runtime, diag };
}
const log = {
  resource: { attributes: { service: "owned" } },
  instrumentationScope: { name: "owned" },
  hrTime: [1, 2],
  hrTimeObserved: [1, 3],
  severityNumber: 9,
  severityText: "INFO",
  body: "owned log",
  attributes: {},
  droppedAttributesCount: 0,
};
const span = {
  resource: log.resource,
  instrumentationLibrary: { name: "owned" },
  spanContext: () => ({
    traceId: "0123456789abcdef0123456789abcdef",
    spanId: "0123456789abcdef",
  }),
  name: "owned span",
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
};
export const GALILEO_EXPORTERS_CASES: {
  name: string;
  run(factory: typeof createNativeGalileoExporters): Promise<any>;
}[] = [
  {
    name: "original trace and log exporters deliver via complete recovered HTTP export chain",
    async run(factory) {
      const received: any[] = [];
      const server = http.createServer(async (req, res) => {
        const parts = [];
        for await (const p of req) parts.push(p);
        let body = Buffer.concat(parts);
        if (req.headers["content-encoding"] === "gzip")
          body = zlib.gunzipSync(body);
        received.push({
          path: req.url,
          userAgent: req.headers["user-agent"],
          contentType: req.headers["content-type"],
          owned: req.headers.owned,
          body: JSON.parse(body.toString()),
        });
        res.end("{}");
      });
      server.listen(0, "127.0.0.1");
      await once(server, "listening");
      const root = "http://127.0.0.1:" + (server.address() as any).port,
        f = fixture(factory, {
          OTEL_EXPORTER_OTLP_ENDPOINT: root,
          OTEL_EXPORTER_OTLP_COMPRESSION: "gzip",
        }),
        instances: any[] = [];
      try {
        for (const [Class, record] of [
          [f.n.GalileoEncryptedTraceExporter, span],
          [f.n.GalileoEncryptedLogExporter, log],
        ]) {
          const e = new Class(
            {
              headers: {
                Owned: "yes",
                "Content-Type": "wrong",
                "User-Agent": "wrong",
              },
            },
            { enabled: false },
          );
          instances.push(e);
          const r: any = await new Promise((resolve) =>
            e.export([record], resolve),
          );
          assert.equal(r.code, 0, r.error?.message);
          await e.forceFlush();
        }
        assert.deepEqual(
          received.map((r) => r.path),
          ["/v1/traces", "/v1/logs"],
        );
        assert.ok(
          received.every(
            (r) =>
              r.userAgent === "Galileo-Node-SDK/0.3.17-beta.1" &&
              r.contentType === "application/json" &&
              r.owned === "yes",
          ),
        );
        assert.equal(
          received[0].body.resourceSpans[0].scopeSpans[0].spans[0].name,
          "owned span",
        );
        assert.equal(
          received[1].body.resourceLogs[0].scopeLogs[0].logRecords[0].body
            .stringValue,
          "owned log",
        );
        return received;
      } finally {
        await Promise.all(instances.map((e) => e.shutdown()));
        await new Promise<void>((r) => server.close(() => r()));
      }
    },
  },
  {
    name: "constructors preserve signal endpoints timeout concurrency and validation",
    async run(factory) {
      const f = fixture(factory, {
          OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: "http://owned.invalid/trace",
          OTEL_EXPORTER_OTLP_LOGS_ENDPOINT: "http://owned.invalid/log",
          OTEL_EXPORTER_OTLP_TRACES_TIMEOUT: "123",
        }),
        trace = new f.n.GalileoEncryptedTraceExporter(
          { concurrencyLimit: 2 },
          { enabled: false },
        ),
        logs = new f.n.GalileoEncryptedLogExporter({}, { enabled: false });
      try {
        assert.equal(
          trace._delegate._transport.options.url,
          "http://owned.invalid/trace",
        );
        assert.equal(
          logs._delegate._transport.options.url,
          "http://owned.invalid/log",
        );
        assert.equal(trace._delegate._timeout, 123);
        assert.equal(trace._delegate._promiseQueue._concurrencyLimit, 2);
        assert.equal(
          trace._delegate._transport.getEncryptionInfo().encrypt,
          false,
        );
        assert.throws(
          () => new f.n.GalileoEncryptedTraceExporter({ timeoutMillis: 0 }),
          /timeoutMillis/,
        );
        assert.throws(
          () => new f.n.GalileoEncryptedLogExporter({ url: "bad" }),
          /export URL/,
        );
        assert.equal(f.n.sdk.SDK_VERSION, "0.3.17-beta.1");
        return {
          trace: trace._delegate._transport.options.url,
          logs: logs._delegate._transport.options.url,
          version: f.n.sdk.SDK_VERSION,
        };
      } finally {
        await trace.shutdown();
        await logs.shutdown();
      }
    },
  },
];

export { fixture as galileoExporterFixture };

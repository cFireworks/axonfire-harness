import assert from "node:assert/strict";
import * as http from "node:http";
import * as https from "node:https";
import * as crypto from "node:crypto";
import * as zlib from "node:zlib";
import { performance } from "node:perf_hooks";
import { once } from "node:events";
import { createNativeOtlpExport } from "../../src/runtime/native-otlp-export.js";
import { createNativeOtlpSerializers } from "../../src/runtime/native-otlp-serializers.js";
import { createNativeGalileoTransport } from "../../src/runtime/native-galileo-transport.js";
function fixture(factory: typeof createNativeOtlpExport) {
  const warnings: any[] = [],
    debug: any[] = [],
    modules: any = Object.fromEntries(
      [
        69700, 14515, 62207, 84992, 11440, 84746, 15086, 58611, 65692, 43106,
      ].map((id) => [id, {}]),
    );
  modules[2339] = {
    diag: {
      warn: (...a: any[]) =>
        warnings.push(a.map((v) => (v instanceof Error ? v.message : v))),
      createComponentLogger: () => ({
        debug: (...a: any[]) => debug.push(a),
        warn: (...a: any[]) =>
          warnings.push(a.map((v) => (v instanceof Error ? v.message : v))),
      }),
    },
  };
  return { native: factory({ modules }) as any, warnings, debug };
}
const result = (r: any) => ({
  code: r.code,
  error: r.error?.message,
  name: r.error?.name,
});
export const OTLP_EXPORT_CASES: {
  name: string;
  run(factory: typeof createNativeOtlpExport): Promise<any>;
}[] = [
  {
    name: "bounded export queue rejects overflow and flush waits for in-flight work",
    async run(factory) {
      const f = fixture(factory),
        out: any[] = [];
      let release: any,
        closed = false;
      const delegate = f.native.createOtlpNetworkExportDelegate(
          { concurrencyLimit: 1, timeoutMillis: 100 },
          {
            serializeRequest: () => new Uint8Array([1]),
            deserializeResponse: () => ({}),
          },
          {
            send: () => new Promise((r) => (release = r)),
            shutdown: () => (closed = true),
          },
        ),
        base = new f.native.OTLPExporterBase(delegate);
      base.export(["first"], (r: any) => out.push(result(r)));
      base.export(["second"], (r: any) => out.push(result(r)));
      assert.equal(out[0].error, "Concurrent export limit reached");
      let flushed = false;
      const flush = base.forceFlush().then(() => (flushed = true)),
        shutdown = base.shutdown();
      await Promise.resolve();
      assert.equal(flushed, false);
      assert.equal(closed, false);
      release({ status: "success" });
      await Promise.all([flush, shutdown]);
      assert.equal(closed, true);
      assert.equal(out[1].code, 0);
      return out;
    },
  },
  {
    name: "export result mapping preserves transport failures rejection and retryable status",
    async run(factory) {
      const f = fixture(factory),
        out = [];
      for (const status of ["failure", "retryable", "unknown", "reject"]) {
        const d = f.native.createOtlpNetworkExportDelegate(
          { concurrencyLimit: 2, timeoutMillis: 77 },
          { serializeRequest: () => new Uint8Array([1]) },
          {
            send: async (_p: any, budget: number) => {
              assert.equal(budget, 77);
              if (status === "reject") throw Error("rejected");
              return {
                status,
                error: status === "failure" ? Error("failed") : undefined,
              };
            },
            shutdown: () => {},
          },
        );
        out.push(
          await new Promise((r) => d.export([], (v: any) => r(result(v)))),
        );
        await d.forceFlush();
      }
      assert.deepEqual(
        out.map((v: any) => v.error),
        [
          "failed",
          "Export failed with retryable status",
          "Export failed with unknown error",
          "rejected",
        ],
      );
      return out;
    },
  },
  {
    name: "empty payload fails and synchronous serialization errors remain synchronous",
    async run(factory) {
      const f = fixture(factory);
      let calls = 0;
      const make = (serializeRequest: any) =>
        f.native.createOtlpNetworkExportDelegate(
          { concurrencyLimit: 1, timeoutMillis: 10 },
          { serializeRequest },
          {
            send: () => {
              calls++;
              return Promise.resolve({ status: "success" });
            },
          },
        );
      const out: any[] = [];
      make(() => null).export([], (r: any) => out.push(result(r)));
      assert.equal(out[0].error, "Nothing to send");
      assert.throws(
        () =>
          make(() => {
            throw Error("serialize");
          }).export([], () => {}),
        /serialize/,
      );
      assert.equal(calls, 0);
      return out;
    },
  },
  {
    name: "partial success and malformed success response warn without failing export",
    async run(factory) {
      const f = fixture(factory),
        out = [];
      for (const input of [
        '{"partialSuccess":{"rejectedSpans":2}}',
        '{"partialSuccess":{}}',
        "invalid",
      ]) {
        const d = f.native.createOtlpNetworkExportDelegate(
          { concurrencyLimit: 1, timeoutMillis: 10 },
          {
            serializeRequest: () => new Uint8Array(),
            deserializeResponse: (v: any) => JSON.parse(v),
          },
          { send: async () => ({ status: "success", data: input }) },
        );
        out.push(
          await new Promise((r) => d.export([], (v: any) => r(result(v)))),
        );
      }
      assert.deepEqual(out, [
        { code: 0, error: undefined, name: undefined },
        { code: 0, error: undefined, name: undefined },
        { code: 0, error: undefined, name: undefined },
      ]);
      assert.equal(f.warnings.length, 2);
      return { out, warnings: f.warnings };
    },
  },
  {
    name: "raw queue clears rejected promises and enforces explicit concurrency limit",
    async run(factory) {
      const f = fixture(factory),
        q = f.native.createBoundedQueueExportPromiseHandler({
          concurrencyLimit: 1,
        });
      let reject: any;
      const p = new Promise((_r, j) => (reject = j));
      q.pushPromise(p);
      assert.equal(q.hasReachedLimit(), true);
      assert.throws(
        () => q.pushPromise(Promise.resolve()),
        /Concurrency Limit reached/,
      );
      const flush = q.awaitAll();
      reject(Error("owned"));
      await assert.rejects(flush, /owned/);
      assert.equal(q.hasReachedLimit(), false);
      await q.awaitAll();
      return { cleared: true };
    },
  },
  {
    name: "actual exporter delegate serializes logs and flushes real loopback transport",
    async run(factory) {
      let received: any;
      const server = http.createServer(async (req, res) => {
        const chunks = [];
        for await (const p of req) chunks.push(p);
        received = JSON.parse(Buffer.concat(chunks).toString());
        res.end('{"partialSuccess":{"rejectedLogRecords":0}}');
      });
      server.listen(0, "127.0.0.1");
      await once(server, "listening");
      const f = fixture(factory),
        serializers = createNativeOtlpSerializers({
          modules: { 32047: { otperformance: performance }, 70000: {} },
        }),
        transport = createNativeGalileoTransport({
          crypto,
          http,
          https,
          zlib,
          sdk: { SDK_VERSION: "owned" },
        }),
        t = new transport.GalileoEncryptedOtlpHttpTransport(
          {
            url:
              "http://127.0.0.1:" + (server.address() as any).port + "/v1/logs",
            headers: () => ({ "Content-Type": "application/json" }),
            agentOptions: { keepAlive: true },
          },
          { enabled: false },
        ),
        d = f.native.createOtlpNetworkExportDelegate(
          { concurrencyLimit: 2, timeoutMillis: 2000 },
          serializers.logs,
          t,
        ),
        base = new f.native.OTLPExporterBase(d);
      try {
        const record = {
          resource: { attributes: { service: "owned" } },
          instrumentationScope: { name: "test" },
          hrTime: [1, 2],
          hrTimeObserved: [1, 3],
          severityNumber: 9,
          severityText: "INFO",
          body: "owned-log",
          attributes: {},
          droppedAttributesCount: 0,
        };
        const response = await new Promise((r) =>
          base.export([record], (v: any) => r(result(v))),
        );
        await base.forceFlush();
        assert.deepEqual(response, {
          code: 0,
          error: undefined,
          name: undefined,
        });
        assert.equal(
          received.resourceLogs[0].scopeLogs[0].logRecords[0].body.stringValue,
          "owned-log",
        );
        return { received, response, warnings: f.warnings };
      } finally {
        await base.shutdown();
        await new Promise<void>((r) => server.close(() => r()));
      }
    },
  },
];

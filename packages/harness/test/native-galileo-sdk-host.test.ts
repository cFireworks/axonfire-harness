import { test } from "node:test";
import assert from "node:assert/strict";
import * as http from "node:http";
import { createRequire } from "node:module";
import { once } from "node:events";
import { gunzipSync } from "node:zlib";
import { createNativeGalileoSdkHost } from "../src/runtime/native-galileo-sdk-host.js";
const require = createRequire(import.meta.url);
function options(endpoint: string) {
  const proc = Object.create(process);
  Object.defineProperty(proc, "env", { value: {} });
  const globals = Object.create(globalThis);
  globals.fetch = globalThis.fetch;
  return {
    registry: {},
    globals,
    process: proc,
    profilerSupport: {
      NODE_VERSION_SUPPORTED: false,
      MIN_NODE_VERSION: "18.0.0",
    },
    sdkOverrides: {
      TRACE_COLLECTOR_ADDR: endpoint,
      METRICS_COLLECTOR_ADDR: endpoint,
      METRICS_COLLECTOR_SG_ADDR: endpoint,
      LOG_COLLECTOR_ADDR: endpoint,
      OCP_ADDR: endpoint,
      OCP_SG_ADDR: endpoint,
    },
  };
}
const setupOptions = {
  app: "owned",
  server: "host",
  platform: "local",
  namespace: "Development",
  enableHTTP: true,
  enableTRPC: false,
  enableFetch: true,
  isEncrypted: false,
  filterIncomingRequest: (r: any) => r.url === "/otlp",
  traceConfig: {
    enable: true,
    processor: {
      enableTraceBody: false,
      sampler: { fraction: 1, enableParentSample: true },
    },
  },
};
test("public Galileo SDK host initializes real components and owns HTTP Fetch logs metrics polling and shutdown", async () => {
  const packets: any[] = [],
    headers: any[] = [];
  let pulls = 0;
  const collector = http.createServer(async (req, res) => {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    let raw = Buffer.concat(chunks);
    if (req.headers["content-encoding"] === "gzip") raw = gunzipSync(raw);
    const body = JSON.parse(raw.toString());
    res.setHeader("content-type", "application/json");
    if (body.object_name) {
      pulls++;
      res.end(
        '{"traces_config":{"processor":{"sampler":{"dyeing":[]}}},"metrics_config":{"processor":{"histogram_buckets":[]}}}',
      );
      return;
    }
    packets.push(body);
    res.end("{}");
  });
  collector.listen(0, "127.0.0.1");
  await once(collector, "listening");
  const app = http.createServer((req, res) => {
    headers.push(req.headers.traceparent);
    res.end("owned");
  });
  app.listen(0);
  await once(app, "listening");
  const endpoint = `http://127.0.0.1:${(collector.address() as any).port}/otlp`,
    o = options(endpoint),
    nativeHttp = require("http"),
    originalRequest = nativeHttp.request,
    originalEmit = nativeHttp.Server.prototype.emit,
    originalFetch = globalThis.fetch;
  let owner: ReturnType<typeof createNativeGalileoSdkHost> | undefined;
  try {
    const host = (owner = createNativeGalileoSdkHost(o));
    assert.equal(pulls, 0);
    await host.SetupGalileo(setupOptions);
    assert.equal(pulls, 1);
    const origin = `http://localhost:${(app.address() as any).port}`;
    await new Promise<void>((resolve, reject) =>
      require("http")
        .get(origin + "/node", (res: any) => {
          res.resume();
          res.on("end", resolve);
        })
        .on("error", reject),
    );
    assert.equal(
      await (await o.globals.fetch(origin + "/fetch")).text(),
      "owned",
    );
    const logger: any = new host.Logger({
      ...setupOptions,
      logCollectorAddr: endpoint,
    });
    logger.info("owned-log", { owned: "yes" });
    host.metrics.getMeter("host").createCounter("owned_counter").add(7);
    await host.forceFlush();
    const spans = packets.flatMap((p) =>
      (p.resourceSpans ?? []).flatMap((r: any) =>
        r.scopeSpans.flatMap((s: any) => s.spans),
      ),
    );
    assert.equal(spans.length, 4);
    assert.ok(headers.every((h) => typeof h === "string"));
    const logs = packets.flatMap((p) =>
      (p.resourceLogs ?? []).flatMap((r: any) =>
        r.scopeLogs.flatMap((s: any) => s.logRecords),
      ),
    );
    assert.ok(logs.some((r: any) => r.body.stringValue === "owned-log"));
    const metrics = packets.flatMap((p) =>
      (p.resourceMetrics ?? []).flatMap((r: any) =>
        r.scopeMetrics.flatMap((s: any) => s.metrics),
      ),
    );
    assert.ok(
      metrics.some(
        (m: any) =>
          m.name === "owned_counter" &&
          Number(m.sum.dataPoints[0].asDouble ?? m.sum.dataPoints[0].asInt) ===
            7,
      ),
    );
    const close = host.close();
    assert.equal(host.close(), close);
    await close;
    assert.equal(nativeHttp.request, originalRequest);
    assert.equal(nativeHttp.Server.prototype.emit, originalEmit);
    assert.equal(globalThis.fetch, originalFetch);
    assert.equal(o.globals.fetch.__galileoPatched, undefined);
    assert.equal(
      host.trace.getTracer("after").startSpan("noop").isRecording(),
      false,
    );
    assert.throws(() => new host.Logger(setupOptions), /closing/);
    await assert.rejects(host.SetupGalileo(setupOptions), /closing/);
  } finally {
    await owner?.close();
    app.close();
    collector.close();
    await Promise.all([once(app, "close"), once(collector, "close")]);
  }
});
test("SDK host close waits for in-flight remote setup and releases the resulting providers and patches", async () => {
  let respond!: () => void, entered!: () => void;
  const started = new Promise<void>((r) => (entered = r));
  const collector = http.createServer(async (req, res) => {
    for await (const _ of req) {
    }
    respond = () => res.end("{}");
    entered();
  });
  collector.listen(0, "127.0.0.1");
  await once(collector, "listening");
  const o = options(
      `http://127.0.0.1:${(collector.address() as any).port}/otlp`,
    ),
    nativeHttp = require("http"),
    before = nativeHttp.request;
  let setup: Promise<any> | undefined;
  let owner: ReturnType<typeof createNativeGalileoSdkHost> | undefined;
  try {
    const host = (owner = createNativeGalileoSdkHost(o));
    setup = host.SetupGalileo({ ...setupOptions, enableFetch: false });
    await started;
    let done = false;
    const closing = host.close().then(() => {
      done = true;
    });
    await Promise.resolve();
    assert.equal(done, false);
    respond();
    await setup;
    await closing;
    assert.equal(nativeHttp.request, before);
    assert.equal(host.metrics.getMeterProvider().forceFlush, undefined);
  } finally {
    respond?.();
    await setup;
    await owner?.close();
    collector.close();
    await once(collector, "close");
  }
});

test("SDK host preserves borrowed context and propagator and finishes cleanup after provider shutdown failure", async () => {
  const { createNativeExportContext } = await import(
    "../src/runtime/native-export-context.js"
  );
  const server = http.createServer(async (req, res) => {
    for await (const _ of req) {
    }
    res.end("{}");
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const o = options(`http://127.0.0.1:${(server.address() as any).port}/otlp`),
    borrowed: any = createNativeExportContext({
      registry: o.registry,
      modules: {
        90290: require("node:async_hooks"),
        24434: require("node:events"),
      },
    }),
    manager = new borrowed.AsyncLocalStorageContextManager().enable(),
    propagator = {
      inject() {},
      extract(c: any) {
        return c;
      },
      fields() {
        return [];
      },
    };
  borrowed.context.setGlobalContextManager(manager);
  borrowed
    .getModule(70647)
    .registerGlobal("propagation", propagator, borrowed.diag);
  let owner: ReturnType<typeof createNativeGalileoSdkHost> | undefined;
  const original = require("http").request;
  try {
    const host = (owner = createNativeGalileoSdkHost(o));
    await host.SetupGalileo({ ...setupOptions, enableFetch: false });
    const p = host.metrics.getMeterProvider(),
      shutdown = p.shutdown.bind(p);
    p.shutdown = async () => {
      await shutdown();
      throw Error("owned shutdown failure");
    };
    await assert.rejects(host.close(), AggregateError);
    assert.equal(require("http").request, original);
    assert.equal(borrowed.context._getContextManager(), manager);
    assert.equal(
      borrowed.getModule(70647).getGlobal("propagation"),
      propagator,
    );
  } finally {
    await owner?.close().catch(() => {});
    borrowed.context.disable();
    borrowed.getModule(70647).unregisterGlobal("propagation", borrowed.diag);
    server.close();
    await once(server, "close");
  }
});

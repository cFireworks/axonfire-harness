import assert from "node:assert/strict";
import { test } from "node:test";
import * as http from "node:http";
import { once } from "node:events";
import { gunzipSync } from "node:zlib";
import { galileoServiceFixture } from "../scripts/helpers/galileo-service-scenarios.js";
import { createNativeGalileoServiceModule } from "../src/runtime/native-galileo-service-module.js";
import { createNativeDi } from "../src/di/native-di.js";
import { diRuntime } from "../scripts/helpers/native-di-scenarios.js";
import { createNativeGalileoSdkHost } from "../src/runtime/native-galileo-sdk-host.js";

test("original GalileoService binds real SDK providers and delivers startup trace, logs and metrics", async () => {
  const packets: any[] = [];
  let pulls = 0;
  const server = http.createServer(async (req, res) => {
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
    } else {
      packets.push(body);
      res.end("{}");
    }
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const endpoint = `http://127.0.0.1:${(server.address() as any).port}`;
  const proc = Object.create(process);
  Object.defineProperty(proc, "env", { value: {} });
  const globals = Object.create(globalThis);
  globals.fetch = globalThis.fetch;
  let host: ReturnType<typeof createNativeGalileoSdkHost> | undefined,
    f: ReturnType<typeof galileoServiceFixture> | undefined;
  try {
    host = createNativeGalileoSdkHost({
      registry: {},
      globals,
      process: proc,
      profilerSupport: {
        NODE_VERSION_SUPPORTED: false,
        MIN_NODE_VERSION: "18.0.0",
      },
      sdkOverrides: {
        TRACE_COLLECTOR_ADDR: endpoint + "/v1/traces",
        METRICS_COLLECTOR_ADDR: endpoint + "/v1/metrics",
        METRICS_COLLECTOR_SG_ADDR: endpoint + "/v1/metrics",
        LOG_COLLECTOR_ADDR: endpoint + "/v1/logs",
        OCP_ADDR: endpoint + "/config",
        OCP_SG_ADDR: endpoint + "/config",
      },
    });
    const di = createNativeDi(diRuntime());
    f = galileoServiceFixture((runtime) => {
      runtime.modules[80699] = di;
      return createNativeGalileoServiceModule(
        { ...runtime, process: proc, Reflect: di.Reflect },
        host!,
      );
    });
    f.service.productManager.waitConfiguration = async () => ({
      galileo: {
        enable: true,
        endpoint,
        app: "owned",
        server: "service",
        patchName: "patch",
      },
    });
    const dependencies = f.service;
    const container = di.ContainerFactory.create(
      di.autoBind((bind: any) => {
        bind(f!.runtime.modules[9151].ProductManager).toConstantValue(
          dependencies.productManager,
        );
        bind(f!.runtime.modules[9151].ClientInfoProvider).toConstantValue(
          dependencies.clientInfoProvider,
        );
        bind(f!.runtime.modules[86482].AuthenticationManager).toConstantValue(
          dependencies.authenticationManager,
        );
        bind(f!.runtime.modules[92735].Logger).toConstantValue(
          dependencies.logger,
        );
        bind(f!.runtime.modules[92735].TracerProvider).toConstantValue(
          dependencies.tracerProvider,
        );
      }),
    );
    di.ContainerProvider.set(container);
    f.service = container.get(f.native.GalileoService);
    assert.notEqual(f.service, dependencies);
    assert.equal(container.get(f.native.GalileoServiceImpl), f.service);
    assert.ok(container.getAll(di.ApplicationLifecycle).includes(f.service));
    f.service.initialize();
    await f.service.waitReady();
    assert.equal(f.service.isReady(), true, JSON.stringify(f.warnings));
    assert.equal(pulls, 1);
    assert.equal(f.service.otelMeterProvider, host.metrics.getMeterProvider());
    assert.equal(
      f.service.otelTracerProvider,
      host.trace.getTracerProvider().getDelegate(),
    );
    f.service.addCounter("owned_service_count", 2);
    f.service.recordDuration("owned_service_duration", 12);
    f.service.logInfo("owned-service-log", { owned: "yes" });
    f.service.onStop();
    await f.service.shutdown(5000);
    const spans = packets.flatMap((p) =>
      (p.resourceSpans ?? []).flatMap((r: any) =>
        r.scopeSpans.flatMap((s: any) => s.spans),
      ),
    );
    const metrics = packets.flatMap((p) =>
      (p.resourceMetrics ?? []).flatMap((r: any) =>
        r.scopeMetrics.flatMap((s: any) => s.metrics),
      ),
    );
    const logs = packets.flatMap((p) =>
      (p.resourceLogs ?? []).flatMap((r: any) =>
        r.scopeLogs.flatMap((s: any) => s.logRecords),
      ),
    );
    assert.ok(
      spans.some((s: any) => s.name === "workbuddy.agent_cli.galileo.startup"),
    );
    assert.ok(metrics.some((m: any) => m.name === "owned_service_count"));
    assert.ok(metrics.some((m: any) => m.name === "owned_service_duration"));
    assert.ok(
      logs.some((l: any) => l.body?.stringValue === "owned-service-log"),
    );
    assert.ok(f.events.some((e) => e[0] === "unsubscribe"));
    assert.ok(f.events.some((e) => e[0] === "dispose"));
  } finally {
    f?.service.onStop();
    await host?.close();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});

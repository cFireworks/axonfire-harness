import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { createServer } from "node:http";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createNativeDi } from "../../src/di/native-di.js";
import { diRuntime } from "./native-di-scenarios.js";
import { createNativeExpress } from "../../src/http/native-express.js";
import { createNativeBackendFoundation } from "../../src/http/native-backend-foundation.js";
import { createNativeContainerBootstrap } from "../../src/di/native-container-bootstrap.js";
import {
  createNativeEventServices,
  EVENT_SERVICES_MODULES,
} from "../../src/runtime/native-event-services.js";
const require = createRequire(import.meta.url);
export async function eventServicesScenario(
  factory: typeof createNativeEventServices,
) {
  const temp = await mkdtemp(join(tmpdir(), "axon-events-")),
    proc = Object.create(process);
  proc.env = {
    CODEBUDDY_REMOTE_CONFIG_DISABLED: "true",
    WORKBUDDY_CONFIG_DIR: temp,
  };
  const frames: any[] = [];
  let received: () => void;
  const done = new Promise<void>((r) => {
    received = r;
  });
  const server = createServer(async (req, res) => {
    let body = "";
    for await (const chunk of req) body += chunk;
    frames.push({ headers: req.headers, events: JSON.parse(body) });
    res.end("{}");
    if (frames.length === 3) received();
  });
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  const origin = `http://127.0.0.1:${(server.address() as any).port}`;
  await writeFile(
    join(temp, "product.json"),
    JSON.stringify({
      endpoint: origin,
      deploymentType: "owned-product",
      date: "2020-01-01",
      commit: "owned-commit",
      config: { disabled: true },
      telemetry: {
        report: { standard: { enabled: true, headers: { "x-base": "base" } } },
      },
    }),
  );
  const di = createNativeDi({ ...diRuntime(), process: proc }),
    core = di.getModule(78842).default;
  di.ConfigUtil.getRaw().cell.logger.level = "error";
  const runtime = {
    di,
    globals: Object.create(globalThis),
    require,
    process: proc,
    basePath: temp,
    filename: join(temp, "bundle.js"),
  };
  const foundation = createNativeBackendFoundation(runtime),
    express = createNativeExpress(runtime),
    timers = new Set<any>();
  const host = factory({
    ...runtime,
    express,
    getModule: foundation.getModule,
    setTimeout(fn: any, ms: number) {
      const t = setTimeout(fn, ms);
      timers.add(t);
      return t;
    },
    clearTimeout(t: any) {
      timers.delete(t);
      clearTimeout(t);
    },
  });
  const ids = new Set<number>(EVENT_SERVICES_MODULES.map(([id]) => id));
  const loader = createNativeContainerBootstrap({
    di,
    configBasePath: temp,
    getModule: (id: number) =>
      ids.has(id) ? host.getModule(id) : foundation.getModule(id),
  });
  const container = di.ContainerFactory.create(core);
  let service: any, manager: any, subscription: any;
  try {
    for (const stage of [
      21280, 39066, 62309, 65903, 53879, 61488, 97619, 54387, 66892, 18707,
    ])
      container.load(loader.getModule(stage).default);
    di.ContainerProvider.set(container);
    const api = host.load(),
      product = foundation.getModule(9151);
    container
      .bind(api.EventExtraHeadersProvider)
      .toConstantValue({
        provide: async () => ({ "x-base": "extra", "x-extra": "owned" }),
      });
    manager = container.get(product.ProductManager);
    await manager.waitConfiguration();
    service = container.get(api.EventService);
    await service.initialize();
    const observed: string[] = [];
    subscription = service.onReport((event: any) =>
      observed.push(event.eventCode),
    );
    await service.reportSync("sync", { timestamp: Date.now(), value: "owned" });
    assert.equal(frames[0].headers["x-base"], "extra");
    assert.equal(frames[0].events[0].product, "owned-product");
    assert.equal(frames[0].events[0].commit, "owned-commit");
    assert.ok(typeof frames[0].events[0].timezone === "string");
    assert.ok(frames[0].events[0].reportDelay >= 0);
    await service.report(
      "a",
      { env: "strip" },
      { stripEnv: true, headers: { "x-group": "one", "x-base": "group" } },
    );
    await service.report(
      "b",
      { value: 2 },
      { headers: { "x-base": "group", "x-group": "one" } },
    );
    await service.report("c", { value: 3 }, { headers: { "x-group": "two" } });
    assert.equal(service.headeredBatches.size, 2);
    service.fireBatch();
    await done;
    assert.deepEqual(observed, ["a", "b", "c"]);
    const batches = frames
      .slice(1)
      .sort((a, b) => a.headers["x-group"].localeCompare(b.headers["x-group"]));
    assert.deepEqual(
      batches.map((b) => b.events.map((e: any) => e.eventCode)),
      [["a", "b"], ["c"]],
    );
    assert.equal(batches[0].headers["x-base"], "group");
    assert.equal(batches[1].headers["x-extra"], "owned");
    assert.equal(batches[0].events[0].env, undefined);
    proc.env.DISABLE_TELEMETRY = "0";
    await assert.rejects(
      service.reportSync("disabled", {}),
      /Telemetry is disabled/,
    );
    await service.report("disabled", {});
    assert.equal(observed.length, 3);
    return {
      sync: frames[0].events[0].eventCode,
      batches: batches.map((b) => b.events.map((e: any) => e.eventCode)),
      observed,
      product: frames[0].events[0].product,
    };
  } finally {
    subscription?.dispose();
    service?.onStop();
    for (const timer of timers) clearTimeout(timer);
    await manager?.promise;
    server.closeIdleConnections?.();
    await new Promise<void>((r) => server.close(() => r()));
    await container.unbindAllAsync();
    await foundation.closeContext();
    await rm(temp, { recursive: true, force: true });
  }
}

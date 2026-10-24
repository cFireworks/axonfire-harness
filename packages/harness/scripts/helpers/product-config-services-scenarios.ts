import { createServer } from "node:http";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createNativeDi } from "../../src/di/native-di.js";
import { diRuntime } from "./native-di-scenarios.js";
import { createNativeExpress } from "../../src/http/native-express.js";
import { createNativeBackendFoundation } from "../../src/http/native-backend-foundation.js";
import { createNativeContainerBootstrap } from "../../src/di/native-container-bootstrap.js";
import {
  createNativeProductConfigServices,
  PRODUCT_CONFIG_SERVICES_MODULES,
} from "../../src/runtime/native-product-config-services.js";
const require = createRequire(import.meta.url);
export async function productConfigServicesScenario(
  factory: typeof createNativeProductConfigServices,
) {
  const temp = await mkdtemp(join(tmpdir(), "axon-product-")),
    proc = Object.create(process);
  proc.env = {
    CODEBUDDY_REMOTE_CONFIG_DISABLED: "true",
    WORKBUDDY_CONFIG_DIR: temp,
    ACC_PRODUCT_CONFIG_V3: JSON.stringify({
      name: "environment",
      models: [{ id: "env", name: "env" }],
    }),
  };
  await writeFile(
    join(temp, "product.json"),
    JSON.stringify({
      name: "client",
      productName: "WorkBuddy",
      endpoint: "http://127.0.0.1:1/",
      config: { disabled: true },
      models: [{ id: "base", name: "base" }],
      agents: [],
      productFeatures: { CustomModelsJSON: true },
    }),
  );
  await writeFile(
    join(temp, "models.json"),
    JSON.stringify({
      models: [{ id: "custom", name: "custom", url: "http://127.0.0.1:2/v1" }],
      availableModels: ["custom"],
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
    express = createNativeExpress(runtime);
  const ids = new Set<number>(
    PRODUCT_CONFIG_SERVICES_MODULES.map(([id]) => id),
  );
  const host = factory({
    ...runtime,
    express,
    getModule: foundation.getModule,
  });
  const bootstrap = createNativeContainerBootstrap({
    di,
    configBasePath: temp,
    getModule(id: number) {
      return ids.has(id) ? host.getModule(id) : foundation.getModule(id);
    },
  });
  const container = di.ContainerFactory.create(core);
  let manager: any, server: any;
  try {
    for (const stage of [
      21280, 39066, 62309, 65903, 53879, 61488, 97619, 54387, 66892,
    ])
      container.load(bootstrap.getModule(stage).default);
    di.ContainerProvider.set(container);
    const api = host.load(),
      providers = host.getModule(55762);
    assert.equal(container.get(api.ProductConfigBasePath), temp);
    const client = container.get(providers.ClientProductProvider);
    const first = await client.provide();
    assert.equal(first.name, "client");
    await writeFile(
      join(temp, "product.json"),
      JSON.stringify({ name: "changed" }),
    );
    assert.equal(await client.provide(), first);
    const env = container.get(providers.EnvProductProvider);
    assert.equal((await env.provide({ current: {} })).models[0].id, "env");
    const legacy = env.getProductConfig(["ACC_PRODUCT_CONFIG"]);
    assert.equal(legacy, undefined);
    proc.env.ACC_PRODUCT_CONFIG = JSON.stringify({
      authentication: { secret: "owned" },
      models: [{ id: "legacy" }],
      name: "legacy",
    });
    assert.deepEqual(JSON.parse(env.getProductConfig(["ACC_PRODUCT_CONFIG"])), {
      name: "legacy",
    });
    const merger = container.get(api.ProductMerger);
    const telemetry = await merger.merge(
      {
        galileo: {
          enable: true,
          projectId: "p",
          endpoint: "http://owned",
          app: "a",
          server: "s",
        },
      },
      { galileo: { endpoint: "http://changed" } },
    );
    assert.equal(telemetry.galileo.enable, false);
    assert.equal(telemetry.galileo.projectId, undefined);
    manager = container.get(api.ProductManager);
    await manager.waitConfiguration();
    const config = manager.getCurrentConfiguration();
    assert.equal(config.name, "environment");
    assert.deepEqual(
      config.models.map((m: any) => m.id),
      ["custom"],
    );
    assert.ok(config.models.some((m: any) => m.id === "custom"));
    assert.equal(manager.getEndpoint(), "http://127.0.0.1:1");
    const custom = container.get(providers.CustomModelsProductProvider);
    assert.ok(custom.userConfigWatcher);
    await manager.sync();
    await manager.promise;
    assert.ok(
      manager
        .getCurrentConfiguration()
        .models.some((m: any) => m.id === "custom"),
    );
    custom.dispose();
    assert.equal(custom.userConfigWatcherPath, undefined);
    const requests: any[] = [];
    server = createServer((req, res) => {
      requests.push({
        url: req.url,
        product: req.headers[foundation.getModule(51147).PRODUCT.toLowerCase()],
      });
      res.setHeader("content-type", "application/json");
      res.end(
        JSON.stringify({
          data: { name: "owned cloud", models: [{ id: "cloud" }], agents: [] },
        }),
      );
    });
    await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
    const origin = `http://127.0.0.1:${server.address().port}`;
    const cloud = container.get(api.CloudProductManager);
    const remote = await cloud.fetch(origin + "/v3/config");
    assert.equal(remote.name, "owned cloud");
    api.setProductEndpointOverride({ resolve: () => origin });
    container.get(api.ProductEndpointHttpInterceptor).initialize();
    const rest = container.get(foundation.getModule(78824).RestOperations);
    const routed = await rest.get("/owned", { proxy: false });
    assert.equal(routed.data.data.name, "owned cloud");
    assert.equal(requests.at(-1).url, "/owned");
    assert.equal(requests.at(-1).product, "SaaS");
    return {
      name: config.name,
      models: config.models.map((m: any) => m.id),
      endpoint: manager.getEndpoint(),
      telemetryDisabled: telemetry.galileo.enable === false,
      clientCached: first.name,
    };
  } finally {
    await manager?.promise;
    if (server) {
      server.closeIdleConnections?.();
      await new Promise<void>((r) => server.close(() => r()));
    }
    await container.unbindAllAsync();
    await foundation.closeContext();
    await rm(temp, { recursive: true, force: true });
  }
}

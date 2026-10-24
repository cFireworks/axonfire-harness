import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdtemp, writeFile, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createNativeDi } from "../../src/di/native-di.js";
import { diRuntime } from "./native-di-scenarios.js";
import { createNativeExpress } from "../../src/http/native-express.js";
import { createNativeBackendFoundation } from "../../src/http/native-backend-foundation.js";
import { createNativeContainerBootstrap } from "../../src/di/native-container-bootstrap.js";
import {
  createNativeNodeLogging,
  NODE_LOGGING_MODULES,
} from "../../src/runtime/native-node-logging.js";
const require = createRequire(import.meta.url);
export async function nodeLoggingScenario(
  factory: typeof createNativeNodeLogging,
) {
  const temp = await mkdtemp(join(tmpdir(), "axon-logging-")),
    proc = Object.create(process);
  proc.env = {
    CODEBUDDY_REMOTE_CONFIG_DISABLED: "true",
    WORKBUDDY_CONFIG_DIR: temp,
  };
  await writeFile(
    join(temp, "product.json"),
    JSON.stringify({
      config: { disabled: true },
      log: { level: "Info", output: ["file"], upload: { enabled: false } },
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
  const ids = new Set<number>(NODE_LOGGING_MODULES.map(([id]) => id));
  const loader = createNativeContainerBootstrap({
    di,
    configBasePath: temp,
    getModule: (id: number) =>
      ids.has(id) ? host.getModule(id) : foundation.getModule(id),
  });
  const container = di.ContainerFactory.create(core);
  let manager: any, storage: any, subscription: any;
  try {
    for (const stage of [
      21280, 39066, 62309, 65903, 10352, 53879, 61488, 97619, 54387, 66892,
      30135, 18707, 57100,
    ])
      container.load(loader.getModule(stage).default);
    di.ContainerProvider.set(container);
    const product = foundation.getModule(9151),
      api = foundation.getModule(54899);
    container
      .bind(api.LoggerStoragePathProvider)
      .toConstantValue({ provide: () => join(temp, "logs") });
    manager = container.get(product.ProductManager);
    await manager.waitConfiguration();
    storage = container.get(api.LoggerStorageService);
    const logger = container.get(di.Logger);
    assert.ok(logger instanceof host.load().FileLogger);
    assert.notEqual(logger, container.get(di.Logger));
    logger.setContext("Owned");
    const observed: any[] = [];
    subscription = di.onLogEmitter.event((e: any) => observed.push(e));
    // Original save() uses UTC date folders, while collection bounds use local days.
    // This scenario tests writing/archiving across both date buckets, not date filtering.
    const logRange = {
      start: Date.now() - 86400000,
      end: Date.now() + 86400000,
    };
    logger.debug("filtered");
    logger.info("written", "child");
    await new Promise((r) => setImmediate(r));
    await storage.flush();
    storage.storeSync("sync", product.LogLevel.Error);
    const files = await storage.collectLogFiles(logRange);
    assert.ok(files.length >= 1);
    const text = (
      await Promise.all(
        files.map(([file]: [string, string]) => readFile(file, "utf8")),
      )
    ).join("\n");
    assert.match(text, /Workspace Path:/);
    assert.match(text, /written/);
    assert.match(text, /sync/);
    assert.doesNotMatch(text, /filtered/);
    assert.deepEqual(
      observed.map((e) => e.message),
      ["filtered", "written"],
    );
    const zip = await storage.retrieve(logRange);
    const bytes = await readFile(zip);
    assert.equal(bytes.readUInt32LE(0), 0x04034b50);
    await rm(zip);
    const upload = container.get(api.LoggerUploadService);
    assert.equal((await upload.upload({ start: 0, end: 0 })).success, false);
    upload.intervalTimer.cancel();
    const injector = container.get(
      foundation.getModule(97584).OtlpProxyAgentInjector,
    );
    proc.env.OTEL_EXPORTER_OTLP_PROXY_URL = "http://127.0.0.1:18080";
    const options: any = {};
    injector.attachIfNeeded(options, "https://owned.invalid");
    assert.ok(options.agent);
    options.agent.destroy();
    return {
      logger: logger.constructor.name,
      levels: observed.slice(0, 2).map((e) => e.level),
      files: true,
      zip: true,
      upload: false,
    };
  } finally {
    subscription?.dispose();
    await new Promise((r) => setImmediate(r));
    await storage?.flush();
    storage?.runOnceScheduler.dispose();
    for (const timer of timers) clearTimeout(timer);
    await manager?.promise;
    await container.unbindAllAsync();
    await new Promise((resolve) => setImmediate(resolve));
    await storage?.flush();
    storage?.runOnceScheduler.dispose();
    await foundation.closeContext();
    await rm(temp, { recursive: true, force: true });
  }
}

import { runInNewContext } from "node:vm";
import { createNativeCommonServices } from "../../src/runtime/native-common-services.js";
import assert from "node:assert/strict";
import { EventEmitter, once } from "node:events";
import { createRequire } from "node:module";
import { createNativeBackendFoundation } from "../../src/http/native-backend-foundation.js";
import { createNativeBackendServer } from "../../src/http/native-backend-server.js";
import { createNativeContainerBootstrap } from "../../src/di/native-container-bootstrap.js";
import { containerBootstrapFixture } from "./container-bootstrap-scenarios.js";
const require = createRequire(import.meta.url);
export async function commonServicesScenario(
  factory: typeof createNativeCommonServices,
) {
  const proc: any = new EventEmitter();
  Object.setPrototypeOf(proc, process);
  proc.env = {};
  proc.exit = () => {
    throw Error("Unexpected process exit");
  };
  let common: any,
    commonHost: any,
    memoryMB = 10,
    gcCount = 0,
    sequence = 0;
  const timers = new Map<number, { fn: () => void; interval: boolean }>();
  const timerApi = {
    setTimeout(fn: () => void) {
      const id = ++sequence;
      timers.set(id, { fn, interval: false });
      return id;
    },
    setInterval(fn: () => void) {
      const id = ++sequence;
      timers.set(id, { fn, interval: true });
      return id;
    },
    clearTimeout(id: number) {
      timers.delete(id);
    },
    clearInterval(id: number) {
      timers.delete(id);
    },
  };
  const globals = Object.assign(Object.create(globalThis), {
    Error: runInNewContext("Error"),
    gc: () => gcCount++,
  });
  Object.defineProperty(proc, "memoryUsage", {
    value: () => ({
      heapUsed: memoryMB * 1024 * 1024,
      heapTotal: 1024 * 1024 * 1000,
      rss: 0,
      external: 0,
      arrayBuffers: 0,
    }),
  });
  const quiet = { ...console, log() {}, info() {}, error() {} };
  let foundation: ReturnType<typeof createNativeBackendFoundation> | undefined;
  let server: any, container: any, app: any, ready: () => void;
  const listening = new Promise<void>((resolve) => {
    ready = resolve;
  });
  const loaded: number[] = [];
  const bootstrap = containerBootstrapFixture(
    createNativeContainerBootstrap,
    undefined,
    ({ di }) => {
      const api = foundation!.getModule(47005),
        mvc = foundation!.getModule(37819);
      class HeadersController {
        headers() {
          return api.Context.getRequest().headers;
        }
      }
      mvc.Controller("/owned")(HeadersController);
      mvc.Get("/headers")(
        HeadersController.prototype,
        "headers",
        Object.getOwnPropertyDescriptor(HeadersController.prototype, "headers"),
      );
      mvc.Json()(HeadersController.prototype, "headers");
      return {
        default: di.autoBind((bind: any) => {
          bind(api.ServerAware).toConstantValue({
            async setServer(value: any) {
              server = value;
              if (!server.listening) await once(server, "listening");
              ready();
            },
          });
        }),
      };
    },
    undefined,
    (id, { di }) => {
      if (![15062, 78824, 27371, 47005, 37819, 51147].includes(id)) return;
      foundation ??= createNativeBackendFoundation({
        di,
        globals: Object.create(globalThis),
        require,
        process: proc,
        console: quiet,
        basePath: process.cwd(),
      });
      loaded.push(id);
      if (id === 51147) {
        commonHost = factory({
          di,
          globals,
          http: foundation,
          express: foundation,
          process: proc,
          console: quiet,
          ...timerApi,
        });
        common = commonHost.load();
        return common;
      }
      return foundation.getModule(id);
    },
  );
  bootstrap.di.ConfigUtil.getRaw().cell.logger.level = "error";
  try {
    const pending = bootstrap.loader.start();
    container = await pending;
    assert.ok(container, JSON.stringify(bootstrap.errors));
    assert.deepEqual(loaded, [15062, 78824, 27371, 47005, 37819, 51147]);
    const resolve = foundation!.getModule;
    const api = resolve(47005),
      restApi = resolve(78824),
      pathApi = resolve(27371);
    bootstrap.di.ContainerProvider.set(container);
    assert.ok(container.get(api.Dispatcher) instanceof api.DispatcherImpl);
    const rest = container.get(restApi.RestOperations);
    assert.equal(rest, container.get(restApi.RestOperations));
    assert.equal(
      await container.get(pathApi.PathResolver).resolve("owned", "child"),
      "/owned/child",
    );
    const entry = createNativeBackendServer({
      process: proc,
      console: quiet,
      getModule(id: number) {
        return id === 50984 ? { container: pending } : resolve(id);
      },
    });
    entry.start();
    await listening;
    app = container.get(bootstrap.di.Application);
    const response = await rest.get(
      `http://127.0.0.1:${server.address().port}/health`,
      { proxy: false },
    );
    assert.equal(response.status, 200);
    assert.equal(response.data.status, "UP");
    const origin = `http://127.0.0.1:${server.address().port}`;
    const headers = await rest.get(origin + "/owned/headers", {
      headers: { [common.TRACE_ID_HEADER]: "owned-trace" },
    });
    assert.equal(
      headers.data[common.REQUEST_ID_HEADER.toLowerCase()],
      "owned-trace",
    );
    assert.equal(headers.config.proxy, false);
    const preserved = await rest.get(origin + "/owned/headers", {
      headers: {
        [common.TRACE_ID_HEADER]: "trace",
        [common.REQUEST_ID_HEADER]: "explicit",
      },
    });
    assert.equal(
      preserved.data[common.REQUEST_ID_HEADER.toLowerCase()],
      "explicit",
    );
    const generated = await rest.get(origin + "/owned/headers");
    assert.match(
      generated.data[common.REQUEST_ID_HEADER.toLowerCase()],
      /^[a-f0-9]{32}$/i,
    );
    const encryptor = container.get(common.Encryptor);
    assert.equal(
      await encryptor.decrypt(await encryptor.encrypt("owned 文本")),
      "owned 文本",
    );
    await assert.rejects(
      encryptor.decrypt("invalid"),
      /Invalid encrypted text/,
    );
    assert.equal(
      container
        .get(common.FileNameService)
        .history(new Date(2020, 0, 2, 3, 4).getTime()),
      "history_202001020304.md",
    );
    assert.equal(
      common.HashUtils.sha256("abc"),
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
    assert.equal(
      common.HashUtils.md5("abc"),
      "900150983cd24fb0d6963f7d28e17f72",
    );
    const patch = common.PatchUtils.generatePatch(
      1,
      2,
      "before\n",
      "after\n",
      "owned.txt",
    );
    assert.ok(patch.includes("-before") && patch.includes("+after"));
    const enhanced = container.get(common.EnhancedMemoryCleanup);
    globals.__errorCache = Array(150).fill("owned");
    enhanced.initialize();
    assert.equal(timers.size, 4);
    enhanced.performLogCleanup();
    assert.equal(globals.__errorCache.length, 100);
    enhanced.dispose();
    assert.equal(timers.size, 0);
    const { MemoryMonitor } = commonHost.getModule(59676);
    const monitor = new MemoryMonitor({
      thresholds: { mediumMB: 20, highMB: 30, criticalMB: 40 },
    });
    let cleaned = 0;
    monitor.registerCleanupHandler(() => cleaned++);
    monitor.startMonitoring();
    assert.equal(timers.size, 1);
    memoryMB = 35;
    [...timers.values()][0]!.fn();
    assert.equal(monitor.getHistory()[0].memoryPressure, "high");
    assert.equal(cleaned, 1);
    monitor.dispose();
    assert.equal(timers.size, 0);
    const alerts: string[] = [];
    memoryMB = 10;
    const smart = new common.SmartMemoryMonitor();
    smart.start((event: any) => alerts.push(event.level));
    const baseline = [...timers.entries()][0];
    assert.ok(baseline);
    timers.delete(baseline[0]);
    baseline[1].fn();
    memoryMB = 40;
    smart.performMemoryCheck();
    smart.performEmergencyCheck();
    smart.performEmergencyCheck();
    assert.deepEqual(alerts, ["warning", "warning", "critical", "recovered"]);
    smart.stop();
    assert.equal(timers.size, 0);
    const cleanup = container.get(common.MemoryCleanupService);
    let purged = 0,
      cleared = 0;
    cleanup.registerCacheManager({
      purgeStale() {
        purged++;
      },
      clear() {
        cleared++;
      },
    });
    cleanup.manualCleanup("light");
    cleanup.manualCleanup("standard");
    assert.equal(purged, 2);
    assert.equal(cleanup.getStats().cleanupCount, 3);
    cleanup.manualCleanup("aggressive");
    assert.equal(cleared, 1);
    cleanup.dispose();
    // Original aggressive cleanup schedules an untracked delayed GC; dispose does not cancel it.
    assert.equal(timers.size, 1);
    const delayed = [...timers.entries()][0];
    assert.ok(delayed);
    timers.delete(delayed[0]);
    delayed[1].fn();
    assert.equal(timers.size, 0);
    assert.ok(gcCount >= 3);
    assert.deepEqual(bootstrap.errors, []);
    await app.stop();
    return {
      loaded,
      alerts,
      cleaned,
      gcCount,
      status: response.status,
      health: response.data.status,
      state: container.get(bootstrap.di.ApplicationStateService).state,
    };
  } finally {
    app?.removeListeners("SIGINT");
    app?.removeListeners("SIGTERM");
    if (server) {
      server.closeIdleConnections?.();
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
    timers.clear();
    await foundation?.closeContext();
    await container?.unbindAllAsync();
  }
}

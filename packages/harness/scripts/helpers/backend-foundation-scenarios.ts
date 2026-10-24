import assert from "node:assert/strict";
import { EventEmitter, once } from "node:events";
import { createRequire } from "node:module";
import { createNativeBackendFoundation } from "../../src/http/native-backend-foundation.js";
import { createNativeBackendServer } from "../../src/http/native-backend-server.js";
import { createNativeContainerBootstrap } from "../../src/di/native-container-bootstrap.js";
import { containerBootstrapFixture } from "./container-bootstrap-scenarios.js";
const require = createRequire(import.meta.url);
export async function backendFoundationScenario(
  factory: typeof createNativeContainerBootstrap,
) {
  const proc: any = new EventEmitter();
  Object.setPrototypeOf(proc, process);
  proc.env = {};
  proc.exit = () => {
    throw Error("Unexpected process exit");
  };
  const quiet = { ...console, log() {}, info() {}, error() {} };
  let foundation: ReturnType<typeof createNativeBackendFoundation> | undefined;
  let server: any, container: any, app: any, ready: () => void;
  const listening = new Promise<void>((resolve) => {
    ready = resolve;
  });
  const loaded: number[] = [];
  const bootstrap = containerBootstrapFixture(
    factory,
    undefined,
    ({ di }) => {
      const api = foundation!.getModule(47005);
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
      if (
        ![
          15062, 78824, 27371, 47005, 37819, 51147, 67846, 66915, 79814, 61000,
          72018, 54463, 79896, 98776, 9151, 55762, 18629, 66467, 92735, 54834,
          86482, 14931, 23294, 83052, 24015,
        ].includes(id)
      )
        return;
      foundation ??= createNativeBackendFoundation({
        di,
        globals: Object.create(globalThis),
        require,
        process: proc,
        console: quiet,
        basePath: process.cwd(),
        filename: process.cwd() + "/owned-bundle.js",
      });
      loaded.push(id);
      return foundation.getModule(id);
    },
  );
  bootstrap.di.ConfigUtil.getRaw().cell.logger.level = "error";
  try {
    const pending = bootstrap.loader.start();
    container = await pending;
    assert.ok(container, JSON.stringify(bootstrap.errors));
    assert.deepEqual(
      loaded,
      [
        15062, 78824, 27371, 47005, 37819, 51147, 67846, 66915, 79814, 61000,
        72018, 54463, 79896, 98776, 9151, 55762, 18629, 66467, 92735, 54834,
        86482, 14931, 23294, 83052, 24015,
      ],
    );
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
    assert.deepEqual(bootstrap.errors, []);
    await app.stop();
    return {
      loaded,
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
    if (container && foundation) {
      const storage = container.get(
        foundation.getModule(54899).LoggerStorageService,
      );
      await new Promise((resolve) => setImmediate(resolve));
      await storage.flush();
      const upload = container.get(
        foundation.getModule(54899).LoggerUploadService,
      );
      await container.unbindAllAsync();
      await new Promise((resolve) => setImmediate(resolve));
      await storage.flush();
      storage.runOnceScheduler.dispose();
      upload.intervalTimer.cancel();
    }
    await foundation?.closeContext();
  }
}

import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createNativeHttpController } from "../../src/http/native-http-controller.js";
import assert from "node:assert/strict";
import { EventEmitter, once } from "node:events";
import { createRequire } from "node:module";
import { createNativeBackendFoundation } from "../../src/http/native-backend-foundation.js";
import { createNativeBackendServer } from "../../src/http/native-backend-server.js";
import { createNativeContainerBootstrap } from "../../src/di/native-container-bootstrap.js";
import { containerBootstrapFixture } from "./container-bootstrap-scenarios.js";
const require = createRequire(import.meta.url);
export async function httpControllerScenario(
  factory: typeof createNativeHttpController,
) {
  const basePath = await mkdtemp(join(tmpdir(), "axonfire-mvc-"));
  await writeFile(join(basePath, "owned.mustache"), "<p>{{name}}</p>");
  await writeFile(join(basePath, "owned.txt"), "owned file payload");
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
  let mvc: any;
  const bootstrap = containerBootstrapFixture(
    createNativeContainerBootstrap,
    undefined,
    ({ di }) => {
      const api = foundation!.getModule(47005);
      class OwnedController {
        async echo(id: any, query: any, body: any) {
          const current = api.Context.getCurrent();
          await new Promise<void>((resolve) => setImmediate(resolve));
          assert.equal(api.Context.getCurrent(), current);
          return { id, query, body };
        }
        document() {
          return { name: "<owned>" };
        }
        download() {
          return {};
        }
        fail() {
          throw new TypeError("owned failure");
        }
        caught(error: Error) {
          return { caught: error.message };
        }
      }
      mvc.Controller("/owned")(OwnedController);
      const p = OwnedController.prototype;
      mvc.Post("/:id")(p, "echo", Object.getOwnPropertyDescriptor(p, "echo"));
      mvc.Param("id")(p, "echo", 0);
      mvc.Query("q")(p, "echo", 1);
      mvc.Body()(p, "echo", 2);
      mvc.Json()(p, "echo");
      mvc.Header("x-owned", "mvc")(p, "echo");
      di.Reflect.defineMetadata(
        "design:paramtypes",
        [String, String, Object],
        p,
        "echo",
      );
      mvc.Get("/fail")(p, "fail", Object.getOwnPropertyDescriptor(p, "fail"));
      mvc.Json()(p, "fail");
      mvc.Get("/document")(
        p,
        "document",
        Object.getOwnPropertyDescriptor(p, "document"),
      );
      mvc.Html("owned.mustache")(p, "document");
      mvc.Get("/download")(
        p,
        "download",
        Object.getOwnPropertyDescriptor(p, "download"),
      );
      mvc.File("owned.txt")(p, "download");
      mvc.Catch(TypeError)(
        p,
        "caught",
        Object.getOwnPropertyDescriptor(p, "caught"),
      );
      mvc.Json()(p, "caught");
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
      if (![15062, 78824, 27371, 47005, 37819].includes(id)) return;
      foundation ??= createNativeBackendFoundation({
        di,
        globals: Object.create(globalThis),
        require,
        process: proc,
        console: quiet,
      });
      loaded.push(id);
      if (id === 37819) {
        mvc = factory({
          di,
          http: foundation,
          express: foundation,
          require,
          basePath,
        }).load();
        return mvc;
      }
      return foundation.getModule(id);
    },
  );
  bootstrap.di.ConfigUtil.getRaw().cell.logger.level = "error";
  bootstrap.di.ConfigUtil.getRaw().cell.mustache = {
    baseViewDir: ".",
    cache: true,
  };
  bootstrap.di.ConfigUtil.getRaw().cell.mvc.baseFileDir = ".";
  try {
    const pending = bootstrap.loader.start();
    container = await pending;
    assert.ok(container, JSON.stringify(bootstrap.errors));
    assert.deepEqual(loaded, [15062, 78824, 27371, 47005, 37819]);
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
    const echoes = await Promise.all(
      [1, 2].map(async (n) => {
        const r = await rest.post(
          origin + "/owned/" + n + "?q=query" + n,
          { n },
          { proxy: false },
        );
        assert.equal(r.headers["x-owned"], "mvc");
        return r.data;
      }),
    );
    assert.deepEqual(echoes, [
      { id: "1", query: "query1", body: { n: 1 } },
      { id: "2", query: "query2", body: { n: 2 } },
    ]);
    const caught = await rest.get(origin + "/owned/fail", { proxy: false });
    assert.deepEqual(caught.data, { caught: "owned failure" });
    const html = await rest.get(origin + "/owned/document", { proxy: false });
    assert.equal(html.data, "<p>&lt;owned&gt;</p>");
    const file = await rest.get(origin + "/owned/download", { proxy: false });
    assert.equal(file.data, "owned file payload");
    assert.deepEqual(bootstrap.errors, []);
    await app.stop();
    return {
      loaded,
      echoes,
      caught: caught.data,
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
    await foundation?.closeContext();
    await container?.unbindAllAsync();
    await rm(basePath, { recursive: true, force: true });
  }
}

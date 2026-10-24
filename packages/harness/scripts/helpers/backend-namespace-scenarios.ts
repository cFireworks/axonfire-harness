import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { EventEmitter } from "node:events";
import { createNativeBackendNamespace } from "../../src/di/native-backend-namespace.js";
import { createNativeBackendApplication } from "../../src/runtime/native-backend-application.js";
import { createNativeHttpHost } from "../../src/http/native-http-host.js";
import { createNativeContainerBootstrap } from "../../src/di/native-container-bootstrap.js";
import { containerBootstrapFixture } from "./container-bootstrap-scenarios.js";
const require = createRequire(import.meta.url);
type Factory = typeof createNativeBackendNamespace;
export const BACKEND_NAMESPACE_CASES = [
  {
    name: "original bootstrap loads real backend namespace and resolves application lifecycle and shared request context",
    async run(factory: Factory) {
      const proc: any = new EventEmitter(),
        events: string[] = [];
      proc.exit = (code: number) => events.push("exit:" + code);
      let appModule: any,
        http: ReturnType<typeof createNativeHttpHost> | undefined,
        namespace: any,
        app: any,
        container: any;
      const bootstrap = containerBootstrapFixture(
        createNativeContainerBootstrap,
        undefined,
        undefined,
        undefined,
        (id, { di }) => {
          if (id !== 15062) return;
          namespace = factory({
            require,
            getModule(parent: number) {
              if (parent === 93772 || parent === 96000) {
                appModule ??= createNativeBackendApplication({
                  di,
                  process: proc,
                });
                return appModule.getModule(parent);
              }
              if (parent === 30805) {
                http ??= createNativeHttpHost();
                return http.native.getModule(parent);
              }
              throw Error("Unexpected parent " + parent);
            },
          });
          class Lifecycle {
            initialize() {
              events.push("initialize");
            }
            onStart() {
              events.push("start");
            }
            onStop() {
              events.push("stop");
            }
          }
          di.Component(di.ApplicationLifecycle)(Lifecycle);
          return namespace.load();
        },
      );
      try {
        const pending = bootstrap.loader.start();
        await new Promise<void>((resolve) => setImmediate(resolve));
        bootstrap.release();
        container = await pending;
        assert.ok(container);
        bootstrap.di.ContainerProvider.set(container);
        const exports = namespace.load();
        assert.equal(exports, namespace.load());
        assert.equal(exports.Context, http!.BaseContext);
        assert.equal(exports.BackendApplication, appModule.BackendApplication);
        app = container.get(bootstrap.di.Application);
        assert.equal(app, container.get(exports.BackendApplication));
        assert.equal(proc.listenerCount("SIGTERM"), 0);
        await app.start();
        assert.equal(
          container.get(bootstrap.di.ApplicationStateService).state,
          "ready",
        );
        assert.deepEqual(events, ["initialize", "start"]);
        const values = await Promise.all(
          ["a", "b"].map((value) =>
            http!.run({}, {}, async (context: any) => {
              exports.Context.setAttr("owned", value);
              await new Promise<void>((resolve) => setImmediate(resolve));
              assert.equal(exports.Context.getCurrent(), context);
              return exports.Context.getAttr("owned");
            }),
          ),
        );
        assert.deepEqual(values, ["a", "b"]);
        await app.stop();
        assert.equal(
          container.get(bootstrap.di.ApplicationStateService).state,
          "stoped",
        );
        assert.deepEqual(events, ["initialize", "start", "stop"]);
        assert.deepEqual(bootstrap.errors, []);
        return { events, values, shared: true };
      } finally {
        app?.removeListeners("SIGINT");
        app?.removeListeners("SIGTERM");
        await http?.close();
        await container?.unbindAllAsync();
      }
    },
  },
  {
    name: "original backend crc32 helper delegates to Node crypto without an invented fallback",
    async run(factory: Factory) {
      const n = factory({ require });
      const run = (fn: () => any) => {
        try {
          return { ok: true, value: fn() };
        } catch (error: any) {
          return { ok: false, code: error.code };
        }
      };
      const expected = run(() =>
        require("node:crypto")
          .createHash("crc32")
          .update("owned", "utf8")
          .digest("hex"),
      );
      const actual = run(() => n.getModule(35306).crc32("owned"));
      assert.deepEqual(actual, expected);
      return actual;
    },
  },
];

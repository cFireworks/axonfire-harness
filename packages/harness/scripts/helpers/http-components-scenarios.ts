import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { EventEmitter, once } from "node:events";
import { createNativeDi } from "../../src/di/native-di.js";
import { diRuntime } from "./native-di-scenarios.js";
import { createNativeExpress } from "../../src/http/native-express.js";
import { createNativeHttpHost } from "../../src/http/native-http-host.js";
import { createNativeHttpComponents } from "../../src/http/native-http-components.js";
import { createNativeBackendApplication } from "../../src/runtime/native-backend-application.js";
import { createNativeBackendServer } from "../../src/http/native-backend-server.js";
const require = createRequire(import.meta.url);
type Factory = typeof createNativeHttpComponents;
export const HTTP_COMPONENTS_CASES = [
  {
    name: "full decorated HTTP graph resolves through original DI and serves parsed bodies, health and errors through original server",
    async run(factory: Factory) {
      const processSurface = Object.create(process);
      Object.defineProperty(processSurface, "env", {
        value: { NODE_ENV: "test" },
      });
      const logs: any[] = [],
        quiet = {
          ...console,
          error: (...a: any[]) => logs.push(a),
          log: () => {},
          info: () => {},
        };
      const di = createNativeDi({
          ...diRuntime(),
          process: processSurface,
          console: quiet,
        }),
        core = di.getModule(78842).default;
      di.ConfigUtil.getRaw().cell.logger.level = "error";
      const proc: any = new EventEmitter();
      proc.env = {};
      proc.exit = () => {
        throw Error("Unexpected process exit");
      };
      let http: ReturnType<typeof createNativeHttpHost> | undefined,
        server: any,
        container: any,
        app: any;
      try {
        http = createNativeHttpHost();
        const application = createNativeBackendApplication({
            di,
            process: proc,
          }),
          express = createNativeExpress({ require, process: processSurface });
        const components = factory({
            globals: Object.create(globalThis),
            di,
            require,
            express,
            process: processSurface,
            console: quiet,
            modules: {
              15062: { ...http.native.getModule(30805), ...application },
            },
          }),
          api = components.load();
        let ready: any;
        const listening = new Promise<void>((resolve) => {
          ready = resolve;
        });
        container = di.ContainerFactory.create(
          core,
          di.autoBind((bind: any) => {
            bind(api.HandlerAdapter).toConstantValue({
              priority: 10000,
              canHandle: async () => api.Context.getRequest().path === "/owned",
              async handle() {
                const context = api.Context.getCurrent();
                await new Promise<void>((resolve) => setImmediate(resolve));
                assert.equal(api.Context.getCurrent(), context);
                context.response.type("json");
                context.response.body = JSON.stringify({
                  body: context.request.body,
                  query: context.request.query,
                });
              },
            });
            bind(api.ServerAware).toConstantValue({
              async setServer(value: any) {
                server = value;
                if (!server.listening) await once(server, "listening");
                ready();
              },
            });
          }),
        );
        di.ContainerProvider.set(container);
        const dispatcher = container.get(api.Dispatcher);
        assert.ok(dispatcher instanceof api.DispatcherImpl);
        assert.equal(
          dispatcher.handlerMapping,
          container.get(api.HandlerMapping),
        );
        assert.equal(
          dispatcher.middlewareProvider,
          container.get(api.MiddlewareProvider),
        );
        const entry = createNativeBackendServer({
          process: proc,
          console: quiet,
          modules: {
            50984: { container: Promise.resolve(container) },
            71869: di.getModule(71869),
            15536: di.getModule(15536),
            20847: di.getModule(20847),
            31811: components.getModule(31811),
            36746: components.getModule(36746),
            98: components.getModule(98),
            47704: express.express,
          },
        });
        entry.start();
        await listening;
        app = container.get(di.Application);
        const origin = `http://127.0.0.1:${server.address().port}`;
        const responses = await Promise.all(
          [1, 2].map(async (value) => {
            const response = await fetch(origin + "/owned?value=" + value, {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ value }),
            });
            assert.equal(response.status, 200);
            assert.ok(response.headers.get("x-cell-trace-id"));
            return response.json();
          }),
        );
        assert.deepEqual(responses, [
          { body: { value: 1 }, query: { value: "1" } },
          { body: { value: 2 }, query: { value: "2" } },
        ]);
        const health = await fetch(origin + "/health");
        assert.equal(health.status, 200);
        const healthBody: any = await health.json();
        assert.equal(healthBody.status, "UP");
        const absent = await fetch(origin + "/absent");
        assert.equal(absent.status, 404);
        await absent.arrayBuffer();
        await app.stop();
        return {
          responses,
          healthStatus: healthBody.status,
          missingStatus: absent.status,
          middlewareCount: dispatcher.middlewareProvider.provide().length,
        };
      } finally {
        app?.removeListeners("SIGINT");
        app?.removeListeners("SIGTERM");
        if (server) {
          server.closeIdleConnections?.();
          await new Promise<void>((resolve) => server.close(() => resolve()));
        }
        await http?.close();
        await container?.unbindAllAsync();
      }
    },
  },
];

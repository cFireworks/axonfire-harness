import assert from "node:assert/strict";
import { EventEmitter, once } from "node:events";
import { createNativeBackendServer } from "../../src/http/native-backend-server.js";
import { createNativeBackendApplication } from "../../src/runtime/native-backend-application.js";
import { createNativeDi } from "../../src/di/native-di.js";
import { diRuntime } from "./native-di-scenarios.js";
import { nativeHttpFixture } from "./native-http-fixture.js";
import { expressFixture } from "./express-scenarios.js";
export const BACKEND_SERVER_CASES = [
  {
    name: "original backend server waits for DI, starts Application, serves real Express requests through native Dispatcher and notifies ServerAware",
    async run(factory: typeof createNativeBackendServer) {
      const globals = Object.create(globalThis);
      globals.cellProps = { cell: { server: { port: 0 } } };
      const di = createNativeDi({ ...diRuntime(), globals }),
        core = di.getModule(78842).default,
        proc: any = new EventEmitter(),
        events: string[] = [];
      proc.env = { SERVER__PORT: "0", SERVER__HOST: "127.0.0.1" };
      proc.exit = (code: number) => events.push("exit:" + code);
      createNativeBackendApplication({ di, process: proc });
      const h = nativeHttpFixture(),
        dispatcher = new h.C.DispatcherImpl();
      Object.assign(dispatcher, {
        logger: h.logger,
        middlewareProvider: new h.C.MiddlewareProvider([]),
        handlerExecutionChain: h.chain,
        handlerMapping: {
          async handle() {
            const context = h.context.getCurrent(),
              path = context.request.path;
            await new Promise<void>((resolve) => setImmediate(resolve));
            assert.equal(h.context.getCurrent(), context);
            if (path === "/fail") throw Error("owned");
            context.response.json({ path });
          },
        },
        errorHandlerProvider: {
          provide: () => [
            {
              canHandle: async () => true,
              handle: async (context: any) =>
                context.response.status(500).json({ error: "owned" }),
            },
          ],
        },
      });
      let server: any, ready: any, release: any;
      const listening = new Promise<void>((resolve) => {
          ready = resolve;
        }),
        containerPromise = new Promise((resolve) => {
          release = resolve;
        });
      const container = di.ContainerFactory.create(
        core,
        di.autoBind((bind: any) => {
          bind(h.host.native.getModule(31811).Dispatcher).toConstantValue(
            dispatcher,
          );
          bind(di.ApplicationLifecycle).toConstantValue({
            initialize() {
              events.push("initialize");
            },
            async onStart() {
              events.push("start");
            },
            onStop() {
              events.push("stop");
            },
          });
          bind(h.host.native.getModule(98).ServerAware).toConstantValue({
            async setServer(value: any) {
              server = value;
              events.push("server-aware");
              if (!server.listening) await once(server, "listening");
              ready();
            },
          });
        }),
      );
      const entry = factory({
        process: proc,
        console: { log: (message: string) => events.push(message) },
        modules: {
          50984: { container: containerPromise },
          71869: di.getModule(71869),
          15536: di.getModule(15536),
          20847: di.getModule(20847),
          31811: h.host.native.getModule(31811),
          36746: h.host.native.getModule(36746),
          98: h.host.native.getModule(98),
          47704: expressFixture(),
        },
      });
      let app: any;
      try {
        const activation = entry.start();
        assert.equal(entry.start(), activation);
        await Promise.resolve();
        assert.equal(server, undefined);
        release(container);
        await listening;
        await new Promise<void>((resolve) => setImmediate(resolve));
        assert.equal(di.ContainerProvider.provide(), container);
        app = container.get(di.Application);
        assert.equal(container.get(di.ApplicationStateService).state, "ready");
        assert.deepEqual(events, [
          "initialize",
          "start",
          "server-aware",
          "serve 0",
        ]);
        const origin = `http://127.0.0.1:${(server as any).address().port}`;
        const bodies = await Promise.all(
          ["/a", "/b"].map(async (path) => {
            const response = await fetch(origin + path);
            assert.equal(response.status, 200);
            return response.json();
          }),
        );
        assert.deepEqual(bodies, [{ path: "/a" }, { path: "/b" }]);
        const failure = await fetch(origin + "/fail");
        assert.equal(failure.status, 500);
        assert.deepEqual(await failure.json(), { error: "owned" });
        await app.stop();
        assert.equal(events.at(-1), "stop");
        return { events, bodies, failure: failure.status };
      } finally {
        app?.removeListeners("SIGINT");
        app?.removeListeners("SIGTERM");
        if (server) {
          server.closeIdleConnections?.();
          await new Promise<void>((resolve) => server.close(() => resolve()));
        }
        await h.close();
        await container.unbindAllAsync();
      }
    },
  },
];

import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { nativeHttpFixture } from "./native-http-fixture.js";
import { createNativeHttpRuntime } from "../../src/http/native-http-runtime.js";
import { createNativeHttpHost } from "../../src/http/native-http-host.js";
type Fixture = ReturnType<typeof nativeHttpFixture>;
type Scenario = {
  name: string;
  run(factory?: typeof createNativeHttpRuntime): Promise<any>;
};
const scenario = (
  name: string,
  run: (f: Fixture) => Promise<any>,
): Scenario => ({
  name,
  async run(factory) {
    const registry = (process as any).namespaces;
    const f = nativeHttpFixture(factory);
    assert.equal((process as any).namespaces, registry);
    try {
      return f.normalize(await run(f));
    } finally {
      await f.close();
      assert.equal(f.host.hookCount, 0);
      assert.equal((process as any).namespaces, registry);
    }
  },
});
const tick = () => new Promise<void>((resolve) => setImmediate(resolve));
function deferred() {
  let resolve!: (value?: any) => void;
  const promise = new Promise<any>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
export const NATIVE_HTTP_CASES: Scenario[] = [
  scenario(
    "owned HTTP construction failure disables its created hook without touching another parent",
    async (f) => {
      let disabled = 0;
      assert.throws(
        () =>
          createNativeHttpHost({
            modules: {
              7994: new Proxy(
                {},
                {
                  get() {
                    throw Error("owned configuration injection failed");
                  },
                },
              ),
            },
            sourceFactory(runtime: any) {
              const create = runtime.modules[90290].createHook;
              runtime.modules[90290].createHook = (callbacks: any) => {
                const hook = create(callbacks),
                  disable = hook.disable.bind(hook);
                hook.disable = () => {
                  disabled++;
                  return disable();
                };
                return hook;
              };
              return f.factory(runtime);
            },
          }),
        /owned configuration injection failed/,
      );
      assert.equal(disabled, 1);
      assert.equal(f.host.hookCount, 1);
      return true;
    },
  ),
  scenario(
    "source RouteProvider requires init and repeated init does not replace its first resolved Deferred promise",
    async (f) => {
      const p = new f.C.RouteProviderImpl(),
        first = { mapping: new Map(), errorMapping: new Map(), owned: "first" },
        second = { ...first, owned: "second" };
      let builds = 0,
        settled = false;
      p.routeBuilder = { build: async () => (++builds === 1 ? first : second) };
      const waiting = p.provide().then(() => {
        settled = true;
      });
      await Promise.resolve();
      assert.equal(settled, false);
      assert.equal(p.init(), undefined);
      assert.equal(await p.provide(), first);
      await waiting;
      p.init();
      await tick();
      assert.equal(p.route, second);
      assert.equal(await p.provide(), first);
      return true;
    },
  ),
  scenario(
    "source Value annotations expose all six exact original configuration keys without supplying defaults",
    async (f) => {
      assert.equal(f.host.configuration.length, 6);
      assert.ok(
        f.host.configuration.every((entry) => typeof entry.key === "string"),
      );
      assert.equal(
        f.host.configuration.find(
          (entry) => entry.component === "RequestMatcherImpl",
        )?.key,
        "cell.web.route.cacheSize",
      );
      assert.equal(
        f.host.configuration.find(
          (entry) => entry.component === "MvcHandlerAdapter",
        )?.key,
        "cell.mvc.path",
      );
      return f.host.configuration;
    },
  ),
  scenario(
    "source CLS non-promise runPromise failure keeps the original active-context leak until explicit exit",
    async (f) => {
      const ns = f.host.namespace,
        before = ns.active;
      assert.throws(() => ns.runPromise(() => 1), /fn must return a promise/);
      assert.notEqual(ns.active, before);
      ns.exit(ns.active);
      assert.equal(ns.active, before);
      return true;
    },
  ),
  scenario(
    "owned HTTP close waits for its existing jobs before disabling hooks and rejects new admission",
    async (f) => {
      const gate = deferred(),
        started = deferred();
      const job = f.run(async () => {
        started.resolve();
        await gate.promise;
        return f.context.getRequest().path;
      });
      await started.promise;
      let closed = false;
      const closing = f.close().then(() => {
        closed = true;
      });
      assert.equal(f.host.hookCount, 1);
      assert.throws(() => f.run(() => 1), /host is closed/);
      await Promise.resolve();
      assert.equal(closed, false);
      gate.resolve();
      assert.equal(await job, "/owned");
      await closing;
      assert.equal(f.host.hookCount, 0);
      return true;
    },
  ),
  scenario(
    "source HTTP Context and CLS isolate process registry and retain exact scope enum",
    async (f) => {
      const globalRegistry = (process as any).namespaces;
      assert.deepEqual(f.host.AttributeScope, {
        0: "App",
        1: "Request",
        2: "Session",
        App: 0,
        Request: 1,
        Session: 2,
      });
      assert.equal(Object.getPrototypeOf(f.context), f.host.BaseContext);
      assert.equal((process as any).namespaces, globalRegistry);
      assert.equal(f.host.hookCount, 1);
      assert.equal(
        f.host.namespace.name,
        "3f45efdf-383c-4152-877b-1e98a410e0da",
      );
      return Object.keys(f.C).sort();
    },
  ),
  scenario(
    "source Context preserves truthy Request/Session/App fallback and explicit App zero quirk",
    async (f) =>
      f.run(async () => {
        const S = f.host.AttributeScope;
        f.context.setAttr("key", "app", S.App);
        f.context.setSession({ key: "session" });
        f.context.setAttr("key", false, S.Request);
        assert.equal(f.context.getAttr("key"), "session");
        assert.equal(f.context.getAttr("key", S.App), "session");
        assert.equal(f.context.getAttr("key", S.Request), false);
        assert.equal(f.host.BaseContext.getAttr("key", S.App), "app");
        f.context.setAttr("key", "changed", S.Session);
        assert.equal(f.context.getSession().key, "changed");
        f.host.BaseContext.setAttr(
          "baseSession",
          "request-property",
          S.Session,
        );
        assert.equal(
          f.context.getAttr("baseSession", S.Request),
          "request-property",
        );
        assert.equal(f.context.getAttr("baseSession", S.Session), undefined);
        return true;
      }),
  ),
  scenario(
    "source Web Context implicit reads without HTTP session still throw rather than normalize it",
    async (f) =>
      f.host.run(f.request(), f.response(), async () => {
        assert.throws(() => f.context.getAttr("missing"), TypeError);
        assert.equal(
          f.context.getAttr("missing", f.host.AttributeScope.Request),
          undefined,
        );
        return true;
      }),
  ),
  scenario(
    "source CLS keeps concurrent request objects distinct across promises and immediates",
    async (f) => {
      const release = deferred(),
        entered = deferred(),
        out: any[] = [];
      const a = f.run(async () => {
        out.push(f.context.getRequest().path);
        entered.resolve();
        await release.promise;
        await tick();
        out.push(f.context.getRequest().path);
        return "a";
      }, f.request("/a"));
      await entered.promise;
      const b = f.run(async () => {
        await tick();
        out.push(f.context.getRequest().path);
        release.resolve();
        return "b";
      }, f.request("/b"));
      assert.deepEqual(await Promise.all([a, b]), ["a", "b"]);
      assert.deepEqual(out, ["/a", "/b", "/a"]);
      return out;
    },
  ),
  scenario(
    "source bind retains registration context, this and error context without promise wrapping",
    async (f) => {
      let bound: any;
      await f.run(async () => {
        bound = f.context.bind(function (this: any, n: number) {
          if (n < 0) throw Error("owned bound error");
          return [f.context.getRequest().path, this.owned, n];
        });
      }, f.request("/registered"));
      const result = await f.run(
        async () => bound.call({ owned: true }, 2),
        f.request("/caller"),
      );
      assert.deepEqual(result, ["/registered", true, 2]);
      try {
        bound(-1);
        assert.fail();
      } catch (error) {
        assert.equal(
          f.host.namespace.fromException(error).CurrentContextRequest.request
            .path,
          "/registered",
        );
      }
      return result;
    },
  ),
  scenario(
    "source CLS bindEmitter restores listener registration request on a real owned EventEmitter",
    async (f) => {
      const emitter = new EventEmitter();
      let captured: any;
      f.host.namespace.bindEmitter(emitter);
      await f.run(async () => {
        emitter.on("owned", function (this: any, value: any) {
          captured = [f.context.getRequest().path, this === emitter, value];
        });
      }, f.request("/registered"));
      await f.run(async () => emitter.emit("owned", 7), f.request("/emitter"));
      emitter.removeAllListeners();
      assert.deepEqual(captured, ["/registered", true, 7]);
      return captured;
    },
  ),
  scenario(
    "source Context.run returns undefined while its real CLS promise runs asynchronously",
    async (f) => {
      const finished = deferred();
      const result = f.context.run(async () => {
        f.context.setCurrent(new f.context(f.request("/run"), f.response()));
        await tick();
        finished.resolve(f.context.getRequest().path);
      });
      assert.equal(result, undefined);
      assert.equal(await finished.promise, "/run");
      await tick();
      return true;
    },
  ),
  scenario(
    "source destroyNamespace tombstones registry without disabling its active async hook",
    async (f) => {
      const name = f.host.namespace.name;
      f.native.cls.destroyNamespace(name);
      assert.equal(f.native.cls.getNamespace(name), null);
      assert.equal(f.host.hookCount, 1);
      assert.equal(
        await f.run(async () => f.context.getRequest().path),
        "/owned",
      );
      return true;
    },
  ),
  scenario(
    "source compose retains onion order and rejects duplicate next",
    async (f) => {
      const order: string[] = [],
        compose = f.native.getModule(93326).compose;
      await compose([
        {
          handle: async (_c: any, next: any) => {
            order.push("a+");
            await next();
            order.push("a-");
          },
        },
        {
          handle: async (_c: any, next: any) => {
            order.push("b+");
            await next();
            order.push("b-");
          },
        },
      ])(
        {},
        {
          handle: async () => {
            order.push("end");
          },
        },
      );
      assert.deepEqual(order, ["a+", "b+", "end", "b-", "a-"]);
      await assert.rejects(
        compose([
          {
            handle: async (_c: any, next: any) => {
              await next();
              await next();
            },
          },
        ])({}, undefined),
        /next\(\) called multiple times/,
      );
      return order;
    },
  ),
  scenario(
    "source compose preserves synchronous returns and synchronous throws",
    async (f) => {
      const compose = f.native.getModule(93326).compose;
      assert.equal(compose([{ handle: () => 42 }])({}, undefined), 42);
      assert.throws(
        () =>
          compose([
            {
              handle: () => {
                throw Error("owned sync");
              },
            },
          ])({}, undefined),
        /owned sync/,
      );
      return true;
    },
  ),
  scenario(
    "source MiddlewareProvider excludes nonpositive priorities, stable-ties and caches once",
    async (f) => {
      const input = [
          { priority: 0, id: "zero" },
          { priority: 2, id: "a" },
          { priority: 2, id: "b" },
          { priority: -1, id: "negative" },
          { id: "missing" },
        ],
        p = new f.C.MiddlewareProvider(input);
      const first = p.provide();
      input.push({ priority: 3, id: "late" });
      assert.equal(p.provide(), first);
      assert.deepEqual(
        first.map((x: any) => x.id),
        ["a", "b"],
      );
      return first;
    },
  ),
  scenario(
    "source HandlerMapping continues only handle-time NotFoundAndContinue and retains last error",
    async (f) =>
      f.run(async () => {
        const E = f.native.getModule(34935).NotFoundAndContinueError,
          seen: string[] = [];
        const mapping = new f.C.HandlerMappingImpl([
          {
            priority: 3,
            canHandle: async () => true,
            handle: async () => {
              seen.push("first");
              throw new E("owned miss");
            },
          },
          {
            priority: 2,
            canHandle: async () => true,
            handle: async () => {
              seen.push("second");
            },
          },
        ]);
        await mapping.handle();
        assert.deepEqual(seen, ["first", "second"]);
        const only = new f.C.HandlerMappingImpl([
          {
            priority: 1,
            canHandle: async () => true,
            handle: async () => {
              throw new E("last owned miss");
            },
          },
        ]);
        await assert.rejects(only.handle(), /last owned miss/);
        return seen;
      }),
  ),
  scenario(
    "source HandlerMapping canHandle rejection is not treated as continue",
    async (f) =>
      f.run(async () => {
        let second = false;
        const E = f.native.getModule(34935).NotFoundAndContinueError,
          m = new f.C.HandlerMappingImpl([
            {
              priority: 2,
              canHandle: async () => {
                throw new E("owned matcher failure");
              },
            },
            {
              priority: 1,
              canHandle: async () => {
                second = true;
                return true;
              },
              handle: async () => {},
            },
          ]);
        await assert.rejects(m.handle(), /owned matcher failure/);
        assert.equal(second, false);
        return true;
      }),
  ),
  scenario(
    "source Dispatcher preserves error-handler fallback after a handler itself fails",
    async (f) =>
      f.run(async (ctx) => {
        const seen: string[] = [],
          d = new f.C.DispatcherImpl();
        Object.assign(d, {
          logger: f.logger,
          middlewareProvider: new f.C.MiddlewareProvider([]),
          handlerExecutionChain: f.chain,
          handlerMapping: {
            handle: async () => {
              throw Error("owned route error");
            },
          },
          errorHandlerProvider: {
            provide: () => [
              {
                canHandle: async () => true,
                handle: async () => {
                  seen.push("bad");
                  throw Error("owned error handler");
                },
              },
              {
                canHandle: async () => true,
                handle: async (c: any, e: any) => {
                  assert.equal(c, ctx);
                  seen.push(e.message);
                },
              },
            ],
          },
        });
        assert.equal(await d.dispatch(ctx), undefined);
        assert.deepEqual(seen, ["bad", "owned route error"]);
        return seen;
      }),
  ),
  scenario(
    "source RequestMatcher method gating, named paths, regex and bounded cache",
    async (f) =>
      f.run(async () => {
        assert.deepEqual(await f.matcher.match("/owned/:id", "post"), {
          id: "a%20b",
        });
        assert.equal(await f.matcher.match("/owned/:id", "GET"), false);
        assert.deepEqual(await f.matcher.match(/^\/owned\/(.+)$/), ["a%20b"]);
        assert.equal(f.matcher.caches.size, 1);
        f.matcher.cacheSize = 1;
        await f.matcher.match("/other");
        assert.equal(f.matcher.caches.size, 1);
        return true;
      }, f.request("/owned/a%20b")),
  ),
  scenario(
    "source PathResolver keeps prefix startsWith quirk and original URL joining",
    async (f) => {
      f.pathResolver.serverPath = "/api";
      const values = await Promise.all([
        f.pathResolver.resolve("/owned", "child"),
        f.pathResolver.resolve("/apix", "child"),
        f.pathResolver.resolve("https://owned.invalid/", "child"),
        f.pathResolver.resolve(),
      ]);
      assert.deepEqual(values, [
        "/api/owned/child",
        "/apix/child",
        "https://owned.invalid/child",
        "/api",
      ]);
      return values;
    },
  ),
  scenario(
    "source trace resolver uses request field before UUID and trace middleware publishes to Context",
    async (f) =>
      f.run(
        async (ctx) => {
          const resolver = new f.C.TraceIdResolverImpl();
          resolver.traceField = "x-trace";
          assert.equal(await resolver.resolve(), "incoming-owned");
          resolver.traceField = "missing";
          assert.equal(await resolver.resolve(), "owned-trace-id");
          const middleware = new f.C.TraceMiddleware();
          middleware.traceIdResolver = resolver;
          middleware.traceField = "x-owned-trace";
          await middleware.handle(ctx, async () => {
            assert.equal(f.context.getTraceId(), "owned-trace-id");
          });
          assert.equal(
            ctx.response.getHeader("x-owned-trace"),
            "owned-trace-id",
          );
          return true;
        },
        f.request("/owned", { headers: { "x-trace": "incoming-owned" } }),
      ),
  ),
  scenario(
    "source HttpMiddleware auto-ends body, but preserves skip and already-ended branches",
    async (f) => {
      const out: any[] = [];
      for (const flag of ["normal", "skip", "ended"]) {
        const res = f.response();
        res.body = "owned body";
        await f.run(
          async (ctx) => {
            const m = new f.C.HttpMiddleware();
            m.logger = f.logger;
            if (flag === "skip") f.context.setSkipAutoEnd(true);
            if (flag === "ended") res.writableEnded = true;
            await m.handle(ctx, async () => {});
            out.push(res.sent);
          },
          f.request(),
          res,
        );
      }
      assert.deepEqual(out, [["owned body"], [], []]);
      return out;
    },
  ),
  scenario(
    "source MVC real Body/Header resolvers feed controller, pipeline, view and response in order",
    async (f) =>
      f.run(async () => {
        const seen: any[] = [],
          target = {
            async run(body: any, headers: any) {
              seen.push(["controller", body, headers]);
              return { owned: "model" };
            },
          },
          r = f.route(target),
          { adapter } = f.mvc([r]);
        adapter.pipeManager = {
          apply: async (m: any, args: any[]) =>
            seen.push(["pipe", m.target === target, m.method, args[0]]),
        };
        adapter.viewResolver = {
          resolve: async (meta: any, model: any) =>
            seen.push(["view", meta === r, model]),
        };
        adapter.responseResolverProvider = {
          provide: () => [{ resolve: async () => seen.push(["response"]) }],
        };
        await adapter.handle();
        assert.equal(seen[0][0], "pipe");
        assert.equal(seen[1][0], "controller");
        assert.equal(seen[2][0], "view");
        assert.equal(seen[3][0], "response");
        return seen;
      }),
  ),
  scenario(
    "source MVC mapped error inherits view name and rethrows a failing error handler",
    async (f) =>
      f.run(async () => {
        const original = f.route(
            {
              run: async () => {
                throw Error("owned primary");
              },
            },
            "run",
            { viewMetadata: { viewName: "owned-view" } },
          ),
          errorRoute = f.route(
            { failed: async (error: any) => ({ message: error.message }) },
            "failed",
          ),
          { adapter } = f.mvc([original]);
        let model: any;
        adapter.routeMetadataMatcher.match = async (error?: any) =>
          error ? errorRoute : original;
        adapter.viewResolver = {
          resolve: async (_r: any, value: any) => {
            model = value;
          },
        };
        await adapter.handle();
        assert.equal(errorRoute.viewMetadata.viewName, "owned-view");
        assert.deepEqual(model, { message: "owned primary" });
        errorRoute.methodMetadata.target.failed = async () => {
          throw Error("owned error-handler failure");
        };
        await assert.rejects(adapter.handle(), /owned error-handler failure/);
        return model;
      }),
  ),
  scenario(
    "source RouteBuilder keeps specificity and original filtering of regex/nonpositive priorities",
    async (f) =>
      f.run(async () => {
        class OwnedController {
          run() {}
          wildcard() {}
          regex() {}
        }
        const target = new OwnedController(),
          key = f.native.getModule(90014).METADATA_KEY;
        f.define(key.controller, OwnedController, { path: "/owned" });
        f.define(key.controllerMethod, OwnedController, [
          { key: "wildcard", method: "POST", options: { path: "/*" } },
          { key: "regex", method: "POST", options: { path: /owned/ } },
          { key: "run", method: "POST", options: { path: "/fixed" } },
        ]);
        f.define(
          key.controllerBody,
          OwnedController,
          [{ parameterIndex: 0 }],
          "run",
        );
        const builder = new f.C.RouteBuilder();
        builder.controllers = [target];
        builder.pathResolver = f.pathResolver;
        const built = await builder.build(),
          paths = built.mapping.get("POST").map((r: any) => r.path);
        assert.deepEqual(paths, ["/owned/fixed", "/owned/*"]);
        assert.deepEqual(built.mapping.get("POST")[0].bodyMetadata, [
          { parameterIndex: 0 },
        ]);
        return paths;
      }),
  ),
  scenario(
    "source ViewResolver mutates cached view-name default and sets content type before render",
    async (f) =>
      f.run(async (ctx) => {
        const resolver = new f.C.ViewResolverImpl(),
          metadata = { viewMetadata: {} as any },
          seen: any[] = [];
        resolver.defaultViewName = "owned-view";
        resolver.viewProvider = new f.C.ViewProvider([
          {
            priority: 1,
            contentType: "text/owned",
            support: async (meta: any) => meta.viewName === "owned-view",
            render: async (model: any) => {
              seen.push([ctx.response.getHeader("Content-Type"), model]);
            },
          },
        ]);
        await resolver.resolve(metadata, { owned: true });
        assert.equal(metadata.viewMetadata.viewName, "owned-view");
        assert.deepEqual(seen, [["text/owned", { owned: true }]]);
        return seen;
      }),
  ),
];
for (const value of [0, "", false, null, undefined])
  NATIVE_HTTP_CASES.push(
    scenario(
      "source MVC falsy model skips view but still resolves response: " +
        String(value),
      async (f) =>
        f.run(async () => {
          let views = 0,
            responses = 0;
          const { adapter } = f.mvc([f.route({ run: async () => value })]);
          adapter.viewResolver = { resolve: async () => views++ };
          adapter.responseResolverProvider = {
            provide: () => [{ resolve: async () => responses++ }],
          };
          await adapter.handle();
          assert.equal(views, 0);
          assert.equal(responses, 1);
          return true;
        }),
    ),
  );

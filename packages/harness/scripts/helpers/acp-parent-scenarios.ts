import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { isDeepStrictEqual } from "node:util";
import { BehaviorSubject } from "rxjs";
import { distinctUntilChanged, map } from "rxjs/operators/index.js";
import { createNativeAcpParentPrimitives } from "../../src/protocol/native-acp-parent-primitives.js";
import { createNativeHttpRuntime } from "../../src/http/native-http-runtime.js";
const scenario = (
  name: string,
  operation: (f: ReturnType<typeof fixture>) => any,
) => ({
  name,
  async run(factory = createNativeAcpParentPrimitives) {
    const f = fixture(factory);
    try {
      return await operation(f);
    } finally {
      f.timers.clear();
    }
  },
});
function fixture(factory = createNativeAcpParentPrimitives) {
  const http = createNativeHttpRuntime(),
    timers = new Map<any, { run: () => void; ms: number }>(),
    calls: any[] = [],
    env: any = {};
  const n = factory({
    env,
    modules: {
      80699: { Deferred: http.getModule(8461).Deferred },
      67062: http.getModule(78627),
      29827: { BehaviorSubject },
      39983: { distinctUntilChanged },
      44093: { map },
      39023: { isDeepStrictEqual },
      33584: {
        default: {
          create: (config: any) => {
            calls.push(config);
            return { config };
          },
        },
      },
    },
    setInterval(run: () => void, ms: number) {
      const id = {
        unref() {
          calls.push("unref");
        },
      };
      timers.set(id, { run, ms });
      return id;
    },
    clearInterval(id: any) {
      timers.delete(id);
    },
  });
  const endpoint = () => new n.EndpointProviderImpl();
  function server() {
    let address: any = null;
    const e: any = new EventEmitter();
    e.address = () => address;
    e.listening = false;
    e.bind = (value: any) => {
      address = value;
      e.listening = true;
      e.emit("listening");
    };
    e.addressOnly = (value: any) => {
      address = value;
    };
    return e;
  }
  async function settle() {
    for (let i = 0; i < 30; i++) await Promise.resolve();
  }
  return {
    n,
    timers,
    calls,
    env,
    endpoint,
    server,
    settle,
    tick: async () => {
      for (const entry of [...timers.values()]) entry.run();
      await settle();
    },
  };
}
export const ACP_PARENT_CASES = [
  scenario(
    "source parent security tokens/constants and mandatory header clone",
    (f) => {
      const s = f.n.security,
        h = { "x-codebuddy-request": "0", owned: "yes" };
      assert.deepEqual(s.withSecurityHeader(h), {
        "x-codebuddy-request": "1",
        owned: "yes",
      });
      assert.equal(h["x-codebuddy-request"], "0");
      assert.deepEqual(s.withSecurityHeader(), { "x-codebuddy-request": "1" });
      assert.equal(s.DEFAULT_GATEWAY_PORT, 8321);
      assert.equal(s.DEFAULT_MAX_CONCURRENT, 3);
      assert.equal(s.DEFAULT_RATE_LIMIT_PER_MINUTE, 60);
      assert.equal(s.GATEWAY_PROTOCOL_VERSION, "1.0");
      assert.equal(typeof s.GatewayAuthMiddleware, "symbol");
      return true;
    },
  ),
  scenario(
    "source endpoint waits for bound server and keeps first Deferred result",
    async (f) => {
      const e = f.endpoint(),
        s = f.server();
      let ready = false;
      const p = e.get().then((v: any) => {
        ready = true;
        return v;
      });
      await f.settle();
      assert.equal(ready, false);
      s.bind({ port: 8041 });
      await e.setServer(s);
      assert.equal(await p, "http://127.0.0.1:8041");
      s.addressOnly({ port: 8042 });
      await e.setServer(s);
      assert.equal(await e.get(), "http://127.0.0.1:8041");
      return true;
    },
  ),
  scenario(
    "source endpoint listening event removes both listeners and polling timer",
    async (f) => {
      const e = f.endpoint(),
        s = f.server(),
        p = e.setServer(s);
      assert.equal(f.timers.size, 1);
      assert.equal([...f.timers.values()][0]!.ms, 10);
      s.bind({ port: 8041 });
      await p;
      assert.equal(f.timers.size, 0);
      assert.equal(s.eventNames().length, 0);
      return await e.get();
    },
  ),
  scenario(
    "source endpoint polling fallback notices address without event",
    async (f) => {
      const e = f.endpoint(),
        s = f.server(),
        p = e.setServer(s);
      s.addressOnly({ port: 8043 });
      await f.tick();
      await p;
      assert.equal(f.timers.size, 0);
      assert.equal(s.eventNames().length, 0);
      return await e.get();
    },
  ),
  scenario(
    "source endpoint error rejects setup, cleans resources and permits later binding",
    async (f) => {
      const e = f.endpoint(),
        s = f.server(),
        p = e.setServer(s),
        rejected = assert.rejects(p, /owned listen failure/);
      s.emit("error", Error("owned listen failure"));
      await rejected;
      assert.equal(f.timers.size, 0);
      assert.equal(s.eventNames().length, 0);
      s.bind({ port: 8044 });
      await e.setServer(s);
      return await e.get();
    },
  ),
  scenario(
    "source endpoint times out only after 51 ten-ms polls, not the fiftieth",
    async (f) => {
      const e = f.endpoint(),
        s = f.server(),
        p = e.setServer(s);
      let done = false;
      void p.then(
        () => {
          done = true;
        },
        () => {
          done = true;
        },
      );
      const rejection = assert.rejects(
        p,
        /Server address not available after 500ms/,
      );
      for (let i = 0; i < 50; i++) await f.tick();
      assert.equal(done, false);
      await f.tick();
      await rejection;
      assert.equal(f.timers.size, 0);
      assert.equal(s.eventNames().length, 0);
      return done;
    },
  ),
  scenario(
    "source endpoint listening-without-address and string socket are original errors",
    async (f) => {
      for (const value of [null, "owned.sock"]) {
        const s = f.server();
        s.listening = true;
        s.addressOnly(value);
        await assert.rejects(f.endpoint().setServer(s), /not bind to server/);
      }
      assert.equal(f.timers.size, 0);
      return true;
    },
  ),
  scenario(
    "source endpoint SERVER__HOST preserves empty fallback and raw unbracketed IPv6",
    async (f) => {
      const results = [];
      for (const host of ["", "0.0.0.0", "::1"]) {
        f.env.SERVER__HOST = host;
        const e = f.endpoint(),
          s = f.server();
        s.bind({ port: 8041 });
        await e.setServer(s);
        results.push(await e.get());
      }
      assert.deepEqual(results, [
        "http://127.0.0.1:8041",
        "http://0.0.0.0:8041",
        "http://::1:8041",
      ]);
      return results;
    },
  ),
  scenario(
    "source REST factory passes exact client config reference without merging",
    (f) => {
      const factory = new f.n.DefaultRestOperationsFactory(),
        config = { owned: { x: 1 } };
      factory.clientConfig = config;
      assert.equal(factory.create().config, config);
      assert.equal(factory.create().config, config);
      factory.clientConfig = undefined;
      assert.equal(factory.create().config, undefined);
      assert.equal(f.calls[0], config);
      return f.calls.length;
    },
  ),
  scenario(
    "source CLI options whitelist excludes cwd/print/undefined but retains null and shared arrays",
    (f) => {
      const c = new f.n.CliRuntimeOptions(),
        tools = ["Read"];
      c.set({
        cwd: "/owned",
        print: true,
        model: undefined,
        fallbackModel: null,
        tools,
        sessionPersistence: false,
      });
      assert.deepEqual(c.get(), {
        fallbackModel: null,
        tools,
        sessionPersistence: false,
      });
      assert.notEqual(c.get(), c.get());
      assert.equal(c.get().tools, tools);
      const copy = c.get();
      copy.model = "changed";
      assert.equal(c.get().model, undefined);
      return c.get();
    },
  ),
  scenario(
    "source CLI onDidChange compares full raw opts, including filtered fields",
    (f) => {
      const c = new f.n.CliRuntimeOptions(),
        seen: any[] = [];
      const sub = c.onDidChange.subscribe((v: any) => seen.push(v));
      c.set({ model: "owned", cwd: "/a" });
      c.set({ model: "owned", cwd: "/a" });
      c.set({ model: "owned", cwd: "/b" });
      sub.unsubscribe();
      assert.equal(seen.length, 3);
      assert.ok(seen.every((v) => v === undefined));
      assert.deepEqual(c.get(), { model: "owned" });
      return seen.length;
    },
  ),
  scenario(
    "source CLI raw shallow copy preserves in-place nested mutation equality quirk",
    (f) => {
      const c = new f.n.CliRuntimeOptions(),
        tools = ["Read"];
      let count = 0;
      const sub = c.onDidChange.subscribe(() => count++);
      c.set({ tools });
      tools.push("Write");
      c.set({ tools });
      sub.unsubscribe();
      assert.equal(count, 2);
      assert.deepEqual(c.get().tools, ["Read", "Write"]);
      return count;
    },
  ),
  scenario(
    "source CLI server error handler always handles and ends raw error message at 500",
    async (f) => {
      const h = new f.n.CliServerErrorHandler(),
        seen: any[] = [];
      h.logger = { error: (e: any) => seen.push(e.message) };
      const ctx: any = {
        response: { statusCode: 200, end: (body: any) => seen.push(body) },
      };
      assert.equal(h.priority, 2);
      assert.equal(await h.canHandle(ctx, Error("owned")), true);
      await h.handle(ctx, Error("owned message"));
      assert.equal(ctx.response.statusCode, 500);
      assert.deepEqual(seen, ["owned message", "owned message"]);
      return seen;
    },
  ),
];

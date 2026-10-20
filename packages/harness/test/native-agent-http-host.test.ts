import test from "node:test";
import assert from "node:assert/strict";
import { createServer, request as httpRequest } from "node:http";
import { setTimeout as delay } from "node:timers/promises";
import { BehaviorSubject } from "rxjs";
import { distinctUntilChanged, map } from "rxjs/operators/index.js";
import { isDeepStrictEqual } from "node:util";
import {
  createNativeAgentHttpHost,
  type NativeAgentHttpHostOptions,
} from "../src/http/native-agent-http-host.js";
import { createNativeAcpParentPrimitives } from "../src/protocol/native-acp-parent-primitives.js";

const capability = "owned-test-capability-never-product-account";
const headers = {
  authorization: "Bearer " + capability,
  "x-codebuddy-request": "1",
  "content-type": "application/json; charset=utf-8",
};
function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
function fixture(patch: Partial<NativeAgentHttpHostOptions> = {}) {
  const logs: any[] = [],
    calls: any[] = [];
  const logger = {
    info: (...args: any[]) => {
      logs.push(["info", ...args]);
    },
    error: (...args: any[]) => {
      logs.push(["error", ...args]);
    },
  };
  const host = createNativeAgentHttpHost({ logger, capability, ...patch });
  const parent = createNativeAcpParentPrimitives({
    modules: {
      80699: { Deferred: host.native.common.Deferred },
      67062: host.native.getModule(78627),
      29827: { BehaviorSubject },
      39983: { distinctUntilChanged },
      44093: { map },
      39023: { isDeepStrictEqual },
    },
  });
  const endpoint = new parent.EndpointProviderImpl();
  const errorHandler = new parent.CliServerErrorHandler();
  errorHandler.logger = logger;
  class Controller {
    async run(body: any, receivedHeaders: any) {
      const before = host.context.getRequest().get("acp-connection-id");
      if (body.delay) await delay(body.delay);
      const after = host.context.getRequest().get("acp-connection-id");
      calls.push({ before, after, receivedHeaders, body });
      return { before, after, body };
    }
    async getModels() {
      return { models: [{ id: "owned-test-model" }] };
    }
  }
  const controller = new Controller();
  const deps = {
    controller,
    sessionMiddleware: {
      priority: 1,
      async handle(_context: any, next: () => Promise<any>) {
        await next();
      },
    },
    views: [
      {
        priority: 100,
        contentType: "application/json; charset=utf-8",
        support: async (meta: any) => meta.viewName === "owned-json",
        async render(value: any) {
          host.context.getResponse().body = JSON.stringify(value);
        },
      },
    ],
    defaultViewName: "owned-json",
    errorHandlers: [errorHandler],
    pipeManager: {
      async apply(_target: any, args: any[]) {
        calls.push(["pipe", args.length]);
      },
    },
    endpointProvider: endpoint,
  };
  return { host, deps, calls, logs, endpoint, controller };
}
const post = (f: ReturnType<typeof fixture>, body: any, extra = {}) =>
  f.host.post(f.host.origin + "/internal/agent", body, {
    headers: { ...headers, ...extra },
    proxy: false,
  });

test("native agent HTTP validates local settings before allocating a namespace", () => {
  for (const patch of [
    { port: -1 },
    { port: 65536 },
    { port: 0.5 },
    { maxBodyBytes: 0 },
    { capability: "short" },
    { capability: "x".repeat(32) + "\n" },
  ])
    assert.throws(() =>
      createNativeAgentHttpHost({ logger: console, ...patch }),
    );
});
test("public parent HTTP starts once, uses source MVC/body/header/pipe/view and releases owned hooks", async () => {
  const f = fixture();
  try {
    const starting = f.host.start(f.deps);
    assert.equal(f.host.start(f.deps), starting);
    const origin = await starting;
    assert.match(origin, /^http:\/\/127\.0\.0\.1:\d+$/);
    assert.equal(await f.endpoint.get(), origin);
    const response = await post(
      f,
      { prompt: "中文😀" },
      { "acp-connection-id": "owned-a" },
    );
    assert.equal(response.status, 200);
    assert.deepEqual(JSON.parse(response.data), {
      before: "owned-a",
      after: "owned-a",
      body: { prompt: "中文😀" },
    });
    assert.deepEqual(f.calls[0], ["pipe", 2]);
    assert.equal(f.host.pendingDispatchCount, 0);
    assert.deepEqual(f.host.errors, []);
    assert.equal(f.host.native.Context.getCurrent(), undefined);
  } finally {
    await f.host.close();
  }
  assert.equal(f.host.listening, false);
  assert.equal(f.host.hookCount, 0);
  assert.equal(f.host.pendingTransportCount, 0);
  assert.equal(f.host.close(), f.host.close());
  await assert.rejects(f.host.start(f.deps), /closed/);
  await assert.rejects(post(f, {}), /closed/);
});
test("public parent HTTP registers the original GET models route too", async () => {
  const f = fixture();
  try {
    await f.host.start(f.deps);
    const response = await fetch(f.host.origin + "/internal/agent/models", {
      headers,
    });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      models: [{ id: "owned-test-model" }],
    });
  } finally {
    await f.host.close();
  }
});
test("source CLS context stays isolated across concurrent Node HTTP requests", async () => {
  const f = fixture();
  try {
    await f.host.start(f.deps);
    const values = await Promise.all([
      post(f, { delay: 20 }, { "acp-connection-id": "owned-one" }),
      post(f, { delay: 1 }, { "acp-connection-id": "owned-two" }),
    ]);
    assert.deepEqual(
      values.map((r) => {
        const v = JSON.parse(r.data);
        return [v.before, v.after];
      }),
      [
        ["owned-one", "owned-one"],
        ["owned-two", "owned-two"],
      ],
    );
  } finally {
    await f.host.close();
  }
});
test("local capability and original security header are both mandatory before dispatch", async () => {
  let dispatches = 0;
  const f = fixture({
    onDispatch() {
      dispatches++;
    },
  });
  try {
    await f.host.start(f.deps);
    for (const supplied of [
      {},
      { "x-codebuddy-request": "1" },
      { authorization: headers.authorization },
      { ...headers, authorization: "Bearer " + "x".repeat(capability.length) },
      { ...headers, "x-codebuddy-request": "0" },
    ] as const) {
      const response = await fetch(f.host.origin + "/internal/agent", {
        method: "POST",
        headers: supplied,
        body: "{}",
      });
      assert.equal(response.status, 403);
      await response.text();
    }
    assert.equal(dispatches, 0);
    assert.deepEqual(f.host.errors, []);
    assert.equal((await post(f, {})).status, 200);
    assert.equal(dispatches, 1);
  } finally {
    await f.host.close();
  }
});
test("malformed, non-object, wrong media and oversized bodies are bounded before MVC and do not poison next request", async () => {
  let dispatches = 0;
  const f = fixture({
    maxBodyBytes: 64,
    onDispatch() {
      dispatches++;
    },
  });
  try {
    await f.host.start(f.deps);
    for (const [body, type, status] of [
      ["{", "application/json", 400],
      ["null", "application/json", 400],
      ["[]", "application/json", 400],
      ["1", "application/json", 400],
      ["{}", "text/plain", 415],
      [JSON.stringify({ x: "x".repeat(65) }), "application/json", 413],
    ] as const) {
      const response = await fetch(f.host.origin + "/internal/agent", {
        method: "POST",
        headers: { ...headers, "content-type": type },
        body,
      });
      assert.equal(response.status, status);
      await response.text();
    }
    assert.equal(dispatches, 0);
    assert.deepEqual(f.host.errors, []);
    assert.equal((await post(f, { ok: true })).status, 200);
  } finally {
    await f.host.close();
  }
});
test("local HTTP transport rejects other origins, URL credentials, paths, query and fragment without starting fetch", async () => {
  const f = fixture();
  try {
    await f.host.start(f.deps);
    for (const target of [
      "http://127.0.0.1:1/internal/agent",
      f.host.origin + "/elsewhere",
      f.host.origin + "/internal/agent?x=1",
      f.host.origin + "/internal/agent#x",
      f.host.origin.replace("http://", "http://user@") + "/internal/agent",
      "not a URL",
    ])
      await assert.rejects(f.host.post(target, {}, { headers }));
    assert.equal(f.host.pendingTransportCount, 0);
    assert.equal(f.calls.length, 0);
    assert.equal((await post(f, {})).status, 200);
  } finally {
    await f.host.close();
  }
});
test("local HTTP refuses non-agent paths and verbs even with a valid capability", async () => {
  const f = fixture();
  try {
    await f.host.start(f.deps);
    for (const [path, method] of [
      ["/internal/other", "GET"],
      ["/internal/agent", "GET"],
      ["/internal/agent/models", "POST"],
      ["/internal/agent", "DELETE"],
    ] as const) {
      const response = await fetch(f.host.origin + path, { method, headers });
      assert.equal(response.status, 404);
      await response.text();
    }
    assert.equal(f.calls.length, 0);
  } finally {
    await f.host.close();
  }
});
test("source controller errors reach the borrowed original CliServerErrorHandler", async () => {
  const f = fixture();
  f.controller.run = async () => {
    throw Error("owned original controller failure");
  };
  try {
    await f.host.start(f.deps);
    await assert.rejects(post(f, {}), /owned original controller failure/);
    assert.deepEqual(
      f.host.errors,
      [],
      "original dispatcher handled the error",
    );
    assert.ok(f.logs.some((entry) => entry[0] === "error"));
  } finally {
    await f.host.close();
  }
});
test("failed source route construction rolls back namespace before listening", async () => {
  const f = fixture();
  Object.defineProperty(f.deps.controller, "constructor", {
    get() {
      throw Error("owned route build failure");
    },
  });
  await assert.rejects(f.host.start(f.deps), /owned route build failure/);
  assert.equal(f.host.state, "closed");
  assert.equal(f.host.listening, false);
  assert.equal(f.host.hookCount, 0);
  await f.host.close();
});
test("endpoint setup failure closes a bound listener and all namespace hooks", async () => {
  const f = fixture();
  f.deps.endpointProvider = {
    async setServer() {
      throw Error("owned endpoint failure");
    },
  };
  await assert.rejects(f.host.start(f.deps), /owned endpoint failure/);
  assert.equal(f.host.state, "closed");
  assert.equal(f.host.listening, false);
  assert.equal(f.host.hookCount, 0);
  await f.host.close();
});
test("occupied owned port fails startup without leaking namespace or closing borrowed listener", async () => {
  const occupied = createServer();
  await new Promise<void>((resolve) =>
    occupied.listen(0, "127.0.0.1", resolve),
  );
  const address = occupied.address();
  assert.ok(address && typeof address !== "string");
  const f = fixture({ port: address.port });
  try {
    await assert.rejects(
      f.host.start(f.deps),
      (e: any) => e.code === "EADDRINUSE",
    );
    assert.equal(occupied.listening, true);
    assert.equal(f.host.hookCount, 0);
    assert.equal(f.host.state, "closed");
  } finally {
    await f.host.close();
    await new Promise<void>((resolve) => occupied.close(() => resolve()));
  }
});
test("concurrent start and close cannot publish a running server after close", async () => {
  const f = fixture(),
    entered = deferred(),
    release = deferred();
  f.deps.endpointProvider = {
    async setServer() {
      entered.resolve();
      await release.promise;
    },
  };
  const starting = f.host.start(f.deps);
  const rejected = assert.rejects(starting, /startup cancelled/);
  await entered.promise;
  const closing = f.host.close();
  release.resolve();
  await Promise.all([rejected, closing]);
  assert.equal(f.host.state, "closed");
  assert.equal(f.host.listening, false);
  assert.equal(f.host.hookCount, 0);
});
test("two-stage shutdown refuses new admission while borrowed view finishes normally", async () => {
  const f = fixture(),
    entered = deferred(),
    release = deferred();
  const original = f.deps.views[0]!.render;
  f.deps.views[0]!.render = async (value: any) => {
    entered.resolve();
    await release.promise;
    await original(value);
  };
  try {
    await f.host.start(f.deps);
    const pending = post(f, {});
    await entered.promise;
    f.host.stopAccepting();
    await assert.rejects(post(f, {}), /closed/);
    const response = await fetch(f.host.origin + "/internal/agent", {
      method: "POST",
      headers,
      body: "{}",
    });
    assert.equal(response.status, 503);
    await response.text();
    release.resolve();
    assert.equal((await pending).status, 200);
  } finally {
    release.resolve();
    await f.host.close();
  }
  assert.equal(f.host.pendingDispatchCount, 0);
  assert.equal(f.host.pendingTransportCount, 0);
});
test("close cancels an incomplete incoming body without leaving a parsing promise", async () => {
  const entered = deferred();
  const f = fixture();
  try {
    await f.host.start(f.deps);
    const req = httpRequest(f.host.origin + "/internal/agent", {
      method: "POST",
      headers: { ...headers, "content-length": "100" },
    });
    req.on("error", () => {});
    req.on("socket", (socket) => socket.once("connect", entered.resolve));
    req.write("{");
    await entered.promise;
    // A response from another connection guarantees the listener has accepted IO.
    await post(f, {});
    await f.host.close();
    req.destroy();
    assert.equal(f.host.pendingDispatchCount, 0);
    assert.equal(f.host.hookCount, 0);
  } finally {
    await f.host.close();
  }
});

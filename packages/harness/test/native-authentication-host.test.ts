import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Subject } from "rxjs";
import { authenticationFixture } from "../scripts/helpers/authentication-fixture.js";
import { createNativeAuthenticationHost } from "../src/auth/native-authentication-host.js";
import { createNativeProductHost } from "../src/config/native-product-host.js";

const tick = () => new Promise<void>((done) => setImmediate(done));
function registries() {
  const make = () => ({
    entries: new Map<number, any[]>(),
    serial: 0,
    use(...callbacks: any[]) {
      const id = ++this.serial;
      this.entries.set(id, callbacks);
      return id;
    },
    eject(id: number) {
      this.entries.delete(id);
    },
  });
  return { request: make(), response: make() };
}

test("authentication host requires an explicit graph and preserves original constructors", async () => {
  assert.throws(
    () => createNativeAuthenticationHost({} as any),
    /explicit runtime/,
  );
  const f = authenticationFixture();
  try {
    assert.equal(f.manager.constructor, f.C.AuthenticationManagerImpl);
    assert.equal(f.storage.constructor, f.C.DefaultAuthenticationStorage);
    const c = f.custom();
    assert.equal(
      c.storage.constructor,
      f.C.CustomTokenAuthenticationStorageImpl,
    );
    assert.equal(c.provider.constructor, f.C.CustomTokenAuthenticationProvider);
    assert.deepEqual(
      f.providers,
      [f.provider],
      "creating a provider does not register or log it in",
    );
    assert.equal(await f.manager.getAuthenticationStorage(), f.storage);
    assert.equal(f.manager.currentSessionSubject.value, undefined);
  } finally {
    await f.close();
  }
});

test("public start observes original init once, resolves the actual barrier and rejects new admission after close", async () => {
  const f = authenticationFixture();
  let restores = 0;
  const restore = f.storage.restore;
  f.storage.restore = () => {
    restores++;
    return restore();
  };
  const first = f.host.start();
  assert.equal(f.host.start(), first);
  await first;
  await f.manager.initialized;
  assert.equal(restores, 1);
  assert.equal(f.manager.currentSessionSubject.value, undefined);
  const close = f.host.close();
  assert.equal(f.host.close(), close);
  await close;
  await assert.rejects(f.host.start(), /closed/);
  await assert.rejects(f.manager.login(), /closed/);
  assert.throws(() => f.custom(), /closed/);
  await f.close();
});

test("init failure rejects host start but does not fabricate settlement of original initialized", async () => {
  const f = authenticationFixture();
  let settled = false;
  f.manager.initialized.then(
    () => {
      settled = true;
    },
    () => {
      settled = true;
    },
  );
  f.storage.restore = async () => {
    throw Error("owned restore failure");
  };
  await assert.rejects(f.host.start(), /owned restore failure/);
  await f.settle();
  assert.equal(settled, false);
  assert.ok(
    f.logs.some((entry) => entry[0] === "warn" && /initialize/.test(entry[1])),
  );
  await f.close();
  assert.equal(settled, false);
  assert.deepEqual(f.host.errors, []);
});

test("an anonymous original waitAuthSession is not changed into a login or a shutdown blocker", async () => {
  const f = authenticationFixture();
  await f.host.start();
  let settled = false;
  void f.manager.waitAuthSession().then(() => {
    settled = true;
  });
  assert.equal(f.host.pendingCount, 0);
  await f.close();
  assert.equal(settled, false);
  assert.equal(f.host.subscriptionCount, 0);
  assert.equal(f.manager.currentSessionSubject.isStopped, true);
});

test("external and Wx config subscriptions are owned but the borrowed product subject stays open", async () => {
  const f = authenticationFixture();
  const before = f.product.configuration.observers.length;
  const external = f.external();
  const wx = f.host.createWx({ restOperations: {} });
  assert.equal(external.constructor, f.C.ExternalLinkAuthenticationProvider);
  assert.equal(wx.constructor, f.C.WxAuthenticationProvider);
  assert.equal(f.product.configuration.observers.length, before + 2);
  await f.host.close();
  assert.equal(f.product.configuration.observers.length, before);
  assert.equal(f.product.configuration.isStopped, false);
  assert.equal(f.host.subscriptionCount, 0);
  await f.close();
});

test("a rejected original browser open releases its leaked raw subscription on owner close", async () => {
  const f = authenticationFixture();
  const p = f.external(),
    urls = new Subject();
  p.externalUriOpener = {
    urlSubject: urls,
    open: async () => {
      throw Error("owned browser failure");
    },
  };
  await assert.rejects(
    p.openAuthUrl({ authUrl: "http://owned.invalid/login" }),
    /owned browser failure/,
  );
  assert.equal(
    urls.observers.length,
    1,
    "the source itself only unsubscribes after success",
  );
  await f.close();
  assert.equal(urls.observers.length, 0);
  assert.equal(urls.isStopped, false);
});

test("HTTP installation keeps source headers and only ejects the IDs owned by this host", async () => {
  const f = authenticationFixture(),
    interceptors = registries();
  const foreignRequest = interceptors.request.use(() => {}),
    foreignResponse = interceptors.response.use(() => {});
  f.manager.currentSessionSubject.next(f.session());
  const interceptor = f.host.installHttpInterceptor({ interceptors });
  assert.equal(interceptor.constructor, f.C.AuthenticationHttpInterceptor);
  const callback = interceptors.request.entries.get(2)![0],
    config = { headers: {} };
  assert.equal(callback(config), config);
  assert.equal(
    (config.headers as any).Authorization,
    "Bearer owned-opaque-token",
  );
  assert.equal(
    interceptor.isEndpointMatch(
      "http://owned.invalid",
      "http://owned.invalid.evil",
      "/x",
    ),
    true,
  );
  assert.equal(f.host.interceptorCount, 2);
  await f.close();
  assert.deepEqual([...interceptors.request.entries.keys()], [foreignRequest]);
  assert.deepEqual(
    [...interceptors.response.entries.keys()],
    [foreignResponse],
  );
  assert.equal(f.host.interceptorCount, 0);
  assert.throws(() => callback(config), /closed/);
});

test("partial HTTP installation failure still retains the successful ID for cleanup", async () => {
  const f = authenticationFixture(),
    interceptors = registries();
  interceptors.response.use = () => {
    throw Error("owned registry failure");
  };
  assert.throws(
    () => f.host.installHttpInterceptor({ interceptors }),
    /owned registry failure/,
  );
  assert.equal(f.host.interceptorCount, 1);
  await f.close();
  assert.equal(interceptors.request.entries.size, 0);
});

test("cleanup failure is aggregated after other subscriptions, timers and interceptor IDs are released", async () => {
  const f = authenticationFixture(undefined, {
      beforeClose: async () => {
        throw Error("owned transport close failure");
      },
    }),
    interceptors = registries();
  f.external();
  f.host.installHttpInterceptor({ interceptors });
  const eject = interceptors.request.eject.bind(interceptors.request);
  interceptors.request.eject = (id) => {
    eject(id);
    throw Error("owned eject failure");
  };
  await assert.rejects(f.close(), (error: any) => {
    assert.ok(error instanceof AggregateError);
    assert.deepEqual(
      error.errors.map((value: Error) => value.message),
      ["owned eject failure", "owned transport close failure"],
    );
    return true;
  });
  assert.equal(f.host.state, "closed");
  assert.equal(
    f.host.subscriptionCount + f.host.timerCount + f.host.interceptorCount,
    0,
  );
  assert.equal(interceptors.response.entries.size, 0);
  assert.equal(f.manager.currentSessionSubject.isStopped, true);
});

test("close waits accepted original restore without replacing its initialized barrier", async () => {
  const f = authenticationFixture(),
    pending = f.deferred();
  let entered = false,
    closed = false;
  f.storage.restore = async () => {
    entered = true;
    return pending.promise;
  };
  const starting = f.host.start();
  await f.settle();
  assert.equal(entered, true);
  const closing = f.host.close().then(() => {
    closed = true;
  });
  await tick();
  assert.equal(closed, false);
  pending.resolve(undefined);
  await Promise.all([starting, closing]);
  await f.manager.initialized;
  assert.equal(f.host.pendingCount, 0);
  await f.close();
});

test("original dispose cancels pending sign context and late login cannot commit on close", async () => {
  const f = authenticationFixture(),
    pending = f.deferred();
  await f.host.start();
  let context: any;
  f.provider.createSession = async (value: any) => {
    context = value;
    return pending.promise;
  };
  const login = f.manager.login();
  await f.settle();
  assert.equal(context.abortController.signal.aborted, false);
  const closing = f.host.close();
  await f.settle();
  assert.equal(context.abortController.signal.aborted, true);
  pending.resolve(f.session("late-owned-user"));
  await Promise.all([login, closing]);
  assert.equal(f.manager.currentSessionSubject.value, undefined);
  assert.equal(f.manager.disposed, true);
  assert.equal(f.host.pendingCount, 0);
  await f.close();
});

test("original long refresh timeout is canceled during owner close without an extra refresh", async () => {
  const f = authenticationFixture();
  await f.host.start();
  let refreshed = 0;
  f.provider.refreshSession = async (value: any) => {
    refreshed++;
    return value;
  };
  f.manager.currentSessionSubject.next(f.session());
  const scheduled = f.manager.scheduleRefreshSession(false);
  await f.settle();
  assert.ok(f.host.timerCount > 0);
  await f.close();
  await scheduled;
  assert.equal(refreshed, 0);
  assert.equal(f.host.timerCount + f.host.pendingCount, 0);
});

test("close preserves original provider polling sleep until its cancellation check can settle", async () => {
  const controller = new AbortController();
  const f = authenticationFixture(undefined, {
      beforeClose: () => controller.abort(),
    }),
    p = f.external();
  const request = p.loopGetToken({}, f.now(), {
    abortController: controller,
    traceSpan: f.manager.traceService.startTrace("owned"),
  });
  const rejected = assert.rejects(request);
  await f.settle();
  let closed = false;
  const closing = f.host.close().then(() => {
    closed = true;
  });
  await tick();
  assert.equal(
    closed,
    false,
    "do not clear an awaited timeout before the original operation settles",
  );
  await f.tick(1000);
  await Promise.all([rejected, closing]);
  assert.equal(f.host.pendingCount + f.host.timerCount, 0);
  await f.close();
});

test("borrowed services retain original receivers and are not arbitrarily closed or logged out", async () => {
  const f = authenticationFixture();
  let calls = 0;
  f.product.close = () => {
    throw Error("borrowed product must stay open");
  };
  f.product.sync = async function (this: any) {
    assert.equal(this, f.product);
    calls++;
  };
  f.manager.logout = () => {
    throw Error("closing must not logout or clean credentials");
  };
  await f.manager.productManager.sync(true);
  await f.host.close();
  assert.equal(calls, 1);
  assert.equal(f.product.configuration.isStopped, false);
  await f.close();
});

test("close waits the complete original serialized persistence tail even after an earlier write fails", async () => {
  const f = authenticationFixture(),
    pending = f.deferred();
  const seen: string[] = [];
  const first = f.manager.runSessionPersistence(async () => {
    seen.push("first");
    await pending.promise;
    throw Error("owned first write failed");
  });
  const rejected = assert.rejects(first, /owned first write failed/);
  const second = f.manager.runSessionPersistence(async () => {
    seen.push("second");
    return 7;
  });
  let closed = false;
  const closing = f.host.close().then(() => {
    closed = true;
  });
  await tick();
  assert.equal(closed, false);
  assert.deepEqual(seen, ["first"]);
  pending.resolve(undefined);
  await Promise.all([rejected, closing]);
  assert.equal(await second, 7);
  assert.deepEqual(seen, ["first", "second"]);
  assert.equal(f.host.pendingCount, 0);
  assert.deepEqual(f.host.errors, []);
  await f.close();
});

test("the original external timeout does not make its losing REST branch disappear from ownership", async () => {
  let request: ReturnType<ReturnType<typeof authenticationFixture>["deferred"]>;
  const f = authenticationFixture(undefined, {
      beforeClose: () =>
        request.reject(Error("owned REST stopped by its parent")),
    }),
    p = f.external();
  request = f.deferred();
  p.restOperations = { post: async () => request.promise };
  const creating = p.createSession({
    abortController: new AbortController(),
    traceSpan: f.manager.traceService.startTrace("owned"),
  });
  const rejected = assert.rejects(
    creating,
    (error: any) => error instanceof f.A.OpenExternalLinkError,
  );
  await f.settle();
  assert.ok(f.host.pendingCount > 1);
  await f.tick(300000);
  await rejected;
  assert.ok(
    f.host.pendingCount > 0,
    "a Promise.race loser is still an accepted original method/transport",
  );
  await f.close();
  assert.equal(f.host.pendingCount + f.host.timerCount, 0);
  assert.deepEqual(f.host.errors, []);
});

test("real native product env merge feeds original custom-token storage instead of using the signal as token", async () => {
  const root = await mkdtemp(join(tmpdir(), "axonfire-auth-config-"));
  const authentication = {
    type: "custom-token",
    attributes: {
      token: "owned-merged-token",
      enterpriseId: "owned-enterprise",
    },
  };
  const env = {
    ACC_PRODUCT_CONFIG_V3: JSON.stringify({ authentication }),
    CODEBUDDY_AUTH_TOKEN: "owned-priority-signal-not-token",
    ACC_USER_ID: "owned-config-user",
    ACC_USER_NICKNAME: "Owned config user",
  };
  const product = createNativeProductHost({
    initialConfiguration: { agents: [], tools: [], models: [], prompts: [] },
    getWorkDir: () => root,
    getHomeDir: () => root,
    env,
    watch: false,
    cloud: false,
    environment: false,
  });
  let f: ReturnType<typeof authenticationFixture> | undefined;
  try {
    await product.start();
    await product.flush();
    assert.deepEqual(
      product.manager.configuration.value.authentication,
      authentication,
    );
    f = authenticationFixture(undefined, { env, product: product.manager });
    const custom = f.custom();
    f.manager.authenticationStorages.push(custom.storage);
    f.providers.push(custom.provider);
    assert.equal(await custom.storage.priority(), 9);
    await f.host.start();
    await f.settle();
    const session = f.manager.currentSessionSubject.value;
    assert.equal(await f.manager.getAuthenticationStorage(), custom.storage);
    assert.equal(session.auth.accessToken, authentication.attributes.token);
    assert.equal(session.account.uid, env.ACC_USER_ID);
    assert.equal(session.account.enterpriseId, "owned-enterprise");
    assert.deepEqual(f.decoded, [["owned-merged-token", { complete: true }]]);
    await f.close();
    assert.equal(product.manager.configuration.isStopped, false);
    assert.equal(product.closed, false);
  } finally {
    try {
      await f?.close();
    } finally {
      await product.close();
      await rm(root, { recursive: true, force: true });
    }
  }
});

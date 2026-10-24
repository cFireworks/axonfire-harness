import { test } from "node:test";
import { Subject } from "rxjs";
import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { createServer } from "node:http";
import { createDesktopAccountProductHost } from "../src/auth/desktop-account-product-host.js";

async function fixture(
  run: (context: any) => Promise<void>,
  browserLogin?: any,
) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "axon-account-host-"));
  const requests: any[] = [];
  let release: (() => void) | undefined;
  const server = createServer((req, res) => {
    requests.push({
      url: req.url,
      user: req.headers["x-user-id"],
      token: req.headers.authorization,
    });
    const reply = () => {
      if (res.writableEnded) return;
      res.writeHead(req.url === "/unauthorized" ? 401 : 200, {
        "content-type": "application/json",
      });
      res.end(
        JSON.stringify({
          data:
            browserLogin && req.url?.includes("/auth/state")
              ? { state: "owned-state", authUrl: "https://owned.invalid/login" }
              : browserLogin && req.url?.includes("/auth/token")
                ? {
                    accessToken: "browser-token",
                    expiresIn: 3600,
                    domain: "owned.invalid",
                  }
                : browserLogin && req.url?.endsWith("/accounts")
                  ? {
                      accounts: [
                        {
                          uid: "browser-user",
                          type: "personal",
                          pluginEnabled: true,
                        },
                      ],
                    }
                  : browserLogin && req.url?.includes("/login/account")
                    ? { uid: "browser-user", type: "personal" }
                    : { models: [{ id: "remote", contextWindow: 64000 }] },
        }),
      );
    };
    if (req.url === "/pending") release = reply;
    else reply();
  });
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const endpoint = `http://127.0.0.1:${address.port}`;
  fs.mkdirSync(path.join(root, "cli"));
  const product = {
    endpoint,
    config: { url: "/cloud" },
    models: [{ id: "local", contextWindow: 32000 }],
    authentication: {
      id: "owned",
      type: browserLogin ? "external-link" : "custom-token",
      attributes: { token: "owned-token", externalDomain: "owned.invalid" },
    },
  };
  fs.writeFileSync(
    path.join(root, "cli", "product.json"),
    JSON.stringify(product),
  );
  const logger = Object.fromEntries(
    ["info", "warn", "error", "debug", "setContext", "time", "timeEnd"].map(
      (key) => [
        key,
        (...args: any[]) => {
          if (process.env.DEBUG_ACCOUNT_HOST) console.error(key, ...args);
        },
      ],
    ),
  );
  const span = (): any => ({
    traceId: "owned",
    startSpan: span,
    markAsFailed() {},
    markAsSuccessful() {},
  });
  const hosts: ReturnType<typeof createDesktopAccountProductHost>[] = [];
  const make = (customToken = true) => {
    const host = createDesktopAccountProductHost({
      resourcesRoot: root,
      productDirectory: path.join(root, "cli"),
      configDirectory: path.join(root, "state"),
      env: {
        ACC_USER_ID: "owned",
        CLIENT_INFO_MACHINE_ID: "owned-machine",
        WORKBUDDY_APP_VERSION: "5.3.14",
        ...(customToken ? { CODEBUDDY_AUTH_TOKEN: "owned-token" } : {}),
        CLIENT_INFO_PRODUCT_VERSION: "owned-version",
      },
      dependencies: {
        logger,
        traceService: { startTrace: span },
        eventService: { report() {} },
        notifier: { info() {}, warn() {}, error() {} },
        filePathService: { setCurrentUserId() {} },
      },
      http: { proxy: false, timeout: 5000 },
      browserLogin,
    });
    hosts.push(host);
    return host;
  };
  try {
    await run({ make, requests, root, getRelease: () => release });
  } finally {
    release?.();
    for (const host of hosts) await host.close();
    server.closeAllConnections();
    await new Promise<void>((r) => server.close(() => r()));
    fs.rmSync(root, { recursive: true, force: true });
  }
}
const tick = () => new Promise<void>((r) => setImmediate(r));
async function until(predicate: () => boolean) {
  const deadline = Date.now() + 3000;
  while (!predicate() && Date.now() < deadline)
    await new Promise((r) => setTimeout(r, 10));
  assert.ok(predicate());
}

test("owned Desktop account/product host starts original graph, publishes cloud, persists login and clears on 401", async () => {
  await fixture(async ({ make, requests, root }) => {
    const host = make(false);
    const first = host.start();
    assert.equal(host.start(), first);
    await first;
    await host.login();
    await until(
      () =>
        host.services.product.getCurrentConfiguration().models[0].id ===
        "remote",
    );
    const { authentication, product, coordinator, fileStorage } = host.services;
    assert.equal(
      authentication.currentSessionSubject.getValue().account.uid,
      "owned",
    );
    assert.equal(product.getCurrentConfiguration().models[0].id, "remote");
    assert.deepEqual(requests[0], {
      url: "/cloud",
      user: "owned",
      token: "Bearer owned-token",
    });
    assert.equal(
      JSON.parse(host.env.ACC_PRODUCT_CONFIG_V3).models[0].id,
      "remote",
    );
    await host.logout();
    await until(
      () => product.getCurrentConfiguration().models[0].id === "local",
    );
    await host.login();
    await until(
      () => product.getCurrentConfiguration().models[0].id === "remote",
    );
    await coordinator.waitRemoteReady();
    const sessionPath = await fileStorage.getAuthSavePath();
    assert.equal(
      JSON.parse(fs.readFileSync(sessionPath, "utf8")).account.uid,
      "owned",
    );
    assert.ok(sessionPath.startsWith(path.join(root, "state")));
    const closing = host.close();
    assert.equal(host.close(), closing);
    await closing;
    assert.equal(host.state, "closed");
    assert.equal(fileStorage.watcher, null);
    assert.equal(fileStorage.watcherRetryTimer, null);
    assert.equal(authentication.currentSessionSubject.observers.length, 0);
    assert.equal(product.configuration.observers.length, 0);
    assert.equal(host.services.experiment.pollingTimer, undefined);
    assert.throws(() => host.start(), /closed/);
    await assert.rejects(host.login(), /closed/);
    const reopened = make(false);
    await reopened.start();
    assert.equal(
      reopened.services.authentication.currentSessionSubject.getValue().account
        .uid,
      "owned",
    );
    await assert.rejects(reopened.services.restOperations.get("/unauthorized"));
    await until(
      () =>
        reopened.services.authentication.currentSessionSubject.getValue() ===
        undefined,
    );
    await until(
      () =>
        reopened.services.product.getCurrentConfiguration().models[0].id ===
        "local",
    );
  });
});

test("owned Desktop account/product close drains an accepted remote operation", async () => {
  await fixture(async ({ make, getRelease }) => {
    const host = make();
    await host.start();
    host.services.cloud.reset();
    const pending = host.services.cloud.fetch("/pending");
    await until(() => !!getRelease());
    let closed = false;
    const closing = host.close().then(() => {
      closed = true;
    });
    await tick();
    assert.equal(closed, false);
    await assert.rejects(host.refresh(), /closed/);
    getRelease()();
    await pending;
    await closing;
    assert.equal(closed, true);
  });
});

test("owned Desktop account/product close before start releases constructed resources", async () => {
  await fixture(async ({ make, requests }) => {
    const host = make();
    await host.close();
    assert.equal(host.state, "closed");
    assert.equal(requests.length, 0);
  });
});

test("owned Desktop account/product close during start waits for initialization without duplicate startup", async () => {
  await fixture(async ({ make, root, getRelease, requests }) => {
    const file = path.join(root, "cli", "product.json");
    const config = JSON.parse(fs.readFileSync(file, "utf8"));
    config.config.url = "/pending";
    fs.writeFileSync(file, JSON.stringify(config));
    const host = make();
    const starting = host.start();
    await until(() => !!getRelease());
    let closed = false;
    const closing = host.close().then(() => {
      closed = true;
    });
    assert.throws(() => host.start(), /closed/);
    await tick();
    assert.equal(closed, false);
    getRelease()();
    await starting;
    await closing;
    assert.equal(requests.length, 1);
    assert.equal(host.services.fileStorage.watcher, null);
    assert.equal(
      host.services.authentication.currentSessionSubject.observers.length,
      0,
    );
  });
});

test("owned Desktop account/product failed initialization can still be closed", async () => {
  await fixture(async ({ make, root, requests }) => {
    fs.writeFileSync(path.join(root, "state"), "not a directory");
    const host = make();
    await assert.rejects(host.start(), { code: "EEXIST" });
    await host.close();
    assert.equal(host.state, "closed");
    assert.equal(requests.length, 0);
    assert.equal(
      host.services.authentication.currentSessionSubject.observers.length,
      0,
    );
  });
});

function gate() {
  let resolve!: () => void;
  const promise = new Promise<void>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

test("owned host drains original snapshot rotation and pool flush before close", async () => {
  await fixture(async ({ make }) => {
    const host = make();
    await host.start();
    const rotation = gate(),
      flush = gate();
    const calls: string[] = [];
    const binding = host.bindHostedCliRuntime({
      runtimeManager: {
        async rotateHostRuntime(reason: string) {
          calls.push(reason);
          await rotation.promise;
        },
        async resetHostRuntime() {
          calls.push("reset");
        },
      },
      prewarmPool: {
        async flush() {
          calls.push("flush");
          await flush.promise;
        },
      },
    });
    let closing: Promise<void> | undefined;
    try {
      const product = {
        ...host.services.product.getLocalConfiguration(),
        endpoint: host.services.product.getEndpoint() + "/rotated",
      };
      await host.services.coordinator.publishResolvedSnapshot(
        undefined,
        product,
        "owned-rotation",
      );
      await until(() => calls.length === 1);
      let closed = false;
      closing = host.close().then(() => {
        closed = true;
      });
      await tick();
      assert.equal(closed, false);
      rotation.resolve();
      await until(() => calls.includes("flush"));
      await tick();
      assert.equal(closed, false);
      flush.resolve();
      await closing;
      assert.deepEqual(calls, ["hosted-cli-product-snapshot-change", "flush"]);
      assert.equal(
        host.services.coordinator.hostedCliProductSnapshotChangeListeners.size,
        0,
      );
      assert.throws(
        () => host.bindHostedCliRuntime({ runtimeManager: {} }),
        /closed/,
      );
      const stopping = binding.stop();
      assert.equal(binding.stop(), stopping);
      await stopping;
    } finally {
      rotation.resolve();
      flush.resolve();
      await closing;
    }
  });
});

test("owned host stops original queued auth reset after logout and invalidates history", async () => {
  await fixture(async ({ make }) => {
    const host = make();
    await host.start();
    const reset = gate();
    const calls: string[] = [];
    host.bindHostedCliRuntime({
      runtimeManager: {
        async rotateHostRuntime() {},
        async resetHostRuntime() {
          calls.push("reset");
          await reset.promise;
        },
      },
      sessionManager: {
        invalidateAllSessionHistory() {
          calls.push("history");
        },
      },
      agentBackend: {
        async resetActiveSessions(reason: string) {
          calls.push(reason);
        },
      },
    });
    let closing: Promise<void> | undefined;
    try {
      await host.logout();
      await until(() => calls.includes("reset"));
      assert.deepEqual(calls, ["history", "reset"]);
      let closed = false;
      closing = host.close().then(() => {
        closed = true;
      });
      await tick();
      assert.equal(closed, false);
      reset.resolve();
      await closing;
      assert.equal(calls.length, 3);
      assert.match(calls[2]!, /^auth-owner-change /);
      assert.equal(
        host.services.authentication.currentSessionSubject.observers.length,
        0,
      );
    } finally {
      reset.resolve();
      await closing;
    }
  });
});

test("owned lifecycle preserves original rotation failure handling and still flushes", async () => {
  await fixture(async ({ make }) => {
    const host = make();
    await host.start();
    const calls: string[] = [];
    const binding = host.bindHostedCliRuntime({
      runtimeManager: {
        async rotateHostRuntime() {
          calls.push("rotate");
          throw Error("owned rotation failure");
        },
        async resetHostRuntime() {},
      },
      prewarmPool: {
        async flush() {
          calls.push("flush");
          throw Error("owned flush failure");
        },
      },
    });
    await host.services.coordinator.publishResolvedSnapshot(
      undefined,
      {
        ...host.services.product.getLocalConfiguration(),
        endpoint: host.services.product.getEndpoint() + "/changed",
      },
      "owned-failure",
    );
    await binding.stop();
    assert.deepEqual(calls, ["rotate", "flush"]);
    await host.close();
  });
});

test("owned browser login uses original HTTP provider, publishes and persists account, then logs out", async () => {
  const urls = new Subject<string>();
  const opened: string[] = [];
  await fixture(
    async ({ make, requests }) => {
      const host = make(false);
      await host.start();
      assert.equal(urls.observers.length, 1);
      assert.equal(await host.login({ type: "external" }), true);
      assert.equal(
        host.services.authentication.currentSessionSubject.getValue().account
          .uid,
        "browser-user",
      );
      assert.equal(
        JSON.parse(
          fs.readFileSync(
            await host.services.fileStorage.getAuthSavePath(),
            "utf8",
          ),
        ).account.uid,
        "browser-user",
      );
      await host.refresh();
      assert.equal(
        JSON.parse(host.env.ACC_PRODUCT_CONFIG_V3!).models[0].id,
        "remote",
      );
      assert.ok(
        requests.some(
          (r: any) => r.url === "/cloud" && r.token === "Bearer browser-token",
        ),
      );
      assert.equal(
        new URL(opened[0]!).searchParams.get("version"),
        "owned-version",
      );
      await host.logout();
      assert.equal(await host.services.fileStorage.restore(), undefined);
      await host.close();
      assert.equal(urls.observers.length, 0);
      assert.equal(urls.isStopped, false);
    },
    {
      externalUriOpener: {
        urlSubject: urls,
        async open(url: string) {
          opened.push(url);
          return false;
        },
      },
      clientInfoProvider: {
        async get() {
          return { pluginVersion: "owned-version" };
        },
      },
    },
  );
  urls.complete();
});

test("owner close aborts browser login and drains an accepted opener without committing a late account", async () => {
  const urls = new Subject<string>();
  let release!: () => void;
  let opened = false;
  await fixture(
    async ({ make }) => {
      const host = make(false);
      await host.start();
      const login = host.login({ type: "external" });
      await until(() => opened);
      let closed = false;
      const closing = host.close().then(() => {
        closed = true;
      });
      await tick();
      assert.equal(closed, false);
      release();
      assert.equal(await login, false);
      await closing;
      assert.equal(
        host.services.authentication.currentSessionSubject.getValue(),
        undefined,
      );
      assert.equal(urls.observers.length, 0);
      assert.equal(urls.isStopped, false);
    },
    {
      externalUriOpener: {
        urlSubject: urls,
        open() {
          opened = true;
          return new Promise<boolean>((resolve) => {
            release = () => resolve(true);
          });
        },
      },
      clientInfoProvider: {
        async get() {
          return { pluginVersion: "owned-version" };
        },
      },
    },
  );
  urls.complete();
});

test("rejected browser opener does not leave a subscription on the borrowed URL stream after close", async () => {
  const urls = new Subject<string>();
  await fixture(
    async ({ make }) => {
      const host = make(false);
      await host.start();
      let error: unknown;
      assert.equal(
        await host.login({
          errorHandler: (value: unknown) => {
            error = value;
          },
        }),
        false,
      );
      assert.ok(error instanceof Error);
      await host.close();
      assert.equal(urls.observers.length, 0);
      assert.equal(urls.isStopped, false);
    },
    {
      externalUriOpener: {
        urlSubject: urls,
        async open() {
          throw new Error("owned opener rejected");
        },
      },
      clientInfoProvider: {
        async get() {
          return { pluginVersion: "owned-version" };
        },
      },
    },
  );
  urls.complete();
});

test("account owner constructs the original host opener from an explicit browser delegate", async () => {
  const opened: string[] = [];
  await fixture(
    async ({ make }) => {
      const host = make(false);
      await host.start();
      assert.equal(await host.login(), true);
      assert.equal(opened.length, 1);
      assert.equal(new URL(opened[0]!).searchParams.get("version"), "5.3.14");
      assert.equal(
        (await host.services.clientInfo.get()).machineId,
        "owned-machine",
      );
      // The captured host opener reports true even when its delegate reports false.
      assert.equal(host.services.externalLink.lastBrowserOpenSuccess, true);
      assert.equal(
        host.services.authentication.currentSessionSubject.getValue().account
          .uid,
        "browser-user",
      );
      await host.close();
    },
    {
      openExternal: async (url: string) => {
        opened.push(url);
        return false;
      },
    },
  );
});

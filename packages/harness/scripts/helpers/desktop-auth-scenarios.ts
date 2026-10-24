import assert from "node:assert/strict";
import { BehaviorSubject } from "rxjs";
import { createServer, Agent } from "node:http";
import { createNativeDesktopRest } from "../../src/http/native-desktop-rest.js";
import { createNativeDesktopProductInterceptors } from "../../src/http/native-desktop-product-interceptors.js";
type Factory = (runtime?: any) => any;
const tick = () => new Promise<void>((r) => setImmediate(r));
function gate() {
  let resolve!: (v: any) => void;
  const promise = new Promise<any>((r) => (resolve = r));
  return { promise, resolve };
}
export async function withOwnedDesktopAuthentication(
  factory: Factory,
  run: (s: any) => Promise<void>,
) {
  const now = 1700000000000,
    timers = new Map<any, any>(),
    calls: any[] = [],
    stored: any[] = [],
    logs: any[] = [];
  let restored: any;
  class Clock extends Date {
    static override now() {
      return now;
    }
  }
  const runtime = {
    Date: Clock,
    setTimeout: (run: any, ms: number) => {
      const handle = { run, ms };
      timers.set(handle, handle);
      return handle;
    },
    clearTimeout: (h: any) => timers.delete(h),
    console: { warn() {}, error() {}, log() {} },
  };
  const api = factory(runtime),
    manager = new api.AuthenticationManagerImpl();
  const session = (uid = "owned") => ({
    account: { uid, type: "personal" },
    auth: {
      accessToken: "owned-token",
      refreshToken: "owned-refresh",
      lastRefreshTime: now,
      expiresAt: now + 86400000,
    },
  });
  const provider = {
    support: async () => true,
    getAuthenticationType: async () => ["owned"],
    createSession: async () => session(),
    refreshSession: async (s: any) => s,
    removeSession: async () => {
      calls.push("remove");
    },
    switchAccount: async (_a: any, s: any) => s,
  };
  const subject = new BehaviorSubject<any>(undefined);
  const storage = {
    priority: async () => 10,
    storeSessionSubject: subject,
    restore: async () => restored,
    store: async (s: any) => {
      stored.push(s);
    },
    clean: async () => {
      calls.push("clean");
      return true;
    },
  };
  const config = new BehaviorSubject<any>({
      authentication: { type: "owned" },
      productFeatures: {},
    }),
    product = {
      configuration: config,
      waitConfiguration: async () => config.getValue(),
      sync: async () => {
        calls.push("sync");
      },
      getEndpoint: () => "http://owned.invalid",
    };
  function span(): any {
    return {
      traceId: "owned",
      startSpan: span,
      markAsFailed() {},
      markAsSuccessful() {},
    };
  }
  const logger = Object.fromEntries(
    ["info", "warn", "error", "debug", "setContext"].map((k) => [
      k,
      (...args: any[]) => logs.push([k, ...args]),
    ]),
  );
  Object.assign(manager, {
    logger,
    authenticationProvider: { get: () => [provider] },
    authenticationStorages: [storage],
    productManager: product,
    productEnvService: {
      switchBySession: async (s: any) => {
        calls.push(["environment", s?.account?.uid]);
      },
    },
    eventService: { report: (...v: any[]) => calls.push(["event", ...v]) },
    traceService: { startTrace: span },
    notifier: { info() {}, warn() {}, error() {} },
    filePathService: {
      setCurrentUserId: (uid: string) => calls.push(["user", uid]),
    },
  });
  try {
    await run({
      api,
      manager,
      provider,
      storage,
      subject,
      product,
      session,
      timers,
      calls,
      stored,
      logger,
      setRestored: (s: any) => {
        restored = s;
      },
    });
  } finally {
    manager.dispose();
    await tick();
    subject.complete();
    config.complete();
    assert.equal(timers.size, 0, "owned timers must be cancelled");
  }
}
export const desktopAuthScenarios: [
  string,
  (factory: Factory) => Promise<void>,
][] = [
  [
    "restore selects storage, switches environment and builds original auth headers",
    (factory) =>
      withOwnedDesktopAuthentication(factory, async (f: any) => {
        const s = f.session();
        s.account.enterpriseId = "enterprise";
        s.account.departmentFullName = "unit";
        s.auth.domain = "owned-domain";
        f.setRestored(s);
        f.product.configuration.next({
          productFeatures: { SwitchBySession: true },
        });
        await f.manager.doInit();
        await f.manager.initialized;
        assert.equal(f.manager.currentSessionSubject.getValue(), s);
        assert.ok(
          f.calls.some(
            (v: any) =>
              Array.isArray(v) && v[0] === "environment" && v[1] === "owned",
          ),
        );
        assert.deepEqual(f.manager.buildAuthHeaders(true, true, true), {
          "X-User-Id": "owned",
          Authorization: "Bearer owned-token",
          "X-Enterprise-Id": "enterprise",
          "X-Tenant-Id": "enterprise",
          "X-Domain": "owned-domain",
          "X-Department-Info": "unit",
          "X-Refresh-Token": "owned-refresh",
        });
      }),
  ],
  [
    "newer login wins and late prior completion cannot persist",
    (factory) =>
      withOwnedDesktopAuthentication(factory, async (f: any) => {
        const entered = gate(),
          late = gate();
        let count = 0;
        f.provider.createSession = async () => {
          if (count++ === 0) {
            entered.resolve(true);
            return late.promise;
          }
          return f.session("new");
        };
        const first = f.manager.login();
        await entered.promise;
        assert.equal(await f.manager.login(), true);
        late.resolve(f.session("old"));
        assert.equal(await first, false);
        assert.deepEqual(
          f.stored.map((s: any) => s.account.uid),
          ["new"],
        );
        assert.equal(
          f.manager.currentSessionSubject.getValue().account.uid,
          "new",
        );
      }),
  ],
  [
    "logout invalidates pending login and pending refresh before persistence",
    (factory) =>
      withOwnedDesktopAuthentication(factory, async (f: any) => {
        const entered = gate(),
          late = gate();
        f.provider.createSession = async () => {
          entered.resolve(true);
          return late.promise;
        };
        const login = f.manager.login();
        await entered.promise;
        await f.manager.logout();
        late.resolve(f.session());
        assert.equal(await login, false);
        assert.equal(f.stored.length, 0);
        const current = f.session();
        current.auth.lastRefreshTime = 0;
        f.manager.loggedOut = false;
        f.manager.currentSessionSubject.next(current);
        const refreshing = gate(),
          response = gate();
        f.provider.refreshSession = async () => {
          refreshing.resolve(true);
          return response.promise;
        };
        const refresh = f.manager.refreshSession();
        await refreshing.promise;
        await f.manager.logout();
        response.resolve(f.session());
        await refresh;
        assert.equal(f.manager.currentSessionSubject.getValue(), undefined);
        assert.equal(f.stored.length, 0);
      }),
  ],
  [
    "storage clear invalidates session and disposal cancels scheduled refresh",
    (factory) =>
      withOwnedDesktopAuthentication(factory, async (f: any) => {
        f.setRestored(f.session());
        await f.manager.doInit();
        f.subject.next(f.session("external"));
        await tick();
        assert.equal(
          f.manager.currentSessionSubject.getValue().account.uid,
          "external",
        );
        f.subject.next(undefined);
        await tick();
        assert.equal(f.manager.loggedOut, true);
        assert.equal(f.manager.currentSessionSubject.getValue(), undefined);
        f.manager.loggedOut = false;
        f.manager.currentSessionSubject.next(f.session());
        const scheduled = f.manager.scheduleRefreshSession(false);
        assert.ok(f.timers.size > 0);
        f.manager.dispose();
        await scheduled;
        assert.equal(f.manager.disposed, true);
        assert.equal(f.manager.currentSessionSubject.isStopped, true);
        assert.equal(f.subject.observers.length, 0);
      }),
  ],
  [
    "storage priority, provider selection and persistence queue recover after failure",
    (factory) =>
      withOwnedDesktopAuthentication(factory, async (f: any) => {
        const high = { ...f.storage, priority: async () => 20 };
        f.manager.authenticationStorages = [
          {
            priority: async () => {
              throw Error("owned");
            },
          },
          f.storage,
          high,
        ];
        assert.equal(await f.manager.getAuthenticationStorage(), high);
        await f.manager.setAuthenticationProvider("owned");
        assert.equal(await f.manager.getAuthenticationProvider(), f.provider);
        await f.manager.clearAuthenticationProvider();
        await assert.rejects(
          f.manager.setAuthenticationProvider("missing"),
          (e: any) => e instanceof f.api.NotFoundError,
        );
        const order: number[] = [];
        const first = f.manager.runSessionPersistence(async () => {
          order.push(1);
          throw Error("owned");
        });
        const second = f.manager.runSessionPersistence(async () => {
          order.push(2);
          return true;
        });
        await assert.rejects(first);
        assert.equal(await second, true);
        assert.deepEqual(order, [1, 2]);
      }),
  ],
  [
    "native REST HTTP 401 triggers the complete authentication manager logout",
    (factory) =>
      withOwnedDesktopAuthentication(factory, async (f: any) => {
        f.setRestored(f.session());
        await f.manager.doInit();
        const seen: any[] = [];
        const server = createServer((req, res) => {
          seen.push(req.headers.authorization);
          res.writeHead(401, { "content-type": "application/json" });
          res.end("{}");
        });
        await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
        const agent = new Agent({ keepAlive: false });
        try {
          const address = server.address();
          assert.ok(address && typeof address !== "string");
          const origin = `http://127.0.0.1:${address.port}`;
          f.product.getEndpoint = () => origin;
          const { DefaultRestOperationsFactory } = createNativeDesktopRest();
          const rest = Object.assign(new DefaultRestOperationsFactory(), {
            clientConfig: {
              baseURL: origin,
              proxy: false,
              httpAgent: agent,
              timeout: 2000,
            },
          }).create();
          const policy = createNativeDesktopProductInterceptors({
            env: {},
            productManager: f.product,
          });
          const auth = Object.assign(
            new policy.AuthenticationHttpInterceptor(),
            {
              restOperations: rest,
              authenticationManager: f.manager,
              productManager: f.product,
              logger: f.logger,
              notifier: { warn() {} },
            },
          );
          auth.initialize();
          await assert.rejects(rest.get("/owned-401"));
          await tick();
          await f.manager.sessionPersistenceTail;
          assert.deepEqual(seen, ["Bearer owned-token"]);
          assert.equal(f.manager.currentSessionSubject.getValue(), undefined);
          assert.ok(f.calls.includes("remove"));
          assert.ok(f.calls.includes("clean"));
          assert.equal(f.manager.loggedOut, true);
        } finally {
          agent.destroy();
          server.closeAllConnections();
          await new Promise<void>((r, j) =>
            server.close((e) => (e ? j(e) : r())),
          );
        }
      }),
  ],
];

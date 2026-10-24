import assert from "node:assert/strict";
type Factory = (runtime?: any) => any;
function subject(initial: any) {
  let current = initial;
  const listeners = new Set<(v: any) => void>();
  return {
    getValue: () => current,
    subscribe(fn: (v: any) => void) {
      listeners.add(fn);
      fn(current);
      return { unsubscribe: () => listeners.delete(fn) };
    },
    next(v: any) {
      current = v;
      for (const fn of listeners) fn(v);
    },
    get size() {
      return listeners.size;
    },
  };
}
const logger = { info() {}, warn() {}, error() {} };
export const hostedCliLifecycleScenarios: [
  string,
  (f: Factory) => Promise<void>,
][] = [
  [
    "strict env parsing differs from numeric cached configuration",
    async (f) => {
      const api = f();
      for (const x of [
        undefined,
        "",
        " ",
        "-1",
        "1.5",
        "0x10",
        "1e2",
        "2junk",
        "9007199254740992",
      ])
        assert.equal(api.parsePrewarmPoolSizeEnv(x), undefined);
      for (const [x, n] of [
        [" 02 ", 2],
        ["0", 0],
        ["9007199254740991", Number.MAX_SAFE_INTEGER],
      ] as const)
        assert.equal(api.parsePrewarmPoolSizeEnv(x), n);
      for (const x of [undefined, "2", -1, 1.5, NaN, Infinity])
        assert.equal(
          api.getPrewarmPoolSizeFromAppConfig({ get: () => x }, 7),
          7,
        );
      assert.equal(
        api.getPrewarmPoolSizeFromAppConfig({ get: () => 9007199254740992 }, 7),
        9007199254740992,
      );
    },
  ],
  [
    "cache persistence ignores invalid values and catches write failure",
    async (f) => {
      const api = f(),
        writes: any[] = [],
        warnings: any[] = [];
      const deps = {
        configService: {
          set: async (...v: any[]) => {
            writes.push(v);
            if (v[1] === 3) throw Error("owned");
          },
        },
        logger: { warn: (...v: any[]) => warnings.push(v) },
      };
      for (const v of [undefined, "1", -1, 0.5, NaN, Infinity])
        await api.persistPrewarmPoolSizeCache(deps, v);
      assert.equal(writes.length, 0);
      await api.persistPrewarmPoolSizeCache(deps, 0);
      await api.persistPrewarmPoolSizeCache(deps, 3);
      assert.deepEqual(writes, [
        ["prewarmPoolSize", 0],
        ["prewarmPoolSize", 3],
      ]);
      assert.equal(warnings.length, 1);
    },
  ],
  [
    "bootstrap precedence, fresh baseline provider and manager attachment",
    async (f) => {
      const calls: any[] = [],
        warnings: any[] = [];
      let env = { VERSION: "first" };
      class Pool {
        deps: any;
        constructor(deps: any) {
          this.deps = deps;
        }
        start() {
          calls.push("start");
        }
      }
      const api = f({
        process: {
          env: { WORKBUDDY_CLI_PREWARM_POOL_SIZE: " 2 " },
          execPath: "/owned/node",
        },
        prewarm: { CliPrewarmPool: Pool },
      });
      const options: any = { adapters: { getQimei36: async () => "qimei" } };
      const pool = await api.initializePrewarmPool({
        celljs: { configService: { get: () => 9 } },
        logger: { ...logger, warn: (...v: any[]) => warnings.push(v) },
        runtimeManager: { setPrewarmPool: (p: any) => calls.push(p) },
        codeBackendFactoryOptions: options,
        resolveWorkbuddyAppServerCodeCliPath: (o: any) => {
          assert.equal(o, options);
          return "/owned/cli";
        },
        buildWorkbuddyAppServerCodeCliEnv: (o: any, q: any) => {
          assert.equal(o, options);
          return { ...env, ...q };
        },
      });
      assert.equal(pool.deps.poolSize, 2);
      assert.equal(pool.deps.execPath, "/owned/node");
      assert.deepEqual(pool.deps.baselineEnv, {
        VERSION: "first",
        CODEBUDDY_QIMEI36: "qimei",
      });
      env = { VERSION: "second" };
      assert.deepEqual(pool.deps.baselineEnvProvider(), {
        VERSION: "second",
        CODEBUDDY_QIMEI36: "qimei",
      });
      assert.equal(options.cliPrewarmPool, pool);
      assert.deepEqual(calls, ["start", pool]);
      assert.equal(warnings.length, 0);
    },
  ],
  [
    "bootstrap disabled size skips resolution and failed start leaves cold fallback",
    async (f) => {
      for (const value of ["0", "bad", undefined]) {
        let created = 0,
          warnings = 0;
        const api = f({
          process: { env: { WORKBUDDY_CLI_PREWARM_POOL_SIZE: value } },
          prewarm: {
            CliPrewarmPool: class {
              constructor() {
                created++;
              }
              start() {
                throw Error("start");
              }
            },
          },
        });
        const opts: any = { adapters: {} };
        const result = await api.initializePrewarmPool({
          celljs: { configService: { get: () => 1 } },
          logger: { ...logger, warn: () => warnings++ },
          runtimeManager: {},
          codeBackendFactoryOptions: opts,
          resolveWorkbuddyAppServerCodeCliPath: () => "/cli",
          buildWorkbuddyAppServerCodeCliEnv: () => ({}),
        });
        assert.equal(result, undefined);
        assert.equal(created, value === "0" ? 0 : 1);
        assert.equal(opts.cliPrewarmPool, undefined);
        assert.equal(warnings, value === "bad" ? 2 : value === "0" ? 0 : 1);
      }
    },
  ],
  [
    "snapshot rotation failure still flushes and disposal is returned unchanged",
    async (f) => {
      const api = f(),
        calls: string[] = [];
      let listener: any;
      const disposable = { dispose() {} };
      const result = api.bindProductSnapshot({
        celljs: {
          coordinator: {
            onHostedCliProductSnapshotChanged: (fn: any) => {
              listener = fn;
              return disposable;
            },
          },
        },
        logger,
        runtimeManager: {
          rotateHostRuntime: async (reason: string) => {
            calls.push(reason);
            throw Error("rotation");
          },
        },
        prewarmPool: {
          flush: async () => {
            calls.push("flush");
            throw Error("pool");
          },
        },
      });
      assert.equal(result, disposable);
      await listener();
      assert.deepEqual(calls, ["hosted-cli-product-snapshot-change", "flush"]);
    },
  ],
  [
    "auth owner ignores token refresh, serializes changes and invalidates logout history",
    async (f) => {
      const api = f(),
        calls: string[] = [];
      const currentSessionSubject = subject({
        account: { uid: "a" },
        auth: { domain: "d", token: "one" },
      });
      const handle = api.bindHostedCliAuthLifecycle({
        authenticationManager: { currentSessionSubject },
        runtimeManager: {
          resetHostRuntime: async () => {
            calls.push("host");
            await Promise.resolve();
          },
        },
        sessionManager: {
          invalidateAllSessionHistory: () => calls.push("history"),
        },
        prewarmPool: { flush: async () => calls.push("flush") },
        agentBackend: {
          resetActiveSessions: async (reason: string) => calls.push(reason),
        },
        logger,
      });
      currentSessionSubject.next({
        account: { uid: "a" },
        auth: { domain: "d", token: "two" },
      });
      assert.equal(calls.length, 0);
      currentSessionSubject.next({
        account: { uid: "b" },
        auth: { domain: "d" },
      });
      currentSessionSubject.next(null);
      await handle.stop();
      assert.deepEqual(calls, [
        "host",
        "flush",
        "auth-owner-change (a|d| -> b|d|)",
        "history",
        "host",
        "flush",
        "auth-owner-change (b|d| -> none)",
      ]);
      assert.equal(currentSessionSubject.size, 0);
      currentSessionSubject.next({ account: { uid: "c" } });
      assert.equal(calls.length, 7);
    },
  ],
  [
    "auth reset failures recover on next queued event; pool/backend failures are isolated",
    async (f) => {
      const api = f(),
        calls: string[] = [];
      let n = 0;
      const currentSessionSubject = subject(null);
      const handle = api.bindHostedCliAuthLifecycle({
        authenticationManager: { currentSessionSubject },
        runtimeManager: {
          resetHostRuntime: async () => {
            calls.push("host");
            if (n++ === 0) throw Error("host");
          },
        },
        prewarmPool: {
          flush: async () => {
            calls.push("flush");
            throw Error("pool");
          },
        },
        agentBackend: {
          resetActiveSessions: async () => {
            calls.push("backend");
            throw Error("backend");
          },
        },
        logger,
      });
      currentSessionSubject.next({ account: { uid: "a" } });
      currentSessionSubject.next({ account: { uid: "b" } });
      await handle.stop();
      assert.deepEqual(calls, ["host", "host", "flush", "backend"]);
    },
  ],
  [
    "owner identity includes enterprise and domain with original empty semantics",
    async (f) => {
      const api = f();
      assert.equal(
        api.getHostedCliSessionOwnerKey({ auth: { token: "x" } }),
        undefined,
      );
      assert.equal(
        api.getHostedCliSessionOwnerKey({ account: { enterpriseId: "e" } }),
        "||e",
      );
      assert.equal(
        api.getHostedCliSessionOwnerKey({ auth: { domain: "d" } }),
        "|d|",
      );
      assert.equal(
        api.getHostedCliSessionOwnerKey({ account: { uid: 0 } }),
        undefined,
      );
      assert.equal(
        api.getHostedCliSessionOwnerKey({
          account: { uid: 0, enterpriseId: "e" },
        }),
        "0||e",
      );
    },
  ],
];

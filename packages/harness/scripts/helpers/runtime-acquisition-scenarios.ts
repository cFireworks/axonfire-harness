import assert from "node:assert/strict";
type Factory = (runtime: any) => any;
function fixture(factory: Factory) {
  const calls: any[] = [];
  const logger = {
    info: (...x: any[]) => calls.push(["info", ...x]),
    warn: (...x: any[]) => calls.push(["warn", ...x]),
  };
  const pool: any = {
    tryAcquire: (...x: any[]) => {
      calls.push(["acquire", ...x]);
      return {
        activate: async (x: any) => {
          calls.push(["activate", x]);
          return { acpEndpoint: "warm" };
        },
      };
    },
    killSession: async (id: string) => {
      calls.push(["poolKill", id]);
      return true;
    },
  };
  const owner: any = {
    ...factory({ logger }),
    sessionId: "owned",
    dependencies: { cliPrewarmPool: pool, logger },
    runtimeManager: {
      createSession: async (x: any) => {
        calls.push(["cold", x]);
        return { acpEndpoint: "cold" };
      },
      killSession: async (id: string) => {
        calls.push(["coldKill", id]);
      },
    },
    destroyed: false,
    prewarmActivated: false,
    runtimeEverStarted: true,
  };
  const params = {
    cwd: "/owned",
    args: ["cli.js", "--settings", "private"],
    env: { KEY: "value" },
  };
  return { owner, pool, calls, params };
}
export const runtimeAcquisitionScenarios: [
  string,
  (factory: Factory) => Promise<void>,
][] = [
  [
    "warm acquisition preserves environment identity and routes termination",
    async (f) => {
      const { owner, pool, calls, params } = fixture(f);
      const delta = { SESSION: "x" },
        trusted = new Set(["SESSION"]);
      assert.deepEqual(await owner.acquireRuntime(params, delta, trusted), {
        acpEndpoint: "warm",
      });
      assert.equal(calls[0][1], delta);
      assert.equal(calls[0][2], params.env);
      assert.equal(calls[0][3], trusted);
      assert.deepEqual(calls.find((c) => c[0] === "activate")[1], {
        cwd: "/owned",
        args: ["--serve", "--settings", "private", "--port", "0"],
        sessionId: "owned",
      });
      assert.equal(owner.prewarmActivated, true);
      await owner.killRuntimeSession();
      assert.equal(owner.prewarmActivated, false);
      assert.equal(owner.runtimeEverStarted, false);
      assert.equal(calls.filter((c) => c[0] === "coldKill").length, 0);
      assert.ok(pool);
    },
  ],
  [
    "activation rejection falls back to cold start",
    async (f) => {
      const { owner, pool, calls, params } = fixture(f);
      pool.tryAcquire = () => ({
        activate: async () => {
          throw Error("failed ACK");
        },
      });
      assert.deepEqual(await owner.acquireRuntime(params, {}), {
        acpEndpoint: "cold",
      });
      assert.equal(owner.prewarmActivated, false);
      assert.ok(calls.some((c) => c[0] === "warn"));
    },
  ],
  [
    "background automation bypasses pool",
    async (f) => {
      const { owner, calls, params } = fixture(f);
      owner.isBackgroundAutomation = true;
      await owner.acquireRuntime(params, {});
      assert.equal(calls.filter((c) => c[0] === "acquire").length, 0);
      assert.ok(calls.some((c) => c[0] === "cold"));
    },
  ],
  [
    "destroy during activation cleans pool without cold fallback",
    async (f) => {
      const { owner, pool, calls, params } = fixture(f);
      pool.tryAcquire = () => ({
        activate: async () => {
          owner.destroyed = true;
          return { acpEndpoint: "warm" };
        },
      });
      await assert.rejects(
        owner.acquireRuntime(params, {}),
        /destroyed during prewarm activate/,
      );
      assert.ok(calls.some((c) => c[0] === "poolKill"));
      assert.equal(calls.filter((c) => c[0] === "cold").length, 0);
    },
  ],
  [
    "destroy during cold start cleans manager session",
    async (f) => {
      const { owner, pool, calls, params } = fixture(f);
      pool.tryAcquire = () => null;
      owner.runtimeManager.createSession = async () => {
        owner.destroyed = true;
        return { acpEndpoint: "cold" };
      };
      await assert.rejects(
        owner.acquireRuntime(params, {}),
        /destroyed during cold-start/,
      );
      assert.ok(calls.some((c) => c[0] === "coldKill"));
    },
  ],
  [
    "failed or unhandled pool kill falls back and swallows manager rejection",
    async (f) => {
      for (const fail of [false, true]) {
        const { owner, pool, calls } = fixture(f);
        owner.prewarmActivated = true;
        pool.killSession = async () => {
          if (fail) throw Error("pool");
          return false;
        };
        owner.runtimeManager.killSession = async () => {
          calls.push(["coldKill"]);
          throw Error("manager");
        };
        await owner.killRuntimeSession();
        assert.equal(owner.prewarmActivated, false);
        assert.equal(owner.runtimeEverStarted, false);
        assert.ok(calls.some((c) => c[0] === "coldKill"));
      }
    },
  ],
  [
    "synchronous pool acquisition failure is preserved",
    async (f) => {
      const { owner, pool, calls, params } = fixture(f);
      pool.tryAcquire = () => {
        throw Error("sync pool");
      };
      await assert.rejects(owner.acquireRuntime(params, {}), /sync pool/);
      assert.equal(calls.length, 0);
    },
  ],
  [
    "argument conversion and content summarization match original",
    async (f) => {
      const api = f({ logger: {} });
      assert.deepEqual(
        api.buildPrewarmActivateArgs(["cli", "--serve", "--port", "9"], 0),
        ["--serve", "--port", "9", "--port", "0"],
      );
      assert.deepEqual(api.buildPrewarmActivateArgs([], 0), [
        "--serve",
        "--port",
        "0",
      ]);
      assert.equal(
        api.summarizePrewarmArgs([
          "--settings",
          "secret",
          "--system-prompt",
          "hello",
          "--model",
          "owned",
          "--serve",
        ]),
        "--settings=<len=6> --system-prompt=<len=5> --model=owned --serve",
      );
    },
  ],
];

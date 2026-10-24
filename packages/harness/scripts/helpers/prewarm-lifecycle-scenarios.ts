import assert from "node:assert/strict";
const logger = { info() {}, warn() {}, error() {} };
export const prewarmLifecycleScenarios: Array<
  [string, (s: any) => Promise<void>]
> = [];
prewarmLifecycleScenarios.push([
  "original AppServer stop order catches manager and pool rejection",
  async (s) => {
    const order: string[] = [];
    const f = (name: string) => () => {
      order.push(name);
    };
    const life = s.stop({
      pluginRecommendationRegistry: {
        cancelAll: (reason: string) => {
          assert.equal(reason, "daemon stopped");
          order.push("cancel");
        },
      },
      sessionRuntimeHandleRef: { current: { stop: f("runtime") } },
      sessionEventsHandle: { dispose: f("events") },
      edgeSyncInstallDispose: () => {
        order.push("edge");
        throw new Error("edge");
      },
      powerManager: { cleanup: f("power") },
      appServerServices: { docsService: { dispose: f("docs") } },
      bootstrapInstance: {
        handlerDeps: {
          hostServices: Promise.resolve({ memory: { dispose: f("memory") } }),
        },
        stop: async () => {
          order.push("bootstrap");
          throw new Error("bootstrap");
        },
      },
      runtimeManager: {
        onStop: async () => {
          order.push("manager");
          throw new TypeError("dispose");
        },
      },
      cliPrewarmPool: {
        stop: async () => {
          order.push("pool");
          throw new Error("pool");
        },
      },
    });
    await life.stop();
    assert.deepEqual(order, [
      "cancel",
      "runtime",
      "events",
      "edge",
      "power",
      "docs",
      "memory",
      "bootstrap",
      "manager",
      "pool",
    ]);
  },
]);
prewarmLifecycleScenarios.push([
  "original AppServer docs disposal failure still propagates",
  async (s) => {
    let later = false;
    const life = s.stop({
      pluginRecommendationRegistry: { cancelAll() {} },
      sessionRuntimeHandleRef: {},
      powerManager: { cleanup() {} },
      appServerServices: {
        docsService: {
          dispose: async () => {
            throw new Error("docs");
          },
        },
      },
      bootstrapInstance: {},
      runtimeManager: { onStop: () => (later = true) },
    });
    await assert.rejects(life.stop(), /docs/);
    assert.equal(later, false);
  },
]);
prewarmLifecycleScenarios.push([
  "managed env exact comparison and latest product path priority",
  async (s) => {
    const api = s.pool({
      process: {
        env: {
          ACC_PRODUCT_CONFIG_PATH: "/owned",
          ACC_PRODUCT_CONFIG_V3: "inline",
        },
        platform: "linux",
      },
    });
    assert.deepEqual(
      api.managedEnvMismatchKeys(
        { A: "1", B: undefined },
        { A: "2", C: undefined },
      ),
      ["A", "B", "C"],
    );
    const env: any = { ACC_PRODUCT_CONFIG_V3: "stale", KEEP: "yes" };
    api.applyCurrentProductConfigEnv(env);
    assert.deepEqual(env, { ACC_PRODUCT_CONFIG_PATH: "/owned", KEEP: "yes" });
    assert.equal(
      api.resolveAgentTeamsEnv({ expertType: "team", disableAgentTeams: true }),
      "1",
    );
    assert.equal(api.resolveAgentTeamsEnv(), "0");
  },
]);
prewarmLifecycleScenarios.push([
  "acquisition rejects unknown delta and discards stale managed environments",
  async (s) => {
    const { CliPrewarmPool } = s.pool();
    const p = new CliPrewarmPool({ poolSize: 1, logger });
    const stale: any = {
      status: "idle",
      spawnManagedEnv: { A: "old" },
      child: {},
    };
    p.entries.push(stale);
    let killed = 0,
      replenished = 0;
    p.terminateChild = async () => killed++;
    p.scheduleReplenish = () => replenished++;
    assert.equal(p.tryAcquire({ UNKNOWN: "x" }), null);
    assert.equal(p.entries.length, 1);
    assert.equal(p.tryAcquire({}, { A: "new" }), null);
    assert.equal(p.entries.length, 0);
    assert.equal(killed, 1);
    assert.equal(replenished, 1);
    assert.equal(stale.discarded, true);
  },
]);
prewarmLifecycleScenarios.push([
  "acquisition reserves once and snapshots trusted session delta",
  async (s) => {
    const { CliPrewarmPool } = s.pool();
    const p = new CliPrewarmPool({ poolSize: 1, logger });
    p.entries.push({
      status: "idle",
      spawnManagedEnv: { A: "1" },
      prewarmId: "owned",
      child: {},
    });
    const delta = { TRUSTED: "old" };
    let opts: any;
    p.doActivate = async (_entry: any, input: any) => (opts = input);
    const got = p.tryAcquire(
      delta,
      { A: "1", TRUSTED: "old" },
      new Set(["TRUSTED"]),
    );
    assert.ok(got);
    delta.TRUSTED = "new";
    assert.equal(p.tryAcquire(), null);
    await got.activate({ sessionId: "a" });
    assert.equal(opts.env.TRUSTED, "old");
  },
]);
prewarmLifecycleScenarios.push([
  "ready ACK enforces child identity and exact loopback ACP endpoint",
  async (s) => {
    const api = s.pool();
    const ready = {
      ok: true,
      cmd: "activate",
      status: "active",
      pid: 123,
      sessionId: "a",
      endpoint: "http://127.0.0.1:4321/api/v1/acp",
    };
    const expected = { expectedPid: 123, expectedSessionId: "a" };
    api.validateActivateReadyResponse(ready, expected);
    for (const bad of [
      { pid: 124 },
      { sessionId: "b" },
      { endpoint: "http://localhost:4321/api/v1/acp" },
      { endpoint: "http://127.0.0.1:4321/api/v1/acp?x=1" },
      { ok: false },
    ])
      assert.throws(() =>
        api.validateActivateReadyResponse({ ...ready, ...bad }, expected),
      );
  },
]);
prewarmLifecycleScenarios.push([
  "flush preserves active sessions and stop drains all tracked children",
  async (s) => {
    const { CliPrewarmPool } = s.pool();
    const p = new CliPrewarmPool({ poolSize: 1, logger });
    const active = {
        status: "activated",
        child: { id: "active" },
        sessionId: "a",
        acpEndpoint: "http://owned/api/v1/acp",
      },
      idle = { status: "idle", child: { id: "idle" } };
    p.entries.push(active, idle);
    p.bySession.set("a", active);
    const killed: string[] = [];
    let spawns = 0;
    p.terminateChild = async (c: any) => killed.push(c.id);
    p.spawnEntry = async () => spawns++;
    await p.flush();
    assert.deepEqual(killed, ["idle"]);
    assert.equal(spawns, 1);
    assert.equal(p.getActiveEndpointForSession("a"), "http://owned");
    await p.stop();
    assert.deepEqual(killed, ["idle", "active"]);
    assert.equal(p.entries.length, 0);
    assert.equal(p.bySession.size, 0);
    await p.stop();
    assert.equal(killed.length, 2);
  },
]);

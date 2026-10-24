import assert from "node:assert/strict";
export const sidecarManagerScenarios: Array<
  [string, (f: any) => Promise<void>]
> = [];
const logger = { info() {}, warn() {}, error() {}, log() {} };
export const managerBoundary = {
  loggerModule: { createWorkbuddyScopedLogger: () => logger },
  console: logger,
};
sidecarManagerScenarios.push([
  "health identity and PID are required, including envelope responses",
  async (factory) => {
    let payload: any = { status: "ok", runtimeInstanceId: "owned", pid: 42 };
    let ok = true;
    let headers: any;
    const api = factory({
      ...managerBoundary,
      gateway: {
        gatewaySecretHeaders: () => ({ Authorization: "Bearer owned" }),
      },
      fetch: async (_url: any, init: any) => {
        headers = init.headers;
        return { ok, status: 403, json: async () => payload };
      },
    });
    assert.deepEqual(
      await api.probeHostRuntimeEndpoint("http://owned", "owned", 42, 100),
      { kind: "ready" },
    );
    assert.equal(headers.Authorization, "Bearer owned");
    assert.equal(headers["X-CodeBuddy-Request"], "1");
    payload = { data: payload };
    assert.deepEqual(
      await api.probeHostRuntimeEndpoint("http://owned", "owned", 42, 100),
      { kind: "ready" },
    );
    assert.equal(
      (await api.probeHostRuntimeEndpoint("http://owned", "other", 42, 100))
        .kind,
      "identity-mismatch",
    );
    assert.equal(
      (await api.probeHostRuntimeEndpoint("http://owned", "owned", 43, 100))
        .kind,
      "identity-mismatch",
    );
    ok = false;
    await assert.rejects(
      api.waitForHostRuntimeEndpoint("http://owned", "owned", 42, 100),
      api.HostRuntimeIdentityMismatchError,
    );
    await assert.rejects(
      api.waitForHostRuntimeEndpoint(
        "http://owned",
        "owned",
        42,
        100,
        () => true,
      ),
      api.HostRuntimeStartSupersededError,
    );
  },
]);
sidecarManagerScenarios.push([
  "ensureStarted coalesces starts and disposed manager rejects",
  async (factory) => {
    const { SidecarManager } = factory(managerBoundary);
    const m = new SidecarManager();
    let calls = 0,
      release: any;
    m.ensureSidecar = () => {
      calls++;
      return new Promise((r) => (release = r));
    };
    const first = m.ensureStarted(),
      second = m.ensureStarted();
    assert.equal(first, second);
    assert.equal(calls, 1);
    release();
    await first;
    assert.equal(m.startPromise, null);
    m.disposed = true;
    await assert.rejects(m.ensureStarted(), /disposed/);
  },
]);
sidecarManagerScenarios.push([
  "adopted client close invalidates only its current generation",
  async (factory) => {
    const { SidecarManager } = factory(managerBoundary);
    const m = new SidecarManager();
    let oldClose: any, currentClose: any;
    const old = { onClose: (cb: any) => (oldClose = cb) },
      current = { onClose: (cb: any) => (currentClose = cb) };
    m.adoptClient(old);
    m.adoptClient(current);
    m.hostEndpoint = "owned";
    const c = new AbortController();
    m.hostRuntimeStartControllers.add(c);
    oldClose();
    assert.equal(m.hostEndpoint, "owned");
    currentClose();
    assert.equal(m.client, null);
    assert.equal(m.hostEndpoint, null);
    assert.equal(m.hostRuntimeGeneration, 1);
    assert.equal(c.signal.aborted, true);
  },
]);
sidecarManagerScenarios.push([
  "cleanup preserves active, kept, candidate and non-hosted sessions",
  async (factory) => {
    const { SidecarManager } = factory(managerBoundary);
    const m = new SidecarManager();
    const prefix = "__workbuddy_cli_host__-";
    const ids = ["active", "keep", "candidate", "stale"].map((n) => prefix + n);
    const killed: string[] = [];
    m.hostSessionId = ids[0];
    m.hostRuntimeCandidateSessionIds.add(ids[2]);
    m.client = {
      isConnected: true,
      listSessions: async () =>
        [...ids, "ordinary"].map((sessionId) => ({ sessionId })),
      killSession: async (id: string) => killed.push(id),
    };
    await m.cleanupHostedCliRuntimeSessions("owned", ids[1]);
    assert.deepEqual(killed, [ids[3]]);
  },
]);
sidecarManagerScenarios.push([
  "sidecar and prewarm endpoints merge and resolve with fallback",
  async (factory) => {
    const { SidecarManager } = factory(managerBoundary);
    const m = new SidecarManager();
    m.listSessions = async () => [
      { sessionId: "a", acpEndpoint: "http://a/api/v1/acp" },
    ];
    m.setPrewarmPool({
      getActiveEndpoints: () => ["http://a", "http://b"],
      getActiveEndpointForSession: (id: string) =>
        id === "b" ? "http://b" : undefined,
    });
    assert.deepEqual(await m.getAllActiveEndpoints(), ["http://a", "http://b"]);
    assert.equal(await m.resolveSessionHttpBase("a"), "http://a");
    assert.equal(await m.resolveSessionHttpBase("b"), "http://b");
    m.listSessions = async () => {
      throw new Error("closed");
    };
    assert.equal(await m.resolveSessionHttpBase("b"), "http://b");
  },
]);
sidecarManagerScenarios.push([
  "rotation skips inactive hosts, reset coalesces and fences starts",
  async (factory) => {
    const { SidecarManager } = factory(managerBoundary);
    const m = new SidecarManager();
    await m.rotateHostRuntime();
    assert.equal(m.hostRuntimeGeneration, 0);
    m.hostEndpoint = "owned";
    m.hostSessionId = "__workbuddy_cli_host__-owned";
    const c = new AbortController();
    m.hostRuntimeStartControllers.add(c);
    let disposed = 0;
    m.client = {
      isConnected: true,
      listSessions: async () => [],
      killSession: async () => {},
      dispose: () => disposed++,
    };
    const a = m.resetHostRuntime(),
      b = m.resetHostRuntime();
    assert.equal(a, b);
    await a;
    assert.equal(c.signal.aborted, true);
    assert.equal(m.hostRuntimeGeneration, 1);
    assert.equal(m.client, null);
    assert.equal(disposed, 1);
    assert.equal(m.hostResetPromise, null);
  },
]);
sidecarManagerScenarios.push([
  "original executable precedence and sidecar bootstrap environment",
  async (factory) => {
    const api = factory(managerBoundary);
    assert.deepEqual(
      api.resolveAgentCliExecutablePath({
        bundledCliPaths: ["/unverified/bundled"],
        envCliPath: "/env",
        exists: () => false,
      }),
      { path: "/unverified/bundled", source: "bundled" },
    );
    assert.deepEqual(
      api.buildSidecarProcessEnv(
        { WORKBUDDY_CONFIG_DIR: "/owned", IGNORED: "x" },
        { KEEP: "yes", NODE_OPTIONS: "bad" },
        { ELECTRON_RUN_AS_NODE: "0" },
      ),
      {
        KEEP: "yes",
        NODE_OPTIONS: "",
        WORKBUDDY_CONFIG_DIR: "/owned",
        ELECTRON_RUN_AS_NODE: "1",
      },
    );
  },
]);

sidecarManagerScenarios.push([
  "original shutdown rejects after close callback clears client",
  async (factory) => {
    const { SidecarManager } = factory(managerBoundary);
    const manager = new SidecarManager();
    let close: any,
      disposed = false;
    manager.adoptClient({
      isConnected: true,
      onClose: (fn: any) => (close = fn),
      shutdown: async () => {
        close();
        return true;
      },
      dispose: () => (disposed = true),
    });
    await assert.rejects(
      manager.shutdown(),
      (error: any) =>
        error instanceof TypeError && /dispose/.test(error.message),
    );
    assert.equal(manager.client, null);
    assert.equal(disposed, false);
  },
]);

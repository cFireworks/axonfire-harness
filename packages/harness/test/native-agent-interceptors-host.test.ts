import test from "node:test";
import assert from "node:assert/strict";
import { agentRunFixture } from "../scripts/helpers/agent-run-fixture.js";
import { createNativeAgentInterceptorsHost } from "../src/agents/native-agent-interceptors-host.js";
import { NATIVE_AGENT_RUN_REGISTRATIONS } from "../src/agents/native-agent-run-registration.js";

// Explicit component-test boundaries. This does not bootstrap product services.
async function fixture(overrides: Record<string, any> = {}) {
  const f = await agentRunFixture();
  const namespaces: Record<number, any> = {
    69466: { ...f.n.getModule(69466) },
  };
  const bindings = new Map<any, any>();
  for (const entry of NATIVE_AGENT_RUN_REGISTRATIONS)
    for (const p of entry.properties) {
      const ns = (namespaces[p.tokenModule] ??= {});
      const token = (ns[p.tokenExport] ??= Symbol(
        `${p.tokenModule}.${p.tokenExport}`,
      ));
      if (p.optional && !(p.property in overrides)) continue;
      if (!bindings.has(token))
        bindings.set(
          token,
          overrides[p.property] ?? (p.property === "logger" ? f.logger : {}),
        );
    }
  const options = {
    execution: f.runHost,
    getModule: (id: number) => namespaces[id],
    container: {
      isBound: (token: any) => bindings.has(token),
      get: (token: any) => bindings.get(token),
    },
  };
  return { f, bindings, options };
}

test("all 31 original registrations initialize and attach with original cached provider", async () => {
  const { f, options } = await fixture();
  const before = f.service.agentRunInterceptorProvider;
  const h = createNativeAgentInterceptorsHost(options);
  try {
    assert.equal(h.instances.size, 31);
    assert.equal(h.instances.has("ContinueAgentRunInterceptor"), false);
    assert.equal(h.instances.has("ChannelEventAgentRunInterceptor"), false);
    assert.equal(
      h.instances.has("SandboxTurnTelemetryAgentRunInterceptor"),
      true,
    );
    assert.equal(
      h.instances.get("WorktreeContextInterceptor").constructor,
      f.runHost.modules[59233].WorktreeContextInterceptor,
    );
    assert.throws(() => h.attach(), /Initialize/);
    const starting = h.start();
    assert.equal(h.start(), starting);
    await starting;
    h.attach();
    h.attach();
    assert.equal(f.service.agentRunInterceptorProvider, h.provider);
    const values = h.provider.sortSync();
    assert.equal(values.length, 31);
    assert.equal(h.provider.get(), values);
    assert.ok(
      values.every(
        (v: any, i: number) => i === 0 || values[i - 1].priority >= v.priority,
      ),
    );
    await h.close();
    assert.equal(f.service.agentRunInterceptorProvider, before);
    await assert.rejects(h.start(), /closing/);
  } finally {
    await h.close();
    await f.close();
  }
});

test("preflight reports missing required bindings without constructing partial graph", async () => {
  const { f, options, bindings } = await fixture();
  try {
    bindings.clear();
    assert.throws(
      () => createNativeAgentInterceptorsHost(options),
      (e: any) =>
        e instanceof AggregateError &&
        e.errors.some((x: any) => x.message.includes("logger")),
    );
  } finally {
    await f.close();
  }
});

test("borrowed filters apply before original priority caching", async () => {
  const { f, options } = await fixture();
  const h = createNativeAgentInterceptorsHost({
    ...options,
    filterRegistry: {
      applyFilters: (items: any[]) =>
        items.filter(
          (x) =>
            x.constructor ===
            f.runHost.modules[59233].WorktreeContextInterceptor,
        ),
    },
  });
  try {
    await h.start();
    assert.equal(h.provider.sortSync().length, 1);
  } finally {
    await h.close();
    await f.close();
  }
});

test("sandbox subscription is released and accepted callback drained without stopping borrowed lifecycle", async () => {
  let callback!: (event: any) => Promise<void>,
    released = 0,
    stopped = 0,
    finish!: () => void;
  const gate = new Promise<void>((r) => (finish = r));
  const lifecycle = {
    onSessionReady(cb: typeof callback) {
      assert.equal(this, lifecycle);
      callback = cb;
      return () => {
        released++;
      };
    },
    stop() {
      stopped++;
    },
  };
  const { f, options } = await fixture({
    sandboxLifecycle: lifecycle,
    sandboxTurnConfig: { useSandboxCLI: true },
    sandboxRuleSyncService: { syncRulesOnTurnStart: () => gate },
  });
  const h = createNativeAgentInterceptorsHost(options);
  try {
    const sandbox = h.instances.get("SandboxAgentRunInterceptor");
    sandbox.syncModifyBackupConfig = async () => {};
    await h.start();
    const work = callback({
      sessionId: "owned",
      generation: 1,
      reason: "test",
    });
    let closed = false;
    const closing = h.close().then(() => {
      closed = true;
    });
    await new Promise((r) => setImmediate(r));
    assert.equal(released, 1);
    assert.equal(closed, false);
    await assert.rejects(callback({ sessionId: "late" }), /closing/);
    finish();
    await work;
    await closing;
    assert.equal(stopped, 0);
    assert.equal(sandbox._sessionReadySyncedThisTurn, true);
  } finally {
    finish();
    await h.close();
    await f.close();
  }
});

test("close preserves a provider replaced by the borrowed execution owner", async () => {
  const { f, options } = await fixture();
  const h = createNativeAgentInterceptorsHost(options);
  try {
    await h.start();
    h.attach();
    const replacement = {};
    f.service.agentRunInterceptorProvider = replacement;
    await h.close();
    assert.equal(f.service.agentRunInterceptorProvider, replacement);
  } finally {
    await h.close();
    await f.close();
  }
});

test("execution host uses parent filter-registry Symbol identity", async () => {
  let applied = 0;
  const f = await agentRunFixture(undefined, {
    componentFilterRegistry: {
      applyFilters: () => {
        applied++;
        return [];
      },
    },
  });
  try {
    f.interceptors.push({
      priority: 100,
      intercept() {
        throw Error("excluded interceptor ran");
      },
    });
    await f.service.run(f.agent, [], { context: f.s });
    assert.equal(applied, 1);
    assert.equal(f.service.agentRunInterceptorProvider.get().length, 0);
  } finally {
    await f.close();
  }
});

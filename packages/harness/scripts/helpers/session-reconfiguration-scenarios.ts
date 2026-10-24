import assert from "node:assert/strict";
import { createNativeSessionConfiguration } from "../../src/sessions/native-session-reconfiguration.js";
type Factory = typeof createNativeSessionConfiguration;
function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((r) => {
    resolve = r;
  });
  return { resolve, promise };
}
function fixture(factory: Factory, options: any = {}) {
  const calls: any[] = [],
    policies: any[] = [];
  let resolved = 0;
  const initial = {
    model: "old-model",
    permissionMode: "default",
    tools: "Read",
    restartFingerprint: "ask",
  };
  const session: any = {
    sessionId: "owned",
    cwd: process.cwd(),
    desiredConfig: { mode: "ask", model: "old-model" },
    runtimeConfig: initial,
    modeEpoch: 0,
    isProcessing: true,
  };
  const runtime = factory({
    createBackend() {
      throw Error("unexpected live restart");
    },
    wireBackend() {},
    registerSessionDeferredBuiltinPolicy: (id, p) =>
      policies.push([id, p.scope]),
    withReadySession: async (id, operation, cwd, opts) => {
      assert.equal(id, "owned");
      assert.equal(opts.skipAwaitRestart, true);
      return operation(session);
    },
    toSessionInfo: (s) => ({
      sessionId: s.sessionId,
      mode: s.desiredConfig.mode,
      model: s.desiredConfig.model,
    }),
    persistSessionDesiredConfig: async (s, o) => {
      calls.push(["persist", o]);
      await options.persist?.(s, o);
    },
    resolveRuntimeConfig: async (r) => {
      resolved++;
      await options.resolve?.(r);
      return {
        ...initial,
        ...r.desiredConfig,
        restartFingerprint: r.desiredConfig.mode,
        promptVariables: r.desiredConfig.variables,
      };
    },
    disabledToolsResolver: () => ["Bash"],
    console: { warn: (...args) => calls.push(["warn", ...args]) },
  });
  const backend = runtime.createBackendReconfiguration({
    sessionId: "owned",
    runtimeConfig: initial,
    setSessionMode: async (r) => {
      calls.push(["mode", r.modeId]);
      await options.mode?.(r);
    },
    setSessionModel: async (r) => {
      calls.push(["model", r.modelId]);
      await options.model?.(r);
    },
  });
  session.backend = Object.assign(backend, {
    setSandboxMode: async (enabled: any, reason: any) => {
      calls.push(["sandbox", enabled, reason]);
      await options.sandbox?.();
    },
  });
  return {
    ...runtime,
    session,
    backend,
    calls,
    policies,
    get resolved() {
      return resolved;
    },
  };
}
export const sessionReconfigurationScenarios: [
  string,
  (factory: Factory) => Promise<void>,
][] = [
  [
    "backend detects restart reasons in original precedence",
    async (factory) => {
      const f = fixture(factory);
      const base = f.backend.runtimeConfig;
      const rows = [
        ["tools", "Write", "tools changed"],
        ["restartFingerprint", "new", "restart fingerprint changed"],
        ["runtimeIdentity", "new", "runtime identity changed"],
        [
          "permissionModeBeforePlan",
          "default",
          "permission mode before plan changed",
        ],
        ["welcomeMode", "work", "welcomeMode changed"],
        ["promptVariables", { x: 1 }, "prompt variables changed"],
      ];
      for (const [key, value, reason] of rows) {
        assert.deepEqual(
          await f.backend.reconfigure({
            runtimeConfig: { ...base, [key as string]: value },
          }),
          { kind: "restart_required", reason },
        );
        assert.equal(f.backend.runtimeConfig, base);
      }
      f.backend.dependencies.getAgentTeamsEnv = () => "1";
      assert.equal(
        (await f.backend.reconfigure({ runtimeConfig: base })).reason,
        "agent-teams env drift",
      );
      assert.equal(f.calls.length, 0);
    },
  ],
  [
    "backend applies permission then model and retains partial side effect on failure",
    async (factory) => {
      const f = fixture(factory, {
        model: async () => {
          throw Error("owned-model-failure");
        },
      });
      const base = f.backend.runtimeConfig;
      await assert.rejects(
        f.backend.reconfigure({
          runtimeConfig: {
            ...base,
            model: "new",
            permissionMode: "acceptEdits",
          },
        }),
        /owned-model-failure/,
      );
      assert.deepEqual(f.calls, [
        ["mode", "acceptEdits"],
        ["model", "new"],
      ]);
      assert.equal(f.backend.runtimeConfig, base);
      const g = fixture(factory);
      assert.deepEqual(
        await g.backend.reconfigure({ runtimeConfig: g.backend.runtimeConfig }),
        { kind: "noop" },
      );
      assert.deepEqual(
        await g.backend.reconfigure({
          runtimeConfig: {
            ...g.backend.runtimeConfig,
            sessionSettings: { owned: 1 },
          },
        }),
        { kind: "applied" },
      );
      assert.equal(g.calls.length, 0);
      assert.deepEqual(g.backend.runtimeConfig.sessionSettings, { owned: 1 });
    },
  ],
  [
    "model-only mutation avoids resolver, hot-applies and persists",
    async (factory) => {
      const f = fixture(factory);
      const result = await f.controller.updateSessionConfig("owned", {
        model: "next-model",
      });
      assert.equal(result.model, "next-model");
      assert.equal(f.resolved, 0);
      assert.equal(f.session.runtimeConfig.model, "next-model");
      assert.equal(f.session.pendingRuntimeConfig, undefined);
      assert.equal(f.calls[0][0], "model");
      assert.equal(f.calls[1][0], "persist");
    },
  ],
  [
    "sandbox-only mutation bypasses cwd and resolver; standalone reason is ignored",
    async (factory) => {
      const f = fixture(factory);
      f.session.cwd = "/owned/nonexistent/session-config-cwd";
      await f.controller.updateSessionConfig("owned", {
        sandboxDisabledReason: "session-local-environment-selected",
      });
      assert.equal(f.calls.length, 0);
      await f.controller.updateSessionConfig("owned", {
        useSandboxCLI: false,
        sandboxDisabledReason: "session-local-environment-selected",
      });
      assert.equal(f.resolved, 0);
      assert.deepEqual(f.calls[0], [
        "sandbox",
        false,
        "session-local-environment-selected",
      ]);
      assert.deepEqual(f.controller.runtimeSandboxOverrides.get("owned"), {
        enabled: false,
        disabledReason: "session-local-environment-selected",
      });
      await f.controller.updateSessionConfig("owned", { useSandboxCLI: true });
      assert.equal(f.session.desiredConfig.sandboxDisabledReason, undefined);
    },
  ],
  [
    "expert precondition skips mutation, callback and override",
    async (factory) => {
      const f = fixture(factory);
      f.session.desiredConfig.expertId = " current ";
      let matched = 0;
      const result = await f.controller.updateSessionConfig(
        "owned",
        { model: "new" },
        undefined,
        { expectedExpertId: "wrong", onPreconditionMatched: () => matched++ },
      );
      assert.equal(result.configUpdateApplied, false);
      assert.equal(matched, 0);
      assert.equal(f.calls.length, 0);
      const ok = await f.controller.updateSessionConfig(
        "owned",
        { model: "new" },
        undefined,
        { expectedExpertId: "current", onPreconditionMatched: () => matched++ },
      );
      assert.equal(ok.configUpdateApplied, true);
      assert.equal(matched, 1);
    },
  ],
  [
    "mode mutation queues restart while busy and derives disabled tools",
    async (factory) => {
      const f = fixture(factory);
      await f.controller.updateSessionConfig("owned", { mode: "craft" });
      assert.equal(f.session.desiredConfig.mode, "craft");
      assert.equal(f.session.runtimeConfig.restartFingerprint, "ask");
      assert.equal(f.session.pendingRuntimeConfig.restartFingerprint, "craft");
      assert.equal(f.session.modeEpoch, 1);
      assert.equal(
        f.session.pendingRuntimeConfig.tools.split(",").includes("Bash"),
        false,
      );
      assert.ok(f.session.pendingRuntimeConfig.tools.includes("Write"));
      assert.equal(f.resolved, 1);
    },
  ],
  [
    "addon selection takes explicit precedence and clears stale tools",
    async (factory) => {
      const f = fixture(factory);
      await f.controller.updateSessionConfig("owned", {
        addonSelection: {
          version: 1,
          interactionMode: "plan",
          welcomeMode: "working",
          enabledPluginIds: [
            "custom@owned",
            "interactionmode-ask@workbuddy-builtin",
          ],
        },
      });
      assert.equal(f.session.desiredConfig.mode, "plan");
      assert.equal(f.session.desiredConfig.welcomeMode, "work");
      assert.equal(f.session.desiredConfig.tools, undefined);
      assert.deepEqual(
        f.session.desiredConfig.addonSelection.enabledPluginIds,
        ["custom@owned"],
      );
      assert.equal(f.session.pendingRuntimeConfig.permissionMode, "plan");
    },
  ],
  [
    "per-session mutations serialize and survive a rejected operation",
    async (factory) => {
      const started = deferred(),
        release = deferred();
      let attempts = 0;
      const f = fixture(factory, {
        model: async () => {
          if (++attempts === 1) {
            started.resolve();
            await release.promise;
            throw Error("first failed");
          }
        },
      });
      const first = f.controller.updateSessionConfig("owned", {
        model: "first",
      });
      const firstResult = assert.rejects(first, /first failed/);
      await started.promise;
      const second = f.controller.updateSessionConfig("owned", {
        model: "second",
      });
      assert.equal(attempts, 1);
      release.resolve();
      await firstResult;
      await second;
      assert.equal(f.session.desiredConfig.model, "second");
      assert.equal(attempts, 2);
      await Promise.resolve();
      assert.equal(f.controller.sessionConfigMutationTails.size, 0);
    },
  ],
  [
    "model patch with pending restart uses resolver and preserves full pending change",
    async (factory) => {
      const f = fixture(factory);
      await f.controller.updateSessionConfig("owned", { mode: "craft" });
      await f.controller.updateSessionConfig("owned", { model: "latest" });
      assert.equal(f.resolved, 2);
      assert.equal(f.session.pendingDesiredConfig.mode, "craft");
      assert.equal(f.session.pendingRuntimeConfig.model, "latest");
      assert.equal(f.session.runtimeConfig.model, "old-model");
    },
  ],
];

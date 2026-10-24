import assert from "node:assert/strict";
import { createNativeSessionRestart } from "../../src/sessions/native-session-restart.js";
type Factory = typeof createNativeSessionRestart;
function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}
function fixture(factory: Factory, options: any = {}) {
  const calls: string[] = [],
    policies: any[] = [],
    queues: any[] = [],
    warnings: any[] = [];
  let created = 0;
  const old: any = {
    getMessageQueue: async () => {
      calls.push("snapshot");
      if (options.snapshotError) throw Error("snapshot");
      return options.queue;
    },
    releaseRuntime: async () => {
      calls.push("release");
      if (options.releaseError) throw Error("release");
    },
    destroy: async () => {
      calls.push("destroy-old");
      if (options.destroyError) throw Error("destroy-old");
    },
  };
  const runtime = factory({
    createBackend(request) {
      calls.push("create");
      created++;
      assert.equal(request.sessionId, "owned-session");
      return {
        id: "replacement",
        async initialize(input: any) {
          calls.push("initialize");
          assert.equal(input.kind, "load");
          assert.equal(input.request.sessionId, "owned-session");
          await options.initialize?.(created);
          return {
            sessionId: options.mismatch ? "wrong-session" : "owned-session",
          };
        },
        async saveMessageQueue(queue: any) {
          calls.push("queue");
          queues.push(queue);
          if (options.setterErrors) throw Error("queue");
        },
        async setSessionModel(input: any) {
          calls.push("model:" + input.modelId);
          if (options.setterErrors) throw Error("model");
        },
        async setSessionMode(input: any) {
          calls.push("mode:" + input.modeId);
          if (options.setterErrors) throw Error("mode");
        },
        async setSandboxMode(enabled: boolean) {
          calls.push("sandbox:" + enabled);
          if (options.setterErrors) throw Error("sandbox");
        },
        async getMessageQueue() {
          calls.push("snapshot-new");
        },
        async releaseRuntime() {
          calls.push("release-new");
        },
        async destroy() {
          calls.push("destroy-new");
        },
      };
    },
    wireBackend() {
      calls.push("wire");
    },
    registerSessionDeferredBuiltinPolicy(id, policy) {
      assert.equal(id, "owned-session");
      policies.push(policy.scope);
    },
    console: { warn: (...args: any[]) => warnings.push(args) },
  });
  const session: any = {
    sessionId: "owned-session",
    backendId: "owned-backend",
    cwd: process.cwd(),
    backend: old,
    modeEpoch: 0,
    desiredConfig: { mode: "craft" },
    runtimeConfig: { restartFingerprint: "old" },
    pendingDesiredConfig: { mode: "ask", useSandboxCLI: false },
    pendingRuntimeConfig: {
      restartFingerprint: "new",
      model: "owned-model",
      permissionMode: "default",
      addonManifest: { selected: { interactionMode: "ask" } },
    },
  };
  return {
    ...runtime,
    session,
    calls,
    policies,
    queues,
    warnings,
    get created() {
      return created;
    },
  };
}
export const sessionRestartScenarios: [
  string,
  (factory: Factory) => Promise<void>,
][] = [
  [
    "releases old runtime, loads same identity and restores only unsent queue",
    async (factory) => {
      const queue = {
        conversationId: "old-id",
        items: [
          { id: "sending", status: "sending", order: 9, lastAttemptAt: 123 },
          { id: "sent", status: "sent", order: 0 },
          { id: "pending", status: "pending", order: 2 },
        ],
        runtime: {
          activated: true,
          paused: true,
          pauseReason: "error",
          lastError: "owned-error",
        },
      };
      const f = fixture(factory, { queue });
      await f.controller.applyPendingRuntimeConfigBeforePrompt(f.session);
      assert.deepEqual(f.calls, [
        "snapshot",
        "create",
        "release",
        "destroy-old",
        "initialize",
        "wire",
        "queue",
        "model:owned-model",
        "mode:default",
        "sandbox:false",
      ]);
      assert.deepEqual(f.policies, ["explicit-defer-only"]);
      assert.equal(f.session.modeEpoch, 1);
      assert.equal(f.session.pendingPromptCancelCause, "backend_restart");
      assert.equal(f.session.pendingBackendRestart, undefined);
      const restored = f.queues[0];
      assert.equal(restored.conversationId, "owned-session");
      assert.deepEqual(
        restored.items.map((i: any) => [
          i.id,
          i.status,
          i.order,
          i.lastAttemptAt,
        ]),
        [
          ["pending", "pending", 0, undefined],
          ["sending", "pending", 1, undefined],
        ],
      );
      assert.equal(restored.runtime.activated, false);
      assert.equal(restored.runtime.paused, true);
      assert.equal(restored.runtime.lastError, "owned-error");
      assert.equal(queue.items[0]!.status, "sending");
      assert.equal(queue.items[0]!.lastAttemptAt, 123);
    },
  ],
  [
    "busy, cancellation and invocation barriers defer without consuming pending config",
    async (factory) => {
      for (const flag of [
        "isProcessing",
        "stopRequested",
        "promptInvocationActive",
        "disposing",
      ]) {
        const f = fixture(factory);
        f.session[flag] = true;
        await f.controller.applyPendingRuntimeConfigBeforePrompt(f.session);
        assert.equal(f.created, 0);
        assert.equal(f.session.pendingRuntimeConfig.restartFingerprint, "new");
        f.session[flag] = false;
        await f.controller.applyPendingRuntimeConfigBeforePrompt(f.session);
        assert.equal(f.created, 1);
      }
    },
  ],
  [
    "concurrent drains serialize and consume newer config arriving during initialization",
    async (factory) => {
      const entered = deferred(),
        release = deferred();
      const f = fixture(factory, {
        initialize: async (n: number) => {
          if (n === 1) {
            entered.resolve();
            await release.promise;
          }
        },
      });
      const first = f.controller.applyPendingRuntimeConfigBeforePrompt(
        f.session,
      );
      await entered.promise;
      const second = f.controller.applyPendingRuntimeConfigBeforePrompt(
        f.session,
      );
      f.session.pendingDesiredConfig = { mode: "craft" };
      f.session.pendingRuntimeConfig = {
        restartFingerprint: "newest",
        permissionMode: "acceptEdits",
      };
      assert.equal(f.created, 1);
      release.resolve();
      await Promise.all([first, second]);
      assert.equal(f.created, 2);
      assert.equal(f.session.modeEpoch, 2);
      assert.equal(f.session.runtimeConfig.restartFingerprint, "newest");
      assert.ok(f.calls.indexOf("wire") < f.calls.indexOf("snapshot-new"));
      assert.equal(f.session.pendingBackendRestart, undefined);
    },
  ],
  [
    "initialization failure requeues config; retry can succeed",
    async (factory) => {
      const f = fixture(factory, {
        initialize: async (n: number) => {
          if (n === 1) throw Error("owned-init-failure");
        },
      });
      await assert.rejects(
        f.controller.applyPendingRuntimeConfigBeforePrompt(f.session),
        /owned-init-failure/,
      );
      assert.equal(f.session.modeEpoch, 0);
      assert.equal(f.session.pendingRuntimeConfig.restartFingerprint, "new");
      assert.deepEqual(f.policies, ["explicit-defer-only", "all"]);
      assert.ok(f.calls.includes("destroy-new"));
      await f.controller.applyPendingRuntimeConfigBeforePrompt(f.session);
      assert.equal(f.created, 2);
      assert.equal(f.session.modeEpoch, 1);
    },
  ],
  [
    "failed restart preserves a newer pending config instead of overwriting it",
    async (factory) => {
      const f = fixture(factory, {
        initialize: async () => {
          f.session.pendingDesiredConfig = { mode: "plan" };
          f.session.pendingRuntimeConfig = { restartFingerprint: "latest" };
          throw Error("owned-failure");
        },
      });
      await assert.rejects(
        f.controller.applyPendingRuntimeConfigBeforePrompt(f.session),
        /owned-failure/,
      );
      assert.equal(f.session.pendingRuntimeConfig.restartFingerprint, "latest");
      assert.equal(f.session.pendingDesiredConfig.mode, "plan");
    },
  ],
  [
    "mismatched replacement identity is rejected and destroyed",
    async (factory) => {
      const f = fixture(factory, { mismatch: true });
      await assert.rejects(
        f.controller.applyPendingRuntimeConfigBeforePrompt(f.session),
        /mismatched session id/,
      );
      assert.equal(f.session.modeEpoch, 0);
      assert.equal(f.calls.includes("wire"), false);
      assert.equal(f.calls.at(-1), "destroy-new");
    },
  ],
  [
    "unavailable cwd drops attempted config before touching backend",
    async (factory) => {
      const f = fixture(factory);
      f.session.cwd = import.meta.filename;
      await assert.rejects(
        f.controller.applyPendingRuntimeConfigBeforePrompt(f.session),
        (e: any) => e.name === "SessionCwdUnavailableError",
      );
      assert.deepEqual(f.calls, []);
      assert.equal(f.session.pendingDesiredConfig, undefined);
      assert.equal(f.session.pendingRuntimeConfig, undefined);
    },
  ],
  [
    "cleanup and setter failures retain original best-effort behavior",
    async (factory) => {
      const f = fixture(factory, {
        releaseError: true,
        destroyError: true,
        setterErrors: true,
        queue: { items: [{ status: "pending" }] },
      });
      f.session.pendingPromptCancelCause = "user_cancel";
      await f.controller.applyPendingRuntimeConfigBeforePrompt(f.session);
      assert.equal(f.session.modeEpoch, 1);
      assert.equal(f.session.pendingPromptCancelCause, "user_cancel");
      assert.equal(f.warnings.length, 4);
      const g = fixture(factory, { snapshotError: true });
      await g.controller.applyPendingRuntimeConfigBeforePrompt(g.session);
      assert.equal(g.session.modeEpoch, 1);
      assert.equal(g.warnings.length, 1);
    },
  ],
  [
    "same fingerprint ignores rendered prompt and settings but compares variables stably",
    async (factory) => {
      const f = fixture(factory);
      const left = {
        restartFingerprint: "same",
        systemPrompt: "first",
        sessionSettings: { x: 1 },
        promptVariables: { b: 2, a: 1 },
      };
      const right = {
        ...left,
        systemPrompt: "second",
        sessionSettings: { x: 2 },
        promptVariables: { a: 1, b: 2 },
      };
      assert.equal(f.isSameSessionRuntimeConfig(left, right), true);
      assert.equal(
        f.isSameSessionRuntimeConfig(left, {
          ...right,
          promptVariables: { a: 2, b: 2 },
        }),
        false,
      );
      assert.equal(
        f.isSameSessionRuntimeConfig(
          { systemPrompt: "first" },
          { systemPrompt: "second" },
        ),
        false,
      );
      f.session.runtimeConfig = left;
      f.session.pendingRuntimeConfig = right;
      await f.controller.applyPendingRuntimeConfigBeforePrompt(f.session);
      assert.equal(f.created, 0);
      assert.equal(f.session.runtimeConfig.systemPrompt, "second");
      assert.equal(f.session.pendingDesiredConfig, undefined);
    },
  ],
  [
    "queue normalization clears non-error pause and rejects empty recovery",
    async (factory) => {
      const f = fixture(factory);
      assert.equal(
        f.normalizeQueueForRestart(
          { items: [{ status: "sent" }, { status: "deleted" }, null] },
          "s",
        ),
        undefined,
      );
      for (const pauseReason of ["manual", undefined]) {
        const q = f.normalizeQueueForRestart(
          {
            items: [{ status: "sending" }],
            runtime: { paused: true, pauseReason, lastError: "stale" },
          },
          "s",
        );
        assert.equal(q.runtime.paused, false);
        assert.equal(q.runtime.lastError, undefined);
        assert.equal(q.version, 0);
      }
      assert.deepEqual(
        [
          ...f.deriveSessionDeferredBuiltinPolicy(
            "Read, Defer( LSP ), Defer(ImageGen)",
          ).allowedTools,
        ],
        ["LSP", "ImageGen"],
      );
    },
  ],
];

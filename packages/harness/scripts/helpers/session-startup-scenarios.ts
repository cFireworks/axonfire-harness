import assert from "node:assert/strict";
import { attachNativeSessionStartup } from "../../src/sessions/native-session-startup.js";
import { attachNativeSessionReadiness } from "../../src/sessions/native-session-readiness.js";
import { createNativeSessionConfiguration } from "../../src/sessions/native-session-reconfiguration.js";
import { createNativeSessionModes } from "../../src/sessions/native-session-modes.js";
type Attach = typeof attachNativeSessionStartup;
function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((r) => {
    resolve = r;
  });
  return { resolve, promise };
}
function fixture(attach: Attach, options: any = {}) {
  const calls: any[] = [],
    created: any[] = [],
    sessions = new Map<string, any>();
  const register = (id: string, p: any) =>
    calls.push(["register", id, p.scope]);
  const runtime = createNativeSessionConfiguration({
    createBackend(request) {
      const backend = {
        id: "owned-backend",
        async initialize(input: any) {
          calls.push(["initialize", input.kind]);
          await options.initialize?.(input);
          return { sessionId: options.mismatch ? "wrong" : request.sessionId };
        },
        async destroy() {
          calls.push(["destroy"]);
        },
        async setSessionMode(r: any) {
          calls.push(["mode", r.modeId]);
          if (options.setterErrors) throw Error("mode");
        },
        async setSandboxMode(enabled: any, reason: any) {
          calls.push(["sandbox", enabled, reason]);
          if (options.setterErrors) throw Error("sandbox");
        },
      };
      created.push({ request, backend });
      return backend;
    },
    wireBackend: () => calls.push(["wire"]),
    registerSessionDeferredBuiltinPolicy: register,
    withReadySession: async () => {
      throw Error("unattached readiness");
    },
    toSessionInfo: (s) => s,
    persistSessionDesiredConfig: async () => {},
    resolveRuntimeConfig: async (r) =>
      createNativeSessionModes().buildFallbackRuntimeConfig(r.desiredConfig),
    disabledToolsResolver: options.disabledToolsResolver,
  });
  const controller = runtime.controller;
  attachNativeSessionReadiness(controller, {
    sessions,
    resolveStoredEntry: async () => options.stored,
    startSession: async () => {
      throw Error("unattached startup");
    },
    replaceSessionReplayState() {},
  });
  const attached = attach(controller, {
    deriveSessionDeferredBuiltinPolicy:
      runtime.deriveSessionDeferredBuiltinPolicy,
    registerSessionDeferredBuiltinPolicy: register,
    unregisterSessionDeferredBuiltinPolicy: (id) =>
      calls.push(["unregister", id]),
    ensureStoredSessionRecord: async (s, g) => {
      calls.push(["persist", g]);
      await options.persist?.(s, g, controller);
    },
    finishHistoryHydrationAfterBackendReplay: (s) => {
      calls.push(["hydrate-success"]);
      s.historyHydrationDepth = 0;
    },
    finishHistoryHydration: () => calls.push(["hydrate-failure"]),
    getCurrentUserId: () => options.user,
    console: { warn: () => calls.push(["warn"]) },
  });
  const start = (kind = "new", config: any = {}, extra: any = {}) =>
    controller.startSession(
      { cwd: process.cwd(), sessionId: "owned", config, ...extra },
      kind,
    );
  return { ...attached, start, created, calls, sessions };
}
export const sessionStartupScenarios: [
  string,
  (attach: Attach) => Promise<void>,
][] = [
  [
    "new startup initializes original state and validates identity before publication",
    async (attach) => {
      const f = fixture(attach);
      const s = await f.start("new", { mode: "ask" });
      assert.equal(s.sessionId, "owned");
      assert.equal(s.modeEpoch, 1);
      assert.equal(s.ownerHistoryHydrated, true);
      assert.equal(s.historyHydrationDepth, 0);
      assert.equal(s.taskState.runState, "idle");
      assert.equal(s.isProcessing, false);
      assert.ok(s.pendingPermissionRequests instanceof Map);
      assert.ok(s.pendingQuestionRequests instanceof Map);
      assert.equal(f.sessions.get("owned"), s);
      assert.equal(
        s.desiredConfig.permissionModeBeforePlan,
        "bypassPermissions",
      );
      assert.deepEqual(
        f.calls.map((c) => c[0]),
        ["wire", "register", "initialize", "persist", "mode"],
      );
      assert.equal(f.controller.getSessionLifecycleGeneration("owned"), 1);
    },
  ],
  [
    "restore applies stored expert fields and isolates foreign project ownership",
    async (attach) => {
      const f = fixture(attach, {
        user: "current-user",
        stored: {
          createdAt: 10,
          updatedAt: 20,
          mode: "expert",
          model: "stored-model",
          expertId: "expert",
          expertLocale: "en",
          expertRuntimeIdentity: "r",
          expertMarketplace: "market",
          permissionMode: "default",
          userId: "other-user",
          projectId: "other-project",
          sourceMode: "working",
          status: "completed",
          lastUserPromptExpertSelection: {
            version: 1,
            selection: { expertId: "old" },
          },
        },
      });
      const s = await f.start("resume");
      assert.equal(s.createdAt, 10);
      assert.equal(s.updatedAt, 20);
      assert.equal(s.desiredConfig.expertId, "expert");
      assert.equal(s.desiredConfig.locale, "en");
      assert.equal(s.desiredConfig.runtimeIdentity, "r");
      assert.equal(s.desiredConfig.expertMarketplace, "market");
      assert.equal(s.desiredConfig.welcomeMode, "work");
      assert.equal(s.projectId, undefined);
      assert.equal(s.userId, "other-user");
      assert.equal(s.taskState.terminalOutcome, "completed");
      assert.equal(s.lastUserPromptExpertSelection.expertId, "old");
    },
  ],
  [
    "explicit fields override stored metadata and propagate project environment",
    async (attach) => {
      const f = fixture(attach, {
        user: " current ",
        stored: {
          mode: "ask",
          model: "old",
          sourceMode: "working",
          userId: "current",
          projectId: "stored",
        },
      });
      const s = await f.start(
        "load",
        { mode: "craft", model: "new", welcomeMode: "design" },
        {
          projectId: "explicit",
          env: { OWNED: "yes" },
          _meta: {
            "codebuddy.ai": {
              sessionOwnerUserId: " owner ",
              isAutomationBackground: true,
            },
          },
        },
      );
      assert.equal(s.projectId, "explicit");
      assert.equal(s.env.CODEBUDDY_PROJECT_ID, "explicit");
      assert.equal(s.env.OWNED, "yes");
      assert.equal(s.userId, "owner");
      assert.equal(s._meta["codebuddy.ai"].sourceMode, "design");
      assert.equal(s.desiredConfig.model, "new");
      assert.equal(s.ownerHistoryHydrated, false);
      assert.ok(f.calls.some((c) => c[0] === "hydrate-success"));
    },
  ],
  [
    "stored plugin context restored unless explicitly overridden",
    async (attach) => {
      const context = {
        version: 1,
        projectResources: {
          connectorSkillIds: [],
          mcpServerNames: [],
          projectSkillNames: [],
        },
        selectedPluginIds: [
          "custom@owned",
          "interactionmode-ask@workbuddy-builtin",
        ],
        microSceneIds: ["micro"],
        pluginSettings: {
          extraKnownMarketplaces: {},
          enabledPlugins: { "custom@owned": true },
        },
      };
      const f = fixture(attach, {
        stored: { mode: "ask", sourceMode: "coding", pluginContext: context },
      });
      const s = await f.start("resume");
      assert.equal(s.persistPluginContext, true);
      assert.deepEqual(s.desiredConfig.addonSelection.enabledPluginIds, [
        "custom@owned",
      ]);
      assert.equal(
        s.desiredConfig.sessionSettings.enabledPlugins["custom@owned"],
        true,
      );
      const g = fixture(attach, { stored: { pluginContext: context } });
      const t = await g.start("resume", {
        addonSelection: null,
        sessionSettings: null,
      });
      assert.equal(t.desiredConfig.addonSelection, undefined);
      assert.equal(t.desiredConfig.sessionSettings, undefined);
    },
  ],
  [
    "new startup waits for delete transaction and deletion before advancing generation",
    async (attach) => {
      const f = fixture(attach),
        transaction = deferred(),
        deletion = deferred();
      f.controller.pendingSessionDeleteTransactions.set(
        "owned",
        transaction.promise,
      );
      f.controller.pendingSessionDeletes.set("owned", deletion.promise);
      const pending = f.start();
      await Promise.resolve();
      assert.equal(f.created.length, 0);
      transaction.resolve();
      await Promise.resolve();
      assert.equal(f.created.length, 0);
      deletion.resolve();
      await pending;
      assert.equal(f.controller.getSessionLifecycleGeneration("owned"), 1);
    },
  ],
  [
    "pending disposal failure is ignored before startup",
    async (attach) => {
      const f = fixture(attach);
      const rejected = Promise.reject(Error("owned-disposal"));
      rejected.catch(() => {});
      f.controller.pendingSessionDisposals.set("owned", rejected);
      await f.start();
      assert.equal(f.created.length, 1);
    },
  ],
  [
    "initialization failure destroys unpublished backend and unregisters policy",
    async (attach) => {
      const f = fixture(attach, {
        initialize: async () => {
          throw Error("owned-init");
        },
      });
      await assert.rejects(f.start(), /owned-init/);
      assert.equal(f.sessions.size, 0);
      assert.deepEqual(f.calls.slice(-2), [
        ["unregister", "owned"],
        ["destroy"],
      ]);
    },
  ],
  [
    "mismatched identity fails before persistence",
    async (attach) => {
      const f = fixture(attach, { mismatch: true });
      await assert.rejects(f.start(), /mismatched session id/);
      assert.equal(
        f.calls.some((c) => c[0] === "persist"),
        false,
      );
      assert.equal(f.sessions.size, 0);
    },
  ],
  [
    "deletion during initialization prevents stale publication",
    async (attach) => {
      const started = deferred(),
        release = deferred();
      const f = fixture(attach, {
        initialize: async () => {
          started.resolve();
          await release.promise;
        },
      });
      const pending = f.start();
      const rejected = assert.rejects(
        pending,
        /superseded by permanent deletion/,
      );
      await started.promise;
      f.controller.deletedSessionIds.add("owned");
      f.controller.bumpSessionLifecycleGeneration("owned");
      release.resolve();
      await rejected;
      assert.equal(f.sessions.size, 0);
      assert.equal(
        f.calls.some((c) => c[0] === "persist"),
        false,
      );
    },
  ],
  [
    "superseding session during persistence is not deleted by old startup cleanup",
    async (attach) => {
      const newer = { sessionId: "owned", newer: true };
      const f = fixture(attach, {
        persist: async (_s: any, _g: any, c: any) => {
          c.sessions.set("owned", newer);
        },
      });
      await assert.rejects(f.start(), /superseded by a newer lifecycle/);
      assert.equal(f.sessions.get("owned"), newer);
      assert.equal(
        f.calls.some((c) => c[0] === "unregister"),
        false,
      );
      assert.equal(f.calls.at(-1)[0], "destroy");
    },
  ],
  [
    "record failure removes only owned session; load cleanup finishes hydration",
    async (attach) => {
      const f = fixture(attach, {
        persist: async () => {
          throw Error("record-failed");
        },
      });
      await assert.rejects(f.start("load"), /record-failed/);
      assert.equal(f.sessions.size, 0);
      assert.ok(f.calls.some((c) => c[0] === "hydrate-failure"));
      assert.equal(
        f.calls.some((c) => c[0] === "hydrate-success"),
        false,
      );
    },
  ],
  [
    "runtime sandbox override and setter errors preserve original best effort",
    async (attach) => {
      const f = fixture(attach, { setterErrors: true });
      f.controller.runtimeSandboxOverrides.set("owned", {
        enabled: false,
        disabledReason: "session-local-environment-selected",
      });
      const s = await f.start("resume", { mode: "ask" });
      assert.equal(s.desiredConfig.useSandboxCLI, false);
      assert.equal(f.sessions.get("owned"), s);
      assert.equal(f.calls.filter((c) => c[0] === "warn").length, 2);
    },
  ],
  [
    "stale in-flight task status terminates, fresh status starts idle",
    async (attach) => {
      const f = fixture(attach, {
        stored: { status: "working", createdAt: 1, updatedAt: 1 },
      });
      const s = await f.start("resume");
      assert.equal(s.taskState.runState, "terminated");
      assert.equal(s.taskState.lastTransitionAt, 1);
      const state = f.restoreTaskStateFromStoredStatus("s", 10, "working", {
        updatedAt: 100,
        now: () => 101,
      });
      assert.equal(state.runState, "idle");
    },
  ],
];

import assert from "node:assert/strict";
type Factory = (runtime?: any) => any;
function fixture(factory: Factory) {
  const warnings: any[] = [];
  const runtime = factory({
    console: { log() {}, warn: (...args: any[]) => warnings.push(args) },
  });
  const manager = new runtime.SessionManager();
  const records = new Map<string, any>();
  const writes: any[] = [];
  const events: any[] = [];
  const store = {
    getSession: async (id: string) => records.get(id) ?? null,
    listSessions: async () => [...records.values()],
    upsertSession: async (record: any) => {
      records.set(record.id, structuredClone(record));
      writes.push(structuredClone(record));
    },
    deleteSession: async (id: string) => {
      records.delete(id);
    },
  };
  manager.initialize({
    recordStore: store,
    createBackend: () => {
      throw Error("unexpected backend");
    },
    logger: { info() {}, warn: (...args: any[]) => warnings.push(args) },
  });
  manager.setEventSink((...args: any[]) => events.push(args));
  return { runtime, manager, records, writes, events, warnings, store };
}
export const sessionManagerScenarios: Array<
  [string, (factory: Factory) => Promise<void>]
> = [
  [
    "constructor owns all lifecycle maps and coordinator policies per factory",
    async (factory) => {
      const a = factory(),
        b = factory(),
        one = new a.SessionManager(),
        two = new a.SessionManager();
      for (const name of [
        "sessions",
        "historySessionGenerations",
        "pendingSessionDisposals",
        "pendingSessionRestores",
        "sessionLifecycleGenerations",
        "pendingSessionDeletes",
        "pendingSessionDeleteTransactions",
        "primedReplayStates",
        "sessionEffectChains",
        "runtimeSandboxOverrides",
        "sidebarMetaDebounceTimers",
        "runtimeReclaimEligibleSince",
        "scopedEventListeners",
        "pluginRecommendationContinuationBarriers",
        "sessionConfigMutationTails",
      ]) {
        assert.ok(one[name] instanceof Map, name);
        assert.notEqual(one[name], two[name], name);
      }
      assert.ok(one.deletedSessionIds instanceof Set);
      assert.ok(one.pluginRecommendationContinuationPrompts instanceof WeakSet);
      assert.equal(one.runtimeReclaimPromise, null);
      a.coordinator.registerSessionDeferredBuiltinPolicy("owned", {
        scope: "all",
      });
      assert.equal(a.coordinator.policies.has("owned"), true);
      assert.equal(b.coordinator.policies.has("owned"), false);
      a.coordinator.unregisterSessionDeferredBuiltinPolicy("owned");
      assert.equal(a.coordinator.policies.has("owned"), false);
    },
  ],
  [
    "initialize starts composer and wires original recommendation lifecycle sink",
    async (factory) => {
      const f = fixture(factory);
      let sink: any;
      const calls: any[] = [];
      const ready = Promise.resolve("ready");
      const options = {
        logger: f.manager.logger,
        recordStore: f.store,
        createBackend: () => {},
        userPromptComposer: {
          initialize: () => {
            calls.push("composer");
            return ready;
          },
        },
        onBeforePrompt: () => {},
        getCurrentUserId: () => "owner",
        pluginRecommendationRegistry: {
          setLifecycleSink: (fn: any) => {
            sink = fn;
          },
        },
        cancelPluginRecommendationConnector: async (id: string) => {
          calls.push(id);
          if (id === "bad") throw Error("owned connector failure");
        },
      };
      f.manager.initialize(options);
      assert.equal(f.manager.userPromptComposerReady, ready);
      assert.equal(f.manager.onBeforePrompt, options.onBeforePrompt);
      assert.equal(f.manager.getCurrentUserId(), "owner");
      sink({
        kind: "settled",
        sessionId: "missing",
        request: {
          type: "connector",
          plugins: [
            { pluginId: "good", status: "connecting" },
            { pluginId: "bad", status: "connecting" },
            { pluginId: "idle", status: "connected" },
          ],
        },
      });
      await new Promise((r) => setImmediate(r));
      assert.deepEqual(calls, ["composer", "good", "bad"]);
      assert.equal(f.warnings.length, 1);
      assert.match(JSON.stringify(f.warnings), /owned connector failure/);
    },
  ],
  [
    "inactive rename/archive/move persist original records and events",
    async (factory) => {
      const f = fixture(factory);
      f.records.set("owned", {
        id: "owned",
        cwd: process.cwd(),
        status: "completed",
        createdAt: 1,
        updatedAt: 2,
        userId: "owner",
        isPlayground: true,
      });
      assert.deepEqual(await f.manager.renameSession("owned", "New title"), {
        id: "owned",
      });
      assert.equal(f.records.get("owned").customTitle, "New title");
      assert.ok(
        f.events.some(
          ([channel, payload]) =>
            channel === "session:upserted" && payload.id === "owned",
        ),
      );
      assert.ok(
        f.events.some(
          ([, payload]) =>
            payload.update?.sessionUpdate === "topic_update" &&
            payload.update.title === "New title",
        ),
      );
      await f.manager.moveSession("owned");
      assert.equal(f.records.get("owned").isPlayground, false);
      const before = f.records.get("owned").updatedAt;
      await f.manager.archiveSession("owned");
      assert.equal(f.records.get("owned").status, "archived");
      assert.ok(f.records.get("owned").archivedAt > 0);
      assert.equal(f.records.get("owned").updatedAt, before);
    },
  ],
  [
    "project tagging validates existence, trims identity and preserves idempotence",
    async (factory) => {
      const f = fixture(factory);
      f.records.set("owned", {
        id: "owned",
        status: "completed",
        createdAt: 1,
        updatedAt: 2,
      });
      await assert.rejects(
        f.manager.tagSessionWithProjectId("owned", "  "),
        /non-empty/,
      );
      await assert.rejects(
        f.manager.tagSessionWithProjectId("missing", "p"),
        /not found/,
      );
      await f.manager.tagSessionWithProjectId("owned", " p ");
      assert.equal(f.records.get("owned").projectId, "p");
      const writes = f.writes.length;
      await f.manager.tagSessionWithProjectId("owned", "p");
      assert.equal(f.writes.length, writes);
      await f.manager.untagSessionProjectId("owned");
      assert.equal(Object.hasOwn(f.records.get("owned"), "projectId"), false);
      const after = f.writes.length;
      await f.manager.untagSessionProjectId("owned");
      assert.equal(f.writes.length, after);
    },
  ],
  [
    "runtime config resolves through original addon manifest and isolates desired config",
    async (factory) => {
      const f = fixture(factory);
      const desired = {
        mode: "ask",
        model: "owned",
        systemPrompt: "Owned explicit prompt",
        tools: "Read",
        permissionMode: "default",
      };
      let input: any;
      f.manager.runtimeConfigResolver = {
        resolveConfig: async (value: any) => {
          input = value;
          return { ...value.desiredConfig };
        },
      };
      const resolved = await f.manager.resolveRuntimeConfig({
        sessionId: "owned",
        cwd: process.cwd(),
        desiredConfig: desired,
      });
      assert.notEqual(input.desiredConfig, desired);
      assert.equal(input.currentRuntimeConfig, null);
      assert.equal(resolved.systemPrompt, desired.systemPrompt);
      assert.ok(resolved.addonManifest);
      assert.ok(
        resolved.addonManifest.addons.systemPrompts.some(
          (item: any) => item.source === "user",
        ),
      );
      assert.ok(
        resolved.addonManifest.addons.tools.some(
          (item: any) => item.source === "user",
        ),
      );
      assert.equal(resolved.addonManifest.sessionId, "owned");
    },
  ],
  [
    "record visibility preserves blank ownership and explicit mismatches",
    async (factory) => {
      const f = fixture(factory);
      assert.equal(
        f.manager.isSessionRecordVisibleForUser({ userId: "other" }, "owner"),
        false,
      );
      assert.equal(
        f.manager.isSessionRecordVisibleForUser({ userId: " owner " }, "owner"),
        true,
      );
      assert.equal(
        f.manager.isSessionRecordVisibleForUser({ userId: "   " }, "owner"),
        true,
      );
      assert.equal(
        f.manager.isSessionRecordVisibleForUser({ userId: "other" }, undefined),
        true,
      );
      assert.equal(f.manager.resolveTargetSessionId(), null);
      assert.throws(() => f.manager.requireSession("missing"), /not found/i);
    },
  ],
  [
    "uninitialized backend factory fails without silently substituting a host",
    async (factory) => {
      const { SessionManager } = factory();
      const manager = new SessionManager();
      assert.throws(() => manager.requireCreateBackend(), /initializ/i);
      const create = () => ({ id: "owned" });
      manager.initialize({ createBackend: create });
      assert.equal(manager.requireCreateBackend(), create);
      assert.deepEqual(await manager.listSessions(), []);
      assert.deepEqual(await manager.getActiveSessions(), []);
    },
  ],
  [
    "full class contains recovered operation/input behavior without method attachment",
    async (factory) => {
      const f = fixture(factory);
      assert.equal(await f.manager.getMessageQueue("missing"), undefined);
      assert.equal(await f.manager.getQueueState("missing"), null);
      assert.deepEqual(await f.manager.getAvailableCommands(), []);
      assert.deepEqual(await f.manager.getSubagentList(), {
        subagents: [],
        results: [],
      });
      assert.deepEqual(
        f.manager.normalizeInterruptionResolution({
          resolved: false,
          queued: true,
        }),
        { resolved: false, queued: true },
      );
      for (const name of [
        "cancel",
        "respondToPermission",
        "answerQuestion",
        "respondElicitation",
        "startPluginRecommendationContinuation",
        "emitPoiPickQuestion",
        "restoreInactiveSessionState",
        "restartSessionBackend",
        "prompt",
        "deleteSession",
      ])
        assert.equal(typeof f.manager[name], "function", name);
    },
  ],
];

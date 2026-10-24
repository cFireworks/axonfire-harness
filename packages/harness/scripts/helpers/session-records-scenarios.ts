import assert from "node:assert/strict";
import { createNativeSessionRecords } from "../../src/sessions/native-session-records.js";
type Factory = typeof createNativeSessionRecords;
function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((r) => {
    resolve = r;
  });
  return { resolve, promise };
}
function fixture(factory: Factory, options: any = {}) {
  const records = new Map<string, any>(),
    writes: any[] = [],
    logs: any[] = [];
  const session: any = {
    sessionId: "owned",
    cwd: "/owned",
    createdAt: 10,
    updatedAt: 20,
    userId: "user",
    desiredConfig: { mode: "ask", model: "model" },
    taskState: { runState: "idle", terminalOutcome: null, lastActivityAt: 15 },
    _meta: { "codebuddy.ai": { sourceMode: "coding" } },
    lastUserPromptExpertSelection: { expertId: "expert" },
  };
  let generation = 0;
  const controller: any = {
    sessions: new Map([["owned", session]]),
    logDiagnostic: (...args: any[]) => logs.push(args),
    assertSessionLifecycleCurrent(_id: any, expected: any) {
      if (expected !== generation) throw Error("obsolete generation");
    },
  };
  const store = {
    async getSession(id: string) {
      await options.get?.();
      return records.has(id) ? structuredClone(records.get(id)) : null;
    },
    async upsertSession(entry: any) {
      await options.write?.(entry);
      writes.push(structuredClone(entry));
      records.set(entry.id, structuredClone(entry));
    },
  };
  const runtime = factory();
  runtime.attach(controller, store);
  return {
    ...runtime,
    controller,
    session,
    records,
    writes,
    logs,
    store,
    bump() {
      generation++;
    },
  };
}
export const sessionRecordsScenarios: [
  string,
  (factory: Factory) => Promise<void>,
][] = [
  [
    "new record preserves source projection and expert selection",
    async (factory) => {
      const f = fixture(factory);
      await f.controller.ensureStoredSessionRecord(f.session, 0);
      const r = f.records.get("owned");
      assert.equal(r.id, "owned");
      assert.equal(r.userId, "user");
      assert.equal(r.sourceMode, "coding");
      assert.equal(r.createdAt, 10);
      assert.equal(r.updatedAt, 20);
      assert.equal(r.lastActivityAt, 15);
      assert.deepEqual(r.lastUserPromptExpertSelection, {
        version: 1,
        selection: { expertId: "expert" },
      });
    },
  ],
  [
    "existing startup fills missing values without replacing stored choices",
    async (factory) => {
      const f = fixture(factory);
      f.records.set("owned", {
        id: "owned",
        mode: "craft",
        model: "stored",
        updatedAt: 1,
      });
      await f.controller.ensureStoredSessionRecord(f.session, 0);
      const r = f.records.get("owned");
      assert.equal(r.mode, "craft");
      assert.equal(r.model, "stored");
      assert.equal(r.userId, "user");
      assert.equal(r.updatedAt, 1);
      assert.equal(f.writes.length, 1);
      await f.controller.ensureStoredSessionRecord(f.session, 0);
      assert.equal(f.writes.length, 1);
    },
  ],
  [
    "lifecycle change during record read prevents startup write",
    async (factory) => {
      const entered = deferred(),
        release = deferred();
      const f = fixture(factory, {
        get: async () => {
          entered.resolve();
          await release.promise;
        },
      });
      const pending = f.controller.ensureStoredSessionRecord(f.session, 0);
      const result = assert.rejects(pending, /obsolete generation/);
      await entered.promise;
      f.bump();
      release.resolve();
      await result;
      assert.equal(f.writes.length, 0);
    },
  ],
  [
    "effects serialize, survive failure and reject stale owner by skipping work",
    async (factory) => {
      const f = fixture(factory),
        entered = deferred(),
        release = deferred(),
        events: string[] = [];
      const first = f.controller.enqueueSessionEffect(f.session, async () => {
        events.push("first");
        entered.resolve();
        await release.promise;
        throw Error("first-failed");
      });
      const rejected = assert.rejects(first, /first-failed/);
      await entered.promise;
      const second = f.controller.enqueueSessionEffect(f.session, async () =>
        events.push("second"),
      );
      assert.deepEqual(events, ["first"]);
      release.resolve();
      await rejected;
      await second;
      assert.deepEqual(events, ["first", "second"]);
      assert.equal(f.controller.sessionEffectChains.size, 0);
      f.controller.sessions.set("owned", {});
      await f.controller.enqueueSessionEffect(f.session, async () =>
        events.push("stale"),
      );
      assert.deepEqual(events, ["first", "second"]);
    },
  ],
  [
    "flush waits for its observed tail, not later effects",
    async (factory) => {
      const f = fixture(factory),
        releaseFirst = deferred(),
        releaseSecond = deferred();
      const first = f.controller.enqueueSessionEffect(
        f.session,
        () => releaseFirst.promise,
      );
      let flushed = false;
      const flushing = f.controller
        .flushSessionEffects("owned")
        .then(() => (flushed = true));
      const second = f.controller.enqueueSessionEffect(
        f.session,
        () => releaseSecond.promise,
      );
      releaseFirst.resolve();
      await first;
      await flushing;
      assert.equal(flushed, true);
      assert.ok(f.controller.sessionEffectChains.has("owned"));
      releaseSecond.resolve();
      await second;
    },
  ],
  [
    "queued effect still executes if owner changes after enqueue",
    async (factory) => {
      const f = fixture(factory),
        gate = deferred();
      const events: string[] = [];
      const first = f.controller.enqueueSessionEffect(
        f.session,
        () => gate.promise,
      );
      const second = f.controller.enqueueSessionEffect(f.session, async () =>
        events.push("queued"),
      );
      f.controller.sessions.set("owned", {});
      gate.resolve();
      await first;
      await second;
      assert.deepEqual(events, ["queued"]);
    },
  ],
  [
    "desired config persistence clears expert fields and preserves activity ordering",
    async (factory) => {
      const f = fixture(factory);
      f.records.set("owned", {
        id: "owned",
        expertId: "old",
        expertLocale: "en",
        expertRuntimeIdentity: "r",
        expertMarketplace: "m",
        updatedAt: 7,
        lastActivityAt: 6,
      });
      f.session.desiredConfig = {
        mode: "craft",
        expertId: undefined,
        welcomeMode: "work",
        permissionMode: "acceptEdits",
        useSandboxCLI: false,
      };
      await f.controller.persistSessionDesiredConfig(f.session, {
        hasExplicitExpertPatch: true,
        hasExplicitWelcomeModePatch: true,
        hasExplicitPluginContextPatch: true,
      });
      const r = f.records.get("owned");
      for (const k of [
        "expertId",
        "expertLocale",
        "expertRuntimeIdentity",
        "expertMarketplace",
      ])
        assert.equal(r[k], "");
      assert.equal(r.sourceMode, "working");
      assert.equal(f.session._meta["codebuddy.ai"].sourceMode, "working");
      assert.equal(r.updatedAt, 7);
      assert.equal(r.lastActivityAt, 6);
      assert.equal(r.useSandboxCLI, false);
      assert.equal(f.session.persistPluginContext, true);
      assert.ok(r.pluginContext);
    },
  ],
  [
    "upsert updates active timestamps before database failure",
    async (factory) => {
      const f = fixture(factory, {
        write: async () => {
          throw Error("owned-db-failure");
        },
      });
      f.records.set("owned", { id: "owned", updatedAt: 1, lastActivityAt: 2 });
      await assert.rejects(
        f.controller.upsertSessionRecord("owned", (r: any) => ({
          ...r,
          updatedAt: 50,
          lastActivityAt: 40,
        })),
        /owned-db-failure/,
      );
      assert.equal(f.session.updatedAt, 50);
      assert.equal(f.session.lastActivityAt, 40);
      assert.equal(f.records.get("owned").updatedAt, 1);
    },
  ],
  [
    "expert selection persistence failures are logged and clearing retains timestamp",
    async (factory) => {
      const f = fixture(factory);
      await f.controller.ensureStoredSessionRecord(f.session, 0);
      await f.controller.persistLastUserPromptExpertSelection(f.session, null);
      assert.deepEqual(f.records.get("owned").lastUserPromptExpertSelection, {
        version: 1,
        selection: null,
      });
      assert.equal(f.records.get("owned").updatedAt, 20);
      const g = fixture(factory, {
        write: async () => {
          throw Error("owned");
        },
      });
      await g.controller.persistLastUserPromptExpertSelection(g.session);
      assert.equal(g.logs[0][0], "warn");
    },
  ],
  [
    "inactive in-flight records terminate immediately without moving updatedAt",
    async (factory) => {
      for (const status of ["planning", "working", "pending"]) {
        const f = fixture(factory);
        f.records.set("owned", { id: "owned", status, updatedAt: Date.now() });
        const active = await f.controller.resolveStoredEntry("owned");
        assert.equal(active.status, status);
        assert.equal(f.writes.length, 0);
        f.controller.sessions.clear();
        const r = await f.controller.resolveStoredEntry("owned");
        assert.equal(r.status, "terminated");
        assert.equal(r.updatedAt, active.updatedAt);
        assert.equal(f.writes.length, 1);
      }
    },
  ],
  [
    "record adapter preserves archive status-only update and fills missing user",
    async (factory) => {
      const calls: any[] = [];
      let existing: any = { id: "s", status: "archived" };
      const database = {
        initialize: () => calls.push(["init"]),
        getSession: () => existing,
        upsertSession: (r: any) => calls.push(["upsert", r]),
        updateSessionStatus: (...args: any[]) =>
          calls.push(["status", ...args]),
        getSessions: (o: any) => {
          calls.push(["list", o]);
          return [];
        },
        deleteSession: (id: any) => calls.push(["delete", id]),
      };
      const store = factory().createSessionRecordStore(
        Promise.resolve({ database }),
        { getCurrentUserId: () => "current" },
      );
      await store.upsertSession({
        id: "s",
        status: "completed",
        updatedAt: 5,
        customTitle: "changed",
      });
      assert.deepEqual(structuredClone(calls), [["init"], ["status", "s", "completed", 5]]);
      existing = undefined;
      calls.length = 0;
      await store.upsertSession({ id: "s", status: "working" });
      assert.equal(calls[1][1].userId, "current");
      assert.equal(await store.getSession("missing"), null);
      await store.listSessions({ userId: "", includeDeleted: true });
      assert.deepEqual(calls.find((c) => c[0] === "list")[1], {
        userId: undefined,
        includeDeleted: true,
      });
      await store.deleteSession("s");
      assert.deepEqual(calls.at(-1), ["delete", "s"]);
    },
  ],
  [
    "without database status setter archive downgrade falls back to normal upsert",
    async (factory) => {
      const writes: any[] = [];
      const store = factory().createSessionRecordStore(
        Promise.resolve({
          database: {
            getSession: () => ({ status: "archived" }),
            upsertSession: (r: any) => writes.push(r),
          },
        }),
      );
      await store.upsertSession({
        id: "s",
        status: "completed",
        customTitle: "new",
      });
      assert.equal(writes[0].customTitle, "new");
    },
  ],
  [
    "missing record store keeps metadata mutation but skips writes",
    async (factory) => {
      const f = fixture(factory);
      f.controller.recordStore = undefined;
      await f.controller.ensureStoredSessionRecord(f.session, 0);
      assert.equal(await f.controller.resolveStoredEntry("owned"), null);
      f.session.desiredConfig.welcomeMode = "design";
      await f.controller.persistSessionDesiredConfig(f.session, {
        hasExplicitWelcomeModePatch: true,
      });
      assert.equal(f.session._meta["codebuddy.ai"].sourceMode, "design");
      assert.equal(f.writes.length, 0);
    },
  ],
];

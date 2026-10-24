import assert from "node:assert/strict";
import { createNativeSandboxFinalization } from "../../src/sandbox/native-sandbox-finalization.js";
import { createNativeSandboxProtocol } from "../../src/sandbox/native-sandbox-protocol.js";
/** Explicit parent phase/history adapters isolate hook behavior; no product bootstrap. */
export function sandboxFinalizationFixture(
  factory = createNativeSandboxFinalization,
  patch: any = {},
) {
  const calls: any[] = [],
    phases: any[] = [],
    logs: any[] = [],
    reports: any[] = [],
    timers = new Map<any, () => void>();
  let listener: any,
    removed = 0,
    sessionId: any = "opened",
    changes: any[] = [
      { relativePath: ".codebuddy/settings.json" },
      { relativePath: "src/a.ts" },
    ];
  const protocol = createNativeSandboxProtocol();
  const runtime: any = {
    process: { cwd: () => "/owned/work" },
    Date: { now: () => 1000 },
    setTimeout: (fn: any) => {
      const id = {};
      timers.set(id, fn);
      return id;
    },
    clearTimeout: (id: any) => timers.delete(id),
    modules: {
      70857: { platform: () => patch.platform ?? "darwin" },
      78213: { PRODUCT_NAME: "CodeBuddy" },
      74674: protocol.getModule(74674),
      99006: {
        AgentPhaseUtils: {
          emit: (s: any, phase: string) =>
            s.phaseSubject.next({ phase, startedAt: 1000 }),
        },
      },
      59255: {
        MessageContentUtils: {
          getLatestRealUserMessage: (history: any) => history?.message,
        },
      },
    },
  };
  const native = factory(runtime),
    logger = Object.fromEntries(
      ["info", "warn", "error"].map((k) => [
        k,
        (...args: any[]) =>
          logs.push([
            k,
            ...args.map((a) => (a instanceof Error ? a.message : a)),
          ]),
      ]),
    );
  const client: any = {
    addReverseListener: (filter: any, fn: any) => {
      calls.push(["listen", filter]);
      listener = fn;
      return () => {
        removed++;
        listener = undefined;
      };
    },
    sendRequest: async (id: any, command: any, payload: any) => {
      calls.push([id, command, payload]);
      if (patch.fail === command) throw Error("owned failure");
      if (command === "QueryFileChanges") return { changes };
      if (command === "SyncFileChanges") {
        listener?.({
          command: "SyncFileProgress",
          data: { current: 1, total: 2 },
        });
        listener?.({
          command: "CommitFileProgress",
          data: { current: 2, total: 2 },
        });
        return { totalChanges: changes.length, changes };
      }
      if (command === "CommitFileChanges")
        return { commit: { commitId: "c1", files: changes } };
      if (command === "CommitModifyBackup")
        return {
          commitSeq: 1,
          commitLabel: "backup",
          modifyBackupSessionCount: 2,
          totalModifyBackupSizeMb: 3,
        };
      return {};
    },
  };
  const lifecycle: any = {
    getClient: () => client,
    getOpenedSessionId: () => sessionId,
    stop: async () => {
      calls.push(["stop"]);
      if (patch.stopError) throw Error("stop failed");
    },
    flushAccessTelemetry: async (reason: string) => {
      calls.push(["flush", reason]);
      if (patch.flushError) throw Error("flush failed");
    },
  };
  const turn: any = {
      enableProjection: true,
      enableVersionControl: true,
      enableDeleteProtection: true,
      enableFileBackup: true,
      fileBackupMaxSizeMB: 12,
    },
    session: any = {
      id: "s1",
      conversationRequestId: "r1",
      history: { message: "owned message" },
      phaseSubject: { next: (p: any) => phases.push(p) },
    };
  const inject = (C: any) =>
    Object.assign(new C(), {
      logger,
      sandboxLifecycle: lifecycle,
      sandboxTurnConfig: turn,
      telemetryReporter: {
        reportModifyBackupCommitted: (r: any) => reports.push(r),
      },
      cwdService: { setCwdState: (p: string) => calls.push(["cwd", p]) },
    });
  const projection: any = inject(native.FinalizationFileProjectionSyncHook),
    backup: any = inject(native.FinalizationModifyBackupHook),
    end: any = inject(native.SandboxCLISessionEndHook);
  const delegates = Object.fromEntries(
    ["local", "sandbox", "legacy"].map((key, index) => [
      key,
      {
        execute: async (o: any) => {
          calls.push(["execute", key, o]);
          if (patch.executeError) throw Error("execute failure");
          return { id: key, pid: index };
        },
        disposeAll: () => {
          calls.push(["dispose", key]);
          return key === patch.disposeError
            ? Promise.reject(Error("dispose failed"))
            : Promise.resolve();
        },
        getActiveHandleCount: () => index + 1,
      },
    ]),
  );
  const delegator: any = Object.assign(new native.DelegatingShellService(), {
    logger,
    localShellService: delegates.local,
    sandboxShellService: delegates.sandbox,
    legacySandboxShellService: delegates.legacy,
    bashSandboxManager: {
      getConfig: async () => {
        if (patch.configError) throw Error("config failed");
        return { enabled: patch.enabled ?? true };
      },
    },
  });
  return {
    native,
    runtime,
    protocol,
    projection,
    backup,
    end,
    delegator,
    delegates,
    session,
    turn,
    lifecycle,
    client,
    calls,
    phases,
    logs,
    reports,
    timers,
    setSession: (s: any) => (sessionId = s),
    setChanges: (c: any[]) => (changes = c),
    get removed() {
      return removed;
    },
  };
}
export const SANDBOX_FINALIZATION_CASES: {
  name: string;
  run(factory: typeof createNativeSandboxFinalization): Promise<any>;
}[] = [
  {
    name: "original platform routing selects local, CLI or Linux legacy without substitute fallback",
    async run(factory) {
      const results = [];
      for (const patch of [
        { platform: "darwin" },
        { platform: "win32" },
        { platform: "linux" },
        { enabled: false },
        { configError: true },
      ]) {
        const f = sandboxFinalizationFixture(factory, patch),
          r = await f.delegator.execute({ command: "owned" });
        results.push({ r, calls: f.calls });
      }
      assert.deepEqual(
        results.map((x) => x.r.id),
        ["sandbox", "sandbox", "legacy", "local", "local"],
      );
      return results;
    },
  },
  {
    name: "delegator preserves handle identity, count, failure and all-settled disposal",
    async run(factory) {
      const f = sandboxFinalizationFixture(factory, { disposeError: "local" });
      assert.equal(f.delegator.getActiveHandleCount(), 6);
      assert.equal(
        f.delegator.pickDelegate("sandbox-cli").delegate,
        f.delegates.sandbox,
      );
      await f.delegator.disposeAll();
      assert.equal(f.calls.length, 3);
      const bad = sandboxFinalizationFixture(factory, { executeError: true });
      await assert.rejects(
        bad.delegator.execute({ command: "owned" }),
        /execute failure/,
      );
      return { calls: f.calls, bad: bad.calls };
    },
  },
  {
    name: "projection sync includes whitelisted paths, commits and releases reverse progress listener",
    async run(factory) {
      const f = sandboxFinalizationFixture(factory);
      await f.projection.execute({ session: f.session });
      assert.equal(f.removed, 1);
      assert.equal(f.timers.size, 0);
      assert.deepEqual(
        f.calls.find((c) => c[1] === "SyncFileChanges")[2].paths,
        [".codebuddy/settings.json", "src/a.ts"],
      );
      assert.equal(
        f.calls.find((c) => c[1] === "SyncFileChanges")[2].useTrash,
        true,
      );
      assert.equal(
        f.calls.find((c) => c[1] === "CommitFileChanges")[2].message,
        "用户消息: owned message",
      );
      assert.equal(f.phases.length, 3);
      return { calls: f.calls, phases: f.phases };
    },
  },
  {
    name: "projection skip, missing session, abort and empty-query paths do not sync",
    async run(factory) {
      const f = sandboxFinalizationFixture(factory);
      await f.projection.execute({});
      await f.projection.execute({
        session: f.session,
        final_stop_reason: "cancelled",
      });
      f.turn.enableProjection = false;
      await f.projection.execute({ session: f.session });
      f.turn.enableProjection = true;
      f.session.abortSignal = { aborted: true };
      await f.projection.execute({ session: f.session });
      assert.equal(f.calls.length, 0);
      delete f.session.abortSignal;
      f.setChanges([]);
      await f.projection.execute({ session: f.session });
      assert.equal(f.calls.length, 1);
      f.setSession(undefined);
      await f.projection.execute({ session: f.session });
      assert.equal(f.calls.length, 1);
      assert.equal(f.timers.size, 0);
      return { calls: f.calls, phases: f.phases };
    },
  },
  {
    name: "sync failure releases listener and commit disabled skips commit",
    async run(factory) {
      const bad = sandboxFinalizationFixture(factory, {
        fail: "SyncFileChanges",
      });
      await bad.projection.execute({ session: bad.session });
      assert.equal(bad.removed, 1);
      assert.equal(bad.timers.size, 0);
      const f = sandboxFinalizationFixture(factory);
      f.turn.enableVersionControl = false;
      await f.projection.execute({ session: f.session });
      assert.equal(
        f.calls.some((c) => c[1] === "CommitFileChanges"),
        false,
      );
      return { bad: bad.calls, calls: f.calls };
    },
  },
  {
    name: "slow finalization emits delayed notify and cancellation removes owned timer",
    async run(factory) {
      const f = sandboxFinalizationFixture(factory);
      const h = f.projection.scheduleNotifyEscalation(f.session);
      assert.equal(h.wasEscalated(), false);
      for (const [id, fn] of f.timers) {
        f.timers.delete(id);
        fn();
      }
      assert.equal(h.wasEscalated(), true);
      h.cancel();
      const next = f.projection.scheduleNotifyEscalation(f.session);
      next.cancel();
      assert.equal(f.timers.size, 0);
      return f.phases;
    },
  },
  {
    name: "projection UTF16 message limit differs from backup Unicode-codepoint limit",
    async run(factory) {
      const f = sandboxFinalizationFixture(factory);
      f.session.history.message = "😀".repeat(120);
      const projection = f.projection.resolveCommitMessage(f.session),
        backup = f.backup.resolveCommitMessage(f.session);
      assert.equal(projection, "用户消息: " + "😀".repeat(100) + "…");
      assert.equal(backup, "😀".repeat(16));
      return { projection, backup };
    },
  },
  {
    name: "modify backup commits even on cancelled stop and reports original size fields",
    async run(factory) {
      const f = sandboxFinalizationFixture(factory);
      await f.backup.execute({
        session: f.session,
        final_stop_reason: "cancelled",
      });
      assert.equal(f.calls[0][1], "CommitModifyBackup");
      assert.equal(f.reports[0].fileBackupMaxSizeMb, 12);
      assert.equal(f.reports[0].conversationRequestId, "r1");
      return { calls: f.calls, reports: f.reports };
    },
  },
  {
    name: "backup missing fields, disabled flag and request failure preserve nonthrowing behavior",
    async run(factory) {
      const f = sandboxFinalizationFixture(factory, {
        fail: "CommitModifyBackup",
      });
      await f.backup.execute({});
      f.turn.enableFileBackup = false;
      await f.backup.execute({ session: f.session });
      f.turn.enableFileBackup = true;
      f.session.history = {};
      await f.backup.execute({ session: f.session });
      assert.equal(f.calls[0][2].commitMsg, "modify backup finalization");
      assert.equal(f.reports.length, 0);
      return f.calls;
    },
  },
  {
    name: "session end clear/resume stop and restore cwd; other reasons only flush",
    async run(factory) {
      const out = [];
      for (const reason of [
        "clear",
        "resume",
        "shutdown",
        "other",
        undefined,
      ]) {
        const f = sandboxFinalizationFixture(factory);
        await f.end.execute({ session: f.session, reason });
        out.push(f.calls);
      }
      assert.deepEqual(out[0], [["stop"], ["cwd", "/owned/work"]]);
      assert.deepEqual(out[2], [["flush", "session_end:shutdown"]]);
      return out;
    },
  },
  {
    name: "session end failure is swallowed and cwd restored even after stop failure",
    async run(factory) {
      const f = sandboxFinalizationFixture(factory, { stopError: true });
      await f.end.execute({ session: f.session, reason: "clear" });
      const g = sandboxFinalizationFixture(factory, { flushError: true });
      await g.end.execute({ session: g.session, reason: "shutdown" });
      await g.end.execute({});
      assert.deepEqual(f.calls, [["stop"], ["cwd", "/owned/work"]]);
      return { calls: f.calls, flush: g.calls };
    },
  },
];

import assert from "node:assert/strict";
import { mkdtemp, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { attachNativeSessionReadiness } from "../../src/sessions/native-session-readiness.js";
type Attach = typeof attachNativeSessionReadiness;
function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((r) => {
    resolve = r;
  });
  return { resolve, promise };
}
function fixture(attach: Attach, options: any = {}) {
  const calls: any[] = [],
    sessions = new Map<string, any>();
  const controller: any = {
    logDiagnostic() {},
    async awaitPendingBackendRestart() {
      calls.push("await");
      await options.wait?.();
    },
    async flushPendingRuntimeConfigIfIdle() {
      calls.push("flush");
      await options.flush?.();
    },
    async applyPendingRuntimeConfigBeforePrompt(session: any) {
      calls.push("drain");
      await options.drain?.(session);
    },
  };
  const attached = attach(controller, {
    sessions,
    resolveStoredEntry: async (id) => {
      calls.push("stored");
      await options.storedGate?.();
      return options.stored;
    },
    startSession: async (request, kind, generation) => {
      calls.push(["start", request.cwd, kind, generation]);
      await options.start?.(request, kind, generation);
      return { sessionId: request.sessionId, cwd: request.cwd };
    },
    replaceSessionReplayState: (s, events, cwd) =>
      calls.push(["replay", events, cwd]),
    onBeforePrompt: options.hook,
    temporaryRoot: options.temporaryRoot,
    console: { warn: () => calls.push("hook-warning") },
  });
  return { ...attached, calls, sessions };
}
export const sessionReadinessScenarios: [
  string,
  (attach: Attach) => Promise<void>,
][] = [
  [
    "operation waits for restart before drain and action; explicit skip bypasses both",
    async (attach) => {
      const entered = deferred(),
        release = deferred();
      const f = fixture(attach, {
        wait: async () => {
          entered.resolve();
          await release.promise;
        },
      });
      f.sessions.set("s", { sessionId: "s" });
      const operation = f.controller.withReadySession("s", async () => {
        f.calls.push("action");
        return 42;
      });
      await entered.promise;
      assert.deepEqual(f.calls, ["await"]);
      const value = await f.controller.withReadySession(
        "s",
        async () => 7,
        undefined,
        { skipAwaitRestart: true },
      );
      assert.equal(value, 7);
      assert.deepEqual(f.calls, ["await"]);
      release.resolve();
      assert.equal(await operation, 42);
      assert.deepEqual(f.calls, ["await", "flush", "action"]);
    },
  ],
  [
    "drain failure prevents action",
    async (attach) => {
      const f = fixture(attach, {
        flush: async () => {
          throw Error("restart failed");
        },
      });
      f.sessions.set("s", {});
      await assert.rejects(
        f.controller.withReadySession("s", () => {
          throw Error("action must not run");
        }),
        /restart failed/,
      );
    },
  ],
  [
    "prompt hook repeats for replacement backend with restarted identity",
    async (attach) => {
      const seen: any[] = [];
      const first = {},
        second = {};
      let drains = 0;
      const session: any = {
        sessionId: "s",
        desiredConfig: { mode: "ask" },
        backend: first,
      };
      const f = fixture(attach, {
        hook: async (input: any) => seen.push(input),
        drain: async (s: any) => {
          if (++drains === 2) s.backend = second;
        },
      });
      assert.equal(
        await f.controller.resolveBackendForPromptSend(session),
        second,
      );
      assert.deepEqual(
        seen.map((x) => x.backendRestarted),
        [false, true],
      );
      assert.equal(session.promptPreparedBackend, second);
      assert.equal(drains, 4);
    },
  ],
  [
    "hook failure is nonfatal and does not mark backend prepared",
    async (attach) => {
      const f = fixture(attach, {
        hook: async () => {
          throw Error("owned");
        },
      });
      const session: any = { sessionId: "s", backend: {} };
      assert.equal(
        await f.controller.resolveBackendForPromptSend(session),
        session.backend,
      );
      assert.equal(session.promptPreparedBackend, undefined);
      assert.ok(f.calls.includes("hook-warning"));
    },
  ],
  [
    "active session bypasses stored restore and cwd selection",
    async (attach) => {
      const f = fixture(attach);
      const active = { cwd: "original" };
      f.sessions.set("s", active);
      assert.equal(
        await f.controller.resolveReadySession("s", "different"),
        active,
      );
      assert.deepEqual(f.calls, []);
    },
  ],
  [
    "restore prefers stored cwd, consumes primed replay and normalizes trailing separators",
    async (attach) => {
      const f = fixture(attach, { stored: { cwd: "/owned/history///" } });
      f.controller.primedReplayStates.set("s", {
        cwd: "/owned/replay/",
        events: ["event"],
      });
      const session = await f.controller.resolveReadySession(
        "s",
        "/owned/requested",
      );
      assert.equal(session.cwd, "/owned/history");
      assert.deepEqual(f.calls, [
        "stored",
        ["start", "/owned/history", "resume", 0],
        ["replay", ["event"], "/owned/replay/"],
      ]);
      assert.equal(f.controller.pendingSessionRestores.size, 0);
      assert.equal(f.controller.primedReplayStates.size, 0);
    },
  ],
  [
    "equivalent restores share pending work; load can satisfy resume",
    async (attach) => {
      const entered = deferred(),
        release = deferred();
      const f = fixture(attach, {
        stored: { cwd: "/owned" },
        start: async () => {
          entered.resolve();
          await release.promise;
        },
      });
      const first = f.controller.restoreInactiveSessionState(
        "s",
        undefined,
        "load",
      );
      await entered.promise;
      const second = f.controller.resumeInactiveSessionState("s", "ignored");
      release.resolve();
      assert.equal(await first, await second);
      assert.equal(
        f.calls.filter((c) => Array.isArray(c) && c[0] === "start").length,
        1,
      );
    },
  ],
  [
    "load during pending resume starts distinct work and preserves newer pending entry",
    async (attach) => {
      const entered = deferred(),
        releaseResume = deferred(),
        releaseLoad = deferred();
      const f = fixture(attach, {
        stored: { cwd: "/owned" },
        start: async (_r: any, kind: string) => {
          if (kind === "resume") {
            entered.resolve();
            await releaseResume.promise;
          } else await releaseLoad.promise;
        },
      });
      const first = f.controller.resumeInactiveSessionState("s");
      await entered.promise;
      const second = f.controller.restoreInactiveSessionState(
        "s",
        undefined,
        "load",
      );
      await Promise.resolve();
      const pending = f.controller.pendingSessionRestores.get("s");
      assert.equal(pending.kind, "load");
      releaseResume.resolve();
      await first;
      assert.equal(f.controller.pendingSessionRestores.get("s"), pending);
      releaseLoad.resolve();
      await second;
      assert.equal(f.controller.pendingSessionRestores.size, 0);
    },
  ],
  [
    "missing cwd rejects and clears pending restore for retry",
    async (attach) => {
      const f = fixture(attach);
      await assert.rejects(
        f.controller.resolveReadySession("s"),
        /without cwd/,
      );
      assert.equal(f.controller.pendingSessionRestores.size, 0);
      const session = await f.controller.resolveReadySession(
        "s",
        "/owned/requested/",
      );
      assert.equal(session.cwd, "/owned/requested");
    },
  ],
  [
    "stored session without cwd gets owned fallback directory",
    async (attach) => {
      const root = await mkdtemp(join(tmpdir(), "readiness-"));
      try {
        const f = fixture(attach, { stored: {}, temporaryRoot: root });
        const s = await f.controller.resolveReadySession("s");
        assert.ok(s.cwd.startsWith(join(root, "wb-session-")));
        assert.equal((await stat(s.cwd)).isDirectory(), true);
      } finally {
        await rm(root, { recursive: true, force: true });
      }
    },
  ],
  [
    "lifecycle deletion and generation reject obsolete startup",
    async (attach) => {
      const f = fixture(attach);
      assert.equal(f.controller.getSessionLifecycleGeneration("s"), 0);
      assert.equal(f.controller.bumpSessionLifecycleGeneration("s"), 1);
      assert.throws(
        () => f.controller.assertSessionLifecycleCurrent("s", 0),
        /superseded/,
      );
      f.controller.deletedSessionIds.add("s");
      await assert.rejects(
        f.controller.resolveReadySession("s", "/owned"),
        /superseded/,
      );
      assert.deepEqual(f.calls, []);
      assert.equal(f.controller.beginNewSessionLifecycle("s"), 2);
      assert.equal(f.controller.deletedSessionIds.has("s"), false);
      f.controller.assertSessionLifecycleCurrent("s", 2);
    },
  ],
];

import assert from "node:assert/strict";
import type { attachNativeSessionReclaim } from "../../src/sessions/native-session-reclaim.js";
import { attachNativeSessionReplay } from "../../src/sessions/native-session-replay.js";
import { attachNativeSessionInfo } from "../../src/sessions/native-session-info.js";
import { sessionReplayFixture } from "./session-replay-scenarios.js";
type Factory = typeof attachNativeSessionReclaim;
function fixture(attach: Factory) {
  const f = sessionReplayFixture(attachNativeSessionReplay);
  f.s.taskState.runState = "idle";
  f.s.taskState.terminalOutcome = "completed";
  f.s.desiredConfig = {};
  attachNativeSessionInfo(f.c);
  const state = { now: 1000 },
    destroyed: string[] = [],
    timers: any[] = [],
    cleared: any[] = [];
  attach(f.c, {
    Date: { now: () => state.now },
    setInterval(fn: any, ms: number) {
      const timer = {
        fn,
        ms,
        unrefs: 0,
        unref() {
          this.unrefs++;
        },
      };
      timers.push(timer);
      return timer;
    },
    clearInterval: (timer: any) => cleared.push(timer),
  });
  f.c.destroySession = async (id: string) => {
    destroyed.push(id);
    f.c.sessions.delete(id);
  };
  function add(id: string) {
    const s = structuredClone(f.s);
    s.sessionId = id;
    s.taskState.sessionId = id;
    f.c.sessions.set(id, s);
    return s;
  }
  return { ...f, state, destroyed, timers, cleared, add };
}
export const sessionReclaimScenarios: [
  string,
  (attach: Factory) => Promise<void>,
][] = [
  [
    "idle eligibility starts at first sweep rather than old backend activity",
    async (attach) => {
      const f = fixture(attach);
      try {
        f.s.lastBackendActivityAt = 0;
        assert.equal(
          (
            await f.c.reclaimInactiveSessions({
              idleTimeoutMs: 10,
              maxActiveSessions: 0,
            })
          ).reclaimed.length,
          0,
        );
        f.state.now = 1009;
        assert.equal(
          (
            await f.c.reclaimInactiveSessions({
              idleTimeoutMs: 10,
              maxActiveSessions: 0,
            })
          ).reclaimed.length,
          0,
        );
        f.state.now = 1010;
        const result = await f.c.reclaimInactiveSessions({
          idleTimeoutMs: 10,
          maxActiveSessions: 0,
        });
        assert.deepEqual(result.reclaimed, [
          {
            sessionId: "owned",
            status: "completed",
            reason: "background_idle_timeout",
          },
        ]);
        assert.equal(result.totalSessions, 0);
        assert.equal(result.activeManagedSessionCount, 1);
        assert.equal(f.s.pendingPromptCancelCause, "runtime_reclaim");
        assert.equal(f.c.runtimeReclaimingSessions.size, 0);
      } finally {
        f.close();
      }
    },
  ],
  [
    "nonterminal, processing, pending input, unsettled team and active tool states are protected",
    async (attach) => {
      const mutations = [
        (s: any) => {
          s.taskState.terminalOutcome = null;
        },
        (s: any) => {
          s.taskState.runState = "running";
        },
        (s: any) => {
          s.isProcessing = true;
        },
        (s: any) => {
          s.stopRequested = true;
        },
        (s: any) => {
          s.pendingQuestionRequests.set("q", { receivedAt: 1 });
        },
        (s: any) => {
          s.pendingPermissionRequests.set("p", { receivedAt: 1 });
        },
        (s: any) => {
          s.pendingElicitationRequests.set("e", { receivedAt: 1 });
        },
        (s: any) => {
          s.teamRuntime.teamTrulyIdle = false;
        },
        (s: any) => {
          s.toolResults.set("t", { status: "in_progress" });
        },
      ];
      for (const mutate of mutations) {
        const f = fixture(attach);
        try {
          f.c.runtimeReclaimEligibleSince.set("owned", 0);
          mutate(f.s);
          const result = await f.c.reclaimInactiveSessions({
            idleTimeoutMs: 1,
            maxActiveSessions: 0.5,
          });
          assert.equal(result.protectedCount, 1);
          assert.equal(result.reclaimed.length, 0);
          assert.equal(f.c.runtimeReclaimEligibleSince.has("owned"), false);
        } finally {
          f.close();
        }
      }
    },
  ],
  [
    "ignored sessions do not count toward capacity and clear earlier eligibility",
    async (attach) => {
      const f = fixture(attach);
      try {
        f.add("ignored");
        f.c.runtimeReclaimEligibleSince.set("ignored", 0);
        f.c.runtimeReclaimEligibleSince.set("gone", 0);
        const result = await f.c.reclaimInactiveSessions({
          maxActiveSessions: 1,
          idleTimeoutMs: 0,
          isSessionIgnored: (info: any) => info.sessionId === "ignored",
        });
        assert.equal(result.ignoredCount, 1);
        assert.equal(result.activeManagedSessionCount, 1);
        assert.equal(result.reclaimed.length, 0);
        assert.equal(f.c.runtimeReclaimEligibleSince.has("ignored"), false);
        assert.equal(f.c.runtimeReclaimEligibleSince.has("gone"), false);
      } finally {
        f.close();
      }
    },
  ],
  [
    "capacity reclaims oldest eligibility before idle timeout and avoids double destruction",
    async (attach) => {
      const f = fixture(attach);
      try {
        f.add("older");
        f.add("newer");
        f.c.runtimeReclaimEligibleSince.set("owned", 50);
        f.c.runtimeReclaimEligibleSince.set("older", 10);
        f.c.runtimeReclaimEligibleSince.set("newer", 100);
        const result = await f.c.reclaimInactiveSessions({
          maxActiveSessions: 2,
          idleTimeoutMs: 1,
        });
        assert.deepEqual(f.destroyed, ["older", "owned", "newer"]);
        assert.deepEqual(
          result.reclaimed.map((r: any) => r.reason),
          [
            "max_active_sessions",
            "background_idle_timeout",
            "background_idle_timeout",
          ],
        );
      } finally {
        f.close();
      }
    },
  ],
  [
    "failed destroy clears ownership and can be retried without reporting success",
    async (attach) => {
      const f = fixture(attach);
      try {
        let attempts = 0;
        f.c.destroySession = async () => {
          attempts++;
          throw Error("owned failure");
        };
        const result = await f.c.reclaimInactiveSessions({
          maxActiveSessions: 0.5,
          idleTimeoutMs: 0,
        });
        assert.equal(result.reclaimed.length, 0);
        assert.equal(f.c.runtimeReclaimingSessions.size, 0);
        assert.equal(f.c.runtimeReclaimEligibleSince.has("owned"), false);
        await f.c.reclaimInactiveSessions({
          maxActiveSessions: 0.5,
          idleTimeoutMs: 0,
        });
        assert.equal(attempts, 2);
        assert.equal(f.c.runtimeReclaimPromise, null);
      } finally {
        f.close();
      }
    },
  ],
  [
    "concurrent sweeps share in-flight work and retain the first sweep options",
    async (attach) => {
      const f = fixture(attach);
      try {
        let release!: () => void;
        const gate = new Promise<void>((r) => {
          release = r;
        });
        let calls = 0;
        f.c.destroySession = async (id: string) => {
          calls++;
          await gate;
          f.c.sessions.delete(id);
        };
        const first = f.c.reclaimInactiveSessions({
          maxActiveSessions: 0.5,
          idleTimeoutMs: 0,
        });
        const second = f.c.reclaimInactiveSessions({
          maxActiveSessions: 0,
          idleTimeoutMs: 0,
        });
        assert.equal(calls, 1);
        assert.equal(f.c.runtimeReclaimingSessions.has("owned"), true);
        assert.equal(await f.c.reclaimRuntimeSession(f.s, "duplicate"), null);
        release();
        assert.deepEqual(await first, await second);
        assert.equal(f.c.runtimeReclaimPromise, null);
      } finally {
        f.close();
      }
    },
  ],
  [
    "nonfinite limits use original defaults while finite nonpositive values disable",
    async (attach) => {
      const f = fixture(attach);
      try {
        for (let i = 0; i < 6; i++) f.add("extra" + i);
        assert.equal(
          (
            await f.c.reclaimInactiveSessions({
              idleTimeoutMs: 0,
              maxActiveSessions: 0,
            })
          ).reclaimed.length,
          0,
        );
        const result = await f.c.reclaimInactiveSessions({
          idleTimeoutMs: Infinity,
          maxActiveSessions: Infinity,
        });
        assert.equal(result.reclaimed.length, 1);
        assert.equal(result.reclaimed[0].reason, "max_active_sessions");
        f.state.now += 899999;
        assert.equal(
          (
            await f.c.reclaimInactiveSessions({
              idleTimeoutMs: NaN,
              maxActiveSessions: 0,
            })
          ).reclaimed.length,
          0,
        );
        f.state.now++;
        assert.equal(
          (
            await f.c.reclaimInactiveSessions({
              idleTimeoutMs: NaN,
              maxActiveSessions: 0,
            })
          ).reclaimed.length,
          6,
        );
      } finally {
        f.close();
      }
    },
  ],
  [
    "janitor copies options, runs immediately, unrefs and replaces the prior interval",
    async (attach) => {
      const f = fixture(attach);
      try {
        const options = { idleTimeoutMs: 0, maxActiveSessions: 0 };
        f.c.startRuntimeReclaimJanitor(options);
        await f.c.runtimeReclaimPromise;
        assert.equal(f.timers[0].ms, 30000);
        assert.equal(f.timers[0].unrefs, 1);
        options.maxActiveSessions = 0.5;
        assert.equal(f.c.runtimeReclaimJanitorOptions.maxActiveSessions, 0);
        f.c.startRuntimeReclaimJanitor({ sweepIntervalMs: 0 });
        assert.equal(f.cleared.length, 1);
        assert.equal(f.timers.length, 1);
        assert.equal(f.c.runtimeReclaimJanitorTimer, undefined);
        f.c.startRuntimeReclaimJanitor({
          sweepIntervalMs: 7,
          idleTimeoutMs: 0,
          maxActiveSessions: 0,
        });
        await f.c.runtimeReclaimPromise;
        assert.equal(f.timers[1].ms, 7);
        f.c.stopRuntimeReclaimJanitor();
        assert.equal(f.c.runtimeReclaimJanitorOptions, undefined);
        assert.equal(f.cleared.length, 2);
      } finally {
        f.close();
      }
    },
  ],
  [
    "sweep rejection releases single-flight state and janitor logs the rejection",
    async (attach) => {
      const f = fixture(attach);
      try {
        const options = {
          isSessionIgnored() {
            throw Error("predicate failure");
          },
        };
        await assert.rejects(
          f.c.reclaimInactiveSessions(options),
          /predicate failure/,
        );
        assert.equal(f.c.runtimeReclaimPromise, null);
        f.c.startRuntimeReclaimJanitor(options);
        await assert.rejects(f.c.runtimeReclaimPromise, /predicate failure/);
        await Promise.resolve();
        assert.ok(
          f.warnings.some(
            (entry: any[]) =>
              entry[1] === "[SessionManager] runtime reclaim janitor failed",
          ),
        );
        f.c.stopRuntimeReclaimJanitor();
        assert.equal(
          (
            await f.c.reclaimInactiveSessions({
              idleTimeoutMs: 0,
              maxActiveSessions: 0,
            })
          ).eligibleCount,
          1,
        );
      } finally {
        f.close();
      }
    },
  ],
];

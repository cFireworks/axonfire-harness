import assert from "node:assert/strict";
import type { attachNativeSessionLoading } from "../../src/sessions/native-session-loading.js";
import { attachNativeSessionReplay } from "../../src/sessions/native-session-replay.js";
import { sessionReplayFixture } from "./session-replay-scenarios.js";
type Factory = typeof attachNativeSessionLoading;
function fixture(attach: Factory) {
  const f = sessionReplayFixture(attachNativeSessionReplay);
  const emitted: any[] = [];
  f.c.emitScoped = (_id: string, payload: any) => emitted.push(payload);
  f.c.toSessionInfo = (s: any) => ({ sessionId: s.sessionId, cwd: s.cwd });
  f.c.pendingSessionRestores = new Map();
  f.s.bufferedScopedEventsDuringHistoryHydration = [];
  attach(f.c);
  return {
    ...f,
    emitted,
    close() {
      clearTimeout(f.s.historyHydrationFallbackHandle);
      f.close();
    },
  };
}
const message = (kind: string, text: string): any => ({
  sessionId: "owned",
  update: {
    sessionUpdate: kind + "_message_chunk",
    content: { type: "text", text },
  },
});
function seed(f: ReturnType<typeof fixture>) {
  f.s.eventHistory = [
    message("user", "question"),
    message("agent", "answer"),
    { type: "permissionRequest", requestId: "old" },
  ];
  f.s.pendingPermissionRequests.set("p", {
    requestId: "p",
    request: { options: [] },
  });
  f.s.pendingQuestionRequests.set("q", {
    toolCallId: "q",
    request: { questions: [] },
  });
  f.s.pendingElicitationRequests.set("e", {
    elicitationId: "e",
    request: { _meta: { toolCallId: "tool" } },
  });
  f.s.planSnapshot = {
    sessionId: "owned",
    update: { sessionUpdate: "plan", entries: [] },
  };
}
export const sessionLoadingScenarios: [
  string,
  (attach: Factory) => Promise<void>,
][] = [
  [
    "ordinary active load emits pending inputs and plan without transcript",
    async (attach) => {
      const f = fixture(attach);
      try {
        seed(f);
        const info = await f.c.loadSession("owned");
        assert.equal(info.rendererHistoryReplayComplete, false);
        assert.deepEqual(
          f.emitted.map((p) => p.type ?? p.update.sessionUpdate),
          [
            "permissionRequest",
            "questionRequest",
            "elicitationRequest",
            "plan",
          ],
        );
        assert.ok(
          f.emitted
            .slice(0, 3)
            .every((p) => p.workbuddyReplayKind === "pendingInput"),
        );
        assert.equal(f.emitted[3]._meta["codebuddy.ai"].mode, "history");
      } finally {
        f.close();
      }
    },
  ],
  [
    "forced idle load clones full history, excludes old input requests and appends current inputs",
    async (attach) => {
      const f = fixture(attach);
      try {
        seed(f);
        const info = await f.c.loadSession("owned", undefined, {
          forceRendererHistoryReplay: true,
        });
        assert.equal(info.rendererHistoryReplayComplete, true);
        assert.deepEqual(
          f.emitted.map((p) => p.type ?? p.update.sessionUpdate),
          [
            "user_message_chunk",
            "agent_message_chunk",
            "plan",
            "permissionRequest",
            "questionRequest",
            "elicitationRequest",
          ],
        );
        f.emitted[0].update.content.text = "mutated";
        assert.equal(f.s.eventHistory[0].update.content.text, "question");
      } finally {
        f.close();
      }
    },
  ],
  [
    "processing or invocation activity restricts forced replay to users and current inputs",
    async (attach) => {
      for (const flag of ["isProcessing", "promptInvocationActive"]) {
        const f = fixture(attach);
        try {
          seed(f);
          f.s[flag] = true;
          assert.equal(
            (
              await f.c.loadSession("owned", undefined, {
                forceRendererHistoryReplay: true,
              })
            ).rendererHistoryReplayComplete,
            false,
          );
          assert.deepEqual(
            f.emitted.map((p) => p.type ?? p.update.sessionUpdate),
            [
              "user_message_chunk",
              "permissionRequest",
              "questionRequest",
              "elicitationRequest",
            ],
          );
        } finally {
          f.close();
        }
      }
    },
  ],
  [
    "stored replay prefers hydrated owner and reports live completeness separately",
    async (attach) => {
      const f = fixture(attach);
      try {
        seed(f);
        f.s.ownerHistoryHydrated = true;
        f.c.primedReplayStates.set("owned", {
          events: [message("user", "stale")],
        });
        assert.equal(f.c.hasStoredSessionHistory("owned"), true);
        assert.deepEqual(f.c.replayStoredSessionHistory("owned"), {
          replayed: true,
          complete: true,
        });
        assert.equal(f.emitted.length, 3);
        f.emitted.length = 0;
        f.s.promptInvocationActive = true;
        assert.deepEqual(f.c.replayStoredSessionHistory("owned"), {
          replayed: true,
          complete: false,
        });
        assert.equal(f.emitted.length, 1);
        assert.equal(f.emitted[0].update.content.text, "question");
      } finally {
        f.close();
      }
    },
  ],
  [
    "unhydrated owner falls back to primed history including its input payloads",
    async (attach) => {
      const f = fixture(attach);
      try {
        assert.equal(f.c.hasStoredSessionHistory("owned"), false);
        assert.deepEqual(f.c.replayStoredSessionHistory("owned"), {
          replayed: false,
          complete: false,
        });
        const events = [
          message("agent", "primed"),
          { type: "questionRequest", request: { value: 1 } },
        ];
        f.c.primedReplayStates.set("owned", { events });
        assert.equal(f.c.hasStoredSessionHistory("owned"), true);
        assert.deepEqual(f.c.replayStoredSessionHistory("owned"), {
          replayed: true,
          complete: true,
        });
        assert.equal(f.emitted.length, 2);
        f.emitted[1].request.value = 2;
        assert.equal(events[1].request.value, 1);
      } finally {
        f.close();
      }
    },
  ],
  [
    "pending input replay distinguishes ready restoration from active-only lookup",
    async (attach) => {
      const f = fixture(attach);
      try {
        seed(f);
        assert.equal(f.c.replayActivePendingInputs("absent"), false);
        assert.equal(f.c.replayActivePendingInputs("owned"), true);
        assert.equal(f.emitted.length, 3);
        f.c.resolveReadySession = async (id: string) => {
          assert.equal(id, "restored");
          return f.s;
        };
        await f.c.replayPendingInputs("restored");
        assert.equal(f.emitted.length, 6);
      } finally {
        f.close();
      }
    },
  ],
  [
    "inactive loading delegates load restore and marks renderer complete",
    async (attach) => {
      const f = fixture(attach);
      try {
        f.c.sessions.clear();
        const calls: any[] = [];
        f.c.restoreInactiveSessionState = async (...args: any[]) => {
          calls.push(args);
          return f.s;
        };
        const info = await f.c.loadSession("owned", "/requested");
        assert.deepEqual(calls, [["owned", "/requested", "load"]]);
        assert.equal(info.rendererHistoryReplayComplete, true);
        assert.equal(f.emitted.length, 0);
      } finally {
        f.close();
      }
    },
  ],
  [
    "pending load is reused while pending resume triggers a backend history load",
    async (attach) => {
      const f = fixture(attach);
      try {
        f.c.sessions.clear();
        const calls: any[] = [];
        f.c.pendingSessionRestores.set("owned", {
          kind: "load",
          promise: Promise.resolve(f.s),
        });
        assert.equal(
          await f.c.loadInactiveSessionState("owned", "/other"),
          f.s,
        );
        assert.equal(f.s.historyHydrationDepth, 0);
        f.c.pendingSessionRestores.set("owned", {
          kind: "resume",
          promise: Promise.resolve(f.s),
        });
        f.s.cwd = " /owned/sub/../ ";
        f.s._meta = { retained: true };
        f.s.backend = {
          loadSession: async (request: any) => {
            calls.push(request);
          },
        };
        assert.equal(
          await f.c.loadInactiveSessionState("owned", "/other"),
          f.s,
        );
        assert.deepEqual(calls, [
          { cwd: "/owned", mcpServers: [], _meta: { retained: true } },
        ]);
        assert.equal(f.s.historyHydrationDepth, 1);
        assert.ok(f.s.historyHydrationFallbackHandle);
        await new Promise((resolve) => setTimeout(resolve, 75));
        assert.equal(f.s.historyHydrationDepth, 0);
        assert.equal(f.s.awaitingHistoryReplayEnd, false);
      } finally {
        f.close();
      }
    },
  ],
  [
    "backend history failure still finishes hydration; missing cwd fails before finally",
    async (attach) => {
      const f = fixture(attach);
      try {
        f.c.sessions.clear();
        f.c.pendingSessionRestores.set("owned", {
          kind: "resume",
          promise: Promise.resolve(f.s),
        });
        f.s.backend = {
          loadSession: async () => {
            throw new Error("owned backend failure");
          },
        };
        await assert.rejects(
          f.c.loadInactiveSessionState("owned"),
          /owned backend failure/,
        );
        assert.ok(f.s.historyHydrationFallbackHandle);
        await new Promise((resolve) => setTimeout(resolve, 75));
        assert.equal(f.s.historyHydrationDepth, 0);
        f.s.cwd = " ";
        await assert.rejects(
          f.c.loadInactiveSessionState("owned"),
          /without cwd/,
        );
        assert.equal(f.s.historyHydrationDepth, 1);
        assert.equal(f.s.awaitingHistoryReplayEnd, true);
      } finally {
        f.close();
      }
    },
  ],
];

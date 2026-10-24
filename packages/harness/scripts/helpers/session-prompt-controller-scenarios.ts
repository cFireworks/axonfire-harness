import assert from "node:assert/strict";
import type { attachNativeSessionPromptController } from "../../src/sessions/native-session-prompt-controller.js";
import { attachNativeSessionReplay } from "../../src/sessions/native-session-replay.js";
import { sessionReplayFixture } from "./session-replay-scenarios.js";
type Factory = typeof attachNativeSessionPromptController;
function fixture(attach: Factory) {
  const f = sessionReplayFixture(attachNativeSessionReplay),
    sent: any[] = [],
    published: any[] = [],
    telemetry: any[] = [],
    saved: any[] = [];
  f.s.desiredConfig = { expertId: " expert ", expertMarketplace: " market " };
  f.s.backend = {
    onSessionUpdate: () => {},
    async prompt(input: any) {
      sent.push(input);
      return { stopReason: "end_turn" };
    },
  };
  Object.assign(f.c, {
    withReadySession: async (_id: any, fn: any) => fn(f.s),
    requireSession: () => f.s,
    resolveBackendForPromptSend: async () => f.s.backend,
    flushSessionEffects: () => f.drain(),
    async persistLastUserPromptExpertSelection(s: any) {
      saved.push(s.lastUserPromptExpertSelection);
    },
    pushEvent: (...x: any[]) => published.push(x),
  });
  attach(f.c, { reportTelemetry: (...x: any[]) => telemetry.push(x) });
  return {
    ...f,
    sent,
    published,
    telemetry,
    saved,
    close() {
      f.s.noResponseWatchdog?.stop();
      f.close();
    },
  };
}
const input = () => [{ type: "text", text: "owned prompt" }];
const chunk = (text: string, compact = false) => ({
  update: {
    sessionUpdate: "agent_message_chunk",
    content: { type: "text", text },
    ...(compact ? { _meta: { "codebuddy.ai/isCompactInternal": true } } : {}),
  },
});
export const sessionPromptControllerScenarios: Array<
  [string, (attach: Factory) => Promise<void>]
> = [
  [
    "normal prompt restores callback and persists expert selection with assistant text",
    async (attach) => {
      const f = fixture(attach);
      try {
        const prior = f.s.backend.onSessionUpdate;
        f.s.backend.prompt = async () => {
          f.s.backend.onSessionUpdate(chunk("hello"));
          f.s.backend.onSessionUpdate(chunk(" world"));
          return { stopReason: "end_turn", _meta: { kept: true } };
        };
        const result = await f.c.prompt("owned", input(), {
          "codebuddy.ai": {
            userMessageId: "m",
            emitSyntheticUserPromptLive: true,
          },
        });
        assert.equal(
          result._meta["codebuddy.ai"].lastAssistantText,
          "hello world",
        );
        assert.equal(result._meta.kept, true);
        assert.equal(f.s.backend.onSessionUpdate, prior);
        assert.equal(f.s.promptInvocationActive, false);
        assert.equal(f.s.isProcessing, false);
        assert.equal(f.s.taskState.terminalOutcome, "completed");
        assert.deepEqual(f.saved, [{ id: "expert", marketplace: "market" }]);
        assert.equal(f.s.eventHistory[0]._meta["codebuddy.ai"].messageId, "m");
        assert.equal(f.published.length, 1);
        assert.equal(f.s.noResponseWatchdog.timer, null);
      } finally {
        f.close();
      }
    },
  ],
  [
    "background automation aggregates tool updates and excludes compact-only text",
    async (attach) => {
      const f = fixture(attach);
      try {
        f.s.backend.prompt = async () => {
          f.s.backend.onSessionUpdate(chunk("summary", true));
          f.s.backend.onSessionUpdate({
            update: {
              sessionUpdate: "tool_call",
              toolCallId: "t",
              title: "Write",
            },
          });
          f.s.backend.onSessionUpdate({
            update: {
              sessionUpdate: "tool_call_update",
              toolCallId: "t",
              status: "completed",
              rawOutput: { ok: 1 },
            },
          });
          return { stopReason: "end_turn" };
        };
        const r = await f.c.prompt("owned", input(), {
          "codebuddy.ai": { isAutomationBackground: true },
        });
        assert.equal(r._meta["codebuddy.ai"].isSummaryOnly, true);
        assert.equal(r._meta["codebuddy.ai"].lastAssistantText, "");
        assert.equal(r._meta["codebuddy.automation"].messageCount, 1);
        assert.equal(
          r._meta["codebuddy.automation"].runResult.messages[0].content[0]
            .result.success,
          true,
        );
        assert.equal(f.saved.length, 0);
      } finally {
        f.close();
      }
    },
  ],
  [
    "cancel causes distinguish user, recommendation, teardown and stale cancellation",
    async (attach) => {
      for (const [flag, cause, outcome] of [
        ["userCancelRequested", "user_cancel", "completed"],
        [
          "pluginRecommendationCancelRequested",
          "recommendation_switch",
          "completed",
        ],
        ["stopRequested", "session_teardown", "terminated"],
        ["none", "unknown_interrupted", "completed"],
      ] as const) {
        const f = fixture(attach);
        try {
          f.s.backend.prompt = async () => {
            f.s[flag] = true;
            return { stopReason: "cancelled" };
          };
          const r = await f.c.prompt("owned", input());
          assert.equal(r._meta["codebuddy.ai/cancelCause"], cause);
          assert.equal(f.s.taskState.terminalOutcome, outcome);
          assert.equal(f.s.promptInvocationActive, false);
        } finally {
          f.close();
        }
      }
    },
  ],
  [
    "backend restart cancellation metadata terminates without a stop flag",
    async (attach) => {
      const f = fixture(attach);
      try {
        f.s.backend.prompt = async () => ({
          stopReason: "cancelled",
          _meta: { "codebuddy.ai/cancelCause": " backend_restart " },
        });
        await f.c.prompt("owned", input());
        assert.equal(f.s.taskState.terminalOutcome, "terminated");
        assert.equal(f.s.taskState.terminationReason, "backend_restart");
      } finally {
        f.close();
      }
    },
  ],
  [
    "team completion stays working after prompt response until idle arrives",
    async (attach) => {
      const f = fixture(attach);
      try {
        f.s.backend.prompt = async () => {
          f.c.handleTeamRuntimeUpdate(f.s, {
            _meta: { "codebuddy.ai/teamUpdate": { type: "team_created" } },
          });
          return { stopReason: "end_turn" };
        };
        await f.c.prompt("owned", input());
        assert.equal(f.s.taskState.terminalOutcome, null);
        assert.ok(f.s.teamRuntime.deferredCompletion);
        assert.equal(f.s.promptInvocationActive, false);
        assert.equal(f.s.isProcessing, true);
        f.c.handleTeamRuntimeUpdate(f.s, {
          _meta: { "codebuddy.ai/teamUpdate": { type: "team_idle" } },
        });
        await f.drain();
        assert.equal(f.s.taskState.terminalOutcome, "completed");
        assert.equal(f.s.isProcessing, false);
      } finally {
        f.close();
      }
    },
  ],
  [
    "pending question keeps awaiting-input processing after invocation finishes",
    async (attach) => {
      const f = fixture(attach);
      try {
        f.s.backend.prompt = async () => {
          f.c.applyTaskSignal(f.s, {
            type: "awaiting_input",
            kind: "question",
          });
          f.s.pendingQuestionRequests.set("q", { request: {} });
          return { stopReason: "end_turn" };
        };
        await f.c.prompt("owned", input());
        assert.equal(f.s.taskState.runState, "awaiting_input");
        assert.equal(f.s.isProcessing, true);
        assert.equal(f.s.promptInvocationActive, false);
        assert.equal(
          f.s.teamRuntime.lastCompletedTurnSeq,
          f.s.taskState.turnSeq,
        );
      } finally {
        f.close();
      }
    },
  ],
  [
    "backend errors restore callback and emit fallback failure only when backend lacks native error metadata",
    async (attach) => {
      for (const native of [false, true]) {
        const f = fixture(attach);
        try {
          const prior = f.s.backend.onSessionUpdate;
          const error = Object.assign(
            Error("owned failure"),
            native ? { code: 9, data: { reason: "owned" } } : {},
          );
          f.s.backend.prompt = async () => {
            throw error;
          };
          await assert.rejects(f.c.prompt("owned", input()), /owned failure/);
          assert.equal(f.s.backend.onSessionUpdate, prior);
          assert.equal(f.s.taskState.terminalOutcome, "error");
          assert.equal(f.s.promptInvocationActive, false);
          assert.equal(f.s.isProcessing, false);
          assert.equal(f.published.length, native ? 0 : 1);
        } finally {
          f.close();
        }
      }
    },
  ],
  [
    "clear and compact paths preserve original no-op and compact-failed recovery",
    async (attach) => {
      const f = fixture(attach);
      try {
        await f.c.prompt("owned", input(), {
          "codebuddy.ai": { isClearSession: true },
        });
        assert.equal(f.s.justInsertedSeparator, true);
        const seq = f.s.taskState.turnSeq;
        const r = await f.c.prompt("owned", input(), {
          "codebuddy.ai": { isCompactSession: true },
        });
        assert.deepEqual(r, { stopReason: "end_turn" });
        assert.equal(f.sent.length, 1);
        assert.equal(f.s.taskState.turnSeq, seq);
        f.s.backend.prompt = async () => {
          throw { code: -32004, data: { reason: "compact_failed" } };
        };
        assert.deepEqual(
          await f.c.prompt("owned", input(), {
            "codebuddy.ai": { isCompactSession: true },
          }),
          { stopReason: "end_turn" },
        );
        assert.equal(f.s.taskState.terminalOutcome, "completed");
      } finally {
        f.close();
      }
    },
  ],
  [
    "composer clones input and enriches project and prior expert metadata",
    async (attach) => {
      const f = fixture(attach);
      try {
        const original = input();
        f.s.projectId = "project";
        f.s.lastUserPromptExpertSelection = { id: "prior" };
        let composed: any;
        f.c.userPromptComposer = {
          async composeUserPrompt(x: any) {
            composed = x;
            x.prompt[0].text = "composed";
            return x.prompt;
          },
        };
        f.c.userPromptComposerReady = Promise.resolve();
        await f.c.prompt("owned", original, {
          "codebuddy.ai": { projectId: "explicit" },
        });
        assert.equal(original[0]!.text, "owned prompt");
        assert.equal(f.sent[0].prompt[0].text, "composed");
        assert.equal(composed._meta["codebuddy.ai"].projectId, "explicit");
        assert.deepEqual(
          composed._meta["codebuddy.ai"].previousExpertSelection,
          { id: "prior" },
        );
        assert.equal(
          f.s.eventHistory[0].update.content[0].text,
          "owned prompt",
        );
      } finally {
        f.close();
      }
    },
  ],
  [
    "continuation barrier blocks ordinary prompts but tagged prompt identity bypasses it",
    async (attach) => {
      const f = fixture(attach);
      try {
        let release!: () => void;
        f.c.pluginRecommendationContinuationBarriers.set("owned", {
          settled: new Promise<void>((r) => (release = r)),
        });
        const queued = f.c.prompt("owned", input());
        await new Promise((r) => setTimeout(r, 10));
        assert.equal(f.sent.length, 0);
        release();
        await queued;
        const bypass = input();
        f.c.pluginRecommendationContinuationBarriers.set("owned", {
          settled: new Promise(() => {}),
        });
        f.c.pluginRecommendationContinuationPrompts.add(bypass);
        await f.c.prompt("owned", bypass);
        assert.equal(f.sent.length, 2);
      } finally {
        f.close();
      }
    },
  ],
  [
    "watchdog reports once per window and uses pending-input threshold separately",
    async (attach) => {
      const f = fixture(attach);
      try {
        f.c.noResponseWatchdogConfig = {
          checkIntervalMs: 100000,
          timeoutThresholdMs: 100,
          awaitingInputTimeoutMs: 30,
        };
        f.s.isProcessing = true;
        f.s.promptStartedAt = 100;
        f.c.startNoResponseWatchdog(f.s);
        const w = f.s.noResponseWatchdog;
        let now = 199;
        w.now = () => now;
        w.tick();
        assert.equal(f.telemetry.length, 0);
        now = 200;
        w.tick();
        w.tick();
        assert.equal(f.telemetry.length, 1);
        w.resetReportedFlag();
        f.s.taskState.runState = "awaiting_input";
        f.s.hasPendingInput = true;
        f.s.awaitingInputStartedAt = 200;
        now = 230;
        w.tick();
        assert.equal(f.telemetry.length, 2);
        assert.equal(f.telemetry[1][1].stuck_in_awaiting_input, true);
        w.resetReportedFlag();
        f.s.userCancelRequested = true;
        w.tick();
        assert.equal(w.timer, null);
      } finally {
        f.close();
      }
    },
  ],
];

import assert from "node:assert/strict";
import type { attachNativeSessionHistory } from "../../src/sessions/native-session-history.js";
type Factory = typeof attachNativeSessionHistory;
function fixture(attach: Factory) {
  const emitted: any[] = [],
    persisted: any[] = [],
    effects: Promise<any>[] = [];
  const s: any = {
    sessionId: "owned",
    eventHistory: [],
    historyHydrationDepth: 0,
    bufferedScopedEventsDuringHistoryHydration: [],
    awaitingHistoryReplayEnd: false,
    hasUserMessageSinceLastCompact: false,
  };
  const c: any = attach(
    {
      enqueueSessionEffect(_s: any, fn: any) {
        const p = Promise.resolve().then(fn);
        effects.push(p);
        return p;
      },
      persistLastUserPromptExpertSelection: async (...a: any[]) => {
        persisted.push(a);
      },
    },
    { pushEvent: (...a: any[]) => emitted.push(a) },
  );
  return {
    c,
    s,
    emitted,
    persisted,
    effects,
    close() {
      clearTimeout(s.historyHydrationFallbackHandle);
    },
  };
}
const event = (mode: string, offset: any, text = "text"): any => ({
  sessionId: "owned",
  update: {
    sessionUpdate: "agent_message_chunk",
    content: { type: "text", text },
  },
  _meta: { "codebuddy.ai": { mode, offset } },
});
export const sessionHistoryScenarios: Array<
  [string, (attach: Factory) => Promise<void>]
> = [
  [
    "history offset parsing deduplicates while stream bypasses offset lookup",
    async (attach) => {
      const { c, s } = fixture(attach);
      const first = event("history", "12tail");
      assert.equal(c.recordSessionEvent(s, first), "added");
      first.update.content.text = "mutated";
      assert.equal(s.eventHistory[0].update.content.text, "text");
      assert.equal(c.recordSessionEvent(s, event("history", 12)), "duplicate");
      assert.equal(c.recordSessionEvent(s, event("stream", 12)), "added");
      assert.equal(c.recordSessionEvent(s, event("history", 12.5)), "added");
      assert.equal(c.recordSessionEvent(s, event("history", NaN)), "added");
    },
  ],
  [
    "real user message replaces synthetic only after offset gate and IDs remain untrimmed",
    async (attach) => {
      const { c, s } = fixture(attach);
      const user = (synthetic: boolean, id: string, offset?: number) => ({
        update: { sessionUpdate: "user_message_chunk" },
        _meta: {
          "codebuddy.ai": {
            messageId: id,
            syntheticOwnerHistory: synthetic,
            offset,
          },
        },
      });
      assert.equal(c.recordSessionEvent(s, user(true, " m ")), "added");
      assert.equal(c.recordSessionEvent(s, user(false, " m ")), "replaced");
      assert.equal(c.recordSessionEvent(s, user(true, " m ")), "duplicate");
      assert.equal(c.recordSessionEvent(s, user(false, "m")), "added");
      assert.equal(s.hasUserMessageSinceLastCompact, true);
      s.eventHistory = [];
      c.recordSessionEvent(s, user(true, "x", 1));
      assert.equal(c.recordSessionEvent(s, user(false, "x", 1)), "duplicate");
      assert.equal(
        s.eventHistory[0]._meta["codebuddy.ai"].syntheticOwnerHistory,
        true,
      );
    },
  ],
  [
    "stream question replaces history and cancellation resolutions always replace",
    async (attach) => {
      const { c, s } = fixture(attach);
      const q = (mode: string) => ({
        type: "questionRequest",
        toolCallId: "q",
        _meta: { "codebuddy.ai": { mode } },
      });
      c.recordSessionEvent(s, q("history"));
      assert.equal(c.recordSessionEvent(s, q("stream")), "replaced");
      assert.equal(c.recordSessionEvent(s, q("history")), "duplicate");
      c.recordSessionEvent(s, {
        type: "questionCancelled",
        toolCallId: "q",
        reason: "one",
      });
      assert.equal(
        c.recordSessionEvent(s, {
          type: "questionCancelled",
          toolCallId: "q",
          reason: "two",
        }),
        "replaced",
      );
      assert.equal(s.eventHistory[1].reason, "two");
      assert.equal(
        c.recordSessionEvent(s, { type: "permissionRequest", requestId: "p" }),
        "added",
      );
      assert.equal(
        c.recordSessionEvent(s, { type: "permissionRequest", requestId: "p" }),
        "added",
      );
    },
  ],
  [
    "statusless tool updates coalesce through text but stop at intervening tool events",
    async (attach) => {
      const { c, s } = fixture(attach);
      const tool = (id: string, status?: any) => ({
        update: {
          sessionUpdate: "tool_call_update",
          toolCallId: id,
          ...(status !== undefined ? { status } : {}),
        },
      });
      c.recordSessionEvent(s, tool("a"));
      c.recordSessionEvent(s, event("stream", undefined));
      assert.equal(c.recordSessionEvent(s, tool("a")), "replaced");
      c.recordSessionEvent(s, tool("b", "completed"));
      assert.equal(c.recordSessionEvent(s, tool("a")), "added");
      assert.equal(c.recordSessionEvent(s, tool("a", null)), "added");
      assert.equal(c.recordSessionEvent(s, tool("a")), "added");
    },
  ],
  [
    "compaction state updates before duplicate detection but explicit replay skips effects",
    async (attach) => {
      const f = fixture(attach);
      f.s.hasUserMessageSinceLastCompact = true;
      f.s.lastUserPromptExpertSelection = { id: "old" };
      const compact = {
        ...event("history", 2),
        _meta: {
          "codebuddy.ai": { mode: "history", offset: 2 },
          isSessionSeparator: true,
        },
      };
      f.c.recordSessionEvent(f.s, compact);
      f.c.recordSessionEvent(f.s, compact);
      await Promise.all(f.effects);
      assert.equal(f.persisted.length, 2);
      assert.equal(f.persisted[0][1], null);
      assert.equal(f.s.hasUserMessageSinceLastCompact, false);
      assert.equal(f.s.lastUserPromptExpertSelection, undefined);
      f.s.hasUserMessageSinceLastCompact = true;
      f.c.recordSessionEvent(f.s, compact, { isReplay: true });
      assert.equal(f.s.hasUserMessageSinceLastCompact, true);
      assert.equal(f.effects.length, 2);
    },
  ],
  [
    "nested hydration sends history immediately and releases cloned live events once",
    async (attach) => {
      const f = fixture(attach);
      try {
        f.c.beginHistoryHydration(f.s);
        f.c.beginHistoryHydration(f.s);
        const live = event("stream", 1, "before");
        f.c.emitOrBufferScopedEvent(f.s, live);
        live.update.content.text = "after";
        f.c.emitOrBufferScopedEvent(f.s, event("history", 2));
        assert.equal(f.emitted.length, 1);
        f.c.finishHistoryHydration(f.s);
        assert.equal(f.emitted.length, 1);
        f.c.finishHistoryHydration(f.s);
        assert.equal(f.emitted.length, 2);
        assert.equal(f.emitted[1][1].update.content.text, "before");
        assert.equal(f.s.bufferedScopedEventsDuringHistoryHydration.length, 0);
        f.c.finishHistoryHydration(f.s);
        assert.equal(f.emitted.length, 2);
      } finally {
        f.close();
      }
    },
  ],
  [
    "replay phase priority starts once and end clears pending state",
    async (attach) => {
      const f = fixture(attach);
      try {
        const start = {
          _meta: { "codebuddy.ai/historyReplay": "end" },
          update: { _meta: { "codebuddy.ai/historyReplay": "start" } },
        };
        f.c.handleHistoryReplayBoundary(f.s, start);
        f.c.handleHistoryReplayBoundary(f.s, start);
        assert.equal(f.s.historyHydrationDepth, 1);
        assert.equal(f.s.awaitingHistoryReplayEnd, true);
        f.c.emitOrBufferScopedEvent(f.s, event("stream", 1));
        f.c.handleHistoryReplayCompletion(f.s, {
          _meta: { "codebuddy.ai": { historyReplay: "end" } },
        });
        assert.equal(f.s.historyHydrationDepth, 0);
        assert.equal(f.s.awaitingHistoryReplayEnd, false);
        assert.equal(f.emitted.length, 1);
        assert.equal(f.s.sawHistoryReplayStart, false);
      } finally {
        f.close();
      }
    },
  ],
  [
    "fallback releases absent replay after fifty milliseconds but honors a late start",
    async (attach) => {
      const f = fixture(attach);
      try {
        f.c.beginHistoryHydration(f.s);
        f.s.awaitingHistoryReplayEnd = true;
        f.c.emitOrBufferScopedEvent(f.s, event("stream", 1));
        f.c.finishHistoryHydrationAfterBackendReplay(f.s);
        assert.ok(f.s.historyHydrationFallbackHandle);
        await new Promise((r) => setTimeout(r, 75));
        assert.equal(f.emitted.length, 1);
        assert.equal(f.s.historyHydrationDepth, 0);
        f.c.beginHistoryHydration(f.s);
        f.s.awaitingHistoryReplayEnd = true;
        f.c.finishHistoryHydrationAfterBackendReplay(f.s);
        f.c.handleHistoryReplayBoundary(f.s, {
          _meta: { "codebuddy.ai/historyReplay": "start" },
        });
        await new Promise((r) => setTimeout(r, 75));
        assert.equal(f.s.historyHydrationDepth, 1);
        assert.equal(f.s.awaitingHistoryReplayEnd, true);
        f.c.handleHistoryReplayCompletion(f.s, {
          _meta: { "codebuddy.ai/historyReplay": "end" },
        });
      } finally {
        f.close();
      }
    },
  ],
  [
    "replay content without start completes immediately after backend replay",
    async (attach) => {
      const f = fixture(attach);
      try {
        f.c.beginHistoryHydration(f.s);
        f.s.awaitingHistoryReplayEnd = true;
        f.c.handleHistoryReplayBoundary(f.s, event("history", 1));
        f.c.emitOrBufferScopedEvent(f.s, event("stream", 2));
        f.c.finishHistoryHydrationAfterBackendReplay(f.s);
        assert.equal(f.s.historyHydrationDepth, 0);
        assert.equal(f.emitted.length, 1);
        assert.equal(f.s.historyHydrationFallbackHandle, undefined);
      } finally {
        f.close();
      }
    },
  ],
  [
    "scoped listeners isolate callback failures but publisher failure propagates",
    async (attach) => {
      const f = fixture(attach),
        seen: any[] = [];
      const off = f.c.subscribeSessionEvents("owned", (p: any) => seen.push(p));
      const bad = f.c.subscribeSessionEvents("owned", () => {
        throw Error("listener");
      });
      const payload = { type: "owned" };
      f.c.emitScoped("owned", payload);
      assert.equal(seen[0], payload);
      assert.equal(f.emitted[0][0], "session:event:owned");
      off();
      off();
      bad();
      assert.equal(f.c.scopedEventListeners.size, 0);
      f.c.subscribeSessionEvents("owned", (p: any) => seen.push(p));
      f.c.pushEvent = () => {
        throw Error("publisher");
      };
      assert.throws(() => f.c.emitScoped("owned", payload), /publisher/);
      assert.equal(seen.length, 1);
    },
  ],
];

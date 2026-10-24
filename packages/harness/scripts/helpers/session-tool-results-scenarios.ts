import assert from "node:assert/strict";
import type { attachNativeSessionToolResults } from "../../src/sessions/native-session-tool-results.js";
import { attachNativeSessionPlans } from "../../src/sessions/native-session-plans.js";
type Factory = typeof attachNativeSessionToolResults;
function fixture(attach: Factory) {
  const observed: any[] = [],
    cancelled: any[] = [],
    warnings: any[] = [];
  const s: any = { sessionId: "owned", toolResults: new Map() };
  const c: any = attach(
    { sessions: new Map([["owned", s]]) },
    {
      toolUsageObserver: { observe: (x: any) => observed.push(x) },
      pluginRecommendationRegistry: {
        cancelRequest: (...x: any[]) => cancelled.push(x),
      },
      logger: { warn: (...x: any[]) => warnings.push(x) },
    },
  );
  const send = (update: any) => c.captureToolResultFromUpdate(s, { update });
  return { c, s, send, observed, cancelled, warnings };
}
export const sessionToolResultsScenarios: Array<
  [string, (attach: Factory) => Promise<void>]
> = [
  [
    "invalid notifications do not create records or observations",
    async (attach) => {
      const f = fixture(attach);
      for (const update of [
        undefined,
        {},
        { sessionUpdate: "plan", toolCallId: "t" },
        { sessionUpdate: "tool_call", toolCallId: 1 },
        { sessionUpdate: "tool_call_update", toolCallId: "" },
      ])
        f.send(update);
      assert.equal(f.s.toolResults.size, 0);
      assert.equal(f.observed.length, 0);
      f.send({ sessionUpdate: "tool_call", toolCallId: " " });
      assert.equal(f.s.toolResults.size, 1);
    },
  ],
  [
    "partial updates preserve undefined fields but null output clears prior result",
    async (attach) => {
      const f = fixture(attach);
      const rawInput = { x: 1 },
        rawOutput = { result: 1 };
      f.send({
        sessionUpdate: "tool_call",
        toolCallId: "t",
        toolName: "Read",
        status: "pending",
        rawInput,
        rawOutput,
        _meta: { nested: { x: 1 }, a: 1 },
      });
      const first = f.s.toolResults.get("t");
      f.send({
        sessionUpdate: "tool_call_update",
        toolCallId: "t",
        status: "completed",
        rawOutput: null,
        _meta: { nested: { y: 2 }, b: 2 },
      });
      const second = f.s.toolResults.get("t");
      assert.notEqual(first, second);
      assert.equal(second.toolName, "Read");
      assert.equal(second.rawInput, rawInput);
      assert.equal(second.rawOutput, null);
      assert.deepEqual(second.meta, { nested: { y: 2 }, a: 1, b: 2 });
      assert.equal(first.rawOutput, rawOutput);
      assert.equal(f.observed.length, 2);
    },
  ],
  [
    "tool name metadata precedence includes empty strings and ignores nested-only names",
    async (attach) => {
      const f = fixture(attach);
      f.send({
        sessionUpdate: "tool_call",
        toolCallId: "t",
        toolName: "Direct",
        title: "Title",
        _meta: { "codebuddy.ai/toolName": "" },
      });
      assert.equal(f.s.toolResults.get("t").toolName, "");
      f.send({
        sessionUpdate: "tool_call_update",
        toolCallId: "t",
        toolName: "Direct",
        title: "Title",
        _meta: { "codebuddy.ai": { toolName: "Nested" } },
      });
      assert.equal(f.s.toolResults.get("t").toolName, "Direct");
      f.send({
        sessionUpdate: "tool_call_update",
        toolCallId: "t",
        title: "Title",
        status: 4,
      });
      assert.equal(f.s.toolResults.get("t").toolName, "Title");
      assert.equal(f.s.toolResults.get("t").status, undefined);
    },
  ],
  [
    "queries copy map structure but share records and ties keep insertion order",
    async (attach) => {
      const f = fixture(attach);
      const first = { toolName: "Read", updatedAt: 10 },
        second = { toolName: "Read", updatedAt: 10 };
      f.s.toolResults.set("one", first);
      f.s.toolResults.set("two", second);
      const copy = f.c.getSessionToolResults("owned");
      copy.delete("two");
      assert.equal(f.s.toolResults.size, 2);
      copy.get("one").status = "changed";
      assert.equal(f.s.toolResults.get("one").status, "changed");
      assert.equal(f.c.getLatestToolResultByName("owned", "Read"), first);
      second.updatedAt = 11;
      assert.equal(f.c.getLatestToolResultByName("owned", "Read"), second);
      assert.equal(f.c.getSessionToolResults("absent"), undefined);
      assert.equal(f.c.getLatestToolResultByName("owned", "read"), undefined);
    },
  ],
  [
    "recommendation terminal cancellation respects run switches and preserves failure ordering",
    async (attach) => {
      const f = fixture(attach);
      for (const status of ["completed", "failed", "cancelled", "canceled"])
        f.send({
          sessionUpdate: "tool_call_update",
          toolCallId: status,
          toolName: "suggest_plugin_install",
          status,
        });
      assert.equal(f.cancelled.length, 4);
      f.c.pluginRecommendationRunSwitches.set("owned", {});
      f.send({
        sessionUpdate: "tool_call_update",
        toolCallId: "skip",
        toolName: "suggest_plugin_install",
        status: "completed",
      });
      assert.equal(f.cancelled.length, 4);
      f.c.pluginRecommendationRunSwitches.clear();
      f.c.pluginRecommendationRegistry.cancelRequest = () => {
        throw Error("owned registry");
      };
      assert.throws(
        () =>
          f.send({
            sessionUpdate: "tool_call_update",
            toolCallId: "throw",
            toolName: "suggest_plugin_install",
            status: "completed",
          }),
        /owned registry/,
      );
      assert.equal(f.s.toolResults.get("throw").status, "completed");
      assert.equal(f.observed.length, 5);
    },
  ],
  [
    "observer receives owner metadata and failure leaves captured state intact",
    async (attach) => {
      const f = fixture(attach);
      f.s._meta = {
        "codebuddy.ai": {
          sourceMode: "  craft ",
          welcomeMode: "ask",
          isBackgroundAutomation: true,
        },
      };
      f.send({
        sessionUpdate: "tool_call",
        toolCallId: "t",
        toolName: "Write",
        status: "pending",
        rawInput: { path: "owned" },
      });
      assert.equal(f.observed[0].sourceMode, "craft");
      assert.equal(f.observed[0].isBackgroundAutomation, true);
      f.s._meta = {
        "codebuddy.ai": {
          sourceMode: " ",
          welcomeMode: " ask ",
          isBackgroundAutomation: "true",
        },
      };
      f.send({ sessionUpdate: "tool_call_update", toolCallId: "t" });
      assert.equal(f.observed[1].sourceMode, "ask");
      assert.equal(f.observed[1].isBackgroundAutomation, undefined);
      f.c.toolUsageObserver.observe = () => {
        throw Error("owned observer");
      };
      f.send({
        sessionUpdate: "tool_call_update",
        toolCallId: "t",
        status: "completed",
      });
      assert.equal(f.s.toolResults.get("t").status, "completed");
      assert.equal(f.warnings.length, 1);
    },
  ],
  [
    "captured initial tool name drives plan derivation when completion omits it",
    async (attach) => {
      const f = fixture(attach);
      attachNativeSessionPlans(f.c);
      f.send({
        sessionUpdate: "tool_call",
        toolCallId: "task",
        toolName: "TaskList",
        status: "pending",
      });
      const update = {
        sessionUpdate: "tool_call_update",
        toolCallId: "task",
        status: "completed",
        rawOutput: { tasks: [{ subject: "owned task" }] },
      };
      f.send(update);
      const plan = f.c.createPlanNotificationFromTaskToolResult(f.s, {
        update,
      });
      assert.equal(plan.payload.update.entries[0].content, "owned task");
      assert.equal(plan.payload._meta["codebuddy.ai"].source, "TaskList");
      assert.equal(
        f.c.getLatestToolResultByName("owned", "TaskList").status,
        "completed",
      );
    },
  ],
];

import assert from "node:assert/strict";
import test from "node:test";
import {
  ScopedHookRegistry,
  SessionHookManager,
  shouldRegisterFrontmatterHooks,
} from "../src/hooks/session-hooks.js";
import {
  createToolCallResultItem,
  TOOL_REJECT_RESULT_CONTENT,
} from "../src/tools/tool-rejection.js";
import { HarnessSession } from "../src/sessions/session.js";

test("frontmatter hook trust gate matches installed harness", () => {
  assert.equal(shouldRegisterFrontmatterHooks(true, false), true);
  assert.equal(shouldRegisterFrontmatterHooks(false, true), true);
  assert.equal(shouldRegisterFrontmatterHooks(false, false), false);
});

test("SessionHookManager dispatches scoped SubagentStop and stores feedback", async () => {
  const registry = new ScopedHookRegistry();
  const calls: Array<{ event: string; input: Record<string, unknown> }> = [];
  const manager = new SessionHookManager(
    {
      hasHooks: (_event, _session, scoped) => Boolean(scoped?.length),
      executeHooks: (event, input) => {
        calls.push({ event, input });
        return { allowed: false, blocking: true, message: "continue tests" };
      },
    },
    registry,
  );
  const session = new HarnessSession("child", {
    storeId: "agent-store",
    agentName: "Explore",
    meta: { parentSessionId: "main" },
  });
  registry.register(session.id, { SubagentStop: [{ type: "command" }] });
  await manager.executeSubagentStopHooks(session, { finalOutput: "done" });
  assert.equal(calls[0]?.event, "SubagentStop");
  assert.equal(calls[0]?.input.session_id, "main");
  assert.equal(calls[0]?.input.agent_type, "Explore");
  assert.equal(calls[0]?.input.last_assistant_message, "done");
  assert.equal(session.hookContexts?.subagentStopHookFeedback, "continue tests");
});

test("rejected tool result has WorkBuddy custom input shape", () => {
  const result = createToolCallResultItem(
    TOOL_REJECT_RESULT_CONTENT,
    { type: "function_call", name: "Bash", callId: "call-1" },
    { status: "incomplete", skipRun: true, error: "denied" },
  ) as any;
  assert.equal(result.type, "function_call_result");
  assert.equal(result.name, "Bash");
  assert.equal(result.callId, "call-1");
  assert.equal(result.providerData.skipRun, true);
  assert.equal(result.output.text, TOOL_REJECT_RESULT_CONTENT);
});

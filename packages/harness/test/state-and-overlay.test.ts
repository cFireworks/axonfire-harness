import assert from "node:assert/strict";
import test from "node:test";
import {
  PermissionMode,
  clampPermissionToParent,
} from "../src/permissions/permission.js";
import { SessionRunStateMachine } from "../src/sessions/run-state-machine.js";
import { HarnessSession } from "../src/sessions/session.js";
import { ToolDeferOverlay } from "../src/tools/tool-defer-overlay.js";

test("state machine covers model, tool, compact, and completion states", () => {
  const state = new SessionRunStateMachine();
  const session = new HarnessSession("test");
  assert.equal(state.transition(session, "run_preparing"), "preparing");
  assert.equal(state.transition(session, "run_accepted"), "pending");
  assert.equal(
    state.transition(session, "model_request_started"),
    "model_requesting",
  );
  assert.equal(state.transition(session, "tool_started"), "tool_executing");
  assert.equal(state.transition(session, "tool_ended"), "agent_running");
  assert.equal(state.transition(session, "compact_started"), "compacting");
  assert.equal(state.transition(session, "run_completed"), "compacting", "AGENT_ENDED is invalid while compacting");
  assert.equal(state.transition(session, "compact_ended"), "idle");
});

test("state machine change stream returns void and true skips current as in the target", () => {
  const state = new SessionRunStateMachine();
  const session = new HarnessSession("observable");
  const statuses: string[] = [];
  const subscription = state
    .getChange$(session, true)
    .subscribe(() => statuses.push(state.getSnapshot(session).status));
  state.transition(session, "run_preparing");
  state.forceIdle(session, "test");
  subscription.unsubscribe();
  assert.deepEqual(statuses, ["preparing", "idle"]);
});

test("child permissions cannot exceed parent authority", () => {
  assert.equal(
    clampPermissionToParent(
      PermissionMode.DontAsk,
      PermissionMode.BypassPermissions,
    ),
    PermissionMode.DontAsk,
  );
  assert.equal(
    clampPermissionToParent(PermissionMode.Delegate, PermissionMode.Ignore),
    PermissionMode.Default,
  );
});

test("forceNoDefer wins over forceDefer", () => {
  const overlay = ToolDeferOverlay.merge({
    forceDefer: { exact: ["Read"], glob: ["mcp__*"] },
    forceNoDefer: { exact: ["Read"], glob: [] },
  });
  assert.equal(ToolDeferOverlay.isDeferred("Read", false, overlay), false);
  assert.equal(
    ToolDeferOverlay.isDeferred("mcp__server__tool", false, overlay),
    true,
  );
});

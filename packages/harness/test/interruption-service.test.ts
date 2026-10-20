import assert from "node:assert/strict";
import test from "node:test";
import type {
  Agent,
  RunState,
  RunToolApprovalItem,
} from "@openai/agents-core";
import { InterruptionService } from "../src/permissions/interruption-service.js";
import { PermissionMode } from "../src/permissions/permission.js";
import { SessionRunStateMachine } from "../src/sessions/run-state-machine.js";
import { HarnessSession } from "../src/sessions/session.js";

type StateDouble = {
  approved: Array<{ item: RunToolApprovalItem; always: boolean }>;
  rejected: RunToolApprovalItem[];
  value: RunState<HarnessSession, Agent<HarnessSession>>;
};

function stateDouble(): StateDouble {
  const approved: StateDouble["approved"] = [];
  const rejected: RunToolApprovalItem[] = [];
  const value = {
    approve(item: RunToolApprovalItem, options?: { alwaysApprove?: boolean }) {
      approved.push({ item, always: options?.alwaysApprove === true });
    },
    reject(item: RunToolApprovalItem) {
      rejected.push(item);
    },
  } as unknown as RunState<HarnessSession, Agent<HarnessSession>>;
  return { approved, rejected, value };
}

function approval(
  name: string,
  id: string,
  argumentsValue = "{}",
): RunToolApprovalItem {
  return {
    toolName: name,
    rawItem: {
      type: "function_call",
      name,
      id,
      callId: id,
      arguments: argumentsValue,
      status: "in_progress",
      providerData: {},
    },
  } as unknown as RunToolApprovalItem;
}

async function nextTurn(): Promise<void> {
  await new Promise<void>((resolve) => setImmediate(resolve));
}

test("compatibility approval owns early denial while an asynchronous Notification Hook is still pending", async () => {
  let finishNotification!: () => void;
  const notification = new Promise<void>(resolve => { finishNotification = resolve; });
  const service = new InterruptionService(new SessionRunStateMachine(), {executeNotificationHooks: () => notification});
  const session = new HarnessSession("early-denial");
  const state = stateDouble(); session.state = state.value; session.status = "model_done";
  const item = approval("Read", "early-denial");
  const handling = service.handleInterruptions(session, [item]);
  await nextTurn(); assert.equal(service.reject(item), true);
  // A full event-loop turn would surface an unowned rejection before the
  // notification settles. Denial must still reach the normal state handler.
  await nextTurn(); finishNotification(); await handling;
  assert.deepEqual(state.rejected, [item]); assert.deepEqual(state.approved, []);
  assert.equal(service.pending$.value, undefined);
});

test("child agent approval is displayed and resolved on the main session", async () => {
  const machine = new SessionRunStateMachine();
  let continued = 0;
  const service = new InterruptionService(machine, {
    onContinue: () => {
      continued += 1;
    },
  });
  const main = new HarnessSession("main");
  const child = new HarnessSession("child", {
    meta: {
      parentSessionId: "main",
      agentName: "Explore",
      teamContext: { memberName: "researcher", color: "blue" },
    },
  });
  await service.waitFor(main);
  await service.waitFor(child);
  // A permission interruption follows a running/model-done SDK turn; native
  // state intentionally rejects WAITING_FOR_PERMISSION directly from IDLE.
  child.status = "model_done";
  const state = stateDouble();
  child.state = state.value;
  const item = approval("Read", "call-read");

  const handling = service.handleInterruptions(child, [item]);
  await nextTurn();
  assert.equal(main.interruptionSubject.value, item);
  assert.equal(service.pending$.value?.mainSessionId, "main");
  assert.equal(service.pending$.value?.sourceSessionId, "child");
  assert.equal((item.rawItem.providerData as any).isTeamMember, true);
  assert.equal((item.rawItem.providerData as any).memberName, "researcher");
  assert.equal(child.status, "waiting_for_permission");

  assert.equal(service.approve(item), true);
  await handling;
  assert.deepEqual(state.approved, [{ item, always: false }]);
  assert.equal(main.interruptionSubject.value, undefined);
  assert.equal(service.pending$.value, undefined);
  assert.equal(continued, 1);
});

test("same-tool interruptions are coalesced after the first decision", async () => {
  const service = new InterruptionService(new SessionRunStateMachine());
  const session = new HarnessSession("main");
  await service.waitFor(session);
  const state = stateDouble();
  session.state = state.value;
  const first = approval("Read", "read-1");
  const second = approval("Read", "read-2");

  const handling = service.handleInterruptions(session, [first, second]);
  await nextTurn();
  service.approve(first);
  await handling;
  assert.deepEqual(
    state.approved.map(({ item }) => item),
    [first, second],
  );
  assert.equal(service.findSessionByItem(second), undefined);
});

test("reject resumes through SDK rejection state and rejection callback", async () => {
  const reasons: unknown[] = [];
  let continued = 0;
  const service = new InterruptionService(new SessionRunStateMachine(), {
    onRejected: (_session, _item, reason) => {
      reasons.push(reason);
    },
    onContinue: () => {
      continued += 1;
    },
  });
  const session = new HarnessSession("main");
  await service.waitFor(session);
  const state = stateDouble();
  session.state = state.value;
  const item = approval("Bash", "bash-1", '{"command":"echo ok"}');
  const handling = service.handleInterruptions(session, [item]);
  await nextTurn();
  assert.equal(service.reject(item, { decision: "deny" }), true);
  await handling;
  assert.deepEqual(state.rejected, [item]);
  assert.equal((reasons[0] as Error).message, "deny");
  assert.equal(continued, 0);
});

test("bypass mode still queues dangerous Bash but approves safe calls", async () => {
  const service = new InterruptionService(new SessionRunStateMachine());
  const session = new HarnessSession("main");
  session.permissionModeSubject.next(PermissionMode.BypassPermissions);
  await service.waitFor(session);
  const state = stateDouble();
  session.state = state.value;
  const safe = approval("Bash", "safe", '{"command":"pwd"}');
  const dangerous = approval(
    "Bash",
    "dangerous",
    '{"command":"rm -rf build"}',
  );
  const handling = service.handleInterruptions(session, [safe, dangerous]);
  await nextTurn();
  assert.equal(session.interruptionSubject.value, dangerous);
  assert.deepEqual(state.approved.map(({ item }) => item), [safe]);
  service.reject(dangerous);
  await handling;
  assert.deepEqual(state.rejected, [dangerous]);
});

test("sandbox approval uses its out-of-band resolver", async () => {
  const decisions: Array<boolean | string> = [];
  const service = new InterruptionService(new SessionRunStateMachine());
  const session = new HarnessSession("main");
  await service.waitFor(session);
  const item = approval("Bash", "sandbox");
  Object.assign(item.rawItem.providerData as object, {
    _enqueuedViaQueue: true,
    _sandboxResolve: (decision: boolean | string) => decisions.push(decision),
  });
  service.enqueueSandboxApproval(session, item);
  assert.equal(session.interruptionSubject.value, item);
  assert.equal(service.approve(item, { alwaysApprove: true }), true);
  assert.deepEqual(decisions, ["allow_session"]);
  assert.equal(session.interruptionSubject.value, undefined);
});

test("channel permission relay races local UI and broadcasts resolution", async () => {
  let resolveChannel!: (value: "allow") => void;
  const broadcasts: string[] = [];
  const notifications: string[] = [];
  const service = new InterruptionService(new SessionRunStateMachine(), {
    channelPermissionAdapter: {
      createPermissionRequest: () =>
        new Promise((resolve) => {
          resolveChannel = resolve;
        }),
      cancelRequest: () => undefined,
    },
    permissionBroadcast: {
      broadcastPermissionResolved: (_session, _id, _name, decision) => {
        broadcasts.push(decision);
      },
    },
    executeNotificationHooks: (_session, message) => {
      notifications.push(message);
    },
  });
  const session = new HarnessSession("main");
  await service.waitFor(session);
  const state = stateDouble();
  session.state = state.value;
  const item = approval("Write", "write-1", '{"file_path":"a.ts"}');
  const handling = service.handleInterruptions(session, [item]);
  await nextTurn();
  resolveChannel("allow");
  await handling;
  assert.deepEqual(state.approved, [{ item, always: false }]);
  assert.deepEqual(broadcasts, ["allow"]);
  assert.deepEqual(notifications, ["needs your permission to use Write"]);
});

test("rejection injects tool-specific result items", async () => {
  const delivered: unknown[][] = [];
  const custom = {
    type: "function_call_result",
    callId: "plan-1",
    output: { type: "text", text: "keep planning" },
  } as any;
  const service = new InterruptionService(new SessionRunStateMachine(), {
    resolveRejectedResult: () => [custom],
    onRejectedResults: (_session, _item, results) => {
      delivered.push(results);
    },
  });
  const session = new HarnessSession("main");
  await service.waitFor(session);
  const state = stateDouble();
  session.state = state.value;
  const item = approval("ExitPlanMode", "plan-1");
  const handling = service.handleInterruptions(session, [item]);
  await nextTurn();
  service.reject(item);
  await handling;
  assert.deepEqual(delivered, [[custom]]);
});

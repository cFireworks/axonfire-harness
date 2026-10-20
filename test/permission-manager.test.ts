import assert from "node:assert/strict";
import test from "node:test";
import {
  PermissionManager,
  PermissionTimeoutError,
} from "../src/permissions/permission-manager.js";

const request = {
  toolCall: { toolCallId: "call-1" },
  options: [{ optionId: "allow" }, { optionId: "deny" }],
};

test("PermissionManager exposes and resolves pending ACP requests", async () => {
  const events: string[] = [];
  const manager = new PermissionManager({ timeout: 1_000 });
  manager.setCallbacks({
    onRequest: (id) => events.push(`request:${id}`),
    onResolved: (id, option) => events.push(`resolved:${id}:${option}`),
  });
  const response = manager.handleRequest(request);
  assert.equal(manager.pendingCount, 1);
  assert.equal(manager.getPendingById("call-1")?.params, request);
  assert.equal(manager.resolve("call-1", "allow"), true);
  assert.deepEqual(await response, {
    outcome: { outcome: "selected", optionId: "allow" },
  });
  assert.equal(manager.hasPending(), false);
  assert.deepEqual(events, ["request:call-1", "resolved:call-1:allow"]);
});

test("PermissionManager auto-approves the first option", async () => {
  const manager = new PermissionManager({ autoApprove: true });
  assert.deepEqual(await manager.handleRequest(request), {
    outcome: { outcome: "selected", optionId: "allow" },
  });
  assert.equal(manager.pendingCount, 0);
});

test("PermissionManager timeout rejects when auto rejection is disabled", async () => {
  const manager = new PermissionManager({
    timeout: 5,
    autoRejectOnTimeout: false,
  });
  await assert.rejects(
    manager.handleRequest(request),
    (error: unknown) =>
      error instanceof PermissionTimeoutError && error.timeout === 5,
  );
  assert.equal(manager.pendingCount, 0);
});

test("PermissionManager clear cancels every pending request", async () => {
  const manager = new PermissionManager({ timeout: 1_000 });
  const first = manager.handleRequest(request);
  const second = manager.handleRequest({
    ...request,
    toolCall: { toolCallId: "call-2" },
  });
  manager.clear();
  assert.deepEqual(await first, { outcome: { outcome: "cancelled" } });
  assert.deepEqual(await second, { outcome: { outcome: "cancelled" } });
  assert.equal(manager.pendingCount, 0);
});

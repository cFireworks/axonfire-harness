import { test } from "node:test";
import assert from "node:assert/strict";
import { configureNativeApprovalTimeout } from "../native-approval-policy.mjs";

test("print approval policy retains user settings and bidirectional clients", () => {
  for (const args of [["-p", "hello"], ["--print", "hello"]]) {
    const env = {};
    configureNativeApprovalTimeout(args, env);
    assert.equal(env.CBC_SANDBOX_APPROVAL_TIMEOUT_MS, "100");
  }
  for (const args of [[], ["--serve"], ["-p", "--serve"], ["-p", "--acp"],
    ["-p", "--input-format", "stream-json"], ["--print", "--input-format=stream-json"]]) {
    const env = {};
    configureNativeApprovalTimeout(args, env);
    assert.equal(env.CBC_SANDBOX_APPROVAL_TIMEOUT_MS, undefined);
  }
  const env = { CBC_SANDBOX_APPROVAL_TIMEOUT_MS: "12345" };
  configureNativeApprovalTimeout(["-p", "hello"], env);
  assert.equal(env.CBC_SANDBOX_APPROVAL_TIMEOUT_MS, "12345");
});

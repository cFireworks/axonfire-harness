import assert from "node:assert/strict";
import test from "node:test";
import {
  injectReasoningSummaryIfNeeded,
  isConnectionLevelRetryableError,
  mergeRequestProviderData,
  normalizeStreamingToolCallIds,
  parseCustomHeaders,
  parseSSEChunk,
  requestWithConnectionRetry,
  sanitizeURLForTrace,
} from "../src/models/model-transport-utils.js";

test("custom headers support escaped and literal newlines", () => {
  assert.deepEqual(parseCustomHeaders("A: 1\\nB: two:parts"), {
    A: "1",
    B: "two:parts",
  });
  assert.deepEqual(parseCustomHeaders("C: 3\nD: 4"), { C: "3", D: "4" });
});

test("providerData merges nested extra_vars", () => {
  assert.deepEqual(
    mergeRequestProviderData(
      { model: "x", extra_vars: { a: 1 } },
      { temperature: 1, extra_vars: { b: 2 } },
    ),
    { model: "x", temperature: 1, extra_vars: { a: 1, b: 2 } },
  );
});

test("SSE parser detects text, tools, finish reason, and chunk id", () => {
  const body = Buffer.from(
    'data: {"id":"chunk-1","choices":[{"delta":{"content":"hi"},"finish_reason":"stop"}]}\n',
  );
  assert.deepEqual(parseSSEChunk(body), {
    hasContent: true,
    finishReason: "stop",
    chunkId: "chunk-1",
  });
});

test("duplicate streaming tool call ids are removed after first occurrence", () => {
  const seen = new Set<string>();
  const first =
    'data: {"choices":[{"delta":{"tool_calls":[{"id":"call-1"}]}}]}';
  const second =
    'data: {"choices":[{"delta":{"tool_calls":[{"id":"call-1","index":0}]}}]}';
  assert.equal(normalizeStreamingToolCallIds(first, seen), first);
  assert.doesNotMatch(normalizeStreamingToolCallIds(second, seen), /"id"/);
});

test("connection retry occurs once only before response headers", async () => {
  let attempts = 0;
  const result = await requestWithConnectionRetry(async () => {
    attempts += 1;
    if (attempts === 1)
      throw Object.assign(new Error("socket hang up"), { code: "ECONNRESET" });
    return "ok";
  });
  assert.equal(result, "ok");
  assert.equal(attempts, 2);
  assert.equal(
    isConnectionLevelRetryableError({ response: {}, code: "ECONNRESET" }),
    false,
  );
});

test("reasoning summary and URL sanitation match bundle behavior", () => {
  const body = { reasoning: { effort: "high" } };
  assert.equal(injectReasoningSummaryIfNeeded(body, false), true);
  assert.equal((body as any).reasoning_summary, "auto");
  assert.equal(
    sanitizeURLForTrace("https://example.test/v1?token=abc&x=1&password=p"),
    "https://example.test/v1?token=***&x=1&password=***",
  );
});

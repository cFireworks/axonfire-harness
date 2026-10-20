import assert from "node:assert/strict";
import test from "node:test";
import {
  buildTruncationRetryMessage,
  filterTruncatedToolCalls,
  TRUNCATION_RETRY_EXHAUSTED,
  TRUNCATION_RETRY_MARKER,
} from "../src/runner/history-repair.js";

test("repairs malformed JSON with jsonrepair", () => {
  const result = filterTruncatedToolCalls({
    input: [
      {
        type: "function_call",
        callId: "1",
        name: "Read",
        arguments: "{path:'a'}",
      } as any,
    ],
  });
  assert.equal((result.input[0] as any).arguments, '{"path":"a"}');
});

test("length truncation removes invalid pair and adds tool-specific retry", () => {
  const result = filterTruncatedToolCalls(
    {
      input: [
        {
          type: "function_call",
          callId: "1",
          name: "Write",
          arguments: "",
        } as any,
        {
          type: "function_call_result",
          callId: "1",
          output: "partial",
          providerData: { isPartialAborted: true },
        } as any,
      ],
    },
    "length",
  );
  assert.equal(result.input.length, 1);
  assert.match(JSON.stringify(result.input[0]), /multiple Edit calls/);
  assert.match(
    JSON.stringify(result.input[0]),
    new RegExp(TRUNCATION_RETRY_MARKER),
  );
});

test("second failed retry stops the loop", () => {
  const result = filterTruncatedToolCalls(
    {
      input: [
        {
          type: "message",
          role: "user",
          content: [{ type: "input_text", text: TRUNCATION_RETRY_MARKER }],
        } as any,
        {
          type: "function_call",
          callId: "2",
          name: "Bash",
          arguments: "{",
        } as any,
      ],
    },
    "length",
  );
  assert.match(
    JSON.stringify(result.input.at(-1)),
    new RegExp(TRUNCATION_RETRY_EXHAUSTED),
  );
});

test("generic retry prompt is exact", () => {
  assert.equal(
    buildTruncationRetryMessage(["Unknown"]),
    [
      "Your previous response was truncated due to output length limits.",
      "",
      "The tool call was too large and got truncated. Break the operation into multiple smaller tool calls.",
      "",
      TRUNCATION_RETRY_MARKER,
    ].join("\n"),
  );
});

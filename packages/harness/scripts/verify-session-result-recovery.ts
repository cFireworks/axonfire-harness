import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { loadCapturedSessionResult } from "./helpers/captured-session-result.js";
import {
  resultFixture,
  streamResult,
  manualTimers,
  clone,
  user,
  assistant,
  raw,
  delta,
  item,
  done,
  turn,
} from "./helpers/session-result-fixtures.js";
import { AbortedStreamDraftStore } from "../src/sessions/aborted-stream-draft-store.js";
import { createAbortableIteratorFactory } from "../src/sessions/abortable-iterator.js";
import { createContentFilterInputUtils } from "../src/sessions/content-filter-input-utils.js";
import { SessionResultLifecycle } from "../src/sessions/session-result-lifecycle.js";
import { ModelBehaviorError } from "@openai/agents-core";
const source = await readFile(
    getCapturedBundlePath(),
    "utf8",
  ),
  native = loadCapturedSessionResult(source);
let comparisons = 0;
function norm(v: any): any {
  if (v === undefined) return "[undefined]";
  if (
    v instanceof Error ||
    Object.prototype.toString.call(v) === "[object Error]"
  )
    return { name: v.name, message: v.message };
  if (Array.isArray(v)) return Array.from(v, norm);
  if (v && typeof v === "object")
    return Object.fromEntries(
      Object.keys(v)
        .sort()
        .map((k) => [k, norm(v[k])]),
    );
  return v;
}
function eq(a: any, b: any, label: string) {
  assert.deepEqual(norm(a), norm(b), label);
  comparisons++;
}
const metadata = {
  messageId: "m",
  model: "actual",
  timestamp: 1234,
  requestModelId: "requested",
  requestModelName: "model name",
  traceId: "trace",
  conversationRequestId: "conversation",
};
const fragments = [
  { type: "output_text_delta", delta: "hello " },
  { type: "output_text_delta", delta: "world" },
  {
    type: "model",
    event: {
      choices: [
        {
          delta: {
            reasoning_content: "reason ",
            reasoning: "ignored",
            content: "not a text delta",
          },
        },
      ],
    },
  },
  {
    type: "model",
    event: {
      choices: [
        {
          delta: {
            reasoning: "more",
            tool_calls: [
              {
                index: 0,
                id: "call-a",
                function: { name: "Read", arguments: '{"file_path":' },
              },
            ],
          },
        },
      ],
    },
  },
  {
    type: "model",
    event: {
      choices: [
        {
          delta: {
            tool_calls: [{ index: 0, function: { arguments: '"owned"' } }],
          },
        },
      ],
    },
  },
  {
    type: "model",
    event: {
      type: "response.output_item.added",
      item: { type: "function_call", call_id: "call-b", name: "Write" },
    },
  },
  {
    type: "model",
    event: {
      type: "response.function_call_arguments.delta",
      call_id: "call-b",
      delta: '{"content":',
    },
  },
  {
    type: "model",
    event: {
      type: "response.function_call_arguments.delta",
      item_id: "call-b",
      delta: "ignored-index-fallback",
    },
  },
  {
    type: "model",
    event: {
      choices: [
        null,
        {
          delta: {
            tool_calls: [
              null,
              0,
              {},
              { index: 4, function: { arguments: "ignored" } },
            ],
          },
        },
      ],
    },
  },
  { type: "model", event: null },
  { type: "unknown", delta: "ignored" },
];
for (let length = 0; length <= fragments.length; length++)
  for (const committed of [
    undefined,
    "message",
    "reasoning",
    "call-a",
    "call-b",
  ]) {
    let a = 0,
      b = 0;
    const actual = new AbortedStreamDraftStore(() => `id-${++a}`),
      Original = native.draft(() => `id-${++b}`),
      expected = new Original();
    for (const event of fragments.slice(0, length)) {
      actual.ingestModelStreamEvent(clone(event));
      expected.ingestModelStreamEvent(clone(event));
    }
    if (committed) {
      const value = committed.startsWith("call-")
        ? { type: "function_call", callId: committed }
        : {
            type: committed === "message" ? "message" : "reasoning",
            role: "assistant",
          };
      actual.markCommitted(clone(value));
      expected.markCommitted(clone(value));
    }
    for (const meta of [metadata, { messageId: "", model: "", timestamp: 0 }]) {
      eq(
        actual.flushAbortedItems(meta),
        expected.flushAbortedItems(meta),
        `draft ${length}/${committed}`,
      );
      eq(
        actual.flushAbortedItems(meta),
        expected.flushAbortedItems(meta),
        "flush resets drafts",
      );
    }
    for (const value of [
      { id: "id-1", type: "message" },
      { callId: "call-a", type: "function_call_result" },
      { id: "x", type: "unknown" },
    ]) {
      eq(actual.getItemKeys(value), expected.getItemKeys(value), "commit keys");
      eq(
        actual.isCommitted(value),
        expected.isCommitted(value),
        "commit membership",
      );
    }
  }
for (const flags of [
  {},
  { skipRun: true },
  { agent: "compact" },
  { isAdditionalData: true },
  { isCompactInternal: true },
  { teammateMessage: { from: "peer" } },
  { isSummary: true },
]) {
  let a = 0,
    b = 0;
  const port = createContentFilterInputUtils(() => `id-${++a}`),
    original = native.input(() => `id-${++b}`),
    history = [user("a"), user("b", flags)];
  for (const candidate of [undefined, "a", "b", "missing"])
    eq(
      port.findLatestContentFilterCandidateUserMessageId(history, candidate),
      original.findLatestContentFilterCandidateUserMessageId(
        history,
        candidate,
      ),
      "content filter candidate",
    );
  const notice = port.createContentFilterNoticeMessage("m", "parent", "user"),
    expected = original.createContentFilterNoticeMessage("m", "parent", "user");
  eq(notice, expected, "literal filter notice and metadata");
  eq(
    port.isContentFilterNoticeItem(notice),
    original.isContentFilterNoticeItem(expected),
    "notice predicate",
  );
}
for (const env of [undefined, "", "0", "-1", "20", "2.5", "25ms", "bad"]) {
  const runtime: any = {
    env: env === undefined ? {} : { CODEBUDDY_ABORT_GRACE_MS: env },
    ...manualTimers(),
  };
  eq(
    createAbortableIteratorFactory(runtime).abortGraceMs,
    native.iterator(runtime).abortGraceMs,
    "abort grace env " + env,
  );
}
async function iteratorCase(factory: any, mode: string) {
  const timers = manualTimers(),
    controller = new AbortController(),
    log: any[] = [];
  let count = 0,
    returns = 0,
    rejectNext: any,
    resolveNext: any;
  const iterator = {
    next() {
      count++;
      return new Promise((resolve, reject) => {
        resolveNext = resolve;
        rejectNext = reject;
      });
    },
    return() {
      returns++;
      if (mode === "return-throws") throw Error("owned return");
      return new Promise(() => {});
    },
  };
  if (mode === "pre-abort") controller.abort();
  const stream = factory({
    env: { CODEBUDDY_ABORT_GRACE_MS: "17" },
    ...timers,
  }).createAbortableIterator(iterator, controller.signal, {
    info: (...v: any[]) => log.push(v),
  });
  const next = stream.next();
  await turn();
  if (mode !== "pre-abort") {
    if (mode === "throws") rejectNext(Error("owned failure"));
    else if (mode === "value")
      resolveNext({ value: "owned value", done: false });
    else {
      controller.abort();
      if (mode === "throws-after-abort") rejectNext(Error("owned abort"));
      else if (mode === "done-in-grace") resolveNext({ done: true });
      else await timers.fire();
    }
  }
  let outcome;
  try {
    outcome = await next;
  } catch (e) {
    outcome = e;
  }
  if (mode === "value") await stream.return();
  return { outcome, count, returns, log, timers: timers.calls };
}
for (const mode of [
  "pre-abort",
  "value",
  "throws",
  "throws-after-abort",
  "done-in-grace",
  "grace-expires",
  "return-throws",
])
  eq(
    await iteratorCase(createAbortableIteratorFactory, mode),
    await iteratorCase(native.iterator, mode),
    "abortable iterator " + mode,
  );

async function gateCase(Factory: any, config: any) {
  const f = resultFixture(Factory),
    calls: any[] = [];
  let emit: any;
  if (config.pending)
    f.lifecycle.handleStreamRunResult = async () =>
      await new Promise((r) => (emit = r));
  else
    f.lifecycle.handleStreamRunResult = async () => {
      if (config.handleError) throw Error("owned consumer failure");
    };
  f.lifecycle.handleNonStreamRunResult = async () => {};
  f.lifecycle.interceptors = (config.interceptors ?? []).map(
    (v: any, i: number) => ({
      intercept: async () => {
        calls.push(i);
        if (v === "throw") throw Error("owned interceptor");
        return v;
      },
    }),
  );
  f.s.meta.retryInProgress = config.retry;
  f.s.isCompressing = !!config.compact;
  await f.lifecycle.handleRunResult(f.s);
  const result: any = config.nonstream
    ? { state: {}, newItems: [] }
    : {
        currentTurn: 1,
        state: {},
        interruptions: config.interruptions ?? [],
        completed: config.completionError
          ? Promise.reject(config.completionError)
          : Promise.resolve(),
        error: config.error,
      };
  // Attach before yielding so rejected completion never becomes an unhandled promise.
  result.completed?.catch(() => {});
  if (config.stamped !== undefined) result._hasInterruptions = config.stamped;
  const task = f.callbacks[0]!(result),
    gate = f.s.interceptorGate!;
  if (config.pending) {
    await turn();
    const first = emit;
    const second = f.callbacks[0]!({ ...result });
    await turn();
    first();
    await task;
    const firstGate = await gate.completed;
    emit();
    await second;
    return { firstGate, secondGate: await f.s.interceptorGate!.completed };
  }
  await task;
  return {
    gate: await gate.completed,
    calls,
    telemetry: f.s.telemetry,
    events: f.events.filter((e) => e[0] !== "handling-error"),
    logs: f.logs,
  };
}
const gateCases = [
  {},
  { nonstream: true },
  { interruptions: [{}] },
  { interruptions: [{}], stamped: false },
  { stamped: true },
  { retry: true },
  { compact: true },
  { error: Object.assign(Error("network"), { code: "ECONNRESET" }) },
  { completionError: Error("Stream timeout: no data received for 1ms") },
  { completionError: new SyntaxError("owned JSON") },
  { completionError: new ModelBehaviorError("owned model error") },
  { completionError: { error: new SyntaxError("nested JSON") } },
  { completionError: Error("nonretryable failure") },
  { interceptors: [1, "throw", true, false] },
  { interceptors: [false, undefined, 1] },
  { handleError: true },
  { pending: true },
];
for (const config of gateCases)
  eq(
    await gateCase(SessionResultLifecycle, config),
    await gateCase(native.lifecycle, config),
    "response gate " + JSON.stringify(config),
  );

async function streamCase(Factory: any, mode: string) {
  const f = resultFixture(Factory),
    metadata: any = {},
    emissions: any[] = [];
  const answer = assistant("answer"),
    usage = {
      inputTokens: 2,
      outputTokens: 3,
      totalTokens: 5,
      inputTokensDetails: [{ cachedTokens: 1 }],
      outputTokensDetails: [{}],
    };
  let events: any[] = [];
  if (mode === "normal")
    events = [
      raw({
        model: "actual-model",
        choices: [
          {
            delta: {
              tool_calls: [
                {
                  index: 0,
                  id: "call",
                  function: { name: "Write", arguments: "{" },
                },
              ],
            },
          },
        ],
      }),
      delta("answer"),
      item(answer),
      raw({ usage }),
      done([answer], usage),
    ];
  if (mode === "aborted")
    events = [
      raw({
        choices: [
          {
            delta: {
              reasoning_content: "partial reason",
              tool_calls: [
                {
                  index: 0,
                  id: "call",
                  function: { name: "Read", arguments: '{"file_path":' },
                },
              ],
            },
          },
        ],
      }),
      delta("partial answer"),
      () => f.s.abortController.abort(),
    ];
  if (mode === "committed-abort")
    events = [delta("answer"), item(answer), () => f.s.abortController.abort()];
  if (mode === "empty" || mode === "structured-empty") {
    if (mode === "structured-empty") f.s.structuredOutput = {};
    events = [done([])];
  }
  if (mode === "content-filter")
    events = [
      item({ ...answer, parentId: "user-id" }),
      raw({
        choices: [
          { delta: { content: "blocked" }, finish_reason: "content_filter" },
        ],
      }),
    ];
  if (mode === "reasoning")
    events = [
      raw({ model: "reason-model" }),
      item(
        {
          id: "reason",
          type: "reasoning",
          content: [{ type: "input_text", text: "reason" }],
        },
        "reasoning_item",
      ),
      item(
        { type: "function_call", callId: "c", name: "Read", arguments: "{}" },
        "tool_approval_item",
      ),
    ];
  const result = streamResult(events, f.s, {
    emissions,
    rawResponses: [{ output: [answer] }],
  });
  await f.lifecycle.handleStreamRunResult(f.s, result, metadata);
  if (mode === "content-filter")
    await f.lifecycle.handleContentFilteredResponse(f.s, "message-id");
  return {
    metadata,
    events: f.events,
    history: f.s.history,
    meta: f.s.meta,
    emissions,
    silentAbort: result.silentAbort,
    aborted: f.s.abortSignal.aborted,
    logs: f.logs,
  };
}
for (const mode of [
  "normal",
  "aborted",
  "committed-abort",
  "empty",
  "structured-empty",
  "content-filter",
  "reasoning",
])
  eq(
    await streamCase(SessionResultLifecycle, mode),
    await streamCase(native.lifecycle, mode),
    "stream lifecycle " + mode,
  );
async function timingCase(Factory: any) {
  const f = resultFixture(Factory);
  f.lifecycle.resetIdleTimer(f.s);
  f.lifecycle.resetIdleTimer(f.s);
  f.setIdle(false);
  await f.timers.fire();
  f.setIdle(true);
  await f.timers.fire();
  await f.lifecycle.emitSessionStart(f.s, "startup");
  await f.lifecycle.emitSessionStart(f.s, "resume");
  await f.lifecycle.emitSessionStart(f.s, "clear");
  await f.lifecycle.emitSessionStart(f.s, "startup");
  await f.lifecycle.initRunResultHandler(f.s);
  await f.lifecycle.initRunResultHandler(f.s);
  const before = f.s.interceptorGate;
  await f.callbacks.at(-1)!({ __cancelNudge: true });
  return {
    events: f.events,
    timers: f.timers.calls,
    logs: f.logs,
    gateUnchanged: before === f.s.interceptorGate,
  };
}
eq(
  await timingCase(SessionResultLifecycle),
  await timingCase(native.lifecycle),
  "idle/start/subscription ownership",
);
console.log(
  JSON.stringify(
    {
      sampleSha256:
        "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd",
      comparisons,
      scope:
        "native draft store + abortable iterator + seven SessionManager methods + four content-filter helpers; injected observers/UUID/time and existing predicate dependencies",
    },
    null,
    2,
  ),
);

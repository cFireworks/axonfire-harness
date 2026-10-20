import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "node:http";
import {
  ModelBehaviorError,
  Usage,
  setTraceProcessors,
  type Model,
} from "@openai/agents-core";
import { AbortedStreamDraftStore } from "../src/sessions/aborted-stream-draft-store.js";
import { createAbortableIteratorFactory } from "../src/sessions/abortable-iterator.js";
import { createContentFilterInputUtils } from "../src/sessions/content-filter-input-utils.js";
import { SessionManager } from "../src/sessions/session-manager.js";
import { createHarness } from "../src/runtime/create-harness.js";
import {
  resultFixture,
  streamResult,
  manualTimers,
  user,
  assistant,
  raw,
  delta,
  item,
  done,
  turn,
} from "../scripts/helpers/session-result-fixtures.js";
setTraceProcessors([]);
const metadata = {
  messageId: "m",
  model: "actual",
  timestamp: 1234,
  requestModelId: "requested",
  traceId: "trace",
};

test("aborted drafts preserve reasoning/text/tool order, incomplete arguments and metadata without aliasing", () => {
  let uuid = 0;
  const drafts = new AbortedStreamDraftStore(() => `id-${++uuid}`);
  drafts.ingestModelStreamEvent({
    type: "output_text_delta",
    delta: "partial answer",
  });
  drafts.ingestRawModelEvent({
    choices: [
      {
        delta: {
          reasoning_content: "thinking",
          reasoning: "ignored",
          content: "not-a-text-delta",
          tool_calls: [
            {
              index: 0,
              id: "c",
              function: { name: "Read", arguments: '{"file_path":' },
            },
          ],
        },
      },
    ],
  });
  drafts.ingestChatToolCalls([
    { index: 0, function: { arguments: '"owned"' } },
  ]);
  const savedDraft = drafts.assistantMessageDraft;
  const values = drafts.flushAbortedItems(metadata);
  assert.deepEqual(
    values.map((v: any) => v.type),
    ["reasoning", "message", "function_call"],
  );
  assert.equal(values[0].rawContent[0].text, "thinking");
  assert.equal(values[1].content[0].text, "partial answer");
  assert.equal(values[2].arguments, '{"file_path":"owned"');
  assert.ok(
    values.every(
      (v: any) =>
        v.status === "incomplete" &&
        v.providerData.isPartialAborted &&
        v.timestamp === 1234,
    ),
  );
  values[1].content[0].text = "mutated";
  assert.equal(savedDraft.content[0].text, "partial answer");
  assert.deepEqual(drafts.flushAbortedItems(metadata), []);
});
test("committed tool keys survive resets and prevent duplicate partial records across identity changes", () => {
  const d = new AbortedStreamDraftStore(() => "owned-id");
  d.ingestChatToolCalls([
    { index: 0, id: "c", function: { name: "Read", arguments: "{" } },
  ]);
  d.markCommitted({ type: "function_call", callId: "c", id: "committed" });
  d.ingestChatToolCalls([
    { index: 0, function: { arguments: "ignored after commit" } },
  ]);
  d.ingestResponsesEvent({
    type: "response.output_item.added",
    item: { type: "function_call", call_id: "c", name: "Read" },
  });
  assert.deepEqual(d.flushAbortedItems(metadata), []);
  assert.equal(
    d.isCommitted({ type: "function_call_result", callId: "c" }),
    true,
  );
  assert.equal(d.toolCallIndexToId.size, 0);
});
test("Responses drafts require call_id for argument deltas and meaningful tool names", () => {
  const d = new AbortedStreamDraftStore();
  d.ingestResponsesEvent({
    type: "response.function_call_arguments.delta",
    item_id: "c",
    delta: "ignored",
  });
  d.ingestResponsesEvent({
    type: "response.function_call_arguments.delta",
    call_id: "c",
    delta: "{",
  });
  assert.deepEqual(d.flushAbortedItems(metadata), []);
  d.ingestResponsesEvent({
    type: "response.output_item.added",
    item: { type: "function_call", id: "fallback-id", name: "Read" },
  });
  const values = d.flushAbortedItems(metadata);
  assert.equal(values.length, 1);
  assert.equal(values[0].callId, "fallback-id");
  assert.equal(values[0].arguments, "");
});
test("abort iterator waits its native grace, unrefs its timer and does not await iterator.return", async () => {
  const timers = manualTimers(),
    controller = new AbortController();
  let returns = 0;
  const factory = createAbortableIteratorFactory({
    env: { CODEBUDDY_ABORT_GRACE_MS: "23suffix" },
    ...timers,
  });
  const iterator = factory.createAbortableIterator(
    {
      next: () => new Promise(() => {}),
      return() {
        returns++;
        return new Promise(() => {});
      },
    },
    controller.signal,
    { info() {} },
  );
  const next = iterator.next();
  await turn();
  controller.abort();
  await turn();
  assert.equal(timers.pending.size, 1);
  assert.equal(factory.abortGraceMs, 23);
  assert.ok(timers.calls.some((v) => v[0] === "unref"));
  await timers.fire();
  assert.deepEqual(await next, { value: undefined, done: true });
  assert.equal(returns, 1);
});
test("pre-abort never requests next and post-abort iterator errors are swallowed only after abort", async () => {
  const timers = manualTimers(),
    c = new AbortController();
  c.abort();
  let reads = 0;
  const f = createAbortableIteratorFactory({ env: {}, ...timers });
  assert.deepEqual(
    await f
      .createAbortableIterator(
        {
          next() {
            reads++;
          },
        },
        c.signal,
        { info() {} },
      )
      .next(),
    { value: undefined, done: true },
  );
  assert.equal(reads, 0);
  await assert.rejects(
    f
      .createAbortableIterator(
        {
          next: async () => {
            throw Error("not aborted");
          },
        },
        new AbortController().signal,
        { info() {} },
      )
      .next(),
    /not aborted/,
  );
});
test("response gate preserves retry precedence and explicit false interruption snapshots", async () => {
  const cases: any[] = [
    [{ interruptions: [{}] }, true],
    [{ interruptions: [{}], _hasInterruptions: false }, false],
    [{ interruptions: [], _hasInterruptions: true }, true],
    [{ error: { code: "ECONNRESET" } }, true],
    [{ completionError: new ModelBehaviorError("owned") }, true],
    [{ completionError: new SyntaxError("owned") }, true],
    [{ completionError: Error("Stream timeout: no data received") }, true],
    [{ completionError: Error("terminal failure") }, false],
    [{ retry: true }, true],
    [{ compressing: true }, true],
  ];
  for (const [config, expected] of cases) {
    const f = resultFixture();
    let interceptions = 0;
    f.lifecycle.interceptors = [
      {
        intercept() {
          interceptions++;
          return false;
        },
      },
    ];
    f.lifecycle.handleStreamRunResult = async () => {};
    f.s.meta.retryInProgress = config.retry;
    f.s.isCompressing = !!config.compressing;
    await f.lifecycle.handleRunResult(f.s);
    const completed = config.completionError
      ? Promise.reject(config.completionError)
      : Promise.resolve();
    completed.catch(() => {});
    await f.callbacks[0]!({ currentTurn: 1, state: {}, completed, ...config });
    assert.equal(await f.s.interceptorGate!.completed, expected);
    assert.equal(interceptions, expected ? 0 : 1);
  }
});
test("response interceptors require literal true, tolerate failures and resolve the captured gate", async () => {
  const f = resultFixture(),
    calls: number[] = [];
  let release: any;
  f.lifecycle.handleStreamRunResult = async () =>
    await new Promise((r) => (release = r));
  f.lifecycle.interceptors = [1, "throw", true, false].map((v, i) => ({
    intercept() {
      calls.push(i);
      if (v === "throw") throw Error("owned");
      return v;
    },
  }));
  await f.lifecycle.handleRunResult(f.s);
  const result = { currentTurn: 1, state: {}, completed: Promise.resolve() };
  const first = f.callbacks[0]!(result),
    firstGate = f.s.interceptorGate!,
    releaseFirst = release;
  const second = f.callbacks[0]!({ ...result }),
    secondGate = f.s.interceptorGate!;
  releaseFirst();
  await first;
  assert.equal(await firstGate.completed, true);
  assert.notEqual(firstGate, secondGate);
  release();
  await second;
  assert.equal(await secondGate.completed, true);
  assert.deepEqual(calls, [0, 1, 2, 0, 1, 2]);
});
test("cancel nudge leaves state/gate untouched and nonstream consumes newItems rather than output", async () => {
  const f = resultFixture();
  await f.lifecycle.handleRunResult(f.s);
  const before = f.s.interceptorGate;
  await f.callbacks[0]!({ __cancelNudge: true, state: "must not assign" });
  assert.equal(f.s.interceptorGate, before);
  assert.notEqual(f.s.state as any, "must not assign");
  await f.callbacks[0]!({
    state: {},
    newItems: [{ rawItem: assistant("native-item") }],
    output: [assistant("not-new-item")],
  });
  assert.equal((f.s.history.at(-1) as any).id, "native-item");
  assert.equal(await f.s.interceptorGate!.completed, false);
});
test("stream lifecycle timestamps, stamps metadata, forwards events and backfills last-item usage", async () => {
  const f = resultFixture(),
    response = assistant("a"),
    usage = { inputTokens: 2, outputTokens: 3, totalTokens: 5 },
    meta: any = {};
  const result = streamResult(
    [
      raw({
        model: "actual",
        choices: [
          { delta: { tool_calls: [{ function: { name: "NotebookEdit" } }] } },
        ],
      }),
      item(response),
      raw({ usage }),
      done([response], usage),
    ],
    f.s,
    { rawResponses: [{ output: [response] }] },
  );
  await f.lifecycle.handleStreamRunResult(f.s, result, meta);
  const value: any = f.s.history.at(-1);
  assert.equal(value.timestamp, 1234);
  assert.equal(value.providerData.messageId, "message-id");
  assert.equal(value.providerData.model, "actual");
  assert.equal(value.providerData.traceId, "trace");
  assert.equal(value.providerData.requestModelId, "telemetry-model");
  assert.equal(value.providerData._isLastResponseItem, true);
  assert.deepEqual(value.providerData.rawUsage, usage);
  assert.ok(
    f.events.some(
      (e) => e[0] === "transition" && e[1].streamingToolName === "notebook",
    ),
  );
  assert.equal(f.events.filter((e) => e[0] === "model").length, 3);
});
test("abort flush persists only uncommitted native drafts and emits agent_end once", async () => {
  const f = resultFixture(),
    emissions: any[] = [],
    meta: any = {};
  await f.lifecycle.handleStreamRunResult(
    f.s,
    streamResult(
      [
        delta("partial"),
        raw({ choices: [{ delta: { reasoning: "reason" } }] }),
        () => f.s.abortController.abort(),
      ],
      f.s,
      { emissions },
    ),
    meta,
  );
  assert.equal(meta.finishReason, "aborted");
  assert.equal(emissions.length, 1);
  assert.deepEqual(
    f.s.history.slice(1).map((v) => v.type),
    ["reasoning", "message"],
  );
  assert.ok(
    f.s.history
      .slice(1)
      .every(
        (v: any) =>
          v.status === "incomplete" && v.providerData.isPartialAborted,
      ),
  );
});
test("empty model output silently aborts unless structured output is configured", async () => {
  for (const structured of [false, true]) {
    const f = resultFixture();
    if (structured) f.s.structuredOutput = {};
    const result = streamResult([done([])], f.s);
    await f.lifecycle.handleStreamRunResult(f.s, result, {});
    assert.equal(f.s.abortSignal.aborted, !structured);
    assert.equal(result.silentAbort, !structured ? true : undefined);
  }
});
test("content filter notice preserves literal prompt, fork parent, candidate selection and deduplication", async () => {
  const f = resultFixture(),
    helpers = createContentFilterInputUtils(() => "owned-notice"),
    meta: any = {};
  f.runtime.inputItemUtils = helpers;
  f.s.history.push(user("extra", { isAdditionalData: true }));
  await f.lifecycle.handleStreamRunResult(
    f.s,
    streamResult(
      [
        item({ ...assistant("a"), parentId: "user-id" }),
        raw({
          choices: [
            { delta: { content: "filtered" }, finish_reason: "content-filter" },
          ],
        }),
      ],
      f.s,
    ),
    meta,
  );
  await f.lifecycle.handleContentFilteredResponse(f.s, "message-id");
  const notices = f.s.history.filter(
    (v: any) => v.providerData?.contentFilterNotice,
  ) as any[];
  assert.equal(notices.length, 1);
  assert.equal(notices[0].parentId, "user-id");
  assert.equal(notices[0].providerData.strippedUserMessageId, "user-id");
  assert.equal(notices[0].providerData.skipRun, true);
  assert.equal(notices[0].content[0].text, helpers.CONTENT_FILTER_NOTICE_TEXT);
  assert.equal(f.events.filter((e) => e[0] === "reload").length, 1);
});
test("idle notification re-arms while busy, uses 60000ms and release clears the owned timer", async () => {
  const f = resultFixture();
  f.lifecycle.resetIdleTimer(f.s);
  f.lifecycle.resetIdleTimer(f.s);
  assert.equal(f.timers.pending.size, 1);
  assert.ok(
    f.timers.calls.filter((v) => v[0] === "set").every((v) => v[2] === 60000),
  );
  f.setIdle(false);
  await f.timers.fire();
  assert.equal(f.timers.pending.size, 1);
  f.setIdle(true);
  await f.timers.fire();
  assert.deepEqual(f.events.at(-1), [
    "notification",
    "CodeBuddy is waiting for your input",
    "idle_prompt",
  ]);
  f.lifecycle.resetIdleTimer(f.s);
  f.lifecycle.release(f.s.id);
  assert.equal(f.timers.pending.size, 0);
});
test("startup/resume reuse the first session promise even after completion; explicit clear creates another", async () => {
  const f = resultFixture();
  await f.lifecycle.emitSessionStart(f.s, "startup");
  await f.lifecycle.emitSessionStart(f.s, "resume");
  assert.equal(f.events.filter((e) => e[0] === "session-start").length, 1);
  await f.lifecycle.emitSessionStart(f.s, "clear");
  await f.lifecycle.emitSessionStart(f.s, "startup");
  assert.deepEqual(
    f.events.filter((e) => e[0] === "session-start"),
    [
      ["session-start", "startup"],
      ["session-start", "clear"],
    ],
  );
});
test("idle/start hook failures are logged and startup failure remains joined rather than retried", async () => {
  let starts = 0;
  const f = resultFixture(undefined, {
    sessionHookManager: {
      async executeNotificationHooks() {
        throw Error("owned notification failure");
      },
      async executeSessionStartHooks() {
        starts++;
        throw Error("owned start failure");
      },
    },
  });
  f.lifecycle.resetIdleTimer(f.s);
  await f.timers.fire();
  await f.lifecycle.emitSessionStart(f.s, "startup");
  await f.lifecycle.emitSessionStart(f.s, "resume");
  assert.equal(starts, 1);
  assert.ok(
    f.logs.some(
      (v) =>
        v[0] === "warn" &&
        String(v).includes("Notification (idle) hook failed"),
    ),
  );
  assert.ok(
    f.logs.some(
      (v) => v[0] === "error" && String(v).includes("owned start failure"),
    ),
  );
});
test("gate resolves before asynchronous end telemetry and retry skips reporting without guessing business codes", async () => {
  const f = resultFixture();
  let release!: () => void, observed!: () => void;
  const ready = new Promise<void>((resolve) => (observed = resolve));
  f.lifecycle.handleStreamRunResult = async () => {};
  f.lifecycle.telemetryService.reportChatRequestResponseTelemetry =
    async () => {
      observed();
      await new Promise<void>((r) => (release = r));
    };
  await f.lifecycle.handleRunResult(f.s);
  const task = f.callbacks[0]!({
    currentTurn: 1,
    state: {},
    completed: Promise.resolve(),
  });
  await ready;
  assert.equal(await f.s.interceptorGate!.completed, false);
  release();
  await task;
  let reports = 0;
  f.lifecycle.telemetryService.reportChatRequestResponseTelemetry =
    async () => {
      reports++;
    };
  await f.callbacks[0]!({
    currentTurn: 1,
    state: {},
    completed: Promise.resolve(),
    error: { code: "ECONNRESET" },
  });
  assert.equal(await f.s.interceptorGate!.completed, true);
  assert.equal(reports, 0);
  assert.equal(f.s.telemetry, undefined);
});
test("SessionManager captures per-result gates, avoids replay on ensure and releases owned subscriptions", async () => {
  const timers = manualTimers(),
    manager = new SessionManager(undefined, undefined, {
      resultLifecycle: { timers },
    }),
    s = await manager.create();
  const response: any = { state: {}, newItems: [{ rawItem: assistant("a") }] };
  manager.ensureRunResultHandler(s);
  s.resultSubject.next(response);
  await manager.waitForResultHandled(response);
  assert.equal(await manager.getResultGate(response)!.completed, false);
  assert.equal(s.history.length, 1);
  manager.ensureRunResultHandler(s);
  await turn();
  assert.equal(s.history.length, 1);
  manager.release(s);
  assert.equal(timers.pending.size, 0);
});
test(
  "real SDK abort saves partial text/reasoning/tool JSON once to JSONL and the next turn remains usable",
  { timeout: 10000 },
  async (t) => {
    const directory = await mkdtemp(join(tmpdir(), "harness-result-abort-"));
    t.after(() => rm(directory, { recursive: true, force: true }));
    let requests = 0,
      ready!: () => void;
    const observed = new Promise<void>((resolve) => (ready = resolve));
    const model: Model = {
      async getResponse() {
        return { output: [], usage: new Usage() };
      },
      async *getStreamedResponse(request) {
        yield { type: "response_started" };
        if (++requests === 1) {
          yield {
            type: "model",
            event: {
              choices: [
                {
                  delta: {
                    reasoning_content: "owned partial reasoning",
                    tool_calls: [
                      {
                        index: 0,
                        id: "owned-call",
                        function: { name: "Read", arguments: '{"file_path":' },
                      },
                    ],
                  },
                },
              ],
            },
          } as any;
          yield { type: "output_text_delta", delta: "owned partial text" };
          await new Promise<void>((_resolve, reject) => {
            if (request.signal?.aborted) reject(request.signal.reason);
            else
              request.signal?.addEventListener(
                "abort",
                () => reject(request.signal!.reason),
                { once: true },
              );
          });
        } else
          yield {
            type: "response_done",
            response: {
              id: "next",
              output: [assistant("next", "next turn")],
              usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
            },
          } as any;
      },
    };
    const h = await createHarness({
      workDir: directory,
      modelProvider: { getModel: () => model },
      sessionLifecycle: { env: { CODEBUDDY_ABORT_GRACE_MS: "20" } },
    });
    t.after(() => h.close());
    const s = await h.openSession(),
      controller = new AbortController();
    const sub = s.modelSubject.subscribe((v: any) => {
      if (v.type === "output_text_delta") ready();
    });
    t.after(() => sub.unsubscribe());
    const running = h.prompt(s, "owned abort fixture", {
      signal: controller.signal,
    });
    await observed;
    controller.abort();
    await assert.rejects(running);
    const partials = (s.history as any[]).filter(
      (v) => v.providerData?.isPartialAborted,
    );
    assert.deepEqual(
      partials.map((v) => v.type),
      ["reasoning", "message", "function_call"],
    );
    assert.equal(partials[2].arguments, '{"file_path":');
    const saved = (await readFile(h.store.getSessionFilePath(s.id), "utf8"))
      .trim()
      .split("\n")
      .map((v) => JSON.parse(v));
    assert.equal(
      saved.filter((v) => v.providerData?.isPartialAborted).length,
      3,
    );
    assert.equal(await h.prompt(s, "continue"), "next turn");
    assert.equal(
      (s.history as any[]).filter((v) => v.providerData?.isPartialAborted)
        .length,
      3,
    );
  },
);
test(
  "loopback HTTP SSE abort retains transport messageId and partial transcript without a remote service",
  { timeout: 10000 },
  async (t) => {
    const directory = await mkdtemp(join(tmpdir(), "harness-result-http-"));
    t.after(() => rm(directory, { recursive: true, force: true }));
    const server = createServer(async (req, res) => {
      for await (const _ of req) {
      }
      res.writeHead(200, { "content-type": "text/event-stream" });
      res.write(
        `data: ${JSON.stringify({ id: "owned", object: "chat.completion.chunk", created: 1, model: "actual-http", choices: [{ index: 0, delta: { role: "assistant", content: "owned HTTP partial" }, finish_reason: null }] })}\n\n`,
      );
    });
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve),
    );
    t.after(
      () =>
        new Promise<void>((resolve) => {
          server.closeAllConnections();
          server.close(() => resolve());
        }),
    );
    const address = server.address() as { port: number },
      h = await createHarness({
        workDir: directory,
        apiKey: "owned-fixture-key",
        baseURL: `http://127.0.0.1:${address.port}/v1`,
        model: "offline-http",
        sessionLifecycle: { env: { CODEBUDDY_ABORT_GRACE_MS: "20" } },
      });
    t.after(() => h.close());
    const s = await h.openSession(),
      controller = new AbortController();
    let ready!: () => void;
    const observed = new Promise<void>((resolve) => (ready = resolve));
    s.modelSubject.subscribe((v: any) => {
      if (v.type === "output_text_delta") ready();
    });
    const running = h.prompt(s, "owned HTTP abort", {
      signal: controller.signal,
    });
    await observed;
    controller.abort();
    await assert.rejects(running);
    const partial = (s.history as any[]).find(
      (v) => v.providerData?.isPartialAborted && v.type === "message",
    );
    assert.ok(partial);
    assert.match(partial.providerData.messageId, /^[a-f0-9]{32}$/);
    assert.equal(partial.providerData.model, "actual-http");
    assert.equal(partial.content[0].text, "owned HTTP partial");
    assert.equal(typeof partial.timestamp, "number");
    assert.match(
      await readFile(h.store.getSessionFilePath(s.id), "utf8"),
      /owned HTTP partial/,
    );
  },
);
test(
  "standalone response gate waits for a delayed follow-up result and returns that SDK answer",
  { timeout: 10000 },
  async (t) => {
    const directory = await mkdtemp(join(tmpdir(), "harness-result-gate-"));
    t.after(() => rm(directory, { recursive: true, force: true }));
    let requests = 0,
      intercepted = 0,
      h!: Awaited<ReturnType<typeof createHarness>>,
      followup: Promise<any> | undefined;
    const model: Model = {
      async getResponse() {
        return { output: [], usage: new Usage() };
      },
      async *getStreamedResponse() {
        const n = ++requests;
        yield { type: "response_started" };
        yield {
          type: "response_done",
          response: {
            id: `result-${n}`,
            output: [
              assistant(
                `a-${n}`,
                n === 1 ? "first answer" : "follow-up answer",
              ),
            ],
            usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
          },
        } as any;
      },
    };
    h = await createHarness({
      workDir: directory,
      modelProvider: { getModel: () => model },
      sessionLifecycle: {
        interceptors: [
          {
            intercept({ session }) {
              if (++intercepted !== 1) return false;
              // Explicit host adapter stands in for a production response interceptor; the class is not fabricated.
              followup = new Promise<void>((resolve, reject) =>
                setTimeout(() => {
                  void h.service
                    .runDefault("owned follow-up", { context: session })
                    .then(() => resolve(), reject);
                }, 10),
              );
              followup.catch(() => {});
              return true;
            },
          },
        ],
      },
    });
    t.after(() => h.close());
    const s = await h.openSession();
    assert.equal(await h.prompt(s, "first question"), "follow-up answer");
    await followup;
    assert.equal(requests, 2);
    assert.equal(intercepted, 2);
    assert.equal(s.status, "idle");
    assert.equal(
      (s.history as any[]).filter((v) => v.role === "assistant").length,
      2,
    );
  },
);

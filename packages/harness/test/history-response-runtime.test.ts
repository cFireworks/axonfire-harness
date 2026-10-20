import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, readFile, writeFile, rm, access } from "node:fs/promises";
import * as fs from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { Usage, setTraceProcessors, type Model } from "@openai/agents-core";
import {
  InputHistoryServiceImpl,
  INPUT_HISTORY_STORAGE_FILE,
} from "../src/sessions/input-history-service.js";
import { createOwnedInputHistory } from "../src/sessions/input-history-runtime.js";
import { createResponseErrorUtils } from "../src/models/response-error-utils.js";
import {
  createHistoryTruncateUtils,
  PTL_RETRY_MARKER,
  TokenUtils,
  PtlErrorUtils,
} from "../src/context/response-history-utils.js";
import {
  createNativeResponseInterceptors,
  NATIVE_RESPONSE_INTERCEPTOR_ORDER,
} from "../src/responses/native-response-interceptors.js";
import { ContextTruncationInterceptor } from "../src/responses/context-truncation-interceptor.js";
import { finishReasonErrorInterceptor } from "../src/responses/finish-reason-error-interceptor.js";
import { TextualToolCallInterceptor } from "../src/responses/textual-tool-call-interceptor.js";
import { TruncatedToolCallInterceptor } from "../src/responses/truncated-tool-call-interceptor.js";
import { MediaContentErrorInterceptor } from "../src/responses/media-content-error-interceptor.js";
import { FallbackModelErrorInterceptor } from "../src/responses/fallback-model-error-interceptor.js";
import { ModelPermissionErrorInterceptor } from "../src/responses/model-permission-error-interceptor.js";
import {
  responseFixture,
  ownedUser,
  ownedAnswer,
} from "../scripts/helpers/response-fixtures.js";
import {
  manualTimers,
  turn,
} from "../scripts/helpers/session-result-fixtures.js";
import { createHarness } from "../src/runtime/create-harness.js";
import { estimateTrailingToolResultTokens } from "../src/sessions/history-utils.js";
setTraceProcessors([]);
async function ownedDirectory(t: any, prefix = "harness-history-response-") {
  const directory = await mkdtemp(join(tmpdir(), prefix));
  t.after(() => rm(directory, { recursive: true, force: true }));
  return directory;
}
async function inputFixture(t: any, extra: any = {}) {
  const root = await ownedDirectory(t),
    timers = manualTimers();
  let project = "/owned/a",
    now = 1_000_000;
  const owner = createOwnedInputHistory(root, () => project, {
    now: () => ++now,
    ...timers,
    ...extra,
  });
  t.after(() => owner.close());
  return {
    root,
    service: owner.service,
    owner,
    timers,
    setProject(v: string) {
      project = v;
    },
  };
}
test("input history serializes concurrent appends, scopes projects and deduplicates display only in memory", async (t) => {
  const f = await inputFixture(t),
    s = f.service;
  await Promise.all([
    s.addHistory({ display: "a", pastedContents: { x: "one" } }),
    s.addHistory({ display: "a", pastedContents: { x: "ignored" } }),
    s.addHistory({ display: "b", pastedContents: {} }),
  ]);
  f.setProject("/owned/b");
  await s.addHistory({ display: "b", pastedContents: {} });
  const records = (
    await readFile(join(f.root, INPUT_HISTORY_STORAGE_FILE), "utf8")
  )
    .trim()
    .split("\n")
    .map((v) => JSON.parse(v));
  assert.deepEqual(
    records.map((v) => [v.display, v.project]),
    [
      ["a", "/owned/a"],
      ["b", "/owned/a"],
      ["b", "/owned/b"],
    ],
  );
  assert.equal(records[0].pastedContents.x, "one");
  assert.ok(records[0].timestamp < records[1].timestamp);
  assert.equal(f.timers.pending.size, 1);
  const other = new InputHistoryServiceImpl(s.runtime);
  await other.addHistory({ display: "b", pastedContents: {} });
  assert.equal(
    (await readFile(s.getHistoryFilePath(), "utf8")).trim().split("\n").length,
    4,
    "native dedup is not persisted across instances",
  );
});
test("project input history returns the latest N in chronological order, skips invalid JSON and falls back to legacy without migration", async (t) => {
  const f = await inputFixture(t, {
      localStorage: { get: async () => ["legacy old", "legacy latest"] },
    }),
    s = f.service;
  await writeFile(
    s.getHistoryFilePath(),
    [
      "invalid JSON",
      ...Array.from({ length: 4 }, (_, i) =>
        JSON.stringify({
          display: `entry-${i}`,
          pastedContents: {},
          project: "/owned/a",
          timestamp: i,
        }),
      ),
    ].join("\n"),
  );
  assert.deepEqual(
    (await s.getHistoryForProject(2)).map((v: any) => v.display),
    ["entry-2", "entry-3"],
  );
  assert.deepEqual(await s.getHistoryForProject(0), []);
  f.setProject("/owned/no-records");
  const legacy = await s.getHistoryForProject();
  assert.deepEqual(
    legacy.map((v: any) => v.display),
    ["legacy old", "legacy latest"],
  );
  assert.equal(legacy[1].timestamp - legacy[0].timestamp, 1000);
  assert.equal(
    (await readFile(s.getHistoryFilePath(), "utf8")).includes("legacy old"),
    false,
  );
});
test("input history uses 10000/120-byte cleanup threshold, last-record retention and separate age cleanup", async (t) => {
  const f = await inputFixture(t),
    s = f.service;
  assert.equal(s.maxHistorySize, 10000);
  assert.equal(s.cleanupDelay, 5000);
  s.maxHistorySize = 3;
  const entries = Array.from({ length: 6 }, (_, i) =>
    JSON.stringify({
      display: `entry-${i}`,
      timestamp: i,
      project: "/owned/a",
    }),
  );
  await writeFile(s.getHistoryFilePath(), entries.join("\n"));
  await s.cleanupExcessHistory();
  assert.equal(
    (await readFile(s.getHistoryFilePath(), "utf8")).split("\n").length,
    6,
    "small file avoids line-count scan",
  );
  await writeFile(
    s.getHistoryFilePath(),
    entries.map((v) => v + " ".repeat(100)).join("\n"),
  );
  await s.cleanupExcessHistory();
  assert.deepEqual(
    (await s.readHistoryFile()).map((v: any) => v.display),
    ["entry-3", "entry-4", "entry-5"],
  );
  await s.cleanupHistory(0);
  assert.equal(
    await readFile(s.getHistoryFilePath(), "utf8"),
    "\n",
    "native empty rewrite retains one newline",
  );
});
test("failed input append releases the write lock and does not poison later writes", async (t) => {
  let first = true;
  const f = await inputFixture(t, {
    fs: {
      ...fs,
      async appendFile(...args: any[]) {
        if (first) {
          first = false;
          throw Error("owned append denied");
        }
        return (fs.appendFile as any)(...args);
      },
    },
  });
  await assert.rejects(
    f.service.addHistory({ display: "a" }),
    /owned append denied/,
  );
  await f.service.addHistory({ display: "a" });
  assert.equal((await f.service.readHistoryFile()).length, 1);
});
test("input-history owner cancels pending cleanup and drains a cleanup already inside asynchronous read", async (t) => {
  const root = await ownedDirectory(t),
    timers = manualTimers();
  let release!: () => void, started!: () => void;
  const entered = new Promise<void>((r) => (started = r)),
    blocked = new Promise<void>((r) => (release = r));
  const owner = createOwnedInputHistory(root, () => "/owned", {
    ...timers,
    fs: {
      ...fs,
      stat: async () => ({ size: 2_000_000 }) as any,
      readFile: async () => {
        started();
        await blocked;
        return "";
      },
    } as any,
  });
  owner.service.scheduleCleanup();
  await timers.fire();
  await entered;
  let closed = false;
  const closing = owner.close().then(() => (closed = true));
  await turn();
  assert.equal(closed, false);
  release();
  await closing;
  assert.equal(closed, true);
  assert.equal(timers.pending.size, 0);
  owner.service.scheduleCleanup();
  assert.equal(timers.pending.size, 0);
});
test("business error mapping preserves nested/rate-limit priorities and differs from retry predicates", () => {
  const e = createResponseErrorUtils(() => ({
    endpoint: "https://owned.invalid/v1",
  }));
  assert.equal(
    e.extractBizCode({ code: 14001, error: { code: "6004" } }),
    6004,
  );
  assert.equal(
    e.extractBizCode({ response: { data: { code: "0014001" } } }),
    14001,
  );
  assert.equal(
    e.mapMessageErrorCode({
      statusCode: 429,
      responseBody: {
        code: 14001,
        error: { code: 6004, data: { code: 6002 } },
      },
    }),
    "6002",
  );
  assert.equal(
    e.mapMessageErrorCode({
      statusCode: 500,
      responseBody: { code: 42, error: { code: 6004 } },
    }),
    "42",
  );
  assert.equal(e.mapMessageErrorCode({ code: "ECONNREFUSED" }), "3002");
  assert.equal(e.mapMessageErrorCode(undefined), "");
  assert.equal(e.isQuotaExhaustedError({ code: 14001 }), true);
  assert.equal(e.isModelOverloadedError({ status: "429" }), true);
  assert.equal(
    e.isInputLengthError({
      error: { details: "Maximum context length is 1000 tokens" },
    }),
    true,
  );
});
test("PTL parsing handles cyclic error wrappers and truncation preserves one API round or tool pair", () => {
  const error: any = { message: "prompt is too long: 3000 tokens > 2000" };
  error.error = error;
  assert.deepEqual(PtlErrorUtils.parsePromptTooLongTokenCounts(error), {
    actualTokens: 3000,
    limitTokens: 2000,
    gap: 1000,
  });
  const h = createHistoryTruncateUtils(),
    history = [
      ownedUser("u1"),
      ownedAnswer("a1"),
      ownedUser("u2"),
      ownedAnswer("a2"),
    ];
  assert.deepEqual(
    h.truncateHeadByTokenGap(history, 999999).map((v: any) => v.id),
    ["u2", "a2"],
  );
  assert.equal(h.truncateHeadByTokenGap([ownedUser("one")]), null);
  const pair = (n: number) => [
    { type: "function_call", callId: `c${n}`, name: "Read", arguments: "{}" },
    { type: "function_call_result", callId: `c${n}`, output: "owned" },
  ];
  const trimmed = h.truncateHeadByTokenGap([...pair(1), ...pair(2)]);
  assert.equal(trimmed[0].providerData.isPtlRetryMarker, true);
  assert.equal(trimmed[1].callId, "c2");
  assert.equal(trimmed[2].callId, "c2");
  assert.equal(TokenUtils.estimateTokensRough("中文abcd"), 3);
});
test("runner/compactor trailing-tool estimates use original image placeholders and Chinese token weights", () => {
  const records: any[] = [
    ownedUser("u"),
    { type: "function_call", callId: "c" },
    {
      type: "function_call_result",
      callId: "c",
      output: JSON.stringify([
        { type: "text", text: "中文说明" },
        {
          type: "image_url",
          image_url: { url: "data:image/png;base64," + "A".repeat(3000) },
        },
      ]),
    },
    { type: "function_call", callId: "next" },
  ];
  assert.equal(
    estimateTrailingToolResultTokens(records),
    TokenUtils.estimateTrailingToolResultTokens(records),
  );
  const stripped = TokenUtils.createItemWithoutImages(records[2]);
  assert.match(stripped.output, /_imageOmitted/);
  assert.ok(estimateTrailingToolResultTokens(records) < 100);
  assert.equal(
    estimateTrailingToolResultTokens([...records, ownedAnswer("after")]),
    0,
  );
});
test("native response interceptor order follows reverse DI and truncated calls are discarded before length retry", async () => {
  const f = responseFixture(),
    names = createNativeResponseInterceptors(f.runtime).map(
      (i) => i.constructor.name,
    );
  assert.deepEqual(names, [
    "ModelPermissionErrorInterceptor",
    "FallbackModelErrorInterceptor",
    "MediaContentErrorInterceptor",
    "QueuedMessagesCleanupInterceptor",
    "TruncatedToolCallInterceptor",
    "TextualToolCallInterceptor",
    "finishReasonErrorInterceptor",
    "ContextTruncationInterceptor",
  ]);
  const call: any = {
    type: "function_call",
    callId: "c",
    name: "Write",
    arguments: "{",
  };
  f.session.history = [call];
  f.context.result.newItems = [{ rawItem: call }];
  f.context.modelResponseMetadata.finishReason = "length";
  await new TruncatedToolCallInterceptor(f.runtime).intercept(f.context);
  assert.equal(call.providerData.discard, true);
  assert.deepEqual(f.session.meta.lastTruncatedToolNames, ["Write"]);
  assert.equal(
    await new finishReasonErrorInterceptor(f.runtime).intercept(f.context),
    true,
  );
  assert.match(
    f.calls.find((c) => c[0] === "run")[1],
    /Instead of writing the entire file/,
  );
});
test("finishReason retries twice, surfaces exact terminal notice and exempts expected sub-agent TPD tool_calls", async () => {
  const f = responseFixture(),
    i = new finishReasonErrorInterceptor(f.runtime);
  f.context.modelResponseMetadata.finishReason = "length";
  f.session.history = [
    ownedUser("a", "truncated due to output length limits"),
    {
      ...ownedUser("b", "truncated due to output length limits"),
      parentId: "a",
    },
  ];
  assert.equal(await i.intercept(f.context), undefined);
  assert.match(
    f.calls.find((c) => c[0] === "run")[1][0].content[0].text,
    /Response was repeatedly truncated/,
  );
  f.calls.length = 0;
  f.session.storeId = "child";
  f.context.result.error = { code: 6004 };
  f.context.modelResponseMetadata.finishReason = "tool_calls";
  await i.intercept(f.context);
  assert.ok(
    f.calls.some((c) => c[0] === "suppressCreditRefundConversationRequest"),
  );
  assert.equal(
    f.calls.some((c) => c[0] === "reportUserTaskFailedCreditRefund"),
    false,
  );
});
test("textual tool recovery excludes quoted examples, uses actual call presence and marks only assistant output discarded", async () => {
  const f = responseFixture(),
    i = new TextualToolCallInterceptor(f.runtime);
  assert.equal(
    i.hasTextualToolCall('```xml\n<invoke name="Read">a</invoke>\n```'),
    false,
  );
  assert.equal(i.hasTextualToolCall('<invoke name="Read">a</invoke>'), true);
  const answer = ownedAnswer("a", '<invoke name="Read">a</invoke>', {
    messageId: "m",
  });
  f.session.history = [ownedUser("u"), answer];
  f.context.modelResponseMetadata.finishReason = "stop";
  assert.equal(await i.intercept(f.context), true);
  assert.equal(
    answer.providerData.discard,
    TextualToolCallInterceptor.CLEAN_RETRY_ENABLED ? true : undefined,
  );
  assert.equal(f.calls.find((c) => c[0] === "run")[2].bypassMessageQueue, true);
});
test("textual recovery without a transport messageId preserves raw-item-only discard rather than inventing an ID", async () => {
  const f = responseFixture(),
    i = new TextualToolCallInterceptor(f.runtime),
    raw = ownedAnswer("a", '<invoke name="Read">owned</invoke>');
  const saved = { ...raw, providerData: { ...raw.providerData } };
  f.session.history = [ownedUser("u"), saved];
  f.context.result.newItems = [{ rawItem: raw }];
  f.context.modelResponseMetadata.finishReason = "stop";
  assert.equal(await i.intercept(f.context), true);
  assert.equal(
    raw.providerData.discard,
    TextualToolCallInterceptor.CLEAN_RETRY_ENABLED ? true : undefined,
  );
  assert.equal(saved.providerData.discard, undefined);
  assert.equal(f.session.messageId, undefined);
});
test("media removal uses oldest for too-many and latest otherwise across user/tool/provider JSON views", () => {
  const f = responseFixture(),
    i = new MediaContentErrorInterceptor(f.runtime),
    image = (value: string) => ({
      type: "image_url",
      image_url: { url: value },
    });
  const first = ownedUser("u");
  first.content.push(image("file:///owned/first.png"));
  const tool: any = {
    type: "function_call_result",
    callId: "c",
    output: JSON.stringify([image("file:///owned/output.png")]),
    providerData: {
      toolResult: {
        content: JSON.stringify([image("file:///owned/provider.png")]),
      },
    },
  };
  f.session.history = [
    first,
    {
      type: "function_call",
      callId: "c",
      arguments: '{"file_path":"/owned/read.png"}',
    } as any,
    tool,
  ];
  assert.equal(
    i.removeMediaBasedOnErrorType(f.session.history, "too_many_images")
      .filePath,
    "/owned/first.png",
  );
  assert.equal(first.content[1].type, "input_text");
  assert.equal(
    i.removeMediaBasedOnErrorType(f.session.history, "invalid_image").filePath,
    "/owned/read.png",
  );
  assert.equal(
    JSON.parse(tool.providerData.toolResult.content)[0].type,
    "text",
  );
});
test("GIF business rejection sanitizes only user images without automatic retry and media retry markers cap at ten", async () => {
  const f = responseFixture(),
    i = new MediaContentErrorInterceptor(f.runtime),
    u = ownedUser("u");
  u.content.push({
    type: "input_image",
    image: "https://owned.invalid/a.GIF?x=1",
  });
  f.session.history = [u];
  f.context.result.error = { code: 11125 };
  await i.intercept(f.context);
  assert.match(u.content[1].text, /GIF omitted from model context/);
  assert.equal(
    f.calls.some((c) => c[0] === "run"),
    false,
  );
  assert.equal(
    i.countRecentRetries(
      Array.from({ length: 12 }, (_, n) =>
        ownedUser(String(n), "Media Content Error Recovery"),
      ),
    ),
    10,
  );
});
test("PTL tries emergency compaction first, respects pending approval and uses marked deterministic fallback", async () => {
  const f = responseFixture(),
    i = new ContextTruncationInterceptor(f.runtime);
  f.context.result.error = {
    message: "prompt is too long: 3000 tokens > 2000",
  };
  f.session.history = [
    ownedUser("old"),
    ownedAnswer("old-a"),
    ownedUser("new"),
    ownedAnswer("new-a"),
  ];
  assert.equal(await i.intercept(f.context), true);
  assert.deepEqual(f.calls.find((c) => c[0] === "compact")[1], {
    force: true,
    skipContinue: false,
    type: "emergency-auto",
  });
  const recovery = f.calls.find((c) => c[0] === "run")[1][0];
  assert.equal(recovery.providerData.isCompactInternal, true);
  assert.equal(recovery.providerData.isPtlRetryMarker, true);
  assert.match(
    recovery.content[0].text,
    new RegExp(PTL_RETRY_MARKER.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
  );
  f.calls.length = 0;
  f.session.meta.compactBlockedByPendingInterruption = true;
  assert.equal(await i.intercept(f.context), undefined);
  assert.equal(
    f.calls.some((c) => c[0] === "run"),
    false,
  );
});
test("fallback retries overloaded primary once but quota exhaustion switches immediately and only once", async () => {
  for (const quota of [false, true]) {
    const f = responseFixture(),
      i = new FallbackModelErrorInterceptor(f.runtime);
    f.session.options = {
      print: true,
      model: "primary",
      fallbackModel: " secondary ",
    };
    f.context.result.error = quota ? { code: 14001 } : { status: 429 };
    assert.equal(await i.intercept(f.context), true);
    assert.equal(f.session.options.model, quota ? "secondary" : "primary");
    if (!quota) {
      assert.equal(await i.intercept(f.context), true);
      assert.equal(f.session.options.model, "secondary");
    }
    assert.equal(f.session.meta.fallbackModelActivated, true);
    assert.equal(await i.intercept(f.context), undefined);
  }
});
test("model permission code 11136 forces sync and appends refreshed model IDs without turning into a retry", async () => {
  const f = responseFixture(),
    i = new ModelPermissionErrorInterceptor(f.runtime);
  f.context.result.error = { error: { message: '{"error":{"code":11136}}' } };
  assert.equal(await i.intercept(f.context), undefined);
  assert.ok(f.calls.some((c) => c[0] === "sync" && c[1] === true));
  assert.match(
    f.context.result.error.error.message,
    /Available models after refresh:\n  - owned-model/,
  );
  assert.equal(
    f.calls.some((c) => c[0] === "run"),
    false,
  );
});
function fixtureModel(
  response: (
    request: any,
    count: number,
  ) => { text?: string; reason?: string; error?: any },
): Model {
  let count = 0;
  return {
    async getResponse() {
      return { output: [], usage: new Usage() };
    },
    async *getStreamedResponse(request) {
      const value = response(request, ++count);
      yield { type: "response_started" };
      if (value.error) throw value.error;
      yield {
        type: "model",
        event: {
          choices: [
            { index: 0, delta: {}, finish_reason: value.reason ?? "stop" },
          ],
        },
      } as any;
      yield {
        type: "response_done",
        response: {
          id: `owned-${count}`,
          output: [ownedAnswer(`answer-${count}`, value.text ?? "owned")],
          usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
        },
      } as any;
    },
  };
}
test(
  "real SDK length response automatically continues through the native response gate",
  { timeout: 10000 },
  async (t) => {
    const root = await ownedDirectory(t),
      requests: any[] = [],
      model = fixtureModel((r, n) => {
        requests.push(r);
        return n === 1
          ? { text: "truncated", reason: "length" }
          : { text: "completed" };
      });
    const h = await createHarness({
      workDir: root,
      modelProvider: { getModel: () => model },
    });
    t.after(() => h.close());
    const s = await h.openSession();
    assert.equal(await h.prompt(s, "owned length fixture"), "completed");
    assert.equal(requests.length, 2);
    assert.match(
      JSON.stringify(requests[1].input),
      /previous response was truncated due to output length/,
    );
    assert.equal(s.status, "idle");
  },
);
test(
  "real SDK textual invoke is discarded from next model input and is replaced by a real-tool reminder",
  { timeout: 10000 },
  async (t) => {
    const root = await ownedDirectory(t),
      requests: any[] = [],
      model = fixtureModel((r, n) => {
        requests.push(r);
        return {
          text: n === 1 ? '<invoke name="Read">owned</invoke>' : "recovered",
        };
      });
    const h = await createHarness({
      workDir: root,
      modelProvider: { getModel: () => model },
    });
    t.after(() => h.close());
    const s = await h.openSession();
    s.messageId = "owned-textual-request"; // Injected model has no transport assigning its native request ID.
    assert.equal(await h.prompt(s, "owned textual fixture"), "recovered");
    assert.equal(requests.length, 2);
    assert.match(
      JSON.stringify(requests[1].input),
      /TEXTUAL_TOOL_CALL_RECOVERY/,
    );
    if (TextualToolCallInterceptor.CLEAN_RETRY_ENABLED)
      assert.equal(
        JSON.stringify(requests[1].input).includes(
          '<invoke name="Read">owned</invoke>',
        ),
        false,
      );
    assert.equal(
      (s.history as any[]).find((v) => v.role === "assistant")?.providerData
        .discard,
      TextualToolCallInterceptor.CLEAN_RETRY_ENABLED ? true : undefined,
    );
  },
);
test(
  "real SDK fallback performs primary retry then model switch without an installed product service",
  { timeout: 10000 },
  async (t) => {
    const root = await ownedDirectory(t),
      names: any[] = [],
      requests: any[] = [],
      model = fixtureModel((r, n) => {
        requests.push(r);
        return n < 3
          ? { error: Object.assign(Error("owned overloaded"), { status: 429 }) }
          : { text: "fallback recovered" };
      });
    const h = await createHarness({
      workDir: root,
      model: "owned-primary",
      modelProvider: {
        getModel: (name) => {
          names.push(name);
          return model;
        },
      },
    });
    t.after(() => h.close());
    const s = await h.openSession(undefined, { print: true });
    s.options.fallbackModel = "owned-secondary";
    assert.equal(
      await h.prompt(s, "owned fallback fixture"),
      "fallback recovered",
    );
    assert.equal(requests.length, 3);
    assert.equal(s.options.model, "owned-secondary");
    assert.equal(s.meta.fallbackModelActivated, true);
    assert.ok(names.includes("owned-secondary"));
  },
);
test(
  "real SDK PTL deterministic fallback drops old groups and continues using the original recovery marker",
  { timeout: 10000 },
  async (t) => {
    const root = await ownedDirectory(t),
      requests: any[] = [],
      model = fixtureModel((r, n) => {
        requests.push(r);
        return n === 1
          ? { error: Error("prompt is too long: 3000 tokens > 2000") }
          : { text: "PTL recovered" };
      });
    const h = await createHarness({
      workDir: root,
      modelProvider: { getModel: () => model },
    });
    t.after(() => h.close());
    h.compactor.compactAndSummarize = async () => false;
    const s = await h.openSession();
    await h.sessions.addHistory(s, [
      ownedUser("old", "oldest question"),
      ownedAnswer("old-a"),
      ownedUser("recent", "recent question"),
      ownedAnswer("recent-a"),
    ]);
    assert.equal(await h.prompt(s, "owned PTL fixture"), "PTL recovered");
    assert.equal(requests.length, 2);
    assert.match(
      JSON.stringify(requests[1].input),
      /earlier conversation truncated to fit context limit/,
    );
    assert.equal(
      JSON.stringify(requests[1].input).includes("oldest question"),
      false,
    );
  },
);
test("harness exposes isolated input history, retains it across instances and never records internal model turns", async (t) => {
  const root = await ownedDirectory(t),
    model = fixtureModel(() => ({ text: "owned answer" })),
    opts = { workDir: root, modelProvider: { getModel: () => model } };
  const h = await createHarness(opts);
  await h.inputHistory.addHistory({
    display: "owned typed text",
    pastedContents: {},
  });
  const s = await h.openSession();
  await h.prompt(s, "model only");
  await h.close();
  const next = await createHarness(opts);
  t.after(() => next.close());
  assert.deepEqual(
    (await next.inputHistory.getHistoryForProject()).map((v: any) => v.display),
    ["owned typed text"],
  );
  assert.equal(
    await next.inputHistory.getHistoryFilePath(),
    join(root, ".workbuddy-harness", "history.jsonl"),
  );
});
test(
  "loopback HTTP textual recovery carries transport IDs and removes plain invoke text from the next request",
  { timeout: 10000 },
  async (t) => {
    const root = await ownedDirectory(t),
      requests: any[] = [];
    const server = createServer(async (req, res) => {
      let body = "";
      for await (const part of req) body += part;
      requests.push(JSON.parse(body));
      res.writeHead(200, { "content-type": "text/event-stream" });
      const text =
        requests.length === 1
          ? '<invoke name="Read">owned HTTP</invoke>'
          : "HTTP tool-call recovery";
      for (const choice of [
        {
          index: 0,
          delta: { role: "assistant", content: text },
          finish_reason: null,
        },
        { index: 0, delta: {}, finish_reason: "stop" },
      ])
        res.write(
          `data: ${JSON.stringify({ id: `owned-${requests.length}`, object: "chat.completion.chunk", created: 1, model: "owned-http", choices: [choice] })}\n\n`,
        );
      res.end("data: [DONE]\n\n");
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
    const h = await createHarness({
      workDir: root,
      model: "owned-http",
      apiKey: "owned-fixture-key",
      baseURL: `http://127.0.0.1:${(server.address() as any).port}/v1`,
    });
    t.after(() => h.close());
    const s = await h.openSession();
    assert.equal(
      await h.prompt(s, "owned HTTP textual fixture"),
      "HTTP tool-call recovery",
    );
    assert.equal(requests.length, 2);
    assert.match(
      JSON.stringify(requests[1].messages),
      /TEXTUAL_TOOL_CALL_RECOVERY/,
    );
    if (TextualToolCallInterceptor.CLEAN_RETRY_ENABLED)
      assert.equal(
        JSON.stringify(requests[1].messages).includes(
          '<invoke name="Read">owned HTTP</invoke>',
        ),
        false,
      );
    const old = (s.history as any[]).find((v) => v.role === "assistant");
    assert.match(old.providerData.messageId, /^[a-f0-9]{32}$/);
    assert.equal(
      old.providerData.discard,
      TextualToolCallInterceptor.CLEAN_RETRY_ENABLED ? true : undefined,
    );
  },
);
test(
  "loopback HTTP business code 11136 invokes only the explicit product-refresh adapter",
  { timeout: 10000 },
  async (t) => {
    const root = await ownedDirectory(t);
    let requests = 0,
      syncs = 0;
    const server = createServer(async (req, res) => {
      for await (const _ of req) {
      }
      requests++;
      res.writeHead(403, { "content-type": "application/json" });
      res.end(
        JSON.stringify({
          error: { code: 11136, message: "owned model permission denied" },
        }),
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
    const h = await createHarness({
      workDir: root,
      model: "owned-http",
      apiKey: "owned-fixture-key",
      baseURL: `http://127.0.0.1:${(server.address() as any).port}/v1`,
      productRefresh: {
        async sync(force) {
          assert.equal(force, true);
          syncs++;
        },
      },
    });
    t.after(() => h.close());
    const s = await h.openSession();
    await assert.rejects(h.prompt(s, "owned denied model"), (e: any) => {
      assert.match(e.error?.message ?? "", /Available models after refresh/);
      return true;
    });
    assert.equal(syncs, 1);
    assert.equal(requests, 1);
  },
);
test(
  "compiled-or-source CLI --fallback-model retries primary once, switches model and keeps print input out of UI history",
  { timeout: 10000 },
  async (t) => {
    const root = await ownedDirectory(t),
      requests: any[] = [];
    const server = createServer(async (req, res) => {
      let body = "";
      for await (const part of req) body += part;
      requests.push(JSON.parse(body));
      if (requests.length < 3) {
        res.writeHead(429, { "content-type": "application/json" });
        res.end(
          JSON.stringify({
            error: { message: "owned primary overloaded", code: 6006 },
          }),
        );
        return;
      }
      res.writeHead(200, { "content-type": "text/event-stream" });
      for (const choice of [
        {
          index: 0,
          delta: { role: "assistant", content: "CLI fallback recovered" },
          finish_reason: null,
        },
        { index: 0, delta: {}, finish_reason: "stop" },
      ])
        res.write(
          `data: ${JSON.stringify({ id: "owned-cli", object: "chat.completion.chunk", created: 1, model: "owned-secondary", choices: [choice] })}\n\n`,
        );
      res.end("data: [DONE]\n\n");
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
    const extension = import.meta.url.endsWith(".ts") ? "ts" : "js",
      entry = fileURLToPath(
        new URL(`../src/cli.${extension}`, import.meta.url),
      );
    const result = await new Promise<{
      code: number | null;
      out: string;
      err: string;
    }>((resolve, reject) => {
      const child = spawn(
        process.execPath,
        [
          ...(extension === "ts" ? ["--import", "tsx"] : []),
          entry,
          "--cwd",
          root,
          "--base-url",
          `http://127.0.0.1:${(server.address() as any).port}/v1`,
          "--model",
          "owned-primary",
          "--fallback-model",
          "owned-secondary",
          "-p",
          "owned CLI fallback",
        ],
        {
          env: {
            ...process.env,
            CODEBUDDY_API_KEY: "owned-fixture-key",
            CODEBUDDY_RECORD_DIR: "",
            CODEBUDDY_REPLAY_DIR: "",
          },
          stdio: ["ignore", "pipe", "pipe"],
        },
      );
      let out = "",
        err = "";
      child.stdout.on("data", (v) => (out += v));
      child.stderr.on("data", (v) => (err += v));
      child.on("error", reject);
      child.on("close", (code) => resolve({ code, out, err }));
    });
    assert.equal(result.code, 0, result.err);
    assert.equal(result.out, "CLI fallback recovered\n");
    assert.deepEqual(
      requests.map((v) => v.model),
      ["owned-primary", "owned-primary", "owned-secondary"],
    );
    await assert.rejects(
      access(join(root, ".workbuddy-harness", "history.jsonl")),
    );
  },
);

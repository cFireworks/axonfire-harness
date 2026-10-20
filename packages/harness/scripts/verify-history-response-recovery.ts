import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import assert from "node:assert/strict";
import { parse } from "acorn";
import { readFile } from "node:fs/promises";
import {
  loadCapturedHistoryResponse,
  responseClassEvidence,
} from "./helpers/captured-history-response.js";
import {
  responseFixture,
  ownedUser,
  ownedAnswer,
} from "./helpers/response-fixtures.js";
import { manualTimers, turn } from "./helpers/session-result-fixtures.js";
import { InputHistoryServiceImpl } from "../src/sessions/input-history-service.js";
import {
  createResponseErrorUtils,
  ServerErrorCode,
} from "../src/models/response-error-utils.js";
import {
  createHistoryTruncateUtils,
  PtlErrorUtils,
  TokenUtils,
  PTL_RETRY_MARKER,
} from "../src/context/response-history-utils.js";
import { createResponseInputUtils } from "../src/sessions/response-input-utils.js";
import { NATIVE_RESPONSE_INTERCEPTOR_ORDER } from "../src/responses/native-response-interceptors.js";
import { ContextTruncationInterceptor } from "../src/responses/context-truncation-interceptor.js";
import { finishReasonErrorInterceptor } from "../src/responses/finish-reason-error-interceptor.js";
import { TextualToolCallInterceptor } from "../src/responses/textual-tool-call-interceptor.js";
import { TruncatedToolCallInterceptor } from "../src/responses/truncated-tool-call-interceptor.js";
import { QueuedMessagesCleanupInterceptor } from "../src/responses/queued-messages-cleanup-interceptor.js";
import { MediaContentErrorInterceptor } from "../src/responses/media-content-error-interceptor.js";
import { FallbackModelErrorInterceptor } from "../src/responses/fallback-model-error-interceptor.js";
import { ModelPermissionErrorInterceptor } from "../src/responses/model-permission-error-interceptor.js";
import { TRUNCATION_RETRY_MARKER } from "../src/runner/history-repair.js";
import { estimateTrailingToolResultTokens } from "../src/sessions/history-utils.js";
const source = await readFile(
    getCapturedBundlePath(),
    "utf8",
  ),
  native = loadCapturedHistoryResponse(source);
let comparisons = 0;
const norm = (v: any): any =>
  v === undefined
    ? "[undefined]"
    : v instanceof RegExp ||
        Object.prototype.toString.call(v) === "[object RegExp]"
      ? String(v)
      : v instanceof Error ||
          Object.prototype.toString.call(v) === "[object Error]"
        ? { name: v.name, message: v.message }
        : v instanceof Map ||
            Object.prototype.toString.call(v) === "[object Map]"
          ? Array.from(v as Map<any, any>, ([k, x]) => [k, norm(x)])
          : v instanceof Set ||
              Object.prototype.toString.call(v) === "[object Set]"
            ? Array.from(v as Set<any>, norm)
            : Array.isArray(v)
              ? Array.from(v, norm)
              : v && typeof v === "object"
                ? Object.fromEntries(
                    Object.keys(v)
                      .sort()
                      .map((k) => [k, norm(v[k])]),
                  )
                : v;
function eq(a: any, b: any, label: string) {
  assert.deepEqual(norm(a), norm(b), label);
  comparisons++;
}
async function outcome(fn: () => any) {
  try {
    return { value: await fn() };
  } catch (error) {
    return { error };
  }
}
const config = () => ({
    endpoint: "https://owned.invalid/v1",
    stagingEndpoint: "https://staging.owned.invalid/v1",
  }),
  portErrors = createResponseErrorUtils(config),
  originalUtils = native.utilities(() => "owned-id", config);
eq(
  ServerErrorCode,
  originalUtils.ServerErrorCode,
  "all native server business code enum values",
);
const errors: any[] = [
  undefined,
  null,
  "",
  {},
  "quota exhausted",
  { code: "ETIMEDOUT" },
  { code: "ECONNREFUSED" },
  { message: "network failure" },
  { message: "Failed to process successful response" },
  { name: "Unauthorized" },
  { name: "TimeoutError" },
  { message: "rate limit" },
  { error: { message: '{"error":{"code":"14001"}}' } },
  { responseBody: null, statusCode: 401, url: "https://third-party.invalid" },
  { responseBody: "", statusCode: 500 },
  { code: 42, response: { data: { code: 6004 }, status: 429 } },
  { code: 6004, error: { code: 11135 } },
  { code: "0014001" },
  { code: "-1" },
  { error: { error: { error: { error: { code: 42 } } } } },
];
for (const code of [
  0,
  6000,
  6004,
  6008,
  6009,
  14001,
  14003,
  14012,
  14013,
  14014,
  14018,
  11136,
  "429",
  "bad",
])
  for (const key of ["code", "status", "statusCode"])
    errors.push({ [key]: code });
for (const status of [undefined, 200, 400, 401, 429, 500, 599, 600])
  for (const body of [
    undefined,
    null,
    "",
    {},
    "bad JSON",
    { code: 10008 },
    { code: 14001, error: { code: 6004, data: { code: 6002 } } },
  ])
    errors.push({
      statusCode: status,
      responseBody: body,
      url: "https://third-party.invalid/model",
    });
errors.push(
  { statusCode: 401, url: "https://owned.invalid/model" },
  { statusCode: 401, url: "https://untrusted.invalid/path/owned.invalid" },
);
for (const error of errors)
  for (const name of [
    "extractBizCode",
    "isInputLengthError",
    "isModelOverloadedError",
    "isQuotaExhaustedError",
    "mapMessageErrorCode",
  ] as const)
    eq(
      await outcome(() => (portErrors as any)[name](error)),
      await outcome(() => originalUtils.ErrorUtils[name](error)),
      "error utility " + name,
    );
for (const text of [
  "prompt is too long: 3000 tokens > 2000",
  "input length too long 4000 tokens exceeds limit 3000",
  "maximum context length is 1000 tokens. requested 2500 tokens",
  "input tokens 20000 exceeds 10000",
  "context 15000 tokens > 10000",
  "input length too long 20 > 10",
  "unknown",
  "",
]) {
  for (const error of [
    text,
    { error: { message: text } },
    { data: { details: text } },
  ])
    eq(
      PtlErrorUtils.parsePromptTooLongTokenCounts(error),
      originalUtils.PtlErrorUtils.parsePromptTooLongTokenCounts(error),
      "PTL error token parsing",
    );
  eq(
    TokenUtils.estimateTokensRough(text),
    originalUtils.TokenUtils.estimateTokensRough(text),
    "rough token estimate",
  );
}
const imageValues = [
  { type: "input_image", image: "data:image/png;base64,OWNED" },
  { type: "image_url", image_url: { url: "data:image/png;base64,OWNED" } },
  { type: "image_blob_ref", blob_id: "owned" },
];
for (const media of imageValues)
  for (const value of [
    media,
    [media],
    { content: [media] },
    JSON.stringify([media]),
    { output: JSON.stringify([media]) },
  ])
    eq(
      TokenUtils.createItemWithoutImages(value),
      originalUtils.TokenUtils.createItemWithoutImages(value),
      "native token estimation image stripping",
    );
for (let groups = 0; groups < 8; groups++)
  for (const gap of [undefined, 0, -1, 1, 100, 100000]) {
    let a = 0,
      b = 0;
    const input = createResponseInputUtils(() => `id-${++a}`),
      original = native.utilities(() => `id-${++b}`),
      port = createHistoryTruncateUtils(input),
      history: any[] = [];
    for (let i = 0; i < groups; i++)
      history.push(
        ownedUser(`u-${i}`, "中文 owned ".repeat(i + 1)),
        ownedAnswer(`a-${i}`),
      );
    eq(
      port.groupMessagesByApiRound(history),
      original.HistoryTruncateUtils.groupMessagesByApiRound(history),
      "API-round grouping",
    );
    eq(
      port.truncateHeadByTokenGap(history, gap),
      original.HistoryTruncateUtils.truncateHeadByTokenGap(history, gap),
      "head truncation " + groups + "/" + gap,
    );
    eq(
      port.countPtlRetries(history),
      original.HistoryTruncateUtils.countPtlRetries(history),
      "retry count",
    );
  }
for (let pairs = 0; pairs < 6; pairs++)
  for (const gap of [undefined, 1, 999999]) {
    let a = 0,
      b = 0;
    const port = createHistoryTruncateUtils(
        createResponseInputUtils(() => `id-${++a}`),
      ),
      original = native.utilities(() => `id-${++b}`),
      history: any[] = [ownedAnswer("assistant-first")];
    for (let i = 0; i < pairs; i++)
      history.push(
        { type: "function_call", callId: `c-${i}`, arguments: "{}" },
        {
          type: "function_call_result",
          callId: `c-${i}`,
          output: "owned result",
        },
      );
    history.unshift(ownedUser("marker", PTL_RETRY_MARKER, { skipRun: true }));
    eq(
      port.truncateHeadByTokenGap(history, gap),
      original.HistoryTruncateUtils.truncateHeadByTokenGap(history, gap),
      "single-group tool-pair truncation and marker",
    );
  }
function historyFixture(original: boolean) {
  const timers = manualTimers(),
    calls: any[] = [],
    logs: any[] = [],
    file = new Map<string, string>();
  let project = "/owned/a",
    legacy: any = [],
    fail = false,
    size: number | undefined;
  const runtime: any = {
    getHomeDir: () => "/owned/state",
    getWorkDir: () => project,
    now: () => 1_000_000,
    ...timers,
    fs: {
      async readFile(p: string, e: any) {
        calls.push(["read", p, e]);
        if (!file.has(p))
          throw Object.assign(Error("missing"), { code: "ENOENT" });
        return file.get(p)!;
      },
      async writeFile(p: string, value: string, e: any) {
        calls.push(["write", p, value, e]);
        file.set(p, value);
      },
      async appendFile(p: string, value: string, e: any) {
        calls.push(["append", p, value, e]);
        if (fail) {
          fail = false;
          throw Error("owned append failure");
        }
        file.set(p, (file.get(p) ?? "") + value);
      },
      async stat(p: string) {
        calls.push(["stat", p]);
        if (!file.has(p)) throw Error("missing");
        return { size: size ?? Buffer.byteLength(file.get(p)!) };
      },
    },
    logger: Object.fromEntries(
      ["info", "warn", "error"].map((k) => [
        k,
        (...v: any[]) => logs.push([k, ...v.map(norm)]),
      ]),
    ),
    localStorage: {
      async get(...v: any[]) {
        calls.push(["legacy", ...v]);
        return legacy;
      },
    },
  };
  const service = original
    ? native.history(runtime)
    : new InputHistoryServiceImpl(runtime);
  return {
    service,
    file,
    calls,
    logs,
    timers,
    setProject(v: string) {
      project = v;
    },
    setLegacy(v: any) {
      legacy = v;
    },
    failAppend() {
      fail = true;
    },
    setSize(v: number) {
      size = v;
    },
  };
}
async function historyCase(original: boolean, mode: string) {
  const f = historyFixture(original),
    s = f.service;
  if (mode === "append") {
    await Promise.all([
      s.addHistory({ display: "first", pastedContents: { x: "owned" } }),
      s.addHistory({
        display: "first",
        pastedContents: { different: "ignored" },
      }),
      s.addHistory({ display: "second", pastedContents: {} }),
    ]);
    f.setProject("/owned/b");
    await s.addHistory({ display: "second", pastedContents: {} });
  }
  if (mode === "recover-write-error") {
    f.failAppend();
    await outcome(() => s.addHistory({ display: "first" }));
    await s.addHistory({ display: "second" });
  }
  if (mode === "legacy") f.setLegacy(["oldest", "latest"]);
  if (mode === "invalid")
    f.file.set(
      s.getHistoryFilePath(),
      "\ninvalid JSON\n" +
        JSON.stringify({
          display: "valid",
          project: "/owned/a",
          timestamp: 1,
        }) +
        "\n",
    );
  if (mode === "expiry")
    f.file.set(
      s.getHistoryFilePath(),
      [0, 1_000_000 - 86400000, 1_000_000, 1_000_001]
        .map((timestamp) =>
          JSON.stringify({ display: "owned", project: "/owned/a", timestamp }),
        )
        .join("\n"),
    );
  if (mode === "cleanup") {
    s.maxHistorySize = 3;
    f.setSize(400);
    f.file.set(
      s.getHistoryFilePath(),
      Array.from({ length: 6 }, (_, i) =>
        JSON.stringify({
          display: `entry-${i}`,
          project: "/owned/a",
          timestamp: i,
        }),
      ).join("\n"),
    );
  }
  const history = [];
  for (const limit of [undefined, 0, -1, 1, 3, 100])
    history.push(await s.getHistoryForProject(limit));
  if (mode === "expiry") await s.cleanupHistory(1);
  if (mode === "cleanup") await s.cleanupExcessHistory();
  if (mode === "append") {
    await f.timers.fire();
    await turn();
  }
  await s.writeLock;
  return {
    history,
    calls: f.calls,
    logs: f.logs,
    file: [...f.file],
    timers: f.timers.calls,
    last: s.lastHistoryItem,
    max: s.maxHistorySize,
    delay: s.cleanupDelay,
    key: s.localStorageKey,
  };
}
for (const mode of [
  "append",
  "recover-write-error",
  "legacy",
  "invalid",
  "expiry",
  "cleanup",
  "missing",
])
  eq(
    await historyCase(false, mode),
    await historyCase(true, mode),
    "input history " + mode,
  );
const classes: any = {
  ContextTruncationInterceptor,
  finishReasonErrorInterceptor,
  TextualToolCallInterceptor,
  TruncatedToolCallInterceptor,
  QueuedMessagesCleanupInterceptor,
  MediaContentErrorInterceptor,
  FallbackModelErrorInterceptor,
  ModelPermissionErrorInterceptor,
};
eq(
  NATIVE_RESPONSE_INTERCEPTOR_ORDER.map((C) => C.name),
  native.bindingOrder(),
  "native reverse DI binding order",
);
function literalPrompts(method: Function) {
  const values: any[] = [];
  function visit(n: any) {
    if (!n || typeof n !== "object") return;
    if (
      n.type === "Literal" &&
      typeof n.value === "string" &&
      n.value.length >= 20
    )
      values.push(n.value);
    if (n.type === "TemplateLiteral")
      for (const q of n.quasis) values.push(q.value.cooked);
    for (const [k, v] of Object.entries(n))
      if (!["start", "end"].includes(k)) {
        if (Array.isArray(v)) v.forEach(visit);
        else if (v && typeof v === "object") visit(v);
      }
  }
  visit(parse("class C{" + method.toString() + "}", { ecmaVersion: "latest" }));
  return values;
}
{
  const f = historyFixture(false),
    original = native.history(f.service.runtime),
    methods = Object.getOwnPropertyNames(
      InputHistoryServiceImpl.prototype,
    ).filter((k) => k !== "constructor");
  eq(
    methods,
    Object.getOwnPropertyNames(Object.getPrototypeOf(original)).filter(
      (k) => k !== "constructor",
    ),
    "InputHistory complete method surface",
  );
  for (const method of methods)
    eq(
      literalPrompts((InputHistoryServiceImpl.prototype as any)[method]),
      literalPrompts(original[method]),
      "InputHistory." + method + " native literals",
    );
  eq(
    TokenUtils._IMAGE_CONTENT_TYPES,
    originalUtils.TokenUtils._IMAGE_CONTENT_TYPES,
    "token image omission type set",
  );
  for (const output of [
    "owned 中文",
    [{ type: "input_image", image: "data:image/png;base64,OWNED" }],
    JSON.stringify(imageValues),
  ]) {
    const records = [
      ownedUser("u"),
      { type: "function_call", callId: "c" },
      { type: "function_call_result", callId: "c", output },
      { type: "function_call", callId: "next" },
    ];
    eq(
      TokenUtils.estimateTrailingToolResultTokens(records),
      originalUtils.TokenUtils.estimateTrailingToolResultTokens(records),
      "native trailing token estimate",
    );
    eq(
      estimateTrailingToolResultTokens(records),
      originalUtils.TokenUtils.estimateTrailingToolResultTokens(records),
      "runner/compactor uses original trailing token estimate",
    );
  }
}
for (const [name] of responseClassEvidence) {
  const f = responseFixture(),
    port = new classes[name](f.runtime),
    original = native.response(name, f.runtime, process.env),
    proto = Object.getPrototypeOf(port),
    originalProto = Object.getPrototypeOf(original),
    methods = Object.getOwnPropertyNames(proto).filter(
      (k) => k !== "constructor",
    );
  eq(
    methods,
    Object.getOwnPropertyNames(originalProto).filter(
      (k) => k !== "constructor",
    ),
    name + " complete method surface",
  );
  const config = (C: any) =>
    Object.fromEntries(
      Object.getOwnPropertyNames(C)
        .filter((k) => !["name", "length", "prototype"].includes(k))
        .map((k) => [k, C[k]]),
    );
  eq(
    config(port.constructor),
    config(original.constructor),
    name + " exact static configuration/regex/placeholder",
  );
  for (const method of methods)
    eq(
      literalPrompts(proto[method]),
      literalPrompts(originalProto[method]),
      name + "." + method + " literal prompts/log templates",
    );
}
async function interceptCase(
  name: string,
  original: boolean,
  configure: (f: any, instance: any) => void,
) {
  const f = responseFixture(
      original
        ? (next: () => string) => native.utilities(next, config)
        : undefined,
    ),
    instance = original
      ? native.response(name, f.runtime)
      : new classes[name](f.runtime);
  configure(f, instance);
  const result = await outcome(() => instance.intercept(f.context));
  return {
    result,
    calls: f.calls,
    logs: f.logs,
    history: f.session.history,
    meta: f.session.meta,
    options: f.session.options,
    error: f.context.result.error,
    queued: (f.session as any).queuedMessagesRecord,
  };
}
const scenarios: Array<[string, (f: any, p: any) => void]> = [];
for (const reason of [
  undefined,
  "stop",
  "end_turn",
  "tool_calls",
  "tool-calls",
  "length",
  "error",
  "content_filter",
])
  scenarios.push([
    "finishReasonErrorInterceptor",
    (f) => (f.context.modelResponseMetadata.finishReason = reason),
  ]);
for (const retries of [0, 1, 2, 3])
  scenarios.push([
    "finishReasonErrorInterceptor",
    (f) => {
      f.context.modelResponseMetadata.finishReason = "length";
      f.session.history = Array.from({ length: retries }, (_, i) => ({
        ...ownedUser(`u-${i}`, TRUNCATION_RETRY_MARKER),
        parentId: i ? `u-${i - 1}` : undefined,
      }));
      f.session.meta.lastTruncatedToolNames = [
        "Write",
        "Edit",
        "Write",
        "Bash",
        "unknown",
      ];
    },
  ]);
for (const text of [
  '<invoke name="Read">owned</invoke>',
  '```xml\n<invoke name="Read">owned</invoke>\n```',
  '`<invoke name="Read">owned</invoke>`',
  "normal answer",
])
  for (const real of [false, true])
    scenarios.push([
      "TextualToolCallInterceptor",
      (f) => {
        f.context.modelResponseMetadata.finishReason = "stop";
        f.context.result.newItems = [
          { rawItem: ownedAnswer("a", text) },
          ...(real
            ? [{ rawItem: { type: "function_call", callId: "c" } }]
            : []),
        ];
      },
    ]);
scenarios.push([
  "TextualToolCallInterceptor",
  (f) => {
    f.context.modelResponseMetadata.finishReason = "end_turn";
    f.session.history = [
      ownedUser("retry", "[TEXTUAL_TOOL_CALL_RECOVERY]"),
      ownedAnswer("a", '<invoke name="Read">owned</invoke>', {
        messageId: "m",
      }),
    ];
  },
]);
for (const code of [11136, 6004, "11136", 0])
  scenarios.push([
    "ModelPermissionErrorInterceptor",
    (f) =>
      (f.context.result.error = {
        error: { code, message: "owned model error" },
      }),
  ]);
scenarios.push([
  "ModelPermissionErrorInterceptor",
  (f) =>
    (f.context.result.error = {
      error: { message: '{"error":{"code":11136}}' },
    }),
]);
for (const error of [
  { status: 429 },
  { code: 14001 },
  { message: "not overloaded" },
  undefined,
])
  for (const attempted of [false, true])
    scenarios.push([
      "FallbackModelErrorInterceptor",
      (f) => {
        f.session.options = {
          print: true,
          model: "primary",
          fallbackModel: " secondary ",
        };
        f.session.meta.fallbackModelPrimaryRetryAttempted = attempted;
        f.context.result.error = error;
      },
    ]);
for (const compact of [false, true])
  for (const pending of [false, true])
    scenarios.push([
      "ContextTruncationInterceptor",
      (f) => {
        f.context.result.error = {
          message: "prompt is too long: 3000 tokens > 2000",
        };
        f.session.history = [
          ownedUser("old"),
          ownedAnswer("old-a"),
          ownedUser("new"),
          ownedAnswer("new-a"),
        ];
        f.session.isCompressing = compact;
        if (pending) f.session.meta.compactBlockedByPendingInterruption = true;
      },
    ]);
scenarios.push([
  "ContextTruncationInterceptor",
  (f) => {
    f.context.result.error = { message: "input length too long" };
    f.runtime.contextCompactSummarizer.compactAndSummarize = async () => true;
  },
]);
scenarios.push([
  "TruncatedToolCallInterceptor",
  (f) => {
    f.context.modelResponseMetadata.finishReason = "length";
    const call = {
      type: "function_call",
      callId: "c",
      name: "Write",
      arguments: "{",
    };
    f.context.result.newItems = [
      { rawItem: call },
      { rawItem: { ...call, callId: "good", arguments: "null" } },
    ];
    f.session.history = [call];
  },
]);
scenarios.push([
  "QueuedMessagesCleanupInterceptor",
  (f) =>
    ((f.session as any).queuedMessagesRecord = new Map([
      ["id", { owned: true }],
    ])),
]);
const mediaErrors = [
  "image exceeds limit",
  "request body larger than maxBodyLength",
  "too many images",
  "invalid image data",
  "invalid multimodal content",
  "unrelated",
];
for (const error of mediaErrors)
  for (const kind of [
    "user",
    "output-array",
    "output-json",
    "provider-array",
    "provider-json",
    "none",
  ])
    scenarios.push([
      "MediaContentErrorInterceptor",
      (f) => {
        f.context.result.error = { error: { message: error } };
        const image = {
          type: "image_url",
          image_url: { url: "file:///owned/image.png" },
        };
        f.session.history = [ownedUser("user")];
        if (kind === "user") (f.session.history[0] as any).content.push(image);
        else if (kind !== "none") {
          f.session.history.push({
            type: "function_call",
            callId: "c",
            name: "Read",
            arguments: '{"file_path":"/owned/read.png"}',
          } as any);
          f.session.history.push({
            type: "function_call_result",
            callId: "c",
            output:
              kind === "output-array"
                ? [image]
                : kind === "output-json"
                  ? JSON.stringify([image])
                  : "owned",
            providerData: kind.startsWith("provider")
              ? {
                  toolResult: {
                    content:
                      kind === "provider-array"
                        ? [image]
                        : JSON.stringify([image]),
                  },
                }
              : {},
          } as any);
        }
      },
    ]);
scenarios.push([
  "MediaContentErrorInterceptor",
  (f) => {
    f.context.result.error = { code: 11125 };
    f.session.history = [ownedUser("gif")];
    (f.session.history[0] as any).content.push({
      type: "input_image",
      image: "data:image/gif;base64,OWNED",
    });
  },
]);
for (const [name, configure] of scenarios)
  eq(
    await interceptCase(name, false, configure),
    await interceptCase(name, true, configure),
    "native response " + name,
  );
console.log(
  JSON.stringify(
    {
      comparisons,
      passed: true,
      scope:
        "InputHistoryService complete class + eight response interceptors + native DI order + Token/PTL/truncation/input helpers + business error predicates/mapping; injected I/O/observers, no app startup",
    },
    null,
    2,
  ),
);

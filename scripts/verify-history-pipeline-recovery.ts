import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { runInNewContext } from "node:vm";
import * as path from "node:path";
import { parse } from "acorn";
import { DefaultInputItemProcessor } from "../src/sessions/default-input-item-processor.js";
import { ParentIdLinkageProcessor } from "../src/sessions/parent-id-linkage-processor.js";
import { FunctionCallAgentInputItemProcessor } from "../src/sessions/function-call-agent-input-item-processor.js";
import { FunctionCallResultAgentInputItemProcessor } from "../src/sessions/function-call-result-processor.js";
import { UsageAgentInputItemProcessor } from "../src/sessions/usage-agent-input-item-processor.js";
import { ExitPlanModeToolCallProcessor } from "../src/sessions/exit-plan-mode-tool-call-processor.js";
import {
  AgentInputItemProcessorPriority,
  AgentInputItemPipeline,
} from "../src/sessions/input-item-pipeline.js";
import { createInputProcessorUtilities } from "../src/sessions/input-processor-utils.js";
import { ImageFilterAgentRunInterceptor } from "../src/agents/image-filter-agent-run-interceptor.js";
import { ImageRehydrationAgentRunInterceptor } from "../src/agents/image-rehydration-agent-run-interceptor.js";
import { ImageCompressionAgentRunInterceptor } from "../src/agents/image-compression-agent-run-interceptor.js";
import { ToolResult } from "../src/tools/tool-result.js";
import { SessionManager } from "../src/sessions/session-manager.js";
import {
  nativeToolArgumentRenderers,
  redactPowerShellCommand,
} from "../src/tools/native-argument-renderers.js";

const source = await readFile(
  process.argv[2] ??
    new URL(
      "../../../work/workbuddy-app/cli/dist/codebuddy.js",
      import.meta.url,
    ),
  "utf8",
);
assert.equal(
  createHash("sha256").update(source).digest("hex"),
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd",
);
const classes: any[] = [];
const sortParts: any[] = [];
let sortFunction: any;
function visit(n: any) {
  if (!n || typeof n !== "object") return;
  if (["ClassExpression", "ClassDeclaration"].includes(n.type)) classes.push(n);
  if (n.start > 115000 && n.end < 117100) {
    if (
      n.type === "FunctionDeclaration" &&
      ["toPrioritizeableSync", "isValid", "compare"].includes(n.id?.name)
    )
      sortParts.push(n);
    if (
      n.type === "AssignmentExpression" &&
      n.left?.property?.name === "prioritizeAllSync"
    )
      sortFunction = n.right;
  }
  for (const [k, v] of Object.entries(n))
    if (!["start", "end"].includes(k)) {
      if (Array.isArray(v)) v.forEach(visit);
      else if (v && typeof v === "object") visit(v);
    }
}
visit(parse(source, { ecmaVersion: "latest" }));
assert.equal(sortParts.length, 3);
assert.ok(sortFunction);
const nativeSort = runInNewContext(
  `(()=>{${sortParts.map((n) => source.slice(n.start, n.end)).join("\n")}return (${source.slice(sortFunction.start, sortFunction.end)})})()`,
);
function methods(anchor: number, names: string[]) {
  const c = classes
    .filter((c) => c.start <= anchor && c.end > anchor)
    .sort((a, b) => a.end - a.start - (b.end - b.start))[0];
  return `class{${names
    .map((name) => {
      const m = c.body.body.find((m: any) => m.key?.name === name);
      assert.ok(m, name);
      return source.slice(m.start, m.end);
    })
    .join("\n")}}`;
}
const enumText = source.match(
  /!function\(eA\)\{eA\[eA\.Default=10\][^]*?\}\(eu\|\|\(eu=\{\}\)\)/,
)?.[0];
assert.ok(enumText);
const nativePriority = runInNewContext(`let eu;${enumText};eu`);
const utilities = createInputProcessorUtilities(
  () => "/project/deep/work",
  () => "/owned/home",
);
const nativeUtilities = runInNewContext(
  `(()=>{const InputItemUtils=${methods(13270300, ["isCustomInputItem", "isSkipRunItem", "isUserMessageItem", "isRealUserMessageItem", "isSystemTeammateMessage", "isCompactBoundaryMessage", "isReplayRecoverableCompactMessage", "isCompactUserMessage", "hasCompactBoundaryContent", "isCompactContinuePromptMessage", "hasTeammateMessageContent", "getUserMessageText"])};const SummaryUtils=${methods(13376615, ["extractSummaryContent", "hasCompactOutputStructure", "extractCompactSummaryFromText", "extractTextFromAssistantContent"])};const PathUtils=${methods(13337801, ["getRelativePath", "getDisplayPath"])};PathUtils.getWorkDir=()=>'/project/deep/work';return{InputItemUtils,SummaryUtils,PathUtils,SessionUtils:{isSubAgent:s=>!!s.storeId&&s.storeId!==s.id},UrlUtils:${methods(13405828, ["extractUrls"])}}})()`,
  {
    ep: { AgentNames: { COMPACT: "compact" } },
    eg: {
      CUSTOM_INPUT_ITEM_TYPES: [
        "custom-title",
        "topic",
        "ai-title",
        "summary",
        "file-history-snapshot",
        "goal-result",
        "goal-progress",
        "resend-fork-notice",
      ],
    },
    ef: path,
    eh: { homedir: () => "/owned/home" },
  },
  { timeout: 1000 },
);
// Only deterministic identity/time and external service dependencies are injected.
const globals = {
  AB: nativeUtilities,
  t3: { AgentInputItemProcessorPriority: nativePriority },
  t5: { generateUUUID: () => "uuid-owned" },
  A2: {
    CUSTOM_AGENT_TAG: "custom",
    SUB_AGENT_TAG: "sub-agent",
    AgentNames: { COMPACT: "compact" },
  },
  A4: {
    SESSION_META_COMPACT_TYPE: "compactType",
    CompactType: { USER_COMMAND: "user-command" },
  },
  Aw: {
    ToolNames: {
      DEFER_EXECUTE: "DeferExecuteTool",
      WORKFLOW: "Workflow",
      EXIT_PLAN_MODE: "ExitPlanMode",
    },
    ToolResult,
  },
  A_: {
    AgentRunInterceptorPriority: {
      ImageFilter: 850,
      ImageRehydration: 1050,
      ImageCompression: 1075,
    },
  },
  Date: class extends Date {
    static override now() {
      return 123456;
    }
  },
  Error,
  SyntaxError,
  TypeError,
  JSON,
  Map,
  Set,
};
const definitions: any[] = [
  ["Default", DefaultInputItemProcessor, 11036587, 11037814],
  ["Parent", ParentIdLinkageProcessor, 11038139, 11039351],
  ["Function", FunctionCallAgentInputItemProcessor, 11039444, 11041199],
  ["Result", FunctionCallResultAgentInputItemProcessor, 11041906, 11044215],
  ["Usage", UsageAgentInputItemProcessor, 11044508, 11045003],
  ["Exit", ExitPlanModeToolCallProcessor, 11045096, 11045850],
  ["Filter", ImageFilterAgentRunInterceptor, 7127682, 7129711],
  ["Rehydrate", ImageRehydrationAgentRunInterceptor, 7111289, 7113649],
  ["Compress", ImageCompressionAgentRunInterceptor, 7114393, 7115673],
];
let comparisons = 0;
function norm(v: any): any {
  if (v === undefined) return "[undefined]";
  if (
    v instanceof Error ||
    Object.prototype.toString.call(v) === "[object Error]"
  )
    return {
      error: v.name,
      message: v.name === "TypeError" ? "[native TypeError]" : v.message,
    };
  if (Array.isArray(v)) return Array.from(v, norm);
  if (v && typeof v === "object")
    return Object.fromEntries(
      Object.keys(v)
        .sort()
        .map((k) => [k, norm(v[k])]),
    );
  return v;
}
function equal(a: any, b: any, label: string) {
  assert.deepEqual(norm(a), norm(b), label);
  comparisons++;
}
async function caught(fn: () => any) {
  try {
    return { result: await fn() };
  } catch (error) {
    return { error };
  }
}
function fixture(config: any = {}) {
  const logs: any[] = [],
    calls: any[] = [],
    history = structuredClone(config.history ?? []),
    item = structuredClone(
      config.item ?? {
        type: "message",
        role: "user",
        content: "hello",
        id: "current",
      },
    );
  const session: any = {
    id: "session",
    meta: {},
    history,
    lastMessageId: "previous",
    resultSubject: {
      value: {
        lastAgent: { name: config.agent ?? "cli" },
        rawResponses: [
          {
            output: [],
            usage: { inputTokens: 2, outputTokens: 3, totalTokens: 5 },
          },
        ],
      },
    },
    usage: { add: (u: any) => calls.push(["usage", u]) },
    ...config.session,
  };
  if (config.lastResponse)
    session.resultSubject.value.rawResponses[0].output = [item];
  const logger = Object.fromEntries(
    ["info", "warn", "debug", "setContext", "error"].map((k) => [
      k,
      (...args: any[]) => logs.push([k, ...args]),
    ]),
  );
  const imageUtils = {
    getImageCompressionMaxDimension: () => 2048,
    compressImage: async (v: any, d: any) => {
      calls.push(["compress", v, d]);
      if (config.compressError) throw Error("compression failed");
      return config.sameImage ? v : "data:image/png;base64,small";
    },
  };
  const deps: any = {
    utilities,
    generateUUUID: () => "uuid-owned",
    now: () => 123456,
    logger,
    consoleManager: logger,
    productManager: {
      waitConfiguration: async () => {
        calls.push(["configuration"]);
        return {
          agents: [
            { name: config.agent ?? "cli", tags: config.tags, color: "cyan" },
          ],
          models: [
            { id: "model", supportsImages: config.supportsImages ?? false },
          ],
        };
      },
    },
    toolManager: {
      get: async (name: any) => {
        calls.push(["tool", name]);
        if (config.toolError)
          throw config.toolError === "syntax"
            ? new SyntaxError("bad tool")
            : Error("tool failed");
        return config.missingTool
          ? undefined
          : { argumentRenderer: config.renderer };
      },
    },
    workflowSourceResolver: {
      resolve: async (params: any) => {
        calls.push(["workflow", params]);
        if (config.workflowError) throw Error("source unavailable");
        return { text: "export async function run() {}" };
      },
    },
    planStorageService: {
      syncRead: () => {
        calls.push(["plan"]);
        if (config.planError) throw Error("plan failed");
        return config.plan;
      },
    },
    imageUtils,
    imageBlobService: {
      resetImageTracking: () => calls.push(["reset"]),
      isImageBlobRef: (v: any) => v?.type === "image_blob_ref",
      trackImageDelivered: (...args: any[]) => calls.push(["track", ...args]),
      processHistoryForApi: async (input: any, rounds: any) => {
        calls.push(["rehydrate", rounds]);
        if (config.rehydrateError) throw Error("missing blob");
        return input;
      },
    },
    settingsManager: {
      get: async (k: any) => {
        calls.push(["setting", k]);
        if (config.settingError) throw Error("settings failed");
        return config.rounds;
      },
    },
  };
  const context: any = {
    input: config.input === undefined ? [item] : structuredClone(config.input),
    agent: { model: config.model === undefined ? "model" : config.model },
    session,
  };
  return { logs, calls, item, session, deps, context, imageUtils };
}
async function compare(def: any, config: any, action?: string) {
  const [name, Port, start, end] = def,
    a = fixture(config),
    b = fixture(config);
  const Native = runInNewContext(
    "(" + source.slice(start, end) + ")",
    { ...globals, rH: { ImageUtils: b.imageUtils } },
    { timeout: 1000 },
  );
  const port = new Port(a.deps),
    native = new Native();
  Object.assign(native, b.deps);
  const method =
    action ??
    (name === "Filter" || name === "Rehydrate" || name === "Compress"
      ? "intercept"
      : "process");
  equal(port.priority, native.priority, name + " priority");
  const outA = await caught(() =>
      port[method](method === "intercept" ? a.context : a.item, a.session),
    ),
    outB = await caught(() =>
      native[method](method === "intercept" ? b.context : b.item, b.session),
    );
  equal(outA, outB, name + " return/error");
  equal(
    {
      item: a.item,
      history: a.context.input,
      meta: a.session.meta,
      lastMessageId: a.session.lastMessageId,
      lastUserMessageId: a.session.lastUserMessageId,
      logs: a.logs,
      calls: a.calls,
    },
    {
      item: b.item,
      history: b.context.input,
      meta: b.session.meta,
      lastMessageId: b.session.lastMessageId,
      lastUserMessageId: b.session.lastUserMessageId,
      logs: b.logs,
      calls: b.calls,
    },
    name + " effects",
  );
}
const ordinary = [
  { type: "message", role: "user", content: "hello" },
  {
    type: "message",
    role: "assistant",
    content: [{ type: "output_text", text: "<summary> body </summary>" }],
  },
  {
    type: "function_call",
    name: "Read",
    arguments: '{"path":"/owned/home/a","url":"https://example.test/a."}',
  },
  {
    type: "function_call_result",
    name: "Read",
    output: {
      type: "text",
      text: '{"content":"ok","renderer":{"type":"text"}}',
    },
  },
  { type: "topic", content: "custom" },
];
for (const item of ordinary)
  for (const def of definitions.slice(0, 6))
    for (const agent of ["cli", "compact", "Explore"])
      await compare(def, {
        item,
        agent,
        tags: ["sub-agent"],
        lastResponse: true,
      });
for (const content of [
  "plain",
  "<summary> </summary>",
  "<SUMMARY>UPPER</SUMMARY>",
  "<conversation_history_summary>body</conversation_history_summary>",
  "<summary>body</summary>",
])
  for (const tags of [[], ["custom"], ["sub-agent"], ["plugin"]])
    await compare(definitions[0], {
      agent: "compact",
      tags,
      item: { type: "message", role: "assistant", content },
      session: { meta: { compactType: "pre-message-auto" } },
    });
for (const text of [
  "hello",
  '<TEAMMATE-MESSAGE from="a">x</TEAMMATE-MESSAGE>',
  "<teammate-messageboard>x",
  "<cb_summary>x</cb_summary>",
  "Please continue with the summarized context above.",
])
  for (const parent of ["self", "missing", "cycle", "previous", null])
    for (const custom of [false, true])
      await compare(definitions[1], {
        item: {
          id: "self",
          type: "message",
          role: "user",
          content: text,
          parentId: parent,
          providerData: custom ? { isCompactInternal: true } : {},
        },
        history: [
          { id: "previous", type: "message", role: "user", content: "old" },
          {
            id: "cycle",
            parentId: "self",
            type: "message",
            role: "assistant",
            content: "cycle",
          },
          { id: "custom", type: "topic" },
        ],
      });
for (const args of [
  "{",
  "null",
  "[]",
  "1",
  '"str"',
  "{}",
  '{"path":"/project/deep/work/a"}',
  '{"url":"see https://a.test/a. and https://b.test"}',
  '{"flag":true,"n":2,"object":{},"nil":null,"empty":""}',
])
  for (const renderer of [
    undefined,
    { displayProperties: [{ name: "path", type: "path" }] },
    { displayProperties: [{ name: "url", type: "url" }] },
    { displayProperties: [] },
    { formatText: () => "" },
  ])
    await compare(definitions[2], {
      item: { type: "function_call", name: "Read", arguments: args },
      renderer,
    });
for (const params of [
  { name: "saved" },
  { scriptPath: "owned.js" },
  { script: "inline", name: "saved" },
  { name: "saved", script: " " },
  null,
])
  for (const workflowError of [false, true])
    await compare(definitions[2], {
      item: {
        type: "function_call",
        name: "DeferExecuteTool",
        arguments: JSON.stringify({ toolName: "Workflow", params }),
      },
      workflowError,
    });
for (const plan of [undefined, "", "plan contents"])
  for (const planError of [false, true])
    for (const type of ["function_call", "function_call_result"])
      await compare(definitions[5], {
        item: {
          type,
          name: "ExitPlanMode",
          providerData: { toolResult: { renderer: { type: "text" } } },
        },
        plan,
        planError,
        session: { meta: { planFilePath: "owned-plan" } },
      });
for (const output of [
  "not json",
  "null",
  "[]",
  '[{"type":"image"},{"type":"text","text":"ok"}]',
  '{"type":"image_url"}',
  '[1,null,{"type":"image_url"}]',
])
  for (const supportsImages of [false, true])
    for (const state of [false, true])
      await compare(definitions[6], {
        input: state
          ? {
              history: [
                { type: "function_call_result", output: { text: output } },
              ],
            }
          : [
              {
                type: "message",
                role: "user",
                content: [
                  { type: "input_text", text: "x" },
                  { type: "input_image", image: "data:own" },
                ],
              },
              { type: "function_call_result", output: { text: output } },
            ],
        supportsImages,
      });
const blob = {
  type: "image_blob_ref",
  blob_id: "a".repeat(64),
  source: "owned",
};
for (const rounds of [undefined, 0, 1, 2, -1])
  for (const rehydrateError of [false, true])
    await compare(definitions[7], {
      input: [
        { type: "message", role: "user", content: [blob] },
        {
          type: "function_call_result",
          providerData: { toolResult: { content: [blob] } },
          output: { text: JSON.stringify([blob]) },
        },
      ],
      rounds,
      rehydrateError,
    });
await compare(definitions[7], { input: ordinary });
await compare(definitions[7], { input: { history: ordinary } });
await compare(definitions[7], {
  input: [{ type: "function_call_result", output: JSON.stringify(blob) }],
  settingError: true,
});
for (const input of [
  [
    {
      type: "message",
      role: "user",
      content: [{ type: "input_image", image: "data:own", detail: "high" }],
    },
  ],
  { history: ordinary },
])
  for (const sameImage of [false, true])
    for (const compressError of [false, true])
      await compare(definitions[8], { input, sameImage, compressError });
for (const family of ["InputItemUtils", "SummaryUtils", "PathUtils"])
  for (const key of Object.getOwnPropertyNames(nativeUtilities[family])) {
    if (
      typeof nativeUtilities[family][key] !== "function" ||
      key === "getWorkDir"
    )
      continue;
    const values =
      family === "PathUtils"
        ? [
            "/project/deep/work/a",
            "/owned/home/a",
            "/elsewhere/.config/a",
            "/x",
            "relative/file",
          ]
        : family === "SummaryUtils"
          ? [
              "<summary>x</summary>",
              "<SUMMARY>x</SUMMARY>",
              "<summary> </summary>",
              "<conversation_history_summary>x</conversation_history_summary>",
              "plain",
              null,
              [],
            ]
          : ordinary;
    for (const value of values)
      equal(
        await caught(() => utilities[family][key](value)),
        await caught(() => nativeUtilities[family][key](value)),
        family + "." + key,
      );
  }
// Native six-processor sequence, deliberately constructed in shuffled order.
const a = fixture({
    item: { type: "function_call", name: "Read", arguments: '{"path":"x"}' },
  }),
  b = fixture({
    item: { type: "function_call", name: "Read", arguments: '{"path":"x"}' },
  }),
  ports: any[] = [],
  natives: any[] = [];
for (const def of definitions.slice(0, 6).reverse()) {
  const [, Port, start, end] = def;
  ports.push(new Port(a.deps));
  const Native = runInNewContext("(" + source.slice(start, end) + ")", globals);
  const n = new Native();
  Object.assign(n, b.deps);
  natives.push(n);
}
await new AgentInputItemPipeline(ports).process(a.item, a.session);
for (const entry of nativeSort(natives))
  await entry.value.process(b.item, b.session);
equal(a.item, b.item, "pipeline native sequence");
equal(a.calls, b.calls, "pipeline service order");
for (const priorities of [
  [0, -1, 4, 10, NaN],
  [8, 8, 0, 6],
  [Infinity, 10, 7, 0],
]) {
  const observed: number[] = [],
    p = new AgentInputItemPipeline(
      priorities.map((priority, index) => ({
        priority,
        process() {
          observed.push(index);
        },
      })),
    );
  await p.process(a.item, a.session);
  equal(
    observed,
    nativeSort(priorities.map((priority, index) => ({ priority, index }))).map(
      (entry: any) => entry.value.index,
    ),
    "native provider filter/order",
  );
}
equal(AgentInputItemProcessorPriority, nativePriority, "native priority enum");
const redactorStart = source.indexOf("function redactPowerShellCommand("),
  redactorEnd = source.indexOf(
    "function wrapPowerShellCommandForExitCode(",
    redactorStart,
  );
const nativeRedactor = runInNewContext(
  "(" + source.slice(redactorStart, redactorEnd) + ")",
);
let metadataCount = 0;
const nativeRenderers: Record<string, any> = {};
for (const c of classes) {
  let renderer: any, name: any;
  function collect(n: any) {
    if (!n || typeof n !== "object") return;
    if (
      n.type === "AssignmentExpression" &&
      n.left.type === "MemberExpression" &&
      n.left.object.type === "ThisExpression"
    ) {
      if (n.left.property.name === "argumentRenderer") renderer = n.right;
      if (n.left.property.name === "name") name = n.right;
    }
    for (const [k, v] of Object.entries(n))
      if (!["start", "end"].includes(k)) {
        if (Array.isArray(v)) v.forEach(collect);
        else if (v && typeof v === "object") collect(v);
      }
  }
  collect(c);
  if (!renderer) continue;
  const key =
    name?.type === "Literal"
      ? name.value
      : source.match(
          new RegExp("eA\\." + name.property.name + '="([^"]+)"'),
        )?.[1];
  assert.ok(key);
  nativeRenderers[key] = runInNewContext(
    "(" + source.slice(renderer.start, renderer.end) + ")",
    { c9: { redactPowerShellCommand: nativeRedactor }, JSON },
  );
}
equal(
  Object.keys(nativeToolArgumentRenderers).sort(),
  Object.keys(nativeRenderers).sort(),
  "native renderer key set",
);
for (const [name, renderer] of Object.entries(nativeToolArgumentRenderers)) {
  const native = nativeRenderers[name];
  assert.ok(native, name);
  equal(
    renderer.displayProperties,
    native.displayProperties,
    name + " displayProperties",
  );
  for (const input of [
    {},
    { command: 'echo "own-secret" | cli --token-stdin' },
    { command: '$env:BUDDY_CLOUD_TOKEN="own-secret"; cli -Token own-secret' },
    { queries: ["a", "", 2], tool_names: ["Read"], top_k: 5 },
    { name: "saved", scriptPath: "owned.js" },
    { cron: "* * * * *", prompt: "x".repeat(80) },
    null,
  ])
    equal(
      await caught(() => renderer.formatText?.(input)),
      await caught(() => native.formatText?.(input)),
      name + " formatText",
    );
  metadataCount++;
}
assert.equal(metadataCount, 37);
for (const text of [
  'echo "secret" | buddy --token-stdin',
  "echo -n 'secret' | buddy --token-stdin",
  '$env:BUDDY_CLOUD_TOKEN = "secret"; cli -Token secret',
  "BUDDY_CLOUD_TOKEN=secret",
  "ordinary",
])
  equal(
    redactPowerShellCommand(text),
    nativeRedactor(text),
    "PowerShell redact",
  );
const NativeTimestampManager = runInNewContext(
  "(" +
    methods(10956732, [
      "readTimestamp",
      "setTimestamp",
      "ensureHistoryItemTimestamp",
      "stampModelStreamEventTimestamp",
      "stampModelHistoryItemTimestamp",
    ]) +
    ")",
);
const nativeTimestamps = new NativeTimestampManager(),
  portTimestamps = new SessionManager();
for (const value of [0, -1, 42, NaN, Infinity, "invalid", undefined]) {
  equal(
    portTimestamps.readTimestamp({ timestamp: value }),
    nativeTimestamps.readTimestamp({ timestamp: value }),
    "timestamp reader",
  );
  const itemA: any = { timestamp: value },
    itemB: any = { timestamp: value };
  equal(
    portTimestamps.ensureHistoryItemTimestamp(itemA, 789),
    nativeTimestamps.ensureHistoryItemTimestamp(itemB, 789),
    "timestamp ensure",
  );
  equal(itemA, itemB, "timestamp mutation");
}
for (const value of [undefined, null, 1, "text", {}, []]) {
  const itemA = structuredClone(value),
    itemB = structuredClone(value);
  equal(
    portTimestamps.setTimestamp(itemA, 123),
    nativeTimestamps.setTimestamp(itemB, 123),
    "timestamp setter result",
  );
  equal(itemA, itemB, "timestamp setter mutation");
}
for (const value of [0, -1, 42]) {
  equal(
    portTimestamps.stampModelStreamEventTimestamp({ timestamp: value }),
    nativeTimestamps.stampModelStreamEventTimestamp({ timestamp: value }),
    "stream timestamp",
  );
  equal(
    portTimestamps.stampModelHistoryItemTimestamp({ timestamp: value }),
    nativeTimestamps.stampModelHistoryItemTimestamp({ timestamp: value }),
    "history timestamp",
  );
}
console.log(
  `History/input pipeline differential passed: ${comparisons} comparisons; fixed bundle SHA-256; six processors, three image interceptors, ${metadataCount} tool renderers and native helper subsets; no external I/O.`,
);

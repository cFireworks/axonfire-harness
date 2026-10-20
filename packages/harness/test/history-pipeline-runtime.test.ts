import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Usage, setTraceProcessors, type Model } from "@openai/agents-core";
import {
  AgentInputItemPipeline,
  AgentInputItemProcessorPriority as Priority,
} from "../src/sessions/input-item-pipeline.js";
import { DefaultInputItemProcessor } from "../src/sessions/default-input-item-processor.js";
import { ParentIdLinkageProcessor } from "../src/sessions/parent-id-linkage-processor.js";
import { FunctionCallAgentInputItemProcessor } from "../src/sessions/function-call-agent-input-item-processor.js";
import { FunctionCallResultAgentInputItemProcessor } from "../src/sessions/function-call-result-processor.js";
import { UsageAgentInputItemProcessor } from "../src/sessions/usage-agent-input-item-processor.js";
import { ExitPlanModeToolCallProcessor } from "../src/sessions/exit-plan-mode-tool-call-processor.js";
import { createInputProcessorUtilities } from "../src/sessions/input-processor-utils.js";
import { SessionManager } from "../src/sessions/session-manager.js";
import { HarnessSession } from "../src/sessions/session.js";
import { ImageFilterAgentRunInterceptor } from "../src/agents/image-filter-agent-run-interceptor.js";
import { ImageRehydrationAgentRunInterceptor } from "../src/agents/image-rehydration-agent-run-interceptor.js";
import { ImageCompressionAgentRunInterceptor } from "../src/agents/image-compression-agent-run-interceptor.js";
import {
  nativeToolArgumentRenderers,
  redactPowerShellCommand,
} from "../src/tools/native-argument-renderers.js";
import { createHarness } from "../src/runtime/create-harness.js";
setTraceProcessors([]);
const logger = {
  info(..._v: any[]) {},
  warn(..._v: any[]) {},
  debug(..._v: any[]) {},
  setContext(..._v: any[]) {},
};
const user = (id: string, text = "hello"): any => ({
  id,
  type: "message",
  role: "user",
  content: [{ type: "input_text", text }],
});
const assistant = (text: string): any => ({
  type: "message",
  role: "assistant",
  content: [{ type: "output_text", text }],
});

test("native input priorities and pipeline await order retain failure short circuit", async () => {
  assert.equal(Priority.Default, 10);
  assert.equal(Priority.ExitPlanMode, 4);
  assert.equal(Priority.Telemetry, 5);
  const events: string[] = [],
    session = new HarnessSession("s");
  const pipeline = new AgentInputItemPipeline([
    {
      priority: 0,
      async process() {
        events.push("disabled-zero");
      },
    },
    {
      priority: -1,
      async process() {
        events.push("disabled-negative");
      },
    },
    {
      priority: 4,
      async process() {
        events.push("last");
      },
    },
    {
      priority: 10,
      async process() {
        await Promise.resolve();
        events.push("first");
      },
    },
    {
      priority: 8,
      async process() {
        events.push("throw");
        throw Error("stop");
      },
    },
  ]);
  await assert.rejects(pipeline.process(user("u"), session), /stop/);
  assert.deepEqual(events, ["first", "throw"]);
});
test("Default processor preserves custom records and native result-only agent attribution", async () => {
  let reads = 0;
  const p = new DefaultInputItemProcessor({
      now: () => 123,
      generateUUUID: () => "owned-uuid",
      productManager: {
        async waitConfiguration() {
          reads++;
          return {
            agents: [{ name: "Explore", tags: ["sub-agent"], color: "cyan" }],
          };
        },
      },
    }),
    s = new HarnessSession("s", { agentName: "cli" });
  const custom: any = { type: "topic" };
  await p.process(custom, s);
  assert.deepEqual(custom, { type: "topic" });
  const first: any = {
    type: "message",
    role: "user",
    content: "hi",
    id: "FAKE_ID",
    timestamp: 0,
  };
  await p.process(first, s);
  assert.equal(first.id, "owned-uuid");
  assert.equal(first.timestamp, 123);
  assert.equal(first.sessionId, "s");
  assert.equal(first.providerData.agent, undefined);
  assert.equal(reads, 0);
  s.resultSubject.next({ lastAgent: { name: "Explore" } });
  await p.process(first, s);
  assert.deepEqual(first.providerData, {
    agent: "Explore",
    isSubAgent: true,
    agentColor: "cyan",
  });
});
test("compact summary metadata retains source envelope/case and whitespace quirks", async () => {
  const p = new DefaultInputItemProcessor({
      productManager: {
        async waitConfiguration() {
          return { agents: [] };
        },
      },
    }),
    s = new HarnessSession("s");
  s.resultSubject.next({ lastAgent: { name: "compact" } });
  s.meta.compactType = "pre-message-auto";
  for (const text of [
    "<summary>body</summary>",
    "<SUMMARY>body</SUMMARY>",
    "<conversation_history_summary>body</conversation_history_summary>",
  ]) {
    const item = assistant(text);
    await p.process(item, s);
    assert.equal(item.providerData.isSummary, true);
    assert.equal(item.providerData.compactType, "pre-message-auto");
  }
  const empty = assistant("<summary> </summary>");
  await p.process(empty, s);
  assert.equal(empty.providerData.isSummary, undefined);
  const util = createInputProcessorUtilities();
  assert.equal(
    util.SummaryUtils.extractCompactSummaryFromText("<SUMMARY>body</SUMMARY>"),
    "<SUMMARY>body</SUMMARY>",
  );
});
test("Parent linkage repairs self/missing/cyclic replay parents without globally repairing ordinary parents", async () => {
  const p = new ParentIdLinkageProcessor(),
    s = new HarnessSession("s");
  s.history = [
    user("previous"),
    { ...assistant("loop"), id: "loop", parentId: "self" },
  ] as any;
  s.lastMessageId = "previous";
  const compact = user("self", "<cb_summary>history</cb_summary>");
  compact.parentId = "loop";
  await p.process(compact, s);
  assert.equal(compact.parentId, undefined);
  assert.equal(compact.logicalParentId, "previous");
  assert.equal(s.lastMessageId, "self");
  assert.equal(s.lastUserMessageId, undefined);
  const normal = user("normal");
  normal.parentId = "missing";
  await p.process(normal, s);
  assert.equal(normal.parentId, "missing");
  assert.equal(s.lastUserMessageId, "normal");
  const teammate = user(
    "team",
    '<TEAMMATE-MESSAGE from="a">x</TEAMMATE-MESSAGE>',
  );
  teammate.parentId = "missing";
  await p.process(teammate, s);
  assert.equal(teammate.parentId, "loop");
  assert.equal(s.lastUserMessageId, "normal");
});
test("child detection follows native storeId inequality rather than meta.parentSessionId", async () => {
  const p = new ParentIdLinkageProcessor(),
    main = new HarnessSession("main");
  main.meta.parentSessionId = "other";
  await p.process(user("u"), main);
  assert.equal(main.lastUserMessageId, "u");
  const child = new HarnessSession("runtime-child", {
    storeId: "agent-persisted",
  });
  await p.process(user("c"), child);
  assert.equal(child.lastUserMessageId, undefined);
});
test("FunctionCall renderer preserves single-property errors, primitive values and path/URL rendering", async () => {
  const p = new FunctionCallAgentInputItemProcessor({
    utilities: createInputProcessorUtilities(
      () => "/project/a/b",
      () => "/owned/home",
    ),
  });
  assert.equal(
    p.parseDisplayText(
      { file_path: "/project/a/b/file" },
      { displayProperties: [{ name: "file_path", type: "path" }] },
    ),
    "file",
  );
  assert.equal(
    p.parseDisplayText(
      { url: "see https://example.test/a." },
      { displayProperties: [{ name: "url", type: "url" }] },
    ),
    "https://example.test/a",
  );
  assert.throws(
    () => p.parseDisplayText({}, { displayProperties: [{ name: "missing" }] }),
    TypeError,
  );
  assert.equal(
    p.parseDisplayText({ a: true, b: 2, c: {}, d: null, e: "" }),
    "a: true, b: 2",
  );
  assert.equal(p.parseDisplayText([], undefined), undefined);
  assert.equal(p.parseDisplayText({}, { formatText: () => "" }), "");
});
test("FunctionCall marks SyntaxError only and conditionally preloads saved Workflow source", async () => {
  const calls: any[] = [],
    p = new FunctionCallAgentInputItemProcessor({
      toolManager: {
        async get() {
          return {};
        },
      },
      workflowSourceResolver: {
        async resolve(params: any) {
          calls.push(params);
          return { text: "owned-source" };
        },
      },
      logger,
    });
  const bad: any = { type: "function_call", name: "Read", arguments: "{" };
  await p.process(bad);
  assert.equal(bad.providerData.discard, true);
  const nullArgs: any = {
    type: "function_call",
    name: "Read",
    arguments: "null",
  };
  await p.process(nullArgs);
  assert.equal(nullArgs.providerData.discard, undefined);
  const item: any = {
    type: "function_call",
    name: "DeferExecuteTool",
    arguments: JSON.stringify({
      toolName: "Workflow",
      params: { name: "saved" },
    }),
  };
  await p.process(item);
  assert.equal(item.providerData.workflowSourceText, "owned-source");
  assert.equal(calls.length, 1);
  item.arguments = JSON.stringify({
    toolName: "Workflow",
    params: { name: "saved", script: "inline" },
  });
  delete item.providerData.workflowSourceText;
  await p.process(item);
  assert.equal(calls.length, 1);
  assert.equal(item.providerData.workflowSourceText, undefined);
});
test("Usage processor attaches latest response usage once by marker or item identity", async () => {
  const p = new UsageAgentInputItemProcessor(),
    s = new HarnessSession("s"),
    item: any = {
      type: "reasoning",
      providerData: { _isLastResponseItem: true },
    };
  s.resultSubject.next({
    rawResponses: [
      {
        output: [],
        usage: { inputTokens: 3, outputTokens: 2, totalTokens: 5 },
      },
    ],
  });
  await p.process(item, s);
  assert.equal(s.usage.totalTokens, 5);
  assert.equal(item.providerData._isLastResponseItem, undefined);
  await p.process(item, s);
  assert.equal(s.usage.totalTokens, 5);
});
test("ExitPlanMode snapshots plan text and preserves source warning/error wording", async () => {
  const s = new HarnessSession("s");
  s.meta.planFilePath = "owned-plan";
  const p = new ExitPlanModeToolCallProcessor({
    planStorageService: { syncRead: () => "plan" },
    consoleManager: logger,
  });
  const item: any = { type: "function_call", name: "ExitPlanMode" };
  await p.process(item, s);
  assert.equal(item.providerData.toolResult.content, "plan");
  assert.deepEqual(s.meta.plans, { "owned-plan": "plan" });
  p.planStorageService.syncRead = () => undefined;
  await p.process(item, s);
  assert.equal(
    item.providerData.toolResult.content,
    "Plan mode exited. Warning: Plan file was not found or empty.",
  );
});
test("SessionManager pipeline publishes repaired metadata before observers and recovers after failure", async () => {
  const p = new ParentIdLinkageProcessor(),
    pipeline = new AgentInputItemPipeline([new DefaultInputItemProcessor(), p]),
    manager = new SessionManager(undefined, undefined, {
      inputItemPipeline: pipeline,
    }),
    s = await manager.create();
  const seen: any[] = [];
  s.inputSubject.subscribe((i) => seen.push(structuredClone(i)));
  await manager.addHistory(s, user("u"));
  assert.equal(seen[0].sessionId, s.id);
  assert.equal(s.lastUserMessageId, "u");
  assert.equal(manager.ensureHistoryItemTimestamp({ timestamp: 0 }, 123), 0);
  assert.equal(
    manager.ensureHistoryItemTimestamp({ timestamp: Infinity }, 123),
    123,
  );
  pipeline.processors.unshift({
    priority: 99,
    process() {
      throw Error("processor");
    },
  });
  await assert.rejects(manager.addHistory(s, user("bad")), /processor/);
  assert.equal(s.history.length, 1);
  pipeline.processors.shift();
  await manager.addHistory(s, user("later"));
  assert.equal((s.history.at(-1) as any).parentId, "u");
});
test("native image filter handles RunState history, unsupported models, image-only and malformed JSON results", async () => {
  const p = new ImageFilterAgentRunInterceptor({
      productManager: {
        async waitConfiguration() {
          return { models: [{ id: "no-images", supportsImages: false }] };
        },
      },
      logger,
    }),
    image: any = {
      type: "function_call_result",
      output: { text: '[{"type":"image_url"}]' },
    },
    message = user("u");
  message.content.push({ type: "input_image", image: "data:owned" });
  const context: any = {
    agent: { model: "no-images" },
    input: { history: [message, image] },
  };
  await p.intercept(context);
  assert.equal(message.content.length, 1);
  assert.equal(
    JSON.parse(image.output.text).text,
    "[Image content filtered - current model does not support images]",
  );
  image.output.text = "{";
  await p.intercept(context);
  assert.equal(image.output.text, "{");
});
test("rehydration tracks native blob references before processing and leaves settings errors outside catch", async () => {
  const events: any[] = [],
    blob = { type: "image_blob_ref", blob_id: "a".repeat(64), source: "owned" },
    p = new ImageRehydrationAgentRunInterceptor({
      imageBlobService: {
        resetImageTracking: () => events.push("reset"),
        isImageBlobRef: (v: any) => v?.type === "image_blob_ref",
        trackImageDelivered: (...v: any[]) => events.push(v),
        processHistoryForApi: async (input: any, rounds: any) => {
          events.push(rounds);
          return input;
        },
      },
      settingsManager: {
        async get() {
          return 0;
        },
      },
      logger,
    });
  await p.intercept({
    input: [
      {
        type: "function_call_result",
        providerData: { toolResult: { content: [blob] } },
        output: JSON.stringify(blob),
      },
    ],
  });
  assert.equal(events[0], "reset");
  assert.deepEqual(events[1], [blob.blob_id, "owned"]);
  assert.deepEqual(events[2], [blob.blob_id, "owned"]);
  assert.equal(events[3], 0);
  p.settingsManager.get = async () => {
    throw Error("settings failed");
  };
  await assert.rejects(
    p.intercept({
      input: [{ type: "message", role: "user", content: [blob] }],
    }),
    /settings failed/,
  );
});
test("compression preserves input block fields, skips same bytes and tolerates dependency failure", async () => {
  const p = new ImageCompressionAgentRunInterceptor({
      imageUtils: {
        getImageCompressionMaxDimension: () => 2048,
        compressImage: async () => "data:small",
      },
      logger,
    }),
    block: any = {
      type: "input_image",
      image: "data:big",
      source: "own",
      detail: "high",
    },
    message: any = { type: "message", role: "user", content: [block] };
  await p.intercept({ input: [message] });
  assert.deepEqual(message.content[0], { ...block, image: "data:small" });
  p.imageUtils.compressImage = async () => {
    throw Error("codec missing");
  };
  await p.intercept({ input: [message] });
  assert.equal(message.content[0].image, "data:small");
});
test("37 native tool renderers retain custom formatters and PowerShell token redaction", () => {
  assert.equal(Object.keys(nativeToolArgumentRenderers).length, 37);
  assert.equal(
    nativeToolArgumentRenderers.Workflow?.formatText?.({ name: "saved" }),
    "saved workflow: saved",
  );
  assert.equal(
    nativeToolArgumentRenderers.CronCreate?.formatText?.({
      cron: "*",
      prompt: "x".repeat(70),
    }),
    "*: " + "x".repeat(60),
  );
  const result = redactPowerShellCommand(
    'echo "owned-secret" | cli --token-stdin; $env:BUDDY_CLOUD_TOKEN="other"; cli -Token third',
  );
  assert.doesNotMatch(result, /owned-secret|other|third/);
  assert.match(result, /REDACTED/);
});
async function owned(t: any) {
  const d = await mkdtemp(join(tmpdir(), "harness-history-"));
  t.after(() => rm(d, { recursive: true, force: true }));
  return d;
}
function modelFor(factory: (request: any, n: number) => any[]): Model {
  let count = 0;
  return {
    async getResponse() {
      return { output: [], usage: new Usage() };
    },
    async *getStreamedResponse(request) {
      const output = factory(request, ++count);
      yield { type: "response_started" };
      yield {
        type: "response_done",
        response: {
          id: "owned-" + count,
          usage: { inputTokens: 2, outputTokens: 1, totalTokens: 3 },
          output,
        },
      } as any;
    },
  };
}
test("real SDK async pipeline records native Read display before execution and persists metadata", async (t) => {
  const d = await owned(t),
    file = join(d, "owned.txt");
  await writeFile(file, "owned text");
  const model = modelFor((_request, n) =>
    n === 1
      ? [
          {
            type: "function_call",
            callId: "read-call",
            id: "read-call",
            name: "Read",
            arguments: JSON.stringify({ file_path: file }),
            status: "completed",
          },
        ]
      : [{ ...assistant("done"), id: "answer", status: "completed" }],
  );
  const harness = await createHarness({
    workDir: d,
    modelProvider: { getModel: () => model },
    approveTool: () => true,
  });
  t.after(() => harness.close());
  const s = await harness.openSession();
  assert.equal(await harness.prompt(s, "read own file"), "done");
  const call: any = s.history.find(
    (i: any) => i.callId === "read-call" && i.type === "function_call",
  );
  assert.equal(call.providerData.argumentsDisplayText, "owned.txt");
  assert.equal(s.usage.totalTokens, 6);
  const text = await readFile(harness.sessions.getSessionFilePath(s)!, "utf8");
  assert.match(text, /argumentsDisplayText/);
});
test("standalone saved Workflow preloading uses owned registry without executing script", async (t) => {
  const d = await owned(t),
    file = join(d, "owned-workflow.js");
  await writeFile(file, 'export async function run() { return "owned"; }');
  const h = await createHarness({
    workDir: d,
    modelProvider: { getModel: () => modelFor(() => []) },
  });
  t.after(() => h.close());
  const s = await h.openSession(),
    item: any = {
      type: "function_call",
      name: "DeferExecuteTool",
      callId: "preload",
      arguments: JSON.stringify({
        toolName: "Workflow",
        params: { scriptPath: file },
      }),
    };
  await h.sessions.addHistory(s, item);
  assert.match(item.providerData.workflowSourceText, /return "owned"/);
  assert.equal(item.providerData.argumentsDisplayText, "Workflow");
});
test("real SDK receives filtered input after native model interceptor and image filter", async (t) => {
  const d = await owned(t),
    requests: any[] = [],
    model = modelFor((request) => {
      requests.push(request);
      return [{ ...assistant("filtered"), id: "answer", status: "completed" }];
    }),
    h = await createHarness({
      workDir: d,
      modelProvider: { getModel: () => model },
    });
  t.after(() => h.close());
  for (const m of h.product.raw.models) m.supportsImages = false;
  const s = await h.openSession(),
    item = user("image-user");
  item.content.push({
    type: "input_image",
    image: "data:image/png;base64,b3duZWQ=",
  });
  assert.equal(await h.prompt(s, [item]), "filtered");
  assert.ok(requests.length);
  assert.doesNotMatch(JSON.stringify(requests[0].input), /input_image/);
});

test("real SDK optional image host preserves native compression-before-rehydration order", async (t) => {
  const d = await owned(t),
    events: string[] = [],
    requests: any[] = [],
    blob = { type: "image_blob_ref", blob_id: "a".repeat(64), source: "owned" },
    model = modelFor((request) => {
      requests.push(request);
      return [{ ...assistant("images"), id: "answer", status: "completed" }];
    });
  const h = await createHarness({
    workDir: d,
    modelProvider: { getModel: () => model },
    imageHistory: {
      imageUtils: {
        getImageCompressionMaxDimension: () => 2048,
        async compressImage() {
          events.push("compress");
          return "data:image/png;base64,Y29tcHJlc3NlZA==";
        },
      },
      blobService: {
        async storeFromDataUri() {
          events.push("store");
          return blob;
        },
        resetImageTracking() {
          events.push("reset");
        },
        isImageBlobRef(v: any) {
          return v?.type === "image_blob_ref";
        },
        trackImageDelivered() {
          events.push("track");
        },
        async processHistoryForApi(input) {
          events.push("rehydrate");
          return input.map((item) =>
            item.type === "message" &&
            item.role === "user" &&
            Array.isArray(item.content)
              ? {
                  ...item,
                  content: item.content.map((part: any) =>
                    part.type === "image_blob_ref"
                      ? {
                          type: "input_image",
                          image: "data:image/png;base64,cmVzdG9yZWQ=",
                        }
                      : part,
                  ),
                }
              : item,
          );
        },
      },
    },
  });
  t.after(() => h.close());
  for (const m of h.product.raw.models) m.supportsImages = true;
  const s = await h.openSession(),
    input = user("own-images");
  input.content.push(
    { type: "input_image", image: "data:image/png;base64,b3du" },
    blob,
  );
  assert.equal(await h.prompt(s, [input]), "images");
  assert.ok(events.includes("store"));
  assert.ok(events.indexOf("compress") < events.indexOf("rehydrate"));
  assert.match(JSON.stringify(requests[0].input), /Y29tcHJlc3NlZA==/);
  assert.match(JSON.stringify(requests[0].input), /cmVzdG9yZWQ=/);
  assert.doesNotMatch(JSON.stringify(requests[0].input), /image_blob_ref/);
});

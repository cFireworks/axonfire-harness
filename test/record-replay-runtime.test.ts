import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, readFile, writeFile, rm, stat } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { Usage, setTraceProcessors, type Model } from "@openai/agents-core";
import {
  RecordingStoreImpl,
  type RecordingEntry,
} from "../src/replay/recording-store.js";
import {
  RecordingModel,
  ReplayModel,
  RecordReplayModelProvider,
  ReplayExhaustedError,
  ReplayTypeMismatchError,
} from "../src/replay/record-replay-model.js";
import {
  ENV_RECORD_DIR,
  ENV_REPLAY_DIR,
  ENV_REPLAY_STRICT,
  REPLAY_ENV_KEYS,
  getRecordReplayMode,
} from "../src/replay/record-replay-config.js";
import { createHarness } from "../src/runtime/create-harness.js";
setTraceProcessors([]);
async function directory(t: { after(fn: () => any): void }) {
  const root = await mkdtemp(join(tmpdir(), "harness-replay-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}
async function entries(root: string): Promise<RecordingEntry[]> {
  return (await readFile(join(root, "recording.jsonl"), "utf8"))
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line));
}
async function seed(root: string, values: unknown[]) {
  await writeFile(
    join(root, "recording.jsonl"),
    values.map((value) => JSON.stringify(value)).join("\n") + "\n",
  );
}
const request = {
  input: "question",
  modelSettings: {},
  tools: [],
  outputType: { type: "text" },
  handoffs: [],
} as any;
const final = (text: string) => ({
  type: "message",
  id: "answer",
  role: "assistant",
  status: "completed",
  content: [{ type: "output_text", text }],
});
const response = (text: string) => ({
  output: [final(text)],
  usage: new Usage(),
  responseId: "response",
});
test("record/replay mode uses raw env truthiness, rejects both and provider captures mode once", async () => {
  assert.equal(getRecordReplayMode({ [ENV_RECORD_DIR]: "" }), "passthrough");
  assert.equal(getRecordReplayMode({ [ENV_REPLAY_DIR]: "0" }), "replay");
  assert.throws(
    () => getRecordReplayMode({ [ENV_RECORD_DIR]: "r", [ENV_REPLAY_DIR]: "p" }),
    /mutually exclusive/,
  );
  const env: NodeJS.ProcessEnv = {},
    original = { marker: "original" },
    provider = new RecordReplayModelProvider(
      { getModel: () => original as any },
      {} as any,
      undefined,
      env,
    );
  env[ENV_REPLAY_DIR] = "later";
  assert.equal(await provider.getModel("model"), original);
});
test("record store initializes lazily, truncates old file, writes five-key metadata and close does not re-open", async (t) => {
  const root = await directory(t);
  await writeFile(join(root, "recording.jsonl"), "old recording");
  const env = {
      [ENV_RECORD_DIR]: root,
      [REPLAY_ENV_KEYS[0]!]: "1",
      [REPLAY_ENV_KEYS[1]!]: "0",
      [REPLAY_ENV_KEYS[2]!]: "",
      NOT_REPLAY_KEY: "private",
    },
    store = new RecordingStoreImpl(env);
  assert.equal(store.initialized, false);
  assert.equal(store.nextTurnId(), 0);
  assert.equal(
    await readFile(join(root, "recording.jsonl"), "utf8"),
    "old recording",
  );
  store.writeEntry({ type: "request", turnId: 0 });
  const values = await entries(root);
  assert.equal(values[0]!.type, "metadata");
  assert.equal(values[0]!.version, 1);
  assert.deepEqual(values[0]!.replayEnv, {
    [REPLAY_ENV_KEYS[0]!]: "1",
    [REPLAY_ENV_KEYS[1]!]: "0",
  });
  assert.equal(values[1]!.turnId, 0);
  store.close();
  store.writeEntry({ type: "ignored" });
  assert.equal((await entries(root)).length, 2);
  assert.equal(store.initialized, true);
});
test("replay loader infers missing model names by last request, preserves physical order and restores only unset env", async (t) => {
  const root = await directory(t);
  await seed(root, [
    {
      type: "metadata",
      version: 900,
      replayEnv: {
        keep: "old",
        empty: "restore",
        arbitrary: "source-restores-any-key",
      },
    },
    { type: "request", turnId: 0, modelName: "first" },
    { type: "response", turnId: 0, response: { id: "first physical" } },
    { type: "request", turnId: 0, modelName: "last" },
    { type: "response", turnId: 3, modelName: "explicit", response: {} },
    { type: "response", turnId: 0, response: { id: "second physical" } },
    { type: "stream_response", turnId: 5, events: [] },
  ]);
  const env: NodeJS.ProcessEnv = {
      [ENV_REPLAY_DIR]: root,
      keep: "current",
      empty: "",
    },
    store = new RecordingStoreImpl(env);
  assert.deepEqual(store.getRecordedModelNames(), [
    "last",
    "explicit",
    "unknown",
  ]);
  assert.equal(store.getResponseCount(), 4);
  assert.equal(env.keep, "current");
  assert.equal(env.empty, "restore");
  assert.equal(env.arbitrary, "source-restores-any-key");
  assert.equal(
    store.consumeNextResponse("last")!.response.id,
    "first physical",
  );
  assert.equal(
    store.consumeNextResponse("last")!.response.id,
    "second physical",
  );
  assert.equal(store.getResponseCount(), 4);
});
test("fallback picks largest remaining queue with insertion-order ties, but never falls back for exhausted known model", async () => {
  const store = new RecordingStoreImpl({});
  store.initialized = true;
  store.modelQueues.set("a", [{ type: "response", response: "a1" }]);
  store.modelQueues.set("b", [
    { type: "response", response: "b1" },
    { type: "response", response: "b2" },
  ]);
  assert.equal(store.peekNextResponse("new")!.response, "b1");
  assert.equal(store.peekNextResponse("new")!.response, "b1");
  assert.equal(store.consumeNextResponse("new")!.response, "b1");
  assert.equal(store.consumeNextResponse("new")!.response, "a1");
  assert.equal(store.consumeNextResponse("a"), undefined);
  assert.equal(store.consumeNextResponse("new")!.response, "b2");
  assert.equal(store.consumeNextResponse("new"), undefined);
});
test("missing/malformed recordings fail once after initialized flag is set; subsequent reads do not retry", async (t) => {
  const root = await directory(t),
    missing = new RecordingStoreImpl({ [ENV_REPLAY_DIR]: root });
  assert.throws(() => missing.getResponseCount(), /Recording file not found/);
  assert.equal(missing.initialized, true);
  await seed(root, [{ type: "response", modelName: "model", response: {} }]);
  assert.equal(missing.getResponseCount(), 0);
  await writeFile(
    join(root, "recording.jsonl"),
    '{"type":"metadata"}\n{truncated',
  );
  const malformed = new RecordingStoreImpl({ [ENV_REPLAY_DIR]: root });
  assert.throws(() => malformed.getRecordedModelNames(), SyntaxError);
  assert.equal(malformed.getRecordedModelNames().length, 0);
});
test("RecordingModel removes only signal, records requests before delegation, and preserves failed-call gaps", async (t) => {
  const root = await directory(t),
    store = new RecordingStoreImpl({ [ENV_RECORD_DIR]: root });
  let calls = 0;
  const model = new RecordingModel(
      {
        async getResponse(value) {
          assert.equal(value.signal, signal);
          assert.equal((await entries(root)).at(-1)!.type, "request");
          if (++calls === 1) throw new Error("model failed");
          return response("answer") as any;
        },
      } as Model,
      "model",
      store,
    ),
    signal = new AbortController().signal,
    input = {
      ...request,
      signal,
      headers: { Authorization: "fixture-sensitive-not-redacted" },
    };
  await assert.rejects(model.getResponse(input), /model failed/);
  await model.getResponse(input);
  const values = await entries(root);
  assert.deepEqual(
    values.map((entry) => entry.type),
    ["metadata", "request", "request", "response"],
  );
  assert.deepEqual(
    values.slice(1).map((entry) => entry.turnId),
    [0, 1, 1],
  );
  assert.equal("signal" in values[1]!.request, false);
  assert.equal(
    values[1]!.request.headers.Authorization,
    "fixture-sensitive-not-redacted",
  );
});
test("stream recording stores event references/offsets only on full consumption; early return and errors leave request only", async (t) => {
  const root = await directory(t),
    store = new RecordingStoreImpl({ [ENV_RECORD_DIR]: root });
  let fail = false;
  const started = { type: "response_started" },
    done = { type: "response_done", response: response("answer") },
    model = new RecordingModel(
      {
        async getResponse() {
          throw new Error("stream-only fixture");
        },
        async *getStreamedResponse() {
          yield started;
          if (fail) throw new Error("stream failed");
          yield done;
        },
      } as unknown as Model,
      "model",
      store,
    );
  for await (const _event of model.getStreamedResponse(request)) break;
  fail = true;
  await assert.rejects(async () => {
    for await (const _event of model.getStreamedResponse(request)) {
    }
  }, /stream failed/);
  fail = false;
  const emitted = [];
  for await (const event of model.getStreamedResponse(request))
    emitted.push(event);
  assert.equal(emitted[0], started);
  const values = await entries(root);
  assert.deepEqual(
    values.map((entry) => entry.type),
    ["metadata", "request", "request", "request", "stream_response"],
  );
  assert.deepEqual(
    values.at(-1)!.events.map((entry: any) => entry.event.type),
    ["response_started", "response_done"],
  );
  assert.ok(values.at(-1)!.events.every((entry: any) => entry.offsetMs >= 0));
});
test("ReplayModel strict only checks model name; nonempty '0' enables strict and mismatch/type errors consume entries", async (t) => {
  const root = await directory(t);
  await seed(root, [
    { type: "response", modelName: "recorded", response: response("first") },
    { type: "stream_response", modelName: "recorded", events: [] },
    { type: "response", modelName: "recorded", response: response("last") },
  ]);
  const store = new RecordingStoreImpl({ [ENV_REPLAY_DIR]: root }),
    model = new ReplayModel("alias", store, { [ENV_REPLAY_STRICT]: "0" });
  await assert.rejects(
    model.getResponse(request),
    /Strict mode: model name mismatch/,
  );
  await assert.rejects(model.getResponse(request), ReplayTypeMismatchError);
  const relaxed = new ReplayModel("alias", store, {});
  assert.equal(
    (await relaxed.getResponse({ ...request, input: "different input" }))
      .output[0]!.type,
    "message",
  );
  await assert.rejects(relaxed.getResponse(request), ReplayExhaustedError);
});
test("concurrent same-model requests share turn IDs but replay responses in completion order, not request order", async (t) => {
  const root = await directory(t),
    store = new RecordingStoreImpl({ [ENV_RECORD_DIR]: root }),
    resolvers = new Map<string, (value: any) => void>();
  const model = new RecordingModel(
    {
      getResponse(input: any) {
        return new Promise((resolve) => resolvers.set(input.input, resolve));
      },
      async *getStreamedResponse() {},
    },
    "same",
    store,
  );
  const first = model.getResponse({ ...request, input: "first" }),
    second = model.getResponse({ ...request, input: "second" });
  resolvers.get("second")!(response("second completed first"));
  await second;
  resolvers.get("first")!(response("first completed second"));
  await first;
  store.close();
  const values = await entries(root);
  assert.deepEqual(
    values.slice(1).map((entry) => [entry.type, entry.turnId]),
    [
      ["request", 0],
      ["request", 1],
      ["response", 1],
      ["response", 0],
    ],
  );
  const replay = new ReplayModel(
      "same",
      new RecordingStoreImpl({ [ENV_REPLAY_DIR]: root }),
      {},
    ),
    result: any = await replay.getResponse({ ...request, input: "first" });
  assert.equal(result.output[0].content[0].text, "second completed first");
});
test("RecordReplay provider delegates passthrough/record and does not access original provider in replay", async (t) => {
  const root = await directory(t),
    logs: string[] = [],
    store = new RecordingStoreImpl({}),
    original: Model = {
      async getResponse() {
        return response("ok") as any;
      },
      async *getStreamedResponse() {},
    },
    provider = new RecordReplayModelProvider(
      { getModel: () => original },
      store,
      { info: (message) => logs.push(message) },
      { [ENV_RECORD_DIR]: root },
    );
  assert.ok((await provider.getModel()) instanceof RecordingModel);
  assert.match(logs[0]!, /wrapping model "unknown"/);
  const replay = new RecordReplayModelProvider(
    {
      getModel() {
        throw new Error("must not resolve network model");
      },
    },
    store,
    undefined,
    { [ENV_REPLAY_DIR]: root },
  );
  assert.ok((await replay.getModel("model")) instanceof ReplayModel);
});
test("real SDK round trip records model/tool loop, replays offline with different prompt and keeps tool permission guard", async (t) => {
  const root = await directory(t),
    recording = join(root, "recording"),
    target = join(root, "result.txt");
  let modelCalls = 0;
  const model: Model = {
    async getResponse() {
      throw new Error("stream only fixture");
    },
    async *getStreamedResponse() {
      const count = ++modelCalls;
      yield { type: "response_started" };
      yield {
        type: "response_done",
        response: {
          id: `r-${count}`,
          output:
            count === 1
              ? [
                  {
                    type: "function_call",
                    id: "write",
                    callId: "write",
                    name: "Write",
                    status: "completed",
                    arguments: JSON.stringify({
                      file_path: target,
                      content: "recorded mutation",
                    }),
                  },
                ]
              : [final("recorded answer")],
          usage: { inputTokens: 10, outputTokens: 2, totalTokens: 12 },
        },
      } as any;
    },
  };
  const record = await createHarness({
    workDir: root,
    modelProvider: { getModel: () => model },
    recordReplayEnv: { [ENV_RECORD_DIR]: recording },
    approveTool: () => true,
  });
  t.after(() => record.close());
  const first = await record.openSession();
  assert.equal(await record.prompt(first, "record fixture"), "recorded answer");
  assert.ok(
    await stat(target).catch(() => undefined),
    JSON.stringify(first.history),
  );
  assert.equal(await readFile(target, "utf8"), "recorded mutation");
  await record.close();
  const values = await entries(recording);
  assert.deepEqual(
    values.map((entry) => entry.type),
    ["metadata", "request", "stream_response", "request", "stream_response"],
  );
  assert.equal("signal" in values[1]!.request, false);
  assert.equal(record.recordingStore.recordFilePath, null);
  await writeFile(target, "external preserved");
  const replay = await createHarness({
    workDir: root,
    recordReplayEnv: { [ENV_REPLAY_DIR]: recording, [ENV_REPLAY_STRICT]: "1" },
  });
  t.after(() => replay.close());
  const second = await replay.openSession();
  assert.equal(
    await replay.prompt(second, "completely different prompt"),
    "recorded answer",
  );
  assert.equal(modelCalls, 2);
  assert.equal(await readFile(target, "utf8"), "external preserved");
  assert.match(JSON.stringify(second.history), /Tool permission denied: Write/);
  assert.equal(replay.recordingStore.getResponseCount(), 2);
  // Replay the actual SDK-created recording in a new credential-free process.
  // Explicit approval must execute the recorded tool, not replay its old result.
  const env: NodeJS.ProcessEnv = { ...process.env };
  for (const key of [
    ENV_RECORD_DIR,
    ENV_REPLAY_DIR,
    "OPENAI_API_KEY",
    "CODEBUDDY_API_KEY",
    "OPENAI_BASE_URL",
    "CODEBUDDY_BASE_URL",
  ])
    delete env[key];
  env[ENV_REPLAY_DIR] = recording;
  env[ENV_REPLAY_STRICT] = "1";
  const cli = new URL(
    `../src/cli.${import.meta.url.endsWith(".ts") ? "ts" : "js"}`,
    import.meta.url,
  );
  const result = await promisify(execFile)(
    process.execPath,
    [
      ...(import.meta.url.endsWith(".ts")
        ? ["--import", import.meta.resolve("tsx")]
        : []),
      cli.pathname,
      "--cwd",
      root,
      "--model",
      values[1]!.modelName,
      "--allow-tools",
      "Write",
      "-p",
      "replay approved",
    ],
    { cwd: root, env, timeout: 7000 },
  );
  assert.equal(result.stdout, "recorded answer\n");
  assert.equal(await readFile(target, "utf8"), "recorded mutation");
});
test("SDK passthrough remains lazy, conflicting env fails before bootstrap, and record mode still requires a live provider", async (t) => {
  const root = await directory(t);
  await assert.rejects(
    createHarness({
      workDir: root,
      recordReplayEnv: { [ENV_RECORD_DIR]: "r", [ENV_REPLAY_DIR]: "p" },
    }),
    /mutually exclusive/,
  );
  await assert.rejects(
    createHarness({
      workDir: root,
      recordReplayEnv: { [ENV_RECORD_DIR]: join(root, "record") },
    }),
    /requires explicit apiKey and baseURL/,
  );
  const h = await createHarness({
    workDir: root,
    modelProvider: {
      getModel() {
        throw new Error("not used");
      },
    },
    recordReplayEnv: {},
  });
  t.after(() => h.close());
  await h.openSession();
  assert.equal(h.recordingStore.initialized, false);
  assert.equal(h.recordReplayProvider.mode, "passthrough");
  assert.equal(
    await stat(join(root, "recording.jsonl")).catch(() => undefined),
    undefined,
  );
});
test(
  "fresh CLI process replays saved model stream with no credentials/base URL and supports speed/strict env",
  { timeout: 10000 },
  async (t) => {
    const root = await directory(t);
    await seed(root, [
      { type: "metadata", version: 1 },
      { type: "request", turnId: 0, modelName: "fixture" },
      {
        type: "stream_response",
        turnId: 0,
        modelName: "fixture",
        events: [
          { offsetMs: 0, event: { type: "response_started" } },
          {
            offsetMs: 2,
            event: {
              type: "response_done",
              response: {
                id: "replayed",
                output: [final("offline CLI answer")],
                usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
              },
            },
          },
        ],
      },
    ]);
    const env: NodeJS.ProcessEnv = { ...process.env };
    for (const key of [
      ENV_RECORD_DIR,
      ENV_REPLAY_DIR,
      "OPENAI_API_KEY",
      "CODEBUDDY_API_KEY",
      "OPENAI_BASE_URL",
      "CODEBUDDY_BASE_URL",
    ])
      delete env[key];
    env[ENV_REPLAY_DIR] = root;
    env[ENV_REPLAY_STRICT] = "1";
    env.CODEBUDDY_REPLAY_SPEED = "100";
    const entry = new URL(
        `../src/cli.${import.meta.url.endsWith(".ts") ? "ts" : "js"}`,
        import.meta.url,
      ),
      args = [
        ...(import.meta.url.endsWith(".ts")
          ? ["--import", import.meta.resolve("tsx")]
          : []),
        entry.pathname,
        "--cwd",
        root,
        "--model",
        "fixture",
        "-p",
        "offline input",
      ],
      result = await promisify(execFile)(process.execPath, args, {
        cwd: root,
        env,
        timeout: 7000,
      });
    assert.equal(result.stdout, "offline CLI answer\n");
    assert.match(result.stderr, /Session:/);
  },
);

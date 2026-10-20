import assert from "node:assert/strict";
import { readFile, mkdtemp, writeFile, rm } from "node:fs/promises";
import * as fs from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createHash } from "node:crypto";
import { runInNewContext } from "node:vm";
import { RecordingStoreImpl } from "../src/replay/recording-store.js";
import {
  RecordingModel,
  ReplayModel,
  ReplayExhaustedError,
  ReplayTypeMismatchError,
  RecordReplayModelProvider,
  serializeRequest,
} from "../src/replay/record-replay-model.js";
import * as Config from "../src/replay/record-replay-config.js";
const filename = process.argv[2];
if (!filename) throw new Error("Pass captured WorkBuddy codebuddy.js path");
const source = await readFile(filename, "utf8");
assert.equal(
  createHash("sha256").update(source).digest("hex"),
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd",
);
function evaluate(code: string, bindings: object = {}): any {
  return runInNewContext(
    code,
    { Error, Map, Set, Promise, Date, ...bindings },
    { timeout: 1000, contextCodeGeneration: { strings: false, wasm: false } },
  );
}
function original(start: number, end: number, bindings: object = {}): any {
  const code = source.slice(start, end);
  assert.match(code, /^class/);
  return evaluate(`(${code})`, bindings);
}
let comparisons = 0;
function normalize(value: any): any {
  if (value === undefined) return "[undefined]";
  if (Object.prototype.toString.call(value) === "[object Error]")
    return { name: value.name, message: value.message };
  if (
    value instanceof Map ||
    Object.prototype.toString.call(value) === "[object Map]"
  )
    return [...value].map(normalize);
  if (Array.isArray(value)) return Array.from(value, normalize);
  if (typeof value === "function") return "[function]";
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, normalize(value[key])]),
    );
  return value;
}
function equal(a: any, b: any): void {
  assert.deepEqual(normalize(a), normalize(b));
  comparisons++;
}
async function outcome(operation: () => unknown) {
  try {
    return { result: await operation() };
  } catch (error) {
    return { error };
  }
}
const modeStart = source.indexOf("function getRecordReplayMode(){", 9941000),
  modeEnd = source.indexOf("},3069", modeStart);
for (const record of [undefined, "", "record", "0"])
  for (const replay of [undefined, "", "replay", "false"]) {
    const env = {
        [Config.ENV_RECORD_DIR]: record,
        [Config.ENV_REPLAY_DIR]: replay,
      },
      native = evaluate(`(${source.slice(modeStart, modeEnd)})`, {
        process: { env },
        eg: Config.ENV_RECORD_DIR,
        eh: Config.ENV_REPLAY_DIR,
      });
    equal(
      await outcome(() => Config.getRecordReplayMode(env)),
      await outcome(() => native()),
    );
  }
const keysLiteral = source.slice(9941300, 9941700).match(/ed=(\[[^\]]+\])/);
assert.ok(keysLiteral);
equal(Config.REPLAY_ENV_KEYS, evaluate(keysLiteral[1]!));
const Store = original(9009857, 9012563),
  Errors = {
    ReplayExhaustedError: original(9014731, 9014999),
    ReplayTypeMismatchError: original(9015028, 9015276),
  };
const NativeSerialize = evaluate(
  `(${source.slice(9013586, source.indexOf("let ReplayModel=", 9013586))})`,
);
for (const request of [
  {},
  { signal: "not serialized", input: "question" },
  {
    signal: undefined,
    headers: { authorization: "not redacted" },
    modelSettings: { value: null },
  },
])
  equal(serializeRequest(request as any), NativeSerialize(request));
for (const kind of [
  "empty",
  "inherited",
  "explicit",
  "unknown",
  "duplicates",
]) {
  // Drive original file loader with a read-only virtual fs, then compare native
  // queue methods using exactly the same resulting state in reconstructed store.
  const entries: any[] = [
    {
      type: "metadata",
      replayEnv: { keep: "recorded", absent: "restored", empty: "restored" },
    },
  ];
  if (kind !== "empty")
    entries.push(
      { type: "request", turnId: 0, modelName: "a" },
      { type: "response", turnId: 0, response: { id: 0 } },
    );
  if (kind === "explicit")
    entries.push({
      type: "stream_response",
      turnId: 0,
      modelName: "b",
      events: [],
    });
  if (kind === "unknown")
    entries.push({ type: "response", turnId: 20, response: {} });
  if (kind === "duplicates")
    entries.push(
      { type: "request", turnId: 0, modelName: "last" },
      { type: "request", turnId: 1, modelName: "" },
      { type: "response", turnId: 1 },
    );
  const env = { keep: "current", empty: "" },
    Native = original(9009857, 9012563, {
      nH: {
        existsSync: () => true,
        readFileSync: () =>
          entries.map((entry) => JSON.stringify(entry)).join("\n\n"),
      },
      iD: { join: (...parts: string[]) => parts.join("/") },
      p4: "recording.jsonl",
      p3: Config,
      process: { env },
    }),
    before = new Native();
  before.initReplayMode("record");
  // Same parse algorithm with injected fs is also compared below via real files
  // in runtime tests; virtual loader state asserts model/turn inference here.
  const after = new RecordingStoreImpl({});
  after.initialized = true;
  after.modelQueues.clear();
  const models = new Map(
    entries
      .filter((entry) => entry.type === "request" && entry.modelName)
      .map((entry) => [entry.turnId, entry.modelName]),
  );
  for (const entry of entries.filter(
    (entry) => entry.type === "response" || entry.type === "stream_response",
  )) {
    const name = entry.modelName || models.get(entry.turnId) || "unknown";
    const queue = after.modelQueues.get(name) ?? [];
    if (!after.modelQueues.has(name)) {
      after.modelQueues.set(name, queue);
      after.modelQueueIndex.set(name, 0);
    }
    queue.push({ ...entry, modelName: name });
    after.totalResponseCount++;
  }
  equal(after.getResponseCount(), before.getResponseCount());
  equal(after.getRecordedModelNames(), before.getRecordedModelNames());
  equal(after.modelQueues, before.modelQueues);
  equal(env, { keep: "current", empty: "restored", absent: "restored" });
  for (const name of ["a", "missing", "last", "b", "unknown"]) {
    equal(after.peekNextResponse(name), before.peekNextResponse(name));
    equal(after.consumeNextResponse(name), before.consumeNextResponse(name));
  }
}
for (let a = 0; a < 4; a++)
  for (let b = 0; b < 4; b++)
    for (const requested of ["a", "b", "missing", ""]) {
      const before = new Store(),
        after = new RecordingStoreImpl({});
      before.initialized = after.initialized = true;
      for (const [name, count] of [
        ["a", a],
        ["b", b],
      ] as const)
        if (count) {
          const values = Array.from({ length: count }, (_, id) => ({
            type: "response",
            modelName: name,
            response: id,
          }));
          before.modelQueues.set(name, values);
          after.modelQueues.set(name, values);
        }
      for (let index = 0; index < 7; index++) {
        equal(
          after.findFallbackQueue(requested),
          before.findFallbackQueue(requested),
        );
        equal(
          after.peekNextResponse(requested),
          before.peekNextResponse(requested),
        );
        equal(
          after.consumeNextResponse(requested),
          before.consumeNextResponse(requested),
        );
        equal(after.modelQueueIndex, before.modelQueueIndex);
      }
      equal(after.nextTurnId(), before.nextTurnId());
      equal(after.nextTurnId(), before.nextTurnId());
      after.close();
      before.close();
      equal(after.recordFilePath, before.recordFilePath);
    }
const savedDate = globalThis.Date,
  savedTimeout = globalThis.setTimeout;
let tick = 100;
class TickDate extends Date {
  constructor(value?: any) {
    super(value ?? 1790000000000);
  }
  static override now() {
    return (tick += 3);
  }
}
globalThis.Date = TickDate as DateConstructor;
try {
  for (const streaming of [false, true])
    for (const failure of [
      "none",
      "delegate",
      "write-request",
      "write-response",
      "early-return",
    ]) {
      async function run(native: boolean) {
        tick = 100;
        let turn = 0;
        const writes: any[] = [],
          calls: any[] = [],
          store: any = {
            nextTurnId: () => turn++,
            writeEntry: (entry: any) => {
              if (
                (failure === "write-request" && entry.type === "request") ||
                (failure === "write-response" && entry.type !== "request")
              )
                throw new Error("write failed");
              writes.push(entry);
            },
          },
          request: any = {
            input: "question",
            signal: new AbortController().signal,
            custom: { a: 1 },
          },
          delegate: any = {
            async getResponse(value: any) {
              calls.push(value === request);
              if (failure === "delegate") throw new Error("delegate failed");
              return { output: [], usage: { totalTokens: 4 } };
            },
            async *getStreamedResponse(value: any) {
              calls.push(value === request);
              yield { type: "response_started" };
              if (failure === "delegate") throw new Error("delegate failed");
              yield { type: "response_done", response: { id: "response" } };
            },
          },
          Native = original(9012653, 9013585, {
            serializeRequest: NativeSerialize,
            Date: TickDate,
          }),
          model = native
            ? new Native(delegate, "model", store)
            : new RecordingModel(delegate, "model", store),
          result = await outcome(async () => {
            if (!streaming) return model.getResponse(request);
            const events: any[] = [];
            for await (const event of model.getStreamedResponse(request)) {
              events.push(event);
              if (failure === "early-return") break;
            }
            return events;
          });
        return { writes, calls, result };
      }
      equal(await run(false), await run(true));
    }
  for (const streaming of [false, true])
    for (const type of ["response", "stream_response", "other", "missing"])
      for (const modelName of [undefined, "", "requested", "other"])
        for (const strict of [undefined, "", "0", "false", "1"]) {
          async function run(native: boolean) {
            const env = { [Config.ENV_REPLAY_STRICT]: strict },
              calls: string[] = [],
              entry =
                type === "missing"
                  ? undefined
                  : {
                      type,
                      modelName,
                      response: { output: [] },
                      events: [
                        { offsetMs: 0, event: { type: "response_started" } },
                      ],
                    },
              store: any = {
                consumeNextResponse: (name: string) => {
                  calls.push(name);
                  return entry;
                },
              },
              Native = original(9013666, 9014705, {
                ...Errors,
                p3: Config,
                process: { env },
              }),
              model = native
                ? new Native("requested", store)
                : new ReplayModel("requested", store, env),
              result = await outcome(async () => {
                if (!streaming)
                  return model.getResponse({ completely: "different request" });
                const events = [];
                for await (const event of model.getStreamedResponse({
                  totally: "different",
                } as any))
                  events.push(event);
                return events;
              });
            return { calls, result };
          }
          equal(await run(false), await run(true));
        }
  for (const speed of [
    undefined,
    "",
    "0",
    "-1",
    "NaN",
    "0.5",
    "2",
    "2prefix",
    "Infinity",
  ]) {
    async function run(native: boolean) {
      const delays: number[] = [],
        timer: any = (callback: () => void, delay: number) => {
          delays.push(delay);
          callback();
        },
        env = { [Config.ENV_REPLAY_SPEED]: speed },
        entry = {
          type: "stream_response",
          events: [0, 1, 2, 10, 9, 30].map((offsetMs) => ({
            offsetMs,
            event: { type: "response_started" },
          })),
        },
        store: any = { consumeNextResponse: () => entry },
        Native = original(9013666, 9014705, {
          ...Errors,
          p3: Config,
          process: { env },
          setTimeout: timer,
        });
      globalThis.setTimeout = timer;
      const model = native
          ? new Native("model", store)
          : new ReplayModel("model", store, env),
        events = [];
      for await (const event of model.getStreamedResponse({} as any))
        events.push(event);
      return { delays, events };
    }
    equal(await run(false), await run(true));
  }
} finally {
  globalThis.Date = savedDate;
  globalThis.setTimeout = savedTimeout;
}
for (const mode of ["passthrough", "record", "replay"])
  for (const name of [undefined, "", "model"]) {
    async function run(native: boolean) {
      const calls: any[] = [],
        store = {} as any,
        env =
          mode === "record"
            ? { [Config.ENV_RECORD_DIR]: "record" }
            : mode === "replay"
              ? { [Config.ENV_REPLAY_DIR]: "replay" }
              : {},
        originalProvider: any = {
          getModel(value: any) {
            calls.push(["delegate", value]);
            return { marker: "original" };
          },
        },
        logger = { info: (value: string) => calls.push(["log", value]) },
        Native = original(9015846, 9016315, {
          p3: { getRecordReplayMode: () => mode },
          RecordingModel: class {
            constructor(
              readonly delegate: any,
              readonly modelName: string,
            ) {}
          },
          ReplayModel: class {
            constructor(readonly modelName: string) {}
          },
        }),
        provider = native
          ? Object.assign(new Native(), { originalProvider, store, logger })
          : new RecordReplayModelProvider(originalProvider, store, logger, env),
        model: any = await provider.getModel(name);
      return {
        calls,
        mode: provider.mode,
        model: {
          marker: model.marker,
          name: model.modelName,
          delegate: model.delegate,
        },
      };
    }
    equal(await run(false), await run(true));
  }
// Real synchronous file operations on separate owned temporary directories.
const savedIoDate = globalThis.Date;
class IoDate extends Date {
  constructor(value?: any) {
    super(value ?? 1790000000000);
  }
}
globalThis.Date = IoDate as DateConstructor;
try {
  for (const mode of ["record", "replay", "both", "none"])
    for (const fixture of [
      "valid",
      "missing",
      "malformed",
      "null",
      "no-metadata",
    ]) {
      async function run(native: boolean) {
        const root = await mkdtemp(join(tmpdir(), "replay-diff-"));
        try {
          const path = join(root, "recording.jsonl"),
            env: NodeJS.ProcessEnv = {
              ...(mode === "record" || mode === "both"
                ? { [Config.ENV_RECORD_DIR]: root }
                : {}),
              ...(mode === "replay" || mode === "both"
                ? { [Config.ENV_REPLAY_DIR]: root }
                : {}),
              keep: "current",
              empty: "",
              [Config.REPLAY_ENV_KEYS[0]!]: "1",
            },
            fixtureEntries = [
              {
                type: "metadata",
                version: 1,
                replayEnv: { keep: "old", empty: "restore", absent: "add" },
              },
              { type: "request", turnId: 1, modelName: "inferred" },
              { type: "response", turnId: 1, response: { value: 1 } },
              {
                type: "stream_response",
                turnId: 2,
                modelName: "explicit",
                events: [],
              },
              { type: "response", turnId: 9, response: {} },
            ];
          if (fixture !== "missing")
            await writeFile(
              path,
              fixture === "malformed"
                ? "{}\n{bad}"
                : fixture === "null"
                  ? "null\n"
                  : fixtureEntries
                      .filter(
                        (entry) =>
                          fixture !== "no-metadata" ||
                          entry.type !== "metadata",
                      )
                      .map((entry) => JSON.stringify(entry))
                      .join("\n\n"),
            );
          const Native = original(9009857, 9012563, {
              nH: fs,
              iD: { join },
              p4: "recording.jsonl",
              p3: Config,
              process: { env },
              Date: IoDate,
            }),
            store = native ? new Native() : new RecordingStoreImpl(env);
          const initialized = await outcome(() => store.ensureInitialized()),
            retried = await outcome(() => store.ensureInitialized()),
            writes = await outcome(() =>
              store.writeEntry({
                type: "request",
                turnId: store.nextTurnId(),
                request: { text: "raw" },
              }),
            );
          const result = {
            initialized,
            retried,
            writes,
            env,
            file: await readFile(path, "utf8").catch(() => undefined),
            models: store.getRecordedModelNames(),
            count: store.getResponseCount(),
            queues: store.modelQueues,
            indices: store.modelQueueIndex,
            activePath: store.recordFilePath,
            flag: store.initialized,
          };
          store.close();
          store.writeEntry({ type: "after-close" });
          return JSON.parse(
            JSON.stringify(normalize(result)).split(root).join("ROOT"),
          );
        } finally {
          await rm(root, { recursive: true, force: true });
        }
      }
      equal(await run(false), await run(true));
    }
} finally {
  globalThis.Date = savedIoDate;
}
console.log(
  `Record/replay differential verification passed: ${comparisons} comparisons; captured bundle SHA-256 verified.`,
);

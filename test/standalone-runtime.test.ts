import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, readFile, rm, writeFile, access } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { Usage, setTraceProcessors, withTrace, type Model } from "@openai/agents-core";
import { z } from "zod";
import { createHarness } from "../src/runtime/create-harness.js";
const traceEvents: string[] = [];
// An in-memory exporter makes these tests independent of the host API key.
setTraceProcessors([{
  async onTraceStart() { traceEvents.push("trace"); }, async onTraceEnd() {},
  async onSpanStart() { traceEvents.push("span"); }, async onSpanEnd() {},
  async forceFlush() {}, async shutdown() {},
}]);

function fixtureModel(output: (request: any, count: number) => any[]): Model {
  let count = 0;
  return {
    async getResponse() { return { output: [], usage: new Usage() }; },
    async *getStreamedResponse(request) {
      const items = output(request, ++count);
      yield { type: "response_started" };
      for (const item of items) if (item.type === "message") yield { type: "output_text_delta", delta: item.content[0].text };
      yield { type: "response_done", response: { id: `response-${count}`, usage: { inputTokens: 10, outputTokens: 2, totalTokens: 12 }, output: items } } as any;
    },
  };
}
const answer = (text: string) => [{ type: "message", role: "assistant", id: `message-${text}`, status: "completed", content: [{ type: "output_text", text }] }];
const call = (name: string, input: object) => [{ type: "function_call", id: "call-fixture", callId: "call-fixture", name, arguments: JSON.stringify(input), status: "completed" }];

test("standalone SDK composition streams, restores JSONL across runtimes, and honors model override", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "harness-composition-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const path = join(directory, "fixture.txt");
  await writeFile(path, "standalone fixture\n");
  const requests: any[] = [];
  const names: unknown[] = [];
  const model = fixtureModel((request, count) => { requests.push(request); return count === 1 ? call("Read", { file_path: path }) : answer(count === 2 ? "fixture read" : "restored"); });
  const options = { workDir: directory, model: "offline-custom", approveTool: () => true, modelProvider: { getModel(name?: string) { names.push(name); return model; } } };
  const first = await createHarness(options);
  const session = await first.openSession();
  let text = "";
  assert.equal(await first.prompt(session, "read fixture", { onText: (chunk) => text += chunk }), "fixture read");
  assert.equal(text, "fixture read");
  assert.ok(names.every((name) => name === "offline-custom"));
  await first.close();
  const second = await createHarness(options);
  t.after(() => second.close());
  const restored = await second.openSession(session.id);
  assert.equal(await second.prompt(restored, "continue"), "restored");
  assert.ok(JSON.stringify(requests.at(-1).input).includes("standalone fixture"));
  assert.ok(JSON.stringify(requests.at(-1).input).includes("fixture read"));
  assert.equal(restored.status, "idle");
});

test("default host guard denies direct and deferred mutations without approval", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "harness-permissions-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const target = join(directory, "should-not-exist.txt");
  const model = fixtureModel((_request, count) => count === 1 ? call("Write", { file_path: target, content: "denied" }) : answer("denied"));
  const runtime = await createHarness({ workDir: directory, modelProvider: { getModel: () => model } });
  t.after(() => runtime.close());
  const session = await runtime.openSession();
  assert.equal(await runtime.prompt(session, "write"), "denied");
  assert.ok(JSON.stringify(session.history).includes("Tool permission denied: Write"));
  await assert.rejects(access(target));
  const deferred = await runtime.tools.get("Write");
  await assert.rejects(Promise.resolve(deferred!.execute({ file_path: target, content: "denied" }, { context: session })), /Tool permission denied/);
});

test("standalone compaction replaces model context while preserving the transcript", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "harness-compact-runtime-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const requests: any[] = [];
  const model = fixtureModel((request, count) => { requests.push(request); return answer(count === 1 ? "before compact" : "after compact"); });
  const runtime = await createHarness({ workDir: directory, modelProvider: { getModel: () => model } });
  t.after(() => runtime.close());
  const session = await runtime.openSession();
  await runtime.prompt(session, "original question");
  assert.equal(await runtime.compact(session), true);
  assert.equal(requests.length, 1, "small transcript should use engineering compact without a model summary call");
  assert.equal(await runtime.prompt(session, "continue after compact"), "after compact");
  assert.match(JSON.stringify(requests.at(-1).input), /cb_summary/);
  assert.equal(requests.at(-1).input.length, 2, "the model sees summary + new turn, not the old raw history");
  const transcript = await readFile(runtime.store.getSessionFilePath(session.id), "utf8");
  assert.match(transcript, /original question/);
  assert.match(transcript, /before compact/);
});

test("opt-in memory extraction runs after the main turn without transcript or text-stream pollution", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "harness-memory-runtime-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const requests: any[] = [];
  const model = fixtureModel((request, count) => { requests.push(request); return answer(count === 1 ? "main response" : "memory extraction settled"); });
  const runtime = await createHarness({ workDir: directory, memoryExtraction: true, modelProvider: { getModel: () => model } });
  t.after(() => runtime.close());
  const session = await runtime.openSession();
  let visible = "";
  assert.equal(await runtime.prompt(session, "remember this", { onText: (text) => visible += text }), "main response");
  await runtime.waitForMemory();
  assert.equal(visible, "main response");
  assert.equal(requests.length, 2);
  assert.ok(JSON.stringify(requests[1].input).includes("memory"));
  assert.ok(!JSON.stringify(session.history).includes("memory extraction settled"));
  const transcript = await readFile(runtime.store.getSessionFilePath(session.id), "utf8");
  assert.ok(!transcript.includes("memory extraction settled"));
  assert.equal(session.permissionModeSubject.value, "default");
});

test("SDK approval pause is resumed before prompt resolves and tool executes once", { timeout: 10000 }, async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "harness-approval-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const model = fixtureModel((_request, count) => count === 1 ? call("Read", { file_path: "fixture" }) : answer("approved"));
  let executed = 0;
  const runtime = await createHarness({ workDir: directory, modelProvider: { getModel: () => model }, approveTool: async () => true });
  t.after(() => runtime.close());
  runtime.tools.register("Read", { parameters: z.object({ file_path: z.string() }), needsApproval: true,
    execute: () => { executed++; return "approved fixture"; } });
  const session = await runtime.openSession();
  assert.equal(await runtime.prompt(session, "approval"), "approved");
  assert.equal(executed, 1);
  assert.equal(runtime.interruptions.pending$.value, undefined);
  assert.equal(session.status, "idle");
  assert.equal((session.history as any[]).filter((item) => item.type === "function_call" && item.callId === "call-fixture").length, 1);
});

test("SDK approval denial returns rejection history without executing the handler", { timeout: 10000 }, async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "harness-rejection-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const model = fixtureModel((_request, count) => count === 1 ? call("Read", { file_path: "fixture" }) : answer("rejected"));
  let executed = 0;
  const runtime = await createHarness({ workDir: directory, modelProvider: { getModel: () => model }, approveTool: async () => false });
  t.after(() => runtime.close());
  runtime.tools.register("Read", { parameters: z.object({ file_path: z.string() }), needsApproval: true,
    execute: () => { executed++; return "must not execute"; } });
  const session = await runtime.openSession();
  assert.equal(await runtime.prompt(session, "approval"), "");
  assert.equal(executed, 0);
  assert.ok(JSON.stringify(session.history).includes("The user doesn't want to proceed"));
  assert.equal(session.status, "idle");
});

test("cancellation aborts the SDK request, rejects same-session concurrency, and permits the next turn", { timeout: 10000 }, async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "harness-cancel-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  let started!: () => void;
  const ready = new Promise<void>((resolve) => started = resolve);
  let requests = 0;
  const model: Model = {
    async getResponse() { return { output: [], usage: new Usage() }; },
    async *getStreamedResponse(request) {
      if (++requests === 1) {
        yield { type: "response_started" };
        started();
        await new Promise<void>((_resolve, reject) => {
          if (request.signal?.aborted) reject(request.signal.reason);
          else request.signal?.addEventListener("abort", () => reject(request.signal!.reason), { once: true });
        });
      } else {
        yield { type: "response_started" };
        yield { type: "response_done", response: { id: "recovered", usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 }, output: answer("recovered") } } as any;
      }
    },
  };
  const runtime = await createHarness({ workDir: directory, modelProvider: { getModel: () => model } });
  t.after(() => runtime.close());
  const session = await runtime.openSession();
  const controller = new AbortController();
  const running = runtime.prompt(session, "wait", { signal: controller.signal });
  await ready;
  await assert.rejects(runtime.prompt(session, "overlap"), /already running/);
  controller.abort();
  await assert.rejects(running);
  assert.equal(await runtime.prompt(session, "retry"), "recovered");
  assert.equal(session.status, "idle");
});

test("standalone host emits no root/tool/model trace and leaves global tracing enabled for its caller", async (t) => {
  assert.deepEqual(traceEvents, []);
  await withTrace("embedding caller trace", async () => undefined);
  assert.deepEqual(traceEvents, ["trace"]);
  traceEvents.length = 0;
  const directory = await mkdtemp(join(tmpdir(), "harness-tracing-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const model = fixtureModel(() => answer("private"));
  const runtime = await createHarness({ workDir: directory, modelProvider: { getModel: () => model } });
  const session = await runtime.openSession();
  await runtime.prompt(session, "do not export");
  await runtime.close();
  assert.deepEqual(traceEvents, []);
});

function cli(args: string[], env: Record<string, string> = {}): Promise<{ code: number | null; stdout: string; stderr: string }> {
  const extension = import.meta.url.endsWith(".ts") ? "ts" : "js";
  const entry = fileURLToPath(new URL(`../src/cli.${extension}`, import.meta.url));
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [...(extension === "ts" ? ["--import", "tsx"] : []), entry, ...args], {
      env: { ...process.env, ...env }, stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "", stderr = "";
    child.stdout.on("data", (data) => stdout += data);
    child.stderr.on("data", (data) => stderr += data);
    child.on("error", reject);
    child.on("close", (code) => resolve({ code, stdout, stderr }));
  });
}

test("CLI help is credential-free and errors reject unknown options", async () => {
  const help = await cli(["--help"]);
  assert.equal(help.code, 0);
  assert.match(help.stdout, /standalone host/);
  const invalid = await cli(["--unknown-option"]);
  assert.equal(invalid.code, 1);
  assert.match(invalid.stderr, /Unknown option/);
});

test("CLI uses real HTTP Chat Completions transport for Read and cross-process resume", { timeout: 20000 }, async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "harness-cli-http-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const path = join(directory, "fixture.txt");
  await writeFile(path, "HTTP fixture\n");
  const requests: any[] = [];
  const server = createServer(async (req, res) => {
    let body = "";
    for await (const chunk of req) body += chunk;
    requests.push(JSON.parse(body));
    assert.equal(req.url, "/v1/chat/completions");
    assert.equal(req.headers.authorization, "Bearer offline-fixture-key");
    const index = requests.length;
    const delta = index === 1 ? { role: "assistant", tool_calls: [{ index: 0, id: "http-read", type: "function", function: { name: "Read", arguments: JSON.stringify({ file_path: path }) } }] }
      : { role: "assistant", content: index === 2 ? "HTTP read complete" : "HTTP restored" };
    const packet = (value: any, finish: string | null) => ({ id: `chat-${index}`, object: "chat.completion.chunk", created: 1, model: "offline-http", choices: [{ index: 0, delta: value, finish_reason: finish }] });
    res.writeHead(200, { "content-type": "text/event-stream" });
    res.write(`data: ${JSON.stringify(packet(delta, null))}\n\n`);
    res.write(`data: ${JSON.stringify(packet({}, index === 1 ? "tool_calls" : "stop"))}\n\n`);
    res.end("data: [DONE]\n\n");
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise<void>((resolve) => { server.closeAllConnections(); server.close(() => resolve()); }));
  const address = server.address() as { port: number };
  const args = ["--cwd", directory, "--base-url", `http://127.0.0.1:${address.port}/v1`, "--model", "offline-http", "--allow-tools", "Read"];
  const env = { CODEBUDDY_API_KEY: "offline-fixture-key", OPENAI_AGENTS_DISABLE_TRACING: "1" };
  const first = await cli([...args, "-p", "read fixture"], env);
  assert.equal(first.code, 0, first.stderr);
  assert.equal(first.stdout, "HTTP read complete\n");
  const id = first.stderr.match(/Session: ([\w-]+)/)?.[1];
  assert.ok(id);
  const transcript = await readFile(join(directory, ".workbuddy-harness", "sessions", `${id}.jsonl`), "utf8");
  assert.match(transcript, /HTTP fixture/);
  const second = await cli([...args, "--resume", id, "-p", "what was read?"], env);
  assert.equal(second.code, 0, second.stderr);
  assert.equal(second.stdout, "HTTP restored\n");
  assert.ok(JSON.stringify(requests.at(-1).messages).includes("HTTP fixture"));
  assert.ok(JSON.stringify(requests.at(-1).messages).includes("HTTP read complete"));
  assert.ok(requests.every((request) => request.model === "offline-http"));
});

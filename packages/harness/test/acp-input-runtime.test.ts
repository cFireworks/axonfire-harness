import assert from "node:assert/strict";
import test from "node:test";
import * as fs from "node:fs/promises";
import * as realFs from "node:fs";
import * as os from "node:os";
import { join } from "node:path";
import { Usage, setTraceProcessors, type Model } from "@openai/agents-core";
import { createCapturedAcpModules } from "../src/protocol/captured-acp-modules.js";
import { createNativeAcpInputRenderer } from "../src/protocol/native-acp-input-renderer.js";
import { createNativeSessionPrompt } from "../src/sessions/native-session-prompt.js";
import { createAddonSession } from "../src/runtime/create-addon-session.js";
setTraceProcessors([]);
function model(calls: any[], hold?: () => Promise<void>): Model {
  return {
    async getResponse() {
      return { output: [], usage: new Usage() };
    },
    async *getStreamedResponse(request: any) {
      calls.push(structuredClone(request));
      await hold?.();
      yield { type: "response_started" } as any;
      yield { type: "output_text_delta", delta: "owned ACP done" } as any;
      yield {
        type: "response_done",
        response: {
          id: "owned",
          usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
          output: [
            {
              type: "message",
              role: "assistant",
              id: "answer",
              status: "completed",
              content: [{ type: "output_text", text: "owned ACP done" }],
            },
          ],
        },
      } as any;
    },
  };
}
async function root(t: any) {
  const dir = await fs.mkdtemp(join(os.tmpdir(), "acp-input-"));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  return dir;
}
async function addon(t: any, patch: any = {}) {
  const dir = await root(t),
    cwd = join(dir, "project");
  await fs.mkdir(cwd);
  const calls: any[] = [],
    updates: any[] = [],
    logs: any[] = [];
  const a = await createAddonSession({
    stateRoot: join(dir, "state"),
    sessionId: "owned",
    desiredConfig: { mode: "ask", model: "base", permissionMode: "default" },
    harness: {
      workDir: cwd,
      recordReplayEnv: {},
      productRuntime: { watch: false },
      modelProvider: { getModel: () => model(calls, patch.hold) },
      ...patch.harness,
    },
    acpInput: {
      onSessionUpdate: (p: any) => {
        updates.push(p);
      },
      logger: { warn: (...args: any[]) => logs.push(args) },
      ...patch.acpInput,
    },
    ...patch.options,
  });
  t.after(() => a.close());
  return { a, dir, cwd, calls, updates, logs };
}
const text = (request: any) => JSON.stringify(request.input ?? request);
test("complete codec handles resource hints and whole StreamJsonUtils preserves original document quirks", () => {
  const n = createCapturedAcpModules({ fs: realFs, os });
  const link = n.codec.encodeAcpResourceLinkToInputText({
    uri: "tdoc://a",
    name: "中文 文档",
    meta: { fileType: "doc", fileUrl: "https://example.invalid/x" },
  });
  assert.match(link.text, /@tdoc#a:/);
  assert.equal(link.providerData.acpResourceLink.fileType, "doc");
  assert.deepEqual(
    n.StreamJsonUtils.convertContentBlock({
      type: "document",
      source: { type: "text", data: "plain text", media_type: "text/plain" },
    }),
    { type: "input_file", file: "data:text/plain;base64,plain text" },
  );
  assert.throws(
    () => n.StreamJsonUtils.parseMessagesFromPipeInput("{bad"),
    /Error parsing streaming input line/,
  );
});
test("original annotation retains single-input command omission and only annotates the first multi-block user", () => {
  const n = createCapturedAcpModules({ fs: realFs, os }),
    r = createNativeAcpInputRenderer(n.codec, {
      timestamps: n.timestamps,
      AcpUtils: n.AcpUtils,
    }).renderer;
  const prompt = [
    { type: "resource_link", uri: "command://init", name: "init" },
  ];
  const wire = n.AcpUtils.promptToUserMessage({ sessionId: "s", prompt });
  const items = n.StreamJsonUtils.parseMessagesFromPipeInput(
    JSON.stringify(wire),
  );
  r.annotatePromptDerivedContent(items, prompt);
  assert.equal(items[0].content[0].providerData, undefined);
  const multi = [{ type: "text", text: "hidden" }, ...prompt];
  const batch = n.StreamJsonUtils.parseMessagesFromPipeInput(
    JSON.stringify(
      n.AcpUtils.promptToUserMessage({ sessionId: "s", prompt: multi }),
    ),
  );
  r.annotatePromptDerivedContent(batch, multi);
  assert.equal(
    batch[0].content[1].providerData.acpResourceLink.uri,
    "command://init",
  );
});
test("original owner replay skips first-turn state, synthetic input sets it before backend success", () => {
  const n = createNativeSessionPrompt({
      crypto: { randomUUID: () => "fixed" },
    }),
    o = new n.NativeSessionPrompt(),
    s: any = {
      sessionId: "s",
      hasUserMessageSinceLastCompact: false,
      eventHistory: [],
    };
  o.recordSessionEvent(
    s,
    { update: { sessionUpdate: "user_message_chunk" } },
    { isReplay: true },
  );
  assert.equal(s.hasUserMessageSinceLastCompact, false);
  o.liveEmittedSyntheticUserPromptKeys = new Set();
  o.recordSyntheticUserPromptEvent(s, [{ type: "text", text: "x" }], {});
  assert.equal(s.hasUserMessageSinceLastCompact, true);
  assert.equal(
    s.eventHistory.at(-1)._meta["codebuddy.ai"].syntheticOwnerHistory,
    true,
  );
});
test("real SDK Addon ACP entry injects first-turn context and every-turn data through original conversion", async (t) => {
  const h = await addon(t);
  assert.equal(h.a.acpInputHost, undefined);
  assert.equal(
    await h.a.promptAcp({ prompt: [{ type: "text", text: "first ACP" }] }),
    "owned ACP done",
  );
  assert.match(text(h.calls[0]), /<user_info>/);
  assert.match(text(h.calls[0]), /<identity_context>/);
  assert.match(text(h.calls[0]), /<user_query>first ACP<\/user_query>/);
  await h.a.promptAcp({ prompt: [{ type: "text", text: "second ACP" }] });
  const latest = h.calls[1].input.filter((i: any) => i.role === "user").at(-1);
  assert.doesNotMatch(JSON.stringify(latest), /<user_info>/);
  assert.match(JSON.stringify(latest), /<current_time>/);
  assert.deepEqual(h.logs, []);
});
test("clear-session metadata bypasses composition while source owner still records user input", async (t) => {
  const h = await addon(t);
  await h.a.promptAcp({
    prompt: [{ type: "text", text: "clear injection" }],
    _meta: { "codebuddy.ai": { isClearSession: true } },
  });
  assert.doesNotMatch(text(h.calls[0]), /<user_info>|<current_time>/);
  assert.equal(h.a.acpInputHost!.state.hasUserMessageSinceLastCompact, true);
});
test("Teams metadata enrichment, project instruction and todo occupier reach actual SDK input", async (t) => {
  const h = await addon(t, {
    acpInput: {
      projectId: "project",
      userPrompts: {
        projectInstructionsResolver: async () => ({
          instructions: "OWNED PROJECT INSTRUCTION",
        }),
        projectNetdriveRootResolver: async () => ({
          fileId: "root",
          projectId: "project",
        }),
      },
    },
  });
  await h.a.promptAcp({
    prompt: [
      {
        type: "resource_link",
        uri: "todo://t",
        name: "Todo",
        _meta: { mentionType: "todo", todoId: "t" },
      },
    ],
  });
  const input = text(h.calls[0]);
  assert.match(input, /<team-project-context>/);
  assert.match(input, /OWNED PROJECT INSTRUCTION/);
  assert.match(input, /@todo:t Todo/);
  assert.match(input, /<todo-reference>/);
});
test("images persist only under owned ACP root and preserve original source local-path text", async (t) => {
  const h = await addon(t);
  await h.a.promptAcp({
    prompt: [
      { type: "text", text: "describe" },
      {
        type: "image",
        data: "aGVsbG8=",
        mimeType: "image/png",
        _meta: { filename: "test.png" },
      },
    ],
  });
  const host = h.a.acpInputHost!;
  const files = await fs.readdir(join(host.root, "cli/clipboard-images"));
  assert.equal(files.length, 1);
  assert.equal(
    await fs.readFile(
      join(host.root, "cli/clipboard-images", files[0]!),
      "utf8",
    ),
    "hello",
  );
  assert.match(text(h.calls[0]), /<image_local_path>/);
  assert.ok(
    h.a.session.history.some(
      (i: any) => i.type === "message" && i.role === "user",
    ),
  );
});
test("compact event resets original first-turn/expert state even if old user history still exists", async (t) => {
  const h = await addon(t);
  await h.a.promptAcp({ prompt: [{ type: "text", text: "before compact" }] });
  const host = h.a.acpInputHost!;
  host.acceptSessionUpdate({
    update: {
      sessionUpdate: "agent_message_chunk",
      _meta: { "codebuddy.ai/isCompactInternal": true },
      content: { type: "text", text: "summary" },
    },
  });
  await host.flush();
  assert.equal(host.state.hasUserMessageSinceLastCompact, false);
  await h.a.promptAcp({ prompt: [{ type: "text", text: "after compact" }] });
  assert.match(
    JSON.stringify(
      h.calls[1].input.filter((i: any) => i.role === "user").at(-1),
    ),
    /<user_info>/,
  );
});
test("restored Addon starts original first-turn flag false even with persisted SDK history", async (t) => {
  const h = await addon(t);
  await h.a.promptAcp({ prompt: [{ type: "text", text: "first runtime" }] });
  await h.a.close();
  const calls: any[] = [];
  const b = await createAddonSession({
    stateRoot: join(h.dir, "state"),
    sessionId: "owned",
    resume: true,
    desiredConfig: { mode: "ask", model: "base", permissionMode: "default" },
    harness: {
      workDir: h.cwd,
      recordReplayEnv: {},
      productRuntime: { watch: false },
      modelProvider: { getModel: () => model(calls) },
    },
  });
  try {
    assert.ok(b.session.history.length > 0);
    await b.promptAcp({ prompt: [{ type: "text", text: "new runtime" }] });
    assert.match(
      JSON.stringify(
        calls[0].input.filter((i: any) => i.role === "user").at(-1),
      ),
      /<user_info>/,
    );
  } finally {
    await b.close();
  }
});
test("native local /stats is TUI-only in ACP, publishes real response and never invokes model", async (t) => {
  const h = await addon(t);
  const output = await h.a.promptAcp({
    prompt: [{ type: "text", text: "/stats" }],
  });
  assert.match(output, /only available in the terminal/);
  assert.equal(h.calls.length, 0);
  assert.ok(
    h.updates.some((p) => p.update.sessionUpdate === "agent_message_chunk"),
  );
});
test("ACP local reload command executes actual plugin refresh without a model turn", async (t) => {
  const h = await addon(t);
  const output = await h.a.promptAcp({
    prompt: [{ type: "text", text: "/reload-plugins" }],
  });
  assert.equal(h.calls.length, 0);
  assert.match(output, /reload/i);
  assert.equal(h.a.acpInputHost!.state.hasUserMessageSinceLastCompact, true);
});
test("ACP state path rejects an external symlink and ordinary SDK prompt stays independent", async (t) => {
  const h = await addon(t),
    outside = await root(t);
  await fs.symlink(outside, join(h.dir, "state/owned/acp-input"));
  await assert.rejects(
    h.a.promptAcp({ prompt: [{ type: "text", text: "x" }] }),
    /symlink/,
  );
  assert.equal(await h.a.prompt("ordinary"), "owned ACP done");
  assert.doesNotMatch(text(h.calls[0]), /<user_info>/);
});
test("failed backend send retains synthetic first-turn flag but does not commit expert selection", async (t) => {
  const h = await addon(t),
    original = h.a.harness.prompt;
  h.a.harness.prompt = async () => {
    throw Error("owned send failed");
  };
  await assert.rejects(
    h.a.promptAcp({ prompt: [{ type: "text", text: "failed" }] }),
    /owned send failed/,
  );
  assert.equal(h.a.acpInputHost!.state.hasUserMessageSinceLastCompact, true);
  assert.equal(
    h.a.acpInputHost!.state.lastUserPromptExpertSelection,
    undefined,
  );
  h.a.harness.prompt = original;
  await h.a.promptAcp({ prompt: [{ type: "text", text: "retry" }] });
  assert.doesNotMatch(text(h.calls[0]), /<user_info>/);
});
test("ACP concurrent ingress is rejected before a second composition or SDK turn", async (t) => {
  let release: any, enter: any;
  const ready = new Promise((r) => (enter = r)),
    gate = new Promise<void>((r) => (release = r));
  const h = await addon(t, {
    hold: async () => {
      enter();
      await gate;
    },
  });
  const first = h.a.promptAcp({ prompt: [{ type: "text", text: "held" }] });
  await ready;
  await assert.rejects(
    h.a.promptAcp({ prompt: [{ type: "text", text: "overlap" }] }),
    /already running/,
  );
  assert.equal(h.calls.length, 1);
  release();
  await first;
});
test("Addon close waits accepted composition, closes its backend, and keeps prompt resources until drain", async (t) => {
  let release: any, enter: any;
  const ready = new Promise((r) => (enter = r));
  const h = await addon(t, {
    acpInput: {
      projectId: "p",
      userPrompts: {
        projectInstructionsResolver: () => {
          enter();
          return new Promise((r) => (release = r));
        },
      },
    },
  });
  const first = h.a
    .promptAcp({ prompt: [{ type: "text", text: "held composition" }] })
    .catch((error) => error);
  await ready;
  const host = h.a.acpInputHost!;
  let done = false;
  const closing = h.a.close().then(() => {
    done = true;
  });
  await new Promise((r) => setImmediate(r));
  assert.equal(done, false);
  assert.equal(h.a.resourcePromptHost!.closed, false);
  release({ instructions: "finish" });
  assert.match(String(await first), /closed/);
  await closing;
  assert.equal(host.closed, true);
  assert.equal(host.pendingCount, 0);
  assert.equal(h.a.resourcePromptHost!.closed, true);
  await assert.rejects(h.a.promptAcp({ prompt: [] }), /closed/);
});
test("SDK history publication uses original compact output projection to reset prompt state", async (t) => {
  const h = await addon(t);
  await h.a.promptAcp({ prompt: [{ type: "text", text: "before" }] });
  const host = h.a.acpInputHost!;
  await h.a.harness.sessions.addHistory(h.a.session, {
    type: "message",
    role: "assistant",
    content: [{ type: "output_text", text: "<summary>compact</summary>" }],
    providerData: { agent: "compact", isCompactInternal: true },
  } as any);
  await host.flush();
  assert.equal(host.state.hasUserMessageSinceLastCompact, false);
  assert.ok(
    h.updates.some(
      (p) => p.update?._meta?.["codebuddy.ai/isCompactInternal"] === true,
    ),
  );
  assert.deepEqual(h.logs, []);
});
test("original numeric prompt timestamp survives ACP conversion into actual session history", async (t) => {
  const h = await addon(t);
  await h.a.promptAcp({
    prompt: [{ type: "text", text: "timestamp" }],
    _meta: { timestamp: "1234567890000" },
  });
  const user = h.a.session.history.find((i: any) => i.role === "user") as any;
  assert.equal(user.timestamp, 1234567890000);
});
test("external image path metadata cannot read external bytes and falls back to owned clipboard data", async (t) => {
  const h = await addon(t),
    outside = await root(t),
    file = join(outside, "outside.png");
  await fs.writeFile(file, "OUTSIDE SENTINEL");
  await h.a.promptAcp({
    prompt: [
      {
        type: "image",
        data: "aGVsbG8=",
        mimeType: "image/png",
        _meta: { path: file, filename: "owned.png" },
      },
    ],
  });
  const host = h.a.acpInputHost!,
    files = await fs.readdir(join(host.root, "cli/clipboard-images"));
  assert.equal(
    await fs.readFile(
      join(host.root, "cli/clipboard-images", files[0]!),
      "utf8",
    ),
    "hello",
  );
  assert.doesNotMatch(text(h.calls[0]), /OUTSIDE SENTINEL/);
});
test("explicit ACP disable leaves original standalone Addon prompt working", async (t) => {
  const h = await addon(t, { options: { acpInput: false } });
  await assert.rejects(h.a.promptAcp({ prompt: [] }), /disabled/);
  assert.equal(await h.a.prompt("ordinary"), "owned ACP done");
  assert.equal(h.a.acpInputHost, undefined);
});
test("successful expert selection persists with source v1 format and compact resets it to null", async (t) => {
  const h = await addon(t, {
    options: {
      desiredConfig: {
        mode: "ask",
        model: "base",
        permissionMode: "default",
        expertId: "owned-expert",
        expertMarketplace: "owned-market",
      },
    },
  });
  await h.a.promptAcp({ prompt: [{ type: "text", text: "expert" }] });
  const record: any = h.a.session.meta.axonfireAcpOwnerRecord;
  assert.deepEqual(record.lastUserPromptExpertSelection, {
    version: 1,
    selection: { id: "owned-expert", marketplace: "owned-market" },
  });
  h.a.acpInputHost!.acceptSessionUpdate({
    _meta: { isSessionSeparator: true },
    update: { sessionUpdate: "session_info_update" },
  });
  await h.a.acpInputHost!.flush();
  assert.deepEqual(
    (h.a.session.meta.axonfireAcpOwnerRecord as any)
      .lastUserPromptExpertSelection,
    { version: 1, selection: null },
  );
});
test("rejected synthetic live observer is joined/logged and does not become an unhandled rejection", async (t) => {
  const h = await addon(t, {
    acpInput: {
      onSessionUpdate: async () => {
        throw Error("owned sink failure");
      },
    },
  });
  await h.a.promptAcp({
    prompt: [{ type: "text", text: "synthetic" }],
    _meta: { "codebuddy.ai": { emitSyntheticUserPromptLive: true } },
  });
  await h.a.acpInputHost!.flush();
  assert.ok(
    h.logs.some((entry: any[]) =>
      entry.some((value) => String(value).includes("sink failure")),
    ),
  );
});

import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
import { join, dirname, resolve } from "node:path";
import { parse } from "acorn";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { nodesOf } from "./helpers/captured-product-sources.js";
import { emittedPrompt } from "./helpers/captured-resource-prompts.js";
import { loadCapturedAcpInput } from "./helpers/captured-acp-input.js";
import {
  createCapturedAcpModules,
  ACP_INPUT_FACTORIES,
  ACP_VISIBLE_TODO_FUNCTION,
} from "../src/protocol/captured-acp-modules.js";
import {
  createNativeAcpInputRenderer,
  ACP_INPUT_RENDERER_METHODS,
  ACP_PROMPT_TIMESTAMP_FUNCTION,
} from "../src/protocol/native-acp-input-renderer.js";
import {
  createNativeSessionPrompt,
  SESSION_PROMPT_METHODS,
  SESSION_PROMPT_FUNCTIONS,
} from "../src/sessions/native-session-prompt.js";
import { NativeHistoryInputUtils } from "../src/sessions/input-processor-utils.js";
import {
  CommandMessageUtils,
  COMMAND_MESSAGE_TYPES,
} from "../src/commands/command-message-utils.js";
const cli = fs.readFileSync(getCapturedBundlePath(), "utf8"),
  initialize = fs.readFileSync(
    process.env.WORKBUDDY_DESKTOP_INITIALIZE ??
      resolve(dirname(getCapturedBundlePath()), "../../main/initialize.js"),
    "utf8",
  ),
  original = loadCapturedAcpInput(cli, initialize);
const ast = (v: any): any =>
  v && typeof v === "object"
    ? Array.isArray(v)
      ? v.map(ast)
      : Object.fromEntries(
          Object.entries(v)
            .filter(([k]) => !["start", "end", "raw"].includes(k))
            .map(([k, v]) => [k, ast(v)]),
        )
    : v;
for (const [file, source, rows, functions, kind] of [
  [
    "protocol/captured-acp-modules",
    cli,
    ACP_INPUT_FACTORIES,
    [ACP_VISIBLE_TODO_FUNCTION],
    "modules",
  ],
  [
    "protocol/native-acp-input-renderer",
    cli,
    ACP_INPUT_RENDERER_METHODS,
    [ACP_PROMPT_TIMESTAMP_FUNCTION],
    "methods",
  ],
  [
    "sessions/native-session-prompt",
    initialize,
    SESSION_PROMPT_METHODS,
    SESSION_PROMPT_FUNCTIONS,
    "methods",
  ],
] as const) {
  const ports = nodesOf(
    parse(emittedPrompt(file), { ecmaVersion: "latest", sourceType: "module" }),
  );
  for (const [name, start, end] of rows) {
    const raw: any =
      kind === "modules"
        ? (
            parse("({" + source.slice(start, end) + "})", {
              ecmaVersion: "latest",
            }).body[0] as any
          ).expression.properties[0]
        : (
            parse("(class{" + source.slice(start, end) + "})", {
              ecmaVersion: "latest",
            }).body[0] as any
          ).expression.body.body[0];
    const port = ports.find((n) =>
      kind === "modules"
        ? n.type === "Property" && n.method && n.key.value === name
        : n.type === "MethodDefinition" && n.key.name === name,
    );
    assert.deepEqual(ast(port), ast(raw), file + ":" + name);
  }
  for (const [name, start, end] of functions) {
    const raw = parse(source.slice(start, end), { ecmaVersion: "latest" })
      .body[0];
    assert.deepEqual(
      ast(
        ports.find(
          (n) => n.type === "FunctionDeclaration" && n.id?.name === name,
        ),
      ),
      ast(raw),
      file + ":" + name,
    );
  }
}
const root = await fs.promises.mkdtemp(join(os.tmpdir(), "acp-input-diff-"));
let sequence = 0,
  comparisons = 0;
class Clock extends Date {
  constructor(value?: any) {
    super(value ?? "2026-10-20T01:02:03.000Z");
  }
  static override now() {
    return Date.parse("2026-10-20T01:02:03.000Z");
  }
}
function clean(value: any, dir: string): any {
  if (typeof value === "string") return value.replaceAll(dir, "<ROOT>");
  if (value instanceof Map) return [...value].map((v) => clean(v, dir));
  if (value instanceof Set) return [...value].map((v) => clean(v, dir));
  if (value instanceof Error)
    return { name: value.name, message: clean(value.message, dir) };
  if (Array.isArray(value)) return value.map((v) => clean(v, dir));
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, clean(v, dir)]),
    );
  return value;
}
async function pair(run: (h: any) => Promise<any>) {
  const outputs = [];
  for (const captured of [false, true]) {
    const dir = join(root, String(++sequence).padStart(6, "0"));
    await fs.promises.mkdir(dir);
    const logs: any[] = [];
    const mod = (captured ? original.modules : createCapturedAcpModules)({
      Date: Clock,
      fs,
      os: { ...os, tmpdir: () => dir, homedir: () => dir },
      env: { CODEBUDDY_CONFIG_DIR: dir },
      logger: { error: async (...args: any[]) => logs.push(args) },
      modules: {
        58830: { InputItemUtils: NativeHistoryInputUtils },
        67019: { CommandMessageUtils, CommandType: COMMAND_MESSAGE_TYPES },
        8046: { INTERRUPTED_BY_USER_MESSAGE: "Interrupted by user" },
      },
    });
    const r = (captured ? original.renderer : createNativeAcpInputRenderer)(
      mod.codec,
      { timestamps: mod.timestamps, AcpUtils: mod.AcpUtils },
    );
    const n = (captured ? original.session : createNativeSessionPrompt)({
      crypto: { randomUUID: () => "owned-fixed-id" },
    });
    const o = new n.NativeSessionPrompt();
    const s: any = {
      sessionId: "s",
      cwd: dir,
      desiredConfig: { mode: "craft" },
      eventHistory: [],
      hasUserMessageSinceLastCompact: false,
    };
    const calls: any[] = [];
    Object.assign(o, {
      logger: {
        info: (...a: any[]) => logs.push(a),
        warn: (...a: any[]) => logs.push(a),
      },
      sessions: new Map([["s", s]]),
      sessionEffectChains: new Map(),
      liveEmittedSyntheticUserPromptKeys: new Set(),
      userPromptComposerReady: Promise.resolve(),
      userPromptComposer: {
        composeUserPrompt: async (req: any) => {
          calls.push(req);
          return req.prompt;
        },
      },
      logDiagnostic: (...a: any[]) => logs.push(a),
      upsertSessionRecord: async (_id: any, update: any) => {
        s.record = update(s.record ?? { updatedAt: 1 });
      },
      emitOrBufferScopedEvent: (_s: any, p: any) => calls.push(["emit", p]),
    });
    let output: any;
    try {
      output = await run({ mod, r, n, o, s, dir, fs, calls, logs });
    } catch (error) {
      output = { error };
    }
    await o.flushSessionEffects("s");
    outputs.push(
      clean(
        {
          output,
          calls,
          logs,
          state: {
            hasUser: s.hasUserMessageSinceLastCompact,
            expert: s.lastUserPromptExpertSelection,
            events: s.eventHistory,
            record: s.record,
          },
        },
        dir,
      ),
    );
  }
  assert.deepEqual(outputs[0], outputs[1], "scenario " + comparisons);
  comparisons++;
}
try {
  for (const uri of [
    "command://m:p:/Do Thing",
    "file:///owned/a b.md",
    "scene://craft",
    "skill://A B",
    "tdoc://FID",
    "ima://kb/f",
    "lexiang://f?type=doc",
    "netdrive://f",
    "selection://a",
    "comment://x",
    "tdoc-selection://x",
    "agentmail://a",
    "expert://x",
    "article://https://example.invalid/a",
    "https://example.invalid/a",
    "unknown://x",
  ])
    for (const name of [undefined, "Name", "中文 文档"])
      for (const meta of [
        undefined,
        { mentionType: "inline-prompt", promptText: " nested prompt " },
        {
          provider: "space-doc",
          kind: "space/doc-ref",
          url: "https://example.invalid/doc",
        },
        {
          selectedText: "a<&",
          llmText: "instructions",
          title: 'quote"',
          selectionPayload: { timestamp: 42, text: "line\nline" },
          fileId: "id",
          fileType: "doc",
          iconUrl: "owned",
        },
      ])
        await pair(async (h) => {
          const encoded = h.mod.codec.encodeAcpResourceLinkToInputText({
            uri,
            name,
            meta,
          });
          const prompt = [
            { type: "text", text: "before" },
            { type: "resource_link", uri, name, _meta: meta },
            { type: "text", text: "after" },
          ];
          const wire = h.mod.AcpUtils.promptToUserMessage({
              sessionId: "s",
              prompt,
            }),
            items = h.mod.StreamJsonUtils.parseMessagesFromPipeInput(
              JSON.stringify(wire),
            );
          h.r.renderer.annotatePromptDerivedContent(items, prompt);
          h.r.applyAcpPromptTimestamp(items, 123);
          return {
            encoded,
            wire,
            items,
            runtimeText: h.mod.codec.extractRuntimePromptText(prompt),
            visible: h.mod.codec.extractVisiblePromptText(prompt),
            decoded: h.mod.codec.decodeInputTextToAcpContentBlocks(
              encoded.text,
              encoded.providerData,
            ),
          };
        });
  for (const prompt of [
    [],
    [{ type: "text", text: "/mcp:server:cmd arg" }],
    [
      {
        type: "text",
        text: "<system-reminder>hidden</system-reminder> visible",
      },
      { type: "text", text: "hello" },
    ],
    [
      {
        type: "resource",
        resource: { uri: "owned://doc", text: "unescaped <&>" },
      },
    ],
    [
      {
        type: "resource_link",
        uri: "x",
        name: "Inspiration",
        _meta: {
          mentionType: "inspiration",
          detail: "DETAIL",
          cardTitle: "Title",
        },
      },
    ],
    [{ type: "image", uri: "https://example.invalid/a.png" }],
    [{ type: "audio", data: "test", mimeType: "audio/wav" }],
  ])
    await pair(async (h) => ({
      wire: h.mod.AcpUtils.promptToUserMessage({ sessionId: "s", prompt }),
      text: h.mod.codec.extractRuntimePromptText(prompt),
    }));
  await pair(async (h) => {
    const prompt = [
      {
        type: "image",
        data: "aGVsbG8=",
        mimeType: "image/png",
        _meta: { filename: "image.png" },
      },
    ];
    const wire = h.mod.AcpUtils.promptToUserMessage({ sessionId: "s", prompt });
    const dir = join(h.dir, "clipboard-images");
    return {
      wire,
      files: await h.fs.promises.readdir(dir),
      bytes: (
        await h.fs.promises.readFile(
          join(dir, (await h.fs.promises.readdir(dir))[0]),
        )
      ).toString("hex"),
    };
  });
  for (const type of ["text", "base64", "url", "content", "unknown"])
    await pair(async (h) =>
      h.mod.StreamJsonUtils.convertContentBlock({
        type: "document",
        source: {
          type,
          data: "TEXT",
          media_type: "text/plain",
          url: "https://example.invalid/a",
          content: [{ type: "text", text: "A" }, { type: "image" }],
        },
      }),
    );
  for (const raw of [
    "",
    '\n{"type":"assistant"}\n',
    "{bad",
    '{"type":"user","message":{"content":"hello"}}',
    '{"type":"user","message":{"content":[]}}',
  ])
    await pair(async (h) =>
      h.mod.StreamJsonUtils.parseMessagesFromPipeInput(raw),
    );
  for (const first of [false, true])
    for (const projectId of [undefined, "p"])
      for (const expert of [undefined, { id: "e", marketplace: "m" }])
        await pair(async (h) => {
          Object.assign(h.s, {
            projectId,
            lastUserPromptExpertSelection: expert,
            hasUserMessageSinceLastCompact: first,
          });
          const meta = {
            "codebuddy.ai": {
              projectId: "",
              previousExpertSelection: { id: "forged" },
            },
          };
          const result = await h.o.composePromptForBackend(
            h.s,
            [{ type: "text", text: "query" }],
            meta,
          );
          return { result, meta, enriched: h.o.enrichPromptMeta(h.s, meta) };
        });
  for (const isReplay of [false, true])
    for (const payload of [
      {
        update: {
          sessionUpdate: "user_message_chunk",
          content: { type: "text", text: "x" },
        },
      },
      {
        update: {
          sessionUpdate: "agent_message_chunk",
          _meta: { "codebuddy.ai/isCompactInternal": true },
        },
      },
      {
        _meta: { "codebuddy.ai": { "codebuddy.ai/isCompactInternal": true } },
        update: {},
      },
      {
        _meta: { isSessionSeparator: true },
        update: { sessionUpdate: "user_message_chunk" },
      },
      {
        update: {
          sessionUpdate: "agent_message_chunk",
          _meta: { "codebuddy.ai": { isSessionSeparator: true } },
        },
      },
    ])
      await pair(async (h) => {
        h.s.hasUserMessageSinceLastCompact = true;
        h.s.lastUserPromptExpertSelection = { id: "e" };
        return h.o.recordSessionEvent(h.s, payload, { isReplay });
      });
  for (const live of [false, true])
    await pair(async (h) => {
      const meta = {
        "codebuddy.ai": {
          userMessageId: "same",
          emitSyntheticUserPromptLive: live,
        },
      };
      h.o.recordSyntheticUserPromptEvent(
        h.s,
        [{ type: "text", text: "x" }],
        meta,
      );
      h.o.recordSyntheticUserPromptEvent(
        h.s,
        [{ type: "text", text: "x" }],
        meta,
      );
      return { meta, live: h.o.liveEmittedSyntheticUserPromptKeys };
    });
  await pair(async (h) => {
    const synthetic = {
      update: { sessionUpdate: "user_message_chunk" },
      _meta: {
        "codebuddy.ai": { messageId: "id", syntheticOwnerHistory: true },
      },
    };
    return [
      h.o.recordSessionEvent(h.s, synthetic),
      h.o.recordSessionEvent(h.s, {
        ...synthetic,
        _meta: { "codebuddy.ai": { messageId: "id" } },
      }),
      h.o.recordSessionEvent(h.s, synthetic),
    ];
  });
  for (const raw of [
    undefined,
    null,
    { version: 1, selection: { id: "e", marketplace: "m" } },
    { version: 2, selection: { id: "e" } },
  ])
    await pair(async (h) => ({
      parsed: h.n.fromPersistedExpertSelectionState(raw),
      persisted: h.n.toPersistedExpertSelectionState(raw),
    }));
  console.log(
    JSON.stringify(
      {
        completeFactories: ACP_INPUT_FACTORIES.length,
        originalSessionMethods: SESSION_PROMPT_METHODS.length,
        originalSessionFunctions: SESSION_PROMPT_FUNCTIONS.length,
        rendererMethods: ACP_INPUT_RENDERER_METHODS.length,
        comparisons,
        desktopBootstrapExecuted: false,
      },
      null,
      2,
    ),
  );
} finally {
  await fs.promises.rm(root, { recursive: true, force: true });
}

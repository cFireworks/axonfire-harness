import assert from "node:assert/strict";
import test from "node:test";
import {
  mkdtemp,
  mkdir,
  writeFile,
  readFile,
  utimes,
  rm,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { Usage, setTraceProcessors, type Model } from "@openai/agents-core";
import { autoMemoryFixture } from "../scripts/helpers/auto-memory-fixtures.js";
import { loadMemoryPolicy } from "../src/memory/memory-extraction-prompts.js";
import { createHarness } from "../src/runtime/create-harness.js";
import { turn } from "../scripts/helpers/session-result-fixtures.js";
import { createAutoMemoryUtilities } from "../src/memory/auto-memory-utilities.js";
setTraceProcessors([]);
test("native Git identity helper keeps fixed readonly command, 5s timeout, trim and failure fallback", () => {
  const calls: any[] = [];
  const helper = createAutoMemoryUtilities({
    childProcess: {
      execSync: (...args: any[]) => {
        calls.push(args);
        return " owned git user\n";
      },
    },
  }).GitUtils;
  assert.equal(helper.getGitUserName(), "owned git user");
  assert.deepEqual(calls, [
    [
      "git config user.name",
      { encoding: "utf-8", timeout: 5000, stdio: ["pipe", "pipe", "pipe"] },
    ],
  ]);
  assert.equal(
    createAutoMemoryUtilities({
      childProcess: {
        execSync: () => {
          throw Error("missing git");
        },
      },
    }).GitUtils.getGitUserName(),
    undefined,
  );
});
const policy = await loadMemoryPolicy();
async function owned(t: any) {
  const root = await mkdtemp(join(tmpdir(), "harness-auto-memory-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}
const answer = (text: string): any => ({
  type: "message",
  role: "assistant",
  status: "completed",
  id: "owned-answer",
  content: [{ type: "output_text", text }],
});
function modelFixture(
  output: (n: number, req: any) => any[],
  requests: any[],
): Model {
  let n = 0;
  return {
    async getResponse() {
      return { output: [], usage: new Usage() };
    },
    async *getStreamedResponse(req) {
      requests.push(req);
      const values = output(++n, req);
      yield { type: "response_started" };
      for (const item of values)
        if (item.type === "message")
          yield { type: "output_text_delta", delta: item.content[0].text };
      yield {
        type: "response_done",
        response: {
          id: "owned-response",
          usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
          output: values,
        },
      } as any;
    },
  };
}
async function host(
  t: any,
  output: (n: number, req: any) => any[] = () => [answer("owned complete")],
  extra: any = {},
) {
  const root = await owned(t),
    requests: any[] = [],
    names: any[] = [],
    model = modelFixture(output, requests);
  return {
    root,
    requests,
    names,
    async start(options: any = {}) {
      const h = await createHarness({
        workDir: root,
        stateDir: join(root, "state"),
        model: "owned-external-model",
        modelProvider: {
          getModel: (name: any) => {
            names.push(name);
            return model;
          },
        },
        autoMemory: {
          env: {},
          gitUserName: () => undefined,
          userInfo: () => ({ username: "owned-user" }),
        },
        ...extra,
        ...options,
      });
      t.after(() => h.close());
      return h;
    },
  };
}
test("native auto-memory defaults on with exact disable/enabled/typed env precedence", async () => {
  const f = autoMemoryFixture(policy);
  assert.equal(await f.context.isAutoMemoryEnabled(), true);
  f.runtime.env.CODEBUDDY_MEMORY_ENABLED = " true ";
  assert.equal(await f.context.isAutoMemoryEnabled(), false);
  f.runtime.env.CODEBUDDY_DISABLE_AUTO_MEMORY = "0";
  assert.equal(await f.context.isAutoMemoryEnabled(), true);
  f.runtime.env.CODEBUDDY_DISABLE_AUTO_MEMORY = "1";
  assert.equal(await f.context.isAutoMemoryEnabled(), false);
  f.runtime.env.CODEBUDDY_TYPED_MEMORY_ENABLED = "false";
  assert.equal(await f.context.isTypedMemoryEnabled(), false);
  f.runtime.env.CODEBUDDY_TYPED_MEMORY_ENABLED = " false ";
  assert.equal(await f.context.isTypedMemoryEnabled(), true);
});
test("typed entrypoint trims, limits 200 lines/40000 UTF-16 units and carries exact warning", () => {
  const f = autoMemoryFixture(policy),
    p = f.runtime.prompts;
  assert.equal(p.truncateEntrypointContent(" x\n ").content, "x");
  const lines = p.truncateEntrypointContent(
    Array.from({ length: 201 }, (_, i) => "line" + i).join("\n"),
  );
  assert.equal(lines.lineCount, 201);
  assert.equal(lines.wasLineTruncated, true);
  assert.doesNotMatch(lines.content, /line200/);
  assert.match(
    lines.content,
    /> WARNING: MEMORY.md is 201 lines \(limit: 200\)/,
  );
  const chars = p.truncateEntrypointContent("💡".repeat(20001));
  assert.equal(chars.charCount, 40002);
  assert.equal(chars.wasCharTruncated, true);
});
test("legacy entrypoint preserves its separate truncation and untrimmed empty behavior", async () => {
  const f = autoMemoryFixture(policy);
  f.settings.memory = { typedMemory: false };
  f.add("/owned/memory/MEMORY.md", "x".repeat(40001));
  const text = await f.context.generateMemoryPrompt();
  assert.match(text, /Current MEMORY.md contents/);
  assert.match(text, /\.\.\. \(truncated\)/);
  assert.doesNotMatch(text, /> WARNING:/);
  f.add("/owned/memory/MEMORY.md", "   ");
  assert.match(
    await f.context.generateMemoryPrompt(),
    /Current MEMORY.md contents/,
  );
});
test("team routing uses env then settings then Git then OS identity and still probes identity when team disabled", async () => {
  const f = autoMemoryFixture(policy);
  f.settings.memory = { teamMemory: { enabled: true, userId: "setting" } };
  assert.equal(
    (await f.context.getMemoryDir()).memoryDir,
    "/owned/team/@setting",
  );
  f.runtime.env.CODEBUDDY_USER_ID = "env";
  assert.equal((await f.context.getMemoryDir()).memoryDir, "/owned/team/@env");
  delete f.runtime.env.CODEBUDDY_USER_ID;
  f.settings.memory = { teamMemory: { enabled: false } };
  let called = 0;
  f.runtime.utilities.GitUtils.getGitUserName = () => {
    called++;
    return "git";
  };
  assert.equal((await f.context.getMemoryDir()).memoryDir, "/owned/memory");
  assert.equal(called, 1);
});
test("query extraction strips reminder/command wrappers and marker detection only checks first user", () => {
  const f = autoMemoryFixture(policy);
  const input = [
    { type: "message", role: "user", content: "first" },
    {
      type: "message",
      role: "user",
      content:
        "<system-reminder>ignore</system-reminder><command-name>x</command-name><local-command-stdout>out</local-command-stdout><command-message>label</command-message> query",
    },
  ];
  assert.equal(f.context.extractLastUserQuery(input), "query");
  assert.equal(
    f.context.shouldInjectMemoryContext({ input, session: f.session }),
    true,
  );
  input[0]!.content =
    '<system-reminder data-role="memory">loaded</system-reminder>';
  assert.equal(
    f.context.shouldInjectMemoryContext({ input, session: f.session }),
    false,
  );
});
test("native scanner pre-aborted scan is empty but direct readFileHead retains original no-precheck behavior", async () => {
  const f = autoMemoryFixture(policy);
  f.add("/owned/memory/a.md", "abcdefghijkl");
  const abort = new AbortController();
  abort.abort();
  assert.deepEqual(
    await f.runtime.scanner.scanMemoryFiles("/owned/memory", abort.signal),
    [],
  );
  assert.equal(
    (
      await f.runtime.scanner.readFileHead(
        "/owned/memory/a.md",
        4,
        abort.signal,
      )
    ).content,
    "abcd",
  );
});
test("native scanner excludes basename MEMORY.md, sorts by mtime and caps 200 files", async () => {
  const f = autoMemoryFixture(policy);
  f.add("/owned/memory/nested/MEMORY.md", "ignored");
  for (let i = 0; i < 205; i++)
    f.add("/owned/memory/file" + i + ".md", "---\ntype: project\n---\nbody", i);
  const rows = await f.runtime.scanner.scanMemoryFiles("/owned/memory");
  assert.equal(rows.length, 200);
  assert.equal(rows[0].filename, "file204.md");
  assert.equal(rows.at(-1).filename, "file5.md");
});
test("freshness floors/clamps days and emits no warning for today/yesterday", () => {
  const f = autoMemoryFixture(policy);
  assert.equal(f.runtime.freshness.memoryAge(f.now + 1000), "today");
  assert.equal(f.runtime.freshness.memoryAge(f.now - 86400000), "yesterday");
  assert.equal(
    f.runtime.freshness.memoryFreshnessText(f.now - 1.99 * 86400000),
    "",
  );
  assert.match(
    f.runtime.freshness.memoryFreshnessText(f.now - 2 * 86400000),
    /2 days old/,
  );
  assert.match(
    f.runtime.freshness.memoryFreshnessNote(f.now - 3 * 86400000),
    /data-role="memory-freshness"/,
  );
});
test("freshness hook retains project-prefix matching, event priority and stat failure handling", async () => {
  const f = autoMemoryFixture(policy);
  assert.equal(f.freshnessHook.event, "PostToolUse");
  assert.equal(f.freshnessHook.priority, 500);
  assert.equal(f.freshnessHook.matcher, "Read");
  f.add("/owned/memory-other/a.md", "owned");
  assert.ok(
    await f.freshnessHook.execute({
      tool_input: { file_path: "/owned/memory-other/a.md" },
    }),
  );
  assert.equal(
    await f.freshnessHook.execute({
      tool_input: { file_path: "/outside/a.md" },
    }),
    undefined,
  );
  assert.equal(
    await f.freshnessHook.execute({
      tool_input: { file_path: "/owned/memory/missing" },
    }),
    undefined,
  );
});
test("relevance preserves duplicate valid filenames and ignores unknown paths", async () => {
  const f = autoMemoryFixture(policy);
  f.settings.memory = { relevanceSelection: true };
  f.add("/owned/memory/a.md", "owned");
  f.selected = 'text {"selected_memories":["a.md","../outside","a.md"]}';
  const selected = await f.relevance.selectRelevantMemories(
    "q",
    "/owned/memory",
    [],
    new Set(),
    undefined,
  );
  assert.equal(selected.length, 2);
  assert.equal(f.events.filter((e) => e[0] === "one-time").length, 1);
});
test("direct AI selection on pre-aborted signal still invokes native service with aborted child and discards output", async () => {
  const f = autoMemoryFixture(policy),
    abort = new AbortController();
  abort.abort();
  const result = await f.relevance.doAISelection(
    "q",
    [{ filename: "a.md", mtimeMs: f.now }],
    [],
    abort.signal,
  );
  assert.deepEqual(result, []);
  assert.equal(f.events.find((e) => e[0] === "one-time")?.[4], true);
});
test("selected file is marked surfaced before failed read and is not rolled back", async () => {
  const f = autoMemoryFixture(policy);
  f.relevance.selectRelevantMemories = async () => [
    { path: "/owned/memory/missing", mtimeMs: f.now },
  ];
  assert.equal(
    await f.context.getRelevantMemoriesContent(
      "q",
      "/owned/memory",
      f.session,
      undefined,
    ),
    "",
  );
  assert.ok(
    (f.session as any).memoriesSurfacedInSession.has("/owned/memory/missing"),
  );
});
test("relevance cancellation records interrupted assistant, sets skipRun and forces idle", async () => {
  const f = autoMemoryFixture(policy);
  f.settings.memory = { relevanceSelection: true };
  f.relevance.selectRelevantMemories = async () => {
    f.session.abortController.abort();
    return [];
  };
  const input = f.input();
  await f.context.intercept(input);
  assert.equal(input.skipRun, true);
  assert.deepEqual(
    f.events.find((e) => e[0] === "idle"),
    ["idle", "owned-parent", "memory-aborted-by-user"],
  );
  assert.match(
    JSON.stringify(f.events.find((e) => e[0] === "history")),
    /Interrupted by user/,
  );
});
test("native extraction creates 5-turn RunState, restores shared permission/purpose and advances cursor", async () => {
  const f = autoMemoryFixture(policy);
  f.settings.memory = { memoryExtraction: true };
  f.session.agentPurpose = "conversation";
  await f.extraction.doExtract(f.session);
  const run = f.events.find((e) => e[0] === "run-extract");
  assert.ok(run);
  assert.equal(run[3], 5);
  assert.equal(run[5], 5);
  assert.equal(run[4], "owneduuid");
  assert.equal(f.extraction.lastMemoryMessageUuid, "a");
  assert.equal(f.session.agentPurpose, "conversation");
  assert.equal(f.session.permissionModeSubject.value, "default");
  assert.equal(f.extraction.inProgress, false);
});
test("native extraction failure logs, restores flags and does not advance cursor", async () => {
  const f = autoMemoryFixture(policy);
  f.settings.memory = { memoryExtraction: true };
  f.runnerProvider.get = async () =>
    ({
      run: async () => {
        throw Error("owned failure");
      },
    }) as any;
  await f.extraction.doExtract(f.session);
  assert.equal(f.extraction.lastMemoryMessageUuid, undefined);
  assert.equal(f.extraction.inProgress, false);
  assert.equal(f.session.permissionModeSubject.value, "default");
  assert.ok(f.logs.some((e) => String(e[1]).includes("owned failure")));
});
test("Stop hook waits for extraction in nonTTY only and uses Low=800", async () => {
  const f = autoMemoryFixture(policy);
  let starts = 0,
    waits = 0;
  f.stopHook.extractionService = {
    extractAsync: () => starts++,
    waitForExtraction: async () => {
      waits++;
    },
  };
  await f.stopHook.execute({ session: f.session });
  f.runtime.isTTY = () => true;
  await f.stopHook.execute({ session: f.session });
  assert.equal(starts, 2);
  assert.equal(waits, 1);
  assert.equal(f.stopHook.priority, 800);
});
test("real SDK receives typed entrypoint and reloads it on a new session without changing first conversation context", async (t) => {
  const f = await host(t);
  await mkdir(join(f.root, "state/memory"), { recursive: true });
  await writeFile(
    join(f.root, "state/memory/MEMORY.md"),
    "OWNED_MEMORY_INDEX_OLD",
  );
  const h = await f.start(),
    s = await h.openSession();
  await h.prompt(s, "hello");
  assert.match(JSON.stringify(f.requests[0].input), /OWNED_MEMORY_INDEX_OLD/);
  await writeFile(
    join(f.root, "state/memory/MEMORY.md"),
    "OWNED_MEMORY_INDEX_NEW",
  );
  await h.prompt(s, "again");
  assert.doesNotMatch(
    JSON.stringify(f.requests[1].input),
    /OWNED_MEMORY_INDEX_NEW/,
  );
  const next = await h.openSession();
  await h.prompt(next, "new session");
  assert.match(JSON.stringify(f.requests[2].input), /OWNED_MEMORY_INDEX_NEW/);
});
test("real SDK memorySelector runs before main, uses explicit CLI model fallback, dedups later turns and releases auxiliary sessions", async (t) => {
  const f = await host(t, (n) => [
    answer(n === 1 ? '{"selected_memories":["a.md"]}' : "main"),
  ]);
  await mkdir(join(f.root, "state/memory"), { recursive: true });
  await writeFile(
    join(f.root, "state/memory/a.md"),
    "---\nname: Owned\ntype: project\ndescription: fixture\n---\nOWNED_RELEVANT_BODY",
  );
  const h = await f.start({
      settings: {
        get: async (k: string) =>
          k === "memory" ? { relevanceSelection: true } : undefined,
      },
    }),
    s = await h.openSession();
  assert.equal(await h.prompt(s, "select fixture"), "main");
  assert.match(JSON.stringify(f.requests[0].input), /Available memories/);
  assert.match(JSON.stringify(f.requests[1].input), /OWNED_RELEVANT_BODY/);
  await h.prompt(s, "again");
  assert.equal(f.requests.length, 3);
  assert.ok(f.names.every((n) => n === "owned-external-model"));
  assert.ok(h.sessions.getCachedSessions().length > 1);
  await h.close();
  assert.equal(h.sessions.getCachedSessions().length, 0);
});
test("real SDK Read of old project memory appends original freshness context inside tool-hint", async (t) => {
  let filename = "";
  const f = await host(t, (n) =>
    n === 1
      ? [
          {
            type: "function_call",
            id: "read",
            callId: "read",
            name: "Read",
            status: "completed",
            arguments: JSON.stringify({ file_path: filename }),
          },
        ]
      : [answer("done")],
  );
  await mkdir(join(f.root, "state/memory"), { recursive: true });
  filename = join(f.root, "state/memory/old.md");
  await writeFile(filename, "OWNED_OLD_MEMORY");
  const old = new Date(Date.now() - 4 * 86400000);
  await utimes(filename, old, old);
  const h = await f.start({ approveTool: () => true }),
    s = await h.openSession();
  await h.prompt(s, "read old");
  assert.match(
    JSON.stringify(f.requests[1].input),
    /data-role=\\"tool-hint\\"/,
  );
  assert.match(JSON.stringify(f.requests[1].input), /memory-freshness/);
  assert.match(JSON.stringify(f.requests[1].input), /4 days old/);
});
test("real SDK native extraction writes memory with five-tool agent and keeps main history/text isolated", async (t) => {
  let target = "";
  const f = await host(t, (n) =>
    n === 2
      ? [
          {
            type: "function_call",
            id: "write",
            callId: "write",
            name: "Write",
            status: "completed",
            arguments: JSON.stringify({
              file_path: target,
              content: "OWNED_EXTRACTED_MEMORY",
            }),
          },
        ]
      : [answer(n === 1 ? "main answer" : "extract done")],
  );
  target = join(f.root, "state/memory/owned.md");
  const h = await f.start({ memoryExtraction: true }),
    s = await h.openSession();
  let text = "";
  assert.equal(
    await h.prompt(s, "remember fixture", {
      onText: (v: string) => (text += v),
    }),
    "main answer",
  );
  await h.waitForMemory();
  assert.equal(text, "main answer");
  assert.equal(await readFile(target, "utf8"), "OWNED_EXTRACTED_MEMORY");
  assert.equal(f.requests.length, 3);
  assert.doesNotMatch(
    await readFile(h.store.getSessionFilePath(s.id), "utf8"),
    /memory extraction subagent|OWNED_EXTRACTED_MEMORY|extract done/,
  );
  assert.equal(s.permissionModeSubject.value, "default");
});
test("real SDK cancellation during selection prevents main call and records native interrupted result", async (t) => {
  const root = await owned(t);
  await mkdir(join(root, "state/memory"), { recursive: true });
  await writeFile(join(root, "state/memory/a.md"), "owned");
  let started!: () => void;
  const active = new Promise<void>((r) => (started = r));
  let calls = 0;
  const model: Model = {
    async getResponse() {
      return { output: [], usage: new Usage() };
    },
    async *getStreamedResponse(req) {
      calls++;
      yield { type: "response_started" };
      started();
      await new Promise<void>((_, reject) => {
        if (req.signal?.aborted)
          reject(Object.assign(Error("Aborted"), { name: "AbortError" }));
        else
          req.signal?.addEventListener(
            "abort",
            () =>
              reject(Object.assign(Error("Aborted"), { name: "AbortError" })),
            { once: true },
          );
      });
    },
  };
  const h = await createHarness({
    workDir: root,
    stateDir: join(root, "state"),
    modelProvider: { getModel: () => model },
    settings: {
      get: async <T>(k: string) =>
        (k === "memory" ? { relevanceSelection: true } : undefined) as
          | T
          | undefined,
    },
    autoMemory: { env: {}, userInfo: () => ({ username: "owned" }) },
  });
  t.after(() => h.close());
  const s = await h.openSession(),
    controller = new AbortController(),
    result = h.prompt(s, "cancel selection", { signal: controller.signal });
  await active;
  controller.abort();
  await result.catch(() => undefined);
  assert.equal(calls, 1);
  assert.match(JSON.stringify(s.history), /Interrupted by user/);
  assert.equal(s.status, "idle");
});
test("compiled/source CLI local SSE receives auto memory entrypoint with no installed credentials", async (t) => {
  const root = await owned(t);
  await mkdir(join(root, "state/memory"), { recursive: true });
  await writeFile(
    join(root, "state/memory/MEMORY.md"),
    "OWNED_CLI_AUTO_MEMORY",
  );
  const requests: any[] = [],
    server = createServer(async (req, res) => {
      let body = "";
      for await (const b of req) body += b;
      requests.push(JSON.parse(body));
      res.writeHead(200, { "content-type": "text/event-stream" });
      res.end(
        "data: " +
          JSON.stringify({
            id: "owned",
            choices: [
              {
                index: 0,
                delta: { role: "assistant", content: "owned cli" },
                finish_reason: null,
              },
            ],
          }) +
          "\n\ndata: " +
          JSON.stringify({
            id: "owned",
            choices: [{ index: 0, delta: {}, finish_reason: "stop" }],
          }) +
          "\n\ndata: [DONE]\n\n",
      );
    });
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  t.after(() => new Promise<void>((r) => server.close(() => r())));
  const address = server.address() as any,
    source = import.meta.url.endsWith(".ts"),
    filename = fileURLToPath(
      new URL("../src/cli." + (source ? "ts" : "js"), import.meta.url),
    ),
    child = spawn(
      process.execPath,
      [
        ...(source ? ["--import", "tsx"] : []),
        filename,
        "--cwd",
        root,
        "--state-dir",
        join(root, "state"),
        "--model",
        "owned",
        "-p",
        "hello",
      ],
      {
        env: {
          ...process.env,
          CODEBUDDY_DISABLE_AUTO_MEMORY: "0",
          CODEBUDDY_API_KEY: "owned",
          OPENAI_API_KEY: "owned",
          CODEBUDDY_BASE_URL: `http://127.0.0.1:${address.port}/v1`,
        },
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
  let text = "",
    errors = "";
  child.stdout.on("data", (v) => (text += v));
  child.stderr.on("data", (v) => (errors += v));
  const code = await new Promise<number | null>((r) => child.on("exit", r));
  assert.equal(code, 0, errors);
  assert.match(text, /owned cli/);
  assert.match(JSON.stringify(requests), /OWNED_CLI_AUTO_MEMORY/);
});

import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, mkdir, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { Usage, setTraceProcessors, type Model } from "@openai/agents-core";
import { memoryRuleFixture } from "../scripts/helpers/memory-rule-fixtures.js";
import { turn } from "../scripts/helpers/session-result-fixtures.js";
import { MemoryMarkdownUtils } from "../src/memory/native-memory-markdown.js";
import { LRUCache } from "../src/memory/native-memory-services.js";
import { createMemoryRulesHost } from "../src/memory/memory-rules-runtime.js";
import { createConditionalRulesToolInjector } from "../src/memory/conditional-rules-tool-injector.js";
import { ConditionalRulesAgentRunInterceptor } from "../src/agents/conditional-rules-agent-run-interceptor.js";
import { createHarness } from "../src/runtime/create-harness.js";
setTraceProcessors([]);
async function owned(t: any) {
  const root = await mkdtemp(join(tmpdir(), "harness-memory-rules-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}
const answer: any = {
  type: "message",
  role: "assistant",
  id: "owned-answer",
  status: "completed",
  content: [{ type: "output_text", text: "owned complete" }],
};
function fixtureModel(requests: any[], call?: any): Model {
  let count = 0;
  return {
    async getResponse() {
      return { output: [], usage: new Usage() };
    },
    async *getStreamedResponse(request) {
      requests.push(request);
      const output =
        call && ++count === 1
          ? [
              {
                type: "function_call",
                id: "owned-call",
                callId: "owned-call",
                status: "completed",
                name: call.name,
                arguments: JSON.stringify(call.input),
              },
            ]
          : [answer];
      yield { type: "response_started" };
      yield {
        type: "response_done",
        response: {
          id: "owned-response",
          usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
          output,
        },
      } as any;
    },
  };
}
async function harness(t: any, call?: any) {
  const root = await owned(t),
    requests: any[] = [],
    model = fixtureModel(
      requests,
      typeof call === "function" ? call(root) : call,
    );
  return {
    root,
    requests,
    model,
    async start(extra: any = {}) {
      const h = await createHarness({
        workDir: root,
        stateDir: join(root, "state"),
        approveTool: () => true,
        modelProvider: { getModel: () => model },
        ...extra,
      });
      t.after(() => h.close());
      return h;
    },
  };
}
test("native loader honors user/project/local scopes and ancestor/primary-name precedence", async () => {
  const f = memoryRuleFixture();
  f.add("/owned/AGENTS.md", "ancestor");
  f.add(f.cwd + "/CODEBUDDY.md", "primary");
  f.add(f.cwd + "/AGENTS.md", "ignored");
  f.add(f.cwd + "/.codebuddy/AGENTS.md", "hidden");
  f.add(f.home + "/CODEBUDDY.mdc", "user");
  f.add(f.cwd + "/CODEBUDDY.local.md", "local");
  const all = await f.manager.get({});
  assert.equal(all.length, 5);
  assert.ok(!all.some((r: any) => r.content === "ignored"));
  assert.deepEqual(
    (await f.manager.get({ scope: "project" })).map((r: any) => r.content),
    ["ancestor", "primary", "hidden"],
  );
  assert.equal((await f.manager.get({ scope: "user" }))[0].content, "user");
  assert.equal(
    (await f.manager.get({ scope: "project-local" }))[0].content,
    "local",
  );
});
test("memory frontmatter deliberately keeps small-parser inline-list quirks and braces-aware comma splitting", async () => {
  assert.equal(
    MemoryMarkdownUtils.extractFrontMatterWithContent(
      "---\npaths: [a,b]\n---\nbody",
    ).data.paths,
    "[a,b]",
  );
  assert.deepEqual(MemoryMarkdownUtils.parseListField("[a,b]"), ["[a", "b]"]);
  assert.deepEqual(MemoryMarkdownUtils.parseListField("src/{a,b}/**, *.ts"), [
    "src/{a,b}/**",
    "*.ts",
  ]);
  const f = memoryRuleFixture();
  f.add("/owned/r.md", "---\npaths: *.ts\n---\nbody");
  const rule = await f.parser.parse("/owned/r.md", { scope: "project" });
  assert.equal(rule.type, "manual");
  assert.equal(rule.alwaysApply, false);
});
test("imported disabled/no-path rules load, cycles deduplicate and import depth stops at five", async () => {
  const f = memoryRuleFixture();
  for (let i = 0; i < 7; i++)
    f.add(
      "/owned/r" + i + ".md",
      "---\nenabled: false\nalwaysApply: false\n---\nrule " +
        i +
        (i < 6 ? " @r" + (i + 1) + ".md" : ""),
    );
  f.add(f.cwd + "/CODEBUDDY.md", "main @/owned/r0.md\n`@not-loaded.md`");
  const rules = await f.manager.get({});
  assert.equal(rules.length, 5);
  assert.ok(rules.some((r: any) => r.filePath === "/owned/r3.md"));
  assert.ok(!rules.some((r: any) => r.filePath === "/owned/r4.md"));
  assert.equal(
    rules.find((r: any) => r.filePath === "/owned/r0.md").enabled,
    false,
  );
});
test("rule validation uses UTF-16 length and still enforces imported oversize limit", async () => {
  const f = memoryRuleFixture(),
    base = {
      filePath: "/owned/r.md",
      enabled: false,
      alwaysApply: false,
      globs: [],
      content: "x".repeat(40000),
    };
  assert.equal(f.validator.validate(base), false);
  assert.equal(f.validator.validate(base, { isImported: true }), true);
  assert.equal(
    f.validator.validate(
      { ...base, content: "x".repeat(40001) },
      { isImported: true },
    ),
    false,
  );
  assert.equal(
    f.validator.validate({ ...base, enabled: true }, { isSubdirectory: true }),
    true,
  );
});
test("addFact preserves source section insertion/substr dedup and project AGENTS write fallback", async () => {
  const f = memoryRuleFixture(),
    file = f.cwd + "/AGENTS.md";
  f.add(
    file,
    "# Owned\n\n## CodeBuddy Added Memories\n- old\n\n## Next\nrest\n",
  );
  await f.manager.addFact("-- fact", "project");
  assert.equal(
    f.files.get(file),
    "# Owned\n\n## CodeBuddy Added Memories\n- old\n- fact\n\n## Next\nrest\n",
  );
  const writes = f.events.filter((e) => e[0] === "write").length;
  await f.manager.addFact("fact", "project");
  assert.equal(f.events.filter((e) => e[0] === "write").length, writes);
});
test("native cache coalesces failures, retains rejected promise and reloads only after clear", async () => {
  const f = memoryRuleFixture();
  let loads = 0;
  f.loader.loadAll = async () => {
    loads++;
    throw Error("owned load failure");
  };
  await Promise.all([
    assert.rejects(f.manager.get(), /owned load failure/),
    assert.rejects(f.manager.get(), /owned load failure/),
  ]);
  assert.equal(loads, 1);
  await assert.rejects(f.manager.get(), /owned load failure/);
  assert.equal(loads, 1);
  f.manager.clear();
  await assert.rejects(f.manager.get(), /owned load failure/);
  assert.equal(loads, 2);
});
test("source LRU promotes on get and evicts oldest key, including overwrite", () => {
  const cache = new LRUCache({ max: 2 });
  cache.set("a", 1);
  cache.set("b", 2);
  assert.equal(cache.get("a"), 1);
  cache.set("c", 3);
  assert.equal(cache.get("b"), undefined);
  cache.set("a", 4);
  cache.set("d", 5);
  assert.equal(cache.get("c"), undefined);
  assert.equal(cache.get("a"), 4);
  cache.clear();
  assert.equal(cache.map.size, 0);
});
test("subdirectory loader excludes root/codebuddy, anchors globs and keeps negative cache until clear", async () => {
  const f = memoryRuleFixture();
  f.add(f.cwd + "/CODEBUDDY.md", "root");
  const first = await f.subdirLoader.loadForPaths([f.cwd + "/src/a.ts"]);
  assert.deepEqual(first, []);
  f.add(f.cwd + "/src/CODEBUDDY.md", "src");
  assert.deepEqual(
    await f.subdirLoader.loadForPaths([f.cwd + "/src/a.ts"]),
    [],
  );
  f.subdirLoader.clear();
  const loaded = await f.subdirLoader.loadForPaths([f.cwd + "/src/a.ts"]);
  assert.equal(loaded.length, 1);
  assert.deepEqual(loaded[0].globs, ["src/**"]);
  assert.deepEqual(
    await f.subdirLoader.loadForPaths([f.cwd + "/.codebuddy/private/a.ts"]),
    [],
  );
  assert.equal(f.subdirLoader.isSubPath(f.cwd, f.cwd), false);
});
test("original minimatch semantics are per-pattern OR, case-sensitive, dot-excluding and negation-aware", () => {
  const f = memoryRuleFixture();
  assert.equal(f.globMatcher.matches(f.cwd + "/src/a.ts", ["*.ts"]), true);
  assert.equal(f.globMatcher.matches(f.cwd + "/src/A.TS", ["*.ts"]), false);
  assert.equal(f.globMatcher.matches(f.cwd + "/src/.a.ts", ["*.ts"]), false);
  assert.equal(
    f.globMatcher.matches(f.cwd + "/src/a.txt", ["*.ts", "!*.md"]),
    true,
  );
  assert.equal(f.globMatcher.matches("/outside/a.ts", ["*.ts"]), false);
});
test("InstructionsLoaded is nonblocking in native loader; owned host close waits dispatched hook", async () => {
  const f = memoryRuleFixture();
  f.add(f.cwd + "/CODEBUDDY.md", "owned");
  let release!: () => void,
    started = 0;
  const blocker = new Promise<void>((r) => (release = r)),
    host = createMemoryRulesHost(() => f.cwd, f.home, {
      fs: f.runtime.fs,
      instructionsHooks: {
        hasHooks: () => true,
        async executeHooks(event, input) {
          assert.equal(event, "InstructionsLoaded");
          assert.equal(input.load_reason, "session_start");
          started++;
          await blocker;
        },
      },
    });
  const rules = await host.manager.get();
  assert.equal(rules.length, 1);
  await turn();
  assert.equal(started, 1);
  let closed = false;
  const closing = host.close().then(() => {
    closed = true;
  });
  await turn();
  assert.equal(closed, false);
  release();
  await closing;
  assert.equal(closed, true);
});
test("conditional consume emits original prompt once and preserves pending triggers if matching throws", async () => {
  const f = memoryRuleFixture();
  f.add(f.cwd + "/.codebuddy/rules/x.md", "---\npaths: *.ts\n---\nowned rule");
  const state = {
    pendingTriggers: new Set([f.cwd + "/a.ts"]),
    processedRules: new Set(),
  };
  const result = await f.conditionalRules.consume(state);
  assert.equal(result.matchedCount, 1);
  assert.match(
    result.content,
    /<conditional_workspace_rules description="These rules trigger based on file context.">/,
  );
  assert.equal(state.pendingTriggers.size, 0);
  state.pendingTriggers.add(f.cwd + "/a.ts");
  assert.equal((await f.conditionalRules.consume(state)).matchedCount, 0);
  f.conditionalRules.findMatchingRules = async () => {
    throw Error("owned");
  };
  state.pendingTriggers.add("again");
  await assert.rejects(f.conditionalRules.consume(state), /owned/);
  assert.ok(state.pendingTriggers.has("again"));
});
test("post-tool injector marks rules before result-shape check and logs null ToolResult error without throwing", async () => {
  const f = memoryRuleFixture();
  f.add(f.cwd + "/.codebuddy/rules/x.md", "---\npaths: *.ts\n---\nowned");
  const state = {
      pendingTriggers: new Set<string>(),
      processedRules: new Set<string>(),
    },
    injector = createConditionalRulesToolInjector(
      f.conditionalRules,
      f.runtime.utilities.PathUtils,
      f.runtime.dependencies.logger,
    );
  await injector.injectConditionalRules(
    "Read",
    { file_path: "a.ts" },
    { conditionalRules: state },
    null,
  );
  assert.equal(state.pendingTriggers.size, 0);
  assert.equal(state.processedRules.size, 1);
  assert.ok(
    f.logs.some(
      (v) =>
        v[0] === "warn" &&
        String(v[1]).includes("Failed to inject conditional rules"),
    ),
  );
});
test("conditional run interceptor retains native 1740 priority, ignores nonarrays and injects last user", async () => {
  let calls = 0;
  const interceptor = new ConditionalRulesAgentRunInterceptor({
      async consume(state: any) {
        calls++;
        state.pendingTriggers.clear();
        return { content: "owned reminder" };
      },
    }),
    state = { pendingTriggers: new Set(["x"]), processedRules: new Set() };
  await interceptor.intercept({
    input: "plain",
    session: { conditionalRules: state },
  });
  assert.equal(calls, 0);
  const input: any[] = [
    { type: "message", role: "user", content: "first" },
    { type: "message", role: "user", content: "last" },
  ];
  await interceptor.intercept({ input, session: { conditionalRules: state } });
  assert.equal(interceptor.priority, 1740);
  assert.equal(input[0].content, "first");
  assert.equal(input[1].content[0].text, "owned reminder");
});
test("real SDK first request receives user/project/local always rules but not inactive manual content", async (t) => {
  const f = await harness(t);
  await mkdir(join(f.root, "state"), { recursive: true });
  await mkdir(join(f.root, ".codebuddy/rules"), { recursive: true });
  await writeFile(join(f.root, "state/CODEBUDDY.md"), "OWNED_USER_ALWAYS");
  await writeFile(join(f.root, "CODEBUDDY.md"), "OWNED_PROJECT_ALWAYS");
  await writeFile(join(f.root, "CODEBUDDY.local.md"), "OWNED_LOCAL_ALWAYS");
  await writeFile(
    join(f.root, ".codebuddy/rules/manual.md"),
    "---\npaths: *.ts\n---\nOWNED_MANUAL_NOT_YET",
  );
  const h = await f.start(),
    session = await h.openSession();
  assert.equal(await h.prompt(session, "hello"), "owned complete");
  const request = JSON.stringify(f.requests[0]);
  for (const text of [
    "OWNED_USER_ALWAYS",
    "OWNED_PROJECT_ALWAYS",
    "OWNED_LOCAL_ALWAYS",
  ])
    assert.match(request, new RegExp(text));
  assert.doesNotMatch(
    JSON.stringify(f.requests[0].input),
    /OWNED_MANUAL_NOT_YET/,
  );
});
test("real SDK Read appends conditional/subdirectory rules to tool output and consumes triggers once", async (t) => {
  const f = await harness(t, (root: string) => ({
    name: "Read",
    input: { file_path: join(root, "src/a.ts") },
  }));
  await mkdir(join(f.root, "src"), { recursive: true });
  await mkdir(join(f.root, ".codebuddy/rules"), { recursive: true });
  await writeFile(join(f.root, "src/a.ts"), "owned source");
  await writeFile(join(f.root, "src/CODEBUDDY.md"), "OWNED_SUBDIR_RULE");
  await writeFile(
    join(f.root, ".codebuddy/rules/types.md"),
    "---\npaths: *.ts\n---\nOWNED_TYPES_RULE",
  );
  const h = await f.start(),
    s = await h.openSession();
  assert.equal(await h.prompt(s, "read fixture"), "owned complete");
  const payload = JSON.stringify(f.requests[1].input);
  assert.match(payload, /OWNED_TYPES_RULE/);
  assert.match(payload, /OWNED_SUBDIR_RULE/);
  assert.equal(s.conditionalRules.pendingTriggers.size, 0);
  assert.equal(s.conditionalRules.processedRules.size, 2);
  assert.match(
    await readFile(h.store.getSessionFilePath(s.id), "utf8"),
    /conditional_workspace_rules/,
  );
});
test("real SDK Write triggers matching rules without a preceding Read and keeps ordinary host approval", async (t) => {
  const f = await harness(t, (root: string) => ({
    name: "Write",
    input: { file_path: join(root, "new.ts"), content: "owned write" },
  }));
  await mkdir(join(f.root, ".codebuddy/rules"), { recursive: true });
  await writeFile(
    join(f.root, ".codebuddy/rules/write.md"),
    "---\npaths: *.ts\n---\nOWNED_WRITE_RULE",
  );
  let approvals = 0;
  const h = await f.start({
      approveTool: () => {
        approvals++;
        return true;
      },
    }),
    s = await h.openSession();
  await h.prompt(s, "write fixture");
  assert.equal(await readFile(join(f.root, "new.ts"), "utf8"), "owned write");
  assert.ok(approvals > 0);
  assert.match(JSON.stringify(f.requests[1].input), /OWNED_WRITE_RULE/);
  assert.equal(s.conditionalRules.processedRules.size, 1);
});
test("real SDK run-time pending trigger injection and explicit cache invalidation use native lifecycle", async (t) => {
  const f = await harness(t);
  await mkdir(join(f.root, ".codebuddy/rules"), { recursive: true });
  await writeFile(join(f.root, "CODEBUDDY.md"), "OLD_ALWAYS");
  await writeFile(
    join(f.root, ".codebuddy/rules/pending.md"),
    "---\npaths: *.ts\n---\nOWNED_PENDING_RULE",
  );
  const h = await f.start(),
    s = await h.openSession();
  s.conditionalRules.pendingTriggers.add(join(f.root, "a.ts"));
  await h.prompt(s, "first");
  assert.match(JSON.stringify(f.requests[0].input), /OWNED_PENDING_RULE/);
  await writeFile(join(f.root, "CODEBUDDY.md"), "NEW_ALWAYS");
  assert.equal(
    (
      await h.memoryRules.manager.get({ scope: "project", type: "always" })
    ).some((r: any) => r.content === "OLD_ALWAYS"),
    true,
  );
  h.memoryRules.clear();
  const next = await h.openSession();
  await h.prompt(next, "second");
  assert.match(JSON.stringify(f.requests[1].input), /NEW_ALWAYS/);
});
test("real CLI and loopback Chat Completions transport carry project instructions without installed account access", async (t) => {
  const root = await owned(t);
  await writeFile(join(root, "CODEBUDDY.md"), "OWNED_CLI_MEMORY_RULE");
  const requests: any[] = [];
  const server = createServer(async (req, res) => {
    let body = "";
    for await (const chunk of req) body += chunk;
    requests.push(JSON.parse(body));
    res.writeHead(200, { "content-type": "text/event-stream" });
    res.end(
      "data: " +
        JSON.stringify({
          id: "owned",
          object: "chat.completion.chunk",
          choices: [
            {
              index: 0,
              delta: { role: "assistant", content: "owned cli complete" },
              finish_reason: null,
            },
          ],
        }) +
        "\n\ndata: " +
        JSON.stringify({
          id: "owned",
          object: "chat.completion.chunk",
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
    );
  const child = spawn(
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
        CODEBUDDY_API_KEY: "owned-fixture",
        OPENAI_API_KEY: "owned-fixture",
        CODEBUDDY_BASE_URL: `http://127.0.0.1:${address.port}/v1`,
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  let stdout = "",
    stderr = "";
  child.stdout.on("data", (b) => (stdout += b));
  child.stderr.on("data", (b) => (stderr += b));
  const code = await new Promise<number | null>((r) => child.on("exit", r));
  assert.equal(code, 0, stderr);
  assert.match(stdout, /owned cli complete/);
  assert.match(JSON.stringify(requests), /OWNED_CLI_MEMORY_RULE/);
});

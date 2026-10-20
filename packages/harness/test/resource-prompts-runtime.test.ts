import assert from "node:assert/strict";
import test from "node:test";
import * as fs from "node:fs/promises";
import * as nodeFs from "node:fs";
import * as http from "node:http";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";
import { Usage, setTraceProcessors, type Model } from "@openai/agents-core";
import {
  createResourcePromptHost,
  type ResourcePromptHostOptions,
} from "../src/prompts/resource-prompt-host.js";
import { resourcePromptFixture } from "../scripts/helpers/resource-prompt-fixtures.js";
import { verifyDesktopTemplateAssets } from "../src/prompts/desktop-template-assets.js";
import { createNativePromptCliLanguage } from "../src/prompts/native-prompt-cli-language.js";
import { createAddonSession } from "../src/runtime/create-addon-session.js";
setTraceProcessors([]);
async function rootDir() {
  return fs.mkdtemp(join(tmpdir(), "resource-prompts-"));
}
async function put(file: string, content: any) {
  await fs.mkdir(join(file, ".."), { recursive: true });
  await fs.writeFile(
    file,
    typeof content === "string" ? content : JSON.stringify(content),
  );
}
async function fixture(t: any, spec: any = {}) {
  const root = await rootDir(),
    h = await resourcePromptFixture(root, undefined, spec);
  t.after(async () => {
    await h.dispose();
    await fs.rm(root, { recursive: true, force: true });
  });
  return h;
}
async function host(
  t: any,
  spec: Partial<
    Omit<ResourcePromptHostOptions, "stateDir" | "getWorkDir">
  > = {},
) {
  const root = await rootDir(),
    h = await createResourcePromptHost({
      stateDir: join(root, "state"),
      getWorkDir: () => root,
      ...spec,
    });
  t.after(async () => {
    await h.close();
    await fs.rm(root, { recursive: true, force: true });
  });
  return { root, h };
}
async function server(t: any, listener: http.RequestListener) {
  const s = http.createServer(listener);
  await new Promise<void>((resolve) => s.listen(0, "127.0.0.1", resolve));
  t.after(async () => {
    s.closeAllConnections();
    await new Promise<void>((r) => s.close(() => r()));
  });
  return `http://127.0.0.1:${(s.address() as any).port}`;
}
const opts = (h: any, extra: any = {}) => ({
  cwd: h.cwd ?? h.root,
  modelId: "owned-id",
  conversationId: "owned-conversation",
  ...extra,
});
const auth = {
  getAccount: () => ({ uid: "owned-user" }),
  getToken: () => "owned-token",
};
test("all 22 captured desktop templates and styles remain byte-checked separately from product prompts", () => {
  const result = verifyDesktopTemplateAssets();
  assert.equal(result.files, 22);
  assert.ok(result.bytes > 50000);
});
test("native renderer constructs nine collectors in exact source order", async (t) => {
  const f = await fixture(t);
  assert.deepEqual(
    f.service
      .getRenderer()
      .getCollectors()
      .map((c: any) => c.constructor.name),
    [
      "EnvCollector",
      "IdentityCollector",
      "PersonalizationCollector",
      "MemoryCollector",
      "UserMemoryCollector",
      "CollaborationCollector",
      "ExpertPromptSlotCollector",
      "ExpertManagementCollector",
      "BinaryCollector",
    ],
  );
});
test("ask template wins stale expert ID while source identity collection and user-context still treat it as expert", async (t) => {
  const f = await fixture(t);
  const options = opts(f, {
    mode: "ask",
    expertId: "stale-expert",
    welcomeMode: "code",
  });
  const vars = await f.service.collectSystemPromptVariables(options),
    text = await f.service.renderSystemPrompt(options);
  assert.equal(f.native.selectTemplateKind(true, options), "ask-code");
  assert.equal(vars.WorkspaceIdentityMode, "normal");
  assert.equal(vars.IdentityContent, undefined);
  assert.equal(vars.PluginAgentPrompt, "{# {{ PluginAgentPrompt }} #}");
  assert.match(text, /Ask mode/);
});
test("locale comes from native app config/system locale, not the per-call locale field", async (t) => {
  const f = await fixture(t, {
    locale: "en-US",
    appConfig: { locale: " zh-CN " },
  });
  const vars = await f.service.collectSystemPromptVariables(
    opts(f, { locale: "en-US" }),
  );
  assert.match(vars.ResponseLanguage, /使用简体中文/);
  assert.equal(
    createNativePromptCliLanguage(f.native).resolveCliSettingsLanguage({
      readAppConfigValue: f.native.readAppConfigValue,
      getSystemLocale: () => "en",
    }),
    "简体中文",
  );
});
test("native identity bootstrap seeds wx files, completes on deletion, and never reseeds a completed workspace", async (t) => {
  const { h, root } = await host(t);
  const first = await h.service.collectSystemPromptVariables({ cwd: root });
  assert.equal(first.WorkspaceIdentityMode, "onboarding");
  await fs.unlink(join(h.configDir, "BOOTSTRAP.md"));
  const next = await h.service.collectSystemPromptVariables({ cwd: root });
  assert.equal(next.WorkspaceIdentityMode, "normal");
  const state = JSON.parse(
    await fs.readFile(join(h.configDir, "workspace-state.json"), "utf8"),
  );
  assert.equal(typeof state.onboardingCompletedAt, "string");
  await h.service.collectSystemPromptVariables({ cwd: root });
  await assert.rejects(fs.access(join(h.configDir, "BOOTSTRAP.md")));
});
test("preexisting identity/user content suppresses first onboarding but editing only SOUL does not", async (t) => {
  const first = await fixture(t);
  await first.put("home/.workbuddy/IDENTITY.md", "owned identity");
  const vars = await first.service.collectSystemPromptVariables(opts(first));
  assert.equal(vars.WorkspaceIdentityMode, "normal");
  const second = await fixture(t);
  await second.put("home/.workbuddy/SOUL.md", "owned soul");
  const next = await second.service.collectSystemPromptVariables(opts(second));
  assert.equal(next.WorkspaceIdentityMode, "onboarding");
  assert.equal(next.SoulContent, "owned soul");
});
test("identity initialization coalesces in-flight work, not a permanent initialized boolean", async (t) => {
  const f = await fixture(t),
    collector = f.service.getRenderer().getCollectors()[1];
  const a = collector.ensureWorkBuddyPromptContextWorkspaceOnce(),
    b = collector.ensureWorkBuddyPromptContextWorkspaceOnce();
  assert.equal(a, b);
  await a;
  assert.notEqual(collector.ensureWorkBuddyPromptContextWorkspaceOnce(), a);
  await f.drain();
});
test("personalization prefers even an empty app config object over legacy and lives in user context", async (t) => {
  const f = await fixture(t, { appConfig: { personalization: {} } });
  await f.put("home/.workbuddy/settings.json", {
    personalization: { toneStyle: "friendly", customPrompt: "legacy-marker" },
  });
  const vars = await f.service.collectSystemPromptVariables(opts(f));
  assert.equal(vars.UserCustomPrompt, undefined);
  await f.put("home/.workbuddy/app/app-config.json", {
    personalization: { customPrompt: "owned-context-marker" },
  });
  assert.match(
    await f.service.renderUserContext(opts(f)),
    /owned-context-marker/,
  );
  assert.doesNotMatch(
    await f.service.renderSystemPrompt(opts(f)),
    /owned-context-marker/,
  );
});
test("local memory disable leaves cloud memory enabled and removes both local contents", async (t) => {
  const f = await fixture(t, {
    account: { uid: "owned-user" },
    token: "owned-token",
    appConfig: { disableLocalSkillsMemory: true },
  });
  await f.put("project/.workbuddy/memory/MEMORY.md", "project local");
  await f.put("home/.workbuddy/MEMORY.md", "user local");
  const v = await f.service.collectSystemPromptVariables(opts(f));
  assert.equal(v.WorkingMemoryContent, "");
  assert.equal(v.UserLocalMemoryContent, "");
  assert.equal(v.LocalSkillsMemoryEnabled, "");
  assert.match(v.UserMemoryContent, /owned cloud profile/);
  assert.doesNotMatch(v.WorkbuddyMemory_1, /# Layer 2/);
});
test("memory character boundaries retain 8000 project, 4000 user and 10000 identity truncation notices", async (t) => {
  const f = await fixture(t);
  await f.put("project/.workbuddy/memory/MEMORY.md", "m".repeat(8001));
  await f.put("home/.workbuddy/MEMORY.md", "u".repeat(4001));
  await f.put("home/.workbuddy/SOUL.md", "s".repeat(10001));
  const v = await f.service.collectSystemPromptVariables(opts(f));
  assert.match(v.WorkingMemoryContent, /ACTION REQUIRED/);
  assert.match(v.UserLocalMemoryContent, /user memory truncated/);
  assert.match(v.SoulContent, /content truncated/);
  assert.doesNotMatch(v.SoulContent, /s{10001}/);
});
test("unauthenticated account can use local cloud profile, and legacy archive migrates through native lock/version guard", async (t) => {
  const { h, root } = await host(t, {
    auth: { getAccount: auth.getAccount, getToken: () => undefined },
  });
  const legacy = join(h.configDir, "memery", "owned-user_memery.md");
  await put(
    legacy,
    h.native.toMarkdown({
      uid: "other",
      version: 2,
      memoryBlock: "owned archived memory",
    }),
  );
  const vars = await h.service.collectSystemPromptVariables({ cwd: root });
  await h.flush();
  assert.match(vars.UserMemoryContent, /owned archived memory/);
  const migrated = await h.native.readProfile("owned-user", {
    baseDir: join(h.configDir, "memory"),
    legacyBaseDir: join(h.configDir, "memery"),
  });
  assert.equal(migrated.uid, "owned-user");
  assert.equal(migrated.version, 2);
  await fs.access(legacy);
});
test("archive version equality skips, older version rejects, newer version leaves an exact backup", async (t) => {
  const { h } = await host(t);
  const options = {
    baseDir: join(h.configDir, "memory"),
    legacyBaseDir: join(h.configDir, "memery"),
  };
  assert.equal(
    (
      await h.native.writeProfile(
        "owned",
        { uid: "owned", version: 2, memoryBlock: "two" },
        options,
      )
    ).success,
    true,
  );
  const equal = await h.native.writeProfile(
    "owned",
    { uid: "owned", version: 2, memoryBlock: "changed" },
    options,
  );
  assert.equal(equal.success, true);
  const old = await h.native.writeProfile(
    "owned",
    { uid: "owned", version: 1, memoryBlock: "old" },
    options,
  );
  assert.equal(old.errorCode, "stale_version");
  await h.native.writeProfile(
    "owned",
    { uid: "owned", version: 3, memoryBlock: "three" },
    options,
  );
  assert.match(
    await fs.readFile(
      join(h.configDir, "memory", "owned_memory.md.bak"),
      "utf8",
    ),
    /\ntwo\n/,
  );
  assert.equal(
    (await h.native.readProfile("owned", options)).memoryBlock,
    "three",
  );
});
test("close drains the original queued legacy migration including its delayed staging write and lock release", async (t) => {
  const { h } = await host(t),
    options = {
      baseDir: join(h.configDir, "memory"),
      legacyBaseDir: join(h.configDir, "memery"),
    };
  await put(
    join(options.legacyBaseDir, "owned-user_memery.md"),
    h.native.toMarkdown({
      uid: "owned-user",
      version: 3,
      memoryBlock: "queued migration owned",
    }),
  );
  let enter!: () => void, release!: () => void;
  const entered = new Promise<void>((r) => (enter = r)),
    held = new Promise<void>((r) => (release = r)),
    original = nodeFs.promises.writeFile;
  t.mock.method(nodeFs.promises, "writeFile", async (...args: any[]) => {
    if (
      String(args[0]).startsWith(options.baseDir) &&
      String(args[0]).includes(".tmp.")
    ) {
      enter();
      await held;
    }
    return (original as any)(...args);
  });
  assert.equal(
    (await h.native.readProfile("owned-user", options)).memoryBlock,
    "queued migration owned",
  );
  await entered;
  let done = false;
  const closing = h.close().then(() => {
    done = true;
  });
  await new Promise<void>((r) => setImmediate(r));
  assert.equal(done, false);
  release();
  await closing;
  assert.match(
    await fs.readFile(join(options.baseDir, "owned-user_memory.md"), "utf8"),
    /queued migration owned/,
  );
  assert.ok(
    (await fs.readdir(options.baseDir)).every(
      (name) => !name.endsWith(".lock") && !name.includes(".tmp."),
    ),
  );
  assert.equal(h.pendingCount, 0);
});
test("an empty native auth header object suppresses fallback Bearer rather than merging it back", async (t) => {
  const f = await fixture(t, {
    account: { uid: "owned-user" },
    token: "owned-token",
    authentication: { buildAuthHeaders: () => ({}) },
  });
  await f.service.collectSystemPromptVariables(opts(f));
  assert.deepEqual(f.calls.find((v) => v[0] === "request")[2].headers, {
    "X-User-ID": "owned-user",
  });
});
test("native archive malformed RAW_JSON falls back, UID mismatch is relabeled, and unsafe purge is rejected", async (t) => {
  const f = await fixture(t);
  assert.equal(
    f.native.parseMarkdown(
      f.native.toMarkdown({ uid: "other", memoryBlock: "owned" }),
      "new",
    ).uid,
    "new",
  );
  assert.equal(
    f.native.parseMarkdown(
      "## Memory Block\n\nfallback\n\n---\n<!-- RAW_JSON_START\nbroken\nRAW_JSON_END -->",
      "owned",
    ).memoryBlock,
    "fallback",
  );
  assert.equal(
    (
      await f.native.purgeLegacyMemoryDir({
        baseDir: join(f.root, "memory"),
        legacyBaseDir: f.root,
      })
    ).success,
    false,
  );
});
test("per-user in-flight cloud resolution deduplicates concurrent collectors and retains positive remote cache for 30 seconds", async (t) => {
  const f = await fixture(t, {
    account: { uid: "owned-user" },
    token: "owned-token",
  });
  const c = f.service.getRenderer().getCollectors()[4];
  const vars: any[] = [{}, {}, {}];
  await Promise.all(vars.map((v) => c.collect(v)));
  assert.equal(f.calls.filter((v) => v[0] === "request").length, 1);
  f.setResponse({ code: 0, data: { foryou_prompt: "new remote" } });
  f.advance(29999);
  const before: any = {};
  await c.collect(before);
  assert.match(before.UserMemoryContent, /owned cloud profile/);
  f.advance(1);
  const after: any = {};
  await c.collect(after);
  assert.match(after.UserMemoryContent, /new remote/);
  assert.equal(f.calls.filter((v) => v[0] === "request").length, 2);
});
test("empty remote cooldown still permits newly written local archive after the one-second resolution TTL", async (t) => {
  const f = await fixture(t, {
    account: { uid: "owned-user" },
    token: "owned-token",
    response: { code: 0, data: {} },
  });
  const c = f.service.getRenderer().getCollectors()[4];
  await c.collect({});
  await f.put(
    "home/.workbuddy/memory/owned-user_memory.md",
    f.native.toMarkdown({ uid: "owned-user", memoryBlock: "new local" }),
  );
  f.advance(1000);
  const v: any = {};
  await c.collect(v);
  assert.match(v.UserMemoryContent, /new local/);
  assert.equal(f.calls.filter((v) => v[0] === "request").length, 1);
  assert.equal(f.native.remoteFallbackCooldowns.size, 0);
});
test("cloud memory request uses native endpoint/path, auth headers and uid while positive results cache", async (t) => {
  const seen: any[] = [];
  const base = await server(t, (req, res) => {
    seen.push([req.url, req.headers.authorization, req.headers["x-user-id"]]);
    res.end(
      JSON.stringify({ code: 0, data: { foryou_prompt: "owned HTTP memory" } }),
    );
  });
  const { h, root } = await host(t, {
    auth,
    productManager: {
      waitConfiguration: async () => ({}),
      getEndpoint: () => base,
    },
    allowedOrigins: [base],
  });
  const first = await h.service.collectSystemPromptVariables({ cwd: root }),
    second = await h.service.collectSystemPromptVariables({ cwd: root });
  assert.match(first.UserMemoryContent, /owned HTTP memory/);
  assert.equal(first.UserMemoryContent, second.UserMemoryContent);
  assert.deepEqual(seen, [
    ["/api/memory/profile", "Bearer owned-token", "owned-user"],
  ]);
  await h.close();
  assert.equal(h.pendingCount, 0);
  assert.equal(h.ownedHandleCount, 0);
});
test("default network boundary rejects production fallback even when an explicit fake account/token is supplied", async (t) => {
  const { h, root } = await host(t, { auth });
  const v = await h.service.collectSystemPromptVariables({ cwd: root });
  assert.equal(v.UserMemoryContent, "");
  await h.close();
  assert.equal(h.ownedHandleCount, 0);
});
test("native proxy helpers retain env priority, suffix/loopback NO_PROXY matching and credential-free log descriptions", async (t) => {
  const f = await fixture(t, {
    env: {
      HTTPS_PROXY: "http://owned:dummy@proxy.owned:3128",
      NO_PROXY: ".example.owned",
    },
  });
  assert.equal(
    f.native.getProxyUrlFromEnv(),
    "http://owned:dummy@proxy.owned:3128/",
  );
  assert.equal(f.native.shouldBypassProxy("a.example.owned"), true);
  assert.equal(f.native.shouldBypassProxy("badexample.owned"), false);
  assert.equal(f.native.shouldBypassProxy("127.0.0.1"), true);
  assert.equal(
    f.native.describeProxyForRequest("https://target.owned"),
    "proxy=proxy.owned:3128",
  );
});
test("captured HTTP proxy agent serves actual owned request without target DNS/network access", async (t) => {
  const paths: string[] = [];
  const proxy = await server(t, (req, res) => {
    paths.push(req.url!);
    res.end(
      JSON.stringify({
        code: 0,
        data: { foryou_prompt: "owned proxy memory" },
      }),
    );
  });
  const target = "http://target.owned.invalid";
  const { h, root } = await host(t, {
    auth,
    env: { HTTPS_PROXY: proxy },
    productManager: {
      waitConfiguration: async () => ({}),
      getEndpoint: () => target,
    },
    allowedOrigins: [proxy, target],
  });
  const v = await h.service.collectSystemPromptVariables({ cwd: root });
  assert.match(v.UserMemoryContent, /owned proxy memory/);
  assert.deepEqual(paths, [target + "/api/memory/profile"]);
  await h.close();
  assert.equal(h.ownedHandleCount, 0);
});
test("cloud memory close destroys owned pending request and rejects new service work", async (t) => {
  let entered!: () => void;
  const started = new Promise<void>((r) => (entered = r));
  const base = await server(t, () => entered());
  const { h, root } = await host(t, {
    auth,
    productManager: {
      waitConfiguration: async () => ({}),
      getEndpoint: () => base,
    },
    allowedOrigins: [base],
  });
  const job = h.service.collectSystemPromptVariables({ cwd: root });
  await started;
  await h.close();
  const result = await job;
  assert.equal(result.UserMemoryContent, "");
  assert.equal(h.pendingCount, 0);
  assert.equal(h.ownedHandleCount, 0);
  await assert.rejects(h.service.renderSystemPrompt({}), /closed/);
});
test("native binary wrapper passes source registered disabled types, caps context, and keeps no-manager fallback", async (t) => {
  const f = await fixture(t, {
    binary: { summary: "b".repeat(10001), instructions: "owned" },
    appConfig: { bundledRuntime: { enabled: false } },
  });
  const v = await f.service.collectSystemPromptVariables(opts(f));
  assert.match(v.BinaryContext, /binary context truncated/);
  assert.deepEqual(f.calls.find((v) => v[0] === "binary")[1], [
    "python",
    "node",
  ]);
  const empty = await fixture(t);
  assert.equal(
    (await empty.service.collectSystemPromptVariables(opts(empty)))
      .BinaryContext,
    "",
  );
});
test("owned git prompt probe uses real read-only Git while process environment remains unchanged", async (t) => {
  const before = process.env.HOME,
    { h, root } = await host(t);
  execFileSync("git", ["init", "-q", root]);
  await put(join(root, "owned.txt"), "owned");
  const v = await h.service.collectSystemPromptVariables({ cwd: root });
  assert.equal(v.isGitRepo, "true");
  assert.equal(process.env.HOME, before);
  await h.close();
  assert.equal(h.ownedHandleCount, 0);
});
test("identity write and memory read reject external symlinks without touching their targets", async (t) => {
  const { h, root } = await host(t);
  const outside = await rootDir();
  t.after(() => fs.rm(outside, { recursive: true, force: true }));
  await fs.mkdir(join(h.home), { recursive: true });
  await fs.symlink(outside, h.configDir);
  const v = await h.service.collectSystemPromptVariables({ cwd: root });
  assert.equal(v.SoulContent, "");
  assert.deepEqual(await fs.readdir(outside), []);
});
test("template loader follows original code fallback and reports searched paths for missing plain kind", async (t) => {
  const f = await fixture(t, { templatesDir: "/owned-missing" });
  const dir = join(f.cwd, "resources", "templates");
  await put(join(dir, "workbuddy-ask-prompt.tpl"), "fallback {{ modelName }}");
  assert.equal(
    await f.service.renderSystemPrompt(
      opts(f, { mode: "ask", welcomeMode: "code" }),
    ),
    "fallback Owned Model",
  );
  await assert.rejects(
    f.service.renderSystemPrompt(opts(f, { mode: "craft" })),
    /Cannot locate template/,
  );
});
function model(requests: any[]): Model {
  return {
    async getResponse() {
      return { output: [], usage: new Usage() };
    },
    async *getStreamedResponse(request) {
      requests.push(request);
      yield { type: "response_started" } as any;
      yield {
        type: "response_done",
        response: {
          id: "owned",
          usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
          output: [
            {
              type: "message",
              id: "m",
              role: "assistant",
              status: "completed",
              content: [{ type: "output_text", text: "resource prompt done" }],
            },
          ],
        },
      } as any;
    },
  };
}
test("default addon backend now collects native variables, forwards native CLI language and keeps explicit prompt priority", async (t) => {
  const root = await rootDir();
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const requests: any[] = [];
  const a = await createAddonSession({
    harness: {
      workDir: root,
      recordReplayEnv: {},
      modelProvider: { getModel: () => model(requests) },
      productRuntime: { watch: false },
    },
    stateRoot: join(root, "backends"),
    desiredConfig: {
      mode: "ask",
      systemPrompt: "Owned SDK {{ modelName }} {{ WorkspaceIdentityMode }}",
      tools: "Read",
      model: "owned-model",
    },
    resourcePrompts: { locale: "zh-CN" },
  });
  try {
    assert.ok(a.resourcePromptHost);
    assert.equal(
      a.runtimeConfig.promptVariables.ResponseLanguage.includes("中文"),
      true,
    );
    assert.equal(
      await a.harness.settingsManager.get("language", "cli"),
      "简体中文",
    );
    assert.equal(await a.prompt("owned"), "resource prompt done");
    assert.match(
      requests[0].systemInstructions,
      /Owned SDK owned-model onboarding/,
    );
  } finally {
    await a.close();
  }
  assert.equal(a.resourcePromptHost!.ownedHandleCount, 0);
});
test("borrowed custom prompt service stays borrowed and explicit resourcePrompts false preserves the fallback boundary", async (t) => {
  const root = await rootDir();
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  let cleanup = 0;
  const base = {
    harness: {
      workDir: root,
      recordReplayEnv: {},
      modelProvider: { getModel: () => model([]) },
      productRuntime: { watch: false },
    },
    stateRoot: join(root, "state"),
    desiredConfig: { mode: "ask", systemPrompt: "owned" },
  };
  const a = await createAddonSession({
    ...base,
    addons: {
      systemPromptService: {
        async renderSystemPrompt() {
          return "owned";
        },
        async cleanup() {
          cleanup++;
        },
      },
    },
  });
  await a.close();
  assert.equal(cleanup, 0);
  assert.equal(a.resourcePromptHost, undefined);
  const b = await createAddonSession({ ...base, resourcePrompts: false });
  await b.close();
  assert.equal(b.resourcePromptHost, undefined);
});
test("addon internal resource state refuses external symlink before any identity materialization", async (t) => {
  const root = await rootDir(),
    outside = await rootDir();
  t.after(async () => {
    await fs.rm(root, { recursive: true, force: true });
    await fs.rm(outside, { recursive: true, force: true });
  });
  await fs.mkdir(join(root, "state"));
  await fs.symlink(outside, join(root, "state", ".resource-prompts"));
  await assert.rejects(
    createAddonSession({
      harness: {
        workDir: root,
        recordReplayEnv: {},
        modelProvider: { getModel: () => model([]) },
        productRuntime: { watch: false },
      },
      stateRoot: join(root, "state"),
      desiredConfig: { mode: "ask", systemPrompt: "owned" },
    }),
    /resource prompt state cannot be a symlink/,
  );
  assert.deepEqual(await fs.readdir(outside), []);
});

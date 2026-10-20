import assert from "node:assert/strict";
import test from "node:test";
import {
  mkdtemp,
  mkdir,
  writeFile,
  realpath,
  rm,
  symlink,
  readdir,
} from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createServer } from "node:http";
import { BehaviorSubject } from "rxjs";
import { Usage, setTraceProcessors, type Model } from "@openai/agents-core";
import { productSourceFixture } from "../scripts/helpers/product-source-fixtures.js";
import { createNativeProductHost } from "../src/config/native-product-host.js";
import { createHarness } from "../src/runtime/create-harness.js";
import { createCapturedCeph } from "../src/vendor/captured-ceph.js";
setTraceProcessors([]);
async function owned(t: any) {
  const root = await mkdtemp(join(tmpdir(), "product-sources-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}
async function put(file: string, content: string) {
  await mkdir(join(file, ".."), { recursive: true });
  await writeFile(file, content);
}
function gate<T>() {
  let resolve!: (v: T) => void;
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
}
const session = { account: { enterpriseId: "owned/a", uid: "owned" } };
test("native directory scan follows symlinks once, handles loops and applies case-sensitive extension/depth", async (t) => {
  const root = await owned(t);
  await put(join(root, "nested", "a.md"), "a");
  await put(join(root, "upper.MD"), "b");
  await symlink(root, join(root, "nested", "loop"));
  await symlink(join(root, "nested"), join(root, "alias"));
  const f = productSourceFixture({ root }),
    scan = f.classes.utilities.DirectoryScanUtils;
  const files = await scan.getFilesByExtension(root, ".md");
  assert.equal(files.length, 1);
  assert.equal(files[0].fullPath, await realpath(join(root, "nested", "a.md")));
  const errors: string[] = [];
  assert.deepEqual(
    await scan.scan(root, {
      maxDepth: 0,
      extension: ".md",
      onError: (e: Error) => errors.push(e.message),
    }),
    [],
  );
  assert.ok(errors.some((e) => /Max recursion depth/.test(e)));
});
test("native Ceph detection uses owned statfs/mount fixtures and clears cached decisions", async () => {
  let calls = 0;
  const c: any = createCapturedCeph({
    platform: "linux",
    fs: {
      async statfs() {
        calls++;
        return { type: 0xc36400 };
      },
    },
  });
  assert.equal(await c.isCephFs("/owned"), true);
  assert.equal(await c.isCephFs("/owned"), true);
  assert.equal(calls, 1);
  c.clearCephFsCache();
  await c.isCephFs("/owned");
  assert.equal(calls, 2);
});
test("native custom files retain nested names, separate frontmatter parsers and project-then-user ordering", async (t) => {
  const root = await owned(t),
    home = join(root, "home");
  await put(
    join(root, ".codebuddy", "commands", "nested", "owned.md"),
    "---\ndescription: project\nallowed-tools: Read, Edit\nmodel: a\nargument-hint: input\n---\n${OWNED:-fallback} ${CLAUDE_SESSION_ID}",
  );
  await put(
    join(home, "commands", "nested", "owned.md"),
    "---\ndescription: user\n---\nuser prompt",
  );
  await put(
    join(root, ".codebuddy", "agents", "owned.md"),
    "---\nname: named\ntools: [Read, Edit]\nskills: [s]\nmodel: Display\npermissionMode: plan\nisolation: worktree\nhooks:\n  Stop: []\n---\n${CODEBUDDY_SKILL_DIR}",
  );
  const f = productSourceFixture({ root, home, env: { OWNED: "expanded" } });
  const commands = (
    await f.make("CustomCommandsProductProvider").provide(f.input)
  ).commands;
  assert.deepEqual(
    commands.map((c: any) => [c.name, c.scope]),
    [
      ["nested:owned", "project"],
      ["nested:owned", "user"],
    ],
  );
  assert.deepEqual(commands[0].allowedTools, ["Read", "Edit"]);
  assert.equal(commands[0].prompt, "expanded ${CLAUDE_SESSION_ID}");
  const a = (await f.make("CustomAgentsProductProvider").provide(f.input))
    .agents[0];
  assert.equal(a.name, "named");
  assert.deepEqual(a.tools, ["Read", "Edit"]);
  assert.deepEqual(a.hooks, { Stop: [] });
  assert.deepEqual(a.models, ["Display"]);
  assert.deepEqual(a.skills, ["s"]);
  assert.equal(a.permissionMode, "plan");
  assert.equal(
    a.instructions,
    await realpath(join(root, ".codebuddy", "agents")),
  );
});
test("native load-time substitutions preserve runtime session markers, missing variables and sensitive plugin options", () => {
  const u = productSourceFixture({
    env: { EMPTY: "", CLAUDE_SESSION_ID: "not-now" },
  }).classes.utilities;
  assert.equal(
    u.substituteLoadTimeVariables(
      "${EMPTY:-fallback}|${ABSENT:-fallback}|${MISSING}|${CLAUDE_SESSION_ID}",
      "/owned/a.md",
    ),
    "|fallback|${MISSING}|${CLAUDE_SESSION_ID}",
  );
  const context = {
    pluginId: "owned",
    pluginRoot: "/owned/plugin",
    projectDir: "/owned",
    options: { secret: "value" },
    userConfig: { secret: { sensitive: true } },
  };
  assert.equal(
    u.substitutePluginVariables("${user_config.secret}", context, {
      mode: "content",
    }),
    "[sensitive option 'secret' not available in skill content]",
  );
  assert.throws(
    () => u.substitutePluginVariables("${user_config.missing}", context),
    /No value found/,
  );
  assert.equal(u.getPluginDataDirectory("a/b"), "/owned/home/plugins/data/a-b");
});
test("native model response caches for 480000ms, forces refresh, mutates chat relations in reverse insertion order", async () => {
  const f = productSourceFixture({
    session,
    response: {
      data: {
        data: [
          { id: "a", tags: ["chat"] },
          { id: "b", tags: ["chat"] },
        ],
      },
    },
  });
  f.current.agents.push({ name: "cli", models: ["base"] });
  const p = f.make("ModelsProductProvider");
  await p.provide(f.input);
  assert.deepEqual(f.current.agents[0].models, ["b", "a", "base"]);
  f.advance(479999);
  await p.provide(f.input);
  assert.equal(f.calls, 1);
  f.advance(1);
  await p.provide(f.input);
  assert.equal(f.calls, 2);
  await p.provide({ ...f.input, force: true });
  assert.equal(f.calls, 3);
  assert.match(
    f.events.find((e) => e[0] === "get")[1],
    /enterprises\/owned\/a\/config\/models/,
  );
});
test("native model failures retain last good snapshot with 30s exponential backoff capped at 300s", async () => {
  const f = productSourceFixture({
      session,
      response: { data: { data: [{ id: "good" }] } },
    }),
    p = f.make("ModelsProductProvider");
  const first = await p.provide(f.input);
  f.setResponse(Error("owned failure"));
  for (let n = 0; n < 6; n++) {
    await p.provide({ ...f.input, force: true });
    assert.equal(
      p.retryBackoffUntil - f.runtime.now(),
      Math.min(30000 * 2 ** n, 300000),
    );
  }
  assert.equal(await p.provide(f.input), first);
  assert.equal(f.calls, 7);
});
test("native agent resolver resolves only id/name, keeps unknowns and variants first without alias resolution", () => {
  const p = productSourceFixture().make("AgentModelResolverProvider");
  const models = [
    { id: "id", name: "Display", aliases: ["alias"], tags: ["chat"] },
    { id: "extra", tags: ["custom"] },
  ];
  assert.deepEqual(
    p.resolveAgentModels(
      { name: "a", models: ["Display", "vision", "id", "alias", "missing"] },
      models,
    ).models,
    ["vision", "id", "alias", "missing"],
  );
  assert.deepEqual(
    p.resolveAgentModels({ name: "a", models: ["lite"] }, models).models,
    ["lite"],
  );
});
test("native custom models merge user/project, prefix ids, expand env and expand available model spellings", async (t) => {
  const root = await owned(t),
    home = join(root, "home"),
    user = join(home, ".workbuddy", "models.json");
  await put(
    user,
    JSON.stringify({
      models: [
        { id: "owned", name: "User", apiKey: "${KEY}" },
        { name: "missing id" },
      ],
      availableModels: ["owned", 42],
    }),
  );
  await put(
    join(root, ".codebuddy", "models.json"),
    JSON.stringify({
      models: [{ id: "owned", name: "Project", url: "${URL}" }],
      availableModels: ["next"],
    }),
  );
  const f = productSourceFixture({
      root,
      home,
      env: { KEY: "owned-key", URL: "http://127.0.0.1:1/v1" },
    }),
    p = f.make("CustomModelsProductProvider");
  p.watchFile = () => {};
  const out = await p.provide(f.input);
  assert.equal(out.models.length, 1);
  assert.equal(out.models[0].id, "custom-local:owned");
  assert.equal(out.models[0].name, "Project");
  assert.equal(out.models[0].apiKey, "owned-key");
  assert.equal(out.models[0].url, "http://127.0.0.1:1/v1");
  assert.deepEqual(out.models[0].aliases, ["owned"]);
  assert.ok(out.models[0].tags.includes("custom"));
  // The project's primitive list replaces the user list before prefix expansion.
  assert.deepEqual(out.availableModels, ["next", "custom-local:next"]);
  assert.equal(
    p.getUserConfigPath("WorkBuddy", "custom"),
    join(home, "custom", "models.json"),
  );
});
test("native model config env routing is trimmed and malformed JSON does not abort project config", async (t) => {
  const root = await owned(t),
    custom = join(root, "config");
  await put(join(custom, "models.json"), "{broken");
  await put(join(root, ".codebuddy", "models.json"), '[{"id":"valid"}]');
  const f = productSourceFixture({
      root,
      env: { WORKBUDDY_CONFIG_DIR: " " + custom + " " },
    }),
    p = f.make("CustomModelsProductProvider");
  p.watchFile = () => {};
  assert.equal(
    p.getUserConfigPath("ignored", "ignored"),
    join(custom, "models.json"),
  );
  assert.equal((await p.provide(f.input)).models[0].id, "custom-local:valid");
});
test("native policy bypasses only feature-off/anonymous/personal and validates enterprise HTTP schema", async () => {
  const f = productSourceFixture(),
    p = f.make("EnterpriseCustomModelPolicyServiceImpl");
  assert.equal((await p.getPolicy({})).source, "bypass-anonymous");
  f.authenticationManager.currentSessionSubject.next({
    account: { uid: "owned" },
  });
  assert.equal((await p.getPolicy({})).source, "bypass-personal");
  f.current.productFeatures.EnableEnterpriseCustomModelPolicy = false;
  assert.equal((await p.getPolicy({})).source, "bypass-feature-off");
  assert.equal(f.calls, 0);
  assert.throws(
    () => p.parseUserCheckBody({ allowed: "true" }),
    /missing allowed/,
  );
});
test("native policy coalesces concurrent fetches and ignores late results for a previous owner", async () => {
  const g = gate<any>(),
    f = productSourceFixture({ session, response: () => g.promise }),
    p = f.make("EnterpriseCustomModelPolicyServiceImpl");
  const a = p.getPolicy({}),
    b = p.getPolicy({});
  assert.equal(f.calls, 1);
  f.authenticationManager.currentSessionSubject.next({
    account: { enterpriseId: "other", uid: "owned" },
  });
  g.resolve({ status: 200, data: { allowed: false } });
  await Promise.all([a, b]);
  assert.equal(p.cachedSnapshot, undefined);
  assert.equal(
    f.events.filter((e) => e[0] === "get")[0][1],
    "/v2/enterprises/owned%2Fa/member-custom-model-policy/user-check",
  );
});
test("native policy failure retains stale denial, anonymous 401 is not cached, unknown failure is fail-open", async () => {
  const f = productSourceFixture({
      session,
      response: { status: 200, data: { allowed: false, policy_mode: "none" } },
    }),
    p = f.make("EnterpriseCustomModelPolicyServiceImpl");
  assert.equal((await p.getPolicy({})).allowed, false);
  f.advance(300000);
  f.setResponse(Error("offline"));
  const stale = await p.getPolicy({});
  assert.equal(stale.allowed, false);
  assert.equal(stale.source, "stale-cache");
  p.cachedSnapshot = undefined;
  assert.equal((await p.getPolicy({ forceRefresh: true })).source, "fail-open");
  p.cachedSnapshot = undefined;
  f.setResponse({ status: 401, data: {} });
  assert.equal(
    (await p.getPolicy({ forceRefresh: true })).source,
    "bypass-anonymous",
  );
  assert.equal(p.cachedSnapshot, undefined);
});
test("native policy filter removes only prefixed custom-tag models and triggers sync on allowed changes", async () => {
  const f = productSourceFixture(),
    p = f.make("EnterpriseCustomModelPolicyFilterProvider");
  let listener: any;
  p.policyService = {
    getCachedSnapshot: () => ({ allowed: false }),
    onChanged(fn: any) {
      listener = fn;
    },
  };
  const out = await p.provide({
    current: {
      ...f.current,
      models: [
        { id: "custom-local:deny", tags: ["custom"] },
        { id: "custom-local:keep" },
        { id: "remote", tags: ["custom"] },
      ],
      availableModels: ["custom-local:deny", "remote"],
    },
  });
  assert.deepEqual(
    out.models.map((m: any) => m.id),
    ["custom-local:keep", "remote"],
  );
  assert.deepEqual(out.availableModels, ["remote"]);
  listener({ allowed: true });
  await Promise.resolve();
  assert.ok(f.events.some((e) => e[0] === "sync" && e[1]));
});
test("native policy disk cache writes atomically inside owned state and rejects invalid version/entry", async (t) => {
  const root = await owned(t),
    f = productSourceFixture({ root, env: { CODEBUDDY_CONFIG_DIR: root } }),
    cache = f.diskCache;
  const data = {
    version: 1,
    entries: { owned: { fetchedAt: 1, snapshot: { allowed: false } } },
  };
  await cache.save(data);
  assert.deepEqual(cache.load(), data);
  assert.deepEqual(await readdir(root), [".policy-cache.json"]);
  await writeFile(cache.getPath(), '{"version":2,"entries":{}}');
  assert.equal(cache.load(), undefined);
  await writeFile(
    cache.getPath(),
    '{"version":1,"entries":{"a":{"fetchedAt":1,"snapshot":{"allowed":"bad"}}}}',
  );
  assert.equal(cache.load(), undefined);
});
test("native CLI policy returns disk denial immediately and refreshes through the original background path", async (t) => {
  const root = await owned(t),
    g = gate<any>(),
    f = productSourceFixture({ root, session, response: () => g.promise }),
    p = f.policy;
  await f.diskCache.save({
    version: 1,
    entries: {
      "enterprise:owned/a:owned": {
        fetchedAt: 10,
        snapshot: { allowed: false },
      },
    },
  });
  const cached = await p.getPolicy({});
  assert.equal(cached.source, "stale-cache");
  assert.equal(cached.allowed, false);
  g.resolve({ status: 200, data: { allowed: true } });
  await p.pendingFetch;
  await new Promise<void>((r) => setImmediate(r));
  assert.equal(p.cachedSnapshot.allowed, true);
  assert.equal(
    f.diskCache.load().entries["enterprise:owned/a:owned"].snapshot.allowed,
    true,
  );
});
test("owned source host unsubscribes auth, clears periodic refresh and blocks queued post-close sync", async (t) => {
  const root = await owned(t),
    auth = { currentSessionSubject: new BehaviorSubject(session) },
    immediate: (() => void)[] = [];
  const h = createNativeProductHost({
    initialConfiguration: { agents: [], models: [], prompts: [], tools: [] },
    getWorkDir: () => root,
    getHomeDir: () => root,
    watch: false,
    sources: {
      authenticationManager: auth,
      runtime: {
        setImmediate(fn: () => void) {
          immediate.push(fn);
          return {};
        },
        clearImmediate() {},
      },
    },
  });
  await h.start();
  assert.ok(auth.currentSessionSubject.observers.length > 0);
  await h.close();
  immediate.forEach((fn) => fn());
  assert.equal(auth.currentSessionSubject.observers.length, 0);
  assert.equal(h.sourceHost.ownedHandleCount, 0);
  assert.equal(h.ownedTimerCount, 0);
});
test(
  "owned real models.json watcher debounces full sync, removes old model and releases its handle",
  { timeout: 10000 },
  async (t) => {
    const root = await owned(t),
      file = join(root, ".codebuddy", "models.json"),
      timers = new Map<any, any>();
    await put(file, '[{"id":"first"}]');
    const h = createNativeProductHost({
      initialConfiguration: {
        productName: "WorkBuddy",
        agents: [],
        models: [],
        tools: [],
        prompts: [],
        productFeatures: { CustomModelsJSON: true, CustomModelIdPrefix: true },
      },
      getWorkDir: () => root,
      getHomeDir: () => root,
      runtime: {
        setTimeout(callback: () => void, ms: number) {
          const h = {};
          timers.set(h, { callback, ms });
          return h;
        },
        clearTimeout(h: any) {
          timers.delete(h);
        },
      },
    });
    t.after(() => h.close());
    await h.start();
    assert.ok(
      h.manager._configuration.models.some(
        (m: any) => m.id === "custom-local:first",
      ),
    );
    const p = h.sourceHost.customModels;
    p.projectConfigWatcher.ref();
    const changed = gate<void>(),
      native = p.debounceSync.bind(p);
    p.debounceSync = () => {
      native();
      changed.resolve();
    };
    await writeFile(file, '[{"id":"second"}]');
    await changed.promise;
    for (const [id, timer] of [...timers])
      if (timer.ms === 1000) {
        timers.delete(id);
        timer.callback();
      }
    await h.flush();
    assert.deepEqual(
      h.manager._configuration.models.map((m: any) => m.id),
      ["custom-local:second"],
    );
    await h.close();
    assert.equal(p.projectConfigWatcherPath, undefined);
    assert.equal(h.ownedTimerCount, 0);
    assert.equal(h.sourceHost.ownedHandleCount, 0);
  },
);
function model(requests: any[]): Model {
  return {
    async getResponse() {
      return { output: [], usage: new Usage() };
    },
    async *getStreamedResponse(request) {
      requests.push(request);
      yield { type: "response_started" };
      yield {
        type: "response_done",
        response: {
          id: "owned",
          usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
          output: [
            {
              type: "message",
              role: "assistant",
              id: "owned-answer",
              status: "completed",
              content: [{ type: "output_text", text: "settled" }],
            },
          ],
        },
      } as any;
    },
  };
}
test(
  "real SDK updates file commands and removes deleted config while retaining native stale non-plugin agent cache",
  { timeout: 15000 },
  async (t) => {
    const root = await owned(t),
      file = join(root, ".codebuddy", "commands", "owned.md"),
      agent = join(root, ".codebuddy", "agents", "owned.md"),
      requests: any[] = [];
    await put(file, "---\ndescription: owned\n---\nfirst owned prompt");
    await put(
      agent,
      "---\nname: owned-agent\ndescription: owned\n---\nowned agent instructions",
    );
    const h = await createHarness({
      workDir: root,
      stateDir: join(root, "state"),
      recordReplayEnv: {},
      modelProvider: { getModel: () => model(requests) },
      productRuntime: { watch: false },
    });
    t.after(() => h.close());
    assert.ok(await h.agents.get("owned-agent"));
    assert.ok(await h.commandManager.get("/owned"));
    const s = await h.openSession();
    assert.equal(await h.prompt(s, "/owned"), "settled");
    assert.match(JSON.stringify(requests[0].input), /first owned prompt/);
    await writeFile(
      file,
      "---\ndescription: changed\n---\nsecond owned prompt",
    );
    await h.productManager.sync(true);
    await h.agents.waitForRebuildSettled(0);
    await h.prompt(s, "/owned");
    assert.match(JSON.stringify(requests.at(-1).input), /second owned prompt/);
    await rm(file);
    await rm(agent);
    await h.productManager.sync(true);
    await h.agents.waitForRebuildSettled(0);
    assert.equal(await h.commandManager.get("/owned"), undefined);
    assert.equal(h.product.raw.agents.some((a: any) => a.name === "owned-agent"), false);
    // Original buildAgentsFromProductConfiguration only evicts plugin agents.
    assert.equal(Boolean(await h.agents.get("owned-agent")), true);
  },
);
test(
  "real SDK uses models.json config through original model provider and only an owned HTTP endpoint",
  { timeout: 15000 },
  async (t) => {
    const root = await owned(t),
      bodies: any[] = [];
    const server = createServer(async (req, res) => {
      let raw = "";
      for await (const chunk of req) raw += chunk;
      const body = JSON.parse(raw);
      bodies.push(body);
      res.writeHead(200, { "Content-Type": "text/event-stream" });
      const packet = (delta: any, finish_reason: any) => ({
        id: "owned-chat",
        object: "chat.completion.chunk",
        created: 1,
        model: body.model,
        choices: [{ index: 0, delta, finish_reason }],
      });
      res.write(
        "data: " +
          JSON.stringify(
            packet({ role: "assistant", content: "owned response" }, null),
          ) +
          "\n\n",
      );
      res.write(
        "data: " + JSON.stringify(packet({}, "stop")) + "\n\ndata: [DONE]\n\n",
      );
      res.end();
    });
    await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
    t.after(() => new Promise<void>((r) => server.close(() => r())));
    const endpoint =
      "http://127.0.0.1:" + (server.address() as any).port + "/v1";
    await put(
      join(root, ".codebuddy", "models.json"),
      JSON.stringify([
        {
          id: "owned-model",
          name: "Owned",
          apiKey: "owned-key",
          url: endpoint,
        },
      ]),
    );
    const h = await createHarness({
      workDir: root,
      stateDir: join(root, "state"),
      apiKey: "owned-fallback",
      baseURL: endpoint,
      model: "custom-local:owned-model",
      recordReplayEnv: {},
      productRuntime: { watch: false },
    });
    t.after(() => h.close());
    assert.equal(
      h.product.findModelByIdNameOrAlias("owned-model")?.id,
      "custom-local:owned-model",
    );
    assert.equal(
      await h.prompt(await h.openSession(), "owned request"),
      "owned response",
    );
    assert.equal(bodies.length, 1);
    assert.ok(bodies[0].model.includes("owned-model"));
  },
);

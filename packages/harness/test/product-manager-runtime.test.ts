import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, writeFile, readFile, rm } from "node:fs/promises";
import * as fs from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { EventEmitter } from "node:events";
import { BehaviorSubject, Subject } from "rxjs";
import { Usage, setTraceProcessors, type Model } from "@openai/agents-core";
import { productManagerFixture } from "../scripts/helpers/product-manager-fixtures.js";
import { createNativeProductRuntime } from "../src/config/native-product-runtime.js";
import { createNativeProductHost } from "../src/config/native-product-host.js";
import { createNativeProductWatchers } from "../src/config/native-product-watchers.js";
import { OVERRIDE_MODE } from "../src/config/native-product-constants.js";
import { createHarness } from "../src/runtime/create-harness.js";
import { ownedMcpHttp } from "./helpers/owned-mcp-http.js";
setTraceProcessors([]);
function gate() {
  let resolve!: () => void;
  const promise = new Promise<void>((r) => (resolve = r));
  return { promise, resolve };
}
async function owned(t: any) {
  const root = await mkdtemp(join(tmpdir(), "native-product-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}
const copy = (v: any) => JSON.parse(JSON.stringify(v));
test("native smart merge honors source replace symbol and keeps object identity by id/name", async () => {
  const f = productManagerFixture(),
    smart = new f.classes.SmartMergeProductMergeStrategy(),
    first = {
      name: "owned",
      instructions: "fixed",
      [OVERRIDE_MODE]: "replace",
    };
  assert.deepEqual(
    await smart.merge(
      { agents: [first] },
      {
        agents: [
          { name: "owned", instructions: "changed" },
          { id: "new", name: "added" },
        ],
      },
    ),
    { agents: [first, { id: "new", name: "added" }] },
  );
  assert.deepEqual(
    await smart.merge(
      { builtInMarketPluginsMerge: [{ name: "old" }] },
      { builtInMarketPluginsMerge: [] },
    ),
    { builtInMarketPluginsMerge: [] },
  );
});
test("native deep smart merge de-duplicates primitive arrays and handles circular targets", async () => {
  const f = productManagerFixture(),
    deep = new f.classes.DeepSmartMergeProductMergeStrategy();
  assert.deepEqual(
    await deep.merge(
      { tools: ["Read", "Write"] },
      { tools: ["Write", "Edit"] },
    ),
    { tools: ["Read", "Write", "Edit"] },
  );
  const cyclic: any = { name: "owned" };
  cyclic.self = cyclic;
  const result = await deep.merge({}, cyclic);
  assert.equal(result.self, cyclic);
});
test("native commands merge keeps command order and source nested replacement rules", async () => {
  const f = productManagerFixture(),
    merge = new f.classes.CommandsSmartMergeProductMergeStrategy();
  const result = await merge.merge(
    {
      commands: [
        { name: "/a", prompt: "old" },
        { name: "/b", prompt: "keep" },
      ],
    },
    {
      commands: [
        { name: "/a", prompt: "new" },
        { name: "/c", prompt: "added" },
      ],
    },
  );
  assert.deepEqual(
    result.commands.map((v: any) => [v.name, v.prompt]),
    [
      ["/a", "new"],
      ["/b", "keep"],
      ["/c", "added"],
    ],
  );
});
test("native merger disables incomplete galileo configuration and removes mergeStrategy", async () => {
  const f = productManagerFixture(),
    out = await f.merger.merge(
      {
        galileo: {
          projectId: "old",
          endpoint: "old",
          app: "old",
          server: "old",
          enable: true,
        },
      },
      { mergeStrategy: "smartMerge", galileo: { endpoint: "new" } },
    );
  assert.equal(out.galileo.enable, false);
  assert.equal(out.galileo.projectId, undefined);
  assert.equal(out.mergeStrategy, undefined);
});
test("native stable cache excludes volatile overlays and later refresh removes stale values", async () => {
  const f = productManagerFixture();
  await f.manager.sync();
  await f.settle();
  const cache = JSON.parse(
    f.classes.GzipUtils.decompress(
      f.data.get(f.classes.ProductManagerImpl.getCacheKey()),
    ),
  );
  assert.equal(cache.volatileRevision, undefined);
  assert.equal(cache.stable, "owned");
  assert.equal(f.manager._configuration.volatileRevision, 0);
  f.nextRevision();
  await f.manager.syncVolatileProviders(true);
  assert.equal(f.manager._configuration.volatileRevision, 1);
  assert.equal(f.manager._stableConfiguration.volatileRevision, undefined);
});
test("native proxy throttles stale reads at exact 480000/2000 boundaries", async () => {
  const f = productManagerFixture();
  await f.manager.sync();
  f.advance(480000);
  void f.manager.configuration.value.endpoint;
  assert.equal(f.timers.size, 0);
  f.advance(1);
  void f.manager.configuration.value.endpoint;
  await f.settle();
  assert.ok(
    f.events.filter((e) => e[0] === "provide" && e[1] === "base").length >= 2,
  );
  f.manager.lastProxySyncTime = 1000000;
  f.manager.throttledSyncForProxy();
  assert.equal([...f.timers.values()].at(-1)?.ms, 1000000 + 2000 - 481001);
});
test("native cache load does not overwrite a newer server snapshot after async storage resolves", async () => {
  const f = productManagerFixture(),
    pending = gate();
  f.manager.localStorage = {
    async set() {},
    async get(key: string) {
      if (key.includes("Product")) {
        await pending.promise;
        return { endpoint: "http://cached.invalid" };
      }
      return undefined;
    },
  };
  const load = f.manager.loadFromCacheAsync();
  await f.manager.sync();
  pending.resolve();
  await load;
  assert.equal(f.manager.getEndpoint(), "http://owned.invalid");
});
test("native sync finally queue preserves its original sticky-rejection behavior", async () => {
  const f = productManagerFixture();
  let once = true;
  const sort = f.manager.productProviderProvider.sort;
  f.manager.productProviderProvider.sort = async () => {
    if (once) {
      once = false;
      throw Error("owned sort failure");
    }
    return sort();
  };
  await assert.rejects(f.manager.sync(), /owned sort failure/);
  await assert.rejects(f.manager.sync(), /owned sort failure/);
  assert.equal(f.manager._configuration.stable, "owned");
});
test("captured provider constructor names do not activate readable-name prefetch accidentally", () => {
  const f = productManagerFixture();
  assert.equal(
    new f.classes.SdkInitializeProductProvider().constructor.name,
    "tI",
  );
  assert.equal(new f.classes.PluginsProductProvider().constructor.name, "tz");
  assert.equal(new f.classes.ClientProductProvider().constructor.name, "eE");
});
test("native named independent providers start before sequential base provider", async () => {
  const f = productManagerFixture(),
    events: string[] = [],
    pending = gate();
  class SkillProductProvider {
    priority = 15000;
    async provide() {
      events.push("independent-start");
      await pending.promise;
      return { mergeStrategy: "smartMerge", skills: [] };
    }
  }
  const base = {
    priority: 5000,
    async provide() {
      events.push("base");
      pending.resolve();
      return f.initial;
    },
  };
  f.manager.productProviderProvider.sort = async () => [
    new SkillProductProvider(),
    base,
  ];
  await f.manager.sync();
  assert.deepEqual(events, ["independent-start", "base"]);
});
test("native feature filters preserve exact capability prompt and bundled skill path checks", () => {
  const f = productManagerFixture(),
    value: any = {
      productFeatures: {
        DisableTerminalVariable: true,
        DisableMultimodalGeneration: true,
      },
      variables: [{ type: "terminal" }, { type: "file" }],
      agents: [{ name: "cli", tags: ["default"], appendInstructions: "base" }],
      skills: [
        { source: "bundled", baseDirectory: "/owned/video/" },
        { source: "project", baseDirectory: "/owned/video/" },
      ],
      disabledBuiltinSkills: ["video"],
    };
  f.manager.applyProductFeatureFilters(value);
  f.manager.applyProductFeatureFilters(value);
  assert.deepEqual(value.variables, [{ type: "file" }]);
  assert.equal(
    value.agents[0].appendInstructions.match(/<capability_constraints>/g)
      .length,
    1,
  );
  assert.match(
    value.agents[0].appendInstructions,
    /This product does not support video generation/,
  );
  assert.equal(value.skills.length, 1);
  assert.equal(value.skills[0].source, "project");
});
test("native SDK agent overrides require description/prompt and retain model/tool fields", async () => {
  const f = productManagerFixture(),
    p = Object.assign(new f.classes.SdkInitializeProductProvider(), {
      logger: { info() {}, error() {} },
      sdkInitializeState: {
        get: () => ({
          systemPrompt: "owned system",
          appendSystemPrompt: "owned tail",
          agents: {
            bad: { description: "missing" },
            good: {
              description: "owned",
              prompt: "agent body",
              tools: ["Read"],
              model: "owned-model",
            },
          },
        }),
      },
    });
  const out = await p.provide({ current: f.initial });
  assert.equal(out.agents.length, 2);
  assert.equal(out.agents[0].instructions, "owned system");
  assert.deepEqual(out.agents[1].models, ["owned-model"]);
});
test("native CLI options read only an explicit owned prompt file", async (t) => {
  const root = await owned(t),
    filename = join(root, "prompt.txt");
  await writeFile(filename, "owned file system prompt");
  const classes = createNativeProductRuntime({
      getWorkDir: () => root,
      getHomeDir: () => root,
      fs,
      dependencies: { logger: {} },
    }),
    p = Object.assign(new classes.CliOptionsProductProvider(), {
      logger: { info() {}, error() {} },
      cliProvider: {
        parseOpts: () => ({
          opts: {
            systemPromptFile: filename,
            appendSystemPrompt: "tail",
            agents: '{"owned":{"description":"owned","prompt":"body"}}',
          },
        }),
      },
    });
  const out = await p.provide({
    current: { agents: [{ name: "cli", tags: ["default"] }] },
  });
  assert.equal(out.agents[0].instructions, "owned file system prompt");
  assert.equal(out.agents[1].instructions, "body");
});
test("native environment provider retains legacy account/model stripping rules", async () => {
  const f = productManagerFixture(),
    p = new f.classes.EnvProductProvider();
  f.runtime.env.ACC_PRODUCT_CONFIG = JSON.stringify({
    authentication: { owned: true },
    models: [{ id: "owned" }],
    productName: "owned",
  });
  assert.deepEqual(JSON.parse(p.getProductConfig(["ACC_PRODUCT_CONFIG"])), {
    productName: "owned",
  });
  f.runtime.env.ACC_PRODUCT_CONFIG_V3 = JSON.stringify({
    models: [{ id: "owned" }],
  });
  assert.equal(
    JSON.parse(p.getProductConfig(["ACC_PRODUCT_CONFIG_V3"])).models.length,
    1,
  );
});
test("native client provider caches explicitly owned product.json and uses fallback paths", async (t) => {
  const root = await owned(t),
    filename = join(root, "product.json");
  await writeFile(
    filename,
    JSON.stringify({ productName: "owned", models: [] }),
  );
  const classes = createNativeProductRuntime({
      getWorkDir: () => root,
      getHomeDir: () => root,
      configBasePath: root,
      dependencies: { logger: {} },
    }),
    p = Object.assign(new classes.ClientProductProvider(), {
      fs,
      configBasePath: root,
      logger: { info() {}, debug() {}, warn() {} },
    });
  const first = await p.provide();
  await writeFile(filename, JSON.stringify({ productName: "changed" }));
  assert.equal(await p.provide(), first);
  assert.equal(first.productName, "owned");
});
test("native host priority provider sort filters nonpositive values and reverses stable equal-priority order", async () => {
  const events: string[] = [],
    base = { agents: [], models: [], tools: [], prompts: [] };
  const h = createNativeProductHost({
    initialConfiguration: base,
    getWorkDir: () => "/owned",
    getHomeDir: () => "/owned/home",
    watch: false,
    providers: [
      {
        priority: 22000,
        async provide() {
          events.push("first");
          return {};
        },
      },
      {
        priority: 22000,
        async provide() {
          events.push("second");
          return {};
        },
      },
      {
        priority: 0,
        async provide() {
          events.push("ignored");
          return {};
        },
      },
    ],
  });
  await h.start();
  assert.deepEqual(events, ["second", "first"]);
  await h.close();
  assert.equal(h.ownedTimerCount, 0);
});
test("native memory storage emits only owned domain changes and gzip preserves UTF-8", async () => {
  const f = productManagerFixture(),
    s = new f.classes.MemoryLocalStorage(),
    events: any[] = [];
  s.changeEvent((e: any) => events.push(e));
  await s.set("owned", "中文 prompt");
  assert.equal(await s.get("owned"), "中文 prompt");
  await s.remove("owned");
  assert.deepEqual(events, [{ domain: "owned" }, { domain: "owned" }]);
  assert.equal(
    f.classes.GzipUtils.decompress(f.classes.GzipUtils.compress("中文 prompt")),
    "中文 prompt",
  );
  s.emitter.dispose();
});
function watcherFixture() {
  const events: any[] = [],
    timers = new Map<any, () => void>(),
    handles: any[] = [],
    dependencies: any = {};
  for (const key of [
    "skills",
    "plugins",
    "memoryCache",
    "subdirectoryMemory",
    "settings",
    "mcpConfig",
    "productManager",
  ])
    dependencies[key] = {
      clear: () => events.push([key, "clear"]),
      clearCache: (...args: any[]) => events.push([key, "clearCache", ...args]),
      invalidateFilesystemScopeCaches: () => events.push([key, "invalidate"]),
      sync: (force: any) => events.push([key, "sync", force]),
    };
  const runtime: any = {
    getWorkDir: () => "/owned",
    getHomeDir: () => "/owned/home",
    dependencies,
    env: {},
    setTimeout: (fn: () => void) => {
      const id = {};
      timers.set(id, fn);
      return id;
    },
    clearTimeout: (id: any) => timers.delete(id),
    fs: {
      promises: { access: async () => {}, readdir: async () => [] },
      watch: (_p: string, _o: any, cb: any) => {
        const h = Object.assign(new EventEmitter(), {
          closed: false,
          callback: cb,
          close() {
            this.closed = true;
          },
          unref() {},
        });
        handles.push(h);
        return h;
      },
    },
  };
  const classes = createNativeProductWatchers(runtime),
    logger = { info() {}, debug() {}, warn() {}, error() {} },
    watch = Object.assign(new classes.ConfigWatchServiceImpl(), {
      logger,
      cwdService: { onDidChangeCwd: new BehaviorSubject("/owned") },
    }),
    models = { changedSubject: new Subject<any>() },
    mcp = Object.assign(new classes.McpWatchServiceImpl(), {
      logger,
      serverModelManager: models,
    });
  return { events, timers, handles, runtime, classes, watch, mcp, models };
}
test("native hot reload routes cache invalidations and forces complete cwd refresh", () => {
  const f = watcherFixture();
  f.watch.performHotReload("skills", "owned");
  assert.deepEqual(f.events, [
    ["skills", "clearCache"],
    ["productManager", "sync", false],
  ]);
  f.events.length = 0;
  f.watch.invalidateAllProjectCaches();
  assert.ok(f.events.some((e) => e[0] === "memoryCache"));
  assert.ok(f.events.some((e) => e[0] === "mcpConfig"));
  assert.ok(f.events.some((e) => e[0] === "productManager" && e[2] === true));
  f.watch.cleanup();
});
test("native watch handles rename immediately, debounces change and disables all handles on EMFILE", async () => {
  const f = watcherFixture();
  await f.watch.watchPath({
    path: "/owned",
    recursive: false,
    changeType: "skills",
  });
  f.handles[0].callback("rename", "new.md");
  assert.equal(f.events.length, 2);
  f.events.length = 0;
  f.handles[0].callback("change", "new.md");
  assert.equal(f.events.length, 0);
  for (const fn of f.timers.values()) fn();
  assert.equal(f.events.length, 2);
  f.handles[0].emit(
    "error",
    Object.assign(Error("EMFILE"), { code: "EMFILE" }),
  );
  assert.equal(f.handles[0].closed, true);
  assert.equal(f.watch.isHotReloadEnabled(), false);
  f.watch.cleanup();
});
test("native MCP watcher coalesces connected/disconnected, ignores intermediate states and cleans subscription", () => {
  const f = watcherFixture();
  f.mcp.initialize();
  f.models.changedSubject.next({ name: "owned", status: "connecting" });
  assert.equal(f.timers.size, 0);
  f.models.changedSubject.next({ name: "owned", status: "connected" });
  f.models.changedSubject.next({ name: "owned", status: "disconnected" });
  assert.equal(f.timers.size, 1);
  for (const fn of f.timers.values()) fn();
  assert.equal(f.events[0][0], "productManager");
  f.mcp.cleanup();
  assert.equal(f.models.changedSubject.observers.length, 0);
});
test("native Windows watch threshold uses nonrecursive fallback above exactly 512 entries", async () => {
  const f = watcherFixture();
  f.runtime.platform = "win32";
  f.runtime.fs.promises.readdir = async () =>
    Array.from({ length: 513 }, () => ({}));
  const classes = createNativeProductWatchers(f.runtime),
    watch = Object.assign(new classes.ConfigWatchServiceImpl(), {
      logger: { info() {}, debug() {} },
    });
  assert.equal(
    await watch.getEffectiveRecursiveWatch({ path: "/owned", recursive: true }),
    false,
  );
  f.runtime.fs.promises.readdir = async () =>
    Array.from({ length: 512 }, () => ({}));
  assert.equal(
    await watch.getEffectiveRecursiveWatch({ path: "/owned", recursive: true }),
    true,
  );
});

function modelFixture(requests: any[]): Model {
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
  "real SDK initialize system/append/custom-agent overrides flow through native ProductManager",
  { timeout: 15000 },
  async (t) => {
    const root = await owned(t),
      requests: any[] = [],
      messages: any[] = [],
      stdout = Object.assign(new EventEmitter(), {
        write(line: string) {
          messages.push(JSON.parse(line));
          return true;
        },
      });
    const h = await createHarness({
      workDir: root,
      stateDir: join(root, "state"),
      recordReplayEnv: {},
      modelProvider: { getModel: () => modelFixture(requests) },
      sdkControl: { stdout },
      productRuntime: { watch: false },
    });
    t.after(() => h.close());
    await h.sdkControl!.receive({
      type: "control_request",
      request_id: "owned-init",
      request: {
        subtype: "initialize",
        systemPrompt: "owned primary instructions",
        appendSystemPrompt: "owned appendix",
        agents: {
          custom: {
            description: "owned custom",
            prompt: "owned custom body",
            tools: ["Read"],
          },
        },
      },
    });
    assert.equal(
      messages.find((m) => m.response?.request_id === "owned-init").response
        .subtype,
      "success",
    );
    assert.ok(await h.agents.get("custom"));
    const session = await h.openSession();
    assert.equal(await h.prompt(session, "owned"), "settled");
    assert.match(JSON.stringify(requests[0]), /owned primary instructions/);
    assert.match(JSON.stringify(requests[0]), /owned appendix/);
  },
);
test(
  "real SDK plugin volatile refresh rebuilds agents and removes materialized commands",
  { timeout: 15000 },
  async (t) => {
    const root = await owned(t),
      requests: any[] = [];
    let active = true;
    const plugins = {
      async getActivePlugins() {
        return active
          ? [
              {
                plugin: { name: "owned", marketplaceName: "fixture" },
                components: {
                  agents: [
                    { name: "cli", instructions: "owned plugin instructions" },
                  ],
                  commands: [
                    {
                      name: "/owned-plugin",
                      prompt: "owned command",
                      tags: ["custom"],
                    },
                  ],
                },
              },
            ]
          : [];
      },
    };
    const h = await createHarness({
      workDir: root,
      stateDir: join(root, "state"),
      recordReplayEnv: {},
      modelProvider: { getModel: () => modelFixture(requests) },
      agentManager: { plugins },
      productRuntime: { watch: false },
    });
    t.after(() => h.close());
    assert.ok(await h.commandManager.get("/owned-plugin"));
    assert.equal(
      (await h.agents.getAgentConfig("cli"))?.instructions,
      "owned plugin instructions",
    );
    active = false;
    await h.productManager.syncVolatileProviders(true);
    await h.agents.waitForRebuildSettled(0);
    assert.equal(await h.commandManager.get("/owned-plugin"), undefined);
    const session = await h.openSession();
    await h.prompt(session, "owned");
    assert.doesNotMatch(
      JSON.stringify(requests.at(-1)),
      /owned plugin instructions/,
    );
  },
);
test(
  "real SDK MCP prompt command uses recovered provider and renderer through owned HTTP",
  { timeout: 15000 },
  async (t) => {
    const root = await owned(t),
      peer = await ownedMcpHttp(),
      requests: any[] = [];
    t.after(() => peer.close());
    const h = await createHarness({
      workDir: root,
      stateDir: join(root, "state"),
      recordReplayEnv: {},
      modelProvider: { getModel: () => modelFixture(requests) },
      nativeMcp: {
        env: {},
        servers: { owned: { type: "http", url: peer.url + "/mcp" } },
      },
      productRuntime: { watch: false },
    });
    t.after(() => h.close());
    await h.productManager.sync(true);
    await h.agents.waitForRebuildSettled(0);
    assert.ok(await h.commandManager.get("/owned:Greet"));
    const session = await h.openSession();
    assert.equal(await h.prompt(session, "/owned:Greet Alice"), "settled");
    assert.match(JSON.stringify(requests[0].input), /owned prompt Alice/);
  },
);
test("owned product close waits pending provider and suppresses post-close publication", async () => {
  const pending = gate(),
    events: any[] = [];
  let entered = false;
  const host = createNativeProductHost({
    initialConfiguration: { agents: [], tools: [], models: [], prompts: [] },
    getWorkDir: () => "/owned",
    getHomeDir: () => "/owned/home",
    onConfiguration: (value) => {
      events.push(value);
    },
    providers: [
      {
        priority: 21000,
        async provide() {
          entered = true;
          await pending.promise;
          return {};
        },
      },
    ],
  });
  const start = host.start();
  while (!entered) await Promise.resolve();
  const close = host.close();
  pending.resolve();
  await Promise.all([start, close]);
  assert.deepEqual(events, []);
  assert.equal(host.ownedTimerCount, 0);
  assert.equal(host.configWatch.cwdChangeSubscription, undefined);
  await assert.rejects(host.facade.sync(), /closed/);
});
test("owned publication error is reported and does not poison a newer valid snapshot", async () => {
  let fail = true,
    revision = 0;
  const host = createNativeProductHost({
    initialConfiguration: { agents: [], models: [], tools: [], prompts: [] },
    getWorkDir: () => "/owned",
    getHomeDir: () => "/owned/home",
    watch: false,
    async onConfiguration() {
      if (fail) throw Error("owned publication failure");
    },
    providers: [
      {
        priority: 21000,
        async provide() {
          return { revision };
        },
      },
    ],
  });
  try {
    await assert.rejects(host.start(), /owned publication failure/);
    fail = false;
    revision++;
    await host.facade.sync();
    assert.equal(host.manager._configuration.revision, 1);
  } finally {
    await host.close();
  }
});
test(
  "owned real fs.watch rename refreshes native skill product and closes the watcher",
  { timeout: 10000 },
  async (t) => {
    const root = await owned(t),
      timers = new Map<any, { callback: () => void; ms: number }>();
    let revision = 0;
    const host = createNativeProductHost({
      initialConfiguration: { agents: [], models: [], tools: [], prompts: [] },
      getWorkDir: () => root,
      getHomeDir: () => root,
      skillProvider: {
        clearCache() {
          revision++;
        },
        async provide() {
          return {
            mergeStrategy: "smartMerge",
            skills: [{ name: "owned", description: "revision:" + revision }],
          };
        },
      },
      runtime: {
        setTimeout(callback: () => void, ms: number) {
          const id = {};
          timers.set(id, { callback, ms });
          return id;
        },
        clearTimeout(id: any) {
          timers.delete(id);
        },
      },
    });
    t.after(() => host.close());
    host.configWatch.getWatchConfigs = async () => [
      { path: root, recursive: false, changeType: "skills" },
    ];
    try {
      await host.start();
      for (const entry of [...timers.values()])
        if (entry.ms === 2000) entry.callback();
      await host.flush();
      assert.equal(host.configWatch.isWatching(root), true);
      // Native watch intentionally unrefs; this test owns the ref while awaiting OS delivery.
      host.configWatch.watchers.get(root).ref();
      const changed = new Promise<void>((resolve) => {
        const listener = host.configWatch.onDidHotReload(() => {
          listener.dispose();
          resolve();
        });
      });
      await writeFile(join(root, "owned.skill"), "owned");
      await changed;
      await host.flush();
      assert.equal(
        host.manager._configuration.skills[0].description,
        "revision:1",
      );
    } finally {
      await host.close();
    }
    assert.deepEqual(host.configWatch.getWatchedDirectories(), []);
    assert.equal(host.ownedTimerCount, 0);
  },
);

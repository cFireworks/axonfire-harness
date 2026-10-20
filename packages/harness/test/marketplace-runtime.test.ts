import assert from "node:assert/strict";
import test from "node:test";
import {
  mkdtemp,
  mkdir,
  readFile,
  writeFile,
  readdir,
  rm,
  symlink,
} from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { marketplaceFixture } from "../scripts/helpers/marketplace-fixtures.js";
import { createNativeFileLock } from "../src/tasks/native-file-lock.js";
import { createOwnedPluginFilesystem } from "../src/plugins/owned-plugin-filesystem.js";
import { createNativePluginHost } from "../src/plugins/native-plugin-host.js";
import { createHarness } from "../src/runtime/create-harness.js";
import { createCapturedMarketplacePolicy } from "../src/vendor/captured-marketplace-policy.js";
import { Usage, setTraceProcessors, type Model } from "@openai/agents-core";
setTraceProcessors([]);
async function owned(t: any) {
  const root = await mkdtemp(join(tmpdir(), "native-marketplace-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}
async function put(file: string, text: string) {
  await mkdir(join(file, ".."), { recursive: true });
  await writeFile(file, text);
}
function worker(t: any, root: string, operation: string, name: string) {
  const typed = import.meta.url.endsWith(".ts"),
    filename = fileURLToPath(
      new URL(
        "./helpers/marketplace-worker." + (typed ? "ts" : "js"),
        import.meta.url,
      ),
    );
  const child = spawn(
    process.execPath,
    [...(typed ? ["--import", "tsx"] : []), filename, root, operation, name],
    { stdio: ["ignore", "pipe", "pipe", "ipc"] },
  );
  let errors = "";
  child.stderr!.on("data", (data) => {
    errors += data;
  });
  const done = new Promise<void>((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code) =>
      code === 0
        ? resolve()
        : reject(Error("Owned worker failed: " + code + " " + errors)),
    );
  });
  void done.catch(() => {});
  t.after(() => {
    if (child.exitCode === null) child.kill();
  });
  return { child, done };
}
async function files(root: string) {
  const dir = join(root, "market");
  await put(
    join(dir, ".claude-plugin", "marketplace.json"),
    JSON.stringify({
      name: "owned-market",
      plugins: [{ name: "owned", source: "./plugins/owned", version: "0.1.0" }],
    }),
  );
  await put(
    join(dir, "plugins", "owned", ".codebuddy-plugin", "plugin.json"),
    JSON.stringify({
      name: "owned",
      version: "1.2.3",
      description: "from plugin manifest",
    }),
  );
  await put(
    join(dir, "plugins", "owned", "commands", "echo.md"),
    "---\ndescription: owned\n---\nmarket command $ARGUMENTS",
  );
  await put(
    join(dir, "plugins", "owned", "agents", "expert.md"),
    "---\nname: market-expert\ndescription: owned\n---\nmarket expert instructions",
  );
  return dir;
}
test("native file mutex retains identity and FIFO contention after release", async (t) => {
  const f = marketplaceFixture(await owned(t)),
    lock = f.nativeLock.getLockMutex("owned");
  assert.equal(lock, f.nativeLock.getLockMutex("owned"));
  const release = await f.fileLockService.acquireFileLock("owned");
  let entered = false;
  const second = f.fileLockService.acquireFileLock("owned").then((r: any) => {
    entered = true;
    return r;
  });
  await new Promise<void>((r) => setImmediate(r));
  assert.equal(entered, false);
  await release();
  await (
    await second
  )();
  assert.equal(f.nativeLock.locks.size, 2);
});
test(
  "native file lock contends with another real owned process",
  { timeout: 15000 },
  async (t) => {
    const root = await owned(t),
      f = marketplaceFixture(root),
      w = worker(t, root, "hold", "shared");
    await new Promise<void>((resolve, reject) => {
      w.child.once("message", () => resolve());
      void w.done.catch(reject);
    });
    await assert.rejects(
      f.fileLockService.acquireFileLock("shared", {
        maxRetries: 2,
        retryDelay: 5,
      }),
      /Failed to acquire lock/,
    );
    w.child.send("release");
    await w.done;
    await (
      await f.fileLockService.acquireFileLock("shared")
    )();
  },
);
test("native stale locks recover expired, broken and missing metadata", async (t) => {
  const root = await owned(t),
    f = marketplaceFixture(root);
  for (const content of [
    JSON.stringify({ pid: process.pid, timestamp: 1 }),
    "broken",
    undefined,
  ]) {
    const dir = join(root, "tmp", "stale.lock");
    await mkdir(dir, { recursive: true });
    if (content !== undefined) await writeFile(join(dir, "lock.json"), content);
    await (
      await f.fileLockService.acquireFileLock("stale", { maxRetries: 1 })
    )();
  }
});
test("native stale PID probe treats only ESRCH as dead and never sends a signal", async (t) => {
  const root = await owned(t),
    f = marketplaceFixture(root),
    dir = join(root, "probe");
  await mkdir(dir);
  await writeFile(
    join(dir, "lock.json"),
    JSON.stringify({ pid: 123, timestamp: Date.now() }),
  );
  for (const code of ["ESRCH", "EPERM", "EINVAL", undefined]) {
    const calls: any[] = [],
      { FileLockServiceImpl } = createNativeFileLock({
        process: {
          kill(...args: any[]) {
            calls.push(args);
            if (code) throw Object.assign(Error("probe"), { code });
          },
        },
      });
    assert.equal(
      await new FileLockServiceImpl().isLockStale(dir, 10000),
      code === "ESRCH",
    );
    assert.deepEqual(calls, [[123, 0]]);
  }
});
test("native lock write failure cleans directory and releases process mutex", async () => {
  let removed = 0,
    fail = true;
  const { FileLockServiceImpl } = createNativeFileLock({
    tmpdir: () => "/owned",
    fs: {
      mkdir: async () => {},
      writeFile: async () => {
        if (fail) throw Object.assign(Error("disk"), { code: "EIO" });
      },
      rm: async () => {
        removed++;
      },
    },
  });
  const s = new FileLockServiceImpl();
  await assert.rejects(s.acquireFileLock("owned", {}), /disk/);
  assert.equal(removed, 1);
  fail = false;
  await (
    await s.acquireFileLock("owned", {})
  )();
  assert.equal(removed, 2);
});
test("native lock stale-removal loop stops at three removals without consuming retries early", async () => {
  let creates = 0,
    removes = 0;
  const { FileLockServiceImpl } = createNativeFileLock({
    tmpdir: () => "/owned",
    fs: {
      rm: async () => {
        removes++;
      },
    },
  });
  const s = new FileLockServiceImpl();
  s.tryCreateLock = async () => {
    creates++;
    return { success: false, error: { code: "EEXIST" } };
  };
  s.isLockStale = async () => true;
  await assert.rejects(
    s.acquireFileLock("owned", { maxRetries: 1 }),
    /Failed to acquire lock/,
  );
  assert.equal(creates, 4);
  assert.equal(removes, 3);
});
test("native marketplace storage persists storageName and serializes concurrent mutations", async (t) => {
  const f = marketplaceFixture(await owned(t));
  await Promise.all(
    Array.from({ length: 12 }, (_, i) =>
      f.storage.saveMarketplace({
        name: "alias" + i,
        storageName: "stable" + i,
        source: { source: "directory", path: "owned" },
      }),
    ),
  );
  const all = await f.storage.getMarketplaces();
  assert.equal(all.length, 12);
  assert.ok(
    all.every(
      (v: any) => v.name.startsWith("stable") && v.storageName === undefined,
    ),
  );
  await f.storage.removeMarketplace("stable2");
  assert.equal(await f.storage.isMarketplaceInstalled("stable2"), false);
  assert.deepEqual(await readdir(join(f.root, "tmp")), []);
});
test(
  "native marketplace cross-process writes preserve both writers",
  { timeout: 15000 },
  async (t) => {
    const root = await owned(t),
      f = marketplaceFixture(root);
    await f.storage.getMarketplaces();
    await Promise.all([
      worker(t, root, "save", "a").done,
      worker(t, root, "save", "b").done,
    ]);
    assert.deepEqual(
      (await f.storage.getMarketplaces()).map((v: any) => v.name).sort(),
      ["a0", "a1", "a2", "b0", "b1", "b2"],
    );
  },
);
test("native corrupted storage backs up bytes and reports repair before rebuilding", async (t) => {
  const f = marketplaceFixture(await owned(t), undefined, {
    Date: class extends Date {
      static override now() {
        return 12345;
      }
    },
  });
  await f.storage.getMarketplaces();
  await writeFile(f.storage.configFilePath, "[not-json");
  assert.deepEqual(await f.storage.getMarketplaces(), []);
  assert.equal(
    await readFile(f.storage.configFilePath + ".broken-12345", "utf8"),
    "[not-json",
  );
  assert.equal(f.errors[0].operation, "repair");
  assert.equal(await f.fsExtra.pathExists(f.storage.configFilePath), false);
  await f.storage.saveMarketplace({ name: "after", source: {} });
  assert.equal((await f.storage.getMarketplaces())[0].name, "after");
});
test("native legacy cache repair rewrites only one-level roots with a canonical manifest", async (t) => {
  const root = await owned(t),
    f = marketplaceFixture(root),
    canonical = join(root, "plugins", "marketplaces", "good"),
    legacy = join(root, "plugins", "cache", "good");
  await put(join(canonical, ".workbuddy-plugin", "marketplace.json"), "{}");
  await f.storage.saveMarketplace({
    name: "good",
    installLocation: legacy,
    source: { source: "directory", path: legacy },
  });
  await f.storage.saveMarketplace({
    name: "missing",
    installLocation: join(root, "plugins", "cache", "missing"),
    source: {},
  });
  const all = await f.storage.getMarketplaces();
  assert.equal(all[0].installLocation, canonical);
  assert.equal(all[0].source.path, canonical);
  assert.match(all[1].installLocation, /cache/);
  for (const p of [
    "",
    join(root, "plugins", "cache"),
    join(root, "plugins", "cache", "a", "b"),
    join(root, "plugins", "cache", "..hidden"),
  ])
    assert.equal(f.storage.getCanonicalMarketplaceLocation(p), undefined);
});
test("native storage rename retains six attempts, exact backoff and nontransient fail-fast", async (t) => {
  const delays: number[] = [],
    f = marketplaceFixture(await owned(t), undefined, {
      setTimeout: (fn: any, ms: number) => {
        delays.push(ms);
        queueMicrotask(fn);
      },
    });
  let calls = 0;
  f.storage.rawRename = async () => {
    calls++;
    throw Object.assign(Error("busy"), { code: "EBUSY" });
  };
  await assert.rejects(f.storage.renameTempFile("a", "b"), /busy/);
  assert.equal(calls, 6);
  assert.deepEqual(delays, [100, 200, 400, 800, 1000]);
  calls = 0;
  f.storage.rawRename = async () => {
    calls++;
    throw Object.assign(Error("missing"), { code: "ENOENT" });
  };
  await assert.rejects(f.storage.renameTempFile("a", "b"), /missing/);
  assert.equal(calls, 1);
});
test("native storage fallback and failed-release warnings do not discard callback results", async (t) => {
  const f = marketplaceFixture(await owned(t));
  f.storage.fileLockService = {
    acquireFileLock: async () => {
      throw Error("unavailable");
    },
  };
  assert.equal(await f.storage.withLocks(async () => 42), 42);
  assert.match(JSON.stringify(f.events), /falling back to in-process/);
  f.storage.fileLockService = {
    acquireFileLock: async () => async () => {
      throw Error("release");
    },
  };
  assert.equal(await f.storage.withLocks(async () => 43), 43);
  assert.match(JSON.stringify(f.events), /Failed to release/);
  await assert.rejects(
    f.storage.withLocks(async () => {
      throw Error("callback");
    }),
    /callback/,
  );
  assert.equal(await f.storage.withLocks(async () => 44), 44);
});
test("native atomic write cleans failed temp and next queued write recovers", async (t) => {
  const f = marketplaceFixture(await owned(t));
  await f.storage.getMarketplaces();
  const rename = f.storage.rawRename.bind(f.storage);
  f.storage.rawRename = async () => {
    throw Error("disk");
  };
  await assert.rejects(f.storage.saveMarketplace({ name: "bad" }), /disk/);
  assert.equal(
    (await readdir(join(f.root, "plugins"))).some((p) => p.includes(".tmp.")),
    false,
  );
  f.storage.rawRename = rename;
  await f.storage.saveMarketplace({ name: "good" });
  assert.equal((await f.storage.getMarketplaces())[0].name, "good");
});
test("native storage init keeps its original rejected initialization promise", async (t) => {
  const f = marketplaceFixture(await owned(t));
  let calls = 0;
  f.storage.doEnsureConfigFile = async () => {
    calls++;
    throw Error("init");
  };
  await assert.rejects(f.storage.ensureConfigFileAsync(), /init/);
  await assert.rejects(f.storage.ensureConfigFileAsync(), /init/);
  assert.equal(calls, 1);
});
test("native directory market coalesces loads and returns shallow cloned cached entries", async (t) => {
  const root = await owned(t),
    f = marketplaceFixture(join(root, "state")),
    dir = await files(root),
    m = f.classes.MarketplaceFactory.createFromJSON({
      name: "alias",
      source: { source: "directory", path: dir },
      installLocation: dir,
    });
  let loads = 0;
  const load = m.loadPluginList.bind(m);
  m.loadPluginList = async () => {
    loads++;
    return load();
  };
  const [a, b] = await Promise.all([m.listPlugins(), m.listPlugins()]);
  assert.equal(loads, 1);
  assert.notEqual(a, b);
  assert.notEqual(a[0], b[0]);
  assert.equal(a[0].version, "1.2.3");
  assert.equal(a[0].marketplaceName, "owned-market");
  assert.equal(a[0].sourcePath, "./plugins/owned");
  a[0].description = "mutation";
  assert.equal((await m.listPlugins())[0].description, "from plugin manifest");
  m.clearPluginListCache();
  await m.listPlugins();
  assert.equal(loads, 2);
});
test("native local installer validates names and rejects lexical root escape", async (t) => {
  const root = await owned(t),
    f = marketplaceFixture(join(root, "state")),
    dir = await files(root),
    p = { name: "owned", source: "./plugins/owned" };
  assert.equal(
    await f.installer.install(p, dir),
    join(dir, "plugins", "owned"),
  );
  assert.equal(
    await f.installer.isInstalled(p, dir),
    join(dir, "plugins", "owned"),
  );
  await assert.rejects(
    f.installer.install({ name: "../bad", source: "." }, dir),
    /Invalid plugin name/,
  );
  await assert.rejects(
    f.installer.install({ name: "owned", source: "../outside" }, dir),
    /escapes marketplace root/,
  );
  await assert.rejects(
    f.installer.install({ name: "owned", source: { source: "local" } }, dir),
    /requires a path/,
  );
});
test("native configuration honors allowed scopes, later values and original object-source url mapping", async (t) => {
  const f = marketplaceFixture(await owned(t));
  f.scopes.set("user", {
    same: { source: "github", repo: "user/repo" },
    local: { source: { source: "directory", path: "/ignored" } },
  });
  f.scopes.set("project", { same: { source: "git", url: "project" } });
  f.scopes.set("project-local", {
    same: { source: { source: "directory", url: "/owned" } },
  });
  f.scopes.set("cli", { same: { source: "url", url: "cli" } });
  const a = await f.config.getConfiguredMarketplaces();
  assert.equal(a.get("same").url, "cli");
  assert.equal(a.has("local"), false);
  f.config.cliSettingSourcesProvider.isScopeAllowed = async (s: string) =>
    s !== "cli";
  assert.deepEqual((await f.config.getConfiguredMarketplaces()).get("same"), {
    source: "directory",
    repo: undefined,
    path: "/owned",
  });
  await f.storage.saveMarketplace({ name: "same" });
  assert.deepEqual(await f.config.getMarketplacesToInstall(), []);
});
test("native built-in provider caches names until explicitly re-read", async (t) => {
  const f = marketplaceFixture(await owned(t));
  f.configuration.builtInMarketplaces = {
    official: { source: "zip", url: "https://invalid.test/owned.zip" },
  };
  assert.equal(await f.builtIn.isBuiltInMarketplace("official"), true);
  f.configuration.builtInMarketplaces = {};
  assert.equal(await f.builtIn.isBuiltInMarketplace("official"), true);
  await f.builtIn.getBuiltInMarketplaces();
  assert.equal(await f.builtIn.isBuiltInMarketplace("official"), false);
  assert.deepEqual(
    f.builtIn.toMarketplaceSource({ source: "zip", url: "owned" }),
    { source: "zip", url: "owned", path: "owned" },
  );
});
test("owned bridge removes unguarded mutators and blocks external final symlink writes", async (t) => {
  const root = await owned(t),
    state = join(root, "state"),
    bridge = createOwnedPluginFilesystem(state);
  await bridge.ensureDir(state);
  const outside = join(root, "outside");
  await writeFile(outside, "keep");
  await symlink(outside, join(state, "link"));
  await assert.rejects(
    bridge.writeFile(join(state, "link"), "bad"),
    /external symlink/,
  );
  await assert.rejects(bridge.rm(outside), /outside owned state/);
  assert.equal((bridge as any).open, undefined);
  assert.equal(await readFile(outside, "utf8"), "keep");
});
test("native default host add-marketplace persists and restores directory market on restart", async (t) => {
  const root = await owned(t),
    dir = await files(root),
    stateDir = join(root, "state"),
    configuration = {
      builtInMarketplaces: {
        forbidden: {
          source: "zip",
          url: "https://invalid.test/must-not-contact.zip",
        },
      },
    };
  const make = () =>
    createNativePluginHost({
      stateDir,
      getWorkDir: () => root,
      settings: { get: async () => undefined },
      productManager: {
        getCurrentConfiguration: () => configuration,
        onDidChange: () => ({ dispose() {} }),
      },
      promptRenderer: {},
    });
  const first = make();
  t.after(() => first.close());
  assert.deepEqual(
    await first.builtInMarketplaceProvider.getBuiltInMarketplaces(),
    [],
  );
  const m = await first.pluginManager.addMarketplace(dir, {
    skipDependencyResolution: true,
  });
  assert.equal(m.name, "owned-market");
  await first.close();
  const second = make();
  t.after(() => second.close());
  await second.pluginManager.loadMarketplaces();
  assert.equal(
    (await second.pluginManager.getMarketplace("owned-market")).name,
    "owned-market",
  );
  assert.equal(
    (await second.pluginManager.getMarketplace("owned-market"))
      .listPlugins instanceof Function,
    true,
  );
});
test(
  "real SDK consumes persisted directory market commands and agents after restart",
  { timeout: 15000 },
  async (t) => {
    const root = await owned(t),
      stateDir = join(root, "state"),
      dir = await files(root),
      f = marketplaceFixture(stateDir);
    await f.storage.saveMarketplace({
      name: "owned-market",
      type: "directory",
      source: { source: "directory", path: dir },
      installLocation: dir,
    });
    const requests: any[] = [],
      model: Model = {
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
                  content: [{ type: "output_text", text: "market-settled" }],
                },
              ],
            },
          } as any;
        },
      };
    const settings = {
      get: async (key: string, scope: string) =>
        key === "enabledPlugins" && scope === "user"
          ? { "owned@owned-market": true }
          : undefined,
      clearCache() {},
    };
    for (let i = 0; i < 2; i++) {
      const h = await createHarness({
        workDir: root,
        stateDir,
        recordReplayEnv: {},
        productRuntime: { watch: false },
        modelProvider: { getModel: () => model },
        nativePlugins: { settings },
      });
      try {
        assert.ok(await h.agents.get("market-expert"));
        assert.ok(await h.commandManager.get("/owned:echo"));
        const s = await h.openSession();
        await h.prompt(s, "/owned:echo argument" + i);
        assert.match(
          JSON.stringify(requests.at(-1).input),
          new RegExp("argument" + i),
        );
      } finally {
        await h.close();
      }
    }
    assert.equal(requests.length, 2);
  },
);
test("native marketplace naming policy preserves reserved names and source whitelist", () => {
  const p: any = createCapturedMarketplacePolicy();
  assert.equal(p.isBlockedOfficialName("official-codebuddy-copy"), true);
  assert.equal(p.isBlockedOfficialName("codebuddy-plugins-official"), false);
  assert.equal(p.isBlockedOfficialName("中文"), true);
  assert.equal(
    p.validateOfficialNameSource(
      "codebuddy-plugins-official",
      "https://github.com/evil/repo",
    ),
    false,
  );
  assert.equal(
    p.validateOfficialNameSource(
      "codebuddy-plugins-official",
      "tencent-ai/repo",
    ),
    true,
  );
  assert.equal(
    p.validateOfficialNameSource(
      "codebuddy-plugins-official",
      "https://download.codebuddy.cn/plugin-marketplace/owned.zip",
    ),
    true,
  );
  assert.equal(
    p.isMarketplaceAutoUpdateDefault("knowledge-work-plugins"),
    false,
  );
  assert.equal(
    p.isMarketplaceAutoUpdateDefault("codebuddy-plugins-official"),
    true,
  );
  assert.equal(p.isMarketplaceAutoUpdateDefault("owned", true), true);
});
test(
  "native configured local marketplace passes original name validation and installs at startup",
  { timeout: 15000 },
  async (t) => {
    const root = await owned(t),
      dir = await files(root),
      stateDir = join(root, "state");
    const h = await createHarness({
      workDir: root,
      stateDir,
      recordReplayEnv: {},
      productRuntime: { watch: false },
      modelProvider: {
        getModel: () => ({
          async getResponse() {
            throw Error("Unexpected model request");
          },
          async *getStreamedResponse() {
            throw Error("Unexpected model request");
          },
        }),
      },
      nativePlugins: {
        settings: {
          get: async (key: string, scope: string) =>
            scope === "user" && key === "extraKnownMarketplaces"
              ? {
                  "owned-market": { source: { source: "directory", url: dir } },
                }
              : scope === "user" && key === "enabledPlugins"
                ? { "owned@owned-market": true }
                : undefined,
          clearCache() {},
        },
      },
    });
    try {
      await h.pluginManager.startupPluginPreparationPromise;
      await h.pluginRuntimeRefresh!.refresh("settings-change");
      assert.equal(
        await h.pluginHost!.marketplaceStorage.isMarketplaceInstalled(
          "owned-market",
        ),
        true,
      );
      assert.ok(await h.commandManager.get("/owned:echo"));
      assert.ok(await h.agents.get("market-expert"));
    } finally {
      await h.close();
    }
  },
);
test("owned host close drains an in-flight original marketplace storage write", async (t) => {
  const root = await owned(t),
    host = createNativePluginHost({
      stateDir: join(root, "state"),
      getWorkDir: () => root,
      productManager: { getCurrentConfiguration: () => ({}) },
      settings: { get: async () => undefined },
      promptRenderer: {},
    });
  await host.marketplaceStorage.getMarketplaces();
  let enter!: () => void, release!: () => void;
  const entered = new Promise<void>((r) => {
      enter = r;
    }),
    gate = new Promise<void>((r) => {
      release = r;
    });
  const rename: any = host.marketplaceStorage.rawRename.bind(
    host.marketplaceStorage,
  );
  host.marketplaceStorage.rawRename = async (...args: any[]) => {
    enter();
    await gate;
    return rename(...args);
  };
  const saving = host.marketplaceStorage.saveMarketplace({ name: "owned" });
  await entered;
  let closed = false;
  const closing = host.close().then(() => {
    closed = true;
  });
  await new Promise<void>((r) => setImmediate(r));
  assert.equal(closed, false);
  release();
  await Promise.all([saving, closing]);
  assert.equal(host.pendingCount, 0);
  assert.equal(host.ownedHandleCount, 0);
});

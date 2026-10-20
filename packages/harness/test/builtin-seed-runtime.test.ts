import assert from "node:assert/strict";
import test from "node:test";
import * as fs from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  ownedBuiltinAssets,
  builtinSeedFixture,
} from "../scripts/helpers/builtin-seed-fixtures.js";
import { createNativePluginController } from "../src/plugins/native-plugin-controller.js";
import { createNativePluginControllerHost } from "../src/plugins/native-plugin-controller-host.js";
import { createNativeBundledAssets } from "../src/plugins/native-bundled-assets.js";
import { createNativePluginValidator } from "../src/plugins/native-plugin-validator.js";
import { createOwnedBuiltinSeedFilesystem } from "../src/plugins/owned-builtin-seed-filesystem.js";
import { createOwnedPluginFilesystem } from "../src/plugins/owned-plugin-filesystem.js";
import { createNativeBuiltinSeedHost } from "../src/plugins/native-builtin-seed-host.js";
import { createHarness } from "../src/runtime/create-harness.js";
import { Usage, setTraceProcessors, type Model } from "@openai/agents-core";
setTraceProcessors([]);
async function fixture(t: any, overrides: any = {}) {
  const root = await fs.promises.mkdtemp(join(tmpdir(), "builtin-seed-"));
  t.after(() => fs.promises.rm(root, { recursive: true, force: true }));
  return builtinSeedFixture(root, undefined, overrides);
}
function put(file: string, text: string) {
  fs.mkdirSync(dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
}
const snapshot = (root: string, name = "seed-owned", version = "1.0.0") =>
  join(root, "state", "plugins", "cache", "workbuddy-builtin", name, version);
test("native seed skips absent and platform-unsupported assets without creating state", async (t) => {
  const f = await fixture(t);
  assert.deepEqual(f.native.seedBuiltinPluginsMarketplace({}), {
    marketplaceChanged: false,
  });
  await ownedBuiltinAssets(f.root, [
    { name: "owned", version: "1.0.0", platforms: ["win32"] },
  ]);
  assert.deepEqual(f.native.seedBuiltinPluginsMarketplace({}), {
    marketplaceChanged: false,
  });
  assert.equal(fs.existsSync(join(f.root, "state")), false);
});
test("native seed modes use strict feature booleans and only builtin-plugin candidates", async (t) => {
  const f = await fixture(t);
  await ownedBuiltinAssets(f.root, [
    { name: "tencent-pptx", version: "1.0.0", category: "builtin-plugin" },
    { name: "other", version: "1.0.0", category: "builtin-plugin" },
    { name: "mode", version: "1.0.0", category: "mode" },
    {
      name: "windows",
      version: "1.0.0",
      category: "builtin-plugin",
      platforms: ["win32"],
    },
  ]);
  const all = f.native.seedBuiltinPluginsMarketplace({
    IntentRecommend: false,
  });
  assert.equal(all.metadataRequest.mode, "all");
  assert.deepEqual(all.metadataRequest.defaults, {
    "tencent-pptx@workbuddy-builtin": true,
    "other@workbuddy-builtin": true,
  });
  const defaults = f.native.seedBuiltinPluginsMarketplace({
    IntentRecommend: true,
  });
  assert.equal(defaults.metadataRequest.mode, "defaults");
  assert.deepEqual(defaults.metadataRequest.defaults, {
    "tencent-pptx@workbuddy-builtin": true,
  });
  const none = f.native.seedBuiltinPluginsMarketplace({
    IntentRecommend: true,
    TencentPptxBuiltinDefaultEnabled: false,
  });
  assert.equal(none.metadataRequest.mode, "none");
  assert.deepEqual(none.metadataRequest.defaults, {});
  assert.equal(
    f.native.isBuiltinPluginSeedAllEnabled({ IntentRecommend: "true" }),
    true,
  );
});
test("native manifest first-existing precedence, paths and platform filters are retained", async (t) => {
  const f = await fixture(t),
    a = await ownedBuiltinAssets(f.root);
  put(
    join(a.market, ".claude-plugin", "marketplace.json"),
    JSON.stringify({ name: "workbuddy-builtin", plugins: [] }),
  );
  put(join(a.market, ".codebuddy-plugin", "marketplace.json"), "{broken");
  assert.equal(f.native.readMarketplaceManifest(a.market), undefined);
  for (const source of [
    "../escape",
    "nested/../escape",
    "nested\\..\\escape",
    "/absolute",
  ])
    assert.equal(
      f.native.isValidMarketplaceManifest(
        { plugins: [{ name: "p", source }] },
        "fixture",
      ),
      false,
    );
  assert.equal(
    f.native.isValidMarketplaceManifest(
      { name: "wrong", plugins: [] },
      "fixture",
    ),
    false,
  );
  assert.equal(
    f.native.isPluginSupportedOnPlatform({ platforms: [] }, "unknown"),
    true,
  );
  assert.equal(
    f.native.isPluginSupportedOnPlatform({ platforms: ["darwin"] }, "linux"),
    false,
  );
});
test("native seed keeps two-tree source/cache layout and ignores unchanged-version asset body updates", async (t) => {
  const f = await fixture(t),
    a = await ownedBuiltinAssets(f.root);
  const first = f.native.seedBuiltinPluginsMarketplace({});
  assert.equal(first.marketplaceChanged, true);
  const cache = join(snapshot(f.root), "commands", "echo.md");
  assert.match(fs.readFileSync(cache, "utf8"), /owned seed/);
  put(
    join(a.market, "plugins", "seed-owned", "commands", "echo.md"),
    "changed without a version",
  );
  assert.equal(
    f.native.seedBuiltinPluginsMarketplace({}).marketplaceChanged,
    false,
  );
  assert.match(fs.readFileSync(cache, "utf8"), /owned seed/);
  const mutable = join(
    f.root,
    "state",
    "plugins",
    "marketplaces",
    "workbuddy-builtin",
  );
  assert.ok(
    fs.existsSync(
      join(
        mutable,
        "plugins",
        "seed-owned",
        ".codebuddy-plugin",
        "plugin.json",
      ),
    ),
  );
  assert.equal(fs.existsSync(join(f.root, "state", "settings.json")), false);
  assert.equal(
    fs.existsSync(join(f.root, "state", "plugins", "known_marketplaces.json")),
    false,
  );
});
test("native new version creates another immutable snapshot while leaving old cache intact", async (t) => {
  const f = await fixture(t);
  await ownedBuiltinAssets(f.root);
  f.native.seedBuiltinPluginsMarketplace({});
  await ownedBuiltinAssets(f.root, [
    { name: "seed-owned", version: "2.0.0", category: "builtin-plugin" },
  ]);
  assert.equal(
    f.native.seedBuiltinPluginsMarketplace({}).marketplaceChanged,
    true,
  );
  assert.ok(fs.existsSync(snapshot(f.root, "seed-owned", "1.0.0")));
  assert.ok(fs.existsSync(snapshot(f.root, "seed-owned", "2.0.0")));
});
test("native file-by-file copier skips links and records individual probe/copy failures", async (t) => {
  const f = await fixture(t),
    src = join(f.root, "src"),
    dst = join(f.root, "dst");
  put(join(src, "good"), "good");
  put(join(src, "locked"), "locked");
  put(join(src, "copy-error"), "copy-error");
  fs.symlinkSync(join(src, "good"), join(src, "link"));
  const n = builtinSeedFixture(f.root, undefined, {
    fs: {
      ...fs,
      openSync(file: string, ...args: any[]) {
        if (file.endsWith("locked")) throw Error("owned lock");
        return (fs.openSync as any)(file, ...args);
      },
      copyFileSync(from: string, to: string) {
        if (from.endsWith("copy-error")) throw Error("owned copy");
        fs.copyFileSync(from, to);
      },
    },
  }).native;
  const result = n.safeCopyDirRecursive$1(src, dst);
  assert.equal(result.copied, 1);
  assert.equal(result.skipped, 3);
  assert.equal(result.errors.length, 2);
  assert.equal(fs.existsSync(join(dst, "link")), false);
  assert.equal(
    n.safeCopyDirRecursive$1(
      join(f.root, "missing"),
      join(f.root, "missing-dst"),
    ).errors.length,
    1,
  );
});
test("native marketplace staging copy failure keeps old source and discards incomplete staging", async (t) => {
  const f = await fixture(t),
    a = await ownedBuiltinAssets(f.root);
  f.native.seedBuiltinPluginsMarketplace({});
  await ownedBuiltinAssets(f.root, [
    { name: "seed-owned", version: "2.0.0", category: "builtin-plugin" },
  ]);
  const n = builtinSeedFixture(f.root, undefined, {
    fs: {
      ...fs,
      copyFileSync(from: string, to: string) {
        if (to.includes(".staging.")) throw Error("owned copy failure");
        fs.copyFileSync(from, to);
      },
    },
  }).native;
  assert.deepEqual(n.seedBuiltinPluginsMarketplace({}), {
    marketplaceChanged: false,
  });
  const market = join(
    f.root,
    "state",
    "plugins",
    "marketplaces",
    "workbuddy-builtin",
  );
  assert.match(
    fs.readFileSync(
      join(market, ".codebuddy-plugin", "marketplace.json"),
      "utf8",
    ),
    /1\.0\.0/,
  );
  assert.equal(
    fs.readdirSync(dirname(market)).some((n) => n.includes(".staging.")),
    false,
  );
  assert.ok(a.market);
});
test("native directory swap restores backup after promotion failure and retains it if restores fail", async (t) => {
  const f = await fixture(t),
    trusted = join(f.root, "swap"),
    target = join(trusted, "target"),
    stage = join(trusted, "stage");
  put(join(target, "value"), "old");
  put(join(stage, "value"), "new");
  let failRestore = false;
  const n = builtinSeedFixture(f.root, undefined, {
    fs: {
      ...fs,
      renameSync(from: string, to: string) {
        if (from === stage || (failRestore && from.includes(".backup.")))
          throw Error("owned rename");
        fs.renameSync(from, to);
      },
    },
  }).native;
  assert.throws(
    () => n.swapDirectoryFromStaging(stage, target, trusted, "owned"),
    /owned rename/,
  );
  assert.equal(fs.readFileSync(join(target, "value"), "utf8"), "old");
  failRestore = true;
  assert.throws(
    () => n.swapDirectoryFromStaging(stage, target, trusted, "owned"),
    /owned rename/,
  );
  assert.equal(fs.existsSync(target), false);
  const backup = fs
    .readdirSync(trusted)
    .find((n) => n.startsWith("target.backup."))!;
  assert.equal(fs.readFileSync(join(trusted, backup, "value"), "utf8"), "old");
});
test("native snapshot partial copy returns false and invalid sanitized version rejects before publication", async (t) => {
  const f = await fixture(t),
    a = await ownedBuiltinAssets(f.root);
  f.native.seedBuiltinPluginsMarketplace({});
  const source = join(a.market, "plugins", "seed-owned"),
    cache = join(f.root, "state", "plugins", "cache", "workbuddy-builtin"),
    target = join(cache, "seed-owned", "new");
  const n = builtinSeedFixture(f.root, undefined, {
    fs: {
      ...fs,
      copyFileSync() {
        throw Error("owned failure");
      },
    },
  }).native;
  assert.equal(
    n.copyPluginSnapshotAtomically(
      source,
      target,
      "seed-owned",
      "1.0.0",
      cache,
    ),
    false,
  );
  assert.equal(fs.existsSync(target), false);
  assert.throws(
    () =>
      f.native.copyPluginSnapshotAtomically(
        source,
        target,
        "seed-owned",
        "not-version",
        cache,
      ),
    /does not match/,
  );
  assert.equal(f.native.getPluginCacheVersion({}), "5.3.14+825709d464");
  assert.equal(f.native.getPluginCacheVersion({ version: " v/1 " }), "v_1");
});
test("native seed repairs marketplace links but refuses unsafe plugin/cache roots", async (t) => {
  const f = await fixture(t);
  await ownedBuiltinAssets(f.root);
  const state = join(f.root, "state"),
    outside = join(f.root, "outside");
  fs.mkdirSync(outside);
  put(join(outside, "sentinel"), "keep");
  fs.mkdirSync(join(state, "plugins"), { recursive: true });
  fs.symlinkSync(outside, join(state, "plugins", "marketplaces"));
  assert.equal(
    f.native.seedBuiltinPluginsMarketplace({}).metadataRequest.available,
    true,
  );
  assert.equal(
    fs.lstatSync(join(state, "plugins", "marketplaces")).isSymbolicLink(),
    false,
  );
  assert.equal(fs.readFileSync(join(outside, "sentinel"), "utf8"), "keep");
  const bad = join(f.root, "bad-state");
  fs.mkdirSync(join(bad, "plugins"), { recursive: true });
  fs.symlinkSync(outside, join(bad, "plugins", "cache"));
  const n = builtinSeedFixture(f.root, undefined, {
    getConfigDir: () => bad,
  }).native;
  assert.deepEqual(n.seedBuiltinPluginsMarketplace({}), {
    marketplaceChanged: false,
  });
  assert.equal(
    fs.lstatSync(join(bad, "plugins", "cache")).isSymbolicLink(),
    true,
  );
});
test("native current snapshot clears orphan link only and non-file marker is rejected", async (t) => {
  const f = await fixture(t);
  await ownedBuiltinAssets(f.root);
  f.native.seedBuiltinPluginsMarketplace({});
  const snap = snapshot(f.root),
    cache = dirname(dirname(snap)),
    external = join(f.root, "sentinel");
  put(external, "keep");
  fs.symlinkSync(external, join(snap, ".orphaned_at"));
  assert.equal(
    f.native.clearCurrentSnapshotOrphanMarker(
      cache,
      snap,
      "seed-owned",
      "1.0.0",
    ),
    true,
  );
  assert.equal(fs.readFileSync(external, "utf8"), "keep");
  fs.mkdirSync(join(snap, ".orphaned_at"));
  assert.throws(
    () =>
      f.native.clearCurrentSnapshotOrphanMarker(
        cache,
        snap,
        "seed-owned",
        "1.0.0",
      ),
    /non-file/,
  );
});
test("native legacy two-segment snapshot layout is recovered before marketplace replacement", async (t) => {
  const f = await fixture(t);
  await ownedBuiltinAssets(f.root);
  const market = join(
    f.root,
    "state",
    "plugins",
    "marketplaces",
    "workbuddy-builtin",
  );
  put(
    join(market, ".codebuddy-plugin", "marketplace.json"),
    JSON.stringify({ plugins: [{ name: "old", source: "./old/0.9.0" }] }),
  );
  put(
    join(market, "old", "0.9.0", ".codebuddy-plugin", "plugin.json"),
    '{"name":"old","version":"0.9.0"}',
  );
  put(join(market, "old", "0.9.0", "body"), "old snapshot");
  assert.equal(
    f.native.seedBuiltinPluginsMarketplace({}).marketplaceChanged,
    true,
  );
  assert.equal(
    fs.readFileSync(join(snapshot(f.root, "old", "0.9.0"), "body"), "utf8"),
    "old snapshot",
  );
  assert.equal(fs.existsSync(join(market, "old")), false);
});
test("native JSON staging retains .tmp on failed rename and does not unlink a staging directory", async (t) => {
  const f = await fixture(t),
    file = join(f.root, "json", "value.json");
  const n = builtinSeedFixture(f.root, undefined, {
    fs: {
      ...fs,
      renameSync() {
        throw Error("owned rename");
      },
    },
  }).native;
  assert.throws(() => n.writeJsonAtomic(file, { x: 1 }), /owned rename/);
  assert.ok(fs.existsSync(file + ".tmp.12345"));
  fs.unlinkSync(file + ".tmp.12345");
  fs.mkdirSync(file + ".tmp.12345");
  assert.throws(() => n.writeJsonAtomic(file, { x: 1 }), /staging directory/);
});
test("owned synchronous seed bridge limits mutators and blocks dangling destination links", async (t) => {
  const f = await fixture(t),
    state = join(f.root, "state"),
    outside = join(f.root, "external"),
    bridge = createOwnedBuiltinSeedFilesystem(state);
  fs.mkdirSync(outside);
  bridge.mkdirSync(state, { recursive: true });
  bridge.mkdirSync(join(state, "plugins"), { recursive: true });
  assert.throws(
    () => bridge.writeFileSync(join(outside, "value"), "bad"),
    /outside owned/,
  );
  assert.throws(
    () => bridge.openSync(join(outside, "value"), "w"),
    /read probes/,
  );
  fs.symlinkSync(join(outside, "new"), join(state, "plugins", "dangling"));
  assert.throws(() =>
    bridge.writeFileSync(join(state, "plugins", "dangling"), "bad"),
  );
  assert.equal(fs.existsSync(join(outside, "new")), false);
  bridge.unlinkSync(join(state, "plugins", "dangling"));
  assert.equal(fs.existsSync(join(state, "plugins", "dangling")), false);
});
test("native manifest validator retains weak field checks and exact dependency semver diagnostics", async (t) => {
  const f = await fixture(t),
    c = createNativePluginValidator({
      fsExtra: createOwnedPluginFilesystem(join(f.root, "state")),
    }),
    v = new c.PluginValidatorImpl();
  const file = join(f.root, "plugin.json");
  put(
    file,
    JSON.stringify({
      name: 1,
      commands: [7],
      hooks: [{ x: 1 }],
      dependencies: [
        "valid@market",
        "bad name",
        { name: "ok", version: "not range" },
        { name: "ok", marketplace: "bad name" },
        null,
      ],
    }),
  );
  const result = await v.validateManifest(file);
  assert.equal(result.success, false);
  assert.deepEqual(
    result.errors.map((e: any) => e.path),
    [
      "dependencies[1]",
      "dependencies[2].version",
      "dependencies[3].marketplace",
      "dependencies[4]",
    ],
  );
  put(file, '{"name":1,"commands":[7]}');
  assert.equal((await v.validateManifest(file)).success, true);
  assert.equal(
    (await v.validateManifest(join(f.root, "missing"))).fileType,
    "plugin",
  );
});
test("native controller parses IDs/scopes and preserves validation output/error identity", async (t) => {
  const f = await fixture(t),
    printed: any[] = [],
    vc = createNativePluginValidator({
      fsExtra: createOwnedPluginFilesystem(join(f.root, "state")),
    }),
    cc = createNativePluginController({
      ManifestValidationError: vc.ManifestValidationError,
      process: { stdin: { isTTY: false }, stdout: { isTTY: false } },
    });
  const c = Object.assign(new cc.PluginController(), {
    logger: { info() {}, error() {}, warn() {} },
    consoleManager: { log: (...args: any[]) => printed.push(args) },
    pluginValidator: new vc.PluginValidatorImpl(),
  });
  assert.deepEqual(c.parsePluginId("a@m@ignored"), [["a"], "m"]);
  assert.equal(c.parseScope("unknown"), "user");
  assert.equal(c.parseScope("local"), "project-local");
  assert.equal(c.getSourceInfo({ source: { repo: "r" } }), "r");
  await assert.rejects(
    c.validate({ path: join(f.root, "missing") }),
    vc.ManifestValidationError,
  );
  assert.match(printed.at(-1)[0], /Validation failed/);
  assert.deepEqual(printed.at(-1)[1], { mode: "native" });
});
test("native seed controller distinguishes failed metadata from committed metadata with projection error", async () => {
  const { PluginController } = createNativePluginController({
      ManifestValidationError: Error,
    }),
    c = Object.assign(new PluginController(), {
      logger: { warn() {} },
      pluginManager: {
        reconcileWorkbuddyBuiltinSeed: async () => ({ settingsChanged: true }),
      },
      pluginRuntimeRefreshService: {
        async refresh(_reason: any, options: any) {
          await options.prepareDesiredState();
          throw Error("owned projection");
        },
      },
    });
  const result = await c.reconcileWorkbuddyBuiltin({ available: true });
  assert.equal(Object.isFrozen(result), true);
  assert.equal(result.runtimeProjectionSucceeded, false);
  assert.equal(result.runtimeProjectionError, "owned projection");
  c.pluginManager.reconcileWorkbuddyBuiltinSeed = async () => {
    throw Error("owned metadata");
  };
  await assert.rejects(
    c.reconcileWorkbuddyBuiltin({ available: true }),
    /owned metadata/,
  );
});
test("native seed host serializes reconciliation and closing drains already accepted work", async (t) => {
  const f = await fixture(t),
    a = await ownedBuiltinAssets(f.root);
  let release!: () => void, entered!: () => void;
  const start = new Promise<void>((r) => (entered = r)),
    gate = new Promise<void>((r) => (release = r));
  let calls = 0;
  const host = createNativeBuiltinSeedHost({
    stateDir: join(f.root, "state"),
    getProductFeatures: () => ({}),
    logger: {},
    configuration: { assetsRoot: a.assets },
    controller: {
      async reconcileWorkbuddyBuiltin() {
        calls++;
        entered();
        await gate;
        return { runtimeProjectionSucceeded: true };
      },
    },
    refresh: { async waitForRefreshSettled() {} },
  });
  const first = host.seed(),
    second = host.seed();
  await start;
  const closing = host.close();
  assert.equal(calls, 1);
  await assert.rejects(host.seed(), /closed/);
  release();
  await Promise.all([first, second, closing]);
  assert.equal(calls, 2);
  assert.equal(host.pendingCount, 0);
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
          id: "seed",
          usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
          output: [
            {
              type: "message",
              role: "assistant",
              id: "m",
              status: "completed",
              content: [{ type: "output_text", text: "seed-ok" }],
            },
          ],
        },
      } as any;
    },
  };
}
test("real SDK consumes materialized builtin command/agent, restarts and preserves explicit disabled defaults", async (t) => {
  const f = await fixture(t),
    a = await ownedBuiltinAssets(f.root),
    requests: any[] = [];
  for (let i = 0; i < 2; i++) {
    const h = await createHarness({
      workDir: f.root,
      stateDir: join(f.root, "state"),
      recordReplayEnv: {},
      modelProvider: { getModel: () => model(requests) },
      nativePlugins: { builtinSeed: { assetsRoot: a.assets } },
      productRuntime: {
        watch: false,
        providers: [
          {
            priority: 21000,
            async provide() {
              return { productFeatures: { IntentRecommend: false } };
            },
          },
        ],
      },
    });
    try {
      assert.ok(await h.commandManager.get("/seed-owned:echo"));
      assert.ok(await h.agents.get("seeded-expert"));
      const s = await h.openSession();
      assert.equal(await h.prompt(s, "/seed-owned:echo owned-" + i), "seed-ok");
      assert.match(
        JSON.stringify(requests.at(-1).input),
        new RegExp("owned-" + i),
      );
      if (i === 1) {
        await h.pluginManager.disablePlugins(
          ["seed-owned"],
          "workbuddy-builtin",
        );
        await h.pluginHost!.builtinSeedHost.seed();
        assert.equal(
          (await h.settingsManager!.get("enabledPlugins", "user"))[
            "seed-owned@workbuddy-builtin"
          ],
          false,
        );
        assert.equal(await h.commandManager.get("/seed-owned:echo"), undefined);
      }
    } finally {
      await h.close();
      assert.equal(h.pluginHost!.ownedHandleCount, 0);
    }
  }
});
test("real builtin seed version reconcile updates installed registry and marks previous snapshot orphaned", async (t) => {
  const f = await fixture(t),
    a = await ownedBuiltinAssets(f.root);
  const h = await createHarness({
    workDir: f.root,
    stateDir: join(f.root, "state"),
    recordReplayEnv: {},
    modelProvider: { getModel: () => model([]) },
    nativePlugins: { builtinSeed: { assetsRoot: a.assets } },
    productRuntime: {
      watch: false,
      providers: [
        {
          priority: 21000,
          async provide() {
            return { productFeatures: { IntentRecommend: false } };
          },
        },
      ],
    },
  });
  try {
    await ownedBuiltinAssets(f.root, [
      { name: "seed-owned", version: "2.0.0", category: "builtin-plugin" },
    ]);
    const result = await h.pluginHost!.builtinSeedHost.seed();
    assert.equal(result.metadata.installedPluginsChanged, true);
    const p = await h.pluginManager.getPlugin(
      "seed-owned",
      "workbuddy-builtin",
    );
    assert.equal(p.version, "2.0.0");
    assert.equal(p.installedPath, snapshot(f.root, "seed-owned", "2.0.0"));
    assert.ok(fs.existsSync(join(snapshot(f.root), ".orphaned_at")));
  } finally {
    await h.close();
  }
});
test(
  "CLI builtin-assets flag seeds owned snapshots and reloads without a model request",
  { timeout: 15000 },
  async (t) => {
    const f = await fixture(t),
      a = await ownedBuiltinAssets(f.root),
      source = import.meta.url.endsWith(".ts"),
      entry = fileURLToPath(
        new URL(source ? "../src/cli.ts" : "../src/cli.js", import.meta.url),
      );
    const child = spawnSync(
      process.execPath,
      [
        ...(source ? ["--import", "tsx"] : []),
        entry,
        "--cwd",
        f.root,
        "--state-dir",
        join(f.root, "state"),
        "--builtin-assets",
        a.assets,
        "--base-url",
        "http://127.0.0.1:1/v1",
        "-p",
        "/reload-plugins",
      ],
      {
        cwd: fileURLToPath(new URL("../../", import.meta.url)),
        env: { PATH: process.env.PATH ?? "", CODEBUDDY_API_KEY: "owned-key" },
        encoding: "utf8",
        timeout: 12000,
      },
    );
    assert.equal(child.status, 0, child.stderr);
    assert.match(child.stdout, /Plugins reloaded successfully/);
    assert.ok(fs.existsSync(snapshot(f.root)));
  },
);
test("owned plugin bridge accepts canonical state aliases but rejects root removal and dangling writes", async (t) => {
  const f = await fixture(t),
    real = join(f.root, "physical"),
    alias = join(f.root, "alias"),
    outside = join(f.root, "outside");
  fs.mkdirSync(real);
  fs.mkdirSync(outside);
  fs.symlinkSync(real, alias);
  const bridge = createOwnedPluginFilesystem(alias);
  await bridge.writeFile(join(fs.realpathSync(real), "owned"), "ok");
  assert.equal(fs.readFileSync(join(real, "owned"), "utf8"), "ok");
  await assert.rejects(
    bridge.remove(fs.realpathSync(real)),
    /outside owned state/,
  );
  fs.symlinkSync(join(outside, "missing"), join(alias, "dangling"));
  await assert.rejects(bridge.writeFile(join(alias, "dangling"), "bad"));
  assert.equal(fs.existsSync(join(outside, "missing")), false);
});
test("default harness output-style binding reads workspace styles through fs promises", async (t) => {
  const f = await fixture(t);
  put(
    join(f.root, ".codebuddy", "output-styles", "owned.md"),
    "---\nname: Owned workspace\ndescription: owned\n---\nworkspace style content",
  );
  const h = await createHarness({
    workDir: f.root,
    stateDir: join(f.root, "state"),
    recordReplayEnv: {},
    modelProvider: { getModel: () => model([]) },
    productRuntime: { watch: false },
  });
  try {
    assert.match(
      (await h.pluginHost!.outputStyles.getOutputStyleByName("Owned workspace"))
        .content,
      /workspace style content/,
    );
  } finally {
    await h.close();
  }
});
test("owned controller closes pending readline confirmation and refuses new calls", async (t) => {
  const f = await fixture(t);
  let closeCalls = 0,
    entered!: () => void;
  const ready = new Promise<void>((r) => (entered = r));
  const host = createNativePluginControllerHost({
    pluginManager: {},
    refresh: {},
    fsExtra: createOwnedPluginFilesystem(join(f.root, "state")),
    logger: {},
    runtime: {
      process: { stdin: { isTTY: true }, stdout: { isTTY: true } },
      readline: {
        createInterface: () => {
          entered();
          return {
            question: () => new Promise(() => {}),
            close: () => closeCalls++,
          };
        },
      },
    },
  });
  const waiting = host.controller.confirmRemoval("owned");
  await ready;
  assert.equal(host.ownedHandleCount, 1);
  const rejected = assert.rejects(waiting, /closed|aborted/);
  await host.close();
  await rejected;
  assert.equal(host.pendingCount, 0);
  assert.equal(host.ownedHandleCount, 0);
  assert.equal(closeCalls, 1);
  assert.throws(() => host.controller.parseScope("user"), /closed/);
});
test("native metadata failure rolls back fresh USER defaults and market registration but retains materialized files", async (t) => {
  const f = await fixture(t);
  await ownedBuiltinAssets(f.root);
  const materialization = f.native.seedBuiltinPluginsMarketplace({});
  const h = await createHarness({
    workDir: f.root,
    stateDir: join(f.root, "state"),
    recordReplayEnv: {},
    modelProvider: { getModel: () => model([]) },
    productRuntime: { watch: false },
  });
  try {
    await h.settingsManager!.set("enabledPlugins", { "kept@else": false });
    await h.pluginRuntimeRefresh!.waitForRefreshSettled();
    const native = h.pluginManager.reconcileBuiltinSeedInstalledPlugins.bind(
      h.pluginManager,
    );
    let failed = false;
    h.pluginManager.reconcileBuiltinSeedInstalledPlugins = async (
      ...args: any[]
    ) => {
      if (!failed) {
        failed = true;
        throw Error("owned registry failure");
      }
      return native(...args);
    };
    await assert.rejects(
      h.pluginHost!.controller.reconcileWorkbuddyBuiltin(
        materialization.metadataRequest,
      ),
      /owned registry failure/,
    );
    await h.pluginRuntimeRefresh!.waitForRefreshSettled();
    assert.deepEqual(await h.settingsManager!.get("enabledPlugins", "user"), {
      "kept@else": false,
    });
    assert.equal(
      (await h.pluginHost!.marketplaceStorage.getMarketplaces()).some(
        (m: any) => m.name === "workbuddy-builtin",
      ),
      false,
    );
    assert.ok(fs.existsSync(snapshot(f.root)));
  } finally {
    await h.close();
  }
});
test("native metadata refuses corrupted USER settings and undoes registration without rewriting user bytes", async (t) => {
  const f = await fixture(t);
  await ownedBuiltinAssets(f.root);
  const materialization = f.native.seedBuiltinPluginsMarketplace({});
  put(join(f.root, "state", "settings.json"), "{broken");
  const h = await createHarness({
    workDir: f.root,
    stateDir: join(f.root, "state"),
    recordReplayEnv: {},
    modelProvider: { getModel: () => model([]) },
    productRuntime: { watch: false },
  });
  try {
    await assert.rejects(
      h.pluginHost!.controller.reconcileWorkbuddyBuiltin(
        materialization.metadataRequest,
      ),
      /Failed to apply.*defaults/,
    );
    assert.equal(
      fs.readFileSync(join(f.root, "state", "settings.json"), "utf8"),
      "{broken",
    );
    assert.equal(
      (await h.pluginHost!.marketplaceStorage.getMarketplaces()).some(
        (m: any) => m.name === "workbuddy-builtin",
      ),
      false,
    );
  } finally {
    await h.close();
  }
});
test("native bundled assets preserve all seven candidate priorities and per-instance root state", () => {
  const root = "/owned/dist/main",
    resources = "/owned/Resources",
    segments = ["plugins", "owned"];
  const expected = [
    join(resources, "app.asar.unpacked", "resources", ...segments),
    join(resources, "app.asar.unpacked", ...segments),
    join(root, ...segments),
    join(root, "..", "resources", ...segments),
    join(root, "resources", ...segments),
    join(root, "..", "..", ...segments),
    join(root, "..", "..", "resources", ...segments),
  ];
  for (let i = 0; i < expected.length; i++) {
    const seen: string[] = [],
      assets = createNativeBundledAssets({
        process: { resourcesPath: resources, cwd: () => "/fallback" },
        fs: {
          existsSync: (p: string) => {
            seen.push(p);
            return p === expected[i];
          },
        },
      });
    assets.setBundledAssetsRoot(root);
    assert.equal(assets.resolveBundledAsset(...segments), expected[i]);
    assert.deepEqual(seen, expected.slice(0, i + 1));
  }
  const a = createNativeBundledAssets({ process: { cwd: () => "/a" } }),
    b = createNativeBundledAssets({ process: { cwd: () => "/b" } });
  a.setBundledAssetsRoot("/custom");
  assert.equal(a.getAssetsRoot(), "/custom");
  assert.equal(b.getAssetsRoot(), "/b");
});
test("native bundled assets missing error reports root and searched paths without undefined candidates", () => {
  const a = createNativeBundledAssets({
    process: { cwd: () => "/owned" },
    fs: { existsSync: () => false },
  });
  assert.equal(a.resolveBundledAsset("missing"), undefined);
  assert.throws(
    () => a.requireBundledAsset("missing"),
    (error: any) => {
      assert.match(error.message, /Cannot locate "missing"/);
      assert.match(error.message, /Root: \/owned/);
      assert.doesNotMatch(error.message, /undefined/);
      return true;
    },
  );
});
test("seed host uses explicit unpacked resource location ahead of packaged root", async (t) => {
  const f = await fixture(t),
    a = await ownedBuiltinAssets(f.root),
    resources = join(f.root, "Resources"),
    unpacked = join(resources, "app.asar.unpacked", "resources");
  fs.mkdirSync(dirname(unpacked), { recursive: true });
  fs.renameSync(a.assets, unpacked);
  const host = createNativeBuiltinSeedHost({
    stateDir: join(f.root, "state"),
    getProductFeatures: () => ({}),
    logger: {},
    controller: {
      reconcileWorkbuddyBuiltin: async () => ({
        runtimeProjectionSucceeded: true,
      }),
    },
    refresh: { waitForRefreshSettled: async () => {} },
    configuration: {
      assetsRoot: join(f.root, "absent-root"),
      resourcesPath: resources,
    },
  });
  try {
    assert.equal(
      (await host.seed()).materialization.metadataRequest.available,
      true,
    );
    assert.ok(fs.existsSync(snapshot(f.root)));
  } finally {
    await host.close();
  }
});

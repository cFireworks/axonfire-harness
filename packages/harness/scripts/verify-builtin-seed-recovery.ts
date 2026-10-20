import assert from "node:assert/strict";
import * as fs from "node:fs";
import { join, dirname, relative } from "node:path";
import { tmpdir } from "node:os";
import { createHash } from "node:crypto";
import { parse } from "acorn";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { nodesOf } from "./helpers/captured-product-sources.js";
import {
  SEED_CLASSES,
  SEED_FILES,
  emittedSeed,
  desktopSeedMainPath,
  loadCapturedSeed,
} from "./helpers/captured-builtin-seed.js";
import {
  BUILTIN_SEED_FUNCTIONS,
  BUILTIN_SEED_CONSTANTS,
} from "../src/plugins/native-builtin-seed.js";
import {
  builtinSeedFixture,
  ownedBuiltinAssets,
} from "./helpers/builtin-seed-fixtures.js";
import { createNativePluginController } from "../src/plugins/native-plugin-controller.js";
import { createNativePluginValidator } from "../src/plugins/native-plugin-validator.js";
import { createOwnedPluginFilesystem } from "../src/plugins/owned-plugin-filesystem.js";
import {
  BUNDLED_ASSET_FUNCTIONS,
  BUNDLED_ASSET_CANDIDATES,
  createNativeBundledAssets,
} from "../src/plugins/native-bundled-assets.js";
const cliPath = getCapturedBundlePath(),
  mainPath = desktopSeedMainPath(cliPath),
  cli = fs.readFileSync(cliPath, "utf8"),
  main = fs.readFileSync(mainPath, "utf8"),
  assetsSource = fs.readFileSync(
    join(dirname(mainPath), "workbuddy-product-config.js"),
    "utf8",
  ),
  original = loadCapturedSeed(main, cli, assetsSource);
const ports = SEED_FILES.flatMap((file) =>
  nodesOf(
    parse(emittedSeed(file), { ecmaVersion: "latest", sourceType: "module" }),
  ),
);
function ast(n: any): any {
  return n && typeof n === "object"
    ? Array.isArray(n)
      ? n.map(ast)
      : Object.fromEntries(
          Object.entries(n)
            .filter(([k]) => !["start", "end", "raw"].includes(k))
            .map(([k, v]) => [k, ast(v)]),
        )
    : n;
}
let completeAsts = 0;
for (const [name, start, end] of SEED_CLASSES) {
  const raw: any = (
    parse("(" + cli.slice(start, end) + ")", { ecmaVersion: "latest" })
      .body[0] as any
  ).expression;
  assert.deepEqual(
    ast(
      ports.find((n) => n.type === "ClassDeclaration" && n.id?.name === name)
        .body,
    ),
    ast(raw.body),
    name,
  );
  completeAsts += raw.body.body.length;
}
for (const [name, start, end] of BUILTIN_SEED_FUNCTIONS) {
  const raw: any = parse(main.slice(start, end), { ecmaVersion: "latest" })
    .body[0];
  assert.equal(raw.id.name, name);
  assert.deepEqual(
    ast(
      ports.find(
        (n) => n.type === "FunctionDeclaration" && n.id?.name === name,
      ),
    ),
    ast(raw),
    name,
  );
  completeAsts++;
}
for (const [name, start, end] of BUNDLED_ASSET_FUNCTIONS) {
  const raw: any = parse(assetsSource.slice(start, end), {
    ecmaVersion: "latest",
  }).body[0];
  assert.equal(raw.id.name, name);
  assert.deepEqual(
    ast(
      ports.find(
        (n) => n.type === "FunctionDeclaration" && n.id?.name === name,
      ),
    ),
    ast(raw),
    name,
  );
  completeAsts++;
}
const candidates: any = (
  parse(
    "(" +
      assetsSource.slice(
        BUNDLED_ASSET_CANDIDATES[0],
        BUNDLED_ASSET_CANDIDATES[1],
      ) +
      ")",
    { ecmaVersion: "latest" },
  ).body[0] as any
).expression;
assert.deepEqual(
  ast(
    ports.find(
      (n) =>
        n.type === "AssignmentExpression" && n.left?.name === "CANDIDATES_FNS",
    ).right,
  ),
  ast(candidates),
);
for (const [name, start, end] of BUILTIN_SEED_CONSTANTS) {
  const raw: any = parse(main.slice(start, end), { ecmaVersion: "latest" })
    .body[0];
  assert.equal(raw.declarations[0].id.name, name);
  assert.deepEqual(
    ast(
      ports.find(
        (n) =>
          n.type === "VariableDeclaration" &&
          n.declarations?.[0]?.id?.name === name,
      ),
    ),
    ast(raw),
    name,
  );
}
const validatorModule = cli.slice(9838366, 9844968),
  rawVars = nodesOf(
    parse("({" + validatorModule + "})", { ecmaVersion: "latest" }),
  );
for (const name of ["ef", "em"]) {
  const n = rawVars.find(
    (n) => n.type === "VariableDeclarator" && n.id?.name === name,
  );
  assert.deepEqual(
    ast(
      ports.find((n) => n.type === "VariableDeclarator" && n.id?.name === name)
        .init,
    ),
    ast(n.init),
  );
}
const common = fs.readFileSync(join(dirname(mainPath), "common.js"), "utf8");
assert.match(common, /ProductFeature\["IntentRecommend"\] = "IntentRecommend"/);
assert.match(
  common,
  /ProductFeature\["TencentPptxBuiltinDefaultEnabled"\] = "TencentPptxBuiltinDefaultEnabled"/,
);
assert.match(
  cli.slice(cli.indexOf("42232("), cli.indexOf("42232(") + 200),
  /require\("readline\/promises"\)/,
);
assert.match(cli, /eA\.NATIVE="native"/);
const root = await fs.promises.mkdtemp(join(tmpdir(), "seed-diff-"));
function tree(root: string) {
  const rows: any[] = [];
  if (!fs.existsSync(root)) return rows;
  function visit(dir: string) {
    for (const name of fs.readdirSync(dir).sort()) {
      const file = join(dir, name),
        stat = fs.lstatSync(file);
      if (stat.isDirectory()) visit(file);
      else if (stat.isSymbolicLink())
        rows.push([relative(root, file), "link", fs.readlinkSync(file)]);
      else
        rows.push([
          relative(root, file),
          createHash("sha256").update(fs.readFileSync(file)).digest("hex"),
        ]);
    }
  }
  visit(root);
  return rows;
}
async function seedScenarios(home: string, factory: any) {
  const f = builtinSeedFixture(home, factory),
    n = f.native,
    out: any[] = [];
  const take = (v: any) => out.push(structuredClone(v)),
    attempt = async (fn: () => any) => {
      try {
        take(await fn());
      } catch (e: any) {
        take(["error", e.name, e.message]);
      }
    };
  take(n.seedBuiltinPluginsMarketplace({}));
  await ownedBuiltinAssets(home, [
    { name: "tencent-pptx", version: "1.0.0", category: "builtin-plugin" },
    { name: "other", version: "1.0.0", category: "builtin-plugin" },
    { name: "mode", version: "1.0.0", category: "mode" },
    {
      name: "win",
      version: "1.0.0",
      category: "builtin-plugin",
      platforms: ["win32"],
    },
  ]);
  for (const flags of [
    {},
    { IntentRecommend: true },
    { IntentRecommend: true, TencentPptxBuiltinDefaultEnabled: false },
    { IntentRecommend: "true" },
  ])
    take(n.seedBuiltinPluginsMarketplace(flags));
  take(tree(join(home, "state")));
  for (const value of [
    {},
    { version: " v/1 " },
    { version: "  " },
    { version: "." },
  ])
    take(n.getPluginCacheVersion(value));
  for (const platforms of [undefined, [], ["darwin"], ["win32"], "darwin"])
    take(n.isPluginSupportedOnPlatform({ platforms }, "darwin"));
  for (const source of [
    "safe",
    "nested/a",
    "../escape",
    "/absolute",
    "a\\..\\b",
  ])
    take(
      n.isValidMarketplaceManifest(
        { plugins: [{ name: "p", source }] },
        "owned",
      ),
    );
  take(n.isValidMarketplaceManifest({ name: "wrong", plugins: [] }, "owned"));
  const defaults: any = { "tencent-pptx@workbuddy-builtin": false };
  take(
    n.applyDefaultEnabledPlugins(
      [
        { name: "tencent-pptx", category: "builtin-plugin" },
        { name: "other", category: "builtin-plugin" },
      ],
      defaults,
      "darwin",
      null,
    ),
  );
  take(defaults);
  const src = join(home, "copy-src"),
    dst = join(home, "copy-dst");
  fs.mkdirSync(src, { recursive: true });
  fs.writeFileSync(join(src, "file"), "owned");
  fs.symlinkSync(join(src, "file"), join(src, "link"));
  take(n.safeCopyDirRecursive$1(src, dst));
  take(tree(dst));
  const failure = builtinSeedFixture(home, factory, {
    fs: {
      ...fs,
      openSync() {
        throw Error("owned probe failure");
      },
    },
  }).native;
  take(failure.safeCopyDirRecursive$1(src, join(home, "copy-failure")));
  take(
    n.safeCopyDirRecursive$1(join(home, "missing"), join(home, "missing-dst")),
  );
  const target = join(home, "swap", "target"),
    stage = join(home, "swap", "stage");
  fs.mkdirSync(target, { recursive: true });
  fs.mkdirSync(stage);
  fs.writeFileSync(join(target, "value"), "old");
  fs.writeFileSync(join(stage, "value"), "new");
  const swap = builtinSeedFixture(home, factory, {
    fs: {
      ...fs,
      renameSync(from: string, to: string) {
        if (from === stage) throw Error("owned promotion");
        fs.renameSync(from, to);
      },
    },
  }).native;
  await attempt(() =>
    swap.swapDirectoryFromStaging(stage, target, join(home, "swap"), "owned"),
  );
  take(fs.readFileSync(join(target, "value"), "utf8"));
  for (const name of ["..", "../bad", "..prefix", "safe"])
    await attempt(() => n.ensurePathInside(home, join(home, name), "owned"));
  const orphan = join(
    home,
    "state",
    "plugins",
    "cache",
    "workbuddy-builtin",
    "tencent-pptx",
    "1.0.0",
    ".orphaned_at",
  );
  fs.writeFileSync(orphan, "owned");
  take(
    n.clearCurrentSnapshotOrphanMarker(
      dirname(dirname(dirname(orphan))),
      dirname(orphan),
      "tencent-pptx",
      "1.0.0",
    ),
  );
  await ownedBuiltinAssets(home, [
    { name: "tencent-pptx", version: "2.0.0", category: "builtin-plugin" },
  ]);
  take(n.seedBuiltinPluginsMarketplace({}));
  take(tree(join(home, "state")));
  return out;
}
async function controllerScenarios(home: string, factories: any) {
  const out: any[] = [],
    printed: any[] = [],
    calls: any[] = [],
    vc = (factories.validator ?? createNativePluginValidator)({
      fsExtra: createOwnedPluginFilesystem(join(home, "state")),
    }),
    v = new vc.PluginValidatorImpl();
  const cc = (factories.controller ?? createNativePluginController)({
    ManifestValidationError: vc.ManifestValidationError,
    process: { stdin: { isTTY: false }, stdout: { isTTY: false } },
  });
  const take = (value: any) => out.push(structuredClone(value)),
    attempt = async (fn: () => any) => {
      try {
        take(await fn());
      } catch (e: any) {
        take(["error", e.name, e.message]);
      }
    };
  const m: any = {};
  for (const name of [
    "addMarketplace",
    "updateMarketplace",
    "removeMarketplace",
    "installPlugins",
    "uninstallPlugins",
    "enablePlugins",
    "disablePlugins",
    "updatePlugins",
    "prunePlugins",
    "getPlugin",
    "getPlugins",
  ])
    m[name] = async (...args: any[]) => {
      calls.push([name, ...args]);
      if (name === "prunePlugins") return ["dep@owned"];
      return { name: "owned", type: "directory" };
    };
  m.listMarketplace = async () => [
    {
      name: "m",
      type: "directory",
      source: { path: "owned" },
      description: "owned",
    },
  ];
  m.getInstalledPlugins = async () => [
    {
      name: "p",
      marketplaceName: "m",
      version: "1",
      status: "enabled",
      installScope: "project-local",
      installedPath: "owned",
    },
  ];
  m.reconcileWorkbuddyBuiltinSeed = async () => ({ settingsChanged: true });
  const c = Object.assign(new cc.PluginController(), {
    logger: { info() {}, warn() {}, error() {} },
    consoleManager: { log: (...args: any[]) => printed.push(args) },
    pluginManager: m,
    pluginValidator: v,
    pluginRuntimeRefreshService: {
      async refresh(_reason: any, opts: any) {
        await opts.prepareDesiredState();
      },
    },
  });
  for (const scope of ["user", "project", "local", "invalid", undefined])
    take(c.parseScope(scope));
  for (const id of ["p@m", "p@m@ignored", "p", "@m"]) take(c.parsePluginId(id));
  take(c.formatInstalledPluginList([]));
  take(c.formatInstalledPluginList(await m.getInstalledPlugins()));
  for (const type of ["directory", "github", "git", "url", "zip", "unknown"])
    take(c.getMarketplaceTypeLabel(type));
  for (const entry of [
    { source: { path: "p" } },
    { source: { repo: "r" } },
    { installLocation: "i" },
    {},
  ])
    take(c.getSourceInfo(entry));
  await attempt(() => c.addMarketplace({ source: "owned", name: "m" }));
  await attempt(() => c.listMarketplaces());
  await attempt(() => c.updateMarketplace({ name: "m", force: true }));
  await attempt(() => c.removeMarketplace({ name: "m" }));
  await attempt(() => c.rmMarketplace({ name: "m" }));
  for (const name of [
    "installPlugins",
    "uninstallPlugins",
    "enablePlugins",
    "disablePlugins",
    "updatePlugin",
  ])
    await attempt(() =>
      c[name]({
        plugin: "p@m",
        scope: "local",
        prune: true,
        yes: true,
        keepData: false,
        options: { owned: true },
      }),
    );
  for (const opts of [{}, { dryRun: true }, { yes: true }])
    await attempt(() => c.prunePlugins(opts));
  for (const opts of [{}, { print: true, json: true }, { print: true }])
    await attempt(() => c.listInstalledPlugins(opts));
  await attempt(() => c.getPlugin({ name: "p", marketplace: "m" }));
  await attempt(() => c.browseMarketplace({ marketplace: "m" }));
  await attempt(() => c.browseMarketplace({}));
  await attempt(() => c.confirmRemoval("owned"));
  take(await c.reconcileWorkbuddyBuiltin({ available: true }));
  c.pluginRuntimeRefreshService.refresh = async (_reason: any, opts: any) => {
    await opts.prepareDesiredState();
    throw Error("owned projection");
  };
  take(await c.reconcileWorkbuddyBuiltin({ available: true }));
  fs.mkdirSync(home, { recursive: true });
  const file = join(home, "plugin.json");
  for (const value of [
    { name: "ok" },
    { commands: 7 },
    { name: 1, commands: [8], hooks: [{}] },
    {
      name: "ok",
      dependencies: [
        "p@m",
        "bad name",
        { name: "ok", version: "^1.0.0" },
        { name: "ok", version: "bad" },
        null,
      ],
    },
  ]) {
    fs.writeFileSync(file, JSON.stringify(value));
    take(await v.validateManifest(file));
    await attempt(() => c.validate({ path: file }));
  }
  const marketFile = join(home, "marketplace.json");
  for (const value of [
    { plugins: [{ name: "p", source: "./p" }] },
    { plugins: "bad" },
    { plugins: [null] },
    { plugins: [], allowCrossMarketplaceDependenciesOn: ["bad name"] },
  ]) {
    fs.writeFileSync(marketFile, JSON.stringify(value));
    take(await v.validateManifest(marketFile));
  }
  fs.writeFileSync(file, "{broken");
  take(await v.validateManifest(file));
  take(await v.validateManifest(join(home, "missing")));
  take(calls);
  take(printed);
  return out;
}
let comparisons = 0;
async function assetScenarios(
  _home: string,
  factory: any = createNativeBundledAssets,
) {
  const out: any[] = [],
    base = "/owned/dist/main",
    resources = "/owned/Resources",
    segments = ["plugins", "owned"];
  const candidates = [
    join(resources, "app.asar.unpacked", "resources", ...segments),
    join(resources, "app.asar.unpacked", ...segments),
    join(base, ...segments),
    join(base, "..", "resources", ...segments),
    join(base, "resources", ...segments),
    join(base, "..", "..", ...segments),
    join(base, "..", "..", "resources", ...segments),
  ];
  for (let i = 0; i < candidates.length; i++) {
    const calls: string[] = [],
      a = factory({
        process: { resourcesPath: resources, cwd: () => "/owned/cwd" },
        fs: {
          existsSync(file: string) {
            calls.push(file);
            return file === candidates[i];
          },
        },
      });
    a.setBundledAssetsRoot(base);
    out.push(a.resolveBundledAsset(...segments), calls);
  }
  const a = factory({
    process: { cwd: () => "/owned/cwd" },
    fs: { existsSync: () => false },
  });
  out.push(a.getAssetsRoot());
  try {
    a.requireBundledAsset(...segments);
  } catch (error: any) {
    out.push(error.message);
  }
  const b = factory({
    process: { cwd: () => "/other" },
    fs: { existsSync: () => false },
  });
  a.setBundledAssetsRoot("/changed");
  out.push([a.getAssetsRoot(), b.getAssetsRoot()]);
  return out;
}
let packagedAssets: any;
try {
  const home = join(root, "fixture");
  for (const scenario of [seedScenarios, controllerScenarios, assetScenarios]) {
    const expected = await scenario(
      home,
      scenario === seedScenarios
        ? original.seed
        : scenario === assetScenarios
          ? original.assets
          : original,
    );
    await fs.promises.rm(home, { recursive: true, force: true });
    const actual = await scenario(
      home,
      scenario === seedScenarios || scenario === assetScenarios
        ? undefined
        : {},
    );
    assert.equal(actual.length, expected.length);
    for (let i = 0; i < actual.length; i++) {
      assert.deepEqual(actual[i], expected[i], scenario.name + " " + i);
      comparisons++;
    }
    await fs.promises.rm(home, { recursive: true, force: true });
  }
  const resources = join(dirname(mainPath), "../resources"),
    manifest = join(
      resources,
      "plugins",
      "workbuddy-builtin",
      ".codebuddy-plugin",
      "marketplace.json",
    );
  if (fs.existsSync(manifest)) {
    const owned = join(root, "packaged");
    const run = (factory: any) => {
      const f = builtinSeedFixture(owned, factory, {
        resolveBundledAsset: (...segments: string[]) => {
          const p = join(resources, ...segments);
          return fs.existsSync(p) ? p : undefined;
        },
      });
      return {
        result: f.native.seedBuiltinPluginsMarketplace({}),
        files: tree(join(owned, "state")),
      };
    };
    // Data-only copies and hashes: never import or execute any plugin, Hook,
    // MCP program or native executable from the installed resource package.
    const expected = run(original.seed);
    await fs.promises.rm(owned, { recursive: true, force: true });
    const actual = run(undefined);
    assert.deepEqual(actual, expected);
    comparisons++;
    packagedAssets = {
      manifestSha256: createHash("sha256")
        .update(fs.readFileSync(manifest))
        .digest("hex"),
      metadataRequestProduced: !!actual.result.metadataRequest,
      materializedFiles: actual.files.length,
    };
  }
  console.log(
    JSON.stringify({
      completeAsts,
      completeClasses: SEED_CLASSES.length,
      constantInitializers: BUILTIN_SEED_CONSTANTS.length + 3,
      comparisons,
      packagedAssets,
      scope:
        "original Desktop seed/materializer/safe-copy functions and complete CLI controller/validator under owned fixtures; optional fixed packaged assets are copied/hashed only, never executed; not Electron bootstrap",
    }),
  );
} finally {
  await fs.promises.rm(root, { recursive: true, force: true });
}

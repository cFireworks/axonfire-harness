import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parse } from "acorn";
import ts from "typescript";
import {
  PRODUCT_CLASSES,
  PRODUCT_WATCH_CLASSES,
  PRODUCT_HELPERS,
  loadCapturedProductManager,
  loadCapturedProductWatchers,
} from "./helpers/captured-product-manager.js";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { productManagerFixture } from "./helpers/product-manager-fixtures.js";
import { createNativeProductRuntime } from "../src/config/native-product-runtime.js";
import * as constants from "../src/config/native-product-constants.js";
import { createNativeProductWatchers } from "../src/config/native-product-watchers.js";
import { EventEmitter } from "node:events";
const source = await readFile(getCapturedBundlePath(), "utf8"),
  original = loadCapturedProductManager(source),
  nodes: any[] = [];
function walk(node: any) {
  if (!node || typeof node !== "object") return;
  if (
    ["ClassDeclaration", "ClassExpression", "FunctionDeclaration"].includes(
      node.type,
    )
  )
    nodes.push(node);
  for (const [k, v] of Object.entries(node))
    if (!["start", "end"].includes(k)) {
      if (Array.isArray(v)) v.forEach(walk);
      else walk(v);
    }
}
function ast(node: any): any {
  return node && typeof node === "object"
    ? Array.isArray(node)
      ? node.map(ast)
      : Object.fromEntries(
          Object.entries(node)
            .filter(([k]) => !["start", "end", "raw"].includes(k))
            .map(([k, v]) => [k, ast(v)]),
        )
    : node;
}
for (const file of ["native-product-runtime", "native-product-watchers"]) {
  const output = ts.transpileModule(
    await readFile(
      new URL("../src/config/" + file + ".ts", import.meta.url),
      "utf8",
    ),
    {
      compilerOptions: {
        target: ts.ScriptTarget.ES2023,
        module: ts.ModuleKind.ESNext,
      },
    },
  ).outputText;
  walk(parse(output, { ecmaVersion: "latest", sourceType: "module" }));
}
let completeAsts = 0,
  comparisons = 0;
for (const [name, start, end] of [
  ...PRODUCT_CLASSES,
  ...PRODUCT_WATCH_CLASSES,
]) {
  const expected: any = (
      parse("(" + source.slice(start, end) + ")", { ecmaVersion: "latest" })
        .body[0] as any
    ).expression,
    actual = nodes.find((n) => n.id?.name === name);
  assert.deepEqual(ast(actual.body), ast(expected.body), name);
  completeAsts += expected.body.body.length;
}
for (const [name, start, end] of PRODUCT_HELPERS) {
  assert.deepEqual(
    ast(nodes.find((n) => n.id?.name === name)),
    ast(parse(source.slice(start, end), { ecmaVersion: "latest" }).body[0]),
    name,
  );
  completeAsts++;
}
for (const key of [
  "MergeStrategy",
  "PRODUCT_CONFIGURATION_CACHE_TIMEOUT",
  "ProductProviderPriority",
  "OVERRIDE_MODE",
]) {
  assert.deepEqual(
    ast((constants as any)[key]),
    ast(original.constants[key]),
    key,
  );
}
for (const [key, value] of Object.entries(constants.ProductFeature))
  assert.equal(value, original.constants.ProductFeature[key]);
for (const [key, value] of Object.entries(constants.PRODUCT_MANAGER_STATICS)) {
  const expression = source
    .slice(15597577, 15598480)
    .match(new RegExp("\\." + key + "=([^,;]+)"))?.[1];
  assert.ok(expression, key);
  assert.equal(Function("return (" + expression + ")")(), value, key);
}
const inputs = [
  {},
  null,
  undefined,
  [],
  [1, 2],
  [2, 3],
  { name: "one", value: 1 },
  { nested: { list: [{ name: "one", value: 1 }] } },
  { agents: [{ name: "cli", models: ["one"] }] },
  { builtInMarketPluginsMerge: [{ name: "one" }] },
  { commands: [{ name: "/owned", prompt: "old", allowedTools: ["Read"] }] },
];
for (const Strategy of [
  "OverrideProductMergeStrategy",
  "MergeProductMergeStrategy",
  "SmartMergeProductMergeStrategy",
  "DeepSmartMergeProductMergeStrategy",
  "CommandsSmartMergeProductMergeStrategy",
]) {
  const f = productManagerFixture(),
    g = productManagerFixture({}, original.factory);
  for (const left of inputs)
    for (const right of inputs) {
      const a = new f.classes[Strategy](),
        b = new g.classes[Strategy]();
      let x: any, y: any;
      try {
        x = { value: await a.merge(left, right) };
      } catch (e) {
        x = { error: (e as Error).message };
      }
      try {
        y = { value: await b.merge(left, right) };
      } catch (e) {
        y = { error: (e as Error).message };
      }
      assert.deepEqual(
        JSON.parse(JSON.stringify(x)),
        JSON.parse(JSON.stringify(y)),
        Strategy,
      );
      comparisons++;
    }
}
for (const volatile of [false, true])
  for (const syncStorage of [false, true])
    for (const error of [undefined, "stable", "volatile"])
      for (const providerName of ["owned", "SkillProductProvider"]) {
        async function run(factory: any) {
          const f = productManagerFixture(
            { volatile, syncStorage, error, providerName },
            factory,
          );
          await f.manager.sync();
          await f.settle();
          f.nextRevision();
          await f.manager.syncVolatileProviders(true);
          await f.settle();
          return f.snapshot();
        }
        assert.deepEqual(
          await run(createNativeProductRuntime),
          await run(original.factory),
        );
        comparisons++;
      }
for (const cacheValue of [
  undefined,
  { endpoint: "http://owned-cache.invalid", productConfigEnv: "OWNED_CONFIG" },
  "invalid gzip",
]) {
  for (const syncStorage of [false, true]) {
    async function run(factory: any) {
      const f = productManagerFixture(
        {
          syncStorage,
          env: {
            OWNED_CONFIG: JSON.stringify({ networkEnvironment: "owned" }),
          },
        },
        factory,
      );
      f.data.set(f.classes.ProductManagerImpl.getCacheKey(), cacheValue);
      if (syncStorage) f.manager.loadFromCache();
      else await f.manager.loadFromCacheAsync();
      return JSON.parse(
        JSON.stringify({
          value: f.manager._configuration,
          env: f.runtime.env,
          level: f.manager.dataLevel,
        }),
      );
    }
    assert.deepEqual(
      await run(createNativeProductRuntime),
      await run(original.factory),
    );
    comparisons++;
  }
}
const originalWatch = loadCapturedProductWatchers(source);
for (const platform of ["win32", "darwin", "linux"])
  for (const count of [0, 512, 513])
    for (const changeType of [
      "skills",
      "commands",
      "agents",
      "memory",
      "rules",
      "settings",
    ])
      for (const eventType of ["rename", "change"]) {
        async function run(factory: any) {
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
              clearCache: (...args: any[]) =>
                events.push([key, "clearCache", ...args]),
              invalidateFilesystemScopeCaches: () =>
                events.push([key, "invalidate"]),
              sync: (force: any) => events.push([key, "sync", force]),
            };
          const classes = factory({
              platform,
              getWorkDir: () => "/owned",
              getHomeDir: () => "/owned/home",
              now: () => 1000,
              env: {},
              dependencies,
              setTimeout: (callback: () => void) => {
                const id = {};
                timers.set(id, callback);
                return id;
              },
              clearTimeout: (id: any) => timers.delete(id),
              fs: {
                promises: {
                  access: async () => {},
                  readdir: async () =>
                    Array.from({ length: count }, () => ({})),
                },
                watch: (_p: string, options: any, callback: any) => {
                  events.push(["watch", options]);
                  const handle = Object.assign(new EventEmitter(), {
                    callback,
                    close() {
                      events.push(["close"]);
                    },
                    unref() {},
                  });
                  handles.push(handle);
                  return handle;
                },
              },
            }),
            watch = Object.assign(new classes.ConfigWatchServiceImpl(), {
              logger: { info() {}, debug() {}, warn() {}, error() {} },
            });
          await watch.watchPath({
            path: "/owned",
            recursive: true,
            changeType,
          });
          handles[0].callback(eventType, "owned.md");
          for (const callback of [...timers.values()]) callback();
          watch.cleanup();
          return JSON.parse(JSON.stringify(events));
        }
        assert.deepEqual(
          await run(createNativeProductWatchers),
          await run(originalWatch),
        );
        comparisons++;
      }
console.log(
  JSON.stringify(
    {
      passed: true,
      completeMemberAndFunctionAsts: completeAsts,
      comparisons,
      scope:
        "complete ProductManager, merge strategies, providers, MCP prompt renderer and watchers; isolated VM/fake I/O",
    },
    null,
    2,
  ),
);

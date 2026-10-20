import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { parse } from "acorn";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { nodesOf } from "./helpers/captured-product-sources.js";
import {
  PLUGIN_CLASSES,
  PLUGIN_HELPERS,
  emittedPlugin,
  loadCapturedPlugins,
} from "./helpers/captured-plugin-runtime.js";
import { pluginRuntimeFixture } from "./helpers/plugin-runtime-fixtures.js";
import { PLUGIN_CONSTANTS_SHA256 } from "../src/vendor/captured-plugin-constants.js";
import { PLUGIN_SEMVER_FACTORY_SHA256 } from "../src/plugins/native-plugin-semver.js";
const source = await readFile(getCapturedBundlePath(), "utf8"),
  captured = loadCapturedPlugins(source);
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
const ports = [
  "native-plugin-runtime",
  "native-plugin-manager",
  "native-plugin-loaders",
].flatMap((file) =>
  nodesOf(
    parse(emittedPlugin(file), { ecmaVersion: "latest", sourceType: "module" }),
  ),
);
let completeAsts = 0,
  comparisons = 0;
for (const [name, start, end] of PLUGIN_CLASSES) {
  const original: any = (
    parse("(" + source.slice(start, end) + ")", { ecmaVersion: "latest" })
      .body[0] as any
  ).expression;
  assert.deepEqual(
    ast(
      ports.find((n) => n.type === "ClassDeclaration" && n.id?.name === name)
        .body,
    ),
    ast(original.body),
    name,
  );
  completeAsts += original.body.body.length;
}
for (const [name, start, end] of PLUGIN_HELPERS) {
  assert.deepEqual(
    ast(
      ports.find((n) => n.type === "FunctionDeclaration" && n.id.name === name),
    ),
    ast(parse(source.slice(start, end), { ecmaVersion: "latest" }).body[0]),
    name,
  );
  completeAsts++;
}
const originalNodes = nodesOf(parse(source, { ecmaVersion: "latest" })),
  constants = await readFile(
    new URL("../src/vendor/captured-plugin-constants.ts", import.meta.url),
    "utf8",
  ),
  constantNodes = nodesOf(
    parse(constants, { ecmaVersion: "latest", sourceType: "module" }),
  );
const concurrency = nodesOf(
  parse(emittedPlugin("native-plugin-concurrency"), {
    ecmaVersion: "latest",
    sourceType: "module",
  }),
);
for (const name of ["getPositiveIntegerEnv", "mapWithConcurrency"]) {
  const original = originalNodes.find(
    (n) =>
      n.type === "FunctionDeclaration" &&
      n.id.name === name &&
      n.start >= 13060973 &&
      n.end < 13061500,
  );
  assert.deepEqual(
    ast(
      concurrency.find(
        (n) => n.type === "FunctionDeclaration" && n.id.name === name,
      ),
    ),
    ast(original),
  );
  completeAsts++;
}
const ids = [6527, 47962, 26106],
  parts: string[] = [];
const semverNodes = nodesOf(
  parse(emittedPlugin("native-plugin-semver"), {
    ecmaVersion: "latest",
    sourceType: "module",
  }),
);
const semverOriginal = originalNodes.find(
  (n) => n.type === "Property" && n.key?.value === 94377,
);
assert.deepEqual(
  ast(semverNodes.find((n) => n.type === "Property" && n.key?.value === 94377)),
  ast(semverOriginal),
);
assert.equal(
  createHash("sha256")
    .update(source.slice(semverOriginal.start, semverOriginal.end))
    .digest("hex"),
  PLUGIN_SEMVER_FACTORY_SHA256,
);
for (const id of ids) {
  const original = originalNodes.find(
    (n) => n.type === "Property" && n.key?.value === id,
  );
  assert.deepEqual(
    ast(
      constantNodes.find((n) => n.type === "Property" && n.key?.value === id),
    ),
    ast(original),
  );
  parts.push(source.slice(original.start, original.end));
}
assert.equal(
  createHash("sha256")
    .update("{" + parts.join(",") + "}")
    .digest("hex"),
  PLUGIN_CONSTANTS_SHA256,
);
const frontmatter = nodesOf(
  parse(emittedPlugin("native-plugin-frontmatter"), {
    ecmaVersion: "latest",
    sourceType: "module",
  }),
);
for (const name of ["AW", "AV", "AZ", "AX", "A0", "A1", "A2", "A3"]) {
  const original = originalNodes.find(
    (n) =>
      n.type === "VariableDeclarator" &&
      n.start >= 9580751 &&
      n.end <= 9581916 &&
      n.id.name === name,
  );
  assert.deepEqual(
    ast(
      frontmatter.find(
        (n) => n.type === "VariableDeclarator" && n.id.name === name,
      ),
    ),
    ast(original),
  );
  completeAsts++;
}
function same(a: any, b: any) {
  assert.deepEqual(ast(a), ast(b));
  comparisons++;
}
for (const reason of [
  "startup",
  "prewarm-activate",
  "builtin-seed",
  "reload-command",
  "acp-host-refresh",
  "settings-change",
])
  for (const reloadDesiredState of [true, false])
    for (const repaired of [[], ["dep@owned"]])
      for (const failure of ["none", "mcp", "lsp", "load"]) {
        const fixtures = [{}, captured].map((f) =>
          pluginRuntimeFixture(
            {
              repaired,
              mcpError: failure === "mcp",
              lspError: failure === "lsp",
              loadError: failure === "load",
            },
            f,
          ),
        );
        const outcomes = await Promise.all(
          fixtures.map(async (f) => {
            try {
              return {
                result: await f.refresh.refresh(reason, { reloadDesiredState }),
              };
            } catch (e) {
              return { error: String(e) };
            }
          }),
        );
        await Promise.all(
          fixtures.map((f) => f.refresh.waitForRefreshSettled()),
        );
        await Promise.resolve();
        same(outcomes[0], outcomes[1]);
        same(fixtures[0]!.events, fixtures[1]!.events);
      }
for (const projected of [[], ["owned"], ["old"], ["z", "a"]])
  for (const effective of [[], ["owned"], ["new"], ["z", "a"]])
    for (const blockMcpToolChanges of [true, false]) {
      const fixtures = [{}, captured].map((f) =>
        pluginRuntimeFixture({ projected, effective }, f),
      );
      const outcomes = await Promise.all(
        fixtures.map(async (f) => {
          try {
            return {
              result: await f.refresh.refresh("reload-command", {
                blockMcpToolChanges,
              }),
            };
          } catch (e: any) {
            return { error: e.message, added: e.added, removed: e.removed };
          }
        }),
      );
      same(outcomes[0], outcomes[1]);
      same(fixtures[0]!.events, fixtures[1]!.events);
    }
const names = ["a", " spaced/name ", "..", "alpha.beta", "a@b", "", "a+b"],
  versions = [undefined, "1.0.0", "v1.2.3", "bad", "2.0.0-beta.1"];
for (const name of names)
  for (const version of versions) {
    const fixtures = [{}, captured].map((f) => pluginRuntimeFixture({}, f));
    for (const method of [
      "sanitizeCacheSegment",
      "sanitizeBuiltinSeedCacheSegment",
      "getDependencyDeclarationKey",
      "getSettingsScopePriority",
      "normalizeInstalledPluginsRegistry",
    ]) {
      const value =
        method === "normalizeInstalledPluginsRegistry"
          ? {
              version: 2,
              plugins: {
                [name]: [
                  { scope: "user", installPath: "/owned/" + name, version },
                ],
              },
            }
          : name;
      same(
        ...(fixtures.map((f) => f.manager[method](value, version)) as [
          any,
          any,
        ]),
      );
    }
    same(
      ...(fixtures.map((f) =>
        f.manager.versionSatisfiesRange(version, "^1.0.0"),
      ) as [any, any]),
    );
  }
for (const roots of [[], ["a"], ["a", "a"]])
  for (const cycle of [true, false]) {
    const graph = new Map([
      ["a", { dependencies: ["b"] }],
      ["b", { dependencies: cycle ? ["a"] : ["missing"] }],
    ]);
    same(
      ...([{}, captured].map((f) =>
        pluginRuntimeFixture({}, f).managerClasses.resolveDependencyClosure(
          roots[0] ?? "a",
          graph,
        ),
      ) as [any, any]),
    );
  }
console.log(
  JSON.stringify({
    completeAsts,
    comparisons,
    pureFactories: 3,
    constantSha256: PLUGIN_CONSTANTS_SHA256,
    scope:
      "full native classes and helpers; shared owned DI, not complete marketplace/product bootstrap",
  }),
);

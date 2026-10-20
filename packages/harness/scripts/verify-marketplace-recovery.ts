import assert from "node:assert/strict";
import { readFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parse } from "acorn";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { nodesOf } from "./helpers/captured-product-sources.js";
import {
  MARKETPLACE_CLASSES,
  MARKETPLACE_HELPERS,
  emittedMarketplace,
  loadCapturedMarketplace,
} from "./helpers/captured-marketplace.js";
import { marketplaceFixture } from "./helpers/marketplace-fixtures.js";
import { createNativeMarketplace } from "../src/plugins/native-marketplace.js";
import { createNativeFileLock } from "../src/tasks/native-file-lock.js";
import { remoteMarketplaceDifferential } from "./helpers/remote-marketplace-differential.js";
import { createHash } from "node:crypto";
import {
  createCapturedMarketplacePolicy,
  MARKETPLACE_POLICY_SHA256,
} from "../src/vendor/captured-marketplace-policy.js";
const source = await readFile(getCapturedBundlePath(), "utf8"),
  captured = loadCapturedMarketplace(source);
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
  "plugins/native-marketplace",
  "tasks/native-file-lock",
  "plugins/native-zip-utils",
].flatMap((file) =>
  nodesOf(
    parse(emittedMarketplace(file), {
      ecmaVersion: "latest",
      sourceType: "module",
    }),
  ),
);
let completeAsts = 0,
  comparisons = 0;
const originalNodes = nodesOf(parse(source, { ecmaVersion: "latest" }));
const constantRows: Array<[string, number, number]> = [
  ["t6", 9540000, 9540634],
  ["Ac", 9547325, 9547937],
  ["Au", 9547325, 9547937],
  ["Ad", 9547325, 9547937],
  ["AQ", 9567108, 9569105],
  ["AD", 9567108, 9569105],
  ["AT", 9567108, 9569105],
  ["AO", 9577492, 9579120],
  ["ew", 9844969, 9845680],
  ["eB", 9844969, 9845680],
  ["e_", 9844969, 9845680],
  ["eI", 9844969, 9845680],
];
for (const [name, start, end] of constantRows) {
  const original = originalNodes.find(
    (n) =>
      n.type === "VariableDeclarator" &&
      n.id?.name === name &&
      n.start >= start &&
      n.end <= end,
  );
  assert.ok(original, name);
  const candidates = ports.filter(
    (n) => n.type === "VariableDeclarator" && n.id?.name === name,
  );
  assert.ok(
    candidates.some(
      (n) => JSON.stringify(ast(n.init)) === JSON.stringify(ast(original.init)),
    ),
    "constant " + name,
  );
}
const policyOriginal = source.slice(9805697, 9807385);
assert.equal(
  createHash("sha256").update(policyOriginal).digest("hex"),
  MARKETPLACE_POLICY_SHA256,
);
const policyNodes = nodesOf(
  parse(
    await readFile(
      new URL("../src/vendor/captured-marketplace-policy.ts", import.meta.url),
      "utf8",
    ),
    { ecmaVersion: "latest", sourceType: "module" },
  ),
);
assert.deepEqual(
  ast(policyNodes.find((n) => n.type === "Property" && n.key?.value === 13423)),
  ast(
    nodesOf(
      parse("({" + policyOriginal + "})", { ecmaVersion: "latest" }),
    ).find((n) => n.type === "Property" && n.key?.value === 13423),
  ),
);
const policy: any = createCapturedMarketplacePolicy();
for (const name of [
  "owned",
  "official-codebuddy-copy",
  "codebuddy-plugins-official",
  "CLAUDE-PLUGINS-OFFICIAL",
  "knowledge-work-plugins",
  "agent-skills",
  "中文",
  "x-clɑude-official",
  "codebuddy",
])
  for (const source of [
    undefined,
    "owner/repo",
    "tencent-ai/repo",
    "https://github.com/anthropics/repo",
    "git@github.com:codebuddy/repo",
    "https://download.codebuddy.cn/plugin-marketplace/owned.zip",
    "https://github.com/evil/repo",
    "https://example.test/repo",
  ])
    for (const fn of [
      "validateOfficialNameSource",
      "isBlockedOfficialName",
      "isOfficialMarketplace",
      "isMarketplaceAutoUpdateDefault",
    ]) {
      assert.deepEqual(
        policy[fn](
          name,
          fn === "isMarketplaceAutoUpdateDefault" ? undefined : source,
        ),
        captured.policy[fn](
          name,
          fn === "isMarketplaceAutoUpdateDefault" ? undefined : source,
        ),
      );
      comparisons++;
    }
for (const [name, start, end] of MARKETPLACE_CLASSES) {
  const original = (
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
for (const [name, start, end] of MARKETPLACE_HELPERS) {
  assert.deepEqual(
    ast(
      ports.find(
        (n) => n.type === "FunctionDeclaration" && n.id?.name === name,
      ),
    ),
    ast(parse(source.slice(start, end), { ecmaVersion: "latest" }).body[0]),
    name,
  );
  completeAsts++;
}
const root = await mkdtemp(join(tmpdir(), "marketplace-diff-"));
try {
  async function scenarios(which: string, factories: any) {
    const home = join(root, which),
      delays: number[] = [];
    const f = marketplaceFixture(home, factories, {
      Date: class extends Date {
        static override now() {
          return 1700000000000;
        }
      },
      setTimeout: (fn: any, ms: number) => {
        delays.push(ms);
        queueMicrotask(fn);
      },
    });
    const out: any[] = [];
    for (const type of [
      "github",
      "git",
      "url",
      "zip",
      "directory",
      "unknown",
    ]) {
      for (const config of [
        { source: type, repo: "owner/repo", url: "/fixture" },
        {
          source: {
            source: type,
            repo: "owner/repo",
            url: "/fixture",
            path: "/ignored",
          },
        },
        { source: { source: type, path: "/ignored" } },
        { source: type },
      ]) {
        const m = new Map();
        f.config.mergeMarketplaceConfig(m, { owned: config });
        out.push([...m]);
      }
      out.push(
        f.builtIn.toMarketplaceSource({
          source: type,
          repo: "owner/repo",
          url: "https://invalid.test/owned",
        }),
      );
    }
    for (const allowed of [
      [],
      ["user"],
      ["project", "project-local"],
      ["user", "project", "project-local", "cli"],
    ]) {
      f.config.cliSettingSourcesProvider.isScopeAllowed = async (
        scope: string,
      ) => allowed.includes(scope);
      for (const scope of ["user", "project", "project-local", "cli"])
        f.scopes.set(scope, {
          same: { source: "git", url: scope },
          [scope]: { source: "github", repo: scope },
        });
      out.push([...(await f.config.getConfiguredMarketplaces())]);
      out.push(await f.config.getMarketplacesToInstall());
    }
    for (const name of [
      "safe",
      "a+b",
      "../escape",
      "a/b",
      "",
      "_bad",
      "A-1.2",
    ]) {
      try {
        f.installer.validatePluginName(name);
        out.push("ok:" + name);
      } catch (e: any) {
        out.push(e.message);
      }
      out.push(
        f.storage.sanitizeLockName(name.repeat(90)),
        f.nativeLock.sanitizePath(name.repeat(90)),
      );
    }
    for (const value of [
      "./plugins/a",
      { source: "local", path: "nested" },
      { source: "git", url: "x" },
    ])
      out.push(f.installer.support(value), f.installer.normalizeSource(value));
    for (const relative of [
      ".",
      "./nested",
      "../escape",
      "/outside",
      "nested/../safe",
    ]) {
      try {
        out.push(f.installer.resolveContainedPath(home, relative));
      } catch (e: any) {
        out.push(e.message);
      }
    }
    await f.storage.saveMarketplace({
      name: "alias",
      storageName: "stable",
      source: { source: "directory", path: "/fixture" },
      installLocation: "/fixture",
      autoUpdate: false,
    });
    out.push(
      await f.storage.getMarketplaces(),
      await f.storage.isMarketplaceInstalled("stable"),
      await f.storage.isMarketplaceInstalled("alias"),
    );
    await Promise.all([
      f.storage.saveMarketplace({ name: "a", source: {} }),
      f.storage.saveMarketplace({ name: "b", source: {} }),
    ]);
    await f.storage.removeMarketplace("a");
    out.push(await f.storage.getMarketplaces());
    for (const invalid of ["[]", "null", "{broken"]) {
      await f.fsExtra.writeFile(f.storage.configFilePath, invalid);
      out.push(await f.storage.readAndRepair());
      out.push(
        await f.fsExtra.readFile(
          f.storage.configFilePath + ".broken-1700000000000",
          "utf8",
        ),
      );
    }
    f.storage.rawRename = async () => {
      throw Object.assign(Error("busy"), { code: "EBUSY" });
    };
    try {
      await f.storage.renameTempFile("a", "b");
    } catch (e: any) {
      out.push(e.message);
    }
    out.push(delays);
    f.storage.fileLockService = {
      acquireFileLock: async () => {
        throw Error("owned unavailable");
      },
    };
    out.push(await f.storage.withLocks(async () => "fallback"));
    const coordinator = Object.assign(new f.classes.GitFallbackCoordinator(), {
      logger: f.runtime.services.logger,
      detector: { isAvailable: async () => false },
      converter: {
        convert: (s: string) =>
          s.includes("github") ? "https://invalid.test/owned.zip" : undefined,
      },
    });
    for (const value of [
      { source: "directory", path: "local" },
      { source: "git", url: "https://github.com/owned/fixture" },
      { source: "github", repo: "unsupported" },
      { source: "git" },
    ])
      out.push(await coordinator.maybeFallback(value, "owned"));
    for (const scenario of [
      "fresh",
      "expired",
      "dead",
      "denied",
      "missing",
      "broken",
    ]) {
      const lockDir = join(home, "tmp", scenario + ".lock");
      if (scenario !== "missing") {
        await f.fsExtra.ensureDir(lockDir);
        await f.fsExtra.writeFile(
          join(lockDir, "lock.json"),
          scenario === "broken"
            ? "[broken"
            : JSON.stringify({
                pid: 42,
                timestamp: scenario === "expired" ? 0 : 1700000000000,
              }),
        );
      }
      const locks = factories.locks({
        fs: f.fsExtra,
        Date: class extends Date {
          static override now() {
            return 1700000000000;
          }
        },
        process: {
          pid: 42,
          kill() {
            if (scenario === "dead" || scenario === "denied")
              throw Object.assign(Error("probe"), {
                code: scenario === "dead" ? "ESRCH" : "EPERM",
              });
          },
        },
      });
      out.push(
        await new locks.FileLockServiceImpl().isLockStale(lockDir, 1000),
      );
    }
    return JSON.parse(JSON.stringify(out).replaceAll(home, "<OWNED>"));
  }
  const original = await scenarios("captured", captured),
    restored = await scenarios("restored", {
      marketplace: createNativeMarketplace,
      locks: createNativeFileLock,
    });
  assert.equal(restored.length, original.length);
  for (let i = 0; i < original.length; i++) {
    assert.deepEqual(restored[i], original[i], "scenario " + i);
    comparisons++;
  }
  comparisons += await remoteMarketplaceDifferential(root, captured);
} finally {
  await rm(root, { recursive: true, force: true });
}
console.log(
  JSON.stringify({
    completeAsts,
    comparisons,
    completeClasses: MARKETPLACE_CLASSES.length,
    constantFactories: 1,
    constantInitializers: constantRows.length,
    scope:
      "complete local/Git/HTTP/ZIP marketplace classes, file locks and ZIP helpers in owned DI; not full product bootstrap or other plugin installers",
  }),
);

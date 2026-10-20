import assert from "node:assert/strict";
import { readFile, mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { parse } from "acorn";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { nodesOf } from "./helpers/captured-product-sources.js";
import {
  INSTALLER_CLASSES,
  emittedInstaller,
  loadCapturedInstallers,
} from "./helpers/captured-plugin-installers.js";
import { pluginInstallerFixture } from "./helpers/plugin-installer-fixtures.js";
import { createNativePluginInstallers } from "../src/plugins/native-plugin-installers.js";
import { createNativePluginStorage } from "../src/plugins/native-plugin-storage.js";
const source = await readFile(getCapturedBundlePath(), "utf8"),
  captured = loadCapturedInstallers(source);
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
const ports = ["native-plugin-installers", "native-plugin-storage"].flatMap(
  (file) =>
    nodesOf(
      parse(emittedInstaller(file), {
        ecmaVersion: "latest",
        sourceType: "module",
      }),
    ),
);
let completeAsts = 0;
for (const [name, start, end] of INSTALLER_CLASSES) {
  const raw: any = (
    parse("(" + source.slice(start, end) + ")", { ecmaVersion: "latest" })
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
const originals = nodesOf(parse(source, { ecmaVersion: "latest" }));
for (const name of ["rJ", "rq", "rW", "rZ", "r1"]) {
  const raw = originals.find(
      (n) =>
        n.type === "VariableDeclarator" &&
        n.id?.name === name &&
        n.start > 9783000 &&
        n.end < 9796644,
    ),
    port = ports.find(
      (n) => n.type === "VariableDeclarator" && n.id?.name === name,
    );
  assert.ok(raw);
  assert.deepEqual(ast(port.init), ast(raw.init), name);
}
const root = await mkdtemp(join(tmpdir(), "plugin-installers-diff-"));
let comparisons = 0;
try {
  async function scenarios(home: string, factories: any) {
    const calls: any[] = [],
      progress: string[] = [],
      out: any[] = [],
      f = pluginInstallerFixture(home, factories, {
        Date: class extends Date {
          constructor() {
            super(1700000000000);
          }
        },
        exec: async (...args: any[]) => {
          calls.push(args);
          if (
            args[0] === "git" &&
            args[1][0] === "checkout" &&
            args[2]?.cwd?.includes("sparse-root")
          ) {
            await mkdir(join(args[2].cwd, "nested", "plugin"), {
              recursive: true,
            });
            await mkdir(join(args[2].cwd, ".git"), { recursive: true });
          }
          if (args[0] === "npm") {
            const spec: string = args[1][1],
              packageName = spec.startsWith("@")
                ? spec.slice(0, spec.indexOf("@", 1))
                : spec.slice(0, spec.lastIndexOf("@"));
            await mkdir(join(args[2].cwd, "node_modules", packageName), {
              recursive: true,
            });
          }
          return { stdout: "a".repeat(40) + "\n" };
        },
      });
    await mkdir(home, { recursive: true });
    for (const value of [
      "local",
      { source: "url" },
      { source: "github" },
      { source: "npm" },
      { source: "git-subdir" },
      { source: "local" },
      {},
    ])
      for (const installer of [f.git, f.npm, f.subdir])
        out.push(installer.support(value));
    for (const name of [
      "owned",
      "A-1.2",
      "_invalid",
      "../bad",
      "a/b",
      "",
      "owned+suffix",
    ])
      for (const installer of [f.git, f.subdir])
        try {
          installer.validatePluginName(name);
          out.push("ok");
        } catch (e: any) {
          out.push(e.message);
        }
    for (const sha of [
      undefined,
      "",
      "a".repeat(40),
      "F".repeat(40),
      "a".repeat(39),
      "-bad",
    ])
      for (const installer of [f.git, f.subdir])
        try {
          installer.validateGitSha(sha);
          out.push("ok");
        } catch (e: any) {
          out.push(e.message);
        }
    for (const path of [
      "./plugin/",
      "nested/plugin",
      "nested\\plugin",
      ".",
      "../escape",
      "nested/../escape",
      "/absolute",
      "C:\\absolute",
      "",
      "././safe",
    ])
      try {
        out.push(f.subdir.getValidatedSubdir({ path }));
      } catch (e: any) {
        out.push(e.message);
      }
    for (const value of [
      { url: "url", repo: "owner/repo" },
      { repo: "owner/repo" },
      {},
    ])
      try {
        out.push(f.git.resolveGitUrl(value));
      } catch (e: any) {
        out.push(e.message);
      }
    const gitRoot = join(home, "git-root");
    for (const spec of [
      { source: "url", url: "owned" },
      { source: "github", repo: "owner/repo", ref: "main" },
      { source: "url", url: "owned", sha: "a".repeat(40), ref: "ignored" },
    ]) {
      out.push(
        await f.git.install(
          { name: "owned", source: spec },
          gitRoot,
          (s: string) => progress.push(s),
        ),
      );
      out.push(calls.splice(0), progress.splice(0));
    }
    const installed = join(home, "git-root", "plugins", "owned");
    await mkdir(join(installed, ".git"), { recursive: true });
    for (const spec of [
      { source: "url", url: "owned" },
      { source: "url", url: "owned", ref: "main" },
      { source: "url", url: "owned", sha: "a".repeat(40) },
    ]) {
      out.push(await f.git.update({ name: "owned", source: spec }, installed));
      out.push(calls.splice(0));
    }
    for (const [i, pin] of [
      {},
      { ref: "main" },
      { sha: "a".repeat(40), ref: "ignored" },
    ].entries()) {
      const info = {
        name: "sparse-" + i,
        source: {
          source: "git-subdir",
          url: "owner/repo",
          path: "nested/plugin",
          ...pin,
        },
      };
      const result = await f.subdir.install(info, join(home, "sparse-root"));
      out.push(result, calls.splice(0));
      out.push(await f.subdir.update(info, result), calls.splice(0));
    }
    for (const packageName of [
      "owned",
      "@scope/owned",
      "bad name",
      "-flag",
      "../escape",
    ]) {
      try {
        out.push(
          await f.npm.install(
            {
              name: "fixture",
              source: {
                source: "npm",
                package: packageName,
                versionConstraint: "1.0.0",
                registry: "http://127.0.0.1/owned",
              },
            },
            join(home, "npm-root"),
          ),
        );
      } catch (e: any) {
        out.push(e.message);
      }
      out.push(calls.splice(0));
    }
    for (const field of ["one", "two"]) {
      const id = "owned@fixture";
      await f.options.saveOptions(
        id,
        { plain: field, secret: field, count: 2 },
        { secret: { sensitive: true } },
      );
      out.push(await f.options.loadOptions(id));
      await f.options.saveOptions(
        id,
        { plain: field, secret: field },
        { plain: { sensitive: true } },
      );
      out.push(await f.options.loadOptions(id));
      f.options.clearCache();
      out.push(await f.options.hasOptions(id));
      await f.options.deleteOptions(id);
      out.push(await f.options.loadOptions(id));
    }
    await f.options.saveOptions("owned@fixture", { value: "replacement" }, {});
    await f.options.saveOptions(
      "partial",
      { token: "old", plain: "old" },
      { token: { sensitive: true } },
    );
    await f.options.loadOptions("partial");
    f.options.settingsManager = {
      get: f.settings.get,
      set: async () => {
        throw Error("owned settings failure");
      },
    };
    try {
      await f.options.saveOptions(
        "partial",
        { token: "new", plain: "new" },
        { token: { sensitive: true } },
      );
    } catch (error: any) {
      out.push(error.message);
    }
    out.push(
      (await f.options.loadSensitiveOptions("partial")).token,
      (await f.options.loadOptions("partial")).token,
    );
    f.options.settingsManager = f.settings;
    for (const text of [
      "none",
      "${PLUGIN_OPT:value}",
      "${PLUGIN_OPT:missing}",
      "${PLUGIN_OPT:hy-phen}",
    ])
      out.push(await f.options.substituteOptions(text, "owned@fixture"));
    await writeFile(f.options.getCredentialsPath(), "malformed");
    out.push(await f.options.loadSensitiveOptions("owned@fixture"));
    await f.options.saveSensitiveOptions("owned@fixture", { owned: "value" });
    out.push(await f.options.loadSensitiveOptions("owned@fixture"));
    let events = 0;
    f.errorCollector.onDidChange(() => events++);
    for (let i = 0; i < 102; i++)
      f.errorCollector.addError({
        type: i % 2 ? "odd" : "even",
        plugin: i === 101 ? "owned" : "other",
        source: "fixture",
        timestamp: new Date(1700000000000 + i),
      });
    out.push(
      f.errorCollector.getErrorCount(),
      f.errorCollector.getErrorsByType("odd").length,
      f.errorCollector.getErrorsByPlugin("owned", "fixture").length,
    );
    f.errorCollector.clearPluginErrors("owned", "fixture");
    out.push(f.errorCollector.getErrorCount());
    f.errorCollector.clearErrors();
    out.push(f.errorCollector.getErrorCount(), events);
    return JSON.parse(JSON.stringify(out).replaceAll(home, "<OWNED>"));
  }
  const a = await scenarios(join(root, "captured"), captured),
    b = await scenarios(join(root, "restored"), {
      installers: createNativePluginInstallers,
      storage: createNativePluginStorage,
    });
  assert.equal(a.length, b.length);
  for (let i = 0; i < a.length; i++) {
    assert.deepEqual(b[i], a[i], "scenario " + i);
    comparisons++;
  }
} finally {
  await rm(root, { recursive: true, force: true });
}
console.log(
  JSON.stringify({
    completeAsts,
    completeClasses: INSTALLER_CLASSES.length,
    constantInitializers: 5,
    comparisons,
    scope:
      "complete Git/npm/subdir installers, options storage and error collector under common owned DI; not full SettingsManager or npm registry authentication",
  }),
);

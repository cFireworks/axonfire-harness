import assert from "node:assert/strict";
import test from "node:test";
import * as fs from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createServer } from "node:http";
import { pluginInstallerFixture } from "../scripts/helpers/plugin-installer-fixtures.js";
import { createOwnedMarketplaceIO } from "../src/plugins/owned-marketplace-io.js";
import { createOwnedPluginFilesystem } from "../src/plugins/owned-plugin-filesystem.js";
import { createOwnedPluginOptionSettings } from "../src/plugins/owned-plugin-option-settings.js";
import { ownedPluginRepository } from "./helpers/owned-plugin-repository.js";
import { ownedNpmPackage } from "./helpers/owned-npm-package.js";
import { zipFixture } from "./helpers/marketplace-archive.js";
import { createHarness } from "../src/runtime/create-harness.js";
import { Usage, setTraceProcessors, type Model } from "@openai/agents-core";
setTraceProcessors([]);
test("native npm regex retains leading-dash acceptance without pretending it is an argv safety boundary", async (t) => {
  const calls: any[] = [],
    f = await fixture(t, {
      exec: async (...args: any[]) => {
        calls.push(args);
        return {};
      },
    });
  await assert.rejects(
    f.npm.install(
      { name: "owned", source: { source: "npm", package: "--owned" } },
      join(f.root, "market"),
    ),
    /Package directory not found/,
  );
  assert.equal(calls[0][1][1], "--owned@latest");
});
test("native missing sparse subdir after checkout leaves the created repository", async (t) => {
  const f = await fixture(t, { exec: async () => ({}) });
  await assert.rejects(
    f.subdir.install(
      {
        name: "owned",
        source: { source: "git-subdir", url: "owned", path: "missing" },
      },
      join(f.root, "market"),
    ),
    /Subdir not found after checkout/,
  );
  assert.equal(
    await f.fsExtra.pathExists(join(f.root, "market", "plugins", "owned")),
    true,
  );
});
test("native subdir update pull failure removes only owned clone and reinstalls at original calculated root", async (t) => {
  const f = await fixture(t, {
      exec: async () => {
        throw Error("owned pull failure");
      },
    }),
    repo = join(f.root, "market", "plugins", "owned"),
    sub = join(repo, "nested", "plugin");
  await fs.mkdir(join(repo, ".git"), { recursive: true });
  await fs.mkdir(sub, { recursive: true });
  let reinstallRoot = "";
  f.subdir.install = async (_: any, root: string) => {
    reinstallRoot = root;
    return "reinstalled";
  };
  assert.equal(
    await f.subdir.update(
      {
        name: "owned",
        source: { source: "git-subdir", url: "owned", path: "nested/plugin" },
      },
      sub,
    ),
    "reinstalled",
  );
  assert.equal(reinstallRoot, join(f.root, "market"));
  assert.equal(await f.fsExtra.pathExists(repo), false);
});
test("native option partial failure leaves newly saved secret and previous cached options", async (t) => {
  const f = await fixture(t);
  await f.options.saveOptions(
    "owned",
    { token: "old", plain: "old" },
    { token: { sensitive: true } },
  );
  await f.options.loadOptions("owned");
  f.options.settingsManager = {
    get: f.settings.get,
    set: async () => {
      throw Error("owned settings failure");
    },
  };
  await assert.rejects(
    f.options.saveOptions(
      "owned",
      { token: "new", plain: "new" },
      { token: { sensitive: true } },
    ),
    /owned settings failure/,
  );
  assert.equal((await f.options.loadSensitiveOptions("owned")).token, "new");
  assert.equal((await f.options.loadOptions("owned")).token, "old");
  f.options.clearCache();
  assert.equal((await f.options.loadOptions("owned")).token, "new");
});
for (const kind of ["git", "git-subdir", "npm"])
  test(
    `real SDK ${kind} plugin installs into version cache and restores Agent/command on restart`,
    { timeout: 30000 },
    async (t) => {
      const f = await fixture(t),
        repo = await ownedPluginRepository(f.root),
        tarball = join(f.root, "owned.tgz");
      await fs.writeFile(tarball, ownedNpmPackage());
      const name = kind === "npm" ? "npm-plugin" : "owned-plugin",
        requests: any[] = [],
        stateDir = join(f.root, "state");
      let archive = Buffer.alloc(0);
      const server = createServer((req, res) => {
        if (req.url === "/market.zip") {
          res.end(archive);
          return;
        }
        res.setHeader("Content-Type", "application/json");
        res.end("{}");
      });
      await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
      t.after(
        () =>
          new Promise<void>((r) => {
            server.closeAllConnections();
            server.close(() => r());
          }),
      );
      const url = "http://127.0.0.1:" + (server.address() as any).port;
      const source =
        kind === "git"
          ? { source: "url", url: repo.url, sha: repo.initial }
          : kind === "git-subdir"
            ? {
                source: "git-subdir",
                url: repo.url,
                path: "nested/plugin",
                sha: repo.initial,
              }
            : {
                source: "npm",
                package: "owned-fixture",
                versionConstraint: "file:" + tarball,
                registry: url,
              };
      archive = zipFixture({
        "repo/.codebuddy-plugin/marketplace.json": JSON.stringify({
          name: "installer-market",
          plugins: [{ name, version: "1.0.0", source }],
        }),
        "repo/README.md": "owned fixture",
      });
      const settings = {
        async get(key: string, scope: string) {
          if (scope !== "user") return;
          if (key === "extraKnownMarketplaces")
            return {
              "installer-market": { source: "url", url: url + "/market.zip" },
            };
          if (key === "enabledPlugins")
            return { [name + "@installer-market"]: true };
        },
        clearCache() {},
      };
      for (let i = 0; i < 2; i++) {
        const h = await createHarness({
          workDir: f.root,
          stateDir,
          recordReplayEnv: {},
          productRuntime: { watch: false },
          modelProvider: { getModel: () => fakeModel(requests) },
          nativePlugins: { settings },
        });
        try {
          assert.ok(
            await h.agents.get(
              kind === "npm" ? "npm-expert" : "installed-expert",
            ),
          );
          assert.ok(await h.commandManager.get("/" + name + ":echo"));
          const plugin = await h.pluginManager.getPlugin(
            name,
            "installer-market",
          );
          assert.match(plugin.installedPath, /cache/);
          if (kind !== "npm") assert.equal(plugin.gitCommitSha, repo.initial);
          const s = await h.openSession();
          await h.prompt(s, "/" + name + ":echo argument" + i);
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
async function fixture(t: any, overrides: any = {}) {
  const root = await fs.mkdtemp(join(tmpdir(), "plugin-installers-")),
    io = createOwnedMarketplaceIO(root, createOwnedPluginFilesystem(root));
  t.after(async () => {
    await io.close();
    await fs.rm(root, { recursive: true, force: true });
  });
  return {
    ...pluginInstallerFixture(root, undefined, { ...io, ...overrides }),
    io,
  };
}
async function registry(t: any) {
  const calls: string[] = [],
    server = createServer((req, res) => {
      calls.push(req.method + " " + req.url);
      res.setHeader("Content-Type", "application/json");
      res.end("{}");
    });
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  t.after(
    () =>
      new Promise<void>((r) => {
        server.closeAllConnections();
        server.close(() => r());
      }),
  );
  return { url: "http://127.0.0.1:" + (server.address() as any).port, calls };
}
function fakeModel(requests: any[]): Model {
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
              content: [{ type: "output_text", text: "installed" }],
            },
          ],
        },
      } as any;
    },
  };
}
test("native installer source dispatch preserves null/string and type distinctions", async (t) => {
  const f = await fixture(t);
  assert.equal(f.git.support(null), false);
  assert.equal(f.git.support("local"), false);
  assert.equal(f.npm.support("local"), false);
  assert.equal(f.subdir.support("local"), false);
  assert.throws(() => f.npm.support(null));
  assert.equal(f.git.support({ source: "url" }), true);
  assert.equal(f.subdir.support({ source: "git-subdir" }), true);
});
test("native Git installer clone preserves ref, SHA checkout and immutable verification", async (t) => {
  const calls: any[] = [],
    sha = "a".repeat(40),
    f = await fixture(t, {
      exec: async (...args: any[]) => {
        calls.push(args);
        return { stdout: sha + "\n" };
      },
    });
  const root = join(f.root, "market");
  await f.git.install(
    {
      name: "owned",
      source: { source: "github", repo: "owner/repo", sha, ref: "ignored" },
    },
    root,
  );
  assert.deepEqual(
    calls.map((c) => c[1]),
    [
      [
        "clone",
        "--depth",
        "1",
        "--no-checkout",
        "https://github.com/owner/repo.git",
        join(root, "plugins", "owned"),
      ],
      ["fetch", "origin", sha, "--depth", "1"],
      ["checkout", "--detach", "FETCH_HEAD"],
      ["rev-parse", "HEAD"],
    ],
  );
});
test("native Git mismatched SHA removes partial clone and records native error", async (t) => {
  const f = await fixture(t, {
    exec: async (_: string, args: string[]) => {
      if (args[0] === "clone")
        await fs.mkdir(join(f.root, "market", "plugins", "owned"), {
          recursive: true,
        });
      return { stdout: "b".repeat(40) };
    },
  });
  await assert.rejects(
    f.git.install(
      {
        name: "owned",
        source: { source: "url", url: "owned", sha: "a".repeat(40) },
      },
      join(f.root, "market"),
    ),
    /does not match/,
  );
  assert.equal(
    await f.fsExtra.pathExists(join(f.root, "market", "plugins", "owned")),
    false,
  );
  assert.equal(f.errorCollector.getErrors()[0].type, "install-failed");
});
test("native Git update retains SHA/ref no-clean branches and default branch clean", async (t) => {
  const calls: any[] = [],
    sha = "a".repeat(40),
    f = await fixture(t, {
      exec: async (...args: any[]) => {
        calls.push(args);
        return { stdout: args[1][1] === "HEAD" ? sha : "owned\n" };
      },
    }),
    dest = join(f.root, "installed");
  await fs.mkdir(join(dest, ".git"), { recursive: true });
  for (const source of [
    { source: "url", sha },
    { source: "url", ref: "branch" },
    { source: "url" },
  ]) {
    calls.length = 0;
    await f.git.update({ name: "owned", source }, dest);
    assert.equal(
      calls.some((c) => c[1][0] === "clean"),
      !("sha" in source) && !("ref" in source),
    );
  }
});
test("native Git update failure preserves clone and reports target ref", async (t) => {
  const f = await fixture(t, {
      exec: async () => {
        throw Error("owned failure");
      },
    }),
    dest = join(f.root, "installed");
  await fs.mkdir(join(dest, ".git"), { recursive: true });
  await assert.rejects(
    f.git.update(
      { name: "owned", source: { source: "url", ref: "pinned" } },
      dest,
    ),
    /to pinned: owned failure/,
  );
  assert.equal(await f.fsExtra.pathExists(dest), true);
  assert.equal(f.errorCollector.getErrorCount(), 1);
});
test("native subdir validation preserves lexical normalization and invalid path rules", async (t) => {
  const f = await fixture(t);
  for (const path of ["../escape", "a/../b", "/absolute", "C:\\absolute", ""])
    assert.throws(
      () => f.subdir.getValidatedSubdir({ path }),
      /Invalid git-subdir/,
    );
  assert.equal(
    f.subdir.getValidatedSubdir({ path: "./nested\\plugin/" }),
    "nested/plugin",
  );
  assert.equal(f.subdir.getValidatedSubdir({ path: "." }), ".");
});
test("native sparse clone keeps filter, no-cone, ref/SHA priority and timeouts", async (t) => {
  const calls: any[] = [],
    sha = "a".repeat(40),
    f = await fixture(t, {
      exec: async (...args: any[]) => {
        calls.push(args);
        if (args[1][0] === "checkout")
          await fs.mkdir(
            join(f.root, "market", "plugins", "owned", "nested", "plugin"),
            { recursive: true },
          );
        return { stdout: sha };
      },
    });
  await f.subdir.install(
    {
      name: "owned",
      source: {
        source: "git-subdir",
        repo: "owner/repo",
        path: "nested/plugin",
        sha,
        ref: "ignored",
      },
    },
    join(f.root, "market"),
  );
  assert.deepEqual(
    calls.map((c) => c[1][0]),
    ["clone", "sparse-checkout", "fetch", "checkout", "rev-parse"],
  );
  assert.deepEqual(
    calls.map((c) => c[2].timeout),
    [120000, 30000, 60000, 60000, 30000],
  );
  assert.equal(calls[0][1].includes("--branch"), false);
});
test("native sparse clone failure cleans repository while missing subdir retains it", async (t) => {
  const f = await fixture(t, {
    exec: async () => {
      throw Error("owned clone failure");
    },
  });
  await assert.rejects(
    f.subdir.install(
      {
        name: "owned",
        source: { source: "git-subdir", url: "owned", path: "sub" },
      },
      join(f.root, "market"),
    ),
    /Failed to sparse checkout/,
  );
  assert.equal(
    await f.fsExtra.pathExists(join(f.root, "market", "plugins", "owned")),
    false,
  );
});
test("native npm installer preserves name validation, registry, spec priority and timeout", async (t) => {
  const calls: any[] = [],
    f = await fixture(t, {
      exec: async (...args: any[]) => {
        calls.push(args);
        await fs.mkdir(
          join(
            f.root,
            "market",
            "plugins",
            "owned",
            "node_modules",
            "@scope",
            "pkg",
          ),
          { recursive: true },
        );
        return {};
      },
    });
  const dest = await f.npm.install(
    {
      name: "owned",
      version: "2.0.0",
      source: {
        source: "npm",
        package: "@scope/pkg",
        versionConstraint: "^1",
        registry: "http://127.0.0.1/owned",
      },
    },
    join(f.root, "market"),
  );
  assert.match(dest, /@scope\/pkg$/);
  assert.deepEqual(calls[0][1], [
    "install",
    "@scope/pkg@^1",
    "--prefix",
    join(f.root, "market", "plugins", "owned"),
    "--no-save",
    "--registry",
    "http://127.0.0.1/owned",
  ]);
  assert.equal(calls[0][2].timeout, 120000);
  await assert.rejects(
    f.npm.install(
      { name: "owned", source: { source: "npm", package: "bad name" } },
      join(f.root, "market"),
    ),
    /Invalid npm/,
  );
});
test("native npm update retains original nested-prefix calculation including scoped packages", async (t) => {
  const f = await fixture(t);
  let received = "";
  f.npm.install = async (_: any, root: string) => {
    received = root;
    return root;
  };
  const installed = join(
    f.root,
    "market",
    "plugins",
    "owned",
    "node_modules",
    "@scope",
    "pkg",
  );
  await f.npm.update({ name: "owned" }, installed);
  assert.equal(received, join(installed, "..", ".."));
});
test("owned process adapter rejects npm prefix/cwd escapes and mutating git config", async (t) => {
  const f = await fixture(t);
  await assert.rejects(
    f.io.exec("npm", ["install", "owned"]),
    /requires an owned prefix/,
  );
  await assert.rejects(
    f.io.exec("npm", ["install", "owned", "--prefix", tmpdir()], {
      cwd: f.root,
    }),
    /outside owned state/,
  );
  await assert.rejects(
    f.io.exec("git", ["config", "credential.helper", "bad"], { cwd: f.root }),
    /read-only git config/,
  );
});
test(
  "real Git and sparse installers clone, pin and update owned file repositories",
  { timeout: 20000 },
  async (t) => {
    const f = await fixture(t),
      repo = await ownedPluginRepository(f.root),
      root = join(f.root, "market"),
      info = {
        name: "owned",
        source: { source: "url", url: repo.url, sha: repo.initial },
      };
    const installed = await f.git.install(info, root);
    assert.equal(await f.git.getInstalledVersion(installed), repo.initial);
    assert.equal(await f.git.getRemoteUrl(installed), repo.url);
    const sparseInfo = {
        name: "sparse",
        source: { source: "git-subdir", url: repo.url, path: "nested/plugin" },
      },
      sub = await f.subdir.install(sparseInfo, root);
    assert.equal(
      JSON.parse(
        await fs.readFile(
          join(sub, ".codebuddy-plugin", "plugin.json"),
          "utf8",
        ),
      ).version,
      "1.0.0",
    );
    await repo.update();
    await f.git.update(info, installed);
    assert.equal(await f.git.getInstalledVersion(installed), repo.initial);
    await f.subdir.update(sparseInfo, sub);
    assert.equal(
      JSON.parse(
        await fs.readFile(
          join(sub, ".codebuddy-plugin", "plugin.json"),
          "utf8",
        ),
      ).version,
      "2.0.0",
    );
  },
);
test(
  "real npm installer installs only an owned tarball through loopback registry and runs original lifecycle",
  { timeout: 30000 },
  async (t) => {
    const f = await fixture(t),
      local = await registry(t),
      file = join(f.root, "owned.tgz");
    await fs.writeFile(file, ownedNpmPackage());
    const info = {
        name: "npm-plugin",
        source: {
          source: "npm",
          package: "owned-fixture",
          versionConstraint: "file:" + file,
          registry: local.url,
        },
      },
      installed = await f.npm.install(info, join(f.root, "market"));
    assert.equal(
      await fs.readFile(join(installed, "lifecycle-ran"), "utf8"),
      "owned",
    );
    assert.equal(
      await f.npm.isInstalled(info, join(f.root, "market")),
      installed,
    );
    assert.equal(
      JSON.parse(await fs.readFile(join(installed, "package.json"), "utf8"))
        .name,
      "owned-fixture",
    );
  },
);
test("native options split sensitive strings, preserve non-sensitive types and overlay secrets", async (t) => {
  const f = await fixture(t);
  await f.options.saveOptions(
    "owned@market",
    { token: false, count: 2, object: { owned: true } },
    { token: { sensitive: true } },
  );
  assert.deepEqual(await f.options.loadOptions("owned@market"), {
    token: "false",
    count: 2,
    object: { owned: true },
  });
  assert.equal(
    f.settingsData.pluginConfigs["owned@market"].options.token,
    undefined,
  );
  const data = JSON.parse(
    await fs.readFile(f.options.getCredentialsPath(), "utf8"),
  );
  assert.equal(data.pluginSecrets["owned@market"].token, "false");
  if (process.platform !== "win32")
    assert.equal(
      (await fs.stat(f.options.getCredentialsPath())).mode & 0o777,
      0o600,
    );
});
test("native options sensitivity migration scrubs opposite stores and cache exposes original alias", async (t) => {
  const f = await fixture(t);
  await f.options.saveOptions(
    "owned",
    { key: "one" },
    { key: { sensitive: true } },
  );
  const first = await f.options.loadOptions("owned");
  first.alias = "mutable";
  assert.equal((await f.options.loadOptions("owned")).alias, "mutable");
  await f.options.saveOptions("owned", { key: 2 }, {});
  assert.deepEqual(await f.options.loadOptions("owned"), { key: 2 });
  assert.equal((await f.options.loadSensitiveOptions("owned")).key, undefined);
  await f.options.saveOptions(
    "owned",
    { key: "secret" },
    { key: { sensitive: true } },
  );
  assert.equal(f.settingsData.pluginConfigs.owned.options.key, undefined);
});
test("native options retain omitted values and stringify only exact sensitive true", async (t) => {
  const f = await fixture(t);
  await f.options.saveOptions(
    "owned",
    { a: 1, b: 2 },
    { a: { sensitive: "true" } },
  );
  await f.options.saveOptions("owned", { a: 3 }, {});
  assert.deepEqual(await f.options.loadOptions("owned"), { a: 3, b: 2 });
  assert.equal(
    await f.fsExtra.pathExists(f.options.getCredentialsPath()),
    false,
  );
});
test("native option substitution keeps unresolved and hyphenated keys while replacing word keys", async (t) => {
  const f = await fixture(t);
  await f.options.saveOptions("owned", { key: 42, "hy-phen": "value" }, {});
  assert.equal(
    await f.options.substituteOptions(
      "${PLUGIN_OPT:key} ${PLUGIN_OPT:missing} ${PLUGIN_OPT:hy-phen}",
      "owned",
    ),
    "42 ${PLUGIN_OPT:missing} ${PLUGIN_OPT:hy-phen}",
  );
});
test("native option malformed credentials read as empty and next secret save replaces malformed data", async (t) => {
  const f = await fixture(t);
  await fs.writeFile(f.options.getCredentialsPath(), "malformed");
  assert.deepEqual(await f.options.loadSensitiveOptions("owned"), {});
  await f.options.saveSensitiveOptions("owned", { token: "owned" });
  assert.deepEqual(await f.options.loadSensitiveOptions("owned"), {
    token: "owned",
  });
});
test("native option delete continues secret cleanup after settings deletion fails", async (t) => {
  const f = await fixture(t);
  await f.options.saveOptions(
    "owned",
    { token: "owned" },
    { token: { sensitive: true } },
  );
  f.options.settingsManager = {
    list: async () => {
      throw Error("owned settings failure");
    },
  };
  await f.options.deleteOptions("owned");
  assert.equal(await f.options.hasOptions("owned"), false);
  assert.match(JSON.stringify(f.events), /Failed to delete non-sensitive/);
});
test("native collector keeps cap100, descending timestamps and original plugin/source keys", async (t) => {
  const f = await fixture(t);
  let changed = 0;
  f.errorCollector.onDidChange(() => changed++);
  for (let i = 0; i < 102; i++)
    f.errorCollector.addError({
      plugin: i === 101 ? "owned" : "other",
      source: "market",
      type: "fixture",
      timestamp: new Date(i + 1),
    });
  assert.equal(f.errorCollector.getErrorCount(), 100);
  assert.equal(f.errorCollector.getErrors()[0].timestamp.getTime(), 102);
  f.errorCollector.addError({
    pluginName: "not-matched",
    marketplaceName: "market",
  });
  assert.deepEqual(
    f.errorCollector.getErrorsByPlugin("not-matched", "market"),
    [],
  );
  f.errorCollector.clearPluginErrors("missing", "market");
  assert.equal(changed, 103);
  f.errorCollector.clearPluginErrors("owned", "market");
  assert.equal(changed, 104);
  f.errorCollector.clearErrors();
  assert.equal(changed, 105);
});
test("owned option settings persists only USER pluginConfigs without claiming full settings", async (t) => {
  const f = await fixture(t),
    s = createOwnedPluginOptionSettings(f.root, f.fsExtra);
  await s.set("pluginConfigs", { owned: { options: { count: 2 } } }, "user");
  assert.deepEqual(await s.get("pluginConfigs", "user"), {
    owned: { options: { count: 2 } },
  });
  await assert.rejects(s.get("model", "user"), /only support/);
  assert.throws(() => s.set("pluginConfigs", {}, "project"), /only support/);
  await s.close();
});
test(
  "real SDK native options save, reload and restart reach loader config without model secret exposure",
  { timeout: 20000 },
  async (t) => {
    const f = await fixture(t),
      dir = join(f.root, "inline"),
      stateDir = join(f.root, "state"),
      requests: any[] = [];
    await fs.mkdir(join(dir, ".codebuddy-plugin"), { recursive: true });
    await fs.writeFile(
      join(dir, ".codebuddy-plugin", "plugin.json"),
      JSON.stringify({
        name: "options-plugin",
        userConfig: {
          token: { type: "string", sensitive: true },
          count: { type: "number" },
        },
        mcpServers: {
          owned: {
            command: "node",
            args: ["owned-fixture"],
            env: { TOKEN: "${PLUGIN_OPT:token}", COUNT: "${PLUGIN_OPT:count}" },
          },
        },
      }),
    );
    await fs.mkdir(join(dir, "commands"));
    await fs.writeFile(
      join(dir, "commands", "echo.md"),
      "---\ndescription: owned\n---\noptions command $ARGUMENTS",
    );
    for (let i = 0; i < 2; i++) {
      const h = await createHarness({
        workDir: f.root,
        stateDir,
        modelProvider: { getModel: () => fakeModel(requests) },
        recordReplayEnv: {},
        productRuntime: { watch: false },
        nativePlugins: { directories: [dir] },
      });
      try {
        if (i === 0) {
          await h.pluginManager.savePluginOptions("options-plugin", "inline", {
            token: "owned-secret",
            count: 2,
          });
          await h.pluginRuntimeRefresh!.refresh("reload-command");
        }
        assert.deepEqual(
          await h.pluginManager.getPluginOptions("options-plugin", "inline"),
          { token: "owned-secret", count: 2 },
        );
        const active = await h.pluginManager.getActivePlugins();
        assert.equal(
          active[0].components.mcpServers.owned.env.TOKEN,
          "owned-secret",
        );
        const s = await h.openSession();
        await h.prompt(s, "/options-plugin:echo argument");
        assert.doesNotMatch(
          JSON.stringify(requests.at(-1).input),
          /owned-secret/,
        );
      } finally {
        await h.close();
      }
    }
    assert.equal(
      (
        await fs.readFile(
          join(stateDir, "settings.json"),
          "utf8",
        )
      ).includes("owned-secret"),
      false,
    );
  },
);

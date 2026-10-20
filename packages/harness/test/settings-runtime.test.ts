import assert from "node:assert/strict";
import test from "node:test";
import * as fs from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { settingsFixture } from "../scripts/helpers/settings-fixtures.js";
import { createNativeSettingsHost } from "../src/config/native-settings-host.js";
import { createOwnedSettingsFilesystem } from "../src/config/owned-settings-filesystem.js";
import { createHarness } from "../src/runtime/create-harness.js";
import { Usage, setTraceProcessors, type Model } from "@openai/agents-core";
setTraceProcessors([]);
async function fixture(t: any, overrides: any = {}) {
  const root = await fs.mkdtemp(join(tmpdir(), "native-settings-"));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const f = settingsFixture(root, {}, overrides);
  t.after(() => f.dispose());
  return f;
}
test("native settings merge subkeys and array unions in scope order with CLI last", async (t) => {
  const f = await fixture(t);
  await f.put(
    "user",
    '{/*kept*/"model":"user","permissions":{"allow":["Read"],"deny":["Bash"]},"memory":{"a":true},"items":[1,2],"ordinary":{"a":1}}',
  );
  await f.put(
    "project",
    '{"model":"project","permissions":{"allow":["Write","Read"]},"items":[2,3],"ordinary":{"b":2}}',
  );
  await f.put("project-local", '{"model":"local","memory":{"b":true}}');
  // Actual scope tokens are captured constants, not product-facing source aliases.
  assert.equal(f.constants.SettingsScope.PROJECT_LOCAL, "project-local");
  await f.cli.set("model", "cli");
  const s = await f.manager.list();
  assert.equal(s.model, "cli");
  assert.deepEqual(s.permissions, { allow: ["Read", "Write"], deny: ["Bash"] });
  assert.deepEqual(s.memory, { a: true, b: true });
  assert.deepEqual(s.items, [1, 2, 3]);
  assert.deepEqual(s.ordinary, { b: 2 });
  assert.equal(s.alwaysThinkingEnabled, true);
});
test("native source parsing preserves dedup, order, none, mixed invalid and fallback distinctions", async (t) => {
  const f = await fixture(t),
    s = f.constants.SettingsScope;
  assert.deepEqual(f.sources.parseSourcesString("LOCAL,user,local PROJECT"), [
    s.PROJECT_LOCAL,
    s.USER,
    s.PROJECT,
  ]);
  for (const input of ["none", "  ", ",,"])
    assert.deepEqual(f.sources.parseSourcesString(input), []);
  assert.deepEqual(f.sources.parseSourcesString("none,user"), [s.USER]);
  assert.equal(f.sources.parseSourcesString("bad"), undefined);
  f.setOptions({ settingSources: "bad" });
  assert.deepEqual(f.sources.buildSettingScopes(), f.sources.DEFAULT_SCOPES);
  f.sources.settingScopes = [];
  assert.equal(await f.sources.isScopeAllowed(s.CLI), true);
  const copy = await f.sources.getSettingScopes();
  copy.push(s.USER);
  assert.deepEqual(await f.sources.getSettingScopes(), []);
});
test("native CLI JSONC/file parsing and model effort override retain source validation", async (t) => {
  const f = await fixture(t);
  await fs.writeFile(
    join(f.root, "cli.jsonc"),
    '{/*yes*/"model":"json","reasoningEffort":"low",}',
  );
  f.setOptions({ settings: "cli.jsonc", model: "flag", effort: "max" });
  assert.deepEqual(await f.cli.buildCliSettings(), {
    model: "flag",
    reasoningEffort: "max",
  });
  f.setOptions({ settings: '{"reasoningEffort":"low"}', effort: "INVALID" });
  assert.equal((await f.cli.buildCliSettings()).reasoningEffort, "low");
  assert.equal(f.cli.looksLikeJson("[]"), false);
  assert.equal(f.cli.parseJsonString("[]"), undefined);
  assert.equal(f.cli.parseJsonString("{broken}"), undefined);
  await fs.writeFile(join(f.root, "array.json"), "[]");
  assert.equal(await f.cli.readSettingsFile("array.json"), undefined);
  await f.cli.set("x", { a: 1 });
  const copy = await f.cli.getSettings();
  copy.x.a = 2;
  assert.equal((await f.cli.getSettings()).x.a, 1);
});
test("native settings JSONC comments survive default-diff writes and emit exact ConfigChange data", async (t) => {
  const f = await fixture(t);
  let events = 0;
  f.manager.onDidChange(() => events++);
  await f.put(
    "user",
    '{\n// owned comment\n"model":"old",\n"autoCompactEnabled":true,\n}',
  );
  await f.manager.set("model", "new");
  const text = await f.read("user");
  assert.match(text, /owned comment/);
  assert.doesNotMatch(text, /autoCompactEnabled/);
  assert.equal(events, 1);
  assert.equal(f.hooks.length, 1);
  assert.deepEqual(f.hooks[0][1], {
    transcript_path: "",
    cwd: f.root,
    hook_event_name: "ConfigChange",
    source: "user_settings",
    file_path: join(f.root, "state", "settings.json"),
  });
  assert.deepEqual(f.locks[0][1], {
    maxRetries: 5,
    retryDelay: 500,
    staleTimeout: 300000,
  });
  assert.equal(await f.manager.get("model", "user"), "new");
});
test("native defaults differ recursively but user disk sandbox overrides are shallow on read", async (t) => {
  const f = await fixture(t);
  await f.put("user", '{"sandbox":{"enabled":true}}');
  assert.deepEqual(await f.manager.get("sandbox", "user"), { enabled: true });
  assert.equal(
    f.classes.deepDiffDefaults(
      { a: 1, n: { b: 2, c: 3 } },
      { a: 1, n: { b: 2 } },
    ).n.c,
    3,
  );
  assert.equal(f.classes.deepDiffDefaults([1], [1]), undefined);
});
test("native 60-second cache, missing-file no-cache and clearCache semantics remain intact", async (t) => {
  const f = await fixture(t);
  await f.manager.list("user");
  assert.equal(f.manager.cache.user, undefined);
  await f.put("user", '{"x":1}');
  assert.equal(await f.manager.get("x", "user"), 1);
  await f.put("user", '{"x":2}');
  assert.equal(await f.manager.get("x", "user"), 1);
  f.advance(60000);
  assert.equal(await f.manager.get("x", "user"), 2);
  await f.put("user", '{"x":3}');
  f.manager.clearCache("user");
  assert.equal(await f.manager.get("x", "user"), 3);
});
test("native corrupted scope stays unwritable until repaired file is reread; never auto-repairs bytes", async (t) => {
  const f = await fixture(t);
  await f.put("project", "{broken");
  await f.manager.list("project");
  assert.equal(f.manager.corruptedScopes.has("project"), true);
  assert.deepEqual(await f.manager.update("x", () => 1, "project"), {
    applied: false,
    changed: false,
  });
  assert.equal(await f.read("project"), "{broken");
  await f.put("project", '{"x":2}');
  f.manager.clearCache();
  assert.deepEqual(await f.manager.update("x", () => 3, "project"), {
    applied: false,
    changed: false,
  });
  assert.equal(await f.manager.get("x", "project"), 2);
  assert.deepEqual(await f.manager.update("x", () => 3, "project"), {
    applied: true,
    changed: true,
  });
});
test("native valid nonobject disk content is not cached or marked corrupt; array is accepted", async (t) => {
  const f = await fixture(t);
  await f.put("project", "null");
  assert.deepEqual(await f.manager.list("project"), {});
  assert.equal(f.manager.corruptedScopes.has("project"), false);
  assert.equal(f.manager.cache.project, undefined);
  await f.put("project", "[1,2]");
  assert.deepEqual(await f.manager.list("project"), [1, 2]);
});
test("native mutation queue serializes async callbacks, keeps no-op result and refuses CLI scope", async (t) => {
  const f = await fixture(t);
  await f.put("user", '{"n":0}');
  let events = 0;
  f.manager.onDidChange(() => events++);
  await Promise.all(
    Array.from({ length: 12 }, () =>
      f.manager.update("n", async (n: number) => {
        await Promise.resolve();
        return n + 1;
      }),
    ),
  );
  assert.equal(await f.manager.get("n"), 12);
  assert.equal(events, 12);
  assert.deepEqual(await f.manager.update("n", (n: any) => n), {
    applied: true,
    changed: false,
  });
  assert.deepEqual(await f.manager.update("n", () => 999, "cli"), {
    applied: false,
    changed: false,
  });
  assert.equal(events, 12);
  await f.manager.add("items", ["a", "a", null, "b"]);
  await f.manager.remove("items", ["a"]);
  assert.deepEqual(await f.manager.get("items"), ["b"]);
  await f.manager.remove("items", []);
  assert.equal(await f.manager.get("items"), undefined);
});
test("native lock acquisition/release failure warns without discarding writes", async (t) => {
  const f = await fixture(t);
  f.manager.fileLockService = {
    acquireFileLock: async () => {
      throw Error("owned contention");
    },
  };
  await f.manager.set("x", 1);
  assert.equal(await f.manager.get("x"), 1);
  f.manager.fileLockService = {
    acquireFileLock: async () => async () => {
      throw Error("owned release");
    },
  };
  await f.manager.set("x", 2);
  assert.equal(await f.manager.get("x"), 2);
  assert.ok(
    f.logs.some((l) =>
      l.join(" ").includes("proceeding without cross-process lock"),
    ),
  );
  assert.ok(f.logs.some((l) => l.join(" ").includes("Failed to release")));
});
test("native failed rename removes fixed .tmp and leaves original file unchanged", async (t) => {
  const f = await fixture(t, {
    fsPromises: {
      ...fs,
      rename: async () => {
        throw Error("owned rename failure");
      },
    },
  });
  await f.put("user", '{"x":1}');
  await assert.rejects(f.manager.set("x", 2), /owned rename failure/);
  assert.equal(await f.read("user"), '{"x":1}');
  await assert.rejects(fs.access(join(f.root, "state", "settings.json.tmp")));
});
test("native write refuses syntax corruption introduced after the forced read", async (t) => {
  const f = await fixture(t);
  await f.put("user", "{broken");
  assert.equal(await f.manager.writeSettingsFile({ x: 1 }, "user"), false);
  assert.equal(await f.read("user"), "{broken");
  assert.equal(f.manager.corruptedScopes.has("user"), true);
});
test("native controller and middleware retain scope selection, logging and key whitelist", async (t) => {
  const f = await fixture(t);
  await f.controller.set({
    global: true,
    key: "autoCompactEnabled",
    value: false,
  });
  assert.equal(await f.controller.get({ key: "autoCompactEnabled" }), false);
  assert.equal(f.printed.at(-1)[0], "");
  assert.deepEqual(f.printed.at(-1)[1], { mode: "native" });
  const mw = Object.assign(new f.classes.SettingsValidateMiddleWare(), {
    requestMatcher: { match: () => true },
    pathResolver: { resolve: async (p: string) => p },
  });
  assert.equal(mw.priority, 1950);
  let next = 0;
  await mw.handle(
    { request: { body: { global: true, key: "model" } } },
    async () => next++,
  );
  await assert.rejects(
    mw.handle(
      { request: { body: { global: true, key: "unlisted" } } },
      async () => next++,
    ),
    /Cannot operate settings/,
  );
  assert.equal(next, 1);
});
test("native policy keeps strict-false flags, last duplicate, name regex and original always-false block check", async (t) => {
  const f = await fixture(t);
  f.product.builtInMarketPluginsMerge = [
    { name: "bad name", marketplaceName: "m" },
    { name: "p", marketplaceName: "m", canRemove: false },
    {
      name: "p",
      marketplaceName: "m",
      canRemove: 0,
      canSwitchoff: false,
      canEdit: false,
    },
  ];
  f.policy.init();
  assert.equal(f.policy.getMergedPlugins().length, 1);
  assert.equal(f.policy.isPluginAutoInstall("p@m"), true);
  assert.equal(f.policy.isPluginCannotRemove("p@m"), false);
  assert.equal(f.policy.isPluginCannotSwitchoff("p@m"), true);
  assert.equal(f.policy.isPluginCannotEdit("p@m"), true);
  assert.equal(f.policy.isMarketplaceBlockedByPolicy("anything"), false);
});
test("native policy changes ignore version/metadata but signal restrictions and removals", async (t) => {
  const f = await fixture(t);
  let changes = 0;
  f.policy.onDidChange(() => changes++);
  f.product.builtInMarketPluginsMerge = [
    { name: "p", marketplaceName: "m", version: "1" },
  ];
  f.policy.init();
  assert.equal(changes, 1);
  f.product.builtInMarketPluginsMerge = [
    { name: "p", marketplaceName: "m", version: "2", description: "new" },
  ];
  f.productChanges.fire(undefined);
  assert.equal(changes, 1);
  f.product.builtInMarketPluginsMerge = [
    { name: "p", marketplaceName: "m", canRemove: false },
  ];
  f.productChanges.fire(undefined);
  assert.equal(changes, 2);
  f.product.builtInMarketPluginsMerge = [];
  f.productChanges.fire(undefined);
  assert.equal(changes, 3);
});
test("owned settings filesystem writes only three scope files and rejects external symlinks", async (t) => {
  const f = await fixture(t),
    outside = join(f.root, "outside"),
    cwd = join(f.root, "project"),
    state = join(f.root, "state");
  await fs.mkdir(cwd);
  await fs.mkdir(state);
  await fs.mkdir(outside);
  const bridge = createOwnedSettingsFilesystem(
    () => state,
    () => cwd,
  );
  await assert.rejects(
    async () => bridge.writeFile(join(outside, "arbitrary"), "bad"),
    /outside configured/,
  );
  await fs.symlink(outside, join(cwd, ".codebuddy"));
  await assert.rejects(
    async () =>
      bridge.writeFile(join(cwd, ".codebuddy", "settings.json"), "bad"),
    /external symlink/,
  );
  await fs.symlink(join(outside, "target"), join(state, "settings.json.tmp"));
  // Existing dangling links fail in the OS rather than granting an external target.
  await assert.rejects(async () =>
    bridge.writeFile(join(state, "settings.json.tmp"), "bad"),
  );
  await assert.rejects(fs.access(join(outside, "target")));
});
test("settings host reload queues settle on none/CLI, restore disk on re-enable and close all owned handles", async (t) => {
  const f = await fixture(t);
  await f.put("user", '{"model":"disk","x":1}');
  const h = createNativeSettingsHost({
    stateDir: join(f.root, "state"),
    getWorkDir: () => f.root,
    fileLockService: f.manager.fileLockService,
    logger: f.logger,
  });
  t.after(() => h.close());
  await h.start();
  assert.equal(await h.manager.get("model"), "disk");
  await h.updateCliOptions({
    settingSources: "none",
    settings: '{"model":"cli"}',
  });
  assert.equal(await h.manager.get("model"), "cli");
  assert.equal(await h.manager.get("x"), undefined);
  assert.equal(await h.manager.get("x", "user"), 1);
  await h.updateCliOptions({ settingSources: "user" });
  assert.equal(await h.manager.get("model"), "disk");
  await h.close();
  assert.equal(h.ownedHandleCount, 0);
  assert.equal(h.pendingCount, 0);
  await assert.rejects(h.updateCliOptions({}), /closed/);
});
const fakeModel: Model = {
  async getResponse() {
    return { output: [], usage: new Usage() };
  },
  async *getStreamedResponse() {
    yield { type: "response_started" } as any;
    yield {
      type: "response_done",
      response: {
        id: "settings",
        usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
        output: [
          {
            type: "message",
            role: "assistant",
            id: "m",
            status: "completed",
            content: [{ type: "output_text", text: "owned" }],
          },
        ],
      },
    } as any;
  },
};
test("real harness shares native settings, persists enabled flags, refreshes and restores across restart", async (t) => {
  const f = await fixture(t),
    stateDir = join(f.root, "state");
  await f.put("user", '{"enabledPlugins":{},"memory":{"owned":true}}');
  for (let i = 0; i < 2; i++) {
    const h = await createHarness({
      workDir: f.root,
      stateDir,
      recordReplayEnv: {},
      productRuntime: { watch: false },
      modelProvider: { getModel: () => fakeModel },
    });
    try {
      if (i === 0)
        await h.settingsManager!.set("enabledPlugins", {
          "missing@owned": false,
        });
      assert.deepEqual(await h.settingsManager!.get("enabledPlugins", "user"), {
        "missing@owned": false,
      });
      assert.equal(await h.settingsManager!.get("alwaysThinkingEnabled"), true);
      await h.pluginRuntimeRefresh!.waitForRefreshSettled();
      const s = await h.openSession();
      await h.prompt(s, "owned settings");
    } finally {
      await h.close();
      assert.equal(h.settingsHost!.ownedHandleCount, 0);
    }
  }
});
test("legacy non-sensitive options migration keeps backup file and never replaces existing USER plugin config", async (t) => {
  const f = await fixture(t),
    stateDir = join(f.root, "state"),
    legacy = join(stateDir, "plugins", "plugin-options.json");
  await fs.mkdir(join(stateDir, "plugins"), { recursive: true });
  await fs.writeFile(
    legacy,
    JSON.stringify({
      pluginConfigs: { old: { value: 1 }, existing: { value: "legacy" } },
    }),
  );
  await f.put("user", '{"pluginConfigs":{"existing":{"value":"native"}}}');
  const h = await createHarness({
    workDir: f.root,
    stateDir,
    recordReplayEnv: {},
    productRuntime: { watch: false },
    modelProvider: { getModel: () => fakeModel },
  });
  try {
    assert.deepEqual(await h.settingsManager!.get("pluginConfigs", "user"), {
      old: { value: 1 },
      existing: { value: "native" },
    });
  } finally {
    await h.close();
  }
  assert.match(await fs.readFile(legacy, "utf8"), /legacy/);
});
test("native disk settings support real plugin disable/restart/enable/uninstall and live product policy restrictions", async (t) => {
  const f = await fixture(t),
    stateDir = join(f.root, "state"),
    market = join(f.root, "market");
  const put = async (file: string, text: string) => {
    await fs.mkdir(join(file, ".."), { recursive: true });
    await fs.writeFile(file, text);
  };
  await put(
    join(market, ".claude-plugin", "marketplace.json"),
    JSON.stringify({
      name: "owned-market",
      plugins: [{ name: "owned", source: "./plugins/owned", version: "1.0.0" }],
    }),
  );
  await put(
    join(market, "plugins", "owned", ".codebuddy-plugin", "plugin.json"),
    '{"name":"owned","version":"1.0.0"}',
  );
  await put(
    join(market, "plugins", "owned", "commands", "echo.md"),
    "---\ndescription: owned\n---\nowned command",
  );
  await f.put(
    "user",
    JSON.stringify({
      extraKnownMarketplaces: {
        "owned-market": { source: { source: "directory", url: market } },
      },
      enabledPlugins: { "owned@owned-market": true },
    }),
  );
  let policies: any[] = [];
  const start = () =>
    createHarness({
      workDir: f.root,
      stateDir,
      recordReplayEnv: {},
      modelProvider: { getModel: () => fakeModel },
      productRuntime: {
        watch: false,
        providers: [
          {
            priority: 21000,
            async provide() {
              return { builtInMarketPluginsMerge: policies };
            },
          },
        ],
      },
    });
  let h = await start();
  try {
    assert.ok(await h.commandManager.get("/owned:echo"));
    await h.pluginManager.disablePlugins(["owned"], "owned-market");
    await h.pluginRuntimeRefresh!.refresh("reload-command");
    assert.equal(
      (await h.settingsManager!.get("enabledPlugins", "user"))[
        "owned@owned-market"
      ],
      false,
    );
    assert.equal(await h.commandManager.get("/owned:echo"), undefined);
    await h.close();
    h = await start();
    assert.equal(await h.commandManager.get("/owned:echo"), undefined);
    await h.pluginManager.enablePlugins(["owned"], "owned-market");
    await h.pluginRuntimeRefresh!.refresh("reload-command");
    assert.ok(await h.commandManager.get("/owned:echo"));
    policies = [
      {
        name: "owned",
        marketplaceName: "owned-market",
        scope: "user",
        autoEnable: true,
        canRemove: false,
        canSwitchoff: false,
      },
    ];
    await h.productManager.sync(true);
    await h.pluginManager.applyManagedPolicies();
    assert.equal(
      h.pluginHost!.pluginPolicyService.isPluginCannotRemove(
        "owned@owned-market",
      ),
      true,
    );
    await assert.rejects(
      h.pluginManager.disablePlugins(["owned"], "owned-market"),
      /required by enterprise policy/,
    );
    await assert.rejects(
      h.pluginManager.uninstallPlugins(["owned"], "owned-market"),
      /required by enterprise policy/,
    );
    policies = [];
    await h.productManager.sync(true);
    await h.pluginManager.applyManagedPolicies();
    await h.pluginManager.uninstallPlugins(["owned"], "owned-market");
    await h.pluginRuntimeRefresh!.refresh("reload-command");
    assert.equal(
      (await h.settingsManager!.get("enabledPlugins", "user"))?.[
        "owned@owned-market"
      ],
      undefined,
    );
    assert.equal(await h.commandManager.get("/owned:echo"), undefined);
  } finally {
    await h.close();
  }
});
test("real native ConfigChange command Hook receives persisted scope payload and shutdown drains it", async (t) => {
  const f = await fixture(t),
    script = join(f.root, "hook.mjs"),
    out = join(f.root, "hook-input.json");
  await fs.writeFile(
    script,
    'import{writeFileSync}from"node:fs";let input="";for await(const c of process.stdin)input+=c;writeFileSync(process.argv[2],input);',
  );
  const q = (s: string) => "'" + s.replaceAll("'", "'\\''") + "'";
  await f.put(
    "user",
    JSON.stringify({
      hooks: {
        ConfigChange: [
          {
            hooks: [
              {
                type: "command",
                command: `exec ${q(process.execPath)} ${q(script)} ${q(out)}`,
              },
            ],
          },
        ],
      },
    }),
  );
  const h = await createHarness({
    workDir: f.root,
    stateDir: join(f.root, "state"),
    recordReplayEnv: {},
    productRuntime: { watch: false },
    modelProvider: { getModel: () => fakeModel },
  });
  try {
    await h.settingsManager!.set("owned", true);
    await h.settingsHost!.flush();
    const input = JSON.parse(await fs.readFile(out, "utf8"));
    assert.equal(input.hook_event_name, "ConfigChange");
    assert.equal(input.source, "user_settings");
    assert.equal(input.file_path, join(f.root, "state", "settings.json"));
  } finally {
    await h.close();
  }
});
test("global CWD change clears native scope caches and project writes follow new owned workdir", async (t) => {
  const f = await fixture(t),
    next = join(f.root, "next");
  await fs.mkdir(join(next, ".codebuddy"), { recursive: true });
  await f.put("project", '{"owned":"old"}');
  await fs.writeFile(
    join(next, ".codebuddy", "settings.json"),
    '{"owned":"new"}',
  );
  const h = await createHarness({
    workDir: f.root,
    stateDir: join(f.root, "state"),
    recordReplayEnv: {},
    productRuntime: { watch: false },
    modelProvider: { getModel: () => fakeModel },
  });
  try {
    assert.equal(await h.settingsManager!.get("owned", "project"), "old");
    h.cwdService.setCwdState(next, true);
    assert.equal(await h.settingsManager!.get("owned", "project"), "new");
    await h.settingsManager!.set("owned", "written", "project");
    assert.match(
      await fs.readFile(join(next, ".codebuddy", "settings.json"), "utf8"),
      /written/,
    );
    assert.equal(await f.read("project"), '{"owned":"old"}');
  } finally {
    await h.close();
  }
});
test(
  "CLI settings flags reach native provider and none excludes disk SessionStart Hooks",
  { timeout: 15000 },
  async (t) => {
    const f = await fixture(t),
      marker = join(f.root, "unexpected-hook");
    const q = (s: string) => "'" + s.replaceAll("'", "'\\''") + "'";
    const script = join(f.root, "marker.mjs");
    await fs.writeFile(
      script,
      'import{writeFileSync}from"node:fs";writeFileSync(process.argv[2],"unexpected");',
    );
    await f.put(
      "user",
      JSON.stringify({
        hooks: {
          SessionStart: [
            {
              hooks: [
                {
                  type: "command",
                  command: `exec ${q(process.execPath)} ${q(script)} ${q(marker)}`,
                },
              ],
            },
          ],
        },
      }),
    );
    const source = import.meta.url.endsWith(".ts"),
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
        "--setting-sources",
        "none",
        "--settings",
        '{/*owned*/"reasoningEffort":"low"}',
        "--effort",
        "max",
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
    assert.match(
      child.stderr,
      /CLI settings initialized:.*"reasoningEffort":"max"/,
    );
    await assert.rejects(fs.access(marker));
  },
);

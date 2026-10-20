import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, mkdir, writeFile, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { Usage, setTraceProcessors, type Model } from "@openai/agents-core";
import { pluginRuntimeFixture } from "../scripts/helpers/plugin-runtime-fixtures.js";
import { createNativePluginHost } from "../src/plugins/native-plugin-host.js";
import { createNativePluginFrontmatter } from "../src/plugins/native-plugin-frontmatter.js";
import { createOwnedPluginFilesystem } from "../src/plugins/owned-plugin-filesystem.js";
import { createNativePluginSemver } from "../src/plugins/native-plugin-semver.js";
import { createHarness } from "../src/runtime/create-harness.js";
import { ownedMcpHttp } from "./helpers/owned-mcp-http.js";
setTraceProcessors([]);
function gate<T = void>() {
  let resolve!: (v: T) => void;
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
}
async function owned(t: any) {
  const root = await mkdtemp(join(tmpdir(), "native-plugins-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}
async function put(file: string, text: string) {
  await mkdir(join(file, ".."), { recursive: true });
  await writeFile(file, text);
}
const actionNames = (events: any[]) =>
  events
    .filter((e) => !["info", "debug", "warn", "error"].includes(e[0]))
    .map((e) => e[0]);
test("native semver wrapper retains Bun fast paths and Node-only range fallback", () => {
  const calls: any[] = [],
    s: any = createNativePluginSemver({
      Bun: {
        semver: {
          order(a: any, b: any) {
            calls.push(["order", a, b]);
            return 1;
          },
          satisfies(a: any, b: any) {
            calls.push(["satisfies", a, b]);
            return true;
          },
        },
      },
      semver: { validRange: (v: any) => "node:" + v },
    });
  assert.equal(s.gt("a", "b"), true);
  assert.equal(s.valid("owned"), "owned");
  assert.equal(s.validRange("range"), "node:range");
  assert.deepEqual(calls, [
    ["order", "a", "b"],
    ["satisfies", "owned", ">=0.0.0"],
  ]);
  const node: any = createNativePluginSemver({ Bun: undefined });
  assert.equal(node.satisfies("1.2.3", "^1.0.0"), true);
});
test("native active-plugin commit freezes snapshot and checks beforeCommit before touching registry", async () => {
  const f = pluginRuntimeFixture();
  let observed: any;
  const snapshot = await f.manager.refreshActivePlugins({
    beforeCommit: (v: any) => {
      observed = v;
      assert.equal(f.manager.activePlugins.length, 0);
      assert.equal(
        f.events.some((e) => e[0] === "registry"),
        false,
      );
    },
  });
  assert.equal(Object.isFrozen(observed), true);
  assert.equal(Object.isFrozen(snapshot), true);
  assert.equal(Object.isFrozen(snapshot[0]), true);
  assert.equal(Object.isFrozen(snapshot[0].plugin), true);
  assert.equal(f.manager.activePlugins, snapshot);
  assert.ok(f.events.some((e) => e[0] === "registry"));
  const old = f.manager.activePlugins;
  await assert.rejects(
    f.manager.refreshActivePlugins({
      beforeCommit() {
        throw Error("block before commit");
      },
    }),
    /block before commit/,
  );
  assert.equal(f.manager.activePlugins, old);
});
test("native component cache coalesces load and discards late result after clearCache", async () => {
  const f = pluginRuntimeFixture(),
    pending = gate<any>();
  let count = 0;
  f.manager.pluginLoaderManager.loadPluginComponents = () => {
    count++;
    return pending.promise;
  };
  const a = f.manager.getPluginComponents("owned", "fixture"),
    b = f.manager.getPluginComponents("owned", "fixture");
  await new Promise<void>((r) => setImmediate(r));
  assert.equal(count, 1);
  f.manager.clearCache();
  pending.resolve({ commands: [] });
  await Promise.all([a, b]);
  assert.equal(f.manager.pluginComponentsCache.size, 0);
});
test("native active snapshot reports dependency/component errors without committing disabled entries", async () => {
  const f = pluginRuntimeFixture({
    loadError: true,
    installed: [
      {
        name: "owned",
        marketplaceName: "fixture",
        status: "enabled",
        installedPath: "/owned/plugin",
      },
      {
        name: "disabled",
        marketplaceName: "fixture",
        status: "disabled",
        dependencyErrors: [
          {
            code: "dependency-unsatisfied",
            dependency: "missing",
            message: "owned missing",
          },
        ],
      },
    ],
  });
  let errors: any[] = [];
  const result = await f.manager.refreshActivePlugins({
    beforeCommit: (v: any) => {
      errors = v.errors;
    },
  });
  assert.equal(result.length, 0);
  assert.deepEqual(
    errors.map((e) => e.type),
    ["dependency-unsatisfied", "component-load-failed"],
  );
  assert.equal(errors[0].reason, "not-found");
});
test("native dependency guard cascades disabled dependencies and honors higher-precedence scope rejection", () => {
  const f = pluginRuntimeFixture(),
    plugins = [
      {
        name: "a",
        marketplaceName: "m",
        installedPath: "/owned/a",
        status: "enabled",
        dependencies: ["b"],
      },
      {
        name: "b",
        marketplaceName: "m",
        installedPath: "/owned/b",
        status: "enabled",
        dependencies: ["missing"],
      },
    ];
  f.manager.applyDependencyRuntimeGuards(plugins);
  assert.deepEqual(
    plugins.map((p) => p.status),
    ["disabled", "disabled"],
  );
  assert.throws(
    () =>
      f.manager.assertDependencyCanBeEnabledAtScope(
        "b@m",
        "project",
        { "b@m": { enabled: false, scope: "cli" } },
        { name: "a", marketplaceName: "m" },
      ),
    /higher-precedence/,
  );
});
test("native runtime refresh preserves cross-service order and stable/volatile reason branches", async () => {
  for (const reason of [
    "startup",
    "reload-command",
    "builtin-seed",
    "settings-change",
  ]) {
    const f = pluginRuntimeFixture();
    await f.refresh.refresh(reason);
    const names = actionNames(f.events);
    assert.ok(names.indexOf("mcp-reload") < names.indexOf("tool-invalidate"));
    assert.ok(
      names.indexOf("tool-invalidate") <
        names.indexOf(
          reason === "reload-command" || reason === "builtin-seed"
            ? "product-volatile"
            : "product-sync",
        ),
    );
    assert.ok(names.indexOf("command-refresh") < names.indexOf("style-reload"));
    assert.ok(names.indexOf("style-reload") < names.indexOf("agents-refresh"));
    assert.equal(names.includes("marketplaces"), reason === "settings-change");
  }
});
test("native MCP reload guard compares sorted effective names before active snapshot commit", async () => {
  const f = pluginRuntimeFixture({
    projected: ["z", "old"],
    effective: ["new", "a"],
  });
  const prior = f.manager.activePlugins;
  await assert.rejects(
    f.refresh.refresh("reload-command", { blockMcpToolChanges: true }),
    (e: any) => {
      assert.deepEqual(e.added, ["a", "new"]);
      assert.deepEqual(e.removed, ["old", "z"]);
      assert.match(e.message, /\/reload-plugins --force/);
      return true;
    },
  );
  assert.equal(f.manager.activePlugins, prior);
  assert.equal(actionNames(f.events).includes("mcp-reload"), false);
  await f.refresh.refresh("reload-command", { blockMcpToolChanges: false });
  assert.equal(f.manager.activePlugins.length, 1);
});
test("native MCP guard permits changed raw config when projected/effective names are unchanged", async () => {
  const f = pluginRuntimeFixture({ projected: ["same"], effective: ["same"] });
  await f.refresh.refresh("reload-command", { blockMcpToolChanges: true });
  assert.equal(f.manager.activePlugins.length, 1);
});
test("native refresh tail swallows failure only for settling and next refresh still runs", async () => {
  const f = pluginRuntimeFixture({ mcpError: true });
  await assert.rejects(f.refresh.refresh("startup"), /owned MCP failure/);
  await f.refresh.waitForRefreshSettled();
  f.refresh.mcpManager.reloadPluginServers = async () => {};
  await f.refresh.refresh("reload-command");
  assert.ok(actionNames(f.events).includes("agents-refresh"));
});
test("native refresh serializes prepareDesiredState and waits until queued transactions settle", async () => {
  const f = pluginRuntimeFixture(),
    g = gate(),
    entered = gate();
  const first = f.refresh.refresh("reload-command", {
    prepareDesiredState: async () => {
      entered.resolve();
      await g.promise;
    },
  });
  await entered.promise;
  let secondEntered = false;
  const second = f.refresh.refresh("reload-command", {
    prepareDesiredState() {
      secondEntered = true;
    },
  });
  let settled = false;
  const waiting = f.refresh.waitForRefreshSettled().then(() => {
    settled = true;
  });
  await Promise.resolve();
  assert.equal(secondEntered, false);
  assert.equal(settled, false);
  g.resolve();
  await Promise.all([first, second, waiting]);
  assert.equal(secondEntered, true);
});
test("native reload-command LSP reload is background but startup waits and propagates its failure", async () => {
  const wait = gate(),
    f = pluginRuntimeFixture({ lspWait: wait.promise, lspError: true });
  await f.refresh.refresh("reload-command");
  assert.ok(actionNames(f.events).includes("agents-refresh"));
  wait.resolve();
  await new Promise<void>((r) => setImmediate(r));
  assert.ok(
    f.events.some(
      (e) => e[0] === "warn" && String(e[1]).includes("background LSP"),
    ),
  );
  await assert.rejects(f.refresh.refresh("startup"), /owned LSP failure/);
});
test("native dependency repair's second active load retains original no-second-MCP-guard behavior", async () => {
  const f = pluginRuntimeFixture({
    projected: [],
    effective: [],
    repaired: ["dep@owned"],
  });
  let loads = 0;
  const native = f.manager.refreshActivePlugins.bind(f.manager);
  f.manager.refreshActivePlugins = (opts: any) => {
    loads++;
    return native(opts);
  };
  await f.refresh.refresh("reload-command", { blockMcpToolChanges: true });
  assert.equal(loads, 2);
  assert.equal(
    actionNames(f.events).filter((n) => n === "skill-clear").length,
    2,
  );
});
test("native reload command retains force/deferred/previous-output gate and exact summary fields", async () => {
  for (const force of [false, true])
    for (const deferred of [false, true])
      for (const outputTokens of [0, 1]) {
        const f = pluginRuntimeFixture(),
          histories: any[] = [],
          calls: any[] = [];
        const command = Object.assign(
          new f.classes.ReloadPluginsCommandExecutor(),
          {
            logger: { setContext() {}, error() {} },
            sessionManager: {
              async addHistory(_s: any, items: any) {
                histories.push(...items);
              },
            },
            pluginManager: f.manager,
            pluginRuntimeRefreshService: {
              async refresh(...args: any[]) {
                calls.push(args);
                return {
                  activePlugins: [
                    {
                      components: {
                        commands: [{}],
                        agents: [{}],
                        skills: [{}],
                        hooks: { Stop: [{}] },
                        mcpServers: { owned: {} },
                        lspServers: { owned: {} },
                      },
                    },
                  ],
                  errors: [],
                };
              },
            },
            agentManager: {
              getDefaultAgentName: () => "cli",
              async get() {
                return { tools: deferred ? [{ name: "ToolSearch" }] : [] };
              },
            },
          },
        );
        await command.execute({
          session: { usage: { outputTokens } },
          args: force ? ["--force"] : [],
        });
        assert.equal(
          calls[0][1].blockMcpToolChanges,
          !force && !deferred && outputTokens > 0,
        );
        const text = JSON.stringify(histories);
        assert.match(text, /Plugins reloaded successfully:/);
        assert.match(text, /MCP servers: 1/);
        assert.match(text, /Skills: 1/);
      }
});
test("native plugin frontmatter schemas filter unknown/invalid Hook events and strip unknown hook fields", () => {
  const schema = createNativePluginFrontmatter().A2;
  const value = schema.parse({
    matcher: "Read",
    extra: "drop",
    hooks: [{ type: "command", command: "owned", timeout: 1, extra: "drop" }],
  });
  assert.equal("extra" in value, false);
  assert.equal("extra" in value.hooks[0]!, false);
  assert.equal(
    schema.safeParse({ hooks: [{ type: "http", url: "owned", method: "GET" }] })
      .success,
    false,
  );
});
test("owned filesystem bridge refuses outside-state mutations and symlink escapes", async (t) => {
  const root = await owned(t),
    state = join(root, "state");
  await mkdir(state);
  const file = join(root, "outside.txt");
  await writeFile(file, "keep");
  const bridge = createOwnedPluginFilesystem(state);
  await assert.rejects(bridge.remove(file), /outside owned state/);
  assert.equal(await readFile(file, "utf8"), "keep");
  await bridge.symlink(root, join(state, "escape"), "dir");
  await assert.rejects(
    bridge.writeFile(join(state, "escape", "outside.txt"), "bad"),
    /external symlink/,
  );
  assert.equal(await readFile(file, "utf8"), "keep");
});
function localHost(root: string, plugins: any = {}) {
  const config = {
    models: [{ id: "model-id", name: "Display" }],
    agents: [],
    tools: [],
    prompts: [],
    outputStyles: [],
  };
  return createNativePluginHost({
    stateDir: join(root, "state"),
    getWorkDir: () => root,
    settings: { async get() {} },
    productManager: {
      getCurrentConfiguration: () => config,
      async waitConfiguration() {
        return config;
      },
      onDidChange: () => ({ dispose() {} }),
      async sync() {},
      async syncVolatileProviders() {},
    },
    promptRenderer: {
      async render(v: any) {
        return v;
      },
    },
    plugins,
  });
}
async function pluginFiles(root: string) {
  const dir = join(root, "plugin");
  await put(
    join(dir, ".codebuddy-plugin", "plugin.json"),
    JSON.stringify({ name: "owned", version: "1.0.0", description: "owned" }),
  );
  await put(
    join(dir, "agents", "expert.md"),
    "---\nname: expert\ndescription: owned expert\ntools: [Read]\nmodel: model-id\n---\nowned instructions",
  );
  await put(
    join(dir, "commands", "echo.md"),
    "---\ndescription: owned command\nmodel: Display\n---\n${CODEBUDDY_PLUGIN_ROOT} ${ARGUMENTS}",
  );
  await put(
    join(dir, "skills", "owned-skill", "SKILL.md"),
    "---\nname: owned-skill\ndescription: owned skill\n---\nowned skill body",
  );
  await put(
    join(dir, "output-styles", "style.md"),
    "---\ndescription: owned style\nkeep-coding-instructions: true\n---\nowned style content",
  );
  return dir;
}
test("native seven loaders materialize real trusted files, model rules, env, hooks and styles", async (t) => {
  const root = await owned(t),
    dir = await pluginFiles(root);
  await put(
    join(dir, ".mcp.json"),
    '{/* owned JSONC */"owned":{"url":"${URL}"}}',
  );
  await put(
    join(dir, ".lsp.json"),
    '{"owned":{"command":"owned-lsp","extensionToLanguage":{".owned":"owned"}}}',
  );
  await put(
    join(dir, "hooks", "hooks.json"),
    '{"Stop":[{"hooks":[{"type":"prompt","prompt":"owned stop"}]}]}',
  );
  const host = localHost(root, {
    directories: [dir],
    env: { URL: "http://127.0.0.1:1/mcp" },
  });
  t.after(() => host.close());
  await host.start();
  const active = await host.pluginManager.getActivePlugins();
  assert.equal(active.length, 1);
  const c = active[0].components;
  assert.equal(c.agents[0].models[0], "model-id");
  assert.equal(c.commands[0].name, "owned:echo");
  assert.equal(c.commands[0].model, "model-id");
  assert.match(c.commands[0].prompt, /plugin/);
  assert.equal(c.skills[0].pluginInfo.pluginName, "owned");
  assert.equal(c.hooks.Stop[0].hooks[0].prompt, "owned stop");
  assert.equal(c.mcpServers.owned.type, "http");
  assert.equal(c.mcpServers.owned.url, "http://127.0.0.1:1/mcp");
  assert.equal(c.lspServers.owned.command, "owned-lsp");
  assert.equal(c.outputStyles[0].name, "owned@inline:style");
  assert.equal(c.outputStyles[0].keepCodingInstructions, true);
});
test("native loader rejects unknown agent model but preserves unknown command model", async (t) => {
  const root = await owned(t),
    dir = await pluginFiles(root);
  await writeFile(
    join(dir, "agents", "expert.md"),
    "---\nmodel: unknown\n---\nowned",
  );
  await writeFile(
    join(dir, "commands", "echo.md"),
    "---\nmodel: unknown\n---\nowned",
  );
  const host = localHost(root, { directories: [dir] });
  t.after(() => host.close());
  await host.start();
  const c = (await host.pluginManager.getActivePlugins())[0].components;
  assert.deepEqual(c.agents[0].models, []);
  assert.equal(c.commands[0].model, "unknown");
});
test("native output style cache uses built-in then ancestor order, plugin last and reloads", async (t) => {
  const root = await owned(t),
    host = localHost(root);
  t.after(() => host.close());
  const styles = host.outputStyles;
  styles.productManager = {
    async waitConfiguration() {
      return {
        outputStyles: [{ name: "Duplicate", instructions: "built-in" }],
      };
    },
  };
  await put(
    join(root, ".codebuddy", "output-styles", "same.md"),
    "---\nname: Duplicate\n---\nproject",
  );
  styles.pluginManager = {
    async getActivePlugins() {
      return [
        {
          components: {
            outputStyles: [
              { name: "Plugin", content: "owned plugin" },
              { name: "Duplicate", content: "plugin duplicate" },
            ],
          },
        },
      ];
    },
  };
  const all = await styles.getAllOutputStyles();
  assert.equal(
    all.find((s: any) => s.name === "Duplicate").content,
    "built-in",
  );
  assert.equal(
    (await styles.getOutputStyleByName("plugin")).content,
    "owned plugin",
  );
  await styles.reload();
  assert.equal(styles.initialized, true);
});
test("owned host close waits in-flight refresh, clears startup handles and rejects new refresh", async (t) => {
  const root = await owned(t),
    host = localHost(root),
    g = gate(),
    entered = gate();
  await host.start();
  const p = host.refresh.refresh("reload-command", {
    prepareDesiredState: async () => {
      entered.resolve();
      await g.promise;
    },
  });
  await entered.promise;
  let closed = false;
  const closing = host.close().then(() => {
    closed = true;
  });
  await Promise.resolve();
  assert.equal(closed, false);
  g.resolve();
  await Promise.all([p, closing]);
  assert.equal(host.pendingCount, 0);
  assert.equal(host.ownedHandleCount, 0);
  await assert.rejects(host.refresh.refresh("reload-command"), /closed/);
});
function model(requests: any[]): Model {
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
  "real SDK local plugin startup, command reload and deletion update live Agent/command/style views",
  { timeout: 15000 },
  async (t) => {
    const root = await owned(t),
      dir = await pluginFiles(root),
      requests: any[] = [];
    const h = await createHarness({
      workDir: root,
      stateDir: join(root, "state"),
      recordReplayEnv: {},
      modelProvider: { getModel: () => model(requests) },
      nativePlugins: { directories: [dir] },
      productRuntime: { watch: false },
    });
    t.after(() => h.close());
    assert.ok(await h.agents.get("expert"));
    assert.ok(await h.commandManager.get("/owned:echo"));
    assert.ok(
      await h.pluginHost!.outputStyles.getOutputStyleByName(
        "owned@inline:style",
      ),
    );
    const s = await h.openSession();
    await h.prompt(s, "/owned:echo argument");
    assert.match(JSON.stringify(requests.at(-1).input), /argument/);
    await writeFile(
      join(dir, "commands", "echo.md"),
      "---\ndescription: changed\n---\nchanged plugin prompt",
    );
    const before = requests.length;
    await h.prompt(s, "/reload-plugins --force");
    assert.equal(requests.length, before);
    await h.prompt(s, "/owned:echo");
    assert.match(
      JSON.stringify(requests.at(-1).input),
      /changed plugin prompt/,
    );
    await rm(join(dir, ".codebuddy-plugin", "plugin.json"));
    await h.pluginRuntimeRefresh!.refresh("reload-command");
    assert.equal(await h.commandManager.get("/owned:echo"), undefined);
    assert.equal(Boolean(await h.agents.get("expert")), false);
  },
);
test(
  "real SDK prompt joins queued plugin refresh and receives rebuilt managed agent",
  { timeout: 15000 },
  async (t) => {
    const root = await owned(t),
      dir = await pluginFiles(root),
      requests: any[] = [],
      h = await createHarness({
        workDir: root,
        stateDir: join(root, "state"),
        recordReplayEnv: {},
        modelProvider: { getModel: () => model(requests) },
        nativePlugins: { directories: [dir] },
        productRuntime: { watch: false },
      });
    t.after(() => h.close());
    const s = await h.openSession(),
      g = gate(),
      entered = gate();
    const refresh = h.pluginRuntimeRefresh!.refresh("reload-command", {
      prepareDesiredState: async () => {
        entered.resolve();
        await g.promise;
      },
    });
    await entered.promise;
    const running = h.prompt(s, "/owned:echo");
    await new Promise<void>((r) => setImmediate(r));
    assert.equal(requests.length, 0);
    g.resolve();
    await Promise.all([refresh, running]);
    assert.equal(requests.length, 1);
  },
);
test(
  "native plugin transaction protects effective MCP set before commit and force connects owned endpoint",
  { timeout: 15000 },
  async (t) => {
    const root = await owned(t),
      dir = await pluginFiles(root),
      peer = await ownedMcpHttp();
    t.after(() => peer.close());
    const h = await createHarness({
      workDir: root,
      stateDir: join(root, "state"),
      recordReplayEnv: {},
      modelProvider: { getModel: () => model([]) },
      nativePlugins: { directories: [dir] },
      nativeMcp: { env: {} },
      productRuntime: { watch: false },
    });
    t.after(() => h.close());
    const old = await h.pluginManager.getActivePlugins();
    await put(
      join(dir, ".mcp.json"),
      JSON.stringify({ owned: { type: "http", url: peer.url + "/mcp" } }),
    );
    await assert.rejects(
      h.pluginRuntimeRefresh!.refresh("reload-command", {
        blockMcpToolChanges: true,
      }),
      /changes MCP tools/,
    );
    assert.equal(await h.pluginManager.getActivePlugins(), old);
    assert.equal(peer.requests.length, 0);
    await h.pluginRuntimeRefresh!.refresh("reload-command", {
      blockMcpToolChanges: false,
    });
    assert.ok(
      h
        .nativeMcp!.projection!.manager.getProjectedPluginServerNames()
        .includes("owned"),
    );
    assert.ok(peer.requests.some((request) => request.method === "initialize"));
  },
);
test(
  "CLI --plugin-dir runs native reload command without a model request",
  { timeout: 15000 },
  async (t) => {
    const root = await owned(t),
      dir = await pluginFiles(root),
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
        root,
        "--state-dir",
        join(root, "state"),
        "--plugin-dir",
        dir,
        "--base-url",
        "http://127.0.0.1:1/v1",
        "-p",
        "/reload-plugins --force",
      ],
      {
        cwd: fileURLToPath(new URL("../../", import.meta.url)),
        env: { PATH: process.env.PATH ?? "", CODEBUDDY_API_KEY: "owned-key" },
        encoding: "utf8",
        timeout: 12000,
      },
    );
    assert.equal(child.status, 0, child.stderr);
    assert.match(child.stdout, /Plugins reloaded successfully:/);
    assert.match(child.stdout, /Enabled: 1/);
    assert.match(child.stdout, /Commands: 1/);
  },
);
test(
  "real SDK consumes original plugin Stop Hook and drops it after reload",
  { timeout: 15000 },
  async (t) => {
    const root = await owned(t),
      dir = await pluginFiles(root),
      flag = join(root, "owned-hook.txt"),
      hook = join(dir, "hooks", "hooks.json");
    const code =
      'require("node:fs").writeFileSync(' + JSON.stringify(flag) + ',"owned")';
    await put(
      hook,
      JSON.stringify({
        Stop: [
          {
            hooks: [
              {
                type: "command",
                command:
                  JSON.stringify(process.execPath) +
                  " -e " +
                  JSON.stringify(code),
              },
            ],
          },
        ],
      }),
    );
    const h = await createHarness({
      workDir: root,
      stateDir: join(root, "state"),
      recordReplayEnv: {},
      modelProvider: { getModel: () => model([]) },
      nativePlugins: { directories: [dir] },
      productRuntime: { watch: false },
    });
    t.after(() => h.close());
    const s = await h.openSession();
    await h.prompt(s, "owned hook turn");
    assert.equal(await readFile(flag, "utf8"), "owned");
    await rm(flag);
    await rm(hook);
    await h.pluginRuntimeRefresh!.refresh("reload-command");
    await h.prompt(s, "without hook");
    await assert.rejects(readFile(flag, "utf8"), { code: "ENOENT" });
  },
);

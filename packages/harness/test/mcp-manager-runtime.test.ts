import assert from "node:assert/strict";
import test from "node:test";
import * as fs from "node:fs";
import { mkdtemp, rm, writeFile, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Usage, setTraceProcessors, type Model } from "@openai/agents-core";
import { mcpManagerFixture } from "../scripts/helpers/mcp-manager-fixtures.js";
import { createNativeMcpManagerRuntime } from "../src/mcp/native-mcp-manager-runtime.js";
import { createNativeMcpHost } from "../src/mcp/native-mcp-host.js";
import { createNativeMcpProjectionHost } from "../src/mcp/native-mcp-projection-host.js";
import {
  McpScope,
  McpServerStatus,
} from "../src/mcp/native-mcp-manager-constants.js";
import { createHarness } from "../src/runtime/create-harness.js";
import { ownedMcpHttp } from "./helpers/owned-mcp-http.js";
setTraceProcessors([]);
const server = (url = "http://owned.invalid", defer = true) => ({
  type: "http",
  url,
  defer_loading: defer,
});
function gate() {
  let resolve!: () => void;
  const promise = new Promise<void>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}
async function until(check: () => boolean) {
  for (let i = 0; i < 200; i++) {
    if (check()) return;
    await Promise.resolve();
  }
  assert.fail("owned state did not arrive");
}

test("native projection merges scope precedence, hides INTERNAL and previews immutable plugin names", async () => {
  const f = mcpManagerFixture({
    scopes: {
      internal: { shadow: server() },
      dynamic: { owned: server() },
      plugin: { shadow: server(), plugin: server() },
    },
  });
  await f.manager.list();
  await f.flush();
  assert.deepEqual(
    f.manager.allServersCache.map((m: any) => [m.name, m.scope]),
    [
      ["shadow", "internal"],
      ["owned", "dynamic"],
      ["plugin", "plugin"],
    ],
  );
  await assert.rejects(f.manager.get("shadow"), /Cannot access INTERNAL/);
  assert.deepEqual(await f.manager.list("internal"), []);
  assert.deepEqual(f.manager.getProjectedPluginServerNames(), ["plugin"]);
  const preview = await f.manager.previewEffectivePluginServerNames({
    shadow: server(),
    owned: server(),
    new: server(),
  });
  assert.deepEqual(preview, ["new"]);
  assert.equal(Object.isFrozen(preview), true);
});
test("project servers cannot create transport before approval; deny removes live view and deferred index", async () => {
  const f = mcpManagerFixture({ scopes: { project: { owned: server() } } });
  await f.manager.list();
  await f.flush();
  assert.equal(f.manager.allServersCache[0].status, "pendingApproval");
  assert.equal(f.servers.size, 0);
  assert.deepEqual(await f.manager.listTools("owned"), []);
  await assert.rejects(
    f.manager.getPrompt("owned", "native", {}),
    /requires approval/,
  );
  await f.manager.allow(["owned"]);
  await f.flush();
  const view = await f.manager.getConnectedServers();
  assert.equal(view.length, 1);
  assert.equal(f.tools.size, 1);
  await f.manager.deny(["owned"]);
  await f.flush();
  assert.equal(view, await f.manager.getConnectedServers());
  assert.equal(view.length, 0);
  assert.equal(f.tools.size, 0);
  assert.equal(f.servers.size, 0);
});
test("native connected cache is not committed until deferred tool indexing has finished", async () => {
  const f = mcpManagerFixture({ scopes: { dynamic: { owned: server() } } }),
    pending = gate();
  f.setToolGate(() => pending.promise);
  await f.manager.list();
  f.startScheduled();
  await until(() => f.events.some((e) => e[0] === "listTools"));
  assert.equal(f.manager.runtimeSlots.get("owned").model.status, "connected");
  assert.equal(f.manager.connectedServersCache.length, 0);
  assert.equal(f.manager.allServersSettled(), false);
  pending.resolve();
  await f.flush();
  assert.equal(f.manager.connectedServersCache.length, 1);
  assert.equal(f.manager.allServersSettled(), true);
});
test("late deferred index cannot commit an obsolete runtime generation", async () => {
  const f = mcpManagerFixture({ scopes: { dynamic: { owned: server() } } }),
    pending = gate();
  let calls = 0;
  f.setToolGate(() => (++calls === 1 ? pending.promise : Promise.resolve()));
  await f.manager.list();
  f.startScheduled();
  await until(() => calls === 1);
  const old = f.manager.runtimeSlots.get("owned");
  await f.manager.add("owned", server("http://changed.invalid"), "dynamic");
  f.startScheduled();
  await until(
    () => f.manager.runtimeSlots.get("owned").model.status === "connected",
  );
  pending.resolve();
  await f.flush();
  const current = f.manager.runtimeSlots.get("owned");
  assert.notEqual(current.generation, old.generation);
  assert.equal(
    f.manager.committedRuntimeGenerations.get("owned"),
    current.generation,
  );
  assert.equal(f.manager.indexedDeferServers.get("owned"), current.generation);
  assert.equal(f.tools.size, 1);
  assert.ok(
    f.events.some((e) =>
      String(e[1]).includes("discarded stale deferred-tool index"),
    ),
  );
});
test("denial during an old server create evicts its late result", async () => {
  const f = mcpManagerFixture({
      scopes: { project: { owned: server() } },
      settings: { enableAllProjectMcpServers: true },
    }),
    pending = gate();
  f.setCreateGate(() => pending.promise);
  await f.manager.list();
  f.startScheduled();
  await until(() => f.events.some((e) => e[0] === "create"));
  await f.manager.deny(["owned"]);
  assert.equal(
    f.manager.runtimeSlots.get("owned").model.status,
    "pendingApproval",
  );
  pending.resolve();
  await f.flush();
  assert.equal(f.servers.size, 0);
  assert.equal(f.manager.connectedServersCache.length, 0);
  assert.ok(
    f.events.some((e) =>
      String(e[1]).includes("discarded stale create result"),
    ),
  );
});
test("orphaned and stale connection status events do not overwrite current generation", async () => {
  const f = mcpManagerFixture({ scopes: { dynamic: { owned: server() } } });
  await f.manager.list();
  await f.flush();
  const old = f.manager.runtimeSlots.get("owned").model;
  await f.manager.add("owned", server("http://changed.invalid"), "dynamic");
  await f.flush();
  old.status = "disconnected";
  await f.flush();
  assert.equal(
    f.manager.connectedServersCache[0].url,
    "http://changed.invalid",
  );
  await f.manager.remove("owned");
  await f.flush();
  old.status = "connected";
  await f.flush();
  assert.equal(f.manager.connectedServersCache.length, 0);
});
test("tools/list_changed reindexes only current active slot and retains source short summary", async () => {
  const f = mcpManagerFixture({ scopes: { dynamic: { owned: server() } } });
  await f.manager.list();
  await f.flush();
  f.toolsChanged.next("owned");
  await f.flush();
  const tool = f.tools.get("mcp__owned__echo");
  assert.equal(tool.summary, "owned summary");
  assert.equal(tool.rawToolName, "echo");
  assert.equal(tool.serverName, "owned");
  assert.ok(f.events.filter((e) => e[0] === "index").length >= 2);
});
test("native settle wait handles name filters, abort and timeout without throwing", async () => {
  const f = mcpManagerFixture({ scopes: { dynamic: { owned: server() } } });
  await f.manager.list();
  const controller = new AbortController(),
    wait = f.manager.waitForPendingServers({
      names: ["owned"],
      signal: controller.signal,
      timeoutMs: 123,
    });
  await until(() => f.timers.size > 0);
  controller.abort();
  await wait;
  assert.equal(f.timers.size, 0);
  const filtered = f.manager.waitForPendingServers({
    names: ["other"],
    timeoutMs: 123,
  });
  await filtered;
  const timed = f.manager.waitForPendingServers({
    names: ["owned"],
    timeoutMs: 123,
  });
  await until(() => f.timers.size > 0);
  for (const callback of [...f.timers.values()]) callback();
  await timed;
  assert.equal(f.timers.size, 0);
  await f.flush();
});
test("native config shares inflight reads and invalidation rejects stale cache commits", async () => {
  const f = mcpManagerFixture(),
    pending = gate();
  let calls = 0;
  f.config.read = async () => {
    if (++calls === 1) {
      await pending.promise;
      return { old: server() };
    }
    return { latest: server() };
  };
  const one = f.config.list("project"),
    two = f.config.list("project");
  await until(() => calls === 1);
  f.config.invalidateFilesystemScopeCaches();
  const fresh = await f.config.list("project");
  pending.resolve();
  await Promise.all([one, two]);
  assert.deepEqual(Object.keys(fresh), ["latest"]);
  assert.deepEqual(Object.keys(await f.config.list("project")), ["latest"]);
  assert.equal(calls, 2);
});
test("reconcile revision queue stabilizes through config changes during a running projection", async () => {
  const f = mcpManagerFixture(),
    pending = gate();
  const original = f.config.list.bind(f.config);
  let first = true;
  f.config.list = async (scope?: string) => {
    if (scope === undefined && first) {
      first = false;
      await pending.promise;
    }
    return original(scope);
  };
  const one = f.manager.list(),
    two = f.manager.list();
  await Promise.resolve();
  await f.config.set("dynamic", { owned: server() });
  pending.resolve();
  await Promise.all([one, two]);
  await f.flush();
  assert.equal(f.manager.projectedRevision, f.manager.desiredRevision);
  assert.equal(f.manager.runtimeSlots.size, 1);
  assert.ok(f.manager.runtimeSlots.has("owned"));
});
test("native config normalization preserves explicit typed objects and original inference fields", () => {
  const f = mcpManagerFixture(),
    explicit = { type: "http", url: "owned", extra: true },
    value = f.config.normalizePartialData({
      explicit,
      stdio: { command: "owned", args: [], transparent_proxy: true },
      http: { url: "owned" },
      ide: { ideName: "owned", url: "ws://owned" },
      invalid: {},
    });
  assert.equal(value.explicit, explicit);
  assert.equal(value.stdio.type, "stdio");
  assert.equal(value.stdio.transparent_proxy, undefined);
  assert.equal(value.http.type, "http");
  assert.equal(value.ide.type, "ws-ide");
  assert.equal("invalid" in value, false);
});
test("native plugin reload invalidates cache and does not resurrect a shadowed plugin model", async () => {
  const f = mcpManagerFixture({
    scopes: {
      dynamic: { owned: server() },
      plugin: { owned: server(), old: server() },
    },
  });
  await f.manager.list();
  await f.flush();
  f.config.pluginManager.getActivePlugins = async () => [
    {
      plugin: { name: "owned-plugin" },
      components: { mcpServers: { owned: server(), fresh: server() } },
    },
  ];
  await f.manager.reloadPluginServers();
  await f.flush();
  assert.deepEqual(f.manager.getProjectedPluginServerNames(), ["fresh"]);
  assert.equal(f.models.get("owned", "plugin"), undefined);
  assert.equal(
    f.manager.connectedServersCache.some((v: any) => v.name === "old"),
    false,
  );
});
test("native filesystem deletion keeps original cached view until explicit scope invalidation", async () => {
  const f = mcpManagerFixture({ scopes: { project: { owned: server() } } });
  await f.config.list("project");
  await f.config.delete("project", "owned");
  assert.equal("owned" in f.store.read("project").mcpServers, false);
  assert.equal("owned" in (await f.config.list("project")), true);
  f.config.invalidateFilesystemScopeCaches();
  assert.equal("owned" in (await f.config.list("project")), false);
});
test("native toggle persists project disable in project scope and user disable in local scope", async () => {
  const f = mcpManagerFixture({
    scopes: { project: { project: server() }, user: { user: server() } },
  });
  await f.manager.list();
  await f.flush();
  await f.manager.toggleServer("project", false);
  await f.manager.toggleServer("user", false);
  await f.flush();
  assert.deepEqual(f.store.read("project").disabledMcpServers, ["project"]);
  assert.deepEqual(f.store.read("local").disabledMcpServers, ["user"]);
  await f.manager.toggleServer("project", true);
  await f.flush();
  assert.equal(f.manager.isServerDisabled("project"), false);
});
test("strict dynamic and setting source filters retain original special-scope read behavior", async () => {
  const f = mcpManagerFixture({
    scopes: { user: { owned: server() }, plugin: { plugin: server() } },
  });
  f.config.setStrictDynamic(true);
  assert.deepEqual(await f.config.list("user"), {});
  // read(PLUGIN) branches before shouldLoadFromFilesystem in the original source.
  assert.ok((await f.config.list("plugin")).plugin);
  f.config.setStrictDynamic(false);
  f.config.invalidateFilesystemScopeCaches({ includeUser: true });
  f.config.cliSettingSourcesProvider.getSettingScopes = async () => [];
  assert.deepEqual(await f.config.list("user"), {});
});
test("native config env expansion and diagnostics keep case/default/dedup/scope behavior", () => {
  const f = mcpManagerFixture({ env: { KNOWN: "present" } }),
    expand = new f.classes.McpConfigEnvExpandService();
  const result = expand.expandConfig(
    "owned",
    {
      type: "stdio",
      command: "${KNOWN}",
      args: ["${MISSING}", "${MISSING}", "${EMPTY:-fallback}", "${lower}"],
    },
    "project",
  );
  assert.deepEqual(result.config.args, [
    "${MISSING}",
    "${MISSING}",
    "fallback",
    "${lower}",
  ]);
  assert.equal(result.config.command, "present");
  assert.deepEqual(result.diagnostics[0].metadata.missingVars, ["MISSING"]);
  f.diagnostics.addDiagnostics(result.diagnostics);
  f.diagnostics.addDiagnostics(result.diagnostics);
  assert.equal(f.diagnostics.getDiagnosticCount(), 1);
  f.diagnostics.clearServerScopeDiagnostics("owned", "user");
  assert.equal(f.diagnostics.hasDiagnostics(), true);
  f.diagnostics.clearServerScopeDiagnostics("owned", "project");
  assert.equal(f.diagnostics.hasDiagnostics(), false);
});
test("native permission settings merge CLI over local and approval revokes disabled entries", async () => {
  const f = mcpManagerFixture({
    scopes: { project: { owned: server() } },
    settings: { enabledMcpjsonServers: ["owned"] },
    cliSettings: { disabledMcpjsonServers: ["owned"] },
  });
  assert.equal(await f.permissions.isAllowed("owned", "project"), false);
  assert.equal(await f.permissions.isAllowed("owned", "user"), true);
  await f.permissions.approve(["owned"]);
  assert.equal(
    (await f.settings.list("project-local")).disabledMcpjsonServers.length,
    0,
  );
  // The CLI override remains authoritative, as in the source.
  assert.equal(await f.permissions.isAllowed("owned", "project"), false);
});
test("native server model keeps stable state and duplicate status assignments do not emit", () => {
  const f = mcpManagerFixture(),
    one = f.models.create("user", "owned", server());
  let changes = 0;
  one.onDidChangeStatus(() => changes++);
  one.status = "connected";
  one.status = "connected";
  assert.equal(changes, 1);
  assert.equal(one.state(), one.state());
  assert.equal(one.state().length, 22);
  const high = f.models.create("sdk", "owned", server());
  assert.equal(f.models.get("owned"), high);
  f.models.delete("sdk", "owned");
  assert.equal(f.models.get("owned"), one);
});
test("native CLI config initializer reads owned inline JSON and strict flag only once", async () => {
  const f = mcpManagerFixture({
    argv: [
      "--strict-mcp-config",
      "--mcp-config",
      '{"mcpServers":{"owned":{"url":"http://owned.invalid"}}}',
    ],
  });
  f.initializer.initialize();
  f.initializer.initialize();
  await f.flush();
  assert.equal(f.config.strictDynamic, true);
  assert.equal(f.manager.nonInteractiveMode, true);
  assert.equal((await f.config.list("dynamic")).owned.type, "http");
  for (const [argv, isTTY, want] of [
    [["--prewarm"], false, false],
    [["--prewarm", "--mcp-config", "{}"], false, true],
    [["-p"], true, true],
    [[], true, false],
  ] as any) {
    const other = mcpManagerFixture({ argv, isTTY });
    assert.equal(other.ready.isHeadless(), want);
  }
});
test("native prompt lookup resolves title aliases and records source OAuth dependency calls", async () => {
  const f = mcpManagerFixture({
    scopes: { dynamic: { owned: server() } },
    hasTokens: true,
  });
  await f.manager.list();
  await f.flush();
  const prompt = await f.manager.getPrompt("owned", "Owned title", {
    text: "owned",
  });
  assert.equal(prompt.messages[0].content.text, "native");
  assert.equal(await f.manager.hasValidOAuthTokens("owned"), true);
  assert.equal(
    await f.manager.startOAuthFlow("owned", undefined),
    "https://owned.invalid/oauth",
  );
  await f.manager.invalidateOAuthCredentials("owned");
  assert.ok(f.events.some((e) => e[0] === "invalidate"));
});
test("native plugin registry replaces atomically, ignores invalid registrations and removes exact marketplace", () => {
  const f = mcpManagerFixture(),
    p = new f.classes.McpPluginRegistry();
  p.registerMany(["one", "two"], { pluginName: "owned", marketplaceName: "a" });
  p.register("other", { pluginName: "owned", marketplaceName: "b" });
  p.unregisterPlugin("owned", "a");
  assert.equal(p.get("one"), undefined);
  assert.equal(p.get("other").marketplaceName, "b");
  p.replace(
    new Map([
      ["fresh", { pluginName: "new" }],
      ["bad", {}],
    ]),
  );
  assert.equal(p.get("other"), undefined);
  assert.equal(p.get("bad"), undefined);
  assert.equal(p.get("fresh").marketplaceName, "");
});
test("native config store preserves JSONC and project-local nesting in an owned directory", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "mcp-manager-store-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const classes = createNativeMcpManagerRuntime({
      fs,
      env: {},
      dependencies: { logger: { debug() {} } },
      getHomeDir: () => root,
      getPlatformHomeDir: () => root,
      getWorkDir: () => root,
    }),
    store = new classes.McpConfigStore();
  await writeFile(
    join(root, ".mcp.json"),
    '// owned comment\n{"unrelated":7,"mcpServers":{},"disabledMcpServers":[]}',
  );
  store.update("project", {
    mcpServers: { owned: server() },
    disabledMcpServers: ["owned"],
  });
  const raw = await readFile(join(root, ".mcp.json"), "utf8");
  assert.match(raw, /owned comment/);
  assert.match(raw, /"unrelated":7/);
  store.update("local", {
    mcpServers: { local: server() },
    disabledMcpServers: [],
  });
  assert.equal(store.read("local").mcpServers.local.type, "http");
  store.delete("local");
  assert.deepEqual(store.read("local").mcpServers, {});
  assert.equal(store.read("project").mcpServers.owned.type, "http");
});

for (const allowed of [true, false])
  test(
    `real SDK projected deferred HTTP tool respects approval=${allowed} and removes it on connection denial`,
    { timeout: 15000 },
    async (t) => {
      const root = await mkdtemp(join(tmpdir(), "mcp-manager-sdk-")),
        peer = await ownedMcpHttp();
      let turn = 0;
      const approvals: string[] = [];
      const model: Model = {
        async getResponse() {
          return { output: [], usage: new Usage() };
        },
        async *getStreamedResponse() {
          const calls = [
              {
                name: "ToolSearch",
                arguments: JSON.stringify({ tool_names: ["mcp__owned__echo"] }),
              },
              {
                name: "DeferExecuteTool",
                arguments: JSON.stringify({
                  toolName: "mcp__owned__echo",
                  params: { text: "projected" },
                }),
              },
            ],
            call = calls[turn++];
          const output: any[] = call
            ? [
                {
                  type: "function_call",
                  id: "owned-" + turn,
                  callId: "owned-" + turn,
                  status: "completed",
                  ...call,
                },
              ]
            : [
                {
                  type: "message",
                  role: "assistant",
                  id: "owned-answer",
                  status: "completed",
                  content: [{ type: "output_text", text: "settled" }],
                },
              ];
          yield { type: "response_started" };
          yield {
            type: "response_done",
            response: {
              id: "owned-" + turn,
              usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
              output,
            },
          } as any;
        },
      };
      const h = await createHarness({
        workDir: root,
        stateDir: join(root, ".state"),
        recordReplayEnv: {},
        modelProvider: { getModel: () => model },
        nativeMcp: {
          env: {},
          projection: {
            scopes: {
              project: {
                owned: {
                  type: "http",
                  url: peer.url + "/mcp",
                  defer_loading: true,
                },
              },
            },
          },
        },
        approveTool: (name) => {
          approvals.push(name);
          return allowed;
        },
      });
      t.after(async () => {
        await h.close();
        await peer.close();
        await rm(root, { recursive: true, force: true });
      });
      const projection = h.nativeMcp!.projection;
      assert.throws(
        () => h.mcp.register({ name: "ignored" } as any),
        /projection/,
      );
      assert.throws(
        () => h.nativeMcp!.registerExternal({ name: "ignored" }),
        /projection/,
      );
      await projection.manager.list();
      await projection.drain();
      assert.equal(peer.requests.length, 0);
      assert.equal(h.mcp.connectedServers().length, 0);
      await projection.manager.allow(["owned"]);
      await projection.manager.waitForPendingServers({
        names: ["owned"],
        timeoutMs: 5000,
      });
      await projection.drain();
      const session = await h.openSession();
      assert.equal(
        await h.prompt(session, "owned deferred call"),
        allowed ? "settled" : "",
      );
      assert.equal(peer.calls.length, allowed ? 1 : 0);
      if (allowed) assert.equal(peer.calls[0].arguments.text, "projected");
      assert.deepEqual(approvals, ["mcp__owned__echo"]);
      await projection.manager.deny(["owned"]);
      await projection.drain();
      assert.equal(h.mcp.connectedServers().length, 0);
      assert.equal((await projection.manager.listTools("owned")).length, 0);
    },
  );

test("owned projection close clears listeners and blocks reconnects before pending immediates run", async () => {
  const host = createNativeMcpHost({
      getWorkDir: () => "/owned",
      getHomeProjectDir: () => "/owned/state",
      permissionUtils: {},
      dependencies: {},
    }),
    indexed = new Map();
  const projection = await createNativeMcpProjectionHost({
    serverHost: host,
    getHomeDir: () => "/owned/home",
    getWorkDir: () => "/owned/project",
    toolSearchService: {
      removeToolsByServer: (n: string) => indexed.delete(n),
      async indexTool(t: any) {
        indexed.set(t.name, t);
      },
    },
    deferToolConfigService: {
      async isToolDeferLoading() {
        return false;
      },
    },
  });
  host.attachProjection(projection);
  await projection.manager.add("owned", server(), "dynamic");
  await host.close();
  assert.equal(projection.closed, true);
  assert.equal(projection.ownedSubscriptionCount, 0);
  assert.equal(host.manager.underlyingCache.size, 0);
  await assert.rejects(projection.connect("late", server()), /closed/);
  await assert.rejects(host.connect("late", server()), /closed/);
});

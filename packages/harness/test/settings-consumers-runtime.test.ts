import assert from "node:assert/strict";
import test from "node:test";
import * as fs from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { EventEmitter } from "node:events";
import { BehaviorSubject } from "rxjs";
import { Usage, setTraceProcessors, type Model } from "@openai/agents-core";
import {
  createHarness,
  type HarnessOptions,
} from "../src/runtime/create-harness.js";
import { createNativeSettingsHost } from "../src/config/native-settings-host.js";
import { createOwnedSettingsFilesystem } from "../src/config/owned-settings-filesystem.js";
import { createNativeMcpHost } from "../src/mcp/native-mcp-host.js";
import { createNativeMcpProjectionHost } from "../src/mcp/native-mcp-projection-host.js";
import { ownedMcpHttp } from "./helpers/owned-mcp-http.js";
import { HarnessSession } from "../src/sessions/session.js";
setTraceProcessors([]);
async function owned(t: any) {
  const root = await fs.mkdtemp(join(tmpdir(), "settings-consumers-"));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  return root;
}
async function put(path: string, value: any) {
  await fs.mkdir(join(path, ".."), { recursive: true });
  await fs.writeFile(
    path,
    typeof value === "string" ? value : JSON.stringify(value),
  );
}
function gate() {
  let resolve!: (value?: any) => void;
  const promise = new Promise<any>((r) => (resolve = r));
  return { promise, resolve };
}
function model(call?: { name: string; input: any }): Model {
  let n = 0;
  return {
    async getResponse() {
      return { output: [], usage: new Usage() };
    },
    async *getStreamedResponse() {
      const output =
        ++n === 1 && call
          ? [
              {
                type: "function_call",
                id: "owned-call",
                callId: "owned-call",
                name: call.name,
                arguments: JSON.stringify(call.input),
                status: "completed",
              },
            ]
          : [
              {
                type: "message",
                role: "assistant",
                id: "m",
                status: "completed",
                content: [{ type: "output_text", text: "owned done" }],
              },
            ];
      yield { type: "response_started" } as any;
      yield {
        type: "response_done",
        response: {
          id: "owned",
          usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
          output,
        },
      } as any;
    },
  };
}
const opts = (
  root: string,
  extra: Partial<HarnessOptions> = {},
): HarnessOptions => ({
  workDir: root,
  stateDir: join(root, "state"),
  recordReplayEnv: {},
  productRuntime: { watch: false },
  modelProvider: { getModel: () => model() },
  ...extra,
});
const rules = (name: string) => [{ toolName: name }];
const update = (destination: string, type = "addRules", extra: any = {}) => ({
  type,
  destination,
  behavior: "allow",
  rules: rules("Read"),
  ...extra,
});
test("public session permission context exposes all nine original sources and independent Maps before host initialization", () => {
  const a = new HarnessSession("owned-a"),
    b = new HarnessSession("owned-b");
  const sources = [
    "policySettings",
    "flagSettings",
    "userSettings",
    "projectSettings",
    "localSettings",
    "cliArg",
    "command",
    "session",
    "sandbox",
  ];
  for (const k of ["allowRules", "denyRules", "askRules"] as const)
    assert.deepEqual(Object.keys(a.toolPermissionContext[k]), sources);
  assert.ok(
    a.toolPermissionContext.additionalWorkingDirectories instanceof Map,
  );
  assert.notEqual(
    a.toolPermissionContext.additionalWorkingDirectories,
    b.toolPermissionContext.additionalWorkingDirectories,
  );
  assert.equal(a.toolPermissionContext.isBypassPermissionsModeAvailable, true);
  assert.equal(a.toolPermissionContext.shouldAvoidPermissionPrompts, false);
});
test("native settings host owns a real default lock and scoped writes without requiring plugin startup", async (t) => {
  const root = await owned(t),
    h = createNativeSettingsHost({
      stateDir: join(root, "state"),
      getWorkDir: () => root,
      logger: {},
    });
  await h.start();
  try {
    await h.manager.set("owned", true, "user");
    assert.equal(
      JSON.parse(
        await fs.readFile(join(root, "state", "settings.json"), "utf8"),
      ).owned,
      true,
    );
    assert.equal(await h.manager.get("owned", "project"), undefined);
  } finally {
    await h.close();
  }
  assert.equal(h.pendingCount, 0);
  assert.equal(h.ownedHandleCount, 0);
  await assert.rejects(h.manager.set("late", true), /closed/);
});
test("public session initializes exact four native permission scopes before SessionStart", async (t) => {
  const root = await owned(t);
  await put(join(root, "state", "settings.json"), {
    permissions: { allow: ["Read"], deny: ["Bash"] },
  });
  await put(join(root, ".codebuddy", "settings.json"), {
    permissions: { allow: ["Write"] },
  });
  await put(join(root, ".codebuddy", "settings.local.json"), {
    permissions: { ask: ["Grep"] },
  });
  let hookContext: any;
  const h = await createHarness(
    opts(root, {
      nativeSettings: {
        cliOptions: { settings: '{"permissions":{"deny":["Edit"]}}' },
      },
      sessionLifecycle: {
        onSessionStart: async (s) => {
          hookContext = s.toolPermissionContext;
        },
      },
    }),
  );
  try {
    const s = await h.openSession();
    assert.equal(h.permissions.service.settingsManager, h.settingsManager);
    assert.equal(hookContext, s.toolPermissionContext);
    assert.deepEqual(s.toolPermissionContext.allowRules.userSettings, ["Read"]);
    assert.deepEqual(s.toolPermissionContext.allowRules.projectSettings, [
      "Write",
    ]);
    assert.deepEqual(s.toolPermissionContext.askRules.localSettings, ["Grep"]);
    assert.deepEqual(s.toolPermissionContext.denyRules.cliArg, ["Edit"]);
    assert.deepEqual(s.toolPermissionContext.denyRules.userSettings, ["Bash"]);
  } finally {
    await h.close();
  }
});
test("native explicit scope reads deliberately do not inherit setting-sources none merged filtering", async (t) => {
  const root = await owned(t);
  await put(join(root, ".codebuddy", "settings.json"), {
    permissions: { deny: ["Write"] },
  });
  const h = await createHarness(
    opts(root, {
      nativeSettings: {
        cliOptions: {
          settingSources: "none",
          settings: '{"permissions":{"allow":["Read"]}}',
        },
      },
    }),
  );
  try {
    assert.deepEqual(await h.settingsManager.get("permissions"), {
      allow: ["Read"],
    });
    const s = await h.openSession();
    assert.deepEqual(s.toolPermissionContext.denyRules.projectSettings, [
      "Write",
    ]);
    assert.deepEqual(s.toolPermissionContext.allowRules.cliArg, ["Read"]);
  } finally {
    await h.close();
  }
});
for (const [destination, relative] of [
  ["userSettings", "state/settings.json"],
  ["projectSettings", ".codebuddy/settings.json"],
  ["localSettings", ".codebuddy/settings.local.json"],
] as const)
  test(
    "native permission update persists and restarts " + destination,
    async (t) => {
      const root = await owned(t),
        path = join(root, relative);
      await put(path, '{/*owned-comment*/"permissions":{"deny":["Bash"]}}');
      const a = await createHarness(opts(root));
      try {
        const s = await a.openSession();
        await a.permissions.service.applyUpdate(s, update(destination));
        await a.settingsHost.flush();
        assert.match(await fs.readFile(path, "utf8"), /owned-comment/);
        assert.deepEqual(
          (
            await a.settingsManager.get(
              "permissions",
              {
                userSettings: "user",
                projectSettings: "project",
                localSettings: "project-local",
              }[destination],
            )
          ).allow,
          ["Read"],
        );
      } finally {
        await a.close();
      }
      const b = await createHarness(opts(root));
      try {
        const s = await b.openSession();
        assert.deepEqual(s.toolPermissionContext.allowRules[destination], [
          "Read",
        ]);
        assert.deepEqual(s.toolPermissionContext.denyRules[destination], [
          "Bash",
        ]);
      } finally {
        await b.close();
      }
    },
  );
test("native replace/remove rules, setMode and directory mutations use destination scope and retain duplicates on disk", async (t) => {
  const root = await owned(t),
    // This test isolates sequential permission transformations. The default
    // environment's fire-and-forget reads deliberately retain the source cache
    // race, covered with the complete original classes in product-environment.
    h = await createHarness(
      opts(root, { productRuntime: { watch: false, environment: false } }),
    );
  try {
    const s = await h.openSession();
    await h.settingsHost.flush();
    for (const value of [
      update("userSettings"),
      update("userSettings"),
      update("userSettings", "replaceRules", { rules: rules("Write") }),
      update("userSettings", "addRules"),
      update("userSettings", "removeRules", { rules: rules("Write") }),
      update("userSettings", "setMode", { mode: "acceptEdits" }),
      update("userSettings", "addDirectories", {
        directories: ["/owned/extra", "/owned/extra"],
      }),
      update("userSettings", "removeDirectories", {
        directories: ["/owned/missing"],
      }),
    ]) {
      await h.permissions.service.applyUpdate(s, value);
      // Flush the real owned SettingsHost; this is not a transaction guarantee.
      await h.settingsHost.flush();
    }
    const p = await h.settingsManager.get("permissions", "user");
    assert.deepEqual(p.allow, ["Read"]);
    assert.equal(p.defaultMode, "acceptEdits");
    assert.deepEqual(p.additionalDirectories, ["/owned/extra", "/owned/extra"]);
    assert.equal(s.permissionModeSubject.value, "acceptEdits");
  } finally {
    await h.close();
  }
});
test("native session and CLI destinations never become persistent files", async (t) => {
  const root = await owned(t),
    h = await createHarness(opts(root));
  try {
    const s = await h.openSession();
    for (const d of ["session", "cliArg"])
      await h.permissions.service.applyUpdate(s, update(d));
    assert.deepEqual(s.toolPermissionContext.allowRules.session, ["Read"]);
    assert.deepEqual(s.toolPermissionContext.allowRules.cliArg, ["Read"]);
    assert.equal(
      (await h.settingsManager.get("permissions", "user"))?.allow,
      undefined,
    );
    await assert.rejects(fs.access(join(root, "state", "settings.json")));
  } finally {
    await h.close();
  }
});
test("native corrupt scope refuses disk write while applyUpdate still changes in-memory context first", async (t) => {
  const root = await owned(t),
    file = join(root, ".codebuddy", "settings.local.json");
  await put(file, "{broken");
  const h = await createHarness(opts(root));
  try {
    const s = await h.openSession();
    await h.permissions.service.applyUpdate(s, update("localSettings"));
    assert.deepEqual(s.toolPermissionContext.allowRules.localSettings, [
      "Read",
    ]);
    assert.equal(await fs.readFile(file, "utf8"), "{broken");
    assert.equal(
      (await h.settingsManager.get("permissions", "project-local"))?.allow,
      undefined,
    );
  } finally {
    await h.close();
  }
});
test("owned scope write rejects an external symlink without rolling back native in-memory permission update", async (t) => {
  const root = await owned(t),
    project = join(root, "project"),
    outside = join(root, "outside.json");
  await fs.mkdir(join(project, ".codebuddy"), { recursive: true });
  await put(outside, { permissions: { deny: ["Bash"] } });
  await fs.symlink(outside, join(project, ".codebuddy", "settings.local.json"));
  const h = await createHarness(opts(project));
  try {
    const s = await h.openSession();
    await assert.rejects(
      h.permissions.service.applyUpdate(s, update("localSettings")),
      /symlink/,
    );
    assert.deepEqual(s.toolPermissionContext.allowRules.localSettings, [
      "Read",
    ]);
    assert.equal(
      JSON.parse(await fs.readFile(outside, "utf8")).permissions.allow,
      undefined,
    );
  } finally {
    await h.close();
  }
});
test("real SDK honors restarted native disk deny before human approval or handler I/O", async (t) => {
  const root = await owned(t),
    target = join(root, "must-not-exist");
  const a = await createHarness(opts(root));
  try {
    const s = await a.openSession();
    await a.permissions.service.applyUpdate(
      s,
      update("userSettings", "addRules", {
        behavior: "deny",
        rules: rules("Write"),
      }),
    );
  } finally {
    await a.close();
  }
  let approvals = 0;
  const m = model({
      name: "Write",
      input: { file_path: target, content: "denied" },
    }),
    b = await createHarness(
      opts(root, {
        nativePermissions: true,
        nativeApprovals: true,
        modelProvider: { getModel: () => m },
        approveTool: () => {
          approvals++;
          return true;
        },
      }),
    );
  try {
    const s = await b.openSession();
    await b.prompt(s, "owned denial only");
    await assert.rejects(fs.access(target));
    assert.equal(approvals, 0);
    assert.deepEqual(s.toolPermissionContext.denyRules.userSettings, ["Write"]);
  } finally {
    await b.close();
  }
});
test("native always-approval reaches persistent permission service and survives a new harness", async (t) => {
  const root = await owned(t),
    h = await createHarness(opts(root, { nativeApprovals: true }));
  try {
    const s = await h.openSession();
    const item: any = {
      rawItem: {
        type: "function_call",
        name: "Read",
        id: "owned",
        callId: "owned",
        arguments: JSON.stringify({ file_path: join(root, "a") }),
      },
    };
    await h.interruptions.nativeController!.toolAlwaysApprovalService.approve(
      s,
      item,
      "userSettings",
    );
    await h.interruptions.waitForPermissionWrites();
    assert.equal(h.interruptions.pendingPermissionWriteCount, 0);
    assert.deepEqual(
      (await h.settingsManager.get("permissions", "user")).allow,
      ["Read"],
    );
  } finally {
    await h.close();
  }
  const b = await createHarness(opts(root));
  try {
    assert.deepEqual(
      (await b.openSession()).toolPermissionContext.allowRules.userSettings,
      ["Read"],
    );
  } finally {
    await b.close();
  }
});
test("settings close drains old write and ConfigChange reads but rejects new work and expired async contexts", async (t) => {
  const root = await owned(t),
    state = join(root, "state"),
    io = createOwnedSettingsFilesystem(
      () => state,
      () => root,
    ),
    entered = gate(),
    release = gate(),
    later = gate(),
    observed = gate();
  let oldRead: any, h: any;
  h = createNativeSettingsHost({
    stateDir: state,
    getWorkDir: () => root,
    logger: {},
    configuration: {
      runtime: {
        fsPromises: {
          ...io,
          async writeFile(...args: any[]) {
            entered.resolve();
            await release.promise;
            return (io.writeFile as any)(...args);
          },
        },
      },
      dependencies: {
        hookManager: {
          async hasHooks() {
            return true;
          },
          async executeHooks() {
            oldRead = await h.manager.get("owned");
            void later.promise
              .then(() => h.manager.set("late", true))
              .then(
                () => observed.resolve("unexpected"),
                () => observed.resolve("closed"),
              );
          },
        },
      },
    },
  });
  await h.start();
  const write = h.manager.set("owned", true);
  await entered.promise;
  let ended = false;
  const closing = h.close().then(() => (ended = true));
  await assert.rejects(h.manager.set("new", true), /closed/);
  assert.equal(ended, false);
  release.resolve();
  await write;
  await closing;
  assert.equal(oldRead, true);
  later.resolve();
  assert.equal(await observed.promise, "closed");
  assert.equal(
    JSON.parse(await fs.readFile(join(state, "settings.json"), "utf8")).late,
    undefined,
  );
  assert.equal(h.pendingCount, 0);
});
test("harness close waits native fire-and-forget always-approval persistence", async (t) => {
  const root = await owned(t),
    state = join(root, "state"),
    io = createOwnedSettingsFilesystem(
      () => state,
      () => root,
    ),
    entered = gate(),
    release = gate();
  const h = await createHarness(
    opts(root, {
      nativeApprovals: true,
      nativeSettings: {
        runtime: {
          fsPromises: {
            ...io,
            async writeFile(...args: any[]) {
              entered.resolve();
              await release.promise;
              return (io.writeFile as any)(...args);
            },
          },
        },
      },
    }),
  );
  const s = await h.openSession(),
    item: any = {
      rawItem: {
        type: "function_call",
        name: "Read",
        id: "owned",
        callId: "owned",
        arguments: "{}",
      },
    };
  void h.interruptions.nativeController!.toolAlwaysApprovalService.approve(
    s,
    item,
    "userSettings",
  );
  await entered.promise;
  let ended = false;
  const close = h.close().then(() => (ended = true));
  await Promise.resolve();
  assert.equal(ended, false);
  release.resolve();
  await close;
  assert.deepEqual(
    JSON.parse(await fs.readFile(join(state, "settings.json"), "utf8"))
      .permissions.allow,
    ["Read"],
  );
  assert.equal(h.interruptions.pendingPermissionWriteCount, 0);
  assert.equal(h.permissions.pendingUpdateCount, 0);
  assert.equal(h.settingsHost.pendingCount, 0);
});
test("legacy external plugin adapter now has full owned settings, ConfigChange and CWD scope cache invalidation", async (t) => {
  const root = await owned(t),
    next = join(root, "next");
  const hook = join(root, "owned-hook.mjs"),
    out = join(root, "hook-input.json");
  await fs.writeFile(
    hook,
    'import{writeFileSync}from"node:fs";let text="";for await(const chunk of process.stdin)text+=chunk;writeFileSync(process.argv[2],text);',
  );
  const q = (v: string) => "'" + v.replaceAll("'", "'\\''") + "'";
  await put(join(root, "state", "settings.json"), {
    hooks: {
      ConfigChange: [
        {
          hooks: [
            {
              type: "command",
              command: `exec ${q(process.execPath)} ${q(hook)} ${q(out)}`,
            },
          ],
        },
      ],
    },
  });
  await put(join(root, ".codebuddy", "settings.json"), { owned: "old" });
  await put(join(next, ".codebuddy", "settings.json"), { owned: "new" });
  const external = {
    async getActivePlugins() {
      return [];
    },
  };
  const h = await createHarness(
    opts(root, { agentManager: { plugins: external } }),
  );
  try {
    assert.equal(h.pluginHost, undefined);
    assert.ok(h.settingsHost);
    assert.equal(await h.settingsManager.get("owned", "project"), "old");
    h.cwdService.setCwdState(next, true);
    assert.equal(await h.settingsManager.get("owned", "project"), "new");
    const s = await h.openSession();
    await h.permissions.service.applyUpdate(s, update("projectSettings"));
    await h.settingsHost.flush();
    const hookInput = JSON.parse(await fs.readFile(out, "utf8"));
    assert.equal(hookInput.source, "project_settings");
    assert.equal(
      hookInput.file_path,
      join(next, ".codebuddy", "settings.json"),
    );
    assert.deepEqual(
      JSON.parse(
        await fs.readFile(join(next, ".codebuddy", "settings.json"), "utf8"),
      ).permissions.allow,
      ["Read"],
    );
  } finally {
    await h.close();
  }
  assert.equal(h.settingsHost.ownedHandleCount, 0);
});
function wire() {
  const out = new EventEmitter() as any;
  out.write = () => true;
  return out;
}
test("SDK initialize uses real USER settings before an environment adapter failure", async (t) => {
  const root = await owned(t);
  const h = await createHarness(
    opts(root, {
      sdkControl: {
        stdout: wire(),
        initializeDependencies: {
          productEnvService: {
            async switch() {
              throw Error("owned switch failed");
            },
          },
        },
      },
    }),
  );
  try {
    assert.equal(h.sdkHandlers!.initializer.settingsManager, h.settingsManager);
    await assert.rejects(
      h.sdkHandlers!.initializer.handle(
        { request: { endpoint: "http://127.0.0.1:1/owned" } },
        new AbortController().signal,
      ),
      /owned switch failed/,
    );
    assert.equal(
      JSON.parse(
        await fs.readFile(join(root, "state", "settings.json"), "utf8"),
      ).enterpriseEndpoint,
      "http://127.0.0.1:1/owned",
    );
  } finally {
    await h.close();
  }
});
test("SDK set_model updates original CLI provider only, without SettingsManager change events or USER model persistence", async (t) => {
  const root = await owned(t),
    h = await createHarness(
      opts(root, { model: "initial-owned", sdkControl: { stdout: wire() } }),
    );
  let changes = 0;
  h.settingsManager.onDidChange(() => changes++);
  try {
    const s = await h.openSession();
    await h.sdkHandlers!.model.handle(
      { request: { session_id: s.id, model: "updated-owned" } },
      new AbortController().signal,
    );
    assert.equal(
      (await h.settingsHost.cli.getSettings()).model,
      "updated-owned",
    );
    assert.equal(await h.settingsManager.get("model", "cli"), "updated-owned");
    assert.equal(s.requestOptions.model, "updated-owned");
    assert.equal(changes, 0);
    assert.equal(await h.settingsManager.get("model", "user"), undefined);
  } finally {
    await h.close();
  }
});
test("custom SDK permission response drops unsupported permission updates rather than inventing persistence", async (t) => {
  const root = await owned(t),
    messages: any[] = [],
    out = wire();
  out.write = (line: string) => {
    messages.push(JSON.parse(line));
    return true;
  };
  const h = await createHarness(opts(root, { sdkControl: { stdout: out } }));
  try {
    const job = h.sdkControl!.permission.requestPermission(
      "Read",
      {},
      "owned-wire",
    );
    const request = messages.find((m) => m.type === "control_request");
    await h.sdkControl!.receive({
      type: "control_response",
      response: {
        subtype: "success",
        request_id: request.request_id,
        response: {
          allowed: true,
          updatedPermissions: [update("userSettings")],
        },
      },
    });
    const decision = await job;
    assert.equal(decision.allowed, true);
    assert.equal("updatedPermissions" in decision, false);
    assert.equal(
      (await h.settingsManager.get("permissions", "user"))?.allow,
      undefined,
    );
    assert.equal(h.permissions.pendingUpdateCount, 0);
  } finally {
    await h.close();
  }
});
test("explicit permission settings adapter retains priority rather than being guessed from readonly global override", async (t) => {
  const root = await owned(t),
    custom = {
      async get(k: string, scope?: string) {
        return k === "permissions" && scope === "user"
          ? { deny: ["Read"] }
          : {};
      },
      async set() {},
    };
  const h = await createHarness(
    opts(root, {
      settings: {
        async get(k) {
          return (k === "permissions" ? { deny: ["Bash"] } : undefined) as any;
        },
      },
      permissionHost: { settingsManager: custom },
    }),
  );
  try {
    const s = await h.openSession();
    assert.equal(h.permissions.service.settingsManager, custom);
    assert.deepEqual(s.toolPermissionContext.denyRules.userSettings, ["Read"]);
  } finally {
    await h.close();
  }
});
const server = (url: string) => ({
  type: "http",
  url: url + "/mcp",
  defer_loading: true,
});
test("project MCP approval and denial persist via the same settings manager across owned backend restarts", async (t) => {
  const root = await owned(t),
    peer = await ownedMcpHttp();
  t.after(() => peer.close());
  const make = () =>
    createHarness(
      opts(root, {
        nativeMcp: {
          env: {},
          projection: { scopes: { project: { owned: server(peer.url) } } },
        },
      }),
    );
  const a = await make();
  try {
    const p = a.nativeMcp!.projection;
    assert.equal(p.permissions.settingsManager, a.settingsManager);
    assert.equal(p.settingsHost, undefined);
    await p.manager.list();
    await p.drain();
    assert.equal(peer.requests.length, 0);
    await p.manager.allow(["owned"]);
    await p.manager.waitForPendingServers({
      names: ["owned"],
      timeoutMs: 5000,
    });
    await p.drain();
    assert.equal(a.mcp.connectedServers().length, 1);
    assert.deepEqual(
      JSON.parse(
        await fs.readFile(
          join(root, ".codebuddy", "settings.local.json"),
          "utf8",
        ),
      ).enabledMcpjsonServers,
      ["owned"],
    );
  } finally {
    await a.close();
  }
  const b = await make();
  try {
    const p = b.nativeMcp!.projection;
    await p.manager.list();
    await p.manager.waitForPendingServers({
      names: ["owned"],
      timeoutMs: 5000,
    });
    await p.drain();
    assert.equal(b.mcp.connectedServers().length, 1);
    await p.manager.deny(["owned"]);
    await p.drain();
    assert.equal(b.mcp.connectedServers().length, 0);
  } finally {
    await b.close();
  }
  const before = peer.requests.length,
    c = await make();
  try {
    const p = c.nativeMcp!.projection;
    await p.manager.list();
    await p.drain();
    assert.equal(c.mcp.connectedServers().length, 0);
    assert.equal(peer.requests.length, before);
    assert.deepEqual(
      JSON.parse(
        await fs.readFile(
          join(root, ".codebuddy", "settings.local.json"),
          "utf8",
        ),
      ).disabledMcpjsonServers,
      ["owned"],
    );
  } finally {
    await c.close();
  }
});
test("MCP explicit CLI denial remains authoritative after local approval and enable-all", async (t) => {
  const root = await owned(t),
    peer = await ownedMcpHttp();
  t.after(() => peer.close());
  const h = await createHarness(
    opts(root, {
      nativeSettings: {
        cliOptions: {
          settings:
            '{"disabledMcpjsonServers":["owned"],"enableAllProjectMcpServers":false}',
        },
      },
      nativeMcp: {
        env: {},
        projection: { scopes: { project: { owned: server(peer.url) } } },
      },
    }),
  );
  try {
    const p = h.nativeMcp!.projection;
    await p.manager.list();
    await p.manager.allow(["owned"]);
    await p.permissions.approveAll();
    await p.drain();
    assert.equal(await p.permissions.isAllowed("owned", "project"), false);
    assert.equal(peer.requests.length, 0);
    assert.deepEqual(
      (await h.settingsManager.list("project-local")).enabledMcpjsonServers,
      ["owned"],
    );
    assert.equal(
      (await p.permissions.getMcpSettings()).enableAllProjectMcpServers,
      false,
    );
  } finally {
    await h.close();
  }
});
async function independent(root: string, configuration: any = {}) {
  const host = createNativeMcpHost({
    getWorkDir: () => root,
    getHomeProjectDir: () => join(root, "state"),
    permissionUtils: {},
    dependencies: {},
    env: {},
  });
  const projection = await createNativeMcpProjectionHost({
    serverHost: host,
    getWorkDir: () => root,
    getHomeDir: () => join(root, "state"),
    toolSearchService: { removeToolsByServer() {} },
    deferToolConfigService: {},
    ...configuration,
  });
  host.attachProjection(projection);
  return { host, projection };
}
test("independent MCP projection now owns a persistent native settings host instead of a Map", async (t) => {
  const root = await owned(t);
  const a = await independent(root);
  try {
    assert.ok(a.projection.settingsHost);
    await a.projection.permissions.approve(["owned"]);
  } finally {
    await a.host.close();
  }
  assert.equal(a.projection.settingsHost!.ownedHandleCount, 0);
  await assert.rejects(a.projection.permissions.deny(["late"]), /closed/);
  const b = await independent(root);
  try {
    assert.deepEqual(
      (await b.projection.permissions.getMcpSettings()).enabledMcpjsonServers,
      ["owned"],
    );
  } finally {
    await b.host.close();
  }
});
test("independent projection CWD event invalidates project-local settings and releases borrowed observable subscriptions", async (t) => {
  const root = await owned(t),
    next = join(root, "next"),
    cwd = new BehaviorSubject(root);
  await put(join(root, ".codebuddy", "settings.local.json"), {
    enabledMcpjsonServers: ["old"],
  });
  await put(join(next, ".codebuddy", "settings.local.json"), {
    enabledMcpjsonServers: ["new"],
  });
  const { host, projection } = await independent(root, {
    getWorkDir: () => cwd.value,
    cwdService: { onDidChangeCwd: cwd },
  });
  try {
    assert.deepEqual(
      (await projection.permissions.getMcpSettings()).enabledMcpjsonServers,
      ["old"],
    );
    cwd.next(next);
    assert.deepEqual(
      (await projection.permissions.getMcpSettings()).enabledMcpjsonServers,
      ["new"],
    );
    assert.ok(cwd.observers.length > 0);
  } finally {
    await host.close();
  }
  assert.equal(cwd.observers.length, 0);
});
test("borrowed MCP settings adapter is used verbatim and is never closed by projection", async (t) => {
  const root = await owned(t),
    values: any = {};
  let closes = 0;
  const settings = {
    async list() {
      return values;
    },
    async set(k: string, v: any) {
      values[k] = v;
    },
    async close() {
      closes++;
    },
  };
  const { host, projection } = await independent(root, { settings });
  try {
    assert.equal(projection.settings, settings);
    assert.equal(projection.settingsHost, undefined);
    await projection.permissions.approve(["owned"]);
  } finally {
    await host.close();
  }
  assert.equal(closes, 0);
  assert.deepEqual(values.enabledMcpjsonServers, ["owned"]);
});
test("projection shutdown drains pending two-write approvals before closing its owned settings", async (t) => {
  const root = await owned(t),
    state = join(root, "state"),
    io = createOwnedSettingsFilesystem(
      () => state,
      () => root,
    ),
    entered = gate(),
    release = gate();
  let writes = 0;
  const { host, projection } = await independent(root, {
    settingsConfiguration: {
      runtime: {
        fsPromises: {
          ...io,
          async writeFile(...args: any[]) {
            if (++writes === 1) {
              entered.resolve();
              await release.promise;
            }
            return (io.writeFile as any)(...args);
          },
        },
      },
    },
  });
  const approval = projection.permissions.approve(["owned"]);
  await entered.promise;
  let ended = false;
  const close = host.close().then(() => (ended = true));
  await Promise.resolve();
  assert.equal(ended, false);
  release.resolve();
  await approval;
  await close;
  const saved = JSON.parse(
    await fs.readFile(join(root, ".codebuddy", "settings.local.json"), "utf8"),
  );
  assert.deepEqual(saved.enabledMcpjsonServers, ["owned"]);
  assert.deepEqual(saved.disabledMcpjsonServers, []);
  assert.equal(writes, 2);
  assert.equal(projection.settingsHost!.pendingCount, 0);
});
test("native MCP two-setting persistence keeps its first write when the second fails", async (t) => {
  const root = await owned(t),
    state = join(root, "state"),
    io = createOwnedSettingsFilesystem(
      () => state,
      () => root,
    );
  let writes = 0;
  const { host, projection } = await independent(root, {
    settingsConfiguration: {
      runtime: {
        fsPromises: {
          ...io,
          async writeFile(...args: any[]) {
            if (++writes === 2)
              throw Object.assign(Error("owned second write failed"), {
                code: "EIO",
              });
            return (io.writeFile as any)(...args);
          },
        },
      },
    },
  });
  try {
    await assert.rejects(
      projection.permissions.approve(["owned"]),
      /second write failed/,
    );
    const saved = JSON.parse(
      await fs.readFile(
        join(root, ".codebuddy", "settings.local.json"),
        "utf8",
      ),
    );
    assert.deepEqual(saved.enabledMcpjsonServers, ["owned"]);
    assert.equal(saved.disabledMcpjsonServers, undefined);
    assert.deepEqual(
      (await projection.permissions.getMcpSettings()).enabledMcpjsonServers,
      ["owned"],
    );
  } finally {
    await host.close();
  }
});
test("harness shutdown keeps shared settings alive until MCP approval completes both native writes", async (t) => {
  const root = await owned(t),
    state = join(root, "state"),
    io = createOwnedSettingsFilesystem(
      () => state,
      () => root,
    ),
    entered = gate(),
    release = gate();
  let writes = 0;
  const h = await createHarness(
    opts(root, {
      nativeMcp: { env: {} },
      nativeSettings: {
        runtime: {
          fsPromises: {
            ...io,
            async writeFile(...args: any[]) {
              if (++writes === 1) {
                entered.resolve();
                await release.promise;
              }
              return (io.writeFile as any)(...args);
            },
          },
        },
      },
    }),
  );
  const approval = h.nativeMcp!.projection.permissions.approve(["owned"]);
  await entered.promise;
  const close = h.close();
  release.resolve();
  await approval;
  await close;
  assert.equal(writes, 2);
  assert.deepEqual(
    JSON.parse(
      await fs.readFile(
        join(root, ".codebuddy", "settings.local.json"),
        "utf8",
      ),
    ).disabledMcpjsonServers,
    [],
  );
});
test("plugin teardown treats rejected consumer barrier as settled and still releases owned settings", async (t) => {
  const root = await owned(t),
    h = await createHarness(opts(root));
  try {
    await h.pluginHost!.close(Promise.reject(Error("owned consumer failed")));
    assert.equal(h.settingsHost.ownedHandleCount, 0);
    await assert.rejects(h.settingsManager.set("late", true), /closed/);
  } finally {
    await h.close();
  }
});

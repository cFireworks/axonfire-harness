import assert from "node:assert/strict";
import test from "node:test";
import * as fs from "node:fs";
import {
  mkdtemp,
  mkdir,
  rm,
  readFile,
  writeFile,
  access,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Usage, setTraceProcessors, type Model } from "@openai/agents-core";
import { createNativeSessionModes } from "../src/sessions/native-session-modes.js";
import { createNativeSessionAddons } from "../src/sessions/native-session-addons.js";
import { createSessionAddonHost } from "../src/sessions/session-addon-host.js";
import { createAddonSession } from "../src/runtime/create-addon-session.js";
import { createHarness } from "../src/runtime/create-harness.js";
import { ownedBuiltinAssets } from "../scripts/helpers/builtin-seed-fixtures.js";
setTraceProcessors([]);
const modes = createNativeSessionModes(),
  addons = createNativeSessionAddons();
async function owned(t: any) {
  const root = await mkdtemp(join(tmpdir(), "session-addons-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}
function model(requests: any[]): Model {
  return {
    async getResponse() {
      return { output: [], usage: new Usage() };
    },
    async *getStreamedResponse(request) {
      requests.push(request);
      yield { type: "response_started" } as any;
      yield {
        type: "response_done",
        response: {
          id: "owned",
          usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
          output: [
            {
              type: "message",
              role: "assistant",
              id: "m",
              status: "completed",
              content: [{ type: "output_text", text: "addon-ok" }],
            },
          ],
        },
      } as any;
    },
  };
}
const harnessOptions = (root: string, requests: any[] = []) => ({
  workDir: root,
  recordReplayEnv: {},
  productRuntime: { watch: false },
  modelProvider: { getModel: () => model(requests) },
});
test("native desired config preserves plan ceiling, historical welcome aliases and raw nonempty identity", () => {
  const value = modes.normalizeDesiredConfig({
    mode: "craft",
    permissionMode: "plan",
    permissionModeBeforePlan: "acceptEdits",
    welcomeMode: "working",
    runtimeIdentity: "  owned  ",
    sessionSettings: [],
    useSandboxCLI: false,
    sandboxDisabledReason: "bad",
  });
  assert.equal(value.permissionMode, "acceptEdits");
  assert.equal(value.welcomeMode, "work");
  assert.equal(value.runtimeIdentity, "  owned  ");
  assert.equal(value.sessionSettings, undefined);
  assert.equal(value.sandboxDisabledReason, undefined);
  assert.equal(
    modes.normalizeDesiredConfig({ mode: "plan", permissionMode: "fullAccess" })
      .permissionMode,
    "plan",
  );
  assert.equal(
    modes.normalizeDesiredConfig({ mode: "craft", permissionMode: "plan" })
      .permissionMode,
    "bypassPermissions",
  );
});
test("real SDK mode permission defaults retain source craft bypass and explicit default requires approval", async (t) => {
  const root = await owned(t);
  for (const permissionMode of [undefined, "default"]) {
    const target = join(root, permissionMode ?? "bypass");
    let turn = 0;
    const m: Model = {
      async getResponse() {
        return { output: [], usage: new Usage() };
      },
      async *getStreamedResponse() {
        const output =
          ++turn === 1
            ? [
                {
                  type: "function_call",
                  id: "owned-call",
                  callId: "owned-call",
                  name: "Write",
                  arguments: JSON.stringify({
                    file_path: target,
                    content: "owned write",
                  }),
                  status: "completed",
                },
              ]
            : [
                {
                  type: "message",
                  role: "assistant",
                  id: "done",
                  status: "completed",
                  content: [{ type: "output_text", text: "done" }],
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
    const a = await createAddonSession({
      harness: {
        ...harnessOptions(root),
        modelProvider: { getModel: () => m },
        approveTool: async () => false,
      },
      stateRoot: join(root, "backends"),
      sessionId: permissionMode ?? "bypass",
      desiredConfig: {
        mode: "craft",
        systemPrompt: "owned",
        tools: "Write",
        ...(permissionMode ? { permissionMode } : {}),
      },
    });
    try {
      await a.prompt("controlled owned file only");
      if (permissionMode) {
        await assert.rejects(access(target));
        assert.equal(a.session.permissionModeSubject.value, "default");
      } else {
        assert.equal(await readFile(target, "utf8"), "owned write");
        assert.equal(
          a.session.permissionModeSubject.value,
          "bypassPermissions",
        );
      }
    } finally {
      await a.close();
    }
  }
});
test("native ModeService uses craft prompt for plan and explicit fields override handler tools", async () => {
  const calls: any[] = [];
  const m = new modes.ModeService(
    {
      async renderSystemPrompt(v: any) {
        calls.push(v);
        return "owned";
      },
      async collectSystemPromptVariables() {
        return { a: "b" };
      },
    },
    { warn() {} },
  );
  const value = await m.resolveOptions({
    mode: "plan",
    tools: "Read",
    welcomeMode: "coding",
  });
  assert.equal(calls[0].mode, "craft");
  assert.equal(calls[0].welcomeMode, "code");
  assert.equal(value.tools, "Read");
  assert.equal(value.permissionMode, "plan");
  assert.deepEqual(value.promptContextVariables, { a: "b" });
  await assert.rejects(m.resolveOptions({ mode: "expert" }), /expertId/);
  const raw = { mode: "unknown", tools: "raw" };
  assert.equal(await m.resolveOptions(raw), raw);
});
test("native addon manifest hashes structure independently of generatedAt and stores prompt summary only", () => {
  const input = {
    sessionId: "owned",
    desiredConfig: { mode: "ask" },
    runtimeConfig: {
      systemPrompt: "owned secret text",
      tools: "Write,Read,Read",
      restartFingerprint: "base",
    },
  };
  const a = addons.buildSessionAddonManifest(input),
    b = createNativeSessionAddons({
      Date: class extends Date {
        constructor() {
          super(1);
        }
      },
    }).buildSessionAddonManifest(input);
  assert.equal(a.hash, b.hash);
  assert.notEqual(a.generatedAt, b.generatedAt);
  assert.equal(a.hash.length, 64);
  assert.doesNotMatch(JSON.stringify(a), /owned secret text/);
  assert.deepEqual(a.expanded.tools, ["Read", "Read", "Write"]);
  assert.equal(a.addons.systemPrompts[0].source, "work_mode");
  assert.deepEqual(a.expanded.hiddenContextSections, []);
  assert.deepEqual(a.expanded.mcpRuntime, []);
});
test("native work-mode expansion disables old modes but keeps arbitrary session plugin entries and null enable semantics", () => {
  const runtime = {
    sessionSettings: {
      enabledPlugins: {
        "interactionmode-plan@workbuddy-builtin": true,
        "welcomemode-work@workbuddy-builtin": true,
        "custom@owned": null,
        "off@owned": false,
      },
    },
    restartFingerprint: "base",
  };
  const a = addons.buildSessionAddonManifest({
    sessionId: "owned",
    desiredConfig: { welcomeMode: "code", mode: "ask" },
    runtimeConfig: runtime,
  });
  const applied = addons.applySessionAddonExpansionToRuntimeConfig(
    runtime,
    a.expanded,
  );
  assert.equal(
    applied.sessionSettings.enabledPlugins[
      "interactionmode-plan@workbuddy-builtin"
    ],
    false,
  );
  assert.equal(
    applied.sessionSettings.enabledPlugins[
      "welcomemode-work@workbuddy-builtin"
    ],
    false,
  );
  assert.equal(
    applied.sessionSettings.enabledPlugins[
      "interactionmode-ask@workbuddy-builtin"
    ],
    true,
  );
  assert.equal(applied.sessionSettings.enabledPlugins["custom@owned"], true);
  assert.equal(runtime.sessionSettings.enabledPlugins["custom@owned"], null);
  assert.ok(
    a.selected.enabledPluginIds.includes("prompt-common@workbuddy-builtin"),
  );
  assert.equal(a.addons.mcp[0].payloadSummary.serverName, "netdrive");
});
test("native pack resolver records unresolved micro-scenes rather than manufacturing plugin identifiers", () => {
  const p = addons.resolveAddonPacks({
    desiredConfig: {
      mode: "craft",
      expertId: "owned",
      addonSelection: {
        microSceneIds: ["x"],
        enabledPluginIds: [],
        projectResources: {
          connectorSkillIds: ["s"],
          mcpServerNames: ["m"],
          projectSkillNames: ["p"],
        },
      },
    },
    runtimeConfig: { welcomeMode: "design" },
  });
  assert.equal(p.selected.interactionMode, "expert");
  assert.equal(p.selected.welcomeMode, "design");
  assert.deepEqual(p.selected.microScenePluginIds, []);
  assert.ok(
    p.selected.validationWarnings.includes("micro_scene_plugin_ids_unresolved"),
  );
  assert.equal(p.packs[2].items.length, 3);
});
test("native persisted plugin context trims and sorts, excludes derived work modes and filters marketplace shape", () => {
  const c = addons.projectSessionPluginContext({
    addonSelection: {
      enabledPluginIds: [
        " z ",
        "z",
        " interactionmode-plan@workbuddy-builtin ",
      ],
      microSceneIds: [" b ", "a"],
    },
    sessionSettings: {
      enabledPlugins: {
        "welcomemode-code@workbuddy-builtin": true,
        " z ": false,
        bad: null,
      },
      extraKnownMarketplaces: {
        " own ": { source: "git", repo: " r ", ignored: 1 },
        bad: { source: "directory" },
      },
    },
  });
  assert.deepEqual(c.selectedPluginIds, ["z"]);
  assert.deepEqual(c.microSceneIds, ["a", "b"]);
  assert.deepEqual(c.pluginSettings.enabledPlugins, { z: false });
  assert.deepEqual(c.pluginSettings.extraKnownMarketplaces, {
    own: { source: "git", repo: "r" },
  });
  assert.equal(
    addons.parseSessionPluginContextJson('{"version":1}'),
    undefined,
  );
  assert.ok(
    addons.parseSessionPluginContextJson(
      addons.serializeSessionPluginContext(c),
    ),
  );
});
test("native legacy CLI handoff suppresses work-mode prompt/tools but retains explicit user choices", () => {
  for (const user of [false, true]) {
    const desiredConfig = user
      ? { systemPrompt: "user", tools: "Read" }
      : { mode: "ask" };
    const runtimeConfig = {
      systemPrompt: user ? "user" : "mode",
      tools: "Read,Write",
      permissionMode: "auto",
      sessionSettings: { trustedDirectories: ["old"] },
    };
    const manifest = addons.buildSessionAddonManifest({
      sessionId: "owned",
      desiredConfig,
      runtimeConfig,
    });
    const args = addons.buildAgentCliRuntimeArgs({
      runtimeConfig: { ...runtimeConfig, addonManifest: manifest },
      cwd: "/",
      systemPromptFile: "/owned/prompt",
      promptVarsFile: "/owned/vars",
      language: "zh",
      envRouteMode: "owned",
    });
    assert.equal(args.includes("--system-prompt-file"), user);
    assert.equal(args.includes("--tools"), user);
    assert.equal(args[1], "bypassPermissions");
    const settings = JSON.parse(args[args.indexOf("--settings") + 1]);
    // Original root path joins the fallback slash and '/**', yielding '//**'.
    assert.deepEqual(settings.trustedDirectories, ["//**"]);
    assert.equal(settings.language, "zh");
    assert.equal(settings.envRouteMode, "owned");
    assert.ok(args.includes("--prompt-vars-file"));
  }
});
test("native prompt-vars repair handles missing, invalid JSON, changed content and nonfile boundaries", async (t) => {
  const root = await owned(t),
    a = createNativeSessionAddons({ os: { tmpdir: () => root } }),
    vars = { owned: "value" },
    path = a.getAgentCliPromptVarsFilePath("owned");
  assert.equal(
    a.ensureAgentCliPromptVarsFile("owned", null, vars).status,
    "restored",
  );
  assert.equal(
    a.ensureAgentCliPromptVarsFile("owned", path, vars).status,
    "healthy",
  );
  await writeFile(path, "bad");
  assert.equal(
    a.ensureAgentCliPromptVarsFile("owned", path, vars).reason,
    "invalid_json",
  );
  await writeFile(
    path,
    JSON.stringify({ version: 1, variables: { owned: "changed" } }),
  );
  assert.equal(
    a.ensureAgentCliPromptVarsFile("owned", path, vars).reason,
    "content_mismatch",
  );
  await rm(path);
  await mkdir(path);
  assert.throws(
    () => a.ensureAgentCliPromptVarsFile("owned", path, vars),
    (e: any) => e.code === 11109 && e.data.reason === "not_file",
  );
  assert.throws(
    () => a.ensureAgentCliPromptVarsFile("owned", "/outside", vars),
    (e: any) => e.code === 11109 && e.data.reason === "path_mismatch",
  );
  assert.deepEqual(a.ensureAgentCliPromptVarsFile("owned", null, {}), {
    status: "not_required",
    filePath: null,
  });
});
test("native resolver is session-local, selects Claw payment disable and filters nonstring variables", async () => {
  const h = createSessionAddonHost({
    resolveClawCwd: () => "/owned/Claw",
    systemPromptService: {
      async renderSystemPrompt() {
        return "owned";
      },
      async collectSystemPromptVariables() {
        return { kept: "v", drop: 1 };
      },
    },
  });
  try {
    const a = await h.resolve({
        sessionId: "a",
        cwd: "/owned/Claw",
        desiredConfig: { mode: "plan" },
      }),
      b = await h.resolve({
        sessionId: "b",
        cwd: "/owned/other",
        desiredConfig: { mode: "ask" },
      });
    assert.equal(a.permissionMode, "plan");
    assert.deepEqual(a.promptVariables, { kept: "v" });
    assert.equal(
      a.sessionSettings.enabledPlugins["weixinpay@workbuddy-builtin"],
      false,
    );
    assert.equal(
      b.sessionSettings.enabledPlugins["weixinpay@workbuddy-builtin"],
      undefined,
    );
    assert.notEqual(a.restartFingerprint, b.restartFingerprint);
  } finally {
    await h.close();
  }
});
test("addon host close owns pending resolution and rejects new work without pretending to cancel borrowed resolvers", async () => {
  let release!: (v: any) => void;
  const p = new Promise<any>((r) => (release = r));
  const h = createSessionAddonHost({
    resolver: {
      async resolveConfig() {
        return p;
      },
    },
  });
  const job = h.resolve({
    sessionId: "owned",
    cwd: "/owned",
    desiredConfig: {},
  });
  let ended = false;
  const closing = h.close().then(() => {
    ended = true;
  });
  await Promise.resolve();
  assert.equal(ended, false);
  release({ restartFingerprint: "owned" });
  await job;
  await closing;
  assert.equal(h.pendingCount, 0);
  await assert.rejects(
    h.resolve({ sessionId: "x", cwd: "/owned", desiredConfig: {} }),
    /closed/,
  );
});
test("explicit new session identifier preserves startup and rejects traversal, duplicate and resume ambiguity", async (t) => {
  const root = await owned(t),
    reasons: string[] = [];
  const h = await createHarness({
    ...harnessOptions(root),
    stateDir: join(root, "state"),
    sessionLifecycle: {
      onSessionStart: async (_s, r) => {
        reasons.push(r);
      },
    },
  });
  t.after(() => h.close());
  const s = await h.openSession(undefined, { sessionId: "owned-seeded" });
  assert.equal(s.id, "owned-seeded");
  assert.deepEqual(reasons, ["startup"]);
  await assert.rejects(
    h.openSession(undefined, { sessionId: "owned-seeded" }),
    /already exists/,
  );
  await assert.rejects(
    h.openSession(undefined, { sessionId: "../outside" }),
    /safe identifier/,
  );
  await assert.rejects(
    h.openSession("owned-seeded", { sessionId: "other" }),
    /cannot accompany resume/,
  );
  const simultaneous = await Promise.allSettled([
    h.openSession(undefined, { sessionId: "owned-concurrent" }),
    h.openSession(undefined, { sessionId: "owned-concurrent" }),
  ]);
  assert.equal(simultaneous.filter((r) => r.status === "fulfilled").length, 1);
});
test("native cwd precheck rejects missing/non-directory inputs before backend startup", async (t) => {
  const root = await owned(t),
    file = join(root, "file");
  await writeFile(file, "owned");
  await assert.rejects(
    addons.assertSessionCwdUsable(file),
    (e: any) =>
      e.code === "SESSION_CWD_UNAVAILABLE" &&
      e.data.reason === "not_a_directory",
  );
  await assert.rejects(
    createAddonSession({
      harness: harnessOptions(join(root, "missing")),
      stateRoot: join(root, "state"),
      desiredConfig: {},
    }),
    (e: any) =>
      e.code === "SESSION_CWD_UNAVAILABLE" && e.data.reason === "missing",
  );
  await assert.rejects(access(join(root, "state")));
});
test("addon backend ownership canonicalizes aliased state roots and refuses symlink session entries", async (t) => {
  const root = await owned(t),
    state = join(root, "state"),
    alias = join(root, "alias");
  await mkdir(state);
  await fs.promises.symlink(state, alias);
  const base = {
    harness: harnessOptions(root),
    sessionId: "owned",
    stateRoot: state,
    desiredConfig: { systemPrompt: "owned" },
  };
  const a = await createAddonSession(base);
  try {
    await assert.rejects(
      createAddonSession({ ...base, stateRoot: alias }),
      /already open/,
    );
    await fs.promises.symlink(join(state, "owned"), join(state, "linked"));
    await assert.rejects(
      createAddonSession({ ...base, sessionId: "linked" }),
      /cannot be a symlink/,
    );
  } finally {
    await a.close();
  }
});
test("real SDK mode change rebuilds an owned backend instead of reusing stale global agent state", async (t) => {
  const root = await owned(t),
    assets = await modeAssets(root),
    requests: any[] = [];
  const make = (mode: string, resume = false) =>
    createAddonSession({
      harness: {
        ...harnessOptions(root, requests),
        nativePlugins: { builtinSeed: { assetsRoot: assets.assets } },
      },
      stateRoot: join(root, "state"),
      sessionId: "owned-changing",
      resume,
      desiredConfig: { mode, welcomeMode: "code" },
    });
  const a = await make("ask");
  try {
    await a.prompt("first");
    assert.match(requests.at(-1).systemInstructions, /Owned interaction ask/);
  } finally {
    await a.close();
  }
  const b = await make("craft", true);
  try {
    await b.prompt("second");
    assert.match(requests.at(-1).systemInstructions, /Owned interaction craft/);
    assert.doesNotMatch(
      requests.at(-1).systemInstructions,
      /Owned interaction ask/,
    );
    assert.ok(JSON.stringify(requests.at(-1).input).includes("first"));
  } finally {
    await b.close();
  }
});
test("real SDK addon backend consumes explicit prompt variables, repairs file before prompt and removes only owned temp files on close", async (t) => {
  const root = await owned(t),
    requests: any[] = [];
  const a = await createAddonSession({
    harness: harnessOptions(root, requests),
    stateRoot: join(root, "backends"),
    sessionId: "owned-explicit",
    desiredConfig: {
      mode: "ask",
      systemPrompt: "Owned variable {{ addonOwned }}",
      tools: "Read",
    },
    addons: {
      systemPromptService: {
        async renderSystemPrompt() {
          throw Error("explicit prompt must avoid render");
        },
        async collectSystemPromptVariables() {
          return { addonOwned: "from resolver" };
        },
      },
    },
  });
  const vars = a.cliArgs[a.cliArgs.indexOf("--prompt-vars-file") + 1]!;
  try {
    await rm(vars);
    assert.equal(await a.prompt("owned"), "addon-ok");
    assert.match(
      requests.at(-1).systemInstructions,
      /Owned variable from resolver/,
    );
    assert.equal(a.session.options.tools, "Read");
    assert.equal(a.session.id, a.manifest.sessionId);
    assert.equal(a.session.permissionModeSubject.value, "default");
    assert.equal(
      JSON.parse(await readFile(vars, "utf8")).variables.addonOwned,
      "from resolver",
    );
  } finally {
    await a.close();
  }
  await assert.rejects(access(a.tempDir));
  assert.equal(a.owner.pendingCount, 0);
  await assert.rejects(a.prompt("after close"), /closed/);
  await access(join(root, "backends", "owned-explicit"));
});
test("addon backend guards duplicate ownership and releases failed resolution for retry", async (t) => {
  const root = await owned(t),
    base = {
      harness: harnessOptions(root),
      stateRoot: join(root, "backends"),
      sessionId: "owned",
      desiredConfig: { mode: "expert" },
    };
  await assert.rejects(
    createAddonSession({
      ...base,
      addons: {
        systemPromptService: {
          async renderSystemPrompt() {
            return "owned";
          },
        },
      },
    }),
    /expertId/,
  );
  const a = await createAddonSession({
    ...base,
    desiredConfig: { mode: "ask", systemPrompt: "owned" },
  });
  try {
    await assert.rejects(
      createAddonSession({ ...base, desiredConfig: {} }),
      /already open/,
    );
    await a.prompt("owned persisted turn");
  } finally {
    await a.close();
  }
  const b = await createAddonSession({
    ...base,
    resume: true,
    desiredConfig: { mode: "ask", systemPrompt: "owned" },
  });
  await b.close();
});
async function modeAssets(root: string) {
  const a = await ownedBuiltinAssets(root, [
    { name: "welcomemode-code", version: "1.0.0", category: "template" },
    { name: "interactionmode-ask", version: "1.0.0", category: "mode" },
    { name: "interactionmode-craft", version: "1.0.0", category: "mode" },
    { name: "prompt-common", version: "1.0.0", category: "template" },
  ]);
  const dir = join(a.market, "plugins", "welcomemode-code");
  await a.put(
    join(dir, "settings.json"),
    JSON.stringify({ agent: "owned-root" }),
  );
  await a.put(
    join(dir, "agents", "root.md"),
    '---\nname: owned-root\ndescription: owned root\ntools: [Read]\n---\nOwned welcome code {% if interactionMode == "ask" %}ASK{% else %}CRAFT{% endif %}',
  );
  for (const mode of ["ask", "craft"])
    await a.put(
      join(
        a.market,
        "plugins",
        "interactionmode-" + mode,
        "fragments",
        "interaction.md",
      ),
      "---\ntools: [Read]\n---\nOwned interaction " + mode,
    );
  return a;
}
test("real SDK parallel mode backends select owned builtin template/fragment without persisting global mode settings", async (t) => {
  const root = await owned(t),
    assets = await modeAssets(root),
    requestsA: any[] = [],
    requestsB: any[] = [];
  const create = (mode: string, requests: any[]) =>
    createAddonSession({
      harness: {
        ...harnessOptions(root, requests),
        nativePlugins: { builtinSeed: { assetsRoot: assets.assets } },
      },
      stateRoot: join(root, "backends"),
      sessionId: "owned-" + mode,
      desiredConfig: { mode, welcomeMode: "code" },
    });
  const [a, b] = await Promise.all([
    create("ask", requestsA),
    create("craft", requestsB),
  ]);
  try {
    await Promise.all([a.prompt("owned ask"), b.prompt("owned craft")]);
    assert.match(requestsA.at(-1).systemInstructions, /Owned welcome code ASK/);
    assert.match(requestsA.at(-1).systemInstructions, /Owned interaction ask/);
    assert.doesNotMatch(
      requestsA.at(-1).systemInstructions,
      /Owned interaction craft/,
    );
    assert.match(
      requestsB.at(-1).systemInstructions,
      /Owned welcome code CRAFT/,
    );
    assert.match(
      requestsB.at(-1).systemInstructions,
      /Owned interaction craft/,
    );
    assert.notEqual(a.harness.product.raw, b.harness.product.raw);
    assert.equal(
      (await a.harness.settingsManager!.get("enabledPlugins", "cli"))[
        "interactionmode-ask@workbuddy-builtin"
      ],
      true,
    );
    assert.equal(
      (await b.harness.settingsManager!.get("enabledPlugins", "cli"))[
        "interactionmode-craft@workbuddy-builtin"
      ],
      true,
    );
    for (const h of [a, b]) {
      const user: any = await h.harness.settingsManager!.get(
        "enabledPlugins",
        "user",
      );
      assert.notEqual(user?.["interactionmode-ask@workbuddy-builtin"], true);
      assert.notEqual(user?.["welcomemode-code@workbuddy-builtin"], true);
      assert.equal(h.cliArgs.includes("--tools"), false);
    }
  } finally {
    await Promise.all([a.close(), b.close()]);
  }
});

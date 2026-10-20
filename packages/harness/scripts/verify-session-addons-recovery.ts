import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { parse } from "acorn";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { nodesOf } from "./helpers/captured-product-sources.js";
import {
  emittedSession,
  loadCapturedSessionAddons,
  SESSION_ADDON_SAMPLES,
} from "./helpers/captured-session-addons.js";
import { createNativeSessionModes } from "../src/sessions/native-session-modes.js";
import {
  createNativeSessionAddons,
  SESSION_ADDON_RESOLVE_MEMBER,
} from "../src/sessions/native-session-addons.js";
const main =
  process.env.WORKBUDDY_DESKTOP_INITIALIZE ??
  resolve(dirname(getCapturedBundlePath()), "../../main/initialize.js");
const coordinator =
  process.env.WORKBUDDY_MODE_COORDINATOR ??
  resolve(dirname(main), "workbuddy-auth-product-coordinator.js");
const sources = {
  addons: await readFile(main, "utf8"),
  modes: await readFile(coordinator, "utf8"),
};
const captured = loadCapturedSessionAddons(sources);
function ast(v: any): any {
  if (!v || typeof v !== "object") return v;
  return Array.isArray(v)
    ? v.map(ast)
    : Object.fromEntries(
        Object.entries(v)
          .filter(([k]) => !["start", "end", "raw"].includes(k))
          .map(([k, v]) => [k, ast(v)]),
      );
}
let fullFunctions = 0,
  classMembers = 0,
  constantInitializers = 0,
  comparisons = 0;
for (const name of ["modes", "addons"] as const) {
  const sample = SESSION_ADDON_SAMPLES[name],
    ports = nodesOf(
      parse(emittedSession(name), {
        ecmaVersion: "latest",
        sourceType: "module",
      }),
    );
  for (const [fn, start, end] of sample.functions) {
    const original: any = parse(sources[name].slice(start, end), {
      ecmaVersion: "latest",
    }).body[0];
    assert.deepEqual(
      ast(
        ports.find(
          (n) => n.type === "FunctionDeclaration" && n.id?.name === fn,
        ),
      ),
      ast(original),
      fn,
    );
    fullFunctions++;
  }
  for (const [v, start, end] of [...sample.classes, ...sample.constants]) {
    const original: any = parse(sources[name].slice(start, end), {
      ecmaVersion: "latest",
    }).body[0];
    const port = ports.find(
      (n) =>
        n.type === "VariableDeclaration" && n.declarations?.[0]?.id?.name === v,
    );
    assert.deepEqual(ast(port), ast(original), v);
    if (original.declarations[0].init?.type === "ClassExpression")
      classMembers += original.declarations[0].init.body.body.length;
    else constantInitializers++;
  }
  if (name === "addons") {
    const original: any = (
      parse(
        "class X{" +
          sources.addons.slice(...SESSION_ADDON_RESOLVE_MEMBER) +
          "}",
        { ecmaVersion: "latest" },
      ).body[0] as any
    ).body.body[0];
    assert.deepEqual(
      ast(
        ports.find(
          (n) =>
            n.type === "MethodDefinition" &&
            n.key?.name === "resolveRuntimeConfig",
        ),
      ),
      ast(original),
    );
    classMembers++;
  }
}
class FixedDate extends Date {
  constructor(value: any = 1700000000000) {
    super(value);
  }
  static now() {
    return 1700000000000;
  }
}
function fixture(original: boolean) {
  const modes = original ? captured.modes() : createNativeSessionModes();
  const addons = (original ? captured.addons : createNativeSessionAddons)({
    modes,
    Date: FixedDate,
    resolveClawCwd: () => "/owned/Claw",
  });
  return { modes, addons };
}
const f = [fixture(false), fixture(true)];
function same(values: any[]) {
  assert.deepEqual(values[0], values[1]);
  comparisons++;
}
function both(fn: (f: any) => any) {
  same(f.map(fn));
}
for (const mode of [
  undefined,
  "craft",
  "ask",
  "plan",
  "expert",
  "invalid",
  "Plan",
  "",
]) {
  both((f) => [
    f.modes.resolveModeTools(mode),
    f.modes.normalizeSceneMode(mode),
    f.modes.resolveDefaultPermissionMode(mode),
  ]);
  for (const permissionMode of [
    undefined,
    "plan",
    "bypassPermissions",
    "fullAccess",
    "default",
    "acceptEdits",
    "auto",
    "bad",
  ])
    both((f) =>
      f.modes.normalizeDesiredConfig({
        mode,
        permissionMode,
        permissionModeBeforePlan: "acceptEdits",
        welcomeMode: "working",
        runtimeIdentity: "  identity  ",
        useSandboxCLI: false,
        sandboxDisabledReason: "security-center-setting-disabled",
      }),
    );
}
for (const welcome of [
  undefined,
  null,
  "code",
  "work",
  "design",
  "coding",
  "working",
  "CODE",
  "",
])
  both((f) => [
    f.modes.normalizeWelcomeMode(welcome),
    f.modes.isSessionWelcomeMode(welcome),
    f.modes.toLegacySourceMode(welcome),
  ]);
for (const value of [
  undefined,
  null,
  [],
  {},
  "",
  {
    version: 1,
    interactionMode: "craft",
    welcomeMode: "coding",
    microSceneIds: ["b", 1, "b", ""],
    enabledPluginIds: ["x", false],
    projectResources: [],
  },
  { version: 2, interactionMode: "ask" },
  { version: 1, interactionMode: 1 },
])
  both((f) => f.modes.normalizeAddonSelection(value));
const contexts: any[] = [
  undefined,
  null,
  [],
  {},
  { version: 2 },
  { version: 1 },
  {
    version: 1,
    selectedPluginIds: [" z ", "x", "x", 1, ""],
    microSceneIds: [" b ", "a"],
    projectResources: {
      connectorSkillIds: ["s"],
      mcpServerNames: ["m"],
      projectSkillNames: ["p"],
    },
    pluginSettings: {
      enabledPlugins: { " x ": true, bad: null, " f ": false },
      extraKnownMarketplaces: {
        " own ": {
          source: "git",
          repo: " x ",
          url: " y ",
          autoUpdate: false,
          ignored: 1,
        },
        bad: { source: "directory" },
      },
    },
  },
];
for (const context of contexts)
  both((f) => {
    const a = f.addons;
    const encoded = a.serializeSessionPluginContext(context);
    return [
      a.normalizeSessionPluginContext(context),
      encoded,
      a.parseSessionPluginContextJson(encoded),
      a.parseSessionPluginContextJson("{bad"),
      a.parseSessionPluginContextJson(JSON.stringify(context)),
    ];
  });
for (const welcomeMode of [undefined, "code", "work", "design", "unknown"])
  for (const mode of ["craft", "ask", "plan", "expert", "unknown"])
    for (const sessionSettings of [
      undefined,
      {
        enabledPlugins: {
          "interactionmode-plan@workbuddy-builtin": true,
          "welcomemode-work@workbuddy-builtin": true,
          "kept@owned": null,
          "off@owned": false,
        },
      },
      {
        enabledPlugins: [],
        extraKnownMarketplaces: {
          owned: { source: "git", url: "http://owned.invalid" },
        },
      },
    ]) {
      both((f) => {
        const a = f.addons,
          desiredConfig = {
            mode,
            welcomeMode,
            expertId: mode === "expert" ? "owned-expert" : undefined,
            addonSelection: {
              interactionMode: mode,
              welcomeMode,
              microSceneIds: ["micro"],
              enabledPluginIds: ["extra@owned"],
              projectResources: {
                connectorSkillIds: ["x"],
                mcpServerNames: ["m"],
                projectSkillNames: ["p"],
              },
            },
          };
        const runtimeConfig = {
          restartFingerprint: "base",
          systemPrompt: "fixed owned",
          tools: "Write, Read,Read,,",
          sessionSettings,
        };
        const manifest = a.buildSessionAddonManifest({
          sessionId: "owned",
          desiredConfig,
          runtimeConfig,
        });
        const expanded = a.applySessionAddonExpansionToRuntimeConfig(
          runtimeConfig,
          manifest.expanded,
        );
        return [
          manifest,
          expanded,
          a.buildAgentCliRuntimeArgs({
            runtimeConfig: { ...expanded, addonManifest: manifest },
            cwd: "/owned/project/",
            systemPromptFile: "/owned/prompt",
            promptVarsFile: "/owned/vars",
            mcpConfig: "/owned/mcp",
            language: "zh",
            envRouteMode: "owned",
          }),
        ];
      });
    }
for (const explicit of [false, true])
  for (const prompt of [undefined, "", "owned prompt"])
    both((f) => {
      const a = f.addons;
      const desiredConfig = {
        systemPrompt: explicit ? prompt : undefined,
        tools: explicit ? "Read" : undefined,
      };
      const runtimeConfig = {
        systemPrompt: prompt,
        tools: "Read,Write",
        permissionMode: "auto",
        sessionSettings: { trustedDirectories: ["old"] },
      };
      const manifest = a.buildSessionAddonManifest({
        sessionId: "owned",
        desiredConfig,
        runtimeConfig,
      });
      return [
        a.shouldSuppressLegacySystemPrompt({
          ...runtimeConfig,
          addonManifest: manifest,
        }),
        a.shouldSuppressLegacyTools({
          ...runtimeConfig,
          addonManifest: manifest,
        }),
        a.buildAgentCliRuntimeArgs({
          runtimeConfig: { ...runtimeConfig, addonManifest: manifest },
          cwd: "/",
          mcpConfig: "owned",
          systemPromptFile: "owned-file",
        }),
      ];
    });
for (const d of [
  {
    mode: "ask",
    sessionSettings: {
      enabledPlugins: {
        "prompt-common@workbuddy-builtin": true,
        " x ": true,
        y: false,
      },
    },
  },
  {
    addonSelection: {
      enabledPluginIds: [
        " interactionmode-ask@workbuddy-builtin ",
        " x ",
        " x ",
      ],
      microSceneIds: [" y "],
      projectResources: {
        connectorSkillIds: [],
        mcpServerNames: [],
        projectSkillNames: [],
      },
    },
  },
])
  both((f) => {
    const c = f.addons.projectSessionPluginContext(d);
    return [
      c,
      f.addons.buildSessionSettingsFromPluginContext(c),
      f.addons.buildAddonSelectionFromPluginContext(c, "code", "ask"),
    ];
  });
for (const mode of ["craft", "ask", "plan", "expert", "unknown"])
  for (const cwd of ["/owned/project", "/owned/Claw"]) {
    const results = [];
    for (const { modes, addons } of f) {
      const logs: any[] = [],
        calls: any[] = [];
      const promptService = {
        initialize: async () => {},
        cleanup: async () => {},
        async renderSystemPrompt(v: any) {
          calls.push(["render", v]);
          return "owned " + v.mode;
        },
        async collectSystemPromptVariables(v: any) {
          calls.push(["vars", v]);
          return { owned: "value", number: 1 };
        },
      };
      const resolver = Object.assign(new addons.NativeSessionAddonResolver(), {
        runtimeConfigResolver: addons.createSessionRuntimeConfigResolver(
          Promise.resolve({
            systemPromptService: promptService,
            logger: {
              info: (v: any) => logs.push(v),
              warn: (v: any) => logs.push(v),
            },
          }),
        ),
      });
      const desiredConfig = modes.normalizeDesiredConfig({
        mode,
        expertId: mode === "expert" ? "owned-expert" : undefined,
        permissionMode: "acceptEdits",
        welcomeMode: "coding",
        sessionSettings: {
          enabledPlugins: { "weixinpay@workbuddy-builtin": true },
        },
      });
      const resolved = await resolver.resolveRuntimeConfig({
        sessionId: "owned",
        cwd,
        desiredConfig,
        currentRuntimeConfig: null,
      });
      results.push([resolved, calls, logs]);
    }
    same(results);
  }
for (const original of [false, true]) {
  const { modes } = fixture(original),
    m = new modes.ModeService(
      {
        renderSystemPrompt: async () => "",
        collectSystemPromptVariables: async () => ({}),
      },
      { warn() {} },
    );
  await assert.rejects(
    m.resolveOptions({ mode: "expert" }),
    /expertId is required/,
  );
}
for (const state of [
  "missing",
  "healthy",
  "invalid_json",
  "invalid_payload",
  "content_mismatch",
  "not_file",
  "unreadable",
  "write_error",
  "path_mismatch",
]) {
  const results = [];
  for (const original of [false, true]) {
    const files = new Map<string, any>(),
      vars = { owned: "v" },
      path = "/owned-tmp/workbuddy-prompt-vars/owned.prompt-vars.json";
    if (state === "healthy")
      files.set(path, JSON.stringify({ version: 1, variables: vars }));
    if (state === "invalid_json") files.set(path, "bad");
    if (state === "invalid_payload") files.set(path, "[]");
    if (state === "content_mismatch")
      files.set(
        path,
        JSON.stringify({ version: 1, variables: { owned: "wrong" } }),
      );
    if (state === "not_file") files.set(path, { directory: true });
    if (state === "unreadable") files.set(path, Error("owned read error"));
    const io = {
      mkdirSync() {},
      statSync(p: string) {
        if (!files.has(p))
          throw Object.assign(Error("owned missing"), { code: "ENOENT" });
        return { isFile: () => !files.get(p)?.directory };
      },
      readFileSync(p: string) {
        const v = files.get(p);
        if (v instanceof Error) throw v;
        return v;
      },
      writeFileSync(p: string, v: any) {
        if (state === "write_error")
          throw Object.assign(Error("owned write failure"), { code: "EACCES" });
        if (files.get(p)?.directory)
          throw Object.assign(Error("owned directory"), { code: "EISDIR" });
        files.set(p, v);
      },
      unlinkSync(p: string) {
        files.delete(p);
      },
    };
    const a = (original ? captured.addons : createNativeSessionAddons)({
      fs: io,
      os: { tmpdir: () => "/owned-tmp" },
    });
    let out;
    try {
      out = a.ensureAgentCliPromptVarsFile(
        "owned",
        state === "path_mismatch" ? "/outside" : path,
        vars,
      );
    } catch (e: any) {
      out = { name: e.name, message: e.message, code: e.code, data: e.data };
    }
    results.push([
      out,
      [...files].map(([k, v]) => [k, v instanceof Error ? v.message : v]),
    ]);
  }
  same(results);
}
for (const errno of [
  "ENOENT",
  "ENOTDIR",
  "EACCES",
  "EPERM",
  "EIO",
  undefined,
]) {
  const values = [];
  for (const original of [false, true]) {
    const a = (original ? captured.addons : createNativeSessionAddons)({
      fs: {
        promises: {
          async stat() {
            throw Object.assign(Error("owned stat"), { code: errno });
          },
        },
        constants: { R_OK: 4, X_OK: 1 },
      },
    });
    let error;
    try {
      await a.assertSessionCwdUsable("/owned/missing");
    } catch (e: any) {
      error = { code: e.code, name: e.name, data: e.data };
    }
    values.push(error);
  }
  same(values);
}
console.log(
  JSON.stringify({
    fullFunctions,
    classMembers,
    constantInitializers,
    comparisons,
    desktopBootstrapExecuted: false,
  }),
);

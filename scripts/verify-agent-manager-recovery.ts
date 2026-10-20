import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parse } from "acorn";
import ts from "typescript";
import nunjucks from "nunjucks";
import { loadCapturedAgentManager } from "./helpers/captured-agent-manager.js";
import { agentManagerFixture } from "./helpers/agent-manager-fixtures.js";
import { turn } from "./helpers/session-result-fixtures.js";
import { AgentManagerImpl } from "../src/agents/native-agent-manager.js";
import { agentManagerConstants } from "../src/agents/native-agent-manager-runtime.js";
import * as specs from "../src/tools/native-tool-specs.js";
import { DeferToolConfigServiceImpl } from "../src/tools/defer-tool-config-service.js";
import { NativeAgentPermissionUtils } from "../src/agents/native-agent-permission-utils.js";
import { createAgentMarkdownUtils } from "../src/agents/native-agent-markdown.js";
import { createPluginAgentComposer } from "../src/agents/plugin-agent-compose.js";
import {
  CapturedYaml,
  CAPTURED_YAML_MODULE_IDS,
} from "../src/vendor/captured-yaml.js";
import { substituteLoadTimeVariables } from "../src/commands/skill-product-provider.js";
const source = await readFile(
  process.argv[2] ??
    new URL(
      "../../../work/workbuddy-app/cli/dist/codebuddy.js",
      import.meta.url,
    ),
  "utf8",
);
const original = loadCapturedAgentManager(source);
let comparisons = 0;
const norm = (v: any): any =>
  typeof v === "function"
    ? "[function]"
    : v === undefined
      ? "[undefined]"
      : v === null
        ? null
        : typeof v === "bigint"
          ? String(v)
          : typeof v === "number" && !Number.isFinite(v)
            ? String(v)
            : Object.prototype.toString.call(v) === "[object RegExp]"
              ? String(v)
              : Object.prototype.toString.call(v) === "[object Error]"
                ? { name: v.name, message: v.message }
                : Object.prototype.toString.call(v) === "[object Map]"
                  ? Array.from(v, ([k, x]: any) => [norm(k), norm(x)])
                  : Object.prototype.toString.call(v) === "[object Set]"
                    ? Array.from(v, norm)
                    : Array.isArray(v)
                      ? Array.from(v, norm)
                      : typeof v === "object"
                        ? Object.fromEntries(
                            Object.keys(v)
                              .sort()
                              .map((k) => [k, norm(v[k])]),
                          )
                        : v;
const eq = (a: any, b: any, label: string) => {
  assert.deepEqual(norm(a), norm(b), label);
  comparisons++;
};
const outcome = async (fn: () => any) => {
  try {
    return { value: await fn() };
  } catch (error) {
    return { error };
  }
};
const strip = (n: any): any =>
  Array.isArray(n)
    ? n.map(strip)
    : n && typeof n === "object"
      ? Object.fromEntries(
          Object.entries(n)
            .filter(([k]) => !["start", "end", "raw"].includes(k))
            .map(([k, v]) => [k, strip(v)]),
        )
      : n;
const parseAll = (s: string) => {
  const list: any[] = [];
  const visit = (n: any) => {
    if (!n || typeof n !== "object") return;
    list.push(n);
    for (const [k, v] of Object.entries(n))
      if (!["start", "end"].includes(k)) {
        if (Array.isArray(v)) v.forEach(visit);
        else if (v && typeof v === "object") visit(v);
      }
  };
  visit(parse(s, { ecmaVersion: "latest", sourceType: "module" }));
  return list;
};
const portSource = async (file: string) =>
  ts.transpileModule(
    await readFile(new URL("../src/" + file, import.meta.url), "utf8"),
    {
      compilerOptions: {
        target: ts.ScriptTarget.ESNext,
        module: ts.ModuleKind.ESNext,
      },
    },
  ).outputText;
const managerTransform = (s: string) =>
  s
    .replaceAll("process.env", "this.runtime.env")
    .replaceAll("Date.now()", "this.runtime.now()")
    .replaceAll("setTimeout(", "this.runtime.setTimeout(")
    .replaceAll("clearTimeout(", "this.runtime.clearTimeout(")
    .replaceAll("getProfiler()", "this.runtime.getProfiler()")
    .replaceAll("composePluginAgent(", "this.runtime.composePluginAgent(")
    .replaceAll(
      "Av.ContainerUtil.get(AT.DelegateToolManager).hasTools()",
      "this.runtime.hasDelegateTools()",
    )
    .replaceAll(
      "eu.buildSkillsFingerprint",
      "AgentManagerImpl.buildSkillsFingerprint",
    )
    .replaceAll(
      "(0,AK.isPlanModeDisabled)()",
      "this.runtime.planGates.isPlanModeDisabled()",
    )
    .replaceAll(
      "(0,AK.isExitPlanModeVisibleForSession)(em)",
      "this.runtime.planGates.isExitPlanModeVisibleForSession(em)",
    );
// Full-body structural comparison, not just interface names or selected literals.
async function verifyClass(
  file: string,
  name: string,
  p: number,
  transform = (s: string) => s,
  subset?: string[],
) {
  const ports = parseAll(await portSource(file)),
    port = ports.find(
      (n) => n.type === "ClassDeclaration" && n.id?.name === name,
    );
  assert.ok(port, name);
  const methods = original
    .cls(p)
    .body.body.filter(
      (n: any) =>
        n.kind !== "constructor" && (!subset || subset.includes(n.key.name)),
    );
  for (const method of methods) {
    const expected = parseAll(
      "class Owned{" + transform(original.text(method)) + "}",
    ).find((n) => n.type === "MethodDefinition");
    const actual = port.body.body.find(
      (n: any) =>
        n.type === "MethodDefinition" &&
        n.key.name === method.key.name &&
        n.static === method.static,
    );
    eq(
      strip(actual),
      strip(expected),
      name + "." + method.key.name + " full method AST",
    );
  }
  return methods.length;
}
const managerMethodCount = await verifyClass(
  "agents/native-agent-manager.ts",
  "AgentManagerImpl",
  7025790,
  managerTransform,
);
const managerPortNodes = parseAll(
  await portSource("agents/native-agent-manager.ts"),
);
const managerPortClass = managerPortNodes.find(
  (n) => n.type === "ClassDeclaration" && n.id?.name === "AgentManagerImpl",
);
const constructorBody = managerPortClass.body.body.find(
  (n: any) => n.kind === "constructor",
).value.body.body;
eq(
  strip(constructorBody.at(-1)),
  strip(
    original
      .cls(7025790)
      .body.body.find((n: any) => n.kind === "constructor")
      .value.body.body.at(-1),
  ),
  "all native constructor field initializers",
);
for (const declaration of parseAll(original.prefix).filter(
  (n) => n.type === "VariableDeclarator",
))
  eq(
    strip(
      managerPortNodes.find(
        (n) =>
          n.type === "VariableDeclarator" && n.id?.name === declaration.id.name,
      )?.init,
    ),
    strip(declaration.init),
    "native manager constant/prompt " + declaration.id.name,
  );
const specNodes = parseAll(await portSource("tools/native-tool-specs.ts"));
for (const fn of original.nodes.filter(
  (n) =>
    n.type === "FunctionDeclaration" && ["parseSingleToolSpec", "parseToolSpecs", "augmentParsedSpecsForDefer", "globToRegExp"].includes(n.id?.name) && n.start > 12198397 && n.end < 12204000,
))
  eq(
    strip(
      specNodes.find(
        (n) => n.type === "FunctionDeclaration" && n.id?.name === fn.id.name,
      ),
    ),
    strip(fn),
    "complete native spec function " + fn.id.name,
  );
await verifyClass(
  "tools/defer-tool-config-service.ts",
  "DeferToolConfigServiceImpl",
  12005567,
  (s) => s.replaceAll("process.env", "this.runtime.env"),
);
await verifyClass(
  "agents/native-agent-permission-utils.ts",
  "NativeAgentPermissionUtils",
  13340680,
  (s) => s,
  ["matchPermissionRules", "extractWholeToolRules", "isScopedPermission"],
);
await verifyClass(
  "agents/native-agent-markdown.ts",
  "MarkdownUtils",
  13249670,
  (s) => s,
  ["extractFrontMatterFull", "parseListField", "splitByCommaRespectingBraces"],
);
await verifyClass("tools/native-tool-specs.ts", "ToolDeferOverlay", 12201200);
const portCompose = parseAll(
  await portSource("agents/plugin-agent-compose.ts"),
);
for (const fn of parseAll(original.composeSource).filter(
  (n) => n.type === "FunctionDeclaration",
)) {
  const transformed = original.composeSource
    .slice(fn.start, fn.end)
    .replaceAll("(0,A$.readFileSync)", "runtime.readFileSync")
    .replaceAll("(0,A$.existsSync)", "runtime.existsSync")
    .replaceAll("AH.MarkdownUtils.", "runtime.markdown.")
    .replaceAll(
      "(0,Az.substituteLoadTimeVariables)",
      "runtime.substituteLoadTimeVariables",
    );
  eq(
    strip(
      portCompose.find(
        (n) => n.type === "FunctionDeclaration" && n.id.name === fn.id.name,
      ),
    ),
    strip(parseAll(transformed).find((n) => n.type === "FunctionDeclaration")),
    fn.id.name + " complete function AST",
  );
}
for (const [key, value] of Object.entries(agentManagerConstants))
  eq(value, original.constants[key], "native constant " + key);
// Original YAML factories are byte-preserved, not replaced by a different package release.
const vendor = await readFile(
  new URL("../src/vendor/captured-yaml.ts", import.meta.url),
  "utf8",
);
const vendorMap = parseAll(vendor).find(
  (n) => n.type === "VariableDeclarator" && n.id?.name === "modules",
).init;
eq(
  vendorMap.properties.map((p: any) => p.key.value),
  CAPTURED_YAML_MODULE_IDS,
  "YAML manifest",
);
for (const entry of vendorMap.properties) {
  const native = original.modules.get(entry.key.value);
  eq(
    vendor.slice(entry.value.start, entry.value.end),
    source.slice(native.value.start, native.value.end),
    "YAML exact factory " + entry.key.value,
  );
}
for (const input of [
  "a: 1\nb: [x, y]",
  "a: &anchor {x: 2}\nb: *anchor",
  "a: yes\nb: true\nc: 2020-01-01",
  "tools: [Read, NoDefer(Bash)]",
  "a: |\n  line one\n  line two",
  "[bad:",
  "---\nx: .nan\ny: .inf\nz: null",
])
  eq(
    await outcome(() => CapturedYaml.parse(input)),
    await outcome(() => original.yaml.parse(input)),
    "YAML parse " + input,
  );
const markdown = createAgentMarkdownUtils(CapturedYaml.parse);
for (const input of [
  "plain",
  "---\ntools: [Read, Bash]\n---\nBody",
  "---\ntools: [bad\n---\nBody",
  "---\n- list\n---\nBody",
])
  eq(
    markdown.extractFrontMatterFull(input),
    original.markdown.extractFrontMatterFull(input),
    "frontmatter",
  );
for (const input of [
  undefined,
  [],
  [" Read ", "Bash"],
  "Read,Glob({a,b}),,Bash",
  "{a,{b,c}},d",
])
  eq(
    await outcome(() => markdown.parseListField(input)),
    await outcome(() => original.markdown.parseListField(input)),
    "Markdown list",
  );
for (const rules of [
  undefined,
  [],
  ["Read", " Bash ", "mcp__owned__x", "Read(*.md)"],
  ["Read(*)", "READ", "Read(.md)", "*", "R*", "Read("],
]) {
  eq(
    NativeAgentPermissionUtils.extractWholeToolRules(rules),
    original.permission.extractWholeToolRules(rules),
    "whole deny",
  );
  eq(
    NativeAgentPermissionUtils.matchPermissionRules(rules, [
      "read",
      "bash",
      "r*",
    ]),
    original.permission.matchPermissionRules(rules, ["read", "bash", "r*"]),
    "permission match",
  );
}
for (const input of [
  "",
  "Read",
  " NoDefer ( Bash ) ",
  "Defer(mcp__*__read)",
  "NoDefer(Defer(Read))",
  "Read(x)",
  "Defer()",
  "Defer(Read",
  "A,B",
  "*",
])
  eq(
    await outcome(() => specs.parseSingleToolSpec(input)),
    await outcome(() => original.specs.parseSingleToolSpec(input)),
    "single tool spec " + input,
  );
for (const list of [
  [],
  ["Read", "Read"],
  ["Defer(Read)", "NoDefer(Read)", "Read"],
  ["bad(", "NoDefer(Bash)", "Defer(mcp__*)"],
])
  for (const lenient of [false, true]) {
    const a = await outcome(() => specs.parseToolSpecs(list, { lenient })),
      b = await outcome(() => original.specs.parseToolSpecs(list, { lenient }));
    eq(a, b, "spec warning/strict");
    if (a.value) {
      eq(
        specs.augmentParsedSpecsForDefer(a.value),
        original.specs.augmentParsedSpecsForDefer(b.value),
        "augment",
      );
      const x = specs.ToolDeferOverlay.merge(a.value.overlay),
        y = original.specs.ToolDeferOverlay.merge(b.value.overlay);
      for (const name of [
        "Read",
        "Bash",
        "ToolSearch",
        "mcp__owned__read",
        "mcp__other__write",
      ])
        eq(
          [x.isEmpty(), x.decide(name)],
          [y.isEmpty(), y.decide(name)],
          "overlay decide " + name,
        );
    }
  }
for (const env of [undefined, "true", " FALSE ", "1", "0", "yes", ""])
  for (const setting of [undefined, false, true])
    for (const feature of [undefined, false, true]) {
      const runtime: any = {
        env:
          env === undefined
            ? {}
            : {
                CODEBUDDY_DEFER_TOOL_LOADING: env,
                CODEBUDDY_SHOW_ALL_DEFERRED_TOOLS: env,
              },
        dependencies: {
          settingsManager: { get: async () => setting },
          productManager: {
            waitConfiguration: async () => ({
              productFeatures: { DeferToolLoading: feature },
            }),
          },
        },
      };
      const a = new DeferToolConfigServiceImpl(runtime),
        b = original.defer(runtime);
      eq(
        [await a.isGlobalDeferLoadingEnabled(), a.shouldShowAllTools()],
        [await b.isGlobalDeferLoadingEnabled(), b.shouldShowAllTools()],
        "defer precedence",
      );
    }
for (const config of [
  {},
  { alwaysLoad: true, defer_loading: true },
  { defer_loading: false },
  { tools: { read: { defer_loading: false } }, defer_loading: true },
])
  for (const overlay of [
    undefined,
    specs.parseToolSpecs(["Defer(read)"]).overlay,
    specs.parseToolSpecs(["Defer(*)", "NoDefer(read)"]).overlay,
  ]) {
    const runtime: any = {
        env: {},
        dependencies: {
          settingsManager: { get: async () => undefined },
          productManager: { waitConfiguration: async () => ({}) },
        },
      },
      a = new DeferToolConfigServiceImpl(runtime),
      b = original.defer(runtime);
    eq(
      await a.isToolDeferLoadingWithOverlay(
        specs.ToolDeferOverlay.merge(overlay),
        config,
        "read",
        "server__read",
      ),
      await b.isToolDeferLoadingWithOverlay(
        original.specs.ToolDeferOverlay.merge(overlay),
        config,
        "read",
        "server__read",
      ),
      "MCP defer precedence",
    );
  }
function pair(extra: any = {}) {
  return [
    agentManagerFixture(undefined, extra),
    agentManagerFixture(original.manager, extra),
  ] as const;
}
// Cross-realm Promise assimilation changes interleaving among parallel agent
// builds. Compare effect multiplicity/values here; race/barrier cases below
// assert causality explicitly instead of asserting one arbitrary schedule.
const bag = (values: any[]) =>
  values
    .map(norm)
    .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
function snapshot(f: any) {
  return {
    ready: f.manager.ready,
    names: [...f.manager.agentMap.keys()],
    configs: [...f.manager.agentConfigMap],
    models: [...f.manager.modelMap],
    hash: f.manager.lastConfigHash,
    nonModelHash: f.manager.lastNonModelConfigHash,
    patched: f.manager.agentsWithPatchedTools,
    events: bag(f.events),
    logs: bag(f.logs),
  };
}
async function both(
  label: string,
  operation: (f: any) => any,
  extra: any = {},
) {
  const [a, b] = pair(extra);
  eq(
    await outcome(() => operation(a)),
    await outcome(() => operation(b)),
    label + " result",
  );
  await turn();
  await turn();
  eq(snapshot(a), snapshot(b), label + " state/effects");
  return [a, b] as const;
}
await both("eager startup/model defaults", async (f) => {
  eq(await f.manager.getAll(), [], "not built before init");
  await f.start();
  return {
    all: (await f.manager.getAll()).map((a: any) => [
      a.name,
      a.tools.map((t: any) => t.name),
      a.mcpServers.map((s: any) => s.name),
    ]),
    missing: await f.manager.get("missing"),
    default: (await f.manager.getDefault()).name,
    config: await f.manager.getAgentConfig("main"),
    model: await f.manager.getModel("main"),
    variant: await f.manager.getModel("Explore"),
    customModels: await f.manager.getModels("custom"),
    commands: await f.manager.getCommands("main"),
  };
});
await both(
  "fingerprint skips then force builds (including native collisions)",
  async (f) => {
    await f.start();
    const first = await f.manager.getDefault();
    f.configuration.models[0].name = "changed";
    await f.manager.rebuildAgents();
    const same = first === (await f.manager.getDefault());
    f.configuration.models.pop();
    await f.manager.rebuildAgents();
    const retained = f.manager.modelMap.has("custom:a");
    f.configuration.agents[0].instructions = "x".repeat(32) + "a";
    await f.manager.rebuildAgents();
    const second = await f.manager.getDefault();
    f.configuration.agents[0].instructions = "x".repeat(32) + "b";
    await f.manager.rebuildAgents();
    const collision = second === (await f.manager.getDefault());
    await f.manager.refreshAgents();
    return {
      same,
      retained,
      collision,
      forced: second !== (await f.manager.getDefault()),
    };
  },
);
await both("pending forced rebuild coalescing", async (f) => {
  await f.start();
  const originalBuild = f.manager.buildAgentsFromProductConfiguration.bind(
    f.manager,
  );
  let release: any;
  const gate = new Promise((r) => (release = r));
  let builds = 0;
  f.manager.buildAgentsFromProductConfiguration = async (force: any) => {
    builds++;
    if (builds === 1) await gate;
    return originalBuild(force);
  };
  const current = f.manager.rebuildAgents();
  await f.manager.rebuildAgents();
  await f.manager.rebuildAgents(true);
  const pending = [f.manager.pendingRebuild, f.manager.pendingForceRebuild];
  const settled = f.manager.waitForRebuildSettled(0);
  release();
  await current;
  await settled;
  return {
    pending,
    builds,
    flags: [
      f.manager.rebuilding,
      f.manager.pendingRebuild,
      f.manager.pendingForceRebuild,
    ],
    timers: f.timers.pending.size,
  };
});
await both(
  "failed initial build opens readiness and forced refresh rethrows",
  async (f) => {
    f.runtime.dependencies.factory.create = async () => {
      throw Error("owned factory failure");
    };
    await f.start();
    return {
      ready: f.manager.ready,
      default: await outcome(() => f.manager.getDefault()),
      refresh: await outcome(() => f.manager.refreshAgents()),
    };
  },
);
await both("bounded rebuild settle disposes timeout/listener", async (f) => {
  await f.start();
  f.manager.rebuilding = true;
  const settled = f.manager.waitForRebuildSettled(17);
  await f.timers.fire();
  await settled;
  f.manager.rebuilding = false;
  return f.timers.calls;
});
await both(
  "placeholder model barrier resolves only after real model snapshot",
  async (f) => {
    f.configuration.models = [{ id: "default-model-owned" }];
    f.configuration.agents[0].models = ["default-model-owned"];
    await f.start();
    let resolved = false;
    const models = f.manager.getModels("main").then((v: any) => {
      resolved = true;
      return v;
    });
    await turn();
    const before = resolved;
    f.configuration.models = [{ id: "ready-model" }];
    f.configuration.agents[0].models = ["ready-model"];
    await f.manager.rebuildAgents();
    return {
      before,
      models: await models,
      barrier: !!f.manager.modelsReadyDeferred,
    };
  },
);
await both(
  "custom tools, handoff filters and source model-less factory options",
  async (f) => {
    f.configuration.agents[0].handoffs = ["Explore"];
    f.configuration.agents[1].parameters = JSON.stringify({
      type: "object",
      properties: { prompt: { type: "string" } },
    });
    f.configuration.agents.push({
      name: "scoped",
      tags: ["cli", "custom"],
      instructions: "scoped",
      tools: ["mcp__owned__read"],
      models: [],
    });
    await f.start();
    const root = await f.manager.getDefault(),
      handoff = root.handoffs[0],
      target = handoff.agent;
    target.prompt = "owned handoff prompt";
    const input = {
      runContext: "context",
      inputHistory: ["prior"],
      preHandoffItems: ["pre"],
      newItems: ["new"],
    };
    return {
      tools: root.tools.map((t: any) => t.name),
      handoff: handoff.inputFilter(input),
      promptReset: target.prompt,
      factoryKeys: f.events
        .filter((e: any) => e[0] === "factory")
        .map((e: any) => e[2]),
    };
  },
);
await both(
  "model aliases disabled selection custom fallback/env override",
  async (f) => {
    await f.start();
    f.settings.model = "p";
    const alias = await f.manager.getModel("main");
    f.configuration.models[0].disabled = true;
    const disabled = await f.manager.getModel("main");
    const custom = await f.manager.getRelatedModel("custom:a", "reasoning");
    f.runtime.env.CODEBUDDY_SMALL_FAST_MODEL = "external-small";
    const env = await f.manager.getRelatedModel("primary", "lite");
    return {
      alias,
      disabled,
      custom,
      env,
      unknown: await f.manager.resolveConfiguredModelOrFallback(
        "unknown",
        "fixture",
      ),
    };
  },
);
await both(
  "plugin override headers, prompt overlay, settings precedence and selected-agent cleanup",
  async (f) => {
    f.manager.pluginManager = {
      getActivePlugins: async () => [
        {
          plugin: {
            name: "owned-plugin",
            marketplaceName: "owned",
            status: "enabled",
          },
          components: {
            settings: { agent: "persona" },
            agents: [
              {
                name: "persona",
                tags: ["cli", "plugin"],
                instructions: "persona prompt",
                description: "persona",
                tools: ["Read", "mcp__owned__read"],
              },
            ],
          },
        },
      ],
    };
    await f.start();
    const replaced = await f.manager.getAgentConfig("main");
    const removed = await f.manager.get("persona");
    await f.manager.setVolatilePluginAgent("persona", {
      sourcePluginId: "owned-plugin@owned",
      internalModelRequestHeaders: {
        " z ": "value",
        a: "first",
        n: 4,
        " ": "ignored",
      },
    });
    const overlay = await f.manager.getAgentConfig("main");
    const prompt = await (await f.manager.getDefault()).instructions();
    f.settings.agent = "Explore";
    await f.manager.refreshAgents();
    return {
      replaced,
      removed,
      overlay,
      prompt,
      state: f.manager.getVolatilePluginAgentState(),
      settings: f.manager.getSettingsAgentName(),
      final: await f.manager.getAgentConfig("main"),
    };
  },
);
for (const tool of [
  "Read",
  "Agent",
  "TaskStop",
  "SendMessage",
  "AskUserQuestion",
  "StructuredOutput",
  "Skill",
  "WeChatReply",
  "WeComReply",
  "EnterPlanMode",
  "ExitPlanMode",
])
  for (const mode of ["default", "delegate", "plan"])
    await both("native enable gate " + tool + "/" + mode, async (f) => {
      await f.start();
      const gate = await f.manager.createIsEnabledChecker(
        { name: tool, aliases: ["alias"], defer_loading: false },
        undefined,
      );
      return gate({
        agent: await f.manager.getDefault(),
        runContext: {
          context: {
            options: {},
            meta: {},
            permissionModeSubject: { value: mode },
          },
        },
      });
    });
for (const allowed of [
  undefined,
  "default",
  "",
  "Read",
  "read",
  "R*",
  "Read(*.md)",
  "Bash",
])
  for (const denied of [[], ["Read"], ["Read(*)"], ["alias"], ["Read(*.md)"]])
    await both("session allow/deny " + allowed + "/" + denied, async (f) => {
      await f.start();
      const gate = await f.manager.createIsEnabledChecker(
        { name: "Read", aliases: ["alias"], defer_loading: false },
        true,
      );
      return gate({
        agent: await f.manager.getDefault(),
        runContext: {
          context: {
            options: { tools: allowed, disallowedTools: denied },
            meta: {},
          },
        },
      });
    });
for (const overlay of [
  undefined,
  specs.parseToolSpecs(["NoDefer(mcp__owned__*)"]).overlay,
  specs.parseToolSpecs(["NoDefer(read)"]).overlay,
])
  await both("MCP prewait overlay candidates", async (f) => {
    await f.start();
    f.servers.splice(
      0,
      f.servers.length,
      {
        name: "owned",
        config: { type: "stdio", tools: { read: { defer_loading: true } } },
      },
      { name: "other", config: { type: "sdk" } },
      { name: "inline", config: { alwaysLoad: true } },
    );
    const session = { options: { toolDeferOverlay: overlay }, meta: {} };
    const names = await f.manager.getFirstRunMcpPrewaitNames("main", session);
    await f.manager.ensureAgentToolsFreshForRun(
      "main",
      session,
      new AbortController().signal,
    );
    await f.manager.ensureAgentToolsFreshForRun(
      "main",
      session,
      new AbortController().signal,
    );
    return {
      names,
      pending: f.pending.length,
      completed: f.manager.sessionMcpPrewaitCompleted.has(session),
      timers: f.timers.pending.size,
    };
  });
await both(
  "MCP abort remains retryable / managed old instance gets current tools",
  async (f) => {
    await f.start();
    const old = await f.manager.getDefault(),
      session = { options: {}, meta: {} },
      abort = new AbortController();
    abort.abort();
    await f.manager.ensureAgentToolsFreshForRun(
      "main",
      session,
      abort.signal,
      old,
    );
    const abortedCompleted = f.manager.sessionMcpPrewaitCompleted.has(session);
    await f.manager.refreshAgents();
    const current = await f.manager.getDefault();
    await f.manager.ensureAgentToolsFreshForRun(
      "main",
      session,
      new AbortController().signal,
      old,
    );
    return {
      abortedCompleted,
      identity: old === current,
      managed: f.manager.isManagedAgentInstance(old),
      sameTools: old.tools === current.tools,
    };
  },
);
const memoryFiles: Record<string, string> = {
  "/owned/mode/fragments/interaction.md":
    "---\ntools: [Read, NoDefer(Bash)]\n---\nmode body ${CODEBUDDY_PLUGIN_ROOT}",
  "/owned/mode/part.md": "---\ntools: [Read, Glob]\n---\ninclude body",
  "/owned/mode/cycle.md": '{% include "interactionmode-edit/cycle.md" %}',
  "/owned/mode/bad.md": "---\ntools: [bad\n---\nmalformed body",
};
for (const instructions of [
  "plain fallback",
  '{% if interactionMode == "edit" %}edit{% elif welcomeMode == "code" %}code{% else %}else{% endif %}',
  "{% if unrelated %}literal{% endif %}",
  '{% include "interactionmode-edit/part.md" %}',
  '{% include "interactionmode-edit/cycle.md" %}',
  '{% include "interactionmode-edit/bad.md" %}',
  '{% include "interactionmode-edit/../secret" %}',
  '{% include "unknown/part.md" %}',
])
  for (const count of [0, 1, 2]) {
    const build = (native: boolean) => {
      const logs: any[] = [];
      const runtime = {
        readFileSync: (p: string) => {
          if (!(p in memoryFiles)) throw Error("owned missing");
          return memoryFiles[p]!;
        },
        existsSync: (p: string) => p in memoryFiles,
        markdown,
        substituteLoadTimeVariables,
      };
      const composer = native
        ? original.composer(runtime)
        : createPluginAgentComposer(runtime, nunjucks);
      const root = {
        name: "welcomemode-code",
        marketplaceName: "workbuddy-builtin",
      };
      const enabledPlugins = Array.from({ length: count }, (_, i) => ({
        name: i ? "interactionmode-other" : "interactionmode-edit",
        marketplaceName: "workbuddy-builtin",
        status: "enabled",
        installedPath: "/owned/mode",
      }));
      return {
        result: composer.composePluginAgent({
          agentConfig: { name: "persona", instructions, tools: ["Read"] },
          matchedPlugin: root,
          enabledPlugins,
          logger: Object.fromEntries(
            ["warn", "debug"].map((k) => [
              k,
              (...v: any[]) => logs.push([k, ...v]),
            ]),
          ),
        }),
        logs,
      };
    };
    eq(
      build(false),
      build(true),
      "plugin include/conditional/fallback count=" + count + " " + instructions,
    );
  }
console.log(
  JSON.stringify(
    {
      ok: true,
      comparisons,
      managerMethodCount,
      yamlModules: CAPTURED_YAML_MODULE_IDS.length,
      sourceSha256:
        "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd",
      boundaries: [
        "SDK 0.5.2 unchanged",
        "explicit Deferred/Emitter/DI adapters",
        "owned memory files and deterministic timers only",
      ],
    },
    null,
    2,
  ),
);

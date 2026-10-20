import { parse } from "acorn";
import { createHash } from "node:crypto";
import { runInNewContext } from "node:vm";
import * as path from "node:path";
import * as sdk from "@openai/agents-core";
import nunjucks from "nunjucks";
import {
  NativeDeferred,
  NativeEmitter,
  agentManagerToolNames,
} from "../../src/agents/native-agent-manager-runtime.js";
import { PermissionMode } from "../../src/permissions/permission.js";
/** Extract only selected factories/classes. Never run the installed app or its bootstrap. */
export function loadCapturedAgentManager(source: string) {
  if (
    createHash("sha256").update(source).digest("hex") !==
    "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd"
  )
    throw Error("sample hash");
  const nodes: any[] = [];
  const visit = (n: any) => {
    if (!n || typeof n !== "object") return;
    nodes.push(n);
    for (const [k, v] of Object.entries(n))
      if (k !== "start" && k !== "end") {
        if (Array.isArray(v)) v.forEach(visit);
        else if (v && typeof v === "object") visit(v);
      }
  };
  visit(parse(source, { ecmaVersion: "latest" }));
  const classes = nodes.filter((n) =>
    ["ClassExpression", "ClassDeclaration"].includes(n.type),
  );
  const cls = (p: number) =>
    classes
      .filter((n) => n.start <= p && n.end > p)
      .sort((a, b) => a.end - a.start - (b.end - b.start))[0];
  const text = (n: any) => source.slice(n.start, n.end);
  const moduleMap = nodes.find(
    (n) =>
      n.type === "ObjectExpression" &&
      n.properties?.some(
        (p: any) => p.start === 16310601 && p.key?.value === 43519,
      ),
  );
  const modules = new Map<number, any>(
    moduleMap.properties
      .filter((p: any) => typeof p.key?.value === "number")
      .map((p: any) => [p.key.value, p]),
  );
  const controlledRequire = (name: string) => {
    if (name.replace(/^node:/, "") === "process")
      return {
        env: {},
        version: process.version,
        versions: { node: process.versions.node },
      };
    if (name.replace(/^node:/, "") === "buffer") return { Buffer };
    if (name.replace(/^node:/, "") === "util")
      return { inspect: () => "[owned]" };
    throw Error("Blocked captured external dependency " + name);
  };
  const moduleLoader = (overrides: Record<number, any> = {}) => {
    const cache = new Map<number, any>();
    const load: any = (id: number) => {
      if (Object.hasOwn(overrides, id)) return overrides[id];
      if (cache.has(id)) return cache.get(id).exports;
      const entry = modules.get(id);
      if (!entry) throw Error("Unmapped source module " + id);
      const value = { exports: {} };
      cache.set(id, value);
      const factory = runInNewContext("({" + text(entry) + "})[" + id + "]", {
        Buffer,
        Error,
        console: { warn() {}, error() {} },
        require: controlledRequire,
        process: controlledRequire("process"),
      });
      factory(value, value.exports, load);
      return value.exports;
    };
    load.r = (out: any) =>
      Object.defineProperty(out, "__esModule", { value: true });
    load.d = (out: any, entries: any) => {
      for (const [key, get] of Object.entries(entries))
        Object.defineProperty(out, key, { get: get as any, enumerable: true });
    };
    load.n = (out: any) => () => (out?.__esModule ? out.default : out);
    load.o = (out: any, key: any) => Object.hasOwn(out, key);
    load.g = {};
    return load;
  };
  const identityDecorator = () => () => undefined;
  const specs = moduleLoader({ 80699: { Component: identityDecorator } })(8844);
  const constants = moduleLoader({
    51147: {
      BooleanUtils: {
        isTruthy: (v: any) =>
          !!v &&
          ["true", "1", "yes", "on"].includes(String(v).trim().toLowerCase()),
      },
    },
  })(69466);
  const yaml = moduleLoader()(43519);
  const selected = (p: number, names: string[], name: string) =>
    "class " +
    name +
    "{" +
    names
      .map((key) =>
        text(cls(p).body.body.find((n: any) => n.key?.name === key)),
      )
      .join("\n") +
    "}";
  const permissionSource = selected(
    13340680,
    ["matchPermissionRules", "extractWholeToolRules", "isScopedPermission"],
    "PermissionUtils",
  );
  const permission = runInNewContext("(" + permissionSource + ")", { Error });
  permission.getDebugService = () => undefined;
  const markdownSource = selected(
    13249670,
    [
      "extractFrontMatterFull",
      "parseListField",
      "splitByCommaRespectingBraces",
    ],
    "MarkdownUtils",
  );
  const markdown = runInNewContext("(" + markdownSource + ")", {
    t$: { parse: yaml.parse },
    Error,
  });
  const composeSource = source.slice(7018190, 7024410);
  const prefix =
    source.slice(
      source.indexOf("let A2=new Set", 7024400),
      source.indexOf(",A9=eu=class", 7024400),
    ) + ";";
  const booleanMethod = cls(15165563).body.body.find(
    (n: any) => n.key?.name === "isTruthy",
  );
  const BooleanUtils = runInNewContext(
    "(class BooleanUtils{" + text(booleanMethod) + "})",
  );
  const planSource = ["isPlanModeDisabled", "isExitPlanModeVisibleForSession"]
    .map((name) =>
      text(
        nodes.find(
          (n) => n.type === "FunctionDeclaration" && n.id?.name === name,
        ),
      ),
    )
    .join("\n");
  const globals = {
    AB: sdk,
    AD: sdk,
    AG: specs,
    A_: constants,
    Aj: agentManagerToolNames,
    AH: { PermissionUtils: permission },
    AL: { PermissionMode },
    AQ: { isModelVariantType: (v: any) => v === "lite" || v === "reasoning" },
    Av: { Deferred: NativeDeferred, Emitter: NativeEmitter },
    AbortController,
    Error,
  };
  return {
    specs,
    constants,
    yaml,
    permission,
    markdown,
    classes,
    nodes,
    text,
    cls,
    modules,
    composeSource,
    prefix,
    manager(runtime: any) {
      const AK = runInNewContext(
        "(function(){" +
          planSource +
          ";return{isPlanModeDisabled,isExitPlanModeVisibleForSession}})()",
        {
          eu: { BooleanUtils },
          ed: { PermissionMode },
          eg: "CODEBUDDY_DISABLE_PLAN_MODE",
          ep: "subAgentPlanModeLocked",
          process: { env: runtime.env },
        },
      );
      const C = runInNewContext(
        prefix + "var eu=" + text(cls(7025790)) + ";eu",
        {
          ...globals,
          AK,
          Date: { now: runtime.now },
          setTimeout: runtime.setTimeout,
          clearTimeout: runtime.clearTimeout,
          process: { env: runtime.env },
          getProfiler: runtime.getProfiler,
          composePluginAgent: runtime.composePluginAgent,
          AT: { DelegateToolManager: Symbol("owned") },
          Av: {
            ...globals.Av,
            ContainerUtil: {
              get: () => ({ hasTools: runtime.hasDelegateTools }),
            },
          },
        },
      );
      return Object.assign(new C(), runtime.dependencies);
    },
    defer(runtime: any) {
      const C = runInNewContext("(" + text(cls(12005567)) + ")", {
        process: { env: runtime.env },
        iq: {
          ENV_KEY_CODEBUDDY_DEFER_TOOL_LOADING: "CODEBUDDY_DEFER_TOOL_LOADING",
          ENV_KEY_CODEBUDDY_SHOW_ALL_DEFERRED_TOOLS:
            "CODEBUDDY_SHOW_ALL_DEFERRED_TOOLS",
        },
        nq: { ProductFeature: { DeferToolLoading: "DeferToolLoading" } },
      });
      return Object.assign(new C(), runtime.dependencies);
    },
    composer(runtime: any) {
      return runInNewContext(
        "(function(){" +
          composeSource +
          ";return{composePluginAgent,resolvePluginInclude,renderPluginTemplate,readModeFragment,unionTools}})()",
        {
          Aq: path,
          A$: runtime,
          AH: { MarkdownUtils: markdown },
          Az: {
            substituteLoadTimeVariables: runtime.substituteLoadTimeVariables,
          },
          AJ: () => nunjucks,
          Error,
        },
      );
    },
  };
}

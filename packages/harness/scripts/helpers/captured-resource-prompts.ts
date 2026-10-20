import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { createRequire, isBuiltin } from "node:module";
import * as path from "node:path";
import * as realOs from "node:os";
import * as realCrypto from "node:crypto";
import * as realUtil from "node:util";
import * as realChildProcess from "node:child_process";
import nunjucks from "nunjucks";
import ts from "typescript";
import { parse } from "acorn";
import { nodesOf } from "./captured-product-sources.js";
import {
  createCapturedNodeProxyAgents,
  PROMPT_PROXY_SHA256,
} from "../../src/vendor/captured-node-proxy-agents.js";
import {
  RESOURCE_PROMPT_SHA256,
  RESOURCE_PROMPT_CLASSES,
  RESOURCE_PROMPT_FUNCTIONS,
  RESOURCE_PROMPT_CONSTANTS,
} from "../../src/prompts/native-resource-prompt.js";
import {
  PROMPT_RUNTIME_CONTEXT_SHA256,
  PROMPT_RUNTIME_CONTEXT_DECLARATIONS,
} from "../../src/prompts/native-prompt-runtime-context.js";
export {
  RESOURCE_PROMPT_CLASSES,
  RESOURCE_PROMPT_FUNCTIONS,
  RESOURCE_PROMPT_CONSTANTS,
  PROMPT_RUNTIME_CONTEXT_DECLARATIONS,
};
export function emittedPrompt(name: string) {
  return ts.transpileModule(
    readFileSync(new URL("../../src/" + name + ".ts", import.meta.url), "utf8"),
    {
      compilerOptions: {
        target: ts.ScriptTarget.ES2023,
        module: ts.ModuleKind.ESNext,
      },
    },
  ).outputText;
}
const common = {
  __commonJSMin(fn: any) {
    let module: any;
    return () => {
      if (!module) {
        module = { exports: {} };
        fn(module.exports, module);
      }
      return module.exports;
    };
  },
  __toESM(value: any) {
    return value?.__esModule ? value : { ...value, default: value };
  },
};
function capturedNunjucks(source: string) {
  const tree: any = parse(source, { ecmaVersion: "latest" }),
    vars = new Map<string, any>();
  for (const n of tree.body)
    if (n.type === "VariableDeclaration")
      for (const d of n.declarations)
        if (d.id.type === "Identifier")
          vars.set(d.id.name, { node: n, init: d.init });
  const selected = new Set<any>(),
    visited = new Set<string>();
  function add(name: string, parent = "root") {
    // Original Nunjucks catches this optional module; verification never starts template watchers.
    if (name === "require_chokidar") return;
    if (name === "require_chunk" || visited.has(name)) return;
    visited.add(name);
    const row = vars.get(name);
    if (!row) throw Error("Unresolved captured Nunjucks factory " + name);
    if (
      row.init?.callee?.name === "require" &&
      !isBuiltin(row.init.arguments[0]?.value ?? "")
    )
      throw Error("Unsafe captured dependency: " + parent + " -> " + name);
    selected.add(row.node);
    const localNames = new Set(
      nodesOf(row.init)
        .filter(
          (n) =>
            n.type === "VariableDeclarator" || n.type === "FunctionDeclaration",
        )
        .map((n) => n.id?.name),
    );
    for (const n of nodesOf(row.init))
      if (
        n.type === "Identifier" &&
        n.name.startsWith("require_") &&
        vars.has(n.name) &&
        !localNames.has(n.name)
      )
        add(n.name, name);
  }
  add("require_nunjucks");
  const code =
    'function require_chokidar(){throw Error("No optional watchers in inert Nunjucks verification");}\n' +
    [...selected]
      .sort((a, b) => a.start - b.start)
      .map((n) => source.slice(n.start, n.end))
      .join("\n");
  return {
    api: Function(
      "require_chunk",
      "require",
      code + "\nreturn require_nunjucks();",
    )(common, (id: string) => {
      if (!isBuiltin(id))
        throw Error("Captured Nunjucks requires only builtins: " + id);
      return createRequire(import.meta.url)(id);
    }),
    factories: selected.size,
  };
}
/** Verification-only, complete inert declaration factories; never imports the installed app/bootstrap. */
export function loadCapturedResourcePrompts(sources: {
  coordinator: string;
  context: string;
  proxy: string;
}) {
  for (const [key, sha] of [
    ["coordinator", RESOURCE_PROMPT_SHA256],
    ["context", PROMPT_RUNTIME_CONTEXT_SHA256],
    ["proxy", PROMPT_PROXY_SHA256],
  ] as const)
    if (createHash("sha256").update(sources[key]).digest("hex") !== sha)
      throw Error(key + " sample hash");
  function factory(
    file: string,
    name: string,
    source: string,
    declarations: readonly (readonly any[])[],
    classes: readonly (readonly any[])[],
    deps: any,
  ) {
    let output = emittedPrompt(file);
    const tree: any = parse(output, {
        ecmaVersion: "latest",
        sourceType: "module",
      }),
      edits: any[] = [];
    for (const n of tree.body) {
      if (n.type === "ImportDeclaration")
        edits.push({ start: n.start, end: n.end, text: "" });
      if (n.type === "ExportNamedDeclaration")
        edits.push({ start: n.start, end: n.declaration.start, text: "" });
    }
    const fn = nodesOf(tree).find(
      (n) => n.type === "FunctionDeclaration" && n.id?.name === name,
    );
    for (const n of fn.body.body) {
      const id =
        n.type === "FunctionDeclaration"
          ? n.id.name
          : n.type === "VariableDeclaration"
            ? n.declarations[0].id.name
            : undefined;
      const declaration = declarations.find((row) => row[0] === id),
        cls = classes.find((row) => row[0] === id);
      if (declaration)
        edits.push({
          start: n.start,
          end: n.end,
          text: source.slice(declaration[1], declaration[2]),
        });
      if (cls)
        edits.push({
          start: n.declarations[0].init.start,
          end: n.declarations[0].init.end,
          text: source.slice(cls[1], cls[2]),
        });
    }
    for (const e of edits.sort((a, b) => b.start - a.start))
      output = output.slice(0, e.start) + e.text + output.slice(e.end);
    return Function(
      ...Object.keys(deps),
      output + "\nreturn " + name,
    )(...Object.values(deps));
  }
  const context = factory(
    "prompts/native-prompt-runtime-context",
    "createNativePromptRuntimeContext",
    sources.context,
    PROMPT_RUNTIME_CONTEXT_DECLARATIONS,
    [],
    { node_path: path, realOs },
  );
  const originalNunjucks = capturedNunjucks(sources.coordinator);
  return {
    factory: factory(
      "prompts/native-resource-prompt",
      "createNativeResourcePrompt",
      sources.coordinator,
      [...RESOURCE_PROMPT_FUNCTIONS, ...RESOURCE_PROMPT_CONSTANTS],
      RESOURCE_PROMPT_CLASSES,
      {
        path,
        realOs,
        realCrypto,
        realUtil,
        realChildProcess,
        nunjucks,
        createNativePromptRuntimeContext: context,
        createCapturedNodeProxyAgents,
      },
    ),
    nunjucks: originalNunjucks.api,
    nunjucksFactories: originalNunjucks.factories,
  };
}

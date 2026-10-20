import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import * as node_crypto from "node:crypto";
import * as node_path from "node:path";
import * as nodeFs from "node:fs";
import * as nodeOs from "node:os";
import ts from "typescript";
import { parse } from "acorn";
import { nodesOf } from "./captured-product-sources.js";
import {
  SESSION_MODES_SHA256,
  SESSION_MODE_FUNCTIONS,
  SESSION_MODE_CLASSES,
  SESSION_MODE_CONSTANTS,
} from "../../src/sessions/native-session-modes.js";
import {
  SESSION_ADDONS_SHA256,
  SESSION_ADDON_FUNCTIONS,
  SESSION_ADDON_CONSTANTS,
  SESSION_ADDON_CLASSES,
  SESSION_ADDON_RESOLVE_MEMBER,
} from "../../src/sessions/native-session-addons.js";
export const SESSION_ADDON_SAMPLES = {
  modes: {
    sha: SESSION_MODES_SHA256,
    functions: SESSION_MODE_FUNCTIONS,
    classes: SESSION_MODE_CLASSES,
    constants: SESSION_MODE_CONSTANTS,
  },
  addons: {
    sha: SESSION_ADDONS_SHA256,
    functions: SESSION_ADDON_FUNCTIONS,
    classes: SESSION_ADDON_CLASSES,
    constants: SESSION_ADDON_CONSTANTS,
  },
};
export function emittedSession(name: "modes" | "addons") {
  return ts.transpileModule(
    readFileSync(
      new URL(
        "../../src/sessions/native-session-" + name + ".ts",
        import.meta.url,
      ),
      "utf8",
    ),
    {
      compilerOptions: {
        target: ts.ScriptTarget.ES2023,
        module: ts.ModuleKind.ESNext,
      },
    },
  ).outputText;
}
export function loadCapturedSessionAddons(sources: {
  modes: string;
  addons: string;
}) {
  function factory(name: "modes" | "addons", deps: any) {
    const sample = SESSION_ADDON_SAMPLES[name],
      source = sources[name];
    if (createHash("sha256").update(source).digest("hex") !== sample.sha)
      throw Error(name + " sample hash");
    let output = emittedSession(name);
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
    for (const n of nodesOf(tree)) {
      const row = (sample.functions as readonly any[]).find(
        (r) => r[0] === n.id?.name,
      );
      if (n.type === "FunctionDeclaration" && row)
        edits.push({
          start: n.start,
          end: n.end,
          text: source.slice(row[1], row[2]),
        });
      const variable = [...sample.constants, ...sample.classes].find(
        (r) => r[0] === n.declarations?.[0]?.id?.name,
      );
      if (n.type === "VariableDeclaration" && variable)
        edits.push({
          start: n.start,
          end: n.end,
          text: source.slice(variable[1], variable[2]),
        });
      if (
        name === "addons" &&
        n.type === "MethodDefinition" &&
        n.key?.name === "resolveRuntimeConfig"
      )
        edits.push({
          start: n.start,
          end: n.end,
          text: source.slice(...SESSION_ADDON_RESOLVE_MEMBER),
        });
    }
    for (const e of edits.sort((a, b) => b.start - a.start))
      output = output.slice(0, e.start) + e.text + output.slice(e.end);
    return Function(
      ...Object.keys(deps),
      output +
        "\nreturn createNativeSession" +
        (name === "modes" ? "Modes" : "Addons"),
    )(...Object.values(deps));
  }
  const modes = factory("modes", {});
  return {
    modes,
    addons: factory("addons", {
      node_crypto,
      node_path,
      nodeFs,
      nodeOs,
      createNativeSessionModes: modes,
    }),
  };
}

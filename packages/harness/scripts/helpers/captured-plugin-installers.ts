import { readFileSync } from "node:fs";
import { createHash, randomUUID } from "node:crypto";
import * as path from "node:path";
import ts from "typescript";
import { parse } from "acorn";
import { nodesOf } from "./captured-product-sources.js";
import { NativeEmitter } from "../../src/agents/native-agent-manager-runtime.js";
import { SettingsScope } from "../../src/permissions/native-permission-policy.js";
import { createCapturedPluginConstants } from "../../src/vendor/captured-plugin-constants.js";
export const INSTALLER_CLASSES = [
  ["GitPluginInstaller", 9784026, 9788420],
  ["NpmPluginInstaller", 9789325, 9790587],
  ["GitSubdirPluginInstaller", 9791710, 9795641],
  ["PluginErrorCollector", 9796644, 9797503],
  ["PluginOptionsStorageImpl", 9818861, 9822846],
] as const;
export function emittedInstaller(file: string) {
  return ts.transpileModule(
    readFileSync(
      new URL("../../src/plugins/" + file + ".ts", import.meta.url),
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
export function loadCapturedInstallers(source: string) {
  if (
    createHash("sha256").update(source).digest("hex") !==
    "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd"
  )
    throw Error("sample hash");
  function factory(file: string, name: string) {
    let code = emittedInstaller(file);
    const tree: any = parse(code, {
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
      const row = INSTALLER_CLASSES.find(([name]) => name === n.id?.name);
      if (n.type === "ClassDeclaration" && row) {
        const raw = source.slice(row[1], row[2]);
        edits.push({
          start: n.body.start,
          end: n.body.end,
          text: raw.slice(raw.indexOf("{")),
        });
      }
    }
    for (const e of edits.sort((a, b) => b.start - a.start))
      code = code.slice(0, e.start) + e.text + code.slice(e.end);
    const dependencies = {
      path,
      randomUUID,
      NativeEmitter,
      SettingsScope,
      createCapturedPluginConstants,
    };
    return Function(
      ...Object.keys(dependencies),
      code + "\nreturn " + name,
    )(...Object.values(dependencies));
  }
  return {
    installers: factory(
      "native-plugin-installers",
      "createNativePluginInstallers",
    ),
    storage: factory("native-plugin-storage", "createNativePluginStorage"),
  };
}

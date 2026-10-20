import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import * as path from "node:path";
import * as fs from "node:fs";
import { isDeepStrictEqual } from "node:util";
import { Mutex } from "async-mutex";
import ts from "typescript";
import { parse } from "acorn";
import { nodesOf } from "./captured-product-sources.js";
import {
  NativeEmitter,
  NativeDeferred,
} from "../../src/agents/native-agent-manager-runtime.js";
import { CapturedJsonUtils } from "../../src/vendor/captured-jsonc.js";
import { createCapturedSettingsConstants } from "../../src/vendor/captured-settings-constants.js";
import { HookEvent } from "../../src/hooks/hook-constants.js";
export const SETTINGS_CLASSES = [
  ["PluginPolicyServiceImpl", 9824149, 9826670],
  ["CliSettingSourcesProvider", 11188750, 11191471],
  ["CliSettingsProvider", 11193064, 11196069],
  ["SettingsManagerImpl", 11202361, 11209123],
  ["SettingsController", 11210623, 11211440],
  ["SettingsValidateMiddleWare", 11213940, 11214445],
] as const;
export const SETTINGS_FUNCTIONS = [
  ["deepDiffDefaults", 11201978, 11202354],
  ["normalizeReasoningEffort", 11192966, 11193057],
] as const;
export const SETTINGS_FACTORY_IDS = [
  24618, 20852, 3246, 68331, 78918, 75350, 92921, 30063, 5907,
];
export const SETTINGS_FILES = [
  "config/native-settings-manager",
  "config/native-cli-settings",
  "plugins/native-plugin-policy",
] as const;
export function emittedSettings(file: string) {
  return ts.transpileModule(
    readFileSync(new URL("../../src/" + file + ".ts", import.meta.url), "utf8"),
    {
      compilerOptions: {
        target: ts.ScriptTarget.ES2023,
        module: ts.ModuleKind.ESNext,
      },
    },
  ).outputText;
}
export function loadCapturedSettings(source: string) {
  if (
    createHash("sha256").update(source).digest("hex") !==
    "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd"
  )
    throw Error("sample hash");
  function factory(file: string, name: string) {
    let code = emittedSettings(file);
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
      const row = SETTINGS_CLASSES.find((r) => r[0] === n.id?.name);
      if (n.type === "ClassDeclaration" && row) {
        const raw = source.slice(row[1], row[2]);
        edits.push({
          start: n.body.start,
          end: n.body.end,
          text: raw.slice(raw.indexOf("{")),
        });
      }
      const fn = SETTINGS_FUNCTIONS.find((r) => r[0] === n.id?.name);
      if (n.type === "FunctionDeclaration" && fn)
        edits.push({
          start: n.start,
          end: n.end,
          text: source.slice(fn[1], fn[2]),
        });
      if (
        n.type === "MethodDefinition" &&
        n.static &&
        n.key?.name === "getSettingsFilePath"
      )
        edits.push({
          start: n.start,
          end: n.end,
          text: source.slice(13328279, 13328565),
        });
    }
    for (const e of edits.sort((a, b) => b.start - a.start))
      code = code.slice(0, e.start) + e.text + code.slice(e.end);
    const deps = {
      path,
      fs,
      isDeepStrictEqual,
      Mutex,
      NativeEmitter,
      NativeDeferred,
      CapturedJsonUtils,
      createCapturedSettingsConstants,
      HookEvent,
    };
    return Function(
      ...Object.keys(deps),
      code + "\nreturn " + name,
    )(...Object.values(deps));
  }
  return {
    settings: factory(SETTINGS_FILES[0], "createNativeSettingsManager"),
    cli: factory(SETTINGS_FILES[1], "createNativeCliSettings"),
    policy: factory(SETTINGS_FILES[2], "createNativePluginPolicy"),
  };
}

import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import * as readline from "node:readline/promises";
import ts from "typescript";
import { parse } from "acorn";
import { nodesOf } from "./captured-product-sources.js";
import {
  BUILTIN_SEED_MAIN_SHA256,
  BUILTIN_SEED_FUNCTIONS,
  BUILTIN_SEED_CONSTANTS,
} from "../../src/plugins/native-builtin-seed.js";
import { createCapturedPluginConstants } from "../../src/vendor/captured-plugin-constants.js";
import { SettingsScope } from "../../src/permissions/native-permission-policy.js";
import { createNativePluginSemver } from "../../src/plugins/native-plugin-semver.js";
import {
  BUNDLED_ASSETS_SOURCE_SHA256,
  BUNDLED_ASSET_FUNCTIONS,
  BUNDLED_ASSET_CANDIDATES,
} from "../../src/plugins/native-bundled-assets.js";
export const SEED_CLASSES = [
  ["PluginController", 9763415, 9773771],
  ["ManifestValidationError", 9839074, 9839229],
  ["PluginValidatorImpl", 9839237, 9844910],
] as const;
export const SEED_FILES = [
  "native-builtin-seed",
  "native-plugin-controller",
  "native-plugin-validator",
  "native-bundled-assets",
] as const;
export function desktopSeedMainPath(bundle: string) {
  const file =
    process.argv[3] ??
    process.env.WORKBUDDY_DESKTOP_MAIN ??
    path.resolve(path.dirname(bundle), "../../main/index.js");
  if (!fs.existsSync(file))
    throw Error(
      "Builtin seed recovery also requires the fixed Desktop main/index.js; set WORKBUDDY_DESKTOP_MAIN or pass it as a second argument.",
    );
  return file;
}
export function emittedSeed(file: string) {
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
export function loadCapturedSeed(
  main: string,
  cli: string,
  assetsSource: string,
) {
  if (
    createHash("sha256").update(assetsSource).digest("hex") !==
    BUNDLED_ASSETS_SOURCE_SHA256
  )
    throw Error("Bundled assets source hash");
  if (
    createHash("sha256").update(main).digest("hex") !== BUILTIN_SEED_MAIN_SHA256
  )
    throw Error("Desktop main sample hash");
  if (
    createHash("sha256").update(cli).digest("hex") !==
    "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd"
  )
    throw Error("CLI sample hash");
  function factory(file: string, name: string) {
    let code = emittedSeed(file);
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
      const row = SEED_CLASSES.find((r) => r[0] === n.id?.name);
      if (n.type === "ClassDeclaration" && row) {
        const raw = cli.slice(row[1], row[2]);
        edits.push({
          start: n.body.start,
          end: n.body.end,
          text: raw.slice(raw.indexOf("{")),
        });
      }
      const fn = BUILTIN_SEED_FUNCTIONS.find((r) => r[0] === n.id?.name);
      if (n.type === "FunctionDeclaration" && fn)
        edits.push({
          start: n.start,
          end: n.end,
          text: main.slice(fn[1], fn[2]),
        });
      const assetFn = BUNDLED_ASSET_FUNCTIONS.find((r) => r[0] === n.id?.name);
      if (n.type === "FunctionDeclaration" && assetFn)
        edits.push({
          start: n.start,
          end: n.end,
          text: assetsSource.slice(assetFn[1], assetFn[2]),
        });
      if (
        n.type === "AssignmentExpression" &&
        n.left?.name === "CANDIDATES_FNS"
      )
        edits.push({
          start: n.right.start,
          end: n.right.end,
          text: assetsSource.slice(
            BUNDLED_ASSET_CANDIDATES[0],
            BUNDLED_ASSET_CANDIDATES[1],
          ),
        });
      const c = BUILTIN_SEED_CONSTANTS.find(
        (r) => r[0] === n.declarations?.[0]?.id?.name,
      );
      if (n.type === "VariableDeclaration" && c)
        edits.push({
          start: n.start,
          end: n.end,
          text: main.slice(c[1], c[2]),
        });
    }
    for (const e of edits.sort((a, b) => b.start - a.start))
      code = code.slice(0, e.start) + e.text + code.slice(e.end);
    const deps = {
      fs,
      nodeFs: fs,
      path,
      readline,
      SettingsScope,
      createCapturedPluginConstants,
      createNativePluginSemver,
    };
    return Function(
      ...Object.keys(deps),
      code + "\nreturn " + name,
    )(...Object.values(deps));
  }
  return {
    seed: factory(SEED_FILES[0], "createNativeBuiltinSeed"),
    controller: factory(SEED_FILES[1], "createNativePluginController"),
    validator: factory(SEED_FILES[2], "createNativePluginValidator"),
    assets: factory(SEED_FILES[3], "createNativeBundledAssets"),
  };
}

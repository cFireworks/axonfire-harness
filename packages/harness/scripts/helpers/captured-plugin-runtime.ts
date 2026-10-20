import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import * as path from "node:path";
import * as fs from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";
import { parse } from "acorn";
import { NativeEmitter } from "../../src/agents/native-agent-manager-runtime.js";
import { SettingsScope } from "../../src/permissions/native-permission-policy.js";
import { CommandMessageUtils } from "../../src/commands/command-message-utils.js";
import { ToolNames } from "../../src/tools/tool-names.js";
import { createCapturedPluginConstants } from "../../src/vendor/captured-plugin-constants.js";
import { createNativePluginSemver } from "../../src/plugins/native-plugin-semver.js";
import { createNativeProductSourceUtilities } from "../../src/config/native-product-source-utils.js";
import {
  deriveSkillVisibility,
  deriveSkillNameFromPath,
} from "../../src/commands/skill-product-provider.js";
import { nodesOf } from "./captured-product-sources.js";
export const PLUGIN_CLASSES = [
  ["PluginRuntimeRefreshService", 9832687, 9835683],
  ["PluginMcpToolChangeBlockedError", 9832171, 9832559],
  ["ReloadPluginsCommandExecutor", 7626670, 7628827],
  ["OutputStyleManagerImpl", 9420919, 9423931],
  ["PluginManagerImpl", 9624900, 9758187],
  ["PluginDependencyResolutionError", 9624672, 9624889],
  ["PluginLoaderManager", 9617689, 9621098],
  ["AgentExtensionLoader", 9583201, 9587093],
  ["CommandExtensionLoader", 9588330, 9591824],
  ["SkillExtensionLoader", 9593102, 9597847],
  ["HookExtensionLoader", 9599266, 9602081],
  ["MCPExtensionLoader", 9603335, 9608128],
  ["LSPExtensionLoader", 9609592, 9612038],
  ["OutputStyleExtensionLoader", 9613296, 9616389],
] as const;
export const PLUGIN_HELPERS = [
  ["pluginMcpServerConfigs", 9832560, 9832680],
  ["areExtendedPluginHooksDisabled", 9599151, 9599259],
  ["parseFrontmatterHooks", 9581916, 9582615],
  ["registerPluginCacheMarkerForExit", 9624483, 9624636],
  ["mapWithConcurrencyLimit", 9533928, 9534254],
  ["resolveDependencyClosure", 9534271, 9534735],
] as const;
export function emittedPlugin(file: string) {
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
/** Raw complete bodies, common owned DI only. Never execute the original bootstrap. */
export function loadCapturedPlugins(source: string) {
  if (
    createHash("sha256").update(source).digest("hex") !==
    "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd"
  )
    throw Error("sample hash");
  function factory(file: string, name: string) {
    let code = emittedPlugin(file);
    const tree: any = parse(code, {
        ecmaVersion: "latest",
        sourceType: "module",
      }),
      edits: any[] = [];
    for (const node of tree.body) {
      if (node.type === "ImportDeclaration")
        edits.push({ start: node.start, end: node.end, text: "" });
      if (node.type === "ExportNamedDeclaration")
        edits.push({
          start: node.start,
          end: node.declaration.start,
          text: "",
        });
    }
    for (const node of nodesOf(tree)) {
      const row = PLUGIN_CLASSES.find(([n]) => n === node.id?.name);
      if (node.type === "ClassDeclaration" && row) {
        const raw = source.slice(row[1], row[2]);
        edits.push({
          start: node.body.start,
          end: node.body.end,
          text: raw.slice(raw.indexOf("{")),
        });
      }
      const fn = PLUGIN_HELPERS.find(([n]) => n === node.id?.name);
      if (node.type === "FunctionDeclaration" && fn)
        edits.push({
          start: node.start,
          end: node.end,
          text: source.slice(fn[1], fn[2]),
        });
    }
    for (const edit of edits.sort((a, b) => b.start - a.start))
      code = code.slice(0, edit.start) + edit.text + code.slice(edit.end);
    code = code.replaceAll("import.meta.url", "moduleUrl");
    const dependencies = {
      path,
      fs: file === "native-plugin-runtime" ? fs.promises : fs,
      SettingsScope,
      CommandMessageUtils,
      ToolNames,
      createCapturedPluginConstants,
      createNativePluginSemver,
      createNativeProductSourceUtilities,
      deriveSkillVisibility,
      deriveSkillNameFromPath,
      createRequire,
      NativeEmitter,
      moduleUrl: import.meta.url,
    };
    return Function(
      ...Object.keys(dependencies),
      code + "\nreturn " + name,
    )(...Object.values(dependencies));
  }
  return {
    runtime: factory("native-plugin-runtime", "createNativePluginRuntime"),
    manager: factory("native-plugin-manager", "createNativePluginManager"),
    loaders: factory("native-plugin-loaders", "createNativePluginLoaders"),
  };
}

import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import ts from "typescript";
import { parse } from "acorn";
import { URI } from "vscode-uri";
import { createCapturedCeph } from "../../src/vendor/captured-ceph.js";
import { createAgentMarkdownUtils } from "../../src/agents/native-agent-markdown.js";
import { MemoryMarkdownUtils } from "../../src/memory/native-memory-markdown.js";
import { CapturedYaml } from "../../src/vendor/captured-yaml.js";
import { createCapturedModelCatalog } from "../../src/vendor/captured-model-catalog.js";
import * as constants from "../../src/config/native-product-constants.js";
export const PRODUCT_SOURCE_CLASSES = [
  ["CustomCommandsProductProvider", 9884646, 9886370],
  ["CustomAgentsProductProvider", 9887502, 9889624],
  ["ModelsProductProvider", 9908398, 9911296],
  ["CustomModelsProductProvider", 15631247, 15637656],
  ["AgentModelResolverProvider", 15242324, 15243876],
  ["AvailableModelsFilterProvider", 15244778, 15245391],
  ["EnterpriseCustomModelPolicyFilterProvider", 15215137, 15216830],
  ["CraftToCliAgentModelsSyncProvider", 9883035, 9883686],
  ["EnterpriseCustomModelPolicyServiceImpl", 15218023, 15226745],
  ["CliEnterpriseCustomModelPolicyServiceImpl", 15205780, 15209592],
  ["PolicyDiskCacheImpl", 15211363, 15212558],
  ["CloudEnterprisePolicyService", 15212826, 15214360],
  ["DirectoryScanUtils", 13223474, 13224875],
  ["ColorUtils", 13220744, 13223330],
  ["MissingPluginUserConfigError", 9813953, 9814156],
] as const;
export function nodesOf(node: any, out: any[] = []): any[] {
  if (!node || typeof node !== "object") return out;
  if (node.type) out.push(node);
  for (const [key, value] of Object.entries(node)) {
    if (["start", "end"].includes(key)) continue;
    if (Array.isArray(value)) value.forEach((v) => nodesOf(v, out));
    else if (value && typeof value === "object") nodesOf(value, out);
  }
  return out;
}
export function emittedSource(file: string) {
  return ts.transpileModule(
    readFileSync(
      new URL("../../src/config/" + file + ".ts", import.meta.url),
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
/** Execute original complete bodies in the same explicitly owned dependency boundary.
 * This is not the installed application/bootstrap and never loads its entrypoint. */
export function loadCapturedProductSources(source: string) {
  if (
    createHash("sha256").update(source).digest("hex") !==
    "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd"
  )
    throw Error("sample hash");
  const originalNodes = nodesOf(parse(source, { ecmaVersion: "latest" }));
  const rawFunctions = originalNodes.filter(
    (n) =>
      n.type === "FunctionDeclaration" &&
      ((n.start >= 9814157 && n.end <= 9818131) ||
        (n.start >= 13370739 && n.end <= 13371572) ||
        n.start === 13069545),
  );
  function originalFactory(
    file: string,
    name: string,
    imports: Record<string, any>,
  ) {
    let output = emittedSource(file);
    const tree: any = parse(output, {
      ecmaVersion: "latest",
      sourceType: "module",
    });
    const edits: { start: number; end: number; text: string }[] = [];
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
      if (["ClassDeclaration", "ClassExpression"].includes(node.type)) {
        const row = PRODUCT_SOURCE_CLASSES.find(
          ([name]) => name === node.id?.name,
        );
        if (row)
          edits.push({
            start: node.body.start,
            end: node.body.end,
            text: source
              .slice(row[1], row[2])
              .slice(source.slice(row[1], row[2]).indexOf("{")),
          });
      }
      if (node.type === "FunctionDeclaration") {
        const raw = rawFunctions.find((n) => n.id.name === node.id.name);
        if (raw)
          edits.push({
            start: node.start,
            end: node.end,
            text: source.slice(raw.start, raw.end),
          });
      }
    }
    for (const edit of edits.sort((a, b) => b.start - a.start))
      output = output.slice(0, edit.start) + edit.text + output.slice(edit.end);
    return Function(
      ...Object.keys(imports),
      output + "\nreturn " + name,
    )(...Object.values(imports));
  }
  const utilities = originalFactory(
    "native-product-source-utils",
    "createNativeProductSourceUtilities",
    {
      fs,
      path,
      createCapturedCeph,
      createAgentMarkdownUtils,
      MemoryMarkdownUtils,
      CapturedYaml,
    },
  );
  return originalFactory(
    "native-product-sources",
    "createNativeProductSources",
    {
      fs,
      path,
      URI,
      createCapturedModelCatalog,
      createNativeProductSourceUtilities: utilities,
      constants,
    },
  );
}

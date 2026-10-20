import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import * as fs from "node:fs/promises";
import * as fsModule from "node:fs";
import * as http from "node:http";
import * as https from "node:https";
import * as zlib from "node:zlib";
import * as streams from "node:stream/promises";
import { createRequire } from "node:module";
import * as path from "node:path";
import { tmpdir } from "node:os";
import { Mutex } from "async-mutex";
import ts from "typescript";
import { parse } from "acorn";
import { nodesOf } from "./captured-product-sources.js";
import { SettingsScope } from "../../src/permissions/native-permission-policy.js";
import { createCapturedPluginConstants } from "../../src/vendor/captured-plugin-constants.js";
import { createNativePluginConcurrency } from "../../src/plugins/native-plugin-concurrency.js";
import { createNativeZipUtils } from "../../src/plugins/native-zip-utils.js";
export const MARKETPLACE_CLASSES = [
  ["FileLockServiceImpl", 9144647, 9146302],
  ["BaseMarketplace", 9536013, 9537667],
  ["DirectoryMarketplace", 9538211, 9539998],
  ["MarketplaceFactory", 9555538, 9556101],
  ["MarketplaceStorage", 9556732, 9563889],
  ["MarketplaceConfigManager", 9565529, 9567108],
  ["BuiltInMarketplaceProvider", 9573457, 9574515],
  ["LocalPluginInstaller", 9780911, 9782967],
  ["GitFallbackCoordinator", 9579120, 9579902],
  ["GithubMarketplace", 9540634, 9543574],
  ["HttpMarketplace", 9544069, 9547325],
  ["ZipMarketplace", 9547937, 9555429],
  ["MarketplaceUpdateChecker", 9569105, 9572073],
  ["GitAvailabilityDetector", 9575670, 9576155],
  ["GitToZipUrlConverter", 9576904, 9577492],
] as const;
export const MARKETPLACE_HELPERS = [
  ["parseVersionFromUrl", 9845680, 9845846],
  ["getMetadataPath", 9845846, 9845897],
  ["readZipMetadata", 9845897, 9846033],
  ["writeZipMetadata", 9846033, 9846126],
  ["isLocalFilePath", 9846126, 9846215],
  ["isZipUrl", 9846215, 9846371],
  ["appendTimestamp", 9846371, 9846467],
  ["getRemoteHeaders", 9846467, 9847158],
  ["downloadFile", 9847158, 9847966],
  ["copyLocalFile", 9847966, 9848089],
  ["checkZipNeedsUpdate", 9848089, 9848615],
  ["checkLocalZipNeedsUpdate", 9848615, 9848959],
  ["extractZip", 9848959, 9849122],
  ["extractGzip", 9849122, 9849299],
  ["extractZipArchive", 9849299, 9849552],
  ["extractZipWithYauzl", 9849552, 9850463],
  ["ensureReadWritePermissions", 9850463, 9850797],
  ["flattenSingleDirectory", 9850797, 9851368],
  ["renameWithRetry", 9851368, 9851651],
] as const;
export function emittedMarketplace(file: string) {
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
/** Only the selected raw class bodies execute inside common owned DI, never application bootstrap. */
export function loadCapturedMarketplace(source: string) {
  if (
    createHash("sha256").update(source).digest("hex") !==
    "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd"
  )
    throw Error("sample hash");
  function factory(
    file: string,
    name: string,
    zipFactory = createNativeZipUtils,
  ) {
    let code = emittedMarketplace(file);
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
      const fn = MARKETPLACE_HELPERS.find(([name]) => name === n.id?.name);
      if (n.type === "FunctionDeclaration" && fn)
        edits.push({
          start: n.start,
          end: n.end,
          text: source.slice(fn[1], fn[2]),
        });
      const row = MARKETPLACE_CLASSES.find(([name]) => name === n.id?.name);
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
      fs: file === "plugins/native-zip-utils" ? fsModule : fs,
      http,
      https,
      zlib,
      streams,
      createRequire,
      createNativeZipUtils: zipFactory,
      moduleUrl: import.meta.url,
      path,
      tmpdir,
      Mutex,
      SettingsScope,
      createCapturedPluginConstants,
      createNativePluginConcurrency,
    };
    return Function(
      ...Object.keys(dependencies),
      code.replaceAll("import.meta.url", "moduleUrl") + "\nreturn " + name,
    )(...Object.values(dependencies));
  }
  const zip = factory("plugins/native-zip-utils", "createNativeZipUtils");
  return {
    zip,
    marketplace: factory(
      "plugins/native-marketplace",
      "createNativeMarketplace",
      zip,
    ),
    locks: factory("tasks/native-file-lock", "createNativeFileLock"),
    policy: (() => {
      const modules = Function(
          "return ({" + source.slice(9805697, 9807385) + "})",
        )(),
        out: any = {};
      modules[13423]({}, out, {
        r() {},
        d(target: any, getters: any) {
          for (const k of Object.keys(getters))
            Object.defineProperty(target, k, {
              enumerable: true,
              get: getters[k],
            });
        },
      });
      return out;
    })(),
  };
}

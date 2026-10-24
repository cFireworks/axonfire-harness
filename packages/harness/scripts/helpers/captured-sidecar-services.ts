import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { createHash } from "node:crypto";
import ts from "typescript";
import * as context from "../../src/terminal/native-sidecar-runtime-context.js";
import * as proxy from "../../src/terminal/native-sidecar-proxy-env.js";
import * as logger from "../../src/terminal/native-sidecar-logger.js";
import * as product from "../../src/terminal/native-sidecar-cli-product-env.js";
import { getCapturedBundlePath } from "./captured-bundle-path.js";
export const recoveredSidecarServices = {
  context: context.createNativeSidecarRuntimeContext,
  proxy: proxy.createNativeSidecarProxyEnvironment,
  logger: logger.createNativeSidecarLogger,
  product: product.createNativeSidecarCliProductEnvironment,
};
export function loadCapturedSidecarServices() {
  const root =
    process.env.WORKBUDDY_DESKTOP_MAIN ??
    path.resolve(path.dirname(getCapturedBundlePath()), "../../main");
  const result: any = {};
  let regions = 0;
  for (const [key, module, file, factory] of [
    ["context", context, "runtime-context", "RuntimeContext"],
    ["proxy", proxy, "proxy-env", "ProxyEnvironment"],
    ["logger", logger, "logger", "Logger"],
    ["product", product, "cli-product-env", "CliProductEnvironment"],
  ] as const) {
    const meta = module.SERVICE_SOURCE;
    const originals = new Map<string, string>();
    for (const src of meta.sources) {
      const raw = fs.readFileSync(path.join(root, src.file), "utf8");
      assert.equal(createHash("sha256").update(raw).digest("hex"), src.sha256);
      originals.set(src.file, raw);
    }
    let target = fs.readFileSync(
      new URL(
        "../../src/terminal/native-sidecar-" + file + ".ts",
        import.meta.url,
      ),
      "utf8",
    );
    for (const seg of meta.segments) {
      const original = originals.get(seg.file)!.slice(seg.from, seg.to);
      assert.ok(target.includes(original), file + ":" + seg.from);
      regions++;
    }
    const name = "createNativeSidecar" + factory;
    const chunks = meta.segments.map((seg) =>
      originals.get(seg.file)!.slice(seg.from, seg.to),
    );
    if (key === "product")
      chunks.splice(
        1,
        0,
        "const require_common={ProductEnviroment,ENV_KEY_CODEBUDDY_COPILOT_INTERNET_ENVIRONMENT};",
      );
    const wrapper = (
      target.slice(
        target.indexOf("export function " + name),
        target.indexOf("// BEGIN ORIGINAL"),
      ) +
      chunks.join("\n") +
      "\n" +
      target.slice(target.indexOf("// END ORIGINAL"))
    ).replace("export function", "function");
    const output = ts.transpileModule(wrapper, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2023,
        module: ts.ModuleKind.ESNext,
      },
    }).outputText;
    result[key] = new Function(
      "nodeFs",
      "nodePath",
      "nodeOs",
      output + "\nreturn " + name + ";",
    )(fs, path, os);
  }
  return { services: result, regions };
}

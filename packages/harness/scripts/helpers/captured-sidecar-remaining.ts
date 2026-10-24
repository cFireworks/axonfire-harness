import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import * as crypto from "node:crypto";
import * as childProcess from "node:child_process";
import * as util from "node:util";
import ts from "typescript";
import { getCapturedBundlePath } from "./captured-bundle-path.js";
import * as client from "../../src/terminal/native-sidecar-client-info.js";
import * as common from "../../src/terminal/native-sidecar-common.js";
export const recoveredSidecarRemaining = {
  client: client.createNativeSidecarClientInfo,
  common: common.createNativeSidecarCommon,
};
export function loadCapturedSidecarRemaining() {
  const root =
    process.env.WORKBUDDY_DESKTOP_MAIN ??
    path.resolve(path.dirname(getCapturedBundlePath()), "../../main");
  const services: any = {};
  let regions = 0;
  for (const [key, module, file, name] of [
    ["client", client, "client-info", "ClientInfo"],
    ["common", common, "common", "Common"],
  ] as const) {
    const meta = module.SERVICE_SOURCE;
    const originals = new Map<string, string>();
    for (const src of meta.sources) {
      const text = fs.readFileSync(path.join(root, src.file), "utf8");
      assert.equal(
        crypto.createHash("sha256").update(text).digest("hex"),
        src.sha256,
      );
      originals.set(src.file, text);
    }
    const target = fs.readFileSync(
      new URL(
        "../../src/terminal/native-sidecar-" + file + ".ts",
        import.meta.url,
      ),
      "utf8",
    );
    const chunks = meta.regions.map((r) => {
      const text = originals.get(r.file)!.slice(r.from, r.to);
      assert.ok(target.includes(text), file + ":" + r.from);
      regions++;
      return text;
    });
    if (key === "client")
      chunks.splice(1, 0, "const require_chunk={__esmMin};");
    const factory = "createNativeSidecar" + name;
    const wrapper = (
      target.slice(
        target.indexOf("export function " + factory),
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
    services[key] = new Function(
      "nodeFs",
      "nodePath",
      "nodeOs",
      "nodeCrypto",
      "nodeChildProcess",
      "nodeUtil",
      output + "\nreturn " + factory + ";",
    )(fs, path, os, crypto, childProcess, util);
  }
  return { services, regions };
}

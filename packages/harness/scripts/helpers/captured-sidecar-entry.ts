import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as path from "node:path";
import { createHash } from "node:crypto";
import ts from "typescript";
import { getCapturedBundlePath } from "./captured-bundle-path.js";
import * as writer from "../../src/terminal/native-sidecar-crash-writer.js";
import * as entry from "../../src/terminal/native-sidecar-entry.js";
import { createNativeSidecar } from "../../src/terminal/native-sidecar.js";
export const recoveredSidecarEntry = {
  writer: writer.createNativeSidecarCrashWriter,
  entry: entry.createNativeSidecarEntry,
};
export function loadCapturedSidecarEntry() {
  const root =
    process.env.WORKBUDDY_DESKTOP_MAIN ??
    path.resolve(path.dirname(getCapturedBundlePath()), "../../main");
  const services: any = {};
  let regions = 0;
  for (const [key, module, file, name] of [
    ["writer", writer, "crash-writer", "CrashWriter"],
    ["entry", entry, "entry", "Entry"],
  ] as const) {
    const meta = module.ENTRY_SOURCE;
    const raw = fs.readFileSync(path.join(root, meta.file), "utf8");
    assert.equal(createHash("sha256").update(raw).digest("hex"), meta.sha256);
    const target = fs.readFileSync(
      new URL(
        "../../src/terminal/native-sidecar-" + file + ".ts",
        import.meta.url,
      ),
      "utf8",
    );
    const body = meta.regions
      .map((r) => {
        const original = raw.slice(r.from, r.to);
        assert.ok(target.includes(original));
        regions++;
        return original;
      })
      .join("\n");
    const factory = "createNativeSidecar" + name;
    const wrapper = (
      target.slice(
        target.indexOf("export function " + factory),
        target.indexOf("// BEGIN ORIGINAL"),
      ) +
      body +
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
      "createNativeSidecar",
      "createNativeSidecarCrashWriter",
      output + "\nreturn " + factory + ";",
    )(fs, path, createNativeSidecar, writer.createNativeSidecarCrashWriter);
    if (key === "entry") {
      const bootstrap = raw
        .slice(
          raw.indexOf("main().catch"),
          raw.indexOf("//#endregion", raw.indexOf("main().catch")),
        )
        .trim();
      assert.ok(
        fs
          .readFileSync(
            new URL("../../src/terminal/sidecar-entry.ts", import.meta.url),
            "utf8",
          )
          .includes(bootstrap),
      );
      regions++;
    }
  }
  return { services, regions };
}

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { getCapturedBundlePath } from "./captured-bundle-path.js";
import { RUNTIME_ACQUISITION_SOURCE as meta } from "../../src/terminal/native-runtime-acquisition.js";
export function loadCapturedRuntimeAcquisition() {
  const root =
    process.env.WORKBUDDY_DESKTOP_MAIN ??
    path.resolve(path.dirname(getCapturedBundlePath()), "../../main");
  const raw = fs.readFileSync(path.join(root, meta.file), "utf8");
  assert.equal(createHash("sha256").update(raw).digest("hex"), meta.sha256);
  const target = fs.readFileSync(
    new URL(
      "../../src/terminal/native-runtime-acquisition.ts",
      import.meta.url,
    ),
    "utf8",
  );
  const decl: string[] = [],
    methods: string[] = [];
  for (const r of meta.regions) {
    const text = raw.slice(r.from, r.to);
    assert.ok(target.includes(text));
    (r.method ? methods : decl).push(text);
  }
  return (runtime: any) =>
    new Function(
      "sidecarLog",
      decl.join("\n") +
        "\nreturn {" +
        methods.join(",") +
        ",buildPrewarmActivateArgs,summarizePrewarmArgs};",
    )(runtime.logger);
}

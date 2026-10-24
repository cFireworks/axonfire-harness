import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { PRODUCT_EXPERIMENT_SOURCE as source } from "../../src/config/native-product-experiment-manager.js";
import { getCapturedBundlePath } from "./captured-bundle-path.js";
export function loadCapturedProductExperiment() {
  const root =
    process.env.WORKBUDDY_DESKTOP_MAIN ??
    path.resolve(path.dirname(getCapturedBundlePath()), "../../main");
  const raw = fs.readFileSync(path.join(root, source.file), "utf8");
  assert.equal(createHash("sha256").update(raw).digest("hex"), source.sha256);
  const target = fs.readFileSync(
    new URL(
      "../../src/config/native-product-experiment-manager.ts",
      import.meta.url,
    ),
    "utf8",
  );
  const body = source.regions
    .map((r) => {
      const text = raw.slice(r.from, r.to);
      assert.ok(target.includes(text), `region ${r.from}`);
      return text;
    })
    .join("\n");
  const factory = new Function(
    `return function(runtime={}){const setInterval=runtime.setInterval??globalThis.setInterval,clearInterval=runtime.clearInterval??globalThis.clearInterval;${body}\nreturn {${source.names.join(",")}};}`,
  )();
  return { factory, regions: source.regions.length };
}

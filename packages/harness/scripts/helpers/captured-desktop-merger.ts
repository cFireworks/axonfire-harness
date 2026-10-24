import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { DESKTOP_PRODUCT_MERGER_SOURCE as source } from "../../src/config/native-desktop-product-merger.js";
import { getCapturedBundlePath } from "./captured-bundle-path.js";
export function loadCapturedDesktopMerger() {
  const root =
      process.env.WORKBUDDY_DESKTOP_MAIN ??
      path.resolve(path.dirname(getCapturedBundlePath()), "../../main"),
    raw = fs.readFileSync(path.join(root, source.file), "utf8");
  assert.equal(createHash("sha256").update(raw).digest("hex"), source.sha256);
  const target = fs.readFileSync(
    new URL(
      "../../src/config/native-desktop-product-merger.ts",
      import.meta.url,
    ),
    "utf8",
  );
  const body = source.regions
    .map((r) => {
      const text = raw.slice(r.from, r.to);
      assert.ok(target.includes(text), String(r.from));
      return text;
    })
    .join("\n");
  const factory = new Function(
    `return function(){var ${source.names.join(",")};${body}\nreturn {${source.names.join(",")}};}`,
  )();
  return { factory, regions: source.regions.length };
}

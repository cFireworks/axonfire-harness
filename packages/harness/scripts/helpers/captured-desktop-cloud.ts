import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { DESKTOP_CLOUD_PRODUCT_SOURCE as source } from "../../src/config/native-desktop-cloud-product.js";
import { getCapturedBundlePath } from "./captured-bundle-path.js";
export function loadCapturedDesktopCloud() {
  const root =
      process.env.WORKBUDDY_DESKTOP_MAIN ??
      path.resolve(path.dirname(getCapturedBundlePath()), "../../main"),
    raw = fs.readFileSync(path.join(root, source.file), "utf8");
  assert.equal(createHash("sha256").update(raw).digest("hex"), source.sha256);
  const target = fs.readFileSync(
    new URL(
      "../../src/config/native-desktop-cloud-product.ts",
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
    `return function(runtime={}){const Date={now:runtime.now??globalThis.Date.now},setTimeout=runtime.setTimeout??globalThis.setTimeout;const ProductManager=Symbol('ProductManager'),import_common$37={ContainerUtil:{get:key=>{if(key!==ProductManager||!runtime.productManager)throw Error('Desktop cloud product manager requires productManager');return runtime.productManager;}}};var ${source.names.join(",")};${body}\nreturn {${source.names.join(",")}};}`,
  )();
  return { factory, regions: source.regions.length };
}

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { DESKTOP_PRODUCT_INTERCEPTORS_SOURCE as source } from "../../src/http/native-desktop-product-interceptors.js";
import { getCapturedBundlePath } from "./captured-bundle-path.js";
export function loadCapturedDesktopInterceptors() {
  const root =
    process.env.WORKBUDDY_DESKTOP_MAIN ??
    path.resolve(path.dirname(getCapturedBundlePath()), "../../main");
  const raw = fs.readFileSync(path.join(root, source.file), "utf8");
  assert.equal(createHash("sha256").update(raw).digest("hex"), source.sha256);
  const target = fs.readFileSync(
    new URL(
      "../../src/http/native-desktop-product-interceptors.ts",
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
    `return function(runtime={}){const process=runtime.process??{env:runtime.env??globalThis.process.env};const ProductManager=Symbol('ProductManager'),import_common$35={ContainerUtil:{get:key=>{if(key!==ProductManager||!runtime.productManager)throw Error('Desktop interceptor requires productManager');return runtime.productManager;}}};const HttpHeaders={},import_common$7={HttpHeaders};var ${source.names.join(",")};${body}\nreturn {AuthenticationHttpInterceptor,ProductEndpointHttpInterceptor,getProductEndpointOverride,setProductEndpointOverride};}`,
  )();
  return { factory, regions: source.regions.length };
}

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { DESKTOP_REST_SOURCE as source } from "../../src/http/native-desktop-rest.js";
import { getCapturedBundlePath } from "./captured-bundle-path.js";
export function loadCapturedDesktopRest() {
  const root =
    process.env.WORKBUDDY_DESKTOP_MAIN ??
    path.resolve(path.dirname(getCapturedBundlePath()), "../../main");
  const target = fs.readFileSync(
    new URL("../../src/http/native-desktop-rest.ts", import.meta.url),
    "utf8",
  );
  let regions = 0;
  const bodies = source.map((g) => {
    const raw = fs.readFileSync(path.join(root, g.file), "utf8");
    assert.equal(createHash("sha256").update(raw).digest("hex"), g.sha256);
    return g.regions
      .map((r) => {
        const text = raw.slice(r.from, r.to);
        assert.ok(target.includes(text), `${g.file}:${r.from}`);
        regions++;
        return text;
      })
      .join("\n");
  });
  const factory = new Function(
    "nodeRequire",
    `return function(runtime={}){const require=runtime.require??nodeRequire,process=runtime.process??globalThis.process,console=runtime.console??globalThis.console;${bodies[0]}\nconst require_chunk={__commonJSMin};${bodies[1]}\nconst axios_1=require_axios();return {DefaultRestOperationsFactory,axios:axios_1.default};}`,
  )(createRequire(import.meta.url));
  return { factory, regions };
}

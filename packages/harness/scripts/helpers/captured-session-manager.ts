import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import * as crypto from "node:crypto";
import { getCapturedBundlePath } from "./captured-bundle-path.js";
import { SESSION_MANAGER_SOURCE } from "../../src/sessions/native-session-manager.js";
export function loadCapturedSessionManager() {
  const root =
    process.env.WORKBUDDY_DESKTOP_MAIN ??
    path.resolve(path.dirname(getCapturedBundlePath()), "../../main");
  const target = fs.readFileSync(
    new URL("../../src/sessions/native-session-manager.ts", import.meta.url),
    "utf8",
  );
  const bodies: string[] = [];
  let regions = 0;
  for (const group of SESSION_MANAGER_SOURCE) {
    const raw = fs.readFileSync(path.join(root, group.file), "utf8");
    assert.equal(
      crypto.createHash("sha256").update(raw).digest("hex"),
      group.sha256,
    );
    const parts = group.regions.map((region) => {
      const original = raw.slice(region.from, region.to);
      assert.ok(target.includes(original), `${group.file}:${region.from}`);
      regions++;
      return original;
    });
    bodies.push(parts.join("\n"));
  }
  const code = `return function(runtime={}) {
 const console=runtime.console??globalThis.console,node_os=runtime.os??nodeOs;
 const require_workbuddy_auth_product_coordinator=(()=>{${bodies[0]}\nreturn {${SESSION_MANAGER_SOURCE[0].names.join(",")}};})();
 ${bodies[1]}
 return {SessionManager,coordinator:require_workbuddy_auth_product_coordinator};
 };`;
  return {
    regions,
    factory: new Function(
      "node_fs",
      "node_path",
      "nodeOs",
      "node_crypto",
      code,
    )(fs, path, os, crypto),
  };
}

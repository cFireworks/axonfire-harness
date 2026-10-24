import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { createHash } from "node:crypto";
import { AUTH_PRODUCT_COORDINATOR_SOURCE } from "../../src/config/native-auth-product-coordinator.js";
import { getCapturedBundlePath } from "./captured-bundle-path.js";
export function loadCapturedAuthProductCoordinator() {
  const root =
    process.env.WORKBUDDY_DESKTOP_MAIN ??
    path.resolve(path.dirname(getCapturedBundlePath()), "../../main");
  const target = fs.readFileSync(
    new URL(
      "../../src/config/native-auth-product-coordinator.ts",
      import.meta.url,
    ),
    "utf8",
  );
  let regions = 0;
  const bodies = AUTH_PRODUCT_COORDINATOR_SOURCE.map((group) => {
    const raw = fs.readFileSync(path.join(root, group.file), "utf8");
    assert.equal(createHash("sha256").update(raw).digest("hex"), group.sha256);
    return group.regions
      .map((region) => {
        const body = raw.slice(region.from, region.to);
        assert.ok(target.includes(body), `${group.file}:${region.from}`);
        regions++;
        return body;
      })
      .join("\n");
  });
  const names = AUTH_PRODUCT_COORDINATOR_SOURCE.map((group) =>
    group.names.join(","),
  );
  const factory = new Function(
    "nodeFs",
    "nodeOs",
    "nodePath",
    `return function(runtime={}) {
    const process=runtime.process??globalThis.process,console=runtime.console??globalThis.console;
    const fs=runtime.fs??nodeFs,os=runtime.os??nodeOs,path=nodePath,__dirname=runtime.dirname??${JSON.stringify(root)};
    const common=(()=>{var ${names[0]};${bodies[0]}\nreturn {${names[0]}};})();
    const devEnvironment=(()=>{${bodies[1]}\nreturn {${names[1]}};})();
    const productConfig=(()=>{const require_common$1=common,require_dev_env_override=devEnvironment;${bodies[2]}\nimport_common=runtime.di;if(runtime.assetsRoot)setBundledAssetsRoot(runtime.assetsRoot);return {${names[2]}};})();
    const require_common$2=common,require_workbuddy_product_config=productConfig,require_dev_env_override=devEnvironment;
    ${bodies[3]}
    return {${names[3]},productConfig,devEnvironment,common};
  };`,
  )(fs, os, path);
  return { factory, regions };
}

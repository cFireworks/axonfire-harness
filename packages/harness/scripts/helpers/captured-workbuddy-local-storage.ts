import assert from "node:assert/strict";
import * as nodeFs from "node:fs";
import * as nodePath from "node:path";
import * as nodeOs from "node:os";
import * as nodeCrypto from "node:crypto";
import { createRequire } from "node:module";
import { createNativeAuthenticationRuntime } from "../../src/auth/native-authentication.js";
import { createNativeAuthProductCoordinator } from "../../src/config/native-auth-product-coordinator.js";
import { WORKBUDDY_LOCAL_STORAGE_SOURCE as source } from "../../src/config/native-workbuddy-local-storage.js";
import { getCapturedBundlePath } from "./captured-bundle-path.js";
export function loadCapturedWorkbuddyLocalStorage() {
  const root =
    process.env.WORKBUDDY_DESKTOP_MAIN ??
    nodePath.resolve(nodePath.dirname(getCapturedBundlePath()), "../../main");
  const target = nodeFs.readFileSync(
    new URL(
      "../../src/config/native-workbuddy-local-storage.ts",
      import.meta.url,
    ),
    "utf8",
  );
  let regions = 0;
  const bodies = source.map((g) => {
    const raw = nodeFs.readFileSync(nodePath.join(root, g.file), "utf8");
    assert.equal(
      nodeCrypto.createHash("sha256").update(raw).digest("hex"),
      g.sha256,
    );
    return g.regions
      .map((r) => {
        const text = raw.slice(r.from, r.to);
        assert.ok(target.includes(text), `${g.file}:${r.from}`);
        regions++;
        return text;
      })
      .join("\n");
  });
  const hashBody = bodies[1]!.replace(
    "(function(_HashUtils)",
    "const import_hash=require_hash(),import_spark_md5={default:require_spark_md5()};\n(function(_HashUtils)",
  );
  const factory = new Function(
    "nodeFs",
    "nodePath",
    "nodeOs",
    "nodeRequire",
    "createNativeAuthenticationRuntime",
    "createNativeAuthProductCoordinator",
    `return function(runtime={}){const fs=runtime.fs??nodeFs,path={default:nodePath},os=runtime.os??nodeOs,process=runtime.process??globalThis.process,require=runtime.require??nodeRequire,logger=runtime.logger??console;const import_common$1={Emitter:runtime.Emitter??createNativeAuthenticationRuntime(runtime).getModule(96771).Emitter},require_workbuddy_product_config=runtime.productConfig??createNativeAuthProductCoordinator(runtime).productConfig;const HashUtils=(()=>{${bodies[0]}
const require_chunk={__commonJSMin};var HashUtils;${hashBody}
return HashUtils;})();const require_common$2={HashUtils};${bodies[2]}
return {WorkbuddyFileLocalStorage,HashUtils,LOCAL_STORAGE_FOLDER,ENTRY_PREFIX,ENTRY_EXT};}`,
  )(
    nodeFs,
    nodePath,
    nodeOs,
    createRequire(import.meta.url),
    createNativeAuthenticationRuntime,
    createNativeAuthProductCoordinator,
  );
  return { factory, regions };
}

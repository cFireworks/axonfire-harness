import assert from "node:assert/strict";
import * as nodeFs from "node:fs";
import * as nodeOs from "node:os";
import * as nodePath from "node:path";
import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import { BehaviorSubject } from "rxjs";
import { Emitter } from "vscode-jsonrpc";
import { DESKTOP_PRODUCT_MANAGER_SOURCE as source } from "../../src/config/native-desktop-product-manager.js";
import { createNativeAuthProductCoordinator } from "../../src/config/native-auth-product-coordinator.js";
import { getCapturedBundlePath } from "./captured-bundle-path.js";
export function loadCapturedDesktopProduct() {
  const root =
    process.env.WORKBUDDY_DESKTOP_MAIN ??
    nodePath.resolve(nodePath.dirname(getCapturedBundlePath()), "../../main");
  const target = nodeFs.readFileSync(
    new URL(
      "../../src/config/native-desktop-product-manager.ts",
      import.meta.url,
    ),
    "utf8",
  );
  let regions = 0;
  const bodies = source.map((g) => {
    const raw = nodeFs.readFileSync(nodePath.join(root, g.file), "utf8");
    assert.equal(createHash("sha256").update(raw).digest("hex"), g.sha256);
    return g.regions
      .map((r) => {
        const body = raw.slice(r.from, r.to);
        assert.ok(target.includes(body), `${g.file}:${r.from}`);
        regions++;
        return body;
      })
      .join("\n");
  });
  const factory = new Function(
    "nodeFs",
    "nodeOs",
    "nodePath",
    "require",
    "BehaviorSubject",
    "Emitter",
    "createNativeAuthProductCoordinator",
    `return function(runtime={}){
 const process=runtime.process??globalThis.process,console=runtime.console??globalThis.console,fs=runtime.fs??nodeFs,os=runtime.os??nodeOs,path=nodePath;
 const Date=runtime.Date??globalThis.Date,setTimeout=runtime.setTimeout??globalThis.setTimeout,clearTimeout=runtime.clearTimeout??globalThis.clearTimeout;
 const dependencies=runtime.coordinatorApi??createNativeAuthProductCoordinator(runtime);
 const import_common$42={Emitter:runtime.Emitter??Emitter,ContainerUtil:{get:()=>runtime.logger??console}};
 var ObjectUtils,BooleanUtils,_bun,bunGzip,bunGunzip,_gzipSync,_gunzipSync,GzipUtils,_ProductManagerImpl,DataLevel,ProductManagerImpl;
 const ProductFeature=dependencies.common.ProductFeature;
 ${bodies[0]}
 const {hasProductExperimentOverlay,applyProductExperimentOverlay}=dependencies;
 const {tryGetWorkbuddyBaseProductConfiguration,resolveWorkbuddyProductEnvironmentFromSession}=dependencies.productConfig;
 const require_common$2={...dependencies.common,ProductManagerImpl,ObjectUtils},require_dev_env_override=dependencies.devEnvironment,import_common=runtime.di;
 ${bodies[1]}
 const require_workbuddy_product_config={...dependencies.productConfig,resolveWorkbuddyProductEnvironmentFromSessionFile};
 ${bodies[2]}
 return {WorkbuddyProductManager,ProductManagerImpl,DataLevel,ObjectUtils,BooleanUtils,GzipUtils,getWorkbuddyAuthenticationConfiguration,productConfig:require_workbuddy_product_config};
 }`,
  )(
    nodeFs,
    nodeOs,
    nodePath,
    createRequire(import.meta.url),
    BehaviorSubject,
    Emitter,
    createNativeAuthProductCoordinator,
  );
  return { factory, regions };
}

import { createNativeAppCliEnvironment } from "../../src/terminal/native-app-cli-environment.js";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { getCapturedBundlePath } from "./captured-bundle-path.js";
import { HOSTED_CLI_LIFECYCLE_SOURCE as meta } from "../../src/terminal/native-hosted-cli-lifecycle.js";
import { createNativeCliPrewarmPool } from "../../src/terminal/native-cli-prewarm-pool.js";
export function loadCapturedHostedCliLifecycle() {
  const root =
    process.env.WORKBUDDY_DESKTOP_MAIN ??
    path.resolve(path.dirname(getCapturedBundlePath()), "../../main");
  const sources = new Map<string, string>();
  for (const s of meta.sources) {
    const raw = fs.readFileSync(path.join(root, s.file), "utf8");
    assert.equal(createHash("sha256").update(raw).digest("hex"), s.sha256);
    sources.set(s.file, raw);
  }
  const target = fs.readFileSync(
    new URL(
      "../../src/terminal/native-hosted-cli-lifecycle.ts",
      import.meta.url,
    ),
    "utf8",
  );
  const regions = new Map<string, string>();
  for (const r of meta.regions) {
    const text = sources.get(r.file)!.slice(r.from, r.to);
    assert.ok(target.includes(text));
    regions.set(r.name, text);
  }
  const declarations = [...regions]
    .filter(
      ([n]) =>
        !["bootstrapPoolStatements", "productSnapshotSubscription"].includes(n),
    )
    .map(([, v]) => v)
    .join("\n");
  return new Function(
    "createNativeCliPrewarmPool",
    "createNativeAppCliEnvironment",
    `return function(runtime={}) {
 const process=runtime.process??globalThis.process;
 const cliEnvironment=runtime.cliEnvironment??createNativeAppCliEnvironment({process,gateway:runtime.gateway,os:runtime.os});
 const require_cli_prewarm_pool=runtime.prewarm??createNativeCliPrewarmPool({process});
 ${declarations}
 const require_workbuddy_auth_product_coordinator={APP_CONFIG_KEY_PREWARM_POOL_SIZE,getPrewarmPoolSizeFromAppConfig,parsePrewarmPoolSizeEnv};
 async function initializePrewarmPool({celljs,logger,runtimeManager,codeBackendFactoryOptions,resolveWorkbuddyAppServerCodeCliPath=cliEnvironment.resolveWorkbuddyAppServerCodeCliPath,buildWorkbuddyAppServerCodeCliEnv=cliEnvironment.buildWorkbuddyAppServerCodeCliEnv}) {${regions.get("bootstrapPoolStatements")}\nreturn cliPrewarmPool;}
 function bindProductSnapshot({celljs,logger,runtimeManager,prewarmPool}) {${regions.get("productSnapshotSubscription")}\nreturn productSnapshotSubscription;}
 return {APP_CONFIG_KEY_PREWARM_POOL_SIZE,getPrewarmPoolSizeFromAppConfig,parsePrewarmPoolSizeEnv,persistPrewarmPoolSizeCache,bindHostedCliAuthLifecycle,getHostedCliSessionOwnerKey,initializePrewarmPool,bindProductSnapshot};
 };`,
  )(createNativeCliPrewarmPool, createNativeAppCliEnvironment);
}

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import * as os from "node:os";
import { createHash } from "node:crypto";
import { getCapturedBundlePath } from "./captured-bundle-path.js";
import { APP_CLI_ENVIRONMENT_SOURCE as meta } from "../../src/terminal/native-app-cli-environment.js";
import { createNativeSidecarManager } from "../../src/terminal/native-sidecar-manager.js";
import { createNativeSidecarClientInfo } from "../../src/terminal/native-sidecar-client-info.js";
import { createNativeSidecarCliProductEnvironment } from "../../src/terminal/native-sidecar-cli-product-env.js";
import { createNativeSidecarLogger } from "../../src/terminal/native-sidecar-logger.js";
export function loadCapturedAppCliEnvironment() {
  const root =
    process.env.WORKBUDDY_DESKTOP_MAIN ??
    path.resolve(path.dirname(getCapturedBundlePath()), "../../main");
  const raw = fs.readFileSync(path.join(root, meta.file), "utf8");
  assert.equal(createHash("sha256").update(raw).digest("hex"), meta.sha256);
  const target = fs.readFileSync(
    new URL(
      "../../src/terminal/native-app-cli-environment.ts",
      import.meta.url,
    ),
    "utf8",
  );
  const body = meta.regions
    .map((r) => {
      const t = raw.slice(r.from, r.to);
      assert.ok(target.includes(t));
      return t;
    })
    .join("\n");
  return (runtime: any = {}) => {
    const process = runtime.process ?? globalThis.process;
    return new Function(
      "process",
      "node_os",
      "node_path",
      "require_cli_prewarm_pool",
      "require_cli_product_env",
      "require_client_info_env",
      "require_logger$1",
      body +
        "\nreturn {resolveWorkbuddyAppServerCodeCliPath,buildWorkbuddyAppServerCodeCliEnv,warn};",
    )(
      process,
      runtime.os ?? os,
      path,
      runtime.runtimeHelpers ??
        createNativeSidecarManager({ process, gateway: runtime.gateway }),
      runtime.productEnv ??
        createNativeSidecarCliProductEnvironment({ process }),
      runtime.clientInfo ?? createNativeSidecarClientInfo({ process }),
      runtime.loggerModule ?? createNativeSidecarLogger(),
    );
  };
}

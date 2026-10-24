import { createNativeDesktopAuthentication } from "../../src/auth/native-desktop-authentication.js";
import { createNativeDesktopProductManager } from "../../src/config/native-desktop-product-manager.js";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import * as nodeFs from "node:fs";
import * as nodePath from "node:path";
import * as nodeCrypto from "node:crypto";
import { WORKBUDDY_AUTH_BINDINGS_SOURCE as source } from "../../src/auth/native-workbuddy-auth-bindings.js";
import { getCapturedBundlePath } from "./captured-bundle-path.js";
export function loadCapturedWorkbuddyAuthBindings() {
  const root =
    process.env.WORKBUDDY_DESKTOP_MAIN ??
    nodePath.resolve(nodePath.dirname(getCapturedBundlePath()), "../../main");
  const target = nodeFs.readFileSync(
    new URL(
      "../../src/auth/native-workbuddy-auth-bindings.ts",
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
  const factory = new Function(
    "nodeFs",
    "createNativeDesktopAuthentication",
    "createNativeDesktopProductManager",
    `return function(runtime={}){const process=runtime.process??globalThis.process,fs=runtime.fs??nodeFs,authenticationApi=runtime.authenticationApi??createNativeDesktopAuthentication(runtime);var AuthenticationType,AuthenticationStoragePriority,ENV_KEY_CODEBUDDY_COPILOT_INTERNET_ENVIRONMENT,AuthenticationManager,AGENT_CLI_PRODUCT_CONFIG_PATH_ENV_KEY;${bodies[0]}
${bodies[1]}
const require_common$2={...authenticationApi,AuthenticationType,AuthenticationStoragePriority,ENV_KEY_CODEBUDDY_COPILOT_INTERNET_ENVIRONMENT,AuthenticationManager},require_cli_product_env={readAgentCliProductConfigJsonByKey},require_workbuddy_product_config=runtime.productConfig??createNativeDesktopProductManager(runtime).productConfig;const require_workbuddy_auth_product_coordinator={WorkbuddyAuthProductCoordinator:Symbol('WorkbuddyAuthProductCoordinator')};const import_common$1={ContainerUtil:{get:(id)=>{if(id===AuthenticationManager){const value=runtime.getAuthenticationManager?.()??runtime.authenticationManager;if(value)return value;}if(id===require_workbuddy_auth_product_coordinator.WorkbuddyAuthProductCoordinator){const value=runtime.getCoordinator?.()??runtime.coordinator;if(value)return value;}throw new Error('Workbuddy authentication dependency is not bound');}}};${bodies[2]}
return {authenticationApi,AuthenticationType,AuthenticationStoragePriority,ENV_KEY_CODEBUDDY_COPILOT_INTERNET_ENVIRONMENT,readAgentCliProductConfigJsonByKey,ACC_PRODUCT_CONFIG_ENV_KEYS,BOOTSTRAP_FILE_STORAGE_PRIORITY,WorkbuddyBootstrapAuthenticationStorage,setWorkbuddyAuthSessionSyncer,WorkbuddyAuthenticationManager,WorkbuddyProductEnvService,WorkbuddyUserinfoProvider};}`,
  )(
    nodeFs,
    createNativeDesktopAuthentication,
    createNativeDesktopProductManager,
  );
  return { factory, regions };
}

import assert from "node:assert/strict";
import * as nodeFs from "node:fs";
import * as nodePath from "node:path";
import * as nodeCrypto from "node:crypto";
import { DESKTOP_PRODUCT_ENVIRONMENT_SOURCE as source } from "../../src/auth/native-desktop-product-environment.js";
import { getCapturedBundlePath } from "./captured-bundle-path.js";
export function loadCapturedDesktopProductEnvironment() {
  const root =
    process.env.WORKBUDDY_DESKTOP_MAIN ??
    nodePath.resolve(nodePath.dirname(getCapturedBundlePath()), "../../main");
  const target = nodeFs.readFileSync(
    new URL(
      "../../src/auth/native-desktop-product-environment.ts",
      import.meta.url,
    ),
    "utf8",
  );
  let regions = 0;
  const bodies = [source].map((g) => {
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
  const factory =
    new Function(`return function(runtime={}){const process=runtime.process??globalThis.process;var ProductEnvServiceImpl,ProductEnviroment,ENV_KEY_CODEBUDDY_COPILOT_INTERNET_ENVIRONMENT,AuthenticationManager;const import_common={ContainerUtil:{get:(id)=>{if(id===AuthenticationManager&&runtime.authenticationManager)return runtime.authenticationManager;throw new Error('Desktop authentication manager is not bound');}}};${bodies[0]}
return {ProductEnvServiceImpl,ProductEnviroment,ENV_KEY_CODEBUDDY_COPILOT_INTERNET_ENVIRONMENT,AuthenticationManager};}`)();
  return { factory, regions };
}

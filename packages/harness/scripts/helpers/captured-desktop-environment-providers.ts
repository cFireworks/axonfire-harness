import { fileURLToPath } from "node:url";
import { createNativeDesktopProductInterceptors } from "../../src/http/native-desktop-product-interceptors.js";
import assert from "node:assert/strict";
import * as nodeFs from "node:fs";
import * as nodePath from "node:path";
import * as nodeCrypto from "node:crypto";
import { DESKTOP_ENVIRONMENT_PROVIDERS_SOURCE as source } from "../../src/config/native-desktop-environment-providers.js";
import { getCapturedBundlePath } from "./captured-bundle-path.js";
export function loadCapturedDesktopEnvironmentProviders() {
  const root =
    process.env.WORKBUDDY_DESKTOP_MAIN ??
    nodePath.resolve(nodePath.dirname(getCapturedBundlePath()), "../../main");
  const target = nodeFs.readFileSync(
    new URL(
      "../../src/config/native-desktop-environment-providers.ts",
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
    "node_path",
    "defaultDir",
    "createNativeDesktopProductInterceptors",
    `return function(runtime={}){const process=runtime.process??globalThis.process,__dirname=runtime.dirname??defaultDir;var ProductProviderPriority;${bodies[0]}
const interceptors=runtime.interceptors??createNativeDesktopProductInterceptors(runtime),require_common$2={ProductProviderPriority,setProductEndpointOverride:interceptors.setProductEndpointOverride};${bodies[1]}
return {ProductProviderPriority,interceptors,setDevEnvEndpointResolver,WorkbuddyDevEnvEndpointProductProvider,WorkbuddyInternetEnviromentProductProvider};}`,
  )(
    nodePath,
    nodePath.dirname(fileURLToPath(import.meta.url)),
    createNativeDesktopProductInterceptors,
  );
  return { factory, regions };
}

import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import * as nodeFs from "node:fs";
import * as nodePath from "node:path";
import * as nodeCrypto from "node:crypto";
import { DESKTOP_CLIENT_PRODUCT_SOURCE as source } from "../../src/config/native-desktop-client-product.js";
import { getCapturedBundlePath } from "./captured-bundle-path.js";
export function loadCapturedDesktopClientProduct() {
  const root =
    process.env.WORKBUDDY_DESKTOP_MAIN ??
    nodePath.resolve(nodePath.dirname(getCapturedBundlePath()), "../../main");
  const target = nodeFs.readFileSync(
    new URL(
      "../../src/config/native-desktop-client-product.ts",
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
    "path",
    "defaultDir",
    `return function(runtime={}){const process=runtime.process??globalThis.process,__dirname=runtime.dirname??defaultDir;var ProductProviderPriority,BooleanUtils,ENV_KEY_CODEBUDDY_DISABLE_BUILTIN_MODELS,ClientProductProvider;${bodies[0]}
const require_common$2={ProductProviderPriority,stripBuiltinModelsIfDisabled};${bodies[1]}
return {ClientProductProvider,ProductProviderPriority,BooleanUtils,ENV_KEY_CODEBUDDY_DISABLE_BUILTIN_MODELS,isBuiltinModelsDisabled,stripBuiltinModelsIfDisabled};}`,
  )(nodePath, nodePath.dirname(fileURLToPath(import.meta.url)));
  return { factory, regions };
}

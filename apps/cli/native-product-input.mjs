// Launcher boundary only. Managed spills stay on disk for the original provider.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export function prepareNativeProductInput(env, { informational = false } = {}) {
  function readObject(file) {
    const config = JSON.parse(readFileSync(resolve(file), "utf8"));
    if (!config || typeof config !== "object" || Array.isArray(config))
      throw new Error("Native product configuration must be a JSON object");
    return config;
  }
  if (env.AXONFIRE_NATIVE_PRODUCT_CONFIG)
    env.ACC_PRODUCT_CONFIG_V3 = JSON.stringify(
      readObject(env.AXONFIRE_NATIVE_PRODUCT_CONFIG),
    );
  if (informational || env.ACC_PRODUCT_CONFIG_V3) return;
  if (env.ACC_PRODUCT_CONFIG_PATH) {
    readObject(env.ACC_PRODUCT_CONFIG_PATH);
    return;
  }
  throw new Error(
    "Set AXONFIRE_NATIVE_PRODUCT_CONFIG to your product JSON file, or provide ACC_PRODUCT_CONFIG_V3 / ACC_PRODUCT_CONFIG_PATH. See docs/native-product-runtime.md.",
  );
}

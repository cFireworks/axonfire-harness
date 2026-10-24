import { test } from "node:test";
import { createNativeProductModules } from "../src/runtime/native-product-modules.js";
import { productModulesScenario } from "../scripts/helpers/product-modules-scenarios.js";
test("product module loader is explicit and preserves real navigation, undo and record/replay bindings", async () => {
  await productModulesScenario(createNativeProductModules);
});

import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
test("full product runtime serves original HTTP and authenticated ACP model/tool turns in an owned process", async () => {
  const js = fileURLToPath(
    new URL("../scripts/helpers/product-bootstrap-child.js", import.meta.url),
  );
  const source = !existsSync(js),
    file = source ? js.replace(/\.js$/, ".ts") : js;
  const { stdout } = await promisify(execFile)(
    process.execPath,
    [...(source ? ["--import", "tsx"] : []), file],
    { timeout: 25000, maxBuffer: 1024 * 1024 },
  );
  assert.match(stdout, /PRODUCT_BOOTSTRAP_OK/);
  assert.match(stdout, /PRODUCT_HTTP_HEALTH_OK/);
  assert.match(stdout, /PRODUCT_GATEWAY_OPENAPI_OK/);
  assert.match(stdout, /PRODUCT_ACP_INITIALIZE_OK/);
  assert.match(stdout, /PRODUCT_ACP_SESSION_NEW_OK/);
  assert.match(stdout, /PRODUCT_ACP_PROMPT_OK/);
  assert.match(stdout, /PRODUCT_ACP_TOOL_OK/);
  assert.match(stdout, /PRODUCT_APPLICATION_READY/);
  assert.match(stdout, /PRODUCT_APPLICATION_STOPPED/);
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { prepareNativeProductInput } from "../native-product-input.mjs";

test("launcher preserves explicit file precedence and leaves inline/path overlays for original providers", () => {
  const root = mkdtempSync(join(tmpdir(), "axon-product-input-"));
  try {
    const file = join(root, "input.json"),
      missing = join(root, "missing.json");
    writeFileSync(file, JSON.stringify({ models: [{ id: "explicit" }] }));
    const env = {
      AXONFIRE_NATIVE_PRODUCT_CONFIG: file,
      ACC_PRODUCT_CONFIG_V3: "inline",
      ACC_PRODUCT_CONFIG_PATH: missing,
    };
    prepareNativeProductInput(env);
    assert.deepEqual(JSON.parse(env.ACC_PRODUCT_CONFIG_V3), {
      models: [{ id: "explicit" }],
    });
    assert.equal(env.ACC_PRODUCT_CONFIG_PATH, missing);
    const inline = {
      ACC_PRODUCT_CONFIG_V3: "{}",
      ACC_PRODUCT_CONFIG_PATH: missing,
    };
    prepareNativeProductInput(inline);
    assert.deepEqual(inline, {
      ACC_PRODUCT_CONFIG_V3: "{}",
      ACC_PRODUCT_CONFIG_PATH: missing,
    });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("launcher rejects missing/invalid managed snapshots without importing their bytes into env", () => {
  const root = mkdtempSync(join(tmpdir(), "axon-product-input-"));
  try {
    const file = join(root, "input.json");
    assert.throws(
      () => prepareNativeProductInput({}),
      /ACC_PRODUCT_CONFIG_PATH/,
    );
    assert.throws(
      () => prepareNativeProductInput({ ACC_PRODUCT_CONFIG_PATH: file }),
      { code: "ENOENT" },
    );
    for (const input of ["[]", "null", '"string"', "{"]) {
      writeFileSync(file, input);
      const env = { ACC_PRODUCT_CONFIG_PATH: file };
      assert.throws(() => prepareNativeProductInput(env));
      assert.deepEqual(env, { ACC_PRODUCT_CONFIG_PATH: file });
    }
    prepareNativeProductInput({}, { informational: true });
    prepareNativeProductInput(
      { ACC_PRODUCT_CONFIG_PATH: file },
      { informational: true },
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

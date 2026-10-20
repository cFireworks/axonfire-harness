import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  ORIGINAL_CONFIG_SHA256,
  verifyDefaultConfiguration,
} from "../src/config/product-config.js";
import { loadMemoryPolicy } from "../src/memory/memory-extraction-prompts.js";

const files = {
  default: "product.json",
  cloudhosted: "product.cloudhosted.json",
  internal: "product.internal.json",
  ioa: "product.ioa.json",
  selfhosted: "product.selfhosted.json",
  sandbox: "sandbox-config.json",
} as const;

for (const [name, filename] of Object.entries(files)) {
  const bytes = await readFile(resolve("config/original", filename));
  const actual = createHash("sha256").update(bytes).digest("hex");
  const expected =
    ORIGINAL_CONFIG_SHA256[name as keyof typeof ORIGINAL_CONFIG_SHA256];
  if (actual !== expected) {
    throw new Error(`${filename}: expected ${expected}, got ${actual}`);
  }
}

const result = await verifyDefaultConfiguration();
await loadMemoryPolicy();
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);

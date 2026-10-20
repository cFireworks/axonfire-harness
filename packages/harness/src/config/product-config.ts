import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type {
  ProductAgent,
  ProductConfig,
  ProductModel,
  ProductPrompt,
  ProductTool,
  ProductVariant,
} from "./types.js";

const MODULE_DIR = dirname(fileURLToPath(import.meta.url));
const CONFIG_DIR = [resolve(MODULE_DIR, "../../config/original"), resolve(MODULE_DIR, "../../../config/original")]
  .find((directory) => existsSync(resolve(directory, "product.json"))) ?? resolve(MODULE_DIR, "../../config/original");

export function originalConfigPath(filename: string): string { return resolve(CONFIG_DIR, filename); }

export const ORIGINAL_CONFIG_SHA256 = {
  default: "548ba3b51f32afa72ca651cf37d8b181865e3386a3a5aaf4e2ffd73bd257dd00",
  cloudhosted:
    "57b19561eeda34ccd97ce49da8bd3bc55a7900b5e585dfcc53ed587ab384fd38",
  internal: "fbc03999a6999c67d2223ba54ced7a378f4b12468486ad2f5538afcb4098f101",
  ioa: "c44b8b544d2a87333c6e0fd630f77f2df270c0bab7aad5991c9f9a2a10e71944",
  selfhosted:
    "51dc9de4edf042d44cfef17d8ae9031d1dc97b420fa7d92a2a911e63b378f1fb",
  sandbox: "fe85a6a4e1cae2a42699705f12a7fb8538ef05de8351a9ae63b3a226374eb2bb",
} as const;

const VARIANT_FILES: Record<ProductVariant, string> = {
  default: "product.json",
  cloudhosted: "product.cloudhosted.json",
  internal: "product.internal.json",
  ioa: "product.ioa.json",
  selfhosted: "product.selfhosted.json",
};

export class ProductConfiguration {
  readonly agentsByName: ReadonlyMap<string, ProductAgent>;
  readonly toolsByName: ReadonlyMap<string, ProductTool>;
  readonly modelsById: ReadonlyMap<string, ProductModel>;
  readonly promptsByName: ReadonlyMap<string, ProductPrompt>;

  constructor(readonly raw: ProductConfig) {
    this.agentsByName = indexMap(raw.agents, (item) => item.name);
    this.toolsByName = indexMap(raw.tools, (item) => item.name);
    this.modelsById = indexMap(raw.models, (item) => item.id);
    this.promptsByName = indexMap(raw.prompts, (item) => item.name);
  }

  get defaultAgent(): ProductAgent {
    const agent = this.raw.agents.find((candidate) =>
      candidate.tags?.includes("default"),
    );
    if (!agent) throw new Error("Product configuration has no default agent");
    return agent;
  }

  findModelByIdNameOrAlias(value: string): ProductModel | undefined {
    return this.raw.models.find(
      (model) =>
        model.id === value ||
        model.name === value ||
        model.aliases?.includes(value) === true,
    );
  }

  promptCharacters(): number {
    return this.raw.prompts.reduce(
      (sum, prompt) => sum + prompt.template.length,
      0,
    );
  }

  promptCodePoints(): number {
    return this.raw.prompts.reduce(
      (sum, prompt) => sum + [...prompt.template].length,
      0,
    );
  }
}

export async function loadProductConfiguration(
  variant: ProductVariant = "default",
): Promise<ProductConfiguration> {
  const path = resolve(CONFIG_DIR, VARIANT_FILES[variant]);
  const bytes = await readFile(path);
  const parsed = JSON.parse(bytes.toString("utf8")) as ProductConfig;
  validateMinimumShape(parsed, path);
  return new ProductConfiguration(parsed);
}

export async function verifyDefaultConfiguration(): Promise<{
  sha256: string;
  agents: number;
  tools: number;
  models: number;
  prompts: number;
  promptCharacters: number;
  promptCodePoints: number;
}> {
  const path = resolve(CONFIG_DIR, VARIANT_FILES.default);
  const bytes = await readFile(path);
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  if (sha256 !== ORIGINAL_CONFIG_SHA256.default) {
    throw new Error(
      `product.json SHA-256 mismatch: expected ${ORIGINAL_CONFIG_SHA256.default}, got ${sha256}`,
    );
  }
  const config = await loadProductConfiguration();
  const result = {
    sha256,
    agents: config.raw.agents.length,
    tools: config.raw.tools.length,
    models: config.raw.models.length,
    prompts: config.raw.prompts.length,
    promptCharacters: config.promptCharacters(),
    promptCodePoints: config.promptCodePoints(),
  };
  const expected = {
    agents: 19,
    tools: 48,
    models: 44,
    prompts: 115,
    promptCharacters: 284_902,
    promptCodePoints: 284_899,
  };
  for (const [key, value] of Object.entries(expected)) {
    if (result[key as keyof typeof expected] !== value) {
      throw new Error(
        `product.json ${key} mismatch: expected ${value}, got ${result[key as keyof typeof expected]}`,
      );
    }
  }
  return result;
}

function validateMinimumShape(value: ProductConfig, path: string): void {
  if (!value || typeof value !== "object")
    throw new Error(`Invalid config: ${path}`);
  for (const key of ["agents", "tools", "models", "prompts"] as const) {
    if (!Array.isArray(value[key]))
      throw new Error(`Invalid ${key} in ${path}`);
  }
}

function indexMap<T>(
  items: readonly T[],
  keyOf: (item: T) => string,
): ReadonlyMap<string, T> {
  const result = new Map<string, T>();
  for (const item of items) {
    const key = keyOf(item);
    result.set(key, item);
  }
  return result;
}

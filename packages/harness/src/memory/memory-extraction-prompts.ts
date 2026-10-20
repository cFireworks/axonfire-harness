import { readFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { originalConfigPath } from "../config/product-config.js";
import { createMemoryPromptBuilder } from "./memory-prompt-builder.js";

export const MEMORY_POLICY_SHA256 =
  "6d2bdeeef7bef8029396250abc25823d6db6784fe486dc6160ac35b7ba5729b0";
export function loadMemoryPolicySync(): MemoryPolicy {
  const bytes = readFileSync(originalConfigPath("memory-policy.json"));
  const hash = createHash("sha256").update(bytes).digest("hex");
  if (hash !== MEMORY_POLICY_SHA256)
    throw Error(`Memory policy SHA-256 mismatch: ${hash}`);
  return JSON.parse(bytes.toString("utf8")) as MemoryPolicy;
}
type MemoryPolicy = {
  TYPES_SECTION_INDIVIDUAL: string[];
  WHAT_NOT_TO_SAVE_SECTION: string[];
  MEMORY_FRONTMATTER_EXAMPLE: string[];
  MAX_ENTRYPOINT_BYTES: number;
  MAX_ENTRYPOINT_LINES: number;
  ENTRYPOINT_NAME: string;
  [key: string]: unknown;
};
let policyPromise: Promise<MemoryPolicy> | undefined;
export function loadMemoryPolicy(): Promise<MemoryPolicy> {
  return (policyPromise ??= (async () => {
    const bytes = await readFile(originalConfigPath("memory-policy.json"));
    const hash = createHash("sha256").update(bytes).digest("hex");
    if (hash !== MEMORY_POLICY_SHA256)
      throw new Error(`Memory policy SHA-256 mismatch: ${hash}`);
    return JSON.parse(bytes.toString("utf8")) as MemoryPolicy;
  })());
}

/** Public compatibility names, forwarded to the synchronous original builder. */
export function memoryExtractionPromptsOpener(
  count: number,
  manifest: string,
): string {
  return createMemoryPromptBuilder({}, {}).memory_extraction_prompts_opener(
    count,
    manifest,
  );
}
export function buildExtractPrompt(count: number, manifest: string): string {
  return createMemoryPromptBuilder(
    loadMemoryPolicySync(),
    {},
  ).buildExtractPrompt(count, manifest);
}

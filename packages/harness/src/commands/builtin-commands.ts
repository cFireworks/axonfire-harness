import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import type { ProductCommand } from "./types.js";

const filename = [new URL("../../config/recovered-builtin-commands.json", import.meta.url), new URL("../../../config/recovered-builtin-commands.json", import.meta.url)]
  .map((url) => fileURLToPath(url)).find(existsSync);
if (!filename) throw new Error("Missing recovered built-in command catalog");
const catalog = JSON.parse(readFileSync(filename, "utf8")) as { normal: ProductCommand[]; conditional: ProductCommand[] };
export const NON_MODEL_COMMANDS: readonly ProductCommand[] = catalog.normal;
/** Conditional command metadata; host availability is separate from model-invocation eligibility. */
export const CONDITIONAL_COMMANDS: readonly { command: ProductCommand; isEnabled(features?: () => Promise<Record<string, unknown>>): Promise<boolean> }[] = catalog.conditional.map((command) => ({ command,
  async isEnabled(features) {
    const flag = command.name === "/model:text-to-image" ? "CODEBUDDY_IMAGE_GEN_ENABLED" : command.name === "/model:image-to-image" ? "CODEBUDDY_IMAGE_EDIT_ENABLED" : "CODEBUDDY_VIDEO_GEN_ENABLED";
    const value = process.env[flag]; if (value !== undefined) return value === "true" || value === "1";
    const feature = command.name === "/model:text-to-image" ? "ImageGen" : command.name === "/model:image-to-image" ? "ImageEdit" : "VideoGen";
    return ((await features?.())?.[feature] ?? false) as boolean;
  },
}));
export function getAllowedBuiltinCommands(): Set<string> {
  return new Set([...NON_MODEL_COMMANDS, ...CONDITIONAL_COMMANDS.map((entry) => entry.command)].filter((command) => !command.disableModelInvocation).map((command) => command.name));
}

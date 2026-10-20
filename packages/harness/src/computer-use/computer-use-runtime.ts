import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
export const ENV_KEY_CODEBUDDY_COMPUTER_USE_ENABLED =
  "CODEBUDDY_COMPUTER_USE_ENABLED";
export type ComputerUseRuntime = {
  platform: NodeJS.Platform;
  env: NodeJS.ProcessEnv;
  getHomeDir(): string;
  now(): number;
  execFile(
    file: string,
    args: readonly string[],
    options: { timeout: number },
  ): Promise<{ stdout: string; stderr?: string }>;
  mkdir: typeof mkdir;
  readFile: typeof readFile;
  setTimeout: typeof setTimeout;
  clearTimeout: typeof clearTimeout;
  debug(...args: any[]): void;
  logger: { warn?(...args: any[]): void };
};
const execute = promisify(execFile);
/** Native PathUtils.getHomeDir returns the nonempty raw env value, untrimmed. */
export function computerUseHomeDir(env = process.env): string {
  const configured = env.CODEBUDDY_CONFIG_DIR;
  return configured && configured.trim() !== ""
    ? configured
    : join(homedir(), ".codebuddy");
}
export function createComputerUseRuntime(
  options: Partial<ComputerUseRuntime> = {},
): ComputerUseRuntime {
  return {
    platform: process.platform,
    env: process.env,
    getHomeDir: () => computerUseHomeDir(options.env ?? process.env),
    now: Date.now,
    execFile: (file, args, opts) => execute(file, [...args], opts),
    mkdir,
    readFile,
    setTimeout,
    clearTimeout,
    debug: (...args) => console.error(...args),
    logger: {},
    ...options,
  };
}

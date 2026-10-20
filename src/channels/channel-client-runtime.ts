import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import * as crypto from "node:crypto";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
export type ChannelClientIoRuntime = {
  fs: typeof fs;
  path: typeof path;
  os: typeof os;
  crypto: typeof crypto;
  env: NodeJS.ProcessEnv;
  pid: number;
  getHomeDir(): string;
  now(): number;
  random(): number;
  fetch: typeof fetch;
  AbortController: typeof AbortController;
  timeoutSignal(milliseconds: number): AbortSignal;
  setTimeout: typeof setTimeout;
  clearTimeout: typeof clearTimeout;
  setInterval: typeof setInterval;
  clearInterval: typeof clearInterval;
  stderrWrite(value: string): unknown;
  generateTerminalQRCode(text: string, options?: any): Promise<string>;
  isBun: boolean;
  globalWebSocket: any;
  loadWebSocketModule(): any;
};
/** Original QR renderer options and empty-string fallback; qrcode remains a dependency. */
export async function generateTerminalQRCode(
  text: string,
  options?: any,
): Promise<string> {
  try {
    return (
      await require("qrcode").toString(text, {
        type: "utf8",
        errorCorrectionLevel: "M",
        margin: 0,
        version: options?.version,
      })
    ).trimEnd();
  } catch {
    return "";
  }
}
export function getQRCodeVersion(text: string): number {
  try {
    return require("qrcode").create(text, { errorCorrectionLevel: "M" })
      .version;
  } catch {
    return 1;
  }
}
export function createChannelClientIoRuntime(
  options: Partial<ChannelClientIoRuntime> = {},
): ChannelClientIoRuntime {
  return {
    fs,
    path,
    os,
    crypto,
    env: process.env,
    pid: process.pid,
    getHomeDir: () => {
      const value = (options.env ?? process.env).CODEBUDDY_CONFIG_DIR;
      return value && value.trim() !== ""
        ? value
        : path.join(os.homedir(), ".codebuddy");
    },
    now: Date.now,
    random: Math.random,
    fetch,
    AbortController,
    timeoutSignal: AbortSignal.timeout,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    stderrWrite: (value) => process.stderr.write(value),
    generateTerminalQRCode,
    isBun: typeof (globalThis as any).Bun !== "undefined",
    globalWebSocket: globalThis.WebSocket,
    loadWebSocketModule: () => ({ default: require("ws-native") }),
    ...options,
  };
}

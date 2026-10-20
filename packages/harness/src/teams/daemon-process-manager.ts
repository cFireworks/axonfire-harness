import { fork } from "node:child_process";
import { mkdir, open, access } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
export const ENV_SESSION_KIND = "CODEBUDDY_SESSION_KIND", ENV_SESSION_NAME = "CODEBUDDY_SESSION_NAME", ENV_SESSION_LOG = "CODEBUDDY_SESSION_LOG";
export type ForkResult = { pid: number; logPath: string };
export type BackgroundForkOptions = { name?: string; cwd?: string; skipPrintMode?: boolean; skipAutoApprove?: boolean; extraEnv?: NodeJS.ProcessEnv };
export type TeamProcessManager = {
  forkBgSession(args: string[], options: BackgroundForkOptions): Promise<ForkResult>;
  sendSignal(pid: number, signal: NodeJS.Signals): boolean;
  isProcessRunning(pid: number): boolean;
  waitForExit(pid: number, timeoutMs?: number): Promise<boolean>;
};
export type DaemonForkOptions = { logDir?: string; startupArgs?: string[]; host?: string; port?: number; permissionMode?: string };
/** 8975002..8978316. Path/entry/env/extra-args hooks are standalone host adapters. */
export class DaemonProcessManager implements TeamProcessManager {
  constructor(readonly paths: { logDir(): string; entryPath?(): Promise<string>; extraArgs?: readonly string[]; execArgv?: string[]; env?: NodeJS.ProcessEnv; onFork?(pid: number): void }) {}
  async forkDaemon(options: DaemonForkOptions, extraEnv?: NodeJS.ProcessEnv): Promise<ForkResult> {
    const directory = options.logDir || this.getLogDir(); await mkdir(directory, { recursive: true });
    const logPath = join(directory, `daemon-${Date.now()}.log`), args = this.buildDaemonChildArgs(options), env: NodeJS.ProcessEnv = { ...process.env, [ENV_SESSION_KIND]: "daemon", ...extraEnv };
    if (!options.host || options.host === "127.0.0.1" || options.host === "localhost") env.CODEBUDDY_GATEWAY_AUTH = "none";
    if (options.port) env.SERVER__PORT = String(options.port);
    if (options.host && options.host !== "127.0.0.1") env.SERVER__HOST = options.host;
    return this.forkDetached(args, { env, logPath, cwd: process.cwd() });
  }
  buildDaemonChildArgs(options: DaemonForkOptions): string[] {
    const args = ["--serve", ...(options.startupArgs ?? this.getInheritableArgs())], modePresent = this.hasFlagWithValue(args, "--permission-mode"), bypass = args.includes("-y") || args.includes("--dangerously-skip-permissions");
    if (!modePresent) { const mode = bypass ? "bypassPermissions" : options.permissionMode; if (mode) args.push("--permission-mode", mode); } return args;
  }
  async forkBgSession(args: string[], options: BackgroundForkOptions): Promise<ForkResult> {
    const directory = this.getLogDir(); await mkdir(directory, { recursive: true });
    const name = options.name || `bg-${Date.now()}`, logPath = join(directory, `${name}.log`), filtered = this.filterBgArgs(args);
    if (!options.skipPrintMode) this.ensureArg(filtered, "--print", "-p");
    if (!options.skipAutoApprove) this.ensureArg(filtered, "-y", "--dangerously-skip-permissions");
    const env = { ...process.env, [ENV_SESSION_KIND]: "bg", [ENV_SESSION_NAME]: name, [ENV_SESSION_LOG]: logPath, ...options.extraEnv };
    return this.forkDetached(filtered, { env, logPath, cwd: options.cwd || process.cwd() });
  }
  sendSignal(pid: number, signal: NodeJS.Signals): boolean { if (!Number.isInteger(pid) || pid <= 0 || pid === process.pid) return false; try { process.kill(pid, signal); return true; } catch { return false; } }
  isProcessRunning(pid: number): boolean { if (!Number.isInteger(pid) || pid <= 0) return false; try { process.kill(pid, 0); return true; } catch { return false; } }
  async waitForExit(pid: number, timeoutMs = 10000): Promise<boolean> { const end = Date.now() + timeoutMs; while (Date.now() < end) { if (!this.isProcessRunning(pid)) return true; await new Promise((done) => setTimeout(done, 200)); } return false; }
  getLogDir(): string { return this.paths.logDir(); }
  async getEntryPath(): Promise<string> { if (this.paths.entryPath) return this.paths.entryPath(); if (process.argv[1]) return resolve(process.argv[1]); const directory = dirname(fileURLToPath(import.meta.url)); for (const path of [resolve(directory, "../../codebuddy.js"), resolve(directory, "../../../bin/codebuddy")]) try { await access(path); return path; } catch {} throw new Error("Cannot find CLI entry path for fork"); }
  async forkDetached(args: string[], options: { env: NodeJS.ProcessEnv; logPath: string; cwd: string }): Promise<ForkResult> {
    const file = await open(options.logPath, "a");
    try { const forkOptions: import("node:child_process").ForkOptions & { windowsHide: boolean } = { detached: true, stdio: ["ignore", file.fd, file.fd, "ipc"], env: { ...options.env, ...this.paths.env }, cwd: options.cwd, windowsHide: true, ...(this.paths.execArgv ? { execArgv: this.paths.execArgv } : {}) }; const child = fork(await this.getEntryPath(), [...args, ...this.paths.extraArgs ?? []], forkOptions); if (!child.pid) throw new Error("Failed to fork child process: no PID assigned"); const pid = child.pid; child.unref(); child.disconnect(); this.paths.onFork?.(pid); return { pid, logPath: options.logPath }; }
    finally { await file.close(); }
  }
  filterBgArgs(args: string[]): string[] { const output: string[] = []; let skip = false; for (const arg of args) { if (skip) { skip = false; continue; } if (arg !== "--bg" && arg !== "--background") { if (arg === "--name") { skip = true; continue; } if (!arg.startsWith("--name=")) output.push(arg); } } return output; }
  ensureArg(args: string[], first: string, alias: string): void { if (!args.includes(first) && !args.includes(alias)) args.unshift(first); }
  hasFlagWithValue(args: string[], flag: string): boolean { return args.some((arg) => arg === flag || arg.startsWith(`${flag}=`)); }
  getInheritableArgs(): string[] {
    const flags = new Set(["daemon", "start", "stop", "status", "restart", "--serve", "--print", "-p", "--acp", "--continue", "-c", "--resume", "-r", "--version", "-v", "--help", "-h", "--open", "--bg", "--background"]), values = new Set(["--port", "--host", "--session-id", "--sandbox", "--sandbox-id", "--teleport", "--output-format", "--input-format"]), input = process.argv.slice(2), result: string[] = []; let skip = false;
    for (const arg of input) { if (skip) { skip = false; continue; } if (flags.has(arg)) continue; if (values.has(arg)) { skip = true; continue; } if (!values.has(arg.split("=")[0]!)) result.push(arg); } return result;
  }
}

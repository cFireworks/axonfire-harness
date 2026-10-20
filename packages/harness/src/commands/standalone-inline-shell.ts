import { spawn } from "node:child_process";
import type { HarnessSession } from "../sessions/session.js";
import { BoundedOutput } from "../tools/core-shell-tools.js";
import type { InlineShellProcess, InlineShellService } from "./custom-command-renderer.js";

/** Standalone adapter, not the original sandbox/PTY ShellService. */
export class StandaloneInlineShell implements InlineShellService {
  constructor(private readonly workDir: string | (() => string), private readonly currentSession: () => HarnessSession | undefined) {}
  async execute({ command }: { command: string }): Promise<InlineShellProcess> {
    const session = this.currentSession(); session?.abortSignal.throwIfAborted();
    const cwd = typeof this.workDir === "function" ? this.workDir() : session?.options.workDir ?? this.workDir, output = new BoundedOutput(50 * 1024 * 1024), errors = new BoundedOutput(50 * 1024 * 1024);
    const child = spawn(process.platform === "win32" ? "bash" : "/bin/sh", ["-c", command], { cwd,
      env: { ...process.env, CODEBUDDY_PROJECT_DIR: cwd, CLAUDE_PROJECT_DIR: cwd, ...(session ? { CODEBUDDY_SESSION_ID: session.id, CLAUDE_SESSION_ID: session.id } : {}) },
      ...(session ? { signal: session.abortSignal } : {}), stdio: ["ignore", "pipe", "pipe"] });
    child.stdout.on("data", (chunk: Buffer) => output.push(chunk)); child.stderr.on("data", (chunk: Buffer) => errors.push(chunk));
    const completion = new Promise<{ stdout: string; stderr: string }>((resolve, reject) => { child.once("error", reject); child.once("close", () => resolve({ stdout: output.toString(), stderr: errors.toString() })); });
    return { wait: () => completion, dispose: () => { if (child.exitCode === null && !child.killed) child.kill(); } };
  }
}

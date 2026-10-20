import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import type { SettingsManager } from "../models/model-provider.js";
import type { HarnessSession } from "../sessions/session.js";
import type { RegisteredToolHandler, ToolManager } from "./tool-manager.js";

export const DEFAULT_BASH_TIMEOUT_MS = 120_000;
export const DEFAULT_BASH_MAX_TIMEOUT_MS = 600_000;
export const DEFAULT_BASH_MAX_OUTPUT_LENGTH = 30_000;
export const MAX_BASH_OUTPUT_LENGTH_CAP = 150_000;
export const DEFAULT_BASH_BACKGROUND_MAX_OUTPUT_BYTES = 50 * 1024 * 1024;

const bashCommandDescription =
  process.platform === "win32"
    ? "This tool runs Git Bash (POSIX sh), not cmd.exe or PowerShell. Use Unix shell syntax: `/dev/null` not `NUL`, forward slashes, `$VAR` not `%VAR%` or `$env:VAR`."
    : "The command to execute";

export const bashParameters = z.object({
  command: z.string().describe(bashCommandDescription),
  timeout: z.coerce
    .number()
    .optional()
    .describe(
      "Optional timeout in milliseconds. Omit to use the system default; the effective max is clamped by `BASH_MAX_TIMEOUT_MS` (env) / `settings.env.BASH_MAX_TIMEOUT_MS`. See the tool description for the concrete default/max values active in this session.",
    ),
  description: z
    .string()
    .optional()
    .describe(`Clear, concise description of what this command does in active voice.
Never use words like "complex" or "risk" in the description.

For simple commands (git, npm, standard CLI tools), keep it brief (5-10 words):
  - ls → "List files in current directory"
  - git status → "Show working tree status"
  - npm install → "Install package dependencies"

For commands that are harder to parse at a glance (piped commands, obscure flags):
  - find . -name "*.tmp" -exec rm {} \\; → "Find and delete all .tmp files recursively"
  - git reset --hard origin/main → "Discard all local changes and match remote main"
  - curl -s url | jq '.data[]' → "Fetch JSON from URL and extract data array elements"

Language MUST follow the <response_language> in system prompt, or the user's input language (most likely Chinese).`),
  run_in_background: z
    .boolean()
    .optional()
    .describe(
      "Set to true to run this command in the background. Use BashOutput to read the output later.",
    ),
  dangerouslyDisableSandbox: z
    .boolean()
    .optional()
    .describe(`Set to true ONLY when you are confident the command requires operating outside the sandbox and expect the user to approve it.

When true, the tool asks the user for explicit consent and — if granted — runs the command with no sandbox isolation. The user can still refuse.

Do NOT set this preemptively. Only use it after a prior sandboxed attempt has failed due to sandbox policy (SANDBOX PERMISSION DENIED in a previous result) or when the task semantically cannot run sandboxed (e.g. installing a system package, modifying files outside the workspace).`),
});

const powershellGuidance = `The PowerShell command to execute.

Windows GUI/ACP guidance:
- Prefer built-in PowerShell cmdlets for file/path/text/HTTP work when they are a natural fit.
- In supported WorkBuddy Desktop Windows sessions, ordinary console-native commands can run through PowerShell when ConPTY is enabled by the host.
- Do not use PowerShell to launch detached or GUI processes such as Start-Process, cmd /c start, .NET Process.Start(...), Add-Type launchers, or GUI executables unless the user explicitly asks for that behavior.
- If a dedicated tool exists for the task, prefer that tool over PowerShell.`;

export const powershellParameters = z.object({
  command: z
    .string()
    .describe(`${powershellGuidance}

In standalone CLI, ConPTY is disabled by default; set CODEBUDDY_POWERSHELL_USE_PTY=1 to opt in. WorkBuddy Desktop enables it for Windows ACP sessions.`),
  timeout: z.coerce
    .number()
    .optional()
    .describe("Optional timeout in milliseconds (max 600000)"),
  description: z
    .string()
    .optional()
    .describe("Clear, concise description of what this command does"),
  run_in_background: z
    .boolean()
    .optional()
    .describe(
      "Set to true to run this PowerShell command in the background and return a task_id. Use TaskOutput with the returned task_id to poll progress or fetch the completed output. If you forget run_in_background on a long command and it hits the foreground timeout, the command will auto-background instead of being killed (no state loss), the only exception being Start-Sleep/sleep.",
    ),
  dangerouslyDisableSandbox: z
    .boolean()
    .optional()
    .describe(
      "Set to true ONLY when the command genuinely needs to run outside the sandbox and you expect the user to approve it. The tool prompts the user first and only bypasses when consent is given. Do NOT set preemptively; prefer letting the sandbox attempt fail and trigger the escalation flow.",
    ),
});

export type BackgroundTaskStatus = "running" | "completed" | "failed" | "killed";

export type BackgroundShellTask = {
  id: string;
  toolName: "Bash" | "PowerShell";
  title: string;
  startTime: number;
  endTime?: number;
  status: BackgroundTaskStatus;
  sessionId: string;
  stdout: BoundedOutput;
  stderr: BoundedOutput;
  child: ChildProcessWithoutNullStreams;
  kill(): Promise<void>;
};

export type ShellToolResult = {
  content: string;
  error?: string;
  renderer?: { type: "text"; value: string };
  rawResponse?: {
    exitCode?: number | null;
    signal?: string | null;
    interrupted?: boolean;
    sandboxDenied?: boolean;
    stderrBytesTruncated?: number;
    stdoutBytesTruncated?: number;
    tool_error_code?: string;
    is_error?: boolean;
    error?: string;
  };
};

export class BackgroundTaskManager {
  private readonly tasks = new Map<string, BackgroundShellTask>();

  add(task: BackgroundShellTask): void {
    this.tasks.set(task.id, task);
  }

  get(id: string): BackgroundShellTask | undefined {
    return this.tasks.get(id);
  }

  list(sessionId?: string): BackgroundShellTask[] {
    return [...this.tasks.values()].filter(
      (task) => !sessionId || task.sessionId === sessionId,
    );
  }

  async kill(id: string): Promise<boolean> {
    const task = this.tasks.get(id);
    if (!task) return false;
    await task.kill();
    return true;
  }

  output(id: string, filter?: string): ShellToolResult {
    const task = this.tasks.get(id);
    if (!task) {
      return {
        content: `Background shell with ID "${id}" not found. Use /tasks command to see available tasks.`,
      };
    }
    let stdout = task.stdout.toString();
    let stderr = task.stderr.toString();
    if (filter) {
      let expression: RegExp;
      try {
        expression = new RegExp(filter, "i");
      } catch (error) {
        return {
          content: `Invalid regex pattern: ${filter}. Error: ${error}`,
        };
      }
      stdout = stdout
        .split("\n")
        .filter((line) => expression.test(line))
        .join("\n");
      stderr = stderr
        .split("\n")
        .filter((line) => expression.test(line))
        .join("\n");
    }
    const elapsed = (task.endTime ?? Date.now()) - task.startTime;
    const lines = [
      `Shell ID: ${id}`,
      `Command: ${task.title}`,
      `Status: ${task.status}`,
      `Duration: ${formatDuration(elapsed)}`,
      `Timestamp: ${new Date().toISOString()}`,
      "",
      stdout ? `Stdout (${filter ? "filtered" : "full"}):\n${stdout}` : "Stdout: (no output)",
      "",
      stderr ? `Stderr (${filter ? "filtered" : "full"}):\n${stderr}` : "Stderr: (no output)",
    ];
    if (task.status === "running") {
      lines.push(
        "",
        '<system-reminder data-role="tool-hint">',
        `Background Bash ${id} (command: ${task.title}) is still running. You will be automatically notified via a <task-notification> message when it finishes — do NOT poll BashOutput in a loop.`,
        "</system-reminder>",
      );
    }
    return {
      content: lines.join("\n"),
      renderer: { type: "text", value: stdout || stderr || "No output available" },
    };
  }
}

export type CoreShellToolOptions = {
  workDir: string;
  getWorkDir?: () => string;
  settings?: SettingsManager;
  backgroundTasks?: BackgroundTaskManager;
};

export class CoreShellTools {
  readonly backgroundTasks: BackgroundTaskManager;

  constructor(private readonly options: CoreShellToolOptions) {
    this.backgroundTasks = options.backgroundTasks ?? new BackgroundTaskManager();
  }

  readonly handlers: Record<"Bash" | "PowerShell", RegisteredToolHandler> = {
    Bash: {
      parameters: bashParameters,
      aliases: ["bash"],
      execute: (input, context) =>
        this.bash(bashParameters.parse(input), context.context),
    },
    PowerShell: {
      parameters: powershellParameters,
      aliases: ["pwsh", "ps"],
      isEnabled: () => process.platform === "win32",
      execute: (input, context) =>
        this.powerShell(powershellParameters.parse(input), context.context),
    },
  };

  register(manager: ToolManager): void {
    manager.register("Bash", this.handlers.Bash);
    manager.register("PowerShell", this.handlers.PowerShell);
  }

  async bash(
    input: z.infer<typeof bashParameters>,
    session: HarnessSession,
  ): Promise<ShellToolResult> {
    if (input.run_in_background && session.options.print === true) {
      return commandRejected(
        input.command,
        "Background command execution is not supported in print mode (-p) because the process exits immediately after the main agent completes. Please remove the run_in_background parameter, or use stream-json mode instead.",
        "ExecuteCommandBackgroundUnsupportedError",
      );
    }
    const validation = validateBashInput(input);
    if (validation) return commandRejected(input.command, validation);
    const timeout = await this.resolveBashTimeout(input.timeout);
    return this.executeShell({
      command: input.command,
      shell: resolveBashPath(),
      args: ["-lc", input.command],
      session,
      timeout,
      explicitBackground: input.run_in_background === true,
      toolName: "Bash",
      canAutoBackground: isAutoBackgroundAllowed(input.command),
    });
  }

  async powerShell(
    input: z.infer<typeof powershellParameters>,
    session: HarnessSession,
  ): Promise<ShellToolResult> {
    if (process.platform !== "win32") {
      return commandRejected(
        input.command,
        "PowerShell tool is only available on Windows. Use the Bash tool instead.",
      );
    }
    if (!input.command.trim()) return commandRejected(input.command, "Command cannot be empty.");
    if (input.run_in_background && session.options.print === true) {
      return commandRejected(
        input.command,
        "Background command execution is not supported in print mode (-p).",
      );
    }
    return this.executeShell({
      command: input.command,
      shell: "powershell.exe",
      args: ["-NoProfile", "-NonInteractive", "-Command", input.command],
      session,
      timeout: Math.min(input.timeout || 120_000, 600_000),
      explicitBackground: input.run_in_background === true,
      toolName: "PowerShell",
      canAutoBackground: isPowerShellAutoBackgroundAllowed(input.command),
    });
  }

  private async resolveBashTimeout(value?: number): Promise<number> {
    const settingsEnv =
      (await this.options.settings?.get<Record<string, string>>("env")) ?? {};
    const max =
      positiveInteger(settingsEnv.BASH_MAX_TIMEOUT_MS) ??
      positiveInteger(process.env.BASH_MAX_TIMEOUT_MS) ??
      DEFAULT_BASH_MAX_TIMEOUT_MS;
    const defaultTimeout =
      positiveInteger(settingsEnv.BASH_DEFAULT_TIMEOUT_MS) ??
      positiveInteger(process.env.BASH_DEFAULT_TIMEOUT_MS) ??
      DEFAULT_BASH_TIMEOUT_MS;
    if (typeof value !== "number" || Number.isNaN(value) || value <= 0) {
      return defaultTimeout;
    }
    return Math.min(Math.floor(value), max);
  }

  private async executeShell(input: {
    command: string;
    shell: string;
    args: string[];
    session: HarnessSession;
    timeout: number;
    explicitBackground: boolean;
    toolName: "Bash" | "PowerShell";
    canAutoBackground: boolean;
  }): Promise<ShellToolResult> {
    const maximumOutput = Math.min(
      positiveInteger(process.env.BASH_MAX_OUTPUT_LENGTH) ??
        DEFAULT_BASH_MAX_OUTPUT_LENGTH,
      MAX_BASH_OUTPUT_LENGTH_CAP,
    );
    const stdout = new BoundedOutput(maximumOutput);
    const stderr = new BoundedOutput(maximumOutput);
    const combined = new BoundedOutput(maximumOutput);
    const cwd = this.options.getWorkDir?.() ?? input.session.options.workDir ?? this.options.workDir;
    const child = spawn(input.shell, input.args, {
      cwd,
      env: {
        ...process.env,
        CODEBUDDY_PROJECT_DIR: cwd,
        CLAUDE_PROJECT_DIR: cwd,
        CODEBUDDY_SESSION_ID: input.session.id,
        CLAUDE_SESSION_ID: input.session.id,
        ...(input.session.conversationRequestId
          ? {
              CODEBUDDY_CONVERSATION_REQUEST_ID:
                input.session.conversationRequestId,
            }
          : {}),
      },
      stdio: ["pipe", "pipe", "pipe"],
    });
    child.stdout.on("data", (chunk: Buffer) => {
      stdout.push(chunk);
      combined.push(chunk);
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderr.push(chunk);
      combined.push(chunk);
    });
    const completed = waitForChild(child);

    if (input.explicitBackground) {
      const task = this.createBackgroundTask(input, child, stdout, stderr);
      this.backgroundTasks.add(task);
      void completed.then((result) => completeBackgroundTask(task, result));
      return buildBackgroundResult(input.command, task.id, combined, "explicit");
    }

    let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
    let aborting = false;
    const abort = () => {
      aborting = true;
      child.kill();
    };
    input.session.abortSignal.addEventListener("abort", abort, { once: true });
    const timeoutResult = new Promise<"timeout">((resolvePromise) => {
      timeoutHandle = setTimeout(() => resolvePromise("timeout"), input.timeout);
      timeoutHandle.unref?.();
    });

    const first = await Promise.race([completed, timeoutResult]);
    if (first === "timeout") {
      if (
        input.canAutoBackground &&
        process.env.CODEBUDDY_BASH_AUTO_BACKGROUND_DISABLED !== "1"
      ) {
        const task = this.createBackgroundTask(input, child, stdout, stderr);
        this.backgroundTasks.add(task);
        void completed.then((result) => completeBackgroundTask(task, result));
        input.session.abortSignal.removeEventListener("abort", abort);
        return buildBackgroundResult(input.command, task.id, combined, "timeout");
      }
      child.kill();
      const result = await completed;
      return buildForegroundResult(input.command, result, stdout, stderr, combined, false);
    }

    if (timeoutHandle) clearTimeout(timeoutHandle);
    input.session.abortSignal.removeEventListener("abort", abort);
    return buildForegroundResult(
      input.command,
      first,
      stdout,
      stderr,
      combined,
      aborting,
    );
  }

  private createBackgroundTask(
    input: {
      command: string;
      session: HarnessSession;
      toolName: "Bash" | "PowerShell";
    },
    child: ChildProcessWithoutNullStreams,
    stdout: BoundedOutput,
    stderr: BoundedOutput,
  ): BackgroundShellTask {
    const task: BackgroundShellTask = {
      id: generateTaskId(),
      toolName: input.toolName,
      title: input.command,
      startTime: Date.now(),
      status: "running",
      stdout,
      stderr,
      sessionId: input.session.id,
      child,
      async kill() {
        if (task.status === "running") child.kill();
        task.status = "killed";
        task.endTime = Date.now();
      },
    };
    return task;
  }
}

export class BoundedOutput {
  private value = "";
  private totalBytes = 0;

  constructor(private readonly maximumCharacters: number) {}

  push(value: Buffer | string): void {
    const text = typeof value === "string" ? value : value.toString("utf8");
    this.totalBytes += Buffer.byteLength(text);
    if (this.value.length >= this.maximumCharacters) return;
    this.value += text.slice(0, this.maximumCharacters - this.value.length);
  }

  toString(trim = false): string {
    return trim ? this.value.trimEnd() : this.value;
  }

  isEmpty(): boolean {
    return this.value.length === 0;
  }

  getTruncatedBytes(): number {
    return Math.max(0, this.totalBytes - Buffer.byteLength(this.value));
  }
}

export function registerCoreShellTools(
  manager: ToolManager,
  options: CoreShellToolOptions,
): CoreShellTools {
  const tools = new CoreShellTools(options);
  tools.register(manager);
  return tools;
}

function validateBashInput(input: z.infer<typeof bashParameters>): string | undefined {
  const parsed = bashParameters.safeParse(input);
  if (!parsed.success) return parsed.error.message;
  if (!input.command.trim()) return "Command cannot be empty.";
  if (!commandRoot(input.command)) {
    return "Could not identify command root to obtain permission from user.";
  }
  return undefined;
}

function commandRoot(command: string): string | undefined {
  const tokens = command.trim().split(/\s+/);
  for (const token of tokens) {
    if (/^[A-Za-z_]\w*=/.test(token)) continue;
    return token.split(/[\\/]/).at(-1) || undefined;
  }
  return undefined;
}

function commandRejected(
  command: string,
  reason: string,
  code = reason.toLowerCase().includes("could not identify command root")
    ? "ExecuteCommandRootResolveError"
    : "InvalidParameterError",
): ShellToolResult {
  return {
    content: `Command rejected: ${command}\nReason: ${reason}`,
    error: reason,
    rawResponse: { is_error: true, tool_error_code: code, error: reason },
  };
}

function resolveBashPath(): string {
  if (process.platform === "win32") {
    return process.env.CODEBUDDY_CODE_GIT_BASH_PATH ?? "bash.exe";
  }
  return process.env.SHELL?.includes("bash") ? process.env.SHELL : "/bin/bash";
}

function isAutoBackgroundAllowed(command: string): boolean {
  const value = command.trim();
  if (!value) return true;
  const root = value.split(/[\s;&|(){}]+/)[0] ?? "";
  if (root === "cd") {
    const chained = value.match(/(?:&&|;|\|\|)\s*(\S+)/)?.[1];
    return chained !== "sleep";
  }
  return root !== "sleep";
}

function isPowerShellAutoBackgroundAllowed(command: string): boolean {
  const value = command.trim();
  if (!value) return true;
  const root = (value.split(/[\s;&|(){}]+/)[0] ?? "").toLowerCase();
  if (["cd", "set-location", "sl"].includes(root)) {
    const chained = value.match(/(?:&&|;|\|\|)\s*(\S+)/)?.[1]?.toLowerCase();
    return !chained || !["start-sleep", "sleep"].includes(chained);
  }
  return !["start-sleep", "sleep"].includes(root);
}

function waitForChild(child: ChildProcessWithoutNullStreams): Promise<{
  exitCode: number | null;
  signal: NodeJS.Signals | null;
}> {
  return new Promise((resolvePromise, reject) => {
    child.once("error", reject);
    child.once("close", (exitCode, signal) => resolvePromise({ exitCode, signal }));
  });
}

function buildForegroundResult(
  command: string,
  result: { exitCode: number | null; signal: NodeJS.Signals | null },
  stdout: BoundedOutput,
  stderr: BoundedOutput,
  combined: BoundedOutput,
  cancelled: boolean,
): ShellToolResult {
  if (cancelled) {
    const content =
      "Command was cancelled by user before it could complete." +
      (combined.isEmpty()
        ? " There was no output before it was cancelled."
        : ` Below is the output before it was cancelled:\n${combined.toString(true)}`);
    return {
      content,
      renderer: { type: "text", value: content },
      rawResponse: {
        exitCode: result.exitCode,
        signal: result.signal,
        interrupted: true,
        sandboxDenied: false,
        stderrBytesTruncated: stderr.getTruncatedBytes(),
        stdoutBytesTruncated: stdout.getTruncatedBytes(),
        tool_error_code: "ExecuteCommandCancelledError",
        is_error: true,
        error: content.slice(0, 500),
      },
    };
  }
  const stdoutText = stdout.toString(true) || "(empty)";
  const stderrText = stderr.toString(true) || "(empty)";
  const content = [
    `Command: ${command}`,
    `Stdout: ${stdoutText}`,
    `Stderr: ${stderrText}`,
    `Exit Code: ${result.exitCode ?? "(none)"}`,
    `Signal: ${result.signal ?? "(none)"}`,
  ].join("\n");
  const isError = result.signal !== null || (result.exitCode ?? 0) !== 0;
  const errorCode = result.signal
    ? "ExecuteCommandSignalTerminatedError"
    : isError
      ? "ExecuteCommandExitCodeError"
      : "Success";
  return {
    content,
    renderer: {
      type: "text",
      value: combined.toString(true) || "(No content)",
    },
    rawResponse: {
      exitCode: result.exitCode,
      signal: result.signal,
      interrupted: false,
      sandboxDenied: false,
      stderrBytesTruncated: stderr.getTruncatedBytes(),
      stdoutBytesTruncated: stdout.getTruncatedBytes(),
      tool_error_code: errorCode,
      ...(isError
        ? {
            is_error: true,
            error: (stderr.toString(true) || content).slice(0, 500),
          }
        : {}),
    },
  };
}

function buildBackgroundResult(
  command: string,
  id: string,
  output: BoundedOutput,
  reason: "explicit" | "timeout" | "assistant-budget" | "internal-abort" | "ctrl-b",
): ShellToolResult {
  const reasonText =
    reason === "timeout"
      ? "Reason: Auto-backgrounded after hitting foreground timeout. The command is still running — no SIGTERM was sent."
      : reason === "assistant-budget"
        ? "Reason: Auto-backgrounded after exceeding the assistant blocking budget so the main conversation stays responsive. The command is still running."
        : reason === "internal-abort"
          ? "Reason: Auto-backgrounded after an internal session-level abort (e.g. turn switch). The command is still running."
          : reason === "explicit"
            ? "Reason: Launched directly in background (run_in_background=true)."
            : "Reason: Moved to background (user pressed Ctrl+B).";
  return {
    content: [
      `Command: ${command}`,
      `Status: Running in background with task_id: ${id}`,
      reasonText,
      "Next step: Use the TaskOutput tool with this task_id to poll progress or fetch the completed output.",
      `Current Output (partial): ${output.toString(true) || "(no output yet)"}`,
    ].join("\n"),
    renderer: { type: "text", value: "🔄 Command moved to background." },
  };
}

function completeBackgroundTask(
  task: BackgroundShellTask,
  result: { exitCode: number | null; signal: NodeJS.Signals | null },
): void {
  if (task.status !== "running") return;
  task.status = result.exitCode === 0 ? "completed" : "failed";
  task.endTime = Date.now();
}

function generateTaskId(): string {
  const alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const bytes = randomBytes(6);
  return [...bytes]
    .map((value) => alphabet[value % alphabet.length])
    .join("");
}

function positiveInteger(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function formatDuration(milliseconds: number): string {
  if (milliseconds < 1_000) return `${milliseconds}ms`;
  const seconds = Math.floor(milliseconds / 1_000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

import { spawn } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { readdir, stat } from "node:fs/promises";
import { isAbsolute, join, relative, resolve } from "node:path";
import { z } from "zod";
import type { HarnessSession } from "../sessions/session.js";
import type { RegisteredToolHandler, ToolManager } from "./tool-manager.js";
import type { CoreToolResult } from "./core-file-tools.js";

export const MAX_TOOL_OUTPUT_LENGTH = 50_000;
export const GLOB_TIMEOUT_MS = 60_000;

export const globParameters = z.object({
  pattern: z.string().describe("The glob pattern to match files against"),
  path: z
    .string()
    .optional()
    .describe(
      'The directory to search in. If not specified, the current working directory will be used. IMPORTANT: Omit this field to use the default directory. DO NOT enter "undefined" or "null" - simply omit it for the default behavior. Must be a valid directory path if provided.',
    ),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .default(100)
    .describe("Maximum number of results to return. Defaults to 100."),
  offset: z.coerce
    .number()
    .int()
    .nonnegative()
    .default(0)
    .describe("Number of results to skip from the beginning. Defaults to 0."),
});

export const grepParameters = z.object({
  pattern: z
    .string()
    .describe("The regular expression pattern to search for in file contents"),
  path: z
    .string()
    .optional()
    .describe(
      "File or directory to search in (rg PATH). Defaults to current working directory.",
    ),
  glob: z
    .string()
    .optional()
    .describe('Glob pattern to filter files (e.g. "*.js", "*.{ts,tsx}") - maps to rg --glob'),
  output_mode: z
    .enum(["content", "files_with_matches", "count"])
    .optional()
    .describe(
      'Output mode: "content" shows matching lines (supports -A/-B/-C context, -n line numbers, head_limit), "files_with_matches" shows file paths (supports head_limit), "count" shows match counts (supports head_limit). Defaults to "files_with_matches".',
    ),
  "-B": z.coerce
    .number()
    .optional()
    .describe(
      'Number of lines to show before each match (rg -B). Requires output_mode: "content", ignored otherwise.',
    ),
  "-A": z.coerce
    .number()
    .optional()
    .describe(
      'Number of lines to show after each match (rg -A). Requires output_mode: "content", ignored otherwise.',
    ),
  "-C": z.coerce.number().optional().describe("Alias for context."),
  context: z.coerce
    .number()
    .optional()
    .describe(
      'Number of lines to show before and after each match (rg -C). Requires output_mode: "content", ignored otherwise.',
    ),
  "-n": z
    .boolean()
    .optional()
    .describe(
      'Show line numbers in output (rg -n). Requires output_mode: "content", ignored otherwise.',
    ),
  "-i": z.boolean().optional().describe("Case insensitive search (rg -i)"),
  type: z
    .string()
    .optional()
    .describe(
      "File type to search (rg --type). Common types: js, py, rust, go, java, etc. More efficient than include for standard file types.",
    ),
  head_limit: z.coerce
    .number()
    .optional()
    .describe(
      'Limit output to first N lines/entries, equivalent to "| head -N". Works across all output modes: content (limits output lines), files_with_matches (limits file paths), count (limits count entries). When unspecified, shows all results from ripgrep.',
    ),
  offset: z.coerce
    .number()
    .optional()
    .describe(
      'Skip first N lines/entries before applying head_limit, equivalent to "| tail -n +N | head -N". Works across all output modes. Defaults to 0.',
    ),
  multiline: z
    .boolean()
    .optional()
    .describe(
      "Enable multiline mode where . matches newlines and patterns can span lines (rg -U --multiline-dotall). Default: false.",
    ),
});

export type CoreSearchToolOptions = {
  workDir: string;
  globTimeoutMs?: number;
};

export class CoreSearchTools {
  constructor(private readonly options: CoreSearchToolOptions) {}

  readonly handlers: Record<"Glob" | "Grep", RegisteredToolHandler> = {
    Glob: {
      parameters: globParameters,
      aliases: ["read", "glob"],
      execute: (input, context) =>
        this.glob(globParameters.parse(input), context.context),
    },
    Grep: {
      parameters: grepParameters,
      aliases: ["read", "grep"],
      execute: (input, context) =>
        this.grep(grepParameters.parse(input), context.context),
    },
  };

  register(manager: ToolManager): void {
    manager.register("Glob", this.handlers.Glob);
    manager.register("Grep", this.handlers.Grep);
  }

  async glob(
    input: z.infer<typeof globParameters>,
    session?: HarnessSession,
  ): Promise<CoreToolResult> {
    const parsed = globParameters.safeParse(input);
    if (!parsed.success) {
      throw new Error(
        `glob error : Error: Invalid parameters provided. Reason: ${parsed.error.message}`,
      );
    }
    const searchDir = this.resolvePath(input.path ?? ".");
    if (!existsSync(searchDir)) {
      throw new Error(
        `glob error : Error: Invalid parameters provided. Reason: Search path does not exist ${searchDir}`,
      );
    }
    if (!statSync(searchDir).isDirectory()) {
      throw new Error(
        `glob error : Error: Invalid parameters provided. Reason: Search path is not a directory: ${searchDir}`,
      );
    }
    if (!input.pattern?.trim()) {
      throw new Error(
        "glob error : Error: Invalid parameters provided. Reason: The 'pattern' parameter cannot be empty.",
      );
    }

    try {
      const results = await withTimeout(
        this.searchFiles(input.pattern, searchDir, session?.abortSignal),
        this.options.globTimeoutMs ?? GLOB_TIMEOUT_MS,
        `Glob search timed out after ${(this.options.globTimeoutMs ?? GLOB_TIMEOUT_MS) / 1_000}s for pattern "${input.pattern}" in "${searchDir}". The directory may be too large to traverse. Narrow the search by using a more specific path or pattern.`,
      );
      if (results.length === 0) {
        return {
          title: "Found 0 files",
          content: "No files found",
          renderer: { type: "list" },
        };
      }
      return {
        title: `Found ${results.length} files`,
        content: results.slice(input.offset, input.offset + input.limit),
        renderer: { type: "list" },
      };
    } catch (error) {
      throw new Error(
        `glob error: Error during glob search operation: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async grep(
    initialInput: z.infer<typeof grepParameters>,
    session?: HarnessSession,
  ): Promise<CoreToolResult> {
    let input = initialInput;
    if (
      (["-A", "-B", "-C", "-n", "context"] as const).some(
        (name) => input[name] !== undefined,
      ) &&
      input.output_mode !== "content"
    ) {
      input = { ...input, output_mode: "content" };
    }
    this.validateGrep(input);
    const searchPath = this.resolvePath(input.path ?? ".");
    try {
      const output = await this.runRipgrep(input, searchPath, session?.abortSignal);
      return formatGrepResult(
        output,
        input.output_mode ?? "files_with_matches",
        input.head_limit,
        input.offset,
      );
    } catch (error) {
      if (error instanceof SearchToolError) throw error;
      throw new SearchToolError(
        `grep error: Error during grep search operation: ${error instanceof Error ? error.message : String(error)}`,
        classifyGrepError(error),
      );
    }
  }

  private validateGrep(input: z.infer<typeof grepParameters>): void {
    const parsed = grepParameters.safeParse(input);
    if (!parsed.success) {
      throw new SearchToolError(
        `grep error: Invalid parameters provided. Reason: ${parsed.error.message}`,
        "InvalidParameterError",
      );
    }
    if (!input.pattern?.trim()) {
      throw new SearchToolError(
        "grep error: Pattern cannot be empty",
        "SearchContentPatternError",
      );
    }
    for (const name of ["-A", "-B", "-C", "-n", "context"] as const) {
      if (input[name] !== undefined && input.output_mode !== "content") {
        throw new SearchToolError(
          `grep error: ${name} option requires output_mode: "content"`,
          "InvalidParameterError",
        );
      }
    }
  }

  private resolvePath(path: string): string {
    const resolved = isAbsolute(path) ? resolve(path) : resolve(this.options.workDir, path);
    if (existsSync(resolved)) {
      const value = statSync(resolved);
      if (!value.isDirectory() && !value.isFile()) {
        throw new SearchToolError(
          `Path is neither a file nor directory: ${resolved}`,
          "SearchContentPathError",
        );
      }
    }
    return resolved;
  }

  private async searchFiles(
    pattern: string,
    directory: string,
    signal?: AbortSignal,
  ): Promise<string[]> {
    try {
      const output = await runCommand(
        "rg",
        [
          "--files",
          "--hidden",
          "-g",
          pattern,
          "-g",
          "!**/node_modules/**",
          "-g",
          "!**/.git/**",
        ],
        directory,
        signal,
        Number.POSITIVE_INFINITY,
      );
      const files = output.stdout
        .split(/\r?\n/)
        .filter(Boolean)
        .map((path) => (isAbsolute(path) ? path : resolve(directory, path)));
      return await sortByModified(files);
    } catch (error) {
      if (error instanceof CommandUnavailableError) {
        return await fallbackGlob(pattern, directory, signal);
      }
      throw error;
    }
  }

  private async runRipgrep(
    input: z.infer<typeof grepParameters>,
    searchPath: string,
    signal?: AbortSignal,
  ): Promise<string> {
    const mode = input.output_mode ?? "files_with_matches";
    const args: string[] = [];
    if (mode === "files_with_matches") args.push("-l");
    else if (mode === "count") args.push("-c");
    else if (input["-n"]) args.push("-n");
    if (input["-i"]) args.push("-i");
    if (input["-B"] !== undefined) args.push("-B", String(input["-B"]));
    if (input["-A"] !== undefined) args.push("-A", String(input["-A"]));
    const context = input["-C"] ?? input.context;
    if (context !== undefined) args.push("-C", String(context));
    if (input.glob) args.push("--glob", input.glob);
    if (input.type) args.push("--type", input.type);
    if (input.multiline) args.push("-U", "--multiline-dotall");
    args.push("--hidden", "--glob", "!**/node_modules/**", "--glob", "!**/.git/**");
    args.push("--", input.pattern, searchPath);

    try {
      const result = await runCommand(
        "rg",
        args,
        this.options.workDir,
        signal,
        MAX_TOOL_OUTPUT_LENGTH,
      );
      return result.stdout;
    } catch (error) {
      if (error instanceof CommandUnavailableError) {
        return this.runSystemGrep(input, searchPath, signal);
      }
      throw error;
    }
  }

  private async runSystemGrep(
    input: z.infer<typeof grepParameters>,
    searchPath: string,
    signal?: AbortSignal,
  ): Promise<string> {
    const mode = input.output_mode ?? "files_with_matches";
    const args = ["-r"];
    if (mode === "files_with_matches") args.push("-l");
    else if (mode === "count") args.push("-c");
    else args.push("-n");
    if (input["-i"]) args.push("-i");
    if (input.glob) args.push(`--include=${input.glob}`);
    args.push("--exclude-dir=node_modules", "--exclude-dir=.git");
    args.push(input.pattern, searchPath);
    return (
      await runCommand(
        "grep",
        args,
        this.options.workDir,
        signal,
        MAX_TOOL_OUTPUT_LENGTH,
      )
    ).stdout;
  }
}

export function registerCoreSearchTools(
  manager: ToolManager,
  options: CoreSearchToolOptions,
): CoreSearchTools {
  const tools = new CoreSearchTools(options);
  tools.register(manager);
  return tools;
}

class SearchToolError extends Error {
  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message);
  }
}

class CommandUnavailableError extends Error {}

async function runCommand(
  command: string,
  args: string[],
  cwd: string,
  signal: AbortSignal | undefined,
  maxOutput: number,
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, { cwd, stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    let truncated = false;
    const abort = () => {
      child.kill();
      reject(new Error("Search was aborted"));
    };
    if (signal?.aborted) return abort();
    signal?.addEventListener("abort", abort, { once: true });
    child.stdout.on("data", (chunk: Buffer) => {
      if (truncated) return;
      const text = chunk.toString("utf8");
      if (stdout.length + text.length > maxOutput) {
        stdout += text.slice(0, Math.max(0, maxOutput - stdout.length));
        stdout += `\n... [output truncated after ${maxOutput} characters] ...`;
        truncated = true;
      } else stdout += text;
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString("utf8");
    });
    child.on("error", (error: NodeJS.ErrnoException) => {
      signal?.removeEventListener("abort", abort);
      if (error.code === "ENOENT") reject(new CommandUnavailableError(command));
      else reject(error);
    });
    child.on("close", (code) => {
      signal?.removeEventListener("abort", abort);
      if (code === 0 || code === 1) resolvePromise({ stdout, stderr });
      else reject(Object.assign(new Error(stderr || `${command} exited with code ${code}`), { code }));
    });
  });
}

export function formatGrepResult(
  output: string,
  mode: "content" | "files_with_matches" | "count",
  headLimit?: number,
  offset?: number,
): CoreToolResult {
  if (!output.trim()) {
    return {
      title: "Found 0 matches",
      content: mode === "files_with_matches" ? "No files found" : "No matches found",
      renderer: { type: "list" },
    };
  }
  let lines = output.trim().split(/\r?\n/);
  if (offset && offset > 0) lines = lines.slice(offset);
  if (headLimit && headLimit > 0) lines = lines.slice(0, headLimit);
  if (mode === "count") {
    const count = lines.reduce((sum, line) => {
      const match = line.match(/:(\d+)$/);
      return sum + (match ? Number.parseInt(match[1]!, 10) : 0);
    }, 0);
    return { title: `Found ${count} matches`, content: lines, renderer: { type: "list" } };
  }
  return mode === "files_with_matches"
    ? {
        title: `Found ${lines.length} files`,
        content: lines,
        renderer: { type: "list" },
      }
    : {
        title: `Found ${lines.length} lines`,
        content: lines,
        renderer: { type: "list" },
      };
}

function classifyGrepError(error: unknown): string {
  const code =
    error instanceof Error && "code" in error
      ? String((error as NodeJS.ErrnoException).code)
      : "";
  if (["EACCES", "EPERM"].includes(code)) return "SearchContentPermissionError";
  if (["ENOENT", "ENOTDIR"].includes(code)) return "SearchContentPathError";
  if (
    error instanceof Error &&
    (error.name === "SyntaxError" ||
      /invalid regular expression|regex parse error|unterminated|invalid pattern/i.test(
        error.message,
      ))
  ) {
    return "SearchContentPatternError";
  }
  return "SearchContentError";
}

async function withTimeout<T>(
  operation: Promise<T>,
  timeoutMs: number,
  message: string,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      operation,
      new Promise<T>((_resolve, reject) => {
        timer = setTimeout(() => reject(new Error(message)), timeoutMs);
        timer.unref?.();
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function sortByModified(files: string[]): Promise<string[]> {
  const values = await Promise.all(
    files.map(async (path) => ({ path, modified: (await stat(path)).mtimeMs })),
  );
  return values.sort((left, right) => right.modified - left.modified).map(({ path }) => path);
}

async function fallbackGlob(
  pattern: string,
  directory: string,
  signal?: AbortSignal,
): Promise<string[]> {
  const matcher = globToRegExp(pattern);
  const files: string[] = [];
  const visit = async (current: string): Promise<void> => {
    if (signal?.aborted) throw new Error("Search was aborted");
    for (const entry of await readdir(current, { withFileTypes: true })) {
      if (entry.name === "node_modules" || entry.name === ".git") continue;
      const path = join(current, entry.name);
      if (entry.isDirectory()) await visit(path);
      else if (matcher.test(relative(directory, path).replaceAll("\\", "/"))) files.push(path);
    }
  };
  await visit(directory);
  return sortByModified(files);
}

function globToRegExp(pattern: string): RegExp {
  let output = "^";
  for (let index = 0; index < pattern.length; index += 1) {
    const character = pattern[index]!;
    if (character === "*") {
      if (pattern[index + 1] === "*") {
        output += ".*";
        index += 1;
      } else output += "[^/]*";
    } else if (character === "?") output += "[^/]";
    else if (character === "{") {
      const close = pattern.indexOf("}", index + 1);
      if (close >= 0) {
        output += `(?:${pattern
          .slice(index + 1, close)
          .split(",")
          .map(escapeRegExp)
          .join("|")})`;
        index = close;
      } else output += "\\{";
    } else output += escapeRegExp(character);
  }
  return new RegExp(`${output}$`);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

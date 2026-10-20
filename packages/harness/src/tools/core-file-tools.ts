import {
  access,
  mkdir,
  readFile,
  readdir,
  stat,
  writeFile,
} from "node:fs/promises";
import { dirname, extname, isAbsolute, resolve } from "node:path";
import { z } from "zod";
import type { HarnessSession } from "../sessions/session.js";
import type { RegisteredToolHandler, ToolManager } from "./tool-manager.js";
import { ReadFileStateService } from "./read-file-state.js";
import { createNativeImageUtils, type NativeImageUtils } from "../images/native-image-utils.js";
import { NativeReadImageTool } from "../images/native-read-image-tool.js";
import { isBinaryImageFile, ReadImageExecutionError, ReadImageErrorCode } from "../images/read-image-runtime.js";
import type { ImageBlobServiceImpl } from "../blobs/image-blob-service-impl.js";

export const READ_MAX_LINE_LENGTH = 2_000;
export const READ_DEFAULT_LINE_LIMIT = 2_000;
export const READ_MAX_UNPAGED_BYTES = 262_144;
export const READ_MAX_STREAM_BYTES = 100 * 1024 * 1024;
export const READ_DEFAULT_MAX_OUTPUT_TOKENS = 20_000;
export const DIRECTORY_PREVIEW_LIMIT = 50;

export const readParameters = z.object({
  file_path: z
    .string()
    .describe("The path to the file to read (can be absolute or relative)"),
  offset: z.coerce
    .number()
    .optional()
    .describe(
      "The line number to start reading from. Only provide if the file is too large to read at once",
    ),
  limit: z.coerce
    .number()
    .optional()
    .describe(
      "The number of lines to read. Only provide if the file is too large to read at once.",
    ),
});

export const writeParameters = z.object({
  file_path: z
    .string()
    .describe("The path to the file to write (can be absolute or relative)"),
  content: z.string().describe("The content to write to the file"),
});

export const editParameters = z.object({
  file_path: z
    .string()
    .describe("The path to the file to modify (can be absolute or relative)"),
  old_string: z.string().describe("The text to replace"),
  new_string: z
    .string()
    .describe(
      "The new text to replace the old text with. must be different from old_string. If they are identical, the tool will fail.",
    ),
  replace_all: z
    .boolean()
    .optional()
    .default(false)
    .describe("Replace all occurrences of old_string (default false)"),
});

export type CoreToolResult = {
  title?: string;
  content: string | string[];
  error?: string;
  renderer?: {
    type: "code" | "diff" | "list" | "text";
    context?: Record<string, unknown>;
    value?: string;
  };
  rawResponse?: {
    is_error: boolean;
    tool_error_code: string;
  };
};

export type CoreFileToolOptions = {
  workDir: string;
  readFileState?: ReadFileStateService;
  imageUtils?: NativeImageUtils;
  imageBlobService?: Pick<Partial<ImageBlobServiceImpl>, 'storeFromFile'|'trackImageDelivered'>;
  getCurrentModel?: (session?:HarnessSession)=>Promise<{id?:string;supportsImages?:boolean}|undefined>;
  logger?: {warn(...args:any[]):void;info(...args:any[]):void};
};

export class CoreFileTools {
  readonly readFileState: ReadFileStateService;
  readonly imageTool: NativeReadImageTool;

  constructor(private readonly options: CoreFileToolOptions) {
    this.readFileState = options.readFileState ?? new ReadFileStateService();
    this.imageTool = new NativeReadImageTool({runtime:{imageUtils:options.imageUtils??createNativeImageUtils(),fs:{access,stat,readFile},getCurrentModel:options.getCurrentModel??(async()=>undefined),isBinaryFile:isBinaryImageFile,buildDirectoryErrorMessage:(path:string)=>buildDirectoryErrorMessage(path,options.workDir)},imageBlobService:options.imageBlobService,readFileStateService:this.readFileState,logger:options.logger??{warn(){},info(){}}});
  }

  readonly handlers: Record<"Read" | "Write" | "Edit", RegisteredToolHandler> = {
    Read: {
      parameters: readParameters,
      aliases: ["read"],
      execute: (input, context) =>
        this.read(readParameters.parse(input), context.context),
    },
    Write: {
      parameters: writeParameters,
      aliases: ["edit", "write"],
      execute: (input, context) =>
        this.write(writeParameters.parse(input), context.context),
    },
    Edit: {
      parameters: editParameters,
      aliases: ["edit"],
      execute: (input, context) =>
        this.edit(editParameters.parse(input), context.context),
    },
  };

  register(manager: ToolManager): void {
    for (const name of ["Read", "Write", "Edit"] as const) {
      manager.register(name, this.handlers[name]);
    }
  }

  async read(
    input: z.infer<typeof readParameters>,
    _session?: HarnessSession,
  ): Promise<CoreToolResult> {
    try {
      const validation = validateReadInput(input);
      if (validation) {
        throw toolError(
          `Read error: Invalid parameters provided. Reason: ${validation}`,
          "ReadFileInvalidParamsError",
        );
      }
      const path = this.resolvePath(input.file_path);
      _session?.conditionalRules.pendingTriggers.add(path);
      if (path.endsWith(".ipynb")) {
        return await this.readJupyterNotebook(path, input.offset, input.limit);
      }
      if (await this.imageTool.isImageFile(path,_session)) {
        const model=await this.imageTool.runtime.getCurrentModel(_session);
        if(model?.supportsImages===false){const id=model.id||'unknown';return{content:`Error: Current model (${id}) does not support reading images`,error:`Current model (${id}) does not support reading images`,rawResponse:{is_error:true,tool_error_code:ReadImageErrorCode.ReadFileModelNoImageSupportError}};}
        return await this.imageTool.readImageFile(path,this.imageTool.runtime.imageUtils.getImageCompressionMaxDimension());
      }

      const content = await this.readFileContent(path, input.offset, input.limit);
      const estimatedTokens = estimateTokensRough(content);
      const maxTokens = positiveInteger(
        process.env.CODEBUDDY_CODE_FILE_READ_MAX_OUTPUT_TOKENS,
      ) ?? READ_DEFAULT_MAX_OUTPUT_TOKENS;
      if (estimatedTokens > maxTokens) {
        throw toolError(
          `File content (estimated ${estimatedTokens} tokens) exceeds maximum allowed tokens (${maxTokens}). Please use offset and limit parameters to read specific portions of the file, or use the GrepTool to search for specific content.`,
          "ReadFileTokenLimitExceededError",
        );
      }
      const lines = content.split(/\r?\n/);
      return {
        title: `Read ${lines.length} lines`,
        content: formatContentWithLineNumbers(content, input.offset || 1),
        renderer: {
          type: "code",
          context: { language: languageFromExtension(path) },
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const code = error instanceof ReadImageExecutionError ? error.toolErrorCode : error instanceof CoreToolError ? error.code : undefined;
      return {
        content: message,
        error: error instanceof CoreToolError ? `Error: ${message}` : "Error reading file",
        ...(code
          ? { rawResponse: { is_error: true, tool_error_code: code } }
          : {}),
      };
    }
  }

  async write(
    input: z.infer<typeof writeParameters>,
    _session?: HarnessSession,
  ): Promise<CoreToolResult> {
    const parsed = writeParameters.safeParse(input);
    if (!parsed.success || !input.file_path.trim()) {
      const reason = !input.file_path?.trim()
        ? "File path cannot be empty"
        : parsed.error?.message ?? "Invalid parameters";
      throw toolError(
        `Write error: Invalid parameters provided. Reason: ${reason}`,
        !input.file_path?.trim()
          ? "WriteFilePathError"
          : "InvalidParameterError",
      );
    }
    const path = this.resolvePath(input.file_path);
    let original = "";
    let isNew = false;
    let lineEnding: "LF" | "CRLF" = "LF";
    let hadUtf8Bom = false;
    try {
      const fileStat = await stat(path);
      if (fileStat.isDirectory()) {
        throw toolError(
          `Path is a directory, not a file: ${path}`,
          "WriteFilePathError",
        );
      }
      const decoded = decodeText(await readFile(path));
      original = decoded.text;
      hadUtf8Bom = decoded.hadUtf8Bom;
      lineEnding = detectLineEnding(original);
    } catch (error) {
      if (isNodeError(error, "ENOENT")) isNew = true;
      else throw error;
    }

    await mkdir(dirname(path), { recursive: true });
    const restored = restoreLineEndings(input.content, lineEnding);
    const addBom =
      !restored.startsWith("\uFEFF") &&
      (hadUtf8Bom || (isNew && [".csv", ".tsv"].includes(extname(path).toLowerCase())));
    try {
      await writeFile(path, `${addBom ? "\uFEFF" : ""}${restored}`, "utf8");
    } catch (error) {
      if (isNodeError(error, "EACCES")) {
        throw toolError(`Permission denied: ${path}`, "WriteFilePermissionError");
      }
      if (isNodeError(error, "ENOSPC")) {
        throw toolError(`No space left on device: ${path}`, "WriteFileDiskFullError");
      }
      throw error;
    }
    await this.readFileState.refreshFile(path);
    const lines = input.content.split(/\r?\n/);
    return {
      title: `Wrote ${lines.length} lines`,
      content: isNew
        ? `Successfully created and wrote to new file: ${path}`
        : `Successfully overwrote file: ${path}`,
      renderer: {
        type: "code",
        context: { language: languageFromExtension(path) },
        value: input.content,
      },
    };
  }

  async edit(
    input: z.infer<typeof editParameters>,
    _session?: HarnessSession,
  ): Promise<CoreToolResult> {
    const parsed = editParameters.safeParse(input);
    if (!parsed.success) {
      throw toolError(`Error: ${parsed.error.message}`, "InvalidParameterError");
    }
    if (!input.file_path.trim()) {
      throw toolError("Error: File path cannot be empty", "ReplaceFilePathError");
    }
    if (input.old_string === input.new_string) {
      throw toolError(
        "Error: No changes to make: old_string and new_string are exactly the same.",
        "ReplaceNoContentChangedError",
      );
    }
    const path = this.resolvePath(input.file_path);
    const exists = await fileExists(path);
    if ((input.old_string !== "" || exists) && !this.readFileState.hasBeenRead(path)) {
      throw toolError(
        `File has not been read yet: ${path}. Read it first before writing to it.`,
        "ReplaceFileNotReadError",
      );
    }
    if (
      exists &&
      (await this.readFileState.hasBeenModifiedSinceLastRead(path))
    ) {
      throw toolError(
        `File has been modified since read: ${path} (modified by user or linter). Read it again before attempting to write it.`,
        "ReplaceFileModifiedSinceReadError",
      );
    }

    const original = exists ? decodeText(await readFile(path)).text : "";
    const replacement = applyTextReplacement(
      original,
      input.old_string,
      input.new_string,
      input.replace_all,
      !exists,
    );
    await mkdir(dirname(path), { recursive: true });
    await writeFile(
      path,
      restoreLineEndings(replacement, detectLineEnding(original)),
      "utf8",
    );
    await this.readFileState.refreshFile(path);
    const count = input.replace_all
      ? countOccurrences(original, input.old_string)
      : 1;
    return {
      title: `Made ${count} replacement${count > 1 ? "s" : ""}`,
      content: `Successfully edited file: ${path}`,
      renderer: { type: "diff" },
    };
  }

  private resolvePath(path: string): string {
    return isAbsolute(path) ? resolve(path) : resolve(this.options.workDir, path);
  }

  private async readFileContent(
    path: string,
    offset?: number,
    limit?: number,
  ): Promise<string> {
    try {
      await access(path);
      const fileStat = await stat(path);
      this.readFileState.readFile(path, fileStat);
      if (!fileStat.isFile()) {
        throw toolError(
          await buildDirectoryErrorMessage(path, this.options.workDir),
          "ReadFilePathError",
        );
      }
      const bytes = await readFile(path);
      if (isBinary(bytes)) {
        throw toolError(
          `Cannot display content of binary file: ${relativeDisplayPath(path, this.options.workDir)}`,
          "ReadFileBinaryError",
        );
      }
      if (!offset && !limit && fileStat.size > READ_MAX_UNPAGED_BYTES) {
        const megabytes = (fileStat.size / 1_048_576).toFixed(1);
        throw toolError(
          `File content (${megabytes}MB) exceeds maximum allowed size (256KB). Please use offset and limit parameters to read specific portions of the file, or use the GrepTool to search for specific content.`,
          "ReadFileTooLargeError",
        );
      }
      if (fileStat.size > READ_MAX_STREAM_BYTES) {
        throw toolError(
          `File is too large (${Math.round(fileStat.size / 1024 / 1024)}MB)`,
          "ReadFileTooLargeError",
        );
      }
      const text = decodeText(bytes).text;
      if (text.length === 0) {
        return '<system-reminder data-role="tool-hint">Warning: the file exists but is shorter than the provided offset (1). The file has 1 lines.</system-reminder>';
      }
      return processFileContent(text, offset, limit);
    } catch (error) {
      if (error instanceof CoreToolError) throw error;
      if (isNodeError(error, "ENOENT")) {
        throw toolError(
          "<tool_use_error>File does not exist.</tool_use_error>",
          "ReadFileNotFoundError",
        );
      }
      if (isNodeError(error, "EACCES")) {
        throw toolError("Permission denied.", "ReadFilePermissionError");
      }
      throw error;
    }
  }

  private async readJupyterNotebook(
    path: string,
    offset?: number,
    limit?: number,
  ): Promise<CoreToolResult> {
    try {
      const fileStat = await stat(path);
      this.readFileState.readFile(path, fileStat);
      if (!fileStat.isFile()) {
        throw toolError(
          await buildDirectoryErrorMessage(path, this.options.workDir),
          "ReadFilePathError",
        );
      }
      const notebook = JSON.parse(await readFile(path, "utf8")) as {
        cells?: Array<{ cell_type?: string; source?: string | string[] }>;
      };
      if (!Array.isArray(notebook.cells)) {
        throw toolError(
          "Invalid Jupyter notebook format: missing cells array",
          "ReadFileInvalidNotebookError",
        );
      }
      const start = (offset || 1) - 1;
      const end = limit ? start + limit : notebook.cells.length;
      const content = notebook.cells
        .slice(start, end)
        .map((cell, index) => {
          const id = `cell-${start + index}`;
          const source = Array.isArray(cell.source)
            ? cell.source.join("")
            : (cell.source ?? "");
          const text = source.replace(/\n+$/, "");
          return cell.cell_type === "markdown"
            ? `<cell id="${id}"><cell_type>markdown</cell_type>${text}</cell id="${id}">`
            : `<cell id="${id}">${text}</cell id="${id}">`;
        })
        .join("\n");
      return {
        title: `Read ${notebook.cells.length} cells`,
        content,
        renderer: { type: "code", context: { language: "jupyter" } },
      };
    } catch (error) {
      if (isNodeError(error, "ENOENT")) {
        throw toolError(
          "<tool_use_error>Jupyter notebook file does not exist.</tool_use_error>",
          "ReadFileNotFoundError",
        );
      }
      if (isNodeError(error, "EACCES")) {
        throw toolError("Permission denied.", "ReadFilePermissionError");
      }
      throw error;
    }
  }

}

export function applyTextReplacement(
  original: string,
  oldString: string,
  newString: string,
  replaceAll = false,
  isNewFile = false,
): string {
  if (oldString === "" && isNewFile) return newString;
  const occurrences = countOccurrences(original, oldString);
  if (occurrences === 0) {
    throw toolError(
      "String to replace not found in file.",
      "ReplaceNoMatchesError",
    );
  }
  if (!replaceAll && occurrences > 1) {
    throw toolError(
      `Found ${occurrences} matches for old_string, but replace_all is false. To replace all occurrences, set replace_all to true. To replace only one occurrence, provide more surrounding context to make old_string unique.`,
      "ReplaceMultipleMatchesError",
    );
  }
  return replaceAll
    ? original.split(oldString).join(newString)
    : original.replace(oldString, newString);
}

export function registerCoreFileTools(
  manager: ToolManager,
  options: CoreFileToolOptions,
): CoreFileTools {
  const tools = new CoreFileTools(options);
  tools.register(manager);
  return tools;
}

class CoreToolError extends Error {
  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message);
  }
}

function toolError(message: string, code: string): CoreToolError {
  return new CoreToolError(message, code);
}

function validateReadInput(input: z.infer<typeof readParameters>): string | undefined {
  const parsed = readParameters.safeParse(input);
  if (!parsed.success) return parsed.error.message;
  if (!input.file_path?.trim()) return "File path cannot be empty";
  if (input.offset && input.offset < 1)
    return "Offset must be >= 1 (line numbers start from 1)";
  if (input.limit && input.limit < 1) return "Limit must be >= 1";
  return undefined;
}

function processFileContent(
  content: string,
  offset?: number,
  limit?: number,
): string {
  const lines = content.split(/\r?\n/);
  const start = (offset || 1) - 1;
  if (start >= lines.length) {
    throw toolError(
      `Offset ${offset} is beyond file end (total lines: ${lines.length})`,
      "ReadFileOffsetBeyondEOFError",
    );
  }
  const end = limit
    ? start + limit
    : Math.min(start + READ_DEFAULT_LINE_LIMIT, lines.length);
  return lines
    .slice(start, end)
    .map((line) =>
      line.length > READ_MAX_LINE_LENGTH
        ? `${line.substring(0, READ_MAX_LINE_LENGTH)}... [truncated]`
        : line,
    )
    .join("\n");
}

function formatContentWithLineNumbers(content: string, offset: number): string {
  return content
    .split(/\r?\n/)
    .map(
      (line, index) =>
        `${(offset + index).toString().padStart(4, " ")}→${line}`,
    )
    .join("\n");
}

async function buildDirectoryErrorMessage(
  path: string,
  workDir: string,
): Promise<string> {
  const relative = relativeDisplayPath(path, workDir);
  let listing = "";
  let count = 0;
  try {
    const entries = await readdir(path, { withFileTypes: true });
    count = entries.length;
    if (entries.length === 0) listing = "\n  (empty directory)";
    else {
      const preview = entries.slice(0, DIRECTORY_PREVIEW_LIMIT);
      const directories = preview
        .filter((entry) => entry.isDirectory())
        .map((entry) => `  📁 ${entry.name}/`);
      const files = preview
        .filter((entry) => !entry.isDirectory())
        .map((entry) => `  📄 ${entry.name}`);
      listing = `\n${[...directories, ...files].join("\n")}`;
      if (entries.length > DIRECTORY_PREVIEW_LIMIT) {
        listing += `\n  … and ${entries.length - DIRECTORY_PREVIEW_LIMIT} more entries (use Glob to explore)`;
      }
    }
  } catch {
    // The directory-specific error remains useful without a preview.
  }
  return `<tool_use_error>Path is a directory, not a file: ${relative}\nThis tool can only read files, not directories.\n\nSuggestions:\n  • Use Glob for pattern matching (e.g., glob("*.ts"))\n  • Use Bash with ls/find for exploration (e.g., bash("find . -type f"))\n  • Specify the full file path instead${listing ? `\n\nDirectory listing for "${relative}" (${count} entries):${listing}` : ""}</tool_use_error>`;
}

function countOccurrences(value: string, needle: string): number {
  if (needle === "") return 0;
  let count = 0;
  let position = 0;
  while ((position = value.indexOf(needle, position)) !== -1) {
    count += 1;
    position += needle.length;
  }
  return count;
}

function decodeText(bytes: Buffer): { text: string; hadUtf8Bom: boolean } {
  if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    return { text: bytes.subarray(3).toString("utf8"), hadUtf8Bom: true };
  }
  if (bytes[0] === 0xff && bytes[1] === 0xfe) {
    return { text: bytes.subarray(2).toString("utf16le"), hadUtf8Bom: false };
  }
  return { text: bytes.toString("utf8"), hadUtf8Bom: false };
}

function isBinary(bytes: Buffer): boolean {
  const sample = bytes.subarray(0, Math.min(bytes.length, 8_192));
  return sample.includes(0);
}

function detectLineEnding(value: string): "LF" | "CRLF" {
  return value.includes("\r\n") ? "CRLF" : "LF";
}

function restoreLineEndings(value: string, lineEnding: "LF" | "CRLF"): string {
  const normalized = value.replace(/\r\n/g, "\n");
  return lineEnding === "CRLF" ? normalized.replace(/\n/g, "\r\n") : normalized;
}

function estimateTokensRough(value: string): number {
  return Math.ceil(value.length / 4);
}

function positiveInteger(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function isNodeError(error: unknown, code: string): boolean {
  return (
    error instanceof Error &&
    "code" in error &&
    (error as NodeJS.ErrnoException).code === code
  );
}

function relativeDisplayPath(path: string, workDir: string): string {
  const prefix = resolve(workDir);
  return path.startsWith(`${prefix}/`) ? path.slice(prefix.length + 1) : path;
}

function languageFromExtension(path: string): string {
  return extname(path).slice(1) || "text";
}

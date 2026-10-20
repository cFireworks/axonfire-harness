import { readdir, readFile, stat } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, isAbsolute, resolve } from "node:path";

export const MAX_IMPORT_DEPTH = 5;
export const MAX_IMPORT_FILE_SIZE = 262_144;
export const MAX_IMPORT_FILE_TOKENS = 25_000;
export const MAX_IMPORT_DIR_ENTRIES = 1_000;
export function estimateTokensRough(text: string): number { const chinese = (text.match(/[\u4e00-\u9fa5]/g) || []).length; return Math.ceil(chinese / 1.8) + Math.ceil((text.length - chinese) / 4); }
export class ImportUtils {
  static extractImports(text: string, filename: string, workDir = process.cwd()): Array<{ fullMatch: string; importPath: string; index: number; resolvedPath: string }> {
    const imports = [];
    for (const match of text.matchAll(/@([^\s\n]+)/g)) if (!this.isInCodeBlock(text, match.index)) imports.push({ fullMatch: match[0], importPath: match[1]!, index: match.index, resolvedPath: this.resolveImportPath(match[1]!, filename, workDir) });
    return imports;
  }
  static resolveImportPath(value: string, filename: string, workDir = process.cwd()): string {
    if (value.startsWith("~/")) return resolve(homedir(), value.slice(2));
    if (isAbsolute(value)) return resolve(value);
    return resolve(filename ? dirname(filename) : workDir, value);
  }
  static isInCodeBlock(text: string, index: number): boolean {
    const before = text.substring(0, index);
    return (before.match(/```/g) || []).length % 2 === 1 || (before.match(/(?<!`)(`(?!`))/g) || []).length % 2 === 1;
  }
}
/** Source 9942584..9945696: path-only, bounded imports, cycle and token truncation protocol. */
export class ReferenceService {
  private fileReferencesPathOnly = false;
  constructor(private readonly workDir: () => string, private readonly logger: { warn(message: string, error?: unknown): void; debug(message: string): void } = { warn() {}, debug() {} }) {}
  setFileReferencesPathOnly(value: boolean): void { this.fileReferencesPathOnly = value; }
  isFileReferencesPathOnly(): boolean { return this.fileReferencesPathOnly; }
  async process(content: string, filename?: string): Promise<string> { return this.fileReferencesPathOnly ? content : this.processImports(content, filename); }
  async getDirectoryListing(directory: string): Promise<string> {
    try {
      const entries = (await readdir(directory)).sort(), lines = entries.slice(0, MAX_IMPORT_DIR_ENTRIES).map((entry) => `- ${entry}`);
      if (entries.length > MAX_IMPORT_DIR_ENTRIES) lines.push(`… and ${entries.length - MAX_IMPORT_DIR_ENTRIES} more entries`);
      return `Directory listing for ${directory}:\n${lines.join("\n")}`;
    } catch (error) { this.logger.warn(`Failed to read directory: ${directory}`, error); return `Failed to read directory: ${directory}`; }
  }
  truncateByTokenCap(content: string, filename: string): string {
    const cap = MAX_IMPORT_FILE_TOKENS, tokens = estimateTokensRough(content);
    if (tokens <= cap) return content;
    const prefix = "[Truncated: PARTIAL view — ", lines = content.split("\n"), total = lines.length;
    let count = Math.max(1, Math.min(total, Math.floor(total * cap / tokens * .85))), excerpt = lines.slice(0, count).join("\n");
    for (let trial = 0; trial < 6 && estimateTokensRough(excerpt) > cap && count > 1; trial++) { count = Math.max(1, Math.floor(.7 * count)); excerpt = lines.slice(0, count).join("\n"); }
    if (estimateTokensRough(excerpt) > cap || excerpt.trim() === "") {
      let chars = Math.max(1, Math.floor(cap * Math.max(.5, content.length / Math.max(1, tokens)) * .85)), slice = content.slice(0, chars);
      for (let trial = 0; trial < 6 && estimateTokensRough(slice) > cap; trial++) { chars = Math.max(1, Math.floor(.7 * chars)); slice = content.slice(0, chars); }
      this.logger.warn(`Referenced file content exceeds token cap (~${tokens} > ${cap}), inlining first ${slice.length}/${content.length} characters: ${filename}`);
      return `${slice}\n\n${prefix}showing the first ${slice.length} of ${content.length} characters (~${tokens} tokens, cap ${cap}); this file has very long lines and cannot be paginated by line. Use Grep to find a specific section, or Read with offset/limit to page through @${filename}. Do NOT answer from this excerpt alone if the answer may be elsewhere in the file.]`;
    }
    this.logger.warn(`Referenced file content exceeds token cap (~${tokens} > ${cap}), inlining first ${count}/${total} lines: ${filename}`);
    return `${excerpt}\n\n${prefix}showing lines 1-${count} of ${total} total (~${tokens} tokens, cap ${cap}). Call Read with offset=${count + 1} limit=${count} for the next page, or Grep to find a specific section of @${filename}. Do NOT answer from this page alone if the answer may be further in the file.]`;
  }
  async processImports(content: string, filename?: string, depth = 0, visited = new Set<string>()): Promise<string> {
    if (depth >= MAX_IMPORT_DEPTH) return content;
    let output = content;
    for (const { fullMatch, importPath, resolvedPath } of ImportUtils.extractImports(content, filename || "", this.workDir())) try {
      if (visited.has(resolvedPath)) { this.logger.warn(`Circular import detected: ${resolvedPath}`); continue; }
      visited.add(resolvedPath);
      let replacement: string;
      if (await stat(resolvedPath).then((entry) => entry.isDirectory()).catch(() => false)) replacement = await this.getDirectoryListing(resolvedPath);
      else {
        const { size } = await stat(resolvedPath);
        if (size > MAX_IMPORT_FILE_SIZE) { this.logger.warn(`Referenced file too large to inline (${size} bytes > ${MAX_IMPORT_FILE_SIZE}), keeping @reference as-is: ${importPath}`); continue; }
        const text = await readFile(resolvedPath, "utf8"), nested = await this.processImports(text, resolvedPath, depth + 1, new Set(visited));
        replacement = this.truncateByTokenCap(nested, resolvedPath);
      }
      output = output.replace(fullMatch, replacement);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") this.logger.debug(`Referenced file not found: ${importPath}`);
      else this.logger.warn(`Failed to import file: ${importPath}`, error);
    }
    return output;
  }
}

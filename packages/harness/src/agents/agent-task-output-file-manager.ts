import { mkdir, stat, writeFile, appendFile } from "node:fs/promises";
import { join } from "node:path";

export type AgentTaskOutputLogger = {
  info?(message: string): void;
  warn?(message: string, error?: unknown): void;
  error?(message: string, error?: unknown): void;
};

export class AgentTaskOutputFileManager {
  readonly MAX_FILE_SIZE = 0x6400000;

  constructor(
    private readonly outputDir: string,
    private readonly logger: AgentTaskOutputLogger = {},
  ) {}

  getDefaultOutputDir(): string {
    return this.outputDir;
  }

  async ensureOutputDirectory(path: string): Promise<void> {
    await mkdir(path, { recursive: true });
    this.logger.info?.(`Created directory: ${path}`);
  }

  async createOutputFile(taskId: string, outputDir?: string): Promise<string> {
    const directory = outputDir ?? this.getDefaultOutputDir();
    await this.ensureOutputDirectory(directory);
    const path = this.getOutputFilePath(taskId, directory);
    await writeFile(path, "", "utf8");
    this.logger.info?.(`Created output file: ${path}`);
    return path;
  }

  async appendToOutputFile(path: string, content: string): Promise<void> {
    if (!content) return;
    try {
      try {
        const current = await stat(path);
        if (current.size + content.length > this.MAX_FILE_SIZE) {
          this.logger.warn?.(
            `Output file ${path} approaching size limit (${current.size + content.length} bytes)`,
          );
        }
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
          this.logger.warn?.(`Failed to check file size for ${path}`, error);
        }
      }
      await appendFile(path, content, "utf8");
    } catch (error) {
      this.logger.error?.(`Failed to append to output file ${path}`, error);
    }
  }

  appendToOutputFileById(taskId: string, content: string): Promise<void> {
    if (!taskId || typeof taskId !== "string") {
      this.logger.warn?.("Invalid taskId provided to appendToOutputFileById");
      return Promise.resolve();
    }
    return this.appendToOutputFile(this.getOutputFilePath(taskId), content);
  }

  getOutputFilePath(taskId: string, outputDir?: string): string {
    return join(outputDir ?? this.getDefaultOutputDir(), `${taskId}.output`);
  }
}

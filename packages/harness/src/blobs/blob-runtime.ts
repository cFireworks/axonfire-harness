import * as fs from "node:fs/promises";
import { existsSync } from "node:fs";
import { BlobImageMime, BlobPathUtils } from "./blob-utils.js";
export type BlobLogger = {
  setContext(name: string): void;
  debug(message: string): void;
  warn(message: string): void;
  info(message: string): void;
};
export type BlobRuntime = {
  fs: Pick<typeof fs, "mkdir" | "writeFile" | "readFile" | "access" | "rm">;
  existsSync: typeof existsSync;
  paths: {
    getBlobPath(id: string, mime?: string): string;
    getHomeProjectDir(): string;
  };
  imageUtils: {
    getImageMimeTypeAsync(path: string, read: any): Promise<string>;
  };
  logger: BlobLogger;
  env: NodeJS.ProcessEnv;
};
export function createBlobRuntime(
  homeDir: string,
  projectDir: string,
  overrides: Partial<BlobRuntime> = {},
): BlobRuntime {
  class Paths extends BlobPathUtils {
    static override getHomeDir = () => homeDir;
  }
  return {
    fs,
    existsSync,
    paths: {
      getBlobPath: (id, mime) => Paths.getBlobPath(id, mime),
      getHomeProjectDir: () => projectDir,
    },
    imageUtils: BlobImageMime,
    logger: { setContext() {}, debug() {}, warn() {}, info() {} },
    env: process.env,
    ...overrides,
  };
}
export const BlobStore = Symbol("BlobStore");
export const ImageBlobService = Symbol("ImageBlobService");
export const ToolResultBlobService = Symbol("ToolResultBlobService");

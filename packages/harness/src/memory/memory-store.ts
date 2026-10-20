import { open, readdir } from "node:fs/promises";
import { basename, join } from "node:path";
import { MemoryMarkdownUtils } from "./native-memory-markdown.js";
import * as fs from "node:fs";
import * as fsPromises from "node:fs/promises";
import { createNativeMemoryScanner } from "./native-memory-scanner.js";

export const MEMORY_SCAN_HEAD_BYTES = 4_096;
export const MEMORY_SCAN_MAX_FILES = 200;
export const MEMORY_SEMANTIC_TYPES = [
  "user",
  "feedback",
  "project",
  "reference",
] as const;
export type MemorySemanticType = (typeof MEMORY_SEMANTIC_TYPES)[number];
export type MemoryFile = {
  filename: string;
  filePath: string;
  mtimeMs: number;
  description: string | null;
  type?: MemorySemanticType | undefined;
  name: string | null;
};

export function parseMemorySemanticType(
  value: unknown,
): MemorySemanticType | undefined {
  return typeof value === "string"
    ? MEMORY_SEMANTIC_TYPES.find((candidate) => candidate === value)
    : undefined;
}

/** The product's small frontmatter parser deliberately does not use a YAML runtime. */
export function extractFrontMatterWithContent(text: string): {
  data: Record<string, unknown>;
  content: string;
} {
  return MemoryMarkdownUtils.extractFrontMatterWithContent(text);
}

export function parseYamlFrontmatter(
  text: string,
): Record<string, unknown> | undefined {
  try {
    return extractFrontMatterWithContent(text).data;
  } catch {
    return undefined;
  }
}

const nativeScanner = createNativeMemoryScanner(
  { fs, fsPromises, warn: (...args: any[]) => console.warn(...args) },
  parseMemorySemanticType,
);
export async function readFileHead(
  path: string,
  maxBytes: number,
  signal?: AbortSignal,
): Promise<{ content: string; mtimeMs: number }> {
  return nativeScanner.readFileHead(path, maxBytes, signal);
}
export async function scanMemoryFiles(
  directory: string,
  signal?: AbortSignal,
): Promise<MemoryFile[]> {
  return nativeScanner.scanMemoryFiles(directory, signal);
}
export function formatMemoryManifest(files: MemoryFile[]): string {
  return nativeScanner.formatMemoryManifest(files);
}

export class MemoryLoadContextUtils {
  static create(): MemoryLoadContext {
    return {
      loadedMemories: new Map(),
      visitedFilePaths: new Set(),
      visitedDirectories: new Set(),
      importDepth: 0,
    };
  }
  static createChild(parent: MemoryLoadContext): MemoryLoadContext {
    return {
      loadedMemories: parent.loadedMemories,
      visitedFilePaths: new Set(parent.visitedFilePaths),
      visitedDirectories: parent.visitedDirectories,
      importDepth: parent.importDepth + 1,
    };
  }
}
export type MemoryLoadContext = {
  loadedMemories: Map<string, unknown>;
  visitedFilePaths: Set<string>;
  visitedDirectories: Set<string>;
  importDepth: number;
};

/** Original module 3238; product constants CodeBuddy/CODEBUDDY from module 26106. */
export const MemoryScope = {
  MANAGED: "managed",
  USER: "user",
  PROJECT: "project",
  PROJECT_LOCAL: "project-local",
} as const;
export const MemoryType = { ALWAYS: "always", MANUAL: "manual" } as const;
export const MEMORY_FILENAME = "CODEBUDDY.md";
export const MEMORY_FILENAME_MDC = "CODEBUDDY.mdc";
export const MEMORY_LOCAL_FILENAME = "CODEBUDDY.local.md";
export const MEMORY_LOCAL_FILENAME_MDC = "CODEBUDDY.local.mdc";
export const AGENTS_FILENAME = "AGENTS.md";
export const AGENTS_FILENAME_MDC = "AGENTS.mdc";
export const MEMORY_SECTION_HEADER = "## CodeBuddy Added Memories";
export const MAX_MEMORY_FILE_SIZE = 40_000;
export type MemoryRule = {
  filePath: string;
  scope: (typeof MemoryScope)[keyof typeof MemoryScope];
  type: (typeof MemoryType)[keyof typeof MemoryType];
  content: string;
  enabled: boolean;
  globs?: string[];
  alwaysApply: boolean;
  importedFrom: string[];
};
export type ConditionalRulesState = {
  pendingTriggers: Set<string>;
  processedRules: Set<string>;
};

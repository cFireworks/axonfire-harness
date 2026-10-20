export const WORKTREE_DIR = ".codebuddy/worktrees";
export const WORKTREE_BRANCH_PREFIX = "worktree-";
export enum WorktreeErrorCode { NOT_GIT_REPO = "NOT_GIT_REPO", CREATE_FAILED = "CREATE_FAILED", REMOVE_FAILED = "REMOVE_FAILED", GIT_COMMAND_FAILED = "GIT_COMMAND_FAILED", INIT_FAILED = "INIT_FAILED" }
export class WorktreeError extends Error {
  constructor(readonly code: WorktreeErrorCode, message: string, override readonly cause?: unknown) { super(message); this.name = "WorktreeError"; }
}
export type WorktreeCreateOptions = { baseBranch?: string | undefined; prNumber?: number | undefined; prPlatform?: string | undefined };
export type WorktreeInfo = { worktreePath: string; worktreeBranch: string; headCommit: string; baseBranch: string; existed: boolean };
export type WorktreeChangeInfo = { hasChanges: boolean; uncommittedFiles: number; unpushedCommits: number; changedFiles: string[]; modifiedFiles: string[]; stagedFiles: string[] };
export type WorktreeSession = { originalCwd: string; enteredCwd: string; worktreePath: string; worktreeName: string; worktreeBranch: string | undefined; originalBranch: string | undefined; originalHeadCommit: string | undefined; sessionId: string; tmuxSessionName: string | undefined; hookBased: boolean };
export type WorktreeSessionOptions = { baseBranch?: string | undefined; sessionId?: string | undefined; tmuxSessionName?: string | undefined };
export interface WorktreeServiceLike {
  create(name: string, options?: WorktreeCreateOptions): Promise<WorktreeInfo>;
  findGitRoot(directory: string): Promise<string | undefined>;
  getCurrentBranch(directory: string): Promise<string>;
  remove(directory: string, options?: { force?: boolean; deleteBranch?: boolean }): Promise<void>;
}
export interface WorktreeChangeDetectorLike { detect(directory: string, originalHeadCommit?: string | undefined): Promise<WorktreeChangeInfo>; }
export type WorktreeHookManager = {
  hasHooks(event: "WorktreeCreate" | "WorktreeRemove"): Promise<boolean>;
  executeHooks(event: "WorktreeCreate" | "WorktreeRemove", payload: Record<string, unknown>): Promise<{ allowed: boolean; stdout?: string; message?: string }>;
};

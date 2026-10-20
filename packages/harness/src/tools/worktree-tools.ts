import { z } from "zod";
import type { WorktreeSessionManager } from "../worktrees/worktree-session-manager.js";
import type { WorktreeChangeDetectorLike } from "../worktrees/worktree-types.js";
import type { ToolManager } from "./tool-manager.js";
export const EnterWorktreeSchema = z.object({
  name: z.string().optional().describe("Optional name for the worktree. If not provided, a random name will be generated."),
  branch: z.string().optional().describe("The base branch to create the worktree from. If not provided, defaults to the remote default branch (e.g. main/master)."),
});
export const LeaveWorktreeSchema = z.object({
  action: z.enum(["keep", "remove"]).optional().describe('What to do with the worktree. "keep": preserve worktree directory and branch for later use. "remove": delete worktree directory and associated branch. Defaults to "keep".'),
  force: z.boolean().optional().describe('Only used with action="remove". If true, force remove even when uncommitted changes or unpushed commits exist. If false or not specified, returns change details without removing when changes are detected. The user should be asked to confirm before using force=true.'),
});
export class WorktreeTools {
  constructor(readonly worktreeSessionManager: WorktreeSessionManager, readonly worktreeChangeDetector?: WorktreeChangeDetectorLike) {}
  async enter(input: { name?: string; branch?: string }): Promise<{ content: string }> {
    const current = this.worktreeSessionManager.getCurrentSession();
    if (current) return { content: `Already in a worktree session. Cannot create nested worktrees. Current worktree: ${current.worktreePath}` };
    try {
      const session = await this.worktreeSessionManager.createSession(input.name ?? true, { baseBranch: input.branch });
      const result = session.hookBased ? { worktreePath: session.worktreePath, worktreeType: "hook-based", message: `Successfully created and entered worktree at ${session.worktreePath} (via hook)` }
        : { worktreePath: session.worktreePath, worktreeBranch: session.worktreeBranch, worktreeType: "git", message: `Successfully created and entered worktree at ${session.worktreePath}${session.worktreeBranch ? ` on branch ${session.worktreeBranch}` : ""}` };
      return { content: JSON.stringify(result, null, 2) };
    } catch (error) { return { content: `Failed to create worktree: ${error instanceof Error ? error.message : String(error)}` }; }
  }
  async leave(input: { action?: "keep" | "remove"; force?: boolean }): Promise<{ content: string }> {
    const session = this.worktreeSessionManager.getCurrentSession();
    if (!session) return { content: "Not currently in a worktree session. Nothing to do." };
    const action = input.action ?? "keep", { worktreePath, worktreeBranch, originalCwd, hookBased } = session;
    if (action === "keep") { await this.worktreeSessionManager.keepWorktree(); const result: Record<string, unknown> = { action: "keep", previousWorktree: worktreePath, currentDirectory: originalCwd, message: `Left worktree. Directory preserved at ${worktreePath}` }; if (worktreeBranch) result.branch = worktreeBranch; return { content: JSON.stringify(result, null, 2) }; }
    if (!hookBased && this.worktreeChangeDetector) try {
      const changes = await this.worktreeChangeDetector.detect(worktreePath, session.originalHeadCommit);
      if (changes.hasChanges && !input.force) return { content: JSON.stringify({ action: "remove", blocked: true, changeInfo: { uncommittedFiles: changes.uncommittedFiles, unpushedCommits: changes.unpushedCommits, changedFiles: changes.changedFiles }, message: `Worktree has ${changes.uncommittedFiles} uncommitted file(s) and ${changes.unpushedCommits} unpushed commit(s). Ask the user to confirm, then call again with force=true to remove, or use action="keep" to preserve the worktree.` }, null, 2) };
    } catch {} else if (hookBased && !input.force) return { content: JSON.stringify({ action: "remove", blocked: true, message: 'Hook-based worktree: cannot detect changes automatically. Ask the user to confirm, then call again with force=true to remove, or use action="keep" to preserve the worktree.' }, null, 2) };
    await this.worktreeSessionManager.removeWorktree();
    return { content: JSON.stringify({ action: "remove", previousWorktree: worktreePath, currentDirectory: originalCwd, message: `Worktree removed at ${worktreePath}. Now working in ${originalCwd}.` }, null, 2) };
  }
  register(manager: ToolManager): void {
    manager.register("EnterWorktree", { parameters: EnterWorktreeSchema, parseInput: false, aliases: ["enter-worktree", "worktree"], needsApproval: true, execute: (input) => this.enter(input) });
    manager.register("LeaveWorktree", { parameters: LeaveWorktreeSchema, parseInput: false, aliases: ["leave-worktree"], needsApproval: true, execute: (input) => this.leave(input as any) });
  }
}

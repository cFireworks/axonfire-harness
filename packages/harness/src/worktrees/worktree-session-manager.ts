import { statSync } from "node:fs";
import { isAbsolute, join, relative } from "node:path";
import { CwdService } from "./cwd-service.js";
import { WorktreeNameGenerator, WorktreePRParser } from "./worktree-helpers.js";
import type { WorktreeChangeDetectorLike, WorktreeHookManager, WorktreeServiceLike, WorktreeSession, WorktreeSessionOptions } from "./worktree-types.js";

export type WorktreeSessionRuntime = {
  getCurrentSession?: () => { id: string } | undefined;
  getSessionFilePath?: (id: string) => string;
  /** Default is original process.chdir; embedding hosts may keep this cwd local. */
  changeDirectory?: (directory: string) => void;
  writeStderr?: (text: string) => unknown;
  tmuxService?: { killSession(name: string): Promise<void> };
};
const noHooks: WorktreeHookManager = { hasHooks: async () => false, executeHooks: async () => ({ allowed: true }) };
/** Original session state and lifecycle, 13422043..13428097; Hook execution is an injected host. */
export class WorktreeSessionManager {
  private currentSession: WorktreeSession | null = null;
  constructor(readonly worktreeService: WorktreeServiceLike, readonly changeDetector: WorktreeChangeDetectorLike, readonly cwdService: CwdService,
    readonly hookManager: WorktreeHookManager = noHooks, readonly runtime: WorktreeSessionRuntime = {}, readonly nameGenerator = new WorktreeNameGenerator(), readonly prParser = new WorktreePRParser()) {}
  private write(text: string): void { if (this.runtime.writeStderr) this.runtime.writeStderr(text); else process.stderr.write(text); }
  private enter(directory: string): void { (this.runtime.changeDirectory ?? process.chdir)(directory); this.cwdService.setCwdState(directory); }
  async createSession(name: string | boolean, options?: WorktreeSessionOptions): Promise<WorktreeSession> {
    const originalCwd = this.cwdService.getCwd(), root = await this.worktreeService.findGitRoot(originalCwd);
    let worktreeName: string, request: { prNumber: number; prPlatform: string } | undefined, originalBranch: string | undefined;
    if (typeof name !== "boolean" && name) { const parsed = this.prParser.parse(name); if (parsed) { worktreeName = `pr-${parsed.prNumber}`; request = { prNumber: parsed.prNumber, prPlatform: parsed.platform }; } else worktreeName = name; } else worktreeName = this.nameGenerator.generate();
    try { originalBranch = await this.worktreeService.getCurrentBranch(originalCwd); } catch {}
    if (await this.hookManager.hasHooks("WorktreeCreate")) return this.createSessionWithHook(worktreeName, originalCwd, originalBranch, options);
    this.write("✳ Creating worktree…\n");
    const created = await this.worktreeService.create(worktreeName, { ...request, baseBranch: options?.baseBranch });
    this.write(created.existed ? `  Resuming existing worktree at ${created.worktreePath}\n` : `  Created worktree at ${created.worktreePath} (based on ${created.baseBranch})\n`);
    const enteredCwd = this.resolveEnteredCwd(created.worktreePath, originalCwd, root); this.enter(enteredCwd);
    let sessionId = options?.sessionId; if (!sessionId) try { sessionId = this.runtime.getCurrentSession?.()?.id; } catch {}
    return this.currentSession = { originalCwd, enteredCwd, worktreePath: created.worktreePath, worktreeName, worktreeBranch: created.worktreeBranch, originalBranch, originalHeadCommit: created.headCommit, sessionId: sessionId ?? "", tmuxSessionName: options?.tmuxSessionName, hookBased: false };
  }
  getCurrentSession(): WorktreeSession | null { return this.currentSession; }
  isInWorktreeSession(): boolean { return this.currentSession !== null; }
  async keepWorktree(): Promise<void> {
    if (!this.currentSession) return;
    const { originalCwd, worktreePath, worktreeBranch, tmuxSessionName, hookBased } = this.currentSession;
    this.enter(originalCwd); this.currentSession = null;
    if (tmuxSessionName) { this.write(hookBased ? `  Worktree kept. Your work is saved at ${worktreePath}.\n` : `  Worktree kept. Your work is saved at ${worktreePath} on branch ${worktreeBranch}.\n`); this.write(`  Reattach to tmux session with: tmux attach -t ${tmuxSessionName}\n`); }
    else this.write(hookBased ? `  Linked worktree preserved at: ${worktreePath}\n` : `  Linked worktree preserved at: ${worktreePath}${worktreeBranch ? ` on branch: ${worktreeBranch}` : ""}\n`);
  }
  async removeWorktree(): Promise<void> {
    if (!this.currentSession) return;
    const { originalCwd, worktreePath, hookBased, originalHeadCommit, worktreeName } = this.currentSession;
    let changes: { hasChanges: boolean; unpushedCommits: number } | undefined;
    if (!hookBased) try { changes = await this.changeDetector.detect(worktreePath, originalHeadCommit); } catch { changes = { hasChanges: false, unpushedCommits: 0 }; }
    this.write("✳ Removing worktree…\n");
    if (hookBased) await this.removeWorktreeWithHook(worktreePath, worktreeName); else await this.worktreeService.remove(worktreePath, { force: true, deleteBranch: true });
    this.enter(originalCwd); this.currentSession = null;
    this.write(hookBased ? "  Worktree removed (via hook)\n" : changes?.hasChanges ? `  Worktree removed. ${changes.unpushedCommits} commits and uncommitted changes were discarded.\n` : "  Worktree removed (no changes)\n");
  }
  async handleExit(): Promise<"keep" | "remove"> { if (!this.currentSession) return "remove"; if (this.currentSession.hookBased || (await this.changeDetector.detect(this.currentSession.worktreePath, this.currentSession.originalHeadCommit)).hasChanges) return "keep"; await this.removeWorktree(); return "remove"; }
  async executeExitChoice(choice: "keep" | "remove" | "keep-kill-tmux"): Promise<void> {
    switch (choice) { case "keep": await this.keepWorktree(); break; case "remove": await this.removeWorktree(); break; case "keep-kill-tmux": { const name = this.currentSession?.tmuxSessionName; await this.keepWorktree(); if (name) await this.killTmuxSession(name); } }
  }
  async createSessionWithHook(name: string, originalCwd: string, originalBranch: string | undefined, options?: WorktreeSessionOptions): Promise<WorktreeSession> {
    this.write("✳ Creating worktree via hook…\n");
    let transcript = ""; try { const session = this.runtime.getCurrentSession?.(); if (session) transcript = this.runtime.getSessionFilePath?.(session.id) ?? ""; } catch {}
    const result = await this.hookManager.executeHooks("WorktreeCreate", { hook_event_name: "WorktreeCreate", session_id: options?.sessionId || "", transcript_path: transcript, cwd: originalCwd, name });
    if (!result.allowed) throw new Error(`WorktreeCreate hook failed: ${result.message || "unknown error"}`);
    const directory = this.extractWorktreePathFromStdout(result.stdout);
    if (!directory) throw new Error("WorktreeCreate hook did not output a valid worktree path. Hook stdout must contain the absolute path to the created worktree.");
    if (!isAbsolute(directory)) throw new Error(`WorktreeCreate hook returned a relative path: ${directory}. Hook must return an absolute path.`);
    this.write(`  Created worktree at ${directory} (via hook)\n`);
    const enteredCwd = this.resolveHookEnteredCwd(directory); this.enter(enteredCwd);
    let sessionId = options?.sessionId; if (!sessionId) try { sessionId = this.runtime.getCurrentSession?.()?.id; } catch {}
    return this.currentSession = { originalCwd, enteredCwd, worktreePath: directory, worktreeName: name, worktreeBranch: undefined, originalBranch, originalHeadCommit: undefined, sessionId: sessionId ?? "", tmuxSessionName: options?.tmuxSessionName, hookBased: true };
  }
  extractWorktreePathFromStdout(stdout?: string): string | undefined { if (!stdout) return; const lines = stdout.trim().split("\n"); for (let index = lines.length - 1; index >= 0; index--) { const line = lines[index]!.trim(); if (line) return line; } }
  resolveEnteredCwd(worktree: string, originalCwd: string, root?: string): string { if (!root) return worktree; const subdirectory = relative(root, originalCwd); if (!subdirectory || subdirectory === ".") return worktree; const candidate = join(worktree, subdirectory); try { return statSync(candidate).isDirectory() ? candidate : worktree; } catch { return worktree; } }
  resolveHookEnteredCwd(worktree: string): string { return worktree; }
  async removeWorktreeWithHook(directory: string, _name: string): Promise<void> {
    if (!await this.hookManager.hasHooks("WorktreeRemove")) { this.write(`  No WorktreeRemove hook configured. Worktree directory preserved at: ${directory}\n  You may need to remove it manually.\n`); return; }
    let transcript = "", sessionId = ""; try { const session = this.runtime.getCurrentSession?.(); if (session) { transcript = this.runtime.getSessionFilePath?.(session.id) ?? ""; sessionId = session.id || ""; } } catch {}
    try { const result = await this.hookManager.executeHooks("WorktreeRemove", { hook_event_name: "WorktreeRemove", session_id: sessionId, transcript_path: transcript, cwd: this.cwdService.getCwd(), worktree_path: directory }); if (!result.allowed) console.warn(`WorktreeRemove hook returned error: ${result.message || "unknown error"}`); } catch (error: any) { console.warn(`WorktreeRemove hook execution failed: ${error.message}`); }
  }
  async killTmuxSession(name: string): Promise<void> { if (this.runtime.tmuxService) try { await this.runtime.tmuxService.killSession(name); console.log(`Tmux session "${name}" has been terminated.`); } catch (error: any) { console.warn(`Failed to kill tmux session: ${error.message}`); console.log(`To kill manually: tmux kill-session -t ${name}`); } else console.log(`To kill tmux session manually: tmux kill-session -t ${name}`); }
}

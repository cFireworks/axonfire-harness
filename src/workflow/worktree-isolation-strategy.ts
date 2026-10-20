import type { WorktreeService } from "../worktrees/worktree-service.js";
import type { WorktreeChangeDetector } from "../worktrees/worktree-helpers.js";
import type { WorkflowLogger } from "./subagent-types.js";
export type WorktreeLease = { cwd: string | undefined; release(): Promise<void> };
export class WorktreeIsolationStrategy {
  nextIndex = 1;
  constructor(readonly worktreeService: Pick<WorktreeService, "create" | "remove">, readonly changeDetector: Pick<WorktreeChangeDetector, "detect"> | undefined, readonly runId: string, readonly logger: WorkflowLogger = {}) {}
  async lease(): Promise<WorktreeLease> {
    const index = this.nextIndex++, name = `wf-${this.runId.slice(0, 8)}-${index}`;
    let worktree;
    try { worktree = await this.worktreeService.create(name); }
    catch (error) { this.logger.warn?.(`[WorkflowIsolation] worktree create failed for ${name}, falling back to inherit cwd: ` + (error as Error).message); return { cwd: undefined, release: async () => undefined }; }
    const { worktreePath } = worktree;
    return { cwd: worktreePath, release: async () => this.releaseWorktree(worktreePath) };
  }
  async releaseWorktree(path: string): Promise<void> { try { if (await this.detectChanges(path)) { this.logger.info?.(`[WorkflowIsolation] worktree ${path} has changes; keeping for review`); return; } await this.worktreeService.remove(path, { deleteBranch: true }); } catch (error) { this.logger.warn?.(`[WorkflowIsolation] worktree release failed for ${path}: ${(error as Error).message}`); } }
  async detectChanges(path: string): Promise<boolean> { if (!this.changeDetector) return false; try { return (await this.changeDetector.detect(path)).hasChanges; } catch { return true; } }
}

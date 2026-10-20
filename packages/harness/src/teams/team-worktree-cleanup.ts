import { rm } from "node:fs/promises";
import type { WorktreeChangeDetectorLike, WorktreeServiceLike } from "../worktrees/worktree-types.js";
import type { TeamLogger, TeamMemberInfo } from "./team-types.js";
export class TeamWorktreeCleanupService {
  constructor(readonly worktreeService: WorktreeServiceLike, readonly changeDetector: WorktreeChangeDetectorLike, readonly logger: TeamLogger = {}) {}
  async cleanupTeamWorktrees(members: TeamMemberInfo[]): Promise<{ cleaned: string[]; preserved: string[]; failed: string[] }> {
    const cleaned: string[] = [], preserved: string[] = [], failed: string[] = [];
    for (const member of members) if (member.worktreePath) try { (await this.cleanupMemberWorktree(member) ? cleaned : preserved).push(member.name); } catch (error) { this.logger.error?.(`Failed to cleanup worktree for team member ${member.name}: ${error}`); failed.push(member.name); }
    if (cleaned.length) this.logger.info?.(`Cleaned up worktrees for: ${cleaned.join(", ")}`); if (preserved.length) this.logger.info?.(`Preserved worktrees with changes for: ${preserved.join(", ")}`); if (failed.length) this.logger.warn?.(`Failed to cleanup worktrees for: ${failed.join(", ")}`); return { cleaned, preserved, failed };
  }
  async cleanupMemberWorktree(member: TeamMemberInfo): Promise<boolean> { const directory = member.worktreePath; if (!directory) return true; try { const changes = await this.changeDetector.detect(directory); if (changes.hasChanges) { this.logger.info?.(`Preserving worktree for ${member.name} at ${directory}. Changes: ${changes.uncommittedFiles} uncommitted files, ${changes.unpushedCommits} unpushed commits.`); return false; } this.logger.info?.(`Removing worktree for ${member.name} at ${directory} (no changes)`); await this.worktreeService.remove(directory, { force: true, deleteBranch: true }); return true; } catch (error) { this.logger.warn?.(`Failed to remove worktree via git for ${member.name}, attempting force cleanup: ${error}`); try { await rm(directory, { recursive: true, force: true }); return true; } catch (failure) { this.logger.error?.(`Failed to force cleanup worktree for ${member.name}: ${failure}`); throw failure; } } }
}

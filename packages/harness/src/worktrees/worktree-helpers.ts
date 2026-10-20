import { randomBytes } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { WorktreeChangeInfo } from "./worktree-types.js";
const execute = promisify(execFile);
const ADJECTIVES = ["swift", "bright", "calm", "keen", "bold", "wise", "quick", "cool", "warm", "soft", "deep", "fair", "free", "glad", "kind", "neat", "safe", "pure", "rich", "true"];
const NOUNS = ["fox", "owl", "elm", "oak", "ray", "bay", "bee", "cat", "dog", "elk", "fir", "gem", "ivy", "jay", "kit", "lark", "moth", "newt", "pine", "rose"];
export class WorktreeNameGenerator {
  generate(): string { return `${this.randomPick(ADJECTIVES)}-${this.randomPick(NOUNS)}-${this.generateRandomId(4)}`; }
  randomPick(values: string[]): string { return values[Math.floor(Math.random() * values.length)]!; }
  generateRandomId(length: number): string { return randomBytes(Math.ceil(length / 2)).toString("hex").slice(0, length); }
}
export type WorktreePullRequest = { prNumber: number; platform: "github" | "gitlab" | "cnb"; owner?: string; repo?: string };
export class WorktreePRParser {
  parse(input: unknown): WorktreePullRequest | null {
    if (!input || typeof input !== "string") return null;
    const text = input.trim(), shorthand = text.match(/^#(\d+)$/);
    if (shorthand) return { prNumber: parseInt(shorthand[1]!, 10), platform: "github" };
    for (const [platform, pattern] of [
      ["cnb", /^https?:\/\/cnb\.[^/]+\/([^/]+)\/([^/]+)\/-\/pulls\/(\d+)/],
      ["github", /^https?:\/\/(?:www\.)?github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/],
      ["gitlab", /^https?:\/\/(?:www\.)?gitlab\.com\/([^/]+)\/([^/]+)\/-\/merge_requests\/(\d+)/],
    ] as const) { const match = text.match(pattern); if (match) return { prNumber: parseInt(match[3]!, 10), platform, owner: match[1]!, repo: match[2]! }; }
    return null;
  }
}
/** Source uses allSettled and treats failed Git probes as empty, including a trim/slice porcelain quirk. */
export class WorktreeChangeDetector {
  async detect(directory: string, originalHeadCommit?: string | undefined): Promise<WorktreeChangeInfo> {
    const result: WorktreeChangeInfo = { hasChanges: false, uncommittedFiles: 0, unpushedCommits: 0, changedFiles: [], modifiedFiles: [], stagedFiles: [] };
    const [status, modified, staged, commits] = await Promise.allSettled([this.getGitStatus(directory), this.getModifiedFiles(directory), this.getStagedFiles(directory), originalHeadCommit ? this.getUnpushedCommitCount(directory, originalHeadCommit) : Promise.resolve(0)]);
    if (status.status === "fulfilled" && status.value) { const lines = status.value.trim().split("\n").filter(Boolean); result.uncommittedFiles = lines.length; result.hasChanges = lines.length > 0; result.changedFiles = lines.map((line) => line.slice(3)); }
    if (modified.status === "fulfilled" && modified.value) result.modifiedFiles = modified.value.trim().split("\n").filter(Boolean);
    if (staged.status === "fulfilled" && staged.value) result.stagedFiles = staged.value.trim().split("\n").filter(Boolean);
    if (commits.status === "fulfilled" && commits.value > 0) { result.unpushedCommits = commits.value; result.hasChanges = true; }
    return result;
  }
  async getGitStatus(directory: string): Promise<string> { try { return (await execute("git", ["status", "--porcelain"], { cwd: directory, timeout: 30000 })).stdout; } catch { return ""; } }
  async getModifiedFiles(directory: string): Promise<string> { try { return (await execute("git", ["diff", "--name-only"], { cwd: directory, timeout: 30000 })).stdout; } catch { return ""; } }
  async getStagedFiles(directory: string): Promise<string> { try { return (await execute("git", ["diff", "--staged", "--name-only"], { cwd: directory, timeout: 30000 })).stdout; } catch { return ""; } }
  async getUnpushedCommitCount(directory: string, commit: string): Promise<number> { try { return parseInt((await execute("git", ["rev-list", "--count", `${commit}..HEAD`], { cwd: directory, timeout: 30000 })).stdout.trim(), 10) || 0; } catch { return 0; } }
}

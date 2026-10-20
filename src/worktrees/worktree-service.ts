import { execFile } from "node:child_process";
import { access, mkdir, rm } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { promisify } from "node:util";
import { CwdService } from "./cwd-service.js";
import { WORKTREE_DIR, WORKTREE_BRANCH_PREFIX, WorktreeError, WorktreeErrorCode, type WorktreeCreateOptions, type WorktreeInfo } from "./worktree-types.js";
const execute = promisify(execFile);
/** Source service 13413904..13418608. Callers must restrict remove() to their known worktree paths. */
export class WorktreeService {
  constructor(readonly cwdService: CwdService, readonly initializer: { initialize(repository: string, worktree: string): Promise<void> }) {}
  async create(name: string, options?: WorktreeCreateOptions): Promise<WorktreeInfo> {
    const root = await this.findGitRoot(this.cwdService.getCwd());
    if (!root) throw new WorktreeError(WorktreeErrorCode.NOT_GIT_REPO, "Not in a git repository. The --worktree flag requires a git repository.");
    const worktreePath = join(root, WORKTREE_DIR, name), worktreeBranch = `${WORKTREE_BRANCH_PREFIX}${name}`;
    if (await this.exists(name)) { const headCommit = await this.getHeadCommit(worktreePath), branch = await this.getCurrentBranch(worktreePath); return { worktreePath, worktreeBranch: branch, headCommit, baseBranch: branch, existed: true }; }
    try { await this.executeGitCommand(root, ["worktree", "prune"]); } catch {}
    await mkdir(dirname(worktreePath), { recursive: true });
    const baseBranch = await this.determineBaseBranch(root, options);
    await this.deleteBranchIfExists(root, worktreeBranch);
    await this.executeGitCommand(root, ["worktree", "add", "-b", worktreeBranch, worktreePath, baseBranch]);
    try { await this.executeGitCommand(worktreePath, ["branch", "--unset-upstream"]); } catch {}
    const headCommit = await this.getHeadCommit(worktreePath);
    await this.initializer.initialize(root, worktreePath);
    return { worktreePath, worktreeBranch, headCommit, baseBranch, existed: false };
  }
  async exists(name: string): Promise<boolean> {
    const root = await this.findGitRoot(this.cwdService.getCwd()); if (!root) return false;
    const directory = join(root, WORKTREE_DIR, name);
    try { await access(directory); await this.executeGitCommand(directory, ["rev-parse", "HEAD"]); return true; } catch { return false; }
  }
  async remove(directory: string, options?: { force?: boolean; deleteBranch?: boolean }): Promise<void> {
    const root = await this.findGitRoot(directory);
    if (!root) { await rm(directory, { recursive: true, force: true }); return; }
    const args = ["worktree", "remove"]; if (options?.force) args.push("--force"); args.push(directory);
    try { await this.executeGitCommand(root, args); } catch { console.warn(`git worktree remove failed, falling back to rm -rf: ${directory}`); await rm(directory, { recursive: true, force: true }); }
    if (options?.deleteBranch) await this.deleteBranchWithRetry(root, `${WORKTREE_BRANCH_PREFIX}${basename(directory)}`, 3, 100);
    try { await this.executeGitCommand(root, ["worktree", "prune"]); } catch {}
  }
  async list(): Promise<string[]> { const root = await this.findGitRoot(this.cwdService.getCwd()); if (!root) return []; try { return (await this.executeGitCommand(root, ["worktree", "list", "--porcelain"])).stdout.split("\n").filter((line) => line.startsWith("worktree ")).map((line) => line.slice(9).normalize("NFC")); } catch { return []; } }
  async findGitRoot(directory: string): Promise<string | undefined> { try { return (await this.executeGitCommand(directory, ["rev-parse", "--show-toplevel"])).stdout.trim().normalize("NFC"); } catch { return undefined; } }
  async getCurrentBranch(directory: string): Promise<string> { return (await this.executeGitCommand(directory, ["rev-parse", "--abbrev-ref", "HEAD"])).stdout.trim(); }
  async getHeadCommit(directory: string): Promise<string> { return (await this.executeGitCommand(directory, ["rev-parse", "HEAD"])).stdout.trim(); }
  async determineBaseBranch(directory: string, options?: WorktreeCreateOptions): Promise<string> {
    if (options?.prNumber) { const ref = options.prPlatform === "gitlab" ? `refs/merge-requests/${options.prNumber}/head` : `pull/${options.prNumber}/head`; await this.executeGitCommand(directory, ["fetch", "origin", ref], { env: this.getGitEnv() }); return "FETCH_HEAD"; }
    if (options?.baseBranch) {
      const remote = options.baseBranch.match(/^(origin)\/(.+)$/);
      if (remote) { try { await this.executeGitCommand(directory, ["fetch", "origin", remote[2]!], { env: this.getGitEnv() }); return options.baseBranch; } catch { process.stderr.write(`  Warning: Remote branch "${options.baseBranch}" not found. Falling back to default branch.\n`); } }
      else { try { await this.executeGitCommand(directory, ["show-ref", "--verify", `refs/heads/${options.baseBranch}`]); return options.baseBranch; } catch { process.stderr.write(`  Warning: Local branch "${options.baseBranch}" not found. Falling back to default branch.\n`); } }
    }
    const branch = await this.getRemoteDefaultBranch(directory);
    try { await this.executeGitCommand(directory, ["fetch", "origin", branch], { env: this.getGitEnv() }); return `origin/${branch}`; } catch { return "HEAD"; }
  }
  async getRemoteDefaultBranch(directory: string): Promise<string> {
    try { const match = (await this.executeGitCommand(directory, ["symbolic-ref", "refs/remotes/origin/HEAD"])).stdout.trim().match(/^refs\/remotes\/origin\/(.+)$/); if (match?.[1]) return match[1]; } catch {}
    try { const match = (await this.executeGitCommand(directory, ["ls-remote", "--symref", "origin", "HEAD"], { env: this.getGitEnv(), timeout: 15000 })).stdout.match(/ref:\s+refs\/heads\/(\S+)\s+HEAD/); if (match?.[1]) return match[1]; } catch {}
    for (const branch of ["main", "master", "develop", "trunk"]) try { await this.executeGitCommand(directory, ["show-ref", "--verify", `refs/remotes/origin/${branch}`]); return branch; } catch {}
    return this.getCurrentBranch(directory);
  }
  async deleteBranchIfExists(directory: string, branch: string): Promise<void> { try { await this.executeGitCommand(directory, ["show-ref", "--verify", `refs/heads/${branch}`]); await this.executeGitCommand(directory, ["branch", "-D", branch]); } catch {} }
  async deleteBranchWithRetry(directory: string, branch: string, retries: number, delay: number): Promise<void> { for (let index = 0; index <= retries; index++) try { await this.deleteBranchIfExists(directory, branch); return; } catch (error) { if (index === retries) { console.warn(`Failed to delete branch ${branch} after ${retries + 1} attempts: ${error}`); return; } await new Promise((done) => setTimeout(done, delay)); } }
  getGitEnv(): NodeJS.ProcessEnv { return { ...process.env, GIT_TERMINAL_PROMPT: "0", GIT_ASKPASS: "" }; }
  async executeGitCommand(directory: string, args: string[], options?: { cwd?: string; env?: NodeJS.ProcessEnv; timeout?: number }): Promise<{ stdout: string; stderr: string }> {
    const { stdout, stderr } = await execute("git", args, { cwd: options?.cwd ?? directory, env: options?.env ?? process.env, timeout: options?.timeout ?? 60000, maxBuffer: 0xa00000 }); return { stdout, stderr };
  }
}

import { execFile } from "node:child_process";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { promisify } from "node:util";
import fastGlob from "fast-glob";
const execute = promisify(execFile);

/** Target initializer 13430239..13434960. Node fast-glob is the bundle's non-Bun branch. */
export class WorktreeInitializer {
  async initialize(repository: string, worktree: string): Promise<void> {
    await Promise.all([this.copyLocalSettings(repository, worktree), this.configureHooksPath(repository, worktree)]);
    await this.createSymlinks(repository, worktree);
    await this.processWorktreeInclude(repository, worktree);
  }
  async copyLocalSettings(repository: string, worktree: string): Promise<void> {
    const filename = "settings.local.json", source = path.join(repository, ".codebuddy", filename), target = path.join(worktree, ".codebuddy");
    try { await fs.access(source); await fs.mkdir(target, { recursive: true }); await fs.copyFile(source, path.join(target, filename)); } catch (error: any) { if (error.code !== "ENOENT") console.warn(`Failed to copy local settings: ${error.message}`); }
  }
  async configureHooksPath(repository: string, worktree: string): Promise<void> {
    for (const directory of [".husky", ".git/hooks"]) try { const candidate = path.join(repository, directory); if ((await fs.stat(candidate)).isDirectory()) { await this.executeGitCommand(worktree, ["config", "core.hooksPath", candidate]); return; } } catch {}
  }
  async createSymlinks(repository: string, worktree: string): Promise<void> {
    const configured = await this.readWorktreeSymlinkDirs(repository); if (!configured.length) return;
    const entries = await this.resolveSymlinkEntries(repository, configured);
    for (const entry of await this.filterDirsWithTrackedFiles(repository, entries)) {
      if (this.hasPathTraversal(entry)) { console.warn(`Skipping symlink for "${entry}": path traversal detected`); continue; }
      const source = path.join(repository, entry), target = path.join(worktree, entry);
      if (!source.startsWith(repository + path.sep) && source !== repository) { console.warn(`Skipping symlink for "${entry}": resolved path escapes mainRepo`); continue; }
      if (!source.startsWith(worktree + path.sep) && source !== worktree) try {
        const type = (await fs.stat(source)).isDirectory() ? "dir" : "file";
        await fs.mkdir(path.dirname(target), { recursive: true });
        try { const existing = await fs.lstat(target); if (existing.isSymbolicLink()) continue; if (existing.isDirectory()) await fs.rm(target, { recursive: true, force: true }); else await fs.unlink(target); } catch {}
        await fs.symlink(source, target, type);
      } catch (error: any) { if (error.code !== "ENOENT") console.warn(`Failed to symlink ${entry}: ${error.message}`); }
    }
  }
  async filterDirsWithTrackedFiles(repository: string, entries: string[]): Promise<string[]> {
    if (!entries.length) return [];
    let files: string[];
    try { files = (await this.executeGitCommand(repository, ["ls-files", "--", ...entries.map((entry) => `${entry}/`)])).stdout.split("\n").filter(Boolean); } catch { return entries; }
    if (!files.length) return entries;
    const tracked = new Set<string>();
    for (const filename of files) for (const entry of entries) if (filename.startsWith(entry.endsWith("/") ? entry : entry + "/")) { tracked.add(entry); break; }
    if (tracked.size) {
      process.stderr.write(`  Warning: Skipped symlink for ${tracked.size} director${tracked.size === 1 ? "y" : "ies"} containing git-tracked files:\n`);
      for (const entry of [...tracked].sort()) process.stderr.write(`    - ${entry}\n`);
      process.stderr.write("  To enable symlink, remove tracked files with: git rm --cached <file>\n");
    }
    return entries.filter((entry) => !tracked.has(entry));
  }
  async resolveSymlinkEntries(repository: string, entries: string[]): Promise<string[]> {
    const result: string[] = [];
    for (const entry of entries) if (this.isGlobPattern(entry)) {
      try { result.push(...await fastGlob(this.toDirectoryGlobPattern(entry), { cwd: repository, onlyDirectories: true, followSymbolicLinks: false, ignore: [".codebuddy/worktrees/**"] })); } catch (error: any) { console.warn(`Failed to glob "${entry}": ${error.message}`); }
    } else result.push(entry);
    return this.deduplicateNestedPaths(result);
  }
  isGlobPattern(entry: string): boolean { return /[*?[{]/.test(entry); }
  toDirectoryGlobPattern(entry: string): string { return entry.replace(/\/[*]+$/, "").replace(/\/$/, ""); }
  deduplicateNestedPaths(entries: string[]): string[] {
    if (entries.length <= 1) return entries;
    const sorted = [...entries].sort((left, right) => left.split("/").length - right.split("/").length || left.localeCompare(right)), result: string[] = [];
    for (const entry of sorted) { const normalized = entry.replace(/\\/g, "/"); if (!result.some((existing) => normalized.startsWith(existing.replace(/\\/g, "/") + "/"))) result.push(entry); }
    return result;
  }
  async processWorktreeInclude(repository: string, worktree: string): Promise<void> {
    let text: string; try { text = await fs.readFile(path.join(repository, ".worktreeinclude"), "utf8"); } catch { return; }
    if (!text.split(/\r?\n/).some((line) => { const trimmed = line.trim(); return trimmed.length > 0 && !trimmed.startsWith("#"); })) return;
    try {
      const files = (await this.executeGitCommand(repository, ["ls-files", "--others", "--ignored", "--exclude-from=.worktreeinclude"])).stdout.split("\n").filter(Boolean);
      if (!files.length) return;
      for (const filename of await this.filterGitIgnoredFiles(repository, files)) try { const target = path.join(worktree, filename); await fs.mkdir(path.dirname(target), { recursive: true }); await fs.copyFile(path.join(repository, filename), target); } catch (error: any) { console.warn(`Failed to copy ${filename}: ${error.message}`); }
    } catch (error: any) { console.warn(`Failed to process .worktreeinclude: ${error.message}`); }
  }
  async filterGitIgnoredFiles(repository: string, files: string[]): Promise<string[]> {
    if (!files.length) return [];
    try {
      const { stdout } = await new Promise<{ stdout: string; stderr: string }>((done, fail) => {
        const child = execFile("git", ["check-ignore", "--stdin"], { cwd: repository, timeout: 30000, maxBuffer: 0xa00000 }, (error, stdout, stderr) => {
          if (error && error.code !== 1 && !error.killed) { fail(error); return; }
          done({ stdout: stdout || "", stderr: stderr || "" });
        }); child.stdin?.write(files.join("\n")); child.stdin?.end();
      }); return stdout.split("\n").filter(Boolean);
    } catch { return []; }
  }
  async readWorktreeSymlinkDirs(repository: string): Promise<string[]> {
    for (const filename of ["settings.local.json", "settings.json"]) try { const entries = JSON.parse(await fs.readFile(path.join(repository, ".codebuddy", filename), "utf8"))?.worktree?.symlinkDirectories; if (Array.isArray(entries) && entries.length) return entries; } catch {}
    return [];
  }
  hasPathTraversal(entry: string): boolean { return /(?:^|[\\/])\.\.(?:[\\/]|$)/.test(entry); }
  async executeGitCommand(directory: string, args: string[]): Promise<{ stdout: string; stderr: string }> { const { stdout, stderr } = await execute("git", args, { cwd: directory, timeout: 30000, maxBuffer: 0xa00000 }); return { stdout, stderr }; }
}

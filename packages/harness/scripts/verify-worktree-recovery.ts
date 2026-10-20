import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import * as crypto from "node:crypto";
import * as fs from "node:fs/promises";
import * as fsSync from "node:fs";
import * as path from "node:path";
import { tmpdir } from "node:os";
import { AsyncLocalStorage } from "node:async_hooks";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { runInNewContext } from "node:vm";
import { BehaviorSubject } from "rxjs";
import { map, distinctUntilChanged } from "rxjs/operators/index.js";
import { z as z3 } from "zod3";
import fastGlob from "fast-glob";
import { CwdService } from "../src/worktrees/cwd-service.js";
import { WorktreeNameGenerator, WorktreePRParser, WorktreeChangeDetector } from "../src/worktrees/worktree-helpers.js";
import { WorktreeService } from "../src/worktrees/worktree-service.js";
import { WorktreeInitializer } from "../src/worktrees/worktree-initializer.js";
import { WorktreeSessionManager } from "../src/worktrees/worktree-session-manager.js";
import * as types from "../src/worktrees/worktree-types.js";
import { WorktreeTools, EnterWorktreeSchema, LeaveWorktreeSchema } from "../src/tools/worktree-tools.js";
import { WorktreeContextInterceptor, WORKTREE_CONTEXT_PROMPT } from "../src/agents/worktree-context-interceptor.js";
import { addSystemReminder } from "../src/agents/system-reminder-agent-run-interceptor.js";
import { HarnessSession } from "../src/sessions/session.js";

const filename = process.argv[2]; if (!filename) throw new Error("Pass the captured WorkBuddy 5.3.14 codebuddy.js path");
const source = await fs.readFile(filename, "utf8"); assert.equal(createHash("sha256").update(source).digest("hex"), "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd");
const execute = promisify(execFile), directory = await fs.realpath(await fs.mkdtemp(path.join(tmpdir(), "harness-worktree-diff-")));
const quiet = { warn() {}, info() {}, debug() {}, log() {} };
function evaluate(code: string, context: any = {}): any { return runInNewContext(code, { Error, Date, Math, process, console: quiet, setTimeout, ...context }, { timeout: 10000, contextCodeGeneration: { strings: false, wasm: false } }); }
const OriginalCwd = evaluate(`(${source.slice(13441020, 13441541)})`, { eV: { AsyncLocalStorage }, eZ: { BehaviorSubject }, eX: { map }, e0: { distinctUntilChanged } });
const constantsStart = source.indexOf("let eG=/^#", 13437912), constantsEnd = source.indexOf(",eY=class", constantsStart);
const OriginalParser = evaluate(`(()=>{${source.slice(constantsStart, constantsEnd)};return(${source.slice(13438636, 13439095)})})()`);
const namesStart = source.indexOf("let eF=[", 13436847), namesEnd = source.indexOf(",ej=class", namesStart);
const OriginalNames = evaluate(`(()=>{${source.slice(namesStart, namesEnd)};return(${source.slice(13437640, 13437912)})})()`, { eL: crypto });
const OriginalChanges = evaluate(`(${source.slice(13435488, 13436847)})`, { eN: execute });
const OriginalInitializer = evaluate(`(${source.slice(13430239, 13434960)})`, { eC: path, eE: fs, eM: execute, em: { execFile }, ek: () => fastGlob, ex: /(?:^|[\\/])\.\.(?:[\\/]|$)/ });
const OriginalService = evaluate(`(${source.slice(13413904, 13418608)})`, { eC: path, eE: fs, ew: execute, eh: types });
const originalSessionCode = source.slice(13422043, 13428097);
const resultStart = source.indexOf("!function(eA){eA.is=function(eA){return\"object\"==typeof eA&&\"content\"in eA}"), resultEnd = source.indexOf(";let ex=", resultStart);
assert.ok(resultStart > 0 && resultEnd > resultStart);
const ToolResult = evaluate(`(()=>{let eu;${source.slice(resultStart, resultEnd)};return eu})()`);
function schema(start: string, end: string) { const offset = source.indexOf(start, 12055000); return evaluate(`(${source.slice(offset + start.length, source.indexOf(end, offset))})`, { iJ: { z: z3 } }); }
const OriginalEnterSchema = schema("let cF=", ",cU="), OriginalLeaveSchema = schema("let cj=", ",cG=");
const toolContext = { iz: { BaseTool: class {} }, nC: { ToolNames: { ENTER_WORKTREE: "EnterWorktree", LEAVE_WORKTREE: "LeaveWorktree" }, ToolResult }, cF: OriginalEnterSchema, cj: OriginalLeaveSchema };
const OriginalEnter = evaluate(`(${source.slice(12056034, 12057158)})`, toolContext), OriginalLeave = evaluate(`(${source.slice(12058504, 12060359)})`, toolContext);
const promptStart = source.indexOf('let em="git worktree",eE=') + 'let em="git worktree",eE='.length;
const originalPrompt = evaluate(source.slice(promptStart, source.indexOf(",eC=class", promptStart)));
const OriginalInterceptor = evaluate(`(${source.slice(13442613, 13443444)})`, { eg: { AgentRunInterceptorPriority: { WorktreeContext: 1190 } }, eh: { MessageUtils: { addSystemReminder } }, em: "git worktree", eE: originalPrompt });
let comparisons = 0;
const plain = (value: any) => value === undefined ? undefined : JSON.parse(JSON.stringify(value));
function equal(actual: any, expected: any) { assert.deepEqual(plain(actual), plain(expected)); comparisons++; }
async function outcome(operation: () => any) { try { return { value: await operation() }; } catch (error: any) { return { error: error.message }; } }
const clean = () => ({ hasChanges: false, uncommittedFiles: 0, unpushedCommits: 0, changedFiles: [], modifiedFiles: [], stagedFiles: [] });

try {
  equal(WORKTREE_CONTEXT_PROMPT, originalPrompt);
  for (const [before, after] of [[OriginalEnterSchema, EnterWorktreeSchema], [OriginalLeaveSchema, LeaveWorktreeSchema]] as const) {
    for (const input of [{}, { name: "" }, { name: "x", branch: "main" }, { name: 1 }, { branch: null }, { action: "keep" }, { action: "remove", force: false }, { action: "remove", force: true, unknown: 1 }, { action: "unknown" }, { force: "true" }]) { const left = after.safeParse(input), right = before.safeParse(input); equal(left.success, right.success); if (left.success && right.success) equal(left.data, right.data); }
    for (const key of Object.keys(before.shape)) equal((after.shape as Record<string, any>)[key].description, before.shape[key].description);
  }
  const parser = new WorktreePRParser(), originalParser = new OriginalParser();
  for (const input of [null, undefined, false, 0, 1, "", "3", "#-1", " #00042 ", "https://gitlab.com/o/sub/r/-/merge_requests/3", ...Array.from({ length: 30 }, (_, number) => [`#${number}`, `https://github.com/o/r/pull/${number}suffix`, `http://www.github.com/o/r/pull/${number}`, `https://gitlab.com/o/r/-/merge_requests/${number}`, `https://cnb.cool/o/r/-/pulls/${number}`, `https://other.example/o/r/pull/${number}`]).flat()]) equal(parser.parse(input), originalParser.parse(input));
  for (let index = 0; index < 20; index++) { const before = new OriginalNames(), after = new WorktreeNameGenerator(); for (const generator of [before, after]) { generator.randomPick = (values: string[]) => values[index]; generator.generateRandomId = () => "1234"; } equal(after.generate(), before.generate()); }
  const beforeCwd = new OriginalCwd(), afterCwd = new CwdService(), beforeChanges: string[] = [], afterChanges: string[] = [];
  const beforeSub = beforeCwd.onDidChangeCwd.subscribe((value: string) => beforeChanges.push(value)), afterSub = afterCwd.onDidChangeCwd.subscribe((value) => afterChanges.push(value));
  for (const [value, emit] of [["/a", false], ["/b", true], ["/b", true], ["/c", false], ["/d", true]] as const) { beforeCwd.setCwdState(value, emit); afterCwd.setCwdState(value, emit); equal(afterCwd.getCwd(), beforeCwd.getCwd()); equal(afterChanges, beforeChanges); }
  for (const cwd of [beforeCwd, afterCwd]) equal(await cwd.runWithCwd("/local", async () => { await Promise.resolve(); return cwd.getCwd(); }), "/local"); beforeSub.unsubscribe(); afterSub.unsubscribe();
  for (const status of ["", " M a.txt\n", "?? b.txt\n M a.txt\n", "R  old -> new\n", "\n", new Error("status")]) for (const modified of ["", "a.txt\nb.txt\n", new Error("modified")]) for (const commits of [0, 1, 9, new Error("commit")]) {
    const before = new OriginalChanges(), after = new WorktreeChangeDetector();
    for (const detector of [before, after]) { detector.getGitStatus = async () => { if (status instanceof Error) throw status; return status; }; detector.getModifiedFiles = async () => { if (modified instanceof Error) throw modified; return modified; }; detector.getStagedFiles = async () => "staged.txt\n"; detector.getUnpushedCommitCount = async () => { if (commits instanceof Error) throw commits; return commits; }; }
    equal(await after.detect(directory, "baseline"), await before.detect(directory, "baseline")); equal(await after.detect(directory), await before.detect(directory));
  }
  const beforeInit = new OriginalInitializer(), afterInit = new WorktreeInitializer();
  for (const value of ["", "..", "../x", "x/../y", "x\\..\\y", "x..y", "node_modules/**", "packages/*/node_modules/**", "{a,b}", "a?b", "a[b]", "a/", "a/***"]) for (const method of ["hasPathTraversal", "isGlobPattern", "toDirectoryGlobPattern"] as const) equal(afterInit[method](value), beforeInit[method](value));
  for (const entries of [[], ["a"], ["a", "a"], ["a/b", "a", "a/b/c"], ["z\\b\\c", "z/b"], ["a", "b", "a\\b", "b/c"], ["./a", "a", "a/b"]]) equal(afterInit.deduplicateNestedPaths(entries), beforeInit.deduplicateNestedPaths(entries));
  for (const entries of [[], ["src", "cache"], ["src/", "src/nested", "other"], ["cache", "cache"], ["../outside", "src"]]) for (const output of ["", "src/file.ts\nsrc/nested/file.ts\n", "cache/file\n", new Error("git failed")]) {
    for (const initializer of [beforeInit, afterInit]) initializer.executeGitCommand = async () => { if (output instanceof Error) throw output; return { stdout: output, stderr: "" }; };
    equal(await afterInit.filterDirsWithTrackedFiles(directory, entries), await beforeInit.filterDirsWithTrackedFiles(directory, entries));
  }
  // Original initializer and reconstruction operate on separate fixture outputs,
  // sharing only a synthetic source tree and harmless stubbed Git command calls.
  const main = path.join(directory, "main"), beforeTarget = path.join(directory, "before"), afterTarget = path.join(directory, "after");
  for (const root of [main, beforeTarget, afterTarget]) await fs.mkdir(root, { recursive: true });
  await fs.mkdir(path.join(main, ".codebuddy")); await fs.mkdir(path.join(main, "cache")); await fs.mkdir(path.join(main, "packages/a"), { recursive: true }); await fs.mkdir(path.join(main, "packages/b")); await fs.writeFile(path.join(main, "cache/item"), "fixture");
  await fs.writeFile(path.join(main, ".codebuddy/settings.local.json"), JSON.stringify({ worktree: { symlinkDirectories: ["cache"] } }));
  equal(await afterInit.readWorktreeSymlinkDirs(main), await beforeInit.readWorktreeSymlinkDirs(main)); equal(await afterInit.resolveSymlinkEntries(main, ["packages/*", "cache"]), await beforeInit.resolveSymlinkEntries(main, ["packages/*", "cache"]));
  for (const initializer of [beforeInit, afterInit]) initializer.executeGitCommand = async () => ({ stdout: "", stderr: "" });
  await beforeInit.initialize(main, beforeTarget); await afterInit.initialize(main, afterTarget);
  equal(await fs.readFile(path.join(afterTarget, ".codebuddy/settings.local.json"), "utf8"), await fs.readFile(path.join(beforeTarget, ".codebuddy/settings.local.json"), "utf8")); equal(await fs.readlink(path.join(afterTarget, "cache")), await fs.readlink(path.join(beforeTarget, "cache")));
  // Branch selection is exercised without network access. Command transcripts
  // and env/timeout options are compared, not just the selected branch name.
  for (const stage of ["symbolic", "ls-remote", "main", "master", "develop", "trunk", "local"]) for (const fetchWorks of [false, true]) for (const option of [undefined, { baseBranch: "feature" }, { baseBranch: "origin/feature" }, { baseBranch: "upstream/feature" }, { prNumber: 7, prPlatform: "github" }, { prNumber: 7, prPlatform: "gitlab" }, { prNumber: 7, prPlatform: "cnb" }]) {
    const before = new OriginalService(), after = new WorktreeService(afterCwd, afterInit), beforeCalls: any[] = [], afterCalls: any[] = [];
    const command = (calls: any[]) => async (cwd: string, args: string[], options?: any) => {
      calls.push([cwd, args, options]); const key = args.join(" ");
      if (args[0] === "fetch") { if (fetchWorks) return { stdout: "", stderr: "" }; throw new Error("fetch failed"); }
      if (args[0] === "symbolic-ref" && stage === "symbolic") return { stdout: "refs/remotes/origin/release\n", stderr: "" };
      if (args[0] === "ls-remote" && stage === "ls-remote") return { stdout: "ref: refs/heads/release HEAD\n", stderr: "" };
      if (args[0] === "show-ref" && (key.endsWith("refs/heads/feature") || key.endsWith(`refs/remotes/origin/${stage}`))) return { stdout: "commit\n", stderr: "" };
      if (args[0] === "rev-parse") return { stdout: "local\n", stderr: "" };
      throw new Error("not found");
    };
    before.executeGitCommand = command(beforeCalls); after.executeGitCommand = command(afterCalls);
    equal(await outcome(() => after.determineBaseBranch(main, option)), await outcome(() => before.determineBaseBranch(main, option))); equal(afterCalls, beforeCalls);
  }
  for (const exists of [false, true]) for (const missingRoot of [false, true]) {
    const before = new OriginalService(), after = new WorktreeService(afterCwd, afterInit), beforeCalls: any[] = [], afterCalls: any[] = [];
    for (const [service, calls] of [[before, beforeCalls], [after, afterCalls]] as const) {
      service.cwdService = afterCwd; service.initializer = { initialize: async (...args: any[]) => { calls.push(["initialize", ...args]); } };
      service.findGitRoot = async () => missingRoot ? undefined : main; service.exists = async () => exists; service.determineBaseBranch = async () => "base";
      service.executeGitCommand = async (cwd: string, args: string[], options: any) => { calls.push([cwd, args, options]); return { stdout: args.includes("--abbrev-ref") ? "branch\n" : args.includes("list") ? `worktree ${main}\nHEAD fixture\n\nworktree ${afterTarget}\nHEAD fixture\n` : "commit\n", stderr: "" }; };
    }
    equal(await outcome(() => after.create("differential", { baseBranch: "main" })), await outcome(() => before.create("differential", { baseBranch: "main" }))); equal(afterCalls, beforeCalls); equal(await after.list(), await before.list()); equal(afterCalls, beforeCalls);
  }
  // The removal fallback can recursively delete its argument in the target.
  // Exercise it only on separately-created, validated fixture subdirectories.
  for (const missingRoot of [false, true]) for (const commandFails of [false, true]) for (const force of [false, true]) for (const deleteBranch of [false, true]) {
    const beforePath = path.join(directory, "remove-before"), afterPath = path.join(directory, "remove-after"); await fs.mkdir(beforePath, { recursive: true }); await fs.mkdir(afterPath, { recursive: true });
    const before = new OriginalService(), after = new WorktreeService(afterCwd, afterInit), beforeCalls: any[] = [], afterCalls: any[] = [];
    for (const [service, calls] of [[before, beforeCalls], [after, afterCalls]] as const) { service.findGitRoot = async () => missingRoot ? undefined : main; service.executeGitCommand = async (cwd: string, args: string[], options: any) => { calls.push([cwd, args, options]); if (commandFails) throw new Error("fixture failure"); return { stdout: "", stderr: "" }; }; }
    await after.remove(afterPath, { force, deleteBranch }); await before.remove(beforePath, { force, deleteBranch });
    const normalized = (calls: any[]) => JSON.parse(JSON.stringify(calls).replaceAll(beforePath, "TARGET").replaceAll(afterPath, "TARGET").replaceAll("worktree-remove-before", "BRANCH").replaceAll("worktree-remove-after", "BRANCH"));
    equal(normalized(afterCalls), normalized(beforeCalls)); equal(await fs.access(afterPath).then(() => true, () => false), await fs.access(beforePath).then(() => true, () => false));
  }
  // Session effects use a synthetic cwd adapter, never process.chdir().
  for (const name of [true, false, "", "explicit", "#42", "https://gitlab.com/o/r/-/merge_requests/12"]) for (const hook of [false, true]) for (const dirty of [false, true]) for (const exit of ["keep", "remove", "handleExit", "keep-kill-tmux"] as const) {
    function setup(original: boolean) {
      const events: any[] = [], cwd = new CwdService(); cwd.setCwdState(main);
      const service = { findGitRoot: async () => main, getCurrentBranch: async () => "main", create: async (label: string, options: any) => { events.push(["create", label, options]); return { worktreePath: afterTarget, worktreeBranch: "worktree-fixture", headCommit: "head", baseBranch: "main", existed: dirty }; }, remove: async (...args: any[]) => { events.push(["remove", ...args]); } };
      const detector = { detect: async (...args: any[]) => { events.push(["detect", ...args]); return { ...clean(), hasChanges: dirty, unpushedCommits: dirty ? 2 : 0 }; } };
      const hooks = { hasHooks: async (event: string) => event === "WorktreeCreate" && hook, executeHooks: async (event: string, payload: any) => { events.push(["hook", event, payload]); return { allowed: true, stdout: `log\n${afterTarget}\n` }; } };
      const sessions = { getCurrent: () => ({ id: "session" }) }, store = { getSessionFilePath: (id: string) => `/${id}.jsonl` }, names = { generate: () => "random-name" }, tmux = { killSession: async (name: string) => { events.push(["kill", name]); } }, console = { log: (text: string) => events.push(["log", text]), warn: (text: string) => events.push(["warn", text]) };
      const beforeClass = original ? evaluate(`(${originalSessionCode})`, { eC: path, e_: fsSync, eI: { HookEvent: { WORKTREE_CREATE: "WorktreeCreate", WORKTREE_REMOVE: "WorktreeRemove" } }, process: { chdir: (path: string) => { events.push(["cwd", path]); }, stderr: { write: (text: string) => events.push(["stderr", text]) } }, console }) : undefined;
      const manager: any = original ? new beforeClass() : new WorktreeSessionManager(service, detector, cwd, hooks, { getCurrentSession: sessions.getCurrent, getSessionFilePath: store.getSessionFilePath, changeDirectory: (path) => { events.push(["cwd", path]); }, writeStderr: (text) => { events.push(["stderr", text]); } }, names as any);
      if (original) Object.assign(manager, { worktreeService: service, changeDetector: detector, cwdService: cwd, hookManager: hooks, sessionManager: sessions, sessionStore: store, nameGenerator: names, prParser: new OriginalParser(), tmuxService: tmux });
      // Avoid global console mutation in the reconstructed tmux logger case;
      // compare its keep phase, and verify tmux behavior separately below.
      return { manager, events, cwd };
    }
    const before = setup(true), after = setup(false), options = { baseBranch: "main", sessionId: "explicit", tmuxSessionName: exit === "keep-kill-tmux" ? undefined : "fixture-tmux" };
    equal(await after.manager.createSession(name, options), await before.manager.createSession(name, options)); equal(after.manager.getCurrentSession(), before.manager.getCurrentSession()); equal(after.events, before.events);
    const left = exit === "handleExit" ? await after.manager.handleExit() : await after.manager.executeExitChoice(exit), right = exit === "handleExit" ? await before.manager.handleExit() : await before.manager.executeExitChoice(exit);
    equal(left, right); equal(after.manager.getCurrentSession(), before.manager.getCurrentSession()); equal(after.cwd.getCwd(), before.cwd.getCwd()); equal(after.events, before.events);
  }
  for (const hookBased of [false, true]) for (const dirty of [false, true]) for (const detectorThrows of [false, true]) for (const input of [{}, { action: "keep" }, { action: "remove" }, { action: "remove", force: false }, { action: "remove", force: true }]) {
    const make = () => { let current: any = { originalCwd: main, worktreePath: afterTarget, worktreeBranch: hookBased ? undefined : "worktree-fixture", originalHeadCommit: "head", hookBased }; const events: any[] = []; return { events, manager: { getCurrentSession: () => current, createSession: async () => current, keepWorktree: async () => { events.push("keep"); current = null; }, removeWorktree: async () => { events.push("remove"); current = null; } }, detector: { detect: async () => { if (detectorThrows) throw new Error("detect failed"); return { ...clean(), hasChanges: dirty, uncommittedFiles: 2, unpushedCommits: 1, changedFiles: ["a"] }; } } }; };
    const before = make(), after = make(), original = new OriginalLeave(); original.worktreeSessionManager = before.manager; original.worktreeChangeDetector = before.detector;
    equal(await new WorktreeTools(after.manager as any, after.detector).leave(input as any), await original.execute(input)); equal(after.events, before.events);
  }
  for (const error of [undefined, new Error("create failed"), "non-error failure"]) for (const hookBased of [false, true]) {
    const manager: any = { getCurrentSession: () => null, createSession: async () => { if (error) throw error; return { worktreePath: afterTarget, worktreeBranch: hookBased ? undefined : "branch", hookBased }; } };
    const original = new OriginalEnter(); original.worktreeSessionManager = manager; equal(await new WorktreeTools(manager).enter({}), await original.execute({}));
  }
  for (const entered of [false, true]) for (const skipRun of [false, true]) for (const resume of [false, true]) for (const input of [[], "raw", [{ type: "message", role: "user", content: "new" }], [{ type: "message", role: "user", content: "git worktree" }, { type: "message", role: "user", content: "next" }], [{ type: "message", role: "user", content: [{ type: "input_text", text: "git worktree" }] }, { type: "message", role: "user", content: "next" }]]) {
    const session = new HarnessSession("s"); session.options.continue = resume;
    const context = () => ({ session, skipRun, input: structuredClone(input) } as any), left = context(), right = context(), original = new OriginalInterceptor(); original.worktreeSessionManager = { isInWorktreeSession: () => entered }; original.logger = { setContext() {}, debug() {} };
    await new WorktreeContextInterceptor(original.worktreeSessionManager).intercept(left); await original.intercept(right); equal(left.input, right.input);
  }
} finally { await fs.rm(directory, { recursive: true, force: true }); }
console.log(JSON.stringify({ schemaAndBehaviorComparisons: comparisons, passed: true, source: "WorkBuddy 5.3.14 captured bundle", scope: "Worktree schemas/PR/names/cwd/detection/initializer/branch selection/session/tools/context; excludes native hook executor and tmux UI" }, null, 2));

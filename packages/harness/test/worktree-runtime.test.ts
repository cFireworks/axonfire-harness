import assert from "node:assert/strict";
import test from "node:test";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, mkdir, writeFile, readFile, realpath, lstat, readlink, rm, access } from "node:fs/promises";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { Agent, Runner, Usage, setTraceProcessors, type Model } from "@openai/agents-core";
import { CwdService } from "../src/worktrees/cwd-service.js";
import { WorktreeNameGenerator, WorktreePRParser, WorktreeChangeDetector } from "../src/worktrees/worktree-helpers.js";
import { WorktreeService } from "../src/worktrees/worktree-service.js";
import { WorktreeInitializer } from "../src/worktrees/worktree-initializer.js";
import { WorktreeSessionManager } from "../src/worktrees/worktree-session-manager.js";
import { WorktreeErrorCode, type WorktreeChangeInfo, type WorktreeHookManager } from "../src/worktrees/worktree-types.js";
import { WorktreeTools, EnterWorktreeSchema, LeaveWorktreeSchema } from "../src/tools/worktree-tools.js";
import { WorktreeContextInterceptor, WORKTREE_CONTEXT_PROMPT } from "../src/agents/worktree-context-interceptor.js";
import { HarnessSession } from "../src/sessions/session.js";
import { createHarness } from "../src/runtime/create-harness.js";
import { PermissionMode } from "../src/permissions/permission.js";
setTraceProcessors([]);
const execute = promisify(execFile);
const git = (directory: string, ...args: string[]) => execute("git", args, { cwd: directory, env: { ...process.env, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_NOSYSTEM: "1", GIT_TERMINAL_PROMPT: "0" } });
async function directory(t: { after(fn: () => any): void }) { const root = await realpath(await mkdtemp(join(tmpdir(), "harness-worktree-"))); t.after(() => rm(root, { recursive: true, force: true })); return root; }
async function repository(t: { after(fn: () => any): void }) {
  const root = await directory(t); await git(root, "init", "-b", "main"); await git(root, "config", "user.email", "fixture@example.invalid"); await git(root, "config", "user.name", "fixture");
  await mkdir(join(root, "src")); await writeFile(join(root, "src/tracked.txt"), "tracked original\n"); await writeFile(join(root, ".gitignore"), ".codebuddy/\n.workbuddy-harness/\nignored/\n.env.local\n");
  await git(root, "add", "."); await git(root, "commit", "-m", "fixture"); return root;
}
const clean = (): WorktreeChangeInfo => ({ hasChanges: false, uncommittedFiles: 0, unpushedCommits: 0, changedFiles: [], modifiedFiles: [], stagedFiles: [] });
function sessionFixture(options: { hook?: boolean; hookOutput?: string; allowed?: boolean; dirty?: boolean } = {}) {
  const cwd = new CwdService(); cwd.setCwdState("/fixture/root"); const events: any[] = [];
  const service = { findGitRoot: async () => "/fixture/root", getCurrentBranch: async () => "main", create: async (name: string, options: any) => { events.push(["create", name, options]); return { worktreePath: `/fixture/tree/${name}`, worktreeBranch: `worktree-${name}`, headCommit: "initial", baseBranch: "main", existed: false }; }, remove: async (...args: any[]) => { events.push(["remove", ...args]); } };
  const detector = { detect: async (...args: any[]) => { events.push(["detect", ...args]); return { ...clean(), hasChanges: !!options.dirty, uncommittedFiles: options.dirty ? 1 : 0 }; } };
  const hooks: WorktreeHookManager = { hasHooks: async (event) => event === "WorktreeCreate" && !!options.hook, executeHooks: async (event, payload) => { events.push(["hook", event, payload]); return { allowed: options.allowed !== false, stdout: options.hookOutput ?? "log\n/fixture/hook-tree\n" }; } };
  const manager = new WorktreeSessionManager(service, detector, cwd, hooks, { changeDirectory: (path) => events.push(["cwd", path]), writeStderr: (text) => events.push(["stderr", text]), getCurrentSession: () => ({ id: "session" }), getSessionFilePath: (id) => `/transcript/${id}.jsonl` });
  return { manager, service, detector, cwd, events };
}
const answer = (text: string) => [{ type: "message", role: "assistant", status: "completed", content: [{ type: "output_text", text }] }];
const call = (name: string, input: object, id: string) => [{ type: "function_call", name, id, callId: id, arguments: JSON.stringify(input), status: "completed" }];
function fixtureModel(output: (request: any, count: number) => any[]): Model { let count = 0; return { async getResponse() { return { output: [], usage: new Usage() }; }, async *getStreamedResponse(request) { yield { type: "response_started" }; yield { type: "response_done", response: { id: `response-${++count}`, output: output(request, count), usage: { inputTokens: 10, outputTokens: 2, totalTokens: 12 } } } as any; } }; }

test("worktree schemas and PR parser preserve optional fields, URL prefixes and platform order", () => {
  assert.deepEqual(EnterWorktreeSchema.parse({ name: "n", unknown: true }), { name: "n" }); assert.deepEqual(LeaveWorktreeSchema.parse({}), {}); assert.equal(LeaveWorktreeSchema.safeParse({ action: "discard" }).success, false);
  const parser = new WorktreePRParser(); assert.deepEqual(parser.parse(" #0042 "), { prNumber: 42, platform: "github" });
  assert.deepEqual(parser.parse("https://www.github.com/o/r/pull/123suffix"), { prNumber: 123, platform: "github", owner: "o", repo: "r" });
  assert.equal(parser.parse("https://gitlab.com/group/r/-/merge_requests/3")?.platform, "gitlab"); assert.equal(parser.parse("https://cnb.cool/o/r/-/pulls/4")?.platform, "cnb");
  for (const input of [null, 1, "#-1", "3", "https://example.org/o/r/pull/3", "https://gitlab.com/group/subgroup/r/-/merge_requests/3"]) assert.equal(parser.parse(input), null);
});
test("CwdService preserves async-local concurrent scopes, global fallback and opt-in observable notifications", async () => {
  const cwd = new CwdService(), changes: string[] = []; cwd.setCwdState("/global"); const subscription = cwd.onDidChangeCwd.subscribe((path) => changes.push(path));
  cwd.setCwdState("/silent"); assert.deepEqual(changes, ["/global"]); cwd.setCwdState("/emitted", true); cwd.setCwdState("/emitted", true); assert.deepEqual(changes, ["/global", "/emitted"]);
  assert.deepEqual(await Promise.all([cwd.runWithCwd("/a", async () => { await Promise.resolve(); return cwd.getCwd(); }), cwd.runWithCwd("/b", async () => { await Promise.resolve(); return cwd.getCwd(); })]), ["/a", "/b"]); assert.equal(cwd.getCwd(), "/emitted"); subscription.unsubscribe();
});
test("worktree names keep the captured adjective/noun vocabulary and hex suffix length", () => { const generator = new WorktreeNameGenerator(); for (let i = 0; i < 20; i++) assert.match(generator.generate(), /^(swift|bright|calm|keen|bold|wise|quick|cool|warm|soft|deep|fair|free|glad|kind|neat|safe|pure|rich|true)-(fox|owl|elm|oak|ray|bay|bee|cat|dog|elk|fir|gem|ivy|jay|kit|lark|moth|newt|pine|rose)-[0-9a-f]{4}$/); assert.match(generator.generateRandomId(7), /^[0-9a-f]{7}$/); });
test("change detector preserves porcelain trim/slice behavior, baseline commit count and failed-probe fallbacks", async (t) => {
  const root = await repository(t), detector = new WorktreeChangeDetector(), baseline = (await git(root, "rev-parse", "HEAD")).stdout.trim();
  assert.deepEqual(await detector.detect(root, baseline), clean());
  await writeFile(join(root, "src/tracked.txt"), "edited\n"); const modified = await detector.detect(root, baseline); assert.equal(modified.uncommittedFiles, 1); assert.deepEqual(modified.changedFiles, ["rc/tracked.txt"]); assert.deepEqual(modified.modifiedFiles, ["src/tracked.txt"]);
  await git(root, "add", "src/tracked.txt"); assert.deepEqual((await detector.detect(root)).stagedFiles, ["src/tracked.txt"]); await git(root, "commit", "-m", "fixture second"); assert.equal((await detector.detect(root, baseline)).unpushedCommits, 1);
  assert.deepEqual(await detector.detect(join(root, "missing"), baseline), clean());
});
test("initializer keeps path traversal guards, glob suffix handling and duplicate-but-not-nested path semantics", async () => {
  const initializer = new WorktreeInitializer(); assert.equal(initializer.hasPathTraversal("a/../b"), true); assert.equal(initializer.hasPathTraversal("..\\b"), true); assert.equal(initializer.hasPathTraversal("a..b"), false); assert.equal(initializer.toDirectoryGlobPattern("packages/**"), "packages");
  assert.deepEqual(initializer.deduplicateNestedPaths(["a/b", "a", "a", "z/b", "z\\b\\c"]), ["a", "a", "z\\b\\c", "z/b"]);
});
test("initializer copies local settings and .worktreeinclude ignored files and skips symlinking tracked directories", async (t) => {
  const root = await repository(t), target = join(root, "fixture-target"); await mkdir(target); await mkdir(join(root, ".codebuddy")); await mkdir(join(root, "ignored")); await writeFile(join(root, "ignored/cache.txt"), "cache"); await writeFile(join(root, ".env.local"), "fixture-only"); await writeFile(join(root, ".worktreeinclude"), ".env.local\n");
  await writeFile(join(root, ".codebuddy/settings.local.json"), JSON.stringify({ worktree: { symlinkDirectories: ["ignored", "src"] } }));
  const initializer = new WorktreeInitializer(); await initializer.initialize(root, target);
  assert.deepEqual(JSON.parse(await readFile(join(target, ".codebuddy/settings.local.json"), "utf8")), { worktree: { symlinkDirectories: ["ignored", "src"] } });
  assert.equal((await lstat(join(target, "ignored"))).isSymbolicLink(), true); assert.equal(await readlink(join(target, "ignored")), join(root, "ignored")); await assert.rejects(access(join(target, "src"))); assert.equal(await readFile(join(target, ".env.local"), "utf8"), "fixture-only");
  assert.deepEqual(await initializer.filterGitIgnoredFiles(root, [".env.local", "src/tracked.txt"]), [".env.local"]);
});
test("WorktreeService selects explicit local, origin, PR and remote-default branches with source fallbacks", async () => {
  const cwd = new CwdService(), service = new WorktreeService(cwd, { initialize: async () => undefined }), commands: any[] = [];
  service.executeGitCommand = async (_directory, args, options) => { commands.push([args, options?.timeout]); if (args[0] === "symbolic-ref") return { stdout: "refs/remotes/origin/HEAD\n", stderr: "" }; return { stdout: "", stderr: "" }; };
  assert.equal(await service.determineBaseBranch("/repo", { baseBranch: "feature" }), "feature"); assert.deepEqual(commands.pop()[0], ["show-ref", "--verify", "refs/heads/feature"]);
  assert.equal(await service.determineBaseBranch("/repo", { baseBranch: "origin/feature" }), "origin/feature"); assert.deepEqual(commands.pop()[0], ["fetch", "origin", "feature"]);
  assert.equal(await service.determineBaseBranch("/repo", { prNumber: 5, prPlatform: "gitlab" }), "FETCH_HEAD"); assert.deepEqual(commands.pop()[0], ["fetch", "origin", "refs/merge-requests/5/head"]);
  assert.equal(await service.determineBaseBranch("/repo"), "origin/HEAD"); assert.equal(service.getGitEnv().GIT_TERMINAL_PROMPT, "0");
  service.executeGitCommand = async () => { throw new Error("offline"); }; service.getCurrentBranch = async () => "local"; assert.equal(await service.determineBaseBranch("/repo"), "HEAD");
});
test("WorktreeService creates/reuses/lists/removes a real isolated checkout without copying uncommitted edits", async (t) => {
  const root = await repository(t), cwd = new CwdService(); cwd.setCwdState(root); const service = new WorktreeService(cwd, new WorktreeInitializer());
  await writeFile(join(root, "src/tracked.txt"), "main-only change\n"); const created = await service.create("fixture", { baseBranch: "main" }); assert.equal(created.existed, false); assert.equal(created.worktreeBranch, "worktree-fixture"); assert.equal(await readFile(join(created.worktreePath, "src/tracked.txt"), "utf8"), "tracked original\n");
  assert.equal((await service.create("fixture")).existed, true); assert.ok((await service.list()).includes(created.worktreePath.normalize("NFC"))); await service.remove(created.worktreePath, { force: true, deleteBranch: true }); await assert.rejects(access(created.worktreePath)); assert.equal(await readFile(join(root, "src/tracked.txt"), "utf8"), "main-only change\n");
  cwd.setCwdState(join(root, "missing")); await assert.rejects(service.create("missing"), (error: any) => error.code === WorktreeErrorCode.NOT_GIT_REPO);
});
test("worktree session manager preserves source PR/session/cwd state and keep/remove/exit choices", async () => {
  const fixture = sessionFixture(), session = await fixture.manager.createSession("#42", { sessionId: "explicit", tmuxSessionName: "tmux" }); assert.equal(session.worktreeName, "pr-42"); assert.equal(session.sessionId, "explicit"); assert.deepEqual(fixture.events.find((event) => event[0] === "create"), ["create", "pr-42", { prNumber: 42, prPlatform: "github", baseBranch: undefined }]);
  await fixture.manager.keepWorktree(); assert.equal(fixture.cwd.getCwd(), "/fixture/root"); assert.equal(fixture.manager.getCurrentSession(), null);
  await fixture.manager.createSession("next"); assert.equal(await fixture.manager.handleExit(), "remove"); assert.equal(fixture.manager.getCurrentSession(), null);
  const dirty = sessionFixture({ dirty: true }); await dirty.manager.createSession("dirty"); assert.equal(await dirty.manager.handleExit(), "keep"); assert.ok(dirty.manager.getCurrentSession());
});
test("worktree Hook payloads/last-line path/errors and missing-remove preservation match the original contract", async () => {
  const fixture = sessionFixture({ hook: true }), session = await fixture.manager.createSession("custom"); assert.equal(session.hookBased, true); assert.equal(session.worktreePath, "/fixture/hook-tree");
  assert.deepEqual(fixture.events.find((event) => event[0] === "hook")[2], { hook_event_name: "WorktreeCreate", session_id: "", transcript_path: "/transcript/session.jsonl", cwd: "/fixture/root", name: "custom" });
  assert.equal(await fixture.manager.handleExit(), "keep"); await fixture.manager.removeWorktree(); assert.equal(fixture.events.some((event) => event[0] === "remove"), false); assert.ok(fixture.events.some((event) => String(event[1]).includes("directory preserved")));
  for (const [output, message] of [["", /did not output/], ["relative/path", /relative path/]] as const) await assert.rejects(sessionFixture({ hook: true, hookOutput: output }).manager.createSession("bad"), message);
  await assert.rejects(sessionFixture({ hook: true, allowed: false }).manager.createSession("bad"), /unknown error/);
});
test("WorktreeTools keep exact nesting, dirty removal, hook force confirmation and JSON envelopes", async () => {
  const fixture = sessionFixture({ dirty: true }), tools = new WorktreeTools(fixture.manager, fixture.detector); assert.match((await tools.leave({})).content, /Nothing to do/); await tools.enter({ name: "dirty" }); assert.match((await tools.enter({})).content, /Cannot create nested/);
  assert.equal(JSON.parse((await tools.leave({ action: "remove" })).content).blocked, true); assert.ok(fixture.manager.getCurrentSession()); assert.equal(JSON.parse((await tools.leave({ action: "remove", force: true })).content).action, "remove");
  const hook = sessionFixture({ hook: true }), hookTools = new WorktreeTools(hook.manager, hook.detector); await hookTools.enter({}); assert.equal(JSON.parse((await hookTools.leave({ action: "remove" })).content).blocked, true); assert.equal(JSON.parse((await hookTools.leave({})).content).action, "keep");
});
test("worktree context interceptor injects exact reminder only in entered sessions with captured first/resume/history rules", async () => {
  let entered = false; const interceptor = new WorktreeContextInterceptor({ isInWorktreeSession: () => entered }), session = new HarnessSession("context");
  const context = { input: [{ type: "message", role: "user", content: "question" }], session, skipRun: false } as any;
  await interceptor.intercept(context); assert.equal(context.input[0].content, "question"); entered = true; await interceptor.intercept(context); assert.equal(context.input[0].content[0].text, WORKTREE_CONTEXT_PROMPT);
  context.input.push({ type: "message", role: "user", content: "followup" }); assert.equal(interceptor.shouldInjectWorktreePrompt(context), false); session.options.continue = true; assert.equal(interceptor.shouldInjectWorktreePrompt(context), true);
});
test("real SDK explicit Worktree tools switch relative Read/Write/Bash cwd, block dirty remove and preserve source allowlists", async (t) => {
  const root = await repository(t), requests: any[] = [], processCwd = process.cwd(); let worktreePath = "";
  const model = fixtureModel((request, count) => { requests.push(request); return count === 1 ? call("EnterWorktree", { name: "sdk", branch: "main" }, "enter") : count === 2 ? call("Write", { file_path: "created.txt", content: "isolated" }, "write") : count === 3 ? call("Read", { file_path: "created.txt" }, "read") : count === 4 ? call("Bash", { command: "pwd" }, "pwd") : count === 5 ? call("LeaveWorktree", { action: "remove" }, "blocked") : count === 6 ? call("LeaveWorktree", { action: "keep" }, "keep") : answer("preserved"); });
  const runtime = await createHarness({ workDir: root, modelProvider: { getModel: () => model }, approveTool: () => true }); t.after(() => runtime.close());
  const session = await runtime.openSession(); for (const config of runtime.product.raw.agents) assert.equal(config.tools?.some((name) => name === "EnterWorktree" || name === "LeaveWorktree"), false);
  const tools = await runtime.tools.buildTools(["EnterWorktree", "LeaveWorktree", "Read", "Write", "Bash"], { name: "worktree-fixture" });
  const runner = new Runner({ modelProvider: { getModel: () => model }, tracingDisabled: true }), agent = new Agent<HarnessSession>({ name: "worktree-fixture", model: "fixture", tools });
  let result = await runner.run(agent, "work in isolation", { context: session, stream: true });
  for (;;) { for await (const _event of result) { worktreePath ||= runtime.worktreeSessions.getCurrentSession()?.worktreePath ?? ""; } await result.completed; if (!result.interruptions.length) break; for (const item of result.interruptions) result.state.approve(item); result = await runner.run(agent, result.state, { context: session, stream: true }); }
  assert.equal(result.finalOutput, "preserved"); assert.ok(worktreePath); assert.equal(await readFile(join(worktreePath, "created.txt"), "utf8"), "isolated"); await assert.rejects(access(join(root, "created.txt"))); assert.match(JSON.stringify(requests[5].input), /blocked/); assert.match(JSON.stringify(requests[4].input), new RegExp(worktreePath)); assert.equal(process.cwd(), processCwd); assert.equal(runtime.cwdService.getCwd(), root);
});
test("standalone prompt injects worktree context and stores cwd metadata, then close keeps dirty worktree and restores original cwd", async (t) => {
  const root = await repository(t), requests: any[] = [], model = fixtureModel((request, count) => { requests.push(request); return count === 1 ? call("Read", { file_path: "tracked.txt" }, "read") : answer("read isolated"); });
  const runtime = await createHarness({ workDir: join(root, "src"), stateDir: join(root, ".workbuddy-harness"), modelProvider: { getModel: () => model }, approveTool: () => true }); t.after(() => runtime.close());
  const session = await runtime.openSession(), entered = await runtime.worktreeSessions.createSession("context", { baseBranch: "main" }); assert.equal(entered.enteredCwd, join(entered.worktreePath, "src"));
  assert.equal(await runtime.prompt(session, "read file"), "read isolated"); assert.match(JSON.stringify(requests[0].input), /git worktree/); assert.equal((await runtime.promptContext.get()).workDir, entered.enteredCwd);
  const history = (await readFile(runtime.store.getSessionFilePath(session.id), "utf8")).trim().split("\n").map((line) => JSON.parse(line)); assert.ok(history.some((item) => item.cwd === entered.enteredCwd));
  await writeFile(join(entered.worktreePath, "dirty.txt"), "preserve"); await runtime.close(); assert.equal(await readFile(join(entered.worktreePath, "dirty.txt"), "utf8"), "preserve"); assert.equal(runtime.cwdService.getCwd(), join(root, "src"));
});
test("Agent worktree isolation runs child Read under async-local cwd, preserves parent edits and cleans the isolated checkout", async (t) => {
  const root = await repository(t), requests: any[] = [], model = fixtureModel((request, count) => { requests.push(request); return count === 1 ? call("Agent", { description: "inspect isolated checkout", prompt: "read source", subagent_type: "Explore" }, "child") : count === 2 ? call("Read", { file_path: "src/tracked.txt" }, "read-child") : answer(count === 3 ? "child inspected" : "parent finished"); });
  await writeFile(join(root, "src/tracked.txt"), "parent uncommitted\n"); const runtime = await createHarness({ workDir: root, modelProvider: { getModel: () => model }, approveTool: () => true }); t.after(() => runtime.close());
  (await runtime.agents.getAgentConfig("Explore"))!.isolation = "worktree";
  const session = await runtime.openSession(undefined, { permissionMode: PermissionMode.BypassPermissions }); assert.equal(await runtime.prompt(session, "delegate"), "parent finished");
  assert.match(JSON.stringify(requests[2].input), /tracked original/); assert.doesNotMatch(JSON.stringify(requests[2].input), /parent uncommitted/); assert.match(JSON.stringify(requests.at(-1).input), /Worktree removed \(no changes\)/); assert.equal(runtime.cwdService.getCwd(), root); assert.equal(await readFile(join(root, "src/tracked.txt"), "utf8"), "parent uncommitted\n");
});

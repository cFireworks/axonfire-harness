import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, mkdir, writeFile, symlink, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { Agent, Runner, Usage, setTraceProcessors, type Model } from "@openai/agents-core";
import { CustomCommandRenderer } from "../src/commands/custom-command-renderer.js";
import { ReferenceService, ImportUtils, MAX_IMPORT_FILE_SIZE } from "../src/commands/reference-service.js";
import { SkillProductProvider, substituteLoadTimeVariables, deriveSkillVisibility } from "../src/commands/skill-product-provider.js";
import { SkillDescriptionPolicy } from "../src/commands/skill-description-policy.js";
import { SkillTool, isSkillAdminTrusted } from "../src/tools/skill-tool.js";
import { SlashCommandTool } from "../src/tools/slash-command-tool.js";
import { CommandManager } from "../src/commands/command-manager.js";
import { getAllowedBuiltinCommands } from "../src/commands/builtin-commands.js";
import { HarnessSession } from "../src/sessions/session.js";
import { createHarness } from "../src/runtime/create-harness.js";

setTraceProcessors([]);
async function directory(t: { after(fn: () => any): void }) { const value = await mkdtemp(join(tmpdir(), "harness-skill-command-")); t.after(() => rm(value, { recursive: true, force: true })); return value; }
const identity = { process: async (value: string) => value };
function modelFixture(response: (request: any, count: number) => any[]): Model { let count = 0; return { async getResponse() { return { output: [], usage: new Usage() }; }, async *getStreamedResponse(request) { yield { type: "response_started" }; yield { type: "response_done", response: { id: `r-${++count}`, output: response(request, count), usage: { inputTokens: 10, outputTokens: 2, totalTokens: 12 } } } as any; } }; }
const call = (name: string, args: object, id: string) => [{ type: "function_call", name, callId: id, id, status: "completed", arguments: JSON.stringify(args) }];
const answer = (text: string) => [{ type: "message", role: "assistant", status: "completed", content: [{ type: "output_text", text }] }];
function renderer() { return new CustomCommandRenderer({ execute: async ({ command }) => ({ wait: async () => ({ stdout: command === "bad" ? "" : `output:${command}`, stderr: "stderr" }), dispose() {} }) }, identity); }

test("command renderer preserves quotes, positional/ARGUMENTS replacements, excess args, inline Bash order and failures", async () => {
  const disposed: string[] = [], executed: string[] = [];
  const render = new CustomCommandRenderer({ async execute({ command }) { executed.push(command); if (command === "fail") throw new Error("failure"); return { wait: async () => ({ stdout: command === "empty" ? "" : ` ${command} `, stderr: " fallback " }), dispose() { disposed.push(command); } }; } }, { process: async (value) => `ref:${value}` });
  assert.deepEqual(render.extractArguments('/test "two words" plain \'last item\'', "/test"), ["two words", "plain", "last item"]);
  assert.deepEqual(render.extractArguments('/test "" unmatched"rest', "/test"), ["unmatchedrest"]);
  assert.equal(render.replaceParameters("$1 / $2 / $ARGUMENTS", ["a", "b", "c"]), "a / b / a b c\n\n\nARGUMENTS: c");
  assert.equal(await render.processContent("$ARGUMENTS !`one` !`empty` !`fail`", "raw args"), "ref:raw args one fallback ");
  assert.deepEqual(executed, ["one", "empty", "fail"]); assert.deepEqual(disposed, ["one", "empty"]);
});

test("references honor code spans, relative recursion, cycles, directory lists, byte caps and partial-view token warning", async (t) => {
  const root = await directory(t), references = new ReferenceService(() => root);
  await writeFile(join(root, "a.md"), "A @b.md"); await writeFile(join(root, "b.md"), "B @a.md");
  await writeFile(join(root, "large.md"), "x".repeat(MAX_IMPORT_FILE_SIZE + 1));
  const result = await references.process("@a.md `@b.md` @missing @large.md");
  assert.equal(result, "A B @a.md `@b.md` @missing @large.md");
  assert.match(await references.getDirectoryListing(root), /- a.md\n- b.md/);
  assert.equal(ImportUtils.extractImports("```\n@a.md\n```\n@b.md", "", root).length, 1);
  assert.match(references.truncateByTokenCap("x".repeat(150000), "/long.md"), /PARTIAL view.*characters/);
  assert.match(references.truncateByTokenCap("line text\n".repeat(20000), "/lines.md"), /Call Read with offset=/);
  references.setFileReferencesPathOnly(true); assert.equal(await references.process("@a.md"), "@a.md");
});

test("skill provider discovers nested/symlink metadata, preserves visibility/runtime vars, caches clones and reloads on force", async (t) => {
  const root = await directory(t), project = join(root, "project"), user = join(root, "user"), builtin = join(root, "builtin");
  for (const directory of [join(project, "group", "pdf"), join(user, "mine"), join(builtin, "seed")]) await mkdir(directory, { recursive: true });
  await writeFile(join(project, "group", "pdf", "SKILL.md"), '---\nname: plugin:pdf\ndescription: Read PDF\nallowed-tools: Read, Bash(git {status,log}:*)\ndisable-model-invocation: true\ncontext: fork\nagent: Explore\n---\nUse ${CODEBUDDY_SKILL_DIR} ${CLAUDE_SESSION_ID}');
  await writeFile(join(project, "group", "pdf", "_user_meta.json"), JSON.stringify({ name: "PDF reader", slug: "pdf-id", version: "2" }));
  await writeFile(join(user, "mine", "SKILL.md"), "---\nname: mine\n---\nuser skill");
  await writeFile(join(builtin, "seed", "SKILL.md"), "---\nname: seed\ndescription: CodeBuddy .codebuddy\n---\nCodeBuddy skill");
  await symlink(join(user, "mine"), join(project, "linked"));
  const provider = new SkillProductProvider({ project, user, connector: join(root, "absent"), builtin });
  const loaded = await provider.loadSkillsCached(), pdf = loaded.find((skill) => skill.name === "plugin:pdf")!;
  assert.equal(pdf.displayName, "PDF reader"); assert.equal(pdf.skillId, "pdf-id"); assert.equal(pdf.skillVersion, "2");
  assert.deepEqual(pdf.allowedTools, ["Read", "Bash(git {status,log}:*)"]); assert.equal(pdf.disableModelInvocation, true);
  assert.match(pdf.instructions, /\$\{CLAUDE_SESSION_ID\}/); assert.ok(pdf.instructions.includes(join(project, "group", "pdf")));
  assert.equal(loaded.find((skill) => skill.name === "seed")?.instructions, "WorkBuddy skill");
  pdf.allowedTools!.push("mutated"); assert.equal((await provider.loadSkillsCached()).find((skill) => skill.name === pdf.name)?.allowedTools?.includes("mutated"), false);
  await writeFile(join(user, "mine", "SKILL.md"), "---\nname: changed\n---\nupdated");
  assert.ok((await provider.loadSkillsCached()).some((skill) => skill.name === "mine"));
  assert.ok((await provider.provide({ force: true })).skills?.some((skill) => skill.name === "changed"));
  assert.deepEqual(deriveSkillVisibility({ disable: true, "disable-model-invocation": false }), { disableModelInvocation: false, userInvocable: undefined });
  assert.equal(substituteLoadTimeVariables("${MISSING_SKILL_TEST:-fallback} ${CODEBUDDY_SESSION_ID}", "/a/SKILL.md"), "fallback ${CODEBUDDY_SESSION_ID}");
});

test("Skill resolves exact/qualified/display names and ambiguity, legacy args, session placeholders and fork hook trust", async () => {
  const skills = [{ name: "a:pdf", displayName: "PDF", instructions: "$ARGUMENTS ${CODEBUDDY_SESSION_ID}", baseDirectory: "/skills/a" }, { name: "b:pdf", displayName: "PDF", instructions: "b" }];
  const commands = new CommandManager(async () => ({}), { addHistory: async () => undefined });
  const tool = new SkillTool({ configuration: async () => ({ skills }), renderer: renderer(), renderPrompt: async (value) => value, commands });
  assert.match(tool.findSkill(skills, "pdf").error!, /Ambiguous skill name/); assert.match(tool.findSkill(skills, "PDF").error!, /Ambiguous skill display name/);
  const result = await tool.execute({ command: "a:pdf", args: "  custom  " }, { context: new HarnessSession("session-id") } as any);
  assert.equal(result.content, "Base directory for this skill: /skills/a\ncustom session-id");
  assert.match((await tool.execute({ skill: "  " })).content, /Skill name cannot be empty/);
  assert.deepEqual(tool.resolveNeedPermissionArgs(undefined, { skill: " /test " }), [{ type: "slashCommand", value: " /test " }]);
  assert.equal(isSkillAdminTrusted({ name: "user", instructions: "", source: "user" }), false);
  assert.equal(isSkillAdminTrusted({ name: "bundled", instructions: "", source: "bundled" }), true);
});

test("Skill and SlashCommand preserve different built-in output envelopes, protected commands and command render args", async () => {
  const session = new HarnessSession("local"), events: string[] = [];
  const manager = new CommandManager(async () => ({ commands: [{ name: "fixture-review", prompt: "$1 $ARGUMENTS", tags: ["custom"] }] }), {
    addHistory: async (session, items) => { session.history.push(...Array.isArray(items) ? items : [items]); },
  }, [{ name: "/status", autoGenerateHistory: true, message: "status", execute: async ({ session }) => { events.push("status"); session.history.push({ type: "message", role: "user", content: "<local-command-stdout> status output </local-command-stdout>" }); } }]);
  await manager.refresh();
  const runtime = { configuration: async () => ({ commands: await manager.getAll() }), renderer: renderer(), renderPrompt: async (value: string) => value, commands: manager };
  const skill = new SkillTool(runtime), slash = new SlashCommandTool(runtime), context = { context: session } as any;
  assert.equal((await skill.execute({ skill: "status" }, context)).content, "status output\n");
  assert.equal((await slash.execute({ command: "/status" }, context)).content, "Built-in command executed: /status");
  assert.deepEqual(events, ["status", "status"]);
  assert.match((await skill.execute({ skill: "/exit" }, context)).content, /requires direct user interaction/);
  assert.match((await slash.execute({ command: "/fixture-review abc" }, context)).content, /Launching slash command: \/fixture-review abc/);
  assert.equal((await skill.execute({ skill: "/fixture-review", args: "abc" }, context)).content.startsWith("Launching"), false);
  assert.equal(await slash.needsApproval(context, { command: "/status" }), false);
  assert.equal(getAllowedBuiltinCommands().has("/exit"), false);
});

test("skill descriptions preserve protected caps, user count ceiling, disabled collisions and agent-specific allowlist", () => {
  const policy = new SkillDescriptionPolicy(() => "/user/skills");
  const skills = Array.from({ length: 205 }, (_, index) => ({ name: `skill${index}`, instructions: "", description: "x".repeat(200), source: "user" }));
  const truncated = policy.truncateSkillsByCharBudget(skills);
  assert.equal(truncated.skills.length, 200); assert.equal(truncated.overview.omittedCount, 5); assert.equal(truncated.overview.truncationMode, "overflow");
  assert.ok(truncated.skills.every((skill) => skill.truncatedDescription.length <= 150));
  const variables = policy.variables("Skill", { name: "test", skills: ["selected"] }, [{ name: "p:status", instructions: "", disableModelInvocation: true }, { name: "selected", instructions: "selected", description: "selected", source: "project" }], [], []);
  const names = (variables.skills as any[]).map((skill) => skill.name);
  assert.ok(names.includes("selected")); assert.ok(!names.includes("status"));
});

test("real SDK Skill loads a discovered project skill, executes inline shell, expands reference and exposes dynamic description", async (t) => {
  const root = await directory(t), skillDir = join(root, ".codebuddy", "skills", "inspect"); await mkdir(skillDir, { recursive: true });
  await writeFile(join(root, "context.txt"), "project reference");
  await writeFile(join(skillDir, "SKILL.md"), "---\nname: inspect\ndescription: Inspect the fixture project\n---\nArgs=$ARGUMENTS Session=${CODEBUDDY_SESSION_ID}\n!`printf inline-fixture`\n@context.txt");
  const requests: any[] = [];
  const model = modelFixture((request, count) => { requests.push(request); return count === 1 ? call("Skill", { skill: "inspect", args: "check" }, "skill") : answer("inspected"); });
  const runtime = await createHarness({ workDir: root, modelProvider: { getModel: () => model }, approveTool: (name) => name === "Skill" }); t.after(() => runtime.close());
  const session = await runtime.openSession(); assert.equal(await runtime.prompt(session, "inspect project"), "inspected");
  const output = JSON.stringify(requests[1].input);
  assert.match(output, /inline-fixture/); assert.match(output, /project reference/); assert.ok(output.includes(session.id)); assert.match(output, /Args=check/);
  const skill = requests[0].tools.find((tool: any) => tool.name === "Skill"); assert.match(skill.description, /Inspect the fixture project/);
});

test("real SDK Skill fork uses detached AgentTask, returns child output and persists a separate child transcript", async (t) => {
  const root = await directory(t), requests: any[] = [];
  const model = modelFixture((request, count) => { requests.push(request); return count === 1 ? call("Skill", { skill: "forked", args: "child args" }, "fork-skill") : answer(count === 2 ? "child completed" : "parent completed"); });
  const runtime = await createHarness({ workDir: root, skills: [{ name: "forked", instructions: "Execute $ARGUMENTS ${CLAUDE_SESSION_ID}", context: "fork", agent: "Explore", baseDirectory: "/fixture/skill" }], modelProvider: { getModel: () => model }, approveTool: () => true }); t.after(() => runtime.close());
  const session = await runtime.openSession(); assert.equal(await runtime.prompt(session, "run skill"), "parent completed");
  assert.equal(requests.length, 3); assert.match(JSON.stringify(requests[1].input), /child args/); assert.ok(JSON.stringify(requests[1].input).includes(session.id));
  assert.match(JSON.stringify(requests[2].input), /completed \(forked execution\)/);
  const task = runtime.taskManager.getTasks()[0]! as import("../src/agents/agent-task.js").AgentTask; assert.equal(task.isDetached, true);
  const child = await runtime.sessions.get(task.getResult()!.sessionId); assert.ok(child); assert.notEqual(child!.id, session.id); assert.ok(child!.history.length);
});

test("legacy SlashCommand runs when explicitly exposed to SDK but remains absent from the original default agent", async (t) => {
  const root = await directory(t), requests: any[] = [];
  const model = modelFixture((request, count) => { requests.push(request); return count === 1 ? call("SlashCommand", { command: '/fixture-command "two words" extra' }, "command") : answer("command complete"); });
  const runtime = await createHarness({ workDir: root, commands: [{ name: "fixture-command", prompt: "first=$1 all=$ARGUMENTS", description: "Fixture custom command", tags: ["custom"] }], modelProvider: { getModel: () => model }, approveTool: (name) => name === "SlashCommand" }); t.after(() => runtime.close());
  const session = await runtime.openSession(), primary = await runtime.agents.getDefault();
  assert.equal(primary.tools.some((tool) => tool.name === "SlashCommand"), false, "do not alter the captured agent tool allowlist");
  const tools = await runtime.tools.buildTools(["SlashCommand"], { name: "legacy-command-fixture" });
  const agent = new Agent<HarnessSession>({ name: "legacy-command-fixture", model: "fixture", tools });
  const result = await new Runner({ modelProvider: { getModel: () => model }, tracingDisabled: true }).run(agent, "run custom command", { context: session, stream: true });
  for await (const _event of result) { /* consume the real SDK stream */ }
  await result.completed; assert.equal(result.finalOutput, "command complete");
  const content = JSON.stringify(requests[1].input); assert.match(content, /first=two words all=two words extra/); assert.match(content, /<command-name>\/fixture-command<\/command-name>/); assert.match(content, /ARGUMENTS: extra/);
  const tool = requests[0].tools.find((tool: any) => tool.name === "SlashCommand"); assert.match(tool.description, /Fixture custom command/);
});

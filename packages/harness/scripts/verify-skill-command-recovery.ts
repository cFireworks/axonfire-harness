import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";
import { runInNewContext } from "node:vm";
import { z as z3 } from "zod3";
import { SkillTool, skillParameters } from "../src/tools/skill-tool.js";
import { isSkillAdminTrusted } from "../src/tools/skill-tool.js";
import { SlashCommandTool, slashCommandParameters } from "../src/tools/slash-command-tool.js";
import { CustomCommandRenderer } from "../src/commands/custom-command-renderer.js";
import { SkillDescriptionPolicy } from "../src/commands/skill-description-policy.js";
import { SkillProductProvider, deriveSkillVisibility, deriveSkillNameFromPath, substituteLoadTimeVariables, replaceBrandName, generateSkillColor } from "../src/commands/skill-product-provider.js";
import { ReferenceService, ImportUtils } from "../src/commands/reference-service.js";
import { NON_MODEL_COMMANDS, CONDITIONAL_COMMANDS } from "../src/commands/builtin-commands.js";
import { HarnessSession } from "../src/sessions/session.js";
import { CommandManager, LOCAL_COMMAND_TIP } from "../src/commands/command-manager.js";

const bundle = process.argv[2];
if (!bundle) throw new Error("Pass the captured WorkBuddy 5.3.14 codebuddy.js path");
const source = await fs.readFile(bundle, "utf8");
assert.equal(createHash("sha256").update(source).digest("hex"), "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd");
const directory = await fs.mkdtemp(path.join(os.tmpdir(), "harness-original-skill-diff-"));
const logger = { debug() {}, info() {}, warn() {}, error() {} };
function evaluate(text: string, context: any = {}): any { return runInNewContext(text, { Error, process, Date, Set, Map, ...context }, { timeout: 1000, contextCodeGeneration: { strings: false, wasm: false } }); }
const normal = evaluate(`(${source.slice(7528426 + 3, 7537041 - 1)})`, { ef: { PRODUCT_NAME: "CodeBuddy" } });
const conditionalEnd = source.indexOf("]},76884", 7537267) + 1;
const conditional = evaluate(`(${source.slice(7537267 + 3, conditionalEnd)})`).map((entry: any) => ({ command: entry.command }));
const allowed = () => new Set([...normal, ...conditional.map((entry: any) => entry.command)].filter((command: any) => !command.disableModelInvocation).map((command: any) => command.name));
const zodStart = 13261704, zodEnd = source.indexOf("(eB||(eB={}))", zodStart) + "(eB||(eB={}))".length;
const ZodUtils = evaluate(`(()=>{let eB;${source.slice(zodStart, zodEnd)};return eB})()`);
const schemas = evaluate(`(()=>{let lU=${source.slice(11914005 + 7, 11914161)};let lH=${source.slice(11919100 + 7, 11919495)};return{lU,lH}})()`, { iJ: { z: z3 } });
const toolContext = { iz: { BaseTool: class {} }, nC: { ToolNames: { SKILL: "Skill", SLASH_COMMAND: "SlashCommand" }, ToolArgType: { SlashCommand: "slashCommand", Skill: "skill" } },
  ow: { NON_MODEL_COMMANDS: normal, CONDITIONAL_COMMANDS: conditional, PLUGIN_TAG: "plugin" }, getAllowedBuiltinCommands: allowed, skill_tool_getAllowedBuiltinCommands: allowed,
  lH: schemas.lH, lU: schemas.lU, nW: { ZodUtils }, oD: { isWorkBuddyDesktop: () => false }, nz: { AgentNames: { GENERAL_PURPOSE: "general-purpose" } }, lG: { isSkillAdminTrusted }, s7: { AgentTask: "task" }, nk: { ContainerUtil: { get: () => originalTask } },
};
let originalTask: any;
const OriginalSkill = evaluate(`(${source.slice(11919499, 11926988)})`, toolContext), OriginalSlash = evaluate(`(${source.slice(11914165, 11917177)})`, toolContext);
const OriginalRenderer = evaluate(`(${source.slice(7649414, 7650992)})`);
const OriginalMarkdown = evaluate(`(class MarkdownUtils{${source.slice(13250062, source.indexOf(";var tY=", 13250062))})`);
const colorStart = source.indexOf("static generateColorFromName("), colorEnd = source.indexOf(";var eF=", colorStart);
const OriginalColor = evaluate(`(class ColorUtils{static isDarkTheme(){return true}${source.slice(colorStart, colorEnd)})`);
const visibilityStart = 13369874, visibilityEnd = source.indexOf("ec.r(el)", visibilityStart);
const originalVisibility = evaluate(`(${source.slice(visibilityStart, visibilityEnd)})`);
const nameStart = 13370232, nameEnd = source.indexOf("},3352", nameStart);
const originalName = evaluate(`(${source.slice(nameStart, nameEnd)})`, { eu: path });
const envStart = 13069545, envEnd = source.indexOf("},8046", envStart);
const expandEnvVariables = evaluate(`(${source.slice(envStart, envEnd)})`, { eu: /\$\{([A-Z_][A-Z0-9_]*)(?::-(.*?))?\}/g });
const loadStart = 13370739, loadEnd = source.indexOf("async function substitutePluginLoadTimeVariables", loadStart);
const originalLoadVariables = evaluate(`(${source.slice(loadStart, loadEnd)})`, { eu: path, normalize: (value: string) => process.platform === "win32" ? value.replace(/\\/g, "/") : value, eg: ["CODEBUDDY_SESSION_ID", "CLAUDE_SESSION_ID"], ep: { expandEnvVariables } });
const providerContext: any = { eh: { ProductProviderPriority: { WORKSPACE: 0 }, MergeStrategy: { SmartMerge: "smartMerge" } }, em: fs, eE: path,
  eB: { PathUtils: { getProjectSkillsDir: () => path.join(directory, "project"), getHomeSkillsDir: () => path.join(directory, "user"), getHomeConnectorSkillsDir: () => path.join(directory, "connector"), getBuiltinSkillsDir: () => path.join(directory, "builtin") }, MarkdownUtils: OriginalMarkdown, ColorUtils: OriginalColor,
    getPositiveIntegerEnv: (name: string, fallback: number) => { const parsed = parseInt(process.env[name] || "", 10); return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback; }, DEFAULT_FS_CONCURRENCY: 32, mapWithConcurrency: async (entries: any[], _limit: number, fn: any) => Promise.all(entries.map(fn)) },
  e_: { deriveSkillVisibility: originalVisibility }, eI: { deriveSkillNameFromPath: originalName }, ev: { substituteLoadTimeVariables: originalLoadVariables }, replaceBrandName, resolveWorkbuddyBuiltinSeedSnapshots: async () => [],
};
const OriginalProvider = evaluate(`(()=>{const Provider=(${source.slice(9921736, 9926463)});Provider.MAX_SCAN_DEPTH=5;return Provider})()`, { ...providerContext, get eu() { return { MAX_SCAN_DEPTH: 5 }; } });
const OriginalImport = evaluate(`(${source.slice(13232643, source.indexOf(";var ty=", 13232643))})`, { e$: path, td: os, tp: { PathUtils: { getWorkDir: () => directory } }, tg: /@([^\s\n]+)/g });
const tokenStart = source.indexOf("static estimateTokensRough("), tokenEnd = source.indexOf("static createItemWithoutImages", tokenStart);
const TokenUtils = evaluate(`(class{${source.slice(tokenStart, tokenEnd)}})`);
const OriginalReference = evaluate(`(${source.slice(9942577 + "let ef=".length, 9945696)})`, { eg: fs, eh: { MAX_IMPORT_DEPTH: 5, MAX_IMPORT_FILE_SIZE: 262144, MAX_IMPORT_FILE_TOKENS: 25000, MAX_IMPORT_DIR_ENTRIES: 1000, ImportUtils: OriginalImport, TokenUtils, FileUtils: { isDirectory: async (filename: string) => fs.stat(filename).then((entry) => entry.isDirectory()).catch(() => false) } } });
const OriginalManager = evaluate(`(${source.slice(11657350, 11681925)})`, { nC: { DEFAULT_AGENT_TOOL_CHAR_BUDGET: 30000, DEFAULT_SLASH_COMMAND_TOOL_CHAR_BUDGET: 8000, DEFAULT_SKILL_TOOL_CHAR_BUDGET: 8000, MAX_TOTAL_SKILLS: 200, MAX_SKILL_DESC_CHARS: 150, MIN_SKILL_DESC_LENGTH: 20 }, nk: { Deferred: class {} }, nW: { PathUtils: { getHomeSkillsDir: () => path.join(directory, "user") } } });
const userStart = 13265914, userEnd = source.indexOf("static createErrorRecoveryInput", userStart);
const MessageUtils = evaluate(`(class{${source.slice(userStart, userEnd)}})`, { eu: { generateUUUID: () => "fixture-id" } });
const commandUtilsStart = 13045260, commandUtilsEnd = source.indexOf(";CommandMessageUtils.LOCAL_COMMAND_TIP=", commandUtilsStart);
const CommandMessageUtils = evaluate(`(${source.slice(commandUtilsStart, commandUtilsEnd)})`, { ep: { InputItemUtils: MessageUtils }, ed: { CommandXmlTags: { COMMAND_NAME: "command-name", COMMAND_MESSAGE: "command-message", COMMAND_ARGS: "command-args", LOCAL_COMMAND_STDOUT: "local-command-stdout" } } });
const tipStart = commandUtilsEnd + ";CommandMessageUtils.LOCAL_COMMAND_TIP=".length, tipEnd = source.indexOf(",CommandMessageUtils.regexCache", tipStart);
CommandMessageUtils.LOCAL_COMMAND_TIP = evaluate(source.slice(tipStart, tipEnd));
const commandManagerStart = 7542703, commandManagerEnd = source.indexOf(";__decorate", commandManagerStart);
const OriginalCommandManager = evaluate(`(${source.slice(commandManagerStart, commandManagerEnd)})`, { AE: { Deferred: class { resolve!: () => void; promise = new Promise<void>((resolve) => { this.resolve = resolve; }); } }, Am: { NON_MODEL_COMMANDS: normal, CONDITIONAL_COMMANDS: conditional.map((entry: any) => ({ ...entry, isEnabled: async () => false })), CUSTOM_COMMAND_TAG: "custom", MCP_PROMPT_COMMAND_TAG: "mcp-prompt", WORKFLOW_COMMAND_TAG: "dynamic-workflow", WORKFLOW_COMMAND_DESC_PREFIX: "[dynamic workflow]" }, AB: { CommandMessageUtils } });
let comparisons = 0;
const plain = (value: any) => value === undefined ? undefined : JSON.parse(JSON.stringify(value));
function equal(actual: any, expected: any) { assert.deepEqual(plain(actual), plain(expected)); comparisons++; }
try {
  equal(NON_MODEL_COMMANDS, normal); equal(CONDITIONAL_COMMANDS, conditional);
  equal(LOCAL_COMMAND_TIP, CommandMessageUtils.LOCAL_COMMAND_TIP);
  for (const disabled of [undefined, true, false, "true", "false"]) for (const override of [undefined, true, false]) for (const invocable of [undefined, true, false]) { const value = { disable: disabled, "disable-model-invocation": override, "user-invocable": invocable }; equal(deriveSkillVisibility(value), originalVisibility(value)); }
  for (const file of ["/skills/a/SKILL.md", "/skills/a/b/SKILL.md", "/skills/SKILL.md"]) for (const root of [undefined, "/skills", "/skills/a"]) equal(deriveSkillNameFromPath(file, root), originalName(file, root));
  for (const text of ["plain", "${CODEBUDDY_SESSION_ID} ${CLAUDE_SESSION_ID}", "${CODEBUDDY_SKILL_DIR} ${CLAUDE_SKILL_DIR}", "${SKILL_DIFF_ABSENT:-fallback}", "${CODEBUDDY_PLUGIN_ROOT} ${CLAUDE_PLUGIN_ROOT}"]) for (const plugin of [undefined, "/plugin"]) equal(substituteLoadTimeVariables(text, "/fixture/SKILL.md", plugin), originalLoadVariables(text, "/fixture/SKILL.md", plugin));
  const originalRenderer = new OriginalRenderer(); originalRenderer.logger = logger;
  const shell = { execute: async ({ command }: { command: string }) => { if (command === "fail") throw new Error("fixture"); return { wait: async () => command === "stderr" ? { stdout: "", stderr: " error " } : { stdout: ` ${command} `, stderr: "" }, dispose() {} }; } };
  originalRenderer.shellService = shell; originalRenderer.referenceService = { process: async (text: string) => text };
  const renderer = new CustomCommandRenderer(shell, originalRenderer.referenceService);
  for (const template of ["", "$1", "$2 $1 $ARGUMENTS", "$0 $10 $1x", "$ARGUMENTSsuffix", "no variables", "!`first` !`stderr` !`fail`", "repeat !`first` !`first`", "$&"]) for (const args of [[], ["one"], ["a", "two words", "third"], ["$&", "$$", "$`"], ["中文", " "]]) {
    equal(renderer.replaceParameters(template, args), originalRenderer.replaceParameters(template, args));
    equal(await renderer.processContent(template, args.join(" ") || undefined), await originalRenderer.processContent(template, args.join(" ") || undefined));
    equal(await renderer.render({ name: "/test", prompt: template }, `/test ${args.join(" ")}`), await originalRenderer.render({ name: "/test", prompt: template }, `/test ${args.join(" ")}`));
  }
  for (const input of ["", "/test", "/test one two", '/test "two words" rest', "/test 'one two' three", '/test "" x', '/test "unclosed words', "/testing suffix", "/test 中文\narg"]) equal(renderer.extractArguments(input, "/test"), originalRenderer.extractArguments(input, "/test"));
  const skills = [{ name: "a:pdf", displayName: "PDF", instructions: "$ARGUMENTS ${CODEBUDDY_SESSION_ID}", baseDirectory: "/a" }, { name: "b:pdf", displayName: "PDF", instructions: "b" }];
  const commands = [{ name: "/fixture-review", prompt: "$1 $ARGUMENTS", tags: ["custom"] }];
  const commandHost = { isLocalCommand: (name: string) => name === "/status", parseCommand: (text: string) => ({ name: text.split(" ")[0]!, args: text.split(" ").slice(1) }), executeLocalCommand: async ({ session }: any) => { session.history.push({ type: "message", role: "user", content: "<local-command-stdout>fixture</local-command-stdout>" }); }, finalizeCommandExecution: async () => undefined };
  const commandConfig = { skills, commands: [{ name: "fixture", prompt: "base", tags: ["custom"] }, { name: "fixture", prompt: "user", scope: "user" }, { name: "fixture", prompt: "project", scope: "project", tags: ["mcp-prompt"] }] };
  const addHistory = async (session: HarnessSession, items: any) => { session.history.push(...items); };
  const executor = { name: "/status", message: " status ", autoGenerateHistory: true, execute: async () => undefined };
  const commandManager = new CommandManager(async () => structuredClone(commandConfig), { addHistory }, [executor], { conditionalEnabled: async () => false });
  const capturedCommands = new OriginalCommandManager(); capturedCommands.logger = logger;
  capturedCommands.productManager = { waitConfiguration: async () => structuredClone(commandConfig), getCurrentConfiguration: () => commandConfig };
  capturedCommands.sessionManager = { addHistory }; capturedCommands.commandExecutorMap.set(executor.name, executor);
  await capturedCommands.rebuildCommands(); await commandManager.refresh();
  equal(await commandManager.getAll(), await capturedCommands.getAll()); equal(await commandManager.getCustomCommands(), await capturedCommands.getCustomCommands()); equal(await commandManager.getMcpCommands(), await capturedCommands.getMcpCommands());
  for (const input of ["/status", "/status \"two words\" rest", "/btw question with spaces", "/BTW hello", "/missing", "/status\nargument", ""]) equal(commandManager.parseCommand(input), capturedCommands.parseCommand(input));
  for (const name of ["/fixture", "/a:pdf", "/status", "a:pdf", "missing"]) equal(commandManager.isOverriddenByCustom(name), capturedCommands.isOverriddenByCustom(name));
  const beforeLocal = new HarnessSession("local"), afterLocal = new HarnessSession("local");
  await commandManager.executeLocalCommand({ name: "/status", session: afterLocal, args: ["argument"] }); await capturedCommands.executeLocalCommand({ name: "/status", session: beforeLocal, args: ["argument"] });
  await commandManager.finalizeCommandExecution(afterLocal, "output"); await capturedCommands.finalizeCommandExecution(beforeLocal, "output");
  equal(afterLocal.history.map(({ id, ...item }: any) => item), beforeLocal.history.map(({ id, ...item }: any) => item));
  const runtime = { configuration: async () => ({ skills, commands }), renderer, renderPrompt: async (text: string) => text, commands: commandHost };
  const skill = new SkillTool(runtime), slash = new SlashCommandTool(runtime), beforeSkill = new OriginalSkill(), beforeSlash = new OriginalSlash();
  for (const tool of [beforeSkill, beforeSlash]) { tool.logger = logger; tool.productManager = { waitConfiguration: runtime.configuration }; tool.customCommandRenderer = originalRenderer; tool.promptRenderer = { render: runtime.renderPrompt }; tool.commandManager = commandHost; }
  for (const name of ["a:pdf", "pdf", "PDF", "none", "b:pdf", "a", "", "a:PDF"]) equal(skill.findSkill(skills, name), beforeSkill.findSkill(skills, name));
  const inputs = [{}, { skill: "" }, { skill: " " }, { skill: 1 }, { skill: "a:pdf" }, { command: "a:pdf", args: "custom" }, { skill: "a:pdf", args: 5 }, { skill: "pdf" }, { skill: "PDF" }, { skill: "/fixture-review", args: "one two" }, { skill: "status" }, { skill: "exit" }, { skill: "unknown" }];
  for (const input of inputs) {
    equal(skill.parameters.safeParse(input).success, schemas.lH.safeParse(input).success);
    equal(skill.validateToolParams(input as any), beforeSkill.validateToolParams(input));
    equal(await skill.execute(input as any, { context: new HarnessSession("main") } as any), await beforeSkill.execute(input, { context: new HarnessSession("main") }));
  }
  for (const source of [undefined, "user", "project", "plugin", "bundled"]) for (const fail of [false, true]) {
    let capturedConfig: any, recoveredConfig: any, originalRegistered = false, recoveredRegistered = false;
    const context = { context: new HarnessSession("fork-parent") } as any;
    originalTask = { init(config: any) { capturedConfig = config; }, async execute() { if (fail) throw new Error("fork failure"); return { content: "fork result" }; } };
    beforeSkill.agentManager = { resolveConfiguredModelOrFallback: async () => "fixture-model" };
    beforeSkill.taskManager = { registerTask(_task: any, skip: boolean) { originalRegistered = skip; } };
    const recovered = new SkillTool({ ...runtime, resolveModel: async () => "fixture-model", createTask(config, main) { recoveredConfig = { ...config, mainSession: main }; return { execute: originalTask.execute } as any; }, tasks: { registerTask(_task: any, skip = false) { recoveredRegistered = skip; } } });
    const definition = { name: "fork", instructions: "$ARGUMENTS ${CLAUDE_SESSION_ID}", source, context: "fork", hooks: { SubagentStart: [{ command: "fixture" }] }, baseDirectory: "/fixture" };
    equal(await recovered.executeSkillInForkContext(definition, "arguments", context), await beforeSkill.executeSkillInForkContext(definition, "arguments", context));
    equal({ ...recoveredConfig, mainSession: recoveredConfig.mainSession.id }, { ...capturedConfig, mainSession: capturedConfig.mainSession.id });
    equal(recoveredRegistered, originalRegistered);
  }
  for (const command of [undefined, 1, "", " ", "no slash", "/", "/fixture-review one two", "/missing", "/exit", "/status"] as any[]) {
    const input = { command };
    equal(slash.parameters.safeParse(input).success, schemas.lU.safeParse(input).success);
    equal(slash.validateToolParams(input), beforeSlash.validateToolParams(input));
    equal(await slash.execute(input, { context: new HarnessSession("main") } as any), await beforeSlash.execute(input, { context: new HarnessSession("main") }));
  }
  const previousBudget = process.env.CODEBUDDY_SKILL_TOOL_CHAR_BUDGET;
  try {
    for (const budget of ["1", "300", "8000", "30000", "invalid"]) for (const count of [0, 1, 10, 199, 201, 220]) for (const source of ["user", "bundled", "project"]) {
      process.env.CODEBUDDY_SKILL_TOOL_CHAR_BUDGET = budget;
      const policy = new SkillDescriptionPolicy(() => path.join(directory, "user")), manager = new OriginalManager(); manager.logger = logger;
      const list = Array.from({ length: count }, (_, index) => ({ name: `skill${index}`, instructions: "", description: "word".repeat(index % 60), source }));
      equal(policy.truncateSkillsByCharBudget(list), manager.truncateSkillsByCharBudget(list));
      equal(policy.skillCharBudget, manager.skillCharBudget);
    }
  } finally { if (previousBudget === undefined) delete process.env.CODEBUDDY_SKILL_TOOL_CHAR_BUDGET; else process.env.CODEBUDDY_SKILL_TOOL_CHAR_BUDGET = previousBudget; }
  for (const scope of ["project", "user", "connector", "builtin"]) await fs.mkdir(path.join(directory, scope, "group", "skill"), { recursive: true });
  for (const scope of ["project", "user", "connector", "builtin"]) await fs.writeFile(path.join(directory, scope, "group", "skill", "SKILL.md"), `---\nname: ${scope}\ndescription: CodeBuddy sample\nallowed-tools: Read, Bash(git {status,log}:*)\ndisable: false\n---\nCodeBuddy ${scope} ${"${CODEBUDDY_SKILL_DIR}"} ${"${CLAUDE_SESSION_ID}"}`);
  await fs.writeFile(path.join(directory, "project", "group", "skill", "_user_meta.json"), JSON.stringify({ name: "Display", skillId: "fixture", version: "v1" }));
  const capturedProvider = new OriginalProvider(); capturedProvider.logger = logger;
  const provider = new SkillProductProvider({ project: path.join(directory, "project"), user: path.join(directory, "user"), connector: path.join(directory, "connector"), builtin: path.join(directory, "builtin") });
  equal(await provider.loadSkillsCached(), await capturedProvider.loadSkillsCached()); equal(await provider.provide({ force: true }), await capturedProvider.provide({ force: true }));
  for (const name of ["skill", "中文技能", "a:pdf", "", "manywords".repeat(10)]) equal(generateSkillColor(name), OriginalColor.generateColorFromName(name));
  const capturedReference = new OriginalReference(); capturedReference.logger = logger; const reference = new ReferenceService(() => directory);
  await fs.writeFile(path.join(directory, "a.md"), "A @b.md"); await fs.writeFile(path.join(directory, "b.md"), "B @a.md");
  for (const text of ["@a.md @b.md", "`@a.md` @missing", "```\n@a.md\n``` @b.md", "@project", "@a.md @a.md"]) { equal(ImportUtils.extractImports(text, "", directory), OriginalImport.extractImports(text, "")); equal(await reference.process(text), await capturedReference.process(text)); }
  for (const text of ["", "x".repeat(150000), "line\n".repeat(30000), "中文".repeat(40000), "\n".repeat(300000) + "long".repeat(30000)]) equal(reference.truncateByTokenCap(text, "/fixture"), capturedReference.truncateByTokenCap(text, "/fixture"));
} finally { await fs.rm(directory, { recursive: true, force: true }); }
console.log(JSON.stringify({ schemaAndBehaviorComparisons: comparisons, passed: true, source: "WorkBuddy 5.3.14 captured bundle", scope: "Skill/SlashCommand/render/builtin catalog/budget/provider/reference; not all native executors or plugins" }, null, 2));

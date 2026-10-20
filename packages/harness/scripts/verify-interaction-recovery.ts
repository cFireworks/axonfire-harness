import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import * as fs from "node:fs/promises";
import * as fsSync from "node:fs";
import * as path from "node:path";
import { tmpdir } from "node:os";
import { runInNewContext } from "node:vm";
import { z as z3 } from "zod3";
import { AskUserQuestionTool, askUserQuestionParameters, normalizeAskUserQuestionInput, validateAskUserQuestionParams } from "../src/tools/ask-user-question.js";
import { AskService } from "../src/interaction/ask-service.js";
import { PlanStorageService } from "../src/plans/plan-storage-service.js";
import { PermissionMode } from "../src/permissions/permission.js";
import { ToolPermissionPlanStrategy } from "../src/permissions/tool-permission-plan-strategy.js";
import { HarnessSession } from "../src/sessions/session.js";
import { PromptContextProvider, SettingsPromptContextInitializer, PromptVarsFileContextInitializer } from "../src/prompts/prompt-context.js";
import { UserQueryWrapperAgentRunInterceptor, isSystemInjectedContent } from "../src/agents/user-query-wrapper-agent-run-interceptor.js";
import { SystemReminderAgentRunInterceptor, MCP_UI_MODEL_CONTEXT, addSystemReminder } from "../src/agents/system-reminder-agent-run-interceptor.js";
import { ToolExecutionError, isToolExecutionError } from "../src/tools/tool-execution-error.js";
import { PlanTools, enterPlanModeParameters, exitPlanModeParameters } from "../src/tools/plan-tools.js";
import { ProductPromptRenderer } from "../src/prompts/prompt-renderer.js";
import { loadProductConfiguration } from "../src/config/product-config.js";
import { SessionManager } from "../src/sessions/session-manager.js";
import { createToolCallResultItem } from "../src/tools/tool-rejection.js";
import { Ajv } from "ajv";
import { DeferExecuteTool } from "../src/tools/defer-execute-tool.js";
import { McpRegistry } from "../src/mcp/mcp-registry.js";

const bundle = process.argv[2];
if (!bundle) throw new Error("Pass the captured WorkBuddy 5.3.14 codebuddy.js path");
const source = await fs.readFile(bundle, "utf8");
assert.equal(createHash("sha256").update(source).digest("hex"), "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd");
const directory = await fs.mkdtemp(path.join(tmpdir(), "harness-original-interaction-diff-"));
const logger = { debug() {}, info() {}, warn() {}, error() {}, setContext() {} };
const errors = { AskFollowupInvalidParamsError: "19203", AskFollowupMissingToolCallIdError: "19201", AskFollowupNoAnswersError: "19202", AskFollowupUserDeclinedError: "19204", ToolTimeoutError: "90003", ToolCancelledError: "90004" };
let strategies: any[] = [], fallback: any, storage: any, permission: any;
const context: any = { Error, Date, process, Set, Map,
  console: { error() {} }, iz: { BaseTool: class {} }, lD: enterPlanModeParameters, lR: exitPlanModeParameters, oD: { isWorkBuddyDesktop: () => false },
  cI: {}, cf: () => Ajv, iq: { ENV_KEY_CODEBUDDY_HIGH_CREDIT_APPROVAL_ENABLED: "CODEBUDDY_HIGH_CREDIT_APPROVAL_ENABLED" },
  tP: path, tN: fs, tF: new Set(["__proto__", "prototype", "constructor"]),
  rf: { PermissionMode }, rN: { MemoryScope: { USER: "user", PROJECT: "project", PROJECT_LOCAL: "project_local" }, MemoryType: { ALWAYS: "always" } }, ng: { MCP_UI_MODEL_CONTEXT },
  sd: { SessionManager: "sessions" },
  em: { z: z3 }, e_: { BaseTool: class {} }, ev: { ToolNames: { ASK_USER_QUESTION: "AskUserQuestion" }, ToolExecutionError, isToolExecutionError },
  eI: { ToolErrorCode: errors }, ef: { ...fsSync, default: { arrowRight: "→" } }, eg: fs,
  eh: { PlanModeUtils: { generatePlanFilePath: () => path.join(directory, "plan.md") } },
  ih: { PermissionMode }, nC: { ToolNames: { ENTER_PLAN_MODE: "EnterPlanMode", EXIT_PLAN_MODE: "ExitPlanMode", DEFER_EXECUTE: "DeferExecuteTool" }, ToolPermissionService: "permissions", ToolPermissionType: { Read: "read", Edit: "edit", Bash: "bash" }, ToolArgType: { FilePath: "filePath", Command: "command" }, ToolPermissionStrategy: "strategies" },
  nk: { ContainerUtil: { getAll: () => strategies, get: (token: string) => token === "plans" ? storage : token === "permissions" ? permission : fallback } },
  iC: "default", iE: { PlanStorageService: "plans" }, nW: { ModelUtils: { isMandatoryApprovalTarget: (_session: any, name: string) => name === "high-credit" }, InputItemUtils: { createToolCallResultItem }, PathUtils: { resolveFilePathToWorkDir: (value: string) => path.resolve(directory, value) } },
  A_: { AgentNames: { COMPACT: "compact" }, AgentRunInterceptorPriority: { UserQueryWrapper: 1025, SystemReminderContext: 1200 } },
  AH: { InputItemUtils: { isUserMessageItem: (item: any) => item.type === "message" && item.role === "user" }, MessageUtils: { addSystemReminder, isSystemInjectedContent, isUserQueryContent: (text: string) => text.startsWith("<user_query>") && text.endsWith("</user_query>"), wrapUserQuery: (text: string) => `<user_query>${text}</user_query>` } },
};
function evaluate(text: string): any { return runInNewContext(text, context, { timeout: 1000, contextCodeGeneration: { strings: false, wasm: false } }); }
const helperStart = source.indexOf("let ew=", 11490000), helperEnd = source.indexOf("var e_=ec(", helperStart);
const normalizeStart = source.indexOf("function normalizeOption(", helperEnd), schemaStart = source.indexOf("let eS=em.z.object", normalizeStart);
const original = evaluate(`(()=>{${source.slice(helperStart, helperEnd)}${source.slice(normalizeStart, schemaStart)}${source.slice(schemaStart, 11500785).replace(/,eT=$/, ";")}return {validate:validateAskUserQuestionParams,normalize:normalizeAskUserQuestionInput,Schema:eD,Tool:(${source.slice(11500785, 11504469)})}})()`);
const beforeAsk = new original.Tool(), afterAsk = new AskUserQuestionTool(new AskService());
const OriginalPlan = evaluate(`(${source.slice(11577909 + 3, source.indexOf(";tool_permission_strategy_decorate", 11577909))})`);
const OriginalStore = evaluate(`(${source.slice(12170604, 12172463)})`);
const beforeStore = new OriginalStore(); beforeStore.logger = logger;
storage = new PlanStorageService(directory);
const OriginalWrapper = evaluate(`(${source.slice(7120151, 7120981)})`);
const OriginalProvider = evaluate(`(${source.slice(7698068 + "let eV=".length, source.indexOf(";__decorate", 7698068))})`);
const OriginalSettings = evaluate(`(${source.slice(7750751 + "let tR=".length, source.indexOf(";settings_prompt_context_initializer_decorate", 7750751))})`);
const OriginalReminders = evaluate(`(${source.slice(7148490, 7155494)})`);
const OriginalEnter = evaluate(`(${source.slice(11893642, 11895876)})`), OriginalExit = evaluate(`(${source.slice(11898187, 11903027)})`);
const OriginalDefer = evaluate(`(${source.slice(12008364, 12018235)})`);
const OriginalVars = evaluate(`(${source.slice(7755614 + "tU=".length, 7758563)})`);
let comparisons = 0;
const plain = (value: any) => value === undefined ? undefined : JSON.parse(JSON.stringify(value));
function equal(actual: any, expected: any) { assert.deepEqual(plain(actual), plain(expected)); comparisons++; }
try {
  const question = { question: "Which approach?", header: "Approach", options: [{ label: "A", description: "first" }, { label: "B", description: "second" }] };
  const values: any[] = [undefined, null, false, 0, "", "text", [], {}, " ", [null], [{ label: " A ", description: "" }]];
  const inputs: any[] = [undefined, null, {}, { questions: [] }, { questions: [question] }, { questions: [question, question] }, { questions: [{ answers: ["one", "two"] }] }];
  for (const value of values) {
    inputs.push({ questions: value }, { questions: [value] });
    for (const field of ["question", "header", "options", "multiSelect"]) inputs.push({ questions: [{ ...question, [field]: value }] });
    for (const field of ["label", "description"]) inputs.push({ questions: [{ ...question, options: [{ label: "A", description: "", [field]: value }] }] });
  }
  for (let count = 0; count < 7; count++) inputs.push({ questions: Array.from({ length: count }, (_, index) => ({ ...question, question: `Q${index}`, options: Array.from({ length: count }, (_, option) => ({ label: `${option}`, description: "" })) })) });
  for (const input of inputs) {
    equal(validateAskUserQuestionParams(input), original.validate(input));
    equal(normalizeAskUserQuestionInput(input), original.normalize(input));
    const before = original.Schema.safeParse(input), after = askUserQuestionParameters.safeParse(input);
    equal(after.success, before.success); if (before.success && after.success) equal(after.data, before.data);
    equal(await afterAsk.needsApproval(undefined, input), await beforeAsk.needsApproval(undefined, input));
    if (original.validate(input)) equal(await afterAsk.execute(input), await beforeAsk.execute(input));
  }
  for (const answers of [{ custom: "free text", _meta: "ignored" }, { _action: "skip_question" }, { _action: "skip_interview" }, { _action: "chat_about_this" }, {}]) {
    beforeAsk.askService = { acquireAnswers: async () => answers };
    const recovered = new AskUserQuestionTool({ acquireAnswers: async () => answers } as any);
    equal(await recovered.execute({ questions: [question] }, { toolCall: { callId: "call" } } as any), await beforeAsk.execute({ questions: [question] }, undefined, { toolCall: { callId: "call" } }));
  }
  for (const error of [new Error("timeout"), new Error("aborted"), new Error("declined"), new ToolExecutionError("specific", "19201"), "failure"]) equal(afterAsk.resolveAskErrorCode(error), beforeAsk.resolveAskErrorCode(error));
  const oldMandatory = process.env.CODEBUDDY_HIGH_CREDIT_APPROVAL_ENABLED;
  try {
    for (const behavior of ["allow", "deny", "ask"]) for (const intrinsic of [true, false]) for (const mandatory of ["0", "1"]) for (const name of [undefined, "unknown", "Write", "mcp__fixture__tool", "bare", "high-credit"]) {
      process.env.CODEBUDDY_HIGH_CREDIT_APPROVAL_ENABLED = mandatory;
      let calls: any[] = [];
      permission = {
        checkPermission: async (tool: any, _context: any, input: any, callId: string, resolve: () => any) => { calls.push(["check", tool.name, input, callId, resolve()]); return { behavior }; },
        needsApproval: async (tool: any, _context: any, input: any, callId: string) => { calls.push(["target", tool.name, input, callId]); return true; },
        isMandatoryApprovalTarget: (_session: any, target: string) => target === "high-credit",
      };
      const manager = { get: async (target: string) => target === "unknown" ? undefined : { name: target, needsApproval: intrinsic, execute() {} } };
      const search = { describe: (target: string) => target === "bare" ? { isBare: true, serverName: "proxy", rawToolName: "tool" } : undefined };
      const recovered = new DeferExecuteTool(search as any, manager, new McpRegistry(), {}, permission);
      const captured = new OriginalDefer(); captured.toolManager = manager; captured.toolSearchService = search;
      const input = { toolName: name, params: { path: "fixture" } };
      const before = new HarnessSession("defer"), after = new HarnessSession("defer");
      const result = await recovered.needsApproval({ context: after }, input, "call"), recoveredCalls = calls; calls = [];
      equal(result, await captured.needsApproval({ context: before }, input, "call"));
      equal(recoveredCalls, calls);
      equal([...after.preToolUseHookResults ?? []], [...before.preToolUseHookResults ?? []]);
    }
  } finally { if (oldMandatory === undefined) delete process.env.CODEBUDDY_HIGH_CREDIT_APPROVAL_ENABLED; else process.env.CODEBUDDY_HIGH_CREDIT_APPROVAL_ENABLED = oldMandatory; }
  for (const mode of [undefined, ...Object.values(PermissionMode)]) for (const type of ["read", "edit", "bash", "unknown"]) for (const mandatory of [false, true]) for (const plan of [false, true]) {
    fallback = { mode: PermissionMode.Default, needApproval: async () => true };
    const previous = { mode: PermissionMode.BypassPermissions, needApproval: async () => false };
    const recovered = new ToolPermissionPlanStrategy(storage, () => strategies, fallback, (value) => path.resolve(directory, value));
    const captured = new OriginalPlan(); captured.logger = logger;
    strategies = [previous, recovered];
    const session = new HarnessSession("plan"); if (mode) session.meta.prePlanPermissionMode = mode;
    session.meta.planFilePath = path.join(directory, "plan.md");
    const tool = { name: "Write", aliases: ["EDIT"], needsApproval: mandatory, resolveToolType: () => type };
    const args = [{ type: "filePath", value: plan ? "plan.md" : "other.md" }];
    const run = { context: session } as any;
    const result = await recovered.needApproval(tool, run, {}, args, "call");
    strategies = [previous, captured];
    equal(result, await captured.needApproval(tool, run, {}, args, "call"));
  }
  const session = new HarnessSession("store");
  for (const method of ["read", "syncRead", "exists"] as const) equal(await storage[method](session), await beforeStore[method](session));
  session.meta.planFilePath = path.join(directory, "plan.md");
  for (const text of ["", "# Plan\n", "中文计划"]) {
    await beforeStore.write(session, text);
    for (const method of ["read", "syncRead", "exists"] as const) equal(await storage[method](session), await beforeStore[method](session));
    await storage.write(session, text + "updated"); equal(await storage.read(session), await beforeStore.read(session));
  }
  const product = await loadProductConfiguration(), prompts = new ProductPromptRenderer(product), sessions = new SessionManager();
  const planTools = new PlanTools(storage, prompts, sessions), capturedEnter = new OriginalEnter(), capturedExit = new OriginalExit();
  for (const tool of [capturedEnter, capturedExit]) {
    tool.logger = logger; tool.planStorageService = storage;
    tool.promptManager = { get: async (name: string) => product.promptsByName.get(name), render: async (template: string, args: any) => prompts.render(template, args.variables) };
  }
  equal(await planTools.enter({}), await capturedEnter.execute({}));
  equal(await planTools.exit({}), await capturedExit.execute({}));
  for (const mode of Object.values(PermissionMode)) for (const content of ["", "# plan", undefined]) {
    const before = new HarnessSession("plan-tools"), after = new HarnessSession("plan-tools");
    for (const current of [before, after]) { current.permissionModeSubject.next(mode); current.meta.planFilePath = path.join(directory, "plan.md"); }
    if (content === undefined) await fs.rm(path.join(directory, "plan.md"), { force: true }); else await storage.write(before, content);
    equal(await planTools.enter({}, { context: after } as any), await capturedEnter.execute({}, { context: before }));
    equal(after.meta, before.meta); equal(after.permissionModeSubject.value, before.permissionModeSubject.value);
    equal(await planTools.exit({}, { context: after } as any), await capturedExit.execute({}, { context: before }));
    equal(after.meta, before.meta); equal(after.permissionModeSubject.value, before.permissionModeSubject.value);
  }
  const child = new HarnessSession("child", { meta: { parentSessionId: "parent" } });
  equal(await planTools.enter({}, { context: child } as any), await capturedEnter.execute({}, { context: child }));
  equal(await planTools.exit({}, { context: child } as any), await capturedExit.execute({}, { context: child }));
  const originalDisable = process.env.CODEBUDDY_DISABLE_SYSTEM_REMINDER_MD;
  try {
    for (const mode of [PermissionMode.Default, PermissionMode.Plan, PermissionMode.Delegate]) for (const disabled of ["0", "true"]) for (const meta of [false, true]) for (const resumed of [false, true]) for (const text of [undefined, "selected", "x".repeat(2001)]) {
      process.env.CODEBUDDY_DISABLE_SYSTEM_REMINDER_MD = disabled;
      const selection = { filePath: "/fixture.ts", ...(text === undefined ? {} : { text }), selection: { start: { line: 1 }, end: { line: 3 } } };
      const old = new OriginalReminders(); old.logger = logger; old.planStorageService = storage; old.promptManager = capturedEnter.promptManager;
      old.memoryManager = { get: async ({ scope }: any) => [{ path: scope, content: "rules" }] };
      old.ideService = { selectionChangedSubject: { value: selection } };
      old.channelManager = { channelServers: new Map([["fixture", { instructions: "channel instructions" }]]) };
      const recovered = new SystemReminderAgentRunInterceptor(prompts, storage, { getIdeSelection: () => selection, getAlwaysMemory: async (scope) => [{ path: scope, content: "rules" }], channelServers: () => old.channelManager.channelServers.values() });
      const makeRun = () => {
        const session = new HarnessSession("reminder"); session.permissionModeSubject.next(mode); session.meta.planFilePath = path.join(directory, "plan.md");
        session.options.continue = resumed;
        session.hookContexts = { sessionStartContext: "start", userPromptSubmitContext: "submit", stopHookFeedback: "stop" } as any;
        (session as any)[MCP_UI_MODEL_CONTEXT] = { content: [{ type: "text", text: "MCP text" }], structuredContent: { fixture: true } };
        return { session, agent: { name: "codebuddy" }, input: [{ type: "message", role: "user", content: "older" }, { type: "message", role: "user", content: "query", providerData: { isMeta: meta } }] } as any;
      };
      const before = makeRun(), after = makeRun();
      await recovered.intercept(after); await old.intercept(before);
      equal(after.input, before.input); equal(after.session.hookContexts, before.session.hookContexts);
      equal((after.session as any)[MCP_UI_MODEL_CONTEXT], (before.session as any)[MCP_UI_MODEL_CONTEXT]);
    }
  } finally { if (originalDisable === undefined) delete process.env.CODEBUDDY_DISABLE_SYSTEM_REMINDER_MD; else process.env.CODEBUDDY_DISABLE_SYSTEM_REMINDER_MD = originalDisable; }
  const varsPath = path.join(directory, "vars.json"); let selected: string | undefined = varsPath;
  const oldVars = new OriginalVars(); oldVars.logger = logger; oldVars.cliProvider = { parseOpts: () => ({ opts: { promptVarsFile: selected } }) };
  const vars = new PromptVarsFileContextInitializer(() => selected);
  for (const value of values.concat([{ version: 1, variables: {} }, { version: 1, variables: { string: "v", number: 1, bool: false, nil: null } }, { version: 2, variables: {} }, { version: 1, variables: { nested: {} } }])) equal(vars.isPromptVarsFilePayload(value), oldVars.isPromptVarsFilePayload(value));
  await fs.writeFile(varsPath, JSON.stringify({ version: 1, variables: { fresh: "first", protected: "no overwrite", constructor: "ignored" } }));
  for (const changed of [false, true]) {
    if (changed) await fs.writeFile(varsPath, JSON.stringify({ version: 1, variables: { fresh: "changed" } }));
    const before = { protected: "existing" }, after = { protected: "existing" };
    await oldVars.initialize(before); await vars.initialize(after); equal(after, before);
  }
  selected = undefined; await oldVars.initialize({}); await vars.initialize({});
  selected = varsPath;
  const beforeVars = {}, afterVars = {}; await oldVars.initialize(beforeVars); await vars.initialize(afterVars); equal(afterVars, beforeVars);
  const wrapper = new UserQueryWrapperAgentRunInterceptor(), oldWrapper = new OriginalWrapper();
  const blocks = ["plain", " 中文 ", "", "<system-reminder>x</system-reminder>", "<user_query>already</user_query>", "<channel x>", "<task-notification>x", "<command-message>x"];
  for (const first of blocks) for (const second of blocks) {
    const input = { type: "message", role: "user", content: [{ type: "input_text", text: first }, { type: "input_image", image: "fixture" }, { type: "input_text", text: second }] };
    const before = structuredClone(input), after = structuredClone(input);
    oldWrapper.wrapUserMessageContent(before); wrapper.wrapUserMessageContent(after as any); equal(after, before);
  }
  const oldReminders = new OriginalReminders(), reminders = new SystemReminderAgentRunInterceptor({} as any, storage);
  for (const text of blocks.concat(["<system-reminder data-role=\"hook\">hook</system-reminder><system-reminder>rules</system-reminder>"])) equal(reminders.hasRulesSystemReminder(text), oldReminders.hasRulesSystemReminder(text));
  const oldSettings = new OriginalSettings();
  const settings = new SettingsPromptContextInitializer({} as any);
  for (const language of [undefined, "zh", "en", "中文", "CHINESE", "fr", "zh-HK", ""]) equal(settings.resolveResponseLanguage({ language }), oldSettings.resolveResponseLanguage({ language }));
  for (let trial = 0; trial < 10; trial++) {
    const initializers = [{ async initialize(value: any) { value.first = trial; } }, { async initialize(value: any) { value.second = value.first + 1; } }];
    const captured = new OriginalProvider(); captured.initializers = initializers; captured.logger = logger;
    const recovered = new PromptContextProvider(initializers);
    equal(await Promise.all([recovered.get(), recovered.get()]), await Promise.all([captured.get(), captured.get()]));
    equal(await recovered.get(), await captured.get());
  }
} finally { await fs.rm(directory, { recursive: true, force: true }); }
console.log(JSON.stringify({ schemaAndBehaviorComparisons: comparisons, passed: true, source: "WorkBuddy 5.3.14 captured bundle", scope: "Ask/Plan tools/Plan strategy/storage/Defer approval/reminders/user-query/settings/prompt-vars/context; not all host branches" }, null, 2));

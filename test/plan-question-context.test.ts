import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTraceProcessors, Usage, type Model } from "@openai/agents-core";
import { createHarness } from "../src/runtime/create-harness.js";
import { HarnessSession } from "../src/sessions/session.js";
import { SessionManager } from "../src/sessions/session-manager.js";
import { PermissionMode } from "../src/permissions/permission.js";
import { PlanStorageService, PlanModeUtils } from "../src/plans/plan-storage-service.js";
import { PlanTools } from "../src/tools/plan-tools.js";
import { AskService } from "../src/interaction/ask-service.js";
import { AskUserQuestionTool, askUserQuestionParameters, normalizeAskUserQuestionInput, validateAskUserQuestionParams } from "../src/tools/ask-user-question.js";
import { ProductPromptRenderer } from "../src/prompts/prompt-renderer.js";
import { loadProductConfiguration } from "../src/config/product-config.js";
import { PromptContextProvider, PromptVarsFileContextInitializer, SettingsPromptContextInitializer } from "../src/prompts/prompt-context.js";
import { SystemReminderAgentRunInterceptor, MCP_UI_MODEL_CONTEXT } from "../src/agents/system-reminder-agent-run-interceptor.js";
import { UserQueryWrapperAgentRunInterceptor } from "../src/agents/user-query-wrapper-agent-run-interceptor.js";

setTraceProcessors([]);
async function directory(t: { after(fn: () => any): void }) { const path = await mkdtemp(join(tmpdir(), "harness-plan-questions-")); t.after(() => rm(path, { recursive: true, force: true })); return path; }
const question = { question: "Which approach?", header: "Approach", options: [{ label: "A", description: "first" }, { label: "B", description: "second" }], multiSelect: false };
function fixtureModel(output: (request: any, count: number) => any[]): Model {
  let count = 0;
  return { async getResponse() { return { output: [], usage: new Usage() }; }, async *getStreamedResponse(request) {
    count++;
    yield { type: "response_started" };
    yield { type: "response_done", response: { id: `response-${count}`, output: output(request, count), usage: { inputTokens: 10, outputTokens: 1, totalTokens: 11 } } } as any;
  } };
}
const toolCall = (name: string, args: object, id = "call") => [{ type: "function_call", name, callId: id, id, status: "completed", arguments: JSON.stringify(args) }];
const answer = (text: string) => [{ type: "message", role: "assistant", status: "completed", content: [{ type: "output_text", text }] }];

test("PlanStorage preserves generated names, lazy path initialization and read/write/exists protocol", async (t) => {
  const path = await directory(t), storage = new PlanStorageService(path), session = new HarnessSession("plan");
  assert.equal(await storage.exists(session), false);
  await assert.rejects(storage.write(session, "plan"), /not initialized/);
  const generated = storage.initializePlanFilePath(session);
  assert.match(generated, /(?:toasty|blazing|swift|cosmic|radiant|stellar|quantum|electric)-(?:forging|aurora|thunder|cascade|nebula|pulse|vortex|beacon)-(?:babbage|tesla|curie|einstein|newton|darwin|lovelace|turing)\.md$/);
  assert.equal(storage.initializePlanFilePath(session), generated);
  assert.equal(await storage.read(session), undefined);
  await storage.write(session, "# plan\n");
  assert.equal(await storage.read(session), "# plan\n");
  assert.equal(storage.syncRead(session), "# plan\n");
  assert.equal(await storage.exists(session), true);
  assert.match(PlanModeUtils.generateUniquePlanFileName(), /\.md$/);
});

test("Plan tools restore the prior mode, reject subagents, and request teammate approval without exiting", async (t) => {
  const path = await directory(t), product = await loadProductConfiguration(), prompts = new ProductPromptRenderer(product);
  const storage = new PlanStorageService(path), sessions = new SessionManager(), messages: any[] = [];
  const tools = new PlanTools(storage, prompts, sessions, { mailbox: { send: async (...args) => { messages.push(args); } } });
  const session = new HarnessSession("main");
  session.permissionModeSubject.next(PermissionMode.AcceptEdits);
  const entered = await tools.enter({}, { context: session } as any);
  assert.equal(entered.renderer.type, "enterplan");
  assert.equal(session.permissionModeSubject.value, "plan");
  assert.equal(session.meta.prePlanPermissionMode, "acceptEdits");
  assert.match((await tools.enter({}, { context: session } as any)).content, /Already in plan mode/);
  await storage.write(session, "Implementation plan");
  assert.equal((await tools.exit({}, { context: session } as any)).rawResponse.plan, "Implementation plan");
  assert.equal(session.permissionModeSubject.value, "acceptEdits");
  assert.equal(session.meta.prePlanPermissionMode, undefined);
  const child = new HarnessSession("child", { meta: { parentSessionId: session.id } });
  assert.match((await tools.enter({}, { context: child } as any)).error, /not available/);
  assert.match((await tools.exit({}, { context: child } as any)).error, /not available/);
  child.meta.teamContext = { teamName: "team", memberName: "researcher", color: "blue" };
  child.permissionModeSubject.next(PermissionMode.Plan);
  storage.initializePlanFilePath(child);
  await storage.write(child, "Teammate plan");
  const requested = await tools.exit({}, { context: child } as any);
  assert.match(requested.content, /remain in plan mode/);
  assert.equal(child.permissionModeSubject.value, "plan");
  assert.equal(JSON.parse(messages[0][2].text).type, "plan_approval_request");
  session.permissionModeSubject.next(PermissionMode.Plan);
  const raw = { type: "function_call", name: "ExitPlanMode", callId: "exit" };
  const rejected = await sessions.run(session, () => tools.resolveExitRejectedResult(raw));
  assert.equal((rejected[0] as any).providerData.error, "User rejected CodeBuddy's plan");
  assert.equal((rejected[0] as any).providerData.skipRun, true);
});

test("AskService routes early answers, per-call waiters, replacement, rejection, timeout and abort", async () => {
  const service = new AskService();
  service.doneAsk({ Question: "early" }, "early");
  assert.deepEqual(await service.acquireAnswers("early"), { Question: "early" });
  const one = service.acquireAnswers("one"), two = service.acquireAnswers("two");
  service.doneAsk({ q: "two" }, "two");
  service.doneAsk({ q: "one" }, "one");
  assert.deepEqual(await one, { q: "one" }); assert.deepEqual(await two, { q: "two" });
  const first = service.acquireAnswers("replace"), replacementRejected = assert.rejects(first, /Superseded/);
  const second = service.acquireAnswers("replace");
  service.doneAsk({ q: "new" }, "replace");
  await replacementRejected; await second;
  const rejected = service.acquireAnswers("reject"); service.rejectAsk("reject"); await assert.rejects(rejected, /declined/);
  const controller = new AbortController(), aborted = service.acquireAnswers("abort", controller.signal); controller.abort(); await assert.rejects(aborted, /Aborted/);
  const keepAlive = setInterval(() => undefined, 50);
  try { await assert.rejects(service.acquireAnswers("timeout", undefined, 1), /timed out/); } finally { clearInterval(keepAlive); }
  assert.deepEqual(service.getRoutingState().waitingDeferredKeys, []);
});

test("AskUserQuestion preserves friendly validation, legacy normalization, custom answers and skip actions", async () => {
  const service = new AskService(), tool = new AskUserQuestionTool(service);
  const invalid = await tool.execute({ questions: [{ question: "Q", header: "h", options: ["bad"] }] });
  assert.equal(invalid.rawResponse.tool_error_code, "19203");
  assert.match(invalid.content, /not a bare string/);
  assert.equal(await tool.needsApproval({}, {}), false);
  const single = { questions: [{ ...question, options: question.options.slice(0, 1) }] };
  assert.equal(validateAskUserQuestionParams(single), undefined);
  assert.equal(askUserQuestionParameters.safeParse(single).success, false, "the original manual validator and advertised schema intentionally differ");
  assert.equal(await tool.needsApproval({}, single), true);
  assert.equal((await tool.execute({ questions: [question], answers: { "Which approach?": "custom free text", _internal: "hidden" } })).content, " · Which approach? → custom free text");
  for (const [action, pattern] of [["skip_question", /chose not to answer/], ["skip_interview", /Stop asking clarifying/], ["chat_about_this", /wants to clarify/]] as const) assert.match((await tool.execute({ questions: [question], answers: { _action: action } })).content, pattern);
  assert.equal((await tool.execute({ questions: [question] })).rawResponse.tool_error_code, "19201");
  const normalized = normalizeAskUserQuestionInput({ questions: [{ header: " H ", answers: ["a", { label: "b" }] }] });
  assert.equal(normalized.questions[0].question, "H");
  assert.equal(normalized.questions[0].options[0].label, "a");
  assert.equal(normalized.questions[0].multiSelect, false);
  const session = new HarnessSession("x");
  assert.equal(tool.isEnabled(session), true); session.options.print = true; assert.equal(tool.isEnabled(session), false);
  session.options.inputFormat = "stream-json"; assert.equal(tool.isEnabled(session), false);
});

test("PromptContext resolution is per-use, coalesces in-flight work and prevents prompt-vars overwrite/prototype injection", async (t) => {
  const path = await directory(t), vars = join(path, "vars.json");
  await writeFile(vars, '{"version":1,"variables":{"workDir":"evil","custom":"one","__proto__":"bad","constructor":"bad"}}');
  let calls = 0;
  const loader = new PromptVarsFileContextInitializer(() => vars);
  const provider = new PromptContextProvider([{ async initialize(context) { calls++; await new Promise((resolve) => setImmediate(resolve)); context.workDir = path; } }, loader]);
  const [a, b] = await Promise.all([provider.get(), provider.get()]);
  assert.equal(a, b); assert.equal(calls, 1); assert.equal(a.workDir, path); assert.equal(a.custom, "one");
  assert.equal(Object.hasOwn(a, "constructor"), false);
  await writeFile(vars, '{"version":1,"variables":{"custom":"two"}}');
  assert.equal((await provider.get()).custom, "one", "same file snapshot is cached until option selection changes");
  loader.selectFile(undefined);
  assert.equal((await provider.get()).custom, "two");
  assert.equal(calls, 3);
  const language = new SettingsPromptContextInitializer({ get: async () => undefined });
  assert.match(language.resolveResponseLanguage({ language: "zh-CN" }), /简体中文/);
  assert.match(language.resolveResponseLanguage({ language: "en" }), /natural language/);
});

test("System reminders preserve placement, hook consumption, meta skip, IDE truncation and user-query wrapping", async (t) => {
  const path = await directory(t), prompts = new ProductPromptRenderer(await loadProductConfiguration());
  const session = new HarnessSession("reminders", { hookContexts: { sessionStartContext: "start", userPromptSubmitContext: "submit" } });
  session.permissionModeSubject.next(PermissionMode.Plan);
  (session as any)[MCP_UI_MODEL_CONTEXT] = { content: [{ type: "text", text: "mcp context" }] };
  const context: any = { input: [{ type: "message", role: "user", content: [{ type: "input_text", text: "question" }, { type: "input_text", text: "continued" }] }], agent: { name: "cli" }, session, skipRun: false };
  const interceptor = new SystemReminderAgentRunInterceptor(prompts, new PlanStorageService(path), { getIdeSelection: () => ({ filePath: "file.ts", text: "x".repeat(2001), selection: { start: { line: 2 }, end: { line: 3 } } }) });
  await interceptor.intercept(context);
  await new UserQueryWrapperAgentRunInterceptor().intercept(context);
  const text = JSON.stringify(context.input);
  assert.match(text, /<user_query>question continued<\/user_query>/);
  assert.match(text, /Plan mode is active/); assert.match(text, /truncated/); assert.match(text, /mcp context/);
  assert.equal(session.hookContexts?.sessionStartContext, undefined);
  assert.equal((session as any)[MCP_UI_MODEL_CONTEXT], undefined);
  assert.equal(interceptor.hasRulesSystemReminder('<system-reminder data-role="hook">x</system-reminder>'), false);
  assert.equal(interceptor.hasRulesSystemReminder('<system-reminder data-role="hook">x</system-reminder><system-reminder>rules</system-reminder>'), true);
  context.input = [{ type: "message", role: "user", content: "meta", providerData: { isMeta: true } }];
  await interceptor.intercept(context); assert.equal(context.input[0].content, "meta");
});

test("real SDK enters plan, writes only the plan without re-prompt, waits for exit approval and restores mode", { timeout: 10000 }, async (t) => {
  const path = await directory(t), approvals: string[] = [], requests: any[] = [];
  let runtime: Awaited<ReturnType<typeof createHarness>>, session: HarnessSession;
  const model = fixtureModel((request, count) => {
    requests.push(request);
    return count === 1 ? toolCall("ToolSearch", { tool_names: ["EnterPlanMode", "ExitPlanMode"] }, "search")
      : count === 2 ? toolCall("DeferExecuteTool", { toolName: "EnterPlanMode", params: {} }, "enter")
      : count === 3 ? toolCall("Write", { file_path: runtime.plans.getPlanFilePath(session), content: "# Approved plan" }, "write")
      : count === 4 ? toolCall("DeferExecuteTool", { toolName: "ExitPlanMode", params: {} }, "exit") : answer("plan approved");
  });
  runtime = await createHarness({ workDir: path, model: "fixture-model", modelProvider: { getModel: () => model }, approveTool: (name) => { approvals.push(name); return true; } });
  t.after(() => runtime.close()); session = await runtime.openSession();
  assert.equal(await runtime.prompt(session, "plan and proceed"), "plan approved");
  assert.deepEqual(approvals, ["EnterPlanMode", "ExitPlanMode"]);
  assert.equal(session.permissionModeSubject.value, "default");
  assert.equal(await runtime.plans.read(session), "# Approved plan");
  assert.match(requests[0].systemInstructions, new RegExp(path));
  assert.match(JSON.stringify(requests[0].input), /<user_query>plan and proceed<\/user_query>/);
});

test("plan rejection honors skipRun, makes no extra model call, and standalone resume retains plan state", { timeout: 10000 }, async (t) => {
  const path = await directory(t);
  let count = 0;
  const model = fixtureModel((_request, current) => { count = current; return current === 1 ? toolCall("EnterPlanMode", {}, "enter") : toolCall("ExitPlanMode", {}, "exit"); });
  const options = { workDir: path, modelProvider: { getModel: () => model }, approveTool: (name: string) => name !== "ExitPlanMode" };
  const first = await createHarness(options), session = await first.openSession();
  // Explicit NoDefer is a supported product overlay. This case exercises the
  // direct tool's plan-specific rejection resolver, separately from the default dispatcher path above.
  session.options.toolDeferOverlay = { forceDefer: { exact: [], glob: [] }, forceNoDefer: { exact: ["EnterPlanMode", "ExitPlanMode"], glob: [] } };
  assert.equal(await first.prompt(session, "plan"), "");
  assert.equal(count, 2); assert.equal(session.permissionModeSubject.value, "plan"); assert.equal(session.status, "idle");
  await first.close();
  const second = await createHarness(options); t.after(() => second.close());
  const restored = await second.openSession(session.id);
  assert.equal(restored.permissionModeSubject.value, "plan");
  assert.equal(restored.meta.planFilePath, session.meta.planFilePath);
});

test("real SDK question approval consumes human free text, overrides model-prefilled answers and resumes once", { timeout: 10000 }, async (t) => {
  const path = await directory(t), requests: any[] = [];
  let questions = 0;
  const model = fixtureModel((request, count) => { requests.push(request); return count === 1 ? toolCall("AskUserQuestion", { questions: [question], answers: { "Which approach?": "model-prefilled" } }, "question") : answer("answered"); });
  const runtime = await createHarness({ workDir: path, modelProvider: { getModel: () => model }, askUserQuestion: async () => { questions++; return { "Which approach?": "human custom answer" }; } });
  t.after(() => runtime.close());
  assert.equal(await runtime.prompt(await runtime.openSession(), "ask me"), "answered");
  assert.equal(questions, 1); assert.match(JSON.stringify(requests[1].input), /human custom answer/);
  const result = requests[1].input.find((item: any) => item.type === "function_call_result");
  assert.ok(!JSON.stringify(result).includes("model-prefilled"));
  assert.deepEqual(runtime.asks.getRoutingState().earlyAnswerKeys, []);
});

test("real SDK malformed questions return product validation output without asking for approval", async (t) => {
  const path = await directory(t), requests: any[] = [];
  const model = fixtureModel((request, count) => { requests.push(request); return count === 1 ? toolCall("AskUserQuestion", { questions: [{ question: "Q", header: "h", options: ["bad"] }] }, "invalid") : answer("validation handled"); });
  const runtime = await createHarness({ workDir: path, modelProvider: { getModel: () => model }, askUserQuestion: () => { throw new Error("must not be called"); } });
  t.after(() => runtime.close());
  assert.equal(await runtime.prompt(await runtime.openSession(), "ask"), "validation handled");
  assert.match(JSON.stringify(requests[1].input), /19203/);
});

import assert from "node:assert/strict";
import { appendFile, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import type { AgentInputItem } from "@openai/agents-core";
import type { AgentManager } from "../src/agents/agent-manager.js";
import type { AgentService, AgentRunContext } from "../src/agents/agent-service.js";
import { HistoryAgentRunInterceptor } from "../src/agents/history-agent-run-interceptor.js";
import { loadProductConfiguration } from "../src/config/product-config.js";
import { CompactType, getAutoCompactWindow, getEngineeringCompactSufficiencyRatio } from "../src/context/compact-config.js";
import { ContextCompactSummarizerImpl } from "../src/context/context-compact-summarizer.js";
import { HistoryEngineeringCompactor } from "../src/context/history-engineering-compactor.js";
import { removeLastToolResultFromHistory, sanitizeItemsForSummaryAgent } from "../src/context/compact-utils.js";
import { ProductPromptRenderer } from "../src/prompts/prompt-renderer.js";
import { getActiveAgentOnlyHistory } from "../src/sessions/history-utils.js";
import { SessionRunStateMachine } from "../src/sessions/run-state-machine.js";
import { SessionManager } from "../src/sessions/session-manager.js";
import { HarnessSession } from "../src/sessions/session.js";
import { SessionStore } from "../src/sessions/session-store.js";

function item(value: Record<string, unknown>): AgentInputItem { return value as AgentInputItem; }
function user(text: string): AgentInputItem { return item({ type: "message", role: "user", content: [{ type: "input_text", text }] }); }

test("engineering compact uses the installed XML layout and preserves omitted argument keys", () => {
  const result = HistoryEngineeringCompactor.compact([
    user("<user_query>\nchange file\n</user_query>"),
    item({ type: "function_call", name: "Edit", arguments: '{"file_path":"a.ts","new_string":"secret"}' }),
    item({ type: "function_call_result", output: "very large result" }),
    item({ type: "message", role: "assistant", content: [{ type: "output_text", text: "done" }] }),
  ]);
  assert.equal(result.compactContent,
    '<cb_summary>\nSummary of the conversation so far:\nThe conversation is between an AI agent and a user.\nUse this to get up to speed, and continue helping the user as the AI agent.\nSome contents may be omitted, indicated by "<omitted />".\n\n' +
    '<previous_user_message>\n<user_query>\nchange file\n</user_query>\n</previous_user_message>\n\n' +
    '<previous_tool_call>\nTool: Edit\nArguments: {"file_path":"a.ts","new_string":"<omitted>"}\n<result><omitted /></result>\n</previous_tool_call>\n\n' +
    '<previous_assistant_message>\ndone\n</previous_assistant_message>\n\n\n</cb_summary>');
  assert.equal(result.originalItemCount, 4);
  assert.equal(result.estimatedTokens, Math.ceil(result.compactContent.length / 4));
});

test("engineering compact respects the latest summary boundary without nesting headers", () => {
  const prior = HistoryEngineeringCompactor.compact([user("old question")]).compactContent;
  const result = HistoryEngineeringCompactor.compact([
    user("discard this old branch"),
    item({ ...user(prior), providerData: { isCompacted: true, isCompactInternal: true } }),
    user("new question"),
  ]);
  assert.equal(result.originalItemCount, 2);
  assert.equal(result.compactContent.includes("discard this old branch"), false);
  assert.equal((result.compactContent.match(/Summary of the conversation so far:/g) ?? []).length, 1);
  assert.equal(result.compactContent.includes("new question"), true);
});

test("summary retry truncates the entire last result batch and keeps calls paired", () => {
  const history = [user("start"),
    item({ type: "function_call", callId: "a", name: "Read" }),
    item({ type: "function_call_result", callId: "a", output: "first" }),
    item({ type: "function_call", callId: "b", name: "Read" }),
    item({ type: "function_call_result", callId: "b", output: "second" })];
  const retry = removeLastToolResultFromHistory(history) as any[];
  assert.match(retry[2].output, /Tool call output was truncated/);
  assert.match(retry[4].output, /Tool call output was truncated/);
  assert.equal((history[2] as any).output, "first");
  const sanitized = sanitizeItemsForSummaryAgent([
    item({ type: "message", role: "user", content: [{ type: "input_image", image: "data:image/png;base64,1234" }] }),
  ]) as any[];
  assert.deepEqual(sanitized[0].content, [{ type: "input_text", text: "[Image]" }]);
});

test("session JSONL survives a fresh manager, UTF8 chunk boundaries, compact linkage, and damaged tail", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "workbuddy-session-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const store = new SessionStore({ storageDir: root, workDir: () => "/project" });
  const sessions = new SessionManager(store);
  const session = await sessions.create({ id: "main", meta: { agentName: "cli", planFilePath: "/plan.md" } });
  await sessions.addHistory(session, user("中文".repeat(15_000)));
  const before = session.lastMessageId;
  await sessions.addHistory(session, item({ ...user("<cb_summary>kept summary</cb_summary>"), providerData: { isCompacted: true, isCompactInternal: true } }));
  const summaryId = session.lastMessageId;
  await sessions.addHistory(session, user("continue"));
  await sessions.flushHistory(session);
  await appendFile(store.getSessionFilePath("main"), '{"bad record":\n');
  const restored = await new SessionManager(new SessionStore({ storageDir: root })).get("main");
  assert.ok(restored);
  assert.equal(restored.history.length, 3);
  assert.equal((restored.history[0] as any).content[0].text, "中文".repeat(15_000));
  assert.equal(restored.hasCompactedHistory, true);
  assert.equal(restored.meta.planFilePath, "/plan.md");
  assert.equal((restored.history[1] as any).logicalParentId, before);
  assert.equal((restored.history[1] as any).parentId, undefined);
  assert.equal((restored.history[2] as any).parentId, summaryId);
  const context = { agent: { name: "cli" }, input: [user("new input")], session: restored } as AgentRunContext;
  await new HistoryAgentRunInterceptor(sessions).intercept(context);
  assert.equal((context.input as any[]).length, 3);
  assert.equal((context.input as any[])[0].id, summaryId);
});

test("subagent storage distinguishes runtime id from store id and sanitizes legacy text blocks", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "workbuddy-subagent-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const store = new SessionStore({ storageDir: root });
  const sessions = new SessionManager(store);
  const session = await sessions.create({ id: "runtime", storeId: "agent-task-1", meta: { parentSessionId: "main" } });
  await sessions.addHistory(session, item({ type: "message", role: "assistant", content: [{ type: "text", text: "legacy" }], providerData: { usage: { inputTokens: 12, outputTokens: 2, totalTokens: 14 } } }));
  const path = join(root, "main", "subagents", "agent-task-1.jsonl");
  const saved = JSON.parse((await readFile(path, "utf8")).trim());
  assert.deepEqual(saved.message.usage, { input_tokens: 12, output_tokens: 2, total_tokens: 14 });
  const restored = await store.get("agent-task-1");
  assert.equal(restored?.id, "runtime");
  assert.equal(restored?.storeId, "agent-task-1");
  assert.equal((restored?.history[0] as any).content[0].type, "output_text");
  assert.equal((await store.getAll()).length, 0);
});

async function harness(summary: () => Promise<string>, maxInputTokens = 128_000) {
  const product = await loadProductConfiguration();
  const agent = { name: "cli", modelSettings: {} };
  const summaryAgent = { name: "contextSummary", modelSettings: {} };
  const agents = {
    getDefault: async () => agent,
    get: async (name: string) => name === "contextSummary" ? summaryAgent : agent,
    getModel: async () => ({ id: "mock", name: "mock", maxInputTokens }),
  } as unknown as AgentManager;
  const service = { runOneTime: summary, run: async () => undefined } as unknown as AgentService;
  const sessions = new SessionManager();
  return {
    sessions,
    compactor: new ContextCompactSummarizerImpl(product, agents, service, sessions, new SessionRunStateMachine(), new ProductPromptRenderer(product)),
  };
}

test("pre-message compaction retains transcript and avoids model calls when engineering output fits", async () => {
  const { sessions, compactor } = await harness(async () => { throw new Error("must not call summary"); });
  const session = await sessions.create();
  await sessions.addHistory(session, [user("question"), item({ type: "message", role: "assistant", content: "answer" })]);
  assert.equal(await compactor.compactAndSummarize(session, { force: true, type: CompactType.PRE_MESSAGE_AUTO, skipContinue: true }), true);
  assert.equal(session.history.length, 3);
  assert.equal((session.history[2] as any).providerData.isSummary, false);
  assert.equal(session.compactMessageGeneration, 1);
  assert.equal(session.isCompressing, false);
  assert.equal(getActiveAgentOnlyHistory(session.history, { lastMessageId: session.lastMessageId, hasCompactedHistory: true }).length, 3);
});

test("emergency compaction retries tool-result batch then appends recovery summary", async () => {
  let calls = 0;
  const { sessions, compactor } = await harness(async () => { calls += 1; return calls === 1 ? "" : "usable summary"; });
  const session = await sessions.create({ agentName: "Explore" });
  await sessions.addHistory(session, [user("question"), item({ type: "function_call", name: "Read", callId: "r", arguments: "{}" }), item({ type: "function_call_result", callId: "r", output: "huge" })]);
  assert.equal(await compactor.compactAndSummarize(session, { force: true, type: CompactType.EMERGENCY_AUTO, skipContinue: true }), true);
  assert.equal(calls, 2);
  assert.equal(session.history.length, 4);
  assert.equal((session.history.at(-1) as any).content[0].text, "<conversation_history_summary>\nusable summary\n</conversation_history_summary>");
  assert.equal(session.agentName, "Explore");
  assert.equal(session.meta.compactType, undefined);
});

test("cancel during emergency summary restores original history and does not mark complete", async () => {
  let target!: HarnessSession;
  const { sessions, compactor } = await harness(async () => { target.abortController.abort(); return "ignored summary"; });
  target = await sessions.create();
  await sessions.addHistory(target, user("question"));
  const originalId = target.lastMessageId;
  assert.equal(await compactor.compactAndSummarize(target, { force: true, type: CompactType.EMERGENCY_AUTO, skipContinue: true }), false);
  assert.equal(target.history.length, 1);
  assert.equal(target.lastMessageId, originalId);
  assert.equal(target.meta.compactCancelled, true);
  assert.equal(target.compactMessageGeneration, 0);
});

test("compact environmental windows preserve target clamps and percent parsing", (t) => {
  const previous = process.env.CODEBUDDY_AUTO_COMPACT_WINDOW;
  const ratio = process.env.CODEBUDDY_ENGINEERING_COMPACT_SUFFICIENCY_PCT;
  t.after(() => {
    if (previous === undefined) delete process.env.CODEBUDDY_AUTO_COMPACT_WINDOW; else process.env.CODEBUDDY_AUTO_COMPACT_WINDOW = previous;
    if (ratio === undefined) delete process.env.CODEBUDDY_ENGINEERING_COMPACT_SUFFICIENCY_PCT; else process.env.CODEBUDDY_ENGINEERING_COMPACT_SUFFICIENCY_PCT = ratio;
  });
  process.env.CODEBUDDY_AUTO_COMPACT_WINDOW = "123";
  assert.equal(getAutoCompactWindow(), 100_000);
  process.env.CODEBUDDY_AUTO_COMPACT_WINDOW = "2000000";
  assert.equal(getAutoCompactWindow(), 1_000_000);
  process.env.CODEBUDDY_ENGINEERING_COMPACT_SUFFICIENCY_PCT = "25";
  assert.equal(getEngineeringCompactSufficiencyRatio(), 0.25);
});

import { randomUUID } from "node:crypto";
import { ModelBehaviorError, user, type AgentInputItem } from "@openai/agents-core";
import type { AgentService } from "../agents/agent-service.js";
import { RunResultUtils } from "../agents/run-result-utils.js";
import { ModelErrorUtils, INTERRUPTED_BY_USER_MESSAGE } from "../models/model-error-utils.js";
import { getActiveAgentOnlyHistory } from "../sessions/history-utils.js";
import type { HarnessSession } from "../sessions/session.js";
import type { SessionRunStateMachine } from "../sessions/run-state-machine.js";
import { createToolCallResultItem } from "../tools/tool-rejection.js";

export type StreamRecoveryRuntime = {
  service: Pick<AgentService, "run" | "runDefault">;
  beforeHandleError?: (session: HarnessSession, result: object) => Promise<void>;
  describeDeferredTool?: (name: string) => unknown;
  getTasks?: () => Array<{ id: string; status: string }>;
  executeStopHooks?: (session: HarnessSession, result: unknown, options: { stopReason: "cancelled" | "failed" }) => Promise<void>;
  isDeferredDispatchEnabled?: () => boolean;
  sleep?: (milliseconds: number) => Promise<void>;
  formatErrorMessage?: (error: unknown) => string;
};
export const MODEL_ERROR_RETRY_MARKER = "Model error retry", MODEL_ERROR_RETRY_CHECK_WINDOW = 4, MODEL_ERROR_MAX_RETRIES = 2;
export const NETWORK_ERROR_RETRY_MARKER = "Network error occurred", NETWORK_ERROR_RETRY_CHECK_WINDOW = 3;
export function sanitizeToolNotFoundMessage(text: string): string { return text ? text.replace(/Tool (.+?) not found in agent [^\s.]+\.?/g, 'Tool "$1" does not exist in the current tool set.') : text; }
export const createErrorRecoveryInput = (text: string): AgentInputItem[] => [user(text, { isMeta: true })];
export function createRecoveryAssistantMessage(text: string, options: { status?: string; skipRun?: boolean; error?: unknown } = {}): AgentInputItem {
  return { id: randomUUID(), type: "message", role: "assistant", content: [{ type: "output_text", text }], status: options.status ?? "completed", providerData: { skipRun: options.skipRun ?? true, error: options.error } } as AgentInputItem;
}

export class InterruptionRetryPolicy {
  hasRecentModelErrorRetry(session: HarnessSession): boolean {
    let count = 0;
    for (const item of getActiveAgentOnlyHistory(session.history).slice(-MODEL_ERROR_RETRY_CHECK_WINDOW) as any[]) if (item.role === "user" && item.content) try { if ((typeof item.content === "string" ? item.content : JSON.stringify(item.content)).includes(MODEL_ERROR_RETRY_MARKER)) count++; } catch {}
    return count >= MODEL_ERROR_MAX_RETRIES;
  }
  hasRecentNetworkErrorRetry(session: HarnessSession): boolean {
    return (getActiveAgentOnlyHistory(session.history).slice(-NETWORK_ERROR_RETRY_CHECK_WINDOW) as any[]).some((item) => { if (item.role === "user" && item.content) try { return (typeof item.content === "string" ? item.content : JSON.stringify(item.content)).includes(NETWORK_ERROR_RETRY_MARKER); } catch {} return false; });
  }
  incrementStreamTimeoutRetryCount(session: HarnessSession, firstToken: boolean): void { session.meta ??= {}; const key = firstToken ? "firstTokenTimeoutRetryCount" : "streamTimeoutRetryCount"; session.meta[key] = ((session.meta[key] as number | undefined) ?? 0) + 1; }
  hasRecentStreamTimeoutRetry(session: HarnessSession, firstToken: boolean): boolean { return firstToken ? ((session.meta?.firstTokenTimeoutRetryCount as number | undefined) ?? 0) >= 2 : ((session.meta?.streamTimeoutRetryCount as number | undefined) ?? 0) >= 1; }
}
/** Factored from InterruptionService.waitFor (11065xxx..11075xxx).
 * Runtime dependencies replace container lookup; retry order and prompts are native. */
export class InterruptionStreamRecovery extends InterruptionRetryPolicy {
  constructor(readonly stateMachine: SessionRunStateMachine, readonly runtime: StreamRecoveryRuntime) { super(); }
  private sleep(milliseconds: number): Promise<void> { return this.runtime.sleep?.(milliseconds) ?? new Promise((done) => setTimeout(done, milliseconds)); }
  private emitEnd(result: any, output = ""): void { result.lastAgent?.emit("agent_end", result.state._context, output); }
  async handleCompleted(session: HarnessSession, result: any): Promise<void> {
    if (!RunResultUtils.isFinalOutput(result)) return;
    const step = result.state._currentStep, output = step?.type === "next_step_final_output" ? step.output : "", status = this.stateMachine.getSnapshot(session).status;
    if (status === "model_done" || status === "idle") this.emitEnd(result, output);
    if (session.meta && (session.meta.streamTimeoutRetryCount || session.meta.firstTokenTimeoutRetryCount)) { session.meta.streamTimeoutRetryCount = 0; session.meta.firstTokenTimeoutRetryCount = 0; }
    if (!this.runtime.isDeferredDispatchEnabled?.()) void this.runtime.service.runDefault([], { context: session });
  }
  async handleError(session: HarnessSession, result: any, error: any): Promise<boolean> {
    const aborted = !!session.abortSignal?.aborted, fields = error && typeof error === "object" ? error : {}, message = error instanceof Error ? error.message : typeof error === "string" ? error : String(error), service = this.runtime.service;
    if (result.silentAbort) {
      this.emitEnd(result); result.silentAbort = false;
      const items = result.newItems || [], completed = new Set(items.filter((item: any) => item?.rawItem?.type === "function_call_result" && item.rawItem.callId).map((item: any) => item.rawItem.callId));
      for (const item of items) { const call = item?.rawItem; if (call?.type === "function_call" && call.callId && !completed.has(call.callId)) call.status = "incomplete"; }
      session.headlessCompletionDeferred?.resolve(); session.combineSubject.next({ type: "result", data: result });
      if (!this.runtime.isDeferredDispatchEnabled?.() && session.queue?.length > 0) void service.runDefault([], { context: session });
      return false;
    }
    const network = ModelErrorUtils.isNetworkError(error), timeout = ModelErrorUtils.isStreamTimeoutError(error), firstToken = ModelErrorUtils.isFirstTokenTimeoutError(error), autoRetry = network && !this.hasRecentNetworkErrorRetry(session) || timeout && !this.hasRecentStreamTimeoutRetry(session, firstToken);
    if (autoRetry) { session.meta ??= {}; session.meta.retryInProgress = true; } else this.emitEnd(result);
    const items = result.newItems, completed = new Set(items.filter((item: any) => item?.rawItem?.type === "function_call_result" && item.rawItem.callId).map((item: any) => item.rawItem.callId));
    const pending = items.map((item: any) => item?.rawItem).filter((call: any) => call?.type === "function_call" && call.callId && !completed.has(call.callId));
    const metadata = { code: fields.code, message: sanitizeToolNotFoundMessage(message), requestID: fields.requestID, status: fields.status, statusText: fields.statusText, type: fields.type, isNetworkError: network, isStreamTimeout: timeout, isRetryable: network || timeout || ModelErrorUtils.isRetryableModelError(error) };
    const display = fields.status !== 401 ? (this.runtime.formatErrorMessage?.(error) ?? ModelErrorUtils.formatErrorMessage(error)) || message || "Unknown error occurred" : "401 Unauthorized";
    if (!this.stateMachine.isIdle(session)) this.stateMachine.transition(session, { type: autoRetry ? "RETRYING" : "RUN_FAILED", reason: autoRetry ? "interruption-auto-retry" : "interruption-error" });
    // Standalone stream consumption owns JSONL writes; finish those before a
    // recovered error turn appends or publishes the next result.
    await this.runtime.beforeHandleError?.(session, result);
    const sanitized = sanitizeToolNotFoundMessage(display);
    let retried = false;
    const retryNetwork = async (withPending: boolean) => { delete session.meta?.retryInProgress; retried = true; const input = createErrorRecoveryInput('<system-reminder data-role="error-recovery">Network error occurred, please continue</system-reminder>'); if (withPending) await service.runDefault(input, { context: session, bypassMessageQueue: true }); else await service.run(result.lastAgent, input, { context: session, bypassMessageQueue: true }); };
    const retryTimeout = async (withPending: boolean) => {
      const title = firstToken ? "First token timeout occurred" : "Stream timeout occurred";
      this.incrementStreamTimeoutRetryCount(session, firstToken);
      const count = (firstToken ? session.meta?.firstTokenTimeoutRetryCount : session.meta?.streamTimeoutRetryCount) as number, delay = 2000 * count;
      if (delay > 0) await this.sleep(delay);
      delete session.meta?.retryInProgress; retried = true;
      const input = createErrorRecoveryInput(withPending ? `<system-reminder data-role="error-recovery">${title} during tool execution. The response was interrupted. Please continue.</system-reminder>` : `<system-reminder data-role="error-recovery">${title}. The response was interrupted due to no data received. Please continue where you left off.</system-reminder>`);
      if (withPending) await service.runDefault(input, { context: session, bypassMessageQueue: true }); else await service.run(result.lastAgent, input, { context: session, bypassMessageQueue: true });
    };
    const retryModel = async (text: string) => { retried = true; await service.run(result.lastAgent, createErrorRecoveryInput(text), { context: session, bypassMessageQueue: true }); };
    if (pending.length > 0) {
      await this.sleep(200);
      for (const call of pending) {
        let content = sanitized;
        if (call.name === "Agent" && sanitized === INTERRUPTED_BY_USER_MESSAGE) { const task = this.runtime.getTasks?.().find((task) => task.status === "running" || task.status === "failed"); if (task) content = `Task was interrupted by user. The task has been stopped.\n\nIf the user wants to continue this task later, you can resume it by calling the Agent tool with resume="${task.id}".\n\nDo NOT use TaskOutput to retrieve results - TaskOutput is only for background tasks started with run_in_background=true.\n\n[Agent ID: ${task.id}]`; }
        await service.runDefault([createToolCallResultItem(content, call, { status: "incomplete", skipRun: true, error: metadata })], { context: session });
      }
      if (network && !this.hasRecentNetworkErrorRetry(session)) await retryNetwork(true);
      else if (!network && timeout && !this.hasRecentStreamTimeoutRetry(session, firstToken)) await retryTimeout(true);
    } else {
      await service.runDefault([createRecoveryAssistantMessage(display, { status: "incomplete", skipRun: true, error: metadata })], { context: session });
      if (error instanceof SyntaxError || fields.error instanceof SyntaxError) {
        if (!this.hasRecentModelErrorRetry(session)) await retryModel(`<system-reminder data-role="error-recovery">Model error retry: ${message}</system-reminder>`);
      } else if (error instanceof ModelBehaviorError) {
        const match = error.message.match(/Tool (.+?) not found in agent \S+/);
        if (match) {
          const name = match[1]!, deferred = this.runtime.describeDeferredTool?.(name), capped = this.hasRecentModelErrorRetry(session);
          let text = "";
          if (deferred && !capped) text = `<system-reminder data-role="error-recovery">\n## Deferred Tool — Use DeferExecuteTool\n\nYou attempted to call "${name}" directly, but deferred tools cannot be called directly. Use DeferExecuteTool instead:\n\nDeferExecuteTool({ toolName: "${name}", params: { ... } })\n\nIf you need to know the parameter schema, use ToolSearch first to look up the tool's details.\n\n<!-- ${MODEL_ERROR_RETRY_MARKER}: deferred tool "${name}" invoked directly -->\n</system-reminder>`;
          else if (deferred) await service.runDefault([createRecoveryAssistantMessage(`The tool "${name}" must be invoked via DeferExecuteTool, but the previous attempts kept calling it directly. Stopping to avoid an endless loop. Please retry your request, or rephrase what you need.`, { status: "incomplete", skipRun: true })], { context: session });
          else if (!capped) text = `<system-reminder data-role="error-recovery">\n## Model error retry: Tool Not Found\n\nYou attempted to call a tool named "${name}" but it does not exist in the current tool set.\n\nPlease check:\n1. Did you misspell the tool name? Common tool names include: Read, Write, Edit, Bash, Glob, Grep, Agent, WebFetch, WebSearch, etc.\n2. Is this tool available in the current context?\n\nIf you made a typo, please retry with the correct tool name.\nIf the tool genuinely doesn't exist, try to accomplish your goal using other available tools.\n</system-reminder>`;
          if (text) await retryModel(text);
        } else if (!this.hasRecentModelErrorRetry(session)) await retryModel(`<system-reminder data-role="error-recovery">Model error retry: ${sanitizeToolNotFoundMessage(error.message)}. Please try a different approach.</system-reminder>`);
      } else if (network) { if (!this.hasRecentNetworkErrorRetry(session)) await retryNetwork(false); }
      else if (timeout && !this.hasRecentStreamTimeoutRetry(session, firstToken)) await retryTimeout(false);
      else if (error != null && typeof error === "object" && "error" in error && error.error instanceof ModelBehaviorError) { if (!this.hasRecentModelErrorRetry(session)) await retryModel(`<system-reminder data-role="error-recovery">Model error retry: ${sanitizeToolNotFoundMessage(error.error.message)}. Please try a different approach.</system-reminder>`); }
    }
    if (session.meta?.retryInProgress) delete session.meta.retryInProgress;
    if (!retried && !session.meta?.parentSessionId) { await this.runtime.executeStopHooks?.(session, result, { stopReason: aborted ? "cancelled" : "failed" }); if (session.hookContexts?.continueRequest) delete session.hookContexts.continueRequest; }
    if (!retried) session.headlessCompletionDeferred?.resolve();
    session.combineSubject.next({ type: "result", data: result });
    if (!retried && !aborted && !this.runtime.isDeferredDispatchEnabled?.() && session.queue?.length > 0) void service.runDefault([], { context: session });
    return retried;
  }
}

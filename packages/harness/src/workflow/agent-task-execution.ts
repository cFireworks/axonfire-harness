import type { AgentTask, AgentTaskConfig, AgentTaskResult } from "../agents/agent-task.js";
import type { AgentTaskManager } from "../agents/agent-task-manager.js";
import type { HarnessSession } from "../sessions/session.js";
import { WorkflowSandboxError } from "./workflow-errors.js";
import { WorkflowSubagentPrompts } from "./workflow-subagent-prompts.js";
import type { SubagentExecution, WorkflowSubagentResult, WorkflowSubagentSpec } from "./subagent-types.js";
export type WorkflowTaskFactory = (config: AgentTaskConfig, parent: HarnessSession) => AgentTask;
export class AgentTaskExecution implements SubagentExecution {
  readonly startedAt = Date.now();
  private _lastActivityAt = Date.now();
  settled = false;
  aborted = false;
  readonly task: AgentTask;
  private executePromise: Promise<AgentTaskResult> | undefined;
  constructor(spec: WorkflowSubagentSpec, parent: HarnessSession, prompts: WorkflowSubagentPrompts, createTask: WorkflowTaskFactory, readonly taskManager: Pick<AgentTaskManager, "registerTask" | "removeTask">) {
    const built = prompts.build(spec), agentType = spec.agentType || "general-purpose";
    this.task = createTask({ description: spec.label || "workflow-subagent", prompt: `${built.systemPreamble}\n\n---\n\n${built.userPrompt}`, subagent_type: agentType, ...(spec.model ? { model: spec.model } : {}), ...(spec.maxTurns ? { maxTurns: spec.maxTurns } : {}), detached: true }, parent);
    this.taskManager.registerTask(this.task, true);
  }
  get lastActivityAt(): number { const at = this.task.toolCallHistory?.[this.task.toolCallHistory.length - 1]?.timestamp; if (typeof at === "number" && at > this._lastActivityAt) this._lastActivityAt = at; return this._lastActivityAt; }
  async wait(): Promise<WorkflowSubagentResult> {
    let result: WorkflowSubagentResult | undefined, error: unknown;
    this.executePromise ||= this.task.execute();
    try { const value = await this.executePromise; this.settled = true; result = { text: value.content, sessionId: value.sessionId, tokens: this.totalTokens(), toolCallCount: this.task.toolCallHistory?.length ?? 0, lastToolCalls: extractLastToolCalls(this.task.toolCallHistory), stopReason: this.task.status === "completed" ? "end_turn" : null, durationMs: Date.now() - this.startedAt }; }
    catch (caught) { this.settled = true; error = this.aborted ? new WorkflowSandboxError(`subagent aborted: ${(caught as Error).message}`, { cause: caught }) : caught; }
    finally {
      try { this.taskManager.removeTask(this.task.id); } catch {}
      try { if (this.task.toolCallHistory) this.task.toolCallHistory.length = 0; this.task.prompt = undefined; this.task.response = undefined; this.task.result = undefined; this.executePromise = undefined; } catch {}
    }
    if (error) throw error;
    return result!;
  }
  abort(reason: string): void { if (!this.settled && !this.aborted) { this.aborted = true; try { this.task.abortController?.abort(reason); } catch {} } }
  totalTokens(): number { const usage = this.task.tokenUsage; return usage ? usage.totalTokens ?? usage.inputTokens + usage.outputTokens : 0; }
}
export class AgentTaskExecutionFactory {
  constructor(readonly promptBuilder: WorkflowSubagentPrompts, readonly createTask: WorkflowTaskFactory, readonly taskManager: Pick<AgentTaskManager, "registerTask" | "removeTask">) {}
  create(spec: WorkflowSubagentSpec, parent?: HarnessSession): AgentTaskExecution { if (!parent) throw new WorkflowSandboxError("AgentTaskExecutionFactory requires a parent session."); return new AgentTaskExecution(spec, parent, this.promptBuilder, this.createTask, this.taskManager); }
}
export function extractLastToolCalls(history?: Array<{ name: string; arguments: unknown; timestamp: number }>): Array<{ tool: string; argsPreview: string; at: number }> { return history && history.length !== 0 ? history.slice(Math.max(0, history.length - 3)).map((call) => ({ tool: call.name, argsPreview: previewArgs(call.arguments), at: call.timestamp })) : []; }
export function previewArgs(args: unknown): string {
  if (args == null) return ""; if (typeof args === "string") return clip(args); if (typeof args !== "object") return "";
  for (const key of ["query", "pattern", "command", "cmd", "path", "file_path", "filePath", "url"]) { const value = (args as Record<string, unknown>)[key]; if (typeof value === "string" && value.length > 0) return clip(value); }
  let text; try { text = JSON.stringify(args); } catch { return ""; }
  return text && text !== "{}" && text !== "[]" ? clip(text) : "";
}
function clip(text: string): string { return text.length <= 80 ? text : text.slice(0, 79) + "…"; }

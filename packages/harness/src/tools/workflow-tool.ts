import { z } from "zod";
import type { RunContext } from "@openai/agents-core";
import type { HarnessSession } from "../sessions/session.js";
import type { WorkflowManager, WorkflowStartInput } from "../workflow/workflow-manager.js";
import type { WorkflowRunRecord } from "../workflow/workflow-types.js";
import type { AgentTaskOutputFileManager } from "../agents/agent-task-output-file-manager.js";
import type { BackgroundTaskNotifier } from "../agents/background-task-notifier.js";
import { TruncateBuffer } from "./truncate-buffer.js";
import type { ToolManager, ToolCallDetails } from "./tool-manager.js";
import type { ProductBackgroundTask } from "./background-task-registry.js";
export const WORKFLOW_TOOL_DESCRIPTION = "Run a Dynamic Workflow — opt-in only. See `/workflows` and `ultracode` keyword.";
export const workflowParameters = z.object({
  script: z.string().optional().describe("Inline JavaScript orchestration script (highest priority). Must be a self-contained module that uses the global functions agent, parallel, pipeline, phase, log, and the global `args` value."),
  scriptPath: z.string().optional().describe("Filesystem path to a saved workflow script (.js)."),
  name: z.string().optional().describe("Name of a saved workflow registered in .codebuddy/workflows/ or ~/.codebuddy/workflows/."),
  args: z.string().optional().describe('Input passed to the script as the global `args` value. MUST be a plain string (e.g. the user question verbatim) — schema-locked to reject objects/arrays. Example: `args: "What is x.com?"`, NOT `args: { question: "What is x.com?" }`. For workflows that need structured input, pass a stringified JSON and let the script `JSON.parse(args)` itself.'),
  resumeFromRunId: z.string().optional().describe("Run id to resume from (Batch 2+). When provided, agent calls whose chained cache key matches the previous run will be served from the journal."),
}).strict();
type WorkflowControlLogger = { info?(text: string): void; warn?(text: string): void; error?(text: string): void; debug?(text: string): void };
/** Native 12164717..12168718. Tool returns immediately; completion is a
 * separate output-file/notification branch, never a foreground await. */
export class WorkflowTool {
  readonly name = "Workflow"; readonly description = WORKFLOW_TOOL_DESCRIPTION; readonly parameters = workflowParameters; readonly needsApproval = true;
  readonly argumentRenderer = { displayProperties: [{ name: "name" }, { name: "scriptPath" }], formatText: (input: any) => { const name = typeof input.name === "string" ? input.name : undefined, path = typeof input.scriptPath === "string" ? input.scriptPath : undefined; return name ? `saved workflow: ${name}` : path ? `script: ${path}` : "dynamic workflow"; } };
  constructor(readonly manager: Pick<WorkflowManager, "start" | "abort">, readonly cwdService: { getCwd(): string }, readonly tools: Pick<ToolManager, "addBackgroundTask">,
    readonly backgroundTaskNotifier: Pick<BackgroundTaskNotifier, "notifyCompletion">, readonly outputFileManager: Pick<AgentTaskOutputFileManager, "createOutputFile" | "appendToOutputFile">,
    readonly disabled: () => Promise<boolean>, readonly logger: WorkflowControlLogger = {}) {}
  async isEnabled(_session?: HarnessSession): Promise<boolean> { return !await this.disabled(); }
  async execute(input: WorkflowStartInput, context?: RunContext<HarnessSession>, details?: ToolCallDetails): Promise<any> {
    const session = context?.context; if (!session) return { content: "Workflow tool requires an active session.", error: "no-session" };
    try { const started = await this.manager.start(input, { sessionId: session.id, cwd: this.cwdService.getCwd(), ...(session.abortController?.signal !== undefined ? { parentAbortSignal: session.abortController.signal } : {}) }), task = this.registerBackgroundTask(session, started.runId, started.record, details?.toolCall?.callId);
      void started.done.then((record) => { this.logger.info?.(`[WorkflowTool] run ${record.runId} ${record.status} (phases=${record.phaseCount}, agents=${record.agentCount})`); void this.finalizeBackgroundTask(session, task, record).catch((error) => this.logger.warn?.(`[WorkflowTool] finalize task ${task.id} failed: ${error.message}`)); }, (error) => { this.logger.error?.(`[WorkflowTool] run ${started.runId} crashed: ${error.message}`); task.status = "failed"; task.endTime = Date.now(); task.error = error.message; session.backgroundTaskSubject?.next(task); this.backgroundTaskNotifier.notifyCompletion(task, session); });
      return { content: "/workflows to view dynamic workflow runs", renderer: { type: "workflow-started", value: JSON.stringify({ runId: started.runId, name: started.record.name, status: "running", source: input.name ? `saved workflow: ${input.name}` : input.scriptPath ? `script: ${input.scriptPath}` : `dynamic workflow: ${started.record.name}` }) } };
    } catch (error) { const message = error instanceof Error ? error.message : String(error); return { content: `Failed to start workflow: ${message}`, error: message }; }
  }
  registerBackgroundTask(session: HarnessSession, runId: string, record: WorkflowRunRecord, callId?: string): ProductBackgroundTask { const task: ProductBackgroundTask = { id: runId, toolName: this.name, title: record.name, startTime: record.startedAt, status: "running", stdout: new TruncateBuffer(), stderr: new TruncateBuffer(), sessionId: session.id, ...(callId !== undefined ? { toolUseId: callId } : {}), kill: async () => { try { this.manager.abort(runId, "killed via background task"); } catch (error) { this.logger.debug?.(`[WorkflowTool] abort run ${runId} failed: ${(error as any)?.message ?? error}`); } } }; this.tools.addBackgroundTask(task); session.backgroundTaskSubject?.next(task); this.logger.info?.(`[WorkflowTool] background task registered | taskId=${task.id} | name="${record.name}"`); return task; }
  async finalizeBackgroundTask(session: HarnessSession, task: ProductBackgroundTask, record: WorkflowRunRecord): Promise<void> { try { const file = await this.outputFileManager.createOutputFile(record.runId), output = serializeOutput(record.output); await this.outputFileManager.appendToOutputFile(file, output); task.outputFilePath = file; } catch (error) { this.logger.warn?.(`[WorkflowTool] persist output for ${record.runId} failed: ${(error as any)?.message ?? error}`); } task.status = record.status === "completed" ? "completed" : record.status === "aborted" ? "cancelled" : "failed"; task.endTime = record.endedAt ?? Date.now(); if (record.error) task.error = record.error; session.backgroundTaskSubject?.next(task); this.backgroundTaskNotifier.notifyCompletion(task, session); }
  register(tools: ToolManager): void { tools.register(this.name, { parameters: this.parameters, needsApproval: this.needsApproval, isEnabled: (session) => this.isEnabled(session), execute: (input, context, details) => this.execute(input, context, details) }); }
}
export function serializeOutput(value: unknown): string { if (value == null) return ""; if (typeof value === "string") return value; try { return JSON.stringify(value, null, 2) as string; } catch { return String(value); } }

import { cpus } from "node:os";
export class WorkflowConcurrencyConstants {
  static MAX_AGENT_CONCURRENCY = Math.floor(Math.min(16, Math.max(2, (() => { try { return cpus().length || 1; } catch { return 1; } })() - 2)));
  static MAX_BATCH_SIZE = 50;
  static MAX_AGENTS_PER_RUN = 1000;
  static SCRIPT_SYNC_TIMEOUT_MS = 30000;
  static DEFAULT_STALL_MS = 180000;
  static PROGRESS_DEBOUNCE_MS = 16;
  static MAX_INLINE_SCRIPT_BYTES = 524288;
}
export type WorkflowSubagentSpec = {
  prompt: string; abortSignal: AbortSignal; agentType?: string; model?: string; schema?: unknown;
  isolation?: string; label?: string; phase?: string; stallMs?: number; maxTurns?: number; runId?: string;
};
export type WorkflowSubagentResult = {
  text: string; tokens?: number; durationMs?: number; sessionId?: string; structured?: unknown;
  toolCallCount?: number; lastToolCalls?: Array<{ tool: string; argsPreview: string; at: number }>;
  stopReason?: string | null; throttleRetried?: boolean; schemaRetried?: boolean;
};
export type SubagentExecution = { readonly lastActivityAt: number; wait(): Promise<WorkflowSubagentResult>; abort(reason: string): void };
export type WorkflowLogger = { info?(message: string): void; warn?(message: string): void };

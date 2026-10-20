import type { HarnessSession } from "../sessions/session.js";
import type { CwdService } from "../worktrees/cwd-service.js";
import type { WorktreeService } from "../worktrees/worktree-service.js";
import type { WorktreeChangeDetector } from "../worktrees/worktree-helpers.js";
import { WorkflowConcurrencyConstants, type SubagentExecution, type WorkflowLogger, type WorkflowSubagentResult, type WorkflowSubagentSpec } from "./subagent-types.js";
import { StructuredOutputRetryPolicy, StructuredOutputValidator, StructuredOutputValidationError } from "./structured-output-retry.js";
import { SubagentAbortBridge, SubagentStallWatchdog, SubagentThrottleRetry } from "./subagent-control.js";
import { WorktreeIsolationStrategy, type WorktreeLease } from "./worktree-isolation-strategy.js";
import { WorkflowSandboxError } from "./workflow-errors.js";
export class WorkflowSubagentSpawner {
  readonly validator = new StructuredOutputValidator();
  readonly retryPolicy = new StructuredOutputRetryPolicy();
  private mainSession: HarnessSession | undefined;
  constructor(readonly executionFactory: { create(spec: WorkflowSubagentSpec, parent: HarnessSession): SubagentExecution }, readonly worktreeService?: Pick<WorktreeService, "create" | "remove">, readonly worktreeChangeDetector?: Pick<WorktreeChangeDetector, "detect">, readonly cwdService?: Pick<CwdService, "runWithCwd">, readonly logger: WorkflowLogger = {}) {}
  setMainSession(session: HarnessSession): void { this.mainSession = session; }
  async spawn(spec: WorkflowSubagentSpec): Promise<WorkflowSubagentResult> {
    if (!this.mainSession) throw new WorkflowSandboxError("Workflow subagent spawner has no parent session; manager must call setMainSession() before run.");
    return new SubagentThrottleRetry(spec.stallMs ?? WorkflowConcurrencyConstants.DEFAULT_STALL_MS).run((options) => this.runWithSchemaRetry(spec, options.abortSignal, options.stallMs), spec.abortSignal);
  }
  async runWithSchemaRetry(spec: WorkflowSubagentSpec, signal: AbortSignal, stallMs: number): Promise<WorkflowSubagentResult> {
    let current = spec, attempts = 0, retried = false;
    for (;;) {
      const result = await this.runOnce({ ...current, abortSignal: signal, stallMs }); if (!current.schema) return result;
      try { const structured = this.validator.validate(result.text, current.schema); return { ...result, structured, ...(retried ? { schemaRetried: true } : {}) }; }
      catch (error) { if (!(error instanceof StructuredOutputValidationError)) throw error; attempts++; const next = this.retryPolicy.next(spec, attempts, error); if (!next) throw new WorkflowSandboxError(`Subagent failed schema validation after ${attempts} retries: ${error.message}`, { cause: error }); this.logger.warn?.(`[WorkflowSpawner] schema retry #${attempts} for label=${spec.label ?? "(none)"}: ${error.message}`); current = next; retried = true; }
    }
  }
  async runOnce(spec: WorkflowSubagentSpec): Promise<WorkflowSubagentResult> {
    const lease = await this.acquireIsolation(spec);
    try { const execution = this.executionFactory.create(spec, this.mainSession!), bridge = new SubagentAbortBridge(spec.abortSignal, execution), watchdog = new SubagentStallWatchdog(execution, spec.stallMs); try { return await this.runUnderCwd(lease?.cwd, () => execution.wait()); } finally { watchdog.dispose(); bridge.dispose(); } }
    finally { if (lease) await lease.release(); }
  }
  async acquireIsolation(spec: WorkflowSubagentSpec): Promise<WorktreeLease | undefined> { if (spec.isolation !== "worktree") return; if (!this.worktreeService) { this.logger.warn?.("[WorkflowSpawner] worktree isolation requested but service unavailable; falling back."); return; } const strategy = new WorktreeIsolationStrategy(this.worktreeService, this.worktreeChangeDetector, spec.runId ?? "unknown", this.logger); try { return await strategy.lease(); } catch (error) { this.logger.warn?.(`[WorkflowSpawner] worktree lease failed: ${(error as Error).message}`); return; } }
  async runUnderCwd<T>(cwd: string | undefined, operation: () => Promise<T>): Promise<T> { return cwd && this.cwdService ? this.cwdService.runWithCwd(cwd, operation) : operation(); }
}

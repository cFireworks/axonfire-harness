import { Semaphore } from "./semaphore.js";
import { WorkflowConcurrencyConstants as Constants, type WorkflowSubagentSpec, type WorkflowSubagentResult } from "./subagent-types.js";
import { WorkflowAbortedError, WorkflowAgentCapError, WorkflowBudgetExceededError, WorkflowParallelExhaustedError, WorkflowSandboxError } from "./workflow-errors.js";
import { compactStringify, countLines, reflowJsonString, safeStringify, stripJsonFence } from "./workflow-format.js";
import type { WorkflowAgentOptions, WorkflowAgentRecord, WorkflowPhaseRecord, WorkflowRunRequest, WorkflowSpawner, WorkflowEmitter, WorkflowPauseGate } from "./workflow-types.js";
export type WorkflowCacheHit = { value: unknown; finishedRecord: { endedAt: number; tokens?: number; sessionId?: string; result?: unknown }; key?: string };
export type WorkflowDurability = {
  beforeSpawn(spec: WorkflowSubagentSpec, label?: string, phase?: string): { key: string; prevKey: string; cached?: WorkflowCacheHit };
  afterSpawnSuccess(key: string, result: WorkflowSubagentResult): void; afterSpawnFailure(key: string, error: unknown): void;
  markAgentInvalidated(key: string, reason: string): void; recordRunStarted(name: string, hash: string): void;
  recordRunFinished(status: string, output?: unknown, error?: string): void; close(): Promise<void>;
};
export type WorkflowExecutionDeps = { spawner: WorkflowSpawner; emitter: WorkflowEmitter; request: WorkflowRunRequest; durability?: WorkflowDurability; pauseGate?: WorkflowPauseGate; nestedInvoker?: (name: string, args: unknown, parent: WorkflowExecution) => Promise<unknown> };
/** Native 8702580..8713535. Aborted hooks deliberately freeze; the outer
 * WorkflowAbortRacer owns termination, rather than turning abort into null. */
export class WorkflowExecution {
  static AGENT_LOG_CAP = 200;
  static RESULT_PREVIEW_MAX = 4096;
  private agentTotal = 0;
  private agentCompleted = 0;
  private agentCachedCount = 0;
  private phaseCount = 0;
  private readonly agentLog: WorkflowAgentRecord[] = [];
  private readonly phasesByName = new Map<string, WorkflowPhaseRecord>();
  private totalTokens = 0;
  private readonly inflightAgents = new Map<string, AbortController>();
  private readonly logBuffer: string[] = [];
  private readonly semaphore = new Semaphore(Constants.MAX_AGENT_CONCURRENCY);
  private currentPhase: string | undefined;
  readonly hooks;
  constructor(readonly deps: WorkflowExecutionDeps) {
    this.hooks = Object.freeze({ agent: this.callAgent.bind(this), parallel: this.callParallel.bind(this), pipeline: this.callPipeline.bind(this), phase: this.callPhase.bind(this), log: this.callLog.bind(this), workflow: this.callNestedWorkflow.bind(this) });
  }
  async callNestedWorkflow(name: string, args?: unknown): Promise<unknown> {
    if (!this.deps.nestedInvoker) throw new WorkflowSandboxError("workflow(name, args?): nested workflow invocation is not configured for this run.");
    if (typeof name !== "string" || name.length === 0) throw new WorkflowSandboxError("workflow(name, args?): name must be a non-empty string.");
    await this.guardAbortOrFreeze(); return this.deps.nestedInvoker(name, args, this);
  }
  get totalAgentsSpawned(): number { return this.agentTotal; }
  get totalAgentsFinished(): number { return this.agentCompleted; }
  get totalAgentsCached(): number { return this.agentCachedCount; }
  get totalAgentsInFlight(): number { return Math.max(0, this.agentTotal - this.agentCompleted); }
  get totalPhases(): number { return this.phaseCount; }
  get totalTokensSpent(): number { return this.totalTokens; }
  get logs(): string[] { return this.logBuffer; }
  get runRequest(): WorkflowRunRequest { return this.deps.request; }
  snapshotAgents(): WorkflowAgentRecord[] { return this.agentLog; }
  snapshotPhases(): WorkflowPhaseRecord[] { return [...this.phasesByName.values()]; }
  recordRunStarted(name: string, hash: string): void { this.deps.durability?.recordRunStarted(name, hash); }
  recordRunFinished(status: string, output?: unknown, error?: string): void { this.deps.durability?.recordRunFinished(status, output, error); }
  markAgentInvalidated(key: string, reason: string): void { this.deps.durability?.markAgentInvalidated(key, reason); }
  async flushDurability(): Promise<void> { if (this.deps.durability) await this.deps.durability.close(); }
  dispose(): void { this.agentLog.length = 0; this.phasesByName.clear(); this.logBuffer.length = 0; }
  async callAgent(prompt: string, options: WorkflowAgentOptions = {}): Promise<unknown> {
    if (typeof prompt !== "string" || prompt.length === 0) throw new WorkflowSandboxError("agent(prompt, options): prompt must be a non-empty string.");
    await this.guardAbortOrFreeze();
    if (this.deps.pauseGate) { await this.deps.pauseGate.waitIfPaused(this.deps.request.abortController.signal); await this.guardAbortOrFreeze(); }
    await this.guardCap();
    const controller = new AbortController(), signal = this.deps.request.abortController.signal;
    if (signal.aborted) controller.abort(signal.reason);
    else { const onRunAbort = () => controller.abort(signal.reason); signal.addEventListener("abort", onRunAbort, { once: true }); controller.signal.addEventListener("abort", () => signal.removeEventListener("abort", onRunAbort), { once: true }); }
    const spec = this.buildSpec(prompt, options, controller.signal), release = await this.semaphore.acquire();
    if (this.deps.request.abortController.signal.aborted) { release(); return new Promise(() => undefined); }
    const record = this.makeStartedRecord(options, prompt), durability = this.deps.durability?.beforeSpawn(spec, options.label, this.currentPhase);
    if (durability) { record.key = durability.key; record.prevKey = durability.prevKey; }
    if (durability?.cached) { release(); return this.handleCacheHit(record, durability.cached); }
    if (record.key) this.inflightAgents.set(record.key, controller);
    this.deps.emitter.emit({ kind: "workflow_agent_started", runId: this.deps.request.runId, agent: record });
    try { const result = await this.deps.spawner.spawn(spec); this.deps.durability?.afterSpawnSuccess(record.key, result); this.markFinished(record, result); return this.unpackResult(result); }
    catch (error) { this.deps.durability?.afterSpawnFailure(record.key, error); this.markFailedAndEmit(record, error); throw error; }
    finally { release(); if (record.key) this.inflightAgents.delete(record.key); }
  }
  abortAgent(key: string, reason: string): boolean { const controller = this.inflightAgents.get(key); if (!controller) return false; controller.abort(reason); return true; }
  buildSpec(prompt: string, options: WorkflowAgentOptions, abortSignal: AbortSignal): WorkflowSubagentSpec {
    return { prompt, ...(options.agentType !== undefined ? { agentType: options.agentType } : {}), ...(options.model !== undefined ? { model: options.model } : {}), ...(options.schema !== undefined ? { schema: options.schema } : {}), ...(options.isolation !== undefined ? { isolation: options.isolation } : {}), ...(options.label !== undefined ? { label: options.label } : {}), ...(this.currentPhase !== undefined ? { phase: this.currentPhase } : {}), ...(options.stallMs !== undefined ? { stallMs: options.stallMs } : {}), ...(options.maxTurns !== undefined ? { maxTurns: options.maxTurns } : {}), abortSignal, runId: this.deps.request.runId };
  }
  makeStartedRecord(options: WorkflowAgentOptions, prompt: string): WorkflowAgentRecord { const startedAt = Date.now(), preview = WorkflowExecution.previewPrompt(prompt); return { runId: this.deps.request.runId, key: "", prevKey: "", ...(options.label !== undefined ? { label: options.label } : {}), ...(this.currentPhase !== undefined ? { phase: this.currentPhase } : {}), ...(options.agentType !== undefined ? { agentType: options.agentType } : {}), ...(options.model !== undefined ? { model: options.model } : {}), ...(options.isolation !== undefined ? { isolation: options.isolation } : {}), startedAt, cached: false, ...(preview ? { promptPreview: preview, promptLineCount: countLines(preview) } : {}), idleSinceMs: startedAt }; }
  static previewPrompt(prompt: string): string { const max = WorkflowExecution.RESULT_PREVIEW_MAX; return prompt.length <= max ? prompt : prompt.slice(0, max) + `\n\n[truncated · ${prompt.length - max} bytes omitted]`; }
  handleCacheHit(record: WorkflowAgentRecord, cached: WorkflowCacheHit): unknown { record.cached = true; record.endedAt = cached.finishedRecord.endedAt; record.tokens = cached.finishedRecord.tokens; record.sessionId = cached.finishedRecord.sessionId; const preview = WorkflowExecution.previewOf(cached.finishedRecord.result); if (preview !== undefined) record.resultPreview = preview; this.agentCachedCount++; this.agentCompleted++; this.recordAgentSnapshot(record); if (record.tokens) this.totalTokens += record.tokens; this.deps.emitter.emit({ kind: "workflow_agent_cached", runId: this.deps.request.runId, agent: record }); return cached.value; }
  markFailedAndEmit(record: WorkflowAgentRecord, error: unknown): void { record.endedAt = Date.now(); record.error = error instanceof Error ? error.message : String(error); this.recordAgentSnapshot(record); this.deps.emitter.emit({ kind: "workflow_agent_finished", runId: this.deps.request.runId, agent: record }); this.agentCompleted++; }
  recordAgentSnapshot(record: WorkflowAgentRecord): void { const copy = { ...record }; delete copy.result; if (!copy.resultPreview && record.result !== undefined) copy.resultPreview = WorkflowExecution.previewOf(record.result)!; this.agentLog.push(copy); if (this.agentLog.length > WorkflowExecution.AGENT_LOG_CAP) this.agentLog.shift(); if (!record.phase) return; const phase = this.phasesByName.get(record.phase); if (phase) { phase.agentCount++; if (record.tokens) phase.tokens += record.tokens; } }
  async callParallel(items: any, mapOrOptions?: any, options?: any): Promise<any[]> {
    await this.guardAbortOrFreeze(); let jobs: Array<() => any>, config: any;
    if (typeof mapOrOptions === "function") { const mapper = mapOrOptions; if (!Array.isArray(items)) throw new WorkflowSandboxError("parallel(items, mapFn): items must be an array."); jobs = items.map((item: any, index: number) => () => Promise.resolve(mapper(item, index))); config = options ?? {}; } else { jobs = items; config = mapOrOptions ?? {}; }
    this.assertItems(jobs, "parallel"); if (jobs.length === 0) return [];
    const semaphore = new Semaphore(config.concurrency ? Math.max(1, Math.min(config.concurrency, Constants.MAX_AGENT_CONCURRENCY)) : Math.min(jobs.length, Constants.MAX_AGENT_CONCURRENCY)), fatal: { aborted: boolean; reason: any } = { aborted: false, reason: undefined }, errors: string[] = [];
    const values = await Promise.all(jobs.map((job, index) => this.runWithErrorAsNull(job, index, semaphore, fatal, errors)));
    if (errors.length === jobs.length && !config.allowAllFailures) { if (fatal.reason) throw fatal.reason; throw new WorkflowParallelExhaustedError(jobs.length, errors); } return values;
  }
  async callPipeline(items: any, ...stages: any[]): Promise<any[]> {
    await this.guardAbortOrFreeze();
    if (typeof stages[0] !== "function") { this.assertItems(items, "pipeline"); const values: any[] = []; for (let index = 0; index < items.length; index++) { if (this.deps.request.abortController.signal.aborted) return new Promise(() => {}); try { values.push(await items[index]!()); } catch { values.push(null); } } return values; }
    if (!Array.isArray(items)) throw new WorkflowSandboxError("pipeline(items, ...stages): items must be an array.");
    const functions = stages.filter((stage) => typeof stage === "function"); if (functions.length === 0) throw new WorkflowSandboxError("pipeline(items, ...stages): at least one stage function is required.");
    return Promise.all(items.map(async (item, index) => { let value = item; for (const stage of functions) { if (this.deps.request.abortController.signal.aborted) return new Promise(() => {}); try { value = await stage(value, index); } catch { return null; } } return value; }));
  }
  async callPhase(name: string, body?: () => any): Promise<any> {
    if (typeof name !== "string" || name.length === 0) throw new WorkflowSandboxError("phase(name, body?): name must be a non-empty string.");
    if (body !== undefined && typeof body !== "function") throw new WorkflowSandboxError("phase(name, body?): body must be a function or omitted.");
    await this.guardAbortOrFreeze();
    if (body === undefined && this.currentPhase !== undefined) { const previous = this.phasesByName.get(this.currentPhase); if (previous && previous.status === "running") { previous.endedAt = Date.now(); previous.status = "completed"; this.deps.emitter.emit({ kind: "workflow_phase_finished", runId: this.deps.request.runId, phase: this.currentPhase }); } }
    const previous = this.currentPhase; this.currentPhase = name; this.phaseCount++; if (!this.phasesByName.has(name)) this.phasesByName.set(name, { name, startedAt: Date.now(), agentCount: 0, tokens: 0, status: "running" }); this.deps.emitter.emit({ kind: "workflow_phase_started", runId: this.deps.request.runId, phase: name });
    if (body !== undefined) try { return await body(); } finally { const phase = this.phasesByName.get(name); if (phase) { phase.endedAt = Date.now(); phase.status = "completed"; } this.deps.emitter.emit({ kind: "workflow_phase_finished", runId: this.deps.request.runId, phase: name }); this.currentPhase = previous; }
  }
  callLog(...values: unknown[]): void { this.logBuffer.push(values.map((value) => typeof value === "string" ? value : compactStringify(value)).join(" ")); }
  async runWithErrorAsNull(job: () => any, index: number, semaphore: Semaphore, fatal?: { aborted: boolean; reason: any }, errors?: string[]): Promise<any> {
    if (this.deps.request.abortController.signal.aborted) return new Promise(() => undefined);
    if (fatal?.aborted) { errors?.push(`#${index} short-circuited by fatal error`); return null; }
    const release = await semaphore.acquire(); if (fatal?.aborted) { release(); errors?.push(`#${index} short-circuited by fatal error`); return null; }
    try { return await job(); } catch (error) { const failure = error as any; if (isFatalWorkflowError(failure) && fatal) { fatal.aborted = true; fatal.reason = failure; } errors?.push(`#${index} ${failure.message}`); this.deps.emitter.emit({ kind: "workflow_agent_finished", runId: this.deps.request.runId, agent: { runId: this.deps.request.runId, key: "", prevKey: "", label: `parallel#${index}`, error: failure.message, startedAt: 0, endedAt: Date.now(), cached: false } }); return null; } finally { release(); }
  }
  async guardAbortOrFreeze(): Promise<void> { if (this.deps.request.abortController.signal.aborted) await new Promise(() => undefined); }
  async guardCap(): Promise<void> { if (this.agentTotal >= Constants.MAX_AGENTS_PER_RUN) throw new WorkflowAgentCapError(Constants.MAX_AGENTS_PER_RUN); this.agentTotal++; }
  assertItems(items: any, label: string): asserts items is Array<() => any> { if (!Array.isArray(items)) throw new WorkflowSandboxError(`${label}(items): items must be an array.`); if (items.length === 0) return; if (items.length > Constants.MAX_BATCH_SIZE) throw new WorkflowSandboxError(`${label}: too many items (${items.length}); max is ${Constants.MAX_BATCH_SIZE}.`); for (let index = 0; index < items.length; index++) if (typeof items[index] !== "function") throw new WorkflowSandboxError(`${label}: items[${index}] must be a function returning a Promise.`); }
  markFinished(record: WorkflowAgentRecord, result: WorkflowSubagentResult): void { record.endedAt = Date.now(); record.tokens = result.tokens; record.sessionId = result.sessionId; const preview = WorkflowExecution.previewOf(this.unpackResult(result)); if (preview !== undefined) record.resultPreview = preview; if (typeof result.toolCallCount === "number") record.toolCallCount = result.toolCallCount; if (result.lastToolCalls && result.lastToolCalls.length > 0) { record.lastToolCalls = result.lastToolCalls; const last = result.lastToolCalls.at(-1)?.at; if (typeof last === "number") record.idleSinceMs = last; } if (result.tokens) this.totalTokens += result.tokens; this.recordAgentSnapshot(record); this.deps.emitter.emit({ kind: "workflow_agent_finished", runId: this.deps.request.runId, agent: record }); this.agentCompleted++; }
  unpackResult(result: WorkflowSubagentResult): unknown { return result.structured !== undefined ? result.structured : result.text; }
  abort(reason: string): void { if (!this.deps.request.abortController.signal.aborted) this.deps.request.abortController.abort(new WorkflowAbortedError(reason)); this.semaphore.drain(); }
  static previewOf(value: unknown): string | undefined { if (value == null) return; const text = typeof value === "string" ? reflowJsonString(stripJsonFence(value)) : safeStringify(value), max = WorkflowExecution.RESULT_PREVIEW_MAX; return text.length <= max ? text : text.slice(0, max) + `\n\n[truncated · ${text.length - max} bytes omitted]`; }
}
export function isFatalWorkflowError(error: unknown): boolean { return error instanceof WorkflowBudgetExceededError || error instanceof WorkflowAgentCapError || error instanceof WorkflowAbortedError; }
export { NestedWorkflowRunner } from "./nested-workflow-runner.js";

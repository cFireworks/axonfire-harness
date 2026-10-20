import { randomUUID } from "node:crypto";
import { join } from "node:path";
import { WorkflowSourceResolver, type WorkflowSourceInput } from "../workflow/workflow-source-resolver.js";
import { WorkflowParser } from "../workflow/workflow-parser.js";
import { WorkflowCompiler } from "../workflow/workflow-compiler.js";
import { WorkflowProgressEmitter } from "../workflow/workflow-progress-emitter.js";
import { WorkflowRuntimePrelude } from "../workflow/workflow-runtime-prelude.js";
import { WorkflowBudgetFactory, WorkflowCacheKeyHasher, WorkflowJournalFactory, WorkflowRecordWriter } from "../workflow/workflow-durability.js";
import { WorkflowExecutionFactory } from "../workflow/workflow-execution-factory.js";
import { WorkflowRunner, type WorkflowRunOptions } from "../workflow/workflow-runner.js";
import { WorkflowRegistry } from "../workflow/workflow-registry.js";
import type { WorkflowExecution } from "../workflow/workflow-execution.js";
import type { HarnessSession } from "../sessions/session.js";
import { WorkflowManager } from "../workflow/workflow-manager.js";
import { StaticBuiltinWorkflowProvider } from "../workflow/builtin-workflow-provider.js";
import { WorkflowAcpBridge, WorkflowPrintModeHandler, type WorkflowEventWriter, type WorkflowAcpAgentManager } from "../workflow/workflow-presentation.js";
import type { WorkflowLog, WorkflowRunRequest, WorkflowRunRecord, WorkflowSpawner } from "../workflow/workflow-types.js";
/** Explicit standalone embedding of recovered classes; not product UI or a secure VM. */
export class StandaloneWorkflowRuntime {
  readonly parser = new WorkflowParser(); readonly compiler = new WorkflowCompiler(); readonly prelude = new WorkflowRuntimePrelude(); readonly emitter = new WorkflowProgressEmitter(); readonly hasher = new WorkflowCacheKeyHasher(); readonly budgets = new WorkflowBudgetFactory();
  readonly registry: WorkflowRegistry; readonly resolver: WorkflowSourceResolver; readonly journals: WorkflowJournalFactory; readonly records: WorkflowRecordWriter; readonly factory: WorkflowExecutionFactory; readonly runner: WorkflowRunner;
  readonly manager: WorkflowManager;
  readonly acpBridge: WorkflowAcpBridge | undefined;
  readonly printHandler: WorkflowPrintModeHandler | undefined;
  private readonly snapshots = new Set<Promise<void>>();
  private readonly active = new Map<WorkflowRunRequest, Promise<WorkflowRunRecord>>(); private closed = false;
  constructor(readonly options: { stateDir: string; cwd(): string; parentSessionId: string; spawner: WorkflowSpawner; logger?: WorkflowLog; getCurrentSession?(): HarnessSession | undefined; refreshCommands?(): Promise<void>; builtinDir?: string; eventWriter?: WorkflowEventWriter; getAcpAgentManager?(): WorkflowAcpAgentManager }) {
    this.registry = new WorkflowRegistry({ cwd: options.cwd, userDir: () => join(options.stateDir, "workflows") }, options.logger, options.builtinDir ? new StaticBuiltinWorkflowProvider(() => options.builtinDir!) : undefined);
    this.resolver = new WorkflowSourceResolver(this.registry, options.cwd);
    const directory = (session: string, run: string) => join(options.stateDir, "sessions", session, "subagents", "workflows", `wf_${run}`);
    this.journals = new WorkflowJournalFactory((session, run) => join(directory(session, run), "journal.jsonl"), options.logger);
    this.records = new WorkflowRecordWriter((session, run) => join(options.stateDir, "sessions", session, "workflows", `wf_${run}.json`), options.logger);
    this.factory = new WorkflowExecutionFactory(options.spawner, this.emitter, this.hasher, this.journals, this.budgets);
    this.runner = new WorkflowRunner(this.factory, this.prelude, this.emitter, this.records, options.logger, this.registry, this.parser, this.compiler);
    const scriptsDir = (session: string) => join(options.stateDir, "sessions", session, "workflows", "scripts");
    this.manager = new WorkflowManager(this.resolver, this.parser, this.compiler, { run: (request, config) => this.run(request, config) }, options.spawner, this.emitter,
      { scriptsDir, snapshotPath: (session, name, run) => join(scriptsDir(session), `${name}-wf_${run}.js`), userDir: () => join(options.stateDir, "workflows"), cwd: options.cwd },
      { ...(options.getCurrentSession ? { getCurrentSession: options.getCurrentSession } : {}), invalidateRegistry: () => this.registry.invalidate(), ...(options.refreshCommands ? { refreshCommands: options.refreshCommands } : {}) }, options.logger);
    // Native manager intentionally fires snapshot writes without awaiting them.
    // Only independent host shutdown adds an ownership/flush barrier.
    const snapshot = this.manager.persistScriptSnapshot.bind(this.manager);
    this.manager.persistScriptSnapshot = (...args) => { const operation = snapshot(...args); this.snapshots.add(operation); void operation.finally(() => this.snapshots.delete(operation)).catch(() => undefined); return operation; };
    // Explicit embedding options replace absent product lifecycle/DI only.
    if (options.eventWriter) { this.printHandler = new WorkflowPrintModeHandler(this.emitter, options.logger); this.printHandler.setWriter(options.eventWriter); this.printHandler.install(); }
    if (options.getAcpAgentManager) { this.acpBridge = new WorkflowAcpBridge(this.emitter, { getCurrent: () => options.getCurrentSession?.() }, options.getAcpAgentManager, options.logger); this.acpBridge.install(); }
  }
  async prepare(input: WorkflowSourceInput, options: { args?: unknown; runId?: string; resumeFromRunId?: string; abortController?: AbortController } = {}): Promise<WorkflowRunRequest> {
    if (this.closed) throw new Error("Workflow runtime is closed");
    // Adapter validates IDs before native injected path composition; core does
    // not acquire a new authorization policy or silently sanitize script text.
    for (const id of [options.runId, options.resumeFromRunId, this.options.parentSessionId]) if (id !== undefined && !/^[a-zA-Z0-9_-]+$/.test(id)) throw new Error("Unsafe Workflow run/session ID");
    const source = await this.resolver.resolve(input), parsed = this.parser.parse(source), compiled = this.compiler.compile(parsed);
    return { runId: options.runId ?? randomUUID(), source, parsed, compiled, abortController: options.abortController ?? new AbortController(), parentSessionId: this.options.parentSessionId, ...(options.args !== undefined ? { args: options.args } : {}), ...(options.resumeFromRunId ? { resumeFromRunId: options.resumeFromRunId } : {}) };
  }
  run(request: WorkflowRunRequest, options?: WorkflowRunOptions): Promise<WorkflowRunRecord> { if (this.closed) return Promise.reject(new Error("Workflow runtime is closed")); const operation = this.runner.run(request, options); this.active.set(request, operation); void operation.finally(() => { if (this.active.get(request) === operation) this.active.delete(request); }).catch(() => undefined); return operation; }
  async close(): Promise<void> { this.closed = true; const managed = [...this.manager.active.values()].map((entry) => entry.done); for (const request of this.active.keys()) request.abortController.abort(); await Promise.allSettled([...this.active.values(), ...managed]); await Promise.allSettled(this.snapshots); this.emitter.cancelPending(); this.acpBridge?.dispose(); this.printHandler?.dispose(); }
}

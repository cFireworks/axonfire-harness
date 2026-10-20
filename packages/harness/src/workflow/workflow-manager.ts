import { randomUUID, createHash } from "node:crypto";
import { access, copyFile, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { WorkflowError } from "./workflow-errors.js";
import { PauseGate } from "./pause-gate.js";
import { WorkflowSubagentSpawner } from "./workflow-subagent-spawner.js";
import type { WorkflowExecution } from "./workflow-execution.js";
import type { WorkflowParser } from "./workflow-parser.js";
import type { WorkflowCompiler } from "./workflow-compiler.js";
import type { WorkflowRunner } from "./workflow-runner.js";
import type { WorkflowSourceResolver, WorkflowSourceInput } from "./workflow-source-resolver.js";
import type { WorkflowProgressEmitter } from "./workflow-progress-emitter.js";
import type { HarnessSession } from "../sessions/session.js";
import type { WorkflowLog, WorkflowMeta, WorkflowRunRecord, WorkflowRunRequest, WorkflowSource, WorkflowPhaseRecord, WorkflowAgentRecord } from "./workflow-types.js";
export type WorkflowStartInput = WorkflowSourceInput & { args?: unknown; resumeFromRunId?: string };
export type WorkflowManagedRecord = WorkflowRunRecord & { description?: string | undefined; tokens?: number; sessionId?: string; paused?: boolean; agentInFlightCount?: number; scriptPath?: string };
export type WorkflowRunDetail = { record: WorkflowManagedRecord; phases: WorkflowPhaseRecord[]; agents: WorkflowAgentRecord[] };
export type WorkflowActiveRun = { record: WorkflowManagedRecord; abortController: AbortController; done: Promise<WorkflowManagedRecord> | undefined; pauseGate: PauseGate; execution?: WorkflowExecution };
export type WorkflowManagerPaths = { scriptsDir(sessionId: string): string; snapshotPath(sessionId: string, name: string, runId: string): string; userDir(): string; cwd(): string };
/** Native 8903785..8910018. Constructor/callbacks replace product DI/PathUtils;
 * current-session lookup, async snapshot races and in-memory recent retention
 * deliberately follow the sample rather than a redesigned scheduler. */
export class WorkflowManager {
  static SAFE_NAME_RE = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/;
  readonly active = new Map<string, WorkflowActiveRun>();
  readonly recent: Array<{ record: WorkflowManagedRecord; detail: WorkflowRunDetail }> = [];
  constructor(readonly resolver: WorkflowSourceResolver, readonly parser: WorkflowParser, readonly compiler: WorkflowCompiler, readonly runner: Pick<WorkflowRunner, "run">, readonly spawner: unknown, readonly progressEmitter: WorkflowProgressEmitter,
    readonly paths: WorkflowManagerPaths, readonly host: { getCurrentSession?(): HarnessSession | undefined; invalidateRegistry?(): void; refreshCommands?(): Promise<void> } = {}, readonly logger: WorkflowLog = {}) {}
  async start(input: WorkflowStartInput, context: { sessionId: string; cwd: string; parentAbortSignal?: AbortSignal }): Promise<{ runId: string; record: WorkflowManagedRecord; done: Promise<WorkflowManagedRecord> }> {
    const source = await this.resolver.resolve(input), parsed = this.parser.parse(source), compiled = this.compiler.compile(parsed), session = this.resolveSession(context.sessionId);
    if (session && this.spawner instanceof WorkflowSubagentSpawner) this.spawner.setMainSession(session);
    const runId = randomUUID(), abortController = new AbortController(); if (context.parentAbortSignal) { if (context.parentAbortSignal.aborted) abortController.abort(); else context.parentAbortSignal.addEventListener("abort", () => abortController.abort(), { once: true }); }
    const request: WorkflowRunRequest = { runId, source, parsed, compiled, args: input.args, abortController, parentSessionId: context.sessionId, ...(input.resumeFromRunId !== undefined ? { resumeFromRunId: input.resumeFromRunId } : {}) };
    void this.persistScriptSnapshot(context.sessionId, runId, source).catch((error) => this.logger.warn?.(`[Workflow] script snapshot failed for ${runId}: ${error.message}`));
    const record: WorkflowManagedRecord = { runId, name: source.name, description: this.deriveDescription(parsed.meta, input.args, source.text), contentHash: source.provenance.contentHash, startedAt: Date.now(), status: "running", phaseCount: 0, agentCount: 0, cachedAgentCount: 0, tokens: 0, sessionId: context.sessionId }, pauseGate = new PauseGate(), entry: WorkflowActiveRun = { record, abortController, done: undefined, pauseGate }; this.active.set(runId, entry);
    const done = this.runner.run(request, { initialRecord: record, onExecutionReady: (execution) => { entry.execution = execution; }, pauseGate }).then((result) => { this.finalizeRun(runId, result, entry.execution); return result; }).catch((error) => { const failure = { ...record, status: error instanceof WorkflowError && (error as WorkflowError & { errorCode?: number }).errorCode === 5 ? "aborted" : "failed", error: error instanceof Error ? error.message : String(error), endedAt: Date.now() }; this.finalizeRun(runId, failure, entry.execution); return failure; });
    entry.done = done; return { runId, record, done };
  }
  attachExecution(runId: string, execution: WorkflowExecution): void { const entry = this.active.get(runId); if (entry) entry.execution = execution; }
  syncProgress(runId: string): void { const entry = this.active.get(runId); if (!entry?.execution) return; const execution = entry.execution; entry.record.agentCount = execution.totalAgentsSpawned; entry.record.cachedAgentCount = execution.totalAgentsCached; entry.record.agentInFlightCount = execution.totalAgentsInFlight; entry.record.phaseCount = execution.totalPhases; entry.record.tokens = execution.totalTokensSpent; }
  abort(runId: string, reason = "user-abort"): boolean { const entry = this.active.get(runId); if (!entry) return false; entry.abortController.abort(reason); return true; }
  pause(runId: string): boolean { const entry = this.active.get(runId); if (!entry) return false; const paused = entry.pauseGate.pause(); if (paused) entry.record.paused = true; return paused; }
  resume(runId: string): boolean { const entry = this.active.get(runId); if (!entry) return false; const resumed = entry.pauseGate.resume(); if (resumed) entry.record.paused = false; return resumed; }
  abortAgent(runId: string, key: string): boolean { const entry = this.active.get(runId); return !!entry?.execution && entry.execution.abortAgent(key, "user-skip"); }
  restartAgent(runId: string, key: string): boolean { const entry = this.active.get(runId); if (!entry?.execution) return false; const aborted = entry.execution.abortAgent(key, "user-restart"); entry.execution.markAgentInvalidated(key, "user-restart"); return aborted || true; }
  listActive(): WorkflowManagedRecord[] { for (const id of this.active.keys()) this.syncProgress(id); return [...this.active.values()].map((entry) => entry.record).sort((a, b) => b.startedAt - a.startedAt); }
  listRecent(limit = 50): WorkflowManagedRecord[] { for (const id of this.active.keys()) this.syncProgress(id); const result: WorkflowManagedRecord[] = []; for (const entry of [...this.active.values()].sort((a, b) => b.record.startedAt - a.record.startedAt)) result.push(entry.record); for (let index = this.recent.length - 1; index >= 0; index--) result.push(this.recent[index]!.record); return result.slice(0, limit); }
  async getRunDetail(_sessionId: string, runId: string): Promise<WorkflowRunDetail | undefined> { const entry = this.active.get(runId); if (entry?.execution) return this.buildDetailFromExecution(entry.record, entry.execution); const recent = this.recent.find((item) => item.record.runId === runId); return recent?.detail ? recent.detail : recent ? { record: recent.record, phases: [], agents: [] } : undefined; }
  snapshotPath(sessionId: string, runId: string): string { const active = this.active.get(runId)?.record.scriptPath; if (active) return active; const recent = this.recent.find((item) => item.record.runId === runId)?.record.scriptPath; return recent || this.paths.scriptsDir(sessionId); }
  async saveAs(sessionId: string, runId: string, name: string, scope: string): Promise<{ targetPath: string }> { if (!WorkflowManager.SAFE_NAME_RE.test(name)) throw new Error(`Invalid workflow name "${name}". Use [a-zA-Z0-9_-], 1–64 chars.`); const snapshot = this.snapshotPath(sessionId, runId); try { await access(snapshot); } catch { throw new Error(`No script snapshot for run \`${runId}\`. The run may not have started or has been pruned.`); } const directory = scope === "user" ? this.paths.userDir() : join(this.paths.cwd(), ".codebuddy", "workflows"), targetPath = join(directory, `${name}.js`); await mkdir(dirname(targetPath), { recursive: true, mode: 0o755 }); await copyFile(snapshot, targetPath); this.invalidateRegistry(); await this.refreshCommands(); return { targetPath }; }
  invalidateRegistry(): void { try { this.host.invalidateRegistry?.(); } catch {} }
  async refreshCommands(): Promise<void> { try { await this.host.refreshCommands?.(); } catch (error) { this.logger.warn?.(`[WorkflowManager] commandManager.refresh failed (saved workflow won't appear in / suggestions until next /reload): ${(error as Error).message}`); } }
  resolveSession(_sessionId: string): HarnessSession | undefined { try { return this.host.getCurrentSession?.(); } catch { return; } }
  async persistScriptSnapshot(sessionId: string, runId: string, source: WorkflowSource): Promise<void> { const directory = this.paths.scriptsDir(sessionId); await mkdir(directory, { recursive: true, mode: 0o700 }); const existing = await this.findExistingScriptByHash(directory, source.name, source.provenance.contentHash), snapshot = existing ?? this.paths.snapshotPath(sessionId, source.name, runId); if (!existing) await writeFile(snapshot, source.text, { mode: 0o600, encoding: "utf8" }); const active = this.active.get(runId); if (active) active.record.scriptPath = snapshot; }
  async findExistingScriptByHash(directory: string, name: string, hash: string): Promise<string | undefined> { let files; try { files = await readdir(directory); } catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return; throw error; } const prefix = `${name}-wf_`; for (const filename of files.filter((file) => file.startsWith(prefix) && file.endsWith(".js"))) { const path = `${directory}/${filename}`; try { const text = await readFile(path, "utf8"); if (await this.sha256(text) === hash) return path; } catch { continue; } } }
  async sha256(text: string): Promise<string> { return createHash("sha256").update(text, "utf8").digest("hex"); }
  finalizeRun(runId: string, record: WorkflowManagedRecord, execution?: WorkflowExecution): void { record.agentInFlightCount = 0; const detail = execution ? this.buildDetailFromExecution(record, execution) : { record, phases: [], agents: [] }; this.active.delete(runId); this.recent.push({ record, detail }); while (this.recent.length > 50) this.recent.shift(); execution?.dispose(); try { this.progressEmitter.cancelPending?.(); } catch {} this.progressEmitter.emit({ kind: "workflow_run_finished", record }); }
  buildDetailFromExecution(record: WorkflowManagedRecord, execution: WorkflowExecution): WorkflowRunDetail { return { record, phases: execution.snapshotPhases().map((phase) => ({ ...phase })), agents: execution.snapshotAgents().map((agent) => ({ ...agent })) }; }
  deriveDescription(meta: WorkflowMeta, args: unknown, _script: string): string | undefined { if (meta?.description && typeof meta.description === "string") return meta.description; if (typeof args === "string" && args.length > 0) return args.slice(0, 200); if (args && typeof args === "object" && args !== null) { const question = (args as any).question; if (typeof question === "string" && question.length > 0) return question.slice(0, 200); } }
}

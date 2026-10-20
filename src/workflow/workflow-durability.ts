import { createHash } from "node:crypto";
import { appendFile, mkdir, open, readFile, rename, unlink, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { WorkflowBudgetExceededError } from "./workflow-errors.js";
import type { WorkflowSubagentSpec, WorkflowSubagentResult } from "./subagent-types.js";
import type { WorkflowCacheHit, WorkflowDurability } from "./workflow-execution.js";
import type { WorkflowLog, WorkflowRunRecord } from "./workflow-types.js";
export function stableSerialize(value: unknown): string { return JSON.stringify(value, (_key, item) => { if (item && typeof item === "object" && !Array.isArray(item)) { const sorted: Record<string, unknown> = {}; for (const key of Object.keys(item).sort()) sorted[key] = item[key]; return sorted; } return item; }); }
export class WorkflowCacheKeyHasher {
  next(previous: string, spec: WorkflowSubagentSpec): string { return "v2:" + createHash("sha256").update(previous || "", "utf8").update("|", "utf8").update(stableSerialize(this.pickKeyFields(spec)), "utf8").digest("hex"); }
  pickKeyFields(spec: WorkflowSubagentSpec): Record<string, unknown> { const result: Record<string, unknown> = {}; for (const key of ["prompt", "agentType", "model", "isolation", "schema", "maxTurns"] as const) { const value = spec[key]; if (value !== undefined) result[key] = value; } return result; }
}
/** Native reserve checks but does not earmark tokens. Unbounded runs leave
 * spent() at zero; concurrent reservations can exceed the final budget. */
export class WorkflowBudgetImpl {
  private spentTokens = 0;
  constructor(readonly total?: number) {}
  spent(): number { return this.spentTokens; }
  remaining(): number { return this.total === undefined ? Infinity : Math.max(0, this.total - this.spentTokens); }
  reserve(tokens: number): void { if (this.total === undefined) return; const needed = Math.max(0, Number.isFinite(tokens) ? tokens : 0); if (this.spentTokens + needed > this.total) throw new WorkflowBudgetExceededError(this.total, this.spentTokens, needed); }
  deduct(tokens?: number): void { if (this.total === undefined || !Number.isFinite(tokens) || (tokens as number) <= 0) return; this.spentTokens += tokens as number; }
}
export class WorkflowBudgetFactory { create(total?: number): WorkflowBudgetImpl { return new WorkflowBudgetImpl(total); } }
export type WorkflowJournalEvent = { type: string; runId: string; [key: string]: any };
export type WorkflowJournalSnapshot = { runId: string; started: Map<string, any>; results: Map<string, any> };
export interface WorkflowJournal { readonly runId: string; record(event: WorkflowJournalEvent): void; close(): Promise<void> }
export class FileJournal implements WorkflowJournal {
  private writeChain = Promise.resolve(); private closed = false;
  constructor(readonly journalPath: string, readonly runId: string, readonly logger: WorkflowLog = {}) {}
  record(event: WorkflowJournalEvent): void { if (this.closed) return; const line = JSON.stringify(event) + "\n"; this.writeChain = this.writeChain.then(() => appendFile(this.journalPath, line, { mode: 0o600, encoding: "utf8" })).catch((error) => { this.logger.warn?.(`[WorkflowJournal] append failed for run ${this.runId}: ${error.message}`); }); }
  async close(): Promise<void> { this.closed = true; await this.writeChain; }
}
/** PathUtils is injected; file/journal protocol remains native. */
export class WorkflowJournalFactory {
  constructor(readonly journalPath: (sessionId: string, runId: string) => string, readonly logger: WorkflowLog = {}) {}
  async create(sessionId: string, runId: string): Promise<FileJournal> { const path = this.journalPath(sessionId, runId); await mkdir(dirname(path), { recursive: true, mode: 0o700 }); try { const file = await open(path, "a", 0o600); await file.close(); } catch (error) { this.logger.warn?.(`[WorkflowJournal] could not pre-create ${path}: ${(error as Error).message}`); } return new FileJournal(path, runId, this.logger); }
  async load(sessionId: string, runId: string): Promise<WorkflowJournalSnapshot | undefined> { const path = this.journalPath(sessionId, runId), content = await this.tryReadFile(path); if (content !== undefined) return parseSnapshot(runId, content, this.logger); }
  async tryReadFile(path: string): Promise<string | undefined> { try { return await readFile(path, "utf8"); } catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return; throw error; } }
}
export function parseSnapshot(runId: string, text: string, logger: WorkflowLog = {}): WorkflowJournalSnapshot { const snapshot: WorkflowJournalSnapshot = { runId, started: new Map(), results: new Map() }, lines = text.split("\n"); for (let index = 0; index < lines.length; index++) { const line = lines[index]!.trim(); if (!line) continue; let event; try { event = JSON.parse(line); } catch { logger.warn?.(`[WorkflowJournal] skip malformed line ${index + 1} in run ${runId}`); continue; } switch (event.type) { case "agent_started": snapshot.started.set(event.key, event); break; case "agent_finished": snapshot.results.set(event.key, event); break; case "agent_invalidated": snapshot.results.delete(event.key); } } return snapshot; }
export class WorkflowRecordWriter {
  private tmpCounter = 0;
  constructor(readonly recordPath: (sessionId: string, runId: string) => string, readonly logger: WorkflowLog = {}) {}
  async write(sessionId: string, record: WorkflowRunRecord): Promise<void> { const path = this.recordPath(sessionId, record.runId), temp = `${path}.${process.pid}.${this.tmpCounter++}.tmp`; try { await mkdir(dirname(path), { recursive: true, mode: 0o700 }); const text = JSON.stringify(record, null, 2); await writeFile(temp, text, { mode: 0o600, encoding: "utf8" }); await rename(temp, path); } catch (error) { this.logger.warn?.(`[WorkflowRecordWriter] write failed for run ${record.runId}: ${(error as Error).message}`); await unlink(temp).catch(() => undefined); } }
}
export class WorkflowCallDurability implements WorkflowDurability {
  private prevKey = "";
  constructor(readonly hasher: WorkflowCacheKeyHasher, readonly budget: WorkflowBudgetImpl, readonly journal: WorkflowJournal, readonly resumeSnapshot?: WorkflowJournalSnapshot) {}
  beforeSpawn(spec: WorkflowSubagentSpec, label?: string, phase?: string): { key: string; prevKey: string; cached?: WorkflowCacheHit } { const previous = this.prevKey, key = this.hasher.next(previous, spec); this.prevKey = key; const cached = this.resumeSnapshot?.results.get(key); if (cached && cached.error === undefined) return { key, prevKey: previous, cached: { value: cached.result, finishedRecord: { endedAt: cached.endedAt, ...(cached.tokens !== undefined ? { tokens: cached.tokens } : {}), ...(cached.sessionId !== undefined ? { sessionId: cached.sessionId } : {}), result: cached.result }, key } }; this.budget.reserve((spec.maxTurns ?? 1) * 4000); this.journal.record({ type: "agent_started", runId: this.journal.runId, key, prevKey: previous, ...(label !== undefined ? { label } : {}), ...(phase !== undefined ? { phase } : {}), startedAt: Date.now() }); return { key, prevKey: previous }; }
  afterSpawnSuccess(key: string, result: WorkflowSubagentResult): void { this.budget.deduct(result.tokens); this.journal.record({ type: "agent_finished", runId: this.journal.runId, key, ...(result.tokens !== undefined ? { tokens: result.tokens } : {}), sessionId: result.sessionId, result: result.structured !== undefined ? result.structured : result.text, endedAt: Date.now() }); }
  afterSpawnFailure(key: string, error: unknown): void { this.journal.record({ type: "agent_finished", runId: this.journal.runId, key, error: (error as any)?.message ?? String(error), endedAt: Date.now() }); }
  markAgentInvalidated(key: string, reason: string): void { this.journal.record({ type: "agent_invalidated", runId: this.journal.runId, key, reason, at: Date.now() }); }
  recordRunStarted(name: string, contentHash: string): void { this.journal.record({ type: "run_started", runId: this.journal.runId, name, contentHash, startedAt: Date.now() }); }
  recordRunFinished(status: string, output?: unknown, error?: string): void { this.journal.record({ type: "run_finished", runId: this.journal.runId, status, endedAt: Date.now(), ...(output !== undefined ? { output } : {}), ...(error !== undefined ? { error } : {}) }); }
  async close(): Promise<void> { try { await this.journal.close(); } catch {} }
}

import { EventEmitter } from "node:events";
import { WorkflowConcurrencyConstants as Constants } from "./subagent-types.js";
const EVENT = "workflow-progress";
export class WorkflowProgressEmitter {
  private readonly bus = new EventEmitter();
  private pending: any[] = []; private flushTimer: ReturnType<typeof setTimeout> | null = null;
  constructor() { this.bus.setMaxListeners(64); }
  emit(event: any): void { if (this.isCriticalEvent(event)) this.dispatch(event); else { this.pending.push(event); this.scheduleFlush(); } }
  on(listener: (event: any) => void): () => void { this.bus.on(EVENT, listener); return () => this.bus.off(EVENT, listener); }
  flushNow(): void { if (this.flushTimer) { clearTimeout(this.flushTimer); this.flushTimer = null; } this.flushPending(); }
  cancelPending(): void { if (this.flushTimer) { clearTimeout(this.flushTimer); this.flushTimer = null; } this.pending.length = 0; }
  isCriticalEvent(event: any): boolean { return event.kind !== "workflow_agent_finished"; }
  scheduleFlush(): void { if (!this.flushTimer) this.flushTimer = setTimeout(() => { this.flushTimer = null; this.flushPending(); }, Constants.PROGRESS_DEBOUNCE_MS); }
  flushPending(): void { const pending = this.pending; this.pending = []; for (const event of pending) this.dispatch(event); }
  dispatch(event: any): void { try { this.bus.emit(EVENT, event); } catch {} }
}

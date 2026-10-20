import { EMPTY, type Observable } from "rxjs";
import { skip, mapTo } from "rxjs/operators/index.js";
import type { HarnessSession } from "./session.js";
import { deriveSessionRunLifecycle, isSessionRunStatusBusy, isSessionRunStatusIdle, isSessionRunStatusBusyForQueue, type SessionRunEvent, type SessionRunEventType, type SessionRunState, type SessionRunStatus } from "./run-state-types.js";
export type { SessionRunEvent } from "./run-state-types.js";
const activeEnd = { CANCEL_REQUESTED: "cancelling", AGENT_ENDED: "idle", RUN_FAILED: "idle", COMPACT_FAILED: "idle", FORCE_IDLE: "idle" } as const;
/** Native table at 11165469..11173010; absent transitions are ignored. */
export const SESSION_RUN_TRANSITIONS: Record<SessionRunStatus, Partial<Record<SessionRunEventType, SessionRunStatus>>> = {
  idle: { RUN_PREPARING: "preparing", RUN_SKIPPED: "idle", AGENT_ENDED: "idle", COMPACT_STARTED: "compacting", FORCE_IDLE: "idle" },
  preparing: { RUN_ACCEPTED: "pending", RUN_SKIPPED: "idle", AGENT_STARTED: "agent_running", CANCEL_REQUESTED: "cancelling", RUN_FAILED: "idle", COMPACT_FAILED: "idle", FORCE_IDLE: "idle" },
  pending: { AGENT_STARTED: "agent_running", MODEL_REQUEST_STARTED: "model_requesting", TOOL_STARTED: "tool_executing", RUN_SKIPPED: "idle", CANCEL_REQUESTED: "cancelling", RUN_FAILED: "idle", COMPACT_FAILED: "idle", FORCE_IDLE: "idle" },
  agent_running: { ...activeEnd, AGENT_HANDOFF: "agent_running", MODEL_REQUEST_STARTED: "model_requesting", MODEL_STREAM_STARTED: "model_streaming", MODEL_RESPONSE_DONE: "model_done", TOOL_STARTED: "tool_executing", WAITING_FOR_PERMISSION: "waiting_for_permission", WAITING_FOR_USER: "waiting_for_user", RETRYING: "retrying", COMPACT_STARTED: "compacting" },
  model_requesting: { ...activeEnd, MODEL_STREAM_STARTED: "model_streaming", MODEL_RESPONSE_DONE: "model_done", TOOL_STARTED: "tool_executing", RETRYING: "retrying" },
  model_streaming: { ...activeEnd, MODEL_STREAM_STARTED: "model_streaming", MODEL_RESPONSE_DONE: "model_done", TOOL_STARTED: "tool_executing", RETRYING: "retrying" },
  model_done: { ...activeEnd, MODEL_REQUEST_STARTED: "model_requesting", TOOL_STARTED: "tool_executing", WAITING_FOR_PERMISSION: "waiting_for_permission", WAITING_FOR_USER: "waiting_for_user", RETRYING: "retrying" },
  tool_executing: { ...activeEnd, TOOL_ENDED: "agent_running", WAITING_FOR_PERMISSION: "waiting_for_permission", WAITING_FOR_USER: "waiting_for_user", RETRYING: "retrying" },
  waiting_for_permission: { ...activeEnd, TOOL_STARTED: "tool_executing", TOOL_ENDED: "agent_running", RETRYING: "retrying" },
  waiting_for_user: { ...activeEnd, MODEL_REQUEST_STARTED: "model_requesting", RETRYING: "retrying" },
  retrying: { ...activeEnd, AGENT_STARTED: "agent_running", MODEL_REQUEST_STARTED: "model_requesting", MODEL_STREAM_STARTED: "model_streaming" },
  compacting: { COMPACT_ENDED: "idle", COMPACT_FAILED: "idle", CANCEL_REQUESTED: "cancelling", RUN_FAILED: "idle", FORCE_IDLE: "idle" },
  cancelling: { AGENT_ENDED: "idle", RUN_FAILED: "idle", COMPACT_FAILED: "idle", FORCE_IDLE: "idle" },
};
export type LegacySessionRunEvent = "run_preparing" | "run_accepted" | "run_skipped" | "run_failed" | "model_request_started" | "model_streaming" | "model_done" | "tool_started" | "tool_ended" | "permission_wait" | "user_wait" | "retrying" | "compact_started" | "compact_ended" | "cancelling" | "run_completed";
const LEGACY: Record<LegacySessionRunEvent, SessionRunEventType> = { run_preparing: "RUN_PREPARING", run_accepted: "RUN_ACCEPTED", run_skipped: "RUN_SKIPPED", run_failed: "RUN_FAILED", model_request_started: "MODEL_REQUEST_STARTED", model_streaming: "MODEL_STREAM_STARTED", model_done: "MODEL_RESPONSE_DONE", tool_started: "TOOL_STARTED", tool_ended: "TOOL_ENDED", permission_wait: "WAITING_FOR_PERMISSION", user_wait: "WAITING_FOR_USER", retrying: "RETRYING", compact_started: "COMPACT_STARTED", compact_ended: "COMPACT_ENDED", cancelling: "CANCEL_REQUESTED", run_completed: "AGENT_ENDED" };
type Effects = { emitPhase?: boolean; emitAgentState?: boolean; legacyAgentState?: string; clearLegacyAgentState?: boolean };
export class SessionRunStateMachine {
  constructor(readonly logger?: { info?(message: string): void; warn?(message: string): void }) {}
  transition(session: HarnessSession, event: SessionRunEvent): SessionRunState;
  /** Compatibility for earlier callers: lowercase events return the status. */
  transition(session: HarnessSession, event: LegacySessionRunEvent): SessionRunStatus;
  transition(session: HarnessSession, input: SessionRunEvent | LegacySessionRunEvent): SessionRunState | SessionRunStatus {
    const event = typeof input === "string" ? { type: LEGACY[input] } : input, current = this.getSnapshot(session), next = SESSION_RUN_TRANSITIONS[current.status][event.type];
    if (!next) { this.logInvalidTransition(session, event, current); return typeof input === "string" ? current.status : current; }
    const result = this.apply(session, event, current.status, next, this.createSideEffects(event, next)); this.logTransition(session, event, current, result); return typeof input === "string" ? result.status : result;
  }
  getSnapshot(session: HarnessSession): SessionRunState { return session.runState ?? { status: "idle" }; }
  getLifecycle(session: HarnessSession) { return this.lifecycleFromStatus(this.getSnapshot(session).status); }
  isBusy(session: HarnessSession): boolean { return isSessionRunStatusBusy(this.getSnapshot(session).status); }
  isIdle(session: HarnessSession): boolean { return isSessionRunStatusIdle(this.getSnapshot(session).status); }
  isBusyForQueue(session: HarnessSession): boolean { return isSessionRunStatusBusyForQueue(this.getSnapshot(session).status); }
  forceIdle(session: HarnessSession, reason?: string): SessionRunState { return this.transition(session, { type: "FORCE_IDLE", reason }); }
  /** true skips the initial BehaviorSubject value, as in the target. */
  getChange$(session: HarnessSession, skipCurrent?: boolean): Observable<void> { return session.runStateSubject ? skipCurrent ? session.runStateSubject.pipe(skip(1), mapTo(undefined)) : session.runStateSubject.pipe(mapTo(undefined)) : EMPTY; }
  apply(session: HarnessSession, event: SessionRunEvent, from: SessionRunStatus, status: SessionRunStatus, effects: Effects = {}): SessionRunState {
    const at = Date.now(), state: SessionRunState = { status, lastTransition: { event: event.type, from, to: status, reason: event.reason, at } }; session.runState = state;
    if (effects.clearLegacyAgentState) { session.agentState = undefined; session.agentStateSubject?.next(undefined); } else if (effects.emitAgentState) { session.agentState = effects.legacyAgentState; session.agentStateSubject?.next(effects.legacyAgentState); }
    if (effects.emitPhase) session.phaseSubject?.next(this.projectAgentPhase(state, event, at)); return state;
  }
  createSideEffects(event: SessionRunEvent, next: SessionRunStatus): Effects {
    switch (event.type) { case "RUN_ACCEPTED": return { emitPhase: true, emitAgentState: true, legacyAgentState: "agent_pending" }; case "RUN_SKIPPED": return { emitPhase: true, clearLegacyAgentState: true }; case "AGENT_STARTED": return { emitAgentState: true, legacyAgentState: "agent_start" }; case "AGENT_ENDED": return { emitPhase: true, emitAgentState: true, legacyAgentState: "agent_end" }; case "TOOL_STARTED": return { emitPhase: true, emitAgentState: true, legacyAgentState: "agent_tool_start" }; case "TOOL_ENDED": return { emitAgentState: true, legacyAgentState: "agent_tool_end" }; case "AGENT_HANDOFF": return { emitAgentState: true, legacyAgentState: "agent_handoff" }; case "RUN_PREPARING": case "MODEL_REQUEST_STARTED": case "MODEL_STREAM_STARTED": case "MODEL_RESPONSE_DONE": case "WAITING_FOR_PERMISSION": case "WAITING_FOR_USER": case "RETRYING": return { emitPhase: true }; case "COMPACT_ENDED": return next === "idle" ? { emitPhase: true } : {}; case "COMPACT_FAILED": case "RUN_FAILED": case "FORCE_IDLE": return { emitPhase: true, emitAgentState: true, legacyAgentState: "agent_end" }; case "COMPACT_STARTED": case "CANCEL_REQUESTED": return {}; }
  }
  projectAgentPhase(state: SessionRunState, event: SessionRunEvent, at: number) { return { phase: this.phaseFromStatus(state.status), startedAt: at, ...this.phaseMetadataFromEvent(event) }; }
  phaseMetadataFromEvent(event: SessionRunEvent): Record<string, unknown> { switch (event.type) { case "TOOL_STARTED": case "TOOL_ENDED": case "WAITING_FOR_PERMISSION": case "WAITING_FOR_USER": return { toolName: event.toolName }; case "MODEL_STREAM_STARTED": return { streamingToolName: event.streamingToolName }; default: return {}; } }
  phaseFromStatus(status: SessionRunStatus): string | undefined { switch (status) { case "idle": case "agent_running": case "compacting": case "cancelling": return "idle"; case "pending": case "preparing": return "preparing"; case "model_requesting": case "model_streaming": case "model_done": case "tool_executing": case "waiting_for_permission": case "waiting_for_user": case "retrying": return status; } }
  lifecycleFromStatus(status: SessionRunStatus) { return deriveSessionRunLifecycle(status); }
  isQueueBusyStatus(status: SessionRunStatus): boolean { return isSessionRunStatusBusyForQueue(status); }
  formatLogFields(fields: Record<string, unknown>): string { return Object.entries(fields).filter(([, value]) => value !== undefined && value !== "").map(([key, value]) => `${key}=${String(value)}`).join(" | "); }
  getEventToolName(event: SessionRunEvent): string | undefined { return "toolName" in event ? event.toolName : undefined; }
  getEventStreamingToolName(event: SessionRunEvent): string | undefined { return "streamingToolName" in event ? event.streamingToolName : undefined; }
  logTransition(session: HarnessSession, event: SessionRunEvent, from: SessionRunState, to: SessionRunState): void { this.logger?.info?.(`[SessionRunStateMachine] transition | ${this.formatLogFields({ sessionId: session.id, event: event.type, from: from.status, to: to.status, lifecycle: this.lifecycleFromStatus(to.status), busy: to.status !== "idle", queueBusy: this.isQueueBusyStatus(to.status), elapsedSinceLastTransitionMs: from.lastTransition ? to.lastTransition!.at - from.lastTransition.at : undefined, reason: event.reason, toolName: this.getEventToolName(event), streamingToolName: this.getEventStreamingToolName(event) })}`); }
  logInvalidTransition(session: HarnessSession, event: SessionRunEvent, state: SessionRunState): void { this.logger?.warn?.(`[SessionRunStateMachine] ignored invalid transition | ${this.formatLogFields({ sessionId: session.id, event: event.type, current: state.status, lifecycle: this.lifecycleFromStatus(state.status), busy: state.status !== "idle", queueBusy: this.isQueueBusyStatus(state.status), previousEvent: state.lastTransition?.event, previousFrom: state.lastTransition?.from, previousTo: state.lastTransition?.to, reason: event.reason, toolName: this.getEventToolName(event), streamingToolName: this.getEventStreamingToolName(event) })}`); }
}

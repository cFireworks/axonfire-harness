import { user, type AgentInputItem } from "@openai/agents-core";
import type { HarnessSession } from "../sessions/session.js";
import type { SessionRunStateMachine } from "../sessions/run-state-machine.js";
import type { MessageQueueManager } from "../sessions/message-queue-manager.js";
import { TeamMailbox, formatTeammateMessage, type TeamMessage } from "./team-mailbox.js";
import type { TeamMemberRegistry } from "./team-member.js";
import type { ShutdownCoordinator } from "./shutdown-coordinator.js";
/** Original module singleton state is per composed harness here. */
export class TeamLeadInboxPoller {
  private stopPoller: (() => void) | undefined;
  private readonly paused = new WeakSet<HarnessSession>();
  private readonly borrowedPauseStates = new WeakMap<HarnessSession, { setLeadInboxPaused(session: HarnessSession, paused: boolean): void; isLeadInboxPaused(session: HarnessSession): boolean }>();
  constructor(readonly mailbox: TeamMailbox, readonly registry: TeamMemberRegistry, readonly shutdown: ShutdownCoordinator, readonly queue: MessageQueueManager, readonly stateMachine: SessionRunStateMachine,
    readonly runtime: { runInput(session: HarnessSession, input: AgentInputItem[]): Promise<void>; isDeferredDispatchEnabled(): boolean; richQueue?: { enqueueItem(sessionId: string, blocks: string[]): { items: Array<{ id?: string }> }; sendNow(sessionId: string, id: string): void }; dispatch?: { register(session: HarnessSession): void; unregister(id: string): void } }) {}
  stopTeamLeadPoller(): void { if (this.stopPoller) { this.stopPoller(); this.stopPoller = undefined; } }
  setLeadInboxPaused(session: HarnessSession, paused: boolean): void { const state = this.borrowedPauseStates.get(session); if (state) state.setLeadInboxPaused(session, paused); else if (paused) this.paused.add(session); else this.paused.delete(session); }
  isLeadInboxPaused(session: HarnessSession): boolean { return this.borrowedPauseStates.get(session)?.isLeadInboxPaused(session) ?? this.paused.has(session); }
  /** Explicit ownership bridge: use the original ACP module's WeakSet for this exact session while its View owns ingress. */
  borrowPauseState(session: HarnessSession, state: { setLeadInboxPaused(session: HarnessSession, paused: boolean): void; isLeadInboxPaused(session: HarnessSession): boolean }): () => void {
    if (this.borrowedPauseStates.has(session)) throw Error("Session already has a borrowed follow-up pause state");
    state.setLeadInboxPaused(session, this.paused.has(session)); this.borrowedPauseStates.set(session, state); let released = false;
    return () => { if (released) return; released = true; const paused = state.isLeadInboxPaused(session); this.borrowedPauseStates.delete(session); this.setLeadInboxPaused(session, paused); };
  }
  startTeamLeadInboxPolling(team: string, session: HarnessSession): void {
    if (this.stopPoller) return;
    let waking = false;
    const stop = this.mailbox.startPolling(team, "team-lead", async (messages: TeamMessage[]) => {
      if (this.isLeadInboxPaused(session)) throw new Error("lead inbox paused — messages deferred until next user prompt");
      const pending: TeamMessage[] = [];
      for (const message of messages) { let protocol: any; try { protocol = JSON.parse(message.text); } catch {} if (protocol?.type === "shutdown_response") { let fulfilled = false; try { if (protocol.request_id) fulfilled = this.shutdown.fulfillResponse(protocol.request_id, protocol.approve !== false, protocol.reason); } catch {} if (protocol.approve !== false) try { if (this.registry.get(message.from, team)) this.registry.remove(message.from, team); } catch {} if (fulfilled) continue; } pending.push(message); }
      if (!pending.length) return;
      const input = pending.map((message) => ({ ...user(formatTeammateMessage(message.from, message.summary || `Message from ${message.from}`, message.text)), providerData: { teammateMessage: { from: message.from, summary: message.summary, color: message.color, timestamp: message.timestamp } } })) as AgentInputItem[];
      if (this.stateMachine.isBusy(session) || waking) {
        if (this.runtime.isDeferredDispatchEnabled() && this.runtime.richQueue) { let lastId: string | undefined; for (const item of input as any[]) { const text = typeof item.content === "string" ? item.content : Array.isArray(item.content) ? item.content.filter((part: any) => part.type === "input_text" && typeof part.text === "string").map((part: any) => part.text).join("") : ""; if (!text) continue; const queue = this.runtime.richQueue.enqueueItem(session.id, [text]); lastId = queue.items.at(-1)?.id; } if (lastId) this.runtime.richQueue.sendNow(session.id, lastId); }
        else for (const item of input) this.queue.enqueueMessage(session, item);
      } else { waking = true; void (async () => { try { await this.runtime.runInput(session, input); } catch { try { await this.runtime.runInput(session, input); } catch {} } finally { waking = false; } })(); }
    }, 2000);
    try { this.runtime.dispatch?.register(session); } catch {}
    this.stopPoller = () => { try { stop(); } finally { this.runtime.dispatch?.unregister(session.id); } };
  }
}

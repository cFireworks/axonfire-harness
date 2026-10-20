import type { AgentInputItem } from "@openai/agents-core";
import type { AgentRunContext, AgentRunInterceptor } from "./agent-service.js";
import type { SessionRunStateMachine } from "../sessions/run-state-machine.js";
import { MessageQueueManager, isSkipRunItem, isQueueHoldItem, mergeConsecutiveUserMessages } from "../sessions/message-queue-manager.js";

export class MessageQueueAgentRunInterceptor implements AgentRunInterceptor {
  readonly priority = 1800;
  constructor(private readonly queue: MessageQueueManager, private readonly state: SessionRunStateMachine, private readonly deferred: () => boolean) {}
  async intercept(context: AgentRunContext): Promise<void> {
    const { session, input } = context;
    if (Array.isArray(input) && input.some((item: any) => item.type === "message" && item.role === "user" && typeof item.content === "string" && item.content.trim() === "/compact") || context.bypassMessageQueue || Array.isArray(input) && input.some(isSkipRunItem)) return;
    const busy = this.state.isBusyForQueue(session);
    if (busy && Array.isArray(input)) { for (const item of JSON.parse(JSON.stringify(input))) this.queue.enqueueMessage(session, item); context.skipRun = true; context.skipAddHistory = true; }
    else if (!busy && Array.isArray(input) && !input.length) {
      if (this.deferred()) { context.skipRun = true; return; }
      const queued = [...session.queue]; if (!queued.length) { this.queue.clearQueue(session); context.skipRun = true; return; }
      const regular = queued.filter((item) => !isQueueHoldItem(item)), held = queued.filter(isQueueHoldItem);
      const selected = regular.length ? regular : held.slice(0, 1), remaining = regular.length ? held : held.slice(1);
      this.queue.clearQueue(session); for (const item of remaining) this.queue.enqueueMessage(session, item); context.input = mergeConsecutiveUserMessages(selected);
    } else if (!busy && Array.isArray(input) && input.length) {
      if (this.deferred()) return;
      if (!input.some(isSkipRunItem)) { const queued = [...session.queue]; if (queued.length) { const regular = queued.filter((item) => !isQueueHoldItem(item)), held = queued.filter(isQueueHoldItem); this.queue.clearQueue(session); for (const item of held) this.queue.enqueueMessage(session, item); if (regular.length) context.input = mergeConsecutiveUserMessages([...regular, ...input] as AgentInputItem[]); } }
    }
  }
}

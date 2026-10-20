import { z } from "zod";
import type { RunContext } from "@openai/agents-core";
import type { HarnessSession } from "../sessions/session.js";
import type { TeamManager } from "../teams/team-manager.js";
import type { TeamMemberRegistry } from "../teams/team-member.js";
import type { TeamMailbox } from "../teams/team-mailbox.js";
import type { ShutdownCoordinator } from "../teams/shutdown-coordinator.js";
import type { TeamMemberInfo } from "../teams/team-types.js";
import type { ToolManager } from "./tool-manager.js";
export const SendMessageSchema = z.object({
  type: z.enum(["message", "broadcast", "shutdown_request", "shutdown_response", "plan_approval_response"]).describe('Message type: "message" for DMs, "broadcast" to all teammates, "shutdown_request" to request shutdown, "shutdown_response" to respond to shutdown, "plan_approval_response" to approve/reject plans'),
  recipient: z.string().optional().describe("Agent name of the recipient (required for message, shutdown_request, plan_approval_response)"), content: z.string().optional().describe("Message text, reason, or feedback"),
  summary: z.string().optional().describe("A 5-10 word summary of the message, shown as a preview in the UI (required for message, broadcast)"), request_id: z.string().optional().describe("Request ID to respond to (required for shutdown_response, plan_approval_response)"),
  approve: z.boolean().optional().describe("Whether to approve the request (required for shutdown_response, plan_approval_response)"),
});
export type SendMessageInput = z.infer<typeof SendMessageSchema>;
export class SendMessageTool {
  constructor(readonly manager: TeamManager, readonly mailbox: TeamMailbox, readonly registry: TeamMemberRegistry, readonly shutdown?: ShutdownCoordinator) {}
  toAutoClassifierInput(input?: Partial<SendMessageInput>): string {
    const { type, recipient, content, approve } = input ?? {};
    switch (type) { case "message": { const target = recipient ? `to ${recipient}` : "to (unspecified)"; return content ? `${target}: ${content}` : target; } case "broadcast": return content ? `broadcast: ${content}` : "broadcast"; case "shutdown_request": return `shutdown request${recipient ? ` to ${recipient}` : ""}${content ? `: ${content}` : ""}`; case "shutdown_response": return `shutdown response: ${approve ? "approve" : "reject"}${content ? ` (${content})` : ""}`; case "plan_approval_response": return `plan approval response${recipient ? ` to ${recipient}` : ""}: ${approve ? "approve" : "reject"}${content ? ` (${content})` : ""}`; default: return content ?? ""; }
  }
  async execute(input: SendMessageInput, context?: RunContext<HarnessSession>): Promise<any> {
    if (!context?.context) throw new Error("Session is required"); const session = context.context, teamContext = session.meta?.teamContext as { memberName?: string; teamName: string } | undefined;
    let team: string, sender: string, color: string | undefined;
    if (teamContext?.memberName) { team = teamContext.teamName; sender = teamContext.memberName; color = this.manager.getMember(sender)?.color; if (!color) color = this.registry.get(sender, team)?.info.color; }
    else { if (!this.manager.isInTeam()) return { content: "Not in a team. SendMessage is only available when you are in a team or have background agents running." }; const configuration = this.manager.getTeam()!; if (session.id !== configuration.leadSessionId) return { content: 'Error: Cannot resolve sender identity. This session has no teamContext but is not the team lead either. Refusing to send to avoid mis-attributing the message. This usually indicates a teammate session whose teamContext was lost on respawn — please report this as a bug.' }; team = configuration.name; sender = "team-lead"; color = this.manager.getMember(sender)?.color; }
    switch (input.type) { case "message": return this.handleMessage(team, sender, color, input); case "broadcast": return this.handleBroadcast(team, sender, color, input); case "shutdown_request": return this.handleShutdownRequest(team, sender, color, input); case "shutdown_response": return this.handleShutdownResponse(team, sender, color, input); case "plan_approval_response": return this.handlePlanApprovalResponse(team, sender, color, input); default: return { content: `Unknown message type: "${input.type}". Valid types: message, broadcast, shutdown_request, shutdown_response, plan_approval_response` }; }
  }
  resolveRecipientName(name: string): string { return name === "main" ? "team-lead" : name; }
  async resolveRecipient(name: string, team: string): Promise<TeamMemberInfo | undefined> { const target = this.resolveRecipientName(name), member = this.manager.getMember(target); if (member) return member; const registered = this.registry.get(target, team); if (registered) return registered.info; await this.manager.refreshFromDisk(); return this.manager.getMember(target); }
  getAllMemberNames(): string[] { const names = new Set<string>(); for (const member of this.manager.getMembers()) names.add(member.name); for (const member of this.registry.getAll()) names.add(member.info.name); return [...names]; }
  async handleMessage(team: string, sender: string, color: string | undefined, input: SendMessageInput): Promise<any> {
    if (!input.recipient) return { content: 'Error: "recipient" is required for message type.' }; if (!input.content) return { content: 'Error: "content" is required for message type.' }; if (!input.summary) return { content: 'Error: "summary" is required for message type.' };
    const member = await this.resolveRecipient(input.recipient, team); await this.mailbox.send(team, this.resolveRecipientName(input.recipient), { from: sender, text: input.content, summary: input.summary, timestamp: new Date().toISOString(), color });
    const notice = member ? undefined : `Recipient "${input.recipient}" was not yet registered when the message was sent (the teammate may still be spawning, or the name may be wrong). The message has been written to their inbox and will be delivered when they come online. Known members at send time: ${this.getAllMemberNames().join(", ")}.`;
    return { content: JSON.stringify({ success: true, message: `Message sent to ${input.recipient}'s inbox`, ...(notice ? { notice } : {}), routing: { sender, target: `@${input.recipient}`, targetColor: member?.color, summary: input.summary, content: input.content } }), renderer: { type: "send-message", value: JSON.stringify({ type: "message", sender, recipient: input.recipient, recipientColor: member?.color, summary: input.summary, resultMessage: notice ? "Delivered (recipient pending registration)" : "Delivered" }) } };
  }
  async handleBroadcast(team: string, sender: string, color: string | undefined, input: SendMessageInput): Promise<any> {
    if (!input.content) return { content: 'Error: "content" is required for broadcast type.' }; if (!input.summary) return { content: 'Error: "summary" is required for broadcast type.' };
    const recipients = await this.mailbox.broadcast(team, sender, { from: sender, text: input.content, summary: input.summary, timestamp: new Date().toISOString(), color });
    return { content: JSON.stringify({ success: true, message: `Message broadcast to ${recipients.length} teammate(s): ${recipients.join(", ")}`, recipients, routing: { sender, target: "@team", summary: input.summary, content: input.content } }), renderer: { type: "send-message", value: JSON.stringify({ type: "broadcast", sender, recipient: "@team", summary: input.summary, resultMessage: `Delivered to ${recipients.length} teammates`, recipientCount: recipients.length }) } };
  }
  async handleShutdownRequest(team: string, sender: string, color: string | undefined, input: SendMessageInput): Promise<any> {
    if (!input.recipient) return { content: 'Error: "recipient" is required for shutdown_request type.' };
    const suffix = Math.random().toString(16).slice(2, 10), id = `shutdown-${input.recipient}-${Date.now()}-${suffix}`;
    await this.mailbox.send(team, this.resolveRecipientName(input.recipient), { from: sender, text: JSON.stringify({ type: "shutdown_request", request_id: id, reason: input.content || "Team lead requested shutdown", from: sender, timestamp: new Date().toISOString() }), summary: `Shutdown request for ${input.recipient}`, timestamp: new Date().toISOString(), color });
    return { content: `Shutdown request sent to "${input.recipient}" (request_id: ${id}). Wait for their shutdown_response.`, renderer: { type: "send-message", value: JSON.stringify({ type: "shutdown_request", sender, recipient: input.recipient, summary: "Shutdown requested", resultMessage: "Waiting for response" }) } };
  }
  async handleShutdownResponse(team: string, sender: string, color: string | undefined, input: SendMessageInput): Promise<any> {
    await this.mailbox.send(team, "team-lead", { from: sender, text: JSON.stringify({ type: "shutdown_response", request_id: input.request_id, approve: input.approve ?? true, reason: input.content, from: sender, timestamp: new Date().toISOString() }), summary: `Shutdown ${input.approve !== false ? "accepted" : "rejected"} by ${sender}`, timestamp: new Date().toISOString(), color });
    if (input.request_id && this.shutdown) try { this.shutdown.fulfillResponse(input.request_id, input.approve !== false, input.content); } catch (error) { console.error(`[SendMessage] shutdown coordinator.fulfillResponse threw for request_id=${input.request_id}:`, error); }
    if (input.approve !== false) { const member = this.registry.get(sender, team); if (member) { await member.forceKill({ keepWakeable: false }); this.registry.remove(sender, team); } return { content: `Shutdown response sent. Agent "${sender}" is shutting down.`, renderer: { type: "send-message", value: JSON.stringify({ type: "shutdown_response", sender, summary: "Shutting down", resultMessage: "Goodbye", approved: true }) } }; }
    return { content: `Shutdown rejected by "${sender}": ${input.content || "No reason given"}`, renderer: { type: "send-message", value: JSON.stringify({ type: "shutdown_response", sender, summary: "Shutdown rejected", resultMessage: input.content || "Rejected", approved: false }) } };
  }
  async handlePlanApprovalResponse(team: string, sender: string, color: string | undefined, input: SendMessageInput): Promise<any> {
    if (!input.recipient) return { content: 'Error: "recipient" is required for plan_approval_response type.' };
    await this.mailbox.send(team, this.resolveRecipientName(input.recipient), { from: sender, text: JSON.stringify({ type: "plan_approval_response", request_id: input.request_id, approve: input.approve ?? true, feedback: input.content, from: sender, timestamp: new Date().toISOString() }), summary: `Plan ${input.approve !== false ? "approved" : "rejected"} by ${sender}`, timestamp: new Date().toISOString(), color });
    return { content: `Plan ${input.approve !== false ? "approval" : "rejection"} sent to "${input.recipient}".`, renderer: { type: "send-message", value: JSON.stringify({ type: "plan_approval_response", sender, recipient: input.recipient, summary: input.approve !== false ? "Plan approved" : "Plan rejected", resultMessage: input.content || (input.approve !== false ? "Approved" : "Rejected"), approved: input.approve !== false }) } };
  }
  register(tools: ToolManager): void { tools.register("SendMessage", { parameters: SendMessageSchema, parseInput: false, needsApproval: false, isEnabled: () => this.manager.isEnabled(), shouldShowInToolSearch: () => true, execute: (input, context) => this.execute(input as SendMessageInput, context) }); }
}

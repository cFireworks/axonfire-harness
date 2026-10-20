import type { ServerResponse } from "node:http";
import type { TeamMailbox } from "./team-mailbox.js";
import type { PermissionBridgeService } from "./permission-bridge.js";
import type { TeamLogger } from "./team-types.js";
export type TeamHttpContext = { response: ServerResponse };
export function sendData(context: TeamHttpContext, data: unknown, meta?: unknown): void { const body = meta ? { data, meta } : { data }; context.response.setHeader("Content-Type", "application/json; charset=utf-8"); context.response.statusCode = 200; context.response.end(JSON.stringify(body)); }
export function sendNoContent(context: TeamHttpContext): void { context.response.statusCode = 204; context.response.end(); }
export function sendError(context: TeamHttpContext, status: number, code: string, message: string, details?: unknown): void { const body: { error: { code: string; message: string; details?: unknown } } = { error: { code, message } }; if (details !== undefined) body.error.details = details; context.response.setHeader("Content-Type", "application/json; charset=utf-8"); context.response.statusCode = status; context.response.end(JSON.stringify(body)); }
/** Original gateway controllers with Context/requireAuth supplied by the host. */
export class PermissionBridgeController {
  constructor(readonly permissionBridge: PermissionBridgeService, readonly context: () => TeamHttpContext, readonly authorize: (context: TeamHttpContext) => boolean, readonly logger: TeamLogger = {}) {}
  async handlePermissionRequest(body: any): Promise<void> {
    const context = this.context(); if (!this.authorize(context)) return;
    if (!body?.requestId || !body?.toolName || !body?.teammateName) { sendError(context, 400, "INVALID_REQUEST", "Missing required fields: requestId, toolName, teammateName"); return; }
    try { const abort = new AbortController(); context.response.on("close", () => abort.abort()); const result = await this.permissionBridge.handleRequest(body, abort.signal); sendData(context, result); }
    catch (error) { this.logger.error?.("[PermissionBridge] Request handling failed:", error); sendError(context, 500, "INTERNAL_ERROR", error instanceof Error ? error.message : "Unknown error"); }
  }
}
export class TeamMessagesController {
  constructor(readonly teamMailbox: Pick<TeamMailbox, "send" | "getUnread" | "markAllAsRead">, readonly context: () => TeamHttpContext, readonly authorize: (context: TeamHttpContext) => boolean, readonly logger: TeamLogger = {}) {}
  async sendMessage(body: any): Promise<void> { const context = this.context(); if (!this.authorize(context)) return; if (!body?.teamName || !body?.recipient || !body?.message) { sendError(context, 400, "INVALID_REQUEST", "Missing teamName, recipient, or message"); return; } try { await this.teamMailbox.send(body.teamName, body.recipient, body.message); sendData(context, { success: true }); } catch (error) { this.logger.error?.("[TeamMessages] Send failed:", error); sendError(context, 500, "SEND_FAILED", error instanceof Error ? error.message : "Unknown error"); } }
  async getUnread(team: string, member: string): Promise<void> { const context = this.context(); if (!this.authorize(context)) return; if (!team || !member) { sendError(context, 400, "INVALID_REQUEST", "Missing teamName or memberName"); return; } try { sendData(context, { messages: await this.teamMailbox.getUnread(team, member) }); } catch (error) { this.logger.error?.("[TeamMessages] GetUnread failed:", error); sendData(context, { messages: [] }); } }
  async markAsRead(body: any): Promise<void> { const context = this.context(); if (!this.authorize(context)) return; if (!body?.teamName || !body?.memberName) { sendError(context, 400, "INVALID_REQUEST", "Missing teamName or memberName"); return; } try { await this.teamMailbox.markAllAsRead(body.teamName, body.memberName); sendNoContent(context); } catch (error) { this.logger.error?.("[TeamMessages] MarkAsRead failed:", error); sendError(context, 500, "MARK_READ_FAILED", error instanceof Error ? error.message : "Unknown error"); } }
}

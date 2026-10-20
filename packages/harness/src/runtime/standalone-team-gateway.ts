import { AsyncLocalStorage } from "node:async_hooks";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import type { Socket } from "node:net";
import { randomUUID } from "node:crypto";
import type { Subscription } from "rxjs";
import type { HarnessSession } from "../sessions/session.js";
import type { TeamMailbox } from "../teams/team-mailbox.js";
import type { PermissionBridgeService } from "../teams/permission-bridge.js";
import type { TeamLogger } from "../teams/team-types.js";
import { DetachedMemberSseBridge, type AcpUpdate } from "../teams/detached-member-sse-bridge.js";
import { TeamMessagesController, PermissionBridgeController, sendData, sendError, type TeamHttpContext } from "../teams/team-http-controllers.js";
import { SECURITY_HEADER } from "../teams/teammate-transport.js";
/** Standalone, loopback-only host adapter, NOT the original full gateway/ACP
 * server. It hosts recovered Team REST controllers and ACP observation only. */
export class StandaloneTeamGateway {
  private readonly context = new AsyncLocalStorage<TeamHttpContext>();
  private readonly sockets = new Set<Socket>();
  private readonly streams = new Set<ServerResponse>();
  private readonly connections = new Set<string>();
  private subscription: Subscription | undefined;
  private readonly converter: DetachedMemberSseBridge;
  private endpoint: string | undefined;
  private readonly server;
  constructor(readonly options: { mailbox: TeamMailbox; permissionBridge?: PermissionBridgeService; withLeader?: (operation: () => Promise<void>) => Promise<void>; logger?: TeamLogger }) {
    this.converter = new DetachedMemberSseBridge(options.logger ?? {}, "", { sessionUpdate: async () => undefined }, (team, member) => options.mailbox.getTeamMemberEndpointPath(team, member));
    this.server = createServer((request, response) => {
      void this.context.run({ response }, async () => {
        try { await this.route(request, response); }
        catch (error) { if (!response.headersSent) sendError({ response }, 500, "INTERNAL_ERROR", error instanceof Error ? error.message : "Unknown error"); else response.destroy(); }
      });
    });
    this.server.on("connection", (socket) => { this.sockets.add(socket); socket.on("close", () => this.sockets.delete(socket)); });
  }
  async start(): Promise<string> {
    if (this.endpoint) return this.endpoint;
    await new Promise<void>((resolve, reject) => { this.server.once("error", reject); this.server.listen(0, "127.0.0.1", () => { this.server.removeListener("error", reject); resolve(); }); });
    const address = this.server.address(); if (!address || typeof address === "string") throw new Error("No Team gateway TCP address");
    return this.endpoint = `http://127.0.0.1:${address.port}`;
  }
  getEndpoint(): string | undefined { return this.endpoint; }
  private session: HarnessSession | undefined;
  observeSession(session: HarnessSession): void { this.subscription?.unsubscribe(); this.session = session; this.subscription = session.inputSubject.subscribe((item) => { for (const update of this.converter.convertHistoryItemToAcpUpdates(item)) this.publish(update); }); }
  publish(update: AcpUpdate): void { const text = `event: message\ndata: ${JSON.stringify({ jsonrpc: "2.0", method: "notifications/sessionUpdate", params: { sessionId: this.session?.id, update } })}\n\n`; for (const response of this.streams) response.write(text); }
  private async body(request: IncomingMessage): Promise<any> { let size = 0; const chunks: Buffer[] = []; for await (const chunk of request) { const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk); size += buffer.length; if (size > 524288) throw new Error("Team gateway request exceeds 512KiB"); chunks.push(buffer); } const text = Buffer.concat(chunks).toString("utf8"); return text ? JSON.parse(text) : undefined; }
  private async route(request: IncomingMessage, response: ServerResponse): Promise<void> {
    const context = this.context.getStore()!, url = new URL(request.url ?? "/", "http://127.0.0.1");
    if (request.headers[SECURITY_HEADER] !== "1") { sendError(context, 403, "FORBIDDEN", "Missing x-codebuddy-request header"); return; }
    if (request.method === "GET" && url.pathname === "/api/v1/auth/status") { sendData(context, { authenticated: true, mode: "none" }); return; }
    const messages = new TeamMessagesController(this.options.mailbox, () => this.context.getStore()!, () => true, this.options.logger);
    const safeComponent = (value: unknown) => typeof value === "string" && /^[\p{L}\p{N}_@ .-]+$/u.test(value) && value !== "." && value !== "..";
    if (request.method === "GET" && url.pathname === "/api/v1/team/messages/unread") {
      const team = url.searchParams.get("teamName") ?? "", member = url.searchParams.get("memberName") ?? "";
      if (team && member && (!safeComponent(team) || !safeComponent(member))) { sendError(context, 400, "INVALID_REQUEST", "Unsafe Team/member path component"); return; }
      await messages.getUnread(team, member); return;
    }
    let body: any; if (request.method === "POST") try { body = await this.body(request); } catch (error) { sendError(context, 400, "INVALID_REQUEST", error instanceof Error ? error.message : "Invalid request"); return; }
    // Host-only boundary; native controllers retain their original validation.
    if (["/api/v1/team/messages/send", "/api/v1/team/messages/read"].includes(url.pathname) && body?.teamName && (body?.recipient || body?.memberName) && (!safeComponent(body.teamName) || !safeComponent(body.recipient || body.memberName))) { sendError(context, 400, "INVALID_REQUEST", "Unsafe Team/member path component"); return; }
    if (request.method === "POST" && url.pathname === "/api/v1/team/messages/send") { await messages.sendMessage(body); return; }
    if (request.method === "POST" && url.pathname === "/api/v1/team/messages/read") { await messages.markAsRead(body); return; }
    if (request.method === "POST" && url.pathname === "/api/v1/permission-bridge/request") {
      if (!this.options.permissionBridge) { sendError(context, 503, "UNAVAILABLE", "Permission Bridge not configured"); return; }
      const controller = new PermissionBridgeController(this.options.permissionBridge, () => this.context.getStore()!, () => true, this.options.logger), operation = () => controller.handlePermissionRequest(body);
      if (this.options.withLeader) await this.options.withLeader(operation); else await operation(); return;
    }
    if (request.method === "POST" && url.pathname === "/api/v1/acp/connect") { const connectionId = randomUUID(); this.connections.add(connectionId); response.setHeader("Content-Type", "application/json"); response.end(JSON.stringify({ connectionId })); return; }
    if (request.method === "POST" && url.pathname === "/api/v1/acp") {
      const connection = request.headers["acp-connection-id"]; if (typeof connection !== "string" || !this.connections.has(connection)) { sendError(context, 400, "INVALID_CONNECTION", "Unknown ACP connection"); return; }
      if (body?.method === "initialize") { response.setHeader("Content-Type", "application/json"); response.end(JSON.stringify({ jsonrpc: "2.0", id: body.id, result: { protocolVersion: 1, agentCapabilities: { loadSession: true }, agentInfo: { name: "workbuddy-harness-standalone", version: "5.3.14-reconstruction.0" } } })); return; }
      if (body?.method === "session/load" && this.session && body.params?.sessionId === this.session.id) {
        response.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" }); response.flushHeaders();
        this.streams.add(response); response.on("close", () => this.streams.delete(response));
        for (const item of this.session.history) for (const update of this.converter.convertHistoryItemToAcpUpdates(item)) response.write(`event: message\ndata: ${JSON.stringify({ jsonrpc: "2.0", method: "notifications/sessionUpdate", params: { sessionId: this.session.id, update } })}\n\n`);
        return;
      }
      response.setHeader("Content-Type", "application/json"); response.end(JSON.stringify({ jsonrpc: "2.0", id: body?.id ?? null, error: { code: -32601, message: "Standalone Team gateway only supports initialize and current session/load" } })); return;
    }
    sendError(context, 404, "NOT_FOUND", "Unknown Team gateway route");
  }
  async close(): Promise<void> { this.subscription?.unsubscribe(); for (const [id] of this.options.permissionBridge?.pendingRequests ?? []) this.options.permissionBridge!.resolveRequest(id, "deny", "Gateway closed"); for (const stream of this.streams) stream.end(); this.streams.clear(); this.connections.clear(); if (!this.server.listening) return; const closing = new Promise<void>((resolve, reject) => this.server.close((error) => error ? reject(error) : resolve())); for (const socket of this.sockets) socket.destroy(); await closing; this.endpoint = undefined; }
}

import * as http from "node:http";
import { readFileSync } from "node:fs";
import type { TeamLogger } from "./team-types.js";
import { withSecurityHeader } from "./teammate-transport.js";
export type AcpUpdate = { sessionUpdate: string; [key: string]: any };
export type AcpLeaderConnection = { sessionUpdate(event: { sessionId: string; update: AcpUpdate }): Promise<unknown> };
export type DetachedEndpoint = { endpoint?: string; sessionId?: string; memberName?: string; teamName?: string; history?: any[]; pid?: number; timestamp?: string };
export type DetachedSseConnection = { memberName: string; endpoint: string; sessionId: string | undefined; connectionId?: string; abortController?: AbortController; eventSource?: { close(): void } };
/** Native 8282427..8289110. endpointPath replaces global PathUtils only. */
export class DetachedMemberSseBridge {
  readonly connections = new Map<string, DetachedSseConnection>();
  private acpAgent: { notifyToolCallSent(id: string): void } | undefined;
  constructor(readonly logger: TeamLogger, readonly leaderSessionId: string, readonly leaderConnection: AcpLeaderConnection, readonly endpointPath: (team: string, member: string) => string) {}
  setAcpAgent(agent: { notifyToolCallSent(id: string): void }): void { this.acpAgent = agent; }
  async connectMember(team: string, member: string): Promise<boolean> {
    if (this.connections.has(member)) return true;
    const endpoint = this.readEndpointFile(team, member); if (!endpoint) return false;
    if (endpoint.history && endpoint.history.length > 0) { this.replayHistoryFromFile(member, endpoint.history); this.connections.set(member, { memberName: member, endpoint: endpoint.endpoint || "", sessionId: endpoint.sessionId }); return true; }
    if (!endpoint.endpoint) return false;
    try { const connection: DetachedSseConnection = { memberName: member, endpoint: endpoint.endpoint, sessionId: endpoint.sessionId }; await this.startSseStream(connection); this.connections.set(member, connection); return true; }
    catch (error) { this.logger.warn?.(`[DetachedSseBridge] Failed to connect to "${member}": ${error}`); return false; }
  }
  disconnectMember(member: string): void { const connection = this.connections.get(member); if (connection) { connection.abortController?.abort(); connection.eventSource?.close(); this.connections.delete(member); this.logger.info?.(`[DetachedSseBridge] Disconnected from "${member}"`); } }
  disconnectAll(): void { for (const member of this.connections.keys()) this.disconnectMember(member); }
  isConnected(member: string): boolean { return this.connections.has(member); }
  replayHistoryFromFile(member: string, history: any[]): void { for (const item of history) try { for (const update of this.convertHistoryItemToAcpUpdates(item)) { update._meta ||= {}; update._meta["codebuddy.ai/memberEvent"] = member; this.leaderConnection.sessionUpdate({ sessionId: this.leaderSessionId, update }).catch((error) => this.logger.debug?.(`[DetachedSseBridge] Replay forward error for "${member}": ${error}`)); if (update.sessionUpdate === "tool_call" && update.toolCallId) this.acpAgent?.notifyToolCallSent(update.toolCallId); } } catch (error) { this.logger.warn?.(`[DetachedSseBridge] Replay convert error for "${member}": ${error}`); } }
  convertHistoryItemToAcpUpdates(item: any): AcpUpdate[] {
    if (!item || !item.type) return [];
    if (item.type === "message" && item.role === "assistant") { const updates: AcpUpdate[] = [], content = item.content; if (Array.isArray(content)) { for (const part of content) if (part.type === "output_text" || part.type === "text") updates.push({ sessionUpdate: "agent_message_chunk", content: { type: "text", text: part.text || "" } }); } else if (typeof content === "string") updates.push({ sessionUpdate: "agent_message_chunk", content: { type: "text", text: content } }); return updates; }
    if (item.type === "message" && item.role === "user") { const content = item.content; let text = ""; if (typeof content === "string") text = content; else if (Array.isArray(content)) text = content.filter((part) => part.type === "input_text" || part.type === "text").map((part) => part.text || "").join("\n"); return text.trim() ? [{ sessionUpdate: "user_message_chunk", content: { type: "text", text } }] : []; }
    if (item.type === "function_call") return [{ sessionUpdate: "tool_call", toolCallId: item.call_id || item.id, name: item.name, kind: "other", title: item.name, input: item.arguments, _meta: { "codebuddy.ai/toolName": item.name } }];
    if (item.type === "function_call_output" || item.type === "function_call_result") return [{ sessionUpdate: "tool_call_update", toolCallId: item.call_id || item.id, status: "completed", toolResult: item.output }];
    return [];
  }
  readEndpointFile(team: string, member: string): DetachedEndpoint | undefined { const path = this.endpointPath(team, member); try { return JSON.parse(readFileSync(path, "utf-8")); } catch (error) { if ((error as NodeJS.ErrnoException)?.code !== "ENOENT") this.logger.warn?.(`[DetachedSseBridge] Failed to read endpoint file ${path}: ${error}`); return; } }
  async startSseStream(connection: DetachedSseConnection): Promise<void> {
    const url = new URL(connection.endpoint);
    connection.connectionId = (await new Promise<any>((resolve, reject) => { const request = http.request({ hostname: url.hostname, port: url.port, path: "/api/v1/acp/connect", method: "POST", headers: withSecurityHeader() }, (response) => { let text = ""; response.on("data", (chunk) => { text += chunk; }); response.on("end", () => { try { resolve(JSON.parse(text)); } catch { reject(new Error(`Invalid connect response: ${text}`)); } }); }); request.on("error", reject); request.setTimeout(5000, () => request.destroy(new Error("Connect timeout"))); request.end(); })).connectionId;
    await this.postAcp(connection, JSON.stringify({ jsonrpc: "2.0", id: "init-bridge", method: "initialize", params: { protocolVersion: 1, capabilities: {}, clientInfo: { name: "leader-bridge", version: "1.0" } } }));
    const load = JSON.stringify({ jsonrpc: "2.0", id: "load-session", method: "session/load", params: { sessionId: connection.sessionId, cwd: process.cwd() } });
    connection.abortController = new AbortController(); this.startSseEventLoop(connection, load);
  }
  postAcp(connection: DetachedSseConnection, body: string): Promise<string> {
    const url = new URL(connection.endpoint);
    return new Promise((resolve, reject) => { const request = http.request({ hostname: url.hostname, port: url.port, path: "/api/v1/acp", method: "POST", headers: withSecurityHeader({ "Content-Type": "application/json", Accept: "application/json, text/event-stream", "acp-connection-id": connection.connectionId! }) }, (response) => { let text = ""; response.on("data", (chunk) => { text += chunk; }); response.on("end", () => resolve(text)); }); request.on("error", reject); request.setTimeout(10000, () => request.destroy(new Error("ACP request timeout"))); request.write(body); request.end(); });
  }
  startSseEventLoop(connection: DetachedSseConnection, body: string): void {
    const url = new URL(connection.endpoint), request = http.request({ hostname: url.hostname, port: url.port, path: "/api/v1/acp", method: "POST", headers: withSecurityHeader({ "Content-Type": "application/json", Accept: "application/json, text/event-stream", "acp-connection-id": connection.connectionId! }) }, (response) => {
      let buffer = "";
      response.on("data", (chunk) => { const lines = (buffer += chunk.toString()).split("\n"); buffer = lines.pop() || ""; let event = ""; for (const line of lines) if (line.startsWith("event: ")) event = line.slice(7).trim(); else if (line.startsWith("data: ")) { this.handleSseEvent(connection.memberName, event, line.slice(6)); event = ""; } });
      response.on("end", () => { this.logger.info?.(`[DetachedSseBridge] SSE stream ended for "${connection.memberName}"`); this.connections.delete(connection.memberName); });
      response.on("error", (error) => { this.logger.warn?.(`[DetachedSseBridge] SSE stream error for "${connection.memberName}": ${error.message}`); this.connections.delete(connection.memberName); });
    });
    connection.abortController?.signal.addEventListener("abort", () => { request.destroy(); }, { once: true });
    request.on("error", (error) => { if (!connection.abortController?.signal.aborted) this.logger.warn?.(`[DetachedSseBridge] SSE request error for "${connection.memberName}": ${error.message}`); });
    request.write(body); request.end();
  }
  handleSseEvent(member: string, event: string, data: string): void {
    if (event !== "message" && event !== "") return;
    let parsed; try { parsed = JSON.parse(data); } catch { return; }
    try { if (parsed.method === "notifications/sessionUpdate" && parsed.params?.update) { const update = parsed.params.update; update._meta ||= {}; update._meta["codebuddy.ai/memberEvent"] = member; this.leaderConnection.sessionUpdate({ sessionId: this.leaderSessionId, update }).catch((error) => this.logger.debug?.(`[DetachedSseBridge] Failed to forward event for "${member}": ${error}`)); if (update.sessionUpdate === "tool_call" && update.toolCallId) this.acpAgent?.notifyToolCallSent(update.toolCallId); } }
    catch (error) { this.logger.warn?.(`[DetachedSseBridge] Error processing SSE event for "${member}": ${error}`); }
  }
}

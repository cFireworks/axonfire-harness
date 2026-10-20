import * as http from "node:http";
import type { TeamMailbox, TeamMessage } from "./team-mailbox.js";
export const SECURITY_HEADER = "x-codebuddy-request";
export function withSecurityHeader(headers?: Record<string, string>): Record<string, string> { return { ...headers, [SECURITY_HEADER]: "1" }; }
export interface TeammateTransport {
  readonly type: string;
  send(team: string, recipient: string, message: TeamMessage): Promise<void>;
  getUnread(team: string, member: string): Promise<TeamMessage[]>;
  markAllAsRead(team: string, member: string): Promise<void>;
  startPolling(team: string, member: string, callback: (messages: TeamMessage[]) => void | Promise<void>, interval?: number): () => void;
}
export class MailboxTransport implements TeammateTransport {
  readonly type = "mailbox";
  constructor(readonly mailbox: TeamMailbox) {}
  getMailbox(): TeamMailbox { return this.mailbox; }
  async send(team: string, recipient: string, message: TeamMessage): Promise<void> { await this.getMailbox().send(team, recipient, message); }
  async getUnread(team: string, member: string): Promise<TeamMessage[]> { return this.getMailbox().getUnread(team, member); }
  async markAllAsRead(team: string, member: string): Promise<void> { await this.getMailbox().markAllAsRead(team, member); }
  startPolling(team: string, member: string, callback: (messages: TeamMessage[]) => void | Promise<void>, interval?: number): () => void { return this.getMailbox().startPolling(team, member, callback, interval); }
}
/** Native HTTP mailbox transport: malformed successful JSON resolves undefined. */
export class HttpTransport implements TeammateTransport {
  readonly type = "http";
  constructor(readonly leaderEndpoint: string) {}
  async send(team: string, recipient: string, message: TeamMessage): Promise<void> { await this.post("/api/v1/team/messages/send", { teamName: team, recipient, message }); }
  async getUnread(team: string, member: string): Promise<TeamMessage[]> { const result = await this.get(`/api/v1/team/messages/unread?teamName=${encodeURIComponent(team)}&memberName=${encodeURIComponent(member)}`); return result?.messages ?? []; }
  async markAllAsRead(team: string, member: string): Promise<void> { await this.post("/api/v1/team/messages/read", { teamName: team, memberName: member }); }
  startPolling(team: string, member: string, callback: (messages: TeamMessage[]) => void | Promise<void>, interval = 2000): () => void {
    let stopped = false;
    void (async () => { while (!stopped) { try { const messages = await this.getUnread(team, member); if (messages.length > 0) { await this.markAllAsRead(team, member); await callback(messages); } } catch {} await new Promise((done) => setTimeout(done, interval)); } })();
    return () => { stopped = true; };
  }
  post(path: string, payload: unknown): Promise<any> {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.leaderEndpoint), body = JSON.stringify(payload), request = http.request(url.toString(), { method: "POST", headers: withSecurityHeader({ "Content-Type": "application/json", "Content-Length": String(Buffer.byteLength(body)) }), timeout: 30000 }, (response) => { let text = ""; response.setEncoding("utf8"); response.on("data", (chunk) => { text += chunk; }); response.on("end", () => { if (response.statusCode && response.statusCode >= 200 && response.statusCode < 300) try { const parsed = JSON.parse(text); resolve(parsed.data || parsed); } catch { resolve(undefined); } else reject(new Error(`HTTP ${response.statusCode}: ${text.slice(0, 200)}`)); }); });
      request.on("error", reject); request.on("timeout", () => { request.destroy(); reject(new Error("Request timed out")); }); request.write(body); request.end();
    });
  }
  get(path: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.leaderEndpoint), request = http.get(url.toString(), { timeout: 10000, headers: withSecurityHeader() }, (response) => { let text = ""; response.setEncoding("utf8"); response.on("data", (chunk) => { text += chunk; }); response.on("end", () => { if (response.statusCode && response.statusCode >= 200 && response.statusCode < 300) try { const parsed = JSON.parse(text); resolve(parsed.data || parsed); } catch { resolve(undefined); } else reject(new Error(`HTTP ${response.statusCode}: ${text.slice(0, 200)}`)); }); });
      request.on("error", reject); request.on("timeout", () => { request.destroy(); reject(new Error("Request timed out")); });
    });
  }
}
export class TeammateTransportFactory {
  constructor(readonly mailbox: TeamMailbox) {}
  create(options?: { isRemote?: boolean; leaderEndpoint?: string }): TeammateTransport { return options?.isRemote && options.leaderEndpoint || options?.leaderEndpoint && !this.isLocalEndpoint(options.leaderEndpoint) ? new HttpTransport(options.leaderEndpoint!) : new MailboxTransport(this.mailbox); }
  isLocalEndpoint(endpoint: string): boolean { try { const hostname = new URL(endpoint).hostname; return hostname === "127.0.0.1" || hostname === "localhost" || hostname === "::1"; } catch { return true; } }
}

import type { MCPServer } from "@openai/agents";
import type { ProductAgent } from "../config/types.js";

export type McpConnection = MCPServer & {
  name: string;
  connected?: boolean;
  status?: McpServerStatus;
  /** Explicit product connection configuration for native first-run prewait; no installed config discovery. */
  nativeConfig?:Record<string,any>;
  listResources?: () => Promise<McpResource[]>;
  listResourceTemplates?: () => Promise<McpResourceTemplate[]>;
  readResource?: (input: { uri: string }) => Promise<McpResourceContent[]>;
};

export const McpServerStatus = {
  DISCONNECTED: "disconnected",
  PENDING: "pending",
  CONNECTING: "connecting",
  CONNECTED: "connected",
  UNAUTHORIZED: "unauthorized",
  AUTHORIZED: "authorized",
  AUTHORIZING: "authorizing",
  PENDING_APPROVAL: "pendingApproval",
} as const;

export type McpServerStatus =
  (typeof McpServerStatus)[keyof typeof McpServerStatus];

export type McpResource = {
  uri: string;
  name?: string;
  description?: string;
  mimeType?: string;
};

export type McpResourceTemplate = {
  uriTemplate: string;
  name?: string;
  description?: string;
  mimeType?: string;
};

export type McpResourceContent = {
  uri?: string;
  mimeType?: string;
  text?: string;
  blob?: string;
  [key: string]: unknown;
};

export type McpServerRecord = {
  name: string;
  status: McpServerStatus;
};

export class McpRegistry {
  private readonly servers = new Map<string, McpConnection>();
  private settlePromise: Promise<void> = Promise.resolve();

  register(server: McpConnection): void {
    this.servers.set(server.name, server);
  }

  setSettlePromise(promise: Promise<void>): void {
    this.settlePromise = promise;
  }

  async waitForServersReady(signal?: AbortSignal): Promise<void> {
    if (signal?.aborted) throw signal.reason;
    await Promise.race([
      this.settlePromise,
      new Promise<never>((_, reject) => {
        signal?.addEventListener("abort", () => reject(signal.reason), {
          once: true,
        });
      }),
    ]);
  }

  connectedServers(): McpConnection[] {
    return [...this.servers.values()].filter(
      (server) =>
        server.connected !== false &&
        (server.status === undefined || server.status === McpServerStatus.CONNECTED),
    );
  }

  async getConnectedServers(): Promise<McpConnection[]> {
    return this.connectedServers();
  }

  async list(): Promise<McpServerRecord[]> {
    return [...this.servers.values()].map((server) => ({
      name: server.name,
      status:
        server.status ??
        (server.connected === false
          ? McpServerStatus.DISCONNECTED
          : McpServerStatus.CONNECTED),
    }));
  }
  async listForAgentManager():Promise<any[]>{return [...this.servers.values()].map(server=>({name:server.name,status:server.status??(server.connected===false?McpServerStatus.DISCONNECTED:McpServerStatus.CONNECTED),config:server.nativeConfig??{type:"sdk"}}));}

  serversForAgent(agent: ProductAgent): McpConnection[] {
    const explicit = (agent.tools ?? []).filter((name) =>
      name.startsWith("mcp__"),
    );
    if (explicit.length === 0) return this.connectedServers();
    const allowedServers = new Set(
      explicit
        .map(parseMcpToolName)
        .map(({ serverName }) => sanitizeServerName(serverName)),
    );
    return this.connectedServers().filter((server) =>
      allowedServers.has(sanitizeServerName(server.name)),
    );
  }
}

export function parseMcpToolName(value: string): {
  serverName: string;
  toolName: string;
} {
  const match = /^mcp__(.+?)__(.+)$/.exec(value);
  if (!match?.[1] || !match[2])
    throw new Error(`Invalid MCP tool name format: ${value}`);
  return { serverName: match[1], toolName: match[2] };
}

function sanitizeServerName(value: string): string {
  return value.replace(/[^a-zA-Z0-9]/g, "_");
}

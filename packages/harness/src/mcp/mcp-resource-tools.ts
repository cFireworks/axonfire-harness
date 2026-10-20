import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";
import {
  type McpConnection,
  type McpResource,
  type McpResourceContent,
  type McpResourceTemplate,
  type McpServerRecord,
  McpRegistry,
  McpServerStatus,
} from "./mcp-registry.js";

export const CONNECTOR_RESOURCE_URI_SCHEME = "mcp+connector";
export const CONNECTOR_RESOURCE_URI_PREFIX = `${CONNECTOR_RESOURCE_URI_SCHEME}://`;
export const CONNECTOR_PROXY_SERVER_NAME = "connector-proxy";
export const WAIT_FOR_MCP_POLL_MS = 50;
export const WAIT_FOR_MCP_TIMEOUT_MS = 5_000;
export const WAIT_FOR_MCP_SERVERS_ENV =
  "CODEBUDDY_WAIT_FOR_MCP_SERVERS_ENABLED";

export type CatalogResource = {
  serverName: string;
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
  isTemplate: boolean;
};

export function extractBackendShortName(value: string): string {
  const index = value.indexOf(":");
  return index >= 0 ? value.slice(index + 1) : value;
}

export function parseConnectorResourceUri(value: string):
  | {
      configId: string;
      originalUri: string;
      backendShortName: string;
    }
  | undefined {
  if (!value.startsWith(CONNECTOR_RESOURCE_URI_PREFIX)) return undefined;
  const remainder = value.slice(CONNECTOR_RESOURCE_URI_PREFIX.length);
  const slash = remainder.indexOf("/");
  if (slash <= 0) return undefined;
  try {
    const configId = decodeURIComponent(remainder.slice(0, slash));
    const originalUri = decodeURIComponent(remainder.slice(slash + 1));
    if (!configId || !originalUri) return undefined;
    return {
      configId,
      originalUri,
      backendShortName: extractBackendShortName(configId),
    };
  } catch {
    return undefined;
  }
}

export class McpResourceCatalogService {
  constructor(private readonly mcp: McpRegistry) {}

  async listResources(): Promise<CatalogResource[]> {
    const servers = await this.mcp.getConnectedServers();
    const result: CatalogResource[] = [];
    for (const server of servers) {
      const [resources, templates] = await Promise.all([
        this.safeListResources(server),
        this.safeListResourceTemplates(server),
      ]);
      for (const resource of resources) {
        const connector = parseConnectorResourceUri(resource.uri);
        result.push(
          compactCatalogResource({
            serverName:
              connector?.backendShortName || server.name || "Unnamed Server",
            uri: resource.uri,
            name: resource.name ?? resource.uri,
            description: resource.description,
            mimeType: resource.mimeType,
            isTemplate: false,
          }),
        );
      }
      for (const template of templates) {
        const connector = parseConnectorResourceUri(template.uriTemplate);
        result.push(
          compactCatalogResource({
            serverName:
              connector?.backendShortName || server.name || "Unnamed Server",
            uri: template.uriTemplate,
            name: template.name ?? template.uriTemplate,
            description: template.description,
            mimeType: template.mimeType,
            isTemplate: true,
          }),
        );
      }
    }
    return result;
  }

  private async safeListResources(
    server: McpConnection,
  ): Promise<McpResource[]> {
    try {
      return (await server.listResources?.()) ?? [];
    } catch {
      return [];
    }
  }

  private async safeListResourceTemplates(
    server: McpConnection,
  ): Promise<McpResourceTemplate[]> {
    try {
      return (await server.listResourceTemplates?.()) ?? [];
    } catch {
      return [];
    }
  }
}

export const listMcpResourcesParameters = z.object({
  server: z
    .string()
    .optional()
    .describe("Optional server name to filter resources by"),
});

export class ListMcpResourcesTool {
  readonly name = "ListMcpResources";
  readonly description = "List resources exposed by connected MCP servers.";
  readonly parameters = listMcpResourcesParameters;
  readonly argumentRenderer = { displayProperties: [{ name: "server" }] };
  readonly needsApproval = false;

  constructor(private readonly catalog: McpResourceCatalogService) {}

  async isEnabled(): Promise<boolean> {
    try {
      return (await this.catalog.listResources()).length > 0;
    } catch {
      return false;
    }
  }

  async execute(input: z.infer<typeof listMcpResourcesParameters>): Promise<{
    content: string;
    error?: string;
  }> {
    try {
      const resources = await this.catalog.listResources();
      const filtered = input.server
        ? resources.filter((item) => item.serverName === input.server)
        : resources;
      return {
        content: JSON.stringify({
          type: "list_mcp_resources_result",
          count: filtered.length,
          resources: filtered.map((item) => ({
            server: item.serverName,
            uri: item.uri,
            name: item.name,
            description: item.description,
            mimeType: item.mimeType,
            isTemplate: item.isTemplate,
          })),
        }),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { content: `Error listing MCP resources: ${message}`, error: message };
    }
  }
}

export const readMcpResourceParameters = z.object({
  server: z.string().describe("The MCP server name"),
  uri: z.string().describe("The resource URI to read"),
});

const MIME_EXTENSIONS: Readonly<Record<string, string>> = {
  "text/plain": ".txt",
  "text/markdown": ".md",
  "text/html": ".html",
  "text/css": ".css",
  "text/javascript": ".js",
  "text/csv": ".csv",
  "text/xml": ".xml",
  "application/json": ".json",
  "application/xml": ".xml",
  "application/pdf": ".pdf",
  "application/zip": ".zip",
  "application/octet-stream": ".bin",
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/gif": ".gif",
  "image/svg+xml": ".svg",
  "image/webp": ".webp",
};

export class ReadMcpResourceTool {
  readonly name = "ReadMcpResource";
  readonly description = "Read a specific resource from an MCP server.";
  readonly parameters = readMcpResourceParameters;
  readonly argumentRenderer = {
    displayProperties: [{ name: "server" }, { name: "uri" }],
  };
  readonly needsApproval = false;

  constructor(
    private readonly mcp: McpRegistry,
    private readonly catalog: McpResourceCatalogService,
    private readonly cwd: string | (() => string) = process.cwd(),
  ) {}

  async isEnabled(): Promise<boolean> {
    try {
      return (await this.catalog.listResources()).length > 0;
    } catch {
      return false;
    }
  }

  async execute(input: z.infer<typeof readMcpResourceParameters>): Promise<{
    content: string;
    error?: string;
  }> {
    const serverName = input.server?.trim();
    const uri = input.uri?.trim();
    if (!serverName) return this.errorResult("Missing required parameter: server");
    if (!uri) return this.errorResult("Missing required parameter: uri");
    const connected = await this.mcp.getConnectedServers();
    const server =
      connected.find((item) => item.name === serverName) ??
      connected.find((item) => item.name === CONNECTOR_PROXY_SERVER_NAME);
    if (!server) {
      const available = connected.map((item) => item.name).join(", ") || "none";
      return this.errorResult(
        `MCP server "${serverName}" is not connected. Available servers: ${available}`,
      );
    }
    let contents: McpResourceContent[];
    try {
      contents = (await server.readResource?.({ uri })) ?? [];
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return this.errorResult(`Failed to read resource "${uri}": ${message}`);
    }
    if (contents.length === 0) {
      return this.errorResult(`Resource not found or empty: ${uri}`);
    }
    const persisted = await this.persistContents(contents, serverName);
    return {
      content: JSON.stringify({
        type: "read_mcp_resource_result",
        server: serverName,
        uri,
        contents: persisted,
      }),
    };
  }

  async persistContents(
    contents: readonly McpResourceContent[],
    serverName: string,
  ): Promise<Array<Record<string, unknown>>> {
    const result: Array<Record<string, unknown>> = [];
    for (let index = 0; index < contents.length; index += 1) {
      const item = contents[index];
      if (!item) continue;
      if (typeof item.text === "string") {
        result.push({ uri: item.uri, mimeType: item.mimeType, text: item.text });
        continue;
      }
      if (typeof item.blob === "string") {
        try {
          const path = await this.persistBlob(item.blob, item.mimeType, index);
          result.push({
            uri: item.uri,
            mimeType: item.mimeType,
            blobSavedTo: path,
            text: `[Resource from ${serverName} at ${item.uri}] Binary content (${item.mimeType ?? "unknown"}) saved to: ${path}`,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          result.push({
            uri: item.uri,
            mimeType: item.mimeType,
            text: `Binary content could not be saved to disk: ${message}`,
          });
        }
        continue;
      }
      result.push({
        uri: item.uri,
        mimeType: item.mimeType,
        text: JSON.stringify(item, null, 2),
      });
    }
    return result;
  }

  private async persistBlob(
    blob: string,
    mimeType: string | undefined,
    index: number,
  ): Promise<string> {
    const directory = join(typeof this.cwd === "function" ? this.cwd() : this.cwd, ".mcp-resources");
    await mkdir(directory, { recursive: true });
    const random = Math.random().toString(36).slice(2, 8);
    const extension = mimeType ? MIME_EXTENSIONS[mimeType.toLowerCase()] ?? "" : "";
    const filename = `mcp-resource-${Date.now()}-${index}-${random}${extension}`;
    const path = join(directory, filename);
    await writeFile(path, Buffer.from(blob, "base64"));
    return path;
  }

  private errorResult(message: string): { content: string; error: string } {
    return { content: `Error: ${message}`, error: message };
  }
}

export const waitForMcpServersParameters = z.object({
  servers: z
    .array(z.string())
    .optional()
    .describe("Server names to wait for (default: all pending)"),
});

export type McpWaitClassification = {
  ready: boolean;
  connected: string[];
  failed: string[];
  stillPending: string[];
  needsAuth: string[];
  disabled: string[];
  unknown: string[];
};

export class WaitForMcpServersTool {
  readonly name = "WaitForMcpServers";
  readonly description =
    "Wait for MCP servers that are still connecting and whose tools are not yet in your tool list. Pass `servers` to wait for specific ones, or omit it to wait for all pending servers.\n\nIf the user's request needs tools from a still-connecting server, call this tool to wait for it. Once it connects, its tools will be added to your tool list and you can use them directly. Returns ready=true when servers are ready, ready=false if they failed to connect, need authentication, or are disabled.\n\nYou do not need to ask the user for confirmation to use this tool.";
  readonly parameters = waitForMcpServersParameters;
  readonly argumentRenderer = { displayProperties: [{ name: "servers" }] };
  readonly needsApproval = false;

  constructor(
    private readonly mcp: McpRegistry,
    private readonly timeoutMs = WAIT_FOR_MCP_TIMEOUT_MS,
    private readonly pollMs = WAIT_FOR_MCP_POLL_MS,
  ) {}

  async isEnabled(): Promise<boolean> {
    const value = process.env[WAIT_FOR_MCP_SERVERS_ENV];
    return value !== "0" && value?.toLowerCase() !== "false";
  }

  async execute(input: z.infer<typeof waitForMcpServersParameters>): Promise<{
    content: string;
    error?: string;
  }> {
    try {
      const initial = await this.mcp.list();
      const targets = input.servers?.length
        ? input.servers
        : this.getPendingServerNames(initial);
      const deadline = Date.now() + this.timeoutMs;
      while (Date.now() < deadline) {
        const servers = await this.mcp.list();
        const waiting = this.matchTargets(servers, targets).some(
          (server) =>
            server.status === McpServerStatus.PENDING ||
            server.status === McpServerStatus.CONNECTING,
        );
        if (!waiting) break;
        await this.sleep(this.pollMs);
      }
      return this.buildResult(
        this.classifyResults(await this.mcp.list(), targets),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: `Error waiting for MCP servers: ${message}`,
        error: message,
      };
    }
  }

  getPendingServerNames(servers: readonly McpServerRecord[]): string[] {
    return servers
      .filter(
        (server) =>
          server.status === McpServerStatus.PENDING ||
          server.status === McpServerStatus.CONNECTING,
      )
      .map((server) => server.name);
  }

  matchTargets(
    servers: readonly McpServerRecord[],
    targets: readonly string[],
  ): McpServerRecord[] {
    const lower = new Set(targets.map((name) => name.toLowerCase()));
    return servers.filter(
      (server) =>
        targets.includes(server.name) || lower.has(server.name.toLowerCase()),
    );
  }

  classifyResults(
    servers: readonly McpServerRecord[],
    targets: readonly string[],
  ): McpWaitClassification {
    const matched = this.matchTargets(servers, targets);
    const connected: string[] = [];
    const failed: string[] = [];
    const stillPending: string[] = [];
    const needsAuth: string[] = [];
    const disabled: string[] = [];
    for (const server of matched) {
      switch (server.status) {
        case McpServerStatus.CONNECTED:
          connected.push(server.name);
          break;
        case McpServerStatus.PENDING:
        case McpServerStatus.CONNECTING:
          stillPending.push(server.name);
          break;
        case McpServerStatus.UNAUTHORIZED:
        case McpServerStatus.AUTHORIZING:
          needsAuth.push(server.name);
          break;
        case McpServerStatus.PENDING_APPROVAL:
          disabled.push(server.name);
          break;
        case McpServerStatus.DISCONNECTED:
        default:
          failed.push(server.name);
      }
    }
    const matchedNames = new Set(
      matched.map((server) => server.name.toLowerCase()),
    );
    const unknown = targets.filter(
      (name) => !matchedNames.has(name.toLowerCase()),
    );
    return {
      ready:
        failed.length === 0 &&
        stillPending.length === 0 &&
        needsAuth.length === 0 &&
        disabled.length === 0 &&
        unknown.length === 0,
      connected,
      failed,
      stillPending,
      needsAuth,
      disabled,
      unknown,
    };
  }

  buildResult(classification: McpWaitClassification): {
    content: string;
    error?: string;
  } {
    const lines = [`ready: ${classification.ready}`];
    if (classification.connected.length > 0) {
      lines.push(
        `Connected (their tools are now available — call them directly): ${classification.connected.join(", ")}`,
      );
    }
    if (classification.failed.length > 0) {
      lines.push(`Failed to connect: ${classification.failed.join(", ")}`);
    }
    if (classification.stillPending.length > 0) {
      lines.push(
        `Still connecting (try again or proceed without): ${classification.stillPending.join(", ")}`,
      );
    }
    if (classification.needsAuth.length > 0) {
      lines.push(
        `Needs authentication (ask the user to run /mcp): ${classification.needsAuth.join(", ")}`,
      );
    }
    if (classification.disabled.length > 0) {
      lines.push(
        `Disabled (ask the user to enable via /mcp): ${classification.disabled.join(", ")}`,
      );
    }
    if (classification.unknown.length > 0) {
      lines.push(
        `Unknown (no MCP server with this name is configured): ${classification.unknown.join(", ")}`,
      );
    }
    return {
      content: lines.join("\n"),
      ...(classification.ready ? {} : { error: "Some servers are not ready" }),
    };
  }

  private sleep(milliseconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }
}

function compactCatalogResource(value: {
  serverName: string;
  uri: string;
  name: string;
  description: string | undefined;
  mimeType: string | undefined;
  isTemplate: boolean;
}): CatalogResource {
  return {
    serverName: value.serverName,
    uri: value.uri,
    name: value.name,
    ...(value.description === undefined ? {} : { description: value.description }),
    ...(value.mimeType === undefined ? {} : { mimeType: value.mimeType }),
    isTemplate: value.isTemplate,
  };
}

import { Ajv, type ValidateFunction } from "ajv";
import { createNativeDeferApproval } from "./native-defer-approval.js";
import { nativeToolPermissionMetadata } from "../permissions/native-tool-permission-metadata.js";
import { z } from "zod";
import type { McpConnection, McpRegistry } from "../mcp/mcp-registry.js";
import type { HarnessSession } from "../sessions/session.js";
import {
  ToolDeferOverlay,
  type ToolDeferOverlayValue,
} from "./tool-defer-overlay.js";
import {
  type DeferredToolDefinition,
  type JsonSchema,
  ToolSearchService,
} from "./tool-search.js";

export const deferExecuteToolParameters = z.object({
  toolName: z
    .string()
    .describe(
      "The exact name of the deferred tool to execute (as returned by ToolSearch).",
    ),
  params: z
    .record(z.string(), z.any())
    .describe(
      "The parameters to pass to the target tool. Must match the tool's parameter schema (as returned by ToolSearch in a previous turn).",
    ),
});

export type DeferExecuteInput = {
  toolName: string;
  params: Record<string, unknown> | string;
};

export type DeferredToolResult = {
  content: string;
  error?: string;
  mcpMeta?: {
    structuredContent?: unknown;
    _meta?: Record<string, unknown>;
    uiResourceUri?: string;
  };
  rawResponse?: {
    is_error: boolean;
    tool_error_code?: unknown;
  };
};

export type DeferredBuiltinTool = {
  toAutoClassifierInput?: (input: any) => string | undefined;
  aliases?: string[];
  resolveToolType?: (names: string[]) => string;
  argumentRenderer?: { displayProperties?: Array<{ name: string; type?: string }>; formatText?: (input: any) => unknown };
  name?: string;
  execute: (
    params: Record<string, unknown> | string,
    context: unknown,
    details?: unknown,
  ) => unknown | Promise<unknown>;
  needsApproval?: boolean | ((context: any, input: unknown, callId?: string) => Promise<boolean>);
  resolveRejectedResult?: (
    rawItem: Record<string, unknown>,
  ) => unknown[] | Promise<unknown[]>;
  resolveNeedPermissionArgs?: (context: unknown, input: unknown, callId?: string) => unknown;
};
export type DeferredPermissionAdapter = {
  checkPermission: (tool: unknown, context: any, input: unknown, callId: string | undefined, resolveArgs: () => Array<{ type: string; value: string }>) => Promise<{ behavior: string; message?: string }>;
  needsApproval: (tool: unknown, context: any, input: unknown, callId?: string, resolveArgs?: (...args: any[]) => unknown) => Promise<boolean>;
  isMandatoryApprovalTarget?: (session: HarnessSession, name: string) => Promise<boolean>;
};

export type DeferredBuiltinToolManager = {
  get: (name: string) =>
    | DeferredBuiltinTool
    | undefined
    | Promise<DeferredBuiltinTool | undefined>;
  ensureBuiltinDeferIndexed?: (name: string) => void | Promise<void>;
};

export type TransparentProxyResolver = {
  findForQualifiedTool?: (
    serverName: string,
    toolName: string,
    connected: readonly McpConnection[],
  ) => McpConnection | undefined | Promise<McpConnection | undefined>;
  findForBareTool?: (
    toolName: string,
    connected: readonly McpConnection[],
  ) => McpConnection | undefined | Promise<McpConnection | undefined>;
};

export type DeferExecuteContext = {
  session: HarnessSession;
  runContext?: unknown;
  toolCallId?: string;
  toolCallDetails?: unknown;
  allowedTools?: readonly string[];
  agentOverlay?: ToolDeferOverlay | ToolDeferOverlayValue;
  mcpMetadata?: Record<string, unknown>;
};

type McpContent = {
  type: string;
  text?: string;
  data?: string;
  mimeType?: string;
  resource?: { uri?: string; text?: string; [key: string]: unknown };
  [key: string]: unknown;
};

type McpSideband = {
  structuredContent?: unknown;
  _meta?: Record<string, unknown>;
  isError?: boolean;
};

export class DeferExecuteTool {
  readonly name = "DeferExecuteTool";
  readonly parameters = deferExecuteToolParameters;
  readonly argumentRenderer = { displayProperties: [{ name: "toolName" }] };

  private readonly ajv = new Ajv({ allErrors: true, coerceTypes: true });
  private readonly validateCache = new Map<string, ValidateFunction>();
  private nativeApproval?: ReturnType<typeof createNativeDeferApproval>;

  constructor(
    private readonly search: ToolSearchService,
    private readonly tools: DeferredBuiltinToolManager,
    private readonly mcp: McpRegistry,
    private readonly proxyResolver: TransparentProxyResolver = {},
    private permission?: DeferredPermissionAdapter,
  ) {}
  attachPermissionAdapter(permission: DeferredPermissionAdapter): void {
    this.permission = permission;
    this.nativeApproval = createNativeDeferApproval({ permission, toolManager: this.tools, toolSearchService: this.search,
      isMandatoryApprovalEnabled: () => this.isMandatoryApprovalEnabled(),
      isMandatoryApprovalTarget: (session: HarnessSession, name: string) => permission.isMandatoryApprovalTarget?.(session, name) ?? false,
      getMcpPermissionToolName: (name: string, definition: any) => this.getMcpPermissionToolName(name, definition),
      resolveNeedPermissionArgs: nativeToolPermissionMetadata(this.name).resolveNeedPermissionArgs,
    });
  }

  async needsApproval(context: any, rawInput: any, callId?: string): Promise<boolean> {
    if (this.nativeApproval) return this.nativeApproval.needsApproval(context, rawInput, callId);
    const input = rawInput && typeof rawInput === "object" && "value" in rawInput ? rawInput.value : rawInput;
    const name = input?.toolName;
    if (!name || typeof name !== "string") return this.defaultNeedsApproval(context, rawInput, callId);
    const decision = await this.permission?.checkPermission(this, context, rawInput, callId, () => [{ type: "command", value: name }]);
    if (decision?.behavior === "deny") {
      const session = context.context as HarnessSession | undefined;
      if (session && callId) {
        session.preToolUseHookResults ??= new Map();
        session.preToolUseHookResults.set(callId, { allowed: false, message: decision.message || `Permission denied for DeferExecuteTool(${name})`, permissionDecision: "deny" });
      }
      return false;
    }
    if (this.isMandatoryApprovalEnabled() && await this.permission?.isMandatoryApprovalTarget?.(context.context, name)) return true;
    if (decision?.behavior === "allow") { const tool = await this.tools.get(name); if (!tool || tool.needsApproval !== true) return false; }
    const definition = this.search.describe(name);
    if (name.startsWith("mcp__") || definition?.isBare === true) {
      return this.permission?.needsApproval({ name: this.getMcpPermissionToolName(name, definition), description: definition?.description || "", inputSchema: { type: "object" } }, context, input.params || {}, callId) ?? false;
    }
    const tool = await this.tools.get(name);
    if (!tool) return this.defaultNeedsApproval(context, rawInput, callId);
    if (this.permission) return this.permission.needsApproval(tool, context, input.params || {}, callId,
      (...args: any[]) => tool.resolveNeedPermissionArgs?.(args[0], args[1], args[2]));
    // Standalone host: the full product classifier remains an injected adapter.
    // Intrinsic target approvals must still pause through the real SDK.
    return typeof tool.needsApproval === "function" ? tool.needsApproval(context, input.params || {}, callId) : tool.needsApproval === true;
  }
  async defaultNeedsApproval(context: any, input: unknown, callId?: string): Promise<boolean> {
    return this.permission?.needsApproval(this, context, input, callId) ?? false;
  }
  isMandatoryApprovalEnabled(): boolean { return ["true", "1"].includes(process.env.CODEBUDDY_HIGH_CREDIT_APPROVAL_ENABLED ?? ""); }

  async execute(
    input: DeferExecuteInput,
    context: DeferExecuteContext,
  ): Promise<unknown> {
    const permissionDenial = context.toolCallId ? context.session.preToolUseHookResults?.get(context.toolCallId) : undefined;
    if (permissionDenial?.permissionDecision === "deny") return { content: permissionDenial.message || "Permission denied", error: permissionDenial.message || "Permission denied" };
    const { toolName } = input;
    const params = this.normalizeParams(input.params);
    if (!toolName || !toolName.trim()) {
      return {
        content:
          'Error: "toolName" is required. Provide the exact tool name as returned by ToolSearch.',
        error: "Missing toolName",
      } satisfies DeferredToolResult;
    }
    const denied = this.checkToolAllowed(toolName, context);
    if (denied) return denied;

    const overlay = ToolDeferOverlay.fromSnapshot(
      ToolDeferOverlay.merge(
        context.session.options.toolDeferOverlay,
        context.agentOverlay,
      ),
    );
    if (overlay.matchesForceDefer(toolName)) {
      await this.tools.ensureBuiltinDeferIndexed?.(toolName);
    }
    const definition = this.search.describe(toolName);
    if (!definition) {
      return {
        content: `Error: Tool "${toolName}" not found in the deferred tools index. Use ToolSearch first to discover available tools and their exact names.`,
        error: `Tool not found: ${toolName}`,
      } satisfies DeferredToolResult;
    }
    const validationError = this.validateParams(
      params,
      definition.parameters,
      toolName,
    );
    if (validationError) return validationError;

    return toolName.startsWith("mcp__") || definition.isBare === true
      ? this.executeMcpTool(toolName, params, context)
      : this.executeBuiltinTool(toolName, params, context);
  }

  normalizeParams(
    value: Record<string, unknown> | string,
  ): Record<string, unknown> | string {
    if (typeof value !== "string") return value;
    try {
      const parsed: unknown = JSON.parse(value);
      if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      // Invalid JSON is retained so validation can report the schema mismatch.
    }
    return value;
  }

  validateParams(
    params: Record<string, unknown> | string,
    schema: JsonSchema | undefined,
    toolName: string,
  ): DeferredToolResult | undefined {
    if (!schema || typeof schema !== "object") return undefined;
    try {
      let validate = this.validateCache.get(toolName);
      if (!validate) {
        const compiled = this.ajv.compile(schema);
        this.validateCache.set(toolName, compiled);
        validate = compiled;
      }
      if (!validate(params)) {
        const details = validate.errors
          ?.map(
            (error) =>
              `${error.instancePath || "root"}: ${error.message ?? "invalid"}`,
          )
          .join("; ");
        return {
          content: `Parameter validation failed for tool "${toolName}": ${details}\n\nExpected parameter schema:\n${JSON.stringify(schema, null, 2)}\n\nPlease adjust the params to match the schema and try again.`,
          error: `Validation failed: ${details}`,
        };
      }
    } catch {
      // WorkBuddy treats an invalid server-provided schema as non-fatal.
    }
    return undefined;
  }

  convertMcpResult(
    content: readonly McpContent[] | undefined,
    sideband?: McpSideband,
  ): DeferredToolResult {
    const uiResourceUri = extractUiResourceUri(sideband?._meta);
    const mcpMeta =
      sideband?.structuredContent || sideband?._meta || uiResourceUri
        ? {
            ...(sideband?.structuredContent === undefined
              ? {}
              : { structuredContent: sideband.structuredContent }),
            ...(sideband?._meta === undefined ? {} : { _meta: sideband._meta }),
            ...(uiResourceUri === undefined ? {} : { uiResourceUri }),
          }
        : undefined;
    const toolErrorCode = sideband?._meta?.tool_error_code;
    const rawResponse =
      sideband?.isError || toolErrorCode
        ? {
            is_error: Boolean(sideband?.isError),
            ...(toolErrorCode ? { tool_error_code: toolErrorCode } : {}),
          }
        : undefined;
    const metadata = {
      ...(mcpMeta ? { mcpMeta } : {}),
      ...(rawResponse ? { rawResponse } : {}),
    };

    if (!content || content.length === 0) {
      return { content: "(No output)", ...metadata };
    }
    if (content.some((item) => item.type === "image" && item.data)) {
      const values: Array<Record<string, unknown>> = [];
      for (const item of content) {
        if (item.type === "text") {
          values.push({ type: "text", text: item.text ?? "" });
        } else if (item.type === "image" && item.data) {
          const mimeType = item.mimeType || "image/png";
          values.push({
            type: "image_url",
            image_url: { url: `data:${mimeType};base64,${item.data}` },
          });
        } else if (item.type === "image") {
          values.push({
            type: "text",
            text: `[Image: ${item.mimeType || "image"}]`,
          });
        } else if (item.type === "resource") {
          values.push({
            type: "text",
            text:
              item.resource?.text ||
              `[Resource: ${item.resource?.uri || "unknown"}]`,
          });
        }
      }
      return { content: JSON.stringify(values), ...metadata };
    }
    const values: string[] = [];
    for (const item of content) {
      if (item.type === "text") values.push(item.text ?? "");
      else if (item.type === "image") {
        values.push(`[Image: ${item.mimeType || "image"}]`);
      } else if (item.type === "resource") {
        values.push(
          item.resource?.text ||
            `[Resource: ${item.resource?.uri || "unknown"}]`,
        );
      }
    }
    return { content: values.join("\n") || "(No text output)", ...metadata };
  }

  parseMcpToolFullName(value: string): {
    serverName: string;
    toolName: string;
    fullName: string;
  } {
    const match = value.match(/^mcp__(.+?)__(.+)$/);
    if (!match?.[1] || !match[2]) {
      throw new Error(`Invalid MCP tool name format: ${value}`);
    }
    return { serverName: match[1], toolName: match[2], fullName: value };
  }

  getMcpPermissionToolName(
    name: string,
    definition: DeferredToolDefinition | undefined,
  ): string {
    return definition?.isBare === true && definition.serverName
      ? `mcp__${definition.serverName}__${definition.rawToolName || name}`
      : name;
  }

  private checkToolAllowed(
    toolName: string,
    context: DeferExecuteContext,
  ): DeferredToolResult | undefined {
    const overlay = ToolDeferOverlay.fromSnapshot(
      ToolDeferOverlay.merge(
        context.session.options.toolDeferOverlay,
        context.agentOverlay,
      ),
    );
    if (this.search.isHiddenByOverlay(toolName, overlay)) {
      const message = `Tool "${toolName}" is not deferred in this session (NoDefer modifier). Call it directly instead of via DeferExecuteTool.`;
      return { content: `Error: ${message}`, error: message };
    }
    if (toolName.startsWith("mcp__") || this.search.isBareTool(toolName)) {
      return undefined;
    }
    const allowed = this.search.intersectAllowedTools(
      context.allowedTools,
      this.search.getSessionAllowedTools(context.session),
    );
    if (allowed && !allowed.includes(toolName)) {
      const message = `Tool "${toolName}" is not available in the current environment or configuration.`;
      return { content: `Error: ${message}`, error: message };
    }
    return undefined;
  }

  private async executeBuiltinTool(
    toolName: string,
    params: Record<string, unknown> | string,
    context: DeferExecuteContext,
  ): Promise<unknown> {
    const tool = await this.tools.get(toolName);
    if (!tool) {
      return {
        content: `Error: Tool "${toolName}" is registered but could not be instantiated. It may be disabled in the current environment.`,
        error: `Tool unavailable: ${toolName}`,
      } satisfies DeferredToolResult;
    }
    try {
      return await tool.execute(params, context.runContext ?? context, context.toolCallDetails);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: `Error executing tool "${toolName}": ${message}`,
        error: message,
      } satisfies DeferredToolResult;
    }
  }

  private async executeMcpTool(
    fullToolName: string,
    params: Record<string, unknown> | string,
    context: DeferExecuteContext,
  ): Promise<DeferredToolResult> {
    try {
      let server: McpConnection | undefined;
      const qualified = fullToolName.startsWith("mcp__");
      const parsed = qualified
        ? this.parseMcpToolFullName(fullToolName)
        : undefined;
      const serverName = parsed?.serverName;
      const connected = this.mcp.connectedServers();
      if (serverName) {
        server = connected.find((candidate) => candidate.name === serverName);
      }
      if (qualified && serverName && !server) {
        server = await this.proxyResolver.findForQualifiedTool?.(
          serverName,
          parsed?.toolName || "",
          connected,
        );
      }
      if (!qualified) {
        server = await this.proxyResolver.findForBareTool?.(
          fullToolName,
          connected,
        );
      }
      if (!server) {
        const target = serverName || `bare-name tool ${fullToolName}`;
        return {
          content: `Error: MCP server for "${target}" is not connected. Check /mcp to see available servers.`,
          error: `MCP server not connected: ${target}`,
        };
      }
      const captured: { value?: McpSideband } = {};
      const metadata = {
        ...(context.mcpMetadata ?? {}),
        __session: context.session,
        __resultMetaSink: (value: McpSideband) => {
          captured.value = value;
        },
      };
      const result = (await server.callTool(
        fullToolName,
        params as Record<string, unknown>,
        metadata,
      )) as unknown;
      const { content, sideband } = unpackMcpCallResult(result, captured.value);
      return this.convertMcpResult(content, sideband);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: `Error executing MCP tool "${fullToolName}": ${message}`,
        error: message,
      };
    }
  }
}

function unpackMcpCallResult(
  result: unknown,
  captured: McpSideband | undefined,
): { content: McpContent[]; sideband?: McpSideband } {
  if (Array.isArray(result)) {
    return {
      content: result as McpContent[],
      ...(captured === undefined ? {} : { sideband: captured }),
    };
  }
  if (result && typeof result === "object") {
    const object = result as McpSideband & { content?: McpContent[] };
    const sideband: McpSideband = captured ?? {
      ...(object.structuredContent === undefined
        ? {}
        : { structuredContent: object.structuredContent }),
      ...(object._meta === undefined ? {} : { _meta: object._meta }),
      ...(object.isError === undefined ? {} : { isError: object.isError }),
    };
    return {
      content: Array.isArray(object.content) ? object.content : [],
      sideband,
    };
  }
  return {
    content: [],
    ...(captured === undefined ? {} : { sideband: captured }),
  };
}

function extractUiResourceUri(
  metadata: Record<string, unknown> | undefined,
): string | undefined {
  if (!metadata) return undefined;
  const direct = metadata.uiResourceUri ?? metadata.ui_resource_uri;
  if (typeof direct === "string") return direct;
  const ui = metadata.ui;
  if (ui && typeof ui === "object") {
    const resourceUri = (ui as Record<string, unknown>).resourceUri;
    if (typeof resourceUri === "string") return resourceUri;
  }
  return undefined;
}

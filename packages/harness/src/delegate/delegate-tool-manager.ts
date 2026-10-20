export const DelegateToolManager = Symbol("DelegateToolManager");
export type DelegateToolDefinition = {
  name: string;
  description: string;
  inputSchema: Record<string, any>;
  provider?: unknown;
  category?: unknown;
  requiresApproval?: unknown;
  [key: string]: unknown;
};
export type DelegateToolRegistration = {
  definition: DelegateToolDefinition;
  providerId: string;
  registeredAt: number;
};
export type DelegateToolExecutionRequest = {
  sessionId: string;
  toolCallId: string;
  toolId: string;
  input: Record<string, unknown>;
  timeout: number;
};
export type DelegateClientConnection = {
  extMethod(
    method: "_codebuddy.ai/delegateTool",
    params: DelegateToolExecutionRequest,
  ): Promise<any>;
};
export type DelegateLogger = {
  debug?(...args: any[]): void;
  info?(...args: any[]): void;
  warn?(...args: any[]): void;
  error?(...args: any[]): void;
};
/** Native 8375029..8377400. Global connection/registrations and stale provider
 * ownership on ID overwrite deliberately follow the sample. */
export class DelegateToolManagerImpl {
  readonly tools = new Map<string, DelegateToolRegistration>();
  readonly providerTools = new Map<string, Set<string>>();
  connection: DelegateClientConnection | null = null;
  onToolsChanged: (() => unknown | Promise<unknown>) | null = null;
  constructor(readonly logger: DelegateLogger = {}) {}
  setConnection(connection: DelegateClientConnection): void {
    this.connection = connection;
  }
  clearConnection(): void {
    this.connection = null;
  }
  setOnToolsChanged(callback: () => unknown | Promise<unknown>): void {
    this.onToolsChanged = callback;
  }
  hasTools(): boolean {
    return this.tools.size > 0;
  }
  async registerTool(
    id: string,
    definition: DelegateToolDefinition,
    providerId: string,
  ): Promise<void> {
    this.tools.set(id, { definition, providerId, registeredAt: Date.now() });
    if (!this.providerTools.has(providerId))
      this.providerTools.set(providerId, new Set());
    this.providerTools.get(providerId)!.add(id);
    if (this.onToolsChanged)
      try {
        await this.onToolsChanged();
      } catch (error) {
        this.logger.error?.(
          "[DelegateToolManager] Failed to notify tool change:",
          error,
        );
      }
  }
  async unregisterTool(id: string): Promise<void> {
    const entry = this.tools.get(id);
    if (!entry) return;
    this.tools.delete(id);
    const provider = this.providerTools.get(entry.providerId);
    if (provider) {
      provider.delete(id);
      if (provider.size === 0) this.providerTools.delete(entry.providerId);
    }
    if (this.onToolsChanged)
      try {
        await this.onToolsChanged();
      } catch (error) {
        this.logger.error?.(
          "[DelegateToolManager] Failed to notify tool change:",
          error,
        );
      }
  }
  getTools(): Map<string, DelegateToolDefinition> {
    const result = new Map<string, DelegateToolDefinition>();
    for (const [id, entry] of this.tools) result.set(id, entry.definition);
    return result;
  }
  async executeTool(
    id: string,
    input: Record<string, unknown>,
    timeout?: number,
  ): Promise<any> {
    if (!this.tools.get(id))
      return { status: "error", error: `Tool '${id}' not found` };
    if (!this.connection)
      return { status: "error", error: "ACP connection not available" };
    try {
      const params = {
        sessionId: "",
        toolCallId: `delegate-${id}-${Date.now()}`,
        toolId: id,
        input,
        timeout: timeout || 30000,
      };
      this.logger.info?.(
        `[DelegateToolManager] executeTool BEGIN toolId=${id} toolCallId=${params.toolCallId} hasConnection=${!!this.connection} timeout=${params.timeout}`,
      );
      const result = await this.connection.extMethod(
        "_codebuddy.ai/delegateTool",
        params,
      );
      this.logger.info?.(
        `[DelegateToolManager] executeTool END toolId=${id} toolCallId=${params.toolCallId} status=${result?.status ?? "unknown"}`,
      );
      if (result.status === "success")
        return { status: "success", output: result.output };
      if (result.status === "error")
        return {
          status: "error",
          error: result.error?.message || "Unknown error",
        };
      return {
        status: result.status,
        error: `Tool execution ${result.status}`,
      };
    } catch (error) {
      return {
        status: "error",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
  async clearTools(providerId?: string): Promise<void> {
    if (providerId) {
      const tools = this.providerTools.get(providerId);
      if (tools) {
        for (const id of tools) this.tools.delete(id);
        this.providerTools.delete(providerId);
      }
    } else {
      this.tools.clear();
      this.providerTools.clear();
    }
  }
  getAvailableTools(
    _sessionId?: string,
  ): Array<DelegateToolDefinition & { id: string }> {
    const result = [];
    for (const [id, entry] of this.tools)
      result.push({ id, ...entry.definition });
    return result;
  }
}
/** Native ToolManager injection; fields are intentionally not escaped. */
export function delegateDescriptionVariables(
  manager: Pick<DelegateToolManagerImpl, "hasTools" | "getTools">,
  logger: DelegateLogger = {},
): Record<string, unknown> {
  const variables: Record<string, unknown> = {};
  try {
    logger.debug?.(
      `[ToolManager] Building DelegateTool description, hasTools=${manager.hasTools()}`,
    );
    if (manager.hasTools()) {
      const tools = manager.getTools();
      logger.debug?.(
        `[ToolManager] Found ${tools.size} delegate tools: ${Array.from(tools.keys()).join(", ")}`,
      );
      const list = [],
        details = [];
      for (const [id, definition] of tools) {
        list.push(
          `- **${id}** (${definition.name}): ${definition.description}`,
        );
        details.push(
          `### ${id}\n${definition.description}\n\nInput Schema:\n\`\`\`json\n${JSON.stringify(definition.inputSchema, null, 2)}\n\`\`\``,
        );
      }
      variables.delegateTools = list.join("\n");
      variables.delegateToolsCount = tools.size;
      variables.delegateToolsDetail = details.join("\n\n");
      logger.debug?.(
        "[ToolManager] Injected delegate tools into prompt context",
      );
    } else logger.debug?.("[ToolManager] No delegate tools registered yet");
  } catch (error: any) {
    logger.error?.(
      `[ToolManager] Failed to inject delegate tools: ${error?.message}`,
    );
  }
  return variables;
}

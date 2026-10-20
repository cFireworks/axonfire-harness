import type {
  DelegateToolManagerImpl,
  DelegateLogger,
} from "./delegate-tool-manager.js";
/** ACP Agent.handleDelegateToolsChanged 6905059..6906164. Explicit dependency
 * getter replaces ContainerUtil; not a full ACP server or authorization gate. */
export class DelegateToolsChangedHandler {
  constructor(
    readonly getManager: () => Pick<
      DelegateToolManagerImpl,
      "registerTool" | "unregisterTool"
    >,
    readonly logger: DelegateLogger = {},
  ) {}
  async handleDelegateToolsChanged(input: any): Promise<Record<string, never>> {
    try {
      const change = input.changeType,
        tools = input.tools,
        provider = input.providerId || input.sessionId || "unknown";
      this.logger.info?.(
        `[handleDelegateToolsChanged] enter changeType=${change} providerId=${provider} tools.count=${Array.isArray(tools) ? tools.length : "n/a"} toolIds.count=${Array.isArray(input.toolIds) ? input.toolIds.length : "n/a"}`,
      );
      const manager = this.getManager();
      if (change === "added" && tools && Array.isArray(tools))
        for (const tool of tools) {
          const definition = {
            name: tool.name,
            description: tool.description,
            inputSchema: tool.inputSchema || {},
            provider: tool.provider,
            category: tool.category,
            requiresApproval: tool.requiresApproval,
          };
          await manager.registerTool(tool.id, definition, provider);
          this.logger.info?.(
            `[ACP Agent] Registered delegate tool: ${tool.id} from provider: ${provider}`,
          );
        }
      else if (change === "removed")
        for (const id of Array.isArray(tools)
          ? tools
              .map((tool) => (typeof tool === "string" ? tool : tool?.id))
              .filter(Boolean)
          : Array.isArray(input.toolIds)
            ? input.toolIds.filter((tool: any) => typeof tool === "string")
            : []) {
          await manager.unregisterTool(id);
          this.logger.info?.(`[ACP Agent] Unregistered delegate tool: ${id}`);
        }
      return {};
    } catch (error: any) {
      this.logger.error?.(
        `Failed to handle delegate tools changed: ${error?.message}`,
      );
      throw error;
    }
  }
}

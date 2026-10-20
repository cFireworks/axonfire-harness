import {
  ListMcpResourcesTool,
  McpResourceCatalogService,
  ReadMcpResourceTool,
  WaitForMcpServersTool,
} from "../mcp/mcp-resource-tools.js";
import type { McpRegistry } from "../mcp/mcp-registry.js";
import { DeferExecuteTool } from "./defer-execute-tool.js";
import type { ToolDeferOverlayValue } from "./tool-defer-overlay.js";
import type { ToolManager } from "./tool-manager.js";
import { ToolSearchService, ToolSearchTool } from "./tool-search.js";

export type DeferredRuntimeRegistrationOptions = {
  search?: ToolSearchService;
  resolveAllowedTools?: (
    agentName: string | undefined,
  ) => readonly string[] | undefined | Promise<readonly string[] | undefined>;
  resolveAgentOverlay?: (
    agentName: string | undefined,
  ) => ToolDeferOverlayValue | undefined;
  cwd?: string | (() => string);
};

/**
 * Registers the five recovered defer/MCP resource tools on the ordinary
 * ToolManager so the reconstructed path is executable through Agents SDK.
 */
export function registerDeferredRuntimeTools(
  manager: ToolManager,
  mcp: McpRegistry,
  options: DeferredRuntimeRegistrationOptions = {},
): {
  search: ToolSearchService;
  toolSearch: ToolSearchTool;
  deferExecute: DeferExecuteTool;
  catalog: McpResourceCatalogService;
  listResources: ListMcpResourcesTool;
  readResource: ReadMcpResourceTool;
  waitForServers: WaitForMcpServersTool;
} {
  const search = options.search ?? new ToolSearchService();
  manager.attachToolSearch(search);
  const toolSearch = new ToolSearchTool(search);
  const deferExecute = new DeferExecuteTool(search, manager, mcp);
  const catalog = new McpResourceCatalogService(mcp);
  const listResources = new ListMcpResourcesTool(catalog);
  const readResource = new ReadMcpResourceTool(
    mcp,
    catalog,
    options.cwd ?? process.cwd(),
  );
  const waitForServers = new WaitForMcpServersTool(mcp);

  manager.register("ToolSearch", {
    parameters: toolSearch.parameters,
    needsApproval: false,
    execute: async (input, runContext) => {
      const session = runContext.context;
      const allowedTools = await options.resolveAllowedTools?.(
        session.agentName,
      );
      const agentOverlay = options.resolveAgentOverlay?.(session.agentName);
      return toolSearch.execute(toolSearch.parameters.parse(input), {
        session,
        ...(allowedTools === undefined ? {} : { allowedTools }),
        ...(agentOverlay === undefined ? {} : { agentOverlay }),
        ensureBuiltinDeferIndexed: (name) =>
          manager.ensureBuiltinDeferIndexed(name),
      });
    },
  });
  manager.register("DeferExecuteTool", {
    parameters: deferExecute.parameters,
    needsApproval: (context, input, callId) => deferExecute.needsApproval(context, input, callId),
    execute: async (input, runContext, details) => {
      const session = runContext.context;
      const allowedTools = await options.resolveAllowedTools?.(
        session.agentName,
      );
      const agentOverlay = options.resolveAgentOverlay?.(session.agentName);
      return deferExecute.execute(
        input as { toolName: string; params: Record<string, unknown> },
        {
          session,
          runContext,
          ...(details ? { toolCallDetails: details } : {}),
          ...(details?.toolCall?.callId ? { toolCallId: details.toolCall.callId } : {}),
          ...(allowedTools === undefined ? {} : { allowedTools }),
          ...(agentOverlay === undefined ? {} : { agentOverlay }),
        },
      );
    },
  });
  manager.register("ListMcpResources", {
    parameters: listResources.parameters,
    needsApproval: false,
    isEnabled: () => listResources.isEnabled(),
    execute: (input) => listResources.execute(listResources.parameters.parse(input)),
  });
  manager.register("ReadMcpResource", {
    parameters: readResource.parameters,
    needsApproval: false,
    isEnabled: () => readResource.isEnabled(),
    execute: (input) => readResource.execute(readResource.parameters.parse(input)),
  });
  manager.register("WaitForMcpServers", {
    parameters: waitForServers.parameters,
    needsApproval: false,
    isEnabled: () => waitForServers.isEnabled(),
    execute: (input) =>
      waitForServers.execute(waitForServers.parameters.parse(input)),
  });

  return {
    search,
    toolSearch,
    deferExecute,
    catalog,
    listResources,
    readResource,
    waitForServers,
  };
}

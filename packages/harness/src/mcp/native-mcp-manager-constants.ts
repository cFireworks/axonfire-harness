// Fixed sample module 73850 constants; dependency symbols are injected separately.
export const McpScope = {
  PLUGIN: "plugin",
  USER: "user",
  PROJECT: "project",
  LOCAL: "local",
  DYNAMIC: "dynamic",
  SDK: "sdk",
  INTERNAL: "internal",
} as const;
export const MERGE_SCOPE_PRIORITY = Object.freeze([
  McpScope.INTERNAL,
  McpScope.SDK,
  McpScope.DYNAMIC,
  McpScope.LOCAL,
  McpScope.PROJECT,
  McpScope.USER,
  McpScope.PLUGIN,
]);
export { McpServerStatus } from "./mcp-registry.js";
export const DefaultMcpConfig = { mcpServers: {}, disabledMcpServers: [] };
export const McpConfigDiagnosticSeverity = {
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
} as const;
export const MCP_FILENAME = ".codebuddy.json";
export const MCP_LOCAL_FILENAME = ".mcp.json";
export const MCP_IDE_FILENAME = "mcp.json";
export const MCP_USER_DOT_MCP_FILENAME = ".mcp.json";
export const MAX_MCP_OUTPUT_TOKENS = 20000;
export const TOOL_SHORT_DESCRIPTION_META_KEY = "shortDescription";

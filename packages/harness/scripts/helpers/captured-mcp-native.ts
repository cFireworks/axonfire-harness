import { createHash } from "node:crypto";
import { runInNewContext } from "node:vm";
import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";
import { Subject } from "rxjs";
import {
  user,
  MCPServerStdio,
  MCPServerSSE,
  MCPServerStreamableHttp,
} from "@openai/agents-core";
import * as underlying from "@openai/agents-core/_shims";
import { Client } from "mcp-sdk-native/client/index.js";
import { StdioClientTransport } from "mcp-sdk-native/client/stdio.js";
import { SSEClientTransport } from "mcp-sdk-native/client/sse.js";
import { StreamableHTTPClientTransport } from "mcp-sdk-native/client/streamableHttp.js";
import * as schemas from "mcp-sdk-native/types.js";
import {
  ChannelNotificationSchema,
  ChannelPermissionResponseSchema,
} from "../../src/channels/channel-constants.js";
import { PermissionMode } from "../../src/permissions/permission.js";
import { ToolArgType } from "../../src/permissions/native-permission-policy.js";
import { ToolNames } from "../../src/tools/tool-names.js";
import { ToolDeferOverlay } from "../../src/tools/native-tool-specs.js";
import { McpToolCallContext } from "../../src/mcp/mcp-tool-call-context.js";
import { createNativeHostDetection } from "../../src/permissions/native-host-detection.js";
import { createNativeMcpUtils } from "../../src/mcp/native-mcp-utils.js";
import { createNativeMcpResultProcessor } from "../../src/mcp/native-mcp-results.js";
import { createNativeMcpUi } from "../../src/mcp/native-mcp-ui.js";
import * as path from "node:path";
import * as fs from "node:fs/promises";
import * as crypto from "node:crypto";
export const MCP_NATIVE_CLASSES = [
  ["OverriddenUnderlyingMCPServerStdio", 9163484, 9167354],
  ["OverriddenMCPServerStdio", 9167384, 9168040],
  ["OverriddenUnderlyingMCPServerSSE", 9168078, 9172056],
  ["OverriddenMCPServerSSE", 9172084, 9172734],
  ["OverriddenUnderlyingMCPServerStreamableHttp", 9172783, 9176847],
  ["OverriddenMCPServerStreamableHttp", 9176886, 9177569],
  ["SdkMcpTransport", 9177633, 9178529],
  ["SdkMcpServer", 9179086, 9185768],
  ["McpServerManager", 9186841, 9198615],
  ["McpTransportManager", 9284064, 9285512],
] as const;
export function loadCapturedMcpRuntime(source: string) {
  if (
    createHash("sha256").update(source).digest("hex") !==
    "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd"
  )
    throw Error("sample hash");
  return (runtime: any) => {
    const context: any = {
      Error,
      Map,
      Set,
      Promise,
      Object,
      Reflect,
      Proxy,
      Symbol,
      Number,
      String,
      Array,
      JSON,
      AbortController,
      Headers,
      URL,
      Date: { now: runtime.now ?? Date.now },
      process: { env: runtime.env ?? process.env },
      setTimeout: runtime.setTimeout ?? setTimeout,
      clearTimeout: runtime.clearTimeout ?? clearTimeout,
      fetch: runtime.fetch ?? fetch,
      tU: {
        ContainerUtil: {
          get: (name: string) => {
            if (!(name in runtime.dependencies))
              throw Error("MCP host dependency not configured: " + name);
            return runtime.dependencies[name];
          },
        },
        generateUUUID: runtime.uuid ?? randomUUID,
      },
      tF: {
        ...schemas,
        Client: runtime.Client ?? Client,
        MCPServerStdio,
        MCPServerSSE,
        MCPServerStreamableHttp,
        UnderlyingMCPServerStdio: underlying.MCPServerStdio,
        UnderlyingMCPServerSSE: underlying.MCPServerSSE,
        UnderlyingMCPServerStreamableHttp: underlying.MCPServerStreamableHttp,
        McpTransportManager: "transportManager",
        SdkMcpMessageClient: "sdkMcpMessageClient",
        McpSubagentToolManager: "subagentTools",
        MAX_MCP_OUTPUT_TOKENS: 20000,
        ...runtime.sdkBindings,
      },
      Ay: { Client: runtime.Client ?? Client },
      tH: { Subject },
      t8: {
        McpUtils: runtime.mcpUtils ?? createNativeMcpUtils(runtime),
        PermissionUtils: runtime.permissionUtils,
        PathUtils: { getWorkDir: runtime.getWorkDir },
      },
      t1: {
        SessionManager: "sessions",
        SessionStore: "store",
        SessionRunStateMachine: "stateMachine",
        MessageQueueManager: "queue",
      },
      t2: { PermissionMode, SettingsManager: "settings" },
      t3: {
        ToolArgType,
        ToolNames,
        ToolHookManager: "toolHooks",
        ToolPermissionService: "permissions",
      },
      t4: { ToolDeferOverlay, AgentToolDeferOverlayCache: "overlayCache" },
      tq: { DeferToolConfigService: "deferConfig" },
      tK: { ConsoleManager: "console" },
      tZ: { PaymentInterceptor: "payment" },
      tY: createNativeHostDetection(runtime),
      tX: { HOST_CAPABILITIES_ENV: "CODEBUDDY_HOST_CAPABILITIES" },
      AE: { McpToolCallContext },
      AC: {
        broadcastMcpUiForToolCall:
          runtime.broadcastMcpUiForToolCall ??
          createNativeMcpUi({
            mcpUtils: runtime.mcpUtils,
            broadcast: runtime.dependencies.broadcast,
          }).broadcastMcpUiForToolCall,
      },
      Al: { AgentService: "service", AgentManager: "agents" },
      Ac: { user },
      Au: {
        ChannelManager: "channels",
        ChannelSecurityManager: "channelSecurity",
        ChannelPermissionAdapter: "channelPermission",
        ChannelNotificationSchema,
        ChannelPermissionResponseSchema,
      },
      tj: {
        Logger: "logger",
        EventService: "events",
        Events: { McpToolCall: "mcp_tool_call" },
        SPAN_NAME_MCP_CALL: "codebuddy_code.mcp_call",
        SPAN_TYPE_MCP_CALL: "mcp_call",
        TOOL_BASE_ATTRS: { SPAN_TYPE: "span.type" },
        TOOL_DETAIL_ATTRS: { MCP_SERVER: "mcp.server", MCP_TOOL: "mcp.tool" },
        ...runtime.spanConstants,
      },
      Aq: {
        StdioClientTransport:
          runtime.StdioClientTransport ?? StdioClientTransport,
      },
      AJ: {
        SSEClientTransport: runtime.SSEClientTransport ?? SSEClientTransport,
      },
      Az: {
        StreamableHTTPClientTransport:
          runtime.StreamableHTTPClientTransport ??
          StreamableHTTPClientTransport,
      },
      Ap: { MODEL_ID_HEADER: "X-Model-ID" },
      Ag: Symbol.for("@genie/agent-cli.mcp-model-id-header:wrapped"),
      Ah: new AsyncLocalStorage(),
      Af: 30000,
      Am: 500,
      Aw: 500,
      processMcpResult:
        runtime.processMcpResult ??
        createNativeMcpResultProcessor(runtime).processMcpResult,
    };
    const fn =
      source.slice(9152489, 9153050) +
      source.slice(9157830, 9158717) +
      source.slice(9158735, 9163445) +
      source.slice(9178530, 9178669) +
      source.slice(9178680, 9179069) +
      source.slice(9186396, 9186831);
    const declarations = MCP_NATIVE_CLASSES.map(
      ([name, start, end]) => `const ${name}=(${source.slice(start, end)});`,
    ).join("\n");
    return runInNewContext(
      `${fn}\n${declarations}\neu=McpServerManager;SdkMcpServer.mockLogger={debug(){},info(){},warn(){},error(){}};SdkMcpServer.LIST_TOOLS_RETRY_COOLDOWN=30000;({${MCP_NATIVE_CLASSES.map(([name]) => name).join(",")},extractProgressCallback,withMcpModelIdHeader,emitMcpToolResultSideband,sanitizeMcpErrorMessage,computeMcpConfigFingerprint,hasStaticAuthorization});`,
      context,
    );
  };
}
export function loadCapturedMcpResults(source: string) {
  if (
    createHash("sha256").update(source).digest("hex") !==
    "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd"
  )
    throw Error("sample hash");
  return (runtime: any) =>
    runInNewContext(
      source.slice(9153118, 9157667) +
        ";({processMcpResult,computeCharCount,truncateMcpContent,getToolResultsDir})",
      {
        Error,
        Number,
        String,
        Map,
        JSON,
        t5: runtime.crypto ?? crypto,
        t9: runtime.fs ?? fs,
        t7: path,
        An: { PathUtils: { getHomeProjectDir: runtime.getHomeProjectDir } },
        Date: { now: runtime.now ?? Date.now },
        process: { env: runtime.env ?? process.env },
      },
    );
}

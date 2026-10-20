import { createNativeMcpRuntime } from "../../src/mcp/native-mcp-runtime.js";
import { createNativeMcpUtils } from "../../src/mcp/native-mcp-utils.js";
import { createNativeMcpResultProcessor } from "../../src/mcp/native-mcp-results.js";
import { HarnessSession } from "../../src/sessions/session.js";
import { createNativeMcpUi } from "../../src/mcp/native-mcp-ui.js";
import { McpToolCallContext } from "../../src/mcp/mcp-tool-call-context.js";
export type McpProxyCase = {
  transparent?: boolean;
  builtin?: boolean;
  alias?: boolean;
  preDeny?: boolean;
  preError?: boolean;
  rewrite?: boolean;
  postError?: boolean;
  hint?: boolean;
  callError?: boolean;
  payment?: boolean;
  desktop?: boolean;
  sideband?: boolean;
  session?: boolean;
  ui?: boolean;
};
export function mcpNativeFixture(
  spec: McpProxyCase = {},
  construct: any = createNativeMcpRuntime,
) {
  const events: any[] = [],
    session = new HarnessSession("owned-mcp"),
    now = () => 23;
  session.options.model = "owned-model";
  session.conversationRequestId = "owned-request";
  session.messageId = "owned-message";
  const logger = Object.fromEntries(
    ["info", "debug", "warn", "error", "log"].map((name) => [name, () => {}]),
  );
  const mcpUtils = createNativeMcpUtils({ env: {} }),
    result = createNativeMcpResultProcessor({
      now,
      getHomeProjectDir: () => "/owned",
      env: { CODEBUDDY_DISABLE_MCP_LARGE_OUTPUT_FILES: "1" },
    }),
    broadcast = {
      async broadcastMcpUi(...args: any[]) {
        events.push(["ui", ...args]);
      },
    },
    ui = createNativeMcpUi({ mcpUtils, broadcast });
  const dependencies: any = {
    logger,
    console: logger,
    store: { getSessionFilePath: () => "/owned/transcript.jsonl" },
    toolHooks: {
      async executePreToolUseHooks(...args: any[]) {
        events.push(["pre", args[0], args[1], args[3], args[4], args[5]]);
        if (spec.preError) throw Error("owned pre failure");
        return {
          allowed: !spec.preDeny,
          ...(spec.rewrite ? { modifiedInput: { owned: "rewritten" } } : {}),
        };
      },
      async executePostToolUseHooks(...args: any[]) {
        events.push([
          "post",
          args[0],
          args[1],
          args[2],
          args[2]._meta,
          args[2].is_error,
        ]);
        if (spec.postError) throw Error("owned post failure");
        return spec.hint
          ? { additionalContext: "owned hint", message: "owned message" }
          : {};
      },
    },
    payment: {
      async scanMcpResult(_server: any, _tool: any, content: any) {
        return spec.payment
          ? [{ type: "text", text: "owned payment replacement" }]
          : undefined;
      },
    },
    permissions: {
      async needsApproval(tool: any, ...args: any[]) {
        events.push(["approval", tool.name, args[1], args[2]]);
        return true;
      },
    },
    events: {
      async report(...args: any[]) {
        events.push(["event", ...args]);
      },
    },
  };
  const runtime: any = {
    now,
    uuid: () => "owned-span",
    env: spec.desktop ? { CODEBUDDY_HOST: "workbuddy-desktop" } : {},
    dependencies,
    mcpUtils,
    permissionUtils: {},
    getWorkDir: () => "/owned/workdir",
    processMcpResult: result.processMcpResult,
    broadcastMcpUiForToolCall: ui.broadcastMcpUiForToolCall,
  };
  const classes = construct(runtime),
    manager = Object.assign(new classes.McpServerManager(), {
      logger,
      consoleManager: logger,
    });
  const name = spec.builtin ? "Read" : spec.alias ? "backend_echo" : "echo";
  const rawTools = [
    {
      name,
      description: "owned",
      inputSchema: { type: "object" },
      _meta: spec.alias
        ? { serverName: "backend", defer_loading: false }
        : spec.ui
          ? { ui: { resourceUri: "ui://owned", prefersBorder: false } }
          : undefined,
    },
  ];
  const underlying: any = {
    name: "owned-server",
    async listTools() {
      return rawTools;
    },
    async callTool(name: string, args: any, meta: any) {
      events.push([
        "call",
        name,
        args,
        Object.keys(meta ?? {}),
        meta?.modelId,
        meta?.["workbuddy.ai/conversationId"],
      ]);
      if (spec.callError) throw Error("owned remote failure");
      if (spec.sideband)
        meta.__resultMetaSink({
          _meta: { ui: { resourceUri: "ui://owned" } },
          isError: true,
          content: [{ type: "text", text: "owned" }],
        });
      return [{ type: "text", text: "owned output" }];
    },
    async close() {
      events.push(["close"]);
    },
  };
  const config: any = {
    type: "http",
    transparent_proxy: spec.transparent === true,
    ...(spec.builtin ? { builtin_tools: ["Read"] } : {}),
    tools: {},
  };
  manager.underlyingCache.set("owned-server", underlying);
  manager.configByName.set("owned-server", config);
  const proxy = manager.createServerProxy("owned-server", config);
  async function execute() {
    const tools = await proxy.listTools(),
      tool = tools[0];
    await tool.needsApproval(
      { context: session },
      { owned: "argument" },
      "owned-call",
    );
    let output, error;
    McpToolCallContext.enter("owned-call", tool.name);
    try {
      output = await proxy.callTool(
        tool.name,
        { owned: "argument" },
        spec.session === false
          ? undefined
          : { __session: session, __timeoutMs: 100, __onProgress() {} },
      );
    } catch (e: any) {
      error = e.message;
    } finally {
      McpToolCallContext.clear();
    }
    return {
      events,
      output,
      error,
      name: tool.name,
      schema: tool.inputSchema,
      config,
    };
  }
  return {
    runtime,
    classes,
    manager,
    proxy,
    underlying,
    session,
    events,
    execute,
  };
}

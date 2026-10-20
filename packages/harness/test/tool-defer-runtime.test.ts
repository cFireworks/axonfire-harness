import assert from "node:assert/strict";
import test from "node:test";
import type { McpConnection } from "../src/mcp/mcp-registry.js";
import { McpRegistry } from "../src/mcp/mcp-registry.js";
import { HarnessSession } from "../src/sessions/session.js";
import {
  DeferExecuteTool,
  type DeferredBuiltinToolManager,
} from "../src/tools/defer-execute-tool.js";
import {
  parseToolSpecs,
  ToolDeferOverlay,
} from "../src/tools/tool-defer-overlay.js";
import {
  ToolSearchService,
  ToolSearchTool,
  toolSearchParameters,
} from "../src/tools/tool-search.js";

test("tool spec modifiers force defer and keep dispatcher tools active", () => {
  const parsed = parseToolSpecs([
    "Read",
    "Defer(ImageGen)",
    "Defer(mcp__design__*)",
    "NoDefer(mcp__design__inspect)",
  ]);
  assert.deepEqual(parsed.tools, ["Read", "ToolSearch", "DeferExecuteTool"]);
  const overlay = ToolDeferOverlay.fromSnapshot(parsed.overlay);
  assert.equal(overlay.matchesForceDefer("ImageGen"), true);
  assert.equal(overlay.matchesForceDefer("mcp__design__render"), true);
  assert.equal(overlay.decide("mcp__design__inspect"), false);
  assert.equal(overlay.decide("DeferExecuteTool"), false);
});

test("ToolSearch indexes deferred tools, filters visibility, and bypasses MCP allowlists", async () => {
  const service = new ToolSearchService();
  await service.indexTool({
    name: "ImageGen",
    description: "Generate images from a prompt",
    summary: "image generation",
    parameters: { type: "object", properties: { prompt: { type: "string" } } },
    defer_loading: true,
  });
  await service.indexTool({
    name: "HiddenImageTool",
    description: "Generate a hidden image",
    defer_loading: true,
    shouldShow: () => false,
  });
  await service.indexTool({
    name: "mcp__time__current_time",
    description: "Get the current time",
    defer_loading: true,
    serverName: "time",
  });
  await service.indexTool({
    name: "NotDeferred",
    description: "must not be indexed",
    defer_loading: false,
  });

  assert.deepEqual(
    (await service.search("image", 10)).map((item) => item.name),
    ["ImageGen"],
  );
  assert.deepEqual(
    (await service.search("time", 10, { allowedTools: ["ImageGen"] })).map(
      (item) => item.name,
    ),
    ["mcp__time__current_time"],
  );
  assert.equal(service.describe("NotDeferred"), undefined);
  service.removeToolsByServer("time");
  assert.equal(service.describe("mcp__time__current_time"), undefined);
});

test("ToolSearch exact lookup returns schema and fuzzy fallback with original wording", async () => {
  const service = new ToolSearchService();
  await service.indexTool({
    name: "ImageGen",
    description: "Generate an image",
    parameters: {
      type: "object",
      properties: { prompt: { type: "string" } },
      required: ["prompt"],
    },
    defer_loading: true,
  });
  const input = toolSearchParameters.parse({ tool_names: "ImageGen" });
  const result = await new ToolSearchTool(service).execute(input, {
    session: new HarnessSession("search"),
  });
  assert.match(result.content, /Found 1 tool\(s\)\. Use DeferExecuteTool/);
  assert.match(result.content, /## ImageGen/);
  assert.match(result.content, /"prompt"/);

  const fallback = await new ToolSearchTool(service).execute(
    toolSearchParameters.parse({ tool_names: ["Image"] }),
    { session: new HarnessSession("fallback") },
  );
  assert.match(fallback.content, /## ImageGen/);
});

test("DeferExecute validates and coerces params before invoking builtin tools", async () => {
  const service = new ToolSearchService();
  await service.indexTool({
    name: "Resize",
    description: "Resize an asset",
    parameters: {
      type: "object",
      properties: { width: { type: "number" } },
      required: ["width"],
      additionalProperties: false,
    },
    defer_loading: true,
  });
  let received: unknown;
  const manager: DeferredBuiltinToolManager = {
    get: () => ({
      execute: (params) => {
        received = params;
        return { content: "done" };
      },
    }),
  };
  const tool = new DeferExecuteTool(service, manager, new McpRegistry());
  const result = await tool.execute(
    { toolName: "Resize", params: '{"width":"42"}' },
    { session: new HarnessSession("defer"), allowedTools: ["Resize"] },
  );
  assert.deepEqual(result, { content: "done" });
  assert.deepEqual(received, { width: 42 });

  const invalid = (await tool.execute(
    { toolName: "Resize", params: {} },
    { session: new HarnessSession("invalid"), allowedTools: ["Resize"] },
  )) as { content: string; error: string };
  assert.match(invalid.content, /Parameter validation failed/);
  assert.match(invalid.error, /must have required property 'width'/);
});

test("DeferExecute honors NoDefer and converts MCP image/meta results", async () => {
  const service = new ToolSearchService();
  await service.indexTool({
    name: "mcp__vision__render",
    description: "Render an image",
    parameters: { type: "object" },
    defer_loading: true,
    serverName: "vision",
  });
  const mcp = new McpRegistry();
  mcp.register({
    name: "vision",
    connected: true,
    callTool: async () => ({
      content: [
        { type: "text", text: "preview" },
        { type: "image", mimeType: "image/png", data: "YWJj" },
      ],
      structuredContent: { id: 1 },
      _meta: { uiResourceUri: "ui://preview" },
    }),
  } as unknown as McpConnection);
  const tool = new DeferExecuteTool(service, { get: () => undefined }, mcp);
  const blockedSession = new HarnessSession("blocked");
  blockedSession.options.toolDeferOverlay = {
    forceDefer: { exact: [], glob: [] },
    forceNoDefer: { exact: ["mcp__vision__render"], glob: [] },
  };
  const blocked = (await tool.execute(
    { toolName: "mcp__vision__render", params: {} },
    { session: blockedSession },
  )) as { error: string };
  assert.match(blocked.error, /NoDefer modifier/);

  const result = (await tool.execute(
    { toolName: "mcp__vision__render", params: {} },
    { session: new HarnessSession("mcp") },
  )) as { content: string; mcpMeta: { uiResourceUri: string } };
  assert.deepEqual(JSON.parse(result.content), [
    { type: "text", text: "preview" },
    {
      type: "image_url",
      image_url: { url: "data:image/png;base64,YWJj" },
    },
  ]);
  assert.equal(result.mcpMeta.uiResourceUri, "ui://preview");
});

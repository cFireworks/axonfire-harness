import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  CONNECTOR_PROXY_SERVER_NAME,
  ListMcpResourcesTool,
  McpResourceCatalogService,
  parseConnectorResourceUri,
  ReadMcpResourceTool,
  WaitForMcpServersTool,
} from "../src/mcp/mcp-resource-tools.js";
import {
  type McpConnection,
  McpRegistry,
  McpServerStatus,
} from "../src/mcp/mcp-registry.js";

test("connector resource URIs expose backend short names", () => {
  assert.deepEqual(
    parseConnectorResourceUri(
      "mcp+connector://workspace%3Adrive/drive%3A%2F%2Fdocument%2F1",
    ),
    {
      configId: "workspace:drive",
      originalUri: "drive://document/1",
      backendShortName: "drive",
    },
  );
});

test("MCP resource catalog combines resources and templates and isolates server errors", async () => {
  const mcp = new McpRegistry();
  mcp.register({
    name: CONNECTOR_PROXY_SERVER_NAME,
    callTool: async () => [],
    listResources: async () => [
      {
        uri: "mcp+connector://org%3Adrive/drive%3A%2F%2Ffile%2F1",
        name: "File one",
        mimeType: "text/plain",
      },
    ],
    listResourceTemplates: async () => [
      { uriTemplate: "drive://folder/{id}", name: "Folder" },
    ],
  } as unknown as McpConnection);
  mcp.register({
    name: "broken",
    callTool: async () => [],
    listResources: async () => {
      throw new Error("offline");
    },
    listResourceTemplates: async () => [],
  } as unknown as McpConnection);
  const catalog = new McpResourceCatalogService(mcp);
  const resources = await catalog.listResources();
  assert.equal(resources.length, 2);
  assert.equal(resources[0]?.serverName, "drive");
  assert.equal(resources[1]?.serverName, CONNECTOR_PROXY_SERVER_NAME);
  assert.equal(resources[1]?.isTemplate, true);

  const listed = await new ListMcpResourcesTool(catalog).execute({
    server: "drive",
  });
  const parsed = JSON.parse(listed.content) as { count: number; type: string };
  assert.equal(parsed.type, "list_mcp_resources_result");
  assert.equal(parsed.count, 1);
});

test("ReadMcpResource uses connector proxy and persists binary content", async () => {
  const directory = await mkdtemp(join(tmpdir(), "workbuddy-mcp-test-"));
  try {
    const mcp = new McpRegistry();
    mcp.register({
      name: CONNECTOR_PROXY_SERVER_NAME,
      callTool: async () => [],
      listResources: async () => [{ uri: "connector://logo" }],
      listResourceTemplates: async () => [],
      readResource: async () => [
        {
          uri: "connector://logo",
          mimeType: "image/png",
          blob: Buffer.from("png-bytes").toString("base64"),
        },
      ],
    } as unknown as McpConnection);
    const catalog = new McpResourceCatalogService(mcp);
    const result = await new ReadMcpResourceTool(
      mcp,
      catalog,
      directory,
    ).execute({ server: "drive", uri: "connector://logo" });
    const parsed = JSON.parse(result.content) as {
      contents: Array<{ blobSavedTo: string }>;
    };
    assert.match(parsed.contents[0]?.blobSavedTo ?? "", /\.png$/);
    assert.equal(
      await readFile(parsed.contents[0]?.blobSavedTo ?? "", "utf8"),
      "png-bytes",
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("WaitForMcpServers classifies all recovered states and exact messages", async () => {
  const mcp = new McpRegistry();
  for (const [name, status] of [
    ["ok", McpServerStatus.CONNECTED],
    ["failed", McpServerStatus.DISCONNECTED],
    ["auth", McpServerStatus.UNAUTHORIZED],
    ["disabled", McpServerStatus.PENDING_APPROVAL],
  ] as const) {
    mcp.register({
      name,
      status,
      connected: status === McpServerStatus.CONNECTED,
      callTool: async () => [],
    } as unknown as McpConnection);
  }
  const tool = new WaitForMcpServersTool(mcp, 0, 0);
  const result = await tool.execute({
    servers: ["OK", "failed", "auth", "disabled", "missing"],
  });
  assert.match(result.content, /^ready: false/);
  assert.match(result.content, /Connected .*: ok/);
  assert.match(result.content, /Failed to connect: failed/);
  assert.match(result.content, /Needs authentication .*: auth/);
  assert.match(result.content, /Disabled .*: disabled/);
  assert.match(result.content, /Unknown .*: missing/);
  assert.equal(result.error, "Some servers are not ready");
});

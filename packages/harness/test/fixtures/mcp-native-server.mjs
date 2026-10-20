import { Server } from "mcp-sdk-native/server/index.js";
import { StdioServerTransport } from "mcp-sdk-native/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListResourceTemplatesRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "mcp-sdk-native/types.js";
const server = new Server(
  { name: "owned-stdio", version: "1.0.0" },
  { capabilities: { tools: {}, resources: {}, prompts: {} } },
);
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "echo",
      description: "Owned fixture echo",
      inputSchema: { type: "object", properties: { text: { type: "string" } } },
    },
  ],
}));
server.setRequestHandler(CallToolRequestSchema, async (request) => ({
  content: [{ type: "text", text: "owned:" + request.params.arguments?.text }],
  _meta: { owned: "sideband" },
}));
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [{ uri: "owned://fixture", name: "owned" }],
}));
server.setRequestHandler(ReadResourceRequestSchema, async () => ({
  contents: [{ uri: "owned://fixture", text: "owned resource" }],
}));
server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => ({
  resourceTemplates: [],
}));
server.setRequestHandler(ListPromptsRequestSchema, async () => ({
  prompts: [{ name: "owned", description: "owned prompt" }],
}));
server.setRequestHandler(GetPromptRequestSchema, async () => ({
  messages: [{ role: "user", content: { type: "text", text: "owned prompt" } }],
}));
await server.connect(new StdioServerTransport());

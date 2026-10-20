import { createServer } from "node:http";
import { Server } from "mcp-sdk-native/server/index.js";
import { SSEServerTransport } from "mcp-sdk-native/server/sse.js";
import { StreamableHTTPServerTransport } from "mcp-sdk-native/server/streamableHttp.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "mcp-sdk-native/types.js";
/** Loopback-only test peer. No credentials, remote addresses or installed application state. */
export async function ownedMcpHttp() {
  const peers = new Set<Server>(),
    transports = new Set<any>(),
    sse = new Map<string, SSEServerTransport>(),
    requests: any[] = [],
    calls: any[] = [];
  const peer = () => {
    const server = new Server(
      { name: "owned-http", version: "1.0.0" },
      { capabilities: { tools: {}, prompts: {} } },
    );
    server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "echo",
          description: "owned",
          inputSchema: {
            type: "object",
            properties: { text: { type: "string" } },
          },
        },
      ],
    }));
    server.setRequestHandler(CallToolRequestSchema, async (r) => {
      calls.push(r.params);
      return {
        content: [{ type: "text", text: "owned:" + r.params.arguments?.text }],
        _meta: { owned: "remote-sideband" },
      };
    });
    peers.add(server);
    server.setRequestHandler(ListPromptsRequestSchema, async () => ({
      prompts: [
        {
          name: "greet",
          title: "Greet",
          description: "owned greeting",
          arguments: [{ name: "name", required: true }],
        },
      ],
    }));
    server.setRequestHandler(GetPromptRequestSchema, async (r) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: "owned prompt " + r.params.arguments?.name,
          },
        },
      ],
    }));
    return server;
  };
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url ?? "/", "http://127.0.0.1");
      if (req.method === "GET" && url.pathname === "/sse") {
        const transport = new SSEServerTransport("/messages", res);
        transports.add(transport);
        sse.set(transport.sessionId, transport);
        await peer().connect(transport);
        return;
      }
      const chunks: Buffer[] = [];
      for await (const chunk of req) chunks.push(Buffer.from(chunk));
      const text = Buffer.concat(chunks).toString("utf8"),
        body = text ? JSON.parse(text) : undefined;
      requests.push({
        path: url.pathname,
        method: body?.method,
        model: req.headers["x-model-id"],
      });
      if (url.pathname === "/messages") {
        const transport = sse.get(url.searchParams.get("sessionId") ?? "");
        if (!transport) {
          res.writeHead(404).end();
          return;
        }
        await transport.handlePostMessage(req, res, body);
        return;
      }
      if (url.pathname === "/mcp") {
        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: undefined,
          enableJsonResponse: true,
        });
        transports.add(transport);
        await peer().connect(transport);
        await transport.handleRequest(req, res, body);
        return;
      }
      res.writeHead(404).end();
    } catch (error: any) {
      if (!res.headersSent) res.writeHead(500);
      res.end(JSON.stringify({ ownedError: error.message }));
    }
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string")
    throw Error("owned server did not bind");
  return {
    url: `http://127.0.0.1:${address.port}`,
    requests,
    calls,
    async close() {
      await Promise.allSettled([...peers].map((peer) => peer.close()));
      await Promise.allSettled(
        [...transports].map((transport) => transport.close()),
      );
      server.closeAllConnections();
      await new Promise<void>((resolve) => server.close(() => resolve()));
    },
  };
}

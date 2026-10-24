// HTTP/SSE transport adapter for the original ACP service. Contains no agent loop.
export async function connectNativeAcp(
  origin,
  {
    onRequest,
    onNotification,
    clientCapabilities = {},
    gatewayHeaders = {},
  } = {},
) {
  const base = new URL(origin);
  if (base.protocol !== "http:" || base.hostname !== "127.0.0.1")
    throw new Error("Native ACP requires an owned loopback origin");
  const connected = await fetch(new URL("/api/v1/acp/connect", base), {
    method: "POST",
    headers: { ...gatewayHeaders, "x-codebuddy-request": "1" },
  });
  if (!connected.ok) throw new Error("Native ACP connection failed");
  const { connectionId, sessionToken } = await connected.json();
  if (typeof connectionId !== "string" || typeof sessionToken !== "string")
    throw new Error("Invalid native ACP connection");
  const headers = {
    ...gatewayHeaders,
    "x-codebuddy-request": "1",
    "acp-connection-id": connectionId,
    "acp-session-token": sessionToken,
    "content-type": "application/json",
    accept: "application/json, text/event-stream",
  };
  let nextId = 1,
    closed = false;
  const streams = new Set();
  async function post(message, { onMessage } = {}) {
    if (closed) throw new Error("Native ACP connection is closed");
    const controller = new AbortController();
    streams.add(controller);
    try {
      const response = await fetch(new URL("/api/v1/acp", base), {
        method: "POST",
        headers,
        body: JSON.stringify(message),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`Native ACP HTTP ${response.status}`);
      if (response.status === 202) {
        await response.text();
        return;
      }
      let result,
        replied = false,
        buffer = "";
      const decoder = new TextDecoder();
      async function consume(line) {
        if (!line.startsWith("data:")) return;
        const value = JSON.parse(line.slice(5).trim());
        if (value.method) {
          if (value.id !== undefined && value.id !== null) {
            let reply;
            try {
              if (!onRequest) throw new Error("Unsupported client request");
              reply = {
                jsonrpc: "2.0",
                id: value.id,
                result: await onRequest(
                  value.method,
                  value.params,
                  controller.signal,
                ),
              };
            } catch {
              reply = {
                jsonrpc: "2.0",
                id: value.id,
                error: {
                  code: -32601,
                  message: "Client request could not be completed",
                },
              };
            }
            await post(reply);
          } else {
            await onMessage?.(value);
            await onNotification?.(value);
          }
        } else if (value.id === message.id) {
          if (value.error)
            throw new Error(`Native ACP RPC ${value.error.code}`);
          result = value.result;
          replied = true;
        }
      }
      for await (const bytes of response.body) {
        buffer += decoder.decode(bytes, { stream: true });
        let newline;
        while ((newline = buffer.indexOf("\n")) !== -1) {
          const line = buffer.slice(0, newline).replace(/\r$/, "");
          buffer = buffer.slice(newline + 1);
          await consume(line);
        }
      }
      buffer += decoder.decode();
      if (buffer.trim()) await consume(buffer.replace(/\r$/, ""));
      if (!replied)
        throw new Error("Native ACP stream ended without a response");
      return result;
    } finally {
      streams.delete(controller);
    }
  }
  const client = {
    request(method, params, options) {
      return post({ jsonrpc: "2.0", id: nextId++, method, params }, options);
    },
    notify(method, params) {
      return post({ jsonrpc: "2.0", method, params });
    },
    async close() {
      if (closed) return;
      closed = true;
      for (const stream of streams) stream.abort();
      const response = await fetch(new URL("/api/v1/acp", base), {
        method: "DELETE",
        headers,
        signal: AbortSignal.timeout(3000),
      });
      await response.text();
      if (!response.ok) throw new Error("Native ACP disconnect failed");
    },
  };
  try {
    client.capabilities = await client.request("initialize", {
      protocolVersion: 1,
      clientCapabilities,
      clientInfo: { name: "axonfire-web", version: "1" },
    });
    return client;
  } catch (error) {
    await client.close().catch(() => {});
    throw error;
  }
}

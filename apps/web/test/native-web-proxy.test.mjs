import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer, request } from "node:http";
import { connect } from "node:net";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createNativeWebRuntime } from "../native-runtime.mjs";
import { nativeFixtureEnv } from "../../test/native-fixture-env.mjs";

for (const casing of ["upper", "lower"])
  test(
    `native Web original proxy environment routes model and bypasses loopback: ${casing}`,
    { timeout: 45000 },
    async () => {
      const root = await mkdtemp(join(tmpdir(), "axon-web-proxy-"));
      const tunnels = [],
        requests = [],
        sockets = new Set();
      let runtime;
      const command = `printf '%s' "$NO_PROXY"`;
      const model = createServer(async (req, res) => {
        let body = "";
        for await (const chunk of req) body += chunk;
        requests.push(JSON.parse(body));
        const first = requests.length === 1;
        const delta = first
          ? {
              role: "assistant",
              tool_calls: [
                {
                  index: 0,
                  id: "owned-proxy-env",
                  type: "function",
                  function: {
                    name: "Bash",
                    arguments: JSON.stringify({ command }),
                  },
                },
              ],
            }
          : { role: "assistant", content: "Original proxy route verified." };
        res.writeHead(200, { "content-type": "text/event-stream" });
        res.end(
          `data: ${JSON.stringify({ id: "proxy-owned", object: "chat.completion.chunk", created: 1, model: "owned-model", choices: [{ index: 0, delta, finish_reason: first ? "tool_calls" : "stop" }] })}\n\ndata: [DONE]\n\n`,
        );
      });
      const proxy = createServer((req, res) => {
        tunnels.push(req.url);
        const target = new URL(req.url);
        if (target.hostname !== "axon-owned-model.invalid") {
          res.writeHead(502);
          res.end();
          return;
        }
        const upstream = request(
          {
            hostname: "127.0.0.1",
            port: model.address().port,
            path: target.pathname,
            method: req.method,
            headers: { ...req.headers, connection: "close" },
          },
          (response) => {
            res.writeHead(response.statusCode, {
              ...response.headers,
              connection: "close",
            });
            response.pipe(res);
          },
        );
        upstream.on("error", () => res.destroy());
        req.pipe(upstream);
      });
      proxy.on("connect", (req, client, head) => {
        tunnels.push(req.url);
        if (req.url !== "axon-owned-model.invalid:80") {
          client.end("HTTP/1.1 502 Bad Gateway\r\n\r\n");
          return;
        }
        const upstream = connect(model.address().port, "127.0.0.1", () => {
          client.write("HTTP/1.1 200 Connection Established\r\n\r\n");
          if (head.length) upstream.write(head);
          client.pipe(upstream).pipe(client);
        });
        for (const socket of [client, upstream]) {
          sockets.add(socket);
          socket.on("close", () => sockets.delete(socket));
          socket.on("error", () => {
            client.destroy();
            upstream.destroy();
          });
        }
      });
      try {
        await new Promise((r) => model.listen(0, "127.0.0.1", r));
        await new Promise((r) => proxy.listen(0, "127.0.0.1", r));
        const product = join(root, "product.json");
        await writeFile(
          product,
          JSON.stringify({
            authentication: {
              type: "custom-token",
              attributes: { token: "owned" },
            },
            config: { disabled: true },
            agents: [
              {
                name: "owned-agent",
                tags: ["cli", "default"],
                instructions: "Reply briefly",
                tools: ["Bash"],
                models: ["owned-model"],
              },
            ],
            models: [
              {
                id: "owned-model",
                name: "owned-model",
                url: "http://axon-owned-model.invalid/v1",
              },
            ],
          }),
        );
        const proxyUrl = `http://127.0.0.1:${proxy.address().port}`;
        runtime = await createNativeWebRuntime({
          approveTool: async (name, input) =>
            name === "Bash" && input.command === command,
          workDir: root,
          stateDir: join(root, "state"),
          env: {
            ...nativeFixtureEnv,
            HOME: root,
            SHELL: "/bin/sh",
            AXONFIRE_NATIVE_PRODUCT_CONFIG: product,
            ...(casing === "upper"
              ? {
                  HTTP_PROXY: proxyUrl,
                  HTTPS_PROXY: proxyUrl,
                  NO_PROXY: "owned.example",
                }
              : {
                  http_proxy: proxyUrl,
                  https_proxy: proxyUrl,
                  no_proxy: "owned.example",
                }),
          },
        });
        const session = await runtime.openSession();
        assert.equal(
          await runtime.prompt(session, "Check the route"),
          "Original proxy route verified.",
        );
        const sessions = await runtime.store.getAll();
        assert.ok(sessions.some((item) => item.id === session.id));
        assert.equal(requests.length, 2);
        assert.match(
          requests[1].messages.find((message) => message.role === "tool")
            .content,
          /owned\.example,localhost,127\.0\.0\.1,::1/,
          "the actual session tool process must inherit original loopback exclusions",
        );
        assert.ok(
          tunnels.length > 0,
          "model must use the owned proxy, without resolving the reserved hostname",
        );
        assert.ok(
          tunnels.every(
            (target) =>
              target === "axon-owned-model.invalid:80" ||
              target === "http://axon-owned-model.invalid/v1",
          ),
          JSON.stringify(tunnels),
        );
      } finally {
        await runtime?.close();
        for (const socket of sockets) socket.destroy();
        model.closeAllConnections();
        proxy.closeAllConnections();
        await Promise.all([
          new Promise((r) => model.close(r)),
          new Promise((r) => proxy.close(r)),
        ]);
        await rm(root, { recursive: true, force: true });
      }
    },
  );

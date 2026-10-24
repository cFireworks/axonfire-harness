import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createWebHost } from "../server.mjs";
import { composeNativeWebRuntime } from "../native-runtime.mjs";
import { createNativeSessionReplayTransport } from "@axonfire/harness/sessions/native-session-replay-transport.js";
import { createNativeSidecarManager } from "@axonfire/harness/terminal/native-sidecar-manager.js";

// The peer is an owned ACP agent fixture, not the original CLI or a remote payment service.
// SessionManager, CodeBackend and WorkbuddyACPClient are complete recovered implementations.
for (const mode of ["accept", "decline", "cancel", "url", "abort"])
  test(
    `native controller/browser elicitation over ACP: ${mode}`,
    { timeout: 20000 },
    async () => {
      const root = await mkdtemp(join(tmpdir(), "axon-elicit-"));
      const replies = [],
        methods = [],
        streams = new Set();
      let promptResponse,
        promptId,
        sessionId,
        host,
        killed = 0;
      const json = (res, body) => {
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify(body));
      };
      const send = (value) =>
        promptResponse.write(`data: ${JSON.stringify(value)}\n\n`);
      const finish = (stopReason) => {
        send({ jsonrpc: "2.0", id: promptId, result: { stopReason } });
        promptResponse.end();
      };
      const request =
        mode === "url"
          ? {
              mode: "url",
              message: "Complete owned action",
              elicitationId: "owned-elicit",
              url: "https://example.invalid/owned",
            }
          : {
              mode: "form",
              message: "Choose owned preferences",
              requestedSchema: {
                type: "object",
                properties: {
                  color: { type: "string", enum: ["Blue", "Red"] },
                  count: { type: "integer", minimum: 1 },
                  enabled: { type: "boolean" },
                  email: { type: "string", format: "email" },
                },
                required: ["color", "count", "enabled"],
                additionalProperties: false,
              },
              _meta: { "codebuddy.ai": { elicitationId: "owned-elicit" } },
            };
      const peer = createServer(async (req, res) => {
        if (req.url.endsWith("/connect"))
          return json(res, {
            connectionId: "owned-connection",
            sessionToken: "owned-token",
          });
        if (req.method === "DELETE") {
          res.writeHead(204).end();
          return;
        }
        if (req.method === "GET") {
          res.writeHead(200, { "content-type": "text/event-stream" });
          res.write(": ready\n\n");
          streams.add(res);
          res.on("close", () => streams.delete(res));
          return;
        }
        let raw = "";
        for await (const chunk of req) raw += chunk;
        const body = JSON.parse(raw);
        methods.push(body.method);
        if (body.id === "owned-request") {
          replies.push(body.result);
          res.writeHead(202).end();
          send({
            jsonrpc: "2.0",
            method: "session/update",
            params: {
              sessionId,
              update: {
                sessionUpdate: "agent_message_chunk",
                content: { type: "text", text: "Elicitation finished" },
              },
            },
          });
          finish("end_turn");
          return;
        }
        if (body.method === "session/prompt") {
          promptId = body.id;
          promptResponse = res;
          sessionId = body.params.sessionId;
          res.writeHead(200, { "content-type": "text/event-stream" });
          send({
            jsonrpc: "2.0",
            id: "owned-request",
            method: "elicitation/create",
            params: request,
          });
          return;
        }
        if (body.method === "session/cancel") {
          res.writeHead(202).end();
          finish("cancelled");
          return;
        }
        if (body.method === "initialize")
          assert.ok(body.params.clientCapabilities.elicitation.form);
        json(res, {
          jsonrpc: "2.0",
          id: body.id,
          result:
            body.method === "initialize"
              ? { protocolVersion: 1, agentCapabilities: {} }
              : { sessionId: body.params?.sessionId },
        });
      });
      try {
        await new Promise((r) => peer.listen(0, "127.0.0.1", r));
        const endpoint = `http://127.0.0.1:${peer.address().port}/acp`;
        const gateway = createNativeSessionReplayTransport();
        const { buildAgentCliRuntimeEnv } = createNativeSidecarManager({
          gateway,
        });
        host = await createWebHost({
          configured: true,
          harness: { workDir: root },
          createRuntime: async (options) =>
            composeNativeWebRuntime(
              options,
              {
                manager: {
                  createSession: async () => ({ acpEndpoint: endpoint }),
                  killSession: async () => killed++,
                },
                gateway,
                configRoot: root,
                cliEnv: { HOME: root },
                cliPath: process.execPath,
                buildAgentCliRuntimeEnv,
                close: async () => {},
              },
              [],
              root,
            ),
        });
        const base = await host.listen(0),
          status = await (await fetch(base + "/api/status")).json();
        const post = (path, body) =>
          fetch(base + path, {
            method: "POST",
            headers: {
              "content-type": "application/json",
              "x-axonfire-csrf": status.csrf,
              Origin: base,
            },
            body: JSON.stringify(body),
          });
        const response = await post("/api/prompt", { prompt: "Elicit" });
        let buffer = "",
          decisionId,
          sawDone = false;
        for await (const chunk of response.body.pipeThrough(
          new TextDecoderStream(),
        )) {
          buffer += chunk;
          let end;
          while ((end = buffer.indexOf("\n\n")) >= 0) {
            const packet = buffer.slice(0, end);
            buffer = buffer.slice(end + 2);
            const type = packet.match(/event: (.*)/)?.[1],
              raw = packet.match(/data: (.*)/)?.[1];
            if (!raw) continue;
            const data = JSON.parse(raw);
            if (type === "elicitation") {
              decisionId = data.id;
              assert.deepEqual(data.request, request);
              if (mode === "abort") {
                await post("/api/cancel", {});
                continue;
              }
              if (mode === "accept") {
                assert.equal(
                  (
                    await post("/api/elicit", {
                      id: decisionId,
                      action: "accept",
                      content: { color: "invalid" },
                    })
                  ).status,
                  400,
                );
                assert.equal(
                  (
                    await post("/api/elicit", {
                      id: decisionId,
                      action: "accept",
                      content: {
                        color: "Blue",
                        count: 2,
                        enabled: false,
                        email: "invalid-email",
                      },
                    })
                  ).status,
                  400,
                );
                assert.equal(replies.length, 0);
              }
              const answer = {
                id: decisionId,
                action: mode === "url" ? "accept" : mode,
                ...(mode === "accept"
                  ? { content: { color: "Blue", count: 2, enabled: false } }
                  : {}),
              };
              assert.equal((await post("/api/elicit", answer)).status, 200);
            }
            if (type === "done") sawDone = true;
            if (type === "error" && mode !== "abort")
              assert.fail(JSON.stringify(data));
          }
        }
        assert.ok(decisionId);
        assert.equal(sawDone, mode !== "abort");
        assert.equal(
          (await post("/api/elicit", { id: decisionId, action: "cancel" }))
            .status,
          404,
        );
        if (mode === "abort") assert.ok(methods.includes("session/cancel"));
        else
          assert.deepEqual(replies, [
            {
              action: mode === "url" ? "accept" : mode,
              ...(mode === "accept"
                ? { content: { color: "Blue", count: 2, enabled: false } }
                : {}),
            },
          ]);
        await host.close();
        host = undefined;
        assert.equal(killed, 1);
      } finally {
        await host?.close();
        for (const res of streams) res.end();
        promptResponse?.end();
        peer.closeAllConnections();
        await new Promise((r) => peer.close(r));
        await rm(root, { recursive: true, force: true });
      }
    },
  );

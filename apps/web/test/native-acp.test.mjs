import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtemp, writeFile, readFile, rm, access } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { startNativeProductProcess } from "../native-process.mjs";
import { connectNativeAcp } from "../native-acp-client.mjs";

for (const decision of ["reject", "allow", "cancel", "answer", "skip", "compact"])
  test(
    `original ACP Write approval round trip: ${decision}`,
    { timeout: 30000 },
    async () => {
      const compact = decision === "compact";
      const allow = decision === "allow" || compact;
      const question = decision === "answer" || decision === "skip";
      const toolName = question ? "AskUserQuestion" : "Write";
      const root = await mkdtemp(join(tmpdir(), "axon-acp-client-"));
      const output = join(root, "output.txt"),
        evidence = "native-acp-write-4281";
      let native, client;
      const requests = [],
        approvals = [],
        events = [];
      const server = createServer(async (req, res) => {
        let text = "";
        for await (const chunk of req) text += chunk;
        requests.push(JSON.parse(text));
        const toolTurn = requests.length === 1;
        const chunk = {
          id: "owned",
          object: "chat.completion.chunk",
          created: 1,
          model: "owned-model",
          choices: [
            {
              index: 0,
              delta: toolTurn
                ? {
                    role: "assistant",
                    tool_calls: [
                      {
                        index: 0,
                        id: "owned-write",
                        type: "function",
                        function: {
                          name: toolName,
                          arguments: JSON.stringify(
                            question
                              ? {
                                  questions: [
                                    {
                                      question: "Color?",
                                      header: "Color",
                                      options: [
                                        { label: "Blue", description: "Blue" },
                                        { label: "Red", description: "Red" },
                                      ],
                                      multiSelect: false,
                                    },
                                  ],
                                }
                              : { file_path: output, content: evidence },
                          ),
                        },
                      },
                    ],
                  }
                : { role: "assistant", content: compact && requests.length === 3 ? "<summary>Owned native compact summary.</summary>" : "Native write turn finished." },
              finish_reason: null,
            },
          ],
        };
        res.writeHead(200, { "content-type": "text/event-stream" });
        res.end(
          `data: ${JSON.stringify(chunk)}\n\ndata: ${JSON.stringify({ ...chunk, choices: [{ index: 0, delta: {}, finish_reason: toolTurn ? "tool_calls" : "stop" }] })}\n\ndata: [DONE]\n\n`,
        );
      });
      try {
        await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
        const config = join(root, "product.json");
        await writeFile(
          config,
          JSON.stringify({
            authentication: {
              type: "custom-token",
              attributes: { token: "owned-token" },
            },
            config: { disabled: true },
            agents: compact ? undefined : [
              {
                name: "owned-agent",
                tags: ["cli", "default"],
                instructions: "Test assistant",
                tools: [toolName],
                models: ["owned-model"],
              },
            ],
            models: [
              {
                id: compact ? "auto" : "owned-model",
                name: "owned-model",
                url: `http://127.0.0.1:${server.address().port}/v1`,
              },
            ],
          }),
        );
        native = await startNativeProductProcess({
          cwd: root,
          env: {
            PATH: process.env.PATH,
            HOME: root,
            SHELL: "/bin/sh",
            AXONFIRE_STATE_DIR: join(root, "state"),
            AXONFIRE_NATIVE_PRODUCT_CONFIG: config,
            DISABLE_TELEMETRY: "1",
            CODEBUDDY_REMOTE_CONFIG_DISABLED: "true",
          },
        });
        client = await connectNativeAcp(native.origin, {
          clientCapabilities: { _meta: { "codebuddy.ai": { question: true } } },
          async onRequest(method, params) {
            assert.equal(method, "session/request_permission");
            approvals.push(params);
            if (question) {
              const resolved = await client.request(
                "_codebuddy.ai/resolveInterruption",
                {
                  sessionId: params.sessionId,
                  toolCallId: params.toolCall.toolCallId,
                  decision: decision === "answer" ? "allow" : "deny",
                  answers: decision === "answer" ? { "Color?": "Blue" } : {},
                },
              );
              assert.equal(resolved.resolved, true);
              return {
                outcome: {
                  outcome: "selected",
                  optionId: decision === "answer" ? "allow" : "reject",
                },
              };
            }
            if (decision === "cancel") {
              await client.notify("session/cancel", {
                sessionId: params.sessionId,
              });
              return { outcome: { outcome: "cancelled" } };
            }
            return {
              outcome: {
                outcome: "selected",
                optionId: allow ? "allow" : "reject",
              },
            };
          },
          onNotification(message) {
            events.push(message);
          },
        });
        const session = await client.request("session/new", {
          cwd: root,
          mcpServers: [],
        });
        const result = await client.request("session/prompt", {
          sessionId: session.sessionId,
          prompt: [{ type: "text", text: "Write output.txt" }],
        });
        assert.equal(
          approvals.length,
          1,
          JSON.stringify({
            result,
            toolResults: requests.flatMap((request) =>
              request.messages.filter((message) => message.role === "tool"),
            ),
          }),
        );
        if (!question)
          assert.equal(approvals[0].toolCall.rawInput.file_path, output);
        assert.ok(
          approvals[0].options.some((option) => option.optionId === "allow"),
        );
        if (question) {
          assert.equal(result.stopReason, "end_turn");
          assert.equal(requests.length, 2);
          const reply = requests[1].messages.find(
            (message) => message.role === "tool",
          );
          assert.match(
            reply.content,
            decision === "answer" ? /Blue/ : /chose not to answer/,
          );
        } else if (allow) {
          assert.equal(await readFile(output, "utf8"), evidence);
          assert.equal(result.stopReason, "end_turn");
          assert.equal(requests.length, 2);
          await client.close();
          const replay = [];
          client = await connectNativeAcp(native.origin, {
            onNotification: (message) => replay.push(message),
          });
          await client.request("session/load", {
            sessionId: session.sessionId,
            cwd: root,
            mcpServers: [],
          });
          assert.ok(
            replay.some(
              (message) =>
                message.params?.update?.sessionUpdate ===
                  "agent_message_chunk" &&
                JSON.stringify(message.params.update.content).includes(
                  "Native write turn finished.",
                ),
            ),
          );
          if (compact) {
            assert.match(requests[0].messages[0].content, /You are CodeBuddy Code/);
            const compacted = await client.request("session/prompt", {
              sessionId: session.sessionId,
              prompt: [{ type: "text", text: "/compact" }],
            });
            assert.equal(compacted.stopReason, "end_turn");
            assert.equal(requests.length, 3);
            assert.match(requests[2].messages[0].content, /summarizing conversations/);
            assert.equal(requests[2].tools?.length ?? 0, 0);
            const continued = await client.request("session/prompt", {
              sessionId: session.sessionId,
              prompt: [{ type: "text", text: "Continue after compact" }],
            });
            assert.equal(continued.stopReason, "end_turn");
            assert.equal(requests.length, 4);
            assert.match(requests[3].messages[0].content, /You are CodeBuddy Code/);
            assert.match(JSON.stringify(requests[3].messages), /Owned native compact summary/);
            assert.ok(!requests[3].messages.some(message => message.role === "tool"));
          }
          const list = await fetch(native.origin + "/api/v1/sessions", {
            headers: { "x-codebuddy-request": "1" },
          });
          assert.ok(
            (await list.json()).data.sessions.some(
              (item) => item.id === session.sessionId,
            ),
          );
          assert.ok(
            events.some(
              (event) =>
                event.params?.update?.toolCallId === "owned-write" &&
                event.params.update.status === "completed",
            ),
          );
        } else {
          await assert.rejects(access(output));
          assert.equal(result.stopReason, "cancelled");
          assert.equal(requests.length, 1);
          if (decision === "reject")
            assert.equal(
              result._meta["codebuddy.ai/outcome"],
              "PERMISSION_DENIED",
            );
          if (decision === "cancel") {
            const next = await client.request("session/prompt", {
              sessionId: session.sessionId,
              prompt: [{ type: "text", text: "Continue after cancellation" }],
            });
            assert.equal(next.stopReason, "end_turn");
            await assert.rejects(access(output));
          }
          assert.ok(
            !events.some(
              (event) =>
                event.params?.update?.toolCallId === "owned-write" &&
                event.params.update.status === "completed",
            ),
          );
        }
      } finally {
        await client?.close().catch(() => {});
        await native?.close();
        server.closeAllConnections();
        await new Promise((resolve) => server.close(resolve));
        await rm(root, {
          recursive: true,
          force: true,
          maxRetries: 10,
          retryDelay: 100,
        });
      }
    },
  );

import { nativeFixtureEnv } from "../../test/native-fixture-env.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtemp, writeFile, readFile, rm, access, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { startNativeProductProcess } from "../native-process.mjs";
import { connectNativeAcp } from "../native-acp-client.mjs";

for (const decision of ["reject", "allow", "cancel", "answer", "skip", "compact"])
  test(
    `original ACP Write approval round trip: ${decision}`,
    { timeout: 30000 },
    async (t) => {
      const compact = decision === "compact";
      const allow = decision === "allow" || compact;
      const question = decision === "answer" || decision === "skip";
      const toolName = question ? "AskUserQuestion" : "Write";
      const root = await mkdtemp(join(tmpdir(), "axon-acp-client-"));
      const output = join(root, "output.txt"),
        evidence = "native-acp-write-4281";
      let native, client, cleaned = false;
      const requests = [],
        approvals = [],
        events = [];
      t.signal.addEventListener("abort", () => {
        if (cleaned) return;
        console.error("OWNED_ACP_ABORT_BEFORE_CLEANUP", JSON.stringify({
          decision, modelRequests: requests.length, approvals: approvals.length,
          nativeStarted: Boolean(native), clientConnected: Boolean(client),
          lastEventMethods: events.slice(-5).map(event => event.method),
        }));
      }, { once: true });
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
            ...nativeFixtureEnv,
            HOME: root,
            SHELL: "/bin/sh",
            AXONFIRE_STATE_DIR: join(root, "state"),
            AXONFIRE_NATIVE_PRODUCT_CONFIG: config,
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
            // Original AcpView cancels new prompts for 500 ms after cancellation.
            // The cancelled result is not a signal that this barrier has expired.
            await new Promise(resolve => setTimeout(resolve, 500));
            const next = await client.request("session/prompt", {
              sessionId: session.sessionId,
              prompt: [{ type: "text", text: "Continue after cancellation" }],
            });
            const sourceLogs = [];
            if (!["end_turn", "cancelled"].includes(next.stopReason)) {
              await native.close(); // Flush owned product logs before failure diagnostics.
              for (const path of await readdir(root, { recursive: true })) {
                if (!/\.log(?:\.\d+)?$/.test(path)) continue;
                const text = await readFile(join(root, path), "utf8").catch(() => "");
                sourceLogs.push(...text.split("\n").filter(line => /RESULT:|Forwarding aborted|TraceCancel|cancel barrier|Aborting session|abortController|userInitiatedAbort/.test(line)).slice(-50));
              }
            }
            assert.ok(["end_turn", "cancelled"].includes(next.stopReason), JSON.stringify({
              sourceLogs: sourceLogs.slice(-70),
              next, modelRequests: requests.length,
              phases: events.map(event => event.params?.update?._meta?.["codebuddy.ai/agentPhase"]).filter(Boolean).slice(-12),
              answers: events.filter(event => event.params?.update?.sessionUpdate === "agent_message_chunk").map(event => event.params.update.content),
            }));
            assert.equal(requests.length, 2, "follow-up must actually reach the model after the barrier");
            assert.ok(events.some(event => event.params?.update?.content?.text === "Native write turn finished."));
            if (next.stopReason === "cancelled") {
              assert.equal(next._meta["codebuddy.ai/finishReason"], "stop");
              assert.equal(next._meta["codebuddy.ai/outcome"], "CANCELLED");
            }
            // A late original rejection marker may mislabel the completed follow-up,
            // but its result handling consumes that marker; the next turn must recover.
            const recovered = await client.request("session/prompt", {
              sessionId: session.sessionId,
              prompt: [{ type: "text", text: "Continue after cancellation marker is consumed" }],
            });
            assert.equal(recovered.stopReason, "end_turn");
            assert.equal(requests.length, 3);
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
        cleaned = true;
      }
    },
  );

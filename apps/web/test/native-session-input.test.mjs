import { createNativeSessionManager } from "../../../packages/harness/dist/src/sessions/native-session-manager.js";
import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtemp, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { originalBackendFixture } from "./original-backend-fixture.mjs";
import { nativeFixtureEnv } from "../../test/native-fixture-env.mjs";
import { createNativeSessionReplayTransport } from "../../../packages/harness/dist/src/sessions/native-session-replay-transport.js";

for (const action of [
  "allow",
  "deny",
  "reject",
  "answer",
  "skip",
  "cancel",
  "switch",
])
  test(
    `original input controller and full backend: ${action}`,
    { timeout: 45000, skip: process.platform === "win32" },
    async () => {
      const root = await mkdtemp(join(tmpdir(), "axon-session-input-"));
      const output = join(root, "owned.txt");
      const question = ["answer", "skip"].includes(action);
      const isCancellation = ["cancel", "switch"].includes(action);
      const deniesWrite = ["deny", "reject", "cancel", "switch"].includes(
        action,
      );
      const requests = [],
        titleRequests = [];
      const model = createServer(async (req, res) => {
        let body = "";
        for await (const chunk of req) body += chunk;
        const request = JSON.parse(body);
        const title = request.messages?.some(
          (m) =>
            typeof m.content === "string" &&
            m.content.startsWith("Generate a concise, sentence-case title"),
        );
        (title ? titleRequests : requests).push(request);
        const first = !title && requests.length === 1;
        const delta = first
          ? {
              role: "assistant",
              tool_calls: [
                {
                  index: 0,
                  id: "owned-input-tool",
                  type: "function",
                  function: {
                    name: question ? "AskUserQuestion" : "Write",
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
                        : { file_path: output, content: "owned-write" },
                    ),
                  },
                },
              ],
            }
          : {
              role: "assistant",
              content: title
                ? JSON.stringify({
                    isNewTopic: true,
                    title: "Owned input verification",
                  })
                : "Owned input completed",
            };
        res.writeHead(200, { "content-type": "text/event-stream" });
        res.end(
          `data: ${JSON.stringify({ id: "owned", object: "chat.completion.chunk", created: 1, model: "owned-model", choices: [{ index: 0, delta, finish_reason: first ? "tool_calls" : "stop" }] })}\n\ndata: [DONE]\n\n`,
        );
      });
      await new Promise((r) => model.listen(0, "127.0.0.1", r));
      const product = join(root, "product.json");
      await writeFile(
        product,
        JSON.stringify({
          authentication: {
            type: "custom-token",
            attributes: { token: "owned-token" },
          },
          config: { disabled: true },
          agents: [
            {
              name: "owned-agent",
              tags: ["cli", "default"],
              instructions: "Owned input test",
              tools: ["Write", "AskUserQuestion"],
              models: ["owned-model"],
            },
          ],
          models: [
            {
              id: "owned-model",
              name: "owned-model",
              url: `http://127.0.0.1:${model.address().port}/v1`,
            },
          ],
        }),
      );
      const gateway = createNativeSessionReplayTransport();
      let fixture, backend, controller, session;
      try {
        fixture = await originalBackendFixture({
          root,
          gateway,
          env: {
            ...nativeFixtureEnv,
            ...gateway.gatewaySecretEnv(),
            HOME: root,
            SHELL: "/bin/sh",
            ELECTRON_RUN_AS_NODE: "1",
            AXONFIRE_NATIVE_PRODUCT_CONFIG: product,
          },
        });
        const sessionId = randomUUID();
        const originalManager = createNativeSessionManager({
          console: { log() {}, warn() {} },
        });
        controller = new originalManager.SessionManager();
        controller.initialize({
          createBackend: (params) => {
            backend = fixture.definition.create(params);
            return backend;
          },
        });
        const events = [],
          replies = [];
        let response;
        const respond = () => {
          if (response) return;
          response = new Promise((resolve) => setImmediate(resolve)).then(
            async () => {
              let result;
              if (isCancellation)
                result =
                  action === "cancel"
                    ? await controller.cancel(sessionId, { sessionId })
                    : await controller.cancelPluginRecommendationRun(
                        sessionId,
                        { sessionId },
                      );
              else if (question)
                result =
                  action === "answer"
                    ? await controller.answerQuestion(
                        sessionId,
                        "owned-input-tool",
                        { "Color?": "Blue" },
                      )
                    : await controller.cancelQuestion(
                        sessionId,
                        "owned-input-tool",
                        "owned skip",
                      );
              else {
                const [requestId, pending] = session.pendingPermissionRequests
                  .entries()
                  .next().value;
                const option = pending.request.options.find(
                  (o) =>
                    o.kind ===
                    (action === "allow" ? "allow_once" : "reject_once"),
                );
                assert.ok(option);
                result =
                  action !== "reject"
                    ? await controller.respondToPermission(
                        sessionId,
                        requestId,
                        option.optionId,
                      )
                    : await controller.rejectPermission(
                        sessionId,
                        requestId,
                        "owned rejection",
                      );
              }
              replies.push(result);
            },
          );
          response.catch(() => {});
        };
        controller.setEventSink((channel, event) => {
          if (channel !== "session:event") return;
          events.push(event);
          if (
            event.type === "permissionRequest" ||
            event.type === "questionRequest"
          )
            respond();
        });
        session = await controller.startSession(
          {
            sessionId,
            cwd: root,
            config: {
              tools: "Write,AskUserQuestion",
              permissionMode: "default",
              systemPrompt: "Owned input test",
            },
          },
          "new",
        );
        const result = await controller.prompt(sessionId, [
          { type: "text", text: "Run the owned input check" },
        ]);
        await response;
        assert.equal(result.stopReason, deniesWrite ? "cancelled" : "end_turn");
        assert.deepEqual(replies, [isCancellation ? undefined : true]);
        assert.equal(session.pendingPermissionRequests.size, 0);
        assert.equal(session.pendingQuestionRequests.size, 0);
        assert.equal(session.isProcessing, false);
        assert.equal(session.taskState.terminalOutcome, "completed");
        assert.equal(session.noResponseWatchdog.timer, null);
        assert.equal(session.stopRequested, false);
        assert.equal(session.userCancelRequested, false);
        assert.equal(session.pluginRecommendationCancelRequested, false);
        if (isCancellation)
          assert.equal(
            result._meta["codebuddy.ai/cancelCause"],
            action === "cancel" ? "user_cancel" : "recommendation_switch",
          );
        assert.equal(requests.length, deniesWrite ? 1 : 2);
        const resultMessage = requests[1]?.messages.find(
          (m) => m.role === "tool" && m.tool_call_id === "owned-input-tool",
        );
        if (!deniesWrite) assert.ok(resultMessage);
        if (action === "allow")
          assert.equal(await readFile(output, "utf8"), "owned-write");
        else if (deniesWrite) {
          await assert.rejects(readFile(output), { code: "ENOENT" });
        } else if (action === "answer")
          assert.match(JSON.stringify(resultMessage), /Blue/);
        else {
          assert.equal(
            events.filter(
              (e) =>
                e.type === "questionCancelled" && e.questionSkipped === true,
            ).length,
            1,
          );
          assert.match(JSON.stringify(resultMessage), /skip|cancel|declin/i);
        }
        await controller.deleteSession(sessionId);
        assert.equal(controller.sessions.has(sessionId), false);
        assert.equal(fixture.definition.activeSessions.size, 0);
      } finally {
        session?.noResponseWatchdog?.stop();
        if (session)
          await controller?.destroySession(session.sessionId).catch(() => {});
        await backend?.destroy().catch(() => {});
        let exit;
        try {
          exit = await fixture?.close();
        } finally {
          model.closeAllConnections();
          await new Promise((r) => model.close(r));
          await rm(root, { recursive: true, force: true });
        }
        if (exit) assert.deepEqual(exit, { code: 0, signal: null });
      }
    },
  );

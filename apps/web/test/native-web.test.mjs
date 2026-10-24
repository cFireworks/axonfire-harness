import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, writeFile, readFile, access, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

async function webProcess(root, config) {
  const child = spawn(
    process.execPath,
    [
      fileURLToPath(new URL("../../cli/axonfire.mjs", import.meta.url)),
      "web",
      "--port",
      "0",
      "--cwd",
      root,
    ],
    {
      env: {
        PATH: process.env.PATH,
        HOME: root,
        SHELL: "/bin/sh",
        AXONFIRE_STATE_DIR: join(root, "state"),
        AXONFIRE_NATIVE_PRODUCT_CONFIG: config,
        DISABLE_TELEMETRY: "1",
        CODEBUDDY_REMOTE_CONFIG_DISABLED: "true",
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  let exited = false;
  const exit = once(child, "exit").then((result) => {
    exited = true;
    return result;
  });
  child.stderr.resume();
  async function close() {
    if (!exited) child.kill("SIGTERM");
    const timer = setTimeout(() => {
      if (!exited) child.kill("SIGKILL");
    }, 8000);
    try {
      const [, signal] = await exit;
      assert.notEqual(signal, "SIGKILL");
    } finally {
      clearTimeout(timer);
    }
  }
  try {
    const url = await new Promise((resolve, reject) => {
      let output = "";
      const timer = setTimeout(
        () => reject(new Error("Web readiness timeout")),
        10000,
      );
      child.once("error", reject);
      child.once("exit", () => {
        clearTimeout(timer);
        reject(new Error("Web exited before readiness"));
      });
      child.stdout.on("data", (chunk) => {
        output += chunk;
        const match = output.match(
          /Axonfire local Web: (http:\/\/127\.0\.0\.1:\d+)/,
        );
        if (match) {
          clearTimeout(timer);
          resolve(match[1]);
        }
      });
    });
    const status = await (await fetch(url + "/api/status")).json();
    assert.equal(status.configured, true);
    const post = (path, body, signal) =>
      fetch(url + path, {
        signal,
        method: "POST",
        headers: {
          Origin: url,
          "content-type": "application/json",
          "x-axonfire-csrf": status.csrf,
        },
        body: JSON.stringify(body),
      });
    return { url, post, close };
  } catch (error) {
    await close();
    throw error;
  }
}
async function consume(response, callback = async () => {}) {
  assert.equal(response.status, 200);
  const events = [];
  let buffer = "";
  for await (const chunk of response.body.pipeThrough(
    new TextDecoderStream(),
  )) {
    buffer += chunk;
    let end;
    while ((end = buffer.indexOf("\n\n")) !== -1) {
      const packet = buffer.slice(0, end);
      buffer = buffer.slice(end + 2);
      const lines = packet.split("\n");
      const data = lines.find((line) => line.startsWith("data: "));
      if (!data) continue;
      const event = {
        type: lines.find((line) => line.startsWith("event: "))?.slice(7),
        data: JSON.parse(data.slice(6)),
      };
      events.push(event);
      await callback(event);
    }
  }
  return events;
}
for (const mode of [
  "allow",
  "reject",
  "cancel",
  "answer",
  "skip",
  "disconnect",
])
  test(
    `default Web uses native process and ACP: ${mode}`,
    { timeout: 45000 },
    async () => {
      const root = await mkdtemp(join(tmpdir(), "axon-native-web-"));
      const output = join(root, "owned.txt"),
        evidence = "native-web-file-6307",
        requests = [];
      const question = mode === "answer" || mode === "skip",
        tool = question ? "AskUserQuestion" : "Write";
      let web;
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
                  id: "owned-tool",
                  type: "function",
                  function: {
                    name: tool,
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
          : { role: "assistant", content: "Native browser turn complete." };
        const chunk = {
          id: "owned",
          object: "chat.completion.chunk",
          created: 1,
          model: "owned-model",
          choices: [{ index: 0, delta, finish_reason: null }],
        };
        res.writeHead(200, { "content-type": "text/event-stream" });
        res.end(
          `data: ${JSON.stringify(chunk)}\n\ndata: ${JSON.stringify({ ...chunk, choices: [{ index: 0, delta: {}, finish_reason: first ? "tool_calls" : "stop" }] })}\n\ndata: [DONE]\n\n`,
        );
      });
      try {
        await new Promise((resolve) => model.listen(0, "127.0.0.1", resolve));
        const config = join(root, "product.json");
        await writeFile(
          config,
          JSON.stringify({
            authentication: {
              type: "custom-token",
              attributes: { token: "owned-secret" },
            },
            config: { disabled: true },
            commands: [],
            agents: [
              {
                name: "owned-agent",
                tags: ["cli", "default"],
                instructions: "Test assistant",
                tools: [tool],
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
        web = await webProcess(root, config);
        let decisionId;
        const disconnected = new AbortController();
        const consuming = consume(
          await web.post(
            "/api/prompt",
            { prompt: "Run the owned task" },
            disconnected.signal,
          ),
          async (event) => {
            if (event.type === "approval") {
              decisionId = event.data.id;
              assert.equal(event.data.name, "Write");
              if (mode === "disconnect") {
                disconnected.abort();
                return;
              }
              const response =
                mode === "cancel"
                  ? await web.post("/api/cancel", {})
                  : await web.post("/api/approve", {
                      id: event.data.id,
                      allow: mode === "allow",
                    });
              assert.equal(response.status, 200);
              await response.text();
            }
            if (event.type === "question") {
              decisionId = event.data.id;
              assert.equal(event.data.input.questions[0].question, "Color?");
              const response = await web.post("/api/answer", {
                id: event.data.id,
                answers: mode === "answer" ? { "Color?": "Blue" } : {},
              });
              assert.equal(response.status, 200);
              await response.text();
            }
          },
        );
        if (mode === "disconnect") {
          await assert.rejects(consuming);
          const deadline = Date.now() + 5000;
          while ((await (await fetch(web.url + "/api/status")).json()).busy) {
            assert.ok(
              Date.now() < deadline,
              "disconnected native turn must cancel",
            );
            await new Promise((resolve) => setTimeout(resolve, 20));
          }
          await assert.rejects(access(output));
          assert.equal(requests.length, 1);
          const stale = await web.post("/api/approve", {
            id: decisionId,
            allow: true,
          });
          assert.equal(stale.status, 404);
          await stale.text();
          return;
        }
        const events = await consuming;
        assert.ok(decisionId);
        assert.doesNotMatch(JSON.stringify(events), /owned-secret/);
        if (mode === "allow" || question) {
          assert.equal(events.at(-1).type, "done", JSON.stringify(events));
          assert.ok(
            events.some(
              (event) =>
                event.type === "delta" &&
                event.data.text === "Native browser turn complete.",
            ),
          );
          assert.equal(requests.length, 2);
          if (question)
            assert.match(
              requests[1].messages.find((message) => message.role === "tool")
                .content,
              mode === "answer" ? /Blue/ : /chose not to answer/,
            );
          else {
            assert.equal(await readFile(output, "utf8"), evidence);
            const sessionId = events.find((event) => event.type === "session")
              .data.id;
            await web.close();
            web = await webProcess(root, config);
            const sessions = await (
              await fetch(web.url + "/api/sessions")
            ).json();
            assert.ok(sessions.some((session) => session.id === sessionId));
            const history = await (
              await fetch(web.url + "/api/history?id=" + sessionId)
            ).json();
            assert.ok(
              history.some(
                (message) =>
                  message.role === "assistant" &&
                  message.text.includes("Native browser turn complete."),
              ),
              JSON.stringify(history),
            );
            const continued = await consume(
              await web.post("/api/prompt", {
                sessionId,
                prompt: "Continue the same conversation",
              }),
            );
            assert.equal(
              continued.at(-1).type,
              "done",
              JSON.stringify(continued),
            );
            const compacted = await consume(
              await web.post("/api/compact", { sessionId }),
            );
            assert.equal(
              compacted.at(-1).type,
              "error",
              "missing product compact command must not be sent as an ordinary model prompt",
            );
            assert.equal(requests.length, 3);
            assert.ok(
              requests[2].messages.some(
                (message) =>
                  message.role === "assistant" &&
                  (JSON.stringify(message.content) ?? "").includes(
                    "Native browser turn complete.",
                  ),
              ),
            );
          }
        } else {
          assert.equal(events.at(-1).type, "error");
          if (mode === "cancel")
            assert.equal(events.at(-1).data.error, "Turn cancelled");
          await assert.rejects(access(output));
          assert.equal(requests.length, 1);
          const stale = await web.post("/api/approve", {
            id: decisionId,
            allow: true,
          });
          assert.equal(stale.status, 404);
          await stale.text();
        }
      } finally {
        await web?.close();
        model.closeAllConnections();
        await new Promise((resolve) => model.close(resolve));
        await rm(root, {
          recursive: true,
          force: true,
          maxRetries: 10,
          retryDelay: 100,
        });
      }
    },
  );

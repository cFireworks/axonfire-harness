import { nativeFixtureEnv } from "../../test/native-fixture-env.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import { once } from "node:events";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const launcher = fileURLToPath(new URL("../axonfire.mjs", import.meta.url));
const execute = promisify(execFile);

test(
  "default CLI preserves permissions, executes native Read/Grep, and serves original HTTP",
  { timeout: 90000 },
  async () => {
    const root = await mkdtemp(join(tmpdir(), "axon-native-launcher-"));
    const evidence = "native-launcher-read-8472";
    const requests = [];
    const failures = [];
    let service;
    let toolName = "Read";
    const server = createServer(async (request, response) => {
      try {
        let body = "";
        for await (const chunk of request) body += chunk;
        requests.push({ path: request.url, body: JSON.parse(body) });
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
                        id: "read-owned",
                        type: "function",
                        function: {
                          name: toolName,
                          arguments: JSON.stringify(toolName === "Read" ? {
                            file_path: join(root, "owned.txt"),
                          } : { pattern: evidence, path: root, output_mode: "content" }),
                        },
                      },
                    ],
                  }
                : {
                    role: "assistant",
                    content: "Native CLI tool round trip works.",
                  },
              finish_reason: null,
            },
          ],
        };
        response.writeHead(200, { "content-type": "text/event-stream" });
        response.end(
          `data: ${JSON.stringify(chunk)}\n\ndata: ${JSON.stringify({ ...chunk, choices: [{ index: 0, delta: {}, finish_reason: toolTurn ? "tool_calls" : "stop" }] })}\n\ndata: [DONE]\n\n`,
        );
      } catch (error) {
        failures.push(String(error));
        response.writeHead(500).end();
      }
    });
    try {
      await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
      await writeFile(join(root, "owned.txt"), evidence + "\n");
      const configPath = join(root, "product.json");
      await writeFile(
        configPath,
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
              instructions: "Test assistant",
              tools: ["Read", "Grep"],
              models: ["owned-model"],
            },
          ],
          models: [
            {
              id: "owned-model",
              name: "owned-model",
              url: `http://127.0.0.1:${server.address().port}/v1`,
            },
          ],
        }),
      );
      const env = {
        ...nativeFixtureEnv,
        HOME: root,
        SHELL: "/bin/sh",
        AXONFIRE_STATE_DIR: join(root, "state"),
        AXONFIRE_NATIVE_PRODUCT_CONFIG: configPath,
      };
      const help = await execute(process.execPath, [launcher, "--help"], {
        cwd: root,
        env,
        timeout: 30000,
      });
      assert.match(help.stdout, /Usage: codebuddy\|cbc/);
      assert.match(help.stdout, /--permission-mode/);
      await execute(process.execPath, [launcher, "-p", "Read owned.txt"], {
        cwd: root,
        env,
        timeout: 30000,
        maxBuffer: 1024 * 1024,
      });
      assert.equal(requests.length, 2);
      const denied = requests[1].body.messages.find(
        (message) =>
          message.role === "tool" && message.tool_call_id === "read-owned",
      );
      assert.match(
        denied.content,
        /permission prompts are not available in non-interactive mode/,
      );
      assert.ok(!denied.content.includes(evidence));
      requests.length = 0;
      const result = await execute(
        process.execPath,
        [launcher, "-p", "Read owned.txt", "--allowedTools", "Read"],
        { cwd: root, env, timeout: 30000, maxBuffer: 1024 * 1024 },
      );
      assert.match(result.stdout, /Native CLI tool round trip works\./);
      assert.deepEqual(failures, []);
      assert.equal(requests.length, 2);
      assert.equal(requests[0].path, "/v1");
      assert.equal(requests[0].body.stream, true);
      assert.ok(
        requests[0].body.tools.some((tool) => tool.function?.name === "Read"),
      );
      assert.ok(
        requests[1].body.messages.some(
          (message) =>
            message.role === "tool" &&
            message.tool_call_id === "read-owned" &&
            message.content.includes(evidence),
        ),
        JSON.stringify(
          requests[1].body.messages.filter(
            (message) => message.role === "tool",
          ),
        ),
      );
      if (process.platform === "darwin" && process.arch === "arm64") {
        toolName = "Grep";
        requests.length = 0;
        await execute(process.execPath,
          [launcher, "-p", "Find the evidence in owned.txt", "--allowedTools", "Grep"],
          { cwd: root, env: { ...env, USE_BUILTIN_RIPGREP: "1" }, timeout: 30000, maxBuffer: 1024 * 1024 });
        assert.equal(requests.length, 2);
        const grepResult = requests[1].body.messages.find(message => message.role === "tool");
        assert.match(grepResult.content, /native-launcher-read-8472/);
        assert.match(grepResult.content, /owned.txt/);
      }
      service = spawn(process.execPath, [launcher, "--serve"], {
        cwd: root,
        env: { ...env, AXONFIRE_PORT: "0" },
        stdio: ["ignore", "pipe", "pipe"],
      });
      let serverOutput = "";
      const origin = await new Promise((resolve, reject) => {
        const timer = setTimeout(
          () => reject(new Error("Native server readiness timeout")),
          20000,
        );
        service.once("error", (error) => {
          clearTimeout(timer);
          reject(error);
        });
        service.once("exit", (code) => {
          clearTimeout(timer);
          reject(new Error(`Native server exited before readiness: ${code}`));
        });
        service.stdout.on("data", (chunk) => {
          serverOutput += chunk;
          const match = serverOutput.match(
            /Endpoint\s+(http:\/\/127\.0\.0\.1:\d+)/,
          );
          if (match) {
            clearTimeout(timer);
            resolve(match[1]);
          }
        });
        service.stderr.on("data", () => {});
      });
      const deniedHealth = await fetch(origin + "/health");
      assert.equal(deniedHealth.status, 403);
      await deniedHealth.text();
      const health = await fetch(origin + "/health", {
        headers: { "x-codebuddy-request": "1" },
      });
      assert.equal(health.status, 200);
      assert.equal((await health.json()).status, "UP");
      const exited = once(service, "exit");
      service.kill("SIGTERM");
      const shutdownTimer = setTimeout(() => service.kill("SIGKILL"), 3000);
      const [, signal] = await exited;
      clearTimeout(shutdownTimer);
      assert.notEqual(
        signal,
        "SIGKILL",
        "native lifecycle should terminate on SIGTERM",
      );
      service = undefined;
    } finally {
      if (service && service.exitCode === null && service.signalCode === null) {
        const exited = once(service, "exit");
        service.kill("SIGKILL");
        await exited;
      }
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

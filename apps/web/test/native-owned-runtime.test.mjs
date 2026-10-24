import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import {
  mkdtemp,
  writeFile,
  mkdir,
  readFile,
  stat,
  rm,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { startNativeOwnedRuntime } from "../native-owned-runtime.mjs";
import { connectNativeAcp } from "../native-acp-client.mjs";
import { nativeFixtureEnv } from "../../test/native-fixture-env.mjs";

test(
  "Web sidecar ownership authenticates REST/ACP, preserves state and reclaims daemon/CLI",
  { skip: process.platform === "win32", timeout: 60000 },
  async () => {
    const root = await mkdtemp(join(tmpdir(), "axon-web-owner-"));
    const state = join(root, "state");
    await mkdir(state);
    const sentinel = join(state, "owned-state.txt");
    await writeFile(sentinel, "retain");
    let requests = 0;
    const model = createServer(async (req, res) => {
      for await (const _ of req) {
      }
      requests++;
      res.writeHead(200, { "content-type": "text/event-stream" });
      res.end(
        "data: " +
          JSON.stringify({
            id: "owned",
            object: "chat.completion.chunk",
            created: 1,
            model: "owned-model",
            choices: [
              {
                index: 0,
                delta: { role: "assistant", content: "Owned Web answer" },
                finish_reason: "stop",
              },
            ],
          }) +
          "\n\ndata: [DONE]\n\n",
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
            instructions: "Owned",
            tools: ["Read"],
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
    const env = {
      ...nativeFixtureEnv,
      HOME: root,
      SHELL: "/bin/sh",
      AXONFIRE_STATE_DIR: state,
      AXONFIRE_NATIVE_PRODUCT_CONFIG: product,
    };
    let runtime, client, sessionId;
    try {
      for (let pass = 0; pass < 2; pass++) {
        runtime = await startNativeOwnedRuntime({ cwd: root, env });
        const owner = runtime.ownership;
        assert.equal(runtime.accountHost.state, "open");
        assert.equal(runtime.cliEnv.AXONFIRE_NATIVE_PRODUCT_CONFIG, undefined);
        assert.equal(
          runtime.cliEnv.AXONFIRE_NATIVE_ASSETS,
          runtime.accountHost.assetsDirectory,
        );
        assert.ok(
          runtime.accountHost.services.authentication.currentSessionSubject.getValue(),
        );
        assert.ok(owner.runtimePid > 0);
        assert.ok(owner.daemonPid > 0);
        assert.notEqual(owner.runtimePid, owner.daemonPid);
        assert.equal(
          (
            await fetch(runtime.origin + "/api/v1/health", {
              headers: { "x-codebuddy-request": "1" },
            })
          ).status,
          401,
        );
        assert.equal(
          (
            await fetch(runtime.origin + "/api/v1/health", {
              headers: {
                "x-codebuddy-request": "1",
                ...runtime.requestHeaders,
              },
            })
          ).status,
          200,
        );
        client = await connectNativeAcp(runtime.origin, {
          gatewayHeaders: runtime.requestHeaders,
        });
        const session = await client.request(
          sessionId ? "session/load" : "session/new",
          { ...(sessionId ? { sessionId } : {}), cwd: root, mcpServers: [] },
        );
        sessionId ??= session.sessionId;
        if (pass === 0) {
          const result = await client.request("session/prompt", {
            sessionId,
            prompt: [{ type: "text", text: "Reply with the owned answer" }],
          });
          assert.equal(result.stopReason, "end_turn");
        } else {
          const response = await fetch(
            runtime.origin + `/api/v1/sessions/${sessionId}/history`,
            {
              headers: {
                "x-codebuddy-request": "1",
                ...runtime.requestHeaders,
              },
            },
          );
          assert.equal(response.status, 200);
          assert.match(
            JSON.stringify(await response.json()),
            /Owned Web answer/,
          );
        }
        await client.close();
        client = undefined;
        const firstClose = runtime.close();
        assert.equal(runtime.close(), firstClose);
        assert.deepEqual(await firstClose, { code: 0, signal: null });
        assert.equal(runtime.accountHost.state, "closed");
        for (const pid of [owner.runtimePid, owner.daemonPid])
          assert.throws(() => process.kill(pid, 0), { code: "ESRCH" });
        for (const p of [owner.controlRoot, owner.controlSocket, owner.pidFile])
          await assert.rejects(stat(p), { code: "ENOENT" });
        assert.equal(await readFile(sentinel, "utf8"), "retain");
        runtime = undefined;
      }
      assert.equal(requests, 1);
    } finally {
      await client?.close().catch(() => {});
      await runtime?.close();
      model.closeAllConnections();
      await new Promise((r) => model.close(r));
      await rm(root, { recursive: true, force: true });
    }
  },
);

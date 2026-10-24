import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { startNativeOwnedRuntime } from "../native-owned-runtime.mjs";
import { composeNativeWebRuntime } from "../native-runtime.mjs";
import { nativeFixtureEnv } from "../../test/native-fixture-env.mjs";

for (const mode of ["warm", "changed-env", "disabled", "cached-disabled"])
  test(
    `default Web original pool owns real conversation and preserves launch args: ${mode}`,
    { timeout: 45000 },
    async () => {
      const root = await mkdtemp(join(tmpdir(), "axon-web-prewarm-"));
      const requests = [];
      let native, runtime;
      const model = createServer(async (req, res) => {
        let body = "";
        for await (const chunk of req) body += chunk;
        requests.push(JSON.parse(body));
        res.writeHead(200, { "content-type": "text/event-stream" });
        res.end(
          `data: ${JSON.stringify({ id: "owned", object: "chat.completion.chunk", created: 1, model: "owned-override", choices: [{ index: 0, delta: { role: "assistant", content: "Warm ownership verified." }, finish_reason: "stop" }] })}\n\ndata: [DONE]\n\n`,
        );
      });
      try {
        await new Promise((r) => model.listen(0, "127.0.0.1", r));
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
                name: "owned-main",
                tags: ["cli", "default"],
                instructions: "Reply briefly",
                tools: [],
                models: ["owned-default"],
              },
            ],
            models: ["owned-default", "owned-override"].map((id) => ({
              id,
              name: id,
              url: `http://127.0.0.1:${model.address().port}/v1/chat/completions`,
            })),
          }),
        );
        if (mode === "cached-disabled") {
          await mkdir(join(root, "state", "app"), { recursive: true });
          await writeFile(
            join(root, "state", "app", "app-config.json"),
            JSON.stringify({ prewarmPoolSize: 0 }),
          );
        }
        native = await startNativeOwnedRuntime({
          cwd: root,
          hosted: true,
          env: {
            ...nativeFixtureEnv,
            HOME: root,
            SHELL: "/bin/sh",
            AXONFIRE_STATE_DIR: join(root, "state"),
            AXONFIRE_NATIVE_PRODUCT_CONFIG: product,
            ...(mode === "disabled"
              ? { WORKBUDDY_CLI_PREWARM_POOL_SIZE: "0" }
              : {}),
          },
        });
        const pool = native.prewarmPool;
        if (!mode.endsWith("disabled")) {
          assert.ok(pool);
          const deadline = Date.now() + 15000;
          while (
            !pool.entries.some((entry) => entry.status === "idle") &&
            Date.now() < deadline
          )
            await new Promise((r) => setTimeout(r, 30));
          assert.ok(
            pool.entries.some((entry) => entry.status === "idle"),
            "original pool must become idle",
          );
        } else assert.equal(pool, undefined);
        let coldCreates = 0;
        const originalCreate = native.manager.createSession.bind(
          native.manager,
        );
        native.manager.createSession = (params) => {
          coldCreates++;
          return originalCreate(params);
        };
        if (mode === "changed-env")
          native.cliEnv.OWNED_RUNTIME_CHANGED = "changed-after-prewarm";
        runtime = composeNativeWebRuntime(
          { workDir: root },
          native,
          ["--model", "owned-override"],
          root,
        );
        const session = await runtime.openSession();
        assert.equal(
          pool?.bySession.has(session.id) ?? false,
          mode === "warm",
          "ownership must prove a warm hit, not just a successful response",
        );
        assert.equal(coldCreates, mode === "warm" ? 0 : 1);
        assert.equal(
          await runtime.prompt(session, "Reply"),
          "Warm ownership verified.",
        );
        assert.equal(requests.length, 1);
        assert.equal(
          requests[0].model,
          "owned-override",
          "user CLI arguments must survive both activation and cold startup",
        );
        if (mode === "warm") {
          const deadline = Date.now() + 15000;
          while (
            !pool.entries.some((entry) => entry.status === "idle") &&
            Date.now() < deadline
          )
            await new Promise((r) => setTimeout(r, 30));
          assert.ok(
            pool.entries.some((entry) => entry.status === "idle"),
            "pool must replenish after activation",
          );
          const next = await runtime.openSession();
          assert.notEqual(next.id, session.id);
          assert.equal(pool.bySession.has(next.id), true);
          assert.equal(coldCreates, 0);
          assert.equal(
            await runtime.prompt(next, "Independent conversation"),
            "Warm ownership verified.",
          );
          assert.equal(requests.length, 2);
          assert.equal(requests[1].model, "owned-override");
          assert.equal(
            requests[1].messages.some(
              (message) => message.role === "assistant",
            ),
            false,
          );
        }
        const pids = [
          native.ownership.runtimePid,
          native.ownership.daemonPid,
          ...(pool?.entries.map((entry) => entry.child.pid) ?? []),
        ];
        await runtime.close();
        runtime = undefined;
        native = undefined;
        for (const pid of pids)
          assert.throws(() => process.kill(pid, 0), { code: "ESRCH" });
        if (pool) {
          assert.equal(pool.entries.length, 0);
          assert.equal(pool.bySession.size, 0);
        }
      } finally {
        await runtime?.close();
        await native?.close();
        model.closeAllConnections();
        await new Promise((r) => model.close(r));
        await rm(root, { recursive: true, force: true });
      }
    },
  );

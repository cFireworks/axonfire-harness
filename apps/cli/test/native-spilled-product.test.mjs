import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { prepareNativeProductInput } from "../native-product-input.mjs";
import { nativeFixtureEnv } from "../../test/native-fixture-env.mjs";
import { createNativeAuthProductCoordinator } from "../../../packages/harness/dist/src/config/native-auth-product-coordinator.js";

const execute = promisify(execFile);
const launcher = fileURLToPath(new URL("../axonfire.mjs", import.meta.url));

test(
  "native CLI consumes the original Linux path-only snapshot without putting it back into env",
  { timeout: 45000 },
  async () => {
    const root = await mkdtemp(join(tmpdir(), "axon-cli-spill-"));
    const requests = [];
    const model = createServer(async (req, res) => {
      let body = "";
      for await (const chunk of req) body += chunk;
      requests.push(JSON.parse(body));
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
                delta: { role: "assistant", content: "Managed spill works." },
                finish_reason: "stop",
              },
            ],
          }) +
          "\n\ndata: [DONE]\n\n",
      );
    });
    await new Promise((r) => model.listen(0, "127.0.0.1", r));
    try {
      const scopedProcess = Object.create(process);
      Object.defineProperty(scopedProcess, "platform", { value: "linux" });
      scopedProcess.env = { WORKBUDDY_CONFIG_DIR: root };
      const { productConfig } = createNativeAuthProductCoordinator({
        process: scopedProcess,
        assetsRoot: root,
        console: { log() {}, warn() {}, error() {} },
      });
      const prompt = "Owned spill prompt marker. " + "x".repeat(60000);
      const json = JSON.stringify({
        authentication: {
          type: "custom-token",
          attributes: { token: "owned-token" },
        },
        config: { disabled: true },
        agents: [
          {
            name: "owned",
            tags: ["cli", "default"],
            instructions: prompt,
            tools: [],
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
      });
      productConfig.assignAccProductConfigV3ToProcessEnv(json);
      assert.equal(scopedProcess.env.ACC_PRODUCT_CONFIG_V3, undefined);
      const configPath = scopedProcess.env.ACC_PRODUCT_CONFIG_PATH;
      assert.ok(configPath);
      assert.equal(await readFile(configPath, "utf8"), json);
      const launchEnv = {
        ...nativeFixtureEnv,
        ELECTRON_RUN_AS_NODE: "1",
        HOME: root,
        SHELL: "/bin/sh",
        AXONFIRE_STATE_DIR: join(root, "state"),
        ACC_PRODUCT_CONFIG_PATH: configPath,
      };
      prepareNativeProductInput(launchEnv);
      assert.equal(launchEnv.ACC_PRODUCT_CONFIG_V3, undefined);
      assert.equal(launchEnv.ACC_PRODUCT_CONFIG_PATH, configPath);
      const result = await execute(
        process.execPath,
        [launcher, "-p", "Reply briefly"],
        {
          cwd: root,
          timeout: 30000,
          maxBuffer: 1024 * 1024,
          env: launchEnv,
        },
      );
      assert.match(result.stdout, /Managed spill works/);
      assert.equal(requests.length, 1);
      assert.ok(JSON.stringify(requests[0].messages).includes(prompt));
      assert.equal(await readFile(configPath, "utf8"), json);
    } finally {
      model.closeAllConnections();
      await new Promise((r) => model.close(r));
      await rm(root, { recursive: true, force: true });
    }
  },
);

import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtemp, mkdir, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { startNativeWebAccountRuntime } from "../native-account-runtime.mjs";

const logger = Object.fromEntries(
  ["log", "debug", "info", "warn", "error"].map((k) => [k, () => {}]),
);
async function fixture(run) {
  const root = await mkdtemp(join(tmpdir(), "axon-web-account-"));
  const assets = join(root, "assets"),
    controlRoot = join(root, "control"),
    configRoot = join(root, "state");
  await mkdir(assets);
  const base = {
    authentication: {
      id: "owned",
      type: "custom-token",
      attributes: { token: "base-token" },
    },
    config: { disabled: true },
    agents: [
      {
        name: "original",
        instructions: "Original prompt bytes preserved",
        models: ["input"],
      },
    ],
    models: [{ id: "base" }],
  };
  await writeFile(join(assets, "product.json"), JSON.stringify(base));
  let owner;
  const start = async (env) =>
    (owner = await startNativeWebAccountRuntime({
      env: { AXONFIRE_NATIVE_ASSETS: assets, ACC_USER_ID: "owned", ...env },
      cwd: root,
      configRoot,
      controlRoot,
      logger,
    }));
  try {
    await run({ start, root, base });
  } finally {
    await owner?.close();
    await rm(root, { recursive: true, force: true });
  }
}

test("Web account bootstrap preserves source file, original prompts and file-over-inline launcher precedence", async () => {
  await fixture(async ({ start, root, base }) => {
    const file = join(root, "input.json");
    const input = {
      models: [{ id: "input" }],
      authentication: {
        type: "custom-token",
        attributes: { token: "input-token" },
      },
    };
    const bytes = JSON.stringify(input, null, 2);
    await writeFile(file, bytes);
    const host = await start({
      AXONFIRE_NATIVE_PRODUCT_CONFIG: file,
      ACC_PRODUCT_CONFIG_PATH: file,
      ACC_PRODUCT_CONFIG_V3: JSON.stringify({ models: [{ id: "ignored" }] }),
    });
    assert.equal(await readFile(file, "utf8"), bytes);
    assert.deepEqual(
      host.services.product.getLocalConfiguration().agents,
      base.agents,
    );
    assert.deepEqual(
      host.services.product.getLocalConfiguration().models,
      input.models,
    );
    assert.equal(
      host.services.authentication.currentSessionSubject.getValue().auth
        .accessToken,
      "input-token",
    );
    assert.equal(host.env.ACC_PRODUCT_CONFIG_PATH, undefined);
    assert.ok(host.env.ACC_PRODUCT_CONFIG_V3);
  });
});

test("Web bootstrap input stays separate from published cloud snapshots and logout restores local models", async () => {
  const server = createServer((_req, res) => {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ data: { models: [{ id: "remote" }] } }));
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  try {
    await fixture(async ({ start }) => {
      const host = await start({
        ACC_PRODUCT_CONFIG_V3: JSON.stringify({
          authentication: {
            type: "custom-token",
            attributes: { token: "input-token" },
          },
          endpoint: `http://127.0.0.1:${server.address().port}`,
          config: { disabled: false, url: "/v2/config" },
          models: [{ id: "input" }],
        }),
      });
      assert.equal(
        host.services.product.getCurrentConfiguration().models[0].id,
        "remote",
      );
      await host.refresh();
      assert.deepEqual(host.services.product.getLocalConfiguration().models, [
        { id: "input" },
      ]);
      assert.ok(
        JSON.parse(host.env.ACC_PRODUCT_CONFIG_V3).models.some(
          (m) => m.id === "remote",
        ),
      );
      await host.logout();
      await host.refresh();
      assert.deepEqual(host.services.product.getLocalConfiguration().models, [
        { id: "input" },
      ]);
      assert.equal(
        host.services.product
          .getCurrentConfiguration()
          .models.some((m) => m.id === "remote"),
        false,
      );
    });
  } finally {
    server.closeAllConnections();
    await new Promise((r) => server.close(r));
  }
});

test("Web account bootstrap rejects malformed input before starting account services", async () => {
  await fixture(async ({ start, root }) => {
    const file = join(root, "input.json");
    await writeFile(file, "[]");
    await assert.rejects(
      start({ AXONFIRE_NATIVE_PRODUCT_CONFIG: file }),
      /must be a JSON object/,
    );
    assert.equal(await readFile(file, "utf8"), "[]");
  });
});

test("Web child assets and Desktop snapshot share explicit CLI agent replacement", async () => {
  await fixture(async ({ start }) => {
    const agents = [
      {
        name: "replacement",
        tags: ["cli", "default"],
        instructions: "Owned replacement",
        models: ["input"],
      },
    ];
    const host = await start({
      ACC_PRODUCT_CONFIG_V3: JSON.stringify({
        agents,
        models: [{ id: "input" }],
        authentication: {
          type: "custom-token",
          attributes: { token: "input-token" },
        },
      }),
    });
    const staged = JSON.parse(
      await readFile(join(host.assetsDirectory, "product.json"), "utf8"),
    );
    assert.deepEqual(staged.agents, agents);
    assert.deepEqual(JSON.parse(host.env.ACC_PRODUCT_CONFIG_V3).agents, agents);
    assert.deepEqual(
      host.services.product.getLocalConfiguration().agents,
      agents,
    );
  });
});

test("Web account bootstrap accepts a managed path-only input and preserves its source", async () => {
  await fixture(async ({ start, root }) => {
    const file = join(root, "snapshot.json");
    const input = JSON.stringify({
      authentication: {
        type: "custom-token",
        attributes: { token: "path-token" },
      },
      models: [{ id: "path-model" }],
      ownedPadding: "x".repeat(60000),
    });
    await writeFile(file, input);
    const host = await start({ ACC_PRODUCT_CONFIG_PATH: file });
    assert.equal(
      host.services.authentication.currentSessionSubject.getValue().auth
        .accessToken,
      "path-token",
    );
    assert.deepEqual(host.services.product.getLocalConfiguration().models, [
      { id: "path-model" },
    ]);
    assert.equal(await readFile(file, "utf8"), input);
  });
});

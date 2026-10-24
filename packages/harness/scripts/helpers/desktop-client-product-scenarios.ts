import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
type Factory = (runtime?: any) => any;
async function owned(factory: Factory, run: (s: any) => Promise<void>) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "axon-client-product-")),
    dirname = path.join(root, "nested", "main"),
    env: any = {};
  fs.mkdirSync(dirname, { recursive: true });
  const api = factory({ process: { env }, dirname }),
    logger = { setContext() {}, info() {}, debug() {}, warn() {} },
    provider = Object.assign(new api.ClientProductProvider(), { fs, logger });
  provider.init();
  try {
    await run({ root, dirname, env, api, provider, logger });
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}
export const desktopClientProductScenarios: [
  string,
  (f: Factory) => Promise<void>,
][] = [
  [
    "real base file retains authentication, agents and shared cached identity",
    (f) =>
      owned(f, async (s) => {
        const file = path.join(s.dirname, "product.json"),
          data = {
            authentication: { id: "owned" },
            agents: [{ name: "code", models: ["one"] }],
            models: [{ id: "one" }],
          };
        fs.writeFileSync(file, JSON.stringify(data));
        const first = await s.provider.provide();
        assert.deepEqual(first, data);
        assert.equal(s.provider.priority, s.api.ProductProviderPriority.CLIENT);
        Object.assign(first, { ownedMutation: true });
        fs.writeFileSync(file, JSON.stringify({ changed: true }));
        assert.equal(await s.provider.provide(), first);
        assert.equal((await s.provider.provide()).ownedMutation, true);
      }),
  ],
  [
    "base path parent search, malformed retry and optional filesystem",
    (f) =>
      owned(f, async (s) => {
        const parent = path.join(s.root, "nested", "product.json");
        fs.writeFileSync(parent, JSON.stringify({ from: "parent" }));
        assert.equal((await s.provider.provide()).from, "parent");
        const second = Object.assign(new s.api.ClientProductProvider(), {
          fs,
          logger: s.logger,
          configBasePath: s.root,
        });
        fs.writeFileSync(path.join(s.root, "product.json"), "{bad");
        assert.deepEqual(await second.provide(), {});
        fs.writeFileSync(
          path.join(s.root, "product.json"),
          JSON.stringify({ from: "base" }),
        );
        assert.equal((await second.provide()).from, "base");
        assert.deepEqual(await new s.api.ClientProductProvider().provide(), {});
      }),
  ],
  [
    "builtin switch uses original truthy parsing and preserves agents by shallow copy",
    (f) =>
      owned(f, async (s) => {
        const config = {
          models: [{ id: "one" }],
          agents: [{ name: "code", models: ["one"] }],
          authentication: { id: "owned" },
        };
        for (const value of ["1", "true", " YES ", "On"]) {
          s.env.CODEBUDDY_DISABLE_BUILTIN_MODELS = value;
          const stripped = s.api.stripBuiltinModelsIfDisabled(config);
          assert.equal(stripped.models, undefined);
          assert.equal(stripped.agents, config.agents);
          assert.equal(stripped.authentication, config.authentication);
          assert.notEqual(stripped, config);
          assert.equal(config.models.length, 1);
        }
        for (const value of [undefined, "", "0", "false", "no"]) {
          s.env.CODEBUDDY_DISABLE_BUILTIN_MODELS = value;
          assert.equal(s.api.stripBuiltinModelsIfDisabled(config), config);
        }
      }),
  ],
  [
    "model disabling is evaluated at first successful load and remains cached",
    (f) =>
      owned(f, async (s) => {
        fs.writeFileSync(
          path.join(s.dirname, "product.json"),
          JSON.stringify({
            models: [{ id: "builtin" }],
            agents: [{ name: "code", models: ["builtin"] }],
          }),
        );
        s.env.CODEBUDDY_DISABLE_BUILTIN_MODELS = "true";
        const first = await s.provider.provide();
        assert.equal(first.models, undefined);
        assert.deepEqual(first.agents[0].models, ["builtin"]);
        s.env.CODEBUDDY_DISABLE_BUILTIN_MODELS = "false";
        assert.equal(await s.provider.provide(), first);
        const fresh = Object.assign(new s.api.ClientProductProvider(), {
          fs,
          logger: s.logger,
        });
        assert.equal((await fresh.provide()).models[0].id, "builtin");
      }),
  ],
  [
    "fixed captured product retains all agent configurations and prompts",
    (f) =>
      owned(f, async (s) => {
        let directory = path.dirname(fileURLToPath(import.meta.url));
        while (
          !fs.existsSync(path.join(directory, "config/original/product.json"))
        ) {
          const parent = path.dirname(directory);
          assert.notEqual(
            parent,
            directory,
            "repository product fixture must exist",
          );
          directory = parent;
        }
        const raw = fs.readFileSync(
            path.join(directory, "config/original/product.json"),
            "utf8",
          ),
          expected = JSON.parse(raw);
        fs.writeFileSync(path.join(s.dirname, "product.json"), raw);
        const actual = await s.provider.provide();
        assert.deepEqual(actual, expected);
        assert.equal(actual.agents.length, 19);
        assert.equal(actual.models.length, 44);
        s.env.CODEBUDDY_DISABLE_BUILTIN_MODELS = "true";
        const fresh = Object.assign(new s.api.ClientProductProvider(), {
            fs,
            logger: s.logger,
          }),
          stripped = await fresh.provide();
        assert.equal(stripped.models, undefined);
        assert.deepEqual(stripped.agents, expected.agents);
        assert.deepEqual(stripped.authentication, expected.authentication);
      }),
  ],
];

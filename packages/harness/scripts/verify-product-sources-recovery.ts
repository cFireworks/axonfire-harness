import assert from "node:assert/strict";
import {
  readFile,
  mkdtemp,
  mkdir,
  writeFile,
  rm,
  symlink,
} from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createHash } from "node:crypto";
import { parse } from "acorn";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import {
  PRODUCT_SOURCE_CLASSES,
  nodesOf,
  emittedSource,
  loadCapturedProductSources,
} from "./helpers/captured-product-sources.js";
import { productSourceFixture } from "./helpers/product-source-fixtures.js";
import {
  modelCatalogFactorySource,
  MODEL_CATALOG_FACTORY_SHA256,
} from "../src/vendor/captured-model-catalog.js";
const source = await readFile(getCapturedBundlePath(), "utf8"),
  factory = loadCapturedProductSources(source);
function ast(node: any): any {
  if (!node || typeof node !== "object") return node;
  return Array.isArray(node)
    ? node.map(ast)
    : Object.fromEntries(
        Object.entries(node)
          .filter(([k]) => !["start", "end", "raw"].includes(k))
          .map(([k, v]) => [k, ast(v)]),
      );
}
const ports = ["native-product-sources", "native-product-source-utils"].flatMap(
  (file) =>
    nodesOf(
      parse(emittedSource(file), {
        ecmaVersion: "latest",
        sourceType: "module",
      }),
    ),
);
let completeAsts = 0,
  comparisons = 0;
for (const [name, start, end] of PRODUCT_SOURCE_CLASSES) {
  const original: any = (
    parse("(" + source.slice(start, end) + ")", { ecmaVersion: "latest" })
      .body[0] as any
  ).expression;
  assert.deepEqual(
    ast(
      ports.find((n) => n.type === "ClassDeclaration" && n.id?.name === name)
        .body,
    ),
    ast(original.body),
    name,
  );
  completeAsts += original.body.body.length;
}
const originals = nodesOf(parse(source, { ecmaVersion: "latest" }));
for (const node of originals.filter(
  (n) =>
    n.type === "FunctionDeclaration" &&
    ((n.start >= 9814157 && n.end <= 9818131) ||
      (n.start >= 13370739 && n.end <= 13371572) ||
      n.start === 13069545),
)) {
  assert.deepEqual(
    ast(ports.find((n) => n.type === node.type && n.id?.name === node.id.name)),
    ast(node),
    node.id.name,
  );
  completeAsts++;
}
for (const start of [13330871, 13330943, 13333982, 13334059]) {
  const node = originals.find(
    (n) => n.type === "MethodDefinition" && n.start === start,
  );
  assert.deepEqual(
    ast(
      ports.find((n) => n.type === node.type && n.key?.name === node.key.name),
    ),
    ast(node),
  );
  completeAsts++;
}
const ids = [55119, 66954, 95198, 47023, 17489, 90276];
const payload =
  "{" +
  ids
    .map((id) => {
      const n = originals.find(
        (n) => n.type === "Property" && n.key?.value === id,
      );
      return source.slice(n.start, n.end);
    })
    .join(",") +
  "}";
assert.equal(modelCatalogFactorySource(), payload);
assert.equal(
  createHash("sha256").update(payload).digest("hex"),
  MODEL_CATALOG_FACTORY_SHA256,
);
const cephNodes = nodesOf(
  parse(
    await readFile(
      new URL("../src/vendor/captured-ceph.ts", import.meta.url),
      "utf8",
    ).then((s) => s.replace(/^\/\/.*\n/gm, "").replace(/:any/g, "")),
    { ecmaVersion: "latest", sourceType: "module" },
  ),
);
const ceph = originals.find(
  (n) => n.type === "Property" && n.key?.value === 82005,
);
assert.deepEqual(
  ast(cephNodes.find((n) => n.type === "Property" && n.key?.value === 82005)),
  ast(ceph),
);
function same(a: any, b: any) {
  assert.deepEqual(ast(a), ast(b));
  comparisons++;
}
const variants: any[] = [
  undefined,
  [],
  ["lite", "vision", "reasoning"],
  ["Display", "a", "missing", "a"],
  ["alias"],
  ["custom-local:c"],
];
for (const agentModels of variants)
  for (const tags of [[], ["chat"], ["custom"]]) {
    const values = [undefined, factory].map((f) => productSourceFixture({}, f));
    const models = [
      { id: "a", name: "Display", aliases: ["alias"], tags },
      { id: "custom-local:c", name: "C", tags: ["custom"] },
    ];
    same(
      ...(values.map((f) =>
        f
          .make("AgentModelResolverProvider")
          .resolveAgentModels(
            { name: "owned", description: "fixed", models: agentModels },
            structuredClone(models),
          ),
      ) as [any, any]),
    );
    for (const allowed of [undefined, [], ["a"], ["c"], ["missing"]]) {
      same(
        ...((await Promise.all(
          values.map((f) =>
            f
              .make("AvailableModelsFilterProvider")
              .provide({ current: { models, availableModels: allowed } }),
          ),
        )) as [any, any]),
      );
    }
  }
for (const force of [false, true])
  for (const fail of [false, true]) {
    const values = [undefined, factory].map((f) =>
      productSourceFixture(
        {
          session: { account: { enterpriseId: "owned" } },
          response: fail
            ? Error("owned error")
            : {
                data: {
                  data: [
                    { id: "a", tags: ["chat"] },
                    { id: "b", tags: ["chat"] },
                  ],
                },
              },
        },
        f,
      ),
    );
    for (const f of values)
      f.current.agents.push({ name: "cli", models: ["base"] });
    const providers = values.map((f) => f.make("ModelsProductProvider"));
    for (const advance of [0, 1000, 30000, 480000, 300001]) {
      values.forEach((f) => f.advance(advance));
      same(
        ...((await Promise.all(
          providers.map((p, i) =>
            p.provide({ current: values[i]!.current, force }),
          ),
        )) as [any, any]),
      );
      same(values[0]!.calls, values[1]!.calls);
      same(providers[0].retryBackoffUntil, providers[1].retryBackoffUntil);
    }
  }
for (const response of [
  { status: 200, data: { allowed: true, policy_mode: "all" } },
  {
    status: 200,
    data: { code: 0, data: { allowed: false, policy_mode: "none" } },
  },
  { status: 401, data: {} },
  { status: 200, data: { allowed: "bad" } },
  Error("owned failure"),
]) {
  const values = [undefined, factory].map((f) =>
    productSourceFixture(
      { session: { account: { enterpriseId: "a/b", uid: "owned" } }, response },
      f,
    ),
  );
  // Core service here deliberately avoids any disk access in the differential matrix.
  const policies = values.map((f) =>
    f.make("EnterpriseCustomModelPolicyServiceImpl"),
  );
  for (const advance of [0, 1000, 30000, 300000]) {
    values.forEach((f) => f.advance(advance));
    same(
      ...((await Promise.all(policies.map((p) => p.getPolicy({})))) as [
        any,
        any,
      ]),
    );
    same(values[0]!.calls, values[1]!.calls);
  }
}
const root = await mkdtemp(join(tmpdir(), "source-diff-"));
try {
  await mkdir(join(root, ".codebuddy", "commands", "nested"), {
    recursive: true,
  });
  await mkdir(join(root, ".codebuddy", "agents"), { recursive: true });
  await symlink(
    join(root, ".codebuddy"),
    join(root, ".codebuddy", "commands", "loop"),
  );
  await writeFile(
    join(root, ".codebuddy", "commands", "nested", "owned.md"),
    "---\ndescription: owned\nallowed-tools: Read, Edit\nmodel: a\n---\n${OWNED:-fallback} ${CLAUDE_SESSION_ID}",
  );
  await writeFile(
    join(root, ".codebuddy", "agents", "owned.md"),
    "---\nname: owned\ntools: [Read]\nskills: [owned]\nmodel: Display\nhooks:\n  Stop: []\n---\nowned instructions",
  );
  const values = [undefined, factory].map((f) =>
    productSourceFixture({ root, env: { OWNED: "expanded" } }, f),
  );
  for (const name of [
    "CustomCommandsProductProvider",
    "CustomAgentsProductProvider",
  ])
    same(
      ...((await Promise.all(
        values.map((f) => f.make(name).provide(f.input)),
      )) as [any, any]),
    );
  for (const maxDepth of [0, 1, 2, 100])
    same(
      ...((await Promise.all(
        values.map((f) =>
          f.classes.utilities.DirectoryScanUtils.scan(root, {
            maxDepth,
            extension: ".md",
          }),
        ),
      )) as [any, any]),
    );
  for (const text of [
    "${X}",
    "${OWNED}",
    "${X:-fallback}",
    "${CODEBUDDY_SKILL_DIR} ${CLAUDE_SESSION_ID}",
    "${CODEBUDDY_PLUGIN_ROOT}",
  ])
    same(
      ...(values.map((f) =>
        f.classes.utilities.substituteLoadTimeVariables(
          text,
          join(root, "owned.md"),
          root,
        ),
      ) as [any, any]),
    );
  for (const color of [
    undefined,
    "red",
    "bad",
    "#abc",
    "#12345678",
    "rgb(0, 128, 255)",
    "hsl(180, 30%, 50%)",
  ])
    same(
      ...(values.map((f) =>
        f.classes.utilities.ColorUtils.getTextColor(color, "owned"),
      ) as [any, any]),
    );
  for (const mode of ["config", "content"])
    for (const sensitive of [false, true])
      same(
        ...(values.map((f) =>
          f.classes.utilities.substitutePluginVariables(
            "${user_config.token} ${PLUGIN_OPT:token} ${CLAUDE_PLUGIN_ROOT}",
            {
              pluginId: "owned",
              pluginRoot: root,
              projectDir: root,
              options: { token: "owned" },
              userConfig: { token: { sensitive } },
            },
            { mode },
          ),
        ) as [any, any]),
      );
  await mkdir(join(root, "home", ".workbuddy"), { recursive: true });
  await writeFile(
    join(root, "home", ".workbuddy", "models.json"),
    JSON.stringify({
      models: [{ id: "same", name: "user", apiKey: "${OWNED}" }],
      availableModels: ["same"],
    }),
  );
  for (const config of [
    [],
    [{ id: "same", url: "${OWNED}" }],
    {
      models: [{ id: "new", name: "gpt-4o" }, { name: "bad" }],
      availableModels: ["new", 42],
    },
    { models: "invalid" },
    null,
  ]) {
    await writeFile(
      join(root, ".codebuddy", "models.json"),
      JSON.stringify(config),
    );
    for (const prefix of [false, true])
      for (const enabled of [false, true]) {
        const pairs = [undefined, factory].map((f) =>
          productSourceFixture(
            {
              root,
              home: join(root, "home"),
              env: { OWNED: "http://127.0.0.1:1/v1" },
            },
            f,
          ),
        );
        for (const f of pairs)
          Object.assign(f.current.productFeatures, {
            CustomModelIdPrefix: prefix,
            CustomModelsJSON: enabled,
          });
        same(
          ...((await Promise.all(
            pairs.map((f) => {
              const p = f.make("CustomModelsProductProvider");
              p.watchFile = () => {};
              return p.provide(f.input);
            }),
          )) as [any, any]),
        );
      }
  }
  for (const allowed of [true, false])
    for (const feature of [true, false]) {
      const pairs = [undefined, factory].map((f) =>
        productSourceFixture({}, f),
      );
      same(
        ...((await Promise.all(
          pairs.map((f) =>
            f
              .make("EnterpriseCustomModelPolicyFilterProvider", {
                policyService: {
                  getCachedSnapshot: () => ({ allowed }),
                  onChanged() {},
                },
              })
              .provide({
                current: {
                  productFeatures: {
                    EnableEnterpriseCustomModelPolicy: feature,
                  },
                  models: [
                    { id: "custom-local:a", tags: ["custom"] },
                    { id: "remote", tags: ["custom"] },
                  ],
                  availableModels: ["custom-local:a", "remote"],
                },
              }),
          ),
        )) as [any, any]),
      );
    }
  for (const craft of [[], ["a"], ["a", "b"]])
    for (const cli of [[], ["a"], ["c"]])
      same(
        ...((await Promise.all(
          values.map((f) =>
            f.make("CraftToCliAgentModelsSyncProvider").provide({
              current: {
                agents: [
                  { name: "craft", models: craft },
                  { name: "cli", models: cli },
                ],
              },
            }),
          ),
        )) as [any, any]),
      );
} finally {
  await rm(root, { recursive: true, force: true });
}
console.log(
  JSON.stringify({
    completeAsts,
    comparisons,
    pureFactories: 7,
    catalogSha256: MODEL_CATALOG_FACTORY_SHA256,
  }),
);

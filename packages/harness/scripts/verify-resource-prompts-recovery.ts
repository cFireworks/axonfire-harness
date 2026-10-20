import assert from "node:assert/strict";
import { readFile, mkdtemp, rm } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, resolve, join } from "node:path";
import { tmpdir } from "node:os";
import { parse } from "acorn";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { nodesOf } from "./helpers/captured-product-sources.js";
import {
  loadCapturedResourcePrompts,
  emittedPrompt,
  RESOURCE_PROMPT_CLASSES,
  RESOURCE_PROMPT_FUNCTIONS,
  RESOURCE_PROMPT_CONSTANTS,
  PROMPT_RUNTIME_CONTEXT_DECLARATIONS,
} from "./helpers/captured-resource-prompts.js";
import { resourcePromptFixture } from "./helpers/resource-prompt-fixtures.js";
import { PROMPT_PROXY_FACTORIES } from "../src/vendor/captured-node-proxy-agents.js";
import {
  DESKTOP_TEMPLATE_ASSETS,
  desktopTemplateDirectory,
  verifyDesktopTemplateAssets,
} from "../src/prompts/desktop-template-assets.js";
import {
  createNativePromptCliLanguage,
  PROMPT_CLI_LANGUAGE_SHA256,
  PROMPT_CLI_LANGUAGE_FUNCTION,
} from "../src/prompts/native-prompt-cli-language.js";
const main =
  process.env.WORKBUDDY_MODE_COORDINATOR ??
  resolve(
    dirname(getCapturedBundlePath()),
    "../../main/workbuddy-auth-product-coordinator.js",
  );
const sources = {
  coordinator: await readFile(main, "utf8"),
  context: await readFile(resolve(dirname(main), "runtime-context.js"), "utf8"),
  proxy: await readFile(resolve(dirname(main), "net-log.js"), "utf8"),
};
const original = loadCapturedResourcePrompts(sources);
const initialize = await readFile(
  process.env.WORKBUDDY_DESKTOP_INITIALIZE ??
    resolve(dirname(main), "initialize.js"),
  "utf8",
);
assert.equal(
  createHash("sha256").update(initialize).digest("hex"),
  PROMPT_CLI_LANGUAGE_SHA256,
);
const languageSource = initialize.slice(
  PROMPT_CLI_LANGUAGE_FUNCTION[1],
  PROMPT_CLI_LANGUAGE_FUNCTION[2],
);
function ast(v: any): any {
  return v && typeof v === "object"
    ? Array.isArray(v)
      ? Array.from(v, ast)
      : Object.fromEntries(
          Object.entries(v)
            .filter(([k]) => !["start", "end", "raw"].includes(k))
            .map(([k, v]) => [k, ast(v)]),
        )
    : v;
}
const ports = nodesOf(
  parse(emittedPrompt("prompts/native-resource-prompt"), {
    ecmaVersion: "latest",
    sourceType: "module",
  }),
);
let members = 0,
  fullFunctions = 0,
  constantInitializers = 0,
  comparisons = 0;
assert.deepEqual(
  ast(
    nodesOf(
      parse(emittedPrompt("prompts/native-prompt-cli-language"), {
        ecmaVersion: "latest",
        sourceType: "module",
      }),
    ).find(
      (n) =>
        n.type === "FunctionDeclaration" &&
        n.id?.name === "resolveCliSettingsLanguage",
    ),
  ),
  ast(parse(languageSource, { ecmaVersion: "latest" }).body[0]),
);
fullFunctions++;
for (const [name, start, end] of RESOURCE_PROMPT_CLASSES) {
  const raw: any = (
    parse("(" + sources.coordinator.slice(start, end) + ")", {
      ecmaVersion: "latest",
    }).body[0] as any
  ).expression;
  const port = ports.find(
    (n) =>
      n.type === "VariableDeclarator" &&
      n.id?.name === name &&
      n.init?.type === "ClassExpression",
  ).init;
  assert.deepEqual(ast(port), ast(raw), name);
  members += raw.body.body.length;
}
for (const [name, start, end] of RESOURCE_PROMPT_FUNCTIONS) {
  assert.deepEqual(
    ast(
      ports.find(
        (n) => n.type === "FunctionDeclaration" && n.id?.name === name,
      ),
    ),
    ast(
      parse(sources.coordinator.slice(start, end), { ecmaVersion: "latest" })
        .body[0],
    ),
    name,
  );
  fullFunctions++;
}
for (const [name, start, end] of RESOURCE_PROMPT_CONSTANTS) {
  // The class-local 4000-char MAX_USER_MEMORY_CHARS is not the module-global 10000-char cap.
  const raw: any = parse(sources.coordinator.slice(start, end), {
    ecmaVersion: "latest",
  }).body[0];
  assert.ok(
    ports.some(
      (n) =>
        n.type === "VariableDeclaration" &&
        n.declarations[0]?.id?.name === name &&
        JSON.stringify(ast(n)) === JSON.stringify(ast(raw)),
    ),
    name,
  );
  constantInitializers++;
}
for (const [file, source, rows] of [
  [
    "prompts/native-prompt-runtime-context",
    sources.context,
    PROMPT_RUNTIME_CONTEXT_DECLARATIONS,
  ],
  ["vendor/captured-node-proxy-agents", sources.proxy, PROMPT_PROXY_FACTORIES],
] as const) {
  const emitted = nodesOf(
    parse(emittedPrompt(file), { ecmaVersion: "latest", sourceType: "module" }),
  );
  for (const [name, start, end] of rows) {
    const raw: any = parse(source.slice(start, end), { ecmaVersion: "latest" })
      .body[0];
    assert.deepEqual(
      ast(
        emitted.find(
          (n) => (n.id?.name ?? n.declarations?.[0]?.id?.name) === name,
        ),
      ),
      ast(raw),
      file + ":" + name,
    );
  }
}
verifyDesktopTemplateAssets();
for (const asset of DESKTOP_TEMPLATE_ASSETS)
  assert.deepEqual(
    await readFile(resolve(desktopTemplateDirectory(), asset.file)),
    await readFile(
      resolve(dirname(main), "../resources/templates", asset.file),
    ),
    asset.file,
  );
const root = await mkdtemp(join(tmpdir(), "resource-prompt-diff-"));
let sequence = 0;
async function pair(
  run: (h: Awaited<ReturnType<typeof resourcePromptFixture>>) => Promise<any>,
  spec: any = {},
) {
  const values = [];
  for (const captured of [false, true]) {
    const h = await resourcePromptFixture(
      join(root, String(++sequence).padStart(6, "0")),
      captured ? original.factory : undefined,
      { ...spec, ...(captured ? { nunjucks: original.nunjucks } : {}) },
    );
    try {
      const output = await run(h);
      await h.drain();
      values.push(h.snapshot(output));
    } finally {
      await h.dispose();
    }
  }
  assert.deepEqual(values[0], values[1], "scenario " + comparisons);
  comparisons++;
}
try {
  for (const locale of [undefined, "", "zh-CN", "en-US"])
    for (const configured of [undefined, " ", " zh-Hant ", "en"])
      await pair(async (h) => {
        const dependencies = {
          readAppConfigValue: () => configured,
          getSystemLocale: () => locale,
        };
        const raw = Function(
          "require_workbuddy_auth_product_coordinator",
          languageSource + ";return resolveCliSettingsLanguage",
        )(h.native);
        const port = createNativePromptCliLanguage(
          h.native,
        ).resolveCliSettingsLanguage;
        assert.equal(port(dependencies), raw(dependencies));
        return port(dependencies);
      });
  for (const mode of [undefined, "craft", "ask", "plan", "expert"])
    for (const expertId of [undefined, "owned-expert"])
      for (const welcomeMode of [undefined, "code", "work", "design"])
        await pair(async (h) => {
          const options = {
            mode,
            expertId,
            welcomeMode,
            modelId: "owned-id",
            cwd: h.cwd,
            conversationId: "owned-conversation",
          };
          await h.service.initialize();
          h.service.warmup();
          return [
            await h.service.renderSystemPrompt(options),
            await h.service.collectSystemPromptVariables(options),
            await h.service.renderUserContext(options),
          ];
        });
  for (const locale of ["en-US", "zh-CN", "ZH-hans", "", " cn "])
    for (const configured of [undefined, null, 7, " ", " zh-TW ", "en"])
      await pair(
        async (h) => {
          const vars: any = {};
          await h.service
            .getRenderer()
            .getCollectors()[0]
            .collect(vars, { options: { modelId: " custom ", cwd: h.cwd } });
          return vars;
        },
        { locale, appConfig: { locale: configured } },
      );
  for (const personalization of [
    undefined,
    [],
    {},
    { toneStyle: " friendly ", customPrompt: " custom owned " },
    ...[
      "professional",
      "straightforward",
      "creative",
      "efficient",
      "sarcastic",
      "socratic",
      "unknown",
      "",
    ].map((toneStyle) => ({ toneStyle })),
    { toneStyle: false, customPrompt: 3 },
  ])
    await pair(
      async (h) => {
        await h.put("home/.workbuddy/settings.json", {
          personalization: {
            toneStyle: "friendly",
            customPrompt: "legacy owned",
          },
        });
        return h.service.renderUserContext({
          cwd: h.cwd,
          conversationId: "owned",
        });
      },
      { appConfig: { personalization } },
    );
  for (const identity of [undefined, "custom identity", ""])
    for (const user of [undefined, "custom user", ""])
      for (const expertId of [undefined, "expert"])
        await pair(async (h) => {
          if (identity !== undefined)
            await h.put("home/.workbuddy/IDENTITY.md", identity);
          if (user !== undefined) await h.put("home/.workbuddy/USER.md", user);
          const first = await h.service.collectSystemPromptVariables({
            cwd: h.cwd,
            expertId,
          });
          await rm(join(h.configDir, "BOOTSTRAP.md"), { force: true });
          const second = await h.service.collectSystemPromptVariables({
            cwd: h.cwd,
            expertId,
          });
          return [
            first,
            second,
            JSON.parse(
              await readFile(join(h.configDir, "workspace-state.json"), "utf8"),
            ),
          ];
        });
  for (const size of [0, 4000, 4001, 8000, 8001, 10000, 10001])
    for (const disabled of [false, true])
      await pair(
        async (h) => {
          await h.put("project/.workbuddy/memory/MEMORY.md", "x".repeat(size));
          await h.put("home/.workbuddy/MEMORY.md", "u".repeat(size));
          await h.put("home/.workbuddy/SOUL.md", "s".repeat(size));
          return h.service.collectSystemPromptVariables({ cwd: h.cwd });
        },
        { appConfig: { disableLocalSkillsMemory: disabled } },
      );
  for (const account of [undefined, {}, { uid: "owned-user" }])
    for (const token of [undefined, "owned-token"])
      for (const block of [undefined, "", "local owned"])
        await pair(
          async (h) => {
            if (block !== undefined)
              await h.put(
                "home/.workbuddy/memory/owned-user_memory.md",
                h.native.toMarkdown({
                  uid: "owned-user",
                  version: 1,
                  memoryBlock: block,
                }),
              );
            return h.service.collectSystemPromptVariables({ cwd: h.cwd });
          },
          { account, token },
        );
  for (const response of [
    { code: 0, data: { foryou_prompt: "cloud owned" } },
    { code: 1, data: {} },
    { code: 0, data: { foryou_prompt: "" } },
    "broken",
    { code: 0, data: { foryou_prompt: "c".repeat(10001) } },
  ])
    for (const status of [200, 401, 302])
      await pair(
        async (h) => [
          await h.service.collectSystemPromptVariables({ cwd: h.cwd }),
          await h.service.collectSystemPromptVariables({ cwd: h.cwd }),
        ],
        {
          account: { uid: "owned-user" },
          token: "owned-token",
          response,
          status,
        },
      );
  for (const appConfig of [
    { generateMemoryEnabled: false },
    { expertManagementEnabled: false },
    { bundledRuntime: { enabled: false } },
    { bundledRuntime: { tools: { python: false } } },
  ])
    await pair(
      async (h) => h.service.collectSystemPromptVariables({ cwd: h.cwd }),
      {
        appConfig,
        account: { uid: "owned-user" },
        token: "owned-token",
        binary: {
          summary: "owned binary",
          instructions: "owned binary instructions",
        },
      },
    );
  for (const productFeatures of [
    { DisableMemoryPersonalization: true },
    { DisableExpertManagement: true },
  ])
    await pair(
      async (h) => h.service.collectSystemPromptVariables({ cwd: h.cwd }),
      {
        product: { productFeatures },
        account: { uid: "owned-user" },
        token: "owned-token",
      },
    );
  for (const size of [0, 9999, 10000, 10001])
    for (const instructions of [undefined, "i"])
      await pair(
        async (h) => h.service.collectSystemPromptVariables({ cwd: h.cwd }),
        { binary: { summary: "b".repeat(size), instructions } },
      );
  for (const uid of ["owned-user", "a/b:c?", "", "  owned  "])
    await pair(async (h) => {
      const options = {
        baseDir: join(h.configDir, "memory"),
        legacyBaseDir: join(h.configDir, "memery"),
        logger: h.native.getLogger({}),
      };
      const profile = { uid, version: 2, memoryBlock: "owned profile" };
      const writes = [
        await h.native.writeProfile(uid, profile, options),
        await h.native.writeProfile(uid, { ...profile, version: 1 }, options),
        await h.native.writeProfile(uid, profile, options),
      ];
      const read = await h.native.readProfile(uid, options);
      const deleted = await h.native.deleteProfile(uid, options);
      return [writes, read, deleted, await h.native.readProfile(uid, options)];
    });
  await pair(
    async (h) => {
      await h.put(
        "home/.workbuddy/memery/owned-user_memery.md",
        h.native.toMarkdown({
          uid: "old",
          version: 2,
          memoryBlock: "legacy migrated",
        }),
      );
      const vars = await h.service.collectSystemPromptVariables({ cwd: h.cwd });
      await h.drain();
      return [
        vars.UserMemoryContent,
        await h.native.readProfile("owned-user", {
          baseDir: join(h.configDir, "memory"),
          legacyBaseDir: join(h.configDir, "memery"),
        }),
      ];
    },
    { account: { uid: "owned-user" } },
  );
  await pair(
    async (h) => {
      const options = { cwd: h.cwd };
      const first = await h.service.collectSystemPromptVariables(options);
      await h.put(
        "home/.workbuddy/memory/owned-user_memory.md",
        h.native.toMarkdown({
          uid: "owned-user",
          memoryBlock: "local after empty remote",
        }),
      );
      h.advance(1000);
      const next = await h.service.collectSystemPromptVariables(options);
      return [first.UserMemoryContent, next.UserMemoryContent];
    },
    {
      account: { uid: "owned-user" },
      token: "owned-token",
      response: { code: 0, data: {} },
    },
  );
  for (const templatesDir of [undefined, join(root, "missing-templates")])
    await pair(
      async (h) => [
        h.native.listWorkbuddyPromptTemplateDirCandidates(),
        h.native.listWorkbuddyPromptTemplatePathCandidates("owned.tpl"),
        h.native.resolveWorkbuddyPromptTemplatePath("owned.tpl"),
        h.native.uniqueNonEmpty([" x ", "x", "", undefined, "y"]),
      ],
      { templatesDir },
    );
} finally {
  await rm(root, { recursive: true, force: true });
}
console.log(
  JSON.stringify({
    completeClasses: RESOURCE_PROMPT_CLASSES.length,
    classMembers: members,
    fullFunctions,
    constantInitializers,
    runtimeDeclarations: PROMPT_RUNTIME_CONTEXT_DECLARATIONS.length,
    proxyFactories: PROMPT_PROXY_FACTORIES.length,
    originalNunjucksFactories: original.nunjucksFactories,
    optionalTemplateWatchersDisabledForVerification: true,
    templateAssets: DESKTOP_TEMPLATE_ASSETS.length,
    comparisons,
    desktopBootstrapExecuted: false,
  }),
);

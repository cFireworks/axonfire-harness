import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parse } from "acorn";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { nodesOf } from "./helpers/captured-product-sources.js";
import {
  PRODUCT_ENVIRONMENT_CLASSES,
  PRODUCT_ENVIRONMENT_FUNCTIONS,
  emittedEnvironment,
  loadCapturedProductEnvironment,
} from "./helpers/captured-product-environment.js";
import { productEnvironmentFixture } from "./helpers/product-environment-fixtures.js";
import { productEnvironmentSettingsRace } from "./helpers/product-environment-settings-race.js";
import { loadCapturedSettings } from "./helpers/captured-settings.js";
import { loadCapturedToolPermission } from "./helpers/captured-tool-permission.js";
const source = await readFile(getCapturedBundlePath(), "utf8"),
  factory = loadCapturedProductEnvironment(source);
function ast(value: any): any {
  if (!value || typeof value !== "object") return value;
  return Array.isArray(value)
    ? Array.from(value, ast)
    : Object.fromEntries(
        Object.entries(value)
          .filter(([key]) => !["start", "end", "raw"].includes(key))
          .map(([key, value]) => [key, ast(value)]),
      );
}
const ports = nodesOf(
  parse(emittedEnvironment(), { ecmaVersion: "latest", sourceType: "module" }),
);
let members = 0,
  functions = 0,
  comparisons = 0;
for (const row of [
  ...PRODUCT_ENVIRONMENT_CLASSES,
  ...PRODUCT_ENVIRONMENT_FUNCTIONS,
]) {
  const raw = source.slice(row[1], row[2]),
    original: any = (
      parse("(" + raw + ")", { ecmaVersion: "latest" }).body[0] as any
    ).expression;
  const port = ports.find(
    (n) =>
      n.id?.name === row[0] &&
      (n.type === "ClassDeclaration" || n.type === "FunctionDeclaration"),
  );
  assert.deepEqual(ast(port.body), ast(original.body), row[0]);
  if (original.type === "ClassExpression") members += original.body.body.length;
  else {
    assert.deepEqual(
      ast(port.params),
      ast(original.params),
      row[0] + " params",
    );
    functions++;
  }
}
assert.equal(
  (productEnvironmentFixture().classes.SettingsEndpointProductProvider as any)
    .CACHE_TTL_MS,
  10000,
);
for (const [name, start, end, nativeName] of PRODUCT_ENVIRONMENT_CLASSES) {
  assert.equal(productEnvironmentFixture().classes[name].name, nativeName);
  assert.equal(
    Function(
      `let ${nativeName}=${source.slice(start, end)};return ${nativeName}.name`,
    )(),
    nativeName,
  );
}
assert.equal(
  Number(source.slice(9892221, 9892270).match(/CACHE_TTL_MS=([^,;]+)/)![1]),
  10000,
);
async function pair(
  run: (fixture: ReturnType<typeof productEnvironmentFixture>) => Promise<any>,
  spec: any = {},
) {
  const values = [];
  for (const f of [undefined, factory]) {
    const h = productEnvironmentFixture(f, spec);
    try {
      values.push(h.snapshot(await run(h)));
    } finally {
      h.dispose();
    }
  }
  assert.deepEqual(values[0], values[1]);
  comparisons++;
}
const key = "CODEBUDDY_INTERNET_ENVIRONMENT",
  old = "CODEBUDDY_INTERNET_ENVIROMENT";
for (const settings of [
  {},
  { env: { [key]: "internal" } },
  { env: { [old]: "iOA" } },
  { env: { [key]: "", [old]: "external" } },
  { enterpriseEndpoint: "http://owned" },
])
  for (const env of [
    {},
    { [key]: "selfhosted" },
    { [old]: "cloudhosted" },
    { [key]: "external", [old]: "internal" },
  ])
    for (const domain of [
      undefined,
      "internal.owned",
      "ioa.owned",
      "cloud.owned",
      "external.owned",
      "unknown.owned",
    ])
      await pair(async (h) => h.service.getCurrent(), {
        settings,
        env,
        session: domain ? { auth: { domain } } : undefined,
      });
for (const current of [
  null,
  { networkEnvironment: "sandbox" },
  { authentication: { attributes: {} } },
])
  await pair(
    async (h) => [
      await h.service.getCurrent(),
      await h.service.resolveEnvBySession({
        auth: { domain: "internal.owned" },
      }),
    ],
    { current },
  );
for (const existing of [undefined, "internal", "external"])
  for (const next of [undefined, "", "internal", "external", "iOA"])
    for (const syncError of [false, true])
      await pair(
        async (h) => {
          await h.service.switch(next);
          await h.service.switch(next);
          await h.service.switch("cloudhosted");
          return await h.service.getCurrent();
        },
        { env: { [key]: existing }, syncError },
      );
for (const env of [{}, { [key]: "external" }, { [old]: "external" }])
  for (const set of [
    {},
    { env: { [key]: "cloudhosted" } },
    { env: { [old]: "internal" } },
  ])
    for (const last of [undefined, "external", "internal"])
      await pair(
        async (h) => {
          h.service.lastSwitchedEnv = last;
          await h.service.switchBySession({
            auth: { domain: "internal.owned" },
          });
          return h.service.getCurrent();
        },
        { env, settings: set },
      );
for (const platform of ["darwin", "win32", "linux"])
  for (const domain of [
    "internal.owned",
    "a.internal.owned",
    "a.b.internal.owned",
    "ioa.owned",
    "cloud.owned",
    "external.owned",
    "other.owned",
    "",
  ])
    for (const enterprise of [false, true]) {
      const dir =
        platform === "darwin"
          ? "Library/Application Support/CodeBuddyExtension"
          : platform === "win32"
            ? "AppData/Local/CodeBuddyExtension"
            : ".local/share/CodeBuddyExtension";
      await pair(
        async (h) => {
          h.service.earlyEnvInit();
          h.service.earlyEnvInit();
          return h.classes.resolveEnvFromSessionFileSync();
        },
        {
          platform,
          files: {
            ["/platform/" + dir + "/Data/Public/auth/owned.info"]: {
              auth: { domain },
            },
            "/state/settings.json": enterprise
              ? { enterpriseEndpoint: "http://owned" }
              : {},
          },
        },
      );
    }
for (const base of [
  {},
  { authentication: {} },
  { authentication: { id: "owned" } },
])
  for (const settings of ["broken", { enterpriseEndpoint: "http://owned" }])
    await pair(
      async (h) => {
        h.service.earlyEnvInit();
        return h.env;
      },
      { base, files: { "/state/settings.json": settings } },
    );
for (const env of [
  {},
  { [key]: "EXTERNAL" },
  { [old]: "internal" },
  { ENV_PRODUCT_CLI_ACCOUNT_TYPE: "iOA" },
  { [key]: "selfhosted", CODEBUDDY_DISABLE_BUILTIN_MODELS: "yes" },
])
  for (const settings of [
    {},
    { env: { [key]: "cloudhosted" } },
    { env: { [old]: "internal" } },
  ])
    for (const noFs of [false, true])
      await pair(
        async (h) => {
          h.internet.init();
          const first = await h.internet.provide({ current: {} });
          h.files.set("/resources/product.internal.json", '{"changed":true}');
          const second = await h.internet.provide({ force: true, current: {} });
          return [first, second];
        },
        {
          env,
          settings,
          noFs,
          files: Object.fromEntries(
            ["external", "internal", "ioa", "cloudhosted", "selfhosted"].map(
              (name) => [
                "/resources/product." + name + ".json",
                { marker: name, models: [{ id: "owned" }] },
              ],
            ),
          ),
        },
      );
for (const productConfigEnv of [undefined, "CONFIG", ["A", "CONFIG"], []])
  await pair(
    async (h) => [
      h.internet.getNetworkEnviromentFromConfigEnv(productConfigEnv),
      await h.internet.provide({ current: { productConfigEnv } }),
    ],
    {
      env: {
        CONFIG: '{"networkEnvironment":"internal"}',
        C: '{"networkEnvironment":"external"}',
      },
    },
  );
for (const domain of ["http://cloud.owned/", "http://a.cloud.owned", "bad", ""])
  await pair(
    async (h) => [
      await h.internet.resolveDeploymentType("selfhosted", {
        endpoint: domain,
        authentication: {
          attributes: { cloudHostedDomain: ["cloud.owned", "*.cloud.owned"] },
        },
      }),
      h.internet.extractDomain(domain),
    ],
    {},
  );
for (const environment of [
  undefined,
  "internal",
  "selfhosted",
  "cloudhosted",
  "iOA",
])
  for (const route of [undefined, "staging", " production ", "custom"])
    for (const endpoint of [undefined, " http://configured.owned ", ""])
      for (const enterprise of [undefined, " http://enterprise.owned "])
        await pair(
          async (h) => {
            h.endpoint.init();
            const first = await h.endpoint.provide({});
            h.settings.endpoint = "http://new.owned";
            h.setNow(109999);
            const cached = await h.endpoint.provide({ force: true });
            h.setNow(110000);
            const expired = await h.endpoint.provide({});
            h.settings.enterpriseEndpoint = "http://changed.owned";
            await h.fire();
            return [first, cached, expired, await h.endpoint.provide({})];
          },
          {
            env: { [key]: environment },
            settings: {
              envRouteMode: route,
              endpoint,
              enterpriseEndpoint: enterprise,
            },
          },
        );
for (const [pattern, domain] of [
  ["*.owned", "a.owned"],
  ["*.owned", "a.b.owned"],
  ["a+owned", "aaowned"],
  ["a(.*).owned", "ab.owned"],
  ["[*.owned", "a.owned"],
])
  await pair(async (h) => {
    try {
      return [
        h.service.matchDomain(pattern, domain),
        h.service.isDomain([pattern], domain),
        h.classes.matchDomainList([pattern], domain),
      ];
    } catch (error: any) {
      return { error: error.name, message: error.message };
    }
  });
assert.deepEqual(
  await productEnvironmentSettingsRace(),
  await productEnvironmentSettingsRace({
    settings: loadCapturedSettings(source),
    permission: loadCapturedToolPermission(source),
    environment: factory,
  }),
);
comparisons++;
console.log(
  JSON.stringify({
    completeClasses: PRODUCT_ENVIRONMENT_CLASSES.length,
    completeClassMembers: members,
    fullFunctions: functions,
    comparisons,
    installedBootstrapExecuted: false,
  }),
);

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parse } from "acorn";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import { nodesOf } from "./helpers/captured-product-sources.js";
import {
  CLOUD_PRODUCT_CLASSES,
  emittedCloud,
  loadCapturedCloud,
} from "./helpers/captured-cloud-product.js";
import { cloudProductFixture } from "./helpers/cloud-product-fixtures.js";
const source = await readFile(getCapturedBundlePath(), "utf8"),
  factory = loadCapturedCloud(source);
function ast(v: any): any {
  if (!v || typeof v !== "object") return v;
  return Array.isArray(v)
    ? v.map(ast)
    : Object.fromEntries(
        Object.entries(v)
          .filter(([k]) => !["start", "end", "raw"].includes(k))
          .map(([k, v]) => [k, ast(v)]),
      );
}
const ports = nodesOf(
  parse(emittedCloud(), { ecmaVersion: "latest", sourceType: "module" }),
);
let members = 0,
  comparisons = 0,
  constants = 0;
for (const [name, start, end, nativeName] of CLOUD_PRODUCT_CLASSES) {
  const raw = source.slice(start, end),
    original: any = (
      parse("(" + raw + ")", { ecmaVersion: "latest" }).body[0] as any
    ).expression;
  const port = ports.find(
    (n) => n.type === "ClassDeclaration" && n.id?.name === name,
  );
  assert.deepEqual(ast(port.body), ast(original.body), name);
  members += original.body.body.length;
  // Assignment inference is observed independently of the restored name bridge.
  assert.equal(
    Function(`let ${nativeName}=${raw};return ${nativeName}.name`)(),
    nativeName,
  );
  assert.equal(cloudProductFixture().classes[name].name, nativeName);
}
for (const [start, end, names] of [
  [15252240, 15252547, ["eC", "ey", "ew", "eB"]],
  [15258150, 15258449, ["ef", "em"]],
] as const) {
  const fragment = source.slice(start, end),
    text =
      "let " +
      fragment.slice(fragment.lastIndexOf("let ") + 4).replace(/,\w+=$/, ";");
  const originals = nodesOf(parse(text, { ecmaVersion: "latest" }));
  for (const name of names) {
    const n = originals.find(
      (n) => n.type === "VariableDeclarator" && n.id.name === name,
    );
    const p = ports.find(
      (p) =>
        p.type === "VariableDeclarator" &&
        p.id?.name === name &&
        JSON.stringify(ast(p.init)) === JSON.stringify(ast(n.init)),
    );
    assert.ok(p, "initializer " + name);
    constants++;
  }
}
for (const [start, end, key] of [
  [15146200, 15147000, "REQUEST_ID_HEADER"],
  [15612500, 15612850, "CloudAgentsSmartMerge"],
] as const) {
  const match = source
    .slice(start, end)
    .match(new RegExp("\\." + key + '=("[^"\\n]*")'));
  assert.ok(match);
  const expected = JSON.parse(match[1]!);
  assert.ok(
    ports.some(
      (n) =>
        n.type === "Property" &&
        n.key?.name === key &&
        n.value?.value === expected,
    ),
    key,
  );
  constants++;
}
function same(a: any, b: any) {
  assert.deepEqual(a, b);
  comparisons++;
}
async function pair(run: (f: any) => Promise<any>, options: any = {}) {
  const values = [];
  for (const f of [undefined, factory]) {
    const h = cloudProductFixture(f, options);
    values.push(await run(h));
    await h.drain();
  }
  same(values[0], values[1]);
}
for (const session of [
  undefined,
  {},
  { account: { uid: "u" } },
  { account: { uid: "" }, auth: { accessToken: "x" } },
  ...["ApiKey", "apikey", "Bearer", ""].map((tokenType) => ({
    account: { uid: "u", nickname: "N", departmentFullName: "D" },
    auth: { accessToken: "x", tokenType },
  })),
]) {
  await pair(async (f) => {
    f.setSession(session);
    let user;
    try {
      user = await f.userinfo.provide();
    } catch (e) {
      user = (e as Error).name;
    }
    return [await f.pre.provide(), user];
  });
}
for (const flag of [undefined, "true", "1", "TRUE", "false", "0"])
  for (const disabled of [false, true])
    await pair(
      async (f) => [
        await f.provider.provide({ current: { config: { disabled } } }),
        f.calls,
        f.provider.getCachedMergeStrategy(),
      ],
      { env: { CODEBUDDY_REMOTE_CONFIG_DISABLED: flag } },
    );
for (const endpoint of ["", "http://owned.invalid"])
  for (const url of [undefined, "/owned"])
    await pair(
      async (f) => [
        await f.provider.provide({ current: { config: { url } } }),
        f.calls,
      ],
      { endpoint },
    );
for (const smart of [false, true])
  for (const command of [undefined, false, true])
    await pair(async (f) => {
      const remote = {
        endpoint: "drop",
        stagingEndpoint: "drop",
        deploymentType: "drop",
        productFeatures: { CommandsSmartMerge: command },
        agents: [
          { name: "a", instructions: "remote", models: ["r"] },
          { name: "r" },
        ],
        models: [{ id: "m", remote: true }, null, {}],
      };
      f.manager.fetch = async () => remote;
      const current = {
        config: {},
        productFeatures: {
          CloudAgentsSmartMerge: smart,
          CommandsSmartMerge: true,
        },
        agents: [{ name: "a", instructions: "base", models: ["b"] }],
        models: [{ id: "m", base: true }, { id: "removed" }],
      };
      const value = await f.provider.provide({ current });
      f.runtime.env.CODEBUDDY_REMOTE_CONFIG_DISABLED = "true";
      return [
        value,
        remote,
        await f.provider.provide({ current }),
        f.provider.getCachedMergeStrategy(),
      ];
    });
await pair(async (f) => {
  f.manager.init();
  f.provider.init();
  const first = await f.manager.fetch("/one");
  first.alias = 1;
  const second = await f.manager.fetch("/other");
  f.manager.configuration = { separate: true };
  await f.manager.fetch("/three");
  return [
    first === second,
    second,
    f.calls,
    f.manager.configuration,
    [...f.manager.memCache],
    f.data,
    f.logs,
  ];
});
for (const fallback of ["memory", "disk", "none"])
  await pair(
    async (f) => {
      if (fallback === "memory")
        f.manager.memCache.set("owned-user", {
          data: { expired: true },
          expireAt: f.now - 1,
        });
      if (fallback === "disk")
        f.data.set("cloud_product_config_cache", [
          { userId: "other", data: {} },
          { userId: "owned-user", data: { disk: true }, ts: 0 },
        ]);
      const value = await f.manager.fetch("/offline");
      await f.drain();
      return [
        value,
        f.calls,
        f.sleeps,
        f.logs,
        f.data,
        f.manager.retrying,
        f.manager.configuration,
      ];
    },
    {
      get: async () => {
        throw Object.assign(Error("offline"), { code: "OWNED" });
      },
    },
  );
await pair(async (f) => {
  for (let i = 0; i < 24; i++) await f.manager.updateDiskCache("u" + i, { i });
  await f.manager.updateDiskCache("u10", { updated: true });
  const before = structuredClone(f.data.get("cloud_product_config_cache"));
  await f.manager.readDiskCache("u5");
  f.manager.updateMemCache("u5", { value: 1 });
  f.manager.reset("u5");
  return [before, f.data, [...f.manager.memCache], f.manager.configuration];
});
await pair(
  async (f) => {
    const first = f.manager.fetchWithRetry("/one", "u"),
      second = f.manager.fetchWithRetry("/two", "v");
    await f.drain();
    await Promise.all([first, second]);
    return [f.logs, f.calls, f.sleeps];
  },
  { get: async () => ({ data: { data: { ok: true } } }) },
);
await pair(
  async (f) => {
    const first = f.manager.fetchWithRetry("/one", "u");
    await f.nextTimer();
    f.manager.reset();
    const second = f.manager.fetchWithRetry("/two", "v");
    await f.drain();
    await Promise.all([first, second]);
    return [
      f.calls,
      f.sleeps,
      f.logs,
      [...f.manager.memCache],
      f.manager.retrying,
    ];
  },
  {
    get: async () => {
      throw Object.assign(Error("owned"), {
        isAxiosError: true,
        response: {
          status: 503,
          config: { headers: { "X-Request-ID": "owned-id" } },
        },
      });
    },
  },
);
await pair(
  async (f) => {
    f.data.set("cloud_product_config_cache", {});
    let cache, retry;
    try {
      await f.manager.readDiskCache("u");
    } catch (e) {
      cache = (e as Error).name;
    }
    const job = f.manager.fetchWithRetry("/primitive", "u");
    const caught = job.catch((e: any) => {
      retry = e.name;
    });
    await f.drain();
    await caught;
    const cyclic: any = {};
    cyclic.self = cyclic;
    return [
      cache,
      retry,
      f.manager.safeStringify(cyclic),
      f.manager.safeStringify(undefined),
      f.manager.briefError("x".repeat(600)),
      f.manager.retrying,
    ];
  },
  {
    get: async () => {
      throw "owned primitive";
    },
  },
);
console.log(
  JSON.stringify({
    completeClassMembers: members,
    independentConstants: constants,
    fixtureComparisons: comparisons,
    installedBootstrapExecuted: false,
  }),
);

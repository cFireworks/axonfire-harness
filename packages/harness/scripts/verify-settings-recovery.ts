import assert from "node:assert/strict";
import { readFile, mkdtemp, rm } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { parse } from "acorn";
import { nodesOf } from "./helpers/captured-product-sources.js";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import {
  SETTINGS_CLASSES,
  SETTINGS_FUNCTIONS,
  SETTINGS_FILES,
  SETTINGS_FACTORY_IDS,
  emittedSettings,
  loadCapturedSettings,
} from "./helpers/captured-settings.js";
import { settingsFixture } from "./helpers/settings-fixtures.js";
import {
  SETTINGS_FACTORIES_SHA256,
  createCapturedSettingsConstants,
} from "../src/vendor/captured-settings-constants.js";
const source = await readFile(getCapturedBundlePath(), "utf8"),
  captured = loadCapturedSettings(source);
function ast(n: any): any {
  return n && typeof n === "object"
    ? Array.isArray(n)
      ? n.map(ast)
      : Object.fromEntries(
          Object.entries(n)
            .filter(([k]) => !["start", "end", "raw"].includes(k))
            .map(([k, v]) => [k, ast(v)]),
        )
    : n;
}
const ports = SETTINGS_FILES.flatMap((file) =>
  nodesOf(
    parse(emittedSettings(file), {
      ecmaVersion: "latest",
      sourceType: "module",
    }),
  ),
);
let members = 0;
for (const [name, start, end] of SETTINGS_CLASSES) {
  const raw: any = (
    parse("(" + source.slice(start, end) + ")", { ecmaVersion: "latest" })
      .body[0] as any
  ).expression;
  assert.deepEqual(
    ast(
      ports.find((n) => n.type === "ClassDeclaration" && n.id?.name === name)
        .body,
    ),
    ast(raw.body),
    name,
  );
  members += raw.body.body.length;
}
for (const [name, start, end] of SETTINGS_FUNCTIONS) {
  const raw: any = parse(source.slice(start, end), { ecmaVersion: "latest" })
    .body[0];
  assert.deepEqual(
    ast(
      ports.find(
        (n) => n.type === "FunctionDeclaration" && n.id?.name === name,
      ),
    ),
    ast(raw),
    name,
  );
  members++;
}
const pathRaw: any = (
  parse("class P{" + source.slice(13328279, 13328565) + "}", {
    ecmaVersion: "latest",
  }).body[0] as any
).body.body[0];
assert.deepEqual(
  ast(
    ports.find(
      (n) =>
        n.type === "MethodDefinition" &&
        n.static &&
        n.key?.name === "getSettingsFilePath",
    ),
  ),
  ast(pathRaw),
);
members++;
const originals = nodesOf(parse(source, { ecmaVersion: "latest" }));
const payload =
  "{" +
  SETTINGS_FACTORY_IDS.map((id) => {
    const n = originals.find(
      (n) => n.type === "Property" && n.key?.value === id,
    );
    assert.ok(n);
    return source.slice(n.start, n.end);
  }).join(",") +
  "}";
assert.equal(
  createHash("sha256").update(payload).digest("hex"),
  SETTINGS_FACTORIES_SHA256,
);
// Execute only pure original factories, never the application entry point.
const modules = Function("return (" + payload + ")")(),
  cache = new Map();
function load(id: number): any {
  id = ({ 47005: 92921, 16891: 30063, 2639: 5907 } as any)[id] ?? id;
  if (cache.has(id)) return cache.get(id);
  const out = {};
  cache.set(id, out);
  const require = Object.assign(load, {
    r: () => {},
    d: (obj: any, values: any) => {
      for (const k of Object.keys(values))
        Object.defineProperty(obj, k, { enumerable: true, get: values[k] });
    },
  });
  assert.ok(modules[id]);
  modules[id]({}, out, require);
  return out;
}
const constants: any = createCapturedSettingsConstants();
for (const key of Object.keys(load(24618))) {
  const raw = load(24618)[key];
  assert.deepEqual(
    typeof raw === "symbol" ? constants[key].description : constants[key],
    typeof raw === "symbol" ? raw.description : raw,
    key,
  );
}
assert.equal(constants.SETTINGS_MIDDLEWARE_PRIORITY, 1950);
// Lexical glue values have independent source checks rather than only shared DI.
assert.match(source, /eA\.NATIVE="native"/);
assert.match(source, /SETTINGS_LOAD="settings_load"/);
assert.match(source.slice(9822846, 9824149), /\^\[a-zA-Z0-9_\.\\-@\/\]\+\$/);
const efforts = ports.find(
  (n) => n.type === "VariableDeclarator" && n.id?.name === "ew",
);
const rawEfforts = originals.find(
  (n) =>
    n.type === "VariableDeclarator" &&
    n.id?.name === "ew" &&
    n.start > 11188000 &&
    n.end < 11193064,
);
assert.ok(rawEfforts);
assert.deepEqual(ast(efforts.init), ast(rawEfforts.init));
const root = await mkdtemp(join(tmpdir(), "settings-diff-"));
async function scenarios(home: string, factories: any) {
  const f = settingsFixture(home, factories),
    out: any[] = [];
  const take = (value: any) => out.push(structuredClone(value));
  try {
    for (const input of [
      "none",
      "NONE",
      "",
      "  ",
      ",,",
      "user",
      "project",
      "local",
      "LOCAL,user,local project",
      "none,user",
      "bad",
      "bad,local",
    ])
      take(f.sources.parseSourcesString(input));
    for (const input of ["none", "bad", "local,user", undefined]) {
      f.setOptions({ settingSources: input });
      take(f.sources.buildSettingScopes());
    }
    for (const input of [
      "minimal",
      "low",
      "medium",
      "high",
      "xhigh",
      "max",
      "MAX",
      "",
      null,
      1,
    ])
      take(f.cliClasses.normalizeReasoningEffort(input));
    for (const input of ["{}", ' {"x":1,} ', "[]", "{bad}", '{"n":{"a":1}}']) {
      take(f.cli.looksLikeJson(input));
      take(f.cli.parseJsonString(input));
    }
    for (const effort of ["max", "wrong", undefined]) {
      f.setOptions({
        settings: '{/*comment*/"model":"json","reasoningEffort":"low"}',
        model: "cli",
        effort,
      });
      take(await f.cli.buildCliSettings());
    }
    await f.put(
      "user",
      '{/*kept*/"x":1,"model":"u","permissions":{"allow":["Read"]},"list":[1,2]}',
    );
    await f.put(
      "project",
      '{"model":"p","permissions":{"allow":["Write","Read"]},"list":[2,3]}',
    );
    await f.put("project-local", '{"model":"l"}');
    take(await f.manager.list());
    take(await f.manager.list("user"));
    take(await f.manager.list("cli"));
    take(await f.manager.update("x", (v: any) => v));
    take(await f.manager.update("x", async (v: any) => v + 1));
    take(await f.read("user"));
    await f.manager.add("list", [3, 3, null, 4]);
    take(await f.manager.get("list", "user"));
    await f.manager.remove("list", [1]);
    take(await f.manager.get("list", "user"));
    take(await f.manager.update("x", () => 99, "cli"));
    take(f.manager.mapScopeToConfigSource("cli"));
    for (const scope of ["user", "project", "project-local"]) {
      take(f.manager.getSettingsLockName(scope));
      take(f.manager.mapScopeToConfigSource(scope));
    }
    take(f.hooks);
    take(f.locks);
    await f.put("project", "{broken");
    f.manager.clearCache("project");
    take(await f.manager.list("project"));
    take([...f.manager.corruptedScopes]);
    take(await f.manager.update("x", () => 3, "project"));
    take(await f.read("project"));
    await f.put("project", '{"x":5}');
    f.manager.clearCache("project");
    take(await f.manager.update("x", () => 6, "project"));
    take(await f.manager.get("x", "project"));
    take(await f.manager.update("x", () => 6, "project"));
    for (const value of ["null", "1", "true", "[]", "[1,2]"]) {
      await f.put("project", value);
      f.manager.clearCache("project");
      take(await f.manager.list("project"));
      take(f.manager.corruptedScopes.has("project"));
    }
    f.manager.fileLockService = {
      acquireFileLock: async () => {
        throw Error("owned lock failure");
      },
    };
    await f.manager.set("x", 4);
    take(await f.manager.get("x", "user"));
    await f.controller.get({ key: "autoCompactEnabled" });
    await f.controller.list();
    take(f.printed);
    for (const name of [
      "safe",
      "@scope/name",
      "../allowed.by.regex",
      "bad space",
      "bad;name",
      "",
    ]) {
      f.product.builtInMarketPluginsMerge = [
        {
          name,
          marketplaceName: "m",
          canRemove: false,
          canSwitchoff: 0,
          canEdit: false,
        },
      ];
      f.policy.loadPolicies();
      take(f.policy.getMergedPlugins());
      take([
        f.policy.isPluginCannotRemove(name + "@m"),
        f.policy.isPluginCannotSwitchoff(name + "@m"),
        f.policy.isPluginCannotEdit(name + "@m"),
        f.policy.isPluginAutoInstall(name + "@m"),
        f.policy.isMarketplaceBlockedByPolicy("m"),
      ]);
    }
    const old = new Map([
      ["p@m", { name: "p", marketplaceName: "m", version: "1" }],
    ]);
    for (const patch of [
      { version: "2" },
      { scope: "user" },
      { autoEnable: true },
      { canRemove: false },
      { canSwitchoff: false },
      { canEdit: false },
    ])
      take(
        f.policy.hasPluginsChanged(
          old,
          new Map([["p@m", { name: "p", marketplaceName: "m", ...patch }]]),
        ),
      );
    return out.map((value) =>
      JSON.parse(
        JSON.stringify({ value }, (_key, v) =>
          typeof v === "string" ? v.replaceAll(home, "<root>") : v,
        ),
      ),
    );
  } finally {
    f.dispose();
  }
}
try {
  // Same absolute path: the source sanitizes and truncates lock names to 50
  // characters, so two different fixture roots are not equivalent inputs.
  const expected = await scenarios(join(root, "fixture"), captured);
  await rm(join(root, "fixture"), { recursive: true, force: true });
  const actual = await scenarios(join(root, "fixture"), {});
  assert.equal(actual.length, expected.length);
  for (let i = 0; i < actual.length; i++)
    assert.deepEqual(actual[i], expected[i], "scenario " + i);
  console.log(
    `Settings recovery: ${members} complete member/function ASTs, ${SETTINGS_FACTORY_IDS.length} pure factories, ${actual.length} original/port comparisons passed`,
  );
} finally {
  await rm(root, { recursive: true, force: true });
}

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parse } from "acorn";
import ts from "typescript";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import {
  MCP_NATIVE_CLASSES,
  loadCapturedMcpRuntime,
  loadCapturedMcpResults,
} from "./helpers/captured-mcp-native.js";
import { mcpNativeFixture } from "./helpers/mcp-native-fixtures.js";
import { createNativeMcpResultProcessor } from "../src/mcp/native-mcp-results.js";
const source = await readFile(getCapturedBundlePath(), "utf8"),
  original = loadCapturedMcpRuntime(source),
  nodes: any[] = [];
function walk(n: any) {
  if (!n || typeof n !== "object") return;
  if (
    ["ClassDeclaration", "ClassExpression", "FunctionDeclaration"].includes(
      n.type,
    )
  )
    nodes.push(n);
  for (const [k, v] of Object.entries(n))
    if (!["start", "end"].includes(k)) {
      if (Array.isArray(v)) v.forEach(walk);
      else if (v && typeof v === "object") walk(v);
    }
}
for (const file of [
  "native-mcp-runtime",
  "native-mcp-utils",
  "native-mcp-results",
  "native-mcp-ui",
  "native-mcp-subagent-tools",
]) {
  const text = ts.transpileModule(
    await readFile(
      new URL("../src/mcp/" + file + ".ts", import.meta.url),
      "utf8",
    ),
    {
      compilerOptions: {
        target: ts.ScriptTarget.ES2023,
        module: ts.ModuleKind.ESNext,
      },
    },
  ).outputText;
  walk(parse(text, { ecmaVersion: "latest", sourceType: "module" }));
}
const ast = (v: any): any =>
  v && typeof v === "object"
    ? Array.isArray(v)
      ? v.map(ast)
      : Object.fromEntries(
          Object.entries(v)
            .filter(([k]) => !["start", "end", "raw"].includes(k))
            .map(([k, x]) => [k, ast(x)]),
        )
    : v;
let methods = 0;
for (const [name, start, end] of [
  ...MCP_NATIVE_CLASSES,
  ["McpUtils", 13306418, 13309176] as const,
  ["McpSubagentToolManager", 9288945, 9289339] as const,
]) {
  const expected: any = (
      parse("(" + source.slice(start, end) + ")", { ecmaVersion: "latest" })
        .body[0] as any
    ).expression,
    actual = nodes.find((n) => n.id?.name === name);
  assert.deepEqual(
    ast(actual.body),
    ast(expected.body),
    "complete class " + name,
  );
  methods += expected.body.body.length;
}
const ranges = [
  [9152489, 9153050],
  [9153118, 9157667],
  [9157830, 9158717],
  [9158735, 9163445],
  [9178530, 9178669],
  [9178680, 9179069],
  [9186396, 9186831],
  [9306064, 9307806],
];
for (const [start, end] of ranges) {
  const expected: any = parse(source.slice(start, end), {
    ecmaVersion: "latest",
  });
  for (const fn of expected.body)
    if (fn.type === "FunctionDeclaration") {
      assert.deepEqual(
        ast(nodes.find((n) => n.id?.name === fn.id.name)),
        ast(fn),
        "complete function " + fn.id.name,
      );
      methods++;
    }
}
const vendor = await readFile(
  new URL("../src/vendor/captured-jsonc.ts", import.meta.url),
  "utf8",
);
const jsoncStart = source.lastIndexOf("52537(", 13283623),
  jsoncEnd = 13305811;
assert.ok(
  vendor.includes(source.slice(jsoncStart, jsoncEnd)),
  "complete JSONC module factory original text",
);
let comparisons = 0;
const normalize = (value: any) => JSON.parse(JSON.stringify(value));
for (const transparent of [false, true])
  for (const alias of [false, true])
    for (const pre of ["allow", "deny", "throw"])
      for (const postError of [false, true])
        for (const rewrite of [false, true])
          for (const callError of [false, true])
            for (const sideband of [false, true])
              for (const desktop of [false, true]) {
                const spec = {
                  transparent,
                  alias,
                  preDeny: pre === "deny",
                  preError: pre === "throw",
                  postError,
                  rewrite,
                  callError,
                  sideband,
                  desktop,
                  hint: true,
                  ui: true,
                };
                assert.deepEqual(
                  normalize(await mcpNativeFixture(spec).execute()),
                  normalize(await mcpNativeFixture(spec, original).execute()),
                  JSON.stringify(spec),
                );
                comparisons++;
              }
for (const builtin of [false, true])
  for (const transparent of [false, true])
    for (const payment of [false, true])
      for (const session of [false, true]) {
        const spec = { builtin, transparent, payment, session };
        assert.deepEqual(
          normalize(await mcpNativeFixture(spec).execute()),
          normalize(await mcpNativeFixture(spec, original).execute()),
          JSON.stringify(spec),
        );
        comparisons++;
      }
for (const deny of [false, true])
  for (const search of [false, true])
    for (const sdk of [false, true])
      for (const deferred of [false, true])
        for (const allowed of [false, true])
          for (const transparent of [false, true]) {
            const run = async (factory?: any) => {
              const f = mcpNativeFixture({}, factory),
                events: any[] = [];
              Object.assign(f.runtime.permissionUtils, {
                matchMcpPermissionRules: (rules: any, names: any) => {
                  events.push(["match", rules, names]);
                  return rules;
                },
                checkPermissionRules: () => deny,
              });
              Object.assign(f.runtime.dependencies, {
                settings: {
                  async get() {
                    return { deny: deny ? ["mcp__owned__echo"] : [] };
                  },
                },
                overlayCache: { get: () => undefined },
                deferConfig: {
                  async isToolDeferLoadingWithOverlay(
                    overlay: any,
                    config: any,
                    ...names: any[]
                  ) {
                    events.push([
                      "defer",
                      overlay.isEmpty(),
                      config.type,
                      names,
                    ]);
                    return deferred;
                  },
                },
                subagentTools: {
                  isToolAllowed: (...args: any[]) => {
                    events.push(["subagent", ...args]);
                    return allowed;
                  },
                },
              });
              const fn = f.manager.createToolFilter("owned", {
                type: sdk ? "sdk" : "http",
                transparent_proxy: transparent,
              });
              return {
                result: await fn(
                  {
                    agent: {
                      name: "owned",
                      tools: search ? [{ name: "ToolSearch" }] : [],
                    },
                    runContext: { context: f.session },
                  },
                  { name: "mcp__owned__echo" },
                ),
                events,
              };
            };
            assert.deepEqual(
              normalize(await run()),
              normalize(await run(original)),
            );
            comparisons++;
          }
const originalResults = loadCapturedMcpResults(source),
  contentCases = [
    [{ type: "text", text: "x".repeat(90) }],
    [
      { type: "text", text: "😀".repeat(45) },
      { type: "image", data: "owned", mimeType: "image/png" },
    ],
    [
      { type: "audio", data: "a".repeat(70), mimeType: "audio/wav" },
      { type: "resource_link", uri: "owned://" + "x".repeat(40) },
    ],
    [
      {
        type: "resource",
        resource: { uri: "owned://fixture", text: "r".repeat(100) },
      },
      { type: "unknown", owned: 1 },
    ],
  ];
for (const content of contentCases)
  for (const limit of [0, -1, 1, 5, 10, NaN])
    for (const disabled of [false, true])
      for (const session of [undefined, "owned-session", "agent-child"])
        for (const fsFail of [false, true]) {
          const run = async (factory: any) => {
            const events: any[] = [],
              runtime = {
                env: {
                  CODEBUDDY_DISABLE_MCP_LARGE_OUTPUT_FILES: disabled
                    ? "1"
                    : "0",
                },
                getHomeProjectDir: () => "/owned/project",
                now: () => 7,
                crypto: { randomBytes: () => ({ toString: () => "001122" }) },
                fs: {
                  async mkdir(...args: any[]) {
                    events.push(["mkdir", ...args]);
                  },
                  async writeFile(...args: any[]) {
                    events.push(["write", ...args]);
                    if (fsFail) throw Error("owned persistence failure");
                  },
                },
              };
            return {
              out: await factory(runtime).processMcpResult(
                content,
                limit,
                "owned-server",
                "owned-tool",
                session,
                "owned-parent",
              ),
              events,
            };
          };
          assert.deepEqual(
            normalize(await run(createNativeMcpResultProcessor)),
            normalize(await run(originalResults)),
          );
          comparisons++;
        }
console.log(
  JSON.stringify(
    {
      passed: true,
      completeMethodAndFunctionAsts: methods,
      capturedJsoncFactories: 1,
      comparisons,
      scope:
        "complete MCP proxy/transport/server classes, native utilities and results; fake MCP calls, no network",
    },
    null,
    2,
  ),
);

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parse } from "acorn";
import ts from "typescript";
import { getCapturedBundlePath } from "./helpers/captured-bundle-path.js";
import {
  MCP_MANAGER_CLASSES,
  MCP_MANAGER_FUNCTIONS,
  MCP_MANAGER_PATH_METHODS,
  capturedMcpManagerConstants,
  loadCapturedMcpManager,
} from "./helpers/captured-mcp-manager.js";
import { mcpManagerFixture } from "./helpers/mcp-manager-fixtures.js";
import { createNativeMcpManagerRuntime } from "../src/mcp/native-mcp-manager-runtime.js";
import * as constants from "../src/mcp/native-mcp-manager-constants.js";
const source = await readFile(getCapturedBundlePath(), "utf8"),
  original = loadCapturedMcpManager(source),
  text = ts.transpileModule(
    await readFile(
      new URL("../src/mcp/native-mcp-manager-runtime.ts", import.meta.url),
      "utf8",
    ),
    {
      compilerOptions: {
        target: ts.ScriptTarget.ES2023,
        module: ts.ModuleKind.ESNext,
      },
    },
  ).outputText;
const nodes: any[] = [];
function walk(node: any) {
  if (!node || typeof node !== "object") return;
  if (
    ["ClassDeclaration", "ClassExpression", "FunctionDeclaration"].includes(
      node.type,
    )
  )
    nodes.push(node);
  for (const [key, value] of Object.entries(node))
    if (!["start", "end"].includes(key)) {
      if (Array.isArray(value)) value.forEach(walk);
      else walk(value);
    }
}
function ast(node: any): any {
  return node && typeof node === "object"
    ? Array.isArray(node)
      ? node.map(ast)
      : Object.fromEntries(
          Object.entries(node)
            .filter(([key]) => !["start", "end", "raw"].includes(key))
            .map(([key, value]) => [key, ast(value)]),
        )
    : node;
}
walk(parse(text, { ecmaVersion: "latest", sourceType: "module" }));
let completeAsts = 0,
  comparisons = 0;
for (const [name, start, end] of MCP_MANAGER_CLASSES) {
  const expected: any = (
      parse("(" + source.slice(start, end) + ")", { ecmaVersion: "latest" })
        .body[0] as any
    ).expression,
    actual = nodes.find((n) => n.id?.name === name);
  assert.deepEqual(ast(actual.body), ast(expected.body), name);
  completeAsts += expected.body.body.length;
}
for (const [name, start, end] of MCP_MANAGER_FUNCTIONS) {
  const expected: any = parse(source.slice(start, end), {
    ecmaVersion: "latest",
  }).body[0];
  assert.deepEqual(
    ast(nodes.find((n) => n.id?.name === name)),
    ast(expected),
    name,
  );
  completeAsts++;
}
for (const [name, start, end] of MCP_MANAGER_PATH_METHODS) {
  const expected: any = (
      parse("class PathUtils{" + source.slice(start, end) + "}", {
        ecmaVersion: "latest",
      }).body[0] as any
    ).body.body[0],
    actual = nodes
      .find((n) => n.id?.name === "PathUtils")
      .body.body.find((n: any) => n.key.name === name);
  assert.deepEqual(ast(actual), ast(expected), name);
  completeAsts++;
}
const nativeConstants = capturedMcpManagerConstants(source);
for (const key of Object.keys(constants))
  assert.deepEqual(
    JSON.parse(JSON.stringify((constants as any)[key])),
    JSON.parse(JSON.stringify(nativeConstants[key])),
    key,
  );

for (const scope of constants.MERGE_SCOPE_PRIORITY)
  for (const allowed of [false, true])
    for (const deferred of [false, true])
      for (const connectError of [
        undefined,
        "Unauthorized",
        "Transport already started",
      ])
        for (const disabled of [false, true]) {
          const options = {
            scopes: {
              user: {
                owned: {
                  type: "http",
                  url: "http://user.invalid",
                  defer_loading: deferred,
                },
              },
              [scope]: {
                owned: {
                  type: "http",
                  url: "http://owned.invalid",
                  defer_loading: deferred,
                },
              },
            },
            settings: { enableAllProjectMcpServers: allowed },
            disabled: disabled ? ["owned"] : [],
            connectError,
          };
          async function run(factory: any) {
            const f = mcpManagerFixture(options, factory);
            await f.manager.list();
            await f.flush();
            return f.snapshot();
          }
          assert.deepEqual(
            await run(createNativeMcpManagerRuntime),
            await run(original),
            JSON.stringify(options),
          );
          comparisons++;
        }
for (const enableAllProjectMcpServers of [false, true])
  for (const enabled of [false, true])
    for (const disabled of [false, true])
      for (const decision of ["none", "allow", "deny", "all"]) {
        async function run(factory: any) {
          const f = mcpManagerFixture(
            {
              scopes: {
                project: {
                  owned: {
                    command: "owned-command",
                    args: ["${MISSING:-default}"],
                    defer_loading: true,
                  },
                },
              },
              settings: {
                enableAllProjectMcpServers,
                enabledMcpjsonServers: enabled ? ["owned"] : [],
                disabledMcpjsonServers: disabled ? ["owned"] : [],
              },
            },
            factory,
          );
          await f.manager.list();
          await f.flush();
          if (decision === "allow") await f.manager.allow(["owned"]);
          if (decision === "deny") await f.manager.deny(["owned"]);
          if (decision === "all") await f.manager.allowAllForever();
          await f.flush();
          return f.snapshot();
        }
        assert.deepEqual(
          await run(createNativeMcpManagerRuntime),
          await run(original),
        );
        comparisons++;
      }
for (const transparent of [false, true])
  for (const bare of [false, true])
    for (const changed of [false, true])
      for (const failed of [false, true]) {
        async function run(factory: any) {
          const f = mcpManagerFixture(
            {
              scopes: {
                dynamic: {
                  owned: {
                    type: "http",
                    url: "http://owned.invalid",
                    defer_loading: true,
                    transparent_proxy: transparent,
                    tools: { echo: { bare_name: bare } },
                  },
                },
              },
              connectError: failed ? "owned unavailable" : undefined,
            },
            factory,
          );
          await f.manager.list();
          await f.flush();
          if (changed) {
            await f.manager.add(
              "owned",
              {
                type: "http",
                url: "http://changed.invalid",
                defer_loading: true,
              },
              "dynamic",
            );
            await f.flush();
          }
          f.toolsChanged.next("owned");
          await f.flush();
          await f.manager.toggleServer("owned", false);
          await f.flush();
          await f.manager.toggleServer("owned", true);
          await f.flush();
          await f.manager.remove("owned");
          await f.flush();
          return f.snapshot();
        }
        assert.deepEqual(
          await run(createNativeMcpManagerRuntime),
          await run(original),
        );
        comparisons++;
      }
for (const input of [
  "${KNOWN}",
  "${MISSING}",
  "${MISSING:-fallback}",
  "${KNOWN:-fallback}",
  "${lower}",
  "${MISSING} ${MISSING}",
  "prefix ${KNOWN} suffix",
]) {
  const f = mcpManagerFixture({ env: { KNOWN: "owned" } }),
    g = mcpManagerFixture({ env: { KNOWN: "owned" } }, original);
  assert.deepEqual(
    JSON.parse(JSON.stringify(f.classes.expandEnvVariables(input))),
    JSON.parse(JSON.stringify(g.classes.expandEnvVariables(input))),
  );
  comparisons++;
}
for (const scope of constants.MERGE_SCOPE_PRIORITY)
  for (const strict of [false, true])
    for (const loadFiles of [false, true]) {
      async function run(factory: any) {
        const f = mcpManagerFixture(
          {
            scopes: {
              [scope]: { owned: { type: "http", url: "http://owned.invalid" } },
            },
          },
          factory,
        );
        f.config.setStrictDynamic(strict);
        f.config.cliSettingSourcesProvider.getSettingScopes = async () =>
          loadFiles ? ["user", "project", "project-local"] : [];
        return JSON.parse(
          JSON.stringify({
            list: await f.config.list(scope),
            byName: await f.config.getByName("owned"),
          }),
        );
      }
      assert.deepEqual(
        await run(createNativeMcpManagerRuntime),
        await run(original),
      );
      comparisons++;
    }
for (const type of ["stdio", "http", "sse", "remote"])
  for (const input of [
    "${KNOWN}",
    "${MISSING}",
    "${MISSING:-fallback}",
    "${KNOWN:-fallback}",
    "${lower}",
    "${MISSING} ${MISSING}",
    "prefix ${KNOWN} suffix",
  ]) {
    function run(factory: any) {
      const f = mcpManagerFixture({ env: { KNOWN: "owned" } }, factory),
        expander = new f.classes.McpConfigEnvExpandService();
      return JSON.parse(
        JSON.stringify(
          expander.expandConfig(
            "owned",
            type === "stdio"
              ? {
                  type,
                  command: input,
                  args: [input],
                  env: { OWNED: input },
                  cwd: input,
                }
              : { type, url: input, headers: { owned: input } },
            "project",
          ),
        ),
      );
    }
    assert.deepEqual(run(createNativeMcpManagerRuntime), run(original));
    comparisons++;
  }
console.log(
  JSON.stringify(
    {
      passed: true,
      completeMemberAndFunctionAsts: completeAsts,
      comparisons,
      scope:
        "complete native MCP manager/configuration/projection services; isolated VM and fake I/O",
    },
    null,
    2,
  ),
);

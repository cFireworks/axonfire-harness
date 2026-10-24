import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { parse } from "acorn";
import { emittedPrompt } from "./captured-resource-prompts.js";
import { cleanAst } from "./captured-acp-protocol.js";
import * as native from "../../src/sandbox/native-sandbox-shell.js";
export function loadCapturedSandboxShell(cli: string) {
  assert.equal(
    createHash("sha256").update(cli).digest("hex"),
    native.SANDBOX_SHELL_SHA256,
  );
  let output = emittedPrompt("sandbox/native-sandbox-shell");
  const tree: any = parse(output, {
    ecmaVersion: "latest",
    sourceType: "module",
  });
  const body = tree.body.find(
    (n: any) => n.declaration?.id?.name === "createNativeSandboxShell",
  ).declaration.body.body;
  const edits: any[] = tree.body
    .filter((n: any) => n.type === "ExportNamedDeclaration")
    .map((n: any) => ({ start: n.start, end: n.declaration.start, text: "" }));
  // Inspect original decorators without executing product registration.
  const registration: any = (
    parse(cli.slice(8690075, 8692403), {
      ecmaVersion: "latest",
    }).body[0] as any
  ).expression.expressions;
  const properties = registration.filter(
    (n: any) => n.type === "CallExpression",
  );
  assert.deepEqual(
    properties.map((n: any) => {
      const ds = n.arguments[0].elements;
      const injection = ds.find(
        (d: any) =>
          d.callee?.expressions?.at(-1)?.property?.name === "Autowired",
      );
      const optional = ds.some(
        (d: any) =>
          d.callee?.expressions?.at(-1)?.property?.name === "Optional",
      );
      return [
        n.arguments[2].value,
        injection?.arguments[0].object.name,
        injection?.arguments[0].property.name,
        optional,
      ];
    }),
    [
      ["lifecycle", "au", "SandboxCLILifecycle", false],
      ["logger", "r6", "Logger", false],
      ["workspace", "o3", "Workspace", false],
      ["sessionManager", "nu", "SessionManager", false],
      ["settingsManager", "nP", "SettingsManager", false],
      ["bashSandboxManager", "lY", "BashSandboxManager", false],
      ["localShellService", "lq", "LocalShellService", false],
      ["telemetryReporter", "aC", "SandboxTelemetryReporter", true],
      ["sandboxRuleSyncService", "lG", "SandboxRuleSyncService", true],
      ["turnConfig", "ap", "SandboxTurnConfig", true],
      ["init", undefined, undefined, false],
    ],
  );
  assert.equal(
    properties.at(-1).arguments[0].elements[0].callee.expressions.at(-1)
      .property.name,
    "PostConstruct",
  );
  const key = (n: any) =>
    n.type === "VariableDeclaration" ? n.declarations[0].id.name : n.id?.name;
  for (const [name, start, end] of native.SANDBOX_SHELL_BLOCKS) {
    const raw: any = parse(cli.slice(start, end), { ecmaVersion: "latest" })
        .body[0],
      port = body.find((n: any) => key(n) === name);
    assert.deepEqual(
      cleanAst(port),
      cleanAst(raw),
      "complete shell declaration " + name,
    );
    edits.push({
      start: port.start,
      end: port.end,
      text: cli.slice(start, end),
    });
  }
  const factories = body.find((n: any) => key(n) === "factories")
    .declarations[0].init;
  for (const [id, start, end] of native.SANDBOX_SHELL_MODULES) {
    const raw: any = (
        parse("({" + cli.slice(start, end) + "})", { ecmaVersion: "latest" })
          .body[0] as any
      ).expression.properties[0],
      port = factories.properties.find((n: any) => n.key.value === id);
    assert.deepEqual(
      cleanAst(port),
      cleanAst(raw),
      "complete shell utility factory " + id,
    );
    edits.push({
      start: port.start,
      end: port.end,
      text: cli.slice(start, end),
    });
  }
  const [start, end] = native.SANDBOX_SHELL_STATICS,
    raw: any = parse(cli.slice(start, end) + ";", { ecmaVersion: "latest" })
      .body[0],
    port = body.find(
      (n: any) =>
        n.type === "ExpressionStatement" &&
        n.expression?.left?.object?.name === "l0",
    );
  assert.deepEqual(
    cleanAst(port),
    cleanAst(raw),
    "original safe delete command set",
  );
  edits.push({
    start: port.start,
    end: port.end,
    text: cli.slice(start, end) + ";",
  });
  for (const edit of edits.sort((a, b) => b.start - a.start))
    output = output.slice(0, edit.start) + edit.text + output.slice(edit.end);
  return Function(
    output + "\nreturn createNativeSandboxShell;",
  )() as typeof native.createNativeSandboxShell;
}

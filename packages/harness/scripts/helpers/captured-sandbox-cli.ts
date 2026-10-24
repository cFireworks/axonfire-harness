import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { parse } from "acorn";
import { emittedPrompt } from "./captured-resource-prompts.js";
import { nodesOf } from "./captured-product-sources.js";
import { cleanAst } from "./captured-acp-protocol.js";
import * as native from "../../src/sandbox/native-sandbox-cli.js";
export function loadCapturedSandboxCLI(cli: string) {
  assert.equal(
    createHash("sha256").update(cli).digest("hex"),
    native.SANDBOX_CLI_SHA256,
  );
  let output = emittedPrompt("sandbox/native-sandbox-cli");
  const tree: any = parse(output, {
    ecmaVersion: "latest",
    sourceType: "module",
  });
  const factory = tree.body.find(
    (n: any) => n.declaration?.id?.name === "createNativeSandboxCLI",
  ).declaration;
  const edits: any[] = tree.body
    .filter((n: any) => n.type === "ExportNamedDeclaration")
    .map((n: any) => ({ start: n.start, end: n.declaration.start, text: "" }));
  for (const [name, start, end] of native.SANDBOX_CLI_BLOCKS) {
    const original: any = parse(cli.slice(start, end), {
      ecmaVersion: "latest",
    });
    const key = (n: any) =>
      n.type === "VariableDeclaration" ? n.declarations[0].id.name : n.id?.name;
    const first = factory.body.body.findIndex(
      (n: any) => key(n) === key(original.body[0]),
    );
    assert.ok(first >= 0, name);
    const ports = factory.body.body.slice(first, first + original.body.length);
    assert.deepEqual(
      ports.map(cleanAst),
      original.body.map(cleanAst),
      "complete original declaration group " + name,
    );
    edits.push({
      start: ports[0].start,
      end: ports.at(-1).end,
      text: cli.slice(start, end),
    });
  }
  const [start, end] = native.SANDBOX_CLI_STATICS;
  const raw: any = parse(cli.slice(start, end) + ";", { ecmaVersion: "latest" })
    .body[0];
  const statics = factory.body.body.find(
    (n: any) =>
      n.type === "ExpressionStatement" &&
      n.expression.type === "SequenceExpression" &&
      n.expression.expressions[0]?.left?.object?.name === "lM",
  );
  assert.deepEqual(
    cleanAst(statics),
    cleanAst(raw),
    "original lifecycle static timeouts",
  );
  edits.push({
    start: statics.start,
    end: statics.end,
    text: cli.slice(start, end) + ";",
  });
  for (const [name, start, end, members] of native.SANDBOX_CLI_CLASSES) {
    const cls: any = (
      parse("(" + cli.slice(start, end) + ")", { ecmaVersion: "latest" })
        .body[0] as any
    ).expression;
    assert.equal(cls.body.body.length, members, name);
  }
  for (const edit of edits.sort((a, b) => b.start - a.start))
    output = output.slice(0, edit.start) + edit.text + output.slice(edit.end);
  return Function(
    output + "\nreturn createNativeSandboxCLI;",
  )() as typeof native.createNativeSandboxCLI;
}

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { parse } from "acorn";
import { emittedPrompt } from "./captured-resource-prompts.js";
import { cleanAst } from "./captured-acp-protocol.js";
import * as native from "../../src/sandbox/native-bash-sandbox-manager.js";
export function loadCapturedBashSandboxManager(cli: string) {
  assert.equal(
    createHash("sha256").update(cli).digest("hex"),
    native.BASH_SANDBOX_SHA256,
  );
  let output = emittedPrompt("sandbox/native-bash-sandbox-manager");
  const tree: any = parse(output, {
    ecmaVersion: "latest",
    sourceType: "module",
  });
  const body = tree.body.find(
    (n: any) => n.declaration?.id?.name === "createNativeBashSandboxManager",
  ).declaration.body.body;
  const edits: any[] = tree.body
    .filter((n: any) => n.type === "ExportNamedDeclaration")
    .map((n: any) => ({ start: n.start, end: n.declaration.start, text: "" }));
  const key = (n: any) =>
    n.type === "VariableDeclaration" ? n.declarations[0].id.name : n.id?.name;
  for (const [name, start, end] of native.BASH_SANDBOX_BLOCKS) {
    const raw: any = parse(cli.slice(start, end), { ecmaVersion: "latest" })
      .body[0];
    const port = body.find((n: any) => key(n) === name);
    assert.deepEqual(
      cleanAst(port),
      cleanAst(raw),
      "original manager declaration " + name,
    );
    if (name === "nU")
      assert.equal(raw.declarations[0].init.right.body.body.length, 18);
    edits.push({
      start: port.start,
      end: port.end,
      text: cli.slice(start, end),
    });
  }
  const factories = body.find((n: any) => key(n) === "factories")
    .declarations[0].init;
  for (const [id, start, end] of native.BASH_SANDBOX_MODULES) {
    const raw: any = (
      parse("({" + cli.slice(start, end) + "})", { ecmaVersion: "latest" })
        .body[0] as any
    ).expression.properties[0];
    const port = factories.properties.find((n: any) => n.key.value === id);
    assert.deepEqual(
      cleanAst(port),
      cleanAst(raw),
      "original manager module " + id,
    );
    edits.push({
      start: port.start,
      end: port.end,
      text: cli.slice(start, end),
    });
  }
  const [start, end] = native.BASH_SANDBOX_STATICS;
  const raw: any = parse(cli.slice(start, end) + ";", { ecmaVersion: "latest" })
    .body[0];
  const port = body.find(
    (n: any) =>
      n.type === "ExpressionStatement" &&
      n.expression?.expressions?.[0]?.left?.object?.name === "nU",
  );
  assert.deepEqual(
    cleanAst(port),
    cleanAst(raw),
    "original command-root static sets",
  );
  edits.push({
    start: port.start,
    end: port.end,
    text: cli.slice(start, end) + ";",
  });
  for (const edit of edits.sort((a, b) => b.start - a.start))
    output = output.slice(0, edit.start) + edit.text + output.slice(edit.end);
  return Function(
    output + "\nreturn createNativeBashSandboxManager;",
  )() as typeof native.createNativeBashSandboxManager;
}

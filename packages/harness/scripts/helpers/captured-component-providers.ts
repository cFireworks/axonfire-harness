import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { parse } from "acorn";
import { emittedPrompt } from "./captured-resource-prompts.js";
import { nodesOf } from "./captured-product-sources.js";
import { cleanAst } from "./captured-acp-protocol.js";
import * as native from "../../src/di/native-component-providers.js";

export function loadCapturedComponentProviders(cli: string) {
  assert.equal(
    createHash("sha256").update(cli).digest("hex"),
    native.COMPONENT_PROVIDER_SHA256,
  );
  let output = emittedPrompt("di/native-component-providers");
  const tree: any = parse(output, {
    ecmaVersion: "latest",
    sourceType: "module",
  });
  const nodes = nodesOf(tree),
    edits: { start: number; end: number; text: string }[] = [];
  for (const node of tree.body)
    if (node.type === "ExportNamedDeclaration")
      edits.push({ start: node.start, end: node.declaration.start, text: "" });
  const factories = nodes.find(
    (n: any) => n.type === "VariableDeclarator" && n.id.name === "factories",
  ).init;
  for (const [id, start, end] of native.COMPONENT_PROVIDER_MODULES) {
    const raw: any = (
      parse("({" + cli.slice(start, end) + "})", { ecmaVersion: "latest" })
        .body[0] as any
    ).expression.properties[0];
    const port = factories.properties.find((n: any) => n.key.value === id);
    assert.deepEqual(
      cleanAst(port),
      cleanAst(raw),
      "complete provider module " + id,
    );
    edits.push({
      start: port.start,
      end: port.end,
      text: cli.slice(start, end),
    });
  }
  for (const [id, name, start, end] of native.COMPONENT_PROVIDER_CLASSES) {
    const raw: any = (
      parse("(" + cli.slice(start, end) + ")", { ecmaVersion: "latest" })
        .body[0] as any
    ).expression;
    const port = nodes.find(
      (n: any) =>
        n.type === "VariableDeclarator" &&
        n.id.name === name &&
        n.init?.type === "ClassExpression",
    ).init;
    assert.deepEqual(
      cleanAst(port),
      cleanAst(raw),
      "complete provider class " + id,
    );
    edits.push({
      start: port.start,
      end: port.end,
      text: cli.slice(start, end),
    });
  }
  for (const edit of edits.sort((a, b) => b.start - a.start))
    output = output.slice(0, edit.start) + edit.text + output.slice(edit.end);
  return Function(
    output + "\nreturn createNativeComponentProviders;",
  )() as typeof native.createNativeComponentProviders;
}

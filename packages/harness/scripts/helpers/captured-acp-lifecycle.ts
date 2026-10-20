import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { parse } from "acorn";
import { nodesOf } from "./captured-product-sources.js";
import { emittedPrompt } from "./captured-resource-prompts.js";
import { cleanAst } from "./captured-acp-protocol.js";
import * as native from "../../src/protocol/native-acp-lifecycle.js";

export function loadCapturedAcpLifecycle(cli: string) {
  assert.equal(
    createHash("sha256").update(cli).digest("hex"),
    native.ACP_LIFECYCLE_SHA256,
  );
  let output = emittedPrompt("protocol/native-acp-lifecycle");
  const tree: any = parse(output, {
      ecmaVersion: "latest",
      sourceType: "module",
    }),
    nodes = nodesOf(tree),
    edits: any[] = [];
  for (const node of tree.body)
    if (node.type === "ExportNamedDeclaration")
      edits.push({ start: node.start, end: node.declaration.start, text: "" });
  for (const [id, start, end] of native.ACP_LIFECYCLE_FACTORIES) {
    const raw: any = (
      parse("({" + cli.slice(start, end) + "})", { ecmaVersion: "latest" })
        .body[0] as any
    ).expression.properties[0];
    const port = nodes.find(
      (n: any) => n.type === "Property" && n.method && n.key.value === id,
    );
    assert.deepEqual(
      cleanAst(port),
      cleanAst(raw),
      "whole lifecycle factory " + id,
    );
    edits.push({
      start: port.start,
      end: port.end,
      text: cli.slice(start, end),
    });
  }
  for (const [name, start, end] of [
    ...native.ACP_LIFECYCLE_BLOCKS,
    native.ACP_EXTERNAL_URI_DECLARATION,
  ]) {
    const raw = parse(cli.slice(start, end), { ecmaVersion: "latest" }).body[0];
    const scopeName =
      name === "ed"
        ? "capability"
        : name === native.ACP_EXTERNAL_URI_DECLARATION[0]
          ? "uri"
          : "team";
    const scope: any = nodes.find(
      (n: any) => n.type === "VariableDeclarator" && n.id.name === scopeName,
    );
    const port: any = nodesOf(scope.init).find(
      (n: any) =>
        (n.type === "FunctionDeclaration" && n.id.name === name) ||
        (n.type === "VariableDeclaration" &&
          n.declarations[0].id.name === name),
    );
    assert.deepEqual(
      cleanAst(port),
      cleanAst(raw),
      "complete lifecycle declaration " + name,
    );
    edits.push({
      start: port.start,
      end: port.end,
      text: cli.slice(start, end),
    });
  }
  for (const edit of edits.sort((a, b) => b.start - a.start))
    output = output.slice(0, edit.start) + edit.text + output.slice(edit.end);
  return {
    factory: Function(
      output + "\nreturn createNativeAcpLifecycle;",
    )() as typeof native.createNativeAcpLifecycle,
    factories: native.ACP_LIFECYCLE_FACTORIES.length,
    declarations: native.ACP_LIFECYCLE_BLOCKS.length + 1,
  };
}

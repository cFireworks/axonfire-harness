import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { parse } from "acorn";
import { nodesOf } from "./captured-product-sources.js";
import { emittedPrompt } from "./captured-resource-prompts.js";
import { cleanAst } from "./captured-acp-protocol.js";
import * as native from "../../src/protocol/native-acp-replay.js";
export function loadCapturedAcpReplay(source: string) {
  assert.equal(
    createHash("sha256").update(source).digest("hex"),
    native.ACP_REPLAY_SHA256,
  );
  let output = emittedPrompt("protocol/native-acp-replay");
  const tree: any = parse(output, {
      ecmaVersion: "latest",
      sourceType: "module",
    }),
    all = nodesOf(tree),
    edits: any[] = [];
  for (const node of tree.body)
    if (node.type === "ExportNamedDeclaration")
      edits.push({ start: node.start, end: node.declaration.start, text: "" });
  for (const [id, start, end] of native.ACP_REPLAY_FACTORIES) {
    const raw: any = (
      parse("({" + source.slice(start, end) + "})", { ecmaVersion: "latest" })
        .body[0] as any
    ).expression.properties[0];
    const port: any = all.find(
      (n: any) => n.type === "Property" && n.method && n.key.value === id,
    );
    assert.deepEqual(
      cleanAst(port),
      cleanAst(raw),
      "complete original replay factory " + id,
    );
    edits.push({
      start: port.start,
      end: port.end,
      text: source.slice(start, end),
    });
  }
  for (const [name, start, end] of native.ACP_REPLAY_FUNCTIONS) {
    const raw = parse(source.slice(start, end), { ecmaVersion: "latest" })
        .body[0],
      port = all.find(
        (n: any) => n.type === "FunctionDeclaration" && n.id.name === name,
      );
    assert.deepEqual(
      cleanAst(port),
      cleanAst(raw),
      "complete replay function " + name,
    );
  }
  for (const e of edits.sort((a, b) => b.start - a.start))
    output = output.slice(0, e.start) + e.text + output.slice(e.end);
  return {
    factory: Function(
      output + "\nreturn createNativeAcpReplay;",
    )() as typeof native.createNativeAcpReplay,
    factories: 1,
    functions: native.ACP_REPLAY_FUNCTIONS.length,
  };
}

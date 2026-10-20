import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { parse } from "acorn";
import { nodesOf } from "./captured-product-sources.js";
import { emittedPrompt } from "./captured-resource-prompts.js";
import { cleanAst } from "./captured-acp-protocol.js";
import {
  ACP_SERVICES_SHA256,
  ACP_SERVICE_BLOCKS,
  ACP_SERVICE_FACTORIES,
  createNativeAcpServices,
} from "../../src/protocol/native-acp-services.js";

/** Load only the catalogued inert fragments, never the application/module bootstrap. */
export function loadCapturedAcpServices(cli: string) {
  assert.equal(
    createHash("sha256").update(cli).digest("hex"),
    ACP_SERVICES_SHA256,
  );
  let output = emittedPrompt("protocol/native-acp-services");
  const tree: any = parse(output, {
      ecmaVersion: "latest",
      sourceType: "module",
    }),
    nodes = nodesOf(tree),
    edits: any[] = [];
  let members = 0,
    functions = 0,
    constants = 0,
    declarations = 0,
    exportGetters = 0;
  for (const node of tree.body)
    if (node.type === "ExportNamedDeclaration")
      edits.push({ start: node.start, end: node.declaration.start, text: "" });
  for (const block of ACP_SERVICE_BLOCKS) {
    const port: any = nodes.find(
      (n: any) =>
        n.type === "VariableDeclarator" &&
        n.id.name === block.key &&
        n.init?.type === "CallExpression",
    );
    assert.ok(port, block.key);
    const locals = nodesOf(port.init);
    for (const [name, start, end] of block.exports) {
      const raw: any = (
        parse("(" + cli.slice(start, end) + ")", { ecmaVersion: "latest" })
          .body[0] as any
      ).expression;
      const define: any = locals.find(
        (n: any) =>
          n.type === "CallExpression" &&
          n.callee?.property?.name === "defineProperty" &&
          n.arguments[0]?.name === "originalModule" &&
          n.arguments[1]?.value === name,
      );
      const getter = define?.arguments[2]?.properties.find(
        (p: any) => p.key.name === "get",
      )?.value;
      assert.deepEqual(
        cleanAst(getter),
        cleanAst(raw),
        block.key + ": original export getter " + name,
      );
      exportGetters++;
    }
    for (const [name, start, end] of block.declarations) {
      const raw = parse(cli.slice(start, end), { ecmaVersion: "latest" })
          .body[0],
        actual: any = locals.find(
          (n: any) =>
            (n.type === "FunctionDeclaration" && n.id?.name === name) ||
            (n.type === "VariableDeclaration" &&
              n.declarations[0]?.id.name === name),
        );
      assert.deepEqual(
        cleanAst(actual),
        cleanAst(raw),
        block.key + ": complete declaration " + name,
      );
      edits.push({
        start: actual.start,
        end: actual.end,
        text: cli.slice(start, end),
      });
      declarations++;
    }
    for (const [name, start, end] of block.classes) {
      const raw: any = (
        parse("(" + cli.slice(start, end) + ")", { ecmaVersion: "latest" })
          .body[0] as any
      ).expression;
      members += raw.body.body.length;
      const actual: any = locals.find(
        (n: any) =>
          n.type === "VariableDeclarator" &&
          n.id.name === name &&
          n.init?.type === "ClassExpression",
      );
      assert.deepEqual(
        cleanAst(actual?.init),
        cleanAst(raw),
        block.key + ": whole class " + name,
      );
    }
    functions += block.functions.length;
    constants += block.constants.length;
  }
  for (const [id, start, end] of ACP_SERVICE_FACTORIES) {
    const raw: any = (
        parse("({" + cli.slice(start, end) + "})", { ecmaVersion: "latest" })
          .body[0] as any
      ).expression.properties[0],
      actual: any = nodes.find(
        (n: any) => n.type === "Property" && n.method && n.key.value === id,
      );
    assert.deepEqual(
      cleanAst(actual),
      cleanAst(raw),
      "complete ACP service factory " + id,
    );
    edits.push({
      start: actual.start,
      end: actual.end,
      text: cli.slice(start, end),
    });
  }
  for (const edit of edits.sort((a, b) => b.start - a.start))
    output = output.slice(0, edit.start) + edit.text + output.slice(edit.end);
  return {
    factory: Function(
      output + "\nreturn createNativeAcpServices;",
    )() as typeof createNativeAcpServices,
    classes: ACP_SERVICE_BLOCKS.reduce((sum, b) => sum + b.classes.length, 0),
    members,
    functions,
    constants,
    declarations,
    factories: ACP_SERVICE_FACTORIES.length,
    exportGetters,
  };
}

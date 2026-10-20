import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { parse } from "acorn";
import { nodesOf } from "./captured-product-sources.js";
import { emittedPrompt } from "./captured-resource-prompts.js";
import { cleanAst } from "./captured-acp-protocol.js";
import * as native from "../../src/sessions/native-session-stack.js";

/** Complete declarations plus complete inert factory oracle; no original app bootstrap. */
export function loadCapturedSessionStack(cli: string) {
  assert.equal(
    createHash("sha256").update(cli).digest("hex"),
    native.SESSION_STACK_SHA256,
  );
  let output = emittedPrompt("sessions/native-session-stack");
  const tree: any = parse(output, {
      ecmaVersion: "latest",
      sourceType: "module",
    }),
    all = nodesOf(tree),
    edits: any[] = [];
  for (const node of tree.body)
    if (node.type === "ExportNamedDeclaration")
      edits.push({ start: node.start, end: node.declaration.start, text: "" });
  const factory: any = all.find(
    (n: any) =>
      n.type === "FunctionDeclaration" &&
      n.id?.name === "createNativeSessionStack",
  );
  assert.ok(factory);
  for (const [name, start, end] of native.SESSION_STACK_BLOCKS) {
    const raw = parse(cli.slice(start, end), { ecmaVersion: "latest" }).body[0];
    const port: any = factory.body.body.find(
      (n: any) =>
        (n.type === "FunctionDeclaration" && n.id?.name === name) ||
        (n.type === "VariableDeclaration" &&
          n.declarations[0]?.id.name === name),
    );
    assert.deepEqual(
      cleanAst(port),
      cleanAst(raw),
      "complete session stack declaration " + name,
    );
    edits.push({
      start: port.start,
      end: port.end,
      text: cli.slice(start, end),
    });
  }
  const unwrap = (n: any): any =>
    n?.type === "AssignmentExpression" ? unwrap(n.right) : n;
  let members = 0;
  for (const [name, start, end, count] of native.SESSION_STACK_CLASSES) {
    const raw: any = (
      parse("(" + cli.slice(start, end) + ")", { ecmaVersion: "latest" })
        .body[0] as any
    ).expression;
    const port: any = all.find(
      (n: any) => n.type === "VariableDeclarator" && n.id.name === name,
    );
    assert.deepEqual(
      cleanAst(unwrap(port.init)),
      cleanAst(raw),
      "whole session stack class " + name,
    );
    assert.equal(raw.body.body.length, count);
    members += count;
  }
  for (const [id, start, end] of native.SESSION_STACK_FACTORIES) {
    const raw: any = (
      parse("({" + cli.slice(start, end) + "})", { ecmaVersion: "latest" })
        .body[0] as any
    ).expression.properties[0];
    const port: any = all.find(
      (n: any) => n.type === "Property" && n.method && n.key.value === id,
    );
    assert.deepEqual(
      cleanAst(port),
      cleanAst(raw),
      "whole session stack dependency factory " + id,
    );
    edits.push({
      start: port.start,
      end: port.end,
      text: cli.slice(start, end),
    });
  }
  for (const [name, id] of native.SESSION_STACK_BINDINGS) {
    const port: any = factory.body.body
      .flatMap((n: any) =>
        n.type === "VariableDeclaration" ? n.declarations : [],
      )
      .find((n: any) => n.id.name === name);
    assert.equal(port.init.callee.name, "ec");
    assert.equal(port.init.arguments[0].value, id);
  }
  assert.equal(native.SESSION_STACK_STATICS.length, 0);
  assert.equal(native.SESSION_STACK_UNINITIALIZED.length, 0);
  assert.equal(members, 87);
  assert.equal(native.SESSION_STACK_BLOCKS.length, 7);
  for (const edit of edits.sort((a, b) => b.start - a.start))
    output = output.slice(0, edit.start) + edit.text + output.slice(edit.end);
  return {
    factory: Function(
      output + "\nreturn createNativeSessionStack;",
    )() as typeof native.createNativeSessionStack,
    classes: 3,
    members,
    declarations: 7,
    factories: native.SESSION_STACK_FACTORIES.length,
  };
}

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { parse } from "acorn";
import { nodesOf } from "./captured-product-sources.js";
import { emittedPrompt } from "./captured-resource-prompts.js";
import { cleanAst } from "./captured-acp-protocol.js";
import * as native from "../../src/sessions/native-session-ingress.js";

/** Source-only oracle: replace complete declarations/statics, never evaluate app bootstrap. */
export function loadCapturedSessionIngress(cli: string) {
  assert.equal(
    createHash("sha256").update(cli).digest("hex"),
    native.SESSION_INGRESS_SHA256,
  );
  let output = emittedPrompt("sessions/native-session-ingress");
  const tree: any = parse(output, {
      ecmaVersion: "latest",
      sourceType: "module",
    }),
    all = nodesOf(tree),
    edits: any[] = [];
  for (const node of tree.body)
    if (node.type === "ExportNamedDeclaration")
      edits.push({ start: node.start, end: node.declaration.start, text: "" });
  function scope(id: number) {
    const n: any = all.find(
      (n: any) => n.type === "VariableDeclarator" && n.id.name === "scope" + id,
    );
    assert.ok(n, "bounded scope " + id);
    return nodesOf(n.init);
  }
  for (const [id, name, start, end] of native.SESSION_INGRESS_BLOCKS) {
    const raw = parse(cli.slice(start, end), { ecmaVersion: "latest" }).body[0];
    const port: any = scope(id).find(
      (n: any) =>
        (n.type === "FunctionDeclaration" && n.id?.name === name) ||
        (n.type === "VariableDeclaration" &&
          n.declarations[0]?.id.name === name),
    );
    assert.deepEqual(
      cleanAst(port),
      cleanAst(raw),
      "complete ingress declaration " + id + "." + name,
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
  for (const [id, name, start, end, count] of native.SESSION_INGRESS_CLASSES) {
    const raw: any = (
      parse("(" + cli.slice(start, end) + ")", { ecmaVersion: "latest" })
        .body[0] as any
    ).expression;
    const port: any = scope(id).find(
      (n: any) => n.type === "VariableDeclarator" && n.id.name === name,
    );
    assert.deepEqual(
      cleanAst(unwrap(port.init)),
      cleanAst(raw),
      "whole ingress class " + name,
    );
    assert.equal(raw.body.body.length, count);
    members += count;
  }
  for (const [id, name, start, end] of native.SESSION_INGRESS_STATICS) {
    const raw: any = (
      parse(cli.slice(start, end), { ecmaVersion: "latest" }).body[0] as any
    ).expression;
    const port: any = scope(id).find(
      (n: any) =>
        n.type === "AssignmentExpression" &&
        n.left.type === "MemberExpression" &&
        n.left.object.name + "." + n.left.property.name === name,
    );
    assert.deepEqual(
      cleanAst(port),
      cleanAst(raw),
      "original ingress static " + name,
    );
    edits.push({
      start: port.start,
      end: port.end,
      text: cli.slice(start, end),
    });
  }
  for (const [
    id,
    name,
    kind,
    start,
    end,
  ] of native.SESSION_INGRESS_UNINITIALIZED) {
    const raw: any = (
      parse(kind + " " + cli.slice(start, end) + ";", { ecmaVersion: "latest" })
        .body[0] as any
    ).declarations[0];
    const port = scope(id).find(
      (n: any) =>
        n.type === "VariableDeclarator" &&
        n.id.name === name &&
        n.init === null,
    );
    assert.deepEqual(
      cleanAst(port),
      cleanAst(raw),
      "source self-reference alias " + name,
    );
  }
  for (const [id, name, moduleId] of native.SESSION_INGRESS_BINDINGS) {
    const port: any = scope(id).find(
      (n: any) =>
        n.type === "VariableDeclarator" &&
        n.id.name === name &&
        n.init?.type === "CallExpression",
    );
    assert.equal(port.init.callee.name, "ec");
    assert.equal(port.init.arguments[0].value, moduleId);
  }
  const [prefix, cStart, cEnd] = native.SESSION_INGRESS_CONTROLLER;
  const c: any = (
    parse(cli.slice(cStart, cEnd), { ecmaVersion: "latest" }).body[0] as any
  ).expression;
  assert.equal(c.arguments[0].value, prefix);
  const start = native.SESSION_INGRESS_BLOCKS.find(
    ([id, name]) => id === 66545 && name === "rg",
  )![3];
  const decorators = nodesOf(
    parse(cli.slice(start, cli.indexOf(";", cEnd) + 1), {
      ecmaVersion: "latest",
    }),
  );
  for (const [
    verb,
    path,
    action,
    offset,
    end,
  ] of native.SESSION_INGRESS_ROUTES) {
    const call: any = (
      parse(cli.slice(offset, end), { ecmaVersion: "latest" }).body[0] as any
    ).expression;
    assert.equal(
      call.callee.expressions.at(-1).property.name.toUpperCase(),
      verb,
    );
    assert.equal(call.arguments[0]?.value ?? "", path);
    const decorator: any = decorators.find(
      (n: any) =>
        n.type === "CallExpression" &&
        n.arguments[0]?.type === "ArrayExpression" &&
        n.arguments[0].elements.some((d: any) => d?.start + start === offset),
    );
    assert.equal(decorator.arguments[1].object.name, "rg");
    assert.equal(decorator.arguments[2].value, action);
    for (const [
      method,
      index,
      name,
      pStart,
      pEnd,
    ] of native.SESSION_INGRESS_PARAMETERS) {
      if (method !== action) continue;
      const p: any = (
        parse(cli.slice(pStart, pEnd), { ecmaVersion: "latest" }).body[0] as any
      ).expression;
      assert.equal(p.arguments[0].value, index);
      assert.equal(
        p.arguments[1].callee.expressions.at(-1).property.name,
        name,
      );
      assert.ok(
        decorator.arguments[0].elements.some(
          (n: any) => n?.start + start === pStart,
        ),
        "source parameter belongs to route",
      );
    }
  }
  assert.equal(members, 30);
  assert.equal(native.SESSION_INGRESS_BLOCKS.length, 10);
  for (const edit of edits.sort((a, b) => b.start - a.start))
    output = output.slice(0, edit.start) + edit.text + output.slice(edit.end);
  return {
    factory: Function(
      output + "\nreturn createNativeSessionIngress;",
    )() as typeof native.createNativeSessionIngress,
    declarations: 10,
    classes: 7,
    members,
    statics: 2,
    routes: 2,
    parameters: 2,
  };
}

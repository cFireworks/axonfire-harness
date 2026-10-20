import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { parse } from "acorn";
import { nodesOf } from "./captured-product-sources.js";
import { emittedPrompt } from "./captured-resource-prompts.js";
import { cleanAst } from "./captured-acp-protocol.js";
import * as native from "../../src/auth/native-authentication.js";

export function loadCapturedAuthentication(cli: string) {
  assert.equal(
    createHash("sha256").update(cli).digest("hex"),
    native.NATIVE_AUTHENTICATION_SHA256,
  );
  let output = emittedPrompt("auth/native-authentication");
  const tree: any = parse(output, {
    ecmaVersion: "latest",
    sourceType: "module",
  });
  const all = nodesOf(tree),
    edits: any[] = [];
  for (const n of tree.body)
    if (n.type === "ExportNamedDeclaration")
      edits.push({ start: n.start, end: n.declaration.start, text: "" });
  const expression = (source: string): any =>
    (parse("(" + source + ")", { ecmaVersion: "latest" }).body[0] as any)
      .expression;
  const unwrap = (n: any): any =>
    n?.type === "AssignmentExpression" ? unwrap(n.right) : n;
  let classes = 0,
    members = 0,
    blocks = 0,
    fragments = 0;
  for (const s of native.NATIVE_AUTHENTICATION_SCOPES) {
    const fn: any = all.find(
      (n: any) =>
        n.type === "FunctionDeclaration" && n.id.name === "scope" + s.id,
    );
    assert.ok(fn);
    const nodes = nodesOf(fn),
      body = fn.body.body;
    assert.equal(body.length, 3 + s.fragments.length + s.blocks.length);
    for (const [index, [kind, start, end]] of s.blocks.entries()) {
      const raw =
        kind === "expression"
          ? expression(cli.slice(start, end))
          : parse(cli.slice(start, end), { ecmaVersion: "latest" }).body[0];
      const port = body[2 + s.fragments.length + index];
      assert.deepEqual(
        cleanAst(kind === "expression" ? port.expression : port),
        cleanAst(raw),
        "whole authentication business " + kind + " " + s.id + "@" + start,
      );
      edits.push({
        start: port.start,
        end: port.end,
        text:
          kind === "expression"
            ? "(" + cli.slice(start, end) + ");"
            : cli.slice(start, end),
      });
      blocks++;
    }
    for (const [kind, name, start, end] of s.fragments) {
      const raw: any = (
        parse(kind + " " + cli.slice(start, end) + ";", {
          ecmaVersion: "latest",
        }).body[0] as any
      ).declarations[0];
      const st = body.find(
        (n: any) =>
          n.type === "VariableDeclaration" &&
          n.declarations.some((d: any) => d.id.name === name),
      );
      const port = st.declarations.find((d: any) => d.id.name === name);
      assert.equal(st.kind, kind);
      assert.deepEqual(
        cleanAst(port),
        cleanAst(raw),
        "original non-DI declarator " + name,
      );
      edits.push({
        start: port.start,
        end: port.end,
        text: cli.slice(start, end),
      });
      fragments++;
    }
    for (const [name, start, end, count] of s.classes) {
      const raw = expression(cli.slice(start, end));
      const port: any = nodes.find(
        (n: any) => n.type === "VariableDeclarator" && n.id.name === name,
      );
      assert.deepEqual(cleanAst(unwrap(port.init)), cleanAst(raw));
      assert.equal(raw.body.body.length, count);
      classes++;
      members += count;
    }
    for (const [name, id] of s.bindings) {
      const d: any = nodes.find(
        (n: any) => n.type === "VariableDeclarator" && n.id.name === name,
      );
      assert.equal(d.init.callee.name, s.params[2]);
      assert.equal(d.init.arguments[0].value, id);
    }
    for (const [pub, local] of s.exports) {
      const n: any = nodes.find(
        (n: any) =>
          n.type === "AssignmentExpression" &&
          n.left.object?.name === s.params[1] &&
          n.left.property?.name === pub &&
          n.right.name === local,
      );
      assert.ok(n, "original CJS public binding " + pub);
    }
  }
  for (const [id, start, end] of native.NATIVE_AUTHENTICATION_FACTORIES) {
    const raw: any = expression("{" + cli.slice(start, end) + "}")
      .properties[0];
    const port: any = all.find(
      (n: any) => n.type === "Property" && n.method && n.key.value === id,
    );
    assert.deepEqual(
      cleanAst(port),
      cleanAst(raw),
      "complete authentication support factory " + id,
    );
    edits.push({
      start: port.start,
      end: port.end,
      text: cli.slice(start, end),
    });
  }
  assert.deepEqual([classes, members, blocks, fragments], [8, 94, 44, 3]);
  let previous = output.length + 1;
  for (const edit of edits.sort((a, b) => b.start - a.start)) {
    assert.ok(edit.end <= previous, "source replacement ranges do not overlap");
    output = output.slice(0, edit.start) + edit.text + output.slice(edit.end);
    previous = edit.start;
  }
  return {
    factory: Function(
      output + "\nreturn createNativeAuthenticationRuntime;",
    )() as typeof native.createNativeAuthenticationRuntime,
    classes,
    members,
    blocks,
    fragments,
    factories: native.NATIVE_AUTHENTICATION_FACTORIES.length,
  };
}

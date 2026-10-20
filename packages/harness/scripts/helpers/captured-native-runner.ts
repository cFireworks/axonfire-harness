import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { parse } from "acorn";
import { nodesOf } from "./captured-product-sources.js";
import { emittedPrompt } from "./captured-resource-prompts.js";
import { cleanAst } from "./captured-acp-protocol.js";
import * as native from "../../src/runner/native-runner.js";

export function loadCapturedNativeRunner(cli: string) {
  assert.equal(
    createHash("sha256").update(cli).digest("hex"),
    native.NATIVE_RUNNER_SHA256,
  );
  let output = emittedPrompt("runner/native-runner");
  const tree: any = parse(output, {
      ecmaVersion: "latest",
      sourceType: "module",
    }),
    all = nodesOf(tree),
    edits: any[] = [];
  for (const n of tree.body)
    if (n.type === "ExportNamedDeclaration")
      edits.push({ start: n.start, end: n.declaration.start, text: "" });
  let classes = 0,
    members = 0,
    declarations = 0,
    getters = 0;
  const unwrap = (n: any): any =>
    n?.type === "AssignmentExpression" ? unwrap(n.right) : n;
  for (const s of native.NATIVE_RUNNER_SCOPES) {
    const scope: any = all.find(
      (n: any) => n.type === "VariableDeclarator" && n.id.name === s.scope,
    );
    assert.ok(scope);
    const body = scope.init.callee.body.body,
      nodes = nodesOf(scope);
    for (const [name, start, end] of s.blocks) {
      const raw = parse(cli.slice(start, end), { ecmaVersion: "latest" })
        .body[0];
      const port = body.find(
        (n: any) =>
          (n.type === "FunctionDeclaration" && n.id.name === name) ||
          (n.type === "VariableDeclaration" &&
            n.declarations[0].id.name === name),
      );
      assert.deepEqual(
        cleanAst(port),
        cleanAst(raw),
        "whole Runner declaration " + s.scope + "." + name,
      );
      edits.push({
        start: port.start,
        end: port.end,
        text: cli.slice(start, end),
      });
      declarations++;
    }
    for (const [name, start, end, count] of s.classes) {
      const raw: any = (
        parse("(" + cli.slice(start, end) + ")", { ecmaVersion: "latest" })
          .body[0] as any
      ).expression;
      const port: any = nodes.find(
        (n: any) => n.type === "VariableDeclarator" && n.id.name === name,
      );
      assert.deepEqual(
        cleanAst(unwrap(port.init)),
        cleanAst(raw),
        "whole Runner class " + name,
      );
      assert.equal(raw.body.body.length, count);
      classes++;
      members += count;
    }
    for (const [name, id] of s.bindings) {
      const d = body
        .flatMap((n: any) =>
          n.type === "VariableDeclaration" ? n.declarations : [],
        )
        .find((n: any) => n.id.name === name);
      assert.equal(d.init.callee.name, "ec");
      assert.equal(d.init.arguments[0].value, id);
    }
    assert.equal(s.statics.length, 0);
    const exportCall = body.find(
      (n: any) =>
        n.type === "ExpressionStatement" &&
        n.expression.callee?.property?.name === "d" &&
        n.expression.arguments[0]?.name === "originalModule",
    );
    for (const [name, local, start, end] of s.exports) {
      const raw: any = (
        parse("(" + cli.slice(start, end) + ")", { ecmaVersion: "latest" })
          .body[0] as any
      ).expression;
      const port = exportCall.expression.arguments[1].properties.find(
        (p: any) => (p.key.name ?? p.key.value) === name,
      );
      assert.equal(raw.body.name, local);
      assert.deepEqual(cleanAst(port.value), cleanAst(raw));
      getters++;
    }
  }
  for (const [id, start, end] of native.NATIVE_RUNNER_FACTORIES) {
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
      "whole Runner factory " + id,
    );
    edits.push({
      start: port.start,
      end: port.end,
      text: cli.slice(start, end),
    });
  }
  assert.deepEqual([classes, members, declarations, getters], [3, 15, 5, 4]);
  for (const e of edits.sort((a, b) => b.start - a.start))
    output = output.slice(0, e.start) + e.text + output.slice(e.end);
  return {
    factory: Function(
      output + "\nreturn createNativeRunner;",
    )() as typeof native.createNativeRunner,
    classes,
    members,
    declarations,
    getters,
    factories: native.NATIVE_RUNNER_FACTORIES.length,
  };
}

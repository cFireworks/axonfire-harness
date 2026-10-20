import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { parse } from "acorn";
import { nodesOf } from "./captured-product-sources.js";
import { emittedPrompt } from "./captured-resource-prompts.js";
import { cleanAst } from "./captured-acp-protocol.js";
import * as native from "../../src/http/native-http-runtime.js";

export function loadCapturedNativeHttp(cli: string) {
  assert.equal(
    createHash("sha256").update(cli).digest("hex"),
    native.NATIVE_HTTP_SHA256,
  );
  let output = emittedPrompt("http/native-http-runtime");
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
    blocks = 0,
    constants = 0;
  const unwrap = (n: any): any =>
    n?.type === "AssignmentExpression" ? unwrap(n.right) : n;
  for (const scope of native.NATIVE_HTTP_SCOPES) {
    const fn: any = all.find(
      (n: any) =>
        n.type === "FunctionDeclaration" && n.id.name === "scope" + scope.id,
    );
    assert.ok(fn);
    const nodes = nodesOf(fn),
      body = fn.body.body;
    for (const [name, start, end] of scope.blocks) {
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
        "whole HTTP declaration " + scope.id + "." + name,
      );
      edits.push({
        start: port.start,
        end: port.end,
        text: cli.slice(start, end),
      });
      blocks++;
    }
    for (const [name, start, end, count] of scope.classes) {
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
        "whole HTTP class " + scope.id + "." + name,
      );
      assert.equal(raw.body.body.length, count);
      classes++;
      members += count;
    }
    for (const [name, id] of scope.bindings) {
      const d = body
        .flatMap((n: any) =>
          n.type === "VariableDeclaration" ? n.declarations : [],
        )
        .find((n: any) => n.id.name === name);
      assert.equal(d.init.callee.name, "ec");
      assert.equal(d.init.arguments[0].value, id);
    }
    for (const [name, start, end] of scope.constants) {
      const port: any = nodes.find(
        (n: any) =>
          n.type === "AssignmentExpression" &&
          n.left.object?.name === "el" &&
          n.left.property?.name === name,
      );
      const raw: any = (
        parse(cli.slice(start, end), { ecmaVersion: "latest" }).body[0] as any
      ).expression;
      assert.deepEqual(cleanAst(port), cleanAst(raw));
      edits.push({
        start: port.start,
        end: port.end,
        text: cli.slice(start, end),
      });
      constants++;
    }
    const result: any = body.find((n: any) => n.type === "ReturnStatement");
    for (const [pub, local] of scope.exports) {
      const p = result.argument.properties.find(
        (p: any) =>
          p.type === "Property" && (p.key.name ?? p.key.value) === pub,
      );
      assert.equal(p.value.name, local);
      const declaration = scope.classes.find((entry) => entry[0] === local);
      assert.ok(declaration);
      assert.ok(
        cli.slice(declaration[2]).startsWith(";el." + pub + "=" + local + ","),
        "original public HTTP export " + scope.id + "." + pub,
      );
    }
  }
  for (const [id, start, end] of native.NATIVE_HTTP_FACTORIES) {
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
      "complete HTTP/CLS factory " + id,
    );
    edits.push({
      start: port.start,
      end: port.end,
      text: cli.slice(start, end),
    });
  }
  assert.deepEqual([classes, members, blocks, constants], [35, 75, 37, 2]);
  for (const [
    id,
    local,
    property,
    key,
    keyModule,
    keyField,
    start,
    end,
  ] of native.NATIVE_HTTP_CONFIGURATION) {
    const call: any = (
      parse(cli.slice(start, end), { ecmaVersion: "latest" }).body[0] as any
    ).expression;
    assert.equal(
      cli.slice(call.arguments[0].start + start, call.arguments[0].end + start),
      key,
    );
    const scope = native.NATIVE_HTTP_SCOPES.find((s) => s.id === id);
    assert.ok(scope);
    assert.ok(scope.classes.some((c) => c[0] === local));
    assert.equal(typeof property, "string");
    if (keyModule !== null) {
      assert.equal(call.arguments[0].type, "MemberExpression");
      assert.equal(call.arguments[0].property.name, keyField);
      assert.equal(
        scope.bindings.find(
          (entry) => entry[0] === call.arguments[0].object.name,
        )?.[1],
        keyModule,
      );
    }
    assert.ok(
      cli
        .slice(end, end + 100)
        .includes("]," + local + '.prototype,"' + property + '",void 0)'),
      "original Value property target " + id + "." + property,
    );
    const callee =
      call.callee.type === "SequenceExpression"
        ? call.callee.expressions.at(-1)
        : call.callee;
    assert.equal(callee.property.name, "Value");
  }
  for (const e of edits.sort((a, b) => b.start - a.start))
    output = output.slice(0, e.start) + e.text + output.slice(e.end);
  return {
    factory: Function(
      output + "\nreturn createNativeHttpRuntime;",
    )() as typeof native.createNativeHttpRuntime,
    classes,
    members,
    blocks,
    constants,
    factories: native.NATIVE_HTTP_FACTORIES.length,
    configurations: native.NATIVE_HTTP_CONFIGURATION.length,
  };
}

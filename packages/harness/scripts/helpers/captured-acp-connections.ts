import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { parse } from "acorn";
import { nodesOf } from "./captured-product-sources.js";
import { emittedPrompt } from "./captured-resource-prompts.js";
import { cleanAst } from "./captured-acp-protocol.js";
import * as native from "../../src/protocol/native-acp-connections.js";
const unwrap = (value: any): any =>
  value?.type === "AssignmentExpression" ? unwrap(value.right) : value;

/** Verify all complete connection declarations/statics/routes; evaluate only inert fragments. */
export function loadCapturedAcpConnections(cli: string) {
  assert.equal(
    createHash("sha256").update(cli).digest("hex"),
    native.ACP_CONNECTION_SHA256,
  );
  let output = emittedPrompt("protocol/native-acp-connections");
  const tree: any = parse(output, {
      ecmaVersion: "latest",
      sourceType: "module",
    }),
    nodes = nodesOf(tree),
    edits: any[] = [];
  let members = 0;
  for (const node of tree.body)
    if (node.type === "ExportNamedDeclaration")
      edits.push({ start: node.start, end: node.declaration.start, text: "" });
  for (const [name, start, end] of native.ACP_CONNECTION_DECLARATIONS) {
    const raw = parse(cli.slice(start, end), { ecmaVersion: "latest" }).body[0],
      port: any = nodes.find(
        (n: any) =>
          (n.type === "FunctionDeclaration" && n.id?.name === name) ||
          (n.type === "VariableDeclaration" &&
            n.declarations[0]?.id.name === name),
      );
    assert.deepEqual(
      cleanAst(port),
      cleanAst(raw),
      "ACP full connection declaration " + name,
    );
    edits.push({
      start: port.start,
      end: port.end,
      text: cli.slice(start, end),
    });
  }
  for (const [name, start, end] of native.ACP_CONNECTION_CLASSES) {
    const raw: any = (
      parse("(" + cli.slice(start, end) + ")", { ecmaVersion: "latest" })
        .body[0] as any
    ).expression;
    const port: any = nodes.find(
      (n: any) =>
        n.type === "VariableDeclarator" &&
        n.id.name === name &&
        unwrap(n.init)?.type === "ClassExpression",
    );
    assert.deepEqual(
      cleanAst(unwrap(port?.init)),
      cleanAst(raw),
      "ACP whole connection class " + name,
    );
    members += raw.body.body.length;
  }
  for (const [name, start, end] of native.ACP_CONNECTION_STATICS) {
    const raw: any = (
      parse(cli.slice(start, end), { ecmaVersion: "latest" }).body[0] as any
    ).expression;
    const port: any = nodes.find(
      (n: any) =>
        n.type === "AssignmentExpression" &&
        n.left.type === "MemberExpression" &&
        n.left.object.name + "." + n.left.property.name === name,
    );
    assert.deepEqual(
      cleanAst(port),
      cleanAst(raw),
      "ACP original static configuration " + name,
    );
  }
  for (const [name, kind, start, end] of native.ACP_CONNECTION_UNINITIALIZED) {
    const raw: any = (
      parse(kind + " " + cli.slice(start, end) + ";", { ecmaVersion: "latest" })
        .body[0] as any
    ).declarations[0];
    const port = nodes.find(
      (n: any) =>
        n.type === "VariableDeclarator" &&
        n.id.name === name &&
        n.init === null,
    );
    assert.deepEqual(
      cleanAst(port),
      cleanAst(raw),
      "ACP original uninitialized alias " + name,
    );
  }
  const [prefix, cStart, cEnd] = native.ACP_CONNECTION_CONTROLLER,
    c: any = (
      parse(cli.slice(cStart, cEnd), { ecmaVersion: "latest" }).body[0] as any
    ).expression;
  assert.equal(c.arguments[0].value, prefix);
  const controllerEnd = native.ACP_CONNECTION_DECLARATIONS.find(
    ([name]) => name === "nQ",
  )![2];
  const decorators = nodesOf(
    parse(cli.slice(controllerEnd, cli.indexOf(";", cEnd) + 1), {
      ecmaVersion: "latest",
    }),
  );
  for (const [
    method,
    suffix,
    action,
    start,
    end,
  ] of native.ACP_CONNECTION_ROUTES) {
    const raw: any = (
      parse(cli.slice(start, end), { ecmaVersion: "latest" }).body[0] as any
    ).expression;
    assert.equal(
      raw.callee.expressions.at(-1).property.name.toUpperCase(),
      method,
    );
    assert.equal(raw.arguments[0]?.value ?? "", suffix);
    const decorator: any = decorators.find(
      (n: any) =>
        n.type === "CallExpression" &&
        n.callee.name === "acp_http_controller_decorate" &&
        n.arguments[0]?.type === "ArrayExpression" &&
        n.arguments[0].elements.some(
          (d: any) => d?.start + controllerEnd === start,
        ),
    );
    assert.equal(decorator?.arguments[1]?.object?.name, "nQ");
    assert.equal(decorator?.arguments[1]?.property?.name, "prototype");
    assert.equal(decorator?.arguments[2]?.value, action, "HTTP route action");
    if (action === "post")
      assert.ok(
        decorator.arguments[0].elements.some(
          (d: any) =>
            d?.callee?.name === "__param" &&
            d.arguments[0]?.value === 0 &&
            d.arguments[1]?.callee?.expressions?.at(-1)?.property?.name ===
              "Body",
        ),
        "original @Body parameter zero",
      );
  }
  assert.equal(native.ACP_CONNECTION_CLASSES.length, 10);
  assert.equal(members, 84);
  for (const edit of edits.sort((a, b) => b.start - a.start))
    output = output.slice(0, edit.start) + edit.text + output.slice(edit.end);
  return {
    factory: Function(
      output + "\nreturn createNativeAcpConnections;",
    )() as typeof native.createNativeAcpConnections,
    classes: 10,
    members,
    functions: native.ACP_CONNECTION_FUNCTIONS.length,
    initializers: native.ACP_CONNECTION_INITIALIZERS.length,
    statics: native.ACP_CONNECTION_STATICS.length,
    routes: native.ACP_CONNECTION_ROUTES.length,
  };
}

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { parse } from "acorn";
import { nodesOf } from "./captured-product-sources.js";
import { emittedPrompt } from "./captured-resource-prompts.js";
import * as agent from "../../src/protocol/native-acp-agent.js";
import * as view from "../../src/protocol/native-acp-view.js";
import * as primitives from "../../src/protocol/native-acp-primitives.js";

const catalogs = [
  {
    file: "agent",
    name: "createNativeAcpAgent",
    classes: agent.ACP_AGENT_CLASSES,
    declarations: agent.ACP_AGENT_DECLARATIONS,
    factories: [],
  },
  {
    file: "view",
    name: "createNativeAcpView",
    classes: view.ACP_VIEW_CLASSES,
    declarations: view.ACP_VIEW_DECLARATIONS,
    factories: [],
  },
  {
    file: "primitives",
    name: "createNativeAcpPrimitives",
    classes: primitives.ACP_PRIMITIVE_CLASSES,
    declarations: [],
    factories: primitives.ACP_PRIMITIVE_FACTORIES,
  },
] as const;
export const cleanAst = (value: any): any =>
  value && typeof value === "object"
    ? Array.isArray(value)
      ? value.map(cleanAst)
      : Object.fromEntries(
          Object.entries(value)
            .filter(([key]) => !["start", "end", "raw"].includes(key))
            .map(([key, child]) => [key, cleanAst(child)]),
        )
    : value;
const expression = (text: string): any =>
  (parse("(" + text + ")", { ecmaVersion: "latest" }).body[0] as any)
    .expression;
const primitiveLocals: Record<string, string> = { AcpToolInterceptor: "n_" };

/** Replaces only inert declarations, never evaluates the bundle/module bootstrap. */
export function loadCapturedAcpProtocol(cli: string) {
  assert.equal(
    createHash("sha256").update(cli).digest("hex"),
    agent.ACP_AGENT_SHA256,
  );
  assert.equal(agent.ACP_AGENT_SHA256, view.ACP_VIEW_SHA256);
  assert.equal(agent.ACP_AGENT_SHA256, primitives.ACP_PRIMITIVES_SHA256);
  const result: Record<string, any> = {};
  let members = 0,
    declarations = 0,
    factoryCount = 0;
  for (const catalog of catalogs) {
    let output = emittedPrompt("protocol/native-acp-" + catalog.file);
    const tree: any = parse(output, {
        ecmaVersion: "latest",
        sourceType: "module",
      }),
      nodes = nodesOf(tree),
      edits: any[] = [];
    for (const node of tree.body)
      if (node.type === "ExportNamedDeclaration")
        edits.push({
          start: node.start,
          end: node.declaration.start,
          text: "",
        });
    for (const [name, start, end] of catalog.classes) {
      const original = expression(cli.slice(start, end)),
        port: any = nodes.find(
          (node: any) =>
            node.type === "VariableDeclarator" &&
            node.id.name === (primitiveLocals[name] ?? name) &&
            node.init?.type === "ClassExpression",
        );
      assert.ok(port, catalog.file + ": class " + name);
      assert.deepEqual(
        cleanAst(port.init),
        cleanAst(original),
        catalog.file + ": complete class " + name,
      );
      members += original.body.body.length;
      if (catalog.file === "primitives")
        edits.push({
          start: port.init.start,
          end: port.init.end,
          text: cli.slice(start, end),
        });
    }
    for (const [name, start, end] of catalog.declarations) {
      const original = parse(cli.slice(start, end), { ecmaVersion: "latest" })
          .body[0],
        port: any = nodes.find(
          (node: any) =>
            (node.type === "FunctionDeclaration" && node.id?.name === name) ||
            (node.type === "VariableDeclaration" &&
              node.declarations[0]?.id.name === name),
        );
      assert.deepEqual(
        cleanAst(port),
        cleanAst(original),
        catalog.file + ": complete declaration " + name,
      );
      edits.push({
        start: port.start,
        end: port.end,
        text: cli.slice(start, end),
      });
      declarations++;
    }
    for (const [id, start, end] of catalog.factories) {
      const original = (expression("({" + cli.slice(start, end) + "})") as any)
          .properties[0],
        port: any = nodes.find(
          (node: any) =>
            node.type === "Property" && node.method && node.key.value === id,
        );
      assert.deepEqual(
        cleanAst(port),
        cleanAst(original),
        "ACP complete primitive factory " + id,
      );
      edits.push({
        start: port.start,
        end: port.end,
        text: cli.slice(start, end),
      });
      factoryCount++;
    }
    for (const edit of edits.sort((a, b) => b.start - a.start))
      output = output.slice(0, edit.start) + edit.text + output.slice(edit.end);
    result[catalog.file] = Function(output + "\nreturn " + catalog.name)();
  }
  assert.equal(members, 217); // Deferred adds one constructor inside factory 8461.
  return { ...result, members, declarations, factoryCount } as {
    agent: typeof agent.createNativeAcpAgent;
    view: typeof view.createNativeAcpView;
    primitives: typeof primitives.createNativeAcpPrimitives;
    members: number;
    declarations: number;
    factoryCount: number;
  };
}

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { parse } from "acorn";
import { nodesOf } from "./captured-product-sources.js";
import { emittedPrompt } from "./captured-resource-prompts.js";
import { cleanAst } from "./captured-acp-protocol.js";
import * as native from "../../src/interaction/native-interaction-services.js";

export function loadCapturedInteractionServices(cli: string) {
  assert.equal(
    createHash("sha256").update(cli).digest("hex"),
    native.INTERACTION_SERVICES_SHA256,
  );
  let output = emittedPrompt("interaction/native-interaction-services");
  const tree: any = parse(output, {
      ecmaVersion: "latest",
      sourceType: "module",
    }),
    all = nodesOf(tree),
    edits: any[] = [];
  for (const n of tree.body)
    if (n.type === "ExportNamedDeclaration")
      edits.push({ start: n.start, end: n.declaration.start, text: "" });
  const expression = (s: string): any =>
    (parse("(" + s + ")", { ecmaVersion: "latest" }).body[0] as any).expression;
  let classes = 0,
    members = 0,
    blocks = 0,
    fragments = 0;
  for (const scope of native.INTERACTION_SERVICES_SCOPES) {
    const fn: any = all.find(
      (n: any) =>
        n.type === "FunctionDeclaration" && n.id.name === "scope" + scope.id,
    );
    const entries: any[] = [
      ...scope.blocks.map(([kind, start, end]) => ({ kind, start, end })),
      ...scope.fragments.map(([kind, name, start, end]) => ({
        kind,
        name,
        start,
        end,
      })),
    ].sort((a, b) => a.start - b.start);
    assert.equal(fn.body.body.length, entries.length + 2);
    for (const [index, e] of entries.entries()) {
      const port = fn.body.body[index + 1];
      if (e.name) {
        const raw: any = (
          parse(e.kind + " " + cli.slice(e.start, e.end) + ";", {
            ecmaVersion: "latest",
          }).body[0] as any
        ).declarations[0];
        assert.equal(port.kind, e.kind);
        assert.equal(port.declarations.length, 1);
        assert.deepEqual(cleanAst(port.declarations[0]), cleanAst(raw));
        edits.push({
          start: port.declarations[0].start,
          end: port.declarations[0].end,
          text: cli.slice(e.start, e.end),
        });
        fragments++;
      } else {
        const raw =
          e.kind === "expression"
            ? expression(cli.slice(e.start, e.end))
            : parse(cli.slice(e.start, e.end), { ecmaVersion: "latest" })
                .body[0];
        assert.deepEqual(
          cleanAst(e.kind === "expression" ? port.expression : port),
          cleanAst(raw),
          "whole parent business source in original initialization order " +
            scope.id +
            "@" +
            e.start,
        );
        edits.push({
          start: port.start,
          end: port.end,
          text:
            e.kind === "expression"
              ? "(" + cli.slice(e.start, e.end) + ");"
              : cli.slice(e.start, e.end),
        });
        blocks++;
      }
    }
    const nodes = nodesOf(fn);
    for (const [name, start, end, count] of scope.classes) {
      const d: any = nodes.find(
        (n: any) => n.type === "VariableDeclarator" && n.id.name === name,
      );
      const raw = expression(cli.slice(start, end));
      assert.deepEqual(cleanAst(d.init), cleanAst(raw));
      assert.equal(raw.body.body.length, count);
      classes++;
      members += count;
    }
    for (const [name, id] of scope.bindings) {
      const d: any = nodes.find(
        (n: any) => n.type === "VariableDeclarator" && n.id.name === name,
      );
      assert.equal(d.init.callee.name, "ec");
      assert.equal(d.init.arguments[0].value, id);
    }
  }
  for (const [id, start, end] of native.INTERACTION_SERVICES_FACTORIES) {
    const raw = expression("{" + cli.slice(start, end) + "}").properties[0],
      port: any = all.find(
        (n: any) => n.type === "Property" && n.method && n.key.value === id,
      );
    assert.deepEqual(
      cleanAst(port),
      cleanAst(raw),
      "whole parent factory " + id,
    );
    edits.push({
      start: port.start,
      end: port.end,
      text: cli.slice(start, end),
    });
  }
  const [name, start, end, count] = native.INTERACTION_PLAN_UTILITIES;
  const d: any = all.find(
    (n: any) => n.type === "VariableDeclarator" && n.id.name === name,
  );
  const raw: any = (
    parse("let " + cli.slice(start, end) + ";", { ecmaVersion: "latest" })
      .body[0] as any
  ).declarations[0];
  assert.deepEqual(
    cleanAst(d),
    cleanAst(raw),
    "complete original PlanModeUtils declaration",
  );
  assert.equal(d.init.body.body.length, count);
  edits.push({ start: d.start, end: d.end, text: cli.slice(start, end) });
  assert.deepEqual([classes, members, blocks, fragments], [2, 20, 7, 9]);
  let previous = output.length + 1;
  for (const e of edits.sort((a, b) => b.start - a.start)) {
    assert.ok(e.end <= previous);
    output = output.slice(0, e.start) + e.text + output.slice(e.end);
    previous = e.start;
  }
  return {
    factory: Function(
      output + "\nreturn createNativeInteractionServices;",
    )() as typeof native.createNativeInteractionServices,
    classes,
    members,
    blocks,
    fragments,
    factories: native.INTERACTION_SERVICES_FACTORIES.length,
    utilityClasses: 1,
    utilityMembers: 2,
  };
}

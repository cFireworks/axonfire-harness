import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { parse } from "acorn";
import { nodesOf } from "./captured-product-sources.js";
import { emittedPrompt } from "./captured-resource-prompts.js";
import { cleanAst } from "./captured-acp-protocol.js";
import * as native from "../../src/agents/native-agent-run.js";
import * as utils from "../../src/agents/native-agent-run-utilities.js";

/** Whole declarations + getters + factories; original app/DI/bootstrap never executed. */
export function loadCapturedAgentRun(cli: string) {
  assert.equal(
    createHash("sha256").update(cli).digest("hex"),
    native.AGENT_RUN_SHA256,
  );
  assert.equal(utils.AGENT_RUN_UTILITIES_SHA256, native.AGENT_RUN_SHA256);
  function oracle(
    name: string,
    factoryName: string,
    declarations: readonly any[],
    factories: readonly any[],
  ) {
    let output = emittedPrompt(name);
    const tree: any = parse(output, {
        ecmaVersion: "latest",
        sourceType: "module",
      }),
      all = nodesOf(tree),
      edits: any[] = [];
    for (const node of tree.body)
      if (node.type === "ExportNamedDeclaration")
        edits.push({
          start: node.start,
          end: node.declaration.start,
          text: "",
        });
    const scope: any = all.find(
      (n: any) =>
        n.type === "FunctionDeclaration" && n.id?.name === factoryName,
    );
    assert.ok(scope);
    for (const [local, start, end] of declarations) {
      const raw: any = parse(cli.slice(start, end), { ecmaVersion: "latest" })
        .body[0];
      const port: any = scope.body.body.find(
        (n: any) =>
          (n.type === "FunctionDeclaration" && n.id?.name === local) ||
          (n.type === "VariableDeclaration" &&
            n.declarations[0]?.id.name === local),
      );
      assert.deepEqual(
        cleanAst(port),
        cleanAst(raw),
        "complete AgentRun declaration " + local,
      );
      edits.push({
        start: port.start,
        end: port.end,
        text: cli.slice(start, end),
      });
    }
    const unwrap = (n: any): any =>
      n?.type === "AssignmentExpression" ? unwrap(n.right) : n;
    if (factoryName === "createNativeAgentRun") {
      let members = 0;
      for (const [local, start, end, count] of native.AGENT_RUN_CLASSES) {
        const raw: any = (
          parse("(" + cli.slice(start, end) + ")", { ecmaVersion: "latest" })
            .body[0] as any
        ).expression;
        const port: any = all.find(
          (n: any) => n.type === "VariableDeclarator" && n.id.name === local,
        );
        assert.deepEqual(
          cleanAst(unwrap(port?.init)),
          cleanAst(raw),
          "whole AgentRun class " + local,
        );
        assert.equal(raw.body.body.length, count);
        members += count;
      }
      assert.equal(members, 172);
      assert.equal(native.AGENT_RUN_CLASSES.length, 33);
      for (const [local, id] of native.AGENT_RUN_BINDINGS) {
        const d: any = scope.body.body
          .flatMap((n: any) =>
            n.type === "VariableDeclaration" ? n.declarations : [],
          )
          .find((n: any) => n.id.name === local);
        assert.equal(d.init.callee.name, "ec");
        assert.equal(d.init.arguments[0].value, id);
      }
      assert.equal(native.AGENT_RUN_STATICS.length, 0);
      assert.equal(native.AGENT_RUN_UNINITIALIZED.length, 0);
      const [nsStart, nsEnd] = native.AGENT_RUN_NAMESPACE_LOADER;
      const rawNamespace: any = (
        parse(cli.slice(nsStart, nsEnd), { ecmaVersion: "latest" })
          .body[0] as any
      ).expression;
      const portNamespace: any = scope.body.body.find(
        (n: any) =>
          n.type === "ExpressionStatement" &&
          n.expression.type === "CallExpression" &&
          n.expression.callee.type === "ArrowFunctionExpression",
      );
      assert.deepEqual(
        cleanAst(portNamespace.expression),
        cleanAst(rawNamespace),
        "complete inert original namespace-loader IIFE",
      );
      edits.push({
        start: portNamespace.expression.start,
        end: portNamespace.expression.end,
        text: cli.slice(nsStart, nsEnd),
      });
      const exportCall: any = scope.body.body.find(
        (n: any) =>
          n.type === "ExpressionStatement" &&
          n.expression.callee?.property?.name === "d" &&
          n.expression.arguments[0]?.name === "originalModule",
      );
      for (const [pub, local, start, end] of native.AGENT_RUN_EXPORTS) {
        const raw: any = (
          parse("(" + cli.slice(start, end) + ")", { ecmaVersion: "latest" })
            .body[0] as any
        ).expression;
        const property: any =
          exportCall.expression.arguments[1].properties.find(
            (p: any) => (p.key.name ?? p.key.value) === pub,
          );
        assert.equal(raw.body.name, local);
        assert.deepEqual(
          cleanAst(property.value),
          cleanAst(raw),
          "original AgentRun export getter " + pub,
        );
      }
    }
    for (const [id, start, end] of factories) {
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
        "whole AgentRun utility factory " + id,
      );
      edits.push({
        start: port.start,
        end: port.end,
        text: cli.slice(start, end),
      });
    }
    for (const edit of edits.sort((a, b) => b.start - a.start))
      output = output.slice(0, edit.start) + edit.text + output.slice(edit.end);
    return Function(output + "\nreturn " + factoryName + ";")();
  }
  return {
    factory: oracle(
      "agents/native-agent-run",
      "createNativeAgentRun",
      native.AGENT_RUN_BLOCKS,
      native.AGENT_RUN_FACTORIES,
    ) as typeof native.createNativeAgentRun,
    utilities: oracle(
      "agents/native-agent-run-utilities",
      "createNativeAgentRunUtilities",
      [],
      utils.AGENT_RUN_UTILITY_FACTORIES,
    ) as typeof utils.createNativeAgentRunUtilities,
    classes: 33,
    members: 172,
    declarations: native.AGENT_RUN_BLOCKS.length,
    factories:
      native.AGENT_RUN_FACTORIES.length +
      utils.AGENT_RUN_UTILITY_FACTORIES.length,
    exportGetters: native.AGENT_RUN_EXPORTS.length,
    namespaceLoaders: 1,
  };
}

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { parse } from "acorn";
import { emittedPrompt } from "./captured-resource-prompts.js";
import { nodesOf } from "./captured-product-sources.js";
import { cleanAst } from "./captured-acp-protocol.js";
import * as protocol from "../../src/sandbox/native-sandbox-protocol.js";
import * as config from "../../src/sandbox/native-sandbox-turn-config.js";

/** Verify/reinsert inert original factories/declaration; never execute decorators or bootstrap. */
export function loadCapturedSandboxProtocol(cli: string) {
  assert.equal(
    createHash("sha256").update(cli).digest("hex"),
    protocol.SANDBOX_PROTOCOL_SHA256,
  );
  assert.equal(
    config.SANDBOX_TURN_CONFIG_SHA256,
    protocol.SANDBOX_PROTOCOL_SHA256,
  );
  function capture(name: string, factory: string, isProtocol: boolean) {
    let output = emittedPrompt("sandbox/" + name);
    const tree: any = parse(output, {
      ecmaVersion: "latest",
      sourceType: "module",
    });
    const nodes = nodesOf(tree);
    const edits: { start: number; end: number; text: string }[] = [];
    for (const node of tree.body)
      if (node.type === "ExportNamedDeclaration")
        edits.push({
          start: node.start,
          end: node.declaration.start,
          text: "",
        });
    if (isProtocol) {
      const factories = nodes.find(
        (n: any) =>
          n.type === "VariableDeclarator" && n.id.name === "factories",
      ).init;
      for (const [id, start, end] of protocol.SANDBOX_PROTOCOL_MODULES) {
        const raw: any = (
          parse("({" + cli.slice(start, end) + "})", { ecmaVersion: "latest" })
            .body[0] as any
        ).expression.properties[0];
        const port = factories.properties.find((n: any) => n.key.value === id);
        assert.deepEqual(
          cleanAst(port),
          cleanAst(raw),
          "complete sandbox protocol module " + id,
        );
        edits.push({
          start: port.start,
          end: port.end,
          text: cli.slice(start, end),
        });
      }
    } else {
      const [start, end] = config.SANDBOX_TURN_CONFIG_DECLARATION;
      const raw: any = parse(cli.slice(start, end), { ecmaVersion: "latest" })
        .body[0];
      const scope = tree.body.find(
        (n: any) => n.declaration?.id?.name === factory,
      ).declaration;
      const port = scope.body.body.find(
        (n: any) =>
          n.type === "VariableDeclaration" &&
          n.declarations[0].id.name === "ed",
      );
      assert.deepEqual(
        cleanAst(port),
        cleanAst(raw),
        "complete SandboxTurnConfig token/class declaration",
      );
      const [classStart, classEnd, members] = config.SANDBOX_TURN_CONFIG_CLASS;
      const originalClass: any = (
        parse("(" + cli.slice(classStart, classEnd) + ")", {
          ecmaVersion: "latest",
        }).body[0] as any
      ).expression;
      assert.deepEqual(
        cleanAst(port.declarations[1].init),
        cleanAst(originalClass),
      );
      assert.equal(originalClass.body.body.length, members);
      const [registrationStart, registrationEnd] =
        config.SANDBOX_TURN_CONFIG_REGISTRATION;
      assert.equal(
        cli.slice(registrationStart, registrationEnd),
        "ep=__decorate([(0,eu.Component)(ed)],ep)",
      );
      edits.push({
        start: port.start,
        end: port.end,
        text: cli.slice(start, end),
      });
    }
    for (const edit of edits.sort((a, b) => b.start - a.start))
      output = output.slice(0, edit.start) + edit.text + output.slice(edit.end);
    return Function(output + "\nreturn " + factory + ";")();
  }
  return {
    protocol: capture(
      "native-sandbox-protocol",
      "createNativeSandboxProtocol",
      true,
    ) as typeof protocol.createNativeSandboxProtocol,
    turnConfig: capture(
      "native-sandbox-turn-config",
      "createNativeSandboxTurnConfig",
      false,
    ) as typeof config.createNativeSandboxTurnConfig,
    modules: 3,
    configClasses: 1,
    bootstrapExecuted: false,
  };
}

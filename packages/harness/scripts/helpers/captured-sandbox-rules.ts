import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { parse } from "acorn";
import { emittedPrompt } from "./captured-resource-prompts.js";
import { cleanAst } from "./captured-acp-protocol.js";
import * as native from "../../src/sandbox/native-sandbox-rules.js";
export function loadCapturedSandboxRules(cli: string) {
  assert.equal(
    createHash("sha256").update(cli).digest("hex"),
    native.SANDBOX_RULES_SHA256,
  );
  let output = emittedPrompt("sandbox/native-sandbox-rules");
  const tree: any = parse(output, {
    ecmaVersion: "latest",
    sourceType: "module",
  });
  const body = tree.body.find(
    (n: any) => n.declaration?.id?.name === "createNativeSandboxRules",
  ).declaration.body.body;
  const edits: any[] = tree.body
    .filter((n: any) => n.type === "ExportNamedDeclaration")
    .map((n: any) => ({ start: n.start, end: n.declaration.start, text: "" }));
  const key = (n: any) =>
    n.type === "VariableDeclaration" ? n.declarations[0].id.name : n.id?.name;
  for (const [name, start, end] of native.SANDBOX_RULES_BLOCKS) {
    const raw: any = parse(cli.slice(start, end), { ecmaVersion: "latest" })
      .body[0];
    const port = body.find((n: any) => key(n) === name);
    assert.deepEqual(
      cleanAst(port),
      cleanAst(raw),
      "complete rule declaration " + name,
    );
    edits.push({
      start: port.start,
      end: port.end,
      text: cli.slice(start, end),
    });
  }
  const factories = body.find((n: any) => key(n) === "factories")
    .declarations[0].init;
  for (const [id, start, end] of native.SANDBOX_RULES_MODULES) {
    const raw: any = (
      parse("({" + cli.slice(start, end) + "})", { ecmaVersion: "latest" })
        .body[0] as any
    ).expression.properties[0];
    const port = factories.properties.find((n: any) => n.key.value === id);
    assert.deepEqual(
      cleanAst(port),
      cleanAst(raw),
      "complete rule module " + id,
    );
    edits.push({
      start: port.start,
      end: port.end,
      text: cli.slice(start, end),
    });
  }
  const [start, end, count] = native.SANDBOX_RULES_CLASS;
  const cls: any = (
    parse("(" + cli.slice(start, end) + ")", { ecmaVersion: "latest" })
      .body[0] as any
  ).expression;
  assert.equal(cls.body.body.length, count);
  assert.equal(
    cli.slice(10540535, 10540575),
    "eD=__decorate([(0,ed.Component)(ev)],eD)",
  );
  for (const [start, end, property, owner, token] of [
    [10540019, 10540119, "lifecycle", "eB", "SandboxCLILifecycle"],
    [10540139, 10540279, "logger", "ed", "Logger"],
    [10540299, 10540407, "bashSandboxManager", "eC", "BashSandboxManager"],
    [10540427, 10540526, "turnConfig", "eI", "SandboxTurnConfig"],
  ] as const) {
    const node: any = (
      parse("__decorate(" + cli.slice(start, end) + ")", {
        ecmaVersion: "latest",
      }).body[0] as any
    ).expression;
    assert.equal(node.arguments[1].object.name, "eD");
    assert.equal(node.arguments[1].property.name, "prototype");
    assert.equal(node.arguments[2].value, property);
    const decorators = node.arguments[0].elements;
    const autowired = decorators.filter(
      (n: any) => n.callee?.expressions?.at(-1)?.property?.name === "Autowired",
    );
    assert.equal(autowired.length, 1);
    assert.equal(autowired[0].arguments[0].object.name, owner);
    assert.equal(autowired[0].arguments[0].property.name, token);
    assert.equal(
      decorators.some(
        (n: any) =>
          n.callee?.expressions?.at(-1)?.property?.name === "Optional",
      ),
      false,
    );
  }
  for (const edit of edits.sort((a, b) => b.start - a.start))
    output = output.slice(0, edit.start) + edit.text + output.slice(edit.end);
  return Function(
    output + "\nreturn createNativeSandboxRules;",
  )() as typeof native.createNativeSandboxRules;
}

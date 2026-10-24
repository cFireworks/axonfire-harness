import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { parse } from "acorn";
import { emittedPrompt } from "./captured-resource-prompts.js";
import { cleanAst } from "./captured-acp-protocol.js";
import * as native from "../../src/sandbox/native-sandbox-finalization.js";
export function loadCapturedSandboxFinalization(cli: string) {
  assert.equal(
    createHash("sha256").update(cli).digest("hex"),
    native.SANDBOX_FINALIZATION_SHA256,
  );
  let output = emittedPrompt("sandbox/native-sandbox-finalization");
  const tree: any = parse(output, {
      ecmaVersion: "latest",
      sourceType: "module",
    }),
    body = tree.body.find(
      (n: any) => n.declaration?.id?.name === "createNativeSandboxFinalization",
    ).declaration.body.body,
    edits: any[] = tree.body
      .filter((n: any) => n.type === "ExportNamedDeclaration")
      .map((n: any) => ({
        start: n.start,
        end: n.declaration.start,
        text: "",
      }));
  for (const [name, start, end] of native.SANDBOX_FINALIZATION_BLOCKS) {
    const raw: any = parse(cli.slice(start, end), { ecmaVersion: "latest" })
        .body[0],
      port = body.find((n: any) => n.declarations?.[0]?.id?.name === name);
    assert.deepEqual(
      cleanAst(port),
      cleanAst(raw),
      "complete finalization declaration " + name,
    );
    edits.push({
      start: port.start,
      end: port.end,
      text: cli.slice(start, end),
    });
  }
  const factories = body.find(
    (n: any) => n.declarations?.[0]?.id?.name === "factories",
  ).declarations[0].init;
  for (const [id, start, end] of native.SANDBOX_FINALIZATION_MODULES) {
    const raw: any = (
        parse("({" + cli.slice(start, end) + "})", { ecmaVersion: "latest" })
          .body[0] as any
      ).expression.properties[0],
      port = factories.properties.find((n: any) => n.key.value === id);
    assert.deepEqual(
      cleanAst(port),
      cleanAst(raw),
      "complete hook protocol factory " + id,
    );
    edits.push({
      start: port.start,
      end: port.end,
      text: cli.slice(start, end),
    });
  }
  for (const edit of edits.sort((a, b) => b.start - a.start))
    output = output.slice(0, edit.start) + edit.text + output.slice(edit.end);
  return Function(
    output + "\nreturn createNativeSandboxFinalization;",
  )() as typeof native.createNativeSandboxFinalization;
}

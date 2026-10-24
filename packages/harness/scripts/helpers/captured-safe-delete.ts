import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { parse } from "acorn";
import { emittedPrompt } from "./captured-resource-prompts.js";
import { cleanAst } from "./captured-acp-protocol.js";
import * as native from "../../src/sandbox/native-safe-delete.js";
export function loadCapturedSafeDelete(cli: string) {
  assert.equal(
    createHash("sha256").update(cli).digest("hex"),
    native.SAFE_DELETE_SHA256,
  );
  let output = emittedPrompt("sandbox/native-safe-delete");
  const tree: any = parse(output, {
      ecmaVersion: "latest",
      sourceType: "module",
    }),
    body = tree.body.find(
      (n: any) => n.declaration?.id?.name === "createNativeSafeDelete",
    ).declaration.body.body;
  const edits: any[] = tree.body
    .filter((n: any) => n.type === "ExportNamedDeclaration")
    .map((n: any) => ({ start: n.start, end: n.declaration.start, text: "" }));
  const factories = body.find(
    (n: any) => n.declarations?.[0]?.id?.name === "factories",
  ).declarations[0].init;
  for (const [id, start, end] of native.SAFE_DELETE_MODULES) {
    const raw: any = (
        parse("({" + cli.slice(start, end) + "})", { ecmaVersion: "latest" })
          .body[0] as any
      ).expression.properties[0],
      port = factories.properties.find((n: any) => n.key.value === id);
    assert.deepEqual(
      cleanAst(port),
      cleanAst(raw),
      "complete safe-delete factory " + id,
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
    output + "\nreturn createNativeSafeDelete;",
  )() as typeof native.createNativeSafeDelete;
}

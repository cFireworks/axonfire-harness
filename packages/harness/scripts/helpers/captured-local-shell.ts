import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { parse } from "acorn";
import { emittedPrompt } from "./captured-resource-prompts.js";
import { cleanAst } from "./captured-acp-protocol.js";
import * as native from "../../src/sandbox/native-local-shell.js";
export function loadCapturedLocalShell(cli: string) {
  assert.equal(
    createHash("sha256").update(cli).digest("hex"),
    native.LOCAL_SHELL_SHA256,
  );
  let output = emittedPrompt("sandbox/native-local-shell");
  const tree: any = parse(output, {
      ecmaVersion: "latest",
      sourceType: "module",
    }),
    body = tree.body.find(
      (n: any) => n.declaration?.id?.name === "createNativeLocalShell",
    ).declaration.body.body,
    props = body.find((n: any) => n.declarations?.[0]?.id?.name === "factories")
      .declarations[0].init.properties;
  const edits = tree.body
    .filter((n: any) => n.type === "ExportNamedDeclaration")
    .map((n: any) => ({ start: n.start, end: n.declaration.start, text: "" }));
  for (const [id, start, end] of native.LOCAL_SHELL_MODULES) {
    const raw = cli.slice(start, end),
      original: any = (
        parse("({" + raw + "})", { ecmaVersion: "latest" }).body[0] as any
      ).expression.properties[0],
      port = props.find((p: any) => p.key.value === id);
    assert.deepEqual(
      cleanAst(port),
      cleanAst(original),
      "complete original factory " + id,
    );
    edits.push({ start: port.start, end: port.end, text: raw });
  }
  const [start, end] = native.LEGACY_SHELL_RANGE,
    raw = cli.slice(start, end),
    original = parse(raw, { ecmaVersion: "latest" }).body[0],
    port = body.find((n: any) => n.declarations?.[0]?.id?.name === "nH");
  assert.deepEqual(cleanAst(port), cleanAst(original));
  edits.push({ start: port.start, end: port.end, text: raw });
  for (const e of edits.sort((a: any, b: any) => b.start - a.start))
    output = output.slice(0, e.start) + e.text + output.slice(e.end);
  return Function(
    output + "\nreturn createNativeLocalShell;",
  )() as typeof native.createNativeLocalShell;
}

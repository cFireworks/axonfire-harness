import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { parse } from "acorn";
import { emittedPrompt } from "./captured-resource-prompts.js";
import { cleanAst } from "./captured-acp-protocol.js";
import {
  LOGGER_PROVIDER_SHA256,
  LOGGER_PROVIDER_REGIONS,
  LOGGER_PROVIDER_MODULES,
  createNativeLoggerProvider,
} from "../../src/runtime/native-logger-provider.js";
export function loadCapturedLoggerProvider(cli: string) {
  assert.equal(
    createHash("sha256").update(cli).digest("hex"),
    LOGGER_PROVIDER_SHA256,
  );
  let output = emittedPrompt("runtime/native-logger-provider");
  const tree: any = parse(output, {
      ecmaVersion: "latest",
      sourceType: "module",
    }),
    body = tree.body.find(
      (n: any) => n.declaration?.id?.name === "createNativeLoggerProvider",
    ).declaration.body.body;
  const start = body.findIndex(
    (n: any) =>
      n.type === "VariableDeclaration" && n.declarations[0].id.name === "rg",
  );
  const edits = tree.body
    .filter((n: any) => n.type === "ExportNamedDeclaration")
    .map((n: any) => ({ start: n.start, end: n.declaration.start, text: "" }));
  LOGGER_PROVIDER_REGIONS.forEach(([a, b], i) => {
    const raw = cli.slice(a, b),
      original: any = parse(raw, { ecmaVersion: "latest" }).body[0],
      port = body[start + i];
    assert.deepEqual(cleanAst(port), cleanAst(original));
    edits.push({ start: port.start, end: port.end, text: raw });
  });
  const factories = body.find(
    (n: any) => n.declarations?.[0]?.id.name === "factories",
  ).declarations[0].init.properties;
  for (const [id, a, b] of LOGGER_PROVIDER_MODULES) {
    const raw = cli.slice(a, b),
      original: any = (
        parse("({" + raw + "})", { ecmaVersion: "latest" }).body[0] as any
      ).expression.properties[0],
      port = factories.find((n: any) => n.key.value === id);
    assert.deepEqual(cleanAst(port), cleanAst(original));
    edits.push({ start: port.start, end: port.end, text: raw });
  }
  for (const e of edits.sort((a: any, b: any) => b.start - a.start))
    output = output.slice(0, e.start) + e.text + output.slice(e.end);
  return Function(
    output + "\nreturn createNativeLoggerProvider;",
  )() as typeof createNativeLoggerProvider;
}

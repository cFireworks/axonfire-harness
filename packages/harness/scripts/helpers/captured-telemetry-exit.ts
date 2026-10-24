import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { parse } from "acorn";
import { emittedPrompt } from "./captured-resource-prompts.js";
import { cleanAst } from "./captured-acp-protocol.js";
import {
  TELEMETRY_EXIT_SHA256,
  createNativeTelemetryExit,
} from "../../src/runtime/native-telemetry-exit.js";
export function loadCapturedTelemetryExit(cli: string) {
  assert.equal(
    createHash("sha256").update(cli).digest("hex"),
    TELEMETRY_EXIT_SHA256,
  );
  let output = emittedPrompt("runtime/native-telemetry-exit");
  const tree: any = parse(output, {
      ecmaVersion: "latest",
      sourceType: "module",
    }),
    body = tree.body.find(
      (n: any) => n.declaration?.id?.name === "createNativeTelemetryExit",
    ).declaration.body.body,
    port = body.find((n: any) => n.declarations?.[0]?.id?.name === "factories")
      .declarations[0].init.properties[0],
    raw = cli.slice(7887746, 7889212),
    original: any = (
      parse("({" + raw + "})", { ecmaVersion: "latest" }).body[0] as any
    ).expression.properties[0];
  assert.deepEqual(cleanAst(port), cleanAst(original));
  const edits = tree.body
    .filter((n: any) => n.type === "ExportNamedDeclaration")
    .map((n: any) => ({ start: n.start, end: n.declaration.start, text: "" }));
  edits.push({ start: port.start, end: port.end, text: raw });
  for (const e of edits.sort((a: any, b: any) => b.start - a.start))
    output = output.slice(0, e.start) + e.text + output.slice(e.end);
  return Function(
    output + "\nreturn createNativeTelemetryExit;",
  )() as typeof createNativeTelemetryExit;
}

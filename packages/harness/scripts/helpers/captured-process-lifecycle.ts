import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { parse } from "acorn";
import { emittedPrompt } from "./captured-resource-prompts.js";
import { cleanAst } from "./captured-acp-protocol.js";
import {
  PROCESS_LIFECYCLE_SHA256,
  installNativeProcessLifecycle,
} from "../../src/runtime/native-process-lifecycle.js";
export function loadCapturedProcessLifecycle(cli: string) {
  assert.equal(
    createHash("sha256").update(cli).digest("hex"),
    PROCESS_LIFECYCLE_SHA256,
  );
  const raw = cli.slice(9852690, 9858421),
    original: any = (
      parse("({" + raw + "})", { ecmaVersion: "latest" }).body[0] as any
    ).expression.properties[0].value.body;
  let output = emittedPrompt("runtime/native-process-lifecycle");
  const tree: any = parse(output, {
      ecmaVersion: "latest",
      sourceType: "module",
    }),
    outer = tree.body.find(
      (n: any) => n.declaration?.id?.name === "installNativeProcessLifecycle",
    ).declaration;
  const activate = outer.body.body.find(
    (n: any) => n.id?.name === "activateOriginal",
  );
  assert.equal(activate.body.body.at(-1).type, "ReturnStatement");
  assert.deepEqual(
    cleanAst(activate.body.body.slice(0, -1)),
    cleanAst(original.body),
    "complete original module body, excluding only adapter return",
  );
  const edits = tree.body
    .filter((n: any) => n.type === "ExportNamedDeclaration")
    .map((n: any) => ({ start: n.start, end: n.declaration.start, text: "" }));
  edits.push({
    start: activate.body.start + 1,
    end: activate.body.body.at(-1).start,
    text: raw.slice(raw.indexOf("{") + 1, -1),
  });
  for (const e of edits.sort((a: any, b: any) => b.start - a.start))
    output = output.slice(0, e.start) + e.text + output.slice(e.end);
  return Function(
    output + "\nreturn installNativeProcessLifecycle;",
  )() as typeof installNativeProcessLifecycle;
}

export function loadCapturedSafeExit(cli: string) {
  assert.equal(
    createHash("sha256").update(cli).digest("hex"),
    PROCESS_LIFECYCLE_SHA256,
  );
  let output = emittedPrompt("runtime/native-safe-exit");
  const tree: any = parse(output, {
      ecmaVersion: "latest",
      sourceType: "module",
    }),
    outer = tree.body.find(
      (n: any) => n.declaration?.id?.name === "createNativeSafeExit",
    ).declaration;
  const prop = outer.body.body.find(
    (n: any) => n.declarations?.[0]?.id?.name === "factories",
  ).declarations[0].init.properties[0];
  const raw = cli.slice(13359185, 13359526),
    original: any = (
      parse("({" + raw + "})", { ecmaVersion: "latest" }).body[0] as any
    ).expression.properties[0];
  assert.deepEqual(cleanAst(prop), cleanAst(original));
  output = output.slice(0, prop.start) + raw + output.slice(prop.end);
  output = output.replace(
    "export function createNativeSafeExit",
    "function createNativeSafeExit",
  );
  return Function(output + "\nreturn createNativeSafeExit;")();
}

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";
import ts from "typescript";
import { parse } from "acorn";
import { getCapturedBundlePath } from "./captured-bundle-path.js";
import { nodesOf } from "./captured-product-sources.js";
import { cleanAst } from "./captured-acp-protocol.js";
import * as native from "../../src/sessions/native-session-readiness.js";
import * as node_fs from "node:fs";
import * as node_path from "node:path";
import * as os from "node:os";
export function loadCapturedSessionReadiness() {
  const source = readFileSync(
    process.env.WORKBUDDY_DESKTOP_INITIALIZE ??
      resolve(dirname(getCapturedBundlePath()), "../../main/initialize.js"),
    "utf8",
  );
  assert.equal(
    createHash("sha256").update(source).digest("hex"),
    native.SESSION_READINESS_SHA256,
  );
  let output = ts.transpileModule(
    readFileSync(
      new URL(
        "../../src/sessions/native-session-readiness.ts",
        import.meta.url,
      ),
      "utf8",
    ),
    {
      compilerOptions: {
        target: ts.ScriptTarget.ES2023,
        module: ts.ModuleKind.ESNext,
      },
    },
  ).outputText;
  const tree: any = parse(output, {
      ecmaVersion: "latest",
      sourceType: "module",
    }),
    all = nodesOf(tree),
    edits: any[] = [];
  for (const n of tree.body) {
    if (n.type === "ImportDeclaration")
      edits.push({ start: n.start, end: n.end, text: "" });
    if (n.type === "ExportNamedDeclaration")
      edits.push({ start: n.start, end: n.declaration.start, text: "" });
  }
  for (const [name, start, end] of [...native.SESSION_READINESS_FUNCTIONS]) {
    const raw = parse(source.slice(start, end), { ecmaVersion: "latest" })
      .body[0];
    const port: any = all.find(
      (n) =>
        (n.type === "FunctionDeclaration" && n.id?.name === name) ||
        (n.type === "VariableDeclaration" &&
          n.declarations?.[0]?.id?.name === name),
    );
    assert.deepEqual(cleanAst(port), cleanAst(raw), name);
    edits.push({
      start: port.start,
      end: port.end,
      text: source.slice(start, end),
    });
  }
  for (const [name, start, end] of native.SESSION_READINESS_MEMBERS) {
    const raw: any = parse("class X{" + source.slice(start, end) + "}", {
      ecmaVersion: "latest",
    }).body[0];
    const port: any = all.find(
      (n) => n.type === "MethodDefinition" && n.key?.name === name,
    );
    assert.deepEqual(cleanAst(port), cleanAst(raw.body.body[0]), name);
    edits.push({
      start: port.start,
      end: port.end,
      text: source.slice(start, end),
    });
  }
  for (const e of edits.sort((a, b) => b.start - a.start))
    output = output.slice(0, e.start) + e.text + output.slice(e.end);
  return new Function(
    "node_fs",
    "node_path",
    "os",
    output + "\nreturn attachNativeSessionReadiness;",
  )(node_fs, node_path, os) as typeof native.attachNativeSessionReadiness;
}

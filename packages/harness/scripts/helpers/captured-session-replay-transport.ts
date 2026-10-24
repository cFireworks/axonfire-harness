import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as crypto from "node:crypto";
import * as path from "node:path";
import ts from "typescript";
import { parse } from "acorn";
import { getCapturedBundlePath } from "./captured-bundle-path.js";
import { nodesOf } from "./captured-product-sources.js";
import { cleanAst } from "./captured-acp-protocol.js";
import * as native from "../../src/sessions/native-session-replay-transport.js";
export function loadCapturedSessionReplayTransport(): typeof native.createNativeSessionReplayTransport {
  const main =
    process.env.WORKBUDDY_DESKTOP_INITIALIZE ??
    path.resolve(
      path.dirname(getCapturedBundlePath()),
      "../../main/initialize.js",
    );
  let output = ts.transpileModule(
    readFileSync(
      new URL(
        "../../src/sessions/native-session-replay-transport.ts",
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
  });
  const all = nodesOf(tree),
    edits: any[] = [];
  for (const n of tree.body) {
    if (n.type === "ImportDeclaration")
      edits.push({ start: n.start, end: n.end, text: "" });
    if (n.type === "ExportNamedDeclaration")
      edits.push({ start: n.start, end: n.declaration.start, text: "" });
  }
  for (const [file, hash, functions, variables] of [
    [
      main,
      native.REPLAY_TRANSPORT_MAIN_SHA256,
      native.REPLAY_TRANSPORT_MAIN_FUNCTIONS,
      native.REPLAY_TRANSPORT_MAIN_VARIABLES,
    ],
    [
      path.join(path.dirname(main), "gateway-secret.js"),
      native.REPLAY_TRANSPORT_SECRET_SHA256,
      native.REPLAY_TRANSPORT_SECRET_FUNCTIONS,
      native.REPLAY_TRANSPORT_SECRET_VARIABLES,
    ],
  ] as const) {
    const source = readFileSync(file, "utf8");
    assert.equal(
      crypto.createHash("sha256").update(source).digest("hex"),
      hash,
    );
    for (const [name, start, end] of functions) {
      const raw: any = parse(source.slice(start, end), {
        ecmaVersion: "latest",
      }).body[0];
      const port: any = all.find(
        (n) => n.type === "FunctionDeclaration" && n.id?.name === name,
      );
      assert.deepEqual(cleanAst(port), cleanAst(raw), name);
      edits.push({
        start: port.start,
        end: port.end,
        text: source.slice(start, end),
      });
    }
    for (const [name, start, end] of variables) {
      const raw: any = parse("let " + source.slice(start, end), {
        ecmaVersion: "latest",
      }).body[0];
      const port: any = all.find(
        (n) => n.type === "VariableDeclarator" && n.id?.name === name,
      );
      assert.deepEqual(cleanAst(port), cleanAst(raw.declarations[0]), name);
      edits.push({
        start: port.start,
        end: port.end,
        text: source.slice(start, end),
      });
    }
  }
  for (const e of edits.sort((a, b) => b.start - a.start))
    output = output.slice(0, e.start) + e.text + output.slice(e.end);
  return new Function(
    "crypto",
    output + "\nreturn createNativeSessionReplayTransport;",
  )(crypto);
}

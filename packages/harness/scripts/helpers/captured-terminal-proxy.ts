import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import * as path from "node:path";
import * as net from "node:net";
const WebSocket = createRequire(import.meta.url)("ws-native");
const WebSocketServer = WebSocket.WebSocketServer;
import ts from "typescript";
import { parse } from "acorn";
import { getCapturedBundlePath } from "./captured-bundle-path.js";
import { nodesOf } from "./captured-product-sources.js";
import { cleanAst } from "./captured-acp-protocol.js";
import * as native from "../../src/terminal/native-terminal-proxy.js";
const mainPath = () =>
  process.env.WORKBUDDY_DESKTOP_INITIALIZE ??
  path.resolve(
    path.dirname(getCapturedBundlePath()),
    "../../main/initialize.js",
  );
export function verifyTerminalProxyWebSocketSources() {
  const installed = path.dirname(
    createRequire(import.meta.url).resolve("ws-native/package.json"),
  );
  const captured = path.resolve(path.dirname(mainPath()), "../node_modules/ws");
  for (const root of [installed, captured])
    assert.equal(
      JSON.parse(readFileSync(path.join(root, "package.json"), "utf8")).version,
      "8.18.3",
    );
  const files = [
    "index.js",
    "wrapper.mjs",
    ...readdirSync(path.join(captured, "lib"))
      .filter((name) => name.endsWith(".js"))
      .sort()
      .map((name) => "lib/" + name),
  ];
  for (const file of files)
    assert.deepEqual(
      readFileSync(path.join(installed, file)),
      readFileSync(path.join(captured, file)),
      file,
    );
  return files.length;
}
export function loadCapturedTerminalProxy(): typeof native.createNativeTerminalProxy {
  const source = readFileSync(mainPath(), "utf8");
  assert.equal(
    createHash("sha256").update(source).digest("hex"),
    native.TERMINAL_PROXY_SHA256,
  );
  let output = ts.transpileModule(
    readFileSync(
      new URL("../../src/terminal/native-terminal-proxy.ts", import.meta.url),
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
  for (const [name, start, end] of native.TERMINAL_PROXY_FUNCTIONS) {
    const raw: any = parse(source.slice(start, end), { ecmaVersion: "latest" })
      .body[0];
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
  for (const [name, start, end] of native.TERMINAL_PROXY_VARIABLES) {
    const raw: any = parse("const " + source.slice(start, end), {
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
  for (const e of edits.sort((a, b) => b.start - a.start))
    output = output.slice(0, e.start) + e.text + output.slice(e.end);
  return new Function(
    "nodeNet",
    "WebSocket",
    "WebSocketServer",
    output + "\nreturn createNativeTerminalProxy;",
  )(net, WebSocket, WebSocketServer);
}

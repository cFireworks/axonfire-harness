// Owned protocol fixture; no third-party language-server installation needed.
import {
  createMessageConnection,
  StreamMessageReader,
  StreamMessageWriter,
} from "vscode-jsonrpc/node.js";
import { appendFileSync } from "node:fs";
const [logFile, mode = "normal"] = process.argv.slice(2);
const record = (method, params) => {
  if (logFile)
    appendFileSync(
      logFile,
      JSON.stringify({ method, params, pid: process.pid }) + "\n",
    );
};
const connection = createMessageConnection(
  new StreamMessageReader(process.stdin),
  new StreamMessageWriter(process.stdout),
);
const location = (uri) => ({
  uri,
  range: { start: { line: 0, character: 1 }, end: { line: 0, character: 4 } },
});
const item = (uri, name = "Fixture") => ({
  name,
  kind: 12,
  ...location(uri),
  selectionRange: location(uri).range,
});
connection.onRequest("initialize", async (params) => {
  record("initialize", params);
  if (mode === "hang-initialize") return new Promise(() => {});
  const config = await connection.sendRequest("workspace/configuration", {
    items: [{ section: "fixture" }, { section: "missing" }],
  });
  record("configuration-result", config);
  await connection.sendRequest("window/workDoneProgress/create", {
    token: "fixture",
  });
  await connection.sendRequest("client/registerCapability", {
    registrations: [],
  });
  return {
    capabilities: {
      definitionProvider: true,
      hoverProvider: true,
      callHierarchyProvider: true,
    },
  };
});
for (const method of [
  "initialized",
  "workspace/didChangeConfiguration",
  "textDocument/didOpen",
])
  connection.onNotification(method, (params) => record(method, params));
for (const method of [
  "definition",
  "references",
  "implementation",
  "typeDefinition",
  "hover",
  "documentSymbol",
  "prepareCallHierarchy",
  "completion",
])
  connection.onRequest(`textDocument/${method}`, (params) => {
    record(`textDocument/${method}`, params);
    const uri = params.textDocument.uri;
    if (mode === "hang-request" && method === "hover")
      return new Promise(() => {});
    if (method === "definition" && mode === "links")
      return [
        {
          targetUri: uri,
          targetRange: location(uri).range,
          targetSelectionRange: location(uri).range,
        },
      ];
    if (["definition", "implementation", "typeDefinition"].includes(method))
      return location(uri);
    if (method === "references") return [location(uri), location(uri)];
    if (method === "hover")
      return { contents: ["first hover", "discarded second hover"] };
    if (method === "documentSymbol")
      return [
        {
          ...item(uri),
          detail: "function",
          children: [item(uri, "NestedIgnored")],
        },
      ];
    if (method === "prepareCallHierarchy")
      return [item(uri, "First"), item(uri, "SecondIgnored")];
    if (method === "completion")
      return { isIncomplete: true, items: [{ label: "fixture-completion" }] };
  });
connection.onRequest("workspace/symbol", (params) => {
  record("workspace/symbol", params);
  return [];
});
for (const direction of ["incoming", "outgoing"])
  connection.onRequest(`callHierarchy/${direction}Calls`, (params) => {
    record(`callHierarchy/${direction}Calls`, params);
    return [
      {
        [direction === "incoming" ? "from" : "to"]: item(
          params.item.uri,
          `${direction}Target`,
        ),
        fromRanges: [],
      },
    ];
  });
connection.onRequest("shutdown", (params) => {
  record("shutdown", params);
  return null;
});
connection.onNotification("exit", (params) => {
  record("exit", params);
  connection.dispose();
  process.exit(0);
});
connection.listen();

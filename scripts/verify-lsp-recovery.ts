import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { runInNewContext } from "node:vm";
import * as path from "node:path";
import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";
import { URI } from "vscode-uri";
import {
  StreamMessageReader,
  StreamMessageWriter,
} from "vscode-jsonrpc/node.js";
import { z } from "zod3";
import { LSPClientImpl, resolveLSPCommand } from "../src/lsp/lsp-client.js";
import { LSPManagerImpl } from "../src/lsp/lsp-manager.js";
import { resolveLSPFilePath } from "../src/lsp/lsp-path.js";
import { LSPServerStatus, LSPSymbolKind } from "../src/lsp/lsp-types.js";
import {
  LSPTool,
  lspParameters,
  lspJsonSchema,
} from "../src/tools/lsp-tool.js";
const filename = process.argv[2];
if (!filename) throw Error("Pass captured codebuddy.js path");
const source = await readFile(filename, "utf8");
assert.equal(
  createHash("sha256").update(source).digest("hex"),
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd",
);
function evaluate(code: string, bindings: any = {}): any {
  return runInNewContext(
    `Object.setPrototypeOf(TypeError.prototype, Error.prototype);${code}`,
    { Error, Map, Set, Promise, ...bindings },
    { timeout: 1000, contextCodeGeneration: { strings: false, wasm: false } },
  );
}
let comparisons = 0;
function normalize(value: any): any {
  if (value === undefined) return "[undefined]";
  if (
    value instanceof Error ||
    Object.prototype.toString.call(value) === "[object Error]"
  )
    return {
      name: value.name,
      message:
        value.name === "TypeError" ? "[engine TypeError]" : value.message,
    };
  if (value instanceof Map || value instanceof Set)
    return [...value].map(normalize);
  if (typeof value === "function") return "[function]";
  if (Array.isArray(value)) return Array.from(value, normalize);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, normalize(value[key])]),
    );
  return value;
}
function equal(actual: any, expected: any) {
  assert.deepEqual(normalize(actual), normalize(expected));
  comparisons++;
}
async function outcome(fn: () => any) {
  try {
    return { result: await fn() };
  } catch (error) {
    return { error };
  }
}
const schemaStart = source.indexOf("let cp=", 11991000),
  schemaEnd = source.indexOf(",cg=class", schemaStart),
  schema = evaluate(source.slice(schemaStart + 7, schemaEnd), { iJ: { z } });
const converterStart = source.indexOf(
    'let i2=Symbol("Let zodToJsonSchema',
    11618000,
  ),
  converterEnd = source.indexOf(";var om=ec(22618)", converterStart),
  convert = evaluate(
    `(()=>{${source.slice(converterStart, converterEnd + 1)}return zodToJsonSchema})()`,
    { iJ: z },
  );
equal(lspJsonSchema, convert(schema));
for (const operation of [
  "goToDefinition",
  "findReferences",
  "hover",
  "documentSymbol",
  "workspaceSymbol",
  "goToImplementation",
  "prepareCallHierarchy",
  "incomingCalls",
  "outgoingCalls",
  "unknown",
])
  for (const line of [undefined, null, false, true, "1", 1, 1.5, 0, -1, "bad"])
    for (const character of [1, "2", 0]) {
      const input = { operation, filePath: "", line, character, extra: true },
        a = lspParameters.safeParse(input),
        b = schema.safeParse(input);
      equal(a.success ? a.data : "invalid", b.success ? b.data : "invalid");
    }
const NativeClient = (bindings: any = {}) =>
  evaluate(`(${source.slice(11971809, 11982082)})`, {
    n4: path,
    l6: { URI },
    ...bindings,
  });
const NativeTool = evaluate(`(${source.slice(11992011, 11997772)})`, {
  iz: { BaseTool: class {} },
  cp: schema,
  nC: { ToolNames: { LSP: "LSP" } },
  nW: {
    PathUtils: {
      resolveFilePathToWorkDir: (file: string) =>
        resolveLSPFilePath(file, "/workspace"),
    },
  },
  n4: path,
  l6: { URI },
});
const location = {
    uri: URI.file("/workspace/带 空格.ts").toString(),
    range: { start: { line: 2, character: 3 }, end: { line: 5, character: 6 } },
  },
  item = {
    ...location,
    name: "Symbol",
    kind: 12,
    detail: "function",
    children: [{ ...location, name: "Nested" }],
  };
const operations = [
  "goToDefinition",
  "findReferences",
  "hover",
  "documentSymbol",
  "workspaceSymbol",
  "goToImplementation",
  "prepareCallHierarchy",
  "incomingCalls",
  "outgoingCalls",
  "unknown",
];
for (const operation of operations)
  for (const count of [0, 1, 50, 51])
    for (const available of [true, false]) {
      async function probe(native: boolean) {
        const events: any[] = [],
          logger = {
            error: (...args: any[]) => events.push(["error", ...args]),
          },
          list = Array.from({ length: count }, () => item),
          client: any = {};
        for (const method of operations)
          client[method] = async (...args: any[]) => {
            events.push([method, ...args]);
            if (method === "hover")
              return count
                ? { contents: { language: "ts", value: "<raw hover>" } }
                : null;
            if (method === "incomingCalls")
              return list.map((from) => ({ from }));
            if (method === "outgoingCalls") return list.map((to) => ({ to }));
            if (method === "documentSymbol")
              return list.map((value, i) =>
                i % 2 ? { ...value, location } : value,
              );
            if (method === "workspaceSymbol")
              return list.map((value) => ({ ...value, location }));
            if (method === "prepareCallHierarchy") return list;
            return list.map(() => location);
          };
        const manager = {
            getClientForFile: async (file: string) => {
              events.push(["getClient", file]);
              return available ? client : null;
            },
          },
          tool = native
            ? Object.assign(new NativeTool(), { logger, lspManager: manager })
            : new LSPTool(manager, () => "/workspace", logger as any);
        const result = await outcome(() =>
          tool.execute(
            { operation, filePath: "file.ts", line: "2", character: "4" },
            {},
          ),
        );
        return {
          result,
          events,
          name: tool.name,
          description: tool.description,
          aliases: tool.aliases,
          max: tool.MAX_RESULTS,
        };
      }
      equal(await probe(false), await probe(true));
    }
for (let kind = -1; kind <= 28; kind++)
  equal(
    new LSPTool({ getClientForFile: async () => null }).getSymbolKindName(kind),
    new NativeTool().getSymbolKindName(kind),
  );
for (const value of [
  null,
  undefined,
  [],
  location,
  [location],
  [{ targetUri: location.uri, targetRange: location.range }],
  [null, location, {}],
  {},
  "bad",
]) {
  const a = new LSPClientImpl(),
    b = new (NativeClient())();
  equal(
    await outcome(() => a.normalizeLocations(value)),
    await outcome(() => b.normalizeLocations(value)),
  );
}
for (const method of [
  "goToDefinition",
  "findReferences",
  "hover",
  "documentSymbol",
  "workspaceSymbol",
  "goToImplementation",
  "prepareCallHierarchy",
  "incomingCalls",
  "outgoingCalls",
  "goToTypeDefinition",
  "completion",
])
  for (const response of [
    null,
    [],
    location,
    [location],
    { contents: "plain" },
    {
      contents: { kind: "markdown", value: "markdown" },
      range: location.range,
    },
    { contents: ["first", "second"] },
    { contents: [{ language: "ts", value: "first" }, "second"] },
    { items: ["completion"] },
  ]) {
    async function probe(native: boolean) {
      const events: any[] = [],
        client: any = native ? new (NativeClient())() : new LSPClientImpl();
      client.ensureDocumentOpened = async (...args: any[]) =>
        events.push(["open", ...args]);
      client.connection = {
        sendRequest: async (...args: any[]) => {
          events.push(args);
          return response;
        },
      };
      return {
        result: await outcome(() =>
          client[method](location.uri, { line: 1, character: 3 }),
        ),
        events,
      };
    }
    equal(await probe(false), await probe(true));
  }
function logger(events: any[]) {
  return Object.fromEntries(
    ["setContext", "debug", "info", "warn", "error", "log"].map((method) => [
      method,
      (...args: any[]) => events.push([method, ...args]),
    ]),
  );
}
for (const root of [undefined, "/explicit"])
  for (const workspace of [
    {},
    { workspaceFolders: [] },
    { workspaceFolders: [{ uri: { fsPath: "/folder" } }] },
  ]) {
    function probe(native: boolean) {
      const client = native
        ? Object.assign(
            new (NativeClient({
              nW: { PathUtils: { getWorkDir: () => "/fallback" } },
            }))(),
            { workspace },
          )
        : new LSPClientImpl(undefined, workspace, () => "/fallback");
      client.init(
        {
          command: "server",
          extensionToLanguage: { ".ts": "ts" },
          ...(root ? { workspaceFolder: root } : {}),
        },
        "outer",
      );
      return {
        root: client.workspaceRoot,
        languageId: client.languageId,
        config: client.config,
      };
    }
    equal(probe(false), probe(true));
  }
// Initialize request and all inbound handler maps are tested without a server.
for (const settings of [
  undefined,
  {},
  { section: false, truthy: { enabled: true } },
]) {
  async function probe(native: boolean) {
    const events: any[] = [],
      log = logger(events),
      requests = new Map<string, any>(),
      notifications = new Map<string, any>(),
      client = native
        ? Object.assign(new (NativeClient({ process: { pid: 42 } }))(), {
            logger: log,
          })
        : new LSPClientImpl(log as any, {}, () => "/workspace", {
            process: { ...process, pid: 42 },
          });
    client.config = {
      command: "server",
      extensionToLanguage: { ".ts": "ts" },
      ...(settings ? { settings } : {}),
    };
    client.workspaceRoot = "/workspace";
    client.connection = {
      sendRequest: async (...args: any[]) => {
        events.push(args);
        return { capabilities: { fixture: true } };
      },
      sendNotification: async (...args: any[]) => events.push(args),
      onRequest: (method: string, callback: any) =>
        requests.set(method, callback),
      onNotification: (method: string, callback: any) =>
        notifications.set(method, callback),
    };
    await client.sendInitializeRequest();
    client.setupMessageHandlers();
    const results = [];
    for (const params of [
      {},
      { items: [] },
      {
        items: [
          { section: "section" },
          { section: "truthy" },
          {},
          { section: "missing" },
        ],
      },
    ])
      results.push(await requests.get("workspace/configuration")(params));
    for (const method of [
      "window/workDoneProgress/create",
      "client/registerCapability",
    ])
      results.push(await requests.get(method)({ raw: true }));
    for (const type of [0, 1, 2, 3, 4, 5]) {
      notifications.get("window/logMessage")({ type, message: "message" });
      notifications.get("window/showMessage")({ type, message: "message" });
    }
    notifications.get("textDocument/publishDiagnostics")({
      uri: location.uri,
      diagnostics: [1, 2],
    });
    return { events, results, notifications: [...notifications.keys()] };
  }
  equal(await probe(false), await probe(true));
}
// Native resolveCommand, Windows command choice/filter/fallback, no commands executed.
const commandStart = source.indexOf("function resolveCommand(", 11969000),
  commandEnd = source.indexOf("let cc=class", commandStart);
for (const platform of ["darwin", "win32"])
  for (const command of ["server", "server.cmd", "/absolute/server"])
    for (const mode of ["plain", "throw", "filtered", "fallback"]) {
      function probe(native: boolean) {
        const calls: any[] = [],
          exec = (text: string, opts: any) => {
            calls.push([text, opts]);
            if (
              mode === "throw" ||
              (mode === "fallback" && !text.endsWith(".bat"))
            )
              throw Error("not found");
            return mode === "filtered"
              ? "C:\\powershell.exe\n管理员\nnot-a-path\n"
              : "C:\\bin\\server.exe\r\nC:\\bin\\server.cmd\n";
          },
          proc = { platform },
          runtime: any = { process: proc, execSync: exec },
          fn = native
            ? evaluate(
                `(()=>{${source.slice(commandStart, commandEnd)}return resolveCommand})()`,
                { n4: path, af: { execSync: exec }, process: proc },
              )
            : (value: string) => resolveLSPCommand(value, runtime);
        return { result: fn(command), calls };
      }
      equal(probe(false), probe(true));
    }
// PathUtils method bodies retain the original @ existence/URI/absolute quirks.
const pathStart = source.indexOf("static resolveFilePathToWorkDir(", 13335000),
  pathEnd = source.indexOf("static getCompressedWorkDir(", pathStart);
for (const platform of ["darwin", "win32"])
  for (const exists of [true, false])
    for (const file of [
      "a.ts",
      "a\\b.ts",
      "@a.ts",
      "file:///tmp/has%20space.ts",
      "file:relative.ts",
      "~/a.ts",
      "/c/foo",
      "",
    ]) {
      const access = () => {
          if (!exists) throw Error("missing");
        },
        NativePath = evaluate(
          `(class PathUtils {static getWorkDir(){return '/workspace'}${source.slice(pathStart, pathEnd)}})`,
          {
            ef: path,
            em: () => path,
            eh: { homedir: () => "/home/fixture" },
            ep: { accessSync: access },
            process: { platform },
          },
        );
      equal(
        resolveLSPFilePath(file, "/workspace", {
          platform: platform as any,
          accessSync: access,
          homedir: () => "/home/fixture",
        }),
        NativePath.resolveFilePathToWorkDir(file),
      );
    }
function manager(
  native: boolean,
  events: any[],
  provider: any,
  create: () => any,
  timer: any = setTimeout,
): any {
  const log = logger(events);
  if (!native)
    return new LSPManagerImpl(create, provider, log as any, {
      setTimeout: timer,
      process,
    });
  const Native = evaluate(`(${source.slice(11983089, 11990110)})`, {
    n4: path,
    l9: { LSPServerStatus, LSPClient: "client" },
    nk: { ContainerUtil: { get: create } },
    setTimeout: timer,
    process: { on: () => {} },
  });
  return Object.assign(new Native(), { logger: log, pluginManager: provider });
}
for (const config of [
  {},
  { command: "s" },
  { command: "s", extensionToLanguage: {} },
  { command: "s", extensionToLanguage: { ".TS": "ignored" } },
  { command: "s", extensionToLanguage: { ".ts": "ts" }, eager: true },
])
  for (const replacement of [false, true]) {
    async function probe(native: boolean) {
      const events: any[] = [],
        m = manager(
          native,
          events,
          { getActivePlugins: async () => [] },
          () => ({
            init: (...args: any[]) => events.push(["init", ...args]),
            initialize: async () => events.push(["initialize"]),
            isRunning: () => true,
          }),
        );
      m.registerServers({ language: config }, "first", "market");
      if (replacement)
        m.registerServers(
          {
            language: { command: "new", extensionToLanguage: { ".js": "js" } },
          },
          "second",
          "market",
        );
      await m.drainStartingServers();
      return {
        events,
        configs: m.languageConfigs,
        mappings: m.extensionToLanguage,
      };
    }
    equal(await probe(false), await probe(true));
  }
for (const maxRestarts of [undefined, 0, -1, 1, 3])
  for (const restartOnCrash of [undefined, false, true])
    for (const count of [0, 1, 2, 3, 4]) {
      const server: any = {
        config: { maxRestarts, restartOnCrash },
        restartCount: count,
      };
      equal(
        new LSPManagerImpl(() => ({}) as any).shouldRestart(server),
        manager(true, [], {}, () => ({})).shouldRestart(server),
      );
    }
for (const failures of [0, 1, 4])
  for (const mode of ["lazy", "background", "warmup"]) {
    async function probe(native: boolean) {
      const events: any[] = [];
      let starts = 0,
        running = false;
      const client = {
          init: (...args: any[]) => events.push(["init", ...args]),
          initialize: async () => {
            starts++;
            events.push(["start", starts]);
            if (starts <= failures) throw Error("start failed");
            running = true;
          },
          isRunning: () => running,
          shutdown: async () => {
            events.push(["shutdown"]);
            running = false;
          },
        },
        timer = ((callback: () => void, ms: number) => {
          events.push(["timer", ms]);
          queueMicrotask(callback);
          return 1;
        }) as any,
        m = manager(
          native,
          events,
          { getActivePlugins: async () => [] },
          () => client,
          timer,
        );
      m.registerServers(
        {
          ts: {
            command: "server",
            extensionToLanguage: { ".ts": "ignored" },
            maxRestarts: 2,
          },
        },
        "p",
        "m",
      );
      let result: any;
      if (mode === "lazy")
        result = await outcome(() => m.getClientForFile("a.TS"));
      if (mode === "background") {
        m.startServerInBackground(m.getServerInstance("ts"));
        for (let i = 0; i < 50; i++) await Promise.resolve();
      }
      if (mode === "warmup")
        result = await outcome(() => m.warmup(["missing", "ts"]));
      const state = {
        status: m.getServerInstance("ts").status,
        restartCount: m.getServerInstance("ts").restartCount,
        isRunning: m.isServerRunning("ts"),
      };
      await m.shutdownAll();
      return { result, state, events, size: m.languageConfigs.size, starts };
    }
    equal(await probe(false), await probe(true));
  }
// Stdio startup clock/Windows spawn projection and cleanup are compared with no OS process.
for (const platform of ["darwin", "win32"])
  for (const command of [
    "server",
    "C:\\With Space\\server.exe",
    "server.cmd",
  ]) {
    async function probe(native: boolean) {
      const events: any[] = [],
        log = logger(events),
        timers: any[] = [],
        timer = ((fn: any, ms: number) => {
          const job = { fn, ms, active: true };
          timers.push(job);
          return job;
        }) as any,
        clear = ((job: any) => {
          job.active = false;
        }) as any,
        proc: any = {
          platform,
          pid: 42,
          env: { PATH: "fixture", NODE_OPTIONS: "unsafe" },
        },
        child: any = new EventEmitter();
      Object.assign(child, {
        stdin: new PassThrough(),
        stdout: new PassThrough(),
        stderr: new PassThrough(),
        pid: 123,
        exitCode: null,
        kill: (...args: any[]) => {
          events.push(["kill", ...args]);
          return true;
        },
      });
      const spawn = (...args: any[]) => {
          events.push(["spawn", ...args]);
          return child;
        },
        exec = () => "",
        connection: any = {
          onRequest() {},
          onNotification() {},
          onError() {},
          onClose() {},
          listen: () => events.push(["listen"]),
          dispose: () => events.push(["dispose"]),
        },
        create = () => connection;
      const client = native
        ? Object.assign(
            new (NativeClient({
              af: { spawn, execSync: exec },
              process: proc,
              co: { StreamMessageReader, StreamMessageWriter },
              l7: { createMessageConnection: create },
              resolveCommand: (value: string) => value,
              cl: 30000,
              setTimeout: timer,
              clearTimeout: clear,
            }))(),
            { logger: log },
          )
        : new LSPClientImpl(log as any, {}, () => "/workspace", {
            spawn: spawn as any,
            execSync: exec as any,
            process: proc,
            createMessageConnection: create as any,
            setTimeout: timer,
            clearTimeout: clear,
          });
      client.config = {
        command,
        args: ["--stdio"],
        env: { FIXTURE: "yes", NODE_OPTIONS: "also unsafe" },
        extensionToLanguage: { ".ts": "ts" },
      };
      client.languageId = "ts";
      client.workspaceRoot = "/workspace";
      const pending = client.startServerStdio();
      for (let i = 0; i < 8; i++) await Promise.resolve();
      const first = timers.find((job) => job.active && job.ms === 500);
      first.fn();
      first.active = false;
      for (let i = 0; i < 8; i++) await Promise.resolve();
      const ready = timers.find((job) => job.active && job.ms === 1000);
      ready.fn();
      ready.active = false;
      await pending;
      await client.cleanup();
      return {
        events,
        timers: timers.map(({ ms, active }) => ({ ms, active })),
        processCleared: client.process === undefined,
        connectionCleared: client.connection === undefined,
      };
    }
    equal(await probe(false), await probe(true));
  }
for (const connected of [false, true])
  for (const timeout of [undefined, 0, 5])
    for (const response of ["success", "reject", "hang"]) {
      async function probe(native: boolean) {
        const events: any[] = [],
          timers: any[] = [],
          log = logger(events),
          timer = ((callback: any, ms: number) => {
            events.push(["timer", ms]);
            timers.push(callback);
            return 1;
          }) as any;
        const client = native
          ? Object.assign(
              new (NativeClient({
                process: { platform: "darwin" },
                setTimeout: timer,
              }))(),
              { logger: log },
            )
          : new LSPClientImpl(log as any, {}, undefined, { setTimeout: timer });
        client.config = { shutdownTimeout: timeout };
        client.languageId = "ts";
        client.isInitialized = true;
        client.openedDocuments.add("uri");
        client.process = {
          pid: 123,
          kill: (...args: any[]) => events.push(["kill", ...args]),
        };
        if (connected)
          client.connection = {
            sendRequest: async (...args: any[]) => {
              events.push(args);
              if (response === "reject") throw Error("shutdown rejected");
              if (response === "hang") return new Promise(() => {});
              return null;
            },
            sendNotification: async (...args: any[]) => events.push(args),
            dispose: () => events.push(["dispose"]),
          };
        const pending = client.shutdown();
        if (response === "hang" && connected) timers[0]();
        await pending;
        return {
          events,
          initialized: client.isInitialized,
          opened: [...client.openedDocuments],
          processCleared: client.process === undefined,
          connectionCleared: client.connection === undefined,
        };
      }
      equal(await probe(false), await probe(true));
    }
for (const connected of [false, true])
  for (const alreadyOpened of [false, true])
    for (const readFailure of [false, true]) {
      async function probe(native: boolean) {
        const events: any[] = [],
          read = async (...args: any[]) => {
            events.push(["read", ...args]);
            if (readFailure) throw Error("read failed");
            return "document";
          },
          client = native
            ? new (NativeClient({ lp: { readFile: read } }))()
            : new LSPClientImpl(undefined, {}, undefined, {
                readFile: read as any,
              });
        client.languageId = "outer";
        if (connected)
          client.connection = {
            sendNotification: async (...args: any[]) => events.push(args),
          };
        if (alreadyOpened) client.openedDocuments.add(location.uri);
        const first = await outcome(() =>
            client.ensureDocumentOpened(location.uri),
          ),
          second = await outcome(() =>
            client.ensureDocumentOpened(location.uri),
          );
        return { first, second, events, opened: [...client.openedDocuments] };
      }
      equal(await probe(false), await probe(true));
    }
equal(LSPSymbolKind.Function, 12);
console.log(
  `LSP differential verification passed: ${comparisons} comparisons; captured bundle SHA-256 verified.`,
);

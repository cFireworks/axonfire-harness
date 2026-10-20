import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { URI } from "vscode-uri";
import { Usage, setTraceProcessors, type Model } from "@openai/agents-core";
import { LSPClientImpl, resolveLSPCommand } from "../src/lsp/lsp-client.js";
import { LSPManagerImpl } from "../src/lsp/lsp-manager.js";
import {
  LSPServerStatus,
  noopLSPLogger,
  type LSPServerConfig,
} from "../src/lsp/lsp-types.js";
import { resolveLSPFilePath } from "../src/lsp/lsp-path.js";
import {
  LSPTool,
  lspParameters,
  lspJsonSchema,
} from "../src/tools/lsp-tool.js";
import { createHarness } from "../src/runtime/create-harness.js";
setTraceProcessors([]);
const fixturePath = fileURLToPath(
  new URL(
    import.meta.url.endsWith(".ts")
      ? "./fixtures/lsp-server.mjs"
      : "../../test/fixtures/lsp-server.mjs",
    import.meta.url,
  ),
);
test(
  "running-client crash leaves manager status running until next lazy acquisition restarts it",
  { timeout: 10000 },
  async (t) => {
    const { root, cleanup } = await directory(t),
      clients: LSPClientImpl[] = [];
    const manager = new LSPManagerImpl(() => {
      const client = new LSPClientImpl(undefined, {}, () => root);
      clients.push(client);
      return client;
    });
    t.after(async () => {
      await manager.shutdownAll();
      await Promise.all(clients.map((client) => client.cleanup()));
      await cleanup();
    });
    manager.registerServers({ ts: config(root) }, "p", "m");
    const first = (await manager.getClientForFile(
        join(root, "a.ts"),
      )) as LSPClientImpl,
      pid = first.process!.pid!;
    first.process!.kill("SIGTERM");
    await until(() => !first.isRunning());
    assert.equal(
      manager.getServerInstance("ts")!.status,
      LSPServerStatus.Running,
    );
    assert.equal(manager.isServerRunning("ts"), false);
    const second = (await manager.getClientForFile(
      join(root, "a.ts"),
    )) as LSPClientImpl;
    assert.notEqual(second, first);
    assert.notEqual(second.process!.pid, pid);
    assert.equal(manager.isServerRunning("ts"), true);
  },
);
test(
  "startupTimeout runs after the 500ms spawn gate and may fail before initialize",
  { timeout: 10000 },
  async (t) => {
    const { root, cleanup } = await directory(t),
      client = new LSPClientImpl(undefined, {}, () => root);
    t.after(async () => {
      await client.cleanup();
      await cleanup();
    });
    client.init({ ...config(root), startupTimeout: 5 }, "ts");
    await assert.rejects(
      client.initialize(),
      /LSP server startup timeout after 5ms/,
    );
    assert.equal(client.connection, undefined);
    assert.equal(client.isRunning(), false);
    assert.equal((await logs(root)).length, 0);
  },
);
test(
  "successful shutdown disposes a pending unbounded request without waiting for its response",
  { timeout: 10000 },
  async (t) => {
    const { root, cleanup } = await directory(t),
      client = new LSPClientImpl(undefined, {}, () => root),
      file = join(root, "a.ts");
    t.after(async () => {
      await client.cleanup();
      await cleanup();
    });
    await writeFile(file, "fixture");
    client.init(config(root, "hang-request"), "ts");
    await client.initialize();
    const pending = client
      .hover(URI.file(file).toString(), { line: 0, character: 0 })
      .then(
        () => "unexpected",
        () => "disposed",
      );
    await until(async () =>
      (await logs(root)).some((event) => event.method === "textDocument/hover"),
    );
    await client.shutdown();
    assert.equal(await pending, "disposed");
    assert.equal(client.isRunning(), false);
  },
);
async function directory(t: { after(fn: () => any): void }) {
  const root = await mkdtemp(join(tmpdir(), "harness-lsp-"));
  return { root, cleanup: () => rm(root, { recursive: true, force: true }) };
}
const config = (root: string, mode = "normal"): LSPServerConfig => ({
  command: process.execPath,
  args: [fixturePath, join(root, "server.jsonl"), mode],
  extensionToLanguage: { ".ts": "ignored-inner-language" },
  settings: { fixture: { enabled: true } },
  shutdownTimeout: 30,
});
async function logs(root: string) {
  try {
    return (await readFile(join(root, "server.jsonl"), "utf8"))
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  } catch {
    return [];
  }
}
async function until(
  predicate: () => boolean | Promise<boolean>,
  timeout = 7000,
) {
  const end = Date.now() + timeout;
  while (!(await predicate())) {
    if (Date.now() > end) throw new Error("LSP fixture condition timed out");
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}
function fakeClient(initializer: () => Promise<void> = async () => {}) {
  return {
    init() {},
    initialize: initializer,
    isRunning: () => true,
    shutdown: async () => {},
  } as any;
}
test("LSP schema keeps coercion, integer minimum, all-operation coordinates and JSON metadata", () => {
  assert.deepEqual(
    lspParameters.parse({
      operation: "hover",
      filePath: "",
      line: "1",
      character: true,
      extra: 1,
    }),
    { operation: "hover", filePath: "", line: 1, character: 1 },
  );
  for (const value of [0, -1, 1.5, "bad"])
    assert.equal(
      lspParameters.safeParse({
        operation: "workspaceSymbol",
        filePath: "x",
        line: value,
        character: 1,
      }).success,
      false,
    );
  assert.equal(
    lspParameters.safeParse({ operation: "documentSymbol", filePath: "x" })
      .success,
    false,
  );
  assert.deepEqual((lspJsonSchema as any).required, [
    "operation",
    "filePath",
    "line",
    "character",
  ]);
});
test("LSP paths preserve file-prefix stripping without URI decoding, backslashes and @ existence", async (t) => {
  const { root, cleanup } = await directory(t);
  t.after(cleanup);
  await writeFile(join(root, "@file.ts"), "literal-at");
  assert.equal(resolveLSPFilePath("@file.ts", root), join(root, "@file.ts"));
  assert.equal(
    resolveLSPFilePath("@missing.ts", root),
    join(root, "missing.ts"),
  );
  assert.equal(resolveLSPFilePath("a\\b.ts", root), join(root, "a/b.ts"));
  assert.equal(
    resolveLSPFilePath("file:///tmp/has%20space.ts", root),
    "/tmp/has%20space.ts",
  );
  assert.equal(
    resolveLSPCommand("server", {
      process: { ...process, platform: "linux" },
      execSync: (() => {
        throw new Error("must not resolve Unix command");
      }) as any,
    }),
    "server",
  );
});
test("manager lowercases extension keys but ignores language values and preserves stale mappings on overwrite", async () => {
  const manager = new LSPManagerImpl(() => fakeClient());
  manager.registerServers(
    {
      outer: { command: "server", extensionToLanguage: { ".TS": "different" } },
    },
    "one",
    "market",
  );
  manager.registerServers(
    { outer: { command: "new", extensionToLanguage: { ".js": "js" } } },
    "two",
    "market",
  );
  assert.equal(manager.extensionToLanguage.get(".ts"), "outer");
  assert.equal(manager.extensionToLanguage.get(".js"), "outer");
  assert.equal(
    await manager.getClientForFile("fixture.TS"),
    manager.getServerInstance("outer")!.client,
  );
  assert.equal(await manager.getClientForFile("no-extension"), null);
  await manager.shutdownAll();
});
test("invalid configs log/continue; maxRestarts zero means three and warmup starts only stopped entries", async () => {
  const errors: string[] = [],
    manager = new LSPManagerImpl(() => fakeClient(), undefined, {
      ...noopLSPLogger,
      error: (value) => errors.push(value),
    });
  manager.registerServers(
    {
      broken: {} as any,
      valid: {
        command: "server",
        extensionToLanguage: { ".ts": "ts" },
        maxRestarts: 0,
      },
    },
    "plugin",
    "market",
  );
  assert.equal(errors.length, 1);
  assert.deepEqual(manager.getRegisteredLanguages(), ["valid"]);
  const server = manager.getServerInstance("valid")!;
  server.restartCount = 2;
  assert.equal(manager.shouldRestart(server), true);
  server.restartCount = 3;
  assert.equal(manager.shouldRestart(server), false);
  await manager.warmup(["valid", "missing"]);
  assert.equal(server.status, LSPServerStatus.Running);
  server.status = LSPServerStatus.Crashed;
  await manager.warmup();
  assert.equal(server.status, LSPServerStatus.Crashed);
  await manager.shutdownAll();
});
test("concurrent lazy starts coalesce and drain waits for a real pending initialization", async () => {
  let release!: () => void,
    starts = 0;
  const manager = new LSPManagerImpl(() => {
    starts++;
    return fakeClient(
      () =>
        new Promise<void>((resolve) => {
          release = resolve;
        }),
    );
  });
  manager.registerServers(
    { ts: { command: "server", extensionToLanguage: { ".ts": "ts" } } },
    "p",
    "m",
  );
  const first = manager.getClientForFile("a.ts"),
    second = manager.getClientForFile("b.ts");
  let drained = false;
  const drain = manager.drainStartingServers().then(() => {
    drained = true;
  });
  await Promise.resolve();
  assert.equal(drained, false);
  assert.equal(starts, 1);
  release();
  assert.equal(await first, await second);
  await drain;
  assert.equal(manager.startingServers.size, 0);
  await manager.shutdownAll();
});
test("plugin reload operations serialize and recover after a failed provider load", async () => {
  let calls = 0;
  const manager = new LSPManagerImpl(() => fakeClient(), {
    async getActivePlugins() {
      calls++;
      if (calls === 2) throw new Error("provider failure");
      return [
        {
          plugin: { name: "p", marketplaceName: "m" },
          components: {
            lspServers: {
              ts: { command: "server", extensionToLanguage: { ".ts": "ts" } },
            },
          },
        },
      ];
    },
  });
  await manager.ensurePluginsLoaded();
  await manager.ensurePluginsLoaded();
  assert.equal(calls, 1);
  const failure = manager.reloadPluginServers(),
    success = manager.reloadPluginServers();
  await assert.rejects(failure, /provider failure/);
  await success;
  assert.equal(calls, 3);
  assert.equal(manager.hasLoadedPlugins, true);
  assert.deepEqual(manager.getRegisteredLanguages(), ["ts"]);
  await manager.shutdownAll();
});
test("client normalization preserves dropped LocationLink arrays and first hover item", async () => {
  const client = new LSPClientImpl(),
    range = {
      start: { line: 0, character: 0 },
      end: { line: 1, character: 0 },
    };
  assert.deepEqual(
    client.normalizeLocations([
      { targetUri: "file:///a.ts", targetRange: range },
    ]),
    [],
  );
  const location = { uri: "file:///a.ts", range };
  assert.deepEqual(client.normalizeLocations(location), [location]);
  client.ensureDocumentOpened = async () => {};
  client.connection = {
    sendRequest: async () => ({
      contents: [{ kind: "markdown", value: "first" }, "second"],
    }),
  } as any;
  assert.deepEqual(
    await client.hover("file:///a.ts", { line: 0, character: 0 }),
    { contents: { language: "plaintext", value: "first" }, range: undefined },
  );
});
test("tool keeps 50-item truncation, top-level symbols and only first prepared hierarchy item", async () => {
  const uri = URI.file("/tmp/fixture.ts").toString(),
    range = { start: { line: 2, character: 3 } },
    item = { uri, range, name: "Symbol", kind: 12 },
    values = Array.from({ length: 51 }, () => item),
    calls: any[] = [];
  const client: any = {
    findReferences: async () => values,
    documentSymbol: async () => [
      {
        ...item,
        detail: "function",
        children: [{ ...item, name: "hidden-child" }],
      },
    ],
    prepareCallHierarchy: async () => [item, { ...item, name: "ignored" }],
    incomingCalls: async (value: any) => {
      calls.push(value);
      return [{ from: item }];
    },
  };
  const tool = new LSPTool({ getClientForFile: async () => client });
  const references = await tool.findReferences(client, uri, {
    line: 0,
    character: 0,
  });
  assert.match(references.content, /showing 50 of 51 references/);
  assert.equal(references.content.split("/tmp/fixture.ts").length - 1, 50);
  assert.doesNotMatch(
    (await tool.documentSymbol(client, uri)).content,
    /hidden-child/,
  );
  await tool.callHierarchy(client, uri, { line: 0, character: 0 }, "incoming");
  assert.deepEqual(calls, [item]);
});
test(
  "real stdio client initializes with exact capabilities, serves server requests and opens each URI only once",
  { timeout: 10000 },
  async (t) => {
    const { root, cleanup } = await directory(t),
      client = new LSPClientImpl(undefined, {}, () => root),
      file = join(root, "fixture.ts"),
      uri = URI.file(file).toString();
    t.after(async () => {
      await client.cleanup();
      await cleanup();
    });
    await writeFile(file, "original contents");
    client.init(config(root), "outer-language");
    await client.initialize();
    assert.equal(client.isRunning(), true);
    const pid = client.process!.pid!;
    const position = { line: 0, character: 1 };
    assert.equal((await client.findReferences(uri, position)).length, 2);
    assert.deepEqual(await client.workspaceSymbol(""), []);
    assert.equal((await client.goToImplementation(uri, position)).length, 1);
    const hierarchy = await client.prepareCallHierarchy(uri, position);
    assert.equal(hierarchy.length, 2);
    assert.equal((await client.incomingCalls(hierarchy[0])).length, 1);
    assert.equal((await client.outgoingCalls(hierarchy[0])).length, 1);
    assert.equal((await client.goToTypeDefinition(uri, position)).length, 1);
    assert.equal(
      (await client.hover(uri, { line: 0, character: 2 })).contents,
      "first hover",
    );
    await writeFile(file, "modified contents");
    await client.documentSymbol(uri);
    assert.equal(
      (await client.goToDefinition(uri, { line: 1, character: 3 })).length,
      1,
    );
    assert.equal(
      (await client.completion(uri, { line: 0, character: 0 }))[0].label,
      "fixture-completion",
    );
    await client.shutdown();
    await until(() => {
      try {
        process.kill(pid, 0);
        return false;
      } catch {
        return true;
      }
    });
    const events = await logs(root),
      initialized = events.find(
        (event) => event.method === "initialize",
      ).params;
    assert.deepEqual(initialized.clientInfo, {
      name: "genie-agent-cli",
      version: "1.0.0",
    });
    assert.equal(initialized.rootUri, URI.file(root).toString());
    assert.equal(initialized.capabilities.workspace.applyEdit, false);
    assert.deepEqual(
      events.find((event) => event.method === "configuration-result").params,
      [{ enabled: true }, {}],
    );
    const opens = events.filter(
      (event) => event.method === "textDocument/didOpen",
    );
    assert.equal(opens.length, 1);
    assert.equal(opens[0].params.textDocument.text, "original contents");
    assert.equal(opens[0].params.textDocument.languageId, "outer-language");
    assert.ok(events.some((event) => event.method === "shutdown"));
    assert.equal(client.openedDocuments.size, 0);
  },
);
test("real missing executable/unsupported transport return native errors and cleanup state", async () => {
  const client = new LSPClientImpl();
  client.init(
    {
      command: "/definitely-not-a-workbuddy-harness-language-server",
      extensionToLanguage: { ".ts": "ts" },
    },
    "ts",
  );
  await assert.rejects(client.initialize(), /Executable not found in PATH/);
  assert.equal(client.isRunning(), false);
  assert.equal(client.process?.pid, undefined); // Native cleanup retains a failed spawn object without a PID.
  client.init(
    {
      command: "unused",
      transport: "socket",
      extensionToLanguage: { ".ts": "ts" },
    },
    "ts",
  );
  await assert.rejects(client.initialize(), /Unsupported transport: socket/);
});
test(
  "explicit SDK LSP tool performs actual stdio RPC and preserves original Agent allowlists",
  { timeout: 10000 },
  async (t) => {
    const { root, cleanup } = await directory(t);
    await writeFile(join(root, "fixture.ts"), "const fixture = 1;");
    const requests: any[] = [];
    let count = 0;
    const model: Model = {
      getResponse: async () => ({ output: [], usage: new Usage() }),
      async *getStreamedResponse(request) {
        requests.push(request);
        count++;
        const output =
          count === 1
            ? [
                {
                  type: "function_call",
                  id: "lsp-call",
                  callId: "lsp-call",
                  name: "LSP",
                  status: "completed",
                  arguments: JSON.stringify({
                    operation: "hover",
                    filePath: "fixture.ts",
                    line: "2",
                    character: "4",
                  }),
                },
              ]
            : [
                {
                  type: "message",
                  id: "answer",
                  role: "assistant",
                  status: "completed",
                  content: [{ type: "output_text", text: "lsp complete" }],
                },
              ];
        yield { type: "response_started" };
        if (count > 1)
          yield { type: "output_text_delta", delta: "lsp complete" };
        yield {
          type: "response_done",
          response: {
            id: `r-${count}`,
            output,
            usage: { inputTokens: 10, outputTokens: 2, totalTokens: 12 },
          },
        } as any;
      },
    };
    const h = await createHarness({
      workDir: root,
      modelProvider: { getModel: () => model },
      approveTool: () => true,
      lsp: { servers: { ts: config(root) } },
    });
    t.after(async () => {
      await h.close();
      await cleanup();
    });
    assert.ok(
      h.product.raw.agents.every((agent) => !agent.tools?.includes("LSP")),
    );
    const agent = await h.agents.getDefault();
    assert.equal(
      agent.tools.some((tool: any) => tool.name === "LSP"),
      false,
    );
    // Explicit SDK registration only; no product configuration mutation.
    const originalRefresh = h.agents.ensureAgentToolsFreshForRun.bind(h.agents);
    h.agents.ensureAgentToolsFreshForRun = async (...args) => {
      await originalRefresh(...args);
      const value = (await h.agents.get(args[0]))!;
      value.tools.push(
        ...(await h.tools.buildTools(["LSP"], h.product.defaultAgent)),
      );
    };
    const session = await h.openSession();
    assert.equal(await h.prompt(session, "inspect fixture"), "lsp complete");
    assert.match(JSON.stringify(requests[1].input), /first hover/);
    const events = await logs(root);
    assert.deepEqual(
      events.find((event) => event.method === "textDocument/hover").params
        .position,
      { line: 1, character: 3 },
    );
    assert.equal((h.tools as any).handlers.size, 47);
  },
);
test("standalone LSP guard denies before process creation and no server is implicitly discovered", async (t) => {
  const { root, cleanup } = await directory(t),
    h = await createHarness({
      workDir: root,
      modelProvider: {
        getModel() {
          throw new Error("unused");
        },
      },
      lsp: { servers: { ts: config(root) } },
    });
  t.after(async () => {
    await h.close();
    await cleanup();
  });
  const session = await h.openSession();
  await assert.rejects(
    Promise.resolve(
      (await h.tools.get("LSP"))!.execute(
        { operation: "hover", filePath: "fixture.ts", line: 1, character: 1 },
        { context: session },
      ),
    ),
    /Tool permission denied/,
  );
  assert.equal((await logs(root)).length, 0);
  assert.equal(
    h.lspManager.getServerInstance("ts")!.status,
    LSPServerStatus.Stopped,
  );
});
test(
  "host close releases a pending initialize and cleans its owned language process",
  { timeout: 10000 },
  async (t) => {
    const { root, cleanup } = await directory(t),
      h = await createHarness({
        workDir: root,
        modelProvider: {
          getModel() {
            throw new Error("unused");
          },
        },
        approveTool: () => true,
        lsp: { servers: { ts: config(root, "hang-initialize") } },
      });
    t.after(async () => {
      await h.close();
      await cleanup();
    });
    const pending = h.lspManager
      .getClientForFile(join(root, "fixture.ts"))
      .catch(() => null);
    await until(async () =>
      (await logs(root)).some((event) => event.method === "initialize"),
    );
    const pid = (await logs(root))[0].pid;
    await h.close();
    await pending;
    await until(() => {
      try {
        process.kill(pid, 0);
        return false;
      } catch {
        return true;
      }
    });
    assert.equal(h.lspManager.getRegisteredLanguages().length, 0);
  },
);

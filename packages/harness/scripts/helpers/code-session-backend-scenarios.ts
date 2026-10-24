import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
type Factory = (runtime?: any) => any;
async function owned(
  f: Factory,
  run: (api: any, root: string) => Promise<void>,
) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "axon-code-backend-"));
  const logger = { info() {}, warn() {}, error() {} };
  try {
    const api = f({
      console: logger,
      os: { ...os, homedir: () => root, tmpdir: () => root },
    });
    await run(api, root);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}
export const codeSessionBackendScenarios: [
  string,
  (f: Factory) => Promise<void>,
][] = [
  [
    "complete backend replaces duplicate owners without killing their runtime",
    (f) =>
      owned(f, async (api, root) => {
        let disconnected = 0,
          killed = 0;
        const def = new api.CodeBuddyCodeBackend({
          killSession: async () => killed++,
        });
        const first = def.create({ sessionId: "owned", cwd: root });
        first.client = {
          disconnect: async () => {
            disconnected++;
          },
        };
        first.runtimeStarted = true;
        first.runtimeEverStarted = true;
        const next = def.create({ sessionId: "owned", cwd: root });
        await def.awaitOrphanCleanup();
        assert.equal(disconnected, 1);
        assert.equal(killed, 0);
        assert.equal(first.runtimeStarted, false);
        assert.equal(first.runtimeEverStarted, true);
        assert.equal(def.activeSessions.size, 1);
        assert.ok(def.activeSessions.has(next));
        await first.destroy();
        assert.equal(killed, 1);
        assert.ok(def.activeSessions.has(next));
        await next.destroy();
        assert.equal(def.activeSessions.size, 0);
      }),
  ],
  [
    "global soft reset preserves owners, initialization request and advances epoch",
    (f) =>
      owned(f, async (api, root) => {
        const killed: string[] = [];
        const def = new api.CodeBuddyCodeBackend({
          killSession: async (id: string) => killed.push(id),
        });
        const s = def.create({ sessionId: "owned", cwd: root });
        const request = { kind: "new", request: { cwd: root } };
        s.initializeRequest = request;
        s.runtimeStarted = true;
        s.runtimeEverStarted = true;
        s.client = { disconnect: async () => {} };
        await def.resetActiveSessions("auth");
        assert.equal(s.resetEpoch, 1);
        assert.equal(s.initializeRequest, request);
        assert.equal(s.destroyed, false);
        assert.equal(s.runtimeEverStarted, false);
        assert.deepEqual(killed, ["owned"]);
        assert.ok(def.activeSessions.has(s));
        await s.destroy();
      }),
  ],
  [
    "reinitialization rejects unauthenticated and destroyed sessions before spawn",
    (f) =>
      owned(f, async (api, root) => {
        let spawns = 0;
        const def = new api.CodeBuddyCodeBackend(
          {
            createSession: async () => {
              spawns++;
            },
          },
          { isAuthenticated: () => false },
        );
        const s = def.create({ sessionId: "owned", cwd: root });
        s.initializeRequest = { kind: "new", request: { cwd: root } };
        await assert.rejects(s.ensureInitialized(), /not authenticated/);
        await s.destroy();
        await assert.rejects(s.ensureInitialized(), /destroyed/);
        assert.equal(spawns, 0);
      }),
  ],
  [
    "runtime args retain original tool permissions and addon suppression",
    (f) =>
      owned(f, async (api, root) => {
        const args = api.buildAgentCliRuntimeArgs({
          runtimeConfig: {
            permissionMode: "unknown",
            systemPrompt: "owned",
            tools: "Read",
            sessionSettings: { temperature: 1 },
          },
          cwd: root,
          mcpConfig: '{"mcpServers":{}}',
          language: "en",
        });
        assert.equal(args[1], "bypassPermissions");
        assert.ok(args.includes("Bash(mcporter:*)"));
        assert.ok(args.includes("--strict-mcp-config"));
        assert.deepEqual(JSON.parse(args[args.indexOf("--settings") + 1]), {
          temperature: 1,
          trustedDirectories: [root + "/**"],
          language: "en",
        });
        const config = {
          systemPrompt: "omit",
          tools: "omit",
          addonManifest: {
            expanded: { compose: { cliComposeEnabled: true } },
            addons: {
              systemPrompts: [{ source: "work_mode" }],
              tools: [{ source: "work_mode" }],
            },
          },
        };
        const next = api.buildAgentCliRuntimeArgs({
          runtimeConfig: config,
          cwd: root,
        });
        assert.ok(!next.includes("--system-prompt"));
        assert.ok(!next.includes("--tools"));
      }),
  ],
  [
    "prompt variables restore removed files with original result and cleanup",
    (f) =>
      owned(f, async (api) => {
        const file = api.writeAgentCliPromptVarsFile("owned", { KEY: "value" });
        assert.ok(fs.existsSync(file));
        fs.unlinkSync(file);
        const restored = api.ensureAgentCliPromptVarsFile("owned", file, {
          KEY: "value",
        });
        assert.equal(restored.status, "restored");
        assert.equal(restored.filePath, file);
        assert.deepEqual(JSON.parse(fs.readFileSync(file, "utf8")), {
          version: 1,
          variables: { KEY: "value" },
        });
        api.cleanupAgentCliPromptVarsFile(file);
        assert.equal(fs.existsSync(file), false);
      }),
  ],
  [
    "SSE parser handles split lines, comments and final unterminated event",
    (f) =>
      owned(f, async (api) => {
        const p = new api.SseParser();
        assert.deepEqual(p.feed("event: owned\r\ndata: one\r"), []);
        assert.deepEqual(p.feed("\ndata: two\n\n: comment\ndata: tail"), [
          { event: "owned", data: "one\r\ntwo" },
        ]);
        assert.deepEqual(p.flush(), [{ event: "message", data: "tail" }]);
      }),
  ],
  [
    "audit pairs original MCP call input with completed status and stable hash",
    (f) =>
      owned(f, async (api) => {
        const entries: any[] = [];
        const audit = api.createAuditAcpAdapter({
          store: { append: async (x: any) => entries.push(x) },
          logger: { warn() {} },
          now: () => 123,
        });
        await audit.consume({
          sessionId: "owned",
          update: {
            sessionUpdate: "tool_call",
            toolCallId: "t",
            rawInput: { b: 2, a: 1 },
            _meta: { "codebuddy.ai/toolName": "mcp__server__tool" },
          },
        });
        await audit.consume({
          sessionId: "owned",
          update: {
            sessionUpdate: "tool_call_update",
            toolCallId: "t",
            status: "completed",
          },
        });
        assert.equal(entries.length, 1);
        assert.equal(entries[0].decision, "allowed");
        assert.equal(entries[0].timestamp, 123);
        assert.deepEqual(entries[0].messageParams, {
          serverName: "server",
          toolName: "tool",
        });
        assert.equal(
          entries[0].commandHash,
          api.sha256Hex('mcp__server__tool\n{"a":1,"b":2}'),
        );
      }),
  ],
  [
    "prompt codec and reporter use original closure state",
    (f) =>
      owned(f, async (api) => {
        assert.equal(
          api.promptCodec.extractRuntimePromptText([
            { type: "text", text: "hello" },
          ]),
          "<user_query>hello</user_query>",
        );
        const report = () => {};
        assert.equal(api.reporter.getAegisReporter(), undefined);
        api.reporter.setAegisReporter(report);
        assert.equal(api.reporter.getAegisReporter(), report);
        assert.equal(
          api.readIsBackgroundAutomationMeta({
            "codebuddy.ai": { isBackgroundAutomation: true },
          }),
          true,
        );
      }),
  ],
];

import { createNativeProductRuntime } from "../../src/runtime/native-product-runtime.js";
import { once } from "node:events";
import { inspect } from "node:util";
import assert from "node:assert/strict";
// Runs only as an owned child process: original lifecycle hooks and timers end with the child.
import { mkdtempSync, rmSync, writeFileSync, writeSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRequire } from "node:module";
import { EventEmitter } from "node:events";
import { createNativeDi } from "../../src/di/native-di.js";
import { diRuntime } from "./native-di-scenarios.js";
const realRequire = createRequire(import.meta.url),
  temp = mkdtempSync(join(tmpdir(), "axon-product-probe-")),
  realExit = process.exit.bind(process);
process.chdir(temp);
const toolEvidence = "native-tool-evidence-7294";
writeFileSync(join(temp, "owned.txt"), toolEvidence + "\n");
const modelRequests: { path: string; body: any }[] = [];
const modelServer = realRequire("node:http").createServer(
  async (req: any, res: any) => {
    let body = "";
    for await (const chunk of req) body += chunk;
    modelRequests.push({ path: req.url, body: body ? JSON.parse(body) : null });
    res.writeHead(200, { "content-type": "text/event-stream" });
    const toolTurn = modelRequests.length === 1;
    const chunk = {
      id: "owned-completion",
      object: "chat.completion.chunk",
      created: 1,
      model: "owned-model",
      choices: [
        {
          index: 0,
          delta: toolTurn
            ? {
                role: "assistant",
                tool_calls: [
                  {
                    index: 0,
                    id: "owned-read",
                    type: "function",
                    function: {
                      name: "Read",
                      arguments: JSON.stringify({
                        file_path: join(temp, "owned.txt"),
                      }),
                    },
                  },
                ],
              }
            : { role: "assistant", content: "Native round trip works." },
          finish_reason: null,
        },
      ],
    };
    res.write("data: " + JSON.stringify(chunk) + "\n\n");
    res.end(
      "data: " +
        JSON.stringify({
          ...chunk,
          choices: [
            {
              index: 0,
              delta: {},
              finish_reason: toolTurn ? "tool_calls" : "stop",
            },
          ],
        }) +
        "\n\ndata: [DONE]\n\n",
    );
  },
);
await new Promise<void>((resolve) =>
  modelServer.listen(0, "127.0.0.1", resolve),
);
const modelPort = modelServer.address().port;
const owned: any = new EventEmitter();
Object.setPrototypeOf(owned, process);
Object.assign(owned, {
  env: {
    HOME: temp,
    WORKBUDDY_CONFIG_DIR: temp,
    CODEBUDDY_REMOTE_CONFIG_DISABLED: "true",
    DISABLE_TELEMETRY: "1",
    ACC_PRODUCT_CONFIG_V3: JSON.stringify({
      authentication: {
        type: "custom-token",
        attributes: { token: "owned-token" },
      },
      config: { disabled: true },
      agents: [
        {
          name: "owned-agent",
          tags: ["cli", "default"],
          instructions: "You are a test assistant.",
          tools: ["Read"],
          models: ["owned-model"],
        },
      ],
      models: [
        {
          id: "owned-model",
          name: "owned-model",
          url: `http://127.0.0.1:${modelPort}/v1`,
        },
      ],
    }),
  },
  argv: ["node", "owned", "--serve"],
  cwd: () => temp,
  exit(code: number) {
    throw Error("owned process exit " + code);
  },
});
const allowedPorts = new Set<number>([modelPort]);
const require = (id: string) => {
  if (id === "process" || id === "node:process") return owned;
  const original = realRequire(id);
  if (id === "os" || id === "node:os")
    return { ...original, homedir: () => temp, tmpdir: () => temp };
  if (["child_process", "node:child_process"].includes(id))
    return {
      ...original,
      spawn() {
        throw Error("probe child process boundary");
      },
      exec() {
        throw Error("probe child process boundary");
      },
      execFile() {
        throw Error("probe child process boundary");
      },
      execSync() {
        throw Error("probe child process boundary");
      },
      execFileSync() {
        throw Error("probe child process boundary");
      },
    };
  if (
    ["net", "node:net", "http", "https", "node:http", "node:https"].includes(id)
  )
    return {
      ...original,
      connect() {
        throw Error("probe network boundary");
      },
      createConnection() {
        throw Error("probe network boundary");
      },
      request(...args: any[]) {
        const target = args[0];
        if (
          target?.hostname === "127.0.0.1" &&
          allowedPorts.has(Number(target.port))
        )
          return original.request(...args);
        throw Error("probe network boundary");
      },
      get() {
        throw Error("probe network boundary");
      },
    };
  return original;
};
const di = createNativeDi({ ...diRuntime(), require, process: owned });
const globals = Object.create(globalThis);
Object.defineProperty(globals, "crypto", {
  value: realRequire("node:crypto").webcrypto,
});
const runtime = {
  di,
  globals,
  require,
  process: owned,
  basePath: temp,
  filename: join(temp, "bundle.js"),
  Error: globalThis.Error,
  fetch: (...args: Parameters<typeof globalThis.fetch>) => {
    const [input] = args;
    if (String(input).startsWith("data:")) return globalThis.fetch(...args);
    throw Error("probe fetch boundary " + String(input).slice(0, 180));
  },
};
Object.defineProperties(globals, {
  process: { value: owned },
  Error: { value: runtime.Error },
  fetch: { value: runtime.fetch, writable: true, configurable: true },
});
process.env = { ...owned.env, PATH: process.env.PATH ?? "" };
const productRuntime = createNativeProductRuntime(runtime);
const foundation = { getModule: productRuntime.getModule },
  modules = foundation;
process.argv = ["node", "owned", "--serve"];
const timer = setTimeout(() => {
  console.log("PROBE_TIMEOUT");
  rmSync(temp, { recursive: true, force: true });
  realExit(2);
}, 15000);
try {
  const previousPrepareStackTrace = Error.prepareStackTrace;
  const container = await productRuntime.loadContainer();
  if (!container) throw Error("Native product container was not created");
  if (!container.isBound(modules.getModule(26314).OriginalModelProvider))
    throw Error("OriginalModelProvider binding missing");
  writeSync(1, "PRODUCT_BOOTSTRAP_OK\n");
  di.ContainerProvider.set(container);
  const app = container.get(di.Application);
  assert.equal(typeof Error.prepareStackTrace, "function");
  assert.notEqual(Error.prepareStackTrace, previousPrepareStackTrace);
  let server: any, ready: () => void;
  const listening = new Promise<void>((resolve) => {
    ready = resolve;
  });
  container.bind(foundation.getModule(47005).ServerAware).toConstantValue({
    async setServer(value: any) {
      server = value;
      if (!server.listening) await once(server, "listening");
      ready();
    },
  });
  di.ConfigUtil.getRaw().cell.server.port = 0;
  productRuntime.startServer();
  await listening;
  allowedPorts.add(server.address().port);
  const origin = `http://127.0.0.1:${server.address().port}`;
  const blocked = await globalThis.fetch(origin + "/health");
  assert.equal(blocked.status, 403);
  assert.match(await blocked.text(), /x-codebuddy-request/);
  const response = await globalThis.fetch(origin + "/health", {
    headers: { "x-codebuddy-request": "1" },
  });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).status, "UP");
  writeSync(1, "PRODUCT_HTTP_HEALTH_OK\n");
  const spec = await globalThis.fetch(origin + "/api/openapi.json");
  assert.equal(spec.status, 200);
  const schema = await spec.json();
  assert.ok(schema.openapi);
  assert.ok(schema.paths["/api/v1/sessions"]);
  writeSync(1, "PRODUCT_GATEWAY_OPENAPI_OK\n");
  const connectionResponse = await globalThis.fetch(
    origin + "/api/v1/acp/connect",
    { method: "POST", headers: { "x-codebuddy-request": "1" } },
  );
  assert.equal(connectionResponse.status, 200);
  const connection = await connectionResponse.json();
  assert.equal(typeof connection.connectionId, "string");
  assert.equal(typeof connection.sessionToken, "string");
  const acpHeaders = {
    "x-codebuddy-request": "1",
    "acp-connection-id": connection.connectionId,
    "acp-session-token": connection.sessionToken,
    "content-type": "application/json",
    accept: "application/json, text/event-stream",
  };
  const initialize = await globalThis.fetch(origin + "/api/v1/acp", {
    method: "POST",
    headers: acpHeaders,
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: 1,
        clientCapabilities: {},
        clientInfo: { name: "owned-test", version: "1" },
      },
    }),
  });
  const initializeBody = await initialize.text();
  assert.equal(initialize.status, 200);
  const message = JSON.parse(
    initializeBody
      .split("\n")
      .find((line) => line.startsWith("data: "))!
      .slice(6),
  );
  assert.equal(message.id, 1);
  assert.equal(message.result.protocolVersion, 1);
  assert.equal(message.result.agentCapabilities.loadSession, true);
  writeSync(1, "PRODUCT_ACP_INITIALIZE_OK\n");
  const created = await globalThis.fetch(origin + "/api/v1/acp", {
    method: "POST",
    headers: acpHeaders,
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 2,
      method: "session/new",
      params: { cwd: temp, mcpServers: [] },
    }),
  });
  assert.equal(created.status, 200);
  const sessionMessages = (await created.text())
    .split("\n")
    .filter((line) => line.startsWith("data: "))
    .map((line) => JSON.parse(line.slice(6)));
  const sessionReply = sessionMessages.find((message) => message.id === 2);
  assert.ok(sessionReply, "session/new must return its JSON-RPC response");
  assert.equal(sessionReply.error, undefined);
  assert.equal(typeof sessionReply.result.sessionId, "string");
  assert.ok(
    sessionMessages.some((message) => message.method === "session/update"),
  );
  writeSync(1, "PRODUCT_ACP_SESSION_NEW_OK\n");

  const promptResponse = await globalThis.fetch(origin + "/api/v1/acp", {
    method: "POST",
    headers: acpHeaders,
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 3,
      method: "session/prompt",
      params: {
        sessionId: sessionReply.result.sessionId,
        prompt: [{ type: "text", text: "Say hello" }],
      },
    }),
  });
  const promptText = await promptResponse.text();
  assert.equal(promptResponse.status, 200);
  const promptMessages = promptText
    .split("\n")
    .filter((line) => line.startsWith("data: "))
    .map((line) => JSON.parse(line.slice(6)));
  const promptReply = promptMessages.find((message) => message.id === 3);
  assert.equal(promptReply?.error, undefined);
  assert.equal(promptReply?.result?.stopReason, "end_turn");
  assert.ok(
    promptMessages.some(
      (message) =>
        message.params?.update?.sessionUpdate === "agent_message_chunk" &&
        message.params.update.content?.text === "Native round trip works.",
    ),
  );
  assert.ok(
    modelRequests.some(
      (request) =>
        // The original adapter uses the configured URL verbatim.
        request.path === "/v1" &&
        request.body?.model === "owned-model" &&
        request.body.stream === true &&
        request.body.messages.some((message: any) =>
          JSON.stringify(message.content).includes("Say hello"),
        ),
    ),
  );
  assert.equal(
    modelRequests.length,
    2,
    "tool output must trigger the next model request",
  );
  const [firstRequest, secondRequest] = modelRequests;
  assert.ok(firstRequest);
  assert.ok(secondRequest);
  assert.ok(
    firstRequest.body.tools.some(
      (tool: any) => tool.function?.name === "Read",
    ),
  );
  assert.ok(
    secondRequest.body.messages.some(
      (message: any) =>
        message.role === "tool" &&
        message.tool_call_id === "owned-read" &&
        message.content.includes(toolEvidence),
    ),
  );
  const completedTool = promptMessages.find(
    (message) =>
      message.params?.update?.toolCallId === "owned-read" &&
      message.params.update.status === "completed",
  )?.params.update;
  assert.ok(completedTool, "ACP must report actual tool completion");
  assert.ok(completedTool.rawOutput.text.includes(toolEvidence));
  assert.ok(
    promptMessages.some(
      (message) =>
        message.params?.update?.rawInput?.file_path === join(temp, "owned.txt"),
    ),
  );
  writeSync(1, "PRODUCT_ACP_TOOL_OK\n");
  writeSync(1, "PRODUCT_ACP_PROMPT_OK\n");
  modelServer.closeAllConnections();
  modelServer.close();
  const deleted = await globalThis.fetch(origin + "/api/v1/acp", {
    method: "DELETE",
    headers: acpHeaders,
  });
  assert.equal(deleted.status, 200);

  if (container.get(di.ApplicationStateService).state !== "ready")
    throw Error("Application did not become ready");
  writeSync(1, "PRODUCT_APPLICATION_READY\n");
  server.closeAllConnections?.();
  server.closeIdleConnections?.();
  await new Promise<void>((resolve) => server.close(() => resolve()));
  await app.stop();
  if (container.get(di.ApplicationStateService).state !== "stoped")
    throw Error("Application did not stop");
  writeSync(1, "PRODUCT_APPLICATION_STOPPED\n");
} catch (error) {
  writeSync(
    2,
    "PRODUCT_BOOTSTRAP_FAILURE " + inspect(error, { depth: 4 }) + "\n",
  );
  clearTimeout(timer);
  rmSync(temp, { recursive: true, force: true });
  realExit(1);
} finally {
  clearTimeout(timer);
  rmSync(temp, { recursive: true, force: true });
  realExit(0);
}

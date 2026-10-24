import * as path from "node:path";
import { Emitter } from "vscode-jsonrpc";
import { createNativeSandboxShell } from "../../src/sandbox/native-sandbox-shell.js";
import { createNativeSandboxProtocol } from "../../src/sandbox/native-sandbox-protocol.js";
import { bashSandboxFixture } from "./bash-sandbox-scenarios.js";
import { sandboxRulesFixture } from "./sandbox-rules-scenarios.js";
/** Deterministic host boundaries. Safe-delete/encoding adapters are test doubles,
 * not claims that the product policy helper or all platform encodings are recovered. */
export function sandboxShellFixture(
  factory = createNativeSandboxShell,
  overrides: any = {},
) {
  const requests: any[] = [],
    logs: any[] = [],
    reports: any[] = [],
    audits: any[] = [],
    outputs: any[] = [],
    data: any[] = [],
    exits: any[] = [],
    timers = new Map<any, { fn: () => any; ms: number }>();
  let reverse: any,
    disconnect: any,
    ready: any,
    response: any = { processId: "p1", pid: 321 },
    readyError: any,
    config: any = {};
  const protocol = createNativeSandboxProtocol();
  const base = sandboxRulesFixture();
  const bash = bashSandboxFixture().n;
  const client = {
    isConnected: () => true,
    sendRequest: async (session: any, command: any, payload: any) => {
      requests.push({ session, command, payload });
      if (response instanceof Error) throw response;
      return response;
    },
    addReverseListener: (_filter: any, fn: any) => {
      reverse = fn;
      return () => {
        reverse = undefined;
      };
    },
    onDisconnect: (fn: any) => {
      disconnect = fn;
      return () => {
        disconnect = undefined;
      };
    },
  };
  const lifecycle = {
    getClient: () => client,
    onSessionReady: (fn: any) => {
      ready = fn;
      return () => {
        ready = undefined;
      };
    },
    waitReady: async () => {
      if (readyError) throw readyError;
    },
    ensureAlive: async () => {},
    getOpenedSessionId: () => "s1",
  };
  const runtime: any = {
    process: {
      title: "owned-node",
      env: { LANG: "en_US.UTF-8" },
      platform: "linux",
      pid: 123,
      stdout: { columns: 80, rows: 24 },
      cwd: () => "/owned/work",
    },
    Date: { now: () => 1000 },
    setTimeout: (fn: any, ms: number) => {
      if (!ms) return setTimeout(fn, ms);
      const h = {};
      timers.set(h, { fn, ms });
      return h;
    },
    clearTimeout: (h: any) => {
      if (!timers.delete(h)) clearTimeout(h);
    },
    modules: {
      80699: { Emitter },
      74674: protocol.getModule(74674),
      16928: path,
      79896: {
        existsSync: () => false,
        statSync: () => ({ isDirectory: () => true }),
      },
      70857: {
        platform: () => "linux",
        tmpdir: () => "/owned/tmp",
        release: () => "1",
      },
      35317: {
        execSync: () => {
          throw Error("No subprocess in fixture");
        },
      },
      93130: {
        decode: (b: Buffer) => b.toString("utf8"),
        encodingExists: () => true,
      },
      23238: { detect: () => ({ encoding: "utf8", confidence: 1 }) },
      5516: { sync: () => null },
      35568: {
        DEFAULT_SAFE_DELETE_BULK_THRESHOLD: 100,
        SAFE_DELETE_REPORT_ENV: "REPORT_PATH",
        buildSafeDeletePosixBootstrap: () => "safe_bootstrap",
        buildSafeDeleteEnv: (env: any, opts: any) => ({
          ...env,
          SAFE_ENABLED: String(opts.enabled),
          REPORT_PATH: "/owned/report",
        }),
        logSafeDeleteInjection: () => {},
        resolveSafeDeleteRuntimeConfig: async () => ({
          enabled: true,
          bulkThreshold: 100,
        }),
        attachSafeDeleteReportEvents: (r: any) => ({
          ...r,
          safeReportAttached: true,
        }),
      },
      64187: base.n,
      93289: bash.getModule(93289),
      48973: { appendSandboxBlockAuditLog: (e: any) => audits.push(e) },
      ...overrides.modules,
    },
  };
  for (const [key, value] of Object.entries(overrides))
    if (key !== "modules") runtime[key] = value;
  // Preserve module additions when changing other runtime fields.
  runtime.modules = { ...runtime.modules, ...overrides.modules };
  runtime.process = { title: "owned-node", ...runtime.process };
  const native = factory(runtime),
    logger = {
      info: (...a: any[]) => logs.push(a),
      warn: (...a: any[]) => logs.push(a),
    };
  const service: any = Object.assign(new native.SandboxShellServiceImpl(), {
    lifecycle,
    logger,
    workspace: { workspaceFolders: [{ uri: { fsPath: "/owned/work" } }] },
    sessionManager: {
      sessionSubject: {
        value: { id: "session", conversationRequestId: "request" },
      },
    },
    settingsManager: {},
    bashSandboxManager: { getConfig: async () => config },
    localShellService: { execute: async (o: any) => ({ local: o.command }) },
    telemetryReporter: { ingestRawEvent: (e: any) => reports.push(e) },
    turnConfig: {},
    sandboxRuleSyncService: {
      expandSecurityCenterPath: (p: string) =>
        p.replace("$WORK", "/owned/work"),
    },
  });
  const handle = (pty = false, options: any = {}) => {
    const h: any = new (
      pty ? native.SandboxPtyExecutionHandle : native.SandboxPipeExecutionHandle
    )({
      processId: "p1",
      pid: 321,
      command: "owned",
      client,
      sessionId: "s1",
      logger,
      cols: 30,
      rows: 5,
      onOutput: (x: any) => outputs.push(x),
      ...options,
    });
    h.onData((x: any) => data.push(x));
    h.onExit((x: any) => exits.push(x));
    return h;
  };
  return {
    native,
    runtime,
    service,
    client,
    lifecycle,
    protocol,
    requests,
    logs,
    reports,
    audits,
    outputs,
    data,
    exits,
    timers,
    handle,
    ready: () => ready?.(),
    reverse: (e: any) => reverse?.(e),
    disconnect: () => disconnect?.(),
    setResponse: (v: any) => {
      response = v;
    },
    setReadyError: (v: any) => {
      readyError = v;
    },
    setConfig: (v: any) => {
      config = v;
    },
  };
}

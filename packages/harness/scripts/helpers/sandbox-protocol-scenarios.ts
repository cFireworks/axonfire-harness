import assert from "node:assert/strict";
import { createNativeSandboxProtocol } from "../../src/sandbox/native-sandbox-protocol.js";
import { createNativeSandboxTurnConfig } from "../../src/sandbox/native-sandbox-turn-config.js";

export const sandboxProtocolFactories = {
  protocol: createNativeSandboxProtocol,
  turnConfig: createNativeSandboxTurnConfig,
};
type Factories = typeof sandboxProtocolFactories;
export const SANDBOX_PROTOCOL_CASES: {
  name: string;
  run(f: Factories): any;
}[] = [
  {
    name: "original sandbox protocol retains cached namespaces, token kinds and command/flag values",
    run(f) {
      const n = f.protocol(),
        other = f.protocol();
      assert.equal(n.getModule(74674), n.getModule(74674));
      assert.equal(
        n.getModule(74674).SANDBOX_COMMANDS,
        n.getModule(68331).SANDBOX_COMMANDS,
      );
      assert.equal(n.SandboxCLILifecycle, Symbol.for("SandboxCLILifecycle"));
      assert.equal(other.SandboxCLILifecycle, n.SandboxCLILifecycle);
      assert.notEqual(
        other.SandboxCLIProcessManager,
        n.SandboxCLIProcessManager,
      );
      assert.notEqual(other.SandboxCLIClient, n.SandboxCLIClient);
      assert.notEqual(other.SandboxShellService, n.SandboxShellService);
      assert.equal(n.SANDBOX_COMMANDS.OPEN_SESSION, "OpenSession");
      assert.equal(
        n.SANDBOX_COMMANDS.ENABLE_MODIFY_BACKUP,
        "EnableModifyBackup",
      );
      assert.equal(Object.keys(n.SANDBOX_COMMANDS).length, 46);
      assert.deepEqual(n.FileAction, {
        Read: 1,
        Write: 2,
        Delete: 4,
        Execute: 8,
      });
      assert.deepEqual(n.NetAction, { Connect: 1, DnsResolve: 2, Sendto: 4 });
      return {
        commands: n.SANDBOX_COMMANDS,
        file: n.FileAction,
        net: n.NetAction,
      };
    },
  },
  {
    name: "original sandbox protocol preserves exact timeout/reconnect defaults and explicit namespace identity",
    run(f) {
      const n = f.protocol();
      assert.deepEqual(n.DEFAULT_SANDBOX_CLI_CONFIG, {
        sessionId: "",
        address: "",
        connectTimeoutMs: 10000,
        requestTimeoutMs: 120000,
        heartbeatIntervalMs: 30000,
        heartbeatTimeoutMs: 5000,
        autoReconnect: true,
        maxReconnectAttempts: 3,
      });
      const shared = f.protocol({
        modules: { 74674: n.getModule(74674), 70353: n.getModule(70353) },
      });
      assert.equal(shared.SandboxCLIProcessManager, n.SandboxCLIProcessManager);
      assert.equal(
        shared.DEFAULT_SANDBOX_CLI_CONFIG,
        n.DEFAULT_SANDBOX_CLI_CONFIG,
      );
      assert.throws(
        () => n.getModule(-1),
        /Explicit sandbox protocol dependency required/,
      );
      return n.DEFAULT_SANDBOX_CLI_CONFIG;
    },
  },
  {
    name: "original IPC envelopes preserve payload references and permissive response classification",
    run(f) {
      const n = f.protocol(),
        payload = { owned: true },
        error = { message: "owned failure" };
      const request = n.createIpcRequest(
        "message",
        "session",
        "command",
        payload,
      );
      const ok = n.createIpcResponseOk(
        "message",
        "session",
        "command",
        payload,
      );
      const failure = n.createIpcResponseErr(
        "message",
        "session",
        "command",
        error,
      );
      assert.deepEqual(request, {
        sessionId: "session",
        messageId: "message",
        command: "command",
        data: payload,
      });
      assert.equal(ok.data, payload);
      assert.equal(failure.error, error);
      assert.equal(ok.success, true);
      assert.equal(failure.success, false);
      const classifications = [
        {},
        request,
        ok,
        failure,
        { success: null },
        { success: 0 },
      ].map(n.isIpcResponse);
      assert.deepEqual(classifications, [false, false, true, true, true, true]);
      assert.throws(() => n.isIpcResponse(null), TypeError);
      return { request, ok, failure, classifications };
    },
  },
  {
    name: "original rules-delta validator keeps shallow and permissive input semantics",
    run(f) {
      const n = f.protocol();
      const values = [
        undefined,
        null,
        false,
        0,
        "text",
        {},
        [],
        { network: {} },
        { file: {} },
        { network: null },
        { file: [] },
        { network: "bad" },
        { other: true },
        { file: { unknown: true } },
      ];
      const result = values.map(n.isValidSandboxRulesDelta);
      assert.deepEqual(result, [
        false,
        false,
        false,
        false,
        false,
        true,
        true,
        true,
        true,
        false,
        false,
        false,
        true,
        true,
      ]);
      return result;
    },
  },
  {
    name: "original partial-apply error retains input error identity and joined message",
    run(f) {
      const n = f.protocol(),
        errors = [{ message: "file" }, { message: "network" }];
      const failure: any = new n.SandboxRulesApplyError(errors);
      assert.ok(failure instanceof Error);
      assert.equal((failure as any).errors, errors);
      assert.equal(failure.name, "SandboxRulesApplyError");
      assert.equal(
        failure.message,
        "applyRulesDelta partially failed: file; network",
      );
      return {
        message: failure.message,
        name: failure.name,
        errors: (failure as any).errors,
      };
    },
  },
  {
    name: "original turn config exposes only original own defaults and isolated mutable instances",
    run(f) {
      const n = f.turnConfig(),
        other = f.turnConfig();
      const a: any = new n.SandboxTurnConfigImpl(),
        b: any = new n.SandboxTurnConfigImpl();
      const defaults = {
        useSandboxCLI: false,
        enableProjection: false,
        enableVersionControl: false,
        enableDeleteProtection: false,
        enableFileBackup: false,
        safeDeleteRuntimeEnabled: true,
        configAllowsAllWritePath: false,
      };
      assert.deepEqual({ ...a }, defaults);
      assert.notEqual(n.SandboxTurnConfig, other.SandboxTurnConfig);
      assert.equal(Symbol.keyFor(n.SandboxTurnConfig), undefined);
      assert.equal(n.SandboxTurnConfig.description, "SandboxTurnConfig");
      assert.equal(Object.hasOwn(a, "permissionMode"), false);
      assert.equal(Object.hasOwn(a, "ruleProfile"), false);
      assert.equal(Object.hasOwn(a, "sandboxWorkdir"), false);
      assert.equal(Object.hasOwn(a, "fileBackupMaxSizeMB"), false);
      a.useSandboxCLI = true;
      assert.equal(b.useSandboxCLI, false);
      return defaults;
    },
  },
];

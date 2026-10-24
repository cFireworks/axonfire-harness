// @ts-nocheck
// Complete original inert protocol factories. No decorators, IO or application bootstrap.
export const SANDBOX_PROTOCOL_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export const SANDBOX_PROTOCOL_MODULES = [
  [70353, 10529156, 10529273],
  [74674, 10529274, 10530966],
  [68331, 15684279, 15686093],
] as const;
export function createNativeSandboxProtocol(runtime: any = {}) {
  const factories = {
    70353(eA, el, ec) {
      "use strict";
      (ec.r(el), ec.d(el, { SandboxCLILifecycle: () => eu }));
      let eu = Symbol.for("SandboxCLILifecycle");
    },
    74674(eA, el, ec) {
      "use strict";
      (ec.r(el),
        ec.d(el, {
          DEFAULT_SANDBOX_CLI_CONFIG: () => eh,
          FileAction: () => eu.FileAction,
          NetAction: () => eu.NetAction,
          SANDBOX_COMMANDS: () => eu.SANDBOX_COMMANDS,
          SandboxCLIClient: () => ed,
          SandboxCLIProcessManager: () => eg,
          SandboxRulesApplyError: () => SandboxRulesApplyError,
          SandboxShellService: () => ep,
          __esModule: () => eu.__esModule,
          createIpcRequest: () => createIpcRequest,
          createIpcResponseErr: () => createIpcResponseErr,
          createIpcResponseOk: () => createIpcResponseOk,
          isIpcResponse: () => isIpcResponse,
          isValidSandboxRulesDelta: () => isValidSandboxRulesDelta,
        }));
      var eu = ec(68331);
      let ed = Symbol("SandboxCLIClient"),
        ep = Symbol("SandboxShellService"),
        eg = Symbol("SandboxCLIProcessManager"),
        eh = {
          sessionId: "",
          address: "",
          connectTimeoutMs: 1e4,
          requestTimeoutMs: 12e4,
          heartbeatIntervalMs: 3e4,
          heartbeatTimeoutMs: 5e3,
          autoReconnect: !0,
          maxReconnectAttempts: 3,
        };
      function isIpcResponse(eA) {
        return void 0 !== eA.success;
      }
      function createIpcRequest(eA, el, ec, eu) {
        return { sessionId: el, messageId: eA, command: ec, data: eu };
      }
      function createIpcResponseOk(eA, el, ec, eu) {
        return {
          sessionId: el,
          messageId: eA,
          command: ec,
          data: eu,
          success: !0,
        };
      }
      function createIpcResponseErr(eA, el, ec, eu) {
        return {
          sessionId: el,
          messageId: eA,
          command: ec,
          success: !1,
          error: eu,
        };
      }
      function isValidSandboxRulesDelta(eA) {
        if (!eA || "object" != typeof eA) return !1;
        let el = eA;
        return !(
          (void 0 !== el.network &&
            ("object" != typeof el.network ||
              null === el.network ||
              Array.isArray(el.network))) ||
          (void 0 !== el.file &&
            ("object" != typeof el.file ||
              null === el.file ||
              Array.isArray(el.file)))
        );
      }
      let SandboxRulesApplyError = class SandboxRulesApplyError extends Error {
        constructor(eA) {
          (super(
            `applyRulesDelta partially failed: ${eA.map((eA) => eA.message).join("; ")}`,
          ),
            (this.errors = eA),
            (this.name = "SandboxRulesApplyError"));
        }
      };
    },
    68331(eA, el) {
      "use strict";
      (Object.defineProperty(el, "__esModule", { value: !0 }),
        (el.NetAction = el.FileAction = el.SANDBOX_COMMANDS = void 0),
        (el.SANDBOX_COMMANDS = {
          PING: "Ping",
          OPEN_SESSION: "OpenSession",
          CLOSE_SESSION: "CloseSession",
          DELETE_SESSION: "DeleteSession",
          RUN_EXECUTABLE: "RunExecutable",
          ADD_FILE_RULE: "AddFileRule",
          ADD_NETWORK_RULE: "AddNetworkRule",
          REMOVE_FILE_RULE: "RemoveFileRule",
          REMOVE_NETWORK_RULE: "RemoveNetworkRule",
          GET_RULES: "GetRules",
          ADD_MACH_RULE: "AddMachRule",
          REMOVE_MACH_RULE: "RemoveMachRule",
          MATCH_FILE_RULE: "MatchFileRule",
          SET_FILE_RULES: "SetFileRules",
          SET_NETWORK_RULES: "SetNetworkRules",
          SET_MACH_RULES: "SetMachRules",
          QUERY_FILE_CHANGES: "QueryFileChanges",
          DISCARD_FILE_CHANGES: "DiscardFileChanges",
          SYNC_FILE_CHANGES: "SyncFileChanges",
          QUERY_FILE_SYNC_CONFLICTS: "QueryFileSyncConflicts",
          COMMIT_FILE_CHANGES: "CommitFileChanges",
          FILE_GC: "FileGc",
          MODIFY_BACKUP: "ModifyBackup",
          ENABLE_MODIFY_BACKUP: "EnableModifyBackup",
          COMMIT_MODIFY_BACKUP: "CommitModifyBackup",
          GET_STATISTICS: "GetStatistics",
          REPORT_BLOCK_CHOICE: "ReportBlockChoice",
          FLUSH_ACCESS_TELEMETRY: "FlushAccessTelemetry",
          PROCESS_WRITE: "ProcessWrite",
          PROCESS_SEND_KEY: "ProcessSendKey",
          PROCESS_RESIZE: "ProcessResize",
          PROCESS_KILL: "ProcessKill",
          PROCESS_IS_ALIVE: "ProcessIsAlive",
          START_PROJECTION: "StartProjection",
          STOP_PROJECTION: "StopProjection",
          QUERY_FILE_COMMITS: "QueryFileCommits",
          REVERT_TO_FILE_COMMIT: "RevertToFileCommit",
          RESET_TO_FILE_COMMIT: "ResetToFileCommit",
          QUERY_FILE_VERSION_CACHE: "QueryFileVersionCache",
          PROCESS_OUTPUT: "ProcessOutput",
          PROCESS_EXIT: "ProcessExit",
          REPORT_EVENT: "ReportEvent",
          SYNC_FILE_PROGRESS: "SyncFileProgress",
          COMMIT_FILE_PROGRESS: "CommitFileProgress",
          RECORD_STATISTICS: "RecordStatistics",
          APPEND_USER_CHOICE: "AppendUserChoice",
        }),
        (el.FileAction = { Read: 1, Write: 2, Delete: 4, Execute: 8 }),
        (el.NetAction = { Connect: 1, DnsResolve: 2, Sendto: 4 }));
    },
  };
  const cache = new Map();
  function getModule(id: number): any {
    if (runtime.modules?.[id] !== undefined) return runtime.modules[id];
    if (cache.has(id)) return cache.get(id);
    if (!factories[id])
      throw Error("Explicit sandbox protocol dependency required: " + id);
    const exports = {};
    cache.set(id, exports);
    factories[id]({ exports }, exports, getModule);
    return exports;
  }
  getModule.r = (exports: any) => {
    Object.defineProperty(exports, "__esModule", { value: true });
    if (typeof Symbol !== "undefined" && Symbol.toStringTag)
      Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
  };
  getModule.d = (exports: any, definitions: any) => {
    for (const name of Object.keys(definitions))
      if (!Object.prototype.hasOwnProperty.call(exports, name))
        Object.defineProperty(exports, name, {
          enumerable: true,
          get: definitions[name],
        });
  };
  return { getModule, ...getModule(74674), ...getModule(70353) };
}

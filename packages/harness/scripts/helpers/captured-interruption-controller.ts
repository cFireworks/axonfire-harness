import { createHash } from "node:crypto";
import { runInNewContext } from "node:vm";
import { BehaviorSubject } from "rxjs";
import { ModelBehaviorError } from "@openai/agents-core";
import { RunResultUtils } from "../../src/agents/run-result-utils.js";
import {
  ModelErrorUtils,
  InterruptedByUserError,
  INTERRUPTED_BY_USER_MESSAGE,
} from "../../src/models/model-error-utils.js";
import { getActiveAgentOnlyHistory } from "../../src/sessions/history-utils.js";
import * as runTypes from "../../src/sessions/run-state-types.js";
import * as retry from "../../src/permissions/interruption-stream-recovery.js";
import { ToolNames } from "../../src/tools/tool-names.js";
import * as rejection from "../../src/tools/tool-rejection.js";
import {
  PermissionMode,
  isRestrictedDirectApproveMode,
} from "../../src/permissions/permission.js";
import { createNativeCommandSafety } from "../../src/permissions/native-command-safety.js";
export function loadCapturedInterruptionController(source: string) {
  if (
    createHash("sha256").update(source).digest("hex") !==
    "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd"
  )
    throw Error("sample hash");
  const primitive = `const ErrorUtil=(${source.slice(103409, 103590)});const eu={ErrorUtil};const CustomError=(${source.slice(66854, 67085)});const Deferred=(${source.slice(117049, 117147)});t5.CustomError=CustomError;t5.Deferred=Deferred;`;
  const errors = [
    "SessionAbortedError",
    "SessionCompactionAbortError",
    "SdkPermissionDeniedError",
    "AgentTimeoutError",
  ]
    .map((name) => {
      const start = source.indexOf("class " + name),
        end = source.indexOf(";", start);
      return `const ${name}=(${source.slice(start, end)});`;
    })
    .join("\n");
  return (runtime: any, dependencies: any) => {
    const commands = createNativeCommandSafety();
    const services: any = {
      service: runtime.service,
      agents: { getDefault: runtime.getDefaultAgent },
      state: runtime.stateMachine,
      profiler: runtime.profiler,
      tasks: { getTasks: runtime.getTasks },
      search: { describe: runtime.describeDeferredTool },
    };
    const context: any = {
      Error,
      SyntaxError,
      Object,
      Promise,
      Map,
      Set,
      WeakMap,
      WeakSet,
      JSON,
      Date: { now: runtime.now },
      setTimeout: runtime.setTimeout,
      clearTimeout: runtime.clearTimeout,
      setImmediate: runtime.setImmediate,
      process: { cwd: runtime.cwd },
      InterruptedByUserError,
      AB: {
        RunResultUtils,
        ErrorUtils: runtime.errorUtils ?? ModelErrorUtils,
        HistoryUtils: { getActiveAgentOnlyHistory },
        QueueDispatchUtils: {
          isDeferredDispatchEnabledSync: runtime.isDeferredDispatchEnabled,
        },
        INTERRUPTED_BY_USER_MESSAGE,
        InputItemUtils: runtime.inputItemUtils,
        CommandUtils: runtime.commands ?? commands.CommandUtils,
        RiskLevel: commands.RiskLevel,
        ModelUtils: {
          isMandatoryApprovalTarget: runtime.isMandatoryApprovalTarget,
        },
      },
      t4: { ...runTypes, SessionRunStateMachine: "state" },
      An: { AgentService: "service", AgentManager: "agents" },
      A$: {
        StartupProfiler: "profiler",
        StartupPhase: { AGENT_LLM_CALL: "llm" },
      },
      rc: { ModelBehaviorError },
      rf: { ToolNames, ...rejection },
      rp: { AgentTaskManager: "tasks" },
      rm: { ToolSearchService: "search" },
      rl: { HttpStatus: { UNAUTHORIZED_REASON_PHRASE: "Unauthorized" } },
      t5: {
        ContainerUtil: { get: (key: string) => services[key] },
        timeout: runtime.sleep,
      },
      t7: { BehaviorSubject },
      rh: { PermissionMode },
      Aw: { isRestrictedDirectApproveMode, ...rejection },
      Ah: { NotificationType: { PERMISSION_PROMPT: "permission_prompt" } },
      rC: { logMcpUiDiag: runtime.logMcpUiDiag },
    };
    const original = source
      .slice(11047102, 11089570)
      .replace(
        "eA.resultSubject.subscribe(async el=>{",
        "runtime.subscribe(eA,async el=>{",
      );
    context.runtime = runtime;
    const Original = runInNewContext(
      `${primitive}${errors}${source.slice(11089571, source.indexOf("ry.MODEL_ERROR_RETRY_MARKER=", 11089571))};(${original})`,
      context,
    );
    context.e1 = Object.assign(Original, {
      MODEL_ERROR_RETRY_MARKER: retry.MODEL_ERROR_RETRY_MARKER,
      MODEL_ERROR_RETRY_CHECK_WINDOW: retry.MODEL_ERROR_RETRY_CHECK_WINDOW,
      MODEL_ERROR_MAX_RETRIES: retry.MODEL_ERROR_MAX_RETRIES,
      NETWORK_ERROR_RETRY_MARKER: retry.NETWORK_ERROR_RETRY_MARKER,
      NETWORK_ERROR_RETRY_CHECK_WINDOW: retry.NETWORK_ERROR_RETRY_CHECK_WINDOW,
    });
    return Object.assign(new Original(), dependencies);
  };
}
export function loadCapturedToolApprovalServices(source: string) {
  if (
    createHash("sha256").update(source).digest("hex") !==
    "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd"
  )
    throw Error("sample hash");
  return (runtime: any) => {
    const commands = createNativeCommandSafety();
    const context: any = {
      Error,
      Map,
      Set,
      JSON,
      lV: {
        CommandUtils: runtime.commands ?? commands.CommandUtils,
        RiskLevel: commands.RiskLevel,
      },
      nC: { ToolNames, ToolPermissionService: "permissions" },
      aY: { AgentTaskManager: "tasks" },
      nk: {
        ContainerUtil: {
          get: (key: string) =>
            key === "permissions"
              ? runtime.permissions
              : { getTasks: runtime.getTasks },
        },
      },
      eX: {
        InputItemUtils: runtime.inputItemUtils ?? {
          createToolCallResultItem: rejection.createToolCallResultItem,
        },
      },
      tn: rejection,
    };
    const classes = runInNewContext(
      `({always:(${source.slice(11939394, 11942161)}),background:(${source.slice(6987547, 6988678)})})`,
      context,
    );
    return {
      always: new classes.always(),
      background: Object.assign(new classes.background(), {
        toolManager: runtime.toolManager,
        logger: runtime.logger,
      }),
    };
  };
}

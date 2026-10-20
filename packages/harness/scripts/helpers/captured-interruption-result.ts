import { createHash } from "node:crypto";
import { runInNewContext } from "node:vm";
import { ModelBehaviorError } from "@openai/agents-core";
import { RunResultUtils } from "../../src/agents/run-result-utils.js";
import {
  InterruptedByUserError,
  INTERRUPTED_BY_USER_MESSAGE,
} from "../../src/models/model-error-utils.js";
import { AgentTimeoutError } from "../../src/permissions/native-interruption-result-dispatcher.js";
import { getActiveAgentOnlyHistory } from "../../src/sessions/history-utils.js";
import * as runTypes from "../../src/sessions/run-state-types.js";
import * as retry from "../../src/permissions/interruption-stream-recovery.js";
export function loadCapturedInterruptionResult(source: string) {
  if (
    createHash("sha256").update(source).digest("hex") !==
    "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd"
  )
    throw Error("sample hash");
  const original = source.slice(11047102, 11089570);
  if (!original.startsWith("class{")) throw Error("class boundary");
  return (runtime: any, dependencies: any) => {
    const services: any = {
      service: runtime.service,
      agents: { getDefault: runtime.getDefaultAgent },
      state: runtime.stateMachine,
      profiler: runtime.profiler,
      tasks: { getTasks: runtime.getTasks },
      search: { describe: runtime.describeDeferredTool },
    };
    const bindings: any = {
      Error,
      SyntaxError,
      Date: { now: runtime.now },
      setTimeout: runtime.setTimeout,
      clearTimeout: runtime.clearTimeout,
      setImmediate: runtime.setImmediate,
      InterruptedByUserError,
      AgentTimeoutError,
      AB: {
        RunResultUtils,
        ErrorUtils: runtime.errorUtils,
        HistoryUtils: { getActiveAgentOnlyHistory },
        QueueDispatchUtils: {
          isDeferredDispatchEnabledSync: runtime.isDeferredDispatchEnabled,
        },
        INTERRUPTED_BY_USER_MESSAGE,
        InputItemUtils: runtime.inputItemUtils,
      },
      t4: { ...runTypes, SessionRunStateMachine: "state" },
      An: { AgentService: "service", AgentManager: "agents" },
      A$: {
        StartupProfiler: "profiler",
        StartupPhase: { AGENT_LLM_CALL: "llm" },
      },
      rc: { ModelBehaviorError },
      rf: { ToolNames: { AGENT: "Agent" } },
      rp: { AgentTaskManager: "tasks" },
      rm: { ToolSearchService: "search" },
      rl: { HttpStatus: { UNAUTHORIZED_REASON_PHRASE: "Unauthorized" } },
      t5: {
        ContainerUtil: { get: (key: string) => services[key] },
        timeout: runtime.sleep,
      },
    };
    const context = bindings;
    const Original = runInNewContext(`(${original})`, context);
    context.e1 = Object.assign(Original, {
      MODEL_ERROR_RETRY_MARKER: retry.MODEL_ERROR_RETRY_MARKER,
      MODEL_ERROR_RETRY_CHECK_WINDOW: retry.MODEL_ERROR_RETRY_CHECK_WINDOW,
      MODEL_ERROR_MAX_RETRIES: retry.MODEL_ERROR_MAX_RETRIES,
      NETWORK_ERROR_RETRY_MARKER: retry.NETWORK_ERROR_RETRY_MARKER,
      NETWORK_ERROR_RETRY_CHECK_WINDOW: retry.NETWORK_ERROR_RETRY_CHECK_WINDOW,
    });
    const owner = Object.assign(
      Object.create(Original.prototype),
      dependencies,
    );
    const waitFor = owner.waitFor.bind(owner);
    owner.waitFor = (session: any) => {
      (session as any).resultSubject = {
        subscribe: (callback: any) => runtime.subscribe(session, callback),
      };
      return waitFor(session);
    };
    return owner;
  };
}

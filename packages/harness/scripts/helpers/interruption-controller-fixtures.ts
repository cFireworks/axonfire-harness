import {
  createNativeInterruptionService,
  createNativeToolApprovalServices,
} from "../../src/permissions/native-interruption-service.js";
import { HarnessSession } from "../../src/sessions/session.js";
import { SessionRunStateMachine } from "../../src/sessions/run-state-machine.js";
import { PermissionMode } from "../../src/permissions/permission.js";
import { createResponseInputUtils } from "../../src/sessions/response-input-utils.js";
import { createToolCallResultItem } from "../../src/tools/tool-rejection.js";
export type ControllerCase = {
  mode?: PermissionMode;
  ceiling?: PermissionMode;
  child?: boolean;
  background?: boolean;
  tool?: string;
  input?: any;
  decision?: "approve" | "always" | "reject" | "cancel" | "abort" | "compact";
  sdk?: boolean;
  acp?: boolean;
  interrupt?: boolean;
  missingId?: boolean;
  hookFailure?: boolean;
  channel?: string;
  preApproved?: boolean;
  customRejection?: boolean;
};
export function interruptionControllerFixture(
  spec: ControllerCase = {},
  construct: any = createNativeInterruptionService,
  approvalConstruct: any = createNativeToolApprovalServices,
) {
  const events: any[] = [],
    session = new HarnessSession("owned-controller"),
    parent = new HarnessSession("owned-parent"),
    machine = new SessionRunStateMachine();
  session.status = "model_done";
  session.options = {
    inputFormat: spec.sdk ? "stream-json" : "text",
    acp: spec.acp === true,
  };
  session.permissionModeSubject.next(spec.mode ?? PermissionMode.Default);
  if (spec.ceiling) session.meta.permissionModeCeiling = spec.ceiling;
  if (spec.child) session.meta.parentSessionId = parent.id;
  if (spec.background) session.meta.isBackgroundTaskSession = true;
  const agent = {
    name: "Default",
    emit: (name: string) => events.push(["emit", name]),
  };
  const item: any = {
    agent,
    rawItem: {
      type: "function_call",
      name: spec.tool ?? "Write",
      arguments: JSON.stringify(
        spec.input ?? { file_path: "/owned/file", content: "owned" },
      ),
      ...(spec.missingId ? {} : { callId: "owned-call" }),
    },
  };
  const state: any = {
    _context: { context: session },
    approve: (approved: any) => events.push(["approve", approved.rawItem.name]),
    _currentStep: { type: "next_step_interruption" },
  };
  session.state = state;
  const result: any = {
    currentTurn: 1,
    lastAgent: agent,
    state,
    completed: Promise.resolve(),
    interruptions: [item],
  };
  session.resultSubject.next(result);
  session.resultAbortSignalMap.set(result, session.abortSignal);
  session.combineSubject.subscribe((value) =>
    events.push(["combine", value.type]),
  );
  const logger = Object.fromEntries(
    ["info", "warn", "debug", "error"].map((name) => [name, () => {}]),
  );
  const toolManager = {
    get: async (name: string) => ({
      resolveRejectedResult: async () =>
        spec.customRejection
          ? [{ type: "message", role: "user", content: "owned rejection" }]
          : [],
    }),
  };
  const runtime: any = {
    service: {
      run: async (agent: any, input: any, options: any) => {
        events.push([
          "run",
          agent?.name,
          input === state ? "STATE" : input,
          options.context.id,
        ]);
      },
    },
    getDefaultAgent: async () => agent,
    stateMachine: machine,
    getTasks: () => [],
    describeDeferredTool: () => undefined,
    isDeferredDispatchEnabled: () => true,
    sleep: async (ms: number) => {
      events.push(["sleep", ms]);
    },
    now: () => 11,
    setImmediate: (cb: any) => cb(),
    setTimeout: () => {
      throw Error("unexpected native timer");
    },
    clearTimeout: () => {},
    subscribe: () => ({ unsubscribe() {} }),
    inputItemUtils: Object.assign(
      createResponseInputUtils(() => "owned-message"),
      { createToolCallResultItem },
    ),
    isMandatoryApprovalTarget: async (_session: any, name: string) =>
      name === "MandatoryOwned",
    cwd: () => "/owned/workdir",
    logMcpUiDiag: () => {},
  };
  const approvalServices = approvalConstruct({
    permissions: {
      applyUpdate: async (s: any, update: any) =>
        events.push(["rules", s.id, update]),
    },
    toolManager,
    logger,
    getTasks: () => [],
  });
  const dependencies: any = {
    logger,
    consoleManager: { error: () => {} },
    stateMachine: machine,
    toolManager,
    toolAlwaysApprovalService: approvalServices.always,
    backgroundTaskToolApprovalService: approvalServices.background,
    sessionHookManager: {
      executeStopHooks: async (_s: any, _r: any, options: any) =>
        events.push(["stop", options]),
      executeNotificationHooks: async (
        _s: any,
        message: string,
        type: string,
      ) => events.push(["notification", message, type]),
    },
    sdkPermissionClient: {
      requestPermission: async (name: string, input: any, id: string) => {
        events.push(["sdk", name, input, id]);
        return spec.decision === "reject"
          ? {
              allowed: false,
              reason: "owned SDK denial",
              interrupt: spec.interrupt,
            }
          : { allowed: true, updatedInput: { ownedAnswer: 42 } };
      },
    },
    sdkHooksManager: {
      getHooks: () => [
        { hookCallbackIds: ["owned-hook", "owned-hook-2"], timeout: 2 },
      ],
      invokeCallback: async (
        id: string,
        payload: any,
        callId: string,
        timeout: number,
      ) => {
        events.push(["hook", id, payload, callId, timeout]);
        if (spec.hookFailure) throw Error("owned hook failure");
      },
    },
    workflowSourceResolver: {
      resolve: async (params: any) => ({
        text: "owned source",
        provenance: { kind: "fixture", location: params.name },
      }),
    },
    traceCollector: {
      flushSession: async (id: string, options: any) =>
        events.push(["trace", id, options]),
    },
  };
  if (spec.channel)
    dependencies.channelPermissionAdapter = {
      createPermissionRequest: async () => spec.channel,
      cancelRequest: (id: string) => events.push(["channelCancel", id]),
    };
  const owner = construct(runtime, dependencies);
  owner.parentIdToMainSession.set(parent.id, parent);
  if (spec.preApproved) awaitableApproval();
  function awaitableApproval() {
    approvalServices.always
      .getOrCreateStore(item.rawItem.name)
      .add(session.id, item.rawItem.name);
  }
  const subscription = owner.pending$.subscribe((pending: any) => {
    if (!pending) return;
    events.push([
      "pending",
      pending.sourceSessionId,
      pending.mainSessionId,
      pending.queuePosition,
      pending.queueTotal,
    ]);
    // Let the source install its abort handler before a human decision.
    if ((spec.sdk && !spec.acp) || spec.channel) return;
    setImmediate(() => {
      if (spec.decision === "reject") owner.reject(item);
      else if (spec.decision === "cancel")
        owner.cancelAllForSession(pending.mainSessionId, "owned cancellation");
      else if (spec.decision === "abort" || spec.decision === "compact") {
        if (spec.decision === "compact") session.isCompressing = true;
        session.abortController.abort();
      } else owner.approve(item, { alwaysApprove: spec.decision === "always" });
    });
  });
  async function execute() {
    await owner.handleInterruptions(session, [item]);
    await Promise.resolve();
    subscription.unsubscribe();
    return {
      events,
      meta: session.meta,
      input: item.rawItem.arguments,
      providerData: item.rawItem.providerData,
      pending: owner.pending$.value,
      denials: session.permissionDenials,
      aborted: session.abortSignal.aborted,
      silent: result.silentAbort,
      queue: [...owner.interruptionQueues.keys()],
      mapped: owner.itemToSessionMap.has(item),
    };
  }
  return {
    owner,
    session,
    parent,
    item,
    state,
    result,
    events,
    runtime,
    dependencies,
    execute,
    subscription,
    approvalServices,
  };
}

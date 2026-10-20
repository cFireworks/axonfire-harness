// Full original SDK control clients, dispatcher and initialization handlers.
// Constructors/method bodies are unmodified except TS annotations. All I/O is explicit DI.
import { setMaxListeners } from "node:events";
import { PermissionMode } from "../permissions/permission.js";
export const HOOK_EVENTS = [
  "PreToolUse",
  "PostToolUse",
  "PostToolUseFailure",
  "Notification",
  "UserPromptSubmit",
  "SessionStart",
  "SessionEnd",
  "Stop",
  "SubagentStart",
  "SubagentStop",
  "PreCompact",
  "PermissionRequest",
  "WorktreeCreate",
  "WorktreeRemove",
];
export const DEFAULT_CONTROL_SIGNAL_CONFIG = { requestTimeoutMs: 60000 };
export const SDK_PRODUCT_ENVIRONMENT = {
  External: "external",
  Internal: "internal",
  IOA: "iOA",
  Selfhosted: "selfhosted",
  Cloudhosted: "cloudhosted",
};
export function isControlRequest(eA: any): any {
  return "control_request" === eA.type;
}
export function isControlResponse(eA: any): any {
  return "control_response" === eA.type;
}
export function isControlCancelRequest(eA: any): any {
  return "control_cancel_request" === eA.type;
}
export function isControlSignalMessage(eA: any): any {
  if ("object" != typeof eA || null === eA) return !1;
  let el: any = eA.type;
  return (
    "control_request" === el ||
    "control_response" === el ||
    "control_cancel_request" === el
  );
}
export type SdkControlNativeRuntime = {
  stdout: {
    write(line: string): boolean;
    once(event: string, callback: () => void): any;
  };
  now(): number;
  setTimeout(callback: () => void, ms: number): any;
  clearTimeout(timer: any): void;
  Deferred?: any;
};
export class NativeDeferred {
  [key: string]: any;
  constructor() {
    this.promise = new Promise((eA: any, el: any) => {
      ((this.resolve = eA), (this.reject = el));
    });
  }
}
const eu = { setMaxListeners };
function createAbortController(): any {
  let eA: any = new AbortController();
  try {
    (0, eu.setMaxListeners)(0, eA.signal);
  } catch {}
  return eA;
}
export function createNativeSdkControl(runtime: SdkControlNativeRuntime) {
  const Date = { now: runtime.now },
    setTimeout = runtime.setTimeout,
    clearTimeout = runtime.clearTimeout,
    process = { stdout: runtime.stdout },
    tC = { Deferred: runtime.Deferred ?? NativeDeferred },
    tD = { createAbortController },
    tE = {
      isControlRequest,
      isControlResponse,
      isControlCancelRequest,
      DEFAULT_CONTROL_SIGNAL_CONFIG,
    },
    tv = { McpScope: { SDK: "sdk" } },
    tF = {
      PermissionMode,
      CONFIGURATION_ENTERPRISE_ENDPOINT: "enterpriseEndpoint",
    },
    tP = { ProductEnviroment: SDK_PRODUCT_ENVIRONMENT };
  // codebuddy.js UTF-16 7794169..7794674
  class StdoutWriter {
    [key: string]: any;
    constructor() {
      ((this._queue = []), (this._draining = !1));
    }
    write(eA: any): any {
      let el: any = JSON.stringify(eA) + "\n";
      this._draining
        ? this._queue.push(el)
        : process.stdout.write(el) ||
          ((this._draining = !0),
          process.stdout.once("drain", () => {
            ((this._draining = !1), this._flush());
          }));
    }
    _flush(): any {
      let eA: any = 0;
      for (; eA < this._queue.length && !this._draining; ) {
        let el: any = process.stdout.write(this._queue[eA]);
        if ((eA++, !el)) {
          ((this._draining = !0),
            this._queue.splice(0, eA),
            process.stdout.once("drain", () => {
              ((this._draining = !1), this._flush());
            }));
          return;
        }
      }
      this._queue.length = 0;
    }
  }
  // codebuddy.js UTF-16 7795251..7796834
  class SdkPermissionClientImpl {
    [key: string]: any;
    constructor() {
      ((this.pendingRequests = new Map()), (this.requestIdCounter = 0));
    }
    async requestPermission(eA: any, el: any, ec: any, eu?: any): Promise<any> {
      let ed: any,
        ep: any = this.generateRequestId(),
        eg: any = new tC.Deferred(),
        eh: any = eu?.timeout;
      (void 0 !== eh &&
        eh > 0 &&
        (ed = setTimeout(() => {
          (this.pendingRequests.delete(ep),
            eg.reject(Error(`Permission request timeout: ${eA}`)));
        }, eh)),
        this.pendingRequests.set(ep, {
          deferred: eg,
          timeoutId: ed,
          toolUseId: ec,
        }));
      let ef: any = {
        type: "control_request",
        request_id: ep,
        request: {
          subtype: "can_use_tool",
          tool_name: eA,
          input: el,
          tool_use_id: ec,
          ...(eu?.agentId && { agent_id: eu.agentId }),
          ...(eu?.permissionSuggestions && {
            permission_suggestions: eu.permissionSuggestions,
          }),
          ...(eu?.blockedPath && { blocked_path: eu.blockedPath }),
          ...(eu?.decisionReason && { decision_reason: eu.decisionReason }),
        },
      };
      return (this.sendRequest(ef), eg.promise);
    }
    handleResponse(eA: any, el: any): any {
      let ec: any = this.pendingRequests.get(eA);
      if (!ec) return;
      if (
        (ec.timeoutId && clearTimeout(ec.timeoutId),
        this.pendingRequests.delete(eA),
        "error" === el.subtype)
      )
        return void ec.deferred.reject(Error(el.error));
      let eu: any = el.response;
      ec.deferred.resolve({
        allowed: eu?.allowed ?? !1,
        reason: eu?.reason,
        interrupt: eu?.interrupt,
        updatedInput: eu?.updatedInput,
      });
    }
    cancelRequest(eA: any): any {
      let el: any = this.pendingRequests.get(eA);
      el &&
        (el.timeoutId && clearTimeout(el.timeoutId),
        el.deferred.reject(Error("Permission request cancelled")),
        this.pendingRequests.delete(eA));
    }
    cancelAllPending(eA: any): any {
      for (let [, el] of this.pendingRequests)
        (el.timeoutId && clearTimeout(el.timeoutId),
          el.deferred.reject(Error(eA)));
      this.pendingRequests.clear();
    }
    generateRequestId(): any {
      return `perm_${Date.now()}_${++this.requestIdCounter}`;
    }
    sendRequest(eA: any): any {
      this.stdoutWriter.write(eA);
    }
  }
  // codebuddy.js UTF-16 7797641..7800832
  class SdkHooksManagerImpl {
    [key: string]: any;
    constructor() {
      ((this.hooksConfig = new Map()),
        (this.pendingRequests = new Map()),
        (this.requestIdCounter = 0));
    }
    setHooks(eA: any): any {
      for (let [el, ec] of (this.hooksConfig.clear(),
      Object.entries(eA) as Array<[string, any]>))
        ec && ec.length > 0 && this.hooksConfig.set(el, ec);
      this.logger.info(
        `SDK hooks configured: ${Array.from(this.hooksConfig.keys()).join(", ")}`,
      );
    }
    clearHooks(): any {
      for (let [eA, el] of (this.hooksConfig.clear(), this.pendingRequests))
        (clearTimeout(el.timeoutId),
          el.deferred.reject(Error("Hooks cleared")),
          this.pendingRequests.delete(eA));
    }
    hasHooks(eA: any): any {
      return this.hooksConfig.has(eA);
    }
    getHooks(eA: any): any {
      return this.hooksConfig.get(eA) || [];
    }
    async invokeCallback(
      eA: any,
      el: any,
      ec?: any,
      eu: any = 6e4,
    ): Promise<any> {
      let ed: any = this.generateRequestId(),
        ep: any = new tC.Deferred(),
        eg: any = setTimeout(() => {
          (this.pendingRequests.delete(ed),
            ep.reject(Error(`Hook callback timeout: ${eA}`)));
        }, eu);
      this.pendingRequests.set(ed, {
        deferred: ep,
        timeoutId: eg,
        callbackId: eA,
      });
      let eh: any = {
        type: "control_request",
        request_id: ed,
        request: {
          subtype: "hook_callback",
          callback_id: eA,
          input: el,
          ...(ec && { tool_use_id: ec }),
        },
      };
      return (this.sendRequest(eh), ep.promise);
    }
    async executeHooks(eA: any, el: any): Promise<any> {
      let ec: any = eA.hook_event_name,
        eu: any = this.hooksConfig.get(ec),
        ed: any = {
          shouldContinue: !0,
          systemMessages: [],
          additionalContext: [],
          suppressOutput: !1,
        };
      if (!eu || 0 === eu.length) return ed;
      let ep: any = this.getToolName(eA),
        eg: any = [];
      for (let eA of eu)
        if (this.matchesTool(eA.matcher, ep))
          for (let el of eA.hookCallbackIds)
            eg.push({ callbackId: el, timeout: (eA.timeout ?? 60) * 1e3 });
      if (0 === eg.length) return ed;
      let eh: any = await Promise.allSettled(
        eg.map(({ callbackId: ec, timeout: eu }: any) =>
          this.invokeCallback(ec, eA, el, eu),
        ),
      );
      return this.aggregateResults(eh, ed);
    }
    handleResponse(eA: any, el: any): any {
      let ec: any = this.pendingRequests.get(eA);
      if (!ec) return;
      if (
        (clearTimeout(ec.timeoutId),
        this.pendingRequests.delete(eA),
        "error" === el.subtype)
      )
        return void ec.deferred.reject(Error(el.error));
      let eu: any = el.response ?? {};
      ec.deferred.resolve(eu);
    }
    aggregateResults(eA: any, el: any): any {
      for (let ec of eA) {
        if ("rejected" === ec.status) {
          this.logger.warn(`Hook execution failed: ${ec.reason}`);
          continue;
        }
        let eA: any = ec.value;
        (!1 === eA.continue &&
          ((el.shouldContinue = !1), (el.stopReason = eA.stopReason)),
          eA.suppressOutput && (el.suppressOutput = !0),
          eA.systemMessage && el.systemMessages.push(eA.systemMessage));
        let eu: any = eA.hookSpecificOutput;
        eu &&
          (eu.permissionDecision &&
            ("deny" === eu.permissionDecision
              ? ((el.permissionDecision = "deny"),
                (el.permissionDecisionReason = eu.permissionDecisionReason))
              : "ask" === eu.permissionDecision &&
                  "deny" !== el.permissionDecision
                ? ((el.permissionDecision = "ask"),
                  (el.permissionDecisionReason = eu.permissionDecisionReason))
                : "allow" !== eu.permissionDecision ||
                  el.permissionDecision ||
                  ((el.permissionDecision = "allow"),
                  (el.permissionDecisionReason = eu.permissionDecisionReason))),
          eu.updatedInput &&
            "allow" === eu.permissionDecision &&
            (el.updatedInput = eu.updatedInput),
          eu.additionalContext &&
            el.additionalContext.push(eu.additionalContext));
      }
      return el;
    }
    matchesTool(eA: any, el: any): any {
      if (!eA) return !0;
      if (!el) return !1;
      try {
        return new RegExp(eA).test(el);
      } catch {
        return el === eA;
      }
    }
    getToolName(eA: any): any {
      if ("tool_name" in eA) return eA.tool_name;
    }
    generateRequestId(): any {
      return `hook_${Date.now()}_${++this.requestIdCounter}`;
    }
    sendRequest(eA: any): any {
      this.stdoutWriter.write(eA);
    }
    setCapabilities(eA: any): any {
      ((this.sdkCapabilities = eA),
        eA && this.logger.info(`SDK capabilities set: ${JSON.stringify(eA)}`));
    }
    getCapabilities(): any {
      return this.sdkCapabilities;
    }
  }
  // codebuddy.js UTF-16 7801845..7803380
  class SdkMcpMessageClientImpl {
    [key: string]: any;
    constructor() {
      ((this.pendingRequests = new Map()), (this.requestIdCounter = 0));
    }
    async sendMcpMessage(eA: any, el: any, ec?: any): Promise<any> {
      let eu: any = this.generateRequestId();
      if (ec?.aborted)
        throw Error(`MCP message request aborted for server "${eA}"`);
      let ed: any = new tC.Deferred(),
        ep: any = { deferred: ed, serverName: eA };
      if (ec) {
        let abortHandler: any = () => {
          (this.pendingRequests.delete(eu),
            ed.reject(Error(`MCP message request aborted for server "${eA}"`)));
        };
        (ec.addEventListener("abort", abortHandler, { once: !0 }),
          (ep.abortHandler = () =>
            ec.removeEventListener("abort", abortHandler)));
      }
      this.pendingRequests.set(eu, ep);
      let eg: any = {
        type: "control_request",
        request_id: eu,
        request: { subtype: "mcp_message", server_name: eA, message: el },
      };
      return (this.sendRequest(eg), ed.promise);
    }
    handleResponse(eA: any, el: any): any {
      let ec: any = this.pendingRequests.get(eA);
      if (!ec) return;
      this.cleanupPending(eA, ec);
      let eu: any = el;
      if ("error" === eu.subtype)
        return void ec.deferred.reject(Error(eu.error));
      let ed: any = eu.response?.mcp_response;
      ed
        ? ec.deferred.resolve(ed)
        : ec.deferred.reject(
            Error(
              `Invalid MCP response for server "${ec.serverName}": missing mcp_response`,
            ),
          );
    }
    cancelRequest(eA: any): any {
      let el: any = this.pendingRequests.get(eA);
      el &&
        (this.cleanupPending(eA, el),
        el.deferred.reject(Error("MCP message request cancelled")));
    }
    cancelAllPending(eA: any): any {
      for (let [, el] of this.pendingRequests)
        (el.abortHandler && el.abortHandler(), el.deferred.reject(Error(eA)));
      this.pendingRequests.clear();
    }
    cleanupPending(eA: any, el: any): any {
      (el.abortHandler && el.abortHandler(), this.pendingRequests.delete(eA));
    }
    generateRequestId(): any {
      return `mcp_${Date.now()}_${++this.requestIdCounter}`;
    }
    sendRequest(eA: any): any {
      this.stdoutWriter.write(eA);
    }
  }
  // codebuddy.js UTF-16 7804207..7805343
  class SdkElicitationClientImpl {
    [key: string]: any;
    constructor() {
      ((this.pendingRequests = new Map()), (this.requestIdCounter = 0));
    }
    async createElicitation(eA: any, el?: any): Promise<any> {
      let ec: any,
        eu: any = el?.signal;
      if (eu?.aborted) throw Error("Elicitation request aborted");
      let ed: any = `elic_${Date.now()}_${++this.requestIdCounter}`,
        ep: any = new tC.Deferred();
      if (eu) {
        let onAbort: any = () => {
          (this.pendingRequests.delete(ed),
            ep.reject(Error("Elicitation request aborted")));
        };
        (eu.addEventListener("abort", onAbort, { once: !0 }),
          (ec = () => eu.removeEventListener("abort", onAbort)));
      }
      this.pendingRequests.set(ed, { deferred: ep, cleanup: ec });
      let eg: any = {
        type: "control_request",
        request_id: ed,
        request: { subtype: "elicitation_create", ...eA },
      };
      return (this.stdoutWriter.write(eg), ep.promise);
    }
    completeElicitation(eA: any): any {
      let el: any = {
        type: "control_notification",
        channel: "elicitation",
        data: eA,
      };
      this.stdoutWriter.write(el);
    }
    handleResponse(eA: any, el: any): any {
      let ec: any = this.pendingRequests.get(eA);
      if (!ec) return;
      if (
        (ec.cleanup?.(),
        this.pendingRequests.delete(eA),
        "error" === el.subtype)
      )
        return void ec.deferred.reject(Error(el.error));
      let eu: any = el.response ?? {};
      ec.deferred.resolve(eu);
    }
    cancelAllPending(eA: any): any {
      for (let [, el] of this.pendingRequests)
        (el.cleanup?.(), el.deferred.reject(Error(eA)));
      this.pendingRequests.clear();
    }
  }
  // codebuddy.js UTF-16 7806184..7808272
  class ControlSignalHandlerImpl {
    [key: string]: any;
    constructor() {
      this.pendingRequests = new Map();
    }
    async handleMessage(eA: any): Promise<any> {
      (0, tE.isControlRequest)(eA)
        ? await this.handleRequest(eA)
        : (0, tE.isControlCancelRequest)(eA)
          ? this.cancelRequest(eA.request_id)
          : (0, tE.isControlResponse)(eA)
            ? this.handleControlResponse(eA)
            : this.logger.warn(`Unknown control signal type: ${eA.type}`);
    }
    cancelRequest(eA: any): any {
      let el: any = this.pendingRequests.get(eA);
      el &&
        (clearTimeout(el.timeoutId),
        el.abortController.abort(),
        el.deferred.reject(Error("Request cancelled")),
        this.pendingRequests.delete(eA),
        this.logger.info(`Cancelled control request: ${eA}`));
    }
    sendResponse(eA: any): any {
      this.stdoutWriter.write(eA);
    }
    sendNotification(eA: any): any {
      this.stdoutWriter.write(eA);
    }
    async handleRequest(eA: any): Promise<any> {
      let { request_id: el, request: ec } = eA,
        { subtype: eu } = ec,
        ed: any = (0, tD.createAbortController)(),
        ep: any = new tC.Deferred(),
        eg: any = setTimeout(() => {
          (this.cancelRequest(el), this.sendError(el, "Request timeout"));
        }, tE.DEFAULT_CONTROL_SIGNAL_CONFIG.requestTimeoutMs);
      this.pendingRequests.set(el, {
        deferred: ep,
        abortController: ed,
        timeoutId: eg,
      });
      try {
        let ec: any = this.subtypeHandlers.find((eA: any) => eA.subtype === eu);
        if (!ec)
          return void this.sendError(
            el,
            `Unknown control request subtype: ${eu}`,
          );
        let ep: any = await ec.handle(eA, ed.signal);
        if (ed.signal.aborted) return;
        this.sendSuccess(el, ep);
      } catch (eA: any) {
        if (!ed.signal.aborted) {
          let ec: any = eA instanceof Error ? eA.message : String(eA);
          this.sendError(el, ec);
        }
      } finally {
        let eA: any = this.pendingRequests.get(el);
        eA && (clearTimeout(eA.timeoutId), this.pendingRequests.delete(el));
      }
    }
    sendSuccess(eA: any, el: any): any {
      let ec: any = {
        type: "control_response",
        response: { subtype: "success", request_id: eA, response: el },
      };
      this.sendResponse(ec);
    }
    sendError(eA: any, el: any): any {
      let ec: any = {
        type: "control_response",
        response: { subtype: "error", request_id: eA, error: el },
      };
      this.sendResponse(ec);
    }
    handleControlResponse(eA: any): any {
      let el: any = eA.response,
        ec: any = el.request_id;
      ec.startsWith("perm_")
        ? this.sdkPermissionClient.handleResponse(ec, el)
        : ec.startsWith("hook_")
          ? this.sdkHooksManager.handleResponse(ec, el)
          : ec.startsWith("mcp_")
            ? this.sdkMcpMessageClient.handleResponse(ec, el)
            : ec.startsWith("elic_")
              ? this.sdkElicitationClient.handleResponse(ec, el)
              : this.logger.debug(
                  `Unhandled control_response for request: ${ec}`,
                );
    }
  }
  // codebuddy.js UTF-16 7810342..7810807
  class SdkInitializeStateServiceImpl {
    [key: string]: any;
    constructor() {
      ((this.state = {}), (this.lastSyncedFingerprint = JSON.stringify({})));
    }
    set(eA: any): any {
      let el: any = {
        systemPrompt: eA.systemPrompt,
        appendSystemPrompt: eA.appendSystemPrompt,
        agents: eA.agents,
      };
      return (
        (this.state = el),
        JSON.stringify(el) !== this.lastSyncedFingerprint
      );
    }
    markSynced(): any {
      this.lastSyncedFingerprint = JSON.stringify(this.state);
    }
    clear(): any {
      return (
        (this.lastSyncedFingerprint !== JSON.stringify({}) ||
          0 !== Object.keys(this.state).length) &&
        ((this.state = {}), !0)
      );
    }
    get(): any {
      return this.state;
    }
  }
  // codebuddy.js UTF-16 7811554..7814144
  class InitializeHandler {
    [key: string]: any;
    constructor() {
      this.subtype = "initialize";
    }
    async handle(eA: any, el: any): Promise<any> {
      let ec: any,
        { environment: eu, endpoint: ed } = eA.request;
      (await this.switchEnvironmentIfNeeded(eu, ed),
        eA.request.hooks && this.sdkHooksManager.setHooks(eA.request.hooks),
        eA.request.capabilities &&
          (this.sdkHooksManager.setCapabilities(eA.request.capabilities),
          eA.request.capabilities.elicitation?.form === !0 &&
            (this.hostCapabilityProvider.markElicitationForm(),
            this.hostCapabilityProvider.markWeixinpayInterception())),
        await Promise.all([
          eA.request.sdkMcpServers && eA.request.sdkMcpServers.length > 0
            ? this.registerSdkMcpServers(eA.request.sdkMcpServers)
            : Promise.resolve(),
          this.applySdkInitializeOverrides(eA.request),
        ]));
      let ep: any = (await this.commandManager.getAll()).map((eA: any) => ({
          name: eA.name,
          description: eA.description,
        })),
        eg: any = (await this.outputStyleManager.getAllOutputStyles()).map(
          (eA: any) => eA.name,
        ),
        eh: any = (await this.settingsManager.get("outputStyle")) || "default",
        ef: any = await this.agentManager.getDefault(),
        em: any = (await this.agentManager.getModels(ef.name)).map(
          (eA: any) => ({
            id: eA.id,
            name: eA.name || eA.id,
            description: eA.description,
          }),
        );
      try {
        ec = (await this.agentManager.getPrimaryModel()).id;
      } catch {}
      let eE: any = this.authManager.currentSessionSubject.getValue();
      return {
        commands: ep,
        output_style: eh,
        available_output_styles: eg,
        models: em,
        account: eE?.account
          ? {
              uid: eE.account.uid,
              nickname: eE.account.nickname,
              type: eE.account.type,
              enterprise: eE.account.enterprise,
              enterpriseName: eE.account.enterpriseName,
              userId: eE.account.uid,
              userName: eE.account.nickname,
              userNickname: eE.account.nickname,
              token: eE.auth?.accessToken,
              enterpriseId: eE.account.enterpriseId,
            }
          : null,
        currentModelId: ec,
      };
    }
    async applySdkInitializeOverrides(eA: any): Promise<any> {
      let el: any = eA.agents;
      if (
        (eA.systemPrompt ||
          eA.appendSystemPrompt ||
          (el && Object.keys(el).length > 0)) &&
        this.sdkInitializeState.set({
          systemPrompt: eA.systemPrompt,
          appendSystemPrompt: eA.appendSystemPrompt,
          agents: el,
        })
      ) {
        try {
          await this.productManager.sync(!0);
        } catch {
          return;
        }
        (this.sdkInitializeState.markSynced(),
          await this.agentManager.waitForRebuildSettled());
      }
    }
    async registerSdkMcpServers(eA: any): Promise<any> {
      for (let el of (await this.mcpReadyService.waitForServersReady(), eA))
        await this.mcpManager.add(
          el,
          {
            type: "sdk",
            name: el,
            description: `SDK MCP Server: ${el}`,
            defer_loading: !1,
          },
          tv.McpScope.SDK,
        );
    }
    async switchEnvironmentIfNeeded(eA: any, el: any): Promise<any> {
      if (el) {
        (await this.settingsManager.set(
          tF.CONFIGURATION_ENTERPRISE_ENDPOINT,
          el,
        ),
          await this.productEnvService.switch(tP.ProductEnviroment.Selfhosted));
        return;
      }
      if (eA) {
        let el: any = (
          {
            external: tP.ProductEnviroment.External,
            internal: tP.ProductEnviroment.Internal,
            ioa: tP.ProductEnviroment.IOA,
            cloudhosted: tP.ProductEnviroment.Cloudhosted,
          } as Record<string, any>
        )[eA];
        el && (await this.productEnvService.switch(el));
      }
    }
  }
  // codebuddy.js UTF-16 7820329..7821587
  class SetPermissionModeHandler {
    [key: string]: any;
    constructor() {
      this.subtype = "set_permission_mode";
    }
    async handle(eA: any, el: any): Promise<any> {
      let ec: any,
        { session_id: eu, mode: ed } = eA.request,
        ep: any = (
          {
            default: tF.PermissionMode.Default,
            acceptEdits: tF.PermissionMode.AcceptEdits,
            bypassPermissions: tF.PermissionMode.BypassPermissions,
            plan: tF.PermissionMode.Plan,
            dontAsk: tF.PermissionMode.DontAsk,
            auto: tF.PermissionMode.Auto,
          } as Record<string, any>
        )[ed];
      if (!ep) throw Error(`Invalid permission mode: ${ed}`);
      let eg: any = this.sessionManager.sessionSubject.getValue();
      if (!eg && eu)
        return (
          this.logger.info(
            `Session ${eu} not found yet, setting override permission mode to ${ed}`,
          ),
          this.sessionManager.setOverridePermissionMode(eu, ep),
          {
            session_id: eu,
            mode: ed,
            previous_mode: void 0,
            plan_file_path: void 0,
          }
        );
      if (!eg) throw Error(`Session not found: ${eu || "current"}`);
      if (eu && eg.id !== eu)
        throw Error(`Session mismatch: expected ${eu}, got ${eg.id}`);
      let eh: any = eg.permissionModeSubject.value;
      return (
        eg.permissionModeSubject.next(ep),
        this.sessionManager.setOverridePermissionMode(eg.id, ep),
        this.logger.info(
          `Set permission mode for session ${eg.id} from ${eh} to ${ed}`,
        ),
        ep === tF.PermissionMode.Plan &&
          ((ec = this.planStorageService.initializePlanFilePath(eg)),
          this.logger.info(
            `Initialized plan file path for session ${eg.id}: ${ec}`,
          )),
        { session_id: eg.id, mode: ed, previous_mode: eh, plan_file_path: ec }
      );
    }
  }
  // codebuddy.js UTF-16 7822816..7823318
  class GetAvailableModesHandler {
    [key: string]: any;
    constructor() {
      this.subtype = "get_available_modes";
    }
    async handle(eA: any, el: any): Promise<any> {
      return {
        availableModes: [
          {
            id: "default",
            name: "Always Ask",
            description: "Prompts for permission on first use of each tool",
          },
          {
            id: "acceptEdits",
            name: "Accept Edits",
            description:
              "Automatically accepts file edit permissions for the session",
          },
          {
            id: "plan",
            name: "Plan",
            description:
              "Claude can analyze but not modify files or execute commands",
          },
          {
            id: "bypassPermissions",
            name: "Bypass Permissions",
            description: "Skips all permission prompts",
          },
        ],
      };
    }
  }
  // codebuddy.js UTF-16 7823983..7824300
  class GetAvailableModelsHandler {
    [key: string]: any;
    constructor() {
      this.subtype = "get_available_models";
    }
    async handle(eA: any, el: any): Promise<any> {
      let ec: any = await this.agentManager.getDefault(),
        eu: any = await this.agentManager.getModels(ec.name);
      return {
        availableModels: eu.map((eA: any) => ({
          modelId: eA.id,
          name: eA.name || eA.id,
          description: eA.description,
        })),
        rawModels: eu.map(({ url: eA, apiKey: el, ...ec }: any) => ec),
      };
    }
  }
  // codebuddy.js UTF-16 7825195..7826336
  class SetModelHandler {
    [key: string]: any;
    constructor() {
      this.subtype = "set_model";
    }
    async handle(eA: any, el: any): Promise<any> {
      let { session_id: ec, model: eu } = eA.request;
      if (
        (this.logger.info(
          `Received set_model request: session_id=${ec}, model=${eu}`,
          "SetModelHandler",
        ),
        !eu)
      )
        throw Error("Model is required");
      let ed: any = this.sessionManager.sessionSubject.getValue();
      if (!ed && ec)
        return (
          this.logger.info(
            `Session ${ec} not found yet (sessionSubject is empty), setting override model to ${eu}`,
            "SetModelHandler",
          ),
          this.sessionManager.setOverrideModel(ec, eu),
          await this.cliSettingsProvider.set("model", eu),
          { session_id: ec, model: eu, previous_model: void 0 }
        );
      if (!ed) throw Error(`Session not found: ${ec || "current"}`);
      if (ec && ed.id !== ec)
        throw Error(`Session mismatch: expected ${ec}, got ${ed.id}`);
      let ep: any = ed.requestOptions.model || ed.options.model;
      return (
        (ed.requestOptions.model = eu),
        (ed.options.model = eu),
        await this.cliSettingsProvider.set("model", eu),
        this.sessionManager.setOverrideModel(ed.id, eu),
        this.logger.info(
          `Updated model for session ${ed.id}: ${ep || "default"} -> ${eu} (requestOptions.model=${ed.requestOptions.model}, options.model=${ed.options.model})`,
          "SetModelHandler",
        ),
        { session_id: ed.id, model: eu, previous_model: ep }
      );
    }
  }
  return {
    StdoutWriter,
    SdkPermissionClientImpl,
    SdkHooksManagerImpl,
    SdkMcpMessageClientImpl,
    SdkElicitationClientImpl,
    ControlSignalHandlerImpl,
    SdkInitializeStateServiceImpl,
    InitializeHandler,
    SetPermissionModeHandler,
    GetAvailableModesHandler,
    GetAvailableModelsHandler,
    SetModelHandler,
  };
}

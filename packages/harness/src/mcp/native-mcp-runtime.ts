// Fixed WorkBuddy 5.3.14 SHA; original complete methods, TS-only annotations and outer DI.
import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";
import { Subject } from "rxjs";
import {
  user,
  MCPServerStdio,
  MCPServerSSE,
  MCPServerStreamableHttp,
} from "@openai/agents-core";
import * as underlying from "@openai/agents-core/_shims";
import { Client } from "mcp-sdk-native/client/index.js";
import { StdioClientTransport } from "mcp-sdk-native/client/stdio.js";
import { SSEClientTransport } from "mcp-sdk-native/client/sse.js";
import { StreamableHTTPClientTransport } from "mcp-sdk-native/client/streamableHttp.js";
import * as schemas from "mcp-sdk-native/types.js";
import {
  ChannelNotificationSchema,
  ChannelPermissionResponseSchema,
} from "../channels/channel-constants.js";
import { PermissionMode } from "../permissions/permission.js";
import { ToolArgType } from "../permissions/native-permission-policy.js";
import { ToolNames } from "../tools/tool-names.js";
import { ToolDeferOverlay } from "../tools/native-tool-specs.js";
import { McpToolCallContext } from "./mcp-tool-call-context.js";
import { createNativeHostDetection } from "../permissions/native-host-detection.js";
export function createNativeMcpRuntime(runtime: any) {
  const Date = { now: runtime.now ?? globalThis.Date.now },
    process = { env: runtime.env ?? globalThis.process.env },
    setTimeout = runtime.setTimeout ?? globalThis.setTimeout,
    clearTimeout = runtime.clearTimeout ?? globalThis.clearTimeout,
    fetch = runtime.fetch ?? globalThis.fetch;
  let eu: any;
  const tU: any = {
      ContainerUtil: {
        get: (name: string) => {
          if (!(name in runtime.dependencies))
            throw Error("MCP host dependency not configured: " + name);
          return runtime.dependencies[name];
        },
      },
      generateUUUID: runtime.uuid ?? randomUUID,
    },
    tF: any = {
      ...schemas,
      Client: runtime.Client ?? Client,
      MCPServerStdio,
      MCPServerSSE,
      MCPServerStreamableHttp,
      UnderlyingMCPServerStdio: underlying.MCPServerStdio,
      UnderlyingMCPServerSSE: underlying.MCPServerSSE,
      UnderlyingMCPServerStreamableHttp: underlying.MCPServerStreamableHttp,
      McpTransportManager: "transportManager",
      SdkMcpMessageClient: "sdkMcpMessageClient",
      McpSubagentToolManager: "subagentTools",
      MAX_MCP_OUTPUT_TOKENS: 20000,
      ...runtime.sdkBindings,
    },
    Ay = { Client: runtime.Client ?? Client },
    tH = { Subject },
    t8 = {
      McpUtils: runtime.mcpUtils,
      PermissionUtils: runtime.permissionUtils,
      PathUtils: { getWorkDir: runtime.getWorkDir },
    },
    t1 = {
      SessionManager: "sessions",
      SessionStore: "store",
      SessionRunStateMachine: "stateMachine",
      MessageQueueManager: "queue",
    },
    t2 = { PermissionMode, SettingsManager: "settings" },
    t3 = {
      ToolArgType,
      ToolNames,
      ToolHookManager: "toolHooks",
      ToolPermissionService: "permissions",
    },
    t4 = { ToolDeferOverlay, AgentToolDeferOverlayCache: "overlayCache" },
    tq = { DeferToolConfigService: "deferConfig" },
    tK = { ConsoleManager: "console" },
    tZ = { PaymentInterceptor: "payment" },
    tY = createNativeHostDetection(runtime),
    tX = { HOST_CAPABILITIES_ENV: "CODEBUDDY_HOST_CAPABILITIES" },
    AE = { McpToolCallContext },
    AC = { broadcastMcpUiForToolCall: runtime.broadcastMcpUiForToolCall },
    Al = { AgentService: "service", AgentManager: "agents" },
    Ac = { user },
    Au = {
      ChannelManager: "channels",
      ChannelSecurityManager: "channelSecurity",
      ChannelPermissionAdapter: "channelPermission",
      ChannelNotificationSchema,
      ChannelPermissionResponseSchema,
    },
    tj = {
      Logger: "logger",
      EventService: "events",
      Events: { McpToolCall: "mcp_tool_call" },
      SPAN_NAME_MCP_CALL: "codebuddy_code.mcp_call",
      SPAN_TYPE_MCP_CALL: "mcp_call",
      TOOL_BASE_ATTRS: { SPAN_TYPE: "span.type" },
      TOOL_DETAIL_ATTRS: { MCP_SERVER: "mcp.server", MCP_TOOL: "mcp.tool" },
      ...runtime.spanConstants,
    },
    Aq = {
      StdioClientTransport:
        runtime.StdioClientTransport ?? StdioClientTransport,
    },
    AJ = {
      SSEClientTransport: runtime.SSEClientTransport ?? SSEClientTransport,
    },
    Az = {
      StreamableHTTPClientTransport:
        runtime.StreamableHTTPClientTransport ?? StreamableHTTPClientTransport,
    },
    Ap = { MODEL_ID_HEADER: "X-Model-ID" },
    Ag = Symbol.for("@genie/agent-cli.mcp-model-id-header:wrapped"),
    Ah = new AsyncLocalStorage(),
    Af = 30000,
    Am = 500,
    Aw = 500;
  const processMcpResult = runtime.processMcpResult;
  function resolveMcpCallParentSpan(eA: any, el: any): any {
    return eA && el
      ? (eA._toolSpans?.get(el) ??
          eA._galileoViewSpanContexts?.get(el)?.executeSpan ??
          eA.conversationRequestRootSpan)
      : eA?.conversationRequestRootSpan;
  }
  async function withMcpCallSpan(
    eA: any,
    el: any,
    ec: any,
    eu: any,
    ed: any,
  ): Promise<any> {
    let ep: any = resolveMcpCallParentSpan(eA, eu),
      eg: any = ep?.startSpan(tj.SPAN_NAME_MCP_CALL);
    eg?.setAttributes({
      [tj.TOOL_BASE_ATTRS.SPAN_TYPE]: tj.SPAN_TYPE_MCP_CALL,
      [tj.TOOL_DETAIL_ATTRS.MCP_SERVER]: el,
      [tj.TOOL_DETAIL_ATTRS.MCP_TOOL]: ec,
    });
    try {
      let eA: any = await ed();
      return (eg?.markAsSuccessful(), eA);
    } catch (eA: any) {
      throw (eg?.markAsFailed(eA), eA);
    }
  }
  function isMutableMcpTransport(eA: any): any {
    return (
      !!eA &&
      "object" == typeof eA &&
      ("_fetch" in eA || "_eventSourceInit" in eA)
    );
  }
  function injectHeader(eA: any, el: any): any {
    let ec: any = new Headers(eA?.headers);
    return (ec.set(Ap.MODEL_ID_HEADER, el), { ...(eA ?? {}), headers: ec });
  }
  function wrapFetchWithModelIdInjection(eA: any): any {
    return async (el: any, ec: any) => {
      let eu: any = Ah.getStore();
      return eu ? eA(el, injectHeader(ec, eu)) : eA(el, ec);
    };
  }
  function ensureFetchWrapped(eA: any): any {
    if (eA[Ag]) return;
    let el: any = eA._fetch ?? ((eA: any, el: any) => fetch(eA, el));
    if (
      ((eA._fetch = wrapFetchWithModelIdInjection(el)), eA._eventSourceInit)
    ) {
      let ec: any = eA._eventSourceInit.fetch ?? el;
      eA._eventSourceInit.fetch = wrapFetchWithModelIdInjection(ec);
    }
    eA[Ag] = !0;
  }
  async function withMcpModelIdHeader(eA: any, el: any): Promise<any> {
    let { transport: ec, modelId: eu } = eA;
    return eu && isMutableMcpTransport(ec)
      ? (ensureFetchWrapped(ec), Ah.run(eu, el))
      : el();
  }
  function emitMcpToolResultSideband(eA: any, el: any, ec: any): any {
    ec && ec({ ...("object" == typeof eA && null !== eA ? eA : {}), ...el });
  }
  function sanitizeMcpErrorMessage(eA: any): any {
    if (eA.includes("<!DOCTYPE html") || eA.includes("<html")) {
      let el: any = eA.match(/<title>([^<]+)<\/title>/i),
        ec: any = el?.[1]?.trim(),
        eu: any = eA.match(/\(HTTP (\d{3})\)/),
        ed: any = eu ? eu[0] : "";
      return ec
        ? ed
          ? `${ed}: ${ec}`
          : ec
        : ed
          ? `${ed}: Server returned an HTML error page`
          : "Server returned an HTML error page";
    }
    return eA.length > Am ? eA.slice(0, Am) + "... [truncated]" : eA;
  }
  function isMainAgentRunning(eA: any): any {
    return tU.ContainerUtil.get(t1.SessionRunStateMachine).isBusy(eA);
  }
  function escapeXmlAttr(eA: any): any {
    return eA
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
  function registerChannelNotificationHandlers(eA: any, el: any, ec: any): any {
    let eu: any,
      ed: any = tU.ContainerUtil.get(tj.Logger);
    ed.debug(`[Channel] Registering notification handlers for: ${el}`);
    let ep: any = tU.ContainerUtil.get(t1.SessionManager);
    ep?.sessionSubject &&
      (ep.sessionSubject.subscribe((eA: any) => {
        eA && (eu = eA);
      }),
      (eu = ep.getCurrent() || ep.sessionSubject.getValue()));
    let eg: any = !1;
    (eA.setNotificationHandler(
      Au.ChannelNotificationSchema,
      async (eA: any) => {
        try {
          ed.debug(`[Channel] Received notification from ${el}`);
          let eh: any = eA.params.meta?.sender_id;
          if (eh && !ec.shouldBypassAllowlist(el))
            try {
              let eA: any = tU.ContainerUtil.get(Au.ChannelSecurityManager);
              if (eA && !(await eA.isAllowedSender(el, eh)))
                return void ed.info(
                  `[Channel] Sender ${eh} not allowed for ${el}`,
                );
            } catch {}
          let ef: any =
            eu || ep?.sessionSubject?.getValue() || ep?.getCurrent();
          if (
            (!ef &&
              ep &&
              (ed.debug("[Channel] No session available, waiting..."),
              (ef = await new Promise((eA: any) => {
                let el: any = ep.sessionSubject.subscribe((ec: any) => {
                  ec && (el.unsubscribe(), eA(ec));
                });
                setTimeout(() => {
                  (el.unsubscribe(), eA(void 0));
                }, 3e4);
              })) && (eu = ef)),
            !ef)
          )
            return void ed.warn(
              `[Channel] No session found for notification from ${el}, discarding`,
            );
          let em: any = eA.params.meta ?? {},
            eE: any = /^[a-zA-Z_][a-zA-Z0-9_]*$/,
            eC: any = [`source="${escapeXmlAttr(el)}"`];
          for (let [eA, el] of Object.entries(em))
            eE.test(eA) &&
              "source" !== eA &&
              eC.push(`${eA}="${escapeXmlAttr(String(el))}"`);
          if (!em.sender) {
            let eA: any = em.sender_id || em.user || el;
            eC.push(`sender="${escapeXmlAttr(eA)}"`);
          }
          let ey: any = (0, Ac.user)(`<channel ${eC.join(" ")}>
${eA.params.content}
</channel>`),
            ew: any = tU.ContainerUtil.get(t1.MessageQueueManager);
          isMainAgentRunning(ef) || eg
            ? (ed.debug(`[Channel] Agent busy, enqueueing message from ${el}`),
              ew.enqueueMessage(ef, ey))
            : ((eg = !0),
              ed.debug(`[Channel] Waking agent for channel message from ${el}`),
              (async () => {
                let eA: any, eu: any;
                ep && ep.setCurrent(ef);
                let eh: any = ec.channelServers.get(el),
                  em: any = eh?.hasPermissionRelay ?? !1;
                em ||
                  ((eA = ef.permissionModeSubject.value),
                  ef.permissionModeSubject.next(
                    t2.PermissionMode.BypassPermissions,
                  ));
                let eE: any = tU.ContainerUtil.get(t1.SessionRunStateMachine);
                eE.forceIdle(ef, "mcp-channel-wake-before-run");
                let eC: any = !1,
                  ew: any = {},
                  restore: any = () => {
                    if (!eC) {
                      if (((eC = !0), ew.current?.unsubscribe(), eu))
                        try {
                          let eA: any = tU.ContainerUtil.get(Al.AgentManager),
                            el: any = eA.default ?? eA.cachedDefault;
                          el?.off && el.off("agent_end", eu);
                        } catch {}
                      (em || ef.permissionModeSubject.next(eA),
                        ed.debug(
                          "[Channel] Restored permission mode after agent run",
                        ));
                    }
                  };
                try {
                  let eA: any = tU.ContainerUtil.get(Al.AgentManager),
                    el: any = await eA.getDefault();
                  "function" == typeof el?.on &&
                    "function" == typeof el?.off &&
                    ((eu = () => {
                      restore();
                    }),
                    el.on("agent_end", eu));
                } catch {}
                let eB: any = !0;
                ew.current = eE.getChange$(ef).subscribe(() => {
                  if (eB) {
                    eB = !1;
                    return;
                  }
                  eE.isIdle(ef) && restore();
                });
                let e_: any = setTimeout(() => {
                  restore();
                }, 6e4);
                try {
                  let eA: any = tU.ContainerUtil.get(Al.AgentService),
                    el: any = tU.ContainerUtil.get(Al.AgentManager),
                    ec: any = tU.ContainerUtil.get(t1.SessionManager);
                  await ec.run(ef, async () => {
                    await eA.run(await el.getDefault(), [ey], { context: ef });
                  });
                } catch (eA: any) {
                  (ed.error(
                    "[Channel] Error running agent for channel message:",
                    eA,
                  ),
                    restore());
                } finally {
                  (clearTimeout(e_), (eg = !1));
                }
              })());
        } catch (eA: any) {
          ed.error(`[Channel] Error processing notification from ${el}:`, eA);
        }
      },
    ),
      eA.setNotificationHandler(
        Au.ChannelPermissionResponseSchema,
        async (eA: any) => {
          try {
            let el: any = tU.ContainerUtil.get(Au.ChannelPermissionAdapter);
            el &&
              el.handlePermissionResponse({
                requestId: eA.params.request_id,
                behavior: eA.params.behavior,
              });
          } catch {}
        },
      ));
  }
  function registerChannelIfApplicable(eA: any, el: any, ec: any): any {
    let eu: any = tU.ContainerUtil.get(tj.Logger);
    try {
      let eu: any = tU.ContainerUtil.get(Au.ChannelManager);
      if (eu && ec) {
        let ed: any = eA.getInstructions?.();
        (eu.registerChannel(el, eA, ec, ed),
          eu.isChannel(el) && registerChannelNotificationHandlers(eA, el, eu));
      }
    } catch (eA: any) {
      eu.warn(`[Channel] Error in registerChannelIfApplicable for ${el}:`, eA);
    }
  }
  function extractProgressCallback(eA: any): any {
    if (!eA) return {};
    let el: any = eA.__onProgress,
      ec: any = eA.__resultMetaSink,
      eu: any = eA.__signal,
      ed: any = "number" == typeof eA.__timeoutMs ? eA.__timeoutMs : void 0;
    if (void 0 === el && void 0 === ec && void 0 === eu && void 0 === ed)
      return { realMeta: eA };
    let ep: any = { ...eA };
    return (
      delete ep.__onProgress,
      delete ep.__resultMetaSink,
      delete ep.__signal,
      delete ep.__timeoutMs,
      {
        onProgress: el,
        resultMetaSink: ec,
        abortSignal: eu,
        timeoutMs: ed,
        realMeta: Object.keys(ep).length > 0 ? ep : void 0,
      }
    );
  }
  function sdk_mcp_server_escapeXmlAttr(eA: any): any {
    return eA
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
  function sdk_mcp_server_sanitizeMcpErrorMessage(eA: any): any {
    if (eA.includes("<!DOCTYPE html") || eA.includes("<html")) {
      let el: any = eA.match(/<title>([^<]+)<\/title>/i),
        ec: any = el?.[1]?.trim(),
        eu: any = eA.match(/\(HTTP (\d{3})\)/),
        ed: any = eu ? eu[0] : "";
      return ec
        ? ed
          ? `${ed}: ${ec}`
          : ec
        : ed
          ? `${ed}: Server returned an HTML error page`
          : "Server returned an HTML error page";
    }
    return eA.length > Aw ? eA.slice(0, Aw) + "... [truncated]" : eA;
  }
  function hasStaticAuthorization(eA: any): any {
    let el: any = eA?.Authorization ?? eA?.authorization;
    return "string" == typeof el && /^(basic|bearer)\s+\S/i.test(el.trim());
  }
  function computeMcpConfigFingerprint(eA: any): any {
    let sortRecord: any = (eA: any) => {
        if (!eA) return;
        let el: any = {};
        for (let ec of Object.keys(eA).sort()) el[ec] = eA[ec];
        return el;
      },
      el: any = eA;
    return JSON.stringify({
      type: eA.type,
      url: el.url,
      headers: sortRecord(el.headers),
      command: el.command,
      args: el.args,
      env: sortRecord(el.env),
    });
  }
  // UTF-16 9163484..9167354
  class OverriddenUnderlyingMCPServerStdio extends tF.UnderlyingMCPServerStdio {
    [key: string]: any;
    constructor() {
      (super(...arguments),
        (this.transport = null),
        (this._lastListToolsFailure = 0));
    }
    async connect(): Promise<any> {
      try {
        let eA: any = tU.ContainerUtil.get(tF.McpTransportManager);
        ((this.transport = await eA.create(this._name, {
          command: this.params.command,
          args: this.params.args,
          env: { ...process.env, ...this.params.env, NODE_OPTIONS: "" },
          cwd: this.params.cwd,
          stderr: "ignore",
        })),
          (this.session = new tF.Client({
            name: this._name,
            version: "1.0.0",
          })),
          await this.session.connect(
            this.transport,
            this.params.timeout ? { timeout: this.params.timeout } : void 0,
          ));
        let el: any = this.session.getServerCapabilities?.();
        (el?.tools?.listChanged &&
          this.session.setNotificationHandler(
            tF.ToolListChangedNotificationSchema,
            async () => {
              ((this._cacheDirty = !0),
                (this._toolsList = []),
                this.onToolsListChanged?.());
            },
          ),
          registerChannelIfApplicable(this.session, this._name, el),
          (this.serverInitializeResult = {
            serverInfo: { name: this._name, version: "1.0.0" },
          }));
      } catch (eA: any) {
        throw (
          this.logger.error("Error initializing MCP server:", eA),
          await this.close(),
          eA
        );
      }
    }
    async listTools(): Promise<any> {
      if (!this.session) return [];
      if (this.cacheToolsList && !this._cacheDirty && this._toolsList)
        return this._toolsList;
      if (
        this._lastListToolsFailure &&
        Date.now() - this._lastListToolsFailure < Af
      )
        return this._toolsList || [];
      try {
        ((this._cacheDirty = !1), (this._lastListToolsFailure = 0));
        let eA: any = await this.session.listTools();
        return (
          (this._toolsList = tF.ListToolsResultSchema.parse(eA).tools),
          this._toolsList
        );
      } catch (el: any) {
        let eA: any = sanitizeMcpErrorMessage(
          el instanceof Error ? el.message : String(el),
        );
        return (
          this.logger.debug(
            `[MCP] Failed to listTools from server "${this._name}": ${eA}`,
          ),
          (this._cacheDirty = !0),
          (this._lastListToolsFailure = Date.now()),
          this._toolsList || []
        );
      }
    }
    async callTool(eA: any, el: any, ec: any): Promise<any> {
      if (!this.session)
        throw Error(
          "Server not initialized. Make sure you call connect() first.",
        );
      let eu: any = t8.McpUtils.getToolTimeout(),
        {
          onProgress: ed,
          resultMetaSink: ep,
          abortSignal: eg,
          timeoutMs: eh,
          realMeta: ef,
        } = extractProgressCallback(ec);
      try {
        let ec: any = await this.session.callTool(
            { name: eA, arguments: el ?? {}, ...(ef ? { _meta: ef } : {}) },
            void 0,
            {
              timeout: eh ?? eu,
              ...(eg ? { signal: eg } : {}),
              ...(ed
                ? {
                    onprogress: (eA: any) =>
                      ed(eA.progress, eA.total, eA.message),
                  }
                : {}),
            },
          ),
          em: any = tF.CallToolResultSchema.parse(ec);
        return (emitMcpToolResultSideband(ec, em, ep), em.content);
      } catch (ec: any) {
        let el: any = sanitizeMcpErrorMessage(
          ec instanceof Error ? ec.message : String(ec),
        );
        throw Error(
          `[MCP] Failed to callTool "${eA}" from server "${this._name}": ${el}`,
        );
      }
    }
    async listPrompts(): Promise<any> {
      if (!this.session)
        throw Error(
          "Server not initialized. Make sure you call connect() first.",
        );
      if (!this.session.getServerCapabilities?.()?.prompts) return [];
      let eA: any = await this.session.listPrompts();
      return tF.ListPromptsResultSchema.parse(eA).prompts;
    }
    async listResources(): Promise<any> {
      if (!this.session)
        throw Error(
          "Server not initialized. Make sure you call connect() first.",
        );
      if (!this.session.getServerCapabilities?.()?.resources) return [];
      let eA: any = await this.session.listResources();
      return tF.ListResourcesResultSchema.parse(eA).resources;
    }
    async listResourceTemplates(): Promise<any> {
      if (!this.session)
        throw Error(
          "Server not initialized. Make sure you call connect() first.",
        );
      let eA: any = await this.session.listResourceTemplates();
      return tF.ListResourceTemplatesResultSchema.parse(eA).resourceTemplates;
    }
    async getPrompt(eA: any, el: any): Promise<any> {
      if (!this.session)
        throw Error(
          "Server not initialized. Make sure you call connect() first.",
        );
      try {
        let ec: any = await this.session.getPrompt({ name: eA, arguments: el });
        return tF.GetPromptResultSchema.parse(ec).messages;
      } catch (ec: any) {
        let el: any = sanitizeMcpErrorMessage(
          ec instanceof Error ? ec.message : String(ec),
        );
        throw (
          this.logger.error(
            `[MCP] Failed to getPrompt "${eA}" from server "${this._name}": ${el}`,
          ),
          Error(
            `[MCP] Failed to getPrompt "${eA}" from server "${this._name}": ${el}`,
          )
        );
      }
    }
    async readResource(eA: any): Promise<any> {
      if (!this.session)
        throw Error(
          "Server not initialized. Make sure you call connect() first.",
        );
      let el: any = await this.session.readResource(eA);
      return tF.ReadResourceResultSchema.parse(el).contents;
    }
  }
  // UTF-16 9167384..9168040
  class OverriddenMCPServerStdio extends tF.MCPServerStdio {
    [key: string]: any;
    constructor(eA: any) {
      (super(eA),
        (this.underlying = new (OverriddenUnderlyingMCPServerStdio as any)(
          eA,
        )));
    }
    get onToolsListChanged(): any {
      return this.underlying.onToolsListChanged;
    }
    set onToolsListChanged(eA: any) {
      this.underlying.onToolsListChanged = eA;
    }
    connect(): any {
      return this.underlying.connect();
    }
    listTools(): any {
      return this.underlying.listTools();
    }
    listPrompts(): any {
      return this.underlying.listPrompts();
    }
    listResources(): any {
      return this.underlying.listResources();
    }
    listResourceTemplates(): any {
      return this.underlying.listResourceTemplates();
    }
    getPrompt(eA: any, el: any): any {
      return this.underlying.getPrompt(eA, el);
    }
    readResource(eA: any): any {
      return this.underlying.readResource(eA);
    }
  }
  // UTF-16 9168078..9172056
  class OverriddenUnderlyingMCPServerSSE extends tF.UnderlyingMCPServerSSE {
    [key: string]: any;
    constructor() {
      (super(...arguments),
        (this.transport = null),
        (this._lastListToolsFailure = 0));
    }
    async connect(): Promise<any> {
      try {
        let eA: any = tU.ContainerUtil.get(tF.McpTransportManager);
        ((this.transport = await eA.create(this._name, {
          authProvider: this.params.authProvider,
          requestInit: this.params.requestInit,
          eventSourceInit: this.params.eventSourceInit,
        })),
          (this.session = new tF.Client({
            name: this._name,
            version: "1.0.0",
          })),
          await this.session.connect(
            this.transport,
            this.params.timeout ? { timeout: this.params.timeout } : void 0,
          ));
        let el: any = this.session.getServerCapabilities?.();
        (el?.tools?.listChanged &&
          this.session.setNotificationHandler(
            tF.ToolListChangedNotificationSchema,
            async () => {
              ((this._cacheDirty = !0),
                (this._toolsList = []),
                this.onToolsListChanged?.());
            },
          ),
          registerChannelIfApplicable(this.session, this._name, el),
          (this.serverInitializeResult = {
            serverInfo: { name: this._name, version: "1.0.0" },
          }));
      } catch (eA: any) {
        throw (
          this.logger.error("Error initializing MCP server:", eA),
          await this.close(),
          eA
        );
      }
    }
    async listTools(): Promise<any> {
      if (!this.session) return [];
      if (this.cacheToolsList && !this._cacheDirty && this._toolsList)
        return this._toolsList;
      if (
        this._lastListToolsFailure &&
        Date.now() - this._lastListToolsFailure < Af
      )
        return this._toolsList || [];
      try {
        ((this._cacheDirty = !1), (this._lastListToolsFailure = 0));
        let eA: any = await this.session.listTools();
        return (
          (this._toolsList = tF.ListToolsResultSchema.parse(eA).tools),
          this._toolsList
        );
      } catch (el: any) {
        let eA: any = sanitizeMcpErrorMessage(
          el instanceof Error ? el.message : String(el),
        );
        return (
          this.logger.debug(
            `[MCP] Failed to listTools from server "${this._name}": ${eA}`,
          ),
          (this._cacheDirty = !0),
          (this._lastListToolsFailure = Date.now()),
          this._toolsList || []
        );
      }
    }
    async callTool(eA: any, el: any, ec: any): Promise<any> {
      if (!this.session)
        throw Error(
          "Server not initialized. Make sure you call connect() first.",
        );
      let eu: any = t8.McpUtils.getToolTimeout(),
        {
          onProgress: ed,
          resultMetaSink: ep,
          abortSignal: eg,
          timeoutMs: eh,
          realMeta: ef,
        } = extractProgressCallback(ec),
        em: any = "string" == typeof ef?.modelId ? ef.modelId : void 0;
      try {
        let ec: any = await withMcpModelIdHeader(
            { serverName: this._name, transport: this.transport, modelId: em },
            () =>
              this.session.callTool(
                { name: eA, arguments: el ?? {}, ...(ef ? { _meta: ef } : {}) },
                void 0,
                {
                  timeout: eh ?? eu,
                  ...(eg ? { signal: eg } : {}),
                  ...(ed
                    ? {
                        onprogress: (eA: any) =>
                          ed(eA.progress, eA.total, eA.message),
                      }
                    : {}),
                },
              ),
          ),
          eE: any = tF.CallToolResultSchema.parse(ec);
        return (emitMcpToolResultSideband(ec, eE, ep), eE.content);
      } catch (ec: any) {
        let el: any = sanitizeMcpErrorMessage(
          ec instanceof Error ? ec.message : String(ec),
        );
        throw Error(
          `[MCP] Failed to callTool "${eA}" from server "${this._name}": ${el}`,
        );
      }
    }
    async listPrompts(): Promise<any> {
      if (!this.session)
        throw Error(
          "Server not initialized. Make sure you call connect() first.",
        );
      if (!this.session.getServerCapabilities?.()?.prompts) return [];
      let eA: any = await this.session.listPrompts();
      return tF.ListPromptsResultSchema.parse(eA).prompts;
    }
    async listResources(): Promise<any> {
      if (!this.session)
        throw Error(
          "Server not initialized. Make sure you call connect() first.",
        );
      if (!this.session.getServerCapabilities?.()?.resources) return [];
      let eA: any = await this.session.listResources();
      return tF.ListResourcesResultSchema.parse(eA).resources;
    }
    async listResourceTemplates(): Promise<any> {
      if (!this.session)
        throw Error(
          "Server not initialized. Make sure you call connect() first.",
        );
      let eA: any = await this.session.listResourceTemplates();
      return tF.ListResourceTemplatesResultSchema.parse(eA).resourceTemplates;
    }
    async getPrompt(eA: any, el: any): Promise<any> {
      if (!this.session)
        throw Error(
          "Server not initialized. Make sure you call connect() first.",
        );
      try {
        let ec: any = await this.session.getPrompt({ name: eA, arguments: el });
        return tF.GetPromptResultSchema.parse(ec).messages;
      } catch (ec: any) {
        let el: any = sanitizeMcpErrorMessage(
          ec instanceof Error ? ec.message : String(ec),
        );
        throw (
          this.logger.error(
            `[MCP] Failed to getPrompt "${eA}" from server "${this._name}": ${el}`,
          ),
          Error(
            `[MCP] Failed to getPrompt "${eA}" from server "${this._name}": ${el}`,
          )
        );
      }
    }
    async readResource(eA: any): Promise<any> {
      if (!this.session)
        throw Error(
          "Server not initialized. Make sure you call connect() first.",
        );
      let el: any = await this.session.readResource(eA);
      return tF.ReadResourceResultSchema.parse(el).contents;
    }
  }
  // UTF-16 9172084..9172734
  class OverriddenMCPServerSSE extends tF.MCPServerSSE {
    [key: string]: any;
    constructor(eA: any) {
      (super(eA),
        (this.underlying = new (OverriddenUnderlyingMCPServerSSE as any)(eA)));
    }
    get onToolsListChanged(): any {
      return this.underlying.onToolsListChanged;
    }
    set onToolsListChanged(eA: any) {
      this.underlying.onToolsListChanged = eA;
    }
    connect(): any {
      return this.underlying.connect();
    }
    listTools(): any {
      return this.underlying.listTools();
    }
    listPrompts(): any {
      return this.underlying.listPrompts();
    }
    listResources(): any {
      return this.underlying.listResources();
    }
    listResourceTemplates(): any {
      return this.underlying.listResourceTemplates();
    }
    getPrompt(eA: any, el: any): any {
      return this.underlying.getPrompt(eA, el);
    }
    readResource(eA: any): any {
      return this.underlying.readResource(eA);
    }
  }
  // UTF-16 9172783..9176847
  class OverriddenUnderlyingMCPServerStreamableHttp extends tF.UnderlyingMCPServerStreamableHttp {
    [key: string]: any;
    constructor() {
      (super(...arguments),
        (this.transport = null),
        (this._lastListToolsFailure = 0));
    }
    async connect(): Promise<any> {
      try {
        let eA: any = tU.ContainerUtil.get(tF.McpTransportManager);
        ((this.transport = await eA.create(this._name, {
          authProvider: this.params.authProvider,
          requestInit: this.params.requestInit,
          fetch: this.params.fetch,
          reconnectionOptions: this.params.reconnectionOptions,
          sessionId: this.params.sessionId,
        })),
          (this.session = new tF.Client({
            name: this._name,
            version: "1.0.0",
          })),
          await this.session.connect(
            this.transport,
            this.params.timeout ? { timeout: this.params.timeout } : void 0,
          ));
        let el: any = this.session.getServerCapabilities?.();
        (el?.tools?.listChanged &&
          this.session.setNotificationHandler(
            tF.ToolListChangedNotificationSchema,
            async () => {
              ((this._cacheDirty = !0),
                (this._toolsList = []),
                this.onToolsListChanged?.());
            },
          ),
          registerChannelIfApplicable(this.session, this._name, el),
          (this.serverInitializeResult = {
            serverInfo: { name: this._name, version: "1.0.0" },
          }));
      } catch (eA: any) {
        throw (
          this.logger.error("Error initializing MCP server:", eA),
          await this.close(),
          eA
        );
      }
    }
    async listTools(): Promise<any> {
      if (!this.session) return [];
      if (this.cacheToolsList && !this._cacheDirty && this._toolsList)
        return this._toolsList;
      if (
        this._lastListToolsFailure &&
        Date.now() - this._lastListToolsFailure < Af
      )
        return this._toolsList || [];
      try {
        ((this._cacheDirty = !1), (this._lastListToolsFailure = 0));
        let eA: any = await this.session.listTools();
        return (
          (this._toolsList = tF.ListToolsResultSchema.parse(eA).tools),
          this._toolsList
        );
      } catch (el: any) {
        let eA: any = sanitizeMcpErrorMessage(
          el instanceof Error ? el.message : String(el),
        );
        return (
          this.logger.debug(
            `[MCP] Failed to listTools from server "${this._name}": ${eA}`,
          ),
          (this._cacheDirty = !0),
          (this._lastListToolsFailure = Date.now()),
          this._toolsList || []
        );
      }
    }
    async callTool(eA: any, el: any, ec: any): Promise<any> {
      if (!this.session)
        throw Error(
          "Server not initialized. Make sure you call connect() first.",
        );
      let eu: any = t8.McpUtils.getToolTimeout(),
        {
          onProgress: ed,
          resultMetaSink: ep,
          abortSignal: eg,
          timeoutMs: eh,
          realMeta: ef,
        } = extractProgressCallback(ec),
        em: any = "string" == typeof ef?.modelId ? ef.modelId : void 0;
      try {
        let ec: any = await withMcpModelIdHeader(
            { serverName: this._name, transport: this.transport, modelId: em },
            () =>
              this.session.callTool(
                { name: eA, arguments: el ?? {}, ...(ef ? { _meta: ef } : {}) },
                void 0,
                {
                  timeout: eh ?? eu,
                  ...(eg ? { signal: eg } : {}),
                  ...(ed
                    ? {
                        onprogress: (eA: any) =>
                          ed(eA.progress, eA.total, eA.message),
                      }
                    : {}),
                },
              ),
          ),
          eE: any = tF.CallToolResultSchema.parse(ec);
        return (emitMcpToolResultSideband(ec, eE, ep), eE.content);
      } catch (ec: any) {
        let el: any = sanitizeMcpErrorMessage(
          ec instanceof Error ? ec.message : String(ec),
        );
        throw Error(
          `[MCP] Failed to callTool "${eA}" from server "${this._name}": ${el}`,
        );
      }
    }
    async listPrompts(): Promise<any> {
      if (!this.session)
        throw Error(
          "Server not initialized. Make sure you call connect() first.",
        );
      if (!this.session.getServerCapabilities?.()?.prompts) return [];
      let eA: any = await this.session.listPrompts();
      return tF.ListPromptsResultSchema.parse(eA).prompts;
    }
    async listResources(): Promise<any> {
      if (!this.session)
        throw Error(
          "Server not initialized. Make sure you call connect() first.",
        );
      if (!this.session.getServerCapabilities?.()?.resources) return [];
      let eA: any = await this.session.listResources();
      return tF.ListResourcesResultSchema.parse(eA).resources;
    }
    async listResourceTemplates(): Promise<any> {
      if (!this.session)
        throw Error(
          "Server not initialized. Make sure you call connect() first.",
        );
      let eA: any = await this.session.listResourceTemplates();
      return tF.ListResourceTemplatesResultSchema.parse(eA).resourceTemplates;
    }
    async getPrompt(eA: any, el: any): Promise<any> {
      if (!this.session)
        throw Error(
          "Server not initialized. Make sure you call connect() first.",
        );
      try {
        let ec: any = await this.session.getPrompt({ name: eA, arguments: el });
        return tF.GetPromptResultSchema.parse(ec).messages;
      } catch (ec: any) {
        let el: any = sanitizeMcpErrorMessage(
          ec instanceof Error ? ec.message : String(ec),
        );
        throw (
          this.logger.error(
            `[MCP] Failed to getPrompt "${eA}" from server "${this._name}": ${el}`,
          ),
          Error(
            `[MCP] Failed to getPrompt "${eA}" from server "${this._name}": ${el}`,
          )
        );
      }
    }
    async readResource(eA: any): Promise<any> {
      if (!this.session)
        throw Error(
          "Server not initialized. Make sure you call connect() first.",
        );
      let el: any = await this.session.readResource(eA);
      return tF.ReadResourceResultSchema.parse(el).contents;
    }
  }
  // UTF-16 9176886..9177569
  class OverriddenMCPServerStreamableHttp extends tF.MCPServerStreamableHttp {
    [key: string]: any;
    constructor(eA: any) {
      (super(eA),
        (this.underlying =
          new (OverriddenUnderlyingMCPServerStreamableHttp as any)(eA)));
    }
    get onToolsListChanged(): any {
      return this.underlying.onToolsListChanged;
    }
    set onToolsListChanged(eA: any) {
      this.underlying.onToolsListChanged = eA;
    }
    connect(): any {
      return this.underlying.connect();
    }
    listTools(): any {
      return this.underlying.listTools();
    }
    listPrompts(): any {
      return this.underlying.listPrompts();
    }
    listResources(): any {
      return this.underlying.listResources();
    }
    listResourceTemplates(): any {
      return this.underlying.listResourceTemplates();
    }
    getPrompt(eA: any, el: any): any {
      return this.underlying.getPrompt(eA, el);
    }
    readResource(eA: any): any {
      return this.underlying.readResource(eA);
    }
  }
  // UTF-16 9177633..9178529
  class SdkMcpTransport {
    [key: string]: any;
    get sessionId(): any {
      return this._sessionId;
    }
    set sessionId(eA: any) {
      this._sessionId = eA;
    }
    constructor(eA: any) {
      ((this.isClosed = !1),
        (this.inflightControllers = new Set()),
        (this.serverName = eA.serverName),
        (this.sendMcpMessage = eA.sendMcpMessage));
    }
    async start(): Promise<any> {}
    async send(eA: any, el: any): Promise<any> {
      if (this.isClosed)
        throw Error(`SDK MCP Transport for "${this.serverName}" is closed`);
      let ec: any = new AbortController();
      this.inflightControllers.add(ec);
      try {
        let el: any = await this.sendMcpMessage(this.serverName, eA, ec.signal);
        this.onmessage && this.onmessage(el);
      } catch (eA: any) {
        if (ec.signal.aborted) return;
        throw (
          this.onerror &&
            this.onerror(eA instanceof Error ? eA : Error(String(eA))),
          eA
        );
      } finally {
        this.inflightControllers.delete(ec);
      }
    }
    async close(): Promise<any> {
      if (!this.isClosed) {
        for (let eA of ((this.isClosed = !0), this.inflightControllers))
          eA.abort();
        (this.inflightControllers.clear(), this.onclose && this.onclose());
      }
    }
    setProtocolVersion(eA: any): any {}
    get closed(): any {
      return this.isClosed;
    }
  }
  // UTF-16 9179086..9185768
  class SdkMcpServer {
    declare static mockLogger: any;
    declare static LIST_TOOLS_RETRY_COOLDOWN: number;
    [key: string]: any;
    constructor(eA: any) {
      ((this.transport = null),
        (this.session = null),
        (this._toolsList = []),
        (this._cacheDirty = !0),
        (this.cacheToolsList = !1),
        (this._lastListToolsFailure = 0),
        (this.name = eA.name),
        (this.params = eA),
        (this.logger = eA.logger || SdkMcpServer.mockLogger),
        (this.toolFilter = eA.toolFilter));
    }
    async connect(): Promise<any> {
      try {
        let eA: any = {
          serverName: this.name,
          sendMcpMessage: this.params.sendMcpMessage,
        };
        ((this.transport = new SdkMcpTransport(eA)),
          (this.session = new Ay.Client({ name: this.name, version: "1.0.0" })),
          await this.session.connect(
            this.transport,
            this.params.timeout ? { timeout: this.params.timeout } : void 0,
          ));
        let el: any = this.session.getServerCapabilities?.();
        el?.tools?.listChanged &&
          this.session.setNotificationHandler(
            tF.ToolListChangedNotificationSchema,
            async () => {
              ((this._cacheDirty = !0),
                (this._toolsList = []),
                this.onToolsListChanged?.());
            },
          );
        let ec: any = tU.ContainerUtil.get(Au.ChannelManager);
        if (ec && el) {
          let eA: any = this.session.getInstructions?.();
          (ec.registerChannel(this.name, this.session, el, eA),
            ec.isChannel(this.name) &&
              this.registerChannelNotificationHandlers(
                this.session,
                this.name,
                ec,
              ));
        }
        this.logger.info?.(
          `SDK MCP Server "${this.name}" connected successfully`,
        );
      } catch (eA: any) {
        throw (
          this.logger.error?.("Error initializing SDK MCP server:", eA),
          await this.close(),
          eA
        );
      }
    }
    async close(): Promise<any> {
      try {
        (this.session && (await this.session.close(), (this.session = null)),
          this.transport &&
            (await this.transport.close(), (this.transport = null)));
      } catch (eA: any) {
        this.logger.error?.("Error closing SDK MCP server:", eA);
      }
    }
    registerChannelNotificationHandlers(eA: any, el: any, ec: any): any {
      let eu: any,
        ed: any = tU.ContainerUtil.get(t1.SessionManager);
      ed?.sessionSubject &&
        (ed.sessionSubject.subscribe((eA: any) => {
          eA && (eu = eA);
        }),
        (eu = ed.getCurrent() || ed.sessionSubject.getValue()));
      let ep: any = !1;
      (eA.setNotificationHandler(
        Au.ChannelNotificationSchema,
        async (eA: any) => {
          try {
            let eg: any = eA.params.meta?.sender_id;
            if (eg && !ec.shouldBypassAllowlist(el))
              try {
                let eA: any = tU.ContainerUtil.get(Au.ChannelSecurityManager);
                if (eA && !(await eA.isAllowedSender(el, eg))) return;
              } catch {}
            let eh: any =
              eu || ed?.sessionSubject?.getValue() || ed?.getCurrent();
            if (
              (!eh &&
                ed &&
                (eh = await new Promise((eA: any) => {
                  let el: any = ed.sessionSubject.subscribe((ec: any) => {
                    ec && (el.unsubscribe(), eA(ec));
                  });
                  setTimeout(() => {
                    (el.unsubscribe(), eA(void 0));
                  }, 3e4);
                })) &&
                (eu = eh),
              !eh)
            )
              return;
            let ef: any = eA.params.meta ?? {},
              em: any = /^[a-zA-Z_][a-zA-Z0-9_]*$/,
              eE: any = [`source="${sdk_mcp_server_escapeXmlAttr(el)}"`];
            for (let [eA, el] of Object.entries(ef))
              em.test(eA) &&
                "source" !== eA &&
                eE.push(`${eA}="${sdk_mcp_server_escapeXmlAttr(String(el))}"`);
            if (!ef.sender) {
              let eA: any = ef.sender_id || ef.user || el;
              eE.push(`sender="${sdk_mcp_server_escapeXmlAttr(eA)}"`);
            }
            let eC: any = (0, Ac.user)(`<channel ${eE.join(" ")}>
${eA.params.content}
</channel>`),
              ey: any = tU.ContainerUtil.get(t1.MessageQueueManager);
            tU.ContainerUtil.get(t1.SessionRunStateMachine).isBusy(eh) || ep
              ? ey.enqueueMessage(eh, eC)
              : ((ep = !0),
                (async () => {
                  let eA: any;
                  ed && ed.setCurrent(eh);
                  let el: any = eh.permissionModeSubject.value;
                  eh.permissionModeSubject.next(
                    t2.PermissionMode.BypassPermissions,
                  );
                  let ec: any = tU.ContainerUtil.get(t1.SessionRunStateMachine);
                  ec.forceIdle(eh, "sdk-mcp-channel-wake-before-run");
                  let eu: any = !1,
                    eg: any = {},
                    restore: any = () => {
                      if (!eu) {
                        if (((eu = !0), eg.current?.unsubscribe(), eA))
                          try {
                            let el: any = tU.ContainerUtil.get(Al.AgentManager),
                              ec: any = el.default ?? el.cachedDefault;
                            ec?.off && ec.off("agent_end", eA);
                          } catch {}
                        eh.permissionModeSubject.next(el);
                      }
                    };
                  try {
                    let el: any = tU.ContainerUtil.get(Al.AgentManager),
                      ec: any = await el.getDefault();
                    "function" == typeof ec?.on &&
                      "function" == typeof ec?.off &&
                      ((eA = () => {
                        restore();
                      }),
                      ec.on("agent_end", eA));
                  } catch {}
                  let ef: any = !0;
                  eg.current = ec.getChange$(eh).subscribe(() => {
                    if (ef) {
                      ef = !1;
                      return;
                    }
                    ec.isIdle(eh) && restore();
                  });
                  let em: any = setTimeout(() => {
                    restore();
                  }, 6e4);
                  try {
                    let eA: any = tU.ContainerUtil.get(Al.AgentService),
                      el: any = tU.ContainerUtil.get(Al.AgentManager);
                    await eA.run(await el.getDefault(), [eC], { context: eh });
                  } catch {
                    restore();
                  } finally {
                    (clearTimeout(em), (ep = !1));
                  }
                })());
          } catch {}
        },
      ),
        eA.setNotificationHandler(
          Au.ChannelPermissionResponseSchema,
          async (eA: any) => {
            try {
              let el: any = tU.ContainerUtil.get(Au.ChannelPermissionAdapter);
              el &&
                el.handlePermissionResponse({
                  requestId: eA.params.request_id,
                  behavior: eA.params.behavior,
                });
            } catch {}
          },
        ));
    }
    async invalidateToolsCache(): Promise<any> {
      this._cacheDirty = !0;
    }
    async listTools(): Promise<any> {
      if (!this.session) return [];
      if (this.cacheToolsList && !this._cacheDirty && this._toolsList)
        return this._toolsList;
      if (
        this._lastListToolsFailure &&
        Date.now() - this._lastListToolsFailure <
          SdkMcpServer.LIST_TOOLS_RETRY_COOLDOWN
      )
        return this._toolsList || [];
      try {
        ((this._cacheDirty = !1), (this._lastListToolsFailure = 0));
        let eA: any = await this.session.listTools();
        return (
          (this._toolsList = tF.ListToolsResultSchema.parse(eA).tools),
          this._toolsList
        );
      } catch (el: any) {
        let eA: any = sdk_mcp_server_sanitizeMcpErrorMessage(
          el instanceof Error ? el.message : String(el),
        );
        return (
          SdkMcpServer.mockLogger.debug?.(
            `[SDK MCP] Failed to listTools from server "${this.name}": ${eA}`,
          ),
          (this._cacheDirty = !0),
          (this._lastListToolsFailure = Date.now()),
          this._toolsList || []
        );
      }
    }
    async callTool(eA: any, el: any): Promise<any> {
      if (!this.session)
        throw Error(
          "Server not initialized. Make sure you call connect() first.",
        );
      let ec: any = t8.McpUtils.getToolTimeout();
      try {
        let eu: any = await this.session.callTool(
          { name: eA, arguments: el ?? {} },
          void 0,
          { timeout: ec },
        );
        return tF.CallToolResultSchema.parse(eu).content;
      } catch (ec: any) {
        let el: any = sdk_mcp_server_sanitizeMcpErrorMessage(
          ec instanceof Error ? ec.message : String(ec),
        );
        throw Error(
          `[SDK MCP] Failed to callTool "${eA}" from server "${this.name}": ${el}`,
        );
      }
    }
    async listPrompts(): Promise<any> {
      if (!this.session)
        throw Error(
          "Server not initialized. Make sure you call connect() first.",
        );
      if (!this.session.getServerCapabilities?.()?.prompts) return [];
      let eA: any = await this.session.listPrompts();
      return tF.ListPromptsResultSchema.parse(eA).prompts;
    }
    async listResources(): Promise<any> {
      if (!this.session)
        throw Error(
          "Server not initialized. Make sure you call connect() first.",
        );
      if (!this.session.getServerCapabilities?.()?.resources) return [];
      let eA: any = await this.session.listResources();
      return tF.ListResourcesResultSchema.parse(eA).resources;
    }
    async listResourceTemplates(): Promise<any> {
      if (!this.session)
        throw Error(
          "Server not initialized. Make sure you call connect() first.",
        );
      let eA: any = await this.session.listResourceTemplates();
      return tF.ListResourceTemplatesResultSchema.parse(eA).resourceTemplates;
    }
    async getPrompt(eA: any, el: any): Promise<any> {
      if (!this.session)
        throw Error(
          "Server not initialized. Make sure you call connect() first.",
        );
      try {
        let ec: any = await this.session.getPrompt({ name: eA, arguments: el });
        return tF.GetPromptResultSchema.parse(ec).messages;
      } catch (ec: any) {
        let el: any = sdk_mcp_server_sanitizeMcpErrorMessage(
          ec instanceof Error ? ec.message : String(ec),
        );
        throw (
          this.logger.error?.(
            `[MCP] Failed to getPrompt "${eA}" from server "${this.name}": ${el}`,
          ),
          Error(
            `[MCP] Failed to getPrompt "${eA}" from server "${this.name}": ${el}`,
          )
        );
      }
    }
    async readResource(eA: any): Promise<any> {
      if (!this.session)
        throw Error(
          "Server not initialized. Make sure you call connect() first.",
        );
      let el: any = await this.session.readResource(eA);
      return tF.ReadResourceResultSchema.parse(el).contents;
    }
  }
  // UTF-16 9186841..9198615
  class McpServerManager {
    [key: string]: any;
    constructor() {
      ((this.serverCache = new Map()),
        (this.underlyingCache = new Map()),
        (this.configByName = new Map()),
        (this.creating = new Map()),
        (this.serverConfigFingerprint = new Map()),
        (this.toolsListChangedSubject = new tH.Subject()),
        (this.mockLogger = {
          debug: () => {},
          info: () => {},
          warn: () => {},
          error: () => {},
          trace: () => {},
          log: () => {},
          namespace: "",
          dontLogModelData: !0,
          dontLogToolData: !0,
        }));
    }
    async create(eA: any, el: any): Promise<any> {
      let ec: any = this.creating.get(eA),
        eu: any = (ec ? ec.catch(() => void 0) : Promise.resolve()).then(() =>
          this.doCreate(eA, el),
        );
      this.creating.set(eA, eu);
      let cleanup: any = () => {
        this.creating.get(eA) === eu && this.creating.delete(eA);
      };
      return (eu.then(cleanup, cleanup), eu);
    }
    async waitForIdle(eA: any): Promise<any> {
      for (;;) {
        let el: any = this.creating.get(eA);
        if (!el) return;
        await el.catch(() => void 0);
      }
    }
    async doCreate(eA: any, el: any): Promise<any> {
      let ec: any = computeMcpConfigFingerprint(el);
      if (this.serverCache.has(eA)) {
        if (this.serverConfigFingerprint.get(eA) === ec)
          return (this.configByName.set(eA, el), this.serverCache.get(eA));
        (this.logger.info(
          `[MCP][cacheDbg] serverManager.create() config changed for "${eA}", rebuilding underlying instance (proxy shell preserved)`,
        ),
          this.disposeUnderlying(eA));
      }
      let eu: any = await this.instantiateServer(eA, el);
      if (eu) {
        ((eu.onToolsListChanged = () => {
          this.toolsListChangedSubject.next(eA);
        }),
          (eu.toolMetaResolver = (eA: any) => {
            let el: any = eA.runContext?.context;
            return el ? { __session: el } : null;
          }),
          this.underlyingCache.set(eA, eu),
          this.serverConfigFingerprint.set(eA, ec),
          this.configByName.set(eA, el));
        let ed: any = this.serverCache.get(eA);
        return (
          ed ||
            ((ed = this.createServerProxy(eA, el)),
            this.serverCache.set(eA, ed)),
          this.logger.info(
            `[MCP][cacheDbg] serverManager.create() set "${eA}" | serverCache keys=[${Array.from(this.serverCache.keys()).join(",")}]`,
          ),
          ed
        );
      }
      throw Error(
        `Failed to create MCP server '${eA}': no valid transport type - ${el.type}`,
      );
    }
    async instantiateServer(eA: any, el: any): Promise<any> {
      let ec: any = this.createToolFilter(eA, el),
        eu: any = t8.McpUtils.getMcpTimeout();
      switch (el.type) {
        case "stdio": {
          let ed: any = await this.endpointProvider.get(),
            ep: any = this.hostCapabilityProvider.toEnvValue(),
            eg: any = process.env[tX.HOST_CAPABILITIES_ENV],
            eh: any = ep || eg || void 0;
          return (
            this.logger.info(
              `[MCP] instantiateServer stdio env: server=${eA} providerValue=${ep ?? "null"} envFallback=${eg ?? "null"} final=${eh ?? "null"}`,
            ),
            new OverriddenMCPServerStdio({
              name: eA,
              command: el.command,
              args: el.args || [],
              env: {
                ...(el.env || {}),
                CODEBUDDY_SERVICE_PROXY_URL: `${ed}/internal/hooks/services/invoke`,
                ...(eh ? { [tX.HOST_CAPABILITIES_ENV]: eh } : {}),
              },
              logger: this.mockLogger,
              cwd: el.cwd || t8.PathUtils.getWorkDir(),
              toolFilter: ec,
              timeout: eu,
            })
          );
        }
        case "sse":
          return new OverriddenMCPServerSSE({
            name: eA,
            url: el.url,
            requestInit: { headers: el.headers || {} },
            logger: this.mockLogger,
            authProvider: hasStaticAuthorization(el.headers)
              ? void 0
              : await this.mcpOAuthManager.getProvider(eA),
            toolFilter: ec,
            timeout: eu,
          });
        case "http":
        case "remote":
          return new OverriddenMCPServerStreamableHttp({
            name: eA,
            url: el.url,
            requestInit: { headers: el.headers || {} },
            logger: this.mockLogger,
            authProvider: hasStaticAuthorization(el.headers)
              ? void 0
              : await this.mcpOAuthManager.getProvider(eA),
            toolFilter: ec,
            timeout: eu,
          });
        case "sdk":
          return this.createSdkMcpServer(eA, el, ec, eu);
        default:
          return;
      }
    }
    disposeUnderlying(eA: any): any {
      let el: any = this.underlyingCache.get(eA);
      (el &&
        (this.logger.info(
          `[MCP][cacheDbg] serverManager.disposeUnderlying("${eA}") (proxy shell kept)`,
        ),
        (el.onToolsListChanged = void 0),
        this.underlyingCache.delete(eA),
        this.transportManager.deleteByNameSync(eA),
        this.closeServerSafely(el)),
        this.serverConfigFingerprint.delete(eA));
    }
    async get(eA: any): Promise<any> {
      let el: any = this.serverCache.get(eA);
      return (
        el ||
          this.logger.info(
            `[MCP][cacheDbg] serverManager.get("${eA}") MISS | serverCache keys=[${Array.from(this.serverCache.keys()).join(",")}]`,
          ),
        el
      );
    }
    async delete(eA: any): Promise<any> {
      let el: any = this.underlyingCache.get(eA),
        ec: any = this.serverCache.has(eA);
      return (
        (!!el || !!ec) &&
        (this.logger.info(`[MCP][cacheDbg] serverManager.delete("${eA}")`),
        el && (el.onToolsListChanged = void 0),
        this.underlyingCache.delete(eA),
        this.serverCache.delete(eA),
        this.serverConfigFingerprint.delete(eA),
        this.configByName.delete(eA),
        this.transportManager.deleteByNameSync(eA),
        el && (await this.closeServerSafely(el)),
        !0)
      );
    }
    async clear(): Promise<any> {
      for (let eA of (this.logger.info(
        `[MCP][cacheDbg] serverManager.clear() | keys=[${Array.from(this.serverCache.keys()).join(",")}]`,
      ),
      this.underlyingCache.values()))
        ((eA.onToolsListChanged = void 0), await this.closeServerSafely(eA));
      (this.underlyingCache.clear(),
        this.serverCache.clear(),
        this.serverConfigFingerprint.clear(),
        this.configByName.clear());
    }
    async *getAll(): AsyncGenerator<any> {
      for (let eA of this.serverCache.values()) yield eA;
    }
    async closeServerSafely(eA: any): Promise<any> {
      try {
        await eA.close();
      } catch (eA: any) {
        this.consoleManager.debug("Error closing MCP server:", eA);
      }
    }
    createSdkMcpServer(eA: any, el: any, ec: any, eu: any): any {
      let ed: any = tU.ContainerUtil.get(tF.SdkMcpMessageClient);
      return new SdkMcpServer({
        name: eA,
        sendMcpMessage: (eA: any, el: any, ec: any) =>
          ed.sendMcpMessage(eA, el, ec),
        logger: this.mockLogger,
        timeout: eu,
        toolFilter: ec,
      });
    }
    createServerProxy(eA: any, el: any): any {
      let resolveConfigDerived: any = () => {
          let ec: any = this.configByName.get(eA) ?? el,
            eu: any = "transparent_proxy" in ec && !0 === ec.transparent_proxy,
            ed: any = "builtin_tools" in ec ? ec.builtin_tools : void 0;
          return {
            transparentProxy: eu,
            builtinSet: ed ? new Set(ed) : void 0,
            toolsConfig: "tools" in ec ? ec.tools : void 0,
          };
        },
        resolveTarget: any = () => {
          let el: any = this.underlyingCache.get(eA);
          if (!el)
            throw Error(
              `MCP server "${eA}" underlying instance missing while proxy shell is alive`,
            );
          return el;
        },
        ec: any = this.logger;
      return new Proxy(Object.create(null), {
        get(el: any, ed: any, ep: any): any {
          let eg: any = resolveTarget();
          return "listTools" === ed
            ? async function (...el: any[]): Promise<any> {
                let ed: any = await Reflect.apply(eg.listTools, eg, el);
                ec.debug(
                  `[MCP][defer] proxy.listTools server=${eA} underlyingTools=${ed.length}`,
                );
                let {
                  transparentProxy: ep,
                  builtinSet: eh,
                  toolsConfig: ef,
                } = resolveConfigDerived();
                return ed.map((eA: any) => {
                  if (eA.inputSchema) {
                    let {
                      type: el,
                      required: ec = [],
                      properties: eu = {},
                      additionalProperties: ed = !1,
                      ...ep
                    } = eA.inputSchema;
                    eA.inputSchema = {
                      ...ep,
                      type: el,
                      required: ec,
                      properties: eu,
                      additionalProperties: ed,
                    };
                  }
                  if (ep && ef) {
                    let el: any = eA.name,
                      ec: any = eA._meta,
                      eu: any =
                        "string" == typeof ec?.serverName
                          ? ec.serverName
                          : void 0;
                    if (eu) {
                      let eA: any = ef[el];
                      ef[el] = {
                        ...(eA ?? {}),
                        server_name: eu,
                        ...(ec?.defer_loading === !1
                          ? { defer_loading: !1 }
                          : {}),
                      };
                    }
                  }
                  return eu.createToolProxy(eA, eg.name, ep, eh, ef);
                });
              }
            : "callTool" === ed
              ? async function (eA: any, el: any, ed: any): Promise<any> {
                  let eh: any,
                    ef: any,
                    em: any,
                    eE: any,
                    eC: any = eA,
                    ey: any = ed?.__session,
                    ew: any = ed?.__onProgress,
                    eB: any = ed?.__resultMetaSink,
                    e_: any = AE.McpToolCallContext.getCallIdForTool(eC),
                    eI: any = ed?.__signal,
                    ev: any =
                      "number" == typeof ed?.__timeoutMs
                        ? ed.__timeoutMs
                        : void 0,
                    { transparentProxy: eS, builtinSet: eQ } =
                      resolveConfigDerived();
                  if (eS) {
                    // @ts-ignore -- exact native empty builtin branch, not a missing implementation.
                    if (eQ?.has(eA));
                    else if (eA.startsWith("mcp__")) {
                      let el: any = t8.McpUtils.parseToolFullName(eA);
                      eA = `${el.serverName}_${el.toolName}`;
                    }
                  } else
                    eA.startsWith("mcp__") &&
                      (eA = t8.McpUtils.parseToolFullName(eA).toolName);
                  let eD: any = eu.buildWorkBuddyInvokeMeta(ey),
                    eT: any =
                      ("string" == typeof ed?.modelId ? ed.modelId : void 0) ||
                      ey?.requestOptions?.model ||
                      ey?.options?.model,
                    combinedResultMetaSink: any = (eA: any) => {
                      (eB?.(eA),
                        (ef = eA),
                        eA._meta && (em = eA._meta),
                        void 0 !== eA.isError && (eE = eA.isError));
                    },
                    eR: any = {
                      ...eD,
                      ...(eT ? { modelId: eT } : {}),
                      ...(ew ? { __onProgress: ew } : {}),
                      __resultMetaSink: combinedResultMetaSink,
                      ...(eI ? { __signal: eI } : {}),
                      ...(void 0 !== ev ? { __timeoutMs: ev } : {}),
                    },
                    ek: any = (0, tU.generateUUUID)();
                  if (ey)
                    try {
                      let eA: any = tU.ContainerUtil.get(
                          t1.SessionStore,
                        ).getSessionFilePath(ey.id),
                        ec: any = t8.PathUtils.getWorkDir(),
                        eu: any = tU.ContainerUtil.get(t3.ToolHookManager),
                        ed: any = await eu.executePreToolUseHooks(
                          eC,
                          el || {},
                          ey,
                          eA,
                          ec,
                          ek,
                        );
                      if (!ed.allowed || "deny" === ed.permissionDecision) {
                        let eA: any =
                          ed.message ||
                          `Tool execution blocked by PreToolUse hook: ${eC}`;
                        return [{ type: "text", text: eA }];
                      }
                      ed.modifiedInput && (el = ed.modifiedInput);
                    } catch (eA: any) {
                      tU.ContainerUtil.get(tK.ConsoleManager).error(
                        `[MCP] Failed to execute PreToolUse hooks for ${eC}:`,
                        eA,
                      );
                    }
                  let eM: any = Date.now();
                  try {
                    eh = await withMcpCallSpan(ey, eg.name, eA, ek, () =>
                      Reflect.apply(eg.callTool, eg, [eA, el, eR]),
                    );
                  } catch (ec: any) {
                    throw (
                      eu.reportMcpToolCall(eC, eA, el, !1, ey, Date.now() - eM),
                      ec
                    );
                  }
                  eu.reportMcpToolCall(eC, eA, el, !0, ey, Date.now() - eM);
                  try {
                    let eA: any = tU.ContainerUtil.get(tZ.PaymentInterceptor),
                      el: any = await eA.scanMcpResult(eg.name, eC, eh, ey);
                    el && (eh = el);
                  } catch {}
                  if (
                    ((eh = await eu.processMcpResult(
                      eh,
                      eu.maxOutputTokens(),
                      eg.name,
                      eA,
                      ey,
                    )),
                    ey)
                  )
                    try {
                      let eA: any = tU.ContainerUtil.get(
                          t1.SessionStore,
                        ).getSessionFilePath(ey.id),
                        ec: any = t8.PathUtils.getWorkDir(),
                        eu: any = tU.ContainerUtil.get(t3.ToolHookManager),
                        ed: any = eh;
                      (em &&
                        Object.defineProperty(ed, "_meta", {
                          value: em,
                          enumerable: !1,
                          configurable: !0,
                        }),
                        eE &&
                          Object.defineProperty(ed, "is_error", {
                            value: !0,
                            enumerable: !1,
                            configurable: !0,
                          }));
                      let ep: any = await eu.executePostToolUseHooks(
                        eC,
                        el || {},
                        ed,
                        ey,
                        eA,
                        ec,
                        ek,
                      );
                      (ep.message &&
                        tU.ContainerUtil.get(tK.ConsoleManager).log(
                          `[MCP] PostToolUse hook message: ${ep.message}`,
                        ),
                        ep.additionalContext &&
                          eh.push({
                            type: "text",
                            text: `
<system-reminder data-role="tool-hint">${ep.additionalContext}</system-reminder>`,
                          }));
                    } catch (eA: any) {
                      tU.ContainerUtil.get(tK.ConsoleManager).error(
                        `[MCP] Failed to execute PostToolUse hooks for ${eC}:`,
                        eA,
                      );
                    }
                  return (
                    e_ &&
                      ey &&
                      (await (0, AC.broadcastMcpUiForToolCall)({
                        server: ep,
                        fullToolName: eC,
                        params: el || {},
                        resultContent: eh,
                        resultMeta: ef,
                        sessionId: ey.id,
                        toolCallId: e_,
                        logger: ec,
                      })),
                    eh
                  );
                }
              : Reflect.get(eg, ed, ep);
        },
        set(eA: any, el: any, ec: any, eu: any): any {
          let ed: any = resolveTarget();
          return Reflect.set(ed, el, ec, ed);
        },
        has: (eA: any, el: any) => Reflect.has(resolveTarget(), el),
        getOwnPropertyDescriptor: (eA: any, el: any) =>
          Reflect.getOwnPropertyDescriptor(resolveTarget(), el),
        ownKeys: () => Reflect.ownKeys(resolveTarget()),
      });
    }
    static createToolProxy(eA: any, el: any, ec: any, ed: any, ep: any): any {
      let eg: any = new Proxy(eA, {
        get(eA: any, eh: any, ef: any): any {
          if ("name" === eh) {
            let eu: any = Reflect.get(eA, eh, ef);
            if (ec) {
              if (ed?.has(eu)) return eu;
              let eA: any = ep?.[eu]?.server_name;
              if (eA) {
                let el: any = eA + "_",
                  ec: any = eu.startsWith(el) ? eu.substring(el.length) : eu;
                return `mcp__${eA}__${ec}`;
              }
            }
            return `mcp__${el}__${eu}`;
          }
          return "needsApproval" === eh
            ? eu.createMcpNeedsApproval(eg)
            : Reflect.get(eA, eh, ef);
        },
      });
      return eg;
    }
    static createMcpNeedsApproval(eA: any): any {
      return async (el: any, ec: any, eu: any) =>
        tU.ContainerUtil.get(t3.ToolPermissionService).needsApproval(
          eA,
          el,
          ec,
          eu,
        );
    }
    createToolFilter(eA: any, el: any): any {
      let ec: any = "transparent_proxy" in el && !0 === el.transparent_proxy;
      return async (eu: any, ed: any) => {
        let ep: any = eu.runContext.context.options,
          eg: any = tU.ContainerUtil.get(t2.SettingsManager),
          eh: any = [ed.name].map((eA: any) => eA.toLowerCase()),
          ef: any = [
            ...(((await eg.get("permissions")) || {}).deny || []),
            ...(ep.disallowedTools || []),
          ],
          em: any = t8.PermissionUtils.matchMcpPermissionRules(ef, eh),
          eE: any = [{ type: t3.ToolArgType.Unknown, value: "" }];
        if (t8.PermissionUtils.checkPermissionRules(em, eE)) return !1;
        if (
          eu.agent.tools.some(
            (eA: any) => eA.name === t3.ToolNames.TOOL_SEARCH,
          ) &&
          "sdk" !== el.type
        ) {
          let eg: any = t8.McpUtils.buildDeferLookupNames(eA, ed.name, ec),
            eh: any = tU.ContainerUtil.get(tq.DeferToolConfigService),
            ef: any = tU.ContainerUtil.get(t4.AgentToolDeferOverlayCache),
            em: any = t4.ToolDeferOverlay.merge(
              ep.toolDeferOverlay,
              ef.get(eu.agent?.name),
            );
          if (await eh.isToolDeferLoadingWithOverlay(em, el, ...eg)) return !1;
        }
        let eC: any = eu.agent?.name;
        return (
          !eC ||
          tU.ContainerUtil.get(tF.McpSubagentToolManager).isToolAllowed(
            eC,
            ed.name,
          )
        );
      };
    }
    static maxOutputTokens(): any {
      let eA: any = Number.parseInt(
        process.env.MAX_MCP_OUTPUT_TOKENS ?? `${tF.MAX_MCP_OUTPUT_TOKENS}`,
        10,
      );
      return Number.isFinite(eA) && eA > 0 ? eA : tF.MAX_MCP_OUTPUT_TOKENS;
    }
    static buildWorkBuddyInvokeMeta(eA: any): any {
      if (!(0, tY.isWorkBuddyDesktop)() || !eA) return;
      let el: any = {},
        put: any = (eA: any, ec: any) => {
          "string" == typeof ec &&
            ec.length > 0 &&
            (el[`workbuddy.ai/${eA}`] = ec);
        };
      return (
        put("conversationId", eA.id),
        put("requestId", eA.conversationRequestId),
        put("messageId", eA.messageId),
        put("mode", eA.meta?.["codebuddy.ai/mode"]),
        put("expertId", eA.meta?.["codebuddy.ai/expertId"]),
        (el["workbuddy.ai/triggerSource"] = "auto"),
        Object.keys(el).length > 0 ? el : void 0
      );
    }
    static reportMcpToolCall(
      eA: any,
      el: any,
      ec: any,
      eu: any,
      ed: any,
      ep: any,
    ): any {
      if ((0, tY.isWorkBuddyDesktop)())
        try {
          let eg: any = "",
            eh: any = el;
          if (eA && eA.startsWith("mcp__")) {
            let ec: any = t8.McpUtils.parseToolFullName(eA);
            ((eg = ec.serverName || ""), (eh = ec.toolName || el));
          }
          tU.ContainerUtil.get(tj.EventService)
            .report(tj.Events.McpToolCall, {
              id: "",
              name: eg,
              toolName: eh,
              toolArgs: JSON.stringify(ec ?? {}),
              toolCallSuccessful: eu,
              source: "",
              type: "",
              requestId: ed?.conversationRequestId || "",
              messageId: ed?.messageId || "",
              ...("number" == typeof ep ? { durationMs: ep } : {}),
            })
            .catch(() => {});
        } catch {}
    }
    static async processMcpResult(
      eA: any,
      el: any,
      ec: any,
      eu: any,
      ed: any,
    ): Promise<any> {
      return processMcpResult(
        eA,
        el,
        ec,
        eu,
        ed?.storeId ?? ed?.id,
        ed?.meta?.parentSessionId,
      );
    }
  }
  // UTF-16 9284064..9285512
  class McpTransportManager {
    [key: string]: any;
    constructor() {
      this.transportCache = new Map();
    }
    getCacheKey(eA: any, el: any): any {
      return `${el}:${eA}`;
    }
    async get(eA: any): Promise<any> {
      for (let { scope: el } of await this.mcpConfigManager.getByName(eA)) {
        let ec: any = this.getCacheKey(eA, el);
        return this.transportCache.get(ec);
      }
    }
    async create(eA: any, el: any): Promise<any> {
      for (let {
        scope: ec,
        config: eu,
      } of await this.mcpConfigManager.getByName(eA)) {
        let ed: any,
          ep: any = this.getCacheKey(eA, ec),
          eg: any = this.transportCache.get(ep);
        if (eg) return eg;
        if ("stdio" === eu.type && "command" in el)
          ed = await this.createStdioTransport(el);
        else if ("sse" === eu.type)
          ed = await this.createSSETransport(eu.url, el);
        else if ("http" === eu.type || "remote" === eu.type)
          ed = await this.createHTTPTransport(eu.url, el);
        else
          throw Error(
            `Unsupported MCP config type for server "${eA}" in scope "${ec}": ${JSON.stringify(eu)}`,
          );
        return (
          this.transportCache.set(ep, ed),
          (ed.onclose = () => {
            this.transportCache.get(ep) === ed &&
              this.transportCache.delete(ep);
          }),
          ed
        );
      }
      throw Error(`No MCP configuration found for server "${eA}".`);
    }
    async createStdioTransport(eA: any): Promise<any> {
      return new Aq.StdioClientTransport(eA);
    }
    async createSSETransport(eA: any, el: any): Promise<any> {
      return new AJ.SSEClientTransport(new URL(eA), el);
    }
    async createHTTPTransport(eA: any, el: any): Promise<any> {
      return new Az.StreamableHTTPClientTransport(new URL(eA), el);
    }
    async delete(eA: any): Promise<any> {
      for (let { scope: el } of await this.mcpConfigManager.getByName(eA)) {
        let ec: any = this.getCacheKey(eA, el);
        this.transportCache.delete(ec);
      }
    }
    deleteByNameSync(eA: any): any {
      let el: any = `:${eA}`;
      for (let eA of this.transportCache.keys())
        eA.endsWith(el) && this.transportCache.delete(eA);
    }
  }
  eu = McpServerManager;
  SdkMcpServer.mockLogger = { debug() {}, info() {}, warn() {}, error() {} };
  SdkMcpServer.LIST_TOOLS_RETRY_COOLDOWN = 30000;
  return {
    McpServerManager,
    McpTransportManager,
    OverriddenUnderlyingMCPServerStdio,
    OverriddenMCPServerStdio,
    OverriddenUnderlyingMCPServerSSE,
    OverriddenMCPServerSSE,
    OverriddenUnderlyingMCPServerStreamableHttp,
    OverriddenMCPServerStreamableHttp,
    SdkMcpTransport,
    SdkMcpServer,
    resolveMcpCallParentSpan,
    withMcpCallSpan,
    isMutableMcpTransport,
    injectHeader,
    wrapFetchWithModelIdInjection,
    ensureFetchWrapped,
    withMcpModelIdHeader,
    emitMcpToolResultSideband,
    sanitizeMcpErrorMessage,
    isMainAgentRunning,
    escapeXmlAttr,
    registerChannelNotificationHandlers,
    registerChannelIfApplicable,
    extractProgressCallback,
    sdk_mcp_server_escapeXmlAttr,
    sdk_mcp_server_sanitizeMcpErrorMessage,
    hasStaticAuthorization,
    computeMcpConfigFingerprint,
  };
}

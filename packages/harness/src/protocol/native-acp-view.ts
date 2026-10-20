export const ACP_VIEW_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export const ACP_VIEW_CLASSES = [
  ["DetachedMemberSseBridge", 8282427, 8289110],
  ["AcpTeamBridge", 8289183, 8304619],
  ["n0", 8305394, 8326031],
] as const;
export const ACP_VIEW_FUNCTIONS = [
  ["isCancelBarrierActive", 8305182, 8305260],
  ["applyAcpPromptTimestamp", 8305260, 8305387],
] as const;
export const ACP_VIEW_INITIALIZERS = [
  ["nJ", 8289148, 8289151],
  ["nq", 8289155, 8289157],
  ["nz", 8289161, 8289164],
  ["nV", 8305162, 8305167],
  ["nZ", 8305171, 8305174],
  ["nX", 8305178, 8305181],
] as const;
export const ACP_VIEW_DECLARATIONS = [
  ["DetachedMemberSseBridge", 8282399, 8289111],
  ["nJ", 8289141, 8289165],
  ["AcpTeamBridge", 8289165, 8304620],
  ["nV", 8305155, 8305182],
  ["isCancelBarrierActive", 8305182, 8305260],
  ["applyAcpPromptTimestamp", 8305260, 8305387],
  ["n0", 8305387, 8326032],
] as const;
export const ACP_VIEW_MODULE_BINDINGS = [
  ["n$", 68366],
  ["nB", 93039],
  ["nD", 67062],
  ["nE", 47005],
  ["nG", 97959],
  ["nH", 79896],
  ["nL", 86480],
  ["nN", 20881],
  ["nO", 76586],
  ["nP", 35151],
  ["nR", 69745],
  ["nS", 43533],
  ["nT", 97903],
  ["nW", 91364],
  ["nY", 54193],
  ["nc", 67330],
  ["ne", 70724],
  ["nh", 38548],
  ["nj", 56037],
  ["nk", 39983],
  ["np", 12502],
  ["nu", 71915],
  ["r4", 66545],
  ["r5", 93928],
  ["r6", 80699],
  ["r8", 22618],
] as const;
// Full inert original declarations. DI/IO/capabilities stay explicit; never runs app bootstrap.
export function createNativeAcpView(runtime: any = {}) {
  const Object: any = globalThis.Object,
    Promise: any = globalThis.Promise,
    Array: any = globalThis.Array,
    Map: any = globalThis.Map,
    Set: any = globalThis.Set,
    Date: any = runtime.Date ?? globalThis.Date;
  const setTimeout = runtime.setTimeout ?? globalThis.setTimeout,
    clearTimeout = runtime.clearTimeout ?? globalThis.clearTimeout,
    setInterval = runtime.setInterval ?? globalThis.setInterval,
    clearInterval = runtime.clearInterval ?? globalThis.clearInterval;
  const module = (id: number) =>
    runtime.modules?.[id] ??
    runtime.getModule?.(id) ??
    new Proxy(
      {},
      {
        get(_target, key) {
          throw Error(
            "Explicit ACP view dependency required: " + id + "." + String(key),
          );
        },
      },
    );
  const ec: any = (id: number) => module(id);
  const n$: any = module(68366);
  const nB: any = module(93039);
  const nD: any = module(67062);
  const nE: any = module(47005);
  const nG: any = module(97959);
  const nH: any = module(79896);
  const nL: any = module(86480);
  const nN: any = module(20881);
  const nO: any = module(76586);
  const nP: any = module(35151);
  const nR: any = module(69745);
  const nS: any = module(43533);
  const nT: any = module(97903);
  const nW: any = module(91364);
  const nY: any = module(54193);
  const nc: any = module(67330);
  const ne: any = module(70724);
  const nh: any = module(38548);
  const nj: any = module(56037);
  const nk: any = module(39983);
  const np: any = module(12502);
  const nu: any = module(71915);
  const r4: any = module(66545);
  const r5: any = module(93928);
  const r6: any = module(80699);
  const r8: any = module(22618);

  // UTF-16 8282399..8289111
  let DetachedMemberSseBridge: any = class DetachedMemberSseBridge {
    [key: string]: any;
    constructor(eA?: any, el?: any, ec?: any) {
      ((this.logger = eA),
        (this.leaderSessionId = el),
        (this.leaderConnection = ec),
        (this.connections = new Map()));
    }
    setAcpAgent(eA?: any): any {
      this.acpAgent = eA;
    }
    async connectMember(eA?: any, el?: any): Promise<any> {
      if (this.connections.has(el)) return !0;
      let ec: any = this.readEndpointFile(eA, el);
      if (!ec)
        return (
          this.logger.debug?.(
            `[DetachedSseBridge] No endpoint file for "${el}" in team "${eA}"`,
          ),
          !1
        );
      if (
        (this.logger.debug?.(
          `[DetachedSseBridge] Endpoint file for "${el}": endpoint=${ec.endpoint}, historyLen=${ec.history?.length || 0}`,
        ),
        ec.history && ec.history.length > 0)
      )
        return (
          this.logger.info?.(
            `[DetachedSseBridge] Replaying ${ec.history.length} history items for "${el}"`,
          ),
          this.replayHistoryFromFile(el, ec.history),
          this.connections.set(el, {
            memberName: el,
            endpoint: ec.endpoint || "",
            sessionId: ec.sessionId,
          }),
          !0
        );
      if (!ec.endpoint) return !1;
      this.logger.debug?.(
        `[DetachedSseBridge] Connecting to "${el}" at ${ec.endpoint}`,
      );
      try {
        let eA: any = {
          memberName: el,
          endpoint: ec.endpoint,
          sessionId: ec.sessionId,
        };
        return (
          await this.startSseStream(eA),
          this.connections.set(el, eA),
          this.logger.info?.(
            `[DetachedSseBridge] Connected to "${el}" SSE stream`,
          ),
          !0
        );
      } catch (eA: any) {
        return (
          this.logger.warn?.(
            `[DetachedSseBridge] Failed to connect to "${el}": ${eA}`,
          ),
          !1
        );
      }
    }
    disconnectMember(eA?: any): any {
      let el: any = this.connections.get(eA);
      el &&
        (el.abortController?.abort(),
        el.eventSource?.close(),
        this.connections.delete(eA),
        this.logger.info?.(`[DetachedSseBridge] Disconnected from "${eA}"`));
    }
    disconnectAll(): any {
      for (let eA of this.connections.keys()) this.disconnectMember(eA);
    }
    isConnected(eA?: any): any {
      return this.connections.has(eA);
    }
    replayHistoryFromFile(eA?: any, el?: any): any {
      for (let ec of (this.logger.info?.(
        `[DetachedSseBridge] Replaying ${el.length} history items for "${eA}" from file`,
      ),
      el))
        try {
          for (let el of this.convertHistoryItemToAcpUpdates(ec))
            (el._meta || (el._meta = {}),
              (el._meta["codebuddy.ai/memberEvent"] = eA),
              this.leaderConnection
                .sessionUpdate({ sessionId: this.leaderSessionId, update: el })
                .catch((el?: any) => {
                  this.logger.debug?.(
                    `[DetachedSseBridge] Replay forward error for "${eA}": ${el}`,
                  );
                }),
              "tool_call" === el.sessionUpdate &&
                el.toolCallId &&
                this.acpAgent?.notifyToolCallSent(el.toolCallId));
        } catch (el: any) {
          this.logger.warn?.(
            `[DetachedSseBridge] Replay convert error for "${eA}": ${el}`,
          );
        }
    }
    convertHistoryItemToAcpUpdates(eA?: any): any {
      if (!eA || !eA.type) return [];
      if ("message" === eA.type && "assistant" === eA.role) {
        let el: any = [],
          ec: any = eA.content;
        if (Array.isArray(ec))
          for (let eA of ec)
            ("output_text" === eA.type || "text" === eA.type) &&
              el.push({
                sessionUpdate: "agent_message_chunk",
                content: { type: "text", text: eA.text || "" },
              });
        else
          "string" == typeof ec &&
            el.push({
              sessionUpdate: "agent_message_chunk",
              content: { type: "text", text: ec },
            });
        return el;
      }
      if ("message" === eA.type && "user" === eA.role) {
        let el: any = eA.content,
          ec: any = "";
        return ("string" == typeof el
          ? (ec = el)
          : Array.isArray(el) &&
            (ec = el
              .filter(
                (eA?: any) => "input_text" === eA.type || "text" === eA.type,
              )
              .map((eA?: any) => eA.text || "")
              .join("\n")),
        ec.trim())
          ? [
              {
                sessionUpdate: "user_message_chunk",
                content: { type: "text", text: ec },
              },
            ]
          : [];
      }
      return "function_call" === eA.type
        ? [
            {
              sessionUpdate: "tool_call",
              toolCallId: eA.call_id || eA.id,
              name: eA.name,
              kind: "other",
              title: eA.name,
              input: eA.arguments,
              _meta: { "codebuddy.ai/toolName": eA.name },
            },
          ]
        : "function_call_output" === eA.type ||
            "function_call_result" === eA.type
          ? [
              {
                sessionUpdate: "tool_call_update",
                toolCallId: eA.call_id || eA.id,
                status: "completed",
                toolResult: eA.output,
              },
            ]
          : [];
    }
    readEndpointFile(eA?: any, el?: any): any {
      let ec: any = nB.PathUtils.getTeamMemberEndpointPath(eA, el);
      try {
        let eA: any = (0, nH.readFileSync)(ec, "utf-8");
        return JSON.parse(eA);
      } catch (eA: any) {
        eA?.code !== "ENOENT" &&
          this.logger.warn?.(
            `[DetachedSseBridge] Failed to read endpoint file ${ec}: ${eA}`,
          );
        return;
      }
    }
    async startSseStream(eA?: any): Promise<any> {
      let el: any = await Promise.resolve().then(ec.t.bind(ec, 58611, 23)),
        eu: any = new URL(eA.endpoint);
      eA.connectionId = (
        await new Promise((eA?: any, ec?: any) => {
          let ed: any = el.request(
            {
              hostname: eu.hostname,
              port: eu.port,
              path: "/api/v1/acp/connect",
              method: "POST",
              headers: (0, nS.withSecurityHeader)(),
            },
            (el?: any) => {
              let eu: any = "";
              (el.on("data", (eA?: any) => (eu += eA)),
                el.on("end", () => {
                  try {
                    eA(JSON.parse(eu));
                  } catch {
                    ec(Error(`Invalid connect response: ${eu}`));
                  }
                }));
            },
          );
          (ed.on("error", ec),
            ed.setTimeout(5e3, () => {
              ed.destroy(Error("Connect timeout"));
            }),
            ed.end());
        })
      ).connectionId;
      let ed: any = JSON.stringify({
        jsonrpc: "2.0",
        id: "init-bridge",
        method: "initialize",
        params: {
          protocolVersion: 1,
          capabilities: {},
          clientInfo: { name: "leader-bridge", version: "1.0" },
        },
      });
      await this.postAcp(eA, ed);
      let ep: any = JSON.stringify({
        jsonrpc: "2.0",
        id: "load-session",
        method: "session/load",
        params: { sessionId: eA.sessionId, cwd: process.cwd() },
      });
      ((eA.abortController = new AbortController()),
        this.startSseEventLoop(eA, ep));
    }
    postAcp(eA?: any, el?: any): any {
      let eu: any = ec(58611),
        ed: any = new URL(eA.endpoint);
      return new Promise((ec?: any, ep?: any) => {
        let eg: any = eu.request(
          {
            hostname: ed.hostname,
            port: ed.port,
            path: "/api/v1/acp",
            method: "POST",
            headers: (0, nS.withSecurityHeader)({
              "Content-Type": "application/json",
              Accept: "application/json, text/event-stream",
              "acp-connection-id": eA.connectionId,
            }),
          },
          (eA?: any) => {
            let el: any = "";
            (eA.on("data", (eA?: any) => (el += eA)),
              eA.on("end", () => ec(el)));
          },
        );
        (eg.on("error", ep),
          eg.setTimeout(1e4, () => {
            eg.destroy(Error("ACP request timeout"));
          }),
          eg.write(el),
          eg.end());
      });
    }
    startSseEventLoop(eA?: any, el?: any): any {
      let eu: any = ec(58611),
        ed: any = new URL(eA.endpoint),
        ep: any = eu.request(
          {
            hostname: ed.hostname,
            port: ed.port,
            path: "/api/v1/acp",
            method: "POST",
            headers: (0, nS.withSecurityHeader)({
              "Content-Type": "application/json",
              Accept: "application/json, text/event-stream",
              "acp-connection-id": eA.connectionId,
            }),
          },
          (el?: any) => {
            let ec: any = "";
            (el.on("data", (el?: any) => {
              let eu: any = (ec += el.toString()).split("\n");
              ec = eu.pop() || "";
              let ed: any = "";
              for (let el of eu)
                if (el.startsWith("event: ")) ed = el.slice(7).trim();
                else if (el.startsWith("data: ")) {
                  let ec: any = el.slice(6);
                  (this.handleSseEvent(eA.memberName, ed, ec), (ed = ""));
                }
            }),
              el.on("end", () => {
                (this.logger.info?.(
                  `[DetachedSseBridge] SSE stream ended for "${eA.memberName}"`,
                ),
                  this.connections.delete(eA.memberName));
              }),
              el.on("error", (el?: any) => {
                (this.logger.warn?.(
                  `[DetachedSseBridge] SSE stream error for "${eA.memberName}": ${el.message}`,
                ),
                  this.connections.delete(eA.memberName));
              }));
          },
        );
      (eA.abortController?.signal.addEventListener(
        "abort",
        () => {
          ep.destroy();
        },
        { once: !0 },
      ),
        ep.on("error", (el?: any) => {
          eA.abortController?.signal.aborted ||
            this.logger.warn?.(
              `[DetachedSseBridge] SSE request error for "${eA.memberName}": ${el.message}`,
            );
        }),
        ep.write(el),
        ep.end());
    }
    handleSseEvent(eA?: any, el?: any, ec?: any): any {
      let eu: any;
      if ("message" === el || "" === el) {
        try {
          eu = JSON.parse(ec);
        } catch {
          return;
        }
        try {
          if (
            "notifications/sessionUpdate" === eu.method &&
            eu.params?.update
          ) {
            let el: any = eu.params.update;
            (el._meta || (el._meta = {}),
              (el._meta["codebuddy.ai/memberEvent"] = eA),
              this.leaderConnection
                .sessionUpdate({ sessionId: this.leaderSessionId, update: el })
                .catch((el?: any) => {
                  this.logger.debug?.(
                    `[DetachedSseBridge] Failed to forward event for "${eA}": ${el}`,
                  );
                }),
              "tool_call" === el.sessionUpdate &&
                el.toolCallId &&
                this.acpAgent?.notifyToolCallSent(el.toolCallId));
          }
        } catch (el: any) {
          this.logger.warn?.(
            `[DetachedSseBridge] Error processing SSE event for "${eA}": ${el}`,
          );
        }
      }
    }
  };
  // UTF-16 8289141..8289165
  let nJ: any = 3e3,
    nq: any = 10,
    nz: any = 3e3;
  // UTF-16 8289165..8304620
  let AcpTeamBridge: any = class AcpTeamBridge {
    [key: string]: any;
    constructor(eA?: any) {
      ((this.taskListeners = []),
        (this.memberSubscriptions = new Map()),
        (this.lastIsInTeam = !1),
        (this.idleTickCount = 0),
        (this._promptForwardingActive = !1),
        (this.logger = eA),
        (this.stateMachine = r6.ContainerUtil.get(nu.SessionRunStateMachine)));
    }
    setPromptForwardingActive(eA?: any): any {
      let el: any = this._promptForwardingActive;
      ((this._promptForwardingActive = eA),
        el && !eA && this.evaluateTeamIdle());
    }
    setAcpAgent(eA?: any): any {
      this.acpAgent = eA;
    }
    start(eA?: any, el?: any): any {
      this.sessionId = eA.id;
      let ec: any = r6.ContainerUtil.get(nG.AgentTaskManager),
        eu: any = r6.ContainerUtil.get(n$.TeamManager);
      for (let eA of [
        "task-started",
        "task-completed",
        "task-failed",
        "task-cancelled",
        "task-killed",
      ]) {
        let listener: any = (ec?: any) => {
          ((this.idleTickCount = 0),
            this.restartProgressIntervalIfStopped(),
            this.pushMemberStatusChange(el, !0),
            "task-started" === eA &&
              ec.teamContext?.memberName &&
              this.subscribeMemberSession(ec, el),
            this.isTerminalTaskEvent(eA) &&
              this.allRegistryMembersTerminal() &&
              this.pushMemberStatusChange(el, !0),
            this.evaluateTeamIdle());
        };
        (ec.on(eA, listener), this.taskListeners.push({ event: eA, listener }));
      }
      ((this.lastIsInTeam = eu.isInTeam()),
        (this.lastTeamName = eu.getTeam()?.name),
        (this.connectionRef = el),
        (this.leadSessionRef = eA),
        this.subscribeExistingMembers(el));
      let ed: any = this.stateMachine.getChange$(eA).subscribe(() => {
        if (
          (this.detectAndPushTeamStateChange(el), this.stateMachine.isIdle(eA))
        )
          this.evaluateTeamIdle();
        else if ("idle" === this.lastPushedIdleState) {
          if (!r6.ContainerUtil.get(n$.TeamManager).isInTeam()) return;
          this.pushTeamIdleSignal("busy");
        }
      });
      ((this.leadAgentStateSubscription = ed), this.startProgressInterval());
      let ep: any = {};
      this.combineSubscription = eA.combineSubject.subscribe(
        async (ec?: any) => {
          if (
            !this._promptForwardingActive &&
            !this.leadSessionRef?.teamCancelled
          )
            try {
              if (
                ("result" === ec.type ||
                  ep.historyMarker ||
                  ((ep.historyMarker = (0, nh.createAcpHistoryMarker)(
                    eA.history,
                  )),
                  (ep.requestId = eA.conversationRequestId)),
                "input" === ec.type)
              ) {
                if (
                  "function_call" === ec.data.type ||
                  "function_call_result" === ec.data.type ||
                  "function_call_output" === ec.data.type
                ) {
                  let eu: any = np.AcpUtils.convertInputItemToAcp(
                    ec.data,
                    {},
                    { parentToolUseId: ec.parentToolUseId },
                  );
                  if (eu) {
                    let ed: any = (0, nh.getAcpItemTimestamp)(ec.data);
                    await el.sessionUpdate({
                      sessionId: eA.id,
                      update: (0, nh.withAcpTimestampMeta)(eu, ed),
                    });
                  }
                } else if (
                  "message" === ec.data.type &&
                  "user" === ec.data.role
                ) {
                  let eu: any = np.AcpUtils.convertHistoryItemToAcp(ec.data),
                    ed: any = (0, nh.getAcpItemTimestamp)(ec.data);
                  for (let ec of eu)
                    await el.sessionUpdate({
                      sessionId: eA.id,
                      update: (0, nh.withAcpTimestampMeta)(ec, ed),
                    });
                }
              } else if ("model" === ec.type) {
                ec.parentToolUseId ||
                  ec.data?.type !== "response_started" ||
                  (ep.messageId = eA.messageId);
                let eu: any = ep.messageId || eA.messageId,
                  ed: any = eA.conversationRequestId,
                  eg: any = np.AcpUtils.convertOpenAIEventToAcp(ec.data),
                  eh: any = (0, nh.getAcpItemTimestamp)(ec.data);
                for (let ec of eg) {
                  if (np.AcpUtils.isInternalStreamingUpdate(ec)) continue;
                  eA.isCompressing &&
                    !eA.meta?.[nc.SESSION_META_COMPACT_CONTINUE_IN_PROGRESS] &&
                    (ec._meta = {
                      ...(ec._meta || {}),
                      "codebuddy.ai/isCompactInternal": !0,
                      ...(eA.meta?.[nc.SESSION_META_COMPACT_TYPE]
                        ? {
                            [nc.ACP_META_COMPACT_TYPE]:
                              eA.meta[nc.SESSION_META_COMPACT_TYPE],
                          }
                        : {}),
                    });
                  let ep: any = ec._meta || {};
                  (eu &&
                    !ep["codebuddy.ai/messageId"] &&
                    (ep["codebuddy.ai/messageId"] = eu),
                    ed &&
                      !ep["codebuddy.ai/requestId"] &&
                      (ep["codebuddy.ai/requestId"] = ed),
                    (ec._meta = ep),
                    eu &&
                      !ec.messageId &&
                      ("agent_message_chunk" === ec.sessionUpdate ||
                        "agent_thought_chunk" === ec.sessionUpdate) &&
                      (ec.messageId = eu),
                    await el.sessionUpdate({
                      sessionId: eA.id,
                      update: (0, nh.withAcpTimestampMeta)(ec, eh),
                    }));
                }
              } else if ("result" === ec.type) {
                if (
                  ec.data?.lastAgent?.name === r4.AgentNames.COMPACT &&
                  eA.isCompressing &&
                  eA.meta?.[nc.SESSION_META_COMPACT_EXPECTS_CONTINUE]
                )
                  return void this.logger.debug?.(
                    "[AcpTeamBridge] suppressing compact result session_end; waiting for post-compact continue result",
                  );
                let eu: any = ep.historyMarker
                  ? (0, nh.getLatestAcpOutputTimestamp)(
                      eA.history,
                      ep.historyMarker,
                    )
                  : void 0;
                (await el.sessionUpdate({
                  sessionId: eA.id,
                  update: (0, nh.buildAcpSessionEndUpdate)(
                    ep.requestId ?? eA.conversationRequestId,
                    eu,
                  ),
                }),
                  (ep.historyMarker = void 0),
                  (ep.requestId = void 0));
              }
            } catch (eA: any) {
              this.logger.debug?.(
                `[AcpTeamBridge] Failed to forward combineSubject event: ${eA}`,
              );
            }
        },
      );
    }
    stop(eA?: any): any {
      try {
        let eA: any = r6.ContainerUtil.get(nG.AgentTaskManager);
        for (let { event: el, listener: ec } of this.taskListeners)
          eA.off(el, ec);
      } catch (eA: any) {
        this.logger.debug?.(`[AcpTeamBridge] cleanup error during stop: ${eA}`);
      }
      for (let [eA, el] of ((this.taskListeners = []),
      this.combineSubscription &&
        (this.combineSubscription.unsubscribe(),
        (this.combineSubscription = void 0)),
      this.memberSubscriptions))
        (el.subscription.unsubscribe(),
          this.logger.debug?.(
            `[AcpTeamBridge] Unsubscribed from member "${eA}" session`,
          ));
      if (
        (this.memberSubscriptions.clear(),
        this.detachedBridge?.disconnectAll(),
        this.progressInterval &&
          (clearInterval(this.progressInterval),
          (this.progressInterval = void 0)),
        eA && this.lastIsInTeam)
      )
        try {
          r6.ContainerUtil.get(n$.TeamManager).isInTeam() ||
            (this.logger.debug?.(
              `[AcpTeamBridge] stop(): team gone, sending deferred team_deleted for "${this.lastTeamName}"`,
            ),
            this.pushTeamUpdate(eA, {
              type: "team_deleted",
              teamName: this.lastTeamName,
            }));
        } catch (eA: any) {
          this.logger.debug?.(
            `[AcpTeamBridge] stop(): failed to send deferred team_deleted: ${eA}`,
          );
        }
      ((this.connectionRef = void 0),
        (this.lastPushedMemberSnapshot = void 0),
        (this.idleTickCount = 0),
        this.teamIdleDebounceTimer &&
          (clearTimeout(this.teamIdleDebounceTimer),
          (this.teamIdleDebounceTimer = void 0)),
        this.leadAgentStateSubscription?.unsubscribe(),
        (this.leadAgentStateSubscription = void 0),
        (this.leadSessionRef = void 0),
        (this.lastPushedIdleState = void 0));
    }
    subscribeExistingMembers(eA?: any): any {
      try {
        let el: any = (0, nY.getTeamMemberRegistry)().getAll();
        if (el.length > 0) {
          let eA: any = el.map(
            (eA?: any) =>
              `${eA.info.name}(backend=${eA.info.backendType},task=${!!eA.getAgentTask()})`,
          );
          this.logger.debug?.(
            `[AcpTeamBridge] subscribeExisting: ${el.length} members: ${eA.join(", ")}`,
          );
        }
        for (let ec of el) {
          let el: any = ec.info.name,
            eu: any = ec.getAgentTask(),
            ed: any = ec.info.backendType;
          if (
            (eu &&
              eu.teamContext?.memberName &&
              this.subscribeMemberSession(eu, eA),
            !eu && ed && "in-process" !== ed)
          ) {
            let eu: any = ec.info.agentId?.split("@")[1] || "";
            (this.logger.debug?.(
              `[AcpTeamBridge] Detached "${el}" detected (backend=${ed}, team=${eu})`,
            ),
              this.connectDetachedMember(eu, el, eA));
          }
        }
      } catch (eA: any) {
        this.logger.warn?.(
          `[AcpTeamBridge] subscribeExistingMembers failed: ${eA instanceof Error ? eA.stack : eA}`,
        );
      }
    }
    connectDetachedMember(eA?: any, el?: any, ec?: any): any {
      this.sessionId
        ? (!this.detachedBridge &&
            ((this.detachedBridge = new DetachedMemberSseBridge(
              this.logger,
              this.sessionId,
              ec,
            )),
            this.acpAgent && this.detachedBridge.setAcpAgent(this.acpAgent)),
          this.detachedBridge.isConnected(el) ||
            this.detachedBridge.connectMember(eA, el).catch((eA?: any) => {
              this.logger.debug?.(
                `[AcpTeamBridge] Detached SSE connect failed for "${el}": ${eA}`,
              );
            }))
        : this.logger.debug?.(
            `[AcpTeamBridge] Cannot connect detached member "${el}": no sessionId yet`,
          );
    }
    tagMemberEvent(eA?: any, el?: any, ec?: any): any {
      let eu: any =
          eA?.sessionUpdate === "user_message_chunk" &&
          "string" == typeof eA?.content?.text
            ? eA.content.text
            : void 0,
        ed: any = eu ? (0, n$.parseInitialAssignmentOwner)(eu) : void 0,
        ep: any = ed && ed !== el ? ed : el;
      (ep !== el &&
        this.logger.error?.(
          `[AcpTeamBridge] cross-member initial assignment detected: subscription="${el}" content-owner="${ed}" taskId=${ec} sessionId=${this.sessionId} — retagging to content owner`,
        ),
        (eA._meta = { ...(eA._meta || {}), "codebuddy.ai/memberEvent": ep }));
    }
    subscribeMemberSession(eA?: any, el?: any): any {
      let ec: any = eA.teamContext?.memberName;
      if (!ec) return;
      let eu: any = this.memberSubscriptions.get(ec);
      if (eu) {
        if (eu.taskId === eA.id) return;
        (eu.subscription.unsubscribe(),
          this.logger.info?.(
            `[AcpTeamBridge] Replacing subscription for "${ec}" (old taskId=${eu.taskId}, new taskId=${eA.id})`,
          ),
          this.memberSubscriptions.delete(ec));
      }
      let ed: any = eA.getSubAgentSession?.();
      if (!ed)
        return void this.logger.debug?.(
          `[AcpTeamBridge] No subAgentSession yet for "${ec}", will retry`,
        );
      let ep: any = ed.meta?.teamContext?.memberName,
        eg: any = ep && ep !== ec ? ep : ec;
      if (
        (eg !== ec &&
          this.logger.error?.(
            `[AcpTeamBridge] cross-member session detected at subscription: subscription="${ec}" session-owner="${ep}" taskId=${eA.id} sessionId=${this.sessionId} — tagging with session owner`,
          ),
        this.logger.info?.(
          `[AcpTeamBridge] Subscribing to member "${ec}" — replaying ${ed.history?.length ?? 0} history items then streaming`,
        ),
        ed.history?.length)
      )
        for (let eu of ed.history) {
          let ed: any = np.AcpUtils.convertHistoryItemToAcp(eu),
            ep: any = (0, nh.getAcpItemTimestamp)(eu);
          for (let eu of ed)
            (this.tagMemberEvent(eu, eg, eA.id),
              el
                .sessionUpdate({
                  sessionId: this.sessionId,
                  update: (0, nh.withAcpTimestampMeta)(eu, ep),
                })
                .catch((eA?: any) => {
                  this.logger.warn?.(
                    `[AcpTeamBridge] history replay failed for "${ec}": ${eA}`,
                  );
                }),
              "tool_call" === eu.sessionUpdate &&
                eu.toolCallId &&
                this.acpAgent?.notifyToolCallSent(eu.toolCallId));
        }
      let eh: any = ed.combineSubject.subscribe(async (eu?: any) => {
        if (!this.leadSessionRef?.teamCancelled)
          try {
            let ec: any = [];
            if ("input" === eu.type)
              if (
                "function_call" === eu.data.type ||
                "function_call_result" === eu.data.type ||
                "function_call_output" === eu.data.type
              ) {
                let eA: any = np.AcpUtils.convertInputItemToAcp(eu.data, {});
                eA && (ec = [eA]);
              } else
                "message" === eu.data.type &&
                  (ec = np.AcpUtils.convertHistoryItemToAcp(eu.data));
            else
              "model" === eu.type &&
                (ec = np.AcpUtils.convertOpenAIEventToAcp(eu.data).filter(
                  (eA?: any) => !np.AcpUtils.isInternalStreamingUpdate(eA),
                ));
            let ed: any = (0, nh.getAcpItemTimestamp)(eu.data);
            for (let eu of ec)
              (this.tagMemberEvent(eu, eg, eA.id),
                await el.sessionUpdate({
                  sessionId: this.sessionId,
                  update: (0, nh.withAcpTimestampMeta)(eu, ed),
                }),
                "tool_call" === eu.sessionUpdate &&
                  eu.toolCallId &&
                  this.acpAgent?.notifyToolCallSent(eu.toolCallId));
          } catch (eA: any) {
            this.logger.debug?.(
              `[AcpTeamBridge] Failed to forward member "${ec}" event: ${eA}`,
            );
          }
      });
      this.memberSubscriptions.set(ec, { subscription: eh, taskId: eA.id });
    }
    collectMemberStatuses(): any {
      return (0, nY.getTeamMemberRegistry)()
        .getAll()
        .map((eA?: any) => {
          let el: any = eA.info,
            ec: any = eA.getAgentTask(),
            eu: any = {
              name: el.name,
              color: el.color,
              description: el.prompt,
              status: ec?.status ?? "pending",
              taskId: ec?.id,
              sessionId: ec?.sessionId,
            };
          return (
            ec?.tokenUsage &&
              (eu.tokenUsage = {
                inputTokens: ec.tokenUsage.inputTokens,
                outputTokens: ec.tokenUsage.outputTokens,
                lastContextWindow: ec.tokenUsage.lastContextWindow,
              }),
            ec?.toolCallHistory &&
              (eu.toolCallCount = ec.toolCallHistory.length),
            eA.lastFailure &&
              (eu.lastFailure = {
                error: eA.lastFailure.error,
                category: eA.lastFailure.category,
              }),
            eu
          );
        });
    }
    pushMemberStatusChange(eA?: any, el: any = !1): any {
      try {
        let ec: any = this.collectMemberStatuses(),
          eu: any = this.serializeMembersForDedup(ec);
        if (!el && eu === this.lastPushedMemberSnapshot) return !1;
        return (
          (this.lastPushedMemberSnapshot = eu),
          eA.sessionUpdate({
            sessionId: this.sessionId,
            update: (0, nh.withAcpTimestampMeta)({
              sessionUpdate: "session_info_update",
              _meta: {
                "codebuddy.ai/teamUpdate": {
                  type: "member_status_change",
                  members: ec,
                },
              },
            }),
          }),
          !0
        );
      } catch (eA: any) {
        return (
          this.logger.debug?.(
            `[AcpTeamBridge] Failed to push member status: ${eA}`,
          ),
          !1
        );
      }
    }
    serializeMembersForDedup(eA?: any): any {
      return JSON.stringify(
        eA.map((eA?: any) => ({
          n: eA.name,
          s: eA.status,
          t: eA.tokenUsage,
          c: eA.toolCallCount,
          f: eA.lastFailure,
        })),
      );
    }
    pushTeamUpdate(eA?: any, el?: any): any {
      try {
        eA.sessionUpdate({
          sessionId: this.sessionId,
          update: (0, nh.withAcpTimestampMeta)({
            sessionUpdate: "session_info_update",
            _meta: { "codebuddy.ai/teamUpdate": el },
          }),
        });
      } catch (eA: any) {
        this.logger.debug?.(
          `[AcpTeamBridge] Failed to push team update: ${eA}`,
        );
      }
    }
    evaluateTeamIdle(): any {
      (async () => {
        try {
          let eA: any = this.connectionRef;
          (eA && this.detectAndPushTeamStateChange(eA),
            (await this.computeIsTeamIdle())
              ? (this.teamIdleDebounceTimer &&
                  clearTimeout(this.teamIdleDebounceTimer),
                (this.teamIdleDebounceTimer = setTimeout(() => {
                  ((this.teamIdleDebounceTimer = void 0),
                    (async () => {
                      (await this.computeIsTeamIdle())
                        ? this.pushTeamIdleSignal("idle")
                        : this.logger.debug?.(
                            "[AcpTeamBridge] team_idle debounce: no longer idle at settle time, skipping push",
                          );
                    })().catch((eA?: any) => {
                      this.logger.debug?.(
                        `[AcpTeamBridge] team_idle settle check failed: ${eA}`,
                      );
                    }));
                }, nz)))
              : (this.teamIdleDebounceTimer &&
                  (clearTimeout(this.teamIdleDebounceTimer),
                  (this.teamIdleDebounceTimer = void 0)),
                "idle" === this.lastPushedIdleState &&
                  (r6.ContainerUtil.get(n$.TeamManager).isInTeam()
                    ? this.pushTeamIdleSignal("busy")
                    : (this.lastPushedIdleState = void 0))));
        } catch (eA: any) {
          this.logger.debug?.(`[AcpTeamBridge] evaluateTeamIdle failed: ${eA}`);
        }
      })().catch((eA?: any) => {
        this.logger.debug?.(
          `[AcpTeamBridge] evaluateTeamIdle outer failed: ${eA}`,
        );
      });
    }
    async computeIsTeamIdle(): Promise<any> {
      if (this._promptForwardingActive) return !1;
      try {
        let eA: any = r6.ContainerUtil.get(n$.TeamManager),
          el: any = eA.isInTeam(),
          eu: any = el ? void 0 : this.deletedTeamAwaitingIdleName,
          ed: any = eA.getTeam()?.name ?? eu;
        if (!ed || !this.allRegistryMembersTerminal()) return !1;
        let ep: any = this.leadSessionRef;
        if (
          ep &&
          (ep.isCompressing ||
            ep.meta?.[nc.SESSION_META_COMPACT_EXPECTS_CONTINUE] ||
            ep.meta?.[nc.SESSION_META_COMPACT_CONTINUE_IN_PROGRESS] ||
            !this.stateMachine.isIdle(ep))
        )
          return !1;
        try {
          let { isLeadInboxPaused: eA } = await Promise.resolve().then(
            ec.bind(ec, 54193),
          );
          if ((ep && eA(ep)) || (!el && eu)) return !0;
          let eg: any = r6.ContainerUtil.get(n$.TeamMailbox);
          if ((await eg.getUnread(ed, "team-lead")).length > 0) return !1;
        } catch (eA: any) {
          return (
            this.logger.debug?.(
              `[AcpTeamBridge] computeIsTeamIdle: mailbox check failed, treating as busy: ${eA}`,
            ),
            !1
          );
        }
        return !0;
      } catch (eA: any) {
        return (
          this.logger.debug?.(
            `[AcpTeamBridge] computeIsTeamIdle failed: ${eA}`,
          ),
          !1
        );
      }
    }
    pushTeamIdleSignal(eA?: any): any {
      if (this.lastPushedIdleState === eA) return;
      let el: any = this.connectionRef;
      if (!el) return;
      let ec: any = r6.ContainerUtil.get(n$.TeamManager),
        eu: any =
          ec.getTeam()?.name ??
          ("idle" === eA ? this.deletedTeamAwaitingIdleName : void 0);
      if (!eu) {
        ("busy" === eA && (this.lastPushedIdleState = void 0),
          this.logger.debug?.(
            `[AcpTeamBridge] skip ${eA} signal because no active team is available`,
          ));
        return;
      }
      this.lastPushedIdleState = eA;
      let ed: any = "idle" === eA ? "team_idle" : "team_busy";
      (this.logger.info?.(
        `[AcpTeamBridge] pushTeamIdleSignal: ${ed} (team=${eu})`,
      ),
        this.pushTeamUpdate(el, { type: ed, teamName: eu }),
        "idle" === eA &&
          eu === this.deletedTeamAwaitingIdleName &&
          (this.deletedTeamAwaitingIdleName = void 0));
    }
    detectAndPushTeamStateChange(eA?: any): any {
      try {
        let el: any = r6.ContainerUtil.get(n$.TeamManager),
          ec: any = el.isInTeam(),
          eu: any = el.getTeam()?.name,
          ed: any = !1;
        return (
          !this.lastIsInTeam && ec
            ? ((this.deletedTeamAwaitingIdleName = void 0),
              this.pushTeamUpdate(eA, { type: "team_created", teamName: eu }),
              (ed = !0))
            : this.lastIsInTeam &&
              !ec &&
              ((this.deletedTeamAwaitingIdleName =
                "idle" === this.lastPushedIdleState
                  ? void 0
                  : this.lastTeamName),
              this.pushTeamUpdate(eA, {
                type: "team_deleted",
                teamName: this.lastTeamName,
              }),
              (this.lastPushedIdleState = void 0),
              this.teamIdleDebounceTimer &&
                (clearTimeout(this.teamIdleDebounceTimer),
                (this.teamIdleDebounceTimer = void 0)),
              (ed = !0)),
          (this.lastIsInTeam = ec),
          (this.lastTeamName = eu),
          ed
        );
      } catch (eA: any) {
        return (
          this.logger.debug?.(
            `[AcpTeamBridge] detectAndPushTeamStateChange failed: ${eA}`,
          ),
          !1
        );
      }
    }
    startProgressInterval(): any {
      if (this.progressInterval) return;
      let eA: any = this.connectionRef;
      eA &&
        ((this.idleTickCount = 0),
        (this.progressInterval = setInterval(() => {
          try {
            let el: any = r6.ContainerUtil.get(n$.TeamManager),
              ec: any = this.detectAndPushTeamStateChange(eA),
              eu: any = !1;
            (el.isInTeam() &&
              ((eu = this.pushMemberStatusChange(eA, !1)),
              this.subscribeExistingMembers(eA)),
              ec || eu
                ? (this.idleTickCount = 0)
                : ((this.idleTickCount += 1),
                  this.idleTickCount >= nq &&
                    (this.logger.debug?.(
                      `[AcpTeamBridge] progressInterval idle ${this.idleTickCount} ticks, self-stopping (will restart on next task event)`,
                    ),
                    this.progressInterval &&
                      (clearInterval(this.progressInterval),
                      (this.progressInterval = void 0)))),
              this.evaluateTeamIdle());
          } catch (eA: any) {
            this.logger.debug?.(
              `[AcpTeamBridge] progressInterval tick failed: ${eA}`,
            );
          }
        }, nJ)));
    }
    restartProgressIntervalIfStopped(): any {
      this.progressInterval ||
        (this.logger.debug?.(
          "[AcpTeamBridge] restartProgressIntervalIfStopped: re-starting progressInterval",
        ),
        this.startProgressInterval());
    }
    isTerminalTaskEvent(eA?: any): any {
      return (
        "task-completed" === eA ||
        "task-failed" === eA ||
        "task-cancelled" === eA ||
        "task-killed" === eA
      );
    }
    allRegistryMembersTerminal(): any {
      let eA: any = (0, nY.getTeamMemberRegistry)().getAll();
      return (
        0 === eA.length ||
        eA.every((eA?: any) => {
          let el: any = eA.getAgentTask();
          if (!el) return !0;
          let ec: any = el.status;
          return (
            "completed" === ec ||
            "failed" === ec ||
            "cancelled" === ec ||
            "killed" === ec
          );
        })
      );
    }
  };
  // UTF-16 8305155..8305182
  let nV: any = "acp",
    nZ: any = 500,
    nX: any = 5e3;
  // UTF-16 8305182..8305260
  function isCancelBarrierActive(eA?: any, el: any = Date.now()): any {
    return void 0 !== eA && el - eA < nZ;
  }
  // UTF-16 8305260..8305387
  function applyAcpPromptTimestamp(eA?: any, el?: any): any {
    for (let ec of eA) {
      let eA: any = ec;
      eA?.type === "message" && "user" === eA.role && (eA.timestamp = el);
    }
  }
  // UTF-16 8305387..8326032
  let n0: any = class {
    [key: string]: any;
    constructor() {
      ((this.contentType = nD.MediaType.APPLICATION_JSON_UTF8),
        (this.priority = 400),
        (this.activeRenderConnections = new Set()),
        (this.lastCancelAtBySession = new Map()),
        (this.activePromptAbortControllers = new Map()));
    }
    getAcpAgent(): any {
      let eA: any = this.getConnectionIdFromRequest();
      if (!eA)
        return void this.logger.warn("No acp-connection-id in request headers");
      let el: any = this.agentManager.get(eA);
      return el
        ? (this.logger.info(`Got agent for connectionId: ${eA}`), el)
        : void this.logger.warn(`Agent not found for connectionId: ${eA}`);
    }
    getConnectionIdFromRequest(): any {
      try {
        let eA: any = nE.Context.getRequest().headers["acp-connection-id"];
        if (Array.isArray(eA)) return eA[0];
        return eA;
      } catch {
        return;
      }
    }
    init(): any {
      this.logger.setContext("AcpView");
    }
    createAbortError(): any {
      let eA: any = Error("aborted");
      return ((eA.name = "AbortError"), eA);
    }
    throwIfPromptAborted(eA?: any): any {
      if (eA?.aborted) throw this.createAbortError();
    }
    async raceWithPromptAbort(eA?: any, el?: any): Promise<any> {
      let ec: any;
      if (!el) return eA;
      this.throwIfPromptAborted(el);
      let eu: any = new Promise((eA?: any, eu?: any) => {
        ((ec = () => eu(this.createAbortError())),
          el.addEventListener("abort", ec, { once: !0 }));
      });
      try {
        return await Promise.race([eA, eu]);
      } finally {
        ec && el.removeEventListener("abort", ec);
      }
    }
    async waitForSessionUpdate(eA?: any, el?: any, ec?: any): Promise<any> {
      let eu: any,
        ed: any = new Promise((eA?: any) => {
          "function" ==
            typeof (eu = setTimeout(() => eA("timeout"), nX)).unref &&
            eu.unref();
        });
      try {
        let eu: any = await this.raceWithPromptAbort(
          Promise.race([eA.then(() => "sent"), ed]),
          ec,
        );
        if ("timeout" === eu)
          return (
            this.logger.warn?.(
              `[AcpView] Timed out sending sessionUpdate sessionId=${el} timeoutMs=${nX}`,
            ),
            !1
          );
        return !0;
      } finally {
        eu && clearTimeout(eu);
      }
    }
    async render(eA?: any, el?: any): Promise<any> {
      let eu: any = eA;
      try {
        let eA: any = this.sessionManager.getCurrent();
        eA?.id && eA.id === eu.id && (eu = eA);
      } catch (eA: any) {
        this.logger.debug?.(
          `getCurrent() failed, using model session: ${eA?.message}`,
        );
      }
      let ed: any = this.getConnectionIdFromRequest(),
        ep: any = this.getAcpAgent();
      if (!ep)
        return void this.logger.error("Cannot get AcpAgent, aborting render");
      ed && (eu.meta || (eu.meta = {}), (eu.meta.acpConnectionId = ed));
      let eg: any = ep.getSessionRequest();
      if (
        (eg &&
          (this.logger.info?.(
            `Processing session request: type=${eg.type}, sessionId=${eu.id}`,
          ),
          ep.setSession(eu)),
        ed && this.activeRenderConnections.has(ed))
      )
        return void this.logger.info?.(
          `Render loop already active for connection ${ed}, skipping duplicate`,
        );
      ed && this.activeRenderConnections.add(ed);
      let eh: any = [];
      (eh.push(
        ep.modelChangeEvent.subscribe(async (eA?: any) => {
          if (eu.id === eA.sessionId) {
            (this.logger.info?.(
              `Applying model ${eA.modelId} to session ${eA.sessionId}`,
            ),
              (eu.requestOptions.model = eA.modelId),
              (eu.options.model = eA.modelId),
              this.sessionManager.setOverrideModel(eu.id, eA.modelId));
            let el: any = r6.ContainerUtil.get(nL.CliSettingsProvider);
            await el.set("model", eA.modelId);
          }
        }),
      ),
        eh.push(
          ep.modeChangeEvent.subscribe(async (eA?: any) => {
            if (eu.id === eA.sessionId) {
              if (
                (this.logger.info?.(
                  `Applying mode ${eA.modeId} to session ${eA.sessionId}`,
                ),
                eA.modeId === nP.PermissionMode.Plan &&
                  !eu.meta?.prePlanPermissionMode)
              ) {
                eu.meta = eu.meta || {};
                let eA: any = eu.permissionModeSubject.value;
                ((eu.meta.prePlanPermissionMode =
                  eA && eA !== nP.PermissionMode.Plan
                    ? eA
                    : nP.PermissionMode.Default),
                  this.logger.info?.(
                    `Saved prePlanPermissionMode=${eu.meta.prePlanPermissionMode} before entering plan mode`,
                  ));
              }
              eu.permissionModeSubject.next(eA.modeId);
              try {
                let el: any = ep.getConnection();
                await el.sessionUpdate(
                  (0, nh.withAcpTimestampMeta)({
                    sessionId: eu.id,
                    update: {
                      sessionUpdate: "current_mode_update",
                      currentModeId: eA.modeId,
                    },
                  }),
                );
              } catch (eA: any) {
                this.logger.warn?.(`Failed to send current_mode_update: ${eA}`);
              }
            }
          }),
        ),
        eh.push(
          ep.configChangeEvent
            .pipe(
              (0, nR.filter)((eA?: any) => eu.id === eA.sessionId),
              (0, nk.distinctUntilChanged)(
                (eA?: any, el?: any) =>
                  eA.configId === el.configId && eA.value === el.value,
              ),
            )
            .subscribe(async (eA?: any) => {
              this.logger.info?.(
                `Config changed: ${eA.configId} = ${eA.value}`,
              );
              try {
                let eA: any = ep.getConnection(),
                  el: any = await ep.getConfigOptions(eu);
                await eA.sessionUpdate(
                  (0, nh.withAcpTimestampMeta)({
                    sessionId: eu.id,
                    update: {
                      sessionUpdate: "config_option_update",
                      configOptions: el,
                    },
                  }),
                );
              } catch (eA: any) {
                this.logger.warn?.(
                  `Failed to send config_option_update: ${eA}`,
                );
              }
            }),
        ),
        (async () => {
          try {
            let eA: any = ep.getConnection(),
              el: any = await ep.getConfigOptions(eu);
            await eA.sessionUpdate(
              (0, nh.withAcpTimestampMeta)({
                sessionId: eu.id,
                update: {
                  sessionUpdate: "config_option_update",
                  configOptions: el,
                },
              }),
            );
          } catch (eA: any) {
            this.logger.warn?.(
              `Failed to send initial config_option_update: ${eA}`,
            );
          }
        })(),
        eh.push(
          ep.cancelEvent.subscribe(async (eA?: any) => {
            if (eu.id === eA.sessionId) {
              (this.logger.info?.(
                `Aborting session ${eA.sessionId} due to cancel event`,
              ),
                eA.cancelReason &&
                  (eu.meta ?? (eu.meta = {}),
                  (eu.meta[r8.ACP_META_CANCEL_REASON] = eA.cancelReason)),
                this.stateMachine.transition(eu, {
                  type: nu.SessionRunEventType.CANCEL_REQUESTED,
                  reason: "acp_cancel",
                }),
                this.activePromptAbortControllers.get(eA.sessionId)?.abort(),
                eu.abortController.abort(),
                this.lastCancelAtBySession.set(eA.sessionId, Date.now()),
                (eu.teamCancelled = !0),
                (0, nu.cancelSessionRuntimeState)(eu, "cancelled", {
                  interruptionService: this.interruptionService,
                  acpBroadcastService: this.broadcastService,
                  taskStorage: this.taskStorage,
                  logger: this.logger,
                }));
              try {
                let {
                  getTeamMemberRegistry: eA,
                  pauseTeamLeadFollowUpDispatch: el,
                } = await Promise.resolve().then(ec.bind(ec, 54193));
                el(eu);
                let ed: any = eA()
                  .getAll()
                  .filter((eA?: any) => eA.isActive());
                await Promise.all(
                  ed.map(
                    (eA?: any) => (
                      this.logger.info?.(
                        `Killing active team member: ${eA.info.name}`,
                      ),
                      eA.forceKill({ keepWakeable: !1 }).catch((el?: any) => {
                        this.logger.warn?.(
                          `forceKill failed for ${eA.info.name}: ${el}`,
                        );
                      })
                    ),
                  ),
                );
              } catch {}
            }
          }),
        ));
      let ef: any = new AcpTeamBridge(this.logger);
      (ef.setAcpAgent(ep), ef.start(eu, ep.getConnection()));
      try {
        for await (let eA of this.createPromptIterator(ep, eu)) {
          let el: any = this.sessionManager.sessionSubject.value;
          if (
            (el &&
              el.id !== eu.id &&
              (this.logger.info?.(`Session switched from ${eu.id} to ${el.id}`),
              (eu = el)),
            eA.isDrain)
          ) {
            let el: any = eu.queue?.length ?? 0;
            (this.logger.info?.(
              `[AcpView] Processing drain item for session ${eu.id} | session.queue.length=${el}`,
            ),
              el > 0 &&
                (await this.drainBackgroundTaskNotifications(eu, ep, ef)),
              eA.responseDeferred.resolve({ stopReason: "end_turn" }));
            continue;
          }
          let ec: any = (0, nh.createAcpHistoryMarker)(eu.history);
          try {
            ef.setPromptForwardingActive(!0);
            let el: any = await this.executePrompt(eA, eu, ep, ec),
              ed: any =
                el.timestamp ??
                (0, nh.getLatestAcpOutputTimestamp)(eu.history, ec),
              eg: any = { stopReason: el.stopReason },
              eh: any = (0, nW.resolveUserItemIdForResponse)(
                eu.history,
                eA.tracking.messageRequestId,
              );
            eh
              ? (eg.userMessageId = eh)
              : eA.tracking.messageRequestId &&
                (eg.userMessageId = eA.tracking.messageRequestId);
            let em: any = el.traceId,
              eE: any = eu.meta?.[r8.ACP_META_CANCEL_REASON];
            ((el.errorMessage ||
              el.finishReason ||
              eu.conversationRequestId ||
              em ||
              el.modelRequestId ||
              eE ||
              void 0 !== ed) &&
              ((eg._meta =
                void 0 !== ed
                  ? (0, nh.withAcpTimestampRecord)(void 0, ed)
                  : {}),
              eu.conversationRequestId &&
                (eg._meta["codebuddy.ai/requestId"] = eu.conversationRequestId),
              el.modelRequestId &&
                (eg._meta["codebuddy.ai/modelRequestId"] = el.modelRequestId),
              em && (eg._meta["codebuddy.ai/traceId"] = em),
              el.errorMessage &&
                (eg._meta["codebuddy.ai/errorMessage"] = el.errorMessage),
              el.finishReason &&
                (eg._meta["codebuddy.ai/finishReason"] = el.finishReason),
              "string" == typeof eE &&
                ((eg._meta[r8.ACP_META_CANCEL_REASON] = eE),
                delete eu.meta?.[r8.ACP_META_CANCEL_REASON])),
              eA.responseDeferred.resolve(eg));
          } catch (eE: any) {
            this.logger.error(`Error executing prompt: ${eE}`);
            let el: any =
              eu.abortSignal?.aborted ||
              (eE instanceof Error &&
                ("AbortError" === eE.name || eE.message.includes("aborted")));
            el &&
              eu.isCompressing &&
              this.logger.warn?.(
                "[AcpView] executePrompt catch: isCompressing=true but catch reached — outer safety net resolving cancelled (investigate if this appears in prod)",
              );
            let ed: any =
                eE instanceof nT.ModelBehaviorError ||
                (null != eE &&
                  "object" == typeof eE &&
                  "error" in eE &&
                  eE.error instanceof nT.ModelBehaviorError),
              eg: any = (0, nh.getLatestAcpOutputTimestamp)(eu.history, ec),
              eh: any = eu.conversationRequestId || eA.tracking.requestId,
              ef: any =
                void 0 !== eg ? (0, nh.withAcpTimestampRecord)(void 0, eg) : {};
            if ((eh && (ef["codebuddy.ai/requestId"] = eh), el)) {
              let el: any =
                  eu.traceId ??
                  eu.telemetry?.traceId ??
                  eu.lastConversationTraceId,
                ec: any = {
                  ...ef,
                  ...(el ? { "codebuddy.ai/traceId": el } : {}),
                },
                ed: any =
                  (0, nW.resolveUserItemIdForResponse)(
                    eu.history,
                    eA.tracking.messageRequestId,
                  ) ?? eA.tracking.messageRequestId;
              eA.responseDeferred.resolve({
                stopReason: "cancelled",
                ...(ed ? { userMessageId: ed } : {}),
                ...(Object.keys(ec).length > 0 ? { _meta: ec } : {}),
              });
            } else if (ed)
              (this.logger.info?.(
                "[AcpView] executePrompt: ModelBehaviorError — treating as end_turn (model self-correction)",
              ),
                eA.responseDeferred.resolve({
                  stopReason: "end_turn",
                  ...(eA.tracking.messageRequestId
                    ? { userMessageId: eA.tracking.messageRequestId }
                    : {}),
                  ...(Object.keys(ef).length > 0 ? { _meta: ef } : {}),
                }));
            else {
              let el: any = (0, r5.classifyErrorAsRequestError)(eE),
                ec: any = JSON.stringify(el.toErrorResponse()),
                ed: any = eu.traceId ?? eu.lastConversationTraceId;
              eA.responseDeferred.resolve({
                stopReason: "refusal",
                ...(eA.tracking.messageRequestId
                  ? { userMessageId: eA.tracking.messageRequestId }
                  : {}),
                _meta: {
                  ...ef,
                  ...(ed ? { "codebuddy.ai/traceId": ed } : {}),
                  "codebuddy.ai/errorMessage": ec,
                },
              });
            }
            let em: any = ep.getConnectionId();
            em &&
              (await this.broadcastService.broadcastSessionEnd(
                eu.id,
                em,
                eu,
                eg,
                el ? "cancelled" : ed ? "end_turn" : "refusal",
              ));
          } finally {
            ef.setPromptForwardingActive(!1);
          }
          if (!nB.QueueDispatchUtils.isDeferredDispatchEnabledSync())
            for (; this.shouldDrainQueue(eu); )
              await this.drainQueuedMessages(eu, ep, ef);
        }
      } finally {
        (ef.stop(ep.getConnection()),
          eh.forEach((eA?: any) => eA.unsubscribe()),
          ed && this.activeRenderConnections.delete(ed),
          this.lastCancelAtBySession.delete(eu.id));
      }
    }
    async executePrompt(eA?: any, el?: any, eu?: any, ed?: any): Promise<any> {
      let { request: ep, tracking: eg } = eA,
        eh: any = this.lastCancelAtBySession.get(ep.sessionId);
      if (isCancelBarrierActive(eh)) {
        let eA: any = Date.now() - eh;
        return (
          this.logger.info?.(
            `[AcpView] executePrompt short-circuited by cancel barrier for session ${ep.sessionId} (${eA}ms since cancel)`,
          ),
          {
            stopReason: "cancelled",
            traceId: el.traceId ?? el.lastConversationTraceId,
          }
        );
      }
      let ef: any = new AbortController(),
        em: any = this.activePromptAbortControllers.get(el.id);
      (em?.abort(), this.activePromptAbortControllers.set(el.id, ef));
      let eE: any = ef.signal,
        eC: any = !1;
      try {
        this.logger.info?.(`Executing prompt for session ${ep.sessionId}`);
        try {
          let { resumeTeamLeadFollowUpDispatch: eA } =
            await Promise.resolve().then(ec.bind(ec, 54193));
          eA(el);
        } catch {}
        (el.teamCancelled && (el.teamCancelled = !1),
          (el.permissionDenials = []),
          (el.consecutiveMaxTokenCompactCount = 0));
        let eA: any = (0, ne.extractVisiblePromptText)(ep.prompt || []),
          eh: any = (0, nh.resolveAcpTimestamp)(ep._meta?.timestamp),
          ef: any = await this.tryExecuteLocalCommand(
            eA.trim(),
            el,
            eu,
            eg,
            ed,
            eh,
          );
        if (ef) return ef;
        this.frictionAnalysisService.capturePrompt(el, eA);
        let em: any = ep._meta?.["codebuddy.ai"] || {},
          ey: any = "string" == typeof em.growthEvent ? em.growthEvent : void 0,
          ew: any = np.AcpUtils.promptToUserMessage(ep),
          eB: any = nj.StreamJsonUtils.parseMessagesFromPipeInput(
            JSON.stringify(ew),
          );
        (this.annotatePromptDerivedContent(eB, ep.prompt || []),
          applyAcpPromptTimestamp(eB, eh),
          el.meta &&
            (el.meta.pendingMentionInfo =
              nB.TelemetryUtils.extractMentionInfoFromPrompt(ep.prompt)));
        let e_: any = eu.getConnectionId();
        e_ &&
          (eA &&
            (await this.broadcastService.broadcastUserMessage(
              el.id,
              eA,
              e_,
              void 0,
              eg,
              el,
              eh,
            )),
          this.broadcastService.startBroadcasting(el, e_, eg),
          (eC = !0));
        let eI: any = eu.createEventForwardingPromise(el, eg, { signal: eE });
        el.requestOptions ?? (el.requestOptions = {});
        let ev: any = el.requestOptions.providerData,
          eS: any = el.requestOptions.growthEventRequestId;
        if (ey) {
          el.requestOptions.growthEventRequestId = void 0;
          let eA: any = ev?.extra_vars,
            ec: any =
              eA && "object" == typeof eA && !Array.isArray(eA) ? eA : {};
          el.requestOptions.providerData = {
            ...(ev ?? {}),
            extra_vars: { ...ec, growthEvent: ey },
          };
        }
        let eQ: any = await (async () => {
          try {
            await this.raceWithPromptAbort(
              this.agentService.runDefault(eB, { context: el }),
              eE,
            );
            let eA: any = await this.raceWithPromptAbort(eI, eE),
              ec: any =
                el.traceId ??
                el.telemetry?.traceId ??
                el.lastConversationTraceId,
              eu: any = (0, nh.getLatestAcpOutputTimestamp)(el.history, ed);
            return {
              ...eA,
              ...(!eA.traceId && ec ? { traceId: ec } : {}),
              ...(el.requestOptions.growthEventRequestId
                ? { modelRequestId: el.requestOptions.growthEventRequestId }
                : {}),
              ...(void 0 !== eu ? { timestamp: eu } : {}),
            };
          } finally {
            ey &&
              ((el.requestOptions.providerData = ev),
              (el.requestOptions.growthEventRequestId = eS));
          }
        })();
        return (
          "cancelled" === eQ.stopReason ||
            eE.aborted ||
            (await this.sendPendingTitleUpdate(el, eu, eg, eE)),
          e_ &&
            ("cancelled" === eQ.stopReason || eE.aborted
              ? await this.broadcastService.broadcastSessionEnd(
                  el.id,
                  e_,
                  el,
                  eQ.timestamp,
                  "cancelled",
                )
              : await this.raceWithPromptAbort(
                  this.broadcastService.broadcastSessionEnd(
                    el.id,
                    e_,
                    el,
                    eQ.timestamp,
                    "refusal" === eQ.stopReason ? "refusal" : "end_turn",
                  ),
                  eE,
                )),
          this.logger.info?.(
            `Prompt completed for session ${ep.sessionId}, stopReason: ${eQ.stopReason}, finishReason: ${eQ.finishReason}`,
          ),
          eQ
        );
      } finally {
        (eC && this.broadcastService.stopBroadcasting(el.id),
          this.activePromptAbortControllers.get(el.id) === ef &&
            this.activePromptAbortControllers.delete(el.id));
      }
    }
    annotatePromptDerivedContent(eA?: any, el?: any): any {
      if (!Array.isArray(el) || 0 === el.length) return;
      let ec: any = eA.find(
        (eA?: any) =>
          "message" === eA.type &&
          "user" === eA.role &&
          Array.isArray(eA.content),
      );
      if (
        !ec?.content ||
        ec.content.filter((eA?: any) => eA?.type === "input_text").length <= 1
      )
        return;
      let eu: any = 0;
      for (let eA of el)
        if (eA && "object" == typeof eA)
          switch (eA.type) {
            case "text":
              eu++;
              break;
            case "resource_link": {
              let el: any = eA._meta || {};
              if ("inspiration" === el.mentionType && el.detail) break;
              let ed: any = ec.content[eu];
              if (
                ed?.type === "input_text" &&
                "string" == typeof eA.uri &&
                eA.uri.startsWith("command://")
              ) {
                let el: any = (0, ne.encodeAcpResourceLinkToInputText)({
                  uri: eA.uri,
                  name: eA.name,
                });
                el.providerData &&
                  (ed.providerData = {
                    ...(ed.providerData || {}),
                    ...el.providerData,
                  });
              }
              eu++;
              break;
            }
            case "resource":
              eA.resource && "text" in eA.resource && eu++;
              break;
            case "image":
              (eA.data ||
                ("string" == typeof eA.uri && eA.uri.startsWith("http"))) &&
                eu++;
          }
    }
    injectTrackingMeta(eA?: any, el?: any, ec?: any, eu?: any): any {
      let ed: any = el.conversationRequestId || ec?.requestId,
        ep: any = el.messageId || ec?.messageId,
        eg: any = ec?.messageRequestId || ed,
        eh: any = { ...(eA._meta || {}) };
      (ed &&
        !eh["codebuddy.ai/requestId"] &&
        (eh["codebuddy.ai/requestId"] = ed),
        ep &&
          !eh["codebuddy.ai/messageId"] &&
          (eh["codebuddy.ai/messageId"] = ep),
        eg &&
          !eh["codebuddy.ai/messageRequestId"] &&
          (eh["codebuddy.ai/messageRequestId"] = eg));
      let ef: any = { ...eA, _meta: eh };
      return (
        !ef.messageId &&
          ("user_message_chunk" === ef.sessionUpdate && eg
            ? (ef.messageId = eg)
            : ("agent_message_chunk" === ef.sessionUpdate ||
                "agent_thought_chunk" === ef.sessionUpdate) &&
              ep &&
              (ef.messageId = ep)),
        (0, nh.withAcpTimestampMeta)(ef, eu)
      );
    }
    async tryExecuteLocalCommand(
      eA?: any,
      el?: any,
      ec?: any,
      eu?: any,
      ed?: any,
      ep?: any,
    ): Promise<any> {
      if (!eA.startsWith("/")) return;
      let eg: any = this.commandManager.parseCommand(eA);
      if (!(!eg || this.commandManager.isOverriddenByCustom(eg.name))) {
        if (["/stats", "/rewind"].includes(eg.name)) {
          this.logger.info?.(`[AcpView] Skipping TUI-only command: ${eg.name}`);
          let eA: any = ec.getConnection(),
            ed: any = this.injectTrackingMeta(
              {
                sessionUpdate: "agent_message_chunk",
                content: {
                  type: "text",
                  text: `The ${eg.name} command is only available in the terminal.`,
                },
              },
              el,
              eu,
            );
          return (
            await eA.sessionUpdate({ sessionId: el.id, update: ed }),
            { stopReason: "end_turn" }
          );
        }
        this.logger.info?.(`[AcpView] Executing local command: ${eg.name}`);
        try {
          let eA: any = ec.getConnection(),
            eh: any = [],
            ef: any = el.combineSubject.subscribe((ec?: any) => {
              if ("input" === ec.type) {
                for (let ed of np.AcpUtils.convertHistoryItemToAcp(ec.data))
                  if ("agent_message_chunk" === ed.sessionUpdate) {
                    let ep: any = (0, nh.getAcpItemTimestamp)(ec.data);
                    eh.push(
                      eA.sessionUpdate({
                        sessionId: el.id,
                        update: this.injectTrackingMeta(ed, el, eu, ep),
                      }),
                    );
                  }
              }
            });
          try {
            (await this.commandManager.executeLocalCommand({
              session: el,
              ...eg,
              timestamp: ep,
            }),
              await this.sessionManager.flushHistory(el),
              await Promise.all(eh));
          } finally {
            ef.unsubscribe();
          }
          let em: any = (0, nh.getLatestAcpOutputTimestamp)(el.history, ed),
            eE: any = ec.getConnectionId();
          return (
            eE &&
              (await this.broadcastService.broadcastSessionEnd(
                el.id,
                eE,
                el,
                em,
              )),
            {
              stopReason: "end_turn",
              ...(void 0 !== em ? { timestamp: em } : {}),
            }
          );
        } catch (eA: any) {
          return (
            this.logger.error?.(
              `[AcpView] Local command execution failed: ${eA}`,
            ),
            {
              stopReason: "refusal",
              errorMessage: eA instanceof Error ? eA.message : String(eA),
            }
          );
        }
      }
    }
    async sendPendingTitleUpdate(
      eA?: any,
      el?: any,
      ec?: any,
      eu?: any,
    ): Promise<any> {
      try {
        if (eu?.aborted) return;
        let ed: any = r6.ContainerUtil.get(
          nO.SessionTitleService,
        ).getPendingTitlePromise(eA.id);
        if (ed) {
          let el: any = !1,
            ec: any = new Promise((eA?: any) => {
              let ec: any = setTimeout(() => {
                ((el = !0), eA());
              }, 5e3);
              "function" == typeof ec.unref && ec.unref();
            });
          (await this.raceWithPromptAbort(Promise.race([ed, ec]), eu),
            el &&
              this.logger.warn?.(
                `[AcpView] Timed out waiting for pending title generation sessionId=${eA.id} timeoutMs=5000`,
              ));
        }
        if (eu?.aborted) return;
        let ep: any = (0, nN.getEffectiveSessionTitle)(eA.history);
        if (!ep) return;
        let eg: any = el.getConnection();
        (await this.waitForSessionUpdate(
          eg.sessionUpdate({
            sessionId: eA.id,
            update: this.injectTrackingMeta(
              { sessionUpdate: "session_info_update", title: ep },
              eA,
              ec,
            ),
          }),
          eA.id,
          eu,
        )) && this.logger.info?.(`Sent session_info_update with title: ${ep}`);
      } catch (eA: any) {
        if (eA instanceof Error && "AbortError" === eA.name) return;
        this.logger.warn?.(`Failed to send title update: ${eA}`);
      }
    }
    async sendTerminalSessionEnd(eA?: any, el?: any, ec?: any): Promise<any> {
      let eu: any = (0, nh.buildAcpSessionEndUpdate)(
        eA.conversationRequestId,
        ec,
      );
      (await this.waitForSessionUpdate(
        el.getConnection().sessionUpdate({ sessionId: eA.id, update: eu }),
        eA.id,
      )) ||
        this.logger.warn?.(
          `[AcpView] Failed to send terminal session_end sessionId=${eA.id}`,
        );
    }
    shouldDrainQueue(eA?: any): any {
      return this.stateMachine.isIdle(eA) && (eA.queue?.length ?? 0) > 0;
    }
    async drainQueuedMessages(eA?: any, el?: any, ec?: any): Promise<any> {
      let eu: any = eA.queue?.length ?? 0;
      this.logger.info?.(`[AcpView] Draining ${eu} queued message(s)`);
      let ed: any = (0, nh.createAcpHistoryMarker)(eA.history);
      try {
        ec.setPromptForwardingActive(!0);
        let eu: any = el.getConnectionId();
        eu && this.broadcastService.startBroadcasting(eA, eu);
        let ep: any = el.createEventForwardingPromise(eA);
        (await this.agentService.runDefault([], { context: eA }), await ep);
        let eg: any = (0, nh.getLatestAcpOutputTimestamp)(eA.history, ed);
        (await this.sendPendingTitleUpdate(eA, el),
          this.broadcastService.stopBroadcasting(eA.id),
          await this.sendTerminalSessionEnd(eA, el, eg),
          eu &&
            (await this.broadcastService.broadcastSessionEnd(
              eA.id,
              eu,
              eA,
              eg,
            )));
      } catch (eA: any) {
        this.logger.warn?.(`[AcpView] Failed to drain queued messages: ${eA}`);
      } finally {
        ec.setPromptForwardingActive(!1);
      }
    }
    async drainBackgroundTaskNotifications(
      eA?: any,
      el?: any,
      ec?: any,
    ): Promise<any> {
      let eu: any = [...eA.queue];
      if (((eA.queue.length = 0), eA.queueSubject?.next?.([]), 0 === eu.length))
        return;
      this.logger.info?.(
        `[AcpView] Draining ${eu.length} background task notification(s)`,
      );
      let ed: any = (0, nh.createAcpHistoryMarker)(eA.history);
      try {
        ec.setPromptForwardingActive(!0);
        let ep: any = el.getConnectionId();
        ep && this.broadcastService.startBroadcasting(eA, ep);
        let eg: any = el.createEventForwardingPromise(eA);
        (await this.agentService.runDefault(eu, { context: eA }), await eg);
        let eh: any = (0, nh.getLatestAcpOutputTimestamp)(eA.history, ed);
        (await this.sendPendingTitleUpdate(eA, el),
          this.broadcastService.stopBroadcasting(eA.id),
          await this.sendTerminalSessionEnd(eA, el, eh),
          ep &&
            (await this.broadcastService.broadcastSessionEnd(
              eA.id,
              ep,
              eA,
              eh,
            )));
      } catch (eA: any) {
        this.logger.warn?.(
          `[AcpView] Failed to drain background task notifications: ${eA}`,
        );
      } finally {
        ec.setPromptForwardingActive(!1);
      }
    }
    createPromptIterator(eA?: any, el?: any): any {
      let ec: any = [],
        eu: any = null,
        ed: any = !1,
        ep: any = eA.promptEvent.subscribe((ed?: any) => {
          let ep: any = this.stateMachine.isBusyForQueue(el),
            eg: any = ep
              ? "dispatchQueued"
              : eu
                ? "resolveWaiter"
                : "parkInQueue";
          (this.logger.info?.(
            `[AcpView][PromptIterator] received prompt session=${el.id} route=${eg} runState=${this.stateMachine.getSnapshot(el).status} queueLen=${ec.length} hasWaiter=${!!eu}`,
          ),
            ep
              ? this.dispatchQueuedPrompt(ed, el, eA)
              : eu
                ? (eu(ed), (eu = null))
                : ec.push(ed));
        });
      return {
        [Symbol.asyncIterator]: () => ({
          next: async () => {
            if (ec.length > 0) return { value: ec.shift(), done: !1 };
            if (ed) return (ep.unsubscribe(), { value: void 0, done: !0 });
            let eA: any = await new Promise((eA?: any) => {
              eu = eA;
            });
            return null === eA
              ? (ep.unsubscribe(), { value: void 0, done: !0 })
              : { value: eA, done: !1 };
          },
          return: async () => (
            (ed = !0),
            eu && eu(null),
            ep.unsubscribe(),
            { value: void 0, done: !0 }
          ),
        }),
      };
    }
    async dispatchQueuedPrompt(eA?: any, el?: any, ec?: any): Promise<any> {
      let { request: eu } = eA;
      this.logger.info?.(
        `[AcpView] Dispatching queued prompt for session ${eu.sessionId} (agent in conversation)`,
      );
      try {
        let ec: any = np.AcpUtils.promptToUserMessage(eu),
          ed: any = nj.StreamJsonUtils.parseMessagesFromPipeInput(
            JSON.stringify(ec),
          ),
          ep: any = (0, nh.resolveAcpTimestamp)(eu._meta?.timestamp);
        (applyAcpPromptTimestamp(ed, ep),
          el.meta &&
            (el.meta.pendingMentionInfo =
              nB.TelemetryUtils.extractMentionInfoFromPrompt(eu.prompt)),
          await this.agentService.runDefault(ed, { context: el }),
          eA.responseDeferred.resolve({
            stopReason: "end_turn",
            ...(eA.tracking.messageRequestId
              ? { userMessageId: eA.tracking.messageRequestId }
              : {}),
          }));
      } catch (ec: any) {
        this.logger.error(`[AcpView] Failed to dispatch queued prompt: ${ec}`);
        let el: any = (0, r5.classifyErrorAsRequestError)(ec);
        eA.responseDeferred.resolve({
          stopReason: "refusal",
          ...(eA.tracking.messageRequestId
            ? { userMessageId: eA.tracking.messageRequestId }
            : {}),
          _meta: {
            "codebuddy.ai/errorMessage": JSON.stringify(el.toErrorResponse()),
          },
        });
      }
    }
    triggerDrain(eA?: any): any {
      let el: any = eA.meta?.acpConnectionId;
      if (!el)
        return void this.logger.warn?.(
          "[AcpView] triggerDrain: no acpConnectionId in session.meta, falling through",
        );
      let ec: any = this.agentManager.get(el);
      if (!ec)
        return void this.logger.warn?.(
          `[AcpView] triggerDrain: no AcpAgent for connectionId=${el}`,
        );
      this.logger.info?.(
        `[AcpView] triggerDrain: injecting drain item for session=${eA.id}`,
      );
      let eu: any = new r6.Deferred();
      (ec.promptEvent.next({
        request: { sessionId: eA.id, prompt: [] },
        responseDeferred: eu,
        tracking: { requestId: "", messageId: "" },
        isDrain: !0,
      }),
        eu.promise.catch(() => {}));
    }
    support({ viewName: eA }: any): any {
      return Promise.resolve(eA === nV);
    }
  };
  return {
    AcpView: n0,
    AcpTeamBridge: AcpTeamBridge,
    DetachedMemberSseBridge: DetachedMemberSseBridge,
    isCancelBarrierActive,
    applyAcpPromptTimestamp,
  };
}

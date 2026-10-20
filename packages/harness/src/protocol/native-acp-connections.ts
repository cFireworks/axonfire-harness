// @ts-nocheck
// Full inert original declarations. Only explicit modules, owned IO and timers are injected; no app bootstrap/decorators.
export const ACP_CONNECTION_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export const ACP_CONNECTION_CLASSES = [
  ["r7", 8247867, 8248477],
  ["nC", 8263316, 8265298],
  ["ny", 8266795, 8266895],
  ["nQ", 8277054, 8279881],
  ["n2", 8329001, 8329495],
  ["n3", 8330457, 8330637],
  ["n4", 8331287, 8331424],
  ["n6", 8333753, 8356451],
  ["iu", 8357650, 8360641],
  ["ih", 8363578, 8366139],
] as const;
export const ACP_CONNECTION_FUNCTIONS = [
  ["headerValue", 8276941, 8277047],
  ["acp_stream_manager_headerValue", 8332311, 8332436],
  ["isObject", 8332436, 8332510],
  ["describeAcpMessage", 8332510, 8333119],
  ["isJsonRpcRequest", 8333119, 8333213],
  ["isJsonRpcResponseOrError", 8333213, 8333328],
  ["isInitializeRequest", 8333328, 8333407],
  ["isPromptRequest", 8333407, 8333486],
  ["isCancelNotification", 8333486, 8333570],
  ["safeJsonStringify", 8333570, 8333743],
  ["isLoopbackAddress", 8361349, 8361765],
  ["isLoopbackIpv4", 8361765, 8361940],
  ["isLoopbackIpv6", 8361940, 8362083],
  ["expandIpv6", 8362083, 8362605],
  ["hexMappedToIpv4", 8362605, 8362850],
  ["acp_security_middleware_headerValue", 8363441, 8363571],
] as const;
export const ACP_CONNECTION_INITIALIZERS = [
  ["n7", 8357628, 8357630],
  ["il", 8357634, 8357639],
  ["ic", 8357643, 8357646],
  ["ig", 8363409, 8363440],
] as const;
export const ACP_CONNECTION_STATICS = [
  ["n6.PROMPT_TIMEOUT_MS", 8356452, 8356477],
  ["n6.STREAM_CLOSE_DELAY_MS", 8356478, 8356504],
  ["n6.CANCEL_GRACE_MS", 8356505, 8356527],
  ["n6.SSE_HEARTBEAT_INTERVAL_MS", 8356528, 8356560],
  ["n6.SWEEP_KIND_CANCEL", 8356561, 8356590],
  ["n6.SWEEP_KIND_TIMEOUT", 8356591, 8356622],
] as const;
export const ACP_CONNECTION_UNINITIALIZED = [
  ["eG", "var", 8246754, 8246756],
] as const;
export const ACP_CONNECTION_DECLARATIONS = [
  ["r7", 8247860, 8248478],
  ["nC", 8263309, 8265299],
  ["ny", 8266788, 8266896],
  ["headerValue", 8276941, 8277047],
  ["nQ", 8277047, 8279882],
  ["n2", 8328994, 8329496],
  ["n3", 8330450, 8330638],
  ["n4", 8331280, 8331425],
  ["acp_stream_manager_headerValue", 8332311, 8332436],
  ["isObject", 8332436, 8332510],
  ["describeAcpMessage", 8332510, 8333119],
  ["isJsonRpcRequest", 8333119, 8333213],
  ["isJsonRpcResponseOrError", 8333213, 8333328],
  ["isInitializeRequest", 8333328, 8333407],
  ["isPromptRequest", 8333407, 8333486],
  ["isCancelNotification", 8333486, 8333570],
  ["safeJsonStringify", 8333570, 8333743],
  ["n6", 8333743, 8356452],
  ["n7", 8357621, 8360642],
  ["isLoopbackAddress", 8361349, 8361765],
  ["isLoopbackIpv4", 8361765, 8361940],
  ["isLoopbackIpv6", 8361940, 8362083],
  ["expandIpv6", 8362083, 8362605],
  ["hexMappedToIpv4", 8362605, 8362850],
  ["ig", 8363402, 8363441],
  ["acp_security_middleware_headerValue", 8363441, 8363571],
  ["ih", 8363571, 8366140],
] as const;
export const ACP_CONNECTION_MODULE_BINDINGS = [
  ["n1", 92537],
  ["n8", 57075],
  ["nE", 47005],
  ["nI", 77598],
  ["r6", 80699],
  ["r8", 22618],
  ["r9", 92735],
] as const;
export const ACP_CONNECTION_CONTROLLER = [
  "api/v1/acp",
  8282151,
  8282182,
] as const;
export const ACP_CONNECTION_ROUTES = [
  ["GET", "", "get", 8280950, 8280962],
  ["POST", "/connect", "connect", 8281236, 8281259],
  ["POST", "", "post", 8281537, 8281550],
  ["DELETE", "", "delete", 8281856, 8281871],
] as const;
export function createNativeAcpConnections(runtime: any = {}) {
  const process: any = {
      env: runtime.env ?? {},
      stdin: runtime.stdin,
      stdout: runtime.stdout,
    },
    Date: any = runtime.Date ?? globalThis.Date;
  const ReadableStream = runtime.ReadableStream ?? globalThis.ReadableStream,
    WritableStream = runtime.WritableStream ?? globalThis.WritableStream;
  const setTimeout = runtime.setTimeout ?? globalThis.setTimeout,
    clearTimeout = runtime.clearTimeout ?? globalThis.clearTimeout,
    setInterval = runtime.setInterval ?? globalThis.setInterval,
    clearInterval = runtime.clearInterval ?? globalThis.clearInterval;
  const ec: any = (id: number) =>
    runtime.modules?.[id] ??
    runtime.getModule?.(id) ??
    new Proxy(
      {},
      {
        get(_target, key) {
          throw Error(
            "Explicit ACP connection dependency required: " +
              id +
              "." +
              String(key),
          );
        },
      },
    );
  const n1 = ec(92537);
  const n8 = ec(57075);
  const nE = ec(47005);
  const nI = ec(77598);
  const r6 = ec(80699);
  const r8 = ec(22618);
  const r9 = ec(92735);
  var eG;
  let r7 = class {
    constructor() {
      this.agents = new Map();
    }
    init() {
      this.logger.setContext("AcpAgentManager");
    }
    register(eA, el) {
      (this.agents.set(eA, el), this.logger.info(`Agent registered: ${eA}`));
    }
    get(eA) {
      return this.agents.get(eA);
    }
    getAll() {
      return new Map(this.agents);
    }
    async remove(eA) {
      if (this.agents.delete(eA)) {
        this.logger.info(`Agent removed: ${eA}`);
        try {
          let eA = r6.ContainerUtil.get(r8.DelegateToolManager);
          (await eA.clearTools(), eA.clearConnection());
        } catch (el) {
          this.logger.warn(
            `Failed to clean up DelegateToolManager for ${eA}: ${el}`,
          );
        }
      }
    }
    clear() {
      let eA = this.agents.size;
      (this.agents.clear(), this.logger.info(`Cleared ${eA} agents`));
    }
  };
  let nC = class {
    constructor() {
      ((this.running = !1), (this.transportSubscribed = !1));
    }
    async setServer(eA) {
      this.running
        ? this.logger.info?.(
            "[ACP Server] Already running, skip auto-start from ServerAware",
          )
        : (this.logger.info?.(
            "[ACP Server] HTTP Server ready, auto-starting streamable-http mode",
          ),
          await this.start({ transport: "streamable-http" }));
    }
    async start(eA) {
      (this.acpContext.setAcpMode(!0), (this.running = !0));
      let el = eA?.cliOptions?.acpTransport ?? eA?.transport ?? "stdio";
      (this.transportSubscribed ||
        ((this.transportSubscribed = !0),
        this.transportManager.transportCreated.subscribe(
          async ({ connectionId: eA, transport: el }) => {
            this.logger.info?.(
              `[ACP Server] Creating AgentSideConnection for connectionId=${eA}`,
            );
            let ec = r6.ContainerUtil.get(r8.AcpAgent);
            (new r8.AgentSideConnection(
              (el) => (
                this.logger.info?.(
                  `[ACP Server] Setting connection on agent, connectionId=${eA}`,
                ),
                ec.setConnection(el, eA),
                ec
              ),
              el.stream,
            ).closed
              .then(async () => {
                this.logger.info?.(
                  `[ACP Server] AgentSideConnection closed for connectionId=${eA}`,
                );
                try {
                  let el = this.sessionManager.sessionSubject?.value;
                  el &&
                    el.meta?.acpConnectionId === eA &&
                    (this.logger.info?.(
                      `[ACP Server] Flushing pending history for session=${el.id}`,
                    ),
                    await this.sessionManager.flushHistory(el));
                } catch (eA) {
                  this.logger.warn?.(
                    `[ACP Server] Failed to flush history on connection close: ${eA.message}`,
                  );
                }
                this.agentManager.remove(eA).catch((el) => {
                  this.logger.error?.(
                    `[ACP Server] Failed to clean up connection ${eA}: ${el.message}`,
                  );
                });
              })
              .catch((el) => {
                (this.logger.error?.(
                  `[ACP Server] AgentSideConnection error for connectionId=${eA}: ${el.message}`,
                ),
                  this.agentManager.remove(eA).catch((el) => {
                    this.logger.error?.(
                      `[ACP Server] Failed to clean up connection ${eA} after error: ${el.message}`,
                    );
                  }));
              }),
              this.agentManager.register(eA, ec),
              this.logger.info?.(
                `[ACP Server] Agent registered for connectionId=${eA}`,
              ));
          },
        )),
        "stdio" === el &&
          (await this.transportManager.create("stdio-main", "stdio")));
    }
    async stop() {
      ((this.running = !1),
        this.acpContext.setAcpMode(!1),
        this.agentManager.clear());
    }
    isRunning() {
      return this.running;
    }
  };
  let ny = class {
    constructor() {
      this.acpMode = !1;
    }
    isAcpMode() {
      return this.acpMode;
    }
    setAcpMode(eA) {
      this.acpMode = eA;
    }
  };
  function headerValue(eA, el) {
    let ec = eA[el.toLowerCase()];
    if (ec) return Array.isArray(ec) ? ec[ec.length - 1] : ec;
  }
  let nQ = class {
    async get() {
      let eA,
        el = nE.Context.getCurrent();
      if (!this.acpContext.isAcpMode()) {
        ((el.response.statusCode = 404), el.response.end());
        return;
      }
      nE.Context.setSkipAutoEnd(!0);
      let ec = headerValue(el.request.headers, "acp-connection-id"),
        eu = ec && this.streamManager.getConnectionId(ec),
        ed = eu ? ec : (0, nI.randomUUID)();
      if (
        (eu || (eA = this.connectionGuard?.issueToken(ed)),
        !eu && this.connectionGuard && !eA)
      ) {
        ((el.response.statusCode = 503),
          el.response.setHeader("Content-Type", "application/json"),
          el.response.end(
            JSON.stringify({
              jsonrpc: "2.0",
              error: {
                code: -32e3,
                message: `Connection limit reached (max ${this.connectionGuard.getMaxConnections()})`,
              },
              id: null,
            }),
          ),
          this.auditLog?.log("connection.limit_reached", {
            remoteAddress: el.request.socket?.remoteAddress,
          }));
        return;
      }
      (eA && el.response.setHeader("acp-session-token", eA),
        eu ||
          (this.auditLog?.log("connection.open", {
            connectionId: ed,
            remoteAddress: el.request.socket?.remoteAddress,
          }),
          await this.transportManager.create(ed, "streamable-http")),
        await this.streamManager.handleRequest(ed, el.request, el.response));
    }
    async connect() {
      let eA = nE.Context.getCurrent();
      if (!this.acpContext.isAcpMode()) {
        ((eA.response.statusCode = 404), eA.response.end());
        return;
      }
      let el = (0, nI.randomUUID)(),
        ec = this.connectionGuard?.issueToken(el);
      if (this.connectionGuard && !ec) {
        ((eA.response.statusCode = 503),
          eA.response.setHeader("Content-Type", "application/json"),
          eA.response.end(
            JSON.stringify({
              error: `Connection limit reached (max ${this.connectionGuard.getMaxConnections()})`,
            }),
          ));
        return;
      }
      (this.auditLog?.log("connection.open", {
        connectionId: el,
        remoteAddress: eA.request.socket?.remoteAddress,
      }),
        await this.transportManager.create(el, "streamable-http"),
        this.streamManager.ensureConnectionState(el),
        eA.response.setHeader("Content-Type", "application/json"),
        eA.response.end(
          JSON.stringify({ connectionId: el, sessionToken: ec }),
        ));
    }
    async post(eA) {
      let el = nE.Context.getCurrent();
      if (!this.acpContext.isAcpMode()) {
        ((el.response.statusCode = 404), el.response.end());
        return;
      }
      let ec = headerValue(el.request.headers, "acp-connection-id");
      if (!ec) {
        ((el.response.statusCode = 400),
          el.response.end(
            JSON.stringify({
              jsonrpc: "2.0",
              error: {
                code: -32e3,
                message: "Missing acp-connection-id header",
              },
              id: null,
            }),
          ));
        return;
      }
      (nE.Context.setSkipAutoEnd(!0),
        await this.streamManager.handleRequest(
          ec,
          el.request,
          el.response,
          eA,
        ));
    }
    async delete() {
      let eA = nE.Context.getCurrent();
      if (!this.acpContext.isAcpMode()) {
        ((eA.response.statusCode = 404), eA.response.end());
        return;
      }
      let el = headerValue(eA.request.headers, "acp-connection-id");
      if (!el) {
        ((eA.response.statusCode = 400),
          eA.response.end(
            JSON.stringify({
              jsonrpc: "2.0",
              error: {
                code: -32e3,
                message: "Missing acp-connection-id header",
              },
              id: null,
            }),
          ));
        return;
      }
      (this.connectionGuard?.revokeToken(el),
        this.auditLog?.log("connection.close", {
          connectionId: el,
          remoteAddress: eA.request.socket?.remoteAddress,
        }),
        await this.transportManager.close(el),
        await this.streamManager.handleRequest(el, eA.request, eA.response));
    }
  };
  let n2 = class {
    constructor() {
      ((this.transports = new Map()),
        (this.transportCreated = new n1.Subject()));
    }
    async create(eA, el) {
      if (this.transports.has(eA))
        throw Error(`Transport with connectionId ${eA} already exists`);
      let ec = await this.factory.create(eA, el);
      return (
        this.transports.set(eA, ec),
        this.transportCreated.next({ connectionId: eA, transport: ec }),
        ec
      );
    }
    get(eA) {
      return this.transports.get(eA);
    }
    async close(eA) {
      let el = this.transports.get(eA);
      (el && (await el.close(), this.transports.delete(eA)),
        this.streamManager.close(eA));
    }
  };
  let n3 = class {
    init() {}
    setStream(eA) {
      this._stream = eA;
    }
    setConnectionId(eA) {
      this._connectionId = eA;
    }
    get connectionId() {
      return this._connectionId;
    }
    get stream() {
      return this._stream;
    }
    async close() {}
  };
  let n4 = class {
    async create(eA, el) {
      let ec = this.streamManager.create(eA, el),
        eu = new n3();
      return (eu.init(), eu.setStream(ec), eu.setConnectionId(eA), eu);
    }
  };
  function acp_stream_manager_headerValue(eA, el) {
    let ec = eA[el.toLowerCase()];
    if (ec) return Array.isArray(ec) ? ec[ec.length - 1] : ec;
  }
  function isObject(eA) {
    return !!eA && "object" == typeof eA && !Array.isArray(eA);
  }
  function describeAcpMessage(eA) {
    if (!isObject(eA)) return `type=${typeof eA}`;
    let el = eA,
      ec = isObject(el.params) ? el.params : void 0,
      eu = isObject(ec?.update) ? ec.update : void 0,
      ed = isObject(eu?.content) ? eu.content : void 0,
      ep = "string" == typeof ed?.text ? ed.text.length : void 0,
      eg = "string" == typeof el.method ? el.method : "response",
      eh = "string" == typeof ec?.sessionId ? ec.sessionId : void 0,
      ef = "string" == typeof eu?.sessionUpdate ? eu.sessionUpdate : void 0;
    return [
      `type=${eg}`,
      void 0 !== el.id ? `id=${String(el.id)}` : void 0,
      eh ? `sessionId=${eh}` : void 0,
      ef ? `update=${ef}` : void 0,
      void 0 !== ep ? `textLength=${ep}` : void 0,
    ]
      .filter(Boolean)
      .join(" ");
  }
  function isJsonRpcRequest(eA) {
    return isObject(eA) && "string" == typeof eA.method && void 0 !== eA.id;
  }
  function isJsonRpcResponseOrError(eA) {
    return (
      isObject(eA) &&
      void 0 !== eA.id &&
      (void 0 !== eA.result || void 0 !== eA.error)
    );
  }
  function isInitializeRequest(eA) {
    return isObject(eA) && "initialize" === eA.method;
  }
  function isPromptRequest(eA) {
    return isObject(eA) && "session/prompt" === eA.method;
  }
  function isCancelNotification(eA) {
    return isObject(eA) && "session/cancel" === eA.method;
  }
  function safeJsonStringify(eA) {
    try {
      return JSON.stringify(eA);
    } catch {
      return JSON.stringify({
        jsonrpc: "2.0",
        error: { code: -32e3, message: "Failed to serialize response" },
        id: null,
      });
    }
  }
  let n6 = (eG = class {
    constructor() {
      ((this.streams = new Map()),
        (this.connectionStates = new Map()),
        (this.writableControllers = new Map()),
        (this.promptTimeouts = new Map()),
        (this.streamIdToSessionId = new Map()),
        (this.pausedPromptStreams = new Set()),
        (this.heartbeatTimers = new Map()),
        (this.postHeartbeatTimers = new Map()),
        (this.streamCloseTimers = new Map()),
        (this.cancellationSweepTimers = new Map()));
    }
    get logger() {
      return r6.ContainerUtil.get(r9.Logger);
    }
    create(eA, el) {
      if ("stdio" === el) {
        let el = n8.Writable.toWeb(process.stdout),
          ec = n8.Readable.toWeb(process.stdin),
          eu = (0, r8.ndJsonStream)(el, ec);
        return (this.streams.set(eA, eu), eu);
      }
      let ec = {
        initialized: !1,
        inFlightPrompts: new Set(),
        streamMapping: new Map(),
        requestToStreamMapping: new Map(),
        requestResponseMap: new Map(),
      };
      this.connectionStates.set(eA, ec);
      let eu = {
        readable: new ReadableStream({
          start: (eA) => {
            ec.incomingController = eA;
          },
        }),
        writable: new WritableStream({
          write: async (el) => {
            (this.logger.debug?.(
              `[ACP StreamManager] outgoingWritable.write ${describeAcpMessage(el)}`,
            ),
              await this.sendToClient(eA, el));
          },
        }),
      };
      return (this.streams.set(eA, eu), eu);
    }
    get(eA) {
      return this.streams.get(eA);
    }
    close(eA) {
      this.stopHeartbeat(eA);
      let el = this.connectionStates.get(eA);
      if (el) {
        for (let eA of el.inFlightPrompts)
          (this.clearPromptTimeout(eA),
            this.pausedPromptStreams.delete(eA),
            this.streamIdToSessionId.delete(eA),
            this.clearCancellationSweepTimer(eA));
        for (let [eA] of (el.inFlightPrompts.clear(), el.streamMapping))
          (this.clearStreamCloseTimer(eA),
            this.stopPostHeartbeat(eA),
            this.streamIdToSessionId.delete(eA),
            this.clearCancellationSweepTimer(eA));
        for (let eA of el.streamMapping.values())
          try {
            eA.end();
          } catch {}
        if (
          (el.streamMapping.clear(),
          el.requestToStreamMapping.clear(),
          el.requestResponseMap.clear(),
          el.standaloneSse && !el.standaloneSse.writableEnded)
        )
          try {
            el.standaloneSse.end();
          } catch {}
        this.connectionStates.delete(eA);
      }
      (this.streams.delete(eA), this.writableControllers.delete(eA));
      try {
        let el = r6.ContainerUtil.get(r8.AcpAgentManager);
        el && el.remove(eA).catch((eA) => {});
      } catch {}
      try {
        r6.ContainerUtil.get(r8.AcpConnectionGuard)?.revokeToken(eA);
      } catch {}
    }
    getConnectionId(eA) {
      return this.connectionStates.get(eA) ? eA : void 0;
    }
    isConnectionAlive(eA) {
      let el = this.connectionStates.get(eA);
      if (!el) return !1;
      let ec = el.standaloneSse;
      return !!ec && !ec.writableEnded;
    }
    hasInFlightPrompt(eA) {
      let el = this.connectionStates.get(eA);
      return !!el && el.inFlightPrompts.size > 0;
    }
    ensureConnectionState(eA) {
      this.connectionStates.has(eA) ||
        this.connectionStates.set(eA, {
          initialized: !1,
          inFlightPrompts: new Set(),
          streamMapping: new Map(),
          requestToStreamMapping: new Map(),
          requestResponseMap: new Map(),
        });
    }
    async handleRequest(eA, el, ec, eu) {
      try {
        switch (el.method) {
          case "GET":
            await this.handleGet(eA, el, ec);
            return;
          case "POST":
            await this.handlePost(eA, el, ec, eu);
            return;
          case "DELETE":
            await this.handleDelete(eA, el, ec);
            return;
          default:
            (ec.writeHead(405, { Allow: "GET, POST, DELETE" }), ec.end());
            return;
        }
      } catch (eA) {
        (this.logger.warn?.(
          `ACP streamable-http handleRequest error: ${String(eA)}`,
        ),
          ec.headersSent || (ec.statusCode = 500),
          ec.writableEnded || ec.end("Internal Server Error"));
      }
    }
    async handleGet(eA, el, ec) {
      let eu = acp_stream_manager_headerValue(el.headers, "accept");
      if (!eu?.includes("text/event-stream")) {
        (ec.writeHead(406),
          ec.end(
            safeJsonStringify({
              jsonrpc: "2.0",
              error: {
                code: -32e3,
                message: "Not Acceptable: Client must accept text/event-stream",
              },
              id: null,
            }),
          ));
        return;
      }
      let ed = this.connectionStates.get(eA);
      if (ed?.standaloneSse && !ed.standaloneSse.writableEnded) {
        (ec.writeHead(409),
          ec.end(
            safeJsonStringify({
              jsonrpc: "2.0",
              error: {
                code: -32e3,
                message:
                  "Another ACP client is already connected. Only one client connection is allowed at a time. Please close the existing connection first.",
              },
              id: null,
            }),
          ));
        return;
      }
      (ed ||
        ((ed = {
          initialized: !1,
          inFlightPrompts: new Set(),
          streamMapping: new Map(),
          requestToStreamMapping: new Map(),
          requestResponseMap: new Map(),
        }),
        this.connectionStates.set(eA, ed)),
        ec.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
          "X-Accel-Buffering": "no",
          "acp-connection-id": eA,
        }),
        ec.flushHeaders?.(),
        ec.socket?.setNoDelay?.(!0),
        ec.write(":ok\n\n"),
        (ed.standaloneSse = ec),
        this.stopHeartbeat(eA));
      let ep = setInterval(() => {
        if (!ec.writableEnded)
          try {
            (ec.write(": heartbeat\n\n"), ec.flush?.());
          } catch {}
      }, eG.SSE_HEARTBEAT_INTERVAL_MS);
      (ep.unref && ep.unref(),
        this.heartbeatTimers.set(eA, ep),
        ec.on("close", () => {
          (this.stopHeartbeat(eA),
            ed.standaloneSse === ec && (ed.standaloneSse = void 0));
        }),
        ec.on("error", (el) => {
          (this.logger.warn?.(`ACP standalone SSE error: ${String(el)}`),
            this.stopHeartbeat(eA),
            ed.standaloneSse === ec && (ed.standaloneSse = void 0));
        }));
    }
    async handlePost(eA, el, ec, eu) {
      let ed = this.connectionStates.get(eA);
      if (!ed) {
        (ec.writeHead(409),
          ec.end(
            safeJsonStringify({
              jsonrpc: "2.0",
              error: {
                code: -32e3,
                message:
                  "Connection not found. Please establish a connection first via POST /acp/connect before sending requests.",
              },
              id: null,
            }),
          ));
        return;
      }
      let ep = acp_stream_manager_headerValue(el.headers, "accept");
      if (
        !ep?.includes("application/json") ||
        !ep.includes("text/event-stream")
      ) {
        (ec.writeHead(406),
          ec.end(
            safeJsonStringify({
              jsonrpc: "2.0",
              error: {
                code: -32e3,
                message:
                  "Not Acceptable: Client must accept both application/json and text/event-stream",
              },
              id: null,
            }),
          ));
        return;
      }
      let eg = acp_stream_manager_headerValue(el.headers, "content-type");
      if (!eg?.includes("application/json")) {
        (ec.writeHead(415),
          ec.end(
            safeJsonStringify({
              jsonrpc: "2.0",
              error: {
                code: -32e3,
                message:
                  "Unsupported Media Type: Content-Type must be application/json",
              },
              id: null,
            }),
          ));
        return;
      }
      let eh = acp_stream_manager_headerValue(el.headers, "acp-connection-id");
      if (!eh || eh !== eA) {
        (ec.writeHead(404),
          ec.end(
            safeJsonStringify({
              jsonrpc: "2.0",
              error: { code: -32001, message: "ACP connection not found" },
              id: null,
            }),
          ));
        return;
      }
      let ef = eu,
        em = Array.isArray(ef) ? ef : [ef];
      if (em.some(isInitializeRequest)) {
        if (ed.initialized) {
          (ec.writeHead(400),
            ec.end(
              safeJsonStringify({
                jsonrpc: "2.0",
                error: {
                  code: -32600,
                  message: "Invalid Request: Server already initialized",
                },
                id: null,
              }),
            ));
          return;
        }
        if (1 !== em.length) {
          (ec.writeHead(400),
            ec.end(
              safeJsonStringify({
                jsonrpc: "2.0",
                error: {
                  code: -32600,
                  message:
                    "Invalid Request: Only one initialize request is allowed",
                },
                id: null,
              }),
            ));
          return;
        }
        ed.initialized = !0;
      } else if (!ed.initialized) {
        (ec.writeHead(400),
          ec.end(
            safeJsonStringify({
              jsonrpc: "2.0",
              error: {
                code: -32e3,
                message: "Bad Request: Server not initialized",
              },
              id: null,
            }),
          ));
        return;
      }
      let eE = em.some(isJsonRpcRequest);
      if (
        (em.some(isCancelNotification) &&
          (this.logger.info?.(
            "[ACP StreamManager] handlePost: Received cancel notification, clearing in-flight prompts",
          ),
          this.cancelAllInFlightPrompts(eA)),
        this.resumeIdleTimerOnClientActivity(eA, ed),
        !eE)
      ) {
        (ec.writeHead(202), ec.end(), this.enqueueIncoming(eA, em));
        return;
      }
      let eC = em.some(isPromptRequest);
      (this.logger.info?.(
        `[ACP StreamManager] handlePost: hasPrompt=${eC}, inFlightPromptCount=${ed.inFlightPrompts.size}, messages=${em.map((eA) => eA.method || "response").join(",")}`,
      ),
        eC &&
          ed.inFlightPrompts.size > 0 &&
          this.logger.info?.(
            `[ACP StreamManager] handlePost: Queuing prompt - ${ed.inFlightPrompts.size} prompt(s) already in progress`,
          ));
      let ey = (0, nI.randomUUID)();
      for (let el of (this.logger.info?.(
        `[ACP StreamManager] handlePost: Creating stream ${ey} for requests`,
      ),
      ec.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
        "acp-connection-id": eA,
      }),
      ec.flushHeaders?.(),
      ec.socket?.setNoDelay?.(!0),
      ec.write(":ok\n\n"),
      ed.streamMapping.set(ey, ec),
      this.startPostHeartbeat(eA, ed, ey, ec),
      em))
        isJsonRpcRequest(el) &&
          (ed.requestToStreamMapping.set(el.id, ey),
          this.logger.info?.(
            `[ACP StreamManager] handlePost: Mapped request id=${el.id} (method=${el.method}) to stream ${ey}`,
          ));
      if (
        (this.logger.info?.(
          `[ACP StreamManager] handlePost: After mapping, requestToStreamMapping keys=[${Array.from(ed.requestToStreamMapping.keys()).join(",")}]`,
        ),
        eC)
      ) {
        ed.inFlightPrompts.add(ey);
        let el = em.find(isPromptRequest),
          ec =
            "string" == typeof el?.params?.sessionId
              ? el.params.sessionId
              : void 0;
        (ec && this.streamIdToSessionId.set(ey, ec),
          this.schedulePromptTimeout(eA, ey));
      }
      (ec.on("close", () => {
        (this.logger.info?.(
          `[ACP StreamManager] handlePost: Stream ${ey} closed`,
        ),
          this.stopPostHeartbeat(ey),
          ed.streamMapping.delete(ey),
          this.clearInFlightPrompt(ed, ey),
          this.clearStreamRequestMappings(ed, ey));
      }),
        ec.on("error", (eA) => {
          (this.logger.warn?.(`ACP POST SSE error: ${String(eA)}`),
            this.stopPostHeartbeat(ey),
            ed.streamMapping.delete(ey),
            this.clearInFlightPrompt(ed, ey),
            this.clearStreamRequestMappings(ed, ey));
        }),
        this.enqueueIncoming(eA, em));
    }
    async handleDelete(eA, el, ec) {
      let eu = acp_stream_manager_headerValue(el.headers, "acp-connection-id");
      if (!eu || eu !== eA) {
        (ec.writeHead(404),
          ec.end(
            safeJsonStringify({
              jsonrpc: "2.0",
              error: { code: -32001, message: "ACP connection not found" },
              id: null,
            }),
          ));
        return;
      }
      (this.close(eA), ec.writeHead(200), ec.end());
    }
    enqueueIncoming(eA, el) {
      let ec = this.connectionStates.get(eA);
      if (ec?.incomingController)
        for (let eA of el) ec.incomingController.enqueue(eA);
    }
    async sendToClient(eA, el) {
      this.logger.debug?.(
        `[ACP StreamManager] sendToClient: START, connectionId=${eA}, messageType=${el.method || "response"}, messageId=${el.id}`,
      );
      let ec = this.connectionStates.get(eA);
      if (!ec)
        return void this.logger.warn?.(
          `[ACP StreamManager] sendToClient: No state found for connectionId=${eA}`,
        );
      if (
        (this.logger.debug?.(
          `[ACP StreamManager] sendToClient: state found, standaloneSse=${!!ec.standaloneSse}, streamMapping.size=${ec.streamMapping.size}, requestToStreamMapping.size=${ec.requestToStreamMapping.size}`,
        ),
        !isJsonRpcResponseOrError(el))
      ) {
        let eu = "method" in el && "id" in el && null != el.id,
          ed = this.getActivePostStream(ec);
        if (ed && !ed.writableEnded)
          return (this.logger.debug?.(
            `[ACP StreamManager] sendToClient: Sending ${eu ? "request" : "notification"} via active POST stream: ${el.method}`,
          ),
          await this.writeSseEvent(ed, el))
            ? (eu
                ? this.pauseIdleTimerForAwaitingClient(ec, ed)
                : this.renewPromptActivity(ec, ed),
              void (eu || this.flushDelayedStreamClose(ec, ed)))
            : void this.logger.error?.(
                `[ACP StreamManager] sendToClient: failed to deliver ${eu ? "server request" : "notification"} ${el.method} via active POST stream (connection ${eA})`,
              );
        this.logger.debug?.(
          `[ACP StreamManager] sendToClient: Sending notification via standalone SSE: ${el.method}`,
        );
        let ep = ec.standaloneSse;
        return !ep || ep.writableEnded
          ? void this.logger.warn?.(
              "[ACP StreamManager] sendToClient: Standalone SSE is closed, cannot send notification",
            )
          : void (
              (await this.writeSseEvent(ep, el)) ||
              this.logger.error?.(
                `[ACP StreamManager] sendToClient: failed to deliver notification via standalone SSE: ${el.method}`,
              )
            );
      }
      let eu = el.id;
      (this.logger.info?.(
        `[ACP StreamManager] sendToClient: Sending response for request ${eu}`,
      ),
        this.logger.info?.(
          `[ACP StreamManager] sendToClient: requestToStreamMapping size=${ec.requestToStreamMapping.size}, keys=[${Array.from(ec.requestToStreamMapping.keys()).join(",")}]`,
        ));
      let ed = ec.requestToStreamMapping.get(eu);
      if (!ed) {
        this.logger.warn?.(
          `[ACP StreamManager] sendToClient: No stream ID found for request ${eu}, falling back to standalone SSE`,
        );
        let eA = ec.standaloneSse;
        if (
          (eA &&
            !eA.writableEnded &&
            ((await this.writeSseEvent(eA, el)) ||
              this.logger.error?.(
                `[ACP StreamManager] sendToClient: fallback standalone SSE delivery failed for request ${eu}`,
              )),
          ec.inFlightPrompts.size > 0)
        ) {
          for (let eA of (this.logger.warn?.(
            `[ACP StreamManager] sendToClient: Clearing ${ec.inFlightPrompts.size} orphaned inFlightPrompts due to missing stream mapping`,
          ),
          ec.inFlightPrompts))
            (this.clearPromptTimeout(eA),
              this.pausedPromptStreams.delete(eA),
              this.clearCancellationSweepTimer(eA));
          ec.inFlightPrompts.clear();
        }
        return;
      }
      this.logger.info?.(
        `[ACP StreamManager] sendToClient: Found stream ${ed} for request ${eu}`,
      );
      let ep = ec.streamMapping.get(ed);
      this.logger.info?.(
        `[ACP StreamManager] sendToClient: stream exists=${!!ep}, writableEnded=${ep?.writableEnded}`,
      );
      let eg = ec.inFlightPrompts.has(ed);
      if (!ep || ep.writableEnded) {
        (this.logger.error?.(
          `[ACP StreamManager] sendToClient: cannot deliver response for request ${eu} — stream ${ed} is ${!ep ? "missing" : "ended"} (connection ${eA}). ${eg ? "Mapping retained for prompt sweep." : "Cleaning stale mapping immediately."}`,
        ),
          eg ||
            (ec.requestToStreamMapping.delete(eu),
            ec.requestResponseMap.delete(eu)));
        return;
      }
      if (
        (this.logger.info?.(
          `[ACP StreamManager] sendToClient: Writing SSE event to stream ${ed}`,
        ),
        !(await this.writeSseEvent(ep, el)))
      ) {
        (this.logger.error?.(
          `[ACP StreamManager] sendToClient: writeSseEvent reported no delivery for request ${eu} on stream ${ed} (connection ${eA}). ${eg ? "Mapping retained for prompt sweep." : "Cleaning stale mapping immediately."}`,
        ),
          eg ||
            (ec.requestToStreamMapping.delete(eu),
            ec.requestResponseMap.delete(eu)));
        return;
      }
      (this.logger.info?.(
        "[ACP StreamManager] sendToClient: SSE event written successfully",
      ),
        ec.requestResponseMap.set(eu, el));
      let eh = Array.from(ec.requestToStreamMapping.entries())
        .filter(([eA, el]) => el === ed)
        .map(([eA]) => eA);
      if (eh.every((eA) => ec.requestResponseMap.has(eA))) {
        for (let eA of eh)
          (ec.requestResponseMap.delete(eA),
            ec.requestToStreamMapping.delete(eA));
        (this.clearCancellationSweepTimer(ed),
          this.scheduleStreamClose(eA, ec, ed, ep));
      }
    }
    getActivePostStream(eA) {
      for (let el of eA.inFlightPrompts) {
        let ec = eA.streamMapping.get(el);
        if (ec && !ec.writableEnded) return ec;
      }
      for (let el of eA.streamMapping.values())
        if (el && !el.writableEnded) return el;
    }
    async writeSseEvent(eA, el) {
      if (eA.writableEnded || eA.destroyed)
        return (
          this.logger.warn?.(
            "[ACP StreamManager] writeSseEvent: stream already closed/destroyed, skipping write",
          ),
          !1
        );
      let ec = `event: message
data: ${safeJsonStringify(el)}

`;
      return new Promise((el) => {
        let eu,
          ed = !1,
          finish = (ec) => {
            ed ||
              ((ed = !0),
              eA.off("drain", onDrain),
              eA.off("close", onClosed),
              eA.off("error", onError),
              el(ec));
          },
          onDrain = () => finish(!0),
          onClosed = () => finish(!1),
          onError = () => finish(!1);
        (eA.once("close", onClosed), eA.once("error", onError));
        try {
          eu = eA.write(ec);
        } catch (eA) {
          (this.logger.warn?.(
            `[ACP StreamManager] writeSseEvent: synchronous write threw: ${String(eA)}`,
          ),
            finish(!1));
          return;
        }
        if (!ed) {
          eu || eA.once("drain", onDrain);
          try {
            eA.flush?.();
          } catch (eA) {
            (this.logger.warn?.(
              `[ACP StreamManager] writeSseEvent: flush threw: ${String(eA)}`,
            ),
              finish(!1));
            return;
          }
          eu ? finish(!0) : (eA.destroyed || eA.writableEnded) && finish(!1);
        }
      });
    }
    clearInFlightPrompt(eA, el) {
      (eA.inFlightPrompts.delete(el) && this.clearPromptTimeout(el),
        this.pausedPromptStreams.delete(el),
        this.streamIdToSessionId.delete(el),
        this.clearCancellationSweepTimer(el));
    }
    clearStreamRequestMappings(eA, el) {
      for (let [ec, eu] of eA.requestToStreamMapping.entries())
        eu === el &&
          (eA.requestToStreamMapping.delete(ec),
          eA.requestResponseMap.delete(ec));
    }
    scheduleStreamClose(eA, el, ec, eu) {
      this.logger.info?.(
        `[ACP StreamManager] scheduleStreamClose: Scheduling delayed close for stream ${ec} (${eG.STREAM_CLOSE_DELAY_MS}ms)`,
      );
      let ed = setTimeout(() => {
        (this.streamCloseTimers.delete(ec),
          this.logger.info?.(
            `[ACP StreamManager] scheduleStreamClose: Delayed close timer fired for stream ${ec}`,
          ),
          eu && !eu.writableEnded && eu.end(),
          this.stopPostHeartbeat(ec),
          el.streamMapping.delete(ec),
          this.clearInFlightPrompt(el, ec));
      }, eG.STREAM_CLOSE_DELAY_MS);
      (ed.unref && ed.unref(), this.streamCloseTimers.set(ec, ed));
    }
    flushDelayedStreamClose(eA, el) {
      for (let [ec, eu] of eA.streamMapping)
        if (eu === el && this.streamCloseTimers.has(ec)) {
          (this.logger.info?.(
            `[ACP StreamManager] flushDelayedStreamClose: Flushing delayed close for stream ${ec}`,
          ),
            this.clearStreamCloseTimer(ec),
            el.writableEnded || el.end(),
            this.stopPostHeartbeat(ec),
            eA.streamMapping.delete(ec),
            this.clearInFlightPrompt(eA, ec));
          break;
        }
    }
    clearStreamCloseTimer(eA) {
      let el = this.streamCloseTimers.get(eA);
      el && (clearTimeout(el), this.streamCloseTimers.delete(eA));
    }
    schedulePromptTimeout(eA, el) {
      this.clearPromptTimeout(el);
      let ec = setTimeout(() => {
        this.promptTimeouts.delete(el);
        let ec = this.connectionStates.get(eA);
        if (ec && ec.inFlightPrompts.has(el)) {
          this.logger.warn?.(
            `[ACP StreamManager] Prompt idle timeout: auto-clearing stale inFlightPrompt ${el} for connection ${eA} (no session/update for ${eG.PROMPT_TIMEOUT_MS}ms)`,
          );
          try {
            this.reclaimPrompt(eA, el, ec);
          } catch (eA) {
            this.logger.error?.(
              `[ACP StreamManager][reclaim] unexpected error: ${eA instanceof Error ? eA.message : String(eA)}`,
            );
          }
          ec.inFlightPrompts.delete(el);
          let eu = ec.streamMapping.get(el);
          if (eu && !eu.writableEnded)
            try {
              eu.end();
            } catch {}
          for (let [eA, eu] of (ec.streamMapping.delete(el),
          ec.requestToStreamMapping.entries()))
            eu === el &&
              (ec.requestToStreamMapping.delete(eA),
              ec.requestResponseMap.delete(eA));
          (this.streamIdToSessionId.delete(el),
            this.sweepOrphanedPromptResponse(
              eA,
              el,
              eG.SWEEP_KIND_TIMEOUT,
            ).catch((eA) => {
              this.logger.error?.(
                `[ACP StreamManager] idle-timeout sweep threw unexpectedly for stream ${el}: ${String(eA)}`,
              );
            }));
        }
      }, eG.PROMPT_TIMEOUT_MS);
      (ec.unref && ec.unref(), this.promptTimeouts.set(el, ec));
    }
    reclaimPrompt(eA, el, ec) {
      this.logger.info?.(
        `[ACP StreamManager][reclaim] start, streamId=${el}, connectionId=${eA}`,
      );
      let eu = this.resolveSessionIdForStream(el),
        ed = [];
      for (let [eA, eu] of ec.requestToStreamMapping.entries())
        eu === el && ed.push(eA);
      let ep = 0,
        eg = ec.streamMapping.get(el);
      if (eg && !eg.writableEnded)
        for (let eA of ed) {
          let ec = {
            jsonrpc: "2.0",
            id: eA,
            error: {
              code: -32800,
              message: "Prompt aborted due to idle timeout",
              data: { reason: "prompt_timeout", streamId: el },
            },
          };
          try {
            (this.writeJsonRpcErrorToStream(eg, ec),
              ep++,
              this.logger.info?.(
                `[ACP StreamManager][reclaim] sent error response for requestId=${String(eA)}`,
              ));
          } catch (el) {
            this.logger.warn?.(
              `[ACP StreamManager][reclaim] failed to write error for requestId=${String(eA)}: ${String(el)}`,
            );
          }
        }
      if (eu) {
        try {
          (this.interruptionService?.cancelAllForSession(eu, "prompt_timeout"),
            this.logger.info?.(
              `[ACP StreamManager][reclaim] cancelAllForSession done, sessionId=${eu}`,
            ));
        } catch (eA) {
          this.logger.warn?.(
            `[ACP StreamManager][reclaim] cancelAllForSession failed, sessionId=${eu}, err=${String(eA)}`,
          );
        }
        let eA = this.broadcastService?.broadcastToolCallFailedForSession(
          eu,
          "Prompt timed out; tool call discarded",
        );
        eA &&
          eA.catch((eA) => {
            this.logger.warn?.(
              `[ACP StreamManager][reclaim] broadcastToolCallFailedForSession failed, sessionId=${eu}, err=${String(eA)}`,
            );
          });
      } else
        this.logger.warn?.(
          `[ACP StreamManager][reclaim] unable to resolve sessionId for streamId=${el}, skipping interruption/broadcast reclaim`,
        );
      this.logger.info?.(
        `[ACP StreamManager][reclaim] done, streamId=${el}, sessionId=${eu ?? "unknown"}, pendingRequests=${ep}`,
      );
    }
    resolveSessionIdForStream(eA) {
      return this.streamIdToSessionId.get(eA);
    }
    writeJsonRpcErrorToStream(eA, el) {
      if (eA.writableEnded || eA.destroyed) return;
      let ec = `event: message
data: ${safeJsonStringify(el)}

`;
      (eA.write(ec), eA.flush?.());
    }
    renewPromptActivity(eA, el) {
      if (0 !== eA.inFlightPrompts.size) {
        for (let ec of eA.inFlightPrompts)
          if (eA.streamMapping.get(ec) === el) {
            this.pausedPromptStreams.delete(ec);
            let el = this.findConnectionIdForState(eA);
            el && this.schedulePromptTimeout(el, ec);
            return;
          }
      }
    }
    renewPromptActivityFromHeartbeat(eA, el, ec) {
      !el.inFlightPrompts.has(ec) ||
        this.pausedPromptStreams.has(ec) ||
        this.schedulePromptTimeout(eA, ec);
    }
    findConnectionIdForState(eA) {
      for (let [el, ec] of this.connectionStates) if (ec === eA) return el;
    }
    clearPromptTimeout(eA) {
      let el = this.promptTimeouts.get(eA);
      el && (clearTimeout(el), this.promptTimeouts.delete(eA));
    }
    pauseIdleTimerForAwaitingClient(eA, el) {
      if (0 !== eA.inFlightPrompts.size) {
        for (let ec of eA.inFlightPrompts)
          if (eA.streamMapping.get(ec) === el) {
            if (this.pausedPromptStreams.has(ec)) return;
            (this.clearPromptTimeout(ec),
              this.pausedPromptStreams.add(ec),
              this.logger.info?.(
                `[ACP StreamManager] Paused idle timer for prompt stream ${ec} (awaiting client response)`,
              ));
            return;
          }
      }
    }
    resumeIdleTimerOnClientActivity(eA, el) {
      if (0 !== this.pausedPromptStreams.size && 0 !== el.inFlightPrompts.size)
        for (let ec of el.inFlightPrompts)
          this.pausedPromptStreams.has(ec) &&
            (this.pausedPromptStreams.delete(ec),
            this.schedulePromptTimeout(eA, ec),
            this.logger.info?.(
              `[ACP StreamManager] Resumed idle timer for prompt stream ${ec} (client activity detected)`,
            ));
    }
    stopHeartbeat(eA) {
      let el = this.heartbeatTimers.get(eA);
      el && (clearInterval(el), this.heartbeatTimers.delete(eA));
    }
    startPostHeartbeat(eA, el, ec, eu) {
      this.stopPostHeartbeat(ec);
      let ed = setInterval(() => {
        if (!eu.writableEnded)
          try {
            (eu.write(": heartbeat\n\n"),
              eu.flush?.(),
              this.renewPromptActivityFromHeartbeat(eA, el, ec));
          } catch {}
      }, eG.SSE_HEARTBEAT_INTERVAL_MS);
      (ed.unref && ed.unref(), this.postHeartbeatTimers.set(ec, ed));
    }
    stopPostHeartbeat(eA) {
      let el = this.postHeartbeatTimers.get(eA);
      el && (clearInterval(el), this.postHeartbeatTimers.delete(eA));
    }
    cancelAllInFlightPrompts(eA) {
      let el = this.connectionStates.get(eA);
      if (el) {
        if (0 === el.inFlightPrompts.size)
          return void this.logger.info?.(
            "[ACP StreamManager] cancelAllInFlightPrompts: No in-flight prompts to cancel",
          );
        for (let ec of (this.logger.info?.(
          `[ACP StreamManager] cancelAllInFlightPrompts: Scheduling sweep for ${el.inFlightPrompts.size} in-flight prompt(s) after ${eG.CANCEL_GRACE_MS}ms grace window`,
        ),
        Array.from(el.inFlightPrompts))) {
          if (this.cancellationSweepTimers.has(ec)) continue;
          let el = setTimeout(() => {
            (this.cancellationSweepTimers.delete(ec),
              this.sweepOrphanedPromptResponse(
                eA,
                ec,
                eG.SWEEP_KIND_CANCEL,
              ).catch((eA) => {
                this.logger.error?.(
                  `[ACP StreamManager] cancel sweep threw unexpectedly for stream ${ec}: ${String(eA)}`,
                );
              }));
          }, eG.CANCEL_GRACE_MS);
          (el.unref && el.unref(), this.cancellationSweepTimers.set(ec, el));
        }
      }
    }
    clearCancellationSweepTimer(eA) {
      let el = this.cancellationSweepTimers.get(eA);
      el && (clearTimeout(el), this.cancellationSweepTimers.delete(eA));
    }
    async sweepOrphanedPromptResponse(eA, el, ec) {
      let eu = this.connectionStates.get(eA);
      if (!eu) return;
      if (!eu.inFlightPrompts.has(el))
        return void this.logger.info?.(
          `[ACP StreamManager] sweepOrphanedPromptResponse: stream ${el} already completed, skipping`,
        );
      this.logger.warn?.(
        `[ACP StreamManager] sweepOrphanedPromptResponse: agent did not respond in grace window, writing ${ec === eG.SWEEP_KIND_CANCEL ? "cancelled result" : "JSON-RPC error"} for stream ${el}`,
      );
      let ed = eu.streamMapping.get(el),
        ep = [];
      for (let [eA, ec] of eu.requestToStreamMapping.entries())
        ec === el && (eu.requestResponseMap.has(eA) || ep.push(eA));
      let buildPayload = (eA) =>
        ec === eG.SWEEP_KIND_CANCEL
          ? { jsonrpc: "2.0", id: eA, result: { stopReason: "cancelled" } }
          : {
              jsonrpc: "2.0",
              id: eA,
              error: { code: -32001, message: "Prompt idle timeout" },
            };
      try {
        if (ed && !ed.writableEnded)
          for (let eg of ep) {
            let ep = buildPayload(eg);
            (await this.writeSseEvent(ed, ep))
              ? eu.requestResponseMap.set(eg, ep)
              : this.logger.error?.(
                  `[ACP StreamManager] sweepOrphanedPromptResponse: write failed, request ${eg} will be abandoned without JSON-RPC response (connectionId=${eA}, streamId=${el}, kind=${ec})`,
                );
          }
        else
          ep.length > 0 &&
            this.logger.error?.(
              `[ACP StreamManager] sweepOrphanedPromptResponse: stream ${el} already ended, abandoning ${ep.length} request(s) without JSON-RPC response (connectionId=${eA}, requestIds=[${ep.join(",")}], kind=${ec})`,
            );
      } finally {
        if (
          (this.clearStreamCloseTimer(el),
          this.stopPostHeartbeat(el),
          ed && !ed.writableEnded)
        )
          try {
            ed.end();
          } catch {}
        (eu.streamMapping.delete(el),
          this.clearStreamRequestMappings(eu, el),
          this.clearPromptTimeout(el),
          this.pausedPromptStreams.delete(el),
          eu.inFlightPrompts.delete(el));
      }
      for (let eA of eu.inFlightPrompts)
        (this.clearPromptTimeout(eA),
          this.pausedPromptStreams.delete(eA),
          this.streamIdToSessionId.delete(eA));
      (eu.inFlightPrompts.clear(),
        this.logger.info?.(
          "[ACP StreamManager] cancelAllInFlightPrompts: All in-flight prompts cancelled",
        ));
    }
  });
  let n7 = 32,
    il = 864e5,
    ic = 5e3,
    iu = class {
      constructor() {
        ((this.tokens = new Map()),
          (this.tokenIndex = new Map()),
          (this.maxConnections = n7),
          (this.tokenTtlMs = il));
      }
      initialize() {
        this.logger.setContext("AcpConnectionGuard");
      }
      async setup() {
        let eA = await this.settingsManager.get("gateway"),
          el = process.env.CODEBUDDY_ACP_MAX_CONNECTIONS;
        el && !isNaN(Number(el))
          ? (this.maxConnections = Math.max(1, Number(el)))
          : eA?.maxConnections === void 0 ||
            isNaN(Number(eA.maxConnections)) ||
            (this.maxConnections = Math.max(1, Number(eA.maxConnections)));
        let ec = process.env.CODEBUDDY_ACP_TOKEN_TTL_MS;
        (ec && !isNaN(Number(ec))
          ? (this.tokenTtlMs = Math.max(6e4, Number(ec)))
          : eA?.tokenTtlMs === void 0 ||
            isNaN(Number(eA.tokenTtlMs)) ||
            (this.tokenTtlMs = Math.max(6e4, Number(eA.tokenTtlMs))),
          this.logger.info(
            `Setup complete: maxConnections=${this.maxConnections}, tokenTtlMs=${this.tokenTtlMs}`,
          ));
      }
      issueToken(eA) {
        if (
          (this.cleanupExpired(),
          this.tokens.size >= this.maxConnections && !this.evictOldest())
        )
          return void this.logger.warn(
            `Connection limit reached (${this.tokens.size}/${this.maxConnections}), rejecting connectionId=${eA}`,
          );
        this.tokens.has(eA) && this.revokeToken(eA);
        let el = (0, nI.randomBytes)(32).toString("base64url"),
          ec = Date.now(),
          eu = {
            connectionId: eA,
            token: el,
            createdAt: ec,
            lastActivityAt: ec,
            expiresAt: ec + this.tokenTtlMs,
          };
        return (
          this.tokens.set(eA, eu),
          this.tokenIndex.set(el, eA),
          this.logger.info(
            `Token issued for connectionId=${eA}, active=${this.tokens.size}/${this.maxConnections}`,
          ),
          el
        );
      }
      validateToken(eA) {
        let el = this.tokenIndex.get(eA);
        if (!el) return;
        let ec = this.tokens.get(el);
        if (!ec) return void this.tokenIndex.delete(eA);
        if (Date.now() > ec.expiresAt) {
          (this.logger.info(`Token expired for connectionId=${el}`),
            this.revokeToken(el));
          return;
        }
        return ((ec.lastActivityAt = Date.now()), el);
      }
      revokeToken(eA) {
        let el = this.tokens.get(eA);
        el &&
          (this.tokenIndex.delete(el.token),
          this.tokens.delete(eA),
          this.logger.info(
            `Token revoked for connectionId=${eA}, active=${this.tokens.size}/${this.maxConnections}`,
          ));
      }
      getActiveConnectionCount() {
        return (this.cleanupExpired(), this.tokens.size);
      }
      getMaxConnections() {
        return this.maxConnections;
      }
      cleanupExpired() {
        let eA = Date.now();
        for (let [el, ec] of this.tokens)
          eA > ec.expiresAt &&
            (this.tokenIndex.delete(ec.token), this.tokens.delete(el));
      }
      evictOldest() {
        let eA, el;
        try {
          eA = r6.ContainerUtil.get(r8.AcpStreamManager);
        } catch {}
        if (eA) {
          for (let [el] of this.tokens)
            if (!eA.isConnectionAlive(el)) {
              (this.logger.info(`Evicting dead connection: ${el}`),
                this.revokeToken(el));
              try {
                eA.close(el);
              } catch {}
              return !0;
            }
        }
        let ec = 1 / 0;
        for (let [eu, ed] of this.tokens)
          !eA?.hasInFlightPrompt(eu) &&
            ed.lastActivityAt < ec &&
            ((ec = ed.lastActivityAt), (el = eu));
        if (el) {
          let eu = Date.now() - ec;
          if (eu < ic)
            return (
              this.logger.warn(
                `Refusing to evict: candidate ${el} still in grace period (idle ${eu}ms < ${ic}ms), all connections recently active`,
              ),
              !1
            );
          (this.logger.info(
            `Evicting idle connection: ${el} (idle ${Math.floor(eu / 1e3)}s, no in-flight prompts)`,
          ),
            this.revokeToken(el));
          try {
            eA?.close(el);
          } catch {}
          return !0;
        }
        return (
          this.logger.warn(
            `Refusing to evict: all ${this.tokens.size} connections have in-flight prompts; caller will get 503 and retry`,
          ),
          !1
        );
      }
    };
  function isLoopbackAddress(eA) {
    if (!eA) return !1;
    let el = eA.trim().toLowerCase();
    if (!el) return !1;
    el.startsWith("[") && el.endsWith("]") && (el = el.slice(1, -1));
    let ec = el.indexOf("%");
    if ((ec >= 0 && (el = el.slice(0, ec)), el.startsWith("::ffff:"))) {
      let eA = el.slice(7);
      if (eA.includes(".")) return isLoopbackIpv4(eA);
      let ec = hexMappedToIpv4(eA);
      return !!ec && isLoopbackIpv4(ec);
    }
    return el.includes(":") ? isLoopbackIpv6(el) : isLoopbackIpv4(el);
  }
  function isLoopbackIpv4(eA) {
    let el = eA.split(".");
    if (4 !== el.length) return !1;
    let ec = el.map((eA) => (/^\d{1,3}$/.test(eA) ? Number(eA) : -1));
    return !ec.some((eA) => eA < 0 || eA > 255) && 127 === ec[0];
  }
  function isLoopbackIpv6(eA) {
    if ("::1" === eA) return !0;
    let el = expandIpv6(eA);
    return (
      !!el &&
      8 === el.length &&
      el.slice(0, 7).every((eA) => 0 === eA) &&
      1 === el[7]
    );
  }
  function expandIpv6(eA) {
    let el,
      ec,
      eu = eA.indexOf("::");
    eu >= 0
      ? ((el = eA.slice(0, eu)), (ec = eA.slice(eu + 2)))
      : ((el = eA), (ec = ""));
    let ed = el ? el.split(":") : [],
      ep = ec ? ec.split(":") : [],
      parseGroup = (eA) => {
        if (/^[0-9a-f]{1,4}$/.test(eA)) return parseInt(eA, 16);
      },
      eg = [];
    for (let eA of ed) {
      let el = parseGroup(eA);
      if (void 0 === el) return;
      eg.push(el);
    }
    let eh = [];
    for (let eA of ep) {
      let el = parseGroup(eA);
      if (void 0 === el) return;
      eh.push(el);
    }
    if (eu >= 0) {
      let eA = 8 - eg.length - eh.length;
      if (eA < 0) return;
      return [...eg, ...Array(eA).fill(0), ...eh];
    }
    return 8 === eg.length ? eg : void 0;
  }
  function hexMappedToIpv4(eA) {
    let el = eA.split(":");
    if (2 !== el.length) return;
    let ec = el.map((eA) =>
      /^[0-9a-f]{1,4}$/.test(eA) ? parseInt(eA, 16) : -1,
    );
    if (ec.some((eA) => eA < 0 || eA > 65535)) return;
    let [eu, ed] = ec;
    return `${(eu >> 8) & 255}.${255 & eu}.${(ed >> 8) & 255}.${255 & ed}`;
  }
  let ig = nE.BODY_MIDDLEWARE_PRIORITY + 100;
  function acp_security_middleware_headerValue(eA, el) {
    let ec = eA[el.toLowerCase()];
    if (ec) return Array.isArray(ec) ? ec[ec.length - 1] : ec;
  }
  let ih = class {
    constructor() {
      this.priority = ig;
    }
    async handle(eA, el) {
      if (
        !(await this.canHandle()) ||
        !this.corsService ||
        !this.auth ||
        !this.connectionGuard
      )
        return void (await el());
      let ec = eA.request,
        eu = eA.response,
        ed = ec.method || "GET",
        ep = ec.socket?.remoteAddress || "unknown",
        eg = acp_security_middleware_headerValue(ec.headers, "origin");
      if ((this.corsService.applyCorsHeaders(eu, eg), "OPTIONS" === ed)) {
        ((eu.statusCode = 204), eu.end());
        return;
      }
      if (this.checkAuth(eA, ep)) {
        if (
          ("POST" === ed || "DELETE" === ed) &&
          !(ec.url || "").startsWith("/api/v1/acp/connect") &&
          !this.checkSessionToken(eA, ep)
        )
          return;
        await el();
      }
    }
    async canHandle() {
      return this.requestMatcher.match(
        await this.pathResolver.resolve("/api/v1/acp"),
      );
    }
    checkAuth(eA, el) {
      if (!this.auth?.isEnabled() || isLoopbackAddress(el)) return !0;
      let ec = eA.request,
        eu = {
          method: ec.method || "GET",
          url: ec.url || "/",
          headers: ec.headers,
          body: void 0,
          query: this.parseQuery(ec.url || ""),
        };
      if (this.auth?.authenticate(eu))
        return (this.auditLog?.log("auth.success", { remoteAddress: el }), !0);
      let ed = this.auth?.recordFailedAttempt(),
        ep = ed ? 429 : 401,
        eg = ed ? "auth.rate_limited" : "auth.failure";
      (this.auditLog?.log(eg, { remoteAddress: el }),
        this.logger.warn?.(
          `[AcpSecurity] auth denied statusCode=${ep} remoteAddress=${JSON.stringify(el)} isLoopback=${isLoopbackAddress(el)}`,
        ));
      let eh = eA.response;
      return (
        (eh.statusCode = ep),
        eh.setHeader("Content-Type", "application/json"),
        eh.end(
          JSON.stringify({
            jsonrpc: "2.0",
            error: {
              code: 429 === ep ? -32e3 : -32001,
              message:
                429 === ep
                  ? "Too many failed authentication attempts"
                  : "Authentication required",
            },
            id: null,
          }),
        ),
        !1
      );
    }
    checkSessionToken(eA, el) {
      if (isLoopbackAddress(el)) return !0;
      let ec = eA.request.headers,
        eu = acp_security_middleware_headerValue(ec, "acp-connection-id"),
        ed = acp_security_middleware_headerValue(ec, "acp-session-token");
      if (!ed) {
        let ec = eA.response;
        return (
          (ec.statusCode = 401),
          ec.setHeader("Content-Type", "application/json"),
          ec.end(
            JSON.stringify({
              jsonrpc: "2.0",
              error: {
                code: -32001,
                message: "Missing acp-session-token header",
              },
              id: null,
            }),
          ),
          this.auditLog?.log("token.invalid", {
            remoteAddress: el,
            connectionId: eu || void 0,
            details: { reason: "missing" },
          }),
          !1
        );
      }
      let ep = this.connectionGuard?.validateToken(ed);
      if (!ep || (eu && ep !== eu)) {
        let ec = eA.response;
        return (
          (ec.statusCode = 403),
          ec.setHeader("Content-Type", "application/json"),
          ec.end(
            JSON.stringify({
              jsonrpc: "2.0",
              error: {
                code: -32001,
                message: "Invalid or expired session token",
              },
              id: null,
            }),
          ),
          this.auditLog?.log("token.invalid", {
            remoteAddress: el,
            connectionId: eu || void 0,
            details: { reason: "invalid_or_expired" },
          }),
          !1
        );
      }
      return !0;
    }
    parseQuery(eA) {
      let el = {},
        ec = eA.indexOf("?");
      if (ec >= 0)
        for (let [eu, ed] of new URLSearchParams(eA.substring(ec + 1)))
          el[eu] = ed;
      return el;
    }
  };
  n6.PROMPT_TIMEOUT_MS = 18e5;
  n6.STREAM_CLOSE_DELAY_MS = 0;
  n6.CANCEL_GRACE_MS = 5e3;
  n6.SSE_HEARTBEAT_INTERVAL_MS = 3e4;
  n6.SWEEP_KIND_CANCEL = "cancel";
  n6.SWEEP_KIND_TIMEOUT = "timeout";
  return {
    AcpAgentManagerImpl: r7,
    AcpServerImpl: nC,
    AcpContextImpl: ny,
    AcpController: nQ,
    AcpTransportManagerImpl: n2,
    AcpTransportImpl: n3,
    AcpTransportFactoryImpl: n4,
    AcpStreamManagerImpl: n6,
    AcpConnectionGuardImpl: iu,
    AcpSecurityMiddleware: ih,
    headerValue,
    acp_stream_manager_headerValue,
    isObject,
    describeAcpMessage,
    isJsonRpcRequest,
    isJsonRpcResponseOrError,
    isInitializeRequest,
    isPromptRequest,
    isCancelNotification,
    safeJsonStringify,
    isLoopbackAddress,
    isLoopbackIpv4,
    isLoopbackIpv6,
    expandIpv6,
    hexMappedToIpv4,
    acp_security_middleware_headerValue,
  };
}

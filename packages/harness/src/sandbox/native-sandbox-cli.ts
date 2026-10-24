// @ts-nocheck
// Complete original inert declarations; product decorators/bootstrap are not executed.
export const SANDBOX_CLI_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export const SANDBOX_CLI_BLOCKS = [
  ["lB", 8615736, 8623332],
  ["SandboxCliStdioCapture", 8623909, 8624797],
  ["lR", 8625357, 8638119],
  ["lM", 8639449, 8661541],
] as const;
export const SANDBOX_CLI_CLASSES = [
  ["lB", 8615867, 8623331, 20],
  ["SandboxCliStdioCapture", 8623936, 8624796, 3],
  ["lR", 8625385, 8638118, 24],
  ["lM", 8639478, 8661540, 41],
] as const;
export const SANDBOX_CLI_STATICS = [8661541, 8661693] as const;
export function createNativeSandboxCLI(runtime: any) {
  if (!runtime?.process)
    throw Error("Explicit Sandbox CLI process boundary required");
  const process = runtime.process,
    Date = runtime.Date ?? globalThis.Date,
    Math = runtime.Math ?? globalThis.Math;
  const console = runtime.console ?? globalThis.console;
  const setTimeout = runtime.setTimeout ?? globalThis.setTimeout,
    clearTimeout = runtime.clearTimeout ?? globalThis.clearTimeout,
    setImmediate = runtime.setImmediate ?? globalThis.setImmediate;
  function ec(id: number) {
    const value = runtime.modules?.[id] ?? runtime.getModule?.(id);
    if (value === undefined)
      throw Error("Explicit Sandbox CLI module required: " + id);
    return value;
  }
  const lC = ec(69278);
  const ad = ec(74674);
  const iJ = ec(35317);
  const iD = ec(16928);
  const nH = ec(79896);
  const iS = ec(44237);
  const l_ = ec(43121);
  const lv = ec(80588);
  const lI = ec(94377);
  const lb = ec(54601);
  const oK = ec(6453);
  const lS = ec(13193);
  let AV;
  let ly = 8388608,
    lw = new WeakSet();
  function isSandboxCLIConnectTimeoutError(eA) {
    return "object" == typeof eA && null !== eA && lw.has(eA);
  }
  let lB = class {
    constructor() {
      ((this._connected = !1),
        (this._messageCounter = 0),
        (this._socket = null),
        (this._lineBuffer = ""),
        (this._config = null),
        (this._pendingRequests = new Map()),
        (this._reverseListeners = []),
        (this._disconnectListeners = new Set()));
    }
    init() {}
    async connect(eA) {
      let el;
      if (this._connected)
        return void this.logger.info?.(
          "[SandboxCLIClient] Already connected, skipping",
        );
      let ec = { ...ad.DEFAULT_SANDBOX_CLI_CONFIG, ...eA };
      this._config = ec;
      let eu = ec.connectTimeoutMs ?? 1e4,
        ed = this._resolveIpcPath(ec.address);
      this.logger.info?.(
        `[SandboxCLIClient] Connecting to ${ed} (timeout=${eu}ms)`,
      );
      let ep = 200,
        eg = Date.now() + eu,
        eh = 0;
      for (; Date.now() < eg; ) {
        eh++;
        try {
          (await this._tryConnect(ed, Math.min(3e3, eg - Date.now())),
            this.logger.info?.(
              `[SandboxCLIClient] Connected successfully (attempt ${eh})`,
            ));
          return;
        } catch (eA) {
          if (
            ((el = eA),
            "ENOENT" === eA.code ||
              "ECONNREFUSED" === eA.code ||
              eA.message?.includes("ENOENT") ||
              eA.message?.includes("ECONNREFUSED"))
          ) {
            (this.logger.info?.(
              `[SandboxCLIClient] Pipe not ready (attempt ${eh}), retrying in ${ep}ms...`,
            ),
              await new Promise((eA) => setTimeout(eA, ep)));
            continue;
          }
          throw eA;
        }
      }
      let ef = Error(
        `IPC connect timeout after ${eu}ms (${eh} attempts): ${el?.message ?? "unknown"}`,
      );
      throw (lw.add(ef), ef);
    }
    _tryConnect(eA, el) {
      return new Promise((ec, eu) => {
        let ed = !1,
          ep = setTimeout(() => {
            if (ed) return;
            ((ed = !0), this._cleanupSocket());
            let eA = Error(`IPC connect attempt timeout after ${el}ms`);
            ((eA.code = "ETIMEDOUT"), eu(eA));
          }, el),
          eg = lC.createConnection(eA);
        ((this._socket = eg),
          eg.on("connect", () => {
            ed || ((ed = !0), clearTimeout(ep), (this._connected = !0), ec());
          }),
          eg.on("error", (eA) => {
            ed
              ? (this.logger.info?.(
                  `[SandboxCLIClient] Socket error: ${eA.message}`,
                ),
                this._handleDisconnect())
              : ((ed = !0), clearTimeout(ep), this._cleanupSocket(), eu(eA));
          }),
          eg.on("close", () => {
            ed
              ? (this.logger.info?.("[SandboxCLIClient] Socket closed"),
                this._handleDisconnect())
              : ((ed = !0),
                clearTimeout(ep),
                eu(Error("IPC connection closed before connect")));
          }),
          eg.on("data", (eA) => {
            this._onSocketData(eA);
          }));
      });
    }
    async disconnect() {
      (this.logger.info?.("[SandboxCLIClient] Disconnecting..."),
        this._rejectAllPending("Client disconnected"),
        this._cleanupSocket(),
        (this._connected = !1),
        (this._lineBuffer = ""));
    }
    isConnected() {
      return this._connected;
    }
    async sendRequest(eA, el, ec, eu) {
      if (!this._connected || !this._socket)
        throw Error("Not connected to sandbox-cli");
      let ed = this._nextMessageId(),
        ep = (0, ad.createIpcRequest)(ed, eA, el, ec),
        eg = this._config?.requestTimeoutMs ?? 12e4;
      return (
        this.logger.info?.(
          `[SandboxCLIClient] sendRequest | id=${ed} | cmd=${el} | timeout=${eg}ms | msg=${JSON.stringify(ep)}`,
        ),
        new Promise((eA, ec) => {
          let eh = setTimeout(() => {
            this._pendingRequests.get(ed) &&
              (this._pendingRequests.delete(ed),
              ec(
                Error(`Request ${ed} timed out after ${eg}ms (command: ${el})`),
              ));
          }, eg);
          this._pendingRequests.set(ed, {
            resolve: (el) => eA(el),
            reject: ec,
            timer: eh,
            conversationRequestId: eu?.conversationRequestId,
          });
          let ef = JSON.stringify(ep) + "\n";
          this._socket.write(ef, (eA) => {
            eA &&
              (this._pendingRequests.delete(ed),
              clearTimeout(eh),
              ec(Error(`Failed to write IPC message: ${eA.message}`)));
          });
        })
      );
    }
    getPendingConversationRequestIds() {
      let eA = [];
      for (let el of this._pendingRequests.values())
        el.conversationRequestId && eA.push(el.conversationRequestId);
      return eA;
    }
    onReverseRequest(eA) {
      this._reverseRequestHandler = eA;
    }
    addReverseListener(eA, el) {
      let ec = { commands: new Set(eA.commands), handler: el };
      return (
        this._reverseListeners.push(ec),
        () => {
          let eA = this._reverseListeners.indexOf(ec);
          -1 !== eA && this._reverseListeners.splice(eA, 1);
        }
      );
    }
    onDisconnect(eA) {
      return (
        this._disconnectListeners.add(eA),
        () => {
          this._disconnectListeners.delete(eA);
        }
      );
    }
    async ping() {
      let eA = this._config?.heartbeatTimeoutMs ?? 5e3;
      (this.logger.info?.(`[SandboxCLIClient] ping | timeout=${eA}ms`),
        await this.sendRequest("", ad.SANDBOX_COMMANDS.PING, void 0));
    }
    _nextMessageId() {
      return `ts-msg-${this._messageCounter++}`;
    }
    _resolveIpcPath(eA) {
      return "win32" === process.platform
        ? `\\\\.\\pipe\\${eA}`
        : `/tmp/${eA}.sock`;
    }
    _onSocketData(eA) {
      let el;
      if (
        ((this._lineBuffer += eA.toString("utf-8")),
        this._lineBuffer.length > ly)
      ) {
        (this.logger.error?.(
          `[SandboxCLIClient] Line buffer exceeded ${ly} bytes (currentLen=${this._lineBuffer.length}) without newline, closing connection to force restart`,
        ),
          (this._lineBuffer = ""),
          this._handleDisconnect());
        return;
      }
      for (; -1 !== (el = this._lineBuffer.indexOf("\n")); ) {
        let eA = this._lineBuffer.slice(0, el).trim();
        if (
          ((this._lineBuffer = this._lineBuffer.slice(el + 1)), 0 !== eA.length)
        )
          try {
            let el = JSON.parse(eA);
            this._handleMessage(el);
          } catch (el) {
            this.logger.info?.(
              `[SandboxCLIClient] Failed to parse IPC message: ${el.message}, line=${eA.slice(0, 200)}`,
            );
          }
      }
    }
    _handleMessage(eA) {
      if ((0, ad.isIpcResponse)(eA)) {
        let el = this._pendingRequests.get(eA.messageId);
        if (!el)
          return void this.logger.info?.(
            `[SandboxCLIClient] Received response for unknown messageId: ${eA.messageId}`,
          );
        (this._pendingRequests.delete(eA.messageId),
          el.timer && clearTimeout(el.timer),
          eA.success
            ? (this.logger.info?.(
                `[SandboxCLIClient] Response OK | id=${eA.messageId} | cmd=${eA.command} | data=${JSON.stringify(eA.data ?? null).slice(0, 500)}`,
              ),
              el.resolve(eA.data))
            : (this.logger.info?.(
                `[SandboxCLIClient] Response ERR | id=${eA.messageId} | error=${eA.error}`,
              ),
              el.reject(Error(eA.error || `Request ${eA.messageId} failed`))));
      } else {
        this.logger.info?.(
          `[SandboxCLIClient] Reverse request | id=${eA.messageId} | cmd=${eA.command} | data=${JSON.stringify(eA.data ?? null).slice(0, 500)}`,
        );
        let el = !1;
        for (let ec of this._reverseListeners)
          if (ec.commands.has(eA.command)) {
            el = !0;
            try {
              ec.handler(eA);
            } catch (el) {
              this.logger.info?.(
                `[SandboxCLIClient] Listener error for ${eA.command}: ${el.message}`,
              );
            }
          }
        if (el) return;
        if (!this._reverseRequestHandler) {
          (this.logger.info?.(
            `[SandboxCLIClient] No handler for reverse event: ${eA.command}`,
          ),
            this._sendResponse(
              (0, ad.createIpcResponseErr)(
                eA.messageId,
                eA.sessionId,
                eA.command,
                "No reverse request handler registered",
              ),
            ));
          return;
        }
        if (
          new Set([
            ad.SANDBOX_COMMANDS.PROCESS_OUTPUT,
            ad.SANDBOX_COMMANDS.PROCESS_EXIT,
            ad.SANDBOX_COMMANDS.REPORT_EVENT,
            ad.SANDBOX_COMMANDS.SYNC_FILE_PROGRESS,
            ad.SANDBOX_COMMANDS.COMMIT_FILE_PROGRESS,
          ]).has(eA.command)
        ) {
          (this.logger.info?.(
            `[SandboxCLIClient] Fire-and-forget event received | id=${eA.messageId} | cmd=${eA.command} | dataSize=${JSON.stringify(eA.data ?? null).length}`,
          ),
            this._reverseRequestHandler(eA).catch((el) => {
              this.logger.info?.(
                `[SandboxCLIClient] Fire-and-forget handler error for ${eA.command}: ${el.message}`,
              );
            }));
          return;
        }
        this._reverseRequestHandler(eA)
          .then((el) => {
            this._sendResponse(
              (0, ad.createIpcResponseOk)(
                eA.messageId,
                eA.sessionId,
                eA.command,
                el,
              ),
            );
          })
          .catch((el) => {
            this._sendResponse(
              (0, ad.createIpcResponseErr)(
                eA.messageId,
                eA.sessionId,
                eA.command,
                el.message || "Reverse request handler failed",
              ),
            );
          });
      }
    }
    _sendResponse(eA) {
      if (!this._connected || !this._socket)
        return void this.logger.info?.(
          "[SandboxCLIClient] Cannot send response: not connected",
        );
      let el = JSON.stringify(eA) + "\n";
      this._socket.write(el, (eA) => {
        eA &&
          this.logger.info?.(
            `[SandboxCLIClient] Failed to send response: ${eA.message}`,
          );
      });
    }
    _rejectAllPending(eA) {
      for (let [el, ec] of this._pendingRequests)
        (ec.timer && clearTimeout(ec.timer),
          ec.reject(Error(eA)),
          this.logger.info?.(
            `[SandboxCLIClient] Rejected pending request: ${el}`,
          ));
      this._pendingRequests.clear();
    }
    _cleanupSocket() {
      if (this._socket) {
        this._socket.removeAllListeners();
        try {
          this._socket.destroy();
        } catch {}
        this._socket = null;
      }
    }
    _handleDisconnect() {
      if (this._connected)
        for (let eA of ((this._connected = !1),
        this._rejectAllPending("Connection lost"),
        this._cleanupSocket(),
        this.logger.info?.("[SandboxCLIClient] Disconnected from sandbox-cli"),
        Array.from(this._disconnectListeners)))
          try {
            eA();
          } catch (eA) {
            this.logger.info?.(
              `[SandboxCLIClient] disconnect listener error: ${eA?.message ?? eA}`,
            );
          }
    }
  };
  let SandboxCliStdioCapture = class SandboxCliStdioCapture {
    constructor(eA, el = 1024, ec = 1024) {
      if (
        ((this._headLimit = el),
        (this._tailLimit = ec),
        (this._headChars = ""),
        (this._tailChars = ""),
        (this._totalBytes = 0),
        (this._decoder = new lS.StringDecoder("utf8")),
        !eA)
      )
        return;
      (eA.on("data", (eA) => {
        this._append(this._decoder.write(eA), eA.byteLength);
      }),
        eA.on("error", (eA) => {
          console.warn(
            `[SandboxCLI] stdio capture stream error: ${eA?.message ?? String(eA)}`,
          );
        }));
    }
    _append(eA, el) {
      if (((this._totalBytes += el), 0 !== eA.length)) {
        if (this._headChars.length < this._headLimit) {
          let el = this._headLimit - this._headChars.length;
          if (
            ((this._headChars += eA.slice(0, el)),
            0 === (eA = eA.slice(el)).length)
          )
            return;
        }
        eA.length >= this._tailLimit
          ? (this._tailChars = eA.slice(-this._tailLimit))
          : (this._tailChars = (this._tailChars + eA).slice(-this._tailLimit));
      }
    }
    snapshot() {
      return {
        text: this._tailChars
          ? `${this._headChars}
...
${this._tailChars}`
          : this._headChars,
        bytes: this._totalBytes,
      };
    }
  };
  let lQ = 500,
    lD = 5e3,
    lT = 600,
    lR = class {
      constructor() {
        ((this._state = "idle"),
          (this._process = null),
          (this._ipcAddress = null),
          (this._startPromise = null),
          (this._sessionEstablished = !1),
          (this._stdoutCapture = null),
          (this._stderrCapture = null),
          (this._consoleMode = "pipe"),
          (this._exitHandler = null));
      }
      init() {}
      async start(eA) {
        if (
          (this.logger.info?.(
            `[SandboxCLI] start() called, current state=${this._state}, hasIpcAddress=${!!this._ipcAddress}`,
          ),
          "running" === this._state && this._ipcAddress)
        )
          return (
            this.logger.info?.(
              `[SandboxCLI] Already running, returning cached address: ${this._ipcAddress}`,
            ),
            this._ipcAddress
          );
        if ("starting" === this._state && this._startPromise)
          return (
            this.logger.info?.(
              "[SandboxCLI] Already starting, returning existing start promise",
            ),
            this._startPromise
          );
        ((this._state = "starting"),
          (this._sessionEstablished = !1),
          (this._startupFailure = void 0),
          this.logger.info?.(
            "[SandboxCLI] State changed to starting, spawning process...",
          ),
          (this._startPromise = this._doStart(eA)));
        try {
          let eA = await this._startPromise;
          return (
            (this._state = "running"),
            (this._startedAtMs = Date.now()),
            (this._ipcAddress = eA),
            this.logger.info?.(`[SandboxCLI] start() succeeded, address=${eA}`),
            this._gcOldSandboxVersions(),
            eA
          );
        } catch (eA) {
          throw (
            (this._state = "stopped"),
            (this._startPromise = null),
            this.logger.error?.(`[SandboxCLI] start() failed: ${eA.message}`),
            eA
          );
        }
      }
      markSessionEstablished() {
        "running" === this._state && (this._sessionEstablished = !0);
      }
      consumeStartupFailure() {
        let eA = this._startupFailure;
        return ((this._startupFailure = void 0), eA);
      }
      async stop() {
        let eA = this._process;
        (eA &&
          "stopped" !== this._state &&
          "idle" !== this._state &&
          ((this._state = "stopped"),
          await new Promise((el) => {
            let ec = setTimeout(() => {
              try {
                eA.kill("SIGKILL");
              } catch {}
              el();
            }, lD);
            eA.once("close", () => {
              (clearTimeout(ec), el());
            });
            try {
              eA.kill("SIGTERM");
            } catch {
              (clearTimeout(ec), el());
            }
          })),
          this._cleanup());
      }
      isRunning() {
        return "running" === this._state;
      }
      getStartedAtMs() {
        return "running" === this._state ? this._startedAtMs : void 0;
      }
      getCapturedStdio() {
        if ("console" === this._consoleMode) return { consoleMode: "console" };
        let eA = this._stdoutCapture?.snapshot(),
          el = this._stderrCapture?.snapshot();
        return {
          consoleMode: "pipe",
          stdout: eA?.text,
          stdoutBytes: eA?.bytes,
          stderr: el?.text,
          stderrBytes: el?.bytes,
        };
      }
      _doStart(eA) {
        return new Promise((el, ec) => {
          let eu;
          ((this._startSessionId = eA?.sessionId),
            (this._startConversationRequestId = eA?.conversationRequestId));
          let ed = this._resolveSandboxCLIPath();
          this._resolvedExePath = ed;
          let ep = this._generateIpcAddress(),
            eg = this._buildStartConfig(ep);
          (this.logger.info?.(
            `[SandboxCLI] Starting sandbox-cli: ${ed}, ipcAddress=${ep}`,
          ),
            this.logger.debug?.(`[SandboxCLI] Config: ${JSON.stringify(eg)}`));
          let eh = ["--config", JSON.stringify(eg)];
          (eh.push("--gc_retain_sec", String(lT)),
            eA?.appHomeDir
              ? (eh.push("--app_home", eA.appHomeDir),
                this.logger.info?.(`[SandboxCLI] app_home: ${eA.appHomeDir}`))
              : this.logger.warn?.(
                  "[SandboxCLI] No appHomeDir provided; sandbox-cli will fall back to platform default (Windows=%LOCALAPPDATA%\\WorkBuddy, other=$HOME/.local/share/WorkBuddy)",
                ),
            eA?.appGroupId &&
              "darwin" === process.platform &&
              (eh.push("--app_group_id", eA.appGroupId),
              this.logger.info?.(
                `[SandboxCLI] app_group_id: ${eA.appGroupId}`,
              )));
          let ef =
            eA?.showConsoleWindow ??
            "1" === process.env.SANDBOX_CLI_SHOW_CONSOLE;
          ef &&
            (eh.push("--console"),
            this.logger.info?.(
              "[SandboxCLI] Console window requested (--console)",
            ));
          let em = { ...process.env };
          if (eg.extraPath.length > 0) {
            let eA = "win32" === process.platform ? ";" : ":",
              el = em.PATH || em.Path || "";
            ((em.PATH = eg.extraPath.join(eA) + eA + el),
              this.logger.debug?.(
                `[SandboxCLI] Injected extraPath into PATH: ${eg.extraPath.join(eA)}`,
              ));
          }
          for (let eA of ("win32" === process.platform &&
            ((em.MSYS_NO_PATHCONV = "1"), (em.MSYS2_ARG_CONV_EXCL = "*")),
          [
            "ACC_PRODUCT_CONFIG_V3",
            "ACC_PRODUCT_CONFIG_V2",
            "ACC_PRODUCT_CONFIG",
            "ACC_PRODUCT_CONFIG_PATH",
          ]))
            eA in em && delete em[eA];
          let eE = Object.fromEntries(
            [
              "PATH",
              "CODEBUDDY_CODE_GIT_BASH_PATH",
              "CODEBUDDY_CODE_PYTHON_PATH",
              "CODEBUDDY_CODE_NODE_PATH",
              "SANDBOX_CLI_PATH",
              "SANDBOX_CLI_SHOW_CONSOLE",
            ]
              .filter((eA) => void 0 !== em[eA])
              .map((eA) => [eA, em[eA]]),
          );
          (this.logger.info?.(
            `[SandboxCLI] Spawn args: exe=${ed}, args=${JSON.stringify(eh)}, showConsole=${ef}, env=${JSON.stringify(eE)}`,
          ),
            (this._consoleMode = ef ? "console" : "pipe"));
          let eC = ef
            ? ["ignore", "ignore", "ignore"]
            : ["ignore", "pipe", "pipe"];
          try {
            eu = (0, iJ.spawn)(ed, eh, {
              stdio: eC,
              env: em,
              windowsHide: !ef,
              detached: ef,
            });
          } catch (eA) {
            ((this._startupFailure = {
              phase:
                eA?.code === "ENOENT"
                  ? "startup-cli-not-found"
                  : "startup-spawn-error",
              errorCode:
                "string" == typeof eA?.code && eA.code
                  ? `SANDBOX_SPAWN_${eA.code}`
                  : "SANDBOX_SPAWN_THROW",
              errorMsg: `Failed to spawn sandbox-cli: ${eA.message}`,
            }),
              ec(Error(this._startupFailure.errorMsg)));
            return;
          }
          ((this._process = eu),
            "pipe" === this._consoleMode &&
              ((this._stdoutCapture = new SandboxCliStdioCapture(eu.stdout)),
              (this._stderrCapture = new SandboxCliStdioCapture(eu.stderr))));
          let ey = !1;
          (eu.on("error", (eA) => {
            ey
              ? this.logger.warn?.(
                  `[SandboxCLI] Process error after startup: ${eA.message}`,
                )
              : ((ey = !0),
                (this._startupFailure = {
                  phase:
                    eA?.code === "ENOENT"
                      ? "startup-cli-not-found"
                      : "startup-spawn-error",
                  errorCode:
                    "string" == typeof eA?.code && eA.code
                      ? `SANDBOX_SPAWN_${eA.code}`
                      : "SANDBOX_SPAWN_ERROR",
                  errorMsg: `sandbox-cli process error: ${eA.message}`,
                }),
                ec(Error(this._startupFailure.errorMsg)));
          }),
            eu.on("close", (eA, el) => {
              if (ey) {
                (this.logger.warn?.(
                  `[SandboxCLI] Process exited with code ${eA}, signal=${el ?? "null"}`,
                ),
                  eu.pid && (0, lv.unregisterSandboxCliPid)(eu.pid));
                let ec =
                  this._sessionEstablished &&
                  "stopped" !== this._state &&
                  "idle" !== this._state
                    ? this._buildDaemonFailurePayloadSafely(() => ({
                        phase: "runtime-exit",
                        errorCode: `SANDBOX_DAEMON_CRASH_EXIT_${eA ?? "NULL"}`,
                        exitCode: eA,
                        signal: el ?? void 0,
                        uptimeMs: this._startedAtMs
                          ? Date.now() - this._startedAtMs
                          : void 0,
                        ...this.getCapturedStdio(),
                        ...this._daemonFailureContext(),
                      }))
                    : void 0;
                (this._sessionEstablished ||
                  (this._startupFailure = {
                    phase: "startup-window-exit",
                    errorCode: `SANDBOX_STARTUP_EXIT_${eA ?? "NULL"}`,
                    errorMsg: `sandbox-cli exited before OpenSession was established (code: ${eA}, signal: ${el ?? "null"})`,
                    exitCode: eA,
                    signal: el ?? void 0,
                  }),
                  (this._startedAtMs = void 0),
                  (this._sessionEstablished = !1),
                  (this._state = "stopped"),
                  ec && this._scheduleDaemonFailureReport(ec));
                return;
              }
              ((ey = !0),
                eu.pid && (0, lv.unregisterSandboxCliPid)(eu.pid),
                (this._startupFailure = {
                  phase: "startup-window-exit",
                  errorCode: `SANDBOX_SPAWN_FAILED_EXIT_${eA ?? "NULL"}`,
                  errorMsg: `sandbox-cli exited unexpectedly during startup (code: ${eA}, signal: ${el ?? "null"})`,
                  exitCode: eA,
                  signal: el ?? void 0,
                }),
                ec(Error(this._startupFailure.errorMsg)));
            }),
            setTimeout(() => {
              ey ||
                ((ey = !0),
                (0, lv.registerSandboxCliPid)(eu.pid),
                (this._exitHandler = () => {
                  if (this._process) {
                    (0, lv.unregisterSandboxCliPid)(this._process.pid);
                    try {
                      this._process.kill("SIGKILL");
                    } catch {}
                  }
                }),
                process.on("exit", this._exitHandler),
                this.logger.info?.(
                  `[SandboxCLI] Process alive after ${lQ}ms, ipcAddress=${ep}`,
                ),
                el(ep));
            }, lQ));
        });
      }
      _resolveSandboxCLIPath() {
        let eA =
            "win32" === process.platform ? "sandbox-cli.exe" : "sandbox-cli",
          el = [],
          ec = process.env.SANDBOX_CLI_PATH;
        if (ec)
          return (
            this.logger.info?.(`[SandboxCLI] Using SANDBOX_CLI_PATH: ${ec}`),
            ec
          );
        if (iS.PathUtils.isBunCompiled()) {
          let ec = iD.dirname(process.execPath),
            eu = iD.join(ec, "vendor", "sandbox"),
            ed = this._resolveFromVersionedDir(eu, eA, el);
          if (ed) return ed;
          let ep = iD.join(eu, eA);
          if ((el.push(ep), nH.existsSync(ep)))
            return (
              this.logger.info?.(
                `[SandboxCLI] resolved via execPath vendor/sandbox/ (flat): ${ep}`,
              ),
              ep
            );
          let eg = `sandbox-cli binary not found for ${process.platform}-${process.arch}. Tried: ${el.join(", ")}`;
          throw (
            (this._startupFailure = {
              phase: "startup-cli-not-found",
              errorCode: "SANDBOX_CLI_NOT_FOUND",
              errorMsg: eg,
            }),
            Error(eg)
          );
        }
        let eu = iS.PathUtils.getRootPathSync(),
          ed = iD.join(eu, "vendor", "sandbox"),
          ep = this._readSandboxVersionFromPackageJson(eu);
        if (ep) {
          let ec = iD.join(ed, ep, eA);
          if ((el.push(ec), nH.existsSync(ec)))
            return (
              this.logger.info?.(
                `[SandboxCLI] resolved via vendor/sandbox/${ep}/: ${ec}`,
              ),
              ec
            );
        }
        let eg = this._resolveFromVersionedDir(ed, eA, el);
        if (eg) return eg;
        let eh = iD.join(ed, eA);
        if ((el.push(eh), nH.existsSync(eh)))
          return (
            this.logger.info?.(
              `[SandboxCLI] resolved via vendor/sandbox/ (flat, legacy): ${eh}`,
            ),
            eh
          );
        let ef = (0, l_.getSandboxCliPath)();
        if (ef)
          return (
            el.push(ef),
            this.logger.info?.(
              `[SandboxCLI] resolved via @tencent-ai/sandbox-cli-<os>-<arch> platform pkg: ${ef}`,
            ),
            ef
          );
        let em = (0, l_.getExpectedSandboxCliPath)();
        em && el.push(em);
        let eE = `sandbox-cli binary not found for ${process.platform}-${process.arch}. Tried: ${el.join(", ")}`;
        throw (
          (this._startupFailure = {
            phase: "startup-cli-not-found",
            errorCode: "SANDBOX_CLI_NOT_FOUND",
            errorMsg: eE,
          }),
          Error(eE)
        );
      }
      _readSandboxVersionFromPackageJson(eA) {
        try {
          let el = iD.join(eA, "package.json");
          if (!nH.existsSync(el)) return;
          let ec = JSON.parse(
            nH.readFileSync(el, "utf-8"),
          ).optionalDependencies;
          if (!ec) return;
          return (
            ec[`@tencent-ai/sandbox-cli-${process.platform}-${process.arch}`] ||
            void 0
          );
        } catch {
          return;
        }
      }
      _resolveFromVersionedDir(eA, el, ec) {
        try {
          if (!nH.existsSync(eA)) return;
          let eu = nH
            .readdirSync(eA, { withFileTypes: !0 })
            .filter((eA) => eA.isDirectory() && (0, lI.valid)(eA.name))
            .map((eA) => eA.name);
          if (0 === eu.length) return;
          for (let ed of (eu.sort(lI.rcompare), eu)) {
            let eu = iD.join(eA, ed, el);
            if ((ec.push(eu), nH.existsSync(eu)))
              return (
                this.logger.info?.(
                  `[SandboxCLI] resolved via vendor/sandbox/${ed}/ (scanned): ${eu}`,
                ),
                eu
              );
          }
        } catch {}
      }
      _gcOldSandboxVersions() {
        try {
          let eA = iS.PathUtils.isBunCompiled()
              ? iD.dirname(process.execPath)
              : iS.PathUtils.getRootPathSync(),
            el = iD.join(eA, "vendor", "sandbox");
          if (!nH.existsSync(el))
            return void this.logger.info?.(
              "[SandboxCLI] GC: sandbox dir not found, skipped",
            );
          let ec = this._inferCurrentSandboxVersion(el);
          if (!ec)
            return void this.logger.info?.(
              "[SandboxCLI] GC: cannot determine current version, skipping to avoid self-deletion",
            );
          let eu = nH
            .readdirSync(el, { withFileTypes: !0 })
            .filter((eA) => eA.isDirectory() && (0, lI.valid)(eA.name));
          if (eu.length <= 1)
            return void this.logger.info?.(
              `[SandboxCLI] GC: ${eu.length} version dir(s) found, nothing to collect`,
            );
          this.logger.info?.(
            `[SandboxCLI] GC: found ${eu.length} version dirs, current=${ec ?? "N/A"}`,
          );
          let ed = 0;
          for (let eA of eu) {
            if (ec && eA.name === ec) continue;
            let eu = iD.join(el, eA.name);
            try {
              (nH.rmSync(eu, {
                recursive: !0,
                force: !0,
                maxRetries: 3,
                retryDelay: 100,
              }),
                ed++,
                this.logger.info?.(
                  `[SandboxCLI] GC: removed old sandbox version directory: ${eA.name}`,
                ));
            } catch (el) {
              this.logger.info?.(
                `[SandboxCLI] GC: failed to remove ${eA.name}: ${el.message}`,
              );
            }
          }
          this.logger.info?.(
            `[SandboxCLI] GC: done, removed ${ed}/${eu.length} version dir(s)`,
          );
        } catch (eA) {
          this.logger.info?.(`[SandboxCLI] GC: scan failed: ${eA.message}`);
        }
      }
      _inferCurrentSandboxVersion(eA) {
        let el = iD.resolve(eA);
        if (this._resolvedExePath) {
          let eA = this._extractVersionFromExePath(this._resolvedExePath, el);
          if (eA) return eA;
        }
        if (iS.PathUtils.isBunCompiled()) {
          let eA = this._extractVersionFromExePath(process.execPath, el);
          return eA || void 0;
        }
        return this._readSandboxVersionFromPackageJson(
          iS.PathUtils.getRootPathSync(),
        );
      }
      _extractVersionFromExePath(eA, el) {
        let ec = iD.dirname(iD.resolve(eA)),
          eu = iD.relative(el, ec);
        if (!(!eu || eu.includes(iD.sep) || eu.startsWith("..")))
          return (
            (eu = eu.normalize("NFC")),
            "win32" === process.platform && (eu = eu.toLowerCase()),
            (0, lI.valid)(eu) ? eu : void 0
          );
      }
      _generateIpcAddress() {
        let eA = lb.randomBytes(8).toString("hex");
        return `WorkBuddy_${eA}`;
      }
      _buildStartConfig(eA) {
        let el = iS.PathUtils.getRootPathSync(),
          ec = [iD.join(el, "bin", "runtime", "git", "bin")];
        if ((0, oK.isWindows)())
          try {
            let eA = (0, oK.getShellConfiguration)();
            if ("bash" === eA.shell && eA.executable) {
              let el = iD.dirname(eA.executable);
              ec.includes(el) || ec.push(el);
            }
          } catch {}
        let eu = this._resolveWorkbuddyInstallDir();
        return {
          extraPath: ec,
          enableGlobalProjection: !1,
          ipcAddress: eA,
          ...(eu ? { workbuddyInstallDir: eu } : {}),
        };
      }
      _resolveWorkbuddyInstallDir() {
        let eA = process.env.SANDBOX_ELECTRON_APP_PATH?.trim();
        if (eA) return iD.resolve(eA);
        if ("0" === process.env.WORKBUDDY_IS_PACKAGED) return;
        let el =
          process.env.WORKBUDDY_RESOURCES_PATH?.trim() ||
          process.resourcesPath?.trim();
        if (el)
          return "darwin" === process.platform
            ? iD.resolve(el, "..", "..")
            : iD.resolve(el, "..");
      }
      _cleanup() {
        (this._exitHandler &&
          (process.removeListener("exit", this._exitHandler),
          (this._exitHandler = null)),
          this._process?.pid &&
            (0, lv.unregisterSandboxCliPid)(this._process.pid),
          (this._process = null),
          (this._ipcAddress = null),
          (this._startPromise = null),
          (this._state = "idle"),
          (this._startedAtMs = void 0),
          (this._sessionEstablished = !1),
          (this._startupFailure = void 0),
          (this._resolvedExePath = void 0),
          (this._stdoutCapture = null),
          (this._stderrCapture = null),
          (this._consoleMode = "pipe"),
          (this._startSessionId = void 0),
          (this._startConversationRequestId = void 0));
      }
      _daemonFailureContext() {
        return {
          conversationId: this._startSessionId,
          conversationRequestId: this._startConversationRequestId,
          cwd: process.cwd(),
        };
      }
      _buildDaemonFailurePayloadSafely(eA) {
        try {
          return eA();
        } catch (eA) {
          this._logTelemetryFailure(
            `build daemon failure payload failed: ${eA?.message ?? eA}`,
          );
          return;
        }
      }
      _scheduleDaemonFailureReport(eA) {
        setImmediate(() => {
          try {
            this.telemetryReporter?.reportDaemonFailure(eA);
          } catch (eA) {
            this._logTelemetryFailure(
              `reportDaemonFailure failed: ${eA?.message ?? eA}`,
            );
          }
        });
      }
      _logTelemetryFailure(eA) {
        try {
          this.logger.info?.(`[SandboxCLI] ${eA}`);
        } catch {}
      }
    };
  let lk = [".codebuddy/"],
    lM = (AV = class {
      constructor() {
        ((this._readyGeneration = 0),
          (this._isProjectionActive = !1),
          (this._sessionReadyCallbacks = []),
          (this._isRestarting = !1),
          (this._startupStage = "process-start"),
          (this._accessTelemetryFlushTimerGeneration = 0),
          (this._accessTelemetryFlushPromises = new Map()));
      }
      ensureReady(eA) {
        let el;
        if (this._ensureReadyPromise)
          return (
            this.logger.info?.(
              `[SandboxLifecycle] ensureReady called, hitting cached promise (sessionId=${eA.sessionId}, readyGeneration=${this._readyGeneration})`,
            ),
            this._ensureReadyPromise
          );
        (this.logger.info?.(
          `[SandboxLifecycle] ensureReady first call | sessionId=${eA.sessionId} | appHomeDir=${eA.appHomeDir} | appGroupId=${eA.appGroupId ?? "<none>"} | autoProjection=${eA.autoProjection ?? !1} | showConsoleWindow=${eA.showConsoleWindow ?? !1}`,
        ),
          (this._bootstrapOptions = eA),
          (this._lastReadyError = void 0),
          (this._startupAssetFailure = void 0));
        let ec = !1,
          eu = new Promise((eA, eu) => {
            el = setTimeout(() => {
              ((ec = !0),
                eu(
                  Error(
                    `[SandboxLifecycle] ensureReady hard timeout after ${AV.ENSURE_READY_HARD_TIMEOUT_MS}ms`,
                  ),
                ));
            }, AV.ENSURE_READY_HARD_TIMEOUT_MS);
          });
        this._startupStage = "process-start";
        let ed = this._startAndConnect();
        return (
          ed.catch(() => void 0),
          (this._ensureReadyPromise = Promise.race([ed, eu])
            .then(() => {
              if (
                (el && clearTimeout(el),
                (this._lastReadyError = void 0),
                !this._isRestarting && this._startupAssetFailure)
              ) {
                let eA = this._startupAssetFailure;
                this._scheduleDaemonFailureReport(() => ({
                  ...eA,
                  ...(this.processManager.getCapturedStdio?.() ?? {
                    consoleMode: "pipe",
                  }),
                  ...this._daemonFailureContext(),
                }));
              }
              this._startupAssetFailure = void 0;
            })
            .catch((eA) => {
              (el && clearTimeout(el), ec && this._cleanupAfterTimeout(ed));
              let eu = this._consumeProcessStartupFailure(),
                ep =
                  this._startupAssetFailure ??
                  eu ??
                  (ec
                    ? {
                        phase: "startup-ensure-ready-timeout",
                        errorCode: `SANDBOX_ENSURE_READY_TIMEOUT_${this._startupStage.toUpperCase().replace("-", "_")}`,
                        errorMsg:
                          "string" == typeof eA?.message
                            ? eA.message
                            : String(eA),
                      }
                    : this._normalizeStartupFailure(eA));
              throw (
                this._isRestarting ||
                  this._scheduleDaemonFailureReport(() => ({
                    ...ep,
                    ...(this.processManager.getCapturedStdio?.() ?? {
                      consoleMode: "pipe",
                    }),
                    ...this._daemonFailureContext(),
                  })),
                this.logger.error?.(
                  `[SandboxLifecycle] ensureReady failed, clearing cache to allow retry: ${eA?.message ?? eA}`,
                ),
                (this._ensureReadyPromise = void 0),
                (this._bootstrapOptions = void 0),
                (this._lastReadyError =
                  eA instanceof Error ? eA : Error(String(eA))),
                (this._startupAssetFailure = void 0),
                eA
              );
            })),
          this._ensureReadyPromise
        );
      }
      waitReady() {
        return this._ensureReadyPromise
          ? this._ensureReadyPromise
          : Promise.reject(
              this._lastReadyError ??
                Error("sandbox ensureReady was never called"),
            );
      }
      async ensureAlive() {
        try {
          await this.client.ping();
        } catch (eA) {
          if (
            (this.logger.info?.(
              `[SandboxLifecycle] ping failed: ${eA.message}, attempting restart...`,
            ),
            this.processManager.isRunning()
              ? this._scheduleDaemonFailureReport(() => {
                  let el = this.processManager.getStartedAtMs?.();
                  return {
                    phase: "runtime-unresponsive",
                    errorCode:
                      "string" == typeof eA?.code && eA.code.length > 0
                        ? eA.code
                        : "SANDBOX_DAEMON_PING_FAILED",
                    errorMsg:
                      "string" == typeof eA?.message ? eA.message : void 0,
                    uptimeMs: el ? Date.now() - el : void 0,
                    ...(this.processManager.getCapturedStdio?.() ?? {
                      consoleMode: "pipe",
                    }),
                    ...this._daemonFailureContext(),
                  };
                })
              : this.logger.info?.(
                  "[SandboxLifecycle] ping failed but process already stopped; skip runtime-unresponsive (process-manager close handler will report runtime-exit)",
                ),
            this._restartPromise)
          )
            return (
              this.logger.info?.(
                "[SandboxLifecycle] restart already in-flight, awaiting existing promise",
              ),
              this._restartPromise
            );
          return (
            (this._restartPromise = this._restart().finally(() => {
              this._restartPromise = void 0;
            })),
            this._restartPromise
          );
        }
      }
      getOpenedSessionId() {
        return this._openedSessionId;
      }
      getClient() {
        return this.client;
      }
      async getWorkdir(eA, el) {
        if (el) {
          if (this._isProjectionActive)
            return (
              this.logger.info?.(
                `[SandboxLifecycle] getWorkdir: projection already active, returning cached workdir=${this._bootstrapWorkdir}`,
              ),
              this._bootstrapWorkdir
            );
          this.logger.info?.(
            `[SandboxLifecycle] getWorkdir: projection not active, sending StartProjection | sessionId=${eA}`,
          );
          try {
            let el = await this.client.sendRequest(
              eA,
              ad.SANDBOX_COMMANDS.START_PROJECTION,
              {},
            );
            ((this._bootstrapWorkdir = el?.workingDir),
              (this._isProjectionActive = !0),
              this.logger.info?.(
                `[SandboxLifecycle] getWorkdir: StartProjection succeeded | workdir=${this._bootstrapWorkdir}`,
              ));
          } catch (eA) {
            this.logger.error?.(
              `[SandboxLifecycle] getWorkdir: StartProjection failed: ${eA?.message ?? eA}, returning cached workdir`,
            );
          }
          return this._bootstrapWorkdir;
        }
        if (this._isProjectionActive) {
          this.logger.info?.(
            `[SandboxLifecycle] getWorkdir: projection active, sending StopProjection | sessionId=${eA}`,
          );
          try {
            let el = await this.client.sendRequest(
              eA,
              ad.SANDBOX_COMMANDS.STOP_PROJECTION,
              {},
            );
            ((this._bootstrapWorkdir = el?.workingDir),
              (this._isProjectionActive = !1),
              this.logger.info?.(
                `[SandboxLifecycle] getWorkdir: StopProjection succeeded | workdir=${this._bootstrapWorkdir}`,
              ));
          } catch (eA) {
            this.logger.error?.(
              `[SandboxLifecycle] getWorkdir: StopProjection failed: ${eA?.message ?? eA}, returning cached workdir`,
            );
          }
          return this._bootstrapWorkdir;
        }
        return (
          this.logger.info?.(
            `[SandboxLifecycle] getWorkdir: projection not active, returning cached workdir=${this._bootstrapWorkdir}`,
          ),
          this._bootstrapWorkdir
        );
      }
      isProjectionActive() {
        return this._isProjectionActive;
      }
      getReadyGeneration() {
        return this._readyGeneration;
      }
      flushAccessTelemetry(eA) {
        let el = this._openedSessionId;
        if (!el)
          return (
            this.logger.info?.(
              `[SandboxLifecycle] FlushAccessTelemetry skipped: no opened session | reason=${eA}`,
            ),
            Promise.resolve()
          );
        let ec = this._accessTelemetryFlushPromises.get(el);
        if (ec)
          return (
            this.logger.info?.(
              `[SandboxLifecycle] FlushAccessTelemetry(${el}) coalesced with in-flight request | reason=${eA}`,
            ),
            ec
          );
        let eu = this._doFlushAccessTelemetry(el, eA).finally(() => {
          this._accessTelemetryFlushPromises.get(el) === eu &&
            this._accessTelemetryFlushPromises.delete(el);
        });
        return (this._accessTelemetryFlushPromises.set(el, eu), eu);
      }
      async stop() {
        (this.logger.info?.(
          `[SandboxLifecycle] stop called | openedSessionId=${this._openedSessionId} | readyGeneration=${this._readyGeneration} | isProjectionActive=${this._isProjectionActive}`,
        ),
          this._clearAccessTelemetryFlushTimer());
        try {
          (this._isProjectionActive &&
            this._openedSessionId &&
            (await this._syncBeforeStop()),
            await this.flushAccessTelemetry("stop"),
            await this.client.disconnect().catch((eA) => {
              this.logger.info?.(
                `[SandboxLifecycle] client.disconnect failed during stop: ${eA?.message ?? eA}`,
              );
            }));
        } finally {
          (await this.processManager.stop().catch((eA) => {
            this.logger.info?.(
              `[SandboxLifecycle] processManager.stop failed: ${eA?.message ?? eA}`,
            );
          }),
            (this._ensureReadyPromise = void 0),
            (this._openedSessionId = void 0),
            (this._isProjectionActive = !1),
            this.logger.info?.(
              "[SandboxLifecycle] stop completed, state cleared",
            ));
        }
      }
      onSessionReady(eA) {
        return (
          this._sessionReadyCallbacks.push(eA),
          () => {
            let el = this._sessionReadyCallbacks.indexOf(eA);
            el >= 0 && this._sessionReadyCallbacks.splice(el, 1);
          }
        );
      }
      async _fireSessionReadyCallbacks(eA) {
        let el = {
          sessionId: this._openedSessionId,
          generation: this._readyGeneration,
          reason: eA,
        };
        for (let eA of this._sessionReadyCallbacks)
          try {
            await Promise.race([
              eA(el),
              new Promise((eA, el) =>
                setTimeout(
                  () => el(Error("sessionReady callback timeout")),
                  AV.SESSION_READY_CALLBACK_TIMEOUT_MS,
                ),
              ),
            ]);
          } catch (eA) {
            this.logger.info?.(
              `[SandboxLifecycle] sessionReady callback failed (continuing): ${eA?.message ?? eA}`,
            );
          }
      }
      _cleanupAfterTimeout(eA) {
        eA.then(
          async () => {
            (this.logger.warn?.(
              "[SandboxLifecycle] hard timeout fired but _startAndConnect later succeeded; tearing down orphan sandbox-cli to avoid leaked process",
            ),
              await this._tearDownInflight());
          },
          async () => {
            (this.logger.info?.(
              "[SandboxLifecycle] hard timeout cleanup: _startAndConnect rejected; still tearing down any partially-started state",
            ),
              await this._tearDownInflight());
          },
        );
      }
      _daemonFailureContext() {
        let eA = [...this.client.getPendingConversationRequestIds()];
        return {
          conversationId:
            this._openedSessionId ?? this._bootstrapOptions?.sessionId,
          conversationRequestId:
            1 === eA.length ? eA[0] : eA.length > 1 ? eA.join(",") : void 0,
          cwd: process.cwd(),
        };
      }
      _scheduleDaemonFailureReport(eA) {
        let el;
        try {
          el = eA();
        } catch (eA) {
          this._logTelemetryFailure(
            `build daemon failure payload failed: ${eA?.message ?? eA}`,
          );
          return;
        }
        setImmediate(() => {
          try {
            this.telemetryReporter?.reportDaemonFailure(el);
          } catch (eA) {
            this._logTelemetryFailure(
              `reportDaemonFailure failed: ${eA?.message ?? eA}`,
            );
          }
        });
      }
      _consumeProcessStartupFailure() {
        try {
          return this.processManager.consumeStartupFailure?.();
        } catch (eA) {
          this._logTelemetryFailure(
            `consume startup failure failed: ${eA?.message ?? eA}`,
          );
          return;
        }
      }
      _markProcessSessionEstablished() {
        try {
          this.processManager.markSessionEstablished?.();
        } catch (eA) {
          this._logTelemetryFailure(
            `mark session established failed: ${eA?.message ?? eA}`,
          );
        }
      }
      _logTelemetryFailure(eA) {
        try {
          this.logger.info?.(`[SandboxLifecycle] ${eA}`);
        } catch {}
      }
      _normalizeStartupFailure(eA) {
        let el = eA instanceof Error ? eA.message : String(eA);
        return "handshake" === this._startupStage &&
          (isSandboxCLIConnectTimeoutError(eA) || eA?.code === "ETIMEDOUT")
          ? {
              phase: "startup-handshake-timeout",
              errorCode: "SANDBOX_HANDSHAKE_TIMEOUT",
              errorMsg: el,
            }
          : {
              helper: {
                phase: "startup-helper-failed",
                errorCode: "SANDBOX_HELPER_START_FAILED",
                errorMsg: el,
              },
              "process-start": {
                phase: "startup-spawn-error",
                errorCode: "SANDBOX_PROCESS_START_FAILED",
                errorMsg: el,
              },
              handshake: {
                phase: "startup-handshake-failed",
                errorCode: "SANDBOX_IPC_CONNECT_FAILED",
                errorMsg: el,
              },
              "open-session": {
                phase: "startup-open-session-failed",
                errorCode: "SANDBOX_OPEN_SESSION_FAILED",
                errorMsg: el,
              },
            }[this._startupStage];
      }
      async _tearDownInflight() {
        this._clearAccessTelemetryFlushTimer();
        try {
          (await this.client.disconnect().catch((eA) => {
            this.logger.info?.(
              `[SandboxLifecycle] timeout cleanup: client.disconnect failed (ignored): ${eA?.message ?? eA}`,
            );
          }),
            await this.processManager.stop().catch((eA) => {
              this.logger.info?.(
                `[SandboxLifecycle] timeout cleanup: processManager.stop failed (ignored): ${eA?.message ?? eA}`,
              );
            }),
            (this._openedSessionId = void 0),
            (this._isProjectionActive = !1));
        } catch (eA) {
          this.logger.warn?.(
            `[SandboxLifecycle] timeout cleanup unexpected error: ${eA?.message ?? eA}`,
          );
        }
      }
      async _syncBeforeStop() {
        let eA = this._openedSessionId;
        this.logger.info?.(
          `[SandboxLifecycle] _syncBeforeStop begin | sessionId=${eA}`,
        );
        try {
          let el = (
            await this.client.sendRequest(
              eA,
              ad.SANDBOX_COMMANDS.QUERY_FILE_CHANGES,
              {},
            )
          ).changes;
          if (0 === el.length)
            return void this.logger.info?.(
              `[SandboxLifecycle] _syncBeforeStop no file changes, skip | sessionId=${eA}`,
            );
          let ec = [],
            eu = [];
          for (let eA of el) {
            let el = this._isWhitelisted(eA.relativePath);
            (el ? eu.push(eA) : ec.push(eA),
              this.logger.info?.(
                `[SandboxLifecycle] _syncBeforeStop   changed: ${eA.relativePath} (changeType=${eA.changeType}, fileSize=${eA.fileSize ?? "unknown"}, effective=${!el})`,
              ));
          }
          this.logger.info?.(
            `[SandboxLifecycle] _syncBeforeStop summary | totalChanges=${el.length} effective=${ec.length} whitelisted=${eu.length} sessionId=${eA}`,
          );
          let ed = await this.client.sendRequest(
            eA,
            ad.SANDBOX_COMMANDS.SYNC_FILE_CHANGES,
            { paths: el.map((eA) => eA.relativePath) },
          );
          this.logger.info?.(
            `[SandboxLifecycle] _syncBeforeStop completed | totalChanges=${ed.totalChanges} sessionId=${eA}`,
          );
        } catch (el) {
          this.logger.warn?.(
            `[SandboxLifecycle] _syncBeforeStop failed (non-blocking) | sessionId=${eA} error=${el?.message ?? el}`,
          );
        }
      }
      _isWhitelisted(eA) {
        for (let el of lk)
          if (el.endsWith("/")) {
            if (eA.startsWith(el)) return !0;
          } else if (eA === el) return !0;
        return !1;
      }
      async _startAndConnect() {
        let eA = this._bootstrapOptions,
          el = eA.sessionId,
          ec = eA.autoProjection ?? !1;
        (this.logger.info?.(
          `[SandboxLifecycle] _startAndConnect called, sessionId=${el}`,
        ),
          "darwin" === process.platform &&
            eA.appGroupId &&
            ((this._startupStage = "helper"),
            await this._ensureHelperRunning(eA)),
          (this._startupStage = "process-start"),
          this.logger.info?.(
            "[SandboxLifecycle] Starting sandbox-cli process...",
          ));
        let eu = await this.processManager.start({
          appHomeDir: eA.appHomeDir,
          appGroupId: eA.appGroupId,
          showConsoleWindow: eA.showConsoleWindow,
          sessionId: eA.sessionId,
          conversationRequestId: eA.conversationRequestId,
        });
        (this.logger.info?.(
          `[SandboxLifecycle] Process started, ipcAddress=${eu}`,
        ),
          (this._startupStage = "handshake"),
          this.logger.info?.("[SandboxLifecycle] Connecting client..."),
          await this.client.connect({ sessionId: el, address: eu }),
          this.logger.info?.(
            "[SandboxLifecycle] Client connected successfully",
          ));
        let ed = { name: el, workingDir: process.cwd(), autoProjection: ec };
        (this.logger.info?.(
          `[SandboxLifecycle] Sending OpenSession request | sessionId=${el} | workingDir=${ed.workingDir} | autoProjection=${ec}`,
        ),
          (this._startupStage = "open-session"));
        let ep = await this.client.sendRequest(
          el,
          ad.SANDBOX_COMMANDS.OPEN_SESSION,
          ed,
        );
        (this._markProcessSessionEstablished(),
          this.logger.info?.(
            `[SandboxLifecycle] OpenSession response | workingDir=${ep?.workingDir}`,
          ),
          (this._openedSessionId = el),
          (this._bootstrapWorkdir = ep?.workingDir),
          (this._isProjectionActive =
            ec && !!ep?.workingDir && ep.workingDir !== ed.workingDir),
          this._readyGeneration++,
          ec &&
            !this._isProjectionActive &&
            this.logger.warn?.(
              `[SandboxLifecycle] autoProjection requested but response workingDir unchanged (req=${ed.workingDir}, resp=${ep?.workingDir}), treating projection as inactive`,
            ),
          this.logger.info?.(
            `[SandboxLifecycle] bootstrap done | workdir=${this._bootstrapWorkdir} | isProjectionActive=${this._isProjectionActive} | readyGeneration=${this._readyGeneration}`,
          ),
          await this._fireSessionReadyCallbacks(
            this._isRestarting ? "restart" : "bootstrap",
          ),
          this._resetAccessTelemetryFlushTimer());
      }
      async _restart() {
        let eA = this._openedSessionId,
          el = this._readyGeneration;
        (this.logger.info?.(
          `[SandboxLifecycle] _restart begin | prevOpenedSid=${eA} | prevReadyGeneration=${el}`,
        ),
          this._clearAccessTelemetryFlushTimer(),
          (this._isRestarting = !0));
        try {
          (this.logger.info?.(
            "[SandboxLifecycle] _restart: disconnecting client",
          ),
            await this.client.disconnect().catch((eA) => {
              this.logger.info?.(
                `[SandboxLifecycle] _restart: client.disconnect failed (ignored): ${eA?.message ?? eA}`,
              );
            }),
            this.logger.info?.("[SandboxLifecycle] _restart: stopping process"),
            await this.processManager.stop().catch((eA) => {
              this.logger.info?.(
                `[SandboxLifecycle] _restart: processManager.stop failed (ignored): ${eA?.message ?? eA}`,
              );
            }),
            (this._ensureReadyPromise = void 0),
            (this._openedSessionId = void 0),
            this.logger.info?.(
              "[SandboxLifecycle] _restart: re-invoking ensureReady with original options",
            ),
            await this.ensureReady(this._bootstrapOptions),
            this.logger.info?.(
              `[SandboxLifecycle] _restart succeeded | openedSessionId=${this._openedSessionId} | readyGeneration=${this._readyGeneration} (was ${el})`,
            ));
        } catch (el) {
          this.logger.error?.(
            `[SandboxLifecycle] _restart failed: ${el.message}`,
          );
          let eA = this._normalizeStartupFailure(el);
          throw (
            this._scheduleDaemonFailureReport(() => ({
              phase: "runtime-restart-failed",
              errorCode: eA.errorCode,
              errorMsg:
                "string" == typeof el?.message ? el.message : String(el),
              ...this._daemonFailureContext(),
            })),
            Error(`sandbox-cli restart failed: ${el.message}`)
          );
        } finally {
          this._isRestarting = !1;
        }
      }
      async _doFlushAccessTelemetry(eA, el) {
        let ec;
        try {
          (await Promise.race([
            this.client.sendRequest(
              eA,
              ad.SANDBOX_COMMANDS.FLUSH_ACCESS_TELEMETRY,
              {},
            ),
            new Promise((eA, el) => {
              ec = setTimeout(
                () =>
                  el(
                    Error(
                      `FlushAccessTelemetry timeout after ${AV.TELEMETRY_FLUSH_TIMEOUT_MS}ms`,
                    ),
                  ),
                AV.TELEMETRY_FLUSH_TIMEOUT_MS,
              );
            }),
          ]),
            this.logger.info?.(
              `[SandboxLifecycle] FlushAccessTelemetry(${eA}) completed | reason=${el}`,
            ));
        } catch (ec) {
          this.logger.info?.(
            `[SandboxLifecycle] FlushAccessTelemetry(${eA}) failed (best-effort, ignored) | reason=${el} | error=${ec?.message ?? ec}`,
          );
        } finally {
          ec && clearTimeout(ec);
        }
      }
      _clearAccessTelemetryFlushTimer() {
        (this._accessTelemetryFlushTimerGeneration++,
          this._accessTelemetryFlushTimer &&
            (clearTimeout(this._accessTelemetryFlushTimer),
            (this._accessTelemetryFlushTimer = void 0)));
      }
      _resetAccessTelemetryFlushTimer() {
        this._clearAccessTelemetryFlushTimer();
        let eA = this._openedSessionId;
        eA &&
          this._armAccessTelemetryFlushTimer(
            eA,
            this._accessTelemetryFlushTimerGeneration,
          );
      }
      _armAccessTelemetryFlushTimer(eA, el) {
        if (
          el !== this._accessTelemetryFlushTimerGeneration ||
          eA !== this._openedSessionId
        )
          return;
        let ec = setTimeout(() => {
          (this._accessTelemetryFlushTimer === ec &&
            (this._accessTelemetryFlushTimer = void 0),
            this._runAccessTelemetryFlushTimer(eA, el).catch(() => void 0));
        }, AV.ACCESS_TELEMETRY_FLUSH_INTERVAL_MS);
        (ec.unref?.(), (this._accessTelemetryFlushTimer = ec));
      }
      async _runAccessTelemetryFlushTimer(eA, el) {
        el !== this._accessTelemetryFlushTimerGeneration ||
          eA !== this._openedSessionId ||
          (await this.flushAccessTelemetry("interval_10m"),
          el === this._accessTelemetryFlushTimerGeneration &&
            eA === this._openedSessionId &&
            this._armAccessTelemetryFlushTimer(eA, el));
      }
      async _ensureHelperRunning(eA) {
        if ("darwin" !== process.platform || !eA.appGroupId) return;
        let el = iD.join(
            process.env.HOME || "",
            "Library",
            "Group Containers",
            eA.appGroupId,
          ),
          ec = iD.join(el, "sandbox-ext.sock"),
          eu = iD.join(el, "sandbox-helper.spawn.lock"),
          ed = this._isHealthCheckEnabled();
        if (
          ed
            ? await this._isHelperHealthy(ec)
            : await this._isSocketListening(ec)
        )
          return void this.logger.info?.(
            `[SandboxLifecycle] Helper alive (healthCheck=${ed}), skipping spawn`,
          );
        if (ed) {
          let eA = await this._isSocketListening(ec);
          this.logger.warn?.(
            `[SandboxLifecycle] Helper unresponsive (socket listen=${eA}, ping=false), will respawn`,
          );
        }
        let ep = this._tryAcquireSpawnLock(eu);
        if (null === ep) {
          (this.logger.info?.(
            "[SandboxLifecycle] Another process is spawning Helper, waiting for its socket to come up...",
          ),
            await this._waitForSocketListening(ec, 1e4));
          return;
        }
        try {
          if (
            ed
              ? await this._isHelperHealthy(ec)
              : await this._isSocketListening(ec)
          )
            return void this.logger.info?.(
              `[SandboxLifecycle] Helper appeared while acquiring lock (healthCheck=${ed}), skipping spawn`,
            );
          await this._spawnHelper(eA, ec);
        } finally {
          try {
            nH.closeSync(ep);
          } catch {}
          try {
            nH.unlinkSync(eu);
          } catch {}
        }
      }
      async _spawnHelper(eA, el) {
        if (nH.existsSync(el)) {
          this.logger.info?.(
            "[SandboxLifecycle] Stale socket found, removing...",
          );
          try {
            nH.unlinkSync(el);
          } catch {}
        }
        let ec = this._resolveHelperPath();
        if (!ec) {
          (this.logger.warn?.(
            "[SandboxLifecycle] WorkBuddySandboxHelper not found, skipping",
          ),
            (this._startupAssetFailure = {
              phase: "startup-helper-failed",
              errorCode: "SANDBOX_HELPER_NOT_FOUND",
              errorMsg:
                "WorkBuddySandboxHelper binary missing from host app bundle",
            }));
          return;
        }
        this._ensureFrameworksLink(ec);
        let eu = this._resolveNetworkExtensionBundleId(),
          ed = [
            "--app-group-id",
            eA.appGroupId,
            "--network-extension-bundle-id",
            eu,
          ];
        this.logger.info?.(
          `[SandboxLifecycle] Starting WorkBuddySandboxHelper: ${ec} ${ed.join(" ")}`,
        );
        let ep = (0, iJ.spawn)(ec, ed, {
          stdio: ["ignore", "pipe", "pipe"],
          detached: !0,
        });
        ep.unref();
        let eg = "";
        (ep.stderr?.on("data", (eA) => {
          for (let el of ((eg += eA.toString()),
          eA.toString().trim().split("\n")))
            el && this.logger.debug?.(`[SandboxHelper] ${el}`);
        }),
          ep.stdout?.on("data", (eA) => {
            for (let el of eA.toString().trim().split("\n"))
              el && this.logger.debug?.(`[SandboxHelper:stdout] ${el}`);
          }),
          ep.on("error", (eA) => {
            this.logger.error?.(
              `[SandboxLifecycle] Helper process error: ${eA.message}`,
            );
          }),
          ep.on("close", (eA) => {
            (this.logger.info?.(
              `[SandboxLifecycle] Helper process exited with code ${eA}`,
            ),
              eg &&
                0 !== eA &&
                this.logger.warn?.(
                  `[SandboxLifecycle] Helper stderr: ${eg.slice(0, 500)}`,
                ));
          }),
          await this._waitForSocketListening(el, 5e3));
      }
      _tryAcquireSpawnLock(eA) {
        if (nH.existsSync(eA))
          try {
            let el = nH.readFileSync(eA, "utf8").trim(),
              ec = parseInt(el, 10);
            if (!isNaN(ec))
              try {
                return (process.kill(ec, 0), null);
              } catch {
                this.logger.info?.(
                  `[SandboxLifecycle] Removing stale spawn lock (pid ${ec} no longer alive)`,
                );
                try {
                  nH.unlinkSync(eA);
                } catch {}
              }
          } catch {
            try {
              nH.unlinkSync(eA);
            } catch {}
          }
        try {
          let el = nH.openSync(eA, "wx");
          return (nH.writeSync(el, String(process.pid)), el);
        } catch (eA) {
          if (eA?.code === "EEXIST") return null;
          return (
            this.logger.warn?.(
              `[SandboxLifecycle] Spawn lock acquire failed unexpectedly: ${eA?.message ?? eA}`,
            ),
            null
          );
        }
      }
      _isSocketListening(eA) {
        return new Promise((el) => {
          if (!nH.existsSync(eA)) return void el(!1);
          let ec = new lC.Socket(),
            eu = !1,
            finish = (eA) => {
              if (!eu) {
                eu = !0;
                try {
                  ec.destroy();
                } catch {}
                el(eA);
              }
            };
          (ec.setTimeout(500),
            ec.once("connect", () => finish(!0)),
            ec.once("timeout", () => finish(!1)),
            ec.once("error", () => finish(!1)));
          try {
            ec.connect(eA);
          } catch {
            finish(!1);
          }
        });
      }
      _pingHelper(eA, el = 500) {
        return new Promise((ec) => {
          let eu = new lC.Socket(),
            ed = !1,
            ep = "",
            finish = (eA) => {
              if (!ed) {
                ed = !0;
                try {
                  eu.destroy();
                } catch {}
                ec(eA);
              }
            };
          (eu.setTimeout(el),
            eu.once("timeout", () => finish(!1)),
            eu.once("error", () => finish(!1)),
            eu.once("connect", () => {
              let eA =
                JSON.stringify({
                  sessionId: "",
                  messageId: `lifecycle-ping-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                  command: "Ping",
                }) + "\n";
              try {
                eu.write(eA);
              } catch {
                finish(!1);
                return;
              }
            }),
            eu.on("data", (eA) => {
              let el = (ep += eA.toString()).indexOf("\n");
              if (el < 0) return;
              let ec = ep.slice(0, el);
              try {
                let eA = JSON.parse(ec);
                finish(eA?.success === !0);
              } catch {
                finish(!1);
              }
            }));
          try {
            eu.connect(eA);
          } catch {
            finish(!1);
          }
        });
      }
      async _isHelperHealthy(eA) {
        return (
          !!(await this._isSocketListening(eA)) && this._pingHelper(eA, 500)
        );
      }
      _isHealthCheckEnabled() {
        let eA = process.env.SANDBOX_HELPER_HEALTHCHECK_ENABLED;
        return "0" !== eA && "false" !== eA;
      }
      async _waitForSocketListening(eA, el) {
        let ec = Date.now(),
          eu = 100;
        for (; Date.now() - ec < el; ) {
          if (await this._isSocketListening(eA))
            return void this.logger.info?.(
              `[SandboxLifecycle] Helper IPC server ready (waited ${Date.now() - ec}ms)`,
            );
          await new Promise((eA) => setTimeout(eA, eu));
        }
        this.logger.warn?.(
          `[SandboxLifecycle] Helper socket not ready after ${el}ms, proceeding anyway`,
        );
      }
      _resolveHelperPath() {
        let eA = process.env.SANDBOX_HELPER_PATH;
        if (eA && nH.existsSync(eA)) return eA;
        let el = process.env.SANDBOX_ELECTRON_APP_PATH;
        if (el) {
          let eA = iD.join(el, "Contents", "MacOS", "WorkBuddySandboxHelper");
          if (nH.existsSync(eA))
            return (
              this.logger.info?.(
                `[SandboxLifecycle] Found Helper in host app: ${eA}`,
              ),
              eA
            );
        }
      }
      _resolveNetworkExtensionBundleId() {
        try {
          let { PathUtils: eA } = ec(93039),
            el = eA.getRootPathSync(),
            eu = iD.join(el, "sandbox-config.json");
          if (nH.existsSync(eu)) {
            let eA = JSON.parse(nH.readFileSync(eu, "utf8"));
            if (eA.networkExtensionBundleId) return eA.networkExtensionBundleId;
          }
        } catch {}
        return "com.tencent.workbuddy.mac.NetworkExtension";
      }
      _ensureFrameworksLink(eA) {
        try {
          let el = iD.dirname(eA),
            ec = iD.join(el, "..", "Frameworks"),
            eu = iD.join(ec, "SandboxExt.framework");
          if (!nH.existsSync(eu)) {
            (this.logger.warn?.(
              `[SandboxLifecycle] SandboxExt.framework not deployed at ${eu}; Helper @rpath load will fail. Check apps/workbuddy-desktop/scripts/after-pack.js step 7b.`,
            ),
              (this._startupAssetFailure = {
                phase: "startup-helper-failed",
                errorCode: "SANDBOX_FRAMEWORK_NOT_DEPLOYED",
                errorMsg: `SandboxExt.framework missing at ${eu}`,
              }));
            return;
          }
          this.logger.info?.(
            `[SandboxLifecycle] SandboxExt.framework verified at ${eu}`,
          );
        } catch (eA) {
          this.logger.warn?.(
            `[SandboxLifecycle] Failed to verify Frameworks layout: ${eA.message}`,
          );
        }
      }
    });
  ((lM.ENSURE_READY_HARD_TIMEOUT_MS = 3e4),
    (lM.SESSION_READY_CALLBACK_TIMEOUT_MS = 5e3),
    (lM.TELEMETRY_FLUSH_TIMEOUT_MS = 1e3),
    (lM.ACCESS_TELEMETRY_FLUSH_INTERVAL_MS = 6e5));
  return {
    SandboxCLIClientImpl: lB,
    SandboxCLIProcessManagerImpl: lR,
    SandboxCLILifecycleImpl: lM,
    SandboxCliStdioCapture,
    isSandboxCLIConnectTimeoutError,
    getModule: ec,
  };
}

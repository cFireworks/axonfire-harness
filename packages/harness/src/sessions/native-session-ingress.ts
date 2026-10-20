// @ts-nocheck
// Complete inert source declarations. Explicit dependency injection; no original decorators/bootstrap.
export const SESSION_INGRESS_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export const SESSION_INGRESS_BLOCKS = [
  [66545, "rg", 7068476, 7070083],
  [6513, "serialiseKey", 9451048, 9451120],
  [6513, "SandboxApprovalStoreImpl", 9451120, 9451379],
  [71915, "AF", 10995833, 10995874],
  [71915, "installRunStateProperty", 10995874, 10996128],
  [71915, "AU", 10996526, 10998097],
  [71915, "SessionNotFoundError", 10998260, 10998423],
  [71915, "InvalidSessionIdError", 10998423, 10998693],
  [71915, "ForkOperationError", 10998693, 10998837],
  [71915, "Az", 11000080, 11009241],
] as const;
export const SESSION_INGRESS_BINDINGS = [
  [66545, "AH", 93039],
  [71915, "A$", 53766],
  [71915, "AB", 93039],
  [71915, "AJ", 8844],
  [71915, "AK", 28579],
  [71915, "AL", 35151],
  [71915, "AN", 92537],
  [71915, "AO", 57804],
  [71915, "AP", 6513],
  [71915, "t3", 99006],
  [71915, "t4", 71389],
  [71915, "t5", 80699],
  [71915, "t7", 29827],
] as const;
export const SESSION_INGRESS_STATICS = [
  [66545, "rg.STANDARD_HEADERS", 7070083, 7070563],
  [71915, "Az.setupFired", 11009241, 11009257],
] as const;
export const SESSION_INGRESS_CLASSES = [
  [66545, "rg", 7068486, 7070082, 3],
  [6513, "SandboxApprovalStoreImpl", 9451149, 9451378, 5],
  [71915, "Aj", 10996570, 10998096, 1],
  [71915, "SessionNotFoundError", 10998285, 10998422, 1],
  [71915, "InvalidSessionIdError", 10998449, 10998692, 1],
  [71915, "ForkOperationError", 10998716, 10998836, 1],
  [71915, "Az", 11000090, 11009240, 18],
] as const;
export const SESSION_INGRESS_UNINITIALIZED = [
  [66545, "eO", "var", 7017555, 7017557],
  [71915, "eD", "var", 10949334, 10949336],
] as const;
export const SESSION_INGRESS_CONTROLLER = [
  "internal/agent",
  7072362,
  7072397,
] as const;
export const SESSION_INGRESS_ROUTES = [
  ["GET", "models", "getModels", 7071676, 7071696],
  ["POST", "", "run", 7071964, 7071977],
] as const;
export const SESSION_INGRESS_PARAMETERS = [
  ["run", 0, "Body", 7071978, 7072002],
  ["run", 1, "Header", 7072003, 7072029],
] as const;
export function createNativeSessionIngress(runtime: any = {}) {
  const Date = runtime.Date ?? globalThis.Date,
    setImmediate = runtime.setImmediate ?? globalThis.setImmediate;
  const ownedModules: any = {};
  const ec: any = (id: number) =>
    runtime.modules?.[id] ??
    ownedModules[id] ??
    runtime.getModule?.(id) ??
    new Proxy(
      {},
      {
        get(_target, key) {
          throw Error(
            "Explicit session ingress dependency required: " +
              id +
              "." +
              String(key),
          );
        },
      },
    );
  const scope66545 = (() => {
    const AH = ec(93039);
    var eO;
    let rg = (eO = class {
      filterHeaders(eA) {
        let el = {};
        for (let [ec, eu] of Object.entries(eA)) {
          let eA = ec.toLowerCase();
          eO.STANDARD_HEADERS.has(eA) || (el[ec] = eu);
        }
        return el;
      }
      async getModels() {
        try {
          let eA = await this.agentManager.getDefault();
          return {
            models: (await this.agentManager.getModels(eA.name)).map((eA) => {
              let { url: el, apiKey: ec, ...eu } = eA;
              return {
                id: eA.id,
                name: eA.name || eA.id,
                description:
                  [eA.description, eA.credits].filter(Boolean).join(" \xb7 ") ||
                  void 0,
                _meta: { "codebuddy.ai": eu },
              };
            }),
          };
        } catch (eA) {
          return (
            this.logger.error?.("[AgentController] getModels failed:", eA),
            { models: [] }
          );
        }
      }
      async run(eA, el) {
        this.logger.info(
          `[Startup] AgentController.run: received request (print=${eA.print}, hasPrompt=${!!eA.prompt})`,
        );
        let ec = this.sessionManager.getCurrent();
        if (el) {
          let eA = this.filterHeaders(el);
          Object.keys(eA).length > 0 &&
            (ec.requestOptions || (ec.requestOptions = {}),
            (ec.requestOptions.headers = eA));
        }
        if (eA.prompt) {
          let el = eA.prompt,
            eu = { context: ec };
          ((ec.traceId = void 0),
            (ec.parentSpanId = void 0),
            eA.traceId && (ec.traceId = eA.traceId),
            eA.parentSpanId && (ec.parentSpanId = eA.parentSpanId),
            this.logger.info(
              `Incoming Trace ID: ${eA.traceId}. span ID: ${eA.parentSpanId}`,
            ),
            void 0 !== eA.maxTurns && (eu.maxTurns = Number(eA.maxTurns)));
          let runAgent = async () => {
            if ("stream-json" === eA.inputFormat) {
              let eA = AH.StreamJsonUtils.parseMessagesFromPipeInput(el);
              await this.agentService.runDefault(eA, eu);
            } else await this.agentService.runDefault(el, eu);
          };
          eA.print
            ? (this.logger.info(
                "[Startup] AgentController: print mode, awaiting agent completion...",
              ),
              await runAgent(),
              this.logger.info(
                "[Startup] AgentController: agent run completed",
              ))
            : setImmediate(() => runAgent());
        }
        return ec;
      }
    });
    rg.STANDARD_HEADERS = new Set([
      "host",
      "user-agent",
      "accept",
      "accept-encoding",
      "accept-language",
      "connection",
      "content-length",
      "content-type",
      "cache-control",
      "pragma",
      "referer",
      "origin",
      "cookie",
      "authorization",
      "www-authenticate",
      "proxy-authenticate",
      "age",
      "date",
      "expires",
      "last-modified",
      "etag",
      "vary",
      "server",
      "transfer-encoding",
      "via",
      "warning",
      "allow",
      "content-encoding",
      "content-language",
      "content-location",
      "content-md5",
      "content-range",
      "location",
      "retry-after",
      "set-cookie",
    ]);
    return { AgentController: rg };
  })();
  const scope6513 = (() => {
    function serialiseKey(eA) {
      return `${eA.canonicalCommand}\u0000${eA.cwd}`;
    }
    let SandboxApprovalStoreImpl = class SandboxApprovalStoreImpl {
      constructor() {
        this._map = new Map();
      }
      get(eA) {
        return this._map.get(serialiseKey(eA));
      }
      put(eA) {
        this._map.set(serialiseKey(eA), "approved_for_session");
      }
      clear() {
        this._map.clear();
      }
      size() {
        return this._map.size;
      }
    };

    return { SandboxApprovalStoreImpl: SandboxApprovalStoreImpl };
  })();
  ownedModules[6513] = scope6513;
  const scope71915 = (() => {
    const A$ = ec(53766);
    const AB = ec(93039);
    const AJ = ec(8844);
    const AK = ec(28579);
    const AL = ec(35151);
    const AN = ec(92537);
    const AO = ec(57804);
    const AP = ec(6513);
    const t3 = ec(99006);
    const t4 = ec(71389);
    const t5 = ec(80699);
    const t7 = ec(29827);
    var eD;
    let AF = { status: t4.SessionRunStatus.IDLE };
    function installRunStateProperty(eA, el) {
      Object.defineProperty(eA, "runState", {
        configurable: !0,
        enumerable: !0,
        get: () => el.value,
        set(eA) {
          let ec = eA ?? AF,
            eu = el.value;
          eu !== ec &&
            (eu.status !== ec.status ||
              eu.lastTransition?.at !== ec.lastTransition?.at) &&
            el.next(ec);
        },
      });
    }
    let AU = { status: t4.SessionRunStatus.IDLE },
      Aj = class {
        async create(eA) {
          let el = (0, AB.createAbortController)(),
            ec = eA?.history ?? [],
            eu = AB.HistoryUtils.getActiveAgentOnlyHistory(ec),
            ed = eA?.queue ?? [],
            ep = eA?.runState ?? AU,
            eg = new t7.BehaviorSubject(ep),
            { runState: eh, ...ef } = eA ?? {},
            em = {
              createdAt: Date.now(),
              updatedAt: Date.now(),
              ...ef,
              id: eA?.id ?? (0, t5.generateUUUID)(),
              history: ec,
              usage: AB.UsageUtils.getTotalUsage(eu),
              resultSubject: new t7.BehaviorSubject(void 0),
              combineSubject: new AO.ReplaySubject(0),
              inputSubject: new AN.Subject(),
              historyReloadSubject: new AN.Subject(),
              localExecuteSubject: new t7.BehaviorSubject([]),
              modelSubject: new AN.Subject(),
              interruptionSubject: new t7.BehaviorSubject(void 0),
              abortController: el,
              abortSignal: el.signal,
              agentStateSubject: new t7.BehaviorSubject(eA?.agentState),
              runStateSubject: eg,
              options: eA?.options || {},
              queue: ed,
              queueSubject: new t7.BehaviorSubject(ed),
              queuedTextRefillRequest$: new AN.Subject(),
              requestOptions: eA?.requestOptions || {},
              permissionModeSubject: new t7.BehaviorSubject(
                eA?.options?.permissionMode &&
                Object.values(AL.PermissionMode).includes(
                  eA.options.permissionMode,
                )
                  ? eA.options.permissionMode
                  : AL.PermissionMode.Default,
              ),
              backgroundTaskSubject: new AN.Subject(),
              progressSubject: new t7.BehaviorSubject(void 0),
              phaseSubject: new t7.BehaviorSubject({
                phase: "idle",
                startedAt: Date.now(),
              }),
              conditionalRules: {
                pendingTriggers: new Set(),
                processedRules: new Set(),
              },
              resultAbortSignalMap: new WeakMap(),
              toolPermissionContext:
                AB.PermissionUtils.createDefaultToolPermissionContext(),
              sandboxApprovalStore: new AP.SandboxApprovalStoreImpl(),
            };
          return (installRunStateProperty(em, eg), em);
        }
      };
    let SessionNotFoundError = class SessionNotFoundError extends t5.CustomError {
      constructor(eA) {
        (super("No conversation found with session ID: " + eA),
          (this.sessionId = eA));
      }
    };
    let InvalidSessionIdError = class InvalidSessionIdError extends t5.CustomError {
      constructor(eA) {
        (super(
          `Invalid session ID format: "${eA}". Session IDs support numbers, letters, hyphens, underscores, and colons, but must start with a letter or number.`,
        ),
          (this.sessionId = eA));
      }
    };
    let ForkOperationError = class ForkOperationError extends t5.CustomError {
      constructor(eA = "No source session found for fork operation") {
        super(eA);
      }
    };
    let Az = (eD = class {
      constructor() {
        ((this.priority = t3.SESSION_MIDDLEWARE_PRIORITY),
          (this.sessionIdPattern = /^[a-zA-Z0-9][a-zA-Z0-9\-_:]*$/));
      }
      async handle(eA, el) {
        let ec;
        if (!(await this.canHandle())) return void (await el());
        let eu = Date.now();
        this.logger.info("[Startup] SessionMiddleware.handle: START");
        try {
          ec = t5.ContainerUtil.get(A$.StartupProfiler);
        } catch {}
        ec?.markStart("session_middleware", "Session Middleware");
        let ed = eA.request.body;
        this.normalizeToolSpecs(ed);
        let ep = Date.now(),
          { session: eg, source: eh } = await this.getOrCreateSession(ed);
        (this.logger.info(
          `[Startup] SessionMiddleware.handle: getOrCreateSession completed in ${Date.now() - ep}ms (source=${eh})`,
        ),
          (eg.options = { ...eg.options, ...ed }),
          this.channelManager &&
            (ed.channels || ed.dangerouslyLoadDevelopmentChannels) &&
            this.channelManager.configureFromSessionOptions(ed),
          (ep = Date.now()),
          await this.toolPermissionService.initializeContext(eg),
          this.logger.info(
            `[Startup] SessionMiddleware.handle: initializeContext completed in ${Date.now() - ep}ms`,
          ),
          (ep = Date.now()),
          this.executionSessionStartHook(eg, eh, !!ed.print, !!ed.acp),
          this.logger.info(
            `[Startup] SessionMiddleware.handle: executionSessionStartHook fired in ${Date.now() - ep}ms (async, not awaited)`,
          ),
          (ep = Date.now()),
          await this.updatePermissionMode(eg),
          this.logger.info(
            `[Startup] SessionMiddleware.handle: updatePermissionMode completed in ${Date.now() - ep}ms`,
          ),
          this.applyOverrideModel(eg),
          this.sessionManager.setCurrent(eg),
          ec?.markEnd("session_middleware"),
          this.logger.info(
            `[Startup] SessionMiddleware.handle: pre-next() total=${Date.now() - eu}ms, calling next()`,
          ),
          (ep = Date.now()),
          await el(),
          this.logger.info(
            `[Startup] SessionMiddleware.handle: next() completed in ${Date.now() - ep}ms, overall=${Date.now() - eu}ms`,
          ));
      }
      async canHandle() {
        return this.requestMatcher.match(
          await this.pathResolver.resolve("/internal/agent"),
        );
      }
      async getOrCreateSession(eA) {
        let { forkSession: el, resume: ec, sessionId: eu } = eA;
        if (
          (this.logger.info(
            `[SessionMiddleware] getOrCreateSession: sessionId=${eu}, forkSession=${el}, resume=${ec}`,
          ),
          el)
        )
          return this.handleForkSession(ec, eu, eA.continue, eA);
        let ed = this.extractSessionId(eA);
        ed && this.ensureValidSessionId(ed);
        let ep = await this.findExistingSession(ed, eA.continue);
        if (ep)
          return (
            this.logger.info(
              "[SessionMiddleware] Found existing session, returning it",
            ),
            { session: ep, source: "resume" }
          );
        if ("string" == typeof ec) throw new SessionNotFoundError(ec);
        return (
          this.logger.info(
            "[SessionMiddleware] No existing session found, will create new one",
          ),
          this.createNewSession(ed, eA)
        );
      }
      async handleForkSession(eA, el, ec, eu) {
        let ed;
        if ("string" == typeof eA) {
          if (!(ed = await this.sessionManager.get(eA)))
            throw new SessionNotFoundError(eA);
        } else
          "string" == typeof el
            ? (this.ensureValidSessionId(el),
              (ed = await this.sessionManager.get(el)))
            : ec && (ed = await this.sessionManager.getMostRecent());
        if (!ed) throw new ForkOperationError();
        let ep = "string" == typeof eA && "string" == typeof el ? el : void 0;
        return (
          ep && this.ensureValidSessionId(ep),
          this.forkSession(ed, ep, eu)
        );
      }
      ensureValidSessionId(eA) {
        if (!this.sessionIdPattern.test(eA))
          throw new InvalidSessionIdError(eA);
      }
      extractSessionId(eA) {
        let { sessionId: el, resume: ec } = eA;
        return "string" == typeof el ? el : "string" == typeof ec ? ec : void 0;
      }
      async findExistingSession(eA, el) {
        this.logger.info(
          `[SessionMiddleware] findExistingSession called with sessionId: ${eA}, shouldContinue: ${el}`,
        );
        let ec = this.sessionManager.sessionSubject?.value;
        if (eA) {
          if (ec && ec.id === eA)
            return (
              this.logger.info(
                `[SessionMiddleware] Reusing in-memory session: ${eA}`,
              ),
              ec
            );
          let el = await this.sessionManager.get(eA);
          return (
            this.logger.info(
              `[SessionMiddleware] sessionManager.get(${eA}) returned: ${el ? "found" : "undefined"}, history length: ${el?.history?.length ?? "N/A"}`,
            ),
            el
          );
        }
        if (el)
          return ec
            ? (this.logger.info(
                `[SessionMiddleware] Reusing in-memory current session: ${ec.id}`,
              ),
              ec)
            : this.sessionManager.getMostRecent();
      }
      async createNewSession(eA, el) {
        let ec = await this.sessionManager.create({
          id: eA,
          options: { sessionPersistence: el.sessionPersistence },
        });
        return (
          await this.sessionManager.save(ec),
          { session: ec, source: "startup" }
        );
      }
      async forkSession(eA, el, ec) {
        let eu = await this.sessionManager.create({
          id: el,
          history: [...eA.history],
          meta: { ...eA.meta, forkedFrom: eA.id },
          options: { sessionPersistence: ec.sessionPersistence },
        });
        return (
          await this.sessionManager.save(eu, !0),
          { session: eu, source: "startup" }
        );
      }
      async executionSessionStartHook(eA, el, ec, eu) {
        eA.hookContexts || (eA.hookContexts = {});
        let ed = (async () => {
          let ed = Date.now();
          try {
            await t5.ContainerUtil.get(
              AK.PluginRuntimeRefreshService,
            ).waitForRefreshSettled();
          } catch (eA) {
            this.logger.warn?.(
              `[Startup] plugin runtime barrier unavailable: ${eA instanceof Error ? eA.message : String(eA)}`,
            );
          }
          if (
            (ec || eu
              ? this.logger.info(
                  `[Startup] executionSessionStartHook: skipping directoryTrust (print=${ec}, acp=${eu})`,
                )
              : (this.logger.info(
                  "[Startup] executionSessionStartHook: waiting for directoryTrust (print=false, acp=false)",
                ),
                await this.directoryTrustService.isTrustDirectoryPromise,
                this.logger.info(
                  `[Startup] executionSessionStartHook: directoryTrust resolved in ${Date.now() - ed}ms`,
                )),
            !eD.setupFired)
          ) {
            eD.setupFired = !0;
            try {
              await this.sessionHookManager.executeSetupHooks(eA, "init");
            } catch (eA) {
              this.logger.warn?.(
                `[Startup] executeSetupHooks(init) failed: ${eA}`,
              );
            }
          }
          let ep = Date.now();
          (await this.sessionManager.emitSessionStart(eA, el),
            this.logger.info(
              `[Startup] executionSessionStartHook: emitSessionStart completed in ${Date.now() - ep}ms, total=${Date.now() - ed}ms`,
            ));
        })();
        ((eA.hookContexts.sessionStartReadyPromise = ed),
          ed.finally(() => {
            eA.hookContexts?.sessionStartReadyPromise === ed &&
              delete eA.hookContexts.sessionStartReadyPromise;
          }));
      }
      async updatePermissionMode(eA) {
        let el = this.sessionManager.getOverridePermissionMode(eA.id);
        if (void 0 !== el)
          return void eA.permissionModeSubject.next(
            await this.gateAutoMode(el),
          );
        let ec = eA.options.permissionMode;
        if (ec) {
          let el = this.validatePermissionMode(ec);
          if (
            el === AL.PermissionMode.Plan &&
            !eA.meta?.prePlanPermissionMode
          ) {
            eA.meta = eA.meta || {};
            let el = eA.options.permissionModeBeforePlan;
            if (el)
              eA.meta.prePlanPermissionMode = this.validatePermissionMode(el);
            else {
              let el = eA.permissionModeSubject.value;
              el &&
                el !== AL.PermissionMode.Default &&
                el !== AL.PermissionMode.Plan &&
                (eA.meta.prePlanPermissionMode = el);
            }
          }
          eA.permissionModeSubject.next(await this.gateAutoMode(el));
          return;
        }
        let eu = eA.permissionModeSubject.value;
        if (eu && eu !== AL.PermissionMode.Default) {
          let el = await this.gateAutoMode(eu);
          el !== eu && eA.permissionModeSubject.next(el);
          return;
        }
        let ed = await this.resolvePermissionMode(eA);
        eA.permissionModeSubject.next(ed);
      }
      async gateAutoMode(eA) {
        return eA !== AL.PermissionMode.Auto ||
          (await this.autoModePermissionService.isAutoModeAvailable()).available
          ? eA
          : (this.logger.warn?.(
              "[permission-mode] auto unavailable (e.g. disableAutoMode); falling back to default",
            ),
            AL.PermissionMode.Default);
      }
      applyOverrideModel(eA) {
        (eA.requestOptions ?? (eA.requestOptions = {}),
          (eA.requestOptions.model = this.sessionManager.getOverrideModel(
            eA.id,
          )));
      }
      async resolvePermissionMode(eA) {
        if (eA.options.dangerouslySkipPermissions)
          return AL.PermissionMode.BypassPermissions;
        let el = eA.options.permissionMode;
        if (el) {
          let eA = this.validatePermissionMode(el);
          return eA !== AL.PermissionMode.Auto ||
            (await this.autoModePermissionService.isAutoModeAvailable())
              .available
            ? eA
            : (this.logger.warn?.(
                "[permission-mode] auto requested via CLI but unavailable (e.g. disableAutoMode); falling back to default",
              ),
              AL.PermissionMode.Default);
        }
        let ec = await this.settingsManager.get("permissions"),
          eu = this.validatePermissionMode(ec?.defaultMode);
        return eu === AL.PermissionMode.Auto
          ? (await this.autoModePermissionService.isSettingsAutoGrantAllowed())
            ? (await this.autoModePermissionService.isAutoModeAvailable())
                .available
              ? AL.PermissionMode.Auto
              : (this.logger.warn?.(
                  '[permission-mode] defaultMode "auto" unavailable (e.g. disableAutoMode); falling back to default',
                ),
                AL.PermissionMode.Default)
            : (this.logger.warn?.(
                '[permission-mode] settings defaultMode "auto" ignored because only CLI/user settings can grant auto mode; falling back to default',
              ),
              AL.PermissionMode.Default)
          : eu;
      }
      validatePermissionMode(eA) {
        return eA && Object.values(AL.PermissionMode).includes(eA)
          ? eA
          : AL.PermissionMode.Default;
      }
      normalizeToolSpecs(eA) {
        if (
          "string" == typeof eA.tools &&
          "default" !== eA.tools &&
          eA.tools.length > 0
        ) {
          let el = eA.tools
            .split(",")
            .map((eA) => eA.trim())
            .filter(Boolean);
          try {
            let ec = (0, AJ.parseToolSpecs)(el),
              eu = (0, AJ.augmentParsedSpecsForDefer)(ec);
            for (let el of ((eA.tools = eu.names.join(",")),
            (eA.toolDeferOverlay = eu.overlay),
            eu.warnings))
              this.logger.warn(`[ToolSpec] ${el.code}: ${el.message}`);
          } catch (eA) {
            if (eA instanceof AJ.ToolSpecParseError)
              throw Error(
                `Invalid --tools value: ${eA.message}. Defer(X)/NoDefer(X) modifiers are valid; permission filters like Read(*.md) belong in --allowed-tools.`,
              );
            throw eA;
          }
        }
        (this.assertNoDeferModifier(
          eA.allowedTools,
          "--allowed-tools / settings.permissions.allow",
        ),
          this.assertNoDeferModifier(
            eA.disallowedTools,
            "--disallowed-tools / settings.permissions.deny",
          ));
      }
      assertNoDeferModifier(eA, el) {
        if (!eA || 0 === eA.length) return;
        let ec = /^\s*(?:Defer|NoDefer)\s*\(/;
        for (let eu of eA)
          if ("string" == typeof eu && ec.test(eu))
            throw Error(
              `Invalid permission rule ${JSON.stringify(eu)} in ${el}: Defer(...) / NoDefer(...) modifiers belong in --tools, not in permission rule fields. Permission rules accept plain tool names with optional argument filters (e.g. "Read(*.md)").`,
            );
      }
    });
    Az.setupFired = !1;
    return { SessionFactoryImpl: Aj, SessionMiddleWare: Az };
  })();
  return { ...scope66545, ...scope6513, ...scope71915 };
}

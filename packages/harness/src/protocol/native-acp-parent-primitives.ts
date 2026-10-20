// @ts-nocheck
// Original ACP parent primitives; complete classes/business declarations/factories, no DI decorators/bootstrap.
export const ACP_PARENT_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export const ACP_PARENT_SCOPES = [
  {
    "id": 32917,
    "blocks": [
      ["expression", 10930892, 10930900],
      ["expression", 10930901, 10931009],
      ["declaration", 10931436, 10932278],
      ["declaration", 10932885, 10933091],
    ],
    "fragments": [
      ["var", "ed", 10931017, 10931029],
      ["var", "ep", 10931030, 10931042],
      ["var", "eg", 10931043, 10931055],
      ["var", "ef", 10932355, 10932367],
    ],
    "classes": [
      ["eh", 10931443, 10932277, 3],
      ["em", 10932892, 10933090, 3],
    ],
    "bindings": [
      ["ed", 45654],
      ["ep", 80699],
      ["eg", 47005],
      ["ef", 67062],
    ],
  },
  {
    "id": 74183,
    "blocks": [
      ["expression", 7400501, 7400509],
      ["expression", 7400510, 7400545],
      ["declaration", 7400995, 7401331],
      ["declaration", 7401331, 7401738],
    ],
    "fragments": [
      ["var", "eu", 7400550, 7400562],
      ["var", "ed", 7400563, 7400575],
      ["var", "ep", 7400576, 7400588],
      ["var", "eg", 7400589, 7400601],
      ["var", "eh", 7400602, 7400614],
    ],
    "classes": [["ef", 7401002, 7401330, 3]],
    "bindings": [
      ["eu", 80699],
      ["ed", 29827],
      ["ep", 39983],
      ["eg", 44093],
      ["eh", 39023],
    ],
  },
  {
    "id": 50744,
    "blocks": [
      ["expression", 204211, 204260],
      ["expression", 204261, 204299],
      ["declaration", 204300, 204406],
      ["expression", 204406, 204440],
    ],
    "fragments": [],
    "classes": [["ef", 204345, 204405, 1]],
    "bindings": [
      ["ep", 1562],
      ["eg", 33584],
      ["eh", 80699],
    ],
  },
] as const;
export const ACP_PARENT_FACTORIES = [
  [43533, 10152425, 10153514],
  [45654, 10933332, 10933439],
  [1562, 202525, 203047],
] as const;
export const ACP_PARENT_CONFIGURATION = [
  [50744, "clientConfig", 204445, 204479, '"cell.client.config"'],
] as const;
export function createNativeAcpParentPrimitives(runtime: any = {}) {
  const process = { env: runtime.env ?? {} };
  const setInterval = runtime.setInterval ?? globalThis.setInterval,
    clearInterval = runtime.clearInterval ?? globalThis.clearInterval;
  const cache = new Map(),
    factories: any = {
      43533(eA, el, ec) {
        "use strict";
        (ec.r(el),
          ec.d(el, {
            CUSTOM_REQUEST_HEADER: () => e_,
            CloudGatewayApiClient: () => eB,
            CloudGatewayClient: () => ew,
            DEFAULT_GATEWAY_PORT: () => ev,
            DEFAULT_MAX_CONCURRENT: () => eQ,
            DEFAULT_RATE_LIMIT_PER_MINUTE: () => eS,
            GATEWAY_PROTOCOL_VERSION: () => eI,
            GatewayAcpBridge: () => eu,
            GatewayAdapterRegistry: () => em,
            GatewayAuditLog: () => ey,
            GatewayAuthMiddleware: () => eh,
            GatewayConfigService: () => ed,
            GatewayCorsService: () => eE,
            GatewayLocalServer: () => eg,
            GatewayRateLimiter: () => ef,
            GatewayTunnelService: () => ep,
            HostValidationMiddleware: () => eC,
            withSecurityHeader: () => withSecurityHeader,
          }));
        let eu = Symbol("GatewayAcpBridge"),
          ed = Symbol("GatewayConfigService"),
          ep = Symbol("GatewayTunnelService"),
          eg = Symbol("GatewayLocalServer"),
          eh = Symbol("GatewayAuthMiddleware"),
          ef = Symbol("GatewayRateLimiter"),
          em = Symbol("GatewayAdapterRegistry"),
          eE = Symbol("GatewayCorsService"),
          eC = Symbol("HostValidationMiddleware"),
          ey = Symbol("GatewayAuditLog"),
          ew = Symbol("CloudGatewayClient"),
          eB = Symbol("CloudGatewayApiClient"),
          e_ = "x-codebuddy-request";
        function withSecurityHeader(eA) {
          return { ...eA, [e_]: "1" };
        }
        let eI = "1.0",
          ev = 8321,
          eS = 60,
          eQ = 3;
      },
      45654(eA, el, ec) {
        "use strict";
        (ec.r(el), ec.d(el, { EndpointProvider: () => eu }));
        let eu = Symbol("EndpointProvider");
      },
      1562(eA, el) {
        "use strict";
        (Object.defineProperty(el, "__esModule", { value: !0 }),
          (el.ResponseEntityUtil =
            el.RestOperationsFactory =
            el.RestOperations =
              void 0),
          (el.RestOperations = Symbol("RestOperations")),
          (el.RestOperationsFactory = Symbol("RestOperationsFactory")));
        let ResponseEntityUtil = class ResponseEntityUtil {
          static ok(eA, el) {
            return { status: 200, headers: el || {}, body: eA };
          }
          static created(eA, el) {
            return { status: 201, headers: el || {}, body: eA };
          }
          static noContent() {
            return { status: 204, headers: {}, body: void 0 };
          }
        };
        el.ResponseEntityUtil = ResponseEntityUtil;
      },
    };
  function resolve(id: number): any {
    if (runtime.modules?.[id] !== undefined) return runtime.modules[id];
    if (cache.has(id)) return cache.get(id).exports;
    const m = { exports: {} };
    if (factories[id] || scopes[id]) {
      cache.set(id, m);
      if (factories[id]) factories[id](m, m.exports, resolve);
      else scopes[id](m.exports);
      return m.exports;
    }
    return (
      runtime.getModule?.(id) ??
      new Proxy(
        {},
        {
          get(_target, key) {
            throw Error(
              "Explicit ACP parent dependency required: " +
                id +
                "." +
                String(key),
            );
          },
        },
      )
    );
  }
  resolve.r = (value: any) => {
    Object.defineProperty(value, "__esModule", { value: true });
    if (typeof Symbol !== "undefined" && Symbol.toStringTag)
      Object.defineProperty(value, Symbol.toStringTag, { value: "Module" });
  };
  resolve.d = (value: any, getters: any) => {
    for (const key of Object.keys(getters))
      if (!Object.hasOwn(value, key))
        Object.defineProperty(value, key, {
          enumerable: true,
          get: getters[key],
        });
  };
  function scope32917(el: any) {
    const ec = resolve;
    ec.r(el);
    ec.d(el, {
      EndpointProvider: () => ed.EndpointProvider,
      EndpointProviderImpl: () => eh,
      CliServerErrorHandler: () => em,
    });
    var ed = ec(45654);
    var ep = ec(80699);
    var eg = ec(47005);
    let eh = class {
      constructor() {
        this.endpointDeferred = new ep.Deferred();
      }
      async get() {
        return this.endpointDeferred.promise;
      }
      async setServer(eA) {
        let el = eA.address();
        if (
          (el ||
            (el = await new Promise((el, ec) => {
              if (eA.listening) return void el(eA.address());
              let onListening = () => {
                  (cleanup(), el(eA.address()));
                },
                onError = (eA) => {
                  (cleanup(), ec(eA));
                },
                cleanup = () => {
                  (eA.removeListener("listening", onListening),
                    eA.removeListener("error", onError),
                    clearInterval(ed));
                };
              (eA.on("listening", onListening), eA.on("error", onError));
              let eu = 0,
                ed = setInterval(() => {
                  eu++;
                  let ed = eA.address();
                  ed
                    ? (cleanup(), el(ed))
                    : eu > 50 &&
                      (cleanup(),
                      ec(Error("Server address not available after 500ms")));
                }, 10);
              "function" == typeof ed.unref && ed.unref();
            })),
          !el || "string" == typeof el)
        )
          throw Error("not bind to server");
        let ec = `http://${process.env.SERVER__HOST || "127.0.0.1"}:${el.port}`;
        this.endpointDeferred.resolve(ec);
      }
    };
    var ef = ec(67062);
    let em = class {
      constructor() {
        this.priority = 2;
      }
      async canHandle(eA, el) {
        return !0;
      }
      async handle(eA, el) {
        (this.logger.error(el),
          (eA.response.statusCode = ef.HttpStatus.INTERNAL_SERVER_ERROR),
          eA.response.end(el.message));
      }
    };
    return el;
  }
  function scope74183(el: any) {
    const ec = resolve;
    ec.r(el);
    ec.d(el, { CliRuntimeOptions: () => ef });
    var eu = ec(80699);
    var ed = ec(29827);
    var ep = ec(39983);
    var eg = ec(44093);
    var eh = ec(39023);
    let ef = class {
      constructor() {
        ((this.snapshot = {}),
          (this.rawOptsSubject = new ed.BehaviorSubject({})),
          (this.onDidChange = this.rawOptsSubject.pipe(
            (0, ep.distinctUntilChanged)(eh.isDeepStrictEqual),
            (0, eg.map)(() => void 0),
          )));
      }
      set(eA) {
        ((this.snapshot = pickDefinedCliSessionInitialOptions(eA)),
          this.rawOptsSubject.next({ ...eA }));
      }
      get() {
        return { ...this.snapshot };
      }
    };
    function pickDefinedCliSessionInitialOptions(eA) {
      let el = {};
      for (let ec of [
        "permissionMode",
        "subagentPermissionMode",
        "dangerouslySkipPermissions",
        "model",
        "fallbackModel",
        "textToImageModel",
        "imageToImageModel",
        "tools",
        "allowedTools",
        "disallowedTools",
        "addDir",
        "channels",
        "dangerouslyLoadDevelopmentChannels",
        "mcpConfig",
        "strictMcpConfig",
        "sessionPersistence",
      ]) {
        let eu = eA[ec];
        void 0 !== eu && (el[ec] = eu);
      }
      return el;
    }
    return el;
  }
  function scope50744(el: any) {
    const ec = resolve;
    Object.defineProperty(el, "__esModule", { value: !0 });
    el.DefaultRestOperationsFactory = void 0;
    let ep = ec(1562),
      eg = ec(33584),
      eh = ec(80699),
      ef = class {
        create() {
          return eg.default.create(this.clientConfig);
        }
      };
    el.DefaultRestOperationsFactory = ef;
    return el;
  }
  const scopes: any = {
    32917: scope32917,
    74183: scope74183,
    50744: scope50744,
  };
  return {
    getModule: resolve,
    get EndpointProviderImpl() {
      return resolve(32917).EndpointProviderImpl;
    },
    get CliServerErrorHandler() {
      return resolve(32917).CliServerErrorHandler;
    },
    get CliRuntimeOptions() {
      return resolve(74183).CliRuntimeOptions;
    },
    get DefaultRestOperationsFactory() {
      return resolve(50744).DefaultRestOperationsFactory;
    },
    get security() {
      return resolve(43533);
    },
    get endpoint() {
      return resolve(45654);
    },
    get rest() {
      return resolve(1562);
    },
  };
}

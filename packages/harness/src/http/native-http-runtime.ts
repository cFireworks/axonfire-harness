// @ts-nocheck
// Complete original HTTP/CLS factories and class declarations. No product bootstrap or DI decorators.
// CLS process state, hooks, Node builtins, metadata and parent modules are explicitly owned by the caller.
export const NATIVE_HTTP_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export const NATIVE_HTTP_CONFIGURATION = [
  [
    15654,
    "em",
    "cacheSize",
    '"cell.web.route.cacheSize"',
    null,
    null,
    327568,
    327608,
  ],
  [
    15763,
    "em",
    "serverPath",
    "eh.SERVER_PATH",
    8513,
    "SERVER_PATH",
    294449,
    294477,
  ],
  [
    64423,
    "em",
    "traceField",
    "ef.TRACE_ID_RESPONSE_FIELD",
    5907,
    "TRACE_ID_RESPONSE_FIELD",
    343459,
    343499,
  ],
  [
    37821,
    "ef",
    "traceField",
    "eg.TRACE_ID_REQUEST_FIELD",
    5907,
    "TRACE_ID_REQUEST_FIELD",
    342248,
    342287,
  ],
  [2286, "eC", "mvcPath", "eE.MVC_PATH", 7994, "MVC_PATH", 259422, 259447],
  [
    46328,
    "eE",
    "defaultViewName",
    '"cell.mvc.defaultViewName"',
    null,
    null,
    277669,
    277709,
  ],
] as const;
export const NATIVE_HTTP_SCOPES = [
  {
    "id": 41764,
    "exports": [["MiddlewareProvider", "eh"]],
    "blocks": [
      ["eg", 329850, 329867],
      ["eh", 329902, 330096],
    ],
    "classes": [["eh", 329909, 330095, 2]],
    "bindings": [["eg", 80699]],
    "constants": [["Middleware", 329867, 329901]],
  },
  {
    "id": 53598,
    "exports": [["DispatcherImpl", "eC"]],
    "blocks": [["ep", 306513, 307017]],
    "classes": [["eC", 306597, 307016, 2]],
    "bindings": [
      ["ep", 36746],
      ["eg", 66410],
      ["eh", 30329],
      ["ef", 31811],
      ["em", 80699],
      ["eE", 1107],
    ],
    "constants": [],
  },
  {
    "id": 69437,
    "exports": [["HandlerExecutionChainImpl", "ef"]],
    "blocks": [["ed", 312946, 313106]],
    "classes": [["ef", 313004, 313105, 1]],
    "bindings": [
      ["ed", 66410],
      ["ep", 80699],
      ["eg", 36746],
      ["eh", 1107],
    ],
    "constants": [],
  },
  {
    "id": 80953,
    "exports": [["HandlerMappingImpl", "eE"]],
    "blocks": [["eg", 313943, 314441]],
    "classes": [["eE", 314001, 314440, 2]],
    "bindings": [
      ["eg", 80699],
      ["eh", 1107],
      ["ef", 78560],
      ["em", 36746],
    ],
    "constants": [],
  },
  {
    "id": 15654,
    "exports": [["RequestMatcherImpl", "em"]],
    "blocks": [["ep", 327149, 327539]],
    "classes": [["em", 327208, 327538, 2]],
    "bindings": [
      ["ep", 42051],
      ["eg", 36746],
      ["eh", 80699],
      ["ef", 86366],
    ],
    "constants": [],
  },
  {
    "id": 94421,
    "exports": [["HttpMiddleware", "em"]],
    "blocks": [["ep", 322882, 323292]],
    "classes": [["em", 322940, 323291, 2]],
    "bindings": [
      ["ep", 66410],
      ["eg", 36746],
      ["eh", 80699],
      ["ef", 4709],
    ],
    "constants": [],
  },
  {
    "id": 15763,
    "exports": [["PathResolverImpl", "em"]],
    "blocks": [["ep", 294146, 294422]],
    "classes": [["em", 294204, 294421, 1]],
    "bindings": [
      ["ep", 20686],
      ["eg", 80699],
      ["eh", 8513],
      ["ef", 85598],
    ],
    "constants": [],
  },
  {
    "id": 64423,
    "exports": [["TraceMiddleware", "em"]],
    "blocks": [["ep", 343061, 343327]],
    "classes": [["em", 343119, 343326, 2]],
    "bindings": [
      ["ep", 66410],
      ["eg", 36746],
      ["eh", 80699],
      ["ef", 5907],
    ],
    "constants": [],
  },
  {
    "id": 37821,
    "exports": [["TraceIdResolverImpl", "ef"]],
    "blocks": [["ep", 341978, 342218]],
    "classes": [["ef", 342023, 342217, 1]],
    "bindings": [
      ["ep", 80699],
      ["eg", 5907],
      ["eh", 36746],
    ],
    "constants": [],
  },
  {
    "id": 52662,
    "exports": [["TraceIdProviderImpl", "eg"]],
    "blocks": [["ed", 341153, 341235]],
    "classes": [["eg", 341186, 341234, 1]],
    "bindings": [
      ["ed", 80699],
      ["ep", 36746],
    ],
    "constants": [],
  },
  {
    "id": 30329,
    "exports": [
      ["AbstractErrorHandler", "eC"],
      ["DefaultErrorHandler", "ey"],
      ["HttpErrorHandler", "ew"],
      ["ValidationErrorsHandler", "eB"],
      ["ErrorHandlerProvider", "e_"],
    ],
    "blocks": [
      ["eg", 309084, 309463],
      ["ey", 309546, 309572],
      ["ew", 309667, 309894],
      ["eB", 309983, 310242],
      ["e_", 310345, 310533],
    ],
    "classes": [
      ["eC", 309156, 309462, 4],
      ["ey", 309553, 309571, 0],
      ["ew", 309674, 309893, 3],
      ["eB", 309990, 310241, 3],
      ["e_", 310352, 310532, 2],
    ],
    "bindings": [
      ["eg", 80699],
      ["eh", 24959],
      ["ef", 41585],
      ["em", 67062],
      ["eE", 88317],
    ],
    "constants": [],
  },
  {
    "id": 2286,
    "exports": [["MvcHandlerAdapter", "eC"]],
    "blocks": [["ep", 257429, 258696]],
    "classes": [["eC", 257513, 258695, 7]],
    "bindings": [
      ["ep", 80699],
      ["eg", 82524],
      ["eh", 47005],
      ["ef", 16006],
      ["em", 73385],
      ["eE", 7994],
    ],
    "constants": [],
  },
  {
    "id": 8308,
    "exports": [["RouteMetadataMatcherImpl", "ef"]],
    "blocks": [
      ["ep", 264798, 264841],
      ["ef", 264874, 265291],
    ],
    "classes": [["ef", 264881, 265290, 1]],
    "bindings": [
      ["ep", 80699],
      ["eg", 73385],
      ["eh", 47005],
    ],
    "constants": [["PATH_PARMAS_ATTR", 264841, 264873]],
  },
  {
    "id": 31135,
    "exports": [["RouteBuilder", "em"]],
    "blocks": [["ep", 261263, 263849]],
    "classes": [["em", 261322, 263848, 5]],
    "bindings": [
      ["ep", 10753],
      ["eg", 90014],
      ["eh", 80699],
      ["ef", 82524],
    ],
    "constants": [],
  },
  {
    "id": 52203,
    "exports": [["RouteProviderImpl", "ef"]],
    "blocks": [["ep", 266253, 266490]],
    "classes": [["ef", 266299, 266489, 3]],
    "bindings": [
      ["ep", 80699],
      ["eg", 73385],
      ["eh", 31135],
    ],
    "constants": [],
  },
  {
    "id": 77098,
    "exports": [["MethodArgsResolverProvider", "ef"]],
    "blocks": [["eg", 269025, 269261]],
    "classes": [["ef", 269058, 269260, 2]],
    "bindings": [
      ["eg", 80699],
      ["eh", 43439],
    ],
    "constants": [],
  },
  {
    "id": 17242,
    "exports": [
      ["BodyMethodArgsResolver", "ef"],
      ["HeaderMethodArgsResolver", "em"],
      ["ParamMethodArgsResolver", "eE"],
      ["QueryMethodArgsResolver", "eC"],
      ["CookieMethodArgsResolver", "ey"],
      ["SessionMethodArgsResolver", "ew"],
      ["RequestMethodArgsResolver", "eB"],
      ["ResponseMethodArgsResolver", "e_"],
    ],
    "blocks": [
      ["ed", 270140, 270404],
      ["em", 270511, 270732],
      ["eE", 270843, 271050],
      ["eC", 271159, 271373],
      ["ey", 271482, 271694],
      ["ew", 271805, 272014],
      ["eB", 272127, 272273],
      ["e_", 272386, 272534],
    ],
    "classes": [
      ["ef", 270199, 270403, 2],
      ["em", 270518, 270731, 2],
      ["eE", 270850, 271049, 2],
      ["eC", 271166, 271372, 2],
      ["ey", 271489, 271693, 2],
      ["ew", 271812, 272013, 2],
      ["eB", 272134, 272272, 2],
      ["e_", 272393, 272533, 2],
    ],
    "bindings": [
      ["ed", 43439],
      ["ep", 47005],
      ["eg", 80699],
      ["eh", 24908],
    ],
    "constants": [],
  },
  {
    "id": 75286,
    "exports": [["ResponseResolverProvider", "ef"]],
    "blocks": [["eg", 273655, 273887]],
    "classes": [["ef", 273688, 273886, 2]],
    "bindings": [
      ["eg", 80699],
      ["eh", 43439],
    ],
    "constants": [],
  },
  {
    "id": 19590,
    "exports": [
      ["SessionResponseResolver", "em"],
      ["CookieResponseResolver", "ef"],
      ["HeaderResponseResolver", "eh"],
    ],
    "blocks": [
      ["ed", 274615, 274842],
      ["ef", 274947, 275124],
      ["em", 275229, 275403],
    ],
    "classes": [
      ["eh", 274661, 274841, 2],
      ["ef", 274954, 275123, 2],
      ["em", 275236, 275402, 2],
    ],
    "bindings": [
      ["ed", 43439],
      ["ep", 47005],
      ["eg", 80699],
    ],
    "constants": [],
  },
  {
    "id": 39716,
    "exports": [["ViewResolverProvider", "ef"]],
    "blocks": [["eg", 276233, 276457]],
    "classes": [["ef", 276266, 276456, 2]],
    "bindings": [
      ["eg", 80699],
      ["eh", 43439],
    ],
    "constants": [],
  },
  {
    "id": 46328,
    "exports": [["ViewResolverImpl", "eE"]],
    "blocks": [["ep", 277253, 277642]],
    "classes": [["eE", 277325, 277641, 1]],
    "bindings": [
      ["ep", 43439],
      ["eg", 80699],
      ["eh", 92444],
      ["ef", 47005],
      ["em", 67062],
    ],
    "constants": [],
  },
  {
    "id": 92444,
    "exports": [["ViewProvider", "ef"]],
    "blocks": [["eg", 286124, 286332]],
    "classes": [["ef", 286157, 286331, 2]],
    "bindings": [
      ["eg", 80699],
      ["eh", 20397],
    ],
    "constants": [],
  },
] as const;
export const NATIVE_HTTP_FACTORIES = [
  [8461, 116942, 117169],
  [7994, 243656, 244234],
  [77483, 243532, 243655],
  [30805, 122394, 123496],
  [36746, 298135, 300502],
  [63192, 3670593, 3679411],
  [64891, 4295392, 4297576],
  [8821, 6504558, 6506320],
  [93326, 327736, 328090],
  [95974, 328091, 328498],
  [31811, 305738, 305870],
  [1107, 314632, 314918],
  [24959, 310685, 311116],
  [41585, 311117, 311359],
  [34935, 311991, 312431],
  [5907, 343621, 343989],
  [42051, 326358, 326502],
  [20686, 294602, 294740],
  [8513, 286460, 286713],
  [86366, 13529676, 13536809],
  [26052, 66720, 67113],
  [93280, 103299, 103614],
  [57045, 117720, 118563],
  [78881, 106230, 106640],
  [99600, 116086, 116941],
  [73385, 259688, 259976],
  [43439, 272647, 272925],
  [90014, 253977, 254803],
  [4709, 323461, 323703],
  [30063, 304959, 305140],
  [92921, 297358, 297539],
  [34483, 214493, 215089],
  [37096, 295321, 295948],
  [20397, 285201, 285406],
  [51582, 98220, 98649],
  [27194, 117170, 117642],
  [78627, 207291, 214492],
  [14516, 204627, 207290],
  [1562, 202525, 203047],
] as const;
export function createNativeHttpRuntime(runtime: any = {}) {
  const process = runtime.process ?? { env: {}, namespaces: {} };
  const console = runtime.console ?? globalThis.console;
  const Reflect = runtime.Reflect ?? globalThis.Reflect;
  const Date = runtime.Date ?? globalThis.Date;
  const Buffer = runtime.Buffer ?? globalThis.Buffer;
  const aliases: any = {
    "98": [4709, 94421],
    "374": [92921],
    "2639": [5907, 64423, 37821, 52662],
    "15062": [30805],
    "16006": [43439, 77098, 17242, 75286, 19590, 39716, 46328],
    "16891": [30063],
    "17237": [93280],
    "18441": [20397, 92444],
    "24908": [73385, 2286, 31135, 8308, 52203],
    "27371": [20686, 15763],
    "47005": [36746, 66410, 65475, 78560, 92802, 83668, 98, 2639, 374],
    "61987": [63192],
    "65475": [53598, 31811],
    "66410": [41764, 93326, 95974],
    "67062": [34483, 78824],
    "78824": [1562],
    "78560": [41585, 24959, 34935, 30329],
    "83668": [42051, 15654],
    "85598": [37096],
    "92802": [69437, 80953, 1107],
  };
  const cache = new Map(),
    projections = new Map(),
    factories: any = {
      8461(eA, el) {
        "use strict";
        (Object.defineProperty(el, "__esModule", { value: !0 }),
          (el.Deferred = void 0));
        let Deferred = class Deferred {
          constructor() {
            this.promise = new Promise((eA, el) => {
              ((this.resolve = eA), (this.reject = el));
            });
          }
        };
        el.Deferred = Deferred;
      },
      7994(eA, el, ec) {
        "use strict";
        var eu =
            (this && this.__createBinding) ||
            (Object.create
              ? function (eA, el, ec, eu) {
                  void 0 === eu && (eu = ec);
                  var ed = Object.getOwnPropertyDescriptor(el, ec);
                  ((!ed ||
                    ("get" in ed
                      ? !el.__esModule
                      : ed.writable || ed.configurable)) &&
                    (ed = {
                      enumerable: !0,
                      get: function () {
                        return el[ec];
                      },
                    }),
                    Object.defineProperty(eA, eu, ed));
                }
              : function (eA, el, ec, eu) {
                  (void 0 === eu && (eu = ec), (eA[eu] = el[ec]));
                }),
          ed =
            (this && this.__exportStar) ||
            function (eA, el) {
              for (var ec in eA)
                "default" === ec ||
                  Object.prototype.hasOwnProperty.call(el, ec) ||
                  eu(el, eA, ec);
            };
        (Object.defineProperty(el, "__esModule", { value: !0 }),
          ed(ec(77483), el));
      },
      77483(eA, el) {
        "use strict";
        (Object.defineProperty(el, "__esModule", { value: !0 }),
          (el.MVC_PATH = void 0),
          (el.MVC_PATH = "cell.mvc.path"));
      },
      30805(eA, el, ec) {
        "use strict";
        var eu;
        (Object.defineProperty(el, "__esModule", { value: !0 }),
          (el.Context =
            el.CURRENT_CONTEXT_REQUEST_KEY =
            el.AttributeScope =
              void 0));
        let ed = ec(61987).createNamespace;
        (!(function (eA) {
          ((eA[(eA.App = 0)] = "App"),
            (eA[(eA.Request = 1)] = "Request"),
            (eA[(eA.Session = 2)] = "Session"));
        })(eu || (el.AttributeScope = eu = {})),
          (el.CURRENT_CONTEXT_REQUEST_KEY = "CurrentContextRequest"));
        let ep = new Map(),
          eg = ed("3f45efdf-383c-4152-877b-1e98a410e0da");
        let Context = class Context {
          static run(eA) {
            eg.runPromise(async () => eA());
          }
          static bind(eA, el) {
            return eg.bind(eA, el);
          }
          static setCurrent(eA) {
            eg.set(el.CURRENT_CONTEXT_REQUEST_KEY, eA);
          }
          static getCurrent() {
            return eg.get(el.CURRENT_CONTEXT_REQUEST_KEY);
          }
          static setAttr(eA, el, ec = eu.Request) {
            ec === eu.Request || ec === eu.Session
              ? (Context.getCurrent()[eA] = el)
              : ep.set(eA, el);
          }
          static getAttr(eA, el) {
            var ec, ed, eh;
            if (el)
              if (el === eu.Request)
                return null == (ec = Context.getCurrent()) ? void 0 : ec[eA];
              else if (el === eu.Session)
                return null == (ed = Context.getCurrent()) ? void 0 : ed[eA];
              else return ep.get(eA);
            {
              let el = eg.get(eA);
              return (
                (el =
                  el ||
                  (null == (eh = Context.getCurrent()) ? void 0 : eh[eA])) ||
                ep.get(eA)
              );
            }
          }
        };
        el.Context = Context;
      },
      36746(eA, el, ec) {
        "use strict";
        (Object.defineProperty(el, "__esModule", { value: !0 }),
          (el.Context =
            el.CURRENT_TENANT_REQUEST_KEY =
            el.CURRENT_SKIP_AUTO_END_REQUEST_KEY =
            el.CURRENT_TRACE_ID_REQUEST_KEY =
            el.CURRENT_SESSION_REQUEST_KEY =
            el.CURRENT_COOKIES_REQUEST_KEY =
            el.AttributeScope =
              void 0));
        let eu = ec(15062);
        var ed = ec(15062);
        (Object.defineProperty(el, "AttributeScope", {
          enumerable: !0,
          get: function () {
            return ed.AttributeScope;
          },
        }),
          (el.CURRENT_COOKIES_REQUEST_KEY = "CurrentCookiesRequest"),
          (el.CURRENT_SESSION_REQUEST_KEY = "CurrentSessionRequest"),
          (el.CURRENT_TRACE_ID_REQUEST_KEY = "CurrentTraceIdRequest"),
          (el.CURRENT_SKIP_AUTO_END_REQUEST_KEY = "CurrentSkipAutoEndRequest"),
          (el.CURRENT_TENANT_REQUEST_KEY = "CurrentTenantRequest"));
        let Context = class Context extends eu.Context {
          constructor(eA, el) {
            (super(), (this.request = eA), (this.response = el));
          }
          static getRequest() {
            return Context.getCurrent().request;
          }
          static getResponse() {
            return Context.getCurrent().response;
          }
          static getCookies() {
            return Context.getAttr(
              el.CURRENT_COOKIES_REQUEST_KEY,
              eu.AttributeScope.Request,
            );
          }
          static setCookies(eA) {
            Context.setAttr(
              el.CURRENT_COOKIES_REQUEST_KEY,
              eA,
              eu.AttributeScope.Request,
            );
          }
          static getSession() {
            return Context.getAttr(
              el.CURRENT_SESSION_REQUEST_KEY,
              eu.AttributeScope.Request,
            );
          }
          static setSession(eA) {
            Context.setAttr(
              el.CURRENT_SESSION_REQUEST_KEY,
              eA,
              eu.AttributeScope.Request,
            );
          }
          static setTraceId(eA) {
            Context.setAttr(
              el.CURRENT_TRACE_ID_REQUEST_KEY,
              eA,
              eu.AttributeScope.Request,
            );
          }
          static getTraceId() {
            return Context.getAttr(
              el.CURRENT_TRACE_ID_REQUEST_KEY,
              eu.AttributeScope.Request,
            );
          }
          static setTenant(eA) {
            Context.setAttr(
              el.CURRENT_TENANT_REQUEST_KEY,
              eA,
              eu.AttributeScope.Request,
            );
          }
          static getTenant() {
            return Context.getAttr(
              el.CURRENT_TENANT_REQUEST_KEY,
              eu.AttributeScope.Request,
            );
          }
          static setSkipAutoEnd(eA) {
            Context.setAttr(
              el.CURRENT_SKIP_AUTO_END_REQUEST_KEY,
              eA,
              eu.AttributeScope.Request,
            );
          }
          static isSkipAutoEnd() {
            return !!Context.getAttr(
              el.CURRENT_SKIP_AUTO_END_REQUEST_KEY,
              eu.AttributeScope.Request,
            );
          }
          static setAttr(eA, el, ec = eu.AttributeScope.Request) {
            ec === eu.AttributeScope.Session
              ? (Context.getSession()[eA] = el)
              : eu.Context.setAttr(eA, el, ec);
          }
          static getAttr(eA, el) {
            if (el)
              if (el === eu.AttributeScope.Session)
                return Context.getSession()[eA];
              else return eu.Context.getAttr(eA, el);
            {
              let el = eu.Context.getAttr(eA, eu.AttributeScope.Request);
              return (
                (el = el || Context.getSession()[eA]) ||
                eu.Context.getAttr(eA, eu.AttributeScope.App)
              );
            }
          }
        };
        el.Context = Context;
      },
      63192(eA, el, ec) {
        "use strict";
        let eu = ec(39023),
          ed = ec(42613),
          ep = ec(64891),
          eg = ec(90290),
          eh = "cls@contexts",
          ef = "error@context",
          em = process.env.DEBUG_CLS_HOOKED,
          eE = -1;
        function Namespace(eA) {
          ((this.name = eA),
            (this.active = null),
            (this._set = []),
            (this.id = null),
            (this._contexts = new Map()),
            (this._indent = 0));
        }
        function getNamespace(eA) {
          return process.namespaces[eA];
        }
        function destroyNamespace(eA) {
          let el = getNamespace(eA);
          (ed.ok(el, "can't delete nonexistent namespace! \"" + eA + '"'),
            ed.ok(
              el.id,
              "don't assign to process.namespaces directly! " + eu.inspect(el),
            ),
            (process.namespaces[eA] = null));
        }
        function reset() {
          (process.namespaces &&
            Object.keys(process.namespaces).forEach(function (eA) {
              destroyNamespace(eA);
            }),
            (process.namespaces = Object.create(null)));
        }
        function debug2(...eA) {
          em && process._rawDebug(`${eu.format(...eA)}`);
        }
        ((eA.exports = {
          getNamespace: getNamespace,
          createNamespace: function createNamespace(eA) {
            (ed.ok(eA, "namespace must be given a name."),
              em && debug2(`NS-CREATING NAMESPACE (${eA})`));
            let el = new Namespace(eA);
            return (
              (el.id = eE),
              eg
                .createHook({
                  init(ec, ed, ep, eh) {
                    if (((eE = eg.executionAsyncId()), el.active)) {
                      if ((el._contexts.set(ec, el.active), em)) {
                        let eg = " ".repeat(el._indent < 0 ? 0 : el._indent);
                        debug2(
                          `${eg}INIT [${ed}] (${eA}) asyncId:${ec} currentUid:${eE} triggerId:${ep} active:${eu.inspect(el.active, { showHidden: !0, depth: 2, colors: !0 })} resource:${eh}`,
                        );
                      }
                    } else if (0 === eE) {
                      let ep = eg.triggerAsyncId(),
                        ef = el._contexts.get(ep);
                      if (ef) {
                        if ((el._contexts.set(ec, ef), em)) {
                          let eg = " ".repeat(el._indent < 0 ? 0 : el._indent);
                          debug2(
                            `${eg}INIT USING CONTEXT FROM TRIGGERID [${ed}] (${eA}) asyncId:${ec} currentUid:${eE} triggerId:${ep} active:${eu.inspect(el.active, { showHidden: !0, depth: 2, colors: !0 })} resource:${eh}`,
                          );
                        }
                      } else if (em) {
                        let eg = " ".repeat(el._indent < 0 ? 0 : el._indent);
                        debug2(
                          `${eg}INIT MISSING CONTEXT [${ed}] (${eA}) asyncId:${ec} currentUid:${eE} triggerId:${ep} active:${eu.inspect(el.active, { showHidden: !0, depth: 2, colors: !0 })} resource:${eh}`,
                        );
                      }
                    }
                    if (em && "PROMISE" === ed) {
                      debug2(eu.inspect(eh, { showHidden: !0 }));
                      let eg = eh.parentId,
                        ef = " ".repeat(el._indent < 0 ? 0 : el._indent);
                      debug2(
                        `${ef}INIT RESOURCE-PROMISE [${ed}] (${eA}) parentId:${eg} asyncId:${ec} currentUid:${eE} triggerId:${ep} active:${eu.inspect(el.active, { showHidden: !0, depth: 2, colors: !0 })} resource:${eh}`,
                      );
                    }
                  },
                  before(ec) {
                    let ed;
                    if (
                      ((eE = eg.executionAsyncId()),
                      (ed = el._contexts.get(ec) || el._contexts.get(eE)))
                    ) {
                      if (em) {
                        let ep = eg.triggerAsyncId(),
                          eh = " ".repeat(el._indent < 0 ? 0 : el._indent);
                        (debug2(
                          `${eh}BEFORE (${eA}) asyncId:${ec} currentUid:${eE} triggerId:${ep} active:${eu.inspect(el.active, { showHidden: !0, depth: 2, colors: !0 })} context:${eu.inspect(ed)}`,
                        ),
                          (el._indent += 2));
                      }
                      el.enter(ed);
                    } else if (em) {
                      let ed = eg.triggerAsyncId(),
                        ep = " ".repeat(el._indent < 0 ? 0 : el._indent);
                      (debug2(
                        `${ep}BEFORE MISSING CONTEXT (${eA}) asyncId:${ec} currentUid:${eE} triggerId:${ed} active:${eu.inspect(el.active, { showHidden: !0, depth: 2, colors: !0 })} namespace._contexts:${eu.inspect(el._contexts, { showHidden: !0, depth: 2, colors: !0 })}`,
                      ),
                        (el._indent += 2));
                    }
                  },
                  after(ec) {
                    let ed;
                    if (
                      ((eE = eg.executionAsyncId()),
                      (ed = el._contexts.get(ec) || el._contexts.get(eE)))
                    ) {
                      if (em) {
                        let ep = eg.triggerAsyncId();
                        el._indent -= 2;
                        let eh = " ".repeat(el._indent < 0 ? 0 : el._indent);
                        debug2(
                          `${eh}AFTER (${eA}) asyncId:${ec} currentUid:${eE} triggerId:${ep} active:${eu.inspect(el.active, { showHidden: !0, depth: 2, colors: !0 })} context:${eu.inspect(ed)}`,
                        );
                      }
                      el.exit(ed);
                    } else if (em) {
                      let ep = eg.triggerAsyncId();
                      el._indent -= 2;
                      let eh = " ".repeat(el._indent < 0 ? 0 : el._indent);
                      debug2(
                        `${eh}AFTER MISSING CONTEXT (${eA}) asyncId:${ec} currentUid:${eE} triggerId:${ep} active:${eu.inspect(el.active, { showHidden: !0, depth: 2, colors: !0 })} context:${eu.inspect(ed)}`,
                      );
                    }
                  },
                  destroy(ec) {
                    if (((eE = eg.executionAsyncId()), em)) {
                      let ed = eg.triggerAsyncId(),
                        ep = " ".repeat(el._indent < 0 ? 0 : el._indent);
                      debug2(
                        `${ep}DESTROY (${eA}) currentUid:${eE} asyncId:${ec} triggerId:${ed} active:${eu.inspect(el.active, { showHidden: !0, depth: 2, colors: !0 })} context:${eu.inspect(el._contexts.get(eE))}`,
                      );
                    }
                    el._contexts.delete(ec);
                  },
                })
                .enable(),
              (process.namespaces[eA] = el),
              el
            );
          },
          destroyNamespace: destroyNamespace,
          reset: reset,
          ERROR_SYMBOL: ef,
        }),
          (Namespace.prototype.set = function (eA, el) {
            if (!this.active)
              throw Error(
                "No context available. ns.run() or ns.bind() must be called first.",
              );
            return (
              (this.active[eA] = el),
              em &&
                debug2(
                  " ".repeat(this._indent < 0 ? 0 : this._indent) +
                    "CONTEXT-SET KEY:" +
                    eA +
                    "=" +
                    el +
                    " in ns:" +
                    this.name +
                    " currentUid:" +
                    eE +
                    " active:" +
                    eu.inspect(this.active, {
                      showHidden: !0,
                      depth: 2,
                      colors: !0,
                    }),
                ),
              el
            );
          }),
          (Namespace.prototype.get = function (eA) {
            if (!this.active) {
              if (em) {
                let el = eg.currentId(),
                  ec = eg.triggerAsyncId(),
                  eu = " ".repeat(this._indent < 0 ? 0 : this._indent);
                debug2(
                  `${eu}CONTEXT-GETTING KEY NO ACTIVE NS: (${this.name}) ${eA}=undefined currentUid:${eE} asyncHooksCurrentId:${el} triggerId:${ec} len:${this._set.length}`,
                );
              }
              return;
            }
            if (em) {
              let el = eg.executionAsyncId(),
                ec = eg.triggerAsyncId(),
                ed = " ".repeat(this._indent < 0 ? 0 : this._indent);
              (debug2(
                ed +
                  "CONTEXT-GETTING KEY:" +
                  eA +
                  "=" +
                  this.active[eA] +
                  " (" +
                  this.name +
                  ") currentUid:" +
                  eE +
                  " active:" +
                  eu.inspect(this.active, {
                    showHidden: !0,
                    depth: 2,
                    colors: !0,
                  }),
              ),
                debug2(
                  `${ed}CONTEXT-GETTING KEY: (${this.name}) ${eA}=${this.active[eA]} currentUid:${eE} asyncHooksCurrentId:${el} triggerId:${ec} len:${this._set.length} active:${eu.inspect(this.active)}`,
                ));
            }
            return this.active[eA];
          }),
          (Namespace.prototype.createContext = function () {
            let eA = Object.create(
              this.active ? this.active : Object.prototype,
            );
            if (((eA._ns_name = this.name), (eA.id = eE), em)) {
              let el = eg.executionAsyncId(),
                ec = eg.triggerAsyncId(),
                ed = " ".repeat(this._indent < 0 ? 0 : this._indent);
              debug2(
                `${ed}CONTEXT-CREATED Context: (${this.name}) currentUid:${eE} asyncHooksCurrentId:${el} triggerId:${ec} len:${this._set.length} context:${eu.inspect(eA, { showHidden: !0, depth: 2, colors: !0 })}`,
              );
            }
            return eA;
          }),
          (Namespace.prototype.run = function (eA) {
            let el = this.createContext();
            this.enter(el);
            try {
              if (em) {
                let eA = eg.triggerAsyncId(),
                  ec = eg.executionAsyncId(),
                  ed = " ".repeat(this._indent < 0 ? 0 : this._indent);
                debug2(
                  `${ed}CONTEXT-RUN BEGIN: (${this.name}) currentUid:${eE} triggerId:${eA} asyncHooksCurrentId:${ec} len:${this._set.length} context:${eu.inspect(el)}`,
                );
              }
              return (eA(el), el);
            } catch (eA) {
              throw (eA && (eA[ef] = el), eA);
            } finally {
              if (em) {
                let eA = eg.triggerAsyncId(),
                  ec = eg.executionAsyncId(),
                  ed = " ".repeat(this._indent < 0 ? 0 : this._indent);
                debug2(
                  `${ed}CONTEXT-RUN END: (${this.name}) currentUid:${eE} triggerId:${eA} asyncHooksCurrentId:${ec} len:${this._set.length} ${eu.inspect(el)}`,
                );
              }
              this.exit(el);
            }
          }),
          (Namespace.prototype.runAndReturn = function (eA) {
            let el;
            return (
              this.run(function (ec) {
                el = eA(ec);
              }),
              el
            );
          }),
          (Namespace.prototype.runPromise = function (eA) {
            let el = this.createContext();
            this.enter(el);
            let ec = eA(el);
            if (!ec || !ec.then || !ec.catch)
              throw Error("fn must return a promise.");
            return (
              em &&
                debug2(
                  "CONTEXT-runPromise BEFORE: (" +
                    this.name +
                    ") currentUid:" +
                    eE +
                    " len:" +
                    this._set.length +
                    " " +
                    eu.inspect(el),
                ),
              ec
                .then(
                  (eA) => (
                    em &&
                      debug2(
                        "CONTEXT-runPromise AFTER then: (" +
                          this.name +
                          ") currentUid:" +
                          eE +
                          " len:" +
                          this._set.length +
                          " " +
                          eu.inspect(el),
                      ),
                    this.exit(el),
                    eA
                  ),
                )
                .catch((eA) => {
                  throw (
                    (eA[ef] = el),
                    em &&
                      debug2(
                        "CONTEXT-runPromise AFTER catch: (" +
                          this.name +
                          ") currentUid:" +
                          eE +
                          " len:" +
                          this._set.length +
                          " " +
                          eu.inspect(el),
                      ),
                    this.exit(el),
                    eA
                  );
                })
            );
          }),
          (Namespace.prototype.bind = function (eA, el) {
            el || (el = this.active ? this.active : this.createContext());
            let ec = this;
            return function () {
              ec.enter(el);
              try {
                return eA.apply(this, arguments);
              } catch (eA) {
                throw (eA && (eA[ef] = el), eA);
              } finally {
                ec.exit(el);
              }
            };
          }),
          (Namespace.prototype.enter = function (eA) {
            if ((ed.ok(eA, "context must be provided for entering"), em)) {
              let el = eg.executionAsyncId(),
                ec = eg.triggerAsyncId(),
                ed = " ".repeat(this._indent < 0 ? 0 : this._indent);
              debug2(
                `${ed}CONTEXT-ENTER: (${this.name}) currentUid:${eE} triggerId:${ec} asyncHooksCurrentId:${el} len:${this._set.length} ${eu.inspect(eA)}`,
              );
            }
            (this._set.push(this.active), (this.active = eA));
          }),
          (Namespace.prototype.exit = function (eA) {
            if ((ed.ok(eA, "context must be provided for exiting"), em)) {
              let el = eg.executionAsyncId(),
                ec = eg.triggerAsyncId(),
                ed = " ".repeat(this._indent < 0 ? 0 : this._indent);
              debug2(
                `${ed}CONTEXT-EXIT: (${this.name}) currentUid:${eE} triggerId:${ec} asyncHooksCurrentId:${el} len:${this._set.length} ${eu.inspect(eA)}`,
              );
            }
            if (this.active === eA) {
              (ed.ok(this._set.length, "can't remove top context"),
                (this.active = this._set.pop()));
              return;
            }
            let el = this._set.lastIndexOf(eA);
            el < 0
              ? (em &&
                  debug2(
                    "??ERROR?? context exiting but not entered - ignoring: " +
                      eu.inspect(eA),
                  ),
                ed.ok(
                  el >= 0,
                  "context not currently entered; can't exit. \n" +
                    eu.inspect(this) +
                    "\n" +
                    eu.inspect(eA),
                ))
              : (ed.ok(el, "can't remove top context"),
                this._set.splice(el, 1));
          }),
          (Namespace.prototype.bindEmitter = function (eA) {
            ed.ok(eA.on && eA.addListener && eA.emit, "can only bind real EEs");
            let el = this,
              ec = "context@" + this.name;
            ep(
              eA,
              function (eA) {
                eA &&
                  (eA[eh] || (eA[eh] = Object.create(null)),
                  (eA[eh][ec] = { namespace: el, context: el.active }));
              },
              function (eA) {
                if (!(eA && eA[eh])) return eA;
                let el = eA,
                  ec = eA[eh];
                return (
                  Object.keys(ec).forEach(function (eA) {
                    let eu = ec[eA];
                    el = eu.namespace.bind(el, eu.context);
                  }),
                  el
                );
              },
            );
          }),
          (Namespace.prototype.fromException = function (eA) {
            return eA[ef];
          }),
          (process.namespaces = {}));
      },
      64891(eA, el, ec) {
        "use strict";
        var eu = ec(8821),
          ed = eu.wrap,
          ep = eu.unwrap,
          eg = "wrap@before";
        function defineProperty(eA, el, ec) {
          var eu = !!eA[el] && eA.propertyIsEnumerable(el);
          Object.defineProperty(eA, el, {
            configurable: !0,
            enumerable: eu,
            writable: !0,
            value: ec,
          });
        }
        function _process(eA, el) {
          for (var ec = el.length, eu = 0; eu < ec; eu++) {
            var ed = el[eu],
              ep = eA[eg];
            if ("function" == typeof ep) ep(ed);
            else if (Array.isArray(ep))
              for (var eh = ep.length, ef = 0; ef < eh; ef++) ep[ef](ed);
          }
        }
        function _listeners(eA, el) {
          var ec;
          return (
            Array.isArray((ec = eA._events && eA._events[el])) ||
              (ec = ec ? [ec] : []),
            ec
          );
        }
        function _findAndProcess(eA, el, ec) {
          var eu = _listeners(eA, el).filter(function (eA) {
            return -1 === ec.indexOf(eA);
          });
          eu.length > 0 && _process(eA, eu);
        }
        function _wrap(eA, el) {
          if (eA) {
            var ec = eA;
            if ("function" == typeof eA) ec = el(eA);
            else if (Array.isArray(eA)) {
              ec = [];
              for (var eu = 0; eu < eA.length; eu++) ec[eu] = el(eA[eu]);
            }
            return ec;
          }
        }
        eA.exports = function (eA, el, ec) {
          if (
            !eA ||
            !eA.on ||
            !eA.addListener ||
            !eA.removeListener ||
            !eA.emit
          )
            throw Error("can only wrap real EEs");
          if (!el)
            throw Error("must have function to run on listener addition");
          if (!ec)
            throw Error("must have function to wrap listeners when emitting");
          function adding(eA) {
            return function (el, ec) {
              var eu = _listeners(this, el).slice();
              try {
                var ep = eA.call(this, el, ec);
                return (_findAndProcess(this, el, eu), ep);
              } finally {
                (this.on.__wrapped || ed(this, "on", adding),
                  this.addListener.__wrapped ||
                    ed(this, "addListener", adding));
              }
            };
          }
          function emitting(eA) {
            return function (el) {
              if (!this._events || !this._events[el])
                return eA.apply(this, arguments);
              var eu = this._events[el];
              ed(this, "removeListener", function (eA) {
                return function () {
                  this._events[el] = eu;
                  try {
                    return eA.apply(this, arguments);
                  } finally {
                    ((eu = this._events[el]),
                      (this._events[el] = _wrap(eu, ec)));
                  }
                };
              });
              try {
                return (
                  (this._events[el] = _wrap(eu, ec)),
                  eA.apply(this, arguments)
                );
              } finally {
                (ep(this, "removeListener"), (this._events[el] = eu));
              }
            };
          }
          (eA[eg]
            ? "function" == typeof eA[eg]
              ? defineProperty(eA, eg, [eA[eg], el])
              : Array.isArray(eA[eg]) && eA[eg].push(el)
            : defineProperty(eA, eg, el),
            eA.__wrapped ||
              (ed(eA, "addListener", adding),
              ed(eA, "on", adding),
              ed(eA, "emit", emitting),
              defineProperty(eA, "__unwrap", function () {
                (ep(eA, "addListener"),
                  ep(eA, "on"),
                  ep(eA, "emit"),
                  delete eA[eg],
                  delete eA.__wrapped);
              }),
              defineProperty(eA, "__wrapped", !0)));
        };
      },
      8821(eA) {
        "use strict";
        function isFunction(eA) {
          return "function" == typeof eA;
        }
        var el = console.error.bind(console);
        function defineProperty(eA, el, ec) {
          var eu = !!eA[el] && eA.propertyIsEnumerable(el);
          Object.defineProperty(eA, el, {
            configurable: !0,
            enumerable: eu,
            writable: !0,
            value: ec,
          });
        }
        function shimmer(eA) {
          eA &&
            eA.logger &&
            (isFunction(eA.logger)
              ? (el = eA.logger)
              : el("new logger isn't a function, not replacing"));
        }
        function wrap(eA, ec, eu) {
          if (!eA || !eA[ec])
            return void el("no original function " + ec + " to wrap");
          if (!eu) {
            (el("no wrapper function"), el(Error().stack));
            return;
          }
          if (!isFunction(eA[ec]) || !isFunction(eu))
            return void el("original object and wrapper must be functions");
          var ed = eA[ec],
            ep = eu(ed, ec);
          return (
            defineProperty(ep, "__original", ed),
            defineProperty(ep, "__unwrap", function () {
              eA[ec] === ep && defineProperty(eA, ec, ed);
            }),
            defineProperty(ep, "__wrapped", !0),
            defineProperty(eA, ec, ep),
            ep
          );
        }
        function massWrap(eA, ec, eu) {
          if (eA) Array.isArray(eA) || (eA = [eA]);
          else {
            (el("must provide one or more modules to patch"),
              el(Error().stack));
            return;
          }
          ec && Array.isArray(ec)
            ? eA.forEach(function (eA) {
                ec.forEach(function (el) {
                  wrap(eA, el, eu);
                });
              })
            : el("must provide one or more functions to wrap on modules");
        }
        function unwrap(eA, ec) {
          if (!eA || !eA[ec]) {
            (el("no function to unwrap."), el(Error().stack));
            return;
          }
          if (eA[ec].__unwrap) return eA[ec].__unwrap();
          el(
            "no original to unwrap to -- has " +
              ec +
              " already been unwrapped?",
          );
        }
        function massUnwrap(eA, ec) {
          if (eA) Array.isArray(eA) || (eA = [eA]);
          else {
            (el("must provide one or more modules to patch"),
              el(Error().stack));
            return;
          }
          ec && Array.isArray(ec)
            ? eA.forEach(function (eA) {
                ec.forEach(function (el) {
                  unwrap(eA, el);
                });
              })
            : el("must provide one or more functions to unwrap on modules");
        }
        ((shimmer.wrap = wrap),
          (shimmer.massWrap = massWrap),
          (shimmer.unwrap = unwrap),
          (shimmer.massUnwrap = massUnwrap),
          (eA.exports = shimmer));
      },
      93326(eA, el) {
        "use strict";
        function compose(eA) {
          return (el, ec) => {
            let eu = -1,
              dispatch = (ed) => {
                if (ed <= eu)
                  return Promise.reject(Error("next() called multiple times"));
                eu = ed;
                let ep = eA[ed];
                return (ed === eA.length && (ep = ec), ep)
                  ? ep.handle(el, () => dispatch(ed + 1))
                  : Promise.resolve();
              };
            return dispatch(0);
          };
        }
        (Object.defineProperty(el, "__esModule", { value: !0 }),
          (el.compose = compose));
      },
      95974(eA, el, ec) {
        "use strict";
        (Object.defineProperty(el, "__esModule", { value: !0 }),
          (el.convertExpressMiddleware = convertExpressMiddleware),
          (el.linkNext = linkNext));
        let eu = ec(36746);
        function convertExpressMiddleware(eA) {
          return {
            handle: (el, ec) =>
              new Promise((ed, ep) =>
                eA(
                  el.request,
                  el.response,
                  eu.Context.bind((eA) => {
                    eA ? ep(eA) : ec().then(ed).catch(ep);
                  }),
                ),
              ),
            priority: 0,
          };
        }
        function linkNext(eA) {
          return { handle: () => eA(), priority: 0 };
        }
      },
      31811(eA, el) {
        "use strict";
        (Object.defineProperty(el, "__esModule", { value: !0 }),
          (el.Dispatcher = void 0),
          (el.Dispatcher = Symbol("Dispatcher")));
      },
      1107(eA, el) {
        "use strict";
        (Object.defineProperty(el, "__esModule", { value: !0 }),
          (el.HandlerMapping =
            el.HandlerAdapter =
            el.HandlerExecutionChain =
              void 0),
          (el.HandlerExecutionChain = Symbol("HandlerExecutionChain")),
          (el.HandlerAdapter = Symbol("HandlerAdapter")),
          (el.HandlerMapping = Symbol("HandlerMapping")));
      },
      24959(eA, el) {
        "use strict";
        (Object.defineProperty(el, "__esModule", { value: !0 }),
          (el.VALIDATION_ERRORS_ERROR_HANDLER_PRIORITY =
            el.HTTP_ERROR_HANDLER_PRIORITY =
            el.DEFALUT_ERROR_HANDLER_PRIORITY =
            el.ErrorHandler =
              void 0),
          (el.ErrorHandler = Symbol("ErrorHandler")),
          (el.DEFALUT_ERROR_HANDLER_PRIORITY = 1),
          (el.HTTP_ERROR_HANDLER_PRIORITY =
            el.DEFALUT_ERROR_HANDLER_PRIORITY + 100),
          (el.VALIDATION_ERRORS_ERROR_HANDLER_PRIORITY =
            el.HTTP_ERROR_HANDLER_PRIORITY + 100));
      },
      41585(eA, el, ec) {
        "use strict";
        (Object.defineProperty(el, "__esModule", { value: !0 }),
          (el.HttpError = void 0));
        let eu = ec(80699);
        let HttpError = class HttpError extends eu.CustomError {
          constructor(eA, el) {
            (super(el), (this.statusCode = eA));
          }
        };
        el.HttpError = HttpError;
      },
      34935(eA, el, ec) {
        "use strict";
        (Object.defineProperty(el, "__esModule", { value: !0 }),
          (el.NotFoundAndContinueError = el.NotFoundError = void 0));
        let eu = ec(41585),
          ed = ec(67062);
        let NotFoundError = class NotFoundError extends eu.HttpError {
          constructor(eA) {
            super(ed.HttpStatus.NOT_FOUND, eA);
          }
        };
        el.NotFoundError = NotFoundError;
        let NotFoundAndContinueError = class NotFoundAndContinueError extends NotFoundError {};
        el.NotFoundAndContinueError = NotFoundAndContinueError;
      },
      5907(eA, el) {
        "use strict";
        (Object.defineProperty(el, "__esModule", { value: !0 }),
          (el.TraceIdResolver =
            el.TRACE_ID_RESPONSE_FIELD =
            el.TRACE_ID_REQUEST_FIELD =
            el.TRACE_MIDDLEWARE_PRIORITY =
              void 0),
          (el.TRACE_MIDDLEWARE_PRIORITY = 2200),
          (el.TRACE_ID_REQUEST_FIELD = "cell.trace.requestField"),
          (el.TRACE_ID_RESPONSE_FIELD = "cell.trace.responseField"),
          (el.TraceIdResolver = Symbol("TraceIdResolver")));
      },
      42051(eA, el) {
        "use strict";
        (Object.defineProperty(el, "__esModule", { value: !0 }),
          (el.RequestMatcher = void 0),
          (el.RequestMatcher = Symbol("RequestMatcher")));
      },
      20686(eA, el) {
        "use strict";
        (Object.defineProperty(el, "__esModule", { value: !0 }),
          (el.PathResolver = void 0),
          (el.PathResolver = Symbol("PathResolver")));
      },
      8513(eA, el) {
        "use strict";
        (Object.defineProperty(el, "__esModule", { value: !0 }),
          (el.AOP_POINTCUT = el.CORS = el.SERVER_PATH = el.ENDPOINT = void 0),
          (el.ENDPOINT = "cell.server.endpoint"),
          (el.SERVER_PATH = "cell.server.path"),
          (el.CORS = "cell.web.cors"),
          (el.AOP_POINTCUT = "Endpoint"));
      },
      // prettier-ignore
      86366(eA,el){var ec=[].slice;!function(ec,eu){"function"==typeof define&&null!=define.amd?define([],eu):null!==el?eA.exports=eu():ec.UrlPattern=eu()}(this,function(){var eA,el,eu,ed,ep,eg,eh,ef,em,eE,eC,ey,ew,eB,e_;return em=function(eA){return eA.replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&")},eh=function(eA,el){var ec,eu,ed;for(ed=[],ec=-1,eu=eA.length;++ec<eu;)ed=ed.concat(el(eA[ec]));return ed},eB=function(eA,el){var ec,eu,ed;for(ed="",ec=-1,eu=eA.length;++ec<eu;)ed+=el(eA[ec]);return ed},ew=function(eA){return RegExp(eA.toString()+"|").exec("").length-1},eC=function(eA,el){var ec,eu,ed,ep,eg;for(ep={},ec=-1,ed=eA.length;++ec<ed;)eu=eA[ec],null!=(eg=el[ec])&&(null!=ep[eu]?(Array.isArray(ep[eu])||(ep[eu]=[ep[eu]]),ep[eu].push(eg)):ep[eu]=eg);return ep},(eA={}).Result=function(eA,el){this.value=eA,this.rest=el},eA.Tagged=function(eA,el){this.tag=eA,this.value=el},eA.tag=function(el,ec){return function(eu){var ed,ep;if(null!=(ed=ec(eu)))return ep=new eA.Tagged(el,ed.value),new eA.Result(ep,ed.rest)}},eA.regex=function(el){return function(ec){var eu,ed;if(null!=(eu=el.exec(ec)))return ed=eu[0],new eA.Result(ed,ec.slice(ed.length))}},eA.sequence=function(){var el;return el=1<=arguments.length?ec.call(arguments,0):[],function(ec){var eu,ed,ep,eg,eh;for(eu=-1,ed=el.length,eh=[],ep=ec;++eu<ed;){if(null==(eg=(0,el[eu])(ep)))return;eh.push(eg.value),ep=eg.rest}return new eA.Result(eh,ep)}},eA.pick=function(){var el,eu;return el=arguments[0],eu=2<=arguments.length?ec.call(arguments,1):[],function(ec){var ed,ep;if(null!=(ep=eA.sequence.apply(eA,eu)(ec)))return ed=ep.value,ep.value=ed[el],ep}},eA.string=function(el){var ec;return ec=el.length,function(eu){if(eu.slice(0,ec)===el)return new eA.Result(el,eu.slice(ec))}},eA.lazy=function(eA){var el;return el=null,function(ec){return null==el&&(el=eA()),el(ec)}},eA.baseMany=function(el,ec,eu,ed,ep){var eg,eh,ef;for(eh=ep,ef=eu?"":[];(null==ec||null==ec(eh))&&null!=(eg=el(eh));){;eu?ef+=eg.value:ef.push(eg.value),eh=eg.rest}if(!ed||0!==ef.length)return new eA.Result(ef,eh)},eA.many1=function(el){return function(ec){return eA.baseMany(el,null,!1,!0,ec)}},eA.concatMany1Till=function(el,ec){return function(eu){return eA.baseMany(el,ec,!0,!0,eu)}},eA.firstChoice=function(){var eA;return eA=1<=arguments.length?ec.call(arguments,0):[],function(el){var ec,eu,ed;for(ec=-1,eu=eA.length;++ec<eu;)if(null!=(ed=(0,eA[ec])(el)))return ed}},ey=function(el){var ec;return(ec={}).wildcard=eA.tag("wildcard",eA.string(el.wildcardChar)),ec.optional=eA.tag("optional",eA.pick(1,eA.string(el.optionalSegmentStartChar),eA.lazy(function(){return ec.pattern}),eA.string(el.optionalSegmentEndChar))),ec.name=eA.regex(RegExp("^["+el.segmentNameCharset+"]+")),ec.named=eA.tag("named",eA.pick(1,eA.string(el.segmentNameStartChar),eA.lazy(function(){return ec.name}))),ec.escapedChar=eA.pick(1,eA.string(el.escapeChar),eA.regex(/^./)),ec.static=eA.tag("static",eA.concatMany1Till(eA.firstChoice(eA.lazy(function(){return ec.escapedChar}),eA.regex(/^./)),eA.firstChoice(eA.string(el.segmentNameStartChar),eA.string(el.optionalSegmentStartChar),eA.string(el.optionalSegmentEndChar),ec.wildcard))),ec.token=eA.lazy(function(){return eA.firstChoice(ec.wildcard,ec.optional,ec.named,ec.static)}),ec.pattern=eA.many1(eA.lazy(function(){return ec.token})),ec},ef={escapeChar:"\\",segmentNameStartChar:":",segmentValueCharset:"a-zA-Z0-9-_~ %",segmentNameCharset:"a-zA-Z0-9",optionalSegmentStartChar:"(",optionalSegmentEndChar:")",wildcardChar:"*"},eg=function(eA,el){if(Array.isArray(eA))return eB(eA,function(eA){return eg(eA,el)});switch(eA.tag){case"wildcard":return"(.*?)";case"named":return"(["+el+"]+)";case"static":return em(eA.value);case"optional":return"(?:"+eg(eA.value,el)+")?"}},ep=function(eA,el){return null==el&&(el=ef.segmentValueCharset),"^"+eg(eA,el)+"$"},ed=function(eA){if(Array.isArray(eA))return eh(eA,ed);switch(eA.tag){case"wildcard":return["_"];case"named":return[eA.value];case"static":return[];case"optional":return ed(eA.value)}},eE=function(eA,el,ec,eu){var ed,ep,eg;if(null==eu&&(eu=!1),null==(eg=eA[el]))if(!eu)return;else throw Error("no values provided for key `"+el+"`");if((ed=ec[el]||0)>(Array.isArray(eg)?eg.length-1:0))if(!eu)return;else throw Error("too few values provided for key `"+el+"`");return ep=Array.isArray(eg)?eg[ed]:eg,eu&&(ec[el]=ed+1),ep},eu=function(eA,el,ec){var ed,ep;if(Array.isArray(eA)){for(ed=-1,ep=eA.length;++ed<ep;)if(eu(eA[ed],el,ec))return!0;return!1}switch(eA.tag){case"wildcard":return null!=eE(el,"_",ec,!1);case"named":return null!=eE(el,eA.value,ec,!1);case"static":return!1;case"optional":return eu(eA.value,el,ec)}},e_=function(eA,el,ec){if(Array.isArray(eA))return eB(eA,function(eA){return e_(eA,el,ec)});switch(eA.tag){case"wildcard":return eE(el,"_",ec,!0);case"named":return eE(el,eA.value,ec,!0);case"static":return eA.value;case"optional":if(eu(eA.value,el,ec))return e_(eA.value,el,ec);return""}},(el=function(eA,ec){var eu,eg,eh;if(eA instanceof el){this.isRegex=eA.isRegex,this.regex=eA.regex,this.ast=eA.ast,this.names=eA.names;return}if(this.isRegex=eA instanceof RegExp,!("string"==typeof eA||this.isRegex))throw TypeError("argument must be a regex or a string");if(this.isRegex){if(this.regex=eA,null!=ec){if(!Array.isArray(ec))throw Error("if first argument is a regex the second argument may be an array of group names but you provided something else");if(eu=ew(this.regex),ec.length!==eu)throw Error("regex contains "+eu+" groups but array of group names contains "+ec.length);this.names=ec}return}if(""===eA)throw Error("argument must not be the empty string");if(eA.replace(/\s+/g,"")!==eA)throw Error("argument must not contain whitespace");if(null==(eh=ey(eg={escapeChar:(null!=ec?ec.escapeChar:void 0)||ef.escapeChar,segmentNameStartChar:(null!=ec?ec.segmentNameStartChar:void 0)||ef.segmentNameStartChar,segmentNameCharset:(null!=ec?ec.segmentNameCharset:void 0)||ef.segmentNameCharset,segmentValueCharset:(null!=ec?ec.segmentValueCharset:void 0)||ef.segmentValueCharset,optionalSegmentStartChar:(null!=ec?ec.optionalSegmentStartChar:void 0)||ef.optionalSegmentStartChar,optionalSegmentEndChar:(null!=ec?ec.optionalSegmentEndChar:void 0)||ef.optionalSegmentEndChar,wildcardChar:(null!=ec?ec.wildcardChar:void 0)||ef.wildcardChar}).pattern(eA)))throw Error("couldn't parse pattern");if(""!==eh.rest)throw Error("could only partially parse pattern");this.ast=eh.value,this.regex=new RegExp(ep(this.ast,eg.segmentValueCharset)),this.names=ed(this.ast)}).prototype.match=function(eA){var el,ec;return null==(ec=this.regex.exec(eA))?null:(el=ec.slice(1),this.names)?eC(this.names,el):el},el.prototype.stringify=function(eA){if(null==eA&&(eA={}),this.isRegex)throw Error("can't stringify patterns generated from a regex");if(eA!==Object(eA))throw Error("argument must be an object or undefined");return e_(this.ast,eA,{})},el.escapeForRegex=em,el.concatMap=eh,el.stringConcatMap=eB,el.regexGroupCount=ew,el.keysAndValuesToObject=eC,el.P=eA,el.newParser=ey,el.defaultOptions=ef,el.astNodeToRegexString=ep,el.astNodeToNames=ed,el.getParam=eE,el.astNodeContainsSegmentsForProvidedParams=eu,el.stringify=e_,el})},
      26052(eA, el, ec) {
        "use strict";
        (Object.defineProperty(el, "__esModule", { value: !0 }),
          (el.CustomError = void 0));
        let eu = ec(17237);
        let CustomError = class CustomError extends Error {
          constructor(eA, el) {
            (super(eA, el),
              Object.defineProperty(this, "name", {
                value: new.target.name,
                enumerable: !1,
                configurable: !0,
              }),
              eu.ErrorUtil.fixProto(this, new.target.prototype),
              eu.ErrorUtil.fixStack(this));
          }
        };
        el.CustomError = CustomError;
      },
      93280(eA, el) {
        "use strict";
        (Object.defineProperty(el, "__esModule", { value: !0 }),
          (el.ErrorUtil = void 0));
        let ErrorUtil = class ErrorUtil {
          static fixProto(eA, el) {
            let ec = Object.setPrototypeOf;
            ec ? ec(eA, el) : (eA.__proto__ = el);
          }
          static fixStack(eA, el = eA.constructor) {
            let ec = Error.captureStackTrace;
            ec && ec(eA, el);
          }
        };
        el.ErrorUtil = ErrorUtil;
      },
      57045(eA, el) {
        "use strict";
        var ec;
        (Object.defineProperty(el, "__esModule", { value: !0 }),
          (el.UrlUtil = void 0),
          (function (eA) {
            eA.join = function (...eA) {
              let el = [];
              if (0 === eA.length) return "";
              if ("string" != typeof eA[0])
                throw TypeError("Url must be a string. Received " + eA[0]);
              (eA[0].match(/^[^/:]+:\/*$/) &&
                eA.length > 1 &&
                (eA[0] = eA.shift() + eA[0]),
                eA[0].match(/^file:\/\/\//)
                  ? (eA[0] = eA[0].replace(/^([^/:]+):\/*/, "$1:///"))
                  : (eA[0] = eA[0].replace(/^([^/:]+):\/*/, "$1://")));
              for (let ec = 0; ec < eA.length; ec++) {
                let eu = eA[ec];
                if ("string" != typeof eu)
                  throw TypeError("Url must be a string. Received " + eu);
                "" !== eu &&
                  (ec > 0 && (eu = eu.replace(/^[\/]+/, "")),
                  (eu =
                    ec < eA.length - 1
                      ? eu.replace(/[\/]+$/, "")
                      : eu.replace(/[\/]+$/, "/")),
                  el.push(eu));
              }
              let ec = el.join("/"),
                eu = (ec = ec.replace(/\/(\?|&|#[^!])/g, "$1")).split("?");
              return eu.shift() + (eu.length > 0 ? "?" : "") + eu.join("&");
            };
          })(ec || (el.UrlUtil = ec = {})));
      },
      78881(eA, el, ec) {
        "use strict";
        (Object.defineProperty(el, "__esModule", { value: !0 }),
          (el.getOwnMetadata = getOwnMetadata));
        let eu = ec(51582);
        function getOwnMetadata(eA, el, ec) {
          let ed = [el, ...(0, eu.getSuperClasses)(el)],
            ep = [];
          for (let el = 0; el < ed.length; el++) {
            let eu,
              eg = ed[ed.length - el - 1];
            if (
              (eu = ec
                ? Reflect.getOwnMetadata(eA, eg, ec)
                : Reflect.getOwnMetadata(eA, eg))
            )
              if (!Array.isArray(eu)) return [eu];
              else ep = [...ep, ...eu];
          }
          return ep;
        }
      },
      99600(eA, el) {
        "use strict";
        var ec;
        (Object.defineProperty(el, "__esModule", { value: !0 }),
          (el.Prioritizeable = void 0),
          (function (eA) {
            async function toPrioritizeable(eA, el) {
              if (eA instanceof Array)
                return Promise.all(eA.map((eA) => toPrioritizeable(eA, el)));
              let ec = await eA;
              return { priority: await el(ec), value: ec };
            }
            function toPrioritizeableSync(eA, el = (eA) => eA.priority) {
              return eA.map((eA) => ({ value: eA, priority: el(eA) }));
            }
            function isValid(eA) {
              return eA.priority > 0;
            }
            function compare(eA, el) {
              return el.priority - eA.priority;
            }
            ((eA.toPrioritizeable = toPrioritizeable),
              (eA.toPrioritizeableSync = toPrioritizeableSync),
              (eA.prioritizeAllSync = function (eA, el) {
                return toPrioritizeableSync(eA, el)
                  .filter(isValid)
                  .sort(compare);
              }),
              (eA.prioritizeAll = async function (eA, el) {
                return (await toPrioritizeable(eA, el))
                  .filter(isValid)
                  .sort(compare);
              }),
              (eA.isValid = isValid),
              (eA.compare = compare));
          })(ec || (el.Prioritizeable = ec = {})));
      },
      73385(eA, el) {
        "use strict";
        (Object.defineProperty(el, "__esModule", { value: !0 }),
          (el.RouteMetadataMatcher =
            el.RouteProvider =
            el.MVC_HANDLER_ADAPTER_PRIORITY =
              void 0),
          (el.MVC_HANDLER_ADAPTER_PRIORITY = 2e3),
          (el.RouteProvider = Symbol("RouteProvider")),
          (el.RouteMetadataMatcher = Symbol("RouteMetadataMatcher")));
      },
      43439(eA, el) {
        "use strict";
        (Object.defineProperty(el, "__esModule", { value: !0 }),
          (el.ViewResolver =
            el.ResponseResolver =
            el.MethodArgsResolver =
              void 0),
          (el.MethodArgsResolver = Symbol("MethodArgsResolver")),
          (el.ResponseResolver = Symbol("ResponseResolver")),
          (el.ViewResolver = Symbol("ViewResolver")));
      },
      90014(eA, el) {
        "use strict";
        (Object.defineProperty(el, "__esModule", { value: !0 }),
          (el.METADATA_KEY = void 0),
          (el.METADATA_KEY = {
            controller: "cell:controller",
            controllerMethod: "cell:controller-method",
            controllerParam: "cell:controller-param",
            controllerRequestHeader: "cell:controller-request-header",
            controllerResponseHeader: "cell:controller-response-header",
            controllerRequestCookie: "cell:controller-request-cookie",
            controllerResponseCookie: "cell:controller-response-cookie",
            controllerRequestSession: "cell:controller-request-session",
            controllerResponseSession: "cell:controller-response-session",
            controllerQuery: "cell:controller-query",
            controllerBody: "cell:controller-body",
            controllerView: "cell:controller-view",
            controllerCatch: "cell:controller-catch",
            controllerRequest: "cell:controller-request",
            controllerResponse: "cell:controller-response",
          }));
      },
      4709(eA, el, ec) {
        "use strict";
        (Object.defineProperty(el, "__esModule", { value: !0 }),
          (el.HTTP_MIDDLEWARE_PRIORITY = el.ServerAware = void 0));
        let eu = ec(16891);
        ((el.ServerAware = Symbol("ServerAware")),
          (el.HTTP_MIDDLEWARE_PRIORITY = eu.CORS_MIDDLEWARE_PRIORITY - 100));
      },
      30063(eA, el, ec) {
        "use strict";
        (Object.defineProperty(el, "__esModule", { value: !0 }),
          (el.CORS_MIDDLEWARE_PRIORITY = void 0),
          (el.CORS_MIDDLEWARE_PRIORITY =
            ec(2639).TRACE_MIDDLEWARE_PRIORITY - 100));
      },
      92921(eA, el, ec) {
        "use strict";
        (Object.defineProperty(el, "__esModule", { value: !0 }),
          (el.BODY_MIDDLEWARE_PRIORITY = void 0),
          (el.BODY_MIDDLEWARE_PRIORITY =
            ec(16891).CORS_MIDDLEWARE_PRIORITY - 100));
      },
      34483(eA, el, ec) {
        "use strict";
        var eu =
            (this && this.__createBinding) ||
            (Object.create
              ? function (eA, el, ec, eu) {
                  void 0 === eu && (eu = ec);
                  var ed = Object.getOwnPropertyDescriptor(el, ec);
                  ((!ed ||
                    ("get" in ed
                      ? !el.__esModule
                      : ed.writable || ed.configurable)) &&
                    (ed = {
                      enumerable: !0,
                      get: function () {
                        return el[ec];
                      },
                    }),
                    Object.defineProperty(eA, eu, ed));
                }
              : function (eA, el, ec, eu) {
                  (void 0 === eu && (eu = ec), (eA[eu] = el[ec]));
                }),
          ed =
            (this && this.__exportStar) ||
            function (eA, el) {
              for (var ec in eA)
                "default" === ec ||
                  Object.prototype.hasOwnProperty.call(el, ec) ||
                  eu(el, eA, ec);
            };
        (Object.defineProperty(el, "__esModule", { value: !0 }),
          ed(ec(78627), el),
          ed(ec(14516), el));
      },
      37096(eA, el, ec) {
        "use strict";
        var eu;
        (Object.defineProperty(el, "__esModule", { value: !0 }),
          (el.UrlUtil = void 0));
        let ed = ec(80699),
          ep = ec(8513),
          eg = ec(27371);
        !(function (eA) {
          function isAbsoluteUrl(eA) {
            return !!eA && /^[a-z0-9.+-]+:\/\/.*/i.test(eA);
          }
          ((eA.isValidRedirectUrl = function (eA) {
            return eA && (eA.startsWith("/") || isAbsoluteUrl(eA));
          }),
            (eA.isAbsoluteUrl = isAbsoluteUrl),
            (eA.getUrl = async function (...eA) {
              let el = ed.ConfigUtil.get(ep.ENDPOINT),
                ec = ed.ContainerUtil.get(eg.PathResolver);
              return ec.resolve(el, await ec.resolve(...eA));
            }),
            (eA.getPath = async function (...eA) {
              return ed.ContainerUtil.get(eg.PathResolver).resolve(...eA);
            }));
        })(eu || (el.UrlUtil = eu = {}));
      },
      20397(eA, el) {
        "use strict";
        (Object.defineProperty(el, "__esModule", { value: !0 }),
          (el.JsonViewTemplateRenderer = el.View = void 0),
          (el.View = Symbol("View")),
          (el.JsonViewTemplateRenderer = Symbol("JsonViewTemplateRenderer")));
      },
      51582(eA, el) {
        "use strict";
        function getSuperClasses(eA) {
          let el = [],
            ec = eA;
          for (; Object.getPrototypeOf(ec); )
            el.push((ec = Object.getPrototypeOf(ec)));
          return el;
        }
        function getPropertyNames(eA) {
          let el = [];
          do
            (el.push(...Object.getOwnPropertyNames(eA)),
              (eA = Object.getPrototypeOf(eA)));
          while (eA);
          return Array.from(new Set(el));
        }
        (Object.defineProperty(el, "__esModule", { value: !0 }),
          (el.getSuperClasses = getSuperClasses),
          (el.getPropertyNames = getPropertyNames));
      },
      27194(eA, el) {
        "use strict";
        (Object.defineProperty(el, "__esModule", { value: !0 }),
          (el.isResolveMode = isResolveMode),
          (el.getTargetClass = getTargetClass),
          (el.getTarget = getTarget),
          (el.isProxy = isProxy));
        let ec = !1;
        function isResolveMode() {
          return ec;
        }
        function getTargetClass(eA) {
          try {
            ec = !0;
            let el = eA.target;
            return el ? el.constructor : eA.constructor;
          } finally {
            ec = !1;
          }
        }
        function getTarget(eA) {
          try {
            return ((ec = !0), eA.target || eA);
          } finally {
            ec = !1;
          }
        }
        function isProxy(eA) {
          try {
            return ((ec = !0), !!eA.target);
          } finally {
            ec = !1;
          }
        }
      },
      78627(eA, el) {
        "use strict";
        var ec, eu, ed;
        (Object.defineProperty(el, "__esModule", { value: !0 }),
          (el.XML_HTTP_REQUEST =
            el.HttpMethod =
            el.MediaType =
            el.HttpStatus =
              void 0),
          (function (eA) {
            ((eA[(eA.CONTINUE = 100)] = "CONTINUE"),
              (eA[(eA.SWITCHING_PROTOCOLS = 101)] = "SWITCHING_PROTOCOLS"),
              (eA[(eA.PROCESSING = 102)] = "PROCESSING"),
              (eA[(eA.OK = 200)] = "OK"),
              (eA[(eA.CREATED = 201)] = "CREATED"),
              (eA[(eA.ACCEPTED = 202)] = "ACCEPTED"),
              (eA[(eA.NON_AUTHORITATIVE_INFORMATION = 203)] =
                "NON_AUTHORITATIVE_INFORMATION"),
              (eA[(eA.NO_CONTENT = 204)] = "NO_CONTENT"),
              (eA[(eA.RESET_CONTENT = 205)] = "RESET_CONTENT"),
              (eA[(eA.PARTIAL_CONTENT = 206)] = "PARTIAL_CONTENT"),
              (eA[(eA.AMBIGUOUS = 300)] = "AMBIGUOUS"),
              (eA[(eA.MOVED_PERMANENTLY = 301)] = "MOVED_PERMANENTLY"),
              (eA[(eA.FOUND = 302)] = "FOUND"),
              (eA[(eA.SEE_OTHER = 303)] = "SEE_OTHER"),
              (eA[(eA.NOT_MODIFIED = 304)] = "NOT_MODIFIED"),
              (eA[(eA.TEMPORARY_REDIRECT = 307)] = "TEMPORARY_REDIRECT"),
              (eA[(eA.PERMANENT_REDIRECT = 308)] = "PERMANENT_REDIRECT"),
              (eA[(eA.BAD_REQUEST = 400)] = "BAD_REQUEST"),
              (eA[(eA.UNAUTHORIZED = 401)] = "UNAUTHORIZED"),
              (eA[(eA.PAYMENT_REQUIRED = 402)] = "PAYMENT_REQUIRED"),
              (eA[(eA.FORBIDDEN = 403)] = "FORBIDDEN"),
              (eA[(eA.NOT_FOUND = 404)] = "NOT_FOUND"),
              (eA[(eA.METHOD_NOT_ALLOWED = 405)] = "METHOD_NOT_ALLOWED"),
              (eA[(eA.NOT_ACCEPTABLE = 406)] = "NOT_ACCEPTABLE"),
              (eA[(eA.PROXY_AUTHENTICATION_REQUIRED = 407)] =
                "PROXY_AUTHENTICATION_REQUIRED"),
              (eA[(eA.REQUEST_TIMEOUT = 408)] = "REQUEST_TIMEOUT"),
              (eA[(eA.CONFLICT = 409)] = "CONFLICT"),
              (eA[(eA.GONE = 410)] = "GONE"),
              (eA[(eA.LENGTH_REQUIRED = 411)] = "LENGTH_REQUIRED"),
              (eA[(eA.PRECONDITION_FAILED = 412)] = "PRECONDITION_FAILED"),
              (eA[(eA.PAYLOAD_TOO_LARGE = 413)] = "PAYLOAD_TOO_LARGE"),
              (eA[(eA.URI_TOO_LONG = 414)] = "URI_TOO_LONG"),
              (eA[(eA.UNSUPPORTED_MEDIA_TYPE = 415)] =
                "UNSUPPORTED_MEDIA_TYPE"),
              (eA[(eA.REQUESTED_RANGE_NOT_SATISFIABLE = 416)] =
                "REQUESTED_RANGE_NOT_SATISFIABLE"),
              (eA[(eA.EXPECTATION_FAILED = 417)] = "EXPECTATION_FAILED"),
              (eA[(eA.I_AM_A_TEAPOT = 418)] = "I_AM_A_TEAPOT"),
              (eA[(eA.UNPROCESSABLE_ENTITY = 422)] = "UNPROCESSABLE_ENTITY"),
              (eA[(eA.FAILED_DEPENDENCY = 424)] = "FAILED_DEPENDENCY"),
              (eA[(eA.TOO_MANY_REQUESTS = 429)] = "TOO_MANY_REQUESTS"),
              (eA[(eA.INTERNAL_SERVER_ERROR = 500)] = "INTERNAL_SERVER_ERROR"),
              (eA[(eA.NOT_IMPLEMENTED = 501)] = "NOT_IMPLEMENTED"),
              (eA[(eA.BAD_GATEWAY = 502)] = "BAD_GATEWAY"),
              (eA[(eA.SERVICE_UNAVAILABLE = 503)] = "SERVICE_UNAVAILABLE"),
              (eA[(eA.GATEWAY_TIMEOUT = 504)] = "GATEWAY_TIMEOUT"),
              (eA[(eA.HTTP_VERSION_NOT_SUPPORTED = 505)] =
                "HTTP_VERSION_NOT_SUPPORTED"),
              (eA[(eA.VARIANT_ALSO_NEGOTIATES = 506)] =
                "VARIANT_ALSO_NEGOTIATES"),
              (eA[(eA.INSUFFICIENT_STORAGE = 507)] = "INSUFFICIENT_STORAGE"),
              (eA[(eA.LOOP_DETECTED = 508)] = "LOOP_DETECTED"),
              (eA[(eA.BANDWIDTH_LIMIT_EXCEEDED = 509)] =
                "BANDWIDTH_LIMIT_EXCEEDED"),
              (eA[(eA.NOT_EXTENDED = 510)] = "NOT_EXTENDED"),
              (eA[(eA.NETWORK_AUTHENTICATION_REQUIRED = 511)] =
                "NETWORK_AUTHENTICATION_REQUIRED"),
              (eA.CONTINUE_REASON_PHRASE = "Continue"),
              (eA.SWITCHING_PROTOCOLS_REASON_PHRASE = "Switching Protocols"),
              (eA.PROCESSING_REASON_PHRASE = "Processing"),
              (eA.CHECKPOINT_REASON_PHRASE = "Checkpoint"),
              (eA.OK_REASON_PHRASE = "OK"),
              (eA.CREATED_REASON_PHRASE = "Created"),
              (eA.ACCEPTED_REASON_PHRASE = "Accepted"),
              (eA.NON_AUTHORITATIVE_INFORMATION_REASON_PHRASE =
                "Non-Authoritative Information"),
              (eA.NO_CONTENT_REASON_PHRASE = "No Content"),
              (eA.RESET_CONTENT_REASON_PHRASE = "Reset Content"),
              (eA.PARTIAL_CONTENT_REASON_PHRASE = "Partial Content"),
              (eA.MULTI_STATUS_REASON_PHRASE = "Multi-Status"),
              (eA.ALREADY_REPORTED_REASON_PHRASE = "Already Reported"),
              (eA.IM_USED_REASON_PHRASE = "IM Used"),
              (eA.MULTIPLE_CHOICES_REASON_PHRASE = "Multiple Choices"),
              (eA.MOVED_PERMANENTLY_REASON_PHRASE = "Moved Permanently"),
              (eA.FOUND_REASON_PHRASE = "Found"),
              (eA.MOVED_TEMPORARILY_REASON_PHRASE = "Moved Temporarily"),
              (eA.SEE_OTHER_REASON_PHRASE = "See Other"),
              (eA.NOT_MODIFIED_REASON_PHRASE = "Not Modified"),
              (eA.USE_PROXY_REASON_PHRASE = "Use Proxy"),
              (eA.TEMPORARY_REDIRECT_REASON_PHRASE = "Temporary Redirect"),
              (eA.PERMANENT_REDIRECT_REASON_PHRASE = "Permanent Redirect"),
              (eA.BAD_REQUEST_REASON_PHRASE = "Bad Request"),
              (eA.UNAUTHORIZED_REASON_PHRASE = "Unauthorized"),
              (eA.PAYMENT_REQUIRED_REASON_PHRASE = "Payment Required"),
              (eA.FORBIDDEN_REASON_PHRASE = "Forbidden"),
              (eA.NOT_FOUND_REASON_PHRASE = "Not Found"),
              (eA.METHOD_NOT_ALLOWED_REASON_PHRASE = "Method Not Allowed"),
              (eA.NOT_ACCEPTABLE_REASON_PHRASE = "Not Acceptable"),
              (eA.PROXY_AUTHENTICATION_REQUIRED_REASON_PHRASE =
                "Proxy Authentication Required"),
              (eA.REQUEST_TIMEOUT_REASON_PHRASE = "Request Timeout"),
              (eA.CONFLICT_REASON_PHRASE = "Conflict"),
              (eA.GONE_REASON_PHRASE = "Gone"),
              (eA.LENGTH_REQUIRED_REASON_PHRASE = "Length Required"),
              (eA.PRECONDITION_FAILED_REASON_PHRASE = "Precondition Failed"),
              (eA.PAYLOAD_TOO_LARGE_REASON_PHRASE = "Payload Too Large"),
              (eA.REQUEST_ENTITY_TOO_LARGE_REASON_PHRASE =
                "Request Entity Too Large"),
              (eA.URI_TOO_LONG_REASON_PHRASE = "URI Too Long"),
              (eA.REQUEST_URI_TOO_LONG_REASON_PHRASE = "Request-URI Too Long"),
              (eA.UNSUPPORTED_MEDIA_TYPE_REASON_PHRASE =
                "Unsupported Media Type"),
              (eA.REQUESTED_RANGE_NOT_SATISFIABLE_REASON_PHRASE =
                "Requested range not satisfiable"),
              (eA.EXPECTATION_FAILED_REASON_PHRASE = "Expectation Failed"),
              (eA.I_AM_A_TEAPOT_REASON_PHRASE = "I'm a teapot"),
              (eA.INSUFFICIENT_SPACE_ON_RESOURCE_REASON_PHRASE =
                "Insufficient Space On Resource"),
              (eA.METHOD_FAILURE_REASON_PHRASE = "Method Failure"),
              (eA.DESTINATION_LOCKED_REASON_PHRASE = "Destination Locked"),
              (eA.UNPROCESSABLE_ENTITY_REASON_PHRASE = "Unprocessable Entity"),
              (eA.LOCKED_REASON_PHRASE = "Locked"),
              (eA.FAILED_DEPENDENCY_REASON_PHRASE = "Failed Dependency"),
              (eA.UPGRADE_REQUIRED_REASON_PHRASE = "Upgrade Required"),
              (eA.PRECONDITION_REQUIRED_REASON_PHRASE =
                "Precondition Required"),
              (eA.TOO_MANY_REQUESTS_REASON_PHRASE = "Too Many Requests"),
              (eA.REQUEST_HEADER_FIELDS_TOO_LARGE_REASON_PHRASE =
                "Request Header Fields Too Large"),
              (eA.UNAVAILABLE_FOR_LEGAL_REASONS_REASON_PHRASE =
                "Unavailable For Legal Reasons"),
              (eA.INTERNAL_SERVER_ERROR_REASON_PHRASE =
                "Internal Server Error"),
              (eA.NOT_IMPLEMENTED_REASON_PHRASE = "Not Implemented"),
              (eA.BAD_GATEWAY_REASON_PHRASE = "Bad Gateway"),
              (eA.SERVICE_UNAVAILABLE_REASON_PHRASE = "Service Unavailable"),
              (eA.GATEWAY_TIMEOUT_REASON_PHRASE = "Gateway Timeout"),
              (eA.HTTP_VERSION_NOT_SUPPORTED_REASON_PHRASE =
                "HTTP Version not supported"),
              (eA.VARIANT_ALSO_NEGOTIATES_REASON_PHRASE =
                "Variant Also Negotiates"),
              (eA.INSUFFICIENT_STORAGE_REASON_PHRASE = "Insufficient Storage"),
              (eA.LOOP_DETECTED_REASON_PHRASE = "Loop Detected"),
              (eA.BANDWIDTH_LIMIT_EXCEEDED_REASON_PHRASE =
                "Bandwidth Limit Exceeded"),
              (eA.NOT_EXTENDED_REASON_PHRASE = "Not Extended"));
          })(ec || (el.HttpStatus = ec = {})),
          (function (eA) {
            ((eA.ALL = "*/*"),
              (eA.APPLICATION_ATOM_XML = "application/atom+xml"),
              (eA.APPLICATION_FORM_URLENCODED =
                "application/x-www-form-urlencoded"),
              (eA.APPLICATION_JSON = "application/json"),
              (eA.APPLICATION_JSON_UTF8 = "application/json;charset=UTF-8"),
              (eA.APPLICATION_OCTET_STREAM = "application/octet-stream"),
              (eA.APPLICATION_PDF = "application/pdf"),
              (eA.APPLICATION_PROBLEM_JSON = "application/problem+json"),
              (eA.APPLICATION_PROBLEM_JSON_UTF8 =
                "application/problem+json;charset=UTF-8"),
              (eA.APPLICATION_PROBLEM_XML = "application/problem+xml"),
              (eA.APPLICATION_RSS_XML = "application/rss+xml"),
              (eA.APPLICATION_STREAM_JSON = "application/stream+json"),
              (eA.APPLICATION_XHTML_XML = "application/xhtml+xml"),
              (eA.APPLICATION_XML = "application/xml"),
              (eA.IMAGE_GIF = "image/gif"),
              (eA.IMAGE_JPEG = "image/jpeg"),
              (eA.IMAGE_PNG = "image/png"),
              (eA.MULTIPART_FORM_DATA = "multipart/form-data"),
              (eA.TEXT_EVENT_STREAM = "text/event-stream"),
              (eA.TEXT_HTML = "text/html"),
              (eA.TEXT_MARKDOWN = "text/markdown"),
              (eA.TEXT_PLAIN = "text/plain"),
              (eA.TEXT_XML = "text/xml"));
          })(eu || (el.MediaType = eu = {})),
          (function (eA) {
            ((eA.GET = "GET"),
              (eA.HEAD = "HEAD"),
              (eA.POST = "POST"),
              (eA.PUT = "PUT"),
              (eA.PATCH = "PATCH"),
              (eA.DELETE = "DELETE"),
              (eA.OPTIONS = "OPTIONS"),
              (eA.TRACE = "TRACE"));
          })(ed || (el.HttpMethod = ed = {})),
          (el.XML_HTTP_REQUEST = "XMLHttpRequest"));
      },
      14516(eA, el) {
        "use strict";
        (Object.defineProperty(el, "__esModule", { value: !0 }),
          (el.HttpHeaders = void 0));
        let HttpHeaders = class HttpHeaders {};
        ((el.HttpHeaders = HttpHeaders),
          (HttpHeaders.ACCEPT = "Accept"),
          (HttpHeaders.ACCEPT_CHARSET = "Accept-Charset"),
          (HttpHeaders.ACCEPT_ENCODING = "Accept-Encoding"),
          (HttpHeaders.ACCEPT_LANGUAGE = "Accept-Language"),
          (HttpHeaders.ACCEPT_RANGES = "Accept-Ranges"),
          (HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS =
            "Access-Control-Allow-Credentials"),
          (HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS =
            "Access-Control-Allow-Headers"),
          (HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS =
            "Access-Control-Allow-Methods"),
          (HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN =
            "Access-Control-Allow-Origin"),
          (HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS =
            "Access-Control-Expose-Headers"),
          (HttpHeaders.ACCESS_CONTROL_MAX_AGE = "Access-Control-Max-Age"),
          (HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS =
            "Access-Control-Request-Headers"),
          (HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD =
            "Access-Control-Request-Method"),
          (HttpHeaders.AGE = "Age"),
          (HttpHeaders.ALLOW = "Allow"),
          (HttpHeaders.AUTHORIZATION = "Authorization"),
          (HttpHeaders.CACHE_CONTROL = "Cache-Control"),
          (HttpHeaders.CONNECTION = "Connection"),
          (HttpHeaders.CONTENT_ENCODING = "Content-Encoding"),
          (HttpHeaders.CONTENT_DISPOSITION = "Content-Disposition"),
          (HttpHeaders.CONTENT_LANGUAGE = "Content-Language"),
          (HttpHeaders.CONTENT_LENGTH = "Content-Length"),
          (HttpHeaders.CONTENT_LOCATION = "Content-Location"),
          (HttpHeaders.CONTENT_RANGE = "Content-Range"),
          (HttpHeaders.CONTENT_TYPE = "Content-Type"),
          (HttpHeaders.COOKIE = "Cookie"),
          (HttpHeaders.DATE = "Date"),
          (HttpHeaders.ETAG = "ETag"),
          (HttpHeaders.EXPECT = "Expect"),
          (HttpHeaders.EXPIRES = "Expires"),
          (HttpHeaders.FROM = "From"),
          (HttpHeaders.HOST = "Host"),
          (HttpHeaders.IF_MATCH = "If-Match"),
          (HttpHeaders.IF_MODIFIED_SINCE = "If-Modified-Since"),
          (HttpHeaders.IF_NONE_MATCH = "If-None-Match"),
          (HttpHeaders.IF_RANGE = "If-Range"),
          (HttpHeaders.IF_UNMODIFIED_SINCE = "If-Unmodified-Since"),
          (HttpHeaders.LAST_MODIFIED = "Last-Modified"),
          (HttpHeaders.LINK = "Link"),
          (HttpHeaders.LOCATION = "Location"),
          (HttpHeaders.MAX_FORWARDS = "Max-Forwards"),
          (HttpHeaders.ORIGIN = "Origin"),
          (HttpHeaders.PRAGMA = "Pragma"),
          (HttpHeaders.PROXY_AUTHENTICATE = "Proxy-Authenticate"),
          (HttpHeaders.PROXY_AUTHORIZATION = "Proxy-Authorization"),
          (HttpHeaders.RANGE = "Range"),
          (HttpHeaders.REFERER = "Referer"),
          (HttpHeaders.RETRY_AFTER = "Retry-After"),
          (HttpHeaders.SERVER = "Server"),
          (HttpHeaders.SET_COOKIE = "Set-Cookie"),
          (HttpHeaders.SET_COOKIE2 = "Set-Cookie2"),
          (HttpHeaders.TE = "TE"),
          (HttpHeaders.TRAILER = "Trailer"),
          (HttpHeaders.TRANSFER_ENCODING = "Transfer-Encoding"),
          (HttpHeaders.UPGRADE = "Upgrade"),
          (HttpHeaders.USER_AGENT = "User-Agent"),
          (HttpHeaders.VARY = "Vary"),
          (HttpHeaders.VIA = "Via"),
          (HttpHeaders.WARNING = "Warning"),
          (HttpHeaders.WWW_AUTHENTICATE = "WWW-Authenticate"),
          (HttpHeaders.X_REQUESTED_WITH = "X-Requested-With"));
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
  function ec(id: number): any {
    if (runtime.modules?.[id] !== undefined) return runtime.modules[id];
    if (projections.has(id)) return projections.get(id);
    if (scopeFactories[id]) {
      const value = {};
      projections.set(id, value);
      Object.assign(value, scopeFactories[id]());
      return value;
    }
    if (aliases[id]) {
      const value = {};
      projections.set(id, value);
      for (const child of aliases[id]) Object.assign(value, ec(child));
      return value;
    }
    if (cache.has(id)) return cache.get(id).exports;
    if (factories[id]) {
      const m = { exports: {} };
      cache.set(id, m);
      factories[id](m, m.exports, ec);
      return m.exports;
    }
    return (
      runtime.getModule?.(id) ??
      new Proxy(
        {},
        {
          get(_target, key) {
            throw Error(
              "Explicit native HTTP dependency required: " +
                id +
                "." +
                String(key),
            );
          },
        },
      )
    );
  }
  function scope41764() {
    const el: any = {};
    el.Middleware = Symbol("Middleware");
    let eg = ec(80699);
    let eh = class {
      constructor(eA) {
        this.middlewares = eA;
      }
      provide() {
        return (
          this.prioritized ||
            (this.prioritized = eg.Prioritizeable.prioritizeAllSync(
              this.middlewares,
            ).map((eA) => eA.value)),
          this.prioritized
        );
      }
    };
    return { ...el, "MiddlewareProvider": eh };
  }
  function scope53598() {
    const el: any = {};
    let ep = ec(36746),
      eg = ec(66410),
      eh = ec(30329),
      ef = ec(31811),
      em = ec(80699),
      eE = ec(1107),
      eC = class {
        async dispatch(eA) {
          try {
            ep.Context.setCurrent(eA);
            let el = this.middlewareProvider.provide();
            await this.handlerExecutionChain.execute(el, () =>
              this.handlerMapping.handle(),
            );
          } catch (el) {
            (this.logger.error(el), await this.handleError(eA, el));
          }
        }
        async handleError(eA, el) {
          for (let ec of this.errorHandlerProvider.provide())
            if (await ec.canHandle(eA, el)) {
              try {
                await ec.handle(eA, el);
              } catch (eA) {
                this.logger.error(eA);
                continue;
              }
              return;
            }
        }
      };
    return { ...el, "DispatcherImpl": eC };
  }
  function scope69437() {
    const el: any = {};
    let ed = ec(66410),
      ep = ec(80699),
      eg = ec(36746),
      eh = ec(1107),
      ef = class {
        execute(eA, el) {
          return (0, ed.compose)(eA)(eg.Context.getCurrent(), {
            handle: () => el(),
            priority: 0,
          });
        }
      };
    return { ...el, "HandlerExecutionChainImpl": ef };
  }
  function scope80953() {
    const el: any = {};
    let eg = ec(80699),
      eh = ec(1107),
      ef = ec(78560),
      em = ec(36746),
      eE = class {
        constructor(eA = []) {
          ((this.handlerAdapters = eA),
            (this.prioritized = eg.Prioritizeable.prioritizeAllSync(
              this.handlerAdapters,
            ).map((eA) => eA.value)));
        }
        async handle() {
          let eA;
          for (let el of this.prioritized)
            if (await el.canHandle())
              try {
                await el.handle();
                return;
              } catch (el) {
                if (el instanceof ef.NotFoundAndContinueError) eA = el;
                else throw el;
              }
          if (eA) throw eA;
          throw new ef.NotFoundError(
            `Not found a suitable handler adapter: ${em.Context.getRequest().path}`,
          );
        }
      };
    return { ...el, "HandlerMappingImpl": eE };
  }
  function scope15654() {
    const el: any = {};
    let ep = ec(42051),
      eg = ec(36746),
      eh = ec(80699),
      ef = ec(86366),
      em = class {
        constructor() {
          this.caches = new Map();
        }
        async match(eA, el) {
          let ec,
            eu = eg.Context.getRequest(),
            ed = eu.path;
          return (
            (!el ||
              !eu.method ||
              el.toUpperCase() === eu.method.toUpperCase()) &&
            ("string" == typeof (eA = eA || "/")
              ? (ec = this.caches.get(eA)) ||
                ((ec = new ef(eA)),
                this.caches.size < this.cacheSize && this.caches.set(eA, ec))
              : (ec = new ef(eA)),
            ec.match(ed))
          );
        }
      };
    return { ...el, "RequestMatcherImpl": em };
  }
  function scope94421() {
    const el: any = {};
    let ep = ec(66410),
      eg = ec(36746),
      eh = ec(80699),
      ef = ec(4709),
      em = class {
        constructor() {
          this.priority = ef.HTTP_MIDDLEWARE_PRIORITY;
        }
        async handle(eA, el) {
          let ec = eA.request.method,
            eu = eA.request.path;
          this.logger.info(`starting ${ec} ${eu}`);
          let ed = Date.now();
          try {
            await el();
            let ec = eA.response;
            eg.Context.isSkipAutoEnd() || ec.writableEnded || ec.end(ec.body);
          } finally {
            this.logger.info(`ending ${ec} ${eu} [${Date.now() - ed}ms]`);
          }
        }
      };
    return { ...el, "HttpMiddleware": em };
  }
  function scope15763() {
    const el: any = {};
    let ep = ec(20686),
      eg = ec(80699),
      eh = ec(8513),
      ef = ec(85598),
      em = class {
        async resolve(...eA) {
          let [el, ...ec] = eA.filter((eA) => !!eA);
          return el
            ? ef.UrlUtil.isAbsoluteUrl(el) || el.startsWith(this.serverPath)
              ? eg.UrlUtil.join(el, ...ec)
              : eg.UrlUtil.join(this.serverPath, el, ...ec)
            : this.serverPath;
        }
      };
    return { ...el, "PathResolverImpl": em };
  }
  function scope64423() {
    const el: any = {};
    let ep = ec(66410),
      eg = ec(36746),
      eh = ec(80699),
      ef = ec(5907),
      em = class {
        constructor() {
          this.priority = ef.TRACE_MIDDLEWARE_PRIORITY;
        }
        async handle(eA, el) {
          let ec = await this.traceIdResolver.resolve();
          (eg.Context.setTraceId(ec),
            eA.response.setHeader(this.traceField, ec),
            await el());
        }
      };
    return { ...el, "TraceMiddleware": em };
  }
  function scope37821() {
    const el: any = {};
    let ep = ec(80699),
      eg = ec(5907),
      eh = ec(36746),
      ef = class {
        resolve() {
          if (eh.Context.getRequest() && this.traceField) {
            let eA = eh.Context.getRequest().get(this.traceField);
            if (eA) return Promise.resolve(eA);
          }
          return Promise.resolve((0, ep.generateUUUID)());
        }
      };
    return { ...el, "TraceIdResolverImpl": ef };
  }
  function scope52662() {
    const el: any = {};
    let ed = ec(80699),
      ep = ec(36746),
      eg = class {
        provide() {
          return ep.Context.getTraceId();
        }
      };
    return { ...el, "TraceIdProviderImpl": eg };
  }
  function scope30329() {
    const el: any = {};
    let eg = ec(80699),
      eh = ec(24959),
      ef = ec(41585),
      em = ec(67062),
      eE = ec(88317),
      eC = class {
        constructor() {
          this.priority = eh.DEFALUT_ERROR_HANDLER_PRIORITY;
        }
        canHandle(eA, el) {
          return Promise.resolve(!0);
        }
        async handle(eA, el) {
          (console.error(el),
            (eA.response.statusCode = em.HttpStatus.INTERNAL_SERVER_ERROR),
            eA.response.end(el.message),
            await this.doHandle(eA, el));
        }
        doHandle(eA, el) {
          return Promise.resolve();
        }
      };
    let ey = class extends eC {};
    let ew = class {
      constructor() {
        this.priority = eh.HTTP_ERROR_HANDLER_PRIORITY;
      }
      canHandle(eA, el) {
        return Promise.resolve(el instanceof ef.HttpError);
      }
      async handle(eA, el) {
        ((eA.response.statusCode = el.statusCode), eA.response.end(el.message));
      }
    };
    let eB = class {
      constructor() {
        this.priority = eh.VALIDATION_ERRORS_ERROR_HANDLER_PRIORITY;
      }
      canHandle(eA, el) {
        return Promise.resolve(el instanceof eE.ValidationErrors);
      }
      async handle(eA, el) {
        ((eA.response.statusCode = em.HttpStatus.BAD_REQUEST),
          eA.response.end(el.message));
      }
    };
    let e_ = class {
      constructor(eA) {
        this.handlers = eA;
      }
      provide() {
        return (
          this.prioritized ||
            (this.prioritized = eg.Prioritizeable.prioritizeAllSync(
              this.handlers,
            ).map((eA) => eA.value)),
          this.prioritized
        );
      }
    };
    return {
      ...el,
      "AbstractErrorHandler": eC,
      "DefaultErrorHandler": ey,
      "HttpErrorHandler": ew,
      "ValidationErrorsHandler": eB,
      "ErrorHandlerProvider": e_,
    };
  }
  function scope2286() {
    const el: any = {};
    let ep = ec(80699),
      eg = ec(82524),
      eh = ec(47005),
      ef = ec(16006),
      em = ec(73385),
      eE = ec(7994),
      eC = class {
        constructor() {
          this.priority = em.MVC_HANDLER_ADAPTER_PRIORITY;
        }
        async resolveMethodArgs(eA) {
          let el = [];
          for (let ec of this.methodArgsResolverProvider.provide())
            await ec.resolve(eA, el);
          return el;
        }
        async resolveResponse(eA) {
          for (let el of this.responseResolverProvider.provide())
            await el.resolve(eA);
        }
        async handle() {
          let eA = eh.Context.getCurrent(),
            el = eA.request.path,
            ec = await this.routeMetadataMatcher.match();
          if (ec) await this.doHandle(ec);
          else
            throw new eh.NotFoundAndContinueError(
              `No mapping found: ${eA.request.method} ${el}`,
            );
        }
        async doHandle(eA, el) {
          let ec,
            eu = await this.resolveMethodArgs(eA);
          el && (eu = [el, ...eu]);
          let ed = eA.methodMetadata,
            ep = ed.target;
          try {
            (await this.pipeManager.apply({ target: ep, method: ed.key }, eu),
              (ec = await ep[ed.key](...eu)));
          } catch (ec) {
            if (el) throw ec;
            {
              let el = await this.getErrorMetadata(ec);
              (el.viewMetadata.viewName ||
                (el.viewMetadata.viewName = eA.viewMetadata.viewName),
                await this.doHandle(el, ec));
            }
          }
          (ec && (await this.viewResolver.resolve(eA, ec)),
            await this.resolveResponse(eA));
        }
        async getErrorMetadata(eA) {
          let el = await this.routeMetadataMatcher.match(eA);
          if (el) return el;
          throw eA;
        }
        async canHandle() {
          return this.requestMatcher.match(
            await this.pathResolver.resolve(this.mvcPath),
          );
        }
      };
    return { ...el, "MvcHandlerAdapter": eC };
  }
  function scope8308() {
    const el: any = {};
    el.PATH_PARMAS_ATTR = "pathParams";
    let ep = ec(80699),
      eg = ec(73385),
      eh = ec(47005);
    let ef = class {
      async match(eA) {
        let ec = await this.routeProvider.provide();
        if (eA) {
          let el = ec.errorMapping.get(eA.constructor);
          if (el) return el;
          for (let el of ec.errorMapping) if (eA instanceof el[0]) return el[1];
        } else {
          let eA = eh.Context.getRequest(),
            eu = ec.mapping.get(eA.method.toUpperCase());
          if (eu)
            for (let eA of eu) {
              let ec = await this.requestMatcher.match(eA.path);
              if (ec) return (eh.Context.setAttr(el.PATH_PARMAS_ATTR, ec), eA);
            }
        }
      }
    };
    return { ...el, "RouteMetadataMatcherImpl": ef };
  }
  function scope31135() {
    const el: any = {};
    let ep = ec(10753),
      eg = ec(90014),
      eh = ec(80699),
      ef = ec(82524),
      em = class {
        constructor() {
          this.controllers = [];
        }
        async build() {
          let eA = new Map(),
            el = new Map();
          for (let ec of this.controllers) {
            let eu = (0, eh.getTargetClass)(ec),
              ed = Reflect.getOwnMetadata(eg.METADATA_KEY.controller, eu);
            (await this.doBuildRouteMap(eA, eu, ec, ed),
              await this.doBuildErrorRouteMap(el, eu, ec, ed));
          }
          return { mapping: eA, errorMapping: el };
        }
        async doBuildRouteMap(eA, el, ec, eu) {
          for (let ed of (0, eh.getOwnMetadata)(
            eg.METADATA_KEY.controllerMethod,
            el,
          )) {
            let ep =
                "string" == typeof ed.options || ed.options instanceof RegExp
                  ? { path: ed.options }
                  : ed.options,
              eg = { ...ed },
              eh = eg.method;
            eg.target = ec;
            let ef = eA.get(eh);
            ef || ((ef = []), eA.set(eh, ef));
            let em = ep.path;
            "string" == typeof em
              ? (em = await this.pathResolver.resolve(eu.path, em))
              : em instanceof RegExp &&
                eu.path &&
                (em = new RegExp(
                  await this.pathResolver.resolve(eu.path, em.source),
                ));
            let eE = {
              path: em,
              controllerMetadata: eu,
              methodMetadata: eg,
              ...this.doRouteMetadata(el, eg.key.toString()),
            };
            ef.push(eE);
          }
          for (let [el, ec] of eA) {
            let eu = eh.Prioritizeable.prioritizeAllSync(ec, (eA) =>
              eA.path instanceof RegExp
                ? Number.MIN_SAFE_INTEGER + eA.path.toString().length
                : eA.path.includes("*")
                  ? eA.path.replace("*", "").length
                  : eA.path.length + 1,
            ).map(({ value: eA }) => eA);
            eA.set(el, eu);
          }
        }
        async doBuildErrorRouteMap(eA, el, ec, eu) {
          for (let ed of (0, eh.getOwnMetadata)(
            eg.METADATA_KEY.controllerCatch,
            el,
          )) {
            let ep = { ...ed };
            for (let eg of ((ep.target = ec), ed.errorTypes))
              eA.set(eg, {
                errorType: eg,
                controllerMetadata: eu,
                methodMetadata: ep,
                ...this.doRouteMetadata(el, ep.key.toString()),
              });
          }
        }
        doRouteMetadata(eA, el) {
          let ec = (0, eh.getOwnMetadata)(
              eg.METADATA_KEY.controllerView,
              eA,
              el,
            ),
            eu = (0, eh.getOwnMetadata)(
              eg.METADATA_KEY.controllerRequest,
              eA,
              el,
            ),
            ed = (0, eh.getOwnMetadata)(
              eg.METADATA_KEY.controllerResponse,
              eA,
              el,
            );
          return {
            requestMetadata: eu[0],
            responseMetadata: ed[0],
            paramMetadata: (0, eh.getOwnMetadata)(
              eg.METADATA_KEY.controllerParam,
              eA,
              el,
            ),
            bodyMetadata: (0, eh.getOwnMetadata)(
              eg.METADATA_KEY.controllerBody,
              eA,
              el,
            ),
            queryMetadata: (0, eh.getOwnMetadata)(
              eg.METADATA_KEY.controllerQuery,
              eA,
              el,
            ),
            requestHeaderMetadata: (0, eh.getOwnMetadata)(
              eg.METADATA_KEY.controllerRequestHeader,
              eA,
              el,
            ),
            responseHeaderMetadata: (0, eh.getOwnMetadata)(
              eg.METADATA_KEY.controllerResponseHeader,
              eA,
              el,
            ),
            requestCookieMetadata: (0, eh.getOwnMetadata)(
              eg.METADATA_KEY.controllerRequestCookie,
              eA,
              el,
            ),
            responseCookieMetadata: (0, eh.getOwnMetadata)(
              eg.METADATA_KEY.controllerResponseCookie,
              eA,
              el,
            ),
            requestSessionMetadata: (0, eh.getOwnMetadata)(
              eg.METADATA_KEY.controllerRequestSession,
              eA,
              el,
            ),
            responseSessionMetadata: (0, eh.getOwnMetadata)(
              eg.METADATA_KEY.controllerResponseSession,
              eA,
              el,
            ),
            viewMetadata: ec.length ? ec[0] : {},
          };
        }
      };
    return { ...el, "RouteBuilder": em };
  }
  function scope52203() {
    const el: any = {};
    let ep = ec(80699),
      eg = ec(73385),
      eh = ec(31135),
      ef = class {
        constructor() {
          this.routeDeferred = new ep.Deferred();
        }
        init() {
          this.routeBuilder.build().then((eA) => {
            ((this.route = eA), this.routeDeferred.resolve(eA));
          });
        }
        provide() {
          return this.routeDeferred.promise;
        }
      };
    return { ...el, "RouteProviderImpl": ef };
  }
  function scope77098() {
    const el: any = {};
    let eg = ec(80699),
      eh = ec(43439),
      ef = class {
        constructor(eA) {
          this.methodArgsResolvers = eA;
        }
        provide() {
          return (
            this.prioritized ||
              (this.prioritized = eg.Prioritizeable.prioritizeAllSync(
                this.methodArgsResolvers,
              ).map((eA) => eA.value)),
            this.prioritized
          );
        }
      };
    return { ...el, "MethodArgsResolverProvider": ef };
  }
  function scope17242() {
    const el: any = {};
    let ed = ec(43439),
      ep = ec(47005),
      eg = ec(80699),
      eh = ec(24908),
      ef = class {
        constructor() {
          this.priority = 100;
        }
        async resolve(eA, el) {
          let ec = ep.Context.getCurrent().request.body,
            eu = eA.bodyMetadata;
          if (eu && void 0 !== ec)
            for (let eA of eu)
              el[eA.parameterIndex] = eA.name ? ec[eA.name] : ec;
        }
      };
    let em = class {
      constructor() {
        this.priority = 200;
      }
      async resolve(eA, el) {
        let ec = eA.requestHeaderMetadata;
        if (ec) {
          let eA = ep.Context.getCurrent().request;
          for (let eu of ec)
            el[eu.parameterIndex] = eu.name ? eA.get(eu.name) : eA.headers;
        }
      }
    };
    let eE = class {
      constructor() {
        this.priority = 300;
      }
      async resolve(eA, el) {
        let ec = ep.Context.getAttr(eh.PATH_PARMAS_ATTR),
          eu = eA.paramMetadata;
        if (eu && ec)
          for (let eA of eu) el[eA.parameterIndex] = eA.name ? ec[eA.name] : ec;
      }
    };
    let eC = class {
      constructor() {
        this.priority = 400;
      }
      async resolve(eA, el) {
        let ec = ep.Context.getCurrent().request.query,
          eu = eA.queryMetadata;
        if (eu && void 0 !== ec)
          for (let eA of eu) el[eA.parameterIndex] = eA.name ? ec[eA.name] : ec;
      }
    };
    let ey = class {
      constructor() {
        this.priority = 500;
      }
      async resolve(eA, el) {
        let ec = ep.Context.getCookies(),
          eu = eA.requestCookieMetadata;
        if (eu && void 0 !== ec)
          for (let eA of eu)
            el[eA.parameterIndex] = eA.name ? ec.get(eA.name) : ec;
      }
    };
    let ew = class {
      constructor() {
        this.priority = 600;
      }
      async resolve(eA, el) {
        let ec = ep.Context.getSession(),
          eu = eA.requestSessionMetadata;
        if (eu && void 0 !== ec)
          for (let eA of eu) el[eA.parameterIndex] = eA.name ? ec[eA.name] : ec;
      }
    };
    let eB = class {
      constructor() {
        this.priority = 700;
      }
      async resolve(eA, el) {
        let ec = eA.requestMetadata;
        ec && (el[ec.parameterIndex] = ep.Context.getRequest());
      }
    };
    let e_ = class {
      constructor() {
        this.priority = 800;
      }
      async resolve(eA, el) {
        let ec = eA.responseMetadata;
        ec && (el[ec.parameterIndex] = ep.Context.getResponse());
      }
    };
    return {
      ...el,
      "BodyMethodArgsResolver": ef,
      "HeaderMethodArgsResolver": em,
      "ParamMethodArgsResolver": eE,
      "QueryMethodArgsResolver": eC,
      "CookieMethodArgsResolver": ey,
      "SessionMethodArgsResolver": ew,
      "RequestMethodArgsResolver": eB,
      "ResponseMethodArgsResolver": e_,
    };
  }
  function scope75286() {
    const el: any = {};
    let eg = ec(80699),
      eh = ec(43439),
      ef = class {
        constructor(eA) {
          this.responseResolvers = eA;
        }
        provide() {
          return (
            this.prioritized ||
              (this.prioritized = eg.Prioritizeable.prioritizeAllSync(
                this.responseResolvers,
              ).map((eA) => eA.value)),
            this.prioritized
          );
        }
      };
    return { ...el, "ResponseResolverProvider": ef };
  }
  function scope19590() {
    const el: any = {};
    let ed = ec(43439),
      ep = ec(47005),
      eg = ec(80699),
      eh = class {
        constructor() {
          this.priority = 500;
        }
        async resolve(eA) {
          let el = ep.Context.getCurrent().response,
            ec = eA.responseHeaderMetadata;
          if (ec) for (let eA of ec) el.setHeader(eA.name, eA.value);
        }
      };
    let ef = class {
      constructor() {
        this.priority = 500;
      }
      async resolve(eA) {
        let el = ep.Context.getCookies(),
          ec = eA.responseCookieMetadata;
        if (ec && el) for (let eA of ec) el.set(eA.name, eA.value);
      }
    };
    let em = class {
      constructor() {
        this.priority = 500;
      }
      async resolve(eA) {
        let el = ep.Context.getSession(),
          ec = eA.responseSessionMetadata;
        if (ec && el) for (let eA of ec) el[eA.name] = eA.value;
      }
    };
    return {
      ...el,
      "SessionResponseResolver": em,
      "CookieResponseResolver": ef,
      "HeaderResponseResolver": eh,
    };
  }
  function scope39716() {
    const el: any = {};
    let eg = ec(80699),
      eh = ec(43439),
      ef = class {
        constructor(eA) {
          this.viewResolvers = eA;
        }
        provide() {
          return (
            this.prioritized ||
              (this.prioritized = eg.Prioritizeable.prioritizeAllSync(
                this.viewResolvers,
              ).map((eA) => eA.value)),
            this.prioritized
          );
        }
      };
    return { ...el, "ViewResolverProvider": ef };
  }
  function scope46328() {
    const el: any = {};
    let ep = ec(43439),
      eg = ec(80699),
      eh = ec(92444),
      ef = ec(47005),
      em = ec(67062),
      eE = class {
        async resolve(eA, el) {
          let ec = eA.viewMetadata;
          for (let eA of ((ec.viewName = ec.viewName || this.defaultViewName),
          this.viewProvider.provide()))
            if (await eA.support(ec)) {
              (ef.Context.getResponse().setHeader(
                em.HttpHeaders.CONTENT_TYPE,
                eA.contentType,
              ),
                await eA.render(el, ec));
              return;
            }
          throw Error("Not found a suitable view.");
        }
      };
    return { ...el, "ViewResolverImpl": eE };
  }
  function scope92444() {
    const el: any = {};
    let eg = ec(80699),
      eh = ec(20397),
      ef = class {
        constructor(eA) {
          this.views = eA;
        }
        provide() {
          return (
            this.prioritized ||
              (this.prioritized = eg.Prioritizeable.prioritizeAllSync(
                this.views,
              ).map((eA) => eA.value)),
            this.prioritized
          );
        }
      };
    return { ...el, "ViewProvider": ef };
  }
  const scopeFactories: any = {
    41764: scope41764,
    53598: scope53598,
    69437: scope69437,
    80953: scope80953,
    15654: scope15654,
    94421: scope94421,
    15763: scope15763,
    64423: scope64423,
    37821: scope37821,
    52662: scope52662,
    30329: scope30329,
    2286: scope2286,
    8308: scope8308,
    31135: scope31135,
    52203: scope52203,
    77098: scope77098,
    17242: scope17242,
    75286: scope75286,
    19590: scope19590,
    39716: scope39716,
    46328: scope46328,
    92444: scope92444,
  };
  const load: any = (id: number) => {
    if (projections.has(id)) return projections.get(id);
    return ec(id);
  };
  // Resolve only the explicitly restored projection of the original aggregate modules.
  const baseEc = ec;
  const resolve = load;
  return {
    getModule: resolve,
    get Context() {
      return ec(36746).Context;
    },
    get BaseContext() {
      return ec(30805).Context;
    },
    get AttributeScope() {
      return ec(30805).AttributeScope;
    },
    get cls() {
      return ec(63192);
    },
    get classes() {
      return Object.assign(
        {},
        ...Object.keys(scopeFactories).map((id) => load(Number(id))),
      );
    },
    get common() {
      return {
        ...ec(26052),
        ...ec(99600),
        ...ec(57045),
        ...ec(78881),
        ...ec(27194),
        ...ec(8461),
      };
    },
  };
}

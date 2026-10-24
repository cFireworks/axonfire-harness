// @ts-nocheck
// Original context API, registry, diagnostics, ALS manager and suppressed export bridge.
export const EXPORT_CONTEXT_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export const EXPORT_CONTEXT_REGIONS = [[1007925, 1008091]] as const;
export const EXPORT_CONTEXT_MODULES = [
  [65890, 1013976, 1014406],
  [33835, 972463, 972569],
  [57717, 963510, 966135],
  [98902, 972570, 973137],
  [1801, 995489, 996175],
  [70647, 976920, 978695],
  [58583, 966136, 970272],
  [87819, 992098, 994259],
  [79232, 973235, 973501],
] as const;
export function createNativeExportContext(runtime: any) {
  if (!runtime?.registry)
    throw Error("Explicit OpenTelemetry global registry required");
  const globalThis = runtime.registry,
    global = runtime.registry;
  const factories = {
      65890(eA, el, ec) {
        "use strict";
        (ec.r(el),
          ec.d(el, {
            isTracingSuppressed: () => isTracingSuppressed,
            suppressTracing: () => suppressTracing,
            unsuppressTracing: () => unsuppressTracing,
          }));
        var eu = (0, ec(98902).createContextKey)(
          "OpenTelemetry SDK Context Key SUPPRESS_TRACING",
        );
        function suppressTracing(eA) {
          return eA.setValue(eu, !0);
        }
        function unsuppressTracing(eA) {
          return eA.deleteValue(eu);
        }
        function isTracingSuppressed(eA) {
          return !0 === eA.getValue(eu);
        }
      },
      33835(eA, el, ec) {
        "use strict";
        (ec.r(el), ec.d(el, { context: () => eu }));
        var eu = ec(57717).ContextAPI.getInstance();
      },
      57717(eA, el, ec) {
        "use strict";
        (ec.r(el), ec.d(el, { ContextAPI: () => em }));
        var eu = ec(98902),
          __read = function (eA, el) {
            var ec = "function" == typeof Symbol && eA[Symbol.iterator];
            if (!ec) return eA;
            var eu,
              ed,
              ep = ec.call(eA),
              eg = [];
            try {
              for (; (void 0 === el || el-- > 0) && !(eu = ep.next()).done; )
                eg.push(eu.value);
            } catch (eA) {
              ed = { error: eA };
            } finally {
              try {
                eu && !eu.done && (ec = ep.return) && ec.call(ep);
              } finally {
                if (ed) throw ed.error;
              }
            }
            return eg;
          },
          __spreadArray = function (eA, el, ec) {
            if (ec || 2 == arguments.length)
              for (var eu, ed = 0, ep = el.length; ed < ep; ed++)
                (!eu && ed in el) ||
                  (eu || (eu = Array.prototype.slice.call(el, 0, ed)),
                  (eu[ed] = el[ed]));
            return eA.concat(eu || Array.prototype.slice.call(el));
          },
          ed = (function () {
            function NoopContextManager() {}
            return (
              (NoopContextManager.prototype.active = function () {
                return eu.ROOT_CONTEXT;
              }),
              (NoopContextManager.prototype.with = function (eA, el, ec) {
                for (var eu = [], ed = 3; ed < arguments.length; ed++)
                  eu[ed - 3] = arguments[ed];
                return el.call.apply(el, __spreadArray([ec], __read(eu), !1));
              }),
              (NoopContextManager.prototype.bind = function (eA, el) {
                return el;
              }),
              (NoopContextManager.prototype.enable = function () {
                return this;
              }),
              (NoopContextManager.prototype.disable = function () {
                return this;
              }),
              NoopContextManager
            );
          })(),
          ep = ec(70647),
          eg = ec(58583),
          context_read = function (eA, el) {
            var ec = "function" == typeof Symbol && eA[Symbol.iterator];
            if (!ec) return eA;
            var eu,
              ed,
              ep = ec.call(eA),
              eg = [];
            try {
              for (; (void 0 === el || el-- > 0) && !(eu = ep.next()).done; )
                eg.push(eu.value);
            } catch (eA) {
              ed = { error: eA };
            } finally {
              try {
                eu && !eu.done && (ec = ep.return) && ec.call(ep);
              } finally {
                if (ed) throw ed.error;
              }
            }
            return eg;
          },
          context_spreadArray = function (eA, el, ec) {
            if (ec || 2 == arguments.length)
              for (var eu, ed = 0, ep = el.length; ed < ep; ed++)
                (!eu && ed in el) ||
                  (eu || (eu = Array.prototype.slice.call(el, 0, ed)),
                  (eu[ed] = el[ed]));
            return eA.concat(eu || Array.prototype.slice.call(el));
          },
          eh = "context",
          ef = new ed(),
          em = (function () {
            function ContextAPI() {}
            return (
              (ContextAPI.getInstance = function () {
                return (
                  this._instance || (this._instance = new ContextAPI()),
                  this._instance
                );
              }),
              (ContextAPI.prototype.setGlobalContextManager = function (eA) {
                return (0, ep.registerGlobal)(eh, eA, eg.DiagAPI.instance());
              }),
              (ContextAPI.prototype.active = function () {
                return this._getContextManager().active();
              }),
              (ContextAPI.prototype.with = function (eA, el, ec) {
                for (var eu, ed = [], ep = 3; ep < arguments.length; ep++)
                  ed[ep - 3] = arguments[ep];
                return (eu = this._getContextManager()).with.apply(
                  eu,
                  context_spreadArray([eA, el, ec], context_read(ed), !1),
                );
              }),
              (ContextAPI.prototype.bind = function (eA, el) {
                return this._getContextManager().bind(eA, el);
              }),
              (ContextAPI.prototype._getContextManager = function () {
                return (0, ep.getGlobal)(eh) || ef;
              }),
              (ContextAPI.prototype.disable = function () {
                (this._getContextManager().disable(),
                  (0, ep.unregisterGlobal)(eh, eg.DiagAPI.instance()));
              }),
              ContextAPI
            );
          })();
      },
      98902(eA, el, ec) {
        "use strict";
        function createContextKey(eA) {
          return Symbol.for(eA);
        }
        (ec.r(el),
          ec.d(el, {
            ROOT_CONTEXT: () => eu,
            createContextKey: () => createContextKey,
          }));
        var eu = new ((function () {
          function BaseContext(eA) {
            var el = this;
            ((el._currentContext = eA ? new Map(eA) : new Map()),
              (el.getValue = function (eA) {
                return el._currentContext.get(eA);
              }),
              (el.setValue = function (eA, ec) {
                var eu = new BaseContext(el._currentContext);
                return (eu._currentContext.set(eA, ec), eu);
              }),
              (el.deleteValue = function (eA) {
                var ec = new BaseContext(el._currentContext);
                return (ec._currentContext.delete(eA), ec);
              }));
          }
          return BaseContext;
        })())();
      },
      1801(eA, el, ec) {
        "use strict";
        (Object.defineProperty(el, "__esModule", { value: !0 }),
          (el.AsyncLocalStorageContextManager = void 0));
        let eu = ec(47763),
          ed = ec(90290),
          ep = ec(87819);
        let AsyncLocalStorageContextManager = class AsyncLocalStorageContextManager extends ep.AbstractAsyncHooksContextManager {
          constructor() {
            (super(), (this._asyncLocalStorage = new ed.AsyncLocalStorage()));
          }
          active() {
            var eA;
            return null != (eA = this._asyncLocalStorage.getStore())
              ? eA
              : eu.ROOT_CONTEXT;
          }
          with(eA, el, ec, ...eu) {
            let ed = null == ec ? el : el.bind(ec);
            return this._asyncLocalStorage.run(eA, ed, ...eu);
          }
          enable() {
            return this;
          }
          disable() {
            return (this._asyncLocalStorage.disable(), this);
          }
        };
        el.AsyncLocalStorageContextManager = AsyncLocalStorageContextManager;
      },
      70647(eA, el, ec) {
        "use strict";
        (ec.r(el),
          ec.d(el, {
            registerGlobal: () => registerGlobal,
            getGlobal: () => getGlobal,
            unregisterGlobal: () => unregisterGlobal,
          }));
        var eu = "object" == typeof globalThis ? globalThis : global,
          ed = "1.9.0",
          ep = /^(\d+)\.(\d+)\.(\d+)(-(.+))?$/,
          eg = (function (eA) {
            var el = new Set([eA]),
              ec = new Set(),
              eu = eA.match(ep);
            if (!eu)
              return function () {
                return !1;
              };
            var ed = {
              major: +eu[1],
              minor: +eu[2],
              patch: +eu[3],
              prerelease: eu[4],
            };
            if (null != ed.prerelease)
              return function (el) {
                return el === eA;
              };
            function _reject(eA) {
              return (ec.add(eA), !1);
            }
            function _accept(eA) {
              return (el.add(eA), !0);
            }
            return function (eA) {
              if (el.has(eA)) return !0;
              if (ec.has(eA)) return !1;
              var eu = eA.match(ep);
              if (!eu) return _reject(eA);
              var eg = {
                major: +eu[1],
                minor: +eu[2],
                patch: +eu[3],
                prerelease: eu[4],
              };
              return null != eg.prerelease || ed.major !== eg.major
                ? _reject(eA)
                : 0 === ed.major
                  ? ed.minor === eg.minor && ed.patch <= eg.patch
                    ? _accept(eA)
                    : _reject(eA)
                  : ed.minor <= eg.minor
                    ? _accept(eA)
                    : _reject(eA);
            };
          })(ed),
          eh = Symbol.for("opentelemetry.js.api." + ed.split(".")[0]),
          ef = eu;
        function registerGlobal(eA, el, ec, eu) {
          void 0 === eu && (eu = !1);
          var ep,
            eg = (ef[eh] = null != (ep = ef[eh]) ? ep : { version: ed });
          if (!eu && eg[eA]) {
            var em = Error(
              "@opentelemetry/api: Attempted duplicate registration of API: " +
                eA,
            );
            return (ec.error(em.stack || em.message), !1);
          }
          if (eg.version !== ed) {
            var em = Error(
              "@opentelemetry/api: Registration of version v" +
                eg.version +
                " for " +
                eA +
                " does not match previously registered API v" +
                ed,
            );
            return (ec.error(em.stack || em.message), !1);
          }
          return (
            (eg[eA] = el),
            ec.debug(
              "@opentelemetry/api: Registered a global for " +
                eA +
                " v" +
                ed +
                ".",
            ),
            !0
          );
        }
        function getGlobal(eA) {
          var el,
            ec,
            eu = null == (el = ef[eh]) ? void 0 : el.version;
          if (eu && eg(eu)) return null == (ec = ef[eh]) ? void 0 : ec[eA];
        }
        function unregisterGlobal(eA, el) {
          el.debug(
            "@opentelemetry/api: Unregistering a global for " +
              eA +
              " v" +
              ed +
              ".",
          );
          var ec = ef[eh];
          ec && delete ec[eA];
        }
      },
      58583(eA, el, ec) {
        "use strict";
        (ec.r(el), ec.d(el, { DiagAPI: () => eh }));
        var eu = ec(70647),
          __read = function (eA, el) {
            var ec = "function" == typeof Symbol && eA[Symbol.iterator];
            if (!ec) return eA;
            var eu,
              ed,
              ep = ec.call(eA),
              eg = [];
            try {
              for (; (void 0 === el || el-- > 0) && !(eu = ep.next()).done; )
                eg.push(eu.value);
            } catch (eA) {
              ed = { error: eA };
            } finally {
              try {
                eu && !eu.done && (ec = ep.return) && ec.call(ep);
              } finally {
                if (ed) throw ed.error;
              }
            }
            return eg;
          },
          __spreadArray = function (eA, el, ec) {
            if (ec || 2 == arguments.length)
              for (var eu, ed = 0, ep = el.length; ed < ep; ed++)
                (!eu && ed in el) ||
                  (eu || (eu = Array.prototype.slice.call(el, 0, ed)),
                  (eu[ed] = el[ed]));
            return eA.concat(eu || Array.prototype.slice.call(el));
          },
          ed = (function () {
            function DiagComponentLogger(eA) {
              this._namespace = eA.namespace || "DiagComponentLogger";
            }
            return (
              (DiagComponentLogger.prototype.debug = function () {
                for (var eA = [], el = 0; el < arguments.length; el++)
                  eA[el] = arguments[el];
                return logProxy("debug", this._namespace, eA);
              }),
              (DiagComponentLogger.prototype.error = function () {
                for (var eA = [], el = 0; el < arguments.length; el++)
                  eA[el] = arguments[el];
                return logProxy("error", this._namespace, eA);
              }),
              (DiagComponentLogger.prototype.info = function () {
                for (var eA = [], el = 0; el < arguments.length; el++)
                  eA[el] = arguments[el];
                return logProxy("info", this._namespace, eA);
              }),
              (DiagComponentLogger.prototype.warn = function () {
                for (var eA = [], el = 0; el < arguments.length; el++)
                  eA[el] = arguments[el];
                return logProxy("warn", this._namespace, eA);
              }),
              (DiagComponentLogger.prototype.verbose = function () {
                for (var eA = [], el = 0; el < arguments.length; el++)
                  eA[el] = arguments[el];
                return logProxy("verbose", this._namespace, eA);
              }),
              DiagComponentLogger
            );
          })();
        function logProxy(eA, el, ec) {
          var ed = (0, eu.getGlobal)("diag");
          if (ed)
            return (
              ec.unshift(el),
              ed[eA].apply(ed, __spreadArray([], __read(ec), !1))
            );
        }
        var ep = ec(79232);
        function createLogLevelDiagLogger(eA, el) {
          function _filterFunc(ec, eu) {
            var ed = el[ec];
            return "function" == typeof ed && eA >= eu
              ? ed.bind(el)
              : function () {};
          }
          return (
            eA < ep.DiagLogLevel.NONE
              ? (eA = ep.DiagLogLevel.NONE)
              : eA > ep.DiagLogLevel.ALL && (eA = ep.DiagLogLevel.ALL),
            (el = el || {}),
            {
              error: _filterFunc("error", ep.DiagLogLevel.ERROR),
              warn: _filterFunc("warn", ep.DiagLogLevel.WARN),
              info: _filterFunc("info", ep.DiagLogLevel.INFO),
              debug: _filterFunc("debug", ep.DiagLogLevel.DEBUG),
              verbose: _filterFunc("verbose", ep.DiagLogLevel.VERBOSE),
            }
          );
        }
        var diag_read = function (eA, el) {
            var ec = "function" == typeof Symbol && eA[Symbol.iterator];
            if (!ec) return eA;
            var eu,
              ed,
              ep = ec.call(eA),
              eg = [];
            try {
              for (; (void 0 === el || el-- > 0) && !(eu = ep.next()).done; )
                eg.push(eu.value);
            } catch (eA) {
              ed = { error: eA };
            } finally {
              try {
                eu && !eu.done && (ec = ep.return) && ec.call(ep);
              } finally {
                if (ed) throw ed.error;
              }
            }
            return eg;
          },
          diag_spreadArray = function (eA, el, ec) {
            if (ec || 2 == arguments.length)
              for (var eu, ed = 0, ep = el.length; ed < ep; ed++)
                (!eu && ed in el) ||
                  (eu || (eu = Array.prototype.slice.call(el, 0, ed)),
                  (eu[ed] = el[ed]));
            return eA.concat(eu || Array.prototype.slice.call(el));
          },
          eg = "diag",
          eh = (function () {
            function DiagAPI() {
              function _logProxy(eA) {
                return function () {
                  for (var el = [], ec = 0; ec < arguments.length; ec++)
                    el[ec] = arguments[ec];
                  var ed = (0, eu.getGlobal)("diag");
                  if (ed)
                    return ed[eA].apply(
                      ed,
                      diag_spreadArray([], diag_read(el), !1),
                    );
                };
              }
              var eA = this,
                setLogger = function (el, ec) {
                  if (
                    (void 0 === ec && (ec = { logLevel: ep.DiagLogLevel.INFO }),
                    el === eA)
                  ) {
                    var ed,
                      eg,
                      eh,
                      ef = Error(
                        "Cannot use diag as the logger for itself. Please use a DiagLogger implementation like ConsoleDiagLogger or a custom implementation",
                      );
                    return (
                      eA.error(null != (ed = ef.stack) ? ed : ef.message),
                      !1
                    );
                  }
                  "number" == typeof ec && (ec = { logLevel: ec });
                  var em = (0, eu.getGlobal)("diag"),
                    eE = createLogLevelDiagLogger(
                      null != (eg = ec.logLevel) ? eg : ep.DiagLogLevel.INFO,
                      el,
                    );
                  if (em && !ec.suppressOverrideMessage) {
                    var eC =
                      null != (eh = Error().stack)
                        ? eh
                        : "<failed to generate stacktrace>";
                    (em.warn("Current logger will be overwritten from " + eC),
                      eE.warn(
                        "Current logger will overwrite one already registered from " +
                          eC,
                      ));
                  }
                  return (0, eu.registerGlobal)("diag", eE, eA, !0);
                };
              ((eA.setLogger = setLogger),
                (eA.disable = function () {
                  (0, eu.unregisterGlobal)(eg, eA);
                }),
                (eA.createComponentLogger = function (eA) {
                  return new ed(eA);
                }),
                (eA.verbose = _logProxy("verbose")),
                (eA.debug = _logProxy("debug")),
                (eA.info = _logProxy("info")),
                (eA.warn = _logProxy("warn")),
                (eA.error = _logProxy("error")));
            }
            return (
              (DiagAPI.instance = function () {
                return (
                  this._instance || (this._instance = new DiagAPI()),
                  this._instance
                );
              }),
              DiagAPI
            );
          })();
      },
      87819(eA, el, ec) {
        "use strict";
        (Object.defineProperty(el, "__esModule", { value: !0 }),
          (el.AbstractAsyncHooksContextManager = void 0));
        let eu = ec(24434),
          ed = [
            "addListener",
            "on",
            "once",
            "prependListener",
            "prependOnceListener",
          ];
        let AbstractAsyncHooksContextManager = class AbstractAsyncHooksContextManager {
          constructor() {
            ((this._kOtListeners = Symbol("OtListeners")),
              (this._wrapped = !1));
          }
          bind(eA, el) {
            return el instanceof eu.EventEmitter
              ? this._bindEventEmitter(eA, el)
              : "function" == typeof el
                ? this._bindFunction(eA, el)
                : el;
          }
          _bindFunction(eA, el) {
            let ec = this,
              contextWrapper = function (...eu) {
                return ec.with(eA, () => el.apply(this, eu));
              };
            return (
              Object.defineProperty(contextWrapper, "length", {
                enumerable: !1,
                configurable: !0,
                writable: !1,
                value: el.length,
              }),
              contextWrapper
            );
          }
          _bindEventEmitter(eA, el) {
            return (
              void 0 !== this._getPatchMap(el) ||
                (this._createPatchMap(el),
                ed.forEach((ec) => {
                  void 0 !== el[ec] &&
                    (el[ec] = this._patchAddListener(el, el[ec], eA));
                }),
                "function" == typeof el.removeListener &&
                  (el.removeListener = this._patchRemoveListener(
                    el,
                    el.removeListener,
                  )),
                "function" == typeof el.off &&
                  (el.off = this._patchRemoveListener(el, el.off)),
                "function" == typeof el.removeAllListeners &&
                  (el.removeAllListeners = this._patchRemoveAllListeners(
                    el,
                    el.removeAllListeners,
                  ))),
              el
            );
          }
          _patchRemoveListener(eA, el) {
            let ec = this;
            return function (eu, ed) {
              var ep;
              let eg = null == (ep = ec._getPatchMap(eA)) ? void 0 : ep[eu];
              if (void 0 === eg) return el.call(this, eu, ed);
              let eh = eg.get(ed);
              return el.call(this, eu, eh || ed);
            };
          }
          _patchRemoveAllListeners(eA, el) {
            let ec = this;
            return function (eu) {
              let ed = ec._getPatchMap(eA);
              return (
                void 0 !== ed &&
                  (0 == arguments.length
                    ? ec._createPatchMap(eA)
                    : void 0 !== ed[eu] && delete ed[eu]),
                el.apply(this, arguments)
              );
            };
          }
          _patchAddListener(eA, el, ec) {
            let eu = this;
            return function (ed, ep) {
              if (eu._wrapped) return el.call(this, ed, ep);
              let eg = eu._getPatchMap(eA);
              void 0 === eg && (eg = eu._createPatchMap(eA));
              let eh = eg[ed];
              void 0 === eh && ((eh = new WeakMap()), (eg[ed] = eh));
              let ef = eu.bind(ec, ep);
              (eh.set(ep, ef), (eu._wrapped = !0));
              try {
                return el.call(this, ed, ef);
              } finally {
                eu._wrapped = !1;
              }
            };
          }
          _createPatchMap(eA) {
            let el = Object.create(null);
            return ((eA[this._kOtListeners] = el), el);
          }
          _getPatchMap(eA) {
            return eA[this._kOtListeners];
          }
        };
        el.AbstractAsyncHooksContextManager = AbstractAsyncHooksContextManager;
      },
      79232(eA, el, ec) {
        "use strict";
        var eu;
        (ec.r(el),
          ec.d(el, { DiagLogLevel: () => eu }),
          (function (eA) {
            ((eA[(eA.NONE = 0)] = "NONE"),
              (eA[(eA.ERROR = 30)] = "ERROR"),
              (eA[(eA.WARN = 50)] = "WARN"),
              (eA[(eA.INFO = 60)] = "INFO"),
              (eA[(eA.DEBUG = 70)] = "DEBUG"),
              (eA[(eA.VERBOSE = 80)] = "VERBOSE"),
              (eA[(eA.ALL = 9999)] = "ALL"));
          })(eu || (eu = {})));
      },
    },
    cache = new Map();
  function ec(id: number): any {
    if (id === 47763) return { ...ec(98902), ...ec(33835) };
    if (cache.has(id)) return cache.get(id);
    if (factories[id]) {
      const m = { exports: {} };
      cache.set(id, m.exports);
      factories[id](m, m.exports, ec);
      return m.exports;
    }
    const v = runtime.modules?.[id];
    if (v === undefined)
      throw Error("Explicit context builtin required: " + id);
    return v;
  }
  ec.r = (o: any) => Object.defineProperty(o, "__esModule", { value: true });
  ec.d = (o: any, defs: any) => {
    for (const k of Object.keys(defs))
      Object.defineProperty(o, k, { enumerable: true, get: defs[k] });
  };
  const eP = ec(33835),
    eR = ec(65890);
  function _export(eA, el) {
    return new Promise(function (ec) {
      eP.context.with(
        (0, eR.suppressTracing)(eP.context.active()),
        function () {
          eA.export(el, function (eA) {
            ec(eA);
          });
        },
      );
    });
  }
  return {
    ...eP,
    ...eR,
    ...ec(98902),
    ...ec(1801),
    diag: ec(58583).DiagAPI.instance(),
    internal: { _export },
    getModule: ec,
  };
}

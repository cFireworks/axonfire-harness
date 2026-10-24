// @ts-nocheck
// Captured log records, logger provider, batch processors and parent factories.
export const LOGGER_PROVIDER_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export const LOGGER_PROVIDER_REGIONS = [
  [8061283, 8065983],
  [8065983, 8066277],
  [8066277, 8066781],
  [8066781, 8069916],
  [8069916, 8070047],
  [8070047, 8079334],
] as const;
export const LOGGER_PROVIDER_MODULES = [
  [32704, 962782, 963509],
  [99997, 960395, 960594],
  [32192, 1021568, 1024324],
  [30460, 1014407, 1016229],
  [71664, 991213, 991778],
  [95497, 999953, 1002020],
  [4439, 1024666, 1025742],
  [67177, 990720, 990975],
  [6461, 986445, 987362],
  [14138, 991948, 992097],
  [88752, 990003, 990719],
  [60002, 1002021, 1002656],
  [61549, 1009034, 1009144],
  [36275, 996612, 996771],
] as const;
export function createNativeLoggerProvider(runtime: any) {
  const factories = {
      32704(eA, el, ec) {
        "use strict";
        var eu;
        (ec.r(el),
          ec.d(el, { SeverityNumber: () => eu }),
          (function (eA) {
            ((eA[(eA.UNSPECIFIED = 0)] = "UNSPECIFIED"),
              (eA[(eA.TRACE = 1)] = "TRACE"),
              (eA[(eA.TRACE2 = 2)] = "TRACE2"),
              (eA[(eA.TRACE3 = 3)] = "TRACE3"),
              (eA[(eA.TRACE4 = 4)] = "TRACE4"),
              (eA[(eA.DEBUG = 5)] = "DEBUG"),
              (eA[(eA.DEBUG2 = 6)] = "DEBUG2"),
              (eA[(eA.DEBUG3 = 7)] = "DEBUG3"),
              (eA[(eA.DEBUG4 = 8)] = "DEBUG4"),
              (eA[(eA.INFO = 9)] = "INFO"),
              (eA[(eA.INFO2 = 10)] = "INFO2"),
              (eA[(eA.INFO3 = 11)] = "INFO3"),
              (eA[(eA.INFO4 = 12)] = "INFO4"),
              (eA[(eA.WARN = 13)] = "WARN"),
              (eA[(eA.WARN2 = 14)] = "WARN2"),
              (eA[(eA.WARN3 = 15)] = "WARN3"),
              (eA[(eA.WARN4 = 16)] = "WARN4"),
              (eA[(eA.ERROR = 17)] = "ERROR"),
              (eA[(eA.ERROR2 = 18)] = "ERROR2"),
              (eA[(eA.ERROR3 = 19)] = "ERROR3"),
              (eA[(eA.ERROR4 = 20)] = "ERROR4"),
              (eA[(eA.FATAL = 21)] = "FATAL"),
              (eA[(eA.FATAL2 = 22)] = "FATAL2"),
              (eA[(eA.FATAL3 = 23)] = "FATAL3"),
              (eA[(eA.FATAL4 = 24)] = "FATAL4"));
          })(eu || (eu = {})));
      },
      99997(eA, el, ec) {
        "use strict";
        (ec.r(el), ec.d(el, { NOOP_LOGGER: () => ed, NoopLogger: () => eu }));
        var eu = (function () {
            function NoopLogger() {}
            return ((NoopLogger.prototype.emit = function (eA) {}), NoopLogger);
          })(),
          ed = new eu();
      },
      32192(eA, el, ec) {
        "use strict";
        (ec.r(el), ec.d(el, { merge: () => merge }));
        var eu = "[object Object]",
          ed = "[object Null]",
          ep = "[object Undefined]",
          eg = Function.prototype.toString,
          eh = eg.call(Object),
          ef = overArg(Object.getPrototypeOf, Object),
          em = Object.prototype,
          eE = em.hasOwnProperty,
          eC = Symbol ? Symbol.toStringTag : void 0,
          ey = em.toString;
        function overArg(eA, el) {
          return function (ec) {
            return eA(el(ec));
          };
        }
        function isPlainObject(eA) {
          if (!isObjectLike(eA) || baseGetTag(eA) !== eu) return !1;
          var el = ef(eA);
          if (null === el) return !0;
          var ec = eE.call(el, "constructor") && el.constructor;
          return (
            "function" == typeof ec && ec instanceof ec && eg.call(ec) === eh
          );
        }
        function isObjectLike(eA) {
          return null != eA && "object" == typeof eA;
        }
        function baseGetTag(eA) {
          return null == eA
            ? void 0 === eA
              ? ep
              : ed
            : eC && eC in Object(eA)
              ? getRawTag(eA)
              : objectToString(eA);
        }
        function getRawTag(eA) {
          var el = eE.call(eA, eC),
            ec = eA[eC],
            eu = !1;
          try {
            ((eA[eC] = void 0), (eu = !0));
          } catch (eA) {}
          var ed = ey.call(eA);
          return (eu && (el ? (eA[eC] = ec) : delete eA[eC]), ed);
        }
        function objectToString(eA) {
          return ey.call(eA);
        }
        var ew = 20;
        function merge() {
          for (var eA = [], el = 0; el < arguments.length; el++)
            eA[el] = arguments[el];
          for (var ec = eA.shift(), eu = new WeakMap(); eA.length > 0; )
            ec = mergeTwoObjects(ec, eA.shift(), 0, eu);
          return ec;
        }
        function takeValue(eA) {
          return isArray(eA) ? eA.slice() : eA;
        }
        function mergeTwoObjects(eA, el, ec, eu) {
          if ((void 0 === ec && (ec = 0), !(ec > ew))) {
            if ((ec++, isPrimitive(eA) || isPrimitive(el) || isFunction(el)))
              ed = takeValue(el);
            else if (isArray(eA)) {
              if (((ed = eA.slice()), isArray(el)))
                for (var ed, ep = 0, eg = el.length; ep < eg; ep++)
                  ed.push(takeValue(el[ep]));
              else if (isObject(el))
                for (
                  var eh = Object.keys(el), ep = 0, eg = eh.length;
                  ep < eg;
                  ep++
                ) {
                  var ef = eh[ep];
                  ed[ef] = takeValue(el[ef]);
                }
            } else if (isObject(eA))
              if (isObject(el)) {
                if (!shouldMerge(eA, el)) return el;
                ed = Object.assign({}, eA);
                for (
                  var eh = Object.keys(el), ep = 0, eg = eh.length;
                  ep < eg;
                  ep++
                ) {
                  var ef = eh[ep],
                    em = el[ef];
                  if (isPrimitive(em))
                    void 0 === em ? delete ed[ef] : (ed[ef] = em);
                  else {
                    var eE = ed[ef],
                      eC = em;
                    if (
                      wasObjectReferenced(eA, ef, eu) ||
                      wasObjectReferenced(el, ef, eu)
                    )
                      delete ed[ef];
                    else {
                      if (isObject(eE) && isObject(eC)) {
                        var ey = eu.get(eE) || [],
                          eB = eu.get(eC) || [];
                        (ey.push({ obj: eA, key: ef }),
                          eB.push({ obj: el, key: ef }),
                          eu.set(eE, ey),
                          eu.set(eC, eB));
                      }
                      ed[ef] = mergeTwoObjects(ed[ef], em, ec, eu);
                    }
                  }
                }
              } else ed = el;
            return ed;
          }
        }
        function wasObjectReferenced(eA, el, ec) {
          for (
            var eu = ec.get(eA[el]) || [], ed = 0, ep = eu.length;
            ed < ep;
            ed++
          ) {
            var eg = eu[ed];
            if (eg.key === el && eg.obj === eA) return !0;
          }
          return !1;
        }
        function isArray(eA) {
          return Array.isArray(eA);
        }
        function isFunction(eA) {
          return "function" == typeof eA;
        }
        function isObject(eA) {
          return (
            !isPrimitive(eA) &&
            !isArray(eA) &&
            !isFunction(eA) &&
            "object" == typeof eA
          );
        }
        function isPrimitive(eA) {
          return (
            "string" == typeof eA ||
            "number" == typeof eA ||
            "boolean" == typeof eA ||
            void 0 === eA ||
            eA instanceof Date ||
            eA instanceof RegExp ||
            null === eA
          );
        }
        function shouldMerge(eA, el) {
          return !!isPlainObject(eA) && !!isPlainObject(el);
        }
      },
      30460(eA, el, ec) {
        "use strict";
        (ec.r(el), ec.d(el, { BindOnceFuture: () => ed }));
        var eu = (function () {
            function Deferred() {
              var eA = this;
              this._promise = new Promise(function (el, ec) {
                ((eA._resolve = el), (eA._reject = ec));
              });
            }
            return (
              Object.defineProperty(Deferred.prototype, "promise", {
                get: function () {
                  return this._promise;
                },
                enumerable: !1,
                configurable: !0,
              }),
              (Deferred.prototype.resolve = function (eA) {
                this._resolve(eA);
              }),
              (Deferred.prototype.reject = function (eA) {
                this._reject(eA);
              }),
              Deferred
            );
          })(),
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
            function BindOnceFuture(eA, el) {
              ((this._callback = eA),
                (this._that = el),
                (this._isCalled = !1),
                (this._deferred = new eu()));
            }
            return (
              Object.defineProperty(BindOnceFuture.prototype, "isCalled", {
                get: function () {
                  return this._isCalled;
                },
                enumerable: !1,
                configurable: !0,
              }),
              Object.defineProperty(BindOnceFuture.prototype, "promise", {
                get: function () {
                  return this._deferred.promise;
                },
                enumerable: !1,
                configurable: !0,
              }),
              (BindOnceFuture.prototype.call = function () {
                for (
                  var eA, el = this, ec = [], eu = 0;
                  eu < arguments.length;
                  eu++
                )
                  ec[eu] = arguments[eu];
                if (!this._isCalled) {
                  this._isCalled = !0;
                  try {
                    Promise.resolve(
                      (eA = this._callback).call.apply(
                        eA,
                        __spreadArray([this._that], __read(ec), !1),
                      ),
                    ).then(
                      function (eA) {
                        return el._deferred.resolve(eA);
                      },
                      function (eA) {
                        return el._deferred.reject(eA);
                      },
                    );
                  } catch (eA) {
                    this._deferred.reject(eA);
                  }
                }
                return this._deferred.promise;
              }),
              BindOnceFuture
            );
          })();
      },
      71664(eA, el, ec) {
        "use strict";
        (ec.r(el),
          ec.d(el, {
            isSpanContextValid: () => isSpanContextValid,
            isValidSpanId: () => isValidSpanId,
            isValidTraceId: () => isValidTraceId,
            wrapSpanContext: () => wrapSpanContext,
          }));
        var eu = ec(67177),
          ed = ec(6461),
          ep = /^([0-9a-f]{32})$/i,
          eg = /^[0-9a-f]{16}$/i;
        function isValidTraceId(eA) {
          return ep.test(eA) && eA !== eu.INVALID_TRACEID;
        }
        function isValidSpanId(eA) {
          return eg.test(eA) && eA !== eu.INVALID_SPANID;
        }
        function isSpanContextValid(eA) {
          return isValidTraceId(eA.traceId) && isValidSpanId(eA.spanId);
        }
        function wrapSpanContext(eA) {
          return new ed.NonRecordingSpan(eA);
        }
      },
      95497(eA, el, ec) {
        "use strict";
        (ec.r(el),
          ec.d(el, {
            isAttributeKey: () => isAttributeKey,
            isAttributeValue: () => isAttributeValue,
            sanitizeAttributes: () => sanitizeAttributes,
          }));
        var eu = ec(2339),
          __values = function (eA) {
            var el = "function" == typeof Symbol && Symbol.iterator,
              ec = el && eA[el],
              eu = 0;
            if (ec) return ec.call(eA);
            if (eA && "number" == typeof eA.length)
              return {
                next: function () {
                  return (
                    eA && eu >= eA.length && (eA = void 0),
                    { value: eA && eA[eu++], done: !eA }
                  );
                },
              };
            throw TypeError(
              el
                ? "Object is not iterable."
                : "Symbol.iterator is not defined.",
            );
          },
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
          };
        function sanitizeAttributes(eA) {
          var el,
            ec,
            ed = {};
          if ("object" != typeof eA || null == eA) return ed;
          try {
            for (
              var ep = __values(Object.entries(eA)), eg = ep.next();
              !eg.done;
              eg = ep.next()
            ) {
              var eh = __read(eg.value, 2),
                ef = eh[0],
                em = eh[1];
              if (!isAttributeKey(ef)) {
                eu.diag.warn("Invalid attribute key: " + ef);
                continue;
              }
              if (!isAttributeValue(em)) {
                eu.diag.warn("Invalid attribute value set for key: " + ef);
                continue;
              }
              Array.isArray(em) ? (ed[ef] = em.slice()) : (ed[ef] = em);
            }
          } catch (eA) {
            el = { error: eA };
          } finally {
            try {
              eg && !eg.done && (ec = ep.return) && ec.call(ep);
            } finally {
              if (el) throw el.error;
            }
          }
          return ed;
        }
        function isAttributeKey(eA) {
          return "string" == typeof eA && eA.length > 0;
        }
        function isAttributeValue(eA) {
          return (
            null == eA ||
            (Array.isArray(eA)
              ? isHomogeneousAttributeValueArray(eA)
              : isValidPrimitiveAttributeValue(eA))
          );
        }
        function isHomogeneousAttributeValueArray(eA) {
          try {
            for (
              var el, ec, eu, ed = __values(eA), ep = ed.next();
              !ep.done;
              ep = ed.next()
            ) {
              var eg = ep.value;
              if (null != eg) {
                if (!eu) {
                  if (isValidPrimitiveAttributeValue(eg)) {
                    eu = typeof eg;
                    continue;
                  }
                  return !1;
                }
                if (typeof eg !== eu) return !1;
              }
            }
          } catch (eA) {
            el = { error: eA };
          } finally {
            try {
              ep && !ep.done && (ec = ed.return) && ec.call(ed);
            } finally {
              if (el) throw el.error;
            }
          }
          return !0;
        }
        function isValidPrimitiveAttributeValue(eA) {
          switch (typeof eA) {
            case "number":
            case "boolean":
            case "string":
              return !0;
          }
          return !1;
        }
      },
      4439(eA, el, ec) {
        "use strict";
        (ec.r(el),
          ec.d(el, {
            TimeoutError: () => ed,
            callWithTimeout: () => callWithTimeout,
          }));
        var eu = (function () {
            var extendStatics = function (eA, el) {
              return (extendStatics =
                Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array &&
                  function (eA, el) {
                    eA.__proto__ = el;
                  }) ||
                function (eA, el) {
                  for (var ec in el)
                    Object.prototype.hasOwnProperty.call(el, ec) &&
                      (eA[ec] = el[ec]);
                })(eA, el);
            };
            return function (eA, el) {
              if ("function" != typeof el && null !== el)
                throw TypeError(
                  "Class extends value " +
                    String(el) +
                    " is not a constructor or null",
                );
              function __() {
                this.constructor = eA;
              }
              (extendStatics(eA, el),
                (eA.prototype =
                  null === el
                    ? Object.create(el)
                    : ((__.prototype = el.prototype), new __())));
            };
          })(),
          ed = (function (eA) {
            function TimeoutError(el) {
              var ec = eA.call(this, el) || this;
              return (Object.setPrototypeOf(ec, TimeoutError.prototype), ec);
            }
            return (eu(TimeoutError, eA), TimeoutError);
          })(Error);
        function callWithTimeout(eA, el) {
          var ec;
          return Promise.race([
            eA,
            new Promise(function (eA, eu) {
              ec = setTimeout(function () {
                eu(new ed("Operation timed out."));
              }, el);
            }),
          ]).then(
            function (eA) {
              return (clearTimeout(ec), eA);
            },
            function (eA) {
              throw (clearTimeout(ec), eA);
            },
          );
        }
      },
      67177(eA, el, ec) {
        "use strict";
        (ec.r(el),
          ec.d(el, {
            INVALID_SPANID: () => ed,
            INVALID_SPAN_CONTEXT: () => eg,
            INVALID_TRACEID: () => ep,
          }));
        var eu = ec(14138),
          ed = "0000000000000000",
          ep = "00000000000000000000000000000000",
          eg = { traceId: ep, spanId: ed, traceFlags: eu.TraceFlags.NONE };
      },
      6461(eA, el, ec) {
        "use strict";
        (ec.r(el), ec.d(el, { NonRecordingSpan: () => ed }));
        var eu = ec(67177),
          ed = (function () {
            function NonRecordingSpan(eA) {
              (void 0 === eA && (eA = eu.INVALID_SPAN_CONTEXT),
                (this._spanContext = eA));
            }
            return (
              (NonRecordingSpan.prototype.spanContext = function () {
                return this._spanContext;
              }),
              (NonRecordingSpan.prototype.setAttribute = function (eA, el) {
                return this;
              }),
              (NonRecordingSpan.prototype.setAttributes = function (eA) {
                return this;
              }),
              (NonRecordingSpan.prototype.addEvent = function (eA, el) {
                return this;
              }),
              (NonRecordingSpan.prototype.addLink = function (eA) {
                return this;
              }),
              (NonRecordingSpan.prototype.addLinks = function (eA) {
                return this;
              }),
              (NonRecordingSpan.prototype.setStatus = function (eA) {
                return this;
              }),
              (NonRecordingSpan.prototype.updateName = function (eA) {
                return this;
              }),
              (NonRecordingSpan.prototype.end = function (eA) {}),
              (NonRecordingSpan.prototype.isRecording = function () {
                return !1;
              }),
              (NonRecordingSpan.prototype.recordException = function (
                eA,
                el,
              ) {}),
              NonRecordingSpan
            );
          })();
      },
      14138(eA, el, ec) {
        "use strict";
        var eu;
        (ec.r(el),
          ec.d(el, { TraceFlags: () => eu }),
          (function (eA) {
            ((eA[(eA.NONE = 0)] = "NONE"), (eA[(eA.SAMPLED = 1)] = "SAMPLED"));
          })(eu || (eu = {})));
      },
      88752(eA, el, ec) {
        "use strict";
        (ec.r(el),
          ec.d(el, {
            deleteSpan: () => deleteSpan,
            getActiveSpan: () => getActiveSpan,
            getSpan: () => getSpan,
            getSpanContext: () => getSpanContext,
            setSpan: () => setSpan,
            setSpanContext: () => setSpanContext,
          }));
        var eu = ec(98902),
          ed = ec(6461),
          ep = ec(57717),
          eg = (0, eu.createContextKey)("OpenTelemetry Context Key SPAN");
        function getSpan(eA) {
          return eA.getValue(eg) || void 0;
        }
        function getActiveSpan() {
          return getSpan(ep.ContextAPI.getInstance().active());
        }
        function setSpan(eA, el) {
          return eA.setValue(eg, el);
        }
        function deleteSpan(eA) {
          return eA.deleteValue(eg);
        }
        function setSpanContext(eA, el) {
          return setSpan(eA, new ed.NonRecordingSpan(el));
        }
        function getSpanContext(eA) {
          var el;
          return null == (el = getSpan(eA)) ? void 0 : el.spanContext();
        }
      },
      60002(eA, el, ec) {
        "use strict";
        (ec.r(el),
          ec.d(el, {
            globalErrorHandler: () => globalErrorHandler,
            setGlobalErrorHandler: () => setGlobalErrorHandler,
          }));
        var eu = ec(2339);
        function stringifyException(eA) {
          return "string" == typeof eA
            ? eA
            : JSON.stringify(flattenException(eA));
        }
        function flattenException(eA) {
          for (var el = {}, ec = eA; null !== ec; )
            (Object.getOwnPropertyNames(ec).forEach(function (eA) {
              if (!el[eA]) {
                var eu = ec[eA];
                eu && (el[eA] = String(eu));
              }
            }),
              (ec = Object.getPrototypeOf(ec)));
          return el;
        }
        var ed = (function () {
          return function (eA) {
            eu.diag.error(stringifyException(eA));
          };
        })();
        function setGlobalErrorHandler(eA) {
          ed = eA;
        }
        function globalErrorHandler(eA) {
          try {
            ed(eA);
          } catch (eA) {}
        }
      },
      61549(eA, el, ec) {
        "use strict";
        function unrefTimer(eA) {
          eA.unref();
        }
        (ec.r(el), ec.d(el, { unrefTimer: () => unrefTimer }));
      },
      36275(eA, el, ec) {
        "use strict";
        var eu;
        (ec.r(el),
          ec.d(el, { ExportResultCode: () => eu }),
          (function (eA) {
            ((eA[(eA.SUCCESS = 0)] = "SUCCESS"),
              (eA[(eA.FAILED = 1)] = "FAILED"));
          })(eu || (eu = {})));
      },
    },
    cache = new Map();
  function ec(id: number): any {
    if (cache.has(id)) return cache.get(id);
    if (factories[id]) {
      const m = { exports: {} };
      cache.set(id, m.exports);
      factories[id](m, m.exports, ec);
      return m.exports;
    }
    const value = runtime.modules?.[id] ?? runtime.getModule?.(id);
    if (value === undefined)
      throw Error("Explicit OTLP export parent required: " + id);
    return value;
  }
  ec.r = (o: any) => Object.defineProperty(o, "__esModule", { value: true });
  ec.d = (o: any, defs: any) => {
    for (const k of Object.keys(defs))
      Object.defineProperty(o, k, { enumerable: true, get: defs[k] });
  };

  const e1 = runtime.serializers.getModule(41437),
    eD = { trace: ec(88752) },
    eZ = { diag: runtime.diag },
    AP = runtime.context,
    e9 = runtime.environment,
    eM = runtime.resources,
    AE = ec(60002),
    AC = ec(61549),
    e0 = { internal: runtime.context.internal },
    ez = ec(36275),
    Date = runtime.Date ?? globalThis.Date;
  var rg = ec(32704),
    rh = ec(99997),
    rf = ec(32192),
    rm = ec(30460),
    rE = ec(71664),
    rC = ec(95497),
    LogRecord_values = function (eA) {
      var el = "function" == typeof Symbol && Symbol.iterator,
        ec = el && eA[el],
        eu = 0;
      if (ec) return ec.call(eA);
      if (eA && "number" == typeof eA.length)
        return {
          next: function () {
            return (
              eA && eu >= eA.length && (eA = void 0),
              { value: eA && eA[eu++], done: !eA }
            );
          },
        };
      throw TypeError(
        el ? "Object is not iterable." : "Symbol.iterator is not defined.",
      );
    },
    LogRecord_read = function (eA, el) {
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
    ry = (function () {
      function LogRecord(eA, el, ec) {
        ((this.attributes = {}),
          (this.totalAttributesCount = 0),
          (this._isReadonly = !1));
        var eu = ec.timestamp,
          ed = ec.observedTimestamp,
          ep = ec.severityNumber,
          eg = ec.severityText,
          eh = ec.body,
          ef = ec.attributes,
          em = void 0 === ef ? {} : ef,
          eE = ec.context,
          eC = Date.now();
        if (
          ((this.hrTime = (0, e1.timeInputToHrTime)(null != eu ? eu : eC)),
          (this.hrTimeObserved = (0, e1.timeInputToHrTime)(
            null != ed ? ed : eC,
          )),
          eE)
        ) {
          var ey = eD.trace.getSpanContext(eE);
          ey && rE.isSpanContextValid(ey) && (this.spanContext = ey);
        }
        ((this.severityNumber = ep),
          (this.severityText = eg),
          (this.body = eh),
          (this.resource = eA.resource),
          (this.instrumentationScope = el),
          (this._logRecordLimits = eA.logRecordLimits),
          this.setAttributes(em));
      }
      return (
        Object.defineProperty(LogRecord.prototype, "severityText", {
          get: function () {
            return this._severityText;
          },
          set: function (eA) {
            this._isLogRecordReadonly() || (this._severityText = eA);
          },
          enumerable: !1,
          configurable: !0,
        }),
        Object.defineProperty(LogRecord.prototype, "severityNumber", {
          get: function () {
            return this._severityNumber;
          },
          set: function (eA) {
            this._isLogRecordReadonly() || (this._severityNumber = eA);
          },
          enumerable: !1,
          configurable: !0,
        }),
        Object.defineProperty(LogRecord.prototype, "body", {
          get: function () {
            return this._body;
          },
          set: function (eA) {
            this._isLogRecordReadonly() || (this._body = eA);
          },
          enumerable: !1,
          configurable: !0,
        }),
        Object.defineProperty(LogRecord.prototype, "droppedAttributesCount", {
          get: function () {
            return (
              this.totalAttributesCount - Object.keys(this.attributes).length
            );
          },
          enumerable: !1,
          configurable: !0,
        }),
        (LogRecord.prototype.setAttribute = function (eA, el) {
          return (
            this._isLogRecordReadonly() ||
              null === el ||
              (0 === eA.length
                ? eZ.diag.warn("Invalid attribute key: " + eA)
                : (0, rC.isAttributeValue)(el) ||
                    ("object" == typeof el &&
                      !Array.isArray(el) &&
                      Object.keys(el).length > 0)
                  ? ((this.totalAttributesCount += 1),
                    Object.keys(this.attributes).length >=
                      this._logRecordLimits.attributeCountLimit &&
                      !Object.prototype.hasOwnProperty.call(
                        this.attributes,
                        eA,
                      ))
                    ? 1 === this.droppedAttributesCount &&
                      eZ.diag.warn("Dropping extra attributes.")
                    : (0, rC.isAttributeValue)(el)
                      ? (this.attributes[eA] = this._truncateToSize(el))
                      : (this.attributes[eA] = el)
                  : eZ.diag.warn("Invalid attribute value set for key: " + eA)),
            this
          );
        }),
        (LogRecord.prototype.setAttributes = function (eA) {
          var el, ec;
          try {
            for (
              var eu = LogRecord_values(Object.entries(eA)), ed = eu.next();
              !ed.done;
              ed = eu.next()
            ) {
              var ep = LogRecord_read(ed.value, 2),
                eg = ep[0],
                eh = ep[1];
              this.setAttribute(eg, eh);
            }
          } catch (eA) {
            el = { error: eA };
          } finally {
            try {
              ed && !ed.done && (ec = eu.return) && ec.call(eu);
            } finally {
              if (el) throw el.error;
            }
          }
          return this;
        }),
        (LogRecord.prototype.setBody = function (eA) {
          return ((this.body = eA), this);
        }),
        (LogRecord.prototype.setSeverityNumber = function (eA) {
          return ((this.severityNumber = eA), this);
        }),
        (LogRecord.prototype.setSeverityText = function (eA) {
          return ((this.severityText = eA), this);
        }),
        (LogRecord.prototype._makeReadonly = function () {
          this._isReadonly = !0;
        }),
        (LogRecord.prototype._truncateToSize = function (eA) {
          var el = this,
            ec = this._logRecordLimits.attributeValueLengthLimit;
          return ec <= 0
            ? (eZ.diag.warn(
                "Attribute value limit must be positive, got " + ec,
              ),
              eA)
            : "string" == typeof eA
              ? this._truncateToLimitUtil(eA, ec)
              : Array.isArray(eA)
                ? eA.map(function (eA) {
                    return "string" == typeof eA
                      ? el._truncateToLimitUtil(eA, ec)
                      : eA;
                  })
                : eA;
        }),
        (LogRecord.prototype._truncateToLimitUtil = function (eA, el) {
          return eA.length <= el ? eA : eA.substring(0, el);
        }),
        (LogRecord.prototype._isLogRecordReadonly = function () {
          return (
            this._isReadonly &&
              eZ.diag.warn(
                "Can not execute the operation on emitted log record",
              ),
            this._isReadonly
          );
        }),
        LogRecord
      );
    })(),
    Logger_assign = function () {
      return (Logger_assign =
        Object.assign ||
        function (eA) {
          for (var el, ec = 1, eu = arguments.length; ec < eu; ec++)
            for (var ed in (el = arguments[ec]))
              Object.prototype.hasOwnProperty.call(el, ed) && (eA[ed] = el[ed]);
          return eA;
        }).apply(this, arguments);
    },
    rw = (function () {
      function Logger(eA, el) {
        ((this.instrumentationScope = eA), (this._sharedState = el));
      }
      return (
        (Logger.prototype.emit = function (eA) {
          var el = eA.context || AP.context.active(),
            ec = new ry(
              this._sharedState,
              this.instrumentationScope,
              Logger_assign({ context: el }, eA),
            );
          (this._sharedState.activeProcessor.onEmit(ec, el),
            ec._makeReadonly());
        }),
        Logger
      );
    })(),
    rB = ec(55733);
  function loadDefaultConfig() {
    return {
      forceFlushTimeoutMillis: 3e4,
      logRecordLimits: {
        attributeValueLengthLimit: (0, e9.getEnv)()
          .OTEL_LOGRECORD_ATTRIBUTE_VALUE_LENGTH_LIMIT,
        attributeCountLimit: (0, e9.getEnv)()
          .OTEL_LOGRECORD_ATTRIBUTE_COUNT_LIMIT,
      },
      includeTraceContext: !0,
      mergeResourceWithDefaults: !0,
    };
  }
  function reconfigureLimits(eA) {
    var el,
      ec,
      eu,
      ed,
      ep,
      eg,
      eh = (0, e9.getEnvWithoutDefaults)();
    return {
      attributeCountLimit:
        null !=
        (eu =
          null !=
          (ec =
            null != (el = eA.attributeCountLimit)
              ? el
              : eh.OTEL_LOGRECORD_ATTRIBUTE_COUNT_LIMIT)
            ? ec
            : eh.OTEL_ATTRIBUTE_COUNT_LIMIT)
          ? eu
          : rB.DEFAULT_ATTRIBUTE_COUNT_LIMIT,
      attributeValueLengthLimit:
        null !=
        (eg =
          null !=
          (ep =
            null != (ed = eA.attributeValueLengthLimit)
              ? ed
              : eh.OTEL_LOGRECORD_ATTRIBUTE_VALUE_LENGTH_LIMIT)
            ? ep
            : eh.OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT)
          ? eg
          : rB.DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT,
    };
  }
  var r_ = ec(4439),
    MultiLogRecordProcessor_awaiter = function (eA, el, ec, eu) {
      function adopt(eA) {
        return eA instanceof ec
          ? eA
          : new ec(function (el) {
              el(eA);
            });
      }
      return new (ec || (ec = Promise))(function (ec, ed) {
        function fulfilled(eA) {
          try {
            step(eu.next(eA));
          } catch (eA) {
            ed(eA);
          }
        }
        function rejected(eA) {
          try {
            step(eu.throw(eA));
          } catch (eA) {
            ed(eA);
          }
        }
        function step(eA) {
          eA.done ? ec(eA.value) : adopt(eA.value).then(fulfilled, rejected);
        }
        step((eu = eu.apply(eA, el || [])).next());
      });
    },
    MultiLogRecordProcessor_generator = function (eA, el) {
      var ec,
        eu,
        ed,
        ep,
        eg = {
          label: 0,
          sent: function () {
            if (1 & ed[0]) throw ed[1];
            return ed[1];
          },
          trys: [],
          ops: [],
        };
      return (
        (ep = { next: verb(0), throw: verb(1), return: verb(2) }),
        "function" == typeof Symbol &&
          (ep[Symbol.iterator] = function () {
            return this;
          }),
        ep
      );
      function verb(eA) {
        return function (el) {
          return step([eA, el]);
        };
      }
      function step(ep) {
        if (ec) throw TypeError("Generator is already executing.");
        for (; eg; )
          try {
            if (
              ((ec = 1),
              eu &&
                (ed =
                  2 & ep[0]
                    ? eu.return
                    : ep[0]
                      ? eu.throw || ((ed = eu.return) && ed.call(eu), 0)
                      : eu.next) &&
                !(ed = ed.call(eu, ep[1])).done)
            )
              return ed;
            switch (((eu = 0), ed && (ep = [2 & ep[0], ed.value]), ep[0])) {
              case 0:
              case 1:
                ed = ep;
                break;
              case 4:
                return (eg.label++, { value: ep[1], done: !1 });
              case 5:
                (eg.label++, (eu = ep[1]), (ep = [0]));
                continue;
              case 7:
                ((ep = eg.ops.pop()), eg.trys.pop());
                continue;
              default:
                if (
                  !(ed = (ed = eg.trys).length > 0 && ed[ed.length - 1]) &&
                  (6 === ep[0] || 2 === ep[0])
                ) {
                  eg = 0;
                  continue;
                }
                if (3 === ep[0] && (!ed || (ep[1] > ed[0] && ep[1] < ed[3]))) {
                  eg.label = ep[1];
                  break;
                }
                if (6 === ep[0] && eg.label < ed[1]) {
                  ((eg.label = ed[1]), (ed = ep));
                  break;
                }
                if (ed && eg.label < ed[2]) {
                  ((eg.label = ed[2]), eg.ops.push(ep));
                  break;
                }
                (ed[2] && eg.ops.pop(), eg.trys.pop());
                continue;
            }
            ep = el.call(eA, eg);
          } catch (eA) {
            ((ep = [6, eA]), (eu = 0));
          } finally {
            ec = ed = 0;
          }
        if (5 & ep[0]) throw ep[1];
        return { value: ep[0] ? ep[1] : void 0, done: !0 };
      }
    },
    rI = (function () {
      function MultiLogRecordProcessor(eA, el) {
        ((this.processors = eA), (this.forceFlushTimeoutMillis = el));
      }
      return (
        (MultiLogRecordProcessor.prototype.forceFlush = function () {
          return MultiLogRecordProcessor_awaiter(
            this,
            void 0,
            void 0,
            function () {
              var eA;
              return MultiLogRecordProcessor_generator(this, function (el) {
                switch (el.label) {
                  case 0:
                    return (
                      (eA = this.forceFlushTimeoutMillis),
                      [
                        4,
                        Promise.all(
                          this.processors.map(function (el) {
                            return (0, r_.callWithTimeout)(el.forceFlush(), eA);
                          }),
                        ),
                      ]
                    );
                  case 1:
                    return (el.sent(), [2]);
                }
              });
            },
          );
        }),
        (MultiLogRecordProcessor.prototype.onEmit = function (eA, el) {
          this.processors.forEach(function (ec) {
            return ec.onEmit(eA, el);
          });
        }),
        (MultiLogRecordProcessor.prototype.shutdown = function () {
          return MultiLogRecordProcessor_awaiter(
            this,
            void 0,
            void 0,
            function () {
              return MultiLogRecordProcessor_generator(this, function (eA) {
                switch (eA.label) {
                  case 0:
                    return [
                      4,
                      Promise.all(
                        this.processors.map(function (eA) {
                          return eA.shutdown();
                        }),
                      ),
                    ];
                  case 1:
                    return (eA.sent(), [2]);
                }
              });
            },
          );
        }),
        MultiLogRecordProcessor
      );
    })(),
    rv = (function () {
      function NoopLogRecordProcessor() {}
      return (
        (NoopLogRecordProcessor.prototype.forceFlush = function () {
          return Promise.resolve();
        }),
        (NoopLogRecordProcessor.prototype.onEmit = function (eA, el) {}),
        (NoopLogRecordProcessor.prototype.shutdown = function () {
          return Promise.resolve();
        }),
        NoopLogRecordProcessor
      );
    })(),
    rS = (function () {
      return function (eA, el, ec) {
        ((this.resource = eA),
          (this.forceFlushTimeoutMillis = el),
          (this.logRecordLimits = ec),
          (this.loggers = new Map()),
          (this.registeredLogRecordProcessors = []),
          (this.activeProcessor = new rv()));
      };
    })(),
    rQ = "unknown";
  function LoggerProvider_prepareResource(eA, el) {
    var ec = null != el ? el : eM.Resource.empty();
    return eA ? eM.Resource.default().merge(ec) : ec;
  }
  var rD = (function () {
      function LoggerProvider(eA) {
        void 0 === eA && (eA = {});
        var el = (0, rf.merge)({}, loadDefaultConfig(), eA),
          ec = LoggerProvider_prepareResource(
            el.mergeResourceWithDefaults,
            eA.resource,
          );
        ((this._sharedState = new rS(
          ec,
          el.forceFlushTimeoutMillis,
          reconfigureLimits(el.logRecordLimits),
        )),
          (this._shutdownOnce = new rm.BindOnceFuture(this._shutdown, this)));
      }
      return (
        (LoggerProvider.prototype.getLogger = function (eA, el, ec) {
          if (this._shutdownOnce.isCalled)
            return (
              eZ.diag.warn("A shutdown LoggerProvider cannot provide a Logger"),
              rh.NOOP_LOGGER
            );
          eA ||
            eZ.diag.warn(
              "Logger requested without instrumentation scope name.",
            );
          var eu = eA || rQ,
            ed =
              eu +
              "@" +
              (el || "") +
              ":" +
              ((null == ec ? void 0 : ec.schemaUrl) || "");
          return (
            this._sharedState.loggers.has(ed) ||
              this._sharedState.loggers.set(
                ed,
                new rw(
                  {
                    name: eu,
                    version: el,
                    schemaUrl: null == ec ? void 0 : ec.schemaUrl,
                  },
                  this._sharedState,
                ),
              ),
            this._sharedState.loggers.get(ed)
          );
        }),
        (LoggerProvider.prototype.addLogRecordProcessor = function (eA) {
          (0 === this._sharedState.registeredLogRecordProcessors.length &&
            this._sharedState.activeProcessor.shutdown().catch(function (eA) {
              return eZ.diag.error(
                "Error while trying to shutdown current log record processor",
                eA,
              );
            }),
            this._sharedState.registeredLogRecordProcessors.push(eA),
            (this._sharedState.activeProcessor = new rI(
              this._sharedState.registeredLogRecordProcessors,
              this._sharedState.forceFlushTimeoutMillis,
            )));
        }),
        (LoggerProvider.prototype.forceFlush = function () {
          return this._shutdownOnce.isCalled
            ? (eZ.diag.warn(
                "invalid attempt to force flush after LoggerProvider shutdown",
              ),
              this._shutdownOnce.promise)
            : this._sharedState.activeProcessor.forceFlush();
        }),
        (LoggerProvider.prototype.shutdown = function () {
          return this._shutdownOnce.isCalled
            ? (eZ.diag.warn(
                "shutdown may only be called once per LoggerProvider",
              ),
              this._shutdownOnce.promise)
            : this._shutdownOnce.call();
        }),
        (LoggerProvider.prototype._shutdown = function () {
          return this._sharedState.activeProcessor.shutdown();
        }),
        LoggerProvider
      );
    })(),
    BatchLogRecordProcessorBase_awaiter = function (eA, el, ec, eu) {
      function adopt(eA) {
        return eA instanceof ec
          ? eA
          : new ec(function (el) {
              el(eA);
            });
      }
      return new (ec || (ec = Promise))(function (ec, ed) {
        function fulfilled(eA) {
          try {
            step(eu.next(eA));
          } catch (eA) {
            ed(eA);
          }
        }
        function rejected(eA) {
          try {
            step(eu.throw(eA));
          } catch (eA) {
            ed(eA);
          }
        }
        function step(eA) {
          eA.done ? ec(eA.value) : adopt(eA.value).then(fulfilled, rejected);
        }
        step((eu = eu.apply(eA, el || [])).next());
      });
    },
    BatchLogRecordProcessorBase_generator = function (eA, el) {
      var ec,
        eu,
        ed,
        ep,
        eg = {
          label: 0,
          sent: function () {
            if (1 & ed[0]) throw ed[1];
            return ed[1];
          },
          trys: [],
          ops: [],
        };
      return (
        (ep = { next: verb(0), throw: verb(1), return: verb(2) }),
        "function" == typeof Symbol &&
          (ep[Symbol.iterator] = function () {
            return this;
          }),
        ep
      );
      function verb(eA) {
        return function (el) {
          return step([eA, el]);
        };
      }
      function step(ep) {
        if (ec) throw TypeError("Generator is already executing.");
        for (; eg; )
          try {
            if (
              ((ec = 1),
              eu &&
                (ed =
                  2 & ep[0]
                    ? eu.return
                    : ep[0]
                      ? eu.throw || ((ed = eu.return) && ed.call(eu), 0)
                      : eu.next) &&
                !(ed = ed.call(eu, ep[1])).done)
            )
              return ed;
            switch (((eu = 0), ed && (ep = [2 & ep[0], ed.value]), ep[0])) {
              case 0:
              case 1:
                ed = ep;
                break;
              case 4:
                return (eg.label++, { value: ep[1], done: !1 });
              case 5:
                (eg.label++, (eu = ep[1]), (ep = [0]));
                continue;
              case 7:
                ((ep = eg.ops.pop()), eg.trys.pop());
                continue;
              default:
                if (
                  !(ed = (ed = eg.trys).length > 0 && ed[ed.length - 1]) &&
                  (6 === ep[0] || 2 === ep[0])
                ) {
                  eg = 0;
                  continue;
                }
                if (3 === ep[0] && (!ed || (ep[1] > ed[0] && ep[1] < ed[3]))) {
                  eg.label = ep[1];
                  break;
                }
                if (6 === ep[0] && eg.label < ed[1]) {
                  ((eg.label = ed[1]), (ed = ep));
                  break;
                }
                if (ed && eg.label < ed[2]) {
                  ((eg.label = ed[2]), eg.ops.push(ep));
                  break;
                }
                (ed[2] && eg.ops.pop(), eg.trys.pop());
                continue;
            }
            ep = el.call(eA, eg);
          } catch (eA) {
            ((ep = [6, eA]), (eu = 0));
          } finally {
            ec = ed = 0;
          }
        if (5 & ep[0]) throw ep[1];
        return { value: ep[0] ? ep[1] : void 0, done: !0 };
      }
    },
    rT = (function () {
      function BatchLogRecordProcessorBase(eA, el) {
        ((this._exporter = eA), (this._finishedLogRecords = []));
        var ec,
          eu,
          ed,
          ep,
          eg = (0, e9.getEnv)();
        ((this._maxExportBatchSize =
          null != (ec = null == el ? void 0 : el.maxExportBatchSize)
            ? ec
            : eg.OTEL_BLRP_MAX_EXPORT_BATCH_SIZE),
          (this._maxQueueSize =
            null != (eu = null == el ? void 0 : el.maxQueueSize)
              ? eu
              : eg.OTEL_BLRP_MAX_QUEUE_SIZE),
          (this._scheduledDelayMillis =
            null != (ed = null == el ? void 0 : el.scheduledDelayMillis)
              ? ed
              : eg.OTEL_BLRP_SCHEDULE_DELAY),
          (this._exportTimeoutMillis =
            null != (ep = null == el ? void 0 : el.exportTimeoutMillis)
              ? ep
              : eg.OTEL_BLRP_EXPORT_TIMEOUT),
          (this._shutdownOnce = new rm.BindOnceFuture(this._shutdown, this)),
          this._maxExportBatchSize > this._maxQueueSize &&
            (eZ.diag.warn(
              "BatchLogRecordProcessor: maxExportBatchSize must be smaller or equal to maxQueueSize, setting maxExportBatchSize to match maxQueueSize",
            ),
            (this._maxExportBatchSize = this._maxQueueSize)));
      }
      return (
        (BatchLogRecordProcessorBase.prototype.onEmit = function (eA) {
          this._shutdownOnce.isCalled || this._addToBuffer(eA);
        }),
        (BatchLogRecordProcessorBase.prototype.forceFlush = function () {
          return this._shutdownOnce.isCalled
            ? this._shutdownOnce.promise
            : this._flushAll();
        }),
        (BatchLogRecordProcessorBase.prototype.shutdown = function () {
          return this._shutdownOnce.call();
        }),
        (BatchLogRecordProcessorBase.prototype._shutdown = function () {
          return BatchLogRecordProcessorBase_awaiter(
            this,
            void 0,
            void 0,
            function () {
              return BatchLogRecordProcessorBase_generator(this, function (eA) {
                switch (eA.label) {
                  case 0:
                    return (this.onShutdown(), [4, this._flushAll()]);
                  case 1:
                    return (eA.sent(), [4, this._exporter.shutdown()]);
                  case 2:
                    return (eA.sent(), [2]);
                }
              });
            },
          );
        }),
        (BatchLogRecordProcessorBase.prototype._addToBuffer = function (eA) {
          this._finishedLogRecords.length >= this._maxQueueSize ||
            (this._finishedLogRecords.push(eA), this._maybeStartTimer());
        }),
        (BatchLogRecordProcessorBase.prototype._flushAll = function () {
          var eA = this;
          return new Promise(function (el, ec) {
            for (
              var eu = [],
                ed = Math.ceil(
                  eA._finishedLogRecords.length / eA._maxExportBatchSize,
                ),
                ep = 0;
              ep < ed;
              ep++
            )
              eu.push(eA._flushOneBatch());
            Promise.all(eu)
              .then(function () {
                el();
              })
              .catch(ec);
          });
        }),
        (BatchLogRecordProcessorBase.prototype._flushOneBatch = function () {
          var eA = this;
          return (this._clearTimer(), 0 === this._finishedLogRecords.length)
            ? Promise.resolve()
            : new Promise(function (el, ec) {
                (0, r_.callWithTimeout)(
                  eA._export(
                    eA._finishedLogRecords.splice(0, eA._maxExportBatchSize),
                  ),
                  eA._exportTimeoutMillis,
                )
                  .then(function () {
                    return el();
                  })
                  .catch(ec);
              });
        }),
        (BatchLogRecordProcessorBase.prototype._maybeStartTimer = function () {
          var eA = this;
          void 0 === this._timer &&
            ((this._timer = setTimeout(function () {
              eA._flushOneBatch()
                .then(function () {
                  eA._finishedLogRecords.length > 0 &&
                    (eA._clearTimer(), eA._maybeStartTimer());
                })
                .catch(function (eA) {
                  (0, AE.globalErrorHandler)(eA);
                });
            }, this._scheduledDelayMillis)),
            (0, AC.unrefTimer)(this._timer));
        }),
        (BatchLogRecordProcessorBase.prototype._clearTimer = function () {
          void 0 !== this._timer &&
            (clearTimeout(this._timer), (this._timer = void 0));
        }),
        (BatchLogRecordProcessorBase.prototype._export = function (eA) {
          var el = this,
            doExport = function () {
              return e0.internal
                ._export(el._exporter, eA)
                .then(function (eA) {
                  var el;
                  eA.code !== ez.ExportResultCode.SUCCESS &&
                    (0, AE.globalErrorHandler)(
                      null != (el = eA.error)
                        ? el
                        : Error(
                            "BatchLogRecordProcessor: log record export failed (status " +
                              eA +
                              ")",
                          ),
                    );
                })
                .catch(AE.globalErrorHandler);
            },
            ec = eA
              .map(function (eA) {
                return eA.resource;
              })
              .filter(function (eA) {
                return eA.asyncAttributesPending;
              });
          return 0 === ec.length
            ? doExport()
            : Promise.all(
                ec.map(function (eA) {
                  var el;
                  return null == (el = eA.waitForAsyncAttributes)
                    ? void 0
                    : el.call(eA);
                }),
              ).then(doExport, AE.globalErrorHandler);
        }),
        BatchLogRecordProcessorBase
      );
    })(),
    rR = (function () {
      var extendStatics = function (eA, el) {
        return (extendStatics =
          Object.setPrototypeOf ||
          ({ __proto__: [] } instanceof Array &&
            function (eA, el) {
              eA.__proto__ = el;
            }) ||
          function (eA, el) {
            for (var ec in el)
              Object.prototype.hasOwnProperty.call(el, ec) && (eA[ec] = el[ec]);
          })(eA, el);
      };
      return function (eA, el) {
        if ("function" != typeof el && null !== el)
          throw TypeError(
            "Class extends value " +
              String(el) +
              " is not a constructor or null",
          );
        function __() {
          this.constructor = eA;
        }
        (extendStatics(eA, el),
          (eA.prototype =
            null === el
              ? Object.create(el)
              : ((__.prototype = el.prototype), new __())));
      };
    })(),
    rk = (function (eA) {
      function BatchLogRecordProcessor() {
        return (null !== eA && eA.apply(this, arguments)) || this;
      }
      return (
        rR(BatchLogRecordProcessor, eA),
        (BatchLogRecordProcessor.prototype.onShutdown = function () {}),
        BatchLogRecordProcessor
      );
    })(rT),
    ConsoleLogRecordExporter_values = function (eA) {
      var el = "function" == typeof Symbol && Symbol.iterator,
        ec = el && eA[el],
        eu = 0;
      if (ec) return ec.call(eA);
      if (eA && "number" == typeof eA.length)
        return {
          next: function () {
            return (
              eA && eu >= eA.length && (eA = void 0),
              { value: eA && eA[eu++], done: !eA }
            );
          },
        };
      throw TypeError(
        el ? "Object is not iterable." : "Symbol.iterator is not defined.",
      );
    },
    rM = (function () {
      function ConsoleLogRecordExporter() {}
      return (
        (ConsoleLogRecordExporter.prototype.export = function (eA, el) {
          this._sendLogRecords(eA, el);
        }),
        (ConsoleLogRecordExporter.prototype.shutdown = function () {
          return Promise.resolve();
        }),
        (ConsoleLogRecordExporter.prototype._exportInfo = function (eA) {
          var el, ec, eu;
          return {
            resource: { attributes: eA.resource.attributes },
            instrumentationScope: eA.instrumentationScope,
            timestamp: (0, e1.hrTimeToMicroseconds)(eA.hrTime),
            traceId: null == (el = eA.spanContext) ? void 0 : el.traceId,
            spanId: null == (ec = eA.spanContext) ? void 0 : ec.spanId,
            traceFlags: null == (eu = eA.spanContext) ? void 0 : eu.traceFlags,
            severityText: eA.severityText,
            severityNumber: eA.severityNumber,
            body: eA.body,
            attributes: eA.attributes,
          };
        }),
        (ConsoleLogRecordExporter.prototype._sendLogRecords = function (
          eA,
          el,
        ) {
          var ec, eu;
          try {
            for (
              var ed = ConsoleLogRecordExporter_values(eA), ep = ed.next();
              !ep.done;
              ep = ed.next()
            ) {
              var eg = ep.value;
              console.dir(this._exportInfo(eg), { depth: 3 });
            }
          } catch (eA) {
            ec = { error: eA };
          } finally {
            try {
              ep && !ep.done && (eu = ed.return) && eu.call(ed);
            } finally {
              if (ec) throw ec.error;
            }
          }
          null == el || el({ code: ez.ExportResultCode.SUCCESS });
        }),
        ConsoleLogRecordExporter
      );
    })();
  return {
    LoggerProvider: rD,
    BatchLogRecordProcessor: rk,
    ConsoleLogRecordExporter: rM,
    LogRecord: ry,
    SeverityNumber: rg.SeverityNumber,
    trace: eD.trace,
    getModule: ec,
  };
}

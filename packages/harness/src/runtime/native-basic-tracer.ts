// @ts-nocheck
// Complete captured tracer/provider/span/API and propagation factories.
export const BASIC_TRACER_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export const BASIC_TRACER_MODULES = [
  [84746, 1311116, 1317787],
  [23258, 985270, 986444],
  [67006, 983226, 985003],
  [22532, 1009145, 1010594],
  [21507, 1010595, 1013507],
  [48698, 997113, 998245],
  [90654, 1325048, 1327458],
  [13421, 1327459, 1329791],
  [84762, 1329792, 1330195],
  [86283, 1345676, 1346916],
  [8843, 988976, 989787],
  [6322, 985004, 985269],
  [51244, 990976, 991212],
  [22951, 989788, 990002],
  [30599, 1318003, 1325047],
  [72711, 1337027, 1337486],
  [96006, 988294, 988975],
  [77174, 987363, 988293],
  [45185, 991779, 991947],
] as const;
export function createNativeBasicTracer(runtime: any) {
  const factories = {
      84746(eA, el, ec) {
        "use strict";
        (ec.r(el),
          ec.d(el, {
            BasicTracerProvider: () => eT,
            ForceFlushState: () => eu,
          }));
        var eu,
          ed = ec(2339),
          ep = ec(23258),
          eg = ec(33835),
          eh = ec(67006),
          ef = ec(32192),
          em = ec(7e4),
          eE = ec(22532),
          eC = ec(21507),
          ey = ec(48698),
          ew = ec(78766),
          eB = ec(90654),
          e_ = ec(13421),
          eI = ec(60002),
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
          ev = (function () {
            function MultiSpanProcessor(eA) {
              this._spanProcessors = eA;
            }
            return (
              (MultiSpanProcessor.prototype.forceFlush = function () {
                var eA,
                  el,
                  ec = [];
                try {
                  for (
                    var eu = __values(this._spanProcessors), ed = eu.next();
                    !ed.done;
                    ed = eu.next()
                  ) {
                    var ep = ed.value;
                    ec.push(ep.forceFlush());
                  }
                } catch (el) {
                  eA = { error: el };
                } finally {
                  try {
                    ed && !ed.done && (el = eu.return) && el.call(eu);
                  } finally {
                    if (eA) throw eA.error;
                  }
                }
                return new Promise(function (eA) {
                  Promise.all(ec)
                    .then(function () {
                      eA();
                    })
                    .catch(function (el) {
                      ((0, eI.globalErrorHandler)(
                        el || Error("MultiSpanProcessor: forceFlush failed"),
                      ),
                        eA());
                    });
                });
              }),
              (MultiSpanProcessor.prototype.onStart = function (eA, el) {
                var ec, eu;
                try {
                  for (
                    var ed = __values(this._spanProcessors), ep = ed.next();
                    !ep.done;
                    ep = ed.next()
                  )
                    ep.value.onStart(eA, el);
                } catch (eA) {
                  ec = { error: eA };
                } finally {
                  try {
                    ep && !ep.done && (eu = ed.return) && eu.call(ed);
                  } finally {
                    if (ec) throw ec.error;
                  }
                }
              }),
              (MultiSpanProcessor.prototype.onEnd = function (eA) {
                var el, ec;
                try {
                  for (
                    var eu = __values(this._spanProcessors), ed = eu.next();
                    !ed.done;
                    ed = eu.next()
                  )
                    ed.value.onEnd(eA);
                } catch (eA) {
                  el = { error: eA };
                } finally {
                  try {
                    ed && !ed.done && (ec = eu.return) && ec.call(eu);
                  } finally {
                    if (el) throw el.error;
                  }
                }
              }),
              (MultiSpanProcessor.prototype.shutdown = function () {
                var eA,
                  el,
                  ec = [];
                try {
                  for (
                    var eu = __values(this._spanProcessors), ed = eu.next();
                    !ed.done;
                    ed = eu.next()
                  ) {
                    var ep = ed.value;
                    ec.push(ep.shutdown());
                  }
                } catch (el) {
                  eA = { error: el };
                } finally {
                  try {
                    ed && !ed.done && (el = eu.return) && el.call(eu);
                  } finally {
                    if (eA) throw eA.error;
                  }
                }
                return new Promise(function (eA, el) {
                  Promise.all(ec).then(function () {
                    eA();
                  }, el);
                });
              }),
              MultiSpanProcessor
            );
          })(),
          eS = ec(84762),
          eQ = ec(11440),
          eD = ec(86283),
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
          };
        !(function (eA) {
          ((eA[(eA.resolved = 0)] = "resolved"),
            (eA[(eA.timeout = 1)] = "timeout"),
            (eA[(eA.error = 2)] = "error"),
            (eA[(eA.unresolved = 3)] = "unresolved"));
        })(eu || (eu = {}));
        var eT = (function () {
          function BasicTracerProvider(eA) {
            (void 0 === eA && (eA = {}),
              (this._registeredSpanProcessors = []),
              (this._tracers = new Map()));
            var el,
              ec,
              eu = (0, ef.merge)(
                {},
                (0, e_.loadDefaultConfig)(),
                (0, eD.reconfigureLimits)(eA),
              );
            if (
              ((this.resource =
                null != (el = eu.resource) ? el : ew.Resource.empty()),
              eu.mergeResourceWithDefaults &&
                (this.resource = ew.Resource.default().merge(this.resource)),
              (this._config = Object.assign({}, eu, {
                resource: this.resource,
              })),
              null == (ec = eA.spanProcessors) ? void 0 : ec.length)
            )
              ((this._registeredSpanProcessors = __spreadArray(
                [],
                __read(eA.spanProcessors),
                !1,
              )),
                (this.activeSpanProcessor = new ev(
                  this._registeredSpanProcessors,
                )));
            else {
              var ed = this._buildExporterFromEnv();
              if (void 0 !== ed) {
                var ep = new eQ.BatchSpanProcessor(ed);
                this.activeSpanProcessor = ep;
              } else this.activeSpanProcessor = new eS.NoopSpanProcessor();
            }
          }
          return (
            (BasicTracerProvider.prototype.getTracer = function (eA, el, ec) {
              var eu =
                eA +
                "@" +
                (el || "") +
                ":" +
                ((null == ec ? void 0 : ec.schemaUrl) || "");
              return (
                this._tracers.has(eu) ||
                  this._tracers.set(
                    eu,
                    new eB.Tracer(
                      {
                        name: eA,
                        version: el,
                        schemaUrl: null == ec ? void 0 : ec.schemaUrl,
                      },
                      this._config,
                      this,
                    ),
                  ),
                this._tracers.get(eu)
              );
            }),
            (BasicTracerProvider.prototype.addSpanProcessor = function (eA) {
              (0 === this._registeredSpanProcessors.length &&
                this.activeSpanProcessor.shutdown().catch(function (eA) {
                  return ed.diag.error(
                    "Error while trying to shutdown current span processor",
                    eA,
                  );
                }),
                this._registeredSpanProcessors.push(eA),
                (this.activeSpanProcessor = new ev(
                  this._registeredSpanProcessors,
                )));
            }),
            (BasicTracerProvider.prototype.getActiveSpanProcessor =
              function () {
                return this.activeSpanProcessor;
              }),
            (BasicTracerProvider.prototype.register = function (eA) {
              (void 0 === eA && (eA = {}),
                ep.trace.setGlobalTracerProvider(this),
                void 0 === eA.propagator &&
                  (eA.propagator = this._buildPropagatorFromEnv()),
                eA.contextManager &&
                  eg.context.setGlobalContextManager(eA.contextManager),
                eA.propagator &&
                  eh.propagation.setGlobalPropagator(eA.propagator));
            }),
            (BasicTracerProvider.prototype.forceFlush = function () {
              var eA = this._config.forceFlushTimeoutMillis,
                el = this._registeredSpanProcessors.map(function (el) {
                  return new Promise(function (ec) {
                    var ed,
                      ep = setTimeout(function () {
                        (ec(
                          Error(
                            "Span processor did not completed within timeout period of " +
                              eA +
                              " ms",
                          ),
                        ),
                          (ed = eu.timeout));
                      }, eA);
                    el.forceFlush()
                      .then(function () {
                        (clearTimeout(ep),
                          ed !== eu.timeout && ec((ed = eu.resolved)));
                      })
                      .catch(function (eA) {
                        (clearTimeout(ep), (ed = eu.error), ec(eA));
                      });
                  });
                });
              return new Promise(function (eA, ec) {
                Promise.all(el)
                  .then(function (el) {
                    var ed = el.filter(function (eA) {
                      return eA !== eu.resolved;
                    });
                    ed.length > 0 ? ec(ed) : eA();
                  })
                  .catch(function (eA) {
                    return ec([eA]);
                  });
              });
            }),
            (BasicTracerProvider.prototype.shutdown = function () {
              return this.activeSpanProcessor.shutdown();
            }),
            (BasicTracerProvider.prototype._getPropagator = function (eA) {
              var el;
              return null ==
                (el = this.constructor._registeredPropagators.get(eA))
                ? void 0
                : el();
            }),
            (BasicTracerProvider.prototype._getSpanExporter = function (eA) {
              var el;
              return null ==
                (el = this.constructor._registeredExporters.get(eA))
                ? void 0
                : el();
            }),
            (BasicTracerProvider.prototype._buildPropagatorFromEnv =
              function () {
                var eA = this,
                  el = Array.from(new Set((0, em.getEnv)().OTEL_PROPAGATORS)),
                  ec = el
                    .map(function (el) {
                      var ec = eA._getPropagator(el);
                      return (
                        ec ||
                          ed.diag.warn(
                            'Propagator "' +
                              el +
                              '" requested through environment variable is unavailable.',
                          ),
                        ec
                      );
                    })
                    .reduce(function (eA, el) {
                      return (el && eA.push(el), eA);
                    }, []);
                return 0 === ec.length
                  ? void 0
                  : 1 === el.length
                    ? ec[0]
                    : new eE.CompositePropagator({ propagators: ec });
              }),
            (BasicTracerProvider.prototype._buildExporterFromEnv = function () {
              var eA = (0, em.getEnv)().OTEL_TRACES_EXPORTER;
              if ("none" !== eA && "" !== eA) {
                var el = this._getSpanExporter(eA);
                return (
                  el ||
                    ed.diag.error(
                      'Exporter "' +
                        eA +
                        '" requested through environment variable is unavailable.',
                    ),
                  el
                );
              }
            }),
            (BasicTracerProvider._registeredPropagators = new Map([
              [
                "tracecontext",
                function () {
                  return new eC.W3CTraceContextPropagator();
                },
              ],
              [
                "baggage",
                function () {
                  return new ey.W3CBaggagePropagator();
                },
              ],
            ])),
            (BasicTracerProvider._registeredExporters = new Map()),
            BasicTracerProvider
          );
        })();
      },
      23258(eA, el, ec) {
        "use strict";
        (ec.r(el), ec.d(el, { trace: () => em }));
        var eu = ec(70647),
          ed = ec(8843),
          ep = ec(71664),
          eg = ec(88752),
          eh = ec(58583),
          ef = "trace",
          em = (function () {
            function TraceAPI() {
              ((this._proxyTracerProvider = new ed.ProxyTracerProvider()),
                (this.wrapSpanContext = ep.wrapSpanContext),
                (this.isSpanContextValid = ep.isSpanContextValid),
                (this.deleteSpan = eg.deleteSpan),
                (this.getSpan = eg.getSpan),
                (this.getActiveSpan = eg.getActiveSpan),
                (this.getSpanContext = eg.getSpanContext),
                (this.setSpan = eg.setSpan),
                (this.setSpanContext = eg.setSpanContext));
            }
            return (
              (TraceAPI.getInstance = function () {
                return (
                  this._instance || (this._instance = new TraceAPI()),
                  this._instance
                );
              }),
              (TraceAPI.prototype.setGlobalTracerProvider = function (eA) {
                var el = (0, eu.registerGlobal)(
                  ef,
                  this._proxyTracerProvider,
                  eh.DiagAPI.instance(),
                );
                return (el && this._proxyTracerProvider.setDelegate(eA), el);
              }),
              (TraceAPI.prototype.getTracerProvider = function () {
                return (0, eu.getGlobal)(ef) || this._proxyTracerProvider;
              }),
              (TraceAPI.prototype.getTracer = function (eA, el) {
                return this.getTracerProvider().getTracer(eA, el);
              }),
              (TraceAPI.prototype.disable = function () {
                ((0, eu.unregisterGlobal)(ef, eh.DiagAPI.instance()),
                  (this._proxyTracerProvider = new ed.ProxyTracerProvider()));
              }),
              TraceAPI
            );
          })().getInstance();
      },
      67006(eA, el, ec) {
        "use strict";
        (ec.r(el), ec.d(el, { propagation: () => ey }));
        var eu = ec(70647),
          ed = (function () {
            function NoopTextMapPropagator() {}
            return (
              (NoopTextMapPropagator.prototype.inject = function (eA, el) {}),
              (NoopTextMapPropagator.prototype.extract = function (eA, el) {
                return eA;
              }),
              (NoopTextMapPropagator.prototype.fields = function () {
                return [];
              }),
              NoopTextMapPropagator
            );
          })(),
          ep = ec(6322),
          eg = ec(57717),
          eh = (0, ec(98902).createContextKey)("OpenTelemetry Baggage Key");
        function getBaggage(eA) {
          return eA.getValue(eh) || void 0;
        }
        function getActiveBaggage() {
          return getBaggage(eg.ContextAPI.getInstance().active());
        }
        function setBaggage(eA, el) {
          return eA.setValue(eh, el);
        }
        function deleteBaggage(eA) {
          return eA.deleteValue(eh);
        }
        var ef = ec(20662),
          em = ec(58583),
          eE = "propagation",
          eC = new ed(),
          ey = (function () {
            function PropagationAPI() {
              ((this.createBaggage = ef.createBaggage),
                (this.getBaggage = getBaggage),
                (this.getActiveBaggage = getActiveBaggage),
                (this.setBaggage = setBaggage),
                (this.deleteBaggage = deleteBaggage));
            }
            return (
              (PropagationAPI.getInstance = function () {
                return (
                  this._instance || (this._instance = new PropagationAPI()),
                  this._instance
                );
              }),
              (PropagationAPI.prototype.setGlobalPropagator = function (eA) {
                return (0, eu.registerGlobal)(eE, eA, em.DiagAPI.instance());
              }),
              (PropagationAPI.prototype.inject = function (eA, el, ec) {
                return (
                  void 0 === ec && (ec = ep.defaultTextMapSetter),
                  this._getGlobalPropagator().inject(eA, el, ec)
                );
              }),
              (PropagationAPI.prototype.extract = function (eA, el, ec) {
                return (
                  void 0 === ec && (ec = ep.defaultTextMapGetter),
                  this._getGlobalPropagator().extract(eA, el, ec)
                );
              }),
              (PropagationAPI.prototype.fields = function () {
                return this._getGlobalPropagator().fields();
              }),
              (PropagationAPI.prototype.disable = function () {
                (0, eu.unregisterGlobal)(eE, em.DiagAPI.instance());
              }),
              (PropagationAPI.prototype._getGlobalPropagator = function () {
                return (0, eu.getGlobal)(eE) || eC;
              }),
              PropagationAPI
            );
          })().getInstance();
      },
      22532(eA, el, ec) {
        "use strict";
        (ec.r(el), ec.d(el, { CompositePropagator: () => ed }));
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
          ed = (function () {
            function CompositePropagator(eA) {
              var el;
              (void 0 === eA && (eA = {}),
                (this._propagators = null != (el = eA.propagators) ? el : []),
                (this._fields = Array.from(
                  new Set(
                    this._propagators
                      .map(function (eA) {
                        return "function" == typeof eA.fields
                          ? eA.fields()
                          : [];
                      })
                      .reduce(function (eA, el) {
                        return eA.concat(el);
                      }, []),
                  ),
                )));
            }
            return (
              (CompositePropagator.prototype.inject = function (eA, el, ec) {
                var ed, ep;
                try {
                  for (
                    var eg = __values(this._propagators), eh = eg.next();
                    !eh.done;
                    eh = eg.next()
                  ) {
                    var ef = eh.value;
                    try {
                      ef.inject(eA, el, ec);
                    } catch (eA) {
                      eu.diag.warn(
                        "Failed to inject with " +
                          ef.constructor.name +
                          ". Err: " +
                          eA.message,
                      );
                    }
                  }
                } catch (eA) {
                  ed = { error: eA };
                } finally {
                  try {
                    eh && !eh.done && (ep = eg.return) && ep.call(eg);
                  } finally {
                    if (ed) throw ed.error;
                  }
                }
              }),
              (CompositePropagator.prototype.extract = function (eA, el, ec) {
                return this._propagators.reduce(function (eA, ed) {
                  try {
                    return ed.extract(eA, el, ec);
                  } catch (eA) {
                    eu.diag.warn(
                      "Failed to extract with " +
                        ed.constructor.name +
                        ". Err: " +
                        eA.message,
                    );
                  }
                  return eA;
                }, eA);
              }),
              (CompositePropagator.prototype.fields = function () {
                return this._fields.slice();
              }),
              CompositePropagator
            );
          })();
      },
      21507(eA, el, ec) {
        "use strict";
        (ec.r(el),
          ec.d(el, {
            parseTraceParent: () => parseTraceParent,
            TRACE_PARENT_HEADER: () => eI,
            TRACE_STATE_HEADER: () => ev,
            W3CTraceContextPropagator: () => eD,
          }));
        var eu = ec(23258),
          ed = ec(71664),
          ep = ec(14138),
          eg = ec(65890),
          eh = "[_0-9a-z-*/]",
          ef = RegExp(
            "^(?:[a-z]" +
              eh +
              "{0,255}|" +
              ("[a-z0-9]" + eh + "{0,240}@[a-z]" + eh) +
              "{0,13})$",
          ),
          em = /^[ -~]{0,255}[!-~]$/,
          eE = /,|=/;
        function validateKey(eA) {
          return ef.test(eA);
        }
        function validateValue(eA) {
          return em.test(eA) && !eE.test(eA);
        }
        var eC = 32,
          ey = 512,
          ew = ",",
          eB = "=",
          e_ = (function () {
            function TraceState(eA) {
              ((this._internalState = new Map()), eA && this._parse(eA));
            }
            return (
              (TraceState.prototype.set = function (eA, el) {
                var ec = this._clone();
                return (
                  ec._internalState.has(eA) && ec._internalState.delete(eA),
                  ec._internalState.set(eA, el),
                  ec
                );
              }),
              (TraceState.prototype.unset = function (eA) {
                var el = this._clone();
                return (el._internalState.delete(eA), el);
              }),
              (TraceState.prototype.get = function (eA) {
                return this._internalState.get(eA);
              }),
              (TraceState.prototype.serialize = function () {
                var eA = this;
                return this._keys()
                  .reduce(function (el, ec) {
                    return (el.push(ec + eB + eA.get(ec)), el);
                  }, [])
                  .join(ew);
              }),
              (TraceState.prototype._parse = function (eA) {
                !(eA.length > ey) &&
                  ((this._internalState = eA
                    .split(ew)
                    .reverse()
                    .reduce(function (eA, el) {
                      var ec = el.trim(),
                        eu = ec.indexOf(eB);
                      if (-1 !== eu) {
                        var ed = ec.slice(0, eu),
                          ep = ec.slice(eu + 1, el.length);
                        validateKey(ed) && validateValue(ep) && eA.set(ed, ep);
                      }
                      return eA;
                    }, new Map())),
                  this._internalState.size > eC &&
                    (this._internalState = new Map(
                      Array.from(this._internalState.entries())
                        .reverse()
                        .slice(0, eC),
                    )));
              }),
              (TraceState.prototype._keys = function () {
                return Array.from(this._internalState.keys()).reverse();
              }),
              (TraceState.prototype._clone = function () {
                var eA = new TraceState();
                return ((eA._internalState = new Map(this._internalState)), eA);
              }),
              TraceState
            );
          })(),
          eI = "traceparent",
          ev = "tracestate",
          eS = "00",
          eQ = RegExp(
            "^\\s?((?!ff)[\\da-f]{2})-((?![0]{32})[\\da-f]{32})-((?![0]{16})[\\da-f]{16})-([\\da-f]{2})(-.*)?\\s?$",
          );
        function parseTraceParent(eA) {
          var el = eQ.exec(eA);
          return !el || ("00" === el[1] && el[5])
            ? null
            : {
                traceId: el[2],
                spanId: el[3],
                traceFlags: parseInt(el[4], 16),
              };
        }
        var eD = (function () {
          function W3CTraceContextPropagator() {}
          return (
            (W3CTraceContextPropagator.prototype.inject = function (
              eA,
              el,
              ec,
            ) {
              var eh = eu.trace.getSpanContext(eA);
              if (
                !(!eh || (0, eg.isTracingSuppressed)(eA)) &&
                (0, ed.isSpanContextValid)(eh)
              ) {
                var ef =
                  eS +
                  "-" +
                  eh.traceId +
                  "-" +
                  eh.spanId +
                  "-0" +
                  Number(eh.traceFlags || ep.TraceFlags.NONE).toString(16);
                (ec.set(el, eI, ef),
                  eh.traceState && ec.set(el, ev, eh.traceState.serialize()));
              }
            }),
            (W3CTraceContextPropagator.prototype.extract = function (
              eA,
              el,
              ec,
            ) {
              var ed = ec.get(el, eI);
              if (!ed) return eA;
              var ep = Array.isArray(ed) ? ed[0] : ed;
              if ("string" != typeof ep) return eA;
              var eg = parseTraceParent(ep);
              if (!eg) return eA;
              eg.isRemote = !0;
              var eh = ec.get(el, ev);
              if (eh) {
                var ef = Array.isArray(eh) ? eh.join(",") : eh;
                eg.traceState = new e_("string" == typeof ef ? ef : void 0);
              }
              return eu.trace.setSpanContext(eA, eg);
            }),
            (W3CTraceContextPropagator.prototype.fields = function () {
              return [eI, ev];
            }),
            W3CTraceContextPropagator
          );
        })();
      },
      48698(eA, el, ec) {
        "use strict";
        (ec.r(el), ec.d(el, { W3CBaggagePropagator: () => eh }));
        var eu = ec(67006),
          ed = ec(65890),
          ep = ec(3250),
          eg = ec(44874),
          eh = (function () {
            function W3CBaggagePropagator() {}
            return (
              (W3CBaggagePropagator.prototype.inject = function (eA, el, ec) {
                var eh = eu.propagation.getBaggage(eA);
                if (!(!eh || (0, ed.isTracingSuppressed)(eA))) {
                  var ef = (0, eg.getKeyPairs)(eh)
                      .filter(function (eA) {
                        return eA.length <= ep.BAGGAGE_MAX_PER_NAME_VALUE_PAIRS;
                      })
                      .slice(0, ep.BAGGAGE_MAX_NAME_VALUE_PAIRS),
                    em = (0, eg.serializeKeyPairs)(ef);
                  em.length > 0 && ec.set(el, ep.BAGGAGE_HEADER, em);
                }
              }),
              (W3CBaggagePropagator.prototype.extract = function (eA, el, ec) {
                var ed = ec.get(el, ep.BAGGAGE_HEADER),
                  eh = Array.isArray(ed)
                    ? ed.join(ep.BAGGAGE_ITEMS_SEPARATOR)
                    : ed;
                if (!eh) return eA;
                var ef = {};
                return 0 === eh.length ||
                  (eh.split(ep.BAGGAGE_ITEMS_SEPARATOR).forEach(function (eA) {
                    var el = (0, eg.parsePairKeyValue)(eA);
                    if (el) {
                      var ec = { value: el.value };
                      (el.metadata && (ec.metadata = el.metadata),
                        (ef[el.key] = ec));
                    }
                  }),
                  0 === Object.entries(ef).length)
                  ? eA
                  : eu.propagation.setBaggage(
                      eA,
                      eu.propagation.createBaggage(ef),
                    );
              }),
              (W3CBaggagePropagator.prototype.fields = function () {
                return [ep.BAGGAGE_HEADER];
              }),
              W3CBaggagePropagator
            );
          })();
      },
      90654(eA, el, ec) {
        "use strict";
        (ec.r(el), ec.d(el, { Tracer: () => e_ }));
        var eu = ec(33835),
          ed = ec(23258),
          ep = ec(2339),
          eg = ec(67177),
          eh = ec(51244),
          ef = ec(22951),
          em = ec(14138),
          eE = ec(65890),
          eC = ec(95497),
          ey = ec(30599),
          ew = ec(86283),
          eB = ec(72711),
          e_ = (function () {
            function Tracer(eA, el, ec) {
              this._tracerProvider = ec;
              var eu = (0, ew.mergeConfig)(el);
              ((this._sampler = eu.sampler),
                (this._generalLimits = eu.generalLimits),
                (this._spanLimits = eu.spanLimits),
                (this._idGenerator =
                  el.idGenerator || new eB.RandomIdGenerator()),
                (this.resource = ec.resource),
                (this.instrumentationLibrary = eA));
            }
            return (
              (Tracer.prototype.startSpan = function (eA, el, ec) {
                (void 0 === el && (el = {}),
                  void 0 === ec && (ec = eu.context.active()),
                  el.root && (ec = ed.trace.deleteSpan(ec)));
                var ew,
                  eB,
                  e_,
                  eI,
                  ev,
                  eS,
                  eQ = ed.trace.getSpan(ec);
                if ((0, eE.isTracingSuppressed)(ec)) {
                  ep.diag.debug(
                    "Instrumentation suppressed, returning Noop Span",
                  );
                  var eD = ed.trace.wrapSpanContext(eg.INVALID_SPAN_CONTEXT);
                  return eD;
                }
                var eT = null == eQ ? void 0 : eQ.spanContext(),
                  eR = this._idGenerator.generateSpanId();
                eT && ed.trace.isSpanContextValid(eT)
                  ? ((eI = eT.traceId), (ev = eT.traceState), (eS = eT.spanId))
                  : (eI = this._idGenerator.generateTraceId());
                var ek = null != (ew = el.kind) ? ew : eh.SpanKind.INTERNAL,
                  eM = (null != (eB = el.links) ? eB : []).map(function (eA) {
                    return {
                      context: eA.context,
                      attributes: (0, eC.sanitizeAttributes)(eA.attributes),
                    };
                  }),
                  ex = (0, eC.sanitizeAttributes)(el.attributes),
                  eO = this._sampler.shouldSample(ec, eI, eA, ek, ex, eM);
                ev = null != (e_ = eO.traceState) ? e_ : ev;
                var eN = {
                  traceId: eI,
                  spanId: eR,
                  traceFlags:
                    eO.decision === ef.SamplingDecision.RECORD_AND_SAMPLED
                      ? em.TraceFlags.SAMPLED
                      : em.TraceFlags.NONE,
                  traceState: ev,
                };
                if (eO.decision === ef.SamplingDecision.NOT_RECORD) {
                  ep.diag.debug(
                    "Recording is off, propagating context in a non-recording span",
                  );
                  var eD = ed.trace.wrapSpanContext(eN);
                  return eD;
                }
                var eP = (0, eC.sanitizeAttributes)(
                  Object.assign(ex, eO.attributes),
                );
                return new ey.Span(
                  this,
                  ec,
                  eA,
                  eN,
                  ek,
                  eS,
                  eM,
                  el.startTime,
                  void 0,
                  eP,
                );
              }),
              (Tracer.prototype.startActiveSpan = function (eA, el, ec, ep) {
                if (!(arguments.length < 2)) {
                  2 == arguments.length
                    ? (ef = el)
                    : 3 == arguments.length
                      ? ((eg = el), (ef = ec))
                      : ((eg = el), (eh = ec), (ef = ep));
                  var eg,
                    eh,
                    ef,
                    em = null != eh ? eh : eu.context.active(),
                    eE = this.startSpan(eA, eg, em),
                    eC = ed.trace.setSpan(em, eE);
                  return eu.context.with(eC, ef, void 0, eE);
                }
              }),
              (Tracer.prototype.getGeneralLimits = function () {
                return this._generalLimits;
              }),
              (Tracer.prototype.getSpanLimits = function () {
                return this._spanLimits;
              }),
              (Tracer.prototype.getActiveSpanProcessor = function () {
                return this._tracerProvider.getActiveSpanProcessor();
              }),
              Tracer
            );
          })();
      },
      13421(eA, el, ec) {
        "use strict";
        (ec.r(el),
          ec.d(el, {
            buildSamplerFromEnv: () => buildSamplerFromEnv,
            loadDefaultConfig: () => loadDefaultConfig,
          }));
        var eu = ec(2339),
          ed = ec(6023),
          ep = ec(7e4),
          eg = ec(69700),
          eh = ec(72544),
          ef = ec(62207),
          em = ec(84992),
          eE = ed.TracesSamplerValues.AlwaysOn,
          eC = 1;
        function loadDefaultConfig() {
          var eA = (0, ep.getEnv)();
          return {
            sampler: buildSamplerFromEnv(eA),
            forceFlushTimeoutMillis: 3e4,
            generalLimits: {
              attributeValueLengthLimit: eA.OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT,
              attributeCountLimit: eA.OTEL_ATTRIBUTE_COUNT_LIMIT,
            },
            spanLimits: {
              attributeValueLengthLimit:
                eA.OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT,
              attributeCountLimit: eA.OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT,
              linkCountLimit: eA.OTEL_SPAN_LINK_COUNT_LIMIT,
              eventCountLimit: eA.OTEL_SPAN_EVENT_COUNT_LIMIT,
              attributePerEventCountLimit:
                eA.OTEL_SPAN_ATTRIBUTE_PER_EVENT_COUNT_LIMIT,
              attributePerLinkCountLimit:
                eA.OTEL_SPAN_ATTRIBUTE_PER_LINK_COUNT_LIMIT,
            },
            mergeResourceWithDefaults: !0,
          };
        }
        function buildSamplerFromEnv(eA) {
          switch (
            (void 0 === eA && (eA = (0, ep.getEnv)()), eA.OTEL_TRACES_SAMPLER)
          ) {
            case ed.TracesSamplerValues.AlwaysOn:
              return new eh.AlwaysOnSampler();
            case ed.TracesSamplerValues.AlwaysOff:
              return new eg.AlwaysOffSampler();
            case ed.TracesSamplerValues.ParentBasedAlwaysOn:
              return new ef.ParentBasedSampler({
                root: new eh.AlwaysOnSampler(),
              });
            case ed.TracesSamplerValues.ParentBasedAlwaysOff:
              return new ef.ParentBasedSampler({
                root: new eg.AlwaysOffSampler(),
              });
            case ed.TracesSamplerValues.TraceIdRatio:
              return new em.TraceIdRatioBasedSampler(
                getSamplerProbabilityFromEnv(eA),
              );
            case ed.TracesSamplerValues.ParentBasedTraceIdRatio:
              return new ef.ParentBasedSampler({
                root: new em.TraceIdRatioBasedSampler(
                  getSamplerProbabilityFromEnv(eA),
                ),
              });
            default:
              return (
                eu.diag.error(
                  'OTEL_TRACES_SAMPLER value "' +
                    eA.OTEL_TRACES_SAMPLER +
                    " invalid, defaulting to " +
                    eE +
                    '".',
                ),
                new eh.AlwaysOnSampler()
              );
          }
        }
        function getSamplerProbabilityFromEnv(eA) {
          if (
            void 0 === eA.OTEL_TRACES_SAMPLER_ARG ||
            "" === eA.OTEL_TRACES_SAMPLER_ARG
          )
            return (
              eu.diag.error(
                "OTEL_TRACES_SAMPLER_ARG is blank, defaulting to " + eC + ".",
              ),
              eC
            );
          var el = Number(eA.OTEL_TRACES_SAMPLER_ARG);
          return isNaN(el)
            ? (eu.diag.error(
                "OTEL_TRACES_SAMPLER_ARG=" +
                  eA.OTEL_TRACES_SAMPLER_ARG +
                  " was given, but it is invalid, defaulting to " +
                  eC +
                  ".",
              ),
              eC)
            : el < 0 || el > 1
              ? (eu.diag.error(
                  "OTEL_TRACES_SAMPLER_ARG=" +
                    eA.OTEL_TRACES_SAMPLER_ARG +
                    " was given, but it is out of range ([0..1]), defaulting to " +
                    eC +
                    ".",
                ),
                eC)
              : el;
        }
      },
      84762(eA, el, ec) {
        "use strict";
        (ec.r(el), ec.d(el, { NoopSpanProcessor: () => eu }));
        var eu = (function () {
          function NoopSpanProcessor() {}
          return (
            (NoopSpanProcessor.prototype.onStart = function (eA, el) {}),
            (NoopSpanProcessor.prototype.onEnd = function (eA) {}),
            (NoopSpanProcessor.prototype.shutdown = function () {
              return Promise.resolve();
            }),
            (NoopSpanProcessor.prototype.forceFlush = function () {
              return Promise.resolve();
            }),
            NoopSpanProcessor
          );
        })();
      },
      86283(eA, el, ec) {
        "use strict";
        (ec.r(el),
          ec.d(el, {
            mergeConfig: () => mergeConfig,
            reconfigureLimits: () => reconfigureLimits,
          }));
        var eu = ec(13421),
          ed = ec(7e4),
          ep = ec(55733);
        function mergeConfig(eA) {
          var el = { sampler: (0, eu.buildSamplerFromEnv)() },
            ec = (0, eu.loadDefaultConfig)(),
            ed = Object.assign({}, ec, el, eA);
          return (
            (ed.generalLimits = Object.assign(
              {},
              ec.generalLimits,
              eA.generalLimits || {},
            )),
            (ed.spanLimits = Object.assign(
              {},
              ec.spanLimits,
              eA.spanLimits || {},
            )),
            ed
          );
        }
        function reconfigureLimits(eA) {
          var el,
            ec,
            eu,
            eg,
            eh,
            ef,
            em,
            eE,
            eC,
            ey,
            ew,
            eB,
            e_ = Object.assign({}, eA.spanLimits),
            eI = (0, ed.getEnvWithoutDefaults)();
          return (
            (e_.attributeCountLimit =
              null !=
              (ef =
                null !=
                (eh =
                  null !=
                  (eg =
                    null !=
                    (ec =
                      null == (el = eA.spanLimits)
                        ? void 0
                        : el.attributeCountLimit)
                      ? ec
                      : null == (eu = eA.generalLimits)
                        ? void 0
                        : eu.attributeCountLimit)
                    ? eg
                    : eI.OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT)
                  ? eh
                  : eI.OTEL_ATTRIBUTE_COUNT_LIMIT)
                ? ef
                : ep.DEFAULT_ATTRIBUTE_COUNT_LIMIT),
            (e_.attributeValueLengthLimit =
              null !=
              (eB =
                null !=
                (ew =
                  null !=
                  (ey =
                    null !=
                    (eE =
                      null == (em = eA.spanLimits)
                        ? void 0
                        : em.attributeValueLengthLimit)
                      ? eE
                      : null == (eC = eA.generalLimits)
                        ? void 0
                        : eC.attributeValueLengthLimit)
                    ? ey
                    : eI.OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT)
                  ? ew
                  : eI.OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT)
                ? eB
                : ep.DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT),
            Object.assign({}, eA, { spanLimits: e_ })
          );
        }
      },
      8843(eA, el, ec) {
        "use strict";
        (ec.r(el), ec.d(el, { ProxyTracerProvider: () => eg }));
        var eu = ec(96006),
          ed = ec(77174),
          ep = new ((function () {
            function NoopTracerProvider() {}
            return (
              (NoopTracerProvider.prototype.getTracer = function (eA, el, ec) {
                return new ed.NoopTracer();
              }),
              NoopTracerProvider
            );
          })())(),
          eg = (function () {
            function ProxyTracerProvider() {}
            return (
              (ProxyTracerProvider.prototype.getTracer = function (eA, el, ec) {
                var ed;
                return null != (ed = this.getDelegateTracer(eA, el, ec))
                  ? ed
                  : new eu.ProxyTracer(this, eA, el, ec);
              }),
              (ProxyTracerProvider.prototype.getDelegate = function () {
                var eA;
                return null != (eA = this._delegate) ? eA : ep;
              }),
              (ProxyTracerProvider.prototype.setDelegate = function (eA) {
                this._delegate = eA;
              }),
              (ProxyTracerProvider.prototype.getDelegateTracer = function (
                eA,
                el,
                ec,
              ) {
                var eu;
                return null == (eu = this._delegate)
                  ? void 0
                  : eu.getTracer(eA, el, ec);
              }),
              ProxyTracerProvider
            );
          })();
      },
      6322(eA, el, ec) {
        "use strict";
        (ec.r(el),
          ec.d(el, {
            defaultTextMapGetter: () => eu,
            defaultTextMapSetter: () => ed,
          }));
        var eu = {
            get: function (eA, el) {
              if (null != eA) return eA[el];
            },
            keys: function (eA) {
              return null == eA ? [] : Object.keys(eA);
            },
          },
          ed = {
            set: function (eA, el, ec) {
              null != eA && (eA[el] = ec);
            },
          };
      },
      51244(eA, el, ec) {
        "use strict";
        var eu;
        (ec.r(el),
          ec.d(el, { SpanKind: () => eu }),
          (function (eA) {
            ((eA[(eA.INTERNAL = 0)] = "INTERNAL"),
              (eA[(eA.SERVER = 1)] = "SERVER"),
              (eA[(eA.CLIENT = 2)] = "CLIENT"),
              (eA[(eA.PRODUCER = 3)] = "PRODUCER"),
              (eA[(eA.CONSUMER = 4)] = "CONSUMER"));
          })(eu || (eu = {})));
      },
      22951(eA, el, ec) {
        "use strict";
        var eu;
        (ec.r(el),
          ec.d(el, { SamplingDecision: () => eu }),
          (function (eA) {
            ((eA[(eA.NOT_RECORD = 0)] = "NOT_RECORD"),
              (eA[(eA.RECORD = 1)] = "RECORD"),
              (eA[(eA.RECORD_AND_SAMPLED = 2)] = "RECORD_AND_SAMPLED"));
          })(eu || (eu = {})));
      },
      30599(eA, el, ec) {
        "use strict";
        (ec.r(el), ec.d(el, { Span: () => ey }));
        var eu = ec(45185),
          ed = ec(2339),
          ep = ec(32047),
          eg = ec(41437),
          eh = ec(95497),
          ef = (ec(92321), "exception.type"),
          em = "exception.message",
          eE = "exception.stacktrace",
          eC = "exception",
          __assign = function () {
            return (__assign =
              Object.assign ||
              function (eA) {
                for (var el, ec = 1, eu = arguments.length; ec < eu; ec++)
                  for (var ed in (el = arguments[ec]))
                    Object.prototype.hasOwnProperty.call(el, ed) &&
                      (eA[ed] = el[ed]);
                return eA;
              }).apply(this, arguments);
          },
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
          },
          __spreadArray = function (eA, el, ec) {
            if (ec || 2 == arguments.length)
              for (var eu, ed = 0, ep = el.length; ed < ep; ed++)
                (!eu && ed in el) ||
                  (eu || (eu = Array.prototype.slice.call(el, 0, ed)),
                  (eu[ed] = el[ed]));
            return eA.concat(eu || Array.prototype.slice.call(el));
          },
          ey = (function () {
            function Span(eA, el, ec, ed, eh, ef, em, eE, eC, ey) {
              (void 0 === em && (em = []),
                (this.attributes = {}),
                (this.links = []),
                (this.events = []),
                (this._droppedAttributesCount = 0),
                (this._droppedEventsCount = 0),
                (this._droppedLinksCount = 0),
                (this.status = { code: eu.SpanStatusCode.UNSET }),
                (this.endTime = [0, 0]),
                (this._ended = !1),
                (this._duration = [-1, -1]),
                (this.name = ec),
                (this._spanContext = ed),
                (this.parentSpanId = ef),
                (this.kind = eh),
                (this.links = em));
              var ew = Date.now();
              ((this._performanceStartTime = ep.otperformance.now()),
                (this._performanceOffset =
                  ew - (this._performanceStartTime + (0, eg.getTimeOrigin)())),
                (this._startTimeProvided = null != eE),
                (this.startTime = this._getTime(null != eE ? eE : ew)),
                (this.resource = eA.resource),
                (this.instrumentationLibrary = eA.instrumentationLibrary),
                (this._spanLimits = eA.getSpanLimits()),
                (this._attributeValueLengthLimit =
                  this._spanLimits.attributeValueLengthLimit || 0),
                null != ey && this.setAttributes(ey),
                (this._spanProcessor = eA.getActiveSpanProcessor()),
                this._spanProcessor.onStart(this, el));
            }
            return (
              (Span.prototype.spanContext = function () {
                return this._spanContext;
              }),
              (Span.prototype.setAttribute = function (eA, el) {
                return (
                  null == el ||
                    this._isSpanEnded() ||
                    (0 === eA.length
                      ? ed.diag.warn("Invalid attribute key: " + eA)
                      : (0, eh.isAttributeValue)(el)
                        ? Object.keys(this.attributes).length >=
                            this._spanLimits.attributeCountLimit &&
                          !Object.prototype.hasOwnProperty.call(
                            this.attributes,
                            eA,
                          )
                          ? this._droppedAttributesCount++
                          : (this.attributes[eA] = this._truncateToSize(el))
                        : ed.diag.warn(
                            "Invalid attribute value set for key: " + eA,
                          )),
                  this
                );
              }),
              (Span.prototype.setAttributes = function (eA) {
                var el, ec;
                try {
                  for (
                    var eu = __values(Object.entries(eA)), ed = eu.next();
                    !ed.done;
                    ed = eu.next()
                  ) {
                    var ep = __read(ed.value, 2),
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
              (Span.prototype.addEvent = function (eA, el, ec) {
                if (this._isSpanEnded()) return this;
                if (0 === this._spanLimits.eventCountLimit)
                  return (
                    ed.diag.warn("No events allowed."),
                    this._droppedEventsCount++,
                    this
                  );
                (this.events.length >= this._spanLimits.eventCountLimit &&
                  (0 === this._droppedEventsCount &&
                    ed.diag.debug("Dropping extra events."),
                  this.events.shift(),
                  this._droppedEventsCount++),
                  (0, eg.isTimeInput)(el) &&
                    ((0, eg.isTimeInput)(ec) || (ec = el), (el = void 0)));
                var eu = (0, eh.sanitizeAttributes)(el);
                return (
                  this.events.push({
                    name: eA,
                    attributes: eu,
                    time: this._getTime(ec),
                    droppedAttributesCount: 0,
                  }),
                  this
                );
              }),
              (Span.prototype.addLink = function (eA) {
                return (this.links.push(eA), this);
              }),
              (Span.prototype.addLinks = function (eA) {
                var el;
                return (
                  (el = this.links).push.apply(
                    el,
                    __spreadArray([], __read(eA), !1),
                  ),
                  this
                );
              }),
              (Span.prototype.setStatus = function (eA) {
                return (
                  this._isSpanEnded() ||
                    ((this.status = __assign({}, eA)),
                    null != this.status.message &&
                      "string" != typeof eA.message &&
                      (ed.diag.warn(
                        "Dropping invalid status.message of type '" +
                          typeof eA.message +
                          "', expected 'string'",
                      ),
                      delete this.status.message)),
                  this
                );
              }),
              (Span.prototype.updateName = function (eA) {
                return (this._isSpanEnded() || (this.name = eA), this);
              }),
              (Span.prototype.end = function (eA) {
                this._isSpanEnded()
                  ? ed.diag.error(
                      this.name +
                        " " +
                        this._spanContext.traceId +
                        "-" +
                        this._spanContext.spanId +
                        " - You can only call end() on a span once.",
                    )
                  : ((this._ended = !0),
                    (this.endTime = this._getTime(eA)),
                    (this._duration = (0, eg.hrTimeDuration)(
                      this.startTime,
                      this.endTime,
                    )),
                    this._duration[0] < 0 &&
                      (ed.diag.warn(
                        "Inconsistent start and end time, startTime > endTime. Setting span duration to 0ms.",
                        this.startTime,
                        this.endTime,
                      ),
                      (this.endTime = this.startTime.slice()),
                      (this._duration = [0, 0])),
                    this._droppedEventsCount > 0 &&
                      ed.diag.warn(
                        "Dropped " +
                          this._droppedEventsCount +
                          " events because eventCountLimit reached",
                      ),
                    this._spanProcessor.onEnd(this));
              }),
              (Span.prototype._getTime = function (eA) {
                if ("number" == typeof eA && eA <= ep.otperformance.now())
                  return (0, eg.hrTime)(eA + this._performanceOffset);
                if ("number" == typeof eA) return (0, eg.millisToHrTime)(eA);
                if (eA instanceof Date)
                  return (0, eg.millisToHrTime)(eA.getTime());
                if ((0, eg.isTimeInputHrTime)(eA)) return eA;
                if (this._startTimeProvided)
                  return (0, eg.millisToHrTime)(Date.now());
                var el = ep.otperformance.now() - this._performanceStartTime;
                return (0, eg.addHrTimes)(
                  this.startTime,
                  (0, eg.millisToHrTime)(el),
                );
              }),
              (Span.prototype.isRecording = function () {
                return !1 === this._ended;
              }),
              (Span.prototype.recordException = function (eA, el) {
                var ec = {};
                ("string" == typeof eA
                  ? (ec[em] = eA)
                  : eA &&
                    (eA.code
                      ? (ec[ef] = eA.code.toString())
                      : eA.name && (ec[ef] = eA.name),
                    eA.message && (ec[em] = eA.message),
                    eA.stack && (ec[eE] = eA.stack)),
                  ec[ef] || ec[em]
                    ? this.addEvent(eC, ec, el)
                    : ed.diag.warn("Failed to record an exception " + eA));
              }),
              Object.defineProperty(Span.prototype, "duration", {
                get: function () {
                  return this._duration;
                },
                enumerable: !1,
                configurable: !0,
              }),
              Object.defineProperty(Span.prototype, "ended", {
                get: function () {
                  return this._ended;
                },
                enumerable: !1,
                configurable: !0,
              }),
              Object.defineProperty(Span.prototype, "droppedAttributesCount", {
                get: function () {
                  return this._droppedAttributesCount;
                },
                enumerable: !1,
                configurable: !0,
              }),
              Object.defineProperty(Span.prototype, "droppedEventsCount", {
                get: function () {
                  return this._droppedEventsCount;
                },
                enumerable: !1,
                configurable: !0,
              }),
              Object.defineProperty(Span.prototype, "droppedLinksCount", {
                get: function () {
                  return this._droppedLinksCount;
                },
                enumerable: !1,
                configurable: !0,
              }),
              (Span.prototype._isSpanEnded = function () {
                return (
                  this._ended &&
                    ed.diag.warn(
                      "Can not execute the operation on ended Span {traceId: " +
                        this._spanContext.traceId +
                        ", spanId: " +
                        this._spanContext.spanId +
                        "}",
                    ),
                  this._ended
                );
              }),
              (Span.prototype._truncateToLimitUtil = function (eA, el) {
                return eA.length <= el ? eA : eA.substring(0, el);
              }),
              (Span.prototype._truncateToSize = function (eA) {
                var el = this,
                  ec = this._attributeValueLengthLimit;
                return ec <= 0
                  ? (ed.diag.warn(
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
              Span
            );
          })();
      },
      72711(eA, el, ec) {
        "use strict";
        (ec.r(el), ec.d(el, { RandomIdGenerator: () => ep }));
        var eu = 8,
          ed = 16,
          ep = (function () {
            return function () {
              ((this.generateTraceId = getIdGenerator(ed)),
                (this.generateSpanId = getIdGenerator(eu)));
            };
          })(),
          eg = Buffer.allocUnsafe(ed);
        function getIdGenerator(eA) {
          return function () {
            for (var el = 0; el < eA / 4; el++)
              eg.writeUInt32BE((0x100000000 * Math.random()) >>> 0, 4 * el);
            for (var el = 0; el < eA; el++)
              if (eg[el] > 0) break;
              else el === eA - 1 && (eg[eA - 1] = 1);
            return eg.toString("hex", 0, eA);
          };
        }
      },
      96006(eA, el, ec) {
        "use strict";
        (ec.r(el), ec.d(el, { ProxyTracer: () => ed }));
        var eu = new (ec(77174).NoopTracer)(),
          ed = (function () {
            function ProxyTracer(eA, el, ec, eu) {
              ((this._provider = eA),
                (this.name = el),
                (this.version = ec),
                (this.options = eu));
            }
            return (
              (ProxyTracer.prototype.startSpan = function (eA, el, ec) {
                return this._getTracer().startSpan(eA, el, ec);
              }),
              (ProxyTracer.prototype.startActiveSpan = function (
                eA,
                el,
                ec,
                eu,
              ) {
                var ed = this._getTracer();
                return Reflect.apply(ed.startActiveSpan, ed, arguments);
              }),
              (ProxyTracer.prototype._getTracer = function () {
                if (this._delegate) return this._delegate;
                var eA = this._provider.getDelegateTracer(
                  this.name,
                  this.version,
                  this.options,
                );
                return eA ? ((this._delegate = eA), this._delegate) : eu;
              }),
              ProxyTracer
            );
          })();
      },
      77174(eA, el, ec) {
        "use strict";
        (ec.r(el), ec.d(el, { NoopTracer: () => ef }));
        var eu = ec(57717),
          ed = ec(88752),
          ep = ec(6461),
          eg = ec(71664),
          eh = eu.ContextAPI.getInstance(),
          ef = (function () {
            function NoopTracer() {}
            return (
              (NoopTracer.prototype.startSpan = function (eA, el, ec) {
                if (
                  (void 0 === ec && (ec = eh.active()),
                  null == el ? void 0 : el.root)
                )
                  return new ep.NonRecordingSpan();
                var eu = ec && (0, ed.getSpanContext)(ec);
                return isSpanContext(eu) && (0, eg.isSpanContextValid)(eu)
                  ? new ep.NonRecordingSpan(eu)
                  : new ep.NonRecordingSpan();
              }),
              (NoopTracer.prototype.startActiveSpan = function (
                eA,
                el,
                ec,
                eu,
              ) {
                if (!(arguments.length < 2)) {
                  2 == arguments.length
                    ? (ef = el)
                    : 3 == arguments.length
                      ? ((ep = el), (ef = ec))
                      : ((ep = el), (eg = ec), (ef = eu));
                  var ep,
                    eg,
                    ef,
                    em = null != eg ? eg : eh.active(),
                    eE = this.startSpan(eA, ep, em),
                    eC = (0, ed.setSpan)(em, eE);
                  return eh.with(eC, ef, void 0, eE);
                }
              }),
              NoopTracer
            );
          })();
        function isSpanContext(eA) {
          return (
            "object" == typeof eA &&
            "string" == typeof eA.spanId &&
            "string" == typeof eA.traceId &&
            "number" == typeof eA.traceFlags
          );
        }
      },
      45185(eA, el, ec) {
        "use strict";
        var eu;
        (ec.r(el),
          ec.d(el, { SpanStatusCode: () => eu }),
          (function (eA) {
            ((eA[(eA.UNSET = 0)] = "UNSET"),
              (eA[(eA.OK = 1)] = "OK"),
              (eA[(eA.ERROR = 2)] = "ERROR"));
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

  return {
    get BasicTracerProvider() {
      return ec(84746).BasicTracerProvider;
    },
    trace: ec(23258).trace,
    propagation: ec(67006).propagation,
    getModule: ec,
  };
}

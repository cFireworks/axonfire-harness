// @ts-nocheck
// Complete original shared reader declaration and error/timer factories.
export const METRIC_READER_SHA256 =
  "4120898f1ded86ac545316721d216c827a325c2513a8fae4bcd8c8bbbf211afd";
export const METRIC_READER_REGIONS = [[7985327, 8000040]] as const;
export const METRIC_READER_MODULES = [
  [60002, 1002021, 1002656],
  [61549, 1009034, 1009144],
] as const;
export function createNativeMetricReader(runtime: any) {
  const factories = {
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

  const eZ = { diag: runtime.diag },
    tG = runtime.metrics.Aggregation,
    ep = runtime.metrics.AggregationTemporality,
    FlatMap = runtime.metrics.readerHelpers.FlatMap,
    callWithTimeout = runtime.metrics.readerHelpers.callWithTimeout,
    tn = runtime.metrics.readerHelpers.TimeoutError,
    e0 = { internal: runtime.internal },
    ez = runtime.exportResult,
    setInterval = runtime.setInterval ?? globalThis.setInterval,
    clearInterval = runtime.clearInterval ?? globalThis.clearInterval;
  var AE = ec(60002),
    AC = ec(61549),
    DEFAULT_AGGREGATION_SELECTOR = function (eA) {
      return tG.Default();
    },
    DEFAULT_AGGREGATION_TEMPORALITY_SELECTOR = function (eA) {
      return ep.CUMULATIVE;
    },
    MetricReader_awaiter = function (eA, el, ec, eu) {
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
    MetricReader_generator = function (eA, el) {
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
    MetricReader_read = function (eA, el) {
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
    MetricReader_spreadArray = function (eA, el, ec) {
      if (ec || 2 == arguments.length)
        for (var eu, ed = 0, ep = el.length; ed < ep; ed++)
          (!eu && ed in el) ||
            (eu || (eu = Array.prototype.slice.call(el, 0, ed)),
            (eu[ed] = el[ed]));
      return eA.concat(eu || Array.prototype.slice.call(el));
    },
    Ay = (function () {
      function MetricReader(eA) {
        var el, ec, eu;
        ((this._shutdown = !1),
          (this._aggregationSelector =
            null != (el = null == eA ? void 0 : eA.aggregationSelector)
              ? el
              : DEFAULT_AGGREGATION_SELECTOR),
          (this._aggregationTemporalitySelector =
            null !=
            (ec = null == eA ? void 0 : eA.aggregationTemporalitySelector)
              ? ec
              : DEFAULT_AGGREGATION_TEMPORALITY_SELECTOR),
          (this._metricProducers =
            null != (eu = null == eA ? void 0 : eA.metricProducers) ? eu : []),
          (this._cardinalitySelector =
            null == eA ? void 0 : eA.cardinalitySelector));
      }
      return (
        (MetricReader.prototype.setMetricProducer = function (eA) {
          if (this._sdkMetricProducer)
            throw Error(
              "MetricReader can not be bound to a MeterProvider again.",
            );
          ((this._sdkMetricProducer = eA), this.onInitialized());
        }),
        (MetricReader.prototype.selectAggregation = function (eA) {
          return this._aggregationSelector(eA);
        }),
        (MetricReader.prototype.selectAggregationTemporality = function (eA) {
          return this._aggregationTemporalitySelector(eA);
        }),
        (MetricReader.prototype.selectCardinalityLimit = function (eA) {
          return this._cardinalitySelector
            ? this._cardinalitySelector(eA)
            : 2e3;
        }),
        (MetricReader.prototype.onInitialized = function () {}),
        (MetricReader.prototype.collect = function (eA) {
          return MetricReader_awaiter(this, void 0, void 0, function () {
            var el, ec, eu, ed;
            return MetricReader_generator(this, function (ep) {
              switch (ep.label) {
                case 0:
                  if (void 0 === this._sdkMetricProducer)
                    throw Error(
                      "MetricReader is not bound to a MetricProducer",
                    );
                  if (this._shutdown) throw Error("MetricReader is shutdown");
                  return [
                    4,
                    Promise.all(
                      MetricReader_spreadArray(
                        [
                          this._sdkMetricProducer.collect({
                            timeoutMillis:
                              null == eA ? void 0 : eA.timeoutMillis,
                          }),
                        ],
                        MetricReader_read(
                          this._metricProducers.map(function (el) {
                            return el.collect({
                              timeoutMillis:
                                null == eA ? void 0 : eA.timeoutMillis,
                            });
                          }),
                        ),
                        !1,
                      ),
                    ),
                  ];
                case 1:
                  return (
                    (ec = (el = MetricReader_read.apply(void 0, [
                      ep.sent(),
                    ]))[0]),
                    (eu = el.slice(1)),
                    (ed = ec.errors.concat(
                      FlatMap(eu, function (eA) {
                        return eA.errors;
                      }),
                    )),
                    [
                      2,
                      {
                        resourceMetrics: {
                          resource: ec.resourceMetrics.resource,
                          scopeMetrics: ec.resourceMetrics.scopeMetrics.concat(
                            FlatMap(eu, function (eA) {
                              return eA.resourceMetrics.scopeMetrics;
                            }),
                          ),
                        },
                        errors: ed,
                      },
                    ]
                  );
              }
            });
          });
        }),
        (MetricReader.prototype.shutdown = function (eA) {
          return MetricReader_awaiter(this, void 0, void 0, function () {
            return MetricReader_generator(this, function (el) {
              switch (el.label) {
                case 0:
                  if (this._shutdown)
                    return (eZ.diag.error("Cannot call shutdown twice."), [2]);
                  if ((null == eA ? void 0 : eA.timeoutMillis) != null)
                    return [3, 2];
                  return [4, this.onShutdown()];
                case 1:
                  return (el.sent(), [3, 4]);
                case 2:
                  return [
                    4,
                    callWithTimeout(this.onShutdown(), eA.timeoutMillis),
                  ];
                case 3:
                  (el.sent(), (el.label = 4));
                case 4:
                  return ((this._shutdown = !0), [2]);
              }
            });
          });
        }),
        (MetricReader.prototype.forceFlush = function (eA) {
          return MetricReader_awaiter(this, void 0, void 0, function () {
            return MetricReader_generator(this, function (el) {
              switch (el.label) {
                case 0:
                  if (this._shutdown)
                    return (
                      eZ.diag.warn(
                        "Cannot forceFlush on already shutdown MetricReader.",
                      ),
                      [2]
                    );
                  if ((null == eA ? void 0 : eA.timeoutMillis) != null)
                    return [3, 2];
                  return [4, this.onForceFlush()];
                case 1:
                case 3:
                  return (el.sent(), [2]);
                case 2:
                  return [
                    4,
                    callWithTimeout(this.onForceFlush(), eA.timeoutMillis),
                  ];
              }
            });
          });
        }),
        MetricReader
      );
    })(),
    Aw = (function () {
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
    PeriodicExportingMetricReader_awaiter = function (eA, el, ec, eu) {
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
    PeriodicExportingMetricReader_generator = function (eA, el) {
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
    PeriodicExportingMetricReader_read = function (eA, el) {
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
    PeriodicExportingMetricReader_spreadArray = function (eA, el, ec) {
      if (ec || 2 == arguments.length)
        for (var eu, ed = 0, ep = el.length; ed < ep; ed++)
          (!eu && ed in el) ||
            (eu || (eu = Array.prototype.slice.call(el, 0, ed)),
            (eu[ed] = el[ed]));
      return eA.concat(eu || Array.prototype.slice.call(el));
    },
    AB = (function (eA) {
      function PeriodicExportingMetricReader(el) {
        var ec,
          eu,
          ed,
          ep,
          eg =
            eA.call(this, {
              aggregationSelector:
                null == (ec = el.exporter.selectAggregation)
                  ? void 0
                  : ec.bind(el.exporter),
              aggregationTemporalitySelector:
                null == (eu = el.exporter.selectAggregationTemporality)
                  ? void 0
                  : eu.bind(el.exporter),
              metricProducers: el.metricProducers,
            }) || this;
        if (void 0 !== el.exportIntervalMillis && el.exportIntervalMillis <= 0)
          throw Error("exportIntervalMillis must be greater than 0");
        if (void 0 !== el.exportTimeoutMillis && el.exportTimeoutMillis <= 0)
          throw Error("exportTimeoutMillis must be greater than 0");
        if (
          void 0 !== el.exportTimeoutMillis &&
          void 0 !== el.exportIntervalMillis &&
          el.exportIntervalMillis < el.exportTimeoutMillis
        )
          throw Error(
            "exportIntervalMillis must be greater than or equal to exportTimeoutMillis",
          );
        return (
          (eg._exportInterval =
            null != (ed = el.exportIntervalMillis) ? ed : 6e4),
          (eg._exportTimeout =
            null != (ep = el.exportTimeoutMillis) ? ep : 3e4),
          (eg._exporter = el.exporter),
          eg
        );
      }
      return (
        Aw(PeriodicExportingMetricReader, eA),
        (PeriodicExportingMetricReader.prototype._runOnce = function () {
          return PeriodicExportingMetricReader_awaiter(
            this,
            void 0,
            void 0,
            function () {
              var eA;
              return PeriodicExportingMetricReader_generator(
                this,
                function (el) {
                  switch (el.label) {
                    case 0:
                      return (
                        el.trys.push([0, 2, , 3]),
                        [4, callWithTimeout(this._doRun(), this._exportTimeout)]
                      );
                    case 1:
                      return (el.sent(), [3, 3]);
                    case 2:
                      if ((eA = el.sent()) instanceof tn)
                        return (
                          eZ.diag.error(
                            "Export took longer than %s milliseconds and timed out.",
                            this._exportTimeout,
                          ),
                          [2]
                        );
                      return ((0, AE.globalErrorHandler)(eA), [3, 3]);
                    case 3:
                      return [2];
                  }
                },
              );
            },
          );
        }),
        (PeriodicExportingMetricReader.prototype._doRun = function () {
          var eA, el;
          return PeriodicExportingMetricReader_awaiter(
            this,
            void 0,
            void 0,
            function () {
              var ec, eu, ed, ep, eg, eh;
              return PeriodicExportingMetricReader_generator(
                this,
                function (ef) {
                  switch (ef.label) {
                    case 0:
                      return [
                        4,
                        this.collect({ timeoutMillis: this._exportTimeout }),
                      ];
                    case 1:
                      if (
                        ((eu = (ec = ef.sent()).resourceMetrics),
                        (ed = ec.errors).length > 0 &&
                          (eh = eZ.diag).error.apply(
                            eh,
                            PeriodicExportingMetricReader_spreadArray(
                              [
                                "PeriodicExportingMetricReader: metrics collection errors",
                              ],
                              PeriodicExportingMetricReader_read(ed),
                              !1,
                            ),
                          ),
                        !eu.resource.asyncAttributesPending)
                      )
                        return [3, 5];
                      ef.label = 2;
                    case 2:
                      return (
                        ef.trys.push([2, 4, , 5]),
                        [
                          4,
                          null ==
                          (el = (eA = eu.resource).waitForAsyncAttributes)
                            ? void 0
                            : el.call(eA),
                        ]
                      );
                    case 3:
                      return (ef.sent(), [3, 5]);
                    case 4:
                      return (
                        (ep = ef.sent()),
                        eZ.diag.debug(
                          "Error while resolving async portion of resource: ",
                          ep,
                        ),
                        (0, AE.globalErrorHandler)(ep),
                        [3, 5]
                      );
                    case 5:
                      if (0 === eu.scopeMetrics.length) return [2];
                      return [4, e0.internal._export(this._exporter, eu)];
                    case 6:
                      if ((eg = ef.sent()).code !== ez.ExportResultCode.SUCCESS)
                        throw Error(
                          "PeriodicExportingMetricReader: metrics export failed (error " +
                            eg.error +
                            ")",
                        );
                      return [2];
                  }
                },
              );
            },
          );
        }),
        (PeriodicExportingMetricReader.prototype.onInitialized = function () {
          var eA = this;
          ((this._interval = setInterval(function () {
            eA._runOnce();
          }, this._exportInterval)),
            (0, AC.unrefTimer)(this._interval));
        }),
        (PeriodicExportingMetricReader.prototype.onForceFlush = function () {
          return PeriodicExportingMetricReader_awaiter(
            this,
            void 0,
            void 0,
            function () {
              return PeriodicExportingMetricReader_generator(
                this,
                function (eA) {
                  switch (eA.label) {
                    case 0:
                      return [4, this._runOnce()];
                    case 1:
                      return (eA.sent(), [4, this._exporter.forceFlush()]);
                    case 2:
                      return (eA.sent(), [2]);
                  }
                },
              );
            },
          );
        }),
        (PeriodicExportingMetricReader.prototype.onShutdown = function () {
          return PeriodicExportingMetricReader_awaiter(
            this,
            void 0,
            void 0,
            function () {
              return PeriodicExportingMetricReader_generator(
                this,
                function (eA) {
                  switch (eA.label) {
                    case 0:
                      return (
                        this._interval && clearInterval(this._interval),
                        [4, this.onForceFlush()]
                      );
                    case 1:
                      return (eA.sent(), [4, this._exporter.shutdown()]);
                    case 2:
                      return (eA.sent(), [2]);
                  }
                },
              );
            },
          );
        }),
        PeriodicExportingMetricReader
      );
    })(Ay),
    A_ = /[\^$\\.+?()[\]{}|]/g,
    AI = (function () {
      function PatternPredicate(eA) {
        "*" === eA
          ? ((this._matchAll = !0), (this._regexp = /.*/))
          : ((this._matchAll = !1),
            (this._regexp = new RegExp(PatternPredicate.escapePattern(eA))));
      }
      return (
        (PatternPredicate.prototype.match = function (eA) {
          return !!this._matchAll || this._regexp.test(eA);
        }),
        (PatternPredicate.escapePattern = function (eA) {
          return "^" + eA.replace(A_, "\\$&").replace("*", ".*") + "$";
        }),
        (PatternPredicate.hasWildcard = function (eA) {
          return eA.includes("*");
        }),
        PatternPredicate
      );
    })(),
    Av = (function () {
      function ExactPredicate(eA) {
        ((this._matchAll = void 0 === eA), (this._pattern = eA));
      }
      return (
        (ExactPredicate.prototype.match = function (eA) {
          return !!this._matchAll || eA === this._pattern;
        }),
        ExactPredicate
      );
    })(),
    AS = (function () {
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
    AQ = (function () {
      function AttributesProcessor() {}
      return (
        (AttributesProcessor.Noop = function () {
          return AR;
        }),
        AttributesProcessor
      );
    })(),
    AD = (function (eA) {
      function NoopAttributesProcessor() {
        return (null !== eA && eA.apply(this, arguments)) || this;
      }
      return (
        AS(NoopAttributesProcessor, eA),
        (NoopAttributesProcessor.prototype.process = function (eA, el) {
          return eA;
        }),
        NoopAttributesProcessor
      );
    })(AQ),
    AT = (function (eA) {
      function FilteringAttributesProcessor(el) {
        var ec = eA.call(this) || this;
        return ((ec._allowedAttributeNames = el), ec);
      }
      return (
        AS(FilteringAttributesProcessor, eA),
        (FilteringAttributesProcessor.prototype.process = function (eA, el) {
          var ec = this,
            eu = {};
          return (
            Object.keys(eA)
              .filter(function (eA) {
                return ec._allowedAttributeNames.includes(eA);
              })
              .forEach(function (el) {
                return (eu[el] = eA[el]);
              }),
            eu
          );
        }),
        FilteringAttributesProcessor
      );
    })(AQ),
    AR = new AD(),
    Ak = (function () {
      function InstrumentSelector(eA) {
        var el;
        ((this._nameFilter = new AI(
          null != (el = null == eA ? void 0 : eA.name) ? el : "*",
        )),
          (this._type = null == eA ? void 0 : eA.type),
          (this._unitFilter = new Av(null == eA ? void 0 : eA.unit)));
      }
      return (
        (InstrumentSelector.prototype.getType = function () {
          return this._type;
        }),
        (InstrumentSelector.prototype.getNameFilter = function () {
          return this._nameFilter;
        }),
        (InstrumentSelector.prototype.getUnitFilter = function () {
          return this._unitFilter;
        }),
        InstrumentSelector
      );
    })(),
    AM = (function () {
      function MeterSelector(eA) {
        ((this._nameFilter = new Av(null == eA ? void 0 : eA.name)),
          (this._versionFilter = new Av(null == eA ? void 0 : eA.version)),
          (this._schemaUrlFilter = new Av(null == eA ? void 0 : eA.schemaUrl)));
      }
      return (
        (MeterSelector.prototype.getNameFilter = function () {
          return this._nameFilter;
        }),
        (MeterSelector.prototype.getVersionFilter = function () {
          return this._versionFilter;
        }),
        (MeterSelector.prototype.getSchemaUrlFilter = function () {
          return this._schemaUrlFilter;
        }),
        MeterSelector
      );
    })();
  return {
    meterHelpers: { AI, AT, AM, AQ, Ak },
    MetricReader: Ay,
    PeriodicExportingMetricReader: AB,
    getModule: ec,
  };
}
